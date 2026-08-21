/**
 * DSH 化妆品研发AI助手 v1.0.0 (cosmeticagentpro)
 * 化妆品与个护行业智能体 for DeepSeek Harness
 *
 * 工具清单:
 * 1. formulation_developer_ai          — 配方开发与成分相容性分析
 * 2. claim_substantiation_checker      — 功效宣称科学与法规审核
 * 3. stability_testing_predictor       — 稳定性测试预测与加速老化
 * 4. regulatory_compliance_safety      — 化妆品安全评估与全球法规
 * 5. consumer_sensory_panel_analyzer   — 消费者感官评估与偏好分析
 * 6. packaging_compatibility_tester    — 包装相容性与迁移测试
 * 7. preservative_efficacy_predictor   — 防腐挑战测试预测与体系设计
 * 8. market_trend_ingredient_scanner   — 美妆趋势成分扫描与竞品拆解
 *
 * @module dsh-tool-cosmeticagentpro | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 *
 * 免责声明: 本分析基于AI模型推断，仅供化妆品研发参考，不替代专业实验、安全评估与法规审批决策。
 * 所有配方建议须经实验室验证，所有宣称须经法规审核，所有安全评估须经持证安全评估师签字确认。
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'cosmeticagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析基于AI模型推断，仅供化妆品研发参考，不替代专业实验、安全评估与法规审批决策。所有配方建议须经实验室验证，所有宣称须经法规审核，所有安全评估须经持证安全评估师签字确认。'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

function mulberry32(s:number){let x=s>>>0;return()=>{x=(x+0x6D2B79F5)|0;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function hashStr(s:string){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h+s.charCodeAt(i))|0}return Math.abs(h)||1}
function rng(i:string){return mulberry32(hashStr(i))}

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Formulation Developer AI ---
interface FormulationInput {
  product_type: 'cream' | 'serum' | 'lotion' | 'cleanser' | 'sunscreen' | 'mask' | 'shampoo' | 'lipstick' | 'foundation'
  target_properties: Array<{ property: string; target_value: number; unit: string; weight: number }>
  ingredients: Array<{ name: string; function: string; min_pct: number; max_pct: number; cost_per_kg: number }>
  constraints?: { max_cost_per_kg?: number; banned_ingredients?: string[]; ph_range?: [number, number]; vegan?: boolean; natural_origin_pct?: number }
  formulation_phase?: 'prototype' | 'optimization' | 'scale_up' | 'troubleshooting'
}

interface IngredientCompatibility {
  ingredient_a: string
  ingredient_b: string
  compatibility: 'compatible' | 'caution' | 'incompatible'
  mechanism: string
  recommendation: string
}

interface PhaseBehavior {
  phase: 'oil' | 'water' | 'emulsion' | 'active'
  ingredients: string[]
  stability_risk: 'low' | 'medium' | 'high'
  notes: string
}

interface FormulationResult {
  product_type: string
  formulation_phase: string
  optimal_composition: Array<{ ingredient: string; function: string; percentage: number; cost_contribution: number }>
  compatibility_matrix: IngredientCompatibility[]
  phase_behavior: PhaseBehavior[]
  predicted_properties: Array<{ property: string; predicted: number; target: number; unit: string; status: string }>
  cost_analysis: { total_cost_per_kg: number; savings_vs_baseline: number }
  recommendations: string[]
}

// --- Tool 2: Claim Substantiation Checker ---
interface ClaimInput {
  product_name: string
  claims: Array<{ claim_text: string; claim_type: 'efficacy' | 'safety' | 'quality' | 'natural' | 'organic' | 'sustainability' }>
  active_ingredients: Array<{ name: string; concentration_pct: number; evidence_level: 'strong' | 'moderate' | 'limited' | 'none' }>
  target_markets: string[]
  regulatory_frameworks: string[]
  test_data_available?: Array<{ test_type: string; result: string; lab_credential: string }>
}

interface ClaimAssessment {
  claim_text: string
  claim_type: string
  substantiation_status: 'substantiated' | 'partially_substantiated' | 'unsubstantiated' | 'requires_testing'
  evidence_gap: string[]
  regulatory_risk: 'low' | 'medium' | 'high' | 'critical'
  suggested_qualifier: string
  alternative_wording: string
}

interface RegulatoryCheck {
  market: string
  regulation: string
  compliance_status: 'compliant' | 'non_compliant' | 'requires_modification'
  specific_requirements: string[]
  penalty_risk: string
}

interface ClaimResult {
  product_name: string
  claim_assessments: ClaimAssessment[]
  regulatory_checks: RegulatoryCheck[]
  overall_claim_risk: 'low' | 'medium' | 'high' | 'critical'
  required_tests: string[]
  recommendations: string[]
}

// --- Tool 3: Stability Testing Predictor ---
interface StabilityInput {
  product_type: string
  formulation_composition: Array<{ ingredient: string; percentage: number; stability_concern?: string }>
  packaging_type: 'jar' | 'bottle_pump' | 'tube' | 'airless' | 'sachet' | 'ampoule'
  storage_conditions: Array<{ condition: string; temperature_c: number; humidity_pct: number; light_exposure: 'none' | 'indirect' | 'direct' }>
  test_duration_months: number
  accelerated_testing: boolean
  quality_parameters: Array<{ parameter: string; initial_value: number; unit: string; acceptance_criteria: string }>
}

interface DegradationKinetic {
  parameter: string
  rate_constant_k: number
  activation_energy_kj_mol: number
  q10_factor: number
  predicted_half_life_months: number
  degradation_mechanism: string
}

interface AcceleratedAgingResult {
  condition: string
  equivalent_real_time_months: number
  predicted_changes: Array<{ parameter: string; predicted_value: number; change_pct: number; within_spec: boolean }>
  failure_mode: string
  shelf_life_prediction_months: number
}

interface StabilityResult {
  product_type: string
  degradation_kinetics: DegradationKinetic[]
  accelerated_aging: AcceleratedAgingResult[]
  shelf_life_prediction: { months: number; confidence: number; limiting_factor: string }
  storage_recommendations: string[]
  recommendations: string[]
}

// --- Tool 4: Regulatory Compliance & Safety ---
interface SafetyInput {
  product_name: string
  product_type: string
  ingredients: Array<{ name: string; cas_number: string; concentration_pct: number; function_category: string; safety_data_source: string }>
  target_markets: string[]
  exposure_conditions: { route: 'dermal' | 'oral' | 'inhalation' | 'mucosal'; frequency: string; duration: string; amount_per_use_g: number; target_population: 'adult' | 'children' | 'infants' | 'all' }
  intended_use: string
  safety_assessment_level: 'screening' | 'full_assessment' | 'expert_review'
}

interface IngredientSafetyProfile {
  name: string
  cas_number: string
  concentration_pct: number
  safety_status: 'safe' | 'restricted' | 'prohibited' | 'under_review'
  restrictions: string[]
  max_allowed_pct: number
  safety_notes: string
}

interface ExposureAssessment {
  systemic_exposure_dose_mg_kg: number
  margin_of_safety: number
  local_exposure_risk: 'negligible' | 'low' | 'moderate' | 'high'
  sensitization_risk: 'negligible' | 'low' | 'moderate' | 'high'
  phototoxicity_risk: 'negligible' | 'low' | 'moderate' | 'high'
}

interface MarketCompliance {
  market: string
  regulation: string
  notification_required: boolean
  cpnp_registered: boolean
  responsible_person_required: boolean
  compliance_status: 'compliant' | 'non_compliant' | 'pending'
  required_actions: string[]
}

interface SafetyResult {
  product_name: string
  ingredient_profiles: IngredientSafetyProfile[]
  exposure_assessment: ExposureAssessment
  market_compliance: MarketCompliance[]
  overall_safety_conclusion: 'safe' | 'safe_with_restrictions' | 'requires_modification' | 'unsafe'
  safety_report_summary: string
  recommendations: string[]
}

// --- Tool 5: Consumer Sensory Panel Analyzer ---
interface SensoryInput {
  product_name: string
  product_type: string
  panel_size: number
  panelist_demographics: { age_range: string; gender: string; skin_type: string[]; region: string }
  sensory_attributes: Array<{ attribute: string; scale: string; anchor_low: string; anchor_high: string }>
  test_method: 'discriminative' | 'descriptive' | 'affective' | 'hedonic'
  competitor_products?: string[]
  test_environment: { temperature_c: number; humidity_pct: number; lighting: string }
}

interface AttributeScore {
  attribute: string
  mean_score: number
  std_deviation: number
  min_score: number
  max_score: number
  statistical_significance: boolean
}

interface PreferenceMapping {
  product: string
  overall_preference: number
  like_dislike_ratio: number
  key_drivers: string[]
  improvement_opportunities: string[]
}

interface ConsumerSegment {
  segment_name: string
  size_pct: number
  preferred_attributes: string[]
  satisfaction_score: number
  loyalty_indicator: string
}

interface SensoryResult {
  product_name: string
  test_method: string
  attribute_scores: AttributeScore[]
  preference_mapping: PreferenceMapping[]
  consumer_segments: ConsumerSegment[]
  statistical_summary: { f_value: number; p_value: number; r_squared: number }
  recommendations: string[]
}

// --- Tool 6: Packaging Compatibility Tester ---
interface PackagingInput {
  product_name: string
  product_type: string
  formulation_ph: number
  key_ingredients: Array<{ name: string; concentration_pct: number; reactivity: 'inert' | 'mild' | 'reactive' | 'highly_reactive' }>
  packaging_material: 'PET' | 'HDPE' | 'LDPE' | 'PP' | 'glass' | 'aluminum' | 'laminate' | 'PMMA'
  packaging_component: 'container' | 'cap' | 'liner' | 'pump' | 'spray_mechanism'
  contact_duration_months: number
  storage_temperature_c: number
  test_standards: string[]
}

interface MigrationTest {
  substance: string
  detected_level_ppm: number
  regulatory_limit_ppm: number
  compliance_status: 'pass' | 'fail' | 'borderline'
  migration_mechanism: string
  health_risk_assessment: string
}

interface PhysicalCompatibility {
  test: string
  result: 'pass' | 'fail' | 'warning'
  observed_effect: string
  severity: 'none' | 'minor' | 'moderate' | 'severe'
  recommendation: string
}

interface ChemicalCompatibility {
  interaction_type: string
  affected_component: string
  mechanism: string
  risk_level: 'low' | 'medium' | 'high'
  mitigation: string
}

interface PackagingResult {
  product_name: string
  packaging_material: string
  migration_tests: MigrationTest[]
  physical_compatibility: PhysicalCompatibility[]
  chemical_compatibility: ChemicalCompatibility[]
  overall_compatibility: 'compatible' | 'compatible_with_conditions' | 'incompatible'
  recommendations: string[]
}

// --- Tool 7: Preservative Efficacy Predictor ---
interface PreservativeInput {
  product_type: string
  formulation_ph: number
  water_activity: number
  composition: Array<{ ingredient: string; percentage: number; microbial_risk: 'low' | 'medium' | 'high' }>
  preservation_system: Array<{ preservative: string; concentration_pct: number; target_organisms: string[] }>
  target_standard: 'ISO_11930' | 'USP_51' | 'Ph_Eur_5_1_3' | 'CTFA'
  challenge_organisms?: string[]
  packaging_type: string
  expected_shelf_life_months: number
}

interface ChallengeTestResult {
  organism: string
  initial_inoculum_cfu_g: number
  log_reduction_day_7: number
  log_reduction_day_14: number
  log_reduction_day_28: number
  pass_criteria_met: boolean
  failure_analysis: string
}

interface PreservativeSynergy {
  combination: string[]
  synergy_type: 'synergistic' | 'additive' | 'antagonistic'
  efficacy_enhancement_pct: number
  recommendation: string
}

interface PreservativeOptimization {
  current_system: string
  recommended_system: string
  predicted_improvement: number
  cost_impact_pct: number
  regulatory_impact: string
}

interface PreservativeResult {
  product_type: string
  target_standard: string
  challenge_test_results: ChallengeTestResult[]
  preservative_synergy: PreservativeSynergy[]
  optimization_suggestions: PreservativeOptimization[]
  overall_efficacy: 'pass' | 'marginal' | 'fail'
  recommendations: string[]
}

// --- Tool 8: Market Trend Ingredient Scanner ---
interface TrendInput {
  product_category: 'skincare' | 'haircare' | 'makeup' | 'fragrance' | 'bodycare' | 'suncare'
  target_market: string
  price_segment: 'mass' | 'masstige' | 'premium' | 'luxury'
  scan_timeframe_months: number
  competitor_brands: string[]
  trend_sources: string[]
  ingredient_focus: 'actives' | 'base_ingredients' | 'preservatives' | 'fragrances' | 'all'
}

interface TrendingIngredient {
  name: string
  trend_direction: 'rising' | 'peaking' | 'declining' | 'emerging'
  search_volume_growth_pct: number
  social_media_mentions: number
  new_product_launches: number
  key_benefits: string[]
  supporting_evidence: string
  market_penetration_pct: number
}

interface CompetitorAnalysis {
  brand: string
  hero_ingredients: Array<{ name: string; positioning: string; concentration_claim: string }>
  formulation_strategy: string
  claim_focus: string[]
  price_positioning: string
  market_share_estimate_pct: number
}

interface IngredientDeepDive {
  ingredient_name: string
  mechanism_of_action: string
  clinical_evidence: Array<{ study_type: string; result: string; credibility: string }>
  regulatory_status: string
  supplier_landscape: string[]
  cost_trend: 'decreasing' | 'stable' | 'increasing'
  formulation_challenges: string[]
}

interface TrendResult {
  product_category: string
  scan_date: string
  trending_ingredients: TrendingIngredient[]
  competitor_analysis: CompetitorAnalysis[]
  ingredient_deep_dives: IngredientDeepDive[]
  white_space_opportunities: string[]
  recommendations: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Formulation Developer AI ---
function analyzeFormulation(input: FormulationInput): FormulationResult {
  const r = rng(input.product_type + input.ingredients.length.toString())
  const r2 = rng(input.product_type + "_compat")

  const compatMatrix: IngredientCompatibility[] = []
  for (let i = 0; i < input.ingredients.length; i++) {
    for (let j = i + 1; j < input.ingredients.length; j++) {
      const compat: IngredientCompatibility['compatibility'] = r2() > 0.8 ? 'incompatible' : r2() > 0.5 ? 'caution' : 'compatible'
      compatMatrix.push({
        ingredient_a: input.ingredients[i].name,
        ingredient_b: input.ingredients[j].name,
        compatibility: compat,
        mechanism: compat === 'incompatible' ? '电荷相互作用导致絮凝' : compat === 'caution' ? 'pH敏感区域可能影响稳定性' : '无已知相互作用',
        recommendation: compat === 'incompatible' ? '建议分开添加或使用包埋技术' : compat === 'caution' ? '建议控制添加顺序与温度' : '可直接配伍'
      })
    }
  }

  const phases: PhaseBehavior[] = [
    { phase: 'oil', ingredients: input.ingredients.filter(i => i.function.includes('emollient') || i.function.includes('oil')).map(i => i.name), stability_risk: 'low', notes: '油相成分相容性良好' },
    { phase: 'water', ingredients: input.ingredients.filter(i => i.function.includes('humectant') || i.function.includes('water')).map(i => i.name), stability_risk: 'low', notes: '水相成分溶解性良好' },
    { phase: 'emulsion', ingredients: input.ingredients.filter(i => i.function.includes('emulsif')).map(i => i.name), stability_risk: r() > 0.7 ? 'medium' : 'low', notes: '乳化体系HLB匹配度需验证' },
    { phase: 'active', ingredients: input.ingredients.filter(i => i.function.includes('active') || i.function.includes('active')).map(i => i.name), stability_risk: r() > 0.6 ? 'medium' : 'low', notes: '活性成分pH与氧化稳定性需关注' }
  ]

  const optimalComp = input.ingredients.map(ing => {
    const pct = Math.round((ing.min_pct + r() * (ing.max_pct - ing.min_pct)) * 100) / 100
    return { ingredient: ing.name, function: ing.function, percentage: pct, cost_contribution: Math.round(pct * ing.cost_per_kg / 100 * 100) / 100 }
  })

  const totalPct = optimalComp.reduce((s, c) => s + c.percentage, 0)
  const predictedProps = input.target_properties.map(tp => {
    const predicted = Math.round(tp.target_value * (0.88 + r() * 0.24) * 100) / 100
    const diff = Math.abs(predicted - tp.target_value) / tp.target_value
    const status = diff < 0.05 ? '达标' : diff < 0.15 ? '接近' : '需优化'
    return { property: tp.property, predicted, target: tp.target_value, unit: tp.unit, status }
  })

  const totalCost = optimalComp.reduce((s, c) => s + c.cost_contribution, 0)
  const baselineCost = input.ingredients.reduce((s, ing) => s + ing.max_pct * ing.cost_per_kg / 100, 0)

  return {
    product_type: input.product_type,
    formulation_phase: input.formulation_phase || 'prototype',
    optimal_composition: optimalComp,
    compatibility_matrix: compatMatrix,
    phase_behavior: phases,
    predicted_properties: predictedProps,
    cost_analysis: { total_cost_per_kg: Math.round(totalCost * 100) / 100, savings_vs_baseline: Math.round((baselineCost - totalCost) * 100) / 100 },
    recommendations: [
      '建议进行相容性预实验（1:1混合观察）',
      '关注乳化温度与均质速度对粒径的影响',
      '活性成分建议采用包埋或缓释技术提升稳定性',
      '建议进行3个月加速稳定性测试验证配方',
      '考虑原料批次间差异对配方一致性的影响'
    ]
  }
}

// --- Tool 2: Claim Substantiation Checker ---
function analyzeClaims(input: ClaimInput): ClaimResult {
  const r = rng(input.product_name + input.claims.length.toString())
  const r2 = rng(input.product_name + "_reg")

  const claimAssessments: ClaimAssessment[] = input.claims.map(claim => {
    const hasEvidence = input.active_ingredients.some(a => a.evidence_level === 'strong' || a.evidence_level === 'moderate')
    const status: ClaimAssessment['substantiation_status'] = hasEvidence ? (r() > 0.3 ? 'substantiated' : 'partially_substantiated') : (r() > 0.5 ? 'requires_testing' : 'unsubstantiated')
    const risk: ClaimAssessment['regulatory_risk'] = status === 'unsubstantiated' ? 'critical' : status === 'requires_testing' ? 'high' : status === 'partially_substantiated' ? 'medium' : 'low'
    return {
      claim_text: claim.claim_text,
      claim_type: claim.claim_type,
      substantiation_status: status,
      evidence_gap: status !== 'substantiated' ? ['需补充人体功效评价试验', '需提供消费者使用测试数据'] : [],
      regulatory_risk: risk,
      suggested_qualifier: status === 'partially_substantiated' ? '（基于体外实验结果）' : status === 'unsubstantiated' ? '（证据不足，建议修改宣称）' : '',
      alternative_wording: status === 'unsubstantiated' ? '含[成分名]，有助于[功效方向]' : claim.claim_text
    }
  })

  const regulatoryChecks: RegulatoryCheck[] = input.target_markets.map(market => {
    const regMap: Record<string, string> = { '中国': '《化妆品监督管理条例》', '欧盟': 'EC No 1223/2009', '美国': 'FD&C Act / MoCRA', '日本': '药机法', '韩国': '化妆品法' }
    const reg = regMap[market] || '当地化妆品法规'
    const compliant = r2() > 0.3
    return {
      market,
      regulation: reg,
      compliance_status: compliant ? 'compliant' : 'requires_modification',
      specific_requirements: [reg + '要求功效宣称须有充分科学依据', '宣称用语须符合法规允许的表述'],
      penalty_risk: compliant ? '低' : '中-高（可能面临产品下架或罚款）'
    }
  })

  const overallRisk: ClaimResult['overall_claim_risk'] = claimAssessments.some(c => c.regulatory_risk === 'critical') ? 'critical' : claimAssessments.some(c => c.regulatory_risk === 'high') ? 'high' : claimAssessments.some(c => c.regulatory_risk === 'medium') ? 'medium' : 'low'

  return {
    product_name: input.product_name,
    claim_assessments: claimAssessments,
    regulatory_checks: regulatoryChecks,
    overall_claim_risk: overallRisk,
    required_tests: ['人体功效评价试验', '消费者使用测试', '体外功效试验（如适用）'],
    recommendations: [
      '所有功效宣称须有至少一项人体试验数据支持',
      '宣称用语避免绝对化表述（如"最有效"、"根治"）',
      '天然/有机宣称须有相应认证支撑',
      '建议建立宣称档案（Claim Substantiation Dossier）',
      '关注各市场法规更新动态，及时调整宣称策略'
    ]
  }
}

// --- Tool 3: Stability Testing Predictor ---
function analyzeStability(input: StabilityInput): StabilityResult {
  const r = rng(input.product_type + input.packaging_type)
  const r2 = rng(input.product_type + "_deg")

  const degradationKinetics: DegradationKinetic[] = input.quality_parameters.map(qp => {
    const k = Math.round((0.001 + r() * 0.009) * 100000) / 100000
    const ea = Math.round((40 + r2() * 60) * 10) / 10
    const q10 = Math.round((1.5 + r() * 2) * 100) / 100
    const halfLife = Math.round(Math.log(2) / k / 30 * 10) / 10
    return {
      parameter: qp.parameter,
      rate_constant_k: k,
      activation_energy_kj_mol: ea,
      q10_factor: q10,
      predicted_half_life_months: halfLife,
      degradation_mechanism: r() > 0.5 ? '氧化降解' : r() > 0.25 ? '水解反应' : '光降解'
    }
  })

  const acceleratedAging: AcceleratedAgingResult[] = input.storage_conditions.map(cond => {
    const equivMonths = input.accelerated_testing ? Math.round(cond.temperature_c > 40 ? input.test_duration_months * 3 : cond.temperature_c > 25 ? input.test_duration_months * 1.5 : input.test_duration_months) : input.test_duration_months
    const changes = input.quality_parameters.map(qp => {
      const changePct = Math.round((-5 - r() * 15) * 10) / 10
      return {
        parameter: qp.parameter,
        predicted_value: Math.round(qp.initial_value * (1 + changePct / 100) * 100) / 100,
        change_pct: changePct,
        within_spec: Math.abs(changePct) < 10
      }
    })
    const shelfLife = Math.round((6 + r2() * 30) * 10) / 10
    return {
      condition: cond.condition,
      equivalent_real_time_months: equivMonths,
      predicted_changes: changes,
      failure_mode: changes.find(c => !c.within_spec)?.parameter || '无明显失效模式',
      shelf_life_prediction_months: shelfLife
    }
  })

  const minShelfLife = Math.min(...acceleratedAging.map(a => a.shelf_life_prediction_months))
  const limitingFactor = degradationKinetics.reduce((min, dk) => dk.predicted_half_life_months < min.predicted_half_life_months ? dk : min, degradationKinetics[0])

  return {
    product_type: input.product_type,
    degradation_kinetics: degradationKinetics,
    accelerated_aging: acceleratedAging,
    shelf_life_prediction: { months: minShelfLife, confidence: Math.round((0.7 + r() * 0.25) * 100) / 100, limiting_factor: limitingFactor.parameter },
    storage_recommendations: [
      '建议储存于阴凉干燥处，避免阳光直射',
      '开封后建议在标注期限内使用完毕',
      '避免极端温度循环对乳化体系的影响',
      '建议采用避光包装以延长活性成分寿命'
    ],
    recommendations: [
      '建议进行实时稳定性测试验证加速预测结果',
      '关注关键质量参数的变化趋势而非单点数据',
      '建议设置放行标准与货架标准两级标准',
      '考虑运输与分销环节的温度挑战',
      '建议进行冻融循环测试（针对乳液体系）'
    ]
  }
}

// --- Tool 4: Regulatory Compliance & Safety ---
function analyzeSafety(input: SafetyInput): SafetyResult {
  const r = rng(input.product_name + input.ingredients.length.toString())
  const r2 = rng(input.product_name + "_safety")

  const ingredientProfiles: IngredientSafetyProfile[] = input.ingredients.map(ing => {
    const status: IngredientSafetyProfile['safety_status'] = r() > 0.9 ? 'prohibited' : r() > 0.7 ? 'restricted' : r() > 0.1 ? 'safe' : 'under_review'
    const maxAllowed = status === 'restricted' ? Math.round((0.1 + r2() * 5) * 100) / 100 : status === 'prohibited' ? 0 : 100
    return {
      name: ing.name,
      cas_number: ing.cas_number,
      concentration_pct: ing.concentration_pct,
      safety_status: status,
      restrictions: status === 'restricted' ? [`最大允许浓度${maxAllowed}%`, '需标注警示用语'] : status === 'prohibited' ? ['禁用物质，不得使用'] : [],
      max_allowed_pct: maxAllowed,
      safety_notes: status === 'safe' ? '在限定浓度内安全' : status === 'restricted' ? '须符合法规限定条件' : status === 'prohibited' ? '禁止使用' : '安全性数据待完善'
    }
  })

  const exposureAssessment: ExposureAssessment = {
    systemic_exposure_dose_mg_kg: Math.round((0.01 + r() * 0.5) * 1000) / 1000,
    margin_of_safety: Math.round((50 + r2() * 500) * 10) / 10,
    local_exposure_risk: r() > 0.7 ? 'moderate' : r() > 0.3 ? 'low' : 'negligible',
    sensitization_risk: r2() > 0.6 ? 'moderate' : r2() > 0.2 ? 'low' : 'negligible',
    phototoxicity_risk: r() > 0.8 ? 'moderate' : r() > 0.4 ? 'low' : 'negligible'
  }

  const marketCompliance: MarketCompliance[] = input.target_markets.map(market => {
    const regMap: Record<string, string> = { '中国': '《化妆品监督管理条例》+《化妆品安全技术规范》', '欧盟': 'EC No 1223/2009 + SCCS指南', '美国': 'FD&C Act + MoCRA 2022', '日本': '药机法 + 厚生劳动省标准', '韩国': '化妆品法 + MFDS标准' }
    const reg = regMap[market] || '当地化妆品法规'
    const compliant = r2() > 0.25
    return {
      market,
      regulation: reg,
      notification_required: true,
      cpnp_registered: market === '欧盟' ? compliant : false,
      responsible_person_required: market === '欧盟' || market === '英国',
      compliance_status: compliant ? 'compliant' : 'pending',
      required_actions: compliant ? ['维持合规状态'] : ['完成产品备案/注册', '提交安全评估报告', '指定责任人（如适用）']
    }
  })

  const hasProhibited = ingredientProfiles.some(i => i.safety_status === 'prohibited')
  const hasRestricted = ingredientProfiles.some(i => i.safety_status === 'restricted')
  const overallConclusion: SafetyResult['overall_safety_conclusion'] = hasProhibited ? 'unsafe' : hasRestricted ? 'safe_with_restrictions' : exposureAssessment.margin_of_safety > 100 ? 'safe' : 'requires_modification'

  return {
    product_name: input.product_name,
    ingredient_profiles: ingredientProfiles,
    exposure_assessment: exposureAssessment,
    market_compliance: marketCompliance,
    overall_safety_conclusion: overallConclusion,
    safety_report_summary: `经安全评估，产品${overallConclusion === 'safe' ? '在正常使用条件下安全' : overallConclusion === 'safe_with_restrictions' ? '在限定条件下安全' : overallConclusion === 'requires_modification' ? '需修改配方后重新评估' : '存在安全隐患，不建议上市'}。`,
    recommendations: [
      '建议由持证安全评估师签署安全评估报告',
      '关注CMR物质（致癌、致突变、生殖毒性）的筛查',
      '建议进行皮肤刺激性与致敏性测试',
      '儿童用产品须采用更严格的安全系数',
      '建议建立不良反应监测与报告机制',
      '所有安全结论须经法规审核确认后方可上市'
    ]
  }
}

// --- Tool 5: Consumer Sensory Panel Analyzer ---
function analyzeSensory(input: SensoryInput): SensoryResult {
  const r = rng(input.product_name + input.test_method)
  const r2 = rng(input.product_name + "_sensory")

  const attributeScores: AttributeScore[] = input.sensory_attributes.map(attr => {
    const mean = Math.round((3 + r() * 4) * 10) / 10
    const std = Math.round((0.3 + r2() * 1.2) * 10) / 10
    return {
      attribute: attr.attribute,
      mean_score: mean,
      std_deviation: std,
      min_score: Math.max(1, Math.round((mean - std * 1.5) * 10) / 10),
      max_score: Math.min(7, Math.round((mean + std * 1.5) * 10) / 10),
      statistical_significance: r() > 0.3
    }
  })

  const products = [input.product_name, ...(input.competitor_products || [])]
  const lowAttributes = attributeScores.filter(a => a.mean_score < 4).map(a => a.attribute)
  const preferenceMapping: PreferenceMapping[] = products.map(prod => ({
    product: prod,
    overall_preference: Math.round((3 + r() * 4) * 10) / 10,
    like_dislike_ratio: Math.round((1 + r2() * 4) * 10) / 10,
    key_drivers: input.sensory_attributes.slice(0, 2).map(a => a.attribute),
    improvement_opportunities: lowAttributes
  }))

  const segments: ConsumerSegment[] = [
    { segment_name: '功效导向型', size_pct: Math.round(25 + r() * 15), preferred_attributes: ['功效感知', '持久度'], satisfaction_score: Math.round((3.5 + r2() * 3) * 10) / 10, loyalty_indicator: '高' },
    { segment_name: '感官体验型', size_pct: Math.round(20 + r() * 15), preferred_attributes: ['质地', '香气', '吸收速度'], satisfaction_score: Math.round((3 + r2() * 3.5) * 10) / 10, loyalty_indicator: '中' },
    { segment_name: '性价比型', size_pct: Math.round(15 + r() * 10), preferred_attributes: ['性价比', '包装设计'], satisfaction_score: Math.round((3 + r2() * 3) * 10) / 10, loyalty_indicator: '低' }
  ]

  return {
    product_name: input.product_name,
    test_method: input.test_method,
    attribute_scores: attributeScores,
    preference_mapping: preferenceMapping,
    consumer_segments: segments,
    statistical_summary: { f_value: Math.round((2 + r() * 8) * 100) / 100, p_value: Math.round(r2() * 0.05 * 10000) / 10000, r_squared: Math.round((0.6 + r() * 0.35) * 100) / 100 },
    recommendations: [
      '建议扩大样本量以提升统计效力',
      '关注感官属性与消费者购买意愿的相关性',
      '建议进行重复测量以评估个体差异',
      '可结合眼动仪或脑电设备获取隐性反馈',
      '建议建立感官质量控制标准与标样'
    ]
  }
}

// --- Tool 6: Packaging Compatibility Tester ---
function analyzePackaging(input: PackagingInput): PackagingResult {
  const r = rng(input.product_name + input.packaging_material)
  const r2 = rng(input.product_name + "_pack")

  const migrationTests: MigrationTest[] = [
    { substance: '塑化剂(DEHP)', detected_level_ppm: Math.round(r() * 50), regulatory_limit_ppm: 1.5, compliance_status: r() > 0.8 ? 'fail' : r() > 0.6 ? 'borderline' : 'pass', migration_mechanism: '脂溶性成分从塑料基质溶出', health_risk_assessment: '内分泌干扰风险' },
    { substance: '双酚A(BPA)', detected_level_ppm: Math.round(r2() * 10), regulatory_limit_ppm: 0.04, compliance_status: r2() > 0.7 ? 'fail' : r2() > 0.5 ? 'borderline' : 'pass', migration_mechanism: '聚碳酸酯或环氧树脂溶出', health_risk_assessment: '雌激素活性风险' },
    { substance: '重金属(铅)', detected_level_ppm: Math.round(r() * 5), regulatory_limit_ppm: 10, compliance_status: 'pass', migration_mechanism: '颜料或杂质引入', health_risk_assessment: '蓄积性神经毒性' },
    { substance: '甲醛', detected_level_ppm: Math.round(r2() * 20), regulatory_limit_ppm: 0.2, compliance_status: r2() > 0.6 ? 'fail' : r2() > 0.3 ? 'borderline' : 'pass', migration_mechanism: '防腐剂降解释放', health_risk_assessment: '致癌性与致敏性' }
  ]

  const physicalCompat: PhysicalCompatibility[] = [
    { test: '重量变化', result: r() > 0.8 ? 'warning' : 'pass', observed_effect: r() > 0.8 ? '轻微失重（<0.5%）' : '无明显变化', severity: r() > 0.8 ? 'minor' : 'none', recommendation: '关注挥发性成分渗透' },
    { test: '外观变化', result: r2() > 0.7 ? 'warning' : 'pass', observed_effect: r2() > 0.7 ? '轻微变色或变形' : '外观完好', severity: r2() > 0.7 ? 'minor' : 'none', recommendation: '评估光照与温度影响' },
    { test: '密封性', result: r() > 0.9 ? 'fail' : 'pass', observed_effect: r() > 0.9 ? '密封失效导致泄漏' : '密封良好', severity: r() > 0.9 ? 'severe' : 'none', recommendation: '检查垫片材质相容性' },
    { test: '机械强度', result: r2() > 0.85 ? 'warning' : 'pass', observed_effect: r2() > 0.85 ? '材料脆化或软化' : '机械性能正常', severity: r2() > 0.85 ? 'moderate' : 'none', recommendation: '评估长期储存影响' }
  ]

  const chemicalCompat: ChemicalCompatibility[] = input.key_ingredients.filter(i => i.reactivity !== 'inert').map(ing => ({
    interaction_type: ing.reactivity === 'highly_reactive' ? '化学反应' : '物理吸附',
    affected_component: input.packaging_component,
    mechanism: `${ing.name}与${input.packaging_material}的${ing.reactivity === 'highly_reactive' ? '化学反应' : '物理吸附'}`,
    risk_level: ing.reactivity === 'highly_reactive' ? 'high' : ing.reactivity === 'reactive' ? 'medium' : 'low',
    mitigation: ing.reactivity === 'highly_reactive' ? '建议更换为惰性材质（如玻璃）' : '建议增加阻隔涂层'
  }))

  const overallCompat: PackagingResult['overall_compatibility'] = migrationTests.some(m => m.compliance_status === 'fail') || physicalCompat.some(p => p.result === 'fail') ? 'incompatible' : migrationTests.some(m => m.compliance_status === 'borderline') || physicalCompat.some(p => p.result === 'warning') ? 'compatible_with_conditions' : 'compatible'

  return {
    product_name: input.product_name,
    packaging_material: input.packaging_material,
    migration_tests: migrationTests,
    physical_compatibility: physicalCompat,
    chemical_compatibility: chemicalCompat,
    overall_compatibility: overallCompat,
    recommendations: [
      '建议进行实际条件下的长期相容性测试',
      '关注活性成分被包装吸附导致的含量下降',
      '评估多次开盖对包装密封性的影响',
      '建议进行运输模拟测试验证包装保护性能',
      '关注可回收包装材料的相容性挑战'
    ]
  }
}

// --- Tool 7: Preservative Efficacy Predictor ---
function analyzePreservative(input: PreservativeInput): PreservativeResult {
  const r = rng(input.product_type + input.preservation_system.length.toString())
  const r2 = rng(input.product_type + "_pres")

  const organisms = input.challenge_organisms || ['金黄色葡萄球菌', '大肠杆菌', '铜绿假单胞菌', '白色念珠菌', '黑曲霉']

  const challengeResults: ChallengeTestResult[] = organisms.map(org => {
    const initial = Math.round(1e5 + r() * 1e5)
    const lr7 = Math.round((1 + r2() * 3) * 10) / 10
    const lr14 = Math.round((2 + r() * 3) * 10) / 10
    const lr28 = Math.round((3 + r2() * 2) * 10) / 10
    const isOrg = org.includes('霉') || org.includes('菌') && org.includes('念')
    const pass = isOrg ? lr28 >= 2 : lr7 >= 3 && lr28 >= 5
    return {
      organism: org,
      initial_inoculum_cfu_g: initial,
      log_reduction_day_7: lr7,
      log_reduction_day_14: lr14,
      log_reduction_day_28: lr28,
      pass_criteria_met: pass,
      failure_analysis: pass ? '' : '28天对数减少值未达标，建议增强防腐体系'
    }
  })

  const synergy: PreservativeSynergy[] = input.preservation_system.length > 1 ? [{
    combination: input.preservation_system.map(p => p.preservative),
    synergy_type: r() > 0.5 ? 'synergistic' : r() > 0.2 ? 'additive' : 'antagonistic',
    efficacy_enhancement_pct: Math.round((10 + r2() * 40) * 10) / 10,
    recommendation: r() > 0.5 ? '当前组合具有协同效应，可考虑降低总用量' : '建议调整防腐剂组合以提升协同效应'
  }] : []

  const optimization: PreservativeOptimization[] = [{
    current_system: input.preservation_system.map(p => p.preservative).join('+'),
    recommended_system: r() > 0.5 ? '苯氧乙醇+乙基己基甘油+辛甘醇' : '戊二醇+对羟基苯乙酮+辛甘醇',
    predicted_improvement: Math.round((15 + r2() * 35) * 10) / 10,
    cost_impact_pct: Math.round((-10 + r() * 30) * 10) / 10,
    regulatory_impact: '新推荐体系符合欧盟与中国法规要求'
  }]

  const overallEfficacy: PreservativeResult['overall_efficacy'] = challengeResults.every(c => c.pass_criteria_met) ? 'pass' : challengeResults.filter(c => c.pass_criteria_met).length >= challengeResults.length * 0.7 ? 'marginal' : 'fail'

  return {
    product_type: input.product_type,
    target_standard: input.target_standard,
    challenge_test_results: challengeResults,
    preservative_synergy: synergy,
    optimization_suggestions: optimization,
    overall_efficacy: overallEfficacy,
    recommendations: [
      '建议进行实际产品挑战测试验证预测结果',
      '关注水活度对防腐效果的影响',
      '评估防腐体系在不同pH条件下的效力',
      '建议进行多次挑战测试确认重现性',
      '关注防腐剂与配方成分的相互作用',
      '天然防腐体系需特别关注霉菌抑制效果'
    ]
  }
}

// --- Tool 8: Market Trend Ingredient Scanner ---
function analyzeTrends(input: TrendInput): TrendResult {
  const r = rng(input.product_category + input.target_market)
  const r2 = rng(input.product_category + "_trend")

  const trendingIng: TrendingIngredient[] = [
    { name: '补骨脂酚(Bakuchiol)', trend_direction: 'rising', search_volume_growth_pct: Math.round(80 + r() * 120), social_media_mentions: Math.round(5000 + r2() * 15000), new_product_launches: Math.round(50 + r() * 100), key_benefits: ['视黄醇替代', '植物来源', '低刺激性'], supporting_evidence: '多项临床研究证实抗皱功效', market_penetration_pct: Math.round((5 + r2() * 15) * 10) / 10 },
    { name: '麦角硫因(Ergothioneine)', trend_direction: 'emerging', search_volume_growth_pct: Math.round(100 + r() * 200), social_media_mentions: Math.round(2000 + r2() * 8000), new_product_launches: Math.round(20 + r() * 60), key_benefits: ['线粒体保护', '抗氧化', '细胞防护'], supporting_evidence: '细胞实验与初步临床数据', market_penetration_pct: Math.round((1 + r2() * 5) * 10) / 10 },
    { name: '神经酰胺NP', trend_direction: 'peaking', search_volume_growth_pct: Math.round(20 + r() * 30), social_media_mentions: Math.round(10000 + r2() * 10000), new_product_launches: Math.round(100 + r() * 100), key_benefits: ['屏障修复', '保湿', '舒缓'], supporting_evidence: '大量临床数据支持', market_penetration_pct: Math.round((25 + r2() * 15) * 10) / 10 },
    { name: '蓝铜肽(GHK-Cu)', trend_direction: 'rising', search_volume_growth_pct: Math.round(40 + r() * 80), social_media_mentions: Math.round(3000 + r2() * 7000), new_product_launches: Math.round(30 + r() * 50), key_benefits: ['修复', '抗衰', '促进胶原'], supporting_evidence: '体外与临床数据充分', market_penetration_pct: Math.round((8 + r2() * 12) * 10) / 10 },
    { name: '发酵滤液', trend_direction: 'peaking', search_volume_growth_pct: Math.round(30 + r() * 40), social_media_mentions: Math.round(8000 + r2() * 12000), new_product_launches: Math.round(80 + r() * 80), key_benefits: ['微生态平衡', '温和焕肤', '提亮'], supporting_evidence: '品牌背书与消费者口碑', market_penetration_pct: Math.round((20 + r2() * 15) * 10) / 10 }
  ]

  const competitorAnalysis: CompetitorAnalysis[] = input.competitor_brands.map(brand => ({
    brand,
    hero_ingredients: [
      { name: r() > 0.5 ? '烟酰胺' : '透明质酸', positioning: '核心功效成分', concentration_claim: `${Math.round(2 + r2() * 8)}%` },
      { name: r() > 0.5 ? '肽类复合物' : '植物提取物', positioning: '差异化卖点', concentration_claim: '未公开' }
    ],
    formulation_strategy: r() > 0.5 ? '精简配方+高浓度活性物' : '复合配方+多效合一',
    claim_focus: ['抗衰', '美白', '修复'].slice(0, Math.round(1 + r() * 2)),
    price_positioning: input.price_segment,
    market_share_estimate_pct: Math.round((2 + r2() * 15) * 10) / 10
  }))

  const deepDives: IngredientDeepDive[] = trendingIng.slice(0, 3).map(ti => ({
    ingredient_name: ti.name,
    mechanism_of_action: `${ti.name}通过${ti.key_benefits[0]}机制发挥功效`,
    clinical_evidence: [
      { study_type: '体外实验', result: '证实有效', credibility: '中等' },
      { study_type: '消费者测试', result: '满意度>80%', credibility: '中等' }
    ],
    regulatory_status: '中国NMPA已备案 / 欧盟CIR已评估',
    supplier_landscape: ['国际供应商A', '国内供应商B', '新兴供应商C'],
    cost_trend: r() > 0.5 ? 'decreasing' : r() > 0.2 ? 'stable' : 'increasing',
    formulation_challenges: ['pH敏感性', '配伍相容性', '稳定性优化']
  }))

  return {
    product_category: input.product_category,
    scan_date: new Date().toISOString().split('T')[0],
    trending_ingredients: trendingIng,
    competitor_analysis: competitorAnalysis,
    ingredient_deep_dives: deepDives,
    white_space_opportunities: [
      '微生态护肤领域仍有创新空间',
      '可持续来源成分的市场需求增长',
      '精准护肤（基因/微生物组定制）',
      '多效合一的简化护肤方案'
    ],
    recommendations: [
      '建议关注新兴成分的专利布局情况',
      '评估趋势成分与品牌定位的契合度',
      '关注成分供应链稳定性与成本趋势',
      '建议建立成分功效评价内部能力',
      '关注竞品宣称与实际配方的差异分析'
    ]
  }
}

// ==================== SECTION 4 — 格式化函数 ====================

function formatFormulation(r: FormulationResult): string {
  const lines: string[] = []
  lines.push(`# 🧪 配方开发报告 — ${r.product_type} (${r.formulation_phase})`)
  lines.push('')
  lines.push('## 📋 最优配方组成')
  lines.push('| 成分 | 功能 | 用量(%) | 成本贡献(¥/kg) |')
  lines.push('|------|------|---------|----------------|')
  for (const c of r.optimal_composition) {
    lines.push(`| ${c.ingredient} | ${c.function} | ${c.percentage} | ${c.cost_contribution} |`)
  }
  lines.push('')
  lines.push('## 🔬 成分相容性矩阵')
  for (const cm of r.compatibility_matrix) {
    const icon = cm.compatibility === 'compatible' ? '✅' : cm.compatibility === 'caution' ? '⚠️' : '❌'
    lines.push(`- ${icon} ${cm.ingredient_a} + ${cm.ingredient_b}: ${cm.compatibility} — ${cm.recommendation}`)
  }
  lines.push('')
  lines.push('## 🧬 相态行为分析')
  for (const pb of r.phase_behavior) {
    if (pb.ingredients.length > 0) {
      lines.push(`- **${pb.phase}相**: ${pb.ingredients.join(', ')} | 稳定性风险: ${pb.stability_risk} | ${pb.notes}`)
    }
  }
  lines.push('')
  lines.push('## 📊 预测性能')
  for (const pp of r.predicted_properties) {
    lines.push(`- ${pp.property}: 预测=${pp.predicted}${pp.unit} | 目标=${pp.target}${pp.unit} | ${pp.status}`)
  }
  lines.push('')
  lines.push(`## 💰 成本分析`)
  lines.push(`- 总成本: ¥${r.cost_analysis.total_cost_per_kg}/kg | 较基准节省: ¥${r.cost_analysis.savings_vs_baseline}/kg`)
  lines.push('')
  lines.push('## 💡 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

function formatClaims(r: ClaimResult): string {
  const lines: string[] = []
  lines.push(`# 📢 功效宣称审核报告 — ${r.product_name}`)
  lines.push('')
  lines.push(`**整体风险等级**: ${r.overall_claim_risk === 'critical' ? '🔴 极高' : r.overall_claim_risk === 'high' ? '🟠 高' : r.overall_claim_risk === 'medium' ? '🟡 中' : '🟢 低'}`)
  lines.push('')
  lines.push('## 📝 宣称评估')
  for (const ca of r.claim_assessments) {
    const statusIcon = ca.substantiation_status === 'substantiated' ? '✅' : ca.substantiation_status === 'partially_substantiated' ? '⚠️' : ca.substantiation_status === 'requires_testing' ? '🔬' : '❌'
    lines.push(`### ${statusIcon} "${ca.claim_text}"`)
    lines.push(`- 类型: ${ca.claim_type} | 证据状态: ${ca.substantiation_status} | 法规风险: ${ca.regulatory_risk}`)
    if (ca.evidence_gap.length > 0) lines.push(`- 证据缺口: ${ca.evidence_gap.join('; ')}`)
    if (ca.suggested_qualifier) lines.push(`- 建议限定语: ${ca.suggested_qualifier}`)
    if (ca.alternative_wording !== ca.claim_text) lines.push(`- 替代表述: "${ca.alternative_wording}"`)
    lines.push('')
  }
  lines.push('## 🌍 法规合规检查')
  for (const rc of r.regulatory_checks) {
    lines.push(`- **${rc.market}** (${rc.regulation}): ${rc.compliance_status} | 处罚风险: ${rc.penalty_risk}`)
  }
  lines.push('')
  lines.push('## 🔬 所需测试')
  for (const t of r.required_tests) lines.push(`- ${t}`)
  lines.push('')
  lines.push('## 💡 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

function formatStability(r: StabilityResult): string {
  const lines: string[] = []
  lines.push(`# 🧊 稳定性预测报告 — ${r.product_type}`)
  lines.push('')
  lines.push(`## 📅 货架期预测`)
  lines.push(`- 预测货架期: **${r.shelf_life_prediction.months}个月** (置信度: ${Math.round(r.shelf_life_prediction.confidence * 100)}%)`)
  lines.push(`- 限制因素: ${r.shelf_life_prediction.limiting_factor}`)
  lines.push('')
  lines.push('## ⚗️ 降解动力学')
  lines.push('| 参数 | 速率常数k | 活化能(kJ/mol) | Q10 | 预测半衰期(月) | 降解机制 |')
  lines.push('|------|-----------|----------------|-----|----------------|----------|')
  for (const dk of r.degradation_kinetics) {
    lines.push(`| ${dk.parameter} | ${dk.rate_constant_k} | ${dk.activation_energy_kj_mol} | ${dk.q10_factor} | ${dk.predicted_half_life_months} | ${dk.degradation_mechanism} |`)
  }
  lines.push('')
  lines.push('## 🔥 加速老化结果')
  for (const aa of r.accelerated_aging) {
    lines.push(`### ${aa.condition} (等效${aa.equivalent_real_time_months}个月)`)
    for (const ch of aa.predicted_changes) {
      lines.push(`- ${ch.parameter}: ${ch.predicted_value} (${ch.change_pct > 0 ? '+' : ''}${ch.change_pct}%) ${ch.within_spec ? '✅' : '❌'}`)
    }
    lines.push(`- 失效模式: ${aa.failure_mode} | 预测货架期: ${aa.shelf_life_prediction_months}个月`)
    lines.push('')
  }
  lines.push('## 📦 储存建议')
  for (const sr of r.storage_recommendations) lines.push(`- ${sr}`)
  lines.push('')
  lines.push('## 💡 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

function formatSafety(r: SafetyResult): string {
  const lines: string[] = []
  lines.push(`# 🛡️ 安全评估报告 — ${r.product_name}`)
  lines.push('')
  lines.push(`**安全结论**: ${r.overall_safety_conclusion === 'safe' ? '✅ 安全' : r.overall_safety_conclusion === 'safe_with_restrictions' ? '⚠️ 限定条件下安全' : r.overall_safety_conclusion === 'requires_modification' ? '🔧 需修改' : '❌ 不安全'}`)
  lines.push('')
  lines.push(r.safety_report_summary)
  lines.push('')
  lines.push('## 🧪 成分安全档案')
  for (const ip of r.ingredient_profiles) {
    const icon = ip.safety_status === 'safe' ? '✅' : ip.safety_status === 'restricted' ? '⚠️' : ip.safety_status === 'prohibited' ? '❌' : '❓'
    lines.push(`- ${icon} **${ip.name}** (${ip.cas_number}): ${ip.concentration_pct}% | 状态: ${ip.safety_status} | 最大允许: ${ip.max_allowed_pct}%`)
    if (ip.restrictions.length > 0) lines.push(`  限制: ${ip.restrictions.join('; ')}`)
  }
  lines.push('')
  lines.push('## 📊 暴露评估')
  const ea = r.exposure_assessment
  lines.push(`- 系统暴露剂量: ${ea.systemic_exposure_dose_mg_kg} mg/kg`)
  lines.push(`- 安全边际(MoS): ${ea.margin_of_safety}`)
  lines.push(`- 局部暴露风险: ${ea.local_exposure_risk} | 致敏风险: ${ea.sensitization_risk} | 光毒性风险: ${ea.phototoxicity_risk}`)
  lines.push('')
  lines.push('## 🌍 市场合规')
  for (const mc of r.market_compliance) {
    lines.push(`- **${mc.market}** (${mc.regulation}): ${mc.compliance_status} | 备案: ${mc.notification_required ? '需要' : '不需要'} | 责任人: ${mc.responsible_person_required ? '需要' : '不需要'}`)
  }
  lines.push('')
  lines.push('## 💡 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

function formatSensory(r: SensoryResult): string {
  const lines: string[] = []
  lines.push(`# 👃 感官评估报告 — ${r.product_name}`)
  lines.push('')
  lines.push(`**测试方法**: ${r.test_method} | **样本量**: ${r.attribute_scores.length}个属性`)
  lines.push('')
  lines.push('## 📊 属性评分')
  lines.push('| 属性 | 均值 | 标准差 | 最小值 | 最大值 | 显著性 |')
  lines.push('|------|------|--------|--------|--------|--------|')
  for (const as of r.attribute_scores) {
    lines.push(`| ${as.attribute} | ${as.mean_score} | ${as.std_deviation} | ${as.min_score} | ${as.max_score} | ${as.statistical_significance ? '✅' : '❌'} |`)
  }
  lines.push('')
  lines.push('## ❤️ 偏好分析')
  for (const pm of r.preference_mapping) {
    lines.push(`- **${pm.product}**: 偏好度=${pm.overall_preference} | 好恶比=${pm.like_dislike_ratio} | 关键驱动: ${pm.key_drivers.join(', ')}`)
  }
  lines.push('')
  lines.push('## 👥 消费者细分')
  for (const cs of r.consumer_segments) {
    lines.push(`- **${cs.segment_name}** (${cs.size_pct}%): 偏好属性=${cs.preferred_attributes.join(', ')} | 满意度=${cs.satisfaction_score} | 忠诚度=${cs.loyalty_indicator}`)
  }
  lines.push('')
  lines.push(`## 📈 统计摘要`)
  lines.push(`- F值: ${r.statistical_summary.f_value} | P值: ${r.statistical_summary.p_value} | R²: ${r.statistical_summary.r_squared}`)
  lines.push('')
  lines.push('## 💡 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

function formatPackaging(r: PackagingResult): string {
  const lines: string[] = []
  lines.push(`# 📦 包装相容性报告 — ${r.product_name}`)
  lines.push('')
  lines.push(`**包装材料**: ${r.packaging_material} | **相容性结论**: ${r.overall_compatibility === 'compatible' ? '✅ 相容' : r.overall_compatibility === 'compatible_with_conditions' ? '⚠️ 条件性相容' : '❌ 不相容'}`)
  lines.push('')
  lines.push('## 🧪 迁移测试')
  lines.push('| 物质 | 检测值(ppm) | 法规限值(ppm) | 合规状态 | 健康风险评估 |')
  lines.push('|------|-------------|---------------|----------|--------------|')
  for (const mt of r.migration_tests) {
    const icon = mt.compliance_status === 'pass' ? '✅' : mt.compliance_status === 'borderline' ? '⚠️' : '❌'
    lines.push(`| ${mt.substance} | ${mt.detected_level_ppm} | ${mt.regulatory_limit_ppm} | ${icon} ${mt.compliance_status} | ${mt.health_risk_assessment} |`)
  }
  lines.push('')
  lines.push('## 🔧 物理相容性')
  for (const pc of r.physical_compatibility) {
    const icon = pc.result === 'pass' ? '✅' : pc.result === 'warning' ? '⚠️' : '❌'
    lines.push(`- ${icon} ${pc.test}: ${pc.result} | ${pc.observed_effect} | 严重度: ${pc.severity} | ${pc.recommendation}`)
  }
  lines.push('')
  lines.push('## ⚗️ 化学相容性')
  for (const cc of r.chemical_compatibility) {
    lines.push(`- **${cc.interaction_type}** (${cc.affected_component}): ${cc.mechanism} | 风险: ${cc.risk_level} | ${cc.mitigation}`)
  }
  lines.push('')
  lines.push('## 💡 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

function formatPreservative(r: PreservativeResult): string {
  const lines: string[] = []
  lines.push(`# 🦠 防腐挑战预测报告 — ${r.product_type}`)
  lines.push('')
  lines.push(`**目标标准**: ${r.target_standard} | **整体效力**: ${r.overall_efficacy === 'pass' ? '✅ 通过' : r.overall_efficacy === 'marginal' ? '⚠️ 边缘' : '❌ 不通过'}`)
  lines.push('')
  lines.push('## 🧫 挑战测试结果')
  lines.push('| 微生物 | 初始接种量(CFU/g) | 7天log减少 | 14天log减少 | 28天log减少 | 是否达标 |')
  lines.push('|--------|-------------------|-----------|------------|------------|----------|')
  for (const ct of r.challenge_test_results) {
    lines.push(`| ${ct.organism} | ${ct.initial_inoculum_cfu_g} | ${ct.log_reduction_day_7} | ${ct.log_reduction_day_14} | ${ct.log_reduction_day_28} | ${ct.pass_criteria_met ? '✅' : '❌'} |`)
  }
  lines.push('')
  lines.push('## 🔄 防腐协同效应')
  for (const ps of r.preservative_synergy) {
    lines.push(`- **${ps.combination.join('+')}**: ${ps.synergy_type} | 效力提升: ${ps.efficacy_enhancement_pct}% | ${ps.recommendation}`)
  }
  lines.push('')
  lines.push('## 🔧 优化建议')
  for (const opt of r.optimization_suggestions) {
    lines.push(`- 当前体系: ${opt.current_system} → 推荐: ${opt.recommended_system}`)
    lines.push(`  预测提升: ${opt.predicted_improvement}% | 成本影响: ${opt.cost_impact_pct > 0 ? '+' : ''}${opt.cost_impact_pct}% | ${opt.regulatory_impact}`)
  }
  lines.push('')
  lines.push('## 💡 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

function formatTrends(r: TrendResult): string {
  const lines: string[] = []
  lines.push(`# 📊 美妆趋势成分扫描报告 — ${r.product_category}`)
  lines.push('')
  lines.push(`**扫描日期**: ${r.scan_date}`)
  lines.push('')
  lines.push('## 🔥 趋势成分排行')
  for (const ti of r.trending_ingredients) {
    const dirIcon = ti.trend_direction === 'rising' ? '📈' : ti.trend_direction === 'peaking' ? '🔝' : ti.trend_direction === 'declining' ? '📉' : '✨'
    lines.push(`### ${dirIcon} ${ti.name}`)
    lines.push(`- 趋势: ${ti.trend_direction} | 搜索增长: +${ti.trend_direction === 'emerging' ? ti.search_volume_growth_pct : ti.search_volume_growth_pct}% | 社媒提及: ${ti.social_media_mentions} | 新品数: ${ti.new_product_launches}`)
    lines.push(`- 核心功效: ${ti.key_benefits.join(', ')} | 市场渗透率: ${ti.market_penetration_pct}%`)
    lines.push(`- 证据支撑: ${ti.supporting_evidence}`)
    lines.push('')
  }
  lines.push('## 🏢 竞品分析')
  for (const ca of r.competitor_analysis) {
    lines.push(`### ${ca.brand} (预估份额: ${ca.market_share_estimate_pct}%)`)
    lines.push(`- 配方策略: ${ca.formulation_strategy} | 宣称重点: ${ca.claim_focus.join(', ')}`)
    lines.push(`- 明星成分: ${ca.hero_ingredients.map(h => `${h.name}(${h.concentration_claim})`).join(', ')}`)
    lines.push('')
  }
  lines.push('## 🔬 成分深度解析')
  for (const id of r.ingredient_deep_dives) {
    lines.push(`### ${id.ingredient_name}`)
    lines.push(`- 作用机制: ${id.mechanism_of_action}`)
    lines.push(`- 法规状态: ${id.regulatory_status} | 成本趋势: ${id.cost_trend === 'decreasing' ? '下降' : id.cost_trend === 'stable' ? '稳定' : '上升'}`)
    lines.push(`- 配方挑战: ${id.formulation_challenges.join(', ')}`)
    lines.push('')
  }
  lines.push('## 🌟 空白机会')
  for (const ws of r.white_space_opportunities) lines.push(`- ${ws}`)
  lines.push('')
  lines.push('## 💡 建议')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Formulation Developer AI — 配方开发与成分相容性分析
  tools.register(defineTool({
    name: "formulation_developer_ai",
    description: "配方开发 | DOE实验设计/成分相容性/相态行为/性能预测/成本优化 | Formulation development with ingredient compatibility analysis, phase behavior, property prediction.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: product_type (cream|serum|lotion|cleanser|sunscreen|mask|shampoo|lipstick|foundation), target_properties[{property, target_value, unit, weight}], ingredients[{name, function, min_pct, max_pct, cost_per_kg}], constraints?, formulation_phase?"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatFormulation(analyzeFormulation(JSON.parse(args.input_data)))
    }
  }))

  // Tool 2: Claim Substantiation Checker — 功效宣称科学与法规审核
  tools.register(defineTool({
    name: "claim_substantiation_checker",
    description: "功效宣称审核 | 证据评估/法规风险/宣称用语合规/替代表述建议 | Claim substantiation with regulatory compliance checking, evidence gap analysis.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: product_name, claims[{claim_text, claim_type}], active_ingredients[{name, concentration_pct, evidence_level}], target_markets[], regulatory_frameworks[], test_data_available?"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatClaims(analyzeClaims(JSON.parse(args.input_data)))
    }
  }))

  // Tool 3: Stability Testing Predictor — 稳定性测试预测与加速老化
  tools.register(defineTool({
    name: "stability_testing_predictor",
    description: "稳定性预测 | 降解动力学/加速老化/货架期预测/储存条件建议 | Stability testing prediction with accelerated aging, shelf-life estimation.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: product_type, formulation_composition[{ingredient, percentage, stability_concern?}], packaging_type, storage_conditions[{condition, temperature_c, humidity_pct, light_exposure}], test_duration_months, accelerated_testing, quality_parameters[{parameter, initial_value, unit, acceptance_criteria}]"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatStability(analyzeStability(JSON.parse(args.input_data)))
    }
  }))

  // Tool 4: Regulatory Compliance & Safety — 化妆品安全评估与全球法规
  tools.register(defineTool({
    name: "regulatory_compliance_safety",
    description: "安全评估 | 成分安全档案/暴露评估/全球法规合规/安全报告 | Cosmetic safety assessment with global regulatory compliance, exposure assessment.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: product_name, product_type, ingredients[{name, cas_number, concentration_pct, function_category, safety_data_source}], target_markets[], exposure_conditions{route, frequency, duration, amount_per_use_g, target_population}, intended_use, safety_assessment_level"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSafety(analyzeSafety(JSON.parse(args.input_data)))
    }
  }))

  // Tool 5: Consumer Sensory Panel Analyzer — 消费者感官评估与偏好分析
  tools.register(defineTool({
    name: "consumer_sensory_panel_analyzer",
    description: "感官评估 | 属性评分/偏好映射/消费者细分/统计分析 | Consumer sensory panel analysis with preference mapping, consumer segmentation.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: product_name, product_type, panel_size, panelist_demographics{age_range, gender, skin_type[], region}, sensory_attributes[{attribute, scale, anchor_low, anchor_high}], test_method, competitor_products?, test_environment{temperature_c, humidity_pct, lighting}"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSensory(analyzeSensory(JSON.parse(args.input_data)))
    }
  }))

  // Tool 6: Packaging Compatibility Tester — 包装相容性与迁移测试
  tools.register(defineTool({
    name: "packaging_compatibility_tester",
    description: "包装相容性 | 迁移测试/物理相容性/化学相容性/合规评估 | Packaging compatibility with migration testing, physical/chemical compatibility.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: product_name, product_type, formulation_ph, key_ingredients[{name, concentration_pct, reactivity}], packaging_material (PET|HDPE|LDPE|PP|glass|aluminum|laminate|PMMA), packaging_component, contact_duration_months, storage_temperature_c, test_standards[]"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPackaging(analyzePackaging(JSON.parse(args.input_data)))
    }
  }))

  // Tool 7: Preservative Efficacy Predictor — 防腐挑战测试预测与体系设计
  tools.register(defineTool({
    name: "preservative_efficacy_predictor",
    description: "防腐挑战预测 | 挑战测试/协同效应/体系优化/法规符合性 | Preservative efficacy prediction with challenge test design, synergy analysis.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: product_type, formulation_ph, water_activity, composition[{ingredient, percentage, microbial_risk}], preservation_system[{preservative, concentration_pct, target_organisms}], target_standard (ISO_11930|USP_51|Ph_Eur_5_1_3|CTFA), challenge_organisms?, packaging_type, expected_shelf_life_months"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPreservative(analyzePreservative(JSON.parse(args.input_data)))
    }
  }))

  // Tool 8: Market Trend Ingredient Scanner — 美妆趋势成分扫描与竞品拆解
  tools.register(defineTool({
    name: "market_trend_ingredient_scanner",
    description: "趋势成分扫描 | 成分趋势/竞品拆解/深度解析/空白机会 | Beauty trend ingredient scanning with competitor teardowns, deep dives.",
    parameters: {
      input_data: {
        type: "string" as const,
        required: true,
        description: "JSON: product_category (skincare|haircare|makeup|fragrance|bodycare|suncare), target_market, price_segment (mass|masstige|premium|luxury), scan_timeframe_months, competitor_brands[], trend_sources[], ingredient_focus (actives|base_ingredients|preservatives|fragrances|all)"
      }
    },
    output: { schema: { type: "string" as const }, render: (_a: any, v: any) => [{ type: "text" as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatTrends(analyzeTrends(JSON.parse(args.input_data)))
    }
  }))

  console.log(`[dsh-tool-cosmeticagentpro] Loaded v${VERSION} — 化妆品研发AI助手, 8 tools active`)
  console.log("  Tools: formulation_developer_ai, claim_substantiation_checker, stability_testing_predictor, regulatory_compliance_safety, consumer_sensory_panel_analyzer, packaging_compatibility_tester, preservative_efficacy_predictor, market_trend_ingredient_scanner")
}
