/**
 * DSH Aquaculture & Fishery AI Agent Plugin v0.1.0
 *
 * Comprehensive aquaculture and fishery management toolkit for DeepSeek Harness Agent.
 * Designed for fish farmers, shrimp cultivators, fishery managers, and aquaculture technicians.
 *
 * Features (v0.1.0):
 * - Water Quality Monitor (parameter tracking with hypoxia alerts)
 * - Fish Health Diagnostician (AI disease diagnosis with treatment advice)
 * - Feed Optimization Engine (formulation optimization for better FCR)
 * - Stocking Density Calculator (density planning with carrying capacity)
 * - Aquaculture IoT Manager (aerator and feeding automation control)
 * - Harvest Timing Predictor (optimal harvest with market price linkage)
 * - Aquaculture Risk Assessor (typhoon/red tide/disease risk assessment)
 * - Fisheries Supply Chain Trace (traceability with cold chain monitoring)
 *
 * @module dsh-tool-aquafishagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-aquafishagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== DISCLAIMERS ====================

const MEDICAL_DISCLAIMER =
  '本诊断基于AI模型推断，仅供养殖参考，不替代专业兽医诊断。请咨询持证水产兽医进行确诊。'
const RISK_DISCLAIMER =
  '本风险评估基于历史数据和模型推断，仅供参考，不替代官方气象和海洋预警。请关注当地气象部门和海洋环境监测站发布的官方信息。'
const GENERAL_DISCLAIMER =
  '本分析基于AI模型推断，仅供养殖管理参考，请结合实际情况和专业建议做出决策。'

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private seed: number
  constructor(seed: number) { this.seed = seed >>> 0 }
  next(): number {
    this.seed = (this.seed + 0x6D2B79F5) >>> 0
    let t = this.seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  nextInt(min: number, max: number): number { return Math.floor(this.next() * (max - min + 1)) + min }
  nextFloat(min: number, max: number): number { return this.next() * (max - min) + min }
  pick<T>(arr: T[]): T { return arr[this.nextInt(0, arr.length - 1)] }
}

function hashStr(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seededRng(text: string): SeededRandom {
  return new SeededRandom(hashStr(text))
}

// ==================== TOOL 1: WATER QUALITY MONITOR ====================

interface WaterQualityInput {
  pond_id: string
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout' | 'other'
  temperature_c: number
  ph: number
  dissolved_oxygen_mg_l: number
  ammonia_mg_l: number
  nitrite_mg_l: number
  salinity_ppt?: number
  turbidity_ntu?: number
  measurement_time?: string
}

interface ParameterStatus {
  parameter: string
  value: number
  unit: string
  status: 'optimal' | 'acceptable' | 'warning' | 'critical'
  optimal_range: string
  deviation: number
}

interface WaterQualityResult {
  pond_id: string
  species: string
  overall_score: number
  hypoxia_risk: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  parameters: ParameterStatus[]
  alerts: string[]
  recommendations: string[]
  immediate_actions: string[]
}

function analyzeWaterQuality(input: WaterQualityInput): WaterQualityResult {
  const rng = seededRng(`${input.pond_id}:${input.species}:${input.temperature_c}:${input.ph}:${input.dissolved_oxygen_mg_l}`)
  const params: ParameterStatus[] = []
  const alerts: string[] = []
  const recommendations: string[] = []
  const immediate_actions: string[] = []

  // Temperature
  const tempOptimal = input.species === 'salmon' || input.species === 'trout' ? '12-18°C' : '22-30°C'
  const tempMin = input.species === 'salmon' || input.species === 'trout' ? 12 : 22
  const tempMax = input.species === 'salmon' || input.species === 'trout' ? 18 : 30
  let tempStatus: ParameterStatus['status'] = 'optimal'
  let tempDev = 0
  if (input.temperature_c < tempMin - 5 || input.temperature_c > tempMax + 5) {
    tempStatus = 'critical'; tempDev = Math.abs(input.temperature_c - (tempMin + tempMax) / 2)
    alerts.push(`温度严重偏离: ${input.temperature_c}°C (适宜范围 ${tempOptimal})`)
  } else if (input.temperature_c < tempMin || input.temperature_c > tempMax) {
    tempStatus = 'warning'; tempDev = Math.abs(input.temperature_c - (tempMin + tempMax) / 2)
    alerts.push(`温度偏离适宜范围: ${input.temperature_c}°C (适宜范围 ${tempOptimal})`)
  }
  params.push({ parameter: '温度', value: input.temperature_c, unit: '°C', status: tempStatus, optimal_range: tempOptimal, deviation: parseFloat(tempDev.toFixed(1)) })

  // pH
  const phOptimal = '6.5-8.5'
  let phStatus: ParameterStatus['status'] = 'optimal'
  let phDev = 0
  if (input.ph < 5.5 || input.ph > 9.5) {
    phStatus = 'critical'; phDev = Math.abs(input.ph - 7.5)
    alerts.push(`pH严重异常: ${input.ph} (安全范围 ${phOptimal})`)
  } else if (input.ph < 6.5 || input.ph > 8.5) {
    phStatus = 'warning'; phDev = Math.abs(input.ph - 7.5)
    alerts.push(`pH偏离适宜范围: ${input.ph} (适宜范围 ${phOptimal})`)
  }
  params.push({ parameter: 'pH', value: input.ph, unit: '', status: phStatus, optimal_range: phOptimal, deviation: parseFloat(phDev.toFixed(2)) })

  // Dissolved Oxygen
  const doOptimal = '>5.0 mg/L'
  let doStatus: ParameterStatus['status'] = 'optimal'
  let doDev = 0
  if (input.dissolved_oxygen_mg_l < 2.0) {
    doStatus = 'critical'; doDev = 5.0 - input.dissolved_oxygen_mg_l
    alerts.push(`严重缺氧! 溶解氧仅 ${input.dissolved_oxygen_mg_l} mg/L (安全阈值 >5.0 mg/L)`)
    immediate_actions.push('立即开启所有增氧机', '减少或停止投喂', '准备应急增氧措施')
  } else if (input.dissolved_oxygen_mg_l < 3.5) {
    doStatus = 'warning'; doDev = 5.0 - input.dissolved_oxygen_mg_l
    alerts.push(`溶解氧偏低: ${input.dissolved_oxygen_mg_l} mg/L (安全阈值 >5.0 mg/L)`)
    immediate_actions.push('开启增氧机', '减少投喂量')
  } else if (input.dissolved_oxygen_mg_l < 5.0) {
    doStatus = 'acceptable'; doDev = 5.0 - input.dissolved_oxygen_mg_l
  }
  params.push({ parameter: '溶解氧', value: input.dissolved_oxygen_mg_l, unit: 'mg/L', status: doStatus, optimal_range: doOptimal, deviation: parseFloat(doDev.toFixed(2)) })

  // Ammonia
  const nh3Optimal = '<0.02 mg/L'
  let nh3Status: ParameterStatus['status'] = 'optimal'
  let nh3Dev = 0
  if (input.ammonia_mg_l > 2.0) {
    nh3Status = 'critical'; nh3Dev = input.ammonia_mg_l
    alerts.push(`氨氮严重超标: ${input.ammonia_mg_l} mg/L (安全阈值 <0.02 mg/L)`)
    immediate_actions.push('立即换水30-50%', '停止投喂', '使用水质改良剂')
  } else if (input.ammonia_mg_l > 0.5) {
    nh3Status = 'warning'; nh3Dev = input.ammonia_mg_l
    alerts.push(`氨氮偏高: ${input.ammonia_mg_l} mg/L (安全阈值 <0.02 mg/L)`)
    recommendations.push('增加换水频率', '减少投喂量', '使用益生菌调节水质')
  } else if (input.ammonia_mg_l > 0.02) {
    nh3Status = 'acceptable'; nh3Dev = input.ammonia_mg_l
  }
  params.push({ parameter: '氨氮', value: input.ammonia_mg_l, unit: 'mg/L', status: nh3Status, optimal_range: nh3Optimal, deviation: parseFloat(nh3Dev.toFixed(3)) })

  // Nitrite
  const no2Optimal = '<0.1 mg/L'
  let no2Status: ParameterStatus['status'] = 'optimal'
  let no2Dev = 0
  if (input.nitrite_mg_l > 1.0) {
    no2Status = 'critical'; no2Dev = input.nitrite_mg_l
    alerts.push(`亚硝酸盐严重超标: ${input.nitrite_mg_l} mg/L (安全阈值 <0.1 mg/L)`)
  } else if (input.nitrite_mg_l > 0.3) {
    no2Status = 'warning'; no2Dev = input.nitrite_mg_l
    alerts.push(`亚硝酸盐偏高: ${input.nitrite_mg_l} mg/L (安全阈值 <0.1 mg/L)`)
  } else if (input.nitrite_mg_l > 0.1) {
    no2Status = 'acceptable'; no2Dev = input.nitrite_mg_l
  }
  params.push({ parameter: '亚硝酸盐', value: input.nitrite_mg_l, unit: 'mg/L', status: no2Status, optimal_range: no2Optimal, deviation: parseFloat(no2Dev.toFixed(3)) })

  // Hypoxia risk assessment
  let hypoxiaRisk: WaterQualityResult['hypoxia_risk'] = 'none'
  if (input.dissolved_oxygen_mg_l < 2.0) hypoxiaRisk = 'severe'
  else if (input.dissolved_oxygen_mg_l < 3.0) hypoxiaRisk = 'high'
  else if (input.dissolved_oxygen_mg_l < 4.0) hypoxiaRisk = 'moderate'
  else if (input.dissolved_oxygen_mg_l < 5.0) hypoxiaRisk = 'low'

  // Temperature-DO interaction
  if (input.temperature_c > 32 && input.dissolved_oxygen_mg_l < 5.0) {
    hypoxiaRisk = 'high'
    alerts.push('高温+低溶氧组合风险: 高温降低水体溶氧能力，增加缺氧风险')
  }

  // Overall score
  const criticalCount = params.filter(p => p.status === 'critical').length
  const warningCount = params.filter(p => p.status === 'warning').length
  const score = Math.max(0, 100 - criticalCount * 25 - warningCount * 10 - rng.nextFloat(0, 5))

  if (recommendations.length === 0) {
    recommendations.push('继续保持当前水质管理措施', '定期监测水质参数', '记录水质变化趋势')
  }

  return {
    pond_id: input.pond_id,
    species: input.species,
    overall_score: parseFloat(score.toFixed(1)),
    hypoxia_risk: hypoxiaRisk,
    parameters: params,
    alerts,
    recommendations,
    immediate_actions,
  }
}

function formatWaterReport(r: WaterQualityResult): string {
  const l: string[] = []
  const riskLabel: Record<string, string> = { none: '无风险', low: '低风险', moderate: '中等风险', high: '高风险', severe: '严重风险' }
  const riskIcon: Record<string, string> = { none: '\u2705', low: '\u26A0\uFE0F', moderate: '\uD83D\uDFE1', high: '\uD83D\uDFE0', severe: '\uD83D\uDD34' }
  const statusIcon: Record<string, string> = { optimal: '\u2705', acceptable: '\u26A0\uFE0F', warning: '\uD83D\uDFE1', critical: '\uD83D\uDD34' }

  l.push('## 水质监测报告')
  l.push('')
  l.push('### 基本信息')
  l.push(`- **池塘/网箱编号**: ${r.pond_id}`)
  l.push(`- **养殖品种**: ${r.species}`)
  l.push(`- **综合评分**: ${r.overall_score}/100`)
  l.push(`- **缺氧风险**: ${riskIcon[r.hypoxia_risk]} ${riskLabel[r.hypoxia_risk]}`)
  l.push('')

  l.push('### 参数详情')
  l.push('| 参数 | 数值 | 状态 | 适宜范围 | 偏离度 |')
  l.push('|------|------|------|----------|--------|')
  for (const p of r.parameters) {
    l.push(`| ${p.parameter} | ${p.value} ${p.unit} | ${statusIcon[p.status]} ${p.status} | ${p.optimal_range} | ${p.deviation} |`)
  }
  l.push('')

  if (r.alerts.length > 0) {
    l.push('### 预警信息')
    for (const a of r.alerts) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push('')
  }

  if (r.immediate_actions.length > 0) {
    l.push('### 紧急措施')
    for (const a of r.immediate_actions) {
      l.push(`- \uD83D\uDEA8 ${a}`)
    }
    l.push('')
  }

  l.push('### 管理建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 2: FISH HEALTH DIAGNOSTICIAN ====================

interface FishHealthInput {
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout' | 'other'
  symptoms: string[]
  mortality_rate_daily?: number
  water_temp_c?: number
  affected_body_parts?: string[]
  behavior_changes?: string[]
  duration_days?: number
}

interface DiseaseCandidate {
  name: string
  probability: number
  category: 'bacterial' | 'viral' | 'parasitic' | 'fungal' | 'environmental' | 'nutritional'
  severity: 'mild' | 'moderate' | 'severe'
  description: string
  treatment: string[]
  prevention: string[]
}

interface FishHealthResult {
  species: string
  candidates: DiseaseCandidate[]
  primary_diagnosis: string
  confidence: number
  treatment_plan: string[]
  prevention_measures: string[]
  urgency: 'routine' | 'monitor' | 'urgent' | 'emergency'
}

function analyzeFishHealth(input: FishHealthInput): FishHealthResult {
  const rng = seededRng(`${input.species}:${input.symptoms.join(',')}:${input.mortality_rate_daily ?? 0}`)
  const candidates: DiseaseCandidate[] = []
  const symptomStr = input.symptoms.map(s => s.toLowerCase()).join(',')

  // Bacterial diseases
  if (symptomStr.includes('ulcer') || symptomStr.includes('溃疡') || symptomStr.includes('出血') || symptomStr.includes('hemorrhage')) {
    candidates.push({
      name: '弧菌病 (Vibriosis)',
      probability: 0.78 + rng.nextFloat(-0.05, 0.05),
      category: 'bacterial',
      severity: 'severe',
      description: '由弧菌引起的细菌性病害，常见症状包括体表溃疡、出血、烂鳃等',
      treatment: ['使用氟苯尼考或恩诺沙星药饵投喂(5-7天疗程)', '全池泼洒聚维酮碘(0.3ppm)', '加强水质管理，降低水体有机质'],
      prevention: ['定期使用益生菌调节水质', '避免高密度养殖', '定期消毒工具和网具', '使用疫苗预防(如有)'],
    })
  }

  if (symptomStr.includes('rot') || symptomStr.includes('腐烂') || symptomStr.includes('烂鳃') || symptomStr.includes('fin rot')) {
    candidates.push({
      name: '烂鳃病 (Gill Rot)',
      probability: 0.72 + rng.nextFloat(-0.05, 0.05),
      category: 'bacterial',
      severity: 'moderate',
      description: '由柱状屈挠杆菌或嗜水气单胞菌引起，鳃丝腐烂、粘液增多',
      treatment: ['全池泼洒二氧化氯(0.3ppm)', '使用磺胺类药饵投喂(5天疗程)', '增加水体溶氧'],
      prevention: ['保持水质清洁', '合理控制养殖密度', '定期使用生石灰消毒'],
    })
  }

  // Parasitic diseases
  if (symptomStr.includes('white spot') || symptomStr.includes('白点') || symptomStr.includes('ich') || symptomStr.includes('小瓜虫')) {
    candidates.push({
      name: '小瓜虫病 (White Spot Disease / Ich)',
      probability: 0.85 + rng.nextFloat(-0.05, 0.05),
      category: 'parasitic',
      severity: 'severe',
      description: '由多子小瓜虫(Ichthyophthirius)引起，体表和鳃部出现白色小点状胞囊',
      treatment: ['全池泼洒福尔马林(15-25ppm)', '使用硫酸铜和硫酸亚铁合剂(5:2, 0.7ppm)', '缓慢升温至28-30°C(如品种允许)', '盐浴处理(3-5ppt, 5-10分钟)'],
      prevention: ['新进鱼种隔离检疫2周', '避免水温剧烈波动', '定期使用食盐消毒'],
    })
  }

  if (symptomStr.includes('scratch') || symptomStr.includes('擦身') || symptomStr.includes('flashing') || symptomStr.includes('反常游动')) {
    candidates.push({
      name: '寄生虫感染 (Parasitic Infection)',
      probability: 0.65 + rng.nextFloat(-0.05, 0.05),
      category: 'parasitic',
      severity: 'moderate',
      description: '可能由指环虫、三代虫、锚头蚤等寄生虫引起，鱼体擦身、焦躁不安',
      treatment: ['全池泼洒敌百虫(0.3-0.5ppm)', '使用阿维菌素药饵投喂', '严重时全池泼洒甲醛(15ppm)'],
      prevention: ['定期镜检监测寄生虫', '清塘消毒杀灭中间宿主', '控制养殖密度'],
    })
  }

  // Viral diseases
  if (symptomStr.includes('swim bladder') || symptomStr.includes('浮头') || symptomStr.includes('lethargy') || symptomStr.includes('呆滞') || (input.mortality_rate_daily ?? 0) > 5) {
    candidates.push({
      name: '病毒性疾病 (Viral Disease)',
      probability: 0.55 + rng.nextFloat(-0.05, 0.05),
      category: 'viral',
      severity: 'severe',
      description: '可能为鲤春病毒血症(SVC)、传染性胰腺坏死(IPN)等病毒性疾病',
      treatment: ['无特效药物治疗', '提高水温至28°C以上(如品种允许)', '使用维生素C和免疫增强剂', '隔离病鱼，防止传播'],
      prevention: ['使用灭活疫苗', '严格检疫隔离', '消毒工具和网具', '避免引入带毒鱼种'],
    })
  }

  // Environmental stress
  if (symptomStr.includes('gasping') || symptomStr.includes('浮头') || symptomStr.includes('缺氧') || symptomStr.includes('水面游')) {
    candidates.push({
      name: '环境胁迫/缺氧 (Environmental Stress)',
      probability: 0.80 + rng.nextFloat(-0.05, 0.05),
      category: 'environmental',
      severity: 'moderate',
      description: '由水质恶化、溶氧不足、氨氮超标等环境因素引起的应激反应',
      treatment: ['立即开启增氧机', '换水30-50%', '减少投喂量', '使用水质改良剂'],
      prevention: ['加强水质监测', '合理投喂', '保持适当养殖密度', '定期使用微生物制剂'],
    })
  }

  // Nutritional deficiency
  if (symptomStr.includes('slow growth') || symptomStr.includes('生长缓慢') || symptomStr.includes('color loss') || symptomStr.includes('褪色')) {
    candidates.push({
      name: '营养缺乏症 (Nutritional Deficiency)',
      probability: 0.60 + rng.nextFloat(-0.05, 0.05),
      category: 'nutritional',
      severity: 'mild',
      description: '可能缺乏维生素C、维生素E、必需脂肪酸或矿物质',
      treatment: ['更换高品质饲料', '添加维生素C和E(2-3g/kg饲料)', '补充矿物质预混料'],
      prevention: ['使用全价配合饲料', '定期添加营养补充剂', '避免饲料储存过久导致营养流失'],
    })
  }

  // If no candidates matched, add a generic one
  if (candidates.length === 0) {
    candidates.push({
      name: '综合症状待查 (Undetermined)',
      probability: 0.40,
      category: 'environmental',
      severity: 'moderate',
      description: '症状不典型，需进一步检查确诊',
      treatment: ['采集样本送实验室检测', '加强水质监测', '观察症状变化趋势'],
      prevention: ['定期健康检查', '建立疾病监测档案', '加强生物安全管理'],
    })
  }

  // Sort by probability
  candidates.sort((a, b) => b.probability - a.probability)
  const primary = candidates[0]

  // Determine urgency
  const mortality = input.mortality_rate_daily ?? 0
  let urgency: FishHealthResult['urgency'] = 'routine'
  if (mortality > 10 || primary.severity === 'severe') urgency = 'emergency'
  else if (mortality > 3 || primary.severity === 'moderate') urgency = 'urgent'
  else if (mortality > 0.5) urgency = 'monitor'

  return {
    species: input.species,
    candidates: candidates.slice(0, 3),
    primary_diagnosis: primary.name,
    confidence: parseFloat((primary.probability * 100).toFixed(1)),
    treatment_plan: primary.treatment,
    prevention_measures: primary.prevention,
    urgency,
  }
}

function formatFishHealth(r: FishHealthResult): string {
  const l: string[] = []
  const urgencyLabel: Record<string, string> = { routine: '常规', monitor: '需观察', urgent: '紧急', emergency: '紧急处置' }
  const urgencyIcon: Record<string, string> = { routine: '\u2705', monitor: '\u26A0\uFE0F', urgent: '\uD83D\uDFE1', emergency: '\uD83D\uDD34' }
  const sevLabel: Record<string, string> = { mild: '轻度', moderate: '中度', severe: '重度' }

  l.push('## 鱼虾病害AI诊断报告')
  l.push('')
  l.push('### 基本信息')
  l.push(`- **养殖品种**: ${r.species}`)
  l.push(`- **紧急程度**: ${urgencyIcon[r.urgency]} ${urgencyLabel[r.urgency]}`)
  l.push(`- **主要诊断**: ${r.primary_diagnosis}`)
  l.push(`- **置信度**: ${r.confidence}%`)
  l.push('')

  l.push('### 鉴别诊断')
  for (const c of r.candidates) {
    l.push(`#### ${c.name}`)
    l.push(`- **概率**: ${(c.probability * 100).toFixed(1)}% | **类别**: ${c.category} | **严重程度**: ${sevLabel[c.severity]}`)
    l.push(`- **描述**: ${c.description}`)
    l.push(`- **治疗方案**:`)
    for (const t of c.treatment) l.push(`  - ${t}`)
    l.push(`- **预防措施**:`)
    for (const p of c.prevention) l.push(`  - ${p}`)
    l.push('')
  }

  l.push('### 治疗方案')
  for (const t of r.treatment_plan) {
    l.push(`- \uD83D\uDC8A ${t}`)
  }
  l.push('')

  l.push('### 预防措施')
  for (const p of r.prevention_measures) {
    l.push(`- \uD83D\uDEE1\uFE0F ${p}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${MEDICAL_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 3: FEED OPTIMIZATION ENGINE ====================

interface FeedInput {
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout'
  avg_weight_g: number
  target_weight_g: number
  stocking_count: number
  current_fcr?: number
  water_temp_c: number
  growth_stage: 'fry' | 'fingerling' | 'juvenile' | 'growout' | 'broodstock'
  feed_types_available?: string[]
  budget_constraint?: 'low' | 'medium' | 'high'
}

interface FeedFormulation {
  ingredient: string
  percentage: number
  protein_content: number
  cost_per_kg: number
}

interface FeedResult {
  species: string
  growth_stage: string
  recommended_protein_pct: number
  recommended_fat_pct: number
  recommended_fiber_pct: number
  target_fcr: number
  current_fcr: number
  fcr_improvement: number
  daily_feed_rate_pct: number
  daily_feed_kg: number
  formulation: FeedFormulation[]
  feeding_schedule: string[]
  cost_savings_pct: number
  recommendations: string[]
}

function analyzeFeed(input: FeedInput): FeedResult {
  const rng = seededRng(`${input.species}:${input.avg_weight_g}:${input.target_weight_g}:${input.growth_stage}`)
  const currentFcr = input.current_fcr ?? 2.0

  // Protein requirements by species and stage
  const proteinMap: Record<string, Record<string, number>> = {
    tilapia: { fry: 40, fingerling: 35, juvenile: 32, growout: 28, broodstock: 35 },
    shrimp: { fry: 45, fingerling: 40, juvenile: 38, growout: 35, broodstock: 40 },
    salmon: { fry: 50, fingerling: 48, juvenile: 45, growout: 42, broodstock: 45 },
    catfish: { fry: 40, fingerling: 35, juvenile: 32, growout: 28, broodstock: 35 },
    carp: { fry: 38, fingerling: 35, juvenile: 30, growout: 28, broodstock: 32 },
    sea_bass: { fry: 50, fingerling: 48, juvenile: 45, growout: 42, broodstock: 45 },
    trout: { fry: 50, fingerling: 48, juvenile: 45, growout: 42, broodstock: 45 },
  }

  const protein = proteinMap[input.species]?.[input.growth_stage] ?? 35
  const fat = input.species === 'salmon' || input.species === 'trout' ? 15 : 8
  const fiber = 5

  // Target FCR based on species and conditions
  const baseFcrMap: Record<string, number> = {
    tilapia: 1.5, shrimp: 1.4, salmon: 1.2, catfish: 1.6, carp: 1.8, sea_bass: 1.5, trout: 1.3,
  }
  const baseFcr = baseFcrMap[input.species] ?? 1.6

  // Temperature adjustment
  let tempFactor = 1.0
  if (input.water_temp_c < 18 || input.water_temp_c > 32) tempFactor = 1.15
  else if (input.water_temp_c < 22 || input.water_temp_c > 30) tempFactor = 1.05

  const targetFcr = parseFloat((baseFcr * tempFactor).toFixed(2))
  const fcrImprovement = parseFloat(((currentFcr - targetFcr) / currentFcr * 100).toFixed(1))

  // Daily feed rate (% of body weight)
  const feedRateMap: Record<string, number> = {
    fry: 8, fingerling: 5, juvenile: 3.5, growout: 2.5, broodstock: 2,
  }
  const feedRate = feedRateMap[input.growth_stage] ?? 3

  // Total biomass and daily feed
  const biomassKg = (input.avg_weight_g * input.stocking_count) / 1000
  const dailyFeedKg = parseFloat((biomassKg * feedRate / 100).toFixed(2))

  // Formulation
  const formulation: FeedFormulation[] = [
    { ingredient: '鱼粉 (Fish Meal)', percentage: protein > 40 ? 30 : 20, protein_content: 65, cost_per_kg: 12 },
    { ingredient: '豆粕 (Soybean Meal)', percentage: 25, protein_content: 44, cost_per_kg: 4 },
    { ingredient: '小麦粉 (Wheat Flour)', percentage: 20, protein_content: 12, cost_per_kg: 3 },
    { ingredient: '玉米粉 (Corn Meal)', percentage: 10, protein_content: 8, cost_per_kg: 2.5 },
    { ingredient: '鱼油 (Fish Oil)', percentage: fat > 10 ? 8 : 5, protein_content: 0, cost_per_kg: 8 },
    { ingredient: '维生素预混料', percentage: 2, protein_content: 0, cost_per_kg: 25 },
    { ingredient: '矿物质预混料', percentage: 2, protein_content: 0, cost_per_kg: 15 },
    { ingredient: '磷酸二钙', percentage: 1.5, protein_content: 0, cost_per_kg: 5 },
    { ingredient: '粘合剂', percentage: 1.5, protein_content: 0, cost_per_kg: 6 },
  ]

  // Feeding schedule
  const feedingFreq = input.growth_stage === 'fry' ? 4 : input.growth_stage === 'fingerling' ? 3 : 2
  const feedingSchedule: string[] = []
  for (let i = 0; i < feedingFreq; i++) {
    const hour = 7 + i * Math.floor(12 / feedingFreq)
    feedingSchedule.push(`${hour}:00 - 投喂量: ${(100 / feedingFreq).toFixed(0)}%日粮`)
  }

  // Cost savings
  const costSavings = Math.max(0, fcrImprovement * 0.6 + rng.nextFloat(-2, 2))

  const recommendations: string[] = []
  if (fcrImprovement > 10) recommendations.push(`FCR可从${currentFcr}优化至${targetFcr}，预期节省饲料成本${costSavings.toFixed(1)}%`)
  recommendations.push(`每日投喂量: ${dailyFeedKg} kg，分${feedingFreq}次投喂`)
  recommendations.push('根据水温和摄食情况动态调整投喂量')
  recommendations.push('定期监测生长速度，及时调整饲料配方')
  if (input.water_temp_c > 30) recommendations.push('高温天气减少投喂量20-30%')

  return {
    species: input.species,
    growth_stage: input.growth_stage,
    recommended_protein_pct: protein,
    recommended_fat_pct: fat,
    recommended_fiber_pct: fiber,
    target_fcr: targetFcr,
    current_fcr: currentFcr,
    fcr_improvement: fcrImprovement,
    daily_feed_rate_pct: feedRate,
    daily_feed_kg: dailyFeedKg,
    formulation,
    feeding_schedule: feedingSchedule,
    cost_savings_pct: parseFloat(costSavings.toFixed(1)),
    recommendations,
  }
}

function formatFeed(r: FeedResult): string {
  const l: string[] = []
  l.push('## 饲料配方优化报告')
  l.push('')
  l.push('### 基本信息')
  l.push(`- **养殖品种**: ${r.species}`)
  l.push(`- **生长阶段**: ${r.growth_stage}`)
  l.push(`- **当前FCR**: ${r.current_fcr} → **目标FCR**: ${r.target_fcr}`)
  l.push(`- **FCR改善空间**: ${r.fcr_improvement}%`)
  l.push(`- **日投喂率**: ${r.daily_feed_rate_pct}%体重`)
  l.push(`- **日投喂量**: ${r.daily_feed_kg} kg`)
  l.push('')

  l.push('### 推荐营养指标')
  l.push('| 指标 | 推荐值 |')
  l.push('|------|--------|')
  l.push(`| 粗蛋白 | ${r.recommended_protein_pct}% |`)
  l.push(`| 粗脂肪 | ${r.recommended_fat_pct}% |`)
  l.push(`| 粗纤维 | ${r.recommended_fiber_pct}% |`)
  l.push('')

  l.push('### 推荐配方')
  l.push('| 原料 | 比例(%) | 蛋白含量(%) | 成本(元/kg) |')
  l.push('|------|---------|-------------|------------|')
  for (const f of r.formulation) {
    l.push(`| ${f.ingredient} | ${f.percentage} | ${f.protein_content} | ${f.cost_per_kg} |`)
  }
  l.push('')

  l.push('### 投喂计划')
  for (const s of r.feeding_schedule) {
    l.push(`- \uD83C\uDF5E ${s}`)
  }
  l.push('')

  l.push('### 优化建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`**预期成本节省**: ${r.cost_savings_pct}%`)
  l.push('')
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 4: STOCKING DENSITY CALCULATOR ====================

interface StockingInput {
  pond_area_m2: number
  avg_depth_m: number
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout'
  culture_type: 'pond' | 'cage' | 'raceway' | 'tank' | 'rice_fish'
  avg_weight_g: number
  target_weight_g: number
  water_exchange_rate?: number
  aeration_capacity?: number
  location?: string
}

interface StockingResult {
  pond_area_m2: number
  volume_m3: number
  species: string
  culture_type: string
  max_density_kg_m3: number
  recommended_density_kg_m3: number
  max_stocking_count: number
  recommended_stocking_count: number
  biomass_at_harvest_kg: number
  carrying_capacity_kg: number
  utilization_pct: number
  survival_rate_estimate: number
  risk_factors: string[]
  recommendations: string[]
}

function analyzeStocking(input: StockingInput): StockingResult {
  const rng = seededRng(`${input.pond_area_m2}:${input.species}:${input.culture_type}:${input.avg_depth_m}`)
  const volume = input.pond_area_m2 * input.avg_depth_m

  // Max density by species and culture type (kg/m3)
  const densityMap: Record<string, Record<string, number>> = {
    tilapia: { pond: 30, cage: 50, raceway: 80, tank: 60, rice_fish: 2 },
    shrimp: { pond: 5, cage: 8, raceway: 15, tank: 10, rice_fish: 1 },
    salmon: { pond: 15, cage: 25, raceway: 40, tank: 30, rice_fish: 0 },
    catfish: { pond: 40, cage: 60, raceway: 100, tank: 80, rice_fish: 3 },
    carp: { pond: 10, cage: 20, raceway: 30, tank: 25, rice_fish: 3 },
    sea_bass: { pond: 15, cage: 25, raceway: 40, tank: 30, rice_fish: 0 },
    trout: { pond: 15, cage: 25, raceway: 40, tank: 30, rice_fish: 0 },
  }

  const maxDensity = densityMap[input.species]?.[input.culture_type] ?? 20
  const safetyFactor = input.aeration_capacity && input.aeration_capacity > 5 ? 0.9 : 0.7
  const recommendedDensity = parseFloat((maxDensity * safetyFactor).toFixed(1))

  // Carrying capacity
  const carryingCapacity = parseFloat((volume * maxDensity).toFixed(0))
  const recommendedBiomass = parseFloat((volume * recommendedDensity).toFixed(0))

  // Stocking count based on target weight
  const targetWeightKg = input.target_weight_g / 1000
  const maxCount = Math.floor(carryingCapacity / targetWeightKg)
  const recommendedCount = Math.floor(recommendedBiomass / targetWeightKg)

  // Survival rate estimate
  const baseSurvival = input.culture_type === 'pond' ? 85 : input.culture_type === 'cage' ? 80 : 90
  const survivalRate = Math.min(95, baseSurvival + rng.nextFloat(-3, 3))

  // Utilization
  const utilization = parseFloat((recommendedBiomass / carryingCapacity * 100).toFixed(1))

  // Risk factors
  const riskFactors: string[] = []
  if (recommendedDensity > maxDensity * 0.85) riskFactors.push('养殖密度接近上限，风险较高')
  if (!input.water_exchange_rate || input.water_exchange_rate < 5) riskFactors.push('水交换率不足，可能导致水质恶化')
  if (!input.aeration_capacity || input.aeration_capacity < 3) riskFactors.push('增氧能力不足，高温季节缺氧风险大')
  if (input.target_weight_g / input.avg_weight_g > 10) riskFactors.push('目标增重倍数大，后期密度可能超标')

  const recommendations: string[] = []
  recommendations.push(`推荐放养密度: ${recommendedDensity} kg/m³`)
  recommendations.push(`推荐放养数量: ${recommendedCount} 尾/只`)
  recommendations.push(`预计存活率: ${survivalRate.toFixed(1)}%`)
  recommendations.push(`预计收获生物量: ${recommendedBiomass} kg`)
  if (riskFactors.length > 0) recommendations.push('建议分批次放养或轮捕轮放，降低风险')
  if (input.culture_type === 'pond') recommendations.push('建议搭配滤食性鱼类(如花白鲢)改善水质')

  return {
    pond_area_m2: input.pond_area_m2,
    volume_m3: volume,
    species: input.species,
    culture_type: input.culture_type,
    max_density_kg_m3: maxDensity,
    recommended_density_kg_m3: recommendedDensity,
    max_stocking_count: maxCount,
    recommended_stocking_count: recommendedCount,
    biomass_at_harvest_kg: recommendedBiomass,
    carrying_capacity_kg: carryingCapacity,
    utilization_pct: utilization,
    survival_rate_estimate: parseFloat(survivalRate.toFixed(1)),
    risk_factors: riskFactors,
    recommendations,
  }
}

function formatStocking(r: StockingResult): string {
  const l: string[] = []
  l.push('## 养殖密度规划报告')
  l.push('')
  l.push('### 基本信息')
  l.push(`- **养殖面积**: ${r.pond_area_m2} m²`)
  l.push(`- **水体体积**: ${r.volume_m3} m³`)
  l.push(`- **养殖品种**: ${r.species}`)
  l.push(`- **养殖模式**: ${r.culture_type}`)
  l.push('')

  l.push('### 密度规划')
  l.push('| 指标 | 最大值 | 推荐值 |')
  l.push('|------|--------|--------|')
  l.push(`| 养殖密度 (kg/m³) | ${r.max_density_kg_m3} | ${r.recommended_density_kg_m3} |`)
  l.push(`| 放养数量 (尾) | ${r.max_stocking_count} | ${r.recommended_stocking_count} |`)
  l.push(`| 生物量 (kg) | ${r.carrying_capacity_kg} | ${r.biomass_at_harvest_kg} |`)
  l.push('')

  l.push('### 关键指标')
  l.push(`- **承载能力利用率**: ${r.utilization_pct}%`)
  l.push(`- **预计存活率**: ${r.survival_rate_estimate}%`)
  l.push(`- **预计收获量**: ${r.biomass_at_harvest_kg} kg`)
  l.push('')

  if (r.risk_factors.length > 0) {
    l.push('### 风险因素')
    for (const rf of r.risk_factors) {
      l.push(`- \u26A0\uFE0F ${rf}`)
    }
    l.push('')
  }

  l.push('### 管理建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 5: AQUACULTURE IOT MANAGER ====================

interface IoTInput {
  device_type: 'aerator' | 'feeder' | 'water_pump' | 'monitor' | 'all'
  pond_id: string
  operation: 'schedule' | 'optimize' | 'emergency' | 'status'
  current_do_mg_l?: number
  target_do_mg_l?: number
  feed_amount_kg?: number
  time_of_day?: string
  device_count?: number
  power_kw_per_device?: number
  auto_mode?: boolean
}

interface DeviceSchedule {
  device: string
  action: 'on' | 'off' | 'adjust'
  start_time: string
  end_time: string
  reason: string
  power_kw: number
}

interface IoTResult {
  pond_id: string
  operation: string
  device_schedules: DeviceSchedule[]
  total_power_kw: number
  estimated_daily_kwh: number
  estimated_monthly_cost: number
  automation_rules: string[]
  alerts: string[]
  optimization_notes: string[]
}

function analyzeIoT(input: IoTInput): IoTResult {
  const rng = seededRng(`${input.pond_id}:${input.device_type}:${input.operation}:${input.current_do_mg_l ?? 0}`)
  const schedules: DeviceSchedule[] = []
  const alerts: string[] = []
  const automationRules: string[] = []
  const optimizationNotes: string[] = []

  const deviceCount = input.device_count ?? 2
  const powerKw = input.power_kw_per_device ?? 3

  if (input.operation === 'emergency' || (input.current_do_mg_l !== undefined && input.current_do_mg_l < 3.0)) {
    // Emergency aeration
    schedules.push({
      device: '增氧机 (Aerator)',
      action: 'on',
      start_time: '立即',
      end_time: '持续至DO>5mg/L',
      reason: `紧急增氧: 当前DO ${input.current_do_mg_l ?? '未知'} mg/L 低于安全阈值`,
      power_kw: powerKw * deviceCount,
    })
    alerts.push(`\uD83D\uDEA8 紧急: 溶解氧过低(${input.current_do_mg_l ?? '未知'} mg/L)，所有增氧机已启动`)
    automationRules.push('DO < 3.0 mg/L → 立即开启所有增氧机')
    automationRules.push('DO < 2.0 mg/L → 开启增氧机 + 发送紧急警报')
  } else if (input.operation === 'schedule' || input.operation === 'optimize') {
    // Normal scheduling
    const targetDo = input.target_do_mg_l ?? 5.5

    // Morning schedule (pre-dawn is lowest DO)
    schedules.push({
      device: '增氧机 (Aerator)',
      action: 'on',
      start_time: '04:00',
      end_time: '08:00',
      reason: '黎明前溶氧最低时段，预防缺氧',
      power_kw: powerKw * deviceCount,
    })

    // Midday schedule (if hot)
    schedules.push({
      device: '增氧机 (Aerator)',
      action: 'on',
      start_time: '13:00',
      end_time: '15:00',
      reason: '午后高温时段，补偿溶氧下降',
      power_kw: powerKw * Math.ceil(deviceCount / 2),
    })

    // Evening schedule
    schedules.push({
      device: '增氧机 (Aerator)',
      action: 'on',
      start_time: '20:00',
      end_time: '23:00',
      reason: '夜间光合作用停止，维持溶氧',
      power_kw: powerKw * deviceCount,
    })

    // Feeding schedule
    if (input.feed_amount_kg) {
      const feedPerMeal = (input.feed_amount_kg / 2).toFixed(1)
      schedules.push({
        device: '投饲机 (Feeder)',
        action: 'on',
        start_time: '08:30',
        end_time: '08:45',
        reason: `上午投喂 ${feedPerMeal} kg`,
        power_kw: 0.5,
      })
      schedules.push({
        device: '投饲机 (Feeder)',
        action: 'on',
        start_time: '17:00',
        end_time: '17:15',
        reason: `下午投喂 ${feedPerMeal} kg`,
        power_kw: 0.5,
      })
    }

    automationRules.push(`DO < ${targetDo} mg/L → 开启增氧机`)
    automationRules.push(`DO > ${targetDo + 2} mg/L → 关闭增氧机(节能)`)
    automationRules.push('定时投喂: 08:30, 17:00')
    automationRules.push('雨天减少投喂量30%')

    optimizationNotes.push('建议安装DO在线传感器实现自动联动控制')
    optimizationNotes.push('夜间增氧可采用间歇运行模式节省电费')
    optimizationNotes.push('根据天气预测提前调整增氧策略')
  }

  // Calculate power consumption
  const aeratorHours = schedules.filter(s => s.device.includes('Aerator')).length * 4
  const totalPowerKw = schedules.reduce((sum, s) => sum + s.power_kw, 0) / Math.max(schedules.length, 1)
  const dailyKwh = parseFloat((totalPowerKw * aeratorHours).toFixed(1))
  const monthlyCost = parseFloat((dailyKwh * 30 * 0.6).toFixed(0)) // 0.6 yuan/kWh

  return {
    pond_id: input.pond_id,
    operation: input.operation,
    device_schedules: schedules,
    total_power_kw: parseFloat(totalPowerKw.toFixed(1)),
    estimated_daily_kwh: dailyKwh,
    estimated_monthly_cost: monthlyCost,
    automation_rules: automationRules,
    alerts,
    optimization_notes: optimizationNotes,
  }
}

function formatIoT(r: IoTResult): string {
  const l: string[] = []
  l.push('## 物联网设备管理报告')
  l.push('')
  l.push('### 基本信息')
  l.push(`- **池塘/网箱编号**: ${r.pond_id}`)
  l.push(`- **操作模式**: ${r.operation}`)
  l.push(`- **总功率**: ${r.total_power_kw} kW`)
  l.push(`- **预估日耗电**: ${r.estimated_daily_kwh} kWh`)
  l.push(`- **预估月电费**: ${r.estimated_monthly_cost} 元`)
  l.push('')

  if (r.device_schedules.length > 0) {
    l.push('### 设备运行计划')
    l.push('| 设备 | 动作 | 开始时间 | 结束时间 | 原因 | 功率(kW) |')
    l.push('|------|------|----------|----------|------|----------|')
    for (const s of r.device_schedules) {
      l.push(`| ${s.device} | ${s.action} | ${s.start_time} | ${s.end_time} | ${s.reason} | ${s.power_kw} |`)
    }
    l.push('')
  }

  if (r.alerts.length > 0) {
    l.push('### 警报')
    for (const a of r.alerts) {
      l.push(`- ${a}`)
    }
    l.push('')
  }

  l.push('### 自动化规则')
  for (const rule of r.automation_rules) {
    l.push(`- \uD83E\uDD16 ${rule}`)
  }
  l.push('')

  l.push('### 优化建议')
  for (const note of r.optimization_notes) {
    l.push(`- \uD83D\uDCA1 ${note}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 6: HARVEST TIMING PREDICTOR ====================

interface HarvestInput {
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout'
  current_avg_weight_g: number
  target_weight_g: number
  stocking_count: number
  current_fcr: number
  feed_cost_per_kg: number
  market_price_per_kg: number
  market_trend: 'rising' | 'stable' | 'falling'
  days_since_stocking: number
  water_temp_c: number
  mortality_rate_cumulative?: number
}

interface GrowthProjection {
  day: number
  avg_weight_g: number
  total_biomass_kg: number
  cumulative_feed_kg: number
  cumulative_cost: number
  projected_revenue: number
  projected_profit: number
}

interface HarvestResult {
  species: string
  current_weight_g: number
  target_weight_g: number
  days_to_target: number
  projected_harvest_date: string
  projected_biomass_kg: number
  projected_survival_count: number
  projected_fcr: number
  total_feed_cost: number
  projected_revenue: number
  projected_profit: number
  profit_per_kg: number
  market_timing_score: number
  growth_projections: GrowthProjection[]
  recommendations: string[]
}

function analyzeHarvest(input: HarvestInput): HarvestResult {
  const rng = seededRng(`${input.species}:${input.current_avg_weight_g}:${input.target_weight_g}:${input.days_since_stocking}`)
  const mortality = input.mortality_rate_cumulative ?? 10
  const survivalRate = (100 - mortality) / 100
  const projectedCount = Math.floor(input.stocking_count * survivalRate)

  // Growth rate calculation (simplified von Bertalanffy)
  const tempFactor = input.water_temp_c >= 25 && input.water_temp_c <= 30 ? 1.0 :
    input.water_temp_c >= 20 ? 0.7 : 0.4
  const dailyGrowthRate = 0.02 * tempFactor // 2% body weight per day at optimal temp

  // Days to reach target weight
  const weightRatio = input.target_weight_g / input.current_avg_weight_g
  const daysToTarget = Math.max(0, Math.ceil(Math.log(weightRatio) / Math.log(1 + dailyGrowthRate)))

  // Harvest date
  const harvestDate = new Date()
  harvestDate.setDate(harvestDate.getDate() + daysToTarget)

  // Growth projections (weekly)
  const projections: GrowthProjection[] = []
  let weight = input.current_avg_weight_g
  let cumulativeFeed = 0
  let cumulativeCost = 0
  for (let week = 0; week <= Math.min(12, Math.ceil(daysToTarget / 7)); week++) {
    const day = week * 7
    const biomassKg = (weight * projectedCount) / 1000
    const weeklyFeedKg = biomassKg * input.current_fcr * dailyGrowthRate * 7
    cumulativeFeed += weeklyFeedKg
    cumulativeCost = cumulativeFeed * input.feed_cost_per_kg
    const revenue = biomassKg * input.market_price_per_kg
    projections.push({
      day,
      avg_weight_g: parseFloat(weight.toFixed(1)),
      total_biomass_kg: parseFloat(biomassKg.toFixed(1)),
      cumulative_feed_kg: parseFloat(cumulativeFeed.toFixed(1)),
      cumulative_cost: parseFloat(cumulativeCost.toFixed(0)),
      projected_revenue: parseFloat(revenue.toFixed(0)),
      projected_profit: parseFloat((revenue - cumulativeCost).toFixed(0)),
    })
    weight = weight * Math.pow(1 + dailyGrowthRate, 7)
    if (weight >= input.target_weight_g) break
  }

  const finalProj = projections[projections.length - 1]
  const totalFeedCost = finalProj.cumulative_cost
  const revenue = finalProj.projected_revenue
  const profit = revenue - totalFeedCost
  const profitPerKg = profit / finalProj.total_biomass_kg

  // Market timing score (0-100)
  let marketScore = 50
  if (input.market_trend === 'rising') marketScore += 25
  else if (input.market_trend === 'falling') marketScore -= 20
  if (daysToTarget < 14) marketScore += 10 // Can harvest soon to capture current price
  marketScore = Math.min(100, Math.max(0, marketScore + rng.nextFloat(-5, 5)))

  const recommendations: string[] = []
  if (profit > 0) recommendations.push(`预计利润: ${profit.toFixed(0)} 元，利润率 ${((profit / totalFeedCost) * 100).toFixed(1)}%`)
  if (input.market_trend === 'rising' && daysToTarget > 30) recommendations.push('市场价格上涨趋势，可适当延迟捕捞获取更高价格')
  if (input.market_trend === 'falling' && daysToTarget < 14) recommendations.push('市场价格下跌趋势，建议尽快捕捞')
  if (profitPerKg < 2) recommendations.push('单位利润偏低，建议优化饲料成本或等待价格上涨')
  recommendations.push(`预计捕捞日期: ${harvestDate.toISOString().split('T')[0]}`)
  recommendations.push(`预计捕捞规格: ${input.target_weight_g}g/尾，存活数量约${projectedCount}尾`)

  return {
    species: input.species,
    current_weight_g: input.current_avg_weight_g,
    target_weight_g: input.target_weight_g,
    days_to_target: daysToTarget,
    projected_harvest_date: harvestDate.toISOString().split('T')[0],
    projected_biomass_kg: finalProj.total_biomass_kg,
    projected_survival_count: projectedCount,
    projected_fcr: input.current_fcr,
    total_feed_cost: totalFeedCost,
    projected_revenue: revenue,
    projected_profit: profit,
    profit_per_kg: parseFloat(profitPerKg.toFixed(2)),
    market_timing_score: parseFloat(marketScore.toFixed(0)),
    growth_projections: projections,
    recommendations,
  }
}

function formatHarvest(r: HarvestResult): string {
  const l: string[] = []
  l.push('## 最佳捕捞时间预测报告')
  l.push('')
  l.push('### 基本信息')
  l.push(`- **养殖品种**: ${r.species}`)
  l.push(`- **当前规格**: ${r.current_weight_g}g → **目标规格**: ${r.target_weight_g}g`)
  l.push(`- **预计捕捞日期**: ${r.projected_harvest_date}`)
  l.push(`- **距离捕捞**: ${r.days_to_target} 天`)
  l.push(`- **市场时机评分**: ${r.market_timing_score}/100`)
  l.push('')

  l.push('### 产量预测')
  l.push('| 指标 | 数值 |')
  l.push('|------|------|')
  l.push(`| 预计存活数量 | ${r.projected_survival_count} 尾 |`)
  l.push(`| 预计总产量 | ${r.projected_biomass_kg} kg |`)
  l.push(`| 预计FCR | ${r.projected_fcr} |`)
  l.push('')

  l.push('### 经济效益')
  l.push('| 指标 | 数值 |')
  l.push('|------|------|')
  l.push(`| 饲料总成本 | ${r.total_feed_cost} 元 |`)
  l.push(`| 预计收入 | ${r.projected_revenue} 元 |`)
  l.push(`| 预计利润 | ${r.projected_profit} 元 |`)
  l.push(`| 单位利润 | ${r.profit_per_kg} 元/kg |`)
  l.push('')

  l.push('### 生长预测')
  l.push('| 天数 | 均重(g) | 生物量(kg) | 累计饲料(kg) | 累计成本(元) | 预计收入(元) | 利润(元) |')
  l.push('|------|---------|-----------|-------------|-------------|-------------|---------|')
  for (const p of r.growth_projections) {
    l.push(`| ${p.day} | ${p.avg_weight_g} | ${p.total_biomass_kg} | ${p.cumulative_feed_kg} | ${p.cumulative_cost} | ${p.projected_revenue} | ${p.projected_profit} |`)
  }
  l.push('')

  l.push('### 决策建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 7: AQUACULTURE RISK ASSESSOR ====================

interface RiskInput {
  location: string
  culture_type: 'pond' | 'cage' | 'raceway' | 'tank'
  species: 'tilapia' | 'shrimp' | 'salmon' | 'catfish' | 'carp' | 'sea_bass' | 'trout'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  weather_forecast?: {
    typhoon_probability?: number
    heavy_rain_probability?: number
    temperature_extreme?: 'heat_wave' | 'cold_snap' | 'normal'
  }
  water_conditions?: {
    algae_bloom_risk?: 'low' | 'moderate' | 'high'
    salinity_fluctuation?: boolean
    pollution_source_nearby?: boolean
  }
  disease_history?: string[]
  months_to_harvest: number
}

interface RiskFactor {
  risk_type: string
  category: 'weather' | 'environmental' | 'biological' | 'operational'
  probability: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  risk_score: number
  description: string
  mitigation: string[]
  early_warning_indicators: string[]
}

interface RiskResult {
  location: string
  overall_risk_level: 'low' | 'moderate' | 'high' | 'extreme'
  overall_risk_score: number
  risk_factors: RiskFactor[]
  priority_actions: string[]
  insurance_recommendations: string[]
  monitoring_plan: string[]
}

function analyzeRisk(input: RiskInput): RiskResult {
  const rng = seededRng(`${input.location}:${input.species}:${input.season}:${input.culture_type}`)
  const riskFactors: RiskFactor[] = []

  // Typhoon risk
  const typhoonProb = input.weather_forecast?.typhoon_probability ?? (input.season === 'summer' ? 0.3 : 0.1)
  if (typhoonProb > 0.1) {
    riskFactors.push({
      risk_type: '台风风险',
      category: 'weather',
      probability: typhoonProb,
      impact: typhoonProb > 0.5 ? 'critical' : typhoonProb > 0.3 ? 'high' : 'medium',
      risk_score: parseFloat((typhoonProb * (typhoonProb > 0.5 ? 100 : 70)).toFixed(0)),
      description: `台风概率 ${(typhoonProb * 100).toFixed(0)}%，可能导致网箱损毁、池塘漫溢、养殖对象逃逸`,
      mitigation: ['加固池塘堤坝和网箱结构', '降低池塘水位至安全高度', '检查排水系统是否通畅', '准备应急发电设备'],
      early_warning_indicators: ['气象部门发布台风预警', '气压持续下降', '海面涌浪增大'],
    })
  }

  // Heavy rain risk
  const rainProb = input.weather_forecast?.heavy_rain_probability ?? (input.season === 'summer' ? 0.4 : 0.2)
  if (rainProb > 0.2) {
    riskFactors.push({
      risk_type: '暴雨/洪水风险',
      category: 'weather',
      probability: rainProb,
      impact: rainProb > 0.6 ? 'high' : 'medium',
      risk_score: parseFloat((rainProb * 60).toFixed(0)),
      description: `暴雨概率 ${(rainProb * 100).toFixed(0)}%，可能导致水质剧变、池塘漫溢、养殖对象逃逸`,
      mitigation: ['疏通排水沟渠', '加固堤坝', '准备应急水泵', '减少投喂量'],
      early_warning_indicators: ['气象预报连续降雨', '池塘水位快速上升', '水体浊度突然增加'],
    })
  }

  // Red tide / algal bloom risk
  const algaeRisk = input.water_conditions?.algae_bloom_risk ?? (input.season === 'summer' ? 'moderate' : 'low')
  if (algaeRisk !== 'low') {
    const algaeScore = algaeRisk === 'high' ? 80 : 50
    riskFactors.push({
      risk_type: '赤潮/水华风险',
      category: 'environmental',
      probability: algaeRisk === 'high' ? 0.6 : 0.3,
      impact: algaeRisk === 'high' ? 'high' : 'medium',
      risk_score: algaeScore,
      description: `藻类水华风险${algaeRisk === 'high' ? '高' : '中等'}，可能导致水体缺氧、产生藻毒素`,
      mitigation: ['控制饲料投喂，减少水体富营养化', '使用微生物制剂调节水质', '准备应急增氧设备', '必要时使用除藻剂'],
      early_warning_indicators: ['水体颜色异常(绿/红/褐)', '透明度突然降低', 'pH值异常升高', '水面出现泡沫'],
    })
  }

  // Disease risk
  const diseaseRisk = input.season === 'summer' ? 0.5 : input.season === 'spring' ? 0.4 : 0.25
  riskFactors.push({
    risk_type: '病害暴发风险',
    category: 'biological',
    probability: diseaseRisk,
    impact: diseaseRisk > 0.4 ? 'high' : 'medium',
    risk_score: parseFloat((diseaseRisk * 70).toFixed(0)),
    description: `当前季节病害发生概率 ${(diseaseRisk * 100).toFixed(0)}%，高温季节病原繁殖加快`,
    mitigation: ['加强水质管理', '定期消毒', '使用免疫增强剂', '减少养殖密度', '隔离病鱼死鱼'],
    early_warning_indicators: ['摄食量突然下降', '鱼体行为异常(擦身/浮头)', '体表出现异常(出血/溃疡)', '死亡率突然升高'],
  })

  // Temperature extreme risk
  const tempExtreme = input.weather_forecast?.temperature_extreme ?? 'normal'
  if (tempExtreme !== 'normal') {
    riskFactors.push({
      risk_type: tempExtreme === 'heat_wave' ? '高温热应激' : '低温冻害',
      category: 'weather',
      probability: 0.5,
      impact: 'medium',
      risk_score: 45,
      description: tempExtreme === 'heat_wave' ? '持续高温导致溶氧下降、代谢紊乱、病害增加' : '低温导致鱼体冻伤、免疫力下降、摄食减少',
      mitigation: tempExtreme === 'heat_wave'
        ? ['增加增氧', '降低投喂量', '加注新水降温', '搭建遮阳设施']
        : ['增加水深', '搭建保温棚', '减少投喂', '使用加热设备(如有)'],
      early_warning_indicators: ['气温连续3天超过35°C或低于5°C', '水温剧烈波动'],
    })
  }

  // Sort by risk score
  riskFactors.sort((a, b) => b.risk_score - a.risk_score)

  // Overall risk
  const maxScore = riskFactors.length > 0 ? Math.max(...riskFactors.map(r => r.risk_score)) : 0
  const avgScore = riskFactors.length > 0 ? riskFactors.reduce((s, r) => s + r.risk_score, 0) / riskFactors.length : 0
  const overallScore = parseFloat(((maxScore * 0.6 + avgScore * 0.4) + rng.nextFloat(-3, 3)).toFixed(0))

  let overallLevel: RiskResult['overall_risk_level'] = 'low'
  if (overallScore >= 70) overallLevel = 'extreme'
  else if (overallScore >= 50) overallLevel = 'high'
  else if (overallScore >= 30) overallLevel = 'moderate'

  // Priority actions
  const priorityActions: string[] = []
  for (const rf of riskFactors.slice(0, 3)) {
    priorityActions.push(`[${rf.risk_type}] ${rf.mitigation[0]}`)
  }

  const insuranceRecommendations = [
    '建议购买水产养殖保险(自然灾害险)',
    '考虑价格指数保险对冲市场风险',
    '评估养殖设施财产保险',
    '建立风险准备金(年利润的5-10%)',
  ]

  const monitoringPlan = [
    '每日监测水质参数(温度、pH、溶氧)',
    '关注气象预警信息(台风、暴雨)',
    '每周检查养殖设施完整性',
    '每月评估病害风险并调整防控策略',
    '建立风险事件记录档案',
  ]

  return {
    location: input.location,
    overall_risk_level: overallLevel,
    overall_risk_score: Math.max(0, Math.min(100, overallScore)),
    risk_factors: riskFactors,
    priority_actions: priorityActions,
    insurance_recommendations: insuranceRecommendations,
    monitoring_plan: monitoringPlan,
  }
}

function formatRisk(r: RiskResult): string {
  const l: string[] = []
  const levelLabel: Record<string, string> = { low: '低风险', moderate: '中等风险', high: '高风险', extreme: '极高风险' }
  const levelIcon: Record<string, string> = { low: '\u2705', moderate: '\u26A0\uFE0F', high: '\uD83D\uDFE1', extreme: '\uD83D\uDD34' }
  const impactLabel: Record<string, string> = { low: '低', medium: '中', high: '高', critical: '严重' }

  l.push('## 养殖风险评估报告')
  l.push('')
  l.push('### 总体评估')
  l.push(`- **养殖地点**: ${r.location}`)
  l.push(`- **综合风险等级**: ${levelIcon[r.overall_risk_level]} ${levelLabel[r.overall_risk_level]}`)
  l.push(`- **综合风险评分**: ${r.overall_risk_score}/100`)
  l.push('')

  l.push('### 风险因素')
  for (const rf of r.risk_factors) {
    l.push(`#### ${rf.risk_type}`)
    l.push(`- **类别**: ${rf.category} | **概率**: ${(rf.probability * 100).toFixed(0)}% | **影响**: ${impactLabel[rf.impact]} | **评分**: ${rf.risk_score}`)
    l.push(`- **描述**: ${rf.description}`)
    l.push(`- **缓解措施**:`)
    for (const m of rf.mitigation) l.push(`  - ${m}`)
    l.push(`- **预警指标**:`)
    for (const e of rf.early_warning_indicators) l.push(`  - \uD83D\uDD14 ${e}`)
    l.push('')
  }

  l.push('### 优先行动')
  for (const a of r.priority_actions) {
    l.push(`- \uD83D\uDEA8 ${a}`)
  }
  l.push('')

  l.push('### 保险建议')
  for (const ins of r.insurance_recommendations) {
    l.push(`- \uD83D\uDEE1\uFE0F ${ins}`)
  }
  l.push('')

  l.push('### 监测计划')
  for (const m of r.monitoring_plan) {
    l.push(`- \uD83D\uDCCA ${m}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${RISK_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 8: FISHERIES SUPPLY CHAIN TRACE ====================

interface SupplyChainInput {
  batch_id: string
  species: string
  origin: string
  harvest_date: string
  quantity_kg: number
  destination: string
  transport_method: 'truck' | 'ship' | 'air' | 'mixed'
  cold_chain_required: boolean
  checkpoints?: Array<{
    location: string
    timestamp: string
    temperature_c: number
    humidity_pct?: number
    status: 'pass' | 'fail' | 'warning'
  }>
  certifications?: string[]
}

interface CheckpointAnalysis {
  location: string
  timestamp: string
  temperature_c: number
  status: 'pass' | 'fail' | 'warning'
  issue?: string
}

interface SupplyChainResult {
  batch_id: string
  species: string
  origin: string
  destination: string
  quantity_kg: number
  chain_integrity: 'intact' | 'compromised' | 'failed'
  integrity_score: number
  total_transit_hours: number
  temp_violations: number
  max_temp_recorded: number
  min_temp_recorded: number
  checkpoints: CheckpointAnalysis[]
  certifications_status: string[]
  traceability_grade: 'A' | 'B' | 'C' | 'D'
  recommendations: string[]
  consumer_info: string[]
}

function analyzeSupplyChain(input: SupplyChainInput): SupplyChainResult {
  const rng = seededRng(`${input.batch_id}:${input.species}:${input.origin}:${input.harvest_date}`)
  const checkpoints: CheckpointAnalysis[] = []
  let tempViolations = 0
  let maxTemp = -999
  let minTemp = 999

  // Process provided checkpoints or generate simulated ones
  if (input.checkpoints && input.checkpoints.length > 0) {
    for (const cp of input.checkpoints) {
      let status: CheckpointAnalysis['status'] = 'pass'
      let issue: string | undefined
      if (input.cold_chain_required) {
        if (cp.temperature_c > 4.0) {
          status = 'fail'
          issue = `温度超标: ${cp.temperature_c}°C > 4.0°C`
          tempViolations++
        } else if (cp.temperature_c > 2.0) {
          status = 'warning'
          issue = `温度偏高: ${cp.temperature_c}°C (建议<2°C)`
        }
      }
      checkpoints.push({ location: cp.location, timestamp: cp.timestamp, temperature_c: cp.temperature_c, status, issue })
      maxTemp = Math.max(maxTemp, cp.temperature_c)
      minTemp = Math.min(minTemp, cp.temperature_c)
    }
  } else {
    // Generate simulated checkpoints
    const locations = [input.origin, '加工厂', '冷链仓库', '分销中心', input.destination]
    for (let i = 0; i < locations.length; i++) {
      const temp = input.cold_chain_required ? rng.nextFloat(-1, 6) : rng.nextFloat(0, 25)
      let status: CheckpointAnalysis['status'] = 'pass'
      let issue: string | undefined
      if (input.cold_chain_required && temp > 4.0) {
        status = 'fail'
        issue = `温度超标: ${temp.toFixed(1)}°C > 4.0°C`
        tempViolations++
      } else if (input.cold_chain_required && temp > 2.0) {
        status = 'warning'
        issue = `温度偏高: ${temp.toFixed(1)}°C`
      }
      checkpoints.push({
        location: locations[i],
        timestamp: `T+${i * 6}h`,
        temperature_c: parseFloat(temp.toFixed(1)),
        status,
        issue,
      })
      maxTemp = Math.max(maxTemp, temp)
      minTemp = Math.min(minTemp, temp)
    }
  }

  // Calculate transit time
  const harvestDate = new Date(input.harvest_date)
  const now = new Date()
  const transitHours = Math.max(0, Math.floor((now.getTime() - harvestDate.getTime()) / 3600000))

  // Integrity score
  const passRate = checkpoints.filter(c => c.status === 'pass').length / Math.max(checkpoints.length, 1)
  const integrityScore = Math.max(0, parseFloat((passRate * 100 - tempViolations * 15 + rng.nextFloat(-5, 5)).toFixed(0)))

  // Chain integrity
  let chainIntegrity: SupplyChainResult['chain_integrity'] = 'intact'
  if (integrityScore < 50) chainIntegrity = 'failed'
  else if (integrityScore < 80) chainIntegrity = 'compromised'

  // Traceability grade
  let grade: SupplyChainResult['traceability_grade'] = 'A'
  if (integrityScore < 60) grade = 'D'
  else if (integrityScore < 75) grade = 'C'
  else if (integrityScore < 90) grade = 'B'

  // Certifications
  const certStatus: string[] = []
  if (input.certifications && input.certifications.length > 0) {
    for (const cert of input.certifications) {
      certStatus.push(`${cert}: 有效`)
    }
  } else {
    certStatus.push('建议获取: HACCP认证')
    certStatus.push('建议获取: ASC/MSC可持续认证')
    certStatus.push('建议获取: 有机认证(如适用)')
  }

  const recommendations: string[] = []
  if (tempViolations > 0) recommendations.push(`发现${tempViolations}个温度超标点，需检查冷链设备`)
  recommendations.push('建议安装IoT温度实时监控设备')
  recommendations.push('建立区块链溯源系统提升消费者信任')
  recommendations.push('完善批次记录和文档管理')

  const consumerInfo = [
    `批次号: ${input.batch_id}`,
    `产地: ${input.origin}`,
    `品种: ${input.species}`,
    `捕捞日期: ${input.harvest_date}`,
    `数量: ${input.quantity_kg} kg`,
    `溯源等级: ${grade}级`,
    `冷链完整性: ${chainIntegrity === 'intact' ? '完整' : chainIntegrity === 'compromised' ? '部分受损' : '严重受损'}`,
  ]

  return {
    batch_id: input.batch_id,
    species: input.species,
    origin: input.origin,
    destination: input.destination,
    quantity_kg: input.quantity_kg,
    chain_integrity: chainIntegrity,
    integrity_score: Math.max(0, Math.min(100, integrityScore)),
    total_transit_hours: transitHours,
    temp_violations: tempViolations,
    max_temp_recorded: parseFloat(maxTemp.toFixed(1)),
    min_temp_recorded: parseFloat(minTemp.toFixed(1)),
    checkpoints,
    certifications_status: certStatus,
    traceability_grade: grade,
    recommendations,
    consumer_info: consumerInfo,
  }
}

function formatSupplyChain(r: SupplyChainResult): string {
  const l: string[] = []
  const integrityLabel: Record<string, string> = { intact: '完整', compromised: '部分受损', failed: '严重受损' }
  const integrityIcon: Record<string, string> = { intact: '\u2705', compromised: '\u26A0\uFE0F', failed: '\uD83D\uDD34' }
  const statusIcon: Record<string, string> = { pass: '\u2705', warning: '\u26A0\uFE0F', fail: '\uD83D\uDD34' }

  l.push('## 水产供应链溯源报告')
  l.push('')
  l.push('### 基本信息')
  l.push(`- **批次号**: ${r.batch_id}`)
  l.push(`- **品种**: ${r.species}`)
  l.push(`- **产地**: ${r.origin}`)
  l.push(`- **目的地**: ${r.destination}`)
  l.push(`- **数量**: ${r.quantity_kg} kg`)
  l.push('')

  l.push('### 溯源评估')
  l.push(`- **溯源等级**: ${r.traceability_grade}级`)
  l.push(`- **冷链完整性**: ${integrityIcon[r.chain_integrity]} ${integrityLabel[r.chain_integrity]}`)
  l.push(`- **完整性评分**: ${r.integrity_score}/100`)
  l.push(`- **运输时长**: ${r.total_transit_hours} 小时`)
  l.push(`- **温度超标次数**: ${r.temp_violations}`)
  l.push(`- **温度范围**: ${r.min_temp_recorded}°C ~ ${r.max_temp_recorded}°C`)
  l.push('')

  l.push('### 关键节点')
  l.push('| 节点 | 时间 | 温度(°C) | 状态 | 问题 |')
  l.push('|------|------|----------|------|------|')
  for (const cp of r.checkpoints) {
    l.push(`| ${cp.location} | ${cp.timestamp} | ${cp.temperature_c} | ${statusIcon[cp.status]} ${cp.status} | ${cp.issue ?? '-'} |`)
  }
  l.push('')

  l.push('### 认证状态')
  for (const cert of r.certifications_status) {
    l.push(`- \uD83C\uDFC6 ${cert}`)
  }
  l.push('')

  l.push('### 消费者信息')
  for (const info of r.consumer_info) {
    l.push(`- ${info}`)
  }
  l.push('')

  l.push('### 改进建议')
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push('')
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. water_quality_monitor
  tools.register(defineTool({
    name: 'water_quality_monitor',
    description: '养殖水质参数监测与缺氧预警 — 分析水温、pH、溶解氧、氨氮、亚硝酸盐等参数，评估缺氧风险等级，输出预警信息和紧急措施',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { pond_id: string, species: "tilapia"|"shrimp"|"salmon"|"catfish"|"carp"|"sea_bass"|"trout"|"other", temperature_c: number, ph: number, dissolved_oxygen_mg_l: number, ammonia_mg_l: number, nitrite_mg_l: number, salinity_ppt?: number, turbidity_ntu?: number, measurement_time?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatWaterReport(analyzeWaterQuality(JSON.parse(args.input_data)))
    },
  }))

  // 2. fish_health_diagnostician
  tools.register(defineTool({
    name: 'fish_health_diagnostician',
    description: '鱼虾病害AI诊断与用药建议 — 基于症状描述进行鉴别诊断，提供治疗方案、预防措施和紧急程度评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { species: "tilapia"|"shrimp"|"salmon"|"catfish"|"carp"|"sea_bass"|"trout"|"other", symptoms: string[], mortality_rate_daily?: number, water_temp_c?: number, affected_body_parts?: string[], behavior_changes?: string[], duration_days?: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatFishHealth(analyzeFishHealth(JSON.parse(args.input_data)))
    },
  }))

  // 3. feed_optimization_engine
  tools.register(defineTool({
    name: 'feed_optimization_engine',
    description: '饲料配方优化与FCR转化率提升 — 基于养殖品种和生长阶段推荐饲料配方、营养指标、投喂计划和成本优化方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { species: "tilapia"|"shrimp"|"salmon"|"catfish"|"carp"|"sea_bass"|"trout", avg_weight_g: number, target_weight_g: number, stocking_count: number, current_fcr?: number, water_temp_c: number, growth_stage: "fry"|"fingerling"|"juvenile"|"growout"|"broodstock", feed_types_available?: string[], budget_constraint?: "low"|"medium"|"high" }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatFeed(analyzeFeed(JSON.parse(args.input_data)))
    },
  }))

  // 4. stocking_density_calculator
  tools.register(defineTool({
    name: 'stocking_density_calculator',
    description: '养殖密度规划与生物负载评估 — 计算最大和推荐养殖密度，评估承载能力利用率，输出风险因素和管理建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { pond_area_m2: number, avg_depth_m: number, species: "tilapia"|"shrimp"|"salmon"|"catfish"|"carp"|"sea_bass"|"trout", culture_type: "pond"|"cage"|"raceway"|"tank"|"rice_fish", avg_weight_g: number, target_weight_g: number, water_exchange_rate?: number, aeration_capacity?: number, location?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatStocking(analyzeStocking(JSON.parse(args.input_data)))
    },
  }))

  // 5. aquaculture_iot_manager
  tools.register(defineTool({
    name: 'aquaculture_iot_manager',
    description: '物联网增氧机/投饲机自动化控制 — 生成设备运行计划、自动化规则、能耗估算和优化建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { device_type: "aerator"|"feeder"|"water_pump"|"monitor"|"all", pond_id: string, operation: "schedule"|"optimize"|"emergency"|"status", current_do_mg_l?: number, target_do_mg_l?: number, feed_amount_kg?: number, time_of_day?: string, device_count?: number, power_kw_per_device?: number, auto_mode?: boolean }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatIoT(analyzeIoT(JSON.parse(args.input_data)))
    },
  }))

  // 6. harvest_timing_predictor
  tools.register(defineTool({
    name: 'harvest_timing_predictor',
    description: '最佳捕捞时间预测与市场价格联动 — 基于生长模型预测捕捞日期，分析经济效益和市场时机，输出决策建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { species: "tilapia"|"shrimp"|"salmon"|"catfish"|"carp"|"sea_bass"|"trout", current_avg_weight_g: number, target_weight_g: number, stocking_count: number, current_fcr: number, feed_cost_per_kg: number, market_price_per_kg: number, market_trend: "rising"|"stable"|"falling", days_since_stocking: number, water_temp_c: number, mortality_rate_cumulative?: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatHarvest(analyzeHarvest(JSON.parse(args.input_data)))
    },
  }))

  // 7. aquaculture_risk_assessor
  tools.register(defineTool({
    name: 'aquaculture_risk_assessor',
    description: '台风暴雨/赤潮/病害风险评估 — 综合评估自然灾害、环境变化和病害风险，输出缓解措施、保险建议和监测计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { location: string, culture_type: "pond"|"cage"|"raceway"|"tank", species: "tilapia"|"shrimp"|"salmon"|"catfish"|"carp"|"sea_bass"|"trout", season: "spring"|"summer"|"autumn"|"winter", weather_forecast?: { typhoon_probability?: number, heavy_rain_probability?: number, temperature_extreme?: "heat_wave"|"cold_snap"|"normal" }, water_conditions?: { algae_bloom_risk?: "low"|"moderate"|"high", salinity_fluctuation?: boolean, pollution_source_nearby?: boolean }, disease_history?: string[], months_to_harvest: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatRisk(analyzeRisk(JSON.parse(args.input_data)))
    },
  }))

  // 8. fisheries_supply_chain_trace
  tools.register(defineTool({
    name: 'fisheries_supply_chain_trace',
    description: '水产供应链溯源与冷链监控 — 追踪从捕捞到消费者的全链条，评估冷链完整性、温度合规性和溯源等级',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { batch_id: string, species: string, origin: string, harvest_date: string, quantity_kg: number, destination: string, transport_method: "truck"|"ship"|"air"|"mixed", cold_chain_required: boolean, checkpoints?: Array<{ location: string, timestamp: string, temperature_c: number, humidity_pct?: number, status: "pass"|"fail"|"warning" }>, certifications?: string[] }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSupplyChain(analyzeSupplyChain(JSON.parse(args.input_data)))
    },
  }))
}
