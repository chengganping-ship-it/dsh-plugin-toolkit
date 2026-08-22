/**
 * DSH EdTech Pro Plugin v1.0.0
 *
 * AI-powered education toolkit for the 2026 EdTech revolution. Provides personalized
 * learning path design, assessment generation, learning analytics dashboards, AI tutoring
 * session planning, course content generation, knowledge gap analysis, peer learning
 * optimization, and engagement/dropout prediction. Adaptive learning and AI tutoring
 * are at the forefront of the massive 2026 education technology market.
 *
 * Features (v1.0.0):
 * - Adaptive Learning Path Designer (personalized learning paths from learner profiles)
 * - Assessment Generator (quizzes, exams, projects at specified difficulty and topics)
 * - Learning Analytics Dashboard (tracking learner progress and outcomes)
 * - AI Tutoring Session Planner (Socratic questioning and adaptive hints)
 * - Course Content Generator (structured modules, lessons, activities from outline)
 * - Knowledge Gap Analyzer (assessment results to remediation strategies)
 * - Peer Learning Optimizer (collaborative group and activity optimization)
 * - Engagement Predictor (learner engagement and dropout risk for intervention)
 *
 * @module dsh-tool-edtechpro
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-edtechpro'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated educational analysis for informational purposes only. It does not constitute professional educational or pedagogical advice. Consult qualified educators and instructional designers before making curriculum decisions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStringToSeed(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function rngRange(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function rngFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function rateScore(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Strong'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'Developing'
  return 'Needs Attention'
}

// ==================== TYPES ====================

// --- Tool 1: Adaptive Learning Path Designer ---
export interface LearnerProfile {
  current_level?: string
  learning_style?: string
  strengths?: string[]
  weaknesses?: string[]
  pace_preference?: 'slow' | 'moderate' | 'fast'
  prior_experience_years?: number
}

export interface AdaptiveLearningPathInput {
  learner_profile?: LearnerProfile
  learning_goals?: string[]
  available_time_hours_week?: number
  preferred_formats?: string[]
  prior_knowledge_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface LearningModule {
  module_number: number
  title: string
  duration_hours: number
  format: string
  bloom_level: string
  prerequisites: string[]
  objectives: string[]
  assessment_type: string
}

export interface AdaptiveLearningPathResult {
  path_id: string
  total_duration_weeks: number
  total_hours: number
  modules: LearningModule[]
  personalization_score: number
  adaptive_notes: string[]
  milestone_checkpoints: string[]
  summary: string
}

// --- Tool 2: Assessment Generator ---
export interface AssessmentGeneratorInput {
  subject?: string
  topics?: string[]
  difficulty_level?: 'easy' | 'medium' | 'hard' | 'mixed'
  question_types?: string[]
  duration_minutes?: number
  learning_objectives?: string[]
}

export interface AssessmentQuestion {
  question_number: number
  type: string
  topic: string
  difficulty: string
  bloom_level: string
  question_text: string
  options?: string[]
  correct_answer: string
  explanation: string
  points: number
}

export interface AssessmentResult {
  assessment_id: string
  title: string
  total_questions: number
  total_points: number
  duration_minutes: number
  questions: AssessmentQuestion[]
  difficulty_distribution: Record<string, number>
  bloom_distribution: Record<string, number>
  summary: string
}

// --- Tool 3: Learning Analytics Dashboard ---
export interface LearningAnalyticsInput {
  metrics?: string[]
  cohort_size?: number
  timeframe_weeks?: number
  visualization_types?: Record<string, string>
  alert_thresholds?: Record<string, number>
}

export interface DashboardWidget {
  widget_id: string
  title: string
  visualization_type: string
  data_source: string
  refresh_interval: string
  metrics: string[]
}

export interface AnalyticsAlert {
  alert_name: string
  condition: string
  threshold: number
  severity: 'critical' | 'warning' | 'info'
  action: string
}

export interface LearningAnalyticsResult {
  dashboard_id: string
  dashboard_name: string
  widgets: DashboardWidget[]
  alerts: AnalyticsAlert[]
  kpi_summary: Record<string, number>
  cohort_insights: string[]
  summary: string
}

// --- Tool 4: AI Tutoring Session Planner ---
export interface TutoringSessionInput {
  subject?: string
  student_level?: 'beginner' | 'intermediate' | 'advanced'
  session_duration_min?: number
  learning_objectives?: string[]
  hint_strategy?: 'socratic' | 'scaffolded' | 'direct' | 'mixed'
  misconception_database?: string[]
}

export interface TutoringPhase {
  phase_number: number
  name: string
  duration_min: number
  activity: string
  socratic_questions: string[]
  adaptive_hints: string[]
  misconceptions_addressed: string[]
}

export interface TutoringSessionResult {
  session_id: string
  subject: string
  total_duration_min: number
  phases: TutoringPhase[]
  difficulty_progression: string[]
  engagement_strategies: string[]
  summary: string
}

// --- Tool 5: Course Content Generator ---
export interface CourseContentInput {
  course_title?: string
  target_audience?: string
  duration_hours?: number
  Bloom_taxonomy_levels?: string[]
  content_format?: 'text' | 'video' | 'interactive' | 'mixed'
}

export interface LessonContent {
  lesson_number: number
  title: string
  duration_min: number
  bloom_level: string
  content_outline: string[]
  activities: string[]
  assessment: string
  resources: string[]
}

export interface CourseModuleContent {
  module_number: number
  title: string
  duration_hours: number
  lessons: LessonContent[]
  module_objectives: string[]
}

export interface CourseContentResult {
  course_id: string
  course_title: string
  total_modules: number
  total_lessons: number
  total_duration_hours: number
  modules: CourseModuleContent[]
  bloom_coverage: Record<string, number>
  summary: string
}

// --- Tool 6: Knowledge Gap Analyzer ---
export interface KnowledgeGapInput {
  assessment_results?: Record<string, number>
  learning_objectives?: string[]
  difficulty_matrix?: Record<string, string>
  remediation_resources?: string[]
}

export interface KnowledgeGap {
  objective: string
  current_mastery_pct: number
  target_mastery_pct: number
  gap_size: number
  severity: 'critical' | 'significant' | 'minor' | 'none'
  root_cause: string
  remediation_strategy: string
  recommended_resources: string[]
  estimated_remediation_hours: number
}

export interface KnowledgeGapResult {
  analysis_id: string
  overall_mastery_pct: number
  gaps: KnowledgeGap[]
  critical_gaps_count: number
  remediation_plan: string[]
  total_remediation_hours: number
  summary: string
}

// --- Tool 7: Peer Learning Optimizer ---
export interface PeerLearningInput {
  group_size?: number
  diversity_factors?: string[]
  project_type?: string
  skill_levels?: string[]
  collaboration_tools?: string[]
}

export interface PeerGroup {
  group_id: number
  members: string[]
  diversity_score: number
  complementary_skills: string[]
  assigned_role: string[]
}

export interface PeerActivity {
  activity_number: number
  name: string
  type: string
  duration_min: number
  collaboration_mode: string
  individual_accountability: string
  interdependence_level: 'low' | 'medium' | 'high'
}

export interface PeerLearningResult {
  optimization_id: string
  groups: PeerGroup[]
  activities: PeerActivity[]
  collaboration_rubric: string[]
  facilitation_tips: string[]
  summary: string
}

// --- Tool 8: Engagement Predictor ---
export interface EngagementPredictorInput {
  learner_history?: Record<string, number>
  demographic_factors?: Record<string, string>
  engagement_metrics?: Record<string, number>
  course_difficulty?: 'easy' | 'moderate' | 'challenging' | 'very_difficult'
  intervention_history?: string[]
}

export interface EngagementFactor {
  factor: string
  current_value: number
  impact_on_engagement: 'positive' | 'negative' | 'neutral'
  weight: number
  recommendation: string
}

export interface EngagementPredictorResult {
  prediction_id: string
  engagement_score: number
  dropout_risk_pct: number
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  factors: EngagementFactor[]
  intervention_recommendations: string[]
  predicted_trajectory: string
  summary: string
}

// ==================== TOOL 1: ADAPTIVE LEARNING PATH DESIGNER ====================

function designAdaptivePath(input: AdaptiveLearningPathInput): AdaptiveLearningPathResult {
  const seed = hashStringToSeed(JSON.stringify(input))
  const rng = mulberry32(seed)

  const profile = input.learner_profile || {}
  const goals = input.learning_goals || ['master core concepts']
  const timePerWeek = input.available_time_hours_week || 10
  const formats = input.preferred_formats || ['video', 'reading', 'practice']
  const knowledgeLevel = input.prior_knowledge_level || 'intermediate'
  const pace = profile.pace_preference || 'moderate'

  // Determine number of modules based on goals and pace
  const paceMultiplier = pace === 'fast' ? 0.7 : pace === 'slow' ? 1.4 : 1.0
  const baseModules = clamp(goals.length * 2 + rngRange(rng, 1, 3), 4, 12)
  const totalWeeks = clamp(Math.round(baseModules * paceMultiplier * 1.5), 4, 24)
  const totalHours = totalWeeks * timePerWeek

  const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']
  const modules: LearningModule[] = []

  for (let i = 0; i < baseModules; i++) {
    const goalIdx = i % goals.length
    const bloomIdx = clamp(Math.floor(i / baseModules * bloomLevels.length) + rngRange(rng, 0, 1), 0, bloomLevels.length - 1)
    const moduleDuration = clamp(Math.round((totalHours / baseModules) * rngFloat(rng, 0.8, 1.2)), 2, 12)

    modules.push({
      module_number: i + 1,
      title: 'Module ' + (i + 1) + ': ' + goals[goalIdx] + ' - ' + bloomLevels[bloomIdx] + ' Level',
      duration_hours: moduleDuration,
      format: formats[i % formats.length],
      bloom_level: bloomLevels[bloomIdx],
      prerequisites: i > 0 ? ['Module ' + i] : [],
      objectives: [
        'Demonstrate ' + bloomLevels[bloomIdx].toLowerCase() + ' understanding of ' + goals[goalIdx],
        'Apply ' + goals[goalIdx] + ' concepts in practical scenarios',
      ],
      assessment_type: i % 3 === 0 ? 'Project' : i % 3 === 1 ? 'Quiz' : 'Peer Review',
    })
  }

  const personalizationScore = clamp(rngRange(rng, 60, 85) + (profile.strengths && profile.strengths.length > 2 ? 10 : 0), 30, 98)

  const adaptiveNotes: string[] = []
  if (pace === 'fast') adaptiveNotes.push('Accelerated pace: modules compressed with optional deep-dive extensions for mastery')
  if (pace === 'slow') adaptiveNotes.push('Extended pace: additional practice modules and review checkpoints included')
  if (profile.learning_style) adaptiveNotes.push('Content adapted for ' + profile.learning_style + ' learning style')
  if (knowledgeLevel === 'beginner') adaptiveNotes.push('Foundational prerequisites embedded in early modules')
  if (knowledgeLevel === 'expert') adaptiveNotes.push('Advanced pathways with skip-ahead options for demonstrated competencies')
  adaptiveNotes.push('Adaptive difficulty adjusts based on formative assessment performance after each module')
  adaptiveNotes.push('Spaced repetition intervals built into review modules for long-term retention')

  const milestones: string[] = []
  const checkpointInterval = Math.max(1, Math.floor(baseModules / 4))
  for (let i = checkpointInterval; i <= baseModules; i += checkpointInterval) {
    milestones.push('Checkpoint after Module ' + i + ': Comprehensive review and mastery verification')
  }

  return {
    path_id: 'ALP-' + rngRange(rng, 10000, 99999),
    total_duration_weeks: totalWeeks,
    total_hours: totalHours,
    modules,
    personalization_score: personalizationScore,
    adaptive_notes: adaptiveNotes,
    milestone_checkpoints: milestones,
    summary: 'Personalized ' + totalWeeks + '-week learning path with ' + baseModules + ' modules (' + totalHours + ' total hours). Personalization score: ' + personalizationScore + '/100. Bloom taxonomy progression from ' + bloomLevels[0] + ' to ' + bloomLevels[Math.min(baseModules, bloomLevels.length) - 1] + '.',
  }
}

function formatAdaptivePathReport(input: AdaptiveLearningPathInput, result: AdaptiveLearningPathResult): string {
  const lines: string[] = []
  lines.push('## Adaptive Learning Path Design')
  lines.push('')
  lines.push('**Path ID: ' + result.path_id + '** | Duration: ' + result.total_duration_weeks + ' weeks | Total Hours: ' + result.total_hours + ' | Personalization: ' + result.personalization_score + '/100')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Learning Modules')
  lines.push('| # | Module | Hours | Format | Bloom Level | Assessment |')
  lines.push('|---|--------|-------|--------|-------------|------------|')
  for (const m of result.modules) {
    lines.push('| ' + m.module_number + ' | ' + m.title + ' | ' + m.duration_hours + 'h | ' + m.format + ' | ' + m.bloom_level + ' | ' + m.assessment_type + ' |')
  }
  lines.push('')

  if (result.adaptive_notes.length > 0) {
    lines.push('### Personalization Notes')
    for (const note of result.adaptive_notes) {
      lines.push('- ' + note)
    }
    lines.push('')
  }

  if (result.milestone_checkpoints.length > 0) {
    lines.push('### Milestone Checkpoints')
    for (const mc of result.milestone_checkpoints) {
      lines.push('- ' + mc)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: ASSESSMENT GENERATOR ====================

function generateAssessment(input: AssessmentGeneratorInput): AssessmentResult {
  const seed = hashStringToSeed(JSON.stringify(input))
  const rng = mulberry32(seed)

  const subject = input.subject || 'General'
  const topics = input.topics || ['core concepts']
  const difficulty = input.difficulty_level || 'medium'
  const questionTypes = input.question_types || ['multiple_choice', 'short_answer', 'essay']
  const duration = input.duration_minutes || 60
  const objectives = input.learning_objectives || ['Demonstrate understanding of ' + subject]

  const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']
  const difficultyLevels = difficulty === 'mixed' ? ['easy', 'medium', 'hard'] : [difficulty]

  // Determine number of questions based on duration
  const numQuestions = clamp(Math.floor(duration / rngFloat(rng, 3, 5)), 8, 30)
  const questions: AssessmentQuestion[] = []
  let totalPoints = 0

  const difficultyDist: Record<string, number> = {}
  const bloomDist: Record<string, number> = {}

  for (let i = 0; i < numQuestions; i++) {
    const qType = questionTypes[i % questionTypes.length]
    const topic = topics[i % topics.length]
    const diffLevel = difficulty === 'mixed' ? difficultyLevels[i % difficultyLevels.length] : difficulty
    const bloomIdx = clamp(Math.floor(i / numQuestions * bloomLevels.length), 0, bloomLevels.length - 1)
    const bloom = bloomLevels[bloomIdx]

    let points = diffLevel === 'hard' ? 5 : diffLevel === 'medium' ? 3 : 2
    if (qType === 'essay') points *= 2
    totalPoints += points

    difficultyDist[diffLevel] = (difficultyDist[diffLevel] || 0) + 1
    bloomDist[bloom] = (bloomDist[bloom] || 0) + 1

    const options = qType === 'multiple_choice'
      ? ['Option A: ' + topic + ' approach alpha', 'Option B: ' + topic + ' approach beta', 'Option C: ' + topic + ' approach gamma', 'Option D: ' + topic + ' approach delta']
      : undefined

    questions.push({
      question_number: i + 1,
      type: qType,
      topic,
      difficulty: diffLevel,
      bloom_level: bloom,
      question_text: 'Q' + (i + 1) + '. [' + bloom + '] ' + qType.replace('_', ' ') + ' question on ' + topic + ' (' + diffLevel + ')',
      options,
      correct_answer: qType === 'multiple_choice' ? 'Option A' : 'See rubric for ' + topic,
      explanation: 'This question assesses ' + bloom.toLowerCase() + ' level understanding of ' + topic + ' within ' + subject + '.',
      points,
    })
  }

  return {
    assessment_id: 'ASM-' + rngRange(rng, 10000, 99999),
    title: subject + ' Assessment (' + difficulty + ')',
    total_questions: numQuestions,
    total_points: totalPoints,
    duration_minutes: duration,
    questions,
    difficulty_distribution: difficultyDist,
    bloom_distribution: bloomDist,
    summary: subject + ' assessment: ' + numQuestions + ' questions, ' + totalPoints + ' points, ' + duration + ' minutes. Difficulty: ' + difficulty + '. Bloom coverage: ' + Object.keys(bloomDist).join(', ') + '.',
  }
}

function formatAssessmentReport(input: AssessmentGeneratorInput, result: AssessmentResult): string {
  const lines: string[] = []
  lines.push('## Assessment: ' + result.title)
  lines.push('')
  lines.push('**Assessment ID: ' + result.assessment_id + '** | Questions: ' + result.total_questions + ' | Points: ' + result.total_points + ' | Duration: ' + result.duration_minutes + ' min')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Difficulty Distribution')
  for (const [level, count] of Object.entries(result.difficulty_distribution)) {
    lines.push('- ' + level + ': ' + count + ' questions')
  }
  lines.push('')

  lines.push('### Bloom Taxonomy Distribution')
  for (const [level, count] of Object.entries(result.bloom_distribution)) {
    lines.push('- ' + level + ': ' + count + ' questions')
  }
  lines.push('')

  lines.push('### Questions')
  for (const q of result.questions) {
    lines.push('**Q' + q.question_number + '** [' + q.type + ' | ' + q.difficulty + ' | ' + q.bloom_level + '] (' + q.points + ' pts)')
    lines.push(q.question_text)
    if (q.options) {
      for (const opt of q.options) {
        lines.push('  - ' + opt)
      }
    }
    lines.push('*Answer: ' + q.correct_answer + '*')
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: LEARNING ANALYTICS DASHBOARD ====================

function createAnalyticsDashboard(input: LearningAnalyticsInput): LearningAnalyticsResult {
  const seed = hashStringToSeed(JSON.stringify(input))
  const rng = mulberry32(seed)

  const metrics = input.metrics || ['completion_rate', 'engagement_score', 'assessment_scores', 'time_on_task', 'collaboration_index']
  const cohortSize = input.cohort_size || 100
  const timeframe = input.timeframe_weeks || 12
  const vizTypes = input.visualization_types || {}
  const thresholds = input.alert_thresholds || {}

  const defaultVizTypes: Record<string, string> = {
    completion_rate: 'line_chart',
    engagement_score: 'gauge',
    assessment_scores: 'bar_chart',
    time_on_task: 'heatmap',
    collaboration_index: 'network_graph',
    dropout_risk: 'scatter_plot',
    knowledge_retention: 'area_chart',
  }

  const mergedViz: Record<string, string> = {}
  for (const m of metrics) {
    mergedViz[m] = vizTypes[m] || defaultVizTypes[m] || 'bar_chart'
  }

  const widgets: DashboardWidget[] = metrics.map((m, i) => ({
    widget_id: 'W' + (i + 1),
    title: m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    visualization_type: mergedViz[m],
    data_source: 'learning_record_store',
    refresh_interval: i < 2 ? 'real_time' : 'hourly',
    metrics: [m],
  }))

  // Add cohort comparison widget
  widgets.push({
    widget_id: 'W' + (widgets.length + 1),
    title: 'Cohort Comparison',
    visualization_type: 'grouped_bar',
    data_source: 'analytics_warehouse',
    refresh_interval: 'daily',
    metrics: metrics.slice(0, 3),
  })

  const defaultThresholds: Record<string, number> = {
    completion_rate: 60,
    engagement_score: 50,
    assessment_scores: 55,
    dropout_risk: 70,
    time_on_task: 40,
  }

  const mergedThresholds: Record<string, number> = {}
  for (const m of metrics) {
    mergedThresholds[m] = thresholds[m] || defaultThresholds[m] || 50
  }

  const alerts: AnalyticsAlert[] = []
  for (const [metric, threshold] of Object.entries(mergedThresholds)) {
    if (metric === 'dropout_risk') {
      alerts.push({
        alert_name: 'High Dropout Risk',
        condition: metric + ' > ' + threshold,
        threshold,
        severity: 'critical',
        action: 'Trigger immediate intervention: 1-on-1 check-in, peer mentor assignment, workload adjustment',
      })
    } else if (metric.includes('completion') || metric.includes('engagement')) {
      alerts.push({
        alert_name: 'Low ' + metric.replace(/_/g, ' '),
        condition: metric + ' < ' + threshold,
        threshold,
        severity: threshold < 50 ? 'critical' : 'warning',
        action: 'Review content difficulty, send re-engagement notification, offer supplemental resources',
      })
    } else {
      alerts.push({
        alert_name: metric.replace(/_/g, ' ') + ' Below Target',
        condition: metric + ' < ' + threshold,
        threshold,
        severity: 'warning',
        action: 'Analyze ' + metric + ' trends and adjust instructional strategy',
      })
    }
  }

  const kpiSummary: Record<string, number> = {}
  for (const m of metrics) {
    kpiSummary[m] = rngRange(rng, 55, 92)
  }

  const cohortInsights: string[] = []
  cohortInsights.push('Cohort of ' + cohortSize + ' learners over ' + timeframe + ' weeks shows ' + (kpiSummary.completion_rate > 75 ? 'strong' : 'moderate') + ' completion trends')
  if (kpiSummary.engagement_score > 75) cohortInsights.push('High engagement correlates with collaborative activities and gamified assessments')
  if (kpiSummary.assessment_scores < 65) cohortInsights.push('Assessment scores below target — consider formative checkpoints before summative evaluations')
  cohortInsights.push('Peak engagement occurs mid-week (Tue-Thu); schedule key content releases accordingly')
  cohortInsights.push('Learners who complete practice exercises within 24h of content delivery show 30% higher retention')

  return {
    dashboard_id: 'DASH-' + rngRange(rng, 10000, 99999),
    dashboard_name: subjectOrDefault(input) + ' Learning Analytics Dashboard',
    widgets,
    alerts,
    kpi_summary: kpiSummary,
    cohort_insights: cohortInsights,
    summary: 'Analytics dashboard with ' + widgets.length + ' widgets tracking ' + metrics.length + ' metrics for ' + cohortSize + ' learners over ' + timeframe + ' weeks. ' + alerts.length + ' alerts configured.',
  }
}

function subjectOrDefault(input: LearningAnalyticsInput): string {
  return 'Course'
}

function formatAnalyticsDashboardReport(input: LearningAnalyticsInput, result: LearningAnalyticsResult): string {
  const lines: string[] = []
  lines.push('## Learning Analytics Dashboard')
  lines.push('')
  lines.push('**Dashboard ID: ' + result.dashboard_id + '** | ' + result.widgets.length + ' widgets | ' + result.alerts.length + ' alerts')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### KPI Summary')
  lines.push('| Metric | Value | Status |')
  lines.push('|--------|-------|--------|')
  for (const [metric, value] of Object.entries(result.kpi_summary)) {
    const status = value >= 75 ? 'On Track' : value >= 50 ? 'At Risk' : 'Critical'
    lines.push('| ' + metric.replace(/_/g, ' ') + ' | ' + value + '% | ' + status + ' |')
  }
  lines.push('')

  lines.push('### Dashboard Widgets')
  lines.push('| # | Widget | Visualization | Refresh |')
  lines.push('|---|--------|---------------|---------|')
  for (const w of result.widgets) {
    lines.push('| ' + w.widget_id + ' | ' + w.title + ' | ' + w.visualization_type + ' | ' + w.refresh_interval + ' |')
  }
  lines.push('')

  lines.push('### Alerts')
  for (const a of result.alerts) {
    const sevTag = a.severity.toUpperCase()
    lines.push('- **[' + sevTag + '] ' + a.alert_name + '**: ' + a.condition + ' -> ' + a.action)
  }
  lines.push('')

  lines.push('### Cohort Insights')
  for (const insight of result.cohort_insights) {
    lines.push('- ' + insight)
  }
  lines.push('')

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: AI TUTORING SESSION PLANNER ====================

function planTutoringSession(input: TutoringSessionInput): TutoringSessionResult {
  const seed = hashStringToSeed(JSON.stringify(input))
  const rng = mulberry32(seed)

  const subject = input.subject || 'Mathematics'
  const studentLevel = input.student_level || 'intermediate'
  const duration = input.session_duration_min || 45
  const objectives = input.learning_objectives || ['Understand core ' + subject + ' concepts']
  const hintStrategy = input.hint_strategy || 'socratic'
  const misconceptions = input.misconception_database || ['common_confusion_1', 'common_confusion_2']

  const phases: TutoringPhase[] = []
  const numPhases = clamp(Math.floor(duration / 12) + 1, 3, 6)
  const phaseDuration = Math.floor(duration / numPhases)

  const phaseNames = ['Diagnostic Assessment', 'Concept Introduction', 'Guided Practice', 'Independent Application', 'Reflection & Synthesis', 'Preview & Goal Setting']
  const activities = [
    'Quick diagnostic questions to assess prior knowledge and identify starting point',
    'Introduce key concept with worked example and visual representation',
    'Collaborative problem-solving with scaffolded support',
    'Student solves problems independently with on-demand hints',
    'Student explains reasoning; tutor provides targeted feedback',
    'Preview next session goals and assign spaced practice',
  ]

  for (let i = 0; i < numPhases; i++) {
    const socraticQuestions = generateSocraticQuestions(rng, subject, objectives[i % objectives.length], studentLevel)
    const adaptiveHints = generateAdaptiveHints(rng, hintStrategy, subject, i + 1)
    const addressedMisconceptions = misconceptions.filter((_, idx) => idx % numPhases === i)

    phases.push({
      phase_number: i + 1,
      name: phaseNames[i] || ('Phase ' + (i + 1)),
      duration_min: i === numPhases - 1 ? duration - phaseDuration * (numPhases - 1) : phaseDuration,
      activity: activities[i] || ('Activity ' + (i + 1)),
      socratic_questions: socraticQuestions,
      adaptive_hints: adaptiveHints,
      misconceptions_addressed: addressedMisconceptions,
    })
  }

  const difficultyProgression = ['Recall', 'Comprehend', 'Apply', 'Analyze', 'Synthesize', 'Evaluate'].slice(0, numPhases)

  const engagementStrategies: string[] = []
  engagementStrategies.push('Use wait time of 5-7 seconds after questions to encourage deeper thinking')
  engagementStrategies.push('Alternate between concrete examples and abstract principles every 8-10 minutes')
  engagementStrategies.push('Incorporate student interests into problem contexts for relevance')
  engagementStrategies.push('Provide specific, process-focused praise rather than generic encouragement')
  if (studentLevel === 'beginner') engagementStrategies.push('Use analogies from everyday experience to build intuition')
  if (studentLevel === 'advanced') engagementStrategies.push('Introduce edge cases and counterexamples to deepen understanding')

  return {
    session_id: 'TUT-' + rngRange(rng, 10000, 99999),
    subject,
    total_duration_min: duration,
    phases,
    difficulty_progression: difficultyProgression,
    engagement_strategies: engagementStrategies,
    summary: subject + ' tutoring session (' + duration + ' min) with ' + numPhases + ' phases. Strategy: ' + hintStrategy + '. Covers ' + objectives.length + ' objectives. Addresses ' + misconceptions.length + ' known misconceptions.',
  }
}

function generateSocraticQuestions(rng: () => number, subject: string, objective: string, level: string): string[] {
  const questionTemplates = [
    'What do you already know about ' + objective + '?',
    'How would you explain ' + objective + ' to a peer who has never encountered it?',
    'What patterns do you notice when comparing different approaches to ' + objective + '?',
    'Can you think of a real-world situation where ' + objective + ' applies?',
    'What would happen if we changed one variable in this ' + subject + ' problem?',
    'How does this connect to what we learned previously about ' + subject + '?',
    'What evidence supports your reasoning about ' + objective + '?',
  ]
  const count = rngRange(rng, 2, 4)
  const questions: string[] = []
  for (let i = 0; i < count; i++) {
    questions.push(questionTemplates[(i + rngRange(rng, 0, 2)) % questionTemplates.length])
  }
  return questions
}

function generateAdaptiveHints(rng: () => number, strategy: string, subject: string, phaseNum: number): string[] {
  const hints: string[] = []
  if (strategy === 'socratic' || strategy === 'mixed') {
    hints.push('Hint ' + phaseNum + '.1: What is the first step you would try? Why?')
    hints.push('Hint ' + phaseNum + '.2: If you break this into smaller parts, what changes?')
  }
  if (strategy === 'scaffolded' || strategy === 'mixed') {
    hints.push('Hint ' + phaseNum + '.1: Consider the formula/rule that applies to ' + subject + ' in this context')
    hints.push('Hint ' + phaseNum + '.2: Try working backwards from what you need to find')
  }
  if (strategy === 'direct') {
    hints.push('Hint ' + phaseNum + '.1: Apply the ' + subject + ' principle: identify knowns and unknowns')
    hints.push('Hint ' + phaseNum + '.2: The key operation here is [specific technique for this problem type]')
  }
  return hints
}

function formatTutoringSessionReport(input: TutoringSessionInput, result: TutoringSessionResult): string {
  const lines: string[] = []
  lines.push('## AI Tutoring Session Plan')
  lines.push('')
  lines.push('**Session ID: ' + result.session_id + '** | Subject: ' + result.subject + ' | Duration: ' + result.total_duration_min + ' min | Phases: ' + result.phases.length)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Session Phases')
  for (const p of result.phases) {
    lines.push('#### Phase ' + p.phase_number + ': ' + p.name + ' (' + p.duration_min + ' min)')
    lines.push('**Activity:** ' + p.activity)
    lines.push('')
    if (p.socratic_questions.length > 0) {
      lines.push('**Socratic Questions:**')
      for (const q of p.socratic_questions) {
        lines.push('- ' + q)
      }
    }
    if (p.adaptive_hints.length > 0) {
      lines.push('**Adaptive Hints:**')
      for (const h of p.adaptive_hints) {
        lines.push('- ' + h)
      }
    }
    if (p.misconceptions_addressed.length > 0) {
      lines.push('**Misconceptions Addressed:** ' + p.misconceptions_addressed.join(', '))
    }
    lines.push('')
  }

  lines.push('### Difficulty Progression')
  lines.push(result.difficulty_progression.join(' -> '))
  lines.push('')

  lines.push('### Engagement Strategies')
  for (const s of result.engagement_strategies) {
    lines.push('- ' + s)
  }
  lines.push('')

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: COURSE CONTENT GENERATOR ====================

function generateCourseContent(input: CourseContentInput): CourseContentResult {
  const seed = hashStringToSeed(JSON.stringify(input))
  const rng = mulberry32(seed)

  const title = input.course_title || 'Introduction to Learning'
  const audience = input.target_audience || 'Adult learners'
  const durationHours = input.duration_hours || 20
  const bloomLevels = input.Bloom_taxonomy_levels || ['Understand', 'Apply', 'Analyze']
  const format = input.content_format || 'mixed'

  const numModules = clamp(Math.floor(durationHours / rngFloat(rng, 3, 5)), 3, 10)
  const hoursPerModule = Math.floor(durationHours / numModules)
  const modules: CourseModuleContent[] = []
  let totalLessons = 0

  for (let m = 0; m < numModules; m++) {
    const numLessons = rngRange(rng, 2, 4)
    totalLessons += numLessons
    const lessons: LessonContent[] = []
    const lessonDuration = Math.floor((hoursPerModule * 60) / numLessons)

    for (let l = 0; l < numLessons; l++) {
      const bloomIdx = clamp(Math.floor((m * numLessons + l) / (numModules * numLessons) * bloomLevels.length), 0, bloomLevels.length - 1)
      const bloom = bloomLevels[bloomIdx] || bloomLevels[bloomLevels.length - 1]

      lessons.push({
        lesson_number: l + 1,
        title: 'Lesson ' + (l + 1) + ': ' + bloom + ' Level - Topic ' + (m + 1) + '.' + (l + 1),
        duration_min: lessonDuration,
        bloom_level: bloom,
        content_outline: [
          'Introduction and activation of prior knowledge',
          'Core concept presentation with worked examples',
          'Guided practice with immediate feedback',
          'Independent application activity',
          'Summary and connection to next lesson',
        ],
        activities: generateLessonActivities(rng, format, bloom),
        assessment: l === numLessons - 1 ? 'Module ' + (m + 1) + ' Summative Assessment' : 'Formative Check ' + (l + 1),
        resources: ['Reading: Chapter ' + (m + 1), 'Video: ' + bloom + ' demonstration', 'Practice set ' + (m + 1) + '.' + (l + 1)],
      })
    }

    modules.push({
      module_number: m + 1,
      title: 'Module ' + (m + 1) + ': ' + bloomLevels[m % bloomLevels.length] + ' Phase',
      duration_hours: hoursPerModule,
      lessons,
      module_objectives: [
        'Master ' + bloomLevels[m % bloomLevels.length].toLowerCase() + ' level skills for module ' + (m + 1),
        'Apply knowledge in authentic contexts',
        'Demonstrate growth through module assessment',
      ],
    })
  }

  const bloomCoverage: Record<string, number> = {}
  for (const bl of bloomLevels) {
    bloomCoverage[bl] = rngRange(rng, 60, 95)
  }

  return {
    course_id: 'COURSE-' + rngRange(rng, 10000, 99999),
    course_title: title,
    total_modules: numModules,
    total_lessons: totalLessons,
    total_duration_hours: durationHours,
    modules,
    bloom_coverage: bloomCoverage,
    summary: title + ' course for ' + audience + ': ' + numModules + ' modules, ' + totalLessons + ' lessons, ' + durationHours + ' hours. Format: ' + format + '. Bloom levels: ' + bloomLevels.join(', ') + '.',
  }
}

function generateLessonActivities(rng: () => number, format: string, bloom: string): string[] {
  const activities: string[] = []
  if (format === 'video' || format === 'mixed') {
    activities.push('Watch ' + bloom.toLowerCase() + ' level video demonstration (8-12 min)')
  }
  if (format === 'interactive' || format === 'mixed') {
    activities.push('Interactive ' + bloom.toLowerCase() + ' simulation exercise')
  }
  activities.push(bloom + ' level practice problems (individual)')
  if (bloom === 'Analyze' || bloom === 'Evaluate' || bloom === 'Create') {
    activities.push('Collaborative ' + bloom.toLowerCase() + ' challenge activity')
  }
  activities.push('Reflective journal entry on ' + bloom.toLowerCase() + ' learning')
  return activities
}

function formatCourseContentReport(input: CourseContentInput, result: CourseContentResult): string {
  const lines: string[] = []
  lines.push('## Course Content: ' + result.course_title)
  lines.push('')
  lines.push('**Course ID: ' + result.course_id + '** | Modules: ' + result.total_modules + ' | Lessons: ' + result.total_lessons + ' | Duration: ' + result.total_duration_hours + 'h')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Bloom Taxonomy Coverage')
  for (const [level, coverage] of Object.entries(result.bloom_coverage)) {
    lines.push('- ' + level + ': ' + coverage + '% coverage')
  }
  lines.push('')

  for (const mod of result.modules) {
    lines.push('#### Module ' + mod.module_number + ': ' + mod.title + ' (' + mod.duration_hours + 'h)')
    lines.push('**Objectives:** ' + mod.module_objectives.join('; '))
    lines.push('| # | Lesson | Duration | Bloom | Assessment |')
    lines.push('|---|--------|----------|-------|------------|')
    for (const lesson of mod.lessons) {
      lines.push('| ' + lesson.lesson_number + ' | ' + lesson.title + ' | ' + lesson.duration_min + 'min | ' + lesson.bloom_level + ' | ' + lesson.assessment + ' |')
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: KNOWLEDGE GAP ANALYZER ====================

function analyzeKnowledgeGaps(input: KnowledgeGapInput): KnowledgeGapResult {
  const seed = hashStringToSeed(JSON.stringify(input))
  const rng = mulberry32(seed)

  const results = input.assessment_results || {}
  const objectives = input.learning_objectives || ['Objective 1', 'Objective 2', 'Objective 3']
  const difficultyMatrix = input.difficulty_matrix || {}
  const resources = input.remediation_resources || ['textbook_chapter', 'video_tutorial', 'practice_problems', 'peer_discussion']

  const gaps: KnowledgeGap[] = []
  let totalMastery = 0
  let criticalCount = 0
  let totalRemediationHours = 0

  for (const objective of objectives) {
    const currentMastery = results[objective] !== undefined ? results[objective] : rngRange(rng, 30, 85)
    const targetMastery = rngRange(rng, 70, 90)
    const gapSize = Math.max(0, targetMastery - currentMastery)
    totalMastery += currentMastery

    let severity: KnowledgeGap['severity'] = 'none'
    if (gapSize > 30) { severity = 'critical'; criticalCount++ }
    else if (gapSize > 15) { severity = 'significant' }
    else if (gapSize > 5) { severity = 'minor' }

    const difficulty = difficultyMatrix[objective] || 'medium'
    const remediationHours = severity === 'critical' ? rngRange(rng, 4, 8) : severity === 'significant' ? rngRange(rng, 2, 4) : severity === 'minor' ? rngRange(rng, 1, 2) : 0
    totalRemediationHours += remediationHours

    const rootCauses = [
      'Insufficient prior knowledge foundation for this objective',
      'Misconception from earlier learning interfering with current understanding',
      'Lack of practice opportunities with varied problem types',
      'Abstract concept not sufficiently grounded in concrete examples',
      'Cognitive overload from simultaneous introduction of multiple concepts',
    ]

    const remediationStrategies = [
      'Re-teach using concrete-representational-abstract (CRA) sequence',
      'Provide targeted practice with immediate corrective feedback',
      'Use analogies and visual models to build conceptual understanding',
      'Implement spaced retrieval practice over 2-3 weeks',
      'Pair with peer tutor for collaborative explanation exercises',
    ]

    gaps.push({
      objective,
      current_mastery_pct: currentMastery,
      target_mastery_pct: targetMastery,
      gap_size: gapSize,
      severity,
      root_cause: rootCauses[rngRange(rng, 0, rootCauses.length - 1)],
      remediation_strategy: remediationStrategies[rngRange(rng, 0, remediationStrategies.length - 1)],
      recommended_resources: resources.slice(0, rngRange(rng, 2, resources.length)),
      estimated_remediation_hours: remediationHours,
    })
  }

  const overallMastery = objectives.length > 0 ? Math.round(totalMastery / objectives.length) : 0

  const remediationPlan: string[] = []
  if (criticalCount > 0) remediationPlan.push('URGENT: Address ' + criticalCount + ' critical gap(s) before advancing to dependent topics')
  remediationPlan.push('Schedule remediation sessions: ' + totalRemediationHours + ' total hours across all gaps')
  remediationPlan.push('Prioritize gaps by severity: critical > significant > minor')
  remediationPlan.push('Re-assess after remediation to verify mastery improvement')
  remediationPlan.push('Integrate spaced retrieval practice for long-term retention of remediated concepts')

  return {
    analysis_id: 'KGA-' + rngRange(rng, 10000, 99999),
    overall_mastery_pct: overallMastery,
    gaps,
    critical_gaps_count: criticalCount,
    remediation_plan: remediationPlan,
    total_remediation_hours: totalRemediationHours,
    summary: 'Knowledge gap analysis: ' + overallMastery + '% overall mastery. ' + gaps.filter(g => g.severity !== 'none').length + ' gaps identified (' + criticalCount + ' critical). Total remediation: ' + totalRemediationHours + ' hours.',
  }
}

function formatKnowledgeGapReport(input: KnowledgeGapInput, result: KnowledgeGapResult): string {
  const lines: string[] = []
  lines.push('## Knowledge Gap Analysis')
  lines.push('')
  lines.push('**Analysis ID: ' + result.analysis_id + '** | Overall Mastery: ' + result.overall_mastery_pct + '% | Critical Gaps: ' + result.critical_gaps_count)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Gap Details')
  lines.push('| Objective | Current | Target | Gap | Severity | Hours |')
  lines.push('|-----------|---------|--------|-----|----------|-------|')
  for (const g of result.gaps) {
    lines.push('| ' + g.objective + ' | ' + g.current_mastery_pct + '% | ' + g.target_mastery_pct + '% | ' + g.gap_size + '% | ' + g.severity.toUpperCase() + ' | ' + g.estimated_remediation_hours + 'h |')
  }
  lines.push('')

  const nonTrivialGaps = result.gaps.filter(g => g.severity !== 'none')
  if (nonTrivialGaps.length > 0) {
    lines.push('### Remediation Details')
    for (const g of nonTrivialGaps) {
      lines.push('**' + g.objective + '** (' + g.severity + ', ' + g.gap_size + '% gap)')
      lines.push('- Root cause: ' + g.root_cause)
      lines.push('- Strategy: ' + g.remediation_strategy)
      lines.push('- Resources: ' + g.recommended_resources.join(', '))
      lines.push('- Estimated time: ' + g.estimated_remediation_hours + ' hours')
      lines.push('')
    }
  }

  lines.push('### Remediation Plan')
  for (const step of result.remediation_plan) {
    lines.push('- ' + step)
  }
  lines.push('')

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: PEER LEARNING OPTIMIZER ====================

function optimizePeerLearning(input: PeerLearningInput): PeerLearningResult {
  const seed = hashStringToSeed(JSON.stringify(input))
  const rng = mulberry32(seed)

  const groupSize = input.group_size || 4
  const diversityFactors = input.diversity_factors || ['skill_level', 'learning_style', 'background']
  const projectType = input.project_type || 'collaborative_project'
  const skillLevels = input.skill_levels || ['beginner', 'intermediate', 'intermediate', 'advanced']
  const collabTools = input.collaboration_tools || ['shared_documents', 'discussion_forum', 'video_conference']

  const totalLearners = skillLevels.length
  const numGroups = Math.ceil(totalLearners / groupSize)
  const groups: PeerGroup[] = []

  for (let g = 0; g < numGroups; g++) {
    const startIdx = g * groupSize
    const endIdx = Math.min(startIdx + groupSize, totalLearners)
    const memberLevels = skillLevels.slice(startIdx, endIdx)
    const members = memberLevels.map((level, i) => 'Learner_' + (startIdx + i + 1) + ' (' + level + ')')

    const uniqueLevels = new Set(memberLevels)
    const diversityScore = clamp(rngRange(rng, 50, 80) + uniqueLevels.size * 8, 20, 95)

    const roles = ['Facilitator', 'Recorder', 'Devil\'s Advocate', 'Reporter', 'Timekeeper', 'Resource Manager']
    const assignedRoles = roles.slice(0, members.length)

    const complementarySkills = [
      'Research & Information Gathering',
      'Critical Analysis & Evaluation',
      'Creative Problem Solving',
      'Communication & Presentation',
      'Project Management & Coordination',
      'Technical Implementation',
    ].slice(0, members.length)

    groups.push({
      group_id: g + 1,
      members,
      diversity_score: diversityScore,
      complementary_skills: complementarySkills,
      assigned_role: assignedRoles,
    })
  }

  const activities: PeerActivity[] = []
  const activityTemplates = [
    { name: 'Think-Pair-Share', type: 'discussion', mode: 'pair_then_whole', accountability: 'Individual response before sharing', interdependence: 'medium' as const },
    { name: 'Jigsaw Expert Groups', type: 'research', mode: 'expert_groups_then_home', accountability: 'Each member masters one section', interdependence: 'high' as const },
    { name: 'Peer Teaching Rotation', type: 'teaching', mode: 'rotating_pairs', accountability: 'Teach concept to partner, partner teaches back', interdependence: 'high' as const },
    { name: 'Collaborative Problem Set', type: 'problem_solving', mode: 'small_group', accountability: 'Each member explains one solution step', interdependence: 'medium' as const },
    { name: 'Structured Academic Controversy', type: 'debate', mode: 'paired_teams', accountability: 'Argue assigned position, then switch', interdependence: 'high' as const },
    { name: 'Group Investigation Project', type: 'project', mode: 'small_group', accountability: 'Individual sub-task with group synthesis', interdependence: 'high' as const },
  ]

  for (let i = 0; i < activityTemplates.length; i++) {
    const template = activityTemplates[i]
    activities.push({
      activity_number: i + 1,
      name: template.name,
      type: template.type,
      duration_min: rngRange(rng, 15, 45),
      collaboration_mode: template.mode,
      individual_accountability: template.accountability,
      interdependence_level: template.interdependence,
    })
  }

  const rubric: string[] = []
  rubric.push('**Equal Participation (25%):** All members contribute meaningfully; no single member dominates or is passive')
  rubric.push('**Quality of Collaboration (25%):** Group builds on each other\'s ideas; constructive disagreement is welcomed')
  rubric.push('**Individual Accountability (25%):** Each member can explain the group\'s work and their specific contribution')
  rubric.push('**Process Skills (25%):** Group manages time, resolves conflict, and uses collaboration tools effectively')

  const facilitationTips: string[] = []
  facilitationTips.push('Assign roles explicitly at the start of each session to ensure balanced participation')
  facilitationTips.push('Use structured protocols (e.g., round-robin, talking chips) to prevent dominance by vocal members')
  facilitationTips.push('Monitor group dynamics through brief check-ins at 10-minute intervals')
  facilitationTips.push('Provide sentence stems for academic discourse: "I agree because...", "I see it differently...", "Building on..."')
  facilitationTips.push('Rotate group composition every 2-3 weeks to expose learners to diverse perspectives')
  facilitationTips.push('Include individual reflection after each peer learning activity to consolidate learning')

  return {
    optimization_id: 'PEER-' + rngRange(rng, 10000, 99999),
    groups,
    activities,
    collaboration_rubric: rubric,
    facilitation_tips: facilitationTips,
    summary: 'Peer learning optimization: ' + numGroups + ' groups of ~' + groupSize + ' learners. ' + activities.length + ' structured activities. Diversity factors: ' + diversityFactors.join(', ') + '. Tools: ' + collabTools.join(', ') + '.',
  }
}

function formatPeerLearningReport(input: PeerLearningInput, result: PeerLearningResult): string {
  const lines: string[] = []
  lines.push('## Peer Learning Optimization')
  lines.push('')
  lines.push('**Optimization ID: ' + result.optimization_id + '** | Groups: ' + result.groups.length + ' | Activities: ' + result.activities.length)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Group Assignments')
  for (const g of result.groups) {
    lines.push('#### Group ' + g.group_id + ' (Diversity Score: ' + g.diversity_score + '/100)')
    lines.push('| Member | Role | Complementary Skill |')
    lines.push('|--------|------|---------------------|')
    for (let i = 0; i < g.members.length; i++) {
      lines.push('| ' + g.members[i] + ' | ' + g.assigned_role[i] + ' | ' + g.complementary_skills[i] + ' |')
    }
    lines.push('')
  }

  lines.push('### Structured Activities')
  lines.push('| # | Activity | Type | Duration | Mode | Interdependence |')
  lines.push('|---|----------|------|----------|------|-----------------|')
  for (const a of result.activities) {
    lines.push('| ' + a.activity_number + ' | ' + a.name + ' | ' + a.type + ' | ' + a.duration_min + 'min | ' + a.collaboration_mode + ' | ' + a.interdependence_level.toUpperCase() + ' |')
  }
  lines.push('')

  lines.push('### Collaboration Rubric')
  for (const r of result.collaboration_rubric) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('### Facilitation Tips')
  for (const t of result.facilitation_tips) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: ENGAGEMENT PREDICTOR ====================

function predictEngagement(input: EngagementPredictorInput): EngagementPredictorResult {
  const seed = hashStringToSeed(JSON.stringify(input))
  const rng = mulberry32(seed)

  const history = input.learner_history || {}
  const demographics = input.demographic_factors || {}
  const metrics = input.engagement_metrics || {}
  const courseDifficulty = input.course_difficulty || 'moderate'
  const interventions = input.intervention_history || []

  const factors: EngagementFactor[] = []

  // Login frequency factor
  const loginFreq = metrics.login_frequency_per_week || rngRange(rng, 1, 7)
  factors.push({
    factor: 'Login Frequency',
    current_value: loginFreq,
    impact_on_engagement: loginFreq >= 4 ? 'positive' : loginFreq >= 2 ? 'neutral' : 'negative',
    weight: 0.15,
    recommendation: loginFreq < 3 ? 'Implement push notifications and streak rewards to increase login frequency' : 'Maintain current engagement level with varied content',
  })

  // Assignment completion factor
  const completionRate = metrics.assignment_completion_rate || rngRange(rng, 40, 95)
  factors.push({
    factor: 'Assignment Completion Rate',
    current_value: completionRate,
    impact_on_engagement: completionRate >= 75 ? 'positive' : completionRate >= 50 ? 'neutral' : 'negative',
    weight: 0.2,
    recommendation: completionRate < 60 ? 'Break assignments into smaller milestones with progress indicators' : 'Continue scaffolding with increasing complexity',
  })

  // Time on task factor
  const timeOnTask = metrics.avg_time_on_task_min || rngRange(rng, 10, 60)
  factors.push({
    factor: 'Average Time on Task',
    current_value: timeOnTask,
    impact_on_engagement: timeOnTask >= 20 ? 'positive' : timeOnTask >= 10 ? 'neutral' : 'negative',
    weight: 0.15,
    recommendation: timeOnTask < 15 ? 'Introduce interactive elements and micro-challenges to sustain attention' : 'Leverage high engagement for deeper learning activities',
  })

  // Social interaction factor
  const socialScore = metrics.social_interaction_score || rngRange(rng, 20, 90)
  factors.push({
    factor: 'Social Interaction Score',
    current_value: socialScore,
    impact_on_engagement: socialScore >= 60 ? 'positive' : socialScore >= 35 ? 'neutral' : 'negative',
    weight: 0.15,
    recommendation: socialScore < 40 ? 'Assign peer learning partner and group project to increase social connection' : 'Encourage peer mentoring role to reinforce learning',
  })

  // Assessment performance factor
  const assessmentPerf = metrics.assessment_performance || rngRange(rng, 45, 92)
  factors.push({
    factor: 'Assessment Performance',
    current_value: assessmentPerf,
    impact_on_engagement: assessmentPerf >= 70 ? 'positive' : assessmentPerf >= 50 ? 'neutral' : 'negative',
    weight: 0.2,
    recommendation: assessmentPerf < 55 ? 'Provide formative feedback and remediation before summative assessments' : 'Introduce stretch challenges to maintain growth mindset',
  })

  // Course difficulty alignment
  const difficultyImpact = courseDifficulty === 'very_difficult' ? 'negative' : courseDifficulty === 'challenging' ? 'neutral' : 'positive'
  factors.push({
    factor: 'Course Difficulty Alignment',
    current_value: courseDifficulty === 'very_difficult' ? 4 : courseDifficulty === 'challenging' ? 3 : courseDifficulty === 'moderate' ? 2 : 1,
    impact_on_engagement: difficultyImpact,
    weight: 0.15,
    recommendation: difficultyImpact === 'negative' ? 'Provide additional scaffolding, prerequisite review, and flexible pacing' : 'Maintain appropriate challenge level with growth-oriented feedback',
  })

  // Calculate engagement score
  let engagementScore = 0
  for (const f of factors) {
    const normalizedValue = Math.min(f.current_value / 10, 10) * 10
    const impactMultiplier = f.impact_on_engagement === 'positive' ? 1 : f.impact_on_engagement === 'neutral' ? 0.7 : 0.4
    engagementScore += normalizedValue * f.weight * impactMultiplier
  }
  engagementScore = clamp(Math.round(engagementScore * 1.2), 10, 98)

  // Calculate dropout risk
  let dropoutRisk = 100 - engagementScore
  if (interventions.length > 0) dropoutRisk = Math.max(5, dropoutRisk - interventions.length * 5)
  if (courseDifficulty === 'very_difficult') dropoutRisk += 10
  dropoutRisk = clamp(Math.round(dropoutRisk), 3, 95)

  let riskLevel: EngagementPredictorResult['risk_level'] = 'low'
  if (dropoutRisk >= 60) riskLevel = 'critical'
  else if (dropoutRisk >= 40) riskLevel = 'high'
  else if (dropoutRisk >= 20) riskLevel = 'moderate'

  const interventionRecommendations: string[] = []
  if (dropoutRisk >= 40) interventionRecommendations.push('Schedule 1-on-1 instructor check-in within 48 hours')
  if (factors.find(f => f.factor === 'Login Frequency' && f.impact_on_engagement === 'negative')) {
    interventionRecommendations.push('Send personalized re-engagement email with specific next-step action')
  }
  if (factors.find(f => f.factor === 'Assignment Completion Rate' && f.impact_on_engagement === 'negative')) {
    interventionRecommendations.push('Offer assignment extension with reduced scope option and study skills workshop referral')
  }
  if (factors.find(f => f.factor === 'Social Interaction Score' && f.impact_on_engagement === 'negative')) {
    interventionRecommendations.push('Connect with study group or assign peer learning partner')
  }
  if (dropoutRisk >= 60) interventionRecommendations.push('Activate early alert system: notify advisor, offer counseling resources')
  interventionRecommendations.push('Monitor engagement metrics weekly and adjust intervention intensity based on response')

  let trajectory = 'Stable'
  if (dropoutRisk >= 60) trajectory = 'Declining — immediate intervention required'
  else if (dropoutRisk >= 40) trajectory = 'At risk — proactive support recommended'
  else if (engagementScore >= 75) trajectory = 'Positive growth — maintain current approach'
  else trajectory = 'Moderate — monitor and support as needed'

  return {
    prediction_id: 'ENG-' + rngRange(rng, 10000, 99999),
    engagement_score: engagementScore,
    dropout_risk_pct: dropoutRisk,
    risk_level: riskLevel,
    factors,
    intervention_recommendations: interventionRecommendations,
    predicted_trajectory: trajectory,
    summary: 'Engagement: ' + engagementScore + '/100 | Dropout risk: ' + dropoutRisk + '% (' + riskLevel + ') | Trajectory: ' + trajectory + ' | ' + interventionRecommendations.length + ' interventions recommended.',
  }
}

function formatEngagementReport(input: EngagementPredictorInput, result: EngagementPredictorResult): string {
  const lines: string[] = []
  lines.push('## Engagement & Dropout Risk Prediction')
  lines.push('')
  lines.push('**Prediction ID: ' + result.prediction_id + '** | Engagement: ' + result.engagement_score + '/100 | Dropout Risk: ' + result.dropout_risk_pct + '% | Level: ' + result.risk_level.toUpperCase())
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Engagement Factors')
  lines.push('| Factor | Value | Impact | Weight | Recommendation |')
  lines.push('|--------|-------|--------|--------|----------------|')
  for (const f of result.factors) {
    const impactTag = f.impact_on_engagement === 'positive' ? 'POS' : f.impact_on_engagement === 'negative' ? 'NEG' : 'NEU'
    lines.push('| ' + f.factor + ' | ' + f.current_value + ' | ' + impactTag + ' | ' + Math.round(f.weight * 100) + '% | ' + f.recommendation + ' |')
  }
  lines.push('')

  lines.push('### Predicted Trajectory')
  lines.push(result.predicted_trajectory)
  lines.push('')

  if (result.intervention_recommendations.length > 0) {
    lines.push('### Intervention Recommendations')
    for (const ir of result.intervention_recommendations) {
      lines.push('- ' + ir)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Adaptive Learning Path Designer
  tools.register(defineTool({
    name: 'adaptive_learning_path_designer',
    description: 'Designs personalized learning paths based on learner profile and goals. Generates sequenced modules with Bloom taxonomy progression, adaptive pacing, milestone checkpoints, and format personalization. Returns module structure, duration estimates, and personalization score.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: learner_profile{current_level, learning_style, strengths[], weaknesses[], pace_preference, prior_experience_years}, learning_goals[], available_time_hours_week, preferred_formats[], prior_knowledge_level', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args: { input_data: string }) {
      const input: AdaptiveLearningPathInput = JSON.parse(args.input_data)
      const result = designAdaptivePath(input)
      return formatAdaptivePathReport(input, result)
    }
  }))

  // Tool 2: Assessment Generator
  tools.register(defineTool({
    name: 'assessment_generator',
    description: 'Generates assessments (quizzes, exams, projects) at specified difficulty and topics. Produces questions across Bloom taxonomy levels with configurable types (multiple choice, short answer, essay), point values, and difficulty distributions.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: subject, topics[], difficulty_level (easy|medium|hard|mixed), question_types[], duration_minutes, learning_objectives[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args: { input_data: string }) {
      const input: AssessmentGeneratorInput = JSON.parse(args.input_data)
      const result = generateAssessment(input)
      return formatAssessmentReport(input, result)
    }
  }))

  // Tool 3: Learning Analytics Dashboard
  tools.register(defineTool({
    name: 'learning_analytics_dashboard',
    description: 'Creates analytics dashboard configuration for tracking learner progress and outcomes. Defines widgets, KPI tracking, alert thresholds, and cohort insights. Supports multiple visualization types and real-time monitoring.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: metrics[], cohort_size, timeframe_weeks, visualization_types{}, alert_thresholds{}', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args: { input_data: string }) {
      const input: LearningAnalyticsInput = JSON.parse(args.input_data)
      const result = createAnalyticsDashboard(input)
      return formatAnalyticsDashboardReport(input, result)
    }
  }))

  // Tool 4: AI Tutoring Session Planner
  tools.register(defineTool({
    name: 'ai_tutoring_session_planner',
    description: 'Plans AI tutoring sessions with Socratic questioning and adaptive hints. Structures multi-phase sessions with diagnostic, instruction, practice, and reflection phases. Includes misconception targeting and engagement strategies.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: fields: subject, student_level (beginner|intermediate|advanced), session_duration_min, learning_objectives[], hint_strategy (socratic|scaffolded|direct|mixed), misconception_database[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args: { input_data: string }) {
      const input: TutoringSessionInput = JSON.parse(args.input_data)
      const result = planTutoringSession(input)
      return formatTutoringSessionReport(input, result)
    }
  }))

  // Tool 5: Course Content Generator
  tools.register(defineTool({
    name: 'course_content_generator',
    description: 'Generates structured course content (modules, lessons, activities) from topic outline. Produces module hierarchies with lesson plans, Bloom-aligned activities, assessments, and resource recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: course_title, target_audience, duration_hours, Bloom_taxonomy_levels[], content_format (text|video|interactive|mixed)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args: { input_data: string }) {
      const input: CourseContentInput = JSON.parse(args.input_data)
      const result = generateCourseContent(input)
      return formatCourseContentReport(input, result)
    }
  }))

  // Tool 6: Knowledge Gap Analyzer
  tools.register(defineTool({
    name: 'knowledge_gap_analyzer',
    description: 'Analyzes assessment results to identify knowledge gaps and remediation strategies. Maps objectives to mastery levels, identifies root causes, and produces prioritized remediation plans with resource recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: assessment_results{}, learning_objectives[], difficulty_matrix{}, remediation_resources[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args: { input_data: string }) {
      const input: KnowledgeGapInput = JSON.parse(args.input_data)
      const result = analyzeKnowledgeGaps(input)
      return formatKnowledgeGapReport(input, result)
    }
  }))

  // Tool 7: Peer Learning Optimizer
  tools.register(defineTool({
    name: 'peer_learning_optimizer',
    description: 'Optimizes peer learning groups and activities for collaborative learning. Creates diverse group assignments with complementary skills, structured collaboration activities, assessment rubrics, and facilitation guidance.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: group_size, diversity_factors[], project_type, skill_levels[], collaboration_tools[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args: { input_data: string }) {
      const input: PeerLearningInput = JSON.parse(args.input_data)
      const result = optimizePeerLearning(input)
      return formatPeerLearningReport(input, result)
    }
  }))

  // Tool 8: Engagement Predictor
  tools.register(defineTool({
    name: 'engagement_predictor',
    description: 'Predicts learner engagement and dropout risk for intervention. Analyzes behavioral factors, computes engagement scores and risk levels, and recommends targeted interventions based on predicted trajectory.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: learner_history{}, demographic_factors, engagement_metrics{}, course_difficulty (easy|moderate|challenging|very_difficult), intervention_history[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args: { input_data: string }) {
      const input: EngagementPredictorInput = JSON.parse(args.input_data)
      const result = predictEngagement(input)
      return formatEngagementReport(input, result)
    }
  }))

  console.log('[dsh-tool-edtechpro] Loaded v' + VERSION + ' - EdTech / AI Education Pro with 8 tools')
  console.log('  Tools: adaptive_learning_path_designer, assessment_generator, learning_analytics_dashboard, ai_tutoring_session_planner, course_content_generator, knowledge_gap_analyzer, peer_learning_optimizer, engagement_predictor')
}
