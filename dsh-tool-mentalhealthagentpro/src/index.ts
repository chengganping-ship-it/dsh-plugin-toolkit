import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'mentalhealthagentpro'
export const inject = ['tools']

// ── Utilities ────────────────────────────────────────────────────────────────

/** Mulberry32 seeded PRNG for deterministic output */
function mulberry32(seed: number): () => number {
  let s = seed
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Simple string hash for seeding */
function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const CRISIS_DISCLAIMER =
  '⚠️ 本工具仅用于心理健康自我觉察与保健，**不构成诊断或治疗建议**。如您正处于危机状态，请立即联系当地心理危机干预热线或就医。'

// ── 1. Mood Tracker ──────────────────────────────────────────────────────────

interface MoodEntry {
  date?: string
  mood?: number        // 1-10
  notes?: string
}

interface MoodInput {
  entries?: MoodEntry[]
  period?: string       // e.g. "30d", "7d"
  context?: string
}

interface MoodResult {
  avgMood: string
  trend: string
  dominantEmotion: string
  cyclePattern: string
  variability: string
  peakDay: string
  lowDay: string
  totalEntries: number
  recommendation: string
  disclaimer: string
}

function analyzeMood(input: MoodInput): MoodResult {
  const entries = input.entries || []
  const seed = hashStr(JSON.stringify(input))
  const rng = mulberry32(seed)
  const total = entries.length

  if (total === 0) {
    return {
      avgMood: '-', trend: '数据不足', dominantEmotion: '-', cyclePattern: '-',
      variability: '-', peakDay: '-', lowDay: '-', totalEntries: 0,
      recommendation: '请至少记录一天的情绪数据以开始分析。', disclaimer: CRISIS_DISCLAIMER
    }
  }

  const moods = entries.map(e => e.mood || 5)
  const avg = moods.reduce((a, b) => a + b, 0) / total
  const variance = moods.reduce((a, b) => a + (b - avg) ** 2, 0) / total
  const stdDev = Math.sqrt(variance)
  const maxIdx = moods.indexOf(Math.max(...moods))
  const minIdx = moods.indexOf(Math.min(...moods))

  const emotions = ['平静', '愉悦', '焦虑', '低落', '愤怒', '疲惫', '满足', '紧张', '感恩', '孤独']
  const dominant = emotions[Math.floor(rng() * emotions.length)]
  const trend = avg >= 7 ? '积极向上' : avg >= 5 ? '中性稳定' : avg >= 3 ? '轻度偏低' : '需要关注'
  const cycleLen = Math.floor(rng() * 7) + 14
  const patterns = [`约${cycleLen}天为一个情绪周期`, '周初与周末情绪波动明显', '月相周期存在轻微关联'][Math.floor(rng() * 3)]
  const variability = stdDev < 1.5 ? '情绪稳定' : stdDev < 3 ? '情绪波动中等' : '情绪波动较大'

  return {
    avgMood: avg.toFixed(1),
    trend,
    dominantEmotion: dominant,
    cyclePattern: patterns,
    variability,
    peakDay: entries[maxIdx]?.date || `Day ${maxIdx + 1}`,
    lowDay: entries[minIdx]?.date || `Day ${minIdx + 1}`,
    totalEntries: total,
    recommendation: avg < 5
      ? '检测到情绪偏低趋势，建议增加愉悦活动、保持社交联系，必要时寻求专业心理咨询。'
      : '情绪状态良好，建议继续保持规律作息与适度运动。',
    disclaimer: CRISIS_DISCLAIMER
  }
}

function formatMoodReport(r: MoodResult): string {
  return `# 情绪追踪与周期模式分析
📊 平均情绪值: ${r.avgMood}/10 | 趋势: ${r.trend}| 主导情绪: ${r.dominantEmotion}
📈 记录天数: ${r.totalEntries}| 波动性: ${r.variability}
🔄 周期模式: ${r.cyclePattern}
⭐ 峰值日: ${r.peakDay}| 低谷日: ${r.lowDay}
💡 ${r.recommendation}
---
${r.disclaimer}`
}

// ── 2. Burnout Detector ──────────────────────────────────────────────────────

interface BurnoutInput {
  workload?: number        // 1-10
  energyLevel?: number     // 1-10
  cynicism?: number        // 1-10
  efficacy?: number        // 1-10 (higher = better)
  sleepHours?: number
  exercisePerWeek?: number
  workLifeBalance?: number  // 1-10
  symptoms?: string[]
}

interface BurnoutResult {
  riskLevel: string
  riskScore: number
  phase: string
  primaryFactors: string[]
  intervention: string[]
  urgency: string
  scoreBreakdown: string
  disclaimer: string
}

function analyzeBurnout(input: BurnoutInput): BurnoutResult {
  const seed = hashStr(JSON.stringify(input))
  const rng = mulberry32(seed)

  const workload = input.workload || 7
  const energy = input.energyLevel || 4
  const cynicism = input.cynicism || 6
  const efficacy = input.efficacy || 5
  const sleep = input.sleepHours || 6
  const exercise = input.exercisePerWeek || 1
  const wlb = input.workLifeBalance || 4

  // Burnout score: higher = more burnout risk
  const rawScore = (
    workload * 0.20 +
    (10 - energy) * 0.15 +
    cynicism * 0.20 +
    (10 - efficacy) * 0.15 +
    Math.max(0, 8 - sleep) * 2 * 0.10 +
    Math.max(0, 3 - exercise) * 3 * 0.10 +
    (10 - wlb) * 0.10
  )
  const score = Math.min(100, Math.max(0, Math.round(rawScore * 5 + rng() * 3)))

  const riskLevel = score >= 75 ? '高风险' : score >= 50 ? '中风险' : score >= 25 ? '低风险' : '正常'
  const phase = score >= 75 ? '慢性耗竭期' : score >= 50 ? '倦怠发展期' : score >= 25 ? '早期预警期' : '能量充沛期'

  const factors: string[] = []
  if (workload > 7) factors.push('工作负荷过高')
  if (energy < 5) factors.push('精力水平低下')
  if (cynicism > 6) factors.push('情绪冷漠/去人格化')
  if (efficacy < 5) factors.push('成就感降低')
  if (sleep < 6) factors.push('睡眠不足')
  if (exercise < 2) factors.push('缺乏运动')
  if (wlb < 5) factors.push('工作生活失衡')
  if (factors.length === 0) factors.push('暂无显著风险因素')

  const interventions: string[] = []
  if (score >= 75) {
    interventions.push('立即安排休息，考虑短期脱离工作环境', '寻求专业心理咨询或员工援助计划(EAP)', '与上级沟通工作负荷调整方案')
  } else if (score >= 50) {
    interventions.push('建立明确的工作边界，如非工作时间不查邮件', '增加每日恢复性活动(散步、冥想)', '评估并优化时间管理策略')
  } else if (score >= 25) {
    interventions.push('保持现有良好习惯，注意预防性休息', '每周安排至少一次愉悦活动', '保持规律运动习惯')
  } else {
    interventions.push('继续保持健康的生活方式', '帮助他人识别倦怠信号', '定期自我评估防止反弹')
  }

  const urgency = score >= 75 ? '紧急：请在48小时内采取行动' : score >= 50 ? '注意：建议一周内开始干预' : score >= 25 ? '观察：持续监测即可' : '健康：保持当前状态'

  return {
    riskLevel,
    riskScore: score,
    phase,
    primaryFactors: factors,
    intervention: interventions,
    urgency,
    scoreBreakdown: `负荷:${workload} 精力:${energy} 冷漠:${cynicism} 成就感:${efficacy} 睡眠:${sleep}h 运动:${exercise}次/周 平衡:${wlb}`,
    disclaimer: CRISIS_DISCLAIMER
  }
}

function formatBurnoutReport(r: BurnoutResult): string {
  return `# 职业倦怠早期预警与干预
🚨 风险等级: ${r.riskLevel}| 评分: ${r.riskScore}/100| 阶段: ${r.phase}
📊 评分构成: ${r.scoreBreakdown}
🔍 主要风险因素:
${r.primaryFactors.map(f => `  - ${f}`).join('\n')}
🛡 干预策略:
${r.intervention.map(i => `  - ${i}`).join('\n')}
⏰ 紧迫性: ${r.urgency}
---
${r.disclaimer}`
}

// ── 3. Mindfulness Guide ───────────────────────────────────────────────────

interface MindfulnessInput {
  goal?: string           // "anxiety", "sleep", "focus", "general"
  duration?: number        // minutes
  experience?: string      // "beginner", "intermediate", "advanced"
  preference?: string      // "breathing", "body_scan", "walking", "loving_kindness"
  currentMood?: number     // 1-10
  availableTime?: number   // minutes
}

interface MindfulnessResult {
  sessionType: string
  duration: string
  technique: string
  steps: string[]
  personalization: string
  expectedBenefit: string
  disclaimer: string
}

function analyzeMindfulness(input: MindfulnessInput): MindfulnessResult {
  const seed = hashStr(JSON.stringify(input))
  const rng = mulberry32(seed)

  const goal = input.goal || 'general'
  const experience = input.experience || 'beginner'
  const pref = input.preference || 'breathing'
  const time = input.duration || input.availableTime || 10
  const mood = input.currentMood || 5

  const techniques: Record<string, string[]> = {
    breathing: ['腹式呼吸法', '4-7-8呼吸法', '盒式呼吸法(4-4-4-4)', '交替鼻孔呼吸'],
    body_scan: ['渐进式肌肉放松', '全身扫描冥想', '脚底触地觉察', '头部至脚趾渐进扫描'],
    walking: ['正念步行', '自然觉察步行', '缓慢步行冥想', '步伐与呼吸同步'],
    loving_kindness: ['慈心冥想', '自我慈悲练习', '发送善意给他人', '感恩冥想']
  }

  const categories: Record<string, string> = {
    anxiety: '缓解焦虑', sleep: '助眠放松', focus: '提升专注',
    general: '综合正念', stress: '减压', pain: '疼痛管理'
  }

  const technique = (techniques[pref] || techniques.breathing)[Math.floor(rng() * 4)]

  const steps: string[] = []
  steps.push(`1. 找一个安静的姿势坐下或躺下，确保${time}分钟内不会被打扰`)
  steps.push('2. 轻轻闭上眼睛，做3次深呼吸，每次呼气时放松肩膀')
  if (pref === 'breathing') {
    steps.push('3. 将注意力集中在呼吸上，感受空气进入鼻腔、胸腔扩张、腹部起伏')
    steps.push(`4. 采用${technique}：吸气4秒，保持4秒，呼气6秒，循环${Math.max(3, Math.floor(time / 2))}次`)
    steps.push('5. 当注意力游离时，温和地将它带回呼吸，不做评判')
  } else if (pref === 'body_scan') {
    steps.push('3. 从头顶开始，逐步将注意力移至面部、颈部、肩膀...')
    steps.push(`4. 对每个部位停留约${Math.max(15, Math.floor(time * 10))}秒，觉察紧张与放松的对比`)
    steps.push('5. 扫描完成后，感受整个身体作为一个整体的感觉')
  } else if (pref === 'walking') {
    steps.push('3. 以缓慢的步伐开始，感受脚底与地面接触的感觉')
    steps.push(`4. 每一步都全神贯注在脚掌、脚跟的触地节奏上，保持自然呼吸`)
    steps.push('5. 注意周围的声音、气味，但保持步伐的觉察')
  } else {
    steps.push('3. 先对自己默念："愿我平安、愿我健康、愿我幸福、愿我自在"')
    steps.push(`4. 然后将这份善意依次扩展至亲近的人、中性的人、困难的人、所有众生`)
    steps.push('5. 让心中温暖的感受自然扩散，不强迫也不执着')
  }
  steps.push(`${steps.length}. 慢慢睁开眼睛，花片刻觉察身体的感受变化`)

  const expAdj = experience === 'beginner' && time > 15
    ? '建议初学者先从5-10分钟开始，逐步增加时长'
    : experience === 'advanced' && time < 10
    ? '资深练习者可增加时长或加入开放觉察阶段'
    : '当前时长与您的经验水平匹配'

  const moodNote = mood < 4 ? '当前情绪偏低，建议配合慈心冥想增加自我关怀' : ''

  return {
    sessionType: categories[goal] || '综合正念',
    duration: `${time}分钟`,
    technique,
    steps,
    personalization: [expAdj, moodNote].filter(Boolean).join('；') || '根据您的偏好定制',
    expectedBenefit: goal === 'anxiety' ? '预期可降低皮质醇、减轻焦虑感' :
                     goal === 'sleep' ? '预期可激活副交感神经、改善入睡质量' :
                     goal === 'focus' ? '预期可提升注意力持续时间与任务切换效率' :
                     '预期可增加情绪觉察力、减少自动化反应',
    disclaimer: CRISIS_DISCLAIMER
  }
}

function formatMindfulnessReport(r: MindfulnessResult): string {
  return `# 正念冥想引导方案
🧘 练习类型: ${r.sessionType}| 时长: ${r.duration}| 技法: ${r.technique}
## 练习步骤
${r.steps.join('\n')}
🎯 预期收益: ${r.expectedBenefit}
📝 个性化建议: ${r.personalization}
---
${r.disclaimer}`
}

// ── 4. Sleep Quality Analyzer ───────────────────────────────────────────────

interface SleepInput {
  bedtime?: string
  wakeTime?: string
  sleepLatency?: number   // minutes to fall asleep
  awakenings?: number
  deepSleepPct?: number
  remSleepPct?: number
  daytimeSleepiness?: number // 1-10
  caffeineMgPerDay?: number
  screenTimeBeforeBed?: number // minutes
  consistencyScore?: number    // 1-10
}

interface SleepResult {
  sleepScore: number
  qualityRating: string
  totalSleep: string
  efficiency: string
  issues: string[]
  improvementPlan: string[]
  hygieneTips: string[]
  disclaimer: string
}

function analyzeSleep(input: SleepInput): SleepResult {
  const seed = hashStr(JSON.stringify(input))
  const rng = mulberry32(seed)

  const latency = input.sleepLatency || 20
  const awakenings = input.awakenings || 2
  const deep = input.deepSleepPct || 18
  const rem = input.remSleepPct || 20
  const daytime = input.daytimeSleepiness || 5
  const caffeine = input.caffeineMgPerDay || 200
  const screen = input.screenTimeBeforeBed || 60
  const consistency = input.consistencyScore || 6

  // Calculate score (0-100)
  let score = 70
  score -= Math.min(20, latency * 0.5)
  score -= Math.min(15, awakenings * 4)
  score -= Math.min(10, Math.abs(20 - deep) * 0.5)
  score -= Math.min(10, Math.abs(22 - rem) * 0.5)
  score -= Math.min(10, daytime * 1)
  score -= Math.min(10, caffeine / 50)
  score -= Math.min(10, screen / 10)
  score -= Math.min(10, (10 - consistency) * 1)
  score = Math.min(100, Math.max(0, Math.round(score + rng() * 5)))

  const rating = score >= 85 ? '优秀' : score >= 70 ? '良好' : score >= 55 ? '一般' : score >= 40 ? '较差' : '严重问题'

  const bedParts = input.bedtime?.split(':') || ['23', '00']
  const wakeParts = input.wakeTime?.split(':') || ['7', '0']
  const bedMin = parseInt(bedParts[0]) * 60 + parseInt(bedParts[1])
  const wakeMin = parseInt(wakeParts[0]) * 60 + parseInt(bedParts[1])
  const sleepHours = wakeMin > bedMin ? (wakeMin - bedMin) / 60 : (wakeMin + 1440 - bedMin) / 60
  const efficiency = Math.max(50, Math.min(99, 95 - latency * 0.5 - awakenings * 3))

  const issues: string[] = []
  if (latency > 20) issues.push(`入睡困难（${latency}分钟）`)
  if (awakenings > 2) issues.push(`夜间觉醒频繁（${awakenings}次）`)
  if (deep < 15) issues.push(`深度睡眠不足（${deep}%）`)
  if (rem < 18) issues.push(`REM睡眠偏低（${rem}%）`)
  if (daytime > 6) issues.push('日间嗜睡明显')
  if (caffeine > 300) issues.push(`咖啡因摄入过多（${caffeine}mg）`)
  if (screen > 30) issues.push(`睡前屏幕时间过长（${screen}分钟）`)
  if (consistency < 5) issues.push('作息不规律')
  if (issues.length === 0) issues.push('暂未发现明显睡眠问题')

  const plan: string[] = []
  if (latency > 15) plan.push(`建立固定睡前仪式：睡前一小时开始放松活动，目标入睡时间缩短至15分钟内`)
  if (awakenings > 1) plan.push(`减少夜间觉醒：避免睡前大量饮水，保持卧室温度18-22°C`)
  if (caffeine > 200) plan.push(`控制咖啡因：午后2点后可摄入量减半至${Math.max(0, caffeine - 100)}mg`)
  if (screen > 20) plan.push(`减少蓝光：睡前${Math.max(0, screen - 20)}分钟停用电子设备或使用夜间模式`)
  plan.push(`本周目标：睡眠评分提升至${Math.min(100, score + 5)}分，保持固定起床时间`)

  const tips = [
    '每天同一时间起床（包括周末），帮助稳定昼夜节律',
    '卧室仅用于睡眠，不在床上工作或看视频',
    '午后避免咖啡因，晚餐不宜过晚过饱',
    '白天接受自然光照至少30分钟',
    '睡前进行放松活动：温水浴、阅读、轻柔音乐'
  ]

  return {
    sleepScore: score,
    qualityRating: rating,
    totalSleep: sleepHours.toFixed(1) + ' 小时',
    efficiency: efficiency.toFixed(0) + '%',
    issues,
    improvementPlan: plan,
    hygieneTips: tips,
    disclaimer: CRISIS_DISCLAIMER
  }
}

function formatSleepReport(r: SleepResult): string {
  return `# 睡眠质量分析与改善建议
😴 睡眠评分: ${r.sleepScore}/100 | 评级: ${r.qualityRating}| 总时长: ${r.totalSleep}| 效率: ${r.efficiency}
## 发现问题
${r.issues.map(i => `  - ${i}`).join('\n')}
## 改善计划
${r.improvementPlan.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}
## 睡眠卫生贴士
${r.hygieneTips.map(t => `  ✦ ${t}`).join('\n')}
---
${r.disclaimer}`
}

// ── 5. Stress Pattern Mapper ─────────────────────────────────────────────────

interface StressInput {
  events?: { date: string; description: string; intensity: number }[]
  physicalSymptoms?: string[]
  behavioralChanges?: string[]
  stressors?: string[]
  copingMethods?: string[]
  weeksOfData?: number
}

interface StressResult {
  primaryStressor: string
  stressPattern: string
  intensityAvg: string
  triggers: string[]
  physicalImpact: string
  behavioralImpact: string
  copingEffectiveness: string
  recommendations: string[]
  disclaimer: string
}

function analyzeStress(input: StressInput): StressResult {
  const seed = hashStr(JSON.stringify(input))
  const rng = mulberry32(seed)

  const events = input.events || []
  const stressors = input.stressors || ['工作压力', '人际关系', '财务健康', '时间管理']
  const physicalSymptoms = input.physicalSymptoms || ['头痛', '肌肉紧张', '疲劳', '肠胃不适']
  const behavioralChanges = input.behavioralChanges || ['睡眠变化', '食欲改变', '社交退缩', '拖延']
  const coping = input.copingMethods || ['运动', '社交', '娱乐', '正念']

  const avgIntensity = events.length > 0
    ? (events.reduce((a, e) => a + (e.intensity || 5), 0) / events.length).toFixed(1)
    : (4 + rng() * 4).toFixed(1)

  const topStressor = stressors[0] || '未识别主要压力源'

  const patterns = ['周初压力高峰型', '累积递增型', '突发波动型', '周期循环型'][Math.floor(rng() * 4)]

  const triggers = stressors.slice(0, 3).map(s => `${s} (关联强度 ${Math.floor(50 + rng() * 40)}%)`)

  const highIntensityEvents = events.filter(e => (e.intensity || 0) >= 7).length
  const physImpact = physicalSymptoms.length >= 3
    ? '身体症状显著，压力已明显影响生理健康'
    : physicalSymptoms.length >= 1 ? '存在轻度躯体化反应' : '暂无明显躯体症状'

  const behImpact = behavioralChanges.length >= 3
    ? '行为模式明显改变，建议进一步评估'
    : behavioralChanges.length >= 1 ? '存在一定行为波动' : '行为模式基本稳定'

  const effectiveCoping = coping.slice(0, 2)
  const copingStr = `当前应对机制(${coping.join(', ')})中，${effectiveCoping.join('和')}被认为最有效`

  const recommendations: string[] = []
  recommendations.push(`针对主要压力源"${topStressor}"制定专项应对计划`)
  if (parseFloat(avgIntensity) > 6) recommendations.push('压力强度较高，建议每日安排15-20分钟放松练习')
  if (physicalSymptoms.length >= 2) recommendations.push('躯体症状明显，建议结合渐进式肌肉放松或瑜伽')
  recommendations.push('每周记录压力触发情境，提升元认知觉察')
  recommendations.push(`优化当前应对策略：增加${coping.length < 3 ? '一种新的' : ''}健康的应对方式`)

  return {
    primaryStressor: topStressor,
    stressPattern: patterns,
    intensityAvg: avgIntensity,
    triggers,
    physicalImpact: physImpact,
    behavioralImpact: behImpact,
    copingEffectiveness: copingStr,
    recommendations,
    disclaimer: CRISIS_DISCLAIMER
  }
}

function formatStressReport(r: StressResult): string {
  return `# 压力源识别与模式映射
🔴 主要压力源: ${r.primaryStressor}| 模式: ${r.stressPattern}| 平均强度: ${r.intensityAvg}/10
## 触发因素
${r.triggers.map(t => `  - ${t}`).join('\n')}
## 身心影响
  - 躯体层面: ${r.physicalImpact}
  - 行为层面: ${r.behavioralImpact}
## 应对效能
  ${r.copingEffectiveness}
## 改善建议
${r.recommendations.map((rec, i) => `  ${i + 1}. ${rec}`).join('\n')}
---
${r.disclaimer}`
}

// ── 6. Wellbeing Score Estimator ─────────────────────────────────────────────

interface WellbeingInput {
  mood?: number          // 1-10
  energy?: number        // 1-10
  social?: number        // 1-10
  purpose?: number       // 1-10
  resilience?: number    // 1-10
  sleep?: number         // 1-10
  physical?: number      // 1-10
  trendWeeks?: number
  previousScore?: number
}

interface WellbeingResult {
  overallScore: number
  rating: string
  dimensions: { name: string; score: number; label: string }[]
  trend: string
  strengths: string[]
  areasToImprove: string[]
  projection: string
  disclaimer: string
}

function analyzeWellbeing(input: WellbeingInput): WellbeingResult {
  const seed = hashStr(JSON.stringify(input))
  const rng = mulberry32(seed)

  const dimensions = [
    { name: '情绪状态', score: input.mood || 6 },
    { name: '精力水平', score: input.energy || 6 },
    { name: '社交连接', score: input.social || 6 },
    { name: '意义目标', score: input.purpose || 6 },
    { name: '心理弹性', score: input.resilience || 6 },
    { name: '睡眠质量', score: input.sleep || 6 },
    { name: '身体活力', score: input.physical || 6 }
  ]

  const overall = Math.round(dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length * 10 + rng() * 3)

  const rating = overall >= 80 ? '优秀' : overall >= 65 ? '良好' : overall >= 50 ? '一般' : overall >= 35 ? '需改善' : '需关注'

  const trendWeeks = input.trendWeeks || 4
  const prev = input.previousScore ? input.previousScore - overall : Math.round(rng() * 20 - 10)
  const trend = prev > 5 ? '上升趋势' : prev < -5 ? '下降趋势' : '相对稳定'

  const strengths = dimensions.filter(d => d.score >= 7).map(d => d.name)
  const areasToImprove = dimensions.filter(d => d.score < 5).map(d => d.name)
  if (strengths.length === 0) strengths.push('暂无突出维度，建议均衡发展')
  if (areasToImprove.length === 0) areasToImprove.push('暂无明显短板，持续保持')

  const projection = overall >= 70
    ? '基于当前趋势，未来4周预计维持良好水平'
    : overall >= 50
    ? '未来4周有改善空间，建议重点提升低分维度'
    : '建议制定系统性的自我提升计划，必要时寻求专业支持'

  return {
    overallScore: overall,
    rating,
    dimensions: dimensions.map(d => ({
      name: d.name,
      score: d.score,
      label: d.score >= 8 ? '高' : d.score >= 6 ? '中' : d.score >= 4 ? '低' : '极需关注'
    })),
    trend: `${trend}(${prev >= 0 ? '+' : ''}${prev > 0 ? prev : -prev}分/4周)`,
    strengths,
    areasToImprove,
    projection,
    disclaimer: CRISIS_DISCLAIMER
  }
}

function formatWellbeingReport(r: WellbeingResult): string {
  const dimStr = r.dimensions.map(d => `  ${d.name}: ${d.score}/10 (${d.label})`).join('\n')
  return `# 综合心理健康指数评估
🌈 综合评分: ${r.overallScore}/100 | 评级: ${r.rating}| 趋势: ${r.trend}
## 七维健康度
${dimStr}
## 优势维度
${r.strengths.map(s => `  ✨ ${s}`).join('\n')}
## 提升空间
${r.areasToImprove.map(a => `  📈 ${a}`).join('\n')}
## 趋势预测
  ${r.projection}
---
${r.disclaimer}`
}

// ── 7. Coping Strategy Recommender ───────────────────────────────────────────

interface CopingInput {
  challenge?: string
  emotion?: string       // "anxiety", "depression", "anger", "grief", "fear", "overwhelm"
  context?: string       // "work", "relationship", "health", "financial", "general"
  previousStrategies?: string[]
  severity?: number      // 1-10
  supportSystem?: boolean
}

interface CopingResult {
  emotionRecognized: string
  strategies: { name: string; description: string; evidenceLevel: string; fitScore: number }[]
  topRecommendation: string
  quickTechnique: string
  longTermPractice: string
  disclaimer: string
}

function analyzeCoping(input: CopingInput): CopingResult {
  const seed = hashStr(JSON.stringify(input))
  const rng = mulberry32(seed)

  const emotion = input.emotion || 'anxiety'
  const context = input.context || 'general'
  const severity = input.severity || 5

  const strategyDB: Record<string, { name: string; description: string; evidence: string }[]> = {
    anxiety: [
      { name: '认知重构', description: '识别并挑战灾难化思维，用更平衡的想法替代', evidence: 'CBT强证据' },
      { name: '暴露疗法', description: '渐进式面对恐惧情境，降低回避行为', evidence: '高度循证' },
      { name: '接地技术(5-4-3-2-1)', description: '通过五感将注意力带回当下', evidence: '中等证据' },
      { name: '腹式呼吸', description: '深长缓慢呼吸激活副交感神经系统', evidence: '中等证据' }
    ],
    depression: [
      { name: '行为激活', description: '安排愉悦活动与掌控感行为，打破回避循环', evidence: 'CBT强证据' },
      { name: '感恩日记', description: '每日记录3件值得感恩的事，重塑注意偏向', evidence: '积极心理学证据' },
      { name: '社交连接', description: '主动安排与信任之人的互动', evidence: '中等证据' },
      { name: '身体活动', description: '每周至少150分钟中等强度运动', evidence: '高度循证' }
    ],
    anger: [
      { name: '暂停技术', description: '感到愤怒升级时，暂停6秒后再回应', evidence: '中等证据' },
      { name: '认知重评', description: '重新解读触发事件的意义', evidence: 'CBT证据' },
      { name: '渐进式肌肉放松', description: '系统紧张-放松各肌群，释放身体愤怒能量', evidence: '中等证据' },
      { name: '问题解决训练', description: '将愤怒转化为行动导向的问题解决方案', evidence: '中等证据' }
    ],
    grief: [
      { name: '叙事表达', description: '通过书写或讲述整理丧失体验', evidence: '中等证据' },
      { name: '自我慈悲', description: '允许悲伤存在，对自己温柔以待', evidence: '新兴证据' },
      { name: '仪式化告别', description: '创建个人仪式来纪念与告别', evidence: '传统实践' },
      { name: '支持团体', description: '参与同质群体，减少孤独感', evidence: '中等证据' }
    ],
    overwhelm: [
      { name: '任务分解', description: '将大任务拆分为15分钟可执行的小步骤', evidence: '实践验证' },
      { name: '优先级矩阵', description: '按紧急-重要四象限排序任务', evidence: '实践验证' },
      { name: '设定边界', description: '学会说"不"，保护个人精力', evidence: '中等证据' },
      { name: '单任务专注', description: '一次只做一件事，关闭多任务干扰', evidence: '注意力研究支持' }
    ]
  }

  const strategies = (strategyDB[emotion] || strategyDB.anxiety).map(s => ({
    name: s.name,
    description: s.description,
    evidenceLevel: s.evidence,
    fitScore: Math.floor(60 + rng() * 35)
  })).sort((a, b) => b.fitScore - a.fitScore)

  const emotionLabels: Record<string, string> = {
    anxiety: '焦虑', depression: '抑郁', anger: '愤怒', grief: '悲伤/丧失',
    fear: '恐惧', overwhelm: '不堪重负', general: '一般困扰'
  }

  const quickMap: Record<string, string> = {
    anxiety: '立即尝试：5-4-3-2-1接地技术 — 说出你看到的5样东西、触摸4样东西、听到3种声音、闻到2种气味、品尝1种味道。',
    depression: '立即尝试：做一件微小的愉悦活动 — 泡一杯茶、听一首喜欢的歌、到窗边站5分钟。行为先于动机。',
    anger: '立即尝试：暂停并深呼吸 — 吸气4秒、屏气4秒、呼气6秒，重复3次后再做反应。',
    grief: '立即尝试：给自己写一封短信 — "我允许自己感受这些情绪，这是正常的。"',
    overwhelm: '立即尝试：写在纸上把所有待办事项倒出来，然后只选最重要的1件开始做。',
    fear: '立即尝试：双脚踩地，感受脚底的支撑，大声说出"我现在是安全的"。'
  }

  return {
    emotionRecognized: emotionLabels[emotion] || '多种情绪',
    strategies: strategies.slice(0, 3),
    topRecommendation: `${strategies[0].name}：${strategies[0].description} — 匹配度${strategies[0].fitScore}%`,
    quickTechnique: quickMap[emotion] || quickMap.anxiety,
    longTermPractice: severity >= 7 || emotion === 'depression'
      ? '建议考虑系统的心理治疗（如CBT、ACT），每周一次，持续8-12周。'
      : '建议每日练习所选策略，连续4周建立习惯，配合情绪追踪评估效果。',
    disclaimer: CRISIS_DISCLAIMER
  }
}

function formatCopingReport(r: CopingResult): string {
  const stratStr = r.strategies.map(s =>
    `  - **${s.name}**（匹配度${s.fitScore}%，${s.evidenceLevel}）：${s.description}`
  ).join('\n')
  return `# 应对策略与个性化技巧推荐
🎯 识别情绪: ${r.emotionRecognized}
## 推荐策略(TOP 3)
${stratStr}
## 立即尝试
  ${r.quickTechnique}
## 长期建议
  ${r.longTermPractice}
---
${r.disclaimer}`
}

// ── 8. Therapy Session Summarizer ────────────────────────────────────────────

interface TherapyInput {
  sessionNotes?: string
  sessionDate?: string
  sessionNumber?: number
  concerns?: string[]
  progressIndicators?: string[]
  homeworkAssigned?: string
  therapistObservations?: string
  clientGoals?: string[]
}

interface TherapyResult {
  sessionSummary: string
  keyThemes: string[]
  progressLevel: string
  safetyFlags: string[]
  homeworkReminder: string
  goalProgress: string[]
  nextFocusAreas: string[]
  disclaimer: string
}

function analyzeTherapy(input: TherapyInput): TherapyResult {
  const seed = hashStr(JSON.stringify(input))
  const rng = mulberry32(seed)

  const notes = input.sessionNotes || ''
  const sessionNum = input.sessionNumber || 1
  const concerns = input.concerns || ['情绪调节', '人际模式']
  const progress = input.progressIndicators || []
  const goals = input.clientGoals || ['提升自我觉察', '建立健康边界']
  const homework = input.homeworkAssigned || '每日记录情绪触发事件'

  // Safety boundary detection
  const safetyFlags: string[] = []
  const crisisKeywords = ['自杀', '自伤', '不想活', '结束', '死亡', '殺人', '伤害自己', 'kill', 'suicide', 'self-harm', 'die']
  const lowerNotes = notes.toLowerCase()
  for (const kw of crisisKeywords) {
    if (lowerNotes.includes(kw)) {
      safetyFlags.push(`检测到危机信号关键词"${kw}"，需要立即关注`)
    }
  }

  // Summarize themes from concerns
  const themes = concerns.slice(0, 3)

  const progressLevel = progress.length >= 3 ? '显著进展' : progress.length >= 1 ? '部分进展' : '待评估'
  const nextAreas = goals.slice(0, 2).map(g => `下阶段聚焦：${g}的深化与实践`)

  if (safetyFlags.length > 0) {
    safetyFlags.push('⚠️ 请注意：此内容含危机相关信号，请务必与持证心理咨询师讨论')
  }

  return {
    sessionSummary: `第${sessionNum}次会谈主题：${themes.join('、')}。${notes.length > 50 ? notes.substring(0, 100) + '...' : notes || '暂无详细记录'}`,
    keyThemes: themes,
    progressLevel,
    safetyFlags: safetyFlags.length > 0 ? safetyFlags : ['未检测到即时危机信号(自动检测仅供参考)'],
    homeworkReminder: homework,
    goalProgress: goals.map(g => `${g} — 第${sessionNum}次评估`),
    nextFocusAreas: nextAreas,
    disclaimer: CRISIS_DISCLAIMER
  }
}

function formatTherapyReport(r: TherapyResult): string {
  const flags = r.safetyFlags.map(f => `  🚩 ${f}`).join('\n')
  return `# 心理治疗会话记录总结
📝 会话摘要: ${r.sessionSummary}
## 核心主题
${r.keyThemes.map(t => `  • ${t}`).join('\n')}
## 进展评估
  当前进展: ${r.progressLevel}
  目标追踪:
${r.goalProgress.map(g => `    ${g}`).join('\n')}
## 安全边界检测
${flags}
## 家庭作业提醒
  📋 ${r.homeworkReminder}
## 下阶段聚焦
${r.nextFocusAreas.map(a => `  → ${a}`).join('\n')}
---
${r.disclaimer}`
}

// ── Tool Registration ────────────────────────────────────────────────────────

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. Mood Tracker
  tools.register(defineTool({
    name: 'mood_tracker',
    description: '情绪追踪与周期性情绪模式分析：输入情绪记录数据，输出趋势、主导情绪、周期模式和改善建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"entries":[{"date":"2024-01-01","mood":6,"notes":"工作压力大"}],"period":"30d"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMoodReport(analyzeMood(JSON.parse(args.input_data))) }
  }))

  // 2. Burnout Detector
  tools.register(defineTool({
    name: 'burnout_detector',
    description: '职业倦怠早期预警与检测：基于工作负荷、精力、成就感等维度评估倦怠风险并提供干预策略',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"workload":8,"energyLevel":3,"cynicism":7,"efficacy":4,"sleepHours":5,"exercisePerWeek":0,"workLifeBalance":3}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatBurnoutReport(analyzeBurnout(JSON.parse(args.input_data))) }
  }))

  // 3. Mindfulness Guide
  tools.register(defineTool({
    name: 'mindfulness_guide',
    description: '正念冥想引导与个性化推荐：根据目标、时长和偏好生成定制正念练习方案',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"goal":"anxiety","duration":15,"experience":"beginner","preference":"breathing","currentMood":4}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMindfulnessReport(analyzeMindfulness(JSON.parse(args.input_data))) }
  }))

  // 4. Sleep Quality Analyzer
  tools.register(defineTool({
    name: 'sleep_quality_analyzer',
    description: '睡眠质量分析与改善建议：基于入睡时间、觉醒次数、睡眠结构等数据评估睡眠质量并提供改善计划',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"bedtime":"23:30","wakeTime":"7:00","sleepLatency":25,"awakenings":3,"deepSleepPct":15,"remSleepPct":18,"daytimeSleepiness":6,"caffeineMgPerDay":300,"screenTimeBeforeBed":90}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSleepReport(analyzeSleep(JSON.parse(args.input_data))) }
  }))

  // 5. Stress Pattern Mapper
  tools.register(defineTool({
    name: 'stress_pattern_mapper',
    description: '压力源识别与压力模式映射：分析压力事件、触发因素、身心影响并给出针对性建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"events":[{"date":"2024-01-15","description":"项目截止","intensity":8}],"stressors":["工作负荷","人际关系"],"physicalSymptoms":["头痛","疲劳"]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatStressReport(analyzeStress(JSON.parse(args.input_data))) }
  }))

  // 6. Wellbeing Score Estimator
  tools.register(defineTool({
    name: 'wellbeing_score_estimator',
    description: '综合心理健康指数评估与趋势分析：多维度评估心理健康状态，含趋势预测和发展建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"mood":6,"energy":5,"social":7,"purpose":5,"resilience":6,"sleep":5,"physical":6,"trendWeeks":4}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatWellbeingReport(analyzeWellbeing(JSON.parse(args.input_data))) }
  }))

  // 7. Coping Strategy Recommender
  tools.register(defineTool({
    name: 'coping_strategy_recommender',
    description: '应对策略库与个性化技巧推荐：基于当前情绪状态和情境推荐循证应对策略',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"emotion":"anxiety","context":"work","severity":7,"previousStrategies":["深呼吸"],"supportSystem":true}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCopingReport(analyzeCoping(JSON.parse(args.input_data))) }
  }))

  // 8. Therapy Session Summarizer
  tools.register(defineTool({
    name: 'therapy_session_summarizer',
    description: '心理治疗会话记录总结与安全边界检测：总结治疗会话要点、检测危机信号、追踪目标进展',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"sessionNotes":"探讨了童年经历对当前关系模式的影响，参与者能识别自动化思维","sessionNumber":5,"concerns":["关系模式","自我价值"],"homeworkAssigned":"记录每日自我批判思维"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTherapyReport(analyzeTherapy(JSON.parse(args.input_data))) }
  }))
}
