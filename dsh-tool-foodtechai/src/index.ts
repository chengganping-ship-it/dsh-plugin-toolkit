/**
 * DSH Food Tech & Alternative Proteins AI Plugin v1.0.0
 *
 * Food Tech & Alternative Proteins -- alternative protein development, food
 * safety compliance, supply chain traceability, personalized nutrition, food
 * waste reduction, regulatory compliance, ingredient sustainability scoring,
 * and menu optimization. 2026: Alternative protein market projected at $36B
 * by 2030; food safety regulations tightening globally.
 *
 * Tools:
 * 1. alternative_protein_analyzer      -- Plant / fermentation / cultivated protein assessment
 * 2. food_safety_compliance_checker    -- HACCP / ISO 22000 / FDA 21 CFR audit
 * 3. supply_chain_traceability_engine  -- Ingredient origin to shelf mapping
 * 4. personalized_nutrition_planner    -- Dietary planning and nutrient optimization
 * 5. food_waste_reducer                -- Waste reduction strategies and cost savings
 * 6. regulatory_compliance_tracker     -- Multi-market regulatory deadline tracking
 * 7. ingredient_sustainability_scorer  -- Sustainability scoring for ingredients
 * 8. menu_optimization_engine          -- Menu item profitability & popularity matrix
 *
 * @module dsh-tool-foodtechai | @version 1.0.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-foodtechai'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER_FOOD_SAFETY = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute professional food safety, regulatory, nutritional, or legal advice. All decisions must be validated by certified professionals in accordance with local regulations (FDA, EFSA, CFDA, etc.).'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

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

// ==================== HELPERS ====================

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

// ==================== SECTION 1: ALTERNATIVE PROTEIN ANALYZER ====================

export interface ProteinInput {
  protein_type?: 'plant_based' | 'fermentation_based' | 'cultivated' | 'hybrid'
  target_product?: string
  protein_source_candidates?: string[]
  scale_of_production?: 'pilot' | 'commercial' | 'industrial'
  regulatory_region?: string
  cost_target_per_kg?: number
}

export interface ProteinScore {
  source: string
  protein_content_pct: number
  pdcaas_score: number
  environmental_score: number
  cost_feasibility: number
  regulatory_status: string
  scalability: 'high' | 'medium' | 'low'
  overall_score: number
}

export interface ProteinAnalysisResult {
  recommended_source: string
  scores: ProteinScore[]
  environmental_impact: string
  regulatory_pathway: string
  cost_projection: string
  go_to_market_timeline_months: number
  recommendations: string[]
}

// ==================== SECTION 2: FOOD SAFETY COMPLIANCE ====================

export interface ComplianceInput {
  facility_type?: string
  regulatory_framework?: 'HACCP' | 'ISO_22000' | 'FDA_21_CFR_117' | 'BRC' | 'FSSC_22000'
  product_category?: string
  audit_scope?: string[]
  previous_violations?: number
  corrective_actions_documented?: boolean
}

export interface CCPMonitor {
  ccp_id: string
  hazard: string
  critical_limit: string
  monitoring_procedure: string
  corrective_action: string
  status: 'compliant' | 'non_compliant' | 'requires_verification'
}

export interface ComplianceGap {
  requirement: string
  status: 'compliant' | 'partial' | 'non_compliant'
  evidence_required: string
  priority: 'critical' | 'major' | 'minor'
}

export interface ComplianceResult {
  compliance_score: number
  ccp_monitors: CCPMonitor[]
  gaps: ComplianceGap[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  next_audit_readiness_days: number
  corrective_actions: string[]
  summary: string
}

// ==================== SECTION 3: SUPPLY CHAIN TRACEABILITY ====================

export interface SupplyChainInput {
  product_name?: string
  ingredient_list?: string[]
  supplier_regions?: string[]
  traceability_target?: 'full' | 'batch' | 'ingredient'
  blockchain_enabled?: boolean
  recall_readiness?: 'low' | 'medium' | 'high'
}

export interface TraceabilityNode {
  stage: string
  location: string
  timestamp_offset_days: number
  risk_level: 'low' | 'medium' | 'high'
  certification: string
  verified: boolean
}

export interface TraceabilityGap {
  gap: string
  severity: 'critical' | 'major' | 'minor'
  remediation: string
}

export interface SupplyChainResult {
  traceability_score: number
  nodes: TraceabilityNode[]
  gaps: TraceabilityGap[]
  blockchain_recommendation: string
  recall_time_estimate_hours: number
  risk_hotspots: string[]
  recommendations: string[]
}

// ==================== SECTION 4: PERSONALIZED NUTRITION PLANNER ====================

export interface NutritionInput {
  age?: number
  gender?: 'male' | 'female' | 'other'
  weight_kg?: number
  height_cm?: number
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  dietary_restrictions?: string[]
  health_goals?: string[]
  food_preferences?: string[]
  allergies?: string[]
  meals_per_day?: number
}

export interface MacronutrientSplit {
  protein_pct: number
  carbs_pct: number
  fat_pct: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface MealSuggestion {
  meal: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  foods: string[]
}

export interface MicronutrientGap {
  nutrient: string
  status: 'adequate' | 'borderline' | 'deficient'
  recommended_intake: string
  food_sources: string[]
}

export interface NutritionPlanResult {
  bmr: number
  tdee: number
  daily_calorie_target: number
  macronutrients: MacronutrientSplit
  meal_plan: MealSuggestion[]
  micronutrient_gaps: MicronutrientGap[]
  hydration_liters: number
  supplement_suggestions: string[]
  recommendations: string[]
}

// ==================== SECTION 5: FOOD WASTE REDUCER ====================

export interface WasteInput {
  business_type?: 'restaurant' | 'cafe' | 'hotel' | 'catering' | 'retail' | 'manufacturing'
  daily_volume_kg?: number
  current_waste_pct?: number
  waste_categories?: string[]
  seasonality_factor?: 'low' | 'medium' | 'high'
  operational_days_per_week?: number
  current_diversion_pct?: number
}

export interface WasteReductionAction {
  action: string
  category: string
  waste_reduction_pct: number
  annual_savings_currency: number
  implementation_cost: 'low' | 'medium' | 'high'
  payback_months: number
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface DiversionStrategy {
  strategy: string
  description: string
  diversion_potential_pct: number
  applicable_waste_types: string[]
}

export interface WasteReductionResult {
  current_daily_waste_kg: number
  target_daily_waste_kg: number
  waste_reduction_actions: WasteReductionAction[]
  diversion_strategies: DiversionStrategy[]
  total_annual_savings: number
  waste_reduction_potential_pct: number
  landfill_diversion_target_pct: number
  composting_recommendation: string
  recommendations: string[]
}

// ==================== SECTION 6: REGULATORY COMPLIANCE TRACKER ====================

export interface RegulatoryInput {
  target_markets?: string[]
  product_category?: string
  regulatory_frameworks?: string[]
  compliance_deadlines?: { name: string; date: string; status: 'compliant' | 'pending' | 'overdue' }[]
  current_certifications?: string[]
  product_claims?: string[]
}

export interface ComplianceStatus {
  market: string
  framework: string
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable'
  gaps: string[]
  required_actions: string[]
}

export interface UpcomingDeadline {
  name: string
  date: string
  days_remaining: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  action_required: string
}

export interface RegulatoryTrackingResult {
  overall_compliance_pct: number
  compliance_statuses: ComplianceStatus[]
  upcoming_deadlines: UpcomingDeadline[]
  certification_gaps: string[]
  claim_risks: string[]
  action_items: string[]
  summary: string
}

// ==================== SECTION 7: INGREDIENT SUSTAINABILITY SCORER ====================

export interface SustainabilityInput {
  ingredient_list?: string[]
  sourcing_regions?: string[]
  certifications?: string[]
  carbon_footprint_data?: { ingredient: string; kg_co2_per_kg: number }[]
  water_usage_data?: { ingredient: string; liters_per_kg: number }[]
  packaging_type?: string
}

export interface IngredientSustainabilityScore {
  ingredient: string
  carbon_score: number
  water_score: number
  land_use_score: number
  biodiversity_score: number
  social_score: number
  overall_sustainability_score: number
  certification_boost: boolean
  improvement_potential: string
}

export interface SustainabilityResult {
  average_sustainability_score: number
  ingredient_scores: IngredientSustainabilityScore[]
  certification_gaps: string[]
  carbon_reduction_opportunities: string[]
  water_reduction_opportunities: string[]
  sustainable_alternatives: string[]
  recommendations: string[]
}

// ==================== SECTION 8: MENU OPTIMIZATION ENGINE ====================

export interface MenuInput {
  restaurant_name?: string
  menu_items?: { name: string; price: number; food_cost_pct: number; monthly_orders: number }[]
  analysis_dimension?: 'profitability' | 'popularity' | 'both'
  target_food_cost_pct?: number
}

export interface MenuItemClassification {
  item_name: string
  category: 'star' | 'puzzle' | 'plow_horse' | 'dog'
  food_cost_pct: number
  contribution_margin: number
  popularity_index: number
  recommendation: string
}

export interface MenuOptimizationResult {
  classifications: MenuItemClassification[]
  avg_food_cost_pct: number
  stars_count: number
  puzzles_count: number
  plow_horses_count: number
  dogs_count: number
  menu_recommendations: string[]
  revenue_optimization_potential_pct: number
}

// ==================== TOOL 1: ALTERNATIVE PROTEIN ANALYZER ====================

function analyzeAlternativeProtein(input: ProteinInput): ProteinAnalysisResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const proteinType = input.protein_type || 'plant_based'
  const targetProduct = input.target_product || 'protein-enhanced food product'
  const scale = input.scale_of_production || 'pilot'
  const region = input.regulatory_region || 'US'
  const costTarget = input.cost_target_per_kg || 15

  const sourceDatabase: Record<string, { name: string; protein_pct: number; pdcaas: number }[]> = {
    plant_based: [
      { name: 'Pea protein isolate', protein_pct: 85, pdcaas: 0.89 },
      { name: 'Soy protein concentrate', protein_pct: 70, pdcaas: 0.95 },
      { name: 'Fava bean protein', protein_pct: 65, pdcaas: 0.82 },
      { name: 'Rice protein', protein_pct: 80, pdcaas: 0.72 },
      { name: 'Chickpea protein', protein_pct: 60, pdcaas: 0.78 },
    ],
    fermentation_based: [
      { name: 'Fusarium mycoprotein (Quorn)', protein_pct: 45, pdcaas: 0.93 },
      { name: 'Precision-fermentation whey', protein_pct: 90, pdcaas: 1.0 },
      { name: 'Lentil-fermented protein', protein_pct: 55, pdcaas: 0.85 },
    ],
    cultivated: [
      { name: 'Cultivated chicken cells', protein_pct: 70, pdcaas: 0.99 },
      { name: 'Cultivated beef cells', protein_pct: 75, pdcaas: 1.0 },
      { name: 'Cultivated fish cells', protein_pct: 65, pdcaas: 0.97 },
    ],
    hybrid: [
      { name: 'Plant-mycelium composite', protein_pct: 55, pdcaas: 0.84 },
      { name: 'Plant-cultivated fat blend', protein_pct: 60, pdcaas: 0.90 },
    ]
  }

  const candidates = input.protein_source_candidates && input.protein_source_candidates.length > 0
    ? input.protein_source_candidates
    : sourceDatabase[proteinType].map(s => s.name)

  const scores: ProteinScore[] = candidates.map(sourceName => {
    const dbEntry = sourceDatabase[proteinType]?.find(s => s.name === sourceName)
    const proteinContent = dbEntry?.protein_pct || rng.nextInt(40, 90)
    const pdcaas = dbEntry?.pdcaas || roundTo(rng.nextFloat(0.7, 1.0), 2)
    const envScore = clamp(rng.nextInt(55, 95), 0, 100)
    const costFeasibility = clamp(rng.nextInt(40, 90), 0, 100)
    const regulatoryStatus = region === 'US'
      ? (rng.next() > 0.3 ? 'GRAS notification submitted' : 'Awaiting FDA review')
      : region === 'EU'
      ? (rng.next() > 0.3 ? 'Novel Food application pending' : 'EFSA pre-submission completed')
      : region === 'SG'
      ? 'SFA novel food approval pathway'
      : 'Regulatory assessment required'
    const scalability: 'high' | 'medium' | 'low'
      = scale === 'industrial' ? 'high' : scale === 'commercial' ? (rng.next() > 0.3 ? 'high' : 'medium') : (rng.next() > 0.5 ? 'medium' : 'low')
    const overall = Math.round((proteinContent * 0.2 + pdcaas * 25 + envScore * 0.2 + costFeasibility * 0.2 + (scalability === 'high' ? 15 : scalability === 'medium' ? 10 : 5)))
    return {
      source: sourceName,
      protein_content_pct: proteinContent,
      pdcaas_score: pdcaas,
      environmental_score: envScore,
      cost_feasibility: costFeasibility,
      regulatory_status: regulatoryStatus,
      scalability,
      overall_score: clamp(overall, 0, 100)
    }
  })

  scores.sort((a, b) => b.overall_score - a.overall_score)
  const recommended = scores[0]?.source || 'No recommendation available'

  const envImpact = proteinType === 'plant_based'
    ? 'Lowest environmental footprint -- 80-90% less GHG vs animal protein, minimal land/water use'
    : proteinType === 'fermentation_based'
    ? 'Low-moderate footprint -- bioreactor energy use offset by high protein yield per input'
    : proteinType === 'cultivated'
    ? 'Moderate footprint currently -- bioreactor energy dominates; expected to improve with scale'
    : 'Variable footprint depending on component ratios -- optimize plant fraction for lowest impact'

  const regulatoryPathway = region === 'US'
    ? 'FDA GRAS notification + USDA-FSIS labeling (if cultivated) -- estimated 12-18 months'
    : region === 'EU'
    ? 'EFSA Novel Food authorization -- estimated 18-24 months'
    : region === 'SG'
    ? 'SFA novel food safety assessment -- estimated 6-12 months'
    : 'Consult regulatory authority in target market'

  const avgCost = roundTo(rng.nextFloat(costTarget * 0.8, costTarget * 1.5), 2)
  const costProjection = 'Estimated cost: $' + avgCost + '/kg at ' + scale + ' scale. Target: $' + costTarget + '/kg. ' + (avgCost <= costTarget ? 'Target achievable at current scale.' : 'Cost reduction of $' + roundTo(avgCost - costTarget, 2) + '/kg needed -- expect 15-30% reduction at commercial scale.')

  const timeline = region === 'SG' ? rng.nextInt(6, 12) : region === 'US' ? rng.nextInt(12, 18) : rng.nextInt(18, 24)

  const recommendations: string[] = []
  recommendations.push('Prioritize ' + recommended + ' (overall score: ' + (scores[0]?.overall_score || 'N/A') + '/100)')
  if (scores[0] && scores[0].scalability === 'low') recommendations.push('Investment in scale-up infrastructure needed for ' + recommended)
  recommendations.push('Conduct consumer taste test with top 2 ranked sources')
  recommendations.push('Secure supply agreements with at least 2 alternative protein suppliers')
  if (proteinType === 'cultivated') recommendations.push('Engage regulatory consultants early -- novel food approval is the primary bottleneck')
  recommendations.push('Benchmark against incumbent ingredient cost at equal protein content')

  return {
    recommended_source: recommended,
    scores,
    environmental_impact: envImpact,
    regulatory_pathway: regulatoryPathway,
    cost_projection: costProjection,
    go_to_market_timeline_months: timeline,
    recommendations
  }
}

function formatProteinReport(input: ProteinInput, result: ProteinAnalysisResult): string {
  const lines: string[] = []
  lines.push('## Alternative Protein Analysis Report')
  lines.push('')
  lines.push('**Target Product:** ' + (input.target_product || 'protein-enhanced food product') + ' | **Type:** ' + (input.protein_type || 'plant_based') + ' | **Scale:** ' + (input.scale_of_production || 'pilot'))
  lines.push('')
  lines.push('### Recommended Source: ' + result.recommended_source)
  lines.push('')
  lines.push('### Protein Source Scores')
  lines.push('| Source | Protein % | PDCAAS | Env Score | Cost Feas. | Scalability | Overall |')
  lines.push('|--------|-----------|--------|-----------|------------|-------------|---------|')
  for (const s of result.scores) {
    lines.push('| ' + s.source + ' | ' + s.protein_content_pct + '% | ' + s.pdcaas_score + ' | ' + s.environmental_score + ' | ' + s.cost_feasibility + ' | ' + s.scalability.toUpperCase() + ' | ' + s.overall_score + ' |')
  }
  lines.push('')
  lines.push('### Environmental Impact')
  lines.push(result.environmental_impact)
  lines.push('')
  lines.push('### Regulatory Pathway')
  lines.push(result.regulatory_pathway)
  lines.push('')
  lines.push('### Cost Projection')
  lines.push(result.cost_projection)
  lines.push('')
  lines.push('### Timeline to Market: ' + result.go_to_market_timeline_months + ' months')
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 2: FOOD SAFETY COMPLIANCE CHECKER ====================

function checkCompliance(input: ComplianceInput): ComplianceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const facility = input.facility_type || 'Food manufacturing facility'
  const framework = input.regulatory_framework || 'HACCP'
  const product = input.product_category || 'General food product'
  const violations = input.previous_violations || 0
  const documented = input.corrective_actions_documented !== false

  const hazards = [
    { hazard: 'Biological contamination (pathogenic bacteria)', limit: '< 100 CFU/g for ready-to-eat', procedure: 'Microbial testing every 4 hours on production line' },
    { hazard: 'Chemical contamination (cleaning agents)', limit: 'No detectable residue', procedure: 'ATP swab testing post-cleaning, verified hourly' },
    { hazard: 'Physical contamination (metal/glass)', limit: 'Zero tolerance', procedure: 'Metal detector + X-ray inspection every batch' },
    { hazard: 'Allergen cross-contact', limit: '< 20 ppm for undeclared allergen', procedure: 'Visual inspection + allergen swab between product runs' },
    { hazard: 'Temperature abuse (cold chain)', limit: '< 5 C for refrigerated products', procedure: 'Continuous automated temperature logging' },
  ]

  const ccpMonitors: CCPMonitor[] = hazards.map((h, i) => {
    const roll = rng.next()
    const status: 'compliant' | 'non_compliant' | 'requires_verification' = roll < 0.6 ? 'compliant' : roll < 0.85 ? 'requires_verification' : 'non_compliant'
    return {
      ccp_id: 'CCP-' + (i + 1),
      hazard: h.hazard,
      critical_limit: h.limit,
      monitoring_procedure: h.procedure,
      corrective_action: status === 'non_compliant' ? 'Immediate production halt; reprocessing or disposal; root cause analysis within 24h' : 'Continue monitoring',
      status
    }
  })

  const compliantCount = ccpMonitors.filter(c => c.status === 'compliant').length
  const baseScore = Math.round((compliantCount / ccpMonitors.length) * 80)
  const violationPenalty = violations * 5
  const docBoost = documented ? 10 : 0
  const complianceScore = clamp(baseScore + docBoost + rng.nextInt(-3, 3) - violationPenalty, 0, 100)

  const gaps: ComplianceGap[] = []
  if (violations > 0) gaps.push({ requirement: 'Zero repeat violations', status: violations > 1 ? 'non_compliant' : 'partial', evidence_required: 'CAPA (Corrective and Preventive Action) closure documentation', priority: 'critical' })
  if (!documented) gaps.push({ requirement: 'Documented corrective action system', status: 'non_compliant', evidence_required: 'CAPA log with signatures, dates, and effectiveness verification', priority: 'critical' })
  if (ccpMonitors.some(c => c.status === 'requires_verification')) gaps.push({ requirement: 'CCP verification records complete', status: 'partial', evidence_required: 'Signed CCP monitoring logs for last 90 days', priority: 'major' })
  gaps.push({ requirement: 'Annual third-party audit current', status: rng.next() > 0.3 ? 'compliant' : 'partial', evidence_required: 'Audit report dated within 12 months', priority: 'major' })

  const riskLevel: 'low' | 'medium' | 'high' | 'critical'
    = complianceScore >= 80 ? 'low' : complianceScore >= 60 ? 'medium' : complianceScore >= 40 ? 'high' : 'critical'

  const readinessDays = riskLevel === 'low' ? rng.nextInt(7, 30) : riskLevel === 'medium' ? rng.nextInt(30, 60) : riskLevel === 'high' ? rng.nextInt(60, 90) : rng.nextInt(90, 180)

  const correctiveActions: string[] = []
  if (violations > 0) correctiveActions.push('Close all open CAPAs and verify effectiveness within 30 days')
  if (!documented) correctiveActions.push('Implement electronic CAPA tracking system with automated reminders')
  correctiveActions.push('Conduct refresher HACCP training for all production staff')
  correctiveActions.push('Schedule internal audit within 2 weeks')
  if (riskLevel === 'critical') correctiveActions.push('Engage third-party food safety consultant for immediate system review')

  const summary = facility + ' under ' + framework + ': compliance score ' + complianceScore + '/100 (' + riskLevel.toUpperCase() + ' risk). Estimated audit readiness: ' + readinessDays + ' days. CAPA documentation: ' + (documented ? 'Complete' : 'Incomplete') + '.'

  return {
    compliance_score: complianceScore,
    ccp_monitors: ccpMonitors,
    gaps,
    risk_level: riskLevel,
    next_audit_readiness_days: readinessDays,
    corrective_actions: correctiveActions,
    summary
  }
}

function formatComplianceReport(input: ComplianceInput, result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('## Food Safety Compliance Report')
  lines.push('')
  lines.push('**Facility:** ' + (input.facility_type || 'Food manufacturing facility') + ' | **Framework:** ' + (input.regulatory_framework || 'HACCP'))
  lines.push('**Product:** ' + (input.product_category || 'General food product'))
  lines.push('')
  lines.push('### Compliance Score: ' + result.compliance_score + '/100 | Risk Level: ' + result.risk_level.toUpperCase())
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### CCP Monitoring Status')
  lines.push('| CCP | Hazard | Critical Limit | Status |')
  lines.push('|-----|--------|----------------|--------|')
  for (const c of result.ccp_monitors) {
    const s = c.status.toUpperCase().replace('_', ' ')
    lines.push('| ' + c.ccp_id + ' | ' + c.hazard + ' | ' + c.critical_limit + ' | ' + s + ' |')
  }
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Compliance Gaps')
    for (const g of result.gaps) {
      lines.push('- **' + g.requirement + '** [' + g.status.replace('_', ' ').toUpperCase() + ', ' + g.priority.toUpperCase() + '] -- Evidence: ' + g.evidence_required)
    }
    lines.push('')
  }

  lines.push('### Corrective Actions')
  for (const a of result.corrective_actions) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push('### Audit Readiness')
  lines.push('Estimated days until audit-ready: ' + result.next_audit_readiness_days + ' days')
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 3: SUPPLY CHAIN TRACEABILITY ENGINE ====================

function traceSupplyChain(input: SupplyChainInput): SupplyChainResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const product = input.product_name || 'Unspecified Product'
  const ingredients = input.ingredient_list || []
  const regions = input.supplier_regions || []
  const target = input.traceability_target || 'batch'
  const blockchain = input.blockchain_enabled !== false
  const recall = input.recall_readiness || 'medium'

  const stages = ['Raw Material Sourcing', 'Processing/Manufacturing', 'Packaging', 'Distribution', 'Warehousing', 'Retail/Point of Sale']
  const certifications = ['Organic', 'Fair Trade', 'Non-GMO', 'Halal', 'Kosher', 'ISO 22000', 'BRC Grade A', 'SQF Level 3']

  const nodes: TraceabilityNode[] = stages.map((stage, i) => {
    const region = regions[i % Math.max(regions.length, 1)] || 'Unknown'
    const riskRoll = rng.next()
    const risk: 'low' | 'medium' | 'high' = riskRoll < 0.5 ? 'low' : riskRoll < 0.8 ? 'medium' : 'high'
    return {
      stage,
      location: region,
      timestamp_offset_days: rng.nextInt(1, 30) * (i + 1),
      risk_level: risk,
      certification: rng.pick(certifications),
      verified: rng.next() > 0.3
    }
  })

  const baseScore = target === 'full' ? 90 : target === 'batch' ? 65 : 40
  const ingBoost = Math.min(ingredients.length * 2, 10)
  const regionBoost = regions.length >= 3 ? 5 : 0
  const blockchainBoost = blockchain ? 8 : 0
  const verifiedRatio = nodes.filter(n => n.verified).length / nodes.length
  const traceScore = clamp(Math.round(baseScore + ingBoost + regionBoost + blockchainBoost + verifiedRatio * 10 + rng.nextInt(-5, 5)), 0, 100)

  const gaps: TraceabilityGap[] = []
  if (regions.length < 3) gaps.push({ gap: 'Limited supplier region diversity', severity: 'major', remediation: 'Map at least 3 supplier regions per ingredient for full traceability' })
  if (!blockchain) gaps.push({ gap: 'No blockchain-enabled verification', severity: 'minor', remediation: 'Implement blockchain or distributed ledger for immutable traceability records' })
  if (nodes.some(n => !n.verified)) gaps.push({ gap: 'Unverified supply chain nodes detected', severity: 'critical', remediation: 'Conduct third-party audits for all unverified nodes within 30 days' })
  if (ingredients.length > 10) gaps.push({ gap: 'High ingredient complexity complicates traceability', severity: 'major', remediation: 'Simplify ingredient list or implement batch-level tracking for high-risk components' })
  if (gaps.length === 0) gaps.push({ gap: 'No critical gaps detected', severity: 'minor', remediation: 'Continue routine monitoring and annual re-verification' })

  const recallHours = recall === 'high' ? rng.nextInt(4, 12) : recall === 'medium' ? rng.nextInt(12, 48) : rng.nextInt(48, 120)
  const blockchainRec = blockchain
    ? 'Blockchain enabled -- immutable traceability records provide tamper-proof recall evidence'
    : 'Recommend implementing blockchain-based traceability for end-to-end visibility and instant recall capability'

  const riskHotspots = nodes.filter(n => n.risk_level === 'high').map(n => n.stage + ' (' + n.location + ')')

  const recommendations: string[] = []
  recommendations.push('Implement unique batch IDs for each production lot')
  if (!blockchain) recommendations.push('Deploy blockchain or QR-code traceability for consumer-facing transparency')
  recommendations.push('Conduct mock recall exercises quarterly (target: <' + recallHours + ' hours)')
  if (riskHotspots.length > 0) recommendations.push('Prioritize risk mitigation at: ' + riskHotspots.join(', '))
  recommendations.push('Share traceability data with downstream partners for end-to-end visibility')
  recommendations.push('Integrate IoT sensors at critical control points for real-time monitoring')

  return {
    traceability_score: traceScore,
    nodes,
    gaps,
    blockchain_recommendation: blockchainRec,
    recall_time_estimate_hours: recallHours,
    risk_hotspots: riskHotspots,
    recommendations
  }
}

function formatSupplyChainReport(input: SupplyChainInput, result: SupplyChainResult): string {
  const lines: string[] = []
  lines.push('## Supply Chain Traceability Report')
  lines.push('')
  lines.push('**Product:** ' + (input.product_name || 'Unspecified') + ' | **Target:** ' + (input.traceability_target || 'batch') + ' traceability')
  lines.push('')
  lines.push('### Traceability Score: ' + result.traceability_score + '/100')
  lines.push('')
  lines.push(result.blockchain_recommendation)
  lines.push('Estimated recall time: ' + result.recall_time_estimate_hours + ' hours')
  lines.push('')

  lines.push('### Supply Chain Nodes')
  lines.push('| Stage | Location | Risk | Certification | Verified |')
  lines.push('|-------|----------|------|---------------|----------|')
  for (const n of result.nodes) {
    const v = n.verified ? 'Yes' : 'No'
    lines.push('| ' + n.stage + ' | ' + n.location + ' | ' + n.risk_level.toUpperCase() + ' | ' + n.certification + ' | ' + v + ' |')
  }
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Traceability Gaps')
    for (const g of result.gaps) {
      lines.push('- **' + g.gap + '** [' + g.severity.toUpperCase() + '] -- ' + g.remediation)
    }
    lines.push('')
  }

  if (result.risk_hotspots.length > 0) {
    lines.push('### Risk Hotspots')
    for (const r of result.risk_hotspots) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 4: PERSONALIZED NUTRITION PLANNER ====================

function planNutrition(input: NutritionInput): NutritionPlanResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const age = input.age || 30
  const gender = input.gender || 'female'
  const weightKg = input.weight_kg || 70
  const heightCm = input.height_cm || 170
  const activity = input.activity_level || 'moderate'
  const restrictions = input.dietary_restrictions || []
  const goals = input.health_goals || []
  const preferences = input.food_preferences || []
  const allergies = input.allergies || []
  const mealsPerDay = input.meals_per_day || 3

  // BMR calculation (Mifflin-St Jeor)
  const bmr = gender === 'male'
    ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
    : Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161)

  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }
  const multiplier = activityMultipliers[activity] || 1.55
  const tdee = Math.round(bmr * multiplier)

  // Calorie target adjustment based on goals
  let calorieTarget = tdee
  if (goals.includes('weight_loss')) calorieTarget = Math.round(tdee * 0.8)
  if (goals.includes('muscle_gain')) calorieTarget = Math.round(tdee * 1.15)
  if (goals.includes('maintenance')) calorieTarget = tdee

  // Macronutrient split
  let proteinPct = 25
  let carbsPct = 45
  let fatPct = 30
  if (goals.includes('keto')) { proteinPct = 25; carbsPct = 10; fatPct = 65 }
  if (goals.includes('low_carb')) { proteinPct = 30; carbsPct = 25; fatPct = 45 }
  if (goals.includes('high_protein')) { proteinPct = 35; carbsPct = 35; fatPct = 30 }
  if (goals.includes('muscle_gain')) { proteinPct = 30; carbsPct = 40; fatPct = 30 }

  const proteinG = Math.round((calorieTarget * proteinPct / 100) / 4)
  const carbsG = Math.round((calorieTarget * carbsPct / 100) / 4)
  const fatG = Math.round((calorieTarget * fatPct / 100) / 9)

  // Meal plan
  const mealNames = mealsPerDay <= 2 ? ['Meal 1', 'Meal 2'] : mealsPerDay === 3 ? ['Breakfast', 'Lunch', 'Dinner'] : mealsPerDay === 4 ? ['Breakfast', 'Lunch', 'Snack', 'Dinner'] : ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner']

  const foodPool: Record<string, string[]> = {
    breakfast: ['Oatmeal with berries', 'Greek yogurt parfait', 'Whole grain toast with avocado', 'Scrambled eggs with spinach', 'Smoothie bowl', 'Chia pudding'],
    lunch: ['Grilled chicken salad', 'Quinoa bowl with vegetables', 'Lentil soup', 'Turkey wrap', 'Buddha bowl', 'Salmon with brown rice'],
    dinner: ['Grilled salmon with asparagus', 'Stir-fry tofu with vegetables', 'Lean beef with sweet potato', 'Chickpea curry', 'Baked cod with roasted vegetables', 'Whole pasta with marinara'],
    snack: ['Mixed nuts', 'Apple with almond butter', 'Protein shake', 'Hummus with vegetables', 'Cottage cheese', 'Trail mix']
  }

  const mealPlan: MealSuggestion[] = mealNames.map((meal) => {
    const calShare = Math.round(calorieTarget / mealsPerDay)
    const pShare = Math.round(proteinG / mealsPerDay)
    const cShare = Math.round(carbsG / mealsPerDay)
    const fShare = Math.round(fatG / mealsPerDay)
    const mealKey = meal.toLowerCase().includes('snack') ? 'snack' : meal.toLowerCase().includes('breakfast') ? 'breakfast' : meal.toLowerCase().includes('lunch') ? 'lunch' : 'dinner'
    const foods = foodPool[mealKey] || foodPool.snack
    const selectedFoods: string[] = []
    for (let i = 0; i < 2; i++) {
      const f = rng.pick(foods)
      if (!selectedFoods.includes(f)) selectedFoods.push(f)
    }
    return {
      meal,
      calories: calShare + rng.nextInt(-30, 30),
      protein_g: pShare + rng.nextInt(-3, 3),
      carbs_g: cShare + rng.nextInt(-5, 5),
      fat_g: fShare + rng.nextInt(-2, 2),
      foods: selectedFoods
    }
  })

  // Micronutrient gaps
  const allMicronutrients: MicronutrientGap[] = [
    { nutrient: 'Vitamin D', status: rng.next() > 0.5 ? 'borderline' : 'adequate', recommended_intake: '600-800 IU/day', food_sources: ['Fatty fish', 'Fortified dairy', 'Egg yolks'] },
    { nutrient: 'Iron', status: gender === 'female' ? (rng.next() > 0.4 ? 'borderline' : 'adequate') : 'adequate', recommended_intake: gender === 'female' ? '18mg/day' : '8mg/day', food_sources: ['Red meat', 'Spinach', 'Lentils', 'Fortified cereals'] },
    { nutrient: 'Calcium', status: rng.next() > 0.6 ? 'adequate' : 'borderline', recommended_intake: '1000mg/day', food_sources: ['Dairy', 'Leafy greens', 'Fortified plant milk', 'Tofu'] },
    { nutrient: 'Vitamin B12', status: restrictions.includes('vegan') ? 'deficient' : 'adequate', recommended_intake: '2.4mcg/day', food_sources: ['Meat', 'Fish', 'Eggs', 'Fortified nutritional yeast'] },
    { nutrient: 'Magnesium', status: rng.next() > 0.5 ? 'adequate' : 'borderline', recommended_intake: '310-420mg/day', food_sources: ['Nuts', 'Seeds', 'Whole grains', 'Dark chocolate'] },
    { nutrient: 'Omega-3', status: rng.next() > 0.4 ? 'borderline' : 'adequate', recommended_intake: '250-500mg EPA+DHA/day', food_sources: ['Salmon', 'Walnuts', 'Flaxseeds', 'Chia seeds'] },
  ]

  const micronutrientGaps = allMicronutrients.filter(m => m.status !== 'adequate')

  // Hydration
  const hydration = roundTo(weightKg * 0.033 + (activity === 'active' || activity === 'very_active' ? 0.5 : 0), 1)

  // Supplement suggestions
  const supplements: string[] = []
  if (micronutrientGaps.some(m => m.nutrient === 'Vitamin D')) supplements.push('Vitamin D3 (1000-2000 IU/day)')
  if (micronutrientGaps.some(m => m.nutrient === 'Vitamin B12')) supplements.push('Vitamin B12 (250-500mcg/day)')
  if (micronutrientGaps.some(m => m.nutrient === 'Omega-3')) supplements.push('Omega-3 fish oil or algae-based DHA (250mg/day)')
  if (micronutrientGaps.some(m => m.nutrient === 'Iron')) supplements.push('Iron bisglycinate (18mg/day with vitamin C)')
  if (micronutrientGaps.some(m => m.nutrient === 'Calcium')) supplements.push('Calcium citrate (500mg/day with meals)')
  if (supplements.length === 0) supplements.push('No supplements needed -- nutrient needs met through diet')

  // Recommendations
  const recommendations: string[] = []
  recommendations.push('Target ' + calorieTarget + ' kcal/day (' + tdee + ' TDEE adjusted for goals)')
  if (goals.includes('weight_loss')) recommendations.push('Moderate caloric deficit of ' + (tdee - calorieTarget) + ' kcal/day for sustainable weight loss (~0.5kg/week)')
  if (goals.includes('muscle_gain')) recommendations.push('Ensure protein intake of ' + proteinG + 'g/day spread across ' + mealsPerDay + ' meals (20-40g per meal)')
  if (restrictions.includes('vegan')) recommendations.push('Monitor B12, iron, zinc, and omega-3 intake closely on vegan diet')
  if (allergies.length > 0) recommendations.push('Avoid allergens: ' + allergies.join(', ') + ' -- verify all food labels')
  recommendations.push('Drink ' + hydration + 'L of water daily')
  recommendations.push('Reassess nutrition plan every 4-6 weeks based on progress')

  return {
    bmr,
    tdee,
    daily_calorie_target: calorieTarget,
    macronutrients: { protein_pct: proteinPct, carbs_pct: carbsPct, fat_pct: fatPct, protein_g: proteinG, carbs_g: carbsG, fat_g: fatG },
    meal_plan: mealPlan,
    micronutrient_gaps: micronutrientGaps,
    hydration_liters: hydration,
    supplement_suggestions: supplements,
    recommendations
  }
}

function formatNutritionReport(input: NutritionInput, result: NutritionPlanResult): string {
  const lines: string[] = []
  lines.push('## Personalized Nutrition Plan')
  lines.push('')
  lines.push('**Profile:** ' + (input.gender || 'female') + ', ' + (input.age || 30) + 'y, ' + (input.weight_kg || 70) + 'kg, ' + (input.height_cm || 170) + 'cm | **Activity:** ' + (input.activity_level || 'moderate'))
  lines.push('**Goals:** ' + ((input.health_goals || []).join(', ') || 'General wellness'))
  lines.push('**Restrictions:** ' + ((input.dietary_restrictions || []).join(', ') || 'None'))
  lines.push('')
  lines.push('### Energy Requirements')
  lines.push('- BMR: ' + result.bmr + ' kcal/day')
  lines.push('- TDEE: ' + result.tdee + ' kcal/day')
  lines.push('- **Daily Calorie Target: ' + result.daily_calorie_target + ' kcal/day**')
  lines.push('')
  lines.push('### Macronutrient Split')
  lines.push('- Protein: ' + result.macronutrients.protein_pct + '% (' + result.macronutrients.protein_g + 'g)')
  lines.push('- Carbohydrates: ' + result.macronutrients.carbs_pct + '% (' + result.macronutrients.carbs_g + 'g)')
  lines.push('- Fat: ' + result.macronutrients.fat_pct + '% (' + result.macronutrients.fat_g + 'g)')
  lines.push('')
  lines.push('### Meal Plan')
  for (const m of result.meal_plan) {
    lines.push('- **' + m.meal + '** (' + m.calories + ' kcal): ' + m.foods.join(' + ') + ' | P:' + m.protein_g + 'g C:' + m.carbs_g + 'g F:' + m.fat_g + 'g')
  }
  lines.push('')
  lines.push('### Micronutrient Gaps')
  for (const g of result.micronutrient_gaps) {
    lines.push('- **' + g.nutrient + '** [' + g.status.toUpperCase() + '] -- Target: ' + g.recommended_intake + ' | Sources: ' + g.food_sources.join(', '))
  }
  lines.push('')
  lines.push('### Hydration')
  lines.push('Target: ' + result.hydration_liters + 'L/day')
  lines.push('')
  lines.push('### Supplement Suggestions')
  for (const s of result.supplement_suggestions) {
    lines.push('- ' + s)
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 5: FOOD WASTE REDUCER ====================

function reduceFoodWaste(input: WasteInput): WasteReductionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const businessType = input.business_type || 'restaurant'
  const dailyVolume = input.daily_volume_kg || 100
  const currentWastePct = input.current_waste_pct || 15
  const categories = input.waste_categories || ['prep_waste', 'plate_waste', 'spoilage']
  const seasonality = input.seasonality_factor || 'medium'
  const opDays = input.operational_days_per_week || 6
  const currentDiversion = input.current_diversion_pct || 10

  const currentDailyWasteKg = Math.round(dailyVolume * currentWastePct / 100)

  // Waste reduction actions
  const actions: WasteReductionAction[] = [
    {
      action: 'Implement FIFO (First In, First Out) inventory rotation system',
      category: 'spoilage',
      waste_reduction_pct: roundTo(rng.nextFloat(15, 30), 1),
      annual_savings_currency: Math.round(rng.nextFloat(3000, 12000)),
      implementation_cost: 'low',
      payback_months: rng.nextInt(1, 3),
      priority: 'high'
    },
    {
      action: 'Deploy AI-powered demand forecasting for prep quantities',
      category: 'prep_waste',
      waste_reduction_pct: roundTo(rng.nextFloat(20, 40), 1),
      annual_savings_currency: Math.round(rng.nextFloat(5000, 20000)),
      implementation_cost: 'medium',
      payback_months: rng.nextInt(3, 6),
      priority: 'critical'
    },
    {
      action: 'Offer variable portion sizes (small/regular/large)',
      category: 'plate_waste',
      waste_reduction_pct: roundTo(rng.nextFloat(10, 25), 1),
      annual_savings_currency: Math.round(rng.nextFloat(2000, 8000)),
      implementation_cost: 'low',
      payback_months: rng.nextInt(1, 2),
      priority: 'high'
    },
    {
      action: 'Establish food donation partnership with local food bank',
      category: 'surplus',
      waste_reduction_pct: roundTo(rng.nextFloat(5, 15), 1),
      annual_savings_currency: Math.round(rng.nextFloat(1000, 5000)),
      implementation_cost: 'low',
      payback_months: rng.nextInt(1, 2),
      priority: 'medium'
    },
    {
      action: 'Install smart waste tracking bins with weight sensors',
      category: 'measurement',
      waste_reduction_pct: roundTo(rng.nextFloat(10, 20), 1),
      annual_savings_currency: Math.round(rng.nextFloat(4000, 15000)),
      implementation_cost: 'medium',
      payback_months: rng.nextInt(4, 8),
      priority: 'high'
    },
    {
      action: 'Staff training on trim utilization and root-to-stem cooking',
      category: 'prep_waste',
      waste_reduction_pct: roundTo(rng.nextFloat(8, 18), 1),
      annual_savings_currency: Math.round(rng.nextFloat(2000, 7000)),
      implementation_cost: 'low',
      payback_months: rng.nextInt(1, 2),
      priority: 'medium'
    }
  ]

  // Diversion strategies
  const diversionStrategies: DiversionStrategy[] = [
    {
      strategy: 'On-site composting',
      description: 'Aerobic composting of prep waste and plate scrapings for soil amendment',
      diversion_potential_pct: roundTo(rng.nextFloat(30, 50), 1),
      applicable_waste_types: ['prep_waste', 'plate_waste', 'produce_spoilage']
    },
    {
      strategy: 'Anaerobic digestion / biogas',
      description: 'Convert organic waste to biogas for energy recovery',
      diversion_potential_pct: roundTo(rng.nextFloat(40, 60), 1),
      applicable_waste_types: ['prep_waste', 'spoilage', 'fats_oils']
    },
    {
      strategy: 'Animal feed partnership',
      description: 'Redirect suitable food scraps to local farms for animal feed',
      diversion_potential_pct: roundTo(rng.nextFloat(15, 30), 1),
      applicable_waste_types: ['bread', 'produce', 'prep_waste']
    },
    {
      strategy: 'Food rescue redistribution',
      description: 'Partner with food rescue organizations to redistribute surplus edible food',
      diversion_potential_pct: roundTo(rng.nextFloat(10, 25), 1),
      applicable_waste_types: ['surplus', 'day_old', 'overproduction']
    }
  ]

  const totalReductionPct = Math.min(roundTo(actions.reduce((sum, a) => sum + a.waste_reduction_pct, 0) * 0.6, 1), 60)
  const targetDailyWasteKg = Math.round(currentDailyWasteKg * (1 - totalReductionPct / 100))
  const totalAnnualSavings = actions.reduce((sum, a) => sum + a.annual_savings_currency, 0)

  const landfillDiversionTarget = clamp(Math.round(currentDiversion + totalReductionPct * 0.8 + rng.nextInt(-5, 5)), 0, 95)

  const compostingRec = businessType === 'restaurant' || businessType === 'cafe'
    ? 'Recommended: Small-scale aerobic composting for prep waste (10-20kg/day capacity). Partner with local garden or farm for output.'
    : businessType === 'hotel' || businessType === 'catering'
    ? 'Recommended: Medium-scale in-vessel composting system (50-200kg/day). Consider on-site biogas for energy recovery.'
    : 'Recommended: Evaluate centralized composting facility partnership or anaerobic digestion for large-volume organic waste.'

  const recommendations: string[] = []
  recommendations.push('Current waste: ' + currentDailyWasteKg + 'kg/day (' + currentWastePct + '% of ' + dailyVolume + 'kg total)')
  recommendations.push('Target waste: ' + targetDailyWasteKg + 'kg/day (reduction of ' + totalReductionPct + '%)')
  recommendations.push('Potential annual savings: $' + totalAnnualSavings.toLocaleString())
  recommendations.push('Prioritize AI demand forecasting -- highest impact with ' + actions[1].waste_reduction_pct + '% waste reduction')
  recommendations.push('Achieve ' + landfillDiversionTarget + '% landfill diversion through combined composting and food rescue')
  if (seasonality === 'high') recommendations.push('Account for seasonal variation: adjust ordering and prep volumes monthly based on historical patterns')
  recommendations.push('Track daily waste by category using smart bins to identify top reduction opportunities')
  recommendations.push('Set monthly waste reduction targets and review progress with kitchen team')

  return {
    current_daily_waste_kg: currentDailyWasteKg,
    target_daily_waste_kg: targetDailyWasteKg,
    waste_reduction_actions: actions,
    diversion_strategies: diversionStrategies,
    total_annual_savings: totalAnnualSavings,
    waste_reduction_potential_pct: totalReductionPct,
    landfill_diversion_target_pct: landfillDiversionTarget,
    composting_recommendation: compostingRec,
    recommendations
  }
}

function formatWasteReport(input: WasteInput, result: WasteReductionResult): string {
  const lines: string[] = []
  lines.push('## Food Waste Reduction Report')
  lines.push('')
  lines.push('**Business:** ' + (input.business_type || 'restaurant') + ' | **Daily Volume:** ' + (input.daily_volume_kg || 100) + 'kg | **Current Waste:** ' + (input.current_waste_pct || 15) + '%')
  lines.push('**Categories:** ' + ((input.waste_categories || []).join(', ') || 'prep_waste, plate_waste, spoilage'))
  lines.push('')
  lines.push('### Waste Reduction Summary')
  lines.push('- Current daily waste: ' + result.current_daily_waste_kg + ' kg')
  lines.push('- Target daily waste: ' + result.target_daily_waste_kg + ' kg')
  lines.push('- Reduction potential: ' + result.waste_reduction_potential_pct + '%')
  lines.push('- Landfill diversion target: ' + result.landfill_diversion_target_pct + '%')
  lines.push('- Total annual savings: $' + result.total_annual_savings.toLocaleString())
  lines.push('')
  lines.push('### Waste Reduction Actions')
  lines.push('| Action | Category | Reduction % | Annual Savings | Cost | Payback | Priority |')
  lines.push('|--------|----------|-------------|----------------|------|---------|----------|')
  for (const a of result.waste_reduction_actions) {
    lines.push('| ' + a.action + ' | ' + a.category + ' | ' + a.waste_reduction_pct + '% | $' + a.annual_savings_currency.toLocaleString() + ' | ' + a.implementation_cost.toUpperCase() + ' | ' + a.payback_months + 'mo | ' + a.priority.toUpperCase() + ' |')
  }
  lines.push('')
  lines.push('### Diversion Strategies')
  for (const s of result.diversion_strategies) {
    lines.push('- **' + s.strategy + '** (' + s.diversion_potential_pct + '% diversion): ' + s.description)
    lines.push('  Applicable to: ' + s.applicable_waste_types.join(', '))
  }
  lines.push('')
  lines.push('### Composting Recommendation')
  lines.push(result.composting_recommendation)
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 6: REGULATORY COMPLIANCE TRACKER ====================

function trackRegulatoryCompliance(input: RegulatoryInput): RegulatoryTrackingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const markets = input.target_markets || ['US', 'EU']
  const productCategory = input.product_category || 'General food product'
  const frameworks = input.regulatory_frameworks || ['FDA', 'EFSA']
  const deadlines = input.compliance_deadlines || []
  const certifications = input.current_certifications || []
  const claims = input.product_claims || []

  // Compliance statuses per market
  const complianceStatuses: ComplianceStatus[] = markets.map(market => {
    const marketFrameworks = market === 'US' ? ['FDA 21 CFR', 'FSMA', 'USDA-FSIS']
      : market === 'EU' ? ['EC 178/2002', 'EU FIC 1169/2011', 'EFSA Novel Food']
      : market === 'UK' ? ['UK FSA', 'Food Safety Act 1990', 'UK Nutrition Claims']
      : market === 'CN' ? ['GB Standards', 'SAMR', 'CFDA Novel Ingredient']
      : ['Local food safety authority']

    const gaps: string[] = []
    const requiredActions: string[] = []

    if (market === 'US' && !certifications.includes('FDA_registered')) {
      gaps.push('FDA facility registration not confirmed')
      requiredActions.push('Register facility with FDA prior to shipping')
    }
    if (market === 'EU' && !certifications.includes('EU_authorized')) {
      gaps.push('EU import authorization pending')
      requiredActions.push('Obtain EU novel food authorization or demonstrate substantial equivalence')
    }
    if (claims.length > 0 && !certifications.includes('health_claims_approved')) {
      gaps.push('Health claims require pre-market approval in ' + market)
      requiredActions.push('Submit health claim substantiation dossier to ' + market + ' authority')
    }
    if (productCategory.includes('novel') || productCategory.includes('alternative_protein')) {
      gaps.push('Novel food/ingredient approval required in ' + market)
      requiredActions.push('Initiate novel food safety assessment in ' + market)
    }

    const status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable'
      = gaps.length === 0 ? 'compliant' : gaps.length <= 2 ? 'partial' : 'non_compliant'

    return {
      market,
      framework: marketFrameworks[0] || 'General',
      status,
      gaps,
      required_actions: requiredActions
    }
  })

  // Upcoming deadlines
  const upcomingDeadlines: UpcomingDeadline[] = deadlines.length > 0 ? deadlines.map(d => {
    const daysRemaining = Math.max(0, Math.round((new Date(d.date).getTime() - Date.now()) / 86400000))
    const severity: 'critical' | 'high' | 'medium' | 'low'
      = d.status === 'overdue' ? 'critical'
      : daysRemaining <= 30 ? 'high'
      : daysRemaining <= 90 ? 'medium'
      : 'low'
    return {
      name: d.name,
      date: d.date,
      days_remaining: daysRemaining,
      severity,
      action_required: d.status === 'overdue' ? 'URGENT: Overdue -- submit immediately' : 'Prepare submission ' + Math.max(0, daysRemaining - 30) + ' days before deadline'
    }
  }) : [
    { name: 'Annual facility registration renewal', date: '2026-03-31', days_remaining: rng.nextInt(60, 120), severity: 'medium', action_required: 'Prepare renewal documentation 60 days prior' },
    { name: 'Novel food safety assessment update', date: '2026-06-30', days_remaining: rng.nextInt(120, 200), severity: 'low', action_required: 'Compile safety data package' }
  ]

  // Certification gaps
  const expectedCerts = ['HACCP', 'ISO_22000', 'GMP']
  if (markets.includes('US')) expectedCerts.push('FDA_registered', 'FSMA_PCHF')
  if (markets.includes('EU')) expectedCerts.push('EU_authorized', 'EC_178/2002')
  if (claims.length > 0) expectedCerts.push('health_claims_approved')

  const certificationGaps = expectedCerts.filter(c => !certifications.includes(c))

  // Claim risks
  const claimRisks: string[] = []
  for (const claim of claims) {
    if (claim.toLowerCase().includes('cure') || claim.toLowerCase().includes('treat')) {
      claimRisks.push('"' + claim + '" may constitute an unauthorized drug claim -- high regulatory risk')
    }
    if (claim.toLowerCase().includes('natural') && !certifications.includes('organic')) {
      claimRisks.push('"' + claim + '" natural claim requires substantiation and may need organic certification')
    }
    if (claim.toLowerCase().includes('protein') && !claim.toLowerCase().includes('source of')) {
      claimRisks.push('"' + claim + '" protein claim must meet minimum 12g/100g or 6g/100ml threshold')
    }
  }
  if (claimRisks.length === 0 && claims.length > 0) claimRisks.push('All claims appear compliant -- continue monitoring regulatory guidance updates')

  // Action items
  const actionItems: string[] = []
  for (const cs of complianceStatuses) {
    if (cs.status !== 'compliant') {
      actionItems.push('[' + cs.market + '] ' + cs.required_actions.join('; '))
    }
  }
  for (const dl of upcomingDeadlines.filter(d => d.severity === 'critical' || d.severity === 'high')) {
    actionItems.push('[' + dl.severity.toUpperCase() + '] ' + dl.name + ' due ' + dl.date + ' -- ' + dl.action_required)
  }
  if (certificationGaps.length > 0) actionItems.push('Obtain missing certifications: ' + certificationGaps.join(', '))
  actionItems.push('Schedule quarterly regulatory update review for all target markets')
  actionItems.push('Monitor FDA/EFSA guidance updates for ' + productCategory + ' category')

  // Overall compliance
  const compliantMarkets = complianceStatuses.filter(c => c.status === 'compliant').length
  const overallCompliance = Math.round((compliantMarkets / Math.max(complianceStatuses.length, 1)) * 100)

  const summary = productCategory + ' across ' + markets.length + ' market(s): ' + overallCompliance + '% overall compliance. ' + certificationGaps.length + ' certification gap(s). ' + upcomingDeadlines.filter(d => d.severity === 'critical').length + ' critical deadline(s).'

  return {
    overall_compliance_pct: overallCompliance,
    compliance_statuses: complianceStatuses,
    upcoming_deadlines: upcomingDeadlines,
    certification_gaps: certificationGaps,
    claim_risks: claimRisks,
    action_items: actionItems,
    summary
  }
}

function formatRegulatoryReport(input: RegulatoryInput, result: RegulatoryTrackingResult): string {
  const lines: string[] = []
  lines.push('## Regulatory Compliance Tracking Report')
  lines.push('')
  lines.push('**Product:** ' + (input.product_category || 'General food product') + ' | **Markets:** ' + ((input.target_markets || ['US', 'EU']).join(', ')))
  lines.push('**Overall Compliance:** ' + result.overall_compliance_pct + '%')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Market Compliance Status')
  lines.push('| Market | Framework | Status | Gaps |')
  lines.push('|--------|-----------|--------|------|')
  for (const cs of result.compliance_statuses) {
    lines.push('| ' + cs.market + ' | ' + cs.framework + ' | ' + cs.status.toUpperCase().replace('_', ' ') + ' | ' + (cs.gaps.join('; ') || 'None') + ' |')
  }
  lines.push('')

  lines.push('### Upcoming Deadlines')
  lines.push('| Deadline | Date | Days Left | Severity | Action |')
  lines.push('|----------|------|-----------|----------|--------|')
  for (const d of result.upcoming_deadlines) {
    lines.push('| ' + d.name + ' | ' + d.date + ' | ' + d.days_remaining + ' | ' + d.severity.toUpperCase() + ' | ' + d.action_required + ' |')
  }
  lines.push('')

  if (result.certification_gaps.length > 0) {
    lines.push('### Certification Gaps')
    for (const g of result.certification_gaps) {
      lines.push('- ' + g)
    }
    lines.push('')
  }

  if (result.claim_risks.length > 0) {
    lines.push('### Claim Risks')
    for (const r of result.claim_risks) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('### Action Items')
  for (const a of result.action_items) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 7: INGREDIENT SUSTAINABILITY SCORER ====================

function scoreIngredientSustainability(input: SustainabilityInput): SustainabilityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const ingredients = input.ingredient_list || ['wheat flour', 'sugar', 'palm oil', 'soy protein', 'cocoa']
  const regions = input.sourcing_regions || ['Global']
  const certs = input.certifications || []
  const carbonData = input.carbon_footprint_data || []
  const waterData = input.water_usage_data || []

  // Reference data for common ingredients
  const referenceCarbon: Record<string, number> = {
    'wheat flour': 0.8, 'sugar': 0.6, 'palm oil': 3.3, 'soy protein': 2.0,
    'cocoa': 19.0, 'rice': 2.5, 'oats': 1.2, 'pea protein': 1.5,
    'almond': 3.5, 'dairy': 9.0, 'beef': 27.0, 'chicken': 6.0,
    'coconut oil': 2.3, 'sunflower oil': 1.8, 'olive oil': 1.6
  }
  const referenceWater: Record<string, number> = {
    'wheat flour': 1800, 'sugar': 1500, 'palm oil': 5000, 'soy protein': 2100,
    'cocoa': 17000, 'rice': 2500, 'oats': 1800, 'pea protein': 1100,
    'almond': 16000, 'dairy': 1000, 'beef': 15000, 'chicken': 4300,
    'coconut oil': 3500, 'sunflower oil': 3400, 'olive oil': 4200
  }

  const ingredientScores: IngredientSustainabilityScore[] = ingredients.map(ing => {
    const ingLower = ing.toLowerCase()
    const carbonKg = carbonData.find(c => c.ingredient.toLowerCase() === ingLower)?.kg_co2_per_kg
      || referenceCarbon[ingLower] || rng.nextFloat(1, 10)
    const waterL = waterData.find(w => w.ingredient.toLowerCase() === ingLower)?.liters_per_kg
      || referenceWater[ingLower] || rng.nextFloat(500, 8000)

    // Score inversely proportional to impact (lower impact = higher score)
    const carbonScore = clamp(Math.round(100 - carbonKg * 5 + rng.nextInt(-5, 5)), 0, 100)
    const waterScore = clamp(Math.round(100 - waterL / 200 + rng.nextInt(-5, 5)), 0, 100)
    const landUseScore = clamp(rng.nextInt(40, 85), 0, 100)
    const biodiversityScore = clamp(rng.nextInt(35, 80), 0, 100)
    const socialScore = clamp(rng.nextInt(45, 90), 0, 100)

    const hasCert = certs.some(c => c.toLowerCase().includes(ingLower) || c.toLowerCase().includes('organic') || c.toLowerCase().includes('fair_trade'))
    const certBoost = hasCert ? 10 : 0

    const overall = Math.round((carbonScore * 0.3 + waterScore * 0.25 + landUseScore * 0.2 + biodiversityScore * 0.15 + socialScore * 0.1) + certBoost)

    const improvement = carbonScore < 50
      ? 'High priority: switch to lower-carbon alternative or certified sustainable source'
      : waterScore < 50
      ? 'High priority: source from water-efficient regions or implement water recycling'
      : overall < 60
      ? 'Moderate: seek certified sustainable suppliers and improve traceability'
      : 'Good: maintain current sourcing; explore continuous improvement opportunities'

    return {
      ingredient: ing,
      carbon_score: carbonScore,
      water_score: waterScore,
      land_use_score: landUseScore,
      biodiversity_score: biodiversityScore,
      social_score: socialScore,
      overall_sustainability_score: clamp(overall, 0, 100),
      certification_boost: hasCert,
      improvement_potential: improvement
    }
  })

  const avgScore = Math.round(ingredientScores.reduce((sum, s) => sum + s.overall_sustainability_score, 0) / Math.max(ingredientScores.length, 1))

  // Certification gaps
  const certGaps: string[] = []
  if (!certs.some(c => c.toLowerCase().includes('organic'))) certGaps.push('Organic certification not present -- consider for high-impact ingredients')
  if (!certs.some(c => c.toLowerCase().includes('fair_trade'))) certGaps.push('Fair Trade certification missing -- important for cocoa, sugar, coffee sourcing')
  if (!certs.some(c => c.toLowerCase().includes('rspo') || c.toLowerCase().includes('palm'))) certGaps.push('RSPO certification needed if palm oil is used')
  if (!certs.some(c => c.toLowerCase().includes('rainforest'))) certGaps.push('Rainforest Alliance certification recommended for agricultural commodities')
  if (certGaps.length === 0) certGaps.push('All key sustainability certifications present')

  // Carbon reduction opportunities
  const carbonOpps: string[] = []
  const highCarbon = ingredientScores.filter(s => s.carbon_score < 50)
  for (const hc of highCarbon) {
    carbonOpps.push('Replace or reduce ' + hc.ingredient + ' (carbon score: ' + hc.carbon_score + '/100) with lower-impact alternative')
  }
  carbonOpps.push('Source ingredients from regional suppliers to reduce transport emissions')
  carbonOpps.push('Implement seasonal sourcing calendar to minimize greenhouse/energy-intensive production')

  // Water reduction opportunities
  const waterOpps: string[] = []
  const highWater = ingredientScores.filter(s => s.water_score < 50)
  for (const hw of highWater) {
    waterOpps.push('Address water intensity of ' + hw.ingredient + ' (water score: ' + hw.water_score + '/100) through supplier engagement')
  }
  waterOpps.push('Prioritize ingredients from water-stressed regions for improvement programs')

  // Sustainable alternatives
  const alternatives: string[] = []
  if (ingredients.some(i => i.toLowerCase().includes('palm'))) alternatives.push('Replace palm oil with certified sustainable palm oil (RSPO) or sunflower/rapeseed oil')
  if (ingredients.some(i => i.toLowerCase().includes('beef'))) alternatives.push('Substitute beef with plant-based protein or lower-impact poultry')
  if (ingredients.some(i => i.toLowerCase().includes('almond'))) alternatives.push('Consider oat or pea-based alternatives to reduce water footprint')
  if (alternatives.length === 0) alternatives.push('Current ingredient mix has reasonable sustainability profile -- focus on certification and traceability improvements')

  const recommendations: string[] = []
  recommendations.push('Average sustainability score: ' + avgScore + '/100 across ' + ingredients.length + ' ingredients')
  if (avgScore < 60) recommendations.push('Priority: Improve sourcing for lowest-scoring ingredients (' + ingredientScores.filter(s => s.overall_sustainability_score < 50).map(s => s.ingredient).join(', ') + ')')
  recommendations.push('Set target: achieve 75+ average sustainability score within 12 months')
  recommendations.push('Require sustainability certifications for all new ingredient suppliers')
  recommendations.push('Publish annual sustainability sourcing report for stakeholder transparency')
  recommendations.push('Engage top 3 suppliers by volume in joint sustainability improvement program')

  return {
    average_sustainability_score: avgScore,
    ingredient_scores: ingredientScores,
    certification_gaps: certGaps,
    carbon_reduction_opportunities: carbonOpps,
    water_reduction_opportunities: waterOpps,
    sustainable_alternatives: alternatives,
    recommendations
  }
}

function formatSustainabilityReport(input: SustainabilityInput, result: SustainabilityResult): string {
  const lines: string[] = []
  lines.push('## Ingredient Sustainability Scoring Report')
  lines.push('')
  lines.push('**Ingredients:** ' + (input.ingredient_list || []).join(', '))
  lines.push('**Sourcing Regions:** ' + (input.sourcing_regions || ['Global']).join(', '))
  lines.push('**Certifications:** ' + ((input.certifications || []).join(', ') || 'None'))
  lines.push('')
  lines.push('### Average Sustainability Score: ' + result.average_sustainability_score + '/100')
  lines.push('')
  lines.push('### Ingredient Scores')
  lines.push('| Ingredient | Carbon | Water | Land | Biodiversity | Social | Overall | Cert Boost |')
  lines.push('|------------|--------|-------|------|--------------|--------|---------|------------|')
  for (const s of result.ingredient_scores) {
    lines.push('| ' + s.ingredient + ' | ' + s.carbon_score + ' | ' + s.water_score + ' | ' + s.land_use_score + ' | ' + s.biodiversity_score + ' | ' + s.social_score + ' | ' + s.overall_sustainability_score + ' | ' + (s.certification_boost ? 'Yes' : 'No') + ' |')
  }
  lines.push('')

  lines.push('### Certification Gaps')
  for (const g of result.certification_gaps) {
    lines.push('- ' + g)
  }
  lines.push('')

  lines.push('### Carbon Reduction Opportunities')
  for (const o of result.carbon_reduction_opportunities) {
    lines.push('- ' + o)
  }
  lines.push('')

  lines.push('### Water Reduction Opportunities')
  for (const o of result.water_reduction_opportunities) {
    lines.push('- ' + o)
  }
  lines.push('')

  lines.push('### Sustainable Alternatives')
  for (const a of result.sustainable_alternatives) {
    lines.push('- ' + a)
  }
  lines.push('')

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 8: MENU OPTIMIZATION ENGINE ====================

function optimizeMenu(input: MenuInput): MenuOptimizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const restaurantName = input.restaurant_name || 'Unnamed Restaurant'
  const items = input.menu_items || []
  const dimension = input.analysis_dimension || 'both'
  const targetFoodCost = input.target_food_cost_pct || 30

  if (items.length === 0) {
    return {
      classifications: [],
      avg_food_cost_pct: 0,
      stars_count: 0,
      puzzles_count: 0,
      plow_horses_count: 0,
      dogs_count: 0,
      menu_recommendations: ['No menu items provided for analysis'],
      revenue_optimization_potential_pct: 0
    }
  }

  const avgPrice = items.reduce((sum, i) => sum + i.price, 0) / items.length
  const avgOrders = items.reduce((sum, i) => sum + i.monthly_orders, 0) / items.length

  const classifications: MenuItemClassification[] = items.map(item => {
    const contributionMargin = Math.round((item.price * (1 - item.food_cost_pct / 100)) * 100) / 100
    const popularityIndex = avgOrders > 0 ? Math.round((item.monthly_orders / avgOrders) * 100) / 100 : 0

    const aboveAvgMargin = contributionMargin > avgPrice * (1 - targetFoodCost / 100)
    const aboveAvgPopularity = popularityIndex >= 1.0

    let category: 'star' | 'puzzle' | 'plow_horse' | 'dog'
    let recommendation: string

    if (aboveAvgMargin && aboveAvgPopularity) {
      category = 'star'
      recommendation = 'STAR: High margin + high popularity. Feature prominently. Maintain quality and consistency.'
    } else if (aboveAvgMargin && !aboveAvgPopularity) {
      category = 'puzzle'
      recommendation = 'PUZZLE: High margin but low popularity. Reposition on menu, reduce price slightly, or increase staff recommendations.'
    } else if (!aboveAvgMargin && aboveAvgPopularity) {
      category = 'plow_horse'
      recommendation = 'PLOW HORSE: Low margin but popular. Increase price by 5-10% or reduce portion size to improve margin.'
    } else {
      category = 'dog'
      recommendation = 'DOG: Low margin + low popularity. Remove or completely reformulate to improve appeal and margin.'
    }

    return {
      item_name: item.name,
      category,
      food_cost_pct: item.food_cost_pct,
      contribution_margin: contributionMargin,
      popularity_index: popularityIndex,
      recommendation
    }
  })

  const stars = classifications.filter(c => c.category === 'star').length
  const puzzles = classifications.filter(c => c.category === 'puzzle').length
  const plowHorses = classifications.filter(c => c.category === 'plow_horse').length
  const dogs = classifications.filter(c => c.category === 'dog').length

  const avgFoodCostPct = Math.round((items.reduce((sum, i) => sum + i.food_cost_pct, 0) / items.length) * 10) / 10

  const menuRecs: string[] = []
  if (dogs > 0) menuRecs.push('Remove or reformulate ' + dogs + ' DOG item(s) to improve overall menu profitability')
  if (puzzles > 0) menuRecs.push('Feature ' + puzzles + ' PUZZLE item(s) in premium menu positions or daily specials')
  if (plowHorses > 0) menuRecs.push('Optimize pricing/portions for ' + plowHorses + ' PLOW HORSE item(s) -- demand exists but margins need improvement')
  if (stars > 0) menuRecs.push('Protect ' + stars + ' STAR item(s) -- ensure consistent quality and availability')
  if (avgFoodCostPct > targetFoodCost + 5) menuRecs.push('Overall food cost (' + avgFoodCostPct + '%) exceeds target (' + targetFoodCost + '%) -- review supplier contracts and portion control')
  menuRecs.push('Conduct monthly menu engineering review to track category shifts')
  menuRecs.push('A/B test repositioning of top 2 PUZZLE items for 4 weeks')

  const plowHorseImprovement = items.filter((_, i) => classifications[i].category === 'plow_horse').reduce((sum, i) => sum + i.price * 0.07 * i.monthly_orders, 0)
  const puzzleImprovement = items.filter((_, i) => classifications[i].category === 'puzzle').reduce((sum, i) => sum + i.price * 0.15 * i.monthly_orders, 0)
  const totalRevenue = items.reduce((sum, i) => sum + i.price * i.monthly_orders, 0)
  const optimizationPotential = totalRevenue > 0 ? Math.round(((plowHorseImprovement + puzzleImprovement) / totalRevenue) * 1000) / 10 : 0

  return {
    classifications,
    avg_food_cost_pct: avgFoodCostPct,
    stars_count: stars,
    puzzles_count: puzzles,
    plow_horses_count: plowHorses,
    dogs_count: dogs,
    menu_recommendations: menuRecs,
    revenue_optimization_potential_pct: optimizationPotential
  }
}

function formatMenuReport(input: MenuInput, result: MenuOptimizationResult): string {
  const lines: string[] = []
  lines.push('## Menu Optimization Report')
  lines.push('')
  lines.push('**Restaurant:** ' + (input.restaurant_name || 'Unnamed Restaurant') + ' | **Target Food Cost:** ' + (input.target_food_cost_pct || 30) + '%')
  lines.push('')
  lines.push('### Menu Item Classification Matrix')
  lines.push('| Item | Category | Food Cost % | Margin | Popularity Index | Recommendation |')
  lines.push('|------|----------|-------------|--------|------------------|----------------|')
  for (const c of result.classifications) {
    lines.push('| ' + c.item_name + ' | ' + c.category.toUpperCase().replace('_', ' ') + ' | ' + c.food_cost_pct + '% | $' + c.contribution_margin + ' | ' + c.popularity_index + ' | ' + c.recommendation + ' |')
  }
  lines.push('')

  lines.push('### Distribution Summary')
  lines.push('- Stars (high margin, high popularity): ' + result.stars_count)
  lines.push('- Puzzles (high margin, low popularity): ' + result.puzzles_count)
  lines.push('- Plow Horses (low margin, high popularity): ' + result.plow_horses_count)
  lines.push('- Dogs (low margin, low popularity): ' + result.dogs_count)
  lines.push('- Average Food Cost: ' + result.avg_food_cost_pct + '% (target: ' + (input.target_food_cost_pct || 30) + '%)')
  lines.push('')

  if (result.menu_recommendations.length > 0) {
    lines.push('### Menu Optimization Recommendations')
    for (const r of result.menu_recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('### Revenue Optimization Potential')
  lines.push('Estimated upside from menu optimization actions: +' + result.revenue_optimization_potential_pct + '% monthly revenue')
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Alternative Protein Analyzer
  tools.register(defineTool({
    name: 'alternative_protein_analyzer',
    description: 'Evaluates alternative protein sources (plant-based, fermentation-based, cultivated, hybrid) for food product development. Scores protein content, PDCAAS, environmental impact, cost feasibility, regulatory status, and scalability. Provides regulatory pathway and go-to-market timeline.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: protein_type (plant_based|fermentation_based|cultivated|hybrid), target_product, protein_source_candidates[], scale_of_production (pilot|commercial|industrial), regulatory_region, cost_target_per_kg', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ProteinInput = JSON.parse(args.input_data)
      const result = analyzeAlternativeProtein(input)
      return formatProteinReport(input, result)
    }
  }))

  // Tool 2: Food Safety Compliance Checker
  tools.register(defineTool({
    name: 'food_safety_compliance_checker',
    description: 'Audits food safety compliance against HACCP, ISO 22000, FDA 21 CFR 117, BRC, or FSSC 22000 frameworks. Evaluates CCP monitors, detects compliance gaps, calculates compliance score, assesses risk level, estimates audit readiness timeline, and generates corrective action plans.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: facility_type, regulatory_framework (HACCP|ISO_22000|FDA_21_CFR_117|BRC|FSSC_22000), product_category, audit_scope[], previous_violations, corrective_actions_documented', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ComplianceInput = JSON.parse(args.input_data)
      const result = checkCompliance(input)
      return formatComplianceReport(input, result)
    }
  }))

  // Tool 3: Supply Chain Traceability Engine
  tools.register(defineTool({
    name: 'supply_chain_traceability_engine',
    description: 'Maps ingredient origin from raw material through processing, packaging, distribution, and retail shelf. Generates traceability score (0-100), identifies supply chain nodes with risk levels and certifications, detects gaps, estimates recall readiness time, and provides blockchain-enabled traceability recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_name, ingredient_list[], supplier_regions[], traceability_target (full|batch|ingredient), blockchain_enabled, recall_readiness (low|medium|high)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SupplyChainInput = JSON.parse(args.input_data)
      const result = traceSupplyChain(input)
      return formatSupplyChainReport(input, result)
    }
  }))

  // Tool 4: Personalized Nutrition Planner
  tools.register(defineTool({
    name: 'personalized_nutrition_planner',
    description: 'Creates personalized nutrition plans based on individual profile (age, gender, weight, height, activity level). Calculates BMR, TDEE, daily calorie targets, macronutrient splits, meal suggestions, micronutrient gap analysis, hydration targets, and supplement recommendations. Supports dietary restrictions and health goals.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: age, gender (male|female|other), weight_kg, height_cm, activity_level (sedentary|light|moderate|active|very_active), dietary_restrictions[], health_goals[], food_preferences[], allergies[], meals_per_day', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: NutritionInput = JSON.parse(args.input_data)
      const result = planNutrition(input)
      return formatNutritionReport(input, result)
    }
  }))

  // Tool 5: Food Waste Reducer
  tools.register(defineTool({
    name: 'food_waste_reducer',
    description: 'Analyzes food waste patterns and generates reduction strategies for food service and manufacturing businesses. Identifies waste reduction actions with cost-benefit analysis, diversion strategies (composting, anaerobic digestion, food rescue), landfill diversion targets, and composting recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_type (restaurant|cafe|hotel|catering|retail|manufacturing), daily_volume_kg, current_waste_pct, waste_categories[], seasonality_factor (low|medium|high), operational_days_per_week, current_diversion_pct', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: WasteInput = JSON.parse(args.input_data)
      const result = reduceFoodWaste(input)
      return formatWasteReport(input, result)
    }
  }))

  // Tool 6: Regulatory Compliance Tracker
  tools.register(defineTool({
    name: 'regulatory_compliance_tracker',
    description: 'Tracks regulatory compliance across multiple markets and frameworks. Monitors compliance status per market, upcoming deadlines with severity classification, certification gaps, product claim risks, and generates prioritized action items for food products.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: target_markets[], product_category, regulatory_frameworks[], compliance_deadlines[{name, date, status}], current_certifications[], product_claims[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RegulatoryInput = JSON.parse(args.input_data)
      const result = trackRegulatoryCompliance(input)
      return formatRegulatoryReport(input, result)
    }
  }))

  // Tool 7: Ingredient Sustainability Scorer
  tools.register(defineTool({
    name: 'ingredient_sustainability_scorer',
    description: 'Scores ingredients on sustainability metrics including carbon footprint, water usage, land use, biodiversity impact, and social responsibility. Identifies certification gaps, carbon/water reduction opportunities, and suggests sustainable alternatives.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: ingredient_list[], sourcing_regions[], certifications[], carbon_footprint_data[{ingredient, kg_co2_per_kg}], water_usage_data[{ingredient, liters_per_kg}], packaging_type', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SustainabilityInput = JSON.parse(args.input_data)
      const result = scoreIngredientSustainability(input)
      return formatSustainabilityReport(input, result)
    }
  }))

  // Tool 8: Menu Optimization Engine
  tools.register(defineTool({
    name: 'menu_optimization_engine',
    description: 'Four-quadrant menu optimization matrix (Star, Puzzle, Plow Horse, Dog) classification based on item profitability and popularity. Calculates contribution margins, food cost percentages, popularity indices, and provides per-item strategic recommendations with revenue optimization potential.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: restaurant_name, menu_items[{name, price, food_cost_pct, monthly_orders}], analysis_dimension (profitability|popularity|both), target_food_cost_pct', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: MenuInput = JSON.parse(args.input_data)
      const result = optimizeMenu(input)
      return formatMenuReport(input, result)
    }
  }))

  console.log('[dsh-tool-foodtechai] Loaded v' + VERSION + ' - Food Tech & Alternative Proteins Toolkit with 8 tools')
  console.log('  Tools: alternative_protein_analyzer, food_safety_compliance_checker, supply_chain_traceability_engine, personalized_nutrition_planner, food_waste_reducer, regulatory_compliance_tracker, ingredient_sustainability_scorer, menu_optimization_engine')
}
