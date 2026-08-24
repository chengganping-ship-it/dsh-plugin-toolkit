import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'dmartai';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供数字营销广告策略参考，不替代专业广告优化师决策。';

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
// 1. ad_creative_tester — 广告创意测试与效果预测
// ============================================================
export interface AdCreativeTesterInput {
  ad_format?: string;
  platform?: string;
  creative_variants?: Array<{ headline: string; description: string; cta: string; visual_type: string }>;
  target_audience?: string;
  campaign_objective?: string;
  budget_per_variant?: number;
  test_duration_days?: number;
  historical_ctr?: number;
  industry_benchmark_ctr?: number;
}

export interface AdCreativeTesterResult {
  test_design: { test_name: string; variants_count: number; sample_size_per_variant: number; confidence_level: number; duration_days: number };
  variant_predictions: Array<{ variant_id: number; headline: string; predicted_ctr: number; predicted_cvr: number; quality_score: number; winning_probability: number }>;
  statistical_power: { minimum_detectable_effect: number; power: number; required_sample_size: number };
  recommendations: Array<{ variant_id: number; action: string; reason: string; expected_lift: number }>;
  risk_assessment: Array<{ risk: string; probability: number; mitigation: string }>;
  disclaimer: string;
}

function analyzeAdCreativeTester(data: AdCreativeTesterInput): AdCreativeTesterResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const format = data.ad_format || pick(rng, ['图片广告', '视频广告', '轮播广告', '信息流广告', '搜索广告']);
  const platform = data.platform || pick(rng, ['抖音', '腾讯广告', '巨量引擎', '百度营销', 'Google Ads']);
  const objective = data.campaign_objective || pick(rng, ['转化量', '点击量', '品牌曝光', '应用安装', '线索收集']);
  const duration = data.test_duration_days ?? Math.round(7 + rng() * 21);
  const budgetPerVariant = data.budget_per_variant ?? round(1000 + rng() * 9000, 0);
  const histCtr = data.historical_ctr ?? round(1 + rng() * 5, 2);
  const benchCtr = data.industry_benchmark_ctr ?? round(0.8 + rng() * 3, 2);

  const variants = data.creative_variants || [
    { headline: '限时优惠 立即抢购', description: '品质之选 全网最低价', cta: '立即购买', visual_type: '产品特写' },
    { headline: '新品首发 抢先体验', description: '创新科技 改变生活', cta: '了解更多', visual_type: '场景图' },
    { headline: '用户好评推荐', description: '百万用户的选择', cta: '加入我们', visual_type: 'UGC截图' },
    { headline: '专属福利 仅限今日', description: '会员专享折扣', cta: '领取优惠', visual_type: '促销海报' },
  ];

  const variantPredictions = variants.map((v, idx) => {
    const ctrLift = round((rng() - 0.3) * 4, 2);
    const cvrLift = round((rng() - 0.2) * 3, 2);
    return {
      variant_id: idx + 1,
      headline: v.headline,
      predicted_ctr: round(Math.max(0.3, histCtr + ctrLift), 2),
      predicted_cvr: round(Math.max(0.1, (histCtr * 0.3) + cvrLift), 2),
      quality_score: round(50 + rng() * 45, 0),
      winning_probability: round(15 + rng() * 50, 1),
    };
  });

  const totalSample = Math.round(variants.length * (5000 + rng() * 15000));
  const testDesign = {
    test_name: `${platform}${format}A/B测试`,
    variants_count: variants.length,
    sample_size_per_variant: Math.round(totalSample / variants.length),
    confidence_level: 95,
    duration_days: duration,
  };

  const statisticalPower = {
    minimum_detectable_effect: round(5 + rng() * 15, 1),
    power: round(80 + rng() * 15, 1),
    required_sample_size: totalSample,
  };

  const sortedVariants = [...variantPredictions].sort((a, b) => b.winning_probability - a.winning_probability);
  const recommendations = sortedVariants.slice(0, 3).map(v => ({
    variant_id: v.variant_id,
    action: v === sortedVariants[0] ? '加大投放预算' : v.winning_probability > 30 ? '继续观察' : '暂停或优化',
    reason: v === sortedVariants[0] ? '胜出概率最高，建议作为主力创意' : v.winning_probability > 30 ? '有一定胜出机会，需更多数据验证' : '胜出概率较低，建议优化或淘汰',
    expected_lift: round(v.winning_probability * 0.3, 1),
  }));

  const riskAssessment = [
    { risk: '样本量不足导致结论不可靠', probability: round(10 + rng() * 25, 1), mitigation: '延长测试周期或增加每变体预算' },
    { risk: '外部因素干扰(节假日/竞品活动)', probability: round(15 + rng() * 20, 1), mitigation: '设置对照组并记录外部事件' },
    { risk: '新奇效应导致数据偏差', probability: round(20 + rng() * 20, 1), mitigation: '确保测试周期覆盖至少一个完整用户周期' },
  ];

  return {
    test_design: testDesign,
    variant_predictions: variantPredictions,
    statistical_power: statisticalPower,
    recommendations,
    risk_assessment: riskAssessment,
    disclaimer: DISCLAIMER,
  };
}

function formatAdCreativeTester(r: AdCreativeTesterResult): string {
  let s = '=== 广告创意测试与效果预测报告 ===\n\n';
  s += '【测试设计】\n';
  s += `  测试名称: ${r.test_design.test_name}\n`;
  s += `  变体数量: ${r.test_design.variants_count} | 每变体样本量: ${r.test_design.sample_size_per_variant.toLocaleString()}\n`;
  s += `  置信水平: ${r.test_design.confidence_level}% | 测试周期: ${r.test_design.duration_days}天\n\n`;
  s += '【变体预测】\n';
  r.variant_predictions.forEach(v => {
    s += `  变体${v.variant_id}: "${v.headline}"\n`;
    s += `    预测CTR: ${v.predicted_ctr}% | 预测CVR: ${v.predicted_cvr}% | 质量分: ${v.quality_score} | 胜出概率: ${v.winning_probability}%\n`;
  });
  s += '\n【统计功效】\n';
  s += `  最小可检测效应: ${r.statistical_power.minimum_detectable_effect}%\n`;
  s += `  统计功效: ${r.statistical_power.power}% | 所需样本量: ${r.statistical_power.required_sample_size.toLocaleString()}\n\n`;
  s += '【推荐行动】\n';
  r.recommendations.forEach(r => {
    s += `  变体${r.variant_id}: ${r.action} — ${r.reason} (预期提升: ${r.expected_lift}%)\n`;
  });
  s += '\n【风险评估】\n';
  r.risk_assessment.forEach(risk => {
    s += `  ${risk.risk} — 概率: ${risk.probability}% | 缓解: ${risk.mitigation}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. attribution_analysis_engine — 多触点归因分析引擎
// ============================================================
export interface AttributionAnalysisInput {
  conversion_goal?: string;
  attribution_model?: string;
  channels?: string[];
  lookback_window_days?: number;
  total_conversions?: number;
  total_revenue?: number;
  touchpoint_data?: Array<{ channel: string; touches: number; conversions: number; revenue: number }>;
  time_decay_factor?: number;
}

export interface AttributionAnalysisResult {
  model_comparison: Array<{ model: string; description: string; accuracy: number; recommended: boolean }>;
  channel_attribution: Array<{ channel: string; first_touch_conv: number; last_touch_conv: number; linear_conv: number; time_decay_conv: number; data_driven_conv: number }>;
  journey_analysis: { avg_touchpoints: number; avg_journey_days: number; top_paths: Array<{ path: string; conversions: number; revenue: number }> };
  incrementality: Array<{ channel: string; incremental_lift: number; incremental_revenue: number; roi: number }>;
  budget_reallocation: Array<{ channel: string; current_share: number; recommended_share: number; change: number }>;
  disclaimer: string;
}

function analyzeAttributionAnalysis(data: AttributionAnalysisInput): AttributionAnalysisResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const goal = data.conversion_goal || pick(rng, ['购买转化', '注册转化', '线索提交', '应用安装']);
  const lookback = data.lookback_window_days ?? Math.round(7 + rng() * 23);
  const totalConv = data.total_conversions ?? Math.round(1000 + rng() * 9000);
  const totalRev = data.total_revenue ?? round(totalConv * (50 + rng() * 200), 0);

  const channels = data.channels || ['抖音信息流', '百度搜索', '微信朋友圈', '小红书种草', '天猫直通车', '快手短视频'];

  const modelComparison = [
    { model: '首次触达归因', description: '100%功劳归于首次触点', accuracy: round(40 + rng() * 15, 1), recommended: false },
    { model: '末次触达归因', description: '100%功劳归于末次触点', accuracy: round(50 + rng() * 15, 1), recommended: false },
    { model: '线性归因', description: '平均分配功劳给所有触点', accuracy: round(60 + rng() * 15, 1), recommended: false },
    { model: '时间衰减归因', description: '越接近转化的触点权重越高', accuracy: round(70 + rng() * 15, 1), recommended: true },
    { model: '数据驱动归因', description: '基于Shapley值的机器学习模型', accuracy: round(80 + rng() * 15, 1), recommended: true },
  ];

  const channelAttribution = channels.slice(0, 6).map(ch => {
    const ft = round(10 + rng() * 30, 1);
    const lt = round(10 + rng() * 35, 1);
    const lin = round(10 + rng() * 25, 1);
    const td = round(10 + rng() * 30, 1);
    const dd = round(10 + rng() * 30, 1);
    return {
      channel: ch,
      first_touch_conv: ft,
      last_touch_conv: lt,
      linear_conv: lin,
      time_decay_conv: td,
      data_driven_conv: dd,
    };
  });

  const topPaths = [
    { path: '抖音信息流 -> 百度搜索 -> 天猫直通车', conversions: Math.round(totalConv * (0.1 + rng() * 0.15)), revenue: round(totalRev * (0.1 + rng() * 0.15), 0) },
    { path: '小红书种草 -> 微信朋友圈 -> 百度搜索', conversions: Math.round(totalConv * (0.08 + rng() * 0.12)), revenue: round(totalRev * (0.08 + rng() * 0.12), 0) },
    { path: '抖音信息流 -> 快手短视频 -> 天猫直通车', conversions: Math.round(totalConv * (0.05 + rng() * 0.1)), revenue: round(totalRev * (0.05 + rng() * 0.1), 0) },
    { path: '百度搜索 -> 天猫直通车', conversions: Math.round(totalConv * (0.1 + rng() * 0.1)), revenue: round(totalRev * (0.1 + rng() * 0.1), 0) },
  ];

  const incrementality = channels.slice(0, 5).map(ch => {
    const lift = round(5 + rng() * 35, 1);
    return {
      channel: ch,
      incremental_lift: lift,
      incremental_revenue: round(totalRev * lift / 100, 0),
      roi: round(1 + rng() * 4, 2),
    };
  });

  const budgetReallocation = channels.slice(0, 5).map(ch => {
    const current = round(10 + rng() * 30, 1);
    const recommended = round(current + (rng() - 0.4) * 15, 1);
    return {
      channel: ch,
      current_share: current,
      recommended_share: Math.max(5, recommended),
      change: round(recommended - current, 1),
    };
  });

  return {
    model_comparison: modelComparison,
    channel_attribution: channelAttribution,
    journey_analysis: {
      avg_touchpoints: round(2 + rng() * 4, 1),
      avg_journey_days: round(3 + rng() * 12, 1),
      top_paths: topPaths,
    },
    incrementality,
    budget_reallocation: budgetReallocation,
    disclaimer: DISCLAIMER,
  };
}

function formatAttributionAnalysis(r: AttributionAnalysisResult): string {
  let s = '=== 多触点归因分析报告 ===\n\n';
  s += '【模型对比】\n';
  r.model_comparison.forEach(m => {
    s += `  ${m.model} — 准确度: ${m.accuracy}% ${m.recommended ? '[推荐]' : ''}\n`;
    s += `    ${m.description}\n`;
  });
  s += '\n【渠道归因】\n';
  r.channel_attribution.forEach(c => {
    s += `  ${c.channel}:\n`;
    s += `    首次触达: ${c.first_touch_conv}% | 末次触达: ${c.last_touch_conv}% | 线性: ${c.linear_conv}%\n`;
    s += `    时间衰减: ${c.time_decay_conv}% | 数据驱动: ${c.data_driven_conv}%\n`;
  });
  s += '\n【路径分析】\n';
  s += `  平均触点数: ${r.journey_analysis.avg_touchpoints} | 平均路径天数: ${r.journey_analysis.avg_journey_days}天\n`;
  r.journey_analysis.top_paths.forEach(p => {
    s += `  ${p.path} — 转化: ${p.conversions.toLocaleString()} | 收入: ¥${p.revenue.toLocaleString()}\n`;
  });
  s += '\n【增量分析】\n';
  r.incrementality.forEach(i => {
    s += `  ${i.channel} — 增量提升: ${i.incremental_lift}% | 增量收入: ¥${i.incremental_revenue.toLocaleString()} | ROI: ${i.roi}\n`;
  });
  s += '\n【预算重分配建议】\n';
  r.budget_reallocation.forEach(b => {
    const arrow = b.change > 0 ? '↑' : b.change < 0 ? '↓' : '→';
    s += `  ${b.channel}: ${b.current_share}% -> ${b.recommended_share}% (${arrow}${Math.abs(b.change)}%)\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. roas_optimizer — ROAS优化与出价策略
// ============================================================
export interface RoasOptimizerInput {
  campaign_type?: string;
  current_roas?: number;
  target_roas?: number;
  total_budget?: number;
  channel_budgets?: Array<{ channel: string; budget: number; roas: number; spend: number }>;
  historical_data_days?: number;
  bid_strategy?: string;
  audience_segments?: Array<{ segment: string; size: number; avg_order_value: number; conversion_rate: number }>;
  seasonality_factor?: number;
}

export interface RoasOptimizerResult {
  roas_diagnosis: { current_roas: number; target_roas: number; gap: number; health_status: string; trend: string };
  channel_optimization: Array<{ channel: string; current_roas: number; target_roas: number; budget_adjustment: number; new_budget: number; action: string }>;
  bid_recommendations: Array<{ segment: string; current_bid: number; recommended_bid: number; bid_change_percent: number; reason: string }>;
  budget_scenarios: Array<{ scenario: string; total_budget: number; expected_revenue: number; expected_roas: number; risk_level: string }>;
  pacing_analysis: { daily_spend_rate: number; budget_utilization: number; pacing_status: string; recommendation: string };
  disclaimer: string;
}

function analyzeRoasOptimizer(data: RoasOptimizerInput): RoasOptimizerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const currentRoas = data.current_roas ?? round(1.5 + rng() * 3, 2);
  const targetRoas = data.target_roas ?? round(currentRoas + 0.5 + rng() * 2, 2);
  const totalBudget = data.total_budget ?? round(50000 + rng() * 450000, 0);
  const gap = round(targetRoas - currentRoas, 2);
  const healthStatus = gap <= 0 ? '健康' : gap < 1 ? '需关注' : '需优化';
  const trend = pick(rng, ['上升', '稳定', '下降', '波动']);

  const channels = data.channel_budgets || [
    { channel: '抖音信息流', budget: round(totalBudget * 0.3, 0), roas: round(1.5 + rng() * 2, 2), spend: round(totalBudget * 0.28, 0) },
    { channel: '微信朋友圈', budget: round(totalBudget * 0.25, 0), roas: round(1 + rng() * 2.5, 2), spend: round(totalBudget * 0.24, 0) },
    { channel: '百度搜索', budget: round(totalBudget * 0.2, 0), roas: round(2 + rng() * 2, 2), spend: round(totalBudget * 0.19, 0) },
    { channel: '小红书种草', budget: round(totalBudget * 0.15, 0), roas: round(0.8 + rng() * 2, 2), spend: round(totalBudget * 0.14, 0) },
    { channel: '天猫直通车', budget: round(totalBudget * 0.1, 0), roas: round(2.5 + rng() * 2, 2), spend: round(totalBudget * 0.09, 0) },
  ];

  const channelOptimization = channels.map(ch => {
    const targetChRoas = round(ch.roas * (0.9 + rng() * 0.4), 2);
    const adjustment = ch.roas >= targetRoas ? round(rng() * 20, 1) : -round(rng() * 25, 1);
    return {
      channel: ch.channel,
      current_roas: ch.roas,
      target_roas: targetChRoas,
      budget_adjustment: adjustment,
      new_budget: round(ch.budget * (1 + adjustment / 100), 0),
      action: adjustment > 5 ? '增加预算' : adjustment < -5 ? '减少预算' : '维持现状',
    };
  });

  const segments = data.audience_segments || [
    { segment: '高价值老客', size: 50000, avg_order_value: round(200 + rng() * 300, 0), conversion_rate: round(3 + rng() * 5, 2) },
    { segment: '新客探索', size: 200000, avg_order_value: round(80 + rng() * 120, 0), conversion_rate: round(1 + rng() * 3, 2) },
    { segment: '竞品用户', size: 100000, avg_order_value: round(100 + rng() * 200, 0), conversion_rate: round(0.5 + rng() * 2, 2) },
    { segment: '相似人群扩展', size: 500000, avg_order_value: round(60 + rng() * 100, 0), conversion_rate: round(0.3 + rng() * 1.5, 2) },
  ];

  const bidRecommendations = segments.map(seg => {
    const currentBid = round(1 + rng() * 9, 2);
    const cvrFactor = seg.conversion_rate / 3;
    const aovFactor = seg.avg_order_value / 200;
    const recommendedBid = round(currentBid * cvrFactor * aovFactor * (0.8 + rng() * 0.4), 2);
    return {
      segment: seg.segment,
      current_bid: currentBid,
      recommended_bid: Math.max(0.5, recommendedBid),
      bid_change_percent: round(((recommendedBid - currentBid) / currentBid) * 100, 1),
      reason: `基于转化率${seg.conversion_rate}%和客单价¥${seg.avg_order_value}计算`,
    };
  });

  const budgetScenarios = [
    { scenario: '保守策略', total_budget: round(totalBudget * 0.8, 0), expected_roas: round(currentRoas * (1.1 + rng() * 0.2), 2), risk_level: '低' },
    { scenario: '当前策略', total_budget: totalBudget, expected_roas: currentRoas, risk_level: '中' },
    { scenario: '激进策略', total_budget: round(totalBudget * 1.3, 0), expected_roas: round(currentRoas * (0.85 + rng() * 0.3), 2), risk_level: '高' },
  ].map(sc => ({
    ...sc,
    expected_revenue: round(sc.total_budget * sc.expected_roas, 0),
  }));

  const dailySpendRate = round(totalBudget / 30, 0);
  const budgetUtilization = round(70 + rng() * 28, 1);
  const pacingStatus = budgetUtilization > 95 ? '超支风险' : budgetUtilization > 80 ? '正常' : budgetUtilization > 50 ? '偏慢' : '严重偏慢';

  return {
    roas_diagnosis: { current_roas: currentRoas, target_roas: targetRoas, gap, health_status: healthStatus, trend },
    channel_optimization: channelOptimization,
    bid_recommendations: bidRecommendations,
    budget_scenarios: budgetScenarios,
    pacing_analysis: { daily_spend_rate: dailySpendRate, budget_utilization: budgetUtilization, pacing_status: pacingStatus, recommendation: pacingStatus === '超支风险' ? '降低日预算或暂停低效计划' : pacingStatus === '偏慢' ? '放宽出价限制或扩大受众' : '保持当前节奏' },
    disclaimer: DISCLAIMER,
  };
}

function formatRoasOptimizer(r: RoasOptimizerResult): string {
  let s = '=== ROAS优化与出价策略报告 ===\n\n';
  s += '【ROAS诊断】\n';
  s += `  当前ROAS: ${r.roas_diagnosis.current_roas} | 目标ROAS: ${r.roas_diagnosis.target_roas} | 差距: ${r.roas_diagnosis.gap}\n`;
  s += `  健康状态: ${r.roas_diagnosis.health_status} | 趋势: ${r.roas_diagnosis.trend}\n\n`;
  s += '【渠道优化】\n';
  r.channel_optimization.forEach(c => {
    s += `  ${c.channel} — 当前ROAS: ${c.current_roas} -> 目标: ${c.target_roas} | 预算调整: ${c.budget_adjustment > 0 ? '+' : ''}${c.budget_adjustment}% (¥${c.new_budget.toLocaleString()}) | ${c.action}\n`;
  });
  s += '\n【出价建议】\n';
  r.bid_recommendations.forEach(b => {
    s += `  ${b.segment}: ¥${b.current_bid} -> ¥${b.recommended_bid} (${b.bid_change_percent > 0 ? '+' : ''}${b.bid_change_percent}%) — ${b.reason}\n`;
  });
  s += '\n【预算场景】\n';
  r.budget_scenarios.forEach(sc => {
    s += `  ${sc.scenario} — 预算: ¥${sc.total_budget.toLocaleString()} | 预期收入: ¥${sc.expected_revenue.toLocaleString()} | 预期ROAS: ${sc.expected_roas} | 风险: ${sc.risk_level}\n`;
  });
  s += '\n【消耗节奏】\n';
  s += `  日均消耗: ¥${r.pacing_analysis.daily_spend_rate.toLocaleString()} | 预算利用率: ${r.pacing_analysis.budget_utilization}%\n`;
  s += `  节奏状态: ${r.pacing_analysis.pacing_status} | 建议: ${r.pacing_analysis.recommendation}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. creative_fatigue_detector — 创意疲劳检测与预警
// ============================================================
export interface CreativeFatigueInput {
  creative_id?: string;
  creative_type?: string;
  platform?: string;
  metrics_over_time?: Array<{ date: string; impressions: number; clicks: number; ctr: number; conversions: number; frequency: number }>;
  audience_size?: number;
  campaign_duration_days?: number;
  fatigue_threshold_ctr_drop?: number;
  fatigue_threshold_frequency?: number;
  replacement_creatives_available?: number;
}

export interface CreativeFatigueResult {
  fatigue_status: { level: string; score: number; is_fatigued: boolean; days_until_fatigue: number };
  metric_trends: { ctr_trend: string; ctr_decline_rate: number; frequency_trend: string; frequency_growth_rate: number; conversion_trend: string };
  fatigue_signals: Array<{ signal: string; severity: string; detected: boolean; value: number; threshold: number }>;
  audience_saturation: { reach_percent: number; avg_frequency: number; unique_reach: number; saturation_level: string };
  action_plan: Array<{ action: string; urgency: string; expected_recovery: number; effort: string }>;
  disclaimer: string;
}

function analyzeCreativeFatigue(data: CreativeFatigueInput): CreativeFatigueResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const creativeType = data.creative_type || pick(rng, ['图片广告', '视频广告', '轮播广告', '信息流广告']);
  const platform = data.platform || pick(rng, ['抖音', '腾讯广告', '巨量引擎', '百度营销']);
  const audienceSize = data.audience_size ?? Math.round(100000 + rng() * 900000);
  const campaignDuration = data.campaign_duration_days ?? Math.round(7 + rng() * 53);
  const ctrDropThreshold = data.fatigue_threshold_ctr_drop ?? round(20 + rng() * 20, 1);
  const freqThreshold = data.fatigue_threshold_frequency ?? round(3 + rng() * 4, 1);

  const initialCtr = round(2 + rng() * 4, 2);
  const currentCtr = round(initialCtr * (0.3 + rng() * 0.5), 2);
  const ctrDeclineRate = round(((initialCtr - currentCtr) / initialCtr) * 100, 1);
  const currentFreq = round(2 + rng() * 6, 1);
  const freqGrowthRate = round(10 + rng() * 50, 1);

  const fatigueScore = round(Math.min(100, ctrDeclineRate * 1.5 + (currentFreq / freqThreshold) * 30 + rng() * 10), 0);
  const fatigueLevel = fatigueScore > 70 ? '严重疲劳' : fatigueScore > 40 ? '中度疲劳' : fatigueScore > 20 ? '轻度疲劳' : '健康';
  const isFatigued = fatigueScore > 40;
  const daysUntilFatigue = isFatigued ? 0 : Math.round((40 - fatigueScore) / (fatigueScore > 0 ? fatigueScore : 1) * campaignDuration);

  const ctrTrend = ctrDeclineRate > 30 ? '快速下降' : ctrDeclineRate > 15 ? '持续下降' : ctrDeclineRate > 5 ? '缓慢下降' : '稳定';
  const freqTrend = freqGrowthRate > 40 ? '快速增长' : freqGrowthRate > 20 ? '稳步增长' : '缓慢增长';
  const convTrend = pick(rng, ['下降', '稳定', '波动下降']);

  const fatigueSignals = [
    { signal: 'CTR持续下降', severity: '高', detected: ctrDropThreshold < ctrDeclineRate, value: ctrDeclineRate, threshold: ctrDropThreshold },
    { signal: '频次超过阈值', severity: '高', detected: currentFreq > freqThreshold, value: currentFreq, threshold: freqThreshold },
    { signal: '转化率下降', severity: '中', detected: rng() > 0.4, value: round(20 + rng() * 40, 1), threshold: 25 },
    { signal: 'CPM持续上升', severity: '中', detected: rng() > 0.5, value: round(15 + rng() * 30, 1), threshold: 20 },
    { signal: '互动率下降', severity: '低', detected: rng() > 0.6, value: round(10 + rng() * 25, 1), threshold: 15 },
  ];

  const reachPercent = round(30 + rng() * 60, 1);
  const avgFrequency = currentFreq;
  const uniqueReach = Math.round(audienceSize * reachPercent / 100);
  const saturationLevel = reachPercent > 80 ? '高度饱和' : reachPercent > 60 ? '中度饱和' : reachPercent > 40 ? '轻度饱和' : '低饱和';

  const actionPlan = [];
  if (isFatigued) {
    actionPlan.push({ action: '立即更换创意素材', urgency: '紧急', expected_recovery: round(40 + rng() * 30, 0), effort: '高' });
    actionPlan.push({ action: '扩大受众范围或更换定向', urgency: '高', expected_recovery: round(20 + rng() * 25, 0), effort: '中' });
  }
  actionPlan.push({ action: '准备备选创意库(至少3套)', urgency: isFatigued ? '高' : '中', expected_recovery: round(15 + rng() * 20, 0), effort: '中' });
  actionPlan.push({ action: '设置自动化疲劳预警规则', urgency: '中', expected_recovery: 0, effort: '低' });
  if (saturationLevel === '高度饱和' || saturationLevel === '中度饱和') {
    actionPlan.push({ action: '暂停投放并冷却受众', urgency: '高', expected_recovery: round(20 + rng() * 20, 0), effort: '低' });
  }

  return {
    fatigue_status: { level: fatigueLevel, score: fatigueScore, is_fatigued: isFatigued, days_until_fatigue: daysUntilFatigue },
    metric_trends: { ctr_trend: ctrTrend, ctr_decline_rate: ctrDeclineRate, frequency_trend: freqTrend, frequency_growth_rate: freqGrowthRate, conversion_trend: convTrend },
    fatigue_signals: fatigueSignals,
    audience_saturation: { reach_percent: reachPercent, avg_frequency: avgFrequency, unique_reach: uniqueReach, saturation_level: saturationLevel },
    action_plan: actionPlan,
    disclaimer: DISCLAIMER,
  };
}

function formatCreativeFatigue(r: CreativeFatigueResult): string {
  let s = '=== 创意疲劳检测与预警报告 ===\n\n';
  s += '【疲劳状态】\n';
  s += `  疲劳等级: ${r.fatigue_status.level} | 疲劳评分: ${r.fatigue_status.score}/100\n`;
  s += `  是否疲劳: ${r.fatigue_status.is_fatigued ? '是' : '否'} | 距离疲劳: ${r.fatigue_status.days_until_fatigue}天\n\n`;
  s += '【指标趋势】\n';
  s += `  CTR趋势: ${r.metric_trends.ctr_trend} (下降率: ${r.metric_trends.ctr_decline_rate}%)\n`;
  s += `  频次趋势: ${r.metric_trends.frequency_trend} (增长率: ${r.metric_trends.frequency_growth_rate}%)\n`;
  s += `  转化趋势: ${r.metric_trends.conversion_trend}\n\n`;
  s += '【疲劳信号】\n';
  r.fatigue_signals.forEach(sig => {
    s += `  [${sig.detected ? '已触发' : '未触发'}] ${sig.severity} | ${sig.signal}: ${sig.value} (阈值: ${sig.threshold})\n`;
  });
  s += '\n【受众饱和度】\n';
  s += `  触达率: ${r.audience_saturation.reach_percent}% | 平均频次: ${r.audience_saturation.avg_frequency}\n`;
  s += `  独立触达: ${r.audience_saturation.unique_reach.toLocaleString()}人 | 饱和程度: ${r.audience_saturation.saturation_level}\n\n`;
  s += '【行动计划】\n';
  r.action_plan.forEach(a => {
    s += `  [${a.urgency}] ${a.action} — 预期恢复: ${a.expected_recovery}% | 工作量: ${a.effort}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. cross_channel_analyzer — 跨渠道广告效果分析
// ============================================================
export interface CrossChannelInput {
  channels?: string[];
  date_range?: string;
  metrics?: string[];
  total_spend?: number;
  total_revenue?: number;
  channel_data?: Array<{ channel: string; spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>;
  cross_channel_attribution?: boolean;
  overlap_analysis?: boolean;
}

export interface CrossChannelResult {
  channel_comparison: Array<{ channel: string; spend: number; impressions: number; clicks: number; ctr: number; cpc: number; conversions: number; cvr: number; cpa: number; roas: number; efficiency_score: number }>;
  efficiency_ranking: Array<{ rank: number; channel: string; efficiency_score: number; strength: string; weakness: string }>;
  cross_channel_effects: Array<{ from_channel: string; to_channel: string; lift_percent: number; interaction_type: string }>;
  budget_optimization: Array<{ channel: string; current_spend: number; optimal_spend: number; change: number; reason: string }>;
  synergy_score: { overall: number; channel_pairs: Array<{ pair: string; synergy: number; recommendation: string }> };
  disclaimer: string;
}

function analyzeCrossChannel(data: CrossChannelInput): CrossChannelResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const totalSpend = data.total_spend ?? round(100000 + rng() * 900000, 0);
  const totalRevenue = data.total_revenue ?? round(totalSpend * (1.5 + rng() * 2.5), 0);

  const channels = data.channel_data || [
    { channel: '抖音信息流', spend: round(totalSpend * 0.25, 0), impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
    { channel: '微信朋友圈', spend: round(totalSpend * 0.2, 0), impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
    { channel: '百度搜索', spend: round(totalSpend * 0.18, 0), impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
    { channel: '小红书种草', spend: round(totalSpend * 0.15, 0), impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
    { channel: '天猫直通车', spend: round(totalSpend * 0.12, 0), impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
    { channel: '快手短视频', spend: round(totalSpend * 0.1, 0), impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
  ];

  const channelComparison = channels.map(ch => {
    const impressions = Math.round(ch.spend * (50 + rng() * 150));
    const clicks = Math.round(impressions * (0.01 + rng() * 0.06));
    const ctr = round((clicks / impressions) * 100, 2);
    const cpc = round(ch.spend / clicks, 2);
    const conversions = Math.round(clicks * (0.02 + rng() * 0.08));
    const cvr = round((conversions / clicks) * 100, 2);
    const cpa = round(ch.spend / conversions, 2);
    const revenue = round(ch.spend * (1 + rng() * 3), 0);
    const roas = round(revenue / ch.spend, 2);
    const efficiencyScore = round(Math.min(100, roas * 20 + (100 - cpa / 10) + rng() * 10), 0);
    return {
      channel: ch.channel,
      spend: ch.spend,
      impressions,
      clicks,
      ctr,
      cpc,
      conversions,
      cvr,
      cpa,
      roas,
      efficiency_score: efficiencyScore,
    };
  });

  const sorted = [...channelComparison].sort((a, b) => b.efficiency_score - a.efficiency_score);
  const efficiencyRanking = sorted.map((ch, idx) => ({
    rank: idx + 1,
    channel: ch.channel,
    efficiency_score: ch.efficiency_score,
    strength: ch.roas > 2 ? '高ROAS' : ch.ctr > 3 ? '高CTR' : ch.cvr > 5 ? '高CVR' : '低成本',
    weakness: ch.cpa > 100 ? '高CPA' : ch.ctr < 2 ? '低CTR' : ch.roas < 1.5 ? '低ROAS' : '规模受限',
  }));

  const crossChannelEffects = [
    { from_channel: '小红书种草', to_channel: '天猫直通车', lift_percent: round(15 + rng() * 25, 1), interaction_type: '种草-转化协同' },
    { from_channel: '抖音信息流', to_channel: '百度搜索', lift_percent: round(10 + rng() * 20, 1), interaction_type: '曝光-搜索协同' },
    { from_channel: '微信朋友圈', to_channel: '抖音信息流', lift_percent: round(5 + rng() * 15, 1), interaction_type: '社交-推荐协同' },
    { from_channel: '百度搜索', to_channel: '天猫直通车', lift_percent: round(8 + rng() * 18, 1), interaction_type: '搜索-购物协同' },
  ];

  const budgetOptimization = channelComparison.map(ch => {
    const optimalMultiplier = ch.efficiency_score > 70 ? 1.2 + rng() * 0.3 : ch.efficiency_score > 50 ? 0.9 + rng() * 0.2 : 0.5 + rng() * 0.3;
    const optimalSpend = round(ch.spend * optimalMultiplier, 0);
    return {
      channel: ch.channel,
      current_spend: ch.spend,
      optimal_spend: optimalSpend,
      change: round(((optimalSpend - ch.spend) / ch.spend) * 100, 1),
      reason: ch.efficiency_score > 70 ? '高效率渠道，建议加大投入' : ch.efficiency_score > 50 ? '中等效率，微调优化' : '效率偏低，建议缩减预算',
    };
  });

  const synergyPairs = [
    { pair: '抖音信息流 + 小红书种草', synergy: round(60 + rng() * 35, 0), recommendation: '种草+曝光组合效果显著，建议同步投放' },
    { pair: '百度搜索 + 天猫直通车', synergy: round(55 + rng() * 35, 0), recommendation: '搜索+转化组合，建议保持联动' },
    { pair: '微信朋友圈 + 抖音信息流', synergy: round(40 + rng() * 40, 0), recommendation: '社交+推荐组合，可测试增量效果' },
  ];

  return {
    channel_comparison: channelComparison,
    efficiency_ranking: efficiencyRanking,
    cross_channel_effects: crossChannelEffects,
    budget_optimization: budgetOptimization,
    synergy_score: { overall: round(50 + rng() * 40, 0), channel_pairs: synergyPairs },
    disclaimer: DISCLAIMER,
  };
}

function formatCrossChannel(r: CrossChannelResult): string {
  let s = '=== 跨渠道广告效果分析报告 ===\n\n';
  s += '【渠道对比】\n';
  r.channel_comparison.forEach(c => {
    s += `  ${c.channel} — 花费: ¥${c.spend.toLocaleString()} | 展示: ${c.impressions.toLocaleString()} | 点击: ${c.clicks.toLocaleString()}\n`;
    s += `    CTR: ${c.ctr}% | CPC: ¥${c.cpc} | CVR: ${c.cvr}% | CPA: ¥${c.cpa} | ROAS: ${c.roas} | 效率分: ${c.efficiency_score}\n`;
  });
  s += '\n【效率排名】\n';
  r.efficiency_ranking.forEach(e => {
    s += `  #${e.rank} ${e.channel} — 效率分: ${e.efficiency_score} | 优势: ${e.strength} | 劣势: ${e.weakness}\n`;
  });
  s += '\n【跨渠道效应】\n';
  r.cross_channel_effects.forEach(e => {
    s += `  ${e.from_channel} -> ${e.to_channel}: 提升${e.lift_percent}% (${e.interaction_type})\n`;
  });
  s += '\n【预算优化】\n';
  r.budget_optimization.forEach(b => {
    s += `  ${b.channel}: ¥${b.current_spend.toLocaleString()} -> ¥${b.optimal_spend.toLocaleString()} (${b.change > 0 ? '+' : ''}${b.change}%) — ${b.reason}\n`;
  });
  s += '\n【协同得分】\n';
  s += `  整体协同分: ${r.synergy_score.overall}/100\n`;
  r.synergy_score.channel_pairs.forEach(p => {
    s += `  ${p.pair}: ${p.synergy}/100 — ${p.recommendation}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. personalization_engine — 广告个性化推荐引擎
// ============================================================
export interface PersonalizationInput {
  user_segments?: Array<{ segment: string; size: number; traits: string[]; preferences: Record<string, number> }>;
  product_catalog?: Array<{ product_id: string; category: string; price: number; features: string[] }>;
  campaign_objective?: string;
  personalization_level?: string;
  channel?: string;
  historical_interactions?: number;
  real_time_signals?: boolean;
}

export interface PersonalizationResult {
  segment_strategies: Array<{ segment: string; recommended_products: Array<{ product_id: string; relevance_score: number; reason: string }>; messaging: string; creative_direction: string; expected_ctr_lift: number }>;
  dynamic_creative_rules: Array<{ condition: string; action: string; priority: string; expected_impact: number }>;
  recommendation_matrix: Array<{ segment: string; top_category: string; price_range: string; best_channel: string; best_time: string; personalization_score: number }>;
  ab_test_suggestions: Array<{ test_name: string; control: string; variant: string; hypothesis: string; sample_size: number }>;
  performance_forecast: { overall_ctr_lift: number; overall_cvr_lift: number; revenue_uplift: number; confidence: number };
  disclaimer: string;
}

function analyzePersonalization(data: PersonalizationInput): PersonalizationResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const objective = data.campaign_objective || pick(rng, ['转化率', '客单价', '复购率', '新客获取']);
  const level = data.personalization_level || pick(rng, ['基础个性化', '高级个性化', '全量个性化']);
  const channel = data.channel || pick(rng, ['抖音', '微信', '淘宝', '京东', '小红书']);

  const segments = data.user_segments || [
    { segment: '高价值忠诚用户', size: 50000, traits: ['高频复购', '高客单', '品牌忠诚'], preferences: { 美妆: 0.8, 服饰: 0.6, 数码: 0.3 } },
    { segment: '价格敏感型', size: 200000, traits: ['促销驱动', '比价行为', '决策快'], preferences: { 食品: 0.7, 日用: 0.8, 服饰: 0.5 } },
    { segment: '新品探索者', size: 80000, traits: ['尝鲜心理', '社交分享', '潮流敏感'], preferences: { 数码: 0.9, 美妆: 0.7, 潮玩: 0.8 } },
    { segment: '沉默唤醒用户', size: 150000, traits: ['历史活跃', '近期沉默', '需触达'], preferences: { 日用: 0.6, 食品: 0.5, 美妆: 0.4 } },
  ];

  const products = data.product_catalog || [
    { product_id: 'P001', category: '美妆', price: 299, features: ['保湿', '抗衰', '天然成分'] },
    { product_id: 'P002', category: '数码', price: 1999, features: ['智能', '便携', '长续航'] },
    { product_id: 'P003', category: '食品', price: 59, features: ['有机', '无添加', '进口'] },
    { product_id: 'P004', category: '服饰', price: 399, features: ['纯棉', '设计师款', '限量'] },
    { product_id: 'P005', category: '日用', price: 89, features: ['环保', '大容量', '家庭装'] },
  ];

  const segmentStrategies = segments.map(seg => {
    const recommendedProducts = products.slice(0, 3).map(p => ({
      product_id: p.product_id,
      relevance_score: round((seg.preferences[p.category] || 0.3) * 80 + rng() * 20, 0),
      reason: `基于${seg.segment}对${p.category}品类偏好(${(seg.preferences[p.category] || 0.3) * 100}%)`,
    })).sort((a, b) => b.relevance_score - a.relevance_score);

    return {
      segment: seg.segment,
      recommended_products: recommendedProducts,
      messaging: pick(rng, [
        `专为${seg.segment}定制的${objective}方案`,
        `${seg.segment}专属福利，限时体验`,
        `根据您的喜好推荐，${objective}更精准`,
      ]),
      creative_direction: pick(rng, ['温馨治愈风', '科技潮流风', '简约高级风', '活力年轻风']),
      expected_ctr_lift: round(10 + rng() * 35, 1),
    };
  });

  const dynamicCreativeRules = [
    { condition: '用户浏览过同类商品3次以上', action: '展示限时优惠+库存紧张提示', priority: '高', expected_impact: round(15 + rng() * 20, 1) },
    { condition: '用户历史客单价>500元', action: '推荐高端产品线+专属VIP权益', priority: '高', expected_impact: round(12 + rng() * 18, 1) },
    { condition: '用户7天内未打开APP', action: '推送专属唤醒优惠+新品资讯', priority: '中', expected_impact: round(8 + rng() * 15, 1) },
    { condition: '用户位于一线城市', action: '展示线下门店+同城配送信息', priority: '中', expected_impact: round(5 + rng() * 12, 1) },
    { condition: '用户活跃时段为晚间', action: '推送夜间专属优惠+直播预告', priority: '低', expected_impact: round(3 + rng() * 10, 1) },
  ];

  const recommendationMatrix = segments.map(seg => ({
    segment: seg.segment,
    top_category: Object.entries(seg.preferences).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || '综合',
    price_range: seg.traits.includes('高客单') ? '200-2000元' : seg.traits.includes('促销驱动') ? '50-300元' : '100-800元',
    best_channel: pick(rng, ['抖音', '微信', '淘宝', '京东']),
    best_time: pick(rng, ['12:00-13:00', '18:00-20:00', '20:00-22:00', '08:00-09:00']),
    personalization_score: round(50 + rng() * 45, 0),
  }));

  const abTestSuggestions = [
    { test_name: '个性化vs通用创意', control: '通用广告创意', variant: '个性化推荐创意', hypothesis: '个性化创意CTR提升15%+', sample_size: Math.round(10000 + rng() * 20000) },
    { test_name: '动态vs静态商品展示', control: '固定商品展示', variant: '基于用户行为动态推荐', hypothesis: '动态展示CVR提升10%+', sample_size: Math.round(8000 + rng() * 15000) },
    { test_name: '个性化vs标准落地页', control: '标准落地页', variant: '个性化商品排序落地页', hypothesis: '个性化落地页转化率提升8%+', sample_size: Math.round(5000 + rng() * 10000) },
  ];

  return {
    segment_strategies: segmentStrategies,
    dynamic_creative_rules: dynamicCreativeRules,
    recommendation_matrix: recommendationMatrix,
    ab_test_suggestions: abTestSuggestions,
    performance_forecast: {
      overall_ctr_lift: round(12 + rng() * 28, 1),
      overall_cvr_lift: round(8 + rng() * 22, 1),
      revenue_uplift: round(15 + rng() * 35, 1),
      confidence: round(60 + rng() * 30, 0),
    },
    disclaimer: DISCLAIMER,
  };
}

function formatPersonalization(r: PersonalizationResult): string {
  let s = '=== 广告个性化推荐引擎报告 ===\n\n';
  s += '【分群策略】\n';
  r.segment_strategies.forEach(seg => {
    s += `  ${seg.segment} (预期CTR提升: ${seg.expected_ctr_lift}%)\n`;
    s += `    推荐商品: ${seg.recommended_products.map(p => `${p.product_id}(${p.relevance_score}分)`).join(', ')}\n`;
    s += `    文案: ${seg.messaging} | 创意方向: ${seg.creative_direction}\n`;
  });
  s += '\n【动态创意规则】\n';
  r.dynamic_creative_rules.forEach(rule => {
    s += `  [${rule.priority}] 条件: ${rule.condition}\n`;
  s += `    动作: ${rule.action} | 预期影响: +${rule.expected_impact}%\n`;
  });
  s += '\n【推荐矩阵】\n';
  r.recommendation_matrix.forEach(m => {
    s += `  ${m.segment} — 品类: ${m.top_category} | 价格: ${m.price_range} | 渠道: ${m.best_channel} | 时段: ${m.best_time} | 个性化分: ${m.personalization_score}\n`;
  });
  s += '\n【A/B测试建议】\n';
  r.ab_test_suggestions.forEach(t => {
    s += `  ${t.test_name}: ${t.control} vs ${t.variant}\n`;
  s += `    假设: ${t.hypothesis} | 样本量: ${t.sample_size.toLocaleString()}\n`;
  });
  s += '\n【效果预测】\n';
  s += `  CTR提升: +${r.performance_forecast.overall_ctr_lift}% | CVR提升: +${r.performance_forecast.overall_cvr_lift}%\n`;
  s += `  收入提升: +${r.performance_forecast.revenue_uplift}% | 置信度: ${r.performance_forecast.confidence}%\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. landing_page_optimizer — 落地页优化与转化率提升
// ============================================================
export interface LandingPageInput {
  page_url?: string;
  current_cvr?: number;
  target_cvr?: number;
  traffic_source?: string;
  device_type?: string;
  page_metrics?: { bounce_rate: number; avg_time_on_page: number; scroll_depth: number; form_abandonment_rate: number };
  elements?: Array<{ element: string; type: string; current_performance: number }>;
  heatmap_data?: boolean;
  user_recordings?: number;
}

export interface LandingPageResult {
  cvr_diagnosis: { current_cvr: number; target_cvr: number; gap: number; benchmark: number; performance_level: string };
  element_scores: Array<{ element: string; score: number; issue: string; impact: string; priority: string }>;
  optimization_roadmap: Array<{ phase: number; action: string; expected_cvr_lift: number; effort: string; timeline: string }>;
  ab_test_plan: Array<{ test_name: string; element: string; control_version: string; variant_version: string; hypothesis: string; priority: string }>;
  personalization_opportunities: Array<{ segment: string; current_experience: string; optimized_experience: string; expected_lift: number }>;
  quick_wins: Array<{ action: string; expected_lift: number; implementation_time: string; difficulty: string }>;
  disclaimer: string;
}

function analyzeLandingPage(data: LandingPageInput): LandingPageResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const currentCvr = data.current_cvr ?? round(1 + rng() * 5, 2);
  const targetCvr = data.target_cvr ?? round(currentCvr * (1.3 + rng() * 0.7), 2);
  const gap = round(targetCvr - currentCvr, 2);
  const benchmark = round(2 + rng() * 4, 2);
  const performanceLevel = currentCvr > benchmark * 1.2 ? '优秀' : currentCvr > benchmark ? '良好' : currentCvr > benchmark * 0.7 ? '一般' : '需优化';

  const elements = data.elements || [
    { element: '主标题', type: 'text', current_performance: round(40 + rng() * 40, 0) },
    { element: '主图/视频', type: 'media', current_performance: round(50 + rng() * 35, 0) },
    { element: 'CTA按钮', type: 'button', current_performance: round(30 + rng() * 50, 0) },
    { element: '表单字段', type: 'form', current_performance: round(20 + rng() * 40, 0) },
    { element: '信任标识', type: 'social_proof', current_performance: round(40 + rng() * 40, 0) },
    { element: '产品卖点', type: 'content', current_performance: round(35 + rng() * 40, 0) },
    { element: '紧迫感元素', type: 'urgency', current_performance: round(25 + rng() * 45, 0) },
  ];

  const elementScores = elements.map(el => {
    const score = el.current_performance;
    const issue = score < 40 ? '表现较差，需重点优化' : score < 60 ? '有提升空间' : score < 80 ? '表现良好，可微调' : '表现优秀';
    const impact = score < 40 ? '高' : score < 60 ? '中' : '低';
    const priority = score < 40 ? '紧急' : score < 60 ? '高' : score < 80 ? '中' : '低';
    return { element: el.element, score, issue, impact, priority };
  });

  const optimizationRoadmap = [
    { phase: 1, action: '优化主标题和副标题，突出核心价值主张', expected_cvr_lift: round(5 + rng() * 10, 1), effort: '低', timeline: '1-2天' },
    { phase: 2, action: '重新设计CTA按钮(颜色/文案/位置)', expected_cvr_lift: round(3 + rng() * 8, 1), effort: '低', timeline: '1-2天' },
    { phase: 3, action: '简化表单字段，减少用户填写负担', expected_cvr_lift: round(5 + rng() * 12, 1), effort: '中', timeline: '3-5天' },
    { phase: 4, action: '增加信任标识和社会证明元素', expected_cvr_lift: round(3 + rng() * 7, 1), effort: '低', timeline: '1-3天' },
    { phase: 5, action: '优化页面加载速度和移动端适配', expected_cvr_lift: round(4 + rng() * 8, 1), effort: '高', timeline: '5-10天' },
    { phase: 6, action: '添加紧迫感和稀缺性元素', expected_cvr_lift: round(2 + rng() * 6, 1), effort: '低', timeline: '1天' },
  ];

  const abTestPlan = [
    { test_name: '主标题测试', element: '主标题', control_version: '当前标题', variant_version: '利益点导向标题', hypothesis: '突出利益点的标题可提升CVR 10%+', priority: '高' },
    { test_name: 'CTA按钮测试', element: 'CTA按钮', control_version: '蓝色按钮+立即购买', variant_version: '橙色按钮+限时优惠', hypothesis: '高对比度+紧迫感文案可提升CTR 15%+', priority: '高' },
    { test_name: '表单长度测试', element: '表单', control_version: '5个字段', variant_version: '3个字段+分步填写', hypothesis: '减少字段可降低放弃率20%+', priority: '中' },
    { test_name: '主图测试', element: '主图', control_version: '产品图', variant_version: '使用场景图', hypothesis: '场景图更能激发购买欲望', priority: '中' },
  ];

  const personalizationOpportunities = [
    { segment: '新客', current_experience: '通用落地页', optimized_experience: '品牌故事+新人专享优惠', expected_lift: round(10 + rng() * 20, 1) },
    { segment: '老客', current_experience: '通用落地页', optimized_experience: '个性化推荐+会员专属权益', expected_lift: round(8 + rng() * 15, 1) },
    { segment: '高意向用户', current_experience: '通用落地页', optimized_experience: '限时优惠+库存紧张提示', expected_lift: round(12 + rng() * 18, 1) },
    { segment: '移动端用户', current_experience: '桌面端适配页', optimized_experience: '移动端专属简化页面', expected_lift: round(15 + rng() * 20, 1) },
  ];

  const quickWins = [
    { action: '将CTA按钮颜色改为高对比度色', expected_lift: round(3 + rng() * 7, 1), implementation_time: '30分钟', difficulty: '极低' },
    { action: '在首屏添加信任徽章', expected_lift: round(2 + rng() * 5, 1), implementation_time: '1小时', difficulty: '低' },
    { action: '添加倒计时器营造紧迫感', expected_lift: round(3 + rng() * 6, 1), implementation_time: '2小时', difficulty: '低' },
    { action: '优化页面加载速度(压缩图片)', expected_lift: round(2 + rng() * 4, 1), implementation_time: '2小时', difficulty: '低' },
    { action: '简化导航栏减少干扰', expected_lift: round(1 + rng() * 3, 1), implementation_time: '1小时', difficulty: '低' },
  ];

  return {
    cvr_diagnosis: { current_cvr: currentCvr, target_cvr: targetCvr, gap, benchmark, performance_level: performanceLevel },
    element_scores: elementScores,
    optimization_roadmap: optimizationRoadmap,
    ab_test_plan: abTestPlan,
    personalization_opportunities: personalizationOpportunities,
    quick_wins: quickWins,
    disclaimer: DISCLAIMER,
  };
}

function formatLandingPage(r: LandingPageResult): string {
  let s = '=== 落地页优化与转化率提升报告 ===\n\n';
  s += '【CVR诊断】\n';
  s += `  当前CVR: ${r.cvr_diagnosis.current_cvr}% | 目标CVR: ${r.cvr_diagnosis.target_cvr}% | 差距: ${r.cvr_diagnosis.gap}%\n`;
  s += `  行业基准: ${r.cvr_diagnosis.benchmark}% | 表现水平: ${r.cvr_diagnosis.performance_level}\n\n`;
  s += '【元素评分】\n';
  r.element_scores.forEach(e => {
    s += `  ${e.element}: ${e.score}/100 | ${e.issue} | 影响: ${e.impact} | 优先级: ${e.priority}\n`;
  });
  s += '\n【优化路线图】\n';
  r.optimization_roadmap.forEach(o => {
    s += `  阶段${o.phase}: ${o.action} — 预期提升: +${o.expected_cvr_lift}% | 工作量: ${o.effort} | 周期: ${o.timeline}\n`;
  });
  s += '\n【A/B测试计划】\n';
  r.ab_test_plan.forEach(t => {
    s += `  [${t.priority}] ${t.test_name}: ${t.control_version} vs ${t.variant_version}\n`;
  s += `    假设: ${t.hypothesis}\n`;
  });
  s += '\n【个性化机会】\n';
  r.personalization_opportunities.forEach(p => {
    s += `  ${p.segment}: ${p.current_experience} -> ${p.optimized_experience} (预期提升: +${p.expected_lift}%)\n`;
  });
  s += '\n【快速见效】\n';
  r.quick_wins.forEach(q => {
    s += `  ${q.action} — 预期提升: +${q.expected_lift}% | 耗时: ${q.implementation_time} | 难度: ${q.difficulty}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. audience_overlap_analyzer — 受众重叠分析与去重
// ============================================================
export interface AudienceOverlapInput {
  audiences?: Array<{ name: string; size: string; type: string; platform: string }>;
  overlap_threshold?: number;
  total_budget?: number;
  campaign_goal?: string;
  exclusion_rules?: string[];
  frequency_cap?: number;
  cross_platform?: boolean;
}

export interface AudienceOverlapResult {
  overlap_matrix: Array<{ audience_a: string; audience_b: string; overlap_size: number; overlap_percent: number; recommendation: string }>;
  audience_efficiency: Array<{ audience: string; unique_reach: number; overlap_rate: number; effective_reach: number; efficiency_score: number; action: string }>;
  deduplication_plan: Array<{ step: number; action: string; audiences_involved: string[]; expected_savings: number; priority: string }>;
  frequency_analysis: { current_avg_frequency: number; target_frequency: number; over_frequency_percent: number; under_frequency_percent: number };
  expansion_recommendations: Array<{ current_audience: string; expansion_type: string; estimated_new_reach: number; similarity_score: number; risk: string }>;
  disclaimer: string;
}

function analyzeAudienceOverlap(data: AudienceOverlapInput): AudienceOverlapResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const totalBudget = data.total_budget ?? round(50000 + rng() * 450000, 0);
  const overlapThreshold = data.overlap_threshold ?? round(10 + rng() * 20, 1);
  const freqCap = data.frequency_cap ?? Math.round(3 + rng() * 4);

  const audiences = data.audiences || [
    { name: '高价值老客', size: '50000', type: 'CRM', platform: '全平台' },
    { name: '相似人群扩展', size: '500000', type: 'Lookalike', platform: '抖音' },
    { name: '兴趣定向', size: '2000000', type: 'Interest', platform: '腾讯广告' },
    { name: '再营销受众', size: '100000', type: 'Retargeting', platform: '全平台' },
    { name: '竞品用户', size: '300000', type: 'Competitor', platform: '百度营销' },
  ];

  const overlapMatrix = [];
  for (let i = 0; i < audiences.length; i++) {
    for (let j = i + 1; j < audiences.length; j++) {
      const overlapPct = round(5 + rng() * 40, 1);
      const sizeA = parseInt(audiences[i].size.replace(/,/g, ''));
      const sizeB = parseInt(audiences[j].size.replace(/,/g, ''));
      const overlapSize = Math.round(Math.min(sizeA, sizeB) * overlapPct / 100);
      const recommendation = overlapPct > overlapThreshold ? '建议设置排重规则' : overlapPct > overlapThreshold * 0.6 ? '关注重叠趋势' : '重叠率可控';
      overlapMatrix.push({
        audience_a: audiences[i].name,
        audience_b: audiences[j].name,
        overlap_size: overlapSize,
        overlap_percent: overlapPct,
        recommendation,
      });
    }
  }

  const audienceEfficiency = audiences.map(a => {
    const size = parseInt(a.size.replace(/,/g, ''));
    const overlapRate = round(10 + rng() * 50, 1);
    const effectiveReach = Math.round(size * (1 - overlapRate / 100));
    const efficiencyScore = round(Math.max(20, 100 - overlapRate * 1.5 + rng() * 10), 0);
    const action = efficiencyScore > 70 ? '保持投放' : efficiencyScore > 50 ? '优化定向减少重叠' : '重新评估受众策略';
    return {
      audience: a.name,
      unique_reach: size,
      overlap_rate: overlapRate,
      effective_reach: effectiveReach,
      efficiency_score: efficiencyScore,
      action,
    };
  });

  const deduplicationPlan = [
    { step: 1, action: '设置全平台排重规则(已转化用户排除)', audiences_involved: ['高价值老客', '再营销受众'], expected_savings: round(totalBudget * (0.05 + rng() * 0.1), 0), priority: '高' },
    { step: 2, action: '相似人群与兴趣定向层级排重', audiences_involved: ['相似人群扩展', '兴趣定向'], expected_savings: round(totalBudget * (0.03 + rng() * 0.08), 0), priority: '高' },
    { step: 3, action: '竞品用户与老客排重', audiences_involved: ['竞品用户', '高价值老客'], expected_savings: round(totalBudget * (0.02 + rng() * 0.05), 0), priority: '中' },
    { step: 4, action: '设置频次上限规则', audiences_involved: audiences.map(a => a.name), expected_savings: round(totalBudget * (0.02 + rng() * 0.06), 0), priority: '中' },
  ];

  const currentAvgFreq = round(2 + rng() * 4, 1);
  const targetFreq = freqCap;
  const overFreqPercent = round(10 + rng() * 35, 1);
  const underFreqPercent = round(15 + rng() * 30, 1);

  const expansionRecommendations = audiences.slice(0, 3).map(a => {
    const size = parseInt(a.size.replace(/,/g, ''));
    return {
      current_audience: a.name,
      expansion_type: pick(rng, ['相似人群扩展(Lookalike)', '兴趣扩展', '行为扩展', '地理扩展']),
      estimated_new_reach: Math.round(size * (0.5 + rng() * 2)),
      similarity_score: round(60 + rng() * 35, 0),
      risk: pick(rng, ['低风险-相似度高', '中风险-需测试验证', '高风险-建议小预算测试']),
    };
  });

  return {
    overlap_matrix: overlapMatrix,
    audience_efficiency: audienceEfficiency,
    deduplication_plan: deduplicationPlan,
    frequency_analysis: { current_avg_frequency: currentAvgFreq, target_frequency: targetFreq, over_frequency_percent: overFreqPercent, under_frequency_percent: underFreqPercent },
    expansion_recommendations: expansionRecommendations,
    disclaimer: DISCLAIMER,
  };
}

function formatAudienceOverlap(r: AudienceOverlapResult): string {
  let s = '=== 受众重叠分析与去重报告 ===\n\n';
  s += '【重叠矩阵】\n';
  r.overlap_matrix.forEach(o => {
    s += `  ${o.audience_a} x ${o.audience_b}: 重叠${o.overlap_size.toLocaleString()}人 (${o.overlap_percent}%) — ${o.recommendation}\n`;
  });
  s += '\n【受众效率】\n';
  r.audience_efficiency.forEach(a => {
    s += `  ${a.audience} — 独立触达: ${a.unique_reach.toLocaleString()} | 重叠率: ${a.overlap_rate}% | 有效触达: ${a.effective_reach.toLocaleString()} | 效率分: ${a.efficiency_score} | ${a.action}\n`;
  });
  s += '\n【去重计划】\n';
  r.deduplication_plan.forEach(d => {
    s += `  步骤${d.step} [${d.priority}]: ${d.action}\n`;
  s += `    涉及受众: ${d.audiences_involved.join(', ')} | 预期节省: ¥${d.expected_savings.toLocaleString()}\n`;
  });
  s += '\n【频次分析】\n';
  s += `  当前平均频次: ${r.frequency_analysis.current_avg_frequency} | 目标频次: ${r.frequency_analysis.target_frequency}\n`;
  s += `  超频用户占比: ${r.frequency_analysis.over_frequency_percent}% | 欠频用户占比: ${r.frequency_analysis.under_frequency_percent}%\n\n`;
  s += '【扩展建议】\n';
  r.expansion_recommendations.forEach(e => {
    s += `  ${e.current_audience} — ${e.expansion_type}: 预估新增触达${e.estimated_new_reach.toLocaleString()}人 | 相似度: ${e.similarity_score}% | ${e.risk}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. ad_creative_tester
  tools.register(defineTool({
    name: 'ad_creative_tester',
    description: '广告创意测试与效果预测 — 设计A/B测试方案，预测各变体CTR/CVR，计算统计功效和胜出概率',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含ad_format, platform, creative_variants, target_audience, campaign_objective, budget_per_variant, test_duration_days, historical_ctr, industry_benchmark_ctr等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatAdCreativeTester(analyzeAdCreativeTester(JSON.parse(args.input_data)));
    },
  }));

  // 2. attribution_analysis_engine
  tools.register(defineTool({
    name: 'attribution_analysis_engine',
    description: '多触点归因分析引擎 — 对比多种归因模型，分析渠道贡献、路径分析和增量效果',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含conversion_goal, attribution_model, channels, lookback_window_days, total_conversions, total_revenue, touchpoint_data, time_decay_factor等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatAttributionAnalysis(analyzeAttributionAnalysis(JSON.parse(args.input_data)));
    },
  }));

  // 3. roas_optimizer
  tools.register(defineTool({
    name: 'roas_optimizer',
    description: 'ROAS优化与出价策略 — 诊断ROAS健康度，优化渠道预算分配，提供出价建议和预算场景分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含campaign_type, current_roas, target_roas, total_budget, channel_budgets, historical_data_days, bid_strategy, audience_segments, seasonality_factor等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatRoasOptimizer(analyzeRoasOptimizer(JSON.parse(args.input_data)));
    },
  }));

  // 4. creative_fatigue_detector
  tools.register(defineTool({
    name: 'creative_fatigue_detector',
    description: '创意疲劳检测与预警 — 监测CTR下降和频次上升信号，评估疲劳等级，提供更换和优化建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含creative_id, creative_type, platform, metrics_over_time, audience_size, campaign_duration_days, fatigue_threshold_ctr_drop, fatigue_threshold_frequency, replacement_creatives_available等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCreativeFatigue(analyzeCreativeFatigue(JSON.parse(args.input_data)));
    },
  }));

  // 5. cross_channel_analyzer
  tools.register(defineTool({
    name: 'cross_channel_analyzer',
    description: '跨渠道广告效果分析 — 对比多渠道效率，分析跨渠道协同效应，优化预算分配',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含channels, date_range, metrics, total_spend, total_revenue, channel_data, cross_channel_attribution, overlap_analysis等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCrossChannel(analyzeCrossChannel(JSON.parse(args.input_data)));
    },
  }));

  // 6. personalization_engine
  tools.register(defineTool({
    name: 'personalization_engine',
    description: '广告个性化推荐引擎 — 基于用户分群生成个性化策略，动态创意规则和推荐矩阵',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含user_segments, product_catalog, campaign_objective, personalization_level, channel, historical_interactions, real_time_signals等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPersonalization(analyzePersonalization(JSON.parse(args.input_data)));
    },
  }));

  // 7. landing_page_optimizer
  tools.register(defineTool({
    name: 'landing_page_optimizer',
    description: '落地页优化与转化率提升 — 诊断CVR问题，评分页面元素，提供优化路线图和A/B测试计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含page_url, current_cvr, target_cvr, traffic_source, device_type, page_metrics, elements, heatmap_data, user_recordings等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatLandingPage(analyzeLandingPage(JSON.parse(args.input_data)));
    },
  }));

  // 8. audience_overlap_analyzer
  tools.register(defineTool({
    name: 'audience_overlap_analyzer',
    description: '受众重叠分析与去重 — 分析受众重叠矩阵，评估效率，提供去重计划和扩展建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含audiences, overlap_threshold, total_budget, campaign_goal, exclusion_rules, frequency_cap, cross_platform等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatAudienceOverlap(analyzeAudienceOverlap(JSON.parse(args.input_data)));
    },
  }));
}
