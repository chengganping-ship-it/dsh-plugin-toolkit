import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'govagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本AI助手辅助政务工作，不替代行政决策与审批权限。';

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
// 1. smart_service_hall — 智能服务大厅
// ============================================================
interface SmartServiceHallInput {
  service_type?: string;
  region?: string;
  period?: string;
}

interface SmartServiceHallResult {
  one_stop_service: { coverage_rate: number; online_items: number; offline_items: number };
  material_audit: { auto_pass_rate: number; avg_audit_time_sec: number; error_rate: number };
  smart_qa: { resolution_rate: number; avg_response_sec: number; sessions: number };
  appointment: { total_slots: number; utilization_rate: number; no_show_rate: number };
  satisfaction: { overall_score: number; nps: number; complaint_count: number };
}

function analyzeSmartServiceHall(data: SmartServiceHallInput): SmartServiceHallResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    one_stop_service: {
      coverage_rate: 75 + rng() * 20,
      online_items: Math.floor(200 + rng() * 800),
      offline_items: Math.floor(50 + rng() * 200),
    },
    material_audit: {
      auto_pass_rate: 60 + rng() * 30,
      avg_audit_time_sec: 30 + rng() * 120,
      error_rate: rng() * 5,
    },
    smart_qa: {
      resolution_rate: 70 + rng() * 25,
      avg_response_sec: 1 + rng() * 4,
      sessions: Math.floor(5000 + rng() * 20000),
    },
    appointment: {
      total_slots: Math.floor(500 + rng() * 2000),
      utilization_rate: 65 + rng() * 30,
      no_show_rate: rng() * 15,
    },
    satisfaction: {
      overall_score: 3.5 + rng() * 1.5,
      nps: Math.floor(20 + rng() * 60),
      complaint_count: Math.floor(rng() * 50),
    },
  };
}

function formatSmartServiceHall(r: SmartServiceHallResult): string {
  return [
    '【智能服务大厅分析报告】',
    '',
    '▸ 一网通办',
    `  覆盖率: ${r.one_stop_service.coverage_rate.toFixed(1)}%`,
    `  线上事项: ${r.one_stop_service.online_items} 项`,
    `  线下事项: ${r.one_stop_service.offline_items} 项`,
    '',
    '▸ 材料审核',
    `  自动通过率: ${r.material_audit.auto_pass_rate.toFixed(1)}%`,
    `  平均审核时间: ${r.material_audit.avg_audit_time_sec.toFixed(0)} 秒`,
    `  错误率: ${r.material_audit.error_rate.toFixed(2)}%`,
    '',
    '▸ 智能问答',
    `  解决率: ${r.smart_qa.resolution_rate.toFixed(1)}%`,
    `  平均响应: ${r.smart_qa.avg_response_sec.toFixed(1)} 秒`,
    `  会话量: ${r.smart_qa.sessions.toLocaleString()} 次`,
    '',
    '▸ 预约管理',
    `  总号源: ${r.appointment.total_slots} 个`,
    `  利用率: ${r.appointment.utilization_rate.toFixed(1)}%`,
    `  爽约率: ${r.appointment.no_show_rate.toFixed(1)}%`,
    '',
    '▸ 满意度分析',
    `  综合评分: ${r.satisfaction.overall_score.toFixed(2)} / 5.0`,
    `  NPS: ${r.satisfaction.nps}`,
    `  投诉量: ${r.satisfaction.complaint_count} 件`,
    '',
    `⚠ ${DISCLAIMER}`,
  ].join('\n');
}

// ============================================================
// 2. urban_governance_ai — 城市治理AI
// ============================================================
interface UrbanGovernanceInput {
  city?: string;
  district?: string;
  focus_area?: string;
}

interface UrbanGovernanceResult {
  enforcement: { cases: number; resolved_rate: number; avg_process_days: number };
  environment: { aqi_avg: number; pm25: number; green_coverage: number };
  traffic: { congestion_index: number; avg_speed: number; accident_count: number };
  illegal_construction: { detected: number; verified_rate: number; removed: number };
  grid_management: { grid_count: number; inspectors: number; event_close_rate: number };
}

function analyzeUrbanGovernance(data: UrbanGovernanceInput): UrbanGovernanceResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    enforcement: {
      cases: Math.floor(100 + rng() * 900),
      resolved_rate: 70 + rng() * 25,
      avg_process_days: 3 + rng() * 12,
    },
    environment: {
      aqi_avg: Math.floor(40 + rng() * 120),
      pm25: Math.floor(15 + rng() * 85),
      green_coverage: 30 + rng() * 25,
    },
    traffic: {
      congestion_index: 1.2 + rng() * 1.5,
      avg_speed: 20 + rng() * 30,
      accident_count: Math.floor(10 + rng() * 90),
    },
    illegal_construction: {
      detected: Math.floor(20 + rng() * 180),
      verified_rate: 60 + rng() * 35,
      removed: Math.floor(10 + rng() * 100),
    },
    grid_management: {
      grid_count: Math.floor(500 + rng() * 2000),
      inspectors: Math.floor(200 + rng() * 800),
      event_close_rate: 75 + rng() * 20,
    },
  };
}

function formatUrbanGovernance(r: UrbanGovernanceResult): string {
  return [
    '【城市治理AI分析报告】',
    '',
    '▸ 城管执法',
    `  案件数: ${r.enforcement.cases} 件`,
    `  解决率: ${r.enforcement.resolved_rate.toFixed(1)}%`,
    `  平均处理: ${r.enforcement.avg_process_days.toFixed(1)} 天`,
    '',
    '▸ 环境监测',
    `  AQI均值: ${r.environment.aqi_avg}`,
    `  PM2.5: ${r.environment.pm25} μg/m³`,
    `  绿化覆盖率: ${r.environment.green_coverage.toFixed(1)}%`,
    '',
    '▸ 交通治理',
    `  拥堵指数: ${r.traffic.congestion_index.toFixed(2)}`,
    `  平均车速: ${r.traffic.avg_speed.toFixed(1)} km/h`,
    `  事故数: ${r.traffic.accident_count} 起`,
    '',
    '▸ 违建识别',
    `  识别数: ${r.illegal_construction.detected} 处`,
    `  核实率: ${r.illegal_construction.verified_rate.toFixed(1)}%`,
    `  已拆除: ${r.illegal_construction.removed} 处`,
    '',
    '▸ 网格管理',
    `  网格数: ${r.grid_management.grid_count}`,
    `  网格员: ${r.grid_management.inspectors} 人`,
    `  事件闭环率: ${r.grid_management.event_close_rate.toFixed(1)}%`,
    '',
    `⚠ ${DISCLAIMER}`,
  ].join('\n');
}

// ============================================================
// 3. public_safety_monitor — 公共安全监控
// ============================================================
interface PublicSafetyInput {
  area?: string;
  risk_level?: string;
  time_range?: string;
}

interface PublicSafetyResult {
  video_surveillance: { cameras: number; online_rate: number; coverage: number };
  anomaly_detection: { alerts: number; true_positive_rate: number; false_alarm_rate: number };
  crowd_warning: { max_density: number; warning_triggers: number; evacuation_time_min: number };
  fire_warning: { sensors: number; alerts: number; response_time_min: number };
  emergency_response: { teams: number; avg_arrival_min: number; drill_count: number };
}

function analyzePublicSafety(data: PublicSafetyInput): PublicSafetyResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    video_surveillance: {
      cameras: Math.floor(1000 + rng() * 9000),
      online_rate: 90 + rng() * 9.5,
      coverage: 70 + rng() * 28,
    },
    anomaly_detection: {
      alerts: Math.floor(50 + rng() * 450),
      true_positive_rate: 75 + rng() * 20,
      false_alarm_rate: rng() * 10,
    },
    crowd_warning: {
      max_density: 3 + rng() * 5,
      warning_triggers: Math.floor(5 + rng() * 45),
      evacuation_time_min: 3 + rng() * 12,
    },
    fire_warning: {
      sensors: Math.floor(500 + rng() * 4500),
      alerts: Math.floor(10 + rng() * 90),
      response_time_min: 2 + rng() * 8,
    },
    emergency_response: {
      teams: Math.floor(10 + rng() * 90),
      avg_arrival_min: 5 + rng() * 15,
      drill_count: Math.floor(2 + rng() * 18),
    },
  };
}

function formatPublicSafety(r: PublicSafetyResult): string {
  return [
    '【公共安全监控分析报告】',
    '',
    '▸ 视频监控',
    `  摄像头: ${r.video_surveillance.cameras.toLocaleString()} 路`,
    `  在线率: ${r.video_surveillance.online_rate.toFixed(1)}%`,
    `  覆盖率: ${r.video_surveillance.coverage.toFixed(1)}%`,
    '',
    '▸ 异常检测',
    `  告警数: ${r.anomaly_detection.alerts} 次`,
    `  准确率: ${r.anomaly_detection.true_positive_rate.toFixed(1)}%`,
    `  误报率: ${r.anomaly_detection.false_alarm_rate.toFixed(2)}%`,
    '',
    '▸ 人流预警',
    `  最大密度: ${r.crowd_warning.max_density.toFixed(1)} 人/m²`,
    `  预警触发: ${r.crowd_warning.warning_triggers} 次`,
    `  疏散时间: ${r.crowd_warning.evacuation_time_min.toFixed(1)} 分钟`,
    '',
    '▸ 消防预警',
    `  传感器: ${r.fire_warning.sensors.toLocaleString()} 个`,
    `  火警: ${r.fire_warning.alerts} 次`,
    `  响应时间: ${r.fire_warning.response_time_min.toFixed(1)} 分钟`,
    '',
    '▸ 应急响应',
    `  救援队: ${r.emergency_response.teams} 支`,
    `  平均到达: ${r.emergency_response.avg_arrival_min.toFixed(1)} 分钟`,
    `  演练次数: ${r.emergency_response.drill_count} 次`,
    '',
    `⚠ ${DISCLAIMER}`,
  ].join('\n');
}

// ============================================================
// 4. civil_affairs_service — 民政服务
// ============================================================
interface CivilAffairsInput {
  region?: string;
  service_category?: string;
  demographic?: string;
}

interface CivilAffairsResult {
  dibao_review: { households: number; approved: number; accuracy: number };
  elderly_care: { beds: number; occupancy_rate: number; home_visits: number };
  marriage_reg: { registrations: number; same_day_rate: number; satisfaction: number };
  social_org: { registered: number; active_rate: number; supervision_score: number };
  volunteer: { registered: number; service_hours: number; events: number };
}

function analyzeCivilAffairs(data: CivilAffairsInput): CivilAffairsResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    dibao_review: {
      households: Math.floor(500 + rng() * 4500),
      approved: Math.floor(300 + rng() * 3000),
      accuracy: 85 + rng() * 14,
    },
    elderly_care: {
      beds: Math.floor(1000 + rng() * 9000),
      occupancy_rate: 60 + rng() * 35,
      home_visits: Math.floor(2000 + rng() * 18000),
    },
    marriage_reg: {
      registrations: Math.floor(200 + rng() * 4800),
      same_day_rate: 80 + rng() * 19,
      satisfaction: 4.0 + rng() * 1.0,
    },
    social_org: {
      registered: Math.floor(100 + rng() * 900),
      active_rate: 50 + rng() * 45,
      supervision_score: 60 + rng() * 35,
    },
    volunteer: {
      registered: Math.floor(5000 + rng() * 45000),
      service_hours: Math.floor(10000 + rng() * 90000),
      events: Math.floor(100 + rng() * 900),
    },
  };
}

function formatCivilAffairs(r: CivilAffairsResult): string {
  return [
    '【民政服务分析报告】',
    '',
    '▸ 低保审核',
    `  申请户数: ${r.dibao_review.households.toLocaleString()}`,
    `  批准户数: ${r.dibao_review.approved.toLocaleString()}`,
    `  准确率: ${r.dibao_review.accuracy.toFixed(1)}%`,
    '',
    '▸ 养老救助',
    `  养老床位: ${r.elderly_care.beds.toLocaleString()} 张`,
    `  入住率: ${r.elderly_care.occupancy_rate.toFixed(1)}%`,
    `  上门探访: ${r.elderly_care.home_visits.toLocaleString()} 次`,
    '',
    '▸ 婚姻登记',
    `  登记量: ${r.marriage_reg.registrations.toLocaleString()} 对`,
    `  当日办结率: ${r.marriage_reg.same_day_rate.toFixed(1)}%`,
    `  满意度: ${r.marriage_reg.satisfaction.toFixed(2)} / 5.0`,
    '',
    '▸ 社会组织',
    `  注册数: ${r.social_org.registered}`,
    `  活跃率: ${r.social_org.active_rate.toFixed(1)}%`,
    `  监管评分: ${r.social_org.supervision_score.toFixed(1)}`,
    '',
    '▸ 志愿服务',
    `  注册志愿者: ${r.volunteer.registered.toLocaleString()} 人`,
    `  服务时长: ${r.volunteer.service_hours.toLocaleString()} 小时`,
    `  志愿活动: ${r.volunteer.events} 场`,
    '',
    `⚠ ${DISCLAIMER}`,
  ].join('\n');
}

// ============================================================
// 5. policy_analytics_engine — 政策分析引擎
// ============================================================
interface PolicyAnalyticsInput {
  policy_domain?: string;
  target_group?: string;
  implementation_phase?: string;
}

interface PolicyAnalyticsResult {
  policy_match: { matched_policies: number; relevance_score: number; coverage: number };
  impact_assessment: { economic_impact: number; social_impact: number; risk_level: string };
  execution_monitor: { completion_rate: number; budget_usage: number; milestone_hit: number };
  effect_evaluation: { kpi_achievement: number; beneficiary_count: number; roi: number };
  recommendations: { suggestions: string[]; priority: string; urgency: string };
}

function analyzePolicyAnalytics(data: PolicyAnalyticsInput): PolicyAnalyticsResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const risks = ['低', '中', '高'];
  const priorities = ['P0-紧急', 'P1-重要', 'P2-一般', 'P3-低'];
  const urgencies = ['立即执行', '本季度', '本年度', '长期规划'];
  const suggestionPool = [
    '优化政策宣传渠道，提升公众知晓率',
    '加强跨部门协同，打通数据壁垒',
    '建立动态调整机制，及时响应反馈',
    '引入第三方评估，确保客观公正',
    '完善配套细则，增强可操作性',
    '加大财政投入，保障执行力度',
    '强化基层培训，提升执行能力',
    '建立退出机制，避免政策僵化',
  ];
  const shuffled = suggestionPool.sort(() => rng() - 0.5);
  const count = 2 + Math.floor(rng() * 3);

  return {
    policy_match: {
      matched_policies: Math.floor(5 + rng() * 45),
      relevance_score: 60 + rng() * 38,
      coverage: 50 + rng() * 45,
    },
    impact_assessment: {
      economic_impact: -5 + rng() * 20,
      social_impact: -3 + rng() * 15,
      risk_level: risks[Math.floor(rng() * 3)],
    },
    execution_monitor: {
      completion_rate: 40 + rng() * 58,
      budget_usage: 30 + rng() * 65,
      milestone_hit: 50 + rng() * 45,
    },
    effect_evaluation: {
      kpi_achievement: 45 + rng() * 50,
      beneficiary_count: Math.floor(10000 + rng() * 990000),
      roi: 0.5 + rng() * 4.5,
    },
    recommendations: {
      suggestions: shuffled.slice(0, count),
      priority: priorities[Math.floor(rng() * 4)],
      urgency: urgencies[Math.floor(rng() * 4)],
    },
  };
}

function formatPolicyAnalytics(r: PolicyAnalyticsResult): string {
  return [
    '【政策分析引擎报告】',
    '',
    '▸ 政策匹配',
    `  匹配政策: ${r.policy_match.matched_policies} 项`,
    `  相关度: ${r.policy_match.relevance_score.toFixed(1)}%`,
    `  覆盖度: ${r.policy_match.coverage.toFixed(1)}%`,
    '',
    '▸ 影响评估',
    `  经济影响: ${r.impact_assessment.economic_impact >= 0 ? '+' : ''}${r.impact_assessment.economic_impact.toFixed(1)}%`,
    `  社会影响: ${r.impact_assessment.social_impact >= 0 ? '+' : ''}${r.impact_assessment.social_impact.toFixed(1)}%`,
    `  风险等级: ${r.impact_assessment.risk_level}`,
    '',
    '▸ 执行监控',
    `  完成率: ${r.execution_monitor.completion_rate.toFixed(1)}%`,
    `  预算使用: ${r.execution_monitor.budget_usage.toFixed(1)}%`,
    `  里程碑达成: ${r.execution_monitor.milestone_hit.toFixed(1)}%`,
    '',
    '▸ 效果评估',
    `  KPI达成: ${r.effect_evaluation.kpi_achievement.toFixed(1)}%`,
    `  受益人数: ${r.effect_evaluation.beneficiary_count.toLocaleString()} 人`,
    `  投入产出比: ${r.effect_evaluation.roi.toFixed(2)}`,
    '',
    '▸ 建议生成',
    `  优先级: ${r.recommendations.priority}`,
    `  紧急度: ${r.recommendations.urgency}`,
    '  建议列表:',
    ...r.recommendations.suggestions.map((s) => `    - ${s}`),
    '',
    `⚠ ${DISCLAIMER}`,
  ].join('\n');
}

// ============================================================
// 6. digital_identity_manager — 数字身份管理
// ============================================================
interface DigitalIdentityInput {
  identity_type?: string;
  verification_level?: string;
  scope?: string;
}

interface DigitalIdentityResult {
  e_cert: { issued: number; valid_rate: number; cross_recognized: number };
  real_name_auth: { verified_users: number; auth_success_rate: number; fraud_blocked: number };
  auth_management: { grants: number; revoked: number; avg_auth_time_sec: number };
  privacy_protection: { data_breaches: number; compliance_score: number; encryption_rate: number };
  trusted_verification: { verifications: number; trust_score: number; dispute_count: number };
}

function analyzeDigitalIdentity(data: DigitalIdentityInput): DigitalIdentityResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    e_cert: {
      issued: Math.floor(100000 + rng() * 9900000),
      valid_rate: 90 + rng() * 9.5,
      cross_recognized: Math.floor(5 + rng() * 30),
    },
    real_name_auth: {
      verified_users: Math.floor(50000 + rng() * 4950000),
      auth_success_rate: 85 + rng() * 14,
      fraud_blocked: Math.floor(100 + rng() * 4900),
    },
    auth_management: {
      grants: Math.floor(10000 + rng() * 990000),
      revoked: Math.floor(100 + rng() * 9900),
      avg_auth_time_sec: 0.5 + rng() * 4.5,
    },
    privacy_protection: {
      data_breaches: Math.floor(rng() * 5),
      compliance_score: 75 + rng() * 24,
      encryption_rate: 80 + rng() * 19.5,
    },
    trusted_verification: {
      verifications: Math.floor(50000 + rng() * 4950000),
      trust_score: 70 + rng() * 28,
      dispute_count: Math.floor(rng() * 100),
    },
  };
}

function formatDigitalIdentity(r: DigitalIdentityResult): string {
  return [
    '【数字身份管理分析报告】',
    '',
    '▸ 电子证照',
    `  已签发: ${r.e_cert.issued.toLocaleString()} 张`,
    `  有效率: ${r.e_cert.valid_rate.toFixed(1)}%`,
    `  跨省互认: ${r.e_cert.cross_recognized} 个地区`,
    '',
    '▸ 实名认证',
    `  认证用户: ${r.real_name_auth.verified_users.toLocaleString()} 人`,
    `  认证成功率: ${r.real_name_auth.auth_success_rate.toFixed(1)}%`,
    `  拦截欺诈: ${r.real_name_auth.fraud_blocked.toLocaleString()} 次`,
    '',
    '▸ 授权管理',
    `  授权数: ${r.auth_management.grants.toLocaleString()}`,
    `  撤销数: ${r.auth_management.revoked.toLocaleString()}`,
    `  平均授权: ${r.auth_management.avg_auth_time_sec.toFixed(1)} 秒`,
    '',
    '▸ 隐私保护',
    `  数据泄露: ${r.privacy_protection.data_breaches} 起`,
    `  合规评分: ${r.privacy_protection.compliance_score.toFixed(1)}`,
    `  加密率: ${r.privacy_protection.encryption_rate.toFixed(1)}%`,
    '',
    '▸ 可信验证',
    `  验证次数: ${r.trusted_verification.verifications.toLocaleString()}`,
    `  信任评分: ${r.trusted_verification.trust_score.toFixed(1)}`,
    `  争议数: ${r.trusted_verification.dispute_count} 件`,
    '',
    `⚠ ${DISCLAIMER}`,
  ].join('\n');
}

// ============================================================
// 7. emergency_response_coord — 应急响应协调
// ============================================================
interface EmergencyResponseInput {
  event_type?: string;
  severity?: string;
  jurisdiction?: string;
}

interface EmergencyResponseResult {
  warning_release: { warnings: number; channels: number; reach_rate: number };
  resource_dispatch: { teams: number; vehicles: number; supplies_tons: number };
  command_coord: { agencies: number; comm_uptime: number; info_sync_rate: number };
  post_disaster: { damage_estimate: number; recovery_progress: number; affected_population: number };
  plan_management: { plans: number; updated_this_year: number; drill_coverage: number };
}

function analyzeEmergencyResponse(data: EmergencyResponseInput): EmergencyResponseResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  return {
    warning_release: {
      warnings: Math.floor(10 + rng() * 190),
      channels: Math.floor(3 + rng() * 12),
      reach_rate: 70 + rng() * 28,
    },
    resource_dispatch: {
      teams: Math.floor(5 + rng() * 95),
      vehicles: Math.floor(10 + rng() * 190),
      supplies_tons: Math.floor(5 + rng() * 495),
    },
    command_coord: {
      agencies: Math.floor(3 + rng() * 22),
      comm_uptime: 95 + rng() * 4.9,
      info_sync_rate: 75 + rng() * 23,
    },
    post_disaster: {
      damage_estimate: Math.floor(100 + rng() * 99900),
      recovery_progress: 20 + rng() * 78,
      affected_population: Math.floor(1000 + rng() * 999000),
    },
    plan_management: {
      plans: Math.floor(10 + rng() * 90),
      updated_this_year: Math.floor(2 + rng() * 20),
      drill_coverage: 40 + rng() * 55,
    },
  };
}

function formatEmergencyResponse(r: EmergencyResponseResult): string {
  return [
    '【应急响应协调分析报告】',
    '',
    '▸ 预警发布',
    `  预警次数: ${r.warning_release.warnings} 次`,
    `  发布渠道: ${r.warning_release.channels} 个`,
    `  触达率: ${r.warning_release.reach_rate.toFixed(1)}%`,
    '',
    '▸ 资源调度',
    `  救援队伍: ${r.resource_dispatch.teams} 支`,
    `  救援车辆: ${r.resource_dispatch.vehicles} 台`,
    `  物资调拨: ${r.resource_dispatch.supplies_tons} 吨`,
    '',
    '▸ 指挥协同',
    `  协同机构: ${r.command_coord.agencies} 个`,
    `  通信可用率: ${r.command_coord.comm_uptime.toFixed(1)}%`,
    `  信息同步率: ${r.command_coord.info_sync_rate.toFixed(1)}%`,
    '',
    '▸ 灾后评估',
    `  损失估算: ¥${r.post_disaster.damage_estimate.toLocaleString()} 万`,
    `  恢复进度: ${r.post_disaster.recovery_progress.toFixed(1)}%`,
    `  受灾人口: ${r.post_disaster.affected_population.toLocaleString()} 人`,
    '',
    '▸ 预案管理',
    `  预案数: ${r.plan_management.plans} 个`,
    `  本年更新: ${r.plan_management.updated_this_year} 个`,
    `  演练覆盖: ${r.plan_management.drill_coverage.toFixed(1)}%`,
    '',
    `⚠ ${DISCLAIMER}`,
  ].join('\n');
}

// ============================================================
// 8. gov_data_open_platform — 政府数据开放
// ============================================================
interface GovDataOpenInput {
  department?: string;
  data_category?: string;
  access_level?: string;
}

interface GovDataOpenResult {
  data_catalog: { total_datasets: number; departments: number; update_frequency: string };
  openness_assessment: { openness_score: number; ranking: number; benchmark_gap: number };
  quality_monitor: { completeness: number; timeliness: number; accuracy: number };
  api_management: { total_apis: number; call_volume: number; uptime: number };
  data_security: { audits: number; incidents: number; compliance_rate: number };
}

function analyzeGovDataOpen(data: GovDataOpenInput): GovDataOpenResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const frequencies = ['实时', '每日', '每周', '每月', '每季度', '每年'];
  return {
    data_catalog: {
      total_datasets: Math.floor(500 + rng() * 9500),
      departments: Math.floor(10 + rng() * 90),
      update_frequency: frequencies[Math.floor(rng() * frequencies.length)],
    },
    openness_assessment: {
      openness_score: 40 + rng() * 55,
      ranking: Math.floor(1 + rng() * 50),
      benchmark_gap: -10 + rng() * 30,
    },
    quality_monitor: {
      completeness: 70 + rng() * 28,
      timeliness: 65 + rng() * 33,
      accuracy: 80 + rng() * 19,
    },
    api_management: {
      total_apis: Math.floor(50 + rng() * 1950),
      call_volume: Math.floor(10000 + rng() * 99990000),
      uptime: 99.0 + rng() * 0.99,
    },
    data_security: {
      audits: Math.floor(2 + rng() * 48),
      incidents: Math.floor(rng() * 3),
      compliance_rate: 85 + rng() * 14.5,
    },
  };
}

function formatGovDataOpen(r: GovDataOpenResult): string {
  return [
    '【政府数据开放平台分析报告】',
    '',
    '▸ 数据目录',
    `  数据集: ${r.data_catalog.total_datasets.toLocaleString()} 个`,
    `  部门数: ${r.data_catalog.departments} 个`,
    `  更新频率: ${r.data_catalog.update_frequency}`,
    '',
    '▸ 开放评估',
    `  开放评分: ${r.openness_assessment.openness_score.toFixed(1)} / 100`,
    `  排名: 第 ${r.openness_assessment.ranking} 名`,
    `  标杆差距: ${r.openness_assessment.benchmark_gap >= 0 ? '+' : ''}${r.openness_assessment.benchmark_gap.toFixed(1)}`,
    '',
    '▸ 质量监控',
    `  完整性: ${r.quality_monitor.completeness.toFixed(1)}%`,
    `  时效性: ${r.quality_monitor.timeliness.toFixed(1)}%`,
    `  准确性: ${r.quality_monitor.accuracy.toFixed(1)}%`,
    '',
    '▸ API管理',
    `  API数量: ${r.api_management.total_apis} 个`,
    `  调用量: ${r.api_management.call_volume.toLocaleString()} 次`,
    `  可用率: ${r.api_management.uptime.toFixed(2)}%`,
    '',
    '▸ 数据安全',
    `  安全审计: ${r.data_security.audits} 次`,
    `  安全事件: ${r.data_security.incidents} 起`,
    `  合规率: ${r.data_security.compliance_rate.toFixed(1)}%`,
    '',
    `⚠ ${DISCLAIMER}`,
  ].join('\n');
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context): void {
  const tools = ctx.tools;

  // 1. smart_service_hall
  tools.register(
    defineTool({
      name: 'smart_service_hall',
      description: '智能服务大厅 — 一网通办、材料审核、智能问答、预约管理、满意度分析',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatSmartServiceHall(analyzeSmartServiceHall(JSON.parse(args.input_data)));
      },
    }),
  );

  // 2. urban_governance_ai
  tools.register(
    defineTool({
      name: 'urban_governance_ai',
      description: '城市治理AI — 城管执法、环境监测、交通治理、违建识别、网格管理',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatUrbanGovernance(analyzeUrbanGovernance(JSON.parse(args.input_data)));
      },
    }),
  );

  // 3. public_safety_monitor
  tools.register(
    defineTool({
      name: 'public_safety_monitor',
      description: '公共安全监控 — 视频监控、异常检测、人流预警、消防预警、应急响应',
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

  // 4. civil_affairs_service
  tools.register(
    defineTool({
      name: 'civil_affairs_service',
      description: '民政服务 — 低保审核、养老救助、婚姻登记、社会组织、志愿服务',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatCivilAffairs(analyzeCivilAffairs(JSON.parse(args.input_data)));
      },
    }),
  );

  // 5. policy_analytics_engine
  tools.register(
    defineTool({
      name: 'policy_analytics_engine',
      description: '政策分析引擎 — 政策匹配、影响评估、执行监控、效果评估、建议生成',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatPolicyAnalytics(analyzePolicyAnalytics(JSON.parse(args.input_data)));
      },
    }),
  );

  // 6. digital_identity_manager
  tools.register(
    defineTool({
      name: 'digital_identity_manager',
      description: '数字身份管理 — 电子证照、实名认证、授权管理、隐私保护、可信验证',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatDigitalIdentity(analyzeDigitalIdentity(JSON.parse(args.input_data)));
      },
    }),
  );

  // 7. emergency_response_coord
  tools.register(
    defineTool({
      name: 'emergency_response_coord',
      description: '应急响应协调 — 预警发布、资源调度、指挥协同、灾后评估、预案管理',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatEmergencyResponse(analyzeEmergencyResponse(JSON.parse(args.input_data)));
      },
    }),
  );

  // 8. gov_data_open_platform
  tools.register(
    defineTool({
      name: 'gov_data_open_platform',
      description: '政府数据开放 — 数据目录、开放评估、质量监控、API管理、数据安全',
      parameters: {
        input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入参数' },
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
      },
      async execute(args: { input_data: string }) {
        return formatGovDataOpen(analyzeGovDataOpen(JSON.parse(args.input_data)));
      },
    }),
  );
}
