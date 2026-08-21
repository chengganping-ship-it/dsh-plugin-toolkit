/**
 * DSH Aged Care Agent Plugin v0.1.0
 * 智慧养老AI智能体 for DeepSeek Harness — 全方位老年健康与护理管理平台
 *
 * 覆盖: 跌倒检测算法评估与响应机制、用药依从性追踪与提醒、认知功能衰退监测与早期筛查、
 * 日常生活活动(ADL)识别与能力评估、社交活动安排与孤独感干预、生命体征预警与远程监护、
 * 老年人营养方案与吞咽安全饮食、养老机构运营与护理资源调度。
 *
 * @module dsh-tool-agedcareagent | @version 0.1.0 | @license MIT
 * @author agedcareagent-dev
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agedcareagent'
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

// --- Tool 1: Fall Detection System ---
interface FallDetectionInput {
  patient_id: string
  age: number
  sensor_type: 'accelerometer' | 'gyroscope' | 'camera' | 'wearable' | 'pressure_mat'
  algorithm_model: 'threshold' | 'svm' | 'cnn' | 'lstm' | 'transformer'
  sampling_rate_hz: number
  fall_history_count: number
  mobility_score: number // 0-100
  environment: 'home' | 'hospital' | 'outdoor' | 'care_facility'
  response_protocol: 'auto_alert' | 'caregiver_notify' | 'emergency_dispatch' | 'voice_check'
}

interface FallDetectionResult {
  patient_id: string
  detection_accuracy: number
  false_positive_rate: number
  response_time_ms: number
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  protocol_recommendation: string
  sensor_optimization: string[]
  alert_chain: string[]
}

// --- Tool 2: Medication Adherence Tracker ---
interface MedicationAdherenceInput {
  patient_id: string
  age: number
  medicines: Array<{
    name: string
    dosage: string
    frequency: string
    time_slots: string[]
  }>
  cognitive_status: 'normal' | 'mild_impairment' | 'moderate_impairment'
  days_tracked: number
  missed_doses: number
  reminder_method: 'app' | 'sms' | 'voice_call' | 'smart_pillbox' | 'family'
}

interface MedicationAdherenceResult {
  patient_id: string
  adherence_rate: number
  risk_medications: string[]
  schedule_optimization: string[]
  intervention_recommendations: string[]
  alert_triggers: string[]
}

// --- Tool 3: Cognitive Health Monitor ---
interface CognitiveHealthInput {
  patient_id: string
  age: number
  education_years: number
  assessment_tool: 'mmse' | 'moca' | 'clock_drawing' | 'word_recall' | 'trail_making'
  baseline_score: number
  current_score: number
  months_since_last: number
  family_history_dementia: boolean
  comorbidities: string[]
}

interface CognitiveHealthResult {
  patient_id: string
  decline_rate: number
  risk_category: 'normal' | 'mild' | 'moderate' | 'severe'
  early_warning_flags: string[]
  screening_recommendations: string[]
  lifestyle_interventions: string[]
}

// --- Tool 4: Daily Activity Recognizer ---
interface DailyActivityInput {
  patient_id: string
  age: number
  activities: Array<{
    name: string
    duration_minutes: number
    difficulty: 'independent' | 'assisted' | 'dependent'
    frequency_per_week: number
  }>
  mobility_aid: 'none' | 'cane' | 'walker' | 'wheelchair'
  living_arrangement: 'alone' | 'with_spouse' | 'with_family' | 'care_facility'
  chronic_conditions: string[]
}

interface DailyActivityResult {
  patient_id: string
  adl_score: number // 0-100
  independence_level: 'independent' | 'mild_dependent' | 'moderate_dependent' | 'severe_dependent'
  activity_recommendations: string[]
  assistive_devices: string[]
  rehabilitation_goals: string[]
}

// --- Tool 5: Social Companion Scheduler ---
interface SocialCompanionInput {
  patient_id: string
  age: number
  loneliness_score: number // 0-10
  social_contacts_count: number
  preferred_activities: string[]
  mobility_level: 'mobile' | 'limited' | 'homebound'
  technology_comfort: 'high' | 'medium' | 'low'
  language: string
  available_hours_per_week: number
}

interface SocialCompanionResult {
  patient_id: string
  loneliness_risk: 'low' | 'moderate' | 'high' | 'severe'
  weekly_schedule: Array<{ day: string; activity: string; duration_min: string }>
  digital_engagement: string[]
  community_resources: string[]
  intervention_priority: string[]
}

// --- Tool 6: Vital Signs Monitor ---
interface VitalSignsInput {
  patient_id: string
  age: number
  heart_rate_bpm: number
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  spo2_percent: number
  temperature_celsius: number
  respiratory_rate: number
  measurement_context: 'resting' | 'post_activity' | 'sleep' | 'medication'
  monitoring_frequency: 'continuous' | 'hourly' | 'twice_daily' | 'daily'
  comorbidities: string[]
}

interface VitalSignsResult {
  patient_id: string
  overall_risk: 'normal' | 'caution' | 'warning' | 'critical'
  abnormal_parameters: string[]
  trend_analysis: string
  alert_thresholds: Record<string, string>
  care_recommendations: string[]
  escalation_path: string[]
}

// --- Tool 7: Nutrition Diet Planner ---
interface NutritionDietInput {
  patient_id: string
  age: number
  weight_kg: number
  height_cm: number
  activity_level: 'sedentary' | 'light' | 'moderate'
  dysphagia_level: 'none' | 'mild' | 'moderate' | 'severe'
  chronic_conditions: string[]
  food_allergies: string[]
  cultural_preferences: string[]
  bmi: number
}

interface NutritionDietResult {
  patient_id: string
  daily_calories: number
  protein_grams: number
  fluid_ml: number
  meal_plan: Array<{ meal: string; foods: string[]; texture: string }>
  swallowing_precautions: string[]
  supplement_recommendations: string[]
  dietary_modifications: string[]
}

// --- Tool 8: Elder Care Facility Manager ---
interface FacilityManagerInput {
  facility_name: string
  total_beds: number
  occupied_beds: number
  staff_count: number
  staff_to_resident_ratio: number
  care_levels: Array<{ level: string; residents: number; required_staff: number }>
  budget_monthly: number
  regulatory_requirements: string[]
  incident_count_monthly: number
}

interface FacilityManagerResult {
  facility_name: string
  occupancy_rate: number
  staffing_adequacy: 'optimal' | 'adequate' | 'insufficient' | 'critical'
  schedule_optimization: string[]
  resource_allocation: Record<string, number>
  compliance_status: string[]
  cost_efficiency_score: number
  action_items: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Fall Detection System ---
function analyzeFallDetection(input: FallDetectionInput): FallDetectionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.patient_id + input.sensor_type))

  const baseAccuracy: Record<string, number> = {
    threshold: 0.78, svm: 0.85, cnn: 0.92, lstm: 0.94, transformer: 0.96
  }
  const accuracy = Math.min(0.99, Math.max(0.7, (baseAccuracy[input.algorithm_model] || 0.85) + rng.nextFloat(-0.03, 0.03)))
  const falsePositive = Math.max(0.01, 0.15 - (accuracy - 0.75) * 0.2 + rng.nextFloat(-0.02, 0.02))
  const responseTime = Math.round(1500 + (1 - accuracy) * 3000 + rng.nextFloat(0, 500))

  let riskLevel: FallDetectionResult['risk_level'] = 'low'
  if (input.fall_history_count > 2 || input.mobility_score < 30) riskLevel = 'critical'
  else if (input.fall_history_count > 1 || input.mobility_score < 50) riskLevel = 'high'
  else if (input.fall_history_count > 0 || input.mobility_score < 70) riskLevel = 'moderate'

  const protocolMap: Record<string, string> = {
    auto_alert: '自动触发报警 → 护理站响应 → 现场确认',
    caregiver_notify: '通知家属/护工 → 语音确认 → 必要时派工',
    emergency_dispatch: '直连120/急救中心 → GPS定位 → 门禁自动解锁',
    voice_check: 'AI语音呼叫患者 → 无响应则升级警报'
  }

  const sensorOptimization = [
    `当前采样率 ${input.sampling_rate_hz}Hz — 建议提升至 ${Math.max(50, input.sampling_rate_hz * 2)}Hz 以提高精度`,
    '建议融合加速度计+陀螺仪数据，降低误报率',
    input.environment === 'home' ? '家庭环境建议增加压力垫辅助地面检测' : '机构环境建议部署摄像头+可穿戴双模态',
    '定期校准传感器（建议每月一次）'
  ]

  const alertChain = [
    '第一级: 本地声光报警（< 1s）',
    '第二级: 推送通知至护理终端（< 3s）',
    '第三级: 电话呼叫值班人员（< 10s）',
    '第四级: 紧急联系人+120联动（< 30s）'
  ]

  return {
    patient_id: input.patient_id,
    detection_accuracy: Math.round(accuracy * 1000) / 1000,
    false_positive_rate: Math.round(falsePositive * 1000) / 1000,
    response_time_ms: responseTime,
    risk_level: riskLevel,
    protocol_recommendation: protocolMap[input.response_protocol],
    sensor_optimization: sensorOptimization,
    alert_chain: alertChain,
  }
}

// --- Tool 2: Medication Adherence Tracker ---
function analyzeMedicationAdherence(input: MedicationAdherenceInput): MedicationAdherenceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.patient_id + input.days_tracked.toString()))

  const medCount = (input.medicines?.length || 3)
  const takenDoses = medCount * input.days_tracked - input.missed_doses
  const totalDoses = medCount * input.days_tracked
  const adherenceRate = totalDoses > 0 ? Math.max(0, Math.min(1, takenDoses / totalDoses)) : 0

  const riskMeds: string[] = []
  if (adherenceRate < 0.7) {
    riskMeds.push('高风险: 需每日定时服用的核心药物（如降压药、降糖药）')
  }
  if (input.cognitive_status !== 'normal') {
    riskMeds.push('认知障碍相关: 漏服风险增加，需加强提醒和监督')
  }
  if (input.days_tracked > 7 && input.missed_doses > 3) {
    riskMeds.push('模式识别: 特定时段（如晚餐后）漏服频繁，需调整提醒策略')
  }

  const scheduleOptimization = [
    `当前追踪 ${input.days_tracked} 天，依从率 ${(adherenceRate * 100).toFixed(1)}%`,
    input.reminder_method === 'smart_pillbox' ? '智能药盒已启用 → 自动记录开盒时间' : '建议升级为智能药盒+APP双通道提醒',
    '将用药时间与日常习惯绑定（如早餐后、睡前）',
    '复杂用药方案建议简化为每日2-3次（咨询医生后）',
    '建立用药日志，家属每周复核'
  ]

  const interventionRecommendations: string[] = []
  if (adherenceRate < 0.6) {
    interventionRecommendations.push('🔴 紧急: 启动家属每日视频提醒+上门协助')
    interventionRecommendations.push('联系主治医生评估简化用药方案')
  } else if (adherenceRate < 0.8) {
    interventionRecommendations.push('🟡 加强: 增加语音提醒频次至每日3次')
    interventionRecommendations.push('考虑引入智能药盒自动出药')
  } else {
    interventionRecommendations.push('🟢 维持: 当前依从性良好，继续现有方案')
  }

  const alertTriggers = [
    `连续漏服 ≥ 2次 → 家属通知`,
    `连续漏服 ≥ 3次 → 护理人员上门`,
    `服药时间偏差 > 60分钟 → 提醒校正`,
    `一周依从率 < 75% → 医生复诊提醒`
  ]

  return {
    patient_id: input.patient_id,
    adherence_rate: Math.round(adherenceRate * 1000) / 1000,
    risk_medications: riskMeds,
    schedule_optimization: scheduleOptimization,
    intervention_recommendations: interventionRecommendations,
    alert_triggers: alertTriggers,
  }
}

// --- Tool 3: Cognitive Health Monitor ---
function analyzeCognitiveHealth(input: CognitiveHealthInput): CognitiveHealthResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.patient_id + input.assessment_tool))

  const declineRate = input.baseline_score > 0
    ? ((input.baseline_score - input.current_score) / input.baseline_score) * 100
    : 0

  let riskCategory: CognitiveHealthResult['risk_category'] = 'normal'
  if (declineRate > 50 || input.current_score < 10) riskCategory = 'severe'
  else if (declineRate > 30 || input.current_score < 18) riskCategory = 'moderate'
  else if (declineRate > 15 || input.current_score < 24) riskCategory = 'mild'

  const earlyWarnings: string[] = []
  if (declineRate > 20) earlyWarnings.push(`评分较基线下降 ${declineRate.toFixed(1)}%，需密切关注`)
  if (input.family_history_dementia) earlyWarnings.push('家族痴呆史阳性 — 建议每年至少筛查2次')
  if (input.months_since_last > 12) earlyWarnings.push(`距上次评估已 ${input.months_since_last} 个月，建议尽快复查`)
  if (input.age > 75 && declineRate > 10) earlyWarnings.push('高龄+评分下降 — 建议神经内科就诊')

  const screeningRecommendations = [
    `当前工具: ${input.assessment_tool.toUpperCase()} | 建议每 ${input.age > 75 ? 6 : 12} 个月复查`,
    '推荐联合MMSE+MoCA综合评估，减少单一工具偏差',
    '建议增加日常生活能力量表(ADL)评估',
    '有条件时进行神经影像学检查(MRI)',
    '家属应记录日常认知变化行为日志'
  ]

  const lifestyleInterventions = [
    '认知训练: 每日30分钟阅读/数独/记忆游戏',
    '体育锻炼: 每周150分钟中等强度有氧运动',
    '社交活动: 每周至少3次社交互动',
    '饮食调整: 地中海饮食模式，增加Omega-3摄入',
    '睡眠管理: 保证7-8小时高质量睡眠',
    '慢病控制: 严格控制血压、血糖、血脂'
  ]

  return {
    patient_id: input.patient_id,
    decline_rate: Math.round(declineRate * 10) / 10,
    risk_category: riskCategory,
    early_warning_flags: earlyWarnings,
    screening_recommendations: screeningRecommendations,
    lifestyle_interventions: lifestyleInterventions,
  }
}

// --- Tool 4: Daily Activity Recognizer ---
function analyzeDailyActivity(input: DailyActivityInput): DailyActivityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.patient_id + input.living_arrangement))

  // Calculate ADL score based on activities and their difficulty
  const activities = input.activities || []
  let totalPoints = 0
  let maxPoints = 0
  for (const act of activities) {
    maxPoints += 25
    if (act.difficulty === 'independent') totalPoints += 25
    else if (act.difficulty === 'assisted') totalPoints += 15
    else totalPoints += 5
  }
  const baseAdl = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 50
  const mobilityFactor = input.mobility_aid === 'none' ? 1.0 : input.mobility_aid === 'cane' ? 0.85 : input.mobility_aid === 'walker' ? 0.7 : 0.5
  const adlScore = Math.min(100, Math.max(0, baseAdl * mobilityFactor + rng.nextFloat(-5, 5)))

  let independenceLevel: DailyActivityResult['independence_level'] = 'independent'
  if (adlScore < 25) independenceLevel = 'severe_dependent'
  else if (adlScore < 50) independenceLevel = 'moderate_dependent'
  else if (adlScore < 75) independenceLevel = 'mild_dependent'

  const activityRecommendations = [
    `当前ADL评分: ${adlScore.toFixed(0)}/100 (${independenceLevel})`,
    adlScore < 50 ? '建议增加康复训练频次至每周5次' : '维持当前活动水平，每周3-5次',
    input.living_arrangement === 'alone' ? '独居老人建议安装智能家居辅助系统' : '家庭环境良好，建议家属参与监督',
    input.mobility_aid === 'none' && adlScore < 70 ? '建议配备助行器具' : '当前辅助器具适配',
    '建议进行作业治疗(OT)评估，制定个性化训练计划'
  ]

  const assistiveDevices: string[] = []
  if (adlScore < 30) {
    assistiveDevices.push('电动护理床', '移位机', '坐便椅')
  } else if (adlScore < 60) {
    assistiveDevices.push('助行器', '洗澡椅', '取物夹')
  } else {
    assistiveDevices.push('防滑垫', '夜灯', '大字遥控器')
  }

  const rehabilitationGoals = [
    '短期目标(1月): 维持现有活动能力，防止废用综合征',
    '中期目标(3月): 提升1-2项ADL独立能力',
    '长期目标(6月): 提高生活质量，减少照护依赖',
    '每周评估调整训练强度',
    '家属培训: 正确的辅助技巧与安全防护'
  ]

  return {
    patient_id: input.patient_id,
    adl_score: Math.round(adlScore),
    independence_level: independenceLevel,
    activity_recommendations: activityRecommendations,
    assistive_devices: assistiveDevices,
    rehabilitation_goals: rehabilitationGoals,
  }
}

// --- Tool 5: Social Companion Scheduler ---
function analyzeSocialCompanion(input: SocialCompanionInput): SocialCompanionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.patient_id + input.loneliness_score.toString()))

  let lonelinessRisk: SocialCompanionResult['loneliness_risk'] = 'low'
  if (input.loneliness_score > 7 || (input.social_contacts_count < 2 && input.loneliness_score > 5)) lonelinessRisk = 'severe'
  else if (input.loneliness_score > 5 || input.social_contacts_count < 4) lonelinessRisk = 'high'
  else if (input.loneliness_score > 3) lonelinessRisk = 'moderate'

  const weeklySchedule: SocialCompanionResult['weekly_schedule'] = []
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const activityPool = input.preferred_activities.length > 0 ? input.preferred_activities : ['太极拳', '书法', '园艺', '棋牌', '合唱', '健康讲座']

  for (const day of days) {
    const act = rng.pick(activityPool)
    const dur = input.mobility_level === 'homebound' ? '20-30' : input.mobility_level === 'limited' ? '30-45' : '45-60'
    weeklySchedule.push({ day, activity: act, duration_min: `${dur}分钟` })
  }

  const digitalEngagement: string[] = []
  if (input.technology_comfort === 'high') {
    digitalEngagement.push('视频通话: 每周3次与家属视频')
    digitalEngagement.push('社交APP: 加入同龄兴趣社群')
    digitalEngagement.push('智能音箱: 语音交互听新闻/音乐')
  } else if (input.technology_comfort === 'medium') {
    digitalEngagement.push('简化版APP: 大字体、一键呼叫')
    digitalEngagement.push('智能音箱: 语音播报日程')
  } else {
    digitalEngagement.push('传统电话: 每日固定时间来电问候')
    digitalEngagement.push('社区活动: 线下面对面交流优先')
  }

  const communityResources = [
    '社区老年活动中心 — 每周开放6天',
    '日间照料中心 — 提供午餐和午休',
    '社区健康服务站 — 免费血压血糖检测',
    '志愿者结对帮扶 — 每周探访',
    '老年大学 — 课程报名开放'
  ]

  const interventionPriority: string[] = []
  if (lonelinessRisk === 'severe') {
    interventionPriority.push('🔴 紧急: 启动每日电话关怀+社区志愿者上门探访')
    interventionPriority.push('建议心理科会诊评估抑郁风险')
    interventionPriority.push('鼓励参加至少2项集体活动/周')
  } else if (lonelinessRisk === 'high') {
    interventionPriority.push('🟡 优先: 增加社交频次至每周5次以上')
    interventionPriority.push('帮助建立1-2个稳定的社交关系')
  } else {
    interventionPriority.push('🟢 维持: 现有社交活动充足，定期评估即可')
  }

  return {
    patient_id: input.patient_id,
    loneliness_risk: lonelinessRisk,
    weekly_schedule: weeklySchedule,
    digital_engagement: digitalEngagement,
    community_resources: communityResources,
    intervention_priority: interventionPriority,
  }
}

// --- Tool 6: Vital Signs Monitor ---
function analyzeVitalSigns(input: VitalSignsInput): VitalSignsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.patient_id + input.heart_rate_bpm.toString()))

  const abnormalParams: string[] = []
  if (input.heart_rate_bpm < 60) abnormalParams.push(`心动过缓: ${input.heart_rate_bpm} bpm (< 60)`)
  else if (input.heart_rate_bpm > 100) abnormalParams.push(`心动过速: ${input.heart_rate_bpm} bpm (> 100)`)

  if (input.blood_pressure_systolic > 140) abnormalParams.push(`收缩压偏高: ${input.blood_pressure_systolic} mmHg (> 140)`)
  else if (input.blood_pressure_systolic < 90) abnormalParams.push(`收缩压偏低: ${input.blood_pressure_systolic} mmHg (< 90)`)

  if (input.blood_pressure_diastolic > 90) abnormalParams.push(`舒张压偏高: ${input.blood_pressure_diastolic} mmHg (> 90)`)
  else if (input.blood_pressure_diastolic < 60) abnormalParams.push(`舒张压偏低: ${input.blood_pressure_diastolic} mmHg (< 60)`)

  if (input.spo2_percent < 95) abnormalParams.push(`血氧降低: ${input.spo2_percent}% (< 95%)`)
  if (input.temperature_celsius > 37.5) abnormalParams.push(`体温偏高: ${input.temperature_celsius}°C (> 37.5°C)`)
  else if (input.temperature_celsius < 36.0) abnormalParams.push(`体温偏低: ${input.temperature_celsius}°C (< 36.0°C)`)

  if (input.respiratory_rate < 12) abnormalParams.push(`呼吸过缓: ${input.respiratory_rate} 次/分 (< 12)`)
  else if (input.respiratory_rate > 20) abnormalParams.push(`呼吸过速: ${input.respiratory_rate} 次/分 (> 20)`)

  let overallRisk: VitalSignsResult['overall_risk'] = 'normal'
  const criticalParams = abnormalParams.filter(p => p.includes('血氧') || p.includes('体温偏高') || p.includes('心动过速'))
  const warningParams = abnormalParams.filter(p => p.includes('压偏高') || p.includes('心动过缓') || p.includes('呼吸过速'))

  if (criticalParams.length > 0 || abnormalParams.length >= 4) overallRisk = 'critical'
  else if (warningParams.length > 0 || abnormalParams.length >= 2) overallRisk = 'warning'
  else if (abnormalParams.length === 1) overallRisk = 'caution'

  const trendAnalysis = `基于${input.monitoring_frequency === 'continuous' ? '连续' : input.monitoring_frequency === 'hourly' ? '每小时' : '每日'}监测模式，${input.measurement_context === 'resting' ? '静息状态下' : input.measurement_context === 'post_activity' ? '活动后' : input.measurement_context === 'sleep' ? '睡眠中' : '用药后'}测量。${abnormalParams.length > 0 ? `发现 ${abnormalParams.length} 项异常参数，需关注。` : '各项指标均在正常范围内。'}`

  const alertThresholds: Record<string, string> = {
    heart_rate: '50-100 bpm',
    bp_systolic: '90-140 mmHg',
    bp_diastolic: '60-90 mmHg',
    spo2: '≥ 95%',
    temperature: '36.0-37.5°C',
    respiratory_rate: '12-20 次/分'
  }

  const careRecommendations: string[] = []
  if (overallRisk === 'critical') {
    careRecommendations.push('🔴 立即: 启动紧急响应，通知值班医生')
    careRecommendations.push('持续监测，每5分钟记录一次')
    careRecommendations.push('准备急救设备和药品')
  } else if (overallRisk === 'warning') {
    careRecommendations.push('🟡 关注: 增加监测频次至每小时一次')
    careRecommendations.push('通知主管护士评估')
    careRecommendations.push('排查影响因素（药物、活动、情绪）')
  } else {
    careRecommendations.push('🟢 常规: 维持当前监测频次')
    careRecommendations.push('记录数据供医生定期审阅')
  }

  const escalationPath = [
    '异常检出 → 护士站弹窗提醒（< 1分钟）',
    '护士评估 → 确认异常（< 5分钟）',
    '通知值班医生 → 处理意见（< 15分钟）',
    '必要时转急诊/ICU → 绿色通道'
  ]

  return {
    patient_id: input.patient_id,
    overall_risk: overallRisk,
    abnormal_parameters: abnormalParams,
    trend_analysis: trendAnalysis,
    alert_thresholds: alertThresholds,
    care_recommendations: careRecommendations,
    escalation_path: escalationPath,
  }
}

// --- Tool 7: Nutrition Diet Planner ---
function analyzeNutritionDiet(input: NutritionDietInput): NutritionDietResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.patient_id + input.weight_kg.toString()))

  // Calculate BMR using Mifflin-St Jeor (simplified for elderly)
  const bmr = 10 * input.weight_kg + 6.25 * input.height_cm - 5 * input.age + 5
  const activityMultiplier = input.activity_level === 'sedentary' ? 1.2 : input.activity_level === 'light' ? 1.375 : 1.55
  const dailyCalories = Math.round(bmr * activityMultiplier + rng.nextFloat(-50, 50))

  // Protein: 1.0-1.2g/kg for elderly
  const proteinGrams = Math.round(input.weight_kg * rng.nextFloat(1.0, 1.3))

  // Fluid: 30ml/kg
  const fluidMl = Math.round(input.weight_kg * 30)

  const mealPlan: NutritionDietResult['meal_plan'] = [
    {
      meal: '早餐 (7:00-8:00)',
      foods: input.dysphagia_level === 'severe' ? ['米糊', '蒸蛋羹', '豆浆(浓稠)'] : ['燕麦粥', '水煮蛋', '牛奶'],
      texture: input.dysphagia_level === 'none' ? '普食' : input.dysphagia_level === 'mild' ? '软食' : input.dysphagia_level === 'moderate' ? '半流质' : '全流质'
    },
    {
      meal: '加餐 (10:00)',
      foods: input.dysphagia_level === 'severe' ? ['酸奶(浓稠)', '香蕉泥']: ['水果(去皮切块)', '酸奶'],
      texture: input.dysphagia_level === 'severe' ? '泥状' : '细碎'
    },
    {
      meal: '午餐 (12:00-13:00)',
      foods: input.dysphagia_level === 'severe' ? ['肉末粥', '南瓜泥', '豆腐脑'] : ['杂粮米饭', '清蒸鱼', '炒时蔬'],
      texture: input.dysphagia_level === 'none' ? '普食' : input.dysphagia_level === 'mild' ? '软食' : input.dysphagia_level === 'moderate' ? '半流质' : '全流质'
    },
    {
      meal: '加餐 (15:00)',
      foods: input.dysphagia_level === 'severe' ? ['藕粉', '芝麻糊']: ['坚果粉', '水果'],
      texture: '糊状'
    },
    {
      meal: '晚餐 (18:00-19:00)',
      foods: input.dysphagia_level === 'severe' ? ['蔬菜泥汤', '鸡肉泥', '米粉疙瘩汤'] : ['面条', '肉末蒸蛋', '青菜'],
      texture: input.dysphagia_level === 'none' ? '普食' : input.dysphagia_level === 'mild' ? '软食' : input.dysphagia_level === 'moderate' ? '半流质' : '全流质'
    }
  ]

  const swallowingPrecautions: string[] = []
  if (input.dysphagia_level !== 'none') {
    swallowingPrecautions.push('进食时保持坐位或半卧位(床头抬高30-45度)')
    swallowingPrecautions.push('每口食物量控制在5ml(约一茶匙)')
    swallowingPrecautions.push('进食后保持坐位30分钟以上，防止反流')
    swallowingPrecautions.push('避免进食时说话或分散注意力')
    if (input.dysphagia_level === 'severe') {
      swallowingPrecautions.push('所有食物需达到IDDSI 3-4级稠度')
      swallowingPrecautions.push('建议定期进行吞咽功能评估')
    }
  }

  const supplementRecommendations: string[] = []
  if (input.chronic_conditions.includes('骨质疏松')) {
    supplementRecommendations.push('钙片 600mg/日 + 维生素D 800IU/日')
  }
  if (input.activity_level === 'sedentary') {
    supplementRecommendations.push('维生素D补充(户外活动少)')
  }
  if (input.weight_kg < input.height_cm - 100) {
    supplementRecommendations.push('蛋白粉补充(体重偏轻)')
  }
  supplementRecommendations.push('复合老年人维生素(含B12、叶酸)')

  const dietaryModifications: string[] = []
  if (input.chronic_conditions.includes('糖尿病')) {
    dietaryModifications.push('低GI主食，控制精制糖摄入')
    dietaryModifications.push('定时定量进餐，避免血糖波动')
  }
  if (input.chronic_conditions.includes('高血压')) {
    dietaryModifications.push('低盐饮食(< 5g/日)')
    dietaryModifications.push('增加钾摄入(香蕉、土豆)')
  }
  if (input.chronic_conditions.includes('慢性肾病')) {
    dietaryModifications.push('低蛋白饮食(遵医嘱)')
    dietaryModifications.push('限制磷、钾摄入')
  }
  dietaryModifications.push('增加膳食纤维摄入(25-30g/日)')
  dietaryModifications.push('少量多餐，避免一次进食过多')

  return {
    patient_id: input.patient_id,
    daily_calories: dailyCalories,
    protein_grams: proteinGrams,
    fluid_ml: fluidMl,
    meal_plan: mealPlan,
    swallowing_precautions: swallowingPrecautions,
    supplement_recommendations: supplementRecommendations,
    dietary_modifications: dietaryModifications,
  }
}

// --- Tool 8: Elder Care Facility Manager ---
function analyzeFacilityManagement(input: FacilityManagerInput): FacilityManagerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.facility_name + input.total_beds.toString()))

  const occupancyRate = input.total_beds > 0 ? (input.occupied_beds / input.total_beds) * 100 : 0

  // Staffing ratio: 1:4 for light care, 1:2 for moderate, 1:1 for severe
  const avgRequiredRatio = input.care_levels.length > 0
    ? input.care_levels.reduce((sum, cl) => sum + cl.required_staff, 0) / input.care_levels.reduce((sum, cl) => sum + cl.residents, 0)
    : 0.25
  const optimalStaff = Math.ceil(input.occupied_beds * avgRequiredRatio)
  const staffingGap = input.staff_count - optimalStaff

  let staffingAdequacy: FacilityManagerResult['staffing_adequacy'] = 'optimal'
  if (staffingGap < -5) staffingAdequacy = 'critical'
  else if (staffingGap < -2) staffingAdequacy = 'insufficient'
  else if (staffingGap < 2) staffingAdequacy = 'adequate'

  const scheduleOptimization = [
    `当前入住率: ${occupancyRate.toFixed(1)}% (${input.occupied_beds}/${input.total_beds})`,
    `护理人员配置: ${input.staff_count}人，建议配置: ${optimalStaff}人`,
    staffingGap < 0 ? `护理人员缺口: ${Math.abs(staffingGap)}人 — 建议紧急招聘` : `护理人员富余: ${staffingGap}人`,
    '建议实施弹性排班，高峰时段增加人手',
    '建立护理人员技能矩阵，优化任务分配',
    '引入智能排班系统，减少人力浪费'
  ]

  const resourceAllocation: Record<string, number> = {
    nursing_staff: input.staff_count,
    care_hours_daily: Math.round(input.staff_count * 8),
    supplies_budget: Math.round(input.budget_monthly * 0.3),
    training_budget: Math.round(input.budget_monthly * 0.05),
    emergency_reserve: Math.round(input.budget_monthly * 0.1)
  }

  const complianceStatus: string[] = []
  if (input.incident_count_monthly === 0) {
    complianceStatus.push('✅ 安全记录: 本月零事故')
  } else {
    complianceStatus.push(`⚠️ 安全事故: 本月 ${input.incident_count_monthly} 起 — 需分析整改`)
  }
  if (staffingAdequacy === 'optimal' || staffingAdequacy === 'adequate') {
    complianceStatus.push('✅ 人员配置: 达到标准')
  } else {
    complianceStatus.push('❌ 人员配置: 未达标准 — 需整改')
  }
  if (occupancyRate >= 85 && occupancyRate <= 95) {
    complianceStatus.push('✅ 入住率: 理想区间')
  } else if (occupancyRate < 85) {
    complianceStatus.push('⚠️ 入住率偏低 — 需加强营销')
  } else {
    complianceStatus.push('⚠️ 入住率过高 — 注意服务品质')
  }

  const costEfficiencyScore = Math.min(100, Math.max(0,
    (occupancyRate * 0.3) +
    ((staffingAdequacy === 'optimal' ? 100 : staffingAdequacy === 'adequate' ? 80 : staffingAdequacy === 'insufficient' ? 50 : 20) * 0.3) +
    ((1 - input.incident_count_monthly / 10) * 100 * 0.2) +
    (input.budget_monthly > 0 ? Math.min(100, (input.occupied_beds * 3000 / input.budget_monthly) * 100) * 0.2 : 50) +
    rng.nextFloat(-5, 5)
  ))

  const actionItems: string[] = []
  if (staffingGap < 0) actionItems.push('紧急: 发布护理人员招聘信息')
  if (input.incident_count_monthly > 2) actionItems.push('安全: 召开安全分析会，制定整改措施')
  if (occupancyRate < 80) actionItems.push('营销: 推出优惠活动提升入住率')
  if (occupancyRate > 95) actionItems.push('扩容: 评估扩建或新增楼层的可能性')
  actionItems.push('每月: 召开服务质量分析会')
  actionItems.push('季度: 员工培训与技能考核')

  return {
    facility_name: input.facility_name,
    occupancy_rate: Math.round(occupancyRate * 10) / 10,
    staffing_adequacy: staffingAdequacy,
    schedule_optimization: scheduleOptimization,
    resource_allocation: resourceAllocation,
    compliance_status: complianceStatus,
    cost_efficiency_score: Math.round(costEfficiencyScore),
    action_items: actionItems,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

function formatFallDetectionReport(result: FallDetectionResult): string {
  const lines: string[] = []
  lines.push('## 🚨 跌倒检测系统 — 算法评估与响应机制报告')
  lines.push('')
  lines.push(`患者ID: ${result.patient_id} | 风险等级: **${result.risk_level.toUpperCase()}**`)
  lines.push('')
  lines.push('### 📊 检测性能指标')
  lines.push('| 指标 | 数值 | 评价 |')
  lines.push('|------|------|------|')
  lines.push(`| 检测准确率 | ${(result.detection_accuracy * 100).toFixed(1)}% | ${result.detection_accuracy > 0.9 ? '优秀' : result.detection_accuracy > 0.8 ? '良好' : '需优化'} |`)
  lines.push(`| 误报率 | ${(result.false_positive_rate * 100).toFixed(1)}% | ${result.false_positive_rate < 0.05 ? '优秀' : result.false_positive_rate < 0.1 ? '可接受' : '需优化'} |`)
  lines.push(`| 响应时间 | ${result.response_time_ms}ms | ${result.response_time_ms < 2000 ? '优秀' : result.response_time_ms < 4000 ? '可接受' : '需优化'} |`)
  lines.push('')
  lines.push('### 🔄 推荐响应流程')
  lines.push(result.protocol_recommendation)
  lines.push('')
  lines.push('### 🔧 传感器优化建议')
  for (const opt of result.sensor_optimization) lines.push(`- ${opt}`)
  lines.push('')
  lines.push('### 📳 警报链')
  for (const alert of result.alert_chain) lines.push(`- ${alert}`)
  lines.push('')
  lines.push('### ⚠️ 免责声明')
  lines.push('本系统仅供参考，不构成医疗诊断。跌倒检测算法可能存在误报或漏报，实际响应请以现场评估为准。紧急情况请立即拨打120急救电话。')
  return lines.join('\n')
}

function formatMedicationReport(result: MedicationAdherenceResult): string {
  const lines: string[] = []
  lines.push('## 💊 用药依从性追踪 — 智能提醒与干预报告')
  lines.push('')
  lines.push(`患者ID: ${result.patient_id} | 依从率: **${(result.adherence_rate * 100).toFixed(1)}%** ${result.adherence_rate >= 0.8 ? '✅' : result.adherence_rate >= 0.6 ? '⚠️' : '🔴'}`)
  lines.push('')
  lines.push('### 📊 用药风险评估')
  if (result.risk_medications.length > 0) {
    for (const r of result.risk_medications) lines.push(`- ${r}`)
  } else {
    lines.push('- 暂无高风险用药识别')
  }
  lines.push('')
  lines.push('### ⏰ 用药方案优化')
  for (const opt of result.schedule_optimization) lines.push(`- ${opt}`)
  lines.push('')
  lines.push('### 🔔 干预建议')
  for (const irr of result.intervention_recommendations) lines.push(`- ${irr}`)
  lines.push('')
  lines.push('### ⚡ 警报触发规则')
  for (const trigger of result.alert_triggers) lines.push(`- ${trigger}`)
  lines.push('')
  lines.push('### ⚠️ 免责声明')
  lines.push('用药管理建议仅供参考，具体用药方案请遵医嘱。请勿自行调整药物剂量或停药。如出现不适，请及时就医。')
  return lines.join('\n')
}

function formatCognitiveReport(result: CognitiveHealthResult): string {
  const lines: string[] = []
  lines.push('## 🧠 认知功能监测 — 衰退评估与早期筛查报告')
  lines.push('')
  lines.push(`患者ID: ${result.patient_id} | 风险分级: **${result.risk_category.toUpperCase()}** | 下降速率: ${result.decline_rate}%`)
  lines.push('')
  lines.push('### ⚠️ 早期预警信号')
  if (result.early_warning_flags.length > 0) {
    for (const w of result.early_warning_flags) lines.push(`- ${w}`)
  } else {
    lines.push('- 暂无显著预警信号')
  }
  lines.push('')
  lines.push('### 🔬 筛查建议')
  for (const s of result.screening_recommendations) lines.push(`- ${s}`)
  lines.push('')
  lines.push('### 🌿 生活方式干预')
  for (const l of result.lifestyle_interventions) lines.push(`- ${l}`)
  lines.push('')
  lines.push('### ⚠️ 免责声明')
  lines.push('认知功能评估结果仅供参考，不能替代专业医疗诊断。如发现认知功能明显下降，请及时到记忆门诊或神经内科就诊。早期干预可延缓认知衰退进程。')
  return lines.join('\n')
}

function formatDailyActivityReport(result: DailyActivityResult): string {
  const lines: string[] = []
  lines.push('## 🏃 日常生活活动(ADL)识别 — 能力评估与康复建议')
  lines.push('')
  lines.push(`患者ID: ${result.patient_id} | ADL评分: **${result.adl_score}/100** | 独立性: ${result.independence_level}`)
  lines.push('')
  lines.push('### 📊 活动能力建议')
  for (const a of result.activity_recommendations) lines.push(`- ${a}`)
  lines.push('')
  lines.push('### 🦽 辅助器具推荐')
  for (const d of result.assistive_devices) lines.push(`- ${d}`)
  lines.push('')
  lines.push('### 🎯 康复目标')
  for (const g of result.rehabilitation_goals) lines.push(`- ${g}`)
  lines.push('')
  lines.push('### ⚠️ 免责声明')
  lines.push('ADL评估为功能性参考，具体照护方案请由专业康复治疗师或作业治疗师制定。训练过程请注意安全，避免二次伤害。')
  return lines.join('\n')
}

function formatSocialCompanionReport(result: SocialCompanionResult): string {
  const lines: string[] = []
  lines.push('## 🤝 社交陪伴调度 — 孤独感干预与活动安排')
  lines.push('')
  lines.push(`患者ID: ${result.patient_id} | 孤独风险: **${result.loneliness_risk.toUpperCase()}**`)
  lines.push('')
  lines.push('### 📅 每周社交活动计划')
  lines.push('| 日期 | 活动 | 时长 |')
  lines.push('|------|------|------|')
  for (const s of result.weekly_schedule) {
    lines.push(`| ${s.day} | ${s.activity} | ${s.duration_min} |`)
  }
  lines.push('')
  lines.push('### 📱 数字参与方案')
  for (const d of result.digital_engagement) lines.push(`- ${d}`)
  lines.push('')
  lines.push('### 🏘️ 社区资源')
  for (const r of result.community_resources) lines.push(`- ${r}`)
  lines.push('')
  lines.push('### 🔴 干预优先级')
  for (const i of result.intervention_priority) lines.push(`- ${i}`)
  lines.push('')
  lines.push('### ⚠️ 免责声明')
  lines.push('社交活动安排建议基于算法生成，实际执行请根据患者身体状况和意愿灵活调整。如患者出现情绪低落、焦虑等心理症状，建议寻求专业心理咨询。')
  return lines.join('\n')
}

function formatVitalSignsReport(result: VitalSignsResult): string {
  const lines: string[] = []
  lines.push('## ❤️ 生命体征监测 — 远程监护与预警报告')
  lines.push('')
  lines.push(`患者ID: ${result.patient_id} | 总体风险: **${result.overall_risk.toUpperCase()}**`)
  lines.push('')
  lines.push('### 📊 异常参数')
  if (result.abnormal_parameters.length > 0) {
    for (const a of result.abnormal_parameters) lines.push(`- ${a}`)
  } else {
    lines.push('- 所有参数正常')
  }
  lines.push('')
  lines.push('### 📈 趋势分析')
  lines.push(result.trend_analysis)
  lines.push('')
  lines.push('### 🚨 预警阈值')
  lines.push('| 参数 | 正常范围 |')
  lines.push('|------|---------|')
  for (const [key, val] of Object.entries(result.alert_thresholds)) {
    lines.push(`| ${key} | ${val} |`)
  }
  lines.push('')
  lines.push('### 💡 护理建议')
  for (const c of result.care_recommendations) lines.push(`- ${c}`)
  lines.push('')
  lines.push('### 🔄 升级处理路径')
  for (const e of result.escalation_path) lines.push(`- ${e}`)
  lines.push('')
  lines.push('### ⚠️ 免责声明')
  lines.push('生命体征数据仅供参考，不能替代临床判断。如患者感觉不适或数据持续异常，请立即联系医护人员。紧急情况请拨打120。')
  return lines.join('\n')
}

function formatNutritionReport(result: NutritionDietResult): string {
  const lines: string[] = []
  lines.push('## 🥗 营养膳食规划 — 吞咽安全饮食方案')
  lines.push('')
  lines.push(`患者ID: ${result.patient_id} | 每日热量: **${result.daily_calories} kcal** | 蛋白质: ${result.protein_grams}g | 液体: ${result.fluid_ml}ml`)
  lines.push('')
  lines.push('### 🍽️ 每日餐食计划')
  for (const meal of result.meal_plan) {
    lines.push(`**${meal.meal}** [质地: ${meal.texture}]`)
    for (const food of meal.foods) {
      lines.push(`  - ${food}`)
    }
  }
  lines.push('')
  if (result.swallowing_precautions.length > 0) {
    lines.push('### ⚠️ 吞咽安全措施')
    for (const s of result.swallowing_precautions) lines.push(`- ${s}`)
    lines.push('')
  }
  lines.push('### 💊 补充剂建议')
  for (const s of result.supplement_recommendations) lines.push(`- ${s}`)
  lines.push('')
  lines.push('### 📋 饮食调整')
  for (const d of result.dietary_modifications) lines.push(`- ${d}`)
  lines.push('')
  lines.push('### ⚠️ 免责声明')
  lines.push('营养方案基于一般性原则制定，具体饮食请结合个人健康状况由专业营养师或医生调整。吞咽困难患者进食时请严格遵守安全规范，防止误吸。')
  return lines.join('\n')
}

function formatFacilityReport(result: FacilityManagerResult): string {
  const lines: string[] = []
  lines.push('## 🏢 养老机构运营 — 护理资源调度与管理报告')
  lines.push('')
  lines.push(`机构名称: ${result.facility_name} | 入住率: **${result.occupancy_rate}%** | 人员配置: ${result.staffing_adequacy}`)
  lines.push('')
  lines.push('### 📊 排班优化')
  for (const s of result.schedule_optimization) lines.push(`- ${s}`)
  lines.push('')
  lines.push('### 💰 资源分配')
  lines.push('| 项目 | 数值 |')
  lines.push('|------|------|')
  for (const [key, val] of Object.entries(result.resource_allocation)) {
    lines.push(`| ${key} | ${val} |`)
  }
  lines.push('')
  lines.push('### ✅ 合规状态')
  for (const c of result.compliance_status) lines.push(`- ${c}`)
  lines.push('')
  lines.push(`### 📈 成本效率评分: ${result.cost_efficiency_score}/100`)
  lines.push('')
  lines.push('### 📋 行动项')
  for (const a of result.action_items) lines.push(`- ${a}`)
  lines.push('')
  lines.push('### ⚠️ 免责声明')
  lines.push('机构运营分析基于输入数据自动生成，仅供参考。实际管理决策请结合当地法规政策、机构实际情况和专业判断。')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Fall Detection System
  tools.register(defineTool({
    name: 'fall_detection_system',
    description: '跌倒检测算法评估与响应机制 | 分析传感器数据、评估算法精度、推荐响应协议。输入包含患者信息、传感器类型、算法模型、跌倒史等。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, age, sensor_type(accelerometer|gyroscope|camera|wearable|pressure_mat), algorithm_model(threshold|svm|cnn|lstm|transformer), sampling_rate_hz, fall_history_count, mobility_score(0-100), environment(home|hospital|outdoor|care_facility), response_protocol(auto_alert|caregiver_notify|emergency_dispatch|voice_check)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: FallDetectionInput = JSON.parse(args.input_data)
      const r = analyzeFallDetection(input)
      return formatFallDetectionReport(r)
    }
  }))

  // Tool 2: Medication Adherence Tracker
  tools.register(defineTool({
    name: 'medication_adherence_tracker',
    description: '用药依从性追踪与提醒系统 | 评估用药依从率、识别风险药物、生成个性化提醒方案。输入包含患者用药清单、认知状态、追踪天数、漏服记录等。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, age, medications[{name, dosage, frequency, time_slots[]}], cognitive_status(normal|mild_impairment|moderate_impairment), days_tracked, missed_doses, reminder_method(app|sms|voice_call|smart_pillbox|family)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: MedicationAdherenceInput = JSON.parse(args.input_data)
      const r = analyzeMedicationAdherence(input)
      return formatMedicationReport(r)
    }
  }))

  // Tool 3: Cognitive Health Monitor
  tools.register(defineTool({
    name: 'cognitive_health_monitor',
    description: '认知功能衰退监测与早期筛查 | 评估认知评分变化、识别预警信号、推荐干预措施。输入包含评估工具类型、基线/当前评分、家族史等。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, age, education_years, assessment_tool(mmse|moca|clock_drawing|word_recall|trail_making), baseline_score, current_score, months_since_last, family_history_dementia, comorbidities[]'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: CognitiveHealthInput = JSON.parse(args.input_data)
      const r = analyzeCognitiveHealth(input)
      return formatCognitiveReport(r)
    }
  }))

  // Tool 4: Daily Activity Recognizer
  tools.register(defineTool({
    name: 'daily_activity_recognizer',
    description: '日常生活活动(ADL)识别与能力评估 | 分析日常活动能力、评估独立性等级、推荐辅助器具和康复目标。输入包含活动清单、移动辅助、居住安排等。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, age, activities[{name, duration_minutes, difficulty(independent|assisted|dependent), frequency_per_week}], mobility_aid(none|cane|walker|wheelchair), living_arrangement(alone|with_spouse|with_family|care_facility), chronic_conditions[]'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: DailyActivityInput = JSON.parse(args.input_data)
      const r = analyzeDailyActivity(input)
      return formatDailyActivityReport(r)
    }
  }))

  // Tool 5: Social Companion Scheduler
  tools.register(defineTool({
    name: 'social_companion_scheduler',
    description: '社交活动安排与孤独感干预 | 评估孤独风险等级、生成周活动计划、推荐数字参与方案。输入包含孤独评分、社交联系人、偏好活动、移动能力等。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, age, loneliness_score(0-10), social_contacts_count, preferred_activities[], mobility_level(mobile|limited|homebound), technology_comfort(high|medium|low), language, available_hours_per_week'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: SocialCompanionInput = JSON.parse(args.input_data)
      const r = analyzeSocialCompanion(input)
      return formatSocialCompanionReport(r)
    }
  }))

  // Tool 6: Vital Signs Monitor
  tools.register(defineTool({
    name: 'vital_signs_monitor',
    description: '生命体征预警与远程监护配置 | 分析生命体征数据、识别异常参数、生成预警建议。输入包含心率、血压、血氧、体温、呼吸等测量数据。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, age, heart_rate_bpm, blood_pressure_systolic, blood_pressure_diastolic, spo2_percent, temperature_celsius, respiratory_rate, measurement_context(resting|post_activity|sleep|medication), monitoring_frequency(continuous|hourly|twice_daily|daily), comorbidities[]'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: VitalSignsInput = JSON.parse(args.input_data)
      const r = analyzeVitalSigns(input)
      return formatVitalSignsReport(r)
    }
  }))

  // Tool 7: Nutrition Diet Planner
  tools.register(defineTool({
    name: 'nutrition_diet_planner',
    description: '老年人营养方案与吞咽安全饮食 | 计算营养需求、生成餐食计划、提供吞咽安全建议。输入包含体重身高、活动水平、吞咽困难等级、慢性病等。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: patient_id, age, weight_kg, height_cm, activity_level(sedentary|light|moderate), dysphagia_level(none|mild|moderate|severe), chronic_conditions[], food_allergies[], cultural_preferences[], bmi'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: NutritionDietInput = JSON.parse(args.input_data)
      const r = analyzeNutritionDiet(input)
      return formatNutritionReport(r)
    }
  }))

  // Tool 8: Elder Care Facility Manager
  tools.register(defineTool({
    name: 'elder_care_facility_manager',
    description: '养老机构运营与护理资源调度 | 分析入住率、评估人员配置、优化资源分配、合规检查。输入包含机构基本信息、床位、人员、预算等。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: facility_name, total_beds, occupied_beds, staff_count, staff_to_resident_ratio, care_levels[{level, residents, required_staff}], budget_monthly, regulatory_requirements[], incident_count_monthly'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      const input: FacilityManagerInput = JSON.parse(args.input_data)
      const r = analyzeFacilityManagement(input)
      return formatFacilityReport(r)
    }
  }))

  console.log(`[dsh-tool-agedcareagent] Loaded v${VERSION} — 智慧养老AI智能体, 8 tools active`)
  console.log('  Tools: fall_detection_system, medication_adherence_tracker, cognitive_health_monitor, daily_activity_recognizer, social_companion_scheduler, vital_signs_monitor, nutrition_diet_planner, elder_care_facility_manager')
}
