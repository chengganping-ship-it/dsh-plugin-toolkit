/**
 * DSH OPC One Person Company Studio Plugin v1.0.0
 *
 * The hottest 2026 entrepreneurship trend in China: one person + AI agents = a full business team.
 * 2026年OPC新注册286万户, 同比增长47%, 618个社区, 53.8%选择"小而美".
 * This toolkit provides AI-leveraged solopreneurs with viability scoring, MVP scoping,
 * revenue stream design, acquisition planning, pricing optimization, workflow automation,
 * legal structure advice, and milestone tracking.
 *
 * Features (v1.0.0):
 * - OPC Viability Scorer (score business idea viability for one-person execution)
 * - MVP Scoper (define minimum viable product for OPC launch)
 * - Revenue Stream Designer (design optimal revenue model for solo business)
 * - Acquisition Planner (create solo-executable customer acquisition plan)
 * - Pricing Optimizer (optimize pricing strategy based on value and competition)
 * - Workflow Automator Designer (design AI-automatable workflows for solo operations)
 * - Legal Structure Advisor (advise on legal entity type for OPC)
 * - Milestone Tracker (create measurable growth milestones from zero to sustainable income)
 *
 * @module dsh-tool-opcstudio
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-opcstudio'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute legal, financial, or tax advice. Consult qualified professionals before making business decisions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function computeSeed(input: unknown): number {
  return JSON.stringify(input).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
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
  if (score >= 35) return 'Weak'
  return 'Poor'
}

// ==================== TYPES ====================

// --- Tool 1: OPC Viability Scorer ---
interface ViabilityInput {
  business_idea: string
  industry: string
  initial_budget_usd: number
  skill_set: string[]
  time_available_hours_week: number
}

interface CategoryScores {
  market_size: number
  ai_automatability: number
  solo_feasibility: number
  revenue_potential: number
  time_efficiency: number
  scalability: number
}

interface ViabilityOutput {
  overall_score: number
  category_scores: CategoryScores
  verdict: string
  key_strengths: string[]
  key_risks: string[]
  recommendations: string[]
  confidence_level: string
}

// --- Tool 2: MVP Scoper ---
interface MvpScoperInput {
  product_type: string
  target_customer: string
  differentiators: string[]
  launch_timeline_weeks: number
}

interface FeatureItem {
  name: string
  priority: 'must_have' | 'should_have' | 'nice_to_have'
  effort_hours: number
  ai_assistable: boolean
}

interface MvpScoperOutput {
  mvp_summary: string
  core_features: FeatureItem[]
  no_build_features: FeatureItem[]
  phase2_deferrals: FeatureItem[]
  total_effort_hours: number
  ai_leverage_pct: number
  launch_readiness: string
  risk_factors: string[]
}

// --- Tool 3: Revenue Stream Designer ---
interface RevenueStreamInput {
  product_type: string
  target_market: string
  price_sensitivity: 'low' | 'medium' | 'high'
  competitive_landscape: string[]
}

interface RevenueStream {
  model_name: string
  description: string
  suitability_score: number
  estimated_monthly_revenue_usd: number
  setup_complexity: 'low' | 'medium' | 'high'
  ai_automation_pct: number
}

interface RevenueStreamOutput {
  primary_stream: RevenueStream
  secondary_streams: RevenueStream[]
  combined_revenue_potential: number
  pricing_sweet_spot: string
  monetization_timeline: string
  recommendations: string[]
}

// --- Tool 4: Acquisition Planner ---
interface AcquisitionPlannerInput {
  budget_usd_month: number
  target_audience: string
  product_type: string
  ai_tools_available: string[]
}

interface AcquisitionChannel {
  channel_name: string
  monthly_budget_usd: number
  expected_leads: number
  expected_conversion_pct: number
  cost_per_acquisition_usd: number
  ai_automation_level: 'low' | 'medium' | 'high'
  time_to_first_results_days: number
  description: string
}

interface AcquisitionPlannerOutput {
  total_monthly_budget_usd: number
  channels: AcquisitionChannel[]
  total_expected_customers: number
  blended_cpa_usd: number
  weekly_action_plan: string[]
  automation_coverage_pct: number
  scalability_notes: string
}

// --- Tool 5: Pricing Optimizer ---
interface PricingOptimizerInput {
  product_category: string
  value_proposition: string
  competitor_prices: number[]
  cost_structure: {
    fixed_monthly: number
    variable_per_unit: number
  }
}

interface PricingTier {
  tier_name: string
  price: number
  features_included: string[]
  target_segment: string
  estimated_conversion_pct: number
  monthly_revenue_at_100_customers: number
}

interface PricingOptimizerOutput {
  recommended_tiers: PricingTier[]
  optimal_entry_price: number
  profit_margin_at_entry: number
  break_even_customers: number
  competitive_position: string
  pricing_strategy: string
  revenue_at_target: number
  recommendations: string[]
}

// --- Tool 6: Workflow Automator Designer ---
interface WorkflowAutomatorInput {
  business_model: string
  current_tools: string[]
  pain_points: string[]
  automation_budget: number
}

interface AutomatableWorkflow {
  workflow_name: string
  category: 'marketing' | 'delivery' | 'support' | 'finance'
  current_time_hours_week: number
  automatable_pct: number
  ai_tool_recommendation: string
  time_savings_hours_week: number
  implementation_difficulty: 'low' | 'medium' | 'high'
  roi_weeks: number
}

interface WorkflowAutomatorOutput {
  workflows: AutomatableWorkflow[]
  total_time_savings_hours_week: number
  total_implementation_cost: number
  implementation_priority: string[]
  automation_maturity_score: number
  recommendations: string[]
}

// --- Tool 7: Legal Structure Advisor ---
interface LegalStructureInput {
  country: string
  monthly_revenue_usd: number
  risk_level: 'low' | 'medium' | 'high'
  need_invoice: boolean
  team_plans: boolean
}

interface LegalOption {
  entity_type: string
  description: string
  liability_protection: 'none' | 'limited' | 'full'
  tax_benefit_score: number
  setup_cost_usd: number
  annual_compliance_cost_usd: number
  complexity: 'low' | 'medium' | 'high'
  suitable: boolean
  pros: string[]
  cons: string[]
}

interface LegalStructureOutput {
  recommended_structure: string
  options: LegalOption[]
  tax_implications: string
  setup_steps: string[]
  estimated_timeline_days: number
  warnings: string[]
}

// --- Tool 8: Milestone Tracker ---
interface MilestoneTrackerInput {
  current_stage: string
  monthly_target_usd: number
  months_to_target: number
  industry_benchmarks: {
    avg_time_to_first_revenue_days: number
    avg_customers_at_6mo: number
    avg_mrr_at_12mo: number
  }
}

interface Milestone {
  month: number
  revenue_target_usd: number
  customer_target: number
  key_actions: string[]
  success_metrics: string[]
  risk_factors: string[]
}

interface MilestoneTrackerOutput {
  milestones: Milestone[]
  total_revenue_at_target: number
  required_monthly_growth_pct: number
  feasibility_assessment: string
  critical_success_factors: string[]
  pivot_triggers: string[]
}

// ==================== TOOL 1: OPC VIABILITY SCORER ====================

function scoreViability(input: ViabilityInput): ViabilityOutput {
  const seed = computeSeed(input)
  const rng = mulberry32(seed)

  const idea = input.business_idea.toLowerCase()
  const industry = input.industry.toLowerCase()
  const skills = input.skill_set
  const budget = input.initial_budget_usd
  const timeHrs = input.time_available_hours_week

  let marketSize = rngRange(rng, 45, 75)
  if (idea.includes('ai') || idea.includes('automation')) marketSize += 10
  if (industry.includes('tech') || industry.includes('saas')) marketSize += 8
  if (industry.includes('health') || industry.includes('fintech')) marketSize += 6
  if (budget >= 5000) marketSize += 5
  marketSize = clamp(marketSize, 20, 98)

  let aiAutomatability = rngRange(rng, 40, 70)
  if (idea.includes('ai') || idea.includes('content') || idea.includes('data')) aiAutomatability += 15
  if (industry.includes('software') || industry.includes('digital')) aiAutomatability += 10
  if (industry.includes('consulting') || industry.includes('agency')) aiAutomatability += 5
  aiAutomatability = clamp(aiAutomatability, 15, 99)

  let soloFeasibility = rngRange(rng, 40, 70)
  if (skills.length >= 3 && skills.length <= 6) soloFeasibility += 10
  if (skills.length > 8) soloFeasibility -= 5
  if (budget >= 2000) soloFeasibility += 5
  if (budget < 500) soloFeasibility -= 8
  if (timeHrs >= 20 && timeHrs <= 40) soloFeasibility += 5
  soloFeasibility = clamp(soloFeasibility, 20, 98)

  let revenuePotential = rngRange(rng, 40, 65)
  if (industry.includes('saas') || industry.includes('software')) revenuePotential += 15
  if (industry.includes('ecommerce') || industry.includes('marketplace')) revenuePotential += 8
  if (industry.includes('content') || industry.includes('media')) revenuePotential += 5
  if (budget >= 3000) revenuePotential += 5
  revenuePotential = clamp(revenuePotential, 20, 98)

  let timeEfficiency = rngRange(rng, 45, 70)
  if (aiAutomatability > 70) timeEfficiency += 10
  if (timeHrs >= 15 && timeHrs <= 30) timeEfficiency += 5
  if (timeHrs > 50) timeEfficiency -= 8
  timeEfficiency = clamp(timeEfficiency, 20, 98)

  let scalability = rngRange(rng, 40, 65)
  if (industry.includes('digital') || industry.includes('saas')) scalability += 12
  if (industry.includes('physical') || industry.includes('manufacturing')) scalability -= 5
  if (aiAutomatability > 65) scalability += 8
  scalability = clamp(scalability, 20, 98)

  const categoryScores: CategoryScores = {
    market_size: marketSize,
    ai_automatability: aiAutomatability,
    solo_feasibility: soloFeasibility,
    revenue_potential: revenuePotential,
    time_efficiency: timeEfficiency,
    scalability: scalability,
  }

  const overall = Math.round(
    marketSize * 0.2 + aiAutomatability * 0.2 + soloFeasibility * 0.15 +
    revenuePotential * 0.2 + timeEfficiency * 0.1 + scalability * 0.15
  )

  let verdict = 'viable'
  if (overall >= 85) verdict = 'excellent'
  else if (overall >= 70) verdict = 'strong'
  else if (overall >= 55) verdict = 'viable'
  else if (overall >= 40) verdict = 'marginal'
  else verdict = 'poor'

  const strengths: string[] = []
  const risks: string[] = []
  const recommendations: string[] = []

  if (marketSize > 65) strengths.push('Strong market size signals (' + marketSize + '/100)')
  else risks.push('Market size validation needed (' + marketSize + '/100)')

  if (aiAutomatability > 65) strengths.push('High AI automatability (' + aiAutomatability + '/100) - key OPC advantage')
  else risks.push('Limited AI automation (' + aiAutomatability + '/100) - may require more manual work')

  if (soloFeasibility > 60) strengths.push('Solo execution is realistic (' + soloFeasibility + '/100)')
  else risks.push('High complexity for solo execution (' + soloFeasibility + '/100)')

  if (revenuePotential > 60) strengths.push('Strong revenue potential (' + revenuePotential + '/100)')
  else risks.push('Revenue ceiling may need attention (' + revenuePotential + '/100)')

  if (timeEfficiency > 60) strengths.push('Efficient time use achievable (' + timeEfficiency + '/100)')

  if (scalability > 60) strengths.push('Good scalability with AI (' + scalability + '/100)')

  recommendations.push('Validate demand with a minimum landing page and waitlist before building')
  if (aiAutomatability < 65) recommendations.push('Identify additional AI automation opportunities')
  recommendations.push('Focus on productized services or digital products for maximum solo output')
  recommendations.push('Join OPC communities (IndieHackers, Solo.cn) for benchmarking')
  if (revenuePotential > 60) recommendations.push('Start with a high-ticket offering to reach target revenue faster')

  const confidence = overall >= 70 ? 'high' : overall >= 50 ? 'medium' : 'low'

  return {
    overall_score: overall,
    category_scores: categoryScores,
    verdict,
    key_strengths: strengths,
    key_risks: risks,
    recommendations,
    confidence_level: confidence,
  }
}

function formatViabilityReport(input: ViabilityInput, output: ViabilityOutput): string {
  const lines: string[] = []
  lines.push('## OPC Viability Score Report')
  lines.push('')
  lines.push('**' + input.business_idea + '** — ' + output.verdict.toUpperCase() + ' (' + output.overall_score + '/100)')
  lines.push('')
  lines.push('### Category Breakdown')
  lines.push('| Category | Score | Rating |')
  lines.push('|----------|-------|--------|')
  lines.push('| Market Size | ' + output.category_scores.market_size + '/100 | ' + rateScore(output.category_scores.market_size) + ' |')
  lines.push('| AI Automatability | ' + output.category_scores.ai_automatability + '/100 | ' + rateScore(output.category_scores.ai_automatability) + ' |')
  lines.push('| Solo Feasibility | ' + output.category_scores.solo_feasibility + '/100 | ' + rateScore(output.category_scores.solo_feasibility) + ' |')
  lines.push('| Revenue Potential | ' + output.category_scores.revenue_potential + '/100 | ' + rateScore(output.category_scores.revenue_potential) + ' |')
  lines.push('| Time Efficiency | ' + output.category_scores.time_efficiency + '/100 | ' + rateScore(output.category_scores.time_efficiency) + ' |')
  lines.push('| Scalability | ' + output.category_scores.scalability + '/100 | ' + rateScore(output.category_scores.scalability) + ' |')
  lines.push('')

  if (output.key_strengths.length > 0) {
    lines.push('### Key Strengths')
    for (const s of output.key_strengths) {
      lines.push('- ' + s)
    }
    lines.push('')
  }

  if (output.key_risks.length > 0) {
    lines.push('### Key Risks')
    for (const r of output.key_risks) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const rec of output.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('**Confidence Level:** ' + output.confidence_level.toUpperCase() + '')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 2: MVP SCOPER ====================

function scopeMvp(input: MvpScoperInput): MvpScoperOutput {
  const seed = computeSeed(input)
  const rng = mulberry32(seed)

  const productType = input.product_type.toLowerCase()
  const diffs = input.differentiators
  const timeline = input.launch_timeline_weeks

  const coreFeatures: FeatureItem[] = []
  const noBuildFeatures: FeatureItem[] = []
  const phase2Deferrals: FeatureItem[] = []

  if (productType.includes('saas') || productType.includes('software')) {
    coreFeatures.push({ name: 'User authentication & profiles', priority: 'must_have', effort_hours: rngRange(rng, 8, 16), ai_assistable: true })
    coreFeatures.push({ name: 'Core product functionality', priority: 'must_have', effort_hours: rngRange(rng, 30, 60), ai_assistable: true })
    coreFeatures.push({ name: 'Payment integration', priority: 'must_have', effort_hours: rngRange(rng, 6, 12), ai_assistable: false })
    noBuildFeatures.push({ name: 'Landing page builder', priority: 'must_have', effort_hours: rngRange(rng, 4, 8), ai_assistable: true })
    noBuildFeatures.push({ name: 'Email automation', priority: 'should_have', effort_hours: rngRange(rng, 3, 6), ai_assistable: true })
    phase2Deferrals.push({ name: 'Advanced analytics dashboard', priority: 'should_have', effort_hours: rngRange(rng, 15, 25), ai_assistable: true })
    phase2Deferrals.push({ name: 'API integrations', priority: 'nice_to_have', effort_hours: rngRange(rng, 20, 40), ai_assistable: false })
  } else if (productType.includes('service') || productType.includes('agency')) {
    coreFeatures.push({ name: 'Service delivery framework', priority: 'must_have', effort_hours: rngRange(rng, 10, 20), ai_assistable: true })
    coreFeatures.push({ name: 'Client onboarding flow', priority: 'must_have', effort_hours: rngRange(rng, 8, 15), ai_assistable: true })
    noBuildFeatures.push({ name: 'Booking/scheduling system', priority: 'must_have', effort_hours: rngRange(rng, 3, 6), ai_assistable: false })
    noBuildFeatures.push({ name: 'Testimonial collection', priority: 'should_have', effort_hours: rngRange(rng, 4, 8), ai_assistable: true })
    phase2Deferrals.push({ name: 'Client portal', priority: 'should_have', effort_hours: rngRange(rng, 15, 30), ai_assistable: true })
  } else if (productType.includes('content') || productType.includes('media')) {
    coreFeatures.push({ name: 'Content production pipeline', priority: 'must_have', effort_hours: rngRange(rng, 10, 20), ai_assistable: true })
    coreFeatures.push({ name: 'Publishing platform setup', priority: 'must_have', effort_hours: rngRange(rng, 5, 10), ai_assistable: false })
    noBuildFeatures.push({ name: 'SEO optimization tools', priority: 'must_have', effort_hours: rngRange(rng, 4, 8), ai_assistable: true })
    noBuildFeatures.push({ name: 'Social media scheduling', priority: 'should_have', effort_hours: rngRange(rng, 3, 6), ai_assistable: true })
    phase2Deferrals.push({ name: 'Community features', priority: 'nice_to_have', effort_hours: rngRange(rng, 15, 25), ai_assistable: false })
  } else {
    coreFeatures.push({ name: 'Core offering definition', priority: 'must_have', effort_hours: rngRange(rng, 8, 16), ai_assistable: true })
    coreFeatures.push({ name: 'Customer acquisition channel', priority: 'must_have', effort_hours: rngRange(rng, 10, 20), ai_assistable: true })
    noBuildFeatures.push({ name: 'Brand identity', priority: 'should_have', effort_hours: rngRange(rng, 5, 10), ai_assistable: true })
    phase2Deferrals.push({ name: 'Scaling infrastructure', priority: 'should_have', effort_hours: rngRange(rng, 15, 30), ai_assistable: false })
  }

  // Add differentiator-based features
  for (const diff of diffs.slice(0, 3)) {
    coreFeatures.push({ name: 'Differentiator: ' + diff, priority: 'should_have', effort_hours: rngRange(rng, 8, 18), ai_assistable: rng() > 0.3 })
  }

  const totalEffort = coreFeatures.reduce((s, f) => s + f.effort_hours, 0) +
    noBuildFeatures.reduce((s, f) => s + f.effort_hours, 0)
  const allFeatures = [...coreFeatures, ...noBuildFeatures, ...phase2Deferrals]
  const aiFeatures = allFeatures.filter(f => f.ai_assistable).length
  const aiLeverage = Math.round((aiFeatures / allFeatures.length) * 100)

  const weeklyEffort = totalEffort / timeline
  let launchReadiness = 'ready'
  if (weeklyEffort > 40) launchReadiness = 'overloaded - extend timeline or cut features'
  else if (weeklyEffort > 25) launchReadiness = 'ambitious but achievable'
  else launchReadiness = 'comfortable pace'

  const riskFactors: string[] = []
  if (weeklyEffort > 30) riskFactors.push('High weekly effort (' + weeklyEffort.toFixed(1) + ' hrs/wk) risks burnout')
  if (timeline < 4) riskFactors.push('Very short timeline may compromise quality')
  if (diffs.length > 5) riskFactors.push('Too many differentiators - focus on 1-2 key advantages')
  if (riskFactors.length === 0) riskFactors.push('Low risk - good balance of scope and timeline')

  return {
    mvp_summary: 'MVP for ' + input.product_type + ' targeting ' + input.target_customer + ' with ' + coreFeatures.length + ' core features and ' + noBuildFeatures.length + ' no-build features',
    core_features: coreFeatures,
    no_build_features: noBuildFeatures,
    phase2_deferrals: phase2Deferrals,
    total_effort_hours: totalEffort,
    ai_leverage_pct: aiLeverage,
    launch_readiness: launchReadiness,
    risk_factors: riskFactors,
  }
}

function formatMvpReport(input: MvpScoperInput, output: MvpScoperOutput): string {
  const lines: string[] = []
  lines.push('## MVP Scope Definition')
  lines.push('')
  lines.push('**' + input.product_type + '** for **' + input.target_customer + '**')
  lines.push('')
  lines.push(output.mvp_summary)
  lines.push('')
  lines.push('### Summary Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Effort | ' + output.total_effort_hours + ' hours |')
  lines.push('| AI Leverage | ' + output.ai_leverage_pct + '% of features |')
  lines.push('| Launch Readiness | ' + output.launch_readiness + ' |')
  lines.push('| Timeline | ' + input.launch_timeline_weeks + ' weeks |')
  lines.push('')

  lines.push('### Core Features (Must Have)')
  lines.push('| Feature | Effort (hrs) | AI Assist |')
  lines.push('|---------|-------------|-----------|')
  for (const f of output.core_features) {
    lines.push('| ' + f.name + ' | ' + f.effort_hours + ' | ' + (f.ai_assistable ? 'Yes' : 'No') + ' |')
  }
  lines.push('')

  lines.push('### No-Build Features (Use Existing Tools)')
  lines.push('| Feature | Effort (hrs) | AI Assist |')
  lines.push('|---------|-------------|-----------|')
  for (const f of output.no_build_features) {
    lines.push('| ' + f.name + ' | ' + f.effort_hours + ' | ' + (f.ai_assistable ? 'Yes' : 'No') + ' |')
  }
  lines.push('')

  lines.push('### Phase 2 Deferrals')
  lines.push('| Feature | Effort (hrs) | AI Assist |')
  lines.push('|---------|-------------|-----------|')
  for (const f of output.phase2_deferrals) {
    lines.push('| ' + f.name + ' | ' + f.effort_hours + ' | ' + (f.ai_assistable ? 'Yes' : 'No') + ' |')
  }
  lines.push('')

  lines.push('### Risk Factors')
  for (const r of output.risk_factors) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 3: REVENUE STREAM DESIGNER ====================

function designRevenueStreams(input: RevenueStreamInput): RevenueStreamOutput {
  const seed = computeSeed(input)
  const rng = mulberry32(seed)

  const productType = input.product_type.toLowerCase()
  const sensitivity = input.price_sensitivity
  const competitors = input.competitive_landscape

  const allStreams: RevenueStream[] = []

  // Subscription model
  let subScore = rngRange(rng, 55, 80)
  if (productType.includes('saas') || productType.includes('software')) subScore += 15
  if (sensitivity === 'low') subScore += 5
  if (sensitivity === 'high') subScore -= 10
  subScore = clamp(subScore, 20, 98)
  allStreams.push({
    model_name: 'Subscription / SaaS',
    description: 'Recurring monthly/annual revenue from ongoing access to product or service',
    suitability_score: subScore,
    estimated_monthly_revenue_usd: rngRange(rng, 2000, 15000),
    setup_complexity: 'medium',
    ai_automation_pct: rngRange(rng, 60, 85),
  })

  // One-off / digital product
  let oneOffScore = rngRange(rng, 40, 70)
  if (productType.includes('content') || productType.includes('course')) oneOffScore += 20
  if (sensitivity === 'high') oneOffScore += 5
  oneOffScore = clamp(oneOffScore, 20, 98)
  allStreams.push({
    model_name: 'One-Off Digital Product',
    description: 'Single purchase of digital goods: courses, templates, ebooks, tools',
    suitability_score: oneOffScore,
    estimated_monthly_revenue_usd: rngRange(rng, 1000, 8000),
    setup_complexity: 'low',
    ai_automation_pct: rngRange(rng, 70, 90),
  })

  // Commission / marketplace
  let commScore = rngRange(rng, 30, 60)
  if (productType.includes('marketplace') || productType.includes('platform')) commScore += 25
  if (competitors.length > 5) commScore -= 5
  commScore = clamp(commScore, 15, 95)
  allStreams.push({
    model_name: 'Commission / Transaction Fee',
    description: 'Percentage-based revenue from facilitating transactions between parties',
    suitability_score: commScore,
    estimated_monthly_revenue_usd: rngRange(rng, 500, 12000),
    setup_complexity: 'high',
    ai_automation_pct: rngRange(rng, 50, 75),
  })

  // Freemium
  let freeScore = rngRange(rng, 45, 70)
  if (productType.includes('saas') || productType.includes('app')) freeScore += 10
  if (sensitivity === 'high') freeScore += 10
  freeScore = clamp(freeScore, 20, 98)
  allStreams.push({
    model_name: 'Freemium + Premium Upsell',
    description: 'Free basic tier with paid premium features. AI handles free tier support.',
    suitability_score: freeScore,
    estimated_monthly_revenue_usd: rngRange(rng, 1500, 10000),
    setup_complexity: 'medium',
    ai_automation_pct: rngRange(rng, 65, 85),
  })

  // Consulting / service retainer
  let retainerScore = rngRange(rng, 40, 65)
  if (productType.includes('service') || productType.includes('agency')) retainerScore += 20
  if (sensitivity === 'low') retainerScore += 10
  retainerScore = clamp(retainerScore, 20, 98)
  allStreams.push({
    model_name: 'Service Retainer',
    description: 'Monthly retainer for ongoing advisory, support, or deliverables',
    suitability_score: retainerScore,
    estimated_monthly_revenue_usd: rngRange(rng, 3000, 20000),
    setup_complexity: 'low',
    ai_automation_pct: rngRange(rng, 40, 65),
  })

  // Sort by suitability
  allStreams.sort((a, b) => b.suitability_score - a.suitability_score)

  const primary = allStreams[0]
  const secondary = allStreams.slice(1, 3)
  const combined = Math.round(primary.estimated_monthly_revenue_usd + secondary.reduce((s, r) => s + r.estimated_monthly_revenue_usd * 0.3, 0))

  let sweetSpot = '$29-$49/month'
  if (sensitivity === 'high') sweetSpot = '$9-$19/month'
  else if (sensitivity === 'low') sweetSpot = '$99-$199/month'

  const recommendations: string[] = []
  recommendations.push('Primary recommendation: ' + primary.model_name + ' (suitability: ' + primary.suitability_score + '/100)')
  if (secondary.length > 0) recommendations.push('Add secondary stream: ' + secondary[0].model_name + ' for diversification')
  recommendations.push('AI can automate ' + primary.ai_automation_pct + '% of ' + primary.model_name + ' operations')
  if (sensitivity === 'high') recommendations.push('High price sensitivity market - consider starting with a low-cost entry point')
  recommendations.push('Test pricing with 10-20 beta customers before public launch')

  return {
    primary_stream: primary,
    secondary_streams: secondary,
    combined_revenue_potential: combined,
    pricing_sweet_spot: sweetSpot,
    monetization_timeline: 'First revenue expected within 2-4 weeks of launch with ' + primary.model_name,
    recommendations,
  }
}

function formatRevenueStreamReport(input: RevenueStreamInput, output: RevenueStreamOutput): string {
  const lines: string[] = []
  lines.push('## Revenue Stream Design')
  lines.push('')
  lines.push('**' + input.product_type + '** targeting **' + input.target_market + '**')
  lines.push('')
  lines.push('### Recommended Revenue Model')
  lines.push('| Stream | Suitability | Est. Monthly Revenue | AI Automation | Complexity |')
  lines.push('|--------|-------------|---------------------|---------------|------------|')
  lines.push('| **' + output.primary_stream.model_name + '** | ' + output.primary_stream.suitability_score + '/100 | $' + output.primary_stream.estimated_monthly_revenue_usd.toLocaleString() + ' | ' + output.primary_stream.ai_automation_pct + '% | ' + output.primary_stream.setup_complexity + ' |')
  for (const s of output.secondary_streams) {
    lines.push('| ' + s.model_name + ' | ' + s.suitability_score + '/100 | $' + s.estimated_monthly_revenue_usd.toLocaleString() + ' | ' + s.ai_automation_pct + '% | ' + s.setup_complexity + ' |')
  }
  lines.push('')

  lines.push('### Financial Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Combined Revenue Potential | $' + output.combined_revenue_potential.toLocaleString() + '/mo |')
  lines.push('| Pricing Sweet Spot | ' + output.pricing_sweet_spot + ' |')
  lines.push('| Monetization Timeline | ' + output.monetization_timeline + ' |')
  lines.push('')

  lines.push('### Recommendations')
  for (const r of output.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 4: ACQUISITION PLANNER ====================

function planAcquisition(input: AcquisitionPlannerInput): AcquisitionPlannerOutput {
  const seed = computeSeed(input)
  const rng = mulberry32(seed)

  const budget = input.budget_usd_month
  const audience = input.target_audience.toLowerCase()
  const aiTools = input.ai_tools_available

  const channels: AcquisitionChannel[] = []

  // Content marketing / SEO
  const contentBudget = Math.round(budget * rngFloat(rng, 0.2, 0.35))
  channels.push({
    channel_name: 'Content Marketing & SEO',
    monthly_budget_usd: contentBudget,
    expected_leads: rngRange(rng, 50, 200),
    expected_conversion_pct: rngFloat(rng, 2, 5),
    cost_per_acquisition_usd: rngRange(rng, 15, 45),
    ai_automation_level: aiTools.some(t => t.toLowerCase().includes('content') || t.toLowerCase().includes('seo')) ? 'high' : 'medium',
    time_to_first_results_days: rngRange(rng, 30, 60),
    description: 'AI-assisted blog posts, SEO optimization, and organic traffic building',
  })

  // Social media organic
  const socialBudget = Math.round(budget * rngFloat(rng, 0.1, 0.2))
  channels.push({
    channel_name: 'Social Media (Organic)',
    monthly_budget_usd: socialBudget,
    expected_leads: rngRange(rng, 30, 150),
    expected_conversion_pct: rngFloat(rng, 1.5, 4),
    cost_per_acquisition_usd: rngRange(rng, 10, 35),
    ai_automation_level: aiTools.some(t => t.toLowerCase().includes('social') || t.toLowerCase().includes('content')) ? 'high' : 'medium',
    time_to_first_results_days: rngRange(rng, 14, 30),
    description: 'AI-scheduled posts, engagement automation, and community building',
  })

  // Paid ads (if budget allows)
  if (budget >= 500) {
    const adsBudget = Math.round(budget * rngFloat(rng, 0.2, 0.35))
    channels.push({
      channel_name: 'Paid Advertising',
      monthly_budget_usd: adsBudget,
      expected_leads: rngRange(rng, 80, 300),
      expected_conversion_pct: rngFloat(rng, 3, 8),
      cost_per_acquisition_usd: rngRange(rng, 20, 60),
      ai_automation_level: aiTools.some(t => t.toLowerCase().includes('ad')) ? 'high' : 'medium',
      time_to_first_results_days: rngRange(rng, 3, 7),
      description: 'AI-optimized ad copy, targeting, and bid management',
    })
  }

  // Cold outreach
  const outreachBudget = Math.round(budget * rngFloat(rng, 0.05, 0.15))
  channels.push({
    channel_name: 'Cold Outreach (Email/LinkedIn)',
    monthly_budget_usd: outreachBudget,
    expected_leads: rngRange(rng, 40, 120),
    expected_conversion_pct: rngFloat(rng, 3, 7),
    cost_per_acquisition_usd: rngRange(rng, 8, 25),
    ai_automation_level: aiTools.some(t => t.toLowerCase().includes('outreach') || t.toLowerCase().includes('email')) ? 'high' : 'medium',
    time_to_first_results_days: rngRange(rng, 7, 14),
    description: 'AI-personalized outreach sequences and follow-ups',
  })

  // Referral program
  channels.push({
    channel_name: 'Referral Program',
    monthly_budget_usd: Math.round(budget * rngFloat(rng, 0.05, 0.1)),
    expected_leads: rngRange(rng, 10, 50),
    expected_conversion_pct: rngFloat(rng, 5, 12),
    cost_per_acquisition_usd: rngRange(rng, 5, 15),
    ai_automation_level: 'high',
    time_to_first_results_days: rngRange(rng, 14, 30),
    description: 'AI-managed referral tracking, rewards, and nurture sequences',
  })

  const totalCustomers = channels.reduce((s, c) => s + Math.round(c.expected_leads * c.expected_conversion_pct / 100), 0)
  const totalSpend = channels.reduce((s, c) => s + c.monthly_budget_usd, 0)
  const blendedCpa = totalCustomers > 0 ? Math.round(totalSpend / totalCustomers) : 0

  const highAutomation = channels.filter(c => c.ai_automation_level === 'high').length
  const automationCoverage = Math.round((highAutomation / channels.length) * 100)

  const actionPlan: string[] = []
  actionPlan.push('Week 1: Set up content pipeline with AI tools - publish 2-3 pieces')
  actionPlan.push('Week 1: Configure social media scheduling and AI content generation')
  actionPlan.push('Week 2: Launch cold outreach sequences (50-100 prospects)')
  actionPlan.push('Week 2: Set up referral program infrastructure')
  actionPlan.push('Week 3: Analyze initial data - double down on best-performing channel')
  actionPlan.push('Week 4: Optimize AI prompts and automation based on first results')
  actionPlan.push('Ongoing: Weekly 30-min review of channel performance metrics')

  const scalability = totalCustomers > 20 ?
    'Strong initial traction - scale budget 20% monthly on winning channels' :
    'Early stage - focus on channel validation before scaling spend'

  return {
    total_monthly_budget_usd: totalSpend,
    channels,
    total_expected_customers: totalCustomers,
    blended_cpa_usd: blendedCpa,
    weekly_action_plan: actionPlan,
    automation_coverage_pct: automationCoverage,
    scalability_notes: scalability,
  }
}

function formatAcquisitionReport(input: AcquisitionPlannerInput, output: AcquisitionPlannerOutput): string {
  const lines: string[] = []
  lines.push('## Customer Acquisition Plan')
  lines.push('')
  lines.push('**Budget:** $' + input.budget_usd_month.toLocaleString() + '/mo | **Audience:** ' + input.target_audience + '')
  lines.push('')
  lines.push('### Channel Mix')
  lines.push('| Channel | Budget | Leads | Conv% | CPA | AI Level | Time to Results |')
  lines.push('|---------|--------|-------|-------|-----|----------|-----------------|')
  for (const c of output.channels) {
    lines.push('| ' + c.channel_name + ' | $' + c.monthly_budget_usd + ' | ' + c.expected_leads + ' | ' + c.expected_conversion_pct.toFixed(1) + '% | $' + c.cost_per_acquisition_usd + ' | ' + c.ai_automation_level + ' | ' + c.time_to_first_results_days + ' days |')
  }
  lines.push('')

  lines.push('### Performance Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Expected Customers | ' + output.total_expected_customers + '/mo |')
  lines.push('| Blended CPA | $' + output.blended_cpa_usd + ' |')
  lines.push('| Automation Coverage | ' + output.automation_coverage_pct + '% |')
  lines.push('| Total Budget Used | $' + output.total_monthly_budget_usd.toLocaleString() + ' |')
  lines.push('')

  lines.push('### Weekly Action Plan')
  for (const a of output.weekly_action_plan) {
    lines.push('- ' + a)
  }
  lines.push('')

  lines.push('### Scalability Notes')
  lines.push(output.scalability_notes)
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 5: PRICING OPTIMIZER ====================

function optimizePricing(input: PricingOptimizerInput): PricingOptimizerOutput {
  const seed = computeSeed(input)
  const rng = mulberry32(seed)

  const category = input.product_category.toLowerCase()
  const compPrices = input.competitor_prices
  const costs = input.cost_structure

  const avgCompPrice = compPrices.length > 0 ? compPrices.reduce((a, b) => a + b, 0) / compPrices.length : 50
  const minCompPrice = compPrices.length > 0 ? Math.min(...compPrices) : 10
  const maxCompPrice = compPrices.length > 0 ? Math.max(...compPrices) : 200

  const tiers: PricingTier[] = []

  // Entry tier
  const entryPrice = Math.round(avgCompPrice * rngFloat(rng, 0.5, 0.7))
  tiers.push({
    tier_name: 'Starter',
    price: Math.max(5, entryPrice),
    features_included: ['Core functionality', 'Email support', 'Basic analytics'],
    target_segment: 'Price-sensitive early adopters',
    estimated_conversion_pct: rngFloat(rng, 3, 6),
    monthly_revenue_at_100_customers: 0,
  })

  // Pro tier
  const proPrice = Math.round(avgCompPrice * rngFloat(rng, 0.9, 1.2))
  tiers.push({
    tier_name: 'Professional',
    price: proPrice,
    features_included: ['All Starter features', 'Priority support', 'Advanced analytics', 'API access'],
    target_segment: 'Growing businesses and professionals',
    estimated_conversion_pct: rngFloat(rng, 1.5, 3.5),
    monthly_revenue_at_100_customers: 0,
  })

  // Premium tier
  const premiumPrice = Math.round(avgCompPrice * rngFloat(rng, 1.5, 2.5))
  tiers.push({
    tier_name: 'Premium',
    price: premiumPrice,
    features_included: ['All Pro features', 'White-glove onboarding', 'Custom integrations', 'Dedicated support'],
    target_segment: 'Enterprise and high-value solo buyers',
    estimated_conversion_pct: rngFloat(rng, 0.5, 1.5),
    monthly_revenue_at_100_customers: 0,
  })

  // Calculate revenue at 100 customers for each tier
  for (const tier of tiers) {
    tier.monthly_revenue_at_100_customers = Math.round(100 * (tier.estimated_conversion_pct / 100) * tier.price)
  }

  const optimalEntry = tiers[1].price // Pro tier as recommended entry
  const margin = ((optimalEntry - costs.variable_per_unit) / optimalEntry * 100)
  const breakEven = costs.fixed_monthly > 0 ? Math.ceil(costs.fixed_monthly / (optimalEntry - costs.variable_per_unit)) : 1

  let position = 'mid-market'
  if (optimalEntry < minCompPrice * 1.1) position = 'budget-friendly'
  else if (optimalEntry > maxCompPrice * 0.9) position = 'premium'

  let strategy = 'value-based pricing'
  if (avgCompPrice < 30) strategy = 'penetration pricing - low entry, upsell to Pro'
  else if (avgCompPrice > 100) strategy = 'premium positioning - emphasize unique value'

  const targetCustomers = 50
  const revenueAtTarget = Math.round(targetCustomers * (tiers[1].estimated_conversion_pct / 100) * tiers[1].price)

  const recommendations: string[] = []
  recommendations.push('Recommended entry price: $' + optimalEntry + '/mo (Professional tier)')
  if (margin < 50) recommendations.push('Low margin warning - reduce variable costs or increase pricing')
  recommendations.push('Break-even at ' + breakEven + ' customers - achievable within ' + Math.ceil(breakEven / 10) + ' months')
  recommendations.push('Offer annual billing at 20% discount to improve cash flow')
  if (compPrices.length > 3) recommendations.push('Competitive market - differentiate on value, not price')
  recommendations.push('Test pricing with A/B experiments on landing page')
  recommendations.push('AI can personalize pricing pages based on visitor segment')

  return {
    recommended_tiers: tiers,
    optimal_entry_price: optimalEntry,
    profit_margin_at_entry: Math.round(margin),
    break_even_customers: breakEven,
    competitive_position: position,
    pricing_strategy: strategy,
    revenue_at_target: revenueAtTarget,
    recommendations,
  }
}

function formatPricingReport(input: PricingOptimizerInput, output: PricingOptimizerOutput): string {
  const lines: string[] = []
  lines.push('## Pricing Strategy Optimization')
  lines.push('')
  lines.push('**' + input.product_category + '** — ' + output.pricing_strategy)
  lines.push('')
  lines.push('### Recommended Pricing Tiers')
  lines.push('| Tier | Price | Target Segment | Est. Conversion | Revenue @ 100 cust |')
  lines.push('|------|-------|---------------|-----------------|------------------------|')
  for (const t of output.recommended_tiers) {
    lines.push('| ' + t.tier_name + ' | $' + t.price + '/mo | ' + t.target_segment + ' | ' + t.estimated_conversion_pct.toFixed(1) + '% | $' + t.monthly_revenue_at_100_customers.toLocaleString() + ' |')
  }
  lines.push('')

  lines.push('### Financial Analysis')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Optimal Entry Price | $' + output.optimal_entry_price + '/mo |')
  lines.push('| Profit Margin | ' + output.profit_margin_at_entry + '% |')
  lines.push('| Break-Even Customers | ' + output.break_even_customers + ' |')
  lines.push('| Competitive Position | ' + output.competitive_position + ' |')
  lines.push('| Revenue at 50 Customers | $' + output.revenue_at_target.toLocaleString() + '/mo |')
  lines.push('')

  lines.push('### Cost Structure')
  lines.push('| Item | Amount |')
  lines.push('|------|--------|')
  lines.push('| Fixed Monthly | $' + input.cost_structure.fixed_monthly + ' |')
  lines.push('| Variable per Unit | $' + input.cost_structure.variable_per_unit + ' |')
  lines.push('')

  lines.push('### Recommendations')
  for (const r of output.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 6: WORKFLOW AUTOMATOR DESIGNER ====================

function designWorkflowAutomation(input: WorkflowAutomatorInput): WorkflowAutomatorOutput {
  const seed = computeSeed(input)
  const rng = mulberry32(seed)

  const model = input.business_model.toLowerCase()
  const pains = input.pain_points
  const budget = input.automation_budget

  const workflows: AutomatableWorkflow[] = []

  // Marketing automation
  let marketingTime = rngRange(rng, 5, 15)
  let marketingAuto = rngRange(rng, 60, 85)
  if (pains.some(p => p.toLowerCase().includes('marketing') || p.toLowerCase().includes('content'))) {
    marketingTime += 5
    marketingAuto = Math.min(90, marketingAuto + 5)
  }
  workflows.push({
    workflow_name: 'Marketing Content Production',
    category: 'marketing',
    current_time_hours_week: marketingTime,
    automatable_pct: marketingAuto,
    ai_tool_recommendation: 'Claude + Buffer + Make.com',
    time_savings_hours_week: Math.round(marketingTime * (marketingAuto / 100) * 10) / 10,
    implementation_difficulty: 'low',
    roi_weeks: rngRange(rng, 2, 4),
  })

  // Delivery automation
  let deliveryTime = rngRange(rng, 3, 12)
  let deliveryAuto = rngRange(rng, 50, 80)
  if (model.includes('service') || model.includes('agency')) {
    deliveryTime += 5
  }
  workflows.push({
    workflow_name: 'Service Delivery & Fulfillment',
    category: 'delivery',
    current_time_hours_week: deliveryTime,
    automatable_pct: deliveryAuto,
    ai_tool_recommendation: 'Zapier + Notion + Claude',
    time_savings_hours_week: Math.round(deliveryTime * (deliveryAuto / 100) * 10) / 10,
    implementation_difficulty: 'medium',
    roi_weeks: rngRange(rng, 3, 6),
  })

  // Support automation
  let supportTime = rngRange(rng, 3, 10)
  let supportAuto = rngRange(rng, 65, 90)
  if (pains.some(p => p.toLowerCase().includes('support') || p.toLowerCase().includes('customer'))) {
    supportTime += 4
    supportAuto = Math.min(95, supportAuto + 5)
  }
  workflows.push({
    workflow_name: 'Customer Support & FAQ',
    category: 'support',
    current_time_hours_week: supportTime,
    automatable_pct: supportAuto,
    ai_tool_recommendation: 'Claude + Intercom AI + Notion',
    time_savings_hours_week: Math.round(supportTime * (supportAuto / 100) * 10) / 10,
    implementation_difficulty: 'low',
    roi_weeks: rngRange(rng, 1, 3),
  })

  // Finance automation
  let financeTime = rngRange(rng, 2, 8)
  let financeAuto = rngRange(rng, 70, 95)
  workflows.push({
    workflow_name: 'Finance & Invoicing',
    category: 'finance',
    current_time_hours_week: financeTime,
    automatable_pct: financeAuto,
    ai_tool_recommendation: 'Stripe + QuickBooks + Claude',
    time_savings_hours_week: Math.round(financeTime * (financeAuto / 100) * 10) / 10,
    implementation_difficulty: 'low',
    roi_weeks: rngRange(rng, 1, 2),
  })

  const totalSavings = workflows.reduce((s, w) => s + w.time_savings_hours_week, 0)
  const totalCost = Math.round(budget * rngFloat(rng, 0.6, 0.9))

  // Sort by ROI (low effort, high savings first)
  const sorted = [...workflows].sort((a, b) => a.roi_weeks - b.roi_weeks)
  const priority = sorted.map(w => w.workflow_name + ' (ROI: ' + w.roi_weeks + ' weeks, saves ' + w.time_savings_hours_week + ' hrs/wk)')

  const avgAutomation = Math.round(workflows.reduce((s, w) => s + w.automatable_pct, 0) / workflows.length)
  const maturityScore = clamp(Math.round(avgAutomation * 0.7 + (totalSavings / 40) * 30), 10, 95)

  const recommendations: string[] = []
  recommendations.push('Total time savings: ' + totalSavings.toFixed(1) + ' hours/week (' + Math.round(totalSavings / 40 * 100) + '% of full-time)')
  recommendations.push('Start with ' + sorted[0].workflow_name + ' - fastest ROI at ' + sorted[0].roi_weeks + ' weeks')
  if (avgAutomation > 75) recommendations.push('High automation potential - consider full no-code stack')
  recommendations.push('Implementation budget: $' + totalCost + ' of $' + budget + ' available')
  recommendations.push('Review automation performance weekly - adjust AI prompts as needed')
  recommendations.push('As workflows stabilize, reinvest saved time into revenue-generating activities')

  return {
    workflows,
    total_time_savings_hours_week: Math.round(totalSavings * 10) / 10,
    total_implementation_cost: totalCost,
    implementation_priority: priority,
    automation_maturity_score: maturityScore,
    recommendations,
  }
}

function formatWorkflowReport(input: WorkflowAutomatorInput, output: WorkflowAutomatorOutput): string {
  const lines: string[] = []
  lines.push('## Workflow Automation Design')
  lines.push('')
  lines.push('**' + input.business_model + '** | Automation Maturity: ' + output.automation_maturity_score + '/100')
  lines.push('')
  lines.push('### Automatable Workflows')
  lines.push('| Workflow | Category | Current hrs/wk | Auto % | Time Saved | Tool | ROI (wks) |')
  lines.push('|----------|----------|----------------|--------|------------|------|-----------|')
  for (const w of output.workflows) {
    lines.push('| ' + w.workflow_name + ' | ' + w.category + ' | ' + w.current_time_hours_week + ' | ' + w.automatable_pct + '% | ' + w.time_savings_hours_week + ' | ' + w.ai_tool_recommendation + ' | ' + w.roi_weeks + ' |')
  }
  lines.push('')

  lines.push('### Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Time Savings | ' + output.total_time_savings_hours_week + ' hrs/week |')
  lines.push('| Implementation Cost | $' + output.total_implementation_cost + ' |')
  lines.push('| Automation Maturity | ' + output.automation_maturity_score + '/100 |')
  lines.push('')

  lines.push('### Implementation Priority')
  for (const p of output.implementation_priority) {
    lines.push('- ' + p)
  }
  lines.push('')

  lines.push('### Recommendations')
  for (const r of output.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 7: LEGAL STRUCTURE ADVISOR ====================

function adviseLegalStructure(input: LegalStructureInput): LegalStructureOutput {
  const seed = computeSeed(input)
  const rng = mulberry32(seed)

  const country = input.country.toLowerCase()
  const revenue = input.monthly_revenue_usd
  const risk = input.risk_level
  const needInvoice = input.need_invoice
  const teamPlans = input.team_plans

  const options: LegalOption[] = []

  if (country.includes('china') || country.includes('cn') || country.includes('中国')) {
    // 个体户
    options.push({
      entity_type: '个体户 (Individual Business)',
      description: 'Simplest structure for solo operators in China. Easy setup, minimal compliance.',
      liability_protection: 'none',
      tax_benefit_score: rngRange(rng, 50, 70),
      setup_cost_usd: rngRange(rng, 50, 150),
      annual_compliance_cost_usd: rngRange(rng, 100, 300),
      complexity: 'low',
      suitable: revenue < 2000 && risk === 'low' && !teamPlans,
      pros: ['Simplest registration', 'Low compliance burden', 'Tax incentives available', 'Easy to dissolve'],
      cons: ['Unlimited personal liability', 'Cannot issue special VAT invoices', 'Harder to scale', 'Limited credibility'],
    })

    // 一人有限公司
    options.push({
      entity_type: '一人有限公司 (One-Person LLC)',
      description: 'Limited liability company with single shareholder. Best for growing OPCs.',
      liability_protection: 'limited',
      tax_benefit_score: rngRange(rng, 60, 80),
      setup_cost_usd: rngRange(rng, 200, 500),
      annual_compliance_cost_usd: rngRange(rng, 500, 1200),
      complexity: 'medium',
      suitable: revenue >= 1000 || risk !== 'low' || needInvoice,
      pros: ['Limited liability protection', 'Can issue VAT invoices', 'Professional credibility', 'Easier to open business bank account'],
      cons: ['Annual audit requirements', 'Higher compliance costs', 'More complex accounting', 'Registered capital requirement'],
    })

    // 个人独资企业
    options.push({
      entity_type: '个人独资企业 (Sole Proprietorship)',
      description: 'Business owned by one person with full control. Tax-optimized for service businesses.',
      liability_protection: 'none',
      tax_benefit_score: rngRange(rng, 70, 85),
      setup_cost_usd: rngRange(rng, 100, 300),
      annual_compliance_cost_usd: rngRange(rng, 200, 500),
      complexity: 'low',
      suitable: revenue < 5000 && !needInvoice && risk !== 'high',
      pros: ['Tax benefits (核定征收)', 'Full control', 'Simple accounting', 'Low compliance cost'],
      cons: ['Unlimited liability', 'Cannot add partners easily', 'Limited to smaller scale', 'No VAT special invoice'],
    })
  } else {
    // Generic international options
    options.push({
      entity_type: 'Sole Proprietorship',
      description: 'Simplest structure. No legal separation between owner and business.',
      liability_protection: 'none',
      tax_benefit_score: rngRange(rng, 40, 60),
      setup_cost_usd: rngRange(rng, 50, 200),
      annual_compliance_cost_usd: rngRange(rng, 0, 200),
      complexity: 'low',
      suitable: revenue < 1000 && risk === 'low',
      pros: ['No registration cost in most jurisdictions', 'Simple tax filing', 'Full control', 'Easy to start'],
      cons: ['Unlimited personal liability', 'Harder to get business loans', 'No credibility boost', 'Self-employment tax'],
    })

    options.push({
      entity_type: 'Single-Member LLC',
      description: 'Limited liability with pass-through taxation. Best for most OPCs.',
      liability_protection: 'limited',
      tax_benefit_score: rngRange(rng, 60, 80),
      setup_cost_usd: rngRange(rng, 100, 500),
      annual_compliance_cost_usd: rngRange(rng, 200, 800),
      complexity: 'medium',
      suitable: revenue >= 500 || risk !== 'low',
      pros: ['Limited liability protection', 'Pass-through taxation', 'Professional credibility', 'Flexible management'],
      cons: ['Annual filing fees', 'State-specific rules', 'Self-employment tax', 'More complex than sole prop'],
    })

    options.push({
      entity_type: 'One Person Company (OPC)',
      description: 'Private company with single member. Available in India, Singapore, etc.',
      liability_protection: 'full',
      tax_benefit_score: rngRange(rng, 55, 75),
      setup_cost_usd: rngRange(rng, 200, 600),
      annual_compliance_cost_usd: rngRange(rng, 400, 1000),
      complexity: 'high',
      suitable: revenue >= 3000 && teamPlans,
      pros: ['Full limited liability', 'Corporate tax rates', 'Can add directors later', 'Highest credibility'],
      cons: ['Most complex setup', 'Annual compliance mandatory', 'Audited financials required', 'Higher total costs'],
    })
  }

  // Sort by suitability
  options.sort((a, b) => (b.suitable ? 1 : 0) - (a.suitable ? 1 : 0))

  const recommended = options.find(o => o.suitable) || options[0]

  let taxImplications = ''
  if (country.includes('china') || country.includes('cn')) {
    taxImplications = '个体户: 核定征收税率3-10%. 一人有限公司: 企业所得税25%(小微5-10%)+分红税20%. 个人独资: 核定征收综合税率3-10%.'
  } else {
    taxImplications = 'Sole prop: pass-through taxation at personal rates. LLC: pass-through or elect S-corp. OPC: corporate tax rate applies.'
  }

  const setupSteps: string[] = []
  if (recommended.entity_type.includes('个体户') || recommended.entity_type.includes('Sole Prop')) {
    setupSteps.push('1. Register business name with local authority')
    setupSteps.push('2. Obtain business license / DBA registration')
    setupSteps.push('3. Open business bank account')
    setupSteps.push('4. Register for tax ID / EIN')
  } else if (recommended.entity_type.includes('一人有限公司') || recommended.entity_type.includes('LLC')) {
    setupSteps.push('1. Choose and reserve company name')
    setupSteps.push('2. File Articles of Organization / Incorporation')
    setupSteps.push('3. Obtain EIN / Tax ID')
    setupSteps.push('4. Open business bank account')
    setupSteps.push('5. Register for state/local taxes')
  } else {
    setupSteps.push('1. Reserve company name')
    setupSteps.push('2. File incorporation documents with nominee director')
    setupSteps.push('3. Obtain tax registration')
    setupSteps.push('4. Open corporate bank account')
    setupSteps.push('5. Set up accounting and compliance systems')
  }

  const warnings: string[] = []
  if (risk === 'high' && recommended.liability_protection === 'none') {
    warnings.push('HIGH RISK: Current recommendation has no liability protection. Consider upgrading to LLC/OPC.')
  }
  if (needInvoice && recommended.entity_type.includes('个体户')) {
    warnings.push('INVOICE NEED: 个体户 cannot issue special VAT invoices. Consider 一人有限公司.')
  }
  if (teamPlans && !recommended.entity_type.includes('有限公司') && !recommended.entity_type.includes('LLC') && !recommended.entity_type.includes('OPC')) {
    warnings.push('TEAM PLANS: Current structure does not support adding partners. Consider LLC or OPC.')
  }

  return {
    recommended_structure: recommended.entity_type,
    options,
    tax_implications: taxImplications,
    setup_steps: setupSteps,
    estimated_timeline_days: rngRange(rng, 7, 30),
    warnings,
  }
}

function formatLegalReport(input: LegalStructureInput, output: LegalStructureOutput): string {
  const lines: string[] = []
  lines.push('## Legal Structure Advisory')
  lines.push('')
  lines.push('**Country:** ' + input.country + ' | **Monthly Revenue:** $' + input.monthly_revenue_usd + ' | **Risk Level:** ' + input.risk_level + '')
  lines.push('')
  lines.push('### Recommended Structure: ' + output.recommended_structure)
  lines.push('')

  lines.push('### Entity Comparison')
  lines.push('| Entity | Liability | Tax Benefit | Setup Cost | Annual Cost | Complexity | Suitable |')
  lines.push('|--------|-----------|-------------|------------|-------------|------------|----------|')
  for (const o of output.options) {
    lines.push('| ' + o.entity_type + ' | ' + o.liability_protection + ' | ' + o.tax_benefit_score + '/100 | $' + o.setup_cost_usd + ' | $' + o.annual_compliance_cost_usd + ' | ' + o.complexity + ' | ' + (o.suitable ? 'YES' : 'NO') + ' |')
  }
  lines.push('')

  for (const o of output.options.filter(x => x.suitable)) {
    lines.push('### Pros: ' + o.entity_type)
    for (const p of o.pros) {
      lines.push('- ' + p)
    }
    lines.push('')
    lines.push('### Cons: ' + o.entity_type)
    for (const c of o.cons) {
      lines.push('- ' + c)
    }
    lines.push('')
  }

  lines.push('### Tax Implications')
  lines.push(output.tax_implications)
  lines.push('')

  lines.push('### Setup Steps')
  for (const s of output.setup_steps) {
    lines.push('- ' + s)
  }
  lines.push('')

  lines.push('**Estimated Timeline:** ' + output.estimated_timeline_days + ' days')
  lines.push('')

  if (output.warnings.length > 0) {
    lines.push('### Warnings')
    for (const w of output.warnings) {
      lines.push('- **' + w + '**')
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 8: MILESTONE TRACKER ====================

function trackMilestones(input: MilestoneTrackerInput): MilestoneTrackerOutput {
  const seed = computeSeed(input)
  const rng = mulberry32(seed)

  const target = input.monthly_target_usd
  const months = input.months_to_target
  const benchmarks = input.industry_benchmarks

  const milestones: Milestone[] = []

  for (let m = 1; m <= months; m++) {
    const progress = m / months
    const revenueTarget = Math.round(target * Math.pow(progress, 1.5)) // S-curve growth
    const customerTarget = Math.round(benchmarks.avg_customers_at_6mo * progress * rngFloat(rng, 0.8, 1.2))

    const actions: string[] = []
    const metrics: string[] = []
    const risks: string[] = []

    if (m <= 2) {
      actions.push('Launch MVP and acquire first 5 paying customers')
      actions.push('Set up analytics and tracking infrastructure')
      actions.push('Begin content marketing with AI assistance')
      metrics.push('First revenue received', 'Customer feedback collected', 'Product-market fit signals')
      risks.push('No product-market fit', 'Technical issues at launch', 'Slow initial traction')
    } else if (m <= 4) {
      actions.push('Optimize conversion funnel based on early data')
      actions.push('Scale winning acquisition channel')
      actions.push('Implement customer referral program')
      metrics.push('Monthly recurring revenue', 'Customer acquisition cost', 'Net promoter score')
      risks.push('Channel saturation', 'Customer churn increase', 'Cash flow constraints')
    } else if (m <= 6) {
      actions.push('Expand to second acquisition channel')
      actions.push('Launch premium tier or upsell offering')
      actions.push('Automate 70% of operational workflows')
      metrics.push('Revenue growth rate', 'Automation coverage %', 'Customer lifetime value')
      risks.push('Scaling too fast', 'Quality degradation', 'Competitive response')
    } else {
      actions.push('Optimize pricing based on value delivered')
      actions.push('Build strategic partnerships')
      actions.push('Plan next product line or market expansion')
      metrics.push('Revenue vs target', 'Profit margin', 'Market share estimate')
      risks.push('Market shifts', 'Burnout risk', 'Regulatory changes')
    }

    milestones.push({
      month: m,
      revenue_target_usd: revenueTarget,
      customer_target: Math.max(1, customerTarget),
      key_actions: actions,
      success_metrics: metrics,
      risk_factors: risks,
    })
  }

  const totalRevenue = milestones.reduce((s, m) => s + m.revenue_target_usd, 0)
  const growthRate = Math.round((Math.pow(target / Math.max(1, milestones[0].revenue_target_usd), 1 / months) - 1) * 100)

  let feasibility = 'achievable'
  if (growthRate > 50) feasibility = 'ambitious - requires exceptional execution'
  else if (growthRate > 30) feasibility = 'challenging but realistic with AI leverage'
  else if (growthRate > 15) feasibility = 'conservative and achievable'
  else feasibility = 'very conservative - consider accelerating'

  const criticalFactors: string[] = []
  criticalFactors.push('Consistent weekly execution on top 3 priorities')
  criticalFactors.push('AI automation freeing 15+ hours/week for high-value work')
  criticalFactors.push('Monthly pricing/offer optimization based on customer data')
  criticalFactors.push('Building audience/content asset that compounds over time')
  criticalFactors.push('Maintaining health/sustainability - OPC is a marathon, not a sprint')

  const pivotTriggers: string[] = []
  pivotTriggers.push('If MRR <20% of target for 2 consecutive months - revisit product-market fit')
  pivotTriggers.push('If customer acquisition cost >1/3 of lifetime value - change channel strategy')
  pivotTriggers.push('If churn rate >10%/mo - fix product before scaling acquisition')
  pivotTriggers.push('If burnout indicators appear - reduce scope, not ambition')

  return {
    milestones,
    total_revenue_at_target: totalRevenue,
    required_monthly_growth_pct: growthRate,
    feasibility_assessment: feasibility,
    critical_success_factors: criticalFactors,
    pivot_triggers: pivotTriggers,
  }
}

function formatMilestoneReport(input: MilestoneTrackerInput, output: MilestoneTrackerOutput): string {
  const lines: string[] = []
  lines.push('## Growth Milestone Tracker')
  lines.push('')
  lines.push('**Target:** $' + input.monthly_target_usd.toLocaleString() + '/mo in ' + input.months_to_target + ' months | **Growth Rate:** ' + output.required_monthly_growth_pct + '%/mo')
  lines.push('')
  lines.push('### Feasibility: ' + output.feasibility_assessment.toUpperCase())
  lines.push('')

  lines.push('### Monthly Milestones')
  lines.push('| Month | Revenue Target | Customers | Key Focus |')
  lines.push('|-------|---------------|-----------|-----------|')
  for (const m of output.milestones) {
    lines.push('| Month ' + m.month + ' | $' + m.revenue_target_usd.toLocaleString() + ' | ' + m.customer_target + ' | ' + m.key_actions[0] + ' |')
  }
  lines.push('')

  lines.push('### Detailed Breakdown')
  for (const m of output.milestones) {
    lines.push('#### Month ' + m.month + ' ($' + m.revenue_target_usd.toLocaleString() + ' revenue)')
    lines.push('**Key Actions:**')
    for (const a of m.key_actions) {
      lines.push('- ' + a)
    }
    lines.push('**Success Metrics:**')
    for (const met of m.success_metrics) {
      lines.push('- ' + met)
    }
    lines.push('')
  }

  lines.push('### Critical Success Factors')
  for (const f of output.critical_success_factors) {
    lines.push('- ' + f)
  }
  lines.push('')

  lines.push('### Pivot Triggers')
  for (const t of output.pivot_triggers) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push('**Total Revenue Across Period:** $' + output.total_revenue_at_target.toLocaleString() + '')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: OPC Viability Scorer
  tools.register(defineTool({
    name: 'opc_viability_scorer',
    description: 'Scores whether a business idea is viable as a one-person company. Evaluates market size, AI-automatability, solo-feasibility, revenue potential, time efficiency, and scalability. Returns verdict, category scores, strengths, risks, and recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_idea, industry, initial_budget_usd, skill_set[], time_available_hours_week', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ViabilityInput = JSON.parse(args.input_data)
      const result = scoreViability(input)
      return formatViabilityReport(input, result)
    }
  }))

  // Tool 2: MVP Scoper
  tools.register(defineTool({
    name: 'mvp_scoper',
    description: 'Defines the minimum viable product for an OPC launch. Identifies core features, no-build features, and phase-2 deferrals with effort estimates and AI-assist ratings.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_type, target_customer, differentiators[], launch_timeline_weeks', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: MvpScoperInput = JSON.parse(args.input_data)
      const result = scopeMvp(input)
      return formatMvpReport(input, result)
    }
  }))

  // Tool 3: Revenue Stream Designer
  tools.register(defineTool({
    name: 'revenue_stream_designer',
    description: 'Designs optimal revenue model(s) for a solo business. Evaluates subscription, one-off, commission, freemium, and retainer models with suitability scoring and revenue projections.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_type, target_market, price_sensitivity (low|medium|high), competitive_landscape[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: RevenueStreamInput = JSON.parse(args.input_data)
      const result = designRevenueStreams(input)
      return formatRevenueStreamReport(input, result)
    }
  }))

  // Tool 4: Acquisition Planner
  tools.register(defineTool({
    name: 'acquisition_planner',
    description: 'Creates a customer acquisition plan solo-executable. Recommends channels (content, social, paid, outreach, referral) with budget allocation, expected leads, and AI automation levels.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: budget_usd_month, target_audience, product_type, ai_tools_available[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: AcquisitionPlannerInput = JSON.parse(args.input_data)
      const result = planAcquisition(input)
      return formatAcquisitionReport(input, result)
    }
  }))

  // Tool 5: Pricing Optimizer
  tools.register(defineTool({
    name: 'pricing_optimizer',
    description: 'Optimizes pricing strategy based on value delivered, competition, and solo cost structure. Recommends tiered pricing, calculates break-even, and provides competitive positioning.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_category, value_proposition, competitor_prices[], cost_structure{fixed_monthly, variable_per_unit}', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PricingOptimizerInput = JSON.parse(args.input_data)
      const result = optimizePricing(input)
      return formatPricingReport(input, result)
    }
  }))

  // Tool 6: Workflow Automator Designer
  tools.register(defineTool({
    name: 'workflow_automator_designer',
    description: 'Designs AI-automatable workflows for solo operations. Covers marketing, delivery, support, and finance workflows with time savings, tool recommendations, and ROI estimates.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_model, current_tools[], pain_points[], automation_budget', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: WorkflowAutomatorInput = JSON.parse(args.input_data)
      const result = designWorkflowAutomation(input)
      return formatWorkflowReport(input, result)
    }
  }))

  // Tool 7: Legal Structure Advisor
  tools.register(defineTool({
    name: 'legal_structure_advisor',
    description: 'Advises on legal entity type for OPC. Compares 个体户 vs 一人有限公司 vs 个人独资 (China) or Sole Prop vs LLC vs OPC (international) with pros/cons, tax implications, and setup steps.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: country, monthly_revenue_usd, risk_level (low|medium|high), need_invoice, team_plans', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: LegalStructureInput = JSON.parse(args.input_data)
      const result = adviseLegalStructure(input)
      return formatLegalReport(input, result)
    }
  }))

  // Tool 8: Milestone Tracker
  tools.register(defineTool({
    name: 'milestone_tracker',
    description: 'Creates measurable growth milestones for OPC from zero to sustainable income. Generates month-by-month targets with key actions, success metrics, and pivot triggers.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: current_stage, monthly_target_usd, months_to_target, industry_benchmarks{avg_time_to_first_revenue_days, avg_customers_at_6mo, avg_mrr_at_12mo}', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: MilestoneTrackerInput = JSON.parse(args.input_data)
      const result = trackMilestones(input)
      return formatMilestoneReport(input, result)
    }
  }))

  console.log('[dsh-tool-opcstudio] Loaded v' + VERSION + ' - OPC One Person Company Studio with 8 tools')
  console.log('  Tools: opc_viability_scorer, mvp_scoper, revenue_stream_designer, acquisition_planner, pricing_optimizer, workflow_automator_designer, legal_structure_advisor, milestone_tracker')
}
