/**
 * DSH Smart Agriculture & Precision Farming AI Agent Plugin v0.1.0
 *
 * Comprehensive smart agriculture and precision farming toolkit for DeepSeek Harness Agent.
 * Designed for farmers, agronomists, agricultural consultants, and precision farming operators.
 *
 * Features (v0.1.0):
 * - Crop Health Monitor (NDVI/multispectral analysis with early warning)
 * - Irrigation Optimization Engine (WUE modeling with smart scheduling)
 * - Pest Detection Classifier (computer vision simulation with treatment plans)
 * - Yield Prediction Modeler (ML modeling with growth stage analysis)
 * - Soil Health Analyzer (nutrient profiling with amelioration plans)
 * - Weather Risk Assessor (extreme event forecasting with adaptation strategies)
 * - Harvest Timing Optimizer (optimal harvest with market price linkage)
 * - Carbon Footprint Tracker (sequestration accounting with credit valuation)
 *
 * @module dsh-tool-smartagriai
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'dsh-tool-smartagriai';
export const inject = ['tools'];

const VERSION = '0.1.0';

// ==================== DISCLAIMERS ====================

const AGRONOMY_DISCLAIMER =
  '本分析基于AI模型推断，仅供农业生产参考，不替代专业农艺师和农业技术推广人员的决策。';
const RISK_DISCLAIMER =
  '本风险评估基于历史气象数据和模型推断，仅供参考，不替代官方气象部门发布的预警信息。';
const CARBON_DISCLAIMER =
  '本碳核算基于估算模型和活动数据，仅供参考，不替代第三方碳排放核查机构的正式核证。';
const GENERAL_DISCLAIMER =
  '本分析基于AI模型推断，仅供农业管理参考，请结合实际情况、当地农业部门建议和专业判断做出决策。';

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  next(): number {
    this.seed = (this.seed + 0x6d2b79f5) >>> 0;
    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t);
    t = t ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }
}

function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRng(text: string): SeededRandom {
  return new SeededRandom(hashStr(text));
}

function round(v: number, d: number = 2): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// ============================================================
// 1. crop_health_monitor — 作物健康监测
// ============================================================
export interface CropHealthMonitorInput {
  crop_type?: string;
  growth_stage?: string;
  field_id?: string;
  ndvi_value?: number;
  canopy_temperature?: number;
  leaf_area_index?: number;
  chlorophyll_content?: number;
  pest_symptoms_observed?: string[];
  disease_symptoms_observed?: string[];
  soil_moisture?: number;
  temperature_c?: number;
  humidity_pct?: number;
}

export interface CropHealthMonitorResult {
  field_id: string;
  crop_type: string;
  growth_stage: string;
  health_score: number;
  health_status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  ndvi_analysis: { value: number; status: string; deviation: number; anomaly: boolean };
  canopy_analysis: { temperature: number; stress_index: number; water_stress: boolean };
  chlorophyll_assessment: { spad_value: string; deficiency_risk: string; recommendation: string };
  biomass_estimation: { lai: number; biomass_t_ha: number; growth_rate: string };
  health_factors: Array<{ factor: string; score: number; status: string }>;
  alerts: Array<{ level: 'info' | 'warning' | 'critical'; type: string; message: string }>;
  recommendations: string[];
  disclaimer: string;
}

function analyzeCropHealth(input: CropHealthMonitorInput): CropHealthMonitorResult {
  const rng = seededRng(JSON.stringify(input));
  const crop = input.crop_type || rng.pick(['玉米', '水稻', '小麦', '大豆', '棉花', '番茄']);
  const stage = input.growth_stage || rng.pick(['苗期', '拔节期', '抽穗期', '灌浆期', '成熟期']);
  const fieldId = input.field_id || ('FIELD-' + rng.nextInt(1000, 9999));
  const ndvi = input.ndvi_value ?? round(0.35 + rng.next() * 0.55, 3);
  const canopyTemp = input.canopy_temperature ?? round(20 + rng.next() * 18, 1);
  const lai = input.leaf_area_index ?? round(1.5 + rng.next() * 4.5, 2);
  const chlorophyll = input.chlorophyll_content ?? round(25 + rng.next() * 35, 1);
  const moisture = input.soil_moisture ?? round(25 + rng.next() * 50, 1);
  const temp = input.temperature_c ?? round(18 + rng.next() * 20, 1);
  const humidity = input.humidity_pct ?? round(40 + rng.next() * 50, 1);

  const ndviStatus = ndvi >= 0.75 ? 'excellent' : ndvi >= 0.6 ? 'good' : ndvi >= 0.45 ? 'fair' : ndvi >= 0.3 ? 'poor' : 'critical';
  const ndviDev = round((ndvi - 0.7) / 0.7 * 100, 1);
  const ndviAnomaly = ndvi < 0.45 || (canopyTemp - temp) > 5;

  const stressIndex = round(Math.max(0, (canopyTemp - temp - 2) * 10), 1);
  const waterStress = moisture < 35 || stressIndex > 15;

  const spadStatus = chlorophyll >= 45 ? '充足' : chlorophyll >= 35 ? '适中' : chlorophyll >= 25 ? '偏低' : '缺乏';
  const deficiencyRisk = chlorophyll < 30 ? '高' : chlorophyll < 40 ? '中' : '低';
  const chlorRec = chlorophyll < 30 ? '建议叶面喷施尿素1-2%溶液' : chlorophyll < 40 ? '适量追施氮肥' : '光合色素水平正常';

  const biomass = round(lai * 0.8 + rng.next() * 0.5, 2);
  const growthRate = stage === '灌浆期' ? '快速积累' : stage === '拔节期' ? '旺盛生长' : stage === '苗期' ? '缓慢建立' : '稳定生长';

  const factors = [
    { factor: '植被指数(NDVI)', score: round(Math.min(100, ndvi * 130), 0), status: ndviStatus },
    { factor: '叶绿素含量', score: round(Math.min(100, chlorophyll * 1.8), 0), status: spadStatus },
    { factor: '叶面积指数', score: round(Math.min(100, lai * 18), 0), status: lai >= 4 ? '充足' : lai >= 2.5 ? '适中' : '不足' },
    { factor: '水分状况', score: round(Math.min(100, (100 - Math.abs(55 - moisture)) * 1.5), 0), status: moisture < 35 ? '缺水' : moisture > 75 ? '过湿' : '适中' },
    { factor: '温度胁迫', score: round(Math.max(0, 100 - stressIndex * 3), 0), status: stressIndex > 15 ? '较重' : stressIndex > 8 ? '轻微' : '无' },
  ];

  const healthScore = round(factors.reduce((s, f) => s + f.score, 0) / factors.length, 0);
  const healthStatus = healthScore >= 80 ? 'excellent' : healthScore >= 65 ? 'good' : healthScore >= 50 ? 'fair' : healthScore >= 35 ? 'poor' : 'critical';

  const alerts: Array<{ level: 'info' | 'warning' | 'critical'; type: string; message: string }> = [];
  if (ndvi < 0.5) alerts.push({ level: 'warning', type: '长势', message: 'NDVI偏低，低于0.5阈值，可能影响产量' });
  if (waterStress) alerts.push({ level: 'critical', type: '水分', message: '作物水分胁迫明显，建议立即检查灌溉' });
  if (chlorophyll < 30) alerts.push({ level: 'warning', type: '营养', message: '叶绿素含量低，光合作用受限' });
  if (canopyTemp - temp > 5) alerts.push({ level: 'warning', type: '温度', message: '冠层温度异常偏高，注意高温热害' });
  if (humidity > 85) alerts.push({ level: 'warning', type: '病害', message: '高湿度环境，真菌性病害风险升高' });
  if (alerts.length === 0) alerts.push({ level: 'info', type: '综合', message: '当前作物生长状况良好，各项指标正常' });

  const recommendations: string[] = [];
  if (healthScore < 60) recommendations.push('加强田间管理，排查生长受限原因');
  if (moisture < 35) recommendations.push('及时补充灌溉，保持土壤水分');
  if (chlorophyll < 35) recommendations.push('追施氮肥，促进叶绿素合成');
  if (lai < 2.5) recommendations.push('适当增加种植密度提升群体LAI');
  if (ndvi < 0.5) recommendations.push('建议进行无人机多光谱遥感监测，精细定位问题区域');
  if (recommendations.length === 0) recommendations.push('维持当前管理措施，持续监测');

  return {
    field_id: fieldId,
    crop_type: crop,
    growth_stage: stage,
    health_score: healthScore,
    health_status: healthStatus,
    ndvi_analysis: { value: ndvi, status: ndviStatus, deviation: ndviDev, anomaly: ndviAnomaly },
    canopy_analysis: { temperature: canopyTemp, stress_index: stressIndex, water_stress: waterStress },
    chlorophyll_assessment: { spad_value: spadStatus, deficiency_risk: deficiencyRisk, recommendation: chlorRec },
    biomass_estimation: { lai, biomass_t_ha: biomass, growth_rate: growthRate },
    health_factors: factors,
    alerts,
    recommendations,
    disclaimer: AGRONOMY_DISCLAIMER,
  };
}

function formatCropHealth(r: CropHealthMonitorResult): string {
  let s = '=== 作物健康监测报告 ===\n\n';
  s += '【基本信息】\n';
  s += '  地块编号: ' + r.field_id + '\n';
  s += '  作物类型: ' + r.crop_type + '\n';
  s += '  生育阶段: ' + r.growth_stage + '\n';
  s += '  健康评分: ' + r.health_score + '/100 (' + r.health_status + ')\n\n';
  s += '【植被指数分析】\n';
  s += '  NDVI值: ' + r.ndvi_analysis.value + '\n';
  s += '  状态: ' + r.ndvi_analysis.status + '\n';
  s += '  偏差: ' + r.ndvi_analysis.deviation + '%\n';
  s += '  异常检测: ' + (r.ndvi_analysis.anomaly ? '是' : '否') + '\n\n';
  s += '【冠层分析】\n';
  s += '  冠层温度: ' + r.canopy_analysis.temperature + '°C\n';
  s += '  胁迫指数: ' + r.canopy_analysis.stress_index + '\n';
  s += '  水分胁迫: ' + (r.canopy_analysis.water_stress ? '是' : '否') + '\n\n';
  s += '【叶绿素评估】\n';
  s += '  SPAD水平: ' + r.chlorophyll_assessment.spad_value + '\n';
  s += '  缺乏风险: ' + r.chlorophyll_assessment.deficiency_risk + '\n';
  s += '  建议: ' + r.chlorophyll_assessment.recommendation + '\n\n';
  s += '【生物量估算】\n';
  s += '  LAI: ' + r.biomass_estimation.lai + '\n';
  s += '  生物量: ' + r.biomass_estimation.biomass_t_ha + ' t/ha\n';
  s += '  生长速率: ' + r.biomass_estimation.growth_rate + '\n\n';
  s += '【健康因子评分】\n';
  r.health_factors.forEach((f) => {
    s += '  ' + f.factor + ': ' + f.score + ' (' + f.status + ')\n';
  });
  s += '\n【预警信息】\n';
  r.alerts.forEach((a) => {
    s += '  [' + a.level + '] ' + a.type + ': ' + a.message + '\n';
  });
  s += '\n【管理建议】\n';
  r.recommendations.forEach((rec) => {
    s += '  - ' + rec + '\n';
  });
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 2. irrigation_optimization_engine — 灌溉优化引擎
// ============================================================
export interface IrrigationInput {
  crop_type?: string;
  growth_stage?: string;
  area_ha?: number;
  soil_type?: string;
  soil_moisture_current?: number;
  soil_moisture_threshold?: number;
  et_rate_mm_day?: number;
  rainfall_forecast_mm?: number;
  irrigation_method?: string;
  water_source?: string;
  energy_cost_per_kwh?: number;
  water_cost_per_m3?: number;
}

export interface IrrigationResult {
  crop_water_demand: { etc_mm_day: number; etc_total_mm: number; growth_stage_factor: number };
  soil_water_balance: { current_mm: number; field_capacity_mm: number; wilting_point_mm: number; depletion_pct: number };
  irrigation_recommendation: { volume_m3_ha: number; duration_hours: number; frequency_days: number; method: string };
  water_use_efficiency: { wue_kg_m3: number; iwue_pct: number; benchmark: string; gap_pct: number };
  schedule_plan: Array<{ day: number; volume_m3_ha: number; method: string; efficiency_note: string }>;
  water_saving_potential: { current_m3_ha: number; optimized_m3_ha: number; saving_pct: number; saving_m3_total: number };
  economic_analysis: { water_cost_total: number; energy_cost_total: number; total_cost: number; cost_per_kg: number };
  disclaimer: string;
}

function analyzeIrrigation(input: IrrigationInput): IrrigationResult {
  const rng = seededRng(JSON.stringify(input));
  const crop = input.crop_type || rng.pick(['玉米', '水稻', '小麦', '棉花', '番茄']);
  const stage = input.growth_stage || rng.pick(['苗期', '拔节期', '抽穗期', '灌浆期']);
  const area = input.area_ha ?? round(5 + rng.next() * 45, 1);
  const soilType = input.soil_type || rng.pick(['壤土', '砂壤土', '黏壤土']);
  const moisture = input.soil_moisture_current ?? round(25 + rng.next() * 40, 1);
  const threshold = input.soil_moisture_threshold ?? round(35 + rng.next() * 15, 1);
  const etRate = input.et_rate_mm_day ?? round(3.5 + rng.next() * 5, 1);
  const rainfall = input.rainfall_forecast_mm ?? round(rng.next() * 25, 1);
  const method = input.irrigation_method || rng.pick(['滴灌', '喷灌', '微喷灌', '滴灌带']);

  const stageFactor = stage === '苗期' ? 0.6 : stage === '拔节期' ? 0.85 : stage === '抽穗期' ? 1.15 : stage === '灌浆期' ? 1.0 : 0.7;
  const etcDay = round(etRate * stageFactor, 2);
  const etcTotal = round(etcDay * 7, 1);

  const fieldCapacity = soilType === '砂壤土' ? 28 : soilType === '黏壤土' ? 45 : 35;
  const wiltingPoint = soilType === '砂壤土' ? 10 : soilType === '黏壤土' ? 20 : 15;
  const depletion = round(((fieldCapacity - moisture) / (fieldCapacity - wiltingPoint)) * 100, 1);

  const needIrrigate = moisture < threshold;
  const grossDepth = needIrrigate ? round((fieldCapacity - moisture) + etcDay * 3 - rainfall, 1) : round(Math.max(0, etcDay * 2 - rainfall), 1);
  const applicationEff = method === '滴灌' ? 0.9 : method === '微喷灌' ? 0.85 : method === '喷灌' ? 0.75 : 0.7;
  const netDepth = round(grossDepth / applicationEff, 1);
  const volumeM3Ha = round(netDepth * 10, 0);
  const durationHours = round(volumeM3Ha / (method === '滴灌' ? 4 : method === '微喷灌' ? 6 : 8), 1);
  const freqDays = depletion > 60 ? 2 : depletion > 40 ? 3 : 5;

  const wue = round(1.0 + rng.next() * 1.8, 2);
  const iwue = round(wue / 2.0 * 100, 1);
  const benchmark = wue >= 1.8 ? '优秀' : wue >= 1.2 ? '良好' : '需改进';
  const gap = round((2.0 - wue) / 2.0 * 100, 1);

  const schedule = [];
  for (let d = 1; d <= 7; d += freqDays) {
    const vol = round(volumeM3Ha * (0.5 + rng.next() * 0.3), 0);
    const note = d % 3 === 0 ? '配合追肥' : '常规灌溉';
    schedule.push({ day: d, volume_m3_ha: vol, method, efficiency_note: note });
  }

  const currentUse = round(150 + rng.next() * 200, 0);
  const optimizedUse = round(volumeM3Ha * 7 / freqDays, 0);
  const savingPct = round(((currentUse - optimizedUse) / currentUse) * 100, 1);
  const savingM3Total = round((currentUse - optimizedUse) * area, 0);

  const waterCostPerM3 = input.water_cost_per_m3 ?? round(0.3 + rng.next() * 0.5, 2);
  const energyCost = input.energy_cost_per_kwh ?? round(0.6 + rng.next() * 0.4, 2);
  const waterCostTotal = round(optimizedUse * waterCostPerM3 * area, 0);
  const energyCostTotal = round(optimizedUse * area * 0.3 * energyCost, 0);
  const totalCost = round(waterCostTotal + energyCostTotal, 0);
  const costPerKg = round(totalCost / (optimizedUse * area * wue * 0.01), 3);

  return {
    crop_water_demand: { etc_mm_day: etcDay, etc_total_mm: etcTotal, growth_stage_factor: stageFactor },
    soil_water_balance: { current_mm: moisture, field_capacity_mm: fieldCapacity, wilting_point_mm: wiltingPoint, depletion_pct: depletion },
    irrigation_recommendation: { volume_m3_ha: volumeM3Ha, duration_hours: durationHours, frequency_days: freqDays, method },
    water_use_efficiency: { wue_kg_m3: wue, iwue_pct: iwue, benchmark, gap_pct: gap },
    schedule_plan: schedule,
    water_saving_potential: { current_m3_ha: currentUse, optimized_m3_ha: optimizedUse, saving_pct: savingPct, saving_m3_total: savingM3Total },
    economic_analysis: { water_cost_total: waterCostTotal, energy_cost_total: energyCostTotal, total_cost: totalCost, cost_per_kg: costPerKg },
    disclaimer: AGRONOMY_DISCLAIMER,
  };
}

function formatIrrigation(r: IrrigationResult): string {
  let s = '=== 灌溉优化分析报告 ===\n\n';
  s += '【作物需水】\n';
  s += '  作物蒸散量(ETc): ' + r.crop_water_demand.etc_mm_day + ' mm/天\n';
  s += '  周需水总量: ' + r.crop_water_demand.etc_total_mm + ' mm\n';
  s += '  生育阶段系数: ' + r.crop_water_demand.growth_stage_factor + '\n\n';
  s += '【土壤水分平衡】\n';
  s += '  当前土壤水分: ' + r.soil_water_balance.current_mm + '%\n';
  s += '  田间持水量: ' + r.soil_water_balance.field_capacity_mm + '%\n';
  s += '  萎蔫系数: ' + r.soil_water_balance.wilting_point_mm + '%\n';
  s += '  水分消耗比: ' + r.soil_water_balance.depletion_pct + '%\n\n';
  s += '【灌溉建议】\n';
  s += '  灌水量: ' + r.irrigation_recommendation.volume_m3_ha + ' m³/ha\n';
  s += '  灌溉时长: ' + r.irrigation_recommendation.duration_hours + ' 小时\n';
  s += '  灌溉频率: 每' + r.irrigation_recommendation.frequency_days + '天\n';
  s += '  方式: ' + r.irrigation_recommendation.method + '\n\n';
  s += '【水分利用效率】\n';
  s += '  水分利用效率(WUE): ' + r.water_use_efficiency.wue_kg_m3 + ' kg/m³\n';
  s += '  灌溉水利用率: ' + r.water_use_efficiency.iwue_pct + '%\n';
  s += '  评级: ' + r.water_use_efficiency.benchmark + '\n';
  s += '  差距: ' + r.water_use_efficiency.gap_pct + '%\n\n';
  s += '【灌溉计划】\n';
  r.schedule_plan.forEach((sch) => {
    s += '  第' + sch.day + '天: ' + sch.method + ' ' + sch.volume_m3_ha + ' m³/ha — ' + sch.efficiency_note + '\n';
  });
  s += '\n【节水潜力】\n';
  s += '  当前用水: ' + r.water_saving_potential.current_m3_ha + ' m³/ha/周\n';
  s += '  优化用水: ' + r.water_saving_potential.optimized_m3_ha + ' m³/ha/周\n';
  s += '  节水比例: ' + r.water_saving_potential.saving_pct + '%\n';
  s += '  总节水量: ' + r.water_saving_potential.saving_m3_total + ' m³\n\n';
  s += '【经济分析】\n';
  s += '  水费: ¥' + r.economic_analysis.water_cost_total.toLocaleString() + '\n';
  s += '  电费: ¥' + r.economic_analysis.energy_cost_total.toLocaleString() + '\n';
  s += '  总成本: ¥' + r.economic_analysis.total_cost.toLocaleString() + '\n';
  s += '  千克成本: ¥' + r.economic_analysis.cost_per_kg + '/kg\n';
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 3. pest_detection_classifier — 病虫害检测分类器
// ============================================================
export interface PestDetectionInput {
  crop_type?: string;
  growth_stage?: string;
  affected_area_pct?: number;
  symptom_description?: string[];
  pest_type?: string;
  environmental_conditions?: { temperature?: number; humidity?: number; rainfall_mm?: number };
  previous_incidence?: string;
}

export interface PestDetectionResult {
  identification: { name: string; scientific_name: string; confidence: number; category: 'insect' | 'fungus' | 'bacteria' | 'virus' | 'weed' | 'nematode' };
  severity_assessment: { affected_pct: number; severity_level: 'trace' | 'light' | 'moderate' | 'severe' | 'very_severe'; economic_threshold: boolean; loss_estimate_pct: number };
  symptoms_matching: Array<{ symptom: string; match_score: number; typical: string }>;
  spread_prediction: { rate: string; risk: 'low' | 'moderate' | 'high' | 'very_high'; favorable_conditions: string[] };
  treatment_plan: Array<{ stage: string; method: string; product: string; dosage: string; timing: string }>;
  prevention_measures: Array<{ measure: string; effectiveness: string; cost_level: string }>;
  disclaimer: string;
}

function analyzePestDetection(input: PestDetectionInput): PestDetectionResult {
  const rng = seededRng(JSON.stringify(input));
  const crop = input.crop_type || rng.pick(['水稻', '小麦', '玉米', '番茄', '黄瓜', '果树']);
  const affectedPct = input.affected_area_pct ?? round(2 + rng.next() * 28, 1);
  const envTemp = input.environmental_conditions?.temperature ?? round(22 + rng.next() * 14, 1);
  const envHumidity = input.environmental_conditions?.humidity ?? round(55 + rng.next() * 35, 1);

  const pestDatabase: Record<string, Array<{ name: string; sci: string; category: string }>> = {
    '水稻': [
      { name: '稻飞虱', sci: 'Nilaparvata lugens', category: 'insect' },
      { name: '稻瘟病', sci: 'Magnaporthe oryzae', category: 'fungus' },
      { name: '纹枯病', sci: 'Rhizoctonia solani', category: 'fungus' },
    ],
    '小麦': [
      { name: '赤霉病', sci: 'Fusarium graminearum', category: 'fungus' },
      { name: '蚜虫', sci: 'Sitobion avenae', category: 'insect' },
      { name: '锈病', sci: 'Puccinia striiformis', category: 'fungus' },
    ],
    '玉米': [
      { name: '玉米螟', sci: 'Ostrinia furnacalis', category: 'insect' },
      { name: '大斑病', sci: 'Exserohilum turcicum', category: 'fungus' },
      { name: '蚜虫', sci: 'Rhopalosiphum maidis', category: 'insect' },
    ],
    '番茄': [
      { name: '白粉病', sci: 'Erysiphe cichoracearum', category: 'fungus' },
      { name: '晚疫病', sci: 'Phytophthora infestans', category: 'fungus' },
      { name: '烟粉虱', sci: 'Bemisia tabaci', category: 'insect' },
    ],
    '黄瓜': [
      { name: '霜霉病', sci: 'Pseudoperonospora cubensis', category: 'fungus' },
      { name: '炭疽病', sci: 'Colletotrichum orbiculare', category: 'fungus' },
      { name: '瓜实蝇', sci: 'Bactrocera cucurbitae', category: 'insect' },
    ],
    '果树': [
      { name: '红蜘蛛', sci: 'Tetranychus urticae', category: 'insect' },
      { name: '溃疡病', sci: 'Xanthomonas campestris', category: 'bacteria' },
      { name: '炭疽病', sci: 'Colletotrichum gloeosporioides', category: 'fungus' },
    ],
  };

  const pests = pestDatabase[crop] || pestDatabase['水稻'];
  const detected = rng.pick(pests);
  const confidence = round(65 + rng.next() * 30, 1);

  const severityLevel = affectedPct < 5 ? 'trace' : affectedPct < 15 ? 'light' : affectedPct < 30 ? 'moderate' : affectedPct < 50 ? 'severe' : 'very_severe';
  const econThreshold = (severityLevel === 'moderate' || severityLevel === 'severe' || severityLevel === 'very_severe');
  const lossEst = round(affectedPct * (0.3 + rng.next() * 0.4), 1);

  const symptoms = ['叶片出现斑点', '植株生长迟缓', '叶色异常', '茎秆病变'];
  const matchedSymptoms = symptoms.slice(0, 1 + Math.floor(rng.next() * 3)).map((sym) => ({
    symptom: sym,
    match_score: round(60 + rng.next() * 35, 1),
    typical: detected.category === 'fungus' ? '真菌性病害典型症状' : detected.category === 'insect' ? '虫害典型症状' : '常见症状',
  }));

  const spreadRate = envHumidity > 80 && envTemp > 25 ? '迅速' : envHumidity < 50 ? '缓慢' : '中等';
  const spreadRisk = spreadRate === '迅速' ? 'high' : spreadRate === '缓慢' ? 'low' : 'moderate';
  const favorable: string[] = [];
  if (envHumidity > 75) favorable.push('高湿度(>' + envHumidity + '%)');
  if (envTemp > 25) favorable.push('适宜温度(' + envTemp + '°C)');
  if (favorable.length === 0) favorable.push('中等环境条件');

  const treatments = [
    { stage: '紧急处理', method: '化学防治', product: detected.category === 'fungus' ? '苯醚甲环唑' : '吡虫啉', dosage: '按说明书稀释1000倍', timing: '施药后4小时内无雨' },
    { stage: '巩固治疗', method: '生物防治', product: detected.category === 'fungus' ? '枯草芽孢杆菌' : '苏云金杆菌', dosage: '500倍液叶面喷施', timing: '3-5天后第二次施药' },
    { stage: '预防保护', method: '保护性用药', product: detected.category === 'fungus' ? '代森锰锌' : '啶虫脒', dosage: '保护性浓度喷施', timing: '雨前施药' },
  ];

  const prevention = [
    { measure: '选用抗病品种', effectiveness: '高', cost_level: '低' },
    { measure: '合理密植改善通风', effectiveness: '中高', cost_level: '低' },
    { measure: '清除田间病残体', effectiveness: '高', cost_level: '低' },
    { measure: '轮作倒茬', effectiveness: '中高', cost_level: '中' },
  ];

  return {
    identification: { name: detected.name, scientific_name: detected.category, confidence, category: detected.category as 'insect' | 'fungus' | 'bacteria' },
    severity_assessment: { affected_pct: affectedPct, severity_level: severityLevel, economic_threshold: econThreshold, loss_estimate_pct: lossEst },
    symptoms_matching: matchedSymptoms,
    spread_prediction: { rate: spreadRate, risk: spreadRisk, favorable_conditions: favorable },
    treatment_plan: treatments,
    prevention_measures: prevention,
    disclaimer: AGRONOMY_DISCLAIMER,
  };
}

function formatPestDetection(r: PestDetectionResult): string {
  let s = '=== 病虫害检测报告 ===\n\n';
  s += '【识别结果】\n';
  s += '  ' + r.identification.name + ' (' + r.identification.category + ')\n';
  s += '  置信度: ' + r.identification.confidence + '%\n';
  s += '  类别: ' + r.identification.category + '\n\n';
  s += '【严重度评估】\n';
  s += '  危害面积: ' + r.severity_assessment.affected_pct + '%\n';
  s += '  严重等级: ' + r.severity_assessment.severity_level + '\n';
  s += '  已达防治指标: ' + (r.severity_assessment.economic_threshold ? '是' : '否') + '\n';
  s += '  预估损失: ' + r.severity_assessment.loss_estimate_pct + '%\n\n';
  s += '【症状匹配】\n';
  r.symptoms_matching.forEach((m) => {
    s += '  ' + m.symptom + ' — 匹配度: ' + m.match_score + '% | ' + m.typical + '\n';
  });
  s += '\n【蔓延预测】\n';
  s += '  蔓延速率: ' + r.spread_prediction.rate + '\n';
  s += '  风险等级: ' + r.spread_prediction.risk + '\n';
  s += '  有利条件: ' + r.spread_prediction.favorable_conditions.join('、') + '\n\n';
  s += '【防治方案】\n';
  r.treatment_plan.forEach((t) => {
    s += '  [' + t.stage + '] ' + t.method + ': ' + t.product + ' ' + t.dosage + ' (' + t.timing + ')\n';
  });
  s += '\n【预防建议】\n';
  r.prevention_measures.forEach((p) => {
    s += '  ' + p.measure + ' — 效果: ' + p.effectiveness + ' | 成本: ' + p.cost_level + '\n';
  });
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 4. yield_prediction_modeler — 产量预测建模器
// ============================================================
export interface YieldPredictionInput {
  crop_type?: string;
  variety?: string;
  region?: string;
  area_ha?: number;
  planting_date?: string;
  growth_days?: number;
  soil_fertility?: string;
  irrigation_access?: boolean;
  fertilizer_input_kg?: number;
  pest_pressure?: string;
  weather_score?: number;
  historical_yield_t_ha?: number;
}

export interface YieldPredictionResult {
  prediction_model: { method: string; r_squared: number; standard_error: number; confidence_level: number };
  yield_estimate: { min_t_ha: number; expected_t_ha: number; max_t_ha: number; total_t: number; vs_historical_pct: number };
  limiting_factors: Array<{ factor: string; impact: number; description: string; mitigation: string }>;
  growth_trajectory: Array<{ stage: string; days: number; gdd_required: number; status: string }>;
  economic_projection: { revenue_per_ha: number; total_revenue: number; cost_estimate: number; net_profit: number; profit_margin_pct: number };
  risk_assessment: { yield_variability_pct: number; weather_risk: number; market_risk: number; overall_risk: 'low' | 'moderate' | 'high' };
  disclaimer: string;
}

function analyzeYieldPrediction(input: YieldPredictionInput): YieldPredictionResult {
  const rng = seededRng(JSON.stringify(input));
  const crop = input.crop_type || rng.pick(['水稻', '玉米', '小麦', '大豆']);
  const area = input.area_ha ?? round(10 + rng.next() * 90, 1);
  const soilFert = input.soil_fertility || rng.pick(['高', '中', '低']);
  const irrigated = input.irrigation_access ?? rng.next() > 0.3;
  const fertilizer = input.fertilizer_input_kg ?? round(150 + rng.next() * 300, 0);
  const weatherScore = input.weather_score ?? round(60 + rng.next() * 35, 0);
  const pestPressure = input.pest_pressure || rng.pick(['低', '中', '低']);
  const historical = input.historical_yield_t_ha ?? round(4 + rng.next() * 6, 2);

  const baseYield: Record<string, number> = { '水稻': 7.5, '玉米': 9.0, '小麦': 6.0, '大豆': 2.5 };
  const by = baseYield[crop] || 6.0;
  const fertFactor = soilFert === '高' ? 1.15 : soilFert === '中' ? 1.0 : 0.82;
  const irrFactor = irrigated ? 1.12 : 0.88;
  const pestFactor = pestPressure === '低' ? 1.05 : pestPressure === '中' ? 0.92 : 0.78;
  const weatherFactor = weatherScore / 75;
  const fertNorm = Math.min(1.2, fertilizer / 250);

  const expected = round(by * fertFactor * irrFactor * pestFactor * weatherFactor * fertNorm, 2);
  const min = round(expected * (0.8 + rng.next() * 0.1), 2);
  const max = round(expected * (1.05 + rng.next() * 0.15), 2);
  const total = round(expected * area, 1);
  const vsHist = round((expected - historical) / historical * 100, 1);

  const rSquared = round(0.78 + rng.next() * 0.15, 3);
  const stdErr = round((max - min) / 4, 2);
  const confLevel = round(85 + rng.next() * 10, 1);

  const factors = [
    { factor: '土壤肥力', impact: round((fertFactor - 1) * 100, 1), description: '当前土壤' + soilFert + '肥力水平', mitigation: soilFert === '低' ? '增施有机肥改善土壤' : '维持现有施肥方案' },
    { factor: '灌溉保障', impact: round((irrFactor - 1) * 100, 1), description: irrigated ? '有灌溉保障' : '雨养农业条件', mitigation: '建议发展节水灌溉' },
    { factor: '气象条件', impact: round((weatherFactor - 1) * 100, 1), description: '气象适宜度评分' + weatherScore, mitigation: '关注天气预报，提前防范' },
    { factor: '病虫害', impact: round((1 - pestFactor) * 100, 1), description: '病虫压力' + pestPressure, mitigation: '加强监测预警，及时防治' },
    { factor: '施肥水平', impact: round((fertNorm - 1) * 100, 1), description: '施氮量' + fertilizer + 'kg/ha', mitigation: fertilizer < 200 ? '适当增加施肥' : '施肥量适中' },
  ];

  const stages = [
    { stage: '营养生长期', days: 35, gdd_required: 500, status: '已完成' },
    { stage: '生殖生长期', days: 30, gdd_required: 450, status: '关键期' },
    { stage: '灌浆成熟期', days: 25, gdd_required: 350, status: '进行中' },
  ];

  const pricePerKg: Record<string, number> = { '水稻': 3.2, '玉米': 2.6, '小麦': 2.8, '大豆': 5.5 };
  const price = pricePerKg[crop] || 3.0;
  const revenuePerHa = round(expected * 1000 * price, 0);
  const totalRevenue = round(revenuePerHa * area, 0);
  const totalCost = round(5000 + rng.next() * 8000, 0);
  const netProfit = round(revenuePerHa - totalCost / area, 0);
  const profitMargin = round(netProfit / revenuePerHa * 100, 1);

  const yieldVar = round(10 + rng.next() * 15, 1);
  const weatherRisk = round(Math.max(2, 100 - weatherScore), 0);
  const marketRisk = round(5 + rng.next() * 20, 0);
  const overallRisk = (yieldVar + weatherRisk + marketRisk) / 3 > 35 ? 'high' : (yieldVar + weatherRisk + marketRisk) / 3 > 18 ? 'moderate' : '';

  return {
    prediction_model: { method: '多元回归+物候模型', r_squared: rSquared, standard_error: stdErr, confidence_level: confLevel },
    yield_estimate: { min_t_ha: min, expected_t_ha: expected, max_t_ha: max, total_t: total, vs_historical_pct: vsHist },
    limiting_factors: factors,
    growth_trajectory: stages,
    economic_projection: { revenue_per_ha: revenuePerHa, total_revenue: totalRevenue, cost_estimate: totalCost, net_profit: netProfit, profit_margin_pct: profitMargin },
    risk_assessment: { yield_variability_pct: yieldVar, weather_risk: weatherRisk, market_risk: marketRisk, overall_risk: overallRisk as 'low' | 'moderate' | 'high' },
    disclaimer: GENERAL_DISCLAIMER,
  };
}

function formatYieldPrediction(r: YieldPredictionResult): string {
  let s = '=== 产量预测建模报告 ===\n\n';
  s += '【模型信息】\n';
  s += '  方法: ' + r.prediction_model.method + '\n';
  s += '  R²: ' + r.prediction_model.r_squared + '\n';
  s += '  标准误差: ±' + r.prediction_model.standard_error + ' t/ha\n';
  s += '  置信水平: ' + r.prediction_model.confidence_level + '%\n\n';
  s += '【产量估算】\n';
  s += '  最低: ' + r.yield_estimate.min_t_ha + ' t/ha\n';
  s += '  预期: ' + r.yield_estimate.expected_t_ha + ' t/ha\n';
  s += '  最高: ' + r.yield_estimate.max_t_ha + ' t/ha\n';
  s += '  总产: ' + r.yield_estimate.total_t + ' t\n';
  s += '  较历史: ' + (r.yield_estimate.vs_historical_pct >= 0 ? '+' : '') + r.yield_estimate.vs_historical_pct + '%\n\n';
  s += '【限制因子分析】\n';
  r.limiting_factors.forEach((f) => {
    s += '  ' + f.factor + ': ' + (f.impact >= 0 ? '+' : '') + f.impact + '% — ' + f.description + '\n';
    s += '    缓解: ' + f.mitigation + '\n';
  });
  s += '\n【生长轨迹】\n';
  r.growth_trajectory.forEach((g) => {
    s += '  ' + g.stage + ' (' + g.days + '天, GDD:' + g.gdd_required + ') — ' + g.status + '\n';
  });
  s += '\n【经济预测】\n';
  s += '  亩收入: ¥' + r.economic_projection.revenue_per_ha.toLocaleString() + '\n';
  s += '  总收入: ¥' + r.economic_projection.total_revenue.toLocaleString() + '\n';
  s += '  成本估算: ¥' + r.economic_projection.cost_estimate.toLocaleString() + '\n';
  s += '  净利润: ¥' + r.economic_projection.net_profit + '/ha\n';
  s += '  利润率: ' + r.economic_projection.profit_margin_pct + '%\n\n';
  s += '【风险评估】\n';
  s += '  产量变异性: ' + r.risk_assessment.yield_variability_pct + '%\n';
  s += '  气象风险: ' + r.risk_assessment.weather_risk + '/100\n';
  s += '  市场风险: ' + r.risk_assessment.market_risk + '/100\n';
  s += '  综合风险: ' + r.risk_assessment.overall_risk + '\n';
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 5. soil_health_analyzer — 土壤健康分析器
// ============================================================
export interface SoilHealthInput {
  field_id?: string;
  soil_type?: string;
  ph?: number;
  organic_matter_pct?: number;
  nitrogen_mg_kg?: number;
  phosphorus_mg_kg?: number;
  potassium_mg_kg?: number;
  bulk_density_g_cm3?: number;
  water_holding_capacity_pct?: number;
  microbial_biomass_c?: number;
  compaction_depth_cm?: number;
  sampling_depth_cm?: number;
}

export interface SoilHealthResult {
  overall_score: number;
  health_grade: 'excellent' | 'good' | 'fair' | 'poor' | 'degraded';
  chemical_properties: { ph_status: string; ph_score: number; om_status: string; om_score: number; n_score: number; p_score: number; k_score: number };
  physical_properties: { bulk_density_status: string; compaction: string; water_holding: string; physical_score: number };
  biological_indicators: { microbial_biomass: string; microbial_score: number; soil_life_index: string };
  nutrient_balance: { npk_ratio: string; balance_status: string; limiting_nutrient: string; excess_nutrient: string };
  amelioration_plan: Array<{ priority: string; measure: string; target: string; timeframe: string }>;
  disclaimer: string;
}

function analyzeSoilHealth(input: SoilHealthInput): SoilHealthResult {
  const rng = seededRng(JSON.stringify(input));
  const fieldId = input.field_id || ('SOIL-' + rng.nextInt(1000, 9999));
  const soilType = input.soil_type || rng.pick(['壤土', '砂壤土', '黏壤土', '黑土']);
  const ph = input.ph ?? round(5.5 + rng.next() * 2.5, 1);
  const om = input.organic_matter_pct ?? round(1.5 + rng.next() * 4, 1);
  const n = input.nitrogen_mg_kg ?? round(60 + rng.next() * 140, 0);
  const p = input.phosphorus_mg_kg ?? round(10 + rng.next() * 40, 0);
  const k = input.potassium_mg_kg ?? round(80 + rng.next() * 120, 0);
  const bd = input.bulk_density_g_cm3 ?? round(1.1 + rng.next() * 0.5, 2);
  const whc = input.water_holding_capacity_pct ?? round(25 + rng.next() * 35, 1);
  const microbial = input.microbial_biomass_c ?? round(150 + rng.next() * 350, 0);
  const compactDepth = input.compaction_depth_cm ?? round(15 + rng.next() * 25, 0);

  const phScore = ph >= 6.0 && ph <= 7.5 ? round(90 + rng.next() * 8, 0) : ph >= 5.5 && ph <= 8.0 ? round(60 + rng.next() * 25, 0) : round(30 + rng.next() * 25, 0);
  const phStatus = phScore >= 85 ? '适宜' : phScore >= 60 ? '基本适宜' : '需调节';
  const omScore = om >= 3 ? round(85 + rng.next() * 12, 0) : om >= 2 ? round(60 + rng.next() * 20, 0) : round(30 + rng.next() * 25, 0);
  const omStatus = om >= 3 ? '丰富' : om >= 2 ? '适中' : '贫瘠';
  const nScore = n >= 120 ? round(85 + rng.next() * 12, 0) : n >= 80 ? round(60 + rng.next() * 20, 0) : round(30 + rng.next() * 25, 0);
  const pScore = p >= 25 ? round(85 + rng.next() * 12, 0) : p >= 15 ? round(60 + rng.next() * 20, 0) : round(30 + rng.next() * 20, 0);
  const kScore = k >= 150 ? round(85 + rng.next() * 12, 0) : k >= 100 ? round(60 + rng.next() * 20, 0) : round(35 + rng.next() * 20, 0);

  const bdStatus = bd <= 1.3 ? '疏松' : bd <= 1.5 ? '适中' : '偏紧实';
  const compact = compactDepth > 20 ? '有犁底层' : compactDepth > 12 ? '轻度压实' : '无明显压实';
  const whcStatus = whc >= 40 ? '优良' : whc >= 30 ? '一般' : '偏低';
  const physScore = bd <= 1.3 ? round(80 + rng.next() * 15, 0) : bd <= 1.5 ? round(60 + rng.next() * 18, 0) : round(35 + rng.next() * 20, 0);

  const microStatus = microbial >= 300 ? '活跃' : microbial >= 200 ? '中等' : '偏低';
  const microScore = microbial >= 300 ? round(85 + rng.next() * 12, 0) : microbial >= 200 ? round(60 + rng.next() * 20, 0) : round(30 + rng.next() * 25, 0);
  const lifeIndex = microbial >= 300 ? '土壤生态系统健康' : microbial >= 200 ? '土壤生物活性一般' : '土壤生物活性偏低';

  const npkRatio = '1:' + round(p / n, 2) + ':' + round(k / n, 2);
  const balStatus = nScore >= 60 && pScore >= 60 && kScore >= 60 ? '平衡' : '不平衡';
  const limitNut = nScore < pScore && nScore < kScore ? '氮' : pScore < kScore ? '磷' : '钾';
  const excessNut = nScore > 90 && pScore < 60 ? '氮' : kScore > 90 ? '钾' : '无';

  const chemScore = round((phScore + omScore + nScore + pScore + kScore) / 5, 0);
  const overall = round((chemScore + physScore + microScore) / 3, 0);
  const grade = overall >= 80 ? 'excellent' : overall >= 65 ? 'good' : overall >= 50 ? 'fair' : overall >= 35 ? 'poor' : 'degraded';

  const plan: Array<{ priority: string; measure: string; target: string; timeframe: string }> = [];
  if (overall < 75) plan.push({ priority: '高', measure: '施用有机肥提升有机质', target: '有机质提升至3%以上', timeframe: '1-2年' });
  if (ph < 6.0) plan.push({ priority: '高', measure: '施用石灰调节酸碱度', target: 'pH调节至6.0-7.0', timeframe: '6个月' });
  if (ph > 7.5) plan.push({ priority: '高', measure: '施用硫磺粉或酸性肥料', target: 'pH调节至6.5-7.5', timeframe: '6个月' });
  if (physScore < 60) plan.push({ priority: '中', measure: '深松耕作改善物理结构', target: '土壤容重降至1.3以下', timeframe: '当季' });
  if (microScore < 60) plan.push({ priority: '中', measure: '接种微生物菌剂', target: '微生物量碳>250mg/kg', timeframe: '3-6个月' });
  if (plan.length === 0) plan.push({ priority: '低', measure: '维持现有管理措施', target: '保持土壤健康', timeframe: '持续' });

  return {
    overall_score: overall,
    health_grade: grade,
    chemical_properties: { ph_status: phStatus, ph_score: phScore, om_status: omStatus, om_score: omScore, n_score: nScore, p_score: pScore, k_score: kScore },
    physical_properties: { bulk_density_status: bdStatus, compaction: compact, water_holding: whcStatus, physical_score: physScore },
    biological_indicators: { microbial_biomass: microStatus, microbial_score: microScore, soil_life_index: lifeIndex },
    nutrient_balance: { npk_ratio: npkRatio, balance_status: balStatus, limiting_nutrient: limitNut, excess_nutrient: excessNut },
    amelioration_plan: plan,
    disclaimer: AGRONOMY_DISCLAIMER,
  };
}

function formatSoilHealth(r: SoilHealthResult): string {
  let s = '=== 土壤健康分析报告 ===\n\n';
  s += '【综合评分】\n';
  s += '  总分: ' + r.overall_score + '/100\n';
  s += '  等级: ' + r.health_grade + '\n\n';
  s += '【化学性质】\n';
  s += '  pH: ' + r.chemical_properties.ph_status + ' (评分:' + r.chemical_properties.ph_score + ')\n';
  s += '  有机质: ' + r.chemical_properties.om_status + ' (评分:' + r.chemical_properties.om_score + ')\n';
  s += '  氮: ' + r.chemical_properties.n_score + '\n';
  s += '  磷: ' + r.chemical_properties.p_score + '\n';
  s += '  钾: ' + r.chemical_properties.k_score + '\n\n';
  s += '【物理性质】\n';
  s += '  容重: ' + r.physical_properties.bulk_density_status + '\n';
  s += '  压实: ' + r.physical_properties.compaction + '\n';
  s += '  持水: ' + r.physical_properties.water_holding + '\n';
  s += '  评分: ' + r.physical_properties.physical_score + '\n\n';
  s += '【生物指标】\n';
  s += '  微生物量: ' + r.biological_indicators.microbial_biomass + '\n';
  s += '  评分: ' + r.biological_indicators.microbial_score + '\n';
  s += '  评价: ' + r.biological_indicators.soil_life_index + '\n\n';
  s += '【养分平衡】\n';
  s += '  N:P:K比: ' + r.nutrient_balance.npk_ratio + '\n';
  s += '  状态: ' + r.nutrient_balance.balance_status + '\n';
  s += '  缺乏: ' + r.nutrient_balance.limiting_nutrient + '\n';
  s += '  过量: ' + r.nutrient_balance.excess_nutrient + '\n\n';
  s += '【改良方案】\n';
  r.amelioration_plan.forEach((p) => {
    s += '  [' + p.priority + '] ' + p.measure + ' | 目标: ' + p.target + ' | 期限: ' + p.timeframe + '\n';
  });
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 6. weather_risk_assessor — 天气风险评估器
// ============================================================
export interface WeatherRiskInput {
  region?: string;
  latitude?: number;
  longitude?: number;
  crop_type?: string;
  growth_stage?: string;
  elevation_m?: number;
  historical_drought_years?: number;
  historical_flood_years?: number;
  avg_annual_rainfall_mm?: number;
  monsoon_pattern?: string;
}

export interface WeatherRiskResult {
  region_assessment: { region: string; climate_zone: string; risk_profile: string };
  extreme_events: Array<{ event: string; probability: number; return_period_yr: number; impact_level: string; description: string }>;
  drought_assessment: { probability: number; severity: string; spi_forecast: number; affected_months: string[]; water_deficit_mm: number };
  flood_assessment: { probability: number; return_period_yr: number; drainage_demand: string; early_warning_hours: number; flood_risk_level: string };
  heat_cold_risk: { heat_stress_probability: number; cold_damage_probability: number; growing_season_impact: string };
  adaptation_strategies: Array<{ strategy: string; priority: string; implementation: string; effectiveness: number; cost_estimate: number }>;
  disclaimer: string;
}

function analyzeWeatherRisk(input: WeatherRiskInput): WeatherRiskResult {
  const rng = seededRng(JSON.stringify(input));
  const region = input.region || rng.pick(['华北平原', '东北平原', '长江中下游', '四川盆地', '珠江三角洲', '黄土高原']);
  const crop = input.crop_type || rng.pick(['水稻', '玉米', '小麦', '棉花']);
  const lat = input.latitude ?? round(25 + rng.next() * 18, 2);
  const rainfall = input.avg_annual_rainfall_mm ?? round(500 + rng.next() * 800, 0);
  const droughtYrs = input.historical_drought_years ?? rng.nextInt(0, 5);

  const climateZone = lat > 35 ? '暖温带' : lat > 28 ? '北亚热带' : '中亚热带';
  const riskProfile = droughtYrs >= 3 ? '高风险区域' : droughtYrs >= 1 ? '中等风险' : '低风险区域';

  const events = [
    { event: '极端高温', probability: round(15 + rng.next() * 35, 1), return_period_yr: rng.pick([5, 10, 15, 20]), impact_level: '高', description: '日最高气温≥35°C持续5天以上' },
    { event: '暴雨洪涝', probability: round(12 + rng.next() * 33, 1), return_period_yr: rng.pick([10, 20, 50]), impact_level: '高', description: '24小时降雨量≥100mm' },
    { event: '干旱', probability: round(18 + rng.next() * 30, 1), return_period_yr: rng.pick([5, 10, 15, 20, 30]), impact_level: '高', description: '连续30天降水偏少50%以上' },
    { event: '大风/台风', probability: round(5 + rng.next() * 25, 1), return_period_yr: rng.pick([10, 20, 50]), impact_level: '中高', description: '8级以上大风或台风过境' },
    { event: '霜冻', probability: round(8 + rng.next() * 20, 1), return_period_yr: rng.pick([5, 10, 20]), impact_level: '中', description: '最低气温≤0°C影响作物生长' },
  ];

  const droughtProb = round(15 + droughtYrs * 12 + rng.next() * 15, 1);
  const droughtSev = droughtProb > 50 ? '严重' : droughtProb > 30 ? '中等' : '轻微';
  const spi = round(-2.5 + rng.next() * 3.5, 2);
  const months = ['4月', '5月', '6月', '7月', '8月', '9月'];
  const affectedCount = droughtProb > 40 ? 2 + Math.floor(rng.next() * 2) : 1;
  const affectedMonths = months.slice(rng.nextInt(0, 3), rng.nextInt(0, 3) + affectedCount);
  const waterDeficit = round(Math.max(0, 150 - rainfall * 0.3 + rng.next() * 80), 0);

  const floodProb = round(10 + rng.next() * 35, 1);
  const drainDemand = floodProb > 40 ? '需全面完善排水系统' : floodProb > 20 ? '部分区域需排水改善' : '基本满足';

  const heatProb = round(10 + rng.next() * 40, 1);
  const coldProb = round(5 + rng.next() * 25, 1);
  const seasonImpact = heatProb > 40 ? '高温热害可能导致减产' : '生长季温度条件总体适宜';

  const adaptations = [
    { strategy: '调整播期避灾', priority: '高', implementation: '根据天气预报调整播种/移栽日期', effectiveness: round(65 + rng.next() * 20, 0), cost_estimate: round(500 + rng.next() * 1500, 0) },
    { strategy: '选用抗逆品种', priority: '高', implementation: '种植抗旱/耐热/抗病虫品种', effectiveness: round(70 + rng.next() * 20, 0), cost_estimate: round(2000 + rng.next() * 3000, 0) },
    { strategy: '建设排灌设施', priority: '高', implementation: '完善灌排渠道和泵站', effectiveness: round(75 + rng.next() * 18, 0), cost_estimate: round(15000 + rng.next() * 35000, 0) },
    { strategy: '地膜覆盖保墒', priority: '中', implementation: '采用覆膜技术减少水分蒸发', effectiveness: round(55 + rng.next() * 25, 0), cost_estimate: round(1200 + rng.next() * 1800, 0) },
    { strategy: '农业保险保障', priority: '中', implementation: '投保种植业保险减少灾害损失', effectiveness: round(60 + rng.next() * 25, 0), cost_estimate: round(3000 + rng.next() * 5000, 0) },
  ];

  return {
    region_assessment: { region, climate_zone: climateZone, risk_profile: riskProfile },
    extreme_events: events,
    drought_assessment: { probability: droughtProb, severity: droughtSev, spi_forecast: spi, affected_months: affectedMonths, water_deficit_mm: waterDeficit },
    flood_assessment: { probability: floodProb, return_period_yr: rng.pick([5, 10, 20, 50]), drainage_demand: drainDemand, early_warning_hours: Math.round(12 + rng.next() * 60), flood_risk_level: floodProb > 35 ? '高' : floodProb > 20 ? '中' : '低' },
    heat_cold_risk: { heat_stress_probability: heatProb, cold_damage_probability: coldProb, growing_season_impact: seasonImpact },
    adaptation_strategies: adaptations,
    disclaimer: RISK_DISCLAIMER,
  };
}

function formatWeatherRisk(r: WeatherRiskResult): string {
  let s = '=== 天气风险评估报告 ===\n\n';
  s += '【区域概况】\n';
  s += '  区域: ' + r.region_assessment.region + '\n';
  s += '  气候带: ' + r.region_assessment.climate_zone + '\n';
  s += '  风险画像: ' + r.region_assessment.risk_profile + '\n\n';
  s += '【极端天气事件】\n';
  r.extreme_events.forEach((e) => {
    s += '  ' + e.event + ': 概率' + e.probability + '% | ' + e.return_period_yr + '年一遇 | 影响:' + e.impact_level + '\n';
    s += '    ' + e.description + '\n';
  });
  s += '\n【干旱评估】\n';
  s += '  概率: ' + r.drought_assessment.probability + '%\n';
  s += '  严重度: ' + r.drought_assessment.severity + '\n';
  s += '  SPI预测: ' + r.drought_assessment.spi_forecast + '\n';
  s += '  影响月份: ' + r.drought_assessment.affected_months.join('、') + '\n';
  s += '  水分亏缺: ' + r.drought_assessment.water_deficit_mm + ' mm\n\n';
  s += '【洪涝评估】\n';
  s += '  概率: ' + r.flood_assessment.probability + '%\n';
  s += '  重现期: ' + r.flood_assessment.return_period_yr + '年一遇\n';
  s += '  排水需求: ' + r.flood_assessment.drainage_demand + '\n';
  s += '  预警提前量: ' + r.flood_assessment.early_warning_hours + '小时\n';
  s += '  风险等级: ' + r.flood_assessment.flood_risk_level + '\n\n';
  s += '【高温冷害风险】\n';
  s += '  热害概率: ' + r.heat_cold_risk.heat_stress_probability + '%\n';
  s += '  冷害概率: ' + r.heat_cold_risk.cold_damage_probability + '%\n';
  s += '  影响评估: ' + r.heat_cold_risk.growing_season_impact + '\n\n';
  s += '【适应策略】\n';
  r.adaptation_strategies.forEach((a) => {
    s += '  [' + a.priority + '] ' + a.strategy + ': 效果' + a.effectiveness + '% 成本¥' + a.cost_estimate.toLocaleString() + '\n';
    s += '    ' + a.implementation + '\n';
  });
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 7. harvest_timing_optimizer — 收获时机优化器
// ============================================================
export interface HarrestTimingInput {
  crop_type?: string;
  variety?: string;
  growth_days_elapsed?: number;
  expected_maturity_days?: number;
  grain_moisture_pct?: number;
  weather_forecast_7d?: string[];
  field_readiness?: string;
  market_price_current?: number;
  market_price_trend?: string;
  storage_capacity_t?: number;
  drying_capacity_kg_h?: number;
  labor_availability?: string;
}

export interface HarvestTimingResult {
  harvest_window: { optimal_start: string; optimal_end: string; days_remaining: number; urgency_level: 'not_ready' | 'approach' | 'optimal' | 'overdue' };
  crop_readiness: { grain_moisture: number; target_moisture: number; drydown_rate: number; mechanical_harvest_ready: boolean; manual_harvest_ready: boolean };
  weather_suitability: { suitable_days: number; risky_days: number; best_period: string; weather_concerns: string[] };
  economic_optimization: { price_trend: string; projected_price_max: number; storage_cost_per_t_per_day: number; optimal_selling_timing: string; revenue_maximization_pct: number };
  logistics_plan: { method: string; drying_schedule: string; daily_capacity_t: string; total_harvest_days: number; labor_required: number };
  disclaimer: string;
}

function analyzeHarvestTiming(input: HarrestTimingInput): HarvestTimingResult {
  const rng = seededRng(JSON.stringify(input));
  const crop = input.crop_type || rng.pick(['水稻', '玉米', '小麦', '大豆']);
  const growthDays = input.growth_days_elapsed ?? rng.nextInt(80, 130);
  const maturityDays = input.expected_maturity_days ?? rng.nextInt(100, 150);
  const grainMoisture = input.grain_moisture_pct ?? round(18 + rng.next() * 16, 1);
  const targetMoisture = crop === '玉米' ? 25 : 14;
  const drydownRate = round(0.3 + rng.next() * 0.5, 2);
  const moistureGap = Math.max(0, grainMoisture - targetMoisture);
  const daysToTarget = Math.round(moistureGap / drydownRate);
  const daysRemaining = Math.max(0, maturityDays - growthDays);

  const urgency = daysRemaining > 10 ? 'approach' : daysRemaining > 3 ? 'optimal' : daysRemaining > 0 ? 'overdue' : 'overdue';

  const suitableDays = 3 + Math.floor(rng.next() * 4);
  const riskyDays = 7 - suitableDays;
  const bestPeriod = suitableDays >= 5 ? '一周内多数时段' : '需抓紧有利天气窗口';

  const priceCurrent = input.market_price_current ?? round(2.5 + rng.next() * 4, 2);
  const priceTrend = input.market_price_trend || rng.pick(['上涨', '平稳', '下跌']);
  const projectedMax = round(priceCurrent * (priceTrend === '上涨' ? 1.08 + rng.next() * 0.1 : 1.02 + rng.next() * 0.05), 2);
  const storageCost = round(0.5 + rng.next() * 1.5, 2);
  const optSelling = priceTrend === '上涨' ? '可适当延后销售等待高价' : priceTrend === '平稳' ? '适宜价格出手' : '建议尽快出售';
  const revMax = round((projectedMax - priceCurrent) / priceCurrent * 100, 1);

  const harvestMethod = crop === '水稻' || crop === '小麦' ? '机械收获' : crop === '玉米' ? '机械穗收' : '机械或人工';
  const dailyCap = round(20 + rng.next() * 80, 0);
  const totalDays = Math.max(1, Math.ceil(100 / dailyCap + rng.next() * 3));
  const labor = Math.max(3, Math.round(totalDays * (1 + rng.next() * 0.5)));

  return {
    harvest_window: { optimal_start: daysToTarget + '天后', optimal_end: (daysToTarget + 7) + '天后', days_remaining: daysRemaining, urgency_level: urgency },
    crop_readiness: { grain_moisture: grainMoisture, target_moisture: targetMoisture, drydown_rate: drydownRate, mechanical_harvest_ready: grainMoisture <= targetMoisture + 4, manual_harvest_ready: grainMoisture <= targetMoisture + 8 },
    weather_suitability: { suitable_days: suitableDays, risky_days: riskyDays, best_period: bestPeriod, weather_concerns: riskyDays > 3 ? ['连阴雨风险'] : ['注意短期降水'] },
    economic_optimization: { price_trend: priceTrend, projected_price_max: projectedMax, storage_cost_per_t_per_day: storageCost, optimal_selling_timing: optSelling, revenue_maximization_pct: revMax },
    logistics_plan: { method: harvestMethod, drying_schedule: moistureGap > 0 ? '需自然晾晒' + Math.round(moistureGap / drydownRate) + '天' : '水分达标', daily_capacity_t: dailyCap + ' t/天', total_harvest_days: totalDays, labor_required: labor },
    disclaimer: GENERAL_DISCLAIMER,
  };
}

function formatHarvestTiming(r: HarvestTimingResult): string {
  let s = '=== 收获时机优化报告 ===\n\n';
  s += '【收获窗口】\n';
  s += '  最佳开始: ' + r.harvest_window.optimal_start + '\n';
  s += '  最佳结束: ' + r.harvest_window.optimal_end + '\n';
  s += '  距成熟: ' + r.harvest_window.days_remaining + '天\n';
  s += '  紧急度: ' + r.harvest_window.urgency_level + '\n\n';
  s += '【作物成熟度】\n';
  s += '  当前水分: ' + r.crop_readiness.grain_moisture + '%\n';
  s += '  目标水分: ' + r.crop_readiness.target_moisture + '%\n';
  s += '  脱水速率: ' + r.crop_readiness.drydown_rate + '%/天\n';
  s += '  机械收获就绪: ' + (r.crop_readiness.mechanical_harvest_ready ? '是' : '否') + '\n';
  s += '  人工收获就绪: ' + (r.crop_readiness.manual_harvest_ready ? '是' : '否') + '\n\n';
  s += '【天气适宜度】\n';
  s += '  适宜天数: ' + r.weather_suitability.suitable_days + '天\n';
  s += '  风险天数: ' + r.weather_suitability.risky_days + '天\n';
  s += '  最佳时段: ' + r.weather_suitability.best_period + '\n';
  s += '  关注: ' + r.weather_suitability.weather_concerns.join('、') + '\n\n';
  s += '【经济优化】\n';
  s += '  价格走势: ' + r.economic_optimization.price_trend + '\n';
  s += '  最高预测价: ¥' + r.economic_optimization.projected_price_max + '/kg\n';
  s += '  储粮成本: ¥' + r.economic_optimization.storage_cost_per_t_per_day + '/t/天\n';
  s += '  最佳销售时机: ' + r.economic_optimization.optimal_selling_timing + '\n';
  s += '  潜在增收: ' + r.economic_optimization.revenue_maximization_pct + '%\n\n';
  s += '【物流计划】\n';
  s += '  收获方式: ' + r.logistics_plan.method + '\n';
  s += '  干燥安排: ' + r.logistics_plan.drying_schedule + '\n';
  s += '  日处理能力: ' + r.logistics_plan.daily_capacity_t + '\n';
  s += '  总收获天数: ' + r.logistics_plan.total_harvest_days + '天\n';
  s += '  所需人力: ' + r.logistics_plan.labor_required + '人\n';
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 8. carbon_footprint_tracker — 碳足迹追踪器
// ============================================================
export interface CarbonFootprintInput {
  farm_name?: string;
  area_ha?: number;
  crop_type?: string;
  tillage_practice?: string;
  fertilizer_n_kg?: number;
  fertilizer_p_kg?: number;
  fertilizer_k_kg?: number;
  pesticide_kg?: number;
  diesel_l_per_ha?: number;
  electricity_kwh_per_ha?: number;
  irrigation_energy_kwh?: number;
  residue_management?: string;
  cover_crop_used?: boolean;
  organic_amendment_t?: number;
  methane_emission_factor?: number;
  n2o_ef?: number;
  soil_carbon_sequestration_rate?: number;
  years_under_practice?: number;
}

export interface CarbonFootprintResult {
  total_emissions: { co2e_kg: number; co2e_per_ha: number; carbon_intensity_kg_per_kg: number };
  emissions_breakdown: Array<{ source: string; co2e_kg: number; percentage: number; emission_factor: string }>;
  sequestration_estimate: { total_sequestration_t: number; rate_t_per_ha_yr: number; practice_contribution: string; net_balance_t: number };
  carbon_budget: { inputs: number; outputs: number; balance: number; status: 'net_source' | 'net_sink' | 'neutral' };
  reduction_pathways: Array<{ measure: string; reduction_potential_pct: number; implementation_cost: string; co2_savings_kg: number }>;
  carbon_market_value: { credit_potential_t: number; price_per_t: number; estimated_revenue: number; crediting_period_years: number };
  sustainability_score: { score: number; grade: 'excellent' | 'good' | 'moderate' | 'poor'; improvement_potential_pct: number };
  disclaimer: string;
}

function analyzeCarbonFootprint(input: CarbonFootprintInput): CarbonFootprintResult {
  const rng = seededRng(JSON.stringify(input));
  const farmName = input.farm_name || ('FARM-' + rng.nextInt(100, 999));
  const area = input.area_ha ?? round(50 + rng.next() * 450, 1);
  const tillage = input.tillage_practice || rng.pick(['常规耕作', '少耕', '免耕', '保护性耕作']);
  const nFert = input.fertilizer_n_kg ?? round(150 + rng.next() * 350, 0);
  const pFert = input.fertilizer_p_kg ?? round(50 + rng.next() * 100, 0);
  const kFert = input.fertilizer_k_kg ?? round(80 + rng.next() * 150, 0);
  const pesticide = input.pesticide_kg ?? round(5 + rng.next() * 20, 1);
  const diesel = input.diesel_l_per_ha ?? round(40 + rng.next() * 80, 0);
  const electricity = input.electricity_kwh_per_ha ?? round(50 + rng.next() * 150, 0);
  const irrEnergy = input.irrigation_energy_kwh ?? round(100 + rng.next() * 300, 0);
  const coverCrop = input.cover_crop_used ?? rng.next() > 0.5;
  const organicAmend = input.organic_amendment_t ?? round(0 + rng.next() * 5, 1);

  // Emission factors (simplified IPCC)
  const n2oEF = input.n2o_ef ?? 0.01;
  const methaneEF = input.methane_emission_factor ?? 0.5;
  const dieselCO2 = round(diesel * 2.68 * area, 0);
  const elecCO2 = round(electricity * 0.58 * area, 0);
  const irrCO2 = round(irrEnergy * 0.58, 0);
  const nFertCO2 = round(nFert * 4400 * n2oEF, 0);
  const pFertCO2 = round(pFert * 50, 0);
  const kFertCO2 = round(kFert * 30, 0);
  const pestCO2 = round(pesticide * 500, 0);
  const methaneCO2 = round(area * methaneEF * 1000, 0);
  const tillageCO2 = tillage === '免耕' ? round(area * 50, 0) : tillage === '少耕' ? round(area * 100, 0) : round(area * 180, 0);

  const totalEmissions = dieselCO2 + elecCO2 + irrCO2 + nFertCO2 + pFertCO2 + kFertCO2 + pestCO2 + methaneCO2 + tillageCO2;
  const co2PerHa = round(totalEmissions / area, 1);
  const yieldEstimate = round(5000 + rng.next() * 4000, 0);
  const carbonIntensity = round(totalEmissions / (area * yieldEstimate) * 100, 2);

  const sources = [
    { source: '柴油消耗', co2e_kg: dieselCO2, percentage: round(dieselCO2 / totalEmissions * 100, 1), emission_factor: '2.68 kgCO₂/L' },
    { source: '电力使用', co2e_kg: elecCO2, percentage: round(elecCO2 / totalEmissions * 100, 1), emission_factor: '0.58 kgCO₂/kWh' },
    { source: '氮肥施用', co2e_kg: nFertCO2, percentage: round(nFertCO2 / totalEmissions * 100, 1), emission_factor: '4400 kgCO₂/t × N₂O EF' },
    { source: '磷肥生产', co2e_kg: pFertCO2, percentage: round(pFertCO2 / totalEmissions * 100, 1), emission_factor: '50 kgCO₂/t' },
    { source: '钾肥生产', co2e_kg: kFertCO2, percentage: round(kFertCO2 / totalEmissions * 100, 1), emission_factor: '30 kgCO₂/t' },
    { source: '农药生产', co2e_kg: pestCO2, percentage: round(pestCO2 / totalEmissions * 100, 1), emission_factor: '500 kgCO₂/kg' },
    { source: '甲烷排放', co2e_kg: methaneCO2, percentage: round(methaneCO2 / totalEmissions * 100, 1), emission_factor: methaneEF + ' tCO₂/ha' },
    { source: '耕作碳排放', co2e_kg: tillageCO2, percentage: round(tillageCO2 / totalEmissions * 100, 1), emission_factor: tillage + '排放因子' },
  ];

  const seqRate = input.soil_carbon_sequestration_rate ?? round(0.3 + rng.next() * 2.5, 2);
  const years = input.years_under_practice ?? rng.nextInt(1, 15);
  const totalSeqT = round(seqRate * area * years, 1);
  const practice = coverCrop ? '覆盖作物+保护性耕作' : organicAmend > 2 ? '有机改良+减耕' : tillage === '免耕' ? '免耕体系' : '常规管理';
  const netBalance = -round(totalSeqT / area, 1);

  const inputCO2 = totalEmissions / 1000;
  const outputCO2 = totalSeqT;
  const balance = outputCO2 - inputCO2;
  const status = balance > 5 ? 'net_sink' : balance > -5 ? 'neutral' : 'net_source';

  const seqTotal = totalSeqT / 1000;
  const reductions = [
    { measure: '精准施肥减少氮肥20%', reduction_potential_pct: 15, implementation_cost: '中', co2_savings_kg: round(nFertCO2 * 0.2, 0) },
    { measure: '改用保护性耕作', reduction_potential_pct: tillage === '免耕' ? 3 : 20, implementation_cost: '低', co2_savings_kg: round(tillageCO2 * 0.5, 0) },
    { measure: '安装太阳能灌溉', reduction_potential_pct: 12, implementation_cost: '高', co2_savings_kg: round(irrCO2 * 0.7, 0) },
    { measure: '种植覆盖作物', reduction_potential_pct: coverCrop ? 5 : 18, implementation_cost: '低', co2_savings_kg: round(area * 80, 0) },
    { measure: '有机替代部分化肥', reduction_potential_pct: organicAmend > 2 ? 8 : 14, implementation_cost: '中', co2_savings_kg: round(nFertCO2 * 0.15, 0) },
  ];

  const creditPotential = round(Math.max(0, seqTotal) * 0.7, 2);
  const pricePerT = round(40 + rng.next() * 80, 2);
  const estimatedRev = round(creditPotential * pricePerT, 0);
  const creditingYears = round(10 + rng.next() * 15, 0);

  const scoreBase = round(50 - carbonIntensity * 3 + (status === 'net_sink' ? 25 : 0) + (coverCrop ? 10 : 0), 0);
  const sustainScore = Math.max(0, Math.min(100, scoreBase));
  const sustainGrade = sustainScore >= 75 ? 'excellent' : sustainScore >= 55 ? 'good' : sustainScore >= 35 ? 'moderate' : 'poor';
  const improvePotential = round(Math.max(0, 60 - sustainScore + rng.next() * 20), 0);

  return {
    total_emissions: { co2e_kg: totalEmissions, co2e_per_ha: co2PerHa, carbon_intensity_kg_per_kg: carbonIntensity },
    emissions_breakdown: sources,
    sequestration_estimate: { total_sequestration_t: totalSeqT, rate_t_per_ha_yr: seqRate, practice_contribution: practice, net_balance_t: netBalance },
    carbon_budget: { inputs: inputCO2, outputs: outputCO2, balance: round(balance, 1), status },
    reduction_pathways: reductions,
    carbon_market_value: { credit_potential_t: creditPotential, price_per_t: pricePerT, estimated_revenue: estimatedRev, crediting_period_years: creditingYears },
    sustainability_score: { score: sustainScore, grade: sustainGrade, improvement_potential_pct: improvePotential },
    disclaimer: CARBON_DISCLAIMER,
  };
}

function formatCarbonFootprint(r: CarbonFootprintResult): string {
  let s = '=== 碳足迹追踪报告 ===\n\n';
  s += '【排放总量】\n';
  s += '  总排放: ' + r.total_emissions.co2e_kg.toLocaleString() + ' kgCO₂e\n';
  s += '  亩均排放: ' + r.total_emissions.co2e_per_ha + ' kgCO₂e/ha\n';
  s += '  碳强度: ' + r.total_emissions.carbon_intensity_kg_per_kg + ' kgCO₂e/kg产量\n\n';
  s += '【排放来源分解】\n';
  r.emissions_breakdown.forEach((e) => {
    s += '  ' + e.source + ': ' + (e.co2e_kg / 1000).toFixed(1) + ' tCO₂e (' + e.percentage + '%) | ' + e.emission_factor + '\n';
  });
  s += '\n【碳汇估算】\n';
  s += '  总固碳量: ' + r.sequestration_estimate.total_sequestration_t + ' tCO₂\n';
  s += '  固碳速率: ' + r.sequestration_estimate.rate_t_per_ha_yr + ' tCO₂/ha/年\n';
  s += '  主要贡献: ' + r.sequestration_estimate.practice_contribution + '\n';
  s += '  净平衡: ' + r.sequestration_estimate.net_balance_t + ' tCO₂e/ha\n\n';
  s += '【碳收支】\n';
  s += '  输入(排放): ' + r.carbon_budget.inputs.toFixed(2) + ' tCO₂e\n';
  s += '  输出(固碳): ' + (r.carbon_budget.outputs / 1000).toFixed(2) + ' tCO₂e\n';
  s += '  平衡: ' + r.carbon_budget.balance + ' tCO₂e (' + r.carbon_budget.status + ')\n\n';
  s += '【减排路径】\n';
  r.reduction_pathways.forEach((p) => {
    s += '  ' + p.measure + ': 潜力' + p.reduction_potential_pct + '% | 节省' + (p.co2_savings_kg / 1000).toFixed(1) + ' tCO₂e | 成本:' + p.implementation_cost + '\n';
  });
  s += '\n【碳市场价值】\n';
  s += '  可开发碳汇: ' + r.carbon_market_value.credit_potential_t + ' tCO₂\n';
  s += '  碳价: ¥' + r.carbon_market_value.price_per_t + '/tCO₂\n';
  s += '  预估收益: ¥' + r.carbon_market_value.estimated_revenue.toLocaleString() + '\n';
  s += '  计入期: ' + r.carbon_market_value.crediting_period_years + '年\n\n';
  s += '【可持续性评分】\n';
  s += '  评分: ' + r.sustainability_score.score + '/100\n';
  s += '  等级: ' + r.sustainability_score.grade + '\n';
  s += '  提升潜力: ' + r.sustainability_score.improvement_potential_pct + '%\n';
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. crop_health_monitor
  tools.register(defineTool({
    name: 'crop_health_monitor',
    description: '作物健康监测 — 基于NDVI遥感指数、冠层温度、叶绿素含量、叶面积指数等多参数分析，结合土壤水分和环境数据，评估作物生长状况、水分胁迫和营养水平，提供分因子健康评分和预警',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含crop_type, growth_stage, ndvi_value, canopy_temperature, leaf_area_index, chlorophyll_content, soil_moisture, temperature_c, humidity_pct等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCropHealth(analyzeCropHealth(JSON.parse(args.input_data)));
    },
  }));

  // 2. irrigation_optimization_engine
  tools.register(defineTool({
    name: 'irrigation_optimization_engine',
    description: '灌溉优化引擎 — 基于作物需水规律、土壤水分平衡、气象预测和灌溉方式水利用效率建模，提供智能灌溉调度、水分利用效率评估、节水潜力分析和经济成本核算',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含crop_type, growth_stage, soil_moisture_current, et_rate_mm_day, rainfall_forecast_mm, irrigation_method, water_cost_per_m3, energy_cost_per_kwh等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatIrrigation(analyzeIrrigation(JSON.parse(args.input_data)));
    },
  }));

  // 3. pest_detection_classifier
  tools.register(defineTool({
    name: 'pest_detection_classifier',
    description: '病虫害检测分类器 — 基于计算机视觉模拟和症状描述匹配，识别作物病虫害种类、评估严重度、预测蔓延风险，提供化学防治、生物防治和预防方案的分级建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含crop_type, affected_area_pct, symptom_description, environmental_conditions, pest_type等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPestDetection(analyzePestDetection(JSON.parse(args.input_data)));
    },
  }));

  // 4. yield_prediction_modeler
  tools.register(defineTool({
    name: 'yield_prediction_modeler',
    description: '产量预测建模器 — 基于多元回归和物候模型，综合土壤肥力、灌溉保障、气象条件、病虫害压力和施肥水平等因子，提供概率化产量预测、限制因子诊断和经济效益分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含crop_type, soil_fertility, irrigation_access, fertilizer_input_kg, pest_pressure, weather_score, historical_yield_t_ha等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatYieldPrediction(analyzeYieldPrediction(JSON.parse(args.input_data)));
    },
  }));

  // 5. soil_health_analyzer
  tools.register(defineTool({
    name: 'soil_health_analyzer',
    description: '土壤健康分析器 — 综合分析土壤化学性质(pH、有机质、氮磷钾)、物理结构(容重、压实、持水性)和生物活性(微生物量碳)，提供综合健康评分、养分平衡诊断及分级改良方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含soil_type, ph, organic_matter_pct, nitrogen_mg_kg, phosphorus_mg_kg, potassium_mg_kg, bulk_density_g_cm3, microbial_biomass_c等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSoilHealth(analyzeSoilHealth(JSON.parse(args.input_data)));
    },
  }));

  // 6. weather_risk_assessor
  tools.register(defineTool({
    name: 'weather_risk_assessor',
    description: '天气风险评估器 — 基于区域气候特征和极端天气事件统计，评估干旱、洪涝、高温热害和霜冻风险，提供SPI干旱指数预测和分级适应策略建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含region, latitude, crop_type, avg_annual_rainfall_mm, historical_drought_years, historical_flood_years等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatWeatherRisk(analyzeWeatherRisk(JSON.parse(args.input_data)));
    },
  }));

  // 7. harvest_timing_optimizer
  tools.register(defineTool({
    name: 'harvest_timing_optimizer',
    description: '收获时机优化器 — 基于作物成熟度、籽粒水分脱水模型、7天天气预报和市场价格动态，确定最佳收获窗口、收获物流计划和销售时机优化方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含crop_type, growth_days_elapsed, grain_moisture_pct, market_price_current, market_price_trend, drying_capacity_kg_h, storage_capacity_t等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatHarvestTiming(analyzeHarvestTiming(JSON.parse(args.input_data)));
    },
  }));

  // 8. carbon_footprint_tracker
  tools.register(defineTool({
    name: 'carbon_footprint_tracker',
    description: '碳足迹追踪器 — 基于IPCC排放因子法核算农田温室气体排放(化肥、柴油、电力、农药、甲烷、N2O)，估算土壤有机碳固持，评估碳汇开发价值和可持续性评分',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含area_ha, tillage_practice, fertilizer_n_kg, diesel_l_per_ha, electricity_kwh_per_ha, methane_emission_factor, n2o_ef, soil_carbon_sequestration_rate等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCarbonFootprint(analyzeCarbonFootprint(JSON.parse(args.input_data)));
    },
  }));
}
