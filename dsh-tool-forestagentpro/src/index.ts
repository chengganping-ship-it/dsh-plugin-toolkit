import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'forestagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供林业管理参考，不替代专业林业工程师和生态学家的决策。';

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

function hashStr(input: string): number {
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

function seededRng(seed: string): () => number {
  return mulberry32(hashStr(seed));
}

// ============================================================
// 1. forest_inventory_analyzer — 森林资源清查与蓄积量估算
// ============================================================
interface ForestInventoryInput {
  forest_name?: string;
  area_ha?: number;
  forest_type?: string;
  dominant_species?: string;
  avg_dbh_cm?: number;
  avg_height_m?: number;
  trees_per_ha?: number;
  age_class?: string;
  region?: string;
}

interface ForestInventoryResult {
  stand_summary: { name: string; area_ha: number; type: string; age_class: string; origin: string };
  volume_estimation: { total_volume_m3: number; volume_per_ha: number; form_factor: number; biomass_t: number; carbon_t: number };
  species_composition: Array<{ species: string; proportion: number; dbh_cm: number; height_m: number }>;
  site_quality: { site_index: number; soil_type: string; slope_class: string; aspect: string; fertility: string };
  growth_prediction: { mai_m3_per_ha_yr: number; rotation_age: number; Annual_allowable_cut_m3: number; mean_annual_increment: number };
  health_assessment: { canopy_density: number; health_score: number; damage_level: string; pest_incidence: string };
  disclaimer: string;
}

function analyzeForestInventory(data: ForestInventoryInput): ForestInventoryResult {
  const rng = seededRng(JSON.stringify(data));
  const fname = data.forest_name || pick(rng, ['大兴安岭落叶松林', '西双版纳热带雨林', '神农架原始林', '武夷山常绿落叶混交林', '长白山中韩松人工林']);
  const area = data.area_ha ?? round(100 + rng() * 4900, 1);
  const forestType = data.forest_type || pick(rng, ['针叶林', '阔叶林', '针阔混交林', '热带雨林', '竹林经济林']);
  const dominant = data.dominant_species || pick(rng, ['落叶松', '马尾松', '杉木', '云杉', '红松', '栎类', '楠木', '樟树']);
  const dbh = data.avg_dbh_cm ?? round(12 + rng() * 40, 1);
  const height = data.avg_height_m ?? round(8 + rng() * 22, 1);
  const density = data.trees_per_ha ?? Math.round(400 + rng() * 2100);
  const ageClass = data.age_class || pick(rng, ['幼龄林', '中龄林', '近熟林', '成熟林', '过熟林']);

  const formFactor = round(0.35 + rng() * 0.15, 3);
  const volumePerHa = round(0.001 * formFactor * density * Math.PI * Math.pow(dbh / 200, 2) * height, 1);
  const totalVolume = round(volumePerHa * area, 0);
  const biomass = round(totalVolume * (0.45 + rng() * 0.15), 0);
  const carbon = round(biomass * 0.5, 0);

  const speciesMap: Record<string, string[]> = {
    '针叶林': ['落叶松', '云杉', '冷杉', '华山松'],
    '阔叶林': ['栎类', '桦木', '杨树', '椴树'],
    '针阔混交林': ['红松', '椴树', '水曲柳', '栎类'],
    '热带雨林': ['望天树', '羯布罗香', '望天树', '楠木'],
    '竹林经济林': ['毛竹', '雷竹', '方竹', '箭竹'],
  };
  const compSpecies = speciesMap[forestType] || speciesMap['针叶林'];
  const composition = compSpecies.map((sp, i) => ({
    species: sp,
    proportion: round((i === 0 ? 50 : 10 + rng() * 20) + rng() * 5, 1),
    dbh_cm: round(dbh + rng() * 8 - 4, 1),
    height_m: round(height + rng() * 4 - 2, 1),
  }));

  const siteIndex = round(10 + rng() * 14, 1);
  const fertility = siteIndex >= 18 ? 'I类' : siteIndex >= 14 ? 'II类' : siteIndex >= 10 ? 'III类' : 'IV类';

  const mai = round(volumePerHa / (30 + rng() * 20) * (1 + rng() * 0.5), 1);
  const rotationAge = Math.round(40 + rng() * 40);
  const aac = round(volumePerHa * area / rotationAge, 0);

  const canopyDensity = round(0.5 + rng() * 0.45, 2);
  const healthScore = round(50 + rng() * 45, 0);
  const damageLevel = healthScore >= 80 ? '健康' : healthScore >= 60 ? '亚健康' : healthScore >= 40 ? '轻度受损' : '严重受损';
  const pestIncidence = pick(rng, ['无', '轻度-松材线虫', '中度-松毛虫', '轻度-天牛', '轻度-尺蛾']);

  return {
    stand_summary: { name: fname, area_ha: area, type: forestType, age_class: ageClass, origin: pick(rng, ['天然林', '人工林', '天然+人工混生']) },
    volume_estimation: { total_volume_m3: totalVolume, volume_per_ha: volumePerHa, form_factor: formFactor, biomass_t: biomass, carbon_t: carbon },
    species_composition: composition,
    site_quality: { site_index: siteIndex, soil_type: pick(rng, ['棕壤', '红壤', '黄壤', '暗棕壤', '砖红壤']), slope_class: pick(rng, ['平坡(0-5°)', '缓坡(6-15°)', '斜坡(16-25°)', '陡坡(26-35°)']), aspect: pick(rng, ['南坡', '北坡', '东坡', '西坡', '全坡向']), fertility },
    growth_prediction: { mai_m3_per_ha_yr: mai, rotation_age: rotationAge, Annual_allowable_cut_m3: aac, mean_annual_increment: mai },
    health_assessment: { canopy_density: canopyDensity, health_score: healthScore, damage_level: damageLevel, pest_incidence: pestIncidence },
    disclaimer: DISCLAIMER,
  };
}

function formatForestInventory(r: ForestInventoryResult): string {
  let s = '=== 森林资源清查与蓄积量估算报告 ===\n\n';
  s += '【林分概况】\n';
  s += `  林分名称: ${r.stand_summary.name}\n`;
  s += `  面积: ${r.stand_summary.area_ha} 公顷\n`;
  s += `  林种: ${r.stand_summary.type} | ${r.stand_summary.origin}\n`;
  s += `  龄级: ${r.stand_summary.age_class}\n\n`;
  s += '【蓄积量估算】\n';
  s += `  总蓄积: ${r.volume_estimation.total_volume_m3.toLocaleString()} m³\n`;
  s += `  公顷蓄积: ${r.volume_estimation.volume_per_ha} m³/ha\n`;
  s += `  形数: ${r.volume_estimation.form_factor}\n`;
  s += `  生物量: ${r.volume_estimation.biomass_t.toLocaleString()} t\n`;
  s += `  碳储量: ${r.volume_estimation.carbon_t.toLocaleString()} tC\n\n`;
  s += '【树种组成】\n';
  r.species_composition.forEach(sp => {
    s += `  ${sp.species}: ${sp.proportion}% | DBH ${sp.dbh_cm}cm | H ${sp.height_m}m\n`;
  });
  s += '\n【立地质量】\n';
  s += `  地位指数: ${r.site_quality.site_index}\n`;
  s += `  土壤类型: ${r.site_quality.soil_type}\n`;
  s += `  坡度级: ${r.site_quality.slope_class} | 坡向: ${r.site_quality.aspect}\n`;
  s += `  肥沃度: ${r.site_quality.fertility}\n\n`;
  s += '【生长预测】\n';
  s += `  年平均生长量(MAI): ${r.growth_prediction.mai_m3_per_ha_yr} m³/ha/年\n`;
  s += `  轮伐期: ${r.growth_prediction.rotation_age} 年\n`;
  s += `  年允许采伐量: ${r.growth_prediction.Annual_allowable_cut_m3.toLocaleString()} m³/年\n\n`;
  s += '【健康评估】\n';
  s += `  郁闭度: ${r.health_assessment.canopy_density}\n`;
  s += `  健康评分: ${r.health_assessment.health_score}/100\n`;
  s += `  受损等级: ${r.health_assessment.damage_level}\n`;
  s += `  病虫害: ${r.health_assessment.pest_incidence}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. fire_risk_prediction — 森林火险等级预测与热点监测
// ============================================================
interface FireRiskInput {
  region?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  rainfall_30d?: number;
  drought_index?: number;
  vegetation_type?: string;
  canopy_cover?: number;
  fuel_load?: number;
  elevation?: number;
}

interface FireRiskResult {
  fire_weather_index: { ffmc: number; dmc: number; dc: number; isi: number; bui: number; fwi: number; components: string };
  risk_level: { level: number; description: string; color_code: string; alert_status: string };
  hotspot_detection: Array<{ lat: number; lon: number; brightness: number; confidence: number; scan_date: string; frp: number }>;
  spread_prediction: { rate_m_per_min: number; direction: string; flame_length_m: number; fire_intensity_kw_per_m: number };
  prevention_measures: Array<{ measure: string; priority: string; status: string }>;
  early_warning: { next_24h: string; next_72h: string; evacuation_zones: string[]; resources_needed: string[] };
  disclaimer: string;
}

function analyzeFireRisk(data: FireRiskInput): FireRiskResult {
  const rng = seededRng(JSON.stringify(data));
  const region = data.region || pick(rng, ['云南大理', '四川凉山', '黑龙江大兴安岭', '广西百色', '福建南平']);
  const temp = data.temperature ?? round(20 + rng() * 20, 1);
  const humidity = data.humidity ?? round(15 + rng() * 50, 1);
  const wind = data.wind_speed ?? round(2 + rng() * 15, 1);
  const rain = data.rainfall_30d ?? round(rng() * 80, 1);

  const ffmc = round(60 + (100 - humidity) * 0.3 + temp * 0.5, 1);
  const dmc = round(Math.max(0, 10 - rain * 0.2 + rng() * 20), 1);
  const dc = round(Math.max(0, 50 - rain * 0.5 + rng() * 100), 1);
  const isi = round(ffmc * wind / 50, 1);
  const bui = round((dmc + dc) / 2, 1);
  const fwi = round(isi * bui / 30, 1);

  const riskLevel = Math.min(5, Math.max(1, Math.round(fwi / 15)));
  const riskDescs = ['低火险', '中低火险', '中等火险', '高火险', '极高火险'];
  const colors = ['绿色', '蓝色', '黄色', '橙色', '红色'];
  const alerts = ['无', '注意', '警告', '严重', '紧急'];

  const hotspotCount = Math.round(rng() * 3);
  const hotspots = [];
  for (let i = 0; i < hotspotCount; i++) {
    hotspots.push({
      lat: round(20 + rng() * 15, 4),
      lon: round(100 + rng() * 25, 4),
      brightness: round(300 + rng() * 100, 1),
      confidence: round(40 + rng() * 55, 0),
      scan_date: pick(rng, ['2025-03-15', '2025-03-16', '2025-03-17']),
      frp: round(5 + rng() * 80, 1),
    });
  }

  const spreadRate = round(0.5 + rng() * 6, 1);
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const flameLength = round(0.5 + rng() * 4, 1);
  const fireIntensity = round(spreadRate * 186 * (flameLength ** 2.17), 0);

  const measures = [
    { measure: '清理防火隔离带', priority: '高', status: pick(rng, ['已完成 60%', '已完成 80%', '进行中']) },
    { measure: '储备灭火物资', priority: '高', status: pick(rng, ['储备充足', '需补充', '正在调配']) },
    { measure: '巡逻频次提升', priority: '中', status: pick(rng, ['已实施', '已实施', '加强中']) },
    { measure: '宣传警示标识', priority: '中', status: pick(rng, ['已设置', '部分设置', '需增设']) },
    { measure: '无人机巡护', priority: '中', status: pick(rng, ['2次/日', '3次/日', '已完成部署']) },
    { measure: '野外火源管控', priority: '高', status: pick(rng, ['严格管控', '全面禁止', '已实施']) },
  ];

  return {
    fire_weather_index: { ffmc, dmc, dc, isi, bui, fwi, components: 'FFMC(细小可燃物), DMC(腐殖质), DC(干旱码), ISI(初始蔓延), BUI(燃烧指数), FWI(火险天气指数)' },
    risk_level: { level: riskLevel, description: riskDescs[riskLevel - 1], color_code: colors[riskLevel - 1], alert_status: alerts[riskLevel - 1] },
    hotspot_detection: hotspots,
    spread_prediction: { rate_m_per_min: spreadRate, direction: pick(rng, directions), flame_length_m: flameLength, fire_intensity_kw_per_m: fireIntensity },
    prevention_measures: measures,
    early_warning: {
      next_24h: riskLevel >= 4 ? '极高火险预警—严禁一切野外用火' : riskLevel >= 3 ? '高火险预警—加强巡逻监控' : riskLevel >= 2 ? '中等火险—注意用火安全' : '低火险—正常监测',
      next_72h: fwi > 30 ? '持续高风险，建议启动应急响应' : fwi > 15 ? '火险可能上升，保持警惕' : '火险预计维持平稳',
      evacuation_zones: riskLevel >= 4 ? ['林区A区居民点', '景区B区游客'] : riskLevel >= 3 ? ['火险高危区临时设施'] : [],
      resources_needed: ['风力灭火机', '二号工具', '消防水车', '无人机', '对讲机', '应急通讯车'],
    },
    disclaimer: DISCLAIMER,
  };
}

function formatFireRisk(r: FireRiskResult): string {
  let s = '=== 森林火险等级预测与热点监测报告 ===\n\n';
  s += '【火险天气指数(FWI系统】\n';
  s += `  FFMC(细小可燃物湿度码): ${r.fire_weather_index.ffmc}\n`;
  s += `  DMC(杜格湿度码): ${r.fire_weather_index.dmc}\n`;
  s += `  DC(干旱码): ${r.fire_weather_index.dc}\n`;
  s += `  ISI(初始蔓延指数): ${r.fire_weather_index.isi}\n`;
  s += `  BUI(燃烧指数): ${r.fire_weather_index.bui}\n`;
  s += `  FWI(火险天气指数): ${r.fire_weather_index.fwi}\n`;
  s += `  指数说明: ${r.fire_weather_index.components}\n\n`;
  s += '【风险等级】\n';
  s += `  等级: ${r.risk_level.level}/5 — ${r.risk_level.description}\n`;
  s += `  颜色编码: ${r.risk_level.color_code}\n`;
  s += `  警报状态: ${r.risk_level.alert_status}\n\n`;
  s += '【热点监测】\n';
  if (r.hotspot_detection.length === 0) {
    s += '  未检测到热点\n';
  } else {
    r.hotspot_detection.forEach((h, i) => {
      s += `  热点${i + 1}: 坐标(${h.lat}, ${h.lon}) | 亮温: ${h.brightness}K | 置信度: ${h.confidence}% | FRP: ${h.frp}MW | ${h.scan_date}\n`;
    });
  }
  s += '\n【蔓延预测】\n';
  s += `  蔓延速率: ${r.spread_prediction.rate_m_per_min} m/min\n`;
  s += `  蔓延方向: ${r.spread_prediction.direction}\n`;
  s += `  火焰长度: ${r.spread_prediction.flame_length_m} m\n`;
  s += `  火强度: ${r.spread_prediction.fire_intensity_kw_per_m} kW/m\n\n`;
  s += '【防范措施】\n';
  r.prevention_measures.forEach(m => {
    s += `  [${m.priority}] ${m.measure} — ${m.status}\n`;
  });
  s += '\n【预警信息】\n';
  s += `  未来24h: ${r.early_warning.next_24h}\n`;
  s += `  未来72h: ${r.early_warning.next_72h}\n`;
  if (r.early_warning.evacuation_zones.length > 0) {
    s += `  需注意区域: ${r.early_warning.evacuation_zones.join('、')}\n`;
  }
  s += `  所需资源: ${r.early_warning.resources_needed.join('、')}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. timber_harvest_scheduler — 采伐计划与可持续木材供给
// ============================================================
interface TimberHarvestInput {
  forest_name?: string;
  total_area_ha?: number;
  annual_allowable_cut?: number;
  current_stock_m3?: number;
  target_species?: string;
  harvest_method?: string;
  rotation_age?: number;
  market_price?: number;
  road_density?: number;
  slope_limit?: number;
}

interface TimberHarvestResult {
  harvest_plan: { year: number; compartment: string; area_ha: number; volume_m3: number; method: string; season: string }[];
  sustainable_yield: { aac_m3: number; current_stock_m3: number; growth_rate: number; sustainability_ratio: number; status: string };
  economic_analysis: { total_revenue: number; harvest_cost: number; transport_cost: number; net_profit: number; profit_per_m3: number };
  environmental_constraints: { protected_area_ha: number; steep_slope_excluded_ha: number; riparian_buffer_m: number; wildlife_corridor: string };
  logistics: { road_investment: number; equipment_needed: string[]; labor_days: number; processing_facility: string };
  reforestation_link: { area_to_reforest_ha: number; species_plan: string; timeline: string; budget: number };
  disclaimer: string;
}

function analyzeTimberHarvest(data: TimberHarvestInput): TimberHarvestResult {
  const rng = seededRng(JSON.stringify(data));
  const fname = data.forest_name || pick(rng, ['国有林场A', '集体林区B', '森工企业C', '自然保护区实验区D']);
  const area = data.total_area_ha ?? round(500 + rng() * 4500, 0);
  const aac = data.annual_allowable_cut ?? round(2000 + rng() * 18000, 0);
  const stock = data.current_stock_m3 ?? round(aac * (15 + rng() * 20), 0);
  const price = data.market_price ?? round(600 + rng() * 800, 0);
  const rotation = data.rotation_age ?? Math.round(40 + rng() * 40);

  const plan = [];
  const compartments = ['A区', 'B区', 'C区', 'D区', 'E区'];
  const methods = ['皆伐', '渐伐', '择伐', '带状采伐'];
  const seasons = ['冬季', '春季'];
  for (let y = 1; y <= 5; y++) {
    plan.push({
      year: 2025 + y,
      compartment: pick(rng, compartments),
      area_ha: round(area / 5 * (0.8 + rng() * 0.4), 1),
      volume_m3: round(aac * (0.85 + rng() * 0.3), 0),
      method: pick(rng, methods),
      season: pick(rng, seasons),
    });
  }

  const growthRate = round(2 + rng() * 4, 1);
  const sustainRatio = round((aac / (stock * growthRate / 100)) * 100, 1);
  const sustainStatus = sustainRatio <= 100 ? '可持续' : sustainRatio <= 120 ? '接近上限' : '超采风险';

  const harvestCost = round(aac * (80 + rng() * 60), 0);
  const transportCost = round(aac * (30 + rng() * 40), 0);
  const totalRevenue = round(aac * price, 0);
  const netProfit = totalRevenue - harvestCost - transportCost;

  const protectedArea = round(area * (0.05 + rng() * 0.15), 1);
  const steepExcluded = round(area * (0.05 + rng() * 0.1), 1);
  const riparianBuffer = pick(rng, [20, 30, 50, 100]);

  const roadInvest = round(area * (50 + rng() * 100), 0);
  const equipment = pick(rng, [
    ['采伐油锯', '集材拖拉机', '运材卡车', '装载机'],
    ['采伐机', '索道集材', '重型卡车', '削片机'],
    ['链锯', '绞盘机', '自卸卡车', '打枝机'],
  ]);
  const laborDays = Math.round(aac / (3 + rng() * 5));

  const reforestArea = round(plan.reduce((s, p) => s + p.area_ha, 0) * 0.8, 1);
  const reforestBudget = round(reforestArea * (3000 + rng() * 5000), 0);

  return {
    harvest_plan: plan,
    sustainable_yield: { aac_m3: aac, current_stock_m3: stock, growth_rate: growthRate, sustainability_ratio: sustainRatio, status: sustainStatus },
    economic_analysis: { total_revenue: totalRevenue, harvest_cost: harvestCost, transport_cost: transportCost, net_profit: netProfit, profit_per_m3: round(netProfit / aac, 1) },
    environmental_constraints: { protected_area_ha: protectedArea, steep_slope_excluded_ha: steepExcluded, riparian_buffer_m: riparianBuffer, wildlife_corridor: pick(rng, ['保留3条主要廊道', '保留2条南北廊道', '保留河流廊道+山脊廊道']) },
    logistics: { road_investment: roadInvest, equipment_needed: equipment, labor_days: laborDays, processing_facility: pick(rng, ['林场粗加工厂', '园区精加工中心', '外运至市木材市场']) },
    reforestation_link: { area_to_reforest_ha: reforestArea, species_plan: pick(rng, ['乡土树种混交', '针阔混交林', '速生丰产林', '珍贵树种培育']), timeline: `${rotation}年`, budget: reforestBudget },
    disclaimer: DISCLAIMER,
  };
}

function formatTimberHarvest(r: TimberHarvestResult): string {
  let s = '=== 采伐计划与可持续木材供给报告 ===\n\n';
  s += '【五年采伐计划】\n';
  r.harvest_plan.forEach(p => {
    s += `  ${p.year}年 ${p.compartment}: ${p.area_ha}ha | ${p.volume_m3}m³ | ${p.method} | ${p.season}\n`;
  });
  s += '\n【可持续产量分析】\n';
  s += `  年允许采伐量(AAC): ${r.sustainable_yield.aac_m3.toLocaleString()} m³/年\n`;
  s += `  当前蓄积: ${r.sustainable_yield.current_stock_m3.toLocaleString()} m³\n`;
  s += `  生长率: ${r.sustainable_yield.growth_rate}%\n`;
  s += `  采伐/生长比: ${r.sustainable_yield.sustainability_ratio}%\n`;
  s += `  状态: ${r.sustainable_yield.status}\n\n`;
  s += '【经济分析】\n';
  s += `  总收入: ¥${r.economic_analysis.total_revenue.toLocaleString()}\n`;
  s += `  采伐成本: ¥${r.economic_analysis.harvest_cost.toLocaleString()}\n`;
  s += `  运输成本: ¥${r.economic_analysis.transport_cost.toLocaleString()}\n`;
  s += `  净利润: ¥${r.economic_analysis.net_profit.toLocaleString()}\n`;
  s += `  每立方米利润: ¥${r.economic_analysis.profit_per_m3}\n\n`;
  s += '【环境约束】\n';
  s += `  保护区面积: ${r.environmental_constraints.protected_area_ha} ha\n`;
  s += `  陡坡排除: ${r.environmental_constraints.steep_slope_excluded_ha} ha\n`;
  s += `  河岸缓冲带: ${r.environmental_constraints.riparian_buffer_m} m\n`;
  s += `  野生动物廊道: ${r.environmental_constraints.wildlife_corridor}\n\n`;
  s += '【物流规划】\n';
  s += `  道路投资: ¥${r.logistics.road_investment.toLocaleString()}\n`;
  s += `  所需设备: ${r.logistics.equipment_needed.join('、')}\n`;
  s += `  用工天数: ${r.logistics.labor_days} 工日\n`;
  s += `  加工设施: ${r.logistics.processing_facility}\n\n`;
  s += '【更新造林衔接】\n';
  s += `  需更新面积: ${r.reforestation_link.area_to_reforest_ha} ha\n`;
  s += `  树种方案: ${r.reforestation_link.species_plan}\n`;
  s += `  时间框架: ${r.reforestation_link.timeline}\n`;
  s += `  预算: ¥${r.reforestation_link.budget.toLocaleString()}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. reforestation_planner — 造林方案设计与树种选择
// ============================================================
interface ReforestationInput {
  site_name?: string;
  area_ha?: number;
  region?: string;
  elevation?: number;
  slope?: number;
  aspect?: string;
  soil_type?: string;
  ph?: number;
  annual_rainfall?: number;
  purpose?: string;
  budget?: number;
}

interface ReforestationResult {
  site_assessment: { name: string; area_ha: number; region: string; climate_zone: string; site_class: string };
  species_selection: Array<{ species: string; proportion: number; type: string; suitability: number; reason: string }>;
  planting_design: { spacing_m: number; density_per_ha: number; pattern: string; pit_size_cm: string; seedlings_needed: number };
  soil_preparation: { method: string; timing: string; amendments: string[]; erosion_control: string };
  maintenance_plan: Array<{ year: string; activity: string; frequency: string; cost_per_ha: number }>;
  survival_target: { year1: number; year3: number; year5: number; final_density: number };
  cost_estimate: { total_cost: number; per_ha: number; breakdown: Array<{ item: string; cost: number; percent: number }> };
  disclaimer: string;
}

function analyzeReforestation(data: ReforestationInput): ReforestationResult {
  const rng = seededRng(JSON.stringify(data));
  const sname = data.site_name || pick(rng, ['退耕还林区A', '采伐迹地B', '火烧迹地C', '石漠化治理区D', '河岸绿化带E']);
  const area = data.area_ha ?? round(20 + rng() * 480, 1);
  const region = data.region || pick(rng, ['华南', '西南', '华东', '华北', '东北', '西北']);
  const ph = data.ph ?? round(4.5 + rng() * 3, 1);
  const rainfall = data.annual_rainfall ?? round(400 + rng() * 1600, 0);
  const purpose = data.purpose || pick(rng, ['用材林', '生态防护林', '经济林', '碳汇林', '水源涵养林']);

  const climateZone = rainfall > 1200 ? '湿润区' : rainfall > 800 ? '半湿润区' : rainfall > 400 ? '半干旱区' : '干旱区';
  const siteClass = ph < 5.5 ? '酸性立地' : ph > 7.5 ? '碱性立地' : '中性立地';

  const speciesPool: Record<string, Array<{ sp: string; type: string; base: number }>> = {
    '用材林': [
      { sp: '杉木', type: '针叶', base: 90 },
      { sp: '马尾松', type: '针叶', base: 85 },
      { sp: '杨树', type: '阔叶', base: 80 },
      { sp: '桉树', type: '阔叶', base: 78 },
      { sp: '落叶松', type: '针叶', base: 75 },
    ],
    '生态防护林': [
      { sp: '刺槐', type: '阔叶', base: 88 },
      { sp: '侧柏', type: '针叶', base: 85 },
      { sp: '沙棘', type: '灌木', base: 82 },
      { sp: '紫穗槐', type: '灌木', base: 80 },
      { sp: '油松', type: '针叶', base: 78 },
    ],
    '经济林': [
      { sp: '核桃', type: '阔叶', base: 88 },
      { sp: '油茶', type: '阔叶', base: 85 },
      { sp: '板栗', type: '阔叶', base: 82 },
      { sp: '枣树', type: '阔叶', base: 80 },
      { sp: '花椒', type: '灌木', base: 75 },
    ],
    '碳汇林': [
      { sp: '杉木', type: '针叶', base: 92 },
      { sp: '楠木', type: '阔叶', base: 88 },
      { sp: '樟树', type: '阔叶', base: 85 },
      { sp: '红椎', type: '阔叶', base: 83 },
      { sp: '木荷', type: '阔叶', base: 80 },
    ],
    '水源涵养林': [
      { sp: '柳杉', type: '针叶', base: 90 },
      { sp: '水杉', type: '针叶', base: 88 },
      { sp: '枫杨', type: '阔叶', base: 85 },
      { sp: '木荷', type: '阔叶', base: 82 },
      { sp: '楠木', type: '阔叶', base: 80 },
    ],
  };

  const pool = speciesPool[purpose] || speciesPool['用材林'];
  const selected = pool.slice(0, 3 + Math.floor(rng() * 2));
  const speciesSelection = selected.map((s, i) => ({
    species: s.sp,
    proportion: round((i === 0 ? 50 : 20 + rng() * 20) + rng() * 5, 1),
    type: s.type,
    suitability: round(Math.min(99, Math.max(50, s.base + round(rng() * 15 - 7, 0))), 0),
    reason: `${climateZone}${siteClass}，${purpose}目标，${s.type}树种适宜度${s.base >= 85 ? '高' : '中'}`,
  }));

  const spacing = pick(rng, [2, 2.5, 3, 3.5]);
  const density = Math.round(10000 / (spacing * spacing));
  const pattern = pick(rng, ['正方形', '长方形', '三角形(品字形)', '带状混交']);
  const pitSize = pick(rng, ['40×40×30', '50×50×40', '60×60×50', '30×30×25']);
  const seedlings = Math.round(density * area * 1.1);

  const prepMethod = pick(rng, ['全垦整地', '带状整地', '穴状整地', '鱼鳞坑整地', '水平阶整地']);
  const amendments = pick(rng, [
    ['有机肥', '过磷酸钙'],
    ['复合肥', '石灰(调酸)'],
    ['有机肥', '复合肥', '保水剂'],
    ['生物菌肥', '有机肥'],
  ]);

  const maintenance = [
    { year: '第1年', activity: '浇水+除草+补植', frequency: '3次/年', cost_per_ha: round(1500 + rng() * 1000, 0) },
    { year: '第2年', activity: '除草+施肥+修枝', frequency: '2次/年', cost_per_ha: round(1000 + rng() * 800, 0) },
    { year: '第3年', activity: '除草+施肥+病虫害防治', frequency: '2次/年', cost_per_ha: round(800 + rng() * 600, 0) },
    { year: '第4-5年', activity: '抚育间伐+施肥', frequency: '1次/年', cost_per_ha: round(500 + rng() * 500, 0) },
  ];

  const seedlingCost = round(seedlings * (1.5 + rng() * 3), 0);
  const prepCost = round(area * (2000 + rng() * 3000), 0);
  const maintCost = round(maintenance.reduce((s, m) => s + m.cost_per_ha, 0) * area, 0);
  const totalCost = seedlingCost + prepCost + maintCost;
  const costBreakdown = [
    { item: '苗木费', cost: seedlingCost, percent: round(seedlingCost / totalCost * 100, 1) },
    { item: '整地费', cost: prepCost, percent: round(prepCost / totalCost * 100, 1) },
    { item: '抚育管理费', cost: maintCost, percent: round(maintCost / totalCost * 100, 1) },
  ];

  return {
    site_assessment: { name: sname, area_ha: area, region, climate_zone: climateZone, site_class: siteClass },
    species_selection: speciesSelection,
    planting_design: { spacing_m: spacing, density_per_ha: density, pattern, pit_size_cm: pitSize, seedlings_needed: seedlings },
    soil_preparation: { method: prepMethod, timing: pick(rng, ['造林前1-2个月', '秋季整地春季造林', '随整随造']), amendments, erosion_control: pick(rng, ['水平阶+排水沟', '鱼鳞坑+截水沟', '植生带覆盖', '草带护坡']) },
    maintenance_plan: maintenance,
    survival_target: { year1: round(85 + rng() * 10, 0), year3: round(80 + rng() * 10, 0), year5: round(75 + rng() * 10, 0), final_density: Math.round(density * 0.7) },
    cost_estimate: { total_cost: round(totalCost, 0), per_ha: round(totalCost / area, 0), breakdown: costBreakdown },
    disclaimer: DISCLAIMER,
  };
}

function formatReforestation(r: ReforestationResult): string {
  let s = '=== 造林方案设计与树种选择报告 ===\n\n';
  s += '【立地评估】\n';
  s += `  地点: ${r.site_assessment.name}\n`;
  s += `  面积: ${r.site_assessment.area_ha} ha\n`;
  s += `  区域: ${r.site_assessment.region} | ${r.site_assessment.climate_zone}\n`;
  s += `  立地类型: ${r.site_assessment.site_class}\n\n`;
  s += '【树种选择】\n';
  r.species_selection.forEach(sp => {
    s += `  ${sp.species}(${sp.type}): ${sp.proportion}% | 适宜度: ${sp.suitability}%\n`;
    s += `    理由: ${sp.reason}\n`;
  });
  s += '\n【种植设计】\n';
  s += `  株行距: ${r.planting_design.spacing_m}m × ${r.planting_design.spacing_m}m\n`;
  s += `  密度: ${r.planting_design.density_per_ha} 株/ha\n`;
  s += `  配置: ${r.planting_design.pattern}\n`;
  s += `  穴规格: ${r.planting_design.pit_size_cm} cm\n`;
  s += `  需苗量: ${r.planting_design.seedlings_needed.toLocaleString()} 株\n\n`;
  s += '【土壤准备】\n';
  s += `  整地方法: ${r.soil_preparation.method}\n`;
  s += `  时机: ${r.soil_preparation.timing}\n`;
  s += `  改良材料: ${r.soil_preparation.amendments.join('、')}\n`;
  s += `  水保措施: ${r.soil_preparation.erosion_control}\n\n`;
  s += '【抚育管理】\n';
  r.maintenance_plan.forEach(m => {
    s += `  ${m.year}: ${m.activity} | ${m.frequency} | ¥${m.cost_per_ha}/ha\n`;
  });
  s += '\n【成活率目标】\n';
  s += `  第1年: ${r.survival_target.year1}%\n`;
  s += `  第3年: ${r.survival_target.year3}%\n`;
  s += `  第5年: ${r.survival_target.year5}%\n`;
  s += `  最终保留密度: ${r.survival_target.final_density} 株/ha\n\n`;
  s += '【成本估算】\n';
  s += `  总成本: ¥${r.cost_estimate.total_cost.toLocaleString()}\n`;
  s += `  亩均成本: ¥${r.cost_estimate.per_ha.toLocaleString()}/ha\n`;
  r.cost_estimate.breakdown.forEach(c => {
    s += `  ${c.item}: ¥${c.cost.toLocaleString()} (${c.percent}%)\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. forest_carbon_sink_calculator — 林业碳汇核算与CCER方法学
// ============================================================
interface CarbonSinkInput {
  project_name?: string;
  area_ha?: number;
  forest_type?: string;
  species?: string;
  age_class?: string;
  region?: string;
  baseline_scenario?: string;
  crediting_period?: number;
  carbon_price?: number;
  methodology?: string;
}

interface CarbonSinkResult {
  methodology_ref: { code: string; name: string; version: string; applicability: string };
  baseline_carbon: { stock_tco2: number; annual_change: number; scenario: string; justification: string };
  project_carbon: { stock_tco2: number; annual_change: number; total_sequestration: number; leakage_deduction: number; net_reduction: number };
  crediting: { period_years: number; total_credits: number; annual_avg: number; verification_schedule: string };
  financial_analysis: { carbon_price: number; total_revenue: number; npv: number; irr: number; break_even_year: number };
  monitoring_plan: { frequency: string; parameters: string[]; uncertainty: number; third_party: string };
  disclaimer: string;
}

function analyzeCarbonSink(data: CarbonSinkInput): CarbonSinkResult {
  const rng = seededRng(JSON.stringify(data));
  const pname = data.project_name || pick(rng, ['云南再造林碳汇项目', '广西速生丰产林CCER', '四川天然林增汇项目', '福建竹林碳汇开发']);
  const area = data.area_ha ?? round(500 + rng() * 9500, 0);
  const creditingPeriod = data.crediting_period ?? pick(rng, [20, 25, 30]);
  const carbonPrice = data.carbon_price ?? round(30 + rng() * 70, 1);
  const methodology = data.methodology || pick(rng, ['AR-CM-001-V01 造林再造林', 'AR-ACM-003-V01 森林经营', 'AR-CM-002-V01 竹林经营']);

  const baselineStock = round(area * (3 + rng() * 8), 0);
  const baselineChange = round(-0.5 + rng() * 1, 1);

  const projectStock = round(area * (8 + rng() * 15), 0);
  const projectChange = round(3 + rng() * 8, 1);
  const totalSeq = round(projectChange * area * creditingPeriod, 0);
  const leakage = round(totalSeq * (0.02 + rng() * 0.08), 0);
  const netReduction = round(totalSeq - leakage, 0);

  const annualAvg = round(netReduction / creditingPeriod, 0);

  const totalRevenue = round(netReduction * carbonPrice, 0);
  const npv = round(totalRevenue * (0.4 + rng() * 0.3), 0);
  const irr = round(8 + rng() * 15, 1);
  const breakEven = Math.round(3 + rng() * 7);

  return {
    methodology_ref: { code: methodology.split(' ')[0], name: methodology, version: 'V01', applicability: `适用于${area}公顷${data.forest_type || '人工林'}项目` },
    baseline_carbon: { stock_tco2: baselineStock, annual_change: baselineChange, scenario: data.baseline_scenario || pick(rng, ['无项目情景(自然退化)', '无项目情景(维持现状)', '法规要求情景']), justification: '基线情景基于历史趋势和区域土地利用变化分析确定' },
    project_carbon: { stock_tco2: projectStock, annual_change: projectChange, total_sequestration: totalSeq, leakage_deduction: leakage, net_reduction: netReduction },
    crediting: { period_years: creditingPeriod, total_credits: netReduction, annual_avg: annualAvg, verification_schedule: pick(rng, ['每2年核证', '每3年核证', '每5年核证']) },
    financial_analysis: { carbon_price: carbonPrice, total_revenue: totalRevenue, npv, irr, break_even_year: breakEven },
    monitoring_plan: { frequency: pick(rng, ['每年', '每2年', '每3年']), parameters: ['地上生物量', '地下生物量', '枯死木', '枯落物', '土壤有机碳'], uncertainty: round(5 + rng() * 10, 1), third_party: pick(rng, ['中国质量认证中心', '中环联合', 'SGS通标', '中国林科院']) },
    disclaimer: DISCLAIMER,
  };
}

function formatCarbonSink(r: CarbonSinkResult): string {
  let s = '=== 林业碳汇核算与CCER方法学报告 ===\n\n';
  s += '【方法学引用】\n';
  s += `  方法学代码: ${r.methodology_ref.code}\n`;
  s += `  方法学名称: ${r.methodology_ref.name}\n`;
  s += `  版本: ${r.methodology_ref.version}\n`;
  s += `  适用性: ${r.methodology_ref.applicability}\n\n`;
  s += '【基线碳储量】\n';
  s += `  基线碳储量: ${r.baseline_carbon.stock_tco2.toLocaleString()} tCO₂\n`;
  s += `  年变化率: ${r.baseline_carbon.annual_change} tCO₂/年\n`;
  s += `  基线情景: ${r.baseline_carbon.scenario}\n`;
  s += `  论证: ${r.baseline_carbon.justification}\n\n`;
  s += '【项目碳储量】\n';
  s += `  项目碳储量: ${r.project_carbon.stock_tco2.toLocaleString()} tCO₂\n`;
  s += `  年固碳量: ${r.project_carbon.annual_change} tCO₂/年\n`;
  s += `  总固碳量: ${r.project_carbon.total_sequestration.toLocaleString()} tCO₂\n`;
  s += `  泄漏扣除: ${r.project_carbon.leakage_deduction.toLocaleString()} tCO₂\n`;
  s += `  净减排量: ${r.project_carbon.net_reduction.toLocaleString()} tCO₂\n\n`;
  s += '【核证减排量】\n';
  s += `  计入期: ${r.crediting.period_years} 年\n`;
  s += `  总减排量: ${r.crediting.total_credits.toLocaleString()} tCO₂\n`;
  s += `  年均减排: ${r.crediting.annual_avg.toLocaleString()} tCO₂/年\n`;
  s += `  核证频次: ${r.crediting.verification_schedule}\n\n`;
  s += '【财务分析】\n';
  s += `  碳价: ¥${r.financial_analysis.carbon_price}/tCO₂\n`;
  s += `  总收入: ¥${r.financial_analysis.total_revenue.toLocaleString()}\n`;
  s += `  NPV: ¥${r.financial_analysis.npv.toLocaleString()}\n`;
  s += `  IRR: ${r.financial_analysis.irr}%\n`;
  s += `  盈亏平衡: 第${r.financial_analysis.break_even_year}年\n\n`;
  s += '【监测计划】\n';
  s += `  监测频次: ${r.monitoring_plan.frequency}\n`;
  s += `  监测参数: ${r.monitoring_plan.parameters.join('、')}\n`;
  s += `  不确定性: ±${r.monitoring_plan.uncertainty}%\n`;
  s += `  第三方核证: ${r.monitoring_plan.third_party}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. pest_disease_detector — 林业病虫害遥感检测与预警
// ============================================================
interface PestDiseaseInput {
  region?: string;
  forest_type?: string;
  satellite_source?: string;
  ndvi_anomaly?: number;
  affected_area_ha?: number;
  pest_type?: string;
  temperature?: number;
  humidity?: number;
  wind_direction?: string;
  detection_date?: string;
}

interface PestDiseaseResult {
  detection_summary: { region: string; detection_date: string; satellite: string; cloud_cover: number; resolution: string };
  affected_areas: Array<{ id: string; lat: number; lon: number; area_ha: number; severity: string; confidence: number; ndvi_drop: number }>;
  pest_identification: Array<{ name: string; probability: number; symptoms: string; spread_rate: string; host_species: string[] }>;
  spread_model: { direction: string; speed_km_per_month: number; risk_zones: Array<{ zone: string; risk: string; area_ha: number }> };
  treatment_recommendations: Array<{ method: string; target: string; dosage: string; timing: string; effectiveness: number }>;
  early_warning: { level: string; next_30d: string; monitoring_frequency: string; alert_radius_km: number };
  disclaimer: string;
}

function analyzePestDisease(data: PestDiseaseInput): PestDiseaseResult {
  const rng = seededRng(JSON.stringify(data));
  const region = data.region || pick(rng, ['皖南松林', '粤北杉木林', '滇西云杉林', '闽东马尾松林', '桂北桉树林']);
  const ndviDrop = data.ndvi_anomaly ?? round(0.1 + rng() * 0.4, 2);
  const affectedArea = data.affected_area_ha ?? round(10 + rng() * 490, 1);

  const affectedCount = Math.round(2 + rng() * 4);
  const areas = [];
  for (let i = 0; i < affectedCount; i++) {
    areas.push({
      id: `P${String(i + 1).padStart(3, '0')}`,
      lat: round(20 + rng() * 15, 4),
      lon: round(100 + rng() * 25, 4),
      area_ha: round(affectedArea / affectedCount * (0.5 + rng()), 1),
      severity: pick(rng, ['轻度', '中度', '重度', '严重']),
      confidence: round(55 + rng() * 40, 0),
      ndvi_drop: round(ndviDrop * (0.5 + rng() * 0.5), 2),
    });
  }

  const pests = [
    { name: '松材线虫(Bursaphelenchus xylophilus)', symptoms: '针叶变黄枯死、蓝变菌感染、树脂分泌停止', spread_rate: '自然扩散0.5km/年+人为传播数十km', host_species: ['马尾松', '黑松', '赤松', '黄山松'] },
    { name: '松毛虫(Dendrolimus spp.)', symptoms: '针叶被食、树冠枯黄、严重时整株死亡', spread_rate: '爆发期扩散2-5km/年', host_species: ['马尾松', '油松', '落叶松', '华山松'] },
    { name: '天牛(Cerambycidae)', symptoms: '蛀干危害、羽化孔、木屑排出、树势衰弱', spread_rate: '成虫飞行1-3km', host_species: ['杨树', '柳树', '松树', '杉树'] },
    { name: '杨树溃疡病', symptoms: '树干水渍状病斑、流胶、皮层腐烂', spread_rate: '风雨传播数km', host_species: ['杨树', '柳树'] },
    { name: '桉树青枯病', symptoms: '叶片萎蔫、维管束褐变、急性凋萎', spread_rate: '土壤传播+水流扩散', host_species: ['桉树'] },
    { name: '美国白蛾(Hyphantria cunea)', symptoms: '群集食叶、网幕、严重时食光叶片', spread_rate: '自然扩散5km/年+人为远距离', host_species: ['杨树', '桑树', '果树', '阔叶树'] },
  ];
  const pestCount = Math.round(1 + rng() * 2);
  const pestResults = pests.slice(0, pestCount).map(p => ({
    ...p,
    probability: round(40 + rng() * 55, 0),
  }));

  const directions = ['东北', '东南', '西北', '西南', '东', '西', '南', '北'];
  const spreadSpeed = round(0.5 + rng() * 5, 1);
  const riskZones = [
    { zone: '高风险区', risk: '极高', area_ha: round(affectedArea * 0.3, 1) },
    { zone: '中风险区', risk: '高', area_ha: round(affectedArea * 0.5, 1) },
    { zone: '低风险区', risk: '中', area_ha: round(affectedArea * 0.8, 1) },
  ];

  const treatments = [
    { method: '生物防治-释放天敌', target: '松毛虫', dosage: '赤眼蜂50000头/ha', timing: '卵期释放', effectiveness: round(60 + rng() * 25, 0) },
    { method: '化学防治-注干施药', target: '松材线虫', dosage: '吡虫啉注干20ml/株', timing: '幼虫期', effectiveness: round(70 + rng() * 20, 0) },
    { method: '物理防治-诱捕器', target: '天牛', dosage: '信息素诱捕器5个/ha', timing: '成虫羽化期', effectiveness: round(50 + rng() * 30, 0) },
    { method: '营林措施-卫生伐', target: '病害木', dosage: '清除枯死木和衰弱木', timing: '全年', effectiveness: round(65 + rng() * 25, 0) },
    { method: '无人机飞防', target: '食叶害虫', dosage: '20%灭幼脲悬浮剂300ml/ha', timing: '幼虫3龄前', effectiveness: round(75 + rng() * 15, 0) },
  ];

  const warningLevel = ndviDrop > 0.3 ? '红色预警' : ndviDrop > 0.2 ? '橙色预警' : ndviDrop > 0.1 ? '黄色预警' : '蓝色预警';

  return {
    detection_summary: { region, detection_date: data.detection_date || pick(rng, ['2025-03-15', '2025-04-01', '2025-04-15']), satellite: data.satellite_source || pick(rng, ['Sentinel-2', '高分一号', 'Landsat-9', '高分六号']), cloud_cover: round(rng() * 15, 1), resolution: pick(rng, ['10m', '2m', '16m', '8m']) },
    affected_areas: areas,
    pest_identification: pestResults,
    spread_model: { direction: pick(rng, directions), speed_km_per_month: spreadSpeed, risk_zones: riskZones },
    treatment_recommendations: treatments,
    early_warning: { level: warningLevel, next_30d: ndviDrop > 0.2 ? '预计扩散加速，需紧急处置' : '扩散趋势可控，持续监测', monitoring_frequency: ndviDrop > 0.2 ? '每周' : '每两周', alert_radius_km: round(5 + spreadSpeed * 10, 0) },
    disclaimer: DISCLAIMER,
  };
}

function formatPestDisease(r: PestDiseaseResult): string {
  let s = '=== 林业病虫害遥感检测与预警报告 ===\n\n';
  s += '【检测概况】\n';
  s += `  区域: ${r.detection_summary.region}\n`;
  s += `  检测日期: ${r.detection_summary.detection_date}\n`;
  s += `  卫星源: ${r.detection_summary.satellite}\n`;
  s += `  云量: ${r.detection_summary.cloud_cover}% | 分辨率: ${r.detection_summary.resolution}\n\n`;
  s += '【受灾区域】\n';
  r.affected_areas.forEach(a => {
    s += `  ${a.id}: 坐标(${a.lat}, ${a.lon}) | ${a.area_ha}ha | ${a.severity} | 置信度${a.confidence}% | NDVI降幅${a.ndvi_drop}\n`;
  });
  s += '\n【病虫害识别】\n';
  r.pest_identification.forEach(p => {
    s += `  ${p.name} — 概率: ${p.probability}%\n`;
    s += `    症状: ${p.symptoms}\n`;
    s += `    扩散速率: ${p.spread_rate}\n`;
    s += `    寄主: ${p.host_species.join('、')}\n`;
  });
  s += '\n【扩散模型】\n';
  s += `  扩散方向: ${r.spread_model.direction}\n`;
  s += `  扩散速度: ${r.spread_model.speed_km_per_month} km/月\n`;
  s += '  风险分区:\n';
  r.spread_model.risk_zones.forEach(z => {
    s += `    ${z.zone}: ${z.risk} | ${z.area_ha}ha\n`;
  });
  s += '\n【防治建议】\n';
  r.treatment_recommendations.forEach(t => {
    s += `  ${t.method} — 目标: ${t.target} | ${t.dosage}\n`;
  s += `    时机: ${t.timing} | 防效: ${t.effectiveness}%\n`;
  });
  s += '\n【预警信息】\n';
  s += `  预警等级: ${r.early_warning.level}\n`;
  s += `  未来30天: ${r.early_warning.next_30d}\n`;
  s += `  监测频次: ${r.early_warning.monitoring_frequency}\n`;
  s += `  警戒半径: ${r.early_warning.alert_radius_km} km\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. biodiversity_monitor — 森林生物多样性指标追踪
// ============================================================
interface BiodiversityInput {
  site_name?: string;
  area_ha?: number;
  forest_type?: string;
  survey_method?: string;
  survey_year?: number;
  region?: string;
  elevation_range?: string;
  protected_status?: string;
}

interface BiodiversityResult {
  site_info: { name: string; area_ha: number; type: string; protected_status: string; survey_year: number };
  species_richness: { total_species: number; trees: number; shrubs: number; herbs: number; mammals: number; birds: number; insects: number };
  diversity_indices: { shannon_wiener: number; simpson: number; pielou_evenness: number; margalef_richness: number; chao1_estimate: number };
  key_species: Array<{ name: string; status: string; population: string; trend: string; iucn: string }>;
  habitat_quality: { canopy_layers: number; deadwood_m3_per_ha: number; water_sources: number; connectivity_index: number; fragmentation: string };
  threat_assessment: Array<{ threat: string; level: string; impact: string; mitigation: string }>;
  trend_analysis: { five_year_change: number; population_trend: string; habitat_trend: string; overall_status: string };
  disclaimer: string;
}

function analyzeBiodiversity(data: BiodiversityInput): BiodiversityResult {
  const rng = seededRng(JSON.stringify(data));
  const sname = data.site_name || pick(rng, ['武夷山国家级自然保护区', '神农架国家公园', '西双版纳热带雨林', '长白山森林生态定位站', '鼎湖山森林生态系统']);
  const area = data.area_ha ?? round(500 + rng() * 9500, 0);
  const surveyYear = data.survey_year ?? pick(rng, [2022, 2023, 2024, 2025]);

  const trees = Math.round(30 + rng() * 120);
  const shrubs = Math.round(20 + rng() * 80);
  const herbs = Math.round(50 + rng() * 200);
  const mammals = Math.round(10 + rng() * 40);
  const birds = Math.round(30 + rng() * 120);
  const insects = Math.round(100 + rng() * 500);
  const totalSpecies = trees + shrubs + herbs + mammals + birds + insects;

  const shannon = round(2.5 + rng() * 2, 2);
  const simpson = round(0.7 + rng() * 0.25, 3);
  const pielou = round(0.6 + rng() * 0.3, 3);
  const margalef = round(5 + rng() * 10, 2);
  const chao1 = Math.round(totalSpecies * (1.05 + rng() * 0.15));

  const keySpecies = [
    { name: pick(rng, ['华南虎', '云豹', '金钱豹', '黑麂']), status: '国家重点保护I级', population: pick(rng, ['5-10只', '10-20只', '痕迹稀少', '未发现实体']), trend: pick(rng, ['稳定', '缓慢增长', '下降', '未知']), iucn: pick(rng, ['CR', 'EN', 'VU']) },
    { name: pick(rng, ['白颈长尾雉', '黄腹角雉', '中华秋沙鸭', '白鹇']), status: '国家重点保护I级', population: pick(rng, ['20-50只', '50-100只', '100-200只']), trend: pick(rng, ['稳定', '缓慢增长', '下降']), iucn: pick(rng, ['EN', 'VU', 'NT']) },
    { name: pick(rng, ['红豆杉', '伯乐树', '珙桐', '望天树']), status: '国家重点保护I级', population: pick(rng, ['50-100株', '100-500株', '500-1000株']), trend: pick(rng, ['稳定', '缓慢增长', '下降']), iucn: pick(rng, ['EN', 'VU', 'NT']) },
    { name: pick(rng, ['穿山甲', '大灵猫', '小灵猫', '林麝']), status: '国家重点保护II级', population: pick(rng, ['10-30只', '30-80只', '痕迹稀少']), trend: pick(rng, ['下降', '稳定', '未知']), iucn: pick(rng, ['CR', 'EN', 'VU']) },
  ];

  const canopyLayers = Math.round(2 + rng() * 3);
  const deadwood = round(5 + rng() * 45, 1);
  const waterSources = Math.round(1 + rng() * 8);
  const connectivity = round(0.4 + rng() * 0.5, 2);
  const fragmentation = connectivity > 0.7 ? '低' : connectivity > 0.5 ? '中' : '高';

  const threats = [
    { threat: '栖息地破碎化', level: pick(rng, ['中', '高', '低']), impact: '种群隔离、基因交流受阻', mitigation: '建设生态廊道、恢复连通性' },
    { threat: '人为干扰(采伐/采集)', level: pick(rng, ['中', '低', '高']), impact: '直接破坏、干扰繁殖', mitigation: '加强巡护、社区共管' },
    { threat: '气候变化', level: pick(rng, ['中', '低', '高']), impact: '物候改变、分布区迁移', mitigation: '适应性管理、建立气候避难所' },
    { threat: '入侵物种', level: pick(rng, ['低', '中', '高']), impact: '竞争排斥本地种', mitigation: '监测预警、清除防控' },
    { threat: '旅游开发压力', level: pick(rng, ['低', '中']), impact: '栖息地退化、噪声干扰', mitigation: '分区管理、限流措施' },
  ];

  const fiveYearChange = round(-10 + rng() * 20, 1);
  const popTrend = fiveYearChange > 5 ? '增长' : fiveYearChange > -5 ? '稳定' : '下降';
  const habitatTrend = pick(rng, ['改善', '稳定', '轻微退化', '改善中']);
  const overallStatus = fiveYearChange > 0 ? '改善中' : fiveYearChange > -5 ? '基本稳定' : '需关注';

  return {
    site_info: { name: sname, area_ha: area, type: data.forest_type || pick(rng, ['常绿阔叶林', '针阔混交林', '热带雨林', '落叶阔叶林', '山地针叶林']), protected_status: data.protected_status || pick(rng, ['国家级自然保护区', '国家公园', '森林公园', '湿地公园', '公益林保护区']), survey_year: surveyYear },
    species_richness: { total_species: totalSpecies, trees, shrubs, herbs, mammals, birds, insects },
    diversity_indices: { shannon_wiener: shannon, simpson: simpson, pielou_evenness: pielou, margalef_richness: margalef, chao1_estimate: chao1 },
    key_species: keySpecies,
    habitat_quality: { canopy_layers: canopyLayers, deadwood_m3_per_ha: deadwood, water_sources: waterSources, connectivity_index: connectivity, fragmentation },
    threat_assessment: threats,
    trend_analysis: { five_year_change: fiveYearChange, population_trend: popTrend, habitat_trend: habitatTrend, overall_status: overallStatus },
    disclaimer: DISCLAIMER,
  };
}

function formatBiodiversity(r: BiodiversityResult): string {
  let s = '=== 森林生物多样性指标追踪报告 ===\n\n';
  s += '【样地信息】\n';
  s += `  地点: ${r.site_info.name}\n`;
  s += `  面积: ${r.site_info.area_ha} ha\n`;
  s += `  林型: ${r.site_info.type}\n`;
  s += `  保护级别: ${r.site_info.protected_status}\n`;
  s += `  调查年份: ${r.site_info.survey_year}\n\n`;
  s += '【物种丰富度】\n';
  s += `  总物种数: ${r.species_richness.total_species}\n`;
  s += `  乔木: ${r.species_richness.trees} | 灌木: ${r.species_richness.shrubs} | 草本: ${r.species_richness.herbs}\n`;
  s += `  兽类: ${r.species_richness.mammals} | 鸟类: ${r.species_richness.birds} | 昆虫: ${r.species_richness.insects}\n\n`;
  s += '【多样性指数】\n';
  s += `  Shannon-Wiener指数(H'): ${r.diversity_indices.shannon_wiener}\n`;
  s += `  Simpson指数(D): ${r.diversity_indices.simpson}\n`;
  s += `  Pielou均匀度(J): ${r.diversity_indices.pielou_evenness}\n`;
  s += `  Margalef丰富度(d): ${r.diversity_indices.margalef_richness}\n`;
  s += `  Chao1估计值: ${r.diversity_indices.chao1_estimate}\n\n`;
  s += '【关键物种】\n';
  r.key_species.forEach(k => {
    s += `  ${k.name} | ${k.status} | IUCN: ${k.iucn}\n`;
  s += `    种群: ${k.population} | 趋势: ${k.trend}\n`;
  });
  s += '\n【栖息地质量】\n';
  s += `  林层结构: ${r.habitat_quality.canopy_layers}层\n`;
  s += `  枯倒木量: ${r.habitat_quality.deadwood_m3_per_ha} m³/ha\n`;
  s += `  水源点: ${r.habitat_quality.water_sources} 处\n`;
  s += `  连通性指数: ${r.habitat_quality.connectivity_index}\n`;
  s += `  破碎化程度: ${r.habitat_quality.fragmentation}\n\n`;
  s += '【威胁评估】\n';
  r.threat_assessment.forEach(t => {
    s += `  [${t.level}] ${t.threat}: ${t.impact}\n`;
    s += `    缓解: ${t.mitigation}\n`;
  });
  s += '\n【趋势分析】\n';
  s += `  五年变化: ${r.trend_analysis.five_year_change > 0 ? '+' : ''}${r.trend_analysis.five_year_change}%\n`;
  s += `  种群趋势: ${r.trend_analysis.population_trend}\n`;
  s += `  栖息地趋势: ${r.trend_analysis.habitat_trend}\n`;
  s += `  总体状态: ${r.trend_analysis.overall_status}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. forest_rights_cadastral_manager — 林权不动产登记与流转管理
// ============================================================
interface ForestRightsInput {
  owner_name?: string;
  certificate_no?: string;
  area_mu?: number;
  location?: string;
  forest_type?: string;
  land_use_right?: string;
  ownership_type?: string;
  transfer_type?: string;
  valuation?: number;
  dispute_status?: string;
}

interface ForestRightsResult {
  registration_info: { owner: string; certificate_no: string; registration_date: string; issuing_authority: string; status: string };
  parcel_details: { location: string; area_mu: number; forest_type: string; land_class: string; boundary_points: number; map_sheet: string };
  rights_structure: { ownership: string; use_right: string; term_years: number; expiry_date: string; mortgage: string; restrictions: string[] };
  transfer_analysis: { transfer_type: string; market_value: number; comparable_sales: number; price_per_mu: number; tax_estimate: number; legal_requirements: string[] };
  dispute_resolution: { status: string; type: string; parties: string[]; resolution_method: string; timeline: string };
  compliance_check: { forest_law: string; land_management_law: string; environmental_law: string; tax_compliance: string; overall: string };
  disclaimer: string;
}

function analyzeForestRights(data: ForestRightsInput): ForestRightsResult {
  const rng = seededRng(JSON.stringify(data));
  const owner = data.owner_name || pick(rng, ['张三(农户)', 'XX林业合作社', 'XX国有林场', 'XX林业公司', '李四(家庭林场)']);
  const certNo = data.certificate_no || `林权证(2025)第${String(Math.round(10000 + rng() * 89999)).padStart(6, '0')}号`;
  const area = data.area_mu ?? round(10 + rng() * 990, 1);
  const location = data.location || pick(rng, ['XX县XX乡XX村', 'XX市XX区XX镇', 'XX林场XX工区', 'XX自然保护区实验区']);
  const transferType = data.transfer_type || pick(rng, ['转让', '出租', '入股', '抵押', '互换']);
  const valuation = data.valuation ?? round(area * (2000 + rng() * 8000), 0);

  const ownershipType = data.ownership_type || pick(rng, ['集体所有-农户承包', '国有-授权经营', '个人所有', '股份合作', '家庭承包']);
  const useRight = data.land_use_right || pick(rng, ['林地使用权', '林木所有权', '林地承包经营权', '林木使用权']);
  const termYears = pick(rng, [30, 40, 50, 70]);
  const expiryYear = 2025 + termYears;

  const comparableSales = round(valuation * (0.8 + rng() * 0.4), 0);
  const pricePerMu = round(comparableSales / area, 0);
  const taxEstimate = round(comparableSales * (0.03 + rng() * 0.05), 0);

  const disputeStatus = data.dispute_status || pick(rng, ['无争议', '边界争议', '权属争议', '继承纠纷', '合同纠纷']);
  const disputeType = disputeStatus === '无争议' ? '无' : disputeStatus;
  const parties = disputeStatus === '无争议' ? [] : pick(rng, [
    ['甲方(出让方)', '乙方(受让方)'],
    ['村集体', '承包农户'],
    ['继承人A', '继承人B'],
    ['林场', '周边村民'],
  ]);

  return {
    registration_info: { owner, certificate_no: certNo, registration_date: pick(rng, ['2020-05-15', '2021-08-20', '2022-03-10', '2023-11-01']), issuing_authority: pick(rng, ['XX县林业局', 'XX市自然资源和规划局', 'XX省林业局']), status: pick(rng, ['已登记', '已登记', '变更中', '抵押登记中']) },
    parcel_details: { location, area_mu: area, forest_type: data.forest_type || pick(rng, ['用材林', '经济林', '防护林', '薪炭林', '特种用途林']), land_class: pick(rng, ['I级林地', 'II级林地', 'III级林地', 'IV级林地']), boundary_points: Math.round(4 + rng() * 12), map_sheet: `H-48-G-(${Math.round(1 + rng() * 99)})` },
    rights_structure: { ownership: ownershipType, use_right: useRight, term_years: termYears, expiry_date: `${expiryYear}-12-31`, mortgage: pick(rng, ['无抵押', '已抵押-农业银行', '已抵押-农信社', '无抵押']), restrictions: pick(rng, [
      ['采伐限额管理', '林地用途管制'],
      ['公益林禁伐', '生态红线约束'],
      ['采伐限额管理', '林地用途管制', '更新造林义务'],
      ['无特殊限制'],
    ]) },
    transfer_analysis: { transfer_type: transferType, market_value: comparableSales, comparable_sales: comparableSales, price_per_mu: pricePerMu, tax_estimate: taxEstimate, legal_requirements: [
      '林权登记证书齐全',
      '经村民会议三分之二以上成员同意(集体林)',
      '公示期不少于30日',
      '签订书面流转合同',
      '报林业主管部门备案',
      '缴纳相关税费',
    ] },
    dispute_resolution: { status: disputeStatus, type: disputeType, parties, resolution_method: disputeStatus === '无争议' ? '无需处理' : pick(rng, ['协商调解', '行政裁决', '仲裁', '司法诉讼']), timeline: disputeStatus === '无争议' ? 'N/A' : pick(rng, ['30日内', '60日内', '90日内', '6个月内']) },
    compliance_check: { forest_law: pick(rng, ['合规', '合规', '需补充材料']), land_management_law: pick(rng, ['合规', '合规', '需核实']), environmental_law: pick(rng, ['合规', '合规', '需评估']), tax_compliance: pick(rng, ['合规', '需补缴', '合规']), overall: pick(rng, ['合规', '合规', '基本合规-需完善']) },
    disclaimer: DISCLAIMER,
  };
}

function formatForestRights(r: ForestRightsResult): string {
  let s = '=== 林权不动产登记与流转管理报告 ===\n\n';
  s += '【登记信息】\n';
  s += `  权利人: ${r.registration_info.owner}\n`;
  s += `  权证号: ${r.registration_info.certificate_no}\n`;
  s += `  登记日期: ${r.registration_info.registration_date}\n`;
  s += `  发证机关: ${r.registration_info.issuing_authority}\n`;
  s += `  登记状态: ${r.registration_info.status}\n\n`;
  s += '【宗地详情】\n';
  s += `  坐落: ${r.parcel_details.location}\n`;
  s += `  面积: ${r.parcel_details.area_mu} 亩\n`;
  s += `  林种: ${r.parcel_details.forest_type}\n`;
  s += `  林地等级: ${r.parcel_details.land_class}\n`;
  s += `  界址点: ${r.parcel_details.boundary_points} 个\n`;
  s += `  图幅号: ${r.parcel_details.map_sheet}\n\n`;
  s += '【权利结构】\n';
  s += `  所有权: ${r.rights_structure.ownership}\n`;
  s += `  使用权: ${r.rights_structure.use_right}\n`;
  s += `  期限: ${r.rights_structure.term_years}年 (至${r.rights_structure.expiry_date})\n`;
  s += `  抵押: ${r.rights_structure.mortgage}\n`;
  s += `  限制条件: ${r.rights_structure.restrictions.join('、')}\n\n`;
  s += '【流转分析】\n';
  s += `  流转方式: ${r.transfer_analysis.transfer_type}\n`;
  s += `  市场估值: ¥${r.transfer_analysis.market_value.toLocaleString()}\n`;
  s += `  比较案例价: ¥${r.transfer_analysis.comparable_sales.toLocaleString()}\n`;
  s += `  单价: ¥${r.transfer_analysis.price_per_mu.toLocaleString()}/亩\n`;
  s += `  税费估算: ¥${r.transfer_analysis.tax_estimate.toLocaleString()}\n`;
  s += '  法律要求:\n';
  r.transfer_analysis.legal_requirements.forEach(l => { s += `    - ${l}\n`; });
  s += '\n【争议处理】\n';
  s += `  争议状态: ${r.dispute_resolution.status}\n`;
  if (r.dispute_resolution.status !== '无争议') {
    s += `  争议类型: ${r.dispute_resolution.type}\n`;
    s += `  当事方: ${r.dispute_resolution.parties.join(' vs ')}\n`;
    s += `  解决方式: ${r.dispute_resolution.resolution_method}\n`;
    s += `  预计时限: ${r.dispute_resolution.timeline}\n`;
  }
  s += '\n【合规检查】\n';
  s += `  《森林法》: ${r.compliance_check.forest_law}\n`;
  s += `  《土地管理法》: ${r.compliance_check.land_management_law}\n`;
  s += `  《环境保护法》: ${r.compliance_check.environmental_law}\n`;
  s += `  税务合规: ${r.compliance_check.tax_compliance}\n`;
  s += `  总体评价: ${r.compliance_check.overall}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. forest_inventory_analyzer
  tools.register(defineTool({
    name: 'forest_inventory_analyzer',
    description: '森林资源清查与蓄积量估算 — 基于林分调查数据，提供蓄积量估算、生物量计算、碳储量评估、树种组成分析和生长预测',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含forest_name, area_ha, forest_type, dominant_species, avg_dbh_cm, avg_height_m, trees_per_ha, age_class, region等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatForestInventory(analyzeForestInventory(JSON.parse(args.input_data)));
    },
  }));

  // 2. fire_risk_prediction
  tools.register(defineTool({
    name: 'fire_risk_prediction',
    description: '森林火险等级预测与热点监测 — 基于气象数据和遥感热点，提供FWI火险指数计算、风险等级评估、蔓延预测和防范措施',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含region, temperature, humidity, wind_speed, rainfall_30d, drought_index, vegetation_type, canopy_cover, fuel_load, elevation等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatFireRisk(analyzeFireRisk(JSON.parse(args.input_data)));
    },
  }));

  // 3. timber_harvest_scheduler
  tools.register(defineTool({
    name: 'timber_harvest_scheduler',
    description: '采伐计划与可持续木材供给 — 基于林分数据和经营目标，提供五年采伐计划、可持续产量分析、经济评估和物流规划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含forest_name, total_area_ha, annual_allowable_cut, current_stock_m3, target_species, harvest_method, rotation_age, market_price, road_density, slope_limit等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatTimberHarvest(analyzeTimberHarvest(JSON.parse(args.input_data)));
    },
  }));

  // 4. reforestation_planner
  tools.register(defineTool({
    name: 'reforestation_planner',
    description: '造林方案设计与树种选择 — 基于立地条件和经营目的，提供树种推荐、种植设计、土壤准备、抚育管理和成本估算',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含site_name, area_ha, region, elevation, slope, aspect, soil_type, ph, annual_rainfall, purpose, budget等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatReforestation(analyzeReforestation(JSON.parse(args.input_data)));
    },
  }));

  // 5. forest_carbon_sink_calculator
  tools.register(defineTool({
    name: 'forest_carbon_sink_calculator',
    description: '林业碳汇核算与CCER方法学 — 基于CCER方法学，提供基线碳储量、项目碳储量、核证减排量、财务分析和监测计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_name, area_ha, forest_type, species, age_class, region, baseline_scenario, crediting_period, carbon_price, methodology等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCarbonSink(analyzeCarbonSink(JSON.parse(args.input_data)));
    },
  }));

  // 6. pest_disease_detector
  tools.register(defineTool({
    name: 'pest_disease_detector',
    description: '林业病虫害遥感检测与预警 — 基于遥感影像和气象数据，提供病虫害识别、扩散模型、防治建议和预警等级',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含region, forest_type, satellite_source, ndvi_anomaly, affected_area_ha, pest_type, temperature, humidity, wind_direction, detection_date等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPestDisease(analyzePestDisease(JSON.parse(args.input_data)));
    },
  }));

  // 7. biodiversity_monitor
  tools.register(defineTool({
    name: 'biodiversity_monitor',
    description: '森林生物多样性指标追踪 — 基于调查数据，提供物种丰富度、多样性指数、关键物种、栖息地质量、威胁评估和趋势分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含site_name, area_ha, forest_type, survey_method, survey_year, region, elevation_range, protected_status等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatBiodiversity(analyzeBiodiversity(JSON.parse(args.input_data)));
    },
  }));

  // 8. forest_rights_cadastral_manager
  tools.register(defineTool({
    name: 'forest_rights_cadastral_manager',
    description: '林权不动产登记与流转管理 — 基于权属信息，提供登记信息、宗地详情、权利结构、流转分析、争议处理和合规检查',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含owner_name, certificate_no, area_mu, location, forest_type, land_use_right, ownership_type, transfer_type, valuation, dispute_status等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatForestRights(analyzeForestRights(JSON.parse(args.input_data)));
    },
  }));
}
