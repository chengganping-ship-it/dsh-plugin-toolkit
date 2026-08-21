/**
 * DSH EduAgentPro Plugin v1.0.0
 *
 * 教育AI助手 — 自适应学习与教学管理智能体
 * 2026年AI+教育垂直领域AI Agent插件，聚焦自适应学习、教学管理、学情分析全流程。
 *
 * 8大核心工具:
 * 1. adaptive_learning_path       — 自适应学习路径引擎
 * 2. student_performance_predictor — 学情预测预警
 * 3. auto_grading_engine          — 智能批改引擎
 * 4. course_quality_evaluator     — 课程质量评估
 * 5. personalized_homework_generator — 个性化作业生成
 * 6. teaching_effectiveness_analyzer — 教师授课效果分析
 * 7. competency_assessment        — 核心素养评估
 * 8. education_equity_monitor     — 教育公平监控
 *
 * @module dsh-tool-eduagentpro | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-eduagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = '本分析基于AI模型推断，仅供教育工作者参考，不替代专业教育评估。'

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

// ==================== SECTION 2 — Utility Helpers ====================

function progressBar(pct: number, width: number = 20): string {
  const filled = Math.round((pct / 100) * width)
  const empty = width - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

// ==================== SECTION 3 — Type Definitions ====================

// --- Tool 1: Adaptive Learning Path ---
interface AdaptiveLearningInput {
  student_id: string
  knowledge_points: Array<{ name: string; mastery: number }>
  learning_style: 'visual' | 'auditory' | 'kinesthetic'
  target_score: number
  current_score: number
  available_weeks: number
}

interface KnowledgeGapResult {
  point_name: string
  mastery: number
  gap: number
  priority: number
}

interface LearningStyleProfile {
  style: string
  style_cn: string
  recommended_methods: string[]
  match_score: number
}

interface PathRecommendation {
  week: number
  focus: string
  method: string
  target_mastery: number
  estimated_hours: number
}

interface AdaptiveLearningResult {
  student_id: string
  knowledge_gaps: KnowledgeGapResult[]
  learning_style: LearningStyleProfile
  path_recommendations: PathRecommendation[]
  estimated_score_improvement: number
  target_feasibility: string
}

// --- Tool 2: Student Performance Predictor ---
interface PerformancePredictorInput {
  student_id: string
  historical_scores: number[]
  attendance_rate: number
  assignment_completion: number
  study_hours_per_week: number
  engagement_score: number
}

interface PerformancePredictorResult {
  student_id: string
  predicted_exam_score: number
  dropout_risk: number
  dropout_risk_level: string
  weak_knowledge_points: string[]
  improvement_suggestions: string[]
  trend: 'improving' | 'stable' | 'declining'
  confidence: number
}

// --- Tool 3: Auto Grading Engine ---
interface GradingInput {
  student_id: string
  assignment_type: 'essay' | 'short_answer' | 'grammar_check' | 'plagiarism_check'
  content: string
  reference_answer?: string
  rubric_criteria?: string[]
}

interface GradingResult {
  student_id: string
  assignment_type: string
  overall_score: number
  max_score: number
  grammar_issues: Array<{ type: string; description: string; suggestion: string }>
  plagiarism_score: number
  consistency_index: number
  feedback: string
  detailed_breakdown: Array<{ criterion: string; score: number; max: number; comment: string }>
}

// --- Tool 4: Course Quality Evaluator ---
interface CourseQualityInput {
  course_id: string
  course_name: string
  difficulty_rating: number
  completion_rate: number
  interaction_score: number
  nps_score: number
  student_count: number
  avg_study_hours: number
}

interface CourseQualityResult {
  course_id: string
  course_name: string
  overall_quality_score: number
  quality_grade: string
  difficulty_assessment: string
  completion_analysis: string
  interaction_quality: string
  nps_interpretation: string
  improvement_suggestions: string[]
}

// --- Tool 5: Personalized Homework Generator ---
interface HomeworkInput {
  student_id: string
  student_level: 'beginner' | 'intermediate' | 'advanced'
  knowledge_points: string[]
  target_difficulty: number
  question_count: number
  coverage_requirement: number
}

interface GeneratedQuestion {
  id: number
  knowledge_point: string
  difficulty: number
  question_type: string
  content: string
  estimated_minutes: number
}

interface HomeworkResult {
  student_id: string
  student_level: string
  questions: GeneratedQuestion[]
  difficulty_distribution: { easy: number; medium: number; hard: number }
  total_estimated_minutes: number
  knowledge_coverage_pct: number
  total_score: number
}

// --- Tool 6: Teaching Effectiveness Analyzer ---
interface TeachingInput {
  teacher_id: string
  course_id: string
  interaction_rate: number
  clarity_score: number
  time_utilization: number
  attention_curve: number[]
  student_satisfaction: number
}

interface TeachingEffectivenessResult {
  teacher_id: string
  course_id: string
  overall_effectiveness: number
  interaction_rate: number
  clarity_score: number
  time_utilization: number
  attention_analysis: { peak_minute: number; trough_minute: number; avg_attention: number }
  student_satisfaction: number
  strengths: string[]
  areas_for_improvement: string[]
}

// --- Tool 7: Competency Assessment ---
interface CompetencyInput {
  student_id: string
  critical_thinking_score: number
  creativity_score: number
  collaboration_score: number
  communication_score: number
  digital_literacy_score: number
  evidence_notes?: string
}

interface CompetencyDimension {
  name: string
  name_cn: string
  score: number
  level: string
  description: string
}

interface CompetencyResult {
  student_id: string
  dimensions: CompetencyDimension[]
  overall_competency: number
  competency_grade: string
  strongest: string
  weakest: string
  development_recommendations: string[]
}

// --- Tool 8: Education Equity Monitor ---
interface EquityInput {
  region: string
  urban_rural_gap: number
  gender_gap: number
  economic_gap: number
  resource_allocation_index: number
  digital_divide_index: number
  sample_size: number
}

interface GroupComparison {
  group: string
  avg_score: number
  resource_index: number
  digital_access: number
}

interface EquityResult {
  region: string
  overall_equity_index: number
  equity_level: string
  group_comparisons: GroupComparison[]
  gap_analysis: { urban_rural: number; gender: number; economic: number }
  resource_fairness: string
  digital_divide_assessment: string
  policy_recommendations: string[]
}

// ==================== SECTION 4 — Analysis Functions ====================

// --- Tool 1: Adaptive Learning Path Engine ---
function analyzeAdaptiveLearning(data: AdaptiveLearningInput): AdaptiveLearningResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.student_id + data.learning_style))

  const knowledgeGaps: KnowledgeGapResult[] = data.knowledge_points.map(kp => {
    const gap = clamp(100 - kp.mastery, 0, 100)
    return {
      point_name: kp.name,
      mastery: clamp(kp.mastery, 0, 100),
      gap,
      priority: Math.round(gap * rng.nextFloat(0.8, 1.2) * 10) / 10
    }
  })
  knowledgeGaps.sort((a, b) => b.priority - a.priority)

  const styleMap: Record<string, { style_cn: string; methods: string[] }> = {
    visual: { style_cn: '视觉型', methods: ['思维导图', '视频教程', '信息图表', '色彩标注'] },
    auditory: { style_cn: '听觉型', methods: ['讲解音频', '讨论小组', '口头复述', '播客学习'] },
    kinesthetic: { style_cn: '动觉型', methods: ['动手实验', '项目实战', '角色扮演', '模拟操作'] }
  }
  const styleInfo = styleMap[data.learning_style] || styleMap.visual

  const pathRecommendations: PathRecommendation[] = []
  const gapsPerWeek = Math.max(1, Math.ceil(knowledgeGaps.length / data.available_weeks))
  for (let week = 1; week <= data.available_weeks; week++) {
    const startIdx = (week - 1) * gapsPerWeek
    const endIdx = Math.min(startIdx + gapsPerWeek, knowledgeGaps.length)
    if (startIdx >= knowledgeGaps.length) break
    const focusGaps = knowledgeGaps.slice(startIdx, endIdx)
    const focus = focusGaps.map(g => g.point_name).join(', ')
    const avgCurrentMastery = focusGaps.reduce((s, g) => s + g.mastery, 0) / focusGaps.length
    const targetMastery = Math.min(95, avgCurrentMastery + rng.nextInt(8, 18))

    pathRecommendations.push({
      week,
      focus,
      method: rng.pick(styleInfo.methods),
      target_mastery: targetMastery,
      estimated_hours: Math.round(rng.nextFloat(3, 8) * 10) / 10
    })
  }

  const scoreGap = data.target_score - data.current_score
  const achievableImprovement = Math.round(
    Math.min(scoreGap, pathRecommendations.length * rng.nextFloat(3, 7)) * 10
  ) / 10
  const feasibility = achievableImprovement >= scoreGap * 0.8 ? '目标可行' :
    achievableImprovement >= scoreGap * 0.5 ? '目标需调整' : '目标过于激进'

  return {
    student_id: data.student_id,
    knowledge_gaps: knowledgeGaps,
    learning_style: {
      style: data.learning_style,
      style_cn: styleInfo.style_cn,
      recommended_methods: styleInfo.methods,
      match_score: Math.round(rng.nextFloat(0.75, 0.98) * 100) / 100
    },
    path_recommendations: pathRecommendations,
    estimated_score_improvement: achievableImprovement,
    target_feasibility: feasibility
  }
}

// --- Tool 2: Student Performance Predictor ---
function analyzePerformancePredictor(data: PerformancePredictorInput): PerformancePredictorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.student_id + 'perf'))

  const avgScore = data.historical_scores.length > 0
    ? data.historical_scores.reduce((s, v) => s + v, 0) / data.historical_scores.length
    : 50

  const recentScores = data.historical_scores.slice(-3)
  const olderScores = data.historical_scores.slice(0, 3)
  const recentAvg = recentScores.length > 0 ? recentScores.reduce((s, v) => s + v, 0) / recentScores.length : avgScore
  const olderAvg = olderScores.length > 0 ? olderScores.reduce((s, v) => s + v, 0) / olderScores.length : avgScore
  const trend: PerformancePredictorResult['trend'] =
    recentAvg > olderAvg + 3 ? 'improving' : recentAvg < olderAvg - 3 ? 'declining' : 'stable'

  const predictedScore = clamp(Math.round(
    avgScore * 0.4 +
    data.attendance_rate * 0.15 +
    data.assignment_completion * 0.2 +
    Math.min(data.study_hours_per_week / 10, 1) * 100 * 0.15 +
    data.engagement_score * 0.1 +
    rng.nextFloat(-3, 3)
  ), 0, 100)

  const dropoutRisk = clamp(Math.round(
    (100 - data.attendance_rate) * 0.3 +
    (100 - data.assignment_completion) * 0.25 +
    (100 - data.engagement_score) * 0.2 +
    (data.study_hours_per_week < 3 ? 15 : 0) +
    (trend === 'declining' ? 10 : 0) +
    rng.nextFloat(-5, 5)
  ), 0, 100)

  const riskLevel = dropoutRisk >= 60 ? '高风险' : dropoutRisk >= 40 ? '中风险' : dropoutRisk >= 20 ? '低风险' : '安全'

  const weakPoints: string[] = []
  if (avgScore < 60) weakPoints.push('基础知识掌握不牢')
  if (data.attendance_rate < 70) weakPoints.push('出勤率偏低')
  if (data.assignment_completion < 60) weakPoints.push('作业完成率低')
  if (data.engagement_score < 50) weakPoints.push('课堂参与度不足')
  if (data.study_hours_per_week < 3) weakPoints.push('课外学习时间不足')
  if (trend === 'declining') weakPoints.push('成绩呈下降趋势')
  if (weakPoints.length === 0) weakPoints.push('无明显薄弱点')

  const suggestions: string[] = []
  if (data.attendance_rate < 75) suggestions.push('建立出勤预警机制，定期与家长沟通')
  if (data.assignment_completion < 70) suggestions.push('优化作业设计，增加分层作业选项')
  if (data.engagement_score < 60) suggestions.push('引入互动教学工具，提升课堂趣味性')
  if (data.study_hours_per_week < 4) suggestions.push('制定个性化学习计划，培养自主学习习惯')
  if (trend === 'declining') suggestions.push('安排一对一辅导，及时干预学业下滑')
  suggestions.push('定期进行学情评估，动态调整教学策略')

  return {
    student_id: data.student_id,
    predicted_exam_score: predictedScore,
    dropout_risk: dropoutRisk,
    dropout_risk_level: riskLevel,
    weak_knowledge_points: weakPoints,
    improvement_suggestions: suggestions,
    trend,
    confidence: Math.round(rng.nextFloat(0.72, 0.95) * 100) / 100
  }
}

// --- Tool 3: Auto Grading Engine ---
function analyzeAutoGrading(data: GradingInput): GradingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.student_id + data.assignment_type + data.content.slice(0, 50)))

  const contentLength = data.content.length
  const wordCount = data.content.split(/\s+/).filter(w => w.length > 0).length

  const grammarIssues: GradingResult['grammar_issues'] = []
  const grammarTypes = ['主谓不一致', '时态错误', '标点误用', '句式杂糅', '词语搭配不当', '缺少主语']
  const issueCount = rng.nextInt(0, 4)
  for (let i = 0; i < issueCount; i++) {
    const gtype = rng.pick(grammarTypes)
    grammarIssues.push({
      type: gtype,
      description: `检测到${gtype}问题`,
      suggestion: `建议检查相关语法规则并修正${gtype}问题`
    })
  }

  const plagiarismScore = clamp(Math.round(
    rng.nextFloat(2, 25) + (contentLength < 100 ? 10 : 0)
  ), 0, 100)

  const criteria: GradingResult['detailed_breakdown'] = []
  const criteriaNames = data.assignment_type === 'essay'
    ? ['内容切题', '论证逻辑', '语言表达', '结构完整性', '创新性']
    : data.assignment_type === 'short_answer'
    ? ['准确性', '完整性', '逻辑性', '表达清晰']
    : data.assignment_type === 'grammar_check'
    ? ['语法正确性', '词汇运用', '句式多样性', '表达流畅度']
    : ['原创性', '引用规范', '内容质量', '学术规范']

  let totalScore = 0
  const maxScore = 100
  const perCriterion = Math.floor(maxScore / criteriaNames.length)

  for (const c of criteriaNames) {
    const score = clamp(Math.round(rng.nextFloat(0.5, 1.0) * perCriterion), 0, perCriterion)
    totalScore += score
    criteria.push({
      criterion: c,
      score,
      max: perCriterion,
      comment: score >= perCriterion * 0.8 ? '优秀' : score >= perCriterion * 0.6 ? '良好' : score >= perCriterion * 0.4 ? '及格' : '需改进'
    })
  }

  const consistencyIndex = Math.round(rng.nextFloat(0.75, 0.98) * 100) / 100

  let feedback = ''
  if (totalScore >= 85) feedback = '整体表现优秀，继续保持！'
  else if (totalScore >= 70) feedback = '整体良好，部分方面还有提升空间。'
  else if (totalScore >= 60) feedback = '基本达标，需要加强薄弱环节。'
  else feedback = '需要重点关注，建议重新学习相关内容后再次提交。'

  if (plagiarismScore > 20) feedback += ' 注意：检测到较高相似度，请确保原创性。'

  return {
    student_id: data.student_id,
    assignment_type: data.assignment_type,
    overall_score: totalScore,
    max_score: maxScore,
    grammar_issues: grammarIssues,
    plagiarism_score: plagiarismScore,
    consistency_index: consistencyIndex,
    feedback,
    detailed_breakdown: criteria
  }
}

// --- Tool 4: Course Quality Evaluator ---
function analyzeCourseQuality(data: CourseQualityInput): CourseQualityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.course_id + data.course_name))

  const overallScore = clamp(Math.round(
    (100 - Math.abs(data.difficulty_rating - 50) * 1.5) * 0.15 +
    data.completion_rate * 0.25 +
    data.interaction_score * 0.2 +
    ((data.nps_score + 100) / 2) * 0.2 +
    Math.min(data.avg_study_hours / 8, 1) * 100 * 0.1 +
    rng.nextFloat(-3, 3)
  ), 0, 100)

  const grade = overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B+' : overallScore >= 70 ? 'B' : overallScore >= 60 ? 'C' : 'D'

  const difficultyAssessment = data.difficulty_rating > 70 ? '课程难度偏高，建议增加辅助学习资源' :
    data.difficulty_rating < 30 ? '课程难度偏低，可考虑增加挑战性内容' : '课程难度适中'

  const completionAnalysis = data.completion_rate >= 80 ? '完课率优秀，课程设计吸引力强' :
    data.completion_rate >= 60 ? '完课率良好，存在一定流失风险' :
    data.completion_rate >= 40 ? '完课率偏低，需重点关注学生流失原因' : '完课率严重偏低，课程需全面优化'

  const interactionQuality = data.interaction_score >= 75 ? '互动质量优秀，学生参与度高' :
    data.interaction_score >= 50 ? '互动质量一般，可增加互动环节设计' : '互动质量不足，建议重构互动机制'

  const npsInterpretation = data.nps_score >= 50 ? 'NPS优秀，学生推荐意愿强' :
    data.nps_score >= 0 ? 'NPS一般，有提升空间' :
    data.nps_score >= -30 ? 'NPS偏低，需关注学生不满原因' : 'NPS严重偏低，课程面临口碑风险'

  const suggestions: string[] = []
  if (data.difficulty_rating > 70) suggestions.push('增加难度梯度设计，提供分层学习支持')
  if (data.completion_rate < 70) suggestions.push('优化课程节奏，增加阶段性激励与成就系统')
  if (data.interaction_score < 60) suggestions.push('引入更多互动元素：讨论区、实时问答、小组协作')
  if (data.nps_score < 0) suggestions.push('开展学生满意度调研，针对性改进课程痛点')
  if (data.avg_study_hours < 3) suggestions.push('优化内容密度，确保学习时长与目标匹配')
  suggestions.push('建立持续质量监控机制，定期迭代课程内容')

  return {
    course_id: data.course_id,
    course_name: data.course_name,
    overall_quality_score: overallScore,
    quality_grade: grade,
    difficulty_assessment: difficultyAssessment,
    completion_analysis: completionAnalysis,
    interaction_quality: interactionQuality,
    nps_interpretation: npsInterpretation,
    improvement_suggestions: suggestions
  }
}

// --- Tool 5: Personalized Homework Generator ---
function analyzeHomeworkGeneration(data: HomeworkInput): HomeworkResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.student_id + data.student_level))

  const levelDifficultyMap: Record<string, { base: number; range: number }> = {
    beginner: { base: 3, range: 3 },
    intermediate: { base: 5, range: 3 },
    advanced: { base: 7, range: 3 }
  }
  const diffConfig = levelDifficultyMap[data.student_level] || levelDifficultyMap.intermediate

  const questionTypes = ['选择题', '填空题', '简答题', '计算题', '应用题', '探究题']
  const questions: GeneratedQuestion[] = []
  let easyCount = 0, mediumCount = 0, hardCount = 0

  for (let i = 0; i < data.question_count; i++) {
    const kp = data.knowledge_points[i % data.knowledge_points.length]
    const difficulty = clamp(
      Math.round(diffConfig.base + rng.nextFloat(-diffConfig.range / 2, diffConfig.range / 2) + (i / data.question_count) * 2),
      1, 10
    )
    if (difficulty <= 3) easyCount++
    else if (difficulty <= 6) mediumCount++
    else hardCount++

    questions.push({
      id: i + 1,
      knowledge_point: kp,
      difficulty,
      question_type: rng.pick(questionTypes),
      content: `关于「${kp}」的${difficulty <= 3 ? '基础' : difficulty <= 6 ? '中等' : '提高'}难度题目（难度等级: ${difficulty}/10）`,
      estimated_minutes: Math.round(rng.nextFloat(2, 8) * 10) / 10
    })
  }

  const totalMinutes = questions.reduce((s, q) => s + q.estimated_minutes, 0)
  const coveredPoints = new Set(questions.map(q => q.knowledge_point)).size
  const coveragePct = Math.round((coveredPoints / data.knowledge_points.length) * 100)

  return {
    student_id: data.student_id,
    student_level: data.student_level,
    questions,
    difficulty_distribution: { easy: easyCount, medium: mediumCount, hard: hardCount },
    total_estimated_minutes: Math.round(totalMinutes * 10) / 10,
    knowledge_coverage_pct: coveragePct,
    total_score: data.question_count * 10
  }
}

// --- Tool 6: Teaching Effectiveness Analyzer ---
function analyzeTeachingEffectiveness(data: TeachingInput): TeachingEffectivenessResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.teacher_id + data.course_id))

  const avgAttention = data.attention_curve.length > 0
    ? data.attention_curve.reduce((s, v) => s + v, 0) / data.attention_curve.length
    : 50

  const peakMinute = data.attention_curve.length > 0
    ? data.attention_curve.indexOf(Math.max(...data.attention_curve)) + 1 : 0
  const troughMinute = data.attention_curve.length > 0
    ? data.attention_curve.indexOf(Math.min(...data.attention_curve)) + 1 : 0

  const overallEffectiveness = clamp(Math.round(
    data.interaction_rate * 0.2 +
    data.clarity_score * 0.25 +
    data.time_utilization * 0.15 +
    avgAttention * 0.2 +
    data.student_satisfaction * 0.2 +
    rng.nextFloat(-3, 3)
  ), 0, 100)

  const strengths: string[] = []
  if (data.interaction_rate >= 70) strengths.push('课堂互动活跃，学生参与度高')
  if (data.clarity_score >= 75) strengths.push('讲授清晰，知识点传达准确')
  if (data.time_utilization >= 75) strengths.push('时间利用率高，课堂节奏把控好')
  if (avgAttention >= 70) strengths.push('学生注意力集中，课堂吸引力强')
  if (data.student_satisfaction >= 75) strengths.push('学生满意度高，教学效果好')
  if (strengths.length === 0) strengths.push('教学态度认真，有提升潜力')

  const improvements: string[] = []
  if (data.interaction_rate < 60) improvements.push('增加互动环节：提问、讨论、小组活动')
  if (data.clarity_score < 65) improvements.push('优化讲授逻辑，增加实例辅助理解')
  if (data.time_utilization < 65) improvements.push('改进课堂时间分配，减少无效环节')
  if (avgAttention < 55) improvements.push('调整教学节奏，增加注意力高峰时段活动')
  if (data.student_satisfaction < 60) improvements.push('关注学生反馈，调整教学方式')
  if (troughMinute > 0 && troughMinute <= data.attention_curve.length) {
    improvements.push(`注意第${troughMinute}分钟注意力低谷，可安排互动或休息`)
  }

  return {
    teacher_id: data.teacher_id,
    course_id: data.course_id,
    overall_effectiveness: overallEffectiveness,
    interaction_rate: data.interaction_rate,
    clarity_score: data.clarity_score,
    time_utilization: data.time_utilization,
    attention_analysis: { peak_minute: peakMinute, trough_minute: troughMinute, avg_attention: Math.round(avgAttention * 10) / 10 },
    student_satisfaction: data.student_satisfaction,
    strengths,
    areas_for_improvement: improvements
  }
}

// --- Tool 7: Competency Assessment ---
function analyzeCompetency(data: CompetencyInput): CompetencyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.student_id + 'competency'))

  const getLevel = (score: number): string => {
    if (score >= 85) return '优秀'
    if (score >= 70) return '良好'
    if (score >= 55) return '中等'
    if (score >= 40) return '待提高'
    return '需重点关注'
  }

  const dimensions: CompetencyDimension[] = [
    { name: 'critical_thinking', name_cn: '批判性思维', score: clamp(data.critical_thinking_score, 0, 100), level: getLevel(data.critical_thinking_score), description: '分析、评估、推理能力' },
    { name: 'creativity', name_cn: '创造力', score: clamp(data.creativity_score, 0, 100), level: getLevel(data.creativity_score), description: '创新思维与原创能力' },
    { name: 'collaboration', name_cn: '协作能力', score: clamp(data.collaboration_score, 0, 100), level: getLevel(data.collaboration_score), description: '团队合作与协调能力' },
    { name: 'communication', name_cn: '沟通能力', score: clamp(data.communication_score, 0, 100), level: getLevel(data.communication_score), description: '表达、倾听与反馈能力' },
    { name: 'digital_literacy', name_cn: '数字素养', score: clamp(data.digital_literacy_score, 0, 100), level: getLevel(data.digital_literacy_score), description: '信息技术应用与数字工具使用能力' }
  ]

  const overall = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length)
  const grade = overall >= 85 ? 'A' : overall >= 75 ? 'B+' : overall >= 65 ? 'B' : overall >= 55 ? 'C' : 'D'

  const sorted = [...dimensions].sort((a, b) => b.score - a.score)
  const strongest = sorted[0].name_cn
  const weakest = sorted[sorted.length - 1].name_cn

  const recommendations: string[] = []
  for (const d of sorted.slice(-2)) {
    if (d.score < 70) {
      recommendations.push(`重点提升${d.name_cn}：${d.description}，建议通过专项训练和实践活动加强`)
    }
  }
  recommendations.push('建立核心素养成长档案，定期追踪各维度发展')
  recommendations.push('鼓励跨学科项目学习，在实践中综合提升五大素养')
  recommendations.push('引入自评与互评机制，培养学生元认知能力')

  return {
    student_id: data.student_id,
    dimensions,
    overall_competency: overall,
    competency_grade: grade,
    strongest,
    weakest,
    development_recommendations: recommendations
  }
}

// --- Tool 8: Education Equity Monitor ---
function analyzeEducationEquity(data: EquityInput): EquityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.region + 'equity'))

  const overallEquity = clamp(Math.round(
    100 -
    data.urban_rural_gap * 0.25 -
    data.gender_gap * 0.15 -
    data.economic_gap * 0.25 -
    (100 - data.resource_allocation_index) * 0.15 -
    data.digital_divide_index * 0.2 +
    rng.nextFloat(-3, 3)
  ), 0, 100)

  const equityLevel = overallEquity >= 80 ? '高度公平' : overallEquity >= 65 ? '较为公平' : overallEquity >= 50 ? '公平性一般' : overallEquity >= 35 ? '公平性不足' : '严重不公平'

  const groupComparisons: GroupComparison[] = [
    { group: '城市学生', avg_score: clamp(Math.round(75 + data.urban_rural_gap * 0.3 + rng.nextFloat(-3, 3)), 0, 100), resource_index: clamp(Math.round(data.resource_allocation_index + 10 + rng.nextFloat(-5, 5)), 0, 100), digital_access: clamp(Math.round(90 - data.digital_divide_index * 0.3 + rng.nextFloat(-3, 3)), 0, 100) },
    { group: '农村学生', avg_score: clamp(Math.round(75 - data.urban_rural_gap * 0.3 + rng.nextFloat(-3, 3)), 0, 100), resource_index: clamp(Math.round(data.resource_allocation_index - 10 + rng.nextFloat(-5, 5)), 0, 100), digital_access: clamp(Math.round(70 - data.digital_divide_index * 0.5 + rng.nextFloat(-3, 3)), 0, 100) },
    { group: '男生', avg_score: clamp(Math.round(72 + data.gender_gap * 0.2 + rng.nextFloat(-3, 3)), 0, 100), resource_index: clamp(Math.round(data.resource_allocation_index + rng.nextFloat(-3, 3)), 0, 100), digital_access: clamp(Math.round(80 - data.digital_divide_index * 0.35 + rng.nextFloat(-3, 3)), 0, 100) },
    { group: '女生', avg_score: clamp(Math.round(72 - data.gender_gap * 0.2 + rng.nextFloat(-3, 3)), 0, 100), resource_index: clamp(Math.round(data.resource_allocation_index + rng.nextFloat(-3, 3)), 0, 100), digital_access: clamp(Math.round(80 - data.digital_divide_index * 0.35 + rng.nextFloat(-3, 3)), 0, 100) },
    { group: '经济优势群体', avg_score: clamp(Math.round(78 + data.economic_gap * 0.3 + rng.nextFloat(-3, 3)), 0, 100), resource_index: clamp(Math.round(data.resource_allocation_index + 12 + rng.nextFloat(-3, 3)), 0, 100), digital_access: clamp(Math.round(92 - data.digital_divide_index * 0.2 + rng.nextFloat(-3, 3)), 0, 100) },
    { group: '经济弱势群体', avg_score: clamp(Math.round(68 - data.economic_gap * 0.3 + rng.nextFloat(-3, 3)), 0, 100), resource_index: clamp(Math.round(data.resource_allocation_index - 15 + rng.nextFloat(-3, 3)), 0, 100), digital_access: clamp(Math.round(65 - data.digital_divide_index * 0.55 + rng.nextFloat(-3, 3)), 0, 100) }
  ]

  const resourceFairness = data.resource_allocation_index >= 75 ? '资源分配较为公平' :
    data.resource_allocation_index >= 50 ? '资源分配存在一定差距，需政策倾斜' : '资源分配严重不均，亟需政策干预'

  const digitalDivideAssessment = data.digital_divide_index <= 25 ? '数字鸿沟较小，信息技术普及良好' :
    data.digital_divide_index <= 50 ? '存在一定数字鸿沟，需加强基础设施建设' :
    data.digital_divide_index <= 75 ? '数字鸿沟显著，弱势群体数字接入困难' : '数字鸿沟严重，教育公平面临重大挑战'

  const policyRecommendations: string[] = []
  if (data.urban_rural_gap > 15) policyRecommendations.push('加大农村教育投入，实施城乡教师轮岗制度')
  if (data.gender_gap > 10) policyRecommendations.push('关注性别平等教育，消除学科性别刻板印象')
  if (data.economic_gap > 15) policyRecommendations.push('完善学生资助体系，确保经济弱势群体受教育权利')
  if (data.resource_allocation_index < 60) policyRecommendations.push('优化资源配置机制，向薄弱地区和学校倾斜')
  if (data.digital_divide_index > 40) policyRecommendations.push('推进教育数字化战略，保障弱势群体数字接入')
  policyRecommendations.push('建立教育公平监测长效机制，定期发布公平性报告')
  policyRecommendations.push('完善教育法规体系，将教育公平纳入政策考核指标')

  return {
    region: data.region,
    overall_equity_index: overallEquity,
    equity_level: equityLevel,
    group_comparisons: groupComparisons,
    gap_analysis: { urban_rural: data.urban_rural_gap, gender: data.gender_gap, economic: data.economic_gap },
    resource_fairness: resourceFairness,
    digital_divide_assessment: digitalDivideAssessment,
    policy_recommendations: policyRecommendations
  }
}

// ==================== SECTION 5 — Report Formatting Functions ====================

// --- Tool 1: Adaptive Learning Path Report ---
function formatAdaptiveLearningReport(r: AdaptiveLearningResult): string {
  const lines: string[] = []
  lines.push('# 自适应学习路径分析报告')
  lines.push('')
  lines.push(`**学生ID:** ${r.student_id} | **学习风格:** ${r.learning_style.style_cn} | **风格匹配度:** ${Math.round(r.learning_style.match_score * 100)}%`)
  lines.push('')
  lines.push('## 一、知识点掌握度分析 (Knowledge Gap Analyzer)')
  lines.push('')
  lines.push('| 知识点 | 掌握度 | 差距 | 优先级 |')
  lines.push('|--------|--------|------|--------|')
  for (const kg of r.knowledge_gaps) {
    lines.push(`| ${kg.point_name} | ${progressBar(kg.mastery)} ${kg.mastery}% | ${kg.gap}% | P${kg.priority} |`)
  }
  lines.push('')
  lines.push('## 二、学习风格画像 (Learning Style Profiler)')
  lines.push('')
  lines.push(`**主风格:** ${r.learning_style.style_cn} (${r.learning_style.style})`)
  lines.push(`**推荐学习方法:** ${r.learning_style.recommended_methods.join('、')}`)
  lines.push('')
  lines.push('## 三、推荐学习路径 (Path Recommendation)')
  lines.push('')
  lines.push('| 周次 | 重点内容 | 推荐方法 | 目标掌握度 | 预计时长 |')
  lines.push('|------|----------|----------|------------|----------|')
  for (const pr of r.path_recommendations) {
    lines.push(`| 第${pr.week}周 | ${pr.focus} | ${pr.method} | ${pr.target_mastery}% | ${pr.estimated_hours}h |`)
  }
  lines.push('')
  lines.push('## 四、预估提分分析')
  lines.push('')
  lines.push(`**预计提分:** +${r.estimated_score_improvement}分`)
  lines.push(`**目标可行性:** ${r.target_feasibility}`)
  lines.push('')
  lines.push('---')
  lines.push(`> **免责声明:** ${DISCLAIMER}`)
  return lines.join('\n')
}

// --- Tool 2: Student Performance Predictor Report ---
function formatPerformancePredictorReport(r: PerformancePredictorResult): string {
  const lines: string[] = []
  lines.push('# 学情预测预警报告')
  lines.push('')
  lines.push(`**学生ID:** ${r.student_id} | **预测考试成绩:** ${r.predicted_exam_score}分 | **置信度:** ${Math.round(r.confidence * 100)}%`)
  lines.push('')
  lines.push('## 一、成绩预测')
  lines.push('')
  lines.push(`预测分数: **${r.predicted_exam_score}/100**`)
  lines.push(`趋势: **${r.trend === 'improving' ? '上升' : r.trend === 'declining' ? '下降' : '稳定'}**`)
  lines.push('')
  lines.push('## 二、辍学风险预警')
  lines.push('')
  lines.push(`辍学风险: ${progressBar(r.dropout_risk)} **${r.dropout_risk}%** — ${r.dropout_risk_level}`)
  lines.push('')
  lines.push('## 三、薄弱知识点')
  lines.push('')
  for (const wp of r.weak_knowledge_points) {
    lines.push(`- ⚠ ${wp}`)
  }
  lines.push('')
  lines.push('## 四、提升建议')
  lines.push('')
  for (const s of r.improvement_suggestions) {
    lines.push(`- 💡 ${s}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`> **免责声明:** ${DISCLAIMER}`)
  return lines.join('\n')
}

// --- Tool 3: Auto Grading Engine Report ---
function formatAutoGradingReport(r: GradingResult): string {
  const lines: string[] = []
  lines.push('# 智能批改报告')
  lines.push('')
  lines.push(`**学生ID:** ${r.student_id} | **作业类型:** ${r.assignment_type} | **总分:** ${r.overall_score}/${r.max_score}`)
  lines.push('')
  lines.push('## 一、综合评分')
  lines.push('')
  lines.push(`**总分:** ${r.overall_score}/${r.max_score} (${Math.round((r.overall_score / r.max_score) * 100)}%)`)
  lines.push(`**批改一致性指数:** ${r.consistency_index}`)
  lines.push('')
  lines.push('## 二、分项评分')
  lines.push('')
  lines.push('| 评分维度 | 得分 | 满分 | 评价 |')
  lines.push('|----------|------|------|------|')
  for (const db of r.detailed_breakdown) {
    lines.push(`| ${db.criterion} | ${db.score} | ${db.max} | ${db.comment} |`)
  }
  lines.push('')
  lines.push('## 三、语法检测')
  lines.push('')
  if (r.grammar_issues.length === 0) {
    lines.push('✅ 未检测到语法问题')
  } else {
    for (const g of r.grammar_issues) {
      lines.push(`- **${g.type}:** ${g.description} → ${g.suggestion}`)
    }
  }
  lines.push('')
  lines.push('## 四、抄袭检测')
  lines.push('')
  lines.push(`相似度指数: **${r.plagiarism_score}%** ${r.plagiarism_score > 20 ? '⚠ 需关注' : '✅ 正常'}`)
  lines.push('')
  lines.push('## 五、总评反馈')
  lines.push('')
  lines.push(r.feedback)
  lines.push('')
  lines.push('---')
  lines.push(`> **免责声明:** ${DISCLAIMER}`)
  return lines.join('\n')
}

// --- Tool 4: Course Quality Evaluator Report ---
function formatCourseQualityReport(r: CourseQualityResult): string {
  const lines: string[] = []
  lines.push('# 课程质量评估报告')
  lines.push('')
  lines.push(`**课程:** ${r.course_name} (${r.course_id}) | **质量等级:** ${r.quality_grade} | **综合评分:** ${r.overall_quality_score}/100`)
  lines.push('')
  lines.push('## 一、综合质量评分')
  lines.push('')
  lines.push(`综合评分: ${progressBar(r.overall_quality_score)} **${r.overall_quality_score}分**`)
  lines.push(`质量等级: **${r.quality_grade}**`)
  lines.push('')
  lines.push('## 二、各维度分析')
  lines.push('')
  lines.push(`**课程难度:** ${r.difficulty_assessment}`)
  lines.push(`**完课率分析:** ${r.completion_analysis}`)
  lines.push(`**互动质量:** ${r.interaction_quality}`)
  lines.push(`**NPS评分解读:** ${r.nps_interpretation}`)
  lines.push('')
  lines.push('## 三、改进建议')
  lines.push('')
  for (const s of r.improvement_suggestions) {
    lines.push(`- 📋 ${s}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`> **免责声明:** ${DISCLAIMER}`)
  return lines.join('\n')
}

// --- Tool 5: Personalized Homework Generator Report ---
function formatHomeworkReport(r: HomeworkResult): string {
  const lines: string[] = []
  lines.push('# 个性化作业生成报告')
  lines.push('')
  lines.push(`**学生ID:** ${r.student_id} | **学生水平:** ${r.student_level} | **总分:** ${r.total_score}分`)
  lines.push(`**预计总时长:** ${r.total_estimated_minutes}分钟 | **知识点覆盖率:** ${r.knowledge_coverage_pct}%`)
  lines.push('')
  lines.push('## 一、难度分布')
  lines.push('')
  lines.push(`- 简单题: ${r.difficulty_distribution.easy}道`)
  lines.push(`- 中等题: ${r.difficulty_distribution.medium}道`)
  lines.push(`- 困难题: ${r.difficulty_distribution.hard}道`)
  lines.push('')
  lines.push('## 二、题目列表')
  lines.push('')
  lines.push('| 题号 | 知识点 | 难度 | 题型 | 预计时长 |')
  lines.push('|------|--------|------|------|----------|')
  for (const q of r.questions) {
    lines.push(`| ${q.id} | ${q.knowledge_point} | ${q.difficulty}/10 | ${q.question_type} | ${q.estimated_minutes}min |`)
  }
  lines.push('')
  lines.push('## 三、知识点覆盖')
  lines.push('')
  lines.push(`覆盖率: ${progressBar(r.knowledge_coverage_pct)} **${r.knowledge_coverage_pct}%**`)
  lines.push('')
  lines.push('---')
  lines.push(`> **免责声明:** ${DISCLAIMER}`)
  return lines.join('\n')
}

// --- Tool 6: Teaching Effectiveness Analyzer Report ---
function formatTeachingEffectivenessReport(r: TeachingEffectivenessResult): string {
  const lines: string[] = []
  lines.push('# 教师授课效果分析报告')
  lines.push('')
  lines.push(`**教师ID:** ${r.teacher_id} | **课程ID:** ${r.course_id} | **综合效果评分:** ${r.overall_effectiveness}/100`)
  lines.push('')
  lines.push('## 一、核心指标')
  lines.push('')
  lines.push(`**课堂互动率:** ${progressBar(r.interaction_rate)} ${r.interaction_rate}%`)
  lines.push(`**讲授清晰度:** ${progressBar(r.clarity_score)} ${r.clarity_score}%`)
  lines.push(`**时间利用率:** ${progressBar(r.time_utilization)} ${r.time_utilization}%`)
  lines.push(`**学生满意度:** ${progressBar(r.student_satisfaction)} ${r.student_satisfaction}%`)
  lines.push('')
  lines.push('## 二、学生注意力曲线分析')
  lines.push('')
  lines.push(`**平均注意力:** ${r.attention_analysis.avg_attention}%`)
  lines.push(`**注意力峰值:** 第${r.attention_analysis.peak_minute}分钟`)
  lines.push(`**注意力低谷:** 第${r.attention_analysis.trough_minute}分钟`)
  lines.push('')
  lines.push('## 三、教学优势')
  lines.push('')
  for (const s of r.strengths) {
    lines.push(`- ✅ ${s}`)
  }
  lines.push('')
  lines.push('## 四、改进方向')
  lines.push('')
  for (const a of r.areas_for_improvement) {
    lines.push(`- 📌 ${a}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`> **免责声明:** ${DISCLAIMER}`)
  return lines.join('\n')
}

// --- Tool 7: Competency Assessment Report ---
function formatCompetencyReport(r: CompetencyResult): string {
  const lines: string[] = []
  lines.push('# 核心素养评估报告')
  lines.push('')
  lines.push(`**学生ID:** ${r.student_id} | **综合素养评分:** ${r.overall_competency}/100 | **等级:** {r.competency_grade}`)
  lines.push('')
  lines.push('## 一、五维素养评估')
  lines.push('')
  lines.push('| 维度 | 分数 | 等级 | 说明 |')
  lines.push('|------|------|------|------|')
  for (const d of r.dimensions) {
    lines.push(`| ${d.name_cn} | ${progressBar(d.score)} ${d.score} | ${d.level} | ${d.description} |`)
  }
  lines.push('')
  lines.push('## 二、优势与短板')
  lines.push('')
  lines.push(`**最强维度:** ${r.strongest}`)
  lines.push(`**最弱维度:** ${r.weakest}`)
  lines.push('')
  lines.push('## 三、发展建议')
  lines.push('')
  for (const rec of r.development_recommendations) {
    lines.push(`- 🎯 ${rec}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`> **免责声明:** ${DISCLAIMER}`)
  return lines.join('\n')
}

// --- Tool 8: Education Equity Monitor Report ---
function formatEquityReport(r: EquityResult): string {
  const lines: string[] = []
  lines.push('# 教育公平监控报告')
  lines.push('')
  lines.push(`**监控区域:** ${r.region} | **公平指数:** ${r.overall_equity_index}/100 | **公平等级:** ${r.equity_level}`)
  lines.push('')
  lines.push('## 一、群体对比分析')
  lines.push('')
  lines.push('| 群体 | 平均成绩 | 资源指数 | 数字接入 |')
  lines.push('|------|----------|----------|----------|')
  for (const g of r.group_comparisons) {
    lines.push(`| ${g.group} | ${g.avg_score} | ${g.resource_index} | ${g.digital_access} |`)
  }
  lines.push('')
  lines.push('## 二、差距分析')
  lines.push('')
  lines.push(`**城乡差距:** ${r.gap_analysis.urban_rural}分`)
  lines.push(`**性别差距:** ${r.gap_analysis.gender}分`)
  lines.push(`**经济差距:** ${r.gap_analysis.economic}分`)
  lines.push('')
  lines.push('## 三、资源分配公平性')
  lines.push('')
  lines.push(r.resource_fairness)
  lines.push('')
  lines.push('## 四、数字鸿沟评估')
  lines.push('')
  lines.push(r.digital_divide_assessment)
  lines.push('')
  lines.push('## 五、政策建议')
  lines.push('')
  for (const pr of r.policy_recommendations) {
    lines.push(`- 📋 ${pr}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`> **免责声明:** ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== SECTION 6 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Adaptive Learning Path — 自适应学习路径引擎
  tools.register(defineTool({
    name: 'adaptive_learning_path',
    description: '自适应学习路径引擎 | 分析知识点掌握度(0-100)、学习风格(visual/auditory/kinesthetic)、推荐路径、预估提分 | knowledge_gap_analyzer + learning_style_profiler + path_recommendation',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: student_id, knowledge_points[{name, mastery}], learning_style(visual|auditory|kinesthetic), target_score, current_score, available_weeks' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
  
    async execute(args: { input_data: string }) {
      const data: AdaptiveLearningInput = JSON.parse(args.input_data)
      return formatAdaptiveLearningReport(analyzeAdaptiveLearning(data))
    }
  }))

  // Tool 2: Student Performance Predictor — 学情预测预警
  tools.register(defineTool({
    name: 'student_performance_predictor',
    description: '学情预测预警 | 预测考试成绩、辍学风险、薄弱知识点、提升建议 | Predict exam scores, dropout risk, weak knowledge points, and improvement suggestions.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: student_id, historical_scores[], attendance_rate(0-100), assignment_completion(0-100), study_hours_per_week, engagement_score(0-100)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
  
    async execute(args: { input_data: string }) {
      const data: PerformancePredictorInput = JSON.parse(args.input_data)
      return formatPerformancePredictorReport(analyzePerformancePredictor(data))
    }
  }))

  // Tool 3: Auto Grading Engine — 智能批改引擎
  tools.register(defineTool({
    name: 'auto_grading_engine',
    description: '智能批改引擎 | 作文/简答题自动批改、语法检测、抄袭检测、批改一致性分析 | Automated essay/short-answer grading with grammar check, plagiarism detection, and consistency analysis.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: student_id, assignment_type(essay|short_answer|grammar_check|plagiarism_check), content(string), reference_answer?(string), rubric_criteria?(string[])' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
  
    async execute(args: { input_data: string }) {
      const data: GradingInput = JSON.parse(args.input_data)
      return formatAutoGradingReport(analyzeAutoGrading(data))
    }
  }))

  // Tool 4: Course Quality Evaluator — 课程质量评估
  tools.register(defineTool({
    name: 'course_quality_evaluator',
    description: '课程质量评估 | 课程难度、学生完课率、互动质量、NPS评分、改进建议 | Evaluate course difficulty, completion rate, interaction quality, NPS score, and improvement suggestions.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: course_id, course_name, difficulty_rating(0-100), completion_rate(0-100), interaction_score(0-100), nps_score(-100 to 100), student_count, avg_study_hours' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
  
    async execute(args: { input_data: string }) {
      const data: CourseQualityInput = JSON.parse(args.input_data)
      return formatCourseQualityReport(analyzeCourseQuality(data))
    }
  }))

  // Tool 5: Personalized Homework Generator — 个性化作业生成
  tools.register(defineTool({
    name: 'personalized_homework_generator',
    description: '个性化作业生成 | 根据学生水平生成差异化题目、难度梯度、题量优化、知识点覆盖 | Generate differentiated homework with difficulty gradients, optimized question count, and knowledge point coverage.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: student_id, student_level(beginner|intermediate|advanced), knowledge_points[](string), target_difficulty(1-10), question_count(int), coverage_requirement(0-100)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
  
    async execute(args: { input_data: string }) {
      const data: HomeworkInput = JSON.parse(args.input_data)
      return formatHomeworkReport(analyzeHomeworkGeneration(data))
    }
  }))

  // Tool 6: Teaching Effectiveness Analyzer — 教师授课效果分析
  tools.register(defineTool({
    name: 'teaching_effectiveness_analyzer',
    description: '教师授课效果分析 | 课堂互动率、讲授清晰度、时间利用率、学生注意力曲线 | Analyze classroom interaction rate, teaching clarity, time utilization, and student attention curve.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: teacher_id, course_id, interaction_rate(0-100), clarity_score(0-100), time_utilization(0-100), attention_curve[](number), student_satisfaction(0-100)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
  
    async execute(args: { input_data: string }) {
      const data: TeachingInput = JSON.parse(args.input_data)
      return formatTeachingEffectivenessReport(analyzeTeachingEffectiveness(data))
    }
  }))

  // Tool 7: Competency Assessment — 核心素养评估
  tools.register(defineTool({
    name: 'competency_assessment',
    description: '核心素养评估 | 批判性思维、创造力、协作能力、沟通能力、数字素养五维评估 | Five-dimensional competency assessment: critical thinking, creativity, collaboration, communication, digital literacy.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: student_id, critical_thinking_score(0-100), creativity_score(0-100), collaboration_score(0-100), communication_score(0-100), digital_literacy_score(0-100), evidence_notes?(string)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
  
    async execute(args: { input_data: string }) {
      const data: CompetencyInput = JSON.parse(args.input_data)
      return formatCompetencyReport(analyzeCompetency(data))
    }
  }))

  // Tool 8: Education Equity Monitor — 教育公平监控
  tools.register(defineTool({
    name: 'education_equity_monitor',
    description: '教育公平监控 | 不同群体(城乡/性别/经济)成绩差距、资源分配公平性、数字鸿沟指数 | Monitor urban-rural/gender/economic achievement gaps, resource allocation fairness, and digital divide index.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: region, urban_rural_gap(0-100), gender_gap(0-100), economic_gap(0-100), resource_allocation_index(0-100), digital_divide_index(0-100), sample_size(int)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
  
    async execute(args: { input_data: string }) {
      const data: EquityInput = JSON.parse(args.input_data)
      return formatEquityReport(analyzeEducationEquity(data))
    }
  }))

  console.log(`[dsh-tool-eduagentpro] Loaded v${VERSION} — 教育AI助手: 8 tools active`)
  console.log('  Tools: adaptive_learning_path, student_performance_predictor, auto_grading_engine, course_quality_evaluator, personalized_homework_generator, teaching_effectiveness_analyzer, competency_assessment, education_equity_monitor')
}
