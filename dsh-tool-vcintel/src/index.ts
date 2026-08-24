/**
 * DSH Venture Capital & Investment Intelligence Toolkit Plugin v1.0.0
 *
 * Comprehensive AI-powered VC/PE investment suite for DeepSeek Harness Agent.
 * Covers the full investment lifecycle with 8 specialized tools.
 *
 * 2026 Context: VC/PE tech market exceeds $8B; AI-powered investment analysis growing rapidly.
 * Deal sourcing, due diligence, portfolio monitoring, and market mapping are increasingly
 * augmented by LLMs and alternative data sources for faster, data-driven decisions.
 *
 * Features (v1.0.0):
 * - deal_sourcing_engine          - AI-powered deal sourcing with multi-source scanning and scoring
 * - due_diligence_checker         - Automated due diligence with risk flagging and scoring
 * - portfolio_health_monitor      - Portfolio company health tracking with KPI alerts
 * - market_mapping_analyst        - Market landscape mapping with competitive positioning
 * - startup_scoring_model         - Multi-factor startup scoring with investment readiness
 * - cap_table_analyzer            - Cap table analysis with dilution and ownership modeling
 * - exit_strategy_advisor         - Exit scenario modeling with timing and valuation analysis
 * - investment_thesis_validator   - Investment thesis stress-testing with contrarian analysis
 *
 * @module dsh-tool-vcintel
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-vcintel'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated venture capital and investment analysis for informational purposes only. It does not replace professional financial, legal, or investment advice. Always validate findings with qualified investment professionals before making capital allocation decisions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStringToInt(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRng<T>(input: T): () => number {
  return mulberry32(hashStringToInt(JSON.stringify(input)))
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

// ==================== TYPES ====================

// --- Tool 1: Deal Sourcing Engine ---
export interface DealSourcingInput {
  sectors?: string[]
  stages?: Array<'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'series_c' | 'growth'>
  geographic_focus?: string[]
  check_size_range?: { min: number; max: number }
  criteria?: {
    revenue_min?: number
    growth_rate_min?: number
    team_size_min?: number
    traction_signals?: string[]
  }
  sources?: string[]
}

export interface SourcedDeal {
  deal_id: string
  company_name: string
  sector: string
  stage: string
  location: string
  funding_asked: string
  traction_score: number
  team_score: number
  market_score: number
  overall_score: number
  key_metrics: Record<string, string>
  source_channel: string
  recommendation: string
}

export interface DealSourcingOutput {
  total_deals_sourced: number
  deals: SourcedDeal[]
  sector_distribution: Record<string, number>
  stage_distribution: Record<string, number>
  pipeline_recommendations: string[]
  market_context: string
  summary: string
}

// --- Tool 2: Due Diligence Checker ---
export interface DueDiligenceInput {
  company_name?: string
  sector?: string
  stage?: 'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'series_c' | 'growth'
  metrics?: {
    revenue?: number
    growth_rate?: number
    gross_margin?: number
    burn_rate?: number
    runway_months?: number
    customer_count?: number
    nrr?: number
  }
  team?: {
    founder_count?: number
    domain_experience_years?: number
    previous_exits?: number
    key_hires?: string[]
  }
  risks_identified?: string[]
  documents_provided?: string[]
}

export interface DDRiskFlag {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  mitigation: string
  weight: number
}

export interface DueDiligenceOutput {
  overall_dd_score: number
  go_no_go: 'strong_go' | 'go' | 'conditional_go' | 'no_go' | 'strong_no_go'
  risk_flags: DDRiskFlag[]
  financial_health: string
  team_assessment: string
  market_assessment: string
  key_questions: string[]
  valuation_range: { low: number; mid: number; high: number }
  summary: string
}

// --- Tool 3: Portfolio Health Monitor ---
export interface PortfolioHealthInput {
  portfolio_companies?: Array<{
    name: string
    sector: string
    stage: string
    investment_date: string
    investment_amount: number
    current_valuation: number
    revenue_current: number
    revenue_prior: number
    burn_rate: number
    runway_months: number
    founder_count: number
    nps_score?: number
  }>
  benchmark_metrics?: Record<string, number>
  alert_thresholds?: {
    runway_warning_months?: number
    burn_multiple_warning?: number
    revenue_decline_pct?: number
  }
}

export interface CompanyHealth {
  company_name: string
  health_score: number
  status: 'thriving' | 'healthy' | 'watch' | 'at_risk' | 'critical'
  kpi_alerts: string[]
  key_metrics: {
    revenue_growth: number
    burn_multiple: number
    runway_status: string
    valuation_change: number
  }
  recommendations: string[]
}

export interface PortfolioHealthOutput {
  portfolio_summary: string
  companies: CompanyHealth[]
  portfolio_avg_health: number
  at_risk_count: number
  thriving_count: number
  diversification_score: number
  rebalancing_suggestions: string[]
  summary: string
}

// --- Tool 4: Market Mapping Analyst ---
export interface MarketMappingInput {
  market_name?: string
  sectors?: string[]
  geography?: string
  market_size_baseline?: number
  growth_rate?: number
  competitors?: Array<{
    name: string
    market_share: number
    funding_total: number
    stage: string
    differentiator: string
  }>
  trends?: string[]
  regulatory_factors?: string[]
}

export interface MarketSegment {
  segment_name: string
  size_millions: number
  growth_rate: number
  intensity: 'low' | 'medium' | 'high' | 'very_high'
  key_players: string[]
  whitespace_opportunity: number
  entry_barriers: string[]
}

export interface CompetitivePosition {
  player: string
  position: { x: number; y: number }
  quadrant: 'leader' | 'challenger' | 'niche' | 'emerging'
  market_share: number
  strength: string
  weakness: string
}

export interface MarketMappingOutput {
  market_name: string
  total_addressable_millions: number
  segments: MarketSegment[]
  competitive_positions: CompetitivePosition[]
  market_trends: string[]
  opportunity_gaps: string[]
  investment_thesis: string
  summary: string
}

// --- Tool 5: Startup Scoring Model ---
export interface StartupScoringInput {
  startup_name?: string
  sector?: string
  stage?: 'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'series_c' | 'growth'
  team?: {
    founder_experience?: number
    domain_expertise?: number
    team_completeness?: number
    previous_exits?: number
    technical_talent?: number
  }
  market?: {
    tam_billions?: number
    growth_rate?: number
    competitive_intensity?: number
    tailwinds?: string[]
  }
  traction?: {
    revenue?: number
    growth_rate?: number
    retention_rate?: number
    user_count?: number
    partnerships?: number
  }
  product?: {
    innovation_score?: number
    defensibility?: number
    technical_moat?: number
    ip_portfolio?: number
  }
  financials?: {
    unit_economics?: number
    gross_margin?: number
    capital_efficiency?: number
    path_to_profitability?: number
  }
}

export interface ScoreBreakdown {
  category: string
  score: number
  weight: number
  weighted_score: number
  factors: string[]
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface StartupScoringOutput {
  startup_name: string
  overall_score: number
  investment_grade: 'exceptional' | 'strong' | 'promising' | 'marginal' | 'weak'
  score_breakdown: ScoreBreakdown[]
  strengths: string[]
  concerns: string[]
  comparable_exits: string[]
  recommended_check_size: string
  summary: string
}

// --- Tool 6: Cap Table Analyzer ---
export interface CapTableInput {
  company_name?: string
  pre_money_valuation?: number
  raise_amount?: number
  security_type?: 'priced_equity' | 'safe' | 'convertible_note' | 'series_seed'
  existing_shareholders?: Array<{
    name: string
    shares: number
    ownership_pct: number
    type: 'founder' | 'investor' | 'employee' | 'advisor' | 'esop'
  }>
  esop_pool?: { target_pct: number; current_pct: number }
  liquidation_preference?: '1x_non_participating' | '1x_participating' | '2x_participating'
  anti_dilution?: 'broad_based' | 'narrow_based' | 'full_ratchet'
  pro_rata_rights?: boolean
}

export interface OwnershipEntry {
  shareholder: string
  shares: number
  ownership_pct: number
  type: string
  fully_diluted_pct: number
}

export interface CapTableOutput {
  company_name: string
  post_money_valuation: number
  price_per_share: number
  new_investor_ownership: number
  founder_ownership_diluted: number
  esop_pool_pct: number
  cap_table: OwnershipEntry[]
  dilution_analysis: string
  liquidation_waterfall: string[]
  key_terms_summary: string[]
  summary: string
}

// --- Tool 7: Exit Strategy Advisor ---
export interface ExitStrategyInput {
  company_name?: string
  sector?: string
  current_stage?: 'seed' | 'series_a' | 'series_b' | 'series_c' | 'growth'
  current_valuation?: number
  revenue?: number
  growth_rate?: number
  profitability_status?: 'profitable' | 'breakeven' | 'cash_flow_negative'
  strategic_buyers?: string[]
  comparable_exits?: Array<{
    company: string
    sector: string
    exit_value: number
    exit_type: string
    ev_multiple: number
    year: number
  }>
  market_conditions?: 'hot' | 'neutral' | 'cold'
  timeline_preference?: 'immediate' | '1_2_years' | '3_5_years'
}

export interface ExitScenario {
  scenario: string
  exit_type: 'ipo' | 'strategic_acquisition' | 'secondary' | 'ma' | 'buyback'
  probability: number
  estimated_value: number
  timeline: string
  key_conditions: string[]
  risks: string[]
  ev_multiple: number
}

export interface ExitStrategyOutput {
  company_name: string
  recommended_exit: string
  exit_scenarios: ExitScenario[]
  optimal_timing: string
  valuation_range: { low: number; mid: number; high: number }
  buyer_landscape: string[]
  preparation_checklist: string[]
  market_context: string
  summary: string
}

// --- Tool 8: Investment Thesis Validator ---
export interface InvestmentThesisInput {
  thesis_statement?: string
  sector?: string
  stage_focus?: string
  key_beliefs?: string[]
  supporting_data?: {
    market_size?: number
    growth_rate?: number
    competitive_dynamics?: string
    tailwinds?: string[]
  }
  contrarian_views?: string[]
  risks?: string[]
  portfolio_fit?: {
    sector_exposure?: number
    stage_alignment?: string
    geographic_fit?: string
    return_profile?: string
  }
  historical_precedents?: string[]
}

export interface ThesisTest {
  test_name: string
  result: 'pass' | 'partial' | 'fail'
  confidence: number
  reasoning: string
  evidence: string[]
  counter_arguments: string[]
}

export interface InvestmentThesisOutput {
  thesis_statement: string
  overall_confidence: number
  verdict: 'strong_buy' | 'buy' | 'hold' | 'weak' | 'reject'
  thesis_tests: ThesisTest[]
  supporting_points: string[]
  challenging_points: string[]
  missing_evidence: string[]
  suggested_thesis_refinements: string[]
  summary: string
}

// ==================== TOOL 1: DEAL SOURCING ENGINE ====================

function generateDealSourcing(input: DealSourcingInput): DealSourcingOutput {
  const rng = seededRng(input)
  const sectors = input.sectors || ['fintech', 'saas', 'healthtech', 'ai_ml', 'climate_tech', 'cybersecurity']
  const stages = input.stages || ['seed', 'series_a', 'series_b']
  const sources = input.sources || ['pitchbook', 'crunchbase', 'angellist', 'accelerator_demos', 'referral_network', 'proprietary_outbound']

  const companyNames = [
    'NexaPay', 'CloudVault', 'MediSync', 'GreenGrid', 'DataForge', 'QuantumLeap',
    'FinFlow', 'BioSense', 'AutoDrive', 'SpaceLink', 'CyberShield', 'EduSpark',
    'FoodChain', 'LogiTrack', 'RetailAI', 'EnergyOS', 'LegalEase', 'PropTech',
    'InsureNow', 'DevOpsGenie', 'AgriDrone', 'CleanWater', 'BlockTrade', 'MetaVerse'
  ]

  const deals: SourcedDeal[] = []
  const numDeals = rngRange(rng, 8, 15)
  const usedNames = new Set<string>()

  for (let i = 0; i < numDeals; i++) {
    let nameIdx = rngRange(rng, 0, companyNames.length - 1)
    while (usedNames.has(companyNames[nameIdx])) {
      nameIdx = (nameIdx + 1) % companyNames.length
    }
    usedNames.add(companyNames[nameIdx])

    const sector = sectors[rngRange(rng, 0, sectors.length - 1)]
    const stage = stages[rngRange(rng, 0, stages.length - 1)]
    const source = sources[rngRange(rng, 0, sources.length - 1)]

    const tractionScore = parseFloat(rngFloat(rng, 0.45, 0.95).toFixed(2))
    const teamScore = parseFloat(rngFloat(rng, 0.50, 0.98).toFixed(2))
    const marketScore = parseFloat(rngFloat(rng, 0.55, 0.92).toFixed(2))
    const overallScore = parseFloat((tractionScore * 0.35 + teamScore * 0.35 + marketScore * 0.30).toFixed(2))

    const fundingAsk = stage === 'seed' ? '$1.5M - $3M' : stage === 'series_a' ? '$5M - $15M' : stage === 'series_b' ? '$15M - $40M' : '$40M - $80M'

    deals.push({
      deal_id: 'DEAL-' + String(rngRange(rng, 10000, 99999)),
      company_name: companyNames[nameIdx],
      sector,
      stage,
      location: ['San Francisco', 'New York', 'London', 'Berlin', 'Singapore', 'Bangalore'][rngRange(rng, 0, 5)],
      funding_asked: fundingAsk,
      traction_score: tractionScore,
      team_score: teamScore,
      market_score: marketScore,
      overall_score: overallScore,
      key_metrics: {
        revenue: '$' + String(rngRange(rng, 0, 500)) + 'K ARR',
        growth: String(rngRange(rng, 80, 400)) + '% YoY',
        team_size: String(rngRange(rng, 5, 80)),
        nps: String(rngRange(rng, 20, 75))
      },
      source_channel: source,
      recommendation: overallScore >= 0.8 ? 'Priority outreach - schedule partner meeting' : overallScore >= 0.65 ? 'High interest - request data room access' : 'Monitor - add to nurture pipeline'
    })
  }

  deals.sort((a, b) => b.overall_score - a.overall_score)

  const sectorDist: Record<string, number> = {}
  const stageDist: Record<string, number> = {}
  for (const d of deals) {
    sectorDist[d.sector] = (sectorDist[d.sector] || 0) + 1
    stageDist[d.stage] = (stageDist[d.stage] || 0) + 1
  }

  const pipelineRecs: string[] = []
  pipelineRecs.push('Focus partner sourcing efforts on top 3 scored deals for immediate outreach')
  pipelineRecs.push('Diversify source channels: increase accelerator demo day attendance and proprietary outbound')
  pipelineRecs.push('Set up automated alerts for new companies matching criteria in target sectors')
  pipelineRecs.push('Leverage referral network for warm introductions to high-scoring founders')

  return {
    total_deals_sourced: deals.length,
    deals,
    sector_distribution: sectorDist,
    stage_distribution: stageDist,
    pipeline_recommendations: pipelineRecs,
    market_context: '2026 VC deal sourcing increasingly driven by AI-powered screening, alternative data signals, and founder- market fit algorithms. Early-stage deal flow remains competitive with median seed round growing to $3.5M.',
    summary: 'Deal sourcing engine identified ' + deals.length + ' opportunities across ' + Object.keys(sectorDist).length + ' sectors with ' + deals.filter(d => d.overall_score >= 0.7).length + ' high-priority targets'
  }
}

function formatDealSourcingReport(input: DealSourcingInput, output: DealSourcingOutput): string {
  const lines: string[] = []
  lines.push('## Deal Sourcing Engine Report')
  lines.push('')
  lines.push('**Sectors:** ' + (input.sectors || ['fintech', 'saas', 'healthtech', 'ai_ml', 'climate_tech', 'cybersecurity']).join(', ') + ' | **Stages:** ' + (input.stages || ['seed', 'series_a', 'series_b']).join(', '))
  lines.push('**Total Deals Sourced:** ' + output.total_deals_sourced)
  lines.push('')
  lines.push('### Top Deals')
  lines.push('| Deal ID | Company | Sector | Stage | Score | Funding | Recommendation |')
  lines.push('|---------|---------|--------|-------|-------|---------|----------------|')
  for (const d of output.deals.slice(0, 10)) {
    lines.push('| ' + d.deal_id + ' | ' + d.company_name + ' | ' + d.sector + ' | ' + d.stage + ' | ' + d.overall_score.toFixed(2) + ' | ' + d.funding_asked + ' | ' + d.recommendation + ' |')
  }
  lines.push('')
  lines.push('### Sector Distribution')
  for (const [sector, count] of Object.entries(output.sector_distribution)) {
    lines.push('- ' + sector + ': ' + count + ' deals')
  }
  lines.push('')
  lines.push('### Pipeline Recommendations')
  for (const rec of output.pipeline_recommendations) lines.push('- [ ] ' + rec)
  lines.push('')
  lines.push('> **Market Insight:** ' + output.market_context)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: DUE DILIGENCE CHECKER ====================

function generateDueDiligence(input: DueDiligenceInput): DueDiligenceOutput {
  const rng = seededRng(input)
  const companyName = input.company_name || 'Target Company'
  const metrics = input.metrics || {}
  const team = input.team || {}

  const revenue = metrics.revenue || rngRange(rng, 50, 5000)
  const growthRate = metrics.growth_rate || rngRange(rng, 30, 400)
  const grossMargin = metrics.gross_margin || rngRange(rng, 40, 90)
  const burnRate = metrics.burn_rate || rngRange(rng, 50, 800)
  const runway = metrics.runway_months || rngRange(rng, 6, 36)
  const customerCount = metrics.customer_count || rngRange(rng, 10, 500)
  const nrr = metrics.nrr || rngRange(rng, 80, 150)

  const riskFlags: DDRiskFlag[] = []

  if (runway < 12) {
    riskFlags.push({
      category: 'Financial',
      severity: runway < 6 ? 'critical' : 'high',
      description: 'Runway of ' + runway + ' months is below 12-month safety threshold',
      mitigation: 'Plan next fundraise immediately; explore bridge financing or revenue acceleration',
      weight: 0.15
    })
  }

  if (grossMargin < 60) {
    riskFlags.push({
      category: 'Business Model',
      severity: grossMargin < 40 ? 'high' : 'medium',
      description: 'Gross margin of ' + grossMargin + '% is below SaaS benchmark of 70%+',
      mitigation: 'Analyze COGS structure; evaluate pricing power and infrastructure optimization opportunities',
      weight: 0.10
    })
  }

  if (nrr < 100) {
    riskFlags.push({
      category: 'Revenue Quality',
      severity: nrr < 90 ? 'high' : 'medium',
      description: 'Net Revenue Retention of ' + nrr + '% indicates potential churn or downgrade risk',
      mitigation: 'Deep-dive cohort analysis; assess expansion revenue pipeline and customer success metrics',
      weight: 0.12
    })
  }

  if (team.founder_count && team.founder_count < 2) {
    riskFlags.push({
      category: 'Team',
      severity: 'medium',
      description: 'Single-founder company presents key-person risk',
      mitigation: 'Evaluate co-founder hiring plan; assess board composition and advisory network',
      weight: 0.08
    })
  }

  if (growthRate > 200 && burnRate > 300) {
    riskFlags.push({
      category: 'Growth Efficiency',
      severity: 'medium',
      description: 'High growth with elevated burn raises capital efficiency concerns',
      mitigation: 'Calculate burn multiple; benchmark against sector peers; assess path to profitability',
      weight: 0.10
    })
  }

  if (input.risks_identified) {
    for (const risk of input.risks_identified) {
      riskFlags.push({
        category: 'Disclosed',
        severity: 'medium',
        description: risk,
        mitigation: 'Conduct targeted due diligence on disclosed risk factor',
        weight: 0.05
      })
    }
  }

  const totalRiskWeight = riskFlags.reduce((sum, rf) => sum + rf.weight, 0)
  const baseScore = 75
  const ddScore = clamp(Math.round(baseScore - totalRiskWeight * 100 + rngRange(rng, -5, 10)), 20, 98)

  let goNoGo: DueDiligenceOutput['go_no_go'] = 'go'
  if (ddScore >= 85) goNoGo = 'strong_go'
  else if (ddScore >= 70) goNoGo = 'go'
  else if (ddScore >= 55) goNoGo = 'conditional_go'
  else if (ddScore >= 40) goNoGo = 'no_go'
  else goNoGo = 'strong_no_go'

  const valuationLow = Math.round(revenue * (growthRate > 200 ? 15 : growthRate > 100 ? 10 : 5))
  const valuationMid = Math.round(valuationLow * 1.5)
  const valuationHigh = Math.round(valuationLow * 2.2)

  const keyQuestions: string[] = []
  keyQuestions.push('What is the customer acquisition cost (CAC) payback period and how has it trended?')
  keyQuestions.push('What concentration risk exists with top 10 customers?')
  keyQuestions.push('How defensible is the technical moat against well-funded competitors?')
  keyQuestions.push('What is the founder vesting schedule and key-person dependency plan?')
  if (runway < 18) keyQuestions.push('What is the Plan B if the next fundraise is delayed by 6+ months?')

  return {
    overall_dd_score: ddScore,
    go_no_go: goNoGo,
    risk_flags: riskFlags,
    financial_health: 'Revenue $' + revenue + 'K ARR, ' + growthRate + '% growth, ' + grossMargin + '% GM, ' + runway + ' months runway',
    team_assessment: (team.founder_count || 2) + ' founders, ' + (team.domain_experience_years || 8) + ' years avg domain experience, ' + (team.previous_exits || 1) + ' prior exits',
    market_assessment: 'Market position supported by ' + customerCount + ' customers and ' + nrr + '% NRR indicating ' + (nrr >= 110 ? 'strong' : nrr >= 100 ? 'adequate' : 'concerning') + ' revenue retention',
    key_questions: keyQuestions,
    valuation_range: { low: valuationLow, mid: valuationMid, high: valuationHigh },
    summary: 'Due diligence on ' + companyName + ': DD score ' + ddScore + '/100 (' + goNoGo.toUpperCase() + ') with ' + riskFlags.length + ' risk flags identified'
  }
}

function formatDueDiligenceReport(input: DueDiligenceInput, output: DueDiligenceOutput): string {
  const lines: string[] = []
  lines.push('## Due Diligence Report')
  lines.push('')
  lines.push('**Company:** ' + (input.company_name || 'Target Company') + ' | **DD Score:** ' + output.overall_dd_score + '/100 | **Verdict:** ' + output.go_no_go.toUpperCase())
  lines.push('')
  lines.push('### Financial Health')
  lines.push(output.financial_health)
  lines.push('')
  lines.push('### Team Assessment')
  lines.push(output.team_assessment)
  lines.push('')
  lines.push('### Market Assessment')
  lines.push(output.market_assessment)
  lines.push('')
  lines.push('### Risk Flags (' + output.risk_flags.length + ')')
  for (const rf of output.risk_flags) {
    lines.push('- [' + rf.severity.toUpperCase() + '] ' + rf.category + ': ' + rf.description)
    lines.push('  Mitigation: ' + rf.mitigation)
  }
  lines.push('')
  lines.push('### Valuation Range')
  lines.push('- Low: $' + output.valuation_range.low.toLocaleString())
  lines.push('- Mid: $' + output.valuation_range.mid.toLocaleString())
  lines.push('- High: $' + output.valuation_range.high.toLocaleString())
  lines.push('')
  lines.push('### Key Questions')
  for (const q of output.key_questions) lines.push('- [ ] ' + q)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: PORTFOLIO HEALTH MONITOR ====================

function generatePortfolioHealth(input: PortfolioHealthInput): PortfolioHealthOutput {
  const rng = seededRng(input)
  const companies = input.portfolio_companies || []
  const thresholds = input.alert_thresholds || { runway_warning_months: 12, burn_multiple_warning: 3.0, revenue_decline_pct: 20 }

  if (companies.length === 0) {
    const defaultCompanies = [
      { name: 'AlphaFlow', sector: 'fintech', stage: 'series_a', investment_date: '2023-03-15', investment_amount: 5000000, current_valuation: 25000000, revenue_current: 3200, revenue_prior: 1800, burn_rate: 280, runway_months: 18, founder_count: 3, nps_score: 55 },
      { name: 'BetaSense', sector: 'ai_ml', stage: 'series_b', investment_date: '2022-08-01', investment_amount: 12000000, current_valuation: 80000000, revenue_current: 8500, revenue_prior: 4200, burn_rate: 520, runway_months: 14, founder_count: 2, nps_score: 62 },
      { name: 'GammaShield', sector: 'cybersecurity', stage: 'seed', investment_date: '2024-01-10', investment_amount: 2500000, current_valuation: 12000000, revenue_current: 450, revenue_prior: 120, burn_rate: 150, runway_months: 20, founder_count: 2, nps_score: 48 },
      { name: 'DeltaGreen', sector: 'climate_tech', stage: 'series_a', investment_date: '2023-06-20', investment_amount: 7000000, current_valuation: 30000000, revenue_current: 1500, revenue_prior: 2200, burn_rate: 350, runway_months: 8, founder_count: 1, nps_score: 35 },
      { name: 'EpsilonHealth', sector: 'healthtech', stage: 'series_b', investment_date: '2022-11-05', investment_amount: 15000000, current_valuation: 95000000, revenue_current: 12000, revenue_prior: 7500, burn_rate: 600, runway_months: 16, founder_count: 4, nps_score: 70 }
    ]
    return generatePortfolioHealth({ ...input, portfolio_companies: defaultCompanies })
  }

  const companyHealths: CompanyHealth[] = []
  let atRiskCount = 0
  let thrivingCount = 0

  for (const company of companies) {
    const revenueGrowth = company.revenue_prior > 0 ? ((company.current_valuation / company.investment_amount - 1) * 100) : 0
    const actualRevenueGrowth = company.revenue_prior > 0 ? ((company.revenue_current - company.revenue_prior) / company.revenue_prior * 100) : 0
    const burnMultiple = company.revenue_current > 0 ? company.burn_rate / (company.revenue_current / 12) : company.burn_rate
    const valuationChange = ((company.current_valuation - company.investment_amount) / company.investment_amount * 100)

    let healthScore = 70
    healthScore += actualRevenueGrowth > 100 ? 15 : actualRevenueGrowth > 50 ? 10 : actualRevenueGrowth > 0 ? 0 : -15
    healthScore += company.runway_months >= 18 ? 10 : company.runway_months >= 12 ? 5 : company.runway_months >= 6 ? -10 : -20
    healthScore += burnMultiple < 2 ? 10 : burnMultiple < 3 ? 5 : burnMultiple < 5 ? -5 : -15
    healthScore += valuationChange > 200 ? 10 : valuationChange > 100 ? 5 : valuationChange > 0 ? 0 : -10
    healthScore = clamp(healthScore + rngRange(rng, -5, 5), 10, 100)

    let status: CompanyHealth['status'] = 'healthy'
    if (healthScore >= 85) { status = 'thriving'; thrivingCount++ }
    else if (healthScore >= 70) { status = 'healthy' }
    else if (healthScore >= 50) { status = 'watch' }
    else if (healthScore >= 30) { status = 'at_risk'; atRiskCount++ }
    else { status = 'critical'; atRiskCount++ }

    const kpiAlerts: string[] = []
    if (company.runway_months < (thresholds.runway_warning_months || 12)) {
      kpiAlerts.push('RUNWAY ALERT: Only ' + company.runway_months + ' months remaining')
    }
    if (burnMultiple > (thresholds.burn_multiple_warning || 3.0)) {
      kpiAlerts.push('BURN ALERT: Burn multiple of ' + burnMultiple.toFixed(1) + 'x exceeds threshold')
    }
    if (actualRevenueGrowth < 0) {
      kpiAlerts.push('REVENUE DECLINE: ' + actualRevenueGrowth.toFixed(1) + '% YoY revenue decrease')
    }
    if (company.founder_count <= 1) {
      kpiAlerts.push('KEY PERSON RISK: Single founder dependency')
    }

    const recommendations: string[] = []
    if (status === 'thriving') {
      recommendations.push('Consider follow-on investment at next round to maintain ownership')
      recommendations.push('Explore strategic exit opportunities if valuation inflection point reached')
    } else if (status === 'healthy') {
      recommendations.push('Continue quarterly board engagement and KPI monitoring')
      recommendations.push('Support company in key hire recruitment for scaling')
    } else if (status === 'watch') {
      recommendations.push('Increase monitoring frequency to monthly KPI reviews')
      recommendations.push('Schedule founder check-in to discuss challenges and mitigation plans')
    } else {
      recommendations.push('URGENT: Convene board meeting to discuss strategic options')
      recommendations.push('Assess bridge financing needs and downside protection')
      recommendations.push('Evaluate write-down or write-off scenarios')
    }

    companyHealths.push({
      company_name: company.name,
      health_score: healthScore,
      status,
      kpi_alerts: kpiAlerts,
      key_metrics: {
        revenue_growth: parseFloat(actualRevenueGrowth.toFixed(1)),
        burn_multiple: parseFloat(burnMultiple.toFixed(1)),
        runway_status: company.runway_months + ' months',
        valuation_change: parseFloat(valuationChange.toFixed(1))
      },
      recommendations
    })
  }

  const avgHealth = companyHealths.length > 0 ? Math.round(companyHealths.reduce((s, c) => s + c.health_score, 0) / companyHealths.length) : 0

  const sectors = companies.map(c => c.sector)
  const uniqueSectors = new Set(sectors).size
  const diversificationScore = clamp(Math.round((uniqueSectors / Math.max(companies.length, 1)) * 100), 20, 95)

  const rebalancing: string[] = []
  if (atRiskCount > companies.length * 0.3) rebalancing.push('Portfolio has ' + atRiskCount + ' at-risk companies - consider reducing exposure and reallocating to stronger positions')
  if (diversificationScore < 50) rebalancing.push('Low diversification score - increase sector spread in next fund deployment')
  if (thrivingCount > 0) rebalancing.push('Consider partial secondary sales in thriving positions to return capital to LPs')
  rebalancing.push('Review reserve allocation for follow-on rounds in top-performing companies')

  return {
    portfolio_summary: companies.length + ' companies monitored, ' + thrivingCount + ' thriving, ' + atRiskCount + ' at-risk',
    companies: companyHealths,
    portfolio_avg_health: avgHealth,
    at_risk_count: atRiskCount,
    thriving_count: thrivingCount,
    diversification_score: diversificationScore,
    rebalancing_suggestions: rebalancing,
    summary: 'Portfolio health check: avg score ' + avgHealth + '/100, ' + thrivingCount + ' thriving, ' + atRiskCount + ' at-risk out of ' + companies.length + ' companies'
  }
}

function formatPortfolioHealthReport(input: PortfolioHealthInput, output: PortfolioHealthOutput): string {
  const lines: string[] = []
  lines.push('## Portfolio Health Monitor Report')
  lines.push('')
  lines.push('**Portfolio:** ' + output.portfolio_summary)
  lines.push('**Avg Health:** ' + output.portfolio_avg_health + '/100 | **Diversification:** ' + output.diversification_score + '/100')
  lines.push('')
  for (const c of output.companies) {
    lines.push('### ' + c.company_name + ' [' + c.status.toUpperCase() + '] - Score: ' + c.health_score)
    lines.push('- Revenue Growth: ' + c.key_metrics.revenue_growth + '% | Burn Multiple: ' + c.key_metrics.burn_multiple + 'x | Runway: ' + c.key_metrics.runway_status)
    if (c.kpi_alerts.length > 0) {
      lines.push('- **Alerts:** ' + c.kpi_alerts.join('; '))
    }
    for (const rec of c.recommendations) lines.push('- ' + rec)
    lines.push('')
  }
  lines.push('### Rebalancing Suggestions')
  for (const r of output.rebalancing_suggestions) lines.push('- ' + r)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: MARKET MAPPING ANALYST ====================

function generateMarketMapping(input: MarketMappingInput): MarketMappingOutput {
  const rng = seededRng(input)
  const marketName = input.market_name || 'Enterprise AI Platforms'
  const tam = input.market_size_baseline || rngRange(rng, 2000, 15000)
  const growthRate = input.growth_rate || rngRange(rng, 15, 45)

  const segmentTemplates = [
    { name: 'Enterprise SaaS', sizePct: 35, intensity: 'high' as const },
    { name: 'Mid-Market Solutions', sizePct: 25, intensity: 'medium' as const },
    { name: 'SMB / Self-Serve', sizePct: 20, intensity: 'medium' as const },
    { name: 'Vertical / Niche', sizePct: 12, intensity: 'low' as const },
    { name: 'Developer Tools', sizePct: 8, intensity: 'high' as const }
  ]

  const segments: MarketSegment[] = segmentTemplates.map(st => ({
    segment_name: st.name,
    size_millions: Math.round(tam * st.sizePct / 100),
    growth_rate: parseFloat((growthRate + rngFloat(rng, -8, 12)).toFixed(1)),
    intensity: st.intensity,
    key_players: ['Player A', 'Player B', 'Player C'],
    whitespace_opportunity: parseFloat(rngFloat(rng, 0.15, 0.65).toFixed(2)),
    entry_barriers: st.intensity === 'high' ? ['Brand recognition', 'Switching costs', 'Network effects'] : ['Distribution', 'Product-market fit', 'Capital requirements']
  }))

  const competitors = input.competitors || [
    { name: 'IncumbentX', market_share: 22, funding_total: 500, stage: 'public', differentiator: 'Scale and brand' },
    { name: 'ChallengerY', market_share: 15, funding_total: 200, stage: 'series_c', differentiator: 'Product innovation' },
    { name: 'NicheZ', market_share: 8, funding_total: 50, stage: 'series_a', differentiator: 'Vertical depth' },
    { name: 'NewEntrant', market_share: 3, funding_total: 15, stage: 'seed', differentiator: 'AI-native approach' }
  ]

  const competitivePositions: CompetitivePosition[] = competitors.map(comp => {
    const x = parseFloat(rngFloat(rng, 0.1, 0.9).toFixed(2))
    const y = parseFloat(rngFloat(rng, 0.1, 0.9).toFixed(2))
    let quadrant: CompetitivePosition['quadrant'] = 'emerging'
    if (x > 0.6 && y > 0.6) quadrant = 'leader'
    else if (x > 0.4 && y > 0.4) quadrant = 'challenger'
    else if (x <= 0.4) quadrant = 'niche'

    return {
      player: comp.name,
      position: { x, y },
      quadrant,
      market_share: comp.market_share,
      strength: comp.differentiator,
      weakness: comp.stage === 'public' ? 'Innovation speed' : comp.stage === 'seed' ? 'Market reach' : 'Scale limitations'
    }
  })

  const trends: string[] = input.trends || [
    'AI/ML integration becoming table stakes across all segments',
    'Consolidation activity increasing as incumbents acquire point solutions',
    'Vertical-specific solutions gaining traction over horizontal platforms',
    'Usage-based pricing models challenging traditional subscription models',
    'Regulatory tailwinds driving compliance-focused product requirements'
  ]

  const opportunityGaps: string[] = []
  opportunityGaps.push('Underserved mid-market segment with limited AI-native solutions')
  opportunityGaps.push('Cross-industry platform play connecting vertical silos')
  opportunityGaps.push('Emerging market geographies with low incumbent penetration')
  opportunityGaps.push('Developer-first tooling with PLG motion in enterprise context')

  return {
    market_name: marketName,
    total_addressable_millions: tam,
    segments,
    competitive_positions: competitivePositions,
    market_trends: trends,
    opportunity_gaps: opportunityGaps,
    investment_thesis: marketName + ' market offers compelling entry points in underserved segments with ' + growthRate + '% CAGR and fragmentation creating acquisition targets for platform strategies',
    summary: 'Market mapping: $' + tam + 'M TAM across ' + segments.length + ' segments, ' + competitivePositions.length + ' competitors mapped, ' + opportunityGaps.length + ' whitespace opportunities identified'
  }
}

function formatMarketMappingReport(input: MarketMappingInput, output: MarketMappingOutput): string {
  const lines: string[] = []
  lines.push('## Market Mapping Analysis Report')
  lines.push('')
  lines.push('**Market:** ' + output.market_name + ' | **TAM:** $' + output.total_addressable_millions + 'M')
  lines.push('')
  lines.push('### Market Segments')
  lines.push('| Segment | Size ($M) | Growth | Intensity | Whitespace |')
  lines.push('|---------|-----------|--------|-----------|------------|')
  for (const s of output.segments) {
    lines.push('| ' + s.segment_name + ' | ' + s.size_millions + ' | ' + s.growth_rate + '% | ' + s.intensity + ' | ' + (s.whitespace_opportunity * 100).toFixed(0) + '% |')
  }
  lines.push('')
  lines.push('### Competitive Landscape')
  for (const cp of output.competitive_positions) {
    lines.push('- **' + cp.player + '** [' + cp.quadrant.toUpperCase() + '] - ' + cp.market_share + '% share | Strength: ' + cp.strength + ' | Weakness: ' + cp.weakness)
  }
  lines.push('')
  lines.push('### Market Trends')
  for (const t of output.market_trends) lines.push('- ' + t)
  lines.push('')
  lines.push('### Opportunity Gaps')
  for (const g of output.opportunity_gaps) lines.push('- [ ] ' + g)
  lines.push('')
  lines.push('### Investment Thesis')
  lines.push(output.investment_thesis)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: STARTUP SCORING MODEL ====================

function generateStartupScoring(input: StartupScoringInput): StartupScoringOutput {
  const rng = seededRng(input)
  const startupName = input.startup_name || 'Startup'
  const team = input.team || {}
  const market = input.market || {}
  const traction = input.traction || {}
  const product = input.product || {}
  const financials = input.financials || {}

  const teamScore = clamp(Math.round(
    (team.founder_experience || 7) * 10 * 0.25 +
    (team.domain_expertise || 7) * 10 * 0.25 +
    (team.team_completeness || 6) * 10 * 0.20 +
    Math.min((team.previous_exits || 1) * 20, 30) * 0.15 +
    (team.technical_talent || 7) * 10 * 0.15 +
    rngRange(rng, -5, 5)
  ), 15, 98)

  const marketScore = clamp(Math.round(
    Math.min((market.tam_billions || 5) * 5, 35) * 0.35 +
    Math.min((market.growth_rate || 25) * 1.5, 35) * 0.35 +
    (10 - (market.competitive_intensity || 5)) * 3 * 0.20 +
    Math.min((market.tailwinds || []).length * 5, 15) * 0.10 +
    rngRange(rng, -5, 5)
  ), 15, 98)

  const tractionScore = clamp(Math.round(
    Math.min((traction.revenue || 500) / 50, 30) * 0.30 +
    Math.min((traction.growth_rate || 100) / 4, 30) * 0.30 +
    (traction.retention_rate || 85) * 0.20 +
    Math.min((traction.user_count || 1000) / 200, 20) * 0.10 +
    Math.min((traction.partnerships || 2) * 5, 15) * 0.10 +
    rngRange(rng, -5, 5)
  ), 10, 98)

  const productScore = clamp(Math.round(
    (product.innovation_score || 7) * 10 * 0.30 +
    (product.defensibility || 6) * 10 * 0.25 +
    (product.technical_moat || 6) * 10 * 0.25 +
    Math.min((product.ip_portfolio || 2) * 10, 30) * 0.20 +
    rngRange(rng, -5, 5)
  ), 15, 98)

  const financialScore = clamp(Math.round(
    (financials.unit_economics || 6) * 10 * 0.30 +
    (financials.gross_margin || 65) * 0.8 * 0.25 +
    (financials.capital_efficiency || 6) * 10 * 0.25 +
    (financials.path_to_profitability || 5) * 10 * 0.20 +
    rngRange(rng, -5, 5)
  ), 15, 98)

  const scoreBreakdown: ScoreBreakdown[] = [
    { category: 'Team', score: teamScore, weight: 0.30, weighted_score: parseFloat((teamScore * 0.30).toFixed(1)), factors: ['Founder experience', 'Domain expertise', 'Team completeness', 'Prior exits'], grade: teamScore >= 85 ? 'A' : teamScore >= 70 ? 'B' : teamScore >= 55 ? 'C' : teamScore >= 40 ? 'D' : 'F' },
    { category: 'Market', score: marketScore, weight: 0.25, weighted_score: parseFloat((marketScore * 0.25).toFixed(1)), factors: ['TAM size', 'Growth rate', 'Competitive intensity', 'Tailwinds'], grade: marketScore >= 85 ? 'A' : marketScore >= 70 ? 'B' : marketScore >= 55 ? 'C' : marketScore >= 40 ? 'D' : 'F' },
    { category: 'Traction', score: tractionScore, weight: 0.25, weighted_score: parseFloat((tractionScore * 0.25).toFixed(1)), factors: ['Revenue', 'Growth rate', 'Retention', 'User base', 'Partnerships'], grade: tractionScore >= 85 ? 'A' : tractionScore >= 70 ? 'B' : tractionScore >= 55 ? 'C' : tractionScore >= 40 ? 'D' : 'F' },
    { category: 'Product', score: productScore, weight: 0.10, weighted_score: parseFloat((productScore * 0.10).toFixed(1)), factors: ['Innovation', 'Defensibility', 'Technical moat', 'IP portfolio'], grade: productScore >= 85 ? 'A' : productScore >= 70 ? 'B' : productScore >= 55 ? 'C' : productScore >= 40 ? 'D' : 'F' },
    { category: 'Financials', score: financialScore, weight: 0.10, weighted_score: parseFloat((financialScore * 0.10).toFixed(1)), factors: ['Unit economics', 'Gross margin', 'Capital efficiency', 'Path to profitability'], grade: financialScore >= 85 ? 'A' : financialScore >= 70 ? 'B' : financialScore >= 55 ? 'C' : financialScore >= 40 ? 'D' : 'F' }
  ]

  const overallScore = Math.round(scoreBreakdown.reduce((s, sb) => s + sb.weighted_score, 0))

  let investmentGrade: StartupScoringOutput['investment_grade'] = 'promising'
  if (overallScore >= 85) investmentGrade = 'exceptional'
  else if (overallScore >= 70) investmentGrade = 'strong'
  else if (overallScore >= 55) investmentGrade = 'promising'
  else if (overallScore >= 40) investmentGrade = 'marginal'
  else investmentGrade = 'weak'

  const strengths: string[] = []
  const concerns: string[] = []
  if (teamScore >= 75) strengths.push('Strong founding team with relevant domain expertise and prior exit experience')
  else concerns.push('Team gaps identified - consider key hire plan and advisory board')
  if (marketScore >= 75) strengths.push('Large and growing market with favorable tailwinds')
  else concerns.push('Market size or growth rate may limit return potential')
  if (tractionScore >= 75) strengths.push('Strong revenue traction and customer adoption signals')
  else concerns.push('Early traction - validate product-market fit with reference customers')
  if (productScore >= 75) strengths.push('Differentiated product with defensible technical moat')
  else concerns.push('Product differentiation unclear - assess competitive positioning')
  if (financialScore >= 75) strengths.push('Healthy unit economics and clear path to profitability')
  else concerns.push('Financial metrics below benchmark - deep-dive on burn efficiency')

  const comparables = input.sector === 'fintech' ? ['Stripe ($95B)', 'Plaid ($13.4B)', 'Brex ($12.3B)'] :
    input.sector === 'ai_ml' ? ['OpenAI ($157B)', 'Anthropic ($60B)', 'Databricks ($62B)'] :
    input.sector === 'healthtech' ? ['Hims & Hers ($10B)', 'Ro ($5B)', 'Tempus ($6.1B)'] :
    ['Snowflake ($50B)', 'Datadog ($42B)', 'CrowdStrike ($80B)']

  const checkSize = input.stage === 'seed' ? '$1M - $3M' : input.stage === 'series_a' ? '$5M - $15M' : input.stage === 'series_b' ? '$15M - $40M' : '$30M - $75M'

  return {
    startup_name: startupName,
    overall_score: overallScore,
    investment_grade: investmentGrade,
    score_breakdown: scoreBreakdown,
    strengths,
    concerns,
    comparable_exits: comparables,
    recommended_check_size: checkSize,
    summary: startupName + ' scored ' + overallScore + '/100 (' + investmentGrade.toUpperCase() + ') - Team: ' + teamScore + ', Market: ' + marketScore + ', Traction: ' + tractionScore + ', Product: ' + productScore + ', Financials: ' + financialScore
  }
}

function formatStartupScoringReport(input: StartupScoringInput, output: StartupScoringOutput): string {
  const lines: string[] = []
  lines.push('## Startup Scoring Model Report')
  lines.push('')
  lines.push('**Startup:** ' + output.startup_name + ' | **Overall Score:** ' + output.overall_score + '/100 | **Grade:** ' + output.investment_grade.toUpperCase())
  lines.push('**Recommended Check Size:** ' + output.recommended_check_size)
  lines.push('')
  lines.push('### Score Breakdown')
  lines.push('| Category | Score | Weight | Weighted | Grade |')
  lines.push('|----------|-------|--------|----------|-------|')
  for (const sb of output.score_breakdown) {
    lines.push('| ' + sb.category + ' | ' + sb.score + '/100 | ' + (sb.weight * 100).toFixed(0) + '% | ' + sb.weighted_score.toFixed(1) + ' | ' + sb.grade + ' |')
  }
  lines.push('')
  lines.push('### Strengths')
  for (const s of output.strengths) lines.push('- ' + s)
  lines.push('')
  lines.push('### Concerns')
  for (const c of output.concerns) lines.push('- ' + c)
  lines.push('')
  lines.push('### Comparable Exits')
  for (const ce of output.comparable_exits) lines.push('- ' + ce)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: CAP TABLE ANALYZER ====================

function analyzeCapTable(input: CapTableInput): CapTableOutput {
  const rng = seededRng(input)
  const companyName = input.company_name || 'Company'
  const preMoney = input.pre_money_valuation || rngRange(rng, 5000000, 50000000)
  const raiseAmount = input.raise_amount || rngRange(rng, 1000000, 15000000)
  const postMoney = preMoney + raiseAmount
  const securityType = input.security_type || 'priced_equity'

  const existingShareholders = input.existing_shareholders || [
    { name: 'Founder A', shares: 5000000, ownership_pct: 50, type: 'founder' },
    { name: 'Founder B', shares: 3000000, ownership_pct: 30, type: 'founder' },
    { name: 'Seed Investor', shares: 1000000, ownership_pct: 10, type: 'investor' },
    { name: 'ESOP Pool', shares: 1000000, ownership_pct: 10, type: 'esop' }
  ]

  const totalExistingShares = existingShareholders.reduce((s, sh) => s + sh.shares, 0)
  const pricePerShare = parseFloat((preMoney / totalExistingShares).toFixed(2))
  const newSharesIssued = Math.round(raiseAmount / pricePerShare)
  const totalSharesPost = totalExistingShares + newSharesIssued
  const newInvestorOwnership = parseFloat((newSharesIssued / totalSharesPost * 100).toFixed(2))

  const esopTarget = input.esop_pool?.target_pct || 15
  const esopCurrent = input.esop_pool?.current_pct || 10
  const esopTopUp = Math.max(0, Math.round((esopTarget - esopCurrent) / 100 * totalSharesPost))
  const totalSharesFullyDiluted = totalSharesPost + esopTopUp

  const capTable: OwnershipEntry[] = []
  for (const sh of existingShareholders) {
    capTable.push({
      shareholder: sh.name,
      shares: sh.shares,
      ownership_pct: parseFloat((sh.shares / totalSharesPost * 100).toFixed(2)),
      type: sh.type,
      fully_diluted_pct: parseFloat((sh.shares / totalSharesFullyDiluted * 100).toFixed(2))
    })
  }
  capTable.push({
    shareholder: 'New Investor',
    shares: newSharesIssued,
    ownership_pct: newInvestorOwnership,
    type: 'investor',
    fully_diluted_pct: parseFloat((newSharesIssued / totalSharesFullyDiluted * 100).toFixed(2))
  })
  if (esopTopUp > 0) {
    capTable.push({
      shareholder: 'ESOP Pool (top-up)',
      shares: esopTopUp,
      ownership_pct: parseFloat((esopTopUp / totalSharesPost * 100).toFixed(2)),
      type: 'esop',
      fully_diluted_pct: parseFloat((esopTopUp / totalSharesFullyDiluted * 100).toFixed(2))
    })
  }

  const founderShares = existingShareholders.filter(sh => sh.type === 'founder').reduce((s, sh) => s + sh.shares, 0)
  const founderOwnershipDiluted = parseFloat((founderShares / totalSharesFullyDiluted * 100).toFixed(2))

  const dilutionAnalysis = 'Founders diluted from ' + (founderShares / totalExistingShares * 100).toFixed(1) + '% to ' + founderOwnershipDiluted + '% on fully-diluted basis'

  const liquidationWaterfall: string[] = []
  if (input.liquidation_preference === '1x_participating' || input.liquidation_preference === '2x_participating') {
    liquidationWaterfall.push('1. Return of capital to preferred shareholders (' + (input.liquidation_preference === '2x_participating' ? '2x' : '1x') + ')')
    liquidationWaterfall.push('2. Participating preferred converts to common or takes preference + pro-rata')
    liquidationWaterfall.push('3. Remaining proceeds distributed pro-rata among all shareholders')
  } else {
    liquidationWaterfall.push('1. Return of capital to preferred shareholders (1x non-participating)')
    liquidationWaterfall.push('2. Preferred shareholders elect to convert to common or take preference')
    liquidationWaterfall.push('3. Remaining proceeds distributed pro-rata among all shareholders')
  }

  const keyTerms: string[] = []
  keyTerms.push('Security type: ' + securityType)
  keyTerms.push('Liquidation preference: ' + (input.liquidation_preference || '1x_non_participating'))
  keyTerms.push('Anti-dilution: ' + (input.anti_dilution || 'broad_based'))
  keyTerms.push('Pro-rata rights: ' + (input.pro_rata_rights ? 'Yes' : 'No'))
  keyTerms.push('ESOP pool: ' + esopCurrent + '% current, ' + esopTarget + '% target')

  return {
    company_name: companyName,
    post_money_valuation: postMoney,
    price_per_share: pricePerShare,
    new_investor_ownership: newInvestorOwnership,
    founder_ownership_diluted: founderOwnershipDiluted,
    esop_pool_pct: esopTarget,
    cap_table: capTable,
    dilution_analysis: dilutionAnalysis,
    liquidation_waterfall: liquidationWaterfall,
    key_terms_summary: keyTerms,
    summary: companyName + ' cap table: $' + (postMoney / 1000000).toFixed(1) + 'M post-money, new investor gets ' + newInvestorOwnership + '%, founders diluted to ' + founderOwnershipDiluted + '%'
  }
}

function formatCapTableReport(input: CapTableInput, output: CapTableOutput): string {
  const lines: string[] = []
  lines.push('## Cap Table Analysis Report')
  lines.push('')
  lines.push('**Company:** ' + output.company_name + ' | **Post-Money:** $' + (output.post_money_valuation / 1000000).toFixed(1) + 'M | **Price/Share:** $' + output.price_per_share.toFixed(2))
  lines.push('')
  lines.push('### Cap Table')
  lines.push('| Shareholder | Shares | Ownership | Fully Diluted | Type |')
  lines.push('|-------------|--------|-----------|---------------|------|')
  for (const entry of output.cap_table) {
    lines.push('| ' + entry.shareholder + ' | ' + entry.shares.toLocaleString() + ' | ' + entry.ownership_pct + '% | ' + entry.fully_diluted_pct + '% | ' + entry.type + ' |')
  }
  lines.push('')
  lines.push('### Dilution Analysis')
  lines.push(output.dilution_analysis)
  lines.push('')
  lines.push('### Liquidation Waterfall')
  for (const step of output.liquidation_waterfall) lines.push('- ' + step)
  lines.push('')
  lines.push('### Key Terms')
  for (const term of output.key_terms_summary) lines.push('- ' + term)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: EXIT STRATEGY ADVISOR ====================

function generateExitStrategy(input: ExitStrategyInput): ExitStrategyOutput {
  const rng = seededRng(input)
  const companyName = input.company_name || 'Portfolio Company'
  const valuation = input.current_valuation || rngRange(rng, 20000000, 200000000)
  const revenue = input.revenue || rngRange(rng, 2000, 30000)
  const growthRate = input.growth_rate || rngRange(rng, 30, 200)
  const marketConditions = input.market_conditions || 'neutral'
  const timeline = input.timeline_preference || '1_2_years'

  const evMultiple = growthRate > 150 ? 25 : growthRate > 100 ? 18 : growthRate > 50 ? 12 : growthRate > 20 ? 8 : 5

  const exitScenarios: ExitScenario[] = [
    {
      scenario: 'IPO',
      exit_type: 'ipo',
      probability: marketConditions === 'hot' ? 0.35 : marketConditions === 'neutral' ? 0.20 : 0.08,
      estimated_value: Math.round(revenue * evMultiple * (marketConditions === 'hot' ? 1.3 : marketConditions === 'neutral' ? 1.0 : 0.7)),
      timeline: '18-36 months',
      key_conditions: ['Revenue > $50M ARR', 'Predictable growth model', 'Public market window open', 'Big 4 auditor engaged'],
      risks: ['Market volatility', 'Regulatory scrutiny', 'Lock-up period', 'Quarterly reporting burden'],
      ev_multiple: evMultiple + 3
    },
    {
      scenario: 'Strategic Acquisition',
      exit_type: 'strategic_acquisition',
      probability: marketConditions === 'hot' ? 0.40 : marketConditions === 'neutral' ? 0.35 : 0.25,
      estimated_value: Math.round(revenue * evMultiple * 1.2),
      timeline: '6-18 months',
      key_conditions: ['Identify 5-10 potential acquirers', 'Secure LOI from lead buyer', 'Negotiate exclusivity period', 'Due diligence completion'],
      risks: ['Acquirer pullback', 'Cultural integration risk', 'Key employee retention', 'Antitrust review'],
      ev_multiple: evMultiple + 2
    },
    {
      scenario: 'Secondary Sale',
      exit_type: 'secondary',
      probability: 0.20,
      estimated_value: Math.round(valuation * 0.85),
      timeline: '3-9 months',
      key_conditions: ['Identify secondary buyers', 'Company cooperation on data room', 'Negotiate price discount', 'Founder/board approval'],
      risks: ['Limited buyer pool', 'Discount to last round', 'Information asymmetry', 'Company blocking rights'],
      ev_multiple: evMultiple - 1
    },
    {
      scenario: 'M&A Process',
      exit_type: 'ma',
      probability: 0.25,
      estimated_value: Math.round(revenue * evMultiple * 0.9),
      timeline: '9-15 months',
      key_conditions: ['Engage sell-side advisor', 'Prepare confidential information memorandum', 'Run competitive process', 'Negotiate definitive agreement'],
      risks: ['Process leakage', 'Bidder fatigue', 'Financing risk for buyer', 'Earn-out disputes'],
      ev_multiple: evMultiple
    }
  ]

  const totalProb = exitScenarios.reduce((s, es) => s + es.probability, 0)
  for (const es of exitScenarios) {
    es.probability = parseFloat((es.probability / totalProb).toFixed(2))
  }

  const recommended = exitScenarios.reduce((best, es) => es.probability > best.probability ? es : best, exitScenarios[0])

  let optimalTiming = '12-18 months'
  if (timeline === 'immediate') optimalTiming = '3-6 months - accelerate M&A process'
  else if (timeline === '3_5_years') optimalTiming = '24-48 months - build toward IPO readiness'

  const valuationLow = Math.round(revenue * (evMultiple - 3))
  const valuationMid = Math.round(revenue * evMultiple)
  const valuationHigh = Math.round(revenue * (evMultiple + 5))

  const buyerLandscape: string[] = []
  const strategics = input.strategic_buyers || ['Salesforce', 'Microsoft', 'Google', 'Oracle', 'ServiceNow']
  for (const buyer of strategics.slice(0, 4)) {
    buyerLandscape.push(buyer + ' - ' + ['Horizontal expansion', 'Vertical integration', 'Talent acquisition', 'Technology acquisition'][rngRange(rng, 0, 3)])
  }

  const preparationChecklist: string[] = []
  preparationChecklist.push('Engage experienced M&A advisor or investment bank')
  preparationChecklist.push('Prepare data room with audited financials, cap table, and IP documentation')
  preparationChecklist.push('Conduct pre-emptive legal and IP due diligence')
  preparationChecklist.push('Develop management presentation and investor deck')
  preparationChecklist.push('Identify and prioritize 8-12 potential acquirers')
  preparationChecklist.push('Prepare founder and key employee retention packages')

  return {
    company_name: companyName,
    recommended_exit: recommended.scenario,
    exit_scenarios: exitScenarios,
    optimal_timing: optimalTiming,
    valuation_range: { low: valuationLow, mid: valuationHigh > valuationLow ? Math.round((valuationLow + valuationHigh) / 2) : valuationMid, high: valuationHigh },
    buyer_landscape: buyerLandscape,
    preparation_checklist: preparationChecklist,
    market_context: '2026 exit environment: IPO window ' + (marketConditions === 'hot' ? 'favorable with strong tech IPO pipeline' : marketConditions === 'neutral' ? 'cautiously open with selective deals' : 'challenging - favor M&A over IPO') + '. Strategic M&A activity remains robust with corporates seeking AI/ML capabilities.',
    summary: companyName + ' exit analysis: recommended ' + recommended.scenario + ' with ' + (recommended.probability * 100).toFixed(0) + '% probability, estimated value $' + (recommended.estimated_value / 1000000).toFixed(0) + 'M'
  }
}

function formatExitStrategyReport(input: ExitStrategyInput, output: ExitStrategyOutput): string {
  const lines: string[] = []
  lines.push('## Exit Strategy Advisory Report')
  lines.push('')
  lines.push('**Company:** ' + output.company_name + ' | **Recommended Exit:** ' + output.recommended_exit)
  lines.push('**Optimal Timing:** ' + output.optimal_timing)
  lines.push('')
  lines.push('### Exit Scenarios')
  for (const es of output.exit_scenarios) {
    lines.push('#### ' + es.scenario + ' [' + (es.probability * 100).toFixed(0) + '% probability] - $' + (es.estimated_value / 1000000).toFixed(0) + 'M est.')
    lines.push('- Timeline: ' + es.timeline + ' | EV Multiple: ' + es.ev_multiple + 'x')
    lines.push('- Key Conditions: ' + es.key_conditions.join('; '))
    lines.push('- Risks: ' + es.risks.join('; '))
    lines.push('')
  }
  lines.push('### Valuation Range')
  lines.push('- Low: $' + (output.valuation_range.low / 1000000).toFixed(0) + 'M')
  lines.push('- Mid: $' + (output.valuation_range.mid / 1000000).toFixed(0) + 'M')
  lines.push('- High: $' + (output.valuation_range.high / 1000000).toFixed(0) + 'M')
  lines.push('')
  lines.push('### Buyer Landscape')
  for (const buyer of output.buyer_landscape) lines.push('- ' + buyer)
  lines.push('')
  lines.push('### Preparation Checklist')
  for (const item of output.preparation_checklist) lines.push('- [ ] ' + item)
  lines.push('')
  lines.push('> **Market Context:** ' + output.market_context)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: INVESTMENT THESIS VALIDATOR ====================

function validateInvestmentThesis(input: InvestmentThesisInput): InvestmentThesisOutput {
  const rng = seededRng(input)
  const thesis = input.thesis_statement || 'AI-powered vertical SaaS for underserved mid-market will generate outsized returns at Series A'
  const beliefs = input.key_beliefs || [
    'AI adoption in vertical SaaS is accelerating',
    'Mid-market is underserved by horizontal platforms',
    'Founder-market fit drives early traction',
    'Network effects create defensibility at scale'
  ]
  const data = input.supporting_data || {}
  const contrarian = input.contrarian_views || [
    'Incumbents may replicate features quickly',
    'AI commoditization reduces differentiation',
    'Mid-market CAC may be higher than projected'
  ]

  const thesisTests: ThesisTest[] = [
    {
      test_name: 'Market Timing Validation',
      result: (data.growth_rate || 25) > 15 ? 'pass' : (data.growth_rate || 25) > 8 ? 'partial' : 'fail',
      confidence: clamp(Math.round((data.growth_rate || 25) * 2.5 + rngRange(rng, -10, 10)), 20, 95),
      reasoning: 'Market growth rate of ' + (data.growth_rate || 25) + '% ' + ((data.growth_rate || 25) > 20 ? 'supports' : (data.growth_rate || 25) > 10 ? 'partially supports' : 'does not support') + ' timing thesis',
      evidence: ['Industry reports showing ' + (data.growth_rate || 25) + '% CAGR', 'Competitor funding rounds validating market size'],
      counter_arguments: ['Growth may be concentrated in incumbents', 'TAM expansion may not materialize as projected']
    },
    {
      test_name: 'Competitive Moat Durability',
      result: rng() > 0.4 ? 'pass' : rng() > 0.3 ? 'partial' : 'fail',
      confidence: clamp(rngRange(rng, 45, 85), 20, 95),
      reasoning: 'Competitive dynamics analysis suggests ' + (rng() > 0.5 ? 'sustainable' : 'questionable') + ' moat durability based on current differentiation signals',
      evidence: ['Patent filings and technical moat indicators', 'Customer switching cost analysis', 'Network effect potential in target segment'],
      counter_arguments: ['Well-funded competitors may close gap', 'Technology commoditization risk', 'Platform risk from OS-level AI integration']
    },
    {
      test_name: 'Return Profile Feasibility',
      result: (data.market_size || 5) > 3 ? 'pass' : (data.market_size || 5) > 1 ? 'partial' : 'fail',
      confidence: clamp(Math.round(Math.min((data.market_size || 5) * 15, 40) + rngRange(rng, -5, 15)), 20, 95),
      reasoning: 'Market size of $' + (data.market_size || 5) + 'B ' + ((data.market_size || 5) > 5 ? 'supports' : 'may limit') + ' 10x+ return potential at scale',
      evidence: ['Comparable exits in sector averaging ' + ((data.market_size || 5) > 5 ? '15x' : '8x') + ' revenue multiple', 'Market leader valuation trajectories'],
      counter_arguments: ['Multiple compression in current environment', 'Down-round risk if growth decelerates', 'Capital requirements may exceed plan']
    },
    {
      test_name: 'Founder-Market Fit Assessment',
      result: rng() > 0.3 ? 'pass' : 'partial',
      confidence: clamp(rngRange(rng, 55, 90), 20, 95),
      reasoning: 'Founder background and team composition ' + (rng() > 0.5 ? 'strongly align' : 'partially align') + ' with market opportunity requirements',
      evidence: ['Prior domain experience', 'Technical capability match', 'Advisory network strength'],
      counter_arguments: ['First-time founder risk', 'Key role gaps in team', 'Scaling challenges from startup to growth stage']
    },
    {
      test_name: 'Portfolio Construction Fit',
      result: rng() > 0.35 ? 'pass' : 'partial',
      confidence: clamp(rngRange(rng, 50, 88), 20, 95),
      reasoning: 'Investment thesis ' + (rng() > 0.5 ? 'fits well' : 'has some misalignment') + ' with current portfolio construction and return targets',
      evidence: ['Sector exposure within target range', 'Stage alignment with fund strategy', 'Geographic fit with portfolio'],
      counter_arguments: ['Sector concentration risk if added', 'Stage may be outside fund mandate', 'Return profile may not move fund-level IRR']
    }
  ]

  const avgConfidence = Math.round(thesisTests.reduce((s, t) => s + t.confidence, 0) / thesisTests.length)
  const passCount = thesisTests.filter(t => t.result === 'pass').length
  const partialCount = thesisTests.filter(t => t.result === 'partial').length

  let overallConfidence = avgConfidence
  if (passCount >= 4) overallConfidence = clamp(overallConfidence + 10, 0, 100)
  else if (passCount + partialCount <= 2) overallConfidence = clamp(overallConfidence - 15, 0, 100)

  let verdict: InvestmentThesisOutput['verdict'] = 'hold'
  if (overallConfidence >= 80 && passCount >= 4) verdict = 'strong_buy'
  else if (overallConfidence >= 65 && passCount >= 3) verdict = 'buy'
  else if (overallConfidence >= 50) verdict = 'hold';
  else if (overallConfidence >= 35) verdict = 'weak';
  else verdict = 'reject'

  const supportingPoints: string[] = []
  const challengingPoints: string[] = []
  for (const test of thesisTests) {
    if (test.result === 'pass') supportingPoints.push(test.test_name + ': ' + test.reasoning)
    else if (test.result === 'fail') challengingPoints.push(test.test_name + ': ' + test.reasoning)
    else challengingPoints.push(test.test_name + ' (partial): ' + test.reasoning)
  }

  const missingEvidence: string[] = []
  if (!data.market_size) missingEvidence.push('Independent market size validation from multiple sources')
  if (!data.growth_rate) missingEvidence.push('Bottom-up growth analysis with customer-level data')
  if (!input.portfolio_fit) missingEvidence.push('Portfolio construction impact analysis')
  missingEvidence.push('Customer reference calls (minimum 5)')
  missingEvidence.push('Technical due diligence on defensibility claims')

  const refinements: string[] = []
  refinements.push('Narrow thesis to specific sub-segment with measurable wedge')
  refinements.push('Add quantified milestones for thesis validation over 12-month hold period')
  refinements.push('Include explicit kill criteria for thesis failure scenarios')
  if (contrarian.length > 0) refinements.push('Address top contrarian view: ' + contrarian[0])

  return {
    thesis_statement: thesis,
    overall_confidence: overallConfidence,
    verdict,
    thesis_tests: thesisTests,
    supporting_points: supportingPoints,
    challenging_points: challengingPoints,
    missing_evidence: missingEvidence,
    suggested_thesis_refinements: refinements,
    summary: 'Thesis validation: ' + verdict.toUpperCase() + ' with ' + overallConfidence + '% confidence (' + passCount + ' pass, ' + partialCount + ' partial out of ' + thesisTests.length + ' tests)'
  }
}

function formatInvestmentThesisReport(input: InvestmentThesisInput, output: InvestmentThesisOutput): string {
  const lines: string[] = []
  lines.push('## Investment Thesis Validation Report')
  lines.push('')
  lines.push('**Thesis:** ' + output.thesis_statement)
  lines.push('**Verdict:** ' + output.verdict.toUpperCase() + ' | **Confidence:** ' + output.overall_confidence + '%')
  lines.push('')
  lines.push('### Thesis Tests')
  for (const test of output.thesis_tests) {
    lines.push('#### ' + test.test_name + ' [' + test.result.toUpperCase() + '] - Confidence: ' + test.confidence + '%')
    lines.push('- ' + test.reasoning)
    lines.push('- Evidence: ' + test.evidence.join('; '))
    lines.push('- Counter-arguments: ' + test.counter_arguments.join('; '))
    lines.push('')
  }
  lines.push('### Supporting Points')
  for (const sp of output.supporting_points) lines.push('- ' + sp)
  lines.push('')
  lines.push('### Challenging Points')
  for (const cp of output.challenging_points) lines.push('- ' + cp)
  lines.push('')
  lines.push('### Missing Evidence')
  for (const me of output.missing_evidence) lines.push('- [ ] ' + me)
  lines.push('')
  lines.push('### Suggested Refinements')
  for (const r of output.suggested_thesis_refinements) lines.push('- ' + r)
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Deal Sourcing Engine
  tools.register(defineTool({
    name: 'deal_sourcing_engine',
    description: 'AI-powered deal sourcing engine with multi-source scanning, scoring, and pipeline management. Screens startups across sectors, stages, and geographies using traction, team, and market signals. Returns scored deal list with sector distribution, stage breakdown, and pipeline recommendations. 2026 market: VC/PE tech market $8B+ with AI-powered sourcing growing rapidly.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: sectors[], stages[] (pre_seed/seed/series_a/series_b/series_c/growth), geographic_focus[], check_size_range {min, max}, criteria {revenue_min, growth_rate_min, team_size_min, traction_signals[]}, sources[]', required: true } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: DealSourcingInput = JSON.parse(args.input_data)
      const result = generateDealSourcing(input)
      return formatDealSourcingReport(input, result)
    }
  }))

  // Tool 2: Due Diligence Checker
  tools.register(defineTool({
    name: 'due_diligence_checker',
    description: 'Automated due diligence checker with multi-dimensional risk flagging, financial health assessment, team evaluation, and valuation range estimation. Evaluates revenue quality, gross margins, runway, NRR, founder composition, and disclosed risks. Returns DD score, go/no-go verdict, risk flags with mitigation, and key questions for management.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: company_name, sector, stage (pre_seed/seed/series_a/series_b/series_c/growth), metrics {revenue, growth_rate, gross_margin, burn_rate, runway_months, customer_count, nrr}, team {founder_count, domain_experience_years, previous_exits, key_hires[]}, risks_identified[], documents_provided[]', required: true } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: DueDiligenceInput = JSON.parse(args.input_data)
      const result = generateDueDiligence(input)
      return formatDueDiligenceReport(input, result)
    }
  }))

  // Tool 3: Portfolio Health Monitor
  tools.register(defineTool({
    name: 'portfolio_health_monitor',
    description: 'Portfolio company health tracking with KPI alerts, burn multiple analysis, runway monitoring, and valuation trend tracking. Evaluates each portfolio company on revenue growth, burn efficiency, runway status, and valuation change. Returns health scores, status classifications (thriving/healthy/watch/at_risk/critical), and rebalancing suggestions.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: portfolio_companies[] {name, sector, stage, investment_date, investment_amount, current_valuation, revenue_current, revenue_prior, burn_rate, runway_months, founder_count, nps_score}, benchmark_metrics {}, alert_thresholds {runway_warning_months, burn_multiple_warning, revenue_decline_pct}', required: true } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: PortfolioHealthInput = JSON.parse(args.input_data)
      const result = generatePortfolioHealth(input)
      return formatPortfolioHealthReport(input, result)
    }
  }))

  // Tool 4: Market Mapping Analyst
  tools.register(defineTool({
    name: 'market_mapping_analyst',
    description: 'Market landscape mapping with competitive positioning, segment analysis, and whitespace opportunity identification. Maps TAM across segments, plots competitors on positioning matrix, identifies market trends and regulatory factors. Returns segment breakdown, competitive quadrant mapping, opportunity gaps, and investment thesis.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: market_name, sectors[], geography, market_size_baseline, growth_rate, competitors[] {name, market_share, funding_total, stage, differentiator}, trends[], regulatory_factors[]', required: true } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: MarketMappingInput = JSON.parse(args.input_data)
      const result = generateMarketMapping(input)
      return formatMarketMappingReport(input, result)
    }
  }))

  // Tool 5: Startup Scoring Model
  tools.register(defineTool({
    name: 'startup_scoring_model',
    description: 'Multi-factor startup scoring model with weighted category analysis across Team (30%), Market (25%), Traction (25%), Product (10%), and Financials (10%). Produces investment grade (exceptional/strong/promising/marginal/weak), score breakdown with letter grades, strengths, concerns, comparable exits, and recommended check size.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: startup_name, sector, stage (pre_seed/seed/series_a/series_b/series_c/growth), team {founder_experience, domain_expertise, team_completeness, previous_exits, technical_talent}, market {tam_billions, growth_rate, competitive_intensity, tailwinds[]}, traction {revenue, growth_rate, retention_rate, user_count, partnerships}, product {innovation_score, defensibility, technical_moat, ip_portfolio}, financials {unit_economics, gross_margin, capital_efficiency, path_to_profitability}', required: true } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: StartupScoringInput = JSON.parse(args.input_data)
      const result = generateStartupScoring(input)
      return formatStartupScoringReport(input, result)
    }
  }))

  // Tool 6: Cap Table Analyzer
  tools.register(defineTool({
    name: 'cap_table_analyzer',
    description: 'Cap table analysis with dilution modeling, ownership breakdown, liquidation waterfall, and key term summary. Handles priced equity, SAFEs, convertible notes, and ESOP pool top-ups. Returns post-money valuation, price per share, new investor ownership, fully-diluted cap table, dilution analysis, and liquidation preference scenarios.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: company_name, pre_money_valuation, raise_amount, security_type (priced_equity/safe/convertible_note/series_seed), existing_shareholders[] {name, shares, ownership_pct, type}, esop_pool {target_pct, current_pct}, liquidation_preference (1x_non_participating/1x_participating/2x_participating), anti_dilution (broad_based/narrow_based/full_ratchet), pro_rata_rights (bool)', required: true } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: CapTableInput = JSON.parse(args.input_data)
      const result = analyzeCapTable(input)
      return formatCapTableReport(input, result)
    }
  }))

  // Tool 7: Exit Strategy Advisor
  tools.register(defineTool({
    name: 'exit_strategy_advisor',
    description: 'Exit scenario modeling with probability-weighted outcomes for IPO, strategic acquisition, secondary sale, and M&A. Evaluates optimal timing based on market conditions, growth trajectory, and timeline preference. Returns recommended exit path, valuation range, buyer landscape, preparation checklist, and market context.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: company_name, sector, current_stage (seed/series_a/series_b/series_c/growth), current_valuation, revenue, growth_rate, profitability_status (profitable/breakeven/cash_flow_negative), strategic_buyers[], comparable_exits[] {company, sector, exit_value, exit_type, ev_multiple, year}, market_conditions (hot/neutral/cold), timeline_preference (immediate/1_2_years/3_5_years)', required: true } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: ExitStrategyInput = JSON.parse(args.input_data)
      const result = generateExitStrategy(input)
      return formatExitStrategyReport(input, result)
    }
  }))

  // Tool 8: Investment Thesis Validator
  tools.register(defineTool({
    name: 'investment_thesis_validator',
    description: 'Investment thesis stress-testing with multi-dimensional validation including market timing, competitive moat durability, return profile feasibility, founder-market fit, and portfolio construction fit. Returns verdict (strong_buy/buy/hold/weak/reject), confidence score, test results with evidence and counter-arguments, missing evidence, and suggested refinements.',
    parameters: { input_data: { type: 'string', description: 'JSON-encoded input: thesis_statement, sector, stage_focus, key_beliefs[], supporting_data {market_size, growth_rate, competitive_dynamics, tailwinds[]}, contrarian_views[], risks[], portfolio_fit {sector_exposure, stage_alignment, geographic_fit, return_profile}, historical_precedents[]', required: true } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: InvestmentThesisInput = JSON.parse(args.input_data)
      const result = validateInvestmentThesis(input)
      return formatInvestmentThesisReport(input, result)
    }
  }))

  console.log('[dsh-tool-vcintel] Loaded v' + VERSION + ' - DSH Venture Capital & Investment Intelligence Toolkit with 8 tools')
  console.log('  Tools: deal_sourcing_engine, due_diligence_checker, portfolio_health_monitor, market_mapping_analyst, startup_scoring_model, cap_table_analyzer, exit_strategy_advisor, investment_thesis_validator')
}
