/**
 * DSH Minimalist Entrepreneur Plugin v1.0.0
 *
 * 小而美创业 -- Sahil Lavingia (Gumroad founder) philosophy from
 * "The Minimalist Entrepreneur" (豆瓣7.8分).
 * Core idea: start small, profit-first, find community before building,
 * validate before scaling, survive before growing.
 * Hugely relevant for OPC solo founders in 2026.
 *
 * Features (v1.0.0):
 * - Community-First Validator (validate community fit before building)
 * - Profit-First Planner (plan path to first dollar revenue)
 * - Lean Validation Framework (test assumptions before building)
 * - Scope Killer (identify features to cut to stay minimal)
 * - Community Builder Strategy (grow an engaged community)
 * - Pricing Psychology Advisor (value-based pricing with anchoring)
 * - Sustainability Calculator (runway survival analysis)
 * - Pivot or Persevere Decider (data-driven pivot framework)
 *
 * @module dsh-tool-minimalist
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-minimalist'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute legal, financial, or business advice. Consult qualified professionals before making decisions.'

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

function rateScore(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Strong'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'Weak'
  return 'Poor'
}

// ==================== TYPES ====================

// --- Tool 1: Community-First Validator ---
interface CommunityValidatorInput {
  idea_description?: string
  target_community?: string
  community_size?: number
  engagement_evidence?: string[]
  competitor_analysis?: string[]
}

interface CommunitySignal {
  signal: string
  strength: 'strong' | 'moderate' | 'weak'
  notes: string
}

interface CommunityFitResult {
  fit_score: number
  community_readiness: 'ready' | 'emerging' | 'unproven' | 'misfit'
  signals: CommunitySignal[]
  gaps: string[]
  recommendations: string[]
  verdict: string
}

// --- Tool 2: Profit-First Planner ---
interface ProfitFirstInput {
  idea?: string
  target_customer?: string
  willingness_to_pay?: 'low' | 'medium' | 'high'
  minimum_viable_offer?: string
  pricing_model?: 'one_time' | 'subscription' | 'usage_based' | 'freemium' | 'hybrid'
}

interface Milestone {
  milestone: string
  timeline: string
  success_criteria: string
}

interface ProfitPlanResult {
  first_dollar_path: string
  minimum_features: string[]
  pricing_recommendation: string
  revenue_projection: { month_1: number; month_3: number; month_6: number }
  milestones: Milestone[]
  risk_factors: string[]
  summary: string
}

// --- Tool 3: Lean Validation Framework ---
interface LeanValidationInput {
  assumptions?: string[]
  risk_level?: 'low' | 'medium' | 'high'
  validation_budget?: number
  time_constraint_days?: number
  experiment_types?: string[]
}

interface Experiment {
  name: string
  assumption_tested: string
  method: string
  cost_usd: number
  duration_days: number
  success_criteria: string
  effort: 'low' | 'medium' | 'high'
}

interface ValidationPlanResult {
  experiments: Experiment[]
  total_cost: number
  total_duration_days: number
  risk_mitigation_pct: number
  priority_order: string[]
  summary: string
}

// --- Tool 4: Scope Killer ---
interface ScopeKillerInput {
  feature_list?: string[]
  core_value_proposition?: string
  user_effort_per_feature?: Record<string, number>
  build_cost_per_feature?: Record<string, number>
}

interface FeatureAnalysis {
  feature: string
  keep_or_cut: 'keep' | 'cut' | 'defer'
  value_score: number
  effort_score: number
  rationale: string
}

interface ScopeKillerResult {
  features_to_keep: FeatureAnalysis[]
  features_to_cut: FeatureAnalysis[]
  features_to_defer: FeatureAnalysis[]
  scope_reduction_pct: number
  saved_build_hours: number
  summary: string
}

// --- Tool 5: Community Builder Strategy ---
interface CommunityBuilderInput {
  niche_audience?: string
  platform_preferences?: string[]
  content_format?: string
  launch_stage?: 'pre_launch' | 'launch' | 'growth' | 'mature'
  resources_available?: { hours_per_week?: number; budget_usd_month?: number; team_size?: number }
}

interface CommunityTactic {
  tactic: string
  platform: string
  effort: 'low' | 'medium' | 'high'
  expected_impact: 'low' | 'medium' | 'high'
  timeline: string
  description: string
}

interface GrowthMilestone {
  milestone: string
  target_size: number
  timeline: string
}

interface CommunityStrategyResult {
  strategy_name: string
  primary_platform: string
  tactics: CommunityTactic[]
  growth_milestones: GrowthMilestone[]
  content_calendar: string[]
  summary: string
}

// --- Tool 6: Pricing Psychology Advisor ---
interface PricingPsychologyInput {
  product_type?: string
  target_segment?: string
  competitor_prices?: number[]
  value_delivered_usd?: number
  price_sensitivity?: 'low' | 'medium' | 'high'
}

interface PricingTier {
  tier_name: string
  price: number
  anchor: string
  psychology: string
  target_segment: string
}

interface PricingPsychologyResult {
  recommended_tiers: PricingTier[]
  anchor_price: number
  price_anchor_strategy: string
  perceived_value_score: number
  psychology_tips: string[]
  summary: string
}

// --- Tool 7: Sustainability Calculator ---
interface SustainabilityInput {
  monthly_burn_usd?: number
  current_savings_usd?: number
  revenue_rate_usd_month?: number
  fixed_costs_usd_month?: number
  growth_rate?: number
}

interface MonthlySnapshot {
  month: number
  revenue: number
  costs: number
  net_burn: number
  remaining_savings: number
}

interface MetricToHit {
  metric: string
  target: number
  deadline: string
}

interface SustainabilityResult {
  runway_months: number
  break_even_month: number | null
  survival_status: 'safe' | 'caution' | 'critical' | 'runway_depleted'
  monthly_projections: MonthlySnapshot[]
  metrics_to_hit: MetricToHit[]
  recommendations: string[]
  summary: string
}

// --- Tool 8: Pivot or Persevere Decider ---
interface PivotPersevereInput {
  current_metrics?: Record<string, number>
  targets?: Record<string, number>
  time_invested_months?: number
  market_feedback?: string[]
  sunk_cost_bias_level?: 'low' | 'medium' | 'high'
}

interface MetricGap {
  metric: string
  current: number
  target: number
  gap_pct: number
  on_track: boolean
}

interface PivotPersevereResult {
  decision: 'persevere' | 'pivot' | 'pause_and_reassess'
  confidence: number
  metric_gaps: MetricGap[]
  reasoning: string[]
  pivot_options: string[]
  action_items: string[]
  summary: string
}

// ==================== TOOL 1: COMMUNITY-FIRST VALIDATOR ====================

function validateCommunityFit(input: CommunityValidatorInput): CommunityFitResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const idea = (input.idea_description || '').toLowerCase()
  const community = (input.target_community || '').toLowerCase()
  const size = input.community_size || 0
  const evidence = input.engagement_evidence || []
  const competitors = input.competitor_analysis || []

  const signals: CommunitySignal[] = []

  // Community size signal
  let sizeStrength: 'strong' | 'moderate' | 'weak' = 'weak'
  if (size >= 10000) sizeStrength = 'strong'
  else if (size >= 1000) sizeStrength = 'moderate'
  const sizeNotes = size >= 10000
    ? 'Large enough community (' + size.toLocaleString() + ') to sustain a niche product'
    : size >= 1000
    ? 'Moderate community (' + size.toLocaleString() + ') — viable for a focused offering'
    : 'Small community (' + size.toLocaleString() + ') — may need to expand target audience'
  signals.push({ signal: 'Community Size', strength: sizeStrength, notes: sizeNotes })

  // Engagement evidence signal
  let engStrength: 'strong' | 'moderate' | 'weak' = 'weak'
  if (evidence.length >= 4) engStrength = 'strong'
  else if (evidence.length >= 2) engStrength = 'moderate'
  const engNotes = evidence.length >= 4
    ? evidence.length + ' engagement signals — strong validation'
    : evidence.length >= 2
    ? evidence.length + ' engagement signals — moderate validation'
    : 'Limited engagement evidence (' + evidence.length + ') — need more data'
  signals.push({ signal: 'Engagement Evidence', strength: engStrength, notes: engNotes })

  // Competitor landscape signal
  let compStrength: 'strong' | 'moderate' | 'weak' = 'weak'
  if (competitors.length === 0) compStrength = 'strong'
  else if (competitors.length <= 2) compStrength = 'moderate'
  const compNotes = competitors.length === 0
    ? 'No direct competitors — potential blue ocean (or no demand)'
    : competitors.length <= 2
    ? 'Few competitors (' + competitors.length + ') — room for differentiation'
    : 'Crowded space (' + competitors.length + ' competitors) — need clear positioning'
  signals.push({ signal: 'Competitive Landscape', strength: compStrength, notes: compNotes })

  // Idea-community alignment
  const overlapWords = idea.split(' ').filter(w => community.includes(w) && w.length > 3)
  let alignStrength: 'strong' | 'moderate' | 'weak' = 'weak'
  if (overlapWords.length >= 3) alignStrength = 'strong'
  else if (overlapWords.length >= 1) alignStrength = 'moderate'
  const alignNotes = overlapWords.length >= 3
    ? 'Strong keyword overlap between idea and target community'
    : overlapWords.length >= 1
    ? 'Some alignment detected — refine positioning'
    : 'Weak alignment — reconsider target community or idea'
  signals.push({ signal: 'Idea-Community Alignment', strength: alignStrength, notes: alignNotes })

  // Calculate fit score
  const strengthToScore = (s: 'strong' | 'moderate' | 'weak') => s === 'strong' ? rng.nextInt(75, 95) : s === 'moderate' ? rng.nextInt(50, 74) : rng.nextInt(20, 49)
  const signalScores = signals.map(s => strengthToScore(s.strength))
  const fitScore = Math.round(signalScores.reduce((a, b) => a + b, 0) / signalScores.length)

  let readiness: CommunityFitResult['community_readiness'] = 'unproven'
  if (fitScore >= 75) readiness = 'ready'
  else if (fitScore >= 55) readiness = 'emerging'
  else if (fitScore >= 35) readiness = 'unproven'
  else readiness = 'misfit'

  const gaps: string[] = []
  if (size < 1000) gaps.push('Community too small — expand to adjacent communities')
  if (evidence.length < 2) gaps.push('Insufficient engagement evidence — run community surveys')
  if (competitors.length > 3) gaps.push('Too many competitors — narrow niche further')
  if (overlapWords.length < 1) gaps.push('Idea-community mismatch — redefine target audience')
  if (gaps.length === 0) gaps.push('No critical gaps detected — proceed to validation')

  const recommendations: string[] = []
  recommendations.push('Join the community as a member before building — spend 2 weeks observing pain points')
  if (evidence.length < 3) recommendations.push('Collect 3+ forms of engagement evidence (surveys, interviews, comments)')
  recommendations.push('Identify 10 community members for 1:1 conversations about their problems')
  if (competitors.length > 0) recommendations.push('Study competitor reviews — find unmet needs they ignore')
  recommendations.push('Share your idea as a discussion thread — gauge organic response before building')
  recommendations.push('Build in public within the community — transparency creates early adopters')

  const verdict = readiness === 'ready' ? 'Strong community fit — you have a real audience. Build for them.'
    : readiness === 'emerging' ? 'Promising community signals — validate deeper before building.'
    : readiness === 'unproven' ? 'Insufficient community evidence — find your people first.'
    : 'Poor community fit — pivot to a different audience or problem.'

  return { fit_score: fitScore, community_readiness: readiness, signals, gaps, recommendations, verdict }
}

function formatCommunityValidatorReport(input: CommunityValidatorInput, result: CommunityFitResult): string {
  const lines: string[] = []
  const readinessTag = result.community_readiness === 'ready' ? 'READY' : result.community_readiness === 'emerging' ? 'EMERGING' : result.community_readiness === 'unproven' ? 'UNPROVEN' : 'MISFIT'

  lines.push('## Community-First Validation Report')
  lines.push('')
  lines.push('**' + (input.idea_description || 'Your Idea') + '** — Target: ' + (input.target_community || 'Unspecified'))
  lines.push('')
  lines.push('### Fit Score: ' + result.fit_score + '/100 (' + readinessTag + ')')
  lines.push('')
  lines.push(result.verdict)
  lines.push('')

  lines.push('### Signal Analysis')
  lines.push('| Signal | Strength | Assessment |')
  lines.push('|--------|----------|------------|')
  for (const s of result.signals) {
    const strTag = s.strength.toUpperCase()
    lines.push('| ' + s.signal + ' | ' + strTag + ' | ' + s.notes + ' |')
  }
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Gaps to Address')
    for (const g of result.gaps) {
      lines.push('- ' + g)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 2: PROFIT-FIRST PLANNER ====================

function planProfitFirst(input: ProfitFirstInput): ProfitPlanResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const idea = input.idea || 'your product'
  const customer = input.target_customer || 'early adopters'
  const wtp = input.willingness_to_pay || 'medium'
  const offer = input.minimum_viable_offer || 'core solution'
  const pricingModel = input.pricing_model || 'one_time'

  const wtpMultiplier = wtp === 'high' ? 3 : wtp === 'medium' ? 2 : 1

  const minimumFeatures: string[] = []
  minimumFeatures.push('Core value delivery: ' + offer)
  minimumFeatures.push('Payment/checkout flow (Stripe or LemonSqueezy)')
  minimumFeatures.push('Basic onboarding (3-step max)')
  minimumFeatures.push('Customer support channel (email or Discord)')
  if (pricingModel === 'subscription' || pricingModel === 'freemium') {
    minimumFeatures.push('Usage tracking and billing management')
  }

  let basePrice = 0
  let pricingRec = ''
  switch (pricingModel) {
    case 'one_time':
      basePrice = 29 * wtpMultiplier
      pricingRec = 'One-time purchase at $' + basePrice + ' — lowest friction for first customers'
      break
    case 'subscription':
      basePrice = 19 * wtpMultiplier
      pricingRec = 'Monthly subscription at $' + basePrice + '/mo — predictable recurring revenue'
      break
    case 'usage_based':
      basePrice = 0
      pricingRec = 'Usage-based: free to start, $0.01-0.10 per action — aligns cost with value'
      break
    case 'freemium':
      basePrice = 0
      pricingRec = 'Freemium: free tier for acquisition, $' + (29 * wtpMultiplier) + '/mo Pro tier'
      break
    case 'hybrid':
      basePrice = 49 * wtpMultiplier
      pricingRec = 'Hybrid: $' + basePrice + ' setup + $' + Math.round(basePrice / 3) + '/mo — covers costs + recurring'
      break
  }

  const month1Customers = rng.nextInt(3, 12)
  const month3Customers = rng.nextInt(10, 35)
  const month6Customers = rng.nextInt(25, 80)

  const revenueProjection = {
    month_1: month1Customers * basePrice,
    month_3: month3Customers * basePrice,
    month_6: month6Customers * basePrice,
  }

  const milestones: Milestone[] = [
    { milestone: 'First paying customer', timeline: 'Week 1-2', success_criteria: '1 customer pays without manual sales' },
    { milestone: '$100 MRR', timeline: 'Week 3-4', success_criteria: '$100+ in monthly recurring or one-time revenue' },
    { milestone: '$1,000 MRR', timeline: 'Month 2-3', success_criteria: 'Consistent $1K/mo from 10+ customers' },
    { milestone: 'Product-market fit signal', timeline: 'Month 3-6', success_criteria: '40%+ of users would be "very disappointed" without product' },
  ]

  const riskFactors: string[] = []
  if (wtp === 'low') riskFactors.push('Low willingness to pay — consider higher-value segment')
  if (pricingModel === 'usage_based') riskFactors.push('Usage-based pricing has unpredictable revenue — hard to forecast')
  riskFactors.push('First customers may need hand-holding — budget 5-10 hrs/week for support')
  riskFactors.push('Revenue concentration risk — first 5 customers may be friends/family, not representative')
  if (month6Customers < 30) riskFactors.push('Slow initial traction — may need to adjust positioning or channel')

  const summary = 'Path to first dollar: launch ' + offer + ' at $' + basePrice + ' for ' + customer + '. Projected Month 1: $' + revenueProjection.month_1 + ', Month 3: $' + revenueProjection.month_3 + ', Month 6: $' + revenueProjection.month_6 + '. Focus on ' + minimumFeatures.length + ' minimum features only.'

  return {
    first_dollar_path: 'Launch ' + offer + ' to ' + customer + ' via ' + pricingModel + ' pricing at $' + basePrice,
    minimum_features: minimumFeatures,
    pricing_recommendation: pricingRec,
    revenue_projection: revenueProjection,
    milestones,
    risk_factors: riskFactors,
    summary,
  }
}

function formatProfitFirstReport(input: ProfitFirstInput, result: ProfitPlanResult): string {
  const lines: string[] = []

  lines.push('## Profit-First Plan')
  lines.push('')
  lines.push('**' + (input.idea || 'Your Idea') + '** → ' + (input.target_customer || 'Early Adopters'))
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### First Dollar Path')
  lines.push(result.first_dollar_path)
  lines.push('')

  lines.push('### Minimum Features (Build Only These)')
  for (const f of result.minimum_features) {
    lines.push('- ' + f)
  }
  lines.push('')

  lines.push('### Pricing Recommendation')
  lines.push(result.pricing_recommendation)
  lines.push('')

  lines.push('### Revenue Projection')
  lines.push('| Timeline | Customers | Revenue |')
  lines.push('|----------|-----------|---------|')
  const unitPrice = input.willingness_to_pay === 'high' ? 87 : input.willingness_to_pay === 'medium' ? 38 : 29
  lines.push('| Month 1 | ~' + Math.max(1, Math.round(result.revenue_projection.month_1 / Math.max(1, unitPrice))) + ' | $' + result.revenue_projection.month_1 + ' |')
  lines.push('| Month 3 | ~' + Math.max(1, Math.round(result.revenue_projection.month_3 / Math.max(1, unitPrice))) + ' | $' + result.revenue_projection.month_3 + ' |')
  lines.push('| Month 6 | ~' + Math.max(1, Math.round(result.revenue_projection.month_6 / Math.max(1, unitPrice))) + ' | $' + result.revenue_projection.month_6 + ' |')
  lines.push('')

  lines.push('### Milestones')
  for (const m of result.milestones) {
    lines.push('- **' + m.milestone + '** (' + m.timeline + '): ' + m.success_criteria)
  }
  lines.push('')

  lines.push('### Risk Factors')
  for (const r of result.risk_factors) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 3: LEAN VALIDATION FRAMEWORK ====================

function createValidationPlan(input: LeanValidationInput): ValidationPlanResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const assumptions = input.assumptions || ['customers want this', 'they will pay for it', 'we can build it in 2 weeks', 'we can reach them cheaply']
  const riskLevel = input.risk_level || 'medium'
  const budget = input.validation_budget || 100
  const timeConstraint = input.time_constraint_days || 14
  const experimentTypes = input.experiment_types || ['survey', 'landing_page', 'smoke_test', 'interview']

  const methodMap: Record<string, { method: string; costRange: [number, number]; durationRange: [number, number]; effort: 'low' | 'medium' | 'high' }> = {
    survey: { method: 'Online survey (Google Forms + social distribution)', costRange: [0, 20], durationRange: [3, 5], effort: 'low' },
    landing_page: { method: 'Landing page with email capture (Carrd + Stripe pre-order)', costRange: [10, 50], durationRange: [2, 4], effort: 'low' },
    smoke_test: { method: 'Fake door / smoke test (ad drive to waitlist)', costRange: [20, 100], durationRange: [3, 7], effort: 'medium' },
    interview: { method: 'Customer discovery interviews (5-10 people)', costRange: [0, 0], durationRange: [5, 10], effort: 'medium' },
    prototype: { method: 'Clickable prototype test (Figma + user session)', costRange: [0, 30], durationRange: [3, 7], effort: 'medium' },
    concierge: { method: 'Concierge MVP (manual delivery, no code)', costRange: [0, 50], durationRange: [5, 14], effort: 'high' },
    crowdfunding: { method: 'Pre-sale / crowdfunding campaign', costRange: [0, 30], durationRange: [7, 14], effort: 'high' },
    ad_test: { method: 'Paid ad validation (small budget test)', costRange: [30, 100], durationRange: [3, 7], effort: 'low' },
  }

  const experiments: Experiment[] = []
  let totalCost = 0
  let totalDuration = 0

  for (let i = 0; i < Math.min(assumptions.length, 5); i++) {
    const assumption = assumptions[i]
    const expType = experimentTypes[i % experimentTypes.length]
    const config = methodMap[expType] || methodMap.survey

    const cost = rng.nextInt(config.costRange[0], config.costRange[1])
    const duration = rng.nextInt(config.durationRange[0], config.durationRange[1])

    if (totalCost + cost > budget) continue
    if (Math.max(totalDuration, duration) > timeConstraint) continue

    const truncated = assumption.substring(0, 40) + (assumption.length > 40 ? '...' : '')
    experiments.push({
      name: 'Test: "' + truncated + '"',
      assumption_tested: assumption,
      method: config.method,
      cost_usd: cost,
      duration_days: duration,
      success_criteria: 'At least ' + rng.nextInt(3, 8) + ' positive signals from ' + rng.nextInt(5, 15) + ' participants',
      effort: config.effort,
    })

    totalCost += cost
    totalDuration = Math.max(totalDuration, duration)
  }

  if (experiments.length === 0) {
    experiments.push({
      name: 'Quick Interview Sprint',
      assumption_tested: assumptions[0] || 'core value assumption',
      method: '5 customer discovery interviews (free, 30 min each)',
      cost_usd: 0,
      duration_days: 3,
      success_criteria: '3/5 interviewees confirm the problem is real and painful',
      effort: 'low',
    })
    totalDuration = 3
  }

  const riskMitigation = clamp(Math.round((experiments.length / Math.max(1, assumptions.length)) * 100 * (riskLevel === 'high' ? 1.2 : riskLevel === 'medium' ? 1.0 : 0.8)), 10, 95)

  const priorityOrder = experiments
    .sort((a, b) => {
      const scoreA = (a.effort === 'low' ? 3 : a.effort === 'medium' ? 2 : 1) * 100 / (a.cost_usd + 1)
      const scoreB = (b.effort === 'low' ? 3 : b.effort === 'medium' ? 2 : 1) * 100 / (b.cost_usd + 1)
      return scoreB - scoreA
    })
    .map(e => e.name)

  const summary = experiments.length + ' experiments planned. Total cost: $' + totalCost + ' (budget: $' + budget + '). Duration: ' + totalDuration + ' days (constraint: ' + timeConstraint + ' days). Risk mitigation: ' + riskMitigation + '%.'

  return {
    experiments,
    total_cost: totalCost,
    total_duration_days: totalDuration,
    risk_mitigation_pct: riskMitigation,
    priority_order: priorityOrder,
    summary,
  }
}

function formatValidationReport(input: LeanValidationInput, result: ValidationPlanResult): string {
  const lines: string[] = []

  lines.push('## Lean Validation Plan')
  lines.push('')
  lines.push('**Risk Level:** ' + (input.risk_level || 'medium').toUpperCase() + ' | **Budget:** $' + (input.validation_budget || 100) + ' | **Time:** ' + (input.time_constraint_days || 14) + ' days')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Validation Experiments')
  lines.push('| # | Experiment | Method | Cost | Days | Effort | Success Criteria |')
  lines.push('|---|------------|--------|------|------|--------|------------------|')
  let idx = 1
  for (const e of result.experiments) {
    lines.push('| ' + idx + ' | ' + e.name + ' | ' + e.method + ' | $' + e.cost_usd + ' | ' + e.duration_days + ' | ' + e.effort.toUpperCase() + ' | ' + e.success_criteria + ' |')
    idx++
  }
  lines.push('')

  lines.push('### Priority Order (Run in This Sequence)')
  let pIdx = 1
  for (const name of result.priority_order) {
    lines.push(pIdx + '. ' + name)
    pIdx++
  }
  lines.push('')

  lines.push('### Budget Summary')
  lines.push('| Item | Value |')
  lines.push('|------|-------|')
  lines.push('| Total Experiment Cost | $' + result.total_cost + ' |')
  lines.push('| Remaining Budget | $' + Math.max(0, (input.validation_budget || 100) - result.total_cost) + ' |')
  lines.push('| Risk Mitigation Coverage | ' + result.risk_mitigation_pct + '% |')
  lines.push('')

  lines.push('### Key Principles')
  lines.push('- Test riskiest assumptions first — if they fail, nothing else matters')
  lines.push('- Spend $0 where possible — conversations are the highest-signal validation')
  lines.push('- Set success criteria BEFORE running — avoid moving goalposts')
  lines.push('- One failed experiment saves months of wasted building')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 4: SCOPE KILLER ====================

function analyzeScope(input: ScopeKillerInput): ScopeKillerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const features = input.feature_list || ['user_auth', 'dashboard', 'notifications', 'search', 'settings', 'export', 'integrations', 'analytics', 'onboarding', 'admin_panel']
  const cvp = (input.core_value_proposition || '').toLowerCase()
  const userEffort = input.user_effort_per_feature || {}
  const buildCost = input.build_cost_per_feature || {}

  const analysis: FeatureAnalysis[] = []

  for (const feature of features) {
    const featureLower = feature.toLowerCase()

    // Calculate value score based on CVP alignment
    const cvpWords = cvp.split(' ').filter(w => w.length > 3)
    const overlap = cvpWords.filter(w => featureLower.includes(w)).length
    const valueScore = clamp(rng.nextInt(30, 70) + overlap * 15, 5, 98)

    // Get effort and cost
    const effort = userEffort[feature] || rng.nextInt(1, 10)
    const cost = buildCost[feature] || rng.nextInt(5, 40)
    const effortScore = clamp(effort * 8 + cost * 0.5, 5, 98)

    // Determine keep/cut/defer
    let keepOrCut: 'keep' | 'cut' | 'defer' = 'defer'
    let rationale = ''

    if (valueScore >= 65 && effortScore <= 50) {
      keepOrCut = 'keep'
      rationale = 'High value, low effort — core to MVP'
    } else if (valueScore >= 65 && effortScore > 50) {
      keepOrCut = 'defer'
      rationale = 'High value but expensive — build after validation'
    } else if (valueScore < 40) {
      keepOrCut = 'cut'
      rationale = 'Low value alignment with CVP — cut entirely'
    } else {
      keepOrCut = rng.nextFloat(0, 1) > 0.5 ? 'cut' : 'defer'
      rationale = keepOrCut === 'cut' ? 'Marginal value — not worth the build cost' : 'Moderate value — defer to v2'
    }

    // Override for essential features
    if (featureLower.includes('auth') || featureLower.includes('payment') || featureLower.includes('checkout')) {
      keepOrCut = 'keep'
      rationale = 'Essential infrastructure — required for any launch'
    }

    analysis.push({ feature, keep_or_cut: keepOrCut, value_score: valueScore, effort_score: Math.round(effortScore), rationale })
  }

  const keep = analysis.filter(a => a.keep_or_cut === 'keep')
  const cut = analysis.filter(a => a.keep_or_cut === 'cut')
  const defer = analysis.filter(a => a.keep_or_cut === 'defer')

  const scopeReduction = Math.round((cut.length / analysis.length) * 100)
  const savedHours = cut.reduce((sum, f) => sum + (buildCost[f.feature] || rng.nextInt(5, 30)), 0)

  const summary = analysis.length + ' features analyzed: ' + keep.length + ' keep, ' + cut.length + ' cut, ' + defer.length + ' defer. Scope reduced by ' + scopeReduction + '%. Estimated ' + savedHours + ' build hours saved.'

  return {
    features_to_keep: keep,
    features_to_cut: cut,
    features_to_defer: defer,
    scope_reduction_pct: scopeReduction,
    saved_build_hours: savedHours,
    summary,
  }
}

function formatScopeKillerReport(input: ScopeKillerInput, result: ScopeKillerResult): string {
  const lines: string[] = []

  lines.push('## Scope Killer Analysis')
  lines.push('')
  lines.push('**CVP:** ' + (input.core_value_proposition || 'Not specified'))
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Features to KEEP (Build Now)')
  lines.push('| Feature | Value | Effort | Rationale |')
  lines.push('|---------|-------|--------|------------|')
  for (const f of result.features_to_keep) {
    lines.push('| ' + f.feature + ' | ' + f.value_score + '/100 | ' + f.effort_score + '/100 | ' + f.rationale + ' |')
  }
  lines.push('')

  if (result.features_to_cut.length > 0) {
    lines.push('### Features to CUT (Do Not Build)')
    lines.push('| Feature | Value | Effort | Rationale |')
    lines.push('|---------|-------|--------|------------|')
    for (const f of result.features_to_cut) {
      lines.push('| ' + f.feature + ' | ' + f.value_score + '/100 | ' + f.effort_score + '/100 | ' + f.rationale + ' |')
    }
    lines.push('')
  }

  if (result.features_to_defer.length > 0) {
    lines.push('### Features to DEFER (Build Later)')
    lines.push('| Feature | Value | Effort | Rationale |')
    lines.push('|---------|-------|--------|------------|')
    for (const f of result.features_to_defer) {
      lines.push('| ' + f.feature + ' | ' + f.value_score + '/100 | ' + f.effort_score + '/100 | ' + f.rationale + ' |')
    }
    lines.push('')
  }

  lines.push('### Impact Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Scope Reduction | ' + result.scope_reduction_pct + '% |')
  lines.push('| Build Hours Saved | ~' + result.saved_build_hours + ' hrs |')
  lines.push('| Features in MVP | ' + result.features_to_keep.length + '/' + (result.features_to_keep.length + result.features_to_cut.length + result.features_to_defer.length) + ' |')
  lines.push('')

  lines.push('### Minimalist Mantra')
  lines.push('"If you are not embarrassed by the first version of your product, you have launched too late." — Reid Hoffman')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 5: COMMUNITY BUILDER STRATEGY ====================

function designCommunityStrategy(input: CommunityBuilderInput): CommunityStrategyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const niche = input.niche_audience || 'solo founders'
  const platforms = input.platform_preferences || ['twitter', 'discord', 'newsletter']
  const contentFormat = input.content_format || 'short_form'
  const stage = input.launch_stage || 'pre_launch'
  const resources = input.resources_available || {}
  const hoursPerWeek = resources.hours_per_week || 10
  const budgetMonth = resources.budget_usd_month || 50

  const primaryPlatform = platforms[0] || 'twitter'

  const allTactics: Record<string, CommunityTactic[]> = {
    twitter: [
      { tactic: 'Build in Public Threads', platform: 'Twitter/X', effort: 'low', expected_impact: 'high', timeline: 'Week 1-2', description: 'Share daily progress, metrics, and learnings. Use thread format for depth.' },
      { tactic: 'Engage with Niche Influencers', platform: 'Twitter/X', effort: 'low', expected_impact: 'medium', timeline: 'Ongoing', description: 'Reply thoughtfully to 5-10 niche thought leaders daily. Add value, pitch nothing.' },
      { tactic: 'Weekly Wins Thread', platform: 'Twitter/X', effort: 'low', expected_impact: 'medium', timeline: 'Weekly', description: 'Every Friday: share one win, one lesson, one metric. Builds narrative.' },
    ],
    discord: [
      { tactic: 'Launch Niche Community Server', platform: 'Discord', effort: 'medium', expected_impact: 'high', timeline: 'Week 1-3', description: 'Create focused channels around your niche. Start with 3-5 channels max.' },
      { tactic: 'Weekly Office Hours', platform: 'Discord', effort: 'medium', expected_impact: 'high', timeline: 'Weekly', description: 'Host 1-hour voice/video AMA. Record and repurpose as content.' },
      { tactic: 'Member Spotlight Program', platform: 'Discord', effort: 'low', expected_impact: 'medium', timeline: 'Monthly', description: 'Feature one community member per month. Creates loyalty and UGC.' },
    ],
    newsletter: [
      { tactic: 'Weekly Value Newsletter', platform: 'Substack/Beehiiv', effort: 'medium', expected_impact: 'high', timeline: 'Week 1 ongoing', description: 'One actionable insight per week. Build email list as owned audience.' },
      { tactic: 'Curated Resource Roundup', platform: 'Substack/Beehiiv', effort: 'low', expected_impact: 'medium', timeline: 'Bi-weekly', description: 'Share 5 curated tools/articles with your commentary. Low effort, high value.' },
      { tactic: 'Founder Story Interviews', platform: 'Substack/Beehiiv', effort: 'high', expected_impact: 'high', timeline: 'Monthly', description: 'Interview complementary founders. Cross-pollinates audiences.' },
    ],
    github: [
      { tactic: 'Open Source a Utility', platform: 'GitHub', effort: 'high', expected_impact: 'high', timeline: 'Month 1-2', description: 'Release a small tool that demonstrates expertise. Stars = credibility.' },
      { tactic: 'Contributor Onboarding', platform: 'GitHub', effort: 'medium', expected_impact: 'medium', timeline: 'Month 2+', description: 'Add good-first-issue guides. Community contributions compound.' },
    ],
    youtube: [
      { tactic: 'Tutorial/How-To Series', platform: 'YouTube', effort: 'high', expected_impact: 'high', timeline: 'Month 1-3', description: 'One 5-10 min tutorial per week. Long-term SEO asset.' },
      { tactic: 'Short-Form Clips', platform: 'YouTube Shorts', effort: 'medium', expected_impact: 'medium', timeline: 'Week 2+', description: 'Repurpose long-form into 60-sec clips for discovery.' },
    ],
  }

  const tactics: CommunityTactic[] = []
  for (const platform of platforms) {
    const platformTactics = allTactics[platform.toLowerCase()] || allTactics.twitter
    const numTactics = hoursPerWeek < 5 ? 1 : hoursPerWeek < 15 ? 2 : 3
    tactics.push(...platformTactics.slice(0, numTactics))
  }

  if (tactics.length === 0) {
    tactics.push(allTactics.twitter[0])
  }

  const stageTargets: Record<string, number[]> = {
    pre_launch: [50, 200, 500],
    launch: [100, 500, 1000],
    growth: [500, 2000, 5000],
    mature: [1000, 5000, 10000],
  }
  const targets = stageTargets[stage] || stageTargets.pre_launch

  const growthMilestones: GrowthMilestone[] = [
    { milestone: 'First 100 members', target_size: targets[0], timeline: 'Month 1' },
    { milestone: 'Critical mass (engaged core)', target_size: targets[1], timeline: 'Month 2-3' },
    { milestone: 'Self-sustaining growth', target_size: targets[2], timeline: 'Month 4-6' },
  ]

  const contentCalendar: string[] = []
  if (contentFormat === 'short_form' || contentFormat === 'mixed') {
    contentCalendar.push('Monday: Share a quick tip or insight (2-3 sentences)')
    contentCalendar.push('Wednesday: Ask a question to spark discussion')
    contentCalendar.push('Friday: Share a win, metric, or lesson learned')
  }
  if (contentFormat === 'long_form' || contentFormat === 'mixed') {
    contentCalendar.push('Tuesday: Deep-dive article or thread (1000+ words)')
    contentCalendar.push('Thursday: Curated resources with commentary')
  }
  if (contentFormat === 'video') {
    contentCalendar.push('Tuesday: Tutorial or how-to video (5-10 min)')
    contentCalendar.push('Friday: Community update or behind-the-scenes')
  }
  if (contentCalendar.length === 0) {
    contentCalendar.push('Monday: Share progress update')
    contentCalendar.push('Wednesday: Engage with community questions')
    contentCalendar.push('Friday: Share a lesson learned')
  }

  const platformNames = platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ')
  const strategyName = niche.charAt(0).toUpperCase() + niche.slice(1) + ' Community via ' + platformNames

  const summary = 'Strategy: ' + strategyName + '. ' + tactics.length + ' tactics across ' + platforms.length + ' platforms. Target: ' + targets[0] + ' members in Month 1, ' + targets[2] + ' by Month 6. Time investment: ' + hoursPerWeek + ' hrs/week. Budget: $' + budgetMonth + '/mo.'

  return {
    strategy_name: strategyName,
    primary_platform: primaryPlatform.charAt(0).toUpperCase() + primaryPlatform.slice(1),
    tactics,
    growth_milestones: growthMilestones,
    content_calendar: contentCalendar,
    summary,
  }
}

function formatCommunityStrategyReport(input: CommunityBuilderInput, result: CommunityStrategyResult): string {
  const lines: string[] = []

  lines.push('## Community Builder Strategy')
  lines.push('')
  lines.push('**' + result.strategy_name + '**')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Recommended Tactics')
  lines.push('| # | Tactic | Platform | Effort | Impact | Timeline |')
  lines.push('|---|--------|----------|--------|--------|----------|')
  let idx = 1
  for (const t of result.tactics) {
    lines.push('| ' + idx + ' | ' + t.tactic + ' | ' + t.platform + ' | ' + t.effort.toUpperCase() + ' | ' + t.expected_impact.toUpperCase() + ' | ' + t.timeline + ' |')
    idx++
  }
  lines.push('')

  lines.push('### Growth Milestones')
  for (const m of result.growth_milestones) {
    lines.push('- **' + m.milestone + '** — ' + m.target_size + ' members by ' + m.timeline)
  }
  lines.push('')

  lines.push('### Content Calendar')
  for (const c of result.content_calendar) {
    lines.push('- ' + c)
  }
  lines.push('')

  lines.push('### Community-First Principles')
  lines.push('- Give value 10x before asking for anything — be the most helpful person in the room')
  lines.push('- Quality > quantity — 100 true fans beat 10,000 passive followers')
  lines.push('- Create rituals: weekly threads, monthly AMAs, quarterly challenges')
  lines.push('- Highlight members, not yourself — community belongs to them')
  lines.push('- Ship fast and share progress — people join journeys, not finished products')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 6: PRICING PSYCHOLOGY ADVISOR ====================

function advisePricing(input: PricingPsychologyInput): PricingPsychologyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const productType = (input.product_type || 'digital_product').toLowerCase()
  const segment = (input.target_segment || 'solo professionals').toLowerCase()
  const competitorPrices = input.competitor_prices || []
  const valueDelivered = input.value_delivered_usd || 100
  const sensitivity = input.price_sensitivity || 'medium'

  const avgCompetitor = competitorPrices.length > 0
    ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
    : 50

  const sensitivityMultiplier = sensitivity === 'low' ? 1.3 : sensitivity === 'high' ? 0.7 : 1.0

  // Anchor price: 2-3x the recommended price
  const anchorPrice = Math.round(avgCompetitor * rng.nextFloat(2.0, 3.0) * sensitivityMultiplier)

  const recommendedTiers: PricingTier[] = []

  // Starter tier
  const starterPrice = Math.round(avgCompetitor * rng.nextFloat(0.4, 0.6) * sensitivityMultiplier)
  recommendedTiers.push({
    tier_name: 'Starter',
    price: Math.max(7, starterPrice),
    anchor: 'Entry point — removes barrier to try',
    psychology: 'Low anchor creates commitment. Once users start, upgrading is natural.',
    target_segment: 'Price-sensitive ' + segment,
  })

  // Pro tier (recommended)
  const proPrice = Math.round(avgCompetitor * rng.nextFloat(0.9, 1.2) * sensitivityMultiplier)
  recommendedTiers.push({
    tier_name: 'Pro',
    price: Math.max(19, proPrice),
    anchor: 'Most popular — positioned as the smart choice',
    psychology: 'Decoy effect: Starter makes Pro look reasonable. Anchor makes Pro look like a deal.',
    target_segment: 'Core ' + segment + ' (target 60% of customers here)',
  })

  // Premium tier
  const premiumPrice = Math.round(avgCompetitor * rng.nextFloat(1.5, 2.0) * sensitivityMultiplier)
  recommendedTiers.push({
    tier_name: 'Premium',
    price: Math.max(49, premiumPrice),
    anchor: 'High-end option — makes Pro look affordable',
    psychology: 'Price anchoring: Premium sets reference point. Pro becomes the "sensible middle."',
    target_segment: 'High-value ' + segment + ' with advanced needs',
  })

  // Perceived value score
  const valueRatio = valueDelivered / recommendedTiers[1].price
  const perceivedValue = clamp(Math.round(valueRatio * 20 + rng.nextInt(-10, 10)), 20, 98)

  const psychologyTips: string[] = []
  psychologyTips.push('Always show the highest tier first — it sets the anchor for everything below')
  psychologyTips.push('Use "most popular" badge on Pro tier — social proof drives 60%+ to middle option')
  psychologyTips.push('Show annual savings (20% off) — makes monthly look expensive by comparison')
  psychologyTips.push('Price ending in 7 or 9 ($47, $97) signals value pricing vs round numbers')
  psychologyTips.push('Include one "obviously wrong" option to make your target tier look ideal')
  if (sensitivity === 'high') {
    psychologyTips.push('High price sensitivity: offer a free trial or money-back guarantee to reduce risk')
  }
  if (competitorPrices.length > 0) {
    psychologyTips.push('Position against $' + Math.round(avgCompetitor) + ' competitor average — show your value premium')
  }
  psychologyTips.push('Raise prices as you add value — early adopters expect to pay less, new customers pay more')

  const summary = '3-tier pricing: $' + recommendedTiers[0].price + ' / $' + recommendedTiers[1].price + ' / $' + recommendedTiers[2].price + '. Anchor at $' + anchorPrice + '. Perceived value: ' + perceivedValue + '/100. Strategy: decoy effect + anchoring on Pro tier.'

  return {
    recommended_tiers: recommendedTiers,
    anchor_price: anchorPrice,
    price_anchor_strategy: 'Display Premium ($' + anchorPrice + ') first, then Pro, then Starter. The high anchor makes Pro feel like a bargain.',
    perceived_value_score: perceivedValue,
    psychology_tips: psychologyTips,
    summary,
  }
}

function formatPricingPsychologyReport(input: PricingPsychologyInput, result: PricingPsychologyResult): string {
  const lines: string[] = []

  lines.push('## Pricing Psychology Analysis')
  lines.push('')
  lines.push('**' + (input.product_type || 'Digital Product') + '** → ' + (input.target_segment || 'Solo Professionals'))
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Recommended Pricing Tiers')
  lines.push('| Tier | Price | Psychology | Target Segment |')
  lines.push('|------|-------|------------|----------------|')
  for (const t of result.recommended_tiers) {
    lines.push('| ' + t.tier_name + ' | $' + t.price + ' | ' + t.psychology + ' | ' + t.target_segment + ' |')
  }
  lines.push('')

  lines.push('### Anchor Strategy')
  lines.push(result.price_anchor_strategy)
  lines.push('')

  lines.push('### Perceived Value Score: ' + result.perceived_value_score + '/100')
  lines.push('(Ratio of value delivered vs price paid — higher = stronger value perception)')
  lines.push('')

  lines.push('### Psychology Tips')
  for (const tip of result.psychology_tips) {
    lines.push('- ' + tip)
  }
  lines.push('')

  lines.push('### Value-Based Pricing Formula')
  lines.push('| Component | Calculation |')
  lines.push('|-----------|-------------|')
  lines.push('| Value Delivered | $' + (input.value_delivered_usd || 100) + '/customer |')
  lines.push('| Target Price | 10-25% of value delivered |')
  lines.push('| Optimal Range | $' + Math.round((input.value_delivered_usd || 100) * 0.1) + ' - $' + Math.round((input.value_delivered_usd || 100) * 0.25) + ' |')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 7: SUSTAINABILITY CALCULATOR ====================

function calculateSustainability(input: SustainabilityInput): SustainabilityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const burn = input.monthly_burn_usd || 2000
  const savings = input.current_savings_usd || 10000
  const revenueRate = input.revenue_rate_usd_month || 0
  const fixedCosts = input.fixed_costs_usd_month || 1500
  const growthRate = input.growth_rate || 0.1

  const monthlyProjections: MonthlySnapshot[] = []
  let remaining = savings
  let cumulativeRevenue = revenueRate
  let breakEvenMonth: number | null = null

  for (let m = 1; m <= 24; m++) {
    const revenue = Math.round(cumulativeRevenue)
    const costs = Math.round(fixedCosts + burn * (1 + growthRate * 0.1 * m))
    const netBurn = costs - revenue
    remaining = remaining - netBurn

    monthlyProjections.push({
      month: m,
      revenue,
      costs,
      net_burn: netBurn,
      remaining_savings: Math.max(0, remaining),
    })

    if (revenue >= costs && breakEvenMonth === null) {
      breakEvenMonth = m
    }

    cumulativeRevenue = cumulativeRevenue * (1 + growthRate)

    if (remaining <= 0) break
  }

  const runwayMonths = monthlyProjections.length
  const lastSnapshot = monthlyProjections[monthlyProjections.length - 1]

  let survivalStatus: SustainabilityResult['survival_status'] = 'safe'
  if (lastSnapshot.remaining_savings <= 0) survivalStatus = 'runway_depleted'
  else if (lastSnapshot.remaining_savings < burn * 3) survivalStatus = 'critical'
  else if (lastSnapshot.remaining_savings < burn * 6) survivalStatus = 'caution'
  else survivalStatus = 'safe'

  const metricsToHit: MetricToHit[] = [
    { metric: 'Monthly Revenue', target: Math.round(burn * 0.5), deadline: 'Month ' + Math.min(3, runwayMonths) },
    { metric: 'Monthly Revenue', target: Math.round(burn * 1.0), deadline: 'Month ' + Math.min(6, runwayMonths) },
    { metric: 'MRR Growth Rate', target: Math.round(growthRate * 100), deadline: 'Sustained monthly' },
    { metric: 'Revenue Runway Coverage', target: 6, deadline: 'Within 12 months' },
  ]

  const recommendations: string[] = []
  if (survivalStatus === 'critical' || survivalStatus === 'runway_depleted') {
    recommendations.push('URGENT: Reduce burn immediately — cut non-essential costs by 30-50%')
    recommendations.push('Focus 100% on revenue-generating activities — pause all non-essential building')
    recommendations.push('Consider bridge income (freelancing, consulting) to extend runway')
  }
  if (revenueRate === 0) {
    recommendations.push('No revenue yet — aim for first dollar within 2 weeks (pre-sale, beta pricing)')
  }
  recommendations.push('Track weekly burn rate — monthly reviews are too slow for startups')
  if (growthRate < 0.15) {
    recommendations.push('Growth rate below 15% — experiment with new channels or pricing')
  }
  recommendations.push('Set a "point of no return" date — if no revenue by then, reassess')
  recommendations.push('Build 6-month emergency fund before scaling — survive first, grow second')

  const breakEvenText = breakEvenMonth ? 'Month ' + breakEvenMonth : 'Not projected within 24 months'
  const summary = 'Runway: ' + runwayMonths + ' months. Break-even: ' + breakEvenText + '. Status: ' + survivalStatus.toUpperCase() + '. Remaining at Month ' + runwayMonths + ': $' + Math.round(lastSnapshot.remaining_savings).toLocaleString() + '.'

  return {
    runway_months: runwayMonths,
    break_even_month: breakEvenMonth,
    survival_status: survivalStatus,
    monthly_projections: monthlyProjections.slice(0, 12),
    metrics_to_hit: metricsToHit,
    recommendations,
    summary,
  }
}

function formatSustainabilityReport(input: SustainabilityInput, result: SustainabilityResult): string {
  const lines: string[] = []

  lines.push('## Sustainability & Runway Calculator')
  lines.push('')
  lines.push('**Burn:** $' + (input.monthly_burn_usd || 2000) + '/mo | **Savings:** $' + (input.current_savings_usd || 10000).toLocaleString() + ' | **Revenue:** $' + (input.revenue_rate_usd_month || 0) + '/mo')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  const statusTag = result.survival_status === 'safe' ? 'SAFE' : result.survival_status === 'caution' ? 'CAUTION' : result.survival_status === 'critical' ? 'CRITICAL' : 'DEPLETED'
  lines.push('### Status: ' + statusTag)
  lines.push('')

  lines.push('### Monthly Projections (12-Month View)')
  lines.push('| Month | Revenue | Costs | Net Burn | Remaining Savings |')
  lines.push('|-------|---------|-------|----------|-------------------|')
  for (const m of result.monthly_projections) {
    lines.push('| M' + m.month + ' | $' + m.revenue.toLocaleString() + ' | $' + m.costs.toLocaleString() + ' | $' + m.net_burn.toLocaleString() + ' | $' + m.remaining_savings.toLocaleString() + ' |')
  }
  lines.push('')

  lines.push('### Metrics to Hit')
  for (const mt of result.metrics_to_hit) {
    const targetDisplay = mt.metric.includes('Rate') ? mt.target + '%' : '$' + mt.target.toLocaleString()
    lines.push('- **' + mt.metric + '**: ' + targetDisplay + ' by ' + mt.deadline)
  }
  lines.push('')

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')

  lines.push('### Survival Rules')
  lines.push('- "Survive before growing" — a dead business has no growth trajectory')
  lines.push('- Track runway weekly, not monthly — surprises kill startups')
  lines.push('- Cut costs before raising prices — faster to execute')
  lines.push('- Revenue solves most problems — prioritize it above all else')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 8: PIVOT OR PERSEVERE DECIDER ====================

function decidePivotOrPersevere(input: PivotPersevereInput): PivotPersevereResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const current = input.current_metrics || { mrr: 500, users: 50, retention: 0.6, nps: 20 }
  const targets = input.targets || { mrr: 5000, users: 500, retention: 0.8, nps: 40 }
  const timeInvested = input.time_invested_months || 6
  const feedback = input.market_feedback || ['some interest', 'slow growth', 'positive early signals']
  const sunkCostBias = input.sunk_cost_bias_level || 'medium'

  const metricGaps: MetricGap[] = []
  for (const key of Object.keys(targets)) {
    const currentVal = current[key] || 0
    const targetVal = targets[key]
    const gap = targetVal !== 0 ? Math.round(((currentVal - targetVal) / targetVal) * 100) : 0
    const onTrack = currentVal >= targetVal * 0.5
    metricGaps.push({ metric: key, current: currentVal, target: targetVal, gap_pct: gap, on_track: onTrack })
  }

  const onTrackCount = metricGaps.filter(m => m.on_track).length
  const totalMetrics = metricGaps.length
  const onTrackRatio = onTrackCount / Math.max(1, totalMetrics)

  // Analyze feedback signals
  const positiveSignals = feedback.filter(f => {
    const fl = f.toLowerCase()
    return fl.includes('positive') || fl.includes('growing') || fl.includes('demand') || fl.includes('love') || fl.includes('pay') || fl.includes('yes')
  }).length
  const negativeSignals = feedback.filter(f => {
    const fl = f.toLowerCase()
    return fl.includes('slow') || fl.includes('no') || fl.includes('not') || fl.includes('struggle') || fl.includes('decline') || fl.includes('quit')
  }).length

  // Sunk cost adjustment
  const sunkCostPenalty = sunkCostBias === 'high' ? 0.15 : sunkCostBias === 'medium' ? 0.05 : 0

  // Decision logic
  let decision: PivotPersevereResult['decision'] = 'persevere'
  let confidence = 0
  const reasoning: string[] = []
  const pivotOptions: string[] = []
  const actionItems: string[] = []

  if (onTrackRatio >= 0.75 && positiveSignals >= negativeSignals) {
    decision = 'persevere'
    confidence = clamp(Math.round((onTrackRatio * 70 + positiveSignals * 10) * (1 - sunkCostPenalty)), 50, 95)
    reasoning.push('Strong metric performance: ' + onTrackCount + '/' + totalMetrics + ' metrics on track')
    reasoning.push('Positive market feedback: ' + positiveSignals + ' positive vs ' + negativeSignals + ' negative signals')
    reasoning.push('Current trajectory supports continued execution')
    actionItems.push('Double down on what is working — increase investment in top-performing channel')
    actionItems.push('Set 3-month checkpoint: if metrics still on track, continue scaling')
    actionItems.push('Document winning playbook — replicate across other channels')
  } else if (onTrackRatio < 0.25 || negativeSignals > positiveSignals + 2) {
    decision = 'pivot'
    confidence = clamp(Math.round(((1 - onTrackRatio) * 60 + negativeSignals * 12) * (1 - sunkCostPenalty)), 40, 90)
    reasoning.push('Weak metric performance: only ' + onTrackCount + '/' + totalMetrics + ' metrics on track')
    reasoning.push('Negative market feedback: ' + negativeSignals + ' negative vs ' + positiveSignals + ' positive signals')
    reasoning.push('Time invested (' + timeInvested + ' months) without traction signals need for change')
    pivotOptions.push('Problem pivot: same audience, different problem (keep community, change solution)')
    pivotOptions.push('Segment pivot: same product, different audience (keep solution, change who)')
    pivotOptions.push('Channel pivot: same product/audience, different distribution')
    pivotOptions.push('Technology pivot: same problem, different solution approach')
    actionItems.push('Run 10 customer interviews to identify what is not working')
    actionItems.push('Test one pivot direction with a 2-week experiment')
    actionItems.push('Set clear kill criteria before starting pivot experiment')
  } else {
    decision = 'pause_and_reassess'
    confidence = clamp(Math.round((0.5 - Math.abs(0.5 - onTrackRatio)) * 100 + 30), 30, 70)
    reasoning.push('Mixed signals: ' + onTrackCount + '/' + totalMetrics + ' metrics on track — not clearly failing or succeeding')
    reasoning.push('Feedback is ambiguous: ' + positiveSignals + ' positive, ' + negativeSignals + ' negative')
    reasoning.push('Time invested (' + timeInvested + ' months) warrants one more focused experiment')
    actionItems.push('Identify the single biggest bottleneck metric')
    actionItems.push('Design a 30-day focused experiment to move that metric')
    actionItems.push('Set a hard deadline: if metric does not improve 30%+ in 30 days, pivot')
    actionItems.push('Talk to 5 churned or non-converting users for qualitative insight')
  }

  if (sunkCostBias === 'high') {
    reasoning.push('WARNING: High sunk cost bias detected — decision may be influenced by ' + timeInvested + ' months invested. Evaluate as if you just started today.')
  }

  const decisionDisplay = decision.toUpperCase().replace(/_/g, ' ')
  const summary = 'Decision: ' + decisionDisplay + ' (confidence: ' + confidence + '%). ' + onTrackCount + '/' + totalMetrics + ' metrics on track. ' + reasoning[0]

  return {
    decision,
    confidence,
    metric_gaps: metricGaps,
    reasoning,
    pivot_options: pivotOptions,
    action_items: actionItems,
    summary,
  }
}

function formatPivotPersevereReport(input: PivotPersevereInput, result: PivotPersevereResult): string {
  const lines: string[] = []

  lines.push('## Pivot or Persevere Decision')
  lines.push('')
  lines.push('**Time Invested:** ' + (input.time_invested_months || 6) + ' months | **Sunk Cost Bias:** ' + (input.sunk_cost_bias_level || 'medium').toUpperCase())
  lines.push('')
  lines.push('### Decision: ' + result.decision.toUpperCase().replace(/_/g, ' ') + ' (' + result.confidence + '% confidence)')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Metric Gap Analysis')
  lines.push('| Metric | Current | Target | Gap | On Track |')
  lines.push('|--------|---------|--------|-----|----------|')
  for (const m of result.metric_gaps) {
    const trackTag = m.on_track ? 'YES' : 'NO'
    lines.push('| ' + m.metric + ' | ' + m.current + ' | ' + m.target + ' | ' + m.gap_pct + '% | ' + trackTag + ' |')
  }
  lines.push('')

  lines.push('### Reasoning')
  for (const r of result.reasoning) {
    lines.push('- ' + r)
  }
  lines.push('')

  if (result.pivot_options.length > 0) {
    lines.push('### Pivot Options (if pivoting)')
    for (const p of result.pivot_options) {
      lines.push('- ' + p)
    }
    lines.push('')
  }

  lines.push('### Action Items')
  for (const a of result.action_items) {
    lines.push('- ' + a)
  }
  lines.push('')

  lines.push('### Decision Framework')
  lines.push('- Persevere: 75%+ metrics on track AND positive feedback signals')
  lines.push('- Pivot: <25% metrics on track OR overwhelmingly negative feedback')
  lines.push('- Pause & Reassess: mixed signals — run one more focused experiment')
  lines.push('- Ignore sunk costs: "If you started today with no prior investment, would you choose this path?"')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Community-First Validator
  tools.register(defineTool({
    name: 'community_first_validator',
    description: 'Validates whether you have found the right community before building. Scores community fit (0-100) based on size, engagement evidence, competitive landscape, and idea-community alignment. Returns readiness level, signal analysis, gaps, and community-first recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: idea_description, target_community, community_size, engagement_evidence[], competitor_analysis[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CommunityValidatorInput = JSON.parse(args.input_data)
      const result = validateCommunityFit(input)
      return formatCommunityValidatorReport(input, result)
    }
  }))

  // Tool 2: Profit-First Planner
  tools.register(defineTool({
    name: 'profit_first_planner',
    description: 'Plans path to first dollar revenue with minimum features. Defines the minimum viable offer, pricing model recommendation, revenue projections (Month 1/3/6), milestones to $1K MRR, and risk factors. Optimized for solo founders who need to generate revenue before building.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: idea, target_customer, willingness_to_pay (low|medium|high), minimum_viable_offer, pricing_model (one_time|subscription|usage_based|freemium|hybrid)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ProfitFirstInput = JSON.parse(args.input_data)
      const result = planProfitFirst(input)
      return formatProfitFirstReport(input, result)
    }
  }))

  // Tool 3: Lean Validation Framework
  tools.register(defineTool({
    name: 'lean_validation_framework',
    description: 'Creates validation experiments to test assumptions before building. Generates up to 5 experiments (surveys, landing pages, smoke tests, interviews, prototypes) within budget and time constraints. Prioritizes by cost-effectiveness and risk mitigation coverage.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: assumptions[], risk_level (low|medium|high), validation_budget, time_constraint_days, experiment_types[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: LeanValidationInput = JSON.parse(args.input_data)
      const result = createValidationPlan(input)
      return formatValidationReport(input, result)
    }
  }))

  // Tool 4: Scope Killer
  tools.register(defineTool({
    name: 'scope_killer',
    description: 'Identifies features to cut/not-build to stay minimal. Analyzes each feature against your core value proposition for value and effort scores. Returns keep/cut/defer decisions with rationale, scope reduction percentage, and estimated build hours saved.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: feature_list[], core_value_proposition, user_effort_per_feature{}, build_cost_per_feature{}', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ScopeKillerInput = JSON.parse(args.input_data)
      const result = analyzeScope(input)
      return formatScopeKillerReport(input, result)
    }
  }))

  // Tool 5: Community Builder Strategy
  tools.register(defineTool({
    name: 'community_builder_strategy',
    description: 'Designs strategy to grow an engaged community around your product. Recommends platform-specific tactics (Twitter, Discord, Newsletter, GitHub, YouTube), growth milestones, and a content calendar. Calibrated to your available hours/week and budget.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: niche_audience, platform_preferences[], content_format, launch_stage (pre_launch|launch|growth|mature), resources_available{hours_per_week, budget_usd_month, team_size}', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CommunityBuilderInput = JSON.parse(args.input_data)
      const result = designCommunityStrategy(input)
      return formatCommunityStrategyReport(input, result)
    }
  }))

  // Tool 6: Pricing Psychology Advisor
  tools.register(defineTool({
    name: 'pricing_psychology_advisor',
    description: 'Advises on pricing based on value perception, willingness to pay, and anchoring. Generates 3-tier pricing (Starter/Pro/Premium) with decoy effect, anchor pricing strategy, perceived value score, and psychology tips for value-based pricing.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_type, target_segment, competitor_prices[], value_delivered_usd, price_sensitivity (low|medium|high)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PricingPsychologyInput = JSON.parse(args.input_data)
      const result = advisePricing(input)
      return formatPricingPsychologyReport(input, result)
    }
  }))

  // Tool 7: Sustainability Calculator
  tools.register(defineTool({
    name: 'sustainability_calculator',
    description: 'Calculates how long you can survive on current runway and what metrics you need to hit. Projects monthly revenue, costs, net burn, and remaining savings for 12 months. Returns runway months, break-even point, survival status, and actionable recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: monthly_burn_usd, current_savings_usd, revenue_rate_usd_month, fixed_costs_usd_month, growth_rate', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: SustainabilityInput = JSON.parse(args.input_data)
      const result = calculateSustainability(input)
      return formatSustainabilityReport(input, result)
    }
  }))

  // Tool 8: Pivot or Persevere Decider
  tools.register(defineTool({
    name: 'pivot_or_persevere_decider',
    description: 'Data-driven framework to decide whether to pivot or continue. Compares current metrics against targets, analyzes market feedback signals, adjusts for sunk cost bias, and returns a clear decision (persevere/pivot/pause) with confidence level, reasoning, and action items.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: current_metrics{}, targets{}, time_invested_months, market_feedback[], sunk_cost_bias_level (low|medium|high)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PivotPersevereInput = JSON.parse(args.input_data)
      const result = decidePivotOrPersevere(input)
      return formatPivotPersevereReport(input, result)
    }
  }))

  console.log('[dsh-tool-minimalist] Loaded v' + VERSION + ' - Minimalist Entrepreneur Toolkit with 8 tools')
  console.log('  Tools: community_first_validator, profit_first_planner, lean_validation_framework, scope_killer, community_builder_strategy, pricing_psychology_advisor, sustainability_calculator, pivot_or_persevere_decider')
}
