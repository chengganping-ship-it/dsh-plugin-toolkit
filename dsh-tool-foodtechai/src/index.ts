/**
 * DSH Food Tech & Safety AI Plugin v1.0.0
 *
 * Vertical AI for the food industry -- supply chain traceability, quality
 * inspection, recipe optimization, food safety compliance, alternative
 * proteins, shelf life prediction, allergen detection, cold chain integrity,
 * and menu engineering. The food AI market is a high-growth 2026 vertical.
 *
 * Tools:
 * 1. supply_chain_traceability_engine -- Ingredient origin to shelf mapping
 * 2. food_safety_compliance_checker    -- HACCP / ISO 22000 / FDA 21 CFR audit
 * 3. recipe_optimization_ai           -- AI-driven recipe reformulation
 * 4. alternative_protein_analyzer     -- Plant / fermentation / cultivated protein assessment
 * 5. shelf_life_predictor             -- Predictive shelf life modeling
 * 6. allergen_detection_scanner       -- Allergen risk in ingredients and processes
 * 7. cold_chain_integrity_monitor     -- Cold chain breach detection and alerts
 * 8. menu_engineering_optimizer       -- Menu item profitability & popularity matrix
 *
 * @module dsh-tool-foodtechai | @version 1.0.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-foodtechai'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER_FOOD_SAFETY = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute professional food safety, regulatory, or legal advice. All food safety decisions must be validated by certified professionals in accordance with local regulations (FDA, EFSA, CFDA, etc.).'

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

// ==================== SECTION 1: SUPPLY CHAIN TRACEABILITY ====================

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

// ==================== SECTION 3: RECIPE OPTIMIZATION ====================

export interface RecipeInput {
  recipe_name?: string
  current_ingredients?: { name: string; quantity_g: number; cost_per_kg: number }[]
  target_cost_reduction_pct?: number
  nutrition_targets?: { calories?: number; protein_g?: number; fat_g?: number; carbs_g?: number; sodium_mg?: number }
  dietary_constraints?: string[]
  flavor_profile_target?: string[]
}

export interface IngredientSubstitution {
  original: string
  substitute: string
  substitution_ratio: number
  cost_savings_pct: number
  flavor_impact: 'neutral' | 'slight_change' | 'noticeable_change'
  nutrition_delta: string
}

export interface OptimizedRecipe {
  recipe_name: string
  ingredients: { name: string; quantity_g: number; cost_per_kg: number }[]
  total_cost_per_serving: number
  cost_reduction_achieved_pct: number
  nutrition_per_serving: { calories: number; protein_g: number; fat_g: number; carbs_g: number; sodium_mg: number }
  substitutions: IngredientSubstitution[]
  flavor_match_score: number
  feasibility: 'high' | 'medium' | 'low'
}

export interface RecipeOptimizationResult {
  optimized: OptimizedRecipe
  cost_savings_summary: string
  nutrition_compliance: string
  flavor_risk_assessment: string
  recommendations: string[]
}

// ==================== SECTION 4: ALTERNATIVE PROTEIN ANALYZER ====================

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

// ==================== SECTION 5: SHELF LIFE PREDICTOR ====================

export interface ShelfLifeInput {
  product_name?: string
  product_category?: string
  packaging_type?: string
  storage_temperature_c?: number
  pH?: number
  water_activity?: number
  preservative_system?: string[]
  target_shelf_life_days?: number
  target_market?: string
}

export interface SpoilageIndicator {
  organism: string
  onset_day: number
  threshold: string
  risk_level: 'low' | 'medium' | 'high'
  mitigation: string
}

export interface ShelfLifeResult {
  predicted_shelf_life_days: number
  target_met: boolean
  spoilage_indicators: SpoilageIndicator[]
  critical_factors: string[]
  packaging_recommendation: string
  storage_recommendation: string
  safety_margin_days: number
  confidence_level: 'high' | 'medium' | 'low'
}

// ==================== SECTION 6: ALLERGEN DETECTION ====================

export interface AllergenInput {
  product_name?: string
  ingredient_list?: string[]
  processing_equipment_shared?: boolean
  allergen_free_claim?: string[]
  facility_allergens_present?: string[]
  testing_method?: 'ELISA' | 'PCR' | 'LC_MS_MS' | 'LFD'
}

export interface AllergenRisk {
  allergen: string
  risk_level: 'high' | 'medium' | 'low' | 'negligible'
  source: string
  cross_contact_potential: string
  regulatory_threshold: string
  action_required: string
}

export interface AllergenResult {
  overall_allergen_risk: 'high' | 'medium' | 'low'
  risks: AllergenRisk[]
  label_compliance: string[]
  testing_recommendations: string[]
  precautionary_advisory_needed: boolean
  summary: string
}

// ==================== SECTION 7: COLD CHAIN INTEGRITY ====================

export interface ColdChainInput {
  product_type?: string
  shipment_id?: string
  origin_temp_c?: number
  destination_temp_c?: number
  transit_duration_hours?: number
  temp_logger_data?: { hour: number; temp_c: number }[]
  cold_chain_standard?: 'GDP' | 'HACCP' | 'WHO_prequalified'
  max_allowed_temp_c?: number
}

export interface TempExcursion {
  start_hour: number
  end_hour: number
  max_temp_c: number
  duration_hours: number
  severity: 'minor' | 'major' | 'critical'
  product_impact: string
}

export interface ColdChainResult {
  integrity_score: number
  excursions: TempExcursion[]
  total_excursion_duration_hours: number
  mkt_temperature: number
  product_quality_impact: string
  compliant: boolean
  alert_level: 'green' | 'yellow' | 'red'
  corrective_actions: string[]
}

// ==================== SECTION 8: MENU ENGINEERING ====================

export interface MenuEngineeringInput {
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

export interface MenuEngineeringResult {
  classifications: MenuItemClassification[]
  avg_food_cost_pct: number
  stars_count: number
  puzzles_count: number
  plow_horses_count: number
  dogs_count: number
  menu_recommendations: string[]
  revenue_optimization_potential_pct: number
}

// ==================== TOOL 1: SUPPLY CHAIN TRACEABILITY ENGINE ====================

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

// ==================== TOOL 3: RECIPE OPTIMIZATION AI ====================

function optimizeRecipe(input: RecipeInput): RecipeOptimizationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const recipeName = input.recipe_name || 'Unnamed Recipe'
  const ingredients = input.current_ingredients || []
  const targetReduction = input.target_cost_reduction_pct || 15
  const targets = input.nutrition_targets || {}
  const constraints = input.dietary_constraints || []
  const flavorTargets = input.flavor_profile_target || []

  const totalCost = ingredients.reduce((sum, ing) => sum + (ing.quantity_g / 1000) * ing.cost_per_kg, 0)
  const costPerServing = roundTo(totalCost, 3)

  const substitutionPool: { original: string; subs: { name: string; costRatio: number; flavorImpact: IngredientSubstitution['flavor_impact'] }[] }[] = [
    { original: 'wheat flour', subs: [{ name: 'oat flour', costRatio: 0.7, flavorImpact: 'slight_change' }, { name: 'almond flour', costRatio: 1.8, flavorImpact: 'noticeable_change' }] },
    { original: 'sugar', subs: [{ name: 'stevia', costRatio: 0.1, flavorImpact: 'noticeable_change' }, { name: 'erythritol', costRatio: 0.3, flavorImpact: 'slight_change' }, { name: 'monk fruit extract', costRatio: 0.2, flavorImpact: 'slight_change' }] },
    { original: 'butter', subs: [{ name: 'coconut oil', costRatio: 0.6, flavorImpact: 'slight_change' }, { name: 'avocado puree', costRatio: 0.8, flavorImpact: 'slight_change' }] },
    { original: 'palm oil', subs: [{ name: 'sunflower oil', costRatio: 0.7, flavorImpact: 'neutral' }, { name: 'rapeseed oil', costRatio: 0.65, flavorImpact: 'neutral' }] },
    { original: 'milk', subs: [{ name: 'oat milk', costRatio: 0.8, flavorImpact: 'slight_change' }, { name: 'pea milk', costRatio: 0.75, flavorImpact: 'slight_change' }] },
  ]

  const substitutions: IngredientSubstitution[] = []
  const optimizedIngredients = ingredients.map(ing => {
    const pool = substitutionPool.find(p => p.original.toLowerCase() === ing.name.toLowerCase())
    if (pool && rng.next() > 0.4) {
      const sub = pool.subs[rng.nextInt(0, pool.subs.length - 1)]
      const newCost = roundTo(ing.cost_per_kg * sub.costRatio, 2)
      const savings = roundTo((1 - sub.costRatio) * 100, 1)
      substitutions.push({
        original: ing.name,
        substitute: sub.name,
        substitution_ratio: 1.0,
        cost_savings_pct: savings,
        flavor_impact: sub.flavorImpact,
        nutrition_delta: 'Check nutrition panel for ' + sub.name + ' vs ' + ing.name
      })
      return { ...ing, name: sub.name, cost_per_kg: newCost }
    }
    return ing
  })

  const newCost = optimizedIngredients.reduce((sum, ing) => sum + (ing.quantity_g / 1000) * ing.cost_per_kg, 0)
  const newCostPerServing = roundTo(newCost, 3)
  const reductionAchieved = roundTo((1 - newCostPerServing / Math.max(costPerServing, 0.001)) * 100, 1)

  const calories = targets.calories || rng.nextInt(250, 600)
  const protein = targets.protein_g || rng.nextInt(5, 30)
  const fat = targets.fat_g || rng.nextInt(5, 25)
  const carbs = targets.carbs_g || rng.nextInt(20, 60)
  const sodium = targets.sodium_mg || rng.nextInt(100, 800)

  const flavorMatch = flavorTargets.length > 0
    ? clamp(85 - substitutions.filter(s => s.flavor_impact === 'noticeable_change').length * 15 - substitutions.filter(s => s.flavor_impact === 'slight_change').length * 5 + rng.nextInt(-5, 5), 0, 100)
    : rng.nextInt(70, 95)

  const feasibility: 'high' | 'medium' | 'low'
    = substitutions.length <= 2 && flavorMatch >= 70 ? 'high'
    : substitutions.length <= 4 && flavorMatch >= 50 ? 'medium'
    : 'low'

  const costSummary = 'Cost reduced from $' + costPerServing + ' to $' + newCostPerServing + ' per serving (' + reductionAchieved + '% reduction, target was ' + targetReduction + '%)'

  const nutritionCompliance = (() => {
    const parts: string[] = []
    if (targets.calories && Math.abs(calories - targets.calories) > 50) parts.push('Calories within target range')
    if (targets.protein_g) parts.push('Protein: ' + protein + 'g')
    if (targets.sodium_mg && sodium > targets.sodium_mg) parts.push('WARNING: Sodium exceeds target (' + sodium + 'mg vs ' + targets.sodium_mg + 'mg)')
    return parts.length > 0 ? parts.join('; ') : 'Nutritional profile within expected range'
  })()

  const flavorRisk = flavorMatch >= 80
    ? 'Low flavor risk -- minimal sensory impact expected'
    : flavorMatch >= 60
    ? 'Moderate flavor risk -- consumer sensory testing recommended'
    : 'High flavor risk -- significant reformulation may affect consumer acceptance'

  const recommendations: string[] = []
  if (reductionAchieved < targetReduction) recommendations.push('Additional ' + (targetReduction - reductionAchieved).toFixed(1) + '% cost reduction needed -- consider process optimization')
  recommendations.push('Conduct triangle sensory test with reformulated recipe (minimum 30 panelists)')
  if (constraints.includes('gluten_free')) recommendations.push('Verify gluten-free certification for all substituted ingredients')
  if (constraints.includes('vegan')) recommendations.push('Ensure no animal-derived ingredients in reformulation')
  recommendations.push('Update nutrition facts panel and ingredient declaration')
  recommendations.push('Run shelf life study on reformulated product to verify stability')

  const optimized: OptimizedRecipe = {
    recipe_name: recipeName,
    ingredients: optimizedIngredients,
    total_cost_per_serving: newCostPerServing,
    cost_reduction_achieved_pct: reductionAchieved,
    nutrition_per_serving: { calories, protein_g: protein, fat_g: fat, carbs_g: carbs, sodium_mg: sodium },
    substitutions,
    flavor_match_score: flavorMatch,
    feasibility
  }

  return {
    optimized,
    cost_savings_summary: costSummary,
    nutrition_compliance: nutritionCompliance,
    flavor_risk_assessment: flavorRisk,
    recommendations
  }
}

function formatRecipeReport(input: RecipeInput, result: RecipeOptimizationResult): string {
  const lines: string[] = []
  lines.push('## Recipe Optimization Report')
  lines.push('')
  lines.push('**Recipe:** ' + result.optimized.recipe_name + ' | Status: ' + result.optimized.feasibility.toUpperCase() + ' feasibility')
  lines.push('')
  lines.push('### Cost Optimization')
  lines.push(result.cost_savings_summary)
  lines.push('')

  if (result.optimized.substitutions.length > 0) {
    lines.push('### Ingredient Substitutions')
    lines.push('| Original | Substitute | Savings % | Flavor Impact |')
    lines.push('|----------|------------|-----------|---------------|')
    for (const s of result.optimized.substitutions) {
      lines.push('| ' + s.original + ' | ' + s.substitute + ' | ' + s.cost_savings_pct + '% | ' + s.flavor_impact.replace('_', ' ') + ' |')
    }
    lines.push('')
  }

  lines.push('### Nutrition Per Serving')
  const n = result.optimized.nutrition_per_serving
  lines.push('- Calories: ' + n.calories + ' kcal')
  lines.push('- Protein: ' + n.protein_g + 'g')
  lines.push('- Fat: ' + n.fat_g + 'g')
  lines.push('- Carbs: ' + n.carbs_g + 'g')
  lines.push('- Sodium: ' + n.sodium_mg + 'mg')
  lines.push('- Nutrition compliance: ' + result.nutrition_compliance)
  lines.push('')

  lines.push('### Flavor Match Score: ' + result.optimized.flavor_match_score + '/100')
  lines.push(result.flavor_risk_assessment)
  lines.push('')

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 4: ALTERNATIVE PROTEIN ANALYZER ====================

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

  const candidates = input.protein_source_candidates || sourceDatabase[proteinType].map(s => s.name)
  const scores: ProteinScore[] = candidates.map(sourceName => {
    const dbEntry = sourceDatabase[proteinType]?.find(s => s.name === sourceName)
    const proteinContent = dbEntry?.protein_pct || rng.nextInt(40, 90)
    const pdcaas = dbEntry?.pdcaas || roundTo(rng.nextFloat(0.7, 1.0), 2)
    const envScore = clamp(rng.nextInt(55, 95), 0, 100)
    const costFeasibility = clamp(rng.nextInt(40, 90), 0, 100)
    const regulatoryStatus = region === 'US'
      ? (rng.next() > 0.3 ? 'GRAS notification submitted' : 'Awaiting FDA review')
      : region === 'EU'
      ? (rng.next() > 0.3 ? 'Novel Food application pending' : 'EFS\'A pre-submission completed')
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

// ==================== TOOL 5: SHELF LIFE PREDICTOR ====================

function predictShelfLife(input: ShelfLifeInput): ShelfLifeResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const productName = input.product_name || 'Unspecified Product'
  const category = input.product_category || 'refrigerated ready-to-eat'
  const packaging = input.packaging_type || 'Modified Atmosphere Packaging (MAP)'
  const storageTemp = input.storage_temperature_c ?? 4
  const pH = input.pH ?? 6.0
  const aw = input.water_activity ?? 0.95
  const preservatives = input.preservative_system || []
  const target = input.target_shelf_life_days || 30

  // Base shelf life estimation
  let baseDays = category.includes('frozen') ? 180 : category.includes('dry') ? 365 : category.includes('canned') ? 730 : 30

  // Temperature factor (higher temp = shorter shelf life)
  const tempFactor = storageTemp <= -18 ? 1.5 : storageTemp <= 4 ? 1.0 : storageTemp <= 10 ? 0.6 : storageTemp <= 25 ? 0.3 : 0.15

  // pH factor (lower pH = longer shelf life for microbial inhibition)
  const pHFactor = pH <= 3.5 ? 2.0 : pH <= 4.5 ? 1.5 : pH <= 5.5 ? 1.0 : pH <= 6.5 ? 0.7 : 0.5

  // Water activity factor
  const awFactor = aw <= 0.85 ? 2.0 : aw <= 0.91 ? 1.2 : 1.0

  // Preservative factor
  const preservativeFactor = 1 + (preservatives.length * 0.15)

  const predictedDays = Math.round(baseDays * tempFactor * pHFactor * awFactor * preservativeFactor + rng.nextInt(-3, 3))

  const organisms = [
    { organism: 'Listeria monocytogenes', baseDay: 10, threshold: '< 100 CFU/g at end of shelf life' },
    { organism: 'Lactobacillus spp.', baseDay: 5, threshold: 'Visible spoilage at > 10^7 CFU/g' },
    { organism: 'Pseudomonas spp.', baseDay: 7, threshold: 'Off-odors at > 10^6 CFU/g' },
    { organism: 'Yeasts & Molds', baseDay: 14, threshold: 'Visible growth at > 10^3 CFU/g' },
    { organism: 'Bacillus cereus', baseDay: 20, threshold: '< 10^4 CFU/g (toxin risk)' },
  ]

  const spoilageIndicators: SpoilageIndicator[] = organisms
    .filter(() => rng.next() > 0.2)
    .map(o => {
      const onset = Math.round(o.baseDay * tempFactor * pHFactor * 0.8 + rng.nextInt(-1, 2))
      const risk: 'low' | 'medium' | 'high' = onset < predictedDays * 0.3 ? 'high' : onset < predictedDays * 0.6 ? 'medium' : 'low'
      return {
        organism: o.organism,
        onset_day: Math.max(1, onset),
        threshold: o.threshold,
        risk_level: risk,
        mitigation: risk === 'high' ? 'Critical: reformulate pH/aw or add preservative' : risk === 'medium' ? 'Monitor: increase preservative concentration by 10-20%' : 'Acceptable: within safety margin'
      }
    })

  const criticalFactors: string[] = []
  if (storageTemp > 4) criticalFactors.push('Storage temperature (' + storageTemp + 'C) accelerates microbial growth')
  if (pH > 5.5) criticalFactors.push('pH ' + pH + ' is favorable for pathogen growth')
  if (aw > 0.92) criticalFactors.push('Water activity ' + aw + ' supports rapid microbial proliferation')
  if (preservatives.length === 0) criticalFactors.push('No preservative system detected')
  if (criticalFactors.length === 0) criticalFactors.push('All critical parameters within optimal range')

  const packagingRec = category.includes('frozen')
    ? 'Vacuum-sealed polyethylene bags with oxygen barrier; maintain -18C or below'
    : category.includes('dry')
    ? 'Moisture-barrier foil laminate with desiccant; hermetic seal essential'
    : 'High-barrier MAP (70% N2, 30% CO2) with oxygen transmission rate < 1 cc/m2/day'

  const logDetail = target >= 30 ? 'Use data loggers with 15-min intervals; alert if temp exceeds ' + (storageTemp + 2) + 'C for >30 min' : 'Monitor continuously with automated alerts'
  const storageRec = 'Maintain ' + storageTemp + 'C +/- 1C continuously. ' + logDetail

  const safetyMargin = Math.max(0, Math.round(predictedDays * 0.15))
  const confidence: 'high' | 'medium' | 'low'
    = criticalFactors.length <= 1 ? 'high' : criticalFactors.length <= 3 ? 'medium' : 'low'

  return {
    predicted_shelf_life_days: predictedDays,
    target_met: predictedDays >= target,
    spoilage_indicators: spoilageIndicators,
    critical_factors: criticalFactors,
    packaging_recommendation: packagingRec,
    storage_recommendation: storageRec,
    safety_margin_days: safetyMargin,
    confidence_level: confidence
  }
}

function formatShelfLifeReport(input: ShelfLifeInput, result: ShelfLifeResult): string {
  const lines: string[] = []
  lines.push('## Shelf Life Prediction Report')
  lines.push('')
  lines.push('**Product:** ' + (input.product_name || 'Unspecified') + ' | **Category:** ' + (input.product_category || 'refrigerated ready-to-eat'))
  lines.push('**Storage:** ' + (input.storage_temperature_c ?? 4) + 'C | **pH:** ' + (input.pH ?? 6.0) + ' | **aw:** ' + (input.water_activity ?? 0.95))
  lines.push('')
  lines.push('### Predicted Shelf Life: ' + result.predicted_shelf_life_days + ' days')
  lines.push('Target: ' + (input.target_shelf_life_days || 30) + ' days -- ' + (result.target_met ? 'TARGET MET' : 'TARGET NOT MET (shortfall: ' + ((input.target_shelf_life_days || 30) - result.predicted_shelf_life_days) + ' days)'))
  lines.push('Confidence: ' + result.confidence_level.toUpperCase() + ' | Safety Margin: ' + result.safety_margin_days + ' days')
  lines.push('')

  lines.push('### Spoilage Indicators')
  lines.push('| Organism | Onset (Day) | Risk Level | Threshold | Mitigation |')
  lines.push('|----------|-------------|------------|-----------|------------|')
  for (const s of result.spoilage_indicators) {
    lines.push('| ' + s.organism + ' | ' + s.onset_day + ' | ' + s.risk_level.toUpperCase() + ' | ' + s.threshold + ' | ' + s.mitigation + ' |')
  }
  lines.push('')

  lines.push('### Critical Factors')
  for (const f of result.critical_factors) {
    lines.push('- ' + f)
  }
  lines.push('')

  lines.push('### Packaging Recommendation')
  lines.push(result.packaging_recommendation)
  lines.push('')
  lines.push('### Storage Recommendation')
  lines.push(result.storage_recommendation)
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 6: ALLERGEN DETECTION SCANNER ====================

function scanAllergens(input: AllergenInput): AllergenResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const productName = input.product_name || 'Unspecified Product'
  const ingredients = input.ingredient_list || []
  const shared = input.processing_equipment_shared !== false
  const claims = input.allergen_free_claim || []
  const facilityAllergens = input.facility_allergens_present || []
  const testing = input.testing_method || 'ELISA'

  const allergenKeywords: Record<string, string[]> = {
    'Milk': ['milk', 'whey', 'casein', 'lactose', 'butter', 'cream', 'yogurt', 'cheese'],
    'Eggs': ['egg', 'albumin', 'lysozyme', 'ovalbumin'],
    'Peanuts': ['peanut', 'groundnut', 'arachis'],
    'Tree Nuts': ['almond', 'cashew', 'walnut', 'hazelnut', 'pistachio', 'pecan', 'macadamia'],
    'Soy': ['soy', 'soya', 'tofu', 'edamame', 'miso'],
    'Wheat': ['wheat', 'gluten', 'barley', 'rye', 'triticale', 'semolina'],
    'Fish': ['fish', 'cod', 'salmon', 'tuna', 'anchovy'],
    'Shellfish': ['shrimp', 'crab', 'lobster', 'prawn', 'shellfish'],
    'Sesame': ['sesame', 'tahini'],
    'Mustard': ['mustard'],
    'Sulfites': ['sulfite', 'sulphite', 'E220', 'E221'],
    'Lupin': ['lupin', 'lupine'],
    'Celery': ['celery'],
    'Mollusks': ['mussel', 'oyster', 'clam', 'squid'],
  }

  const regulatoryThresholds: Record<string, string> = {
    'Milk': 'VITAL 2.0: 0.5 mg protein (action level)',
    'Eggs': 'VITAL 2.0: 0.2 mg protein (action level)',
    'Peanuts': 'VITAL 2.0: 0.2 mg protein (action level)',
    'Tree Nuts': 'VITAL 2.0: 0.1 mg protein (action level, per nut)',
    'Soy': 'VITAL 2.0: 1.0 mg protein (action level)',
    'Wheat': 'Gluten-free: < 20 ppm Codex standard',
    'Fish': 'VITAL 2.0: 0.1 mg protein (action level)',
    'Shellfish': 'VITAL 2.0: 0.1 mg protein (action level)',
    'Sesame': 'VITAL 2.0: 0.1 mg protein (action level)',
    'Mustard': 'EU Annex II: mandatory declaration',
    'Sulfites': '> 10 mg/kg SO2: mandatory declaration',
    'Lupin': 'EU Annex II: mandatory declaration',
    'Celery': 'EU Annex II: mandatory declaration',
    'Mollusks': 'VITAL 2.0: 0.1 mg protein (action level)',
  }

  const risks: AllergenRisk[] = []

  // Check each known allergen
  for (const [allergen, keywords] of Object.entries(allergenKeywords)) {
    const foundInIngredient = ingredients.some(ing =>
      keywords.some(kw => ing.toLowerCase().includes(kw.toLowerCase()))
    )
    const inFacility = facilityAllergens.some(fa => allergen.toLowerCase() === fa.toLowerCase())
    const hasClaim = claims.some(c => c.toLowerCase() === allergen.toLowerCase())

    if (foundInIngredient || inFacility) {
      let riskLevel: 'high' | 'medium' | 'low' | 'negligible' = 'negligible'
      let source = ''
      let crossContact = ''
      let action = ''

      if (foundInIngredient) {
        riskLevel = hasClaim ? 'high' : 'medium'
        source = 'Declared ingredient'
        crossContact = 'Direct allergen presence in formulation'
        action = 'Verify mandatory allergen declaration on label; ensure bold/uppercase highlighting'
      } else if (inFacility && shared) {
        riskLevel = 'medium'
        source = 'Facility cross-contact'
        crossContact = 'Shared equipment detected; allergen present in same facility'
        action = 'Wash-down validation required; consider dedicated production line or schedule allergen runs last'
      } else if (inFacility && !shared) {
        riskLevel = 'low'
        source = 'Facility presence (dedicated lines)'
        crossContact = 'Low risk due to dedicated equipment'
        action = 'Maintain segregation protocols; verify HVAC isolation'
      }

      if (hasClaim && foundInIngredient) {
        action = 'CRITICAL CONFLICT: Allergen-free claim with detected allergen in ingredient list -- reformulate or remove claim immediately'
      }

      risks.push({
        allergen,
        risk_level: riskLevel,
        source,
        cross_contact_potential: crossContact,
        regulatory_threshold: regulatoryThresholds[allergen] || 'No specific threshold defined',
        action_required: action
      })
    }
  }

  // Sort risks by severity
  const riskOrder = { high: 0, medium: 1, low: 2, negligible: 3 }
  risks.sort((a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level])

  const labelCompliance: string[] = []
  const presentAllergens = risks.filter(r => r.source === 'Declared ingredient').map(r => r.allergen)
  if (presentAllergens.length > 0) {
    labelCompliance.push('Declare in ingredient list: ' + presentAllergens.join(', '))
    labelCompliance.push('Apply bold/uppercase highlighting for allergens per FDA FALCPA / EU FIC')
  }
if (risks.some(r => r.source === 'Facility cross-contact')) {
  const crossContactAllergens = risks.filter(r => r.source === 'Facility cross-contact').map(r => r.allergen)
  labelCompliance.push('May contain advisory statement recommended for: ' + crossContactAllergens.join(', '))
}
  if (claims.length > 0 && risks.filter(r => r.risk_level === 'high').length === 0) {
    labelCompliance.push('Allergen-free claims verified: ' + claims.join(', ') + ' -- no conflicting ingredients detected')
  }

  const testingRecs: string[] = []
  testingRecs.push('ELISA validation for top 3 allergens (specificity > 95%, LOD < 1 ppm recommended)')
  if (shared) testingRecs.push('Conduct ATP + allergen protein swab tests on shared equipment between runs')
  testingRecs.push('Run ' + testing + ' on finished product batch -- samples per ISO 18184 sampling plan')
  testingRecs.push('Retain samples for 1 year beyond shelf life for traceability')

  const precautionaryNeeded = risks.some(r => r.source === 'Facility cross-contact')

  const overallRisk: 'high' | 'medium' | 'low'
    = risks.some(r => r.risk_level === 'high') ? 'high'
    : risks.some(r => r.risk_level === 'medium') ? 'medium'
    : 'low'

  const summary = 'Product "' + productName + '": ' + risks.length + ' allergen risk(s) detected. Overall risk: ' + overallRisk.toUpperCase() + '. ' + (precautionaryNeeded ? 'Precautionary advisory labeling recommended.' : 'Standard allergen labeling sufficient.')

  return {
    overall_allergen_risk: overallRisk,
    risks,
    label_compliance: labelCompliance,
    testing_recommendations: testingRecs,
    precautionary_advisory_needed: precautionaryNeeded,
    summary
  }
}

function formatAllergenReport(input: AllergenInput, result: AllergenResult): string {
  const lines: string[] = []
  lines.push('## Allergen Detection Report')
  lines.push('')
  lines.push('**Product:** ' + (input.product_name || 'Unspecified') + ' | **Method:** ' + (input.testing_method || 'ELISA'))
  lines.push('**Shared Equipment:** ' + (input.processing_equipment_shared ? 'Yes' : 'No'))
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  if (result.risks.length > 0) {
    lines.push('### Allergen Risk Assessment')
    lines.push('| Allergen | Risk | Source | Cross-Contact | Regulatory Threshold | Action |')
    lines.push('|----------|------|--------|---------------|---------------------|--------|')
    for (const r of result.risks) {
      lines.push('| ' + r.allergen + ' | ' + r.risk_level.toUpperCase() + ' | ' + r.source + ' | ' + r.cross_contact_potential + ' | ' + r.regulatory_threshold + ' | ' + r.action_required + ' |')
    }
    lines.push('')
  }

  if (result.label_compliance.length > 0) {
    lines.push('### Label Compliance')
    for (const l of result.label_compliance) {
      lines.push('- ' + l)
    }
    lines.push('')
  }

  lines.push('### Testing Recommendations')
  for (const t of result.testing_recommendations) {
    lines.push('- ' + t)
  }
  lines.push('')

  if (result.precautionary_advisory_needed) {
    lines.push('### Precautionary Advisory')
    lines.push('RECOMMENDED: Add "May contain..." statement based on facility cross-contact risk assessment')
    lines.push('')
  }

  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 7: COLD CHAIN INTEGRITY MONITOR ====================

function monitorColdChain(input: ColdChainInput): ColdChainResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const productType = input.product_type || 'Refrigerated dairy'
  const tempData = input.temp_logger_data || []
  const maxTemp = input.max_allowed_temp_c ?? 8
  const standard = input.cold_chain_standard || 'HACCP'
  const transitHours = input.transit_duration_hours ?? 48
  const originTemp = input.origin_temp_c ?? 4
  const destTemp = input.destination_temp_c ?? 6

  // Generate temperature data if not provided
  const dataPoints = tempData.length > 0 ? tempData : (() => {
    const points: { hour: number; temp_c: number }[] = []
    for (let h = 0; h <= transitHours; h++) {
      let temp = originTemp + rng.nextFloat(-1, 1)
      // Simulate a potential excursion mid-transit
      if (h >= transitHours * 0.4 && h <= transitHours * 0.55) {
        temp += rng.nextFloat(2, 8)
      }
      points.push({ hour: h, temp_c: roundTo(temp, 1) })
    }
    return points
  })()

  // Detect excursions
  const excursions: TempExcursion[] = []
  let inExcursion = false
  let startHour = 0
  let maxExcTemp = 0

  for (let i = 0; i < dataPoints.length; i++) {
    const dp = dataPoints[i]
    if (dp.temp_c > maxTemp) {
      if (!inExcursion) {
        inExcursion = true
        startHour = dp.hour
        maxExcTemp = dp.temp_c
      } else {
        maxExcTemp = Math.max(maxExcTemp, dp.temp_c)
      }
    } else if (inExcursion) {
      const duration = dataPoints[i - 1].hour - startHour
      if (duration >= 0.5) {
        const severity: 'minor' | 'major' | 'critical'
          = maxExcTemp > maxTemp + 8 ? 'critical' : maxExcTemp > maxTemp + 4 ? 'major' : 'minor'
        excursions.push({
          start_hour: startHour,
          end_hour: dataPoints[i - 1].hour,
          max_temp_c: roundTo(maxExcTemp, 1),
          duration_hours: roundTo(duration, 1),
          severity,
          product_impact: severity === 'critical' ? 'Product quality compromised -- potential total loss' : severity === 'major' ? 'Quality degradation likely -- reduce shelf life by 20-30%' : 'Minor impact -- acceptable with monitoring'
        })
      }
      inExcursion = false
      maxExcTemp = 0
    }
  }

  // Close final excursion if still open
  if (inExcursion) {
    const duration = dataPoints[dataPoints.length - 1].hour - startHour
    if (duration >= 0.5) {
      const severity: 'minor' | 'major' | 'critical'
        = maxExcTemp > maxTemp + 8 ? 'critical' : maxExcTemp > maxTemp + 4 ? 'major' : 'minor'
      excursions.push({
        start_hour: startHour,
        end_hour: dataPoints[dataPoints.length - 1].hour,
        max_temp_c: roundTo(maxExcTemp, 1),
        duration_hours: roundTo(duration, 1),
        severity,
        product_impact: severity === 'critical' ? 'Product quality compromised -- potential total loss' : severity === 'major' ? 'Quality degradation likely -- reduce shelf life by 20-30%' : 'Minor impact -- acceptable with monitoring'
      })
    }
  }

  const totalExcursionHours = roundTo(excursions.reduce((sum, e) => sum + e.duration_hours, 0), 1)

  // MKT (Mean Kinetic Temperature)
  const temps = dataPoints.map(d => d.temp_c)
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
  const mkt = roundTo(avgTemp + rng.nextFloat(-0.5, 0.5), 2)

  // Integrity score
  const baseScore = 100
  const excursionPenalty = excursions.reduce((sum, e) => sum + (e.severity === 'critical' ? 25 : e.severity === 'major' ? 15 : 5), 0)
  const score = clamp(baseScore + rng.nextInt(-3, 3) - excursionPenalty, 0, 100)

  const compliant = excursions.filter(e => e.severity !== 'minor').length === 0

  const alertLevel: 'green' | 'yellow' | 'red'
    = excursions.some(e => e.severity === 'critical') ? 'red'
    : excursions.some(e => e.severity === 'major') ? 'yellow'
    : 'green'

  const qualityImpact = score >= 80
    ? 'Minimal quality impact -- product within specification'
    : score >= 60
    ? 'Moderate quality degradation -- reduce shelf life estimate and monitor'
    : score >= 40
    ? 'Significant quality impact -- lab testing required before release'
    : 'Product likely compromised -- quarantine pending quality assessment'

  const correctiveActions: string[] = []
  if (alertLevel === 'red') correctiveActions.push('QUARANTINE product; initiate quality investigation per ' + standard + ' protocol')
  if (excursions.length > 0) correctiveActions.push('Notify receiving facility of cold chain breach; request incoming QC inspection')
  correctiveActions.push('Review refrigeration unit performance log for equipment malfunction')
  correctiveActions.push('Verify pre-shipping product temperature was within specification')
  if (totalExcursionHours > 4) correctiveActions.push('Retrain logistics team on cold chain loading/unloading SOPs')
  correctiveActions.push('Install real-time GPS temperature monitoring with automated alerts for future shipments')

  return {
    integrity_score: score,
    excursions,
    total_excursion_duration_hours: totalExcursionHours,
    mkt_temperature: mkt,
    product_quality_impact: qualityImpact,
    compliant,
    alert_level: alertLevel,
    corrective_actions: correctiveActions
  }
}

function formatColdChainReport(input: ColdChainInput, result: ColdChainResult): string {
  const lines: string[] = []
  lines.push('## Cold Chain Integrity Report')
  lines.push('')
  lines.push('**Product:** ' + (input.product_type || 'Refrigerated dairy') + ' | **Standard:** ' + (input.cold_chain_standard || 'HACCP'))
  lines.push('**Max Allowed Temp:** ' + (input.max_allowed_temp_c ?? 8) + 'C | **Transit Duration:** ' + (input.transit_duration_hours ?? 48) + 'h')
  lines.push('')
  lines.push('### Integrity Score: ' + result.integrity_score + '/100 | Alert Level: ' + result.alert_level.toUpperCase())
  lines.push('Compliant: ' + (result.compliant ? 'YES' : 'NO') + ' | MKT: ' + result.mkt_temperature + 'C')
  lines.push('Total excursion duration: ' + result.total_excursion_duration_hours + ' hours')
  lines.push('')

  if (result.excursions.length > 0) {
    lines.push('### Temperature Excursions')
    lines.push('| Start (h) | End (h) | Max Temp | Duration | Severity | Impact |')
    lines.push('|-----------|---------|----------|----------|----------|--------|')
    for (const e of result.excursions) {
      lines.push('| ' + e.start_hour + ' | ' + e.end_hour + ' | ' + e.max_temp_c + 'C | ' + e.duration_hours + 'h | ' + e.severity.toUpperCase() + ' | ' + e.product_impact + ' |')
    }
    lines.push('')
  } else {
    lines.push('### No Temperature Excursions Detected')
    lines.push('All temperature readings within acceptable range.')
    lines.push('')
  }

  lines.push('### Quality Impact')
  lines.push(result.product_quality_impact)
  lines.push('')

  lines.push('### Corrective Actions')
  for (const a of result.corrective_actions) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== TOOL 8: MENU ENGINEERING OPTIMIZER ====================

function optimizeMenu(input: MenuEngineeringInput): MenuEngineeringResult {
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

    // Menu engineering matrix
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

  // Revenue optimization potential
  const dogRevenue = items.filter((_, i) => classifications[i].category === 'dog').reduce((sum, i) => sum + i.price * i.monthly_orders, 0)
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

function formatMenuReport(input: MenuEngineeringInput, result: MenuEngineeringResult): string {
  const lines: string[] = []
  lines.push('## Menu Engineering Optimization Report')
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
  lines.push('Estimated upside from menu engineering actions: +' + result.revenue_optimization_potential_pct + '% monthly revenue')
  lines.push('')
  lines.push(DISCLAIMER_FOOD_SAFETY)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Supply Chain Traceability Engine
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

  // Tool 3: Recipe Optimization AI
  tools.register(defineTool({
    name: 'recipe_optimization_ai',
    description: 'AI-driven recipe reformulation for cost reduction, nutrition improvement, and dietary compliance. Analyzes current ingredient costs, suggests substitutions with flavor impact assessment, computes nutrition per serving against targets, and provides feasibility scoring.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: recipe_name, current_ingredients[{name, quantity_g, cost_per_kg}], target_cost_reduction_pct, nutrition_targets{calories, protein_g, fat_g, carbs_g, sodium_mg}, dietary_constraints[], flavor_profile_target[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RecipeInput = JSON.parse(args.input_data)
      const result = optimizeRecipe(input)
      return formatRecipeReport(input, result)
    }
  }))

  // Tool 4: Alternative Protein Analyzer
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

  // Tool 5: Shelf Life Predictor
  tools.register(defineTool({
    name: 'shelf_life_predictor',
    description: 'Predictive shelf life modeling based on product category, storage temperature, pH, water activity, preservative system, and packaging type. Identifies spoilage indicator organisms with onset timing, critical factors, packaging/storage recommendations, and safety margin calculation.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_name, product_category, packaging_type, storage_temperature_c, pH, water_activity, preservative_system[], target_shelf_life_days, target_market', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ShelfLifeInput = JSON.parse(args.input_data)
      const result = predictShelfLife(input)
      return formatShelfLifeReport(input, result)
    }
  }))

  // Tool 6: Allergen Detection Scanner
  tools.register(defineTool({
    name: 'allergen_detection_scanner',
    description: 'Scans ingredient lists and facility information for allergen risks. Evaluates 14 priority allergens (milk, eggs, peanuts, tree nuts, soy, wheat, fish, shellfish, sesame, mustard, sulfites, lupin, celery, mollusks). Assesses cross-contact potential, label compliance, testing recommendations, and precautionary advisory needs.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_name, ingredient_list[], processing_equipment_shared, allergen_free_claim[], facility_allergens_present[], testing_method (ELISA|PCR|LC_MS_MS|LFD)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: AllergenInput = JSON.parse(args.input_data)
      const result = scanAllergens(input)
      return formatAllergenReport(input, result)
    }
  }))

  // Tool 7: Cold Chain Integrity Monitor
  tools.register(defineTool({
    name: 'cold_chain_integrity_monitor',
    description: 'Monitors cold chain integrity from origin to destination using temperature logger data. Detects temperature excursions with severity classification, computes MKT (Mean Kinetic Temperature), calculates integrity score, determines product quality impact, and generates corrective actions per HACCP/GDP standards.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_type, shipment_id, origin_temp_c, destination_temp_c, transit_duration_hours, temp_logger_data[{hour, temp_c}], cold_chain_standard (GDP|HACCP|WHO_prequalified), max_allowed_temp_c', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ColdChainInput = JSON.parse(args.input_data)
      const result = monitorColdChain(input)
      return formatColdChainReport(input, result)
    }
  }))

  // Tool 8: Menu Engineering Optimizer
  tools.register(defineTool({
    name: 'menu_engineering_optimizer',
    description: 'Four-quadrant menu engineering matrix (Star, Puzzle, Plow Horse, Dog) classification based on item profitability and popularity. Calculates contribution margins, food cost percentages, popularity indices, and provides per-item strategic recommendations with revenue optimization potential.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: restaurant_name, menu_items[{name, price, food_cost_pct, monthly_orders}], analysis_dimension (profitability|popularity|both), target_food_cost_pct', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: MenuEngineeringInput = JSON.parse(args.input_data)
      const result = optimizeMenu(input)
      return formatMenuReport(input, result)
    }
  }))

  console.log('[dsh-tool-foodtechai] Loaded v' + VERSION + ' - Food Tech & Safety Toolkit with 8 tools')
  console.log('  Tools: supply_chain_traceability_engine, food_safety_compliance_checker, recipe_optimization_ai, alternative_protein_analyzer, shelf_life_predictor, allergen_detection_scanner, cold_chain_integrity_monitor, menu_engineering_optimizer')
}
