/**
 * DSH One Person Company (OPC) Operations Center Plugin v0.1.0
 *
 * The hottest 2026 entrepreneurship trend: one person + AI agents = a full business team.
 * This toolkit provides AI-leveraged solopreneurs with viability scoring, team architecture,
 * revenue optimization, automation auditing, time budgeting, moat analysis, legal compliance,
 * and growth catalysts — all optimized for the $10k/mo solo operator.
 *
 * Features (v0.1.0):
 * - OPC Viability Scorer (score business idea viability for one-person execution, 0-100)
 * - AI Team Architect (design AI agent team structure replacing human roles)
 * - Revenue Model Optimizer (optimize pricing/revenue model for solo operators)
 * - Automation Audit (audit which business processes can be fully automated)
 * - Time Budget Planner (plan weekly time allocation: human vs AI tasks)
 * - Moat Analyzer (analyze competitive moat for solo-built products)
 * - Legal Compliance Checker (one-person company legal/tax compliance)
 * - Growth Catalyst Finder (find growth catalysts achievable by 1-person + AI)
 *
 * @module dsh-tool-opcenter
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-opcenter'
export const inject = ['tools']

const VERSION = '0.1.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute legal, financial, or tax advice. Consult qualified professionals before making business decisions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG, seed 42) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(42)

function rngRange(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function rngFloat(min: number, max: number): number {
  return rng() * (max - min) + min
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: OPC Viability Scorer ---
interface ViabilityInput {
  business_name?: string
  idea_description?: string
  category?: string
  target_market?: string
  required_skills?: string[]
  available_budget?: number
  time_commitment_hrs_per_week?: number
  has_audience?: boolean
  ai_leverage_potential?: 'low' | 'medium' | 'high'
}

interface ViabilityResult {
  overall_score: number
  category_scores: {
    market_demand: number
    ai_leverage: number
    solo_feasibility: number
    revenue_potential: number
    time_efficiency: number
    scalability: number
  }
  verdict: 'excellent' | 'strong' | 'viable' | 'marginal' | 'poor'
  key_strengths: string[]
  key_risks: string[]
  recommendations: string[]
}

// --- Tool 2: AI Team Architect ---
interface TeamArchitectInput {
  business_type?: string
  current_roles_needed?: string[]
  budget_per_month?: number
  tools_ecosystem?: string[]  // e.g. ['Notion', 'Zapier', 'Make', 'Claude']
  complexity_level?: 'simple' | 'moderate' | 'advanced'
}

interface AIAgentRole {
  role_name: string
  replaces: string
  ai_tool: string
  monthly_cost: number
  human_oversight_hrs_per_week: number
  effectiveness_pct: number
}

interface TeamArchitectureResult {
  total_monthly_cost: number
  total_human_oversight_hrs: number
  team_size: number
  leverage_ratio: string
  roles: AIAgentRole[]
  summary: string
}

// --- Tool 3: Revenue Model Optimizer ---
interface RevenueOptimizerInput {
  product_type?: 'info_product' | 'micro_saas' | 'productized_service' | 'digital_agency' | 'content' | 'marketplace'
  current_mrr?: number
  target_mrr?: number
  current_pricing?: string
  audience_size?: number
  churn_rate?: number
  delivery_capacity_hrs?: number
}

interface RevenueModelResult {
  recommended_model: string
  pricing_tiers: Array<{ tier: string; price: string; features: string; target_segment: string }>
  projected_mrr: number
  path_to_10k: string
  platform_recommendations: string[]
  optimization_tips: string[]
}

// --- Tool 4: Automation Audit ---
interface AutomationAuditInput {
  business_name?: string
  processes?: Array<{ name: string; frequency: string; time_perOccurrence_min: number; complexity: 'low' | 'medium' | 'high'; current_tool: string }>
  tech_stack?: string[]
  automation_budget?: number
}

interface AutomationFinding {
  process: string
  automationpotential_pct: number
  recommended_tool: string
  monthly_savings_hrs: number
  setup_effort: 'low' | 'medium' | 'high'
  roi_months: number
}

interface AutomationAuditResult {
  total_processes: number
  automatable_pct: number
  total_monthly_savings_hrs: number
  findings: AutomationFinding[]
  priority_order: string[]
  summary: string
}

// --- Tool 5: Time Budget Planner ---
interface TimeBudgetInput {
  total_weekly_hrs?: number
  deep_work_hrs_per_day?: number
  business_functions?: string[]
  energy_pattern?: 'morning_person' | 'night_owl' | 'flexible'
  current_bottlenecks?: string[]
}

interface TimeBlock {
  day: string
  time_slot: string
  activity: string
  owner: 'human' | 'ai' | 'hybrid'
  category: string
}

interface TimeBudgetResult {
  total_human_hrs: number
  total_ai_hrs: number
  total_hybrid_hrs: number
  deep_work_blocks: number
  schedule: TimeBlock[]
  optimization_tips: string[]
  summary: string
}

// --- Tool 6: Moat Analyzer ---
interface MoatAnalyzerInput {
  product_name?: string
  category?: string
  unique_assets?: string[]
  network_effects?: boolean
  switching_costs?: 'low' | 'medium' | 'high'
  data_advantage?: boolean
  brand_strength?: 'nascent' | 'growing' | 'established'
  competitors_count?: number
}

interface MoatResult {
  moat_score: number
  moat_type: string
  moat_strength: 'strong' | 'moderate' | 'weak' | 'none'
  analysis: Array<{ factor: string; score: number; assessment: string }>
  strategy_recommendations: string[]
  defensibility_timeline: string
  summary: string
}

// --- Tool 7: Legal Compliance Checker ---
interface LegalComplianceInput {
  business_name?: string
  jurisdiction?: string
  business_structure?: 'sole_proprietor' | 'llc' | 'opc' | 'pte_ltd'
  revenue_last_12mo?: number
  sells_digital?: boolean
  sells_physical?: boolean
  has_employees?: boolean
  international_customers?: boolean
  data_collection?: boolean
}

interface ComplianceItem {
  requirement: string
  status: 'compliant' | 'action_needed' | 'not_applicable'
  priority: 'critical' | 'high' | 'medium' | 'low'
  deadline: string
  notes: string
}

interface LegalComplianceResult {
  overall_status: 'compliant' | 'partial' | 'action_needed'
  compliance_score: number
  items: ComplianceItem[]
  critical_actions: string[]
  estimated_setup_costs: string
  summary: string
}

// --- Tool 8: Growth Catalyst Finder ---
interface GrowthCatalystInput {
  business_name?: string
  current_mrr?: number
  current_users?: number
  channels_active?: string[]
  content_output?: string
  networking_level?: 'low' | 'medium' | 'high'
  budget_for_growth?: number
  timeframe_months?: number
}

interface GrowthCatalyst {
  name: string
  description: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  speed: 'immediate' | 'weeks' | 'months'
  ai_leverage: boolean
  expected_mrr_increase_pct: number
  platform: string
}

interface GrowthCatalystResult {
  top_catalysts: GrowthCatalyst[]
  quick_wins: GrowthCatalyst[]
  long_term_bets: GrowthCatalyst[]
  projected_mrr_3mo: number
  ai_amplification_tips: string[]
  summary: string
}

// ==================== TOOL 1: OPC VIABILITY SCORER ====================

function scoreViability(input: ViabilityInput): ViabilityResult {
  const ideaDesc = (input.idea_description || '').toLowerCase()
  const category = (input.category || 'general').toLowerCase()
  const skills = input.required_skills || []
  const budget = input.available_budget || 500
  const timeHrs = input.time_commitment_hrs_per_week || 20

  // Market demand scoring
  let marketDemand = rngRange(55, 85)
  if (ideaDesc.includes('ai') || ideaDesc.includes('automation')) marketDemand += 8
  if (ideaDesc.includes('micro-saas') || ideaDesc.includes('microsaas')) marketDemand += 6
  if (input.has_audience) marketDemand += 10
  marketDemand = clamp(marketDemand, 20, 98)

  // AI leverage scoring
  let aiLeverage = rngRange(50, 80)
  if (input.ai_leverage_potential === 'high') aiLeverage += 15
  else if (input.ai_leverage_potential === 'medium') aiLeverage += 5
  else if (input.ai_leverage_potential === 'low') aiLeverage -= 10
  if (category.includes('content') || category.includes('software') || category.includes('data')) aiLeverage += 5
  aiLeverage = clamp(aiLeverage, 15, 99)

  // Solo feasibility
  let soloFeasibility = rngRange(45, 75)
  if (skills.length <= 3) soloFeasibility += 10
  if (skills.length > 7) soloFeasibility -= 8
  if (budget < 200) soloFeasibility -= 5
  if (budget > 2000) soloFeasibility += 5
  soloFeasibility = clamp(soloFeasibility, 20, 98)

  // Revenue potential
  let revenuePotential = rngRange(40, 70)
  if (category.includes('saas')) revenuePotential += 15
  if (category.includes('info') || category.includes('course')) revenuePotential += 10
  if (category.includes('service') || category.includes('agency')) revenuePotential += 5
  if (input.target_market && input.target_market.toLowerCase().includes('b2b')) revenuePotential += 8
  revenuePotential = clamp(revenuePotential, 20, 98)

  // Time efficiency
  let timeEfficiency = rngRange(50, 75)
  if (timeHrs >= 20 && timeHrs <= 30) timeEfficiency += 5
  if (timeHrs >= 40) timeEfficiency -= 5  // burnout risk
  if (input.ai_leverage_potential === 'high') timeEfficiency += 10
  timeEfficiency = clamp(timeEfficiency, 20, 98)

  // Scalability
  let scalability = rngRange(45, 70)
  if (category.includes('digital') || category.includes('saas') || category.includes('content')) scalability += 12
  if (category.includes('service')) scalability -= 5
  if (input.ai_leverage_potential === 'high') scalability += 8
  scalability = clamp(scalability, 20, 98)

  const scores = {
    market_demand: marketDemand,
    ai_leverage: aiLeverage,
    solo_feasibility: soloFeasibility,
    revenue_potential: revenuePotential,
    time_efficiency: timeEfficiency,
    scalability: scalability,
  }

  const overall = Math.round(
    marketDemand * 0.2 + aiLeverage * 0.2 + soloFeasibility * 0.15 +
    revenuePotential * 0.2 + timeEfficiency * 0.15 + scalability * 0.1
  )

  let verdict: ViabilityResult['verdict'] = 'viable'
  if (overall >= 85) verdict = 'excellent'
  else if (overall >= 70) verdict = 'strong'
  else if (overall >= 55) verdict = 'viable'
  else if (overall >= 40) verdict = 'marginal'
  else verdict = 'poor'

  const strengths: string[] = []
  const risks: string[] = []
  const recommendations: string[] = []

  if (marketDemand > 70) strengths.push(`Strong market demand signals (${marketDemand}/100)`)
  else risks.push(`Market demand validation needed (${marketDemand}/100)`)

  if (aiLeverage > 70) strengths.push(`High AI leverage potential (${aiLeverage}/100) - key OPC advantage`)
  else risks.push(`Limited AI automation (${aiLeverage}/100) - may require more manual work`)

  if (soloFeasibility > 65) strengths.push(`Solo execution is realistic (${soloFeasibility}/100)`)
  else risks.push(`High complexity for solo execution (${soloFeasibility}/100)`)

  if (revenuePotential > 65) strengths.push(`Clear path to $10k/mo (${revenuePotential}/100 revenue potential)`)
  else risks.push(`Revenue ceiling may be below OPC targets (${revenuePotential}/100)`)

  if (timeEfficiency > 65) strengths.push(`Efficient time use possible (${timeEfficiency}/100)`)
  else risks.push(`Time-intensive model — consider AI delegation (${timeEfficiency}/100)`)

  if (scalability > 65) strengths.push(`Good scalability for 1-person + AI model (${scalability}/100)`)

  recommendations.push('Validate demand with a minimum landing page and waitlist before building')
  if (aiLeverage < 70) recommendations.push('Identify additional AI automation opportunities to increase leverage')
  recommendations.push('Aim for a productized service or digital product to maximize solo output')
  recommendations.push('Join OPC communities (IndieHackers, SuperProductive) for benchmarking')
  if (revenuePotential > 60) recommendations.push('Start with a high-ticket offering to reach $10k/mo faster')

  return {
    overall_score: overall,
    category_scores: scores,
    verdict,
    key_strengths: strengths,
    key_risks: risks,
    recommendations,
  }
}

function formatViabilityReport(input: ViabilityInput, result: ViabilityResult): string {
  const lines: string[] = []
  const verdictEmoji = result.verdict === 'excellent' ? 'EXCELLENT' : result.verdict === 'strong' ? 'STRONG' : result.verdict === 'viable' ? 'VIABLE' : result.verdict === 'marginal' ? 'MARGINAL' : 'POOR'

  lines.push('## OPC Viability Score')
  lines.push('')
  lines.push(`**${input.business_name || 'Unnamed Business'}** — ${verdictEmoji} (${result.overall_score}/100)`)
  lines.push('')
  lines.push('### Category Breakdown')
  lines.push('| Category | Score | Rating |')
  lines.push('|----------|-------|--------|')
  lines.push(`| Market Demand | ${result.category_scores.market_demand}/100 | ${rateScore(result.category_scores.market_demand)} |`)
  lines.push(`| AI Leverage | ${result.category_scores.ai_leverage}/100 | ${rateScore(result.category_scores.ai_leverage)} |`)
  lines.push(`| Solo Feasibility | ${result.category_scores.solo_feasibility}/100 | ${rateScore(result.category_scores.solo_feasibility)} |`)
  lines.push(`| Revenue Potential | ${result.category_scores.revenue_potential}/100 | ${rateScore(result.category_scores.revenue_potential)} |`)
  lines.push(`| Time Efficiency | ${result.category_scores.time_efficiency}/100 | ${rateScore(result.category_scores.time_efficiency)} |`)
  lines.push(`| Scalability | ${result.category_scores.scalability}/100 | ${rateScore(result.category_scores.scalability)} |`)
  lines.push('')

  if (result.key_strengths.length > 0) {
    lines.push('### Key Strengths')
    for (const s of result.key_strengths) {
      lines.push(`- ${s}`)
    }
    lines.push('')
  }

  if (result.key_risks.length > 0) {
    lines.push('### Key Risks')
    for (const r of result.key_risks) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 2: AI TEAM ARCHITECT ====================

function designTeamStructure(input: TeamArchitectInput): TeamArchitectureResult {
  const businessType = (input.business_type || 'micro-saas').toLowerCase()
  const rolesNeeded = input.current_roles_needed || ['marketing', 'content', 'customer_support', 'development', 'sales', 'admin']
  const budget = input.budget_per_month || 200
  const tools = input.tools_ecosystem || ['Notion', 'Zapier', 'Claude', 'Make']
  const complexity = input.complexity_level || 'moderate'

  const roleDefinitions: Array<Omit<AIAgentRole, 'monthly_cost' | 'human_oversight_hrs_per_week' | 'effectiveness_pct'> & { base_cost: number; base_oversight: number; base_effectiveness: number }> = [
    { role_name: 'Content Creator Agent', replaces: 'Content Marketer + Copywriter', ai_tool: 'Claude + Jasper', base_cost: 30, base_oversight: 2, base_effectiveness: 80 },
    { role_name: 'Customer Support Agent', replaces: 'Support Team (2-3 people)', ai_tool: 'Claude + Intercom AI', base_cost: 40, base_oversight: 3, base_effectiveness: 75 },
    { role_name: 'Marketing Automation Agent', replaces: 'Growth Marketer', ai_tool: 'Make + Zapier + Claude', base_cost: 50, base_oversight: 2, base_effectiveness: 70 },
    { role_name: 'Sales Outreach Agent', replaces: 'SDR/BDR Team', ai_tool: 'Apollo.io + Claude', base_cost: 60, base_oversight: 4, base_effectiveness: 65 },
    { role_name: 'Data Analyst Agent', replaces: 'Data Analyst', ai_tool: 'Claude + Notion + Spreadsheets', base_cost: 20, base_oversight: 1, base_effectiveness: 85 },
    { role_name: 'Development Assistant', replaces: 'Junior Developer', ai_tool: 'Claude Code + Cursor', base_cost: 40, base_oversight: 3, base_effectiveness: 75 },
    { role_name: 'Operations Manager Agent', replaces: 'Project Manager + VA', ai_tool: 'Notion AI + Claude + Zapier', base_cost: 30, base_oversight: 2, base_effectiveness: 80 },
    { role_name: 'Social Media Agent', replaces: 'Social Media Manager', ai_tool: 'Buffer + Claude + Midjourney', base_cost: 45, base_oversight: 2, base_effectiveness: 70 },
    { role_name: 'Finance Agent', replaces: 'Bookkeeper + Accountant Assistant', ai_tool: 'Claude + Stripe Dashboard', base_cost: 15, base_oversight: 1, base_effectiveness: 85 },
    { role_name: 'Research Agent', replaces: 'Market Researcher', ai_tool: 'Claude + Perplexity', base_cost: 20, base_oversight: 1, base_effectiveness: 80 },
  ]

  // Select roles based on needed functions
  const selectedRoles: AIAgentRole[] = []
  let totalCost = 0
  const multiplier = complexity === 'advanced' ? 1.3 : complexity === 'simple' ? 0.7 : 1.0

  for (const role of roleDefinitions) {
    const matches = rolesNeeded.some(r =>
      role.replaces.toLowerCase().includes(r.toLowerCase()) ||
      role.role_name.toLowerCase().includes(r.toLowerCase())
    )
    if (matches || selectedRoles.length < Math.min(rolesNeeded.length, 6)) {
      const adjustedCost = Math.round(role.base_cost * multiplier)
      if (totalCost + adjustedCost <= budget || selectedRoles.length < 4) {
        selectedRoles.push({
          role_name: role.role_name,
          replaces: role.replaces,
          ai_tool: role.ai_tool,
          monthly_cost: adjustedCost,
          human_oversight_hrs_per_week: role.base_oversight,
          effectiveness_pct: clamp(Math.round(role.base_effectiveness * rngFloat(0.85, 1.0)), 50, 95),
        })
        totalCost += adjustedCost
      }
    }
  }

  const totalOversight = selectedRoles.reduce((s, r) => s + r.human_oversight_hrs_per_week, 0)
  const peopleReplaced = selectedRoles.length * 1.5  // avg AI agent replaces 1.5 FTE
  const leverageRatio = `${peopleReplaced.toFixed(1)}:${1}` // N:1 leverage

  const summary = `AI team of ${selectedRoles.length} agents replaces ~${peopleReplaced.toFixed(1)} human roles for $${totalCost}/mo. Human oversight: ${totalOversight} hrs/week. Leverage ratio: ${leverageRatio} (humans replaced : you).`

  return {
    total_monthly_cost: totalCost,
    total_human_oversight_hrs: totalOversight,
    team_size: selectedRoles.length,
    leverage_ratio: leverageRatio,
    roles: selectedRoles,
    summary,
  }
}

function formatTeamArchitectureReport(input: TeamArchitectInput, result: TeamArchitectureResult): string {
  const lines: string[] = []

  lines.push('## AI Team Architecture Design')
  lines.push('')
  lines.push(`**${input.business_type || 'Micro-SaaS'}** — ${result.team_size} AI agents | $${result.total_monthly_cost}/mo | Leverage: ${result.leverage_ratio}`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Recommended AI Agent Roles')
  lines.push('| Role | Replaces | AI Tool | Cost/mo | Oversight (hrs/wk) | Effectiveness |')
  lines.push('|------|----------|---------|---------|---------------------|--------------|')
  for (const role of result.roles) {
    lines.push(`| ${role.role_name} | ${role.replaces} | ${role.ai_tool} | $${role.monthly_cost} | ${role.human_oversight_hrs_per_week} | ${role.effectiveness_pct}% |`)
  }
  lines.push('')

  lines.push('### Cost Comparison')
  lines.push('| Metric | Human Team | AI Team |')
  lines.push('|--------|-----------|---------|')
  lines.push(`| Monthly Cost | $${(result.total_monthly_cost * 8).toLocaleString()}+ | $${result.total_monthly_cost} |`)
  lines.push(`| Weekly Oversight | 0 hrs (managed) | ${result.total_human_oversight_hrs} hrs |`)
  lines.push(`| Headcount | ${(parseFloat(result.leverage_ratio)).toFixed(1)} FTE | 1 human + ${result.team_size} AI |`)
  lines.push('')

  lines.push('### Stack Recommendations')
  lines.push('- **Core AI**: Claude (reasoning), GPT-4o (speed), or Gemini (multimodal)')
  lines.push('- **Automation**: Zapier for simple flows, Make for complex multi-step workflows')
  lines.push('- **Knowledge Base**: Notion as team wiki + AI context source')
  lines.push('- **Project Management**: Linear or Notion with AI project summaries')
  lines.push('- **Monitoring**: Set up weekly AI performance review in 30 min')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 3: REVENUE MODEL OPTIMIZER ====================

function optimizeRevenue(input: RevenueOptimizerInput): RevenueModelResult {
  const productType = input.product_type || 'micro_saas'
  const currentMRR = input.current_mrr || 0
  const targetMRR = input.target_mrr || 10000
  const audience = input.audience_size || 500
  const churn = input.churn_rate || 0.05
  const capacity = input.delivery_capacity_hrs || 20

  let recommendedModel = ''
  let pricingTiers: RevenueModelResult['pricing_tiers'] = []
  let projectedMRR = currentMRR
  const platforms: string[] = []
  const tips: string[] = []

  switch (productType) {
    case 'info_product':
      recommendedModel = 'Tiered Digital Products + Cohort Course'
      platforms.push('Gumroad (0% fee after $1K)', 'LemonSqueezy (5% + 50c)', 'Teachable')
      pricingTiers = [
        { tier: 'Starter', price: '$29-$49', features: 'Core content + templates', target_segment: 'Budget-conscious learners' },
        { tier: 'Pro', price: '$97-$197', features: 'Full course + community access', target_segment: 'Committed learners' },
        { tier: 'Premium', price: '$297-$497', features: 'Course + 1:1 call + bonuses', target_segment: 'High-intent buyers' },
      ]
      projectedMRR = Math.min(targetMRR, Math.round(audience * 0.03 * 97 + rngRange(500, 2000)))
      tips.push('Launch a $7 tripwire upsell to convert leads faster')
      tips.push('Bundle multiple products at 30% discount for average order value boost')
      break
    case 'micro_saas':
      recommendedModel = 'SaaS Freemium + Pro + Team Tiers'
      platforms.push('Stripe (payment processing)', 'LemonSqueezy (Merchant of Record)', 'Paddle (tax handling)')
      pricingTiers = [
        { tier: 'Free', price: '$0', features: 'Core features, usage limits', target_segment: 'Trial users' },
        { tier: 'Pro', price: '$29-$49/mo', features: 'Full features + API access', target_segment: 'Solo professionals' },
        { tier: 'Team', price: '$79-$99/mo', features: 'Multi-seat + priority support', target_segment: 'Small teams' },
      ]
      projectedMRR = clamp(Math.round((1 - churn) * targetMRR * rngFloat(0.6, 0.9)), currentMRR, targetMRR + 5000)
      tips.push("Use Stripe's built-in trials (7-14 days) to reduce friction")
      tips.push('Annual billing at 20% discount improves cash flow and reduces churn')
      tips.push('Monitor net revenue retention (NRR) — target >90% for sustainable growth')
      break
    case 'productized_service':
      recommendedModel = 'Fixed-Scope Fixed-Price Service Tiers'
      platforms.push('Stripe (subscriptions)', 'LemonSqueezy (one-time)', 'Calendly (booking)')
      pricingTiers = [
        { tier: 'Essential', price: '$499-$999', features: 'Defined deliverable, 5-day turnaround', target_segment: 'Budget-conscious' },
        { tier: 'Growth', price: '$1,500-$2,500', features: 'Premium deliverable + revisions', target_segment: 'Growth-focused' },
        { tier: 'VIP', price: '$3,000-$5,000', features: 'White-glove + ongoing support', target_segment: 'Enterprise solo buyers' },
      ]
      projectedMRR = clamp(Math.round(capacity / 10 * 1500 * rngFloat(0.7, 1.0)), currentMRR, targetMRR)
      tips.push('Productize delivery with templates and AI to serve more clients in less time')
      tips.push('Cap client slots at 5-8/mo to maintain quality while hitting $10k+')
      tips.push('Use Zapier to automate onboarding forms and delivery workflows')
      break
    case 'content':
      recommendedModel = 'Newsletter + Sponsorships + Digital Products'
      platforms.push('Beehiiv or Substack (newsletter)', 'Gumroad (products)', 'ConvertKit (email)')
      pricingTiers = [
        { tier: 'Free List', price: '$0', features: 'Weekly newsletter', target_segment: 'Broad audience' },
        { tier: 'Paid Subscription', price: '$10-$15/mo', features: 'Premium content + early access', target_segment: 'Super fans' },
        { tier: 'Sponsorship', price: '$200-$500/mention', features: 'Newsletter/feature slot', target_segment: 'B2B advertisers' },
      ]
      projectedMRR = clamp(Math.round(audience * 0.05 * 12 + rngRange(200, 800)), currentMRR, targetMRR)
      tips.push('Focus on quality over quantity — 1,000 true fans can generate $10k/mo')
      tips.push('Use Beehiiv for growth tools (SEO, boosts, referral program)')
      break
    case 'digital_agency':
      recommendedModel = 'Retainer Packages + Project-Based Upsells'
      platforms.push('Stripe (invoicing)', 'LemonSqueezy (packaging)', 'Notion (client portals)')
      pricingTiers = [
        { tier: 'Base Retainer', price: '$2,000-$3,000/mo', features: 'Defined monthly deliverables', target_segment: 'Startups/SMBs' },
        { tier: 'Growth Retainer', price: '$5,000-$7,000/mo', features: 'Full-service + strategy', target_segment: 'Growth-stage' },
        { tier: 'Project', price: '$5,000-$15,000/each', features: 'One-off deliverables (website, branding)', target_segment: 'Project-based clients' },
      ]
      projectedMRR = clamp(Math.round(rngFloat(0.5, 0.9) * targetMRR), currentMRR, targetMRR + 3000)
      tips.push('Use AI to handle 60-70% of delivery work (copy, design, reporting)')
      tips.push('Cap at 3-4 retainer clients to maintain quality and hit $10k+ MRR')
      break
    case 'marketplace':
      recommendedModel = 'Commission + Listing Feeds + Premium Placement'
      platforms.push('Stripe Connect (payments)', 'Sharetribe (marketplace)', 'Gumroad (goods)')
      pricingTiers = [
        { tier: 'Free Listings', price: '$0 + 10% fee', features: 'Basic listing visibility', target_segment: 'Sellers' },
        { tier: 'Featured', price: '$49-$99/mo', features: 'Priority placement + analytics', target_segment: 'Power sellers' },
        { tier: 'Transaction', price: '5-15% per sale', features: 'Per-transaction fee', target_segment: 'All transactions' },
      ]
      projectedMRR = clamp(Math.round(rngFloat(0.4, 0.8) * targetMRR), currentMRR, targetMRR)
      tips.push('Start with a niche marketplace — broad marketplaces are capital-intensive')
      tips.push('Leverage AI for content moderation and seller onboarding support')
      break
  }

  const gap = targetMRR - currentMRR
  let pathTo10k = ''
  if (currentMRR >= targetMRR) {
    pathTo10k = `Already at/above $${targetMRR.toLocaleString()}/mo target. Focus on retention and expansion.`
  } else if (projectedMRR >= targetMRR) {
    pathTo10k = `Projected to reach $${targetMRR.toLocaleString()}/mo within 3-6 months at current growth trajectory. Key: maintain ${((1 - churn) * 100).toFixed(0)}% retention rate.`
  } else {
    pathTo10k = `Gap of $${(gap).toLocaleString()} to target. Recommend: increase pricing 20-30% OR double audience via content marketing. At current trajectory, ETA to $10k: ${Math.ceil(gap / Math.max(1, (projectedMRR - currentMRR)))} months.`
  }

  return {
    recommended_model: recommendedModel,
    pricing_tiers: pricingTiers,
    projected_mrr: projectedMRR,
    path_to_10k: pathTo10k,
    platform_recommendations: platforms,
    optimization_tips: tips,
  }
}

function formatRevenueModelReport(input: RevenueOptimizerInput, result: RevenueModelResult): string {
  const lines: string[] = []

  lines.push('## Revenue Model Optimization')
  lines.push('')
  lines.push(`**${(input.product_type || 'micro_saas').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}** — ${result.recommended_model}`)
  lines.push('')
  lines.push(`### Current Status`)
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Current MRR | $${(input.current_mrr || 0).toLocaleString()} |`)
  lines.push(`| Target MRR | $${(input.target_mrr || 10000).toLocaleString()} |`)
  lines.push(`| Projected MRR | $${result.projected_mrr.toLocaleString()} |`)
  lines.push(`| Audience Size | ${(input.audience_size || 0).toLocaleString()} |`)
  lines.push(`| Monthly Churn | ${((input.churn_rate || 0.05) * 100).toFixed(1)}% |`)
  lines.push('')

  lines.push('### Recommended Pricing Tiers')
  lines.push('| Tier | Price | Features | Target Segment |')
  lines.push('|------|-------|----------|----------------|')
  for (const tier of result.pricing_tiers) {
    lines.push(`| ${tier.tier} | ${tier.price} | ${tier.features} | ${tier.target_segment} |`)
  }
  lines.push('')

  lines.push('### Path to $10K/Month')
  lines.push(result.path_to_10k)
  lines.push('')

  lines.push('### Platform Recommendations')
  for (const p of result.platform_recommendations) {
    lines.push(`- ${p}`)
  }
  lines.push('')

  lines.push('### Optimization Tips')
  for (const tip of result.optimization_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 4: AUTOMATION AUDIT ====================

function auditAutomation(input: AutomationAuditInput): AutomationAuditResult {
  const processes = input.processes || [
    { name: 'Email Response', frequency: 'daily', time_perOccurrence_min: 30, complexity: 'low', current_tool: 'Gmail' },
    { name: 'Social Media Posting', frequency: 'daily', time_perOccurrence_min: 45, complexity: 'low', current_tool: 'Manual' },
    { name: 'Invoice Generation', frequency: 'weekly', time_perOccurrence_min: 20, complexity: 'low', current_tool: 'Spreadsheet' },
    { name: 'Customer Onboarding', frequency: 'weekly', time_perOccurrence_min: 60, complexity: 'medium', current_tool: 'Email' },
    { name: 'Content Creation', frequency: 'weekly', time_perOccurrence_min: 180, complexity: 'high', current_tool: 'Manual' },
    { name: 'Reporting & Analytics', frequency: 'weekly', time_perOccurrence_min: 45, complexity: 'medium', current_tool: 'Spreadsheet' },
    { name: 'Scheduling & Booking', frequency: 'daily', time_perOccurrence_min: 15, complexity: 'low', current_tool: 'Manual' },
    { name: 'Data Entry', frequency: 'daily', time_perOccurrence_min: 25, complexity: 'low', current_tool: 'Spreadsheet' },
  ]

  const findings: AutomationFinding[] = []
  let totalSavings = 0

  for (const proc of processes) {
    const freqMultiplier = proc.frequency === 'daily' ? 22 : proc.frequency === 'weekly' ? 4 : 1
    const monthlyOccurrences = freqMultiplier
    const monthlyHrs = (proc.time_perOccurrence_min * monthlyOccurrences) / 60

    let automationPotential = proc.complexity === 'low' ? rngRange(80, 95) : proc.complexity === 'medium' ? rngRange(55, 80) : rngRange(30, 55)
    const savingsHrs = Math.round(monthlyHrs * (automationPotential / 100) * rngFloat(0.8, 1.0) * 10) / 10

    let tool = 'Zapier'
    if (proc.name.toLowerCase().includes('email')) tool = 'Claude + Zapier + Gmail API'
    else if (proc.name.toLowerCase().includes('social')) tool = 'Buffer + Make + Claude'
    else if (proc.name.toLowerCase().includes('invoice')) tool = 'Stripe + QuickBooks + Zapier'
    else if (proc.name.toLowerCase().includes('onboard')) tool = 'Notion + Zapier + Claude'
    else if (proc.name.toLowerCase().includes('content')) tool = 'Claude + Jasper + Make'
    else if (proc.name.toLowerCase().includes('report')) tool = 'Notion AI + Claude + Google Sheets'
    else if (proc.name.toLowerCase().includes('scheduling')) tool = 'Calendly + Zapier'
    else if (proc.name.toLowerCase().includes('data entry')) tool = 'Claude + Make + Airtable'

    const effort: 'low' | 'medium' | 'high' = proc.complexity === 'low' ? 'low' : proc.complexity === 'medium' ? 'medium' : 'high'
    const roiMonths = proc.complexity === 'low' ? rngRange(1, 2) : proc.complexity === 'medium' ? rngRange(2, 4) : rngRange(3, 6)

    findings.push({
      process: proc.name,
      automationpotential_pct: automationPotential,
      recommended_tool: tool,
      monthly_savings_hrs: savingsHrs,
      setup_effort: effort,
      roi_months: roiMonths,
    })
    totalSavings += savingsHrs
  }

  // Sort by roi (high automation, low effort first)
  findings.sort((a, b) => {
    const scoreA = a.automationpotential_pct / (a.setup_effort === 'low' ? 1 : a.setup_effort === 'medium' ? 2 : 3)
    const scoreB = b.automationpotential_pct / (b.setup_effort === 'low' ? 1 : b.setup_effort === 'medium' ? 2 : 3)
    return scoreB - scoreA
  })

  const automatablePct = Math.round((findings.filter(f => f.automationpotential_pct >= 70).length / findings.length) * 100)

  const summary = `${automatablePct}% of processes can be 70%+ automated. Total potential savings: ${totalSavings.toFixed(1)} hrs/mo. Prioritize ${findings[0]?.process} and ${findings[1]?.process} for immediate impact.`

  return {
    total_processes: processes.length,
    automatable_pct: automatablePct,
    total_monthly_savings_hrs: Math.round(totalSavings * 10) / 10,
    findings,
    priority_order: findings.slice(0, 4).map(f => f.process),
    summary,
  }
}

function formatAutomationAuditReport(input: AutomationAuditInput, result: AutomationAuditResult): string {
  const lines: string[] = []

  lines.push('## Automation Audit Report')
  lines.push('')
  lines.push(`**${input.business_name || 'Business Operations'}** — ${result.automatable_pct}% automatable | ${result.total_monthly_savings_hrs} hrs/mo savings potential`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Process Automation Analysis')
  lines.push('| Process | Auto % | Recommended Tool | Savings (hrs/mo) | Effort | ROI (mo) |')
  lines.push('|---------|--------|------------------|------------------|--------|----------|')
  for (const f of result.findings) {
    const effortTag = f.setup_effort === 'low' ? 'LOW' : f.setup_effort === 'medium' ? 'MED' : 'HIGH'
    lines.push(`| ${f.process} | ${f.automationpotential_pct}% | ${f.recommended_tool} | ${f.monthly_savings_hrs} | ${effortTag} | ${f.roi_months} |`)
  }
  lines.push('')

  lines.push('### Implementation Priority')
  let idx = 1
  for (const proc of result.priority_order) {
    lines.push(`${idx}. ${proc}`)
    idx++
  }
  lines.push('')

  lines.push('### OPC Automation Stack Recommendation')
  lines.push('- **Orchestration**: Make (complex) + Zapier (simple) — combined monthly: ~$30-60')
  lines.push('- **AI Brain**: Claude for content, code, analysis — $20/mo (Pro)')
  lines.push('- **Data Storage**: Notion + Airtable for structured data — free tier + $20/mo')
  lines.push('- **Monitoring**: Set weekly AI performance review (30 min) to catch failures early')
  lines.push('- **Total Stack Cost**: ~$70-100/mo replaces ~$2,000+ in human assistant time')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 5: TIME BUDGET PLANNER ====================

function planTimeBudget(input: TimeBudgetInput): TimeBudgetResult {
  const totalHrs = input.total_weekly_hrs || 40
  const deepWorkHrs = input.deep_work_hrs_per_day || 4
  const energyPattern = input.energy_pattern || 'morning_person'
  const functions = input.business_functions || ['product', 'marketing', 'sales', 'admin', 'content']
  const bottlenecks = input.current_bottlenecks || []

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const schedule: TimeBlock[] = []
  let totalHumanHrs = 0
  let totalAIHrs = 0
  let totalHybridHrs = 0
  let deepWorkBlocks = 0

  const timeSlots: Record<string, string[]> = {
    morning_person: ['6:00-7:30 (Deep Work)', '7:30-8:00 (Buffer)', '8:00-10:00 (Deep Work)', '10:00-10:15 (Break)', '10:15-12:00 (Shallow Work)', '12:00-13:00 (Lunch)', '13:00-15:00 (AI Tasks)', '15:00-15:30 (Admin)', '15:30-17:00 (Meetings/Collab)'],
    night_owl: ['9:00-10:00 (Email/Slack)', '10:00-12:00 (AI Tasks)', '12:00-13:00 (Lunch)', '13:00-15:00 (Shallow Work)', '15:00-15:30 (Break)', '15:30-18:00 (Deep Work)', '18:00-19:00 (Deep Work)', '19:00-20:00 (Admin)', '20:00-21:00 (Planning)'],
    flexible: ['8:00-9:00 (Admin)', '9:00-11:00 (Deep Work)', '11:00-11:30 (Break)', '11:30-13:00 (AI/Hybrid Tasks)', '13:00-14:00 (Lunch)', '14:00-16:00 (Deep Work)', '16:00-16:30 (Email)', '16:30-18:00 (Meetings/Collab)', '18:00-19:00 (Review/Plan)'],
  }

  for (const day of days) {
    const slots = timeSlots[energyPattern] || timeSlots.flexible
    for (const slot of slots) {
      const [timeRange, activityRaw] = slot.split(' (')
      const activity = activityRaw.replace(')', '')
      let owner: 'human' | 'ai' | 'hybrid' = 'human'
      let category = 'general'

      if (activity.includes('Deep Work')) {
        owner = 'human'
        category = 'deep_work'
        deepWorkBlocks++
      } else if (activity.includes('AI') || activity.includes('Automation')) {
        owner = 'ai'
        category = 'ai_tasks'
      } else if (activity.includes('Hybrid')) {
        owner = 'hybrid'
        category = 'hybrid_tasks'
      } else if (activity.includes('Email') || activity.includes('Admin') || activity.includes('Slack')) {
        owner = rng() > 0.3 ? 'ai' : 'hybrid'
        category = 'admin'
      } else if (activity.includes('Lunch') || activity.includes('Break')) {
        continue
      } else {
        owner = rng() > 0.5 ? 'ai' : 'human'
        category = 'shallow_work'
      }

      const duration = estimateDuration(timeRange)
      if (owner === 'human') totalHumanHrs += duration
      else if (owner === 'ai') totalAIHrs += duration
      else totalHybridHrs += duration

      schedule.push({ day, time_slot: timeRange, activity, owner, category })
    }
  }

  const tips: string[] = []
  tips.push(`Deep work blocks: ${deepWorkBlocks}/week — target ${deepWorkHrs * 5}+ for meaningful progress`)
  if (totalDeepWorkFromBlocks(deepWorkBlocks) < deepWorkHrs * 5) {
    tips.push(`WARNING: Only ${totalDeepWorkFromBlocks(deepWorkBlocks)} hrs of deep work scheduled. Consider delegating more admin tasks to AI.`)
  }
  tips.push('Batch similar tasks — AI can queue and run batches asynchronously while you focus')
  tips.push('Review AI outputs in 30-min daily review block rather than real-time monitoring')
  if (bottlenecks.includes('content_creation')) tips.push('Delegate first drafts to Claude — edit for voice in 20% of original time')
  if (bottlenecks.includes('customer_support')) tips.push('AI should handle Tier-1 support — reserve human for escalations only')
  tips.push('Use "maker schedule" — protect 4-hour uninterrupted blocks for revenue-generating work')

  const humanRatio = Math.round((totalHumanHrs / totalHrs) * 100)
  const aiRatio = Math.round((totalAIHrs / totalHrs) * 100)

  const summary = `Weekly ${totalHrs}h allocated: ${totalHumanHrs.toFixed(1)}h human (${humanRatio}%), ${totalAIHrs.toFixed(1)}h AI (${aiRatio}%), ${totalHybridHrs.toFixed(1)}h hybrid. ${deepWorkBlocks} deep work blocks confirmed.`

  return {
    total_human_hrs: Math.round(totalHumanHrs * 10) / 10,
    total_ai_hrs: Math.round(totalAIHrs * 10) / 10,
    total_hybrid_hrs: Math.round(totalHybridHrs * 10) / 10,
    deep_work_blocks: deepWorkBlocks,
    schedule,
    optimization_tips: tips,
    summary,
  }
}

function estimateDuration(timeRange: string): number {
  const match = timeRange.match(/(\d+):(\d+)-(\d+):(\d+)/)
  if (!match) return 1
  const [_, h1, m1, h2, m2] = match
  return (parseInt(h2) * 60 + parseInt(m2) - parseInt(h1) * 60 - parseInt(m1)) / 60
}

function totalDeepWorkFromBlocks(blocks: number): number {
  return Math.round(blocks * 1.5 * 10) / 10  // avg 1.5h per deep work block
}

function formatTimeBudgetReport(input: TimeBudgetInput, result: TimeBudgetResult): string {
  const lines: string[] = []

  lines.push('## Time Budget Plan (1-Person + AI)')
  lines.push('')
  lines.push(`**${input.energy_pattern || 'flexible'}** pattern | ${result.deep_work_blocks} deep work blocks | ${result.total_human_hrs}h human / ${result.total_ai_hrs}h AI / ${result.total_hybrid_hrs}h hybrid`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Weekly Time Allocation Summary')
  lines.push('| Category | Hours | Percentage |')
  lines.push('|----------|-------|------------|')
  lines.push(`| Human-Only Tasks | ${result.total_human_hrs} | ${Math.round((result.total_human_hrs / (result.total_human_hrs + result.total_ai_hrs + result.total_hybrid_hrs)) * 100)}% |`)
  lines.push(`| AI-Run Tasks | ${result.total_ai_hrs} | ${Math.round((result.total_ai_hrs / (result.total_human_hrs + result.total_ai_hrs + result.total_hybrid_hrs)) * 100)}% |`)
  lines.push(`| Hybrid (Human+AI) | ${result.total_hybrid_hrs} | ${Math.round((result.total_hybrid_hrs / (result.total_human_hrs + result.total_ai_hrs + result.total_hybrid_hrs)) * 100)}% |`)
  lines.push('')

  lines.push('### Sample Schedule (Monday)')
  lines.push('| Time | Activity | Owner | Category |')
  lines.push('|------|----------|-------|----------|')
  for (const block of result.schedule.filter(s => s.day === 'Monday')) {
    lines.push(`| ${block.time_slot} | ${block.activity} | ${block.owner.toUpperCase()} | ${block.category} |`)
  }
  lines.push('')

  lines.push('### Optimization Tips')
  for (const tip of result.optimization_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 6: MOAT ANALYZER ====================

function analyzeMoat(input: MoatAnalyzerInput): MoatResult {
  const uniqueAssets = input.unique_assets || []
  const hasNetworkEff = input.network_effects || false
  const switchingCosts = input.switching_costs || 'low'
  const hasDataAdv = input.data_advantage || false
  const brand = input.brand_strength || 'nascent'
  const competitors = input.competitors_count || 10

  const analysis: MoatResult['analysis'] = []

  // Network effects
  let networkScore = rngRange(20, 50)
  if (hasNetworkEff) networkScore += 35
  if (competitors > 20) networkScore += 5
  networkScore = clamp(networkScore, 5, 95)
  analysis.push({ factor: 'Network Effects', score: networkScore, assessment: hasNetworkEff ? 'Strong — platform becomes more valuable with each user' : 'Weak — limited viral/compound value per user' })

  // Switching costs
  let switchScore = switchingCosts === 'high' ? rngRange(70, 90) : switchingCosts === 'medium' ? rngRange(45, 65) : rngRange(15, 35)
  analysis.push({ factor: 'Switching Costs', score: switchScore, assessment: switchingCosts === 'high' ? 'High barrier to exit — data lock-in, workflows, integrations' : switchingCosts === 'medium' ? 'Moderate friction — some customization but portable' : 'Low — users can leave easily' })

  // Data advantage
  let dataScore = rngRange(25, 50)
  if (hasDataAdv) dataScore += 30
  dataScore = clamp(dataScore, 5, 95)
  analysis.push({ factor: 'Data Advantage', score: dataScore, assessment: hasDataAdv ? 'Growing dataset creates compounding quality advantage' : 'No unique data flywheel identified' })

  // Brand strength
  let brandScore = brand === 'established' ? rngRange(70, 90) : brand === 'growing' ? rngRange(45, 65) : rngRange(15, 35)
  analysis.push({ factor: 'Brand Strength', score: brandScore, assessment: brand === 'established' ? 'Recognized name drives organic discovery' : brand === 'growing' ? 'Building awareness through content/community' : 'Pre-brand phase — relies on paid/SEO' })

  // Unique assets / IP
  let assetScore = clamp(rngRange(20, 45) + uniqueAssets.length * 8, 5, 95)
  analysis.push({ factor: 'Unique Assets / IP', score: assetScore, assessment: uniqueAssets.length > 2 ? `${uniqueAssets.length} proprietary assets provide differentiation` : 'Limited unique assets — consider building proprietary data/templates' })

  // Solo execution moat (OPC-specific)
  let soloScore = rngRange(40, 65)
  if (uniqueAssets.includes('proprietary_data')) soloScore += 15
  if (brand === 'growing') soloScore += 5
  soloScore = clamp(soloScore, 10, 95)
  analysis.push({ factor: 'Solo Execution Moat', score: soloScore, assessment: soloScore > 55 ? 'Solo + AI model creates cost-structure advantage larger players cannot match' : 'Cost advantage exists but not yet defensible — iterate on differentiation' })

  const moatScore = Math.round(
    networkScore * 0.2 + switchScore * 0.25 + dataScore * 0.15 + brandScore * 0.15 + assetScore * 0.1 + soloScore * 0.15
  )

  let moatType = 'Niche Cost Advantage'
  if (hasNetworkEff && networkScore > 60) moatType = 'Network Effects'
  else if (switchScore > 60) moatType = 'High Switching Costs'
  else if (dataScore > 60) moatType = 'Data Flywheel'
  else if (brandScore > 60) moatType = 'Brand Authority'
  else if (soloScore > 55) moatType = 'Operational Leverage (OPC)'

  let moatStrength: MoatResult['moat_strength'] = 'weak'
  if (moatScore >= 70) moatStrength = 'strong'
  else if (moatScore >= 50) moatStrength = 'moderate'
  else if (moatScore >= 30) moatStrength = 'weak'
  else moatStrength = 'none'

  const strategies: string[] = []
  if (networkScore < 60) strategies.push('Add network effects: community layers, user-generated content, referral mechanics')
  if (switchScore < 50) strategies.push('Increase switching costs: custom integrations, data export friction, workflow templates')
  if (dataScore < 50) strategies.push('Build data moat: collect usage patterns, train proprietary models, build benchmark datasets')
  if (brandScore < 50) strategies.push('Invest in brand: public writing, podcast appearances, open-source contributions')
  strategies.push('Leverage AI cost advantage: undercut competitors on price while maintaining margins via AI delegation')
  strategies.push('Focus on a niche too small for VC-backed startups but large enough for $10k+ solo MRR')

  const timeline = moatStrength === 'strong' ? 'Defensible position established. Maintain via continuous innovation.'
    : moatStrength === 'moderate' ? 'Moderate protection. 6-12 months of consistent execution to reach strong moat.'
    : 'Early stage. 12-24 months to build sustainable competitive advantage.'

  return {
    moat_score: moatScore,
    moat_type: moatType,
    moat_strength: moatStrength,
    analysis,
    strategy_recommendations: strategies,
    defensibility_timeline: timeline,
    summary: `Moat Score: ${moatScore}/100 (${moatStrength}) | Type: ${moatType} | ${moatScore >= 50 ? 'Defensible position — focus on deepening advantage' : 'Vulnerable — prioritize building 1-2 moat factors'}`,
  }
}

function formatMoatReport(input: MoatAnalyzerInput, result: MoatResult): string {
  const lines: string[] = []
  const strengthTag = result.moat_strength === 'strong' ? 'STRONG' : result.moat_strength === 'moderate' ? 'MODERATE' : result.moat_strength === 'weak' ? 'WEAK' : 'NONE'

  lines.push('## Competitive Moat Analysis')
  lines.push('')
  lines.push(`**${input.product_name || 'Product'}** — ${result.moat_type} | ${strengthTag} (${result.moat_score}/100)`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Moat Factor Scores')
  lines.push('| Factor | Score | Assessment |')
  lines.push('|--------|-------|------------|')
  for (const a of result.analysis) {
    const bar = 'A'.repeat(Math.round(a.score / 10)) + 'B'.repeat(10 - Math.round(a.score / 10))
    lines.push(`| ${a.factor} | ${a.score}/100 | ${a.assessment} |`)
  }
  lines.push('')

  lines.push('### Strategy Recommendations')
  for (const s of result.strategy_recommendations) {
    lines.push(`- ${s}`)
  }
  lines.push('')

  lines.push(`### Defensibility Timeline`)
  lines.push(result.defensibility_timeline)
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 7: LEGAL COMPLIANCE CHECKER ====================

function checkLegalCompliance(input: LegalComplianceInput): LegalComplianceResult {
  const jurisdiction = input.jurisdiction || 'US'
  const structure = input.business_structure || 'sole_proprietor'
  const revenue = input.revenue_last_12mo || 0
  const sellsDigital = input.sells_digital !== false
  const sellsPhysical = input.sells_physical || false
  const hasEmployees = input.has_employees !== false ? false : true
  const internationalCustomers = input.international_customers || false
  const dataCollection = input.data_collection || false

  const items: ComplianceItem[] = []
  const criticalActions: string[] = []

  // Business registration
  if (structure === 'sole_proprietor') {
    items.push({
      requirement: 'Sole Proprietor Registration (DBA)',
      status: 'action_needed',
      priority: 'high',
      deadline: 'Before first sale',
      notes: 'File DBA/fictitious name with county clerk. Cost: $10-100.',
    })
    criticalActions.push('Register DBA name before launching to operate under business name')
  } else if (structure === 'llc') {
    items.push({
      requirement: 'LLC Formation & Operating Agreement',
      status: 'compliant',
      priority: 'critical',
      deadline: 'Before any revenue activity',
      notes: 'File Articles of Organization with state. Cost: $50-500. Creates liability protection.',
    })
  } else if (structure === 'opc') {
    items.push({
      requirement: 'One Person Company (OPC) Registration',
      status: 'action_needed',
      priority: 'critical',
      deadline: 'Before first client',
      notes: 'OPC structure available in India (Companies Act 2013), Singapore (sole prop), and select jurisdictions. Nominee director may be required.',
    })
    criticalActions.push('Verify OPC availability in your jurisdiction — India/Singapore options differ significantly')
  }

  // Tax registration
  if (jurisdiction === 'US') {
    items.push({
      requirement: 'EIN (Employer Identification Number)',
      status: hasEmployees || structure !== 'sole_proprietor' ? 'action_needed' : 'not_applicable',
      priority: 'high',
      deadline: 'Before filing first tax return',
      notes: 'Free via IRS online application. Sole proprietors can use SSN but EIN is recommended.',
    })
    if (revenue > 400) {
      items.push({
        requirement: 'Self-Employment Tax (Schedule SE)',
        status: 'action_needed',
        priority: 'critical',
        deadline: 'April 15 (annual) + quarterly estimated',
        notes: '15.3% SE tax on net profit above $400. Pay quarterly estimated taxes to avoid penalties.',
      })
      criticalActions.push('Set up quarterly estimated tax payments (1040-ES) to avoid underpayment penalties')
    }
  }

  // Sales tax
  if (sellsDigital || sellsPhysical) {
    items.push({
      requirement: 'Sales Tax Collection',
      status: 'action_needed',
      priority: 'high',
      deadline: 'Upon first sale',
      notes: 'Digital products: taxable in 28+ US states. Physical: nexus-based. Use TaxJar or LemonSqueezy (MOR) to automate.',
    })
    if (!criticalActions.includes('Consider LemonSqueezy as Merchant of Record — they handle global sales tax automatically')) {
      criticalActions.push('Consider LemonSqueezy as Merchant of Record — they handle global sales tax automatically')
    }
  }

  // International VAT
  if (internationalCustomers) {
    items.push({
      requirement: 'VAT/GST on International Sales',
      status: 'action_needed',
      priority: 'high',
      deadline: 'Upon first international sale',
      notes: 'EU VAT on digital: rate of customer location. Paddle/LemonSqueezy act as MOR to handle this. Without MOR: register in each country.',
    })
    criticalActions.push('Use a Merchant of Record (Paddle, LemonSqueezy) to handle VAT/GST for international customers')
  }

  // Privacy policy & terms
  if (dataCollection || sellsDigital) {
    items.push({
      requirement: 'Privacy Policy (GDPR/CCPA Compliant)',
      status: 'action_needed',
      priority: 'critical',
      deadline: 'Before collecting any data',
      notes: 'Required if handling EU/CA visitor data. Must disclose data collection, use, and rights. Templates: Termly, PrivacyPolicies.com.',
    })
    criticalActions.push('Privacy policy is legally required — do not collect data without one published on your site')
    items.push({
      requirement: 'Terms of Service / Terms & Conditions',
      status: 'action_needed',
      priority: 'medium',
      deadline: 'Before first customer',
      notes: 'Limit liability, define refund policy, set dispute resolution mechanism.',
    })
  }

  // Business license
  items.push({
    requirement: 'General Business License',
    status: 'action_needed',
    priority: 'medium',
    deadline: 'Within 30 days of launch',
    notes: 'City/county-specific requirements. Check with local clerk. Home-based businesses may need additional permits.',
  })

  // Insurance
  if (revenue > 50000) {
    items.push({
      requirement: 'Professional Liability / E&O Insurance',
      status: 'action_needed',
      priority: 'high',
      deadline: 'Before revenue exceeds $50K',
      notes: 'Errors & Omissions covers advice/product mistakes. Cost: $200-500/mo. Hiscox, NextInsurance popular for solopreneurs.',
    })
    criticalActions.push('E&O insurance recommended — one claim without coverage can end the business')
  }

  // Trademark (if brand is growing)
  items.push({
    requirement: 'Trademark Registration (Optional)',
    status: revenue > 30000 ? 'action_needed' : 'not_applicable',
    priority: 'low',
    deadline: 'When brand is established',
    notes: 'USPTO TEAS Plus: $250/class. Common law rights exist from first use but registration strengthens protection.',
  })

  // Compliance scoring
  const totalItems = items.filter(i => i.status !== 'not_applicable')
  const compliant = totalItems.filter(i => i.status === 'compliant').length
  const complianceScore = totalItems.length > 0 ? Math.round((compliant / totalItems.length) * 100) : 100

  let overallStatus: 'compliant' | 'partial' | 'action_needed' = 'compliant'
  if (criticalActions.length > 0) overallStatus = 'action_needed'
  else if (compliant < totalItems.length) overallStatus = 'partial'

  const setupCostEst = structure === 'llc' ? '$500-1,500' : structure === 'opc' ? '$300-800' : '$100-300'

  return {
    overall_status: overallStatus,
    compliance_score: complianceScore,
    items,
    critical_actions: criticalActions,
    estimated_setup_costs: setupCostEst,
    summary: `Compliance score: ${complianceScore}% (${compliant}/${totalItems.length} items addressed) | ${criticalActions.length} critical actions | Status: ${overallStatus.toUpperCase()}`,
  }
}

function formatLegalComplianceReport(input: LegalComplianceInput, result: LegalComplianceResult): string {
  const lines: string[] = []
  const statusTag = result.overall_status === 'compliant' ? 'COMPLIANT' : result.overall_status === 'partial' ? 'PARTIAL' : 'ACTION NEEDED'

  lines.push('## Legal & Compliance Check')
  lines.push('')
  lines.push(`**${input.business_name || 'Business'}** (${input.jurisdiction || 'US'}) | ${statusTag} | Score: ${result.compliance_score}%`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Compliance Checklist')
  lines.push('| # | Requirement | Status | Priority | Deadline |')
  lines.push('|---|-------------|--------|----------|----------|')
  let idx = 1
  for (const item of result.items) {
    const statusIcon = item.status === 'compliant' ? 'OK' : item.status === 'action_needed' ? 'ACTION' : 'N/A'
    const priTag = item.priority === 'critical' ? 'CRITICAL' : item.priority === 'high' ? 'HIGH' : item.priority === 'medium' ? 'MED' : 'LOW'
    lines.push(`| ${idx} | ${item.requirement} | ${statusIcon} | ${priTag} | ${item.deadline} |`)
    idx++
  }
  lines.push('')

  if (result.critical_actions.length > 0) {
    lines.push('### Critical Actions')
    for (const action of result.critical_actions) {
      lines.push(`- **${action}**`)
    }
    lines.push('')
  }

  lines.push(`### Estimated Setup Costs: ${result.estimated_setup_costs}`)
  lines.push('')
  lines.push('### OPC-Specific Tips')
  lines.push('- **Sole Proprietor**: Simplest start, but consider LLC for liability protection once revenue exceeds $5K/mo')
  lines.push('- **LLC**: Best balance of protection and simplicity for US solopreneurs. Member-managed = 1 person control.')
  lines.push('- **OPC (India)**: Private limited company with single member. Annual filings required. Good for Indian solopreneurs scaling.')
  lines.push('- **Merchant of Record**: Use LemonSqueezy or Paddle to handle global tax compliance without entity setup')
  lines.push('- **Quarterly Taxes**: US solopreneurs must pay estimated taxes quarterly (Jan/Apr/Jun/Sep) to avoid penalties')
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 8: GROWTH CATALYST FINDER ====================

function findGrowthCatalysts(input: GrowthCatalystInput): GrowthCatalystResult {
  const currentMRR = input.current_mrr || 0
  const currentUsers = input.current_users || 50
  const channels = input.channels_active || ['organic_search', 'twitter']
  const networking = input.networking_level || 'low'
  const budget = input.budget_for_growth || 200
  const timeframe = input.timeframe_months || 3

  const allCatalysts: GrowthCatalyst[] = [
    {
      name: 'SEO Content Engine',
      description: 'AI-assisted publishing of 4-8 SEO-optimized articles/mo targeting high-intent keywords. Build compounding organic traffic asset.',
      effort: 'medium', impact: 'high', speed: 'months', ai_leverage: true,
      expected_mrr_increase_pct: 30, platform: 'WordPress + Claude + SurferSEO',
    },
    {
      name: 'Product Hunt Launch',
      description: 'Coordinated launch with waitlist (min 200), polished landing page, and launch-day community engagement.',
      effort: 'medium', impact: 'high', speed: 'weeks', ai_leverage: false,
      expected_mrr_increase_pct: 25, platform: 'Product Hunt',
    },
    {
      name: 'Cold Outreach at Scale',
      description: 'Use Claude to personalize outreach. Target 50-100 qualified leads/day with AI-crafted emails.',
      effort: 'low', impact: 'high', speed: 'immediate', ai_leverage: true,
      expected_mrr_increase_pct: 35, platform: 'Apollo.io + Claude + Instantly',
    },
    {
      name: 'Newsletter Sponsorships',
      description: 'Get featured in established newsletters in your niche. Warm audiences convert at 5-10% rates.',
      effort: 'low', impact: 'medium', speed: 'weeks', ai_leverage: false,
      expected_mrr_increase_pct: 15, platform: 'Swapstack + Paved + direct sponsor outreach',
    },
    {
      name: 'Embedded Marketplace Listing',
      description: 'List on Shopify App Store, Notion Marketplace, or Webflow Apps. Tap into existing distribution.',
      effort: 'medium', impact: 'high', speed: 'weeks', ai_leverage: true,
      expected_mrr_increase_pct: 20, platform: 'Notion Marketplace / Webflow Apps / Slack App Directory',
    },
    {
      name: 'Viral Content + Magnet',
      description: 'Create one viral-worthy asset (thread, video, calculator, template) with email capture.',
      effort: 'high', impact: 'high', speed: 'weeks', ai_leverage: true,
      expected_mrr_increase_pct: 40, platform: 'Twitter/X + LinkedIn + Claude for research',
    },
    {
      name: 'Referral Program',
      description: 'Incentivize word-of-mouth with 20% commission or account credits. AI drafts referral emails.',
      effort: 'low', impact: 'medium', speed: 'immediate', ai_leverage: true,
      expected_mrr_increase_pct: 12, platform: 'Rewardful + Stripe + Rye',
    },
    {
      name: 'Partnership Integration',
      description: 'Build native integration with complementary tool. Cross-promotion to their user base.',
      effort: 'high', impact: 'high', speed: 'months', ai_leverage: false,
      expected_mrr_increase_pct: 25, platform: 'Zapier + native API integrations',
    },
    {
      name: 'Paid Ads (Validated Offer)',
      description: 'Only after organic unit economics validated. Target CPA below 1/3 of LTV.',
      effort: 'low', impact: 'high', speed: 'immediate', ai_leverage: true,
      expected_mrr_increase_pct: 50, platform: 'Google Ads + Meta Ads + Claude for ad copy',
    },
    {
      name: 'Open Source Wedge',
      description: 'Open-source a free tool that demonstrates your core capability. Convert users to paid.',
      effort: 'high', impact: 'medium', speed: 'months', ai_leverage: true,
      expected_mrr_increase_pct: 18, platform: 'GitHub + OpenCLA + social proof',
    },
    {
      name: 'Community Building',
      description: 'Start a free community (Slack/Discord) around your niche. Compound trust and product feedback.',
      effort: 'medium', impact: 'high', speed: 'months', ai_leverage: true,
      expected_mrr_increase_pct: 22, platform: 'Circle + Discord + Skool',
    },
    {
      name: 'Content Repurposing Pipeline',
      description: 'One long-form piece AI-repurposes into 10+ micro-content pieces (threads, carousels, shorts).',
      effort: 'low', impact: 'medium', speed: 'immediate', ai_leverage: true,
      expected_mrr_increase_pct: 15, platform: 'Claude + Buffer + Descript',
    },
  ]

  // Filter by budget and sort by impact/speed
  const feasibleCatalysts = allCatalysts.filter(c => {
    if (budget < 100 && c.platform.includes('Ads')) return false
    return true
  })

  // Score catalysts
  const scored = feasibleCatalysts.map(c => {
    const impactScore = c.impact === 'high' ? 3 : c.impact === 'medium' ? 2 : 1
    const speedScore = c.speed === 'immediate' ? 3 : c.speed === 'weeks' ? 2 : 1
    const effortScore = c.effort === 'low' ? 3 : c.effort === 'medium' ? 2 : 1
    const aiBonus = c.ai_leverage ? 1.5 : 1
    const score = (impactScore + speedScore + effortScore) * aiBonus * c.expected_mrr_increase_pct
    return { catalyst: c, score }
  })

  scored.sort((a, b) => b.score - a.score)

  const topCatalysts = scored.slice(0, 5).map(s => s.catalyst)
  const quickWins = scored.filter(s => s.catalyst.speed === 'immediate' || s.catalyst.effort === 'low').slice(0, 3).map(s => s.catalyst)
  const longTermBets = scored.filter(s => s.catalyst.speed === 'months').slice(0, 2).map(s => s.catalyst)

  // Project MRR growth
  const totalIncreasePct = topCatalysts.reduce((s, c) => s + c.expected_mrr_increase_pct, 0) / 100
  const realisticIncrease = totalIncreasePct * 0.4  // 40% realization factor
  const projectedMRR = Math.round(currentMRR + currentMRR * realisticIncrease + (currentUsers * 5))

  const aiTips: string[] = []
  aiTips.push('Use Claude to research competitor content gaps before creating your own')
  aiTips.push('AI can A/B test 5x more ad copy and landing page variants in the same time')
  aiTips.push('Build a "content flywheel" — AI drafts, you edit, scales 10x vs fully manual')
  aiTips.push('Automate lead qualification with AI scoring — focus human closing on hot leads only')
  if (!channels.includes('seo')) aiTips.push('SEO is the most sustainable channel for solopreneurs — AI makes it achievable solo')
  aiTips.push('Network effect: each AI-optimized customer interaction improves your model')

  return {
    top_catalysts: topCatalysts,
    quick_wins: quickWins,
    long_term_bets: longTermBets,
    projected_mrr_3mo: projectedMRR,
    ai_amplification_tips: aiTips,
    summary: `Top 5 catalysts identified. Projected MRR in ${timeframe}mo: $${projectedMRR.toLocaleString()} (from $${currentMRR.toLocaleString()}). Quick wins available: ${quickWins.length}. AI amplifies ${topCatalysts.filter(c => c.ai_leverage).length}/5 top catalysts.`,
  }
}

function formatGrowthCatalystReport(input: GrowthCatalystInput, result: GrowthCatalystResult): string {
  const lines: string[] = []

  lines.push('## Growth Catalyst Finder')
  lines.push('')
  lines.push(`**${input.business_name || 'Business'}** | Current MRR: $${(input.current_mrr || 0).toLocaleString()} | Projected (3mo): $${result.projected_mrr_3mo.toLocaleString()}`)
  lines.push('')
  lines.push(result.summary)
  lines.push('')

  lines.push('### Top Recommended Catalysts')
  lines.push('| # | Catalyst | Impact | Speed | AI | Expected MRR +% | Platform |')
  lines.push('|---|----------|--------|-------|-----|-----------------|----------|')
  let idx = 1
  for (const c of result.top_catalysts) {
    const impTag = c.impact.toUpperCase().substring(0, 3)
    const aiTag = c.ai_leverage ? 'YES' : 'NO'
    lines.push(`| ${idx} | ${c.name} | ${impTag} | ${c.speed} | ${aiTag} | +${c.expected_mrr_increase_pct}% | ${c.platform} |`)
    idx++
  }
  lines.push('')

  lines.push('### Quick Wins (Do This Week)')
  for (const c of result.quick_wins) {
    lines.push(`- **${c.name}**: ${c.description} (Platform: ${c.platform})`)
  }
  lines.push('')

  lines.push('### Long-Term Bets (Start Now, Harvest Later)')
  for (const c of result.long_term_bets) {
    lines.push(`- **${c.name}**: ${c.description} (Platform: ${c.platform})`)
  }
  lines.push('')

  lines.push('### AI Amplification Tips')
  for (const tip of result.ai_amplification_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== HELPERS ====================

function rateScore(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Strong'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'Weak'
  return 'Poor'
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: OPC Viability Scorer
  tools.register(defineTool({
    name: 'opc_viability_scorer',
    description: 'Score business idea viability for one-person execution (0-100). Evaluates market demand, AI leverage potential, solo feasibility, revenue potential, time efficiency, and scalability. Returns verdict, category scores, strengths, risks, and recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_name, idea_description, category, target_market, required_skills[], available_budget, time_commitment_hrs_per_week, has_audience, ai_leverage_potential', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ViabilityInput = JSON.parse(args.input_data)
      const result = scoreViability(input)
      return formatViabilityReport(input, result)
    }
  }))

  // Tool 2: AI Team Architect
  tools.register(defineTool({
    name: 'ai_team_architect',
    description: 'Design AI agent team structure replacing human roles for one-person company. Maps business functions to AI agent roles with tool recommendations, cost estimates, human oversight hours, and leverage ratios. Optimized for $10k/mo solo operator budget.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_type, current_roles_needed[], budget_per_month, tools_ecosystem[], complexity_level', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: TeamArchitectInput = JSON.parse(args.input_data)
      const result = designTeamStructure(input)
      return formatTeamArchitectureReport(input, result)
    }
  }))

  // Tool 3: Revenue Model Optimizer
  tools.register(defineTool({
    name: 'revenue_model_optimizer',
    description: 'Optimize pricing and revenue model for solo operators. Recommends pricing tiers, projected MRR, path to $10k/mo, platform choices (Gumroad, LemonSqueezy, Stripe, etc.), and product-type-specific strategies for info products, micro-SaaS, productized services, content, and agencies.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_type (info_product|micro_saas|productized_service|digital_agency|content|marketplace), current_mrr, target_mrr, current_pricing, audience_size, churn_rate, delivery_capacity_hrs', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: RevenueOptimizerInput = JSON.parse(args.input_data)
      const result = optimizeRevenue(input)
      return formatRevenueModelReport(input, result)
    }
  }))

  // Tool 4: Automation Audit
  tools.register(defineTool({
    name: 'automation_audit',
    description: 'Audit which business processes can be fully automated. Analyzes each process for automation potential, recommends AI tools (Zapier, Make, Claude, etc.), calculates monthly time savings, and prioritizes by ROI. Shows how AI delegation can recover 10+ hrs/week for deep work.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_name, processes[{name, frequency, time_perOccurrence_min, complexity, current_tool}], tech_stack[], automation_budget', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: AutomationAuditInput = JSON.parse(args.input_data)
      const result = auditAutomation(input)
      return formatAutomationAuditReport(input, result)
    }
  }))

  // Tool 5: Time Budget Planner
  tools.register(defineTool({
    name: 'time_budget_planner',
    description: 'Plan weekly time allocation between human deep work and AI delegation. Generates a day-by-day schedule optimized for energy patterns, protects 4h/day deep work blocks, assigns tasks to human/ai/hybrid ownership, and provides time-optimization tips for solopreneurs.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: total_weekly_hrs, deep_work_hrs_per_day, business_functions[], energy_pattern (morning_person|night_owl|flexible), current_bottlenecks[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: TimeBudgetInput = JSON.parse(args.input_data)
      const result = planTimeBudget(input)
      return formatTimeBudgetReport(input, result)
    }
  }))

  // Tool 6: Moat Analyzer
  tools.register(defineTool({
    name: 'moat_analyzer',
    description: 'Analyze competitive moat for solo-built products. Scores 6 moat factors (network effects, switching costs, data advantage, brand, unique assets, solo execution advantage) on 0-100 scale. Identifies your strongest defensibility type and provides strategy recommendations for deepening the moat.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: product_name, category, unique_assets[], network_effects, switching_costs (low|medium|high), data_advantage, brand_strength (nascent|growing|established), competitors_count', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: MoatAnalyzerInput = JSON.parse(args.input_data)
      const result = analyzeMoat(input)
      return formatMoatReport(input, result)
    }
  }))

  // Tool 7: Legal Compliance Checker
  tools.register(defineTool({
    name: 'legal_compliance_checker',
    description: 'One-person company legal and tax compliance checklist. Covers business registration, EIN, sales tax, VAT/GST, privacy policy, terms of service, business insurance, and trademark. Returns compliance score, critical action items, deadlines, and estimated setup costs by jurisdiction and structure.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_name, jurisdiction, business_structure (sole_proprietor|llc|opc|pte_ltd), revenue_last_12mo, sells_digital, sells_physical, has_employees, international_customers, data_collection', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: LegalComplianceInput = JSON.parse(args.input_data)
      const result = checkLegalCompliance(input)
      return formatLegalComplianceReport(input, result)
    }
  }))

  // Tool 8: Growth Catalyst Finder
  tools.register(defineTool({
    name: 'growth_catalyst_finder',
    description: 'Find growth catalysts achievable by 1-person + AI. Identifies top 5 catalysts (SEO, Product Hunt, cold outreach, PR, etc.) scored by impact, speed, and AI leverage. Includes quick wins to execute this week and long-term bets. Projects MRR growth and provides AI amplification strategies.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_name, current_mrr, current_users, channels_active[], content_output, networking_level (low|medium|high), budget_for_growth, timeframe_months', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: GrowthCatalystInput = JSON.parse(args.input_data)
      const result = findGrowthCatalysts(input)
      return formatGrowthCatalystReport(input, result)
    }
  }))

  console.log(`[dsh-tool-opcenter] Loaded v${VERSION} - One Person Company Operations Center with 8 tools`)
  console.log('  Tools: opc_viability_scorer, ai_team_architect, revenue_model_optimizer, automation_audit, time_budget_planner, moat_analyzer, legal_compliance_checker, growth_catalyst_finder')
}
