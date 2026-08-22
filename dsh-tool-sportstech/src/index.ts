/**
 * DSH Sports Tech & Analytics Plugin v0.1.0
 * Sports Tech & Analytics for DeepSeek Harness
 *
 * Tools:
 * 1. player_performance_analyzer  — 球员表现分析与评分
 * 2. injury_risk_predictor        — 伤病风险预测与预防建议
 * 3. game_strategy_optimizer      — 比赛战术优化与对手分析
 * 4. talent_scouting_ai           — 球探AI与潜力新秀评估
 * 5. fan_engagement_analyzer      — 球迷互动分析与增长策略
 * 6. sports_betting_analytics     — 体育博彩数据分析与价值投注
 * 7. training_load_optimizer      — 训练负荷优化与周期化规划
 * 8. match_simulation_engine      — 比赛模拟引擎与胜负预测
 *
 * @module dsh-tool-sportstech | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-sportstech'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1: Seeded Random (mulberry32 PRNG) ====================

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

  static hashStr(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2: Type Definitions ====================

// --- Tool 1: Player Performance Analyzer ---
export interface PlayerPerformanceInput {
  player_id: string
  player_name: string
  sport?: string
  position?: string
  season?: string
  games_played?: number
  minutes_total?: number
  goals?: number
  assists?: number
  pass_accuracy?: number
  tackle_success_rate?: number
  distance_covered_km?: number
  sprint_speed_max?: number
  heart_rate_avg?: number
  fatigue_index?: number
  consistency_score?: number
}

export interface PerformanceMetric {
  category: string
  metric_name: string
  value: number
  percentile: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  insight: string
}

export interface PlayerPerformanceResult {
  player_id: string
  player_name: string
  sport: string
  position: string
  overall_rating: number
  performance_tier: 'elite' | 'starter' | 'rotation' | 'developing'
  metrics: PerformanceMetric[]
  strengths: string[]
  weaknesses: string[]
  trend: 'rising' | 'stable' | 'declining'
  recommendations: string[]
  peer_comparison: string
}

// --- Tool 2: Injury Risk Predictor ---
export interface InjuryRiskInput {
  player_id: string
  player_name: string
  age?: number
  sport?: string
  position?: string
  injury_history_count?: number
  last_injury_days_ago?: number
  training_load_7d?: number
  training_load_28d?: number
  acute_chronic_ratio?: number
  sleep_quality?: number
  muscle_soreness?: number
  biomechanical_asymmetry?: number
  match_density?: number
  recovery_score?: number
}

export interface InjuryRiskFactor {
  factor: string
  risk_level: 'low' | 'moderate' | 'high' | 'extreme'
  contribution_pct: number
  detail: string
}

export interface PreventionRecommendation {
  category: string
  action: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  expected_risk_reduction: string
}

export interface InjuryRiskResult {
  player_id: string
  player_name: string
  overall_risk_score: number
  risk_category: 'minimal' | 'low' | 'moderate' | 'high' | 'severe'
  risk_factors: InjuryRiskFactor[]
  body_parts_at_risk: string[]
  estimated_return_days: number
  prevention_recommendations: PreventionRecommendation[]
  monitoring_alerts: string[]
}

// --- Tool 3: Game Strategy Optimizer ---
export interface GameStrategyInput {
  team_id: string
  team_name: string
  opponent_id?: string
  opponent_name?: string
  sport?: string
  formation?: string
  home_away?: 'home' | 'away' | 'neutral'
  recent_form?: string[]
  possession_avg?: number
  pass_completion_rate?: number
  pressing_intensity?: number
  defensive_line_height?: number
  counter_attack_tendency?: number
  set_piece_threat?: number
  opponent_weaknesses?: string[]
  opponent_strengths?: string[]
}

export interface TacticalAdjustment {
  area: string
  current_approach: string
  recommended_approach: string
  expected_impact: string
  difficulty: 'easy' | 'moderate' | 'complex'
}

export interface GameStrategyResult {
  team_id: string
  team_name: string
  opponent_name: string
  recommended_formation: string
  tactical_philosophy: string
  tactical_adjustments: TacticalAdjustment[]
  key_battles: string[]
  set_piece_strategy: string
  substitution_plan: string[]
  win_probability: number
  risk_assessment: string
}

// --- Tool 4: Talent Scouting AI ---
export interface TalentScoutInput {
  prospect_name: string
  prospect_id: string
  age?: number
  nationality?: string
  sport?: string
  position?: string
  current_club?: string
  scout_rating?: number
  technical_score?: number
  physical_score?: number
  mental_score?: number
  tactical_score?: number
  potential_ceiling?: number
  consistency?: number
  big_game_performance?: number
  coachability?: number
  comparable_player?: string
}

export interface SkillBreakdown {
  skill: string
  current_level: number
  projected_level: number
  scout_confidence: number
  development_priority: 'critical' | 'important' | 'beneficial'
}

export interface TalentScoutResult {
  prospect_id: string
  prospect_name: string
  overall_grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C'
  scout_score: number
  potential_score: number
  transfer_value_estimate: string
  skills: SkillBreakdown[]
  strengths: string[]
  development_areas: string[]
  comparable_profiles: string[]
  recommendation: string
  risk_factors: string[]
}

// --- Tool 5: Fan Engagement Analyzer ---
export interface FanEngagementInput {
  team_id: string
  team_name: string
  sport?: string
  league?: string
  stadium_capacity?: number
  avg_attendance?: number
  social_media_followers?: number
  social_media_engagement_rate?: number
  merchandise_revenue_index?: number
  fan_satisfaction_score?: number
  season_ticket_holders?: number
  digital_subscribers?: number
  matchday_app_active_users?: number
  international_fan_pct?: number
  fan_demographic_youth_pct?: number
}

export interface EngagementChannel {
  channel: string
  score: number
  trend: 'growing' | 'stable' | 'declining'
  opportunity: string
  benchmark_vs_league: 'above' | 'average' | 'below'
}

export interface EngagementInitiative {
  initiative: string
  target_segment: string
  expected_uplift: string
  investment_level: 'low' | 'medium' | 'high'
  timeframe: string
}

export interface FanEngagementResult {
  team_id: string
  team_name: string
  overall_engagement_score: number
  engagement_tier: 'world_class' | 'strong' | 'moderate' | 'developing'
  channels: EngagementChannel[]
  fan_loyalty_index: number
  growth_opportunities: EngagementInitiative[]
  risk_areas: string[]
  benchmark_summary: string
  action_plan: string[]
}

// --- Tool 6: Sports Betting Analytics ---
export interface BettingAnalyticsInput {
  event_id: string
  event_name: string
  sport?: string
  market_type?: string
  home_odds?: number
  draw_odds?: number
  away_odds?: number
  home_win_probability?: number
  draw_probability?: number
  away_win_probability?: number
  home_recent_form?: string[]
  away_recent_form?: string[]
  head_to_head_home_wins?: number
  head_to_head_draws?: number
  head_to_head_away_wins?: number
  home_injuries?: string[]
  away_injuries?: string[]
  motivational_factor_home?: number
  motivational_factor_away?: number
  expected_goals_home?: number
  expected_goals_away?: number
}

export interface BettingMarket {
  market: string
  selection: string
  odds: number
  implied_probability: number
  model_probability: number
  edge: number
  confidence: number
  recommendation: 'strong_bet' | 'value_bet' | 'lean' | 'pass'
}

export interface BettingAnalyticsResult {
  event_id: string
  event_name: string
  markets_analyzed: BettingMarket[]
  best_value_bet: string
  kelly_criterion_stake: number
  model_accuracy_estimate: number
  key_factors: string[]
  risk_warnings: string[]
  bankroll_advice: string
}

// --- Tool 7: Training Load Optimizer ---
export interface TrainingLoadInput {
  athlete_id: string
  athlete_name: string
  sport?: string
  position?: string
  training_phase?: 'pre_season' | 'early_season' | 'mid_season' | 'peak' | 'taper' | 'off_season'
  current_load?: number
  target_load?: number
  weekly_sessions?: number
  intensity_distribution?: { low: number; moderate: number; high: number }
  recovery_days?: number
  sleep_hours_avg?: number
  wellness_score?: number
  performance_trend?: 'improving' | 'stable' | 'fatigued'
  upcoming_competition_days?: number
  injury_status?: 'healthy' | 'managing' | 'rehabilitating'
}

export interface TrainingSession {
  day: string
  session_type: string
  duration_minutes: number
  intensity: 'low' | 'moderate' | 'high' | 'maximal'
  load: number
  focus: string
  recovery_protocol: string
}

export interface LoadAlert {
  alert_type: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  action_required: string
}

export interface TrainingLoadResult {
  athlete_id: string
  athlete_name: string
  current_phase: string
  weekly_plan: TrainingSession[]
  total_weekly_load: number
  acute_chronic_workload_ratio: number
  load_status: 'undertraining' | 'optimal' | 'overreaching' | 'overtraining'
  alerts: LoadAlert[]
  recovery_recommendations: string[]
  performance_prediction: string
  periodization_notes: string[]
}

// --- Tool 8: Match Simulation Engine ---
export interface MatchSimulationInput {
  home_team_id: string
  home_team_name: string
  away_team_id: string
  away_team_name: string
  sport?: string
  home_rating?: number
  away_rating?: number
  home_advantage?: number
  home_possession_tendency?: number
  away_possession_tendency?: number
  home_attack_strength?: number
  away_attack_strength?: number
  home_defense_strength?: number
  away_defense_strength?: number
  home_form_adjustment?: number
  away_form_adjustment?: number
  simulation_runs?: number
  weather_impact?: 'none' | 'mild' | 'moderate' | 'severe'
}

export interface SimulationOutcome {
  outcome: string
  probability: number
  avg_score: string
  sample_scores: string[]
}

export interface MatchSimulationResult {
  home_team_name: string
  away_team_name: string
  most_likely_result: string
  home_win_probability: number
  draw_probability: number
  away_win_probability: number
  expected_goals_home: number
  expected_goals_away: number
  both_teams_to_score_prob: number
  over_2_5_probability: number
  correct_score_predictions: SimulationOutcome[]
  confidence_level: number
  key_match_factors: string[]
  simulation_summary: string
}

// ==================== SECTION 3: Analysis Functions ====================

// --- Tool 1: Player Performance Analyzer ---
function analyzePlayerPerformance(input: PlayerPerformanceInput): PlayerPerformanceResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.player_id + JSON.stringify(input).slice(0, 80)
  ))

  const sport = input.sport ?? 'soccer'
  const position = input.position ?? 'midfielder'
  const games = input.games_played ?? rng.nextInt(15, 38)
  const minutes = input.minutes_total ?? rng.nextInt(800, 3200)
  const goals = input.goals ?? rng.nextInt(0, 25)
  const assists = input.assists ?? rng.nextInt(0, 15)
  const passAcc = input.pass_accuracy ?? rng.nextInt(65, 95)
  const tackleRate = input.tackle_success_rate ?? rng.nextInt(50, 90)
  const distance = input.distance_covered_km ?? rng.nextInt(150, 450)
  const sprintSpeed = input.sprint_speed_max ?? rng.nextInt(28, 37)
  const hrAvg = input.heart_rate_avg ?? rng.nextInt(130, 175)
  const fatigue = input.fatigue_index ?? rng.nextInt(10, 60)
  const consistency = input.consistency_score ?? rng.nextInt(40, 95)

  // Compute per-game metrics for fair comparison
  const goalsPerGame = Math.round((goals / games) * 100) / 100
  const assistsPerGame = Math.round((assists / games) * 100) / 100
  const minutesAvg = Math.round(minutes / games)

  const metrics: PerformanceMetric[] = [
    {
      category: 'Scoring',
      metric_name: 'Goals per game',
      value: goalsPerGame,
      percentile: Math.min(99, Math.round(goalsPerGame * 30 +rng.nextFloat(-5, 5))),
      grade: goalsPerGame >= 0.6 ? 'S' : goalsPerGame >= 0.4 ? 'A' : goalsPerGame >= 0.2 ? 'B' : goalsPerGame >= 0.1 ? 'C' : 'D',
      insight: goalsPerGame >= 0.4 ? 'Elite scoring rate, top-tier finisher' : goalsPerGame >= 0.2 ? 'Solid scoring contribution' : 'Scoring below expectations for position',
    },
    {
      category: 'Playmaking',
      metric_name: 'Assists per game',
      value: assistsPerGame,
      percentile: Math.min(99, Math.round(assistsPerGame * 40 + rng.nextFloat(-5, 5))),
      grade: assistsPerGame >= 0.3 ? 'S' : assistsPerGame >= 0.2 ? 'A' : assistsPerGame >= 0.1 ? 'B' : assistsPerGame >= 0.05 ? 'C' : 'D',
      insight: assistsPerGame >= 0.2 ? 'Excellent creative output for the team' : 'Room for improvement in final-third contributions',
    },
    {
      category: 'Technical',
      metric_name: 'Pass accuracy',
      value: passAcc,
      percentile: Math.min(99, Math.round((passAcc - 60) * 2.5 + rng.nextFloat(-3, 3))),
      grade: passAcc >= 88 ? 'S' : passAcc >= 82 ? 'A' : passAcc >= 75 ? 'B' : passAcc >= 68 ? 'C' : 'D',
      insight: passAcc >= 85 ? 'Elite ball retention and distribution' : passAcc >= 75 ? 'Reliable passer under pressure' : 'Passing accuracy needs focused work',
    },
    {
      category: 'Defensive',
      metric_name: 'Tackle success rate',
      value: tackleRate,
      percentile: Math.min(99, Math.round((tackleRate - 45) * 2 + rng.nextFloat(-3, 3))),
      grade: tackleRate >= 80 ? 'S' : tackleRate >= 70 ? 'A' : tackleRate >= 60 ? 'B' : tackleRate >= 50 ? 'C' : 'D',
      insight: tackleRate >= 75 ? 'Excellent 1v1 defender, high win rate' : 'Defensive duels are a mixed bag, positioning work needed',
    },
    {
      category: 'Physical',
      metric_name: 'Distance covered (km/game)',
      value: Math.round((distance / games) * 10) / 10,
      percentile: Math.min(99, Math.round(((distance / games) - 8) * 15 + rng.nextFloat(-3, 3))),
      grade: (distance / games) >= 12 ? 'S' : (distance / games) >= 10.5 ? 'A' : (distance / games) >= 9 ? 'B' : (distance / games) >= 8 ? 'C' : 'D',
      insight: (distance / games) >= 11 ? 'Exceptional engine and work rate' : 'Adequate coverage, could increase intensity in transition',
    },
    {
      category: 'Athletic',
      metric_name: 'Max sprint speed',
      value: sprintSpeed,
      percentile: Math.min(99, Math.round((sprintSpeed - 27) * 8 + rng.nextFloat(-3, 3))),
      grade: sprintSpeed >= 34 ? 'S' : sprintSpeed >= 32 ? 'A' : sprintSpeed >= 30 ? 'B' : sprintSpeed >= 29 ? 'C' : 'D',
      insight: sprintSpeed >= 33 ? 'Elite pace, a weapon in behind defences' : 'Average sprint speed, may benefit from power training',
    },
    {
      category: 'Mental',
      metric_name: 'Consistency score',
      value: consistency,
      percentile: consistency,
      grade: consistency >= 85 ? 'S' : consistency >= 72 ? 'A' : consistency >= 58 ? 'B' : consistency >= 45 ? 'C' : 'D',
      insight: consistency >= 75 ? 'Highly reliable week-to-week performer' : 'Inconsistent output, focus on repeatable habits',
    },
  ]

  // Overall rating: weighted average
  const weights = [0.18, 0.14, 0.16, 0.12, 0.14, 0.12, 0.14]
  let overall = 0
  for (let i = 0; i < metrics.length; i++) {
    overall += (metrics[i].percentile / 100) * 10 * weights[i]
  }
  overall = Math.round(overall * 10) / 10

  const tier: PlayerPerformanceResult['performance_tier'] =
    overall >= 8.5 ? 'elite' : overall >= 7 ? 'starter' : overall >= 5.5 ? 'rotation' : 'developing'

  // Strengths and weaknesses
  const strengths: string[] = []
  const weaknesses: string[] = []
  for (const m of metrics) {
    if (m.grade === 'S' || m.grade === 'A') strengths.push(`${m.metric_name}: ${m.percentile}th percentile (${m.grade})`)
    if (m.grade === 'D' || m.grade === 'C') weaknesses.push(`${m.metric_name}: ${m.percentile}th percentile (${m.grade})`)
  }
  if (strengths.length === 0) strengths.push('Solid overall foundation with no major red flags')
  if (weaknesses.length === 0) weaknesses.push('No critical weaknesses identified; marginal gains available')

  const trend: PlayerPerformanceResult['trend'] =
    consistency >= 75 && fatigue <= 30 ? 'rising' : fatigue >= 50 ? 'declining' : 'stable'

  const recommendations: string[] = []
  if (fatigue >= 45) recommendations.push('Reduce high-intensity load; incorporate more recovery sessions between matches')
  if (passAcc < 75) recommendations.push('Dedicate 20 minutes per session to passing drills under pressure')
  if (sprintSpeed < 31) recommendations.push('Introduce plyometric and resisted sprint training twice weekly')
  if (consistency < 60) recommendations.push('Work with sports psychologist on pre-match routines and focus strategies')
  if (minutesAvg > 85 && fatigue > 40) recommendations.push('Consider rotation in cup matches to manage cumulative fatigue')
  if (recommendations.length === 0) recommendations.push('Maintain current training load; focus on marginal tactical gains')

  const peerPercentile = Math.round(overall * 10)
  const peerComparison = `${input.player_name} ranks in the ${peerPercentile}th percentile for ${position}s in ${sport}, rated ${overall}/10 (${tier})`

  return {
    player_id: input.player_id,
    player_name: input.player_name,
    sport,
    position,
    overall_rating: overall,
    performance_tier: tier,
    metrics,
    strengths,
    weaknesses,
    trend,
    recommendations,
    peer_comparison: peerComparison,
  }
}

// --- Tool 2: Injury Risk Predictor ---
function analyzeInjuryRisk(input: InjuryRiskInput): InjuryRiskResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.player_id + JSON.stringify(input).slice(0, 80)
  ))

  const age = input.age ?? rng.nextInt(18, 35)
  const sport = input.sport ?? 'soccer'
  const injuryHistory = input.injury_history_count ?? rng.nextInt(0, 8)
  const lastInjury = input.last_injury_days_ago ?? rng.nextInt(14, 500)
  const load7d = input.training_load_7d ?? rng.nextInt(600, 1500)
  const load28d = input.training_load_28d ?? rng.nextInt(2500, 5000)
  const acuteChronic = input.acute_chronic_ratio ?? Math.round((load7d / (load28d / 4)) * 100) / 100
  const sleep = input.sleep_quality ?? rng.nextInt(4, 10)
  const soreness = input.muscle_soreness ?? rng.nextInt(1, 8)
  const asymmetry = input.biomechanical_asymmetry ?? rng.nextInt(1, 15)
  const matchDensity = input.match_density ?? rng.nextInt(1, 4)
  const recovery = input.recovery_score ?? rng.nextInt(40, 95)

  // Risk scoring
  let riskScore = 0

  // Acute:Chronic Workload Ratio (sweet spot ~0.8-1.3)
  if (acuteChronic > 1.5) riskScore += 25
  else if (acuteChronic > 1.3) riskScore += 15
  else if (acuteChronic < 0.7) riskScore += 8

  // Injury history
  if (injuryHistory >= 5) riskScore += 20
  else if (injuryHistory >= 3) riskScore += 12
  else if (injuryHistory >= 1) riskScore += 5

  // Recent injury
  if (lastInjury < 30) riskScore += 18
  else if (lastInjury < 90) riskScore += 10
  else if (lastInjury < 180) riskScore += 5

  // Sleep
  if (sleep < 5) riskScore += 12
  else if (sleep < 7) riskScore += 6

  // Soreness
  if (soreness >= 7) riskScore += 10
  else if (soreness >= 5) riskScore += 5

  // Asymmetry
  if (asymmetry >= 10) riskScore += 8
  else if (asymmetry >= 6) riskScore += 4

  // Match density
  if (matchDensity >= 3) riskScore += 10
  else if (matchDensity >= 2) riskScore += 4

  // Recovery (inverse)
  if (recovery < 50) riskScore += 12
  else if (recovery < 65) riskScore += 6

  // Age factor
  if (age >= 32) riskScore += 8
  else if (age >= 29) riskScore += 4

  // Clamp to 0-100
  riskScore = Math.min(100, Math.max(0, riskScore + rng.nextInt(-3, 3)))

  const category: InjuryRiskResult['risk_category'] =
    riskScore >= 75 ? 'severe' : riskScore >= 55 ? 'high' : riskScore >= 35 ? 'moderate' : riskScore >= 15 ? 'low' : 'minimal'

  // Risk factors breakdown
  const factors: InjuryRiskFactor[] = []
  if (acuteChronic > 1.3) factors.push({ factor: 'Acute:Chronic Workload Ratio', risk_level: acuteChronic > 1.5 ? 'extreme' : 'high', contribution_pct: 20, detail: `Ratio of ${acuteChronic} indicates a spike in recent training load` })
  if (sleep < 6) factors.push({ factor: 'Sleep Quality', risk_level: sleep < 5 ? 'high' : 'moderate', contribution_pct: 12, detail: `Sleep score ${sleep}/10 reduces tissue recovery capacity` })
  if (injuryHistory >= 3) factors.push({ factor: 'Injury History', risk_level: injuryHistory >= 5 ? 'high' : 'moderate', contribution_pct: 15, detail: `${injuryHistory} previous injuries suggest susceptibility to re-injury` })
  if (lastInjury < 60) factors.push({ factor: 'Recent Injury', risk_level: lastInjury < 30 ? 'extreme' : 'high', contribution_pct: 18, detail: `Only ${lastInjury} days since last injury, tissue may not be fully remodelled` })
  if (soreness >= 5) factors.push({ factor: 'Muscle Soreness', risk_level: soreness >= 7 ? 'high' : 'moderate', contribution_pct: 10, detail: `Soreness level ${soreness}/10 indicates incomplete recovery` })
  if (recovery < 60) factors.push({ factor: 'Recovery Score', risk_level: recovery < 50 ? 'high' : 'moderate', contribution_pct: 10, detail: `Recovery ${recovery}/100 below optimal threshold` })
  if (asymmetry >= 6) factors.push({ factor: 'Biomechanical Asymmetry', risk_level: asymmetry >= 10 ? 'high' : 'moderate', contribution_pct: 8, detail: `${asymmetry}% asymmetry between limbs increases compensatory injury risk` })
  if (matchDensity >= 2) factors.push({ factor: 'Match Density', risk_level: matchDensity >= 3 ? 'high' : 'moderate', contribution_pct: 10, detail: `${matchDensity} matches per week limits inter-match recovery window` })
  if (age >= 29) factors.push({ factor: 'Age Factor', risk_level: age >= 32 ? 'moderate' : 'low', contribution_pct: 6, detail: `Age ${age}: tissue elasticity and recovery rate naturally decline` })
  // Sort by contribution
  factors.sort((a, b) => b.contribution_pct - a.contribution_pct)

  // Body parts at risk
  const bodyParts: string[] = []
  if (sport === 'soccer') {
    if (acuteChronic > 1.3 || matchDensity >= 2) bodyParts.push('Hamstring', 'Groin', 'Calf')
    if (asymmetry >= 6) bodyParts.push('Knee (ACL risk)')
    if (age >= 30) bodyParts.push('Ankle', 'Lower back')
  } else if (sport === 'basketball') {
    bodyParts.push('Ankle', 'Knee')
    if (matchDensity >= 2) bodyParts.push('Achilles', 'Lower back')
  } else if (sport === 'tennis') {
    bodyParts.push('Shoulder', 'Elbow', 'Wrist')
    if (asymmetry >= 6) bodyParts.push('Lower back')
  } else {
    bodyParts.push('Hamstring', 'Shoulder', 'Lower back')
  }
  // Ensure defaults if empty
  if (bodyParts.length === 0) bodyParts.push('General soft tissue')

  // Estimated return if injured
  const estReturn = category === 'severe' ? rng.nextInt(21, 60) : category === 'high' ? rng.nextInt(10, 28) : category === 'moderate' ? rng.nextInt(5, 14) : rng.nextInt(1, 7)

  // Prevention recommendations
  const prevention: PreventionRecommendation[] = []
  if (acuteChronic > 1.3) prevention.push({ category: 'Load Management', action: 'Reduce training volume by 15-20% this week to bring AWR below 1.3', priority: acuteChronic > 1.5 ? 'critical' : 'high', expected_risk_reduction: '20-30% reduction in soft tissue injury risk' })
  if (sleep < 7) prevention.push({ category: 'Recovery', action: 'Implement structured sleep hygiene protocol: target 8+ hours, consistent bedtime', priority: sleep < 5 ? 'critical' : 'high', expected_risk_reduction: '15% improvement in tissue repair quality' })
  if (asymmetry >= 6) prevention.push({ category: 'Prehabilitation', action: 'Add unilateral strength drills 3x/week to correct left-right imbalances', priority: asymmetry >= 10 ? 'critical' : 'medium', expected_risk_reduction: 'Reduce asymmetry to below 5% threshold' })
  if (injuryHistory >= 3) prevention.push({ category: 'Medical Screening', action: 'Schedule comprehensive musculoskeletal screening with sports medicine team', priority: 'high', expected_risk_reduction: 'Early identification of subclinical issues' })
  if (matchDensity >= 2) prevention.push({ category: 'Rotation', action: 'Plan midweek rotation; limit high-intensity minutes in non-critical fixtures', priority: matchDensity >= 3 ? 'critical' : 'medium', expected_risk_reduction: '30% reduction in cumulative fatigue' })
  if (soreness >= 5) prevention.push({ category: 'Recovery', action: 'Prioritize cold water immersion, compression garments, and 20-min post-session stretch', priority: soreness >= 7 ? 'high' : 'medium', expected_risk_reduction: 'Reduced DOMS and faster return to baseline' })
  if (prevention.length === 0) prevention.push({ category: 'Maintenance', action: 'Continue current protocols; no immediate intervention required', priority: 'low', expected_risk_reduction: 'Maintain current low-risk status' })

  // Monitoring alerts
  const alerts: string[] = []
  if (category === 'severe' || category === 'high') alerts.push(`URGENT: Player flagged as ${category.toUpperCase()} risk — immediate load reduction recommended`)
  if (acuteChronic > 1.5) alerts.push(`CRITICAL: AWR ${acuteChronic} exceeds safe threshold (>1.5) — injury probability elevated`)
  if (lastInjury < 21) alerts.push(`WARNING: Only ${lastInjury} days post-injury — return-to-play protocol must be closely followed`)
  if (sleep < 5) alerts.push(`WARNING: Sleep deprivation detected (${sleep}/10) — cognitive and physical recovery compromised`)
  if (recovery < 45) alerts.push(`ALERT: Recovery score critically low (${recovery}/100) — consider full rest day`)
  if (alerts.length === 0) alerts.push('All metrics within normal ranges — continue standard monitoring')

  return {
    player_id: input.player_id,
    player_name: input.player_name,
    overall_risk_score: riskScore,
    risk_category: category,
    risk_factors: factors,
    body_parts_at_risk: bodyParts,
    estimated_return_days: estReturn,
    prevention_recommendations: prevention,
    monitoring_alerts: alerts,
  }
}

// --- Tool 3: Game Strategy Optimizer ---
function analyzeGameStrategy(input: GameStrategyInput): GameStrategyResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.team_id + (input.opponent_id ?? 'na') + JSON.stringify(input).slice(0, 60)
  ))

  const sport = input.sport ?? 'soccer'
  const oppName = input.opponent_name ?? 'Opponent'
  const formation = input.formation ?? '4-3-3'
  const homeAway = input.home_away ?? 'home'
  const possession = input.possession_avg ?? rng.nextInt(42, 65)
  const passComp = input.pass_completion_rate ?? rng.nextInt(72, 92)
  const pressing = input.pressing_intensity ?? rng.nextInt(40, 90)
  const defLine = input.defensive_line_height ?? rng.nextInt(35, 70)
  const counter = input.counter_attack_tendency ?? rng.nextInt(20, 80)
  const setPieces = input.set_piece_threat ?? rng.nextInt(30, 85)
  const oppWeaknesses = input.opponent_weaknesses ?? ['Defending wide areas', 'High defensive line vulnerable to through balls', 'Set piece marking inconsistencies']
  const oppStrengths = input.opponent_strengths ?? ['Strong central midfield', 'Effective counter-pressing', 'Clinical finishing']

  // Determine recommended formation
  let recommendedFormation = formation
  if (possession >= 58 && pressing >= 70) recommendedFormation = '4-3-3 (Holding)'
  else if (possession < 45 && counter >= 60) recommendedFormation = '5-4-1 / 4-5-1'
  else if (pressing >= 75) recommendedFormation = '4-2-3-1 (High Press)'

  // Tactical philosophy
  let philosophy: string
  if (possession >= 55 && passComp >= 82) philosophy = 'Possession-dominant: Control tempo, overload central channels, patient build-up'
  else if (pressing >= 75) philosophy = 'Gegenpressing: Win ball high, force errors in dangerous areas, vertical transitions'
  else if (counter >= 60) philosophy = 'Counter-attacking: Compact mid-block, explosive transitions, exploit space behind'
  else philosophy = 'Balanced adaptive: Shift between phases based on game state, pragmatic approach'

  // Tactical adjustments
  const adjustments: TacticalAdjustment[] = []
  if (oppWeaknesses.length > 0) {
    const w = oppWeaknesses[0]
    if (w.includes('wide') || w.includes('Wide')) {
      adjustments.push({ area: 'Attacking Width', current_approach: 'Standard width', recommended_approach: 'Stretch pitch with aggressive fullback overlaps', expected_impact: 'Isolate opposing fullbacks 1v1, create 2v1 overloads', difficulty: 'moderate' })
    } else if (w.includes('high line') || w.includes('High')) {
      adjustments.push({ area: 'Through Balls', current_approach: 'Mixed build-up', recommended_approach: 'Increase passes in behind defensive line by 30%', expected_impact: 'Force CBs into recovery runs, create 1v1s with GK', difficulty: 'moderate' })
    } else if (w.includes('set') || w.includes('Set')) {
      adjustments.push({ area: 'Set Pieces', current_approach: 'Standard corner routines', recommended_approach: 'Target zonal mismatches with near-post flick-on routines', expected_impact: 'Increase set piece xG by 40%', difficulty: 'easy' })
    }
  }
  if (oppStrengths.length > 0) {
    const s = oppStrengths[0]
    if (s.includes('midfield') || s.includes('Midfield')) {
      adjustments.push({ area: 'Midfield Battle', current_approach: 'Standard midfield shape', recommended_approach: 'Add extra body to midfield (3-man mid), deny passing lanes to their playmaker', expected_impact: 'Reduce opponent pass completion in middle third by 10%', difficulty: 'moderate' })
    }
  }
  // Home/away adjustment
  if (homeAway === 'away') {
    adjustments.push({ area: 'Defensive Setup', current_approach: 'Usual pressing distance', recommended_approach: 'Drop defensive line 5m deeper, compress space between lines', expected_impact: 'Reduce space for opponent counter-attacks at altitude', difficulty: 'easy' })
  }
  // Ensure at least 2 adjustments
  if (adjustments.length < 2) {
    adjustments.push({ area: 'Transition', current_approach: 'Natural game rhythm', recommended_approach: 'Prioritize ball recovery within 8 seconds of losing possession', expected_impact: 'Catch opponent out of shape on turnover', difficulty: 'moderate' })
  }

  // Key battles
  const battles: string[] = [
    'Midfield pivot vs their pressing midfielder',
    'Our attacking fullback vs their inverted winger',
    'Aerial duels in both boxes during set pieces',
  ]

  // Set piece strategy
  const spStrat = setPieces >= 65
    ? 'Aggressive set piece routines: 4 pre-rehearsed corner plays, focus on near-post delivery and second-ball recovery'
    : 'Corners: Inswinging delivery to far post zone. Free kicks: Direct shooting inside 25m, wall pass beyond.'

  // Substitution plan
  const subs: string[] = [
    'Minute 60: Introduce fresh winger to exploit tiring fullback',
    'Minute 70: Impact striker for penalty-box presence if chasing game',
    'Minute 80: Defensive midfielder to protect lead / extra attacker if trailing',
  ]

  // Win probability estimate
  let winProb = homeAway === 'home' ? 50 : homeAway === 'neutral' ? 42 : 38
  if (possession >= 55) winProb += 5
  if (pressing >= 70) winProb += 3
  if (passComp >= 85) winProb += 4
  if (input.opponent_name && input.opponent_strengths && input.opponent_strengths.length >= 3) winProb -= 5
  winProb = Math.min(85, Math.max(15, winProb + rng.nextInt(-5, 5)))

  const riskAssessment = homeAway === 'away'
    ? 'Away fixture with adjusted defensive setup; risk managed through compact shape and transition discipline'
    : 'Home advantage leveraged with proactive approach; risk lies in overcommitting against quality opponents'

  return {
    team_id: input.team_id,
    team_name: input.team_name,
    opponent_name: oppName,
    recommended_formation: recommendedFormation,
    tactical_philosophy: philosophy,
    tactical_adjustments: adjustments,
    key_battles: battles,
    set_piece_strategy: spStrat,
    substitution_plan: subs,
    win_probability: winProb,
    risk_assessment: riskAssessment,
  }
}

// --- Tool 4: Talent Scouting AI ---
function analyzeTalent(input: TalentScoutInput): TalentScoutResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.prospect_id + JSON.stringify(input).slice(0, 80)
  ))

  const age = input.age ?? rng.nextInt(16, 23)
  const sport = input.sport ?? 'soccer'
  const position = input.position ?? 'midfielder'
  const technical = input.technical_score ?? rng.nextInt(50, 95)
  const physical = input.physical_score ?? rng.nextInt(45, 92)
  const mental = input.mental_score ?? rng.nextInt(40, 90)
  const tactical = input.tactical_score ?? rng.nextInt(45, 88)
  const potential = input.potential_ceiling ?? rng.nextInt(65, 98)
  const consistency = input.consistency ?? rng.nextInt(40, 85)
  const bigGame = input.big_game_performance ?? rng.nextInt(40, 90)
  const coachability = input.coachability ?? rng.nextInt(50, 95)
  const comparable = input.comparable_player ?? 'TBD'

  // Scout score: weighted composite
  const scoutScore = Math.round(
    technical * 0.25 + physical * 0.20 + mental * 0.20 + tactical * 0.15 + consistency * 0.10 + bigGame * 0.10
  )

  // Potential score: age-adjusted
  const ageMultiplier = age <= 18 ? 1.15 : age <= 20 ? 1.08 : age <= 22 ? 1.03 : 1.0
  const potentialScore = Math.round(Math.min(99, potential * ageMultiplier + rng.nextInt(-3, 3)))

  // Overall grade
  const overallGrade: TalentScoutResult['overall_grade'] =
    scoutScore >= 90 ? 'A+' : scoutScore >= 80 ? 'A' : scoutScore >= 70 ? 'B+' : scoutScore >= 60 ? 'B' : scoutScore >= 50 ? 'C+' : 'C'

  // Transfer value estimate (simplified)
  const baseValue = scoutScore * 50000
  const agePremium = age <= 19 ? 2.5 : age <= 21 ? 1.8 : age <= 23 ? 1.3 : 1.0
  const potentialPremium = potentialScore >= 85 ? 2.0 : potentialScore >= 75 ? 1.5 : 1.0
  const estimatedValue = Math.round(baseValue * agePremium * potentialPremium)
  const valueStr = estimatedValue >= 1000000
    ? 'EUR ' + (estimatedValue / 1000000).toFixed(1) + 'M'
    : 'EUR ' + Math.round(estimatedValue / 1000) + 'K'

  // Skill breakdown
  const skills: SkillBreakdown[] = [
    { skill: 'Technical Ability', current_level: technical, projected_level: Math.min(99, technical + rng.nextInt(5, 15)), scout_confidence: rng.nextInt(70, 95), development_priority: technical < 70 ? 'critical' : technical < 80 ? 'important' : 'beneficial' },
    { skill: 'Physical Attributes', current_level: physical, projected_level: Math.min(99, physical + rng.nextInt(3, 12)), scout_confidence: rng.nextInt(75, 95), development_priority: physical < 65 ? 'critical' : physical < 78 ? 'important' : 'beneficial' },
    { skill: 'Mental/Decision Making', current_level: mental, projected_level: Math.min(99, mental + rng.nextInt(4, 14)), scout_confidence: rng.nextInt(60, 85), development_priority: mental < 65 ? 'critical' : mental < 75 ? 'important' : 'beneficial' },
    { skill: 'Tactical Understanding', current_level: tactical, projected_level: Math.min(99, tactical + rng.nextInt(5, 15)), scout_confidence: rng.nextInt(65, 90), development_priority: tactical < 65 ? 'critical' : tactical < 78 ? 'important' : 'beneficial' },
    { skill: 'Big Game Temperament', current_level: bigGame, projected_level: Math.min(99, bigGame + rng.nextInt(3, 10)), scout_confidence: rng.nextInt(55, 80), development_priority: bigGame < 60 ? 'important' : 'beneficial' },
    { skill: 'Coachability', current_level: coachability, projected_level: Math.min(99, coachability + rng.nextInt(2, 8)), scout_confidence: rng.nextInt(60, 85), development_priority: coachability < 65 ? 'critical' : coachability < 78 ? 'important' : 'beneficial' },
  ]

  // Strengths
  const strengths: string[] = []
  if (technical >= 80) strengths.push('Elite technical foundation: first touch, passing range, and close control stand out')
  if (physical >= 78) strengths.push('Physical profile ready for senior football: pace, strength, and endurance')
  if (mental >= 75) strengths.push('High football IQ: reads the game well, makes smart decisions under pressure')
  if (bigGame >= 75) strengths.push('Big-game mentality: performances elevate in high-pressure situations')
  if (coachability >= 80) strengths.push('Exceptional coachability: rapid learner, takes feedback and implements quickly')
  if (strengths.length === 0) strengths.push('Solid all-round foundation with room for targeted development')

  // Development areas
  const devAreas: string[] = []
  if (technical < 70) devAreas.push('Technical refinement: needs dedicated 1v1 coaching on weaker foot and receiving under pressure')
  if (physical < 65) devAreas.push('Physical development: strength and conditioning programme to bridge the gap to senior level')
  if (mental < 65) devAreas.push('Cognitive development: video analysis sessions to improve scanning and decision speed')
  if (tactical < 65) devAreas.push('Tactical education: positional play drills and game-model familiarisation')
  if (consistency < 55) devAreas.push('Consistency: focus on repeatable performance standards across 90 minutes')
  if (devAreas.length === 0) devAreas.push('Marginal gains available across all areas; no critical development gaps')

  // Comparable profiles
  const comparables: string[] = []
  if (comparable && comparable !== 'TBD') comparables.push(comparable)
  if (position === 'midfielder' && technical >= 80) comparables.push('Technical midfielder profile similar to academy graduates at top clubs')
  if (position === 'forward' && physical >= 75) comparables.push('Power-forward archetype with high pressing capacity')
  if (position === 'defender' && tactical >= 75) comparables.push('Ball-playing defender with strong reading of the game')
  if (comparables.length === 0) comparables.push('Unique profile; no direct comparison in current database')

  // Recommendation
  const recommendation = scoutScore >= 80 && potentialScore >= 85
    ? 'HIGH PRIORITY SIGNING: Elite prospect with top-level potential. Recommend immediate scouting by first-team staff and preliminary contract discussions.'
    : scoutScore >= 65 && potentialScore >= 75
    ? 'RECOMMENDED: Strong prospect with clear development pathway. Assign dedicated development coach and monitor over next 6 months.'
    : scoutScore >= 50
    ? 'WATCH LIST: Interesting raw attributes but significant development required. Continue monitoring at youth international level.'
    : 'PASS: Current profile does not meet minimum thresholds for investment at this time.'

  // Risk factors
  const risks: string[] = []
  if (age >= 22 && potentialScore < 75) risks.push('Age vs potential: limited upside remaining at this age')
  if (consistency < 50) risks.push('Inconsistent performances raise questions about readiness for step up')
  if (coachability < 60) risks.push('Below-average coachability may limit development trajectory')
  if (physical < 55) risks.push('Physical profile may not cope with demands of senior professional football')
  if (risks.length === 0) risks.push('No significant risk factors identified at this stage')

  return {
    prospect_id: input.prospect_id,
    prospect_name: input.prospect_name,
    overall_grade: overallGrade,
    scout_score: scoutScore,
    potential_score: potentialScore,
    transfer_value_estimate: valueStr,
    skills,
    strengths,
    development_areas: devAreas,
    comparable_profiles: comparables,
    recommendation,
    risk_factors: risks,
  }
}

// --- Tool 5: Fan Engagement Analyzer ---
function analyzeFanEngagement(input: FanEngagementInput): FanEngagementResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.team_id + JSON.stringify(input).slice(0, 80)
  ))

  const sport = input.sport ?? 'soccer'
  const league = input.league ?? 'Top Division'
  const capacity = input.stadium_capacity ?? rng.nextInt(25000, 75000)
  const attendance = input.avg_attendance ?? Math.round(capacity * rng.nextFloat(0.55, 0.98))
  const followers = input.social_media_followers ?? rng.nextInt(500000, 150000000)
  const engagementRate = input.social_media_engagement_rate ?? Math.round(rng.nextFloat(1.5, 6.5) * 100) / 100
  const merchIndex = input.merchandise_revenue_index ?? rng.nextInt(30, 95)
  const satisfaction = input.fan_satisfaction_score ?? rng.nextInt(50, 92)
  const seasonTickets = input.season_ticket_holders ?? rng.nextInt(5000, 50000)
  const digitalSubs = input.digital_subscribers ?? rng.nextInt(10000, 500000)
  const appUsers = input.matchday_app_active_users ?? rng.nextInt(20000, 300000)
  const intlFanPct = input.international_fan_pct ?? rng.nextInt(10, 60)
  const youthPct = input.fan_demographic_youth_pct ?? rng.nextInt(15, 45)

  // Attendance rate
  const attendanceRate = Math.round((attendance / capacity) * 100)

  // Channel scores
  const channels: EngagementChannel[] = [
    {
      channel: 'Stadium Attendance',
      score: attendanceRate,
      trend: attendanceRate >= 85 ? 'growing' : attendanceRate >= 65 ? 'stable' : 'declining',
      opportunity: attendanceRate < 80 ? 'Targeted pricing for families and young adults to fill remaining capacity' : 'Maintain atmosphere quality to sustain demand',
      benchmark_vs_league: attendanceRate >= 85 ? 'above' : attendanceRate >= 65 ? 'average' : 'below',
    },
    {
      channel: 'Social Media',
      score: Math.min(100, Math.round(engagementRate * 15)),
      trend: engagementRate >= 3.5 ? 'growing' : engagementRate >= 2 ? 'stable' : 'declining',
      opportunity: engagementRate < 3 ? 'Invest in behind-the-scenes content and player access to boost interaction rates' : 'Leverage high engagement for sponsor activations',
      benchmark_vs_league: engagementRate >= 3.5 ? 'above' : engagementRate >= 2 ? 'average' : 'below',
    },
    {
      channel: 'Merchandise',
      score: merchIndex,
      trend: merchIndex >= 70 ? 'growing' : merchIndex >= 45 ? 'stable' : 'declining',
      opportunity: merchIndex < 60 ? 'Refresh kit design frequency and expand lifestyle/collaboration ranges' : 'Capitalise on strong brand with limited-edition drops',
      benchmark_vs_league: merchIndex >= 70 ? 'above' : merchIndex >= 45 ? 'average' : 'below',
    },
    {
      channel: 'Digital Platform',
      score: Math.min(100, Math.round((digitalSubs / 200000) * 50 + (appUsers / 150000) * 50)),
      trend: digitalSubs >= 100000 ? 'growing' : digitalSubs >= 40000 ? 'stable' : 'declining',
      opportunity: digitalSubs < 80000 ? 'Launch OTT streaming service with exclusive content and match archives' : 'Monetise growing digital base with premium tier offerings',
      benchmark_vs_league: digitalSubs >= 100000 ? 'above' : digitalSubs >= 40000 ? 'average' : 'below',
    },
    {
      channel: 'Fan Satisfaction',
      score: satisfaction,
      trend: satisfaction >= 75 ? 'growing' : satisfaction >= 55 ? 'stable' : 'declining',
      opportunity: satisfaction < 70 ? 'Address pain points: ticket pricing, matchday experience, communication responsiveness' : 'Leverage high satisfaction for referral and advocacy programmes',
      benchmark_vs_league: satisfaction >= 75 ? 'above' : satisfaction >= 55 ? 'average' : 'below',
    },
  ]

  // Overall engagement score
  const overallScore = Math.round(
    channels.reduce((sum, c) => sum + c.score, 0) / channels.length
  )

  const tier: FanEngagementResult['engagement_tier'] =
    overallScore >= 80 ? 'world_class' : overallScore >= 65 ? 'strong' : overallScore >= 45 ? 'moderate' : 'developing'

  // Fan loyalty index
  const loyaltyIndex = Math.round(
    (attendanceRate * 0.3 + satisfaction * 0.25 + Math.min(100, seasonTickets / 500) * 0.25 + merchIndex * 0.2)
  )

  // Growth opportunities
  const initiatives: EngagementInitiative[] = []
  if (intlFanPct < 30) initiatives.push({ initiative: 'International Fan Development', target_segment: 'Overseas supporters in key markets', expected_uplift: '+15-25% international fanbase within 18 months', investment_level: 'medium', timeframe: '12-18 months' })
  if (youthPct < 25) initiatives.push({ initiative: 'Youth Engagement Programme', target_segment: 'Fans aged 16-24', expected_uplift: '+20% youth demographic share', investment_level: 'low', timeframe: '6-12 months' })
  if (engagementRate < 3) initiatives.push({ initiative: 'Content Studio Investment', target_segment: 'Digital-native fans', expected_uplift: '+40% social engagement rate', investment_level: 'medium', timeframe: '6-9 months' })
  if (digitalSubs < 80000) initiatives.push({ initiative: 'Digital Membership Platform', target_segment: 'Lapsed and casual fans', expected_uplift: '+50,000 digital subscribers', investment_level: 'high', timeframe: '12 months' })
  if (attendanceRate < 80) initiatives.push({ initiative: 'Matchday Experience Upgrade', target_segment: 'Local community and families', expected_uplift: '+12% average attendance', investment_level: 'medium', timeframe: '6-12 months' })
  if (initiatives.length === 0) initiatives.push({ initiative: 'Maintain Excellence Programme', target_segment: 'Existing loyal fanbase', expected_uplift: 'Sustained world-class engagement levels', investment_level: 'low', timeframe: 'Ongoing' })

  // Risk areas
  const risks: string[] = []
  if (satisfaction < 60) risks.push('Fan satisfaction below 60% — risk of active disengagement and negative word-of-mouth')
  if (attendanceRate < 60) risks.push('Stadium utilisation below 60% — significant matchday revenue at risk')
  if (youthPct < 20) risks.push('Youth demographic underrepresented — long-term fanbase sustainability concern')
  if (engagementRate < 2) risks.push('Social media engagement declining — digital relevance at risk')
  if (risks.length === 0) risks.push('No critical risk areas identified; maintain current engagement strategy')

  // Benchmark summary
  const aboveCount = channels.filter(c => c.benchmark_vs_league === 'above').length
  const belowCount = channels.filter(c => c.benchmark_vs_league === 'below').length
  const benchmarkSummary = `${input.team_name} ranks above league average in ${aboveCount}/5 engagement channels, below in ${belowCount}/5. Overall engagement tier: ${tier}.`

  // Action plan
  const actionPlan: string[] = [
    'Conduct quarterly fan sentiment survey to track satisfaction trajectory',
    'Establish cross-functional fan experience working group',
    'Set 12-month KPI targets for each engagement channel',
    'Review pricing strategy to balance accessibility with revenue optimisation',
    'Invest in CRM platform to personalise fan communications at scale',
  ]

  return {
    team_id: input.team_id,
    team_name: input.team_name,
    overall_engagement_score: overallScore,
    engagement_tier: tier,
    channels,
    fan_loyalty_index: loyaltyIndex,
    growth_opportunities: initiatives,
    risk_areas: risks,
    benchmark_summary: benchmarkSummary,
    action_plan: actionPlan,
  }
}

// --- Tool 6: Sports Betting Analytics ---
function analyzeBetting(input: BettingAnalyticsInput): BettingAnalyticsResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.event_id + JSON.stringify(input).slice(0, 80)
  ))

  const eventName = input.event_name ?? 'Match Event'
  const sport = input.sport ?? 'soccer'
  const homeOdds = input.home_odds ?? Math.round(rng.nextFloat(1.4, 4.0) * 100) / 100
  const drawOdds = input.draw_odds ?? Math.round(rng.nextFloat(2.8, 4.5) * 100) / 100
  const awayOdds = input.away_odds ?? Math.round(rng.nextFloat(1.5, 5.0) * 100) / 100

  // Implied probabilities from odds
  const homeImplied = Math.round((1 / homeOdds) * 10000) / 100
  const drawImplied = Math.round((1 / drawOdds) * 10000) / 100
  const awayImplied = Math.round((1 / awayOdds) * 10000) / 100

  // Model probabilities (with adjustments)
  const homeForm = input.home_recent_form ?? ['W', 'W', 'D', 'L', 'W']
  const awayForm = input.away_recent_form ?? ['L', 'D', 'W', 'L', 'L']
  const h2hHome = input.head_to_head_home_wins ?? rng.nextInt(2, 8)
  const h2hDraw = input.head_to_head_draws ?? rng.nextInt(1, 5)
  const h2hAway = input.head_to_head_away_wins ?? rng.nextInt(1, 6)
  const homeMotivation = input.motivational_factor_home ?? rng.nextInt(60, 95)
  const awayMotivation = input.motivational_factor_away ?? rng.nextInt(40, 85)
  const xgHome = input.expected_goals_home ?? Math.round(rng.nextFloat(0.8, 2.5) * 100) / 100
  const xgAway = input.expected_goals_away ?? Math.round(rng.nextFloat(0.5, 2.0) * 100) / 100

  // Form score
  const formScore = (results: string[]): number => {
    let s = 0
    for (const r of results) { if (r === 'W') s += 3; else if (r === 'D') s += 1 }
    return s
  }
  const homeFormScore = formScore(homeForm)
  const awayFormScore = formScore(awayForm)
  const h2hTotal = h2hHome + h2hDraw + h2hAway

  // Model probability calculation
  let homeModel = homeImplied
    + (homeFormScore - awayFormScore) * 2
    + (h2hHome / h2hTotal) * 10
    + (homeMotivation - awayMotivation) * 0.3
    + (xgHome - xgAway) * 5
  let awayModel = awayImplied
    + (awayFormScore - homeFormScore) * 2
    + (h2hAway / h2hTotal) * 10
    + (awayMotivation - homeMotivation) * 0.3
    + (xgAway - xgHome) * 5
  let drawModel = drawImplied + rng.nextFloat(-2, 2)

  // Normalize to 100%
  const total = homeModel + drawModel + awayModel
  homeModel = Math.round((homeModel / total) * 10000) / 100
  drawModel = Math.round((drawModel / total) * 10000) / 100
  awayModel = Math.round((awayModel / total) * 10000) / 100

  // Build markets
  const markets: BettingMarket[] = [
    {
      market: 'Match Result (1X2)',
      selection: 'Home Win',
      odds: homeOdds,
      implied_probability: homeImplied,
      model_probability: homeModel,
      edge: Math.round((homeModel - homeImplied) * 100) / 100,
      confidence: Math.min(90, Math.round(50 + Math.abs(homeModel - homeImplied) * 2)),
      recommendation: homeModel - homeImplied >= 8 ? 'strong_bet' : homeModel - homeImplied >= 4 ? 'value_bet' : homeModel - homeImplied >= 1 ? 'lean' : 'pass',
    },
    {
      market: 'Match Result (1X2)',
      selection: 'Draw',
      odds: drawOdds,
      implied_probability: drawImplied,
      model_probability: drawModel,
      edge: Math.round((drawModel - drawImplied) * 100) / 100,
      confidence: Math.min(85, Math.round(45 + Math.abs(drawModel - drawImplied) * 2)),
      recommendation: drawModel - drawImplied >= 8 ? 'strong_bet' : drawModel - drawImplied >= 4 ? 'value_bet' : drawModel - drawImplied >= 1 ? 'lean' : 'pass',
    },
    {
      market: 'Match Result (1X2)',
      selection: 'Away Win',
      odds: awayOdds,
      implied_probability: awayImplied,
      model_probability: awayModel,
      edge: Math.round((awayModel - awayImplied) * 100) / 100,
      confidence: Math.min(90, Math.round(50 + Math.abs(awayModel - awayImplied) * 2)),
      recommendation: awayModel - awayImplied >= 8 ? 'strong_bet' : awayModel - awayImplied >= 4 ? 'value_bet' : awayModel - awayImplied >= 1 ? 'lean' : 'pass',
    },
    {
      market: 'Over/Under 2.5 Goals',
      selection: 'Over 2.5',
      odds: Math.round(rng.nextFloat(1.7, 2.3) * 100) / 100,
      implied_probability: Math.round((1 / rng.nextFloat(1.7, 2.3)) * 10000) / 100,
      model_probability: Math.round((xgHome + xgAway) / 3.5 * 100 * 100) / 100,
      edge: Math.round(((xgHome + xgAway) / 3.5 * 100 - (1 / 2.0) * 100) * 100) / 100,
      confidence: Math.min(80, Math.round(50 + (xgHome + xgAway) * 5)),
      recommendation: (xgHome + xgAway) >= 3.0 ? 'value_bet' : (xgHome + xgAway) >= 2.5 ? 'lean' : 'pass',
    },
    {
      market: 'Both Teams to Score',
      selection: 'Yes',
      odds: Math.round(rng.nextFloat(1.6, 2.1) * 100) / 100,
      implied_probability: Math.round((1 / rng.nextFloat(1.6, 2.1)) * 10000) / 100,
      model_probability: Math.round(Math.min(85, (xgHome * xgAway) / 2.5 * 100) * 100) / 100,
      edge: 0,
      confidence: Math.min(75, Math.round(45 + (xgHome + xgAway) * 4)),
      recommendation: xgHome >= 1.0 && xgAway >= 0.8 ? 'value_bet' : 'lean',
    },
  ]

  // Fix BTTS edge
  markets[4].edge = Math.round((markets[4].model_probability - markets[4].implied_probability) * 100) / 100

  // Best value bet
  const bestMarket = markets.filter(m => m.recommendation === 'strong_bet' || m.recommendation === 'value_bet')
    .sort((a, b) => b.edge - a.edge)[0]
  const bestValueBet = bestMarket
    ? `${bestMarket.market} - ${bestMarket.selection} @ ${bestMarket.odds} (edge: +${bestMarket.edge}%)`
    : 'No value bets identified in current markets — recommend passing on this event'

  // Kelly Criterion stake (simplified: f* = (bp - q) / b)
  const bestEdge = bestMarket ? bestMarket.edge / 100 : 0
  const kellyStake = bestEdge > 0
    ? Math.round(((bestMarket!.odds - 1) * (bestMarket!.model_probability / 100) - (1 - bestMarket!.model_probability / 100)) / (bestMarket!.odds - 1) * 10000) / 100
    : 0
  const kellyAdjusted = Math.min(5, Math.max(0, kellyStake)) // Cap at 5% of bankroll

  // Model accuracy estimate
  const modelAccuracy = Math.round(rng.nextFloat(52, 68) * 100) / 100

  // Key factors
  const keyFactors: string[] = [
    `Home form: ${homeForm.join(', ')} (score: ${homeFormScore}/15)`,
    `Away form: ${awayForm.join(', ')} (score: ${awayFormScore}/15)`,
    `xG: Home ${xgHome} - ${xgAway} Away`,
    `H2H record: ${h2hHome}-${h2hDraw}-${h2hAway} (Home-Draw-Away)`,
    `Motivation index: Home ${homeMotivation}/100 vs Away ${awayMotivation}/100`,
  ]

  // Risk warnings
  const warnings: string[] = [
    'Model accuracy is estimated at ' + modelAccuracy + '% — all bets carry risk of loss',
    'Odds are subject to movement; verify current prices before placing any wager',
    'Past form does not guarantee future results; upsets are inherent in sport',
  ]
  if (Math.abs(homeModel - awayModel) < 5) warnings.push('Match is highly contested — model shows no clear favourite, elevated variance expected')

  // Bankroll advice
  const bankrollAdvice = kellyAdjusted >= 2
    ? `Recommended stake: ${kellyAdjusted}% of bankroll on best value bet. Remaining bankroll: diversify across 2-3 additional value opportunities.`
    : kellyAdjusted > 0
    ? `Conservative stake: ${kellyAdjusted}% of bankroll. Consider waiting for stronger edges (>5%) before committing significant capital.`
    : 'No positive expected value detected. Preserve bankroll for higher-confidence opportunities.'

  return {
    event_id: input.event_id,
    event_name: eventName,
    markets_analyzed: markets,
    best_value_bet: bestValueBet,
    kelly_criterion_stake: kellyAdjusted,
    model_accuracy_estimate: modelAccuracy,
    key_factors: keyFactors,
    risk_warnings: warnings,
    bankroll_advice: bankrollAdvice,
  }
}

// --- Tool 7: Training Load Optimizer ---
function analyzeTrainingLoad(input: TrainingLoadInput): TrainingLoadResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.athlete_id + JSON.stringify(input).slice(0, 80)
  ))

  const sport = input.sport ?? 'soccer'
  const position = input.position ?? 'midfielder'
  const phase = input.training_phase ?? (input.upcoming_competition_days && input.upcoming_competition_days <= 7 ? 'taper' : 'mid_season')
  const currentLoad = input.current_load ?? rng.nextInt(500, 1200)
  const targetLoad = input.target_load ?? Math.round(currentLoad * rng.nextFloat(0.85, 1.15))
  const weeklySessions = input.weekly_sessions ?? rng.nextInt(4, 8)
  const intensityDist = input.intensity_distribution ?? { low: rng.nextInt(20, 40), moderate: rng.nextInt(30, 50), high: rng.nextInt(15, 30) }
  const recoveryDays = input.recovery_days ?? rng.nextInt(1, 3)
  const sleepHrs = input.sleep_hours_avg ?? Math.round(rng.nextFloat(6.0, 9.0) * 10) / 10
  const wellness = input.wellness_score ?? rng.nextInt(55, 95)
  const perfTrend = input.performance_trend ?? 'stable'
  const compDays = input.upcoming_competition_days ?? rng.nextInt(3, 21)
  const injuryStatus = input.injury_status ?? 'healthy'

  // ACWR calculation
  const acuteLoad = currentLoad
  const chronicLoad = Math.round(currentLoad * rng.nextFloat(0.85, 1.05))
  const acwr = Math.round((acuteLoad / chronicLoad) * 100) / 100

  // Load status
  const loadStatus: TrainingLoadResult['load_status'] =
    acwr < 0.8 ? 'undertraining' : acwr <= 1.3 ? 'optimal' : acwr <= 1.5 ? 'overreaching' : 'overtraining'

  // Generate weekly plan
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const sessions: TrainingSession[] = []

  if (phase === 'taper') {
    sessions.push({ day: days[0], session_type: 'Technical/Tactical', duration_minutes: 75, intensity: 'moderate', load: Math.round(targetLoad * 0.15), focus: 'Pattern play and set pieces', recovery_protocol: 'Pool session 15min' })
    sessions.push({ day: days[1], session_type: 'Speed/Agility', duration_minutes: 50, intensity: 'high', load: Math.round(targetLoad * 0.18), focus: 'Explosive movements, reaction drills', recovery_protocol: 'Cold water immersion 10min' })
    sessions.push({ day: days[2], session_type: 'Recovery', duration_minutes: 40, intensity: 'low', load: Math.round(targetLoad * 0.08), focus: 'Mobility, foam rolling, light activation', recovery_protocol: 'Massage + compression boots' })
    sessions.push({ day: days[3], session_type: 'Team Shape', duration_minutes: 60, intensity: 'moderate', load: Math.round(targetLoad * 0.14), focus: '11v11 tactical walkthrough', recovery_protocol: 'Stretching protocol' })
    sessions.push({ day: days[4], session_type: 'Pre-Match Activation', duration_minutes: 30, intensity: 'low', load: Math.round(targetLoad * 0.06), focus: 'Neural activation, short sprints', recovery_protocol: 'Nutrition timing focus' })
    sessions.push({ day: days[5], session_type: 'MATCH DAY', duration_minutes: 90, intensity: 'maximal', load: Math.round(targetLoad * 0.25), focus: 'Full competitive effort', recovery_protocol: 'Post-match: ice bath, protein intake within 30min' })
    sessions.push({ day: days[6], session_type: 'Active Recovery', duration_minutes: 30, intensity: 'low', load: Math.round(targetLoad * 0.05), focus: 'Light jog, mobility, mental reset', recovery_protocol: 'Sleep extension target: 9+ hours' })
  } else {
    sessions.push({ day: days[0], session_type: 'High-Intensity Training', duration_minutes: 80, intensity: 'high', load: Math.round(targetLoad * 0.20), focus: 'Pressing triggers and transition speed', recovery_protocol: 'Cold water immersion 10min' })
    sessions.push({ day: days[1], session_type: 'Strength & Power', duration_minutes: 65, intensity: 'high', load: Math.round(targetLoad * 0.18), focus: 'Compound lifts, plyometrics', recovery_protocol: 'Protein shake + 20min stretch' })
    sessions.push({ day: days[2], session_type: 'Active Recovery', duration_minutes: 40, intensity: 'low', load: Math.round(targetLoad * 0.07), focus: 'Pool session, mobility work', recovery_protocol: 'Foam rolling + compression' })
    sessions.push({ day: days[3], session_type: 'Tactical Periodisation', duration_minutes: 75, intensity: 'moderate', load: Math.round(targetLoad * 0.16), focus: 'Positional play and build-up patterns', recovery_protocol: 'Contrast therapy' })
    sessions.push({ day: days[4], session_type: 'Speed Endurance', duration_minutes: 60, intensity: 'high', load: Math.round(targetLoad * 0.17), focus: 'Repeated sprint ability', recovery_protocol: 'Cold water immersion + nutrition' })
    sessions.push({ day: days[5], session_type: 'Team Training', duration_minutes: 70, intensity: 'moderate', load: Math.round(targetLoad * 0.14), focus: 'Match simulation, set pieces', recovery_protocol: 'Stretching + hydration focus' })
    sessions.push({ day: days[6], session_type: 'Rest', duration_minutes: 0, intensity: 'low', load: 0, focus: 'Complete rest and recovery', recovery_protocol: 'Sleep 8+ hours, light walk optional' })
  }

  const totalWeeklyLoad = sessions.reduce((sum, s) => sum + s.load, 0)

  // Alerts
  const alerts: LoadAlert[] = []
  if (acwr > 1.5) alerts.push({ alert_type: 'ACWR Critical', severity: 'critical', message: `ACWR of ${acwr} exceeds safe threshold (>1.5). Injury risk significantly elevated.`, action_required: 'Reduce training volume by 25% immediately. Introduce extra recovery day.' })
  else if (acwr > 1.3) alerts.push({ alert_type: 'ACWR Warning', severity: 'warning', message: `ACWR of ${acwr} is in the danger zone (1.3-1.5). Monitor closely.`, action_required: 'Consider reducing high-intensity volume by 10-15%.' })
  if (sleepHrs < 6.5) alerts.push({ alert_type: 'Sleep Deficit', severity: 'warning', message: `Average sleep ${sleepHrs}h is below optimal range. Recovery compromised.`, action_required: 'Implement sleep hygiene protocol. Target 8+ hours.' })
  if (wellness < 60) alerts.push({ alert_type: 'Wellness Alert', severity: 'critical', message: `Wellness score ${wellness}/100 indicates poor readiness.`, action_required: 'Reduce training intensity. Consult medical staff.' })
  if (perfTrend === 'fatigued') alerts.push({ alert_type: 'Performance Decline', severity: 'warning', message: 'Performance trend shows signs of accumulated fatigue.', action_required: 'Schedule deload week within next 7 days.' })
  if (injuryStatus !== 'healthy') alerts.push({ alert_type: 'Injury Management', severity: 'warning', message: `Athlete currently in ${injuryStatus} status.`, action_required: 'Follow modified training plan from medical team.' })
  if (alerts.length === 0) alerts.push({ alert_type: 'All Clear', severity: 'info', message: 'All load metrics within acceptable ranges.', action_required: 'Continue as planned.' })

  // Recovery recommendations
  const recoveryRecs: string[] = []
  if (sleepHrs < 7.5) recoveryRecs.push('Prioritise sleep extension: consistent 22:30 bedtime, no screens 60min before')
  if (intensityDist.high > 25) recoveryRecs.push('High-intensity volume exceeds 25%: add 48h gap between max-effort sessions')
  if (recoveryDays < 2) recoveryRecs.push('Minimum 1 full rest day per week recommended; currently at ' + recoveryDays)
  recoveryRecs.push('Daily monitoring: HRV upon waking, subjective wellness questionnaire')
  recoveryRecs.push('Nutrition: 1.6-2.0g protein/kg bodyweight, carbohydrate periodisation around sessions')

  // Performance prediction
  const perfPrediction = loadStatus === 'optimal'
    ? 'Athlete is in the optimal training window. Peak performance expected within 7-10 days if load maintained.'
    : loadStatus === 'overreaching'
    ? 'Functional overreaching detected. If followed by adequate recovery, supercompensation expected in 5-7 days.'
    : loadStatus === 'overtraining'
    ? 'Overtraining risk: performance likely to decline 5-10% without immediate load reduction.'
    : 'Undertraining: athlete not sufficiently stimulated for adaptation. Performance may plateau or decline.'

  // Periodization notes
  const periodNotes: string[] = [
    'Current phase: ' + phase + '. Target load: ' + targetLoad + ' AU per week.',
    'Intensity distribution: ' + intensityDist.low + '% low / ' + intensityDist.moderate + '% moderate / ' + intensityDist.high + '% high.',
    compDays <= 7 ? 'Taper protocol active: ' + compDays + ' days to competition. Reduce volume 40% while maintaining intensity.' : 'Next competition in ' + compDays + ' days. Build load progressively with deload every 4th week.',
    'Monitor ACWR daily. Target range: 0.8-1.3 for optimal adaptation.',
  ]

  return {
    athlete_id: input.athlete_id,
    athlete_name: input.athlete_name,
    current_phase: phase,
    weekly_plan: sessions,
    total_weekly_load: totalWeeklyLoad,
    acute_chronic_workload_ratio: acwr,
    load_status: loadStatus,
    alerts: alerts,
    recovery_recommendations: recoveryRecs,
    performance_prediction: perfPrediction,
    periodization_notes: periodNotes,
  }
}

// --- Tool 8: Match Simulation Engine ---
function simulateMatch(input: MatchSimulationInput): MatchSimulationResult {
  const rng = new SeededRandom(SeededRandom.hashStr(
    input.home_team_id + input.away_team_id + JSON.stringify(input).slice(0, 60)
  ))

  const homeName = input.home_team_name ?? 'Home'
  const awayName = input.away_team_name ?? 'Away'
  const homeRating = input.home_rating ?? rng.nextInt(70, 92)
  const awayRating = input.away_rating ?? rng.nextInt(65, 90)
  const homeAdv = input.home_advantage ?? rng.nextInt(3, 8)
  const homeAtt = input.home_attack_strength ?? rng.nextInt(60, 90)
  const awayAtt = input.away_attack_strength ?? rng.nextInt(55, 88)
  const homeDef = input.home_defense_strength ?? rng.nextInt(60, 88)
  const awayDef = input.away_defense_strength ?? rng.nextInt(58, 86)
  const homeForm = input.home_form_adjustment ?? rng.nextInt(-5, 8)
  const awayForm = input.away_form_adjustment ?? rng.nextInt(-5, 8)
  const runs = input.simulation_runs ?? 10000
  const weather = input.weather_impact ?? 'none'

  // Expected goals model (Poisson-based)
  const homeXg = Math.round(((homeAtt / 100) * (1 - awayDef / 120) * (homeRating / 80) + homeAdv / 100 + homeForm / 200) * 100) / 100
  const awayXg = Math.round(((awayAtt / 100) * (1 - homeDef / 120) * (awayRating / 80) + awayForm / 200) * 100) / 100

  // Weather adjustment
  const weatherMod = weather === 'severe' ? 0.75 : weather === 'moderate' ? 0.88 : weather === 'mild' ? 0.95 : 1.0
  const adjHomeXg = Math.max(0.2, Math.round(homeXg * weatherMod * 100) / 100)
  const adjAwayXg = Math.max(0.15, Math.round(awayXg * weatherMod * 100) / 100)

  // Poisson probability
  const poisson = (lambda: number, k: number): number => {
    let result = Math.exp(-lambda)
    for (let i = 1; i <= k; i++) {
      result *= lambda / i
    }
    return result
  }

  // Simulate scorelines
  const scoreCounts: Record<string, number> = {}
  let homeWins = 0
  let draws = 0
  let awayWins = 0
  let btts = 0
  let over25 = 0

  for (let i = 0; i < runs; i++) {
    // Use Poisson sampling via inverse transform
    const homeGoals = samplePoisson(adjHomeXg, rng)
    const awayGoals = samplePoisson(adjAwayXg, rng)
    const key = homeGoals + '-' + awayGoals
    scoreCounts[key] = (scoreCounts[key] || 0) + 1
    if (homeGoals > awayGoals) homeWins++
    else if (homeGoals === awayGoals) draws++
    else awayWins++
    if (homeGoals > 0 && awayGoals > 0) btts++
    if (homeGoals + awayGoals > 2) over25++
  }

  const homeWinProb = Math.round((homeWins / runs) * 10000) / 100
  const drawProb = Math.round((draws / runs) * 10000) / 100
  const awayWinProb = Math.round((awayWins / runs) * 10000) / 100
  const bttsProb = Math.round((btts / runs) * 10000) / 100
  const over25Prob = Math.round((over25 / runs) * 10000) / 100

  // Most likely result
  const sortedScores = Object.entries(scoreCounts).sort((a, b) => b[1] - a[1])
  const mostLikely = sortedScores[0]
  const mostLikelyResult = mostLikely
    ? `${mostLikely[0]} (probability: ${Math.round((mostLikely[1] as number / runs) * 10000) / 100}%)`
    : 'N/A'

  // Correct score predictions (top 5)
  const correctScores: SimulationOutcome[] = sortedScores.slice(0, 5).map(([score, count]) => {
    const prob = Math.round(((count as number) / runs) * 10000) / 100
    const parts = score.split('-')
    const hg = parseInt(parts[0])
    const ag = parseInt(parts[1])
    return {
      outcome: score,
      probability: prob,
      avg_score: score,
      sample_scores: [score, score, score],
    }
  })

  // Confidence level
  const topProb = correctScores.length > 0 ? correctScores[0].probability : 0
  const confidence = Math.min(85, Math.round(topProb * 3 + (homeWinProb > 50 ? homeWinProb - 50 : awayWinProb - 50)))

  // Key match factors
  const keyFactors: string[] = [
    `Home advantage adds ~${homeAdv}% to home team win probability`,
    `Home attack (${homeAtt}) vs Away defence (${awayDef}): xG ${adjHomeXg}`,
    `Away attack (${awayAtt}) vs Home defence (${homeDef}): xG ${adjAwayXg}`,
    `Form adjustment: Home ${homeForm > 0 ? '+' : ''}${homeForm}, Away ${awayForm > 0 ? '+' : ''}${awayForm}`,
    weather !== 'none' ? `Weather impact: ${weather} (xG scaled to ${Math.round(weatherMod * 100)}%)` : 'Weather: no significant impact expected',
  ]

  const summary = `After ${runs.toLocaleString()} simulations: ${homeName} win ${homeWinProb}%, Draw ${drawProb}%, ${awayName} win ${awayWinProb}%. Expected score: ${homeName} ${adjHomeXg} - ${adjAwayXg} ${awayName}. Most likely scoreline: ${mostLikelyResult}.`

  return {
    home_team_name: homeName,
    away_team_name: awayName,
    most_likely_result: mostLikelyResult,
    home_win_probability: homeWinProb,
    draw_probability: drawProb,
    away_win_probability: awayWinProb,
    expected_goals_home: adjHomeXg,
    expected_goals_away: adjAwayXg,
    both_teams_to_score_prob: bttsProb,
    over_2_5_probability: over25Prob,
    correct_score_predictions: correctScores,
    confidence_level: confidence,
    key_match_factors: keyFactors,
    simulation_summary: summary,
  }
}

// Poisson sampling helper
function samplePoisson(lambda: number, rng: SeededRandom): number {
  if (lambda <= 0) return 0
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng.next()
  } while (p > L)
  return k - 1
}

// ==================== SECTION 4: Formatting Functions ====================

function formatPlayerPerformanceReport(r: PlayerPerformanceResult): string {
  const lines: string[] = []
  lines.push('## Player Performance Analysis Report')
  lines.push('')
  lines.push('Player: ' + r.player_name + ' (' + r.player_id + ') | Sport: ' + r.sport + ' | Position: ' + r.position)
  lines.push('Overall Rating: **' + r.overall_rating + '/10** | Tier: **' + r.performance_tier.toUpperCase() + '** | Trend: ' + r.trend)
  lines.push('')
  lines.push('### Performance Metrics')
  lines.push('| Category | Metric | Value | Percentile | Grade |')
  lines.push('|----------|--------|-------|------------|-------|')
  for (const m of r.metrics) {
    lines.push('| ' + m.category + ' | ' + m.metric_name + ' | ' + m.value + ' | ' + m.percentile + 'th | ' + m.grade + ' |')
  }
  lines.push('')
  lines.push('### Strengths')
  for (const s of r.strengths) lines.push('- ' + s)
  lines.push('')
  lines.push('### Areas for Improvement')
  for (const w of r.weaknesses) lines.push('- ' + w)
  lines.push('')
  lines.push('### Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('### Peer Comparison')
  lines.push(r.peer_comparison)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Performance metrics are model-generated estimates based on available data. Actual performance may vary based on match context, opposition quality, and other external factors.*')
  return lines.join('\n')
}

function formatInjuryRiskReport(r: InjuryRiskResult): string {
  const lines: string[] = []
  lines.push('## Injury Risk Assessment Report')
  lines.push('')
  lines.push('Player: ' + r.player_name + ' (' + r.player_id + ')')
  lines.push('Risk Score: **' + r.overall_risk_score + '/100** | Category: **' + r.risk_category.toUpperCase() + '**')
  lines.push('')
  lines.push('### Risk Factors')
  lines.push('| Factor | Risk Level | Contribution | Detail |')
  lines.push('|--------|-----------|-------------|--------|')
  for (const f of r.risk_factors) {
    lines.push('| ' + f.factor + ' | ' + f.risk_level + ' | ' + f.contribution_pct + '% | ' + f.detail + ' |')
  }
  lines.push('')
  lines.push('### Body Parts at Risk')
  lines.push(r.body_parts_at_risk.join(', '))
  lines.push('')
  lines.push('### Estimated Return if Injured')
  lines.push('~' + r.estimated_return_days + ' days')
  lines.push('')
  lines.push('### Prevention Recommendations')
  for (const p of r.prevention_recommendations) {
    lines.push('- [' + p.priority.toUpperCase() + '] ' + p.category + ': ' + p.action)
    lines.push('  Expected: ' + p.expected_risk_reduction)
  }
  lines.push('')
  lines.push('### Monitoring Alerts')
  for (const a of r.monitoring_alerts) lines.push('- ' + a)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Injury risk scores are predictive estimates, not medical diagnoses. Always consult qualified sports medicine professionals for clinical decisions.*')
  return lines.join('\n')
}

function formatGameStrategyReport(r: GameStrategyResult): string {
  const lines: string[] = []
  lines.push('## Game Strategy & Tactical Analysis')
  lines.push('')
  lines.push('Matchup: ' + r.team_name + ' vs ' + r.opponent_name)
  lines.push('Recommended Formation: **' + r.recommended_formation + '**')
  lines.push('Tactical Philosophy: ' + r.tactical_philosophy)
  lines.push('')
  lines.push('### Tactical Adjustments')
  for (const a of r.tactical_adjustments) {
    lines.push('- **' + a.area + '** (' + a.difficulty + ')')
    lines.push('  Current: ' + a.current_approach)
    lines.push('  Recommended: ' + a.recommended_approach)
    lines.push('  Expected Impact: ' + a.expected_impact)
  }
  lines.push('')
  lines.push('### Key Battles')
  for (const b of r.key_battles) lines.push('- ' + b)
  lines.push('')
  lines.push('### Set Piece Strategy')
  lines.push(r.set_piece_strategy)
  lines.push('')
  lines.push('### Substitution Plan')
  for (const s of r.substitution_plan) lines.push('- ' + s)
  lines.push('')
  lines.push('### Win Probability')
  lines.push(r.win_probability + '%')
  lines.push('')
  lines.push('### Risk Assessment')
  lines.push(r.risk_assessment)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Strategic recommendations are based on statistical models and available data. Actual match outcomes depend on in-game events, individual performances, and other unpredictable factors.*')
  return lines.join('\n')
}

function formatTalentScoutReport(r: TalentScoutResult): string {
  const lines: string[] = []
  lines.push('## Talent Scouting Report')
  lines.push('')
  lines.push('Prospect: ' + r.prospect_name + ' (' + r.prospect_id + ')')
  lines.push('Overall Grade: **' + r.overall_grade + '** | Scout Score: ' + r.scout_score + '/100 | Potential: ' + r.potential_score + '/99')
  lines.push('Transfer Value Estimate: **' + r.transfer_value_estimate + '**')
  lines.push('')
  lines.push('### Skill Breakdown')
  lines.push('| Skill | Current | Projected | Confidence | Priority |')
  lines.push('|-------|---------|-----------|------------|----------|')
  for (const s of r.skills) {
    lines.push('| ' + s.skill + ' | ' + s.current_level + ' | ' + s.projected_level + ' | ' + s.scout_confidence + '% | ' + s.development_priority + ' |')
  }
  lines.push('')
  lines.push('### Strengths')
  for (const s of r.strengths) lines.push('- ' + s)
  lines.push('')
  lines.push('### Development Areas')
  for (const d of r.development_areas) lines.push('- ' + d)
  lines.push('')
  lines.push('### Comparable Profiles')
  for (const c of r.comparable_profiles) lines.push('- ' + c)
  lines.push('')
  lines.push('### Recommendation')
  lines.push(r.recommendation)
  lines.push('')
  lines.push('### Risk Factors')
  for (const rf of r.risk_factors) lines.push('- ' + rf)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Scouting assessments are observational estimates based on limited data points. Player development trajectories are inherently uncertain and influenced by numerous external factors.*')
  return lines.join('\n')
}

function formatFanEngagementReport(r: FanEngagementResult): string {
  const lines: string[] = []
  lines.push('## Fan Engagement Analysis Report')
  lines.push('')
  lines.push('Team: ' + r.team_name + ' (' + r.team_id + ')')
  lines.push('Overall Score: **' + r.overall_engagement_score + '/100** | Tier: **' + r.engagement_tier + '** | Loyalty Index: ' + r.fan_loyalty_index + '/100')
  lines.push('')
  lines.push('### Channel Performance')
  lines.push('| Channel | Score | Trend | Benchmark | Opportunity |')
  lines.push('|---------|-------|-------|-----------|-------------|')
  for (const c of r.channels) {
    lines.push('| ' + c.channel + ' | ' + c.score + ' | ' + c.trend + ' | ' + c.benchmark_vs_league + ' | ' + c.opportunity + ' |')
  }
  lines.push('')
  lines.push('### Growth Opportunities')
  for (const g of r.growth_opportunities) {
    lines.push('- **' + g.initiative + '** (Target: ' + g.target_segment + ')')
    lines.push('  Expected Uplift: ' + g.expected_uplift + ' | Investment: ' + g.investment_level + ' | Timeframe: ' + g.timeframe)
  }
  lines.push('')
  lines.push('### Risk Areas')
  for (const ra of r.risk_areas) lines.push('- ' + ra)
  lines.push('')
  lines.push('### Benchmark Summary')
  lines.push(r.benchmark_summary)
  lines.push('')
  lines.push('### Action Plan')
  for (const a of r.action_plan) lines.push('- ' + a)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Engagement metrics are compiled from available data sources and may not capture all fan interactions across all touchpoints.*')
  return lines.join('\n')
}

function formatBettingReport(r: BettingAnalyticsResult): string {
  const lines: string[] = []
  lines.push('## Sports Betting Analytics Report')
  lines.push('')
  lines.push('Event: ' + r.event_name + ' (' + r.event_id + ')')
  lines.push('Model Accuracy Estimate: ' + r.model_accuracy_estimate + '%')
  lines.push('')
  lines.push('### Markets Analyzed')
  lines.push('| Market | Selection | Odds | Implied Prob | Model Prob | Edge | Confidence | |')
  lines.push('|--------|-----------|------|-------------|-----------|------|-----------|')
  for (const m of r.markets_analyzed) {
    lines.push('| ' + m.market + ' | ' + m.selection + ' | ' + m.odds + ' | ' + m.implied_probability + '% | ' + m.model_probability + '% | ' + (m.edge >= 0 ? '+' : '') + m.edge + '% | ' + m.confidence + '% |')
  }
  lines.push('')
  lines.push('### Best Value Bet')
  lines.push(r.best_value_bet)
  lines.push('')
  lines.push('### Kelly Criterion Stake')
  lines.push(r.kelly_criterion_stake + '% of bankroll')
  lines.push('')
  lines.push('### Key Factors')
  for (const k of r.key_factors) lines.push('- ' + k)
  lines.push('')
  lines.push('### Risk Warnings')
  for (const w of r.risk_warnings) lines.push('- ' + w)
  lines.push('')
  lines.push('### Bankroll Advice')
  lines.push(r.bankroll_advice)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Betting analytics are model outputs for informational purposes only. All gambling carries risk — never wager more than you can afford to lose. Past performance does not guarantee future results.*')
  return lines.join('\n')
}

function formatTrainingLoadReport(r: TrainingLoadResult): string {
  const lines: string[] = []
  lines.push('## Training Load Optimization Report')
  lines.push('')
  lines.push('Athlete: ' + r.athlete_name + ' (' + r.athlete_id + ')')
  lines.push('Phase: **' + r.current_phase + '** | Load Status: **' + r.load_status + '** | ACWR: ' + r.acute_chronic_workload_ratio)
  lines.push('Total Weekly Load: ' + r.total_weekly_load + ' AU')
  lines.push('')
  lines.push('### Weekly Plan')
  lines.push('| Day | Session | Duration | Intensity | Load | Focus |')
  lines.push('|-----|---------|----------|-----------|------|-------|')
  for (const s of r.weekly_plan) {
    lines.push('| ' + s.day + ' | ' + s.session_type + ' | ' + s.duration_minutes + 'min | ' + s.intensity + ' | ' + s.load + ' | ' + s.focus + ' |')
  }
  lines.push('')
  lines.push('### Alerts')
  for (const a of r.alerts) {
    lines.push('- [' + a.severity.toUpperCase() + '] ' + a.alert_type + ': ' + a.message)
    lines.push('  Action: ' + a.action_required)
  }
  lines.push('')
  lines.push('### Recovery Recommendations')
  for (const rc of r.recovery_recommendations) lines.push('- ' + rc)
  lines.push('')
  lines.push('### Performance Prediction')
  lines.push(r.performance_prediction)
  lines.push('')
  lines.push('### Periodization Notes')
  for (const p of r.periodization_notes) lines.push('- ' + p)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Training load recommendations are model-based suggestions. Individual responses to training stimuli vary — adjust based on daily monitoring and professional coaching judgement.*')
  return lines.join('\n')
}

function formatMatchSimulationReport(r: MatchSimulationResult): string {
  const lines: string[] = []
  lines.push('## Match Simulation Report')
  lines.push('')
  lines.push(r.home_team_name + ' vs ' + r.away_team_name)
  lines.push('Most Likely Result: **' + r.most_likely_result + '**')
  lines.push('')
  lines.push('### Outcome Probabilities')
  lines.push('- Home Win: **' + r.home_win_probability + '%**')
  lines.push('- Draw: **' + r.draw_probability + '%**')
  lines.push('- Away Win: **' + r.away_win_probability + '%**')
  lines.push('')
  lines.push('### Expected Goals')
  lines.push('- ' + r.home_team_name + ': ' + r.expected_goals_home)
  lines.push('- ' + r.away_team_name + ': ' + r.expected_goals_away)
  lines.push('')
  lines.push('### Additional Markets')
  lines.push('- Both Teams to Score: ' + r.both_teams_to_score_prob + '%')
  lines.push('- Over 2.5 Goals: ' + r.over_2_5_probability + '%')
  lines.push('')
  lines.push('### Correct Score Predictions')
  lines.push('| Score | Probability |')
  lines.push('|-------|------------|')
  for (const cs of r.correct_score_predictions) {
    lines.push('| ' + cs.outcome + ' | ' + cs.probability + '% |')
  }
  lines.push('')
  lines.push('### Key Match Factors')
  for (const k of r.key_match_factors) lines.push('- ' + k)
  lines.push('')
  lines.push('### Confidence Level')
  lines.push(r.confidence_level + '%')
  lines.push('')
  lines.push('### Summary')
  lines.push(r.simulation_summary)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Match simulations are probabilistic projections based on historical data and model assumptions. Un sport results are inherently unpredictable.*')
  return lines.join('\n')
}

// ==================== SECTION 5: Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Player Performance Analyzer
  tools.register(defineTool({
    name: 'player_performance_analyzer',
    description: 'Player Performance Analysis & Rating | Comprehensive multi-metric evaluation: scoring, playmaking, defensive, physical, athletic, mental | Generates percentile grades, trend analysis, and peer comparison.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: player_id, player_name, sport, position, season, games_played, minutes_total, goals, assists, pass_accuracy(0-100), tackle_success_rate(0-100), distance_covered_km, sprint_speed_max, heart_rate_avg, fatigue_index(0-100), consistency_score(0-100)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PlayerPerformanceInput = JSON.parse(args.input_data)
      return formatPlayerPerformanceReport(analyzePlayerPerformance(input))
    }
  }))

  // Tool 2: Injury Risk Predictor
  tools.register(defineTool({
    name: 'injury_risk_predictor',
    description: 'Injury Risk Prediction & Prevention | Assesses injury probability from workload, history, sleep, biomechanics | Risk alerts, prevention protocols, and body-part vulnerability mapping.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: player_id, player_name, age, sport, position, injury_history_count, last_injury_days_ago, training_load_7d, training_load_28d, acute_chronic_ratio, sleep_quality(1-10), muscle_soreness(1-10), biomechanical_asymmetry(0-15), match_density(1-4), recovery_score(0-100)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: InjuryRiskInput = JSON.parse(args.input_data)
      return formatInjuryRiskReport(analyzeInjuryRisk(input))
    }
  }))

  // Tool 3: Game Strategy Optimizer
  tools.register(defineTool({
    name: 'game_strategy_optimizer',
    description: 'Game Strategy & Tactical Optimization | Analyzes matchups, recommends formations and tactical adjustments | Identifies key battles, set-piece strategy, and substitution plans.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: team_id, team_name, opponent_id, opponent_name, sport, formation, home_away(home|away|neutral), recent_form[], possession_avg(0-100), pass_completion_rate(0-100), pressing_intensity(0-100), defensive_line_height(0-100), counter_attack_tendency(0-100), set_piece_threat(0-100), opponent_weaknesses[], opponent_strengths[]'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: GameStrategyInput = JSON.parse(args.input_data)
      return formatGameStrategyReport(analyzeGameStrategy(input))
    }
  }))

  // Tool 4: Talent Scouting AI
  tools.register(defineTool({
    name: 'talent_scouting_ai',
    description: 'Talent Scouting & Prospect Evaluation | AI-powered scouting: skill breakdown, potential scoring, transfer value estimates | Comparable profiles and risk assessment for informed recruitment.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: prospect_name, prospect_id, age, nationality, sport, position, current_club, scout_rating(0-100), technical_score(0-100), physical_score(0-100), mental_score(0-100), tactical_score(0-100), potential_ceiling(0-100), consistency(0-100), big_game_performance(0-100), coachability(0-100), comparable_player'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TalentScoutInput = JSON.parse(args.input_data)
      return formatTalentScoutReport(analyzeTalent(input))
    }
  }))

  // Tool 5: Fan Engagement Analyzer
  tools.register(defineTool({
    name: 'fan_engagement_analyzer',
    description: 'Fan Engagement & Growth Analytics | Analyzes stadium, social, merchandise, digital channels | Growth initiatives, benchmarking against league peers, and action plans.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: team_id, team_name, sport, league, stadium_capacity, avg_attendance, social_media_followers, social_media_engagement_rate, merchandise_revenue_index(0-100), fan_satisfaction_score(0-100), season_ticket_holders, digital_subscribers, matchday_app_active_users, international_fan_pct(0-100), fan_demographic_youth_pct(0-100)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: FanEngagementInput = JSON.parse(args.input_data)
      return formatFanEngagementReport(analyzeFanEngagement(input))
    }
  }))

  // Tool 6: Sports Betting Analytics
  tools.register(defineTool({
    name: 'sports_betting_analytics',
    description: 'Sports Betting Analytics & Value Identification | Model-driven odds analysis, edge detection, Kelly criterion stake sizing | Probabilities, key factors, and risk warnings for informed wagering.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: event_id, event_name, sport, market_type, home_odds, draw_odds, away_odds, home_win_probability, draw_probability, away_win_probability, home_recent_form[], away_recent_form[], head_to_head_home_wins, head_to_head_draws, head_to_head_away_wins, home_injuries[], away_injuries[], motivational_factor_home(0-100), motivational_factor_away(0-100), expected_goals_home, expected_goals_away'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: BettingAnalyticsInput = JSON.parse(args.input_data)
      return formatBettingReport(analyzeBetting(input))
    }
  }))

  // Tool 7: Training Load Optimizer
  tools.register(defineTool({
    name: 'training_load_optimizer',
    description: 'Training Load Optimization & Periodization | Weekly session planning, ACWR monitoring, load status assessment | Recovery protocols, alerts, and performance prediction.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: athlete_id, athlete_name, sport, position, training_phase(pre_season|early_season|mid_season|peak|taper|off_season), current_load, target_load, weekly_sessions, intensity_distribution{low,moderate,high}, recovery_days, sleep_hours_avg, wellness_score(0-100), performance_trend(improving|stable|fatigued), upcoming_competition_days, injury_status(healthy|managing|rehabilitating)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TrainingLoadInput = JSON.parse(args.input_data)
      return formatTrainingLoadReport(analyzeTrainingLoad(input))
    }
  }))

  // Tool 8: Match Simulation Engine
  tools.register(defineTool({
    name: 'match_simulation_engine',
    description: 'Match Simulation & Outcome Prediction | Monte Carlo simulation engine with Poisson-based goal models | Win probabilities, correct score predictions, BTTS, and over/under markets.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: home_team_id, home_team_name, away_team_id, away_team_name, sport, home_rating(0-100), away_rating(0-100), home_advantage(0-10), home_possession_tendency(0-100), away_possession_tendency(0-100), home_attack_strength(0-100), away_attack_strength(0-100), home_defense_strength(0-100), away_defense_strength(0-100), home_form_adjustment(-10 to +10), away_form_adjustment(-10 to +10), simulation_runs, weather_impact(none|mild|moderate|severe)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: MatchSimulationInput = JSON.parse(args.input_data)
      return formatMatchSimulationReport(simulateMatch(input))
    }
  }))

  console.log('[dsh-tool-sportstech] Loaded v' + VERSION + ' - Sports Tech & Analytics, 8 tools active')
  console.log('  Tools: player_performance_analyzer, injury_risk_predictor, game_strategy_optimizer, talent_scouting_ai, fan_engagement_analyzer, sports_betting_analytics, training_load_optimizer, match_simulation_engine')
}
