/**
 * DSH AI Education & Personalized Learning Plugin v0.1.0
 *
 * AI-powered education toolkit for DeepSeek Harness Agent.
 * Designed for learners, educators, instructional designers, and EdTech analysts.
 *
 * Features (v0.1.0):
 * - Adaptive Learning Path Generator (personalized learning sequences)
 * - Knowledge Assessment Engine (comprehensive knowledge evaluation)
 * - Content Recommendation System (AI-driven content suggestions)
 * - Progress Tracking Analyzer (learning progress monitoring and insights)
 * - Skill Gap Identifier (competency gap analysis and recommendations)
 * - Learning Style Detector (VARK model and cognitive preference analysis)
 * - Engagement Optimization (learner engagement enhancement strategies)
 * - Certification Prep Planner (certification study planning and scheduling)
 *
 * @module dsh-tool-learnedu
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-learnedu'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1: Seeded Random (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash) || 1
}

function seededRng(input: string): () => number {
  return mulberry32(hashString(JSON.stringify(input)))
}

function clamp(value: number, minVal: number, maxVal: number): number {
  return Math.min(Math.max(value, minVal), maxVal)
}

// ==================== SECTION 2: Type Definitions ====================

// --- Tool 1: Adaptive Learning Path Generator ---

export interface LearnerProfile {
  current_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  goals: string[]
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing'
  available_time_hours_per_week: number
  strengths: string[]
  weaknesses: string[]
  prior_knowledge: string[]
}

export interface LearningPathStep {
  step: number
  topic: string
  activity: string
  estimated_hours: number
  resources: string[]
  difficulty_level: 'foundational' | 'intermediate' | 'advanced' | 'mastery'
  assessment_type: string
}

export interface Milestone {
  milestone: string
  criteria: string
  estimated_week: number
  validation_method: string
}

export interface AdaptiveLearningPathResult {
  recommended_sequence: LearningPathStep[]
  milestones: Milestone[]
  estimated_completion_weeks: number
  adaptive_adjustments: string[]
  difficulty_progression: string[]
  personalization_factors: string[]
}

// --- Tool 2: Knowledge Assessment Engine ---

export interface AssessmentQuestion {
  id: number
  question: string
  type: 'multiple_choice' | 'short_answer' | 'true_false' | 'essay'
  options?: string[]
  correct_answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  bloom_level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
  topic: string
  points: number
}

export interface KnowledgeAssessmentResult {
  questions: AssessmentQuestion[]
  total_points: number
  estimated_time_minutes: number
  topic_coverage: string[]
  bloom_distribution: Record<string, number>
  difficulty_distribution: Record<string, number>
  instructions: string
  rubric: string
}

// --- Tool 3: Content Recommendation System ---

export interface ContentItem {
  id: string
  title: string
  type: 'video' | 'article' | 'interactive' | 'quiz' | 'project' | 'podcast'
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  rating: number
  url?: string
}

export interface ContentRecommendationResult {
  recommendations: Array<{
    content: ContentItem
    relevance_score: number
    reason: string
    priority: number
  }>
  learning_path_alignment: string[]
  diversity_score: number
  difficulty_match: string
  estimated_total_time: number
}

// --- Tool 4: Progress Tracking Analyzer ---

export interface ProgressDataPoint {
  date: string
  topic: string
  score: number
  time_spent_minutes: number
  completion_status: 'completed' | 'in_progress' | 'not_started'
  engagement_level: 'high' | 'medium' | 'low'
}

export interface ProgressTrackingResult {
  overall_progress_pct: number
  topics_mastered: string[]
  topics_in_progress: string[]
  topics_not_started: string[]
  average_score: number
  total_time_spent_hours: number
  learning_velocity: number
  trend_analysis: 'improving' | 'stable' | 'declining'
  strengths_identified: string[]
  areas_for_improvement: string[]
  projected_completion_date: string
  recommendations: string[]
}

// --- Tool 5: Skill Gap Identifier ---

export interface SkillAssessment {
  skill: string
  current_level: number
  required_level: number
  category: 'technical' | 'soft_skill' | 'domain' | 'tool' | 'methodology'
  importance: 'critical' | 'important' | 'nice_to_have'
}

export interface SkillGapResult {
  gaps: Array<{
    skill: string
    current_level: number
    required_level: number
    gap_size: number
    gap_severity: 'critical' | 'significant' | 'moderate' | 'minor'
    category: string
    importance: string
    estimated_hours_to_close: number
  }>
  overall_readiness_pct: number
  critical_gaps: string[]
  quick_wins: string[]
  learning_priority_order: string[]
  resource_recommendations: Array<{
    skill: string
    resources: string[]
  }>
}

// --- Tool 6: Learning Style Detector ---

export interface LearningStyleInput {
  visual_score: number
  auditory_score: number
  kinesthetic_score: number
  reading_writing_score: number
  preferences?: string[]
  study_habits?: string[]
}

export interface LearningStyleResult {
  primary_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing'
  secondary_style: string
  style_distribution: Record<string, number>
  learning_profile: string
  recommended_strategies: string[]
  content_format_preferences: string[]
  study_environment_tips: string[]
  collaboration_preferences: string[]
}

// --- Tool 7: Engagement Optimizer ---

export interface EngagementData {
  login_frequency_per_week: number
  avg_session_duration_minutes: number
  content_completion_rate: number
  interaction_rate: number
  assignment_submission_rate: number
  discussion_participation: number
  time_on_task_minutes: number
  distraction_incidents: number
}

export interface EngagementOptimizerResult {
  current_engagement_score: number
  engagement_level: 'highly_engaged' | 'engaged' | 'moderately_engaged' | 'disengaged' | 'at_risk'
  risk_factors: string[]
  optimization_strategies: Array<{
    strategy: string
    expected_impact: string
    implementation_difficulty: 'easy' | 'medium' | 'hard'
    category: string
  }>
  gamification_recommendations: string[]
  personalization_tweaks: string[]
  projected_improvement: number
  action_plan: string[]
}

// --- Tool 8: Certification Prep Planner ---

export interface CertificationGoal {
  certification_name: string
  target_date: string
  current_readiness: number
  domains: string[]
  weak_areas: string[]
  study_hours_available_per_week: number
}

export interface CertificationPrepResult {
  study_plan: Array<{
    week: number
    focus_areas: string[]
    study_hours: number
    activities: string[]
    resources: string[]
    practice_exams: boolean
  }>
  total_weeks: number
  weekly_hour_commitment: number
  domain_coverage_plan: Array<{
    domain: string
    priority: 'high' | 'medium' | 'low'
    allocated_hours: number
    mastery_target: number
  }>
  practice_exam_schedule: string[]
  key_milestones: string[]
  readiness_projection: number
  risk_mitigation: string[]
}

// ==================== SECTION 3: Tool Implementations ====================

// --- Tool 1: Adaptive Learning Path Generator ---

function generateAdaptiveLearningPath(profile: LearnerProfile, rng: () => number): AdaptiveLearningPathResult {
  const sequence: LearningPathStep[] = []
  const milestones: Milestone[] = []
  const adjustments: string[] = []
  const difficultyProgression: string[] = []
  const personalizationFactors: string[] = []

  const totalHours = profile.available_time_hours_per_week
  const styleLabel = profile.learning_style.replace('_', '/')

  personalizationFactors.push('Learning style: ' + styleLabel + ' - pathways adapted accordingly')
  personalizationFactors.push('Current level: ' + profile.current_level + ' - content calibrated to prior knowledge')
  personalizationFactors.push('Available time: ' + totalHours + ' hours/week - paced for sustainable progress')

  const weeksEstimate = Math.max(4, Math.ceil(profile.goals.length * 3 + profile.weaknesses.length * 2))

  adjustments.push('Adaptive checkpoint: After each milestone, difficulty adjusts based on performance')
  adjustments.push('Reassessment trigger: If formative score < 70%, pathway inserts remedial module')
  adjustments.push('Acceleration option: If assessment scores > 90%, skip redundant content')

  const difficultyLevels: Array<LearningPathStep['difficulty_level']> = ['foundational', 'intermediate', 'advanced', 'mastery']

  const totalSteps = Math.min(12, Math.max(4, profile.goals.length * 2 + profile.weaknesses.length))

  for (let i = 1; i <= totalSteps; i++) {
    const progressRatio = i / totalSteps
    const difficultyIdx = Math.min(3, Math.floor(progressRatio * 4))
    const difficulty = difficultyLevels[difficultyIdx]

    const isPriority = profile.weaknesses.length > 0 && i <= profile.weaknesses.length
    const topic = isPriority
      ? profile.weaknesses[i - 1]
      : profile.goals[(i - 1) % profile.goals.length]

    const styleActivities: Record<string, string> = {
      visual: 'Watch video demonstrations; create concept maps and diagrams; use color-coded notes',
      auditory: 'Listen to lecture podcasts; participate in discussion groups; explain concepts aloud',
      kinesthetic: 'Complete hands-on labs and interactive simulations; build physical models',
      reading_writing: 'Read assigned chapters; write reflective summaries and detailed notes'
    }

    const assessmentTypes = ['Formative quiz', 'Peer discussion', 'Practice project', 'Self-assessment', 'Portfolio review']

    sequence.push({
      step: i,
      topic: isPriority ? 'Priority: ' + topic : 'Step ' + i + ': ' + topic,
      activity: styleActivities[profile.learning_style] ?? styleActivities.visual,
      estimated_hours: Math.max(1, Math.round(totalHours / 3)),
      resources: [
        styleLabel + '-optimized content for ' + topic,
        'Formative assessment checkpoint',
        isPriority ? 'Supplementary practice materials' : 'Extension activities',
        'Interactive exercises and feedback'
      ],
      difficulty_level: difficulty,
      assessment_type: assessmentTypes[i % assessmentTypes.length]
    })

    difficultyProgression.push('Week ' + i + ': ' + difficulty)
  }

  const milestoneInterval = Math.max(1, Math.floor(sequence.length / 3))
  const milestoneNames = ['Foundation Building', 'Core Integration', 'Mastery Demonstration']
  const milestoneCriteria = [
    'Complete steps 1-' + milestoneInterval + ' with >= 80% formative assessment score',
    'Complete steps ' + (milestoneInterval + 1) + '-' + (milestoneInterval * 2) + ' with >= 85% application tasks',
    'Complete all steps with >= 90% comprehensive evaluation'
  ]
  const validationMethods = ['Diagnostic assessment + portfolio review', 'Practical project + peer evaluation', 'Capstone project + self-reflection']

  for (let i = 0; i < 3; i++) {
    const milestoneStep = Math.min(sequence.length, (i + 1) * milestoneInterval)
    milestones.push({
      milestone: milestoneNames[i],
      criteria: milestoneCriteria[i],
      estimated_week: Math.ceil(milestoneStep * totalHours / profile.available_time_hours_per_week),
      validation_method: validationMethods[i]
    })
  }

  if (profile.weaknesses.length > 0) {
    adjustments.push('Weak areas identified: ' + profile.weaknesses.join(', ') + ' - priority modules assigned')
  }
  if (profile.strengths.length > 0) {
    adjustments.push('Strengths to leverage: ' + profile.strengths.join(', ') + ' - used as scaffolding for new concepts')
  }

  return {
    recommended_sequence: sequence,
    milestones,
    estimated_completion_weeks: weeksEstimate,
    adaptive_adjustments: adjustments,
    difficulty_progression: difficultyProgression,
    personalization_factors: personalizationFactors
  }
}

function formatAdaptiveLearningPathReport(result: AdaptiveLearningPathResult): string {
  const lines: string[] = []
  lines.push('# Adaptive Learning Path')
  lines.push('')
  lines.push('**Estimated Completion:** ' + result.estimated_completion_weeks + ' weeks')
  lines.push('')

  lines.push('## Learning Sequence')
  lines.push('| Step | Topic | Activity | Hours | Difficulty | Assessment |')
  lines.push('|------|-------|----------|-------|------------|------------|')
  for (const step of result.recommended_sequence) {
    lines.push('| ' + step.step + ' | ' + step.topic + ' | ' + step.activity.substring(0, 35) + '... | ' + step.estimated_hours + 'h | ' + step.difficulty_level + ' | ' + step.assessment_type + ' |')
  }
  lines.push('')

  lines.push('## Milestones')
  lines.push('| Milestone | Criteria | Est. Week | Validation |')
  lines.push('|-----------|----------|-----------|------------|')
  for (const m of result.milestones) {
    lines.push('| ' + m.milestone + ' | ' + m.criteria.substring(0, 45) + '... | Week ' + m.estimated_week + ' | ' + m.validation_method + ' |')
  }
  lines.push('')

  lines.push('## Difficulty Progression')
  for (const dp of result.difficulty_progression) {
    lines.push('- ' + dp)
  }
  lines.push('')

  lines.push('## Adaptive Adjustments')
  for (const adj of result.adaptive_adjustments) {
    lines.push('- ' + adj)
  }
  lines.push('')

  lines.push('## Personalization Factors')
  for (const pf of result.personalization_factors) {
    lines.push('- ' + pf)
  }

  return lines.join('\n')
}

// --- Tool 2: Knowledge Assessment Engine ---

function generateKnowledgeAssessment(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  questionTypes: string[],
  numQuestions: number,
  rng: () => number
): KnowledgeAssessmentResult {
  const questions: AssessmentQuestion[] = []
  const selectedTypes = questionTypes.length > 0 ? questionTypes : ['multiple_choice', 'short_answer']

  const bloomLevels: Record<string, KnowledgeAssessmentResult['questions'][0]['bloom_level'][]> = {
    easy: ['remember', 'understand'],
    medium: ['understand', 'apply'],
    hard: ['apply', 'analyze', 'evaluate', 'create']
  }
  const levels = bloomLevels[difficulty] ?? ['understand', 'apply']

  const pointsMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 }
  const pointsPerQ = pointsMap[difficulty] ?? 2

  const bloomDistribution: Record<string, number> = {}
  const difficultyDistribution: Record<string, number> = { easy: 0, medium: 0, hard: 0 }

  for (let i = 0; i < numQuestions; i++) {
    const type = selectedTypes[i % selectedTypes.length] as AssessmentQuestion['type']
    const bloom = levels[i % levels.length]
    const isHarder = i > numQuestions / 2
    const actualDifficulty: AssessmentQuestion['difficulty'] = isHarder
      ? (difficulty === 'easy' ? 'medium' : 'hard')
      : difficulty

    const points = isHarder ? pointsPerQ + 1 : pointsPerQ

    bloomDistribution[bloom] = (bloomDistribution[bloom] ?? 0) + 1
    difficultyDistribution[actualDifficulty] = (difficultyDistribution[actualDifficulty] ?? 0) + 1

    questions.push({
      id: i + 1,
      question: generateQuestionText(topic, type, bloom, i + 1, rng),
      type,
      options: type === 'multiple_choice'
        ? ['Option A: ' + generateOptionText(topic, 'A', rng), 'Option B: ' + generateOptionText(topic, 'B', rng), 'Option C: ' + generateOptionText(topic, 'C', rng), 'Option D: ' + generateOptionText(topic, 'D', rng)]
        : undefined,
      correct_answer: type === 'multiple_choice' ? 'Option A' : '[Expected answer for ' + bloom + ' level: ' + topic + ']',
      difficulty: actualDifficulty,
      bloom_level: bloom,
      topic,
      points
    })
  }

  const totalPoints = questions.reduce((s, q) => s + q.points, 0)
  const timePerQuestion = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6

  return {
    questions,
    total_points: totalPoints,
    estimated_time_minutes: numQuestions * timePerQuestion,
    topic_coverage: [topic],
    bloom_distribution: bloomDistribution,
    difficulty_distribution: difficultyDistribution,
    instructions: 'Complete all ' + numQuestions + ' questions. Total: ' + totalPoints + ' points. Time: ' + (numQuestions * timePerQuestion) + ' minutes.',
    rubric: generateRubric(selectedTypes, difficulty)
  }
}

function generateQuestionText(topic: string, type: string, bloom: string, idx: number, _rng: () => number): string {
  const templates: Record<string, Record<string, string>> = {
    multiple_choice: {
      remember: 'Q' + idx + ': Which of the following best defines a key concept in ' + topic + '?',
      understand: 'Q' + idx + ': Based on your understanding of ' + topic + ', which statement is correct?',
      apply: 'Q' + idx + ': Given a scenario involving ' + topic + ', which approach would you apply?',
      analyze: 'Q' + idx + ': When analyzing ' + topic + ', which factor most significantly influences the outcome?',
      evaluate: 'Q' + idx + ': Which evaluation of ' + topic + ' demonstrates the most critical thinking?',
      create: 'Q' + idx + ': Design a solution for a problem in ' + topic + ' using which combination of elements?'
    },
    short_answer: {
      remember: 'Q' + idx + ': List the main components of ' + topic + '.',
      understand: 'Q' + idx + ': Explain the relationship between key concepts in ' + topic + '.',
      apply: 'Q' + idx + ': Describe how you would apply ' + topic + ' principles in a real-world context.',
      analyze: 'Q' + idx + ': Compare and contrast two approaches within ' + topic + '.',
      evaluate: 'Q' + idx + ': Critique the following statement about ' + topic + ' and justify your position.',
      create: 'Q' + idx + ': Propose an original framework for understanding ' + topic + '.'
    },
    true_false: {
      remember: 'Q' + idx + ': True or False - [Statement about basic ' + topic + ' concept]',
      understand: 'Q' + idx + ': True or False - [Statement testing comprehension of ' + topic + ']',
      apply: 'Q' + idx + ': True or False - [Statement about application of ' + topic + ']',
      analyze: 'Q' + idx + ': True or False - [Statement requiring analysis of ' + topic + ']',
      evaluate: 'Q' + idx + ': True or False - [Statement evaluating a claim about ' + topic + ']',
      create: 'Q' + idx + ': True or False - [Statement about synthesizing ' + topic + ' knowledge]'
    },
    essay: {
      remember: 'Q' + idx + ': Describe in detail the fundamental principles of ' + topic + '.',
      understand: 'Q' + idx + ': Discuss the significance of ' + topic + ' in its broader context.',
      apply: 'Q' + idx + ': Demonstrate how ' + topic + ' concepts solve practical problems.',
      analyze: 'Q' + idx + ': Deconstruct ' + topic + ' and examine its constituent parts.',
      evaluate: 'Q' + idx + ': Assess the strengths and weaknesses of current ' + topic + ' approaches.',
      create: 'Q' + idx + ': Develop an innovative approach to ' + topic + ' and defend its merit.'
    }
  }

  return (templates[type] ?? templates.short_answer)[bloom] ?? ('Q' + idx + ': [' + bloom + '] question about ' + topic)
}

function generateOptionText(topic: string, option: string, _rng: () => number): string {
  const prefixes: Record<string, string> = {
    A: 'The primary',
    B: 'A secondary',
    C: 'An alternative',
    'D': 'A comprehensive'
  }
  return (prefixes[option] ?? 'A') + ' aspect of ' + topic
}

function generateRubric(types: string[], difficulty: string): string {
  return 'Rubric (' + difficulty.toUpperCase() + '):\n- Multiple Choice: Select the best answer (exact match required)\n- Short Answer: 0=Incorrect, 1=Partially correct, 2=Correct with explanation, 3=Critical insight shown\n- True/False: Correct identification + justification required for full credit\n- Essay: Content (40%), Organization (20%), Evidence (20%), Convention (20%)\n\nGrading Scale: A (90-100%), B (80-89%), C (70-79%), D (60-69%), F (<60%)'
}

function formatKnowledgeAssessmentReport(result: KnowledgeAssessmentResult): string {
  const lines: string[] = []
  lines.push('# Knowledge Assessment')
  lines.push('')
  lines.push('**Topic:** ' + result.topic_coverage.join(', ') + ' | **Difficulty:** ' + Object.keys(result.difficulty_distribution).join(', '))
  lines.push('**Time:** ' + result.estimated_time_minutes + ' minutes | **Total Points:** ' + result.total_points)
  lines.push('')
  lines.push('**Instructions:** ' + result.instructions)
  lines.push('')

  lines.push('### Questions')
  for (const q of result.questions) {
    lines.push('**' + q.id + '.** [' + q.type.replace('_', ' ').toUpperCase() + '] (' + q.points + 'pts, ' + q.bloom_level + ') ' + q.question)
    if (q.options) {
      lines.push('   ' + q.options.join('   '))
    }
    lines.push('')
  }

  lines.push('### Answer Key')
  for (const q of result.questions) {
    lines.push(q.id + '. ' + q.correct_answer)
  }
  lines.push('')

  lines.push('### Rubric')
  lines.push(result.rubric)

  return lines.join('\n')
}

// --- Tool 3: Content Recommendation System ---

function recommendContent(
  profile: LearnerProfile,
  availableContent: ContentItem[],
  rng: () => number
): ContentRecommendationResult {
  const recommendations: ContentRecommendationResult['recommendations'] = []
  const pathAlignment: string[] = []

  const styleFormatMap: Record<string, ContentItem['type'][]> = {
    visual: ['video', 'interactive', 'article'],
    auditory: ['podcast', 'video'],
    kinesthetic: ['interactive', 'project', 'quiz'],
    reading_writing: ['article', 'quiz', 'project']
  }

  const preferredFormats = styleFormatMap[profile.learning_style] ?? ['video', 'article']

  for (const content of availableContent) {
    let relevanceScore = 50

    if (profile.goals.some(g => content.topic.toLowerCase().includes(g.toLowerCase()))) {
      relevanceScore += 25
      pathAlignment.push('Content "' + content.title + '" aligns with goal: ' + content.topic)
    }

    if (profile.weaknesses.some(w => content.topic.toLowerCase().includes(w.toLowerCase()))) {
      relevanceScore += 20
      pathAlignment.push('Content "' + content.title + '" addresses weakness: ' + content.topic)
    }

    if (preferredFormats.includes(content.type)) {
      relevanceScore += 15
    }

    const levelMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }
    const userLevelNum = levelMap[profile.current_level] ?? 2
    const contentLevelNum = levelMap[content.difficulty] ?? 2
    const levelDiff = Math.abs(userLevelNum - contentLevelNum)
    relevanceScore += Math.max(0, 10 - levelDiff * 5)

    relevanceScore += content.rating * 2
    relevanceScore = clamp(relevanceScore, 0, 100)

    const priority = relevanceScore >= 80 ? 1 : relevanceScore >= 60 ? 2 : 3

    recommendations.push({
      content,
      relevance_score: Math.round(relevanceScore * 10) / 10,
      reason: generateRecommendationReason(content, profile, preferredFormats),
      priority
    })
  }

  recommendations.sort((a, b) => a.priority - b.priority || b.relevance_score - a.relevance_score)

  const typeSet = new Set(recommendations.map(r => r.content.type))
  const diversityScore = Math.min(100, typeSet.size * 20)

  const totalTime = recommendations.slice(0, 5).reduce((s, r) => s + r.content.duration_minutes, 0)

  return {
    recommendations: recommendations.slice(0, 10),
    learning_path_alignment: pathAlignment.slice(0, 10),
    diversity_score: diversityScore,
    difficulty_match: profile.current_level,
    estimated_total_time: totalTime
  }
}

function generateRecommendationReason(content: ContentItem, profile: LearnerProfile, preferredFormats: string[]): string {
  const reasons: string[] = []

  if (profile.goals.some(g => content.topic.toLowerCase().includes(g.toLowerCase()))) {
    reasons.push('Aligns with learning goals')
  }
  if (profile.weaknesses.some(w => content.topic.toLowerCase().includes(w.toLowerCase()))) {
    reasons.push('Addresses identified weakness')
  }
  if (preferredFormats.includes(content.type)) {
    reasons.push('Matches preferred learning format')
  }
  if (content.rating >= 4.5) {
    reasons.push('Highly rated by learners')
  }

  return reasons.length > 0 ? reasons.join('; ') : 'General relevance to topic'
}

function formatContentRecommendationReport(result: ContentRecommendationResult): string {
  const lines: string[] = []
  lines.push('# Content Recommendations')
  lines.push('')
  lines.push('**Diversity Score:** ' + result.diversity_score + '/100 | **Difficulty Match:** ' + result.difficulty_match)
  lines.push('**Estimated Total Time:** ' + result.estimated_total_time + ' minutes')
  lines.push('')

  lines.push('### Top Recommendations')
  for (const rec of result.recommendations.slice(0, 8)) {
    lines.push('**P' + rec.priority + '** ' + rec.content.title + ' (' + rec.content.type + ', ' + rec.content.duration_minutes + 'min)')
    lines.push('  Score: ' + rec.relevance_score + '/100 | ' + rec.reason)
    lines.push('')
  }

  if (result.learning_path_alignment.length > 0) {
    lines.push('### Learning Path Alignment')
    for (const align of result.learning_path_alignment.slice(0, 5)) {
      lines.push('- ' + align)
    }
  }

  return lines.join('\n')
}

// --- Tool 4: Progress Tracking Analyzer ---

function analyzeProgress(
  progressData: ProgressDataPoint[],
  goals: string[],
  rng: () => number
): ProgressTrackingResult {
  if (progressData.length === 0) {
    return {
      overall_progress_pct: 0,
      topics_mastered: [],
      topics_in_progress: [],
      topics_not_started: goals,
      average_score: 0,
      total_time_spent_hours: 0,
      learning_velocity: 0,
      trend_analysis: 'stable',
      strengths_identified: [],
      areas_for_improvement: [],
      projected_completion_date: 'N/A',
      recommendations: ['Start learning to track progress']
    }
  }

  const topicMap = new Map<string, ProgressDataPoint[]>()
  for (const dp of progressData) {
    const existing = topicMap.get(dp.topic) ?? []
    existing.push(dp)
    topicMap.set(dp.topic, existing)
  }

  const topicsMastered: string[] = []
  const topicsInProgress: string[] = []
  const topicsNotStarted: string[] = []

  for (const goal of goals) {
    const data = topicMap.get(goal)
    if (!data || data.length === 0) {
      topicsNotStarted.push(goal)
    } else {
      const latest = data[data.length - 1]
      if (latest.completion_status === 'completed' && latest.score >= 80) {
        topicsMastered.push(goal)
      } else {
        topicsInProgress.push(goal)
      }
    }
  }

  const totalScore = progressData.reduce((s, dp) => s + dp.score, 0)
  const avgScore = Math.round(totalScore / progressData.length * 10) / 10

  const totalTimeMinutes = progressData.reduce((s, dp) => s + dp.time_spent_minutes, 0)
  const totalTimeHours = Math.round(totalTimeMinutes / 60 * 10) / 10

  const completedTopics = topicsMastered.length
  const velocity = goals.length > 0 ? Math.round(completedTopics / Math.max(1, totalTimeHours) * 100) / 100 : 0

  const recentData = progressData.slice(-Math.ceil(progressData.length / 3))
  const olderData = progressData.slice(0, Math.ceil(progressData.length / 3))
  const recentAvg = recentData.length > 0 ? recentData.reduce((s, dp) => s + dp.score, 0) / recentData.length : 0
  const olderAvg = olderData.length > 0 ? olderData.reduce((s, dp) => s + dp.score, 0) / olderData.length : 0

  const trend: ProgressTrackingResult['trend_analysis'] = recentAvg > olderAvg + 5 ? 'improving' : recentAvg < olderAvg - 5 ? 'declining' : 'stable'

  const strengths: string[] = []
  const improvements: string[] = []

  for (const [topic, data] of topicMap.entries()) {
    const topicAvg = data.reduce((s, dp) => s + dp.score, 0) / data.length
    if (topicAvg >= 80) strengths.push(topic)
    else if (topicAvg < 60) improvements.push(topic)
  }

  const overallPct = goals.length > 0 ? Math.round((topicsMastered.length / goals.length) * 100) : 0

  const remainingTopics = topicsInProgress.length + topicsNotStarted.length
  const weeksRemaining = velocity > 0 ? Math.ceil(remainingTopics / velocity) : 12
  const projectedDate = new Date()
  projectedDate.setDate(projectedDate.getDate() + weeksRemaining * 7)

  const recommendations: string[] = []
  if (trend === 'declining') recommendations.push('Review study strategies - performance is declining')
  if (improvements.length > 0) recommendations.push('Focus on weak areas: ' + improvements.join(', '))
  if (topicsNotStarted.length > 0) recommendations.push('Start new topics: ' + topicsNotStarted.slice(0, 3).join(', '))
  recommendations.push('Set weekly learning targets to maintain momentum')
  recommendations.push('Use spaced repetition for better retention')

  return {
    overall_progress_pct: overallPct,
    topics_mastered: topicsMastered,
    topics_in_progress: topicsInProgress,
    topics_not_started: topicsNotStarted,
    average_score: avgScore,
    total_time_spent_hours: totalTimeHours,
    learning_velocity: velocity,
    trend_analysis: trend,
    strengths_identified: strengths,
    areas_for_improvement: improvements,
    projected_completion_date: projectedDate.toISOString().split('T')[0],
    recommendations
  }
}

function formatProgressTrackingReport(result: ProgressTrackingResult): string {
  const lines: string[] = []
  lines.push('# Progress Tracking Analysis')
  lines.push('')
  lines.push('**Overall Progress:** ' + result.overall_progress_pct + '%')
  lines.push('**Average Score:** ' + result.average_score + '%')
  lines.push('**Total Time:** ' + result.total_time_spent_hours + ' hours')
  lines.push('**Learning Velocity:** ' + result.learning_velocity + ' topics/hour')
  lines.push('**Trend:** ' + result.trend_analysis.toUpperCase())
  lines.push('**Projected Completion:** ' + result.projected_completion_date)
  lines.push('')

  lines.push('### Topic Status')
  lines.push('**Mastered:** ' + (result.topics_mastered.length > 0 ? result.topics_mastered.join(', ') : 'None yet'))
  lines.push('**In Progress:** ' + (result.topics_in_progress.length > 0 ? result.topics_in_progress.join(', ') : 'None'))
  lines.push('**Not Started:** ' + (result.topics_not_started.length > 0 ? result.topics_not_started.join(', ') : 'All started'))
  lines.push('')

  if (result.strengths_identified.length > 0) {
    lines.push('### Strengths')
    for (const s of result.strengths_identified) {
      lines.push('- ' + s)
    }
    lines.push('')
  }

  if (result.areas_for_improvement.length > 0) {
    lines.push('### Areas for Improvement')
    for (const a of result.areas_for_improvement) {
      lines.push('- ' + a)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }

  return lines.join('\n')
}

// --- Tool 5: Skill Gap Identifier ---

function identifySkillGaps(
  skills: SkillAssessment[],
  rng: () => number
): SkillGapResult {
  const gaps: SkillGapResult['gaps'] = []
  const criticalGaps: string[] = []
  const quickWins: string[] = []
  const priorityOrder: string[] = []
  const resourceRecs: SkillGapResult['resource_recommendations'] = []

  let totalReadiness = 0

  for (const skill of skills) {
    const gapSize = Math.max(0, skill.required_level - skill.current_level)
    const readiness = skill.required_level > 0 ? Math.round((skill.current_level / skill.required_level) * 100) : 100
    totalReadiness += readiness

    let severity: SkillGapResult['gaps'][0]['gap_severity']
    if (gapSize >= 7) severity = 'critical'
    else if (gapSize >= 5) severity = 'significant'
    else if (gapSize >= 3) severity = 'moderate'
    else severity = 'minor'

    const estimatedHours = gapSize * 10

    gaps.push({
      skill: skill.skill,
      current_level: skill.current_level,
      required_level: skill.required_level,
      gap_size: gapSize,
      gap_severity: severity,
      category: skill.category,
      importance: skill.importance,
      estimated_hours_to_close: estimatedHours
    })

    if (severity === 'critical' || severity === 'significant') {
      criticalGaps.push(skill.skill)
    }

    if (gapSize > 0 && gapSize <= 3 && skill.importance === 'critical') {
      quickWins.push(skill.skill)
    }

    if (gapSize > 0) {
      priorityOrder.push(skill.skill)
      resourceRecs.push({
        skill: skill.skill,
        resources: generateSkillResources(skill.skill, skill.category, severity)
      })
    }
  }

  gaps.sort((a, b) => {
    const severityOrder = { critical: 0, significant: 1, moderate: 2, minor: 3 }
    return severityOrder[a.gap_severity] - severityOrder[b.gap_severity]
  })

  priorityOrder.sort((a, b) => {
    const aGap = gaps.find(g => g.skill === a)
    const bGap = gaps.find(g => g.skill === b)
    if (!aGap || !bGap) return 0
    const severityOrder = { critical: 0, significant: 1, moderate: 2, minor: 3 }
    return severityOrder[aGap.gap_severity] - severityOrder[bGap.gap_severity]
  })

  const overallReadiness = skills.length > 0 ? Math.round(totalReadiness / skills.length) : 0

  return {
    gaps,
    overall_readiness_pct: overallReadiness,
    critical_gaps: criticalGaps,
    quick_wins: quickWins,
    learning_priority_order: priorityOrder,
    resource_recommendations: resourceRecs
  }
}

function generateSkillResources(skill: string, category: string, severity: string): string[] {
  const baseResources: Record<string, string[]> = {
    technical: ['Online course: ' + skill + ' fundamentals', 'Hands-on project: ' + skill + ' practice', 'Documentation: ' + skill + ' reference guide'],
    soft_skill: ['Workshop: ' + skill + ' development', 'Practice exercises: ' + skill + ' scenarios', 'Feedback sessions: ' + skill + ' peer review'],
    domain: ['Textbook: ' + skill + ' domain knowledge', 'Case studies: ' + skill + ' applications', 'Expert interview: ' + skill + ' insights'],
    tool: ['Tutorial: ' + skill + ' basics', 'Certification prep: ' + skill + ' proficiency', 'Project: ' + skill + ' real-world usage'],
    methodology: ['Framework guide: ' + skill + ' methodology', 'Implementation plan: ' + skill + ' adoption', 'Best practices: ' + skill + ' patterns']
  }

  const resources = baseResources[category] ?? baseResources.technical

  if (severity === 'critical') {
    resources.unshift('Intensive bootcamp: ' + skill + ' (priority)')
  }

  return resources
}

function formatSkillGapReport(result: SkillGapResult): string {
  const lines: string[] = []
  lines.push('# Skill Gap Analysis')
  lines.push('')
  lines.push('**Overall Readiness:** ' + result.overall_readiness_pct + '%')
  lines.push('**Critical Gaps:** ' + result.critical_gaps.length)
  lines.push('**Quick Wins Available:** ' + result.quick_wins.length)
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Gap Details')
    lines.push('| Skill | Current | Required | Gap | Severity | Category | Hours to Close |')
    lines.push('|-------|---------|----------|-----|----------|----------|----------------|')
    for (const g of result.gaps) {
      lines.push('| ' + g.skill + ' | ' + g.current_level + ' | ' + g.required_level + ' | ' + g.gap_size + ' | ' + g.gap_severity.toUpperCase() + ' | ' + g.category + ' | ' + g.estimated_hours_to_close + 'h |')
    }
    lines.push('')
  }

  if (result.critical_gaps.length > 0) {
    lines.push('### Critical Gaps (Immediate Attention)')
    for (const cg of result.critical_gaps) {
      lines.push('- ' + cg)
    }
    lines.push('')
  }

  if (result.quick_wins.length > 0) {
    lines.push('### Quick Wins')
    for (const qw of result.quick_wins) {
      lines.push('- ' + qw)
    }
    lines.push('')
  }

  lines.push('### Learning Priority Order')
  for (let i = 0; i < result.learning_priority_order.length; i++) {
    lines.push((i + 1) + '. ' + result.learning_priority_order[i])
  }

  return lines.join('\n')
}

// --- Tool 6: Learning Style Detector ---

function detectLearningStyle(
  input: LearningStyleInput,
  rng: () => number
): LearningStyleResult {
  const scores: Record<string, number> = {
    visual: input.visual_score,
    auditory: input.auditory_score,
    kinesthetic: input.kinesthetic_score,
    reading_writing: input.reading_writing_score
  }

  const sortedStyles = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const primaryStyle = sortedStyles[0][0] as LearningStyleResult['primary_style']
  const secondaryStyle = sortedStyles[1][0]

  const total = Object.values(scores).reduce((s, v) => s + v, 0)
  const distribution: Record<string, number> = {}
  for (const [style, score] of Object.entries(scores)) {
    distribution[style] = total > 0 ? Math.round((score / total) * 100) : 25
  }

  const profileDescriptions: Record<string, string> = {
    visual: 'You learn best through images, diagrams, maps, and visual displays. Color coding and mind maps help you organize information.',
    auditory: 'You learn best through listening and speaking. Lectures, discussions, and audio content are your preferred learning channels.',
    kinesthetic: 'You learn best through hands-on experience and movement. Physical activities and practical exercises enhance your understanding.',
    reading_writing: 'You learn best through written words. Reading texts, taking notes, and writing summaries are your strongest learning methods.'
  }

  const strategies: Record<string, string[]> = {
    visual: [
      'Use color-coded notes and highlighters',
      'Create mind maps and concept diagrams',
      'Watch video demonstrations and tutorials',
      'Use flashcards with images and symbols',
      'Draw sketches to represent concepts'
    ],
    auditory: [
      'Record lectures and listen to them repeatedly',
      'Participate in group discussions and study groups',
      'Explain concepts aloud to yourself or others',
      'Use mnemonic devices and rhymes',
      'Listen to educational podcasts during commutes'
    ],
    kinesthetic: [
      'Take frequent breaks for physical movement',
      'Use hands-on experiments and building models',
      'Walk while reviewing material',
      'Role-play scenarios and simulations',
      'Use physical objects to represent abstract concepts'
    ],
    reading_writing: [
      'Rewrite notes in your own words',
      'Create detailed written summaries',
      'Read multiple sources on the same topic',
      'Write practice essays and reports',
      'Use lists and bullet points for organization'
    ]
  }

  const formatPreferences: Record<string, string[]> = {
    visual: ['Infographics', 'Video tutorials', 'Slide presentations', 'Diagrams and charts'],
    auditory: ['Podcasts', 'Lectures', 'Discussion forums', 'Audio books'],
    kinesthetic: ['Interactive simulations', 'Hands-on labs', 'Virtual reality experiences', 'Physical models'],
    reading_writing: ['Articles and e-books', 'Written tutorials', 'Research papers', 'Note-taking apps']
  }

  const environmentTips: Record<string, string[]> = {
    visual: [
      'Ensure good lighting for reading and screen work',
      'Position yourself to see whiteboards/screens clearly',
      'Keep visual distractions to a minimum',
      'Use a dedicated workspace with visual organization tools'
    ],
    auditory: [
      'Choose a quiet environment or use noise-canceling headphones',
      'Play background music if it helps concentration',
      'Sit near the front in lectures to hear clearly',
      'Use text-to-speech tools for written material'
    ],
    kinesthetic: [
      'Use a standing desk or take frequent movement breaks',
      'Fidget tools can help maintain focus',
      'Study in short bursts with physical activity between',
      'Walk while reviewing flashcards or notes'
    ],
    reading_writing: [
      'Create a comfortable reading nook with good seating',
      'Keep writing materials readily available',
      'Use a library or quiet study room',
      'Organize digital files for easy access to reading materials'
    ]
  }

  const collaborationPrefs: Record<string, string[]> = {
    visual: ['Share visual presentations', 'Collaborate on whiteboards', 'Create joint diagrams', 'Use visual project management tools'],
    auditory: ['Participate in verbal brainstorming', 'Engage in discussion-based learning', 'Present ideas orally', 'Use voice chat for group work'],
    kinesthetic: ['Engage in hands-on group projects', 'Build physical prototypes together', 'Role-play scenarios', 'Conduct experiments as a team'],
    reading_writing: ['Collaborate on shared documents', 'Write joint reports', 'Peer review written work', 'Create shared knowledge bases']
  }

  return {
    primary_style: primaryStyle,
    secondary_style: secondaryStyle,
    style_distribution: distribution,
    learning_profile: profileDescriptions[primaryStyle],
    recommended_strategies: strategies[primaryStyle] ?? strategies.visual,
    content_format_preferences: formatPreferences[primaryStyle] ?? formatPreferences.visual,
    study_environment_tips: environmentTips[primaryStyle] ?? environmentTips.visual,
    collaboration_preferences: collaborationPrefs[primaryStyle] ?? collaborationPrefs.visual
  }
}

function formatLearningStyleReport(result: LearningStyleResult): string {
  const lines: string[] = []
  lines.push('# Learning Style Analysis')
  lines.push('')
  lines.push('**Primary Style:** ' + result.primary_style.replace('_', '/').toUpperCase())
  lines.push('**Secondary Style:** ' + result.secondary_style.replace('_', '/'))
  lines.push('')

  lines.push('### Style Distribution')
  for (const [style, pct] of Object.entries(result.style_distribution)) {
    const bar = '#'.repeat(Math.round(pct / 5)) + '-'.repeat(20 - Math.round(pct / 5))
    lines.push('- ' + style.replace('_', '/') + ': ' + bar + ' ' + pct + '%')
  }
  lines.push('')

  lines.push('### Your Learning Profile')
  lines.push(result.learning_profile)
  lines.push('')

  lines.push('### Recommended Strategies')
  for (const s of result.recommended_strategies) {
    lines.push('- ' + s)
  }
  lines.push('')

  lines.push('### Preferred Content Formats')
  for (const f of result.content_format_preferences) {
    lines.push('- ' + f)
  }
  lines.push('')

  lines.push('### Study Environment Tips')
  for (const t of result.study_environment_tips) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push('### Collaboration Preferences')
  for (const c of result.collaboration_preferences) {
    lines.push('- ' + c)
  }

  return lines.join('\n')
}

// --- Tool 7: Engagement Optimizer ---

function optimizeEngagement(
  data: EngagementData,
  rng: () => number
): EngagementOptimizerResult {
  const loginScore = clamp(data.login_frequency_per_week / 5, 0, 1) * 100
  const durationScore = clamp(data.avg_session_duration_minutes / 30, 0, 1) * 100
  const completionScore = data.content_completion_rate * 100
  const interactionScore = data.interaction_rate * 100
  const submissionScore = data.assignment_submission_rate * 100
  const discussionScore = clamp(data.discussion_participation / 5, 0, 1) * 100
  const onTaskScore = clamp(data.time_on_task_minutes / 60, 0, 1) * 100
  const distractionPenalty = Math.min(20, data.distraction_incidents * 5)

  const engagementScore = Math.round(
    loginScore * 0.1 +
    durationScore * 0.15 +
    completionScore * 0.2 +
    interactionScore * 0.15 +
    submissionScore * 0.15 +
    discussionScore * 0.1 +
    onTaskScore * 0.15 -
    distractionPenalty
  )

  const clampedScore = clamp(engagementScore, 0, 100)

  let level: EngagementOptimizerResult['engagement_level']
  if (clampedScore >= 85) level = 'highly_engaged'
  else if (clampedScore >= 70) level = 'engaged'
  else if (clampedScore >= 50) level = 'moderately_engaged'
  else if (clampedScore >= 30) level = 'disengaged'
  else level = 'at_risk'

  const riskFactors: string[] = []
  if (data.login_frequency_per_week < 3) riskFactors.push('Low login frequency (' + data.login_frequency_per_week + '/week)')
  if (data.avg_session_duration_minutes < 15) riskFactors.push('Short sessions (' + data.avg_session_duration_minutes + 'min avg)')
  if (data.content_completion_rate < 0.5) riskFactors.push('Low completion rate (' + Math.round(data.content_completion_rate * 100) + '%)')
  if (data.assignment_submission_rate < 0.6) riskFactors.push('Missing assignments (' + Math.round(data.assignment_submission_rate * 100) + '% submitted)')
  if (data.distraction_incidents > 5) riskFactors.push('High distraction rate (' + data.distraction_incidents + ' incidents)')

  const strategies: EngagementOptimizerResult['optimization_strategies'] = []

  if (data.login_frequency_per_week < 4) {
    strategies.push({
      strategy: 'Implement daily login streak rewards',
      expected_impact: '+15-20% login frequency',
      implementation_difficulty: 'easy',
      category: 'habit_formation'
    })
  }

  if (data.avg_session_duration_minutes < 20) {
    strategies.push({
      strategy: 'Break content into micro-learning modules (10-15 min)',
      expected_impact: '+25% session duration',
      implementation_difficulty: 'medium',
      category: 'content_design'
    })
  }

  if (data.content_completion_rate < 0.6) {
    strategies.push({
      strategy: 'Add progress indicators and milestone celebrations',
      expected_impact: '+20% completion rate',
      implementation_difficulty: 'easy',
      category: 'motivation'
    })
  }

  if (data.interaction_rate < 0.4) {
    strategies.push({
      strategy: 'Introduce interactive knowledge checks every 5 minutes',
      expected_impact: '+30% interaction rate',
      implementation_difficulty: 'medium',
      category: 'interactivity'
    })
  }

  if (data.assignment_submission_rate < 0.7) {
    strategies.push({
      strategy: 'Implement assignment reminders and deadline notifications',
      expected_impact: '+15% submission rate',
      implementation_difficulty: 'easy',
      category: 'communication'
    })
  }

  if (data.discussion_participation < 2) {
    strategies.push({
      strategy: 'Create small group discussion prompts with guided questions',
      expected_impact: '+40% discussion participation',
      implementation_difficulty: 'medium',
      category: 'social_learning'
    })
  }

  strategies.push({
    strategy: 'Personalize content difficulty based on performance data',
    expected_impact: '+10% overall engagement',
    implementation_difficulty: 'hard',
    category: 'personalization'
  })

  const gamification: string[] = []
  if (clampedScore < 70) gamification.push('Introduce point-based achievement system')
  if (data.login_frequency_per_week < 4) gamification.push('Daily login streak with bonus rewards')
  if (data.content_completion_rate < 0.6) gamification.push('Progress bars and "level up" notifications')
  if (data.discussion_participation < 3) gamification.push('Badges for first discussion post and helpful contributions')
  if (clampedScore < 50) gamification.push('Team-based challenges and friendly leaderboards')
  gamification.push('Unlockable content modules based on mastery milestones')

  const personalizationTweaks: string[] = []
  personalizationTweaks.push('Adjust content difficulty to match demonstrated skill level')
  personalizationTweaks.push('Recommend content formats based on past high-engagement sessions')
  personalizationTweaks.push('Send study reminders at times when user is most active')
  personalizationTweaks.push('Provide choice in learning activities to increase autonomy')

  const projectedImprovement = Math.min(95, clampedScore + 20)

  const actionPlan: string[] = []
  actionPlan.push('Week 1-2: Implement easy wins (login streaks, progress indicators)')
  actionPlan.push('Week 3-4: Deploy medium-difficulty strategies (micro-learning, interactive checks)')
  actionPlan.push('Week 5-6: Evaluate impact and adjust strategies based on data')
  actionPlan.push('Week 7-8: Implement advanced personalization features')
  actionPlan.push('Ongoing: Monitor engagement metrics weekly and iterate')

  return {
    current_engagement_score: clampedScore,
    engagement_level: level,
    risk_factors: riskFactors,
    optimization_strategies: strategies,
    gamification_recommendations: gamification,
    personalization_tweaks: personalizationTweaks,
    projected_improvement: projectedImprovement,
    action_plan: actionPlan
  }
}

function formatEngagementOptimizerReport(result: EngagementOptimizerResult): string {
  const lines: string[] = []
  lines.push('# Engagement Optimization Analysis')
  lines.push('')
  lines.push('**Current Score:** ' + result.current_engagement_score + '/100 | **Level:** ' + result.engagement_level.replace('_', ' ').toUpperCase())
  lines.push('**Projected Improvement:** ' + result.projected_improvement + '/100')
  lines.push('')

  if (result.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const rf of result.risk_factors) {
      lines.push('- ' + rf)
    }
    lines.push('')
  }

  lines.push('### Optimization Strategies')
  for (const s of result.optimization_strategies) {
    lines.push('- **' + s.strategy + '** [' + s.implementation_difficulty + ']')
    lines.push('  Expected: ' + s.expected_impact + ' | Category: ' + s.category)
  }
  lines.push('')

  lines.push('### Gamification Recommendations')
  for (const g of result.gamification_recommendations) {
    lines.push('- ' + g)
  }
  lines.push('')

  lines.push('### Personalization Tweaks')
  for (const t of result.personalization_tweaks) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push('### Action Plan')
  for (const a of result.action_plan) {
    lines.push('- ' + a)
  }

  return lines.join('\n')
}

// --- Tool 8: Certification Prep Planner ---

function planCertificationPrep(
  goal: CertificationGoal,
  rng: () => number
): CertificationPrepResult {
  const targetDate = new Date(goal.target_date)
  const now = new Date()
  const totalWeeks = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)))

  const weeklyHours = goal.study_hours_available_per_week
  const totalStudyHours = totalWeeks * weeklyHours

  const studyPlan: CertificationPrepResult['study_plan'] = []
  const domainCount = goal.domains.length
  const weeksPerDomain = Math.max(1, Math.floor(totalWeeks / Math.max(1, domainCount)))

  const domainCoverage: CertificationPrepResult['domain_coverage_plan'] = []
  const practiceExamSchedule: string[] = []
  const milestones: string[] = []
  const riskMitigation: string[] = []

  for (let week = 1; week <= totalWeeks; week++) {
    const domainIdx = Math.min(domainCount - 1, Math.floor((week - 1) / weeksPerDomain))
    const focusAreas = [
      goal.domains[domainIdx],
      ...(goal.weak_areas.length > 0 && week > totalWeeks / 2 ? goal.weak_areas.slice(0, 2) : [])
    ]

    const isReviewWeek = week > totalWeeks * 0.7
    const isPracticeExamWeek = week % 4 === 0 || week === totalWeeks

    const activities: string[] = []
    const resources: string[] = []

    if (isReviewWeek) {
      activities.push('Comprehensive review of all domains')
      activities.push('Practice exam simulation')
      activities.push('Weak area intensive study')
      resources.push('Practice exam platform')
      resources.push('Review notes and flashcards')
    } else {
      activities.push('Study new material: ' + focusAreas.join(', '))
      activities.push('Hands-on practice exercises')
      activities.push('Review and reinforce previous topics')
      resources.push('Official certification guide')
      resources.push('Video training course')
      resources.push('Hands-on lab exercises')
    }

    if (isPracticeExamWeek) {
      activities.push('Full-length practice exam')
      practiceExamSchedule.push('Week ' + week + ': Full practice exam')
    }

    studyPlan.push({
      week,
      focus_areas: [...new Set(focusAreas)],
      study_hours: weeklyHours,
      activities,
      resources,
      practice_exams: isPracticeExamWeek
    })

    if (week === Math.floor(totalWeeks * 0.25)) {
      milestones.push('Week ' + week + ': Complete 25% of study material')
    }
    if (week === Math.floor(totalWeeks * 0.5)) {
      milestones.push('Week ' + week + ': Complete 50% - Midpoint assessment')
    }
    if (week === Math.floor(totalWeeks * 0.75)) {
      milestones.push('Week ' + week + ': Complete 75% - Begin intensive review')
    }
    if (week === totalWeeks) {
      milestones.push('Week ' + week + ': Final review and certification exam')
    }
  }

  for (const domain of goal.domains) {
    const isWeak = goal.weak_areas.includes(domain)
    const priority: CertificationPrepResult['domain_coverage_plan'][0]['priority'] = isWeak ? 'high' : 'medium'
    const allocatedHours = Math.round(totalStudyHours / domainCount * (isWeak ? 1.5 : 1))

    domainCoverage.push({
      domain,
      priority,
      allocated_hours: allocatedHours,
      mastery_target: isWeak ? 80 : 90
    })
  }

  const readinessProjection = Math.min(95, goal.current_readiness + Math.round(totalStudyHours / 10))

  if (goal.current_readiness < 40) {
    riskMitigation.push('Consider postponing exam - current readiness is low')
    riskMitigation.push('Start with foundational courses before certification prep')
  }
  if (totalWeeks < 4) {
    riskMitigation.push('Limited study time - consider extending exam date')
    riskMitigation.push('Focus only on highest-priority domains')
  }
  if (goal.weak_areas.length > 3) {
    riskMitigation.push('Many weak areas identified - prioritize top 3 for focused study')
  }
  riskMitigation.push('Take at least 3 full practice exams before the real test')
  riskMitigation.push('Schedule exam when consistently scoring 85%+ on practice tests')
  riskMitigation.push('Build in buffer time for unexpected life events')

  return {
    study_plan: studyPlan,
    total_weeks: totalWeeks,
    weekly_hour_commitment: weeklyHours,
    domain_coverage_plan: domainCoverage,
    practice_exam_schedule: practiceExamSchedule,
    key_milestones: milestones,
    readiness_projection: readinessProjection,
    risk_mitigation: riskMitigation
  }
}

function formatCertificationPrepReport(result: CertificationPrepResult): string {
  const lines: string[] = []
  lines.push('# Certification Prep Plan')
  lines.push('')
  lines.push('**Total Weeks:** ' + result.total_weeks + ' | **Weekly Hours:** ' + result.weekly_hour_commitment)
  lines.push('**Readiness Projection:** ' + result.readiness_projection + '%')
  lines.push('')

  lines.push('### Domain Coverage Plan')
  lines.push('| Domain | Priority | Hours | Mastery Target |')
  lines.push('|--------|----------|-------|----------------|')
  for (const dc of result.domain_coverage_plan) {
    lines.push('| ' + dc.domain + ' | ' + dc.priority.toUpperCase() + ' | ' + dc.allocated_hours + 'h | ' + dc.mastery_target + '% |')
  }
  lines.push('')

  lines.push('### Study Plan (Weekly Breakdown)')
  for (const week of result.study_plan) {
    lines.push('**Week ' + week.week + '** (' + week.study_hours + 'h)' + (week.practice_exams ? ' [PRACTICE EXAM]' : ''))
    lines.push('  Focus: ' + week.focus_areas.join(', '))
    lines.push('  Activities: ' + week.activities.slice(0, 2).join('; '))
    lines.push('')
  }

  lines.push('### Practice Exam Schedule')
  for (const exam of result.practice_exam_schedule) {
    lines.push('- ' + exam)
  }
  lines.push('')

  lines.push('### Key Milestones')
  for (const m of result.key_milestones) {
    lines.push('- ' + m)
  }
  lines.push('')

  lines.push('### Risk Mitigation')
  for (const r of result.risk_mitigation) {
    lines.push('- ' + r)
  }

  return lines.join('\n')
}

// ==================== SECTION 4: Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Adaptive Learning Path Generator
  tools.register(defineTool({
    name: 'adaptive_learning_path_generator',
    description: 'Generate a personalized adaptive learning path based on learner profile. Creates a sequenced learning plan with milestones, difficulty progression, and style-specific adjustments.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: current_level (beginner/intermediate/advanced/expert), goals[], learning_style (visual/auditory/kinesthetic/reading_writing), available_time_hours_per_week, strengths[], weaknesses[], prior_knowledge[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: LearnerProfile = JSON.parse(args.input_data)
      const rng = seededRng(args.input_data)
      return formatAdaptiveLearningPathReport(generateAdaptiveLearningPath(input, rng))
    }
  }))

  // Tool 2: Knowledge Assessment Engine
  tools.register(defineTool({
    name: 'knowledge_assessment_engine',
    description: 'Generate comprehensive knowledge assessments with questions, answer keys, and rubrics. Supports multiple question types, difficulty levels, and Bloom taxonomy alignment.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: topic, difficulty (easy/medium/hard), question_types[] (multiple_choice/short_answer/true_false/essay), num_questions'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = JSON.parse(args.input_data)
      const topic: string = input.topic
      const difficulty: 'easy' | 'medium' | 'hard' = input.difficulty
      const questionTypes: string[] = input.question_types
      const numQuestions: number = input.num_questions
      const rng = seededRng(args.input_data)
      return formatKnowledgeAssessmentReport(generateKnowledgeAssessment(topic, difficulty, questionTypes, numQuestions, rng))
    }
  }))

  // Tool 3: Content Recommendation System
  tools.register(defineTool({
    name: 'content_recommendation_system',
    description: 'Recommend personalized learning content based on learner profile and available content library. Provides relevance scoring, diversity analysis, and learning path alignment.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: learner_profile (current_level, goals[], learning_style, available_time_hours_per_week, strengths[], weaknesses[]), available_content[] (id, title, type, topic, difficulty, duration_minutes, rating)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = JSON.parse(args.input_data)
      const profile: LearnerProfile = input.learner_profile
      const content: ContentItem[] = input.available_content
      const rng = seededRng(args.input_data)
      return formatContentRecommendationReport(recommendContent(profile, content, rng))
    }
  }))

  // Tool 4: Progress Tracking Analyzer
  tools.register(defineTool({
    name: 'progress_tracking_analyzer',
    description: 'Analyze learning progress from tracked data points. Provides overall progress, topic mastery status, trend analysis, and personalized recommendations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: progress_data[] (date, topic, score, time_spent_minutes, completion_status, engagement_level), goals[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = JSON.parse(args.input_data)
      const progressData: ProgressDataPoint[] = input.progress_data
      const goals: string[] = input.goals
      const rng = seededRng(args.input_data)
      return formatProgressTrackingReport(analyzeProgress(progressData, goals, rng))
    }
  }))

  // Tool 5: Skill Gap Identifier
  tools.register(defineTool({
    name: 'skill_gap_identifier',
    description: 'Identify skill gaps by comparing current competency levels against required levels. Provides gap severity, priority ordering, and resource recommendations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: skills[] (skill, current_level (1-10), required_level (1-10), category (technical/soft_skill/domain/tool/methodology), importance (critical/important/nice_to_have))'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input = JSON.parse(args.input_data)
      const skills: SkillAssessment[] = input.skills
      const rng = seededRng(args.input_data)
      return formatSkillGapReport(identifySkillGaps(skills, rng))
    }
  }))

  // Tool 6: Learning Style Detector
  tools.register(defineTool({
    name: 'learning_style_detector',
    description: 'Detect learning style using VARK model (Visual, Auditory, Reading/Writing, Kinesthetic). Provides style distribution, recommended strategies, and content format preferences.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: visual_score (0-100), auditory_score (0-100), kinesthetic_score (0-100), reading_writing_score (0-100), preferences[], study_habits[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: LearningStyleInput = JSON.parse(args.input_data)
      const rng = seededRng(args.input_data)
      return formatLearningStyleReport(detectLearningStyle(input, rng))
    }
  }))

  // Tool 7: Engagement Optimizer
  tools.register(defineTool({
    name: 'engagement_optimizer',
    description: 'Analyze and optimize learner engagement. Evaluates engagement patterns, identifies risk factors, and provides gamification and personalization strategies.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: login_frequency_per_week, avg_session_duration_minutes, content_completion_rate (0-1), interaction_rate (0-1), assignment_submission_rate (0-1), discussion_participation, time_on_task_minutes, distraction_incidents'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: EngagementData = JSON.parse(args.input_data)
      const rng = seededRng(args.input_data)
      return formatEngagementOptimizerReport(optimizeEngagement(input, rng))
    }
  }))

  // Tool 8: Certification Prep Planner
  tools.register(defineTool({
    name: 'certification_prep_planner',
    description: 'Create a comprehensive certification study plan with weekly breakdown, domain coverage, practice exam schedule, and readiness projection.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: certification_name, target_date (YYYY-MM-DD), current_readiness (0-100), domains[], weak_areas[], study_hours_available_per_week'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CertificationGoal = JSON.parse(args.input_data)
      const rng = seededRng(args.input_data)
      return formatCertificationPrepReport(planCertificationPrep(input, rng))
    }
  }))

  console.log('[dsh-tool-learnedu] Loaded v' + VERSION + ' - AI Education & Personalized Learning Plugin with 8 tools')
  console.log('  Tools: adaptive_learning_path_generator, knowledge_assessment_engine, content_recommendation_system, progress_tracking_analyzer, skill_gap_identifier, learning_style_detector, engagement_optimizer, certification_prep_planner')
}
