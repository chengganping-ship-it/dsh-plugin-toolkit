/**
 * DSH AI Influencer Marketing Engine Plugin v0.1.0
 *
 * The $40B influencer marketing industry faces a critical matching inefficiency:
 * brands waste 60%+ of effort on manual creator discovery, vetting, and management.
 * This plugin provides an AI-powered full-stack solution — from discovery to ROI.
 *
 * Features (v0.1.0):
 * - Creator Discovery: Multi-platform 4-axis matching (followers, engagement, content tone, audience)
 * - Influencer Vetting: Fake follower detection, brand safety scoring, historical collab analysis
 * - Campaign Orchestrator: Budget allocation, content review, posting time optimization
 * - Content Compliance: FTC/ASA disclosure rules, platform policies, brand guide alignment
 * - ROI Forecaster: CPM/CPE/conversion prediction, multi-touch attribution modeling
 * - Contract Negotiator: Rate benchmarks, exclusivity clauses, performance bonus calculations
 * - Crisis Guardian: Sentiment monitoring, creator risk scanning, emergency response SOP
 * - Community Engagement: Smart comment replies, UGC incentives, fan tier management
 *
 * @module dsh-tool-influencerx
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-influencerx'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface CreatorProfile {
  handle: string
  platform: string
  followers: number
  engagement_rate: number
  avg_likes: number
  avg_comments: number
  content_categories: string[]
  audience_demographics: { age_range: string; gender_split: Record<string, number>; top_countries: string[] }
  authenticity_score?: number
  brand_safety_score?: number
}

interface DiscoveryCriteria {
  platforms?: string[]
  min_followers?: number
  max_followers?: number
  min_engagement_rate?: number
  content_categories?: string[]
  target_audience?: { age_range?: string; gender?: string; countries?: string[] }
  brand_keywords?: string[]
}

interface VetData {
  creator: CreatorProfile
  follower_growth: number[]
  comment_sentiment: { positive: number; neutral: number; negative: number }
  brand_collabs: Array<{ brand: string; date: string; performance_score: number }>
  controversy_flags: string[]
}

interface CampaignConfig {
  budget: number
  platforms: string[]
  creators: Array<{ handle: string; platform: string; followers: number; fee: number; deliverables: number }>
  timeline_start: string
  timeline_end: string
  content_guidelines: string[]
  kpis: Array<{ metric: string; target: number }>
}

interface ComplianceCheck {
  content_text: string
  platform: string
  has_paid_partnership_tag: boolean
  has_ad_disclosure: boolean
  disclosure_position?: string
  brand_guidelines: string[]
  claims_made: string[]
}

interface ROIForecastInput {
  creators: Array<{ handle: string; platform: string; followers: number; engagement_rate: number; fee: number }>
  budget: number
  campaign_duration_days: number
  industry_benchmarks: { avg_cpm: number; avg_cpe: number; avg_conversion_rate: number }
  attribution_model: string
}

interface ContractParams {
  creator_handle: string
  platform: string
  followers: number
  engagement_rate: number
  deliverables: number
  usage_rights_months: number
  exclusivity: boolean
  performance_bonus: boolean
  industry: string
}

interface CrisisInput {
  creator_handle: string
  recent_posts: Array<{ date: string; content: string; sentiment_score: number }>
  mentions: Array<{ source: string; sentiment: string; reach: number; summary: string }>
  risk_keywords: string[]
  follower_count_change_pct: number
}

interface CommunityInput {
  platform: string
  comments: Array<{ author: string; text: string; sentiment: string; likes: number }>
  fan_tiers: Array<{ tier: string; count: number; engagement_rate: number }>
  ugc_posts: Array<{ author: string; content_type: string; quality_score: number; reach: number }>
}

// ==================== HELPER FUNCTIONS ====================

function mean(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1))
}

function round(n: number, decimals: number = 2): number {
  const f = Math.pow(10, decimals)
  return Math.round(n * f) / f
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

// ==================== TOOL 1: CREATOR DISCOVERY ====================

interface DiscoveryResult {
  ranked_creators: Array<{
    handle: string
    platform: string
    followers: number
    engagement_rate: number
    content_match_score: number
    audience_match_score: number
    overall_score: number
    tier: string
  }>
  platform_distribution: Array<{ platform: string; count: number; avg_score: number }>
  tier_distribution: Record<string, number>
  match_analysis: { total_candidates: number; qualified_count: number; avg_match_score: number }
}

function analyzeCreatorDiscovery(creators: CreatorProfile[], criteria: DiscoveryCriteria): DiscoveryResult {
  const {
    min_followers = 1000,
    max_followers = 10000000,
    min_engagement_rate = 1.0,
    content_categories = [],
    target_audience = {},
    brand_keywords = [],
    platforms = []
  } = criteria

  // Filter creators
  let filtered = creators.filter(c => {
    if (c.followers < min_followers || c.followers > max_followers) return false
    if (c.engagement_rate < min_engagement_rate) return false
    if (platforms.length > 0 && !platforms.includes(c.platform)) return false
    return true
  })

  // Score each creator
  const scored = filtered.map(c => {
    // Content match score (0-100)
    let contentMatch = 50
    if (content_categories.length > 0) {
      const overlap = c.content_categories.filter(cat =>
        content_categories.some(tc => tc.toLowerCase() === cat.toLowerCase())
      ).length
      contentMatch = (overlap / content_categories.length) * 100
    }
    if (brand_keywords.length > 0) {
      const keywordMatches = brand_keywords.filter(kw =>
        c.content_categories.some(cat => cat.toLowerCase().includes(kw.toLowerCase()))
      ).length
      contentMatch = Math.max(contentMatch, (keywordMatches / brand_keywords.length) * 100)
    }

    // Audience match score (0-100)
    let audienceMatch = 60
    if (target_audience.age_range) {
      audienceMatch += c.audience_demographics.age_range === target_audience.age_range ? 20 : 0
    }
    if (target_audience.gender) {
      const genderPct = c.audience_demographics.gender_split[target_audience.gender] ?? 50
      audienceMatch += genderPct > 40 ? 10 : 0
    }
    if (target_audience.countries && target_audience.countries.length > 0) {
      const countryOverlap = target_audience.countries.filter(country =>
        c.audience_demographics.top_countries.includes(country)
      ).length
      audienceMatch += (countryOverlap / target_audience.countries.length) * 10
    }
    audienceMatch = Math.min(100, audienceMatch)

    // Overall score weighted: engagement 30%, content 35%, audience 25%, reach 10%
    const reachScore = Math.min(100, (c.followers / 100000) * 100)
    const overall = (
      c.engagement_rate * 5 * 0.3 +
      contentMatch * 0.35 +
      audienceMatch * 0.25 +
      reachScore * 0.1
    )

    // Tier classification
    let tier = 'Nano'
    if (c.followers >= 1000000) tier = 'Mega'
    else if (c.followers >= 500000) tier = 'Macro'
    else if (c.followers >= 100000) tier = 'Mid-Tier'
    else if (c.followers >= 50000) tier = 'Micro'
    else if (c.followers >= 10000) tier = 'Mini'

    return {
      handle: c.handle,
      platform: c.platform,
      followers: c.followers,
      engagement_rate: c.engagement_rate,
      content_match_score: round(contentMatch),
      audience_match_score: round(audienceMatch),
      overall_score: round(overall),
      tier
    }
  })

  // Sort by overall score
  scored.sort((a, b) => b.overall_score - a.overall_score)

  // Platform distribution
  const platformMap = new Map<string, { count: number; scores: number[] }>()
  for (const c of scored) {
    if (!platformMap.has(c.platform)) platformMap.set(c.platform, { count: 0, scores: [] })
    const p = platformMap.get(c.platform)!
    p.count++
    p.scores.push(c.overall_score)
  }
  const platformDist = [...platformMap.entries()].map(([platform, data]) => ({
    platform,
    count: data.count,
    avg_score: round(mean(data.scores))
  }))

  // Tier distribution
  const tierDist: Record<string, number> = {}
  for (const c of scored) {
    tierDist[c.tier] = (tierDist[c.tier] ?? 0) + 1
  }

  return {
    ranked_creators: scored,
    platform_distribution: platformDist,
    tier_distribution: tierDist,
    match_analysis: {
      total_candidates: creators.length,
      qualified_count: scored.length,
      avg_match_score: round(mean(scored.map(c => c.overall_score)))
    }
  }
}

function formatDiscoveryReport(result: DiscoveryResult): string {
  const lines: string[] = []
  lines.push('## Creator Discovery Report')
  lines.push('')
  lines.push('### Match Analysis Panel')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Candidates | ${result.match_analysis.total_candidates} |`)
  lines.push(`| Qualified Creators | ${result.match_analysis.qualified_count} |`)
  lines.push(`| Average Match Score | ${result.match_analysis.avg_match_score.toFixed(1)}/100 |`)
  lines.push(`| Qualification Rate | ${((result.match_analysis.qualified_count / Math.max(result.match_analysis.total_candidates, 1)) * 100).toFixed(1)}% |`)
  lines.push('')

  lines.push('### Tier Distribution')
  lines.push('| Tier | Count | Percentage |')
  lines.push('|------|-------|------------|')
  const total = result.ranked_creators.length
  for (const [tier, count] of Object.entries(result.tier_distribution)) {
    lines.push(`| ${tier} | ${count} | ${((count / Math.max(total, 1)) * 100).toFixed(1)}% |`)
  }
  lines.push('')

  lines.push('### Platform Distribution')
  lines.push('| Platform | Candidates | Avg Score |')
  lines.push('|----------|-----------|-----------|')
  for (const p of result.platform_distribution) {
    lines.push(`| ${p.platform} | ${p.count} | ${p.avg_score.toFixed(1)} |`)
  }
  lines.push('')

  lines.push('### Creator Leaderboard (Top 20)')
  lines.push('| Rank | Handle | Platform | Followers | ER% | Content | Audience | Score | Tier |')
  lines.push('|------|--------|----------|-----------|-----|---------|----------|-------|------|')
  result.ranked_creators.slice(0, 20).forEach((c, i) => {
    const followers = c.followers >= 1000000 ? `${(c.followers / 1000000).toFixed(1)}M` : c.followers >= 1000 ? `${(c.followers / 1000).toFixed(0)}K` : `${c.followers}`
    lines.push(`| ${i + 1} | ${c.handle} | ${c.platform} | ${followers} | ${c.engagement_rate.toFixed(1)} | ${c.content_match_score.toFixed(0)} | ${c.audience_match_score.toFixed(0)} | ${c.overall_score.toFixed(1)} | ${c.tier} |`)
  })

  return lines.join('\n')
}

// ==================== TOOL 2: INFLUENCER VETTING ====================

interface VettingResult {
  creator_handle: string
  authenticity: { score: number; fake_follower_pct: number; risk_level: string; indicators: string[] }
  brand_safety: { score: number; risk_factors: string[]; safe_categories: string[]; unsafe_categories: string[] }
  historical_performance: { avg_performance: number; collaboration_count: number; trend: string; reliability_score: number }
  overall_risk: { score: number; recommendation: string; flags: string[] }
}

function analyzeInfluencerVetting(data: VetData): VettingResult {
  // Fake follower detection
  const growthRate = data.follower_growth.length >= 2
    ? (data.follower_growth[data.follower_growth.length - 1] - data.follower_growth[0]) / Math.max(data.follower_growth[0], 1) * 100
    : 0
  const growthVolatility = stdDev(data.follower_growth)
  const abnormalSpikes = data.follower_growth.filter((v, i) =>
    i > 0 && v > data.follower_growth[i - 1] * 1.5
  ).length

  let fakeFollowerPct = 0
  const indicators: string[] = []

  if (abnormalSpikes >= 2) {
    fakeFollowerPct += abnormalSpikes * 5
    indicators.push(`${abnormalSpikes} abnormal follower spikes detected`)
  }
  if (data.creator.engagement_rate < 1 && data.creator.followers > 100000) {
    fakeFollowerPct += 20
    indicators.push('Very low engagement relative to follower count')
  }
  if (growthVolatility > mean(data.follower_growth) * 0.5) {
    fakeFollowerPct += 10
    indicators.push('Highly volatile growth pattern')
  }
  fakeFollowerPct = Math.min(60, fakeFollowerPct)

  const authenticityScore = Math.max(0, 100 - fakeFollowerPct * 1.5)
  const authRiskLevel = authenticityScore >= 80 ? 'Low' : authenticityScore >= 60 ? 'Medium' : authenticityScore >= 40 ? 'High' : 'Critical'

  // Brand safety score
  const controversyImpact = data.controversy_flags.length * 15
  const sentimentScore = data.comment_sentiment.positive > 70 ? 10 :
    data.comment_sentiment.positive > 50 ? 5 : 0
  const brandSafetyScore = Math.max(0, Math.min(100, 80 - controversyImpact + sentimentScore))

  const riskFactors = [...data.controversy_flags]
  if (data.comment_sentiment.negative > 20) riskFactors.push('High negative comment ratio')

  const safeCategories = data.creator.content_categories.filter(c =>
    !['political', 'controversial', 'gambling', 'weapons'].includes(c.toLowerCase())
  )
  const unsafeCategories = data.creator.content_categories.filter(c =>
    ['political', 'controversial', 'gambling', 'weapons'].includes(c.toLowerCase())
  )

  // Historical performance
  const avgPerf = data.brand_collabs.length > 0
    ? mean(data.brand_collabs.map(c => c.performance_score))
    : 50
  const perfTrend = data.brand_collabs.length >= 3
    ? data.brand_collabs[data.brand_collabs.length - 1].performance_score > data.brand_collabs[0].performance_score
      ? 'improving' : 'declining'
    : 'insufficient_data'
  const reliabilityScore = Math.min(100, avgPerf > 0 ? (avgPerf / 100) * 80 + 20 : 50)

  // Overall risk
  const overallRisk = 100 - (authenticityScore * 0.4 + brandSafetyScore * 0.35 + reliabilityScore * 0.25)
  const flags: string[] = []
  if (fakeFollowerPct > 15) flags.push('SUSPICIOUS_GROWTH')
  if (brandSafetyScore < 50) flags.push('BRAND_SAFETY_CONCERN')
  if (reliabilityScore < 40) flags.push('UNRELIABLE_PERFORMANCE')
  if (data.controversy_flags.length > 0) flags.push('CONTROVERSY_HISTORY')

  let recommendation = 'APPROVE'
  if (overallRisk > 60) recommendation = 'REJECT'
  else if (overallRisk > 40) recommendation = 'REVIEW_REQUIRED'
  else if (overallRisk > 25) recommendation = 'APPROVE_WITH_MONITORING'

  return {
    creator_handle: data.creator.handle,
    authenticity: {
      score: round(authenticityScore),
      fake_follower_pct: round(fakeFollowerPct),
      risk_level: authRiskLevel,
      indicators
    },
    brand_safety: {
      score: round(brandSafetyScore),
      risk_factors: riskFactors,
      safe_categories: safeCategories,
      unsafe_categories: unsafeCategories
    },
    historical_performance: {
      avg_performance: round(avgPerf),
      collaboration_count: data.brand_collabs.length,
      trend: perfTrend,
      reliability_score: round(reliabilityScore)
    },
    overall_risk: {
      score: round(overallRisk),
      recommendation,
      flags
    }
  }
}

function formatVettingReport(result: VettingResult): string {
  const lines: string[] = []
  lines.push(`## Influencer Vetting Report: ${result.creator_handle}`)
  lines.push('')
  lines.push('### Risk Assessment Panel')
  lines.push('| Dimension | Score | Status |')
  lines.push('|-----------|-------|--------|')
  lines.push(`| Authenticity | ${result.authenticity.score.toFixed(0)}/100 | ${result.authenticity.risk_level} Risk |`)
  lines.push(`| Brand Safety | ${result.brand_safety.score.toFixed(0)}/100 | ${result.brand_safety.score >= 70 ? 'Safe' : result.brand_safety.score >= 50 ? 'Moderate' : 'At Risk'} |`)
  lines.push(`| Reliability | ${result.historical_performance.reliability_score.toFixed(0)}/100 | ${result.historical_performance.reliability_score >= 70 ? 'Reliable' : 'Variable'} |`)
  lines.push(`| Overall Risk | ${result.overall_risk.score.toFixed(0)}/100 | ${result.overall_risk.recommendation} |`)
  lines.push('')

  lines.push('### Fake Follower Analysis')
  lines.push(`- **Fake Follower Estimate:** ${result.authenticity.fake_follower_pct.toFixed(1)}%`)
  lines.push(`- **Risk Level:** ${result.authenticity.risk_level}`)
  lines.push('- **Indicators:**')
  for (const ind of result.authenticity.indicators) {
    lines.push(`  - ${ind}`)
  }
  lines.push('')

  lines.push('### Brand Safety Breakdown')
  lines.push(`- **Risk Factors:** ${result.brand_safety.risk_factors.length > 0 ? result.brand_safety.risk_factors.join(', ') : 'None identified'}`)
  lines.push(`- **Safe Categories:** ${result.brand_safety.safe_categories.join(', ') || 'N/A'}`)
  lines.push(`- **Unsafe Categories:** ${result.brand_safety.unsafe_categories.join(', ') || 'None'}`)
  lines.push('')

  lines.push('### Historical Performance')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Avg Performance Score | ${result.historical_performance.avg_performance.toFixed(1)}/100 |`)
  lines.push(`| Total Collaborations | ${result.historical_performance.collaboration_count} |`)
  lines.push(`| Performance Trend | ${result.historical_performance.trend} |`)
  lines.push(`| Reliability Score | ${result.historical_performance.reliability_score.toFixed(0)}/100 |`)
  lines.push('')

  lines.push('### Flags & Recommendation')
  lines.push(`- **Recommendation:** ${result.overall_risk.recommendation}`)
  lines.push(`- **Flags:** ${result.overall_risk.flags.length > 0 ? result.overall_risk.flags.join(', ') : 'None'}`)

  return lines.join('\n')
}

// ==================== TOOL 3: CAMPAIGN ORCHESTRATOR ====================

interface OrchestratorResult {
  budget_allocation: Array<{ creator: string; fee: number; pct_of_budget: number; expected_impressions: number; expected_engagements: number }>
  schedule: Array<{ creator: string; platform: string; optimal_day: string; optimal_time: string; rationale: string }>
  content_pipeline: Array<{ creator: string; deliverable: number; review_status: string; compliance_score: number }>
  projected_kpis: Array<{ metric: string; target: number; projected: number; probability: number }>
  risk_alerts: string[]
}

function analyzeCampaignOrchestration(config: CampaignConfig): OrchestratorResult {
  // Budget allocation analysis
  const totalFees = config.creators.reduce((s, c) => s + c.fee, 0)
  const budgetAllocation = config.creators.map(c => {
    const pctBudget = config.budget > 0 ? (c.fee / config.budget) * 100 : 0
    const expectedImpressions = c.followers * 0.3 // ~30% reach rate
    const expectedEngagements = expectedImpressions * 0.05 // ~5% engagement
    return {
      creator: c.handle,
      fee: c.fee,
      pct_of_budget: round(pctBudget),
      expected_impressions: Math.round(expectedImpressions),
      expected_engagements: Math.round(expectedEngagements)
    }
  })

  // Posting schedule optimization
  const optimalDays = ['Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const optimalTimes: Record<string, string> = {
    'Instagram': '11:00 AM',
    'TikTok': '7:00 PM',
    'YouTube': '2:00 PM',
    'Twitter': '9:00 AM',
    'LinkedIn': '8:00 AM'
  }
  const rationales: Record<string, string> = {
    'Instagram': 'Mid-morning peak scroll time',
    'TikTok': 'Evening entertainment peak',
    'YouTube': 'Afternoon work break window',
    'Twitter': 'Morning news consumption peak',
    'LinkedIn': 'Pre-work professional browsing'
  }

  const schedule = config.creators.map((c, i) => ({
    creator: c.handle,
    platform: c.platform,
    optimal_day: optimalDays[i % optimalDays.length],
    optimal_time: optimalTimes[c.platform] ?? '12:00 PM',
    rationale: rationales[c.platform] ?? 'General audience availability'
  }))

  // Content pipeline
  const contentPipeline = config.creators.map(c => ({
    creator: c.handle,
    deliverable: c.deliverables,
    review_status: 'pending_review',
    compliance_score: 0
  }))

  // Projected KPIs
  const totalImpressions = budgetAllocation.reduce((s, b) => s + b.expected_impressions, 0)
  const totalEngagements = budgetAllocation.reduce((s, b) => s + b.expected_engagements, 0)
  const projectedCpm = totalImpressions > 0 ? (config.budget / totalImpressions) * 1000 : 0
  const projectedCpe = totalEngagements > 0 ? config.budget / totalEngagements : 0

  const projectedKpis = config.kpis.map(kpi => {
    let projected = 0
    if (kpi.metric === 'impressions') projected = totalImpressions
    else if (kpi.metric === 'engagements') projected = totalEngagements
    else if (kpi.metric === 'cpm') projected = round(projectedCpm)
    else if (kpi.metric === 'cpe') projected = round(projectedCpe)
    else projected = totalEngagements * 0.1
    const probability = projected >= kpi.target ? 0.85 : projected >= kpi.target * 0.7 ? 0.6 : 0.3
    return { metric: kpi.metric, target: kpi.target, projected: Math.round(projected), probability: round(probability * 100) }
  })

  // Risk alerts
  const risks: string[] = []
  if (totalFees > config.budget) {
    risks.push(`Creator fees ($${totalFees.toFixed(0)}) exceed budget ($${config.budget.toFixed(0)})`)
  }
  if (config.creators.length < 3) {
    risks.push('Low creator diversity — campaign lacks platform coverage')
  }
  const uniquePlatforms = new Set(config.creators.map(c => c.platform))
  if (uniquePlatforms.size < 2 && config.creators.length > 2) {
    risks.push('Single platform concentration — diversify to reduce risk')
  }

  return {
    budget_allocation: budgetAllocation,
    schedule,
    content_pipeline: contentPipeline,
    projected_kpis: projectedKpis,
    risk_alerts: risks
  }
}

function formatOrchestrationReport(result: OrchestratorResult): string {
  const lines: string[] = []
  lines.push('## Campaign Orchestration Report')
  lines.push('')

  lines.push('### Budget Allocation Panel')
  lines.push('| Creator | Fee | Budget % | Est. Impressions | Est. Engagements |')
  lines.push('|---------|-----|----------|------------------|-------------------|')
  for (const b of result.budget_allocation) {
    lines.push(`| ${b.creator} | $${b.fee.toFixed(0)} | ${b.pct_of_budget.toFixed(1)}% | ${b.expected_impressions.toLocaleString()} | ${b.expected_engagements.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### Publishing Schedule')
  lines.push('| Creator | Platform | Optimal Day | Optimal Time | Rationale |')
  lines.push('|---------|----------|-------------|--------------|-----------|')
  for (const s of result.schedule) {
    lines.push(`| ${s.creator} | ${s.platform} | ${s.optimal_day} | ${s.optimal_time} | ${s.rationale} |`)
  }
  lines.push('')

  lines.push('### Projected KPIs')
  lines.push('| Metric | Target | Projected | Probability |')
  lines.push('|--------|--------|-----------|-------------|')
  for (const k of result.projected_kpis) {
    lines.push(`| ${k.metric} | ${k.target.toLocaleString()} | ${k.projected.toLocaleString()} | ${k.probability.toFixed(0)}% |`)
  }
  lines.push('')

  lines.push('### Risk Alerts')
  if (result.risk_alerts.length > 0) {
    for (const r of result.risk_alerts) {
      lines.push(`- ${r}`)
    }
  } else {
    lines.push('- No critical risks identified')
  }

  return lines.join('\n')
}

// ==================== TOOL 4: CONTENT COMPLIANCE ====================

interface ComplianceResult {
  overall_status: 'compliant' | 'partial' | 'violation'
  disclosure_check: { passed: boolean; issues: string[]; required_actions: string[] }
  platform_compliance: Array<{ platform: string; policy: string; status: string; details: string }>
  brand_alignment: { score: number; matches: string[]; mismatches: string[] }
  regulatory_flags: Array<{ regulation: string; severity: string; description: string }>
  risk_level: string
  remediation_steps: string[]
}

function analyzeContentCompliance(check: ComplianceCheck): ComplianceResult {
  // FTC/ASA disclosure rules
  const disclosureIssues: string[] = []
  const disclosureActions: string[] = []

  if (!check.has_paid_partnership_tag) {
    disclosureIssues.push('Missing #ad or Paid Partnership tag')
    disclosureActions.push('Add clear "Ad" or "Paid Partnership" label at beginning of content')
  }
  if (!check.has_ad_disclosure) {
    disclosureIssues.push('No explicit advertising disclosure found')
    disclosureActions.push('Include "Sponsored by [Brand]" or equivalent within first 125 characters')
  }
  if (check.disclosure_position === 'end' || check.disclosure_position === 'buried') {
    disclosureIssues.push('Disclosure placed at end or buried in hashtags')
    disclosureActions.push('Move disclosure to beginning of caption — must be visible without clicking "more"')
  }

  // Platform-specific compliance
  const platformCompliance: ComplianceResult['platform_compliance'] = []
  const platformRules: Record<string, string[]> = {
    'Instagram': ['Branded Content Tag required', '#ad must be visible', 'No misleading health claims'],
    'TikTok': ['Paid Partnership toggle required', 'Branded Content must be enabled', 'No unverified product claims'],
    'YouTube': ['Paid promotion checkbox required', 'Verbal disclosure in first 30s', 'Description must contain disclosure'],
    'Twitter': ['#ad recommended', 'No deceptive promotional claims', 'FTC disclosure for material connection'],
    'Facebook': ['Branded Content tag required', 'Public disclosure of material connection', 'No before/after claims without evidence']
  }

  const rules = platformRules[check.platform] ?? ['General FTC disclosure required']
  for (const rule of rules) {
    let status = 'pass'
    let details = 'Compliant'
    if (rule.includes('Tag') || rule.includes('toggle') || rule.includes('checkbox')) {
      status = check.has_paid_partnership_tag ? 'pass' : 'fail'
      details = check.has_paid_partnership_tag ? 'Tag applied' : 'Tag missing'
    } else if (rule.includes('disclosure') || rule.includes('#ad')) {
      status = check.has_ad_disclosure ? 'pass' : 'fail'
      details = check.has_ad_disclosure ? 'Disclosure present' : 'Disclosure missing'
    } else if (rule.includes('claims')) {
      const hasExtremeClaims = check.claims_made.some(c =>
        c.toLowerCase().includes('guarantee') || c.toLowerCase().includes('miracle')
      )
      status = hasExtremeClaims ? 'fail' : 'pass'
      details = hasExtremeClaims ? 'Unsubstantiated claims detected' : 'Claims appear reasonable'
    }
    platformCompliance.push({ platform: check.platform, policy: rule, status, details })
  }

  // Brand alignment
  const brandMatches: string[] = []
  const brandMismatches: string[] = []
  for (const guideline of check.brand_guidelines) {
    const isMatch = check.content_text.toLowerCase().includes(guideline.toLowerCase())
    if (isMatch) brandMatches.push(guideline)
    else brandMismatches.push(guideline)
  }
  const brandAlignmentScore = check.brand_guidelines.length > 0
    ? (brandMatches.length / check.brand_guidelines.length) * 100
    : 80

  // Regulatory flags
  const regulatoryFlags: ComplianceResult['regulatory_flags'] = []
  const contentLower = check.content_text.toLowerCase()
  if (contentLower.includes('guarantee') || contentLower.includes('100%') || contentLower.includes('miracle')) {
    regulatoryFlags.push({ regulation: 'FTC Truth in Advertising', severity: 'high', description: 'Absolute claims require substantiation' })
  }
  if (check.claims_made.length > 0 && !check.has_ad_disclosure) {
    regulatoryFlags.push({ regulation: 'FTC Endorsement Guidelines', severity: 'critical', description: 'Material connection not disclosed' })
  }
  if (contentLower.includes('results') || contentLower.includes('before') || contentLower.includes('after')) {
    regulatoryFlags.push({ regulation: 'ASA CAP Code', severity: 'medium', description: 'Results claims must be typical and substantiated' })
  }

  // Overall status
  const criticalCount = regulatoryFlags.filter(f => f.severity === 'critical').length
  const failCount = platformCompliance.filter(c => c.status === 'fail').length
  let overallStatus: ComplianceResult['overall_status'] = 'compliant'
  if (criticalCount > 0 || failCount > 1) overallStatus = 'violation'
  else if (failCount > 0 || disclosureIssues.length > 0) overallStatus = 'partial'

  const riskLevel = overallStatus === 'violation' ? 'HIGH' : overallStatus === 'partial' ? 'MEDIUM' : 'LOW'

  // Remediation
  const remediation: string[] = [...disclosureActions]
  if (brandMismatches.length > 0) {
    remediation.push(`Align content with brand guidelines: ${brandMismatches.join(', ')}`)
  }
  if (criticalCount > 0) {
    remediation.push('CRITICAL: Resolve regulatory violations before publishing')
  }

  return {
    overall_status: overallStatus,
    disclosure_check: { passed: disclosureIssues.length === 0, issues: disclosureIssues, required_actions: disclosureActions },
    platform_compliance: platformCompliance,
    brand_alignment: { score: round(brandAlignmentScore), matches: brandMatches, mismatches: brandMismatches },
    regulatory_flags: regulatoryFlags,
    risk_level: riskLevel,
    remediation_steps: remediation
  }
}

function formatComplianceReport(result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('## Content Compliance Report')
  lines.push('')
  lines.push(`**Overall Status:** ${result.overall_status.toUpperCase()} | **Risk Level:** ${result.risk_level}`)
  lines.push('')

  lines.push('### Disclosure Check')
  lines.push(`| Check | Status |`)
  lines.push(`|-------|--------|`)
  lines.push(`| Disclosure Present | ${result.disclosure_check.passed ? 'PASS' : 'FAIL'} |`)
  lines.push('')

  if (result.disclosure_check.issues.length > 0) {
    lines.push('**Issues:**')
    for (const i of result.disclosure_check.issues) {
      lines.push(`- ${i}`)
    }
    lines.push('')
  }

  lines.push('### Platform Compliance')
  lines.push('| Policy | Status | Details |')
  lines.push('|--------|--------|---------|')
  for (const p of result.platform_compliance) {
    lines.push(`| ${p.policy} | ${p.status.toUpperCase()} | ${p.details} |`)
  }
  lines.push('')

  lines.push('### Brand Alignment')
  lines.push(`- **Score:** ${result.brand_alignment.score.toFixed(0)}/100`)
  lines.push(`- **Matches:** ${result.brand_alignment.matches.join(', ') || 'None'}`)
  lines.push(`- **Mismatches:** ${result.brand_alignment.mismatches.join(', ') || 'None'}`)
  lines.push('')

  if (result.regulatory_flags.length > 0) {
    lines.push('### Regulatory Flags')
    lines.push('| Regulation | Severity | Description |')
    lines.push('|------------|----------|-------------|')
    for (const r of result.regulatory_flags) {
      lines.push(`| ${r.regulation} | ${r.severity.toUpperCase()} | ${r.description} |`)
    }
    lines.push('')
  }

  lines.push('### Remediation Steps')
  for (const step of result.remediation_steps) {
    lines.push(`- ${step}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: ROI FORECASTER ====================

interface ROIForecastResult {
  per_creator_forecast: Array<{
    handle: string
    platform: string
    investment: number
    predicted_impressions: number
    predicted_engagements: number
    predicted_conversions: number
    predicted_revenue: number
    roi: number
    cpm: number
    cpe: number
  }>
  aggregate: { total_investment: number; total_revenue: number; total_roi: number; blended_cpm: number; blended_cpe: number }
  attribution_model: { model: string; channel_weights: Array<{ platform: string; weight: number; attributed_revenue: number }> }
  scenario_analysis: Array<{ scenario: string; revenue: number; roi: number; description: string }>
}

function analyzeROIForecast(input: ROIForecastInput): ROIForecastResult {
  const perCreator = input.creators.map(c => {
    const predictedImpressions = c.followers * 0.3 * (input.campaign_duration_days / 30)
    const predictedEngagements = predictedImpressions * (c.engagement_rate / 100)
    const predictedConversions = predictedEngagements * (input.industry_benchmarks.avg_conversion_rate / 100)
    const predictedRevenue = predictedConversions * 50 // $50 avg order value
    const cpm = predictedImpressions > 0 ? (c.fee / predictedImpressions) * 1000 : 0
    const cpe = predictedEngagements > 0 ? c.fee / predictedEngagements : 0
    const roi = c.fee > 0 ? ((predictedRevenue - c.fee) / c.fee) * 100 : 0

    return {
      handle: c.handle,
      platform: c.platform,
      investment: c.fee,
      predicted_impressions: Math.round(predictedImpressions),
      predicted_engagements: Math.round(predictedEngagements),
      predicted_conversions: Math.round(predictedConversions),
      predicted_revenue: round(predictedRevenue),
      roi: round(roi),
      cpm: round(cpm),
      cpe: round(cpe)
    }
  })

  const totalInvestment = perCreator.reduce((s, c) => s + c.investment, 0)
  const totalRevenue = perCreator.reduce((s, c) => s + c.predicted_revenue, 0)
  const totalImpressions = perCreator.reduce((s, c) => s + c.predicted_impressions, 0)
  const totalEngagements = perCreator.reduce((s, c) => s + c.predicted_engagements, 0)

  // Attribution model
  const platformGroups = new Map<string, { impressions: number; revenue: number }>()
  for (const c of perCreator) {
    if (!platformGroups.has(c.platform)) platformGroups.set(c.platform, { impressions: 0, revenue: 0 })
    const g = platformGroups.get(c.platform)!
    g.impressions += c.predicted_impressions
    g.revenue += c.predicted_revenue
  }

  const totalImpressionsAll = [...platformGroups.values()].reduce((s, g) => s + g.impressions, 0)
  const channelWeights = [...platformGroups.entries()].map(([platform, data]) => ({
    platform,
    weight: totalImpressionsAll > 0 ? round((data.impressions / totalImpressionsAll) * 100) : 0,
    attributed_revenue: round(data.revenue)
  }))

  // Scenario analysis
  const scenarios = [
    { name: 'Conservative', multiplier: 0.7, desc: '70% of predicted performance' },
    { name: 'Expected', multiplier: 1.0, desc: 'Baseline prediction' },
    { name: 'Optimistic', multiplier: 1.3, desc: '130% of predicted performance (viral boost)' },
    { name: 'Viral Hit', multiplier: 2.0, desc: 'One creator goes viral, doubling total revenue' }
  ]

  const scenarioAnalysis = scenarios.map(s => {
    const adjRevenue = totalRevenue * s.multiplier
    const roi = totalInvestment > 0 ? ((adjRevenue - totalInvestment) / totalInvestment) * 100 : 0
    return { scenario: s.name, revenue: round(adjRevenue), roi: round(roi), description: s.desc }
  })

  return {
    per_creator_forecast: perCreator,
    aggregate: {
      total_investment: round(totalInvestment),
      total_revenue: round(totalRevenue),
      total_roi: totalInvestment > 0 ? round(((totalRevenue - totalInvestment) / totalInvestment) * 100) : 0,
      blended_cpm: totalImpressions > 0 ? round((totalInvestment / totalImpressions) * 1000) : 0,
      blended_cpe: totalEngagements > 0 ? round(totalInvestment / totalEngagements) : 0
    },
    attribution_model: { model: input.attribution_model, channel_weights: channelWeights },
    scenario_analysis: scenarioAnalysis
  }
}

function formatROIReport(result: ROIForecastResult): string {
  const lines: string[] = []
  lines.push('## ROI Forecast & Attribution Report')
  lines.push('')
  lines.push('### Aggregate Performance Panel')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Investment | $${result.aggregate.total_investment.toFixed(0)} |`)
  lines.push(`| Predicted Revenue | $${result.aggregate.total_revenue.toFixed(0)} |`)
  lines.push(`| Overall ROI | ${result.aggregate.total_roi.toFixed(1)}% |`)
  lines.push(`| Blended CPM | $${result.aggregate.blended_cpm.toFixed(2)} |`)
  lines.push(`| Blended CPE | $${result.aggregate.blended_cpe.toFixed(2)} |`)
  lines.push('')

  lines.push('### Per-Creator Forecast')
  lines.push('| Creator | Platform | Investment | Impressions | Engagements | Conversions | Revenue | ROI% | CPM | CPE |')
  lines.push('|---------|----------|------------|-------------|-------------|-------------|---------|------|-----|-----|')
  for (const c of result.per_creator_forecast) {
    lines.push(`| ${c.handle} | ${c.platform} | $${c.investment.toFixed(0)} | ${c.predicted_impressions.toLocaleString()} | ${c.predicted_engagements.toLocaleString()} | ${c.predicted_conversions} | $${c.predicted_revenue.toFixed(0)} | ${c.roi >= 0 ? '+' : ''}${c.roi.toFixed(0)}% | $${c.cpm.toFixed(2)} | $${c.cpe.toFixed(2)} |`)
  }
  lines.push('')

  lines.push('### Attribution Model: ' + result.attribution_model)
  lines.push('| Platform | Weight | Attributed Revenue |')
  lines.push('|----------|--------|-------------------|')
  for (const w of result.attribution_model.channel_weights) {
    lines.push(`| ${w.platform} | ${w.weight.toFixed(1)}% | $${w.attributed_revenue.toFixed(0)} |`)
  }
  lines.push('')

  lines.push('### Scenario Analysis')
  lines.push('| Scenario | Revenue | ROI | Description |')
  lines.push('|----------|---------|-----|-------------|')
  for (const s of result.scenario_analysis) {
    lines.push(`| ${s.scenario} | $${s.revenue.toFixed(0)} | ${s.roi >= 0 ? '+' : ''}${s.roi.toFixed(1)}% | ${s.description} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: CONTRACT NEGOTIATOR ====================

interface ContractResult {
  rate_benchmark: { market_rate: number; suggested_rate: number; rate_range: { low: number; high: number }; basis: string }
  exclusivity_premium: { applicable: boolean; premium_pct: number; premium_amount: number; duration_months: number }
  performance_bonus: { applicable: boolean; tiers: Array<{ threshold: number; bonus_pct: number; bonus_amount: number }> }
  total_compensation: { base: number; exclusivity_premium: number; max_performance_bonus: number; total_max: number }
  contract_terms: { usage_rights_value: number; deliverable_value: number; cost_per_deliverable: number }
  negotiation_leverage: string[]
}

function analyzeContractNegotiation(params: ContractParams): ContractResult {
  // Rate benchmark based on followers and engagement
  const baseRatePerFollower = params.platform === 'YouTube' ? 0.05 :
    params.platform === 'Instagram' ? 0.03 :
    params.platform === 'TikTok' ? 0.02 : 0.025

  const engagementMultiplier = params.engagement_rate > 5 ? 1.5 :
    params.engagement_rate > 3 ? 1.2 :
    params.engagement_rate > 1.5 ? 1.0 : 0.8

  const marketRate = params.followers * baseRatePerFollower * engagementMultiplier
  const suggestedRate = marketRate * (params.deliverables > 1 ? 1 + (params.deliverables - 1) * 0.3 : 1)

  const rateBenchmark = {
    market_rate: round(marketRate),
    suggested_rate: round(suggestedRate),
    rate_range: { low: round(marketRate * 0.7), high: round(marketRate * 1.5) },
    basis: `$${baseRatePerFollower}/follower × ${engagementMultiplier}x engagement multiplier × ${params.deliverables} deliverables`
  }

  // Exclusivity premium
  const exclusivityPremiumPct = params.exclusivity ? 25 : 0
  const exclusivityPremiumAmount = round(suggestedRate * (exclusivityPremiumPct / 100))

  // Performance bonus
  const bonusTiers: ContractResult['performance_bonus']['tiers'] = []
  if (params.performance_bonus) {
    const tiers = [
      { threshold: 100, bonusPct: 5 },
      { threshold: 150, bonusPct: 10 },
      { threshold: 200, bonusPct: 20 }
    ]
    for (const t of tiers) {
      bonusTiers.push({
        threshold: t.threshold,
        bonus_pct: t.bonusPct,
        bonus_amount: round(suggestedRate * (t.bonusPct / 100))
      })
    }
  }

  const maxBonus = bonusTiers.length > 0 ? bonusTiers[bonusTiers.length - 1].bonus_amount : 0
  const totalMax = suggestedRate + exclusivityPremiumAmount + maxBonus

  // Contract terms
  const usageRightsValue = round(suggestedRate * (params.usage_rights_months / 12) * 0.15)

  // Negotiation leverage
  const leverage: string[] = []
  if (params.followers > 500000) leverage.push('High follower count = strong negotiating position for creator')
  if (params.engagement_rate > 5) leverage.push('Above-average engagement justifies premium pricing')
  if (params.deliverables > 3) leverage.push('Volume discount opportunity — push for 10-15% reduction on bulk deliverables')
  if (params.exclusivity) leverage.push('Exclusivity commands 20-30% premium — negotiate for higher fee')
  if (params.usage_rights_months > 6) leverage.push('Extended usage rights beyond 6 months requires additional compensation')

  return {
    rate_benchmark: rateBenchmark,
    exclusivity_premium: {
      applicable: params.exclusivity,
      premium_pct: exclusivityPremiumPct,
      premium_amount: exclusivityPremiumAmount,
      duration_months: params.usage_rights_months
    },
    performance_bonus: { applicable: params.performance_bonus, tiers: bonusTiers },
    total_compensation: {
      base: round(suggestedRate),
      exclusivity_premium: exclusivityPremiumAmount,
      max_performance_bonus: maxBonus,
      total_max: round(totalMax)
    },
    contract_terms: {
      usage_rights_value: usageRightsValue,
      deliverable_value: round(suggestedRate / params.deliverables),
      cost_per_deliverable: round(totalMax / params.deliverables)
    },
    negotiation_leverage: leverage
  }
}

function formatContractReport(result: ContractResult): string {
  const lines: string[] = []
  lines.push('## Contract Negotiation Analysis')
  lines.push('')

  lines.push('### Rate Benchmark Panel')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Market Rate | $${result.rate_benchmark.market_rate.toFixed(0)} |`)
  lines.push(`| Suggested Rate | $${result.rate_benchmark.suggested_rate.toFixed(0)} |`)
  lines.push(`| Rate Range | $${result.rate_benchmark.rate_range.low.toFixed(0)} — $${result.rate_benchmark.rate_range.high.toFixed(0)} |`)
  lines.push(`| Basis | ${result.rate_benchmark.basis} |`)
  lines.push('')

  lines.push('### Exclusivity Premium')
  lines.push(`- **Applicable:** ${result.exclusivity_premium.applicable ? 'Yes' : 'No'}`)
  if (result.exclusivity_premium.applicable) {
    lines.push(`- **Premium:** ${result.exclusivity_premium.premium_pct}% ($${result.exclusivity_premium.premium_amount.toFixed(0)})`)
    lines.push(`- **Duration:** ${result.exclusivity_premium.duration_months} months`)
  }
  lines.push('')

  if (result.performance_bonus.applicable) {
    lines.push('### Performance Bonus Tiers')
    lines.push('| Tier | Performance Threshold | Bonus % | Bonus Amount |')
    lines.push('|------|----------------------|---------|--------------|')
    result.performance_bonus.tiers.forEach((t, i) => {
      lines.push(`| ${i + 1} | ${t.threshold}% of target | ${t.bonus_pct}% | $${t.bonus_amount.toFixed(0)} |`)
    })
    lines.push('')
  }

  lines.push('### Total Compensation Summary')
  lines.push('| Component | Amount |')
  lines.push('|-----------|--------|')
  lines.push(`| Base Fee | $${result.total_compensation.base.toFixed(0)} |`)
  lines.push(`| Exclusivity Premium | $${result.total_compensation.exclusivity_premium.toFixed(0)} |`)
  lines.push(`| Max Performance Bonus | $${result.total_compensation.max_performance_bonus.toFixed(0)} |`)
  lines.push(`| **Total Max** | **$${result.total_compensation.total_max.toFixed(0)}** |`)
  lines.push('')

  lines.push('### Contract Terms')
  lines.push(`- Usage Rights Value: $${result.contract_terms.usage_rights_value.toFixed(0)}`)
  lines.push(`- Cost per Deliverable (base): $${result.contract_terms.deliverable_value.toFixed(0)}`)
  lines.push(`- Cost per Deliverable (max): $${result.contract_terms.cost_per_deliverable.toFixed(0)}`)
  lines.push('')

  lines.push('### Negotiation Leverage Points')
  for (const l of result.negotiation_leverage) {
    lines.push(`- ${l}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: CRISIS GUARDIAN ====================

interface CrisisResult {
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  sentiment_analysis: { overall_score: number; trend: string; alerts: string[] }
  reputation_threats: Array<{ source: string; severity: string; reach: number; action_required: string }>
  growth_anomaly: { detected: boolean; change_pct: number; assessment: string }
  response_sop: Array<{ phase: string; timeframe: string; actions: string[] }>
  monitoring_recommendations: string[]
}

function analyzeCrisisGuardian(input: CrisisInput): CrisisResult {
  // Sentiment analysis
  const avgSentiment = input.recent_posts.length > 0
    ? mean(input.recent_posts.map(p => p.sentiment_score))
    : 0.5

  const sentimentTrend = input.recent_posts.length >= 3
    ? input.recent_posts[input.recent_posts.length - 1].sentiment_score > input.recent_posts[0].sentiment_score
      ? 'improving' : 'declining'
    : 'stable'

  const sentimentAlerts: string[] = []
  if (avgSentiment < 0.3) sentimentAlerts.push('Critically low sentiment scores detected')
  if (sentimentTrend === 'declining') sentimentAlerts.push('Negative sentiment trajectory')

  // Reputation threats
  const threats: CrisisResult['reputation_threats'] = []
  for (const mention of input.mentions) {
    if (mention.sentiment === 'negative' && mention.reach > 10000) {
      threats.push({
        source: mention.source,
        severity: mention.reach > 100000 ? 'high' : 'medium',
        reach: mention.reach,
        action_required: mention.reach > 50000 ? 'Immediate public statement required' : 'Monitor and prepare response draft'
      })
    }
  }

  // Growth anomaly
  const growthAnomalyDetected = Math.abs(input.follower_count_change_pct) > 15
  const growthAssessment = input.follower_count_change_pct > 15 ? 'Unusual spike — possible paid followers' :
    input.follower_count_change_pct < -15 ? 'Significant decline — audience attrition' :
    'Normal fluctuation range'

  // Risk level
  const criticalThreats = threats.filter(t => t.severity === 'high').length
  let riskLevel: CrisisResult['risk_level'] = 'low'
  if (criticalThreats > 0 || avgSentiment < 0.2) riskLevel = 'critical'
  else if (threats.length > 1 || avgSentiment < 0.35) riskLevel = 'high'
  else if (threats.length > 0 || sentimentAlerts.length > 0) riskLevel = 'moderate'

  // Response SOP
  const sop: CrisisResult['response_sop'] = [
    {
      phase: 'Immediate Response',
      timeframe: '0-2 hours',
      actions: [
        'Pause all scheduled content from creator',
        'Assess scope and origin of negative coverage',
        'Alert brand PR team and legal counsel',
        'Draft holding statement if public attention > 50K'
      ]
    },
    {
      phase: 'Active Management',
      timeframe: '2-24 hours',
      actions: [
        'Publish official response aligned with brand voice',
        'Monitor sentiment shift every 30 minutes',
        'Engage supportive creators for counter-narrative',
        'Prepare FAQ for customer-facing teams'
      ]
    },
    {
      phase: 'Recovery Phase',
      timeframe: '1-7 days',
      actions: [
        'Shift content calendar to positive/neutral topics',
        'Deploy UGC campaign to rebuild positive sentiment',
        'Daily sentiment and reach tracking report',
        'Evaluate continued partnership viability'
      ]
    }
  ]

  // Monitoring recommendations
  const recommendations: string[] = [
    'Set up real-time alerts for sentiment drops below 0.3',
    'Monitor competitor mentions for context shift',
    'Track follower velocity — flag changes > 10% in 24h',
    'Weekly deep-dive on comment sentiment analysis'
  ]

  return {
    risk_level: riskLevel,
    sentiment_analysis: { overall_score: round(avgSentiment * 100), trend: sentimentTrend, alerts: sentimentAlerts },
    reputation_threats: threats,
    growth_anomaly: { detected: growthAnomalyDetected, change_pct: round(input.follower_count_change_pct), assessment: growthAssessment },
    response_sop: sop,
    monitoring_recommendations: recommendations
  }
}

function formatCrisisReport(result: CrisisResult): string {
  const lines: string[] = []
  lines.push(`## Crisis Guardian Report — Risk Level: ${result.risk_level.toUpperCase()}`)
  lines.push('')

  lines.push('### Sentiment Analysis Panel')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Overall Sentiment Score | ${result.sentiment_analysis.overall_score.toFixed(0)}/100 |`)
  lines.push(`| Trend | ${result.sentiment_analysis.trend} |`)
  lines.push(`| Active Alerts | ${result.sentiment_analysis.alerts.length} |`)
  lines.push('')

  if (result.sentiment_analysis.alerts.length > 0) {
    lines.push('**Alerts:**')
    for (const a of result.sentiment_analysis.alerts) {
      lines.push(`- ${a}`)
    }
    lines.push('')
  }

  lines.push('### Reputation Threats')
  if (result.reputation_threats.length > 0) {
    lines.push('| Source | Severity | Reach | Action Required |')
    lines.push('|--------|----------|-------|-----------------|')
    for (const t of result.reputation_threats) {
      lines.push(`| ${t.source} | ${t.severity.toUpperCase()} | ${t.reach.toLocaleString()} | ${t.action_required} |`)
    }
  } else {
    lines.push('- No active reputation threats detected')
  }
  lines.push('')

  lines.push('### Growth Anomaly Detection')
  lines.push(`- **Anomaly Detected:** ${result.growth_anomaly.detected ? 'YES' : 'No'}`)
  lines.push(`- **Change:** ${result.growth_anomaly.change_pct >= 0 ? '+' : ''}${result.growth_anomaly.change_pct.toFixed(1)}%`)
  lines.push(`- **Assessment:** ${result.growth_anomaly.assessment}`)
  lines.push('')

  lines.push('### Emergency Response SOP')
  for (const phase of result.response_sop) {
    lines.push(`**${phase.phase}** (${phase.timeframe})`)
    for (const action of phase.actions) {
      lines.push(`- ${action}`)
    }
    lines.push('')
  }

  lines.push('### Monitoring Recommendations')
  for (const r of result.monitoring_recommendations) {
    lines.push(`- ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: COMMUNITY ENGAGEMENT ====================

interface CommunityResult {
  comment_analysis: { total_comments: number; sentiment_breakdown: Record<string, number>; high_priority: Array<{ author: string; text: string; action: string }> }
  fan_tier_analysis: Array<{ tier: string; count: number; engagement_rate: number; value_estimate: number; strategy: string } >
  ugc_opportunities: Array<{ author: string; quality_score: number; reach: number; incentive_suggestion: string }>
  engagement_metrics: { response_rate_recommendation: number; optimal_response_time_min: number; daily_engagement_budget: number }
  community_health: { score: number; trend: string; growth_prediction: string }
}

function analyzeCommunityEngagement(input: CommunityInput): CommunityResult {
  // Comment analysis
  const sentimentBreakdown: Record<string, number> = {}
  for (const c of input.comments) {
    sentimentBreakdown[c.sentiment] = (sentimentBreakdown[c.sentiment] ?? 0) + 1
  }

  const highPriority = input.comments
    .filter(c => c.likes > 100 || c.sentiment === 'negative')
    .map(c => ({
      author: c.author,
      text: c.text.substring(0, 80) + (c.text.length > 80 ? '...' : ''),
      action: c.sentiment === 'negative' ? 'Respond with empathy + resolve issue' : 'Pin comment + acknowledge supporter'
    }))

  // Fan tier analysis
  const fanTierAnalysis = input.fan_tiers.map(ft => {
    const valueEstimate = ft.count * ft.engagement_rate * 0.5
    let strategy = 'Maintain engagement'
    if (ft.tier === 'VIP' || ft.tier === 'Superfan') strategy = 'Exclusive early access + direct communication'
    else if (ft.tier === 'Active') strategy = 'Reward consistency — feature in community highlights'
    else if (ft.tier === 'Casual') strategy = 'Increase touchpoints — interactive polls and challenges'
    else if (ft.tier === 'Lurker') strategy = 'Low-effort engagement — reactions and emoji responses'
    return { ...ft, value_estimate: round(valueEstimate), strategy }
  })

  // UGC opportunities
  const ugcOpportunities = input.ugc_posts
    .filter(u => u.quality_score > 60)
    .map(u => ({
      author: u.author,
      quality_score: u.quality_score,
      reach: u.reach,
      incentive_suggestion: u.quality_score > 85 ? 'Feature on main channel + product gift' :
        u.quality_score > 70 ? 'Discount code + shoutout' : 'Like + comment acknowledgment'
    }))
    .sort((a, b) => b.quality_score - a.quality_score)

  // Engagement metrics
  const totalComments = input.comments.length
  const responseRate = totalComments > 100 ? 15 : totalComments > 50 ? 25 : 50
  const avgSentiment = input.comments.filter(c => c.sentiment === 'positive').length / Math.max(totalComments, 1)

  // Community health
  const healthScore = Math.round(
    (avgSentiment * 40) +
    (input.fan_tiers.filter(f => f.tier !== 'Lurker').length / Math.max(input.fan_tiers.length, 1) * 30) +
    (ugcOpportunities.length > 5 ? 30 : ugcOpportunities.length * 6)
  )
  const trend = avgSentiment > 0.7 ? 'growing' : avgSentiment > 0.4 ? 'stable' : 'declining'

  return {
    comment_analysis: { total_comments: totalComments, sentiment_breakdown: sentimentBreakdown, high_priority: highPriority },
    fan_tier_analysis: fanTierAnalysis,
    ugc_opportunities: ugcOpportunities,
    engagement_metrics: {
      response_rate_recommendation: responseRate,
      optimal_response_time_min: 30,
      daily_engagement_budget: Math.round(totalComments * 0.3)
    },
    community_health: {
      score: Math.min(100, healthScore),
      trend,
      growth_prediction: trend === 'growing' ? '+15-25% monthly growth projected' : trend === 'stable' ? '+5-10% steady growth' : 'Intervention needed to reverse decline'
    }
  }
}

function formatCommunityReport(result: CommunityResult): string {
  const lines: string[] = []
  lines.push('## Community Engagement Report')
  lines.push('')

  lines.push('### Community Health Panel')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Health Score | ${result.community_health.score}/100 |`)
  lines.push(`| Trend | ${result.community_health.trend} |`)
  lines.push(`| Growth Prediction | ${result.community_health.growth_prediction} |`)
  lines.push('')

  lines.push('### Comment Sentiment Breakdown')
  lines.push('| Sentiment | Count | Percentage |')
  lines.push('|-----------|-------|------------|')
  const total = result.comment_analysis.total_comments
  for (const [sentiment, count] of Object.entries(result.comment_analysis.sentiment_breakdown)) {
    lines.push(`| ${sentiment} | ${count} | ${((count / Math.max(total, 1)) * 100).toFixed(1)}% |`)
  }
  lines.push('')

  lines.push('### High-Priority Comments')
  if (result.comment_analysis.high_priority.length > 0) {
    for (const c of result.comment_analysis.high_priority.slice(0, 10)) {
      lines.push(`- **${c.author}:** "${c.text}" → *${c.action}*`)
    }
  } else {
    lines.push('- No high-priority comments requiring immediate attention')
  }
  lines.push('')

  lines.push('### Fan Tier Analysis')
  lines.push('| Tier | Count | Engagement Rate | Value Est. | Strategy |')
  lines.push('|------|-------|-----------------|------------|----------|')
  for (const f of result.fan_tier_analysis) {
    lines.push(`| ${f.tier} | ${f.count.toLocaleString()} | ${f.engagement_rate.toFixed(1)}% | $${f.value_estimate.toFixed(0)} | ${f.strategy} |`)
  }
  lines.push('')

  lines.push('### UGC Opportunities')
  if (result.ugc_opportunities.length > 0) {
    lines.push('| Author | Quality Score | Reach | Incentive |')
    lines.push('|--------|--------------|-------|-----------|')
    for (const u of result.ugc_opportunities.slice(0, 10)) {
      lines.push(`| ${u.author} | ${u.quality_score}/100 | ${u.reach.toLocaleString()} | ${u.incentive_suggestion} |`)
    }
  } else {
    lines.push('- High-quality UGC submissions currently low — consider launching incentive campaign')
  }
  lines.push('')

  lines.push('### Engagement Recommendations')
  lines.push(`- **Response Rate Target:** ${result.engagement_metrics.response_rate_recommendation}%`)
  lines.push(`- **Optimal Response Time:** Within ${result.engagement_metrics.optimal_response_time_min} minutes`)
  lines.push(`- **Daily Engagement Budget:** ${result.engagement_metrics.daily_engagement_budget} interactions`)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Creator Discovery
  tools.register(defineTool({
    name: 'creator_discovery',
    description: 'AI-powered multi-platform creator discovery with 4-axis matching: followers, engagement rate, content tone, and audience demographics. Returns ranked creator leaderboard with tier classification.',
    parameters: {
      creators: { type: 'string', required: true, description: 'JSON array of creator profiles with fields: handle, platform, followers, engagement_rate, avg_likes, avg_comments, content_categories, audience_demographics {age_range, gender_split, top_countries}' },
      criteria: { type: 'string', required: true, description: 'JSON object with discovery criteria: platforms, min_followers, max_followers, min_engagement_rate, content_categories, target_audience, brand_keywords' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { creators: string; criteria: string }) {
      const creatorList: CreatorProfile[] = JSON.parse(args.creators)
      const discoveryCriteria: DiscoveryCriteria = JSON.parse(args.criteria)
      const result = analyzeCreatorDiscovery(creatorList, discoveryCriteria)
      return formatDiscoveryReport(result)
    }
  }))

  // Tool 2: Influencer Vetting
  tools.register(defineTool({
    name: 'influencer_vetting',
    description: 'Deep due diligence on influencer partners. Detects fake followers, calculates brand safety score, analyzes historical collaboration performance, and provides risk-rated approval recommendation.',
    parameters: {
      vet_data: { type: 'string', required: true, description: 'JSON object with creator profile, follower_growth history, comment_sentiment breakdown, brand_collabs array, and controversy_flags array' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { vet_data: string }) {
      const data: VetData = JSON.parse(args.vet_data)
      const result = analyzeInfluencerVetting(data)
      return formatVettingReport(result)
    }
  }))

  // Tool 3: Campaign Orchestrator
  tools.register(defineTool({
    name: 'campaign_orchestrator',
    description: 'Multi-channel influencer campaign planning with AI budget allocation, posting time optimization, content review pipeline, KPI projection, and risk alerts.',
    parameters: {
      campaign_config: { type: 'string', required: true, description: 'JSON object with budget, platforms, creators array (handle, platform, fee, deliverables, followers), timeline, content_guidelines, and kpis array' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { campaign_config: string }) {
      const config: CampaignConfig = JSON.parse(args.campaign_config)
      const result = analyzeCampaignOrchestration(config)
      return formatOrchestrationReport(result)
    }
  }))

  // Tool 4: Content Compliance
  tools.register(defineTool({
    name: 'content_compliance',
    description: 'Automated compliance checking for influencer content. Validates FTC/ASA disclosure rules, platform-specific policies, brand guideline alignment, and flags regulatory risks.',
    parameters: {
      compliance_check: { type: 'string', required: true, description: 'JSON object with content_text, platform, has_paid_partnership_tag, has_ad_disclosure, disclosure_position, brand_guidelines array, and claims_made array' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { compliance_check: string }) {
      const check: ComplianceCheck = JSON.parse(args.compliance_check)
      const result = analyzeContentCompliance(check)
      return formatComplianceReport(result)
    }
  }))

  // Tool 5: ROI Forecaster
  tools.register(defineTool({
    name: 'roi_forecaster',
    description: 'Predict campaign ROI with per-creator forecasting. Calculates CPM, CPE, conversion rates, multi-touch attribution modeling, and scenario analysis (conservative to viral).',
    parameters: {
      roi_input: { type: 'string', required: true, description: 'JSON object with creators array (handle, platform, followers, engagement_rate, fee), budget, campaign_duration_days, industry_benchmarks (avg_cpm, avg_cpe, avg_conversion_rate), attribution_model' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { roi_input: string }) {
      const input: ROIForecastInput = JSON.parse(args.roi_input)
      const result = analyzeROIForecast(input)
      return formatROIReport(result)
    }
  }))

  // Tool 6: Contract Negotiator
  tools.register(defineTool({
    name: 'contract_negotiator',
    description: 'AI-powered contract analysis for influencer partnerships. Benchmarks market rates, calculates exclusivity premiums, designs performance bonus tiers, and identifies negotiation leverage.',
    parameters: {
      contract_params: { type: 'string', required: true, description: 'JSON object with creator_handle, platform, followers, engagement_rate, deliverables, usage_rights_months, exclusivity (boolean), performance_bonus (boolean), industry' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contract_params: string }) {
      const params: ContractParams = JSON.parse(args.contract_params)
      const result = analyzeContractNegotiation(params)
      return formatContractReport(result)
    }
  }))

  // Tool 7: Crisis Guardian
  tools.register(defineTool({
    name: 'crisis_guardian',
    description: 'Early warning system for influencer-related brand risk. Monitors negative sentiment, scans reputation threats, detects follower anomalies, and provides emergency response SOP.',
    parameters: {
      crisis_input: { type: 'string', required: true, description: 'JSON object with creator_handle, recent_posts array (date, content, sentiment_score), mentions array (source, sentiment, reach, summary), risk_keywords, follower_count_change_pct' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { crisis_input: string }) {
      const input: CrisisInput = JSON.parse(args.crisis_input)
      const result = analyzeCrisisGuardian(input)
      return formatCrisisReport(result)
    }
  }))

  // Tool 8: Community Engagement
  tools.register(defineTool({
    name: 'community_engagement',
    description: 'AI-powered community management for influencer audiences. Analyzes comment sentiment, segments fan tiers, identifies UGC opportunities, and optimizes engagement strategy.',
    parameters: {
      community_input: { type: 'string', required: true, description: 'JSON object with platform, comments array (author, text, sentiment, likes), fan_tiers array (tier, count, engagement_rate), ugc_posts array (author, content_type, quality_score, reach)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { community_input: string }) {
      const input: CommunityInput = JSON.parse(args.community_input)
      const result = analyzeCommunityEngagement(input)
      return formatCommunityReport(result)
    }
  }))

  console.log(`[dsh-tool-influencerx] Loaded v${VERSION} — AI Influencer Marketing Engine with 8 tools`)
  console.log('  Tools: creator_discovery, influencer_vetting, campaign_orchestrator, content_compliance, roi_forecaster, contract_negotiator, crisis_guardian, community_engagement')
}
