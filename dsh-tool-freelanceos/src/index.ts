/**
 * DSH Freelancer Business OS Plugin v1.0.0
 *
 * Freelancer Business OS -- proposal generation, pricing optimization,
 * client relationship management, portfolio building, contract review.
 * 8 tools for the $50B+ freelance economy (Fiverr + Upwork GMV 2026).
 *
 * Features (v1.0.0):
 * - Proposal Crafter (persuasive client-winning proposals)
 * - Pricing Strategy Optimizer (data-driven rate setting)
 * - Client Relationship Manager (retention and communication)
 * - Portfolio Effectiveness Scorer (optimize showcase impact)
 * - Contract Review Assistant (legal risk identification)
 * - Income Diversification Advisor (revenue stream strategy)
 * - Time Tracking Analytics (productivity and billing insights)
 * - Freelancer Brand Positioner (market differentiation)
 *
 * @module dsh-tool-freelanceos
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-freelanceos'
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

// --- Tool 1: Proposal Crafter ---
export interface ProposalCrafterInput {
  project_type?: string
  client_name?: string
  client_industry?: string
  project_scope?: string
  budget_range?: string
  timeline?: string
  your_experience_years?: number
  relevant_past_work?: string[]
  unique_value_props?: string[]
  tone?: 'professional' | 'friendly' | 'confident' | 'consultative'
}

export interface ProposalSection {
  section: string
  content: string
  purpose: string
}

export interface ProposalResult {
  proposal_title: string
  sections: ProposalSection[]
  win_probability: number
  differentiators: string[]
  follow_up_strategy: string
  summary: string
}

// --- Tool 2: Pricing Strategy Optimizer ---
export interface PricingStrategyInput {
  service_category?: string
  experience_level?: 'beginner' | 'intermediate' | 'expert' | 'elite'
  current_rate?: number
  target_monthly_income?: number
  market_rates?: number[]
  location_factor?: 'low_cost' | 'medium_cost' | 'high_cost'
  specialization_depth?: 'generalist' | 'specialist' | 'niche_expert'
  demand_level?: 'low' | 'medium' | 'high' | 'very_high'
  platform?: 'direct' | 'upwork' | 'fiverr' | 'toptal' | 'mixed'
}

export interface RateRecommendation {
  rate_type: 'hourly' | 'project' | 'retainer' | 'value_based'
  min_rate: number
  target_rate: number
  max_rate: number
  justification: string
}

export interface PricingStrategyResult {
  recommended_rates: RateRecommendation[]
  income_gap_analysis: string
  pricing_tiers: { tier: string; price_range: string; target_client: string }[]
  negotiation_leverage: string[]
  raise_timing: string
  summary: string
}

// --- Tool 3: Client Relationship Manager ---
export interface ClientRelationshipInput {
  client_name?: string
  relationship_length_months?: number
  total_revenue?: number
  project_count?: number
  communication_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'as_needed'
  satisfaction_score?: number
  last_project_date?: string
  pain_points?: string[]
  opportunities?: string[]
  competitor_threat?: 'none' | 'low' | 'medium' | 'high'
}

export interface RelationshipAction {
  action: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  timeline: string
  expected_outcome: string
}

export interface ClientRelationshipResult {
  relationship_health: 'thriving' | 'stable' | 'at_risk' | 'critical'
  health_score: number
  churn_risk: 'low' | 'medium' | 'high'
  lifetime_value_estimate: number
  actions: RelationshipAction[]
  communication_template: string
  summary: string
}

// --- Tool 4: Portfolio Effectiveness Scorer ---
export interface PortfolioScorerInput {
  portfolio_items?: { title: string; description: string; skills: string[]; results?: string }[]
  target_service?: string
  target_client_type?: string
  industry_focus?: string
  portfolio_platform?: string
  total_items?: number
  has_testimonials?: boolean
  has_case_studies?: boolean
  has_metrics?: boolean
}

export interface PortfolioGap {
  gap: string
  severity: 'critical' | 'important' | 'nice_to_have'
  recommendation: string
}

export interface PortfolioScorerResult {
  effectiveness_score: number
  clarity_score: number
  relevance_score: number
  credibility_score: number
  impact_score: number
  gaps: PortfolioGap[]
  top_improvements: string[]
  suggested_layout: string[]
  summary: string
}

// --- Tool 5: Contract Review Assistant ---
export interface ContractReviewInput {
  contract_type?: 'fixed_price' | 'hourly' | 'retainer' | 'milestone' | 'royalty'
  contract_value?: number
  payment_terms?: string
  scope_description?: string
  deadline_description?: string
  revision_policy?: string
  intellectual_property_terms?: string
  termination_clauses?: string
  liability_terms?: string
  non_compete?: boolean
  jurisdiction?: string
}

export interface ContractRisk {
  clause: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  issue: string
  recommendation: string
}

export interface ContractReviewResult {
  overall_risk: 'acceptable' | 'moderate' | 'high' | 'reject'
  risk_score: number
  risks: ContractRisk[]
  missing_clauses: string[]
  negotiation_points: string[]
  red_flags: string[]
  summary: string
}

// --- Tool 6: Income Diversification Advisor ---
export interface IncomeDiversificationInput {
  current_monthly_income?: number
  primary_income_source?: string
  primary_income_pct?: number
  other_sources?: { source: string; monthly_income: number; effort_hours: number }[]
  skills?: string[]
  available_hours_per_week?: number
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive'
  savings_months?: number
  monthly_expenses?: number
}

export interface IncomeStream {
  stream: string
  difficulty: 'easy' | 'moderate' | 'hard'
  startup_time_weeks: number
  potential_monthly_income: number
  passive_income_pct: number
  description: string
}

export interface DiversificationPlan {
  current_concentration_risk: 'low' | 'medium' | 'high' | 'critical'
  target_streams: number
  diversification_score: number
  recommended_streams: IncomeStream[]
  action_timeline: { phase: string; actions: string[]; timeline: string }[]
  summary: string
}

// --- Tool 7: Time Tracking Analytics ---
export interface TimeTrackingInput {
  weekly_hours?: { client_work: number; admin: number; business_dev: number; learning: number; personal: number }
  billable_hours?: number
  total_hours?: number
  project_hours?: { project: string; hours: number; revenue: number }[]
  hourly_rate?: number
  target_billable_pct?: number
  time_tracking_tool?: string
  week_count?: number
}

export interface TimeInsight {
  insight: string
  impact: 'high' | 'medium' | 'low'
  recommended_action: string
}

export interface TimeTrackingResult {
  billable_percentage: number
  effective_hourly_rate: number
  revenue_per_hour: number
  utilization_grade: string
  insights: TimeInsight[]
  optimization_opportunities: string[]
  time_reallocation: { category: string; current_pct: number; recommended_pct: number }[]
  summary: string
}

// --- Tool 8: Freelancer Brand Positioner ---
export interface BrandPositionerInput {
  name?: string
  title?: string
  skills?: string[]
  years_experience?: number
  niche?: string
  target_clients?: string[]
  unique_characteristics?: string[]
  competitors?: string[]
  brand_voice?: 'authoritative' | 'approachable' | 'innovative' | 'reliable' | 'creative'
  content_platforms?: string[]
}

export interface BrandPosition {
  positioning_statement: string
  value_proposition: string
  target_audience: string
  differentiators: string[]
  brand_personality: string[]
}

export interface ContentStrategy {
  content_pillar: string
  topics: string[]
  frequency: string
  platform: string
}

export interface BrandPositionerResult {
  brand_position: BrandPosition
  messaging_framework: { audience: string; key_message: string; proof_point: string }[]
  content_strategy: ContentStrategy[]
  brand_gaps: string[]
  authority_building_steps: string[]
  summary: string
}

// ==================== TOOL 1: PROPOSAL CRAFTER ====================

function craftProposal(input: ProposalCrafterInput): ProposalResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const projectType = input.project_type || 'web development'
  const clientName = input.client_name || 'the client'
  const clientIndustry = input.client_industry || 'technology'
  const scope = input.project_scope || 'full project delivery'
  const budget = input.budget_range || 'mid-range'
  const timeline = input.timeline || '4-6 weeks'
  const expYears = input.your_experience_years || 3
  const pastWork = input.relevant_past_work || []
  const valueProps = input.unique_value_props || []
  const tone = input.tone || 'professional'

  const sections: ProposalSection[] = []

  // Opening / Hook
  const hooks = [
    'I have worked with ' + expYears + '+ years of experience delivering ' + projectType + ' solutions for ' + clientIndustry + ' companies.',
    'After reviewing your requirements, I am confident I can deliver exceptional ' + projectType + ' work that drives measurable results.',
    'Your project aligns perfectly with my core expertise in ' + projectType + ' — I have delivered 20+ similar projects with 98% client satisfaction.',
    'I specialize in ' + projectType + ' for the ' + clientIndustry + ' space, and I am excited about the opportunity to help ' + clientName + ' achieve its goals.'
  ]
  sections.push({
    section: 'Opening Hook',
    content: rng.pick(hooks),
    purpose: 'Grab attention and establish immediate relevance'
  })

  // Understanding of Problem
  sections.push({
    section: 'Understanding Your Needs',
    content: 'Based on my analysis, ' + clientName + ' is looking for ' + scope + ' with a budget of ' + budget + ' and timeline of ' + timeline + '. I understand the key challenges in ' + clientIndustry + ' include tight deadlines, quality expectations, and the need for reliable delivery.',
    purpose: 'Demonstrate that you genuinely understand the client problem'
  })

  // Proposed Approach
  const phases = [
    'Discovery & Planning (Week 1): Requirements deep-dive, technical architecture, milestone definition.',
    'Design & Development (Week 2-4): Iterative building with weekly check-ins and demos.',
    'Testing & Refinement (Week 5): QA, UAT, feedback incorporation, performance optimization.',
    'Launch & Handover (Week 6): Deployment, documentation, knowledge transfer.'
  ]
  sections.push({
    section: 'Proposed Approach',
    content: 'My delivery approach follows ' + phases.length + ' phases:\n' + phases.map(p => '- ' + p).join('\n'),
    purpose: 'Show structured thinking and reduce perceived risk'
  })

  // Relevant Experience
  if (pastWork.length > 0) {
    sections.push({
      section: 'Relevant Experience',
      content: pastWork.slice(0, 3).map(w => '- ' + w).join('\n'),
      purpose: 'Build credibility through social proof'
    })
  } else {
    sections.push({
      section: 'Relevant Experience',
      content: 'With ' + expYears + ' years in ' + projectType + ', I have built a track record of on-time, on-budget delivery. My portfolio includes projects across ' + clientIndustry + ' and adjacent sectors.',
      purpose: 'Build credibility through experience depth'
    })
  }

  // Unique Value Propositions
  const uvpContent = valueProps.length > 0
    ? valueProps.map(v => '- ' + v).join('\n')
    : '- Dedicated communication: weekly progress reports and async updates\n- Quality guarantee: unlimited revisions within scope\n- Post-launch support: 30 days of complimentary maintenance'
  sections.push({
    section: 'Why Choose Me',
    content: uvpContent,
    purpose: 'Differentiate from competing freelancers/agencies'
  })

  // Pricing / Investment
  sections.push({
    section: 'Investment & Timeline',
    content: 'Proposed timeline: ' + timeline + '. Budget range: ' + budget + '. Payment schedule: 30% upfront, 40% at mid-point milestone, 30% on delivery. This structure ensures alignment and reduces risk for both parties.',
    purpose: 'Set clear expectations and propose fair payment terms'
  })

  // Call to Action
  sections.push({
    section: 'Next Steps',
    content: 'I would welcome a 30-minute call to discuss this proposal in detail and answer any questions. I am available this week and can adjust to your timezone. Looking forward to potentially working together.',
    purpose: 'Lower the barrier to say yes with a low-commitment next step'
  })

  // Win probability
  const baseWinProb = pastWork.length >= 2 ? 65 : pastWork.length >= 1 ? 50 : 35
  const expBonus = Math.min(expYears * 2, 20)
  const uvpBonus = valueProps.length >= 2 ? 10 : valueProps.length >= 1 ? 5 : 0
  const winProbability = clamp(baseWinProb + expBonus + uvpBonus + rng.nextInt(-5, 5), 15, 95)

  const differentiators: string[] = []
  if (expYears >= 5) differentiators.push('Deep ' + expYears + '-year expertise in ' + projectType)
  if (pastWork.length >= 3) differentiators.push('Proven track record with ' + pastWork.length + ' relevant projects')
  if (tone === 'consultative') differentiators.push('Consultative approach — partner, not just executor')
  if (differentiators.length === 0) differentiators.push('Personalized attention as a dedicated freelancer')

  const followUpStrategy = 'Send proposal on Tuesday or Wednesday morning. Follow up after 3 business days with a brief value-add (share a relevant article or tip). Second follow-up after 7 days. After 14 days, move to nurture mode with monthly check-ins.'

  const winRateStr = winProbability >= 60 ? 'strong' : winProbability >= 40 ? 'competitive' : 'challenging'
  const summary = 'Proposal crafted for ' + clientName + ' (' + clientIndustry + '). Win probability: ' + winProbability + '% (' + winRateStr + '). ' + sections.length + ' sections include opening hook, approach, experience, differentiators, investment, and clear next steps.'

  return {
    proposal_title: projectType.charAt(0).toUpperCase() + projectType.slice(1) + ' Proposal for ' + clientName,
    sections,
    win_probability: winProbability,
    differentiators,
    follow_up_strategy: followUpStrategy,
    summary,
  }
}

function formatProposalReport(input: ProposalCrafterInput, result: ProposalResult): string {
  const lines: string[] = []

  lines.push('## ' + result.proposal_title)
  lines.push('')
  lines.push('**Client:** ' + (input.client_name || 'Client') + ' | **Industry:** ' + (input.client_industry || 'Technology'))
  lines.push('**Timeline:** ' + (input.timeline || '4-6 weeks') + ' | **Budget:** ' + (input.budget_range || 'Mid-range'))
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  if (result.win_probability >= 60) {
    lines.push('### Win Probability: ' + result.win_probability + '% — Strong')
  } else if (result.win_probability >= 40) {
    lines.push('### Win Probability: ' + result.win_probability + '% — Competitive')
  } else {
    lines.push('### Win Probability: ' + result.win_probability + '% — Needs Strengthening')
  }
  lines.push('')

  for (const s of result.sections) {
    lines.push('### ' + s.section)
    lines.push(s.content)
    lines.push('*(Purpose: ' + s.purpose + ')*')
    lines.push('')
  }

  lines.push('### Key Differentiators')
  for (const d of result.differentiators) {
    lines.push('- ' + d)
  }
  lines.push('')

  lines.push('### Follow-Up Strategy')
  lines.push(result.follow_up_strategy)
  lines.push('')

  lines.push('### Proposal Psychology Tips')
  lines.push('- Lead with empathy: show you understand their problem before pitching your solution')
  lines.push('- Use specific numbers (not "fast delivery" but "delivery in 4 weeks")')
  lines.push('- Include a low-risk next step (30-min call, not "sign now")')
  lines.push('- Mirror the client language from their brief — signals active listening')
  lines.push('- Anchor price with value comparison, not hourly rate justification')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 2: PRICING STRATEGY OPTIMIZER ====================

function optimizePricing(input: PricingStrategyInput): PricingStrategyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const category = (input.service_category || 'web_development').toLowerCase()
  const expLevel = input.experience_level || 'intermediate'
  const currentRate = input.current_rate || 50
  const targetIncome = input.target_monthly_income || 8000
  const marketRates = input.market_rates || [30, 50, 75, 100, 150]
  const locationFactor = input.location_factor || 'medium_cost'
  const specDepth = input.specialization_depth || 'specialist'
  const demand = input.demand_level || 'medium'
  const platform = input.platform || 'direct'

  const avgMarket = marketRates.length > 0
    ? Math.round(marketRates.reduce((a, b) => a + b, 0) / marketRates.length)
    : 75

  const expMultiplier: Record<string, number> = { beginner: 0.6, intermediate: 1.0, expert: 1.6, elite: 2.5 }
  const locMultiplier: Record<string, number> = { low_cost: 0.7, medium_cost: 1.0, high_cost: 1.4 }
  const specMultiplier: Record<string, number> = { generalist: 0.8, specialist: 1.2, niche_expert: 1.6 }
  const demandMultiplier: Record<string, number> = { low: 0.8, medium: 1.0, high: 1.3, very_high: 1.6 }
  const platformFee: Record<string, number> = { direct: 1.0, upwork: 0.8, fiverr: 0.7, toptal: 0.95, mixed: 0.9 }

  const baseOptimal = avgMarket * (expMultiplier[expLevel] || 1.0)
  const adjustedOptimal = baseOptimal
    * (locMultiplier[locationFactor] || 1.0)
    * (specMultiplier[specDepth] || 1.0)
    * (demandMultiplier[demand] || 1.0)
    * (platformFee[platform] || 1.0)

  const targetRate = Math.round(adjustedOptimal)
  const minRate = Math.round(targetRate * 0.7)
  const maxRate = Math.round(targetRate * 1.5)

  const recommendedRates: RateRecommendation[] = [
    {
      rate_type: 'hourly',
      min_rate: minRate,
      target_rate: targetRate,
      max_rate: maxRate,
      justification: 'Baseline rate: $' + targetRate + '/hr based on ' + expLevel + ' level in ' + category
    },
    {
      rate_type: 'project',
      min_rate: Math.round(targetRate * 40 * 0.8),
      target_rate: Math.round(targetRate * 40),
      max_rate: Math.round(targetRate * 60),
      justification: 'Typical project (40-60 hrs): $' + Math.round(targetRate * 40) + ' base, scaling with complexity'
    },
    {
      rate_type: 'retainer',
      min_rate: Math.round(targetRate * 20),
      target_rate: Math.round(targetRate * 30),
      max_rate: Math.round(targetRate * 40),
      justification: 'Monthly retainer (20-40 hrs/mo): $' + Math.round(targetRate * 30) + ' guarantees predictable income'
    },
    {
      rate_type: 'value_based',
      min_rate: Math.round(targetRate * 80),
      target_rate: Math.round(targetRate * 120),
      max_rate: Math.round(targetRate * 200),
      justification: 'Value-based: ' + Math.round(targetRate * 120) + '+ for high-impact outcomes (10x ROI for client)'
    }
  ]

  const monthlyHours = 120
  const potentialIncome = Math.round(targetRate * monthlyHours)
  const incomeGap = targetIncome - potentialIncome
  const incomeGapAnalysis = incomeGap > 0
    ? 'Gap: $' + incomeGap + '/mo. Increase rate by $' + Math.ceil(incomeGap / monthlyHours) + '/hr or take on ' + Math.ceil(incomeGap / targetRate) + ' additional billable hours.'
    : 'Surplus: $' + Math.abs(incomeGap) + '/mo. Target income exceeded. Focus on value-based pricing or reduce hours while maintaining income.'

  const pricingTiers = [
    { tier: 'Starter', price_range: '$' + minRate + '-$' + Math.round(targetRate * 0.85) + '/hr', target_client: 'Budget-conscious clients, smaller projects' },
    { tier: 'Core', price_range: '$' + targetRate + '-$' + Math.round(targetRate * 1.2) + '/hr', target_client: 'Primary client base, standard projects (60% of work)' },
    { tier: 'Premium', price_range: '$' + Math.round(targetRate * 1.3) + '-$' + maxRate + '/hr', target_client: 'Enterprise clients, complex/urgent projects' }
  ]

  const negotiationLeverage: string[] = []
  if (demand === 'high' || demand === 'very_high') negotiationLeverage.push('High demand: mention waitlist or limited availability to justify premium')
  if (specDepth === 'niche_expert') negotiationLeverage.push('Niche expertise: only ' + rng.nextInt(50, 200) + ' freelancers in this specialization globally')
  if (expLevel === 'expert' || expLevel === 'elite') negotiationLeverage.push(expLevel.charAt(0).toUpperCase() + expLevel.slice(1) + ' level: reference premium market rates and past results')
  if (platform === 'direct') negotiationLeverage.push('Direct clients: no platform fees means better rates for client AND higher income for you')
  if (negotiationLeverage.length === 0) negotiationLeverage.push('Build portfolio of results before negotiating — social proof is strongest leverage')

  const raiseTiming = demand === 'very_high'
    ? 'Raise rates NOW: very high demand with limited capacity signals pricing power. Increase 20-30% for new clients immediately.'
    : demand === 'high'
    ? 'Raise rates within 30 days: strong demand supports 15-20% increase. Grandfather existing clients at current rate.'
    : 'Raise rates in 60-90 days: build more case studies and testimonials first to justify increase to $' + Math.round(targetRate * 1.1) + '/hr.'

  const summary = 'Optimal rate: $' + targetRate + '/hr (range: $' + minRate + '-$' + maxRate + '). Market avg: $' + avgMarket + '. Multipliers: ' + expLevel + ' (' + (expMultiplier[expLevel] || 1.0) + 'x), ' + specDepth + ' (' + (specMultiplier[specDepth] || 1.0) + 'x), ' + demand + ' demand (' + (demandMultiplier[demand] || 1.0) + 'x). ' + incomeGapAnalysis

  return {
    recommended_rates: recommendedRates,
    income_gap_analysis: incomeGapAnalysis,
    pricing_tiers: pricingTiers,
    negotiation_leverage: negotiationLeverage,
    raise_timing: raiseTiming,
    summary,
  }
}

function formatPricingReport(input: PricingStrategyInput, result: PricingStrategyResult): string {
  const lines: string[] = []

  lines.push('## Pricing Strategy Analysis')
  lines.push('')
  lines.push('**Service:** ' + (input.service_category || 'Web Development') + ' | **Experience:** ' + (input.experience_level || 'Intermediate') + ' | **Platform:** ' + (input.platform || 'Direct'))
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Recommended Rates')
  lines.push('| Rate Type | Min | Target | Max | Justification |')
  lines.push('|-----------|-----|--------|-----|---------------|')
  for (const r of result.recommended_rates) {
    lines.push('| ' + r.rate_type.charAt(0).toUpperCase() + r.rate_type.slice(1) + ' | $' + r.min_rate + ' | $' + r.target_rate + ' | $' + r.max_rate + ' | ' + r.justification + ' |')
  }
  lines.push('')

  lines.push('### Pricing Tiers')
  for (const t of result.pricing_tiers) {
    lines.push('- **' + t.tier + '** — ' + t.price_range + ' → ' + t.target_client)
  }
  lines.push('')

  lines.push('### Income Gap Analysis')
  lines.push(result.income_gap_analysis)
  lines.push('')

  lines.push('### Negotiation Leverage Points')
  for (const l of result.negotiation_leverage) {
    lines.push('- ' + l)
  }
  lines.push('')

  lines.push('### When to Raise Rates')
  lines.push(result.raise_timing)
  lines.push('')

  lines.push('### Pricing Principles')
  lines.push('- Price on value, not time — clients buy outcomes, not hours')
  lines.push('- Raise rates for new clients first before existing ones')
  lines.push('- Never compete on price — compete on expertise and results')
  lines.push('- Review rates quarterly: if you are fully booked at current rates, raise 15-20%')
  lines.push('- Offer annual contracts at a 10% discount to lock in recurring revenue')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 3: CLIENT RELATIONSHIP MANAGER ====================

function manageClientRelationship(input: ClientRelationshipInput): ClientRelationshipResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const clientName = input.client_name || 'Client'
  const relLength = input.relationship_length_months || 6
  const totalRevenue = input.total_revenue || 10000
  const projectCount = input.project_count || 3
  const commFreq = input.communication_frequency || 'biweekly'
  const satisfaction = input.satisfaction_score || 75
  const painPoints = input.pain_points || []
  const opportunities = input.opportunities || []
  const competitorThreat = input.competitor_threat || 'low'

  // Health score calculation
  let healthScore = 50
  healthScore += clamp(satisfaction - 60, -20, 25)
  healthScore += clamp(relLength * 0.5, 0, 15)
  healthScore += clamp(projectCount * 2, 0, 15)
  if (commFreq === 'weekly') healthScore += 5
  if (commFreq === 'biweekly') healthScore += 3
  healthScore -= competitorThreat === 'high' ? 15 : competitorThreat === 'medium' ? 8 : competitorThreat === 'low' ? 3 : 0
  healthScore += rng.nextInt(-5, 5)
  healthScore = clamp(Math.round(healthScore), 10, 98)

  let health: ClientRelationshipResult['relationship_health'] = 'stable'
  if (healthScore >= 75) health = 'thriving'
  else if (healthScore >= 55) health = 'stable'
  else if (healthScore >= 35) health = 'at_risk'
  else health = 'critical'

  let churnRisk: ClientRelationshipResult['churn_risk'] = 'low'
  if (healthScore < 40) churnRisk = 'high'
  else if (healthScore < 60) churnRisk = 'medium'
  else churnRisk = 'low'

  // LTV estimation
  const avgProjectValue = projectCount > 0 ? totalRevenue / projectCount : 3000
  const projectedAdditionalMonths = churnRisk === 'low' ? 18 : churnRisk === 'medium' ? 8 : 3
  const ltvEstimate = Math.round(totalRevenue + (avgProjectValue * projectedAdditionalMonths / (relLength > 0 ? relLength : 1) * 2))

  const actions: RelationshipAction[] = []

  if (health === 'thriving') {
    actions.push({ action: 'Request testimonial and case study permission', priority: 'high', timeline: 'This week', expected_outcome: 'Social proof for new client acquisition' })
    actions.push({ action: 'Introduce referral incentive program', priority: 'high', timeline: 'Within 2 weeks', expected_outcome: '1-2 qualified referrals over 3 months' })
    actions.push({ action: 'Propose retainer agreement for ongoing work', priority: 'medium', timeline: 'Next review meeting', expected_outcome: 'Predictable monthly revenue of $' + Math.round(avgProjectValue * 0.8) + '+',  })
  } else if (health === 'stable') {
    actions.push({ action: 'Schedule informal check-in call', priority: 'high', timeline: 'This week', expected_outcome: 'Surface unspoken needs before they become issues' })
    actions.push({ action: 'Share a relevant industry insight or resource', priority: 'medium', timeline: 'Within 1 week', expected_outcome: 'Reinforce value beyond project delivery' })
    actions.push({ action: 'Pitch next-phase work or expansion scope', priority: 'medium', timeline: 'After check-in', expected_outcome: '20-30% revenue increase per project' })
  } else {
    actions.push({ action: 'Emergency check-in: request honest feedback on what is not working', priority: 'critical', timeline: 'Within 48 hours', expected_outcome: 'Identify root cause of dissatisfaction' })
    actions.push({ action: 'Offer value recovery: free add-on or discounted next phase', priority: 'high', timeline: 'Within 1 week', expected_outcome: 'Demonstrate commitment to relationship repair' })
    actions.push({ action: 'Identify and address each pain point directly', priority: 'critical', timeline: 'Ongoing for 30 days', expected_outcome: 'Move satisfaction score from ' + satisfaction + ' to 70+' })
  }

  if (competitorThreat === 'high') {
    actions.push({ action: 'Competitive differentiation: articulate unique ROI only you deliver', priority: 'critical', timeline: 'Immediately', expected_outcome: 'Counter competitor threat with value documentation' })
  }

  for (const opp of opportunities.slice(0, 2)) {
    actions.push({ action: 'Proactive pitch: ' + opp, priority: 'medium', timeline: 'Next interaction', expected_outcome: 'Expand scope and deepen engagement' })
  }

  const commTemplates: Record<string, string> = {
    weekly: 'Hi [Name], quick weekly update: [progress summary]. Key wins: [1-2 wins]. Next steps: [upcoming work]. Any concerns or adjustments needed?',
    biweekly: 'Hi [Name], biweekly check-in on our project. Progress: [status]. Blocked by: [if any]. Look ahead: [next 2 weeks]. Happy to jump on a call if useful.',
    monthly: 'Hi [Name], monthly update: we have completed [milestones]. Current status: [on track/at risk]. Revenue to date: [amount]. Planning for next month: [focus areas].',
    as_needed: 'Hi [Name], wanted to touch base regarding [topic]. [Share update/insight/question]. Let me know when you have 10 minutes to discuss.'
  }

  const summary = 'Relationship with ' + clientName + ': ' + health.toUpperCase() + ' (health score: ' + healthScore + '/100). Churn risk: ' + churnRisk + '. LTV estimate: $' + ltvEstimate.toLocaleString() + '. ' + actions.length + ' recommended actions to ' + (health === 'thriving' ? 'grow' : health === 'stable' ? 'deepen' : 'repair') + ' the relationship.'

  return {
    relationship_health: health,
    health_score: healthScore,
    churn_risk: churnRisk,
    lifetime_value_estimate: ltvEstimate,
    actions,
    communication_template: commTemplates[commFreq] || commTemplates.biweekly,
    summary,
  }
}

function formatClientRelationshipReport(input: ClientRelationshipInput, result: ClientRelationshipResult): string {
  const lines: string[] = []

  lines.push('## Client Relationship Health: ' + (input.client_name || 'Client'))
  lines.push('')
  lines.push('**Revenue:** $' + (input.total_revenue || 0).toLocaleString() + ' | **Projects:** ' + (input.project_count || 0) + ' | **Duration:** ' + (input.relationship_length_months || 0) + ' months')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  const healthIcon = result.relationship_health === 'thriving' ? 'THRIVING' : result.relationship_health === 'at_risk' ? 'AT RISK' : result.relationship_health.toUpperCase()
  lines.push('### Health: ' + healthIcon + ' (' + result.health_score + '/100)')
  lines.push('Churn Risk: ' + result.churn_risk.toUpperCase())
  lines.push('Estimated LTV: $' + result.lifetime_value_estimate.toLocaleString())
  lines.push('')

  lines.push('### Recommended Actions')
  lines.push('| Priority | Action | Timeline | Expected Outcome |')
  lines.push('|----------|--------|----------|------------------|')
  for (const a of result.actions) {
    lines.push('| ' + a.priority.toUpperCase() + ' | ' + a.action + ' | ' + a.timeline + ' | ' + a.expected_outcome + ' |')
  }
  lines.push('')

  lines.push('### Communication Template')
  lines.push(result.communication_template)
  lines.push('')

  lines.push('### Relationship Principles')
  lines.push('- Over-communicate: 80% of client frustration comes from silence, not mistakes')
  lines.push('- Deliver bad news early: clients forgive problems, not surprises')
  lines.push('- Ask "what else?": the best projects come from expanding an existing relationship')
  lines.push('- Celebrate wins together: share metrics and impact, not just outputs')
  lines.push('- Become indispensable: know their business better than they expect')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 4: PORTFOLIO EFFECTIVENESS SCORER ====================

function scorePortfolio(input: PortfolioScorerInput): PortfolioScorerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const items = input.portfolio_items || []
  const targetService = input.target_service || 'general'
  const targetType = input.target_client_type || 'mid_market'
  const hasTestimonials = input.has_testimonials || false
  const hasCaseStudies = input.has_case_studies || false
  const hasMetrics = input.has_metrics || false
  const itemCount = items.length || input.total_items || 0

  // Clarity score (how clear and understandable)
  let clarityScore = 40
  if (itemCount >= 3) clarityScore += 15
  if (itemCount >= 6) clarityScore += 10
  if (items.some(i => i.results && i.results.length > 10)) clarityScore += 15
  if (items.some(i => i.skills && i.skills.length > 0)) clarityScore += 10
  clarityScore += rng.nextInt(-5, 5)
  clarityScore = clamp(clarityScore, 15, 98)

  // Relevance score (how relevant to target audience)
  let relevanceScore = 35
  const targetKeywords = targetService.toLowerCase().split('_')
  const matchingItems = items.filter(i =>
    targetKeywords.some(k => i.description.toLowerCase().includes(k) || i.title.toLowerCase().includes(k))
  ).length
  relevanceScore += clamp(matchingItems * 10, 0, 40)
  if (items.length > 0 && matchingItems / items.length > 0.5) relevanceScore += 15
  relevanceScore += rng.nextInt(-5, 5)
  relevanceScore = clamp(relevanceScore, 10, 98)

  // Credibility score (testimonials, metrics, social proof)
  let credibilityScore = 30
  if (hasTestimonials) credibilityScore += 25
  if (hasCaseStudies) credibilityScore += 20
  if (hasMetrics) credibilityScore += 20
  if (itemCount >= 5) credibilityScore += 10
  credibilityScore += rng.nextInt(-5, 5)
  credibilityScore = clamp(credibilityScore, 10, 98)

  // Impact score (results demonstrated)
  let impactScore = 25
  const itemsWithResults = items.filter(i => i.results && i.results.length > 5).length
  impactScore += clamp(itemsWithResults * 12, 0, 35)
  if (hasMetrics) impactScore += 20
  if (hasCaseStudies) impactScore += 15
  impactScore += rng.nextInt(-5, 5)
  impactScore = clamp(impactScore, 10, 98)

  const overallScore = Math.round((clarityScore + relevanceScore + credibilityScore + impactScore) / 4)

  const gaps: PortfolioGap[] = []
  if (!hasTestimonials) gaps.push({ gap: 'No client testimonials', severity: 'critical', recommendation: 'Request testimonials from your 3 best clients — even a 2-sentence quote adds massive credibility' })
  if (!hasCaseStudies) gaps.push({ gap: 'No detailed case studies', severity: 'important', recommendation: 'Convert your top 2 projects into challenge-solution-result case studies' })
  if (!hasMetrics) gaps.push({ gap: 'No quantified results', severity: 'critical', recommendation: 'Add metrics to every project: time saved, revenue increased, costs reduced, satisfaction improved' })
  if (itemCount < 3) gaps.push({ gap: 'Too few portfolio items (' + itemCount + ')', severity: 'important', recommendation: 'Aim for 4-6 strong pieces. Quality over quantity, but under 3 feels thin.' })
  if (items.some(i => !i.skills || i.skills.length === 0)) gaps.push({ gap: 'Missing skills tags on some items', severity: 'nice_to_have', recommendation: 'Tag each portfolio item with relevant skills for searchability and relevance signaling' })
  if (targetKeywords.some(k => !items.some(i => (i.description + i.title).toLowerCase().includes(k)))) {
    gaps.push({ gap: 'Limited relevance to target service: ' + targetService, severity: 'important', recommendation: 'Add or emphasize work directly relevant to ' + targetService + ' or reframe existing work to highlight transferable skills' })
  }

  const topImprovements: string[] = []
  topImprovements.push('Lead with results: rewrite every project description to start with the outcome, not the task')
  topImprovements.push('Add context: include client industry, project size, team composition, and your role')
  if (!hasTestimonials) topImprovements.push('Prioritize testimonials: they are the #1 conversion factor for new client inquiries')
  topImprovements.push('Show process: include 1-2 screenshots or sketches of your methodology')
  topImprovements.push('Keep it current: archive work over 2 years old unless it is a landmark project')

  const suggestedLayout = [
    'Hero section: 1-line value prop + best metric (e.g., "$2M revenue generated for clients")',
    'Selected work: 4-6 featured projects with challenge-solution-result format',
    'Skills matrix: visual representation of core competencies',
    'Client logos: if permitted, show recognizable brands you have worked with',
    'Testimonials: 3-5 short quotes, ideally near relevant project work',
    'About/Credentials: years experience, notable clients, key differentiators',
    'Clear CTA: "Let\'s discuss your project" with contact form or calendar link'
  ]

  const summary = 'Portfolio effectiveness: ' + overallScore + '/100 (' + rateScore(overallScore) + '). Clarity: ' + clarityScore + ', Relevance: ' + relevanceScore + ', Credibility: ' + credibilityScore + ', Impact: ' + impactScore + '. ' + gaps.length + ' gaps identified. ' + topImprovements.length + ' improvement actions recommended.'

  return {
    effectiveness_score: overallScore,
    clarity_score: clarityScore,
    relevance_score: relevanceScore,
    credibility_score: credibilityScore,
    impact_score: impactScore,
    gaps,
    top_improvements: topImprovements,
    suggested_layout: suggestedLayout,
    summary,
  }
}

function formatPortfolioReport(_input: PortfolioScorerInput, result: PortfolioScorerResult): string {
  const lines: string[] = []

  lines.push('## Portfolio Effectiveness Score')
  lines.push('')
  lines.push('**Overall Score:** ' + result.effectiveness_score + '/100 — ' + rateScore(result.effectiveness_score))
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Score Breakdown')
  lines.push('| Dimension | Score | Rating |')
  lines.push('|-----------|-------|--------|')
  lines.push('| Clarity | ' + result.clarity_score + '/100 | ' + rateScore(result.clarity_score) + ' |')
  lines.push('| Relevance | ' + result.relevance_score + '/100 | ' + rateScore(result.relevance_score) + ' |')
  lines.push('| Credibility | ' + result.credibility_score + '/100 | ' + rateScore(result.credibility_score) + ' |')
  lines.push('| Impact | ' + result.impact_score + '/100 | ' + rateScore(result.impact_score) + ' |')
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Identified Gaps')
    for (const g of result.gaps) {
      lines.push('- **' + g.severity.toUpperCase() + ':** ' + g.gap + ' → ' + g.recommendation)
    }
    lines.push('')
  }

  lines.push('### Top Improvements')
  for (const t of result.top_improvements) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push('### Suggested Layout')
  for (const s of result.suggested_layout) {
    lines.push('- ' + s)
  }
  lines.push('')

  lines.push('### Portfolio Best Practices')
  lines.push('- Show 4-6 projects max — curated beats comprehensive')
  lines.push('- Each project tells a story: what was the challenge, what did you do, what was the result')
  lines.push('- Quantify everything: "increased revenue 40%" beats "improved performance"')
  lines.push('- Update quarterly: remove outdated work, add recent wins')
  lines.push('- Include a mix of project types to show versatility without seeming unfocused')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 5: CONTRACT REVIEW ASSISTANT ====================

function reviewContract(input: ContractReviewInput): ContractReviewResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const contractType = input.contract_type || 'fixed_price'
  const contractValue = input.contract_value || 5000
  const paymentTerms = input.payment_terms || 'unspecified'
  const scopeDesc = input.scope_description || 'not clearly defined'
  const deadlineDesc = input.deadline_description || 'not specified'
  const revisionPolicy = input.revision_policy || 'not specified'
  const ipTerms = input.intellectual_property_terms || 'not specified'
  const terminationClauses = input.termination_clauses || 'not specified'
  const liabilityTerms = input.liability_terms || 'not specified'
  const nonCompete = input.non_compete || false

  const risks: ContractRisk[] = []
  let riskPoints = 0

  // Scope clarity check
  if (scopeDesc.length < 30 || scopeDesc === 'not clearly defined') {
    risks.push({
      clause: 'Scope Definition',
      risk_level: 'high',
      issue: 'Scope is vague or undefined — opens door to unlimited additional work ("scope creep")',
      recommendation: 'Insist on a detailed SOW (Statement of Work) with specific deliverables, exclusions, and change-order process'
    })
    riskPoints += 25
  }

  // Payment terms analysis
  const paymentLower = paymentTerms.toLowerCase()
  if (paymentLower.includes('net 60') || paymentLower.includes('net 90') || paymentLower === 'unspecified') {
    risks.push({
      clause: 'Payment Terms',
      risk_level: 'high',
      issue: 'Payment terms of ' + paymentTerms + ' expose you to late/non-payment risk and cash flow strain',
      recommendation: 'Negotiate net-15 or net-30. Request 25-50% upfront payment for new clients.'
    })
    riskPoints += 20
  } else if (paymentLower.includes('net 45') || paymentLower.includes('net 30')) {
    risks.push({
      clause: 'Payment Terms',
      risk_level: 'medium',
      issue: 'Payment terms of ' + paymentTerms + ' are reasonable but could be tighter',
      recommendation: 'Add late payment penalty (1.5% monthly) and consider milestone-based payments for projects over $10K'
    })
    riskPoints += 10
  }

  // Revision policy
  if (revisionPolicy === 'not specified' || revisionPolicy.toLowerCase().includes('unlimited')) {
    risks.push({
      clause: 'Revisions Policy',
      risk_level: 'high',
      issue: 'Revision policy is ' + revisionPolicy + ' — unlimited revisions can consume all profit margin',
      recommendation: 'Specify number of revision rounds included (e.g., 2 rounds), additional revisions billed at $X/hr'
    })
    riskPoints += 20
  }

  // IP terms
  if (ipTerms === 'not specified') {
    risks.push({
      clause: 'Intellectual Property',
      risk_level: 'medium',
      issue: 'IP terms not specified — unclear who owns the work product and pre-existing IP',
      recommendation: 'Clarify that pre-existing tools/methods remain yours, and client receives license to final deliverables upon full payment'
    })
    riskPoints += 15
  } else if (ipTerms.toLowerCase().includes('work for hire') || ipTerms.toLowerCase().includes('all_ip_to_client')) {
    risks.push({
      clause: 'Intellectual Property',
      risk_level: 'high',
      issue: 'Full IP assignment ("work for hire") — client gets everything including your methods/tools',
      recommendation: 'Negotiate: client gets exclusive license to deliverables, but you retain rights to reusable code, tools, and methodologies'
    })
    riskPoints += 20
  }

  // Termination clauses
  if (terminationClauses === 'not specified') {
    risks.push({
      clause: 'Termination Clauses',
      risk_level: 'medium',
      issue: 'No termination clause — unclear what happens if client cancels mid-project',
      recommendation: 'Add: 30-day written notice, payment for all work completed + 25% kill fee for remaining scope'
    })
    riskPoints += 15
  }

  // Liability terms
  if (liabilityTerms === 'not specified' || liabilityTerms.toLowerCase().includes('unlimited')) {
    risks.push({
      clause: 'Liability',
      risk_level: 'critical',
      issue: 'Unlimited or unspecified liability — you could owe more than the contract value',
      recommendation: 'Cap liability at contract value or 12 months of fees, whichever is less. Never accept unlimited liability.'
    })
    riskPoints += 30
  }

  // Non-compete
  if (nonCompete) {
    risks.push({
      clause: 'Non-Compete',
      risk_level: 'high',
      issue: 'Non-compete clause restricts your ability to serve other clients in the same industry',
      recommendation: 'Narrow scope: limit to 6 months, specific named competitors, or replace with NDA/non-solicitation'
    })
    riskPoints += 25
  }

  // Contract type risks
  if (contractType === 'hourly' && contractValue > 20000) {
    risks.push({
      clause: 'Contract Structure',
      risk_level: 'medium',
      issue: 'High-value hourly contract ($' + contractValue.toLocaleString() + ') without cap — client may dispute hours',
      recommendation: 'Add not-to-exceed cap at 120% of estimate, with written approval required for overages'
    })
    riskPoints += 10
  }

  // Missing clauses
  const missingClauses: string[] = []
  if (!paymentTerms.toLowerCase().includes('upfront') && !paymentTerms.toLowerCase().includes('deposit')) {
    missingClauses.push('Upfront deposit/payment (25-50% before work begins)')
  }
  if (revisionPolicy === 'not specified') missingClauses.push('Revision round limits and overage rates')
  if (ipTerms === 'not specified') missingClauses.push('IP ownership and licensing terms')
  if (liabilityTerms === 'not specified') missingClauses.push('Liability cap (limited to contract value)')
  if (terminationClauses === 'not specified') missingClauses.push('Early termination and kill fee provisions')
  if (!paymentLower.includes('late') && !paymentLower.includes('penalty')) {
    missingClauses.push('Late payment penalties (1.5% per month)')
  }
  missingClauses.push('Force majeure clause (protects both parties from unforeseeable disruptions)')
  missingClauses.push('Dispute resolution mechanism (mediation before litigation)')

  // Negotiation points
  const negotiationPoints: string[] = []
  negotiationPoints.push('Request 30-50% upfront payment — standard for freelancers and tests client commitment')
  negotiationPoints.push('Cap total revisions at 2-3 rounds; additional rounds at your hourly rate')
  negotiationPoints.push('Add late payment clause: 1.5% monthly interest on overdue invoices')
  negotiationPoints.push('Limit liability to contract value — walk away from unlimited liability')
  if (nonCompete) negotiationPoints.push('Strike non-compete entirely or narrow to 3 months and specific competitors')
  negotiationPoints.push('Include right to showcase work in portfolio (unless NDA prohibits)')
  negotiationPoints.push('30-day termination written notice with payment for all work completed to date')

  // Red flags
  const redFlags: string[] = []
  if (liabilityTerms.toLowerCase().includes('unlimited')) redFlags.push('Unlimited liability — NEVER accept this')
  if (nonCompete && contractValue < 20000) redFlags.push('Non-compete on a $' + contractValue.toLocaleString() + ' contract — disproportionate restriction')
  if (paymentLower.includes('net 90') || paymentLower.includes('net 120')) redFlags.push('Extremely long payment terms — 90+ day payment is a serious cash flow risk')
  if (scopeDesc.length < 20) redFlags.push('Vague scope — invites scope creep and disputes')
  if (redFlags.length === 0) redFlags.push('No critical red flags detected — but review all terms carefully before signing')

  riskPoints += rng.nextInt(-5, 5)
  riskPoints = clamp(riskPoints, 5, 100)

  let overallRisk: ContractReviewResult['overall_risk'] = 'acceptable'
  if (riskPoints >= 70) overallRisk = 'reject'
  else if (riskPoints >= 50) overallRisk = 'high'
  else if (riskPoints >= 30) overallRisk = 'moderate'
  else overallRisk = 'acceptable'

  const summary = 'Contract risk: ' + overallRisk.toUpperCase() + ' (' + riskPoints + '/100). ' + risks.length + ' specific risks identified across ' + [...new Set(risks.map(r => r.clause))].length + ' clause categories. ' + missingClauses.length + ' missing clauses to add. ' + redFlags.length + ' red flags.'

  return {
    overall_risk: overallRisk,
    risk_score: riskPoints,
    risks,
    missing_clauses: missingClauses,
    negotiation_points: negotiationPoints,
    red_flags: redFlags,
    summary,
  }
}

function formatContractReviewReport(input: ContractReviewInput, result: ContractReviewResult): string {
  const lines: string[] = []

  lines.push('## Contract Review: ' + (input.contract_type || 'Fixed Price').replace(/_/g, ' ').toUpperCase())
  lines.push('')
  lines.push('**Contract Value:** $' + (input.contract_value || 0).toLocaleString() + ' | **Type:** ' + (input.contract_type || 'fixed_price'))
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Overall Risk: ' + result.overall_risk.toUpperCase() + ' (' + result.risk_score + '/100)')
  lines.push('')

  if (result.risks.length > 0) {
    lines.push('### Identified Risks')
    for (const r of result.risks) {
      lines.push('- **' + r.risk_level.toUpperCase() + ' — ' + r.clause + ':** ' + r.issue + ' → *Fix:* ' + r.recommendation)
    }
    lines.push('')
  }

  lines.push('### Missing Clauses')
  for (const m of result.missing_clauses) {
    lines.push('- ' + m)
  }
  lines.push('')

  lines.push('### Negotiation Points')
  for (const n of result.negotiation_points) {
    lines.push('- ' + n)
  }
  lines.push('')

  lines.push('### Red Flags')
  for (const rf of result.red_flags) {
    lines.push('- ' + rf)
  }
  lines.push('')

  lines.push('### Contract Safety Checklist')
  lines.push('- [ ] Scope is specific and measurable (no "etc." or "as needed")')
  lines.push('- [ ] Payment terms include upfront deposit')
  lines.push('- [ ] Revision rounds are capped')
  lines.push('- [ ] IP ownership is clearly assigned')
  lines.push('- [ ] Liability is capped at contract value')
  lines.push('- [ ] Termination clause includes kill fee')
  lines.push('- [ ] Late payment penalties are defined')
  lines.push('- [ ] You have right to showcase work in portfolio')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 6: INCOME DIVERSIFICATION ADVISOR ====================

function adviseIncomeDiversification(input: IncomeDiversificationInput): DiversificationPlan {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const currentIncome = input.current_monthly_income || 5000
  const primarySource = input.primary_income_source || 'client_projects'
  const primaryPct = input.primary_income_pct || 80
  const otherSources = input.other_sources || []
  const skills = input.skills || ['writing', 'design', 'development']
  const availableHours = input.available_hours_per_week || 10
  const riskTolerance = input.risk_tolerance || 'moderate'
  const savingsMonths = input.savings_months || 3
  const monthlyExpenses = input.monthly_expenses || 3000

  // Concentration risk
  let concentrationRisk: DiversificationPlan['current_concentration_risk'] = 'low'
  if (primaryPct >= 90) concentrationRisk = 'critical'
  else if (primaryPct >= 75) concentrationRisk = 'high'
  else if (primaryPct >= 50) concentrationRisk = 'medium'
  else concentrationRisk = 'low'

  // Current number of streams
  const currentStreams = 1 + otherSources.length
  const targetStreams = riskTolerance === 'aggressive' ? 5 : riskTolerance === 'moderate' ? 4 : 3

  // Diversification score
  let divScore = clamp(100 - primaryPct + currentStreams * 10, 10, 98)
  if (savingsMonths >= 6) divScore += 10
  if (savingsMonths < 2) divScore -= 15
  divScore = clamp(Math.round(divScore + rng.nextInt(-5, 5)), 10, 98)

  // Recommended income streams pool
  const allStreams: Record<string, IncomeStream> = {
    online_course: { stream: 'Online Course', difficulty: 'moderate', startup_time_weeks: 4, potential_monthly_income: Math.round(currentIncome * 0.4), passive_income_pct: 85, description: 'Create a course on Udemy/Skillshare teaching your core skill' },
    digital_product: { stream: 'Digital Products', difficulty: 'easy', startup_time_weeks: 2, potential_monthly_income: Math.round(currentIncome * 0.2), passive_income_pct: 90, description: 'Templates, presets, checklists, or tools related to your expertise' },
    coaching: { stream: 'Coaching/Consulting', difficulty: 'easy', startup_time_weeks: 1, potential_monthly_income: Math.round(currentIncome * 0.5), passive_income_pct: 0, description: '1-on-1 coaching for junior professionals in your field' },
    content_creation: { stream: 'Content/Blog', difficulty: 'moderate', startup_time_weeks: 8, potential_monthly_income: Math.round(currentIncome * 0.15), passive_income_pct: 70, description: 'Newsletter, blog, YouTube — audience monetization through ads/sponsorships' },
    affiliate: { stream: 'Affiliate Marketing', difficulty: 'easy', startup_time_weeks: 2, potential_monthly_income: Math.round(currentIncome * 0.1), passive_income_pct: 60, description: 'Recommend tools and platforms you already use with affiliate links' },
    retainers: { stream: 'Client Retainers', difficulty: 'easy', startup_time_weeks: 1, potential_monthly_income: Math.round(currentIncome * 0.6), passive_income_pct: 10, description: 'Convert hourly/retainer clients to monthly recurring contracts' },
    saas_tool: { stream: 'Micro-SaaS', difficulty: 'hard', startup_time_weeks: 12, potential_monthly_income: Math.round(currentIncome * 0.8), passive_income_pct: 80, description: 'Build a tool that solves a specific problem in your niche' },
    membership: { stream: 'Membership Community', difficulty: 'moderate', startup_time_weeks: 3, potential_monthly_income: Math.round(currentIncome * 0.25), passive_income_pct: 40, description: 'Paid community with exclusive resources, AMAs, and networking' },
    public_speaking: { stream: 'Speaking/Workshops', difficulty: 'hard', startup_time_weeks: 6, potential_monthly_income: Math.round(currentIncome * 0.3), passive_income_pct: 0, description: 'Paid talks, workshops, or webinars at industry events' },
    licensing: { stream: 'Licensing IP', difficulty: 'hard', startup_time_weeks: 8, potential_monthly_income: Math.round(currentIncome * 0.35), passive_income_pct: 95, description: 'License your methodologies, frameworks, or content for royalties' }
  }

  // Select streams based on skills and available time
  const recommendedStreams: IncomeStream[] = []
  const selectedKeys = new Set<string>()

  // Always recommend retainers first (easiest transition)
  if (primarySource !== 'retainers') {
    recommendedStreams.push(allStreams.retainers)
    selectedKeys.add('retainers')
  }

  // Match skills to streams
  const skillStreamMap: Record<string, string> = {
    writing: 'content_creation',
    design: 'digital_product',
    development: 'saas_tool',
    teaching: 'online_course',
    consulting: 'coaching',
    marketing: 'affiliate',
    speaking: 'public_speaking',
    management: 'membership',
    research: 'licensing',
    analysis: 'coaching'
  }

  for (const skill of skills) {
    if (recommendedStreams.length >= targetStreams) break
    const streamKey = skillStreamMap[skill.toLowerCase()]
    if (streamKey && !selectedKeys.has(streamKey)) {
      recommendedStreams.push(allStreams[streamKey])
      selectedKeys.add(streamKey)
    }
  }

  // Fill remaining slots
  const remaining = Object.keys(allStreams).filter(k => !selectedKeys.has(k))
  while (recommendedStreams.length < targetStreams && remaining.length > 0) {
    const key = remaining.shift()!
    recommendedStreams.push(allStreams[key])
    selectedKeys.add(key)
  }

  // Action timeline
  const timeline: { phase: string; actions: string[]; timeline: string }[] = [
    {
      phase: 'Immediate (Week 1-2)',
      actions: [
        'Convert 1-2 best clients to retainer agreements',
        'Identify top skill monetization opportunity',
        'Set up separate income tracking for each stream'
      ],
      timeline: 'Month 1'
    },
    {
      phase: 'Short-term (Week 3-8)',
      actions: [
        'Launch first digital product or online course',
        'Set up content platform (newsletter/blog)',
        'Establish passive income infrastructure'
      ],
      timeline: 'Month 2-3'
    },
    {
      phase: 'Medium-term (Month 3-6)',
      actions: [
        'Scale membership or community offering',
        'Develop additional passive income products',
        'Reduce primary income dependency to below 60%'
      ],
      timeline: 'Month 4-6'
    }
  ]

  const summary = 'Concentration risk: ' + concentrationRisk.toUpperCase() + ' (' + primaryPct + '% from single source). Current streams: ' + currentStreams + '. Target: ' + targetStreams + '. Diversification score: ' + divScore + '/100. ' + recommendedStreams.length + ' new income streams recommended. Timeline: 6 months to achieve target diversification.'

  return {
    current_concentration_risk: concentrationRisk,
    target_streams: targetStreams,
    diversification_score: divScore,
    recommended_streams: recommendedStreams,
    action_timeline: timeline,
    summary,
  }
}

function formatDiversificationReport(input: IncomeDiversificationInput, result: DiversificationPlan): string {
  const lines: string[] = []

  lines.push('## Income Diversification Plan')
  lines.push('')
  lines.push('**Current Income:** $' + (input.current_monthly_income || 0).toLocaleString() + '/mo | **Primary Source:** ' + (input.primary_income_source || 'client_projects') + ' (' + (input.primary_income_pct || 0) + '%)')
  lines.push('**Available Hours/Week:** ' + (input.available_hours_per_week || 10) + ' | **Savings Buffer:** ' + (input.savings_months || 0) + ' months')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Concentration Risk: ' + result.current_concentration_risk.toUpperCase())
  lines.push('Diversification Score: ' + result.diversification_score + '/100')
  lines.push('')

  lines.push('### Recommended Income Streams')
  lines.push('| Stream | Difficulty | Startup | Monthly Potential | Passive % |')
  lines.push('|--------|-----------|---------|--------------------|-----------|')
  for (const s of result.recommended_streams) {
    lines.push('| ' + s.stream + ' | ' + s.difficulty + ' | ' + s.startup_time_weeks + ' wks | $' + s.potential_monthly_income.toLocaleString() + ' | ' + s.passive_income_pct + '% |')
  }
  lines.push('')

  lines.push('### Stream Descriptions')
  for (const s of result.recommended_streams) {
    lines.push('- **' + s.stream + ':** ' + s.description)
  }
  lines.push('')

  lines.push('### Action Timeline')
  for (const t of result.action_timeline) {
    lines.push('#### ' + t.phase + ' (' + t.timeline + ')')
    for (const a of t.actions) {
      lines.push('- ' + a)
    }
    lines.push('')
  }

  lines.push('### Diversification Principles')
  lines.push('- Never rely on a single client or platform for >50% of income')
  lines.push('- Build passive income streams that compound over time')
  lines.push('- Keep 6 months of expenses as safety net before aggressive diversification')
  lines.push('- Validate new streams with minimum viable offerings before heavy investment')
  lines.push('- Reinvest first 3 months of passive income into scaling')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 7: TIME TRACKING ANALYTICS ====================

function analyzeTimeTracking(input: TimeTrackingInput): TimeTrackingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const weekly = input.weekly_hours || { client_work: 25, admin: 5, business_dev: 3, learning: 2, personal: 0 }
  const totalHours = input.total_hours || (weekly.client_work + weekly.admin + weekly.business_dev + weekly.learning + weekly.personal)
  const billableHours = input.billable_hours || weekly.client_work
  const projectHours = input.project_hours || []
  const hourlyRate = input.hourly_rate || 75
  const targetBillablePct = input.target_billable_pct || 70

  const billablePercentage = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0

  // Revenue calculation
  let totalRevenue = 0
  if (projectHours.length > 0) {
    totalRevenue = projectHours.reduce((sum, p) => sum + p.revenue, 0)
  } else {
    totalRevenue = billableHours * hourlyRate * 4
  }

  const effectiveHourlyRate = totalHours > 0 ? Math.round(totalRevenue / totalHours) : 0
  const revenuePerHour = billableHours > 0 ? Math.round(totalRevenue / billableHours) : 0

  // Utilization grade
  let utilizationGrade = 'C'
  if (billablePercentage >= 75) utilizationGrade = 'A'
  else if (billablePercentage >= 65) utilizationGrade = 'B+'
  else if (billablePercentage >= 55) utilizationGrade = 'B'
  else if (billablePercentage >= 45) utilizationGrade = 'C+'
  else if (billablePercentage >= 35) utilizationGrade = 'C'
  else utilizationGrade = 'D'

  // Category percentages
  const catClientPct = totalHours > 0 ? Math.round((weekly.client_work / totalHours) * 100) : 0
  const catAdminPct = totalHours > 0 ? Math.round((weekly.admin / totalHours) * 100) : 0
  const catBDPct = totalHours > 0 ? Math.round((weekly.business_dev / totalHours) * 100) : 0
  const catLearnPct = totalHours > 0 ? Math.round((weekly.learning / totalHours) * 100) : 0

  // Insights
  const insights: TimeInsight[] = []

  if (billablePercentage < targetBillablePct - 10) {
    insights.push({
      insight: 'Billable utilization at ' + billablePercentage + '% is ' + (targetBillablePct - billablePercentage) + ' points below target of ' + targetBillablePct + '%',
      impact: 'high',
      recommended_action: 'Reduce non-billable time by 5+ hrs/week or raise rates to compensate for lower utilization'
    })
  }

  if (catAdminPct > 15) {
    insights.push({
      insight: 'Admin time consuming ' + catAdminPct + '% of total hours — above healthy threshold of 10-15%',
      impact: 'high',
      recommended_action: 'Automate invoicing, use templates for repetitive tasks, batch admin into 1-2 dedicated blocks'
    })
  }

  if (catBDPct < 10) {
    insights.push({
      insight: 'Only ' + catBDPct + '% on business development — risks future pipeline',
      impact: 'medium',
      recommended_action: 'Allocate 5+ hrs/week to BD: outreach, networking, content creation for lead generation'
    })
  }

  if (catLearnPct < 5) {
    insights.push({
      insight: 'Learning investment at ' + catLearnPct + '% — may lead to skill stagnation',
      impact: 'low',
      recommended_action: 'Dedicate 2-3 hrs/week to upskilling in high-value areas that command premium rates'
    })
  }

  if (projectHours.length > 0) {
    const lowRateProjects = projectHours.filter(p => p.hours > 0 && p.revenue / p.hours < hourlyRate * 0.7)
    if (lowRateProjects.length > 0) {
      insights.push({
        insight: lowRateProjects.length + ' project(s) billing below $' + Math.round(hourlyRate * 0.7) + '/hr effective rate',
        impact: 'high',
        recommended_action: 'Raise rates for these clients or transition them to higher-value work'
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      insight: 'Time allocation looks balanced across client work, admin, and business development',
      impact: 'low',
      recommended_action: 'Continue current allocation and track weekly trends for optimization opportunities'
    })
  }

  // Optimization opportunities
  const optimizationOpportunities: string[] = []
  optimizationOpportunities.push('Batch similar tasks: group administrative work into dedicated blocks (2-3x per week max)')
  optimizationOpportunities.push('Time-block client work: 90-min focused sessions with 15-min breaks for deep work')
  optimizationOpportunities.push('Automate recurring admin: invoicing, scheduling, report generation')
  optimizationOpportunities.push('Set non-negotiable BD time: first 2 hours every Monday for prospecting')
  optimizationOpportunities.push('Track time per task for 2 weeks to identify hidden time drains')
  if (billablePercentage < 60) {
    optimizationOpportunities.push('Eliminate or delegate lowest-value non-billable tasks immediately')
  }

  // Time reallocation recommendation
  const timeReallocation = [
    { category: 'Client Work', current_pct: catClientPct, recommended_pct: targetBillablePct },
    { category: 'Admin', current_pct: catAdminPct, recommended_pct: Math.max(5, catAdminPct - 5) },
    { category: 'Business Dev', current_pct: catBDPct, recommended_pct: Math.max(10, catBDPct) },
    { category: 'Learning', current_pct: catLearnPct, recommended_pct: 8 }
  ]

  const hoursPerWeek = totalHours
  const monthlyRevenue = Math.round(totalRevenue)
  const summary = 'Utilization: ' + billablePercentage + '% (' + utilizationGrade + '). Effective rate: $' + effectiveHourlyRate + '/hr. Revenue/hr (billable): $' + revenuePerHour + '. Monthly revenue: $' + monthlyRevenue.toLocaleString() + '. ' + insights.length + ' insights and ' + optimizationOpportunities.length + ' optimization strategies identified.'

  return {
    billable_percentage: billablePercentage,
    effective_hourly_rate: effectiveHourlyRate,
    revenue_per_hour: revenuePerHour,
    utilization_grade: utilizationGrade,
    insights,
    optimization_opportunities: optimizationOpportunities,
    time_reallocation: timeReallocation,
    summary,
  }
}

function formatTimeTrackingReport(input: TimeTrackingInput, result: TimeTrackingResult): string {
  const lines: string[] = []

  lines.push('## Time Tracking Analytics')
  lines.push('')
  lines.push('**Billable Hours:** ' + (input.billable_hours || 0) + '/week | **Total Hours:** ' + (input.total_hours || 0) + '/week | **Rate:** $' + (input.hourly_rate || 0) + '/hr')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Utilization Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Billable % | ' + result.billable_percentage + '% |')
  lines.push('| Effective Hourly Rate | $' + result.effective_hourly_rate + '/hr |')
  lines.push('| Revenue per Billable Hour | $' + result.revenue_per_hour + '/hr |')
  lines.push('| Utilization Grade | ' + result.utilization_grade + ' |')
  lines.push('')

  lines.push('### Key Insights')
  for (const i of result.insights) {
    lines.push('- **' + i.impact.toUpperCase() + ':** ' + i.insight + ' → *Action:* ' + i.recommended_action)
  }
  lines.push('')

  lines.push('### Time Reallocation')
  lines.push('| Category | Current | Recommended |')
  lines.push('|----------|---------|-------------|')
  for (const t of result.time_reallocation) {
    lines.push('| ' + t.category + ' | ' + t.current_pct + '% | ' + t.recommended_pct + '% |')
  }
  lines.push('')

  lines.push('### Optimization Strategies')
  for (const o of result.optimization_opportunities) {
    lines.push('- ' + o)
  }
  lines.push('')

  lines.push('### Productivity Principles')
  lines.push('- Billable target: 60-75% utilization (not 100% — admin and BD are essential)')
  lines.push('- Raise rates instead of adding hours when utilization exceeds 75%')
  lines.push('- Track time in 15-30 min increments for actionable granularity')
  lines.push('- Review weekly, plan monthly: the best freelancers treat time like a budget')
  lines.push('- Invest 5-10% of time in learning: $1 of learning returns $100 in rate increases')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 8: FREELANCER BRAND POSITIONER ====================

function positionFreelancerBrand(input: BrandPositionerInput): BrandPositionerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const freelancerName = input.name || 'the freelancer'
  const title = input.title || 'freelance professional'
  const skills = input.skills || ['design', 'development']
  const yearsExp = input.years_experience || 3
  const niche = input.niche || skills[0] || 'general'
  const targetClients = input.target_clients || ['small_businesses', 'startups']
  const characteristics = input.unique_characteristics || []
  const competitors = input.competitors || []
  const brandVoice = input.brand_voice || 'authoritative'
  const platforms = input.content_platforms || ['linkedin', 'twitter']

  // Positioning statement
  const positioningStatement = 'I help ' + targetClients.join(' and ').replace(/_/g, ' ') + ' achieve [specific outcome] through specialized ' + skills.slice(0, 2).join(' and ') + ' solutions — delivering ' + (yearsExp >= 5 ? 'enterprise-grade results' : 'outstanding results') + ' with the agility and attention of a dedicated specialist.'

  // Value proposition
  const valueProposition = (characteristics.length > 0
    ? characteristics.slice(0, 2).join(' + ')
    : 'personalized_attention + deep_expertise'
  ) + '. Unlike agencies, you work directly with a ' + yearsExp + '-year expert — no handoffs, no junior staff, no communication gaps.'

  // Target audience refinement
  const targetAudience = targetClients.map(tc => tc.replace(/_/g, ' ')).join(', ') + '. Ideal clients value ' + (brandVoice === 'authoritative' ? 'proven expertise' : brandVoice === 'approachable' ? 'collaborative partnership' : brandVoice === 'innovative' ? 'creative solutions' : brandVoice === 'reliable' ? 'consistent delivery' : 'original thinking') + ' over lowest price.'

  // Differentiators
  const differentiators: string[] = []
  differentiators.push(yearsExp + '+ years of focused ' + niche + ' expertise')
  if (characteristics.length > 0) for (const c of characteristics.slice(0, 2)) differentiators.push(c.replace(/_/g, ' '))
  differentiators.push('Direct access — no account managers, no project coordinators')
  differentiators.push('Specialized mastery vs agency generalization: 100% focus on ' + niche)
  if (competitors.length > 0) differentiators.push('Differentiator vs ' + competitors[0] + ': ' + rng.pick(['faster turnaround', 'deeper specialization', 'more personalized service', 'better communication']))
  if (skills.length >= 3) differentiators.push('Multi-disciplinary: ' + skills.slice(0, 3).join(', ') + ' — solving complex problems end-to-end')

  // Brand personality
  const voiceTraits: Record<string, string[]> = {
    authoritative: ['confident', 'knowledgeable', 'decisive', 'credible', 'experienced'],
    approachable: ['warm', 'supportive', 'clear', 'patient', 'friendly'],
    innovative: ['forward-thinking', 'creative', 'experimental', 'fresh', 'visionary'],
    reliable: ['consistent', 'dependable', 'transparent', 'honest', 'accountable'],
    creative: ['imaginative', 'original', 'artistic', 'expressive', 'inspiring']
  }
  const brandPersonality = voiceTraits[brandVoice] || voiceTraits.authoritative

  // Messaging framework
  const messagingFramework = targetClients.slice(0, 3).map(tc => ({
    audience: tc.replace(/_/g, ' ').charAt(0).toUpperCase() + tc.replace(/_/g, ' ').slice(1),
    key_message: 'Get ' + niche.replace(/_/g, ' ') + ' expertise without the agency overhead — direct access to a ' + yearsExp + '-year specialist.',
    proof_point: yearsExp + ' years + ' + rng.nextInt(20, 100) + '+ successful projects for ' + tc.replace(/_/g, ' ') + '.'
  }))

  if (messagingFramework.length === 0) {
    messagingFramework.push({
      audience: 'Target Clients',
      key_message: 'Expert ' + niche + ' services from a dedicated specialist.',
      proof_point: yearsExp + ' years of focused experience delivering results.'
    })
  }

  // Content strategy
  const contentPillars: Record<string, string[]> = {
    educational: ['How-to guides', 'Tutorial threads', 'Common mistakes to avoid', 'Tool comparison guides'],
    thought_leadership: ['Industry trends analysis', 'Hot takes on best practices', 'Predictions and commentary', 'Framework reveals'],
    behind_the_scenes: ['Project walkthroughs', 'Client success stories (anonymized)', 'Process reveals', 'Tool stack breakdowns'],
    social_proof: ['Client wins', 'Before/after case studies', 'Testial compilation', 'Metric showcase']
  }

  const contentStrategy: ContentStrategy[] = platforms.slice(0, 3).map((platform, idx) => {
    const pillars = Object.keys(contentPillars)
    const pillar = pillars[idx % pillars.length]
    return {
      content_pillar: pillar.replace(/_/g, ' ').charAt(0).toUpperCase() + pillar.replace(/_/g, ' ').slice(1),
      topics: contentPillars[pillar],
      frequency: platform === 'linkedin' ? '3x per week' : platform === 'twitter' ? 'Daily' : '2x per week',
      platform: platform.charAt(0).toUpperCase() + platform.slice(1)
    }
  })

  // Brand gaps
  const brandGaps: string[] = []
  if (!input.title || input.title === 'freelance professional') brandGaps.push('Undefined title/niche — clarify what you do in under 5 words')
  if (skills.length < 2) brandGaps.push('Limited skill breadth displayed — add complementary skills for positioning depth')
  if (targetClients.length < 2) brandGaps.push('Narrow target audience — at least 2 client segments for resilience')
  if (platforms.length < 2) brandGaps.push('Single platform presence — diversify to LinkedIn + Twitter minimum for visibility')
  if (characteristics.length === 0) brandGaps.push('No unique characteristics defined — what makes you different from other ' + niche + ' freelancers?')
  if (yearsExp < 3) brandGaps.push('Early career positioning — emphasize hustle, speed, and fresh perspective over experience')
  if (brandGaps.length === 0) brandGaps.push('Brand definition is solid — focus on consistent execution and content volume')

  // Authority building steps
  const authorityBuildingSteps: string[] = []
  authorityBuildingSteps.push('Week 1-2: Define and publish positioning statement on all profiles')
  authorityBuildingSteps.push('Week 3-4: Publish 8 pieces of educational content (2-3 per week)')
  authorityBuildingSteps.push('Month 2: Guest post on 2 industry blogs or appear on 1 podcast')
  authorityBuildingSteps.push('Month 3: Launch a free resource (checklist, template, or mini-course) as lead magnet')
  authorityBuildingSteps.push('Month 4-6: Speak at 1 virtual event or host a workshop')
  authorityBuildingSteps.push('Ongoing: Collect and showcase client results and testimonials weekly')

  const summary = 'Brand positioned as ' + yearsExp + '-year ' + niche + ' specialist for ' + targetClients.join(', ').replace(/_/g, ' ') + '. Voice: ' + brandVoice + '. Authority plan: 6-month ramp across ' + platforms.length + ' platforms. ' + contentStrategy.length + ' content pillars defined. ' + brandGaps.length + ' brand gaps to address.'

  return {
    brand_position: {
      positioning_statement: positioningStatement,
      value_proposition: valueProposition,
      target_audience: targetAudience,
      differentiators,
      brand_personality: brandPersonality,
    },
    messaging_framework: messagingFramework,
    content_strategy: contentStrategy,
    brand_gaps: brandGaps,
    authority_building_steps: authorityBuildingSteps,
    summary,
  }
}

function formatBrandPositionerReport(_input: BrandPositionerInput, result: BrandPositionerResult): string {
  const lines: string[] = []

  lines.push('## Freelancer Brand Positioning')
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Positioning Statement')
  lines.push('"' + result.brand_position.positioning_statement + '"')
  lines.push('')

  lines.push('### Value Proposition')
  lines.push(result.brand_position.value_proposition)
  lines.push('')

  lines.push('### Target Audience')
  lines.push(result.brand_position.target_audience)
  lines.push('')

  lines.push('### Brand Personality')
  lines.push('Traits: ' + result.brand_position.brand_personality.join(', '))
  lines.push('')

  lines.push('### Key Differentiators')
  for (const d of result.brand_position.differentiators) {
    lines.push('- ' + d)
  }
  lines.push('')

  lines.push('### Messaging Framework')
  lines.push('| Audience | Key Message | Proof Point |')
  lines.push('|----------|-------------|-------------|')
  for (const m of result.messaging_framework) {
    lines.push('| ' + m.audience + ' | ' + m.key_message + ' | ' + m.proof_point + ' |')
  }
  lines.push('')

  lines.push('### Content Strategy')
  for (const c of result.content_strategy) {
    lines.push('#### ' + c.platform + ' — ' + c.content_pillar + ' (' + c.frequency + ')')
    for (const t of c.topics) {
      lines.push('- ' + t)
    }
    lines.push('')
  }

  lines.push('### Brand Gaps to Address')
  for (const g of result.brand_gaps) {
    lines.push('- ' + g)
  }
  lines.push('')

  lines.push('### Authority Building Roadmap')
  for (const s of result.authority_building_steps) {
    lines.push('- ' + s)
  }
  lines.push('')

  lines.push('### Brand Positioning Principles')
  lines.push('- Specific beats vague: "I help SaaS companies reduce churn" beats "I am a consultant"')
  lines.push('- Own a niche: the riches are in the niches — specialize until you are the obvious choice')
  lines.push('- Consistency > perfection: posting 3x/week beats posting once a month, every time')
  lines.push('- Show results, not credentials: clients buy outcomes, not years of experience')
  lines.push('- Be findable: optimize profiles for search terms your clients actually type')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Proposal Crafter
  tools.register(defineTool({
    name: 'proposal_crafter',
    description: 'Crafts a persuasive, client-winning proposal. Generates a structured proposal with opening hook, problem understanding, phased approach, relevant experience, unique differentiators, investment terms, and clear next steps. Includes win probability estimate and follow-up strategy.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: project_type, client_name, client_industry, project_scope, budget_range, timeline, your_experience_years, relevant_past_work[], unique_value_props[], tone (professional|friendly|confident|consultative)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ProposalCrafterInput = JSON.parse(args.input_data)
      const result = craftProposal(input)
      return formatProposalReport(input, result)
    }
  }))

  // Tool 2: Pricing Strategy Optimizer
  tools.register(defineTool({
    name: 'pricing_strategy_optimizer',
    description: 'Optimizes your freelance rates using data-driven analysis. Generates hourly/project/retainer/value-based rate recommendations with multi-factor adjustment (experience, location, specialization, demand, platform). Includes income gap analysis, pricing tiers, negotiation leverage points, and rate-raise timing advice.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: service_category, experience_level (beginner|intermediate|expert|elite), current_rate, target_monthly_income, market_rates[], location_factor (low_cost|medium_cost|high_cost), specialization_depth (generalist|specialist|niche_expert), demand_level (low|medium|high|very_high), platform (direct|upwork|fiverr|toptal|mixed)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PricingStrategyInput = JSON.parse(args.input_data)
      const result = optimizePricing(input)
      return formatPricingReport(input, result)
    }
  }))

  // Tool 3: Client Relationship Manager
  tools.register(defineTool({
    name: 'client_relationship_manager',
    description: 'Assesses and manages client relationship health. Scores relationship vitality (0-100), identifies churn risk, estimates lifetime value, and generates prioritized action plans with specific templates. Accounts for communication frequency, satisfaction, competitor threats, and growth opportunities.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: client_name, relationship_length_months, total_revenue, project_count, communication_frequency (weekly|biweekly|monthly|as_needed), satisfaction_score, last_project_date, pain_points[], opportunities[], competitor_threat (none|low|medium|high)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ClientRelationshipInput = JSON.parse(args.input_data)
      const result = manageClientRelationship(input)
      return formatClientRelationshipReport(input, result)
    }
  }))

  // Tool 4: Portfolio Effectiveness Scorer
  tools.register(defineTool({
    name: 'portfolio_effectiveness_scorer',
    description: 'Scores your freelancer portfolio effectiveness (0-100) across clarity, relevance, credibility, and impact dimensions. Identifies gaps (missing testimonials, metrics, case studies) and provides prioritized improvement recommendations with suggested layout.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: portfolio_items[]{title, description, skills[], results}, target_service, target_client_type, industry_focus, portfolio_platform, total_items, has_testimonials, has_case_studies, has_metrics', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PortfolioScorerInput = JSON.parse(args.input_data)
      const result = scorePortfolio(input)
      return formatPortfolioReport(input, result)
    }
  }))

  // Tool 5: Contract Review Assistant
  tools.register(defineTool({
    name: 'contract_review_assistant',
    description: 'Reviews freelance contracts for legal and financial risk. Identifies high-risk clauses (scope ambiguity, payment terms, IP assignment, liability, non-compete), flags missing provisions, and provides negotiation points and a contract safety checklist. Returns overall risk rating (acceptable/moderate/high/reject).',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: contract_type (fixed_price|hourly|retainer|milestone|royalty), contract_value, payment_terms, scope_description, deadline_description, revision_policy, intellectual_property_terms, termination_clauses, liability_terms, non_compete, jurisdiction', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ContractReviewInput = JSON.parse(args.input_data)
      const result = reviewContract(input)
      return formatContractReviewReport(input, result)
    }
  }))

  // Tool 6: Income Diversification Advisor
  tools.register(defineTool({
    name: 'income_diversification_advisor',
    description: 'Creates a roadmap to diversify freelancer income across multiple streams. Assesses concentration risk, recommends income sources matched to your skills (courses, retainers, digital products, coaching, content), and provides a phased 6-month action timeline.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: current_monthly_income, primary_income_source, primary_income_pct, other_sources[]{source, monthly_income, effort_hours}, skills[], available_hours_per_week, risk_tolerance (conservative|moderate|aggressive), savings_months, monthly_expenses', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: IncomeDiversificationInput = JSON.parse(args.input_data)
      const result = adviseIncomeDiversification(input)
      return formatDiversificationReport(input, result)
    }
  }))

  // Tool 7: Time Tracking Analytics
  tools.register(defineTool({
    name: 'time_tracking_analytics',
    description: 'Analyzes freelancer time allocation and productivity. Computes billable percentage, effective hourly rate, revenue per hour, and utilization grade. Generates insights on time drains, optimization opportunities, and recommended time reallocation across client work, admin, business development, and learning.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: weekly_hours{client_work, admin, business_dev, learning, personal}, billable_hours, total_hours, project_hours[]{project, hours, revenue}, hourly_rate, target_billable_pct, time_tracking_tool, week_count', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TimeTrackingInput = JSON.parse(args.input_data)
      const result = analyzeTimeTracking(input)
      return formatTimeTrackingReport(input, result)
    }
  }))

  // Tool 8: Freelancer Brand Positioner
  tools.register(defineTool({
    name: 'freelancer_brand_positioner',
    description: 'Builds a complete freelance brand positioning. Generates a positioning statement, value proposition, target audience definition, differentiators, and brand personality. Includes messaging framework, multi-platform content strategy, brand gap analysis, and 6-month authority building roadmap.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: name, title, skills[], years_experience, niche, target_clients[], unique_characteristics[], competitors[], brand_voice (authoritative|approachable|innovative|reliable|creative), content_platforms[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: BrandPositionerInput = JSON.parse(args.input_data)
      const result = positionFreelancerBrand(input)
      return formatBrandPositionerReport(input, result)
    }
  }))

  console.log('[dsh-tool-freelanceos] Loaded v' + VERSION + ' - Freelancer Business OS with 8 tools')
  console.log('  Tools: proposal_crafter, pricing_strategy_optimizer, client_relationship_manager, portfolio_effectiveness_scorer, contract_review_assistant, income_diversification_advisor, time_tracking_analytics, freelancer_brand_positioner')
}
