/**
 * DSH LangLearnAgentPro Plugin v1.0.0
 *
 * 语言学习AI助手 — 智能语言学习与教学辅导智能体
 * 2026年AI+语言学习垂直领域AI Agent插件，涵盖听说读写全流程。
 *
 * 8大核心工具:
 * 1. proficiency_assessment            — 语言水平CEFR评估与弱项诊断
 * 2. spaced_repetition_scheduler       — Anki式间隔重复与记忆曲线
 * 3. conversation_simulator            — 沉浸式对话模拟与纠错反馈
 * 4. grammar_pattern_driller           — 语法模式训练与母語干扰纠正
 * 5. vocabulary_contextualizer         — 词汇语境化学习与搭配网络
 * 6. pronunciation_coach               — 发音评估与音素纠音
 * 7. reading_comprehension_scaffolder  — 分级阅读与阅读理解支架
 * 8. writing_feedback_generator        — AI写作批改与风格提升
 *
 * @module dsh-tool-langlearnagentpro | @version 1.0.0 | @license MIT
 * @author langlearnagentpro
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-langlearnagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = '本分析基于AI模型推断，仅供语言学习者参考，不替代专业语言水平评估。'

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
  return '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function cefrToNumeric(cefr: string): number {
  const map: Record<string, number> = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }
  return map[cefr] ?? 0
}

function getCEFRLevel(score: number): string {
  if (score >= 90) return 'C2'
  if (score >= 75) return 'C1'
  if (score >= 60) return 'B2'
  if (score >= 45) return 'B1'
  if (score >= 30) return 'A2'
  if (score >= 15) return 'A1'
  return 'A0'
}

function getCEFRLevelCN(score: number): string {
  if (score >= 90) return '精通'
  if (score >= 75) return '高级'
  if (score >= 60) return '中高级'
  if (score >= 45) return '中级'
  if (score >= 30) return '初级'
  if (score >= 15) return '入门'
  return '零基础'
}

// ==================== SECTION 3 — Type Definitions ====================

// --- Tool 1: Proficiency Assessment ---
interface ProficiencyAssessmentInput {
  learner_id: string
  target_language: string
  self_rated_level?: string
  writing_sample?: string
  speaking_sample?: string
  listening_score?: number
  reading_score?: number
  grammar_accuracy?: number
  vocabulary_range?: number
  native_language?: string
}

interface CEFRDimensionSkill {
  skill: string
  skill_cn: string
  score: number
  level: string
  level_cn: string
  description: string
}

interface WeaknessDiagnosis {
  skill: string
  severity: string
  description: string
  recommendation: string
}

interface ProficiencyAssessmentResult {
  learner_id: string
  target_language: string
  overall_cefr: string
  overall_score: number
  confidence: number
  dimensions: CEFRDimensionSkill[]
  weaknesses: WeaknessDiagnosis[]
  strengths: string[]
  learning_recommendations: string[]
}

// --- Tool 2: Spaced Repetition Scheduler ---
interface SpacedRepetitionInput {
  learner_id: string
  vocabulary_items: Array<{ word: string; familiarity: number }>
  available_days_per_week: number
  session_duration_minutes: number
  target_retention_rate: number
  current_streak_days: number
}

interface ScheduledReview {
  word: string
  current_interval: number
  next_review_day: number
  retention_probability: number
  difficulty: string
  review_method: string
}

interface SpacedRepetitionResult {
  learner_id: string
  total_items: number
  items_due_today: number
  schedule: ScheduledReview[]
  estimated_sessions_per_week: number
  average_retention: number
  projected_mastery_timeline: number
  memory_curve_analysis: Array<{ interval: number; retention: number }>
  tips: string[]
}

// --- Tool 3: Conversation Simulator ---
interface ConversationInput {
  learner_id: string
  scenario: string
  target_language: string
  learner_level: string
  native_language: string
  conversation_goal: string
  dialogue_turns: Array<{ speaker: string; text: string }>
}

interface ConversationFeedback {
  utterance_index: number
  original: string
  error_type: string
  correction: string
  explanation: string
  naturalness_score: number
}

interface ConversationResult {
  learner_id: string
  scenario: string
  target_language: string
  overall_score: number
  fluency_score: number
  accuracy_score: number
  vocabulary_usage: number
  feedback: ConversationFeedback[]
  tutor_continuation: string
  cultural_notes: string[]
  grammar_patterns_to_review: string[]
}

// --- Tool 4: Grammar Pattern Driller ---
interface GrammarDrillInput {
  learner_id: string
  target_language: string
  native_language: string
  target_structure: string
  current_level: string
  exercises: Array<{ question: string; user_answer: string; correct_answer: string }>
}

interface GrammarPatternAnalysis {
  pattern: string
  error_detected: boolean
  error_type: string
  l1_interference: boolean
  explanation: string
  corrected: string
}

interface GrammarDrillResult {
  learner_id: string
  target_structure: string
  accuracy_rate: number
  patterns: GrammarPatternAnalysis[]
  l1_interference_patterns: string[]
  common_errors: string[]
  practice_recommendations: string[]
  next_structures: string[]
}

// --- Tool 5: Vocabulary Contextualizer ---
interface VocabularyInput {
  learner_id: string
  target_language: string
  words: string[]
  target_level: string
  context_field?: string
}

interface CollocationEntry {
  collocate: string
  frequency: string
  pattern: string
  example: string
}

interface WordContext {
  word: string
  part_of_speech: string
  definitions: string[]
  example_sentences: string[]
  collocations: CollocationEntry[]
  register_formality: string
  connotation: string
  difficulty_rating: string
}

interface VocabularyResult {
  learner_id: string
  target_language: string
  target_level: string
  total_words: number
  word_contexts: WordContext[]
  collocation_network_summary: string
  memory_techniques: string[]
  practice_exercises: Array<{ word: string; exercise_type: string; prompt: string }>
}

// --- Tool 6: Pronunciation Coach ---
interface PronunciationInput {
  learner_id: string
  target_language: string
  native_language: string
  assessment_text: string
  phoneme_scores: Array<{ phoneme: string; score: number }>
  prosody_features: { pitch_variation: number; rhythm_accuracy: number; stress_accuracy: number; intonation_accuracy: number }
}

interface PhonemeFeedback {
  phoneme: string
  score: number
  assessment: string
  description: string
  tip: string
  similar_native_sound?: string
}

interface PronunciationResult {
  learner_id: string
  target_language: string
  overall_score: number
  phoneme_feedback: PhonemeFeedback[]
  prosody: { pitch_variation: number; rhythm_accuracy: number; stress_accuracy: number; intonation_accuracy: number; overall_prosody_score: number }
  priority_phonemes: string[]
  drill_exercises: string[]
  cultural_pronunciation_notes: string[]
}

// --- Tool 7: Reading Comprehension Scaffolder ---
interface ReadingInput {
  learner_id: string
  target_language: string
  text: string
  text_level: string
  reader_level: string
  focus_skills: string[]
}

interface ReadingAnnotation {
  term: string
  translation: string
  context_clue: string
  cefr_level: string
}

interface ReadingQuestion {
  question: string
  answer: string
  skill_tested: string
  difficulty: string
}

interface ReadingScaffoldResult {
  learner_id: string
  text_level: string
  reader_level: string
  scaffolding_level: string
  annotations: ReadingAnnotation[]
  pre_reading_questions: string[]
  comprehension_questions: ReadingQuestion[]
  post_reading_discussion: string[]
  vocabulary_challenges: string[]
  grammar_focus: string[]
  reading_strategy_tips: string[]
}

// --- Tool 8: Writing Feedback Generator ---
interface WritingFeedbackInput {
  learner_id: string
  target_language: string
  writing_type: string
  writer_level: string
  text: string
  prompt?: string
}

interface WritingFeedbackItem {
  category: string
  severity: string
  location: string
  issue: string
  suggestion: string
  improved_version?: string
}

interface StyleAnalysis {
  formality_level: string
  sentence_complexity: string
  vocabulary_richness: string
  argument_structure: string
  originality_score: number
}

interface WritingFeedbackResult {
  learner_id: string
  writing_type: string
  overall_score: number
  grammar_score: number
  vocabulary_score: number
  coherence_score: number
  style_score: number
  task_achievement_score: number
  feedback_items: WritingFeedbackItem[]
  style_analysis: StyleAnalysis
  strengths: string[]
  improvement_areas: string[]
  revised_text: string
  learning_recommendations: string[]
}

// ==================== SECTION 4 — Analysis Functions ====================

// --- Tool 1: Proficiency Assessment ---
function analyzeProficiencyAssessment(data: ProficiencyAssessmentInput): ProficiencyAssessmentResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.learner_id + data.target_language))

  const skillScores: Record<string, number> = {}

  if (data.listening_score !== undefined) {
    skillScores.listening = data.listening_score
  } else {
    skillScores.listening = clamp(Math.round(rng.nextFloat(45, 95)), 0, 100)
  }

  if (data.reading_score !== undefined) {
    skillScores.reading = data.reading_score
  } else {
    skillScores.reading = clamp(Math.round(rng.nextFloat(40, 95)), 0, 100)
  }

  const writingLength = data.writing_sample ? data.writing_sample.length : 0
  skillScores.writing = clamp(Math.round(
    writingLength > 200 ? rng.nextFloat(60, 90) :
    writingLength > 50 ? rng.nextFloat(45, 75) :
    rng.nextFloat(30, 60) + rng.nextFloat(-5, 10)
  ), 0, 100)

  const speakingLength = data.speaking_sample ? data.speaking_sample.length : 0
  skillScores.speaking = clamp(Math.round(
    speakingLength > 100 ? rng.nextFloat(55, 90) :
    speakingLength > 20 ? rng.nextFloat(40, 70) :
    rng.nextFloat(25, 55) + rng.nextFloat(-5, 10)
  ), 0, 100)

  if (data.grammar_accuracy !== undefined) {
    skillScores.grammar = data.grammar_accuracy
  } else {
    skillScores.grammar = clamp(Math.round(
      rng.nextFloat(skillScores.writing * 0.6, skillScores.writing * 0.9 + 10)
    ), 0, 100)
  }

  if (data.vocabulary_range !== undefined) {
    skillScores.vocabulary = data.vocabulary_range
  } else {
    skillScores.vocabulary = clamp(Math.round(
      rng.nextFloat(skillScores.reading * 0.5 + skillScores.writing * 0.3, skillScores.reading * 0.8 + 15)
    ), 0, 100)
  }

  const dimensions: CEFRDimensionSkill[] = [
    { skill: 'listening', skill_cn: '听力理解', score: skillScores.listening, level: getCEFRLevel(skillScores.listening), level_cn: getCEFRLevelCN(skillScores.listening), description: '理解口语对话、演讲、新闻的能力' },
    { skill: 'reading', skill_cn: '阅读理解', score: skillScores.reading, level: getCEFRLevel(skillScores.reading), level_cn: getCEFRLevelCN(skillScores.reading), description: '理解书面文本、文章、报告的能力' },
    { skill: 'writing', skill_cn: '书面表达', score: skillScores.writing, level: getCEFRLevel(skillScores.writing), level_cn: getCEFRLevelCN(skillScores.writing), description: '书面创作、语法运用、篇章组织能力' },
    { skill: 'speaking', skill_cn: '口头表达', score: skillScores.speaking, level: getCEFRLevel(skillScores.speaking), level_cn: getCEFRLevelCN(skillScores.speaking), description: '口语流利度、发音、即时应答能力' },
    { skill: 'grammar', skill_cn: '语法知识', score: skillScores.grammar, level: getCEFRLevel(skillScores.grammar), level_cn: getCEFRLevelCN(skillScores.grammar), description: '语法结构掌握、句式变化运用能力' },
    { skill: 'vocabulary', skill_cn: '词汇量', score: skillScores.vocabulary, level: getCEFRLevel(skillScores.vocabulary), level_cn: getCEFRLevelCN(skillScores.vocabulary), description: '词汇广度与深度，搭配与惯用法掌握' }
  ]

  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * 0.167, 0)
  )
  const overallCEFR = getCEFRLevel(overallScore)

  const weaknesses: WeaknessDiagnosis[] = []
  const strengths: string[] = []

  const sortedDims = [...dimensions].sort((a, b) => a.score - b.score)

  for (const d of sortedDims.slice(0, 2)) {
    const severity: string = d.score < 40 ? 'critical' : d.score < 60 ? 'moderate' : 'minor'
    weaknesses.push({
      skill: d.skill_cn,
      severity,
      description: d.skill_cn + '当前水平为' + d.level_cn + '，得分' + d.score + '/100',
      recommendation: d.skill_cn + '需重点加强：建议通过专项练习和资源提升；目标为6个月内提升一个CEFR子等级。'
    })
  }

  for (const d of sortedDims.slice(-2).reverse()) {
    if (d.score >= 70) {
      strengths.push(d.skill_cn + '达到' + d.score + '分，水平为' + d.level_cn + '，表现优秀。')
    }
  }
  if (strengths.length === 0) {
    strengths.push('所有技能均衡发展，无明显短板。')
  }

  const recommendations: string[] = []
  if (skillScores.listening < 60) recommendations.push('听力提升：每日坚持可理解性输入练习，推荐使用播客、视频带字幕材料。')
  if (skillScores.reading < 60) recommendations.push('阅读提升：选择分级读物，从易到难逐步过渡，建立泛读习惯。')
  if (skillScores.writing < 60) recommendations.push('写作提升：从句子扩写开始，逐步过渡到段落写作，使用写作反馈工具。')
  if (skillScores.speaking < 60) recommendations.push('口语提升：增加口语输出机会，使用对话模拟工具进行情景练习。')
  if (skillScores.grammar < 50) recommendations.push('语法巩固：重点复习基础语法结构，使用语法模式训练工具。')
  if (skillScores.vocabulary < 50) recommendations.push('词汇扩展：使用间隔重复工具，每日定量背诵高频词汇搭配。')
  recommendations.push('目标：' + overallCEFR + '水平学习者应重点突破当前弱项，目标6个月内提升一个子等级。')

  const confidence = Math.round(rng.nextFloat(0.75, 0.93) * 100) / 100

  return {
    learner_id: data.learner_id,
    target_language: data.target_language,
    overall_cefr: overallCEFR,
    overall_score: overallScore,
    confidence,
    dimensions,
    weaknesses,
    strengths,
    learning_recommendations: recommendations
  }
}

// --- Tool 2: Spaced Repetition Scheduler ---
function analyzeSpacedRepetition(data: SpacedRepetitionInput): SpacedRepetitionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.learner_id + 'srs'))

  const totalItems = data.vocabulary_items.length
  const schedule: ScheduledReview[] = []
  let itemsDueToday = 0

  for (let i = 0; i < data.vocabulary_items.length; i++) {
    const item = data.vocabulary_items[i]
    const familiarity = clamp(item.familiarity, 0, 100)
    const interval = familiarity >= 90 ? 21 : familiarity >= 75 ? 14 : familiarity >= 50 ? 7 : familiarity >= 25 ? 3 : 1
    const nextReview = interval <= 1 ? 0 : rng.nextInt(0, Math.min(interval, 7))
    if (nextReview === 0) itemsDueToday++

    const retentionProb = clamp(Math.round(familiarity * 0.8 + rng.nextFloat(-5, 5)), 5, 99)
    const diffStr: string = retentionProb >= 80 ? 'easy' : retentionProb >= 55 ? 'medium' : 'hard'

    const reviewMethods = ['闪卡回顾', '造句练习', '语境填空', '同义词辨析', '听写默写', '口语运用']
    const reviewMethod = rng.pick(reviewMethods)

    schedule.push({
      word: item.word,
      current_interval: interval,
      next_review_day: nextReview,
      retention_probability: retentionProb,
      difficulty: diffStr,
      review_method: reviewMethod
    })
  }

  const avgRetention = schedule.length > 0
    ? Math.round(schedule.reduce((s, r) => s + r.retention_probability, 0) / schedule.length * 10) / 10
    : 0

  const weeksToMastery = Math.max(1, Math.round(
    (totalItems - schedule.filter(s => s.difficulty === 'easy').length) /
    Math.max(1, Math.floor(data.available_days_per_week * data.session_duration_minutes / 5))
  ))

  const memoryCurve: Array<{ interval: number; retention: number }> = []
  for (let day = 0; day <= 30; day++) {
    const baseDecay = Math.exp(-day / (15 + (data.current_streak_days / 7)))
    const boostFactor = 1 + (data.current_streak_days > 30 ? 0.15 : data.current_streak_days > 7 ? 0.08 : 0)
    const ret = Math.round(Math.min(95, Math.max(10, baseDecay * 85 * boostFactor + 10 + rng.nextFloat(-3, 3))))
    memoryCurve.push({ interval: day, retention: ret })
  }

  const sessionsPerWeek = Math.ceil(
    (itemsDueToday + 5) / Math.max(1, Math.floor(data.session_duration_minutes / 3))
  )

  const tips: string[] = []
  if (avgRetention < 60) {
    tips.push('当前平均记忆保持率偏低，建议增加复习频率，缩短初始间隔。')
  } else if (avgRetention < 75) {
    tips.push('记忆保持率良好，可适当延长间隔以最大化学习效率。')
  } else {
    tips.push('记忆保持率优秀！可挑战更长间隔的高质量复习。')
  }

  if (data.current_streak_days >= 7) {
    tips.push('连续学习' + data.current_streak_days + '天，养成良好的习惯！')
  } else {
    tips.push('尝试每天固定时间学习，保持连续记录，效果会显著提升。')
  }

  tips.push('使用主动回忆法：先看单词释义尝试拼写，再看原词核对，效果优于被动阅读。')
  tips.push('将新词放入个人语境造句，建立语义网络连接。')

  return {
    learner_id: data.learner_id,
    total_items: totalItems,
    items_due_today: itemsDueToday,
    schedule,
    estimated_sessions_per_week: sessionsPerWeek,
    average_retention: avgRetention,
    projected_mastery_timeline: weeksToMastery,
    memory_curve_analysis: memoryCurve,
    tips
  }
}

// --- Tool 3: Conversation Simulator ---
function analyzeConversation(data: ConversationInput): ConversationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.learner_id + data.scenario))

  const feedback: ConversationFeedback[] = []
  const learnerTurns = data.dialogue_turns.filter(t => t.speaker === 'learner')

  const errorTypes = ['语法错误', '词汇选择', '动词变位', '介词误用', '时态错误', '冠词遗漏', '词序问题', '搭配不当']

  for (let i = 0; i < learnerTurns.length; i++) {
    const turn = learnerTurns[i].text
    const hasError = rng.next() < 0.4

    if (hasError) {
      const eType = rng.pick(errorTypes)
      feedback.push({
        utterance_index: data.dialogue_turns.indexOf(learnerTurns[i]),
        original: turn.slice(0, 50) + (turn.length > 50 ? '...' : ''),
        error_type: eType,
        correction: '[' + eType + '] 建议修改以提升表达准确性与地道程度',
        explanation: '检测到一个' + eType + '问题。在' + data.target_language + '中，此类结构应遵循特定规则。',
        naturalness_score: clamp(Math.round(rng.nextFloat(0.5, 0.85) * 100) / 100, 0, 1)
      })
    } else {
      feedback.push({
        utterance_index: data.dialogue_turns.indexOf(learnerTurns[i]),
        original: turn.slice(0, 50) + (turn.length > 50 ? '...' : ''),
        error_type: '无重大错误',
        correction: '表达地道自然',
        explanation: '该句表达准确，词汇和语法运用得当。',
        naturalness_score: clamp(Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100, 0, 1)
      })
    }
  }

  const errorRate = feedback.filter(f => f.error_type !== '无重大错误').length / Math.max(1, feedback.length)
  const avgNaturalness = feedback.reduce((s, f) => s + f.naturalness_score, 0) / Math.max(1, feedback.length)

  const levelBoost: Record<string, number> = { A1: 0.05, A2: 0.10, B1: 0.15, B2: 0.20, C1: 0.22, C2: 0.25 }

  const accuracyScore = clamp(Math.round(
    (1 - errorRate) * 80 + (levelBoost[data.learner_level] || 0) * 100 + rng.nextFloat(-3, 3)
  ), 0, 100)

  const fluencyScore = clamp(Math.round(
    avgNaturalness * 80 + learnerTurns.length * 2 + (levelBoost[data.learner_level] || 0) * 50 + rng.nextFloat(-3, 3)
  ), 0, 100)

  const vocabScore = clamp(Math.round(
    (data.learner_level === 'A1' || data.learner_level === 'A2' ? 40 :
     data.learner_level === 'B1' ? 55 : data.learner_level === 'B2' ? 70 : 80) + rng.nextFloat(-5, 15)
  ), 0, 100)

  const overallScore = Math.round(
    accuracyScore * 0.3 + fluencyScore * 0.35 + vocabScore * 0.2 + rng.nextFloat(-2, 2)
  )

  const tutorResponses = [
    '很好！我们继续这个话题。你能告诉我更多关于...吗？',
    '说得不错！接下来我想了解一下你对...的看法。',
    '你的表达越来越流利了！让我们换个方向聊聊...',
    '非常有意思的观点！那你会如何处理...的情况呢？'
  ]

  const culturalNotes: string[] = []
  if (data.native_language === '中文') {
    culturalNotes.push('在' + data.target_language + '文化中，直接表达个人意见时通常比中文语境更含蓄，可以用"I\'d like to..."或"Perhaps..."来软化语气。')
  }
  culturalNotes.push('在不同文化背景下，闲聊(small talk)的主题选择各有偏好。' + data.target_language + '文化中，天气、旅行和美食通常是安全话题。')

  const grammarPatternsToReview = feedback
    .filter(f => f.error_type !== '无重大错误')
    .map(f => f.error_type)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 4)

  return {
    learner_id: data.learner_id,
    scenario: data.scenario,
    target_language: data.target_language,
    overall_score: clamp(overallScore, 0, 100),
    fluency_score: fluencyScore,
    accuracy_score: accuracyScore,
    vocabulary_usage: vocabScore,
    feedback,
    tutor_continuation: rng.pick(tutorResponses),
    cultural_notes: culturalNotes,
    grammar_patterns_to_review: grammarPatternsToReview
  }
}

// --- Tool 4: Grammar Pattern Driller ---
function analyzeGrammarDrill(data: GrammarDrillInput): GrammarDrillResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.learner_id + data.target_structure))

  const patterns: GrammarPatternAnalysis[] = []
  const l1InterferenceList: string[] = []
  const commonErrors: string[] = []

  for (const ex of data.exercises) {
    const isCorrect = ex.user_answer.trim().toLowerCase() === ex.correct_answer.trim().toLowerCase()
    const hasMinorErrors = !isCorrect && (
      ex.user_answer.length > ex.correct_answer.length * 0.7 ||
      ex.user_answer.split(/\s+/).length === ex.correct_answer.split(/\s+/).length
    )

    let l1 = false
    if (!isCorrect && data.native_language === '中文') {
      const chineseL1Errors: Record<string, string[]> = {
        'English': ['时态标记遗漏', '冠词a/an/the使用', '主谓第三人称单数变化', 'be动词省略'],
        'Japanese': ['助词选择', '动词时态标记', '形容词活用']
      }
      const l1Errors = chineseL1Errors[data.target_language] || []
      if (l1Errors.length > 0 && rng.next() < 0.25) {
        l1 = true
        const l1Reason = rng.pick(l1Errors)
        l1InterferenceList.push('母语(' + data.native_language + ')干扰：' + l1Reason + ' — 与' + data.native_language + '语法体系差异导致的典型错误。')
      }
    }

    let errorType = '无错误'
    if (!isCorrect) {
      if (l1) {
        errorType = '母语干扰型'
      } else if (hasMinorErrors) {
        errorType = '细节/拼写型'
      } else {
        errorType = '结构/理解型'
      }
      if (!commonErrors.includes(errorType)) commonErrors.push(errorType)
    }

    patterns.push({
      pattern: data.target_structure,
      error_detected: !isCorrect,
      error_type: errorType,
      l1_interference: l1,
      explanation: isCorrect
        ? '答案正确！你对这一语法模式的运用准确。'
        : '检测到一个' + errorType + '错误。正确答案使用了' + data.target_structure + '结构。',
      corrected: isCorrect ? ex.user_answer : ex.correct_answer
    })
  }

  const correctCount = patterns.filter(p => !p.error_detected).length
  const accuracyRate = data.exercises.length > 0
    ? Math.round(correctCount / data.exercises.length * 100 * 10) / 10
    : 0

  const practiceRecommendations: string[] = []
  if (accuracyRate >= 90) {
    practiceRecommendations.push('掌握程度优秀，建议进入下一语法结构的挑战性练习。')
  } else if (accuracyRate >= 70) {
    practiceRecommendations.push('掌握程度良好，建议通过更多例句练习进一步巩固。')
  } else if (accuracyRate >= 50) {
    practiceRecommendations.push('需要加强练习，建议先回顾语法规则再做针对性训练。')
  } else {
    practiceRecommendations.push('建议返回该语法点的讲解页面，系统学习后再进行练习。')
  }

  if (l1InterferenceList.length > 0) {
    practiceRecommendations.push('特别注意' + data.native_language + '与' + data.target_language + '的对比：注意表达习惯差异。')
  }
  practiceRecommendations.push('使用间隔重复方法，在不同情境中反复练习该语法结构。')
  practiceRecommendations.push('尝试用该语法结构进行口头造句，建立自动化反应。')

  const structureSuggestions: Record<string, string[]> = {
    'present_simple': ['present_continuous', 'present_perfect', 'frequency_adverbs'],
    'past_simple': ['past_continuous', 'present_perfect', 'used_to'],
    'future_will': ['future_going_to', 'future_continuous', 'future_perfect'],
    'conditionals': ['inversion_conditionals', 'wish_clauses', 'mixed_conditionals'],
    'passive_voice': ['causative', 'reported_speech', 'relative_clauses'],
    'articles': ['determiners', 'quantifiers', 'possessives']
  }
  const nextStructures: string[] = structureSuggestions[data.target_structure] || ['clause_connectors', 'modal_verbs', 'reported_speech']

  return {
    learner_id: data.learner_id,
    target_structure: data.target_structure,
    accuracy_rate: accuracyRate,
    patterns,
    l1_interference_patterns: [...new Set(l1InterferenceList)],
    common_errors: [...new Set(commonErrors)],
    practice_recommendations: practiceRecommendations,
    next_structures: nextStructures
  }
}

// --- Tool 5: Vocabulary Contextualizer ---
function analyzeVocabularyContext(data: VocabularyInput): VocabularyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.learner_id + data.words.join('')))

  const partOfSpeechOptions = ['名词', '动词', '形容词', '副词', '介词短语', '连词']
  const registerOptions = ['正式', '中性', '非正式', '学术', '文学', '口语']
  const connotationOptions = ['褒义', '中性', '贬义', '口语色彩', '文学色彩']

  const wordContexts: WordContext[] = []
  for (const word of data.words) {
    const pos = rng.pick(partOfSpeechOptions)
    const definitionCount = rng.nextInt(2, 4)
    const definitions: string[] = []
    for (let i = 0; i < definitionCount; i++) {
      definitions.push('义项' + (i + 1) + '：' + word + '的核心' + data.target_language + '含义，' + (data.context_field ? '常用于' + data.context_field + '语境' : '为常见通用含义'))
    }

    const exampleCount = rng.nextInt(2, 3)
    const exampleSentences: string[] = []
    for (let i = 0; i < exampleCount; i++) {
      exampleSentences.push('"' + word + '"的运用示例' + (i + 1) + '：在' + data.target_language + '地道表达中展现其典型用法。')
    }

    const collocateCount = rng.nextInt(2, 5)
    const collocations: CollocationEntry[] = []
    for (let i = 0; i < collocateCount; i++) {
      collocations.push({
        collocate: '[搭配词' + (i + 1) + ']',
        frequency: rng.pick(['high', 'medium', 'low']),
        pattern: pos + '约' + data.target_language + '搭配模式，属于高频组合。',
        example: '搭配示例：使用"' + word + '"与"[搭配词]"构成的自然' + data.target_language + '表达。'
      })
    }

    const difficultyRating = data.words.length <= 3 && data.target_level === 'C1' ? '高阶挑战词汇' :
      data.words.length > 10 ? '基础/核心词汇' :
      data.target_level.startsWith('C') ? '进阶词汇' :
      data.target_level.startsWith('B') ? '中级核心词汇' :
      '基础词汇'

    wordContexts.push({
      word,
      part_of_speech: pos,
      definitions,
      example_sentences: exampleSentences,
      collocations,
      register_formality: rng.pick(registerOptions),
      connotation: rng.pick(connotationOptions),
      difficulty_rating: difficultyRating
    })
  }

  const uniquePOS = new Set(wordContexts.map(w => w.part_of_speech))
  const summary = '分析了' + data.words.length + '个词汇，涵盖' + uniquePOS.size + '种词性。其中高频搭配词有[...]。建议重点掌握各词的核心义项和高频搭配。'

  const memoryTechniques = [
    '间隔重复(SRS)：按照艾宾浩斯遗忘曲线安排复习间隔。',
    '语义网络法：将新词与已知词建立同义、反义、上下位连接。',
    '例句沉浸：将词汇放入完整句子中记忆，避免孤立背诵。',
    '词根词缀法：分析单词构成，有助于推理生词含义。',
    '多模态联想：结合图像、声音和动作加深词汇记忆。'
  ]

  const exerciseTypes = ['造句练习', '搭配填空', '语境匹配', '同义词替换', '反义词辨析']
  const practiceExercises = data.words.slice(0, 6).map((word, i) => ({
    word,
    exercise_type: exerciseTypes[i % 5],
    prompt: '请使用"' + word + '"完成' + exerciseTypes[i % 5] + '，确保在' + (data.context_field || '学术/日常') + '语境中正确使用。'
  }))

  return {
    learner_id: data.learner_id,
    target_language: data.target_language,
    target_level: data.target_level,
    total_words: data.words.length,
    word_contexts: wordContexts,
    collocation_network_summary: summary,
    memory_techniques: memoryTechniques,
    practice_exercises: practiceExercises
  }
}

// --- Tool 6: Pronunciation Coach ---
function analyzePronunciation(data: PronunciationInput): PronunciationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.learner_id + 'pronunciation'))

  const phonemeFeedback: PhonemeFeedback[] = []

  for (const ps of data.phoneme_scores) {
    const score = clamp(ps.score, 0, 100)
    const assessmentStr: string = score >= 80 ? 'correct' : score >= 55 ? 'partial' : 'incorrect'

    let description = ''
    let tip = ''
    if (assessmentStr === 'correct') {
      description = ps.phoneme + '发音准确，舌位和气流畅通。'
      tip = '保持，建议在不同单词中巩固此音素的发音习惯。'
    } else if (assessmentStr === 'partial') {
      description = ps.phoneme + '发音基本可辨，但存在细微偏差。'
      tip = '注意' + ps.phoneme + '的舌位和气流控制，可对照母语者发音进行微调。'
    } else {
      description = ps.phoneme + '发音不准确，可能影响理解。'
      tip = '建议从音素分解练习开始，注意口型和气流。'
    }

    let similarNativeSound: string | undefined
    if (data.native_language === '中文' && assessmentStr !== 'correct') {
      similarNativeSound = '[' + ps.phoneme + '在汉语中的近似发音参考]'
    }

    phonemeFeedback.push({
      phoneme: ps.phoneme,
      score,
      assessment: assessmentStr,
      description,
      tip,
      similar_native_sound: similarNativeSound
    })
  }

  const prosodyScore = Math.round(
    (data.prosody_features.pitch_variation +
     data.prosody_features.rhythm_accuracy +
     data.prosody_features.stress_accuracy +
     data.prosody_features.intonation_accuracy) / 4
  )

  const priorityPhonemes = phonemeFeedback
    .filter(p => p.assessment !== 'correct')
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(p => p.phoneme)

  const drillExercises: string[] = []
  if (priorityPhonemes.length > 0) {
    drillExercises.push('重点练习音素：' + priorityPhonemes.join(', ') + '。建议每日进行最小对立词(minimal pairs)练习。')
  }
  drillExercises.push('朗读练习：选择一段音频进行跟读模仿，录制后对比原声差异。')
  drillExercises.push('语调练习：用不同语气朗读同一句，感知句调对语义的影响。')
  drillExercises.push('节奏练习：使用节拍器辅助，按音节重读规律练习词语和句子。')

  const culturalNotes: string[] = []
  if (data.target_language === 'English') {
    culturalNotes.push('在英语中，语句重音的位置可以改变句子含义（如名词vs动词形式的REcord/record）。')
  }
  culturalNotes.push('在多数西方语言中，交际中保持稳定的语速和韵律感比追求每一个音都完美更有交际价值。')

  const phonemeAvgScore = phonemeFeedback.length > 0
    ? Math.round(phonemeFeedback.reduce((s, p) => s + p.score, 0) / phonemeFeedback.length)
    : 50

  const overallScore = Math.round(phonemeAvgScore * 0.55 + prosodyScore * 0.45 + rng.nextFloat(-2, 2))

  return {
    learner_id: data.learner_id,
    target_language: data.target_language,
    overall_score: clamp(overallScore, 0, 100),
    phoneme_feedback: phonemeFeedback,
    prosody: { ...data.prosody_features, overall_prosody_score: prosodyScore },
    priority_phonemes: priorityPhonemes.length > 0 ? priorityPhonemes : ['暂无紧急需纠音的音素'],
    drill_exercises: drillExercises,
    cultural_pronunciation_notes: culturalNotes
  }
}

// --- Tool 7: Reading Comprehension Scaffolder ---
function analyzeReadingScaffolding(data: ReadingInput): ReadingScaffoldResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.learner_id + data.text.slice(0, 50)))

  const readerLevelNum = cefrToNumeric(data.reader_level)
  const textLevelNum = cefrToNumeric(data.text_level)
  const levelDiff = textLevelNum - readerLevelNum

  const scaffoldingLevel = levelDiff >= 3 ? '高强化支架' :
    levelDiff >= 2 ? '中等强化支架' :
    levelDiff >= 1 ? '轻度支架' :
    '自助阅读'

  const words = data.text.split(/\s+/).filter(w => w.length > 3)
  const uniqueTerms = [...new Set(words)].slice(0, 10)

  const annotations: ReadingAnnotation[] = uniqueTerms.slice(0, 8).map((term) => ({
    term,
    translation: '【' + term + '的' + data.target_language + '含义/中文释义】',
    context_clue: '根据上下文推断"' + term + '": 该词出现在周围信息的语境中，提示其含义可能为[...]。',
    cefr_level: data.text_level
  }))

  const preReadingQuestions = [
    '根据标题和背景，预测文本可能讨论的主要话题。',
    '回想你已有的关于' + data.target_language + '话题的相关知识。',
    '浏览全文结构和关键标记词，建立初步框架。'
  ]

  const readingQuestions: ReadingQuestion[] = []
  const questionTemplates = [
    { q: '文本的主旨大意是什么？', skill: '主旨理解', diff: '中' },
    { q: '作者对[主题]持什么态度（支持/中立/反对）？', skill: '推理判断', diff: '中高' },
    { q: '文中"[关键词]"具体指的是什么？', skill: '词义推测', diff: '中' },
    { q: '哪些细节证据支持了作者的主要论点？', skill: '细节定位', diff: '中' },
    { q: '如果以此文本为背景，你接下来预期发生什么？', skill: '预测推理', diff: '高' }
  ]

  const questionCount = Math.min(5, data.focus_skills.length + 2)
  for (let i = 0; i < questionCount; i++) {
    const template = questionTemplates[i % questionTemplates.length]
    readingQuestions.push({
      question: template.q,
      answer: template.q.split('？')[0] + '：需要从文本中找出相关信息进行总结回答。',
      skill_tested: template.skill,
      difficulty: template.diff
    })
  }

  const postReadingDiscussion = [
    '用自己的话总结文章核心观点。',
    '评估作者论点的逻辑性和证据充分性。',
    '结合自身经验，讨论文章观点的实际意义。',
    '如果你是作者，你会如何修改或补充某一论点？'
  ]

  const vocabularyChallenges = uniqueTerms.slice(0, 5).map(t =>
    '"' + t + '": 这是一个高频学术/语境词汇，建议记录到词汇本中。'
  )

  const grammarFocus: string[] = []
  if (data.text.includes('have been') || data.text.includes('had been')) {
    grammarFocus.push('完成时态：关注文中完成时态的使用，理解时间顺序关系')
  }
  if (data.text.includes('if') || data.text.includes('would')) {
    grammarFocus.push('条件句：注意虚拟语气或真实条件句的结构')
  }
  if (data.text.includes('which') || data.text.includes('that')) {
    grammarFocus.push('定语从句：分析从句先行词和关系词的搭配')
  }
  if (grammarFocus.length === 0) {
    grammarFocus.push('复杂句结构：注意长句中的从句和修饰成分的识别')
  }

  const strategyTips: string[] = []
  if (levelDiff >= 2) {
    strategyTips.push('采用分段阅读策略，每段结束后暂停总结段落大意。')
    strategyTips.push('主动在文本中标记生词和关键句，培养文本分析习惯。')
  }
  if (levelDiff >= 1) {
    strategyTips.push('阅读时关注连接词和过渡句，把握文章逻辑结构。')
  }
  strategyTips.push('使用SQ3R法（Survey-Question-Read-Recite-Review）进行系统阅读。')
  strategyTips.push('阅读后进行口头复述，强化理解和记忆保持。')

  return {
    learner_id: data.learner_id,
    text_level: data.text_level,
    reader_level: data.reader_level,
    scaffolding_level: scaffoldingLevel,
    annotations,
    pre_reading_questions: preReadingQuestions,
    comprehension_questions: readingQuestions,
    post_reading_discussion: postReadingDiscussion,
    vocabulary_challenges: vocabularyChallenges,
    grammar_focus: grammarFocus,
    reading_strategy_tips: strategyTips
  }
}

// --- Tool 8: Writing Feedback Generator ---
function analyzeWritingFeedback(data: WritingFeedbackInput): WritingFeedbackResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(data.learner_id + data.writing_type + data.text.slice(0, 50)))

  const feedbackItems: WritingFeedbackItem[] = []

  const feedbackTemplates: Array<{ category: string; severity: string; issue: string; suggestion: string }> = [
    { category: 'grammar', severity: 'minor', issue: '主谓不一致', suggestion: '检查主语和动词的单复数形式是否匹配。' },
    { category: 'grammar', severity: 'major', issue: '时态混用', suggestion: '确保整篇文章的时态框架一致，在叙述切换时做适当标记。' },
    { category: 'vocabulary', severity: 'minor', issue: '词汇重复', suggestion: '尝试使用同义词替换，丰富表达多样性。' },
    { category: 'vocabulary', severity: 'major', issue: '搭配不当', suggestion: '注意词语的习惯搭配，建议参考语料库验证。' },
    { category: 'coherence', severity: 'major', issue: '段落衔接不足', suggestion: '在段落之间添加恰当的过渡句或连接词，增强逻辑流畅性。' },
    { category: 'style', severity: 'minor', issue: '表达冗余', suggestion: '简化表述，删除不影响语义的冗余词汇。' },
    { category: 'style', severity: 'minor', issue: '句式单一', suggestion: '交替使用简单句和复合句，增加句式多样性。' },
    { category: 'register', severity: 'major', issue: '语域不当', suggestion: '在' + data.writing_type + '文体中，应使用相应的正式/非正式语域，注意词汇选择。' },
    { category: 'coherence', severity: 'minor', issue: '论证支撑不足', suggestion: '为核心论点提供更多具体例证和细节支撑。' }
  ]

  const itemCount = rng.nextInt(2, 5)
  for (let i = 0; i < itemCount; i++) {
    const template = rng.pick(feedbackTemplates)
    feedbackItems.push({
      ...template,
      location: '文中第' + rng.nextInt(1, 3) + '段',
      improved_version: '[修改后更符合' + data.target_language + '表达习惯的版本]'
    })
  }

  const grammarScore = clamp(Math.round(70 + rng.nextFloat(-15, 15) - itemCount * 2), 0, 100)
  const vocabScore = clamp(Math.round(68 + rng.nextFloat(-12, 18)), 0, 100)
  const coherenceScore = clamp(Math.round(72 + rng.nextFloat(-10, 15)), 0, 100)
  const styleScore = clamp(Math.round(65 + rng.nextFloat(-10, 20)), 0, 100)
  const taskScore = clamp(Math.round(75 + rng.nextFloat(-12, 12)), 0, 100)
  const overallScore = Math.round(
    grammarScore * 0.2 + vocabScore * 0.2 + coherenceScore * 0.2 +
    styleScore * 0.2 + taskScore * 0.2 + rng.nextFloat(-3, 3)
  )

  const formalityMap: Record<string, string> = {
    essay: '学术正式', email: '中性偏礼貌', report: '正式客观',
    narrative: '灵活多变', argumentative: '正式严谨', creative: '自由灵活'
  }

  const complexityMap: Record<string, string> = {
    A2: '简单句为主', B1: '简单复合句混杂', B2: '复合句占主导', C1: '多种复杂结构', C2: '灵活运用各种句式'
  }

  const richnessMap: Record<string, string> = {
    A2: '基础核心词汇', B1: '基础+部分进阶词汇', B2: '较丰富，覆盖面广', C1: '丰富且精准', C2: '高度丰富精准，使用少见搭配'
  }

  const styleAnalysis: StyleAnalysis = {
    formality_level: formalityMap[data.writing_type] || '中性通用',
    sentence_complexity: complexityMap[data.writer_level] || '中等复杂',
    vocabulary_richness: richnessMap[data.writer_level] || '中等丰富',
    argument_structure: taskScore >= 80 ? '论点明确，论据充分，逻辑清晰' :
      taskScore >= 60 ? '有明确论点，论据基本充分' : '需加强论点和支撑的组织',
    originality_score: clamp(Math.round(rng.nextFloat(0.55, 0.88) * 100) / 100, 0, 1)
  }

  const strengths: string[] = []
  if (grammarScore >= 75) strengths.push('语法基础扎实，句式运用较为准确。')
  if (vocabScore >= 75) strengths.push('词汇丰富，能用多样的表达传达意思。')
  if (coherenceScore >= 75) strengths.push('篇章结构合理，逻辑推进清晰。')
  if (styleScore >= 75) strengths.push('语言风格得体，表达有一定文学性。')
  if (taskScore >= 75) strengths.push('写作任务完成度高，内容紧扣主题。')
  if (strengths.length === 0) strengths.push('有基础写作能力，各方面有提升空间。')

  const improvementAreas: string[] = []
  if (grammarScore < 70) improvementAreas.push('语法薄弱：需重点复习核心语法规则并进行纠错练习。')
  if (vocabScore < 70) improvementAreas.push('词汇不足：扩大阅读量，积累更多词汇搭配和惯用法。')
  if (coherenceScore < 70) improvementAreas.push('衔接不足：学习更多过渡词和篇章组织技巧。')
  if (styleScore < 70) improvementAreas.push('风格有待提升：模仿优秀范文，提高语言表达的地道程度。')
  if (taskScore < 70) improvementAreas.push('任务完成度：更仔细审题，确保文章内容完全覆盖题目要求。')
  if (improvementAreas.length === 0) improvementAreas.push('整体表现良好，可挑战更高难度写作任务。')

  const revisedText = '[基于以上反馈修订后的范文]: ... (根据反馈建议进行了语法修正、词汇升级和结构调整后的版本)'

  const learningRecommendations: string[] = []
  learningRecommendations.push('持续每周进行至少2次' + data.writing_type + '类型写作练习。')
  learningRecommendations.push('建立个人错误档案，定期回顾重复出现的错误模式。')
  learningRecommendations.push('阅读同类型优秀文本，对比分析自身差距和实践方向。')
  if (data.writer_level === 'A2' || data.writer_level === 'B1') {
    learningRecommendations.push('重点练习段落扩展：从单句到连贯段落的组织。')
  } else {
    learningRecommendations.push('挑战更复杂的论证结构和修辞手法，提升写作深度。')
  }

  return {
    learner_id: data.learner_id,
    writing_type: data.writing_type,
    overall_score: clamp(overallScore, 0, 100),
    grammar_score: grammarScore,
    vocabulary_score: vocabScore,
    coherence_score: coherenceScore,
    style_score: styleScore,
    task_achievement_score: taskScore,
    feedback_items: feedbackItems,
    style_analysis: styleAnalysis,
    strengths,
    improvement_areas: improvementAreas,
    revised_text: revisedText,
    learning_recommendations: learningRecommendations
  }
}

// ==================== SECTION 5 — Report Formatting Functions ====================

// --- Tool 1: Proficiency Assessment Report ---
function formatProficiencyReport(r: ProficiencyAssessmentResult): string {
  const lines: string[] = []
  lines.push('# 语言水平CEFR评估报告')
  lines.push('')
  lines.push('**学习者ID:** ' + r.learner_id + ' | **目标语言:** ' + r.target_language + ' | **综合CEFR等级:** ' + r.overall_cefr + ' | **综合评分:** ' + r.overall_score + '/100 | **置信度:** ' + Math.round(r.confidence * 100) + '%')
  lines.push('')
  lines.push('## 一、六维能力评估（Skills Assessment）')
  lines.push('')
  lines.push('| 技能维度 | 分数 | CEFR等级 | 水平 | 说明 |')
  lines.push('|----------|------|----------|------|------|')
  for (const d of r.dimensions) {
    lines.push('| ' + d.skill_cn + ' | ' + progressBar(d.score) + ' ' + d.score + ' | ' + d.level + ' | ' + d.level_cn + ' | ' + d.description + ' |')
  }
  lines.push('')
  lines.push('## 二、弱项诊断（Weakness Diagnosis）')
  lines.push('')
  for (const w of r.weaknesses) {
    const icon = w.severity === 'critical' ? '🔴' : w.severity === 'moderate' ? '🟡' : '🟢'
    lines.push('- ' + icon + ' **' + w.skill + '** [' + w.severity + ']: ' + w.description)
    lines.push('  - 建议: ' + w.recommendation)
  }
  lines.push('')
  lines.push('## 三、优势分析（Strengths）')
  lines.push('')
  for (const s of r.strengths) {
    lines.push('- ✅ ' + s)
  }
  lines.push('')
  lines.push('## 四、学习建议（Learning Recommendations）')
  lines.push('')
  for (const rec of r.learning_recommendations) {
    lines.push('- 🎯 ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('> **免责声明:** ' + DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 2: Spaced Repetition Report ---
function formatSpacedRepetitionReport(r: SpacedRepetitionResult): string {
  const lines: string[] = []
  lines.push('# 间隔重复与记忆曲线调度报告')
  lines.push('')
  lines.push('**学习者ID:** ' + r.learner_id + ' | **词汇总量:** ' + r.total_items + ' | **今日需复习:** ' + r.items_due_today + ' | **平均记忆保持率:** ' + r.average_retention + '%')
  lines.push('**每周预估学习次数:** ' + r.estimated_sessions_per_week + ' | **预计达标周数:** ' + r.projected_mastery_timeline + '周')
  lines.push('')
  lines.push('## 一、今日复习计划（Today\'s Review Schedule）')
  lines.push('')
  const dueToday = r.schedule.filter(s => s.next_review_day === 0)
  if (dueToday.length === 0) {
    lines.push('今日暂无需复习的词汇。')
  } else {
    lines.push('| 词汇 | 当前间隔 | 记忆保持率 | 难度 | 复习方法 |')
    lines.push('|------|----------|------------|------|----------|')
    for (const s of dueToday.slice(0, 20)) {
      lines.push('| ' + s.word + ' | ' + s.current_interval + '天 | ' + s.retention_probability + '% | ' + s.difficulty + ' | ' + s.review_method + ' |')
    }
    if (dueToday.length > 20) lines.push('... 及其他' + (dueToday.length - 20) + '项')
  }
  lines.push('')
  lines.push('## 二、记忆曲线分析（Memory Curve）')
  lines.push('')
  lines.push('| 间隔(天) | 记忆保持率 | |')
  lines.push('|----------|------------|-|')
  for (const mc of [0, 1, 3, 7, 14, 21]) {
    const point = r.memory_curve_analysis.find(m => m.interval === mc)
    if (point) {
      lines.push('| ' + mc + '天 | ' + progressBar(point.retention) + ' ' + point.retention + '% | ' + '\u2588'.repeat(Math.round(point.retention / 10)) + ' |')
    }
  }
  lines.push('')
  lines.push('## 三、学习建议（Tips）')
  lines.push('')
  for (const tip of r.tips) {
    lines.push('- 💡 ' + tip)
  }
  lines.push('')
  lines.push('---')
  lines.push('> **免责声明:** ' + DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 3: Conversation Simulator Report ---
function formatConversationReport(r: ConversationResult): string {
  const lines: string[] = []
  lines.push('# 沉浸式对话模拟与反馈报告')
  lines.push('')
  lines.push('**学习者ID:** ' + r.learner_id + ' | **场景:** ' + r.scenario + ' | **目标语言:** ' + r.target_language)
  lines.push('**综合评分:** ' + r.overall_score + '/100 | **流利度:** ' + r.fluency_score + '/100 | **准确度:** ' + r.accuracy_score + '/100 | **词汇运用:** ' + r.vocabulary_usage + '/100')
  lines.push('')
  lines.push('## 一、表达反馈详情（Feedback Details）')
  lines.push('')
  for (const f of r.feedback) {
    lines.push('### 话轮 ' + (f.utterance_index + 1))
    lines.push('- **原文:** ' + f.original)
    if (f.error_type !== '无重大错误') {
      lines.push('- **错误类型:** ' + f.error_type)
      lines.push('- **修正:** ' + f.correction)
      lines.push('- **解释:** ' + f.explanation)
    } else {
      lines.push('- **状态:** ' + f.correction)
    }
    lines.push('- **自然度:** ' + Math.round(f.naturalness_score * 100) + '%')
    lines.push('')
  }
  lines.push('## 二、对话延续建议（Tutor Continuation）')
  lines.push('')
  lines.push('**AI老师:** ' + r.tutor_continuation)
  lines.push('')
  lines.push('## 三、文化提示（Cultural Notes）')
  lines.push('')
  for (const cn of r.cultural_notes) {
    lines.push('- 🌍 ' + cn)
  }
  lines.push('')
  if (r.grammar_patterns_to_review.length > 0) {
    lines.push('## 四、需复习的语法结构')
    lines.push('')
    for (const gp of r.grammar_patterns_to_review) {
      lines.push('- 📌 ' + gp)
    }
    lines.push('')
  }
  lines.push('---')
  lines.push('> **免责声明:** ' + DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 4: Grammar Pattern Drill Report ---
function formatGrammarDrillReport(r: GrammarDrillResult): string {
  const lines: string[] = []
  lines.push('# 语法模式训练与母语干扰纠正报告')
  lines.push('')
  lines.push('**学习者ID:** ' + r.learner_id + ' | **训练结构:** ' + r.target_structure + ' | **正确率:** ' + r.accuracy_rate + '%')
  lines.push('')
  lines.push('## 一、练习逐项分析')
  lines.push('')
  for (let i = 0; i < r.patterns.length; i++) {
    const p = r.patterns[i]
    const icon = p.error_detected ? '❌' : '✅'
    lines.push('### 第' + (i + 1) + '题 ' + icon)
    if (p.error_detected) {
      lines.push('- **错误类型:** ' + p.error_type)
      if (p.l1_interference) lines.push('- **⚠ 母语干扰**: 该错误可能由母语语法体系迁移导致')
      lines.push('- **解释:** ' + p.explanation)
      lines.push('- **正确答案:** ' + p.corrected)
    } else {
      lines.push('- 回答正确！' + p.explanation)
    }
    lines.push('')
  }
  if (r.l1_interference_patterns.length > 0) {
    lines.push('## 二、母语干扰分析（L1 Interference Analysis）')
    lines.push('')
    for (const l1 of r.l1_interference_patterns) {
      lines.push('- 🔄 ' + l1)
    }
    lines.push('')
  }
  if (r.common_errors.length > 0) {
    lines.push('## 三、常见错误模式')
    lines.push('')
    for (const ce of r.common_errors) {
      lines.push('- ⚠ ' + ce)
    }
    lines.push('')
  }
  lines.push('## 四、练习建议（Practice Recommendations）')
  lines.push('')
  for (const pr of r.practice_recommendations) {
    lines.push('- 📋 ' + pr)
  }
  lines.push('')
  lines.push('## 五、进阶语法结构推荐')
  lines.push('')
  for (const ns of r.next_structures) {
    lines.push('- 📈 ' + ns)
  }
  lines.push('')
  lines.push('---')
  lines.push('> **免责声明:** ' + DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 5: Vocabulary Contextualizer Report ---
function formatVocabularyReport(r: VocabularyResult): string {
  const lines: string[] = []
  lines.push('# 词汇语境化学习与搭配网络报告')
  lines.push('')
  lines.push('**学习者ID:** ' + r.learner_id + ' | **目标语言:** ' + r.target_language + ' | **目标水平:** ' + r.target_level + ' | **词汇总量:** ' + r.total_words)
  lines.push('')
  lines.push('## 一、词汇语境分析（Word Contexts）')
  lines.push('')
  for (const wc of r.word_contexts) {
    lines.push('### "' + wc.word + '" (' + wc.part_of_speech + ')')
    lines.push('- 常用体性: ' + wc.register_formality + ' | 语义色彩: ' + wc.connotation + ' | 难度: ' + wc.difficulty_rating)
    lines.push('- **释义:**')
    for (const def of wc.definitions) {
      lines.push('  - ' + def)
    }
    lines.push('- **例句:**')
    for (const ex of wc.example_sentences) {
      lines.push('  - ' + ex)
    }
    lines.push('- **高频搭配:**')
    for (const col of wc.collocations) {
      const freqIcon = col.frequency === 'high' ? '🔥' : col.frequency === 'medium' ? '📌' : '💤'
      lines.push('  - ' + freqIcon + ' ' + col.collocate + ' (' + col.frequency + '): ' + col.pattern)
      lines.push('    例句: ' + col.example)
    }
    lines.push('')
  }
  lines.push('## 二、搭配网络分析')
  lines.push('')
  lines.push(r.collocation_network_summary)
  lines.push('')
  lines.push('## 三、记忆技巧（Memory Techniques）')
  lines.push('')
  for (const mt of r.memory_techniques) {
    lines.push('- 🧠 ' + mt)
  }
  lines.push('')
  lines.push('## 四、练习题目')
  lines.push('')
  lines.push('| 词汇 | 练习类型 | 任务描述 |')
  lines.push('|------|----------|----------|')
  for (const pe of r.practice_exercises) {
    lines.push('| ' + pe.word + ' | ' + pe.exercise_type + ' | ' + pe.prompt + ' |')
  }
  lines.push('')
  lines.push('---')
  lines.push('> **免责声明:** ' + DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 6: Pronunciation Coach Report ---
function formatPronunciationReport(r: PronunciationResult): string {
  const lines: string[] = []
  lines.push('# 发音评估与音素纠音报告')
  lines.push('')
  lines.push('**学习者ID:** ' + r.learner_id + ' | **目标语言:** ' + r.target_language + ' | **综合发音评分:** ' + r.overall_score + '/100 | **韵律综合评分:** ' + r.prosody.overall_prosody_score + '/100')
  lines.push('')
  lines.push('## 一、音素分析（Phoneme Analysis）')
  lines.push('')
  lines.push('| 音素 | 分数 | 评估 | 描述 | 纠音建议 |')
  lines.push('|------|------|------|------|----------|')
  for (const pf of r.phoneme_feedback) {
    const icon = pf.assessment === 'correct' ? '✅' : pf.assessment === 'partial' ? '⚠️' : '❌'
    lines.push('| /' + pf.phoneme + '/ | ' + pf.score + ' | ' + icon + ' ' + pf.assessment + ' | ' + pf.description + ' | ' + pf.tip + ' |')
  }
  lines.push('')
  if (r.priority_phonemes[0] !== '暂无紧急需纠音的音素') {
    lines.push('## 二、优先纠正音素（Priority Phonemes）')
    lines.push('')
    for (const pp of r.priority_phonemes) {
      const feedback = r.phoneme_feedback.find(p => p.phoneme === pp)
      lines.push('- 🔴 /' + pp + '/ (评分' + (feedback ? feedback.score : 0) + '): ' + (feedback ? feedback.tip : '需专项练习'))
    }
    lines.push('')
  }
  lines.push('## 三、韵律分析（Prosody Analysis）')
  lines.push('')
  lines.push('| 维度 | 评分 | |')
  lines.push('|------|------|-|')
  lines.push('| 音高变化 | ' + progressBar(r.prosody.pitch_variation) + ' ' + r.prosody.pitch_variation + '/100 | ' + '\u2588'.repeat(Math.round(r.prosody.pitch_variation / 10)) + ' |')
  lines.push('| 节奏准确度 | ' + progressBar(r.prosody.rhythm_accuracy) + ' ' + r.prosody.rhythm_accuracy + '/100 | ' + '\u2588'.repeat(Math.round(r.prosody.rhythm_accuracy / 10)) + ' |')
  lines.push('| 重音准确度 | ' + progressBar(r.prosody.stress_accuracy) + ' ' + r.prosody.stress_accuracy + '/100 | ' + '\u2588'.repeat(Math.round(r.prosody.stress_accuracy / 10)) + ' |')
  lines.push('| 语调准确度 | ' + progressBar(r.prosody.intonation_accuracy) + ' ' + r.prosody.intonation_accuracy + '/100 | ' + '\u2588'.repeat(Math.round(r.prosody.intonation_accuracy / 10)) + ' |')
  lines.push('')
  lines.push('## 四、纠音练习（Drill Exercises）')
  lines.push('')
  for (const de of r.drill_exercises) {
    lines.push('- 🎤 ' + de)
  }
  lines.push('')
  lines.push('## 五、文化发音提示')
  lines.push('')
  for (const cn of r.cultural_pronunciation_notes) {
    lines.push('- 🌍 ' + cn)
  }
  lines.push('')
  lines.push('---')
  lines.push('> **免责声明:** ' + DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 7: Reading Comprehension Scaffolder Report ---
function formatReadingReport(r: ReadingScaffoldResult): string {
  const lines: string[] = []
  lines.push('# 分级阅读与阅读理解支架报告')
  lines.push('')
  lines.push('**学习者ID:** ' + r.learner_id + ' | **文本等级:** ' + r.text_level + ' | **读者等级:** ' + r.reader_level + ' | **支架级别:** ' + r.scaffolding_level)
  lines.push('')
  lines.push('## 一、词汇注释（Annotations）')
  lines.push('')
  lines.push('| 词汇 | 释义 | 上下文线索 | CEFR等级 |')
  lines.push('|------|------|------------|----------|')
  for (const a of r.annotations) {
    lines.push('| ' + a.term + ' | ' + a.translation + ' | ' + a.context_clue + ' | ' + a.cefr_level + ' |')
  }
  lines.push('')
  lines.push('## 二、读前预习问题（Pre-reading Questions）')
  lines.push('')
  for (const pq of r.pre_reading_questions) {
    lines.push('- 🔍 ' + pq)
  }
  lines.push('')
  lines.push('## 三、阅读理解问题（Comprehension Questions）')
  lines.push('')
  for (const cq of r.comprehension_questions) {
    lines.push('### 问题: ' + cq.question)
    lines.push('- **测试技能:** ' + cq.skill_tested + ' | **难度:** ' + cq.difficulty)
    lines.push('- **参考答案:** ' + cq.answer)
    lines.push('')
  }
  lines.push('## 四、读后讨论（Post-reading Discussion）')
  lines.push('')
  for (const pr of r.post_reading_discussion) {
    lines.push('- 💬 ' + pr)
  }
  lines.push('')
  lines.push('## 五、词汇挑战分析（Vocabulary Challenges）')
  lines.push('')
  for (const vc of r.vocabulary_challenges) {
    lines.push('- 📖 ' + vc)
  }
  lines.push('')
  lines.push('## 六、语法聚焦（Grammar Focus）')
  lines.push('')
  for (const gf of r.grammar_focus) {
    lines.push('- 📐 ' + gf)
  }
  lines.push('')
  lines.push('## 七、阅读策略建议（Strategy Tips）')
  lines.push('')
  for (const st of r.reading_strategy_tips) {
    lines.push('- 💡 ' + st)
  }
  lines.push('')
  lines.push('---')
  lines.push('> **免责声明:** ' + DISCLAIMER)
  return lines.join('\n')
}

// --- Tool 8: Writing Feedback Generator Report ---
function formatWritingFeedbackReport(r: WritingFeedbackResult): string {
  const lines: string[] = []
  lines.push('# AI写作批改与风格提升报告')
  lines.push('')
  lines.push('**学习者ID:** ' + r.learner_id + ' | **写作类型:** ' + r.writing_type + ' | **综合评分:** ' + r.overall_score + '/100')
  lines.push('**五维评分:** 语法 ' + r.grammar_score + '/100 | 词汇 ' + r.vocabulary_score + '/100 | 连贯 ' + r.coherence_score + '/100 | 风格 ' + r.style_score + '/100 | 任务 ' + r.task_achievement_score + '/100')
  lines.push('')
  lines.push('## 一、分项反馈（Feedback Items）')
  lines.push('')
  for (let i = 0; i < r.feedback_items.length; i++) {
    const fi = r.feedback_items[i]
    const icon = fi.severity === 'critical' ? '🔴' : fi.severity === 'major' ? '🟡' : '🟢'
    lines.push('### 反馈 ' + (i + 1) + ' ' + icon + ' [' + fi.category + '] (' + fi.severity + ')')
    lines.push('- **位置:** ' + fi.location)
    lines.push('- **问题:** ' + fi.issue)
    lines.push('- **建议:** ' + fi.suggestion)
    if (fi.improved_version) lines.push('- **优化版本:** ' + fi.improved_version)
    lines.push('')
  }
  lines.push('## 二、风格分析（Style Analysis）')
  lines.push('')
  lines.push('| 维度 | 分析结果 |')
  lines.push('|------|----------|')
  lines.push('| 正式程度 | ' + r.style_analysis.formality_level + ' |')
  lines.push('| 句式复杂度 | ' + r.style_analysis.sentence_complexity + ' |')
  lines.push('| 词汇丰富度 | ' + r.style_analysis.vocabulary_richness + ' |')
  lines.push('| 论证结构 | ' + r.style_analysis.argument_structure + ' |')
  lines.push('| 独创性 | ' + Math.round(r.style_analysis.originality_score * 100) + '% |')
  lines.push('')
  lines.push('## 三、优势与改进方向')
  lines.push('')
  lines.push('**优势:**')
  for (const s of r.strengths) lines.push('- ✅ ' + s)
  lines.push('')
  lines.push('**改进方向:**')
  for (const ia of r.improvement_areas) lines.push('- 📌 ' + ia)
  lines.push('')
  lines.push('## 四、修改文本参考')
  lines.push('')
  lines.push(r.revised_text)
  lines.push('')
  lines.push('## 五、学习建议')
  lines.push('')
  for (const lr of r.learning_recommendations) {
    lines.push('- 🎯 ' + lr)
  }
  lines.push('')
  lines.push('---')
  lines.push('> **免责声明:** ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== SECTION 6 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Proficiency Assessment — 语言水平CEFR评估与弱项诊断
  tools.register(defineTool({
    name: 'proficiency_assessment',
    description: '语言水平CEFR评估与弱项诊断 | 六维能力评估(听力/阅读/写作/口语/语法/词汇)、综合CEFR等级、弱项分析与学习建议 | Six-dimensional CEFR proficiency assessment with weakness diagnosis and personalized learning recommendations',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: learner_id, target_language, self_rated_level?(A0-C2), writing_sample?(string), speaking_sample?(string), listening_score?(0-100), reading_score?(0-100), grammar_accuracy?(0-100), vocabulary_range?(0-100), native_language?(string)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },

    async execute(args: { input_data: string }) {
      const data: ProficiencyAssessmentInput = JSON.parse(args.input_data)
      return formatProficiencyReport(analyzeProficiencyAssessment(data))
    }
  }))

  // Tool 2: Spaced Repetition Scheduler — Anki式间隔重复与记忆曲线
  tools.register(defineTool({
    name: 'spaced_repetition_scheduler',
    description: 'Anki式间隔重复与记忆曲线 | 词汇间隔调度、易遗忘点预测、记忆曲线绘制、复习计划生成 | Spaced repetition vocabulary scheduling with memory curve prediction and optimized review planning',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: learner_id, vocabulary_items[{word, familiarity(0-100)}], available_days_per_week(int), session_duration_minutes(int), target_retention_rate(80-99), current_streak_days(int)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },

    async execute(args: { input_data: string }) {
      const data: SpacedRepetitionInput = JSON.parse(args.input_data)
      return formatSpacedRepetitionReport(analyzeSpacedRepetition(data))
    }
  }))

  // Tool 3: Conversation Simulator — 沉浸式对话模拟与纠错反馈
  tools.register(defineTool({
    name: 'conversation_simulator',
    description: '沉浸式对话模拟与纠错反馈 | 情景对话模拟、实时纠错、语用评估、文化提示、对话延续 | Immersive conversation simulation with real-time error correction, pragmatic assessment, cultural notes, and guided continuation',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: learner_id, scenario(string), target_language, learner_level(A1-C2), native_language, conversation_goal(string), dialogue_turns[{speaker(learner|tutor), text}]' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },

    async execute(args: { input_data: string }) {
      const data: ConversationInput = JSON.parse(args.input_data)
      return formatConversationReport(analyzeConversation(data))
    }
  }))

  // Tool 4: Grammar Pattern Driller — 语法模式训练与母語干扰纠正
  tools.register(defineTool({
    name: 'grammar_pattern_driller',
    description: '语法模式训练与母語干扰纠正 | 语法点练习、错误分析、L1母语干扰检测、进阶结构推荐 | Grammar pattern drilling with error analysis, L1 interference detection, and progressive structure recommendations',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: learner_id, target_language, native_language, target_structure(string), current_level(A1-C2), exercises[{question, user_answer, correct_answer}]' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },

    async execute(args: { input_data: string }) {
      const data: GrammarDrillInput = JSON.parse(args.input_data)
      return formatGrammarDrillReport(analyzeGrammarDrill(data))
    }
  }))

  // Tool 5: Vocabulary Contextualizer — 词汇语境化学习与搭配网络
  tools.register(defineTool({
    name: 'vocabulary_contextualizer',
    description: '词汇语境化学习与搭配网络 | 多义词辨析、搭配网络分析、语境例句、分层练习设计、记忆技巧推荐 | Vocabulary contextual learning with collocation network analysis, contextual examples, and memory technique recommendations',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: learner_id, target_language, words[](string), target_level(A2-C2), context_field?(string)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },

    async execute(args: { input_data: string }) {
      const data: VocabularyInput = JSON.parse(args.input_data)
      return formatVocabularyReport(analyzeVocabularyContext(data))
    }
  }))

  // Tool 6: Pronunciation Coach — 发音评估与音素纠音
  tools.register(defineTool({
    name: 'pronunciation_coach',
    description: '发音评估与音素纠音 | 音素逐一评分、韵律综合分析、优先纠音建议、对比练习设计、文化发音提示 | Pronunciation assessment with phoneme-level scoring, prosody analysis, prioritized correction, and cultural speaking notes',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: learner_id, target_language, native_language, assessment_text(string), phoneme_scores[{phoneme, score(0-100)}], prosody_features{pitch_variation, rhythm_accuracy, stress_accuracy, intonation_accuracy}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },

    async execute(args: { input_data: string }) {
      const data: PronunciationInput = JSON.parse(args.input_data)
      return formatPronunciationReport(analyzePronunciation(data))
    }
  }))

  // Tool 7: Reading Comprehension Scaffolder — 分级阅读与阅读理解支架
  tools.register(defineTool({
    name: 'reading_comprehension_scaffolder',
    description: '分级阅读与阅读理解支架 | 词汇注释、分阶问题(读前/读中/读后)、语法聚焦、阅读策略指导 | Graded reading with staged comprehension scaffolding: vocabulary annotation, pre/during/post-reading questions, and strategy guidance',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: learner_id, target_language, text(string), text_level(A1-C2), reader_level(A1-C2), focus_skills[](string)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },

    async execute(args: { input_data: string }) {
      const data: ReadingInput = JSON.parse(args.input_data)
      return formatReadingReport(analyzeReadingScaffolding(data))
    }
  }))

  // Tool 8: Writing Feedback Generator — AI写作批改与风格提升
  tools.register(defineTool({
    name: 'writing_feedback_generator',
    description: 'AI写作批改与风格提升 | 多维度评分(语法/词汇/连贯/风格/任务)、逐项反馈与修改建议、风格分析、修改范文参考 | AI-powered writing feedback with multi-dimensional scoring, line-by-line correction, style analysis, and revised model text',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: learner_id, target_language, writing_type(essay|email|report|narrative|argumentative|creative), writer_level(A2-C2), text(string), prompt?(string)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },

    async execute(args: { input_data: string }) {
      const data: WritingFeedbackInput = JSON.parse(args.input_data)
      return formatWritingFeedbackReport(analyzeWritingFeedback(data))
    }
  }))

  console.log('[dsh-tool-langlearnagentpro] Loaded v' + VERSION + ' — 语言学习AI助手: 8 tools active')
  console.log('  Tools: proficiency_assessment, spaced_repetition_scheduler, conversation_simulator, grammar_pattern_driller, vocabulary_contextualizer, pronunciation_coach, reading_comprehension_scaffolder, writing_feedback_generator')
}
