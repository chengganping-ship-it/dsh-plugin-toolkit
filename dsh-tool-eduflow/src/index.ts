/**
 * DSH EduFlow Plugin v0.1.0
 * AI教育/人才培养引擎 for DeepSeek Harness — 对标2026 AI教育/人才培养趋势
 * Z世代消费逻辑重塑、新职业赛道爆发
 *
 * 8大核心工具:
 * 1. learner_profile       — 学习者画像（能力基线/学习风格/目标岗位/可用时间）
 * 2. skill_gap_analyzer    — 技能差距分析（当前vs目标岗位/差距可视化/优先级排序）
 * 3. learning_path_gen     — 个性化学习路径生成（前置依赖/最优序列/时间估计）
 * 4. micro_learning        — 微学习引擎（5分钟课程/间隔重复/遗忘曲线自适应）
 * 5. cert_prep             — 认证考试备考（考点分析/模拟考/弱项针对性强化）
 * 6. peer_match            — 同伴学习匹配（水平互补/时区兼容/沟通风格）
 * 7. career_simulator      — 职业模拟器（角色体验/行业日/技能应用实战项目）
 * 8. learning_analytics    — 学习分析仪表盘（投入时间/技能增长曲线/就业转化率）
 *
 * 橙色教育主题 + 进度条/等级系统 + 技能树可视化
 *
 * @module dsh-tool-eduflow | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-eduflow'
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

// --- Tool 1: Learner Profile ---
interface LearnerProfileInput {
  learner_id: string
  name: string
  current_role: string
  target_role: string
  current_skills: Array<{ name: string; level: number }>
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'mixed'
  weekly_hours_available: number
  preferred_pace: 'intensive' | 'moderate' | 'relaxed'
}

interface SkillBaseline {
  skill_name: string
  current_level: number
  mastery_pct: number
  category: string
}

interface LearningStyleProfile {
  primary: string
  secondary: string
  recommended_formats: string[]
  engagement_score: number
}

interface LearnerProfileResult {
  learner_id: string
  name: string
  current_role: string
  target_role: string
  skill_baselines: SkillBaseline[]
  learning_style: LearningStyleProfile
  weekly_hours: number
  overall_level: number
  level_title: string
  xp_points: number
  xp_to_next_level: number
  readiness_score: number
}

// --- Tool 2: Skill Gap Analyzer ---
interface SkillGapInput {
  learner_id: string
  current_skills: Array<{ name: string; level: number }>
  target_role: string
  target_skills: Array<{ name: string; required_level: number; weight: number }>
}

interface SkillGap {
  skill_name: string
  current_level: number
  required_level: number
  gap: number
  gap_severity: 'critical' | 'significant' | 'moderate' | 'minor'
  priority: number
  estimated_hours: number
}

interface SkillGapResult {
  learner_id: string
  target_role: string
  gaps: SkillGap[]
  total_gaps: number
  critical_gaps: number
  total_estimated_hours: number
  overall_readiness_pct: number
  readiness_level: string
}

// --- Tool 3: Learning Path Generator ---
interface LearningPathInput {
  learner_id: string
  target_role: string
  gaps: Array<{ skill_name: string; gap: number; priority: number }>
  weekly_hours: number
  preferred_sequence: 'dependency_first' | 'quick_wins' | 'balanced'
}

interface LearningModule {
  module_id: string
  skill_name: string
  title: string
  estimated_hours: number
  week_number: number
  dependencies: string[]
  resources: string[]
  milestone: string
  xp_reward: number
}

interface LearningPathResult {
  learner_id: string
  target_role: string
  modules: LearningModule[]
  total_weeks: number
  total_hours: number
  total_xp: number
  path_strategy: string
}

// --- Tool 4: Micro Learning ---
interface MicroLearningInput {
  learner_id: string
  topic: string
  content_type: 'flashcard' | 'quiz' | 'scenario' | 'teach_back'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  review_mode: boolean
  last_review_days_ago?: number
  previous_accuracy?: number
}

interface FlashCard {
  card_id: string
  front: string
  back: string
  difficulty: string
  tags: string[]
}

interface MicroSession {
  session_id: string
  topic: string
  duration_minutes: number
  cards: FlashCard[]
  quiz_questions: Array<{ question: string; options: string[]; correct_index: number }>
  spaced_repetition_interval: number
  next_review_date: string
  retention_probability: number
  xp_earned: number
}

interface MicroLearningResult {
  learner_id: string
  session: MicroSession
  forgetting_curve_note: string
  adaptive_recommendation: string
}

// --- Tool 5: Cert Prep ---
interface CertPrepInput {
  learner_id: string
  certification_name: string
  exam_date: string
  current_mastery: Array<{ domain: string; mastery_pct: number }>
  target_score: number
  available_weeks: number
}

interface DomainAnalysis {
  domain: string
  weight_pct: number
  current_mastery: number
  target_mastery: number
  gap: number
  study_hours_needed: number
  priority_rank: number
}

interface PracticeQuestion {
  question_id: string
  domain: string
  difficulty: string
  question: string
  user_answer_correct: boolean
}

interface CertPrepResult {
  learner_id: string
  certification: string
  exam_date: string
  domains: DomainAnalysis[]
  total_study_hours: number
  weekly_study_plan: Array<{ week: number; domains: string[]; hours: number }>
  practice_exam: PracticeQuestion[]
  predicted_score: number
  pass_probability: number
  weak_areas: string[]
}

// --- Tool 6: Peer Match ---
interface PeerMatchInput {
  learner_id: string
  skill_name: string
  current_level: number
  timezone: string
  communication_style: 'async' | 'sync' | 'hybrid'
  goal: string
}

interface PeerProfile {
  peer_id: string
  name: string
  skill_level: number
  timezone: string
  communication_style: string
  complementary_score: number
  timezone_compatibility: number
  style_match: number
  overall_match: number
  session_availability: string[]
}

interface PeerMatchResult {
  learner_id: string
  skill_name: string
  matches: PeerProfile[]
  total_candidates: number
  best_match: PeerProfile | null
  suggested_session_format: string
}

// --- Tool 7: Career Simulator ---
interface CareerSimInput {
  learner_id: string
  target_role: string
  simulation_type: 'day_in_life' | 'project_sprint' | 'interview_prep' | 'skill_application'
  duration_hours: number
  industry: string
}

interface SimulationTask {
  task_id: string
  title: string
  description: string
  skills_applied: string[]
  difficulty: string
  estimated_minutes: number
  xp_reward: number
  deliverable: string
}

interface CareerSimResult {
  learner_id: string
  target_role: string
  simulation_type: string
  industry: string
  tasks: SimulationTask[]
  total_duration_minutes: number
  total_xp: number
  skills_demonstrated: string[]
  portfolio_output: string
  confidence_boost_pct: number
}

// --- Tool 8: Learning Analytics ---
interface AnalyticsInput {
  learner_id: string
  time_range: 'week' | 'month' | 'quarter' | 'year'
  metrics: string[]
}

interface DailyActivity {
  date: string
  minutes_studied: number
  xp_earned: number
  skills_practiced: string[]
}

interface SkillGrowthCurve {
  skill_name: string
  start_level: number
  current_level: number
  growth_pct: number
  trend: 'accelerating' | 'steady' | 'plateau' | 'declining'
}

interface LearningAnalyticsResult {
  learner_id: string
  time_range: string
  total_study_hours: number
  total_xp_earned: number
  current_level: number
  current_level_title: string
  streak_days: number
  daily_activities: DailyActivity[]
  skill_growth: SkillGrowthCurve[]
  career_readiness_pct: number
  skills_mastered: number
  skills_in_progress: number
  projected_certification_timeline: string
  learning_velocity: number
  engagement_score: number
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Learner Profile ---
function analyzeLearnerProfile(input: LearnerProfileInput): LearnerProfileResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.learner_id + input.name))

  const skillBaselines: SkillBaseline[] = input.current_skills.map(s => ({
    skill_name: s.name,
    current_level: s.level,
    mastery_pct: Math.min(100, Math.round((s.level / 10) * 100)),
    category: rng.pick(['technical', 'soft_skill', 'domain_knowledge', 'tool_proficiency', 'methodology']),
  }))

  const styles: Record<string, { primary: string; secondary: string; formats: string[] }> = {
    visual: { primary: '视觉型', secondary: '阅读型', formats: ['信息图', '视频教程', '思维导图', '图解笔记'] },
    auditory: { primary: '听觉型', secondary: '读写型', formats: ['播客', '讨论组', '讲解音频', '口头复述'] },
    kinesthetic: { primary: '动觉型', secondary: '视觉型', formats: ['动手实验', '项目实战', '角色扮演', '模拟操作'] },
    reading_writing: { primary: '读写型', secondary: '听觉型', formats: ['阅读材料', '笔记整理', '写作练习', '博客输出'] },
    mixed: { primary: '混合型', secondary: '动觉型', formats: ['多模态组合', '项目驱动', '游戏化学习', '社交学习'] },
  }

  const styleInfo = styles[input.learning_style] || styles.mixed
  const overallLevel = Math.round(skillBaselines.reduce((sum, s) => sum + s.current_level, 0) / Math.max(skillBaselines.length, 1))
  const xpPoints = overallLevel * 100 + rng.nextInt(50, 200)
  const xpToNext = (overallLevel + 1) * 100 * 2 - xpPoints
  const levelTitles = ['初学者', '入门者', '初级学者', '中级学徒', '熟练实践者', '高级专家', '大师', '传奇']
  const levelTitle = levelTitles[Math.min(Math.floor(overallLevel / 1.5), levelTitles.length - 1)]
  const readiness = Math.min(100, Math.round((overallLevel / 10) * 70 + rng.nextFloat(10, 30)))

  return {
    learner_id: input.learner_id,
    name: input.name,
    current_role: input.current_role,
    target_role: input.target_role,
    skill_baselines: skillBaselines,
    learning_style: {
      primary: styleInfo.primary,
      secondary: styleInfo.secondary,
      recommended_formats: styleInfo.formats,
      engagement_score: Math.round(rng.nextFloat(0.7, 0.99) * 100) / 100,
    },
    weekly_hours: input.weekly_hours_available,
    overall_level: overallLevel,
    level_title: levelTitle,
    xp_points: xpPoints,
    xp_to_next_level: Math.max(0, xpToNext),
    readiness_score: readiness,
  }
}

// --- Tool 2: Skill Gap Analyzer ---
function analyzeSkillGap(input: SkillGapInput): SkillGapResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.learner_id + input.target_role))

  const gaps: SkillGap[] = []
  for (const target of input.target_skills) {
    const current = input.current_skills.find(c => c.name === target.name)
    const currentLevel = current ? current.level : 0
    const gap = Math.max(0, target.required_level - currentLevel)
    let severity: SkillGap['gap_severity']
    if (gap >= 5) severity = 'critical'
    else if (gap >= 3) severity = 'significant'
    else if (gap >= 2) severity = 'moderate'
    else severity = 'minor'

    gaps.push({
      skill_name: target.name,
      current_level: currentLevel,
      required_level: target.required_level,
      gap,
      gap_severity: severity,
      priority: Math.round(target.weight * gap * 10) / 10,
      estimated_hours: Math.round(gap * rng.nextFloat(8, 20)),
    })
  }

  gaps.sort((a, b) => b.priority - a.priority)
  const criticalCount = gaps.filter(g => g.gap_severity === 'critical').length
  const totalHours = gaps.reduce((sum, g) => sum + g.estimated_hours, 0)
  const totalRequired = input.target_skills.reduce((sum, t) => sum + t.required_level, 0)
  const totalCurrent = gaps.reduce((sum, g) => sum + Math.min(g.current_level, g.required_level), 0)
  const readiness = totalRequired > 0 ? Math.round((totalCurrent / totalRequired) * 100) : 100

  let readinessLevel = '已就绪'
  if (readiness < 30) readinessLevel = '差距巨大'
  else if (readiness < 50) readinessLevel = '差距显著'
  else if (readiness < 70) readinessLevel = '差距中等'
  else if (readiness < 85) readinessLevel = '接近达标'

  return {
    learner_id: input.learner_id,
    target_role: input.target_role,
    gaps,
    total_gaps: gaps.length,
    critical_gaps: criticalCount,
    total_estimated_hours: totalHours,
    overall_readiness_pct: readiness,
    readiness_level: readinessLevel,
  }
}

// --- Tool 3: Learning Path Generator ---
function analyzeLearningPath(input: LearningPathInput): LearningPathResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.learner_id + input.target_role + input.preferred_sequence))

  const sortedGaps = [...input.gaps]
  if (input.preferred_sequence === 'quick_wins') {
    sortedGaps.sort((a, b) => a.gap - b.gap)
  } else if (input.preferred_sequence === 'dependency_first') {
    sortedGaps.sort((a, b) => b.priority - a.priority)
  }

  const modules: LearningModule[] = []
  let currentWeek = 1
  let accumulatedHours = 0

  for (const gap of sortedGaps) {
    const hours = Math.round(gap.gap * rng.nextFloat(6, 15))
    const weekNumber = Math.ceil((accumulatedHours + hours) / input.weekly_hours)
    if (weekNumber > currentWeek) currentWeek = weekNumber

    modules.push({
      module_id: `mod-${gap.skill_name.replace(/\s/g, '_')}-${rng.nextInt(100, 999)}`,
      skill_name: gap.skill_name,
      title: `${gap.skill_name} ${input.preferred_sequence === 'quick_wins' ? '快速突破' : '系统掌握'}`,
      estimated_hours: hours,
      week_number: currentWeek,
      dependencies: modules.length > 0 ? [modules[modules.length - 1].skill_name] : [],
      resources: [
        `${gap.skill_name} 视频课程`,
        `${gap.skill_name} 实战项目`,
        `${gap.skill_name} 练习题库`,
      ],
      milestone: `完成${gap.skill_name} L${gap.gap}级考核`,
      xp_reward: hours * 15 + rng.nextInt(10, 50),
    })

    accumulatedHours += hours
  }

  const totalWeeks = modules.length > 0 ? modules[modules.length - 1].week_number : 0
  const totalHours = modules.reduce((sum, m) => sum + m.estimated_hours, 0)
  const totalXp = modules.reduce((sum, m) => sum + m.xp_reward, 0)

  return {
    learner_id: input.learner_id,
    target_role: input.target_role,
    modules,
    total_weeks: totalWeeks,
    total_hours: totalHours,
    total_xp: totalXp,
    path_strategy: input.preferred_sequence === 'dependency_first' ? '依赖优先：先修后进阶' : input.preferred_sequence === 'quick_wins' ? '速赢优先：先易后难建信心' : '均衡模式：难度递进',
  }
}

// --- Tool 4: Micro Learning ---
function analyzeMicroLearning(input: MicroLearningInput): MicroLearningResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.learner_id + input.topic + input.content_type))

  const contentTypeTemplates: Record<string, { front: string; back: string }[]> = {
    flashcard: [
      { front: `${input.topic} 的核心概念是什么?`, back: '关键要点: 定义、特征、应用场景及最佳实践' },
      { front: `${input.topic} 中最常见的误区?`, back: '误区: 过度简化、忽略上下文、缺乏实践验证' },
      { front: `如何在实际项目中应用${input.topic}?`, back: '步骤: 分析需求 → 设计方案 → 实施验证 → 迭代优化' },
    ],
    quiz: [
      { front: `${input.topic} 的最佳实践包括哪些?`, back: 'A.持续迭代 B.数据驱动 C.用户反馈 D.以上皆是 → 答案:D' },
      { front: `${input.topic} 中哪个指标最重要?`, back: '根据场景不同: 准确性、效率、可扩展性各有侧重' },
    ],
    scenario: [
      { front: `场景: 你在项目中遇到${input.topic}相关问题`, back: '解决方案: 分析根因 → 选择工具 → 执行验证 → 文档记录' },
    ],
    teach_back: [
      { front: `请向新手解释${input.topic}`, back: '教学框架: 是什么 → 为什么 → 怎么做 → 常见坑 → 最佳实践' },
    ],
  }

  const templates = contentTypeTemplates[input.content_type] || contentTypeTemplates.flashcard
  const cards: FlashCard[] = templates.map((t, i) => ({
    card_id: `card-${i + 1}-${rng.nextInt(100, 999)}`,
    front: t.front,
    back: t.back,
    difficulty: input.difficulty,
    tags: [input.topic, input.content_type, input.difficulty],
  }))

  const quizQuestions = cards.map((c, i) => ({
    question: c.front,
    options: ['A. 正确理解', 'B. 部分正确', 'C. 完全错误', 'D. 视情况而定'],
    correct_index: 0,
  }))

  const baseInterval = input.review_mode ? 1 : 3
  const lastReview = input.last_review_days_ago ?? 0
  const accuracy = input.previous_accuracy ?? 0.7
  const interval = input.review_mode
    ? Math.round(baseInterval * (1 + lastReview * 0.5) * accuracy)
    : baseInterval

  const retentionProb = Math.max(0.3, Math.min(0.99, Math.exp(-lastReview / (interval * 2)) * accuracy))
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval)

  const xpEarned = cards.length * 10 + (input.review_mode ? 5 : 0) + rng.nextInt(5, 20)

  let adaptiveRec = '继续当前节奏，保持每日5分钟微学习'
  if (retentionProb < 0.5) adaptiveRec = '遗忘风险较高，建议缩短复习间隔至1天'
  else if (retentionProb > 0.9) adaptiveRec = '记忆巩固良好，可延长间隔至7天'

  return {
    learner_id: input.learner_id,
    session: {
      session_id: `mls-${Date.now()}-${rng.nextInt(100, 999)}`,
      topic: input.topic,
      duration_minutes: 5,
      cards,
      quiz_questions: quizQuestions,
      spaced_repetition_interval: interval,
      next_review_date: nextDate.toISOString().split('T')[0] || '',
      retention_probability: Math.round(retentionProb * 100) / 100,
      xp_earned: xpEarned,
    },
    forgetting_curve_note: `基于艾宾浩斯遗忘曲线，第${lastReview}天保留率约${Math.round(retentionProb * 100)}%`,
    adaptive_recommendation: adaptiveRec,
  }
}

// --- Tool 5: Cert Prep ---
function analyzeCertPrep(input: CertPrepInput): CertPrepResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.learner_id + input.certification_name))

  const domains = input.current_mastery.map((m, i) => {
    const weight = Math.round(rng.nextFloat(10, 35))
    const targetMastery = Math.min(95, input.target_score + rng.nextInt(-5, 5))
    const gap = Math.max(0, targetMastery - m.mastery_pct)
    const hoursNeeded = Math.round(gap * rng.nextFloat(0.5, 1.5))
    return {
      domain: m.domain,
      weight_pct: weight,
      current_mastery: m.mastery_pct,
      target_mastery: targetMastery,
      gap,
      study_hours_needed: hoursNeeded,
      priority_rank: 0,
    }
  })

  domains.sort((a, b) => b.gap * b.weight_pct - a.gap * a.weight_pct)
  domains.forEach((d, i) => { d.priority_rank = i + 1 })

  const totalHours = domains.reduce((sum, d) => sum + d.study_hours_needed, 0)
  const weeklyHours = Math.round(totalHours / Math.max(input.available_weeks, 1))

  const weeklyPlan: CertPrepResult['weekly_study_plan'] = []
  for (let w = 1; w <= Math.min(input.available_weeks, 8); w++) {
    const weekDomains = domains.slice(0, Math.min(domains.length, w === input.available_weeks ? domains.length : 2))
    weeklyPlan.push({
      week: w,
      domains: weekDomains.map(d => d.domain),
      hours: weeklyHours,
    })
  }

  const practiceExam: CertPrepResult['practice_exam'] = domains.slice(0, 4).map((d, i) => ({
    question_id: `q-${i + 1}`,
    domain: d.domain,
    difficulty: d.gap > 20 ? 'hard' : d.gap > 10 ? 'medium' : 'easy',
    question: `${d.domain} 相关考核题目 #${i + 1}`,
    user_answer_correct: rng.next() > 0.4,
  }))

  const avgMastery = domains.reduce((sum, d) => sum + d.current_mastery, 0) / Math.max(domains.length, 1)
  const predictedScore = Math.round(avgMastery + rng.nextFloat(5, 15))
  const passProb = Math.min(99, Math.round((predictedScore / input.target_score) * 85))

  const weakAreas = domains.filter(d => d.gap > 15).map(d => d.domain)

  return {
    learner_id: input.learner_id,
    certification: input.certification_name,
    exam_date: input.exam_date,
    domains,
    total_study_hours: totalHours,
    weekly_study_plan: weeklyPlan,
    practice_exam: practiceExam,
    predicted_score: Math.min(100, predictedScore),
    pass_probability: Math.min(99, passProb),
    weak_areas: weakAreas,
  }
}

// --- Tool 6: Peer Match ---
function analyzePeerMatch(input: PeerMatchInput): PeerMatchResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.learner_id + input.skill_name))

  const names = ['Alex Chen', 'Maria Liu', 'Raj Patel', 'Emma Wang', 'David Kim', 'Sophie Zhang', 'James Wu', 'Luna Zhao', 'Kai Tanaka', 'Aria Singh']
  const timezones = ['UTC+8', 'UTC+0', 'UTC-5', 'UTC+1', 'UTC+9', 'UTC-8', 'UTC+5:30', 'UTC+10']
  const styles: PeerMatchInput['communication_style'][] = ['async', 'sync', 'hybrid']

  const matches: PeerProfile[] = []
  const count = rng.nextInt(4, 8)

  for (let i = 0; i < count; i++) {
    const peerLevel = input.current_level + rng.nextInt(-2, 4)
    const peerTimezone = rng.pick(timezones)
    const peerStyle = rng.pick(styles)

    const complementary = Math.max(0, 100 - Math.abs(peerLevel - input.current_level) * 15)
    const tzMatch = peerTimezone === input.timezone ? 100 : rng.nextInt(30, 80)
    const styleMatch = peerStyle === input.communication_style ? 100 : peerStyle === 'hybrid' || input.communication_style === 'hybrid' ? 80 : rng.nextInt(40, 70)
    const overall = Math.round((complementary * 0.4 + tzMatch * 0.3 + styleMatch * 0.3))

    matches.push({
      peer_id: `peer-${rng.nextInt(10000, 99999)}`,
      name: rng.pick(names),
      skill_level: Math.max(1, Math.min(10, peerLevel)),
      timezone: peerTimezone,
      communication_style: peerStyle,
      complementary_score: complementary,
      timezone_compatibility: tzMatch,
      style_match: styleMatch,
      overall_match: overall,
      session_availability: rng.pick([['Mon 19:00', 'Wed 19:00', 'Sat 10:00'], ['Tue 20:00', 'Thu 20:00', 'Sun 14:00'], ['Daily 12:00']]),
    })
  }

  matches.sort((a, b) => b.overall_match - a.overall_match)
  const bestMatch = matches.length > 0 ? matches[0] : null
  const suggestedFormat = bestMatch && bestMatch.communication_style === 'sync' ? '实时视频会议' : bestMatch && bestMatch.communication_style === 'async' ? '异步讨论板 + 文档协作' : '混合模式：周同步 + 日异步'

  return {
    learner_id: input.learner_id,
    skill_name: input.skill_name,
    matches,
    total_candidates: matches.length,
    best_match: bestMatch,
    suggested_session_format: suggestedFormat,
  }
}

// --- Tool 7: Career Simulator ---
function analyzeCareerSim(input: CareerSimInput): CareerSimResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.learner_id + input.target_role + input.simulation_type))

  const taskTemplates: Record<string, Array<{ title: string; desc: string; skills: string[]; difficulty: string; minutes: number }>> = {
    day_in_life: [
      { title: '晨会参与', desc: '参加团队晨会，同步进度与阻塞', skills: ['communication', 'planning'], difficulty: 'easy', minutes: 30 },
      { title: '需求评审', desc: '评审新功能需求并提出技术方案', skills: ['analysis', 'domain_knowledge'], difficulty: 'medium', minutes: 60 },
      { title: '代码审查', desc: '审阅同事提交的代码变更', skills: ['code_review', 'quality_assurance'], difficulty: 'medium', minutes: 45 },
      { title: '技术调研', desc: '评估新工具/技术栈的适用性', skills: ['research', 'evaluation'], difficulty: 'hard', minutes: 90 },
      { title: '跨团队协作', desc: '与其他部门对齐产品路线图', skills: ['collaboration', 'strategic_thinking'], difficulty: 'medium', minutes: 45 },
    ],
    project_sprint: [
      { title: 'Sprint规划', desc: '拆解用户故事并估算工作量', skills: ['planning', 'estimation'], difficulty: 'medium', minutes: 60 },
      { title: '核心功能开发', desc: '实现关键业务逻辑与技术难点', skills: ['coding', 'problem_solving'], difficulty: 'hard', minutes: 120 },
      { title: '单元测试编写', desc: '为核心模块编写自动化测试', skills: ['testing', 'quality_assurance'], difficulty: 'medium', minutes: 60 },
      { title: 'CI/CD流水线配置', desc: '搭建自动化部署流程', skills: ['devops', 'automation'], difficulty: 'hard', minutes: 90 },
      { title: 'Sprint回顾', desc: '总结本迭代经验与改进点', skills: ['retrospective', 'communication'], difficulty: 'easy', minutes: 30 },
    ],
    interview_prep: [
      { title: '自我介绍演练', desc: '准备并练习2分钟自我介绍', skills: ['communication', 'self_presentation'], difficulty: 'easy', minutes: 30 },
      { title: '系统设计答题', desc: '完成一道系统设计面试题', skills: ['system_design', 'architecture'], difficulty: 'hard', minutes: 60 },
      { title: '行为面试模拟', desc: '回答STAR模型行为面试题', skills: ['communication', 'problem_solving'], difficulty: 'medium', minutes: 45 },
      { title: '技术白板编程', desc: '在白板上完成算法题', skills: ['algorithms', 'coding'], difficulty: 'hard', minutes: 60 },
      { title: '反向提问准备', desc: '准备向面试官提问的高质量问题', skills: ['research', 'strategic_thinking'], difficulty: 'easy', minutes: 15 },
    ],
    skill_application: [
      { title: '问题定义', desc: '明确要解决的实际业务问题', skills: ['problem_framing', 'analysis'], difficulty: 'medium', minutes: 45 },
      { title: '方案设计', desc: '设计完整解决方案架构', skills: ['design', 'architecture'], difficulty: 'hard', minutes: 90 },
      { title: '原型开发', desc: '快速构建可演示原型', skills: ['prototyping', 'coding'], difficulty: 'hard', minutes: 120 },
      { title: '用户测试', desc: '招募测试用户并收集反馈', skills: ['user_research', 'empathy'], difficulty: 'medium', minutes: 60 },
      { title: '迭代优化', desc: '基于反馈改进方案', skills: ['iteration', 'agile'], difficulty: 'medium', minutes: 45 },
    ],
  }

  const templates = taskTemplates[input.simulation_type] || taskTemplates.day_in_life
  const tasks: SimulationTask[] = templates.map((t, i) => ({
    task_id: `task-${i + 1}-${rng.nextInt(100, 999)}`,
    title: t.title,
    description: t.desc,
    skills_applied: t.skills,
    difficulty: t.difficulty,
    estimated_minutes: t.minutes,
    xp_reward: t.minutes * 2 + (t.difficulty === 'hard' ? 30 : t.difficulty === 'medium' ? 15 : 0) + rng.nextInt(5, 25),
    deliverable: `${t.title} — 完成报告与产出文档`,
  }))

  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimated_minutes, 0)
  const totalXp = tasks.reduce((sum, t) => sum + t.xp_reward, 0)
  const allSkills = [...new Set(tasks.flatMap(t => t.skills_applied))]

  return {
    learner_id: input.learner_id,
    target_role: input.target_role,
    simulation_type: input.simulation_type,
    industry: input.industry,
    tasks,
    total_duration_minutes: totalMinutes,
    total_xp: totalXp,
    skills_demonstrated: allSkills,
    portfolio_output: `${input.target_role} ${input.simulation_type}项目产出：包含${tasks.length}个任务交付物`,
    confidence_boost_pct: rng.nextInt(15, 45),
  }
}

// --- Tool 8: Learning Analytics ---
function analyzeLearningAnalytics(input: AnalyticsInput): LearningAnalyticsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(input.learner_id + input.time_range))

  const daysInPeriod = input.time_range === 'week' ? 7 : input.time_range === 'month' ? 30 : input.time_range === 'quarter' ? 90 : 365
  const dailyActivities: DailyActivity[] = []
  let totalMinutes = 0
  let totalXp = 0

  const topics = ['Python基础', '数据分析', '机器学习', '系统设计', '产品思维', '项目管理', '沟通技巧']
  const today = new Date()

  for (let i = 0; i < daysInPeriod; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const isActive = rng.next() > 0.25
    const minutes = isActive ? rng.nextInt(20, 120) : 0
    const xp = minutes > 0 ? Math.round(minutes * rng.nextFloat(1.5, 3.0)) : 0
    totalMinutes += minutes
    totalXp += xp

    dailyActivities.push({
      date: date.toISOString().split('T')[0] || '',
      minutes_studied: minutes,
      xp_earned: xp,
      skills_practiced: minutes > 0 ? rng.pick(topics).split('').length > 0 ? [rng.pick(topics)] : [] : [],
    })
  }

  dailyActivities.sort((a, b) => a.date.localeCompare(b.date))

  const streakDays = (() => {
    let streak = 0
    for (const d of dailyActivities) {
      if (d.minutes_studied > 0) streak++
      else break
    }
    return streak
  })()

  const skillGrowth: SkillGrowthCurve[] = topics.slice(0, 5).map(skill => {
    const startLevel = rng.nextInt(1, 4)
    const currentLevel = startLevel + rng.nextInt(1, 4)
    const growth = Math.round(((currentLevel - startLevel) / startLevel) * 100)
    return {
      skill_name: skill,
      start_level: startLevel,
      current_level: currentLevel,
      growth_pct: growth,
      trend: (['accelerating', 'steady', 'plateau', 'declining'] as const)[rng.nextInt(0, 3)],
    }
  })

  const level = Math.floor(totalXp / 500) + 1
  const levelTitles = ['初学者', '入门者', '初级学者', '中级学徒', '熟练实践者', '高级专家', '知识领袖', '行业大师']
  const levelTitle = levelTitles[Math.min(Math.floor(level / 3), levelTitles.length - 1)]
  const skillsMastered = skillGrowth.filter(s => s.current_level >= 7).length
  const skillsInProgress = skillGrowth.length - skillsMastered
  const readiness = Math.min(95, Math.round((level / 20) * 100 + rng.nextFloat(5, 20)))

  return {
    learner_id: input.learner_id,
    time_range: input.time_range,
    total_study_hours: Math.round(totalMinutes / 60 * 10) / 10,
    total_xp_earned: totalXp,
    current_level: level,
    current_level_title: levelTitle,
    streak_days: streakDays,
    daily_activities: dailyActivities.slice(-14),
    skill_growth: skillGrowth,
    career_readiness_pct: readiness,
    skills_mastered: skillsMastered,
    skills_in_progress: skillsInProgress,
    projected_certification_timeline: `预计${Math.max(1, Math.round(12 - level * 0.5))}个月后达到认证水平`,
    learning_velocity: Math.round((totalMinutes / daysInPeriod) * 10) / 10,
    engagement_score: Math.round(rng.nextFloat(0.65, 0.98) * 100) / 100,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Progress bar helper ---
function progressBar(pct: number, width: number = 20): string {
  const filled = Math.round((pct / 100) * width)
  const empty = width - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

// --- Tool 1: Learner Profile Report ---
function formatLearnerProfileReport(result: LearnerProfileResult): string {
  const lines: string[] = []
  lines.push('## 🎓 Learner Profile — 学习者画像报告')
  lines.push('')
  lines.push(`学习者: ${result.name} (${result.learner_id})`)
  lines.push(`当前角色: ${result.current_role} → 目标角色: ${result.target_role}`)
  lines.push('')
  lines.push('### 📊 等级与XP')
  lines.push('')
  lines.push(`等级: **Lv.${result.overall_level}** — ${result.level_title}`)
  lines.push(`XP: ${result.xp_points} / ${result.xp_points + result.xp_to_next_level} ${progressBar(Math.round((result.xp_points / (result.xp_points + result.xp_to_next_level)) * 100))}`)
  lines.push(`升级还需: ${result.xp_to_next_level} XP`)
  lines.push('')
  lines.push('### 🎯 技能树 — 能力基线')
  lines.push('')
  lines.push('| 技能 | 等级 | 掌握度 | 类别 |')
  lines.push('|------|------|--------|------|')
  for (const s of result.skill_baselines) {
    lines.push(`| ${s.skill_name} | Lv.${s.current_level} | ${progressBar(s.mastery_pct)} ${s.mastery_pct}% | ${s.category} |`)
  }
  lines.push('')
  lines.push('### 🧠 学习风格')
  lines.push('')
  lines.push(`主风格: **${result.learning_style.primary}** | 辅助: ${result.learning_style.secondary}`)
  lines.push(`推荐学习形式: ${result.learning_style.recommended_formats.join('、')}`)
  lines.push(`投入度评分: ${result.learning_style.engagement_score}`)
  lines.push('')
  lines.push('### ⏰ 可用时间')
  lines.push('')
  lines.push(`每周可投入: **${result.weekly_hours}小时**`)
  lines.push(`就绪度: ${progressBar(result.readiness_score)} ${result.readiness_score}%`)
  lines.push('')
  lines.push('### 📋 技能树可视化')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push(`    ROOT[${result.name} 技能树]`)
  for (const s of result.skill_baselines.slice(0, 6)) {
    lines.push(`    ROOT --> ${s.skill_name.replace(/\s/g, '_')}[${s.skill_name} Lv.${s.current_level}]`)
  }
  lines.push('```')
  lines.push('')
  lines.push('### 📋 发展建议清单')
  lines.push('- [x] 技能基线评估完成')
  lines.push('- [x] 学习风格画像生成')
  lines.push('- [x] 时间投入优化建议')
  lines.push('- [ ] 待执行技能差距分析')
  lines.push('- [ ] 待生成学习路径')
  lines.push('')
  lines.push('---')
  lines.push('*EduFlow AI • 2026 Education Trends • Z-Gen Learning Revolution*')
  return lines.join('\n')
}

// --- Tool 2: Skill Gap Analyzer Report ---
function formatSkillGapReport(result: SkillGapResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Skill Gap Analyzer — 技能差距分析报告')
  lines.push('')
  lines.push(`目标岗位: **${result.target_role}** | 差距项: ${result.total_gaps} | 关键差距: ${result.critical_gaps}`)
  lines.push(`整体就绪度: ${progressBar(result.overall_readiness_pct)} ${result.overall_readiness_pct}% — ${result.readiness_level}`)
  lines.push(`预计总投入: **${result.total_estimated_hours}小时**`)
  lines.push('')
  lines.push('### 📊 差距优先级矩阵')
  lines.push('')
  lines.push('| 优先级 | 技能 | 当前→目标 | 差距 | 严重度 | 预计时长 |')
  lines.push('|--------|------|-----------|------|--------|----------|')
  for (const g of result.gaps) {
    const severityEmoji = g.gap_severity === 'critical' ? '🔴' : g.gap_severity === 'significant' ? '🟠' : g.gap_severity === 'moderate' ? '🟡' : '🟢'
    lines.push(`| P${Math.round(g.priority)} | ${g.skill_name} | Lv.${g.current_level}→Lv.${g.required_level} | -${g.gap} | ${severityEmoji} ${g.gap_severity} | ${g.estimated_hours}h |`)
  }
  lines.push('')
  lines.push('### 📊 差距可视化')
  lines.push('')
  for (const g of result.gaps.slice(0, 6)) {
    const barLen = 15
    const filled = Math.round((g.current_level / Math.max(g.required_level, 1)) * barLen)
    const bar = '▓'.repeat(filled) + '░'.repeat(barLen - filled)
    lines.push(`${g.skill_name.padEnd(15)} ${bar} ${g.current_level}/${g.required_level}`)
  }
  lines.push('')
  lines.push('### 📋 技能差距拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push(`    CURRENT[当前能力] -->|差距分析| GAP[技能缺口]`)
  lines.push('    GAP --> TARGET[目标能力]')
  for (const g of result.gaps.slice(0, 5)) {
    lines.push(`    GAP --> ${g.skill_name.replace(/\s/g, '_')}[${g.skill_name}: -${g.gap}级]`)
  }
  lines.push('```')
  lines.push('')
  lines.push('### 📋 差距分析清单')
  lines.push('- [x] 当前技能水平评估')
  lines.push('- [x] 目标岗位要求对标')
  lines.push('- [x] 差距严重度分级')
  lines.push('- [x] 优先级排序完成')
  lines.push('- [x] 学习时长估算')
  lines.push('')
  lines.push('---')
  lines.push('*EduFlow AI • 2026 Education Trends • Skill Gap Intelligence*')
  return lines.join('\n')
}

// --- Tool 3: Learning Path Report ---
function formatLearningPathReport(result: LearningPathResult): string {
  const lines: string[] = []
  lines.push('## 🗺️ Learning Path Generator — 个性化学习路径')
  lines.push('')
  lines.push(`目标岗位: **${result.target_role}** | 策略: ${result.path_strategy}`)
  lines.push(`总周数: ${result.total_weeks}周 | 总时长: ${result.total_hours}小时 | 总XP奖励: ${result.total_xp}`)
  lines.push('')
  lines.push('### 📈 学习时序甘特图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('gantt')
  lines.push('    title 学习路径甘特图')
  lines.push('    dateFormat  YYYY-MM-DD')
  lines.push('    section 学习模块')
  for (const m of result.modules) {
    lines.push(`    ${m.title} :active, m${m.module_id.slice(-3)}, ${m.week_number * 7}d`)
  }
  lines.push('```')
  lines.push('')
  lines.push('### 📋 模块清单')
  lines.push('')
  lines.push('| 周次 | 模块 | 技能 | 时长 | XP | 里程碑 |')
  lines.push('|------|------|------|------|-----|--------|')
  for (const m of result.modules) {
    lines.push(`| W${m.week_number} | ${m.title} | ${m.skill_name} | ${m.estimated_hours}h | +${m.xp_reward} | ${m.milestone} |`)
  }
  lines.push('')
  lines.push('### 📋 推荐资源')
  lines.push('')
  for (const m of result.modules.slice(0, 4)) {
    lines.push(`**${m.title}** (W${m.week_number}):`)
    for (const r of m.resources) {
      lines.push(`- ${r}`)
    }
  }
  lines.push('')
  lines.push('### 📋 学习路径清单')
  lines.push('- [x] 前置依赖分析完成')
  lines.push('- [x] 最优学习序列生成')
  lines.push('- [x] 时间投入估算')
  lines.push('- [x] 里程碑设定')
  lines.push('- [ ] 开始第一阶段学习')
  lines.push('')
  lines.push('---')
  lines.push('*EduFlow AI • 2026 Education Trends • Personalized Learning Paths*')
  return lines.join('\n')
}

// --- Tool 4: Micro Learning Report ---
function formatMicroLearningReport(result: MicroLearningResult): string {
  const lines: string[] = []
  const s = result.session
  lines.push('## ⚡ Micro Learning — 微学习引擎')
  lines.push('')
  lines.push(`主题: **${s.topic}** | 会话ID: ${s.session_id}`)
  lines.push(`时长: ${s.duration_minutes}分钟 | XP奖励: +${s.xp_earned}`)
  lines.push('')
  lines.push('### 🃏 知识卡片')
  lines.push('')
  for (const c of s.cards) {
    lines.push(`**卡片 ${c.card_id}** [${c.difficulty}]`)
    lines.push(`> **问:** ${c.front}`)
    lines.push(`> **答:** ${c.back}`)
    lines.push(`> 标签: ${c.tags.join(', ')}`)
    lines.push('')
  }
  lines.push('### 🧠 间隔重复计划')
  lines.push('')
  lines.push(`下次复习日期: **${s.next_review_date}**`)
  lines.push(`复习间隔: ${s.spaced_repetition_interval}天`)
  lines.push(`记忆保留概率: ${progressBar(Math.round(s.retention_probability * 100))} ${Math.round(s.retention_probability * 100)}%`)
  lines.push('')
  lines.push(`> 📝 **遗忘曲线**: ${result.forgetting_curve_note}`)
  lines.push(`> 🔄 **自适应建议**: ${result.adaptive_recommendation}`)
  lines.push('')
  lines.push('### 📊 记忆保留曲线')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    A[首次学习] -->|1天后| B[复习1]')
  lines.push(`    B -->|${s.spaced_repetition_interval}天后| C[复习2]`)
  lines.push(`    C -->|${s.spaced_repetition_interval * 2}天后| D[复习3]`)
  lines.push('    D -->|长期记忆| E[技能固化]')
  lines.push('```')
  lines.push('')
  lines.push('### 📋 微学习清单')
  lines.push('- [x] 5分钟课程完成')
  lines.push('- [x] 知识卡片学习')
  lines.push('- [x] 间隔重复调度')
  lines.push('- [x] 遗忘曲线自适应')
  lines.push('- [ ] 下次复习执行')
  lines.push('')
  lines.push('---')
  lines.push('*EduFlow AI • 2026 Education Trends • Spaced Repetition & Micro-Learning*')
  return lines.join('\n')
}

// --- Tool 5: Cert Prep Report ---
function formatCertPrepReport(result: CertPrepResult): string {
  const lines: string[] = []
  lines.push('## 📜 Cert Prep — 认证考试备考系统')
  lines.push('')
  lines.push(`认证: **${result.certification}** | 考试日期: ${result.exam_date}`)
  lines.push(`预计学习时长: **${result.total_study_hours}小时** | 可用周数: ${result.weekly_study_plan.length}周`)
  lines.push(`预测得分: **${result.predicted_score}分** | 通过概率: ${progressBar(result.pass_probability)} ${result.pass_probability}%`)
  lines.push('')
  lines.push('### 📊 考点分析')
  lines.push('')
  lines.push('| 优先级 | 领域 | 权重 | 当前掌握 | 目标 | 差距 | 需学时 |')
  lines.push('|--------|------|------|----------|------|------|--------|')
  for (const d of result.domains) {
    const bar = progressBar(d.current_mastery, 10)
    lines.push(`| P${d.priority_rank} | ${d.domain} | ${d.weight_pct}% | ${bar} ${d.current_mastery}% | ${d.target_mastery}% | -${d.gap} | ${d.study_hours_needed}h |`)
  }
  lines.push('')
  if (result.weak_areas.length > 0) {
    lines.push('### ⚠️ 弱项强化')
    lines.push('')
    for (const w of result.weak_areas) {
      lines.push(`- 🔴 **${w}** — 需重点强化，增加50%学习时长`)
    }
    lines.push('')
  }
  lines.push('### 📅 周学习计划')
  lines.push('')
  for (const w of result.weekly_study_plan) {
    lines.push(`**第${w.week}周** (${w.hours}h): ${w.domains.join(' → ')}`)
  }
  lines.push('')
  lines.push('### 📋 模拟考结果')
  lines.push('')
  for (const q of result.practice_exam) {
    lines.push(`- ${q.user_answer_correct ? '✅' : '❌'} ${q.domain} [${q.difficulty}] — ${q.question}`)
  }
  lines.push('')
  lines.push('### 📋 备考合规清单')
  lines.push('- [x] 考点权重分析')
  lines.push('- [x] 当前掌握度评估')
  lines.push('- [x] 弱项识别')
  lines.push('- [x] 周学习计划生成')
  lines.push('- [x] 模拟考执行')
  lines.push('- [ ] 弱项针对性强化')
  lines.push('- [ ] 考前冲刺')
  lines.push('')
  lines.push('---')
  lines.push('*EduFlow AI • 2026 Education Trends • AI-Powered Cert Prep*')
  return lines.join('\n')
}

// --- Tool 6: Peer Match Report ---
function formatPeerMatchReport(result: PeerMatchResult): string {
  const lines: string[] = []
  lines.push('## 👥 Peer Match — 同伴学习匹配系统')
  lines.push('')
  lines.push(`目标技能: **${result.skill_name}** | 候选池: ${result.total_candidates}人`)
  if (result.best_match) {
    lines.push(`最佳匹配: **${result.best_match.name}** | 匹配度: ${progressBar(result.best_match.overall_match)} ${result.best_match.overall_match}%`)
  }
  lines.push(`建议形式: ${result.suggested_session_format}`)
  lines.push('')
  lines.push('### 📊 匹配度排行榜')
  lines.push('')
  lines.push('| 排名 | 姓名 | 技能等级 | 时区 | 沟通风格 | 互补性 | 时区匹配 | 风格匹配 | 总分 |')
  lines.push('|------|------|----------|------|----------|--------|----------|----------|------|')
  result.matches.forEach((m, i) => {
    lines.push(`| ${i + 1} | ${m.name} | Lv.${m.skill_level} | ${m.timezone} | ${m.communication_style} | ${m.complementary_score}% | ${m.timezone_compatibility}% | ${m.style_match}% | **${m.overall_match}%** |`)
  })
  lines.push('')
  if (result.best_match) {
    lines.push('### 🌟 最佳匹配详情')
    lines.push('')
    lines.push(`姓名: **${result.best_match.name}** (${result.best_match.peer_id})`)
    lines.push(`技能等级: Lv.${result.best_match.skill_level}`)
    lines.push(`时区: ${result.best_match.timezone}`)
    lines.push(`沟通风格: ${result.best_match.communication_style}`)
    lines.push(`可约时段: ${result.best_match.session_availability.join(' / ')}`)
    lines.push('')
  }
  lines.push('### 📋 匹配拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    ME[我] -->|匹配| POOL[候选池]')
  for (const m of result.matches.slice(0, 5)) {
    lines.push(`    POOL --> ${m.name.replace(/\s/g, '_')}[${m.name} ${m.overall_match}%]`)
  }
  lines.push('```')
  lines.push('')
  lines.push('### 📋 同伴匹配清单')
  lines.push('- [x] 水平互补分析')
  lines.push('- [x] 时区兼容性评估')
  lines.push('- [x] 沟通风格匹配')
  lines.push('- [x] 最佳学习配对推荐')
  lines.push('- [ ] 发起学习邀请')
  lines.push('')
  lines.push('---')
  lines.push('*EduFlow AI • 2026 Education Trends • Peer Learning Revolution*')
  return lines.join('\n')
}

// --- Tool 7: Career Simulator Report ---
function formatCareerSimReport(result: CareerSimResult): string {
  const lines: string[] = []
  lines.push('## 🚀 Career Simulator — 职业模拟器')
  lines.push('')
  lines.push(`目标角色: **${result.target_role}** | 模拟类型: ${result.simulation_type}`)
  lines.push(`行业: ${result.industry} | 总时长: ${Math.round(result.total_duration_minutes / 60 * 10) / 10}小时 | XP奖励: +${result.total_xp}`)
  lines.push(`信心提升: **+${result.confidence_boost_pct}%**`)
  lines.push('')
  lines.push('### 📊 模拟任务清单')
  lines.push('')
  for (const t of result.tasks) {
    lines.push(`**${t.task_id} | ${t.title}** [${t.difficulty}] — ${t.estimated_minutes}分钟 | +${t.xp_reward} XP`)
    lines.push(`> ${t.description}`)
    lines.push(`> 技能应用: ${t.skills_applied.join(', ')}`)
    lines.push(`> 交付物: ${t.deliverable}`)
    lines.push('')
  }
  lines.push('### 🎯 技能应用矩阵')
  lines.push('')
  lines.push('| 技能 | 涉及任务数 | 最高难度 |')
  lines.push('|------|-----------|----------|')
  const skillMap = new Map<string, { count: number; maxDiff: number }>()
  const diffVal = (d: string) => d === 'hard' ? 3 : d === 'medium' ? 2 : 1
  for (const t of result.tasks) {
    for (const s of t.skills_applied) {
      const existing = skillMap.get(s) || { count: 0, maxDiff: 0 }
      skillMap.set(s, {
        count: existing.count + 1,
        maxDiff: Math.max(existing.maxDiff, diffVal(t.difficulty)),
      })
    }
  }
  for (const [skill, info] of [...skillMap.entries()].sort((a, b) => b[1].count - a[1].count)) {
    const diffLabel = info.maxDiff === 3 ? 'hard' : info.maxDiff === 2 ? 'medium' : 'easy'
    lines.push(`| ${skill} | ${info.count} | ${diffLabel} |`)
  }
  lines.push('')
  lines.push('### 📋 模拟项目拓扑')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push(`    START[开始: ${result.simulation_type}]`)
  for (const t of result.tasks) {
    lines.push(`    START --> ${t.task_id}[${t.title} ${t.estimated_minutes}min]`)
  }
  lines.push('```')
  lines.push('')
  lines.push('### 📋 模拟产出')
  lines.push('')
  lines.push(`作品集输出: **${result.portfolio_output}**`)
  lines.push(`技能展示: ${result.skills_demonstrated.join(', ')}`)
  lines.push('')
  lines.push('### 📋 职业模拟清单')
  lines.push('- [x] 角色体验环境构建')
  lines.push('- [x] 实战任务执行')
  lines.push('- [x] 技能应用验证')
  lines.push('- [x] 作品集产出')
  lines.push('- [x] 信心度评估')
  lines.push('')
  lines.push('---')
  lines.push('*EduFlow AI • 2026 Education Trends • Experiential Career Learning*')
  return lines.join('\n')
}

// --- Tool 8: Learning Analytics Report ---
function formatLearningAnalyticsReport(result: LearningAnalyticsResult): string {
  const lines: string[] = []
  lines.push('## 📊 Learning Analytics — 学习分析仪表盘')
  lines.push('')
  lines.push(`时间范围: ${result.time_range} | 学习ID: ${result.learner_id}`)
  lines.push(`等级: **Lv.${result.current_level}** — ${result.current_level_title} | 连续学习: 🔥 ${result.streak_days}天`)
  lines.push(`总学习时长: **${result.total_study_hours}小时** | 总XP: ${result.total_xp_earned} | 日均投入: ${result.learning_velocity}分钟`)
  lines.push('')
  lines.push('### 📈 技能增长曲线')
  lines.push('')
  for (const s of result.skill_growth) {
    const trendIcon = s.trend === 'accelerating' ? '🚀' : s.trend === 'steady' ? '📈' : s.trend === 'plateau' ? '➡️' : '📉'
    lines.push(`${s.skill_name}: Lv.${s.start_level} → Lv.${s.current_level} (+${s.growth_pct}%) ${trendIcon} ${s.trend}`)
  }
  lines.push('')
  lines.push('### 📊 技能增长可视化')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    GROWTH[技能增长] --> MASTERED[已掌握]')
  lines.push('    GROWTH --> PROGRESS[进行中]')
  for (const s of result.skill_growth) {
    const node = s.current_level >= 7 ? 'MASTERED' : 'PROGRESS'
    lines.push(`    ${node} --> ${s.skill_name.replace(/\s/g, '_')}[${s.skill_name} Lv.${s.current_level}]`)
  }
  lines.push('```')
  lines.push('')
  lines.push('### 🎯 就业转化指标')
  lines.push('')
  lines.push(`就业准备度: ${progressBar(result.career_readiness_pct)} ${result.career_readiness_pct}%`)
  lines.push(`已掌握技能: ${result.skills_mastered} | 在学技能: ${result.skills_in_progress}`)
  lines.push(`投入度评分: ${progressBar(Math.round(result.engagement_score * 100))} ${Math.round(result.engagement_score * 100)}%`)
  lines.push(`预测认证时间线: **${result.projected_certification_timeline}**`)
  lines.push('')
  lines.push('### 📅 近期活动热力图')
  lines.push('')
  lines.push('| 日期 | 学习时长 | XP | 练习技能 |')
  lines.push('|------|----------|-----|----------|')
  for (const d of result.daily_activities.slice(-7).reverse()) {
    lines.push(`| ${d.date} | ${d.minutes_studied}min | +${d.xp_earned} | ${d.skills_practiced.join(', ') || '休息'} |`)
  }
  lines.push('')
  lines.push('### 📋 分析清单')
  lines.push('- [x] 学习时间追踪')
  lines.push('- [x] 技能增长曲线计算')
  lines.push('- [x] 就业转化率评估')
  lines.push('- [x] 学习速度分析')
  lines.push('- [x] 投入度评分')
  lines.push('- [x] 认证时间线预测')
  lines.push('')
  lines.push('---')
  lines.push('*EduFlow AI • 2026 Education Trends • Data-Driven Learning Analytics*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Learner Profile — 学习者画像
  tools.register(defineTool({
    name: 'learner_profile',
    description: '学习者画像分析 | 能力基线/学习风格/目标岗位/可用时间 | Comprehensive learner profiling with skill baselines, learning style detection, and time optimization.',
    parameters: {
      profile_input: {
        type: 'string',
        required: true,
        description: 'JSON: learner_id, name, current_role, target_role, current_skills[{name, level}], learning_style(visual|auditory|kinesthetic|reading_writing|mixed), weekly_hours_available, preferred_pace(intensive|moderate|relaxed)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { profile_input: string }) {
      const input: LearnerProfileInput = JSON.parse(args.profile_input)
      return formatLearnerProfileReport(analyzeLearnerProfile(input))
    }
  }))

  // Tool 2: Skill Gap Analyzer — 技能差距分析
  tools.register(defineTool({
    name: 'skill_gap_analyzer',
    description: '技能差距分析 | 当前vs目标岗位/差距可视化/优先级排序 | AI-powered skill gap analysis with visual priority matrix and hour estimates.',
    parameters: {
      gap_input: {
        type: 'string',
        required: true,
        description: 'JSON: learner_id, current_skills[{name, level}], target_role, target_skills[{name, required_level, weight}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { gap_input: string }) {
      const input: SkillGapInput = JSON.parse(args.gap_input)
      return formatSkillGapReport(analyzeSkillGap(input))
    }
  }))

  // Tool 3: Learning Path Generator — 个性化学习路径
  tools.register(defineTool({
    name: 'learning_path_gen',
    description: '个性化学习路径生成 | 前置依赖/最优序列/时间估计/里程碑 | Personalized learning path with dependency resolution, optimal sequencing, and milestone tracking.',
    parameters: {
      path_input: {
        type: 'string',
        required: true,
        description: 'JSON: learner_id, target_role, gaps[{skill_name, gap, priority}], weekly_hours, preferred_sequence(dependency_first|quick_wins|balanced)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { path_input: string }) {
      const input: LearningPathInput = JSON.parse(args.path_input)
      return formatLearningPathReport(analyzeLearningPath(input))
    }
  }))

  // Tool 4: Micro Learning — 微学习引擎
  tools.register(defineTool({
    name: 'micro_learning',
    description: '5分钟微学习引擎 | 知识卡片/间隔重复/遗忘曲线自适应 | Micro-learning with flashcards, spaced repetition, and adaptive forgetting curve scheduling.',
    parameters: {
      micro_input: {
        type: 'string',
        required: true,
        description: 'JSON: learner_id, topic, content_type(flashcard|quiz|scenario|teach_back), difficulty(beginner|intermediate|advanced), review_mode(boolean), last_review_days_ago?, previous_accuracy?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { micro_input: string }) {
      const input: MicroLearningInput = JSON.parse(args.micro_input)
      return formatMicroLearningReport(analyzeMicroLearning(input))
    }
  }))

  // Tool 5: Cert Prep — 认证考试备考
  tools.register(defineTool({
    name: 'cert_prep',
    description: '认证考试备考 | 考点分析/模拟考/弱项针对性强化/通过率预测 | AI exam prep with domain analysis, practice tests, weak area reinforcement, and pass probability.',
    parameters: {
      cert_input: {
        type: 'string',
        required: true,
        description: 'JSON: learner_id, certification_name, exam_date, current_mastery[{domain, mastery_pct}], target_score, available_weeks'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { cert_input: string }) {
      const input: CertPrepInput = JSON.parse(args.cert_input)
      return formatCertPrepReport(analyzeCertPrep(input))
    }
  }))

  // Tool 6: Peer Match — 同伴学习匹配
  tools.register(defineTool({
    name: 'peer_match',
    description: '同伴学习匹配 | 水平互补/时区兼容/沟通风格/学习配对推荐 | Intelligent peer matching for collaborative learning with timezone and style compatibility.',
    parameters: {
      peer_input: {
        type: 'string',
        required: true,
        description: 'JSON: learner_id, skill_name, current_level, timezone, communication_style(async|sync|hybrid), goal'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { peer_input: string }) {
      const input: PeerMatchInput = JSON.parse(args.peer_input)
      return formatPeerMatchReport(analyzePeerMatch(input))
    }
  }))

  // Tool 7: Career Simulator — 职业模拟器
  tools.register(defineTool({
    name: 'career_simulator',
    description: '职业模拟器 | 角色体验/行业日/项目冲刺/技能应用实战/作品集产出 | Immersive career simulation with role-play, project sprints, and portfolio generation.',
    parameters: {
      sim_input: {
        type: 'string',
        required: true,
        description: 'JSON: learner_id, target_role, simulation_type(day_in_life|project_sprint|interview_prep|skill_application), duration_hours, industry'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sim_input: string }) {
      const input: CareerSimInput = JSON.parse(args.sim_input)
      return formatCareerSimReport(analyzeCareerSim(input))
    }
  }))

  // Tool 8: Learning Analytics — 学习分析仪表盘
  tools.register(defineTool({
    name: 'learning_analytics',
    description: '学习分析仪表盘 | 投入时间/技能增长曲线/就业转化率/学习速度/认证时间线预测 | Comprehensive analytics dashboard with skill growth curves, career readiness, and engagement scoring.',
    parameters: {
      analytics_input: {
        type: 'string',
        required: true,
        description: 'JSON: learner_id, time_range(week|month|quarter|year), metrics[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { analytics_input: string }) {
      const input: AnalyticsInput = JSON.parse(args.analytics_input)
      return formatLearningAnalyticsReport(analyzeLearningAnalytics(input))
    }
  }))

  console.log(`[dsh-tool-eduflow] Loaded v${VERSION} — AI Education Engine: 8 tools active`)
  console.log('  Tools: learner_profile, skill_gap_analyzer, learning_path_gen, micro_learning, cert_prep, peer_match, career_simulator, learning_analytics')
}
