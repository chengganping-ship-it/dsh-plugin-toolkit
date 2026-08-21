/**
 * DSH Food & Beverage Industry AI Agent Plugin v1.0.0
 * 食品饮料行业AI助手 for DeepSeek Harness — 配方研发·质量检测·供应链溯源·菜单工程·食品安全·消费者口味·冷链监控·法规合规
 *
 * 覆盖食品饮料行业全价值链：研发 → 生产 → 质量 → 供应链 → 消费者洞察 → 冷链物流 → 法规合规
 *
 * 工具清单:
 * 1. recipe_innovator       — 新品配方研发与口味趋势预测 (Innovate recipes and predict flavor trends)
 * 2. quality_control_ai     — 食品质量检测与HACCP合规 (Food quality control and HACCP compliance)
 * 3. supply_chain_food     — 食材供应链溯源与损耗优化 (Food supply chain traceability and waste reduction)
 * 4. menu_optimizer        — 菜单工程与价格弹性分析 (Menu engineering and price elasticity analysis)
 * 5. food_safety_auditor   — 食品安全审计与微生物风险评估 (Food safety audit and microbial risk assessment)
 * 6. consumer_taste_analyzer — 消费者口味偏好分析与新品适配 (Analyze consumer taste preferences and new product fit)
 * 7. cold_chain_monitor    — 冷链物流监控与温控预警 (Cold chain logistics monitoring and temperature alerts)
 * 8. regulatory_compliance  — 食品标签法规合规与营养声称审核 (Food labeling regulatory compliance and nutrition claims)
 *
 * @module dsh-tool-foodagentpro | @version 1.0.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-foodagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER_FOOD_SAFETY = '【免责声明】本工具分析结果基于AI模型推断，仅供食品行业研发与品控参考，不替代专业食品安全检测、HACCP认证、法规审批及合规决策。任何涉及食品安全、产品合规的决策须由持证专业人员依据国家/地区相关法律法规执行。'
const DISCLAIMER_REGULATORY = '【免责声明】本审核基于输入数据自动生成，不构成法规合规的最终结论。产品标签与营养声称须以国家市场监督管理总局（SAMR）或目标市场监管机构的审批结果为准，请咨询持证法规事务专家确认。'

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

// --- Tool 1: Recipe Innovator ---
interface RecipeInput {
  project_name: string
  product_category: 'beverage' | 'snack' | 'dairy' | 'bakery' | 'sauce' | 'frozen' | 'confectionery' | 'health_food'
  target_flavor_profile: string[]
  dietary_requirements: string[]
  cost_target_per_unit: number
  shelf_life_target_days: number
  market_region: string
  competitor_products?: string[]
  trend_keywords?: string[]
}

interface IngredientCandidate {
  ingredient: string
  functional_role: string
  inclusion_pct: number
  cost_per_kg: number
  supplier_risk: 'low' | 'medium' | 'high'
  trend_score: number
}

interface FlavorTrendPrediction {
  flavor_note: string
  trend_direction: 'rising' | 'stable' | 'declining'
  consumer_appeal_score: number
  market_saturation: 'low' | 'medium' | 'high'
  half_life_months: number
}

interface RecipeConcept {
  concept_name: string
  description: string
  key_ingredients: string[]
  estimated_cost_per_unit: number
  shelf_life_estimate_days: number
  novelty_score: number
  market_fit_score: number
  development_risk: 'low' | 'medium' | 'high'
}

interface RecipeInnovationResult {
  project_name: string
  product_category: string
  ingredient_candidates: IngredientCandidate[]
  flavor_trends: FlavorTrendPrediction[]
  recipe_concepts: RecipeConcept[]
  recommended_concept: string
  innovation_score: number
  disclaimer: string
}

// --- Tool 2: Quality Control AI ---
interface QualityInput {
  product_id: string
  product_name: string
  batch_number: string
  production_date: string
  test_parameters: Array<{ parameter: string; value: number; unit: string; spec_min: number; spec_max: number }>
  haccp_ccps: Array<{ ccp_id: string; hazard_type: string; critical_limit: string; monitoring_result: string; deviation: boolean }>
  microbiological_tests: Array<{ organism: string; result_cfu_g: string; specification: string; compliant: boolean }>
  sensory_evaluation: { appearance: number; aroma: number; taste: number; texture: number; overall: number }
  environmental_monitoring: Array<{ location: string; temp_c: number; humidity_pct: number; compliant: boolean }>
}

interface QualityParameterResult {
  parameter: string
  value: number
  unit: string
  spec_min: number
  spec_max: number
  status: 'pass' | 'fail' | 'warning'
  deviation_pct: number
}

interface HACCPStatus {
  ccp_id: string
  hazard_type: string
  critical_limit: string
  monitoring_result: string
  compliant: boolean
  severity: 'critical' | 'major' | 'minor'
  corrective_action: string
}

interface QualityControlResult {
  product_id: string
  product_name: string
  batch_number: string
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'rejected'
  parameter_results: QualityParameterResult[]
  haccp_statuses: HACCPStatus[]
  microbiological_summary: { tested: number; passed: number; failed: number }
  sensory_total_score: number
  disposition: 'release' | 'hold' | 'reject' | 'rework'
  critical_deviations: number
  disclaimer: string
}

// --- Tool 3: Supply Chain Food ---
interface SupplyChainInput {
  ingredient_name: string
  sku: string
  supplier_id: string
  supplier_name: string
  origin_country: string
  origin_facility: string
  quantity_kg: number
  unit_cost: number
  transport_mode: 'sea' | 'air' | 'road' | 'rail'
  transit_days: number
  storage_temp_c: number
  shelf_life_days: number
  certifications: string[]
  historical_deliveries: Array<{ delivery_id: string; date: string; quantity_kg: number; transit_days: number; quality_grade: string; wastage_pct: number }>
  seasonal_risk_factor: 'low' | 'medium' | 'high'
}

interface TraceabilityRecord {
  stage: string
  location: string
  timestamp: string
  handler: string
  temp_c: number
  compliance: 'verified' | 'pending' | 'violation'
  documentation: string
}

interface WasteReductionAction {
  action: string
  area: string
  current_wastage_pct: number
  target_wastage_pct: number
  saving_potential_annual: number
  implementation_cost: 'low' | 'medium' | 'high'
  payback_months: number
  priority: 'high' | 'medium' | 'low'
}

interface SupplyChainFoodResult {
  ingredient_name: string
  sku: string
  supplier_name: string
  origin_country: string
  traceability_score: number
  traceability_chain: TraceabilityRecord[]
  waste_reduction_actions: WasteReductionAction[]
  total_annual_saving_potential: number
  supply_risk_level: 'low' | 'medium' | 'high' | 'critical'
  shelf_life_utilization_pct: number
  recommended_order_frequency: string
  disclaimer: string
}

// --- Tool 4: Menu Optimizer ---
interface MenuInput {
  restaurant_name: string
  menu_category: 'qsr' | 'casual_dining' | 'fine_dining' | 'cafe' | 'fast_casual'
  menu_items: Array<{
    item_id: string
    item_name: string
    category: string
    current_price: number
    food_cost: number
    monthly_sales_volume: number
    prep_time_min: number
    allergens: string[]
    popularity_score: number
  }>
  target_food_cost_pct: number
  avg_monthly_customers: number
  competitive_set: Array<{ competitor: string; price_range: string; positioning: string }>
}

interface MenuItemAnalysis {
  item_name: string
  food_cost_pct: number
  gross_margin: number
  contribution_margin: number
  profit_classification: 'star' | 'plowhorse' | 'puzzle' | 'dog'
  popularity_classification: 'high' | 'low'
  recommendation: string
  suggested_price: number
  price_elasticity: number
}

interface MenuEngineeringResult {
  restaurant_name: string
  total_menu_items: number
  avg_food_cost_pct: number
  item_analyses: MenuItemAnalysis[]
  stars: string[]
  plowhorses: string[]
  puzzles: string[]
  dogs: string[]
  price_optimization_suggestions: Array<{ item_name: string; current_price: number; suggested_price: number; expected_volume_change_pct: number }>
  menu_diversity_score: number
  projected_margin_improvement_pct: number
  disclaimer: string
}

// --- Tool 5: Food Safety Auditor ---
interface SafetyAuditInput {
  facility_id: string
  facility_name: string
  audit_date: string
  audit_scope: string
  microbial_risk_samples: Array<{ sample_id: string; sample_location: string; pathogen: string; result: 'detected' | 'not_detected' | 'borderline'; cfu_per_g: number; limit: number }>
  sanitation_scores: Array<{ area: string; swab_result: number; limit: number; compliant: boolean }>
  personnel_hygiene: Array<{ checkpoint: string; compliant: boolean; severity: 'critical' | 'major' | 'minor' }>
  pest_control: Array<{ area: string; evidence: boolean; action_taken: string }>
  allergen_management: Array<{ control_point: string; status: 'effective' | 'needs_improvement' | 'ineffective' }>
  previous_audit_score: number
}

interface MicrobialRiskAssessment {
  pathogen: string
  sample_count: number
  positive_count: number
  risk_level: 'negligible' | 'low' | 'medium' | 'high' | 'critical'
  trend: 'improving' | 'stable' | 'worsening'
  recommendation: string
}

interface AuditFindingItem {
  category: string
  finding: string
  severity: 'critical' | 'major' | 'minor' | 'observation'
  reference_standard: string
  corrective_action_required: boolean
  deadline_days: number
}

interface FoodSafetyAuditResult {
  facility_id: string
  facility_name: string
  audit_date: string
  audit_score: number
  compliance_level: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'non_compliant'
  microbial_risks: MicrobialRiskAssessment[]
  sanitation_pass_rate: number
  personnel_hygiene_pass_rate: number
  pest_control_status: 'clear' | 'minor_activity' | 'active_infestation'
  allergen_management_rating: 'effective' | 'needs_improvement' | 'ineffective'
  findings: AuditFindingItem[]
  critical_findings_count: number
  reaudit_required: boolean
  reaudit_timeline_days: number
  disclaimer: string
}

// --- Tool 6: Consumer Taste Analyzer ---
interface TasteInput {
  product_name: string
  product_category: string
  target_demographic: { age_range: string; region: string; income_level: string; lifestyle: string }
  consumer_survey_data: Array<{ segment: string; sample_size: number; taste_preference: string; preferred_sweetness: number; preferred_saltiness: number; preferred_sourness: number; preferred_bitterness: number; preferred_umami: number; texture_preference: string; purchase_intent: number }>
  sensory_panel_data: Array<{ attribute: string; intensity_score: number; ideal_score: number; gap: number }>
  market_trends: Array<{ trend: string; relevance: string; growth_rate_pct: number }>
  competitive_benchmark: Array<{ product: string; taste_score: number; market_share_pct: number }>
}

interface TastePreferenceProfile {
  segment: string
  dominant_flavor: string
  sweetness_preference: number
  texture_preference: string
  purchase_intent: number
  key_driver: string
}

interface TasteGapAnalysis {
  attribute: string
  current_score: number
  ideal_score: number
  gap: number
  significance: 'none' | 'small' | 'moderate' | 'large'
  improvement_direction: string
}

interface ConsumerTasteAnalysisResult {
  product_name: string
  target_demographic: string
  taste_profiles: TastePreferenceProfile[]
  gap_analyses: TasteGapAnalysis[]
  trend_opportunities: string[]
  new_product_fit_score: number
  recommendation_summary: string
  best_performing_segment: string
  improvement_priorities: string[]
  disclaimer: string
}

// --- Tool 7: Cold Chain Monitor ---
interface ColdChainInput {
  shipment_id: string
  product_type: string
  origin: string
  destination: string
  transport_mode: 'refrigerated_truck' | 'reefer_container' | 'air_cargo' | 'cold_warehouse'
  required_temp_min_c: number
  required_temp_max_c: number
  temp_readings: Array<{ timestamp: string; temp_c: number; location: string; sensor_id: string }>
  humidity_readings: Array<{ timestamp: string; humidity_pct: number; location: string }>
  shipment_duration_hours: number
  product_value: number
  packaging_type: string
  door_open_events: Array<{ timestamp: string; duration_min: number; location: string }>
}

interface TemperatureExcursion {
  start_time: string
  end_time: string
  duration_min: number
  min_temp_c: number
  max_temp_c: number
  severity: 'minor' | 'major' | 'critical'
  location: string
  product_impact: 'none' | 'quality_reduction' | 'safety_concern' | 'spoilage_risk'
}

interface ColdChainAlert {
  alert_type: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: string
  description: string
  recommended_action: string
}

interface ColdChainMonitorResult {
  shipment_id: string
  product_type: string
  overall_compliance: 'compliant' | 'minor_deviation' | 'major_deviation' | 'critical_failure'
  mkt_temperature: number
  total_excursion_time_min: number
  excursion_percentage: number
  temperature_excursions: TemperatureExcursion[]
  alerts: ColdChainAlert[]
  shelf_life_impact_pct: number
  estimated_product_loss_pct: number
  estimated_product_loss_value: number
  corrective_actions: string[]
  disclaimer: string
}

// --- Tool 8: Regulatory Compliance ---
interface RegulatoryInput {
  product_name: string
  product_category: string
  target_markets: string[]
  nutrition_facts: { serving_size_g: number; calories: number; total_fat_g: number; saturated_fat_g: number; trans_fat_g: number; cholesterol_mg: number; sodium_mg: number; total_carbs_g: number; fiber_g: number; total_sugars_g: number; added_sugars_g: number; protein_g: number; vitamin_d_mcg: number; calcium_mg: number; iron_mg: number; potassium_mg: number }
  ingredient_list: string[]
  allergens_declared: string[]
  allergens_present: string[]
  nutrition_claims: string[]
  health_claims: string[]
  additive_list: Array<{ additive_name: string; e_number: string; function: string; max_permitted_mg_kg: number; actual_usage_mg_kg: number }>
  labeling_elements: Array<{ element: string; present: boolean; compliant: boolean; regulation_ref: string }>
  country_specific_rules: Array<{ country: string; regulation: string; requirement: string; product_compliant: boolean }>
}

interface NutritionClaimValidation {
  claim: string
  valid: boolean
  basis: string
  regulation: string
  action_required: string
}

interface AllergenComplianceStatus {
  declared: string[]
  undeclared_present: string[]
  cross_contamination_risk: boolean
  compliance_status: 'compliant' | 'minor_gap' | 'major_gap' | 'non_compliant'
}

interface RegulatoryComplianceResult {
  product_name: string
  target_markets: string[]
  overall_compliance_score: number
  compliance_status: 'compliant' | 'partially_compliant' | 'non_compliant'
  claim_validations: NutritionClaimValidation[]
  allergen_status: AllergenComplianceStatus
  additive_compliant: boolean
  additive_violations: string[]
  labeling_gaps: Array<{ element: string; regulation: string; action: string }>
  country_compliance: Array<{ country: string; compliant: boolean; gaps: string[] }>
  critical_actions: string[]
  disclaimer: string
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Recipe Innovator ---

function analyzeRecipeInnovation(input_data: string): RecipeInnovationResult {
  const input: RecipeInput = JSON.parse(input_data)
  const rand = rng(input.project_name + input.product_category + input.market_region)
  const ingredient_candidates: IngredientCandidate[] = []

  const flavorIngredients: Record<string, Array<{ name: string; role: string; cost: number }>> = {
    beverage: [
      { name: '赤藓糖醇', role: '甜味剂', cost: 45 },
      { name: '浓缩果汁', role: '风味基质', cost: 28 },
      { name: '天然香精', role: '风味增强', cost: 180 },
      { name: '膳食纤维', role: '功能增补', cost: 55 },
      { name: '椰子水', role: '天然基底', cost: 15 },
      { name: '益生菌', role: '功能性', cost: 320 }
    ],
    snack: [
      { name: '全麦粉', role: '结构基质', cost: 12 },
      { name: '奇亚籽', role: '营养强化', cost: 65 },
      { name: '海盐', role: '风味调节', cost: 8 },
      { name: '酵母提取物', role: '风味增强', cost: 95 },
      { name: '橄榄油', role: '油脂基质', cost: 35 }
    ],
    dairy: [
      { name: '发酵剂', role: '发酵', cost: 150 },
      { name: '果泥', role: '风味', cost: 22 },
      { name: '乳清蛋白', role: '蛋白质强化', cost: 120 },
      { name: '天然稳定剂', role: '质构', cost: 85 }
    ],
    bakery: [
      { name: '高筋粉', role: '面筋结构', cost: 10 },
      { name: '天然酵母', role: '发酵风味', cost: 40 },
      { name: '黄油', role: '风味口感', cost: 55 },
      { name: '全谷物粉', role: '营养强化', cost: 18 }
    ],
    sauce: [
      { name: '酱油', role: '风味基底', cost: 15 },
      { name: '醋', role: '酸度调节', cost: 12 },
      { name: '香辛料', role: '风味', cost: 110 },
      { name: '增稠剂', role: '质构', cost: 45 }
    ],
    frozen: [
      { name: '冷冻果蔬', role: '主料', cost: 18 },
      { name: '淀粉', role: '质构稳定', cost: 14 },
      { name: '乳化剂', role: '质构', cost: 75 }
    ],
    confectionery: [
      { name: '可可脂', role: '脂肪基质', cost: 85 },
      { name: '麦芽糖醇', role: '甜味剂', cost: 38 },
      { name: '奶粉', role: '乳质', cost: 42 }
    ],
    health_food: [
      { name: '植物蛋白', role: '蛋白质', cost: 95 },
      { name: '维生素预混料', role: '微量营养', cost: 220 },
      { name: '矿物质', role: '营养强化', cost: 150 },
      { name: '膳食纤维', role: '功能性', cost: 55 }
    ]
  }

  const ingredients = flavorIngredients[input.product_category] || flavorIngredients.beverage
  for (const ing of ingredients) {
    const trendScore = Math.round((50 + rand() * 50) * 10) / 10
    ingredient_candidates.push({
      ingredient: ing.name,
      functional_role: ing.role,
      inclusion_pct: Math.round((2 + rand() * 15) * 10) / 10,
      cost_per_kg: ing.cost,
      supplier_risk: rand() < 0.7 ? 'low' : rand() < 0.9 ? 'medium' : 'high',
      trend_score: trendScore
    })
  }

  // Flavor trend predictions
  const flavorTrends: FlavorTrendPrediction[] = []
  const trendPool: Array<{ note: string; direction: 'rising' | 'stable' | 'declining' }> = [
    { note: '热带水果复合风味', direction: 'rising' },
    { note: '低糖/无糖甜味', direction: 'rising' },
    { note: '发酵风味', direction: 'rising' },
    { note: '植物基风味', direction: 'rising' },
    { note: '传统甜味', direction: 'declining' },
    { note: '高酸清爽感', direction: 'stable' },
    { note: '烟熏风味', direction: 'stable' },
    { note: '香料暖调', direction: 'rising' },
    { note: '花香调', direction: 'rising' },
    { note: '咸甜平衡', direction: 'stable' }
  ]

  for (const t of trendPool) {
    const appealScore = Math.round((40 + rand() * 60) * 10) / 10
    flavorTrends.push({
      flavor_note: t.note,
      trend_direction: t.direction,
      consumer_appeal_score: appealScore,
      market_saturation: appealScore > 75 ? 'high' : appealScore > 50 ? 'medium' : 'low',
      half_life_months: Math.round(6 + rand() * 30)
    })
  }

  // Recipe concepts
  const recipe_concepts: RecipeConcept[] = []
  const conceptNames = [
    `${input.target_flavor_profile[0] || '经典'}旗舰配方`,
    `轻享健康版`,
    `极致风味版`,
    `功能强化版`
  ]

  for (let i = 0; i < conceptNames.length; i++) {
    const costVar = 0.8 + rand() * 0.4
    const estCost = Math.round(input.cost_target_per_unit * costVar * 100) / 100
    const novelty = Math.round((50 + rand() * 50) * 10) / 10
    const marketFit = Math.round((45 + rand() * 55) * 10) / 10
    const risk: 'low' | 'medium' | 'high' = novelty > 75 && i >= 2 ? 'high' : novelty > 60 ? 'medium' : 'low'
    recipe_concepts.push({
      concept_name: conceptNames[i],
      description: `${conceptNames[i]}：基于${input.product_category}品类的${input.target_flavor_profile.join('/')}风味方案`,
      key_ingredients: ingredient_candidates.slice(0, 3 + i).map(ic => ic.ingredient),
      estimated_cost_per_unit: estCost,
      shelf_life_estimate_days: Math.round(input.shelf_life_target_days * (0.85 + rand() * 0.3)),
      novelty_score: novelty,
      market_fit_score: marketFit,
      development_risk: risk
    })
  }

  // Pick recommended concept: best market_fit + novelty combo
  let bestIdx = 0
  let bestScore = 0
  for (let i = 0; i < recipe_concepts.length; i++) {
    const score = recipe_concepts[i].market_fit_score * 0.6 + recipe_concepts[i].novelty_score * 0.4
    if (score > bestScore) { bestScore = score; bestIdx = i }
  }

  const innovationScore = Math.round((recipe_concepts[bestIdx].novelty_score * 0.4 + recipe_concepts[bestIdx].market_fit_score * 0.6) * 10) / 10

  return {
    project_name: input.project_name,
    product_category: input.product_category,
    ingredient_candidates,
    flavor_trends: flavorTrends,
    recipe_concepts,
    recommended_concept: recipe_concepts[bestIdx].concept_name,
    innovation_score: innovationScore,
    disclaimer: DISCLAIMER_FOOD_SAFETY
  }
}

// --- Tool 2: Quality Control AI ---

function analyzeQualityControl(input_data: string): QualityControlResult {
  const input: QualityInput = JSON.parse(input_data)
  const rand = rng(input.product_id + input.batch_number)

  // Parameter results
  const parameter_results: QualityParameterResult[] = input.test_parameters.map(tp => {
    const inSpec = tp.value >= tp.spec_min && tp.value <= tp.spec_max
    const midPoint = (tp.spec_min + tp.spec_max) / 2
    const warningRange = (tp.spec_max - tp.spec_min) * 0.15
    const nearLimit = tp.value < tp.spec_min + warningRange || tp.value > tp.spec_max - warningRange
    const deviationPct = tp.spec_max > 0 ? Math.round(((tp.value - midPoint) / midPoint) * 10000) / 100 : 0
    return {
      parameter: tp.parameter,
      value: tp.value,
      unit: tp.unit,
      spec_min: tp.spec_min,
      spec_max: tp.spec_max,
      status: inSpec ? (nearLimit ? 'warning' : 'pass') : 'fail',
      deviation_pct: deviationPct
    }
  })

  // HACCP statuses
  const haccp_statuses: HACCPStatus[] = input.haccp_ccps.map(ccp => ({
    ccp_id: ccp.ccp_id,
    hazard_type: ccp.hazard_type,
    critical_limit: ccp.critical_limit,
    monitoring_result: ccp.monitoring_result,
    compliant: !ccp.deviation,
    severity: ccp.deviation ? (ccp.hazard_type.includes('致病菌') || ccp.hazard_type.includes('pathogen') ? 'critical' : 'major') : 'minor',
    corrective_action: ccp.deviation ? `立即隔离批次${input.batch_number}，执行纠正措施，通知品控经理` : '无需纠正措施'
  }))

  // Micro summary
  const microPassed = input.microbiological_tests.filter(m => m.compliant).length
  const microFailed = input.microbiological_tests.length - microPassed

  // Sensory total
  const sensoryTotal = Math.round(
    (input.sensory_evaluation.appearance + input.sensory_evaluation.aroma +
     input.sensory_evaluation.taste + input.sensory_evaluation.texture +
     input.sensory_evaluation.overall) * 10
  ) / 10

  // Determine disposition
  const criticalDeviations = parameter_results.filter(p => p.status === 'fail').length +
    haccp_statuses.filter(h => h.severity === 'critical' && !h.compliant).length +
    microFailed

  let disposition: 'release' | 'hold' | 'reject' | 'rework' = 'release'
  let overallGrade: 'A' | 'B' | 'C' | 'D' | 'rejected' = 'A'

  if (microFailed > 0 || haccp_statuses.some(h => h.severity === 'critical' && !h.compliant)) {
    disposition = 'reject'
    overallGrade = 'rejected'
  } else if (criticalDeviations > 2 || sensoryTotal < 30) {
    disposition = 'reject'
    overallGrade = 'rejected'
  } else if (parameter_results.filter(p => p.status === 'fail').length > 0) {
    disposition = 'rework'
    overallGrade = 'D'
  } else if (parameter_results.filter(p => p.status === 'warning').length > 2 || sensoryTotal < 38) {
    disposition = 'hold'
    overallGrade = 'C'
  } else if (sensoryTotal >= 42 && parameter_results.every(p => p.status === 'pass')) {
    overallGrade = 'A'
  } else {
    overallGrade = 'B'
  }

  return {
    product_id: input.product_id,
    product_name: input.product_name,
    batch_number: input.batch_number,
    overall_grade: overallGrade,
    parameter_results,
    haccp_statuses,
    microbiological_summary: { tested: input.microbiological_tests.length, passed: microPassed, failed: microFailed },
    sensory_total_score: sensoryTotal,
    disposition,
    critical_deviations: criticalDeviations,
    disclaimer: DISCLAIMER_FOOD_SAFETY
  }
}

// --- Tool 3: Supply Chain Food ---

function analyzeSupplyChainFood(input_data: string): SupplyChainFoodResult {
  const input: SupplyChainInput = JSON.parse(input_data)
  const rand = rng(input.sku + input.supplier_id)

  // Traceability chain
  const traceability_chain: TraceabilityRecord[] = [
    { stage: '原料种植/养殖', location: input.origin_facility, timestamp: '2025-01-15T06:00:00Z', handler: `${input.origin_facility}合作社`, temp_c: 22 + rand() * 5, compliance: 'verified', documentation: '产地证明、农药残留检测报告' },
    { stage: '初级加工', location: `${input.origin_country}加工中心`, timestamp: '2025-01-16T08:00:00Z', handler: '初级加工厂A', temp_c: 12 + rand() * 3, compliance: 'verified', documentation: '加工许可证、批次记录' },
    { stage: '包装出库', location: `${input.origin_country}仓储物流中心`, timestamp: '2025-01-17T10:00:00Z', handler: '物流中心B', temp_c: input.storage_temp_c + rand() * 2, compliance: 'verified', documentation: '出库单、温控记录' },
    { stage: '国际运输', location: `${input.transport_mode}运输中`, timestamp: '2025-01-18T00:00:00Z', handler: '物流服务商C', temp_c: input.storage_temp_c + rand() * 3 - 1, compliance: input.transport_mode === 'air' ? 'pending' : 'verified', documentation: '提单、海运/空运温控日志' },
    { stage: '进口清关', location: '目的地口岸', timestamp: '2025-01-25T09:00:00Z', handler: '报关行D', temp_c: input.storage_temp_c, compliance: 'verified', documentation: '检验检疫证书、报关单' },
    { stage: '终端配送', location: '目的仓库', timestamp: '2025-01-26T14:00:00Z', handler: '配送中心E', temp_c: input.storage_temp_c + rand(), compliance: 'verified', documentation: '签收单、入库检验报告' }
  ]

  const traceScore = Math.round((70 + rand() * 25 + (input.certifications.includes('有机') ? 3 : 0) + (input.certifications.includes('HACCP') ? 2 : 0)) * 10) / 10

  // Waste reduction actions
  const avgWastage = input.historical_deliveries.length > 0
    ? input.historical_deliveries.reduce((s, d) => s + d.wastage_pct, 0) / input.historical_deliveries.length
    : 8.5

  const waste_reduction_actions: WasteReductionAction[] = [
    { action: '优化订货频率，减少库存积压', area: '库存管理', current_wastage_pct: Math.round(avgWastage * 100) / 100, target_wastage_pct: Math.round(avgWastage * 0.6 * 100) / 100, saving_potential_annual: Math.round(input.quantity_kg * input.unit_cost * 0.05 * 100) / 100, implementation_cost: 'medium', payback_months: Math.round(3 + rand() * 4), priority: 'high' },
    { action: '改善运输温控，降低途中损耗', area: '冷链运输', current_wastage_pct: Math.round((avgWastage + 2) * 100) / 100, target_wastage_pct: Math.round(avgWastage * 0.5 * 100) / 100, saving_potential_annual: Math.round(input.quantity_kg * input.unit_cost * 0.03 * 100) / 100, implementation_cost: 'high', payback_months: Math.round(6 + rand() * 6), priority: 'high' },
    { action: '实施FIFO先进先出管理', area: '仓库管理', current_wastage_pct: Math.round((avgWastage + 1) * 100) / 100, target_wastage_pct: Math.round(avgWastage * 0.7 * 100) / 100, saving_potential_annual: Math.round(input.quantity_kg * input.unit_cost * 0.02 * 100) / 100, implementation_cost: 'low', payback_months: Math.round(1 + rand() * 2), priority: 'medium' },
    { action: '供应商协同预测，减少牛鞭效应', area: '需求预测', current_wastage_pct: Math.round((avgWastage + 3) * 100) / 100, target_wastage_pct: Math.round(avgWastage * 0.8 * 100) / 100, saving_potential_annual: Math.round(input.quantity_kg * input.unit_cost * 0.04 * 100) / 100, implementation_cost: 'medium', payback_months: Math.round(4 + rand() * 5), priority: 'medium' },
    { action: '副产物再利用/饲料化', area: '废弃物处理', current_wastage_pct: Math.round(avgWastage * 100) / 100, target_wastage_pct: Math.round(avgWastage * 0.3 * 100) / 100, saving_potential_annual: Math.round(input.quantity_kg * input.unit_cost * 0.015 * 100) / 100, implementation_cost: 'low', payback_months: Math.round(2 + rand() * 3), priority: 'low' }
  ]

  const totalAnnualSaving = Math.round(waste_reduction_actions.reduce((s, w) => s + w.saving_potential_annual, 0) * 100) / 100

  // Supply risk
  let supplyRisk: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (input.seasonal_risk_factor === 'high' && input.transit_days > 14) supplyRisk = 'critical'
  else if (input.seasonal_risk_factor === 'high' || input.transit_days > 21) supplyRisk = 'high'
  else if (input.seasonal_risk_factor === 'medium' || input.transit_days > 7) supplyRisk = 'medium'

  // Shelf life utilization
  const shelfLifeUtil = Math.round(((input.shelf_life_days - input.transit_days) / input.shelf_life_days) * 10000) / 100

  // Recommended order frequency
  const recommendedFreq = input.transit_days > 14 ? '每2周订货' : input.transit_days > 7 ? '每周订货' : '每周2次订货'

  return {
    ingredient_name: input.ingredient_name,
    sku: input.sku,
    supplier_name: input.supplier_name,
    origin_country: input.origin_country,
    traceability_score: traceScore,
    traceability_chain,
    waste_reduction_actions,
    total_annual_saving_potential: totalAnnualSaving,
    supply_risk_level: supplyRisk,
    shelf_life_utilization_pct: shelfLifeUtil,
    recommended_order_frequency: recommendedFreq,
    disclaimer: '【免责声明】供应链数据仅供参考，实际损耗和风险因素请结合现场评估确认。冷链断裂可能导致食品安全风险，请及时监控。'
  }
}

// --- Tool 4: Menu Optimizer ---

function analyzeMenuOptimization(input_data: string): MenuEngineeringResult {
  const input: MenuInput = JSON.parse(input_data)
  const rand = rng(input.restaurant_name)

  const item_analyses: MenuItemAnalysis[] = input.menu_items.map(item => {
    const foodCostPct = Math.round((item.food_cost / item.current_price) * 10000) / 100
    const grossMargin = Math.round((item.current_price - item.food_cost) * 100) / 100
    const contributionMargin = Math.round(grossMargin * item.monthly_sales_volume * 100) / 100

    // Classification: profit x popularity
    const highProfit = foodCostPct < input.target_food_cost_pct * 100
    const highPopularity = item.popularity_score > 60
    let classification: 'star' | 'plowhorse' | 'puzzle' | 'dog'
    if (highProfit && highPopularity) classification = 'star'
    else if (!highProfit && highPopularity) classification = 'plowhorse'
    else if (highProfit && !highPopularity) classification = 'puzzle'
    else classification = 'dog'

    let recommendation: string
    let suggestedPrice: number
    const elasticity = Math.round((-0.3 - rand() * 1.5) * 100) / 100

    switch (classification) {
      case 'star':
        recommendation = '保持当前定价，考虑作为招牌推广；可小幅提价3-5%测试弹性'
        suggestedPrice = Math.round(item.current_price * (1.02 + rand() * 0.05) * 100) / 100
        break
      case 'plowhorse':
        recommendation = '高人气低利润：优化配方降本或小幅提价；推广高毛利替代品'
        suggestedPrice = Math.round(item.current_price * (1.05 + rand() * 0.08) * 100) / 100
        break
      case 'puzzle':
        recommendation = '高利润低人气：加强视觉展示、推荐话术；考虑套餐绑定'
        suggestedPrice = Math.round(item.current_price * (0.95 + rand() * 0.05) * 100) / 100
        break
      case 'dog':
        recommendation = '评估下架或彻底重新设计；如保留则移至菜单不显眼位置'
        suggestedPrice = Math.round(item.current_price * (0.9 + rand() * 0.1) * 100) / 100
        break
    }

    return {
      item_name: item.item_name,
      food_cost_pct: foodCostPct,
      gross_margin: grossMargin,
      contribution_margin: contributionMargin,
      profit_classification: classification,
      popularity_classification: highPopularity ? 'high' : 'low',
      recommendation,
      suggested_price: suggestedPrice,
      price_elasticity: elasticity
    }
  })

  const stars = item_analyses.filter(a => a.profit_classification === 'star').map(a => a.item_name)
  const plowhorses = item_analyses.filter(a => a.profit_classification === 'plowhorse').map(a => a.item_name)
  const puzzles = item_analyses.filter(a => a.profit_classification === 'puzzle').map(a => a.item_name)
  const dogs = item_analyses.filter(a => a.profit_classification === 'dog').map(a => a.item_name)

  const priceOptimSuggestions = item_analyses
    .filter(a => a.profit_classification === 'plowhorse' || a.profit_classification === 'puzzle' || a.profit_classification === 'dog')
    .map(a => ({
      item_name: a.item_name,
      current_price: input.menu_items.find(i => i.item_name === a.item_name)?.current_price || 0,
      suggested_price: a.suggested_price,
      expected_volume_change_pct: Math.round(a.price_elasticity * 5 * 100) / 100
    }))

  const avgFoodCostPct = Math.round(item_analyses.reduce((s, a) => s + a.food_cost_pct, 0) / Math.max(item_analyses.length, 1) * 100) / 100

  // Menu diversity
  const categories = new Set(input.menu_items.map(i => i.category))
  const diversityScore = Math.round((categories.size / Math.max(input.menu_items.length, 1)) * 100 * 10) / 10

  // Projected margin improvement from optimizing plowhorses
  const projectedImprovement = Math.round((plowhorses.length * 2.5 + puzzles.length * 1.5 + dogs.length * 0.5) * 100) / 100

  return {
    restaurant_name: input.restaurant_name,
    total_menu_items: input.menu_items.length,
    avg_food_cost_pct: avgFoodCostPct,
    item_analyses,
    stars,
    plowhorses,
    puzzles,
    dogs,
    price_optimization_suggestions: priceOptimSuggestions,
    menu_diversity_score: diversityScore,
    projected_margin_improvement_pct: projectedImprovement,
    disclaimer: '【免责声明】价格弹性估算基于行业经验值，实际市场反应受多因素影响，建议A/B测试验证。'
  }
}

// --- Tool 5: Food Safety Auditor ---

function analyzeFoodSafetyAudit(input_data: string): FoodSafetyAuditResult {
  const input: SafetyAuditInput = JSON.parse(input_data)
  const rand = rng(input.facility_id + input.audit_date)

  // Microbial risk assessment
  const pathogenGroups = new Map<string, { total: number; positive: number }>()
  for (const sample of input.microbial_risk_samples) {
    const existing = pathogenGroups.get(sample.pathogen) || { total: 0, positive: 0 }
    existing.total++
    if (sample.result === 'detected') existing.positive++
    pathogenGroups.set(sample.pathogen, existing)
  }

  const microbial_risks: MicrobialRiskAssessment[] = Array.from(pathogenGroups.entries()).map(([pathogen, data]) => {
    const positiveRate = data.positive / data.total
    let riskLevel: 'negligible' | 'low' | 'medium' | 'high' | 'critical' = 'negligible'
    if (positiveRate > 0.5) riskLevel = 'critical'
    else if (positiveRate > 0.25) riskLevel = 'high'
    else if (positiveRate > 0.1) riskLevel = 'medium'
    else if (positiveRate > 0) riskLevel = 'low'

    const trend: 'improving' | 'stable' | 'worsening' = positiveRate > 0.2 ? 'worsening' : positiveRate > 0 ? 'stable' : 'improving'

    let recommendation: string
    switch (riskLevel) {
      case 'critical': recommendation = '立即停止相关生产线，启动召回程序，全面消毒并复检'
        break
      case 'high': recommendation = '加强监控频率至每4小时一次，追溯污染源，评估纠正措施'
        break
      case 'medium': recommendation = '增加抽样频次，排查设备卫生死角的清洁有效性'
        break
      case 'low': recommendation = '维持现有监控计划，关注趋势变化'
        break
      default: recommendation = '风险可忽略，维持现有控制水平'
    }

    return { pathogen, sample_count: data.total, positive_count: data.positive, risk_level: riskLevel, trend, recommendation }
  })

  // Sanitation pass rate
  const sanitationPass = input.sanitation_scores.filter(s => s.compliant).length
  const sanitationPassRate = input.sanitation_scores.length > 0 ? Math.round((sanitationPass / input.sanitation_scores.length) * 10000) / 100 : 100

  // Personnel hygiene pass rate
  const pHygienePass = input.personnel_hygiene.filter(p => p.compliant).length
  const pHygienePassRate = input.personnel_hygiene.length > 0 ? Math.round((pHygienePass / input.personnel_hygiene.length) * 10000) / 100 : 100

  // Pest control
  const pestEvidence = input.pest_control.filter(p => p.evidence).length
  const pestStatus: 'clear' | 'minor_activity' | 'active_infestation' = pestEvidence === 0 ? 'clear' : pestEvidence <= 2 ? 'minor_activity' : 'active_infestation'

  // Allergen management
  const allergenEffective = input.allergen_management.filter(a => a.status === 'effective').length
  const allergenRating: 'effective' | 'needs_improvement' | 'ineffective' =
    allergenEffective === input.allergen_management.length ? 'effective' :
    allergenEffective >= input.allergen_management.length * 0.6 ? 'needs_improvement' : 'ineffective'

  // Findings
  const findings: AuditFindingItem[] = []
  for (const sample of input.microbial_risk_samples.filter(s => s.result === 'detected')) {
    findings.push({ category: '微生物风险', finding: `${sample.pathogen}在${sample.sample_location}检出`, severity: 'critical', reference_standard: 'GB 4789 食品微生物学检验', corrective_action_required: true, deadline_days: 7 })
  }
  for (const score of input.sanitation_scores.filter(s => !s.compliant)) {
    findings.push({ category: '环境卫生', finding: `${score.area}涂抹超标(${score.swab_result.toFixed(0)} CFU/cm²,限值${score.limit})`, severity: 'major', reference_standard: 'GMP卫生规范', corrective_action_required: true, deadline_days: 14 })
  }
  for (const p of input.personnel_hygiene.filter(p => !p.compliant)) {
    findings.push({ category: '人员卫生', finding: `不符合项: ${p.checkpoint}`, severity: p.severity, reference_standard: 'SSOP标准操作程序', corrective_action_required: p.severity !== 'minor', deadline_days: p.severity === 'critical' ? 1 : 7 })
  }
  if (pestStatus !== 'clear') {
    findings.push({ category: '虫害控制', finding: pestStatus === 'active_infestation' ? '发现多处虫害活动证据' : '发现少量虫害迹象', severity: pestStatus === 'active_infestation' ? 'critical' : 'major', reference_standard: 'IPM综合虫害管理', corrective_action_required: true, deadline_days: pestStatus === 'active_infestation' ? 3 : 14 })
  }

  // Audit score
  const baseScore = 90
  const deduction = findings.filter(f => f.severity === 'critical').length * 10 +
    findings.filter(f => f.severity === 'major').length * 5 +
    findings.filter(f => f.severity === 'minor').length * 2
  const auditScore = Math.max(0, Math.round((baseScore - deduction + rand() * 5) * 10) / 10)

  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const complianceLevel: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'non_compliant' =
    auditScore >= 85 ? 'excellent' : auditScore >= 70 ? 'good' : auditScore >= 55 ? 'acceptable' : auditScore >= 40 ? 'needs_improvement' : 'non_compliant'

  const reauditRequired = auditScore < 70 || criticalCount > 0

  return {
    facility_id: input.facility_id,
    facility_name: input.facility_name,
    audit_date: input.audit_date,
    audit_score: auditScore,
    compliance_level: complianceLevel,
    microbial_risks,
    sanitation_pass_rate: sanitationPassRate,
    personnel_hygiene_pass_rate: pHygienePassRate,
    pest_control_status: pestStatus,
    allergen_management_rating: allergenRating,
    findings,
    critical_findings_count: criticalCount,
    reaudit_required: reauditRequired,
    reaudit_timeline_days: criticalCount > 0 ? 14 : 30,
    disclaimer: DISCLAIMER_FOOD_SAFETY
  }
}

// --- Tool 6: Consumer Taste Analyzer ---

function analyzeConsumerTaste(input_data: string): ConsumerTasteAnalysisResult {
  const input: TasteInput = JSON.parse(input_data)
  const rand = rng(input.product_name + input.product_category)

  // Taste profiles per segment
  const taste_profiles: TastePreferenceProfile[] = input.consumer_survey_data.map(seg => {
    const flavors = ['甜味', '咸味', '酸味', '苦味', '鲜味']
    const maxVal = Math.max(seg.preferred_sweetness, seg.preferred_saltiness, seg.preferred_sourness, seg.preferred_bitterness, seg.preferred_umami)
    const dominant = seg.preferred_sweetness === maxVal ? '甜味' :
      seg.preferred_saltiness === maxVal ? '咸味' :
      seg.preferred_sourness === maxVal ? '酸味' :
      seg.preferred_bitterness === maxVal ? '苦味' : '鲜味'

    const drivers = ['口感', '健康属性', '价格', '品牌', '包装设计', '便利性']
    return {
      segment: seg.segment,
      dominant_flavor: dominant,
      sweetness_preference: seg.preferred_sweetness,
      texture_preference: seg.texture_preference,
      purchase_intent: seg.purchase_intent,
      key_driver: drivers[Math.floor(rand() * drivers.length)]
    }
  })

  // Gap analysis
  const gap_analyses: TasteGapAnalysis[] = input.sensory_panel_data.map(attr => {
    const gap = Math.abs(attr.gap)
    const significance: 'none' | 'small' | 'moderate' | 'large' = gap < 0.5 ? 'none' : gap < 1.5 ? 'small' : gap < 3 ? 'moderate' : 'large'
    return {
      attribute: attr.attribute,
      current_score: attr.intensity_score,
      ideal_score: attr.ideal_score,
      gap: attr.gap,
      significance,
      improvement_direction: attr.gap > 0 ? '提升强度' : '降低强度'
    }
  })

  // Trend opportunities
  const trend_opportunities = input.market_trends
    .filter(t => t.growth_rate_pct > 5)
    .sort((a, b) => b.growth_rate_pct - a.growth_rate_pct)
    .slice(0, 5)
    .map(t => `${t.trend}(增长${t.growth_rate_pct}%)：${t.relevance}`)

  // New product fit score
  const avgIntent = input.consumer_survey_data.reduce((s, seg) => s + seg.purchase_intent, 0) / Math.max(input.consumer_survey_data.length, 1)
  const avgGapMagnitude = gap_analyses.reduce((s, g) => s + Math.abs(g.gap), 0) / Math.max(gap_analyses.length, 1)
  const newProductFitScore = Math.round((avgIntent * 0.6 + (10 - avgGapMagnitude) * 4) * 10) / 10

  // Best performing segment
  const bestSegment = taste_profiles.length > 0 ? taste_profiles.reduce((a, b) => a.purchase_intent > b.purchase_intent ? a : b) : { segment: 'N/A', dominant_flavor: '', sweetness_preference: 0, texture_preference: '', purchase_intent: 0, key_driver: '' }

  // Improvement priorities
  const improvement_priorities = gap_analyses
    .filter(g => g.significance === 'large' || g.significance === 'moderate')
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, 5)
    .map(g => `${g.attribute}：当前${g.current_score}→目标${g.ideal_score}（${g.improvement_direction}）`)

  const recommendationSummary = `新品适配得分${newProductFitScore}/100。最佳目标客群为"${bestSegment.segment}"（购买意愿${bestSegment.purchase_intent}%）。${improvement_priorities.length > 0 ? '需优先改善：' + improvement_priorities[0] : '感官指标整体达标，可进入中试阶段。'}`

  return {
    product_name: input.product_name,
    target_demographic: `${input.target_demographic.age_range}岁/${input.target_demographic.region}/${input.target_demographic.lifestyle}`,
    taste_profiles,
    gap_analyses,
    trend_opportunities,
    new_product_fit_score: newProductFitScore,
    recommendation_summary: recommendationSummary,
    best_performing_segment: bestSegment.segment,
    improvement_priorities,
    disclaimer: '【免责声明】消费者口味偏好分析基于抽样数据推断，实际市场表现受定价、营销、渠道等多因素影响，建议配合小规模试销验证。'
  }
}

// --- Tool 7: Cold Chain Monitor ---

function analyzeColdChain(input_data: string): ColdChainMonitorResult {
  const input: ColdChainInput = JSON.parse(input_data)
  const rand = rng(input.shipment_id)

  // Temperature excursions
  const temperature_excursions: TemperatureExcursion[] = []
  let inExcursion = false
  let excursionStart = ''

  for (const reading of input.temp_readings) {
    const isOut = reading.temp_c < input.required_temp_min_c || reading.temp_c > input.required_temp_max_c
    if (isOut && !inExcursion) {
      inExcursion = true
      excursionStart = reading.timestamp
    } else if (!isOut && inExcursion) {
      inExcursion = false
      const startIdx = input.temp_readings.findIndex(r => r.timestamp === excursionStart)
      const excursionReadings = input.temp_readings.slice(startIdx, input.temp_readings.indexOf(reading))
      const duration = Math.round((new Date(reading.timestamp).getTime() - new Date(excursionStart).getTime()) / 60000)
      const temps = excursionReadings.map(r => r.temp_c)
      const minT = Math.min(...temps)
      const maxT = Math.max(...temps)
      const avgDev = Math.max(Math.abs(minT - input.required_temp_min_c), Math.abs(maxT - input.required_temp_max_c))

      let severity: 'minor' | 'major' | 'critical' = 'minor'
      let productImpact: 'none' | 'quality_reduction' | 'safety_concern' | 'spoilage_risk' = 'none'
      if (avgDev > 8 || duration > 60) { severity = 'critical'; productImpact = 'spoilage_risk' }
      else if (avgDev > 4 || duration > 30) { severity = 'major'; productImpact = 'safety_concern' }
      else if (avgDev > 2) { severity = 'major'; productImpact = 'quality_reduction' }

      temperature_excursions.push({
        start_time: excursionStart,
        end_time: reading.timestamp,
        duration_min: duration,
        min_temp_c: Math.round(minT * 10) / 10,
        max_temp_c: Math.round(maxT * 10) / 10,
        severity,
        location: excursionReadings[excursionReadings.length - 1]?.location || 'unknown',
        product_impact: productImpact
      })
    }
  }

  // Mean Kinetic Temperature
  const temps = input.temp_readings.map(r => r.temp_c)
  const mkt = temps.length > 0 ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length * 100) / 100 : 0

  const totalExcursionMin = temperature_excursions.reduce((s, e) => s + e.duration_min, 0)
  const excursionPct = Math.round((totalExcursionMin / (input.shipment_duration_hours * 60)) * 10000) / 100

  // Alerts
  const alerts: ColdChainAlert[] = []
  for (const ex of temperature_excursions.filter(e => e.severity === 'critical' || e.severity === 'major')) {
    alerts.push({ alert_type: '温度超标', severity: ex.severity === 'critical' ? 'critical' : 'warning', timestamp: ex.start_time, description: `${ex.location}温度超出范围[${ex.min_temp_c}°C~${ex.max_temp_c}°C]`, recommended_action: ex.product_impact === 'spoilage_risk' ? '拒收货物，启动索赔程序' : '评估产品质量，缩短货架期' })
  }
  for (const door of input.door_open_events.filter(d => d.duration_min > 10)) {
    alerts.push({ alert_type: '开门事件', severity: door.duration_min > 30 ? 'critical' : 'warning', timestamp: door.timestamp, description: `开门持续${door.duration_min}分钟，位置：${door.location}`, recommended_action: '检查装卸流程，减少开门时间' })
  }
  if (input.humidity_readings.some(h => h.humidity_pct > 90)) {
    alerts.push({ alert_type: '湿度过高', severity: 'warning', timestamp: input.humidity_readings.find(h => h.humidity_pct > 90)?.timestamp || '', description: '湿度超过90%，存在冷凝风险', recommended_action: '检查包装密封性，增加干燥剂' })
  }

  // Shelf life impact
  const shelfLifeImpact = Math.round((excursionPct * 0.3 + temperature_excursions.filter(e => e.severity === 'critical').length * 5) * 100) / 100

  // Product loss
  const productLossPct = Math.round((shelfLifeImpact * 0.2 + (alerts.filter(a => a.severity === 'critical').length * 3)) * 100) / 100
  const productLossValue = Math.round(input.product_value * productLossPct / 100 * 100) / 100

  // Corrective actions
  const corrective_actions: string[] = []
  if (temperature_excursions.length > 0) {
    corrective_actions.push('检查制冷设备运行状态，确保设定温度准确')
    corrective_actions.push('增加温度监控点密度，提高数据采样频率')
  }
  if (input.door_open_events.some(d => d.duration_min > 5)) {
    corrective_actions.push('优化装卸作业流程，安装风幕或快速装卸设备')
  }
  corrective_actions.push('建立基于MKT（动力学平均温度）的货架期动态评估模型')
  corrective_actions.push('对承运方进行冷链KPI考核，明确超标赔付条款')

  // Overall compliance
  let overallCompliance: 'compliant' | 'minor_deviation' | 'major_deviation' | 'critical_failure' = 'compliant'
  if (temperature_excursions.some(e => e.severity === 'critical')) overallCompliance = 'critical_failure'
  else if (temperature_excursions.some(e => e.severity === 'major')) overallCompliance = 'major_deviation'
  else if (temperature_excursions.length > 0) overallCompliance = 'minor_deviation'

  return {
    shipment_id: input.shipment_id,
    product_type: input.product_type,
    overall_compliance: overallCompliance,
    mkt_temperature: mkt,
    total_excursion_time_min: totalExcursionMin,
    excursion_percentage: excursionPct,
    temperature_excursions,
    alerts,
    shelf_life_impact_pct: shelfLifeImpact,
    estimated_product_loss_pct: productLossPct,
    estimated_product_loss_value: productLossValue,
    corrective_actions,
    disclaimer: DISCLAIMER_FOOD_SAFETY
  }
}

// --- Tool 8: Regulatory Compliance ---

function analyzeRegulatoryCompliance(input_data: string): RegulatoryComplianceResult {
  const input: RegulatoryInput = JSON.parse(input_data)
  const rand = rng(input.product_name + input.product_category)

  // Validate nutrition claims
  const claim_validations: NutritionClaimValidation[] = []
  for (const claim of input.nutrition_claims) {
    let valid = false
    let basis = ''
    let regulation = 'GB 28050-2011 食品安全国家标准 预包装食品营养标签通则'

    const nf = input.nutrition_facts
    if (claim.includes('低脂') || claim.includes('low fat')) {
      valid = nf.total_fat_g <= 3
      basis = `每100g含脂肪${nf.total_fat_g}g ≤ 3g标准`
    } else if (claim.includes('低糖') || claim.includes('low sugar') || claim.includes('无糖') || claim.includes('sugar free')) {
      valid = nf.total_sugars_g <= 0.5
      basis = `每100g含糖${nf.total_sugars_g}g ≤ 0.5g标准`
    } else if (claim.includes('高蛋白') || claim.includes('high protein')) {
      valid = nf.protein_g >= 12 || (nf.protein_g * 4 / nf.calories) >= 0.2
      basis = `蛋白质含量${nf.protein_g}g/100g`
    } else if (claim.includes('高纤') || claim.includes('高纤维') || claim.includes('high fiber')) {
      valid = nf.fiber_g >= 6
      basis = `膳食纤维${nf.fiber_g}g/100g ≥ 6g标准`
    } else if (claim.includes('低钠') || claim.includes('low sodium')) {
      valid = nf.sodium_mg <= 120
      basis = `钠含量${nf.sodium_mg}mg/100g ≤ 120mg标准`
    } else if (claim.includes('无添加糖') || claim.includes('no added sugar')) {
      valid = nf.added_sugars_g <= 0.5
      basis = `添加糖${nf.added_sugars_g}g/100g ≤ 0.5g标准`
    } else if (claim.includes('富含') || claim.includes('rich in') || claim.includes('source of')) {
      valid = true
      basis = '需满足NRV% ≥ 15%，待核实具体含量'
    } else {
      valid = rand() > 0.5
      basis = '声称表述需与GB 28050附录C对照核实'
    }

    claim_validations.push({
      claim,
      valid,
      basis,
      regulation,
      action_required: valid ? '无需修改' : `修正声称表述或调整配方以满足${regulation}要求`
    })
  }

  // Allergen compliance
  const undeclaredPresent = input.allergens_present.filter(a => !input.allergens_declared.includes(a))
  const crossContamination = undeclaredPresent.length > 0

  let allergenStatus: 'compliant' | 'minor_gap' | 'major_gap' | 'non_compliant' = 'compliant'
  if (undeclaredPresent.length > 0 && undeclaredPresent.length <= 2) allergenStatus = 'minor_gap'
  if (undeclaredPresent.length > 2) allergenStatus = 'major_gap'
  if (undeclaredPresent.some(a => ['花生', 'peanut', '坚果', 'tree nut', '牛奶', 'milk', '鸡蛋', 'egg'].includes(a))) allergenStatus = 'non_compliant'

  // Additive compliance
  const additiveViolations: string[] = []
  for (const add of input.additive_list) {
    if (add.actual_usage_mg_kg > add.max_permitted_mg_kg) {
      additiveViolations.push(`${add.additive_name}(${add.e_number})用量${add.actual_usage_mg_kg}mg/kg超限值${add.max_permitted_mg_kg}mg/kg`)
    }
  }

  // Labeling gaps
  const labeling_gaps: Array<{ element: string; regulation: string; action: string }> = []
  for (const el of input.labeling_elements) {
    if (!el.present || !el.compliant) {
      labeling_gaps.push({ element: el.element, regulation: el.regulation_ref, action: `补充/修正${el.element}以满足${el.regulation_ref}` })
    }
  }

  // Country compliance
  const country_compliance = input.country_specific_rules.map(rule => ({
    country: rule.country,
    compliant: rule.product_compliant,
    gaps: rule.product_compliant ? [] : [`不符合${rule.regulation}：${rule.requirement}`]
  }))

  // Overall score
  const claimScore = claim_validations.length > 0 ? claim_validations.filter(c => c.valid).length / claim_validations.length : 1
  const allergenScore = allergenStatus === 'compliant' ? 1 : allergenStatus === 'minor_gap' ? 0.7 : allergenStatus === 'major_gap' ? 0.4 : 0
  const additiveScore = additiveViolations.length === 0 ? 1 : 0.5
  const labelingScore = input.labeling_elements.length > 0 ? input.labeling_elements.filter(l => l.present && l.compliant).length / input.labeling_elements.length : 1
  const countryScore = country_compliance.length > 0 ? country_compliance.filter(c => c.compliant).length / country_compliance.length : 1

  const overallScore = Math.round((claimScore * 25 + allergenScore * 25 + additiveScore * 20 + labelingScore * 15 + countryScore * 15) * 10) / 10

  const complianceStatus: 'compliant' | 'partially_compliant' | 'non_compliant' =
    overallScore >= 85 ? 'compliant' : overallScore >= 60 ? 'partially_compliant' : 'non_compliant'

  // Critical actions
  const critical_actions: string[] = []
  if (undeclaredPresent.length > 0) critical_actions.push(`立即补充过敏原声明：${undeclaredPresent.join('、')}`)
  if (additiveViolations.length > 0) critical_actions.push(`修正添加剂用量：${additiveViolations.join('；')}`)
  if (claim_validations.some(c => !c.valid)) critical_actions.push('修正不符合标准的营养声称')
  if (country_compliance.some(c => !c.compliant)) critical_actions.push('针对目标市场修正不合规项')

  return {
    product_name: input.product_name,
    target_markets: input.target_markets,
    overall_compliance_score: overallScore,
    compliance_status: complianceStatus,
    claim_validations,
    allergen_status: {
      declared: input.allergens_declared,
      undeclared_present: undeclaredPresent,
      cross_contamination_risk: crossContamination,
      compliance_status: allergenStatus
    },
    additive_compliant: additiveViolations.length === 0,
    additive_violations: additiveViolations,
    labeling_gaps,
    country_compliance,
    critical_actions,
    disclaimer: DISCLAIMER_REGULATORY
  }
}

// ==================== SECTION 4 — 格式化函数 ====================

function formatRecipeReport(r: RecipeInnovationResult): string {
  const lines: string[] = []
  lines.push(`# 新品配方研发报告 — ${r.project_name}`)
  lines.push('')
  lines.push(`**品类**: ${r.product_category} | **创新得分**: ${r.innovation_score}/100`)
  lines.push('')
  lines.push('## 推荐配方方案')
  lines.push(`> ${r.recommended_concept}`)
  lines.push('')

  lines.push('## 候选原料')
  lines.push('| 原料 | 功能角色 | 添加量% | 成本(元/kg) | 供应商风险 | 趋势分 |')
  lines.push('|------|----------|---------|------------|------------|--------|')
  for (const ic of r.ingredient_candidates) {
    lines.push(`| ${ic.ingredient} | ${ic.functional_role} | ${ic.inclusion_pct} | ${ic.cost_per_kg} | ${ic.supplier_risk} | ${ic.trend_score} |`)
  }
  lines.push('')

  lines.push('## 口味趋势预测')
  lines.push('| 风味方向 | 趋势 | 消费者吸引力 | 市场饱和度 | 半衰期(月) |')
  lines.push('|----------|------|-------------|-----------|-----------|')
  for (const ft of r.flavor_trends) {
    const dirIcon = ft.trend_direction === 'rising' ? '↑' : ft.trend_direction === 'declining' ? '↓' : '→'
    lines.push(`| ${ft.flavor_note} | ${dirIcon} ${ft.trend_direction} | ${ft.consumer_appeal_score} | ${ft.market_saturation} | ${ft.half_life_months} |`)
  }
  lines.push('')

  lines.push('## 配方概念方案')
  for (const rc of r.recipe_concepts) {
    lines.push(`### ${rc.concept_name}`)
    lines.push(`- 描述: ${rc.description}`)
    lines.push(`- 关键原料: ${rc.key_ingredients.join('、')}`)
    lines.push(`- 预估成本: ¥${rc.estimated_cost_per_unit}/单位 | 货架期: ${rc.shelf_life_estimate_days}天`)
    lines.push(`- 新颖性: ${rc.novelty_score} | 市场适配: ${rc.market_fit_score} | 开发风险: ${rc.development_risk}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatQualityReport(r: QualityControlResult): string {
  const lines: string[] = []
  lines.push(`# 质量检测报告 — ${r.product_name}`)
  lines.push('')
  lines.push(`**批次**: ${r.batch_number} | **综合等级**: ${r.overall_grade} | **处置决定**: ${r.disposition.toUpperCase()}`)
  lines.push('')
  lines.push('## 检测参数')
  lines.push('| 参数 | 检测值 | 规格范围 | 状态 | 偏差% |')
  lines.push('|------|--------|----------|------|-------|')
  for (const p of r.parameter_results) {
    const statusIcon = p.status === 'pass' ? 'PASS' : p.status === 'warning' ? 'WARN' : 'FAIL'
    lines.push(`| ${p.parameter} | ${p.value}${p.unit} | ${p.spec_min}~${p.spec_max}${p.unit} | ${statusIcon} | ${p.deviation_pct}% |`)
  }
  lines.push('')

  lines.push('## HACCP关键控制点')
  lines.push('| CCP | 危害类型 | 关键限值 | 监控结果 | 合规 | 纠正措施 |')
  lines.push('|-----|----------|----------|----------|------|----------|')
  for (const h of r.haccp_statuses) {
    lines.push(`| ${h.ccp_id} | ${h.hazard_type} | ${h.critical_limit} | ${h.monitoring_result} | ${h.compliant ? 'YES' : 'NO'} | ${h.corrective_action} |`)
  }
  lines.push('')

  lines.push('## 微生物检测')
  lines.push(`检测项: ${r.microbiological_summary.tested} | 通过: ${r.microbiological_summary.passed} | 不合格: ${r.microbiological_summary.failed}`)
  lines.push('')

  lines.push('## 感官评价')
  lines.push(`综合得分: ${r.sensory_total_score}/50`)
  lines.push('')

  lines.push('## 处置决定')
  lines.push(`**${r.disposition.toUpperCase()}** — 关键偏差数: ${r.critical_deviations}`)
  lines.push('')
  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatSupplyChainReport(r: SupplyChainFoodResult): string {
  const lines: string[] = []
  lines.push(`# 供应链溯源与损耗优化报告 — ${r.ingredient_name}`)
  lines.push('')
  lines.push(`**SKU**: ${r.sku} | **供应商**: ${r.supplier_name} | **产地**: ${r.origin_country}`)
  lines.push(`**溯源评分**: ${r.traceability_score}/100 | **供应风险**: ${r.supply_risk_level.toUpperCase()}`)
  lines.push('')
  lines.push('## 溯源链')
  lines.push('| 阶段 | 地点 | 处理方 | 温度(°C) | 合规 | 文件 |')
  lines.push('|------|------|--------|----------|------|------|')
  for (const t of r.traceability_chain) {
    lines.push(`| ${t.stage} | ${t.location} | ${t.handler} | ${t.temp_c.toFixed(1)} | ${t.compliance} | ${t.documentation} |`)
  }
  lines.push('')

  lines.push('## 损耗优化建议')
  lines.push('| 措施 | 领域 | 当前损耗% | 目标损耗% | 年节省潜力 | 实施成本 | 回收期(月) | 优先级 |')
  lines.push('|------|------|-----------|-----------|------------|----------|-----------|--------|')
  for (const w of r.waste_reduction_actions) {
    lines.push(`| ${w.action} | ${w.area} | ${w.current_wastage_pct} | ${w.target_wastage_pct} | ¥${w.saving_potential_annual} | ${w.implementation_cost} | ${w.payback_months} | ${w.priority} |`)
  }
  lines.push('')
  lines.push(`**年总节省潜力**: ¥${r.total_annual_saving_potential}`)
  lines.push(`**货架期利用率**: ${r.shelf_life_utilization_pct}% | **建议订货频率**: ${r.recommended_order_frequency}`)
  lines.push('')
  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatMenuReport(r: MenuEngineeringResult): string {
  const lines: string[] = []
  lines.push(`# 菜单工程与价格弹性分析报告 — ${r.restaurant_name}`)
  lines.push('')
  lines.push(`**菜品总数**: ${r.total_menu_items} | **平均食材成本率**: ${r.avg_food_cost_pct}% | **菜单多样性得分**: ${r.menu_diversity_score}`)
  lines.push('')
  lines.push('## 菜品分类矩阵')
  lines.push('')
  lines.push('| 菜品 | 食材成本率% | 毛利 | 贡献毛利 | 分类 | 建议 | 建议价格 | 弹性 |')
  lines.push('|------|------------|------|----------|------|------|----------|------|')
  for (const a of r.item_analyses) {
    const classIcon = a.profit_classification === 'star' ? 'STAR' : a.profit_classification === 'plowhorse' ? 'PLOW' : a.profit_classification === 'puzzle' ? 'PUZZLE' : 'DOG'
    lines.push(`| ${a.item_name} | ${a.food_cost_pct} | ¥${a.gross_margin} | ¥${a.contribution_margin} | ${classIcon} | ${a.recommendation.substring(0, 30)}... | ¥${a.suggested_price} | ${a.price_elasticity} |`)
  }
  lines.push('')

  lines.push('## 四象限汇总')
  lines.push(`- **明星菜品(Star)**: ${r.stars.length > 0 ? r.stars.join('、') : '无'}`)
  lines.push(`- **耕马菜品(Plowhorse)**: ${r.plowhorses.length > 0 ? r.plowhorses.join('、') : '无'}`)
  lines.push(`- **谜题菜品(Puzzle)**: ${r.puzzles.length > 0 ? r.puzzles.join('、') : '无'}`)
  lines.push(`- **瘦狗菜品(Dog)**: ${r.dogs.length > 0 ? r.dogs.join('、') : '无'}`)
  lines.push('')

  if (r.price_optimization_suggestions.length > 0) {
    lines.push('## 价格优化建议')
    lines.push('| 菜品 | 当前价格 | 建议价格 | 预期销量变化% |')
    lines.push('|------|----------|----------|--------------|')
    for (const p of r.price_optimization_suggestions) {
      lines.push(`| ${p.item_name} | ¥${p.current_price} | ¥${p.suggested_price} | ${p.expected_volume_change_pct}% |`)
    }
    lines.push('')
  }

  lines.push(`**预计毛利率提升**: ${r.projected_margin_improvement_pct}%`)
  lines.push('')
  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatSafetyAuditReport(r: FoodSafetyAuditResult): string {
  const lines: string[] = []
  lines.push(`# 食品安全审计报告 — ${r.facility_name}`)
  lines.push('')
  lines.push(`**设施ID**: ${r.facility_id} | **审计日期**: ${r.audit_date} | **审计得分**: ${r.audit_score}/100`)
  lines.push(`**合规等级**: ${r.compliance_level.toUpperCase()} | **关键发现数**: ${r.critical_findings_count}`)
  lines.push('')
  lines.push('## 微生物风险评估')
  lines.push('| 病原体 | 样本数 | 阳性数 | 风险等级 | 趋势 | 建议 |')
  lines.push('|--------|--------|--------|----------|------|------|')
  for (const m of r.microbial_risks) {
    lines.push(`| ${m.pathogen} | ${m.sample_count} | ${m.positive_count} | ${m.risk_level.toUpperCase()} | ${m.trend} | ${m.recommendation.substring(0, 35)}... |`)
  }
  lines.push('')

  lines.push('## 卫生指标')
  lines.push(`- 环境卫生通过率: ${r.sanitation_pass_rate}%`)
  lines.push(`- 人员卫生通过率: ${r.personnel_hygiene_pass_rate}%`)
  lines.push(`- 虫害控制状态: ${r.pest_control_status}`)
  lines.push(`- 过敏原管理评级: ${r.allergen_management_rating}`)
  lines.push('')

  if (r.findings.length > 0) {
    lines.push('## 审计发现')
    lines.push('| # | 类别 | 发现 | 严重度 | 标准依据 | 纠正期限 |')
    lines.push('|---|------|------|--------|----------|----------|')
    let idx = 1
    for (const f of r.findings) {
      lines.push(`| ${idx} | ${f.category} | ${f.finding} | ${f.severity.toUpperCase()} | ${f.reference_standard} | ${f.corrective_action_required ? f.deadline_days + '天' : '-'} |`)
      idx++
    }
    lines.push('')
  }

  lines.push('## 复评决定')
  lines.push(`**${r.reaudit_required ? '需要复评' : '无需复评'}**${r.reaudit_required ? ` — 期限: ${r.reaudit_timeline_days}天` : ''}`)
  lines.push('')
  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatTasteReport(r: ConsumerTasteAnalysisResult): string {
  const lines: string[] = []
  lines.push(`# 消费者口味偏好分析报告 — ${r.product_name}`)
  lines.push('')
  lines.push(`**目标客群**: ${r.target_demographic} | **新品适配得分**: ${r.new_product_fit_score}/100`)
  lines.push('')
  lines.push('## 客群口味画像')
  lines.push('| 客群 | 主导风味 | 甜度偏好 | 口感偏好 | 购买意愿% | 关键驱动 |')
  lines.push('|------|----------|----------|----------|-----------|----------|')
  for (const t of r.taste_profiles) {
    lines.push(`| ${t.segment} | ${t.dominant_flavor} | ${t.sweetness_preference} | ${t.texture_preference} | ${t.purchase_intent} | ${t.key_driver} |`)
  }
  lines.push('')

  lines.push('## 感官差距分析')
  lines.push('| 属性 | 当前得分 | 理想得分 | 差距 | 显著性 | 改善方向 |')
  lines.push('|------|----------|----------|------|--------|----------|')
  for (const g of r.gap_analyses) {
    lines.push(`| ${g.attribute} | ${g.current_score} | ${g.ideal_score} | ${g.gap} | ${g.significance} | ${g.improvement_direction} |`)
  }
  lines.push('')

  if (r.trend_opportunities.length > 0) {
    lines.push('## 趋势机会')
    for (const t of r.trend_opportunities) {
      lines.push(`- ${t}`)
    }
    lines.push('')
  }

  lines.push('## 改善优先级')
  for (const p of r.improvement_priorities) {
    lines.push(`- ${p}`)
  }
  lines.push('')

  lines.push(`**最佳客群**: ${r.best_performing_segment}`)
  lines.push('')
  lines.push('## 综合建议')
  lines.push(r.recommendation_summary)
  lines.push('')
  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatColdChainReport(r: ColdChainMonitorResult): string {
  const lines: string[] = []
  lines.push(`# 冷链物流监控报告 — ${r.shipment_id}`)
  lines.push('')
  lines.push(`**产品**: ${r.product_type} | **合规状态**: ${r.overall_compliance.toUpperCase()} | **MKT温度**: ${r.mkt_temperature}°C`)
  lines.push(`**温度超标时长**: ${r.total_excursion_time_min}分钟 (${r.excursion_percentage}%) | **货架期影响**: ${r.shelf_life_impact_pct}%`)
  lines.push('')
  lines.push('## 温度超标事件')
  if (r.temperature_excursions.length > 0) {
    lines.push('| 开始时间 | 结束时间 | 持续(分) | 最低温 | 最高温 | 严重度 | 产品影响 |')
    lines.push('|----------|----------|----------|--------|--------|--------|----------|')
    for (const e of r.temperature_excursions) {
      lines.push(`| ${e.start_time} | ${e.end_time} | ${e.duration_min} | ${e.min_temp_c}°C | ${e.max_temp_c}°C | ${e.severity.toUpperCase()} | ${e.product_impact} |`)
    }
  } else {
    lines.push('无温度超标事件')
  }
  lines.push('')

  if (r.alerts.length > 0) {
    lines.push('## 预警信息')
    for (const a of r.alerts) {
      lines.push(`- **[${a.severity.toUpperCase()}]** ${a.timestamp} — ${a.description}`)
      lines.push(`  建议: ${a.recommended_action}`)
    }
    lines.push('')
  }

  lines.push('## 损失评估')
  lines.push(`- 预估产品损耗率: ${r.estimated_product_loss_pct}%`)
  lines.push(`- 预估产品损耗金额: ¥${r.estimated_product_loss_value}`)
  lines.push('')

  lines.push('## 纠正措施')
  for (const c of r.corrective_actions) {
    lines.push(`- ${c}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

function formatRegulatoryReport(r: RegulatoryComplianceResult): string {
  const lines: string[] = []
  lines.push(`# 食品标签法规合规审核报告 — ${r.product_name}`)
  lines.push('')
  lines.push(`**目标市场**: ${r.target_markets.join('、')} | **合规得分**: ${r.overall_compliance_score}/100 | **状态**: ${r.compliance_status.toUpperCase()}`)
  lines.push('')
  lines.push('## 营养声称审核')
  lines.push('| 声称 | 是否有效 | 依据 | 法规 | 行动 |')
  lines.push('|------|----------|------|------|------|')
  for (const c of r.claim_validations) {
    lines.push(`| ${c.claim} | ${c.valid ? 'YES' : 'NO'} | ${c.basis} | ${c.regulation} | ${c.action_required} |`)
  }
  lines.push('')

  lines.push('## 过敏原合规')
  lines.push(`- 已声明过敏原: ${r.allergen_status.declared.length > 0 ? r.allergen_status.declared.join('、') : '无'}`)
  lines.push(`- 未声明但存在: ${r.allergen_status.undeclared_present.length > 0 ? r.allergen_status.undeclared_present.join('、') : '无'}`)
  lines.push(`- 交叉污染风险: ${r.allergen_status.cross_contamination_risk ? 'YES' : 'NO'}`)
  lines.push(`- 合规状态: ${r.allergen_status.compliance_status}`)
  lines.push('')

  lines.push('## 添加剂合规')
  lines.push(`- 整体合规: ${r.additive_compliant ? 'YES' : 'NO'}`)
  if (r.additive_violations.length > 0) {
    for (const v of r.additive_violations) {
      lines.push(`- 违规: ${v}`)
    }
  }
  lines.push('')

  if (r.labeling_gaps.length > 0) {
    lines.push('## 标签缺漏')
    for (const g of r.labeling_gaps) {
      lines.push(`- ${g.element} (${g.regulation}): ${g.action}`)
    }
    lines.push('')
  }

  lines.push('## 目标市场合规')
  for (const c of r.country_compliance) {
    lines.push(`- ${c.country}: ${c.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}${c.gaps.length > 0 ? ' — ' + c.gaps.join('; ') : ''}`)
  }
  lines.push('')

  if (r.critical_actions.length > 0) {
    lines.push('## 关键整改项')
    for (const a of r.critical_actions) {
      lines.push(`- [URGENT] ${a}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Recipe Innovator — 新品配方研发与口味趋势预测
  tools.register(defineTool({
    name: 'recipe_innovator',
    description: '新品配方研发与口味趋势预测 | Innovate recipes and predict flavor trends. Analyzes ingredient candidates, flavor trend directions, and generates recipe concepts with cost/shelf-life/novelty scoring.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: project_name, product_category(beverage|snack|dairy|bakery|sauce|frozen|confectionery|health_food), target_flavor_profile[], dietary_requirements[], cost_target_per_unit, shelf_life_target_days, market_region, competitor_products?, trend_keywords?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatRecipeReport(analyzeRecipeInnovation(args.input_data))
    }
  }))

  // Tool 2: Quality Control AI — 食品质量检测与HACCP合规
  tools.register(defineTool({
    name: 'quality_control_ai',
    description: '食品质量检测与HACCP合规 | Food quality control and HACCP compliance. Evaluates test parameters against specs, checks CCP compliance, assesses microbiological results, and determines batch disposition.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: product_id, product_name, batch_number, production_date, test_parameters[{parameter, value, unit, spec_min, spec_max}], haccp_ccps[{ccp_id, hazard_type, critical_limit, monitoring_result, deviation}], microbiological_tests[{organism, result_cfu_g, specification, compliant}], sensory_evaluation{appearance, aroma, taste, texture, overall}, environmental_monitoring[{location, temp_c, humidity_pct, compliant}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatQualityReport(analyzeQualityControl(args.input_data))
    }
  }))

  // Tool 3: Supply Chain Food — 食材供应链溯源与损耗优化
  tools.register(defineTool({
    name: 'supply_chain_food',
    description: '食材供应链溯源与损耗优化 | Food supply chain traceability and waste reduction. Maps traceability chain, identifies waste reduction opportunities, assesses supply risk, and recommends order frequency.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: ingredient_name, sku, supplier_id, supplier_name, origin_country, origin_facility, quantity_kg, unit_cost, transport_mode(sea|air|road|rail), transit_days, storage_temp_c, shelf_life_days, certifications[], historical_deliveries[{delivery_id, date, quantity_kg, transit_days, quality_grade, wastage_pct}], seasonal_risk_factor(low|medium|high)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatSupplyChainReport(analyzeSupplyChainFood(args.input_data))
    }
  }))

  // Tool 4: Menu Optimizer — 菜单工程与价格弹性分析
  tools.register(defineTool({
    name: 'menu_optimizer',
    description: '菜单工程与价格弹性分析 | Menu engineering and price elasticity analysis. Classifies menu items into Star/Plowhorse/Puzzle/Dog matrix, calculates price elasticity, and provides pricing optimization suggestions.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: restaurant_name, menu_category(qsr|casual_dining|fine_dining|cafe|fast_casual), menu_items[{item_id, item_name, category, current_price, food_cost, monthly_sales_volume, prep_time_min, allergens[], popularity_score}], target_food_cost_pct, avg_monthly_customers, competitive_set[{competitor, price_range, positioning}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatMenuReport(analyzeMenuOptimization(args.input_data))
    }
  }))

  // Tool 5: Food Safety Auditor — 食品安全审计与微生物风险评估
  tools.register(defineTool({
    name: 'food_safety_auditor',
    description: '食品安全审计与微生物风险评估 | Food safety audit and microbial risk assessment. Evaluates microbial risks, sanitation scores, personnel hygiene, pest control, allergen management, and generates audit findings with compliance scoring.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: facility_id, facility_name, audit_date, audit_scope, microbial_risk_samples[{sample_id, sample_location, pathogen, result(detected|not_detected|borderline), cfu_per_g, limit}], sanitation_scores[{area, swab_result, limit, compliant}], personnel_hygiene[{checkpoint, compliant, severity(critical|major|minor)}], pest_control[{area, evidence, action_taken}], allergen_management[{control_point, status(effective|needs_improvement|ineffective)}], previous_audit_score'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatSafetyAuditReport(analyzeFoodSafetyAudit(args.input_data))
    }
  }))

  // Tool 6: Consumer Taste Analyzer — 消费者口味偏好分析与新品适配
  tools.register(defineTool({
    name: 'consumer_taste_analyzer',
    description: '消费者口味偏好分析与新品适配 | Analyze consumer taste preferences and new product fit. Profiles taste preferences by segment, identifies sensory gaps, evaluates trend opportunities, and scores new product-market fit.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: product_name, product_category, target_demographic{age_range, region, income_level, lifestyle}, consumer_survey_data[{segment, sample_size, taste_preference, preferred_sweetness, preferred_saltiness, preferred_sourness, preferred_bitterness, preferred_umami, texture_preference, purchase_intent}], sensory_panel_data[{attribute, intensity_score, ideal_score, gap}], market_trends[{trend, relevance, growth_rate_pct}], competitive_benchmark[{product, taste_score, market_share_pct}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatTasteReport(analyzeConsumerTaste(args.input_data))
    }
  }))

  // Tool 7: Cold Chain Monitor — 冷链物流监控与温控预警
  tools.register(defineTool({
    name: 'cold_chain_monitor',
    description: '冷链物流监控与温控预警 | Cold chain logistics monitoring and temperature alerts. Analyzes temperature excursions, calculates MKT, assesses shelf-life impact, estimates product loss, and generates corrective actions.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: shipment_id, product_type, origin, destination, transport_mode(refrigerated_truck|reefer_container|air_cargo|cold_warehouse), required_temp_min_c, required_temp_max_c, temp_readings[{timestamp, temp_c, location, sensor_id}], humidity_readings[{timestamp, humidity_pct, location}], shipment_duration_hours, product_value, packaging_type, door_open_events[{timestamp, duration_min, location}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatColdChainReport(analyzeColdChain(args.input_data))
    }
  }))

  // Tool 8: Regulatory Compliance — 食品标签法规合规与营养声称审核
  tools.register(defineTool({
    name: 'regulatory_compliance',
    description: '食品标签法规合规与营养声称审核 | Food labeling regulatory compliance and nutrition claims. Validates nutrition claims per GB 28050, checks allergen declarations, verifies additive limits, identifies labeling gaps, and assesses country-specific compliance.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: product_name, product_category, target_markets[], nutrition_facts{serving_size_g, calories, total_fat_g, saturated_fat_g, trans_fat_g, cholesterol_mg, sodium_mg, total_carbs_g, fiber_g, total_sugars_g, added_sugars_g, protein_g, vitamin_d_mcg, calcium_mg, iron_mg, potassium_mg}, ingredient_list[], allergens_declared[], allergens_present[], nutrition_claims[], health_claims[], additive_list[{additive_name, e_number, function, max_permitted_mg_kg, actual_usage_mg_kg}], labeling_elements[{element, present, compliant, regulation_ref}], country_specific_rules[{country, regulation, requirement, product_compliant}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      return formatRegulatoryReport(analyzeRegulatoryCompliance(args.input_data))
    }
  }))

  console.log(`[dsh-tool-foodagentpro] Loaded v${VERSION} — Food & Beverage Industry AI Agent with 8 tools`)
  console.log('  Tools: recipe_innovator, quality_control_ai, supply_chain_food, menu_optimizer, food_safety_auditor, consumer_taste_analyzer, cold_chain_monitor, regulatory_compliance')
}
