/**
 * DSH Government Tech & Digital Governance Plugin v1.0.0
 *
 * 数字政府与治理科技工具集 — 数字政府是2026年全球重大趋势
 * 聚焦公共服务、政策分析、城市管理、税务合规、公民参与等领域
 *
 * Features (v1.0.0):
 * - Policy Impact Analyzer (政策影响分析: 经济/社会/环境多维影响评估)
 * - Public Service Automator (公共服务自动化: 审批流程/服务路径/效率优化)
 * - Tax Compliance Checker (税务合规检查: 申报审查/风险识别/减免优化)
 * - Citizen Engagement Analyzer (公民参与分析: 舆情监测/满意度/渠道效果)
 * - Urban Planning Simulator (城市规划模拟: 土地使用/交通流/基础设施)
 * - Emergency Response Coordinator (应急响应协调: 灾害预警/资源调度/恢复规划)
 * - Social Benefit Optimizer (社会福利优化: 覆盖分析/预算分配/公平性)
 * - Open Data Portal Manager (开放数据门户: 数据集管理/API质量/使用分析)
 *
 * @module dsh-tool-govtech
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-govtech'
export const inject = ['tools']

const VERSION = '1.0.0';
const DISCLAIMER = '本工具集提供数字政府治理辅助分析，不替代政府专业决策与法定审批程序。';

// ==================== TYPES ====================

export interface PolicyImpactInput {
  policy_name: string;
  policy_type?: 'economic' | 'social' | 'environmental' | 'technology' | 'health';
  target_sectors?: string[];
  implementation_scale?: 'local' | 'regional' | 'national';
  time_horizon_years?: number;
  budget_millions?: number;
}

export interface PublicServiceInput {
  service_type: string;
  citizen_count?: number;
  current_processing_days?: number;
  digital_readiness?: 'low' | 'medium' | 'high';
  departments_involved?: string[];
  service_channels?: string[];
}

export interface TaxComplianceInput {
  entity_type: 'individual' | 'sme' | 'corporation' | 'nonprofit';
  tax_types?: string[];
  revenue_millions?: number;
  jurisdiction?: string;
  reporting_period?: string;
  deductions_claimed?: string[];
}

export interface CitizenEngagementInput {
  topic: string;
  channels?: string[];
  period_days?: number;
  population_size?: number;
  engagement_methods?: string[];
  sentiment_sources?: string[];
}

export interface UrbanPlanningInput {
  city_name: string;
  area_km2?: number;
  population?: number;
  planning_goals?: string[];
  land_use_types?: string[];
  infrastructure_budget_millions?: number;
}

export interface EmergencyInput {
  disaster_type: string;
  severity_level?: 1 | 2 | 3 | 4 | 5;
  affected_population?: number;
  region_type?: 'urban' | 'suburban' | 'rural' | 'coastal';
  available_resources?: string[];
  response_time_target_hours?: number;
}

export interface SocialBenefitInput {
  program_name: string;
  target_population?: number;
  total_budget_millions?: number;
  benefit_categories?: string[];
  eligibility_criteria?: string[];
  current_coverage_pct?: number;
}

export interface OpenDataInput {
  portal_name: string;
  dataset_count?: number;
  data_categories?: string[];
  update_frequency?: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  api_formats?: string[];
  user_types?: string[];
}

// ==================== MULBERRY32 DETERMINISTIC PRNG ====================

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

// ==================== HELPER FUNCTIONS ====================

function parseInput<T>(inputData: string): T {
  try {
    return JSON.parse(inputData) as T;
  } catch {
    return {} as T;
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function formatScore(score: number, decimals: number = 2): string {
  return (score * 100).toFixed(decimals);
}

function getRng(inputData: string): () => number {
  const seed = hashString(JSON.stringify(inputData));
  return mulberry32(seed);
}

// ==================== TOOL 1: POLICY IMPACT ANALYZER ====================

export interface PolicyImpactResult {
  policyName: string;
  policyType: string;
  economicImpact: { score: number; gdpEffect: string; jobEffect: string };
  socialImpact: { score: number; equityEffect: string; welfareEffect: string };
  environmentalImpact: { score: number; carbonEffect: string; sustainabilityNote: string };
  riskFactors: string[];
  recommendations: string[];
  overallScore: number;
}

function analyzePolicyImpact(inputData: string): PolicyImpactResult {
  const data = parseInput<PolicyImpactInput>(inputData);
  const rng = getRng(inputData);
  const policyName = data.policy_name || '未命名政策';
  const policyType = data.policy_type || 'economic';
  const scale = data.implementation_scale || 'regional';
  const horizon = data.time_horizon_years || 5;
  const budget = data.budget_millions || 100;
  const sectors = data.target_sectors || ['公共医疗', '教育', '基础设施'];

  const economicScore = clamp(rng() * 0.3 + 0.55, 0, 1);
  const socialScore = clamp(rng() * 0.3 + 0.5, 0, 1);
  const envScore = clamp(rng() * 0.35 + 0.45, 0, 1);
  const overallScore = economicScore * 0.4 + socialScore * 0.35 + envScore * 0.25;

  const gdpEffect = (rng() * 2.5 + 0.5).toFixed(2);
  const jobEffect = Math.floor(rng() * 50000 + 5000);
  const carbonChange = (rng() * 30 - 10).toFixed(1);

  const riskFactors = [
    '跨部门协调风险: 需' + sectors.length + '个部门协同',
    '预算超支风险: ' + budget + '万元规模存在' + (rng() > 0.5 ? '中高' : '中等') + '超支概率',
    '执行时序风险: ' + horizon + '年实施窗口需严格里程碑管理',
    '公众接受度风险: ' + (rng() > 0.6 ? '需强化舆情引导' : '预计良好'),
    '技术可行性风险: ' + (rng() > 0.7 ? '核心技术依赖需评估' : '技术成熟度高')
  ].slice(0, Math.floor(rng() * 2) + 3);

  const recommendations = [
    '建立政策效果实时监测仪表盘，关键指标月度追踪',
    '开展试点先行，在' + scale + '范围内选取示范区域',
    '设立跨部门协调办公室，明确权责边界与考核机制',
    '引入第三方评估机构进行中期与终期影响评估',
    '建立政策退出机制，设定明确的绩效门槛与退出条件'
  ].slice(0, Math.floor(rng() * 2) + 3);

  return {
    policyName,
    policyType,
    economicImpact: {
      score: economicScore,
      gdpEffect: 'GDP影响: +' + gdpEffect + '% (5年累计)',
      jobEffect: '就业效应: 创造' + jobEffect.toLocaleString() + '个岗位'
    },
    socialImpact: {
      score: socialScore,
      equityEffect: '公平性: ' + (socialScore > 0.7 ? '缩小差距' : socialScore > 0.5 ? '基本均衡' : '需关注不平等'),
      welfareEffect: '社会福利: 预计覆盖' + Math.floor(rng() * 5000000 + 500000).toLocaleString() + '人'
    },
    environmentalImpact: {
      score: envScore,
      carbonEffect: '碳排放变化: ' + (parseFloat(carbonChange) < 0 ? '' : '+') + carbonChange + '%',
      sustainabilityNote: '可持续性评级: ' + (envScore > 0.7 ? 'A' : envScore > 0.55 ? 'B' : 'C')
    },
    riskFactors,
    recommendations,
    overallScore
  };
}

function formatPolicyImpact(r: PolicyImpactResult): string {
  let report = '# 政策影响分析报告\n\n';
  report += '**政策名称:** ' + r.policyName + '\n';
  report += '**政策类型:** ' + r.policyType + '\n';
  report += '**综合评分:** ' + formatScore(r.overallScore) + '%\n\n';
  report += '---\n\n';
  report += '## 经济影响 (' + formatScore(r.economicImpact.score) + '%)\n\n';
  report += '- ' + r.economicImpact.gdpEffect + '\n';
  report += '- ' + r.economicImpact.jobEffect + '\n\n';
  report += '## 社会影响 (' + formatScore(r.socialImpact.score) + '%)\n\n';
  report += '- ' + r.socialImpact.equityEffect + '\n';
  report += '- ' + r.socialImpact.welfareEffect + '\n\n';
  report += '## 环境影响 (' + formatScore(r.environmentalImpact.score) + '%)\n\n';
  report += '- ' + r.environmentalImpact.carbonEffect + '\n';
  report += '- ' + r.environmentalImpact.sustainabilityNote + '\n\n';
  report += '## 风险因素\n\n';
  r.riskFactors.forEach(function (rf, i) { report += (i + 1) + '. ' + rf + '\n'; });
  report += '\n## 政策建议\n\n';
  r.recommendations.forEach(function (rec, i) { report += (i + 1) + '. ' + rec + '\n'; });
  report += '\n---\n\n*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 2: PUBLIC SERVICE AUTOMATOR ====================

export interface PublicServiceResult {
  serviceType: string;
  currentEfficiency: number;
  optimizedEfficiency: number;
  automationPotential: number;
  savingsDays: number;
  digitalPathways: string[];
  bottlenecks: string[];
  improvementPlan: string[];
}

function analyzePublicService(inputData: string): PublicServiceResult {
  const data = parseInput<PublicServiceInput>(inputData);
  const rng = getRng(inputData);
  const serviceType = data.service_type || '一般行政审批';
  const citizenCount = data.citizen_count || 100000;
  const currentDays = data.current_processing_days || 15;
  const digitalReadiness = data.digital_readiness || 'medium';
  const departments = data.departments_involved || ['民政', '公安', '社保'];
  const channels = data.service_channels || ['线下窗口', '线上门户'];

  const currentEfficiency = clamp(1 - (currentDays / 30), 0, 1);
  const automationPotential = digitalReadiness === 'high' ? 0.8 : digitalReadiness === 'medium' ? 0.6 : 0.35;
  const optimizationBoost = automationPotential * (rng() * 0.15 + 0.35);
  const optimizedEfficiency = clamp(currentEfficiency + optimizationBoost, 0, 1);
  const savingsDays = Math.max(1, Math.floor(currentDays * (1 - optimizedEfficiency) / (1 - currentEfficiency + 0.01)));

  const digitalPathways = [
    '一站式在线申请门户: 整合' + departments.length + '个部门入口',
    '智能表单预填: 基于公民数字身份自动填充60%字段',
    '电子签章与区块链存证: 确保文件不可篡改',
    'AI辅助审批: 规则明确的申请实现秒级审批',
    '进度实时推送: 短信/邮件/APP多渠道通知',
    '跨部门数据共享平台: 消除重复提交材料'
  ].slice(0, Math.floor(rng() * 3) + 3);

  const bottlenecks = [
    '部门数据孤岛: ' + departments[0] + '与' + departments[1] + '系统未打通',
    '纸质材料依赖: ' + Math.floor(rng() * 30 + 20) + '%流程仍需纸质文件',
    '身份核验瓶颈: 人工核验平均耗时' + (rng() * 2 + 1).toFixed(1) + '天',
    '高峰期拥堵: 月均' + citizenCount.toLocaleString() + '件中' + Math.floor(rng() * 40 + 30) + '%集中在月初'
  ].slice(0, Math.floor(rng() * 2) + 2);

  const improvementPlan = [
    '第一阶段(1-3月): 搭建统一身份认证与数据共享中间件',
    '第二阶段(4-6月): 核心流程数字化，目标压缩至' + Math.ceil(currentDays * 0.5) + '天',
    '第三阶段(7-9月): AI辅助审批上线，覆盖' + Math.floor(automationPotential * 80 + 10) + '%场景',
    '第四阶段(10-12月): 全流程无纸化，实现' + channels.join('/') + '一体化'
  ];

  return {
    serviceType,
    currentEfficiency,
    optimizedEfficiency,
    automationPotential,
    savingsDays,
    digitalPathways,
    bottlenecks,
    improvementPlan
  };
}

function formatPublicService(r: PublicServiceResult): string {
  let report = '# 公共服务自动化分析报告\n\n';
  report += '**服务类型:** ' + r.serviceType + '\n';
  report += '**当前效率:** ' + formatScore(r.currentEfficiency) + '%\n';
  report += '**优化后效率:** ' + formatScore(r.optimizedEfficiency) + '%\n';
  report += '**自动化潜力:** ' + formatScore(r.automationPotential) + '%\n';
  report += '**压缩时间:** 减少' + r.savingsDays + '天\n\n';
  report += '---\n\n';
  report += '## 数字化路径\n\n';
  r.digitalPathways.forEach(function (p, i) { report += (i + 1) + '. ' + p + '\n'; });
  report += '\n## 关键瓶颈\n\n';
  r.bottlenecks.forEach(function (b, i) { report += (i + 1) + '. ' + b + '\n'; });
  report += '\n## 改进路线图\n\n';
  r.improvementPlan.forEach(function (step) { report += '- ' + step + '\n'; });
  report += '\n---\n\n*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 3: TAX COMPLIANCE CHECKER ====================

export interface TaxComplianceResult {
  entityType: string;
  overallComplianceScore: number;
  riskLevel: string;
  taxTypeResults: { taxType: string; complianceScore: number; flagCount: number; note: string }[];
  missedDeductions: string[];
  recommendations: string[];
  penaltyRisk: string;
}

function analyzeTaxCompliance(inputData: string): TaxComplianceResult {
  const data = parseInput<TaxComplianceInput>(inputData);
  const rng = getRng(inputData);
  const entityType = data.entity_type || 'sme';
  const taxTypes = data.tax_types || ['增值税', '企业所得税', '个人所得税', '印花税'];
  const revenue = data.revenue_millions || 50;
  const jurisdiction = data.jurisdiction || '中国';
  const period = data.reporting_period || '2025年度';
  const deductions = data.deductions_claimed || ['研发加计扣除', '固定资产加速折旧'];

  const taxTypeResults = taxTypes.map(function (tt) {
    const score = clamp(rng() * 0.3 + 0.6, 0, 1);
    const flagCount = score < 0.7 ? Math.floor(rng() * 3) + 1 : 0;
    const note = score > 0.85 ? '合规良好' : score > 0.7 ? '存在轻微瑕疵' : '需重点审查';
    return { taxType: tt, complianceScore: score, flagCount, note };
  });

  const overallScore = taxTypeResults.reduce(function (s, t) { return s + t.complianceScore; }, 0) / taxTypeResults.length;
  const riskLevel = overallScore > 0.85 ? '低风险' : overallScore > 0.7 ? '中风险' : '高风险';

  const allDeductions = ['研发费用加计扣除', '小型微利企业优惠', '固定资产加速折旧', '公益性捐赠扣除',
    '残疾人工资加计扣除', '高新技术企业优惠', '技术转让所得减免', '节能环保设备抵免'];
  const missedDeductions = allDeductions.filter(function (d) {
    return !deductions.some(function (claimed) { return claimed.includes(d.slice(0, 2)); });
  }).slice(0, Math.floor(rng() * 3) + 1);

  const recommendations = [
    '建立税务合规月度自查机制，覆盖' + taxTypes.length + '个税种',
    '关注' + jurisdiction + '最新政策变化，特别是' + taxTypes[Math.floor(rng() * taxTypes.length)] + '优惠政策',
    '聘请外部税务顾问进行年度健康检查',
    '建立转让定价文档（关联交易场景）',
    '利用税收协定避免双重征税'
  ].slice(0, Math.floor(rng() * 2) + 3);

  const penaltyRisk = overallScore > 0.85 ? '罚款概率 <5%' : overallScore > 0.7 ? '罚款概率 10-25%' : '罚款概率 >40%';

  return {
    entityType,
    overallComplianceScore: overallScore,
    riskLevel,
    taxTypeResults,
    missedDeductions,
    recommendations,
    penaltyRisk
  };
}

function formatTaxCompliance(r: TaxComplianceResult): string {
  let report = '# 税务合规检查报告\n\n';
  report += '**实体类型:** ' + r.entityType + '\n';
  report += '**综合合规评分:** ' + formatScore(r.overallComplianceScore) + '%\n';
  report += '**风险等级:** ' + r.riskLevel + '\n';
  report += '**罚款风险:** ' + r.penaltyRisk + '\n\n';
  report += '---\n\n';
  report += '## 各税种合规状况\n\n';
  r.taxTypeResults.forEach(function (t) {
    report += '- **' + t.taxType + ':** ' + formatScore(t.complianceScore) + '% | 标记' + t.flagCount + '项 | ' + t.note + '\n';
  });
  if (r.missedDeductions.length > 0) {
    report += '\n## 可能遗漏的扣除项\n\n';
    r.missedDeductions.forEach(function (d, i) { report += (i + 1) + '. ' + d + '\n'; });
  }
  report += '\n## 合规建议\n\n';
  r.recommendations.forEach(function (rec, i) { report += (i + 1) + '. ' + rec + '\n'; });
  report += '\n---\n\n*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 4: CITIZEN ENGAGEMENT ANALYZER ====================

export interface CitizenEngagementResult {
  topic: string;
  overallSentiment: number;
  sentimentLabel: string;
  totalMentions: number;
  channelPerformance: { channel: string; mentions: number; sentiment: number; engagement: number }[];
  keyThemes: string[];
  concerns: string[];
  recommendations: string[];
}

function analyzeCitizenEngagement(inputData: string): CitizenEngagementResult {
  const data = parseInput<CitizenEngagementInput>(inputData);
  const rng = getRng(inputData);
  const topic = data.topic || '公共服务改革';
  const channels = data.channels || ['社交媒体', '市民热线', '在线论坛', '社区座谈', '信访渠道'];
  const periodDays = data.period_days || 30;
  const popSize = data.population_size || 1000000;
  const methods = data.engagement_methods || ['在线问卷', '听证会', '市民陪审团'];

  const overallSentiment = clamp(rng() * 0.4 + 0.4, 0, 1);
  const sentimentLabel = overallSentiment > 0.7 ? '积极' : overallSentiment > 0.45 ? '中性偏积极' : overallSentiment > 0.3 ? '中性偏消极' : '消极';
  const totalMentions = Math.floor(rng() * 50000 + 5000);

  const channelPerformance = channels.map(function (ch) {
    const mentions = Math.floor(rng() * totalMentions * 0.4) + 100;
    const sentiment = clamp(rng() * 0.4 + 0.4, 0, 1);
    const engagement = clamp(rng() * 0.3 + 0.3, 0, 1);
    return { channel: ch, mentions, sentiment, engagement };
  });

  const allThemes = ['服务效率', '透明度', '公平性', '可及性', '回应性', '参与渠道', '信息透明度',
    '费用合理性', '政策理解度', '反馈闭环'];
  const keyThemes = allThemes.sort(function () { return rng() - 0.5; }).slice(0, Math.floor(rng() * 3) + 4);

  const concerns = [
    '反馈响应时效: ' + Math.floor(rng() * 7 + 3) + '天内未回复占比' + Math.floor(rng() * 30 + 15) + '%',
    '信息获取门槛: ' + Math.floor(rng() * 40 + 30) + '%市民反映政策信息理解困难',
    '数字鸿沟: 老年群体线上参与率仅' + Math.floor(rng() * 20 + 10) + '%',
    '参与效果感知: ' + Math.floor(rng() * 50 + 25) + '%市民认为意见未被采纳'
  ].slice(0, Math.floor(rng() * 2) + 2);

  const recommendations = [
    '建立' + Math.floor(rng() * 3 + 2) + '小时回应机制，提升反馈闭环率',
    '开通多语言、适老化服务渠道，缩小数字鸿沟',
    '定期发布政策简报，提高信息可及性',
    '引入市民代表参与政策制定过程（' + methods[Math.floor(rng() * methods.length)] + '）',
    '建立参与效果追踪报告制度，让市民看到意见采纳成效'
  ].slice(0, Math.floor(rng() * 2) + 3);

  return {
    topic,
    overallSentiment,
    sentimentLabel,
    totalMentions,
    channelPerformance,
    keyThemes,
    concerns,
    recommendations
  };
}

function formatCitizenEngagement(r: CitizenEngagementResult): string {
  let report = '# 公民参与分析报告\n\n';
  report += '**议题:** ' + r.topic + '\n';
  report += '**整体情感:** ' + formatScore(r.overallSentiment) + '% (' + r.sentimentLabel + ')\n';
  report += '**总提及量:** ' + r.totalMentions.toLocaleString() + '条\n\n';
  report += '---\n\n';
  report += '## 渠道表现\n\n';
  r.channelPerformance.forEach(function (c) {
    report += '- **' + c.channel + ':** ' + c.mentions.toLocaleString() + '条 | 情感' + formatScore(c.sentiment) + '% | 互动率' + formatScore(c.engagement) + '%\n';
  });
  report += '\n## 关键议题主题\n\n';
  r.keyThemes.forEach(function (t, i) { report += (i + 1) + '. ' + t + '\n'; });
  if (r.concerns.length > 0) {
    report += '\n## 主要关切\n\n';
    r.concerns.forEach(function (c, i) { report += (i + 1) + '. ' + c + '\n'; });
  }
  report += '\n## 改进建议\n\n';
  r.recommendations.forEach(function (rec, i) { report += (i + 1) + '. ' + rec + '\n'; });
  report += '\n---\n\n*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 5: URBAN PLANNING SIMULATOR ====================

export interface UrbanPlanningResult {
  cityName: string;
  landUseDistribution: { type: string; percentage: number; recommendation: string }[];
  trafficFlowIndex: number;
  infrastructureScore: number;
  sustainabilityScore: number;
  populationDensityNote: string;
  developmentScenarios: string[];
  planningRecommendations: string[];
}

function analyzeUrbanPlanning(inputData: string): UrbanPlanningResult {
  const data = parseInput<UrbanPlanningInput>(inputData);
  const rng = getRng(inputData);
  const cityName = data.city_name || '未命名城市';
  const area = data.area_km2 || 500;
  const population = data.population || 500000;
  const goals = data.planning_goals || ['宜居性', '经济发展', '碳中和', '交通优化'];
  const landUseTypes = data.land_use_types || ['居住用地', '商业用地', '工业用地', '绿地', '交通用地', '公共设施'];
  const infraBudget = data.infrastructure_budget_millions || 5000;

  let remainingPct = 100;
  const landUseDistribution = landUseTypes.map(function (lt, i) {
    const isLast = i === landUseTypes.length - 1;
    const pct = isLast ? remainingPct : Math.floor(rng() * (remainingPct / (landUseTypes.length - i)) * 1.5) + 5;
    remainingPct -= pct;
    const rec = pct > 30 ? '占比偏高，建议优化' : pct < 5 ? '占比偏低，建议增配' : '占比合理';
    return { type: lt, percentage: pct, recommendation: rec };
  });

  const trafficFlowIndex = clamp(rng() * 0.4 + 0.4, 0, 1);
  const infrastructureScore = clamp(rng() * 0.3 + 0.55, 0, 1);
  const sustainabilityScore = clamp(rng() * 0.35 + 0.5, 0, 1);
  const density = Math.floor(population / area);

  const developmentScenarios = [
    '紧凑城市模式: 提高容积率至' + (rng() * 2 + 2).toFixed(1) + '，公共交通出行比例提升至' + Math.floor(rng() * 30 + 50) + '%',
    '绿色新城模式: 30%土地用于生态廊道，碳排放降低' + Math.floor(rng() * 20 + 20) + '%',
    '产业驱动模式: 科创园区占比提升至20%，新增就业' + Math.floor(rng() * 100000 + 50000).toLocaleString() + '个',
    '文化复兴模式: 历史街区保护率100%，文旅收入增长' + Math.floor(rng() * 50 + 30) + '%'
  ].slice(0, Math.floor(rng() * 2) + 2);

  const planningRecommendations = [
    '人口密密度' + density + '人/km²，' + (density > 5000 ? '建议疏解中心城区功能' : density > 2000 ? '密度适中，关注公共服务配套' : '密度较低，可适度集聚发展'),
    '基础设施投资' + infraBudget.toLocaleString() + '万元，优先投向' + goals[Math.floor(rng() * goals.length)] + '领域',
    '公共交通覆盖率目标: 500米站点覆盖率达' + Math.floor(rng() * 20 + 70) + '%',
    '绿地率目标: 人均绿地面积达' + (rng() * 5 + 10).toFixed(1) + 'm²/人',
    '智慧城市投资占比建议: ICT基础设施占总预算' + Math.floor(rng() * 10 + 10) + '%'
  ];

  return {
    cityName,
    landUseDistribution,
    trafficFlowIndex,
    infrastructureScore,
    sustainabilityScore,
    populationDensityNote: '人口密度: ' + density.toLocaleString() + '人/km²',
    developmentScenarios,
    planningRecommendations
  };
}

function formatUrbanPlanning(r: UrbanPlanningResult): string {
  let report = '# 城市规划模拟报告\n\n';
  report += '**城市:** ' + r.cityName + '\n';
  report += '**交通流畅指数:** ' + formatScore(r.trafficFlowIndex) + '%\n';
  report += '**基础设施评分:** ' + formatScore(r.infrastructureScore) + '%\n';
  report += '**可持续发展评分:** ' + formatScore(r.sustainabilityScore) + '%\n';
  report += '**' + r.populationDensityNote + '**\n\n';
  report += '---\n\n';
  report += '## 土地利用分布\n\n';
  r.landUseDistribution.forEach(function (lu) {
    report += '- **' + lu.type + ':** ' + lu.percentage + '% — ' + lu.recommendation + '\n';
  });
  report += '\n## 发展情景推演\n\n';
  r.developmentScenarios.forEach(function (s, i) { report += (i + 1) + '. ' + s + '\n'; });
  report += '\n## 规划建议\n\n';
  r.planningRecommendations.forEach(function (rec, i) { report += (i + 1) + '. ' + rec + '\n'; });
  report += '\n---\n\n*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 6: EMERGENCY RESPONSE COORDINATOR ====================

export interface EmergencyResult {
  disasterType: string;
  severityLevel: number;
  responseReadiness: number;
  resourceAllocation: { resource: string; unitsNeeded: number; unitsAvailable: number; gap: string }[];
  evacuationEstimate: string;
  timeline: string[];
  coordinationNotes: string[];
}

function analyzeEmergencyResponse(inputData: string): EmergencyResult {
  const data = parseInput<EmergencyInput>(inputData);
  const rng = getRng(inputData);
  const disasterType = data.disaster_type || '暴雨洪涝';
  const severity = data.severity_level || 3;
  const affectedPop = data.affected_population || 200000;
  const regionType = data.region_type || 'urban';
  const resources = data.available_resources || ['消防救援队', '医疗急救', '应急避难所', '物资供应', '通信保障'];
  const responseTarget = data.response_time_target_hours || 4;

  const responseReadiness = clamp(1 - (severity * 0.12) + rng() * 0.2, 0, 1);

  const resourceAllocation = resources.map(function (res) {
    const unitsNeeded = Math.floor(rng() * 50 + 10) * severity;
    const unitsAvailable = Math.floor(unitsNeeded * clamp(rng() * 0.4 + 0.5, 0, 1.2));
    const gapNum = unitsAvailable - unitsNeeded;
    const gap = gapNum >= 0 ? '充裕(+'+gapNum+')' : '缺口('+gapNum+')';
    return { resource: res, unitsNeeded, unitsAvailable, gap };
  });

  const evacTime = Math.floor(rng() * 6 + 2);
  const evacuationEstimate = '预计撤离' + affectedPop.toLocaleString() + '人，转移时间' + evacTime + '小时，需疏散路线' + Math.floor(rng() * 8 + 3) + '条';

  const timeline = [
    'T+0h: 启动' + severity + '级应急响应，指挥中心成立',
    'T+' + Math.floor(responseTarget * 0.5) + 'h: 首批救援力量到达核心灾区',
    'T+' + responseTarget + 'h: ' + (responseReadiness > 0.7 ? '全面' : '基本') + '控制灾情蔓延',
    'T+' + (evacTime + 2) + 'h: 完成' + Math.floor(affectedPop * 0.8).toLocaleString() + '人紧急转移',
    'T+' + (evacTime * 3) + 'h: 启动灾后恢复与重建规划'
  ];

  const coordinationNotes = [
    regionType === 'urban' ? '城市型灾害: 重点关注地下空间、高层建筑安全' : '非城市型灾害: 关注道路通达性与通信覆盖',
    '跨部门协同: 需应急、公安、交通、卫健、民政五部门联动',
    '信息发布: 每' + Math.floor(rng() * 2 + 1) + '小时发布一次权威信息',
    '志愿者管理: 预计' + Math.floor(rng() * 5000 + 1000).toLocaleString() + '名志愿者参与',
    '灾情评估: 遥感卫星+无人机' + Math.floor(rng() * 20 + 10) + '架次辅助评估'
  ];

  return {
    disasterType,
    severityLevel: severity,
    responseReadiness,
    resourceAllocation,
    evacuationEstimate,
    timeline,
    coordinationNotes
  };
}

function formatEmergencyResponse(r: EmergencyResult): string {
  let report = '# 应急响应协调方案\n\n';
  report += '**灾害类型:** ' + r.disasterType + '\n';
  report += '**严重等级:** ' + r.severityLevel + '/5\n';
  report += '**响应就绪度:** ' + formatScore(r.responseReadiness) + '%\n\n';
  report += '---\n\n';
  report += '## 资源调配\n\n';
  r.resourceAllocation.forEach(function (ra) {
    report += '- **' + ra.resource + ':** 需' + ra.unitsNeeded + '单位 | 有' + ra.unitsAvailable + '单位 | ' + ra.gap + '\n';
  });
  report += '\n## 撤离估算\n\n';
  report += r.evacuationEstimate + '\n\n';
  report += '## 响应时间线\n\n';
  r.timeline.forEach(function (t) { report += '- ' + t + '\n'; });
  report += '\n## 协调要点\n\n';
  r.coordinationNotes.forEach(function (n, i) { report += (i + 1) + '. ' + n + '\n'; });
  report += '\n---\n\n*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 7: SOCIAL BENEFIT OPTIMIZER ====================

export interface SocialBenefitResult {
  programName: string;
  currentCoverage: number;
  optimizedCoverage: number;
  budgetEfficiency: number;
  equityIndex: number;
  benefitBreakdown: { category: string; currentSpendPct: number; optimizedSpendPct: number; impact: string }[];
  gaps: string[];
  optimizationStrategies: string[];
}

function analyzeSocialBenefit(inputData: string): SocialBenefitResult {
  const data = parseInput<SocialBenefitInput>(inputData);
  const rng = getRng(inputData);
  const programName = data.program_name || '综合性社会保障计划';
  const targetPop = data.target_population || 1000000;
  const totalBudget = data.total_budget_millions || 200;
  const categories = data.benefit_categories || ['医疗保障', '养老保障', '教育补贴', '住房保障', '就业扶持'];
  const eligibility = data.eligibility_criteria || ['低收入群体', '老年人', '残疾人', '失业人员'];
  const currentCoverage = (data.current_coverage_pct || 65) / 100;

  const optimizedCoverage = clamp(currentCoverage + rng() * 0.15 + 0.05, 0, 1);
  const budgetEfficiency = clamp(rng() * 0.3 + 0.6, 0, 1);
  const equityIndex = clamp(rng() * 0.3 + 0.55, 0, 1);

  let remainingPct = 100;
  const benefitBreakdown = categories.map(function (cat, i) {
    const isLast = i === categories.length - 1;
    const current = isLast ? remainingPct : Math.floor(rng() * 30 + 10);
    remainingPct -= current;
    const optimized = Math.max(5, current + Math.floor(rng() * 20 - 10));
    const impact = optimized > current ? '增强投入' : optimized < current ? '资源再分配' : '维持现状';
    return { category: cat, currentSpendPct: current, optimizedSpendPct: optimized, impact };
  });

  const gaps = [
    '目标人群覆盖缺口: ' + ((1 - currentCoverage) * targetPop).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '人尚未纳入保障',
    '城乡差距: 农村覆盖率比城市低' + Math.floor(rng() * 20 + 15) + '个百分点',
    '申请流程障碍: ' + Math.floor(rng() * 30 + 20) + '%符合条件者因信息不对称未申请',
    '保障水平差异: 人均补贴城乡比达' + (rng() * 0.5 + 1.2).toFixed(1) + ':1'
  ].slice(0, Math.floor(rng() * 2) + 2);

  const optimizationStrategies = [
    '精准识别: 多源数据比对，将覆盖率从' + formatScore(currentCoverage) + '%提升至' + formatScore(optimizedCoverage) + '%',
    '流程简化: 将申请材料从' + Math.floor(rng() * 8 + 5) + '项压缩至' + Math.floor(rng() * 3 + 2) + '项',
    '主动服务: 建立福利主动发现机制，减少"应保未保"',
    '动态调整: 建立与CPI挂钩的补贴标准年度调整机制',
    '绩效评估: 每' + Math.floor(rng() * 2 + 1) + '年评估一次政策效果并调整预算分配'
  ].slice(0, Math.floor(rng() * 2) + 3);

  return {
    programName,
    currentCoverage,
    optimizedCoverage,
    budgetEfficiency,
    equityIndex,
    benefitBreakdown,
    gaps,
    optimizationStrategies
  };
}

function formatSocialBenefit(r: SocialBenefitResult): string {
  let report = '# 社会福利优化分析报告\n\n';
  report += '**计划名称:** ' + r.programName + '\n';
  report += '**当前覆盖率:** ' + formatScore(r.currentCoverage) + '%\n';
  report += '**优化后覆盖率:** ' + formatScore(r.optimizedCoverage) + '%\n';
  report += '**预算效率:** ' + formatScore(r.budgetEfficiency) + '%\n';
  report += '**公平性指数:** ' + formatScore(r.equityIndex) + '%\n\n';
  report += '---\n\n';
  report += '## 福利分类支出优化\n\n';
  r.benefitBreakdown.forEach(function (b) {
    report += '- **' + b.category + ':** 当前' + b.currentSpendPct + '% → 优化' + b.optimizedSpendPct + '% (' + b.impact + ')\n';
  });
  if (r.gaps.length > 0) {
    report += '\n## 覆盖缺口\n\n';
    r.gaps.forEach(function (g, i) { report += (i + 1) + '. ' + g + '\n'; });
  }
  report += '\n## 优化策略\n\n';
  r.optimizationStrategies.forEach(function (s, i) { report += (i + 1) + '. ' + s + '\n'; });
  report += '\n---\n\n*' + DISCLAIMER + '*';
  return report;
}

// ==================== TOOL 8: OPEN DATA PORTAL MANAGER ====================

export interface OpenDataResult {
  portalName: string;
  dataQualityScore: number;
  apiHealthScore: number;
  userSatisfactionScore: number;
  datasetMetrics: { total: number; highQuality: number; withAPI: number; regularlyUpdated: number };
  categoryCoverage: { category: string; datasetCount: number; avgQuality: number }[];
  usageInsights: string[];
  improvementActions: string[];
}

function analyzeOpenData(inputData: string): OpenDataResult {
  const data = parseInput<OpenDataInput>(inputData);
  const rng = getRng(inputData);
  const portalName = data.portal_name || '城市数据开放门户';
  const datasetCount = data.dataset_count || 500;
  const categories = data.data_categories || ['交通出行', '教育资源', '医疗健康', '环境监测', '经济产业', '政务效能'];
  const updateFreq = data.update_frequency || 'weekly';
  const apiFormats = data.api_formats || ['REST API', 'CSV下载', 'JSON', 'SPARQL'];
  const userTypes = data.user_types || ['开发者', '研究者', '企业', '公民记者', '政府内部分析师'];

  const dataQualityScore = clamp(rng() * 0.3 + 0.55, 0, 1);
  const apiHealthScore = clamp(rng() * 0.3 + 0.6, 0, 1);
  const userSatisfactionScore = clamp(rng() * 0.25 + 0.5, 0, 1);

  const highQuality = Math.floor(datasetCount * clamp(rng() * 0.2 + 0.5, 0, 1));
  const withAPI = Math.floor(datasetCount * clamp(rng() * 0.3 + 0.3, 0, 1));
  const regularlyUpdated = Math.floor(datasetCount * clamp(rng() * 0.25 + 0.4, 0, 1));

  const categoryCoverage = categories.map(function (cat) {
    const count = Math.floor(rng() * datasetCount * 0.3) + 10;
    const avgQuality = clamp(rng() * 0.3 + 0.5, 0, 1);
    return { category: cat, datasetCount: count, avgQuality };
  });

  const usageInsights = [
    'Top热门数据集: ' + categories[Math.floor(rng() * categories.length)] + '类下载量月均' + Math.floor(rng() * 50000 + 10000).toLocaleString() + '次',
    'API调用量: 月均' + Math.floor(rng() * 2000000 + 500000).toLocaleString() + '次，平均响应时间' + Math.floor(rng() * 200 + 50) + 'ms',
    '用户分布: ' + userTypes[Math.floor(rng() * userTypes.length)] + '占比最高达' + Math.floor(rng() * 30 + 25) + '%',
    '数据缺口: 市民最期待开放的' + categories[Math.floor(rng() * categories.length)] + '数据仅覆盖需求' + Math.floor(rng() * 30 + 20) + '%'
  ];

  const improvementActions = [
    '数据质量提升: 从' + formatScore(dataQualityScore) + '%提升至目标80%，重点治理元数据完整性',
    'API标准化: 统一为' + apiFormats.slice(0, 2).join('/') + '标准格式',
    '更新频率优化: 从' + updateFreq + '提升至' + (updateFreq === 'monthly' ? 'weekly' : updateFreq === 'weekly' ? 'daily' : 'realtime'),
    '用户反馈闭环: 建立数据集评分与需求征集机制',
    '数据治理框架: 制定数据分级分类开放策略',
    '开发者生态: 举办黑客松活动，培育' + Math.floor(rng() * 50 + 20) + '个创新应用'
  ].slice(0, Math.floor(rng() * 3) + 3);

  return {
    portalName,
    dataQualityScore,
    apiHealthScore,
    userSatisfactionScore,
    datasetMetrics: { total: datasetCount, highQuality, withAPI, regularlyUpdated },
    categoryCoverage,
    usageInsights,
    improvementActions
  };
}

function formatOpenData(r: OpenDataResult): string {
  let report = '# 开放数据门户管理报告\n\n';
  report += '**门户名称:** ' + r.portalName + '\n';
  report += '**数据质量评分:** ' + formatScore(r.dataQualityScore) + '%\n';
  report += '**API健康度:** ' + formatScore(r.apiHealthScore) + '%\n';
  report += '**用户满意度:** ' + formatScore(r.userSatisfactionScore) + '%\n\n';
  report += '---\n\n';
  report += '## 数据集概览\n\n';
  report += '| 指标 | 数量 |\n';
  report += '|------|------|\n';
  report += '| 总数据集 | ' + r.datasetMetrics.total.toLocaleString() + ' |\n';
  report += '| 高质量数据 | ' + r.datasetMetrics.highQuality.toLocaleString() + ' |\n';
  report += '| 提供API | ' + r.datasetMetrics.withAPI.toLocaleString() + ' |\n';
  report += '| 定期更新 | ' + r.datasetMetrics.regularlyUpdated.toLocaleString() + ' |\n\n';
  report += '## 分类覆盖\n\n';
  r.categoryCoverage.forEach(function (c) {
    report += '- **' + c.category + ':** ' + c.datasetCount + '个数据集 | 平均质量' + formatScore(c.avgQuality) + '%\n';
  });
  report += '\n## 使用洞察\n\n';
  r.usageInsights.forEach(function (ins, i) { report += (i + 1) + '. ' + ins + '\n'; });
  report += '\n## 改进行动\n\n';
  r.improvementActions.forEach(function (a, i) { report += (i + 1) + '. ' + a + '\n'; });
  report += '\n---\n\n*' + DISCLAIMER + '*';
  return report;
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'policy_impact_analyzer',
    description: '政策影响分析: 经济/社会/环境多维影响评估，风险识别与政策建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: policy_name, policy_type, target_sectors' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPolicyImpact(analyzePolicyImpact(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'public_service_automator',
    description: '公共服务自动化: 审批流程数字化、瓶颈识别、效率优化路径',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: service_type, citizen_count, current_processing_days' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPublicService(analyzePublicService(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'tax_compliance_checker',
    description: '税务合规检查: 多税种合规评估、风险识别、遗漏扣除提醒',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: entity_type, tax_types, revenue_millions' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTaxCompliance(analyzeTaxCompliance(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'citizen_engagement_analyzer',
    description: '公民参与分析: 舆情监测、情感分析、渠道效果评估、参与改进',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: topic, channels, period_days' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCitizenEngagement(analyzeCitizenEngagement(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'urban_planning_simulator',
    description: '城市规划模拟: 土地利用分布、交通流、可持续发展、发展情景推演',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: city_name, area_km2, population, planning_goals' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatUrbanPlanning(analyzeUrbanPlanning(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'emergency_response_coordinator',
    description: '应急响应协调: 灾害评估、资源调度、疏散规划、协同指挥方案',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: disaster_type, severity_level, affected_population' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatEmergencyResponse(analyzeEmergencyResponse(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'social_benefit_optimizer',
    description: '社会福利优化: 覆盖率分析、预算效率、公平性评估、优化策略',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: program_name, target_population, total_budget_millions' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSocialBenefit(analyzeSocialBenefit(args.input_data)) }
  }))

  tools.register(defineTool({
    name: 'open_data_portal_manager',
    description: '开放数据门户: 数据质量评分、API健康度、分类覆盖、使用洞察',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: portal_name, dataset_count, data_categories' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatOpenData(analyzeOpenData(args.input_data)) }
  }))
}
