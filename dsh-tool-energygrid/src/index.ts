/**
 * DSH Smart Grid & Energy Management Plugin v0.1.0
 *
 * Comprehensive smart grid and energy management toolkit for DeepSeek Harness Agent.
 * Designed for grid operators, energy traders, renewable energy engineers,
 * battery system designers, and grid resilience planners.
 *
 * Features (v0.1.0):
 * 1. Grid Demand Forecaster       — Multi-horizon load forecasting with weather scenarios
 * 2. Renewable Integration        — Solar and wind grid integration optimization
 * 3. Energy Trading Strategy      — Day-ahead and real-time market trading optimization
 * 4. Battery Management Scheduler — Charge/discharge scheduling for grid services
 * 5. Carbon Capture Optimizer     — CCS system optimization for power plant compliance
 * 6. Power Quality Monitor        — Power quality analysis including harmonics and voltage
 * 7. Microgrid Islanding Control  — Microgrid islanding detection and transfer management
 * 8. Energy Storage Sizing        — Battery energy storage system sizing for grid needs
 *
 * @module dsh-tool-energygrid
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-energygrid'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = 'Disclaimer: This analysis is based on AI model inference and simulated data. It is for reference only and does not replace professional power system engineering, energy trading, or grid operations advice. Demand forecasts and trading strategies carry inherent uncertainty. Operational decisions should be validated by certified power system engineers.'

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

  static hashStr(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 -- Types & Interfaces ====================

// --- Tool 1: Grid Demand Forecaster ---
export interface GridDemandInput {
  historical_load_mw: number[]
  forecast_horizon_hours: number
  temperature_c: number[]
  humidity_pct: number[]
  grid_region: string
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  special_event?: string
}

export interface DemandForecast {
  hour: number
  forecast_mw: number
  peak_mw: number
  low_mw: number
  confidence_interval: [number, number]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
}

export interface GridDemandResult {
  region: string
  current_peak_mw: number
  forecast_horizon_hours: number
  forecasts: DemandForecast[]
  aggregated: {
    total_energy_mwh: number
    peak_demand_mw: number
    minimum_demand_mw: number
    load_factor_pct: number
  }
  recommendations: string[]
  grid_stress_assessment: string
}

// --- Tool 2: Renewable Integration Optimizer ---
export interface RenewableIntegrationInput {
  solar_capacity_mw: number
  wind_capacity_mw: number
  current_grid_load_mw: number
  grid_flexibility: 'low' | 'medium' | 'high'
  storage_mwh: number
  curtailment_pct: number
  interconnection_capacity_mw: number
}

export interface CurtailmentReduction {
  strategy: string
  reduction_pct: number
  cost_estimate_usd: number
  implementation_timeline: string
}

export interface RenewableIntegrationResult {
  renewable_penetration_pct: number
  effective_capacity_mw: number
  curtailment_forecast: number
  integration_score: number
  strategies: CurtailmentReduction[]
  storage_optimization: {
    recommended_storage_mwh: number
    charge_schedule: string
    discharge_schedule: string
    round_trip_efficiency: number
  }
  grid_stability_assessment: string
  recommendations: string[]
}

// --- Tool 3: Energy Trading Strategy ---
export interface EnergyTradingInput {
  market: string
  delivery_date: string
  current_portfolio_mwh: number
  forecast_demand_mwh: number
  price_forecast: number[]
  risk_appetite: 'conservative' | 'moderate' | 'agulative'
  carbon_price: number
  renewable_certificate_price: number
  regulation_requirement_pct: number
}

export interface TradeRecommendation {
  action: 'buy' | 'sell' | 'hold'
  volume_mwh: number
  price_target: number
  timing: string
  confidence: number
  rationale: string
}

export interface EnergyTradingResult {
  market: string
  delivery_date: string
  recommended_position_mwh: number
  trades: TradeRecommendation[]
  risk_metrics: {
    var_95_pct: number
    expected_return_pct: number
    sharpe_ratio: number
    max_drawdown_pct: number
  }
  hedge_recommendations: string[]
  market_outlook: string
}

// --- Tool 4: Battery Management Scheduler ---
export interface BatterySchedulerInput {
  battery_capacity_mwh: number
  current_soc_pct: number
  charge_rate_mw: number
  discharge_rate_mw: number
  efficiency_pct: number
  cycle_limit: number
  current_cycles: number
  electricity_prices: number[]
  grid_services: ('frequency_response' | 'peak_shaving' | 'load_shifting' | 'arbitrage')[]
  operating_date: string
}

export interface ScheduleEntry {
  hour: number
  action: 'charge' | 'discharge' | 'idle'
  power_mw: number
  soc_target_pct: number
  revenue_usd: number
  degradation_cost_usd: number
  service_type: string
}

export interface BatterySchedulerResult {
  operating_date: string
  schedule: ScheduleEntry[]
  daily_summary: {
    total_charged_mwh: number
    total_discharged_mwh: number
    round_trip_efficiency: number
    cycle_equivalent: number
    total_revenue_usd: number
    total_degradation_cost_usd: number
    net_profit_usd: number
  }
  battery_health: {
    remaining_cycles: number
    soh_pct: number
    recommended_max_cycles: number
  }
  recommendations: string[]
}

// --- Tool 5: Carbon Capture Optimizer ---
export interface CarbonCaptureInput {
  plant_type: 'coal' | 'gas' | 'biomass' | 'waste'
  fuel_input_mw: number
  capture_rate_target_pct: number
  co2_captured_tons: number
  co2_emitted_tons: number
  electricity_parasitic_pct: number
  solvent_type: string
  regeneration_energy_gj_per_ton: number
  co2_storage_capacity_tons: number
  carbon_price: number
}

export interface CaptureOptimization {
  parameter: string
  current_value: string
  recommended_value: string
  impact_tons: number
  cost_benefit: string
}

export interface CarbonCaptureResult {
  plant_type: string
  effective_capture_rate_pct: number
  co2_captured_annual_tons: number
  parasitic_load_mw: number
  cost_per_ton_captured: number
  revenue_from_captured_co2: number
  net_operating_cost: number
  optimizations: CaptureOptimization[]
  compliance_status: string
  emissions_reduction_pct: number
}

// --- Tool 6: Power Quality Monitor ---
export interface PowerQualityInput {
  voltage_kv: number
  frequency_hz: number
  thd_voltage_pct: number
  thd_current_pct: number
  voltage_unbalance_pct: number
  flicker_pst: number
  harmonic_spectrum: number[]
  power_factor: number
  load_type: 'industrial' | 'commercial' | 'residential' | 'mixed'
  measurement_duration_hours: number
}

export interface HarmonicAnalysis {
  order: number
  magnitude_pct: number
  limit_pct: number
  status: 'compliant' | 'marginal' | 'non_compliant'
}

export interface PowerQualityResult {
  overall_pq_index: number
  voltage_quality: {
    status: string
    thd_status: string
    unbalance_status: string
    flicker_status: string
  }
  harmonic_analysis: HarmonicAnalysis[]
  power_factor_assessment: string
  compliance_standard: string
  violations: string[]
  mitigation_recommendations: string[]
  measurement_confidence: string
}

// --- Tool 7: Microgrid Islanding Controller ---
export interface MicrogridIslandingInput {
  microgrid_id: string
  main_grid_frequency_hz: number
  main_grid_voltage_kv: number
  microgrid_generation_mw: number
  microgrid_load_mw: number
  pcc_breaker_status: 'closed' | 'open'
  islanding_detected: boolean
  distributed_resources: Array<{ type: string; capacity_mw: number; status: string }>
  critical_load_mw: number
  transfer_time_ms: number
}

export interface IslandingAction {
  priority: number
  action: string
  device: string
  setpoint: string
  response_time_ms: number
}

export interface MicrogridIslandingResult {
  microgrid_id: string
  islanding_status: string
  stable_island_possible: boolean
  power_balance_mw: number
  frequency_stability_hz: number
  voltage_stability_pct: number
  actions: IslandingAction[]
  critical_load_served_pct: number
  reconnection_readiness: string
  recommendations: string[]
}

// --- Tool 8: Energy Storage Sizing ---
export interface StorageSizingInput {
  application: 'peak_shaving' | 'load_shifting' | 'renewable_firming' | 'frequency_regulation' | 'backup_power'
  peak_load_mw: number
  daily_energy_mwh: number
  renewable_capacity_mw: number
  required_duration_hours: number
  target_availability_pct: number
  grid_connection_mw: number
  capital_budget: number
  electricity_price: number
}

export interface StorageTechnology {
  name: string
  energy_density_wh_per_kg: number
  power_density_w_per_kg: number
cycle_life: number
  round_trip_efficiency: number
  capex_usd_per_kwh: number
  response_time_ms: number
}

export interface StorageSizingResult {
  application: string
  recommended_technology: StorageTechnology
  sized_capacity: {
    power_mw: number
    energy_mwh: number
    duration_hours: number
    usable_energy_mwh: number
  }
  cost_estimate: {
    energy_system_cost: number
    power_system_cost: number
    balance_of_plant: number
    total_capex: number
    annual_opex: number
    lcoe_usd_per_mwh: number
  }
  performance_metrics: {
    expected_cycles_per_year: number
    annual_throughput_mwh: number
    availability_pct: number
    soh_retention_10yr: number
  }
  financial_metrics: {
    payback_years: number
    irr_pct: number
    npv_10yr: number
    annual_revenue: number
  }
  recommendations: string[]
}

// ==================== SECTION 3 -- Analyze Functions ====================

// Tool 1: Grid Demand Forecaster
function analyzeGridDemand(input: GridDemandInput, rng: SeededRandom): GridDemandResult {
  const hist = input.historical_load_mw
  const currentPeak = Math.max(...hist)
  const currentMin = Math.min(...hist)
  const currentAvg = hist.reduce((a, b) => a + b, 0) / hist.length
  const loadFactor = currentPeak > 0 ? (currentAvg / currentPeak) * 100 : 70

  const seasonMultiplier: Record<string, number> = { spring: 0.85, summer: 1.15, autumn: 0.90, winter: 1.05 }
  const seasonMult = seasonMultiplier[input.season] ?? 1.0

  const forecasts: DemandForecast[] = []
  for (let h = 1; h <= input.forecast_horizon_hours; h++) {
    const baseForecast = currentAvg * seasonMult
    const tempEffect = input.temperature_c[h - 1] !== undefined ? Math.abs(input.temperature_c[h - 1] - 22) * 2.5 : 0
    const humidityEffect = input.humidity_pct[h - 1] !== undefined ? (input.humidity_pct[h - 1] - 50) * 0.3 : 0
    const noise = rng.nextFloat(-currentAvg * 0.08, currentAvg * 0.08)
    const forecast = baseForecast + tempEffect + humidityEffect + noise
    const peak = forecast * (1 + rng.nextFloat(0.05, 0.15))
    const low = forecast * (1 - rng.nextFloat(0.03, 0.10))

    let risk: 'low' | 'medium' | 'high' | 'critical' = 'low'
    const stressRatio = forecast / (currentPeak * 1.1)
    if (stressRatio > 0.95) risk = 'critical'
    else if (stressRatio > 0.85) risk = 'high'
    else if (stressRatio > 0.70) risk = 'medium'

    const spread = forecast * (0.08 + h * 0.015)
    forecasts.push({
      hour: h,
      forecast_mw: Math.round(forecast * 10) / 10,
      peak_mw: Math.round(peak * 10) / 10,
      low_mw: Math.round(low * 10) / 10,
      confidence_interval: [
        Math.round((forecast - spread) * 10) / 10,
        Math.round((forecast + spread) * 10) / 10
      ],
      risk_level: risk
    })
  }

  const peakDemand = Math.max(...forecasts.map(f => f.peak_mw))
  const minDemand = Math.min(...forecasts.map(f => f.low_mw))
  const totalEnergy = forecasts.reduce((s, f) => s + f.forecast_mw, 0)
  const avgForecast = forecasts.reduce((s, f) => s + f.forecast_mw, 0) / Math.max(forecasts.length, 1)
  const forecastLoadFactor = peakDemand > 0 ? (avgForecast / peakDemand) * 100 : 70

  const recommendations: string[] = []
  if (peakDemand > currentPeak) recommendations.push('WARNING: Forecast peak exceeds current record - prepare contingency reserves')
  if (forecastLoadFactor < 60) recommendations.push('Low load factor expected - optimize generation dispatch efficiency')
  recommendations.push('Monitor real-time demand closely during high-risk forecast periods')
  recommendations.push('Coordinate with neighboring grid regions for potential support')

  const criticalHours = forecasts.filter(f => f.risk_level === 'critical' || f.risk_level === 'high').length
  const stressAssessment = criticalHours > forecasts.length * 0.3
    ? 'HIGH STRESS: Grid faces sustained peak pressure. Activate demand response and emergency reserves.'
    : criticalHours > 0
    ? 'MODERATE STRESS: Localized peak periods expected. Pre-position spinning reserves.'
    : 'NORMAL: Grid conditions within normal operating margins.'

  return {
    region: input.grid_region,
    current_peak_mw: Math.round(currentPeak * 10) / 10,
    forecast_horizon_hours: input.forecast_horizon_hours,
    forecasts,
    aggregated: {
      total_energy_mwh: Math.round(totalEnergy),
      peak_demand_mw: Math.round(peakDemand * 10) / 10,
      minimum_demand_mw: Math.round(minDemand * 10) / 10,
      load_factor_pct: Math.round(forecastLoadFactor * 10) / 10
    },
    recommendations,
    grid_stress_assessment: stressAssessment
  }
}

// Tool 2: Renewable Integration Optimizer
function analyzeRenewableIntegration(input: RenewableIntegrationInput, rng: SeededRandom): RenewableIntegrationResult {
  const renewableCap = input.solar_capacity_mw + input.wind_capacity_mw
  const effectiveCap = renewableCap * (1 - input.curtailment_pct / 100)
  const penetration = input.current_grid_load_mw > 0 ? (effectiveCap / input.current_grid_load_mw) * 100 : 0
  const curtailForecast = renewableCap * input.curtailment_pct / 100

  const flexScores: Record<string, { base: number; storageMult: number }> = {
    low: { base: 45, storageMult: 0.8 },
    medium: { base: 70, storageMult: 1.0 },
    high: { base: 90, storageMult: 1.3 }
  }
  const flex = flexScores[input.grid_flexibility] ?? flexScores['medium']
  const storageBonus = Math.min(20, input.storage_mwh * flex.storageMult * 0.5)
  const interconnectionBonus = Math.min(10, input.interconnection_capacity_mw / Math.max(renewableCap, 1) * 10)
  const integrationScore = Math.min(100, Math.round(flex.base + storageBonus + interconnectionBonus))

  const strategies: CurtailmentReduction[] = []
  strategies.push({
    strategy: 'Enhanced forecasting with AI/ML weather prediction',
    reduction_pct: Math.round(rng.nextFloat(15, 30)),
    cost_estimate_usd: Math.round(rng.nextFloat(500000, 1500000)),
    implementation_timeline: '6-12 months'
  })
  if (input.storage_mwh < renewableCap * 0.25) {
    strategies.push({
      strategy: 'Battery energy storage co-location for excess capture',
      reduction_pct: Math.round(rng.nextFloat(20, 40)),
      cost_estimate_usd: Math.round(rng.nextFloat(500000, 800000) * (renewableCap / 100)),
      implementation_timeline: '12-18 months'
    })
  }
  if (input.grid_flexibility === 'low') {
    strategies.push({
      strategy: 'Demand response integration for industrial loads',
      reduction_pct: Math.round(rng.nextFloat(10, 25)),
      cost_estimate_usd: Math.round(rng.nextFloat(300000, 800000)),
      implementation_timeline: '9-15 months'
    })
  }
  strategies.push({
    strategy: 'Regional interconnection and power export',
    reduction_pct: Math.round(rng.nextFloat(8, 18)),
    cost_estimate_usd: Math.round(rng.nextFloat(2000000, 10000000)),
    implementation_timeline: '18-36 months'
  })

  const recommendedStorage = Math.round(renewableCap * rng.nextFloat(0.2, 0.35))

  const stabilityAssessment = penetration > 50
    ? 'High penetration requires advanced grid-forming inverters and synchronous condensers for stability'
    : penetration > 30
    ? 'Moderate penetration - ensure adequate reactive power support and frequency response'
    : 'Low penetration - standard grid codes sufficient for stable operation'

  const recommendations: string[] = []
  if (input.curtailment_pct > 10) recommendations.push('HIGH curtailment - prioritize storage and interconnection investments')
  recommendations.push('Implement advanced inverter functions for grid-forming capability')
  if (penetration > 40) recommendations.push('Consider synchronous condenser installation for inertia support')

  return {
    renewable_penetration_pct: Math.round(penetration * 10) / 10,
    effective_capacity_mw: Math.round(effectiveCap * 10) / 10,
    curtailment_forecast: Math.round(curtailForecast * 10) / 10,
    integration_score: integrationScore,
    strategies,
    storage_optimization: {
      recommended_storage_mwh: recommendedStorage,
      charge_schedule: 'Charge during midday solar peak (10:00-15:00) and off-peak nighttime (00:00-06:00)',
      discharge_schedule: 'Discharge during evening peak (17:00-21:00) and morning ramp (06:00-09:00)',
      round_trip_efficiency: Math.round(rng.nextFloat(85, 92) * 10) / 10
    },
    grid_stability_assessment: stabilityAssessment,
    recommendations
  }
}

// Tool 3: Energy Trading Strategy
function analyzeEnergyTrading(input: EnergyTradingInput, rng: SeededRandom): EnergyTradingResult {
  const avgPrice = input.price_forecast.reduce((a, b) => a + b, 0) / input.price_forecast.length
  const priceSpread = Math.max(...input.price_forecast) - Math.min(...input.price_forecast)
  const priceVol = priceSpread / (avgPrice + 0.01) * 100

  const riskMultipliers: Record<string, number> = { conservative: 0.6, moderate: 1.0, aggressive: 1.5 }
  const riskMult = riskMultipliers[input.risk_appetite] ?? 1.0
  const targetVolume = Math.abs(input.forecast_demand_mwh - input.current_portfolio_mwh) * riskMult
  const recommendedPosition = input.forecast_demand_mwh > input.current_portfolio_mwh
    ? input.current_portfolio_mwh + targetVolume * 0.5
    : input.current_portfolio_mwh - targetVolume * 0.3

  const trades: TradeRecommendation[] = []
  const lowPriceHours = input.price_forecast
    .map((p, i) => ({ price: p, hour: i }))
    .filter(x => x.price < avgPrice * 0.9)
  if (lowPriceHours.length > 0) {
    const bestBuy = lowPriceHours[0]
    trades.push({
      action: 'buy',
      volume_mwh: Math.round(targetVolume * 0.4),
      price_target: Math.round(bestBuy.price * 0.98 * 100) / 100,
      timing: 'Hour ' + bestBuy.hour + ' (off-peak)',
      confidence: Math.round(rng.nextFloat(70, 90)),
      rationale: 'Buy during low-price period to minimize procurement cost'
    })
  }

  const highPriceHours = input.price_forecast
    .map((p, i) => ({ price: p, hour: i }))
    .filter(x => x.price > avgPrice * 1.1)
  if (highPriceHours.length > 0) {
    const bestSell = highPriceHours[highPriceHours.length - 1]
    trades.push({
      action: 'sell',
      volume_mwh: Math.round(targetVolume * 0.2),
      price_target: Math.round(bestSell.price * 1.02 * 100) / 100,
      timing: 'Hour ' + bestSell.hour + ' (peak)',
      confidence: Math.round(rng.nextFloat(65, 85)),
      rationale: 'Sell excess position during high-price period for margin capture'
    })
  }

  trades.push({
    action: 'hold',
    volume_mwh: Math.round(targetVolume * 0.3),
    price_target: Math.round(avgPrice * 100) / 100,
    timing: 'Flexible',
    confidence: Math.round(rng.nextFloat(50, 70)),
    rationale: 'Maintain flexibility for real-time market opportunities and regulatory compliance'
  })

  const var95 = Math.round(priceVol * 1.65 * riskMult * 10) / 10
  const expectedReturn = Math.round((priceSpread / (avgPrice + 0.01)) * riskMult * rng.nextFloat(0.3, 0.8) * 100) / 10
  const sharpe = expectedReturn > 0 && var95 > 0 ? Math.round((expectedReturn / var95) * 100) / 100 : 0
  const maxDrawdown = Math.round(var95 * rng.nextFloat(1.5, 2.5) * 10) / 10

  const hedgeRecs: string[] = []
  hedgeRecs.push('Use CfDs (Contracts for Difference) to hedge ' + Math.round(riskMult * 60) + '% of position')
  if (input.carbon_price > 50) hedgeRecs.push('Include carbon cost in trading margin calculations')
  hedgeRecs.push('Consider renewable energy certificates for portfolio green premium')

  const outlook = priceVol > 40
    ? 'HIGH VOLATILITY - Wide intraday spreads create trading opportunities but increase risk'
    : priceVol > 20
    ? 'MODERATE VOLATILITY - Normal market conditions suitable for active trading'
    : 'LOW VOLATILITY - Stable prices suggest hold strategy with selective optimization'

  return {
    market: input.market,
    delivery_date: input.delivery_date,
    recommended_position_mwh: Math.round(recommendedPosition),
    trades,
    risk_metrics: {
      var_95_pct: var95,
      expected_return_pct: expectedReturn,
      sharpe_ratio: sharpe,
      max_drawdown_pct: maxDrawdown
    },
    hedge_recommendations: hedgeRecs,
    market_outlook: outlook
  }
}

// Tool 4: Battery Management Scheduler
function analyzeBatteryScheduler(input: BatterySchedulerInput, rng: SeededRandom): BatterySchedulerResult {
  const usableEnergy = input.battery_capacity_mwh * (input.efficiency_pct / 100)
  const maxChargeEnergy = input.charge_rate_mw
  const maxDischargeEnergy = input.discharge_rate_mw
  const prices = input.electricity_prices
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

  const schedule: ScheduleEntry[] = []
  let currentSoc = input.current_soc_pct
  let totalRevenue = 0
  let totalDegradation = 0
  let totalCharged = 0
  let totalDischarged = 0

  const sortedPrices = prices.map((p, i) => ({ price: p, hour: i })).sort((a, b) => a.price - b.price)
  const cheapHours = sortedPrices.slice(0, Math.floor(sortedPrices.length * 0.3)).map(x => x.hour)
  const expensiveHours = sortedPrices.slice(Math.floor(sortedPrices.length * 0.7)).map(x => x.hour)

  for (let h = 0; h < prices.length; h++) {
    const isCheap = cheapHours.includes(h)
    const isExpensive = expensiveHours.includes(h)
    const maxSoc = 95.0
    const minSoc = 10.0

    let action: 'charge' | 'discharge' | 'idle' = 'idle'
    let power = 0
    let revenue = 0
    let degradation = 0
    let service = 'standby'

    if (isCheap && currentSoc < maxSoc) {
      action = 'charge'
      power = -Math.min(maxChargeEnergy, (maxSoc - currentSoc) / 100 * input.battery_capacity_mwh)
      const energy = Math.abs(power)
      currentSoc += energy / input.battery_capacity_mwh * 100
      revenue = energy * prices[h] * 0.5
      degradation = energy * rng.nextFloat(0.5, 1.5)
      totalCharged += energy
      service = 'arbitrage'
    } else if (isExpensive && currentSoc > minSoc) {
      action = 'discharge'
      power = Math.min(maxDischargeEnergy, (currentSoc - minSoc) / 100 * input.battery_capacity_mwh)
      const energy = Math.abs(power) * (input.efficiency_pct / 100)
      currentSoc -= power / input.battery_capacity_mwh * 100
      revenue = energy * prices[h] - power * avgPrice * 0.1
      degradation = energy * rng.nextFloat(0.8, 2.0)
      totalDischarged += energy
      service = input.grid_services.includes('peak_shaving') ? 'peak_shaving' : 'arbitrage'
    }

    totalRevenue += revenue
    totalDegradation += degradation

    schedule.push({
      hour: h,
      action,
      power_mw: Math.round(power * 100) / 100,
      soc_target_pct: Math.round(currentSoc * 10) / 10,
      revenue_usd: Math.round(revenue * 100) / 100,
      degradation_cost_usd: Math.round(degradation * 100) / 100,
      service_type: service
    })
  }

  const cycleEq = Math.max(totalCharged, totalDischarged) / Math.max(usableEnergy, 1)
  const remainingCycles = Math.max(0, input.cycle_limit - input.current_cycles)
  const dailyRevenue = Math.round(totalRevenue)
  const dailyDegradation = Math.round(totalDegradation)

  const recommendations: string[] = []
  if (cycleEq > 1) recommendations.push('High cycle count expected - consider reducing depth of discharge')
  if (input.current_cycles > input.cycle_limit * 0.8) recommendations.push('Battery approaching cycle limit - plan replacement schedule')
  recommendations.push('Align charging with renewable generation peaks for cost optimization')

  return {
    operating_date: input.operating_date,
    schedule,
    daily_summary: {
      total_charged_mwh: Math.round(totalCharged * 100) / 100,
      total_discharged_mwh: Math.round(totalDischarged * 100) / 100,
      round_trip_efficiency: input.efficiency_pct,
      cycle_equivalent: Math.round(cycleEq * 100) / 100,
      total_revenue_usd: dailyRevenue,
      total_degradation_cost_usd: dailyDegradation,
      net_profit_usd: dailyRevenue - dailyDegradation
    },
    battery_health: {
      remaining_cycles: remainingCycles,
      soh_pct: Math.max(70, 100 - input.current_cycles / input.cycle_limit * 30),
      recommended_max_cycles: input.cycle_limit
    },
    recommendations
  }
}

// Tool 5: Carbon Capture Optimizer
function analyzeCarbonCapture(input: CarbonCaptureInput, rng: SeededRandom): CarbonCaptureResult {
  const totalCO2 = input.co2_captured_tons + input.co2_emitted_tons
  const captureRate = totalCO2 > 0 ? (input.co2_captured_tons / totalCO2) * 100 : 0

  const parasiticLoadMW = input.fuel_input_mw * (input.electricity_parasitic_pct / 100)
  const regenerationCostPerTon = input.regeneration_energy_gj_per_ton * rng.nextFloat(2.5, 4.0)
  const capexAnnual = input.co2_captured_tons * rng.nextFloat(15, 35)
  const totalCost = (input.co2_captured_tons * regenerationCostPerTon + capexAnnual)
  const costPerTon = input.co2_captured_tons > 0 ? totalCost / input.co2_captured_tons : 0

  const capturedRevenue = input.co2_captured_tons * input.carbon_price
  const netCost = totalCost - capturedRevenue

  const optimizations: CaptureOptimization[] = []
  if (input.electricity_parasitic_pct > 12) {
    optimizations.push({
      parameter: 'Parasitic load reduction via heat integration',
      current_value: input.electricity_parasitic_pct.toFixed(1) + '%',
      recommended_value: (input.electricity_parasitic_pct * 0.75).toFixed(1) + '%',
      impact_tons: Math.round(input.fuel_input_mw * input.electricity_parasitic_pct * 0.01 * 8760 * 0.05),
      cost_benefit: 'Saves ~' + Math.round(input.fuel_input_mw * 0.01 * 1000).toLocaleString() + ' USD/year'
    })
  }
  if (input.capture_rate_target_pct > 0 && captureRate < input.capture_rate_target_pct) {
    optimizations.push({
      parameter: 'Capture rate increase via additional absorber stages',
      current_value: captureRate.toFixed(1) + '%',
      recommended_value: Math.min(captureRate * 1.3, input.capture_rate_target_pct).toFixed(1) + '%',
      impact_tons: Math.round(totalCO2 * 0.08),
      cost_benefit: 'Additional ' + Math.round(totalCO2 * 0.08).toLocaleString() + ' tons CO2 captured annually'
    })
  }
  optimizations.push({
    parameter: 'Advanced amine solvent for faster kinetics',
    current_value: input.solvent_type,
    recommended_value: 'Advanced amine blend (A-MDEA/PZ)',
    impact_tons: Math.round(totalCO2 * 0.04),
    cost_benefit: '15% reduction in regeneration energy per ton CO2'
  })
  optimizations.push({
    parameter: 'CO2 utilization for enhanced oil recovery',
    current_value: 'Storage only',
    recommended_value: '60% EOR / 40% storage',
    impact_tons: 0,
    cost_benefit: 'EOR credits offset 30-40% of capture cost'
  })

  const targetGap = Math.abs(input.capture_rate_target_pct - captureRate)
  const compliance = captureRate >= input.capture_rate_target_pct
    ? 'COMPLIANT: Current capture rate meets ' + input.capture_rate_target_pct + '% target'
    : targetGap < 5
    ? 'NEAR COMPLIENT: Within 5% of target - minor adjustments recommended'
    : 'BELOW TARGET: Gap of ' + targetGap.toFixed(1) + '% requires immediate action'

  return {
    plant_type: input.plant_type,
    effective_capture_rate_pct: Math.round(captureRate * 10) / 10,
    co2_captured_annual_tons: Math.round(input.co2_captured_tons),
    parasitic_load_mw: Math.round(parasiticLoadMW * 10) / 10,
    cost_per_ton_captured: Math.round(costPerTon * 100) / 100,
    revenue_from_captured_co2: Math.round(capturedRevenue),
    net_operating_cost: Math.round(netCost),
    optimizations,
    compliance_status: compliance,
    emissions_reduction_pct: Math.round(captureRate * 10) / 10
  }
}

// Tool 6: Power Quality Monitor
function analyzePowerQuality(input: PowerQualityInput, rng: SeededRandom): PowerQualityResult {
  const thdLimit = 5.0
  const unbalanceLimit = 2.0
  const flickerLimit = 1.0

  const thdStatus = input.thd_voltage_pct <= thdLimit * 0.7 ? 'GOOD' : input.thd_voltage_pct <= thdLimit ? 'MARGINAL' : 'POOR'
  const unbalStatus = input.voltage_unbalance_pct <= unbalanceLimit * 0.7 ? 'GOOD' : input.voltage_unbalance_pct <= unbalanceLimit ? 'MARGINAL' : 'POOR'
  const flickerStatus = input.flicker_pst <= flickerLimit * 0.7 ? 'GOOD' : input.flicker_pst <= flickerLimit ? 'MARGINAL' : 'POOR'

  const limits = [5, 5, 5, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1]
  const harmonics: HarmonicAnalysis[] = []
  for (let i = 0; i < Math.min(input.harmonic_spectrum.length, 16); i++) {
    const mag = input.harmonic_spectrum[i]
    const limit_pct = limits[i] ?? 2
    let status: 'compliant' | 'marginal' | 'non_compliant' = 'compliant'
    if (mag > limit_pct * 1.2) status = 'non_compliant'
    else if (mag > limit_pct * 0.9) status = 'marginal'
    harmonics.push({ order: i + 2, magnitude_pct: Math.round(mag * 100) / 100, limit_pct, status })
  }

  const pfStatus = input.power_factor >= 0.95 ? 'EXCELLENT' : input.power_factor >= 0.85 ? 'GOOD' : input.power_factor >= 0.70 ? 'FAIR' : 'POOR'

  const violations: string[] = []
  if (thdStatus !== 'GOOD') violations.push('Voltage THD exceeds ' + thdLimit + '% limit')
  if (unbalStatus !== 'GOOD') violations.push('Voltage unbalance exceeds ' + unbalanceLimit + '% limit')
  if (flickerStatus !== 'GOOD') violations.push('Flicker severity exceeds ' + flickerLimit + ' Pst limit')
  if (pfStatus === 'POOR') violations.push('Power factor below minimum threshold')

  const pqIndex = Math.max(0, Math.min(100, 100 - (input.thd_voltage_pct - 3) * 8 - (input.voltage_unbalance_pct - 1.5) * 6 - (input.flicker_pst - 0.7) * 10 - (1 - input.power_factor) * 30))

  const mitigations: string[] = []
  if (thdStatus !== 'GOOD') mitigations.push('Install passive or active harmonic filters at PCC')
  if (unbalStatus !== 'GOOD') mitigations.push('Redistribute single-phase loads across phases')
  if (flickerStatus !== 'GOOD') mitigations.push('Install SVC or STATCOM for reactive power compensation')
  if (pfStatus === 'POOR' || pfStatus === 'FAIR') mitigations.push('Install power factor correction capacitor banks')
  mitigations.push('Implement continuous power quality monitoring per IEC 61000-4-30')

  return {
    overall_pq_index: Math.round(pqIndex * 10) / 10,
    voltage_quality: {
      status: thdStatus,
      thd_status: 'THD ' + input.thd_voltage_pct.toFixed(2) + '% (limit: ' + thdLimit + '%)',
      unbalance_status: 'Unbalance ' + input.voltage_unbalance_pct.toFixed(2) + '% (limit: ' + unbalanceLimit + '%)',
      flicker_status: 'Flicker ' + input.flicker_pst.toFixed(2) + ' Pst (limit: ' + flickerLimit + ')'
    },
    harmonic_analysis: harmonics,
    power_factor_assessment: 'PF = ' + input.power_factor.toFixed(3) + ' (' + pfStatus + ')',
    compliance_standard: 'IEEE 519-2022 / IEC 61000-3-6',
    violations,
    mitigation_recommendations: mitigations,
    measurement_confidence: input.measurement_duration_hours >= 168 ? 'HIGH (7-day monitoring)' : input.measurement_duration_hours >= 24 ? 'MEDIUM (24-hour monitoring)' : 'LOW (spot measurement - recommend extended monitoring)'
  }
}

// Tool 7: Microgrid Islanding Controller
function analyzeMicrogridIslanding(input: MicrogridIslandingInput, rng: SeededRandom): MicrogridIslandingResult {
  const powerBalance = input.microgrid_generation_mw - input.microgrid_load_mw
  const totalCapacity = input.distributed_resources.reduce((s, d) => s + d.capacity_mw, 0)
  const canIsland = Math.abs(powerBalance) < totalCapacity * 0.3 && input.microgrid_generation_mw >= input.critical_load_mw

  const freqStability = 50 + (powerBalance / Math.max(totalCapacity, 1)) * rng.nextFloat(0.1, 0.5)
  const voltageStability = 100 + rng.nextFloat(-5, 5) + (powerBalance > 0 ? -1 : 1) * rng.nextFloat(0, 3)

  const actions: IslandingAction[] = []
  let priority = 1

  if (input.islanding_detected && input.pcc_breaker_status === 'closed') {
    actions.push({ priority: priority++, action: 'TRIP PCC BREAKER', device: 'PCC-001', setpoint: 'OPEN', response_time_ms: Math.min(input.transfer_time_ms + rng.nextInt(5, 20), 200) })
  }

  if (powerBalance < 0) {
    actions.push({ priority: priority++, action: 'LOAD SHED - Stage 1', device: 'LOAD-RELAY-NONCRIT', setpoint: 'Disconnect ' + Math.round(input.microgrid_load_mw * 0.15) + ' MW', response_time_ms: 150 })
    actions.push({ priority: priority++, action: 'STORAGE DISCHARGE', device: 'BESS-001', setpoint: 'Max discharge ' + Math.round(Math.min(totalCapacity * 0.5, Math.abs(powerBalance)) * 10) / 10 + ' MW', response_time_ms: 50 })
  } else if (powerBalance > 0) {
    actions.push({ priority: priority++, action: 'REDUCE GENERATION', device: 'GEN-CONTROLLER', setpoint: 'Output limit ' + Math.round(input.microgrid_load_mw * 1.05 * 10) / 10 + ' MW', response_time_ms: 100 })
  }

  if (input.critical_load_mw > 0) {
    actions.push({ priority: priority++, action: 'PRIORITIZE CRITICAL LOAD', device: 'LOAD-MGMT', setpoint: 'Ensure ' + input.critical_load_mw + ' MW supply', response_time_ms: 25 })
  }

  actions.push({ priority: priority++, action: 'FREQUENCY REGULATION', device: 'PRIMARY-CTRL', setpoint: 'Maintain 50.00 +/- 0.05 Hz', response_time_ms: 10 })
  actions.push({ priority: priority++, action: 'VOLTAGE REGULATION', device: 'AVR-001', setpoint: 'Maintain ' + Math.round(voltageStability * 10) / 10 + '% nominal', response_time_ms: 30 })

  const criticalServed = Math.min(100, Math.round((input.microgrid_generation_mw / Math.max(input.critical_load_mw, 0.01)) * 100))

  const reconnectionReady = !input.islanding_detected && input.pcc_breaker_status === 'closed'
    ? 'READY: Grid-connected mode, synchronization available'
    : canIsland && Math.abs(freqStability - 50) < 0.2 && Math.abs(voltageStability - 100) < 5
    ? 'READY: Microgrid stable, reconnection possible within 30 seconds'
    : 'NOT READY: Stabilize island operations first'

  const recommendations: string[] = []
  if (!canIsland && input.microgrid_generation_mw < input.critical_load_mw) {
    recommendations.push('Increase local generation or add storage before attempting islanding')
  }
  recommendations.push('Regular islanding tests recommended - quarterly DRY runs')
  recommendations.push('Ensure protection relay coordination updated for island mode')

  return {
    microgrid_id: input.microgrid_id,
    islanding_status: input.islanding_detected ? 'ISLAND DETECTED - Managing islanded operation' : 'GRID-CONNECTED - Normal operation',
    stable_island_possible: canIsland,
    power_balance_mw: Math.round(powerBalance * 100) / 100,
    frequency_stability_hz: Math.round(freqStability * 1000) / 1000,
    voltage_stability_pct: Math.round(voltageStability * 10) / 10,
    actions,
    critical_load_served_pct: criticalServed,
    reconnection_readiness: reconnectionReady,
    recommendations
  }
}

// Tool 8: Energy Storage Sizing
function analyzeStorageSizing(input: StorageSizingInput, rng: SeededRandom): StorageSizingResult {
  const technologies: StorageTechnology[] = [
    { name: 'Lithium-ion (NMC)', energy_density_wh_per_kg: 200, power_density_w_per_kg: 250, cycle_life: 5000, round_trip_efficiency: 92, capex_usd_per_kwh: 280, response_time_ms: 10 },
    { name: 'Lithium-iron-phosphate (LFP)', energy_density_wh_per_kg: 160, power_density_w_per_kg: 200, cycle_life: 8000, round_trip_efficiency: 95, capex_usd_per_kwh: 220, response_time_ms: 10 },
    { name: 'Vanadium Redox Flow', energy_density_wh_per_kg: 25, power_density_w_per_kg: 100, cycle_life: 20000, round_trip_efficiency: 75, capex_usd_per_kwh: 400, response_time_ms: 50 },
    { name: 'Sodium-Sulfur (NaS)', energy_density_wh_per_kg: 150, power_density_w_per_kg: 150, cycle_life: 4500, round_trip_efficiency: 85, capex_usd_per_kwh: 350, response_time_ms: 20 },
    { name: 'Compressed Air Energy Storage', energy_density_wh_per_kg: 0, power_density_w_per_kg: 0, cycle_life: 25000, round_trip_efficiency: 60, capex_usd_per_kwh: 150, response_time_ms: 30000 },
    { name: 'Pumped Hydro Storage', energy_density_wh_per_kg: 0, power_density_w_per_kg: 0, cycle_life: 50000, round_trip_efficiency: 80, capex_usd_per_kwh: 100, response_time_ms: 60000 }
  ]

  let bestTech: StorageTechnology = technologies[1]
  if (input.application === 'frequency_regulation') bestTech = technologies[0]
  else if (input.application === 'renewable_firming') bestTech = technologies[1]
  else if (input.application === 'load_shifting') bestTech = technologies[1]
  else if (input.application === 'peak_shaving') bestTech = technologies[0]

  const dodLimit = bestTech.name.includes('LFP') ? 0.9 : 0.8
  const requiredEnergy = input.peak_load_mw * input.required_duration_hours
  const sizedEnergy = requiredEnergy / dodLimit
  const usableEnergy = sizedEnergy * dodLimit * (bestTech.round_trip_efficiency / 100)
  const powerMW = Math.max(input.peak_load_mw * 0.5, input.grid_connection_mw * 0.25)

  const energyCost = sizedEnergy * 1000 * bestTech.capex_usd_per_kwh
  const powerCost = powerMW * 1000 * rng.nextFloat(80, 150)
  const bopCost = (energyCost + powerCost) * 0.2
  const totalCapex = energyCost + powerCost + bopCost
  const annualOpex = totalCapex * rng.nextFloat(0.01, 0.025)
  const lcoe = sizedEnergy > 0 ? (totalCapex / 10 + annualOpex) / (sizedEnergy * 365 * dodLimit) * 1000 : 0

  const cyclesPerYear = bestTech.name.includes('Flow') ? 300 : 365
  const annualThroughput = usableEnergy * cyclesPerYear * (bestTech.round_trip_efficiency / 100)
  const annualRevenue = annualThroughput * input.electricity_price * rng.nextFloat(0.4, 0.8)
  const payback = totalCapex / Math.max(annualRevenue - annualOpex, 1)
  const npv = -totalCapex + (annualRevenue - annualOpex) * (rng.nextFloat(5, 8))
  const irr = Math.min(25, Math.max(0, ((annualRevenue - annualOpex) / totalCapex) * 100 * 3 + rng.nextFloat(-2, 5)))

  const recommendations: string[] = []
  recommendations.push('Conduct detailed site-specific geotechnical and environmental studies')
  if (cyclesPerYear > 400) recommendations.push('High cycling application - prioritize LFP longevity over NMC power density')
  recommendations.push('Include 20% capacity buffer for degradation margin over project lifetime')
  recommendations.push('Evaluate hybrid storage architecture combining power and energy optimized technologies')

  return {
    application: input.application,
    recommended_technology: bestTech,
    sized_capacity: {
      power_mw: Math.round(powerMW * 100) / 100,
      energy_mwh: Math.round(sizedEnergy * 100) / 100,
      duration_hours: input.required_duration_hours,
      usable_energy_mwh: Math.round(usableEnergy * 100) / 100
    },
    cost_estimate: {
      energy_system_cost: Math.round(energyCost),
      power_system_cost: Math.round(powerCost),
      balance_of_plant: Math.round(bopCost),
      total_capex: Math.round(totalCapex),
      annual_opex: Math.round(annualOpex),
      lcoe_usd_per_mwh: Math.round(lcoe * 100) / 100
    },
    performance_metrics: {
      expected_cycles_per_year: cyclesPerYear,
      annual_throughput_mwh: Math.round(annualThroughput),
      availability_pct: input.target_availability_pct,
      soh_retention_10yr: bestTech.cycle_life >= 8000 ? Math.round(80 + rng.nextFloat(0, 10)) : Math.round(65 + rng.nextFloat(0, 15))
    },
    financial_metrics: {
      payback_years: Math.round(payback * 10) / 10,
      irr_pct: Math.round(irr * 10) / 10,
      npv_10yr: Math.round(npv),
      annual_revenue: Math.round(annualRevenue)
    },
    recommendations
  }
}

// ==================== SECTION 4 -- Format Functions ====================

function formatGridDemandReport(r: GridDemandResult): string {
  const lines: string[] = []
  lines.push('## Grid Demand Forecast Report')
  lines.push('')
  lines.push('**Region:** ' + r.region + ' | **Current Peak:** ' + r.current_peak_mw + ' MW | **Forecast Horizon:** ' + r.forecast_horizon_hours + 'h')
  lines.push('')
  lines.push('### Aggregated Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Energy (forecast) | ' + r.aggregated.total_energy_mwh.toLocaleString() + ' MWh |')
  lines.push('| Peak Demand (forecast) | ' + r.aggregated.peak_demand_mw + ' MW |')
  lines.push('| Minimum Demand (forecast) | ' + r.aggregated.minimum_demand_mw + ' MW |')
  lines.push('| Load Factor | ' + r.aggregated.load_factor_pct + '% |')
  lines.push('')
  lines.push('### Hourly Forecast')
  lines.push('| Hour | Forecast (MW) | Peak (MW) | Low (MW) | 95% CI | Risk |')
  lines.push('|------|-------------|-----------|----------|--------|------|')
  for (const f of r.forecasts) {
    lines.push('| ' + f.hour + ' | ' + f.forecast_mw + ' | ' + f.peak_mw + ' | ' + f.low_mw + ' | [' + f.confidence_interval[0] + ', ' + f.confidence_interval[1] + '] | ' + f.risk_level + ' |')
  }
  lines.push('')
  lines.push('### Grid Stress Assessment')
  lines.push('- ' + r.grid_stress_assessment)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatRenewableIntegrationReport(r: RenewableIntegrationResult): string {
  const lines: string[] = []
  lines.push('## Renewable Integration Optimization Report')
  lines.push('')
  lines.push('### Integration Overview')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Renewable Penetration | ' + r.renewable_penetration_pct + '% |')
  lines.push('| Effective Capacity | ' + r.effective_capacity_mw + ' MW |')
  lines.push('| Curtailment Forecast | ' + r.curtailment_forecast + ' MW |')
  lines.push('| Integration Score | ' + r.integration_score + '/100 |')
  lines.push('')
  lines.push('### Curtailment Reduction Strategies')
  for (const s of r.strategies) {
    lines.push('#### ' + s.strategy)
    lines.push('- Curtailment reduction: ' + s.reduction_pct + '%')
    lines.push('- Estimated cost: $' + s.cost_estimate_usd.toLocaleString())
    lines.push('- Timeline: ' + s.implementation_timeline)
    lines.push('')
  }
  lines.push('### Storage Optimization')
  lines.push('- Recommended storage: ' + r.storage_optimization.recommended_storage_mwh + ' MWh')
  lines.push('- Charge schedule: ' + r.storage_optimization.charge_schedule)
  lines.push('- Discharge schedule: ' + r.storage_optimization.discharge_schedule)
  lines.push('- Round-trip efficiency: ' + r.storage_optimization.round_trip_efficiency + '%')
  lines.push('')
  lines.push('### Grid Stability Assessment')
  lines.push('- ' + r.grid_stability_assessment)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatEnergyTradingReport(r: EnergyTradingResult): string {
  const lines: string[] = []
  lines.push('## Energy Trading Strategy Report')
  lines.push('')
  lines.push('**Market:** ' + r.market + ' | **Delivery:** ' + r.delivery_date + ' | **Position:** ' + r.recommended_position_mwh + ' MWh')
  lines.push('')
  lines.push('### Market Outlook')
  lines.push('- ' + r.market_outlook)
  lines.push('')
  lines.push('### Trade Recommendations')
  for (const t of r.trades) {
    lines.push('#### ' + t.action.toUpperCase() + ' ' + t.volume_mwh + ' MWh')
    lines.push('- Price target: $' + t.price_target + '/MWh')
    lines.push('- Timing: ' + t.timing)
    lines.push('- Confidence: ' + t.confidence + '%')
    lines.push('- Rationale: ' + t.rationale)
    lines.push('')
  }
  lines.push('### Risk Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| VaR (95%) | ' + r.risk_metrics.var_95_pct + '% |')
  lines.push('| Expected Return | ' + r.risk_metrics.expected_return_pct + '% |')
  lines.push('| Sharpe Ratio | ' + r.risk_metrics.sharpe_ratio + ' |')
  lines.push('| Max Drawdown | ' + r.risk_metrics.max_drawdown_pct + '% |')
  lines.push('')
  lines.push('### Hedge Recommendations')
  for (const h of r.hedge_recommendations) lines.push('- ' + h)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatBatterySchedulerReport(r: BatterySchedulerResult): string {
  const lines: string[] = []
  lines.push('## Battery Management Schedule Report')
  lines.push('')
  lines.push('**Operating Date:** ' + r.operating_date + ' | **Net Profit:** $' + r.daily_summary.net_profit_usd + ' | **Cycles:** ' + r.daily_summary.cycle_equivalent.toFixed(2))
  lines.push('')
  lines.push('### Hourly Schedule')
  lines.push('| Hour | Action | Power (MW) | SOC Target | Revenue ($) | Degradation ($) | Service |')
  lines.push('|------|--------|-----------|------------|-------------|-----------------|---------|')
  for (const s of r.schedule) {
    lines.push('| ' + s.hour + ' | ' + s.action + ' | ' + s.power_mw + ' | ' + s.soc_target_pct + '% | ' + s.revenue_usd + ' | ' + s.degradation_cost_usd + ' | ' + s.service_type + ' |')
  }
  lines.push('')
  lines.push('### Daily Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Charged | ' + r.daily_summary.total_charged_mwh + ' MWh |')
  lines.push('| Total Discharged | ' + r.daily_summary.total_discharged_mwh + ' MWh |')
  lines.push('| Round-trip Efficiency | ' + r.daily_summary.round_trip_efficiency + '% |')
  lines.push('| Cycle Equivalent | ' + r.daily_summary.cycle_equivalent.toFixed(3) + ' |')
  lines.push('| Total Revenue | $' + r.daily_summary.total_revenue_usd.toLocaleString() + ' |')
  lines.push('| Total Degradation | $' + r.daily_summary.total_degradation_cost_usd.toLocaleString() + ' |')
  lines.push('| **Net Profit** | **$' + r.daily_summary.net_profit_usd.toLocaleString() + '** |')
  lines.push('')
  lines.push('### Battery Health')
  lines.push('- Remaining cycles: ' + r.battery_health.remaining_cycles)
  lines.push('- State of Health (SOH): ' + r.battery_health.soh_pct.toFixed(1) + '%')
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatCarbonCaptureReport(r: CarbonCaptureResult): string {
  const lines: string[] = []
  lines.push('## Carbon Capture Optimization Report')
  lines.push('')
  lines.push('**Plant Type:** ' + r.plant_type + ' | **Capture Rate:** ' + r.effective_capture_rate_pct + '% | **Annual Captured:** ' + r.co2_captured_annual_tons.toLocaleString() + ' tons')
  lines.push('')
  lines.push('### Performance Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| CO2 Captured (annual) | ' + r.co2_captured_annual_tons.toLocaleString() + ' tons |')
  lines.push('| Parasitic Load | ' + r.parasitic_load_mw + ' MW |')
  lines.push('| Cost per Ton | $' + r.cost_per_ton_captured + ' |')
  lines.push('| Revenue from CO2 | $' + r.revenue_from_captured_co2.toLocaleString() + ' |')
  lines.push('| Net Operating Cost | $' + r.net_operating_cost.toLocaleString() + ' |')
  lines.push('| Emissions Reduction | ' + r.emissions_reduction_pct + '% |')
  lines.push('')
  lines.push('### Compliance Status')
  lines.push('- ' + r.compliance_status)
  lines.push('')
  lines.push('### Optimization Recommendations')
  for (const o of r.optimizations) {
    lines.push('#### ' + o.parameter)
    lines.push('- Current: ' + o.current_value + ' -> Recommended: ' + o.recommended_value)
    if (o.impact_tons > 0) lines.push('- Impact: ' + o.impact_tons + ' tons CO2/year')
    lines.push('- Cost benefit: ' + o.cost_benefit)
    lines.push('')
  }
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatPowerQualityReport(r: PowerQualityResult): string {
  const lines: string[] = []
  lines.push('## Power Quality Analysis Report')
  lines.push('')
  lines.push('**Overall PQ Index:** ' + r.overall_pq_index + '/100 | **Standard:** ' + r.compliance_standard + ' | **Confidence:** ' + r.measurement_confidence)
  lines.push('')
  lines.push('### Voltage Quality')
  lines.push('- **THD Status:** ' + r.voltage_quality.status + ' (' + r.voltage_quality.thd_status + ')')
  lines.push('- **Unbalance:** ' + r.voltage_quality.unbalance_status)
  lines.push('- **Flicker:** ' + r.voltage_quality.flicker_status)
  lines.push('- **Power Factor:** ' + r.power_factor_assessment)
  lines.push('')
  lines.push('### Harmonic Analysis (up to 16th order)')
  lines.push('| Order | Magnitude (%) | Limit (%) | Status |')
  lines.push('|-------|---------------|-----------|--------|')
  for (const h of r.harmonic_analysis) {
    lines.push('| ' + h.order + ' | ' + h.magnitude_pct + ' | ' + h.limit_pct + ' | ' + h.status + ' |')
  }
  lines.push('')
  if (r.violations.length > 0) {
    lines.push('### Violations')
    for (const v of r.violations) lines.push('- [VIOLATION] ' + v)
    lines.push('')
  }
  lines.push('### Mitigation Recommendations')
  for (const m of r.mitigation_recommendations) lines.push('- ' + m)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatMicrogridIslandingReport(r: MicrogridIslandingResult): string {
  const lines: string[] = []
  lines.push('## Microgrid Islanding Control Report')
  lines.push('')
  lines.push('**Microgrid:** ' + r.microgrid_id + ' | **Status:** ' + r.islanding_status)
  lines.push('')
  lines.push('### Island Characteristics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Stable Island Possible | ' + (r.stable_island_possible ? 'YES' : 'NO') + ' |')
  lines.push('| Power Balance | ' + r.power_balance_mw + ' MW |')
  lines.push('| Frequency Stability | ' + r.frequency_stability_hz.toFixed(3) + ' Hz |')
  lines.push('| Voltage Stability | ' + r.voltage_stability_pct.toFixed(1) + '% |')
  lines.push('| Critical Load Served | ' + r.critical_load_served_pct + '% |')
  lines.push('')
  lines.push('### Control Actions')
  lines.push('| Priority | Action | Device | Setpoint | Response (ms) |')
  lines.push('|----------|--------|--------|----------|----------------|')
  for (const a of r.actions) {
    lines.push('| ' + a.priority + ' | ' + a.action + ' | ' + a.device + ' | ' + a.setpoint + ' | ' + a.response_time_ms + ' |')
  }
  lines.push('')
  lines.push('### Reconnection Readiness')
  lines.push('- ' + r.reconnection_readiness)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

function formatStorageSizingReport(r: StorageSizingResult): string {
  const lines: string[] = []
  lines.push('## Energy Storage Sizing Report')
  lines.push('')
  lines.push('**Application:** ' + r.application + ' | **Technology:** ' + r.recommended_technology.name)
  lines.push('')
  lines.push('### Technology Specifications')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Chemistry | ' + r.recommended_technology.name + ' |')
  lines.push('| Energy Density | ' + r.recommended_technology.energy_density_wh_per_kg + ' Wh/kg |')
  lines.push('| Cycle Life | ' + r.recommended_technology.cycle_life.toLocaleString() + ' cycles |')
  lines.push('| Round-trip Efficiency | ' + r.recommended_technology.round_trip_efficiency + '% |')
  lines.push('| Response Time | ' + r.recommended_technology.response_time_ms + ' ms |')
  lines.push('| CAPEX | $' + r.recommended_technology.capex_usd_per_kwh + '/kWh |')
  lines.push('')
  lines.push('### Sizing Results')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Power Rating | ' + r.sized_capacity.power_mw + ' MW |')
  lines.push('| Energy Capacity | ' + r.sized_capacity.energy_mwh + ' MWh |')
  lines.push('| Duration | ' + r.sized_capacity.duration_hours + ' hours |')
  lines.push('| Usable Energy | ' + r.sized_capacity.usable_energy_mwh + ' MWh |')
  lines.push('')
  lines.push('### Cost Estimate')
  lines.push('| Component | Cost |')
  lines.push('|-----------|------|')
  lines.push('| Energy System (cells + BMS) | $' + r.cost_estimate.energy_system_cost.toLocaleString() + ' |')
  lines.push('| Power System (PCS + transformer) | $' + r.cost_estimate.power_system_cost.toLocaleString() + ' |')
  lines.push('| Balance of Plant | $' + r.cost_estimate.balance_of_plant.toLocaleString() + ' |')
  lines.push('| **Total CAPEX** | **$' + r.cost_estimate.total_capex.toLocaleString() + '** |')
  lines.push('| Annual OPEX | $' + r.cost_estimate.annual_opex.toLocaleString() + ' |')
  lines.push('| LCOE | $' + r.cost_estimate.lcoe_usd_per_mwh + '/MWh |')
  lines.push('')
  lines.push('### Performance Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Expected Cycles/Year | ' + r.performance_metrics.expected_cycles_per_year + ' |')
  lines.push('| Annual Throughput | ' + r.performance_metrics.annual_throughput_mwh.toLocaleString() + ' MWh |')
  lines.push('| Availability | ' + r.performance_metrics.availability_pct + '% |')
  lines.push('| SOH Retention (10yr) | ' + r.performance_metrics.soh_retention_10yr + '% |')
  lines.push('')
  lines.push('### Financial Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Payback Period | ' + r.financial_metrics.payback_years + ' years |')
  lines.push('| IRR | ' + r.financial_metrics.irr_pct + '% |')
  lines.push('| NPV (10yr) | $' + r.financial_metrics.npv_10yr.toLocaleString() + ' |')
  lines.push('| Annual Revenue | $' + r.financial_metrics.annual_revenue.toLocaleString() + ' |')
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('_' + DISCLAIMER + '_')
  return lines.join('\n')
}

// ==================== SECTION 5 -- Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Grid Demand Forecaster
  tools.register(defineTool({
    name: 'grid_demand_forecaster',
    description: 'Forecasts electricity demand across multiple time horizons using historical load data, temperature/humidity weather scenarios. Produces hourly demand predictions with peak/low bounds, confidence intervals, risk levels, load factor analysis, and grid stress assessment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { historical_load_mw (number[]), forecast_horizon_hours (int), temperature_c (number[]), humidity_pct (number[]), grid_region (string), season (spring/summer/autumn/winter), special_event (optional string) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: GridDemandInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeGridDemand(input, rng)
      return formatGridDemandReport(result)
    }
  }))

  // Tool 2: Renewable Integration Optimizer
  tools.register(defineTool({
    name: 'renewable_integration_optimizer',
    description: 'Optimize renewable energy (solar and wind) integration into the power grid. Assesses grid flexibility, calculates curtailment, recommends storage sizing and demand response strategies, and evaluates grid stability for high renewable penetration scenarios.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { solar_capacity_mw (number), wind_capacity_mw (number), current_grid_load_mw (number), grid_flexibility (low/medium/high), storage_mwh (number), curtailment_pct (number), interconnection_capacity_mw (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: RenewableIntegrationInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeRenewableIntegration(input, rng)
      return formatRenewableIntegrationReport(result)
    }
  }))

  // Tool 3: Energy Trading Strategy
  tools.register(defineTool({
    name: 'energy_trading_strategy',
    description: 'Develop comprehensive energy trading strategies for day-ahead and real-time electricity markets. Generates buy/sell recommendations, position sizing, risk analytics (VaR, Sharpe ratio), hedging strategies, and market outlook assessments.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { market (string), delivery_date (string), current_portfolio_mwh (number), forecast_demand_mwh (number), price_forecast (number[]), risk_appetite (conservative/moderate/aggressive), carbon_price (number), renewable_certificate_price (number), regulation_requirement_pct (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: EnergyTradingInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeEnergyTrading(input, rng)
      return formatEnergyTradingReport(result)
    }
  }))

  // Tool 4: Battery Management Scheduler
  tools.register(defineTool({
    name: 'battery_management_scheduler',
    description: 'Optimizes battery charge/discharge schedules for grid services (frequency response, peak shaving, load shifting, arbitrage). Maximizes revenue while managing degradation costs and cycle life constraints.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { battery_capacity_mwh (number), current_soc_pct (number), charge_rate_mw (number), discharge_rate_mw (number), efficiency_pct (number), cycle_limit (int), current_cycles (int), electricity_prices (number[]), grid_services (string[]), operating_date (string) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: BatterySchedulerInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeBatteryScheduler(input, rng)
      return formatBatterySchedulerReport(result)
    }
  }))

  // Tool 5: Carbon Capture Optimizer
  tools.register(defineTool({
    name: 'carbon_capture_optimizer',
    description: 'Optimizes carbon capture and storage (CCS) system operations for power plants. Evaluates capture rates, parasitic loads, solvent performance, compliance status, and identifies optimization opportunities with cost-benefit analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { plant_type (coal/gas/biomass/waste), fuel_input_mw (number), capture_rate_target_pct (number), co2_captured_tons (number), co2_emitted_tons (number), electricity_parasitic_pct (number), solvent_type (string), regeneration_energy_gj_per_ton (number), co2_storage_capacity_tons (number), carbon_price (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: CarbonCaptureInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeCarbonCapture(input, rng)
      return formatCarbonCaptureReport(result)
    }
  }))

  // Tool 6: Power Quality Monitor
  tools.register(defineTool({
    name: 'power_quality_monitor',
    description: 'Comprehensive power quality analysis including voltage THD, harmonic spectrum, voltage unbalance, flicker severity, and power factor. Assesses compliance per IEEE 519-2022 / IEC 61000-3-6 and recommends mitigation measures.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { voltage_kv (number), frequency_hz (number), thd_voltage_pct (number), thd_current_pct (number), voltage_unbalance_pct (number), flicker_pst (number), harmonic_spectrum (number[]), power_factor (number), load_type (industrial/commercial/residential/mixed), measurement_duration_hours (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: PowerQualityInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzePowerQuality(input, rng)
      return formatPowerQualityReport(result)
    }
  }))

  // Tool 7: Microgrid Islanding Controller
  tools.register(defineTool({
    name: 'microgrid_islanding_controller',
    description: 'Controls microgrid islanding operations including PCC breaker management, load shedding, generation control, frequency/voltage regulation, and reconnection sequencing. Assesses island stability and critical load serving capability.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { microgrid_id (string), main_grid_frequency_hz (number), main_grid_voltage_kv (number), microgrid_generation_mw (number), microgrid_load_mw (number), pcc_breaker_status (closed/open), islanding_detected (boolean), distributed_resources: [{ type, capacity_mw, status }], critical_load_mw (number), transfer_time_ms (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: MicrogridIslandingInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeMicrogridIslanding(input, rng)
      return formatMicrogridIslandingReport(result)
    }
  }))

  // Tool 8: Energy Storage Sizing
  tools.register(defineTool({
    name: 'energy_storage_sizing',
    description: 'Sizes battery energy storage systems (BESS) for grid applications including peak shaving, load shifting, renewable firming, frequency regulation. Recommends optimal technology (Li-ion, flow, CAES, pumped hydro), calculates CAPEX/OPEX, LCOE, financial metrics (IRR, NPV, payback).',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { application (peak_shaving/load_shifting/renewable_firming/frequency_regulation/backup_power), peak_load_mw (number), daily_energy_mwh (number), renewable_capacity_mw (number), required_duration_hours (number), target_availability_pct (number), grid_connection_mw (number), capital_budget (number), electricity_price (number) }'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: StorageSizingInput = JSON.parse(args.input_data)
      const rng = new SeededRandom(SeededRandom.hashStr(args.input_data))
      const result = analyzeStorageSizing(input, rng)
      return formatStorageSizingReport(result)
    }
  }))

  console.log('[dsh-tool-energygrid] Loaded v' + VERSION + ' - Smart Grid & Energy Management with 8 tools')
  console.log('  Tools: grid_demand_forecaster, renewable_integration_optimizer, energy_trading_strategy, battery_management_scheduler, carbon_capture_optimizer, power_quality_monitor, microgrid_islanding_controller, energy_storage_sizing')
}
