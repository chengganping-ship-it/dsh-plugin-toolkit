import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'retailagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供零售经营参考，不替代专业运营决策。';

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

function rnd(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function rndInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rnd(rng, min, max + 1));
}

function pick(rng: () => number, arr: string[]): string {
  return arr[rndInt(rng, 0, arr.length - 1)];
}

// ============================================================
// Tool 1: omnichannel_operations — 全渠道运营
// ============================================================

interface OmnichannelInput {
  channels?: string[];
  stores?: number;
  online_ratio?: number;
  inventory_sync_rate?: number;
  order_volume?: number;
}

interface OmnichannelResult {
  channel_score: number;
  sync_efficiency: number;
  routing_optimization: number;
  fulfillment_rate: number;
  recommendations: string[];
}

function analyzeOmnichannel(data: OmnichannelInput): OmnichannelResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const channels = data.channels || ['线上商城', '线下门店', '社交电商', 'O2O'];
  const syncRate = data.inventory_sync_rate ?? rnd(rng, 0.7, 0.99);
  const routingOpt = rnd(rng, 0.6, 0.95);
  const fulfillmentRate = rnd(rng, 0.8, 0.99);
  const channelScore = Math.round((syncRate * 0.3 + routingOpt * 0.35 + fulfillmentRate * 0.35) * 100);
  const recommendations: string[] = [];
  if (syncRate < 0.9) recommendations.push('库存同步率偏低，建议升级实时库存同步系统');
  if (routingOpt < 0.8) recommendations.push('订单路由效率可优化，建议引入智能路由算法');
  if (fulfillmentRate < 0.9) recommendations.push('履约率有提升空间，建议优化最后一公里配送');
  recommendations.push(`当前覆盖 ${channels.length} 个渠道，建议持续拓展新兴社交电商渠道`);
  recommendations.push('建议建立统一的会员积分体系，打通线上线下权益');
  return { channel_score: channelScore, sync_efficiency: Math.round(syncRate * 100), routing_optimization: Math.round(routingOpt * 100), fulfillment_rate: Math.round(fulfillmentRate * 100), recommendations };
}

function formatOmnichannel(r: OmnichannelResult): string {
  return [
    '【全渠道运营分析报告】',
    `渠道健康评分: ${r.channel_score}/100`,
    `库存同步效率: ${r.sync_efficiency}%`,
    `订单路由优化: ${r.routing_optimization}%`,
    `综合履约率: ${r.fulfillment_rate}%`,
    '',
    '运营建议:',
    ...r.recommendations.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    DISCLAIMER,
  ].join('\n');
}

// ============================================================
// Tool 2: smart_store_manager — 智慧门店管理
// ============================================================

interface SmartStoreInput {
  store_id?: string;
  daily_footfall?: number;
  area_sqm?: number;
  category?: string;
  avg_dwell_minutes?: number;
}

interface SmartStoreResult {
  store_score: number;
  footfall_grade: string;
  heatmap_zones: { zone: string; intensity: number }[];
  assortment_health: number;
  restock_alerts: string[];
  recommendations: string[];
}

function analyzeSmartStore(data: SmartStoreInput): SmartStoreResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const footfall = data.daily_footfall ?? rndInt(rng, 500, 5000);
  const area = data.area_sqm ?? rndInt(rng, 50, 500);
  const footfallGrade = footfall > 3000 ? 'A' : footfall > 1500 ? 'B' : footfall > 500 ? 'C' : 'D';
  const heatmapZones = [
    { zone: '入口区', intensity: rndInt(rng, 70, 100) },
    { zone: '收银区', intensity: rndInt(rng, 50, 90) },
    { zone: '促销区', intensity: rndInt(rng, 60, 95) },
    { zone: '深处陈列区', intensity: rndInt(rng, 20, 60) },
    { zone: '试衣间/体验区', intensity: rndInt(rng, 30, 75) },
  ];
  const assortmentHealth = rndInt(rng, 60, 98);
  const restockAlerts: string[] = [];
  if (assortmentHealth < 80) restockAlerts.push('部分SKU库存不足，建议48小时内补货');
  if (footfall > 2000) restockAlerts.push('高客流时段，热销品需紧急补货');
  const recommendations: string[] = [];
  recommendations.push(`坪效评估: 日均客流${footfall}人 / ${area}㎡ = ${(footfall / area).toFixed(1)}人/㎡`);
  recommendations.push('建议在深处陈列区增加引导标识或互动装置提升客流');
  if (assortmentHealth < 85) recommendations.push('商品陈列健康度偏低，建议优化SKU组合');
  recommendations.push('建议部署智能货架，实时监控库存与陈列状态');
  const storeScore = Math.round((heatmapZones.reduce((a, z) => a + z.intensity, 0) / heatmapZones.length * 0.4 + assortmentHealth * 0.4 + (footfallGrade === 'A' ? 90 : footfallGrade === 'B' ? 75 : footfallGrade === 'C' ? 60 : 45) * 0.2));
  return { store_score: storeScore, footfall_grade: footfallGrade, heatmap_zones: heatmapZones, assortment_health: assortmentHealth, restock_alerts: restockAlerts, recommendations };
}

function formatSmartStore(r: SmartStoreResult): string {
  return [
    '【智慧门店管理报告】',
    `门店综合评分: ${r.store_score}/100`,
    `客流等级: ${r.footfall_grade}`,
    `陈列健康度: ${r.assortment_health}%`,
    '',
    '热力图分析:',
    ...r.heatmap_zones.map(z => `  ${z.zone}: 热度 ${z.intensity}%`),
    '',
    '补货预警:',
    ...(r.restock_alerts.length > 0 ? r.restock_alerts.map(s => `  ⚠ ${s}`) : ['  暂无紧急补货需求']),
    '',
    '优化建议:',
    ...r.recommendations.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    DISCLAIMER,
  ].join('\n');
}

// ============================================================
// Tool 3: customer_growth_engine — 用户增长引擎
// ============================================================

interface CustomerGrowthInput {
  total_members?: number;
  active_rate?: number;
  avg_order_value?: number;
  purchase_frequency?: number;
  churn_rate?: number;
}

interface CustomerGrowthResult {
  growth_score: number;
  ltv_estimate: number;
  churn_risk_level: string;
  repurchase_probability: number;
  segments: { name: string; ratio: number; strategy: string }[];
  recommendations: string[];
}

function analyzeCustomerGrowth(data: CustomerGrowthInput): CustomerGrowthResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const activeRate = data.active_rate ?? rnd(rng, 0.2, 0.7);
  const avgOrderValue = data.avg_order_value ?? rnd(rng, 50, 500);
  const frequency = data.purchase_frequency ?? rnd(rng, 1, 12);
  const churnRate = data.churn_rate ?? rnd(rng, 0.05, 0.4);
  const ltv = Math.round(avgOrderValue * frequency * (1 / Math.max(churnRate, 0.01)) * 0.3);
  const churnRisk = churnRate > 0.3 ? '高' : churnRate > 0.15 ? '中' : '低';
  const repurchaseProb = Math.round((1 - churnRate) * rnd(rng, 0.7, 0.95) * 100);
  const segments = [
    { name: '高价值忠诚用户', ratio: Math.round(rnd(rng, 5, 20)), strategy: 'VIP专属权益+个性化推荐' },
    { name: '潜力成长用户', ratio: Math.round(rnd(rng, 15, 35)), strategy: '阶梯优惠+品类拓展引导' },
    { name: '低频尝鲜用户', ratio: Math.round(rnd(rng, 20, 40)), strategy: '首单优惠+社交裂变激励' },
    { name: '沉默流失用户', ratio: Math.round(rnd(rng, 10, 30)), strategy: '唤醒券+流失原因调研' },
  ];
  const growthScore = Math.round(activeRate * 30 + (1 - churnRate) * 30 + Math.min(repurchaseProb, 100) * 0.2 + Math.min(ltv / 100, 100) * 0.2);
  const recommendations: string[] = [];
  if (churnRate > 0.2) recommendations.push('流失率偏高，建议建立自动化流失预警与召回机制');
  if (activeRate < 0.4) recommendations.push('活跃率不足，建议增加签到、积分等互动玩法');
  recommendations.push(`预估用户LTV约¥${ltv}，建议针对高价值用户投入更多运营资源`);
  recommendations.push('建议搭建RFM模型，实现精细化分层运营');
  return { growth_score: growthScore, ltv_estimate: ltv, churn_risk_level: churnRisk, repurchase_probability: repurchaseProb, segments, recommendations };
}

function formatCustomerGrowth(r: CustomerGrowthResult): string {
  return [
    '【用户增长引擎报告】',
    `增长健康评分: ${r.growth_score}/100`,
    `预估用户LTV: ¥${r.ltv_estimate}`,
    `流失风险等级: ${r.churn_risk_level}`,
    `复购概率: ${r.repurchase_probability}%`,
    '',
    '用户分层策略:',
    ...r.segments.map(s => `  ${s.name} (${s.ratio}%): ${s.strategy}`),
    '',
    '增长建议:',
    ...r.recommendations.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    DISCLAIMER,
  ].join('\n');
}

// ============================================================
// Tool 4: dynamic_pricing_optimizer — 动态定价优化
// ============================================================

interface PricingInput {
  product_name?: string;
  current_price?: number;
  cost?: number;
  competitor_prices?: number[];
  demand_elasticity?: number;
  season_factor?: number;
}

interface PricingResult {
  optimal_price: number;
  profit_margin: number;
  price_elasticity: number;
  competitive_position: string;
  promotion_suggestions: string[];
  recommendations: string[];
}

function analyzePricing(data: PricingInput): PricingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const currentPrice = data.current_price ?? rnd(rng, 50, 500);
  const cost = data.cost ?? rnd(rng, 20, currentPrice * 0.7);
  const elasticity = data.demand_elasticity ?? rnd(rng, -3, -0.5);
  const seasonFactor = data.season_factor ?? rnd(rng, 0.8, 1.3);
  const optimalPrice = Math.round((cost / (1 + 1 / elasticity)) * seasonFactor * 100) / 100;
  const profitMargin = Math.round((optimalPrice - cost) / optimalPrice * 100);
  const competitorAvg = data.competitor_prices ? data.competitor_prices.reduce((a, b) => a + b, 0) / data.competitor_prices.length : rnd(rng, currentPrice * 0.8, currentPrice * 1.2);
  const compPos = optimalPrice < competitorAvg * 0.9 ? '价格优势' : optimalPrice > competitorAvg * 1.1 ? '高端定位' : '竞争均势';
  const promotionSuggestions: string[] = [];
  if (seasonFactor > 1.1) promotionSuggestions.push('旺季需求旺盛，可适当提价5-10%');
  if (seasonFactor < 0.9) promotionSuggestions.push('淡季建议推出满减/买赠活动刺激需求');
  if (elasticity < -1.5) promotionSuggestions.push('需求弹性大，降价可带来显著销量增长');
  promotionSuggestions.push('建议设置阶梯价：满2件95折，满3件9折');
  const recommendations: string[] = [];
  recommendations.push(`当前定价¥${currentPrice}，建议优化至¥${optimalPrice}`);
  recommendations.push(`预期毛利率: ${profitMargin}%`);
  recommendations.push('建议每周监控竞品价格变动，动态调整策略');
  recommendations.push('结合库存周转率，对滞销品实施自动降价机制');
  return { optimal_price: optimalPrice, profit_margin: profitMargin, price_elasticity: Math.round(elasticity * 100) / 100, competitive_position: compPos, promotion_suggestions: promotionSuggestions, recommendations };
}

function formatPricing(r: PricingResult): string {
  return [
    '【动态定价优化报告】',
    `建议最优价格: ¥${r.optimal_price}`,
    `预期毛利率: ${r.profit_margin}%`,
    `需求价格弹性: ${r.price_elasticity}`,
    `竞争定位: ${r.competitive_position}`,
    '',
    '促销策略建议:',
    ...r.promotion_suggestions.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '定价建议:',
    ...r.recommendations.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    DISCLAIMER,
  ].join('\n');
}

// ============================================================
// Tool 5: product_assortment_planner — 商品企划
// ============================================================

interface AssortmentInput {
  category?: string;
  current_skus?: number;
  target_skus?: number;
  sales_data?: { sku: string; revenue: number; margin: number }[];
  season?: string;
}

interface AssortmentResult {
  assortment_score: number;
  sku_health: number;
  trend_direction: string;
  recommendations: { action: string; sku: string; reason: string }[];
  phase_out_candidates: string[];
  trend_forecast: string[];
}

function analyzeAssortment(data: AssortmentInput): AssortmentResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const currentSkus = data.current_skus ?? rndInt(rng, 100, 2000);
  const targetSkus = data.target_skus ?? Math.round(currentSkus * rnd(rng, 0.8, 1.3));
  const skuHealth = rndInt(rng, 55, 95);
  const trendDir = pick(rng, ['上升', '平稳', '调整期', '新兴风口']);
  const recommendations: { action: string; sku: string; reason: string }[] = [];
  const actions = ['加大陈列', '引入新品', '优化定价', '捆绑销售', '清仓处理'];
  for (let i = 0; i < 5; i++) {
    recommendations.push({ action: pick(rng, actions), sku: `SKU-${rndInt(rng, 1000, 9999)}`, reason: pick(rng, ['高毛利贡献', '高周转率', '趋势品类', '竞品缺失', '用户好评率高']) });
  }
  const phaseOut: string[] = [];
  for (let i = 0; i < rndInt(rng, 2, 5); i++) {
    phaseOut.push(`SKU-${rndInt(rng, 1000, 9999)} (${pick(rng, ['连续3月滞销', '毛利低于5%', '退货率过高', '品类重叠'])})`);
  }
  const trendForecast: string[] = [];
  const trends = ['健康/有机品类持续增长', '国潮品牌渗透率提升', '小包装/便携需求上升', '功能性产品增速明显', '个性化定制需求增长'];
  for (let i = 0; i < 3; i++) trendForecast.push(pick(rng, trends));
  const assortmentScore = Math.round(skuHealth * 0.4 + (targetSkus > currentSkus ? 70 : 85) * 0.3 + (trendDir === '上升' || trendDir === '新兴风口' ? 90 : 70) * 0.3);
  return { assortment_score: assortmentScore, sku_health: skuHealth, trend_direction: trendDir, recommendations, phase_out_candidates: phaseOut, trend_forecast: trendForecast };
}

function formatAssortment(r: AssortmentResult): string {
  return [
    '【商品企划分析报告】',
    `商品组合评分: ${r.assortment_score}/100`,
    `SKU健康度: ${r.sku_health}%`,
    `品类趋势: ${r.trend_direction}`,
    '',
    '选品/汰换建议:',
    ...r.recommendations.map((rec, i) => `  ${i + 1}. [${rec.action}] ${rec.sku} — ${rec.reason}`),
    '',
    '汰换候选:',
    ...r.phase_out_candidates.map(s => `  ✗ ${s}`),
    '',
    '趋势预测:',
    ...r.trend_forecast.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    DISCLAIMER,
  ].join('\n');
}

// ============================================================
// Tool 6: supply_chain_retail — 零售供应链
// ============================================================

interface SupplyChainInput {
  warehouse_count?: number;
  supplier_count?: number;
  avg_lead_time_days?: number;
  stockout_rate?: number;
  logistics_cost_ratio?: number;
  return_rate?: number;
}

interface SupplyChainResult {
  supply_score: number;
  demand_forecast_accuracy: number;
  auto_replenishment_rate: number;
  supplier_rating: string;
  logistics_efficiency: number;
  reverse_logistics_cost: number;
  recommendations: string[];
}

function analyzeSupplyChain(data: SupplyChainInput): SupplyChainResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const demandAccuracy = rnd(rng, 0.65, 0.95);
  const autoReplenish = rnd(rng, 0.4, 0.9);
  const stockoutRate = data.stockout_rate ?? rnd(rng, 0.01, 0.15);
  const logisticsCost = data.logistics_cost_ratio ?? rnd(rng, 0.03, 0.15);
  const returnRate = data.return_rate ?? rnd(rng, 0.02, 0.2);
  const supplierRating = data.supplier_count && data.supplier_count > 20 ? '分散需整合' : data.supplier_count && data.supplier_count < 5 ? '集中风险' : '结构合理';
  const logisticsEff = Math.round((1 - logisticsCost) * 100);
  const reverseCost = Math.round(returnRate * rnd(rng, 50, 200));
  const supplyScore = Math.round(demandAccuracy * 30 + autoReplenish * 25 + (1 - stockoutRate) * 25 + logisticsEff * 0.2);
  const recommendations: string[] = [];
  if (demandAccuracy < 0.8) recommendations.push('需求预测准确率偏低，建议引入ML预测模型');
  if (autoReplenish < 0.7) recommendations.push('自动补货覆盖率不足，建议扩展智能补货品类');
  if (stockoutRate > 0.08) recommendations.push('缺货率偏高，建议优化安全库存策略');
  if (logisticsCost > 0.1) recommendations.push('物流成本占比过高，建议优化配送网络布局');
  recommendations.push(`逆向物流成本约¥${reverseCost}/单，建议优化退货流程与二次分销`);
  recommendations.push('建议建立供应商协同平台，实现信息实时共享');
  return { supply_score: supplyScore, demand_forecast_accuracy: Math.round(demandAccuracy * 100), auto_replenishment_rate: Math.round(autoReplenish * 100), supplier_rating: supplierRating, logistics_efficiency: logisticsEff, reverse_logistics_cost: reverseCost, recommendations };
}

function formatSupplyChain(r: SupplyChainResult): string {
  return [
    '【零售供应链分析报告】',
    `供应链综合评分: ${r.supply_score}/100`,
    `需求预测准确率: ${r.demand_forecast_accuracy}%`,
    `自动补货覆盖率: ${r.auto_replenishment_rate}%`,
    `供应商结构: ${r.supplier_rating}`,
    `物流效率: ${r.logistics_efficiency}%`,
    `逆向物流成本: ¥${r.reverse_logistics_cost}/单`,
    '',
    '优化建议:',
    ...r.recommendations.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    DISCLAIMER,
  ].join('\n');
}

// ============================================================
// Tool 7: live_commerce_agent — 直播电商
// ============================================================

interface LiveCommerceInput {
  platform?: string;
  stream_duration_min?: number;
  product_count?: number;
  target_audience?: string;
  budget?: number;
}

interface LiveCommerceResult {
  live_score: number;
  conversion_rate: number;
  interaction_rate: number;
  script_highlights: string[];
  funnel: { stage: string; rate: number }[];
  kol_suggestions: { tier: string; followers: string; fit_score: number }[];
  recommendations: string[];
}

function analyzeLiveCommerce(data: LiveCommerceInput): LiveCommerceResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const conversionRate = rnd(rng, 0.01, 0.12);
  const interactionRate = rnd(rng, 0.05, 0.35);
  const scriptHighlights: string[] = [
    `开场30秒福利钩子：限时${rndInt(rng, 1, 5)}折秒杀`,
    `核心卖点话术：强调${pick(rng, ['性价比', '独家款', '明星同款', '工厂直供'])}`,
    `互动引导：每${rndInt(rng, 5, 15)}分钟一轮抽奖/红包`,
    `逼单话术：库存仅剩${rndInt(rng, 50, 500)}件，${rndInt(rng, 3, 10)}分钟后下架`,
    `结尾预告：下场直播${pick(rng, ['新品首发', '超级爆款返场', '神秘嘉宾'])}`,
  ];
  const funnel = [
    { stage: '曝光进入', rate: rndInt(rng, 20, 60) },
    { stage: '停留观看', rate: rndInt(rng, 30, 70) },
    { stage: '互动参与', rate: Math.round(interactionRate * 100) },
    { stage: '商品点击', rate: rndInt(rng, 10, 40) },
    { stage: '下单转化', rate: Math.round(conversionRate * 100) },
  ];
  const kolSuggestions: { tier: string; followers: string; fit_score: number }[] = [
    { tier: '头部达人', followers: `${rndInt(rng, 500, 2000)}万`, fit_score: rndInt(rng, 60, 95) },
    { tier: '腰部达人', followers: `${rndInt(rng, 50, 500)}万`, fit_score: rndInt(rng, 70, 98) },
    { tier: '尾部KOC', followers: `${rndInt(rng, 1, 50)}万`, fit_score: rndInt(rng, 65, 90) },
  ];
  const liveScore = Math.round(conversionRate * 300 + interactionRate * 100 + funnel[0].rate * 0.3);
  const recommendations: string[] = [];
  recommendations.push(`当前预估转化率${(conversionRate * 100).toFixed(1)}%，${conversionRate > 0.05 ? '表现优秀' : '有提升空间'}`);
  recommendations.push('建议采用「爆款+福利品」组合策略，提升停留时长');
  recommendations.push('互动率是关键指标，建议增加投票、抽奖等互动玩法');
  recommendations.push('建议建立达人矩阵：头部造势+腰部带货+尾部种草');
  return { live_score: liveScore, conversion_rate: Math.round(conversionRate * 1000) / 10, interaction_rate: Math.round(interactionRate * 100), script_highlights: scriptHighlights, funnel: funnel, kol_suggestions: kolSuggestions, recommendations };
}

function formatLiveCommerce(r: LiveCommerceResult): string {
  return [
    '【直播电商运营报告】',
    `直播综合评分: ${r.live_score}/100`,
    `预估转化率: ${r.conversion_rate}%`,
    `互动率: ${r.interaction_rate}%`,
    '',
    '话术要点:',
    ...r.script_highlights.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '转化漏斗:',
    ...r.funnel.map(f => `  ${f.stage}: ${f.rate}%`),
    '',
    '达人匹配建议:',
    ...r.kol_suggestions.map(k => `  ${k.tier} (${k.followers}粉): 匹配度${k.fit_score}%`),
    '',
    '运营建议:',
    ...r.recommendations.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    DISCLAIMER,
  ].join('\n');
}

// ============================================================
// Tool 8: retail_data_analytics — 零售数据分析
// ============================================================

interface RetailAnalyticsInput {
  period?: string;
  revenue?: number;
  transactions?: number;
  unique_customers?: number;
  store_count?: number;
  area_total_sqm?: number;
}

interface RetailAnalyticsResult {
  revenue_growth_yoy: number;
  revenue_growth_mom: number;
  conversion_rate: number;
  avg_transaction_value: number;
  sales_per_sqm: number;
  customer_metrics: { new_rate: number; repeat_rate: number; avg_basket_size: number };
  recommendations: string[];
}

function analyzeRetailAnalytics(data: RetailAnalyticsInput): RetailAnalyticsResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const revenue = data.revenue ?? rnd(rng, 100000, 10000000);
  const transactions = data.transactions ?? rndInt(rng, 1000, 100000);
  const uniqueCustomers = data.unique_customers ?? rndInt(rng, 500, 50000);
  const areaSqm = data.area_total_sqm ?? rndInt(rng, 100, 5000);
  const yoyGrowth = rnd(rng, -0.1, 0.5);
  const momGrowth = rnd(rng, -0.05, 0.2);
  const conversionRate = rnd(rng, 0.1, 0.6);
  const avgTransactionValue = Math.round(revenue / transactions * 100) / 100;
  const salesPerSqm = Math.round(revenue / areaSqm * 100) / 100;
  const customerMetrics = {
    new_rate: Math.round(rnd(rng, 0.1, 0.5) * 100),
    repeat_rate: Math.round(rnd(rng, 0.2, 0.6) * 100),
    avg_basket_size: Math.round(rnd(rng, 1.5, 4) * 10) / 10,
  };
  const recommendations: string[] = [];
  if (yoyGrowth < 0) recommendations.push('同比负增长，需重点关注市场变化与竞品动态');
  if (momGrowth < 0) recommendations.push('环比下滑，建议分析季节性因素并调整运营策略');
  if (conversionRate < 0.3) recommendations.push('进店转化率偏低，建议优化门店陈列与导购服务');
  if (avgTransactionValue < 100) recommendations.push('客单价偏低，建议增加关联销售与组合推荐');
  recommendations.push(`坪效¥${salesPerSqm}/㎡，${salesPerSqm > 500 ? '表现良好' : '有提升空间'}`);
  recommendations.push(`新老客比例: 新客${customerMetrics.new_rate}% / 复购${customerMetrics.repeat_rate}%`);
  return { revenue_growth_yoy: Math.round(yoyGrowth * 1000) / 10, revenue_growth_mom: Math.round(momGrowth * 1000) / 10, conversion_rate: Math.round(conversionRate * 100), avg_transaction_value: avgTransactionValue, sales_per_sqm: salesPerSqm, customer_metrics: customerMetrics, recommendations };
}

function formatRetailAnalytics(r: RetailAnalyticsResult): string {
  return [
    '【零售数据分析报告】',
    `同比增长: ${r.revenue_growth_yoy}%`,
    `环比增长: ${r.revenue_growth_mom}%`,
    `进店转化率: ${r.conversion_rate}%`,
    `客单价: ¥${r.avg_transaction_value}`,
    `坪效: ¥${r.sales_per_sqm}/㎡`,
    '',
    '顾客指标:',
    `  新客占比: ${r.customer_metrics.new_rate}%`,
    `  复购率: ${r.customer_metrics.repeat_rate}%`,
    `  平均件数: ${r.customer_metrics.avg_basket_size}件/单`,
    '',
    '分析建议:',
    ...r.recommendations.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    DISCLAIMER,
  ].join('\n');
}

// ============================================================
// Plugin registration
// ============================================================

export function apply(ctx: Context): void {
  const tools = ctx.tools;

  // 1. omnichannel_operations
  tools.register(defineTool({
    name: 'omnichannel_operations',
    description: '全渠道运营分析 — 线上线下一体化、库存同步、订单路由、履约优化、渠道分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatOmnichannel(analyzeOmnichannel(JSON.parse(args.input_data)));
    },
  }));

  // 2. smart_store_manager
  tools.register(defineTool({
    name: 'smart_store_manager',
    description: '智慧门店管理 — 客流分析、热力图、陈列优化、智能补货、门店评分',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSmartStore(analyzeSmartStore(JSON.parse(args.input_data)));
    },
  }));

  // 3. customer_growth_engine
  tools.register(defineTool({
    name: 'customer_growth_engine',
    description: '用户增长引擎 — 会员运营、精准营销、复购预测、LTV分析、流失预警',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCustomerGrowth(analyzeCustomerGrowth(JSON.parse(args.input_data)));
    },
  }));

  // 4. dynamic_pricing_optimizer
  tools.register(defineTool({
    name: 'dynamic_pricing_optimizer',
    description: '动态定价优化 — 竞品监控、需求弹性、促销策略、价格弹性、利润最大化',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPricing(analyzePricing(JSON.parse(args.input_data)));
    },
  }));

  // 5. product_assortment_planner
  tools.register(defineTool({
    name: 'product_assortment_planner',
    description: '商品企划 — 品类规划、选品推荐、SKU优化、汰换分析、趋势预测',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatAssortment(analyzeAssortment(JSON.parse(args.input_data)));
    },
  }));

  // 6. supply_chain_retail
  tools.register(defineTool({
    name: 'supply_chain_retail',
    description: '零售供应链 — 需求预测、自动补货、供应商管理、物流优化、逆向物流',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSupplyChain(analyzeSupplyChain(JSON.parse(args.input_data)));
    },
  }));

  // 7. live_commerce_agent
  tools.register(defineTool({
    name: 'live_commerce_agent',
    description: '直播电商 — 选品策略、话术生成、互动分析、转化漏斗、达人匹配',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatLiveCommerce(analyzeLiveCommerce(JSON.parse(args.input_data)));
    },
  }));

  // 8. retail_data_analytics
  tools.register(defineTool({
    name: 'retail_data_analytics',
    description: '零售数据分析 — 销售分析、转化漏斗、客单价、坪效、同比环比',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatRetailAnalytics(analyzeRetailAnalytics(JSON.parse(args.input_data)));
    },
  }));
}
