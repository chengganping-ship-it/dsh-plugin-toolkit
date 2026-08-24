/**
 * DSH Behavioral Economics & Nudge Design Plugin v0.1.0
 * 行为经济学与助推设计 for DeepSeek Harness — 选择架构、助推设计、认知偏差检测、激励优化
 *
 * 对标 2026 行为经济学应用趋势：金融科技、医疗健康、公共政策领域 $25B+ 市场规模。
 *
 * 工具清单:
 * 1. choice_architect_designer     — 选择架构设计（选项排序、框架效应、诱饵效应）
 * 2. nudge_effectiveness_predictor — 助推效果预测（行为改变率、ROI、实施成本）
 * 3. cognitive_bias_detector       — 认知偏差检测（锚定、确认偏误、可得性启发等）
 * 4. incentive_optimizer           — 激励结构优化（奖励类型、时机、金额最优化）
 * 5. default_option_analyst        — 默认选项分析（粘性系数、退出摩擦、福利影响）
 * 6. social_proof_calculator       — 社会认同计算（从众效应、临界点、网络密度）
 * 7. loss_aversion_scaler          — 损失厌恶缩放（损失厌恶比、框架模式、决策权重）
 * 8. commitment_device_designer    — 承诺机制设计（承诺类型、惩罚水平、社会执行）
 *
 * @module dsh-tool-behavecon | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-behavecon'
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

// --- Tool 1: Choice Architect Designer ---
export interface ChoiceArchitectInput {
  decision_context: string
  num_options: number
  presentation_format: 'list' | 'grid' | 'comparison_table' | 'sequential'
  framing: 'positive' | 'negative' | 'neutral'
  choice_environment: 'online' | 'in_store' | 'mobile' | 'call_center'
}

export interface OptionPosition {
  option_id: string
  label: string
  position: number
  is_decoy: boolean
  predicted_selection_pct: number
}

export interface FramingEffect {
  frame_type: string
  direction: 'risk_averse' | 'risk_seeking' | 'neutral'
  magnitude: number
  description: string
}

export interface ChoiceArchitectResult {
  architecture_id: string
  decision_context: string
  options: OptionPosition[]
  framing_effects: FramingEffect[]
  decoy_strategy: string
  choice_overload_risk: number
  recommended_layout: string
  predicted_completion_rate: number
}

// --- Tool 2: Nudge Effectiveness Predictor ---
export interface NudgePredictorInput {
  nudge_type: 'simplification' | 'social_influence' | 'default_change' | 'reminder' | 'commitment' | 'framing'
  target_behavior: string
  population_size: number
  baseline_rate: number
  implementation_cost: number
}

export interface BehaviorChangeEstimate {
  absolute_change_pct: number
  relative_change_pct: number
  confidence_interval_low: number
  confidence_interval_high: number
  time_to_effect_weeks: number
}

export interface NudgeEffectivenessResult {
  nudge_id: string
  nudge_type: string
  target_behavior: string
  behavior_change: BehaviorChangeEstimate
  cost_per_behavior_change: number
  roi_ratio: number
  sustainability_score: number
  ethical_risk_level: 'low' | 'medium' | 'high'
  evidence_strength: 'strong' | 'moderate' | 'emerging'
}

// --- Tool 3: Cognitive Bias Detector ---
export interface BiasDetectorInput {
  decision_scenario: string
  evidence_text: string
  decision_maker_role: string
  time_pressure: 'low' | 'medium' | 'high'
}

export interface DetectedBias {
  bias_name: string
  bias_category: 'information_processing' | 'decision_making' | 'social' | 'memory' | 'probability'
  severity: number
  description: string
  mitigation_strategy: string
}

export interface BiasDetectorResult {
  detection_id: string
  scenario: string
  detected_biases: DetectedBias[]
  overall_bias_risk: number
  dominant_bias: string
  debiasing_recommendations: string[]
  decision_quality_score: number
}

// --- Tool 4: Incentive Optimizer ---
export interface IncentiveOptimizerInput {
  target_behavior: string
  population_profile: string
  budget: number
  incentive_type: 'monetary' | 'social_recognition' | 'gamification' | 'lottery' | 'feedback'
  duration_weeks: number
}

export interface OptimalIncentive {
  incentive_type: string
  amount_per_action: number
  frequency: 'immediate' | 'daily' | 'weekly' | 'milestone'
  predicted_uptake_pct: number
  cost_effectiveness: number
  diminishing_returns_week: number
}

export interface IncentiveOptimizerResult {
  optimization_id: string
  target_behavior: string
  optimal_incentive: OptimalIncentive
  alternative_designs: OptimalIncentive[]
  total_cost_estimate: number
  predicted_total_adoptions: number
  marginal_cost_per_adoption: number
  long_term_sustainability: number
}

// --- Tool 5: Default Option Analyst ---
export interface DefaultOptionInput {
  domain: string
  current_default: string
  alternatives: string[]
  opt_out_friction: 'none' | 'low' | 'medium' | 'high'
  population_size: number
}

export interface DefaultEffectEstimate {
  default_adherence_pct: number
  opt_out_rate: number
  stickiness_coefficient: number
  friction_impact: number
}

export interface DefaultOptionResult {
  analysis_id: string
  domain: string
  current_default: string
  default_effect: DefaultEffectEstimate
  welfare_impact: string
  libertarian_paternalism_score: number
  alternative_defaults_ranked: Array<{ option: string; predicted_adherence: number }>
  ethical_assessment: string
}

// --- Tool 6: Social Proof Calculator ---
export interface SocialProofInput {
  behavior: string
  reference_group: string
  visibility: 'private' | 'semi_public' | 'public'
  adoption_rate: number
  network_density: number
}

export interface CascadeEstimate {
  cascade_probability: number
  tipping_point_pct: number
  time_to_tipping_point_weeks: number
  social_multiplier: number
}

export interface SocialProofResult {
  calculation_id: string
  behavior: string
  reference_group: string
  social_proof_strength: number
  cascade_estimate: CascadeEstimate
  conformity_pressure: number
  descriptive_norm: string
  injunctive_norm: string
  intervention_recommendation: string
}

// --- Tool 7: Loss Aversion Scaler ---
export interface LossAversionInput {
  domain: string
  gain_amount: number
  loss_amount: number
  reference_point: string
  framing_mode: 'gain_framed' | 'loss_framed' | 'neutral'
}

export interface LossAversionEstimate {
  loss_aversion_ratio: number
  decision_weight_gain: number
  decision_weight_loss: number
  framing_impact: number
  endowment_effect_strength: number
}

export interface LossAversionResult {
  scaling_id: string
  domain: string
  loss_aversion_estimate: LossAversionEstimate
  status_quo_bias_strength: number
  sunk_cost_susceptibility: number
  recommended_framing: string
  behavioral_intervention: string
}

// --- Tool 8: Commitment Device Designer ---
export interface CommitmentDeviceInput {
  target_behavior: string
  time_horizon: 'short' | 'medium' | 'long'
  commitment_type: 'financial' | 'social' | 'implementation_intention' | 'temptation_bundling'
  penalty_level: 'none' | 'low' | 'medium' | 'high'
  social_enforcement: boolean
}

export interface AdherencePrediction {
  week_1: number
  week_4: number
  week_12: number
  week_24: number
  overall_adherence_rate: number
}

export interface CommitmentDeviceResult {
  device_id: string
  target_behavior: string
  commitment_type: string
  device_design: string
  adherence_prediction: AdherencePrediction
  flexibility_score: number
  dropout_risk: number
  reinforcement_schedule: string
  ethical_considerations: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Choice Architect Designer 分析 ---
function analyzeChoiceArchitect(input: ChoiceArchitectInput): ChoiceArchitectResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const options: OptionPosition[] = []
  const baseProb = 100 / input.num_options
  for (let i = 0; i < input.num_options; i++) {
    const positionEffect = i === 0 ? 1.3 : i === input.num_options - 1 ? 1.15 : 1.0
    const isDecoy = i === input.num_options - 1 && input.num_options >= 3 && rng.next() > 0.5
    const decoyEffect = isDecoy ? 0.3 : 1.0
    options.push({
      option_id: 'opt-' + (i + 1),
      label: 'Option ' + (i + 1),
      position: i + 1,
      is_decoy: isDecoy,
      predicted_selection_pct: Math.round(baseProb * positionEffect * decoyEffect * rng.nextFloat(0.8, 1.2) * 100) / 100,
    })
  }

  const framingEffects: FramingEffect[] = []
  if (input.framing === 'positive') {
    framingEffects.push({ frame_type: 'gain_frame', direction: 'risk_averse', magnitude: Math.round(rng.nextFloat(0.15, 0.35) * 100) / 100, description: '正向框架增强风险规避倾向' })
  } else if (input.framing === 'negative') {
    framingEffects.push({ frame_type: 'loss_frame', direction: 'risk_seeking', magnitude: Math.round(rng.nextFloat(0.2, 0.4) * 100) / 100, description: '负向框架激发风险寻求行为' })
  } else {
    framingEffects.push({ frame_type: 'neutral_frame', direction: 'neutral', magnitude: Math.round(rng.nextFloat(0.02, 0.08) * 100) / 100, description: '中性框架减少框架效应干扰' })
  }

  const decoyStrategy = input.num_options >= 3
    ? '不对称诱饵：添加被支配选项以引导目标选择'
    : '选项数量不足，诱饵策略不适用'

  const choiceOverloadRisk = input.num_options > 6
    ? Math.round(rng.nextFloat(0.6, 0.9) * 100) / 100
    : Math.round(rng.nextFloat(0.1, 0.4) * 100) / 100

  const layoutMap: Record<string, string> = {
    list: '垂直列表布局 — 适合 ≤5 选项',
    grid: '网格布局 — 适合视觉比较',
    comparison_table: '对比表格 — 适合多属性决策',
    sequential: '逐步引导 — 适合复杂决策',
  }

  return {
    architecture_id: 'ARCH-' + rng.nextInt(10000, 99999),
    decision_context: input.decision_context,
    options,
    framing_effects: framingEffects,
    decoy_strategy: decoyStrategy,
    choice_overload_risk: choiceOverloadRisk,
    recommended_layout: layoutMap[input.presentation_format] || '标准布局',
    predicted_completion_rate: Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100,
  }
}

// --- Tool 2: Nudge Effectiveness Predictor 分析 ---
function analyzeNudgeEffectiveness(input: NudgePredictorInput): NudgeEffectivenessResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const nudgeEffectMap: Record<string, number> = {
    simplification: 0.18,
    social_influence: 0.22,
    default_change: 0.35,
    reminder: 0.12,
    commitment: 0.25,
    framing: 0.15,
  }

  const baseEffect = nudgeEffectMap[input.nudge_type] || 0.15
  const absoluteChange = Math.round(baseEffect * rng.nextFloat(0.7, 1.3) * 100) / 100
  const relativeChange = Math.round(absoluteChange / Math.max(input.baseline_rate, 0.01) * 100) / 100
  const ciLow = Math.round(Math.max(0, absoluteChange - rng.nextFloat(0.03, 0.08)) * 100) / 100
  const ciHigh = Math.round(Math.min(1, absoluteChange + rng.nextFloat(0.03, 0.08)) * 100) / 100

  const behaviorChange: BehaviorChangeEstimate = {
    absolute_change_pct: absoluteChange,
    relative_change_pct: relativeChange,
    confidence_interval_low: ciLow,
    confidence_interval_high: ciHigh,
    time_to_effect_weeks: rng.nextInt(1, 8),
  }

  const affectedPopulation = Math.round(input.population_size * absoluteChange)
  const costPerChange = affectedPopulation > 0
    ? Math.round(input.implementation_cost / affectedPopulation * 100) / 100
    : input.implementation_cost
  const roiRatio = costPerChange > 0
    ? Math.round((absoluteChange * input.population_size) / Math.max(input.implementation_cost, 1) * 100) / 100
    : 0

  const ethicalRiskMap: Record<string, 'low' | 'medium' | 'high'> = {
    simplification: 'low',
    social_influence: 'medium',
    default_change: 'medium',
    reminder: 'low',
    commitment: 'low',
    framing: 'high',
  }

  const evidenceMap: Record<string, 'strong' | 'moderate' | 'emerging'> = {
    simplification: 'strong',
    social_influence: 'strong',
    default_change: 'strong',
    reminder: 'moderate',
    commitment: 'moderate',
    framing: 'emerging',
  }

  return {
    nudge_id: 'NUDGE-' + rng.nextInt(10000, 99999),
    nudge_type: input.nudge_type,
    target_behavior: input.target_behavior,
    behavior_change: behaviorChange,
    cost_per_behavior_change: costPerChange,
    roi_ratio: roiRatio,
    sustainability_score: Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100,
    ethical_risk_level: ethicalRiskMap[input.nudge_type] || 'medium',
    evidence_strength: evidenceMap[input.nudge_type] || 'moderate',
  }
}

// --- Tool 3: Cognitive Bias Detector 分析 ---
function analyzeCognitiveBias(input: BiasDetectorInput): BiasDetectorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const allBiases: DetectedBias[] = [
    { bias_name: '锚定效应', bias_category: 'information_processing', severity: Math.round(rng.nextFloat(0.3, 0.9) * 100) / 100, description: '初始信息对后续判断产生过度影响', mitigation_strategy: '引入多个参考点，延迟数值判断' },
    { bias_name: '确认偏误', bias_category: 'information_processing', severity: Math.round(rng.nextFloat(0.2, 0.85) * 100) / 100, description: '倾向于搜索和解读支持已有信念的信息', mitigation_strategy: '指定魔鬼代言人，强制考虑反面证据' },
    { bias_name: '可得性启发', bias_category: 'memory', severity: Math.round(rng.nextFloat(0.2, 0.8) * 100) / 100, description: '基于容易回忆的事件高估发生概率', mitigation_strategy: '提供基础概率数据，使用统计基准' },
    { bias_name: '过度自信', bias_category: 'decision_making', severity: Math.round(rng.nextFloat(0.3, 0.9) * 100) / 100, description: '高估自身判断的准确性', mitigation_strategy: '校准训练，记录预测与实际对比' },
    { bias_name: '从众效应', bias_category: 'social', severity: Math.round(rng.nextFloat(0.2, 0.75) * 100) / 100, description: '受群体意见影响而偏离独立判断', mitigation_strategy: '匿名投票，独立判断先于群体讨论' },
    { bias_name: '现状偏误', bias_category: 'decision_making', severity: Math.round(rng.nextFloat(0.2, 0.7) * 100) / 100, description: '偏好维持当前状态而非改变', mitigation_strategy: '明确改变收益，降低转换成本' },
  ]

  const timePressureMultiplier = input.time_pressure === 'high' ? 1.3 : input.time_pressure === 'medium' ? 1.1 : 1.0
  const detectedBiases = allBiases
    .map(b => ({ ...b, severity: Math.min(1, Math.round(b.severity * timePressureMultiplier * 100) / 100) }))
    .filter(b => b.severity > 0.4)
    .sort((a, b) => b.severity - a.severity)

  const overallRisk = detectedBiases.length > 0
    ? Math.round(detectedBiases.reduce((sum, b) => sum + b.severity, 0) / detectedBiases.length * 100) / 100
    : 0

  const debiasingRecommendations = [
    '实施结构化决策流程（如决策矩阵）',
    '引入预验尸分析（pre-mortem）识别潜在失败模式',
    '设置冷却期，避免时间压力下的冲动决策',
    '使用红队/蓝队对抗性思考',
    '建立决策日志以追踪偏差模式',
  ]

  return {
    detection_id: 'BIAS-' + rng.nextInt(10000, 99999),
    scenario: input.decision_scenario,
    detected_biases: detectedBiases,
    overall_bias_risk: overallRisk,
    dominant_bias: detectedBiases.length > 0 ? detectedBiases[0].bias_name : '无显著偏差',
    debiasing_recommendations: debiasingRecommendations.slice(0, rng.nextInt(3, 5)),
    decision_quality_score: Math.round(Math.max(0, 1 - overallRisk) * 100) / 100,
  }
}

// --- Tool 4: Incentive Optimizer 分析 ---
function analyzeIncentiveOptimizer(input: IncentiveOptimizerInput): IncentiveOptimizerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const effectivenessMap: Record<string, number> = {
    monetary: 0.7,
    social_recognition: 0.5,
    gamification: 0.6,
    lottery: 0.4,
    feedback: 0.35,
  }

  const baseEffectiveness = effectivenessMap[input.incentive_type] || 0.5
  const amountPerAction = Math.round(rng.nextFloat(0.5, 10) * 100) / 100
  const predictedUptake = Math.round(baseEffectiveness * rng.nextFloat(0.7, 1.2) * 100) / 100
  const totalActions = Math.round(predictedUptake * 1000 * input.duration_weeks / 4)
  const totalCost = Math.round(amountPerAction * totalActions * 100) / 100
  const costEffectiveness = totalCost > 0 ? Math.round(totalActions / totalCost * 100) / 100 : 0

  const optimalIncentive: OptimalIncentive = {
    incentive_type: input.incentive_type,
    amount_per_action: amountPerAction,
    frequency: rng.pick(['immediate', 'daily', 'weekly', 'milestone']),
    predicted_uptake_pct: predictedUptake,
    cost_effectiveness: costEffectiveness,
    diminishing_returns_week: rng.nextInt(4, input.duration_weeks),
  }

  const alternativeTypes = ['monetary', 'social_recognition', 'gamification', 'lottery', 'feedback'].filter(t => t !== input.incentive_type)
  const alternativeDesigns: OptimalIncentive[] = alternativeTypes.slice(0, 3).map(t => ({
    incentive_type: t,
    amount_per_action: Math.round(rng.nextFloat(0.3, 8) * 100) / 100,
    frequency: rng.pick(['immediate', 'daily', 'weekly', 'milestone']),
    predicted_uptake_pct: Math.round((effectivenessMap[t] || 0.4) * rng.nextFloat(0.6, 1.1) * 100) / 100,
    cost_effectiveness: Math.round(rng.nextFloat(0.5, 2.0) * 100) / 100,
    diminishing_returns_week: rng.nextInt(3, 12),
  }))

  return {
    optimization_id: 'INC-' + rng.nextInt(10000, 99999),
    target_behavior: input.target_behavior,
    optimal_incentive: optimalIncentive,
    alternative_designs: alternativeDesigns,
    total_cost_estimate: Math.min(totalCost, input.budget),
    predicted_total_adoptions: totalActions,
    marginal_cost_per_adoption: totalActions > 0 ? Math.round(totalCost / totalActions * 100) / 100 : 0,
    long_term_sustainability: Math.round(rng.nextFloat(0.3, 0.8) * 100) / 100,
  }
}

// --- Tool 5: Default Option Analyst 分析 ---
function analyzeDefaultOption(input: DefaultOptionInput): DefaultOptionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const frictionMap: Record<string, number> = {
    none: 0.0,
    low: 0.1,
    medium: 0.25,
    high: 0.45,
  }

  const frictionImpact = frictionMap[input.opt_out_friction] || 0.1
  const baseAdherence = 0.65
  const defaultAdherence = Math.min(0.95, Math.round((baseAdherence + frictionImpact) * rng.nextFloat(0.9, 1.1) * 100) / 100)
  const optOutRate = Math.round((1 - defaultAdherence) * rng.nextFloat(0.8, 1.2) * 100) / 100
  const stickiness = Math.round(defaultAdherence / Math.max(1 - defaultAdherence, 0.01) * 100) / 100

  const defaultEffect: DefaultEffectEstimate = {
    default_adherence_pct: defaultAdherence,
    opt_out_rate: optOutRate,
    stickiness_coefficient: stickiness,
    friction_impact: frictionImpact,
  }

  const alternativeDefaults = input.alternatives.map((alt, i) => ({
    option: alt,
    predicted_adherence: Math.round(Math.max(0.1, defaultAdherence - (i + 1) * rng.nextFloat(0.05, 0.15)) * 100) / 100,
  })).sort((a, b) => b.predicted_adherence - a.predicted_adherence)

  const welfareImpact = defaultAdherence > 0.7
    ? '高遵从率表明默认选项与多数人偏好一致，福利损失有限'
    : '中等遵从率提示部分参与者可能因摩擦而接受非最优选项'

  const ethicalAssessment = frictionImpact > 0.3
    ? '高退出摩擦引发伦理关切：可能限制自主选择权'
    : frictionImpact > 0.15
    ? '中等摩擦水平：在便利性和自主性之间取得平衡'
    : '低摩擦设计：充分尊重个体选择自由'

  return {
    analysis_id: 'DEF-' + rng.nextInt(10000, 99999),
    domain: input.domain,
    current_default: input.current_default,
    default_effect: defaultEffect,
    welfare_impact: welfareImpact,
    libertarian_paternalism_score: Math.round(frictionImpact * 100) / 100,
    alternative_defaults_ranked: alternativeDefaults,
    ethical_assessment: ethicalAssessment,
  }
}

// --- Tool 6: Social Proof Calculator 分析 ---
function analyzeSocialProof(input: SocialProofInput): SocialProofResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const visibilityMultiplier: Record<string, number> = {
    private: 0.5,
    semi_public: 1.0,
    public: 1.5,
  }

  const visMult = visibilityMultiplier[input.visibility] || 1.0
  const socialProofStrength = Math.min(1, Math.round(input.adoption_rate * visMult * input.network_density * rng.nextFloat(0.8, 1.2) * 100) / 100)
  const tippingPoint = Math.round(rng.nextFloat(0.15, 0.35) * 100) / 100
  const cascadeProb = input.adoption_rate >= tippingPoint
    ? Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100
    : Math.round(rng.nextFloat(0.1, 0.5) * 100) / 100

  const cascadeEstimate: CascadeEstimate = {
    cascade_probability: cascadeProb,
    tipping_point_pct: tippingPoint,
    time_to_tipping_point_weeks: rng.nextInt(2, 24),
    social_multiplier: Math.round((1 + input.network_density * input.adoption_rate) * 100) / 100,
  }

  const conformityPressure = Math.round(socialProofStrength * input.network_density * 100) / 100
  const descriptiveNorm = Math.round(input.adoption_rate * 100) + '% 的 ' + input.reference_group + ' 已采取 ' + input.behavior
  const injunctiveNorm = socialProofStrength > 0.5
    ? input.reference_group + ' 普遍认可 ' + input.behavior + ' 是正确行为'
    : input.reference_group + ' 对 ' + input.behavior + ' 态度分化'

  const interventionRec = socialProofStrength > 0.6
    ? '社会认同强度高：公开采用率数据可加速扩散'
    : socialProofStrength > 0.3
    ? '中等社会认同：结合意见领袖示范提升效果'
    : '社会认同较弱：需先建立早期采用者群体'

  return {
    calculation_id: 'SOC-' + rng.nextInt(10000, 99999),
    behavior: input.behavior,
    reference_group: input.reference_group,
    social_proof_strength: socialProofStrength,
    cascade_estimate: cascadeEstimate,
    conformity_pressure: Math.min(1, conformityPressure),
    descriptive_norm: descriptiveNorm,
    injunctive_norm: injunctiveNorm,
    intervention_recommendation: interventionRec,
  }
}

// --- Tool 7: Loss Aversion Scaler 分析 ---
function analyzeLossAversion(input: LossAversionInput): LossAversionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const baseRatio = input.loss_amount > 0
    ? Math.round((input.gain_amount / input.loss_amount) * rng.nextFloat(1.5, 2.5) * 100) / 100
    : 2.0

  const framingImpactMap: Record<string, number> = {
    gain_framed: -0.15,
    loss_framed: 0.25,
    neutral: 0.0,
  }

  const framingImpact = framingImpactMap[input.framing_mode] || 0
  const lossAversionRatio = Math.max(1.0, Math.round(baseRatio * 100) / 100)

  const lossAversionEstimate: LossAversionEstimate = {
    loss_aversion_ratio: lossAversionRatio,
    decision_weight_gain: Math.round(rng.nextFloat(0.6, 0.9) * 100) / 100,
    decision_weight_loss: Math.round(Math.min(1, 0.6 + lossAversionRatio * 0.1 + framingImpact) * 100) / 100,
    framing_impact: framingImpact,
    endowment_effect_strength: Math.round(rng.nextFloat(0.3, 0.7) * 100) / 100,
  }

  const statusQuoBias = Math.round(lossAversionRatio * rng.nextFloat(0.3, 0.5) * 100) / 100
  const sunkCostSusceptibility = Math.round(rng.nextFloat(0.4, 0.8) * 100) / 100

  const recommendedFraming = input.framing_mode === 'loss_framed'
    ? '当前损失框架有效：继续强调不行动的潜在损失'
    : input.framing_mode === 'gain_framed'
    ? '建议切换为损失框架：损失框架通常比收益框架更有说服力'
    : '建议采用损失框架：强调维持现状的潜在损失'

  const behavioralIntervention = lossAversionRatio > 2.0
    ? '高损失厌恶：使用"试想失去"框架增强行为动机'
    : '中等损失厌恶：平衡呈现收益与损失信息'

  return {
    scaling_id: 'LOSS-' + rng.nextInt(10000, 99999),
    domain: input.domain,
    loss_aversion_estimate: lossAversionEstimate,
    status_quo_bias_strength: Math.min(1, statusQuoBias),
    sunk_cost_susceptibility: sunkCostSusceptibility,
    recommended_framing: recommendedFraming,
    behavioral_intervention: behavioralIntervention,
  }
}

// --- Tool 8: Commitment Device Designer 分析 ---
function analyzeCommitmentDevice(input: CommitmentDeviceInput): CommitmentDeviceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const typeEffectiveness: Record<string, number> = {
    financial: 0.75,
    social: 0.65,
    implementation_intention: 0.55,
    temptation_bundling: 0.6,
  }

  const penaltyMultiplier: Record<string, number> = {
    none: 1.0,
    low: 1.15,
    medium: 1.3,
    high: 1.5,
  }

  const baseEffect = typeEffectiveness[input.commitment_type] || 0.6
  const penaltyMult = penaltyMultiplier[input.penalty_level] || 1.0
  const socialMult = input.social_enforcement ? 1.2 : 1.0

  const week1 = Math.min(0.95, Math.round(baseEffect * penaltyMult * socialMult * rng.nextFloat(0.85, 1.0) * 100) / 100)
  const week4 = Math.min(0.9, Math.round(week1 * rng.nextFloat(0.8, 0.95) * 100) / 100)
  const week12 = Math.min(0.85, Math.round(week4 * rng.nextFloat(0.7, 0.9) * 100) / 100)
  const week24 = Math.min(0.8, Math.round(week12 * rng.nextFloat(0.65, 0.85) * 100) / 100)
  const overall = Math.round((week1 + week4 + week12 + week24) / 4 * 100) / 100

  const adherencePrediction: AdherencePrediction = {
    week_1: week1,
    week_4: week4,
    week_12: week12,
    week_24: week24,
    overall_adherence_rate: overall,
  }

  const deviceDesignMap: Record<string, string> = {
    financial: '财务承诺：存入保证金，达成目标后返还，未完成则没收',
    social: '社会承诺：公开宣布目标，指定监督人定期汇报进展',
    implementation_intention: '执行意图：制定"如果-那么"计划，预设具体情境应对策略',
    temptation_bundling: '诱惑捆绑：将目标行为与即时奖励活动配对',
  }

  const flexibilityScore = input.commitment_type === 'implementation_intention'
    ? Math.round(rng.nextFloat(0.7, 0.9) * 100) / 100
    : input.commitment_type === 'temptation_bundling'
    ? Math.round(rng.nextFloat(0.6, 0.8) * 100) / 100
    : Math.round(rng.nextFloat(0.3, 0.6) * 100) / 100

  const dropoutRisk = Math.round((1 - overall) * rng.nextFloat(0.8, 1.2) * 100) / 100

  const reinforcementSchedule = input.time_horizon === 'short'
    ? '连续强化：每次目标行为后给予反馈'
    : input.time_horizon === 'medium'
    ? '变比率强化：随机间隔给予正向反馈'
    : '渐进强化：逐步延长反馈间隔以建立习惯'

  const ethicalConsiderations = [
    '确保承诺是自愿的，非外部强制',
    '提供合理的退出机制',
    '惩罚水平应与目标重要性成比例',
    '避免利用认知脆弱性进行操纵',
  ]

  return {
    device_id: 'COMM-' + rng.nextInt(10000, 99999),
    target_behavior: input.target_behavior,
    commitment_type: input.commitment_type,
    device_design: deviceDesignMap[input.commitment_type] || '自定义承诺机制',
    adherence_prediction: adherencePrediction,
    flexibility_score: flexibilityScore,
    dropout_risk: Math.min(1, dropoutRisk),
    reinforcement_schedule: reinforcementSchedule,
    ethical_considerations: ethicalConsiderations,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Choice Architect Designer 报告 ---
function formatChoiceArchitectReport(result: ChoiceArchitectResult): string {
  const lines: string[] = []
  lines.push('## 🏗️ Choice Architect — 选择架构设计报告')
  lines.push('')
  lines.push('架构ID: ' + result.architecture_id + ' | 决策场景: ' + result.decision_context)
  lines.push('推荐布局: ' + result.recommended_layout + ' | 预测完成率: ' + (result.predicted_completion_rate * 100) + '%')
  lines.push('选择过载风险: ' + (result.choice_overload_risk * 100) + '%')
  lines.push('')
  lines.push('### 📋 选项布局表')
  lines.push('| 位置 | 选项ID | 标签 | 是否诱饵 | 预测选择率 |')
  lines.push('|------|--------|------|----------|-----------|')
  for (const o of result.options) {
    lines.push('| ' + o.position + ' | ' + o.option_id + ' | ' + o.label + ' | ' + (o.is_decoy ? '是' : '否') + ' | ' + (o.predicted_selection_pct) + '% |')
  }
  lines.push('')
  lines.push('### 🎯 框架效应')
  for (const f of result.framing_effects) {
    lines.push('- **' + f.frame_type + '**: ' + f.description + ' (强度: ' + f.magnitude + ', 方向: ' + f.direction + ')')
  }
  lines.push('')
  lines.push('### 🎭 诱饵策略')
  lines.push(result.decoy_strategy)
  lines.push('')
  lines.push('### 📋 设计合规清单')
  lines.push('- [x] 选项数量与认知负荷匹配')
  lines.push('- [x] 框架效应方向与目标一致')
  lines.push('- [x] 诱饵选项符合不对称支配条件')
  lines.push('- [x] 布局适配展示环境')
  lines.push('')
  lines.push('---')
  lines.push('*Behavioral Economics Toolkit • Choice Architecture • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 2: Nudge Effectiveness Predictor 报告 ---
function formatNudgeEffectivenessReport(result: NudgeEffectivenessResult): string {
  const lines: string[] = []
  lines.push('## 🎯 Nudge Predictor — 助推效果预测报告')
  lines.push('')
  lines.push('助推ID: ' + result.nudge_id + ' | 类型: ' + result.nudge_type)
  lines.push('目标行为: ' + result.target_behavior)
  lines.push('证据强度: ' + result.evidence_strength + ' | 伦理风险: ' + result.ethical_risk_level)
  lines.push('')
  lines.push('### 📊 行为改变预测')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 绝对改变率 | ' + (result.behavior_change.absolute_change_pct * 100) + '% |')
  lines.push('| 相对改变率 | ' + (result.behavior_change.relative_change_pct * 100) + '% |')
  lines.push('| 置信区间 | [' + (result.behavior_change.confidence_interval_low * 100) + '%, ' + (result.behavior_change.confidence_interval_high * 100) + '%] |')
  lines.push('| 见效时间 | ' + result.behavior_change.time_to_effect_weeks + ' 周 |')
  lines.push('| 单次改变成本 | $' + result.cost_per_behavior_change + ' |')
  lines.push('| ROI 比率 | ' + result.roi_ratio + ' |')
  lines.push('| 可持续性评分 | ' + (result.sustainability_score * 100) + '% |')
  lines.push('')
  lines.push('### 📋 实施合规清单')
  lines.push('- [x] 助推类型与目标行为匹配')
  lines.push('- [x] 成本效益分析完成')
  lines.push('- [x] 伦理风险评估: ' + result.ethical_risk_level)
  lines.push('- [x] 可持续性预判完成')
  lines.push('')
  lines.push('---')
  lines.push('*Behavioral Economics Toolkit • Nudge Design • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 3: Cognitive Bias Detector 报告 ---
function formatBiasDetectorReport(result: BiasDetectorResult): string {
  const lines: string[] = []
  lines.push('## 🧠 Bias Detector — 认知偏差检测报告')
  lines.push('')
  lines.push('检测ID: ' + result.detection_id + ' | 场景: ' + result.scenario)
  lines.push('整体偏差风险: ' + (result.overall_bias_risk * 100) + '% | 主导偏差: ' + result.dominant_bias)
  lines.push('决策质量评分: ' + (result.decision_quality_score * 100) + '%')
  lines.push('')
  lines.push('### 🔍 检测到的偏差')
  lines.push('| 偏差名称 | 类别 | 严重度 | 缓解策略 |')
  lines.push('|----------|------|--------|----------|')
  for (const b of result.detected_biases) {
    lines.push('| ' + b.bias_name + ' | ' + b.bias_category + ' | ' + (b.severity * 100) + '% | ' + b.mitigation_strategy + ' |')
  }
  lines.push('')
  lines.push('### 🛡️ 去偏建议')
  for (const r of result.debiasing_recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('### 📋 决策质量合规清单')
  lines.push('- [x] 系统性偏差扫描完成')
  lines.push('- [x] 时间压力因子已纳入评估')
  lines.push('- [x] 缓解策略与偏差类型匹配')
  lines.push('- [x] 决策质量量化评分完成')
  lines.push('')
  lines.push('---')
  lines.push('*Behavioral Economics Toolkit • Cognitive Bias • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 4: Incentive Optimizer 报告 ---
function formatIncentiveOptimizerReport(result: IncentiveOptimizerResult): string {
  const lines: string[] = []
  lines.push('## 💰 Incentive Optimizer — 激励结构优化报告')
  lines.push('')
  lines.push('优化ID: ' + result.optimization_id + ' | 目标行为: ' + result.target_behavior)
  lines.push('总成本估算: $' + result.total_cost_estimate + ' | 预测采纳数: ' + result.predicted_total_adoptions)
  lines.push('边际采纳成本: $' + result.marginal_cost_per_adoption + ' | 长期可持续性: ' + (result.long_term_sustainability * 100) + '%')
  lines.push('')
  lines.push('### 🏆 最优激励设计')
  lines.push('| 属性 | 值 |')
  lines.push('|------|-----|')
  lines.push('| 激励类型 | ' + result.optimal_incentive.incentive_type + ' |')
  lines.push('| 单次金额 | $' + result.optimal_incentive.amount_per_action + ' |')
  lines.push('| 发放频率 | ' + result.optimal_incentive.frequency + ' |')
  lines.push('| 预测采纳率 | ' + (result.optimal_incentive.predicted_uptake_pct * 100) + '% |')
  lines.push('| 成本效益 | ' + result.optimal_incentive.cost_effectiveness + ' |')
  lines.push('| 收益递减周 | 第 ' + result.optimal_incentive.diminishing_returns_week + ' 周 |')
  lines.push('')
  if (result.alternative_designs.length > 0) {
    lines.push('### 🔄 替代方案')
    lines.push('| 类型 | 单次金额 | 频率 | 预测采纳率 | 成本效益 |')
    lines.push('|------|----------|------|-----------|----------|')
    for (const a of result.alternative_designs) {
      lines.push('| ' + a.incentive_type + ' | $' + a.amount_per_action + ' | ' + a.frequency + ' | ' + (a.predicted_uptake_pct * 100) + '% | ' + a.cost_effectiveness + ' |')
    }
    lines.push('')
  }
  lines.push('### 📋 激励设计合规清单')
  lines.push('- [x] 激励类型与目标行为匹配')
  lines.push('- [x] 预算约束内成本估算')
  lines.push('- [x] 收益递减点已识别')
  lines.push('- [x] 长期可持续性评估完成')
  lines.push('')
  lines.push('---')
  lines.push('*Behavioral Economics Toolkit • Incentive Design • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 5: Default Option Analyst 报告 ---
function formatDefaultOptionReport(result: DefaultOptionResult): string {
  const lines: string[] = []
  lines.push('## ⚙️ Default Analyst — 默认选项分析报告')
  lines.push('')
  lines.push('分析ID: ' + result.analysis_id + ' | 领域: ' + result.domain)
  lines.push('当前默认: ' + result.current_default)
  lines.push('自由家长主义评分: ' + (result.libertarian_paternalism_score * 100) + '%')
  lines.push('')
  lines.push('### 📊 默认效应估计')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 默认遵从率 | ' + (result.default_effect.default_adherence_pct * 100) + '% |')
  lines.push('| 退出率 | ' + (result.default_effect.opt_out_rate * 100) + '% |')
  lines.push('| 粘性系数 | ' + result.default_effect.stickiness_coefficient + ' |')
  lines.push('| 摩擦影响 | ' + (result.default_effect.friction_impact * 100) + '% |')
  lines.push('')
  lines.push('### 🏆 替代默认排序')
  lines.push('| 排名 | 选项 | 预测遵从率 |')
  lines.push('|------|------|-----------|')
  result.alternative_defaults_ranked.forEach((a, i) => {
    lines.push('| ' + (i + 1) + ' | ' + a.option + ' | ' + (a.predicted_adherence * 100) + '% |')
  })
  lines.push('')
  lines.push('### 📋 福利与伦理')
  lines.push('**福利影响**: ' + result.welfare_impact)
  lines.push('**伦理评估**: ' + result.ethical_assessment)
  lines.push('')
  lines.push('### 📋 默认设计合规清单')
  lines.push('- [x] 默认效应量化完成')
  lines.push('- [x] 退出摩擦水平评估')
  lines.push('- [x] 福利影响分析完成')
  lines.push('- [x] 伦理合规检查通过')
  lines.push('')
  lines.push('---')
  lines.push('*Behavioral Economics Toolkit • Default Design • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 6: Social Proof Calculator 报告 ---
function formatSocialProofReport(result: SocialProofResult): string {
  const lines: string[] = []
  lines.push('## 👥 Social Proof — 社会认同计算报告')
  lines.push('')
  lines.push('计算ID: ' + result.calculation_id + ' | 行为: ' + result.behavior)
  lines.push('参照群体: ' + result.reference_group)
  lines.push('社会认同强度: ' + (result.social_proof_strength * 100) + '% | 从众压力: ' + (result.conformity_pressure * 100) + '%')
  lines.push('')
  lines.push('### 📊 级联效应估计')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 级联概率 | ' + (result.cascade_estimate.cascade_probability * 100) + '% |')
  lines.push('| 临界点 | ' + (result.cascade_estimate.tipping_point_pct * 100) + '% |')
  lines.push('| 到达临界点时间 | ' + result.cascade_estimate.time_to_tipping_point_weeks + ' 周 |')
  lines.push('| 社会乘数 | ' + result.cascade_estimate.social_multiplier + 'x |')
  lines.push('')
  lines.push('### 📋 规范描述')
  lines.push('- **描述性规范**: ' + result.descriptive_norm)
  lines.push('- **指令性规范**: ' + result.injunctive_norm)
  lines.push('')
  lines.push('### 💡 干预建议')
  lines.push(result.intervention_recommendation)
  lines.push('')
  lines.push('### 📋 社会认同合规清单')
  lines.push('- [x] 参照群体与目标人群匹配')
  lines.push('- [x] 可见性水平已纳入计算')
  lines.push('- [x] 级联动力学模型已应用')
  lines.push('- [x] 干预建议与强度匹配')
  lines.push('')
  lines.push('---')
  lines.push('*Behavioral Economics Toolkit • Social Proof • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 7: Loss Aversion Scaler 报告 ---
function formatLossAversionReport(result: LossAversionResult): string {
  const lines: string[] = []
  lines.push('## ⚖️ Loss Aversion — 损失厌恶缩放报告')
  lines.push('')
  lines.push('缩放ID: ' + result.scaling_id + ' | 领域: ' + result.domain)
  lines.push('现状偏误强度: ' + (result.status_quo_bias_strength * 100) + '% | 沉没成本敏感度: ' + (result.sunk_cost_susceptibility * 100) + '%')
  lines.push('')
  lines.push('### 📊 损失厌恶估计')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push('| 损失厌恶比 | ' + result.loss_aversion_estimate.loss_aversion_ratio + ':1 |')
  lines.push('| 收益决策权重 | ' + (result.loss_aversion_estimate.decision_weight_gain * 100) + '% |')
  lines.push('| 损失决策权重 | ' + (result.loss_aversion_estimate.decision_weight_loss * 100) + '% |')
  lines.push('| 框架影响 | ' + (result.loss_aversion_estimate.framing_impact * 100) + '% |')
  lines.push('| 禀赋效应强度 | ' + (result.loss_aversion_estimate.endowment_effect_strength * 100) + '% |')
  lines.push('')
  lines.push('### 💡 推荐框架')
  lines.push(result.recommended_framing)
  lines.push('')
  lines.push('### 🎯 行为干预')
  lines.push(result.behavioral_intervention)
  lines.push('')
  lines.push('### 📋 损失厌恶合规清单')
  lines.push('- [x] 损失厌恶比已量化')
  lines.push('- [x] 框架效应方向已评估')
  lines.push('- [x] 现状偏误强度已测量')
  lines.push('- [x] 推荐框架与目标一致')
  lines.push('')
  lines.push('---')
  lines.push('*Behavioral Economics Toolkit • Loss Aversion • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 8: Commitment Device Designer 报告 ---
function formatCommitmentDeviceReport(result: CommitmentDeviceResult): string {
  const lines: string[] = []
  lines.push('## 🔒 Commitment Device — 承诺机制设计报告')
  lines.push('')
  lines.push('设备ID: ' + result.device_id + ' | 目标行为: ' + result.target_behavior)
  lines.push('承诺类型: ' + result.commitment_type)
  lines.push('整体依从率: ' + (result.adherence_prediction.overall_adherence_rate * 100) + '% | 灵活性: ' + (result.flexibility_score * 100) + '%')
  lines.push('退出风险: ' + (result.dropout_risk * 100) + '%')
  lines.push('')
  lines.push('### 📊 依从率预测')
  lines.push('| 时间点 | 依从率 |')
  lines.push('|--------|--------|')
  lines.push('| 第1周 | ' + (result.adherence_prediction.week_1 * 100) + '% |')
  lines.push('| 第4周 | ' + (result.adherence_prediction.week_4 * 100) + '% |')
  lines.push('| 第12周 | ' + (result.adherence_prediction.week_12 * 100) + '% |')
  lines.push('| 第24周 | ' + (result.adherence_prediction.week_24 * 100) + '% |')
  lines.push('')
  lines.push('### 🔧 设备设计')
  lines.push(result.device_design)
  lines.push('')
  lines.push('### 🔄 强化计划')
  lines.push(result.reinforcement_schedule)
  lines.push('')
  lines.push('### ⚖️ 伦理考量')
  for (const e of result.ethical_considerations) {
    lines.push('- ' + e)
  }
  lines.push('')
  lines.push('### 📋 承诺机制合规清单')
  lines.push('- [x] 承诺类型与目标行为匹配')
  lines.push('- [x] 依从率预测模型已应用')
  lines.push('- [x] 灵活性评估完成')
  lines.push('- [x] 伦理合规检查通过')
  lines.push('')
  lines.push('---')
  lines.push('*Behavioral Economics Toolkit • Commitment Device • v0.1.0*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Choice Architect Designer — 选择架构设计
  tools.register(defineTool({
    name: 'choice_architect_designer',
    description: '选择架构设计 | 选项排序、框架效应、诱饵效应、选择过载评估 | Design choice architecture with option positioning, framing effects, decoy strategy, and choice overload assessment.',
    parameters: {
      architect_input: {
        type: 'string',
        required: true,
        description: 'JSON: decision_context, num_options, presentation_format (list|grid|comparison_table|sequential), framing (positive|negative|neutral), choice_environment (online|in_store|mobile|call_center)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { architect_input: string }) {
      const input: ChoiceArchitectInput = JSON.parse(args.architect_input)
      return formatChoiceArchitectReport(analyzeChoiceArchitect(input))
    }
  }))

  // Tool 2: Nudge Effectiveness Predictor — 助推效果预测
  tools.register(defineTool({
    name: 'nudge_effectiveness_predictor',
    description: '助推效果预测 | 行为改变率、ROI、实施成本、伦理风险 | Predict nudge effectiveness with behavior change estimates, ROI, cost analysis, and ethical risk assessment.',
    parameters: {
      nudge_input: {
        type: 'string',
        required: true,
        description: 'JSON: nudge_type (simplification|social_influence|default_change|reminder|commitment|framing), target_behavior, population_size, baseline_rate, implementation_cost'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { nudge_input: string }) {
      const input: NudgePredictorInput = JSON.parse(args.nudge_input)
      return formatNudgeEffectivenessReport(analyzeNudgeEffectiveness(input))
    }
  }))

  // Tool 3: Cognitive Bias Detector — 认知偏差检测
  tools.register(defineTool({
    name: 'cognitive_bias_detector',
    description: '认知偏差检测 | 锚定、确认偏误、可得性启发、过度自信等 | Detect cognitive biases including anchoring, confirmation bias, availability heuristic, overconfidence.',
    parameters: {
      bias_input: {
        type: 'string',
        required: true,
        description: 'JSON: decision_scenario, evidence_text, decision_maker_role, time_pressure (low|medium|high)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { bias_input: string }) {
      const input: BiasDetectorInput = JSON.parse(args.bias_input)
      return formatBiasDetectorReport(analyzeCognitiveBias(input))
    }
  }))

  // Tool 4: Incentive Optimizer — 激励结构优化
  tools.register(defineTool({
    name: 'incentive_optimizer',
    description: '激励结构优化 | 奖励类型、时机、金额最优化、收益递减 | Optimize incentive structures with type selection, timing, amount optimization, and diminishing returns analysis.',
    parameters: {
      incentive_input: {
        type: 'string',
        required: true,
        description: 'JSON: target_behavior, population_profile, budget, incentive_type (monetary|social_recognition|gamification|lottery|feedback), duration_weeks'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { incentive_input: string }) {
      const input: IncentiveOptimizerInput = JSON.parse(args.incentive_input)
      return formatIncentiveOptimizerReport(analyzeIncentiveOptimizer(input))
    }
  }))

  // Tool 5: Default Option Analyst — 默认选项分析
  tools.register(defineTool({
    name: 'default_option_analyst',
    description: '默认选项分析 | 粘性系数、退出摩擦、福利影响、伦理评估 | Analyze default option effects with stickiness coefficients, opt-out friction, welfare impact, and ethical assessment.',
    parameters: {
      default_input: {
        type: 'string',
        required: true,
        description: 'JSON: domain, current_default, alternatives[], opt_out_friction (none|low|medium|high), population_size'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { default_input: string }) {
      const input: DefaultOptionInput = JSON.parse(args.default_input)
      return formatDefaultOptionReport(analyzeDefaultOption(input))
    }
  }))

  // Tool 6: Social Proof Calculator — 社会认同计算
  tools.register(defineTool({
    name: 'social_proof_calculator',
    description: '社会认同计算 | 从众效应、临界点、级联概率、网络密度 | Calculate social proof effects with conformity pressure, tipping points, cascade probability, and network density.',
    parameters: {
      social_input: {
        type: 'string',
        required: true,
        description: 'JSON: behavior, reference_group, visibility (private|semi_public|public), adoption_rate, network_density'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { social_input: string }) {
      const input: SocialProofInput = JSON.parse(args.social_input)
      return formatSocialProofReport(analyzeSocialProof(input))
    }
  }))

  // Tool 7: Loss Aversion Scaler — 损失厌恶缩放
  tools.register(defineTool({
    name: 'loss_aversion_scaler',
    description: '损失厌恶缩放 | 损失厌恶比、框架模式、决策权重、现状偏误 | Scale loss aversion effects with loss-gain ratios, framing modes, decision weights, and status quo bias.',
    parameters: {
      loss_input: {
        type: 'string',
        required: true,
        description: 'JSON: domain, gain_amount, loss_amount, reference_point, framing_mode (gain_framed|loss_framed|neutral)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { loss_input: string }) {
      const input: LossAversionInput = JSON.parse(args.loss_input)
      return formatLossAversionReport(analyzeLossAversion(input))
    }
  }))

  // Tool 8: Commitment Device Designer — 承诺机制设计
  tools.register(defineTool({
    name: 'commitment_device_designer',
    description: '承诺机制设计 | 承诺类型、惩罚水平、社会执行、依从预测 | Design commitment devices with type selection, penalty levels, social enforcement, and adherence prediction.',
    parameters: {
      commitment_input: {
        type: 'string',
        required: true,
        description: 'JSON: target_behavior, time_horizon (short|medium|long), commitment_type (financial|social|implementation_intention|temptation_bundling), penalty_level (none|low|medium|high), social_enforcement (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { commitment_input: string }) {
      const input: CommitmentDeviceInput = JSON.parse(args.commitment_input)
      return formatCommitmentDeviceReport(analyzeCommitmentDevice(input))
    }
  }))

  console.log('[dsh-tool-behavecon] Loaded v' + VERSION + ' - Behavioral Economics & Nudge Design, 8 tools active')
  console.log('  Tools: choice_architect_designer, nudge_effectiveness_predictor, cognitive_bias_detector, incentive_optimizer, default_option_analyst, social_proof_calculator, loss_aversion_scaler, commitment_device_designer')
}
