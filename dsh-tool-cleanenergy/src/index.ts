/**
 * DSH Clean Energy & Climate Tech Plugin v0.1.0
 * 清洁能源与气候科技工具集 for DeepSeek Harness
 *
 * 2026: Clean energy investment $1.7T; climate tech $70B+.
 *
 * 工具清单:
 * 1. solar_site_selector       — 光伏选址分析（辐照度、地形、并网距离）
 * 2. wind_farm_optimizer       — 风电场优化（风资源、尾流、机组布局）
 * 3. carbon_capture_analyzer   — 碳捕集分析（技术路线、成本、封存潜力）
 * 4. green_hydrogen_economist  — 绿氢经济性（电解槽、LCOH、应用场景）
 * 5. battery_storage_optimizer — 储能优化（容量配置、调度策略、经济性）
 * 6. microgrid_designer        — 微电网设计（源网荷储、离网/并网）
 * 7. energy_efficiency_auditor — 能效审计（能耗基线、节能潜力、ROI）
 * 8. green_bond_validator      — 绿色债券验证（资金用途、环境效益、合规）
 *
 * @module dsh-tool-cleanenergy | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cleanenergy'
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

// --- Tool 1: Solar Site Selector ---
export interface SolarSiteInput {
  location: string
  area_hectares: number
  grid_distance_km: number
  terrain_type: 'flat' | 'hilly' | 'mountainous' | 'desert' | 'rooftop'
  target_capacity_mw: number
}

export interface SolarResourceAssessment {
  ghi_kwh_m2_day: number
  dni_kwh_m2_day: number
  peak_sun_hours: number
  capacity_factor_pct: number
  annual_yield_gwh: number
}

export interface SolarSiteResult {
  location: string
  resource: SolarResourceAssessment
  suitable_area_pct: number
  grid_connection_score: number
  land_use_score: number
  environmental_score: number
  overall_score: number
  recommendation: string
  estimated_capex_musd: number
  estimated_lcoe_usd_mwh: number
}

// --- Tool 2: Wind Farm Optimizer ---
export interface WindFarmInput {
  location: string
  area_km2: number
  target_capacity_mw: number
  turbine_model: string
  hub_height_m: number
  terrain_type: 'onshore' | 'offshore' | 'coastal'
}

export interface WindResourceAssessment {
  mean_wind_speed_ms: number
  wind_power_density_w_m2: number
  weibull_k: number
  capacity_factor_pct: number
  annual_yield_gwh: number
  wake_loss_pct: number
}

export interface TurbineLayout {
  turbine_count: number
  spacing_diameters: number
  array_efficiency_pct: number
}

export interface WindFarmResult {
  location: string
  resource: WindResourceAssessment
  layout: TurbineLayout
  overall_score: number
  recommendation: string
  estimated_capex_musd: number
  estimated_lcoe_usd_mwh: number
  co2_avoided_kt_year: number
}

// --- Tool 3: Carbon Capture Analyzer ---
export interface CarbonCaptureInput {
  facility_type: 'power_plant' | 'cement' | 'steel' | 'chemical' | 'dac'
  emission_rate_tonnes_year: number
  capture_technology: 'post_combustion' | 'pre_combustion' | 'oxy_fuel' | 'direct_air'
  storage_type: 'saline_aquifer' | 'depleted_oil_gas' | 'basalt' | 'utilization'
  project_duration_years: number
}

export interface CapturePerformance {
  capture_rate_pct: number
  capture_capacity_mt_year: number
  energy_penalty_pct: number
  capture_cost_usd_tonne: number
  storage_cost_usd_tonne: number
  total_cost_usd_tonne: number
}

export interface CarbonCaptureResult {
  facility_type: string
  performance: CapturePerformance
  total_co2_captured_mt: number
  total_investment_musd: number
  levelized_cost_usd_tonne: number
  storage_capacity_adequate: boolean
  monitoring_score: number
  recommendation: string
  sdgs: string[]
}

// --- Tool 4: Green Hydrogen Economist ---
export interface GreenHydrogenInput {
  electrolyzer_type: 'alkaline' | 'pem' | 'soec'
  capacity_mw: number
  electricity_source: 'solar' | 'wind' | 'hybrid' | 'grid'
  electricity_cost_usd_mwh: number
  water_cost_usd_m3: number
  target_application: 'ammonia' | 'refining' | 'steel' | 'transport' | 'power'
  project_lifetime_years: number
}

export interface HydrogenEconomics {
  lcoh_usd_kg: number
  electrolyzer_efficiency_pct: number
  specific_consumption_kwh_kg: number
  water_consumption_l_kg: number
  annual_production_tonnes: number
  capex_musd: number
  opex_musd_year: number
  payback_years: number
  npv_musd: number
  irr_pct: number
}

export interface GreenHydrogenResult {
  electrolyzer_type: string
  economics: HydrogenEconomics
  cost_breakdown: { capex_pct: number; electricity_pct: number; water_pct: number; opex_pct: number }
  competitiveness_vs_grey: number
  carbon_intensity_kg_co2_kg_h2: number
  recommendation: string
  market_readiness: string
}

// --- Tool 5: Battery Storage Optimizer ---
export interface BatteryStorageInput {
  application: 'peak_shaving' | 'frequency_regulation' | 'renewable_integration' | 'backup_power' | 'arbitrage'
  battery_type: 'lfp' | 'nmc' | 'na-ion' | 'flow'
  power_mw: number
  duration_hours: number
  cycle_requirements_per_day: number
  electricity_buy_price_usd_mwh: number
  electricity_sell_price_usd_mwh: number
  project_lifetime_years: number
}

export interface StoragePerformance {
  round_trip_efficiency_pct: number
  cycle_life: number
  dod_pct: number
  annual_throughput_mwh: number
  degradation_pct_year: number
  eol_capacity_pct: number
}

export interface StorageEconomics {
  capex_musd: number
  annual_revenue_musd: number
  annual_opex_musd: number
  payback_years: number
  npv_musd: number
  irr_pct: number
  lcos_usd_mwh: number
}

export interface BatteryStorageResult {
  application: string
  battery_type: string
  energy_capacity_mwh: number
  performance: StoragePerformance
  economics: StorageEconomics
  optimal_dispatch: string
  recommendation: string
  safety_score: number
}

// --- Tool 6: Microgrid Designer ---
export interface MicrogridInput {
  load_type: 'residential' | 'commercial' | 'industrial' | 'remote_community' | 'military'
  peak_load_mw: number
  annual_demand_mwh: number
  mode: 'grid_connected' | 'island' | 'hybrid'
  solar_potential: 'low' | 'medium' | 'high'
  wind_potential: 'low' | 'medium' | 'high'
  storage_required: boolean
  reliability_target_pct: number
}

export interface MicrogridComponent {
  solar_mw: number
  wind_mw: number
  battery_mwh: number
  diesel_backup_mw: number
  inverter_mw: number
}

export interface MicrogridPerformance {
  renewable_fraction_pct: number
  reliability_pct: number
  lcoe_usd_mwh: number
  co2_reduction_pct: number
  payback_years: number
  npv_musd: number
}

export interface MicrogridResult {
  load_type: string
  mode: string
  components: MicrogridComponent
  performance: MicrogridPerformance
  control_strategy: string
  recommendation: string
  resilience_score: number
}

// --- Tool 7: Energy Efficiency Auditor ---
export interface EnergyAuditInput {
  building_type: 'office' | 'hospital' | 'school' | 'factory' | 'data_center' | 'retail'
  floor_area_m2: number
  annual_consumption_kwh: number
  hvac_system: 'central' | 'split' | 'vrf' | 'geothermal'
  lighting_type: 'led' | 'fluorescent' | 'mixed'
  insulation_level: 'poor' | 'average' | 'good'
  occupancy_hours_per_day: number
}

export interface ConsumptionBreakdown {
  hvac_pct: number
  lighting_pct: number
  equipment_pct: number
  hot_water_pct: number
  other_pct: number
}

export interface SavingMeasure {
  measure: string
  saving_kwh_year: number
  saving_pct: number
  investment_usd: number
  payback_years: number
}

export interface EnergyAuditResult {
  building_type: string
  eui_kwh_m2_year: number
  benchmark_eui: number
  breakdown: ConsumptionBreakdown
  saving_measures: SavingMeasure[]
  total_saving_potential_pct: number
  total_investment_usd: number
  co2_reduction_tonnes_year: number
  rating: string
  recommendation: string
}

// --- Tool 8: Green Bond Validator ---
export interface GreenBondInput {
  issuer: string
  bond_type: 'use_of_proceeds' | 'project_revenue' | 'securitized' | 'sustainability_linked'
  principal_usd_musd: number
  use_of_proceeds: string[]
  framework_standard: 'icma_gbp' | 'cbi' | 'eu_taxonomy' | 'climate_bonds'
  second_party_opinion: boolean
  reporting_frequency: 'annual' | 'semi_annual' | 'quarterly'
}

export interface ProceedsAllocation {
  category: string
  allocated_pct: number
  environmental_benefit: string
  kpi: string
}

export interface GreenBondValidation {
  framework_compliant: boolean
  use_of_proceeds_score: number
  management_score: number
  reporting_score: number
  overall_green_score: number
  estimated_co2_avoidance_kt_year: number
  impact_metrics: string[]
}

export interface GreenBondResult {
  issuer: string
  bond_type: string
  principal_usd_musd: number
  allocation: ProceedsAllocation[]
  validation: GreenBondValidation
  recommendation: string
  risk_level: string
  market_premium_estimate_bps: number
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Solar Site Selector ---
function analyzeSolarSite(input: SolarSiteInput): SolarSiteResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const ghiBase: Record<string, number> = { flat: 4.5, hilly: 4.0, mountainous: 3.5, desert: 6.0, rooftop: 4.2 }
  const ghi = ghiBase[input.terrain_type] || 4.0
  const dni = ghi * rng.nextFloat(0.55, 0.75)
  const peakSunHours = ghi
  const capacityFactor = (peakSunHours / 24) * rng.nextFloat(0.85, 0.95)
  const annualYield = input.target_capacity_mw * capacityFactor * 8760 / 1000

  const suitableAreaPct = input.terrain_type === 'desert' ? rng.nextFloat(0.85, 0.98)
    : input.terrain_type === 'flat' ? rng.nextFloat(0.75, 0.92)
    : input.terrain_type === 'rooftop' ? rng.nextFloat(0.6, 0.85)
    : rng.nextFloat(0.4, 0.75)

  const gridScore = input.grid_distance_km < 5 ? rng.nextFloat(0.85, 0.98)
    : input.grid_distance_km < 20 ? rng.nextFloat(0.6, 0.85)
    : rng.nextFloat(0.3, 0.6)

  const landUseScore = input.terrain_type === 'desert' || input.terrain_type === 'rooftop'
    ? rng.nextFloat(0.85, 0.98) : rng.nextFloat(0.5, 0.8)

  const envScore = rng.nextFloat(0.6, 0.95)
  const overallScore = Math.round((capacityFactor * 25 + suitableAreaPct * 20 + gridScore * 20 + landUseScore * 15 + envScore * 20) * 100) / 100

  const capexPerMW: Record<string, number> = { flat: 0.7, hilly: 0.9, mountainous: 1.2, desert: 0.65, rooftop: 0.85 }
  const capex = input.target_capacity_mw * (capexPerMW[input.terrain_type] || 0.8)
  const lcoe = Math.round((capex * 1000000 * 0.07 + input.target_capacity_mw * 8760 * capacityFactor * 5) / (input.target_capacity_mw * 8760 * capacityFactor) * 100) / 100

  const recommendation = overallScore > 80 ? '强烈推荐：资源优良，经济可行'
    : overallScore > 60 ? '推荐：条件良好，建议推进'
    : overallScore > 40 ? '谨慎推荐：需进一步优化设计'
    : '不推荐：条件不足'

  return {
    location: input.location,
    resource: {
      ghi_kwh_m2_day: Math.round(ghi * 100) / 100,
      dni_kwh_m2_day: Math.round(dni * 100) / 100,
      peak_sun_hours: Math.round(peakSunHours * 100) / 100,
      capacity_factor_pct: Math.round(capacityFactor * 100 * 100) / 100,
      annual_yield_gwh: Math.round(annualYield * 100) / 100,
    },
    suitable_area_pct: Math.round(suitableAreaPct * 100 * 100) / 100,
    grid_connection_score: Math.round(gridScore * 100) / 100,
    land_use_score: Math.round(landUseScore * 100) / 100,
    environmental_score: Math.round(envScore * 100) / 100,
    overall_score: overallScore,
    recommendation,
    estimated_capex_musd: Math.round(capex * 100) / 100,
    estimated_lcoe_usd_mwh: lcoe,
  }
}

// --- Tool 2: Wind Farm Optimizer ---
function analyzeWindFarm(input: WindFarmInput): WindFarmResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const baseWind: Record<string, number> = { onshore: 6.5, offshore: 8.5, coastal: 7.5 }
  const meanWind = (baseWind[input.terrain_type] || 7.0) * rng.nextFloat(0.85, 1.15)
  const powerDensity = 0.5 * 1.225 * Math.pow(meanWind, 3)
  const weibK = rng.nextFloat(1.8, 2.5)
  const capacityFactor = Math.min(rng.nextFloat(0.25, 0.55), (meanWind / 12) * 0.9)
  const annualYield = input.target_capacity_mw * capacityFactor * 8760 / 1000
  const wakeLoss = rng.nextFloat(0.05, 0.15)

  const turbineRating = input.turbine_model.includes('5') ? 5 : input.turbine_model.includes('3') ? 3 : 4
  const turbineCount = Math.round(input.target_capacity_mw / turbineRating)
  const spacing = rng.nextFloat(5, 8)
  const arrayEff = Math.max(0.7, 1 - wakeLoss)

  const overallScore = Math.round((capacityFactor * 30 + (meanWind / 12) * 25 + arrayEff * 20 + (input.terrain_type === 'offshore' ? 15 : 10) + 10) * 100) / 100

  const capexPerMW: Record<string, number> = { onshore: 1.3, offshore: 3.5, coastal: 2.0 }
  const capex = input.target_capacity_mw * (capexPerMW[input.terrain_type] || 1.5)
  const lcoe = Math.round((capex * 1000000 * 0.07 + input.target_capacity_mw * 8760 * capacityFactor * 8) / (input.target_capacity_mw * 8760 * capacityFactor) * 100) / 100
  const co2Avoided = Math.round(annualYield * 0.4 * 100) / 100

  const recommendation = overallScore > 75 ? '强烈推荐：风资源优异'
    : overallScore > 55 ? '推荐：风资源良好'
    : overallScore > 35 ? '谨慎推荐：需优化布局'
    : '不推荐：风资源不足'

  return {
    location: input.location,
    resource: {
      mean_wind_speed_ms: Math.round(meanWind * 100) / 100,
      wind_power_density_w_m2: Math.round(powerDensity * 100) / 100,
      weibull_k: Math.round(weibK * 100) / 100,
      capacity_factor_pct: Math.round(capacityFactor * 100 * 100) / 100,
      annual_yield_gwh: Math.round(annualYield * 100) / 100,
      wake_loss_pct: Math.round(wakeLoss * 100 * 100) / 100,
    },
    layout: {
      turbine_count: turbineCount,
      spacing_diameters: Math.round(spacing * 100) / 100,
      array_efficiency_pct: Math.round(arrayEff * 100 * 100) / 100,
    },
    overall_score: overallScore,
    recommendation,
    estimated_capex_musd: Math.round(capex * 100) / 100,
    estimated_lcoe_usd_mwh: lcoe,
    co2_avoided_kt_year: co2Avoided,
  }
}

// --- Tool 3: Carbon Capture Analyzer ---
function analyzeCarbonCapture(input: CarbonCaptureInput): CarbonCaptureResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const captureRate: Record<string, number> = { post_combustion: 0.9, pre_combustion: 0.85, oxy_fuel: 0.95, direct_air: 0.8 }
  const rate = captureRate[input.capture_technology] || 0.85
  const captureCapacity = input.emission_rate_tonnes_year * rate / 1000000
  const energyPenalty: Record<string, number> = { post_combustion: 25, pre_combustion: 18, oxy_fuel: 20, direct_air: 35 }
  const ePenalty = energyPenalty[input.capture_technology] || 25

  const captureCost: Record<string, number> = { power_plant: 50, cement: 70, steel: 80, chemical: 60, dac: 250 }
  const cCost = captureCost[input.facility_type] || 60
  const storageCost: Record<string, number> = { saline_aquifer: 10, depleted_oil_gas: 15, basalt: 20, utilization: 8 }
  const sCost = storageCost[input.storage_type] || 12
  const totalCost = cCost * rng.nextFloat(0.85, 1.15) + sCost

  const totalCaptured = captureCapacity * input.project_duration_years
  const totalInvestment = totalCaptured * totalCost / 1000
  const lcoe = Math.round(totalCost * rng.nextFloat(0.9, 1.1) * 100) / 100

  const storageAdequate = input.storage_type !== 'utilization' || captureCapacity < 5
  const monitoringScore = input.storage_type === 'saline_aquifer' ? rng.nextFloat(0.7, 0.9)
    : input.storage_type === 'basalt' ? rng.nextFloat(0.6, 0.8)
    : rng.nextFloat(0.75, 0.95)

  const overallViable = totalCost < 100 && rate > 0.8
  const recommendation = overallViable ? '技术可行：建议推进示范项目'
    : totalCost < 150 ? '中等可行：需政策支持与成本优化'
    : '挑战较大：等待技术突破或碳价上升'

  return {
    facility_type: input.facility_type,
    performance: {
      capture_rate_pct: Math.round(rate * 100 * 100) / 100,
      capture_capacity_mt_year: Math.round(captureCapacity * 10000) / 10000,
      energy_penalty_pct: ePenalty,
      capture_cost_usd_tonne: Math.round(cCost * 100) / 100,
      storage_cost_usd_tonne: sCost,
      total_cost_usd_tonne: Math.round(totalCost * 100) / 100,
    },
    total_co2_captured_mt: Math.round(totalCaptured * 100) / 100,
    total_investment_musd: Math.round(totalInvestment * 100) / 100,
    levelized_cost_usd_tonne: lcoe,
    storage_capacity_adequate: storageAdequate,
    monitoring_score: Math.round(monitoringScore * 100) / 100,
    recommendation,
    sdgs: ['SDG 13', 'SDG 9', 'SDG 7'],
  }
}

// --- Tool 4: Green Hydrogen Economist ---
function analyzeGreenHydrogen(input: GreenHydrogenInput): GreenHydrogenResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const efficiency: Record<string, number> = { alkaline: 65, pem: 70, soec: 80 }
  const eff = efficiency[input.electrolyzer_type] || 65
  const specConsumption = 100 / eff * 50
  const waterConsumption = rng.nextFloat(9, 15)

  const capacityFactor = input.electricity_source === 'wind' ? rng.nextFloat(0.35, 0.5)
    : input.electricity_source === 'solar' ? rng.nextFloat(0.2, 0.35)
    : input.electricity_source === 'hybrid' ? rng.nextFloat(0.4, 0.6)
    : rng.nextFloat(0.5, 0.8)

  const annualProduction = input.capacity_mw * capacityFactor * 8760 / (specConsumption / 1000)
  const capexPerKW: Record<string, number> = { alkaline: 800, pem: 1200, soec: 2000 }
  const capex = input.capacity_mw * 1000 * (capexPerKW[input.electrolyzer_type] || 1000) / 1000000
  const opex = capex * rng.nextFloat(0.02, 0.05)

  const electricityCost = annualProduction * specConsumption * input.electricity_cost_usd_mwh / 1000 / 1000000
  const waterCost = annualProduction * waterConsumption / 1000 * input.water_cost_usd_m3 / 1000000
  const totalAnnualCost = electricityCost + waterCost + opex
  const lcoh = Math.round((totalAnnualCost * 1000000 / annualProduction) * 100) / 100

  const greyH2Cost = 1.5
  const competitiveness = Math.round((greyH2Cost / lcoh) * 100) / 100
  const payback = Math.round((capex / (annualProduction * (greyH2Cost - lcoh) / 1000000 + 0.001)) * 10) / 10
  const npv = Math.round((annualProduction * (greyH2Cost - lcoh) / 1000000 * input.project_lifetime_years * 0.6 - capex) * 100) / 100
  const irr = Math.round(rng.nextFloat(5, 18) * 100) / 100

  const carbonIntensity = input.electricity_source === 'grid' ? rng.nextFloat(8, 12) : rng.nextFloat(0.5, 2)

  const recommendation = lcoh < 3 ? '高度可行：绿氢具备经济竞争力'
    : lcoh < 5 ? '可行：需规模效应或政策补贴'
    : '挑战较大：等待电价下降或技术进步'

  const marketReadiness = input.electrolyzer_type === 'alkaline' ? '商业化成熟'
    : input.electrolyzer_type === 'pem' ? '商业化初期'
    : '示范阶段'

  return {
    electrolyzer_type: input.electrolyzer_type,
    economics: {
      lcoh_usd_kg: lcoh,
      electrolyzer_efficiency_pct: eff,
      specific_consumption_kwh_kg: Math.round(specConsumption * 100) / 100,
      water_consumption_l_kg: Math.round(waterConsumption * 100) / 100,
      annual_production_tonnes: Math.round(annualProduction),
      capex_musd: Math.round(capex * 100) / 100,
      opex_musd_year: Math.round(opex * 100) / 100,
      payback_years: payback > 0 && payback < 50 ? payback : 99,
      npv_musd: npv,
      irr_pct: irr,
    },
    cost_breakdown: {
      capex_pct: Math.round(capex / (capex + totalAnnualCost * input.project_lifetime_years) * 100 * 100) / 100,
      electricity_pct: Math.round(electricityCost / totalAnnualCost * 100 * 100) / 100,
      water_pct: Math.round(waterCost / totalAnnualCost * 100 * 100) / 100,
      opex_pct: Math.round(opex / totalAnnualCost * 100 * 100) / 100,
    },
    competitiveness_vs_grey: competitiveness,
    carbon_intensity_kg_co2_kg_h2: Math.round(carbonIntensity * 100) / 100,
    recommendation,
    market_readiness: marketReadiness,
  }
}

// --- Tool 5: Battery Storage Optimizer ---
function analyzeBatteryStorage(input: BatteryStorageInput): BatteryStorageResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const rte: Record<string, number> = { lfp: 92, nmc: 90, 'na-ion': 85, flow: 75 }
  const roundTripEfficiency = rte[input.battery_type] || 90
  const cycleLife: Record<string, number> = { lfp: 6000, nmc: 4000, 'na-ion': 3000, flow: 15000 }
  const cl = cycleLife[input.battery_type] || 5000
  const dod = input.battery_type === 'lfp' ? 90 : input.battery_type === 'nmc' ? 85 : 80
  const energyCapacity = input.power_mw * input.duration_hours
  const annualThroughput = energyCapacity * input.cycle_requirements_per_day * 365 * (roundTripEfficiency / 100)
  const degradation = input.battery_type === 'lfp' ? 1.5 : input.battery_type === 'flow' ? 0.5 : 2.5
  const eolCapacity = 80

  const capexPerKwh: Record<string, number> = { lfp: 150, nmc: 200, 'na-ion': 100, flow: 300 }
  const capex = energyCapacity * 1000 * (capexPerKwh[input.battery_type] || 180) / 1000000
  const priceSpread = input.electricity_sell_price_usd_mwh - input.electricity_buy_price_usd_mwh
  const annualRevenue = input.application === 'arbitrage'
    ? annualThroughput * priceSpread / 1000 / 1000000
    : input.application === 'frequency_regulation'
    ? input.power_mw * 8760 * 0.1 * 15 / 1000000
    : annualThroughput * priceSpread * 0.5 / 1000 / 1000000
  const annualOpex = capex * rng.nextFloat(0.01, 0.03)
  const netAnnual = annualRevenue - annualOpex
  const payback = netAnnual > 0 ? Math.round(capex / netAnnual * 10) / 10 : 99
  const npv = Math.round((netAnnual * input.project_lifetime_years * 0.7 - capex) * 100) / 100
  const irr = Math.round(rng.nextFloat(6, 20) * 100) / 100
  const lcos = Math.round((capex * 1000000 / (annualThroughput * input.project_lifetime_years) + annualOpex * 1000000 / annualThroughput) * 100) / 100

  const optimalDispatch = input.application === 'arbitrage'
    ? '谷充峰放：利用价差套利'
    : input.application === 'frequency_regulation'
    ? '快速响应：AGC信号跟踪'
    : input.application === 'peak_shaving'
    ? '削峰填谷：降低需量电费'
    : '平滑输出：减少可再生能源波动'

  const recommendation = payback < 8 ? '经济可行：投资回报良好'
    : payback < 15 ? '边际可行：需政策支持'
    : '经济性不足：等待成本下降'

  const safetyScore = input.battery_type === 'lfp' ? rng.nextFloat(0.9, 0.98)
    : input.battery_type === 'flow' ? rng.nextFloat(0.92, 0.99)
    : rng.nextFloat(0.75, 0.9)

  return {
    application: input.application,
    battery_type: input.battery_type,
    energy_capacity_mwh: energyCapacity,
    performance: {
      round_trip_efficiency_pct: roundTripEfficiency,
      cycle_life: cl,
      dod_pct: dod,
      annual_throughput_mwh: Math.round(annualThroughput),
      degradation_pct_year: degradation,
      eol_capacity_pct: eolCapacity,
    },
    economics: {
      capex_musd: Math.round(capex * 100) / 100,
      annual_revenue_musd: Math.round(annualRevenue * 100) / 100,
      annual_opex_musd: Math.round(annualOpex * 100) / 100,
      payback_years: payback,
      npv_musd: npv,
      irr_pct: irr,
      lcos_usd_mwh: lcos,
    },
    optimal_dispatch: optimalDispatch,
    recommendation,
    safety_score: Math.round(safetyScore * 100) / 100,
  }
}

// --- Tool 6: Microgrid Designer ---
function analyzeMicrogrid(input: MicrogridInput): MicrogridResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const solarCapFactor: Record<string, number> = { low: 0.15, medium: 0.2, high: 0.25 }
  const windCapFactor: Record<string, number> = { low: 0.2, medium: 0.3, high: 0.4 }

  const solarMW = input.solar_potential === 'high' ? input.peak_load_mw * rng.nextFloat(0.4, 0.7)
    : input.solar_potential === 'medium' ? input.peak_load_mw * rng.nextFloat(0.2, 0.4)
    : input.peak_load_mw * rng.nextFloat(0.05, 0.2)

  const windMW = input.wind_potential === 'high' ? input.peak_load_mw * rng.nextFloat(0.3, 0.6)
    : input.wind_potential === 'medium' ? input.peak_load_mw * rng.nextFloat(0.1, 0.3)
    : input.peak_load_mw * rng.nextFloat(0, 0.1)

  const batteryMWh = input.storage_required ? input.peak_load_mw * rng.nextFloat(1, 4) : 0
  const dieselMW = input.mode === 'island' ? input.peak_load_mw * rng.nextFloat(0.3, 0.6)
    : input.mode === 'hybrid' ? input.peak_load_mw * rng.nextFloat(0.1, 0.3)
    : 0

  const solarYield = solarMW * solarCapFactor[input.solar_potential] * 8760
  const windYield = windMW * windCapFactor[input.wind_potential] * 8760
  const renewableYield = solarYield + windYield
  const renewableFraction = Math.min(renewableYield / input.annual_demand_mwh, 1)
  const reliability = Math.min(input.reliability_target_pct / 100 + rng.nextFloat(-0.02, 0.05), 0.999)
  const lcoe = Math.round(rng.nextFloat(0.08, 0.25) * 1000) / 1000
  const co2Reduction = Math.round(renewableFraction * rng.nextFloat(0.6, 0.9) * 100 * 100) / 100

  const totalCapex = solarMW * 0.8 + windMW * 1.5 + batteryMWh * 0.2 + dieselMW * 0.3
  const annualSaving = input.annual_demand_mwh * lcoe * renewableFraction * 0.5
  const payback = annualSaving > 0 ? Math.round(totalCapex / annualSaving * 10) / 10 : 99
  const npv = Math.round((annualSaving * 15 * 0.6 - totalCapex) * 100) / 100

  const controlStrategy = input.mode === 'island' ? '主从控制：储能主控+可再生能源MPPT'
    : input.mode === 'hybrid' ? '对等控制：VSG+下垂控制'
    : '并网优先：P/Q控制+无缝切换'

  const recommendation = renewableFraction > 0.6 ? '高比例可再生能源：设计优秀'
    : renewableFraction > 0.3 ? '中等比例：建议增加储能'
    : '低比例：需评估经济性'

  const resilienceScore = Math.round((reliability * 40 + renewableFraction * 30 + (batteryMWh > 0 ? 20 : 0) + (dieselMW > 0 ? 10 : 0)) * 100) / 100

  return {
    load_type: input.load_type,
    mode: input.mode,
    components: {
      solar_mw: Math.round(solarMW * 100) / 100,
      wind_mw: Math.round(windMW * 100) / 100,
      battery_mwh: Math.round(batteryMWh * 100) / 100,
      diesel_backup_mw: Math.round(dieselMW * 100) / 100,
      inverter_mw: Math.round(solarMW * 1.1 * 100) / 100,
    },
    performance: {
      renewable_fraction_pct: Math.round(renewableFraction * 100 * 100) / 100,
      reliability_pct: Math.round(reliability * 100 * 100) / 100,
      lcoe_usd_mwh: lcoe,
      co2_reduction_pct: co2Reduction,
      payback_years: payback,
      npv_musd: npv,
    },
    control_strategy: controlStrategy,
    recommendation,
    resilience_score: resilienceScore,
  }
}

// --- Tool 7: Energy Efficiency Auditor ---
function analyzeEnergyAudit(input: EnergyAuditInput): EnergyAuditResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const eui = input.annual_consumption_kwh / input.floor_area_m2
  const benchmarkEui: Record<string, number> = { office: 120, hospital: 250, school: 80, factory: 300, data_center: 1500, retail: 150 }
  const benchmark = benchmarkEui[input.building_type] || 150

  const hvacPct = input.hvac_system === 'geothermal' ? rng.nextFloat(0.2, 0.35)
    : input.hvac_system === 'vrf' ? rng.nextFloat(0.3, 0.4)
    : rng.nextFloat(0.35, 0.5)
  const lightingPct = input.lighting_type === 'led' ? rng.nextFloat(0.1, 0.15)
    : input.lighting_type === 'fluorescent' ? rng.nextFloat(0.2, 0.3)
    : rng.nextFloat(0.15, 0.25)
  const equipmentPct = rng.nextFloat(0.2, 0.35)
  const hotWaterPct = rng.nextFloat(0.05, 0.15)
  const otherPct = Math.max(0, 1 - hvacPct - lightingPct - equipmentPct - hotWaterPct)

  const measures: SavingMeasure[] = []

  if (input.lighting_type !== 'led') {
    const saving = input.annual_consumption_kwh * lightingPct * 0.5
    measures.push({
      measure: 'LED照明改造',
      saving_kwh_year: Math.round(saving),
      saving_pct: Math.round(lightingPct * 0.5 * 100 * 100) / 100,
      investment_usd: Math.round(input.floor_area_m2 * 15),
      payback_years: Math.round((input.floor_area_m2 * 15) / (saving * 0.1) * 10) / 10,
    })
  }

  if (input.hvac_system === 'central' || input.hvac_system === 'split') {
    const saving = input.annual_consumption_kwh * hvacPct * 0.25
    measures.push({
      measure: 'HVAC系统优化（变频+智能控制）',
      saving_kwh_year: Math.round(saving),
      saving_pct: Math.round(hvacPct * 0.25 * 100 * 100) / 100,
      investment_usd: Math.round(input.floor_area_m2 * 30),
      payback_years: Math.round((input.floor_area_m2 * 30) / (saving * 0.1) * 10) / 10,
    })
  }

  if (input.insulation_level === 'poor' || input.insulation_level === 'average') {
    const saving = input.annual_consumption_kwh * hvacPct * 0.15
    measures.push({
      measure: '建筑围护结构保温升级',
      saving_kwh_year: Math.round(saving),
      saving_pct: Math.round(hvacPct * 0.15 * 100 * 100) / 100,
      investment_usd: Math.round(input.floor_area_m2 * 50),
      payback_years: Math.round((input.floor_area_m2 * 50) / (saving * 0.1) * 10) / 10,
    })
  }

  const savingMeasureCount = rng.nextInt(1, 3)
  for (let i = 0; i < savingMeasureCount; i++) {
    const savingPct = rng.nextFloat(0.03, 0.12)
    const saving = input.annual_consumption_kwh * savingPct
    const measureNames = ['智能楼宇控制系统', '余热回收装置', '高效水泵与风机', '需求响应系统']
    measures.push({
      measure: measureNames[i % measureNames.length],
      saving_kwh_year: Math.round(saving),
      saving_pct: Math.round(savingPct * 100 * 100) / 100,
      investment_usd: Math.round(saving * rng.nextFloat(0.5, 2)),
      payback_years: Math.round(rng.nextFloat(2, 7) * 10) / 10,
    })
  }

  const totalSavingPct = measures.reduce((sum, m) => sum + m.saving_pct, 0)
  const totalInvestment = measures.reduce((sum, m) => sum + m.investment_usd, 0)
  const co2Reduction = Math.round(measures.reduce((sum, m) => sum + m.saving_kwh_year, 0) * 0.0005 * 100) / 100

  const ratio = eui / benchmark
  const rating = ratio < 0.7 ? 'A级（优秀）'
    : ratio < 0.9 ? 'B级（良好）'
    : ratio < 1.1 ? 'C级（达标）'
    : ratio < 1.3 ? 'D级（需改进）'
    : 'E级（高耗能）'

  const recommendation = totalSavingPct > 20 ? '节能潜力大：建议全面实施'
    : totalSavingPct > 10 ? '中等潜力：优先实施短回收期措施'
    : '节能空间有限：关注运维优化'

  return {
    building_type: input.building_type,
    eui_kwh_m2_year: Math.round(eui * 100) / 100,
    benchmark_eui: benchmark,
    breakdown: {
      hvac_pct: Math.round(hvacPct * 100 * 100) / 100,
      lighting_pct: Math.round(lightingPct * 100 * 100) / 100,
      equipment_pct: Math.round(equipmentPct * 100 * 100) / 100,
      hot_water_pct: Math.round(hotWaterPct * 100 * 100) / 100,
      other_pct: Math.round(otherPct * 100 * 100) / 100,
    },
    saving_measures: measures,
    total_saving_potential_pct: Math.round(totalSavingPct * 100) / 100,
    total_investment_usd: totalInvestment,
    co2_reduction_tonnes_year: co2Reduction,
    rating,
    recommendation,
  }
}

// --- Tool 8: Green Bond Validator ---
function analyzeGreenBond(input: GreenBondInput): GreenBondResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const categories = [
    { name: '可再生能源', pct: rng.nextFloat(30, 50), benefit: '年减排CO2', kpi: '装机容量MW' },
    { name: '清洁交通', pct: rng.nextFloat(15, 30), benefit: '减少燃油消耗', kpi: '电动车辆数' },
    { name: '节能建筑', pct: rng.nextFloat(10, 25), benefit: '降低建筑能耗', kpi: '认证建筑面积m2' },
    { name: '水资源管理', pct: rng.nextFloat(5, 15), benefit: '节水/水处理', kpi: '日处理量吨' },
  ]

  const totalPct = categories.reduce((s, c) => s + c.pct, 0)
  const allocation: ProceedsAllocation[] = categories.map(c => ({
    category: c.name,
    allocated_pct: Math.round(c.pct / totalPct * 100 * 100) / 100,
    environmental_benefit: c.benefit,
    kpi: c.kpi,
  }))

  const frameworkScore = input.framework_standard === 'icma_gbp' ? rng.nextFloat(0.85, 0.98)
    : input.framework_standard === 'eu_taxonomy' ? rng.nextFloat(0.8, 0.95)
    : input.framework_standard === 'climate_bonds' ? rng.nextFloat(0.82, 0.96)
    : rng.nextFloat(0.75, 0.92)

  const useOfProceedsScore = input.use_of_proceeds.length >= 3 ? rng.nextFloat(0.8, 0.98)
    : input.use_of_proceeds.length >= 2 ? rng.nextFloat(0.65, 0.85)
    : rng.nextFloat(0.4, 0.65)

  const managementScore = input.second_party_opinion ? rng.nextFloat(0.8, 0.98) : rng.nextFloat(0.5, 0.75)

  const reportingScore = input.reporting_frequency === 'quarterly' ? rng.nextFloat(0.85, 0.98)
    : input.reporting_frequency === 'semi_annual' ? rng.nextFloat(0.7, 0.9)
    : rng.nextFloat(0.55, 0.8)

  const overallGreen = Math.round((useOfProceedsScore * 30 + managementScore * 25 + reportingScore * 20 + frameworkScore * 25) * 100) / 100
  const frameworkCompliant = overallGreen > 60

  const co2Avoidance = Math.round(input.principal_usd_musd * rng.nextFloat(0.2, 0.8) * 100) / 100

  const impactMetrics = [
    '年减排CO2: ' + co2Avoidance + ' kt',
    '受益项目数: ' + rng.nextInt(5, 30) + ' 个',
    '绿色就业: ' + rng.nextInt(100, 2000) + ' 岗位',
  ]

  const recommendation = overallGreen > 80 ? '深绿：完全符合国际绿色债券标准'
    : overallGreen > 60 ? '中绿：基本合规，建议加强披露'
    : overallGreen > 40 ? '浅绿：需改进框架与报告'
    : '不符合：需重新设计资金用途'

  const riskLevel = overallGreen > 75 ? '低风险'
    : overallGreen > 55 ? '中等风险'
    : overallGreen > 35 ? '较高风险'
    : '高风险'

  const premiumEstimate = Math.round(rng.nextFloat(5, 30) * (overallGreen / 100) * 100) / 100

  return {
    issuer: input.issuer,
    bond_type: input.bond_type,
    principal_usd_musd: input.principal_usd_musd,
    allocation,
    validation: {
      framework_compliant: frameworkCompliant,
      use_of_proceeds_score: Math.round(useOfProceedsScore * 100) / 100,
      management_score: Math.round(managementScore * 100) / 100,
      reporting_score: Math.round(reportingScore * 100) / 100,
      overall_green_score: overallGreen,
      estimated_co2_avoidance_kt_year: co2Avoidance,
      impact_metrics: impactMetrics,
    },
    recommendation,
    risk_level: riskLevel,
    market_premium_estimate_bps: premiumEstimate,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

function formatSolarSiteReport(result: SolarSiteResult): string {
  const lines: string[] = []
  lines.push('## Solar Site Selection Report')
  lines.push('')
  lines.push('Location: ' + result.location)
  lines.push('Overall Score: ' + result.overall_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Solar Resource Assessment')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| GHI (kWh/m2/day) | ' + result.resource.ghi_kwh_m2_day + ' |')
  lines.push('| DNI (kWh/m2/day) | ' + result.resource.dni_kwh_m2_day + ' |')
  lines.push('| Peak Sun Hours | ' + result.resource.peak_sun_hours + ' |')
  lines.push('| Capacity Factor | ' + result.resource.capacity_factor_pct + '% |')
  lines.push('| Annual Yield | ' + result.resource.annual_yield_gwh + ' GWh |')
  lines.push('')
  lines.push('### Site Scores')
  lines.push('| Dimension | Score |')
  lines.push('|-----------|-------|')
  lines.push('| Suitable Area | ' + result.suitable_area_pct + '% |')
  lines.push('| Grid Connection | ' + result.grid_connection_score + ' |')
  lines.push('| Land Use | ' + result.land_use_score + ' |')
  lines.push('| Environmental | ' + result.environmental_score + ' |')
  lines.push('')
  lines.push('### Economics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Est. CAPEX | $' + result.estimated_capex_musd + 'M |')
  lines.push('| Est. LCOE | $' + result.estimated_lcoe_usd_mwh + '/MWh |')
  lines.push('')
  lines.push('---')
  lines.push('*Clean Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatWindFarmReport(result: WindFarmResult): string {
  const lines: string[] = []
  lines.push('## Wind Farm Optimization Report')
  lines.push('')
  lines.push('Location: ' + result.location)
  lines.push('Overall Score: ' + result.overall_score + ' / 100')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Wind Resource Assessment')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Mean Wind Speed | ' + result.resource.mean_wind_speed_ms + ' m/s |')
  lines.push('| Power Density | ' + result.resource.wind_power_density_w_m2 + ' W/m2 |')
  lines.push('| Weibull k | ' + result.resource.weibull_k + ' |')
  lines.push('| Capacity Factor | ' + result.resource.capacity_factor_pct + '% |')
  lines.push('| Annual Yield | ' + result.resource.annual_yield_gwh + ' GWh |')
  lines.push('| Wake Loss | ' + result.resource.wake_loss_pct + '% |')
  lines.push('')
  lines.push('### Turbine Layout')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Turbine Count | ' + result.layout.turbine_count + ' |')
  lines.push('| Spacing | ' + result.layout.spacing_diameters + ' D |')
  lines.push('| Array Efficiency | ' + result.layout.array_efficiency_pct + '% |')
  lines.push('')
  lines.push('### Economics & Impact')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Est. CAPEX | $' + result.estimated_capex_musd + 'M |')
  lines.push('| Est. LCOE | $' + result.estimated_lcoe_usd_mwh + '/MWh |')
  lines.push('| CO2 Avoided | ' + result.co2_avoided_kt_year + ' kt/year |')
  lines.push('')
  lines.push('---')
  lines.push('*Clean Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatCarbonCaptureReport(result: CarbonCaptureResult): string {
  const lines: string[] = []
  lines.push('## Carbon Capture Analysis Report')
  lines.push('')
  lines.push('Facility Type: ' + result.facility_type)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Capture Performance')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Capture Rate | ' + result.performance.capture_rate_pct + '% |')
  lines.push('| Capacity | ' + result.performance.capture_capacity_mt_year + ' Mt/year |')
  lines.push('| Energy Penalty | ' + result.performance.energy_penalty_pct + '% |')
  lines.push('| Capture Cost | $' + result.performance.capture_cost_usd_tonne + '/t |')
  lines.push('| Storage Cost | $' + result.performance.storage_cost_usd_tonne + '/t |')
  lines.push('| Total Cost | $' + result.performance.total_cost_usd_tonne + '/t |')
  lines.push('')
  lines.push('### Project Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total CO2 Captured | ' + result.total_co2_captured_mt + ' Mt |')
  lines.push('| Total Investment | $' + result.total_investment_musd + 'M |')
  lines.push('| Levelized Cost | $' + result.levelized_cost_usd_tonne + '/t |')
  lines.push('| Storage Adequate | ' + (result.storage_capacity_adequate ? 'Yes' : 'No') + ' |')
  lines.push('| Monitoring Score | ' + result.monitoring_score + ' |')
  lines.push('')
  lines.push('### SDGs: ' + result.sdgs.join(', '))
  lines.push('')
  lines.push('---')
  lines.push('*Clean Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatGreenHydrogenReport(result: GreenHydrogenResult): string {
  const lines: string[] = []
  lines.push('## Green Hydrogen Economic Analysis')
  lines.push('')
  lines.push('Electrolyzer Type: ' + result.electrolyzer_type)
  lines.push('Market Readiness: ' + result.market_readiness)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Economics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| LCOH | $' + result.economics.lcoh_usd_kg + '/kg |')
  lines.push('| Efficiency | ' + result.economics.electrolyzer_efficiency_pct + '% |')
  lines.push('| Specific Consumption | ' + result.economics.specific_consumption_kwh_kg + ' kWh/kg |')
  lines.push('| Water Consumption | ' + result.economics.water_consumption_l_kg + ' L/kg |')
  lines.push('| Annual Production | ' + result.economics.annual_production_tonnes + ' t |')
  lines.push('| CAPEX | $' + result.economics.capex_musd + 'M |')
  lines.push('| OPEX | $' + result.economics.opex_musd_year + 'M/year |')
  lines.push('| Payback | ' + result.economics.payback_years + ' years |')
  lines.push('| NPV | $' + result.economics.npv_musd + 'M |')
  lines.push('| IRR | ' + result.economics.irr_pct + '% |')
  lines.push('')
  lines.push('### Cost Breakdown')
  lines.push('| Component | Share |')
  lines.push('|-----------|-------|')
  lines.push('| CAPEX | ' + result.cost_breakdown.capex_pct + '% |')
  lines.push('| Electricity | ' + result.cost_breakdown.electricity_pct + '% |')
  lines.push('| Water | ' + result.cost_breakdown.water_pct + '% |')
  lines.push('| OPEX | ' + result.cost_breakdown.opex_pct + '% |')
  lines.push('')
  lines.push('### Competitiveness')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| vs Grey H2 | ' + result.competitiveness_vs_grey + 'x |')
  lines.push('| Carbon Intensity | ' + result.carbon_intensity_kg_co2_kg_h2 + ' kg CO2/kg H2 |')
  lines.push('')
  lines.push('---')
  lines.push('*Clean Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatBatteryStorageReport(result: BatteryStorageResult): string {
  const lines: string[] = []
  lines.push('## Battery Storage Optimization Report')
  lines.push('')
  lines.push('Application: ' + result.application)
  lines.push('Battery Type: ' + result.battery_type)
  lines.push('Energy Capacity: ' + result.energy_capacity_mwh + ' MWh')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Performance')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Round-trip Efficiency | ' + result.performance.round_trip_efficiency_pct + '% |')
  lines.push('| Cycle Life | ' + result.performance.cycle_life + ' cycles |')
  lines.push('| DoD | ' + result.performance.dod_pct + '% |')
  lines.push('| Annual Throughput | ' + result.performance.annual_throughput_mwh + ' MWh |')
  lines.push('| Degradation | ' + result.performance.degradation_pct_year + '%/year |')
  lines.push('| EOL Capacity | ' + result.performance.eol_capacity_pct + '% |')
  lines.push('')
  lines.push('### Economics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| CAPEX | $' + result.economics.capex_musd + 'M |')
  lines.push('| Annual Revenue | $' + result.economics.annual_revenue_musd + 'M |')
  lines.push('| Annual OPEX | $' + result.economics.annual_opex_musd + 'M |')
  lines.push('| Payback | ' + result.economics.payback_years + ' years |')
  lines.push('| NPV | $' + result.economics.npv_musd + 'M |')
  lines.push('| IRR | ' + result.economics.irr_pct + '% |')
  lines.push('| LCOS | $' + result.economics.lcos_usd_mwh + '/MWh |')
  lines.push('')
  lines.push('### Dispatch & Safety')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Optimal Dispatch | ' + result.optimal_dispatch + ' |')
  lines.push('| Safety Score | ' + result.safety_score + ' |')
  lines.push('')
  lines.push('---')
  lines.push('*Clean Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatMicrogridReport(result: MicrogridResult): string {
  const lines: string[] = []
  lines.push('## Microgrid Design Report')
  lines.push('')
  lines.push('Load Type: ' + result.load_type)
  lines.push('Mode: ' + result.mode)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### System Components')
  lines.push('| Component | Capacity |')
  lines.push('|-----------|----------|')
  lines.push('| Solar PV | ' + result.components.solar_mw + ' MW |')
  lines.push('| Wind | ' + result.components.wind_mw + ' MW |')
  lines.push('| Battery | ' + result.components.battery_mwh + ' MWh |')
  lines.push('| Diesel Backup | ' + result.components.diesel_backup_mw + ' MW |')
  lines.push('| Inverter | ' + result.components.inverter_mw + ' MW |')
  lines.push('')
  lines.push('### Performance')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Renewable Fraction | ' + result.performance.renewable_fraction_pct + '% |')
  lines.push('| Reliability | ' + result.performance.reliability_pct + '% |')
  lines.push('| LCOE | $' + result.performance.lcoe_usd_mwh + '/MWh |')
  lines.push('| CO2 Reduction | ' + result.performance.co2_reduction_pct + '% |')
  lines.push('| Payback | ' + result.performance.payback_years + ' years |')
  lines.push('| NPV | $' + result.performance.npv_musd + 'M |')
  lines.push('')
  lines.push('### Control & Resilience')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Control Strategy | ' + result.control_strategy + ' |')
  lines.push('| Resilience Score | ' + result.resilience_score + ' |')
  lines.push('')
  lines.push('---')
  lines.push('*Clean Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatEnergyAuditReport(result: EnergyAuditResult): string {
  const lines: string[] = []
  lines.push('## Energy Efficiency Audit Report')
  lines.push('')
  lines.push('Building Type: ' + result.building_type)
  lines.push('Energy Rating: ' + result.rating)
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('')
  lines.push('### Energy Use Intensity')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| EUI | ' + result.eui_kwh_m2_year + ' kWh/m2/year |')
  lines.push('| Benchmark | ' + result.benchmark_eui + ' kWh/m2/year |')
  lines.push('| Ratio | ' + Math.round(result.eui_kwh_m2_year / result.benchmark_eui * 100) + '% |')
  lines.push('')
  lines.push('### Consumption Breakdown')
  lines.push('| End Use | Share |')
  lines.push('|---------|-------|')
  lines.push('| HVAC | ' + result.breakdown.hvac_pct + '% |')
  lines.push('| Lighting | ' + result.breakdown.lighting_pct + '% |')
  lines.push('| Equipment | ' + result.breakdown.equipment_pct + '% |')
  lines.push('| Hot Water | ' + result.breakdown.hot_water_pct + '% |')
  lines.push('| Other | ' + result.breakdown.other_pct + '% |')
  lines.push('')
  lines.push('### Saving Measures')
  lines.push('| Measure | Saving (kWh/yr) | Saving % | Investment | Payback |')
  lines.push('|---------|-----------------|----------|------------|---------|')
  for (const m of result.saving_measures) {
    lines.push('| ' + m.measure + ' | ' + m.saving_kwh_year + ' | ' + m.saving_pct + '% | $' + m.investment_usd + ' | ' + m.payback_years + ' yr |')
  }
  lines.push('')
  lines.push('### Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Saving Potential | ' + result.total_saving_potential_pct + '% |')
  lines.push('| Total Investment | $' + result.total_investment_usd + ' |')
  lines.push('| CO2 Reduction | ' + result.co2_reduction_tonnes_year + ' t/year |')
  lines.push('')
  lines.push('---')
  lines.push('*Clean Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

function formatGreenBondReport(result: GreenBondResult): string {
  const lines: string[] = []
  lines.push('## Green Bond Validation Report')
  lines.push('')
  lines.push('Issuer: ' + result.issuer)
  lines.push('Bond Type: ' + result.bond_type)
  lines.push('Principal: $' + result.principal_usd_musd + 'M')
  lines.push('Recommendation: ' + result.recommendation)
  lines.push('Risk Level: ' + result.risk_level)
  lines.push('')
  lines.push('### Proceeds Allocation')
  lines.push('| Category | Allocated | Benefit | KPI |')
  lines.push('|----------|-----------|---------|-----|')
  for (const a of result.allocation) {
    lines.push('| ' + a.category + ' | ' + a.allocated_pct + '% | ' + a.environmental_benefit + ' | ' + a.kpi + ' |')
  }
  lines.push('')
  lines.push('### Validation Scores')
  lines.push('| Dimension | Score |')
  lines.push('|-----------|-------|')
  lines.push('| Framework Compliant | ' + (result.validation.framework_compliant ? 'Yes' : 'No') + ' |')
  lines.push('| Use of Proceeds | ' + result.validation.use_of_proceeds_score + ' |')
  lines.push('| Management | ' + result.validation.management_score + ' |')
  lines.push('| Reporting | ' + result.validation.reporting_score + ' |')
  lines.push('| Overall Green Score | ' + result.validation.overall_green_score + ' |')
  lines.push('')
  lines.push('### Impact Metrics')
  for (const m of result.validation.impact_metrics) {
    lines.push('- ' + m)
  }
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| CO2 Avoidance | ' + result.validation.estimated_co2_avoidance_kt_year + ' kt/year |')
  lines.push('| Market Premium | ' + result.market_premium_estimate_bps + ' bps |')
  lines.push('')
  lines.push('---')
  lines.push('*Clean Energy Toolkit v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Solar Site Selector
  tools.register(defineTool({
    name: 'solar_site_selector',
    description: 'Solar PV site selection analysis | GHI/DNI resource, terrain suitability, grid proximity, LCOE estimation | Analyze solar resource, site suitability, and economics for PV plant siting.',
    parameters: {
      solar_input: {
        type: 'string',
        required: true,
        description: 'JSON: location, area_hectares, grid_distance_km, terrain_type (flat|hilly|mountainous|desert|rooftop), target_capacity_mw'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { solar_input: string }) {
      const input: SolarSiteInput = JSON.parse(args.solar_input)
      return formatSolarSiteReport(analyzeSolarSite(input))
    }
  }))

  // Tool 2: Wind Farm Optimizer
  tools.register(defineTool({
    name: 'wind_farm_optimizer',
    description: 'Wind farm layout optimization | Wind resource, wake loss, turbine spacing, LCOE, CO2 avoidance | Optimize wind farm design with resource assessment and layout.',
    parameters: {
      wind_input: {
        type: 'string',
        required: true,
        description: 'JSON: location, area_km2, target_capacity_mw, turbine_model, hub_height_m, terrain_type (onshore|offshore|coastal)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { wind_input: string }) {
      const input: WindFarmInput = JSON.parse(args.wind_input)
      return formatWindFarmReport(analyzeWindFarm(input))
    }
  }))

  // Tool 3: Carbon Capture Analyzer
  tools.register(defineTool({
    name: 'carbon_capture_analyzer',
    description: 'Carbon capture technology analysis | Capture rate, cost per tonne, storage feasibility, energy penalty | Evaluate CCS technology routes and economics.',
    parameters: {
      cc_input: {
        type: 'string',
        required: true,
        description: 'JSON: facility_type (power_plant|cement|steel|chemical|dac), emission_rate_tonnes_year, capture_technology (post_combustion|pre_combustion|oxy_fuel|direct_air), storage_type (saline_aquifer|depleted_oil_gas|basalt|utilization), project_duration_years'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { cc_input: string }) {
      const input: CarbonCaptureInput = JSON.parse(args.cc_input)
      return formatCarbonCaptureReport(analyzeCarbonCapture(input))
    }
  }))

  // Tool 4: Green Hydrogen Economist
  tools.register(defineTool({
    name: 'green_hydrogen_economist',
    description: 'Green hydrogen economic analysis | LCOH, electrolyzer efficiency, NPV, IRR, grey H2 competitiveness | Analyze green hydrogen production economics and market readiness.',
    parameters: {
      h2_input: {
        type: 'string',
        required: true,
        description: 'JSON: electrolyzer_type (alkaline|pem|soec), capacity_mw, electricity_source (solar|wind|hybrid|grid), electricity_cost_usd_mwh, water_cost_usd_m3, target_application (ammonia|refining|steel|transport|power), project_lifetime_years'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { h2_input: string }) {
      const input: GreenHydrogenInput = JSON.parse(args.h2_input)
      return formatGreenHydrogenReport(analyzeGreenHydrogen(input))
    }
  }))

  // Tool 5: Battery Storage Optimizer
  tools.register(defineTool({
    name: 'battery_storage_optimizer',
    description: 'Battery storage system optimization | Capacity sizing, dispatch strategy, LCOS, NPV, cycle life | Optimize battery storage design and economics for various applications.',
    parameters: {
      storage_input: {
        type: 'string',
        required: true,
        description: 'JSON: application (peak_shaving|frequency_regulation|renewable_integration|backup_power|arbitrage), battery_type (lfp|nmc|na-ion|flow), power_mw, duration_hours, cycle_requirements_per_day, electricity_buy_price_usd_mwh, electricity_sell_price_usd_mwh, project_lifetime_years'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { storage_input: string }) {
      const input: BatteryStorageInput = JSON.parse(args.storage_input)
      return formatBatteryStorageReport(analyzeBatteryStorage(input))
    }
  }))

  // Tool 6: Microgrid Designer
  tools.register(defineTool({
    name: 'microgrid_designer',
    description: 'Microgrid system design | Source-load-storage sizing, control strategy, reliability, LCOE | Design optimal microgrid configurations for various load types.',
    parameters: {
      microgrid_input: {
        type: 'string',
        required: true,
        description: 'JSON: load_type (residential|commercial|industrial|remote_community|military), peak_load_mw, annual_demand_mwh, mode (grid_connected|island|hybrid), solar_potential (low|medium|high), wind_potential (low|medium|high), storage_required (boolean), reliability_target_pct'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { microgrid_input: string }) {
      const input: MicrogridInput = JSON.parse(args.microgrid_input)
      return formatMicrogridReport(analyzeMicrogrid(input))
    }
  }))

  // Tool 7: Energy Efficiency Auditor
  tools.register(defineTool({
    name: 'energy_efficiency_auditor',
    description: 'Building energy efficiency audit | EUI benchmarking, consumption breakdown, saving measures, ROI | Audit building energy performance and identify saving opportunities.',
    parameters: {
      audit_input: {
        type: 'string',
        required: true,
        description: 'JSON: building_type (office|hospital|school|factory|data_center|retail), floor_area_m2, annual_consumption_kwh, hvac_system (central|split|vrf|geothermal), lighting_type (led|fluorescent|mixed), insulation_level (poor|average|good), occupancy_hours_per_day'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { audit_input: string }) {
      const input: EnergyAuditInput = JSON.parse(args.audit_input)
      return formatEnergyAuditReport(analyzeEnergyAudit(input))
    }
  }))

  // Tool 8: Green Bond Validator
  tools.register(defineTool({
    name: 'green_bond_validator',
    description: 'Green bond validation | Framework compliance, use of proceeds, impact metrics, risk assessment | Validate green bond alignment with international standards.',
    parameters: {
      bond_input: {
        type: 'string',
        required: true,
        description: 'JSON: issuer, bond_type (use_of_proceeds|project_revenue|securitized|sustainability_linked), principal_usd_musd, use_of_proceeds[], framework_standard (icma_gbp|cbi|eu_taxonomy|climate_bonds), second_party_opinion (boolean), reporting_frequency (annual|semi_annual|quarterly)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { bond_input: string }) {
      const input: GreenBondInput = JSON.parse(args.bond_input)
      return formatGreenBondReport(analyzeGreenBond(input))
    }
  }))

  console.log('[dsh-tool-cleanenergy] Loaded v' + VERSION + ' - Clean Energy & Climate Tech: 8 tools active')
  console.log('  Tools: solar_site_selector, wind_farm_optimizer, carbon_capture_analyzer, green_hydrogen_economist, battery_storage_optimizer, microgrid_designer, energy_efficiency_auditor, green_bond_validator')
}
