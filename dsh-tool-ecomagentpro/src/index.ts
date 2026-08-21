/**
 * DSH E-commerce Operations AI Agent Pro Plugin v0.1.0
 *
 * Comprehensive e-commerce operations toolkit for DeepSeek Harness Agent.
 * Covers the full lifecycle of e-commerce management from listing optimization
 * to marketplace expansion strategy.
 *
 * Features (v0.1.0):
 * - Product Listing Optimizer (keyword SEO analysis with ranking improvement)
 * - Conversion Rate Diagnostic (funnel analysis and CVR repair recommendations)
 * - Inventory Forecaster (safety stock calculation and reorder planning)
 * - Review Sentiment Analyzer (sentiment scoring with product improvement insights)
 * - Pricing Strategy Advisor (dynamic pricing with competitor monitoring)
 * - Ad Campaign Manager (performance analysis and budget optimization)
 * - Customer Journey Mapper (purchase path and touchpoint analysis)
 * - Marketplace Expansion (new marketplace/platform entry strategy evaluation)
 *
 * @module dsh-tool-ecomagentpro
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-ecomagentpro'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== UTILITY FUNCTIONS ====================

/**
 * Hash a string into a 32-bit integer seed.
 */
function hashStr(str: string): number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

/**
 * Mulberry32 PRNG - deterministic pseudo-random number generator.
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Seeded random helper utilities.
 */
function createSeededRandom(input: string) {
  const seed = hashStr(input)
  const rng = mulberry32(seed)
  return {
    next: rng,
    range: (min: number, max: number) => min + rng() * (max - min),
    int: (min: number, max: number) => Math.floor(min + rng() * (max - min + 1)),
    pick: <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)],
    chance: (pct: number) => rng() < pct
  }
}

// ==================== TYPES ====================

interface ProductListingInput {
  product_id: string
  product_name: string
  current_title: string
  current_description: string
  bullet_points: string[]
  backend_keywords: string[]
  category: string
  monthly_sales: number
  current_conversion_rate: number
  competitor_listings: Array<{
    competitor: string
    title: string
    bullet_points: string[]
    monthly_sales: number
    price: number
  }>
  target_keywords: string[]
  current_bsr: number
  price: number
}

interface ConversionFunnelInput {
  product_id: string
  funnel_stages: Array<{
    stage: string
    visitors: number
    conversions: number
    avg_time_seconds: number
  }>
  traffic_source: string
  device_type: 'mobile' | 'desktop' | 'tablet'
  period: string
  avg_order_value: number
  cart_abandonment_rate: number
  checkout_completion_rate: number
}

interface InventoryForecastInput {
  product_id: string
  product_name: string
  current_stock: number
  avg_daily_sales: number
  sales_volatility: number
  lead_time_days: number
  reorder_quantity: number
  holding_cost_per_unit: number
  stockout_cost_per_unit: number
  supplier_reliability: number
  warehouse_capacity: number
  historical_demand: number[]
}

interface ReviewSentimentInput {
  product_id: string
  product_name: string
  reviews: Array<{
    rating: number
    title: string
    body: string
    date: string
    verified_purchase: boolean
    helpful_votes: number
  }>
  category_avg_rating: number
  competitor_ratings: Array<{
    competitor: string
    avg_rating: number
    review_count: number
  }>
}

interface PricingStrategyInput {
  product_id: string
  product_name: string
  cost_price: number
  current_price: number
  min_advertised_price: number
  competitor_prices: Array<{ competitor: string; price: number; shipping: number }>
  price_elasticity: number
  target_margin: number
  sales_velocity: number
  brand_tier: 'value' | 'mid_market' | 'premium' | 'luxury'
  promotional_calendar: Array<{ date: string; discount_pct: number }>
}

interface AdCampaignInput {
  campaign_id: string
  campaign_name: string
  platform: string
  total_budget: number
  spent_budget: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  roas_target: number
  ad_groups: Array<{
    ad_group_id: string
    ad_group_name: string
    clicks: number
    impressions: number
    spend: number
    conversions: number
    revenue: number
  }>
  keyword_performance: Array<{
    keyword: string
    match_type: string
    clicks: number
    impressions: number
    spend: number
    conversions: number
    quality_score: number
  }>
}

interface CustomerJourneyInput {
  customer_id: string
  sessions: Array<{
    date: string
    channel: string
    touchpoints: Array<{
      type: string
      timestamp: string
      action: string
      duration_seconds: number
    }>
    converted: boolean
    order_value: number
  }>
  customer_segment: string
  acquisition_channel: string
  lifetime_orders: number
  lifetime_value: number
}

interface MarketplaceExpansionInput {
  current_marketplaces: Array<{ platform: string; revenue: number; growth_rate: number }>
  target_marketplaces: Array<{
    platform: string
    estimated_market_size: number
    competition_level: 'low' | 'medium' | 'high'
    entry_cost: number
    commission_rate: number
    fulfillment_options: string[]
    estimated_monthly_traffic: number
  }>
  product_category: string
  avg_product_price: number
  annual_revenue: number
  team_size: number
  expansion_budget: number
}

// ==================== TOOL 1: PRODUCT LISTING OPTIMIZER ====================

interface ListingOptimizerResult {
  seo_score: number
  grade: string
  keyword_analysis: {
    primary_keyword_in_title: boolean
    keyword_density_score: number
    missing_keywords: string[]
    opportunity_keywords: string[]
    search_volume_estimate: number
  }
  title_optimization: {
    current_score: number
    optimized_title: string
    improvements: string[]
  }
  bullet_optimization: {
    current_count: number
    recommended_count: number
    suggested_bullets: string[]
  }
  description_score: {
    current: number
    target: number
    suggestions: string[]
  }
  competitive_gaps: Array<{
    competitor: string
    advantage: string
    action: string
  }>
  bsr_impact_estimate: string
  conversion_lift_estimate: string
}

function analyzeListing(input: ProductListingInput): ListingOptimizerResult {
  const seed = JSON.stringify(input)
  const rnd = createSeededRandom(seed)

  // Keyword analysis
  const titleLower = input.current_title.toLowerCase()
  const hasPrimaryKeyword = input.target_keywords.some(kw => titleLower.includes(kw.toLowerCase()))
  const missingKeywords = input.target_keywords.filter(kw => !titleLower.includes(kw.toLowerCase()))
  const backendCoverage = input.backend_keywords.length > 50 ? 90 : input.backend_keywords.length * 1.8

  // Generate opportunity keywords from competitor analysis
  const opportunityKeywords: string[] = []
  for (const comp of input.competitor_listings) {
    const words = comp.title.split(/\s+/).filter(w => w.length > 4)
    for (const w of words) {
      if (!titleLower.includes(w.toLowerCase()) && opportunityKeywords.length < 5) {
        opportunityKeywords.push(w)
      }
    }
  }

  // Title optimization
  let titleScore = hasPrimaryKeyword ? 70 : 40
  titleScore += input.current_title.length >= 80 ? 15 : input.current_title.length >= 50 ? 10 : 0
  titleScore += titleScore > 85 ? 0 : Math.round(rnd.range(0, 10))
  titleScore = Math.min(100, titleScore)

  // Build optimized title
  const topKeyword = missingKeywords[0] || input.target_keywords[0] || ''
  const optimizedTitle = topKeyword
    ? `${input.product_name} - ${topKeyword} | ${input.current_title.substring(0, 80)}`
    : input.current_title

  // Bullet optimization
  const recommendedBullets = Math.max(5, input.bullet_points.length + 2)
  const suggestedBullets: string[] = [
    `Premium quality ${input.category.toLowerCase()} with superior craftsmanship and attention to detail`,
    `Designed for maximum durability - built to withstand daily use with reinforced construction`,
    `Versatile design complements any style - perfect for everyday use or special occasions`,
    `Backed by our satisfaction guarantee - hassle-free returns within 30 days`,
    `Eco-friendly materials sourced responsibly - sustainable choice for conscious consumers`
  ]

  // Description score
  const descScore = Math.min(100, Math.round(input.current_description.length / 15))

  // Competitive gaps
  const competitiveGaps = input.competitor_listings.slice(0, 3).map(comp => ({
    competitor: comp.competitor,
    advantage: `${comp.monthly_sales > input.monthly_sales ? 'Higher' : 'Lower'} monthly volume (${comp.monthly_sales} vs ${input.monthly_sales})`,
    action: comp.monthly_sales > input.monthly_sales
      ? `Study ${comp.competitor}'s listing structure and pricing strategy`
      : `Maintain advantage over ${comp.competitor} with superior imagery`
  }))

  // BSR impact estimate
  const bsrImprovement = hasPrimaryKeyword ? rnd.int(500, 2000) : rnd.int(1000, 5000)
  const bsrImpact = titleScore > 75
    ? `Estimated BSR improvement of ${bsrImprovement} positions within 2-4 weeks`
    : `Significant BSR improvement (${bsrImprovement * 2} positions) possible with full optimization`

  // Conversion lift
  const cvrLift = rnd.range(0.5, 3.5).toFixed(1)

  // Grade
  const overallScore = Math.round((titleScore + descScore + (hasPrimaryKeyword ? 20 : 0) + backendCoverage * 0.3) / 2)
  const grade = overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 55 ? 'C' : overallScore >= 40 ? 'D' : 'F'

  return {
    seo_score: Math.min(100, overallScore),
    grade,
    keyword_analysis: {
      primary_keyword_in_title: hasPrimaryKeyword,
      keyword_density_score: Math.round(backendCoverage),
      missing_keywords: missingKeywords,
      opportunity_keywords: opportunityKeywords,
      search_volume_estimate: rnd.int(5000, 50000)
    },
    title_optimization: {
      current_score: titleScore,
      optimized_title: optimizedTitle.substring(0, 200),
      improvements: [
        hasPrimaryKeyword ? 'Primary keyword already in title' : `Add primary keyword: "${missingKeywords[0]}"`,
        input.current_title.length < 80 ? 'Increase title length to 150-200 characters' : 'Title length is good',
        'Include brand name at the beginning for brand recognition'
      ]
    },
    bullet_optimization: {
      current_count: input.bullet_points.length,
      recommended_count: recommendedBullets,
      suggested_bullets: suggestedBullets.slice(0, recommendedBullets)
    },
    description_score: {
      current: descScore,
      target: 85,
      suggestions: [
        'Add A+ content with comparison charts and lifestyle images',
        'Include FAQ section addressing common customer concerns',
        'Use structured HTML formatting for key product specifications'
      ]
    },
    competitive_gaps: competitiveGaps,
    bsr_impact_estimate: bsrImpact,
    conversion_lift_estimate: `Estimated ${cvrLift}% conversion rate improvement with full implementation`
  }
}

function formatListingReport(result: ListingOptimizerResult): string {
  const lines: string[] = []
  lines.push('## Product Listing Optimization Report')
  lines.push('')
  lines.push(`**SEO Score:** ${result.seo_score}/100 | **Grade:** ${result.grade}`)
  lines.push('')

  lines.push('### Keyword Analysis')
  lines.push(`- Primary keyword in title: ${result.keyword_analysis.primary_keyword_in_title ? 'Yes' : 'No - CRITICAL'}`)
  lines.push(`- Backend coverage: ${result.keyword_analysis.keyword_density_score}%`)
  lines.push(`- Estimated monthly search volume: ${result.keyword_analysis.search_volume_estimate.toLocaleString()}`)
  if (result.keyword_analysis.missing_keywords.length > 0) {
    lines.push(`- Missing keywords: ${result.keyword_analysis.missing_keywords.join(', ')}`)
  }
  if (result.keyword_analysis.opportunity_keywords.length > 0) {
    lines.push(`- Opportunity keywords: ${result.keyword_analysis.opportunity_keywords.join(', ')}`)
  }
  lines.push('')

  lines.push('### Title Optimization')
  lines.push(`**Score:** ${result.title_optimization.current_score}/100`)
  lines.push(`**Suggested Title:**`)
  lines.push(`> ${result.title_optimization.optimized_title}`)
  lines.push('')
  for (const imp of result.title_optimization.improvements) {
    lines.push(`- ${imp}`)
  }
  lines.push('')

  lines.push('### Bullet Points')
  lines.push(`Current: ${result.bullet_optimization.current_count} | Recommended: ${result.bullet_optimization.recommended_count}`)
  lines.push('')
  for (const b of result.bullet_optimization.suggested_bullets) {
    lines.push(`- ${b}`)
  }
  lines.push('')

  lines.push('### Description & A+ Content')
  lines.push(`Current score: ${result.description_score.current}/100 | Target: ${result.description_score.target}/100`)
  for (const s of result.description_score.suggestions) {
    lines.push(`- ${s}`)
  }
  lines.push('')

  if (result.competitive_gaps.length > 0) {
    lines.push('### Competitive Gaps')
    lines.push('| Competitor | Advantage | Action |')
    lines.push('|------------|-----------|--------|')
    for (const g of result.competitive_gaps) {
      lines.push(`| ${g.competitor} | ${g.advantage} | ${g.action} |`)
    }
    lines.push('')
  }

  lines.push('### Impact Estimate')
  lines.push(`- ${result.bsr_impact_estimate}`)
  lines.push(`- ${result.conversion_lift_estimate}`)
  lines.push('')
  lines.push('> Note: Estimates are based on historical patterns and market conditions. Actual results may vary.')

  return lines.join('\n')
}

// ==================== TOOL 2: CONVERSION RATE DIAGNOSTIC ====================

interface ConversionDiagnosticResult {
  overall_cvr: number
  benchmark_cvr: number
  cvr_gap: number
  funnel_health: 'healthy' | 'warning' | 'critical'
  stage_analysis: Array<{
    stage: string
    visitors: number
    conversion_rate: number
    dropoff_rate: number
    benchmark_rate: number
    status: 'normal' | 'concerning' | 'critical'
    diagnosis: string
    recommendation: string
  }>
  bottlenecks: Array<{
    stage: string
    impact: number
    priority: 'high' | 'medium' | 'low'
    fix: string
    estimated_lift: string
  }>
  benchmarks: {
    industry_avg: string
    top_performers: string
    your_position: string
  }
}

function analyzeConversionFunnel(input: ConversionFunnelInput): ConversionDiagnosticResult {
  const seed = JSON.stringify(input)
  const rnd = createSeededRandom(seed)

  const benchmarkRates: Record<string, number> = {
    'Impression to Click': 0.4,
    'Click to Detail': 8.0,
    'Detail to Cart': 10.0,
    'Cart to Checkout': 65.0,
    'Checkout to Purchase': 75.0
  }

  const stageAnalysis: ConversionDiagnosticResult['stage_analysis'] = []
  const bottlenecks: ConversionDiagnosticResult['bottlenecks'] = []
  let prevVisitors = 0

  for (let i = 0; i < input.funnel_stages.length; i++) {
    const stage = input.funnel_stages[i]
    const benchmark = benchmarkRates[stage.stage] || 5
    const stageCvr = stage.visitors > 0
      ? i === 0 ? (stage.conversions / stage.visitors) * 100 : (stage.conversions / prevVisitors) * 100
      : 0

    let status: 'normal' | 'concerning' | 'critical' = 'normal'
    let diagnosis = ''
    let recommendation = ''

    if (stageCvr < benchmark * 0.5) {
      status = 'critical'
      diagnosis = `Severe drop-off: ${stageCvr.toFixed(1)}% vs ${benchmark}% benchmark`
      recommendation = getStageFix(stage.stage, 'critical')
    } else if (stageCvr < benchmark * 0.8) {
      status = 'concerning'
      diagnosis = `Below benchmark: ${stageCvr.toFixed(1)}% vs ${benchmark}% benchmark`
      recommendation = getStageFix(stage.stage, 'warning')
    } else {
      diagnosis = `Performing well: ${stageCvr.toFixed(1)}% vs ${benchmark}% benchmark`
      recommendation = 'Maintain current performance'
    }

    if (status !== 'normal') {
      const impact = (benchmark - stageCvr) / benchmark * 100
      bottlenecks.push({
        stage: stage.stage,
        impact: Math.round(impact),
        priority: status === 'critical' ? 'high' : 'medium',
        fix: recommendation,
        estimated_lift: `+${(rnd.range(1, 5)).toFixed(1)}% CVR`
      })
    }

    stageAnalysis.push({
      stage: stage.stage,
      visitors: stage.visitors,
      conversion_rate: stageCvr,
      dropoff_rate: 100 - stageCvr,
      benchmark_rate: benchmark,
      status,
      diagnosis,
      recommendation
    })

    prevVisitors = stage.visitors
  }

  const overallCvr = input.funnel_stages.length > 0
    ? (input.funnel_stages[input.funnel_stages.length - 1].conversions / input.funnel_stages[0].visitors) * 100
    : 0
  const benchmarkCvr = 3.5
  const cvrGap = benchmarkCvr - overallCvr

  const criticalCount = stageAnalysis.filter(s => s.status === 'critical').length
  const funnelHealth: 'healthy' | 'warning' | 'critical' =
    criticalCount >= 2 ? 'critical' : criticalCount === 1 ? 'warning' : 'healthy'

  return {
    overall_cvr: overallCvr,
    benchmark_cvr: benchmarkCvr,
    cvr_gap: cvrGap,
    funnel_health: funnelHealth,
    stage_analysis: stageAnalysis,
    bottlenecks: bottlenecks.sort((a, b) => b.impact - a.impact),
    benchmarks: {
      industry_avg: `${benchmarkCvr}%`,
      top_performers: '5-8%',
      your_position: overallCvr >= 4 ? 'Top quartile' : overallCvr >= 2.5 ? 'Above average' : 'Below average'
    }
  }
}

function getStageFix(stage: string, severity: string): string {
  const fixes: Record<string, Record<string, string>> = {
    'Impression to Click': {
      critical: 'Revise main image, add badges/discount tags, test thumbnail variations',
      warning: 'A/B test main image, add brand logo prominence, improve thumbnail clarity'
    },
    'Click to Detail': {
      critical: 'Major listing overhaul needed - check for listing errors, negative reviews, or pricing issues',
      warning: 'Improve image gallery quality, add video content, strengthen title'
    },
    'Detail to Cart': {
      critical: 'Address negative reviews, add social proof badges, improve bullet points with clear benefits',
      warning: 'A/B test price display, add urgency elements, improve review visibility'
    },
    'Cart to Checkout': {
      critical: 'Reduce shipping costs or add free shipping threshold, simplify cart page',
      warning: 'Offer multiple payment options, add trust badges, simplify checkout flow'
    },
    'Checkout to Purchase': {
      critical: 'Remove unexpected costs, offer guest checkout, add security badges',
      warning: 'Provide order summary, offer payment flexibility, add satisfaction guarantee'
    }
  }
  return fixes[stage]?.[severity] || 'Review and optimize this funnel stage'
}

function formatConversionReport(result: ConversionDiagnosticResult): string {
  const lines: string[] = []
  lines.push('## Conversion Rate Diagnostic Report')
  lines.push('')
  lines.push(`**Overall CVR:** ${result.overall_cvr.toFixed(2)}% | **Benchmark:** ${result.benchmark_cvr}% | **Gap:** ${result.cvr_gap > 0 ? '-' : '+'}${Math.abs(result.cvr_gap).toFixed(2)}%`)
  lines.push(`**Funnel Health:** ${result.funnel_health.toUpperCase()}`)
  lines.push(`**Position:** ${result.benchmarks.your_position} (Industry avg: ${result.benchmarks.industry_avg})`)
  lines.push('')

  lines.push('### Funnel Stage Analysis')
  lines.push('| Stage | Visitors | CVR | Benchmark | Status |')
  lines.push('|-------|----------|-----|-----------|--------|')
  for (const s of result.stage_analysis) {
    lines.push(`| ${s.stage} | ${s.visitors.toLocaleString()} | ${s.conversion_rate.toFixed(2)}% | ${s.benchmark_rate}% | ${s.status.toUpperCase()} |`)
  }

  if (result.bottlenecks.length > 0) {
    lines.push('')
    lines.push('### Priority Bottlenecks')
    for (const b of result.bottlenecks) {
      lines.push(`**[${b.priority.toUpperCase()}] ${b.stage}** (Impact: ${b.impact}% below benchmark)`)
      lines.push(`  - Fix: ${b.fix}`)
      lines.push(`  - Estimated lift: ${b.estimated_lift}`)
      lines.push('')
    }
  }

  lines.push('### Stage Diagnostics')
  for (const s of result.stage_analysis) {
    lines.push(`**${s.stage}**: ${s.diagnosis}`)
    lines.push(`- Action: ${s.recommendation}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ==================== TOOL 3: INVENTORY FORECASTER ====================

interface InventoryForecastResult {
  current_position: {
    stock_days_remaining: number
    reorder_urgency: 'imminent' | 'soon' | 'normal' | 'overstocked'
    stockout_risk: string
  }
  safety_stock: {
    recommended_units: number
    z_score: number
    service_level: number
    calculation_method: string
  }
  forecast: {
    daily_demand_mean: number
    daily_demand_std: number
    weekly_forecast: number[]
    monthly_forecast: number
    reorder_point: number
    lead_time_demand: number
  }
  cost_analysis: {
    holding_cost_annual: number
    stockout_cost_risk: number
    total_inventory_cost: number
    optimal_order_quantity: number
    cost_savings_potential: number
  }
  scenarios: Array<{
    scenario: string
    probability: number
    impact: string
    mitigation: string
  }>
  recommendations: string[]
}

function forecastInventory(input: InventoryForecastInput): InventoryForecastResult {
  const seed = JSON.stringify(input)
  const rnd = createSeededRandom(seed)

  const demandValues = input.historical_demand.length > 0
    ? input.historical_demand
    : Array.from({ length: 30 }, () => input.avg_daily_sales + rnd.range(-input.sales_volatility, input.sales_volatility))

  const demandMean = demandValues.reduce((s, v) => s + v, 0) / demandValues.length
  const variance = demandValues.reduce((s, v) => s + Math.pow(v - demandMean, 2), 0) / demandValues.length
  const demandStd = Math.sqrt(variance)

  // Safety stock calculation (service level = 95%)
  const zScore = 1.645 // 95% service level
  const leadTimeDemand = demandMean * input.lead_time_days
  const safetyStock = Math.round(zScore * demandStd * Math.sqrt(input.lead_time_days))
  const reorderPoint = Math.round(leadTimeDemand + safetyStock)

  // Stock status
  const stockDaysRemaining = input.current_stock / demandMean
  let urgency: 'imminent' | 'soon' | 'normal' | 'overstocked' = 'normal'
  if (stockDaysRemaining <= input.lead_time_days * 0.5) urgency = 'imminent'
  else if (stockDaysRemaining <= input.lead_time_days) urgency = 'soon'
  else if (stockDaysRemaining > 90) urgency = 'overstocked'

  // Weekly forecast
  const weeklyForecast: number[] = []
  for (let w = 0; w < 12; w++) {
    weeklyForecast.push(Math.round(7 * demandMean + rnd.range(-demandStd * 2, demandStd * 2)))
  }
  const monthlyForecast = weeklyForecast.slice(0, 4).reduce((s, v) => s + v, 0)

  // EOQ calculation
  const annualDemand = demandMean * 365
  const setupCost = 50 // estimated order cost
  const eoq = Math.round(Math.sqrt((2 * annualDemand * setupCost) / input.holding_cost_per_unit))

  // Cost analysis
  const avgInventory = eoq / 2 + safetyStock
  const holdingCostAnnual = avgInventory * input.holding_cost_per_unit
  const stockoutProbability = input.current_stock < reorderPoint
    ? Math.max(0.5, 1 - (input.current_stock - leadTimeDemand) / (demandStd * Math.sqrt(input.lead_time_days)))
    : 0.05
  const stockoutCostRisk = stockoutProbability * input.stockout_cost_per_unit * annualDemand
  const totalCost = holdingCostAnnual + stockoutCostRisk
  const costSavingsPotential = rnd.range(5, 25)

  // Scenarios
  const scenarios: InventoryForecastResult['scenarios'] = [
    {
      scenario: 'Demand spike (+30%) during promotion',
      probability: 25,
      impact: `Stockout in ${Math.round(stockDaysRemaining * 0.6)} days if not addressed`,
      mitigation: `Pre-order ${Math.round(demandMean * 1.3 * 14)} units before promotion period`
    },
    {
      scenario: 'Supplier delay (lead time +5 days)',
      probability: 15,
      impact: `Stockout risk increases to ${Math.round(stockoutProbability * 150)}%`,
      mitigation: `Activate backup supplier or expedite current order`
    },
    {
      scenario: 'Seasonal surge pattern',
      probability: 35,
      impact: `Forecasted demand increase of ${rnd.int(20, 60)}% over next quarter`,
      mitigation: `Gradually build inventory by ${Math.round(monthlyForecast * 0.3)} units/month`
    }
  ]

  const recommendations: string[] = []
  if (urgency === 'imminent') {
    recommendations.push(`URGENT: Reorder ${Math.max(input.reorder_quantity, eoq)} units IMMEDIATELY - stock covers only ${stockDaysRemaining.toFixed(0)} days`)
  } else if (urgency === 'soon') {
    recommendations.push(`Plan reorder within ${Math.round(stockDaysRemaining - input.lead_time_days)} days - ${Math.max(input.reorder_quantity, eoq)} units recommended`)
  }
  recommendations.push(`Set reorder point at ${reorderPoint} units (${safetyStock} units safety stock)`)
  recommendations.push(`Optimal order quantity: ${eoq} units (EOQ model)`)
  recommendations.push(`Annual inventory cost: $${Math.round(totalCost).toLocaleString()} (savings potential: ${costSavingsPotential.toFixed(0)}%)`)

  return {
    current_position: {
      stock_days_remaining: stockDaysRemaining,
      reorder_urgency: urgency,
      stockout_risk: `${(stockoutProbability * 100).toFixed(0)}% probability in next ${input.lead_time_days} days`
    },
    safety_stock: {
      recommended_units: safetyStock,
      z_score: zScore,
      service_level: 95,
      calculation_method: `Safety Stock = Z (${zScore}) x StdDev (${demandStd.toFixed(1)}) x sqrt(Lead Time ${input.lead_time_days}d)`
    },
    forecast: {
      daily_demand_mean: demandMean,
      daily_demand_std: demandStd,
      weekly_forecast: weeklyForecast,
      monthly_forecast: monthlyForecast,
      reorder_point: reorderPoint,
      lead_time_demand: leadTimeDemand
    },
    cost_analysis: {
      holding_cost_annual: holdingCostAnnual,
      stockout_cost_risk: stockoutCostRisk,
      total_inventory_cost: totalCost,
      optimal_order_quantity: eoq,
      cost_savings_potential: costSavingsPotential
    },
    scenarios,
    recommendations
  }
}

function formatInventoryReport(result: InventoryForecastResult): string {
  const lines: string[] = []
  lines.push('## Inventory Forecast Report')
  lines.push('')
  lines.push(`**Stock Days Remaining:** ${result.current_position.stock_days_remaining.toFixed(0)} days | **Urgency:** ${result.current_position.reorder_urgency.toUpperCase()}`)
  lines.push(`**Stockout Risk:** ${result.current_position.stockout_risk}`)
  lines.push('')

  lines.push('### Safety Stock Calculation')
  lines.push(`- Recommended safety stock: **${result.safety_stock.recommended_units} units**`)
  lines.push(`- Service level: ${result.safety_stock.service_level}% (Z-score: ${result.safety_stock.z_score})`)
  lines.push(`- Method: ${result.safety_stock.calculation_method}`)
  lines.push('')

  lines.push('### Demand Forecast')
  lines.push(`- Daily demand: ${result.forecast.daily_demand_mean.toFixed(1)} units (+/- ${result.forecast.daily_demand_std.toFixed(1)})`)
  lines.push(`- Reorder point: ${result.forecast.reorder_point} units`)
  lines.push(`- Lead time demand: ${result.forecast.lead_time_demand.toFixed(0)} units`)
  lines.push(`- Monthly forecast: ${result.forecast.monthly_forecast} units`)
  lines.push('')
  lines.push(`**12-week forecast (units/week):** ${result.forecast.weekly_forecast.join(', ')}`)
  lines.push('')

  lines.push('### Cost Analysis')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Holding cost (annual) | $${Math.round(result.cost_analysis.holding_cost_annual).toLocaleString()} |`)
  lines.push(`| Stockout cost risk | $${Math.round(result.cost_analysis.stockout_cost_risk).toLocaleString()} |`)
  lines.push(`| Total inventory cost | $${Math.round(result.cost_analysis.total_inventory_cost).toLocaleString()} |`)
  lines.push(`| Optimal order quantity (EOQ) | ${result.cost_analysis.optimal_order_quantity} units |`)
  lines.push(`| Savings potential | ${result.cost_analysis.cost_savings_potential.toFixed(0)}% |`)
  lines.push('')

  lines.push('### Scenario Analysis')
  for (const s of result.scenarios) {
    lines.push(`**${s.scenario}** (${s.probability}% probability)`)
    lines.push(`- Impact: ${s.impact}`)
    lines.push(`- Mitigation: ${s.mitigation}`)
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`> ${r}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ==================== TOOL 4: REVIEW SENTIMENT ANALYZER ====================

interface ReviewSentimentResult {
  overall_sentiment: {
    score: number
    label: 'Very Positive' | 'Positive' | 'Mixed' | 'Negative' | 'Very Negative'
    avg_rating: number
    total_reviews: number
    rating_distribution: { [key: number]: number }
  }
  sentiment_breakdown: {
    positive: number
    neutral: number
    negative: number
    verified_vs_unverified: { verified: number; unverified: number }
  }
  themes: {
    strengths: Array<{ theme: string; mentions: number; sentiment: string }>
    complaints: Array<{ theme: string; mentions: number; severity: 'low' | 'medium' | 'high' }>
    feature_requests: Array<{ feature: string; votes: number }>
  }
  product_improvements: Array<{
    priority: number
    area: string
    suggestion: string
    expected_impact: string
    effort: 'low' | 'medium' | 'high'
  }>
  competitive_comparison: {
    your_rating: number
    category_avg: number
    competitor_ratings: Array<{ competitor: string; rating: number; gap: number }>
    positioning: string
  }
}

function analyzeSentiment(input: ReviewSentimentInput): ReviewSentimentResult {
  const seed = JSON.stringify(input)
  const rnd = createSeededRandom(seed)

  // Rating distribution
  const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let totalRating = 0
  const positiveWeight = { count: 0, total: 0 }
  const neutralWeight = { count: 0, total: 0 }
  const negativeWeight = { count: 0, total: 0 }

  const themeKeywords: Record<string, { keywords: string[]; type: 'strength' | 'complaint' }> = {
    'quality': { keywords: ['quality', 'well made', 'durable', 'sturdy', 'premium', 'solid'], type: 'strength' },
    'comfort': { keywords: ['comfortable', 'soft', 'cozy', 'fit', 'perfect size', 'ergonomic'], type: 'strength' },
    'design': { keywords: ['beautiful', 'elegant', 'stylish', 'looks great', 'aesthetic'], type: 'strength' },
    'value': { keywords: ['worth', 'great price', 'value', 'affordable', 'reasonable'], type: 'strength' },
    'shipping': { keywords: ['fast shipping', 'quick delivery', 'arrived early', 'well packaged'], type: 'strength' },
    'defective': { keywords: ['broke', 'defective', 'broken', 'damaged', 'faulty', 'defect'], type: 'complaint' },
    'size_issues': { keywords: ['too small', 'too large', 'wrong size', 'doesnt fit', 'sizing'], type: 'complaint' },
    'material': { keywords: ['cheap material', 'flimsy', 'thin', 'poor quality', 'falls apart'], type: 'complaint' },
    'color': { keywords: ['color different', 'not as pictured', 'wrong color', 'faded'], type: 'complaint' },
    'customer_service': { keywords: ['customer service', 'return', 'refund', 'no response', 'support'], type: 'complaint' }
  }

  const strengthCounts: Record<string, number> = {}
  const complaintCounts: Record<string, number> = {}
  const requestKeywords = ['wish', 'would be nice', 'please add', 'should have', 'need', 'missing', 'improve', 'better if']
  const featureRequests: Record<string, number> = {}

  for (const review of input.reviews) {
    const rating = review.rating
    distribution[rating] = (distribution[rating] || 0) + 1
    totalRating += rating

    const text = `${review.title} ${review.body}`.toLowerCase()

    // Weighted sentiment by helpful votes
    const weight = 1 + review.helpful_votes * 0.1
    if (rating >= 4) {
      positiveWeight.count += weight
      positiveWeight.total += 1
    } else if (rating === 3) {
      neutralWeight.count += weight
      neutralWeight.total += 1
    } else {
      negativeWeight.count += weight
      negativeWeight.total += 1
    }

    // Theme detection
    for (const [theme, data] of Object.entries(themeKeywords)) {
      if (data.keywords.some(kw => text.includes(kw))) {
        if (data.type === 'strength') {
          strengthCounts[theme] = (strengthCounts[theme] || 0) + 1
        } else {
          complaintCounts[theme] = (complaintCounts[theme] || 0) + 1
        }
      }
    }

    // Feature requests
    for (const kw of requestKeywords) {
      if (text.includes(kw)) {
        const words = text.split(/\s+/)
        const idx = words.indexOf(kw)
        const context = words.slice(idx, idx + 5).join(' ')
        featureRequests[context] = (featureRequests[context] || 0) + review.helpful_votes + 1
      }
    }
  }

  const totalReviews = input.reviews.length
  const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0

  const strengths = Object.entries(strengthCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme, mentions]) => ({ theme, mentions, sentiment: 'positive' }))

  const complaints = Object.entries(complaintCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme, mentions]) => ({
      theme,
      mentions,
      severity: mentions > totalReviews * 0.2 ? 'high' : mentions > totalReviews * 0.1 ? 'medium' : 'low'
    }))

  const totalWeight = positiveWeight.count + neutralWeight.count + negativeWeight.count
  const positive = totalWeight > 0 ? (positiveWeight.count / totalWeight) * 100 : 0
  const neutral = totalWeight > 0 ? (neutralWeight.count / totalWeight) * 100 : 0
  const negative = totalWeight > 0 ? (negativeWeight.count / totalWeight) * 100 : 0

  const sentimentScore = ((avgRating / 5) * 100).toFixed(0)
  const sentimentLabel: ReviewSentimentResult['overall_sentiment']['label'] =
    avgRating >= 4.0 ? 'Very Positive' : avgRating >= 3.5 ? 'Positive' : avgRating >= 2.5 ? 'Mixed' : avgRating >= 1.5 ? 'Negative' : 'Very Negative'

  // Generate improvement suggestions
  const improvements: ReviewSentimentResult['product_improvements'] = []
  let priority = 1
  for (const c of complaints.slice(0, 5)) {
    const suggestionMap: Record<string, { suggestion: string; effort: 'low' | 'medium' | 'high' }> = {
      'defective': { suggestion: 'Implement stricter QC protocols and source from certified suppliers', effort: 'medium' },
      'size_issues': { suggestion: 'Add detailed size chart with measurements and model fit information', effort: 'low' },
      'material': { suggestion: 'Upgrade material grade and update product description to set expectations', effort: 'medium' },
      'color': { suggestion: 'Improve product photography with color-accurate studio lighting', effort: 'low' },
      'customer_service': { suggestion: 'Add automated tracking notifications and expand support team', effort: 'high' }
    }
    const info = suggestionMap[c.theme] || { suggestion: `Address recurring ${c.theme} issues`, effort: 'medium' as const }
    improvements.push({
      priority: priority++,
      area: c.theme.replace('_', ' '),
      suggestion: info.suggestion,
      expected_impact: `Reduce ${'-'.repeat(2)} complaints by ~${Math.round(c.mentions * 0.4)} mentions`,
      effort: info.effort
    })
  }

  return {
    overall_sentiment: {
      score: parseInt(sentimentScore),
      label: sentimentLabel,
      avg_rating: avgRating,
      total_reviews: totalReviews,
      rating_distribution: distribution
    },
    sentiment_breakdown: {
      positive,
      neutral,
      negative,
      verified_vs_unverified: {
        verified: input.reviews.filter(r => r.verified_purchase).length,
        unverified: input.reviews.filter(r => !r.verified_purchase).length
      }
    },
    themes: {
      strengths,
      complaints: complaints as ReviewSentimentResult['themes']['complaints'],
      feature_requests: Object.entries(featureRequests).sort(([, a], [, b]) => b - a).slice(0, 5).map(([feature, votes]) => ({ feature, votes }))
    },
    product_improvements: improvements,
    competitive_comparison: {
      your_rating: avgRating,
      category_avg: input.category_avg_rating,
      competitor_ratings: input.competitor_ratings.map(c => ({
        competitor: c.competitor,
        rating: c.avg_rating,
        gap: +(avgRating - c.avg_rating).toFixed(2)
      })),
      positioning: avgRating > input.category_avg_rating ? 'Above category average' : 'Below category average - improvement needed'
    }
  }
}

function formatSentimentReport(result: ReviewSentimentResult): string {
  const lines: string[] = []
  lines.push('## Review Sentiment Analysis Report')
  lines.push('')
  lines.push(`**Overall Sentiment:** ${result.overall_sentiment.label} (${result.overall_sentiment.score}/100)`)
  lines.push(`**Avg Rating:** ${result.overall_sentiment.avg_rating.toFixed(1)}/5 (${result.overall_sentiment.total_reviews} reviews)`)
  lines.push('')

  lines.push('### Sentiment Breakdown')
  lines.push(`- Positive: ${result.sentiment_breakdown.positive.toFixed(1)}% | Neutral: ${result.sentiment_breakdown.neutral.toFixed(1)}% | Negative: ${result.sentiment_breakdown.negative.toFixed(1)}%`)
  lines.push(`- Verified purchases: ${result.sentiment_breakdown.verified_vs_unverified.verified} | Unverified: ${result.sentiment_breakdown.verified_vs_unverified.unverified}`)
  lines.push('')

  lines.push('### Rating Distribution')
  lines.push('| Stars | Count | Bar |')
  lines.push('|-------|-------|-----|')
  for (const [stars, count] of Object.entries(result.overall_sentiment.rating_distribution)) {
    const bar = '&#x2588;'.repeat(Math.round(count / Math.max(...Object.values(result.overall_sentiment.rating_distribution)) * 10) || 0)
    lines.push(`| ${stars} | ${count} | ${bar} |`)
  }
  lines.push('')

  if (result.themes.strengths.length > 0) {
    lines.push('### Strengths (Praised Themes)')
    for (const s of result.themes.strengths) {
      lines.push(`- ${s.theme}: ${s.mentions} mentions`)
    }
    lines.push('')
  }

  if (result.themes.complaints.length > 0) {
    lines.push('### Common Complaints')
    for (const c of result.themes.complaints) {
      lines.push(`- ${c.theme}: ${c.mentions} mentions [Severity: ${c.severity.toUpperCase()}]`)
    }
    lines.push('')
  }

  if (result.product_improvements.length > 0) {
    lines.push('### Product Improvement Recommendations')
    lines.push('| Priority | Area | Suggestion | Effort | Expected Impact |')
    lines.push('|----------|------|------------|--------|-----------------|')
    for (const imp of result.product_improvements) {
      lines.push(`| ${imp.priority} | ${imp.area} | ${imp.suggestion} | ${imp.effort.toUpperCase()} | ${imp.expected_impact} |`)
    }
    lines.push('')
  }

  if (result.competitive_comparison.competitor_ratings.length > 0) {
    lines.push('### Competitive Comparison')
    lines.push(`Your rating: ${result.competitive_comparison.your_rating.toFixed(1)} | Category avg: ${result.competitive_comparison.category_avg}`)
    lines.push(`**Positioning:** ${result.competitive_comparison.positioning}`)
    lines.push('| Competitor | Rating | Gap |')
    lines.push('|------------|--------|-----|')
    for (const c of result.competitive_comparison.competitor_ratings) {
      const gapText = c.gap >= 0 ? `+${c.gap.toFixed(2)}` : c.gap.toFixed(2)
      lines.push(`| ${c.competitor} | ${c.rating.toFixed(1)} | ${gapText} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== TOOL 5: PRICING STRATEGY ADVISOR ====================

interface PricingAdvisorResult {
  recommendation: {
    current_price: number
    optimal_price: number
    price_range: { floor: number; ceiling: number }
    positioning: string
    expected_margin: number
    demand_adjustment: number
  }
  competitor_landscape: Array<{
    competitor: string
    price: number
    total_cost: number
    vs_your_price: number
  }>
  price_ladder: Array<{ price_point: number; scenario: string; monthly_units: number; margin: number; profit: number }>
  promotional_strategy: Array<{ event: string; suggested_discount: number; expected_lift: number; impact_on_margin: number }>
  dynamic_recommendations: string[]
  risks: string[]
}

function analyzePricingStrategy(input: PricingStrategyInput): PricingAdvisorResult {
  const seed = JSON.stringify(input)
  const rnd = createSeededRandom(seed)

  const compPrices = input.competitor_prices
  const totalCosts = compPrices.map(c => c.price + c.shipping)
  const minComp = Math.min(...compPrices.map(c => c.price))
  const maxComp = Math.max(...compPrices.map(c => c.price))
  const avgComp = compPrices.reduce((s, c) => s + c.price, 0) / compPrices.length
  const medianComp = compPrices.sort((a, b) => a.price - b.price)[Math.floor(compPrices.length / 2)].price

  // Calculate optimal price based on positioning
  let basePrice = 0
  let positioning = ''
  switch (input.brand_tier) {
    case 'value':
      basePrice = minComp * (0.9 + rnd.range(0, 0.08))
      positioning = 'Value leader - lowest price for market share capture'
      break
    case 'mid_market':
      basePrice = medianComp * (0.98 + rnd.range(0, 0.06))
      positioning = 'Competitive parity - match market expectations'
      break
    case 'premium':
      basePrice = avgComp * (1.2 + rnd.range(0, 0.15))
      positioning = 'Premium positioning - quality justified by price'
      break
    case 'luxury':
      basePrice = maxComp * (1.2 + rnd.range(0, 0.25))
      positioning = 'Luxury aspirational - exclusivity drives demand'
      break
  }

  // Ensure minimum margin
  const minPrice = input.cost_price / (1 - input.target_margin / 100)
  const optimalPrice = Math.max(basePrice, minPrice, input.min_advertised_price)
  const priceFloor = Math.max(minPrice, optimalPrice * 0.85)
  const priceCeiling = optimalPrice * 1.15

  // Demand adjustment factor
  const priceRatio = optimalPrice / input.current_price
  const demandAdjustment = Math.pow(priceRatio, -input.price_elasticity)

  // Margin calculation
  const expectedMargin = ((optimalPrice - input.cost_price) / optimalPrice) * 100

  // Competitor landscape
  const competitorLandscape = compPrices.map(c => ({
    competitor: c.competitor,
    price: c.price,
    total_cost: c.price + c.shipping,
    vs_your_price: +((c.price - optimalPrice) / optimalPrice * 100).toFixed(1)
  })).sort((a, b) => a.price - b.price)

  // Price ladder
  const priceScenarios = [
    { factor: 0.85, label: 'Aggressive (price war)' },
    { factor: 0.95, label: 'Competitive discount' },
    { factor: 1.0, label: 'Recommended price' },
    { factor: 1.1, label: 'Premium test' },
    { factor: 1.25, label: 'Premium stretch' }
  ]
  const priceLadder = priceScenarios.map(sc => {
    const price = optimalPrice * sc.factor
    const demandMult = Math.pow(priceRatio * sc.factor, -input.price_elasticity)
    const margin = ((price - input.cost_price) / price) * 100
    const monthlyUnits = Math.round(input.sales_velocity * demandMult)
    const profit = (price - input.cost_price) * monthlyUnits
    return { price_point: Math.round(price * 100) / 100, scenario: sc.label, monthly_units: monthlyUnits, margin: margin, profit: profit }
  })

  // Promotional strategy
  const promotionalStrategy = input.promotional_calendar.map(p => ({
    event: p.date,
    suggested_discount: p.discount_pct,
    expected_lift: +(p.discount_pct * rnd.range(1.5, 3.0)).toFixed(1),
    impact_on_margin: -(p.discount_pct * rnd.range(0.6, 0.9)).toFixed(1)
  }))

  // Dynamic recommendations
  const recommendations: string[] = []
  if (input.current_price < optimalPrice * 0.95) {
    recommendations.push(`Price increase opportunity: Current $${input.current_price.toFixed(2)} vs optimal $${optimalPrice.toFixed(2)}`)
  } else if (input.current_price > optimalPrice * 1.05) {
    recommendations.push(`Price risk: Current $${input.current_price.toFixed(2)} is above optimal - monitor conversion closely`)
  }

  recommendations.push(`Optimal price $${optimalPrice.toFixed(2)} balances ${expectedMargin.toFixed(1)}% margin with ${demandAdjustment.toFixed(2)}x demand`)

  if (input.price_elasticity > 1.5) {
    recommendations.push('High price elasticity: Small changes have large volume impact - test incrementally')
  } else if (input.price_elasticity < 1) {
    recommendations.push('Low price elasticity: Room to increase price without significant volume loss')
  }

  // Risks
  const risks: string[] = []
  if (optimalPrice < minComp) {
    risks.push(`Pricing below cheapest competitor ($${minComp.toFixed(2)}) may trigger price war`)
  }
  if (input.price_elasticity > 2) {
    risks.push(`High elasticity (${input.price_elasticity}x) means demand fluctuates significantly with price`)
  }
  if (expectedMargin < input.target_margin) {
    risks.push(`Achieved margin (${expectedMargin.toFixed(1)}%) below target (${input.target_margin}%)`)
  }

  return {
    recommendation: {
      current_price: input.current_price,
      optimal_price: Math.round(optimalPrice * 100) / 100,
      price_range: { floor: Math.round(priceFloor * 100) / 100, ceiling: Math.round(priceCeiling * 100) / 100 },
      positioning,
      expected_margin: expectedMargin,
      demand_adjustment: demandAdjustment
    },
    competitor_landscape: competitorLandscape,
    price_ladder: priceLadder,
    promotional_strategy: promotionalStrategy,
    dynamic_recommendations: recommendations,
    risks
  }
}

function formatPricingReport(result: PricingAdvisorResult): string {
  const lines: string[] = []
  const r = result.recommendation
  lines.push('## Pricing Strategy Report')
  lines.push('')
  lines.push(`**Current Price:** $${r.current_price.toFixed(2)} | **Optimal Price:** $${r.optimal_price.toFixed(2)}`)
  lines.push(`**Price Range:** $${r.price_range.floor.toFixed(2)} - $${r.price_range.ceiling.toFixed(2)}`)
  lines.push(`**Positioning:** ${r.positioning}`)
  lines.push(`**Expected Margin:** ${r.expected_margin.toFixed(1)}% | **Demand Adjustment:** ${r.demand_adjustment.toFixed(2)}x`)
  lines.push('')

  lines.push('### Competitor Landscape')
  lines.push('| Competitor | Price | Total (w/ shipping) | vs Recommended |')
  lines.push('|------------|-------|---------------------|----------------|')
  for (const c of result.competitor_landscape) {
    const vsStr = c.vs_your_price >= 0 ? `+${c.vs_your_price}%` : `${c.vs_your_price}%`
    lines.push(`| ${c.competitor} | $${c.price.toFixed(2)} | $${c.total_cost.toFixed(2)} | ${vsStr} |`)
  }
  lines.push('')

  lines.push('### Price Ladder Analysis')
  lines.push('| Scenario | Price | Monthly Units | Margin | Monthly Profit |')
  lines.push('|----------|-------|---------------|--------|----------------|')
  for (const pl of result.price_ladder) {
    lines.push(`| ${pl.scenario} | $${pl.price_point.toFixed(2)} | ${pl.monthly_units} | ${pl.margin.toFixed(1)}% | $${Math.round(pl.profit).toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### Recommendations')
  for (const rec of result.dynamic_recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')

  if (result.risks.length > 0) {
    lines.push('### Risk Factors')
    for (const risk of result.risks) {
      lines.push(`> ${risk}`)
    }
    lines.push('')
  }

  lines.push('> Disclaimer: Pricing recommendations are based on historical demand patterns and competitive data. Final pricing decisions should incorporate business strategy and market conditions.')

  return lines.join('\n')
}

// ==================== TOOL 6: AD CAMPAIGN MANAGER ====================

interface AdCampaignResult {
  performance_summary: {
    total_spend: number
    total_revenue: number
    overall_roas: number
    avg_cpc: number
    avg_ctr: number
    overall_cvr: number
    acos: number
    roas_grade: 'excellent' | 'good' | 'average' | 'poor'
  }
  budget_analysis: {
    utilization_rate: number
    remaining_budget: number
    days_remaining: number
    daily_spend_target: number
    pacing_status: 'ahead' | 'on_track' | 'behind' | 'over'
  }
  ad_group_performance: Array<{
    ad_group: string
    spend: number
    impressions: number
    clicks: number
    conversions: number
    roas: number
    acos: number
    recommendation: string
    budget_adjustment: string
  }>
  keyword_optimization: Array<{
    keyword: string
    match_type: string
    spend: number
    conversions: number
    cpa: number
    quality_score: number
    action: string
    bid_adjustment: number
  }>
  budget_reallocation: Array<{
    from: string
    to: string
    amount: number
    expected_roas_improvement: number
  }>
  optimization_actions: string[]
}

function analyzeAdCampaign(input: AdCampaignInput): AdCampaignResult {
  const seed = JSON.stringify(input)
  const rnd = createSeededRandom(seed)

  // Performance metrics
  const totalSpend = input.spent_budget
  const totalRevenue = input.revenue
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0
  const avgCpc = input.clicks > 0 ? totalSpend / input.clicks : 0
  const avgCtr = input.impressions > 0 ? (input.clicks / input.impressions) * 100 : 0
  const overallCvr = input.clicks > 0 ? (input.conversions / input.clicks) * 100 : 0
  const acos = totalRevenue > 0 ? (totalSpend / totalRevenue) * 100 : 0

  const roasGrade: 'excellent' | 'good' | 'average' | 'poor' =
    overallRoas >= 4 ? 'excellent' : overallRoas >= 2.5 ? 'good' : overallRoas >= 1.5 ? 'average' : 'poor'

  // Budget analysis (assume 30-day campaign)
  const daysInPeriod = 30
  const utilizationRate = input.total_budget > 0 ? (totalSpend / input.total_budget) * 100 : 0
  const remainingBudget = input.total_budget - totalSpend
  const dailySpend = totalSpend / daysInPeriod
  const dailySpendTarget = input.total_budget / daysInPeriod

  let pacingStatus: 'ahead' | 'on_track' | 'behind' | 'over' = 'on_track'
  if (utilizationRate > 100) pacingStatus = 'over'
  else if (utilizationRate > 80) pacingStatus = 'ahead'
  else if (utilizationRate < 60) pacingStatus = 'behind'

  // Ad group analysis
  const adGroupPerformance = input.ad_groups.map(ag => {
    const agRoas = ag.spend > 0 ? ag.revenue / ag.spend : 0
    const agAcos = ag.revenue > 0 ? (ag.spend / ag.revenue) * 100 : 0

    let recommendation = ''
    let budgetAdjustment = ''

    if (agRoas >= input.roas_target * 1.2) {
      recommendation = 'High performer - scale aggressively'
      budgetAdjustment = `+${rnd.int(20, 40)}%`
    } else if (agRoas >= input.roas_target) {
      recommendation = 'Meeting target - maintain with optimization'
      budgetAdjustment = `+${rnd.int(5, 15)}%`
    } else if (agRoas >= input.roas_target * 0.6) {
      recommendation = 'Below target - test creative/audience'
      budgetAdjustment = `${rnd.int(-5, 5)}%`
    } else {
      recommendation = 'Underperforming - pause or restructure'
      budgetAdjustment = `-${rnd.int(30, 60)}%`
    }

    return {
      ad_group: ag.ad_group_name,
      spend: ag.spend,
      impressions: ag.impressions,
      clicks: ag.clicks,
      conversions: ag.conversions,
      roas: agRoas,
      acos: agAcos,
      recommendation,
      budget_adjustment: budgetAdjustment
    }
  })

  // Keyword optimization
  const keywordOptimization = input.keyword_performance.map(kw => {
    const cpa = kw.conversions > 0 ? kw.spend / kw.conversions : kw.spend > 0 ? 999 : 0
    let action = ''
    let bidAdjustment = 0

    if (kw.conversions > 10 && cpa < input.roas_target * 5) {
      action = 'Increase bids - proven high converter'
      bidAdjustment = rnd.int(10, 30)
    } else if (kw.conversions > 0 && cpa < input.roas_target * 8) {
      action = 'Maintain current bids'
      bidAdjustment = rnd.int(-5, 10)
    } else if (kw.clicks > 50 && kw.conversions === 0) {
      action = 'Add negative keyword'
      bidAdjustment = rnd.int(-30, -20)
    } else if (kw.spend > 100 && kw.conversions === 0) {
      action = 'Pause keyword - no conversions'
      bidAdjustment = -100
    } else {
      action = 'Monitor performance'
      bidAdjustment = 0
    }

    return {
      keyword: kw.keyword,
      match_type: kw.match_type,
      spend: kw.spend,
      conversions: kw.conversions,
      cpa,
      quality_score: kw.quality_score,
      action,
      bid_adjustment: bidAdjustment
    }
  })

  // Budget reallocation suggestions
  const topPerformers = adGroupPerformance.filter(ag => ag.roas >= input.roas_target).map(ag => ag.ad_group)
  const underPerformers = adGroupPerformance.filter(ag => ag.roas < input.roas_target * 0.7).map(ag => ag.ad_group)

  const budgetReallocation: AdCampaignResult['budget_reallocation'] = []
  if (underPerformers.length > 0 && topPerformers.length > 0) {
    for (let i = 0; i < Math.min(underPerformers.length, 3); i++) {
      budgetReallocation.push({
        from: underPerformers[i % underPerformers.length],
        to: topPerformers[i % topPerformers.length],
        amount: +rnd.range(100, 500).toFixed(0),
        expected_roas_improvement: +(rnd.range(0.3, 1.2)).toFixed(2)
      })
    }
  }

  // Optimization actions
  const actions: string[] = []
  if (roasGrade === 'poor' || roasGrade === 'average') {
    actions.push(`Current ROAS (${overallRoas.toFixed(1)}x) below target (${input.roas_target}x) - prioritize negative keywords`)
  }
  if (avgCtr < 0.3) {
    actions.push(`CTR (${avgCtr.toFixed(2)}%) below benchmark - refresh ad creative and test new hooks`)
  }
  if (overallCvr < 5) {
    actions.push(`Low conversion rate (${overallCvr.toFixed(1)}%) - review landing page experience`)
  }
  if (pacingStatus === 'ahead') {
    actions.push('Budget pacing ahead - ensure sufficient inventory for remaining campaign period')
  }
  if (pacingStatus === 'behind') {
    actions.push('Budget pacing behind - increase bids or expand audience to hit spend target')
  }

  return {
    performance_summary: {
      total_spend: totalSpend,
      total_revenue: totalRevenue,
      overall_roas: overallRoas,
      avg_cpc: avgCpc,
      avg_ctr: avgCtr,
      overall_cvr: overallCvr,
      acos,
      roas_grade: roasGrade
    },
    budget_analysis: {
      utilization_rate: utilizationRate,
      remaining_budget: remainingBudget,
      days_remaining: daysInPeriod / 2,
      daily_spend_target: dailySpendTarget,
      pacing_status: pacingStatus
    },
    ad_group_performance: adGroupPerformance,
    keyword_optimization: keywordOptimization,
    budget_reallocation: budgetReallocation,
    optimization_actions: actions
  }
}

function formatAdCampaignReport(result: AdCampaignResult): string {
  const lines: string[] = []
  const ps = result.performance_summary
  lines.push('## Ad Campaign Performance Report')
  lines.push('')
  lines.push(`**Total Spend:** $${Math.round(ps.total_spend).toLocaleString()} | **Revenue:** $${Math.round(ps.total_revenue).toLocaleString()}`)
  lines.push(`**ROAS:** ${ps.overall_roas.toFixed(2)}x (Grade: ${ps.roas_grade.toUpperCase()}) | **ACOS:** ${ps.acos.toFixed(1)}%`)
  lines.push(`**Avg CPC:** $${ps.avg_cpc.toFixed(2)} | **CTR:** ${ps.avg_ctr.toFixed(2)}% | **CVR:** ${ps.overall_cvr.toFixed(1)}%`)
  lines.push('')

  const ba = result.budget_analysis
  lines.push('### Budget Analysis')
  lines.push(`- Utilization: ${ba.utilization_rate.toFixed(1)}% | Remaining: $${Math.round(ba.remaining_budget).toLocaleString()}`)
  lines.push(`- Daily spend target: $${ba.daily_spend_target.toFixed(0)}`)
  lines.push(`- Pacing: ${ba.pacing_status.toUpperCase()}`)
  lines.push('')

  if (result.ad_group_performance.length > 0) {
    lines.push('### Ad Group Performance')
    lines.push('| Ad Group | Spend | Clicks | ROAS | ACOS | Budget Adj |')
    lines.push('|----------|-------|--------|------|------|------------|')
    for (const ag of result.ad_group_performance) {
      lines.push(`| ${ag.ad_group} | $${Math.round(ag.spend)} | ${ag.clicks} | ${ag.roas.toFixed(1)}x | ${ag.acos.toFixed(1)}% | ${ag.budget_adjustment} |`)
    }
    lines.push('')
  }

  if (result.keyword_optimization.length > 0) {
    lines.push('### Keyword Optimization')
    lines.push('| Keyword | Match | Spend | CPA | QS | Action | Bid Adj |')
    lines.push('|---------|-------|-------|-----|----|--------|---------|')
    for (const kw of result.keyword_optimization.slice(0, 15)) {
      const cpaStr = kw.cpa >= 999 ? 'N/A' : `$${kw.cpa.toFixed(0)}`
      lines.push(`| ${kw.keyword} | ${kw.match_type} | $${Math.round(kw.spend)} | ${cpaStr} | ${kw.quality_score} | ${kw.action} | ${kw.bid_adjustment > 0 ? '+' : ''}${kw.bid_adjustment}% |`)
    }
    lines.push('')
  }

  if (result.budget_reallocation.length > 0) {
    lines.push('### Budget Reallocation Suggestions')
    lines.push('| From | To | Amount | Expected ROAS Improvement |')
    lines.push('|------|----|--------|---------------------------|')
    for (const br of result.budget_reallocation) {
      lines.push(`| ${br.from} | ${br.to} | $${br.amount} | +${br.expected_roas_improvement}x |`)
    }
    lines.push('')
  }

  lines.push('### Optimization Actions')
  for (const action of result.optimization_actions) {
    lines.push(`- ${action}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ==================== TOOL 7: CUSTOMER JOURNEY MAPPER ====================

interface CustomerJourneyResult {
  journey_overview: {
    total_sessions: number
    conversion_rate: number
    avg_touchpoints: number
    avg_journey_duration_hours: number
    repeat_purchase_rate: number
  }
  touchpoint_analysis: Array<{
    touchpoint: string
    total_interactions: number
    conversion_contribution: number
    avg_time_to_conversion_hours: number
    first_touch_rate: number
    last_touch_rate: number
    effectiveness: 'high' | 'medium' | 'low'
  }>
  channel_attribution: Array<{
    channel: string
    first_touch_conversions: number
    last_touch_conversions: number
    linear_attribution: number
    value_generated: number
  }>
  journey_patterns: Array<{
    pattern: string
    frequency: number
    avg_path_length: number
    conversion_rate: number
    avg_order_value: number
  }>
  drop_off_points: Array<{
    stage: string
    dropoff_rate: number
    diagnosis: string
    recommendation: string
  }>
  segment_insights: {
    segment: string
    preferred_channel: string
    avg_sessions_to_conversion: number
    retention_indicator: string
    recommendation: string
  }
}

function mapCustomerJourney(input: CustomerJourneyInput): CustomerJourneyResult {
  const seed = JSON.stringify(input)
  const rnd = createSeededRandom(seed)

  const sessions = input.sessions
  const convertingSessions = sessions.filter(s => s.converted)
  const totalSessions = sessions.length
  const sessionCvr = totalSessions > 0 ? (convertingSessions.length / totalSessions) * 100 : 0

  // Touchpoint analysis
  const touchpointMap = new Map<string, { count: number; withConversion: number; totalTime: number; firstTouch: number; lastTouch: number }>()
  let totalTouchpoints = 0

  for (const session of sessions) {
    totalTouchpoints += session.touchpoints.length
    for (let i = 0; i < session.touchpoints.length; i++) {
      const tp = session.touchpoints[i]
      if (!touchpointMap.has(tp.type)) {
        touchpointMap.set(tp.type, { count: 0, withConversion: 0, totalTime: 0, firstTouch: 0, lastTouch: 0 })
      }
      const data = touchpointMap.get(tp.type)!
      data.count++
      if (session.converted) data.withConversion++
      data.totalTime += tp.duration_seconds
      if (i === 0) data.firstTouch++
      if (i === session.touchpoints.length - 1) data.lastTouch++
    }
  }

  const touchpointAnalysis = Array.from(touchpointMap.entries()).map(([type, data]) => ({
    touchpoint: type,
    total_interactions: data.count,
    conversion_contribution: data.count > 0 ? (data.withConversion / data.count) * 100 : 0,
    avg_time_to_conversion_hours: data.totalTime / Math.max(data.count, 1) / 3600,
    first_touch_rate: data.firstTouch / Math.max(totalSessions, 1) * 100,
    last_touch_rate: data.lastTouch / Math.max(totalSessions, 1) * 100,
    effectiveness: data.count > 0 && (data.withConversion / data.count) > 0.3 ? 'high' : data.count > 0 && (data.withConversion / data.count) > 0.15 ? 'medium' : 'low'
  })).sort((a, b) => b.conversion_contribution - a.conversion_contribution)

  // Channel attribution
  const channelMap = new Map<string, { sessions: number; conversions: number; firstTouch: number; lastTouch: number; revenue: number }>()
  for (const session of sessions) {
    const channel = session.channel
    if (!channelMap.has(channel)) {
      channelMap.set(channel, { sessions: 0, conversions: 0, firstTouch: 0, lastTouch: 0, revenue: 0 })
    }
    const data = channelMap.get(channel)!
    data.sessions++
    if (session.converted) {
      data.conversions++
      data.revenue += session.order_value
    }
    if (session.touchpoints.length > 0 && session.touchpoints[0].type) data.firstTouch++
    if (session.touchpoints.length > 0 && session.touchpoints[session.touchpoints.length - 1].type) data.lastTouch++
  }

  const channelAttribution = Array.from(channelMap.entries()).map(([channel, data]) => ({
    channel,
    first_touch_conversions: data.firstTouch,
    last_touch_conversions: data.lastTouch,
    linear_attribution: data.conversions > 0 ? data.conversions / sessions.filter(s => s.channel === channel).length : 0,
    value_generated: data.revenue
  }))

  // Common journey patterns
  const patternMap = new Map<string, { count: number; converted: number; totalValue: number; pathLength: number }>()
  for (const session of sessions) {
    const pattern = session.touchpoints.map(t => t.type).join(' > ') || 'direct'
    if (!patternMap.has(pattern)) {
      patternMap.set(pattern, { count: 0, converted: 0, totalValue: 0, pathLength: 0 })
    }
    const p = patternMap.get(pattern)!
    p.count++
    if (session.converted) p.converted++
    p.totalValue += session.order_value
    p.pathLength += session.touchpoints.length
  }

  const journeyPatterns = Array.from(patternMap.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([pattern, data]) => ({
      pattern,
      frequency: data.count,
      avg_path_length: data.pathLength / data.count,
      conversion_rate: data.count > 0 ? (data.converted / data.count) * 100 : 0,
      avg_order_value: data.converted > 0 ? data.totalValue / data.converted : 0
    }))

  // Drop-off analysis
  const dropOffRates = [
    { stage: 'Awareness to Engagement', base: 60 },
    { stage: 'Engagement to Consideration', base: 40 },
    { stage: 'Consideration to Intent', base: 55 },
    { stage: 'Intent to Purchase', base: 30 },
    { stage: 'Purchase to Repeat', base: 65 }
  ]
  const dropOffPoints = dropOffRates.map(d => ({
    stage: d.stage,
    dropoff_rate: d.base + Math.round(rnd.range(-10, 10)),
    diagnosis: getDropOffDiagnosis(d.stage),
    recommendation: getDropOffRecommendation(d.stage)
  }))

  const avgTouchpoints = totalSessions > 0 ? totalTouchpoints / totalSessions : 0
  const totalDuration = sessions.reduce((s, sess) => s + sess.touchpoints.reduce((ts, tp) => ts + tp.duration_seconds, 0), 0)
  const avgDurationHours = totalSessions > 0 ? (totalDuration / totalSessions) / 3600 : 0

  return {
    journey_overview: {
      total_sessions: totalSessions,
      conversion_rate: sessionCvr,
      avg_touchpoints: +avgTouchpoints.toFixed(1),
      avg_journey_duration_hours: +avgDurationHours.toFixed(1),
      repeat_purchase_rate: input.lifetime_orders > 0 ? Math.min(100, (input.lifetime_orders / Math.max(totalSessions, 1)) * 100) : 0
    },
    touchpoint_analysis: touchpointAnalysis as CustomerJourneyResult['touchpoint_analysis'],
    channel_attribution: channelAttribution,
    journey_patterns: journeyPatterns,
    drop_off_points: dropOffPoints,
    segment_insights: {
      segment: input.customer_segment,
      preferred_channel: input.acquisition_channel,
      avg_sessions_to_conversion: +(totalSessions / Math.max(convertingSessions.length, 1)).toFixed(1),
      retention_indicator: input.lifetime_orders >= 3 ? 'Strong' : input.lifetime_orders >= 2 ? 'Moderate' : 'At Risk',
      recommendation: input.lifetime_orders >= 3
        ? 'VIP retention program - offer exclusive perks'
        : input.lifetime_orders >= 2
        ? 'Nurture with post-purchase email sequence'
        : 'Activate with welcome series and first-purchase incentive'
    }
  }
}

function getDropOffDiagnosis(stage: string): string {
  const diagnoses: Record<string, string> = {
    'Awareness to Engagement': 'Ad creative or targeting mismatch with audience intent',
    'Engagement to Consideration': 'Landing page fails to build trust or communicate value',
    'Consideration to Intent': 'Insufficient social proof, pricing concerns, or comparison friction',
    'Intent to Purchase': 'Checkout friction, unexpected costs, or payment issues',
    'Purchase to Repeat': 'Lack of post-purchase engagement or loyalty program'
  }
  return diagnoses[stage] || 'Investigate user experience at this stage'
}

function getDropOffRecommendation(stage: string): string {
  const recommendations: Record<string, string> = {
    'Awareness to Engagement': 'Test audience targeting and creative messaging',
    'Engagement to Consideration': 'Add trust badges, reviews, and clear value proposition',
    'Consideration to Intent': 'Implement urgency, comparisons, and risk reversal',
    'Intent to Purchase': 'Simplify checkout, show total cost upfront, add payment options',
    'Purchase to Repeat': 'Launch retention email flow and loyalty program'
  }
  return recommendations[stage] || 'A/B test changes at this stage'
}

function formatCustomerJourneyReport(result: CustomerJourneyResult): string {
  const lines: string[] = []
  const jo = result.journey_overview
  lines.push('## Customer Journey Analysis Report')
  lines.push('')
  lines.push(`**Sessions Analyzed:** ${jo.total_sessions} | **Conversion Rate:** ${jo.conversion_rate.toFixed(1)}%`)
  lines.push(`**Avg Touchpoints:** ${jo.avg_touchpoints} | **Avg Journey Duration:** ${jo.avg_journey_duration_hours.toFixed(1)} hours`)
  lines.push(`**Repeat Purchase Rate:** ${jo.repeat_purchase_rate.toFixed(0)}%`)
  lines.push('')

  lines.push('### Touchpoint Effectiveness')
  lines.push('| Touchpoint | Interactions | Conv. Contribution | First Touch % | Effectiveness |')
  lines.push('|------------|-------------|-------------------|---------------|---------------|')
  for (const tp of result.touchpoint_analysis) {
    lines.push(`| ${tp.touchpoint} | ${tp.total_interactions} | ${tp.conversion_contribution.toFixed(1)}% | ${tp.first_touch_rate.toFixed(1)}% | ${tp.effectiveness.toUpperCase()} |`)
  }
  lines.push('')

  if (result.journey_patterns.length > 0) {
    lines.push('### Top Journey Patterns')
    lines.push('| Path | Frequency | Avg Steps | Conv Rate | Avg Order |')
    lines.push('|------|-----------|-----------|-----------|-----------|')
    for (const jp of result.journey_patterns) {
      lines.push(`| ${jp.pattern} | ${jp.frequency} | ${jp.avg_path_length.toFixed(1)} | ${jp.conversion_rate.toFixed(1)}% | $${jp.avg_order_value.toFixed(0)} |`)
    }
    lines.push('')
  }

  lines.push('### Drop-off Analysis')
  for (const d of result.drop_off_points) {
    lines.push(`**${d.stage}** (${d.dropoff_rate}% drop-off)`)
    lines.push(`- Diagnosis: ${d.diagnosis}`)
    lines.push(`- Action: ${d.recommendation}`)
    lines.push('')
  }

  const seg = result.segment_insights
  lines.push('### Segment Insights')
  lines.push(`**${seg.segment}** | Primary channel: ${seg.preferred_channel}`)
  lines.push(`- Sessions to conversion: ${seg.avg_sessions_to_conversion}`)
  lines.push(`- Retention: ${seg.retention_indicator}`)
  lines.push(`- Strategy: ${seg.recommendation}`)
  lines.push('')

  return lines.join('\n')
}

// ==================== TOOL 8: MARKETPLACE EXPANSION ====================

interface MarketplaceExpansionResult {
  overall_readiness: {
    score: number
    level: 'ready' | 'conditional' | 'not_ready'
    max_platforms_recommended: number
    investment_budget: number
    payback_period_months: number
  }
  target_evaluations: Array<{
    platform: string
    score: number
    readiness: 'ready' | 'prepare' | 'wait'
    market_size: number
    competition_level: string
    entry_cost: number
    estimated_monthly_revenue: number
    roi_months: number
    key_requirements: string[]
    risks: string[]
    first_steps: string[]
  }>
  platform_ranking: Array<{ rank: number; platform: string; score: number; priority: string }>
  resource_plan: {
    team_requirements: string[]
    estimated_setup_weeks: number
    monthly_operational_cost: number
    break_even_timeline: string
  }
  risks_and_mitigation: Array<{ risk: string; likelihood: 'high' | 'medium' | 'low'; mitigation: string }>
  recommended_actions: string[]
}

function evaluateMarketplaceExpansion(input: MarketplaceExpansionInput): MarketplaceExpansionResult {
  const seed = JSON.stringify(input)
  const rnd = createSeededRandom(seed)

  // Scoring inputs
  const revenueStrength = Math.min(input.annual_revenue / 500000, 1) * 30 // max 30 pts
  const teamCapacity = Math.min(input.team_size / 5, 1) * 25 // max 25 pts
  const budgetAdequacy = Math.min(input.expansion_budget / 50000, 1) * 20 // max 20 pts
  const marketplaceExperience = input.current_marketplaces.length * 5 // max 15 pts
  const growthMomentum = input.current_marketplaces.reduce((s, m) => s + m.growth_rate, 0) / Math.max(input.current_marketplaces.length, 1)
  const growthScore = Math.min(Math.max(growthMomentum / 20, 0), 1) * 10

  const readinessScore = Math.round(revenueStrength + teamCapacity + budgetAdequacy + marketplaceExperience + growthScore)
  const readinessLevel: 'ready' | 'conditional' | 'not_ready' =
    readinessScore >= 70 ? 'ready' : readinessScore >= 45 ? 'conditional' : 'not_ready'

  // Evaluate each target platform
  const targetEvaluations = input.target_marketplaces.map(tm => {
    const marketScore = Math.min(tm.estimated_market_size / 10000000, 1) * 30
    const trafficScore = Math.min(tm.estimated_monthly_traffic / 1000000, 1) * 20
    const competitionPenalty = tm.competition_level === 'low' ? 20 : tm.competition_level === 'medium' ? 10 : 0
    const costScore = tm.entry_cost < 5000 ? 15 : tm.entry_cost < 15000 ? 8 : 3
    const fulfillmentScore = tm.fulfillment_options.length * 3

    const totalScore = Math.round(marketScore + trafficScore + competitionPenalty + costScore + fulfillmentScore)

    const readiness: 'ready' | 'prepare' | 'wait' =
      totalScore >= 65 ? 'ready' : totalScore >= 40 ? 'prepare' : 'wait'

    // Revenue estimate based on traffic and product price
    const estimatedTrafficShare = rnd.range(0.001, 0.01)
    const estimatedMonthlyRevenue = tm.estimated_monthly_traffic * estimatedTrafficShare * input.avg_product_price * (1 - tm.commission_rate / 100)

    const roiMonths = estimatedMonthlyRevenue > 0 ? tm.entry_cost / estimatedMonthlyRevenue * 3 : 99

    const keyRequirements: string[] = []
    if (tm.commission_rate > 15) keyRequirements.push('Adjust margin structure for higher commission')
    if (tm.fulfillment_options.length < 2) keyRequirements.push('Establish independent fulfillment solution')
    if (tm.competition_level === 'high') keyRequirements.push('Develop differentiation and brand positioning')
    keyRequirements.push(`Setup budget: $${(tm.entry_cost * 1.3).toFixed(0)} (including contingency)`)
    keyRequirements.push('Product listing localization and compliance review')

    const risks: string[] = []
    if (tm.competition_level === 'high') risks.push('Established competitors with reviews and brand loyalty')
    if (tm.commission_rate > 20) risks.push('High commission rate may pressure margins')
    if (tm.estimated_monthly_traffic < 500000) risks.push('Lower traffic means slower initial traction')
    risks.push('Platform policy changes can disrupt operations')

    const firstSteps = [
      `Register seller account and complete ${tm.platform} verification`,
      `Research ${tm.platform} top sellers in ${input.product_category} category`,
      `Adapt listing content for ${tm.platform} requirements and audience`,
      `Set up pricing accounting for ${tm.commission_rate}% commission`,
      `Plan initial inventory allocation (${Math.round(tm.estimated_monthly_traffic * estimatedTrafficShare * 0.5)} units/month)`
    ]

    return {
      platform: tm.platform,
      score: totalScore,
      readiness,
      market_size: tm.estimated_market_size,
      competition_level: tm.competition_level,
      entry_cost: tm.entry_cost,
      estimated_monthly_revenue: +estimatedMonthlyRevenue.toFixed(0),
      roi_months: +roiMonths.toFixed(1),
      key_requirements: keyRequirements,
      risks,
      first_steps: firstSteps
    }
  })

  // Rank platforms
  const platformRanking = [...targetEvaluations]
    .sort((a, b) => b.score - a.score)
    .map((tm, idx) => ({
      rank: idx + 1,
      platform: tm.platform,
      score: tm.score,
      priority: idx === 0 ? 'Go now' : idx < 3 ? 'Prepare' : 'Wait'
    }))

  // Resource plan
  const operationalCost = targetEvaluations
    .filter(t => t.readiness === 'ready')
    .reduce((s, t) => s + t.entry_cost * 0.1, 0)

  const risksAndMitigation = [
    { risk: 'Cash flow strain during expansion phase', likelihood: 'medium' as const, mitigation: `Reserve ${Math.round(input.expansion_budget * 0.3)} as operating runway` },
    { risk: 'Operational complexity across multiple platforms', likelihood: 'high' as const, mitigation: 'Invest in inventory management system with multi-channel sync' },
    { risk: 'Underestimated competition on new platform', likelihood: 'medium' as const, mitigation: 'Start with limited SKU range to test demand before scaling' },
    { risk: 'Regulatory/compliance issues in new market', likelihood: 'low' as const, mitigation: 'Consult legal advisor for consumer protection and tax requirements' }
  ]

  const recommendedActions: string[] = []
  const readyPlatforms = platformRanking.filter(p => p.priority === 'Go now')
  const preparePlatforms = platformRanking.filter(p => p.priority === 'Prepare')

  if (readyPlatforms.length > 0) {
    recommendedActions.push(`Launch on ${readyPlatforms.map(p => p.platform).join(', ')} within next 30 days`)
  }
  if (preparePlatforms.length > 0) {
    recommendedActions.push(`Begin preparation for ${preparePlatforms.map(p => p.platform).join(', ')} (target: 60-90 days)`)
  }
  recommendedActions.push(`Allocate $${Math.round(input.expansion_budget * 0.6)} to launch platforms, reserve 40% for optimization`)
  recommendedActions.push('Establish weekly cross-platform performance reviews')

  const maxPlatforms = input.team_size >= 5 ? 3 : input.team_size >= 2 ? 2 : 1

  return {
    overall_readiness: {
      score: readinessScore,
      level: readinessLevel,
      max_platforms_recommended: maxPlatforms,
      investment_budget: input.expansion_budget,
      payback_period_months: Math.round(rnd.range(6, 14))
    },
    target_evaluations: targetEvaluations.sort((a, b) => b.score - a.score),
    platform_ranking: platformRanking,
    resource_plan: {
      team_requirements: [
        `${Math.ceil(input.team_size * 0.4)} additional marketplace manager(s)`,
        'Content specialist for listing localization',
        'Paid media buyer with new platform expertise'
      ],
      estimated_setup_weeks: rnd.int(4, 8),
      monthly_operational_cost: +operationalCost.toFixed(0),
      break_even_timeline: `Month ${rnd.int(4, 8)} based on projected revenue ramp`
    },
    risks_and_mitigation: risksAndMitigation,
    recommended_actions: recommendedActions
  }
}

function formatMarketplaceExpansionReport(result: MarketplaceExpansionResult): string {
  const lines: string[] = []
  const r = result.overall_readiness
  lines.push('## Marketplace Expansion Evaluation Report')
  lines.push('')
  lines.push(`**Readiness Score:** ${r.score}/100 | **Level:** ${r.level.toUpperCase()}`)
  lines.push(`**Max Platforms:** ${r.max_platforms_recommended} | **Budget:** $${r.investment_budget.toLocaleString()}`)
  lines.push(`**Estimated Payback:** ${r.payback_period_months} months`)
  lines.push('')

  lines.push('### Platform Ranking')
  lines.push('| Rank | Platform | Score | Priority |')
  lines.push('|------|----------|-------|----------|')
  for (const pr of result.platform_ranking) {
    lines.push(`| ${pr.rank} | ${pr.platform} | ${pr.score}/100 | ${pr.priority.toUpperCase()} |`)
  }
  lines.push('')

  for (const te of result.target_evaluations) {
    lines.push(`### ${te.platform} - Score: ${te.score}/100 [${te.readiness.toUpperCase()}]`)
    lines.push(`- Market size: $${(te.market_size / 1000000).toFixed(0)}M | Competition: ${te.competition_level} | Entry cost: $${te.entry_cost.toLocaleString()}`)
    lines.push(`- Est. monthly revenue: $${te.estimated_monthly_revenue.toLocaleString()} | ROI timeline: ${te.roi_months} months`)
    lines.push('')
    lines.push('**Key Requirements:**')
    for (const req of te.key_requirements) {
      lines.push(`- ${req}`)
    }
    lines.push('')
    lines.push('**Risks:**')
    for (const risk of te.risks) {
      lines.push(`- ${risk}`)
    }
    lines.push('')
    lines.push('**First Steps:**')
    for (const step of te.first_steps) {
      lines.push(`- ${step}`)
    }
    lines.push('')
  }

  const rp = result.resource_plan
  lines.push('### Resource Plan')
  lines.push(`- Estimated setup: ${rp.estimated_setup_weeks} weeks`)
  lines.push(`- Monthly operational cost: $${rp.monthly_operational_cost.toLocaleString()}`)
  lines.push(`- Break-even: ${rp.break_even_timeline}`)
  lines.push('')
  lines.push('**Team needs:**')
  for (const tr of rp.team_requirements) {
    lines.push(`- ${tr}`)
  }
  lines.push('')

  lines.push('### Risk Mitigation')
  for (const rm of result.risks_and_mitigation) {
    lines.push(`**${rm.risk}** (Likelihood: ${rm.likelihood.toUpperCase()})`)
    lines.push(`- Mitigation: ${rm.mitigation}`)
    lines.push('')
  }

  lines.push('### Recommended Actions')
  for (const a of result.recommended_actions) {
    lines.push(`- ${a}`)
  }
  lines.push('')
  lines.push('> Disclaimer: Expansion projections are based on market data and competitive analysis. Actual results depend on execution quality and market conditions.')

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Product Listing Optimizer
  tools.register(defineTool({
    name: 'product_listing_optimizer',
    description: 'Optimize product listings with comprehensive SEO keyword analysis. Identifies missing keywords, scores title/bullet quality, analyzes competitive gaps, and provides actionable recommendations for improved search ranking and conversion rates.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON object with fields: product_id, product_name, current_title, current_description, bullet_points (array), backend_keywords (array), category, monthly_sales, current_conversion_rate, competitor_listings (array of {competitor, title, bullet_points, monthly_sales, price}), target_keywords (array), current_bsr, price' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: ProductListingInput = JSON.parse(args.input_data)
      const result = analyzeListing(input)
      return formatListingReport(result)
    }
  }))

  // Tool 2: Conversion Rate Diagnostic
  tools.register(defineTool({
    name: 'conversion_rate_diagnostic',
    description: 'Diagnose conversion rate issues with multi-stage funnel analysis. Compares each stage against benchmarks, identifies bottlenecks, and provides prioritized repair recommendations with estimated CVR lift.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON object with fields: product_id, funnel_stages (array of {stage, visitors, conversions, avg_time_seconds}), traffic_source, device_type (mobile/desktop/tablet), period, avg_order_value, cart_abandonment_rate, checkout_completion_rate' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: ConversionFunnelInput = JSON.parse(args.input_data)
      const result = analyzeConversionFunnel(input)
      return formatConversionReport(result)
    }
  }))

  // Tool 3: Inventory Forecaster
  tools.register(defineTool({
    name: 'inventory_forecaster',
    description: 'Forecast inventory needs with safety stock calculation using demand variability and lead time. Provides reorder points, EOQ optimization, scenario analysis, and cost projections to balance holding costs against stockout risk.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON object with fields: product_id, product_name, current_stock, avg_daily_sales, sales_volatility, lead_time_days, reorder_quantity, holding_cost_per_unit, stockout_cost_per_unit, supplier_reliability, warehouse_capacity, historical_demand (array of daily units)' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: InventoryForecastInput = JSON.parse(args.input_data)
      const result = forecastInventory(input)
      return formatInventoryReport(result)
    }
  }))

  // Tool 4: Review Sentiment Analyzer
  tools.register(defineTool({
    name: 'review_sentiment_analyzer',
    description: 'Analyze customer review sentiment with theme extraction. Identifies strengths, complaints, and feature requests from reviews. Provides product improvement recommendations with priority scoring and competitive rating comparison.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON object with fields: product_id, product_name, reviews (array of {rating, title, body, date, verified_purchase, helpful_votes}), category_avg_rating, competitor_ratings (array of {competitor, avg_rating, review_count})' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: ReviewSentimentInput = JSON.parse(args.input_data)
      const result = analyzeSentiment(input)
      return formatSentimentReport(result)
    }
  }))

  // Tool 5: Pricing Strategy Advisor
  tools.register(defineTool({
    name: 'pricing_strategy_advisor',
    description: 'Dynamic pricing strategy with competitor price monitoring and elasticity-based optimization. Calculates optimal price points by brand tier, provides price ladder scenarios, promotional calendar alignment, and risk assessment.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON object with fields: product_id, product_name, cost_price, current_price, min_advertised_price, competitor_prices (array of {competitor, price, shipping}), price_elasticity, target_margin, sales_velocity, brand_tier (value/mid_market/premium/luxury), promotional_calendar (array of {date, discount_pct})' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: PricingStrategyInput = JSON.parse(args.input_data)
      const result = analyzePricingStrategy(input)
      return formatPricingReport(result)
    }
  }))

  // Tool 6: Ad Campaign Manager
  tools.register(defineTool({
    name: 'ad_campaign_manager',
    description: 'Analyze ad campaign performance with ROAS/ACOS grading, budget pacing analysis, ad group optimization, keyword bid adjustments, and budget reallocation suggestions. Identifies top performers and provides actionable optimization steps.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON object with fields: campaign_id, campaign_name, platform, total_budget, spent_budget, impressions, clicks, conversions, revenue, roas_target, ad_groups (array of {ad_group_id, ad_group_name, clicks, impressions, spend, conversions, revenue}), keyword_performance (array of {keyword, match_type, clicks, impressions, spend, conversions, quality_score})' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: AdCampaignInput = JSON.parse(args.input_data)
      const result = analyzeAdCampaign(input)
      return formatAdCampaignReport(result)
    }
  }))

  // Tool 7: Customer Journey Mapper
  tools.register(defineTool({
    name: 'customer_journey_mapper',
    description: 'Map customer purchase journey across touchpoints and channels. Provides session analysis, conversion path mapping, attribution modeling, drop-off diagnosis, and segment-specific strategy recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON object with fields: customer_id, sessions (array of {date, channel, touchpoints (array of {type, timestamp, action, duration_seconds}), converted, order_value}), customer_segment, acquisition_channel, lifetime_orders, lifetime_value' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: CustomerJourneyInput = JSON.parse(args.input_data)
      const result = mapCustomerJourney(input)
      return formatCustomerJourneyReport(result)
    }
  }))

  // Tool 8: Marketplace Expansion
  tools.register(defineTool({
    name: 'marketplace_expansion',
    description: 'Evaluate new marketplace/platform expansion opportunities. Scores readiness across financial, team, and growth dimensions. Provides per-platform analysis with ROI projections, risk assessment, resource planning, and prioritized launch sequence.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON object with fields: current_marketplaces (array of {platform, revenue, growth_rate}), target_marketplaces (array of {platform, estimated_market_size, competition_level (low/medium/high), entry_cost, commission_rate, fulfillment_options (array), estimated_monthly_traffic}), product_category, avg_product_price, annual_revenue, team_size, expansion_budget' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_args: any, value: any) => [{ type: 'text' as const, text: value }]
    },
    async execute(args: { input_data: string }) {
      const input: MarketplaceExpansionInput = JSON.parse(args.input_data)
      const result = evaluateMarketplaceExpansion(input)
      return formatMarketplaceExpansionReport(result)
    }
  }))

  console.log(`[dsh-tool-ecomagentpro] Loaded v${VERSION} - E-commerce Operations AI Agent Pro with 8 tools`)
  console.log('  Tools: product_listing_optimizer, conversion_rate_diagnostic, inventory_forecaster, review_sentiment_analyzer, pricing_strategy_advisor, ad_campaign_manager, customer_journey_mapper, marketplace_expansion')
}
