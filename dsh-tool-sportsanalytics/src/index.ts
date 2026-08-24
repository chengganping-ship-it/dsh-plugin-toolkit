import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'sportsanalytics';
export const inject = ['tools'];

const DISCLAIMER = '本分析由AI模型生成，仅供体育科学参考，不构成医疗、投注或竞技决策建议。';

// mulberry32 deterministic PRNG
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function round(v: number, d = 2): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// ============================================================
// 1. performance_predictor
// ============================================================
export interface PerformanceInput {
  sport_type?: string;
  athlete_name?: string;
  historical_matches?: number;
  opponent_rank?: number;
  upcoming_event?: string;
  training_intensity?: string;
}

export interface PerformanceResult {
  prediction_summary: { predicted_score: number; win_probability_pct: number; confidence_pct: number; grade: string; trend: string; consistency_score: number };
  key_metrics: Array<{ metric: string; current_avg: number; predicted: number; unit: string; significance: string }>;
  matchup_analysis: Array<{ dimension: string; athlete_advantage: string; score_delta: number; insight: string }>;
  scenario_projections: Array<{ scenario: string; probability_pct: number; outcome: string; impact: string }>;
  training_effectiveness: { current_load_status: string; predicted_peak_day: string; optimization_tip: string; recovery_index: number };
  historical_comparison: { vs_last_season_pct: number; vs_career_avg_pct: number; best_match_pct: number; improvement_areas: Array<string> };
  disclaimer: string;
}

function analyzePerformance(data: PerformanceInput): PerformanceResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const sport = data.sport_type || pick(rng, ['basketball', 'football', 'tennis', 'swimming', 'esports']);
  const histMatches = data.historical_matches ?? Math.round(20 + rng() * 80);
  const oppRank = data.opponent_rank ?? Math.round(5 + rng() * 50);
  const intensity = data.training_intensity || pick(rng, ['low', 'medium', 'high']);

  const baseScore = sport === 'basketball' ? 22 : sport === 'football' ? 1.2 : sport === 'tennis' ? 18 : sport === 'swimming' ? 52 : 7.5;
  const scoreMultiplier = intensity === 'high' ? 1.15 : intensity === 'medium' ? 1.05 : 0.95;
  const rankFactor = Math.max(0.5, 1 - (oppRank - 10) / 100);
  const predictedScore = round(baseScore * scoreMultiplier * rankFactor * (0.9 + rng() * 0.2), 1);
  const winProb = round(Math.min(95, Math.max(15, 60 + (30 - oppRank) * 0.5 + (intensity === 'high' ? 8 : intensity === 'medium' ? 0 : -8) + (rng() - 0.5) * 10)), 1);
  const confidence = round(65 + rng() * 30, 1);
  const grade = winProb >= 75 ? 'A' : winProb >= 60 ? 'B' : winProb >= 45 ? 'C' : 'D';
  const trend = pick(rng, ['upward', 'stable', 'volatile']);
  const consistency = round(60 + rng() * 35, 1);

  const metricSets: Record<string, Array<{ name: string; unit: string }>> = {
    basketball: [{ name: 'points', unit: 'pts' }, { name: 'rebounds', unit: 'reb' }, { name: 'assists', unit: 'ast' }, { name: 'steals', unit: 'stl' }, { name: 'field_goal_pct', unit: '%' }],
    football: [{ name: 'goals', unit: 'g' }, { name: 'assists', unit: 'a' }, { name: 'pass_accuracy', unit: '%' }, { name: 'distance_km', unit: 'km' }, { name: 'sprints', unit: 'count' }],
    tennis: [{ name: 'aces', unit: 'count' }, { name: 'winners', unit: 'count' }, { name: 'first_serve_pct', unit: '%' }, { name: 'break_points_won', unit: '%' }, { name: 'unforced_errors', unit: 'count' }],
    swimming: [{ name: 'split_time', unit: 'sec' }, { name: 'stroke_rate', unit: 'spm' }, { name: 'turn_efficiency', unit: '%' }, { name: 'reaction_time', unit: 'sec' }, { name: 'endurance_idx', unit: 'idx' }],
    esports: [{ name: 'kda', unit: 'ratio' }, { name: 'dpm', unit: 'dmg' }, { name: 'kill_participation', unit: '%' }, { name: 'vision_score', unit: 'pts' }, { name: 'cs_per_min', unit: 'cs' }],
  };
  const metricNames = metricSets[sport] || metricSets['basketball'];

  const keyMetrics = metricNames.map(m => {
    const current = round(5 + rng() * 45, 1);
    const predicted = round(current * (0.9 + rng() * 0.25), 1);
    return { metric: m.name, current_avg: current, predicted, unit: m.unit, significance: predicted > current * 1.1 ? 'significant_improvement' : predicted > current ? 'slight_improvement' : 'needs_attention' };
  });

  const dimensions = ['speed', 'strength', 'endurance', 'technique', 'tactical_awareness', 'mental_fortitude'];
  const matchupAnalysis = dimensions.map(dim => {
    const delta = round((rng() - 0.4) * 20, 1);
    return { dimension: dim, athlete_advantage: delta > 0 ? 'athlete' : delta < -3 ? 'opponent' : 'even', score_delta: delta, insight: delta > 5 ? 'clear advantage in ' + dim : delta > 0 ? 'slight edge in ' + dim : delta < -5 ? 'vulnerable in ' + dim : 'comparable ' + dim };
  });

  const scenarios = [
    { scenario: 'optimal_conditions', probability_pct: round(20 + rng() * 30, 1), outcome: 'Peak performance expected', impact: 'High positive' },
    { scenario: 'moderate_pressure', probability_pct: round(30 + rng() * 25, 1), outcome: 'Solid performance within range', impact: 'Neutral to positive' },
    { scenario: 'adversity_scenario', probability_pct: round(10 + rng() * 20, 1), outcome: 'Performance may decline 10-15%', impact: 'Requires mental resilience' },
    { scenario: 'upset_potential', probability_pct: round(5 + rng() * 15, 1), outcome: 'Opponent may overperform', impact: 'High risk' },
  ];

  const peakDay = Math.round(3 + rng() * 4);
  const recoveryIdx = round(70 + rng() * 25, 1);
  const trainingStatus = intensity === 'high' ? 'elevated_load' : intensity === 'medium' ? 'optimal_integration' : 'under_training';

  const lastSeasonDelta = round((rng() - 0.3) * 20, 1);
  const careerAvgDelta = round((rng() - 0.35) * 15, 1);
  const bestMatchDelta = round(rng() * 25, 1);
  const improvements = ['consistency_under_pressure', 'endurance_capacity', 'decision_speed', 'recovery_efficiency'].slice(0, 2 + Math.floor(rng() * 3));

  return {
    prediction_summary: { predicted_score: predictedScore, win_probability_pct: winProb, confidence_pct: confidence, grade, trend, consistency_score: consistency },
    key_metrics: keyMetrics,
    matchup_analysis: matchupAnalysis,
    scenario_projections: scenarios,
    training_effectiveness: { current_load_status: trainingStatus, predicted_peak_day: 'Day ' + peakDay + ' before event', optimization_tip: intensity === 'high' ? 'Consider tapering 3 days before competition' : intensity === 'medium' ? 'Maintain current rhythm with incremental load' : 'Increase intensity to reach optimal preparedness', recovery_index: recoveryIdx },
    historical_comparison: { vs_last_season_pct: lastSeasonDelta, vs_career_avg_pct: careerAvgDelta, best_match_pct: bestMatchDelta, improvement_areas: improvements },
    disclaimer: DISCLAIMER,
  };
}

function formatPerformance(r: PerformanceResult): string {
  let s = '=== Sports Analytics — Performance Prediction Report ===\n\n';
  s += '【Prediction Summary】\n';
  s += '  Predicted Score: ' + r.prediction_summary.predicted_score + '\n';
  s += '  Win Probability: ' + r.prediction_summary.win_probability_pct + '%\n';
  s += '  Confidence: ' + r.prediction_summary.confidence_pct + '%\n';
  s += '  Grade: ' + r.prediction_summary.grade + ' | Trend: ' + r.prediction_summary.trend + ' | Consistency: ' + r.prediction_summary.consistency_score + '/100\n\n';
  s += '【Key Metrics Projection】\n';
  r.key_metrics.forEach(m => { s += '  ' + m.metric + ': ' + m.current_avg + m.unit + ' -> ' + m.predicted + m.unit + ' [' + m.significance + ']\n'; });
  s += '\n【Matchup Analysis】\n';
  r.matchup_analysis.forEach(m => { s += '  ' + m.dimension + ': delta=' + (m.score_delta > 0 ? '+' : '') + m.score_delta + ' (' + m.athlete_advantage + ') - ' + m.insight + '\n'; });
  s += '\n【Scenario Projections】\n';
  r.scenario_projections.forEach(sc => { s += '  ' + sc.scenario + ': ' + sc.probability_pct + '% chance - ' + sc.outcome + ' (' + sc.impact + ')\n'; });
  s += '\n【Training Effectiveness】\n';
  s += '  Load Status: ' + r.training_effectiveness.current_load_status + '\n';
  s += '  Peak Day: ' + r.training_effectiveness.predicted_peak_day + '\n';
  s += '  Recovery Index: ' + r.training_effectiveness.recovery_index + '/100\n';
  s += '  Tip: ' + r.training_effectiveness.optimization_tip + '\n\n';
  s += '【Historical Comparison】\n';
  s += '  vs Last Season: ' + (r.historical_comparison.vs_last_season_pct > 0 ? '+' : '') + r.historical_comparison.vs_last_season_pct + '%\n';
  s += '  vs Career Avg: ' + (r.historical_comparison.vs_career_avg_pct > 0 ? '+' : '') + r.historical_comparison.vs_career_avg_pct + '%\n';
  s += '  vs Best Match: ' + (r.historical_comparison.best_match_pct > 0 ? '+' : '') + r.historical_comparison.best_match_pct + '%\n';
  s += '  Improvement Areas: ' + r.historical_comparison.improvement_areas.join(', ') + '\n';
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 2. injury_risk_assessor
// ============================================================
export interface InjuryInput {
  athlete_name?: string;
  sport_type?: string;
  weekly_training_hours?: number;
  previous_injuries_count?: number;
  age?: number;
  body_fat_pct?: number;
}

export interface InjuryResult {
  risk_assessment: { overall_risk_level: string; risk_score: number; risk_color: string; acute_risk_pct: number; chronic_risk_pct: number; recovery_status: string };
  body_region_risks: Array<{ region: string; risk_level: string; risk_factor: number; primary_concern: string; preventive_action: string }>;
  load_analysis: { weekly_load_status: string; acute_chronic_ratio: number; training_monotony: number; strain_index: number; recommendation: string };
  historical_risk_factors: Array<{ factor: string; severity: string; frequency: string; management_status: string }>;
  prevention_protocol: Array<{ category: string; action: string; frequency: string; priority: string }>;
  recovery_metrics: { sleep_quality_score: number; hrv_trend: string; muscle_soreness_level: number; inflammation_index: number; readiness_score: number };
  disclaimer: string;
}

function analyzeInjury(data: InjuryInput): InjuryResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const hours = data.weekly_training_hours ?? Math.round(10 + rng() * 25);
  const prevInjuries = data.previous_injuries_count ?? Math.round(rng() * 5);
  const age = data.age ?? Math.round(18 + rng() * 18);
  const bodyFat = data.body_fat_pct ?? round(8 + rng() * 15, 1);

  const loadRisk = hours > 25 ? 0.3 : hours > 18 ? 0.15 : 0.05;
  const injuryRisk = prevInjuries * 0.08;
  const ageRisk = age > 30 ? 0.15 : age > 25 ? 0.08 : 0.02;
  const bodyFatRisk = bodyFat > 20 ? 0.1 : bodyFat > 15 ? 0.05 : 0.02;
  const totalRisk = Math.min(0.95, loadRisk + injuryRisk + ageRisk + bodyFatRisk + rng() * 0.15);
  const riskScore = round(totalRisk * 100, 1);
  const riskLevel = riskScore >= 60 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low';
  const riskColor = riskScore >= 60 ? 'red' : riskScore >= 35 ? 'amber' : 'green';

  const regions = ['knee', 'ankle', 'lower_back', 'hamstring', 'shoulder', 'hip'];
  const bodyRegionRisks = regions.map(region => {
    const rf = round(20 + rng() * 70, 1);
    return {
      region,
      risk_level: rf >= 60 ? 'High' : rf >= 35 ? 'Medium' : 'Low',
      risk_factor: rf,
      primary_concern: pick(rng, ['overuse', 'acute_strain', 'biomechanical_imbalance', 'inadequate_recovery', 'weak_stabilizers']),
      preventive_action: pick(rng, ['strengthening_protocol', 'load_manipulation', 'manual_therapy', 'movement_screening', 'taping_bracing']),
    };
  });

  const acr = round(0.7 + rng() * 0.8, 2);
  const monotony = round(1.2 + rng() * 1.5, 2);
  const strain = round(2000 + rng() * 4000, 0);
  const loadStatus = acr > 1.3 ? 'spike_load' : acr > 1.0 ? 'elevated_load' : acr > 0.8 ? 'optimal_load' : 'undertraining';

  const histFactors = [
    { factor: 'prior_injury_history', severity: prevInjuries > 2 ? 'High' : prevInjuries > 0 ? 'Medium' : 'Low', frequency: prevInjuries + ' previous', management_status: prevInjuries > 0 ? 'monitoring' : 'none_needed' },
    { factor: 'training_error', severity: hours > 20 ? 'High' : 'Medium', frequency: 'ongoing', management_status: 'periodization' },
    { factor: 'insufficient_recovery', severity: round(30 + rng() * 40, 1) > 50 ? 'High' : 'Medium', frequency: 'weekly', management_status: 'sleep_hygiene_protocol' },
    { factor: 'biomechanical_factors', severity: pick(rng, ['Low', 'Medium', 'High']), frequency: 'persistent', management_status: 'assessment_scheduled' },
  ];

  const prevention = [
    { category: 'Strength & Conditioning', action: 'Targeted eccentric strengthening', frequency: '3x/week', priority: 'high' },
    { category: 'Load Management', action: 'Gradual progression (max 10% weekly)', frequency: 'daily', priority: 'high' },
    { category: 'Recovery Enhancement', action: 'Sleep optimization + active recovery', frequency: 'daily', priority: 'medium' },
    { category: 'Nutritional Support', action: 'Anti-inflammatory diet + hydration', frequency: 'daily', priority: 'medium' },
    { category: 'Monitoring', action: 'Morning HRV + wellness questionnaire', frequency: 'daily', priority: 'high' },
  ];

  const sleepQuality = round(60 + rng() * 35, 1);
  const hrvTrend = pick(rng, ['improving', 'stable', 'declining']);
  const soreness = round(2 + rng() * 6, 1);
  const inflammation = round(5 + rng() * 20, 1);
  const readiness = Math.max(30, Math.min(95, sleepQuality * 0.4 + (hrvTrend === 'improving' ? 25 : hrvTrend === 'stable' ? 15 : 5) + (10 - soreness) * 2.5 + (25 - inflammation)));

  return {
    risk_assessment: { overall_risk_level: riskLevel, risk_score: riskScore, risk_color: riskColor, acute_risk_pct: round(totalRisk * 0.4 * 100, 1), chronic_risk_pct: round(totalRisk * 0.6 * 100, 1), recovery_status: bodyRegionRisks.filter(b => b.risk_level === 'High').length > 1 ? 'compromised' : 'adequate' },
    body_region_risks: bodyRegionRisks,
    load_analysis: { weekly_load_status: loadStatus, acute_chronic_ratio: acr, training_monotony: monotony, strain_index: strain, recommendation: acr > 1.3 ? 'Reduce training load immediately' : monotony > 2.0 ? 'Introduce more training variability' : 'Load profile acceptable, continue monitoring' },
    historical_risk_factors: histFactors,
    prevention_protocol: prevention,
    recovery_metrics: { sleep_quality_score: sleepQuality, hrv_trend: hrvTrend, muscle_soreness_level: soreness, inflammation_index: inflammation, readiness_score: round(readiness, 1) },
    disclaimer: DISCLAIMER,
  };
}

function formatInjury(r: InjuryResult): string {
  let s = '=== Sports Analytics — Injury Risk Assessment ===\n\n';
  s += '【Risk Assessment】\n';
  s += '  Overall: ' + r.risk_assessment.overall_risk_level + ' (' + r.risk_assessment.risk_score + '/100) [' + r.risk_assessment.risk_color + ']\n';
  s += '  Acute Risk: ' + r.risk_assessment.acute_risk_pct + '% | Chronic Risk: ' + r.risk_assessment.chronic_risk_pct + '%\n';
  s += '  Recovery Status: ' + r.risk_assessment.recovery_status + '\n\n';
  s += '【Body Region Risks】\n';
  r.body_region_risks.forEach(br => { s += '  ' + br.region + ': ' + br.risk_level + ' (' + br.risk_factor + '%) -- ' + br.primary_concern + ' -> ' + br.preventive_action + '\n'; });
  s += '\n【Load Analysis】\n';
  s += '  Status: ' + r.load_analysis.weekly_load_status + ' | ACR: ' + r.load_analysis.acute_chronic_ratio + ' | Monotony: ' + r.load_analysis.training_monotony + '\n';
  s += '  Strain Index: ' + r.load_analysis.strain_index + '\n';
  s += '  => ' + r.load_analysis.recommendation + '\n\n';
  s += '【Historical Risk Factors】\n';
  r.historical_risk_factors.forEach(h => { s += '  ' + h.factor + ': ' + h.severity + ' | ' + h.frequency + ' | management: ' + h.management_status + '\n'; });
  s += '\n【Prevention Protocol】\n';
  r.prevention_protocol.forEach(p => { s += '  [' + p.priority + '] ' + p.category + ': ' + p.action + ' (' + p.frequency + ')\n'; });
  s += '\n【Recovery Metrics】\n';
  s += '  Sleep Quality: ' + r.recovery_metrics.sleep_quality_score + '/100\n';
  s += '  HRV Trend: ' + r.recovery_metrics.hrv_trend + '\n';
  s += '  Muscle Soreness: ' + r.recovery_metrics.muscle_soreness_level + '/10\n';
  s += '  Inflammation Index: ' + r.recovery_metrics.inflammation_index + '\n';
  s += '  Readiness Score: ' + r.recovery_metrics.readiness_score + '/100\n';
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 3. tactical_analysis_engine
// ============================================================
export interface TacticalInput {
  team_name?: string;
  opponent_formation?: string;
  match_context?: string;
  possession_pct?: number;
  recent_matches?: number;
}

export interface TacticalResult {
  tactical_summary: { recommended_formation: string; tactical_style: string; key_strength: string; main_vulnerability: string; adaptability_score: number; risk_profile: string };
  formation_analysis: Array<{ zone: string; strength_rating: number; weakness: string; opportunity: string; coverage_pct: number }>;
  passing_network: Array<{ from_zone: string; to_zone: string; frequency: number; effectiveness_pct: string; key_player_role: string }>;
  pressing_strategy: { intensity: string; trigger_zones: Array<string>; success_rate_pct: number; recovery_time_sec: number; goal_contributions: number };
  set_piece_analysis: { corner_strategy: string; free_kick_potential: string; throw_in_tactics: string; conversion_rate_pct: number; creativity_score: number };
  opponent_weaknesses: Array<{ weakness: string; exploit_method: string; probability_pct: number; priority: string }>;
  disclaimer: string;
}

function analyzeTactical(data: TacticalInput): TacticalResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const oppFormation = data.opponent_formation || pick(rng, ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '3-4-3']);
  const possession = data.possession_pct ?? Math.round(40 + rng() * 25);
  const context = data.match_context || pick(rng, ['home', 'away', 'neutral']);

  const formationMap: Record<string, { style: string; strength: string; weakness: string }> = {
    '4-3-3': { style: 'positional_play', strength: 'width_exploitation', weakness: 'counter_attack_vulnerability' },
    '4-4-2': { style: 'direct_attacking', strength: 'dual_striker_pressure', weakness: 'midfield_overrun' },
    '3-5-2': { style: 'compact_defense', strength: 'numerical_superiority_midfield', weakness: 'wing_exposure' },
    '4-2-3-1': { style: 'counter_attacking', strength: 'defensive_stability', weakness: 'isolated_striker' },
    '3-4-3': { style: 'high_pressing', strength: 'aggressive_front_three', weakness: 'defensive_transitions' },
  };
  const formation = formationMap[oppFormation] || formationMap['4-3-3'];
  const recommendedFormation = pick(rng, ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1']);
  const adaptability = round(60 + rng() * 35, 1);
  const riskProfile = rng() > 0.6 ? 'aggressive' : rng() > 0.3 ? 'balanced' : 'conservative';

  const zones = ['defensive_third', 'middle_third', 'attacking_third', 'left_flank', 'right_flank', 'central_corridor'];
  const formationAnalysis = zones.map(z => ({
    zone: z,
    strength_rating: round(50 + rng() * 45, 1),
    weakness: pick(rng, ['spacing_issues', 'transition_gaps', 'overcrowding', 'insufficient_support', 'isolation_risk']),
    opportunity: pick(rng, ['quick_transitions', 'overload_creation', 'switch_of_play', 'pressing_triggers', 'counter_press']),
    coverage_pct: round(60 + rng() * 35, 1),
  }));

  const passPairs = [
    { from: 'defense', to: 'midfield' },
    { from: 'midfield', to: 'attack' },
    { from: 'wide_left', to: 'central' },
    { from: 'wide_right', to: 'central' },
    { from: 'midfield', to: 'wide_left' },
    { from: 'midfield', to: 'wide_right' },
  ];
  const passingNetwork = passPairs.map(p => ({
    from_zone: p.from,
    to_zone: p.to,
    frequency: Math.round(15 + rng() * 60),
    effectiveness_pct: round(65 + rng() * 30, 1) + '%',
    key_player_role: pick(rng, ['playmaker', 'ball_carrier', 'target_man', 'inverted_fullback', 'false_nine']),
  }));

  const pressTriggers = pick(rng, [['opp_defensive_third'], ['midfield'], ['full_pitch', 'half_pitch']]) as string[];
  const pressingSuccess = round(40 + rng() * 40, 1);

  const setPieces = {
    corner_strategy: pick(rng, ['near_post_flick', 'back_post_header', 'short_corner', 'penalty_spot_driven']),
    free_kick_potential: pick(rng, ['direct_shot', 'cross_to_far_post', 'layoff_shot', 'chip_over_wall']),
    throw_in_tactics: pick(rng, ['long_throw', 'short_combination', 'quick_release', 'target_man_header']),
    conversion_rate_pct: round(5 + rng() * 15, 1),
    creativity_score: round(50 + rng() * 45, 1),
  };

  const oppWeaknesses = [
    { weakness: 'high_defensive_line', exploit_method: 'through_balls_and_diagonal_runs', probability_pct: round(50 + rng() * 30, 1), priority: 'high' },
    { weakness: 'slow_transition_defending', exploit_method: 'quick_counter_attack_after_possession_win', probability_pct: round(40 + rng() * 35, 1), priority: 'medium' },
    { weakness: 'set_piece_vulnerability', exploit_method: 'targeted_corner_variations', probability_pct: round(30 + rng() * 30, 1), priority: 'medium' },
    { weakness: 'wide_defensive_gaps', exploit_method: 'overlapping_fullbacks_and_wingers', probability_pct: round(45 + rng() * 25, 1), priority: 'high' },
  ];

  return {
    tactical_summary: { recommended_formation: recommendedFormation, tactical_style: formation.style, key_strength: formation.strength, main_vulnerability: formation.weakness, adaptability_score: adaptability, risk_profile: riskProfile },
    formation_analysis: formationAnalysis,
    passing_network: passingNetwork,
    pressing_strategy: { intensity: context === 'home' ? 'high' : context === 'away' ? 'medium' : 'variable', trigger_zones: pressTriggers, success_rate_pct: pressingSuccess, recovery_time_sec: round(3 + rng() * 7, 1), goal_contributions: Math.round(rng() * 20) },
    set_piece_analysis: setPieces,
    opponent_weaknesses: oppWeaknesses,
    disclaimer: DISCLAIMER,
  };
}

function formatTactical(r: TacticalResult): string {
  let s = '=== Sports Analytics -- Tactical Analysis Report ===\n\n';
  s += '【Tactical Summary】\n';
  s += '  Recommended Formation: ' + r.tactical_summary.recommended_formation + '\n';
  s += '  Style: ' + r.tactical_summary.tactical_style + ' | Key Strength: ' + r.tactical_summary.key_strength + '\n';
  s += '  Main Vulnerability: ' + r.tactical_summary.main_vulnerability + '\n';
  s += '  Adaptability: ' + r.tactical_summary.adaptability_score + '/100 | Risk: ' + r.tactical_summary.risk_profile + '\n\n';
  s += '【Formation Analysis】\n';
  r.formation_analysis.forEach(f => { s += '  ' + f.zone + ': strength=' + f.strength_rating + ' coverage=' + f.coverage_pct + '% | weak: ' + f.weakness + ' | opp: ' + f.opportunity + '\n'; });
  s += '\n【Passing Network】\n';
  r.passing_network.forEach(p => { s += '  ' + p.from_zone + ' -> ' + p.to_zone + ': ' + p.frequency + ' passes, ' + p.effectiveness_pct + ' effective, role: ' + p.key_player_role + '\n'; });
  s += '\n【Pressing Strategy】\n';
  s += '  Intensity: ' + r.pressing_strategy.intensity + ' | Success: ' + r.pressing_strategy.success_rate_pct + '%\n';
  s += '  Triggers: ' + r.pressing_strategy.trigger_zones.join(', ') + ' | Recovery: ' + r.pressing_strategy.recovery_time_sec + 's\n\n';
  s += '【Set Piece Analysis】\n';
  s += '  Corner: ' + r.set_piece_analysis.corner_strategy + ' | Freekick: ' + r.set_piece_analysis.free_kick_potential + '\n';
  s += '  Conversion: ' + r.set_piece_analysis.conversion_rate_pct + '% | Creativity: ' + r.set_piece_analysis.creativity_score + '/100\n\n';
  s += '【Opponent Weaknesses】\n';
  r.opponent_weaknesses.forEach(w => { s += '  [' + w.priority + '] ' + w.weakness + ': ' + w.exploit_method + ' (' + w.probability_pct + '%)\n'; });
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 4. player_scouting_recommander
// ============================================================
export interface ScoutingInput {
  target_position?: string;
  budget_range?: string;
  age_range?: string;
  league_preference?: string;
  attributes_weight?: string;
}

export interface ScoutingResult {
  recommendation_summary: { total_candidates: number; top_score: number; avg_score: number; best_value_pick: string; risk_adjusted_rank: string; confidence_level: number };
  player_profiles: Array<{ name: string; age: number; position: string; club: string; overall_rating: number; potential_rating: string; estimated_value: string; strengths: Array<string>; red_flags: Array<string> }>;
  comparative_analysis: { price_per_point: number; roi_projection: string; market_trend: string; demand_level: string; comparable_transfers: Array<string> };
  attribute_breakdown: Array<{ attribute: string; top_candidate_score: number; importance_pct: number; weight: string }>;
  fit_assessment: { team_compatibility: number; league_ready: string; development_ceiling: string; immediate_impact: number; long_term_value: string };
  recruitment_strategy: { negotiation_approach: string; timeline: string; alternative_targets: Array<string>; agent_relationship: string; due_diligence_items: Array<string> };
  disclaimer: string;
}

function analyzeScouting(data: ScoutingInput): ScoutingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const position = data.target_position || pick(rng, ['striker', 'winger', 'midfielder', 'defender', 'goalkeeper']);
  const weight = data.attributes_weight || pick(rng, ['speed-first', 'technique-first', 'physical-first', 'balanced']);

  const candidateCount = Math.round(4 + rng() * 8);
  const players = [
    { first: 'Marco', last: 'Rossi' }, { first: 'Jean', last: 'Dupont' }, { first: 'Kai', last: 'Tanaka' },
    { first: 'Lucas', last: 'Silva' }, { first: 'Ahmed', last: 'Hassan' }, { first: 'Ivan', last: 'Petrov' },
    { first: 'Carlos', last: 'Santos' }, { first: 'Yuki', last: 'Mori' }, { first: 'Felix', last: 'Mueller' },
    { first: 'Omar', last: 'Diallo' }, { first: 'James', last: 'Oaland' }, { first: 'Chen', last: 'Wei' },
  ];
  const clubs = ['Ajax Academy', 'Benfica B', 'RB Salzburg', 'Sporting CP', 'Club Brugge', 'PSV Eindhoven', 'Red Bull Brasil', 'Dinamo Zagreb'];

  const profiles = players.slice(0, candidateCount).map(p => {
    const score = round(55 + rng() * 35, 1);
    const age = Math.round(18 + rng() * 10);
    return {
      name: p.first + ' ' + p.last,
      age,
      position,
      club: pick(rng, clubs),
      overall_rating: score,
      potential_rating: String(Math.min(99, Math.round(score + 5 + rng() * 15))),
      estimated_value: round(1 + rng() * 49, 1) + 'M EUR',
      strengths: ['pace', 'technical_ability', 'vision', 'work_rate', 'composure'].slice(0, 2 + Math.floor(rng() * 3)),
      red_flags: rng() > 0.5 ? ['injury_history'] : rng() > 0.3 ? ['consistency_issues', 'adaptation_risk'] : [],
    };
  });

  const scores = profiles.map(p => p.overall_rating);
  const topScore = Math.max(...scores);
  const avgScore = round(scores.reduce((a, b) => a + b, 0) / scores.length, 1);

  const attributeNames = weight === 'speed-first' ? ['acceleration', 'top_speed', 'agility'] : weight === 'technique-first' ? ['ball_control', 'passing', 'first_touch'] : weight === 'physical-first' ? ['strength', 'stamina', 'aerial_ability'] : ['balance', 'stamina', 'agility'];
  const attributeBreakdown = attributeNames.map((attr, idx) => ({
    attribute: attr,
    top_candidate_score: round(60 + rng() * 35, 1),
    importance_pct: round(20 + (2 - idx) * 5 + rng() * 10, 1),
    weight: idx === 0 ? 'primary' : idx === 1 ? 'secondary' : 'tertiary',
  }));

  return {
    recommendation_summary: { total_candidates: candidateCount, top_score: round(topScore, 1), avg_score: round(avgScore, 1), best_value_pick: profiles.sort((a, b) => a.age - b.age || b.overall_rating - a.overall_rating)[0]?.name || 'N/A', risk_adjusted_rank: pick(rng, ['strong_buy', 'recommend', 'consider', 'hold']), confidence_level: round(65 + rng() * 30, 1) },
    player_profiles: profiles,
    comparative_analysis: { price_per_point: round(0.5 + rng() * 2, 2), roi_projection: pick(rng, ['high', 'medium', 'speculative']), market_trend: pick(rng, ['rising', 'stable', 'declining']), demand_level: pick(rng, ['high', 'medium', 'low']), comparable_transfers: ['Player A -> Club X (25M)', 'Player B -> Club Y (32M)', 'Player C -> Club Z (18M)'] },
    attribute_breakdown: attributeBreakdown,
    fit_assessment: { team_compatibility: round(60 + rng() * 35, 1), league_ready: pick(rng, ['immediate', '6_months', '1_year', '2_years']), development_ceiling: pick(rng, ['elite', 'international', 'starter', 'squad']), immediate_impact: round(30 + rng() * 60, 1), long_term_value: pick(rng, ['exceptional', 'strong', 'good', 'uncertain']) },
    recruitment_strategy: { negotiation_approach: pick(rng, ['direct_club_contact', 'agent_mediated', 'release_clause_trigger', 'loan_with_option']), timeline: pick(rng, ['immediate_window', 'summer_window', 'winter_window', 'next_season']), alternative_targets: profiles.slice(0, 2).map(p => p.name), agent_relationship: pick(rng, ['established', 'developing', 'new_contact', 'intermediary']), due_diligence_items: ['medical_assessment', 'character_reference', 'contract_status', 'performance_data_verification'] },
    disclaimer: DISCLAIMER,
  };
}

function formatScouting(r: ScoutingResult): string {
  let s = '=== Sports Analytics -- Scouting Recommendation Report ===\n\n';
  s += '【Recommendation Summary】\n';
  s += '  Candidates: ' + r.recommendation_summary.total_candidates + ' | Top: ' + r.recommendation_summary.top_score + ' | Avg: ' + r.recommendation_summary.avg_score + '\n';
  s += '  Best Value: ' + r.recommendation_summary.best_value_pick + ' | Rank: ' + r.recommendation_summary.risk_adjusted_rank + '\n';
  s += '  Confidence: ' + r.recommendation_summary.confidence_level + '%\n\n';
  s += '【Player Profiles】\n';
  r.player_profiles.forEach(p => { s += '  ' + p.name + ' (' + p.age + ', ' + p.position + ', ' + p.club + '): ' + p.overall_rating + ' | Potential: ' + p.potential_rating + ' | Value: ' + p.estimated_value + '\n'; });
  s += '\n【Attribute Breakdown】\n';
  r.attribute_breakdown.forEach(a => { s += '  ' + a.attribute + ': ' + a.top_candidate_score + ' (' + a.importance_pct + '% weight: ' + a.weight + ')\n'; });
  s += '\n【Fit Assessment】\n';
  s += '  Compatibility: ' + r.fit_assessment.team_compatibility + '/100 | League Ready: ' + r.fit_assessment.league_ready + '\n';
  s += '  Immediate Impact: ' + r.fit_assessment.immediate_impact + '/100 | Ceiling: ' + r.fit_assessment.development_ceiling + '\n\n';
  s += '【Recruitment Strategy】\n';
  s += '  Approach: ' + r.recruitment_strategy.negotiation_approach + ' | Timeline: ' + r.recruitment_strategy.timeline + '\n';
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 5. fan_engagement_optimizer
// ============================================================
export interface FanEngagementInput {
  platform?: string;
  follower_count?: number;
  avg_engagement_rate?: number;
  content_category?: string;
  demographic_target?: string;
}

export interface FanEngagementResult {
  engagement_summary: { current_rate: number; projected_rate: number; improvement_pct: string; growth_trajectory: string; viral_potential_score: number; brand_health_index: number };
  content_strategy: Array<{ content_type: string; frequency: string; expected_reach_pct: number; engagement_boost: string; priority: string }>;
  audience_insights: { peak_activity_hours: Array<number>; top_demographics: Array<{ segment: string; pct: number; loyalty: string }>; sentiment_score: number; churn_risk_pct: number; loyalty_index: number };
  monetization_analysis: { revenue_streams: Array<{ stream: string; monthly_revenue_est: string; conversion_rate: string }>; sponsorship_ceiling: string; merchandise_potential: string; subscription_viability: string };
  campaign_recommendations: Array<{ campaign_name: string; duration: string; expected_follower_growth: number; budget_estimate: string; roi_projection: string }>;
  competitive_benchmarking: { vs_league_avg_engagement: string; vs_top_club: string; platform_rank: string; growth_rate_percentile: number; content_quality_score: number };
  social_listening: { top_mentions: Array<string>; trending_topics: Array<string>; crisis_alerts: Array<string>; influencer_collaborations: Array<string>; community_health_score: number };
  disclaimer: string;
}

function analyzeFanEngagement(data: FanEngagementInput): FanEngagementResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const followers = data.follower_count ?? Math.round(50000 + rng() * 5000000);
  const currentRate = data.avg_engagement_rate ?? round(1 + rng() * 8, 2);
  const platform = data.platform || pick(rng, ['social_media', 'official_app', 'youtube', 'twitch', 'tiktok']);

  const projectedRate = round(currentRate * (1.2 + rng() * 0.5), 2);
  const improvement = round((projectedRate - currentRate) / currentRate * 100, 1);
  const viralScore = round(20 + rng() * 70, 1);
  const brandHealth = round(55 + rng() * 40, 1);

  const contentTypes = ['match_highlights', 'behind_the_scenes', 'player_interviews', 'fan_challenges', 'tactical_breakdowns', 'live_qa', 'merch_drops', 'historical_nostalgia'];
  const contentStrategy = contentTypes.slice(0, 4 + Math.floor(rng() * 4)).map(ct => ({
    content_type: ct,
    frequency: pick(rng, ['daily', '3x_weekly', 'weekly', 'bi_weekly']),
    expected_reach_pct: round(10 + rng() * 60, 1),
    engagement_boost: round(10 + rng() * 40, 1) + '%',
    priority: pick(rng, ['critical', 'high', 'medium', 'low']),
  }));

  const peakHours = Array.from({ length: 3 + Math.floor(rng() * 3) }, () => Math.round(10 + rng() * 12));
  const topDemographics = [
    { segment: '18-24_male', pct: round(20 + rng() * 25, 1), loyalty: pick(rng, ['high', 'medium']) },
    { segment: '25-34_male', pct: round(15 + rng() * 20, 1), loyalty: pick(rng, ['high', 'medium']) },
    { segment: '25-34_female', pct: round(10 + rng() * 15, 1), loyalty: pick(rng, ['medium', 'low']) },
    { segment: '35-44_male', pct: round(5 + rng() * 10, 1), loyalty: 'high' },
  ];
  const sentimentScore = round(55 + rng() * 40, 1);
  const churnRisk = round(rng() * 15, 1);
  const loyaltyIdx = round(60 + rng() * 35, 1);

  const revenueStreams = [
    { stream: 'sponsorships', monthly_revenue_est: String(round(10000 + rng() * 90000, 0)), conversion_rate: round(0.5 + rng() * 2, 2) + '%' },
    { stream: 'merchandise', monthly_revenue_est: String(round(5000 + rng() * 45000, 0)), conversion_rate: round(1 + rng() * 3, 1) + '%' },
    { stream: 'subscriptions', monthly_revenue_est: String(round(2000 + rng() * 18000, 0)), conversion_rate: round(2 + rng() * 5, 1) + '%' },
    { stream: 'digital_content', monthly_revenue_est: String(round(1000 + rng() * 9000, 0)), conversion_rate: round(0.3 + rng() * 1.5, 2) + '%' },
  ];

  const campaigns = [
    { campaign_name: 'Matchday_Challenge', duration: '1_week', expected_follower_growth: Math.round(followers * (0.01 + rng() * 0.03)), budget_estimate: String(round(2000 + rng() * 8000, 0)), roi_projection: round(150 + rng() * 200, 0) + '%' },
    { campaign_name: 'Player_Takeover', duration: '3_days', expected_follower_growth: Math.round(followers * (0.005 + rng() * 0.02)), budget_estimate: String(round(1000 + rng() * 5000, 0)), roi_projection: round(120 + rng() * 180, 0) + '%' },
    { campaign_name: 'Community_Award', duration: '2_weeks', expected_follower_growth: Math.round(followers * (0.008 + rng() * 0.025)), budget_estimate: String(round(3000 + rng() * 7000, 0)), roi_projection: round(200 + rng() * 250, 0) + '%' },
  ];

  const mentions = ['@' + platform + '_fan_1', '@sports_analyst', '@league_official', '@player_handle', '@influencer_x'];
  const trending = ['#matchday', '#transfersonline', '#derbyday', '#training_goals', '#fan_story'];

  return {
    engagement_summary: { current_rate: currentRate, projected_rate: projectedRate, improvement_pct: improvement + '%', growth_trajectory: pick(rng, ['accelerating', 'steady', 'plateau', 'declining']), viral_potential_score: viralScore, brand_health_index: brandHealth },
    content_strategy: contentStrategy,
    audience_insights: { peak_activity_hours: peakHours, top_demographics: topDemographics, sentiment_score: sentimentScore, churn_risk_pct: churnRisk, loyalty_index: loyaltyIdx },
    monetization_analysis: { revenue_streams: revenueStreams, sponsorship_ceiling: round(50000 + rng() * 200000, 0) + '/month', merchandise_potential: pick(rng, ['high', 'medium', 'emerging']), subscription_viability: pick(rng, ['strong_viable', 'viable', 'marginal', 'not_recommended']) },
    campaign_recommendations: campaigns,
    competitive_benchmarking: { vs_league_avg_engagement: pick(rng, ['above', 'significantly_above', 'average', 'below']), vs_top_club: pick(rng, ['closing_gap', 'comparable', 'behind', 'far_behind']), platform_rank: 'Top ' + Math.round(3 + rng() * 20), growth_rate_percentile: round(50 + rng() * 45, 1), content_quality_score: round(60 + rng() * 35, 1) },
    social_listening: { top_mentions: mentions, trending_topics: trending.slice(0, 3 + Math.floor(rng() * 3)), crisis_alerts: rng() > 0.7 ? ['minor_backlog_complaint'] : [], influencer_collaborations: ['influencer_a_1.2M', 'influencer_b_800K'], community_health_score: round(65 + rng() * 30, 1) },
    disclaimer: DISCLAIMER,
  };
}

function formatFanEngagement(r: FanEngagementResult): string {
  let s = '=== Sports Analytics -- Fan Engagement Optimization ===\n\n';
  s += '【Engagement Summary】\n';
  s += '  Current: ' + r.engagement_summary.current_rate + '% | Projected: ' + r.engagement_summary.projected_rate + '% (~' + r.engagement_summary.improvement_pct + ')\n';
  s += '  Viral Score: ' + r.engagement_summary.viral_potential_score + '/100 | Brand Health: ' + r.engagement_summary.brand_health_index + '/100\n\n';
  s += '【Content Strategy】\n';
  r.content_strategy.forEach(c => { s += '  [' + c.priority + '] ' + c.content_type + ': ' + c.frequency + ' | reach: ' + c.expected_reach_pct + '% | boost: ' + c.engagement_boost + '\n'; });
  s += '\n【Audience Insights】\n';
  s += '  Peak Hours: ' + r.audience_insights.peak_activity_hours.join(', ') + '\n';
  s += '  Sentiment: ' + r.audience_insights.sentiment_score + '/100 | Churn Risk: ' + r.audience_insights.churn_risk_pct + '%\n\n';
  s += '【Monetization】\n';
  r.monetization_analysis.revenue_streams.forEach(rs => { s += '  ' + rs.stream + ': ' + rs.monthly_revenue_est + ' @ ' + rs.conversion_rate + '\n'; });
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 6. sports_betting_analytics
// ============================================================
export interface BettingInput {
  sport_type?: string;
  league_name?: string;
  match_id?: string;
  bankroll?: string;
  risk_tolerance?: string;
}

export interface BettingResult {
  betting_summary: { total_value_bets: number; avg_ev_pct: number; total_probability_edge: number; kelly_fraction_suggestion: number; confidence_tier: string; risk_adjusted_roi: string };
  value_bets: Array<{ market: string; selection: string; bookmaker_odds: number; model_probability_pct: number; ev_pct: number; kelly_stake_pct: number; confidence: string }>;
  odds_comparison: Array<{ bookmaker: string; odds: number; margin_pct: string; best_for: string }>;
  bankroll_management: { recommended_unit_size_pct: string; max_exposure_pct: string; stop_loss_threshold: string; profit_target: string; rollover_requirement: string };
  model_performance: { roi_last_30d: number; hit_rate_pct: number; avg_odds: number; sharpe_ratio: string; max_drawdown_pct: number; sample_size: number };
  risk_analysis: { variance_forecast: string; correlation_risk: string; market_efficiency: string; liquidity_concerns: Array<string>; hedging_opportunities: Array<string> };
  disclaimer: string;
}

function analyzeBetting(data: BettingInput): BettingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const sport = data.sport_type || pick(rng, ['football', 'basketball', 'tennis', 'esports']);

  const valueBetCount = Math.round(2 + rng() * 6);
  const markets = ['match_result', 'over_under_2_5', 'both_teams_to_score', 'asian_handicap', 'correct_score', 'first_goalscorer', 'total_corners', 'cards_over_under'];
  const selections = ['home_win', 'draw', 'away_win', 'over', 'under', 'yes', 'no'];

  const valueBets = markets.slice(0, valueBetCount).map(m => {
    const odds = round(1.3 + rng() * 6, 2);
    const modelProb = round(30 + rng() * 50, 1);
    const impliedProb = round(100 / odds, 1);
    const ev = round((modelProb - impliedProb) / impliedProb * 100, 1);
    const kelly = round(Math.max(0, Math.min(10, ev / 100 * odds / (odds - 1))), 2);
    return { market: m, selection: pick(rng, selections), bookmaker_odds: odds, model_probability_pct: modelProb, ev_pct: ev, kelly_stake_pct: kelly, confidence: ev >= 15 ? 'high' : ev >= 8 ? 'medium' : 'low' };
  });

  const avgEv = round(valueBets.reduce((a, b) => a + b.ev_pct, 0) / valueBets.length, 1);

  const bet365Odds = round(1.5 + rng() * 4, 2);
  const pinnacleOdds = round(bet365Odds * (1.01 + rng() * 0.05), 2);
  const betfairOdds = round(bet365Odds * (1.02 + rng() * 0.04), 2);

  const bookmakers = [
    { bookmaker: 'Bet365', odds: bet365Odds, margin_pct: round(4 + rng() * 3, 1) + '%', best_for: pick(rng, ['safety', 'variety', 'promotions']) },
    { bookmaker: 'Pinnacle', odds: pinnacleOdds, margin_pct: round(2 + rng() * 1.5, 1) + '%', best_for: pick(rng, ['low_margin', 'sharp_limits', 'prices']) },
    { bookmaker: 'Betfair', odds: betfairOdds, margin_pct: round(2.5 + rng() * 2, 1) + '%', best_for: pick(rng, ['exchange', 'lower_margin', 'lay_betting']) },
  ];

  const roi30d = round(-5 + rng() * 20, 1);
  const hitRate = round(40 + rng() * 25, 1);

  return {
    betting_summary: { total_value_bets: valueBetCount, avg_ev_pct: avgEv, total_probability_edge: round(valueBets.reduce((a, b) => a + b.model_probability_pct - 100 / b.bookmaker_odds, 0), 1), kelly_fraction_suggestion: round(0.25 + rng() * 0.5, 2), confidence_tier: avgEv >= 12 ? 'tier1' : 'tier2', risk_adjusted_roi: round(avgEv * 0.6, 1) + '%' },
    value_bets: valueBets,
    odds_comparison: bookmakers,
    bankroll_management: { recommended_unit_size_pct: round(1 + rng() * 3, 1) + '%', max_exposure_pct: round(8 + rng() * 12, 1) + '%', stop_loss_threshold: round(15 + rng() * 15, 1) + '% drawdown', profit_target: round(10 + rng() * 20, 1) + '% monthly', rollover_requirement: pick(rng, ['none', '1x', '2x_bonus']) },
    model_performance: { roi_last_30d: roi30d, hit_rate_pct: hitRate, avg_odds: round(1.8 + rng() * 2, 2), sharpe_ratio: round(0.8 + rng() * 2, 2).toString(), max_drawdown_pct: round(8 + rng() * 22, 1), sample_size: Math.round(100 + rng() * 900) },
    risk_analysis: { variance_forecast: pick(rng, ['normal', 'elevated', 'high_volatility']), correlation_risk: pick(rng, ['low', 'medium', 'concerning']), market_efficiency: pick(rng, ['semi_strong', 'weak_form_inefficiencies', 'moderate']), liquidity_concerns: rng() > 0.7 ? ['thin_market_event'] : [], hedging_opportunities: rng() > 0.5 ? ['arb_with_exchange', 'in_play_hedging'] : ['none_identified'] },
    disclaimer: DISCLAIMER,
  };
}

function formatBetting(r: BettingResult): string {
  let s = '=== Sports Analytics -- Betting Analytics Report ===\n\n';
  s += '【Betting Summary】\n';
  s += '  Value Bets: ' + r.betting_summary.total_value_bets + ' | Avg EV: ' + r.betting_summary.avg_ev_pct + '% | Kelly: ' + r.betting_summary.kelly_fraction_suggestion + '\n';
  s += '  Confidence Tier: ' + r.betting_summary.confidence_tier + '\n\n';
  s += '【Value Bets】\n';
  r.value_bets.forEach(v => { s += '  [' + v.confidence + '] ' + v.market + ' - ' + v.selection + ': odds=' + v.bookmaker_odds + ' prob=' + v.model_probability_pct + '% EV=' + v.ev_pct + '% kelly=' + v.kelly_stake_pct + '%\n'; });
  s += '\n【Bookmaker Comparison】\n';
  r.odds_comparison.forEach(b => { s += '  ' + b.bookmaker + ': odds=' + b.odds + ' margin=' + b.margin_pct + ' best_for: ' + b.best_for + '\n'; });
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 7. esports_performance_analyzer
// ============================================================
export interface EsportsInput {
  game_title?: string;
  player_name?: string;
  match_duration_min?: number;
  role?: string;
  tournament_tier?: string;
}

export interface EsportsResult {
  performance_summary: { kda: number; kda_ratio: string; combat_score: number; objective_score: number; vision_score: number; overall_grade: string; mvp_probability_pct: number };
  combat_analysis: { kills: number; deaths: number; assists: number; kill_participation_pct: number; damage_per_min: number; damage_share_pct: number; first_blood_pct: number };
  macro_analysis: { cs_per_min: number; gold_per_min: number; gold_diff_at_15: number; tower_plates: number; ward_score: number; map_control_pct: number };
  teamfight_metrics: { teamfights_participated: number; avg_teamfight_damage: number; teamfight_win_rate_pct: number; clutch_plays: number; engage_score: number; peel_effectiveness_pct: number };
  laning_phase: { cs_diff_at_10: number; xp_diff_at_10: number; lane_dominance_score: number; roam_effectiveness_pct: number; tower_damage: number; plating_gold: number };
  itemization_analysis: { build_efficiency_pct: number; power_spike_timing: string; situational_awareness: string; item_adaptability_score: number; gold_efficiency_pct: number; build_path_optimality: string };
  disclaimer: string;
}

function analyzeEsports(data: EsportsInput): EsportsResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const game = data.game_title || pick(rng, ['League of Legends', 'DOTA2', 'CS2', 'Valorant', 'Overwatch']);
  const duration = data.match_duration_min ?? Math.round(20 + rng() * 30);
  const role = data.role || pick(rng, ['mid-lane', 'top-lane', 'jungle', 'bot-lane', 'support']);

  const kills = Math.round(3 + rng() * 15);
  const deaths = Math.round(1 + rng() * 8);
  const assists = Math.round(5 + rng() * 20);
  const kda = deaths > 0 ? round((kills + assists) / deaths, 1) : round(kills + assists, 1);
  const kdaRatio = kills + '/' + deaths + '/' + assists;
  const combatScore = round(50 + rng() * 45, 1);
  const objectiveScore = round(40 + rng() * 50, 1);
  const visionScore = round(30 + rng() * 60, 1);
  const overallGrade = combatScore >= 80 ? 'S' : combatScore >= 65 ? 'A' : combatScore >= 50 ? 'B' : 'C';
  const mvpProb = round(Math.min(95, combatScore * 0.8 + rng() * 20), 1);

  const csPerMin = round(5 + rng() * 6, 1);
  const goldPerMin = round(300 + rng() * 300, 0);
  const goldDiff15 = round((rng() - 0.4) * 2000, 0);

  const teamfights = Math.round(5 + rng() * 15);
  const avgTeamfightDmg = round(500 + rng() * 1500, 0);
  const teamfightWinRate = round(40 + rng() * 50, 1);

  const csDiff10 = round((rng() - 0.4) * 30, 0);
  const xpDiff10 = round((rng() - 0.4) * 500, 0);
  const laneDominance = round(40 + rng() * 50, 1);

  const buildEff = round(60 + rng() * 35, 1);
  const goldEff = round(65 + rng() * 30, 1);

  return {
    performance_summary: { kda, kda_ratio: kdaRatio, combat_score: combatScore, objective_score: objectiveScore, vision_score: visionScore, overall_grade: overallGrade, mvp_probability_pct: mvpProb },
    combat_analysis: { kills, deaths, assists, kill_participation_pct: round(40 + rng() * 50, 1), damage_per_min: round(300 + rng() * 600, 0), damage_share_pct: round(15 + rng() * 25, 1), first_blood_pct: round(rng() * 30, 1) },
    macro_analysis: { cs_per_min: csPerMin, gold_per_min: goldPerMin, gold_diff_at_15: goldDiff15, tower_plates: Math.round(rng() * 5), ward_score: round(20 + rng() * 60, 1), map_control_pct: round(35 + rng() * 50, 1) },
    teamfight_metrics: { teamfights_participated: teamfights, avg_teamfight_damage: avgTeamfightDmg, teamfight_win_rate_pct: teamfightWinRate, clutch_plays: Math.round(rng() * 5), engage_score: round(40 + rng() * 50, 1), peel_effectiveness_pct: round(30 + rng() * 55, 1) },
    laning_phase: { cs_diff_at_10: csDiff10, xp_diff_at_10: xpDiff10, lane_dominance_score: laneDominance, roam_effectiveness_pct: round(20 + rng() * 60, 1), tower_damage: Math.round(rng() * 2000), plating_gold: Math.round(rng() * 500) },
    itemization_analysis: { build_efficiency_pct: buildEff, power_spike_timing: pick(rng, ['1-item spike', '2-item spike', '3-item spike']), situational_awareness: pick(rng, ['excellent', 'good', 'average', 'needs improvement']), item_adaptability_score: round(50 + rng() * 45, 1), gold_efficiency_pct: goldEff, build_path_optimality: pick(rng, ['optimal', 'near-optimal', 'suboptimal', 'inefficient']) },
    disclaimer: DISCLAIMER,
  };
}

function formatEsports(r: EsportsResult): string {
  let s = '=== Sports Analytics -- Esports Performance Analysis ===\n\n';
  s += '【Performance Summary】\n';
  s += '  KDA: ' + r.performance_summary.kda + ' (' + r.performance_summary.kda_ratio + ') | Grade: ' + r.performance_summary.overall_grade + '\n';
  s += '  Combat: ' + r.performance_summary.combat_score + ' | Objective: ' + r.performance_summary.objective_score + ' | Vision: ' + r.performance_summary.vision_score + '\n';
  s += '  MVP Probability: ' + r.performance_summary.mvp_probability_pct + '%\n\n';
  s += '【Combat Analysis】\n';
  s += '  K/D/A: ' + r.combat_analysis.kills + '/' + r.combat_analysis.deaths + '/' + r.combat_analysis.assists + ' | KP: ' + r.combat_analysis.kill_participation_pct + '%\n';
  s += '  DPM: ' + r.combat_analysis.damage_per_min + ' | DMG Share: ' + r.combat_analysis.damage_share_pct + '%\n\n';
  s += '【Macro Analysis】\n';
  s += '  CS/min: ' + r.macro_analysis.cs_per_min + ' | GPM: ' + r.macro_analysis.gold_per_min + ' | Gold@15: ' + r.macro_analysis.gold_diff_at_15 + '\n';
  s += '  Map Control: ' + r.macro_analysis.map_control_pct + '% | Ward Score: ' + r.macro_analysis.ward_score + '\n\n';
  s += '【Teamfight Metrics】\n';
  s += '  Teamfights: ' + r.teamfight_metrics.teamfights_participated + ' | Win Rate: ' + r.teamfight_metrics.teamfight_win_rate_pct + '%\n';
  s += '  Avg Damage: ' + r.teamfight_metrics.avg_teamfight_damage + ' | Clutch Plays: ' + r.teamfight_metrics.clutch_plays + '\n\n';
  s += '【Laning Phase】\n';
  s += '  CS Diff@10: ' + r.laning_phase.cs_diff_at_10 + ' | XP Diff@10: ' + r.laning_phase.xp_diff_at_10 + '\n';
  s += '  Lane Dominance: ' + r.laning_phase.lane_dominance_score + '/100 | Roam: ' + r.laning_phase.roam_effectiveness_pct + '%\n\n';
  s += '【Itemization】\n';
  s += '  Build Efficiency: ' + r.itemization_analysis.build_efficiency_pct + '% | Gold Efficiency: ' + r.itemization_analysis.gold_efficiency_pct + '%\n';
  s += '  Power Spike: ' + r.itemization_analysis.power_spike_timing + ' | Adaptability: ' + r.itemization_analysis.item_adaptability_score + '/100\n';
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// 8. training_load_manager
// ============================================================
export interface TrainingLoadInput {
  athlete_name?: string;
  sport_type?: string;
  training_phase?: string;
  hr_avg?: number;
  rpe_score?: number;
  sleep_hours?: number;
}

export interface TrainingLoadResult {
  load_assessment: { current_load_status: string; acute_chronic_ratio: number; training_monotony: number; strain_index: number; fitness_index: number; fatigue_index: number };
  daily_recommendations: Array<{ day: string; session_type: string; duration_min: number; intensity: string; target_hr_zone: string; focus: string }>;
  periodization_plan: { current_phase: string; phase_weeks_remaining: number; next_phase: string; transition_strategy: string; volume_adjustment_pct: number; intensity_adjustment_pct: number };
  recovery_protocol: { sleep_target_hours: number; nutrition_focus: string; active_recovery_sessions: number; mobility_work_min: number; cold_water_immersion: string; massage_frequency: string };
  physiological_markers: { resting_hr_trend: string; hrv_status: string; lactate_threshold_est: number; vo2max_estimate: number; body_composition_trend: string; hydration_status: string };
  risk_flags: Array<{ flag: string; severity: string; metric: string; threshold: string; current_value: string; action: string }>;
  disclaimer: string;
}

function analyzeTrainingLoad(data: TrainingLoadInput): TrainingLoadResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const sport = data.sport_type || pick(rng, ['swimming', 'running', 'cycling', 'triathlon', 'football']);
  const phase = data.training_phase || pick(rng, ['base', 'build', 'peak', 'taper', 'competition', 'recovery']);
  const hr = data.hr_avg ?? Math.round(120 + rng() * 50);
  const rpe = data.rpe_score ?? round(3 + rng() * 6, 1);
  const sleep = data.sleep_hours ?? round(5.5 + rng() * 3, 1);

  const acr = round(0.7 + rng() * 0.8, 2);
  const monotony = round(1.0 + rng() * 1.5, 2);
  const strain = round(1500 + rng() * 4500, 0);
  const fitnessIdx = round(60 + rng() * 35, 1);
  const fatigueIdx = round(20 + rng() * 60, 1);
  const loadStatus = acr > 1.3 ? 'overreaching' : acr > 1.1 ? 'overloading' : acr > 0.8 ? 'optimal' : 'undertraining';

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sessionTypes = ['endurance', 'interval', 'recovery', 'strength', 'technique', 'race_simulation', 'rest'];
  const intensities = ['low', 'moderate', 'high', 'race_pace'];
  const hrZones = ['Zone 1 (50-60% HRmax)', 'Zone 2 (60-70% HRmax)', 'Zone 3 (70-80% HRmax)', 'Zone 4 (80-90% HRmax)', 'Zone 5 (90-100% HRmax)'];

  const dailyRecs = days.map(day => ({
    day,
    session_type: pick(rng, sessionTypes),
    duration_min: Math.round(30 + rng() * 90),
    intensity: pick(rng, intensities),
    target_hr_zone: pick(rng, hrZones),
    focus: pick(rng, ['aerobic_base', 'lactate_threshold', 'vo2max', 'speed_endurance', 'recovery', 'power', 'tactics']),
  }));

  const phaseWeeks = Math.round(2 + rng() * 6);
  const nextPhase = phase === 'base' ? 'build' : phase === 'build' ? 'peak' : phase === 'peak' ? 'taper' : phase === 'taper' ? 'competition' : phase === 'competition' ? 'recovery' : 'base';
  const volAdj = round(-20 + rng() * 40, 0);
  const intAdj = round(-10 + rng() * 25, 0);

  const sleepTarget = round(7 + rng() * 2, 1);
  const activeRecovery = Math.round(1 + rng() * 3);
  const mobilityMin = Math.round(10 + rng() * 30);
  const nutritionFocus = pick(rng, ['carb_loading', 'protein_recovery', 'hydration_focus', 'anti_inflammatory', 'energy_balance']);

  const restingHrTrend = pick(rng, ['decreasing', 'stable', 'increasing']);
  const hrvStatus = pick(rng, ['parasympathetic_dominant', 'balanced', 'sympathetic_dominant']);
  const lactateThreshold = round(3.5 + rng() * 1.5, 1);
  const vo2max = round(45 + rng() * 25, 1);
  const bodyCompTrend = pick(rng, ['improving', 'stable', 'concerning']);
  const hydration = pick(rng, ['optimal', 'mild_dehydration', 'needs_attention']);

  const riskFlags = [];
  if (acr > 1.3) riskFlags.push({ flag: 'acute_overload', severity: 'high', metric: 'ACR', threshold: '>1.3', current_value: String(acr), action: 'Reduce volume 30% for 3 days' });
  if (rpe > 7) riskFlags.push({ flag: 'excessive_rpe', severity: 'medium', metric: 'RPE', threshold: '>7', current_value: String(rpe), action: 'Monitor recovery markers, consider rest day' });
  if (sleep < 7) riskFlags.push({ flag: 'sleep_debt', severity: 'medium', metric: 'Sleep', threshold: '<7h', current_value: String(sleep) + 'h', action: 'Implement sleep hygiene protocol' });
  if (monotony > 2.0) riskFlags.push({ flag: 'training_monotony', severity: 'low', metric: 'Monotony', threshold: '>2.0', current_value: String(monotony), action: 'Introduce session variety' });
  if (riskFlags.length === 0) riskFlags.push({ flag: 'none', severity: 'low', metric: 'all', threshold: 'normal', current_value: 'within_range', action: 'Continue current plan' });

  return {
    load_assessment: { current_load_status: loadStatus, acute_chronic_ratio: acr, training_monotony: monotony, strain_index: strain, fitness_index: fitnessIdx, fatigue_index: fatigueIdx },
    daily_recommendations: dailyRecs,
    periodization_plan: { current_phase: phase, phase_weeks_remaining: phaseWeeks, next_phase: nextPhase, transition_strategy: phase === 'taper' ? 'Reduce volume 40-60%, maintain intensity' : phase === 'peak' ? 'Maintain high intensity, monitor fatigue' : 'Progressive overload with planned recovery weeks', volume_adjustment_pct: volAdj, intensity_adjustment_pct: intAdj },
    recovery_protocol: { sleep_target_hours: sleepTarget, nutrition_focus: nutritionFocus, active_recovery_sessions: activeRecovery, mobility_work_min: mobilityMin, cold_water_immersion: pick(rng, ['post_high_intensity', 'daily', 'not_recommended']), massage_frequency: pick(rng, ['weekly', 'bi_weekly', 'post_session', 'as_needed']) },
    physiological_markers: { resting_hr_trend: restingHrTrend, hrv_status: hrvStatus, lactate_threshold_est: lactateThreshold, vo2max_estimate: vo2max, body_composition_trend: bodyCompTrend, hydration_status: hydration },
    risk_flags: riskFlags,
    disclaimer: DISCLAIMER,
  };
}

function formatTrainingLoad(r: TrainingLoadResult): string {
  let s = '=== Sports Analytics -- Training Load Management ===\n\n';
  s += '【Load Assessment】\n';
  s += '  Status: ' + r.load_assessment.current_load_status + ' | ACR: ' + r.load_assessment.acute_chronic_ratio + ' | Monotony: ' + r.load_assessment.training_monotony + '\n';
  s += '  Strain: ' + r.load_assessment.strain_index + ' | Fitness: ' + r.load_assessment.fitness_index + '/100 | Fatigue: ' + r.load_assessment.fatigue_index + '/100\n\n';
  s += '【Daily Recommendations】\n';
  r.daily_recommendations.forEach(d => { s += '  ' + d.day + ': ' + d.session_type + ' (' + d.duration_min + 'min, ' + d.intensity + ') -- ' + d.target_hr_zone + ' | ' + d.focus + '\n'; });
  s += '\n【Periodization Plan】\n';
  s += '  Phase: ' + r.periodization_plan.current_phase + ' (' + r.periodization_plan.phase_weeks_remaining + ' weeks left) -> ' + r.periodization_plan.next_phase + '\n';
  s += '  Volume: ' + r.periodization_plan.volume_adjustment_pct + '% | Intensity: ' + r.periodization_plan.intensity_adjustment_pct + '%\n';
  s += '  Strategy: ' + r.periodization_plan.transition_strategy + '\n\n';
  s += '【Recovery Protocol】\n';
  s += '  Sleep Target: ' + r.recovery_protocol.sleep_target_hours + 'h | Active Recovery: ' + r.recovery_protocol.active_recovery_sessions + 'x/week\n';
  s += '  Mobility: ' + r.recovery_protocol.mobility_work_min + 'min | Nutrition: ' + r.recovery_protocol.nutrition_focus + '\n\n';
  s += '【Physiological Markers】\n';
  s += '  Resting HR: ' + r.physiological_markers.resting_hr_trend + ' | HRV: ' + r.physiological_markers.hrv_status + '\n';
  s += '  Lactate Threshold: ' + r.physiological_markers.lactate_threshold_est + ' mmol/L | VO2max: ' + r.physiological_markers.vo2max_estimate + ' ml/kg/min\n\n';
  s += '【Risk Flags】\n';
  r.risk_flags.forEach(f => { s += '  [' + f.severity + '] ' + f.flag + ': ' + f.current_value + ' (threshold: ' + f.threshold + ') -- ' + f.action + '\n'; });
  s += '\n⚠ ' + r.disclaimer;
  return s;
}

// ============================================================
// Plugin apply -- register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. performance_predictor
  tools.register(defineTool({
    name: 'performance_predictor',
    description: 'AI-driven sports performance prediction -- predicts future match scores, win probabilities, and key performance indicators based on historical data and opponent analysis',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with sport_type, athlete_name, historical_matches, opponent_rank, upcoming_event, training_intensity' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPerformance(analyzePerformance(JSON.parse(args.input_data))); },
  }));

  // 2. injury_risk_assessor
  tools.register(defineTool({
    name: 'injury_risk_assessor',
    description: 'AI injury risk assessment -- evaluates injury risk levels based on training load, physical metrics, and environmental factors with preventive recommendations',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with athlete_name, sport_type, weekly_training_hours, previous_injuries_count, age, body_fat_pct' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatInjury(analyzeInjury(JSON.parse(args.input_data))); },
  }));

  // 3. tactical_analysis_engine
  tools.register(defineTool({
    name: 'tactical_analysis_engine',
    description: 'AI tactical analysis engine -- analyzes tactical effectiveness, key passing routes, and offensive/defensive efficiency based on match data and opponent formation',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with team_name, opponent_formation, match_context, possession_pct, recent_matches' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTactical(analyzeTactical(JSON.parse(args.input_data))); },
  }));

  // 4. player_scouting_recommander
  tools.register(defineTool({
    name: 'player_scouting_recommander',
    description: 'AI scouting recommendation system -- filters and recommends promising players based on data performance and technical characteristics matching team needs',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with target_position, budget_range, age_range, league_preference, attributes_weight' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatScouting(analyzeScouting(JSON.parse(args.input_data))); },
  }));

  // 5. fan_engagement_optimizer
  tools.register(defineTool({
    name: 'fan_engagement_optimizer',
    description: 'AI fan engagement optimization -- analyzes fan behavior data to optimize content strategy, interaction plans, and monetization strategies',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with platform, follower_count, avg_engagement_rate, content_category, demographic_target' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatFanEngagement(analyzeFanEngagement(JSON.parse(args.input_data))); },
  }));

  // 6. sports_betting_analytics
  tools.register(defineTool({
    name: 'sports_betting_analytics',
    description: 'AI sports betting analytics -- provides value bet identification and odds analysis based on odds data, historical matchups, and statistical models',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with sport_type, league_name, match_id, bankroll, risk_tolerance' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatBetting(analyzeBetting(JSON.parse(args.input_data))); },
  }));

  // 7. esports_performance_analyzer
  tools.register(defineTool({
    name: 'esports_performance_analyzer',
    description: 'AI esports performance analysis -- analyzes player operational efficiency, map control, and teamfight contribution based on in-game data',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with game_title, player_name, match_duration_min, role, tournament_tier' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatEsports(analyzeEsports(JSON.parse(args.input_data))); },
  }));

  // 8. training_load_manager
  tools.register(defineTool({
    name: 'training_load_manager',
    description: 'AI training load management -- optimizes training load distribution, recovery cycles, and competitive state adjustment based on physiological data and training plans',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with athlete_name, sport_type, training_phase, hr_avg, rpe_score, sleep_hours' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatTrainingLoad(analyzeTrainingLoad(JSON.parse(args.input_data))); },
  }));
}
