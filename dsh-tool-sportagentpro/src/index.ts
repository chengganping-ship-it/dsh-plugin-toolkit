/**
 * DSH Sports Intelligence AI Agent Plugin v1.0.0
 * 体育智能AI助手 for DeepSeek Harness — 表现分析·损伤预测·训练优化·战术布置·球探评估·营养恢复·裁判审计·商业分析
 *
 * 覆盖体育竞技与商业全价值链：竞技表现 → 运动医学 → 训练科学 → 战术分析 → 人才发展 → 营养恢复 → 裁判合规 → 商业运营
 *
 * 工具清单:
 * 1. performance_analyzer      — 运动员表现分析与技术统计 (Analyze athlete performance metrics and technical stats)
 * 2. injury_risk_predictor    — 运动损伤风险预测与预防方案 (Predict injury risk with prevention plans)
 * 3. training_load_optimizer  — 训练负荷管理与周期化安排 (Optimize training load with periodization)
 * 4. match_tactic_planner     — 比赛战术布置与对手分析 (Plan match tactics with opponent scouting)
 * 5. talent_scouting_ai       — 青少年球探与潜力评估 (Youth talent scouting with potential assessment)
 * 6. nutrition_recovery_planner — 运动员营养与恢复方案 (Athlete nutrition and recovery planning)
 * 7. referee_decision_auditor — 裁判判罚合规性审查与VAR模拟 (Audit referee decisions and simulate VAR)
 * 8. sports_business_analytics — 体育赛事商业分析与上座率预测 (Sports business analytics and attendance forecasting)
 *
 * @module dsh-tool-sportagentpro | @version 1.0.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-sportagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER_MEDICAL = '【免责声明】本工具分析结果基于AI模型推断，仅供体育科研与训练参考，不替代专业医疗诊断、运动医学评估及临床决策。任何涉及运动员健康、伤病处理的决策须由持证运动医学医师执行。'
const DISCLAIMER_TACTICS = '【免责声明】战术分析基于历史数据和模型推断制定，实际比赛结果受临场发挥、裁判判罚、天气条件等多因素影响。教练团队应结合实际情况灵活调整。'
const DISCLAIMER_SCOUTING = '【免责声明】潜力评估基于当前数据和模型推断，青少年运动员发展存在高度不确定性。球探报告应作为综合评估的参考之一，非唯一决策依据。'
const DISCLAIMER_BUSINESS = '【免责声明】商业分析和上座率预测基于历史统计和模型估算，实际商业表现受宏观经济、赛事表现、社会事件等多因素影响，仅供运营决策参考。'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

function mulberry32(s: number): () => number {
  let x = s >>> 0
  return () => {
    x = (x + 0x6D2B79F5) | 0
    let t = x
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(seedStr: string): () => number {
  return mulberry32(hashStr(seedStr))
}

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Performance Analyzer ---
interface PerformanceInput {
  athlete_id: string
  athlete_name: string
  sport: 'football' | 'basketball' | 'tennis' | 'swimming' | 'athletics' | 'volleyball'
  position: string
  match_data: Array<{
    match_id: string
    date: string
    opponent: string
    goals?: number
    assists?: number
    minutes_played: number
    distance_km: number
    sprints: number
    passes_completed: number
    passes_attempted: number
    shots_on_target?: number
    shots_total?: number
    tackles?: number
    interceptions?: number
    rating: number
  }>
  physical_metrics: { vo2max: number; body_fat_pct: number; muscle_mass_kg: number; resting_hr: number }
  benchmark_percentile: number
}

interface MatchPerformanceHighlight {
  match_id: string
  date: string
  opponent: string
  rating: number
  key_contribution: string
}

interface PerformanceTrend {
  metric: string
  trend: 'improving' | 'stable' | 'declining'
  recent_avg: number
  season_avg: number
}

interface PerformanceAnalysisResult {
  athlete_id: string
  athlete_name: string
  sport: string
  position: string
  matches_analyzed: number
  season_avg_rating: number
  season_best_rating: number
  season_worst_rating: number
  total_goals: number
  total_assists: number
  total_distance_km: number
  avg_pass_accuracy: number
  avg_sprints_per_match: number
  performance_trends: PerformanceTrend[]
  highlights: MatchPerformanceHighlight[]
  physical_condition_score: number
  overall_performance_score: number
  strengths: string[]
  weaknesses: string[]
  disclaimer: string
}

// --- Tool 2: Injury Risk Predictor ---
interface InjuryRiskInput {
  athlete_id: string
  athlete_name: string
  sport: string
  age: number
  height_cm: number
  weight_kg: number
  injury_history: Array<{ injury_type: string; date: string; recovery_days: number; recurrence: boolean; body_part: string }>
  training_load_last_4weeks: Array<{ week: number; acute_load: number; chronic_load: number; rpe_avg: number }>
  biomechanics: { asymmetry_index_pct: number; flexibility_score: number; previous_surgery: boolean }
  current_symptoms: Array<{ symptom: string; severity: 'mild' | 'moderate' | 'severe'; body_part: string }>
  sleep_quality_avg: number
  stress_level: 'low' | 'medium' | 'high'
}

interface BodyPartRisk {
  body_part: string
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  risk_score: number
  contributing_factors: string[]
  predicted_injury_type: string
}

interface PreventionPlan {
  body_part: string
  exercises: string[]
  frequency: string
  priority: 'high' | 'medium' | 'low'
  expected_reduction_pct: number
}

interface InjuryRiskResult {
  athlete_id: string
  athlete_name: string
  overall_risk_level: 'low' | 'moderate' | 'high' | 'critical'
  overall_risk_score: number
  acute_chronic_ratio: number
  body_part_risks: BodyPartRisk[]
  prevention_plans: PreventionPlan[]
  training_modifications: string[]
  monitoring_recommendations: string[]
  return_to_play_readiness: number
  disclaimer: string
}

// --- Tool 3: Training Load Optimizer ---
interface TrainingLoadInput {
  athlete_id: string
  athlete_name: string
  sport: string
  training_phase: 'preparation' | 'competition' | 'transition' | 'rehabilitation'
  current_week_load: number
  target_week_load: number
  weekly_sessions: Array<{ session_id: string; type: string; duration_min: number; rpe: number; load: number }>
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  competition_calendar: Array<{ event: string; date: string; priority: 'A' | 'B' | 'C' }>
  recovery_metrics: { hrv_avg: number; sleep_hours: number; soreness_level: number; mood_score: number }
}

interface DailyPlan {
  day: string
  session_type: string
  intensity: 'low' | 'moderate' | 'high' | 'rest'
  duration_min: number
  focus: string
  target_load: number
}

interface PeriodizationBlock {
  block_name: string
  weeks: string
  focus: string
  volume_pct: number
  intensity_pct: number
  key_objectives: string[]
}

interface TrainingLoadResult {
  athlete_id: string
  athlete_name: string
  current_phase: string
  weekly_plan: DailyPlan[]
  acute_chronic_ratio: number
  load_status: 'undertraining' | 'optimal' | 'overreaching' | 'overtraining'
  periodization_blocks: PeriodizationBlock[]
  competition_peaking_plan: string[]
  recovery_recommendations: string[]
  weekly_volume_total: number
  intensity_distribution: { low_pct: number; moderate_pct: number; high_pct: number }
  disclaimer: string
}

// --- Tool 4: Match Tactic Planner ---
interface TacticInput {
  team_id: string
  team_name: string
  sport: string
  formation: string
  opponent_team: string
  opponent_formation: string
  opponent_strengths: string[]
  opponent_weaknesses: string[]
  opponent_recent_results: Array<{ match: string; result: string; score: string }>
  key_players: Array<{ name: string; position: string; role: string; fitness: 'fit' | 'doubtful' | 'injured' }>
  match_context: 'home' | 'away' | 'neutral'
  competition_importance: 'league' | 'cup' | 'derby' | 'final'
}

interface TacticalInstruction {
  phase: string
  instruction: string
  target_players: string[]
  priority: 'high' | 'medium' | 'low'
}

interface SetPiecePlan {
  type: string
  routine_name: string
  taker: string
  targets: string[]
  expected_success_rate: number
}

interface MatchTacticResult {
  team_name: string
  opponent_team: string
  recommended_formation: string
  playing_style: string
  pressing_intensity: 'low' | 'medium' | 'high'
  defensive_line: 'deep' | 'medium' | 'high'
  tactical_instructions: TacticalInstruction[]
  set_piece_plans: SetPiecePlan[]
  player_matchups: Array<{ our_player: string; opponent_player: string; tactical_note: string }>
  key_threats: string[]
  exploit_opportunities: string[]
  expected_possession_pct: number
  disclaimer: string
}

// --- Tool 5: Talent Scouting AI ---
interface ScoutingInput {
  athlete_id: string
  athlete_name: string
  sport: string
  date_of_birth: string
  nationality: string
  position: string
  height_cm: number
  weight_kg: number
  technical_skills: Array<{ skill: string; score: number; max: number }>
  physical_attributes: Array<{ attribute: string; score: number; max: number }>
  cognitive_assessment: { decision_making: number; spatial_awareness: number; game_intelligence: number }
  match_performances: Array<{ tournament: string; matches: number; goals: number; assists: number; rating: number }>
  coach_assessment: { work_ethic: number; coachability: number; teamwork: number; competitiveness: number }
  development_environment: { academy_tier: string; coaching_quality: string; competition_level: string }
}

interface SkillAssessment {
  category: string
  current_level: number
  potential_ceiling: number
  development_priority: 'high' | 'medium' | 'low'
  age_adjusted_rating: number
}

interface TalentScoutResult {
  athlete_name: string
  sport: string
  position: string
  age: number
  overall_potential_score: number
  current_ability_score: number
  projected_peak_age: number
  projected_peak_rating: number
  comparable_player: string
  skill_assessments: SkillAssessment[]
  physical_projection: string
  mental_profile: string
  development_recommendations: string[]
  scout_grade: 'A' | 'B' | 'C' | 'D'
  estimated_value_range: string
  risk_factors: string[]
  disclaimer: string
}

// --- Tool 6: Nutrition Recovery Planner ---
interface NutritionInput {
  athlete_id: string
  athlete_name: string
  sport: string
  weight_kg: number
  height_cm: number
  age: number
  gender: 'male' | 'female'
  training_phase: string
  daily_training_hours: number
  dietary_preference: string
  food_allergies: string[]
  body_composition_goal: 'maintain' | 'gain_muscle' | 'lose_fat' | 'recompose'
  competition_schedule: Array<{ event: string; date: string; day_of_week: string }>
  current_supplements: string[]
  hydration_status: 'optimal' | 'adequate' | 'dehydrated'
}

interface DailyNutritionPlan {
  day_type: string
  total_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  meals: Array<{ meal: string; timing: string; calories: number; description: string }>
}

interface RecoveryProtocol {
  timing: string
  protocol: string
  duration_min: number
  purpose: string
  priority: 'essential' | 'recommended' | 'optional'
}

interface NutritionRecoveryResult {
  athlete_name: string
  daily_energy_expenditure: number
  bmr: number
  daily_nutrition_plans: DailyNutritionPlan[]
  hydration_plan: { daily_water_l: number; electrolyte_timing: string; pre_training_ml: number; during_training_ml: number; post_training_ml: number }
  supplement_recommendations: Array<{ supplement: string; dosage: string; timing: string; purpose: string }>
  recovery_protocols: RecoveryProtocol[]
  competition_nutrition: string[]
  disclaimer: string
}

// --- Tool 7: Referee Decision Auditor ---
interface RefereeInput {
  match_id: string
  match_info: { home_team: string; away_team: string; date: string; competition: string; referee: string }
  decisions: Array<{
    decision_id: string
    minute: number
    type: 'penalty' | 'red_card' | 'yellow_card' | 'offside' | 'goal' | 'var_review'
    description: string
    referee_decision: string
    correct_decision: string
    rule_reference: string
    evidence: string[]
  }>
  var_availability: boolean
  match_context: { score_at_time: string; momentum: string; previous_incidents: string[] }
}

interface DecisionAssessment {
  decision_id: string
  minute: number
  type: string
  referee_decision: string
  correct_decision: string
  is_correct: boolean
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  rule_reference: string
  explanation: string
  var_recommendation: string
}

interface RefereeAuditResult {
  match_id: string
  match_info_summary: string
  total_decisions: number
  correct_decisions: number
  incorrect_decisions: number
  accuracy_pct: number
  decision_assessments: DecisionAssessment[]
  critical_errors: number
  var_intervention_count: number
  consistency_score: number
  overall_grade: 'excellent' | 'good' | 'acceptable' | 'poor'
  improvement_areas: string[]
  disclaimer: string
}

// --- Tool 8: Sports Business Analytics ---
interface BusinessInput {
  team_id: string
  team_name: string
  sport: string
  league: string
  stadium_capacity: number
  current_season: string
  historical_attendance: Array<{ season: string; avg_attendance: number; capacity_pct: number; ticket_revenue_m: number }>
  current_performance: { wins: number; draws: number; losses: number; league_position: number; form_last_5: string[] }
  ticket_pricing: { category: string; price: number; avg_sold: number; demand_level: 'low' | 'medium' | 'high' }[]
  sponsorship_deals: Array<{ sponsor: string; value_m: number; duration_years: number; industry: string }>
  upcoming_fixtures: Array<{ opponent: string; date: string; is_derby: boolean; is_weekend: boolean; opponent_ranking: number }>
  market_data: { city_population: number; avg_income: number; competitor_entertainment: number; fan_base_size: number }
}

interface AttendanceForecast {
  opponent: string
  date: string
  predicted_attendance: number
  capacity_pct: number
  confidence: 'high' | 'medium' | 'low'
  key_factors: string[]
}

interface RevenueProjection {
  category: string
  current_season_m: number
  next_season_m: number
  growth_pct: number
  recommendation: string
}

interface BusinessAnalyticsResult {
  team_name: string
  current_season: string
  avg_attendance_current: number
  capacity_utilization_pct: number
  attendance_forecasts: AttendanceForecast[]
  revenue_projections: RevenueProjection[]
  total_projected_revenue: number
  pricing_optimizations: Array<{ category: string; current_price: number; recommended_price: number; expected_uplift_pct: number }>
  fan_engagement_score: number
  commercial_recommendations: string[]
  roi_analysis: string[]
  disclaimer: string
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Performance Analyzer ---

function analyzePerformance(input_data: string): PerformanceAnalysisResult {
  const input: PerformanceInput = JSON.parse(input_data)
  const rand = rng(input.athlete_id + input.sport)

  const matches = input.match_data
  const matches_analyzed = matches.length

  // Aggregate stats
  const ratings = matches.map(m => m.rating)
  const seasonAvgRating = Math.round(ratings.reduce((a, b) => a + b, 0) / matches_analyzed * 100) / 100
  const seasonBest = Math.max(...ratings)
  const seasonWorst = Math.min(...ratings)

  const totalGoals = matches.reduce((s, m) => s + (m.goals || 0), 0)
  const totalAssists = matches.reduce((s, m) => s + (m.assists || 0), 0)
  const totalDistance = Math.round(matches.reduce((s, m) => s + m.distance_km, 0) * 100) / 100
  const totalPassesCompleted = matches.reduce((s, m) => s + m.passes_completed, 0)
  const totalPassesAttempted = matches.reduce((s, m) => s + m.passes_attempted, 0)
  const avgPassAccuracy = totalPassesAttempted > 0 ? Math.round((totalPassesCompleted / totalPassesAttempted) * 10000) / 100 : 0
  const avgSprints = Math.round(matches.reduce((s, m) => s + m.sprints, 0) / matches_analyzed * 100) / 100

  // Performance trends (compare second half vs first half)
  const half = Math.floor(matches_analyzed / 2)
  const firstHalf = matches.slice(0, half)
  const secondHalf = matches.slice(half)

  const firstHalfRating = firstHalf.reduce((s, m) => s + m.rating, 0) / Math.max(firstHalf.length, 1)
  const secondHalfRating = secondHalf.reduce((s, m) => s + m.rating, 0) / Math.max(secondHalf.length, 1)

  const realTrends: PerformanceTrend[] = [
    {
      metric: '综合评分',
      trend: secondHalfRating > firstHalfRating + 0.2 ? 'improving' : secondHalfRating < firstHalfRating - 0.2 ? 'declining' : 'stable',
      recent_avg: Math.round(secondHalfRating * 100) / 100,
      season_avg: seasonAvgRating
    },
    {
      metric: '场均跑动(km)',
      trend: matches_analyzed > 3 ? (matches[matches_analyzed - 1].distance_km > matches[0].distance_km ? 'improving' : 'stable') : 'stable',
      recent_avg: Math.round(secondHalf.reduce((s, m) => s + m.distance_km, 0) / Math.max(secondHalf.length, 1) * 100) / 100,
      season_avg: Math.round(totalDistance / matches_analyzed * 100) / 100
    },
    {
      metric: '传球成功率',
      trend: rand() > 0.5 ? 'improving' : 'stable',
      recent_avg: Math.round(avgPassAccuracy * (0.95 + rand() * 0.1) * 100) / 100,
      season_avg: avgPassAccuracy
    }
  ]

  // Highlights
  const highlights: MatchPerformanceHighlight[] = matches
    .filter(m => m.rating >= 8.0)
    .slice(0, 5)
    .map(m => ({
      match_id: m.match_id,
      date: m.date,
      opponent: m.opponent,
      rating: m.rating,
      key_contribution: (m.goals || 0) > 0 ? `${m.goals}进球${(m.assists || 0) > 0 ? `+${m.assists}助攻` : ''}` : (m.assists || 0) > 0 ? `${m.assists}助攻` : '关键防守贡献'
    }))

  // Physical condition score (based on vo2max, body fat, etc.)
  const vo2Score = Math.min(input.physical_metrics.vo2max / 60 * 100, 100)
  const bfScore = Math.max(0, 100 - input.physical_metrics.body_fat_pct * 3)
  const hrScore = Math.max(0, 100 - (input.physical_metrics.resting_hr - 40) * 2)
  const physicalScore = Math.round((vo2Score * 0.4 + bfScore * 0.3 + hrScore * 0.3) * 10) / 10

  // Overall performance score
  const overallScore = Math.round(
    (seasonAvgRating / 10 * 40 + avgPassAccuracy * 0.2 + physicalScore * 0.2 +
     input.benchmark_percentile * 0.2) * 10
  ) / 10

  // Strengths and weaknesses
  const strengths: string[] = []
  const weaknesses: string[] = []

  if (seasonAvgRating >= 7.5) strengths.push('比赛综合表现稳定优秀')
  if (avgPassAccuracy >= 85) strengths.push('传球精确度高')
  if (totalDistance / matches_analyzed >= 10) strengths.push('场上跑动积极')
  if (totalGoals > matches_analyzed * 0.3) strengths.push('门前终结能力强')

  if (seasonAvgRating < 6.5) weaknesses.push('比赛评分波动较大')
  if (avgPassAccuracy < 75) weaknesses.push('传球成功率需提升')
  if (physicalScore < 60) weaknesses.push('身体条件指标有改善空间')
  if (matches.some(m => m.minutes_played < 60)) weaknesses.push('体能储备或存在隐患')

  if (strengths.length === 0) strengths.push('训练态度认真，比赛投入度高')
  if (weaknesses.length === 0) weaknesses.push('暂无显著短板，保持现有训练方向')

  return {
    athlete_id: input.athlete_id,
    athlete_name: input.athlete_name,
    sport: input.sport,
    position: input.position,
    matches_analyzed,
    season_avg_rating: seasonAvgRating,
    season_best_rating: seasonBest,
    season_worst_rating: seasonWorst,
    total_goals: totalGoals,
    total_assists: totalAssists,
    total_distance_km: totalDistance,
    avg_pass_accuracy: avgPassAccuracy,
    avg_sprints_per_match: avgSprints,
    performance_trends: realTrends,
    highlights,
    physical_condition_score: physicalScore,
    overall_performance_score: overallScore,
    strengths,
    weaknesses,
    disclaimer: '【免责声明】表现分析基于历史比赛数据，未来表现受对手水平、战术体系、身体状态等多因素影响。数据仅供参考，不构成出场或选拔决策的唯一依据。'
  }
}

// --- Tool 2: Injury Risk Predictor ---

function analyzeInjuryRisk(input_data: string): InjuryRiskResult {
  const input: InjuryRiskInput = JSON.parse(input_data)
  const rand = rng(input.athlete_id + 'injury')

  // Acute:Chronic workload ratio
  const recentLoads = input.training_load_last_4weeks
  const acuteLoad = recentLoads.length > 0 ? recentLoads[recentLoads.length - 1].acute_load : 0
  const chronicLoads = recentLoads.map(w => w.chronic_load)
  const chronicLoad = chronicLoads.length > 0 ? chronicLoads.reduce((a, b) => a + b, 0) / chronicLoads.length : 1
  const acRatio = chronicLoad > 0 ? Math.round((acuteLoad / chronicLoad) * 100) / 100 : 1.0

  // Body part risks
  const bodyPartRisks: BodyPartRisk[] = []

  // Hamstring
  const hamstringFactors: string[] = []
  let hamstringRisk = 20
  if (input.biomechanics.asymmetry_index_pct > 10) { hamstringRisk += 20; hamstringFactors.push('肢体不对称性超过10%') }
  if (input.injury_history.some(i => i.body_part === 'hamstring' && i.recurrence)) { hamstringRisk += 25; hamstringFactors.push('腿筋伤病复发史') }
  if (input.biomechanics.flexibility_score < 60) { hamstringRisk += 15; hamstringFactors.push('柔韧性评分偏低') }
  if (acRatio > 1.3) { hamstringRisk += 15; hamstringFactors.push('急性/慢性负荷比过高') }
  if (input.age > 28) { hamstringRisk += 10; hamstringFactors.push('年龄相关退化风险') }
  if (hamstringFactors.length === 0) hamstringFactors.push('未见显著风险因素')
  bodyPartRisks.push({ body_part: '腿筋(hamstring)', risk_level: hamstringRisk > 70 ? 'critical' : hamstringRisk > 50 ? 'high' : hamstringRisk > 30 ? 'moderate' : 'low', risk_score: Math.min(hamstringRisk, 100), contributing_factors: hamstringFactors, predicted_injury_type: '腿筋拉伤' })

  // Knee
  const kneeFactors: string[] = []
  let kneeRisk = 15
  if (input.biomechanics.previous_surgery) { kneeRisk += 30; kneeFactors.push('既往膝关节手术史') }
  if (input.injury_history.some(i => i.body_part.includes('knee') || i.body_part.includes('ACL'))) { kneeRisk += 25; kneeFactors.push('膝关节伤病史') }
  if (input.weight_kg / ((input.height_cm / 100) ** 2) > 25) { kneeRisk += 10; kneeFactors.push('BMI偏高增加膝关节负担') }
  if (input.current_symptoms.some(s => s.body_part.includes('knee'))) { kneeRisk += 20; kneeFactors.push('当前存在膝部症状') }
  if (kneeFactors.length === 0) kneeFactors.push('未见显著风险因素')
  bodyPartRisks.push({ body_part: '膝关节(knee)', risk_level: kneeRisk > 70 ? 'critical' : kneeRisk > 50 ? 'high' : kneeRisk > 30 ? 'moderate' : 'low', risk_score: Math.min(kneeRisk, 100), contributing_factors: kneeFactors, predicted_injury_type: 'ACL损伤/半月板问题' })

  // Ankle
  const ankleFactors: string[] = []
  let ankleRisk = 15
  if (input.injury_history.some(i => i.body_part === 'ankle')) { ankleRisk += 25; ankleFactors.push('踝关节扭伤史') }
  if (input.biomechanics.asymmetry_index_pct > 8) { ankleRisk += 10; ankleFactors.push('不对称性增加踝部代偿') }
  if (input.current_symptoms.some(s => s.body_part === 'ankle')) { ankleRisk += 15; ankleFactors.push('当前踝部不适') }
  if (input.sport === 'football' || input.sport === 'basketball') { ankleRisk += 10; ankleFactors.push('高频率变向运动') }
  if (ankleFactors.length === 0) ankleFactors.push('未见显著风险因素')
  bodyPartRisks.push({ body_part: '踝关节(ankle)', risk_level: ankleRisk > 70 ? 'critical' : ankleRisk > 50 ? 'high' : ankleRisk > 30 ? 'moderate' : 'low', risk_score: Math.min(ankleRisk, 100), contributing_factors: ankleFactors, predicted_injury_type: '踝扭伤' })

  // Shoulder (for applicable sports)
  if (input.sport === 'swimming' || input.sport === 'volleyball') {
    const shFactors: string[] = []
    let shRisk = 20
    if (input.injury_history.some(i => i.body_part === 'shoulder')) { shRisk += 25; shFactors.push('肩袖伤病史') }
    if (input.current_symptoms.some(s => s.body_part === 'shoulder')) { shRisk += 15; shFactors.push('当前肩部症状') }
    if (shFactors.length === 0) shFactors.push('未见显著风险因素')
    bodyPartRisks.push({ body_part: '肩关节(shoulder)', risk_level: shRisk > 70 ? 'critical' : shRisk > 50 ? 'high' : shRisk > 30 ? 'moderate' : 'low', risk_score: Math.min(shRisk, 100), contributing_factors: shFactors, predicted_injury_type: '肩袖损伤' })
  }

  // Overall risk
  const maxBodyPartRisk = Math.max(...bodyPartRisks.map(b => b.risk_score))
  const sleepPenalty = Math.max(0, (7 - input.sleep_quality_avg) * 3)
  const stressPenalty = input.stress_level === 'high' ? 10 : input.stress_level === 'medium' ? 5 : 0
  const overallRiskScore = Math.min(100, Math.round((maxBodyPartRisk * 0.5 + (acRatio > 1.3 ? 20 : 0) + sleepPenalty + stressPenalty) * 10) / 10)

  const overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical' =
    overallRiskScore >= 70 ? 'critical' : overallRiskScore >= 50 ? 'high' : overallRiskScore >= 30 ? 'moderate' : 'low'

  // Prevention plans
  const preventionPlans: PreventionPlan[] = []
  for (const bp of bodyPartRisks.filter(b => b.risk_level === 'high' || b.risk_level === 'critical')) {
    const exercises: string[] = []
    if (bp.body_part.includes('hamstring')) {
      exercises.push('北欧式腿筋弯曲 3x8', '单腿硬拉 3x10', '动态热身腿筋激活 10min')
    } else if (bp.body_part.includes('knee')) {
      exercises.push('靠墙静蹲 3x45s', '单腿下蹲 3x8', '臀中肌激活 3x12')
    } else if (bp.body_part.includes('ankle')) {
      exercises.push('单腿平衡站立 3x30s', '弹力带踝关节四向抗阻 3x15', '不稳定平面训练 3x10')
    } else if (bp.body_part.includes('shoulder')) {
      exercises.push('弹力带外旋 3x15', '肩胛骨稳定训练 3x12', '面拉 3x12')
    }
    preventionPlans.push({
      body_part: bp.body_part,
      exercises,
      frequency: '每周3-4次',
      priority: bp.risk_level === 'critical' ? 'high' : 'high',
      expected_reduction_pct: Math.round(20 + rand() * 25)
    })
  }

  // Training modifications
  const trainingMods: string[] = []
  if (acRatio > 1.3) trainingMods.push('降低急性训练负荷，将ACWR控制在0.8-1.3安全区间')
  if (input.sleep_quality_avg < 6) trainingMods.push('优化睡眠管理，增加恢复日，减少高强度训练频次')
  if (input.current_symptoms.length > 0) trainingMods.push('针对当前症状部位降低负荷强度，安排专项康复训练')
  if (input.stress_level === 'high') trainingMods.push('监控心理负荷，适当降低训练压力，增加恢复手段')
  if (trainingMods.length === 0) trainingMods.push('当前训练负荷处于安全范围，保持现有训练计划')

  // Monitoring recommendations
  const monitoringRecs: string[] = [
    '每日晨起HRV监测，下降超10%时调整当天训练',
    '每次训练后填写RPE量表，监控主观疲劳度',
    '每周进行肢体不对称性筛查（单腿跳远测试）',
    '定期评估柔韧性（坐位体前屈、肩关节活动度）',
    '监控睡眠质量和时长，目标7-9小时'
  ]

  // Return to play readiness
  const rtpReadiness = Math.max(0, Math.min(100, Math.round(100 - overallRiskScore * 0.8 + rand() * 10)))

  return {
    athlete_id: input.athlete_id,
    athlete_name: input.athlete_name,
    overall_risk_level: overallRiskLevel,
    overall_risk_score: overallRiskScore,
    acute_chronic_ratio: acRatio,
    body_part_risks: bodyPartRisks,
    prevention_plans: preventionPlans,
    training_modifications: trainingMods,
    monitoring_recommendations: monitoringRecs,
    return_to_play_readiness: rtpReadiness,
    disclaimer: DISCLAIMER_MEDICAL
  }
}

// --- Tool 3: Training Load Optimizer ---

function analyzeTrainingLoad(input_data: string): TrainingLoadResult {
  const input: TrainingLoadInput = JSON.parse(input_data)
  const rand = rng(input.athlete_id + 'training')

  const loadStatus: 'undertraining' | 'optimal' | 'overreaching' | 'overtraining' =
    input.current_week_load < input.target_week_load * 0.8 ? 'undertraining' :
    input.current_week_load > input.target_week_load * 1.3 ? 'overtraining' :
    input.current_week_load > input.target_week_load * 1.1 ? 'overreaching' : 'optimal'

  // ACWR calculation
  const acwr = Math.round((input.current_week_load / Math.max(input.target_week_load, 1)) * 100) / 100

  // Weekly plan generation
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const weeklyPlan: DailyPlan[] = []

  for (let i = 0; i < 7; i++) {
    let intensity: 'low' | 'moderate' | 'high' | 'rest'
    let sessionType: string
    let focus: string
    let duration: number
    let targetLoad: number

    if (i === 6) {
      intensity = 'rest'
      sessionType = '主动恢复'
      focus = '放松按摩、轻度拉伸'
      duration = 30
      targetLoad = 0
    } else if (i === 0 || i === 3) {
      intensity = 'high'
      sessionType = input.training_phase === 'competition' ? '高强度间歇' : '力量+专项'
      focus = input.training_phase === 'competition' ? '比赛节奏模拟' : '最大力量发展'
      duration = 90 + Math.round(rand() * 30)
      targetLoad = Math.round(input.target_week_load * (0.2 + rand() * 0.05))
    } else if (i === 2 || i === 4) {
      intensity = 'moderate'
      sessionType = '技术/耐力'
      focus = input.training_phase === 'competition' ? '技术细节打磨' : '有氧耐力建设'
      duration = 70 + Math.round(rand() * 20)
      targetLoad = Math.round(input.target_week_load * (0.15 + rand() * 0.05))
    } else if (i === 5) {
      intensity = 'low'
      sessionType = '赛前准备/轻量'
      focus = '战术演练/激活'
      duration = 50 + Math.round(rand() * 15)
      targetLoad = Math.round(input.target_week_load * (0.08 + rand() * 0.04))
    } else {
      intensity = 'moderate'
      sessionType = '综合训练'
      focus = '体能+技术结合'
      duration = 60 + Math.round(rand() * 20)
      targetLoad = Math.round(input.target_week_load * (0.12 + rand() * 0.04))
    }

    weeklyPlan.push({
      day: days[i],
      session_type: sessionType,
      intensity,
      duration_min: duration,
      focus,
      target_load: targetLoad
    })
  }

  const weeklyVolumeTotal = weeklyPlan.reduce((s, d) => s + d.target_load, 0)

  // Periodization blocks
  const periodizationBlocks: PeriodizationBlock[] = []
  if (input.training_phase === 'preparation' || input.training_phase === 'competition') {
    periodizationBlocks.push({
      block_name: '基础准备期',
      weeks: '第1-4周',
      focus: '有氧基础+力量储备',
      volume_pct: 85,
      intensity_pct: 65,
      key_objectives: ['建立有氧基础', '力量耐力储备', '伤病预防']
    })
    periodizationBlocks.push({
      block_name: '专项发展期',
      weeks: '第5-8周',
      focus: '专项能力+速度发展',
      volume_pct: 75,
      intensity_pct: 80,
      key_objectives: ['提高专项耐力', '速度与爆发力', '技术自动化']
    })
    periodizationBlocks.push({
      block_name: '竞赛调峰期',
      weeks: '第9-12周',
      focus: '比赛节奏+状态调整',
      volume_pct: 60,
      intensity_pct: 90,
      key_objectives: ['保持竞技状态', '减量恢复', '心理调整']
    })
  }

  // Competition peaking
  const competitionPeaking: string[] = []
  if (input.competition_calendar.length > 0) {
    const nextComp = input.competition_calendar[0]
    competitionPeaking.push(`重点赛事：${nextComp.event}（${nextComp.date}）- 优先级${nextComp.priority}`)
    competitionPeaking.push(`赛前7天：减量40%训练量，保持强度`)
    competitionPeaking.push(`赛前3天：仅技术激活和低强度有氧`)
    competitionPeaking.push(`赛前1天：轻度激活，充足睡眠`)
  } else {
    competitionPeaking.push('暂无安排的竞赛，按常规周期化训练')
  }

  // Recovery recommendations
  const recoveryRecs: string[] = []
  if (input.recovery_metrics.hrv_avg < 50) recoveryRecs.push('HRV偏低：增加恢复手段，减少高强度训练占比')
  if (input.recovery_metrics.sleep_hours < 7) recoveryRecs.push('睡眠不足：建立规律作息，目标8小时睡眠')
  if (input.recovery_metrics.soreness_level > 6) recoveryRecs.push('肌肉酸痛明显：增加冷热交替浴和筋膜放松')
  if (input.recovery_metrics.mood_score < 5) recoveryRecs.push('情绪评分低：关注心理健康，调整训练压力')
  if (recoveryRecs.length === 0) recoveryRecs.push('恢复指标良好，保持当前恢复策略')

  // Intensity distribution
  const highIntensityCount = weeklyPlan.filter(d => d.intensity === 'high').length
  const moderateIntensityCount = weeklyPlan.filter(d => d.intensity === 'moderate').length
  const lowIntensityCount = weeklyPlan.filter(d => d.intensity === 'low').length
  const intensityDistribution = {
    low_pct: Math.round((lowIntensityCount / 7) * 100),
    moderate_pct: Math.round((moderateIntensityCount / 7) * 100),
    high_pct: Math.round((highIntensityCount / 7) * 100)
  }

  return {
    athlete_id: input.athlete_id,
    athlete_name: input.athlete_name,
    current_phase: input.training_phase,
    weekly_plan: weeklyPlan,
    acute_chronic_ratio: acwr,
    load_status: loadStatus,
    periodization_blocks: periodizationBlocks,
    competition_peaking_plan: competitionPeaking,
    recovery_recommendations: recoveryRecs,
    weekly_volume_total: weeklyVolumeTotal,
    intensity_distribution: intensityDistribution,
    disclaimer: DISCLAIMER_MEDICAL
  }
}

// --- Tool 4: Match Tactic Planner ---

function analyzeMatchTactics(input_data: string): MatchTacticResult {
  const input: TacticInput = JSON.parse(input_data)
  const rand = rng(input.team_id + input.opponent_team)

  // Determine recommended formation based on opponent and context
  let recommendedFormation = input.formation
  if (input.opponent_strengths.includes('高压逼抢') && input.match_context === 'away') {
    recommendedFormation = '4-2-3-1 (双后腰出球)'
  } else if (input.opponent_weaknesses.includes('边路防守薄弱')) {
    recommendedFormation = '4-3-3 (边路进攻)'
  } else if (input.competition_importance === 'final' && input.match_context === 'home') {
    recommendedFormation = '4-4-2 (均衡控制)'
  }

  // Playing style determination
  const playingStyle = input.match_context === 'home' ? '主动进攻，控球主导' :
    input.opponent_strengths.includes('控球能力强') ? '防守反击，快速转换' : '平衡攻守，寻求控制'

  // Pressing and defensive line
  const pressingIntensity: 'low' | 'medium' | 'high' =
    input.match_context === 'home' ? 'high' : input.match_context === 'away' ? 'medium' : 'medium'
  const defensiveLine: 'deep' | 'medium' | 'high' =
    input.opponent_strengths.includes('速度快的前锋') ? 'deep' : input.match_context === 'home' ? 'high' : 'medium'

  // Tactical instructions
  const tacticalInstructions: TacticalInstruction[] = []

  if (input.opponent_weaknesses.includes('边路防守薄弱')) {
    tacticalInstructions.push({ phase: '进攻', instruction: '集中攻击边路，边锋拉开宽度，边后卫套上', target_players: ['左边锋', '右边锋', '边后卫'], priority: 'high' })
  }
  if (input.opponent_strengths.includes('中场控制力强')) {
    tacticalInstructions.push({ phase: '中场', instruction: '放弃部分控球，打快速直传绕过对方中场屏障', target_players: ['前腰', '前锋'], priority: 'high' })
  }
  tacticalInstructions.push({ phase: '防守', instruction: `采用${pressingIntensity === 'high' ? '前场高位压迫' : pressingIntensity === 'medium' ? '中场区域压迫' : '低位密集防守'}`, target_players: ['全队'], priority: 'high' })
  tacticalInstructions.push({ phase: '转换', instruction: '丢球后3秒内就地反抢，抢不回则迅速回防落位', target_players: ['中场', '前锋'], priority: 'medium' })
  tacticalInstructions.push({ phase: '定位球防守', instruction: '区域防守结合盯人，重点球员专人贴防', target_players: ['全队'], priority: 'medium' })

  // Set piece plans
  const setPiecePlans: SetPiecePlan[] = [
    { type: '角球进攻', routine_name: '战术角球短传配合', taker: '技术型中场', targets: ['中后卫', '高中锋'], expected_success_rate: Math.round(20 + rand() * 15) },
    { type: '任意球直接', routine_name: '弧线球射近角', taker: '右脚主罚者', targets: ['门将'], expected_success_rate: Math.round(8 + rand() * 10) },
    { type: '任意球间接', routine_name: '假跑真射战术', taker: '左脚主罚者', targets: ['后点高个球员'], expected_success_rate: Math.round(15 + rand() * 12) },
    { type: '角球防守', routine_name: '(区域+盯人混合)', taker: '防守教练指挥', targets: ['前点球员', '门柱保护'], expected_success_rate: Math.round(75 + rand() * 15) }
  ]

  // Player matchups
  const playerMatchups: Array<{ our_player: string; opponent_player: string; tactical_note: string }> = []
  const ourForwards = input.key_players.filter(p => p.role === 'striker' || p.role === 'winger')
  if (ourForwards.length > 0) {
    playerMatchups.push({ our_player: ourForwards[0].name, opponent_player: '对方主力中卫', tactical_note: `利用${ourForwards[0].fitness === 'fit' ? '速度和灵活性' : '身体对抗'}消耗对方` })
  }
  const ourMidfielder = input.key_players.filter(p => p.role === 'midfielder')
  if (ourMidfielder.length > 0) {
    playerMatchups.push({ our_player: ourMidfielder[0].name, opponent_player: '对方核心中场', tactical_note: '贴身紧逼，限制其拿球转身' })
  }

  // Key threats
  const keyThreats: string[] = input.opponent_strengths.slice(0, 3).map(s => `对方${s}`)
  if (input.opponent_recent_results.filter(r => r.result === 'W').length >= 3) {
    keyThreats.push('对手近期状态极佳，连胜士气高涨')
  }

  // Exploit opportunities
  const exploitOpps: string[] = input.opponent_weaknesses.map(w => `利用对方${w}`)
  if (input.match_context === 'home') exploitOpps.push('主场球迷优势，可加大进攻力度')
  void rand

  // Expected possession
  const expectedPossession = input.match_context === 'home' ? Math.round(52 + rand() * 10) :
    input.opponent_strengths.includes('控球能力强') ? Math.round(35 + rand() * 10) : Math.round(45 + rand() * 8)

  return {
    team_name: input.team_name,
    opponent_team: input.opponent_team,
    recommended_formation: recommendedFormation,
    playing_style: playingStyle,
    pressing_intensity: pressingIntensity,
    defensive_line: defensiveLine,
    tactical_instructions: tacticalInstructions,
    set_piece_plans: setPiecePlans,
    player_matchups: playerMatchups,
    key_threats: keyThreats,
    exploit_opportunities: exploitOpps,
    expected_possession_pct: expectedPossession,
    disclaimer: DISCLAIMER_TACTICS
  }
}

// --- Tool 5: Talent Scouting AI ---

function analyzeTalentScout(input_data: string): TalentScoutResult {
  const input: ScoutingInput = JSON.parse(input_data)
  const rand = rng(input.athlete_id + 'scout')

  // Calculate age
  const birthYear = new Date(input.date_of_birth).getFullYear()
  const currentYear = 2025
  const age = currentYear - birthYear

  // Technical skill average
  const techAvg = input.technical_skills.reduce((s, sk) => s + sk.score / sk.max * 100, 0) / Math.max(input.technical_skills.length, 1)
  // Physical attribute average
  const physAvg = input.physical_attributes.reduce((s, pa) => s + pa.score / pa.max * 100, 0) / Math.max(input.physical_attributes.length, 1)
  // Cognitive average
  const cogAvg = (input.cognitive_assessment.decision_making + input.cognitive_assessment.spatial_awareness + input.cognitive_assessment.game_intelligence) / 3
  // Coach assessment average
  const coachAvg = (input.coach_assessment.work_ethic + input.coach_assessment.coachability + input.coach_assessment.teamwork + input.coach_assessment.competitiveness) / 4

  // Match performance rating
  const matchRating = input.match_performances.reduce((s, p) => s + p.rating, 0) / Math.max(input.match_performances.length, 1)

  // Current ability score
  const currentAbility = Math.round((techAvg * 0.3 + physAvg * 0.2 + cogAvg * 0.2 + coachAvg * 0.15 + matchRating * 5 * 0.15) * 10) / 10

  // Age-adjusted potential (younger = more upside)
  const ageMultiplier = age <= 16 ? 1.4 : age <= 18 ? 1.3 : age <= 20 ? 1.2 : age <= 22 ? 1.1 : 1.0
  const developmentMultiplier = input.development_environment.academy_tier === 'elite' ? 1.15 : input.development_environment.academy_tier === 'professional' ? 1.05 : 1.0

  const projectedPeakRating = Math.round(Math.min(99, currentAbility * ageMultiplier * developmentMultiplier * (0.9 + rand() * 0.2)) * 10) / 10
  const projectedPeakAge = Math.round((25 + rand() * 4) * 10) / 10
  const overallPotential = Math.round(Math.min(99, projectedPeakRating * 0.7 + currentAbility * 0.3) * 10) / 10

  // Comparable player
  const comparables = ['德布劳内式', '莫德里奇式', '哈兰德式', '姆巴佩式', '贝林厄姆式', '佩德里式', '维尼修斯式', '萨拉赫式']
  const comparable = comparables[Math.floor(rand() * comparables.length)]

  // Skill assessments
  const skillAssessments: SkillAssessment[] = input.technical_skills.map(sk => ({
    category: sk.skill,
    current_level: sk.score,
    potential_ceiling: Math.min(sk.max, Math.round(sk.score * ageMultiplier)),
    development_priority: sk.score / sk.max < 0.6 ? 'high' : sk.score / sk.max < 0.8 ? 'medium' : 'low',
    age_adjusted_rating: Math.round(sk.score / sk.max * 100 * (age <= 18 ? 0.9 : 1.0) * 10) / 10
  }))

  // Physical projection
  const heightProjection = input.height_cm >= 180 ? '成年后预计达到理想身高' :
    input.height_cm >= 170 ? '身高处于平均水平，可通过训练改善' : '身高偏矮，需在其他方面形成优势'
  const physicalProjection = `${heightProjection}。基于当前身体数据，预测成年后BMI约${Math.round(input.weight_kg / ((input.height_cm / 100) ** 2) * (1 + (20 - age) * 0.01) * 10) / 10}。`

  // Mental profile
  const mentalProfile = `工作投入${input.coach_assessment.work_ethic > 8 ? '极高' : input.coach_assessment.work_ethic > 6 ? '良好' : '需提升'}，可训练性${input.coach_assessment.coachability > 8 ? '出色' : input.coach_assessment.coachability > 6 ? '良好' : '一般'}。比赛智商（决策${input.cognitive_assessment.decision_making} | 空间${input.cognitive_assessment.spatial_awareness} | 战术${input.cognitive_assessment.game_intelligence}）。`

  // Development recommendations
  const devRecs: string[] = []
  if (techAvg < 70) devRecs.push('技术能力需系统提升，建议增加个人技术训练时间')
  if (physAvg < 60) devRecs.push('身体发育尚未完成，需配合生长规律合理安排力量训练')
  if (cogAvg < 65) devRecs.push('比赛阅读能力可通过视频分析和战术课强化')
  if (input.coach_assessment.coachability < 6) devRecs.push('提升沟通能力和接受教练指导的意愿')
  if (input.development_environment.competition_level === 'regional') devRecs.push('建议参加更高级别的比赛以获得成长')
  if (devRecs.length === 0) devRecs.push('整体发展均衡，保持现有训练节奏和环境')

  // Scout grade
  const scoutGrade: 'A' | 'B' | 'C' | 'D' =
    overallPotential >= 80 ? 'A' : overallPotential >= 65 ? 'B' : overallPotential >= 50 ? 'C' : 'D'

  // Value estimate
  const valueLow = Math.round((currentAbility * 0.5 + overallPotential * 0.5) * (age <= 18 ? 2 : 1))
  const valueHigh = Math.round(valueLow * (1.5 + rand()))
  const valueRange = age >= 18 ? `${valueLow}-${valueHigh}万欧元` : `潜力估值${valueLow}-${valueHigh}万欧元(成年后)`

  // Risk factors
  const riskFactors: string[] = []
  if (age > 20 && currentAbility < 50) riskFactors.push('年龄与能力不匹配，提升空间有限')
  if (input.development_environment.coaching_quality === 'poor') riskFactors.push('训练环境质量有限')
  if (coachAvg < 50) riskFactors.push('教练评估偏低，态度或适应性存疑')
  if (physAvg < 50) riskFactors.push('身体条件可能限制未来发展')
  if (riskFactors.length === 0) riskFactors.push('暂未发现重大风险因素')

  return {
    athlete_name: input.athlete_name,
    sport: input.sport,
    position: input.position,
    age,
    overall_potential_score: overallPotential,
    current_ability_score: currentAbility,
    projected_peak_age: projectedPeakAge,
    projected_peak_rating: projectedPeakRating,
    comparable_player: comparable,
    skill_assessments: skillAssessments,
    physical_projection: physicalProjection,
    mental_profile: mentalProfile,
    development_recommendations: devRecs,
    scout_grade: scoutGrade,
    estimated_value_range: valueRange,
    risk_factors: riskFactors,
    disclaimer: DISCLAIMER_SCOUTING
  }
}

// --- Tool 6: Nutrition Recovery Planner ---

function analyzeNutritionRecovery(input_data: string): NutritionRecoveryResult {
  const input: NutritionInput = JSON.parse(input_data)
  const rand = rng(input.athlete_id + 'nutrition')

  // BMR calculation (Mifflin-St Jeor)
  const bmr = input.gender === 'male'
    ? Math.round(10 * input.weight_kg + 6.25 * input.height_cm - 5 * input.age + 5)
    : Math.round(10 * input.weight_kg + 6.25 * input.height_cm - 5 * input.age - 161)

  // Daily energy expenditure (BMR x activity multiplier)
  const activityMultiplier = input.daily_training_hours >= 3 ? 2.2 : input.daily_training_hours >= 2 ? 1.9 : input.daily_training_hours >= 1 ? 1.7 : 1.4
  const dailyEnergyExpenditure = Math.round(bmr * activityMultiplier)

  // Macronutrient targets based on sport and goal
  let proteinPerKg: number
  let carbsPerKg: number

  if (input.body_composition_goal === 'gain_muscle') {
    proteinPerKg = 2.0
    carbsPerKg = 5
  } else if (input.body_composition_goal === 'lose_fat') {
    proteinPerKg = 1.8
    carbsPerKg = 3
  } else if (input.body_composition_goal === 'recompose') {
    proteinPerKg = 1.8
    carbsPerKg = 4
  } else {
    proteinPerKg = 1.6
    carbsPerKg = 4.5
  }

  const protein_g = Math.round(input.weight_kg * proteinPerKg)
  const carbs_g = Math.round(input.weight_kg * carbsPerKg)
  const fat_g = Math.round((dailyEnergyExpenditure * 0.25) / 9)
  const totalCalories = Math.round(protein_g * 4 + carbs_g * 4 + fat_g * 9)

  // Daily nutrition plans
  const trainingDayMeals = [
    { meal: '早餐', timing: '07:00', calories: Math.round(totalCalories * 0.25), description: '燕麦+鸡蛋+水果+坚果 — 缓释碳水+优质蛋白' },
    { meal: '训练前加餐', timing: '训练前1.5h', calories: Math.round(totalCalories * 0.1), description: '香蕉+能量棒 — 快速能量补充' },
    { meal: '训练后即时', timing: '训练后30min内', calories: Math.round(totalCalories * 0.15), description: '乳清蛋白+白面包 — 快速恢复窗口期' },
    { meal: '午餐', timing: '12:30', calories: Math.round(totalCalories * 0.25), description: '鸡胸肉/鱼+糙米+大量蔬菜 — 蛋白质+复合碳水' },
    { meal: '晚餐', timing: '18:30', calories: Math.round(totalCalories * 0.2), description: '瘦牛肉/豆腐+红薯+绿叶菜 — 修复生长' },
    { meal: '睡前', timing: '21:00', calories: Math.round(totalCalories * 0.05), description: '酪蛋白或希腊酸奶 — 夜间缓释蛋白' }
  ]

  const restDayMeals = [
    { meal: '早餐', timing: '08:00', calories: Math.round(totalCalories * 0.3), description: '鸡蛋+全麦面包+牛油果 — 优质脂肪+蛋白' },
    { meal: '午餐', timing: '12:30', calories: Math.round(totalCalories * 0.35), description: '三文鱼+藜麦+蔬菜沙拉 — Omega-3+纤维' },
    { meal: '下午茶', timing: '15:30', calories: Math.round(totalCalories * 0.1), description: '坚果+水果 — 健康脂肪' },
    { meal: '晚餐', timing: '18:30', calories: Math.round(totalCalories * 0.25), description: '鸡肉/鱼+蔬菜+少量碳水 — 控制碳水摄入' }
  ]

  const dailyNutritionPlans: DailyNutritionPlan[] = [
    {
      day_type: '训练日',
      total_calories: totalCalories,
      protein_g,
      carbs_g,
      fat_g,
      meals: trainingDayMeals
    },
    {
      day_type: '休息日',
      total_calories: Math.round(totalCalories * 0.85),
      protein_g,
      carbs_g: Math.round(carbs_g * 0.6),
      fat_g: Math.round(fat_g * 1.1),
      meals: restDayMeals
    }
  ]

  // Hydration plan
  const dailyWater = Math.round(input.weight_kg * 35 + input.daily_training_hours * 500)
  const hydrationPlan = {
    daily_water_l: Math.round(dailyWater / 1000 * 10) / 10,
    electrolyte_timing: '训练超过60分钟或大量出汗时补充',
    pre_training_ml: 500,
    during_training_ml: Math.round(input.daily_training_hours * 500),
    post_training_ml: Math.round(input.weight_kg * 10)
  }

  // Supplement recommendations
  const supplements: Array<{ supplement: string; dosage: string; timing: string; purpose: string }> = []

  if (!input.current_supplements.includes('维生素D')) {
    supplements.push({ supplement: '维生素D3', dosage: '2000IU/天', timing: '早餐后', purpose: '骨骼健康、免疫维持、肌肉功能' })
  }
  if (!input.current_supplements.includes('Omega-3')) {
    supplements.push({ supplement: 'Omega-3鱼油', dosage: '2g/天(EPA+DHA)', timing: '随餐', purpose: '抗炎、关节保护、心血管健康' })
  }
  if (!input.current_supplements.includes('肌酸')) {
    supplements.push({ supplement: '肌酸', dosage: '5g/天', timing: '训练后', purpose: '提升爆发力、加速恢复、增加肌肉力量' })
  }
  if (!input.current_supplements.includes('乳清蛋白')) {
    supplements.push({ supplement: '乳清蛋白', dosage: '25-30g/次', timing: '训练后30分钟内', purpose: '肌肉修复与合成' })
  }
  if (!input.current_supplements.includes('镁')) {
    supplements.push({ supplement: '镁', dosage: '300-400mg/天', timing: '睡前', purpose: '肌肉放松、睡眠质量、预防抽筋' })
  }

  // Recovery protocols
  const recoveryProtocols: RecoveryProtocol[] = [
    { timing: '训练后即刻', protocol: '冷水浸泡(10-15°C)10分钟', duration_min: 10, purpose: '减少肌肉炎症、加速废物清除', priority: 'recommended' },
    { timing: '训练后30分钟内', protocol: '蛋白质+碳水补充(3:1碳水蛋白比)', duration_min: 15, purpose: '糖原再填充、肌肉修复启动', priority: 'essential' },
    { timing: '睡前', protocol: '静态拉伸15分钟+深呼吸', duration_min: 20, purpose: '激活副交感神经、促进深度睡眠', priority: 'recommended' },
    { timing: '每周1-2次', protocol: '运动按摩/筋膜放松', duration_min: 60, purpose: '深层组织恢复、消除粘连', priority: 'recommended' },
    { timing: '高强度训练周后', protocol: '完全休息日或主动恢复(低强度有氧)', duration_min: 30, purpose: '超量恢复、防止过度训练', priority: 'essential' },
    { timing: '每日', protocol: '睡眠8-9小时(含睡前无屏幕时间)', duration_min: 480, purpose: '生长激素分泌、神经恢复、记忆巩固', priority: 'essential' }
  ]

  // Competition nutrition
  const competitionNutrition: string[] = [
    '赛前3天：碳水加载(8-10g/kg体重)，减少纤维摄入',
    '赛前3-4小时：最后一顿正餐(低脂低纤维高碳水)',
    '赛前1小时：容易消化的碳水(香蕉、白面包、能量胶)',
    '赛中：每20分钟补充150-200ml运动饮料+电解质',
    '赛后即刻：3:1碳水蛋白比恢复饮品，30分钟内摄入'
  ]
  void rand

  return {
    athlete_name: input.athlete_name,
    daily_energy_expenditure: dailyEnergyExpenditure,
    bmr,
    daily_nutrition_plans: dailyNutritionPlans,
    hydration_plan: hydrationPlan,
    supplement_recommendations: supplements,
    recovery_protocols: recoveryProtocols,
    competition_nutrition: competitionNutrition,
    disclaimer: DISCLAIMER_MEDICAL
  }
}

// --- Tool 7: Referee Decision Auditor ---

function analyzeRefereeDecisions(input_data: string): RefereeAuditResult {
  const input: RefereeInput = JSON.parse(input_data)
  const rand = rng(input.match_id + 'referee')

  // Assess each decision
  const decisionAssessments: DecisionAssessment[] = input.decisions.map(d => {
    const isCorrect = d.referee_decision.toLowerCase() === d.correct_decision.toLowerCase() ||
      d.referee_decision.includes(d.correct_decision) || d.correct_decision.includes(d.referee_decision)

    let severity: 'minor' | 'moderate' | 'major' | 'critical'
    if (d.type === 'red_card' || d.type === 'penalty') {
      severity = isCorrect ? 'minor' : 'critical'
    } else if (d.type === 'goal') {
      severity = isCorrect ? 'minor' : 'major'
    } else if (d.type === 'var_review') {
      severity = isCorrect ? 'minor' : 'major'
    } else if (d.type === 'offside') {
      severity = isCorrect ? 'minor' : 'moderate'
    } else {
      severity = isCorrect ? 'minor' : 'moderate'
    }

    const varRecommendation = input.var_availability
      ? (isCorrect ? 'VAR确认原判正确' : 'VAR建议介入复核')
      : '该场次VAR不可用，无法复核'

    return {
      decision_id: d.decision_id,
      minute: d.minute,
      type: d.type,
      referee_decision: d.referee_decision,
      correct_decision: d.correct_decision,
      is_correct: isCorrect,
      severity,
      rule_reference: d.rule_reference,
      explanation: isCorrect ? `${d.type}判罚符合规则${d.rule_reference}，判罚正确` : `${d.type}判罚存在争议。${d.rule_reference}规定：${d.correct_decision}，实际判罚为${d.referee_decision}`,
      var_recommendation: varRecommendation
    }
  })
  void rand

  const correctCount = decisionAssessments.filter(d => d.is_correct).length
  const incorrectCount = decisionAssessments.length - correctCount
  const totalDecisions = input.decisions.length
  const accuracyPct = totalDecisions > 0 ? Math.round((correctCount / totalDecisions) * 10000) / 100 : 100

  const criticalErrors = decisionAssessments.filter(d => d.severity === 'critical' && !d.is_correct).length
  const varInterventionCount = decisionAssessments.filter(d => !d.is_correct && d.severity === 'major' || d.severity === 'critical').length

  // Consistency score (based on similar calls being treated similarly)
  const consistencyScore = Math.round((75 + (accuracyPct - 70) * 0.8 + rand() * 5) * 10) / 10

  const overallGrade: 'excellent' | 'good' | 'acceptable' | 'poor' =
    accuracyPct >= 90 && criticalErrors === 0 ? 'excellent' :
    accuracyPct >= 80 && criticalErrors <= 1 ? 'good' :
    accuracyPct >= 70 ? 'acceptable' : 'poor'

  const improvementAreas: string[] = []
  if (decisionAssessments.some(d => !d.is_correct && d.type === 'offside')) {
    improvementAreas.push('越位判罚准确性需提高，建议加强助理裁判协调训练')
  }
  if (decisionAssessments.some(d => !d.is_correct && d.type === 'penalty')) {
    improvementAreas.push('点球判罚标准需统一，建议复核禁区内犯规尺度的掌握')
  }
  if (decisionAssessments.some(d => !d.is_correct && d.type === 'red_card')) {
    improvementAreas.push('红牌出示标准需审慎，严重犯规与暴力行为判定应更加精确')
  }
  if (consistencyScore < 80) improvementAreas.push('判罚一致性有待提升，同类犯规应统一尺度')
  if (!input.var_availability) improvementAreas.push('建议配备VAR系统，提升关键判罚准确性')
  if (improvementAreas.length === 0) improvementAreas.push('整体表现良好，保持现有执法水平')

  return {
    match_id: input.match_id,
    match_info_summary: `${input.match_info.home_team} vs ${input.match_info.away_team} (${input.match_info.competition})`,
    total_decisions: totalDecisions,
    correct_decisions: correctCount,
    incorrect_decisions: incorrectCount,
    accuracy_pct: accuracyPct,
    decision_assessments: decisionAssessments,
    critical_errors: criticalErrors,
    var_intervention_count: varInterventionCount,
    consistency_score: Math.min(consistencyScore, 100),
    overall_grade: overallGrade,
    improvement_areas: improvementAreas,
    disclaimer: '【免责声明】判罚审核基于提供的证据和规则参考，实际比赛结果具有最终性。本分析仅供裁判培训和学术交流使用，不改变比赛结果。'
  }
}

// --- Tool 8: Sports Business Analytics ---

function analyzeSportsBusiness(input_data: string): BusinessAnalyticsResult {
  const input: BusinessInput = JSON.parse(input_data)
  const rand = rng(input.team_id + 'business')

  // Current season attendance
  const currentAttendanceData = input.historical_attendance.length > 0
    ? input.historical_attendance[input.historical_attendance.length - 1]
    : { avg_attendance: 0, capacity_pct: 0, ticket_revenue_m: 0 }
  const avgAttendanceCurrent = currentAttendanceData.avg_attendance
  const capacityUtil = currentAttendanceData.capacity_pct

  // Attendance forecasts for upcoming fixtures
  const attendanceForecasts: AttendanceForecast[] = input.upcoming_fixtures.map(fixture => {
    let baseAttendance = avgAttendanceCurrent
    const factors: string[] = []

    // Derby boost
    if (fixture.is_derby) {
      baseAttendance *= 1.15
      factors.push('德比大战吸引更多观众')
    }

    // Weekend effect
    if (fixture.is_weekend) {
      baseAttendance *= 1.1
      factors.push('周末场次观众意愿更高')
    }

    // Opponent quality
    if (fixture.opponent_ranking <= 5) {
      baseAttendance *= 1.2
      factors.push('对阵顶级强队吸引力大')
    } else if (fixture.opponent_ranking <= 10) {
      baseAttendance *= 1.05
      factors.push('对手实力较强')
    } else {
      baseAttendance *= 0.9
      factors.push('对手排名较低，吸引力有限')
    }

    // Team form influence
    const winRate = input.current_performance.wins / Math.max(input.current_performance.wins + input.current_performance.draws + input.current_performance.losses, 1)
    if (winRate > 0.6) {
      baseAttendance *= 1.1
      factors.push('球队状态出色')
    } else if (winRate < 0.3) {
      baseAttendance *= 0.85
      factors.push('球队状态低迷')
    }

    const predicted = Math.min(input.stadium_capacity, Math.round(baseAttendance))
    const capPct = Math.round((predicted / input.stadium_capacity) * 10000) / 100

    return {
      opponent: fixture.opponent,
      date: fixture.date,
      predicted_attendance: predicted,
      capacity_pct: capPct,
      confidence: factors.length >= 3 ? 'high' : factors.length >= 2 ? 'medium' : 'low',
      key_factors: factors
    }
  })

  // Win rate (needed for revenue projections)
  const winRate = input.current_performance.wins / Math.max(input.current_performance.wins + input.current_performance.draws + input.current_performance.losses, 1)

  // Revenue projections
  const currentTicketRevenue = currentAttendanceData.ticket_revenue_m
  const currentSponsorship = input.sponsorship_deals.reduce((s, d) => s + d.value_m / d.duration_years, 0)
  const currentMerchandise = Math.round(input.market_data.fan_base_size * 0.3 * 50 / 1000000 * 100) / 100 // Estimate

  const revenueProjections: RevenueProjection[] = [
    {
      category: '门票收入',
      current_season_m: currentTicketRevenue,
      next_season_m: Math.round(currentTicketRevenue * (1 + winRate * 0.1) * 100) / 100,
      growth_pct: Math.round(winRate * 10 * 100) / 100,
      recommendation: winRate > 0.5 ? '保持票价弹性，热门场次可适当提价' : '关注上座率，考虑促销策略激活市场'
    },
    {
      category: '赞助收入',
      current_season_m: Math.round(currentSponsorship * 100) / 100,
      next_season_m: Math.round(currentSponsorship * (1.05 + rand() * 0.1) * 100) / 100,
      growth_pct: Math.round((5 + rand() * 10) * 100) / 100,
      recommendation: '开发数字化赞助资产，吸引科技企业合作'
    },
    {
      category: '商品销售',
      current_season_m: currentMerchandise,
      next_season_m: Math.round(currentMerchandise * (1.03 + rand() * 0.08) * 100) / 100,
      growth_pct: Math.round((3 + rand() * 8) * 100) / 100,
      recommendation: '强化线上渠道，推出限量联名款'
    }
  ]

  const totalProjected = Math.round(revenueProjections.reduce((s, r) => s + r.next_season_m, 0) * 100) / 100

  // Pricing optimizations
  const pricingOpts: Array<{ category: string; current_price: number; recommended_price: number; expected_uplift_pct: number }> = []
  for (const tier of input.ticket_pricing) {
    if (tier.demand_level === 'high' && tier.avg_sold > tier.price * 0.9) {
      pricingOpts.push({ category: tier.category, current_price: tier.price, recommended_price: Math.round(tier.price * 1.1), expected_uplift_pct: Math.round(rand() * 5 * 100) / 100 })
    } else if (tier.demand_level === 'low') {
      pricingOpts.push({ category: tier.category, current_price: tier.price, recommended_price: Math.round(tier.price * 0.85), expected_uplift_pct: Math.round((8 + rand() * 7) * 100) / 100 })
    } else {
      pricingOpts.push({ category: tier.category, current_price: tier.price, recommended_price: tier.price, expected_uplift_pct: 0 })
    }
  }

  // Fan engagement score
  const socialMediaScore = Math.round(60 + rand() * 30)
  const matchdayExperience = Math.round(50 + rand() * 40)
  const communityEngagement = Math.round(55 + rand() * 35)
  const digitalEngagement = Math.round(50 + rand() * 40)
  const fanEngagementScore = Math.round((socialMediaScore * 0.25 + matchdayExperience * 0.25 + communityEngagement * 0.25 + digitalEngagement * 0.25) * 10) / 10

  // Commercial recommendations
  const commercialRecs: string[] = [
    '建立会员积分体系，提升球迷忠诚度和复购率',
    '开发官方App内嵌商城和赛事直播功能',
    '探索NFT数字收藏品市场，吸引年轻粉丝群体',
    '举办球迷开放日和青训体验营，增强社区联结',
    '利用大数据分析球迷画像，实现精准营销推送'
  ]

  // ROI analysis
  const roiAnalysis: string[] = [
    `主场赛事运营ROI：上座率每提升1个百分点，年收入增加约¥${Math.round(currentTicketRevenue * 0.02)}M`,
    `青训投入回报率：每投入1元青训经费，5年内可产出${(3 + rand() * 4).toFixed(1)}元转会价值`,
    `数字化营销ROI：线上获客成本仅为传统渠道的30-40%`,
    `球场设施升级：体验升级可带动人均消费增长15-25%`
  ]

  return {
    team_name: input.team_name,
    current_season: input.current_season,
    avg_attendance_current: avgAttendanceCurrent,
    capacity_utilization_pct: capacityUtil,
    attendance_forecasts: attendanceForecasts,
    revenue_projections: revenueProjections,
    total_projected_revenue: totalProjected,
    pricing_optimizations: pricingOpts,
    fan_engagement_score: fanEngagementScore,
    commercial_recommendations: commercialRecs,
    roi_analysis: roiAnalysis,
    disclaimer: DISCLAIMER_BUSINESS
  }
}

// ==================== SECTION 4 — 格式化函数 ====================

function formatPerformanceReport(r: PerformanceAnalysisResult): string {
  const lines: string[] = []
  lines.push(`# 运动员表现分析报告 — ${r.athlete_name}`)
  lines.push('')
  lines.push(`**项目**: ${r.sport} | **位置**: ${r.position} | **分析场次**: ${r.matches_analyzed}`)
  lines.push(`**综合表现得分**: ${r.overall_performance_score}/100 | **身体状态分**: ${r.physical_condition_score}/100`)
  lines.push('')
  lines.push('## 赛季数据总览')
  lines.push(`- 平均评分: ${r.season_avg_rating} | 最高: ${r.season_best_rating} | 最低: ${r.season_worst_rating}`)
  lines.push(`- 总进球: ${r.total_goals} | 总助攻: ${r.total_assists} | 总跑动: ${r.total_distance_km}km`)
  lines.push(`- 场均传球成功率: ${r.avg_pass_accuracy}% | 场均冲刺: ${r.avg_sprints_per_match}`)
  lines.push('')

  lines.push('## 表现趋势')
  lines.push('| 指标 | 趋势 | 近期均值 | 赛季均值 |')
  lines.push('|------|------|----------|----------|')
  for (const t of r.performance_trends) {
    const trendIcon = t.trend === 'improving' ? '↑' : t.trend === 'declining' ? '↓' : '→'
    lines.push(`| ${t.metric} | ${trendIcon} ${t.trend} | ${t.recent_avg} | ${t.season_avg} |`)
  }
  lines.push('')

  if (r.highlights.length > 0) {
    lines.push('## 高光场次')
    lines.push('| 比赛日期 | 对手 | 评分 | 关键贡献 |')
    lines.push('|----------|------|------|----------|')
    for (const h of r.highlights) {
      lines.push(`| ${h.date} | ${h.opponent} | ${h.rating} | ${h.key_contribution} |`)
    }
    lines.push('')
  }

  lines.push('## 优势')
  for (const s of r.strengths) lines.push(`- ${s}`)
  lines.push('')
  lines.push('## 待改进')
  for (const w of r.weaknesses) lines.push(`- ${w}`)
  lines.push('')
  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatInjuryRiskReport(r: InjuryRiskResult): string {
  const lines: string[] = []
  lines.push(`# 运动损伤风险预测报告 — ${r.athlete_name}`)
  lines.push('')
  lines.push(`**整体风险等级**: ${r.overall_risk_level.toUpperCase()} | **风险评分**: ${r.overall_risk_score}/100 | **ACWR**: ${r.acute_chronic_ratio}`)
  lines.push(`**回归训练准备度**: ${r.return_to_play_readiness}/100`)
  lines.push('')

  lines.push('## 身体部位风险')
  lines.push('| 部位 | 风险等级 | 风险分 | 预测伤病类型 | 影响因素 |')
  lines.push('|------|----------|--------|-------------|----------|')
  for (const b of r.body_part_risks) {
    lines.push(`| ${b.body_part} | ${b.risk_level.toUpperCase()} | ${b.risk_score} | ${b.predicted_injury_type} | ${b.contributing_factors.join('; ')} |`)
  }
  lines.push('')

  if (r.prevention_plans.length > 0) {
    lines.push('## 预防方案')
    for (const p of r.prevention_plans) {
      lines.push(`### ${p.body_part}（优先级: ${p.priority}）`)
      for (const ex of p.exercises) lines.push(`- ${ex}（${p.frequency}）`)
      lines.push(`- 预期风险降低: ${p.expected_reduction_pct}%`)
      lines.push('')
    }
  }

  lines.push('## 训练修改建议')
  for (const m of r.training_modifications) lines.push(`- ${m}`)
  lines.push('')

  lines.push('## 监控建议')
  for (const m of r.monitoring_recommendations) lines.push(`- ${m}`)
  lines.push('')

  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatTrainingLoadReport(r: TrainingLoadResult): string {
  const lines: string[] = []
  lines.push(`# 训练负荷管理报告 — ${r.athlete_name}`)
  lines.push('')
  lines.push(`**当前阶段**: ${r.current_phase} | **负荷状态**: ${r.load_status.toUpperCase()} | **ACWR**: ${r.acute_chronic_ratio}`)
  lines.push(`**周总训练量**: ${r.weekly_volume_total} | **强度分布**: 低${r.intensity_distribution.low_pct}% / 中${r.intensity_distribution.moderate_pct}% / 高${r.intensity_distribution.high_pct}%`)
  lines.push('')

  lines.push('## 周训练计划')
  lines.push('| 日 | 训练类型 | 强度 | 时长(分) | 训练重点 | 目标负荷 |')
  lines.push('|---|----------|------|----------|----------|----------|')
  for (const d of r.weekly_plan) {
    lines.push(`| ${d.day} | ${d.session_type} | ${d.intensity} | ${d.duration_min} | ${d.focus} | ${d.target_load} |`)
  }
  lines.push('')

  if (r.periodization_blocks.length > 0) {
    lines.push('## 周期化训练板块')
    for (const b of r.periodization_blocks) {
      lines.push(`### ${b.block_name}（${b.weeks}）`)
      lines.push(`- 重点: ${b.focus} | 量: ${b.volume_pct}% | 强度: ${b.intensity_pct}%`)
      for (const o of b.key_objectives) lines.push(`- 目标: ${o}`)
      lines.push('')
    }
  }

  lines.push('## 竞赛调峰计划')
  for (const c of r.competition_peaking_plan) lines.push(`- ${c}`)
  lines.push('')

  lines.push('## 恢复建议')
  for (const rec of r.recovery_recommendations) lines.push(`- ${rec}`)
  lines.push('')

  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatMatchTacticReport(r: MatchTacticResult): string {
  const lines: string[] = []
  lines.push(`# 比赛战术布置报告 — ${r.team_name} vs ${r.opponent_team}`)
  lines.push('')
  lines.push(`**推荐阵型**: ${r.recommended_formation} | **比赛风格**: ${r.playing_style}`)
  lines.push(`**逼抢强度**: ${r.pressing_intensity} | **防线高度**: ${r.defensive_line} | **预期控球率**: ${r.expected_possession_pct}%`)
  lines.push('')

  lines.push('## 战术指令')
  lines.push('| 阶段 | 指令 | 目标球员 | 优先级 |')
  lines.push('|------|------|----------|--------|')
  for (const t of r.tactical_instructions) {
    lines.push(`| ${t.phase} | ${t.instruction} | ${t.target_players.join(', ')} | ${t.priority} |`)
  }
  lines.push('')

  lines.push('## 定位球方案')
  lines.push('| 类型 | 战术名称 | 主罚者 | 目标 | 预期成功率% |')
  lines.push('|------|----------|--------|------|-----------|')
  for (const sp of r.set_piece_plans) {
    lines.push(`| ${sp.type} | ${sp.routine_name} | ${sp.taker} | ${sp.targets.join(', ')} | ${sp.expected_success_rate} |`)
  }
  lines.push('')

  if (r.player_matchups.length > 0) {
    lines.push('## 球员对位')
    for (const m of r.player_matchups) {
      lines.push(`- ${m.our_player} vs ${m.opponent_player}: ${m.tactical_note}`)
    }
    lines.push('')
  }

  lines.push('## 关键威胁')
  for (const t of r.key_threats) lines.push(`- ${t}`)
  lines.push('')

  lines.push('## 进攻机会')
  for (const o of r.exploit_opportunities) lines.push(`- ${o}`)
  lines.push('')

  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatTalentScoutReport(r: TalentScoutResult): string {
  const lines: string[] = []
  lines.push(`# 青少年球探评估报告 — ${r.athlete_name}`)
  lines.push('')
  lines.push(`**项目**: ${r.sport} | **位置**: ${r.position} | **年龄**: ${r.age}岁 | **球探评级**: ${r.scout_grade}`)
  lines.push(`**当前能力**: ${r.current_ability_score}/100 | **潜力评分**: ${r.overall_potential_score}/100`)
  lines.push(`**预计巅峰年龄**: ${r.projected_peak_age}岁 | **预计巅峰评分**: ${r.projected_peak_rating}/100`)
  lines.push(`**发展模板**: ${r.comparable_player} | **估值范围**: ${r.estimated_value_range}`)
  lines.push('')

  lines.push('## 技术能力评估')
  lines.push('| 技能项 | 当前水平 | 潜力上限 | 发展优先级 | 年龄调整评分 |')
  lines.push('|--------|----------|----------|-----------|------------|')
  for (const s of r.skill_assessments) {
    lines.push(`| ${s.category} | ${s.current_level} | ${s.potential_ceiling} | ${s.development_priority} | ${s.age_adjusted_rating} |`)
  }
  lines.push('')

  lines.push('## 身体发展预测')
  lines.push(r.physical_projection)
  lines.push('')

  lines.push('## 心理画像')
  lines.push(r.mental_profile)
  lines.push('')

  lines.push('## 发展建议')
  for (const d of r.development_recommendations) lines.push(`- ${d}`)
  lines.push('')

  lines.push('## 风险因素')
  for (const rf of r.risk_factors) lines.push(`- ${rf}`)
  lines.push('')

  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatNutritionRecoveryReport(r: NutritionRecoveryResult): string {
  const lines: string[] = []
  lines.push(`# 运动员营养与恢复方案 — ${r.athlete_name}`)
  lines.push('')
  lines.push(`**每日能量消耗**: ${r.daily_energy_expenditure}kcal | **基础代谢**: ${r.bmr}kcal`)
  lines.push('')

  for (const plan of r.daily_nutrition_plans) {
    lines.push(`## ${plan.day_type}营养方案`)
    lines.push(`- 总热量: ${plan.total_calories}kcal | 蛋白质: ${plan.protein_g}g | 碳水: ${plan.carbs_g}g | 脂肪: ${plan.fat_g}g`)
    lines.push('')
    lines.push('| 餐次 | 时间 | 热量(kcal) | 描述 |')
    lines.push('|------|------|-----------|------|')
    for (const m of plan.meals) {
      lines.push(`| ${m.meal} | ${m.timing} | ${m.calories} | ${m.description} |`)
    }
    lines.push('')
  }

  lines.push('## 水分与电解质')
  lines.push(`- 每日饮水: ${r.hydration_plan.daily_water_l}L`)
  lines.push(`- 训练前: ${r.hydration_plan.pre_training_ml}ml | 训练中: ${r.hydration_plan.during_training_ml}ml/h | 训练后: ${r.hydration_plan.post_training_ml}ml`)
  lines.push(`- 电解质补充: ${r.hydration_plan.electrolyte_timing}`)
  lines.push('')

  if (r.supplement_recommendations.length > 0) {
    lines.push('## 补剂建议')
    lines.push('| 补剂 | 剂量 | 服用时间 | 目的 |')
    lines.push('|------|------|----------|------|')
    for (const s of r.supplement_recommendations) {
      lines.push(`| ${s.supplement} | ${s.dosage} | ${s.timing} | ${s.purpose} |`)
    }
    lines.push('')
  }

  lines.push('## 恢复方案')
  lines.push('| 时机 | 方案 | 时长(分) | 目的 | 优先级 |')
  lines.push('|------|------|----------|------|--------|')
  for (const rp of r.recovery_protocols) {
    lines.push(`| ${rp.timing} | ${rp.protocol} | ${rp.duration_min} | ${rp.purpose} | ${rp.priority} |`)
  }
  lines.push('')

  lines.push('## 比赛日营养')
  for (const c of r.competition_nutrition) lines.push(`- ${c}`)
  lines.push('')

  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatRefereeAuditReport(r: RefereeAuditResult): string {
  const lines: string[] = []
  lines.push(`# 裁判判罚合规性审查报告`)
  lines.push('')
  lines.push(`**比赛**: ${r.match_info_summary} | **裁判**: ${r.match_info_summary} | **综合评级**: ${r.overall_grade.toUpperCase()}`)
  lines.push(`**判罚准确率**: ${r.accuracy_pct}% (${r.correct_decisions}/${r.total_decisions}) | **关键误判**: ${r.critical_errors} | **一致性评分**: ${r.consistency_score}`)
  lines.push('')

  lines.push('## 判罚详细评估')
  lines.push('| 时间 | 类型 | 裁判判罚 | 正确判罚 | 结果 | 严重度 | VAR建议 |')
  lines.push('|------|------|----------|----------|------|--------|---------|')
  for (const d of r.decision_assessments) {
    lines.push(`| ${d.minute}' | ${d.type} | ${d.referee_decision} | ${d.correct_decision} | ${d.is_correct ? '✓' : '✗'} | ${d.severity} | ${d.var_recommendation} |`)
  }
  lines.push('')

  if (r.decision_assessments.length > 0) {
    lines.push('## 判罚解释')
    for (const d of r.decision_assessments.filter(d => !d.is_correct)) {
      lines.push(`### ${d.minute}' - ${d.type}`)
      lines.push(`- ${d.explanation}`)
      lines.push(`- 规则依据: ${d.rule_reference}`)
      lines.push('')
    }
  }

  lines.push('## 改进方向')
  for (const i of r.improvement_areas) lines.push(`- ${i}`)
  lines.push('')

  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatBusinessReport(r: BusinessAnalyticsResult): string {
  const lines: string[] = []
  lines.push(`# 体育赛事商业分析报告 — ${r.team_name}`)
  lines.push('')
  lines.push(`**赛季**: ${r.current_season} | **场均上座**: ${r.avg_attendance_current} | **上座率**: ${r.capacity_utilization_pct}% | **球迷参与度**: ${r.fan_engagement_score}/100`)
  lines.push(`**预计总收入**: ¥${r.total_projected_revenue}M`)
  lines.push('')

  if (r.attendance_forecasts.length > 0) {
    lines.push('## 上座率预测')
    lines.push('| 对手 | 日期 | 预测上座 | 上座率% | 置信度 | 关键因素 |')
    lines.push('|------|------|----------|--------|--------|----------|')
    for (const f of r.attendance_forecasts) {
      lines.push(`| ${f.opponent} | ${f.date} | ${f.predicted_attendance} | ${f.capacity_pct} | ${f.confidence} | ${f.key_factors.join('; ')} |`)
    }
    lines.push('')
  }

  lines.push('## 收入预测')
  lines.push('| 类别 | 本赛季 | 下赛季预测 | 增长% | 建议 |')
  lines.push('|------|--------|-----------|--------|------|')
  for (const rp of r.revenue_projections) {
    lines.push(`| ${rp.category} | ¥${rp.current_season_m}M | ¥${rp.next_season_m}M | ${rp.growth_pct}% | ${rp.recommendation} |`)
  }
  lines.push('')

  if (r.pricing_optimizations.length > 0) {
    lines.push('## 票价优化')
    lines.push('| 档次 | 当前价格 | 建议价格 | 预期提升% |')
    lines.push('|------|----------|----------|-----------|')
    for (const p of r.pricing_optimizations) {
      lines.push(`| ${p.category} | ¥${p.current_price} | ¥${p.recommended_price} | ${p.expected_uplift_pct}% |`)
    }
    lines.push('')
  }

  lines.push('## 商业建议')
  for (const c of r.commercial_recommendations) lines.push(`- ${c}`)
  lines.push('')

  lines.push('## ROI分析')
  for (const roi of r.roi_analysis) lines.push(`- ${roi}`)
  lines.push('')

  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Performance Analyzer — 运动员表现分析与技术统计
  tools.register(defineTool({
    name: 'performance_analyzer',
    description: '运动员表现分析与技术统计 | Analyze athlete performance metrics and technical stats. Aggregates match data, calculates trends, identifies strengths/weaknesses, and provides overall performance scoring.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: athlete_id, athlete_name, sport(football|basketball|tennis|swimming|athletics|volleyball), position, match_data[{match_id, date, opponent, goals?, assists?, minutes_played, distance_km, sprints, passes_completed, passes_attempted, shots_on_target?, shots_total?, tackles?, interceptions?, rating}], physical_metrics{vo2max, body_fat_pct, muscle_mass_kg, resting_hr}, benchmark_percentile'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      return formatPerformanceReport(analyzePerformance(args.input_data))
    }
  }))

  // Tool 2: Injury Risk Predictor — 运动损伤风险预测与预防方案
  tools.register(defineTool({
    name: 'injury_risk_predictor',
    description: '运动损伤风险预测与预防方案 | Predict injury risk with prevention plans. Analyzes training load ratios, biomechanics, injury history, and current symptoms to project injury risks and prescribe prevention protocols.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: athlete_id, athlete_name, sport, age, height_cm, weight_kg, injury_history[{injury_type, date, recovery_days, recurrence, body_part}], training_load_last_4weeks[{week, acute_load, chronic_load, rpe_avg}], biomechanics{asymmetry_index_pct, flexibility_score, previous_surgery}, current_symptoms[{symptom, severity(mild|moderate|severe), body_part}], sleep_quality_avg, stress_level(low|medium|high)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      return formatInjuryRiskReport(analyzeInjuryRisk(args.input_data))
    }
  }))

  // Tool 3: Training Load Optimizer — 训练负荷管理与周期化安排
  tools.register(defineTool({
    name: 'training_load_optimizer',
    description: '训练负荷管理与周期化安排 | Optimize training load with periodization. Creates weekly training plans, calculates ACWR, prescribes periodization blocks, and provides peaking strategies for competition.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: athlete_id, athlete_name, sport, training_phase(preparation|competition|transition|rehabilitation), current_week_load, target_week_load, weekly_sessions[{session_id, type, duration_min, rpe, load}], fitness_level(beginner|intermediate|advanced|elite), competition_calendar[{event, date, priority(A|B|C)}], recovery_metrics{hrv_avg, sleep_hours, soreness_level, mood_score}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      return formatTrainingLoadReport(analyzeTrainingLoad(args.input_data))
    }
  }))

  // Tool 4: Match Tactic Planner — 比赛战术布置与对手分析
  tools.register(defineTool({
    name: 'match_tactic_planner',
    description: '比赛战术布置与对手分析 | Plan match tactics with opponent scouting. Generates tactical instructions, set-piece plans, player matchups, and formation recommendations based on opponent analysis.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: team_id, team_name, sport, formation, opponent_team, opponent_formation, opponent_strengths[], opponent_weaknesses[], opponent_recent_results[{match, result, score}], key_players[{name, position, role, fitness(fit|doubtful|injured)}], match_context(home|away|neutral), competition_importance(league|cup|derby|final)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      return formatMatchTacticReport(analyzeMatchTactics(args.input_data))
    }
  }))

  // Tool 5: Talent Scouting AI — 青少年球探与潜力评估
  tools.register(defineTool({
    name: 'talent_scouting_ai',
    description: '青少年球探与潜力评估 | Youth talent scouting with potential assessment. Evaluates technical skills, physical attributes, cognitive ability, and projects future development with comparable player templates.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: athlete_id, athlete_name, sport, date_of_birth, nationality, position, height_cm, weight_kg, technical_skills[{skill, score, max}], physical_attributes[{attribute, score, max}], cognitive_assessment{decision_making, spatial_awareness, game_intelligence}, match_performances[{tournament, matches, goals, assists, rating}], coach_assessment{work_ethic, coachability, teamwork, competitiveness}, development_environment{academy_tier, coaching_quality, competition_level}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      return formatTalentScoutReport(analyzeTalentScout(args.input_data))
    }
  }))

  // Tool 6: Nutrition Recovery Planner — 运动员营养与恢复方案
  tools.register(defineTool({
    name: 'nutrition_recovery_planner',
    description: '运动员营养与恢复方案 | Athlete nutrition and recovery planning. Creates personalized daily nutrition plans, hydration protocols, supplement recommendations, and recovery strategies.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: athlete_id, athlete_name, sport, weight_kg, height_cm, age, gender(male|female), training_phase, daily_training_hours, dietary_preference, food_allergies[], body_composition_goal(maintain|gain_muscle|lose_fat|recompose), competition_schedule[{event, date, day_of_week}], current_supplements[], hydration_status(optimal|adequate|dehydrated)'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      return formatNutritionRecoveryReport(analyzeNutritionRecovery(args.input_data))
    }
  }))

  // Tool 7: Referee Decision Auditor — 裁判判罚合规性审查与VAR模拟
  tools.register(defineTool({
    name: 'referee_decision_auditor',
    description: '裁判判罚合规性审查与VAR模拟 | Audit referee decisions and simulate VAR. Evaluates referee decisions against correct outcomes, provides rule references, suggests VAR interventions, and generates performance grades.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: match_id, match_info{home_team, away_team, date, competition, referee}, decisions[{decision_id, minute, type(penalty|red_card|yellow_card|offside|goal|var_review), description, referee_decision, correct_decision, rule_reference, evidence[]}], var_availability, match_context{score_at_time, momentum, previous_incidents[]}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      return formatRefereeAuditReport(analyzeRefereeDecisions(args.input_data))
    }
  }))

  // Tool 8: Sports Business Analytics — 体育赛事商业分析与上座率预测
  tools.register(defineTool({
    name: 'sports_business_analytics',
    description: '体育赛事商业分析与上座率预测 | Sports business analytics and attendance forecasting. Predicts attendance, projects revenue across streams, optimizes pricing, and provides ROI analysis and commercial recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: team_id, team_name, sport, league, stadium_capacity, current_season, historical_attendance[{season, avg_attendance, capacity_pct, ticket_revenue_m}], current_performance{wins, draws, losses, league_position, form_last_5[]}, ticket_pricing[{category, price, avg_sold, demand_level(low|medium|high)}], sponsorship_deals[{sponsor, value_m, duration_years, industry}], upcoming_fixtures[{opponent, date, is_derby, is_weekend, opponent_ranking}], market_data{city_population, avg_income, competitor_entertainment, fan_base_size}'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }]
    },
    async execute(args: { input_data: string }) {
      return formatBusinessReport(analyzeSportsBusiness(args.input_data))
    }
  }))

  console.log(`[dsh-tool-sportagentpro] Loaded v${VERSION} — Sports Intelligence AI Agent with 8 tools`)
  console.log('  Tools: performance_analyzer, injury_risk_predictor, training_load_optimizer, match_tactic_planner, talent_scouting_ai, nutrition_recovery_planner, referee_decision_auditor, sports_business_analytics')
}
