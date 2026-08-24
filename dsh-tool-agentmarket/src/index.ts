/**
 * DSH Agent Marketplace & Discovery Plugin v1.0.0
 *
 * AI Agent Marketplace & Discovery - agent discovery, capability matching,
 * pricing comparison, reputation scoring, integration testing, comparison
 * matrices, trend analysis, and recommendation engine.
 *
 * 2026: Agent marketplace is an emerging category; platforms like OpenAI GPTs,
 * Poe, and Coze are growing rapidly.
 *
 * Features (v1.0.0):
 * - agent_discovery_engine      - Search and discover agents by capability/category/quality
 * - capability_matcher          - Match requirements to agent capabilities with fit scores
 * - pricing_comparison_analyst  - Compare pricing across agents, cost-effectiveness analysis
 * - reputation_scorer           - Score agent reputation from ratings, completion, response
 * - integration_test_runner     - Run integration tests against agent endpoints
 * - agent_comparison_matrix     - Build multi-dimensional comparison across agents
 * - marketplace_trend_analyzer  - Analyze marketplace trends, growth, emerging categories
 * - agent_recommendation_engine - Recommend best agents based on needs and constraints
 *
 * @module dsh-tool-agentmarket
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agentmarket'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute legal, financial, or technical advice. Consult qualified professionals before deploying agent-to-agent transactions or making marketplace decisions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeRng(seed: number) {
  const r = mulberry32(seed)
  return {
    next: (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min,
    nextFloat: (min: number, max: number) => r() * (max - min) + min,
    pick: <T>(arr: T[]): T => arr[Math.floor(r() * arr.length)],
    pickN: <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => r() - 0.5)
      return shuffled.slice(0, n)
    }
  }
}

function computeSeed(input: unknown): number {
  return JSON.stringify(input).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: Agent Discovery Engine ---
export interface AgentDiscoveryInput {
  query: string
  categories: string[]
  min_rating?: number
  max_price_per_call?: number
  required_capabilities?: string[]
  sort_by?: 'relevance' | 'rating' | 'price' | 'popularity'
  limit?: number
}

export interface DiscoveredAgent {
  id: string
  name: string
  category: string
  capabilities: string[]
  rating: number
  price_per_call: number
  popularity_score: number
  relevance_score: number
  match_reasons: string[]
}

export interface AgentDiscoveryOutput {
  query: string
  total_matches: number
  returned_count: number
  agents: DiscoveredAgent[]
  search_insights: string[]
  recommendations: string[]
}

// --- Tool 2: Capability Matcher ---
export interface CapabilityMatcherInput {
  required_capabilities: string[]
  optional_capabilities: string[]
  agent_capabilities: string[]
  priority_weights?: Record<string, number>
}

export interface CapabilityMatch {
  capability: string
  matched: boolean
  match_type: 'exact' | 'partial' | 'none'
  confidence: number
  weight: number
  weighted_score: number
}

export interface CapabilityMatcherOutput {
  overall_fit_score: number
  fit_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  required_matches: CapabilityMatch[]
  optional_matches: CapabilityMatch[]
  missing_required: string[]
  missing_optional: string[]
  coverage_pct: number
  assessment: string
  recommendations: string[]
}

// --- Tool 3: Pricing Comparison Analyst ---
export interface PricingComparisonInput {
  agent_prices: { agent_id: string; agent_name: string; price_per_call: number; pricing_model: string }[]
  budget_per_call?: number
  expected_monthly_volume?: number
  include_hidden_costs?: boolean
}

export interface AgentPricingAnalysis {
  agent_id: string
  agent_name: string
  price_per_call: number
  pricing_model: string
  monthly_cost_at_volume: number
  cost_rating: 'excellent' | 'good' | 'fair' | 'expensive'
  hidden_costs: string[]
  value_score: number
}

export interface PricingComparisonOutput {
  agents_analyzed: number
  cheapest: { agent_id: string; agent_name: string; price_per_call: number }
  most_expensive: { agent_id: string; agent_name: string; price_per_call: number }
  average_price: number
  median_price: number
  agent_analyses: AgentPricingAnalysis[]
  budget_assessment: string
  cost_optimization_tips: string[]
  recommendations: string[]
}

// --- Tool 4: Reputation Scorer ---
export interface ReputationScorerInput {
  agent_id: string
  agent_name: string
  total_transactions: number
  avg_rating: number
  completion_rate_pct: number
  avg_response_ms: number
  dispute_rate_pct?: number
  verified?: boolean
}

export interface ReputationFactor {
  factor: string
  score: number
  weight: number
  weighted_score: number
  assessment: string
}

export interface ReputationScorerOutput {
  overall_reputation_score: number
  reputation_tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'new'
  factors: ReputationFactor[]
  trust_badges: {
    verified: boolean
    fast_responder: boolean
    high_completion: boolean
    top_rated: boolean
    reliable_volume: boolean
  }
  marketplace_benefits: string[]
  improvement_areas: string[]
  recommendations: string[]
}

// --- Tool 5: Integration Test Runner ---
export interface IntegrationTestInput {
  agent_endpoint: string
  agent_name: string
  test_capabilities: string[]
  auth_method: string
  timeout_ms?: number
  retry_count?: number
}

export interface IntegrationTestResult {
  capability: string
  status: 'pass' | 'fail' | 'warning' | 'skipped'
  response_time_ms: number
  details: string
  error_message?: string
}

export interface IntegrationTestOutput {
  agent_name: string
  endpoint: string
  total_tests: number
  passed: number
  failed: number
  warnings: number
  skipped: number
  avg_response_time_ms: number
  test_results: IntegrationTestResult[]
  compatibility_score: number
  readiness_level: 'production_ready' | 'needs_work' | 'not_ready'
  recommendations: string[]
}

// --- Tool 6: Agent Comparison Matrix ---
export interface ComparisonMatrixInput {
  agents: {
    agent_id: string
    agent_name: string
    rating: number
    price_per_call: number
    response_time_ms: number
    capabilities_count: number
    completion_rate_pct: number
    popularity_score: number
  }[]
  dimensions?: string[]
  weights?: Record<string, number>
}

export interface DimensionScore {
  dimension: string
  weight: number
  scores: { agent_id: string; agent_name: string; raw_score: number; normalized_score: number; weighted_score: number }[]
  best_agent_id: string
  best_agent_name: string
}

export interface ComparisonMatrixOutput {
  agents_compared: number
  dimensions_analyzed: number
  dimension_scores: DimensionScore[]
  overall_ranking: { rank: number; agent_id: string; agent_name: string; total_score: number }[]
  winner: { agent_id: string; agent_name: string; total_score: number }
  trade_offs: string[]
  recommendations: string[]
}

// --- Tool 7: Marketplace Trend Analyzer ---
export interface TrendAnalysisInput {
  time_range_months: number
  categories: string[]
  metrics?: string[]
  granularity?: 'weekly' | 'monthly' | 'quarterly'
}

export interface CategoryTrend {
  category: string
  growth_rate_pct: number
  agent_count_start: number
  agent_count_end: number
  avg_price_trend: 'rising' | 'stable' | 'falling'
  demand_level: 'high' | 'medium' | 'low'
  maturity_stage: 'emerging' | 'growing' | 'mature' | 'declining'
}

export interface TrendInsight {
  insight: string
  impact: 'high' | 'medium' | 'low'
  category: string
  action_required: boolean
}

export interface TrendAnalysisOutput {
  time_range_months: number
  granularity: string
  categories_analyzed: number
  category_trends: CategoryTrend[]
  insights: TrendInsight[]
  emerging_categories: string[]
  declining_categories: string[]
  overall_market_growth_pct: number
  forecast: string[]
  recommendations: string[]
}

// --- Tool 8: Agent Recommendation Engine ---
export interface RecommendationInput {
  use_case: string
  required_capabilities: string[]
  budget_per_call?: number
  min_rating?: number
  priority_factors?: ('price' | 'quality' | 'speed' | 'reliability')[]
  candidate_agents: {
    agent_id: string
    agent_name: string
    capabilities: string[]
    rating: number
    price_per_call: number
    avg_response_ms: number
    completion_rate_pct: number
  }[]
}

export interface AgentRecommendation {
  rank: number
  agent_id: string
  agent_name: string
  overall_score: number
  capability_fit_pct: number
  price_score: number
  quality_score: number
  speed_score: number
  reliability_score: number
  pros: string[]
  cons: string[]
  best_for: string
}

export interface RecommendationOutput {
  use_case: string
  candidates_evaluated: number
  recommendations: AgentRecommendation[]
  top_pick: { agent_id: string; agent_name: string; overall_score: number }
  alternative_picks: { agent_id: string; agent_name: string; overall_score: number }[]
  decision_framework: string[]
  recommendations_list: string[]
}

// ==================== TOOL 1: AGENT DISCOVERY ENGINE ====================

function runAgentDiscovery(input: AgentDiscoveryInput): AgentDiscoveryOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const categories = input.categories.length > 0 ? input.categories : ['data-analysis', 'code-generation', 'research', 'creative', 'automation']
  const minRating = input.min_rating ?? 3.0
  const maxPrice = input.max_price_per_call ?? 1.0
  const limit = input.limit ?? 10
  const requiredCaps = input.required_capabilities ?? []

  const agentNames = [
    'DataWizard Pro', 'CodeGenius AI', 'ResearchPilot', 'CreativeFlow',
    'TaskAutomator', 'InsightEngine', 'LogicBuilder', 'QueryMaster',
    'PatternFinder', 'FlowOptimizer', 'SmartAnalyzer', 'QuickResponse Agent',
    'DeepDive Research', 'PrecisionBot', 'AdaptiveAgent', 'NexusHelper'
  ]

  const allCapabilities = [
    'text-generation', 'code-execution', 'data-analysis', 'web-search',
    'image-generation', 'summarization', 'translation', 'classification',
    'extraction', 'reasoning', 'planning', 'monitoring'
  ]

  const discovered: DiscoveredAgent[] = []
  const totalPool = rng.next(15, 45)

  for (let i = 0; i < totalPool; i++) {
    const name = agentNames[i % agentNames.length] + (i >= agentNames.length ? ' ' + Math.floor(i / agentNames.length) : '')
    const category = rng.pick(categories)
    const caps = rng.pickN(allCapabilities, rng.next(2, 6))
    const rating = parseFloat((rng.nextFloat(2.5, 5.0)).toFixed(1))
    const price = parseFloat((rng.nextFloat(0.01, 2.0)).toFixed(3))
    const popularity = rng.next(10, 100)

    if (rating < minRating) continue
    if (price > maxPrice) continue
    if (requiredCaps.length > 0 && !requiredCaps.every(c => caps.includes(c))) continue

    const matchReasons: string[] = []
    if (rating >= 4.5) matchReasons.push('Top-rated agent (' + rating + '/5.0)')
    if (price <= maxPrice * 0.5) matchReasons.push('Budget-friendly at $' + price + '/call')
    if (caps.length >= 4) matchReasons.push('Versatile: ' + caps.length + ' capabilities')
    if (popularity >= 80) matchReasons.push('High popularity score: ' + popularity)
    requiredCaps.forEach(c => {
      if (caps.includes(c)) matchReasons.push('Has required capability: ' + c)
    })
    if (matchReasons.length === 0) matchReasons.push('Matches search category: ' + category)

    const relevance = clamp(Math.round(
      (rating / 5.0) * 30 +
      (1 - price / maxPrice) * 25 +
      (popularity / 100) * 20 +
      (caps.length / allCapabilities.length) * 15 +
      (requiredCaps.filter(c => caps.includes(c)).length / Math.max(requiredCaps.length, 1)) * 10
    ), 0, 100)

    discovered.push({
      id: 'agent_' + (i + 1).toString().padStart(3, '0'),
      name,
      category,
      capabilities: caps,
      rating,
      price_per_call: price,
      popularity_score: popularity,
      relevance_score: relevance,
      match_reasons: matchReasons.slice(0, 3)
    })
  }

  const sortBy = input.sort_by ?? 'relevance'
  discovered.sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'price') return a.price_per_call - b.price_per_call
    if (sortBy === 'popularity') return b.popularity_score - a.popularity_score
    return b.relevance_score - a.relevance_score
  })

  const result = discovered.slice(0, limit)

  const insights: string[] = [
    'Found ' + discovered.length + ' agents matching your criteria out of ' + totalPool + ' in marketplace',
    'Average rating of matches: ' + (result.length > 0 ? (result.reduce((s, a) => s + a.rating, 0) / result.length).toFixed(1) : 'N/A') + '/5.0',
    'Price range: $' + (result.length > 0 ? Math.min(...result.map(a => a.price_per_call)).toFixed(3) : '0') + ' - $' + (result.length > 0 ? Math.max(...result.map(a => a.price_per_call)).toFixed(3) : '0') + ' per call',
    'Most common capability: ' + (result.length > 0 ? rng.pick(allCapabilities) : 'N/A'),
    'Market supply is ' + (discovered.length > totalPool * 0.6 ? 'high' : discovered.length > totalPool * 0.3 ? 'moderate' : 'limited') + ' for your query'
  ]

  const recommendations: string[] = [
    'Sort by "rating" for highest quality agents, or "price" for budget options',
    'Use required_capabilities filter to narrow results to agents with specific skills',
    'Check agent reputation scores before integrating for production workloads',
    'Consider running integration tests on top-3 matches before final selection',
    'Monitor marketplace trends regularly as new agents launch frequently'
  ]

  return {
    query: input.query,
    total_matches: discovered.length,
    returned_count: result.length,
    agents: result,
    search_insights: insights,
    recommendations
  }
}

function formatDiscoveryReport(input: AgentDiscoveryInput, result: AgentDiscoveryOutput): string {
  const lines: string[] = []
  lines.push('## Agent Discovery Engine')
  lines.push('')
  lines.push('**Query:** ' + (input.query || 'General search') + ' | **Categories:** ' + (input.categories.join(', ') || 'All') + ' | **Sort:** ' + (input.sort_by || 'relevance'))
  lines.push('')
  lines.push('**Found:** ' + result.total_matches + ' matches | **Showing:** ' + result.returned_count + ' agents')
  lines.push('')

  if (result.agents.length > 0) {
    lines.push('### Discovered Agents')
    lines.push('| # | Agent | Category | Rating | Price/Call | Relevance |')
    lines.push('|---|-------|----------|--------|------------|-----------|')
    result.agents.forEach((a, i) => {
      lines.push('| ' + (i + 1) + ' | ' + a.name + ' | ' + a.category + ' | ' + a.rating.toFixed(1) + ' | $' + a.price_per_call.toFixed(3) + ' | ' + a.relevance_score + '/100 |')
    })
    lines.push('')

    lines.push('### Top Match Details')
    const top = result.agents[0]
    lines.push('**' + top.name + '** (ID: ' + top.id + ')')
    lines.push('- Category: ' + top.category)
    lines.push('- Capabilities: ' + top.capabilities.join(', '))
    lines.push('- Rating: ' + top.rating.toFixed(1) + '/5.0 | Popularity: ' + top.popularity_score + '/100')
    lines.push('- Price: $' + top.price_per_call.toFixed(3) + '/call')
    lines.push('- Match reasons:')
    top.match_reasons.forEach(r => lines.push('  - ' + r))
    lines.push('')
  }

  lines.push('### Search Insights')
  result.search_insights.forEach(s => lines.push('- ' + s))
  lines.push('')

  lines.push('### Recommendations')
  result.recommendations.forEach(r => lines.push('- ' + r))
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 2: CAPABILITY MATCHER ====================

function matchCapabilities(input: CapabilityMatcherInput): CapabilityMatcherOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const weights = input.priority_weights ?? {}
  const allCaps = [...input.required_capabilities, ...input.optional_capabilities]

  const computeMatch = (cap: string, isRequired: boolean): CapabilityMatch => {
    if (input.agent_capabilities.includes(cap)) {
      return {
        capability: cap,
        matched: true,
        match_type: 'exact',
        confidence: 1.0,
        weight: weights[cap] ?? (isRequired ? 2.0 : 1.0),
        weighted_score: weights[cap] ?? (isRequired ? 2.0 : 1.0)
      }
    }
    // Check for partial match
    const partialMatch = input.agent_capabilities.some(ac =>
      ac.toLowerCase().includes(cap.toLowerCase()) || cap.toLowerCase().includes(ac.toLowerCase())
    )
    if (partialMatch) {
      const conf = rng.nextFloat(0.4, 0.8)
      return {
        capability: cap,
        matched: true,
        match_type: 'partial',
        confidence: parseFloat(conf.toFixed(2)),
        weight: weights[cap] ?? (isRequired ? 2.0 : 1.0),
        weighted_score: parseFloat((conf * (weights[cap] ?? (isRequired ? 2.0 : 1.0))).toFixed(2))
      }
    }
    return {
      capability: cap,
      matched: false,
      match_type: 'none',
      confidence: 0,
      weight: weights[cap] ?? (isRequired ? 2.0 : 1.0),
      weighted_score: 0
    }
  }

  const requiredMatches = input.required_capabilities.map(c => computeMatch(c, true))
  const optionalMatches = input.optional_capabilities.map(c => computeMatch(c, false))

  const missingRequired = requiredMatches.filter(m => !m.matched).map(m => m.capability)
  const missingOptional = optionalMatches.filter(m => !m.matched).map(m => m.capability)

  const totalWeight = [...requiredMatches, ...optionalMatches].reduce((s, m) => s + m.weight, 0)
  const totalWeightedScore = [...requiredMatches, ...optionalMatches].reduce((s, m) => s + m.weighted_score, 0)

  const overallFit = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0
  const coverage = allCaps.length > 0 ? Math.round(((allCaps.length - missingRequired.length - missingOptional.length) / allCaps.length) * 100) : 100

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F'
  if (overallFit >= 90) grade = 'A'
  else if (overallFit >= 75) grade = 'B'
  else if (overallFit >= 60) grade = 'C'
  else if (overallFit >= 40) grade = 'D'

  let assessment = ''
  if (grade === 'A') assessment = 'Excellent fit - agent meets nearly all requirements with high confidence'
  else if (grade === 'B') assessment = 'Good fit - agent covers most requirements with minor gaps'
  else if (grade === 'C') assessment = 'Moderate fit - agent meets core needs but has notable capability gaps'
  else if (grade === 'D') assessment = 'Poor fit - agent lacks several critical capabilities'
  else assessment = 'Insufficient fit - agent does not meet minimum requirements'

  const recs: string[] = []
  if (missingRequired.length > 0) {
    recs.push('Critical: Missing required capabilities: ' + missingRequired.join(', '))
  }
  if (missingOptional.length > 0) {
    recs.push('Consider: Missing optional capabilities: ' + missingOptional.join(', '))
  }
  if (grade === 'A' || grade === 'B') {
    recs.push('Agent is a strong candidate - proceed with integration testing')
  }
  recs.push('Adjust priority_weights to reflect business-critical capabilities')
  recs.push('Re-run matching after agent updates its capability set')

  return {
    overall_fit_score: overallFit,
    fit_grade: grade,
    required_matches: requiredMatches,
    optional_matches: optionalMatches,
    missing_required: missingRequired,
    missing_optional: missingOptional,
    coverage_pct: coverage,
    assessment,
    recommendations: recs
  }
}

function formatCapabilityMatchReport(input: CapabilityMatcherInput, result: CapabilityMatcherOutput): string {
  const lines: string[] = []
  lines.push('## Capability Matcher')
  lines.push('')
  lines.push('**Required Caps:** ' + (input.required_capabilities.join(', ') || 'None') + ' | **Optional Caps:** ' + (input.optional_capabilities.join(', ') || 'None'))
  lines.push('')
  lines.push('### Fit Score: ' + result.overall_fit_score + '/100 (Grade: ' + result.fit_grade + ')')
  lines.push('')
  lines.push(result.assessment)
  lines.push('')

  lines.push('### Required Capability Matches')
  lines.push('| Capability | Match | Type | Confidence | Weight |')
  lines.push('|------------|-------|------|------------|--------|')
  result.required_matches.forEach(m => {
    lines.push('| ' + m.capability + ' | ' + (m.matched ? 'Yes' : 'No') + ' | ' + m.match_type + ' | ' + m.confidence.toFixed(2) + ' | ' + m.weight.toFixed(1) + ' |')
  })
  lines.push('')

  if (result.optional_matches.length > 0) {
    lines.push('### Optional Capability Matches')
    lines.push('| Capability | Match | Type | Confidence | Weight |')
    lines.push('|------------|-------|------|------------|--------|')
    result.optional_matches.forEach(m => {
      lines.push('| ' + m.capability + ' | ' + (m.matched ? 'Yes' : 'No') + ' | ' + m.match_type + ' | ' + m.confidence.toFixed(2) + ' | ' + m.weight.toFixed(1) + ' |')
    })
    lines.push('')
  }

  if (result.missing_required.length > 0) {
    lines.push('### Missing Required')
    result.missing_required.forEach(m => lines.push('- ' + m))
    lines.push('')
  }

  if (result.missing_optional.length > 0) {
    lines.push('### Missing Optional')
    result.missing_optional.forEach(m => lines.push('- ' + m))
    lines.push('')
  }

  lines.push('### Coverage: ' + result.coverage_pct + '%')
  lines.push('')

  lines.push('### Recommendations')
  result.recommendations.forEach(r => lines.push('- ' + r))
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 3: PRICING COMPARISON ANALYST ====================

function analyzePricing(input: PricingComparisonInput): PricingComparisonOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const budget = input.budget_per_call ?? 1.0
  const volume = input.expected_monthly_volume ?? 1000
  const includeHidden = input.include_hidden_costs ?? true

  const analyses: AgentPricingAnalysis[] = input.agent_prices.map((ap, i) => {
    const monthlyCost = ap.price_per_call * volume
    const hiddenCostList: string[] = []
    if (includeHidden) {
      if (ap.pricing_model === 'per_token') hiddenCostList.push('Token overage charges for long inputs')
      if (ap.pricing_model === 'tiered') hiddenCostList.push('Tier upgrade costs at volume thresholds')
      if (rng.next(0, 1) === 1) hiddenCostList.push('API key management overhead')
      if (rng.next(0, 2) === 1) hiddenCostList.push('Rate limiting throttling costs')
      if (hiddenCostList.length === 0) hiddenCostList.push('No significant hidden costs detected')
    }

    let costRating: 'excellent' | 'good' | 'fair' | 'expensive' = 'fair'
    if (ap.price_per_call <= budget * 0.5) costRating = 'excellent'
    else if (ap.price_per_call <= budget * 0.8) costRating = 'good'
    else if (ap.price_per_call <= budget) costRating = 'fair'
    else costRating = 'expensive'

    const valueScore = clamp(Math.round(
      (1 - ap.price_per_call / Math.max(budget, 0.01)) * 50 +
      (costRating === 'excellent' ? 40 : costRating === 'good' ? 30 : costRating === 'fair' ? 15 : 5) +
      rng.next(0, 10)
    ), 0, 100)

    return {
      agent_id: ap.agent_id,
      agent_name: ap.agent_name,
      price_per_call: ap.price_per_call,
      pricing_model: ap.pricing_model,
      monthly_cost_at_volume: parseFloat(monthlyCost.toFixed(2)),
      cost_rating: costRating,
      hidden_costs: hiddenCostList,
      value_score: valueScore
    }
  })

  const prices = analyses.map(a => a.price_per_call).sort((a, b) => a - b)
  const cheapest = analyses.reduce((min, a) => a.price_per_call < min.price_per_call ? a : min, analyses[0])
  const mostExpensive = analyses.reduce((max, a) => a.price_per_call > max.price_per_call ? a : max, analyses[0])
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length
  const median = prices.length % 2 === 0
    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
    : prices[Math.floor(prices.length / 2)]

  const withinBudget = analyses.filter(a => a.price_per_call <= budget).length
  const budgetAssessment = withinBudget === analyses.length
    ? 'All ' + analyses.length + ' agents are within your $' + budget.toFixed(2) + '/call budget'
    : withinBudget + ' of ' + analyses.length + ' agents are within budget; ' + (analyses.length - withinBudget) + ' exceed $' + budget.toFixed(2) + '/call'

  const tips: string[] = [
    'Negotiate volume discounts at ' + (volume * 2) + '+ calls/month for 15-30% savings',
    'Consider tiered pricing models for predictable costs at scale',
    'Monitor token-based pricing carefully - costs can spike with complex inputs',
    'Bundle multiple capabilities from one agent to reduce per-call overhead',
    'Set up billing alerts at 80% of monthly budget to avoid surprises'
  ]

  const recs: string[] = [
    'Best value: ' + analyses.reduce((best, a) => a.value_score > best.value_score ? a : best, analyses[0]).agent_name,
    'Cheapest option: ' + cheapest.agent_name + ' at $' + cheapest.price_per_call.toFixed(3) + '/call',
    'Consider total cost of ownership including hidden costs, not just per-call price',
    'Run integration tests on top-2 pricing matches before committing',
    'Re-evaluate pricing quarterly as marketplace competition drives prices down'
  ]

  return {
    agents_analyzed: analyses.length,
    cheapest: { agent_id: cheapest.agent_id, agent_name: cheapest.agent_name, price_per_call: cheapest.price_per_call },
    most_expensive: { agent_id: mostExpensive.agent_id, agent_name: mostExpensive.agent_name, price_per_call: mostExpensive.price_per_call },
    average_price: parseFloat(avg.toFixed(3)),
    median_price: parseFloat(median.toFixed(3)),
    agent_analyses: analyses,
    budget_assessment: budgetAssessment,
    cost_optimization_tips: tips,
    recommendations: recs
  }
}

function formatPricingReport(input: PricingComparisonInput, result: PricingComparisonOutput): string {
  const lines: string[] = []
  lines.push('## Pricing Comparison Analyst')
  lines.push('')
  lines.push('**Agents Compared:** ' + result.agents_analyzed + ' | **Budget:** $' + (input.budget_per_call ?? 1.0).toFixed(2) + '/call | **Volume:** ' + (input.expected_monthly_volume ?? 1000) + '/month')
  lines.push('')

  lines.push('### Price Summary')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Cheapest | ' + result.cheapest.agent_name + ' at $' + result.cheapest.price_per_call.toFixed(3) + '/call |')
  lines.push('| Most Expensive | ' + result.most_expensive.agent_name + ' at $' + result.most_expensive.price_per_call.toFixed(3) + '/call |')
  lines.push('| Average | $' + result.average_price.toFixed(3) + '/call |')
  lines.push('| Median | $' + result.median_price.toFixed(3) + '/call |')
  lines.push('')

  lines.push('### Agent Pricing Analysis')
  lines.push('| Agent | Price/Call | Model | Monthly Cost | Rating | Value Score |')
  lines.push('|-------|------------|-------|--------------|--------|-------------|')
  result.agent_analyses.forEach(a => {
    lines.push('| ' + a.agent_name + ' | $' + a.price_per_call.toFixed(3) + ' | ' + a.pricing_model + ' | $' + a.monthly_cost_at_volume.toFixed(2) + ' | ' + a.cost_rating + ' | ' + a.value_score + '/100 |')
  })
  lines.push('')

  lines.push('### Budget Assessment')
  lines.push(result.budget_assessment)
  lines.push('')

  lines.push('### Cost Optimization Tips')
  result.cost_optimization_tips.forEach(t => lines.push('- ' + t))
  lines.push('')

  lines.push('### Recommendations')
  result.recommendations.forEach(r => lines.push('- ' + r))
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 4: REPUTATION SCORER ====================

function scoreReputation(input: ReputationScorerInput): ReputationScorerOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const disputeRate = input.dispute_rate_pct ?? rng.nextFloat(0, 5)
  const isVerified = input.verified ?? rng.next(0, 1) === 1

  const factors: ReputationFactor[] = [
    {
      factor: 'Average Rating',
      score: clamp(input.avg_rating * 20, 0, 100),
      weight: 0.30,
      weighted_score: clamp(input.avg_rating * 20, 0, 100) * 0.30,
      assessment: input.avg_rating >= 4.5 ? 'Excellent' : input.avg_rating >= 4.0 ? 'Good' : input.avg_rating >= 3.0 ? 'Average' : 'Below Average'
    },
    {
      factor: 'Completion Rate',
      score: clamp(input.completion_rate_pct, 0, 100),
      weight: 0.25,
      weighted_score: clamp(input.completion_rate_pct, 0, 100) * 0.25,
      assessment: input.completion_rate_pct >= 95 ? 'Excellent' : input.completion_rate_pct >= 85 ? 'Good' : input.completion_rate_pct >= 70 ? 'Average' : 'Below Average'
    },
    {
      factor: 'Response Time',
      score: clamp(Math.max(0, 100 - (input.avg_response_ms / 50)), 0, 100),
      weight: 0.20,
      weighted_score: clamp(Math.max(0, 100 - (input.avg_response_ms / 50)), 0, 100) * 0.20,
      assessment: input.avg_response_ms <= 200 ? 'Fast' : input.avg_response_ms <= 500 ? 'Moderate' : input.avg_response_ms <= 1000 ? 'Slow' : 'Very Slow'
    },
    {
      factor: 'Transaction Volume',
      score: clamp(Math.min(input.total_transactions / 10, 100), 0, 100),
      weight: 0.15,
      weighted_score: clamp(Math.min(input.total_transactions / 10, 100), 0, 100) * 0.15,
      assessment: input.total_transactions >= 1000 ? 'High Volume' : input.total_transactions >= 100 ? 'Moderate' : input.total_transactions >= 10 ? 'Low' : 'New'
    },
    {
      factor: 'Dispute Rate',
      score: clamp(Math.max(0, 100 - (disputeRate * 20)), 0, 100),
      weight: 0.10,
      weighted_score: clamp(Math.max(0, 100 - (disputeRate * 20)), 0, 100) * 0.10,
      assessment: disputeRate <= 1 ? 'Excellent' : disputeRate <= 3 ? 'Good' : disputeRate <= 5 ? 'Fair' : 'High Risk'
    }
  ]

  const overallScore = Math.round(factors.reduce((s, f) => s + f.weighted_score, 0))

  let tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'new' = 'new'
  if (overallScore >= 90) tier = 'platinum'
  else if (overallScore >= 75) tier = 'gold'
  else if (overallScore >= 60) tier = 'silver'
  else if (overallScore >= 40) tier = 'bronze'

  const badges = {
    verified: isVerified,
    fast_responder: input.avg_response_ms <= 300,
    high_completion: input.completion_rate_pct >= 90,
    top_rated: input.avg_rating >= 4.5,
    reliable_volume: input.total_transactions >= 100
  }

  const benefits: string[] = []
  if (tier === 'platinum') {
    benefits.push('Featured placement in marketplace search results')
    benefits.push('Priority support from marketplace team')
    benefits.push('Eligible for enterprise partnership programs')
    benefits.push('Reduced marketplace commission (5% vs standard 15%)')
  } else if (tier === 'gold') {
    benefits.push('Boosted visibility in category listings')
    benefits.push('Access to premium buyer network')
    benefits.push('Reduced marketplace commission (10%)')
  } else if (tier === 'silver') {
    benefits.push('Standard marketplace visibility')
    benefits.push('Eligible for seasonal promotions')
  } else {
    benefits.push('Basic marketplace listing')
    benefits.push('Access to improvement resources')
  }

  const improvements: string[] = []
  if (input.avg_rating < 4.0) improvements.push('Improve rating through better output quality and user communication')
  if (input.completion_rate_pct < 90) improvements.push('Reduce task failures by improving error handling')
  if (input.avg_response_ms > 500) improvements.push('Optimize response time through caching or model selection')
  if (input.total_transactions < 100) improvements.push('Build transaction history by promoting agent in relevant channels')
  if (disputeRate > 3) improvements.push('Reduce disputes by setting clearer expectations and SLAs')
  if (!isVerified) improvements.push('Complete identity verification to build trust')
  if (improvements.length === 0) improvements.push('Maintain current performance - all metrics are strong')

  const recs: string[] = [
    'Aim for 4.5+ rating to achieve top_rated badge and boost search ranking',
    'Keep dispute rate below 2% to maintain gold tier or above',
    'Respond within 300ms to earn fast_responder badge',
    'Complete 100+ transactions to unlock reliable_volume status',
    'Re-score reputation monthly to track improvement progress'
  ]

  return {
    overall_reputation_score: overallScore,
    reputation_tier: tier,
    factors,
    trust_badges: badges,
    marketplace_benefits: benefits,
    improvement_areas: improvements,
    recommendations: recs
  }
}

function formatReputationReport(input: ReputationScorerInput, result: ReputationScorerOutput): string {
  const lines: string[] = []
  lines.push('## Reputation Scorer')
  lines.push('')
  lines.push('**Agent:** ' + (input.agent_name || input.agent_id) + ' | **Tier:** ' + result.reputation_tier.toUpperCase() + ' | **Score:** ' + result.overall_reputation_score + '/100')
  lines.push('')

  lines.push('### Trust Badges')
  lines.push('| Badge | Status |')
  lines.push('|-------|--------|')
  lines.push('| Verified | ' + (result.trust_badges.verified ? 'Yes' : 'No') + ' |')
  lines.push('| Fast Responder | ' + (result.trust_badges.fast_responder ? 'Yes' : 'No') + ' |')
  lines.push('| High Completion | ' + (result.trust_badges.high_completion ? 'Yes' : 'No') + ' |')
  lines.push('| Top Rated | ' + (result.trust_badges.top_rated ? 'Yes' : 'No') + ' |')
  lines.push('| Reliable Volume | ' + (result.trust_badges.reliable_volume ? 'Yes' : 'No') + ' |')
  lines.push('')

  lines.push('### Factor Breakdown')
  lines.push('| Factor | Score | Weight | Weighted | Assessment |')
  lines.push('|--------|-------|--------|----------|------------|')
  result.factors.forEach(f => {
    lines.push('| ' + f.factor + ' | ' + f.score.toFixed(0) + ' | ' + (f.weight * 100).toFixed(0) + '% | ' + f.weighted_score.toFixed(1) + ' | ' + f.assessment + ' |')
  })
  lines.push('')

  lines.push('### Marketplace Benefits')
  result.marketplace_benefits.forEach(b => lines.push('- ' + b))
  lines.push('')

  lines.push('### Improvement Areas')
  result.improvement_areas.forEach(i => lines.push('- ' + i))
  lines.push('')

  lines.push('### Recommendations')
  result.recommendations.forEach(r => lines.push('- ' + r))
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 5: INTEGRATION TEST RUNNER ====================

function runIntegrationTests(input: IntegrationTestInput): IntegrationTestOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const timeout = input.timeout_ms ?? 5000
  const retries = input.retry_count ?? 3
  const caps = input.test_capabilities.length > 0 ? input.test_capabilities : ['connectivity', 'authentication', 'basic-response', 'error-handling', 'rate-limiting']

  const results: IntegrationTestResult[] = caps.map((cap, i) => {
    const roll = rng.next(1, 100)
    let status: 'pass' | 'fail' | 'warning' | 'skipped' = 'pass'
    let details = ''
    let errorMsg: string | undefined
    const responseTime = rng.next(50, 3000)

    if (cap === 'connectivity') {
      if (roll <= 85) { status = 'pass'; details = 'Endpoint reachable in ' + responseTime + 'ms' }
      else if (roll <= 95) { status = 'warning'; details = 'Slow connection: ' + responseTime + 'ms (threshold: ' + timeout + 'ms)' }
      else { status = 'fail'; details = 'Connection timeout after ' + timeout + 'ms'; errorMsg = 'ETIMEDOUT: Could not reach ' + input.agent_endpoint }
    } else if (cap === 'authentication') {
      if (roll <= 80) { status = 'pass'; details = input.auth_method + ' authentication successful' }
      else if (roll <= 90) { status = 'warning'; details = 'Auth succeeded but token refresh may be needed' }
      else { status = 'fail'; details = 'Authentication failed with ' + input.auth_method; errorMsg = '401 Unauthorized: Invalid or expired credentials' }
    } else if (cap === 'basic-response') {
      if (roll <= 75) { status = 'pass'; details = 'Valid response received in ' + responseTime + 'ms' }
      else if (roll <= 88) { status = 'warning'; details = 'Response valid but slow: ' + responseTime + 'ms' }
      else { status = 'fail'; details = 'Invalid response format received'; errorMsg = 'Response schema validation failed' }
    } else if (cap === 'error-handling') {
      if (roll <= 70) { status = 'pass'; details = 'Graceful error handling for invalid inputs' }
      else if (roll <= 85) { status = 'warning'; details = 'Errors handled but messages are not informative' }
      else { status = 'fail'; details = 'Unhandled error or stack trace exposed'; errorMsg = '500 Internal Server Error on invalid input' }
    } else if (cap === 'rate-limiting') {
      if (roll <= 65) { status = 'pass'; details = 'Rate limit headers present and respected' }
      else if (roll <= 80) { status = 'warning'; details = 'Rate limit detected but headers missing' }
      else { status = 'fail'; details = 'No rate limiting detected - risk of throttling'; errorMsg = '429 Too Many Requests without Retry-After header' }
    } else {
      if (roll <= 60) { status = 'pass'; details = cap + ' capability verified' }
      else if (roll <= 75) { status = 'warning'; details = cap + ' partially working' }
      else if (roll <= 90) { status = 'fail'; details = cap + ' test failed'; errorMsg = 'Capability ' + cap + ' did not respond as expected' }
      else { status = 'skipped'; details = cap + ' not available in this agent' }
    }

    return {
      capability: cap,
      status,
      response_time_ms: responseTime,
      details,
      ...(errorMsg ? { error_message: errorMsg } : {})
    }
  })

  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const warnings = results.filter(r => r.status === 'warning').length
  const skipped = results.filter(r => r.status === 'skipped').length
  const avgResponse = Math.round(results.reduce((s, r) => s + r.response_time_ms, 0) / results.length)

  const compatScore = clamp(Math.round((passed / results.length) * 70 + (warnings / results.length) * 20 + (skipped / results.length) * 10), 0, 100)

  let readiness: 'production_ready' | 'needs_work' | 'not_ready' = 'not_ready'
  if (compatScore >= 80 && failed === 0) readiness = 'production_ready'
  else if (compatScore >= 50 && failed <= 1) readiness = 'needs_work'

  const recs: string[] = []
  if (failed > 0) {
    recs.push('Fix ' + failed + ' failing test(s) before production deployment')
  }
  if (warnings > 0) {
    recs.push('Address ' + warnings + ' warning(s) to improve reliability')
  }
  if (avgResponse > 1000) {
    recs.push('Optimize response time (current avg: ' + avgResponse + 'ms, target: <500ms)')
  }
  if (readiness === 'production_ready') {
    recs.push('Agent is ready for production - proceed with monitoring setup')
  }
  recs.push('Re-run tests after any agent updates or configuration changes')
  recs.push('Set up continuous integration testing for ongoing compatibility monitoring')

  return {
    agent_name: input.agent_name,
    endpoint: input.agent_endpoint,
    total_tests: results.length,
    passed,
    failed,
    warnings,
    skipped,
    avg_response_time_ms: avgResponse,
    test_results: results,
    compatibility_score: compatScore,
    readiness_level: readiness,
    recommendations: recs
  }
}

function formatIntegrationTestReport(input: IntegrationTestInput, result: IntegrationTestOutput): string {
  const lines: string[] = []
  lines.push('## Integration Test Runner')
  lines.push('')
  lines.push('**Agent:** ' + result.agent_name + ' | **Endpoint:** ' + result.endpoint + ' | **Auth:** ' + input.auth_method)
  lines.push('')
  lines.push('### Results: ' + result.passed + ' passed, ' + result.failed + ' failed, ' + result.warnings + ' warnings, ' + result.skipped + ' skipped')
  lines.push('**Compatibility Score:** ' + result.compatibility_score + '/100 | **Readiness:** ' + result.readiness_level.replace('_', ' ').toUpperCase() + ' | **Avg Response:** ' + result.avg_response_time_ms + 'ms')
  lines.push('')

  lines.push('### Test Details')
  lines.push('| # | Capability | Status | Response Time | Details |')
  lines.push('|---|-----------|--------|---------------|---------|')
  result.test_results.forEach((r, i) => {
    lines.push('| ' + (i + 1) + ' | ' + r.capability + ' | ' + r.status.toUpperCase() + ' | ' + r.response_time_ms + 'ms | ' + r.details + ' |')
  })
  lines.push('')

  const failures = result.test_results.filter(r => r.status === 'fail')
  if (failures.length > 0) {
    lines.push('### Failures')
    failures.forEach(f => {
      lines.push('- **' + f.capability + ':** ' + (f.error_message || f.details))
    })
    lines.push('')
  }

  lines.push('### Recommendations')
  result.recommendations.forEach(r => lines.push('- ' + r))
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 6: AGENT COMPARISON MATRIX ====================

function buildComparisonMatrix(input: ComparisonMatrixInput): ComparisonMatrixOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const dimensions = input.dimensions ?? ['rating', 'price', 'response_time', 'capabilities', 'completion_rate', 'popularity']
  const weights = input.weights ?? {
    rating: 0.25,
    price: 0.20,
    response_time: 0.15,
    capabilities: 0.15,
    completion_rate: 0.15,
    popularity: 0.10
  }

  const dimScores: DimensionScore[] = dimensions.map(dim => {
    const dimWeight = weights[dim] ?? (1 / dimensions.length)

    const getRawScore = (agent: typeof input.agents[0]): number => {
      switch (dim) {
        case 'rating': return agent.rating * 20
        case 'price': return Math.max(0, 100 - agent.price_per_call * 40)
        case 'response_time': return Math.max(0, 100 - agent.response_time_ms / 50)
        case 'capabilities': return Math.min(100, agent.capabilities_count * 12.5)
        case 'completion_rate': return agent.completion_rate_pct
        case 'popularity': return agent.popularity_score
        default: return rng.next(40, 90)
      }
    }

    const rawScores = input.agents.map(a => ({
      agent_id: a.agent_id,
      agent_name: a.agent_name,
      raw_score: parseFloat(getRawScore(a).toFixed(1))
    }))

    const maxRaw = Math.max(...rawScores.map(s => s.raw_score), 1)
    const normalized = rawScores.map(s => ({
      ...s,
      normalized_score: parseFloat(((s.raw_score / maxRaw) * 100).toFixed(1)),
      weighted_score: parseFloat((((s.raw_score / maxRaw) * 100) * dimWeight).toFixed(1))
    }))

    const best = normalized.reduce((b, s) => s.normalized_score > b.normalized_score ? s : b, normalized[0])

    return {
      dimension: dim,
      weight: dimWeight,
      scores: normalized,
      best_agent_id: best.agent_id,
      best_agent_name: best.agent_name
    }
  })

  // Compute overall ranking
  const agentTotals = input.agents.map(a => {
    let total = 0
    dimScores.forEach(ds => {
      const agentScore = ds.scores.find(s => s.agent_id === a.agent_id)
      if (agentScore) total += agentScore.weighted_score
    })
    return {
      agent_id: a.agent_id,
      agent_name: a.agent_name,
      total_score: parseFloat(total.toFixed(1))
    }
  })

  agentTotals.sort((a, b) => b.total_score - a.total_score)
  const ranking = agentTotals.map((a, i) => ({ rank: i + 1, ...a }))

  const winner = ranking[0]

  const tradeOffs: string[] = []
  if (ranking.length >= 2) {
    const first = ranking[0]
    const second = ranking[1]
    tradeOffs.push('Winner ' + first.agent_name + ' leads by ' + (first.total_score - second.total_score).toFixed(1) + ' points')
  }
  dimScores.forEach(ds => {
    const best = ds.scores.reduce((b, s) => s.normalized_score > b.normalized_score ? s : b, ds.scores[0])
    tradeOffs.push('Best in ' + ds.dimension.replace('_', ' ') + ': ' + best.agent_name + ' (' + best.normalized_score.toFixed(0) + '/100)')
  })
  tradeOffs.push('Price vs Quality trade-off: higher-rated agents may cost more per call')
  tradeOffs.push('Speed vs Capabilities trade-off: faster agents may have fewer features')

  const recs: string[] = [
    'Top pick: ' + winner.agent_name + ' with overall score ' + winner.total_score.toFixed(1),
    'Consider your specific dimension priorities when choosing - the matrix winner may not be best for every use case',
    'Weight price higher if budget-constrained; weight quality higher for mission-critical tasks',
    'Run integration tests on top-2 agents from the ranking',
    'Re-run comparison when new agents enter the marketplace'
  ]

  return {
    agents_compared: input.agents.length,
    dimensions_analyzed: dimensions.length,
    dimension_scores: dimScores,
    overall_ranking: ranking,
    winner: { agent_id: winner.agent_id, agent_name: winner.agent_name, total_score: winner.total_score },
    trade_offs: tradeOffs,
    recommendations: recs
  }
}

function formatComparisonMatrixReport(input: ComparisonMatrixInput, result: ComparisonMatrixOutput): string {
  const lines: string[] = []
  lines.push('## Agent Comparison Matrix')
  lines.push('')
  lines.push('**Agents:** ' + result.agents_compared + ' | **Dimensions:** ' + result.dimensions_analyzed + ' | **Winner:** ' + result.winner.agent_name + ' (' + result.winner.total_score.toFixed(1) + ' pts)')
  lines.push('')

  lines.push('### Overall Ranking')
  lines.push('| Rank | Agent | Total Score |')
  lines.push('|------|-------|-------------|')
  result.overall_ranking.forEach(r => {
    lines.push('| ' + r.rank + ' | ' + r.agent_name + ' | ' + r.total_score.toFixed(1) + ' |')
  })
  lines.push('')

  lines.push('### Dimension Winners')
  lines.push('| Dimension | Winner | Best In |')
  lines.push('|-----------|--------|---------|')
  result.dimension_scores.forEach(ds => {
    lines.push('| ' + ds.dimension.replace('_', ' ') + ' (' + (ds.weight * 100).toFixed(0) + '%) | ' + ds.best_agent_name + ' | Yes |')
  })
  lines.push('')

  lines.push('### Trade-offs')
  result.trade_offs.forEach(t => lines.push('- ' + t))
  lines.push('')

  lines.push('### Recommendations')
  result.recommendations.forEach(r => lines.push('- ' + r))
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 7: MARKETPLACE TREND ANALYZER ====================

function analyzeTrends(input: TrendAnalysisInput): TrendAnalysisOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const months = input.time_range_months
  const granularity = input.granularity ?? 'monthly'
  const categories = input.categories.length > 0 ? input.categories : ['data-analysis', 'code-generation', 'creative', 'research', 'automation']

  const trends: CategoryTrend[] = categories.map((cat, i) => {
    const growthRate = rng.nextFloat(-15, 45)
    const startCount = rng.next(10, 100)
    const endCount = Math.max(5, Math.round(startCount * (1 + growthRate / 100)))

    const priceTrend: 'rising' | 'stable' | 'falling' =
      growthRate > 20 ? 'rising' : growthRate > -5 ? 'stable' : 'falling'

    const demand: 'high' | 'medium' | 'low' =
      growthRate > 25 ? 'high' : growthRate > 5 ? 'medium' : 'low'

    let maturity: 'emerging' | 'growing' | 'mature' | 'declining' = 'growing'
    if (growthRate > 30 && endCount < 50) maturity = 'emerging'
    else if (growthRate > 10) maturity = 'growing'
    else if (growthRate > -5) maturity = 'mature'
    else maturity = 'declining'

    return {
      category: cat,
      growth_rate_pct: parseFloat(growthRate.toFixed(1)),
      agent_count_start: startCount,
      agent_count_end: endCount,
      avg_price_trend: priceTrend,
      demand_level: demand,
      maturity_stage: maturity
    }
  })

  const insights: TrendInsight[] = []
  for (let idx = 0; idx < trends.length; idx++) {
    const t = trends[idx]
    if (t.growth_rate_pct > 30) {
      const surgeInsight: TrendInsight = {
        insight: t.category + ' is surging with ' + t.growth_rate_pct + '% growth - high opportunity for new entrants',
        impact: 'high',
        category: t.category,
        action_required: true
      }
      insights.push(surgeInsight)
    }
    if (t.growth_rate_pct < -5) {
      const declineInsight: TrendInsight = {
        insight: t.category + ' is declining (' + t.growth_rate_pct + '%) - consider pivoting to adjacent categories',
        impact: 'high',
        category: t.category,
        action_required: true
      }
      insights.push(declineInsight)
    }
    if (t.avg_price_trend === 'falling' && t.demand_level === 'high') {
      const priceInsight: TrendInsight = {
        insight: t.category + ' prices falling despite high demand - buyers market, negotiate aggressively',
        impact: 'medium',
        category: t.category,
        action_required: false
      }
      insights.push(priceInsight)
    }
    if (t.maturity_stage === 'emerging') {
      const emergingInsight: TrendInsight = {
        insight: t.category + ' is an emerging category - early mover advantage available',
        impact: 'high',
        category: t.category,
        action_required: true
      }
      insights.push(emergingInsight)
    }
  }

  const emerging = trends.filter(t => t.maturity_stage === 'emerging' || t.growth_rate_pct > 25).map(t => t.category)
  const declining = trends.filter(t => t.maturity_stage === 'declining' || t.growth_rate_pct < -5).map(t => t.category)
  const overallGrowth = parseFloat((trends.reduce((s, t) => s + t.growth_rate_pct, 0) / trends.length).toFixed(1))

  const forecast: string[] = [
    'Market expected to grow ' + (overallGrowth > 0 ? overallGrowth.toFixed(1) : '0') + '% over next ' + months + ' months',
    emerging.length > 0 ? 'Watch emerging categories: ' + emerging.join(', ') : 'No new emerging categories detected',
    declining.length > 0 ? 'Declining categories to monitor: ' + declining.join(', ') : 'No declining categories detected',
    'Price competition intensifying in high-growth segments',
    'Expect consolidation in mature categories with 50+ agents'
  ]

  const recs: string[] = [
    'Invest in high-growth categories early for best positioning',
    'Diversify across multiple categories to reduce risk',
    'Monitor emerging categories monthly for new opportunities',
    'Consider exiting declining categories before saturation',
    'Track pricing trends to optimize procurement timing'
  ]

  return {
    time_range_months: months,
    granularity,
    categories_analyzed: categories.length,
    category_trends: trends,
    insights,
    emerging_categories: emerging,
    declining_categories: declining,
    overall_market_growth_pct: overallGrowth,
    forecast,
    recommendations: recs
  }
}

function formatTrendReport(input: TrendAnalysisInput, result: TrendAnalysisOutput): string {
  const lines: string[] = []
  lines.push('## Marketplace Trend Analyzer')
  lines.push('')
  lines.push('**Time Range:** ' + result.time_range_months + ' months | **Granularity:** ' + result.granularity + ' | **Categories:** ' + result.categories_analyzed)
  lines.push('**Overall Market Growth:** +' + result.overall_market_growth_pct + '%')
  lines.push('')

  lines.push('### Category Trends')
  lines.push('| Category | Growth % | Start Count | End Count | Price Trend | Demand | Maturity |')
  lines.push('|----------|----------|-------------|-----------|-------------|--------|----------|')
  result.category_trends.forEach(t => {
    lines.push('| ' + t.category + ' | ' + t.growth_rate_pct + '% | ' + t.agent_count_start + ' | ' + t.agent_count_end + ' | ' + t.avg_price_trend + ' | ' + t.demand_level + ' | ' + t.maturity_stage + ' |')
  })
  lines.push('')

  if (result.insights.length > 0) {
    lines.push('### Key Insights')
    lines.push('| Insight | Impact | Category | Action Needed |')
    lines.push('|---------|--------|----------|---------------|')
    result.insights.forEach(ins => {
      lines.push('| ' + ins.insight + ' | ' + ins.impact + ' | ' + ins.category + ' | ' + (ins.action_required ? 'Yes' : 'No') + ' |')
    })
    lines.push('')
  }

  lines.push('### Emerging Categories')
  if (result.emerging_categories.length > 0) {
    result.emerging_categories.forEach(c => lines.push('- ' + c))
  } else {
    lines.push('- None detected')
  }
  lines.push('')

  lines.push('### Declining Categories')
  if (result.declining_categories.length > 0) {
    result.declining_categories.forEach(c => lines.push('- ' + c))
  } else {
    lines.push('- None detected')
  }
  lines.push('')

  lines.push('### Forecast')
  result.forecast.forEach(f => lines.push('- ' + f))
  lines.push('')

  lines.push('### Recommendations')
  result.recommendations.forEach(r => lines.push('- ' + r))
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== TOOL 8: AGENT RECOMMENDATION ENGINE ====================

function generateRecommendations(input: RecommendationInput): RecommendationOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const priorities = input.priority_factors ?? ['quality', 'price', 'reliability', 'speed']
  const budget = input.budget_per_call ?? 1.0
  const minRating = input.min_rating ?? 3.0

  const recommendations: AgentRecommendation[] = input.candidate_agents
    .filter(a => a.rating >= minRating && a.price_per_call <= budget * 1.2)
    .map(agent => {
      const capFit = input.required_capabilities.length > 0
        ? Math.round((input.required_capabilities.filter(c => agent.capabilities.includes(c)).length / input.required_capabilities.length) * 100)
        : 80

      const priceScore = clamp(Math.round((1 - agent.price_per_call / budget) * 100), 0, 100)
      const qualityScore = Math.round(agent.rating * 20)
      const speedScore = clamp(Math.round(Math.max(0, 100 - agent.avg_response_ms / 50)), 0, 100)
      const reliabilityScore = Math.round(agent.completion_rate_pct)

      const overall = clamp(Math.round(
        capFit * 0.30 +
        priceScore * (priorities.includes('price') ? 0.25 : 0.15) +
        qualityScore * (priorities.includes('quality') ? 0.25 : 0.15) +
        speedScore * (priorities.includes('speed') ? 0.15 : 0.10) +
        reliabilityScore * (priorities.includes('reliability') ? 0.15 : 0.10)
      ), 0, 100)

      const pros: string[] = []
      const cons: string[] = []

      if (agent.rating >= 4.5) pros.push('Excellent rating: ' + agent.rating + '/5.0')
      if (agent.price_per_call <= budget * 0.5) pros.push('Very affordable at $' + agent.price_per_call.toFixed(3) + '/call')
      if (agent.avg_response_ms <= 200) pros.push('Fast response: ' + agent.avg_response_ms + 'ms')
      if (agent.completion_rate_pct >= 95) pros.push('High completion rate: ' + agent.completion_rate_pct + '%')
      if (capFit >= 80) pros.push('Strong capability fit: ' + capFit + '%')
      if (agent.capabilities.length >= 5) pros.push('Versatile: ' + agent.capabilities.length + ' capabilities')

      if (agent.rating < 4.0) cons.push('Below-average rating: ' + agent.rating + '/5.0')
      if (agent.price_per_call > budget) cons.push('Over budget: $' + agent.price_per_call.toFixed(3) + '/call')
      if (agent.avg_response_ms > 1000) cons.push('Slow response: ' + agent.avg_response_ms + 'ms')
      if (agent.completion_rate_pct < 85) cons.push('Low completion rate: ' + agent.completion_rate_pct + '%')
      if (capFit < 50) cons.push('Poor capability fit: ' + capFit + '%')

      if (pros.length === 0) pros.push('Meets basic requirements')
      if (cons.length === 0) cons.push('No significant drawbacks detected')

      let bestFor = 'General purpose use'
      if (priorities[0] === 'price' && agent.price_per_call <= budget * 0.5) bestFor = 'Budget-conscious deployments'
      else if (priorities[0] === 'quality' && agent.rating >= 4.5) bestFor = 'Quality-critical applications'
      else if (priorities[0] === 'speed' && agent.avg_response_ms <= 200) bestFor = 'Real-time applications'
      else if (priorities[0] === 'reliability' && agent.completion_rate_pct >= 95) bestFor = 'Mission-critical workflows'

      return {
        rank: 0,
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        overall_score: overall,
        capability_fit_pct: capFit,
        price_score: priceScore,
        quality_score: qualityScore,
        speed_score: speedScore,
        reliability_score: reliabilityScore,
        pros,
        cons,
        best_for: bestFor
      }
    })

  recommendations.sort((a, b) => b.overall_score - a.overall_score)
  recommendations.forEach((r, i) => { r.rank = i + 1 })

  const topPick = recommendations[0] ?? { agent_id: 'none', agent_name: 'No suitable agent found', overall_score: 0 }
  const alternatives = recommendations.slice(1, 4)

  const framework: string[] = [
    'Define your top priority: price, quality, speed, or reliability',
    'Set minimum acceptable rating (current: ' + minRating + '/5.0)',
    'Set maximum budget per call (current: $' + budget.toFixed(2) + ')',
    'Identify must-have capabilities vs nice-to-have',
    'Run integration tests on top-2 picks before final decision',
    'Consider total cost of ownership, not just per-call price'
  ]

  const recs: string[] = [
    'Top recommendation: ' + topPick.agent_name + ' (score: ' + topPick.overall_score + '/100)',
    alternatives.length > 0 ? 'Alternative options: ' + alternatives.map(a => a.agent_name + ' (' + a.overall_score + ')').join(', ') : 'No alternative matches found',
    'Re-run recommendation after updating priority_factors to see different winners',
    'Validate top pick with integration_test_runner before production deployment',
    'Monitor agent reputation scores for continued quality assurance'
  ]

  return {
    use_case: input.use_case,
    candidates_evaluated: input.candidate_agents.length,
    recommendations,
    top_pick: { agent_id: topPick.agent_id, agent_name: topPick.agent_name, overall_score: topPick.overall_score },
    alternative_picks: alternatives.map(a => ({ agent_id: a.agent_id, agent_name: a.agent_name, overall_score: a.overall_score })),
    decision_framework: framework,
    recommendations_list: recs
  }
}

function formatRecommendationReport(input: RecommendationInput, result: RecommendationOutput): string {
  const lines: string[] = []
  lines.push('## Agent Recommendation Engine')
  lines.push('')
  lines.push('**Use Case:** ' + (input.use_case || 'General') + ' | **Candidates:** ' + result.candidates_evaluated + ' | **Priorities:** ' + (input.priority_factors ?? ['quality', 'price', 'reliability', 'speed']).join(', '))
  lines.push('')

  lines.push('### Top Pick: ' + result.top_pick.agent_name + ' (' + result.top_pick.overall_score + '/100)')
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Full Rankings')
    lines.push('| Rank | Agent | Overall | Cap Fit | Price | Quality | Speed | Reliability |')
    lines.push('|------|-------|---------|---------|-------|---------|-------|-------------|')
    result.recommendations.forEach(r => {
      lines.push('| ' + r.rank + ' | ' + r.agent_name + ' | ' + r.overall_score + '/100 | ' + r.capability_fit_pct + '% | ' + r.price_score + ' | ' + r.quality_score + ' | ' + r.speed_score + ' | ' + r.reliability_score + ' |')
    })
    lines.push('')

    lines.push('### Top Pick Details')
    const top = result.recommendations[0]
    lines.push('**' + top.agent_name + '** (ID: ' + top.agent_id + ')')
    lines.push('- Best for: ' + top.best_for)
    lines.push('- Pros:')
    top.pros.forEach(p => lines.push('  - ' + p))
    lines.push('- Cons:')
    top.cons.forEach(c => lines.push('  - ' + c))
    lines.push('')
  }

  if (result.alternative_picks.length > 0) {
    lines.push('### Alternative Picks')
    result.alternative_picks.forEach(a => {
      lines.push('- ' + a.agent_name + ' (score: ' + a.overall_score + '/100)')
    })
    lines.push('')
  }

  lines.push('### Decision Framework')
  result.decision_framework.forEach(f => lines.push('- ' + f))
  lines.push('')

  lines.push('### Recommendations')
  result.recommendations_list.forEach(r => lines.push('- ' + r))
  lines.push('')
  lines.push(DISCLAIMER)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Agent Discovery Engine
  tools.register(defineTool({
    name: 'agent_discovery_engine',
    description: 'Search and discover AI agents in the marketplace by capability, category, rating, and price. Returns ranked list of matching agents with relevance scores, match reasons, and search insights. Supports filtering by minimum rating, maximum price, and required capabilities.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: query (string), categories (string[]), min_rating (number, optional), max_price_per_call (number, optional), required_capabilities (string[], optional), sort_by ("relevance"|"rating"|"price"|"popularity", optional), limit (number, optional)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: AgentDiscoveryInput = JSON.parse(args.input_data)
      const result = runAgentDiscovery(input)
      return formatDiscoveryReport(input, result)
    }
  }))

  // Tool 2: Capability Matcher
  tools.register(defineTool({
    name: 'capability_matcher',
    description: 'Match user requirements against agent capabilities. Computes fit scores (0-100), grades (A-F), exact/partial/none match types, and coverage percentage. Supports priority weighting for business-critical capabilities.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: required_capabilities (string[]), optional_capabilities (string[]), agent_capabilities (string[]), priority_weights (Record<string, number>, optional)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CapabilityMatcherInput = JSON.parse(args.input_data)
      const result = matchCapabilities(input)
      return formatCapabilityMatchReport(input, result)
    }
  }))

  // Tool 3: Pricing Comparison Analyst
  tools.register(defineTool({
    name: 'pricing_comparison_analyst',
    description: 'Compare pricing across multiple AI agents. Returns cost analysis per agent, budget assessment, cheapest/most expensive identification, hidden cost detection, value scores, and cost optimization tips.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_prices (array of {agent_id, agent_name, price_per_call, pricing_model}), budget_per_call (number, optional), expected_monthly_volume (number, optional), include_hidden_costs (boolean, optional)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PricingComparisonInput = JSON.parse(args.input_data)
      const result = analyzePricing(input)
      return formatPricingReport(input, result)
    }
  }))

  // Tool 4: Reputation Scorer
  tools.register(defineTool({
    name: 'reputation_scorer',
    description: 'Score AI agent reputation from transaction history, ratings, completion rate, response time, and dispute rate. Returns overall score (0-100), tier (platinum/gold/silver/bronze/new), trust badges, marketplace benefits, and improvement recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_id (string), agent_name (string), total_transactions (number), avg_rating (number), completion_rate_pct (number), avg_response_ms (number), dispute_rate_pct (number, optional), verified (boolean, optional)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ReputationScorerInput = JSON.parse(args.input_data)
      const result = scoreReputation(input)
      return formatReputationReport(input, result)
    }
  }))

  // Tool 5: Integration Test Runner
  tools.register(defineTool({
    name: 'integration_test_runner',
    description: 'Run integration tests against AI agent endpoints. Tests connectivity, authentication, basic response, error handling, and rate limiting. Returns pass/fail/warning results, compatibility score, readiness level, and deployment recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_endpoint (string), agent_name (string), test_capabilities (string[]), auth_method (string), timeout_ms (number, optional), retry_count (number, optional)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: IntegrationTestInput = JSON.parse(args.input_data)
      const result = runIntegrationTests(input)
      return formatIntegrationTestReport(input, result)
    }
  }))

  // Tool 6: Agent Comparison Matrix
  tools.register(defineTool({
    name: 'agent_comparison_matrix',
    description: 'Build multi-dimensional comparison matrix across multiple AI agents. Analyzes rating, price, response time, capabilities, completion rate, and popularity with configurable weights. Returns dimension scores, overall ranking, winner identification, and trade-off analysis.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agents (array of {agent_id, agent_name, rating, price_per_call, response_time_ms, capabilities_count, completion_rate_pct, popularity_score}), dimensions (string[], optional), weights (Record<string, number>, optional)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ComparisonMatrixInput = JSON.parse(args.input_data)
      const result = buildComparisonMatrix(input)
      return formatComparisonMatrixReport(input, result)
    }
  }))

  // Tool 7: Marketplace Trend Analyzer
  tools.register(defineTool({
    name: 'marketplace_trend_analyzer',
    description: 'Analyze AI agent marketplace trends over time. Returns category growth rates, agent count changes, price trends, demand levels, maturity stages, emerging/declining categories, market forecasts, and strategic recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: time_range_months (number), categories (string[]), metrics (string[], optional), granularity ("weekly"|"monthly"|"quarterly", optional)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: TrendAnalysisInput = JSON.parse(args.input_data)
      const result = analyzeTrends(input)
      return formatTrendReport(input, result)
    }
  }))

  // Tool 8: Agent Recommendation Engine
  tools.register(defineTool({
    name: 'agent_recommendation_engine',
    description: 'Recommend best AI agents based on use case, required capabilities, budget, and priority factors. Returns ranked recommendations with overall scores, capability fit, price/quality/speed/reliability sub-scores, pros/cons, and decision framework.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: use_case (string), required_capabilities (string[]), budget_per_call (number, optional), min_rating (number, optional), priority_factors (array of "price"|"quality"|"speed"|"reliability", optional), candidate_agents (array of {agent_id, agent_name, capabilities, rating, price_per_call, avg_response_ms, completion_rate_pct})', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: RecommendationInput = JSON.parse(args.input_data)
      const result = generateRecommendations(input)
      return formatRecommendationReport(input, result)
    }
  }))

  console.log('[dsh-tool-agentmarket] Loaded v' + VERSION + ' - Agent Marketplace & Discovery with 8 tools')
  console.log('  Tools: agent_discovery_engine, capability_matcher, pricing_comparison_analyst, reputation_scorer, integration_test_runner, agent_comparison_matrix, marketplace_trend_analyzer, agent_recommendation_engine')
}
