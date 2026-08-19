/**
 * DSH E-commerce Competitor Intelligence Plugin v0.1.0
 *
 * Competitor pricing, product trends, reviews, and market positioning toolkit for DeepSeek Harness Agent.
 * Designed for e-commerce managers, marketplace sellers, brand managers, and digital marketers.
 *
 * Features (v0.1.0):
 * - Competitor Price Tracker (pricing change analysis with trend detection)
 * - Product Review Analyzer (sentiment scoring and theme extraction)
 * - Keyword Ranking Monitor (search rank tracking with opportunity identification)
 * - Listing Quality Scorer (product listing quality assessment with recommendations)
 * - Trend Forecaster (category trend forecasting with growth predictions)
 * - Ad Spend Estimator (competitor advertising spend analysis with channel breakdown)
 * - Market Share Analyzer (market share distribution and competitive positioning)
 * - Pricing Strategy Advisor (optimal pricing recommendations with profit projections)
 *
 * @module dsh-tool-ecomintel
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-ecomintel'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface PriceChangeData {
  competitor: string
  product_id: string
  product_name: string
  current_price: number
  previous_price: number
  timestamp: string
}

interface ReviewData {
  product_id: string
  rating: number
  text: string
  date: string
}

interface RankingData {
  keyword: string
  platform: string
  current_rank: number
  previous_rank: number
  search_volume: number
}

interface ListingData {
  product_id: string
  title_length: number
  bullet_count: number
  image_count: number
  has_video: boolean
  description_length: number
  has_a_plus: boolean
}

interface TrendData {
  category: string
  monthly_sales: number
  search_volume: number
  seasonality_index: number
}

interface AdSpendData {
  competitor: string
  platform: string
  estimated_impressions: number
  estimated_clicks: number
  cpc_estimate: number
}

interface MarketData {
  brand: string
  revenue: number
  units_sold: number
  period: string
  category: string
}

interface StrategyInput {
  product_cost: number
  competitor_prices: number[]
  target_margin: number
  demand_elasticity: number
  positioning: 'budget' | 'mid_range' | 'premium' | 'luxury'
}

// ==================== TOOL 1: COMPETITOR PRICE TRACKER ====================

interface PriceTrackerResult {
  priceChanges: Array<{
    competitor: string
    product_id: string
    product_name: string
    current_price: number
    previous_price: number
    price_change_pct: number
    price_change_abs: number
    direction: 'increased' | 'decreased' | 'unchanged'
    trend: 'aggressive' | 'moderate' | 'stable'
    signal: string
  }>
  summary: {
    total_tracked: number
    increases: number
    decreases: number
    unchanged: number
    avg_change_pct: number
    max_increase: { competitor: string; product_name: string; change: number }
    max_decrease: { competitor: string; product_name: string; change: number }
  }
  signals: string[]
}

function analyzeCompetitorPrices(data: PriceChangeData[]): PriceTrackerResult {
  const priceChanges: PriceTrackerResult['priceChanges'] = []
  const signals: string[] = []

  for (const item of data) {
    const changeAbs = item.current_price - item.previous_price
    const changePct = item.previous_price !== 0 ? (changeAbs / item.previous_price) * 100 : 0
    const direction: 'increased' | 'decreased' | 'unchanged' =
      changeAbs > 0 ? 'increased' : changeAbs < 0 ? 'decreased' : 'unchanged'

    let trend: 'aggressive' | 'moderate' | 'stable' = 'stable'
    if (Math.abs(changePct) > 10) trend = 'aggressive'
    else if (Math.abs(changePct) > 3) trend = 'moderate'

    let signal = ''
    if (changePct < -15) {
      signal = `${item.competitor} dropped price significantly on ${item.product_name} (${changePct.toFixed(1)}%) — potential price war`
    } else if (changePct > 15) {
      signal = `${item.competitor} raised price significantly on ${item.product_name} (+${changePct.toFixed(1)}%) — market positioning shift`
    } else if (Math.abs(changePct) > 5) {
      signal = `${item.competitor} adjusted price on ${item.product_name} (${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%)`
    }

    priceChanges.push({
      competitor: item.competitor,
      product_id: item.product_id,
      product_name: item.product_name,
      current_price: item.current_price,
      previous_price: item.previous_price,
      price_change_pct: changePct,
      price_change_abs: changeAbs,
      direction,
      trend,
      signal
    })
  }

  const increases = priceChanges.filter(p => p.direction === 'increased')
  const decreases = priceChanges.filter(p => p.direction === 'decreased')
  const unchanged = priceChanges.filter(p => p.direction === 'unchanged')
  const allChanges = priceChanges.map(p => p.price_change_pct)

  const maxInc = increases.length > 0
    ? increases.reduce((max, p) => p.price_change_pct > max.change ? { competitor: p.competitor, product_name: p.product_name, change: p.price_change_pct } : max, { competitor: '', product_name: '', change: -Infinity })
    : { competitor: '', product_name: '', change: 0 }

  const maxDec = decreases.length > 0
    ? decreases.reduce((min, p) => p.price_change_pct < min.change ? { competitor: p.competitor, product_name: p.product_name, change: p.price_change_pct } : min, { competitor: '', product_name: '', change: Infinity })
    : { competitor: '', product_name: '', change: 0 }

  const aggressiveDecreases = priceChanges.filter(p => p.trend === 'aggressive' && p.direction === 'decreased')
  if (aggressiveDecreases.length > 0) {
    signals.push(`ALERT: ${aggressiveDecreases.length} aggressive price decrease(s) detected — monitor for price war`)
  }

  const aggressiveIncreases = priceChanges.filter(p => p.trend === 'aggressive' && p.direction === 'increased')
  if (aggressiveIncreases.length > 0) {
    signals.push(`NOTE: ${aggressiveIncreases.length} aggressive price increase(s) detected — market may support higher prices`)
  }

  for (const pc of priceChanges) {
    if (pc.signal) signals.push(pc.signal)
  }

  return {
    priceChanges: priceChanges.sort((a, b) => Math.abs(b.price_change_pct) - Math.abs(a.price_change_pct)),
    summary: {
      total_tracked: priceChanges.length,
      increases: increases.length,
      decreases: decreases.length,
      unchanged: unchanged.length,
      avg_change_pct: allChanges.length > 0 ? allChanges.reduce((s, v) => s + v, 0) / allChanges.length : 0,
      max_increase: maxInc,
      max_decrease: maxDec
    },
    signals
  }
}

function formatPriceTrackerReport(result: PriceTrackerResult): string {
  const lines: string[] = []
  lines.push('## Competitor Price Tracker Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_tracked} price points tracked`)
  lines.push(`- Increases: ${result.summary.increases} | Decreases: ${result.summary.decreases} | Unchanged: ${result.summary.unchanged}`)
  lines.push(`- Avg Change: ${result.summary.avg_change_pct > 0 ? '+' : ''}${result.summary.avg_change_pct.toFixed(2)}%`)
  if (result.summary.max_increase.competitor) {
    lines.push(`- Max Increase: ${result.summary.max_increase.competitor} / ${result.summary.max_increase.product_name} (+${result.summary.max_increase.change.toFixed(1)}%)`)
  }
  if (result.summary.max_decrease.competitor) {
    lines.push(`- Max Decrease: ${result.summary.max_decrease.competitor} / ${result.summary.max_decrease.product_name} (${result.summary.max_decrease.change.toFixed(1)}%)`)
  }
  lines.push('')

  lines.push('### Top Price Movements')
  lines.push('| Competitor | Product | Previous | Current | Change | Trend |')
  lines.push('|------------|---------|----------|---------|--------|-------|')
  for (const pc of result.priceChanges.slice(0, 15)) {
    const arrow = pc.direction === 'increased' ? '\u2191' : pc.direction === 'decreased' ? '\u2193' : '\u2192'
    lines.push(`| ${pc.competitor} | ${pc.product_name} | $${pc.previous_price.toFixed(2)} | $${pc.current_price.toFixed(2)} | ${arrow} ${pc.price_change_pct > 0 ? '+' : ''}${pc.price_change_pct.toFixed(2)}% | ${pc.trend} |`)
  }

  if (result.signals.length > 0) {
    lines.push('')
    lines.push('### Signals')
    for (const sig of result.signals) {
      lines.push(`- ${sig}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: PRODUCT REVIEW ANALYZER ====================

interface ReviewAnalyzerResult {
  sentiment: {
    overall_score: number
    positive_pct: number
    neutral_pct: number
    negative_pct: number
    avg_rating: number
  }
  themes: {
    common_complaints: string[]
    feature_requests: string[]
    praised_features: string[]
  }
  byProduct: Array<{
    product_id: string
    avg_rating: number
    review_count: number
    sentiment: 'positive' | 'mixed' | 'negative'
    top_complaint: string
    top_praise: string
  }>
  recommendations: string[]
}

function analyzeProductReviews(reviews: ReviewData[]): ReviewAnalyzerResult {
  const byProductMap = new Map<string, ReviewData[]>()
  for (const r of reviews) {
    if (!byProductMap.has(r.product_id)) byProductMap.set(r.product_id, [])
    byProductMap.get(r.product_id)!.push(r)
  }

  const byProduct: ReviewAnalyzerResult['byProduct'] = []
  const allComplaints: string[] = []
  const allPraises: string[] = []
  const allFeatureRequests: string[] = []

  const complaintKeywords = ['broke', 'broken', 'defective', 'poor quality', 'cheap', 'flimsy', 'waste', 'terrible', 'worst', 'disappointed', 'returned', 'refund', 'doesnt work', 'stopped', 'failed', 'problem', 'issue', 'damage', 'missing', 'wrong']
  const praiseKeywords = ['excellent', 'amazing', 'love', 'perfect', 'great', 'awesome', 'fantastic', 'quality', 'recommend', 'comfortable', 'durable', 'impressed', 'satisfied', 'best', 'beautiful']
  const featureRequestKeywords = ['wish', 'would be nice', 'should add', 'need', 'improve', 'better if', 'missing', 'add', 'feature', 'option']

  for (const [productId, productReviews] of byProductMap) {
    const avgRating = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
    let complaintCount = 0
    let praiseCount = 0
    const complaintTexts: string[] = []
    const praiseTexts: string[] = []

    for (const r of productReviews) {
      const lowerText = r.text.toLowerCase()
      const hasComplaint = complaintKeywords.some(k => lowerText.includes(k))
      const hasPraise = praiseKeywords.some(k => lowerText.includes(k))

      if (r.rating <= 2 || hasComplaint) {
        complaintCount++
        if (r.text.length > 0) complaintTexts.push(r.text.substring(0, 80))
      }
      if (r.rating >= 4 || hasPraise) {
        praiseCount++
        if (r.text.length > 0) praiseTexts.push(r.text.substring(0, 80))
      }

      for (const kw of featureRequestKeywords) {
        if (lowerText.includes(kw)) {
          allFeatureRequests.push(r.text.substring(0, 100))
          break
        }
      }
      if (r.rating <= 2) allComplaints.push(r.text.substring(0, 100))
      if (r.rating >= 4) allPraises.push(r.text.substring(0, 100))
    }

    const sentiment: 'positive' | 'mixed' | 'negative' =
      avgRating >= 3.5 ? 'positive' : avgRating >= 2.5 ? 'mixed' : 'negative'

    byProduct.push({
      product_id: productId,
      avg_rating: avgRating,
      review_count: productReviews.length,
      sentiment,
      top_complaint: complaintTexts.length > 0 ? complaintTexts[0] : 'None identified',
      top_praise: praiseTexts.length > 0 ? praiseTexts[0] : 'None identified'
    })
  }

  const totalReviews = reviews.length
  const positiveCount = reviews.filter(r => r.rating >= 4).length
  const neutralCount = reviews.filter(r => r.rating === 3).length
  const negativeCount = reviews.filter(r => r.rating <= 2).length
  const avgRating = totalReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0

  const recommendations: string[] = []
  const negativeProducts = byProduct.filter(p => p.sentiment === 'negative')
  if (negativeProducts.length > 0) {
    recommendations.push(`${negativeProducts.length} product(s) with negative sentiment — investigate quality issues`)
  }
  if (avgRating < 3.5) {
    recommendations.push(`Overall low rating (${avgRating.toFixed(1)}/5) — consider product improvements`)
  }
  if (allFeatureRequests.length > 3) {
    recommendations.push(`${allFeatureRequests.length} feature requests detected — review for product development opportunities`)
  }
  if (allComplaints.length > totalReviews * 0.3) {
    recommendations.push(`High complaint rate (${((allComplaints.length / totalReviews) * 100).toFixed(0)}%) — urgent quality review needed`)
  }

  return {
    sentiment: {
      overall_score: (avgRating / 5) * 100,
      positive_pct: totalReviews > 0 ? (positiveCount / totalReviews) * 100 : 0,
      neutral_pct: totalReviews > 0 ? (neutralCount / totalReviews) * 100 : 0,
      negative_pct: totalReviews > 0 ? (negativeCount / totalReviews) * 100 : 0,
      avg_rating: avgRating
    },
    themes: {
      common_complaints: allComplaints.slice(0, 5),
      feature_requests: allFeatureRequests.slice(0, 5),
      praised_features: allPraises.slice(0, 5)
    },
    byProduct: byProduct.sort((a, b) => a.avg_rating - b.avg_rating),
    recommendations
  }
}

function formatReviewAnalyzerReport(result: ReviewAnalyzerResult): string {
  const lines: string[] = []
  lines.push('## Product Review Analysis Report')
  lines.push('')
  lines.push(`**Overall Sentiment Score:** ${result.sentiment.overall_score.toFixed(0)}/100 | **Avg Rating:** ${result.sentiment.avg_rating.toFixed(1)}/5`)
  lines.push(`- Positive: ${result.sentiment.positive_pct.toFixed(1)}% | Neutral: ${result.sentiment.neutral_pct.toFixed(1)}% | Negative: ${result.sentiment.negative_pct.toFixed(1)}%`)
  lines.push('')

  lines.push('### Product Breakdown')
  lines.push('| Product ID | Avg Rating | Reviews | Sentiment | Top Complaint |')
  lines.push('|------------|------------|---------|-----------|---------------|')
  for (const p of result.byProduct.slice(0, 15)) {
    lines.push(`| ${p.product_id} | ${p.avg_rating.toFixed(1)}/5 | ${p.review_count} | ${p.sentiment.toUpperCase()} | ${p.top_complaint.substring(0, 40)}... |`)
  }

  if (result.themes.common_complaints.length > 0) {
    lines.push('')
    lines.push('### Common Complaints')
    for (const c of result.themes.common_complaints) {
      lines.push(`- "${c}"`)
    }
  }

  if (result.themes.praised_features.length > 0) {
    lines.push('')
    lines.push('### Praised Features')
    for (const p of result.themes.praised_features) {
      lines.push(`- "${p}"`)
    }
  }

  if (result.themes.feature_requests.length > 0) {
    lines.push('')
    lines.push('### Feature Requests')
    for (const f of result.themes.feature_requests) {
      lines.push(`- "${f}"`)
    }
  }

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`> ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: KEYWORD RANKING MONITOR ====================

interface KeywordRankingResult {
  rankings: Array<{
    keyword: string
    platform: string
    current_rank: number
    previous_rank: number
    rank_change: number
    direction: 'improved' | 'declined' | 'unchanged'
    search_volume: number
    opportunity: 'high' | 'medium' | 'low'
    opportunity_note: string
  }>
  summary: {
    total_keywords: number
    improved: number
    declined: number
    unchanged: number
    avg_rank: number
    top_opportunity: string
  }
  opportunities: string[]
}

function analyzeKeywordRankings(rankings: RankingData[]): KeywordRankingResult {
  const results: KeywordRankingResult['rankings'] = []
  const opportunities: string[] = []

  for (const r of rankings) {
    const rankChange = r.previous_rank - r.current_rank
    const direction: 'improved' | 'declined' | 'unchanged' =
      rankChange > 0 ? 'improved' : rankChange < 0 ? 'declined' : 'unchanged'

    let opportunity: 'high' | 'medium' | 'low' = 'low'
    let opportunityNote = ''

    if (r.current_rank <= 3 && r.search_volume > 5000) {
      opportunity = 'high'
      opportunityNote = `Top 3 position for high-volume keyword (${r.search_volume} searches) — maintain dominance`
    } else if (r.current_rank <= 10 && rankChange > 5 && r.search_volume > 3000) {
      opportunity = 'high'
      opportunityNote = `Rapidly climbing (+${rankChange} positions) in top 10 for high-volume keyword`
    } else if (r.current_rank <= 20 && rankChange < -3 && r.search_volume > 2000) {
      opportunity = 'medium'
      opportunityNote = `Declining in rankings for valuable keyword — needs SEO attention`
    } else if (r.search_volume > 10000 && r.current_rank > 20) {
      opportunity = 'medium'
      opportunityNote = `High search volume but low ranking — significant visibility gap`
    }

    results.push({
      keyword: r.keyword,
      platform: r.platform,
      current_rank: r.current_rank,
      previous_rank: r.previous_rank,
      rank_change: rankChange,
      direction,
      search_volume: r.search_volume,
      opportunity,
      opportunity_note: opportunityNote
    })

    if (opportunity === 'high' && direction === 'improved') {
      opportunities.push(`"${r.keyword}": Climbed to #${r.current_rank} (was #${r.previous_rank}) with ${r.search_volume} monthly searches — capitalize on momentum`)
    }
    if (opportunity === 'medium' && direction === 'declined') {
      opportunities.push(`"${r.keyword}": Dropped to #${r.current_rank} (was #${r.previous_rank}) with ${r.search_volume} monthly searches — requires immediate action`)
    }
  }

  const improved = results.filter(r => r.direction === 'improved').length
  const declined = results.filter(r => r.direction === 'declined').length
  const ranks = results.map(r => r.current_rank)
  const topOpp = results.filter(r => r.opportunity === 'high').sort((a, b) => a.current_rank - b.current_rank)[0]

  return {
    rankings: results.sort((a, b) => {
      const oppOrder = { high: 0, medium: 1, low: 2 }
      return oppOrder[a.opportunity] - oppOrder[b.opportunity] || a.current_rank - b.current_rank
    }),
    summary: {
      total_keywords: results.length,
      improved,
      declined,
      unchanged: results.filter(r => r.direction === 'unchanged').length,
      avg_rank: ranks.length > 0 ? ranks.reduce((s, v) => s + v, 0) / ranks.length : 0,
      top_opportunity: topOpp ? `"${topOpp.keyword}" at #${topOpp.current_rank}` : 'None identified'
    },
    opportunities
  }
}

function formatKeywordRankingReport(result: KeywordRankingResult): string {
  const lines: string[] = []
  lines.push('## Keyword Ranking Monitor Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_keywords} keywords tracked`)
  lines.push(`- Improved: ${result.summary.improved} | Declined: ${result.summary.declined} | Unchanged: ${result.summary.unchanged}`)
  lines.push(`- Avg Rank: #${result.summary.avg_rank.toFixed(1)} | Top Opportunity: ${result.summary.top_opportunity}`)
  lines.push('')

  lines.push('### Ranking Changes')
  lines.push('| Keyword | Platform | Previous | Current | Change | Volume | Opportunity |')
  lines.push('|---------|----------|----------|---------|--------|--------|-------------|')
  for (const r of result.rankings.slice(0, 20)) {
    const arrow = r.direction === 'improved' ? '\u2191' : r.direction === 'declined' ? '\u2193' : '\u2192'
    const changeStr = r.rank_change !== 0 ? `${arrow} ${Math.abs(r.rank_change)}` : '-'
    lines.push(`| ${r.keyword} | ${r.platform} | #${r.previous_rank} | #${r.current_rank} | ${changeStr} | ${r.search_volume} | ${r.opportunity.toUpperCase()} |`)
  }

  if (result.opportunities.length > 0) {
    lines.push('')
    lines.push('### Key Opportunities')
    for (const opp of result.opportunities) {
      lines.push(`- ${opp}`)
    }
  }

  if (result.rankings.filter(r => r.opportunity === 'high').length > 0) {
    lines.push('')
    lines.push('### High Opportunity Keywords')
    for (const r of result.rankings.filter(r => r.opportunity === 'high')) {
      lines.push(`- **${r.keyword}**: ${r.opportunity_note}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 4: LISTING QUALITY SCORER ====================

interface ListingQualityResult {
  scores: Array<{
    product_id: string
    overall_score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    title_score: number
    bullet_score: number
    image_score: number
    video_score: number
    description_score: number
    a_plus_score: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
  }>
  summary: {
    total_scored: number
    avg_score: number
    grade_distribution: { A: number; B: number; C: number; D: number; F: number }
    avg_improvement_potential: number
  }
}

function scoreListings(listings: ListingData[]): ListingQualityResult {
  const scores: ListingQualityResult['scores'] = []

  for (const l of listings) {
    const titleScore = Math.min(l.title_length / 150, 1) * 100
    const bulletScore = Math.min(l.bullet_count / 5, 1) * 100
    const imageScore = Math.min(l.image_count / 7, 1) * 100
    const videoScore = l.has_video ? 100 : 0
    const descScore = Math.min(l.description_length / 1000, 1) * 100
    const aPlusScore = l.has_a_plus ? 100 : 0

    const overall = (
      titleScore * 0.2 +
      bulletScore * 0.15 +
      imageScore * 0.25 +
      videoScore * 0.15 +
      descScore * 0.15 +
      aPlusScore * 0.1
    )

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F'
    if (overall >= 85) grade = 'A'
    else if (overall >= 70) grade = 'B'
    else if (overall >= 50) grade = 'C'
    else if (overall >= 35) grade = 'D'

    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    if (titleScore >= 80) strengths.push('Well-optimized title length')
    else weaknesses.push(`Title too short (${l.title_length} chars) — aim for 150+`)
    if (l.bullet_count >= 5) strengths.push('Complete bullet points')
    else { weaknesses.push(`Only ${l.bullet_count}/5 bullet points`); recommendations.push('Add bullet points to reach 5+') }
    if (imageScore >= 80) strengths.push('Strong image count')
    else { weaknesses.push(`Only ${l.image_count} images — aim for 7+`); recommendations.push('Add more product images (lifestyle, detail, scale)') }
    if (l.has_video) strengths.push('Has product video')
    else { weaknesses.push('No product video'); recommendations.push('Add a product demonstration video') }
    if (descScore >= 80) strengths.push('Detailed description')
    else { weaknesses.push(`Short description (${l.description_length} chars)`); recommendations.push('Expand product description with key benefits and specs') }
    if (l.has_a_plus) strengths.push('Has A+ content')
    else { weaknesses.push('No A+ content'); recommendations.push('Create A+ content module for richer brand storytelling') }

    scores.push({
      product_id: l.product_id,
      overall_score: overall,
      grade,
      title_score: titleScore,
      bullet_score: bulletScore,
      image_score: imageScore,
      video_score: videoScore,
      description_score: descScore,
      a_plus_score: aPlusScore,
      strengths,
      weaknesses,
      recommendations
    })
  }

  const allScores = scores.map(s => s.overall_score)
  const gradeDist = { A: 0, B: 0, C: 0, D: 0, F: 0 }
  for (const s of scores) gradeDist[s.grade]++

  return {
    scores: scores.sort((a, b) => a.overall_score - b.overall_score),
    summary: {
      total_scored: scores.length,
      avg_score: allScores.length > 0 ? allScores.reduce((s, v) => s + v, 0) / allScores.length : 0,
      grade_distribution: gradeDist,
      avg_improvement_potential: scores.length > 0 ? scores.reduce((s, sc) => s + (100 - sc.overall_score), 0) / scores.length : 0
    }
  }
}

function formatListingQualityReport(result: ListingQualityResult): string {
  const lines: string[] = []
  lines.push('## Listing Quality Score Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_scored} listings scored | Avg Score: ${result.summary.avg_score.toFixed(0)}/100`)
  lines.push(`- Grade Distribution: A: ${result.summary.grade_distribution.A} | B: ${result.summary.grade_distribution.B} | C: ${result.summary.grade_distribution.C} | D: ${result.summary.grade_distribution.D} | F: ${result.summary.grade_distribution.F}`)
  lines.push(`- Avg Improvement Potential: ${result.summary.avg_improvement_potential.toFixed(0)} points`)
  lines.push('')

  lines.push('### Scores by Product')
  lines.push('| Product ID | Score | Grade | Title | Bullets | Images | Video | A+ |')
  lines.push('|------------|-------|-------|-------|---------|--------|-------|-----|')
  for (const s of result.scores.slice(0, 20)) {
    const videoIcon = s.video_score > 0 ? '\u2713' : '\u2717'
    const aPlusIcon = s.a_plus_score > 0 ? '\u2713' : '\u2717'
    lines.push(`| ${s.product_id} | ${s.overall_score.toFixed(0)} | ${s.grade} | ${s.title_score.toFixed(0)} | ${s.bullet_score.toFixed(0)} | ${s.image_score.toFixed(0)} | ${videoIcon} | ${aPlusIcon} |`)
  }

  const weakListings = result.scores.filter(s => s.overall_score < 50)
  if (weakListings.length > 0) {
    lines.push('')
    lines.push('### Priority Improvements Needed')
    for (const s of weakListings.slice(0, 5)) {
      lines.push(`**${s.product_id}** (Score: ${s.overall_score.toFixed(0)}, Grade: ${s.grade})`)
      for (const r of s.recommendations.slice(0, 3)) {
        lines.push(`  - ${r}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: TREND FORECASTER ====================

interface TrendForecastResult {
  forecasts: Array<{
    category: string
    current_monthly_sales: number
    current_search_volume: number
    seasonality_index: number
    trend_direction: 'growing' | 'stable' | 'declining'
    growth_rate: number
    forecast_3m: number
    forecast_6m: number
    confidence: number
    season_peak: string
    recommendation: string
  }>
  summary: {
    total_categories: number
    growing: number
    stable: number
    declining: number
    best_category: string
    highest_growth_rate: number
  }
}

function forecastTrends(data: TrendData[]): TrendForecastResult {
  const forecasts: TrendForecastResult['forecasts'] = []

  for (const d of data) {
    const growthRate = (d.monthly_sales > 0 && d.search_volume > 0)
      ? ((d.search_volume / 10000) * d.seasonality_index * 100) / d.monthly_sales
      : 0

    const trendDirection: 'growing' | 'stable' | 'declining' =
      growthRate > 1.1 ? 'growing' : growthRate < 0.9 ? 'declining' : 'stable'

    const forecast3m = d.monthly_sales * Math.pow(growthRate, 0.25)
    const forecast6m = d.monthly_sales * Math.pow(growthRate, 0.5)
    const confidence = Math.min(0.5 + (d.seasonality_index * 0.3) + (d.search_volume > 5000 ? 0.1 : 0), 0.95)

    let seasonPeak = 'Evenly distributed'
    if (d.seasonality_index > 1.5) seasonPeak = 'Strong peak season ahead'
    else if (d.seasonality_index > 1.2) seasonPeak = 'Moderate seasonal uplift'
    else if (d.seasonality_index < 0.7) seasonPeak = 'Off-season — expect lower demand'

    let recommendation = ''
    if (trendDirection === 'growing' && d.seasonality_index > 1) {
      recommendation = `Riding growth wave with seasonal tailwind — increase inventory and ad spend`
    } else if (trendDirection === 'growing' && d.seasonality_index <= 1) {
      recommendation = `Growing demand despite flat seasonality — organic growth opportunity`
    } else if (trendDirection === 'declining' && d.seasonality_index < 1) {
      recommendation = `Double headwind (declining + off-season) — reduce inventory, focus on cash flow`
    } else if (trendDirection === 'declining' && d.seasonality_index >= 1) {
      recommendation = `Category declining but seasonality favorable — consider targeted promotions`
    } else {
      recommendation = `Stable category — maintain current strategy with incremental optimization`
    }

    forecasts.push({
      category: d.category,
      current_monthly_sales: d.monthly_sales,
      current_search_volume: d.search_volume,
      seasonality_index: d.seasonality_index,
      trend_direction: trendDirection,
      growth_rate: growthRate,
      forecast_3m: forecast3m,
      forecast_6m: forecast6m,
      confidence,
      season_peak: seasonPeak,
      recommendation
    })
  }

  const growing = forecasts.filter(f => f.trend_direction === 'growing').length
  const stable = forecasts.filter(f => f.trend_direction === 'stable').length
  const declining = forecasts.filter(f => f.trend_direction === 'declining').length
  const best = forecasts.length > 0 ? forecasts.reduce((max, f) => f.growth_rate > max.growth_rate ? f : max, forecasts[0]) : null

  return {
    forecasts: forecasts.sort((a, b) => b.growth_rate - a.growth_rate),
    summary: {
      total_categories: forecasts.length,
      growing,
      stable,
      declining,
      best_category: best ? best.category : 'None',
      highest_growth_rate: best ? best.growth_rate : 0
    }
  }
}

function formatTrendForecastReport(result: TrendForecastResult): string {
  const lines: string[] = []
  lines.push('## Trend Forecast Report')
  lines.push('')
  lines.push(`**Categories Analyzed:** ${result.summary.total_categories}`)
  lines.push(`- Growing: ${result.summary.growing} | Stable: ${result.summary.stable} | Declining: ${result.summary.declining}`)
  lines.push(`- Best Opportunity: ${result.summary.best_category} (growth rate: ${result.summary.highest_growth_rate.toFixed(2)}x)`)
  lines.push('')

  lines.push('### Forecast by Category')
  lines.push('| Category | Direction | Growth Rate | 3M Forecast | 6M Forecast | Season | Confidence |')
  lines.push('|----------|-----------|-------------|-------------|-------------|--------|------------|')
  for (const f of result.forecasts) {
    const dirIcon = f.trend_direction === 'growing' ? '\u2191' : f.trend_direction === 'declining' ? '\u2193' : '\u2192'
    lines.push(`| ${f.category} | ${dirIcon} ${f.trend_direction} | ${f.growth_rate.toFixed(2)}x | $${(f.forecast_3m / 1000).toFixed(0)}K | $${(f.forecast_6m / 1000).toFixed(0)}K | ${f.season_peak} | ${(f.confidence * 100).toFixed(0)}% |`)
  }

  lines.push('')
  lines.push('### Recommendations')
  for (const f of result.forecasts) {
    lines.push(`- **${f.category}**: ${f.recommendation}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: AD SPEND ESTIMATOR ====================

interface AdSpendResult {
  estimates: Array<{
    competitor: string
    platform: string
    estimated_impressions: number
    estimated_clicks: number
    cpc_estimate: number
    estimated_daily_spend: number
    estimated_monthly_spend: number
    ctr_estimate: number
    spend_level: 'very_high' | 'high' | 'medium' | 'low'
    channel_share_pct: number
    insight: string
  }>
  summary: {
    total_competitors: number
    total_estimated_monthly_spend: number
    top_spender: string
    top_spend: number
    platform_breakdown: Array<{ platform: string; total_spend: number; competitor_count: number }>
  }
}

function estimateAdSpend(data: AdSpendData[]): AdSpendResult {
  const estimates: AdSpendResult['estimates'] = []
  const platformMap = new Map<string, number>()
  const competitorSet = new Set<string>()

  for (const d of data) {
    competitorSet.add(d.competitor)
    const dailySpend = d.estimated_clicks * d.cpc_estimate
    const monthlySpend = dailySpend * 30
    const ctr = d.estimated_impressions > 0 ? (d.estimated_clicks / d.estimated_impressions) * 100 : 0

    let spendLevel: 'very_high' | 'high' | 'medium' | 'low' = 'low'
    if (monthlySpend > 50000) spendLevel = 'very_high'
    else if (monthlySpend > 20000) spendLevel = 'high'
    else if (monthlySpend > 5000) spendLevel = 'medium'

    let insight = ''
    if (d.cpc_estimate > 3) {
      insight = `High CPC ($${d.cpc_estimate.toFixed(2)}) — likely competitive keywords or premium placement`
    } else if (ctr > 5) {
      insight = `Strong CTR (${ctr.toFixed(1)}%) — well-optimized ad copy and targeting`
    } else if (d.estimated_impressions > 500000) {
      insight = `High impression volume (${(d.estimated_impressions / 1000).toFixed(0)}K) — broad reach strategy`
    } else {
      insight = `Moderate spend with ${ctr.toFixed(1)}% CTR — standard advertising approach`
    }

    estimates.push({
      competitor: d.competitor,
      platform: d.platform,
      estimated_impressions: d.estimated_impressions,
      estimated_clicks: d.estimated_clicks,
      cpc_estimate: d.cpc_estimate,
      estimated_daily_spend: dailySpend,
      estimated_monthly_spend: monthlySpend,
      ctr_estimate: ctr,
      spend_level: spendLevel,
      channel_share_pct: 0,
      insight
    })

    platformMap.set(d.platform, (platformMap.get(d.platform) ?? 0) + monthlySpend)
  }

  const totalMonthly = estimates.reduce((s, e) => s + e.estimated_monthly_spend, 0)

  for (const e of estimates) {
    e.channel_share_pct = totalMonthly > 0 ? (e.estimated_monthly_spend / totalMonthly) * 100 : 0
  }

  const platformBreakdown: Array<{ platform: string; total_spend: number; competitor_count: number }> = []
  for (const [platform, spend] of platformMap) {
    platformBreakdown.push({
      platform,
      total_spend: spend,
      competitor_count: estimates.filter(e => e.platform === platform).length
    })
  }

  const topSpender = estimates.length > 0
    ? estimates.reduce((max, e) => e.estimated_monthly_spend > max.estimated_monthly_spend ? e : max, estimates[0])
    : null

  return {
    estimates: estimates.sort((a, b) => b.estimated_monthly_spend - a.estimated_monthly_spend),
    summary: {
      total_competitors: competitorSet.size,
      total_estimated_monthly_spend: totalMonthly,
      top_spender: topSpender ? `${topSpender.competitor} (${topSpender.platform})` : 'None',
      top_spend: topSpender ? topSpender.estimated_monthly_spend : 0,
      platform_breakdown: platformBreakdown.sort((a, b) => b.total_spend - a.total_spend)
    }
  }
}

function formatAdSpendReport(result: AdSpendResult): string {
  const lines: string[] = []
  lines.push('## Ad Spend Estimation Report')
  lines.push('')
  lines.push(`**${result.summary.total_competitors} competitors tracked** | Total Est. Monthly Spend: $${(result.summary.total_estimated_monthly_spend / 1000).toFixed(0)}K`)
  lines.push(`- Top Spender: ${result.summary.top_spender} ($${(result.summary.top_spend / 1000).toFixed(0)}K/month)`)
  lines.push('')

  lines.push('### Platform Breakdown')
  lines.push('| Platform | Est. Monthly Spend | Competitors | Share |')
  lines.push('|----------|-------------------|-------------|-------|')
  for (const p of result.summary.platform_breakdown) {
    const share = result.summary.total_estimated_monthly_spend > 0 ? (p.total_spend / result.summary.total_estimated_monthly_spend * 100) : 0
    lines.push(`| ${p.platform} | $${(p.total_spend / 1000).toFixed(0)}K | ${p.competitor_count} | ${share.toFixed(1)}% |`)
  }

  lines.push('')
  lines.push('### Competitor Spend Estimates')
  lines.push('| Competitor | Platform | Daily Spend | Monthly Spend | CPC | CTR | Level |')
  lines.push('|------------|----------|-------------|---------------|-----|-----|-------|')
  for (const e of result.estimates.slice(0, 20)) {
    lines.push(`| ${e.competitor} | ${e.platform} | $${e.estimated_daily_spend.toFixed(0)} | $${(e.estimated_monthly_spend / 1000).toFixed(0)}K | $${e.cpc_estimate.toFixed(2)} | ${e.ctr_estimate.toFixed(1)}% | ${e.spend_level.replace('_', ' ').toUpperCase()} |`)
  }

  const highSpenders = result.estimates.filter(e => e.spend_level === 'very_high' || e.spend_level === 'high')
  if (highSpenders.length > 0) {
    lines.push('')
    lines.push('### Key Insights')
    for (const e of highSpenders.slice(0, 5)) {
      lines.push(`- **${e.competitor}** (${e.platform}): ${e.insight}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: MARKET SHARE ANALYZER ====================

interface MarketShareResult {
  shares: Array<{
    brand: string
    revenue: number
    units_sold: number
    revenue_share_pct: number
    unit_share_pct: number
    avg_price: number
    period: string
    category: string
    position: 'leader' | 'challenger' | 'follower' | 'niche'
    strength: string
  }>
  summary: {
    total_brands: number
    total_market_revenue: number
    total_units: number
    leader: string
    leader_share: number
    concentration: 'high' | 'moderate' | 'fragmented'
    top3_share: number
  }
  competitive_positioning: string[]
}

function analyzeMarketShare(data: MarketData[]): MarketShareResult {
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalUnits = data.reduce((s, d) => s + d.units_sold, 0)

  const shares: MarketShareResult['shares'] = []
  for (const d of data) {
    const revenueShare = totalRevenue > 0 ? (d.revenue / totalRevenue) * 100 : 0
    const unitShare = totalUnits > 0 ? (d.units_sold / totalUnits) * 100 : 0
    const avgPrice = d.units_sold > 0 ? d.revenue / d.units_sold : 0

    let position: 'leader' | 'challenger' | 'follower' | 'niche' = 'niche'
    if (revenueShare > 25) position = 'leader'
    else if (revenueShare > 12) position = 'challenger'
    else if (revenueShare > 5) position = 'follower'

    const strength = avgPrice > 50
      ? `Premium positioning at $${avgPrice.toFixed(0)}/unit with ${revenueShare.toFixed(1)}% share`
      : `Value positioning at $${avgPrice.toFixed(0)}/unit with ${revenueShare.toFixed(1)}% share`

    shares.push({
      brand: d.brand,
      revenue: d.revenue,
      units_sold: d.units_sold,
      revenue_share_pct: revenueShare,
      unit_share_pct: unitShare,
      avg_price: avgPrice,
      period: d.period,
      category: d.category,
      position,
      strength
    })
  }

  shares.sort((a, b) => b.revenue_share_pct - a.revenue_share_pct)

  const leader = shares.length > 0 ? shares[0] : null
  const top3Share = shares.slice(0, 3).reduce((s, sh) => s + sh.revenue_share_pct, 0)

  let concentration: 'high' | 'moderate' | 'fragmented' = 'fragmented'
  if (top3Share > 70) concentration = 'high'
  else if (top3Share > 40) concentration = 'moderate'

  const positioning: string[] = []
  if (leader) {
    positioning.push(`Market leader: ${leader.brand} with ${leader.revenue_share_pct.toFixed(1)}% revenue share`)
  }
  if (concentration === 'high') {
    positioning.push(`Highly concentrated market (top 3 = ${top3Share.toFixed(1)}%) — difficult for new entrants`)
  } else if (concentration === 'fragmented') {
    positioning.push(`Fragmented market (top 3 = ${top3Share.toFixed(1)}%) — opportunity for consolidation`)
  }
  const challengers = shares.filter(s => s.position === 'challenger')
  if (challengers.length > 0) {
    positioning.push(`Key challengers: ${challengers.map(c => `${c.brand} (${c.revenue_share_pct.toFixed(1)}%)`).join(', ')}`)
  }

  return {
    shares,
    summary: {
      total_brands: shares.length,
      total_market_revenue: totalRevenue,
      total_units: totalUnits,
      leader: leader ? leader.brand : 'None',
      leader_share: leader ? leader.revenue_share_pct : 0,
      concentration,
      top3_share: top3Share
    },
    competitive_positioning: positioning
  }
}

function formatMarketShareReport(result: MarketShareResult): string {
  const lines: string[] = []
  lines.push('## Market Share Analysis Report')
  lines.push('')
  lines.push(`**Market Size:** $${(result.summary.total_market_revenue / 1000000).toFixed(1)}M revenue | ${result.summary.total_units.toLocaleString()} units`)
  lines.push(`**Concentration:** ${result.summary.concentration.toUpperCase()} | Top 3 Share: ${result.summary.top3_share.toFixed(1)}%`)
  lines.push(`**Leader:** ${result.summary.leader} (${result.summary.leader_share.toFixed(1)}%)`)
  lines.push('')

  lines.push('### Market Share Distribution')
  lines.push('| Brand | Revenue Share | Unit Share | Avg Price | Position |')
  lines.push('|-------|---------------|------------|-----------|----------|')
  for (const s of result.shares) {
    lines.push(`| ${s.brand} | ${s.revenue_share_pct.toFixed(1)}% | ${s.unit_share_pct.toFixed(1)}% | $${s.avg_price.toFixed(0)} | ${s.position.toUpperCase()} |`)
  }

  if (result.competitive_positioning.length > 0) {
    lines.push('')
    lines.push('### Competitive Positioning')
    for (const p of result.competitive_positioning) {
      lines.push(`- ${p}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: PRICING STRATEGY ADVISOR ====================

interface PricingStrategyResult {
  recommendation: {
    optimal_price: number
    price_range_low: number
    price_range_high: number
    positioning: string
    estimated_margin: number
    estimated_monthly_profit: number
    market_position_pct: number
  }
  scenarios: Array<{
    price: number
    margin: number
    demand_multiplier: number
    monthly_profit: number
    market_share_estimate: string
    viability: 'strong' | 'viable' | 'marginal' | 'weak'
  }>
  insights: string[]
  risks: string[]
}

function advisePricingStrategy(input: StrategyInput): PricingStrategyResult {
  const compPrices = input.competitor_prices.sort((a, b) => a - b)
  const minComp = compPrices[0]
  const maxComp = compPrices[compPrices.length - 1]
  const avgComp = compPrices.reduce((s, p) => s + p, 0) / compPrices.length
  const medianComp = compPrices[Math.floor(compPrices.length / 2)]

  let basePrice = 0
  let positioning = ''

  switch (input.positioning) {
    case 'budget':
      basePrice = minComp * 0.9
      positioning = 'Budget leader — lowest price to capture price-sensitive segment'
      break
    case 'mid_range':
      basePrice = medianComp
      positioning = 'Mid-range competitor — competing on value, not lowest price'
      break
    case 'premium':
      basePrice = avgComp * 1.3
      positioning = 'Premium positioning — higher price signals quality and exclusivity'
      break
    case 'luxury':
      basePrice = maxComp * 1.5
      positioning = 'Luxury positioning — maximum price for brand prestige and margins'
      break
  }

  const minMargin = input.demand_elasticity > 1.5 ? input.target_margin * 0.7 : input.target_margin * 0.85
  const priceFloor = input.product_cost / (1 - minMargin / 100)
  const optimalPrice = Math.max(basePrice, priceFloor)
  const priceLow = optimalPrice * 0.85
  const priceHigh = optimalPrice * 1.15

  const margin = ((optimalPrice - input.product_cost) / optimalPrice) * 100
  const demandMult = Math.pow(avgComp / optimalPrice, input.demand_elasticity)
  const estimatedVolume = 1000 * demandMult
  const monthlyProfit = (optimalPrice - input.product_cost) * estimatedVolume

  const marketPositionPct = ((optimalPrice - minComp) / (maxComp - minComp)) * 100

  const scenarios: PricingStrategyResult['scenarios'] = []
  const pricePoints = [priceLow, optimalPrice * 0.95, optimalPrice, optimalPrice * 1.05, priceHigh]
  for (const price of pricePoints) {
    const scMargin = ((price - input.product_cost) / price) * 100
    const scDemand = Math.pow(avgComp / price, input.demand_elasticity)
    const scVolume = 1000 * scDemand
    const scProfit = (price - input.product_cost) * scVolume
    const scShare = scVolume / 10000

    let viability: 'strong' | 'viable' | 'marginal' | 'weak' = 'viable'
    if (scProfit > monthlyProfit * 1.1 && scMargin >= input.target_margin) viability = 'strong'
    else if (scProfit < 0 || scMargin < 0) viability = 'weak'
    else if (scMargin < input.target_margin * 0.7) viability = 'marginal'

    scenarios.push({
      price,
      margin: scMargin,
      demand_multiplier: scDemand,
      monthly_profit: scProfit,
      market_share_estimate: `${(scShare * 100).toFixed(1)}%`,
      viability
    })
  }

  const insights: string[] = []
  const risks: string[] = []

  insights.push(`Optimal price of $${optimalPrice.toFixed(2)} achieves ${margin.toFixed(1)}% margin at "${input.positioning}" positioning`)
  if (margin >= input.target_margin) {
    insights.push(`Target margin of ${input.target_margin}% is achievable at recommended price`)
  } else {
    insights.push(`Target margin of ${input.target_margin}% is challenging — consider cost reduction or premium positioning`)
  }
  if (demandMult > 1) {
    insights.push(`Below-market pricing yields ${((demandMult - 1) * 100).toFixed(0)}% demand boost from price elasticity`)
  }

  if (optimalPrice < minComp) {
    risks.push(`Pricing below cheapest competitor ($${minComp.toFixed(2)}) may trigger price war`)
  }
  if (marketPositionPct > 90) {
    risks.push(`Near top of price range — demand elasticity may reduce volume significantly`)
  }
  if (input.demand_elasticity > 2) {
    risks.push(`High demand elasticity (${input.demand_elasticity}x) — small price changes significantly impact volume`)
  }

  return {
    recommendation: {
      optimal_price: optimalPrice,
      price_range_low: priceLow,
      price_range_high: priceHigh,
      positioning,
      estimated_margin: margin,
      estimated_monthly_profit: monthlyProfit,
      market_position_pct: marketPositionPct
    },
    scenarios: scenarios.sort((a, b) => b.monthly_profit - a.monthly_profit),
    insights,
    risks
  }
}

function formatPricingStrategyReport(result: PricingStrategyResult): string {
  const lines: string[] = []
  const r = result.recommendation

  lines.push('## Pricing Strategy Recommendation')
  lines.push('')
  lines.push(`**Optimal Price:** $${r.optimal_price.toFixed(2)} | Range: $${r.price_range_low.toFixed(2)} - $${r.price_range_high.toFixed(2)}`)
  lines.push(`**Positioning:** ${r.positioning}`)
  lines.push(`**Est. Margin:** ${r.estimated_margin.toFixed(1)}% | **Est. Monthly Profit:** $${r.estimated_monthly_profit.toFixed(0)}`)
  lines.push(`**Market Position:** ${r.market_position_pct.toFixed(0)}th percentile of competitor range`)
  lines.push('')

  lines.push('### Scenario Analysis')
  lines.push('| Price | Margin | Demand Mult. | Monthly Profit | Est. Share | Viability |')
  lines.push('|-------|--------|-------------|----------------|------------|-----------|')
  for (const s of result.scenarios) {
    lines.push(`| $${s.price.toFixed(2)} | ${s.margin.toFixed(1)}% | ${s.demand_multiplier.toFixed(2)}x | $${s.monthly_profit.toFixed(0)} | ${s.market_share_estimate} | ${s.viability.toUpperCase()} |`)
  }

  if (result.insights.length > 0) {
    lines.push('')
    lines.push('### Key Insights')
    for (const i of result.insights) {
      lines.push(`- ${i}`)
    }
  }

  if (result.risks.length > 0) {
    lines.push('')
    lines.push('### Risk Factors')
    for (const risk of result.risks) {
      lines.push(`⚠ ${risk}`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'competitor_price_tracker',
    description: 'Track and analyze competitor pricing changes across products. Detects price movements, identifies trends (aggressive/moderate/stable), and generates alerts for potential price wars or positioning shifts.',
    parameters: {
      price_data: { type: 'string', required: true, description: 'JSON array of price data objects with fields: competitor, product_id, product_name, current_price, previous_price, timestamp' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { price_data: string }) {
      const data: PriceChangeData[] = JSON.parse(args.price_data)
      const result = analyzeCompetitorPrices(data)
      return formatPriceTrackerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'product_review_analyzer',
    description: 'Analyze product reviews for sentiment and key themes. Calculates sentiment scores, identifies common complaints and feature requests, and provides per-product breakdowns with actionable recommendations.',
    parameters: {
      reviews: { type: 'string', required: true, description: 'JSON array of review objects with fields: product_id, rating (1-5), text, date' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { reviews: string }) {
      const data: ReviewData[] = JSON.parse(args.reviews)
      const result = analyzeProductReviews(data)
      return formatReviewAnalyzerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'keyword_ranking_monitor',
    description: 'Monitor keyword search rankings across platforms. Tracks rank changes, identifies high-opportunity keywords, and provides actionable SEO insights for improved visibility.',
    parameters: {
      rankings: { type: 'string', required: true, description: 'JSON array of ranking objects with fields: keyword, platform, current_rank, previous_rank, search_volume' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { rankings: string }) {
      const data: RankingData[] = JSON.parse(args.rankings)
      const result = analyzeKeywordRankings(data)
      return formatKeywordRankingReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'listing_quality_scorer',
    description: 'Score product listing quality based on title length, bullet points, images, video, description, and A+ content. Returns grades (A-F) with specific improvement recommendations for each listing.',
    parameters: {
      listings: { type: 'string', required: true, description: 'JSON array of listing objects with fields: product_id, title_length, bullet_count, image_count, has_video, description_length, has_a_plus' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { listings: string }) {
      const data: ListingData[] = JSON.parse(args.listings)
      const result = scoreListings(data)
      return formatListingQualityReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'trend_forecaster',
    description: 'Forecast product category trends using sales data, search volume, and seasonality. Predicts 3-month and 6-month trajectories with confidence scores and seasonal peak identification.',
    parameters: {
      trend_data: { type: 'string', required: true, description: 'JSON array of trend objects with fields: category, monthly_sales, search_volume, seasonality_index' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { trend_data: string }) {
      const data: TrendData[] = JSON.parse(args.trend_data)
      const result = forecastTrends(data)
      return formatTrendForecastReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'ad_spend_estimator',
    description: 'Estimate competitor advertising spend based on impressions, clicks, and CPC data. Provides spend levels, platform breakdowns, and strategic insights into competitor ad strategies.',
    parameters: {
      ad_data: { type: 'string', required: true, description: 'JSON array of ad data objects with fields: competitor, platform, estimated_impressions, estimated_clicks, cpc_estimate' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { ad_data: string }) {
      const data: AdSpendData[] = JSON.parse(args.ad_data)
      const result = estimateAdSpend(data)
      return formatAdSpendReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'market_share_analyzer',
    description: 'Analyze market share distribution across brands. Calculates revenue and unit shares, identifies market leaders and challengers, and assesses market concentration with competitive positioning insights.',
    parameters: {
      market_data: { type: 'string', required: true, description: 'JSON array of market data objects with fields: brand, revenue, units_sold, period, category' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { market_data: string }) {
      const data: MarketData[] = JSON.parse(args.market_data)
      const result = analyzeMarketShare(data)
      return formatMarketShareReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'pricing_strategy_advisor',
    description: 'Advise on optimal pricing strategy based on product cost, competitor prices, target margin, demand elasticity, and brand positioning. Returns optimal price, scenario analysis, and risk assessment.',
    parameters: {
      strategy_input: { type: 'string', required: true, description: 'JSON object with fields: product_cost, competitor_prices (array), target_margin (%), demand_elasticity, positioning (budget/mid_range/premium/luxury)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { strategy_input: string }) {
      const data: StrategyInput = JSON.parse(args.strategy_input)
      const result = advisePricingStrategy(data)
      return formatPricingStrategyReport(result)
    }
  }))

  console.log(`[dsh-tool-ecomintel] Loaded v${VERSION} — E-commerce Competitor Intelligence with 8 tools`)
  console.log('  Tools: competitor_price_tracker, product_review_analyzer, keyword_ranking_monitor, listing_quality_scorer, trend_forecaster, ad_spend_estimator, market_share_analyzer, pricing_strategy_advisor')
}
