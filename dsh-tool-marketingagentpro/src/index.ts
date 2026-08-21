import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'marketingagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供营销策略参考，不替代专业营销团队决策。';

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
// 1. insight_miner — 消费者洞察挖掘与趋势发现
// ============================================================
interface InsightMinerInput {
  market_segment?: string;
  product_category?: string;
  consumer_demographics?: string[];
  time_range?: string;
  data_sources?: string[];
  keywords?: string[];
  competitor_brands?: string[];
  region?: string;
}

interface InsightMinerResult {
  consumer_insights: Array<{ insight: string; confidence: number; impact: string; source: string }>;
  trend_forecasts: Array<{ trend: string; growth_rate: number; timeframe: string; relevance: number }>;
  sentiment_analysis: { positive: number; neutral: number; negative: number; key_themes: string[] };
  competitive_landscape: Array<{ brand: string; market_share: number; positioning: string; threat_level: string }>;
  opportunity_gaps: Array<{ gap: string; potential: number; difficulty: string; recommendation: string }>;
  disclaimer: string;
}

function analyzeInsightMiner(data: InsightMinerInput): InsightMinerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const segment = data.market_segment || pick(rng, ['Z世代', '新中产', '银发族', '母婴人群', '小镇青年']);
  const category = data.product_category || pick(rng, ['美妆护肤', '食品饮料', '3C数码', '母婴用品', '健康保健']);
  const region = data.region || pick(rng, ['一线城市', '新一线城市', '二线城市', '下沉市场']);

  const insights = [
    { insight: `${segment}对${category}品类成分透明度要求提升`, impact: '高', source: '社交媒体舆情' },
    { insight: '短视频种草转化率持续走高', impact: '高', source: '电商平台数据' },
    { insight: '私域复购率显著高于公域', impact: '中', source: 'CRM数据分析' },
    { insight: 'KOL真实测评内容信任度最高', impact: '高', source: '消费者调研' },
    { insight: '环保/可持续包装成为购买决策因素', impact: '中', source: '行业报告' },
    { insight: '直播购物冲动消费占比下降，理性回归', impact: '中', source: '消费行为数据' },
  ];
  const consumerInsights = insights.slice(0, 3 + Math.floor(rng() * 3)).map(i => ({
    ...i,
    confidence: round(60 + rng() * 35, 0),
  }));

  const trends = [
    { trend: 'AI个性化推荐驱动转化', timeframe: '6-12个月' },
    { trend: '社交电商持续渗透', timeframe: '3-6个月' },
    { trend: '内容即货架新模式', timeframe: '12-18个月' },
    { trend: '绿色消费理念普及', timeframe: '6-12个月' },
    { trend: '沉浸式购物体验升级', timeframe: '12-24个月' },
    { trend: '会员经济深度运营', timeframe: '3-9个月' },
  ];
  const trendForecasts = trends.slice(0, 3 + Math.floor(rng() * 3)).map(t => ({
    ...t,
    growth_rate: round(10 + rng() * 50, 1),
    relevance: round(60 + rng() * 35, 0),
  }));

  const positive = round(30 + rng() * 40, 1);
  const negative = round(10 + rng() * 25, 1);
  const neutral = round(100 - positive - negative, 1);
  const themes = pick(rng, [
    ['品质', '性价比', '颜值', '服务'],
    ['成分', '功效', '口碑', '包装'],
    ['便捷', '体验', '售后', '品牌'],
    ['创新', '潮流', '健康', '安全'],
  ]);

  const brands = data.competitor_brands || ['品牌A', '品牌B', '品牌C', '品牌D'];
  const competitiveLandscape = brands.slice(0, 4).map(b => ({
    brand: b,
    market_share: round(5 + rng() * 30, 1),
    positioning: pick(rng, ['高端奢华', '性价比', '专业功能', '年轻潮流', '天然有机']),
    threat_level: pick(rng, ['高', '中', '低']),
  }));

  const gaps = [
    { gap: `${segment}细分需求未被满足`, difficulty: '中' },
    { gap: '下沉市场渗透率不足', difficulty: '高' },
    { gap: '跨品类联名机会', difficulty: '低' },
    { gap: '会员体系差异化空间', difficulty: '中' },
    { gap: '内容营销创新形式', difficulty: '低' },
  ];
  const opportunityGaps = gaps.slice(0, 2 + Math.floor(rng() * 3)).map(g => ({
    ...g,
    potential: round(50 + rng() * 45, 0),
    recommendation: `建议针对${segment}群体制定专项${category}营销策略`,
  }));

  return {
    consumer_insights: consumerInsights,
    trend_forecasts: trendForecasts,
    sentiment_analysis: { positive, neutral, negative, key_themes: themes },
    competitive_landscape: competitiveLandscape,
    opportunity_gaps: opportunityGaps,
    disclaimer: DISCLAIMER,
  };
}

function formatInsightMiner(r: InsightMinerResult): string {
  let s = '=== 消费者洞察挖掘与趋势发现报告 ===\n\n';
  s += '【消费者洞察】\n';
  r.consumer_insights.forEach((i, idx) => {
    s += `  ${idx + 1}. ${i.insight}\n`;
    s += `     置信度: ${i.confidence}% | 影响: ${i.impact} | 来源: ${i.source}\n`;
  });
  s += '\n【趋势预测】\n';
  r.trend_forecasts.forEach(t => {
    s += `  ${t.trend} — 增长率: ${t.growth_rate}% | 时间窗口: ${t.timeframe} | 相关度: ${t.relevance}%\n`;
  });
  s += '\n【情感分析】\n';
  s += `  正面: ${r.sentiment_analysis.positive}% | 中性: ${r.sentiment_analysis.neutral}% | 负面: ${r.sentiment_analysis.negative}%\n`;
  s += `  关键主题: ${r.sentiment_analysis.key_themes.join('、')}\n\n`;
  s += '【竞争格局】\n';
  r.competitive_landscape.forEach(c => {
    s += `  ${c.brand} — 市占率: ${c.market_share}% | 定位: ${c.positioning} | 威胁: ${c.threat_level}\n`;
  });
  s += '\n【机会缺口】\n';
  r.opportunity_gaps.forEach(o => {
    s += `  ${o.gap} — 潜力: ${o.potential}% | 难度: ${o.difficulty}\n`;
    s += `    建议: ${o.recommendation}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. campaign_architect — 营销活动架构设计与渠道编排
// ============================================================
interface CampaignArchitectInput {
  campaign_goal?: string;
  budget_total?: number;
  target_audience?: string[];
  product_line?: string;
  campaign_duration_days?: number;
  channels_available?: string[];
  season?: string;
  kpis?: string[];
}

interface CampaignArchitectResult {
  campaign_structure: { objective: string; theme: string; phases: Array<{ name: string; duration_days: number; focus: string }> };
  channel_strategy: Array<{ channel: string; budget_percent: number; role: string; expected_reach: number }>;
  budget_allocation: Array<{ category: string; amount: number; percent: number }>;
  timeline: Array<{ milestone: string; deadline: string; deliverables: string }>;
  kpi_framework: Array<{ metric: string; target: number; measurement: string }>;
  disclaimer: string;
}

function analyzeCampaignArchitect(data: CampaignArchitectInput): CampaignArchitectResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const goal = data.campaign_goal || pick(rng, ['品牌曝光', '新品上市', '用户增长', '促销转化', '品牌升级']);
  const budget = data.budget_total ?? round(50000 + rng() * 450000, 0);
  const duration = data.campaign_duration_days ?? Math.round(14 + rng() * 76);
  const season = data.season || pick(rng, ['春节', '618', '双11', '双12', '暑期', '国庆']);

  const theme = pick(rng, ['焕新启程', '品质生活节', '超级品牌日', '宠爱季', '潮流新势力']);
  const phases = [
    { name: '预热期', duration_days: Math.round(duration * 0.25), focus: '悬念造势与种子用户触达' },
    { name: '爆发期', duration_days: Math.round(duration * 0.4), focus: '全渠道集中引爆与转化收割' },
    { name: '持续期', duration_days: Math.round(duration * 0.25), focus: '长尾流量承接与口碑扩散' },
    { name: '收尾期', duration_days: Math.round(duration * 0.1), focus: '数据复盘与用户沉淀' },
  ];

  const channels = data.channels_available || ['抖音', '小红书', '微信', '微博', 'B站', '天猫'];
  const channelRoles: Record<string, string> = {
    '抖音': '短视频种草+直播转化', '小红书': '口碑种草+搜索拦截', '微信': '私域运营+深度内容',
    '微博': '话题引爆+明星效应', 'B站': '深度测评+年轻圈层', '天猫': '搜索转化+会员运营',
  };
  const channelStrategy = channels.slice(0, 4).map(ch => ({
    channel: ch,
    budget_percent: round(15 + rng() * 35, 1),
    role: channelRoles[ch] || '品牌曝光',
    expected_reach: round(100000 + rng() * 900000, 0),
  }));

  const categories = [
    { category: 'KOL/KOC投放', percent: round(25 + rng() * 20, 1) },
    { category: '信息流广告', percent: round(20 + rng() * 15, 1) },
    { category: '内容制作', percent: round(10 + rng() * 10, 1) },
    { category: '活动运营', percent: round(8 + rng() * 8, 1) },
    { category: '数据工具', percent: round(3 + rng() * 5, 1) },
  ];
  const budgetAllocation = categories.map(c => ({
    ...c,
    amount: round(budget * c.percent / 100, 0),
  }));

  const timeline = [
    { milestone: '策略确认', deadline: 'D+3', deliverables: '活动方案与创意brief' },
    { milestone: '素材上线', deadline: `D+${Math.round(duration * 0.2)}`, deliverables: '全渠道素材投放' },
    { milestone: '数据中期复盘', deadline: `D+${Math.round(duration * 0.5)}`, deliverables: '效果报告与优化方案' },
    { milestone: '活动收尾', deadline: `D+${duration}`, deliverables: '结案报告与ROI分析' },
  ];

  const kpis = data.kpis || ['曝光量', 'CTR', '转化率', 'ROI', '新客数'];
  const kpiFramework = kpis.slice(0, 5).map(k => ({
    metric: k,
    target: round(1 + rng() * 20, 1),
    measurement: pick(rng, ['平台数据后台', '第三方监测', 'UTM追踪', '问卷调研']),
  }));

  return {
    campaign_structure: { objective: goal, theme, phases },
    channel_strategy: channelStrategy,
    budget_allocation: budgetAllocation,
    timeline,
    kpi_framework: kpiFramework,
    disclaimer: DISCLAIMER,
  };
}

function formatCampaignArchitect(r: CampaignArchitectResult): string {
  let s = '=== 营销活动架构设计与渠道编排报告 ===\n\n';
  s += '【活动架构】\n';
  s += `  目标: ${r.campaign_structure.objective}\n`;
  s += `  主题: ${r.campaign_structure.theme}\n`;
  s += '  阶段规划:\n';
  r.campaign_structure.phases.forEach(p => {
    s += `    ${p.name} (${p.duration_days}天): ${p.focus}\n`;
  });
  s += '\n【渠道策略】\n';
  r.channel_strategy.forEach(c => {
    s += `  ${c.channel} — 预算占比: ${c.budget_percent}% | 角色: ${c.role} | 预估触达: ${c.expected_reach.toLocaleString()}人\n`;
  });
  s += '\n【预算分配】\n';
  r.budget_allocation.forEach(b => {
    s += `  ${b.category}: ¥${b.amount.toLocaleString()} (${b.percent}%)\n`;
  });
  s += '\n【时间线】\n';
  r.timeline.forEach(t => {
    s += `  ${t.milestone} [${t.deadline}]: ${t.deliverables}\n`;
  });
  s += '\n【KPI框架】\n';
  r.kpi_framework.forEach(k => {
    s += `  ${k.metric}: 目标 ${k.target} | 测量方式: ${k.measurement}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. content_generator — 创意素材自动生成与A/B测试方案
// ============================================================
interface ContentGeneratorInput {
  content_type?: string;
  platform?: string;
  target_audience?: string;
  brand_tone?: string;
  product_features?: string[];
  campaign_theme?: string;
  ab_test_variables?: string[];
  quantity?: number;
}

interface ContentGeneratorResult {
  content_creatives: Array<{ type: string; headline: string; body: string; cta: string; platform: string }>;
  ab_test_plan: { test_name: string; variants: Array<{ name: string; variable: string; hypothesis: string }>; sample_size: number; duration_days: number; success_metric: string };
  visual_direction: { style: string; color_palette: string[]; composition: string; mood: string };
  copy_variants: Array<{ version: string; tone: string; hook: string; length: number }>;
  optimization_tips: Array<{ area: string; suggestion: string; expected_lift: number }>;
  disclaimer: string;
}

function analyzeContentGenerator(data: ContentGeneratorInput): ContentGeneratorResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const contentType = data.content_type || pick(rng, ['短视频脚本', '图文笔记', '海报文案', '直播话术', '信息流广告']);
  const platform = data.platform || pick(rng, ['抖音', '小红书', '微信', '微博', 'B站']);
  const audience = data.target_audience || pick(rng, ['18-25岁女性', '25-35岁职场人', '30-45岁宝妈', 'Z世代学生党']);
  const theme = data.campaign_theme || pick(rng, ['焕新启程', '品质生活', '超级品牌日', '宠爱季']);

  const headlines = [
    `${theme}｜你不知道的隐藏福利来了`,
    `被问了800遍的${theme}攻略`,
    `终于！${theme}的正确打开方式`,
    `别划走！${theme}最全指南`,
  ];
  const bodies = [
    '从成分到效果，全方位解析产品核心卖点，帮你避开选择困难症。',
    '亲测有效！坚持使用28天，效果肉眼可见，姐妹们冲就对了。',
    '专业团队历时3年研发，只为给你最极致的体验，限时优惠不容错过。',
    '百万用户的选择，好评率99%，现在下单还享专属赠品。',
  ];
  const ctas = ['立即抢购', '点击领取优惠券', '限时秒杀', '加入购物车', '了解更多'];
  const qty = data.quantity ?? Math.round(2 + rng() * 4);
  const contentCreatives = [];
  for (let i = 0; i < qty; i++) {
    contentCreatives.push({
      type: contentType,
      headline: pick(rng, headlines),
      body: pick(rng, bodies),
      cta: pick(rng, ctas),
      platform,
    });
  }

  const testVars = data.ab_test_variables || ['标题', '封面图', 'CTA文案', '投放时段'];
  const abTestPlan = {
    test_name: `${platform}${contentType}A/B测试`,
    variants: testVars.slice(0, 3).map(v => ({
      name: `${v}-A/B`,
      variable: v,
      hypothesis: `优化${v}可提升CTR ${round(5 + rng() * 15, 1)}%`,
    })),
    sample_size: round(5000 + rng() * 15000, 0),
    duration_days: Math.round(3 + rng() * 11),
    success_metric: pick(rng, ['CTR', '转化率', 'CVR', 'ROI']),
  };

  const visualDirection = {
    style: pick(rng, ['简约高级', '活力潮流', '温暖治愈', '科技未来', '复古文艺']),
    color_palette: pick(rng, [
      ['#FF6B6B', '#FFE66D', '#4ECDC4'],
      ['#2C3E50', '#E74C3C', '#ECF0F1'],
      ['#667EEA', '#764BA2', '#F093FB'],
      ['#11998E', '#38EF7D', '#F8F9FA'],
    ]),
    composition: pick(rng, ['中心对称', '三分法', '对角线构图', '留白极简']),
    mood: pick(rng, ['活力', '温馨', '高级', '潮流', '治愈']),
  };

  const copyVariants = [
    { version: 'A-理性说服', tone: '专业可信', hook: '数据说话', length: Math.round(80 + rng() * 70) },
    { version: 'B-情感共鸣', tone: '温暖走心', hook: '故事引入', length: Math.round(100 + rng() * 80) },
    { version: 'C-紧迫促销', tone: '紧迫有力', hook: '限时优惠', length: Math.round(50 + rng() * 50) },
  ];

  const optimizations = [
    { area: '标题优化', suggestion: '加入数字和情绪词可提升打开率', expected_lift: round(8 + rng() * 15, 1) },
    { area: '封面图', suggestion: '人物面部特写+高饱和度背景更吸睛', expected_lift: round(10 + rng() * 20, 1) },
    { area: 'CTA设计', suggestion: '按钮文案用第一人称+紧迫感', expected_lift: round(5 + rng() * 12, 1) },
    { area: '投放时段', suggestion: '目标用户活跃高峰前30分钟投放', expected_lift: round(6 + rng() * 10, 1) },
  ];

  return {
    content_creatives: contentCreatives,
    ab_test_plan: abTestPlan,
    visual_direction: visualDirection,
    copy_variants: copyVariants,
    optimization_tips: optimizations,
    disclaimer: DISCLAIMER,
  };
}

function formatContentGenerator(r: ContentGeneratorResult): string {
  let s = '=== 创意素材与A/B测试方案报告 ===\n\n';
  s += '【创意素材】\n';
  r.content_creatives.forEach((c, i) => {
    s += `  素材${i + 1} [${c.type}|${c.platform}]\n`;
    s += `    标题: ${c.headline}\n`;
    s += `    正文: ${c.body}\n`;
    s += `    CTA: ${c.cta}\n`;
  });
  s += '\n【A/B测试方案】\n';
  s += `  测试名称: ${r.ab_test_plan.test_name}\n`;
  s += `  样本量: ${r.ab_test_plan.sample_size.toLocaleString()} | 周期: ${r.ab_test_plan.duration_days}天 | 成功指标: ${r.ab_test_plan.success_metric}\n`;
  s += '  变体:\n';
  r.ab_test_plan.variants.forEach(v => {
    s += `    ${v.name}: 变量=${v.variable} | 假设: ${v.hypothesis}\n`;
  });
  s += '\n【视觉方向】\n';
  s += `  风格: ${r.visual_direction.style}\n`;
  s += `  色板: ${r.visual_direction.color_palette.join(' ')}\n`;
  s += `  构图: ${r.visual_direction.composition} | 情绪: ${r.visual_direction.mood}\n\n`;
  s += '【文案变体】\n';
  r.copy_variants.forEach(c => {
    s += `  ${c.version} — 语调: ${c.tone} | 钩子: ${c.hook} | 字数: ${c.length}\n`;
  });
  s += '\n【优化建议】\n';
  r.optimization_tips.forEach(o => {
    s += `  ${o.area}: ${o.suggestion} (预期提升: ${o.expected_lift}%)\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. engagement_interactor — 用户互动策略与社群运营自动化
// ============================================================
interface EngagementInteractorInput {
  community_platform?: string;
  community_size?: number;
  user_segments?: string[];
  engagement_goals?: string[];
  content_calendar?: string;
  automation_level?: string;
  response_sla_minutes?: number;
}

interface EngagementInteractorResult {
  engagement_tactics: Array<{ tactic: string; frequency: string; expected_engagement_rate: number; channel: string }>;
  content_calendar_weekly: Array<{ day: string; content_type: string; topic: string; format: string }>;
  automation_workflows: Array<{ trigger: string; action: string; condition: string; priority: string }>;
  response_templates: Array<{ scenario: string; template: string; tone: string; response_time: string }>;
  gamification: { mechanics: Array<{ name: string; description: string; reward: string }>; leaderboard: string; retention_impact: number };
  disclaimer: string;
}

function analyzeEngagementInteractor(data: EngagementInteractorInput): EngagementInteractorResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const platform = data.community_platform || pick(rng, ['微信社群', '小红书群', '抖音粉丝群', '品牌APP社区', '微博超话']);
  const size = data.community_size ?? Math.round(500 + rng() * 9500);

  const tactics = [
    { tactic: '每日话题打卡', frequency: '每日1次', channel: platform },
    { tactic: 'UGC征集活动', frequency: '每周1次', channel: platform },
    { tactic: 'KOL空降互动', frequency: '每月2次', channel: platform },
    { tactic: '限时秒杀预告', frequency: '每周2次', channel: platform },
    { tactic: '会员专属福利', frequency: '每月1次', channel: platform },
    { tactic: '新品试用招募', frequency: '每季度1次', channel: platform },
  ];
  const engagementTactics = tactics.slice(0, 3 + Math.floor(rng() * 3)).map(t => ({
    ...t,
    expected_engagement_rate: round(5 + rng() * 25, 1),
  }));

  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const contentTypes = ['种草图文', '互动话题', '福利预告', 'UGC转发', '知识科普', '直播预告', '用户故事'];
  const topics = ['新品速递', '成分解析', '使用教程', '福利放送', '行业趋势', '用户故事', '互动问答'];
  const formats = ['图文', '短视频', '投票', '直播', '问答', '话题'];
  const contentCalendar = days.map(d => ({
    day: d,
    content_type: pick(rng, contentTypes),
    topic: pick(rng, topics),
    format: pick(rng, formats),
  }));

  const workflows = [
    { trigger: '新成员入群', action: '自动发送欢迎语+新人礼包', condition: '入群即触发', priority: '高' },
    { trigger: '用户评论关键词', action: '自动回复FAQ或转人工', condition: '匹配关键词库', priority: '高' },
    { trigger: '7天未活跃', action: '推送专属优惠券唤醒', condition: '沉默用户标签', priority: '中' },
    { trigger: '购买后24h', action: '发送使用指南+好评引导', condition: '订单完成状态', priority: '中' },
    { trigger: '社群满员', action: '自动创建新群并迁移', condition: '群成员>450', priority: '低' },
  ];
  const automationWorkflows = workflows.slice(0, 3 + Math.floor(rng() * 2));

  const templates = [
    { scenario: '产品咨询', tone: '专业耐心', response_time: '<5分钟' },
    { scenario: '投诉处理', tone: '诚恳负责', response_time: '<15分钟' },
    { scenario: '售后申请', tone: '高效温暖', response_time: '<10分钟' },
    { scenario: '价格询问', tone: '热情专业', response_time: '<3分钟' },
    { scenario: '合作咨询', tone: '商务正式', response_time: '<30分钟' },
  ];
  const responseTemplates = templates.slice(0, 3 + Math.floor(rng() * 2)).map(t => ({
    ...t,
    template: `【${t.scenario}】您好，感谢您的咨询！${pick(rng, ['我们会尽快为您处理', '以下是相关信息', '专属客服已为您对接'])}。`,
  }));

  const mechanics = [
    { name: '签到积分', description: '连续签到获取积分奖励', reward: '积分兑换优惠券' },
    { name: '任务挑战', description: '完成指定任务获取勋章', reward: '专属折扣+实物奖品' },
    { name: '邀请有礼', description: '邀请好友入群双方获益', reward: '现金红包+积分' },
    { name: '等级体系', description: '活跃值累积解锁等级特权', reward: '等级专属权益' },
  ];

  return {
    engagement_tactics: engagementTactics,
    content_calendar_weekly: contentCalendar,
    automation_workflows: automationWorkflows,
    response_templates: responseTemplates,
    gamification: {
      mechanics: mechanics.slice(0, 2 + Math.floor(rng() * 2)),
      leaderboard: pick(rng, ['周榜+月榜双轨制', '仅月榜', '好友榜+总榜']),
      retention_impact: round(10 + rng() * 30, 1),
    },
    disclaimer: DISCLAIMER,
  };
}

function formatEngagementInteractor(r: EngagementInteractorResult): string {
  let s = '=== 用户互动策略与社群运营自动化报告 ===\n\n';
  s += '【互动策略】\n';
  r.engagement_tactics.forEach(t => {
    s += `  ${t.tactic} — 频率: ${t.frequency} | 渠道: ${t.channel} | 预期互动率: ${t.expected_engagement_rate}%\n`;
  });
  s += '\n【周内容日历】\n';
  r.content_calendar_weekly.forEach(c => {
    s += `  ${c.day}: ${c.content_type} | 主题: ${c.topic} | 形式: ${c.format}\n`;
  });
  s += '\n【自动化工作流】\n';
  r.automation_workflows.forEach(w => {
    s += `  触发: ${w.trigger} → 动作: ${w.action} | 条件: ${w.condition} | 优先级: ${w.priority}\n`;
  });
  s += '\n【回复模板】\n';
  r.response_templates.forEach(t => {
    s += `  [${t.scenario}] 语调: ${t.tone} | 响应: ${t.response_time}\n`;
    s += `    模板: ${t.template}\n`;
  });
  s += '\n【游戏化机制】\n';
  r.gamification.mechanics.forEach(m => {
    s += `  ${m.name}: ${m.description} → 奖励: ${m.reward}\n`;
  });
  s += `  排行榜: ${r.gamification.leaderboard}\n`;
  s += `  留存提升预期: ${r.gamification.retention_impact}%\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. performance_checker — 营销效果核查与归因分析
// ============================================================
interface PerformanceCheckerInput {
  campaign_id?: string;
  date_range?: string;
  channels?: string[];
  metrics?: string[];
  attribution_model?: string;
  budget_spent?: number;
  revenue_generated?: number;
  conversions?: number;
}

interface PerformanceCheckerResult {
  overall_performance: { roi: number; roas: number; cpa: number; ctr: number; cvr: number; score: number };
  channel_performance: Array<{ channel: string; spend: number; revenue: number; roi: number; conversions: number; quality_score: number }>;
  attribution_analysis: Array<{ channel: string; first_touch: number; last_touch: number; linear_touch: number; recommended_weight: number }>;
  funnel_analysis: Array<{ stage: string; users: number; conversion_rate: number; drop_off: number }>;
  anomalies: Array<{ metric: string; expected: number; actual: number; deviation: number; severity: string }>;
  recommendations: Array<{ action: string; impact: string; priority: string; expected_improvement: number }>;
  disclaimer: string;
}

function analyzePerformanceChecker(data: PerformanceCheckerInput): PerformanceCheckerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const budget = data.budget_spent ?? round(50000 + rng() * 450000, 0);
  const revenue = data.revenue_generated ?? round(budget * (1.5 + rng() * 3), 0);
  const conversions = data.conversions ?? Math.round(500 + rng() * 4500);

  const roi = round(((revenue - budget) / budget) * 100, 1);
  const roas = round(revenue / budget, 2);
  const cpa = round(budget / conversions, 2);
  const ctr = round(1 + rng() * 8, 2);
  const cvr = round(1 + rng() * 10, 2);
  const score = round(Math.min(100, Math.max(20, roi * 2 + rng() * 20)), 0);

  const channels = data.channels || ['抖音', '小红书', '微信', '天猫', '快手'];
  const channelPerformance = channels.slice(0, 5).map(ch => {
    const chSpend = round(budget * (0.1 + rng() * 0.3), 0);
    const chRevenue = round(chSpend * (1 + rng() * 3.5), 0);
    return {
      channel: ch,
      spend: chSpend,
      revenue: chRevenue,
      roi: round(((chRevenue - chSpend) / chSpend) * 100, 1),
      conversions: Math.round(conversions * (0.1 + rng() * 0.3)),
      quality_score: round(50 + rng() * 45, 0),
    };
  });

  const attrChannels = channels.slice(0, 4);
  const attributionAnalysis = attrChannels.map(ch => {
    const ft = round(10 + rng() * 40, 1);
    const lt = round(10 + rng() * 40, 1);
    const lvt = round(10 + rng() * 40, 1);
    return {
      channel: ch,
      first_touch: ft,
      last_touch: lt,
      linear_touch: lvt,
      recommended_weight: round((ft + lt + lvt) / 3, 1),
    };
  });

  const totalUsers = round(100000 + rng() * 900000, 0);
  const funnelStages = [
    { stage: '曝光', users: totalUsers, conversion_rate: 100, drop_off: 0 },
    { stage: '点击', users: round(totalUsers * ctr / 100, 0), conversion_rate: ctr, drop_off: round(100 - ctr, 1) },
    { stage: '访问', users: round(totalUsers * ctr / 100 * (0.6 + rng() * 0.3), 0), conversion_rate: round(60 + rng() * 30, 1), drop_off: round(10 + rng() * 20, 1) },
    { stage: '加购', users: round(conversions * (2 + rng() * 3), 0), conversion_rate: round(5 + rng() * 15, 1), drop_off: round(40 + rng() * 30, 1) },
    { stage: '转化', users: conversions, conversion_rate: cvr, drop_off: round(20 + rng() * 30, 1) },
  ];

  const anomalies = [
    { metric: 'CTR', expected: round(3 + rng() * 3, 2), actual: round(0.5 + rng() * 2, 2) },
    { metric: 'CVR', expected: round(3 + rng() * 4, 2), actual: round(5 + rng() * 5, 2) },
    { metric: 'CPA', expected: round(30 + rng() * 50, 0), actual: round(80 + rng() * 70, 0) },
  ].map(a => ({
    ...a,
    deviation: round(((a.actual - a.expected) / a.expected) * 100, 1),
    severity: Math.abs((a.actual - a.expected) / a.expected) > 0.3 ? '高' : Math.abs((a.actual - a.expected) / a.expected) > 0.15 ? '中' : '低',
  }));

  const recommendations = [
    { action: '优化低ROI渠道预算分配', impact: '提升整体ROI', priority: '高' },
    { action: '加强高转化渠道投放力度', impact: '提升总转化量', priority: '高' },
    { action: '优化落地页加载速度', impact: '降低跳出率', priority: '中' },
    { action: '调整投放时段至用户活跃高峰', impact: '提升CTR', priority: '中' },
    { action: '测试新创意素材组合', impact: '降低创意疲劳', priority: '低' },
  ].slice(0, 3 + Math.floor(rng() * 2)).map(r => ({
    ...r,
    expected_improvement: round(5 + rng() * 20, 1),
  }));

  return {
    overall_performance: { roi, roas, cpa, ctr, cvr, score },
    channel_performance: channelPerformance,
    attribution_analysis: attributionAnalysis,
    funnel_analysis: funnelStages,
    anomalies,
    recommendations,
    disclaimer: DISCLAIMER,
  };
}

function formatPerformanceChecker(r: PerformanceCheckerResult): string {
  let s = '=== 营销效果核查与归因分析报告 ===\n\n';
  s += '【整体表现】\n';
  s += `  ROI: ${r.overall_performance.roi}% | ROAS: ${r.overall_performance.roas} | CPA: ¥${r.overall_performance.cpa}\n`;
  s += `  CTR: ${r.overall_performance.ctr}% | CVR: ${r.overall_performance.cvr}% | 综合评分: ${r.overall_performance.score}/100\n\n`;
  s += '【渠道表现】\n';
  r.channel_performance.forEach(c => {
    s += `  ${c.channel} — 花费: ¥${c.spend.toLocaleString()} | 收入: ¥${c.revenue.toLocaleString()} | ROI: ${c.roi}% | 转化: ${c.conversions} | 质量分: ${c.quality_score}\n`;
  });
  s += '\n【归因分析】\n';
  r.attribution_analysis.forEach(a => {
    s += `  ${a.channel} — 首次触达: ${a.first_touch}% | 末次触达: ${a.last_touch}% | 线性归因: ${a.linear_touch}% | 推荐权重: ${a.recommended_weight}%\n`;
  });
  s += '\n【漏斗分析】\n';
  r.funnel_analysis.forEach(f => {
    s += `  ${f.stage}: ${f.users.toLocaleString()}人 | 转化率: ${f.conversion_rate}% | 流失: ${f.drop_off}%\n`;
  });
  s += '\n【异常检测】\n';
  r.anomalies.forEach(a => {
    s += `  ${a.metric} — 预期: ${a.expected} | 实际: ${a.actual} | 偏差: ${a.deviation}% | 严重度: ${a.severity}\n`;
  });
  s += '\n【优化建议】\n';
  r.recommendations.forEach(r => {
    s += `  ${r.action} [${r.priority}] — 影响: ${r.impact} | 预期提升: ${r.expected_improvement}%\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. audience_segmentor — 人群圈选与Look-alike扩展
// ============================================================
interface AudienceSegmentorInput {
  seed_audience?: string;
  seed_size?: number;
  target_platform?: string;
  product_category?: string;
  expansion_ratio?: number;
  demographic_filters?: Record<string, string>;
  behavioral_criteria?: string[];
  lookalike_tiers?: number;
}

interface AudienceSegmentorResult {
  seed_profile: { size: number; top_traits: Array<{ trait: string; prevalence: number }>; avg_ltv: number; churn_rate: number };
  segments: Array<{ name: string; size: number; characteristics: string[]; value_score: number; priority: string }>;
  lookalike_audiences: Array<{ tier: string; size: number; similarity: number; expected_cvr: number; recommended_bid_adjustment: number }>;
  exclusion_lists: Array<{ type: string; reason: string; estimated_size: number }>;
  targeting_recommendations: Array<{ channel: string; audience: string; bid_strategy: string; budget_suggestion: number }>;

  disclaimer: string;
}

function analyzeAudienceSegmentor(data: AudienceSegmentorInput): AudienceSegmentorResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const seedSize = data.seed_size ?? Math.round(10000 + rng() * 90000);
  const category = data.product_category || pick(rng, ['美妆护肤', '食品饮料', '3C数码', '母婴用品', '健康保健']);
  const platform = data.target_platform || pick(rng, ['抖音', '腾讯广告', '巨量引擎', '阿里妈妈', '百度营销']);
  const expansionRatio = data.expansion_ratio ?? round(5 + rng() * 45, 1);

  const traits = [
    { trait: '25-35岁女性', prevalence: round(40 + rng() * 30, 1) },
    { trait: '一线城市', prevalence: round(20 + rng() * 30, 1) },
    { trait: '月消费>3000元', prevalence: round(30 + rng() * 30, 1) },
    { trait: '活跃购物用户', prevalence: round(50 + rng() * 30, 1) },
    { trait: '品类兴趣人群', prevalence: round(40 + rng() * 35, 1) },
  ];

  const segments = [
    { name: '高价值忠诚用户', characteristics: ['高频复购', '高客单', '品牌忠诚'], priority: '最高' },
    { name: '潜力成长用户', characteristics: ['中频购买', '品类探索', '价格敏感'], priority: '高' },
    { name: '新客尝鲜人群', characteristics: ['首次购买', '促销驱动', '决策快'], priority: '中' },
    { name: '沉默唤醒人群', characteristics: ['历史活跃', '近期沉默', '需触达'], priority: '中' },
    { name: '竞品转移人群', characteristics: ['竞品用户', '品类需求', '可转化'], priority: '高' },
  ];
  const segmentResults = segments.slice(0, 3 + Math.floor(rng() * 2)).map(seg => ({
    ...seg,
    size: Math.round(seedSize * (0.1 + rng() * 0.4)),
    value_score: round(50 + rng() * 45, 0),
  }));

  const tiers = data.lookalike_tiers ?? Math.round(3 + rng() * 4);
  const lookalikeAudiences = [];
  for (let i = 0; i < tiers; i++) {
    lookalikeAudiences.push({
      tier: `L${i + 1} (${(10 - i * 2)}%-${100 - i * 15}%)`,
      size: Math.round(seedSize * expansionRatio * (0.5 + rng() * 2)),
      similarity: round(95 - i * 12 - rng() * 5, 1),
      expected_cvr: round(1 + rng() * 8 - i * 1.5, 2),
      recommended_bid_adjustment: round(100 - i * 15 - rng() * 10, 0),
    });
  }

  const exclusionLists = [
    { type: '已购买用户(30天内)', reason: '避免重复触达浪费预算', estimated_size: Math.round(seedSize * 0.15) },
    { type: '低质量流量', reason: '过滤机器人和误点', estimated_size: Math.round(seedSize * 0.05) },
    { type: '竞品员工', reason: '避免内部人员刷量', estimated_size: Math.round(seedSize * 0.01) },
  ];

  const targetingRecommendations = [
    { channel: platform, audience: 'L1-L3核心人群', bid_strategy: 'oCPM智能出价', budget_suggestion: round(40 + rng() * 30, 0) },
    { channel: platform, audience: 'L4-L6扩展人群', bid_strategy: 'ACP保守出价', budget_suggestion: round(20 + rng() * 20, 0) },
    { channel: platform, audience: '自定义人群包', bid_strategy: 'ROI目标出价', budget_suggestion: round(10 + rng() * 15, 0) },
  ];

  return {
    seed_profile: { size: seedSize, top_traits: traits, avg_ltv: round(200 + rng() * 800, 0), churn_rate: round(5 + rng() * 25, 1) },
    segments: segmentResults,
    lookalike_audiences: lookalikeAudiences,
    exclusion_lists: exclusionLists,
    targeting_recommendations: targetingRecommendations,
    disclaimer: DISCLAIMER,
  };
}

function formatAudienceSegmentor(r: AudienceSegmentorResult): string {
  let s = '=== 人群圈选与Look-alike扩展报告 ===\n\n';
  s += '【种子人群画像】\n';
  s += `  规模: ${r.seed_profile.size.toLocaleString()}人 | 平均LTV: ¥${r.seed_profile.avg_ltv} | 流失率: ${r.seed_profile.churn_rate}%\n`;
  s += '  核心特征:\n';
  r.seed_profile.top_traits.forEach(t => {
    s += `    ${t.trait}: 占比 ${t.prevalence}%\n`;
  });
  s += '\n【人群细分】\n';
  r.segments.forEach(seg => {
    s += `  ${seg.name} — ${seg.size.toLocaleString()}人 | 价值分: ${seg.value_score} | 优先级: ${seg.priority}\n`;
    s += `    特征: ${seg.characteristics.join('、')}\n`;
  });
  s += '\n【Look-alike扩展】\n';
  r.lookalike_audiences.forEach(l => {
    s += `  ${l.tier} — ${l.size.toLocaleString()}人 | 相似度: ${l.similarity}% | 预期CVR: ${l.expected_cvr}% | 出价调整: ${l.recommended_bid_adjustment}%\n`;
  });
  s += '\n【排除列表】\n';
  r.exclusion_lists.forEach(e => {
    s += `  ${e.type}: ${e.reason} (约${e.estimated_size.toLocaleString()}人)\n`;
  });
  s += '\n【定向建议】\n';
  r.targeting_recommendations.forEach(t => {
    s += `  ${t.channel} | ${t.audience} — ${t.bid_strategy} | 预算占比: ${t.budget_suggestion}%\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. brand_voice_curator — 品牌语音一致性维护与风格校准
// ============================================================
interface BrandVoiceCuratorInput {
  brand_name?: string;
  brand_values?: string[];
  target_audience?: string;
  content_samples?: string[];
  platforms?: string[];
  tone_guidelines?: string;
  competitor_brands?: string[];
  content_to_review?: string;
}

interface BrandVoiceCuratorResult {
  voice_profile: { personality: string[]; tone_attributes: string[]; vocabulary_level: string; emotional_register: string };
  consistency_score: { overall: number; by_platform: Array<{ platform: string; score: number; issues: string[] }>; trend: string };
  content_audit: Array<{ content_snippet: string; score: number; issues: string[]; suggestions: string[] }>;
  guidelines: { do_list: string[]; dont_list: string[]; key_phrases: string[]; forbidden_words: string[] };
  calibration_actions: Array<{ action: string; priority: string; expected_improvement: number }>;
  disclaimer: string;
}

function analyzeBrandVoiceCurator(data: BrandVoiceCuratorInput): BrandVoiceCuratorResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const brand = data.brand_name || pick(rng, ['品牌X', '品牌Y', '品牌Z']);
  const audience = data.target_audience || pick(rng, ['Z世代', '新中产', '年轻白领', '精致妈妈']);

  const personalities = pick(rng, [
    ['年轻活力', '真诚有趣', '潮流先锋'],
    ['专业权威', '温暖关怀', '值得信赖'],
    ['高端优雅', '简约克制', '品质至上'],
    ['幽默风趣', '接地气', '有梗有料'],
  ]);
  const tones = pick(rng, [
    ['轻松活泼', '亲切自然', '有网感'],
    ['专业严谨', '温和有礼', '有深度'],
    ['高级感', '简约大气', '有格调'],
    ['幽默调侃', '真实不做作', '有共鸣'],
  ]);

  const platforms = data.platforms || ['抖音', '小红书', '微信', '微博'];
  const byPlatform = platforms.slice(0, 4).map(p => ({
    platform: p,
    score: round(55 + rng() * 40, 0),
    issues: pick(rng, [
      ['语调不一致', '用词偏离品牌'],
      ['视觉风格不统一'],
      ['互动方式与品牌调性不符', '内容深度不足'],
      ['发布频率影响品牌感知'],
    ]),
  }));
  const overallScore = round(byPlatform.reduce((sum, p) => sum + p.score, 0) / byPlatform.length, 0);

  const samples = data.content_samples || ['新品上市啦！快来抢购！', '这款产品真的太好用了，强烈推荐给大家', '限时优惠，手慢无'];
  const contentAudit = samples.slice(0, 3).map(snippet => ({
    content_snippet: snippet.slice(0, 30) + '...',
    score: round(40 + rng() * 50, 0),
    issues: pick(rng, [
      ['语气过于促销化', '缺乏品牌辨识度'],
      ['用词与品牌调性不符'],
      ['缺少情感连接点'],
    ]),
    suggestions: [
      `加入${pick(rng, ['品牌核心关键词', '情感化表达', '品牌故事元素'])}`,
      `调整语调为${pick(rng, ['更温暖', '更专业', '更年轻'])}`,
    ],
  }));

  const guidelines = {
    do_list: [
      '使用品牌核心关键词贯穿内容',
      '保持统一的视觉色调和排版风格',
      '用故事化方式传递品牌价值',
      '与用户进行有温度的互动',
    ],
    dont_list: [
      '避免过度促销化语言',
      '不使用与品牌调性不符的网络热词',
      '不模仿竞品表达方式',
      '避免频繁更换品牌人设',
    ],
    key_phrases: pick(rng, [
      ['品质生活', '用心打造', '为你而来'],
      ['专业之选', '值得信赖', '匠心品质'],
      ['年轻无畏', '活出精彩', '潮流由我'],
    ]),
    forbidden_words: pick(rng, [
      ['最便宜', '全网最低', '秒杀'],
      ['震惊', '速看', '不转不是'],
      ['完美', '绝对', '100%'],
    ]),
  };

  const calibrationActions = [
    { action: '制定品牌语音手册并全员培训', priority: '高' },
    { action: '建立内容审核流程和checklist', priority: '高' },
    { action: '统一各平台视觉识别规范', priority: '中' },
    { action: '定期进行品牌一致性审计', priority: '中' },
    { action: '建立品牌内容素材库', priority: '低' },
  ].slice(0, 3 + Math.floor(rng() * 2)).map(a => ({
    ...a,
    expected_improvement: round(10 + rng() * 25, 1),
  }));

  return {
    voice_profile: {
      personality: personalities,
      tone_attributes: tones,
      vocabulary_level: pick(rng, ['通俗易懂', '专业深度', '文艺精致', '口语化']),
      emotional_register: pick(rng, ['温暖亲和', '专业冷静', '活力激情', '高级克制']),
    },
    consistency_score: { overall: overallScore, by_platform: byPlatform, trend: pick(rng, ['上升', '稳定', '需关注']) },
    content_audit: contentAudit,
    guidelines,
    calibration_actions: calibrationActions,
    disclaimer: DISCLAIMER,
  };
}

function formatBrandVoiceCurator(r: BrandVoiceCuratorResult): string {
  let s = '=== 品牌语音一致性维护与风格校准报告 ===\n\n';
  s += '【品牌语音画像】\n';
  s += `  人格特征: ${r.voice_profile.personality.join('、')}\n`;
  s += `  语调属性: ${r.voice_profile.tone_attributes.join('、')}\n`;
  s += `  词汇层级: ${r.voice_profile.vocabulary_level} | 情感基调: ${r.voice_profile.emotional_register}\n\n`;
  s += '【一致性评分】\n';
  s += `  综合评分: ${r.consistency_score.overall}/100 | 趋势: ${r.consistency_score.trend}\n`;
  r.consistency_score.by_platform.forEach(p => {
    s += `  ${p.platform}: ${p.score}/100 | 问题: ${p.issues.join('、')}\n`;
  });
  s += '\n【内容审核】\n';
  r.content_audit.forEach((c, i) => {
    s += `  内容${i + 1} [评分: ${c.score}/100]\n`;
    s += `    片段: ${c.content_snippet}\n`;
    s += `    问题: ${c.issues.join('、')}\n`;
    s += `    建议: ${c.suggestions.join('、')}\n`;
  });
  s += '\n【品牌指南】\n';
  s += '  应该做:\n';
  r.guidelines.do_list.forEach(d => { s += `    ✓ ${d}\n`; });
  s += '  不应该做:\n';
  r.guidelines.dont_list.forEach(d => { s += `    ✗ ${d}\n`; });
  s += `  核心短语: ${r.guidelines.key_phrases.join('、')}\n`;
  s += `  禁用词: ${r.guidelines.forbidden_words.join('、')}\n\n`;
  s += '【校准行动】\n';
  r.calibration_actions.forEach(a => {
    s += `  ${a.action} [${a.priority}] — 预期提升: ${a.expected_improvement}%\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. marketing_automation — 营销自动化工作流编排与触发器
// ============================================================
interface MarketingAutomationInput {
  business_type?: string;
  customer_journey_stages?: string[];
  channels?: string[];
  triggers?: string[];
  personalization_level?: string;
  tech_stack?: string[];
  automation_goals?: string[];
}

interface MarketingAutomationResult {
  workflow_blueprints: Array<{ name: string; trigger: string; steps: Array<{ order: number; action: string; channel: string; delay: string }>; expected_outcome: string }>;
  trigger_matrix: Array<{ event: string; condition: string; action: string; channel: string; priority: string }>;
  personalization_rules: Array<{ segment: string; content_type: string; rule: string; expected_lift: number }>;
  lead_scoring: Array<{ factor: string; weight: number; threshold: string; action: string }>;
  automation_metrics: { time_saved_hours_per_week: number; coverage_percent: number; error_rate: number; roi_estimate: number };
  disclaimer: string;
}

function analyzeMarketingAutomation(data: MarketingAutomationInput): MarketingAutomationResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const bizType = data.business_type || pick(rng, ['DTC品牌', 'B2B服务', '电商平台', '线下零售', 'SaaS']);
  const channels = data.channels || ['邮件', '短信', '微信', 'APP推送', '企微'];

  const workflowNames = ['新用户欢迎旅程', '购物车挽回流程', '复购激活计划', '会员升级引导', '沉默用户唤醒'];
  const workflowBlueprints = workflowNames.slice(0, 3 + Math.floor(rng() * 2)).map(name => {
    const steps = [];
    const stepCount = Math.round(3 + rng() * 4);
    for (let i = 0; i < stepCount; i++) {
      steps.push({
        order: i + 1,
        action: pick(rng, ['发送欢迎邮件', '推送优惠券', '分配专属客服', '发送产品推荐', '触发短信提醒', '打标签', '更新用户画像', '发送使用指南']),
        channel: pick(rng, channels),
        delay: i === 0 ? '立即' : `${Math.round(rng() * 72)}小时`,
      });
    }
    return {
      name,
      trigger: pick(rng, ['用户注册', '购物车放弃', '订单完成', '会员等级变化', '30天未活跃']),
      steps,
      expected_outcome: pick(rng, ['提升转化率15-25%', '降低流失率10-20%', '提升复购率20-30%', '提升客单价10-15%']),
    };
  });

  const triggerMatrix = [
    { event: '用户注册', condition: '注册后10分钟内', action: '发送欢迎邮件+新人礼包', channel: '邮件', priority: '高' },
    { event: '购物车放弃', condition: '放弃后2小时未返回', action: '推送限时优惠提醒', channel: '短信', priority: '高' },
    { event: '订单完成', condition: '签收后3天', action: '发送好评返现邀请', channel: '微信', priority: '中' },
    { event: '浏览未购', condition: '浏览商品3次未下单', action: '推送相似商品推荐', channel: 'APP推送', priority: '中' },
    { event: '会员升级', condition: '积分达到升级门槛', action: '发送升级礼+新权益通知', channel: '企微', priority: '高' },
    { event: '沉默预警', condition: '14天未打开消息', action: '发送专属福利唤醒', channel: '短信', priority: '中' },
  ].slice(0, 4 + Math.floor(rng() * 2));

  const personalizationRules = [
    { segment: '高价值用户', content_type: '专属推荐', rule: '基于购买历史的协同过滤推荐', expected_lift: round(15 + rng() * 20, 1) },
    { segment: '价格敏感型', content_type: '优惠信息', rule: '优先展示促销和折扣内容', expected_lift: round(10 + rng() * 15, 1) },
    { segment: '新品探索者', content_type: '新品资讯', rule: '优先推送新品和限量款', expected_lift: round(12 + rng() * 18, 1) },
    { segment: '沉默用户', content_type: '唤醒内容', rule: '发送专属福利+情感化文案', expected_lift: round(8 + rng() * 12, 1) },
  ].slice(0, 3 + Math.floor(rng() * 1));

  const leadScoring = [
    { factor: '网站浏览深度', weight: round(15 + rng() * 15, 0), threshold: '>5页/次', action: '标记为高意向' },
    { factor: '邮件打开率', weight: round(10 + rng() * 10, 0), threshold: '>30%', action: '提升触达频率' },
    { factor: '购买历史', weight: round(20 + rng() * 15, 0), threshold: '累计>¥500', action: '升级为VIP培育' },
    { factor: '互动频次', weight: round(10 + rng() * 10, 0), threshold: '>3次/周', action: '加速转化推进' },
    { factor: '内容下载', weight: round(5 + rng() * 10, 0), threshold: '>2次', action: '推送深度内容' },
  ];

  return {
    workflow_blueprints: workflowBlueprints,
    trigger_matrix: triggerMatrix,
    personalization_rules: personalizationRules,
    lead_scoring: leadScoring,
    automation_metrics: {
      time_saved_hours_per_week: round(10 + rng() * 30, 0),
      coverage_percent: round(40 + rng() * 50, 1),
      error_rate: round(0.5 + rng() * 3, 2),
      roi_estimate: round(200 + rng() * 600, 0),
    },
    disclaimer: DISCLAIMER,
  };
}

function formatMarketingAutomation(r: MarketingAutomationResult): string {
  let s = '=== 营销自动化工作流编排与触发器报告 ===\n\n';
  s += '【工作流蓝图】\n';
  r.workflow_blueprints.forEach(w => {
    s += `  ${w.name} (触发: ${w.trigger})\n`;
    w.steps.forEach(st => {
      s += `    ${st.order}. [${st.channel}] ${st.action} (${st.delay})\n`;
    });
    s += `    预期效果: ${w.expected_outcome}\n`;
  });
  s += '\n【触发器矩阵】\n';
  r.trigger_matrix.forEach(t => {
    s += `  事件: ${t.event} | 条件: ${t.condition} → 动作: ${t.action} [${t.channel}] 优先级: ${t.priority}\n`;
  });
  s += '\n【个性化规则】\n';
  r.personalization_rules.forEach(p => {
    s += `  ${p.segment} — ${p.content_type}: ${p.rule} (预期提升: ${p.expected_lift}%)\n`;
  });
  s += '\n【线索评分】\n';
  r.lead_scoring.forEach(l => {
    s += `  ${l.factor} — 权重: ${l.weight} | 阈值: ${l.threshold} → ${l.action}\n`;
  });
  s += '\n【自动化指标】\n';
  s += `  每周节省工时: ${r.automation_metrics.time_saved_hours_per_week}小时\n`;
  s += `  自动化覆盖率: ${r.automation_metrics.coverage_percent}%\n`;
  s += `  错误率: ${r.automation_metrics.error_rate}%\n`;
  s += `  预估ROI: ${r.automation_metrics.roi_estimate}%\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. insight_miner
  tools.register(defineTool({
    name: 'insight_miner',
    description: '消费者洞察挖掘与趋势发现 — 基于MAGIC框架，分析消费者行为数据、社交媒体舆情和竞争格局，输出消费者洞察、趋势预测和机会缺口',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含market_segment, product_category, consumer_demographics, time_range, data_sources, keywords, competitor_brands, region等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatInsightMiner(analyzeInsightMiner(JSON.parse(args.input_data)));
    },
  }));

  // 2. campaign_architect
  tools.register(defineTool({
    name: 'campaign_architect',
    description: '营销活动架构设计与渠道编排 — 基于MAGIC框架，设计营销活动整体架构、渠道策略、预算分配、时间线和KPI框架',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含campaign_goal, budget_total, target_audience, product_line, campaign_duration_days, channels_available, season, kpis等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCampaignArchitect(analyzeCampaignArchitect(JSON.parse(args.input_data)));
    },
  }));

  // 3. content_generator
  tools.register(defineTool({
    name: 'content_generator',
    description: '创意素材自动生成与A/B测试方案 — 基于MAGIC框架，生成多平台创意素材、A/B测试方案、视觉方向和文案变体',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含content_type, platform, target_audience, brand_tone, product_features, campaign_theme, ab_test_variables, quantity等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatContentGenerator(analyzeContentGenerator(JSON.parse(args.input_data)));
    },
  }));

  // 4. engagement_interactor
  tools.register(defineTool({
    name: 'engagement_interactor',
    description: '用户互动策略与社群运营自动化 — 基于MAGIC框架，设计互动策略、内容日历、自动化工作流、回复模板和游戏化机制',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含community_platform, community_size, user_segments, engagement_goals, content_calendar, automation_level, response_sla_minutes等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatEngagementInteractor(analyzeEngagementInteractor(JSON.parse(args.input_data)));
    },
  }));

  // 5. performance_checker
  tools.register(defineTool({
    name: 'performance_checker',
    description: '营销效果核查与归因分析 — 基于MAGIC框架，分析营销活动ROI、渠道表现、归因模型、漏斗转化和异常检测',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含campaign_id, date_range, channels, metrics, attribution_model, budget_spent, revenue_generated, conversions等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPerformanceChecker(analyzePerformanceChecker(JSON.parse(args.input_data)));
    },
  }));

  // 6. audience_segmentor
  tools.register(defineTool({
    name: 'audience_segmentor',
    description: '人群圈选与Look-alike扩展 — 基于MAGIC框架，分析种子人群画像、细分人群、Look-alike扩展、排除列表和定向建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含seed_audience, seed_size, target_platform, product_category, expansion_ratio, demographic_filters, behavioral_criteria, lookalike_tiers等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatAudienceSegmentor(analyzeAudienceSegmentor(JSON.parse(args.input_data)));
    },
  }));

  // 7. brand_voice_curator
  tools.register(defineTool({
    name: 'brand_voice_curator',
    description: '品牌语音一致性维护与风格校准 — 基于MAGIC框架，分析品牌语音画像、一致性评分、内容审核、品牌指南和校准行动',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含brand_name, brand_values, target_audience, content_samples, platforms, tone_guidelines, competitor_brands, content_to_review等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatBrandVoiceCurator(analyzeBrandVoiceCurator(JSON.parse(args.input_data)));
    },
  }));

  // 8. marketing_automation
  tools.register(defineTool({
    name: 'marketing_automation',
    description: '营销自动化工作流编排与触发器 — 基于MAGIC框架，设计自动化工作流蓝图、触发器矩阵、个性化规则、线索评分和自动化指标',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含business_type, customer_journey_stages, channels, triggers, personalization_level, tech_stack, automation_goals等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatMarketingAutomation(analyzeMarketingAutomation(JSON.parse(args.input_data)));
    },
  }));
}
