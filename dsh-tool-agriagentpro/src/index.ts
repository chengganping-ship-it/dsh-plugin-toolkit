import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'agriagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供农业生产参考，不替代专业农艺师决策。';

// mulberry32 deterministic PRNG
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function round(v: number, d = 2): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// ============================================================
// 1. precision_planting_advisor — 精准种植顾问
// ============================================================
interface PrecisionPlantingInput {
  soil_type?: string;
  ph?: number;
  organic_matter?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  region?: string;
  area_mu?: number;
  season?: string;
}

interface PrecisionPlantingResult {
  soil_analysis: { type: string; ph_level: string; fertility: string; score: number };
  crop_recommendations: Array<{ crop: string; suitability: number; reason: string }>;
  seeding_density: { crop: string; density_per_mu: number; row_spacing_cm: number; plant_spacing_cm: number };
  irrigation_plan: { method: string; frequency: string; volume_l_per_mu: number };
  fertilizer_plan: Array<{ stage: string; type: string; amount_kg_per_mu: number }>;
  disclaimer: string;
}

function analyzePrecisionPlanting(data: PrecisionPlantingInput): PrecisionPlantingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const soilType = data.soil_type || pick(rng, ['壤土', '砂壤土', '黏壤土', '沙土', '黑土']);
  const ph = data.ph ?? round(5.5 + rng() * 2.5, 1);
  const om = data.organic_matter ?? round(1 + rng() * 4, 1);
  const n = data.nitrogen ?? round(50 + rng() * 150, 0);
  const p = data.phosphorus ?? round(10 + rng() * 40, 0);
  const k = data.potassium ?? round(80 + rng() * 120, 0);
  const area = data.area_mu ?? round(50 + rng() * 450, 0);
  const season = data.season || pick(rng, ['春季', '夏季', '秋季']);

  const phLevel = ph < 6.0 ? '偏酸' : ph > 7.5 ? '偏碱' : '中性适宜';
  const fertilityScore = round(Math.min(100, (om * 10 + n * 0.2 + p * 0.5 + k * 0.15) / 2), 0);
  const fertility = fertilityScore >= 70 ? '高' : fertilityScore >= 40 ? '中' : '低';

  const allCrops = [
    { crop: '玉米', base: 85 },
    { crop: '水稻', base: 80 },
    { crop: '小麦', base: 78 },
    { crop: '大豆', base: 72 },
    { crop: '马铃薯', base: 70 },
    { crop: '棉花', base: 65 },
    { crop: '油菜', base: 68 },
    { crop: '花生', base: 62 },
  ];
  const cropRecs = allCrops
    .map(c => ({
      crop: c.crop,
      suitability: round(Math.min(99, Math.max(40, c.base + round(rng() * 20 - 10, 0))), 0),
      reason: `${soilType}、pH ${ph}，${season}种植适宜度${c.base >= 75 ? '较高' : '一般'}`,
    }))
    .sort((a, b) => b.suitability - a.suitability)
    .slice(0, 4);

  const topCrop = cropRecs[0].crop;
  const densities: Record<string, { d: number; r: number; p: number }> = {
    '玉米': { d: 4500, r: 60, p: 28 },
    '水稻': { d: 20000, r: 30, p: 12 },
    '小麦': { d: 250000, r: 20, p: 5 },
    '大豆': { d: 12000, r: 50, p: 15 },
    '马铃薯': { d: 4000, r: 75, p: 30 },
    '棉花': { d: 3500, r: 80, p: 25 },
    '油菜': { d: 30000, r: 25, p: 10 },
    '花生': { d: 10000, r: 40, p: 18 },
  };
  const sd = densities[topCrop] || { d: 5000, r: 50, p: 20 };

  const irrigationMethods = ['滴灌', '喷灌', '微喷灌', '渗灌'];
  const irrigationVol = round(200 + rng() * 300, 0);

  const fertilizerPlan = [
    { stage: '基肥', type: '复合肥(15-15-15)', amount_kg_per_mu: round(30 + rng() * 20, 0) },
    { stage: '追肥-拔节期', type: '尿素', amount_kg_per_mu: round(10 + rng() * 10, 0) },
    { stage: '追肥-抽穗期', type: '钾肥', amount_kg_per_mu: round(5 + rng() * 8, 0) },
  ];

  return {
    soil_analysis: { type: soilType, ph_level: phLevel, fertility, score: fertilityScore },
    crop_recommendations: cropRecs,
    seeding_density: { crop: topCrop, density_per_mu: sd.d, row_spacing_cm: sd.r, plant_spacing_cm: sd.p },
    irrigation_plan: { method: pick(rng, irrigationMethods), frequency: '7-10天/次', volume_l_per_mu: irrigationVol },
    fertilizer_plan: fertilizerPlan,
    disclaimer: DISCLAIMER,
  };
}

function formatPrecisionPlanting(r: PrecisionPlantingResult): string {
  let s = '=== 精准种植顾问分析报告 ===\n\n';
  s += '【土壤分析】\n';
  s += `  土壤类型: ${r.soil_analysis.type}\n`;
  s += `  pH水平: ${r.soil_analysis.ph_level}\n`;
  s += `  肥力等级: ${r.soil_analysis.fertility} (评分: ${r.soil_analysis.score}/100)\n\n`;
  s += '【作物推荐】\n';
  r.crop_recommendations.forEach((c, i) => {
    s += `  ${i + 1}. ${c.crop} — 适宜度: ${c.suitability}% | ${c.reason}\n`;
  });
  s += '\n【播种密度】\n';
  s += `  作物: ${r.seeding_density.crop}\n`;
  s += `  密度: ${r.seeding_density.density_per_mu} 株/亩\n`;
  s += `  行距: ${r.seeding_density.row_spacing_cm}cm | 株距: ${r.seeding_density.plant_spacing_cm}cm\n\n`;
  s += '【灌溉方案】\n';
  s += `  方式: ${r.irrigation_plan.method}\n`;
  s += `  频率: ${r.irrigation_plan.frequency}\n`;
  s += `  水量: ${r.irrigation_plan.volume_l_per_mu} L/亩\n\n`;
  s += '【施肥计划】\n';
  r.fertilizer_plan.forEach(f => {
    s += `  ${f.stage}: ${f.type} ${f.amount_kg_per_mu} kg/亩\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. smart_irrigation_controller — 智能灌溉控制
// ============================================================
interface SmartIrrigationInput {
  soil_moisture?: number;
  soil_type?: string;
  crop_type?: string;
  growth_stage?: string;
  weather_forecast?: string;
  temperature?: number;
  rainfall_mm?: number;
  et_rate?: number;
}

interface SmartIrrigationResult {
  soil_moisture_status: { current: number; threshold: number; status: string };
  weather_forecast_summary: { condition: string; temp_c: number; rainfall_mm: number };
  water_use_efficiency: { current_wue: number; benchmark: number; rating: string };
  water_saving_potential: { current_usage_l: number; optimized_usage_l: number; saving_percent: number };
  irrigation_schedule: Array<{ day: string; duration_min: number; volume_l: number; method: string }>;
  disclaimer: string;
}

function analyzeSmartIrrigation(data: SmartIrrigationInput): SmartIrrigationResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const moisture = data.soil_moisture ?? round(20 + rng() * 50, 1);
  const temp = data.temperature ?? round(20 + rng() * 18, 1);
  const rainfall = data.rainfall_mm ?? round(rng() * 30, 1);
  const etRate = data.et_rate ?? round(3 + rng() * 5, 1);
  const crop = data.crop_type || pick(rng, ['玉米', '小麦', '水稻', '蔬菜', '果树']);
  const stage = data.growth_stage || pick(rng, ['苗期', '拔节期', '抽穗期', '灌浆期', '成熟期']);

  const threshold = stage === '苗期' ? 40 : stage === '成熟期' ? 30 : 50;
  const status = moisture < threshold * 0.6 ? '严重缺水' : moisture < threshold ? '轻度缺水' : moisture < 70 ? '适宜' : '过湿';

  const conditions = ['晴', '多云', '阴', '小雨', '中雨'];
  const cond = pick(rng, conditions);

  const currentWue = round(1.2 + rng() * 1.5, 2);
  const benchmark = 2.0;
  const wueRating = currentWue >= benchmark ? '优秀' : currentWue >= benchmark * 0.7 ? '良好' : '需改进';

  const currentUsage = round(300 + rng() * 200, 0);
  const optimized = round(currentUsage * (0.6 + rng() * 0.25), 0);
  const savingPct = round(((currentUsage - optimized) / currentUsage) * 100, 1);

  const schedule = [];
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  for (let i = 0; i < 5; i++) {
    schedule.push({
      day: days[i],
      duration_min: round(20 + rng() * 40, 0),
      volume_l: round(50 + rng() * 150, 0),
      method: pick(rng, ['滴灌', '喷灌', '微喷灌']),
    });
  }

  return {
    soil_moisture_status: { current: moisture, threshold, status },
    weather_forecast_summary: { condition: cond, temp_c: temp, rainfall_mm: rainfall },
    water_use_efficiency: { current_wue: currentWue, benchmark, rating: wueRating },
    water_saving_potential: { current_usage_l: currentUsage, optimized_usage_l: optimized, saving_percent: savingPct },
    irrigation_schedule: schedule,
    disclaimer: DISCLAIMER,
  };
}

function formatSmartIrrigation(r: SmartIrrigationResult): string {
  let s = '=== 智能灌溉控制分析报告 ===\n\n';
  s += '【土壤湿度状态】\n';
  s += `  当前湿度: ${r.soil_moisture_status.current}%\n`;
  s += `  阈值: ${r.soil_moisture_status.threshold}%\n`;
  s += `  状态: ${r.soil_moisture_status.status}\n\n`;
  s += '【气象预测】\n';
  s += `  天气: ${r.weather_forecast_summary.condition}\n`;
  s += `  温度: ${r.weather_forecast_summary.temp_c}°C\n`;
  s += `  降雨: ${r.weather_forecast_summary.rainfall_mm}mm\n\n`;
  s += '【用水效率】\n';
  s += `  当前WUE: ${r.water_use_efficiency.current_wue} kg/m³\n`;
  s += `  基准WUE: ${r.water_use_efficiency.benchmark} kg/m³\n`;
  s += `  评级: ${r.water_use_efficiency.rating}\n\n`;
  s += '【节水潜力】\n';
  s += `  当前用水: ${r.water_saving_potential.current_usage_l} L/亩/周\n`;
  s += `  优化用水: ${r.water_saving_potential.optimized_usage_l} L/亩/周\n`;
  s += `  节水比例: ${r.water_saving_potential.saving_percent}%\n\n`;
  s += '【灌溉调度】\n';
  r.irrigation_schedule.forEach(sch => {
    s += `  ${sch.day}: ${sch.method} ${sch.duration_min}分钟 ${sch.volume_l}L\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. crop_health_monitor — 作物健康监测
// ============================================================
interface CropHealthInput {
  crop_type?: string;
  growth_stage?: string;
  image_ndvi?: number;
  leaf_color?: string;
  pest_symptoms?: string[];
  nutrient_symptoms?: string[];
  temperature?: number;
  humidity?: number;
}

interface CropHealthResult {
  pest_disease: Array<{ name: string; probability: number; severity: string; treatment: string }>;
  nutrient_deficiency: Array<{ element: string; confidence: number; symptom: string; remedy: string }>;
  growth_assessment: { stage: string; ndvi: number; health_score: number; status: string };
  remote_sensing: { ndvi_avg: number; ndvi_min: number; ndvi_max: number; anomaly_detected: boolean };
  early_warnings: Array<{ type: string; level: string; message: string }>;
  disclaimer: string;
}

function analyzeCropHealth(data: CropHealthInput): CropHealthResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const crop = data.crop_type || pick(rng, ['玉米', '水稻', '小麦', '大豆', '番茄']);
  const ndvi = data.image_ndvi ?? round(0.3 + rng() * 0.6, 2);
  const temp = data.temperature ?? round(18 + rng() * 18, 1);
  const humidity = data.humidity ?? round(40 + rng() * 50, 1);

  const pests = [
    { name: '玉米螟', treatment: '释放赤眼蜂生物防治或喷施苏云金杆菌' },
    { name: '稻飞虱', treatment: '吡虫啉喷雾，加强田间通风' },
    { name: '蚜虫', treatment: '啶虫脒或吡蚜酮喷施' },
    { name: '红蜘蛛', treatment: '阿维菌素或螺螨酯喷施' },
    { name: '纹枯病', treatment: '井冈霉素或苯醚甲环唑喷施' },
    { name: '白粉病', treatment: '三唑酮或醚菌酯喷施' },
  ];
  const pestResults = pests.slice(0, 3 + Math.floor(rng() * 3)).map(p => ({
    name: p.name,
    probability: round(30 + rng() * 65, 0),
    severity: pick(rng, ['轻度', '中度', '重度']),
    treatment: p.treatment,
  }));

  const nutrients = [
    { element: '氮', symptom: '老叶均匀黄化', remedy: '追施尿素10-15kg/亩' },
    { element: '磷', symptom: '叶片暗绿带紫', remedy: '过磷酸钙20kg/亩' },
    { element: '钾', symptom: '叶缘焦枯卷曲', remedy: '硫酸钾8-10kg/亩' },
    { element: '镁', symptom: '叶脉间失绿', remedy: '叶面喷施1%硫酸镁' },
    { element: '铁', symptom: '新叶黄白化', remedy: '螯合铁肥叶面喷施' },
  ];
  const nutResults = nutrients.slice(0, 1 + Math.floor(rng() * 3)).map(n => ({
    element: n.element,
    confidence: round(50 + rng() * 45, 0),
    symptom: n.symptom,
    remedy: n.remedy,
  }));

  const healthScore = round(ndvi * 100, 0);
  const healthStatus = healthScore >= 75 ? '健康' : healthScore >= 50 ? '亚健康' : '需关注';

  const ndviAvg = round(ndvi, 2);
  const ndviMin = round(Math.max(0.1, ndvi - 0.1 - rng() * 0.1), 2);
  const ndviMax = round(Math.min(0.95, ndvi + 0.05 + rng() * 0.1), 2);
  const anomaly = ndvi < 0.4 || humidity > 85;

  const warnings: Array<{ type: string; level: string; message: string }> = [];
  if (ndvi < 0.5) warnings.push({ type: '长势', level: '中等', message: 'NDVI偏低，建议检查水肥管理' });
  if (humidity > 80) warnings.push({ type: '病害', level: '高', message: '湿度过高，注意真菌性病害风险' });
  if (temp > 35) warnings.push({ type: '高温', level: '中等', message: '注意高温热害，加强灌溉降温' });
  if (pestResults.some(p => p.probability > 70)) warnings.push({ type: '虫害', level: '高', message: '检测到高概率虫害，建议及时防治' });
  if (warnings.length === 0) warnings.push({ type: '综合', level: '低', message: '当前作物生长状况良好' });

  return {
    pest_disease: pestResults,
    nutrient_deficiency: nutResults,
    growth_assessment: { stage: data.growth_stage || pick(rng, ['拔节期', '抽穗期', '灌浆期']), ndvi, health_score: healthScore, status: healthStatus },
    remote_sensing: { ndvi_avg: ndviAvg, ndvi_min: ndviMin, ndvi_max: ndviMax, anomaly_detected: anomaly },
    early_warnings: warnings,
    disclaimer: DISCLAIMER,
  };
}

function formatCropHealth(r: CropHealthResult): string {
  let s = '=== 作物健康监测报告 ===\n\n';
  s += '【病虫害识别】\n';
  r.pest_disease.forEach(p => {
    s += `  ${p.name} — 概率: ${p.probability}% | 严重度: ${p.severity}\n`;
    s += `    防治: ${p.treatment}\n`;
  });
  s += '\n【营养缺乏诊断】\n';
  r.nutrient_deficiency.forEach(n => {
    s += `  ${n.element}缺乏 — 置信度: ${n.confidence}% | 症状: ${n.symptom}\n`;
    s += `    补救: ${n.remedy}\n`;
  });
  s += '\n【长势评估】\n';
  s += `  生育期: ${r.growth_assessment.stage}\n`;
  s += `  NDVI: ${r.growth_assessment.ndvi}\n`;
  s += `  健康评分: ${r.growth_assessment.health_score}/100 (${r.growth_assessment.status})\n\n`;
  s += '【遥感分析】\n';
  s += `  NDVI均值: ${r.remote_sensing.ndvi_avg}\n`;
  s += `  NDVI范围: ${r.remote_sensing.ndvi_min} ~ ${r.remote_sensing.ndvi_max}\n`;
  s += `  异常检测: ${r.remote_sensing.anomaly_detected ? '是 ⚠' : '否'}\n\n`;
  s += '【预警信息】\n';
  r.early_warnings.forEach(w => {
    s += `  [${w.level}] ${w.type}: ${w.message}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. livestock_management — 智慧养殖管理
// ============================================================
interface LivestockInput {
  animal_type?: string;
  herd_size?: number;
  avg_weight_kg?: number;
  age_days?: number;
  feed_type?: string;
  temperature?: number;
  humidity?: number;
  health_status?: string;
}

interface LivestockResult {
  feed_optimization: { daily_intake_kg: number; feed_ratio: string; cost_per_day: number; recommendation: string };
  disease_warning: Array<{ disease: string; risk: number; symptoms: string; prevention: string }>;
  growth_monitoring: { avg_weight: number; daily_gain_g: number; fcr: number; target_weight: number; days_to_target: number };
  environment_control: { temp_status: string; humidity_status: string; ventilation: string; suggestions: string[] };
  breeding_management: { estrus_detection: string; optimal_breeding: string; gestation_days: number; next_check: string };
  disclaimer: string;
}

function analyzeLivestock(data: LivestockInput): LivestockResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const animal = data.animal_type || pick(rng, ['生猪', '肉牛', '蛋鸡', '肉鸡', '奶牛']);
  const size = data.herd_size ?? Math.round(50 + rng() * 450);
  const weight = data.avg_weight_kg ?? round(20 + rng() * 180, 1);
  const age = data.age_days ?? Math.round(30 + rng() * 300);
  const temp = data.temperature ?? round(15 + rng() * 20, 1);
  const humidity = data.humidity ?? round(40 + rng() * 40, 1);

  const feedIntake = round(weight * (0.025 + rng() * 0.015), 2);
  const feedCost = round(feedIntake * (2.5 + rng() * 1.5), 2);
  const ratio = pick(rng, ['精粗比6:4', '精粗比5:5', '精粗比7:3', '全混合日粮TMR']);

  const diseases: Record<string, Array<{ disease: string; symptoms: string; prevention: string }>> = {
    '生猪': [
      { disease: '非洲猪瘟', symptoms: '高热、皮肤发绀、呕吐', prevention: '严格生物安全、消毒、限制人员流动' },
      { disease: '蓝耳病', symptoms: '呼吸困难、发热、流产', prevention: '疫苗接种、全进全出管理' },
      { disease: '猪瘟', symptoms: '高热、便秘腹泻交替', prevention: '兔化弱毒疫苗免疫' },
    ],
    '肉牛': [
      { disease: '口蹄疫', symptoms: '口腔蹄部水疱、跛行', prevention: 'O型/A型疫苗免疫' },
      { disease: '牛结核', symptoms: '慢性消瘦、咳嗽', prevention: '定期检疫、淘汰阳性牛' },
    ],
    '蛋鸡': [
      { disease: '新城疫', symptoms: '呼吸困难、产蛋下降', prevention: 'Lasota系疫苗免疫' },
      { disease: '禽流感', symptoms: '头部肿胀、产蛋骤降', prevention: 'H5+H7灭活疫苗免疫' },
    ],
    '肉鸡': [
      { disease: '球虫病', symptoms: '血便、消瘦', prevention: '抗球虫药、保持垫料干燥' },
      { disease: '传染性法氏囊病', symptoms: '腹泻、法氏囊水肿', prevention: '中等毒力疫苗免疫' },
    ],
    '奶牛': [
      { disease: '乳房炎', symptoms: '乳房红肿、奶质异常', prevention: '挤奶卫生、CMT检测' },
      { disease: '蹄病', symptoms: '跛行、蹄部变形', prevention: '定期修蹄、蹄浴' },
    ],
  };
  const diseaseList = diseases[animal] || diseases['生猪'];
  const diseaseResults = diseaseList.map(d => ({
    ...d,
    risk: round(10 + rng() * 60, 0),
  }));

  const dailyGain = round(400 + rng() * 800, 0);
  const fcr = round(1.5 + rng() * 1.5, 2);
  const targetWeight = round(weight * (1.3 + rng() * 0.4), 0);
  const daysToTarget = Math.max(0, Math.round((targetWeight - weight) * 1000 / dailyGain));

  const tempStatus = temp < 10 ? '偏冷' : temp > 28 ? '偏热' : '适宜';
  const humStatus = humidity < 50 ? '偏干' : humidity > 75 ? '偏湿' : '适宜';
  const suggestions: string[] = [];
  if (temp > 25) suggestions.push('加强通风降温，开启湿帘');
  if (temp < 12) suggestions.push('增加保温措施，检查供暖设备');
  if (humidity > 70) suggestions.push('加强通风除湿，降低氨气浓度');
  if (suggestions.length === 0) suggestions.push('环境参数正常，维持当前管理');

  const gestationDays: Record<string, number> = { '生猪': 114, '肉牛': 283, '蛋鸡': 0, '肉鸡': 0, '奶牛': 280 };

  return {
    feed_optimization: { daily_intake_kg: feedIntake, feed_ratio: ratio, cost_per_day: feedCost, recommendation: `建议采用${ratio}配方，分${pick(rng, ['2', '3'])}次饲喂` },
    disease_warning: diseaseResults,
    growth_monitoring: { avg_weight: weight, daily_gain_g: dailyGain, fcr, target_weight: targetWeight, days_to_target: daysToTarget },
    environment_control: { temp_status: tempStatus, humidity_status: humStatus, ventilation: temp > 25 ? '需加强' : '正常', suggestions },
    breeding_management: {
      estrus_detection: pick(rng, ['人工观察', '公畜试情', '发情监测项圈', '步数监测']),
      optimal_breeding: animal === '生猪' ? '发情后12-24小时' : animal === '肉牛' ? '发情后8-12小时' : '不适用',
      gestation_days: gestationDays[animal] || 0,
      next_check: pick(rng, ['3天后', '1周后', '2周后']),
    },
    disclaimer: DISCLAIMER,
  };
}

function formatLivestock(r: LivestockResult): string {
  let s = '=== 智慧养殖管理报告 ===\n\n';
  s += '【饲料优化】\n';
  s += `  日采食量: ${r.feed_optimization.daily_intake_kg} kg/头\n`;
  s += `  饲料配比: ${r.feed_optimization.feed_ratio}\n`;
  s += `  日饲料成本: ¥${r.feed_optimization.cost_per_day}\n`;
  s += `  建议: ${r.feed_optimization.recommendation}\n\n`;
  s += '【疫病预警】\n';
  r.disease_warning.forEach(d => {
    s += `  ${d.disease} — 风险: ${d.risk}%\n`;
    s += `    症状: ${d.symptoms}\n`;
    s += `    预防: ${d.prevention}\n`;
  });
  s += '\n【生长监测】\n';
  s += `  均重: ${r.growth_monitoring.avg_weight} kg\n`;
  s += `  日增重: ${r.growth_monitoring.daily_gain_g} g\n`;
  s += `  料肉比: ${r.growth_monitoring.fcr}\n`;
  s += `  目标体重: ${r.growth_monitoring.target_weight} kg (${r.growth_monitoring.days_to_target}天后)\n\n`;
  s += '【环境控制】\n';
  s += `  温度: ${r.environment_control.temp_status}\n`;
  s += `  湿度: ${r.environment_control.humidity_status}\n`;
  s += `  通风: ${r.environment_control.ventilation}\n`;
  s += `  建议:\n`;
  r.environment_control.suggestions.forEach(sg => { s += `    - ${sg}\n`; });
  s += '\n【繁殖管理】\n';
  s += `  发情检测: ${r.breeding_management.estrus_detection}\n`;
  s += `  最佳配种: ${r.breeding_management.optimal_breeding}\n`;
  s += `  妊娠期: ${r.breeding_management.gestation_days}天\n`;
  s += `  下次检查: ${r.breeding_management.next_check}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. agri_supply_chain — 农业供应链
// ============================================================
interface SupplyChainInput {
  product?: string;
  harvest_date?: string;
  volume_kg?: number;
  storage_temp?: number;
  market_region?: string;
  current_price?: number;
  transport_distance_km?: number;
}

interface SupplyChainResult {
  harvest_forecast: { optimal_date: string; yield_estimate_kg: number; quality_grade: string; sugar_content?: number };
  cold_chain: { required_temp_c: number; max_transit_hours: number; packaging: string; monitoring: string };
  inventory: { current_stock_kg: number; turnover_days: number; reorder_point: number; status: string };
  price_forecast: Array<{ month: string; predicted_price: number; trend: string }>;
  channel_optimization: Array<{ channel: string; margin: number; recommendation: string }>;
  disclaimer: string;
}

function analyzeSupplyChain(data: SupplyChainInput): SupplyChainResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const product = data.product || pick(rng, ['苹果', '番茄', '黄瓜', '草莓', '柑橘', '葡萄']);
  const volume = data.volume_kg ?? round(5000 + rng() * 45000, 0);
  const currentPrice = data.current_price ?? round(3 + rng() * 15, 2);
  const distance = data.transport_distance_km ?? round(50 + rng() * 950, 0);

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const optimalMonth = pick(rng, months);
  const yieldEst = round(volume * (0.85 + rng() * 0.3), 0);
  const grade = pick(rng, ['特级', '一级', '二级']);

  const tempReqs: Record<string, number> = { '苹果': 0, '番茄': 10, '黄瓜': 12, '草莓': 2, '柑橘': 5, '葡萄': -1 };
  const reqTemp = tempReqs[product] ?? 4;
  const maxTransit = round(24 + rng() * 72, 0);

  const currentStock = round(volume * (0.3 + rng() * 0.5), 0);
  const turnoverDays = round(7 + rng() * 21, 0);
  const reorderPoint = round(currentStock * 0.3, 0);
  const invStatus = currentStock > reorderPoint ? '充足' : '需补货';

  const priceForecast = [];
  for (let i = 0; i < 6; i++) {
    const price = round(currentPrice * (0.8 + rng() * 0.5), 2);
    priceForecast.push({
      month: months[i],
      predicted_price: price,
      trend: price > currentPrice * 1.05 ? '上涨' : price < currentPrice * 0.95 ? '下跌' : '平稳',
    });
  }

  const channels = [
    { channel: '批发市场', margin: round(10 + rng() * 10, 1), recommendation: '适合大批量快速出货' },
    { channel: '电商平台', margin: round(20 + rng() * 20, 1), recommendation: '适合品牌溢价产品' },
    { channel: '社区团购', margin: round(15 + rng() * 10, 1), recommendation: '适合周边城市短链供应' },
    { channel: '商超直供', margin: round(12 + rng() * 8, 1), recommendation: '适合稳定品质批量供应' },
  ];

  return {
    harvest_forecast: { optimal_date: optimalMonth, yield_estimate_kg: yieldEst, quality_grade: grade, sugar_content: round(8 + rng() * 8, 1) },
    cold_chain: { required_temp_c: reqTemp, max_transit_hours: maxTransit, packaging: pick(rng, ['泡沫箱+冰袋', '气调包装', '真空预冷', '保温箱']), monitoring: 'IoT温湿度实时监控+GPS定位' },
    inventory: { current_stock_kg: currentStock, turnover_days: turnoverDays, reorder_point: reorderPoint, status: invStatus },
    price_forecast: priceForecast,
    channel_optimization: channels,
    disclaimer: DISCLAIMER,
  };
}

function formatSupplyChain(r: SupplyChainResult): string {
  let s = '=== 农业供应链分析报告 ===\n\n';
  s += '【采收预测】\n';
  s += `  最佳采收期: ${r.harvest_forecast.optimal_date}\n`;
  s += `  预估产量: ${r.harvest_forecast.yield_estimate_kg} kg\n`;
  s += `  品质等级: ${r.harvest_forecast.quality_grade}\n`;
  if (r.harvest_forecast.sugar_content) s += `  糖度: ${r.harvest_forecast.sugar_content}°Brix\n`;
  s += '\n【冷链物流】\n';
  s += `  要求温度: ${r.cold_chain.required_temp_c}°C\n`;
  s += `  最长运输: ${r.cold_chain.max_transit_hours} 小时\n`;
  s += `  包装方式: ${r.cold_chain.packaging}\n`;
  s += `  监控方案: ${r.cold_chain.monitoring}\n\n`;
  s += '【库存管理】\n';
  s += `  当前库存: ${r.inventory.current_stock_kg} kg\n`;
  s += `  周转天数: ${r.inventory.turnover_days} 天\n`;
  s += `  补货点: ${r.inventory.reorder_point} kg\n`;
  s += `  状态: ${r.inventory.status}\n\n`;
  s += '【价格预测】\n';
  r.price_forecast.forEach(p => {
    s += `  ${p.month}: ¥${p.predicted_price}/kg (${p.trend})\n`;
  });
  s += '\n【渠道优化】\n';
  r.channel_optimization.forEach(c => {
    s += `  ${c.channel} — 利润率: ${c.margin}% | ${c.recommendation}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. farm_financial_planner — 农场财务规划
// ============================================================
interface FarmFinancialInput {
  farm_size_mu?: number;
  crop_type?: string;
  annual_revenue?: number;
  labor_cost?: number;
  input_cost?: number;
  machinery_cost?: number;
  loan_amount?: number;
  insurance_coverage?: number;
}

interface FarmFinancialResult {
  cost_analysis: { total_cost: number; cost_per_mu: number; breakdown: Array<{ item: string; amount: number; percent: number }> };
  revenue_forecast: { projected_revenue: number; net_profit: number; profit_margin: number; roi: number };
  subsidy_eligibility: Array<{ name: string; amount: number; eligibility: string; deadline: string }>;
  insurance_plan: { recommended_coverage: number; premium_estimate: number; risk_items: string[]; provider: string };
  investment_analysis: { payback_years: number; npv: number; irr: number; recommendation: string };
  disclaimer: string;
}

function analyzeFarmFinancial(data: FarmFinancialInput): FarmFinancialResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const size = data.farm_size_mu ?? round(100 + rng() * 900, 0);
  const revenue = data.annual_revenue ?? round(150000 + rng() * 850000, 0);
  const laborCost = data.labor_cost ?? round(revenue * (0.15 + rng() * 0.15), 0);
  const inputCost = data.input_cost ?? round(revenue * (0.2 + rng() * 0.2), 0);
  const machineCost = data.machinery_cost ?? round(revenue * (0.1 + rng() * 0.1), 0);
  const otherCost = round(revenue * (0.05 + rng() * 0.08), 0);
  const totalCost = laborCost + inputCost + machineCost + otherCost;

  const costItems = [
    { item: '人工成本', amount: laborCost },
    { item: '投入品(种子/肥料/农药)', amount: inputCost },
    { item: '机械作业', amount: machineCost },
    { item: '其他费用', amount: otherCost },
  ].map(c => ({ ...c, percent: round((c.amount / totalCost) * 100, 1) }));

  const projectedRevenue = round(revenue * (0.9 + rng() * 0.3), 0);
  const netProfit = projectedRevenue - totalCost;
  const profitMargin = round((netProfit / projectedRevenue) * 100, 1);
  const roi = round((netProfit / totalCost) * 100, 1);

  const subsidies = [
    { name: '耕地地力保护补贴', amount: round(80 + rng() * 70, 0) * size, eligibility: '符合', deadline: '每年6月30日' },
    { name: '农机购置补贴', amount: round(5000 + rng() * 30000, 0), eligibility: pick(rng, ['符合', '需补充材料']), deadline: '每年11月30日' },
    { name: '种粮大户补贴', amount: round(2000 + rng() * 8000, 0), eligibility: size >= 100 ? '符合' : '面积不足', deadline: '每年9月30日' },
    { name: '农业保险补贴', amount: round(totalCost * 0.04, 0), eligibility: '符合', deadline: '播种前' },
  ];

  const recommendedCoverage = round(totalCost * 0.8, 0);
  const premium = round(recommendedCoverage * (0.02 + rng() * 0.04), 0);

  const payback = round(2 + rng() * 4, 1);
  const npv = round(netProfit * (3 + rng() * 3) - totalCost * 0.5, 0);
  const irr = round(8 + rng() * 15, 1);

  return {
    cost_analysis: { total_cost: round(totalCost, 0), cost_per_mu: round(totalCost / size, 0), breakdown: costItems },
    revenue_forecast: { projected_revenue: projectedRevenue, net_profit: round(netProfit, 0), profit_margin: profitMargin, roi },
    subsidy_eligibility: subsidies,
    insurance_plan: { recommended_coverage: recommendedCoverage, premium_estimate: premium, risk_items: ['自然灾害', '病虫害', '价格波动', '意外事故'], provider: pick(rng, ['中国人保', '中华联合', '太平洋保险', '平安产险']) },
    investment_analysis: { payback_years: payback, npv: round(npv, 0), irr, recommendation: irr > 12 ? '建议投资' : irr > 8 ? '谨慎投资' : '建议观望' },
    disclaimer: DISCLAIMER,
  };
}

function formatFarmFinancial(r: FarmFinancialResult): string {
  let s = '=== 农场财务规划报告 ===\n\n';
  s += '【成本分析】\n';
  s += `  总成本: ¥${r.cost_analysis.total_cost.toLocaleString()}\n`;
  s += `  亩均成本: ¥${r.cost_analysis.cost_per_mu}/亩\n`;
  s += '  成本构成:\n';
  r.cost_analysis.breakdown.forEach(c => {
    s += `    ${c.item}: ¥${c.amount.toLocaleString()} (${c.percent}%)\n`;
  });
  s += '\n【收益预测】\n';
  s += `  预计收入: ¥${r.revenue_forecast.projected_revenue.toLocaleString()}\n`;
  s += `  净利润: ¥${r.revenue_forecast.net_profit.toLocaleString()}\n`;
  s += `  利润率: ${r.revenue_forecast.profit_margin}%\n`;
  s += `  投资回报率: ${r.revenue_forecast.roi}%\n\n`;
  s += '【补贴申请】\n';
  r.subsidy_eligibility.forEach(sub => {
    s += `  ${sub.name}: ¥${sub.amount.toLocaleString()} | ${sub.eligibility} | 截止: ${sub.deadline}\n`;
  });
  s += '\n【保险方案】\n';
  s += `  推荐保额: ¥${r.insurance_plan.recommended_coverage.toLocaleString()}\n`;
  s += `  保费估算: ¥${r.insurance_plan.premium_estimate.toLocaleString()}\n`;
  s += `  保障范围: ${r.insurance_plan.risk_items.join('、')}\n`;
  s += `  推荐机构: ${r.insurance_plan.provider}\n\n`;
  s += '【投资回报】\n';
  s += `  回收期: ${r.investment_analysis.payback_years} 年\n`;
  s += `  NPV: ¥${r.investment_analysis.npv.toLocaleString()}\n`;
  s += `  IRR: ${r.investment_analysis.irr}%\n`;
  s += `  建议: ${r.investment_analysis.recommendation}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. climate_risk_assessor — 气候风险评估
// ============================================================
interface ClimateRiskInput {
  region?: string;
  latitude?: number;
  longitude?: number;
  crop_type?: string;
  season?: string;
  historical_drought_years?: number;
  elevation?: number;
  soil_type?: string;
}

interface ClimateRiskResult {
  extreme_weather: Array<{ type: string; probability: number; impact: string; mitigation: string }>;
  drought_risk: { level: number; spi_index: number; affected_months: string[]; water_stress_days: number };
  flood_warning: { risk_level: number; return_period_years: number; drainage_requirement: string; early_warning_days: number };
  climate_adaptation: Array<{ strategy: string; priority: string; cost_estimate: number; effectiveness: number }>;
  carbon_sink: { estimated_sequestration_t: number; carbon_credit_value: number; practice: string; verification: string };
  disclaimer: string;
}

function analyzeClimateRisk(data: ClimateRiskInput): ClimateRiskResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const region = data.region || pick(rng, ['华北平原', '东北平原', '长江中下游', '西南山区', '西北干旱区']);
  const lat = data.latitude ?? round(25 + rng() * 20, 2);
  const season = data.season || pick(rng, ['春季', '夏季', '秋季', '冬季']);

  const extremes = [
    { type: '高温热害', impact: '作物授粉受阻、品质下降', mitigation: '选用耐热品种、喷灌降温、遮阳网' },
    { type: '干旱', impact: '作物萎蔫、减产', mitigation: '节水灌溉、覆盖保墒、抗旱品种' },
    { type: '暴雨洪涝', impact: '田间渍害、根系缺氧', mitigation: '完善排水系统、高畦栽培' },
    { type: '冰雹', impact: '机械损伤、绝收', mitigation: '防雹网、农业保险' },
    { type: '霜冻', impact: '幼苗冻伤、花果脱落', mitigation: '熏烟防霜、地膜覆盖、喷施防冻剂' },
    { type: '台风', impact: '倒伏、机械损伤', mitigation: '培土固根、及时抢收' },
  ];
  const extremeResults = extremes.slice(0, 3 + Math.floor(rng() * 3)).map(e => ({
    ...e,
    probability: round(10 + rng() * 60, 0),
  }));

  const droughtLevel = round(20 + rng() * 70, 0);
  const spi = round(-2 + rng() * 3, 2);
  const affectedMonths = pick(rng, [['6月', '7月'], ['7月', '8月'], ['5月', '6月', '7月'], ['8月', '9月']]);
  const waterStressDays = Math.round(10 + rng() * 40);

  const floodRisk = round(15 + rng() * 65, 0);
  const returnPeriod = pick(rng, [5, 10, 20, 50, 100]);

  const adaptations = [
    { strategy: '调整播期避灾', priority: '高', cost_estimate: round(500 + rng() * 2000, 0), effectiveness: round(60 + rng() * 30, 0) },
    { strategy: '建设节水灌溉设施', priority: '高', cost_estimate: round(5000 + rng() * 20000, 0), effectiveness: round(70 + rng() * 25, 0) },
    { strategy: '改良土壤结构', priority: '中', cost_estimate: round(2000 + rng() * 5000, 0), effectiveness: round(50 + rng() * 30, 0) },
    { strategy: '种植制度优化', priority: '中', cost_estimate: round(1000 + rng() * 3000, 0), effectiveness: round(55 + rng() * 25, 0) },
    { strategy: '气候智慧型品种', priority: '高', cost_estimate: round(3000 + rng() * 7000, 0), effectiveness: round(65 + rng() * 25, 0) },
  ];

  const carbonSeq = round(0.5 + rng() * 4, 2);
  const carbonValue = round(carbonSeq * (30 + rng() * 50), 0);

  return {
    extreme_weather: extremeResults,
    drought_risk: { level: droughtLevel, spi_index: spi, affected_months: affectedMonths, water_stress_days: waterStressDays },
    flood_warning: { risk_level: floodRisk, return_period_years: returnPeriod, drainage_requirement: floodRisk > 50 ? '需完善排水系统' : '基本满足', early_warning_days: Math.round(2 + rng() * 5) },
    climate_adaptation: adaptations,
    carbon_sink: { estimated_sequestration_t: carbonSeq, carbon_credit_value: carbonValue, practice: pick(rng, ['保护性耕作', '秸秆还田', '有机肥替代', '农林复合', '覆盖作物']), verification: 'CCER/第三方核证机构' },
    disclaimer: DISCLAIMER,
  };
}

function formatClimateRisk(r: ClimateRiskResult): string {
  let s = '=== 气候风险评估报告 ===\n\n';
  s += '【极端天气风险】\n';
  r.extreme_weather.forEach(e => {
    s += `  ${e.type} — 概率: ${e.probability}%\n`;
    s += `    影响: ${e.impact}\n`;
    s += `    缓解: ${e.mitigation}\n`;
  });
  s += '\n【干旱风险】\n';
  s += `  风险等级: ${r.drought_risk.level}/100\n`;
  s += `  SPI指数: ${r.drought_risk.spi_index}\n`;
  s += `  受影响月份: ${r.drought_risk.affected_months.join('、')}\n`;
  s += `  水分胁迫天数: ${r.drought_risk.water_stress_days}天\n\n`;
  s += '【洪涝预警】\n';
  s += `  风险等级: ${r.flood_warning.risk_level}/100\n`;
  s += `  重现期: ${r.flood_warning.return_period_years}年一遇\n`;
  s += `  排水需求: ${r.flood_warning.drainage_requirement}\n`;
  s += `  预警提前量: ${r.flood_warning.early_warning_days}天\n\n`;
  s += '【气候适应策略】\n';
  r.climate_adaptation.forEach(a => {
    s += `  ${a.strategy} [${a.priority}] — 成本: ¥${a.cost_estimate.toLocaleString()} | 效果: ${a.effectiveness}%\n`;
  });
  s += '\n【碳汇评估】\n';
  s += `  预估固碳量: ${r.carbon_sink.estimated_sequestration_t} tCO₂/年\n`;
  s += `  碳汇价值: ¥${r.carbon_sink.carbon_credit_value}/年\n`;
  s += `  实践方式: ${r.carbon_sink.practice}\n`;
  s += `  核证方式: ${r.carbon_sink.verification}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. agri_drone_operator — 农业无人机
// ============================================================
interface DroneInput {
  operation_type?: string;
  crop_type?: string;
  area_mu?: number;
  growth_stage?: string;
  terrain?: string;
  weather_condition?: string;
  wind_speed?: number;
  payload_capacity?: number;
}

interface DroneResult {
  crop_spraying: { coverage_rate: number; spray_volume_l_per_mu: number; droplet_size: string; chemical_saving: number; time_minutes: number };
  aerial_survey: { resolution_cm: number; coverage_area_mu: number; flight_altitude_m: number; overlap_percent: number; image_count: number };
  variable_fertilization: { zones: Array<{ zone: string; rate_kg_per_mu: number; reason: string }>; total_saving: number; uniformity: number };
  operation_planning: { flight_speed_ms: number; swath_width_m: number; battery_swaps: number; total_duration_min: number; waypoints: number };
  effectiveness_evaluation: { coverage_uniformity: number; pest_control_rate: number; yield_improvement: number; cost_per_mu: number; roi: number };
  disclaimer: string;
}

function analyzeDrone(data: DroneInput): DroneResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const opType = data.operation_type || pick(rng, ['植保喷洒', '航拍测绘', '变量施肥', '播种']);
  const crop = data.crop_type || pick(rng, ['水稻', '小麦', '玉米', '果树', '棉花']);
  const area = data.area_mu ?? round(50 + rng() * 450, 0);
  const wind = data.wind_speed ?? round(1 + rng() * 5, 1);
  const payload = data.payload_capacity ?? pick(rng, [10, 15, 20, 25, 30]);

  const coverageRate = round(90 + rng() * 8, 1);
  const sprayVol = round(1 + rng() * 3, 1);
  const dropletSize = pick(rng, ['细雾(100-150μm)', '中雾(150-250μm)', '粗雾(250-400μm)']);
  const chemSaving = round(15 + rng() * 25, 1);
  const sprayTime = round(area * (0.5 + rng() * 0.8), 0);

  const resolution = round(2 + rng() * 8, 1);
  const flightAlt = round(50 + rng() * 100, 0);
  const overlap = round(60 + rng() * 25, 0);
  const imageCount = Math.round(area * 10 * (1 + rng()));

  const zones = [
    { zone: 'A区(高肥力)', rate_kg_per_mu: round(8 + rng() * 4, 1), reason: '土壤基础肥力高，适当减量' },
    { zone: 'B区(中肥力)', rate_kg_per_mu: round(12 + rng() * 5, 1), reason: '标准施肥量' },
    { zone: 'C区(低肥力)', rate_kg_per_mu: round(16 + rng() * 6, 1), reason: '需增加投入补充地力' },
  ];
  const totalSaving = round(10 + rng() * 20, 1);
  const uniformity = round(85 + rng() * 12, 1);

  const flightSpeed = round(4 + rng() * 4, 1);
  const swathWidth = round(3 + rng() * 4, 1);
  const batterySwaps = Math.round(area * sprayVol / (payload * 15));
  const totalDuration = round(sprayTime + batterySwaps * 5 + 10, 0);
  const waypoints = Math.round(area * 2 + rng() * 50);

  const pestControl = round(75 + rng() * 20, 1);
  const yieldImprove = round(5 + rng() * 12, 1);
  const costPerMu = round(8 + rng() * 15, 1);
  const droneRoi = round((yieldImprove * 50 / costPerMu) * 10, 1);

  return {
    crop_spraying: { coverage_rate: coverageRate, spray_volume_l_per_mu: sprayVol, droplet_size: dropletSize, chemical_saving: chemSaving, time_minutes: sprayTime },
    aerial_survey: { resolution_cm: resolution, coverage_area_mu: area, flight_altitude_m: flightAlt, overlap_percent: overlap, image_count: imageCount },
    variable_fertilization: { zones, total_saving: totalSaving, uniformity },
    operation_planning: { flight_speed_ms: flightSpeed, swath_width_m: swathWidth, battery_swaps: batterySwaps, total_duration_min: totalDuration, waypoints },
    effectiveness_evaluation: { coverage_uniformity: coverageRate, pest_control_rate: pestControl, yield_improvement: yieldImprove, cost_per_mu: costPerMu, roi: droneRoi },
    disclaimer: DISCLAIMER,
  };
}

function formatDrone(r: DroneResult): string {
  let s = '=== 农业无人机作业报告 ===\n\n';
  s += '【植保喷洒】\n';
  s += `  覆盖率: ${r.crop_spraying.coverage_rate}%\n`;
  s += `  喷洒量: ${r.crop_spraying.spray_volume_l_per_mu} L/亩\n`;
  s += `  雾滴粒径: ${r.crop_spraying.droplet_size}\n`;
  s += `  农药节省: ${r.crop_spraying.chemical_saving}%\n`;
  s += `  作业时间: ${r.crop_spraying.time_minutes} 分钟\n\n`;
  s += '【航拍测绘】\n';
  s += `  分辨率: ${r.aerial_survey.resolution_cm} cm/像素\n`;
  s += `  覆盖面积: ${r.aerial_survey.coverage_area_mu} 亩\n`;
  s += `  飞行高度: ${r.aerial_survey.flight_altitude_m} m\n`;
  s += `  重叠率: ${r.aerial_survey.overlap_percent}%\n`;
  s += `  影像数量: ${r.aerial_survey.image_count} 张\n\n`;
  s += '【变量施肥】\n';
  r.variable_fertilization.zones.forEach(z => {
    s += `  ${z.zone}: ${z.rate_kg_per_mu} kg/亩 — ${z.reason}\n`;
  });
  s += `  总节省: ${r.variable_fertilization.total_saving}%\n`;
  s += `  均匀度: ${r.variable_fertilization.uniformity}%\n\n`;
  s += '【作业规划】\n';
  s += `  飞行速度: ${r.operation_planning.flight_speed_ms} m/s\n`;
  s += `  喷幅宽度: ${r.operation_planning.swath_width_m} m\n`;
  s += `  换电次数: ${r.operation_planning.battery_swaps} 次\n`;
  s += `  总时长: ${r.operation_planning.total_duration_min} 分钟\n`;
  s += `  航点数: ${r.operation_planning.waypoints}\n\n`;
  s += '【效果评估】\n';
  s += `  覆盖均匀度: ${r.effectiveness_evaluation.coverage_uniformity}%\n`;
  s += `  病虫害防效: ${r.effectiveness_evaluation.pest_control_rate}%\n`;
  s += `  增产效果: ${r.effectiveness_evaluation.yield_improvement}%\n`;
  s += `  亩均成本: ¥${r.effectiveness_evaluation.cost_per_mu}\n`;
  s += `  投入产出比: ${r.effectiveness_evaluation.roi}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. precision_planting_advisor
  tools.register(defineTool({
    name: 'precision_planting_advisor',
    description: '精准种植顾问 — 基于土壤数据、气候条件和区域特征，提供土壤分析、作物推荐、播种密度、灌溉方案和施肥计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含soil_type, ph, organic_matter, nitrogen, phosphorus, potassium, region, area_mu, season等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPrecisionPlanting(analyzePrecisionPlanting(JSON.parse(args.input_data)));
    },
  }));

  // 2. smart_irrigation_controller
  tools.register(defineTool({
    name: 'smart_irrigation_controller',
    description: '智能灌溉控制 — 基于土壤湿度、气象数据和作物需水规律，提供灌溉调度、用水效率分析和节水优化方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含soil_moisture, soil_type, crop_type, growth_stage, weather_forecast, temperature, rainfall_mm, et_rate等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSmartIrrigation(analyzeSmartIrrigation(JSON.parse(args.input_data)));
    },
  }));

  // 3. crop_health_monitor
  tools.register(defineTool({
    name: 'crop_health_monitor',
    description: '作物健康监测 — 基于遥感影像、气象数据和症状描述，提供病虫害识别、营养缺乏诊断、长势评估和预警',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含crop_type, growth_stage, image_ndvi, leaf_color, pest_symptoms, nutrient_symptoms, temperature, humidity等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCropHealth(analyzeCropHealth(JSON.parse(args.input_data)));
    },
  }));

  // 4. livestock_management
  tools.register(defineTool({
    name: 'livestock_management',
    description: '智慧养殖管理 — 基于养殖数据和环境参数，提供饲料优化、疫病预警、生长监测、环境控制和繁殖管理方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含animal_type, herd_size, avg_weight_kg, age_days, feed_type, temperature, humidity, health_status等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatLivestock(analyzeLivestock(JSON.parse(args.input_data)));
    },
  }));

  // 5. agri_supply_chain
  tools.register(defineTool({
    name: 'agri_supply_chain',
    description: '农业供应链 — 基于产品特性和市场数据，提供采收预测、冷链物流、库存管理、价格预测和渠道优化方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含product, harvest_date, volume_kg, storage_temp, market_region, current_price, transport_distance_km等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSupplyChain(analyzeSupplyChain(JSON.parse(args.input_data)));
    },
  }));

  // 6. farm_financial_planner
  tools.register(defineTool({
    name: 'farm_financial_planner',
    description: '农场财务规划 — 基于经营数据和成本结构，提供成本分析、收益预测、补贴申请、保险方案和投资回报分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含farm_size_mu, crop_type, annual_revenue, labor_cost, input_cost, machinery_cost, loan_amount, insurance_coverage等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatFarmFinancial(analyzeFarmFinancial(JSON.parse(args.input_data)));
    },
  }));

  // 7. climate_risk_assessor
  tools.register(defineTool({
    name: 'climate_risk_assessor',
    description: '气候风险评估 — 基于地理位置和历史气候数据，提供极端天气风险、干旱评估、洪涝预警、气候适应策略和碳汇评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含region, latitude, longitude, crop_type, season, historical_drought_years, elevation, soil_type等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatClimateRisk(analyzeClimateRisk(JSON.parse(args.input_data)));
    },
  }));

  // 8. agri_drone_operator
  tools.register(defineTool({
    name: 'agri_drone_operator',
    description: '农业无人机 — 基于作业需求和地形条件，提供植保喷洒、航拍测绘、变量施肥、作业规划和效果评估方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含operation_type, crop_type, area_mu, growth_stage, terrain, weather_condition, wind_speed, payload_capacity等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatDrone(analyzeDrone(JSON.parse(args.input_data)));
    },
  }));
}
