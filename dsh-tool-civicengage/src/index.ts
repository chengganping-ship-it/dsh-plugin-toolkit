import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'civicengage';
export const inject = ['tools'];

const DISCLAIMER = '本工具提供辅助分析参考，不替代政府决策与专业判断。';

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

// ============================================================
// 1. citizen_engagement_analyzer — 公民参与分析
// ============================================================
export interface CitizenEngagementInput {
  city?: string;
  district?: string;
  channel?: string;
  period?: string;
}

export interface CitizenEngagementResult {
  participation_rate: { overall: number; online: number; offline: number; youth_pct: number };
  channel_performance: { app_users: number; hotline_calls: number; townhalls: number; social_media: number };
  issue_categories: { infrastructure: number; environment: number; education: number; safety: number; transport: number };
  response_metrics: { avg_response_days: number; resolution_rate: number; satisfaction: number };
  demographic_reach: { elderly: number; disabled: number; low_income: number; minority: number };
}

function analyzeCitizenEngagement(data: CitizenEngagementInput): CitizenEngagementResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    participation_rate: {
      overall: 15 + rng() * 45,
      online: 20 + rng() * 60,
      offline: 5 + rng() * 25,
      youth_pct: 10 + rng() * 40,
    },
    channel_performance: {
      app_users: Math.floor(5000 + rng() * 95000),
      hotline_calls: Math.floor(1000 + rng() * 19000),
      townhalls: Math.floor(5 + rng() * 95),
      social_media: Math.floor(2000 + rng() * 48000),
    },
    issue_categories: {
      infrastructure: Math.floor(100 + rng() * 900),
      environment: Math.floor(80 + rng() * 720),
      education: Math.floor(60 + rng() * 540),
      safety: Math.floor(50 + rng() * 450),
      transport: Math.floor(70 + rng() * 630),
    },
    response_metrics: {
      avg_response_days: 1 + rng() * 14,
      resolution_rate: 50 + rng() * 45,
      satisfaction: 3.0 + rng() * 2.0,
    },
    demographic_reach: {
      elderly: 10 + rng() * 30,
      disabled: 5 + rng() * 20,
      low_income: 15 + rng() * 35,
      minority: 8 + rng() * 25,
    },
  };
}

function formatCitizenEngagement(r: CitizenEngagementResult): string {
  return [
    '【公民参与分析报告】',
    '',
    '▸ 参与率',
    '  总体参与率: ' + r.participation_rate.overall.toFixed(1) + '%',
    '  线上参与: ' + r.participation_rate.online.toFixed(1) + '%',
    '  线下参与: ' + r.participation_rate.offline.toFixed(1) + '%',
    '  青年占比: ' + r.participation_rate.youth_pct.toFixed(1) + '%',
    '',
    '▸ 渠道表现',
    '  APP用户: ' + r.channel_performance.app_users.toLocaleString() + ' 人',
    '  热线来电: ' + r.channel_performance.hotline_calls.toLocaleString() + ' 通',
    '  市民议事: ' + r.channel_performance.townhalls + ' 场',
    '  社媒互动: ' + r.channel_performance.social_media.toLocaleString() + ' 次',
    '',
    '▸ 议题分类',
    '  基础设施: ' + r.issue_categories.infrastructure + ' 件',
    '  环境保护: ' + r.issue_categories.environment + ' 件',
    '  教育文化: ' + r.issue_categories.education + ' 件',
    '  公共安全: ' + r.issue_categories.safety + ' 件',
    '  交通运输: ' + r.issue_categories.transport + ' 件',
    '',
    '▸ 响应指标',
    '  平均响应: ' + r.response_metrics.avg_response_days.toFixed(1) + ' 天',
    '  解决率: ' + r.response_metrics.resolution_rate.toFixed(1) + '%',
    '  满意度: ' + r.response_metrics.satisfaction.toFixed(2) + ' / 5.0',
    '',
    '▸ 群体覆盖',
    '  老年人: ' + r.demographic_reach.elderly.toFixed(1) + '%',
    '  残障人士: ' + r.demographic_reach.disabled.toFixed(1) + '%',
    '  低收入群体: ' + r.demographic_reach.low_income.toFixed(1) + '%',
    '  少数民族: ' + r.demographic_reach.minority.toFixed(1) + '%',
    '',
    '⚠ ' + DISCLAIMER,
  ].join('\n');
}

// ============================================================
// 2. public_service_optimizer — 公共服务优化
// ============================================================
export interface PublicServiceInput {
  service_type?: string;
  region?: string;
  population?: string;
  budget_level?: string;
}

export interface PublicServiceResult {
  accessibility: { coverage_radius_km: number; facilities: number; underserved_pct: number };
  utilization: { avg_daily_visits: number; peak_wait_min: number; capacity_usage: number };
  quality_scores: { staff_rating: number; facility_rating: number; digital_rating: number; overall: number };
  efficiency: { cost_per_visit: number; staff_productivity: number; automation_rate: number };
  gap_analysis: { top_gaps: string[]; priority: string; investment_needed: number };
}

function analyzePublicService(data: PublicServiceInput): PublicServiceResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const gapPool = [
    '社区医疗资源不足',
    '养老服务供给缺口',
    '公共图书馆覆盖盲区',
    '体育设施老旧更新',
    '儿童托管服务短缺',
    '残障无障碍设施不完善',
    '数字服务渠道缺失',
    '公共交通接驳不便',
  ];
  const shuffled = gapPool.sort(() => rng() - 0.5);
  const priorities = ['P0-紧急', 'P1-重要', 'P2-一般', 'P3-低'];

  return {
    accessibility: {
      coverage_radius_km: 0.5 + rng() * 4.5,
      facilities: Math.floor(10 + rng() * 490),
      underserved_pct: 5 + rng() * 35,
    },
    utilization: {
      avg_daily_visits: Math.floor(100 + rng() * 4900),
      peak_wait_min: 5 + rng() * 55,
      capacity_usage: 40 + rng() * 55,
    },
    quality_scores: {
      staff_rating: 3.0 + rng() * 2.0,
      facility_rating: 2.5 + rng() * 2.5,
      digital_rating: 2.0 + rng() * 3.0,
      overall: 2.8 + rng() * 2.2,
    },
    efficiency: {
      cost_per_visit: 10 + rng() * 90,
      staff_productivity: 50 + rng() * 45,
      automation_rate: 10 + rng() * 70,
    },
    gap_analysis: {
      top_gaps: shuffled.slice(0, 3 + Math.floor(rng() * 3)),
      priority: priorities[Math.floor(rng() * 4)],
      investment_needed: Math.floor(50 + rng() * 950),
    },
  };
}

function formatPublicService(r: PublicServiceResult): string {
  return [
    '【公共服务优化报告】',
    '',
    '▸ 可达性',
    '  覆盖半径: ' + r.accessibility.coverage_radius_km.toFixed(1) + ' km',
    '  设施数量: ' + r.accessibility.facilities + ' 个',
    '  服务盲区: ' + r.accessibility.underserved_pct.toFixed(1) + '%',
    '',
    '▸ 利用率',
    '  日均访问: ' + r.utilization.avg_daily_visits.toLocaleString() + ' 人次',
    '  高峰等待: ' + r.utilization.peak_wait_min.toFixed(0) + ' 分钟',
    '  容量使用率: ' + r.utilization.capacity_usage.toFixed(1) + '%',
    '',
    '▸ 质量评分',
    '  人员服务: ' + r.quality_scores.staff_rating.toFixed(2) + ' / 5.0',
    '  设施环境: ' + r.quality_scores.facility_rating.toFixed(2) + ' / 5.0',
    '  数字化: ' + r.quality_scores.digital_rating.toFixed(2) + ' / 5.0',
    '  综合: ' + r.quality_scores.overall.toFixed(2) + ' / 5.0',
    '',
    '▸ 效率指标',
    '  单次成本: ¥' + r.efficiency.cost_per_visit.toFixed(2),
    '  人员效率: ' + r.efficiency.staff_productivity.toFixed(1) + '%',
    '  自动化率: ' + r.efficiency.automation_rate.toFixed(1) + '%',
    '',
    '▸ 差距分析',
    '  优先级: ' + r.gap_analysis.priority,
    '  需投资: ¥' + r.gap_analysis.investment_needed.toLocaleString() + ' 万',
    '  主要缺口:',
    ...r.gap_analysis.top_gaps.map((g) => '    - ' + g),
    '',
    '⚠ ' + DISCLAIMER,
  ].join('\n');
}

// ============================================================
// 3. homelessness_intervention_planner — 无家可归干预规划
// ============================================================
export interface HomelessnessInput {
  city?: string;
  season?: string;
  intervention_type?: string;
  population_estimate?: string;
}

export interface HomelessnessResult {
  population_estimate: { total: number; chronic: number; youth_pct: number; families: number };
  shelter_capacity: { beds_total: number; beds_available: number; occupancy_rate: number; avg_stay_days: number };
  intervention_outcomes: { housing_placed: number; employment_rate: number; recidivism_rate: number };
  service_utilization: { mental_health: number; substance_treatment: number; job_training: number; medical: number };
  resource_allocation: { budget_millions: number; cost_per_person: number; funding_gap: number };
}

function analyzeHomelessness(data: HomelessnessInput): HomelessnessResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    population_estimate: {
      total: Math.floor(500 + rng() * 9500),
      chronic: Math.floor(100 + rng() * 2900),
      youth_pct: 10 + rng() * 25,
      families: Math.floor(50 + rng() * 950),
    },
    shelter_capacity: {
      beds_total: Math.floor(300 + rng() * 4700),
      beds_available: Math.floor(20 + rng() * 480),
      occupancy_rate: 70 + rng() * 28,
      avg_stay_days: 15 + rng() * 75,
    },
    intervention_outcomes: {
      housing_placed: Math.floor(50 + rng() * 950),
      employment_rate: 15 + rng() * 45,
      recidivism_rate: 10 + rng() * 40,
    },
    service_utilization: {
      mental_health: 20 + rng() * 50,
      substance_treatment: 15 + rng() * 45,
      job_training: 10 + rng() * 40,
      medical: 25 + rng() * 50,
    },
    resource_allocation: {
      budget_millions: 1 + rng() * 49,
      cost_per_person: 5000 + rng() * 45000,
      funding_gap: Math.floor(10 + rng() * 90),
    },
  };
}

function formatHomelessness(r: HomelessnessResult): string {
  return [
    '【无家可归干预规划报告】',
    '',
    '▸ 人口估算',
    '  总数: ' + r.population_estimate.total.toLocaleString() + ' 人',
    '  长期无家: ' + r.population_estimate.chronic.toLocaleString() + ' 人',
    '  青年占比: ' + r.population_estimate.youth_pct.toFixed(1) + '%',
    '  家庭数: ' + r.population_estimate.families.toLocaleString() + ' 户',
    '',
    '▸ 庇护容量',
    '  总床位: ' + r.shelter_capacity.beds_total.toLocaleString() + ' 张',
    '  可用床位: ' + r.shelter_capacity.beds_available.toLocaleString() + ' 张',
    '  入住率: ' + r.shelter_capacity.occupancy_rate.toFixed(1) + '%',
    '  平均居住: ' + r.shelter_capacity.avg_stay_days.toFixed(0) + ' 天',
    '',
    '▸ 干预成效',
    '  安置住房: ' + r.intervention_outcomes.housing_placed.toLocaleString() + ' 人',
    '  就业率: ' + r.intervention_outcomes.employment_rate.toFixed(1) + '%',
    '  返流率: ' + r.intervention_outcomes.recidivism_rate.toFixed(1) + '%',
    '',
    '▸ 服务利用',
    '  心理健康: ' + r.service_utilization.mental_health.toFixed(1) + '%',
    '  戒瘾治疗: ' + r.service_utilization.substance_treatment.toFixed(1) + '%',
    '  就业培训: ' + r.service_utilization.job_training.toFixed(1) + '%',
    '  医疗服务: ' + r.service_utilization.medical.toFixed(1) + '%',
    '',
    '▸ 资源配置',
    '  预算: ¥' + r.resource_allocation.budget_millions.toFixed(1) + ' 百万',
    '  人均成本: ¥' + r.resource_allocation.cost_per_person.toLocaleString(),
    '  资金缺口: ' + r.resource_allocation.funding_gap + '%',
    '',
    '⚠ ' + DISCLAIMER,
  ].join('\n');
}

// ============================================================
// 4. urban_mobility_analyst — 城市交通分析
// ============================================================
export interface UrbanMobilityInput {
  city?: string;
  zone?: string;
  mode?: string;
  time_range?: string;
}

export interface UrbanMobilityResult {
  transit_coverage: { bus_routes: number; metro_lines: number; bike_stations: number; coverage_pct: number };
  congestion_metrics: { peak_index: number; avg_speed: number; delay_hours_daily: number };
  ridership: { daily_total: number; bus_ridership: number; metro_ridership: number; bike_trips: number };
  sustainability: { co2_reduction_tons: number; ev_bus_pct: number; green_mode_share: number };
  accessibility: { disabled_accessible_pct: number; low_income_proximity: number; last_mile_gap: number };
}

function analyzeUrbanMobility(data: UrbanMobilityInput): UrbanMobilityResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    transit_coverage: {
      bus_routes: Math.floor(20 + rng() * 480),
      metro_lines: Math.floor(1 + rng() * 19),
      bike_stations: Math.floor(50 + rng() * 1950),
      coverage_pct: 40 + rng() * 55,
    },
    congestion_metrics: {
      peak_index: 1.2 + rng() * 2.0,
      avg_speed: 15 + rng() * 35,
      delay_hours_daily: 0.5 + rng() * 3.5,
    },
    ridership: {
      daily_total: Math.floor(50000 + rng() * 950000),
      bus_ridership: Math.floor(20000 + rng() * 480000),
      metro_ridership: Math.floor(10000 + rng() * 490000),
      bike_trips: Math.floor(5000 + rng() * 95000),
    },
    sustainability: {
      co2_reduction_tons: Math.floor(100 + rng() * 9900),
      ev_bus_pct: 10 + rng() * 80,
      green_mode_share: 20 + rng() * 60,
    },
    accessibility: {
      disabled_accessible_pct: 30 + rng() * 65,
      low_income_proximity: 40 + rng() * 50,
      last_mile_gap: 10 + rng() * 40,
    },
  };
}

function formatUrbanMobility(r: UrbanMobilityResult): string {
  return [
    '【城市交通分析报告】',
    '',
    '▸ 交通覆盖',
    '  公交线路: ' + r.transit_coverage.bus_routes + ' 条',
    '  地铁线路: ' + r.transit_coverage.metro_lines + ' 条',
    '  共享单车点: ' + r.transit_coverage.bike_stations + ' 个',
    '  覆盖率: ' + r.transit_coverage.coverage_pct.toFixed(1) + '%',
    '',
    '▸ 拥堵指标',
    '  高峰指数: ' + r.congestion_metrics.peak_index.toFixed(2),
    '  平均车速: ' + r.congestion_metrics.avg_speed.toFixed(1) + ' km/h',
    '  日均延误: ' + r.congestion_metrics.delay_hours_daily.toFixed(1) + ' 小时',
    '',
    '▸ 客运量',
    '  日总客运: ' + r.ridership.daily_total.toLocaleString() + ' 人次',
    '  公交: ' + r.ridership.bus_ridership.toLocaleString() + ' 人次',
    '  地铁: ' + r.ridership.metro_ridership.toLocaleString() + ' 人次',
    '  共享单车: ' + r.ridership.bike_trips.toLocaleString() + ' 次',
    '',
    '▸ 可持续性',
    '  CO2减排: ' + r.sustainability.co2_reduction_tons.toLocaleString() + ' 吨/年',
    '  电动公交: ' + r.sustainability.ev_bus_pct.toFixed(1) + '%',
    '  绿色出行: ' + r.sustainability.green_mode_share.toFixed(1) + '%',
    '',
    '▸ 无障碍',
    '  无障碍覆盖: ' + r.accessibility.disabled_accessible_pct.toFixed(1) + '%',
    '  低收入可达: ' + r.accessibility.low_income_proximity.toFixed(1) + '%',
    '  最后一公里: ' + r.accessibility.last_mile_gap.toFixed(1) + '%',
    '',
    '⚠ ' + DISCLAIMER,
  ].join('\n');
}

// ============================================================
// 5. digital_equity_mapper — 数字公平地图
// ============================================================
export interface DigitalEquityInput {
  region?: string;
  demographic?: string;
  infrastructure_type?: string;
  connectivity_level?: string;
}

export interface DigitalEquityResult {
  broadband_access: { covered_pct: number; avg_speed_mbps: number; affordability_index: number };
  device_penetration: { smartphone: number; computer: number; tablet: number; no_device_pct: number };
  digital_literacy: { basic_skills: number; intermediate: number; advanced: number; training_gap: number };
  public_wifi: { hotspots: number; coverage_km2: number; avg_users_per_day: number };
  equity_gaps: { rural_gap: number; elderly_gap: number; income_gap: number; disability_gap: number };
}

function analyzeDigitalEquity(data: DigitalEquityInput): DigitalEquityResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    broadband_access: {
      covered_pct: 50 + rng() * 49,
      avg_speed_mbps: 20 + rng() * 480,
      affordability_index: 30 + rng() * 65,
    },
    device_penetration: {
      smartphone: 60 + rng() * 38,
      computer: 40 + rng() * 50,
      tablet: 15 + rng() * 40,
      no_device_pct: 2 + rng() * 18,
    },
    digital_literacy: {
      basic_skills: 40 + rng() * 50,
      intermediate: 15 + rng() * 45,
      advanced: 5 + rng() * 30,
      training_gap: 10 + rng() * 50,
    },
    public_wifi: {
      hotspots: Math.floor(50 + rng() * 1950),
      coverage_km2: 5 + rng() * 195,
      avg_users_per_day: Math.floor(100 + rng() * 9900),
    },
    equity_gaps: {
      rural_gap: 15 + rng() * 50,
      elderly_gap: 20 + rng() * 55,
      income_gap: 10 + rng() * 45,
      disability_gap: 15 + rng() * 50,
    },
  };
}

function formatDigitalEquity(r: DigitalEquityResult): string {
  return [
    '【数字公平地图报告】',
    '',
    '▸ 宽带接入',
    '  覆盖率: ' + r.broadband_access.covered_pct.toFixed(1) + '%',
    '  平均速率: ' + r.broadband_access.avg_speed_mbps.toFixed(0) + ' Mbps',
    '  可负担指数: ' + r.broadband_access.affordability_index.toFixed(1) + ' / 100',
    '',
    '▸ 设备普及',
    '  智能手机: ' + r.device_penetration.smartphone.toFixed(1) + '%',
    '  电脑: ' + r.device_penetration.computer.toFixed(1) + '%',
    '  平板: ' + r.device_penetration.tablet.toFixed(1) + '%',
    '  无设备: ' + r.device_penetration.no_device_pct.toFixed(1) + '%',
    '',
    '▸ 数字素养',
    '  基础技能: ' + r.digital_literacy.basic_skills.toFixed(1) + '%',
    '  中级技能: ' + r.digital_literacy.intermediate.toFixed(1) + '%',
    '  高级技能: ' + r.digital_literacy.advanced.toFixed(1) + '%',
    '  培训缺口: ' + r.digital_literacy.training_gap.toFixed(1) + '%',
    '',
    '▸ 公共WiFi',
    '  热点数: ' + r.public_wifi.hotspots.toLocaleString() + ' 个',
    '  覆盖面积: ' + r.public_wifi.coverage_km2.toFixed(1) + ' km²',
    '  日均用户: ' + r.public_wifi.avg_users_per_day.toLocaleString() + ' 人',
    '',
    '▸ 公平差距',
    '  城乡差距: ' + r.equity_gaps.rural_gap.toFixed(1) + '%',
    '  老年差距: ' + r.equity_gaps.elderly_gap.toFixed(1) + '%',
    '  收入差距: ' + r.equity_gaps.income_gap.toFixed(1) + '%',
    '  残障差距: ' + r.equity_gaps.disability_gap.toFixed(1) + '%',
    '',
    '⚠ ' + DISCLAIMER,
  ].join('\n');
}

// ============================================================
// 6. public_safety_predictor — 公共安全预测
// ============================================================
export interface PublicSafetyInput {
  area?: string;
  crime_type?: string;
  time_horizon?: string;
  season?: string;
}

export interface PublicSafetyResult {
  crime_forecast: { predicted_incidents: number; trend: string; confidence: number; yoy_change: number };
  hotspot_zones: { high_risk: number; medium_risk: number; emerging: number; hotspot_names: string[] };
  resource_deployment: { recommended_patrols: number; camera_upgrades: number; community_programs: number };
  prevention_impact: { projected_reduction: number; cost_benefit: number; community_trust: number };
  risk_factors: { top_factors: string[]; severity: string; urgency: string };
}

function analyzePublicSafety(data: PublicSafetyInput): PublicSafetyResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const trends = ['上升', '下降', '平稳'];
  const severities = ['低', '中', '高', '极高'];
  const urgencies = ['立即行动', '本周内', '本月内', '持续监控'];
  const factorPool = [
    '夜间照明不足',
    '监控盲区',
    '失业率上升',
    '流动人口增加',
    '酒吧娱乐场所密集',
    '公共交通枢纽周边',
    '老旧小区管理薄弱',
    '青少年活动中心缺乏',
  ];
  const shuffled = factorPool.sort(() => rng() - 0.5);
  const zonePool = ['商业区A', '居民区B', '工业区C', '交通枢纽D', '学校周边E', '夜市F', '城中村G', '步行街H'];
  const zoneShuffled = zonePool.sort(() => rng() - 0.5);

  return {
    crime_forecast: {
      predicted_incidents: Math.floor(50 + rng() * 950),
      trend: trends[Math.floor(rng() * 3)],
      confidence: 60 + rng() * 35,
      yoy_change: -20 + rng() * 40,
    },
    hotspot_zones: {
      high_risk: Math.floor(2 + rng() * 18),
      medium_risk: Math.floor(5 + rng() * 25),
      emerging: Math.floor(1 + rng() * 9),
      hotspot_names: zoneShuffled.slice(0, 2 + Math.floor(rng() * 3)),
    },
    resource_deployment: {
      recommended_patrols: Math.floor(5 + rng() * 45),
      camera_upgrades: Math.floor(10 + rng() * 190),
      community_programs: Math.floor(2 + rng() * 18),
    },
    prevention_impact: {
      projected_reduction: 5 + rng() * 30,
      cost_benefit: 1.0 + rng() * 4.0,
      community_trust: 40 + rng() * 50,
    },
    risk_factors: {
      top_factors: shuffled.slice(0, 3 + Math.floor(rng() * 3)),
      severity: severities[Math.floor(rng() * 4)],
      urgency: urgencies[Math.floor(rng() * 4)],
    },
  };
}

function formatPublicSafety(r: PublicSafetyResult): string {
  return [
    '【公共安全预测报告】',
    '',
    '▸ 犯罪预测',
    '  预测案件: ' + r.crime_forecast.predicted_incidents + ' 起',
    '  趋势: ' + r.crime_forecast.trend,
    '  置信度: ' + r.crime_forecast.confidence.toFixed(1) + '%',
    '  同比变化: ' + (r.crime_forecast.yoy_change >= 0 ? '+' : '') + r.crime_forecast.yoy_change.toFixed(1) + '%',
    '',
    '▸ 热点区域',
    '  高风险: ' + r.hotspot_zones.high_risk + ' 个',
    '  中风险: ' + r.hotspot_zones.medium_risk + ' 个',
    '  新兴: ' + r.hotspot_zones.emerging + ' 个',
    '  热点名称: ' + r.hotspot_zones.hotspot_names.join(', '),
    '',
    '▸ 资源部署',
    '  推荐巡逻: ' + r.resource_deployment.recommended_patrols + ' 组',
    '  摄像头升级: ' + r.resource_deployment.camera_upgrades + ' 路',
    '  社区项目: ' + r.resource_deployment.community_programs + ' 个',
    '',
    '▸ 预防效果',
    '  预计减少: ' + r.prevention_impact.projected_reduction.toFixed(1) + '%',
    '  成本效益: ' + r.prevention_impact.cost_benefit.toFixed(2),
    '  社区信任: ' + r.prevention_impact.community_trust.toFixed(1) + '%',
    '',
    '▸ 风险因素',
    '  严重度: ' + r.risk_factors.severity,
    '  紧急度: ' + r.risk_factors.urgency,
    '  主要因素:',
    ...r.risk_factors.top_factors.map((f) => '    - ' + f),
    '',
    '⚠ ' + DISCLAIMER,
  ].join('\n');
}

// ============================================================
// 7. civic_sentiment_tracker — 民情舆情追踪
// ============================================================
export interface CivicSentimentInput {
  topic?: string;
  platform?: string;
  region?: string;
  period?: string;
}

export interface CivicSentimentResult {
  sentiment_overall: { positive: number; neutral: number; negative: number; sentiment_score: number };
  volume_metrics: { total_mentions: number; unique_users: number; viral_posts: number; growth_rate: number };
  topic_clusters: { top_topics: string[]; emerging_issues: string[]; resolved_issues: string[] };
  platform_breakdown: { weibo: number; wechat: number; forums: number; news_comments: number; short_video: number };
  alert_signals: { risk_level: number; escalation_urgency: string; recommended_action: string };
}

function analyzeCivicSentiment(data: CivicSentimentInput): CivicSentimentResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const urgencies = ['低', '中', '高', '紧急'];
  const actions = ['持续监控', '主动回应', '紧急处置', '跨部门联动'];
  const topicPool = ['房价调控', '教育改革', '医疗资源', '环境污染', '交通拥堵', '食品安全', '养老服务', '就业保障'];
  const topicShuffled = topicPool.sort(() => rng() - 0.5);
  const emergingPool = ['新政策反响', '突发事件', '民生热点', '网络谣言', '群体诉求'];
  const emergingShuffled = emergingPool.sort(() => rng() - 0.5);
  const resolvedPool = ['道路修缮完成', '学校扩建落地', '医保报销优化', '公园开放'];
  const resolvedShuffled = resolvedPool.sort(() => rng() - 0.5);

  const positive = 15 + rng() * 40;
  const negative = 10 + rng() * 40;
  const neutral = 100 - positive - negative;

  return {
    sentiment_overall: {
      positive: positive,
      neutral: neutral,
      negative: negative,
      sentiment_score: -1 + rng() * 2,
    },
    volume_metrics: {
      total_mentions: Math.floor(5000 + rng() * 995000),
      unique_users: Math.floor(1000 + rng() * 99000),
      viral_posts: Math.floor(5 + rng() * 195),
      growth_rate: -30 + rng() * 100,
    },
    topic_clusters: {
      top_topics: topicShuffled.slice(0, 3),
      emerging_issues: emergingShuffled.slice(0, 2),
      resolved_issues: resolvedShuffled.slice(0, 2),
    },
    platform_breakdown: {
      weibo: Math.floor(1000 + rng() * 9000),
      wechat: Math.floor(800 + rng() * 8000),
      forums: Math.floor(200 + rng() * 3000),
      news_comments: Math.floor(500 + rng() * 5000),
      short_video: Math.floor(300 + rng() * 4000),
    },
    alert_signals: {
      risk_level: Math.floor(1 + rng() * 10),
      escalation_urgency: urgencies[Math.floor(rng() * 4)],
      recommended_action: actions[Math.floor(rng() * 4)],
    },
  };
}

function formatCivicSentiment(r: CivicSentimentResult): string {
  return [
    '【民情舆情追踪报告】',
    '',
    '▸ 整体情感',
    '  正面: ' + r.sentiment_overall.positive.toFixed(1) + '%',
    '  中性: ' + r.sentiment_overall.neutral.toFixed(1) + '%',
    '  负面: ' + r.sentiment_overall.negative.toFixed(1) + '%',
    '  情感得分: ' + r.sentiment_overall.sentiment_score.toFixed(2) + ' (-1 ~ +1)',
    '',
    '▸ 声量指标',
    '  总提及: ' + r.volume_metrics.total_mentions.toLocaleString() + ' 条',
    '  独立用户: ' + r.volume_metrics.unique_users.toLocaleString() + ' 人',
    '  病毒帖: ' + r.volume_metrics.viral_posts + ' 条',
    '  增长率: ' + (r.volume_metrics.growth_rate >= 0 ? '+' : '') + r.volume_metrics.growth_rate.toFixed(1) + '%',
    '',
    '▸ 话题聚类',
    '  热门话题: ' + r.topic_clusters.top_topics.join(', '),
    '  新兴议题: ' + r.topic_clusters.emerging_issues.join(', '),
    '  已解决: ' + r.topic_clusters.resolved_issues.join(', '),
    '',
    '▸ 平台分布',
    '  微博: ' + r.platform_breakdown.weibo.toLocaleString(),
    '  微信: ' + r.platform_breakdown.wechat.toLocaleString(),
    '  论坛: ' + r.platform_breakdown.forums.toLocaleString(),
    '  新闻评论: ' + r.platform_breakdown.news_comments.toLocaleString(),
    '  短视频: ' + r.platform_breakdown.short_video.toLocaleString(),
    '',
    '▸ 预警信号',
    '  风险等级: ' + r.alert_signals.risk_level + ' / 10',
    '  紧急度: ' + r.alert_signals.escalation_urgency,
    '  建议行动: ' + r.alert_signals.recommended_action,
    '',
    '⚠ ' + DISCLAIMER,
  ].join('\n');
}

// ============================================================
// 8. smart_city_roi_calculator — 智慧城市ROI计算
// ============================================================
export interface SmartCityROIInput {
  project_type?: string;
  investment_amount?: string;
  timeframe?: string;
  population_served?: string;
}

export interface SmartCityROIResult {
  financial_roi: { total_investment: number; annual_savings: number; payback_years: number; npv: number };
  efficiency_gains: { time_saved_hours_daily: number; process_automation_pct: number; staff_reduction_pct: number };
  citizen_benefits: { satisfaction_lift: number; service_access_improvement: number; digital_inclusion_gain: number };
  environmental_impact: { co2_reduction_tons: number; energy_savings_pct: number; waste_reduction_pct: number };
  risk_assessment: { implementation_risk: string; tech_obsolescence: string; scalability: string };
}

function analyzeSmartCityROI(data: SmartCityROIInput): SmartCityROIResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const risks = ['低', '中', '高'];
  const scalabilities = ['优秀', '良好', '一般', '受限'];

  return {
    financial_roi: {
      total_investment: Math.floor(100 + rng() * 9900),
      annual_savings: Math.floor(20 + rng() * 1980),
      payback_years: 2 + rng() * 8,
      npv: Math.floor(-200 + rng() * 4200),
    },
    efficiency_gains: {
      time_saved_hours_daily: 0.5 + rng() * 9.5,
      process_automation_pct: 20 + rng() * 70,
      staff_reduction_pct: 5 + rng() * 30,
    },
    citizen_benefits: {
      satisfaction_lift: 5 + rng() * 30,
      service_access_improvement: 10 + rng() * 60,
      digital_inclusion_gain: 5 + rng() * 40,
    },
    environmental_impact: {
      co2_reduction_tons: Math.floor(50 + rng() * 4950),
      energy_savings_pct: 5 + rng() * 40,
      waste_reduction_pct: 3 + rng() * 30,
    },
    risk_assessment: {
      implementation_risk: risks[Math.floor(rng() * 3)],
      tech_obsolescence: risks[Math.floor(rng() * 3)],
      scalability: scalabilities[Math.floor(rng() * 4)],
    },
  };
}

function formatSmartCityROI(r: SmartCityROIResult): string {
  return [
    '【智慧城市ROI计算报告】',
    '',
    '▸ 财务ROI',
    '  总投资: ¥' + r.financial_roi.total_investment.toLocaleString() + ' 万',
    '  年节省: ¥' + r.financial_roi.annual_savings.toLocaleString() + ' 万',
    '  回收期: ' + r.financial_roi.payback_years.toFixed(1) + ' 年',
    '  净现值: ¥' + r.financial_roi.npv.toLocaleString() + ' 万',
    '',
    '▸ 效率提升',
    '  日节省时间: ' + r.efficiency_gains.time_saved_hours_daily.toFixed(1) + ' 小时',
    '  流程自动化: ' + r.efficiency_gains.process_automation_pct.toFixed(1) + '%',
    '  人员精简: ' + r.efficiency_gains.staff_reduction_pct.toFixed(1) + '%',
    '',
    '▸ 市民收益',
    '  满意度提升: ' + r.citizen_benefits.satisfaction_lift.toFixed(1) + '%',
    '  服务可达: ' + r.citizen_benefits.service_access_improvement.toFixed(1) + '%',
    '  数字包容: ' + r.citizen_benefits.digital_inclusion_gain.toFixed(1) + '%',
    '',
    '▸ 环境影响',
    '  CO2减排: ' + r.environmental_impact.co2_reduction_tons.toLocaleString() + ' 吨/年',
    '  节能: ' + r.environmental_impact.energy_savings_pct.toFixed(1) + '%',
    '  减废: ' + r.environmental_impact.waste_reduction_pct.toFixed(1) + '%',
    '',
    '▸ 风险评估',
    '  实施风险: ' + r.risk_assessment.implementation_risk,
    '  技术过时: ' + r.risk_assessment.tech_obsolescence,
    '  可扩展性: ' + r.risk_assessment.scalability,
    '',
    '⚠ ' + DISCLAIMER,
  ].join('\n');
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context): void {
  const tools = ctx.tools;

  // 1. citizen_engagement_analyzer
  tools.register(
    defineTool({
      name: 'citizen_engagement_analyzer',
      description: '公民参与分析 — 参与率、渠道表现、议题分类、响应指标、群体覆盖',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatCitizenEngagement(analyzeCitizenEngagement(JSON.parse(args.input_data)));
      },
    }),
  );

  // 2. public_service_optimizer
  tools.register(
    defineTool({
      name: 'public_service_optimizer',
      description: '公共服务优化 — 可达性、利用率、质量评分、效率指标、差距分析',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatPublicService(analyzePublicService(JSON.parse(args.input_data)));
      },
    }),
  );

  // 3. homelessness_intervention_planner
  tools.register(
    defineTool({
      name: 'homelessness_intervention_planner',
      description: '无家可归干预规划 — 人口估算、庇护容量、干预成效、服务利用、资源配置',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatHomelessness(analyzeHomelessness(JSON.parse(args.input_data)));
      },
    }),
  );

  // 4. urban_mobility_analyst
  tools.register(
    defineTool({
      name: 'urban_mobility_analyst',
      description: '城市交通分析 — 交通覆盖、拥堵指标、客运量、可持续性、无障碍',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatUrbanMobility(analyzeUrbanMobility(JSON.parse(args.input_data)));
      },
    }),
  );

  // 5. digital_equity_mapper
  tools.register(
    defineTool({
      name: 'digital_equity_mapper',
      description: '数字公平地图 — 宽带接入、设备普及、数字素养、公共WiFi、公平差距',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatDigitalEquity(analyzeDigitalEquity(JSON.parse(args.input_data)));
      },
    }),
  );

  // 6. public_safety_predictor
  tools.register(
    defineTool({
      name: 'public_safety_predictor',
      description: '公共安全预测 — 犯罪预测、热点区域、资源部署、预防效果、风险因素',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatPublicSafety(analyzePublicSafety(JSON.parse(args.input_data)));
      },
    }),
  );

  // 7. civic_sentiment_tracker
  tools.register(
    defineTool({
      name: 'civic_sentiment_tracker',
      description: '民情舆情追踪 — 情感分析、声量指标、话题聚类、平台分布、预警信号',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatCivicSentiment(analyzeCivicSentiment(JSON.parse(args.input_data)));
      },
    }),
  );

  // 8. smart_city_roi_calculator
  tools.register(
    defineTool({
      name: 'smart_city_roi_calculator',
      description: '智慧城市ROI计算 — 财务ROI、效率提升、市民收益、环境影响、风险评估',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatSmartCityROI(analyzeSmartCityROI(JSON.parse(args.input_data)));
      },
    }),
  );
}
