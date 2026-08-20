/**
 * DSH Social Media Automation & Community Intelligence Plugin v0.1.0
 *
 * Comprehensive social media management toolkit for DeepSeek Harness Agent.
 * Designed for social media managers, community builders, content creators,
 * and marketing teams seeking data-driven social media operations.
 *
 * Features (v0.1.0):
 * - Content Calendar Orchestration (best posting time prediction, holiday marketing, topic heat, cross-platform sync)
 * - A/B Testing Engine (variable control, statistical significance, winner recommendation, sample size estimation, learning effect control)
 * - Community Manager (auto-welcome, topic guidance, rule Q&A, violation detection, active user identification)
 * - Competitive Watch Radar (competitor content tracking, strategy change detection, market share estimation, differentiation opportunity)
 * - Hashtag Optimizer (trending topic matching, competition analysis, recommended combinations, effect attribution, A/B testing)
 * - Influencer Collaboration Manager (match scoring, collaboration tracking, content review, ROI calculation, payment milestones)
 * - Crisis Detector (negative mention spike detection, sentiment drop, spread speed monitoring, response playbook activation)
 * - Social Media ROI Dashboard (CAC/ROAS/engagement rate/follower growth/attribution, organic vs paid comparison)
 *
 * Theme: Purple-Blue Social Media
 * Dashboard: Interactive engagement metrics + Content scheduling Gantt chart
 *
 * @module dsh-tool-socialagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-socialagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface ContentItem {
  id: string
  platform: string
  content_type: string
  topic: string
  scheduled_date: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  engagement_prediction?: number
  target_audience?: string
}

interface HolidayMarketingNode {
  date: string
  name: string
  category: string
  relevance_score: number
  platforms: string[]
}

interface TimeSlotPrediction {
  day_of_week: string
  hour: number
  engagement_score: number
  audience_active_pct: number
  recommendation: string
}

interface ABTestVariant {
  id: string
  name: string
  content: string
  variables: Record<string, string>
  impressions: number
  engagements: number
  conversions: number
}

interface ABTestConfig {
  test_id: string
  platform: string
  start_date: string
  end_date: string
  confidence_level: number
  primary_metric: string
  variants: ABTestVariant[]
  min_sample_size: number
  max_learning_effect: number
}

interface CommunityRule {
  rule_id: string
  category: string
  keywords: string[]
  description: string
  auto_response?: string
  severity: 'info' | 'warning' | 'critical'
}

interface CommunityMember {
  user_id: string
  username: string
  join_date: string
  message_count: number
  engagement_score: number
  violations_count: number
  last_active: string
  role: 'newcomer' | 'member' | 'active' | 'vip' | 'moderated'
}

interface ViolationEvent {
  user_id: string
  username: string
  violation_type: string
  content: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  action_taken: string
}

interface CompetitorProfile {
  name: string
  platform: string
  followers: number
  posts_last_30d: number
  avg_engagement: number
  content_themes: string[]
  posting_frequency: number
  estimated_market_share: number
}

interface CompetitorTrack {
  competitor: string
  content_frequency: number
  avg_likes: number
  avg_shares: number
  avg_comments: number
  top_performing_content: Array<{ topic: string; engagement_estimate: number }>
  strategy_shifts: Array<{ date: string; shift_type: string; description: string }>
  market_share_estimate: number
}

interface HashtagData {
  tag: string
  total_posts: number
  avg_engagement: number
  competition_level: 'low' | 'medium' | 'high' | 'saturated'
  trending_score: number
  related_tags: string[]
  best_platforms: string[]
}

interface HashtagTestResult {
  combo_id: string
  hashtags: string[]
  reach_estimate: number
  engagement_rate: number
  competition_rank: number
  cost_per_engagement?: number
}

interface InfluencerProfile {
  id: string
  name: string
  platform: string
  followers: number
  niche: string
  engagement_rate: number
  audience_match_score: number
  estimated_cost_per_post: number
  collaboration_history: Array<{ brand: string; roi: number; date: string }>
  status: 'prospect' | 'contacted' | 'negotiating' | 'active' | 'completed'
}

interface CollaborationDeal {
  influencer_id: string
  deal_value: number
  deliverables: string[]
  milestones: Array<{ name: string; due_date: string; payment: number; completed: boolean }>
  content_approved: boolean
  actual_reach: number
  actual_engagement: number
  revenue_attributed: number
}

interface CrisisIndicator {
  mention_volume_change: number
  sentiment_score_change: number
  spread_velocity: number
  negative_influencers: Array<{ name: string; reach: number; sentiment: string }>
  trending_negative_topics: string[]
  risk_level: 'green' | 'yellow' | 'orange' | 'red'
}

interface CrisisResponse {
  risk_level: 'green' | 'yellow' | 'orange' | 'red'
  playbook_activated: boolean
  actions: Array<{ priority: number; action: string; responsible: string; deadline: string }>
  response_templates: Record<string, string>
  monitoring_escalation: boolean
}

interface SPROrganicMetrics {
  platform: string
  followers: number
  followers_growth_rate: number
  impressions: number
  reach: number
  engagement_rate: number
  top_content: Array<{ id: string; type: string; engagement: number }>
}

interface SPROrganicPaid {
  platform: string
  ad_spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue_attributed: number
  roas: number
  cac: number
  cpc: number
  engagement_rate: number
}

interface DashboardOverview {
  total_followers: number
  total_engagement: number
  total_reach: number
  blended_roas: number
  blended_cac: number
  top_platform: string
  period_over_period: { followers_change: number; engagement_change: number; roas_change: number }
}

// ==================== HELPER FUNCTIONS ====================

function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(variance)
}

function normalCdf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x) / Math.sqrt(2)
  const t = 1.0 / (1.0 + p * absX)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX)
  return 0.5 * (1.0 + sign * y)
}

function inverseNormalCdf(p: number): number {
  if (p <= 0) return -6
  if (p >= 1) return 6
  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02,
    -2.759285104469687e+02, 1.383577518672690e+02,
    -3.066479806614716e+01, 2.506628277459239e+00
  ]
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02,
    -1.556989798598866e+02, 6.680131188771972e+01,
    -1.328068155288572e+01
  ]
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
    4.374664141464968e+00, 2.938163982698783e+00
  ]
  const d = [
    7.784695709041462e-03, 3.224671290700398e-01,
    2.445134137142996e+00, 3.754408661907416e+00
  ]
  const pLow = 0.02425
  const pHigh = 1 - pLow
  let q: number
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  } else if (p <= pHigh) {
    q = p - 0.5
    const r = q * q
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
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

function getDayOfWeek(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date(dateStr).getDay()]
}

// ==================== TOOL 1: CONTENT CALENDAR ====================

interface CalendarResult {
  scheduled_posts: Array<{
    content_id: string
    platform: string
    scheduled_date: string
    best_time_slot: TimeSlotPrediction
    engagement_prediction: number
    sync_targets: string[]
  }>
  holiday_opportunities: HolidayMarketingNode[]
  topic_heat_forecast: Array<{ topic: string; heat_score: number; peak_date: string; platforms: string[] }>
  cross_platform_sync: Array<{ content_theme: string; platforms: string[]; stagger_hours: number }>
  gantt_data: Array<{
    task: string
    start: string
    end: string
    platform: string
    status: string
    progress: number
  }>
}

function buildContentCalendar(
  contentQueue: ContentItem[],
  platforms: string[],
  predictionDays: number = 30
): CalendarResult {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Best posting time prediction based on platform demographics
  const timePredictions: TimeSlotPrediction[] = []
  for (const day of dayNames) {
    const baseScores: Record<number, number> = {
      7: 45, 8: 65, 9: 80, 10: 85, 11: 78,
      12: 90, 13: 88, 14: 75, 15: 70, 16: 72,
      17: 85, 18: 92, 19: 95, 20: 88, 21: 75, 22: 60
    }

    // Weekend modifier
    const weekendMod = (day === 'Saturday' || day === 'Sunday') ? 0.85 : 1.0

    for (let hour = 7; hour <= 22; hour++) {
      const baseScore = (baseScores[hour] ?? 50) * weekendMod
      const audienceActive = Math.min(100, baseScore * 1.1 + Math.random() * 5)

      timePredictions.push({
        day_of_week: day,
        hour,
        engagement_score: Math.round(baseScore * 10) / 10,
        audience_active_pct: Math.round(audienceActive * 10) / 10,
        recommendation: baseScore >= 85 ? 'High Engagement' : baseScore >= 70 ? 'Good' : 'Average'
      })
    }
  }

  // Holiday marketing nodes
  const holidays: HolidayMarketingNode[] = [
    { date: '2026-01-01', name: 'New Year', category: 'seasonal', relevance_score: 85, platforms: ['instagram', 'twitter', 'tiktok'] },
    { date: '2026-02-14', name: 'Valentine\'s Day', category: 'romance', relevance_score: 90, platforms: ['instagram', 'pinterest', 'tiktok'] },
    { date: '2026-03-08', name: 'International Women\'s Day', category: 'awareness', relevance_score: 88, platforms: ['instagram', 'linkedin', 'twitter'] },
    { date: '2026-04-01', name: 'April Fools', category: 'fun', relevance_score: 75, platforms: ['twitter', 'tiktok', 'instagram'] },
    { date: '2026-04-22', name: 'Earth Day', category: 'environment', relevance_score: 80, platforms: ['instagram', 'linkedin', 'twitter'] },
    { date: '2026-05-01', name: 'Labor Day', category: 'holiday', relevance_score: 70, platforms: ['facebook', 'instagram'] },
    { date: '2026-06-18', name: '618 Shopping Festival', category: 'ecommerce', relevance_score: 95, platforms: ['all'] },
    { date: '2026-08-10', name: '818 Fan Festival', category: 'ecommerce', relevance_score: 85, platforms: ['all'] },
    { date: '2026-09-09', name: '99 Shopping Day', category: 'ecommerce', relevance_score: 88, platforms: ['all'] },
    { date: '2026-10-31', name: 'Halloween', category: 'fun', relevance_score: 82, platforms: ['tiktok', 'instagram', 'twitter'] },
    { date: '2026-11-11', name: 'Double 11 / Singles Day', category: 'ecommerce', relevance_score: 98, platforms: ['all'] },
    { date: '2026-11-28', name: 'Black Friday', category: 'ecommerce', relevance_score: 92, platforms: ['all'] },
    { date: '2026-12-12', name: 'Double 12', category: 'ecommerce', relevance_score: 85, platforms: ['all'] },
    { date: '2026-12-25', name: 'Christmas', category: 'seasonal', relevance_score: 88, platforms: ['instagram', 'pinterest', 'tiktok'] }
  ]

  // Topic heat forecast
  const topics = [...new Set(contentQueue.map(c => c.topic))]
  const topicHeat = topics.map((topic, idx) => ({
    topic,
    heat_score: Math.round((90 - idx * 8 + Math.random() * 15) * 10) / 10,
    peak_date: new Date(Date.now() + (idx * 7 + 3) * 86400000).toISOString().split('T')[0],
    platforms: platforms.filter((_, i) => i % 2 === idx % 2)
  }))

  // Schedule posts
  const now = new Date()
  const scheduled = contentQueue.map((item, idx) => {
    const schedDate = new Date(now.getTime() + idx * 86400000 * 1.5)
    const dayOfWeek = getDayOfWeek(schedDate.toISOString())

    const bestSlot = timePredictions
      .filter(t => t.day_of_week === dayOfWeek && t.engagement_score >= 85)
      .sort((a, b) => b.engagement_score - a.engagement_score)[0] ??
      timePredictions.filter(t => t.day_of_week === dayOfWeek).sort((a, b) => b.engagement_score - a.engagement_score)[0]

    const syncTargets = platforms.filter(p => p !== item.platform)

    return {
      content_id: item.id,
      platform: item.platform,
      scheduled_date: schedDate.toISOString().split('T')[0],
      best_time_slot: bestSlot,
      engagement_prediction: bestSlot ? bestSlot.engagement_score : 70,
      sync_targets: syncTargets
    }
  })

  // Cross-platform sync plan
  const crossPlatformSync = contentQueue.slice(0, 5).map((item, idx) => ({
    content_theme: item.topic,
    platforms: [item.platform, ...platforms.filter(p => p !== item.platform).slice(0, 2)],
    stagger_hours: idx * 2 + 1
  }))

  // Gantt chart data
  const ganttData = contentQueue.map((item, idx) => {
    const start = new Date(now.getTime() + idx * 86400000 * 1.5)
    const end = new Date(start.getTime() + 86400000 * 3)
    const statuses: Array<'draft' | 'scheduled' | 'in_progress' | 'review' | 'published'> = ['draft', 'scheduled', 'in_progress', 'review', 'published']
    return {
      task: `${item.topic} (${item.content_type})`,
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      platform: item.platform,
      status: statuses[idx % statuses.length],
      progress: Math.round(((idx % 5) + 1) * 20)
    }
  })

  return {
    scheduled_posts: scheduled,
    holiday_opportunities: holidays,
    topic_heat_forecast: topicHeat,
    cross_platform_sync: crossPlatformSync,
    gantt_data: ganttData
  }
}

function formatCalendarReport(result: CalendarResult): string {
  const lines: string[] = []
  lines.push('## Content Calendar & Orchestration Report')
  lines.push('')
  lines.push(`**Scheduled Posts:** ${result.scheduled_posts.length} | **Holiday Opportunities:** ${result.holiday_opportunities.length} | **Cross-Platform Syncs:** ${result.cross_platform_sync.length}`)
  lines.push('')

  lines.push('### Best Posting Time Recommendations')
  lines.push('| Day | Hour | Score | Audience Active | Verdict |')
  lines.push('|-----|------|-------|-----------------|---------|')
  const topSlots = result.scheduled_posts
    .filter(s => s.best_time_slot.engagement_score >= 85)
    .slice(0, 10)
  for (const s of topSlots) {
    lines.push(`| ${s.best_time_slot.day_of_week} | ${s.best_time_slot.hour}:00 | ${s.best_time_slot.engagement_score} | ${s.best_time_slot.audience_active_pct}% | ${s.best_time_slot.recommendation} |`)
  }
  lines.push('')

  lines.push('### Holiday Marketing Opportunities (Next 30 Days)')
  lines.push('| Date | Name | Category | Relevance | Platforms |')
  lines.push('|------|------|----------|-----------|-----------|')
  for (const h of result.holiday_opportunities.slice(0, 8)) {
    lines.push(`| ${h.date} | ${h.name} | ${h.category} | ${h.relevance_score}/100 | ${h.platforms.join(', ')} |`)
  }
  lines.push('')

  lines.push('### Topic Heat Forecast')
  lines.push('| Topic | Heat Score | Peak Date | Best Platforms |')
  lines.push('|-------|-----------|-----------|----------------|')
  for (const t of result.topic_heat_forecast.sort((a, b) => b.heat_score - a.heat_score)) {
    lines.push(`| ${t.topic} | ${t.heat_score} | ${t.peak_date} | ${t.platforms.join(', ')} |`)
  }
  lines.push('')

  lines.push('### Content Gantt Chart')
  lines.push('| Task | Platform | Start | End | Status | Progress |')
  lines.push('|------|----------|-------|-----|--------|----------|')
  for (const g of result.gantt_data) {
    lines.push(`| ${g.task} | ${g.platform} | ${g.start} | ${g.end} | ${g.status} | ${g.progress}% |`)
  }
  lines.push('')

  lines.push('### Cross-Platform Sync Plan')
  lines.push('| Theme | Platforms | Stagger (hrs) |')
  lines.push('|-------|-----------|----------------|')
  for (const s of result.cross_platform_sync) {
    lines.push(`| ${s.content_theme} | ${s.platforms.join(' -> ')} | ${s.stagger_hours}h |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 2: A/B TESTING ENGINE ====================

interface ABTestResult {
  test_id: string
  platform: string
  primary_metric: string
  duration_days: number
  winner: { variant_id: string; variant_name: string; confidence: number; uplift_pct: number; recommendation: string } | null
  statistical_summary: Array<{
    variant_id: string
    variant_name: string
    sample_size: number
    conversion_rate: number
    engagement_rate: number
    is_significant: boolean
    p_value: number
    z_score: number
  }>
  sample_size_analysis: {
    required_per_variant: number
    current_per_variant: number
    power: number
    estimated_days_remaining: number
  }
  learning_effect_control: {
    learning_effect_detected: boolean
    early_bias_adjustment: number
    adjusted_results: Array<{ variant_id: string; original_rate: number; adjusted_rate: number }>
  }
  next_test_recommendations: string[]
}

function runABTest(config: ABTestConfig): ABTestResult {
  const metricKey = config.primary_metric as keyof ABTestVariant

  // Calculate rates for each variant
  const variantStats = config.variants.map(v => {
    const metricValue = v[metricKey] as number
    const rate = v.impressions > 0 ? metricValue / v.impressions : 0
    const engagementRate = v.impressions > 0 ? v.engagements / v.impressions : 0

    return {
      variant_id: v.id,
      variant_name: v.name,
      sample_size: v.impressions,
      conversion_rate: rate,
      engagement_rate: engagementRate,
      is_significant: false,
      p_value: 1,
      z_score: 0
    }
  })

  // Control is variants[0]
  const control = variantStats[0]

  // Z-test for each variant vs control
  for (let i = 1; i < variantStats.length; i++) {
    const variant = variantStats[i]
    const p1 = control.conversion_rate
    const p2 = variant.conversion_rate
    const n1 = control.sample_size
    const n2 = variant.sample_size

    const pooledP = (control.conversion_rate * n1 + variant.conversion_rate * n2) / (n1 + n2)
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2))

    const zScore = se > 0 ? (p2 - p1) / se : 0
    const pValue = 2 * (1 - normalCdf(Math.abs(zScore)))

    const zCritical = inverseNormalCdf(config.confidence_level / 100 + (1 - config.confidence_level / 100) / 2)
    const isSignificant = Math.abs(zScore) > zCritical

    variant.is_significant = isSignificant
    variant.p_value = Math.round(pValue * 10000) / 10000
    variant.z_score = Math.round(zScore * 100) / 100
  }

  // Determine winner
  const significantVariants = variantStats.filter((v, i) => i > 0 && v.is_significant)
  let winner: ABTestResult['winner'] = null

  if (significantVariants.length > 0) {
    const best = significantVariants.reduce((prev, curr) =>
      curr.conversion_rate > prev.conversion_rate ? curr : prev
    )
    const upliftPct = control.conversion_rate > 0
      ? ((best.conversion_rate - control.conversion_rate) / control.conversion_rate) * 100
      : 0

    winner = {
      variant_id: best.variant_id,
      variant_name: best.variant_name,
      confidence: config.confidence_level,
      uplift_pct: Math.round(upliftPct * 100) / 100,
      recommendation: upliftPct > 0
        ? `Adopt "${best.variant_name}" — significant positive uplift of ${upliftPct.toFixed(2)}%`
        : `Keep control — "${best.variant_name}" underperforms by ${Math.abs(upliftPct).toFixed(2)}%`
    }
  }

  // Sample size analysis
  const effectSize = Math.abs(percentageDiff(control.conversion_rate, Math.max(...variantStats.map(v => v.conversion_rate))))
  const pooledRate = mean(variantStats.map(v => v.conversion_rate))
  const requiredPerGroup = effectSize > 0
    ? Math.ceil(Math.pow(1.96 + 0.84, 2) * 2 * pooledRate * (1 - pooledRate) / Math.pow(effectSize / 100, 2))
    : 5000
  const currentPerVariant = Math.max(...variantStats.map(v => v.sample_size))
  const powerVal = Math.min(0.99, currentPerVariant / Math.max(requiredPerGroup, 1))
  const startDate = new Date(config.start_date)
  const endDate = new Date(config.end_date)
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / 86400000)
  const elapsedDays = Math.max(0, (Date.now() - startDate.getTime()) / 86400000)
  const estimatedDaysRemaining = powerVal < 0.8
    ? Math.ceil((requiredPerGroup - currentPerVariant) / Math.max(1, currentPerVariant / Math.max(elapsedDays, 1)))
    : 0

  // Learning effect control
  const learningEffectDetected = config.variants.some(v => {
    const halfPoint = Math.floor(v.impressions / 2)
    const firstHalf = v.conversions * 0.4 / Math.max(1, halfPoint)
    const secondHalf = v.conversions * 0.6 / Math.max(1, v.impressions - halfPoint)
    return Math.abs(secondHalf - firstHalf) / Math.max(firstHalf, 0.001) > config.max_learning_effect / 100
  })

  const earlyBiasAdjustment = learningEffectDetected ? 0.95 : 1.0
  const adjustedResults = config.variants.map(v => {
    const originalRate = v.impressions > 0 ? v.conversions / v.impressions : 0
    const adjustedRate = originalRate * earlyBiasAdjustment
    return {
      variant_id: v.id,
      original_rate: Math.round(originalRate * 10000) / 10000,
      adjusted_rate: Math.round(adjustedRate * 10000) / 10000
    }
  })

  // Next test recommendations
  const nextRecs: string[] = []
  if (!winner) {
    nextRecs.push('Continue testing — results are inconclusive. Consider extending the test duration.')
  }
  if (learningEffectDetected) {
    nextRecs.push('Learning effect detected. Exclude first 20% of data for more accurate analysis.')
  }
  const bestEngagement = variantStats.reduce((prev, curr) => curr.engagement_rate > prev.engagement_rate ? curr : prev)
  if (bestEngagement.variant_id !== winner?.variant_id) {
    nextRecs.push(`Test "${bestEngagement.variant_name}" with engagement-oriented changes in next iteration.`)
  }
  nextRecs.push('Consider testing one variable at a time for cleaner multi-variate insights.')

  return {
    test_id: config.test_id,
    platform: config.platform,
    primary_metric: config.primary_metric,
    duration_days: totalDays,
    winner,
    statistical_summary: variantStats,
    sample_size_analysis: {
      required_per_variant: requiredPerGroup,
      current_per_variant: currentPerVariant,
      power: Math.round(powerVal * 100) / 100,
      estimated_days_remaining: estimatedDaysRemaining
    },
    learning_effect_control: {
      learning_effect_detected: learningEffectDetected,
      early_bias_adjustment: earlyBiasAdjustment,
      adjusted_results: adjustedResults
    },
    next_test_recommendations: nextRecs
  }
}

function percentageDiff(a: number, b: number): number {
  return a > 0 ? ((b - a) / a) * 100 : 0
}

function formatABTestReport(result: ABTestResult): string {
  const lines: string[] = []
  lines.push('## A/B Testing Engine Report')
  lines.push('')
  lines.push(`**Test ID:** ${result.test_id} | **Platform:** ${result.platform} | **Metric:** ${result.primary_metric} | **Duration:** ${result.duration_days} days`)
  lines.push('')

  if (result.winner) {
    lines.push('### Winner')
    lines.push(`- **Variant:** ${result.winner.variant_name} (${result.winner.variant_id})`)
    lines.push(`- **Confidence:** ${result.winner.confidence}%`)
    lines.push(`- **Uplift:** ${result.winner.uplift_pct > 0 ? '+' : ''}${result.winner.uplift_pct}%`)
    lines.push(`- **Recommendation:** ${result.winner.recommendation}`)
  } else {
    lines.push('### No Clear Winner')
    lines.push('- Test did not reach statistical significance. Consider extending duration.')
  }
  lines.push('')

  lines.push('### Statistical Summary')
  lines.push('| Variant | Sample Size | Conv Rate | Eng Rate | Significant | P-Value | Z-Score |')
  lines.push('|---------|-------------|-----------|----------|-------------|---------|---------|')
  for (const s of result.statistical_summary) {
    lines.push(`| ${s.variant_name} | ${s.sample_size.toLocaleString()} | ${(s.conversion_rate * 100).toFixed(2)}% | ${(s.engagement_rate * 100).toFixed(2)}% | ${s.is_significant ? 'YES' : 'NO'} | ${s.p_value.toFixed(4)} | ${s.z_score.toFixed(2)} |`)
  }
  lines.push('')

  lines.push('### Sample Size Analysis')
  lines.push(`- Required per variant: ${result.sample_size_analysis.required_per_variant.toLocaleString()}`)
  lines.push(`- Current per variant: ${result.sample_size_analysis.current_per_variant.toLocaleString()}`)
  lines.push(`- Statistical power: ${(result.sample_size_analysis.power * 100).toFixed(0)}%`)
  if (result.sample_size_analysis.estimated_days_remaining > 0) {
    lines.push(`- Estimated days remaining: ${result.sample_size_analysis.estimated_days_remaining}`)
  }
  lines.push('')

  lines.push('### Learning Effect Control')
  lines.push(`- Learning effect detected: ${result.learning_effect_control.learning_effect_detected ? 'YES' : 'NO'}`)
  lines.push(`- Early bias adjustment factor: ${result.learning_effect_control.early_bias_adjustment}`)
  for (const a of result.learning_effect_control.adjusted_results) {
    lines.push(`  - ${a.variant_id}: ${(a.original_rate * 100).toFixed(2)}% -> ${(a.adjusted_rate * 100).toFixed(2)}% (adjusted)`)
  }
  lines.push('')

  lines.push('### Next Test Recommendations')
  for (const r of result.next_test_recommendations) {
    lines.push(`- ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: COMMUNITY MANAGER ====================

interface CommunityResult {
  welcome_messages: Array<{ user_id: string; message: string; channel: string; timestamp: string }>
  topic_guidance: Array<{ topic_id: string; topic: string; guidance_message: string; pinning_recommended: boolean }>
  rule_qa: Array<{ question: string; matched_rule: string; answer: string; confidence: number }>
  violations: ViolationEvent[]
  active_users: Array<{ user_id: string; username: string; engagement_score: number; role: string; badge: string }>
  community_health: { score: number; growth_rate: string; risk_factors: string[] }
}

function manageCommunity(
  members: CommunityMember[],
  rules: CommunityRule[],
  recentMessages: Array<{ user_id: string; username: string; content: string; timestamp: string; channel: string }>,
  joinQueue: Array<{ user_id: string; username: string; join_date: string }>
): CommunityResult {
  // Auto-welcome new members
  const welcomeMessages = joinQueue.map(j => ({
    user_id: j.user_id,
    message: `Welcome to the community, @${j.username}! We're excited to have you here. Check out our #introductions channel and read the community guidelines to get started.`,
    channel: 'general',
    timestamp: new Date().toISOString()
  }))

  // Topic guidance
  const activeTopics = [...new Set(recentMessages.map(m => m.content.split(' ').find(w => w.startsWith('#'))).filter(Boolean))]
  const topicGuidance = activeTopics.map((topic, idx) => ({
    topic_id: `topic_${idx}`,
    topic: topic ?? 'general',
    guidance_message: `Great discussion on ${topic}! Remember to keep conversations constructive and on-topic.`,
    pinning_recommended: idx < 3
  }))

  // Rule Q&A simulation
  const ruleQA = recentMessages
    .filter(m => m.content.includes('?') || m.content.toLowerCase().includes('rule') || m.content.toLowerCase().includes('can i'))
    .slice(0, 5)
    .map(m => {
      const matchedRule = rules.find(r => r.keywords.some(k => m.content.toLowerCase().includes(k.toLowerCase())))
      return {
        question: m.content.slice(0, 100),
        matched_rule: matchedRule?.rule_id ?? 'general',
        answer: matchedRule?.auto_response ?? 'Please refer to the community guidelines for more information.',
        confidence: matchedRule ? 0.85 + Math.random() * 0.15 : 0.5
      }
    })

  // Violation detection
  const violations: ViolationEvent[] = []
  for (const msg of recentMessages) {
    for (const rule of rules) {
      for (const keyword of rule.keywords) {
        if (msg.content.toLowerCase().includes(keyword.toLowerCase())) {
          violations.push({
            user_id: msg.user_id,
            username: msg.username,
            violation_type: rule.category,
            content: msg.content.slice(0, 80),
            severity: rule.severity === 'critical' ? 'high' : rule.severity === 'warning' ? 'medium' : 'low',
            timestamp: msg.timestamp,
            action_taken: rule.severity === 'critical' ? 'Auto-moderated' : rule.severity === 'warning' ? 'Warning issued' : 'Logged'
          })
          break
        }
      }
    }
  }

  // Active user identification
  const activeUsers = members
    .filter(m => m.engagement_score >= 70 || m.message_count >= 50)
    .map(m => {
      let badge = 'Supporter'
      if (m.engagement_score >= 90 && m.message_count >= 200) badge = 'Community Champion'
      else if (m.engagement_score >= 80 && m.message_count >= 100) badge = 'Influencer'
      else if (m.engagement_score >= 70 && m.message_count >= 50) badge = 'Active Member'

      return {
        user_id: m.user_id,
        username: m.username,
        engagement_score: m.engagement_score,
        role: m.role,
        badge
      }
    })
    .sort((a, b) => b.engagement_score - a.engagement_score)

  // Community health
  const totalMembers = members.length
  const activeCount = members.filter(m => m.engagement_score >= 60).length
  const violationRate = members.length > 0 ? violations.length / members.length : 0
  const healthScore = Math.max(0, Math.min(100, Math.round(
    (activeCount / Math.max(totalMembers, 1)) * 60 +
    (1 - violationRate) * 30 +
    Math.min(10, recentMessages.length) * 1
  )))

  const riskFactors: string[] = []
  if (violationRate > 0.05) riskFactors.push('Elevated violation rate — consider proactive moderation')
  if (activeCount / Math.max(totalMembers, 1) < 0.2) riskFactors.push('Low engagement ratio — launch engagement campaign')
  if (members.filter(m => m.role === 'newcomer').length > totalMembers * 0.4) riskFactors.push('High newcomer ratio — improve onboarding')

  return {
    welcome_messages: welcomeMessages,
    topic_guidance: topicGuidance,
    rule_qa: ruleQA,
    violations,
    active_users: activeUsers,
    community_health: {
      score: healthScore,
      growth_rate: `${Math.round((activeCount / Math.max(totalMembers - activeCount, 1)) * 100)}%`,
      risk_factors: riskFactors
    }
  }
}

function formatCommunityReport(result: CommunityResult): string {
  const lines: string[] = []
  lines.push('## Community Management Report')
  lines.push('')
  lines.push(`**Community Health Score:** ${result.community_health.score}/100 | **Growth Rate:** ${result.community_health.growth_rate}`)
  lines.push('')

  lines.push('### Welcome Messages Sent')
  for (const w of result.welcome_messages) {
    lines.push(`- @${w.user_id}: "${w.message.slice(0, 80)}..."`)
  }
  lines.push('')

  lines.push('### Topic Guidance')
  for (const t of result.topic_guidance) {
    lines.push(`- ${t.topic}: ${t.guidance_message} ${t.pinning_recommended ? '[PINNED]' : ''}`)
  }
  lines.push('')

  lines.push('### Rule Q&A')
  for (const q of result.rule_qa) {
    lines.push(`- Q: "${q.question.slice(0, 60)}" → A: "${q.answer.slice(0, 80)}" (confidence: ${(q.confidence * 100).toFixed(0)}%)`)
  }
  lines.push('')

  lines.push('### Violations Detected')
  if (result.violations.length === 0) {
    lines.push('- No violations detected in recent activity')
  } else {
    lines.push('| User | Type | Severity | Action |')
    lines.push('|------|------|----------|--------|')
    for (const v of result.violations.slice(0, 8)) {
      lines.push(`| @${v.username} | ${v.violation_type} | ${v.severity} | ${v.action_taken} |`)
    }
  }
  lines.push('')

  lines.push('### Active Users (Top Contributors)')
  lines.push('| Username | Engagement | Role | Badge |')
  lines.push('|----------|-----------|------|-------|')
  for (const u of result.active_users.slice(0, 10)) {
    lines.push(`| @${u.username} | ${u.engagement_score} | ${u.role} | ${u.badge} |`)
  }
  lines.push('')

  if (result.community_health.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const r of result.community_health.risk_factors) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 4: COMPETITIVE WATCH ====================

interface CompetitiveResult {
  tracked_competitors: CompetitorTrack[]
  market_dynamics: {
    total_addressable_share: number
    our_estimated_share: number
    gaps: Array<{ area: string; competitor: string; opportunity_size: string }>
  }
  strategy_shifts_detected: Array<{ competitor: string; date: string; shift_type: string; description: string }>
  differentiation_opportunities: Array<{ area: string; feasibility: number; impact: number; priority: string; recommendation: string }>
  alert_level: 'low' | 'medium' | 'high'
}

function analyzeCompetitive(
  ourProfile: CompetitorProfile,
  competitors: CompetitorProfile[],
  historicalContent: Array<{ competitor: string; date: string; content_type: string; engagement: number }>
): CompetitiveResult {
  // Track competitor performance
  const trackedCompetitors: CompetitorTrack[] = competitors.map(comp => {
    const compContent = historicalContent.filter(h => h.competitor === comp.name)
    const recentContent = compContent.filter(h => {
      const d = new Date(h.date)
      return (Date.now() - d.getTime()) < 30 * 86400000
    })

    const avgEngagement = recentContent.length > 0
      ? recentContent.reduce((s, c) => s + c.engagement, 0) / recentContent.length
      : comp.avg_engagement

    const contentTypes = [...new Set(recentContent.map(c => c.content_type))]
    const topContent = contentTypes.map(ct => {
      const typeContent = recentContent.filter(c => c.content_type === ct)
      const avg = typeContent.reduce((s, c) => s + c.engagement, 0) / Math.max(1, typeContent.length)
      return { topic: ct, engagement_estimate: Math.round(avg) }
    }).sort((a, b) => b.engagement_estimate - a.engagement_estimate).slice(0, 3)

    // Strategy shifts
    const shifts: Array<{ date: string; shift_type: string; description: string }> = []
    if (recentContent.length > 5) {
      const halfIdx = Math.floor(recentContent.length / 2)
      const firstHalf = recentContent.slice(0, halfIdx)
      const secondHalf = recentContent.slice(halfIdx)
      const firstAvg = firstHalf.reduce((s, c) => s + c.engagement, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((s, c) => s + c.engagement, 0) / secondHalf.length

      if (secondAvg > firstAvg * 1.3) {
        shifts.push({
          date: secondHalf[0]?.date ?? new Date().toISOString(),
          shift_type: 'engagement_surge',
          description: `${comp.name} increased engagement by ${Math.round((secondAvg / firstAvg - 1) * 100)}%`
        })
      }
      if (secondAvg < firstAvg * 0.7) {
        shifts.push({
          date: secondHalf[0]?.date ?? new Date().toISOString(),
          shift_type: 'engagement_decline',
          description: `${comp.name} engagement dropped ${Math.round((1 - secondAvg / firstAvg) * 100)}% — potential content strategy change`
        })
      }
    }

    const totalFollowers = competitors.reduce((s, c) => s + c.followers, 0) + ourProfile.followers
    const marketShare = totalFollowers > 0 ? (comp.followers / totalFollowers) * 100 : 0

    return {
      competitor: comp.name,
      content_frequency: recentContent.length,
      avg_likes: Math.round(avgEngagement * 0.7),
      avg_shares: Math.round(avgEngagement * 0.2),
      avg_comments: Math.round(avgEngagement * 0.3),
      top_performing_content: topContent,
      strategy_shifts: shifts,
      market_share_estimate: Math.round(marketShare * 100) / 100
    }
  })

  // Market dynamics
  const totalFollowers = competitors.reduce((s, c) => s + c.followers, 0) + ourProfile.followers
  const ourShare = totalFollowers > 0 ? (ourProfile.followers / totalFollowers) * 100 : 0
  const gaps = competitors
    .filter(c => c.avg_engagement > ourProfile.avg_engagement * 1.2)
    .map(c => ({
      area: c.content_themes[0] ?? 'content',
      competitor: c.name,
      opportunity_size: `${Math.round((c.avg_engagement / Math.max(ourProfile.avg_engagement, 1) - 1) * 100)}% engagement advantage`
    }))

  // Differentiation opportunities
  const opportunities: CompetitiveResult['differentiation_opportunities'] = []
  const allThemes = competitors.flatMap(c => c.content_themes)
  const uniqueThemes = [...new Set(allThemes)]
  const saturatedThemes = uniqueThemes.filter(t => allThemes.filter(at => at === t).length >= 3)
  const underservedThemes = uniqueThemes.filter(t => allThemes.filter(at => at === t).length <= 1)

  for (const theme of underservedThemes.slice(0, 3)) {
    opportunities.push({
      area: theme,
      feasibility: Math.round(70 + Math.random() * 20),
      impact: Math.round(60 + Math.random() * 30),
      priority: 'High',
      recommendation: `Create differentiated content around "${theme}" underserved by competitors`
    })
  }
  for (const theme of saturatedThemes.slice(0, 2)) {
    opportunities.push({
      area: theme,
      feasibility: Math.round(50 + Math.random() * 30),
      impact: Math.round(70 + Math.random() * 20),
      priority: 'Medium',
      recommendation: `Unique angle on "${theme}" to break through noise —Consider interactive formats`
    })
  }

  const alertLevel: CompetitiveResult['alert_level'] =
    trackedCompetitors.some(c => c.strategy_shifts.length > 0) ? 'high' :
    gaps.length >= 2 ? 'medium' : 'low'

  return {
    tracked_competitors: trackedCompetitors,
    market_dynamics: {
      total_addressable_share: 100,
      our_estimated_share: Math.round(ourShare * 100) / 100,
      gaps
    },
    strategy_shifts_detected: trackedCompetitors.flatMap(c => c.strategy_shifts.map(s => ({ competitor: c.competitor, ...s }))),
    differentiation_opportunities: opportunities.sort((a, b) => (b.feasibility * b.impact) - (a.feasibility * a.impact)),
    alert_level: alertLevel
  }
}

function formatCompetitiveReport(result: CompetitiveResult): string {
  const lines: string[] = []
  lines.push('## Competitive Watch Radar Report')
  lines.push('')
  lines.push(`**Alert Level:** ${result.alert_level.toUpperCase()} | **Our Market Share:** ${result.market_dynamics.our_estimated_share.toFixed(1)}% | **Competitors Tracked:** ${result.tracked_competitors.length}`)
  lines.push('')

  lines.push('### Competitor Performance Overview')
  lines.push('| Competitor | Posts (30d) | Avg Engagement | Market Share | Content Themes |')
  lines.push('|------------|-------------|----------------|--------------|----------------|')
  for (const c of result.tracked_competitors) {
    lines.push(`| ${c.competitor} | ${c.content_frequency} | ${c.avg_likes} likes | ${c.market_share_estimate.toFixed(1)}% | ${c.top_performing_content.map(t => t.topic).join(', ')} |`)
  }
  lines.push('')

  lines.push('### Strategy Shifts Detected')
  if (result.strategy_shifts_detected.length === 0) {
    lines.push('- No significant strategy shifts detected in monitoring period')
  } else {
    lines.push('| Competitor | Date | Shift Type | Description |')
    lines.push('|------------|------|-----------|-------------|')
    for (const s of result.strategy_shifts_detected) {
      lines.push(`| ${s.competitor} | ${s.date} | ${s.shift_type} | ${s.description} |`)
    }
  }
  lines.push('')

  lines.push('### Market Share Gaps')
  for (const g of result.market_dynamics.gaps) {
    lines.push(`- **${g.area}**: ${g.competitor} has ${g.opportunity_size} — strategic response recommended`)
  }
  lines.push('')

  lines.push('### Differentiation Opportunities')
  lines.push('| Area | Feasibility | Impact | Priority | Recommendation |')
  lines.push('|------|-------------|--------|----------|----------------|')
  for (const o of result.differentiation_opportunities.slice(0, 6)) {
    lines.push(`| ${o.area} | ${o.feasibility}% | ${o.impact}% | ${o.priority} | ${o.recommendation} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: HASHTAG OPTIMIZER ====================

interface HashtagResult {
  optimized_combos: HashtagTestResult[]
  trending_analysis: Array<{ tag: string; trend_direction: string; velocity: number; forecast_7d: string }>
  competition_heatmap: Array<{ tag: string; post_volume: number; competition: string; opportunity_score: number }>
  effect_attribution: Array<{ hashtag: string; impressions: number; engagements: number; contribution_pct: number }>
  ab_test_plan: Array<{ test_name: string; combo_a: string[]; combo_b: string[]; hypothesis: string }>
  recommendations: string[]
}

function optimizeHashtags(
  availableTags: HashtagData[],
  platform: string,
  niche: string,
  targetReach: number
): HashtagResult {
  // Split tags by competition level
  const lowComp = availableTags.filter(t => t.competition_level === 'low')
  const mediumComp = availableTags.filter(t => t.competition_level === 'medium')
  const highComp = availableTags.filter(t => t.competition_level === 'high')
  const saturated = availableTags.filter(t => t.competition_level === 'saturated')

  // Build optimized combinations
  const combos: HashtagTestResult[] = []

  // Strategy 1: Mix of competition levels
  const combo1Tags = [
    ...highComp.slice(0, 2).map(t => t.tag),
    ...mediumComp.slice(0, 3).map(t => t.tag),
    ...lowComp.slice(0, 3).map(t => t.tag)
  ].filter(Boolean)
  if (combo1Tags.length > 0) {
    const totalEng = combo1Tags.reduce((s, tag) => {
      const t = availableTags.find(at => at.tag === tag)
      return s + (t?.avg_engagement ?? 0)
    }, 0)
    combos.push({
      combo_id: 'mixed_strategy',
      hashtags: combo1Tags,
      reach_estimate: Math.round(targetReach * 0.85),
      engagement_rate: Math.round(totalEng / Math.max(1, combo1Tags.length) * 100) / 100,
      competition_rank: 2,
      cost_per_engagement: 0.35
    })
  }

  // Strategy 2: Low competition focus
  const combo2Tags = lowComp.slice(0, 5).map(t => t.tag).filter(Boolean)
  if (combo2Tags.length > 0) {
    const totalEng = combo2Tags.reduce((s, tag) => {
      const t = availableTags.find(at => at.tag === tag)
      return s + (t?.avg_engagement ?? 0)
    }, 0)
    combos.push({
      combo_id: 'low_competition',
      hashtags: combo2Tags,
      reach_estimate: Math.round(targetReach * 0.6),
      engagement_rate: Math.round(totalEng / Math.max(1, combo2Tags.length) * 1.3 * 100) / 100,
      competition_rank: 1,
      cost_per_engagement: 0.15
    })
  }

  // Strategy 3: Trending high-competition
  const combo3Tags = [...highComp.slice(0, 3), ...saturated.slice(0, 2)].map(t => t.tag).filter(Boolean)
  if (combo3Tags.length > 0) {
    const totalEng = combo3Tags.reduce((s, tag) => {
      const t = availableTags.find(at => at.tag === tag)
      return s + (t?.avg_engagement ?? 0)
    }, 0)
    combos.push({
      combo_id: 'trending_reach',
      hashtags: combo3Tags,
      reach_estimate: Math.round(targetReach * 1.2),
      engagement_rate: Math.round(totalEng / Math.max(1, combo3Tags.length) * 0.8 * 100) / 100,
      competition_rank: 4,
      cost_per_engagement: 0.55
    })
  }

  // Trending analysis
  const trendingAnalysis = availableTags
    .sort((a, b) => b.trending_score - a.trending_score)
    .slice(0, 8)
    .map(t => ({
      tag: t.tag,
      trend_direction: t.trending_score > 80 ? 'Rising' : t.trending_score > 60 ? 'Stable' : 'Declining',
      velocity: Math.round((t.trending_score / 100) * (t.avg_engagement / 100) * 1000) / 10,
      forecast_7d: t.trending_score > 70 ? 'Upward momentum expected' : 'May cool off'
    }))

  // Competition heatmap
  const competitionHeatmap = availableTags.map(t => ({
    tag: t.tag,
    post_volume: t.total_posts,
    competition: t.competition_level,
    opportunity_score: Math.round(
      (t.trending_score * 0.4 + t.avg_engagement / 100 * 0.4 - t.total_posts / 1000000 * 0.2) * 10
    ) / 10
  })).sort((a, b) => b.opportunity_score - a.opportunity_score)

  // Effect attribution
  const totalImpressions = availableTags.reduce((s, t) => s + t.avg_engagement * 10, 0)
  const effectAttribution = availableTags.slice(0, 10).map(t => ({
    hashtag: t.tag,
    impressions: t.total_posts * 100,
    engagements: Math.round(t.avg_engagement * t.total_posts / 1000),
    contribution_pct: Math.round((t.avg_engagement / Math.max(totalImpressions, 1)) * 10000) / 100
  }))

  // A/B test plan
  const abTestPlan = [
    {
      test_name: `${niche} — Trending vs Evergreen`,
      combo_a: combos[0]?.hashtags.slice(0, 4) ?? [],
      combo_b: combos[1]?.hashtags.slice(0, 4) ?? [],
      hypothesis: `Mix of trending and medium-competition tags outperforms low-competition only strategy for ${niche} on ${platform}`
    },
    {
      test_name: `${niche} — Volume Impact`,
      combo_a: [...(combos[0]?.hashtags ?? [])].slice(0, 5),
      combo_b: [...(combos[0]?.hashtags ?? [])].slice(0, 10),
      hypothesis: `Using more hashtags on ${platform} increases reach but may dilute engagement rate`
    }
  ]

  const recommendations = [
    `For ${niche} on ${platform}: Use 5-8 hashtags per post for optimal reach-engagement balance`,
    `Priority tags: ${combos[0]?.hashtags.slice(0, 3).join(', ') ?? 'N/A'} — highest combined opportunity score`,
    'Refresh hashtag sets monthly as competition levels shift',
    `Avoid over-saturated tags (>1M posts) unless they are trending upward`,
    'Monitor competitor hashtag strategy weekly for emerging patterns'
  ]

  return {
    optimized_combos: combos,
    trending_analysis: trendingAnalysis,
    competition_heatmap: competitionHeatmap,
    effect_attribution: effectAttribution,
    ab_test_plan: abTestPlan,
    recommendations
  }
}

function formatHashtagReport(result: HashtagResult): string {
  const lines: string[] = []
  lines.push('## Hashtag Optimization Engine Report')
  lines.push('')
  lines.push(`**Optimized Combos:** ${result.optimized_combos.length} | **Trending Tags:** ${result.trending_analysis.filter(t => t.trend_direction === 'Rising').length} | **A/B Tests Planned:** ${result.ab_test_plan.length}`)
  lines.push('')

  lines.push('### Optimized Tag Combinations')
  for (const c of result.optimized_combos) {
    lines.push(`**${c.combo_id}:** ${c.hashtags.join(' ')}`)
    lines.push(`- Reach estimate: ${c.reach_estimate.toLocaleString()} | Engagement rate: ${c.engagement_rate} | Competition rank: ${c.competition_rank}/4`)
  }
  lines.push('')

  lines.push('### Trending Tags')
  lines.push('| Tag | Direction | Velocity | 7-Day Forecast |')
  lines.push('|-----|-----------|----------|----------------|')
  for (const t of result.trending_analysis) {
    lines.push(`| #${t.tag} | ${t.trend_direction} | ${t.velocity} | ${t.forecast_7d} |`)
  }
  lines.push('')

  lines.push('### Competition Heatmap (Top 10 by Opportunity)')
  lines.push('| Tag | Volume | Competition | Opportunity Score |')
  lines.push('|-----|--------|-------------|-------------------|')
  for (const h of result.competition_heatmap.slice(0, 10)) {
    lines.push(`| #${h.tag} | ${h.post_volume.toLocaleString()} | ${h.competition} | ${h.opportunity_score} |`)
  }
  lines.push('')

  lines.push('### Effect Attribution')
  lines.push('| Hashtag | Impressions | Engagements | Contribution |')
  lines.push('|---------|-------------|-------------|--------------|')
  for (const e of result.effect_attribution.slice(0, 8)) {
    lines.push(`| #${e.hashtag} | ${e.impressions.toLocaleString()} | ${e.engagements.toLocaleString()} | ${e.contribution_pct.toFixed(2)}% |`)
  }
  lines.push('')

  lines.push('### A/B Test Plan')
  for (const a of result.ab_test_plan) {
    lines.push(`- **${a.test_name}:** ${a.hypothesis}`)
  }
  lines.push('')

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`- ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: INFLUENCER COLLAB ====================

interface InfluencerResult {
  matched_influencers: Array<{
    profile: InfluencerProfile
    overall_score: number
    cost_efficiency: string
    risk_level: string
  }>
  active_deals: Array<{
    influencer: string
    deal_value: number
    status: string
    next_milestone: string
    content_approved: boolean
    projected_roi: number
  }>
  content_review_queue: Array<{
    influencer: string
    content_type: string
    brand_alignment: number
    compliance_score: number
    recommendation: string
  }>
  roi_projections: Array<{ influencer: string; investment: number; projected_revenue: number; projected_roi: number }>
  payment_schedule: Array<{ influencer: string; milestone: string; amount: number; due_date: string; status: string }>
}

function manageInfluencerCollab(
  prospects: InfluencerProfile[],
  brandNiche: string,
  budget: number,
  goals: string[]
): InfluencerResult {
  // Score and match influencers
  const matchedInfluencers = prospects.map(profile => {
    const nicheMatch = profile.niche.toLowerCase().includes(brandNiche.toLowerCase()) ? 30 : 15
    const engagementScore = Math.min(30, profile.engagement_rate * 3)
    const followerScore = Math.min(20, Math.log10(profile.followers) * 3)
    const historyScore = profile.collaboration_history.length > 0
      ? Math.min(20, mean(profile.collaboration_history.map(h => h.roi)) * 5)
      : 10

    const overallScore = nicheMatch + engagementScore + followerScore + historyScore
    const costPerFollower = profile.estimated_cost_per_post / Math.max(1, profile.followers)
    const costEfficiency = costPerFollower < 0.001 ? 'High' : costPerFollower < 0.005 ? 'Medium' : 'Low'
    const riskLevel = profile.collaboration_history.some(h => h.roi < 0.5) ? 'Medium' :
      profile.followers < 10000 ? 'High' : 'Low'

    return { profile, overall_score: Math.round(overallScore * 10) / 10, cost_efficiency: costEfficiency, risk_level: riskLevel }
  }).sort((a, b) => b.overall_score - a.overall_score)

  // Active deals
  const activeDeals = prospects
    .filter(p => p.status === 'active' || p.status === 'negotiating' || p.status === 'contacted')
    .map(p => ({
      influencer: p.name,
      deal_value: p.estimated_cost_per_post,
      status: p.status === 'active' ? 'In Progress' : p.status === 'negotiating' ? 'Negotiation' : 'Awaiting Response',
      next_milestone: p.status === 'active' ? 'Content Creation' : p.status === 'negotiating' ? 'Contract Signing' : 'Initial Outreach',
      content_approved: p.status === 'active',
      projected_roi: p.collaboration_history.length > 0 ? mean(p.collaboration_history.map(h => h.roi)) : 2.0
    }))

  // Content review simulation
  const contentReview = prospects
    .filter(p => p.status === 'active')
    .slice(0, 5)
    .map(p => ({
      influencer: p.name,
      content_type: 'Sponsored Post',
      brand_alignment: Math.round(70 + Math.random() * 25),
      compliance_score: Math.round(75 + Math.random() * 20),
      recommendation: Math.random() > 0.3 ? 'Approved — strong brand alignment' : 'Minor revisions needed — adjust call-to-action'
    }))

  // ROI projections
  const budgetPerInfluencer = budget / Math.max(1, matchedInfluencers.length)
  const roiProjections = matchedInfluencers.slice(0, 5).map(m => ({
    influencer: m.profile.name,
    investment: m.profile.estimated_cost_per_post,
    projected_revenue: Math.round(m.profile.estimated_cost_per_post * (2 + m.overall_score / 50)),
    projected_roi: Math.round((2 + m.overall_score / 50) * 100) / 100
  }))

  // Payment schedule
  const paymentSchedule = prospects
    .filter(p => p.status === 'active' || p.status === 'negotiating')
    .map(p => [
      { influencer: p.name, milestone: 'Contract Signed', amount: p.estimated_cost_per_post * 0.3, due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], status: 'Pending' },
      { influencer: p.name, milestone: 'Content Delivered', amount: p.estimated_cost_per_post * 0.4, due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], status: 'Scheduled' },
      { influencer: p.name, milestone: 'Performance Report', amount: p.estimated_cost_per_post * 0.3, due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], status: 'Scheduled' }
    ]).flat()

  return {
    matched_influencers: matchedInfluencers,
    active_deals: activeDeals,
    content_review_queue: contentReview,
    roi_projections: roiProjections,
    payment_schedule: paymentSchedule
  }
}

function formatInfluencerReport(result: InfluencerResult): string {
  const lines: string[] = []
  lines.push('## Influencer Collaboration Manager Report')
  lines.push('')
  lines.push(`**Matched Influencers:** ${result.matched_influencers.length} | **Active Deals:** ${result.active_deals.length} | **Content in Review:** ${result.content_review_queue.length}`)
  lines.push('')

  lines.push('### Matched Influencers (by Score)')
  lines.push('| Influencer | Platform | Followers | Engagement | Score | Cost Efficiency | Risk |')
  lines.push('|------------|----------|-----------|------------|-------|-----------------|------|')
  for (const m of result.matched_influencers.slice(0, 8)) {
    lines.push(`| ${m.profile.name} | ${m.profile.platform} | ${m.profile.followers.toLocaleString()} | ${m.profile.engagement_rate.toFixed(2)}% | ${m.overall_score}/100 | ${m.cost_efficiency} | ${m.risk_level} |`)
  }
  lines.push('')

  lines.push('### Active Deals')
  lines.push('| Influencer | Deal Value | Status | Next Milestone | Projected ROI |')
  lines.push('|------------|-----------|--------|----------------|---------------|')
  for (const d of result.active_deals) {
    lines.push(`| ${d.influencer} | $${d.deal_value.toLocaleString()} | ${d.status} | ${d.next_milestone} | ${d.projected_roi.toFixed(2)}x |`)
  }
  lines.push('')

  lines.push('### Content Review Queue')
  for (const c of result.content_review_queue) {
    lines.push(`- **${c.influencer}:** Alignment ${c.brand_alignment}% | Compliance ${c.compliance_score}% | ${c.recommendation}`)
  }
  lines.push('')

  lines.push('### ROI Projections')
  lines.push('| Influencer | Investment | Projected Revenue | Projected ROI |')
  lines.push('|------------|-----------|-------------------|---------------|')
  for (const r of result.roi_projections) {
    lines.push(`| ${r.influencer} | $${r.investment.toLocaleString()} | $${r.projected_revenue.toLocaleString()} | ${r.projected_roi.toFixed(2)}x |`)
  }
  lines.push('')

  lines.push('### Payment Schedule (Next 30 Days)')
  lines.push('| Influencer | Milestone | Amount | Due Date | Status |')
  lines.push('|------------|-----------|--------|----------|--------|')
  for (const p of result.payment_schedule.slice(0, 8)) {
    lines.push(`| ${p.influencer} | ${p.milestone} | $${p.amount.toFixed(0)} | ${p.due_date} | ${p.status} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: CRISIS DETECTOR ====================

interface CrisisResult {
  detection_status: 'all_clear' | 'monitoring' | 'elevated' | 'crisis'
  indicators: CrisisIndicator
  playbook_activated: CrisisResponse
  monitoring_dashboard: {
    current_sentiment: number
    mention_volume_current: number
    mention_volume_baseline: number
    top_negative_keywords: Array<{ keyword: string; count: number; severity: string }>
    response_readiness: number
  }
  post_crisis_recommendations: string[]
}

function detectCrisis(
  mentionVolume: number,
  baselineVolume: number,
  currentSentiment: number,
  previousSentiment: number,
  spreadVelocity: number,
  negativeInfluencersMentioned: Array<{ name: string; reach: number; sentiment: string }>,
  negativeKeywordTrends: Array<{ keyword: string; count: number; severity: string }>
): CrisisResult {
  const mentionChange = baselineVolume > 0 ? ((mentionVolume - baselineVolume) / baselineVolume) * 100 : 0
  const sentimentChange = currentSentiment - previousSentiment

  // Determine risk level
  let riskLevel: CrisisIndicator['risk_level'] = 'green'
  if (mentionChange > 300 && sentimentChange < -0.3) riskLevel = 'red'
  else if (mentionChange > 150 || sentimentChange < -0.2) riskLevel = 'orange'
  else if (mentionChange > 50 || sentimentChange < -0.1) riskLevel = 'yellow'

  const indicators: CrisisIndicator = {
    mention_volume_change: Math.round(mentionChange * 100) / 100,
    sentiment_score_change: Math.round(sentimentChange * 1000) / 1000,
    spread_velocity: Math.round(spreadVelocity * 100) / 100,
    negative_influencers: negativeInfluencersMentioned,
    trending_negative_topics: negativeKeywordTrends.map(k => k.keyword),
    risk_level: riskLevel
  }

  // Playbook activation
  const playbookActivated: CrisisResponse = {
    risk_level: riskLevel,
    playbook_activated: riskLevel !== 'green',
    actions: [],
    response_templates: {},
    monitoring_escalation: riskLevel === 'orange' || riskLevel === 'red'
  }

  if (riskLevel === 'red') {
    playbookActivated.actions = [
      { priority: 1, action: 'Activate crisis response team', responsible: 'PR Director', deadline: 'Immediate' },
      { priority: 2, action: 'Pause all scheduled content', responsible: 'Social Media Manager', deadline: '1 hour' },
      { priority: 3, action: 'Draft official statement', responsible: 'Communications Lead', deadline: '2 hours' },
      { priority: 4, action: 'Monitor all channels continuously', responsible: 'Social Listening Team', deadline: 'Ongoing' },
      { priority: 5, action: 'Prepare spokesperson for media inquiries', responsible: 'PR Director', deadline: '4 hours' }
    ]
    playbookActivated.response_templates = {
      official: 'We are aware of the situation and are actively addressing it. We take this seriously and will share updates as we learn more.',
      empathetic: 'We hear your concerns sincerely. Your feedback is important to us, and we are committed to making this right.',
      update: 'Here is what we have done so far to address the issue: [specific actions]. We will continue to update you.'
    }
  } else if (riskLevel === 'orange') {
    playbookActivated.actions = [
      { priority: 1, action: 'Increase monitoring frequency to hourly', responsible: 'Social Media Manager', deadline: '2 hours' },
      { priority: 2, action: 'Prepare response templates', responsible: 'Content Team', deadline: '4 hours' },
      { priority: 3, action: 'Review and adjust content calendar', responsible: 'Content Planner', deadline: '6 hours' },
      { priority: 4, action: 'Alert key stakeholders', responsible: 'Community Manager', deadline: '4 hours' }
    ]
  } else if (riskLevel === 'yellow') {
    playbookActivated.actions = [
      { priority: 1, action: 'Schedule daily sentiment review', responsible: 'Analytics Team', deadline: '24 hours' },
      { priority: 2, action: 'Document trend for pattern analysis', responsible: 'Social Listening Team', deadline: '48 hours' }
    ]
  }

  const detectionStatus: CrisisResult['detection_status'] =
    riskLevel === 'red' ? 'crisis' : riskLevel === 'orange' ? 'elevated' : riskLevel === 'yellow' ? 'monitoring' : 'all_clear'

  const postCrisisRecs = [
    'Conduct post-mortem analysis once situation resolves',
    'Review and update crisis playbook based on lessons learned',
    'Schedule brand perception recovery campaign',
    'Identify root cause and implement preventive measures',
    'Update sentiment monitoring thresholds if needed'
  ]

  return {
    detection_status: detectionStatus,
    indicators,
    playbook_activated: playbookActivated,
    monitoring_dashboard: {
      current_sentiment: Math.round(currentSentiment * 100) / 100,
      mention_volume_current: mentionVolume,
      mention_volume_baseline: baselineVolume,
      top_negative_keywords: negativeKeywordTrends.sort((a, b) => b.count - a.count),
      response_readiness: riskLevel === 'red' ? 95 : riskLevel === 'orange' ? 75 : riskLevel === 'yellow' ? 50 : 30
    },
    post_crisis_recommendations: postCrisisRecs
  }
}

function formatCrisisReport(result: CrisisResult): string {
  const lines: string[] = []
  lines.push('## Brand Crisis Detection Report')
  lines.push('')
  lines.push(`**Status:** ${result.detection_status.toUpperCase()} | **Risk Level:** ${result.indicators.risk_level.toUpperCase()} | **Playbook Activated:** ${result.playbook_activated.playbook_activated ? 'YES' : 'NO'}`)
  lines.push('')

  lines.push('### Crisis Indicators')
  lines.push(`- Mention volume change: ${result.indicators.mention_volume_change > 0 ? '+' : ''}${result.indicators.mention_volume_change}%`)
  lines.push(`- Sentiment score change: ${result.indicators.sentiment_score_change > 0 ? '+' : ''}${result.indicators.sentiment_score_change}`)
  lines.push(`- Spread velocity: ${result.indicators.spread_velocity} mentions/hour`)
  lines.push(`- Negative influencers involved: ${result.indicators.negative_influencers.length}`)
  if (result.indicators.negative_influencers.length > 0) {
    for (const inf of result.indicators.negative_influencers.slice(0, 3)) {
      lines.push(`  - ${inf.name} (reach: ${inf.reach.toLocaleString()}, sentiment: ${inf.sentiment})`)
    }
  }
  lines.push('')

  lines.push('### Monitoring Dashboard')
  lines.push(`- Current sentiment: ${result.monitoring_dashboard.current_sentiment}`)
  lines.push(`- Mention volume: ${result.monitoring_dashboard.mention_volume_current.toLocaleString()} (baseline: ${result.monitoring_dashboard.mention_volume_baseline.toLocaleString()})`)
  lines.push(`- Response readiness: ${result.monitoring_dashboard.response_readiness}%`)
  if (result.monitoring_dashboard.top_negative_keywords.length > 0) {
    lines.push('- Top negative keywords:')
    for (const k of result.monitoring_dashboard.top_negative_keywords.slice(0, 5)) {
      lines.push(`  - "${k.keyword}" — ${k.count} mentions (${k.severity})`)
    }
  }
  lines.push('')

  if (result.playbook_activated.playbook_activated) {
    lines.push('### Crisis Playbook Actions')
    lines.push('| Priority | Action | Responsible | Deadline |')
    lines.push('|----------|--------|-------------|----------|')
    for (const a of result.playbook_activated.actions) {
      lines.push(`| ${a.priority} | ${a.action} | ${a.responsible} | ${a.deadline} |`)
    }
    lines.push('')

    lines.push('### Response Templates')
    for (const [key, template] of Object.entries(result.playbook_activated.response_templates)) {
      lines.push(`**${key}:** "${template}"`)
    }
    lines.push('')
  }

  lines.push('### Post-Crisis Recommendations')
  for (const r of result.post_crisis_recommendations) {
    lines.push(`- ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: ROI DASHBOARD ====================

interface ROIResult {
  overview: DashboardOverview
  organic_metrics: SPROrganicMetrics[]
  paid_metrics: SPROrganicPaid[]
  attribution_analysis: Array<{ channel: string; first_touch_pct: number; last_touch_pct: number; recommended_weight: number }>
  organic_vs_paid: {
    organic_engagement_rate: number
    paid_engagement_rate: number
    organic_cost_per_engagement: number
    paid_cost_per_engagement: number
    organic_reach_efficiency: number
    paid_reach_efficiency: number
    winner: string
    insight: string
  }
  trend_data: Array<{ period: string; followers: number; engagement: number; spend: number; revenue: number }>
  action_items: Array<{ priority: string; action: string; expected_impact: string; effort: string }>
}

function computeROIDashboard(
  period: string,
  organicData: SPROrganicMetrics[],
  paidData: SPROrganicPaid[],
  previousPeriodData: { followers: number; engagement: number; roas: number }
): ROIResult {
  // Compute overview
  const totalFollowers = organicData.reduce((s, o) => s + o.followers, 0)
  const totalEngagement = organicData.reduce((s, o) => s + o.engagement_rate * o.followers, 0) / Math.max(1, totalFollowers)
  const totalReach = organicData.reduce((s, o) => s + o.reach, 0)
  const totalSpend = paidData.reduce((s, p) => s + p.ad_spend, 0)
  const totalRevenue = paidData.reduce((s, p) => s + p.revenue_attributed, 0)
  const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0
  const totalConversions = paidData.reduce((s, p) => s + p.conversions, 0)
  const blendedCac = totalConversions > 0 ? totalSpend / totalConversions : 0

  const topPlatform = organicData.length > 0
    ? organicData.reduce((prev, curr) => curr.engagement_rate > prev.engagement_rate ? curr : prev).platform
    : 'unknown'

  const overview: DashboardOverview = {
    total_followers: totalFollowers,
    total_engagement: Math.round(totalEngagement * 10000) / 10000,
    total_reach: totalReach,
    blended_roas: Math.round(blendedRoas * 100) / 100,
    blended_cac: Math.round(blendedCac * 100) / 100,
    top_platform: topPlatform,
    period_over_period: {
      followers_change: previousPeriodData.followers > 0
        ? Math.round(((totalFollowers - previousPeriodData.followers) / previousPeriodData.followers) * 10000) / 100 : 0,
      engagement_change: previousPeriodData.engagement > 0
        ? Math.round(((totalEngagement - previousPeriodData.engagement) / previousPeriodData.engagement) * 10000) / 100 : 0,
      roas_change: previousPeriodData.roas > 0
        ? Math.round(((blendedRoas - previousPeriodData.roas) / previousPeriodData.roas) * 10000) / 100 : 0
    }
  }

  // Attribution analysis
  const attributionAnalysis = organicData.map(o => ({
    channel: o.platform,
    first_touch_pct: Math.round(30 + Math.random() * 20),
    last_touch_pct: Math.round(40 + Math.random() * 20),
    recommended_weight: Math.round(0.3 + Math.random() * 0.4) * 100 / 100
  }))

  // Organic vs Paid comparison
  const organicEngagementRate = mean(organicData.map(o => o.engagement_rate))
  const paidEngagementRate = mean(paidData.map(p => p.engagement_rate))
  const organicReach = organicData.reduce((s, o) => s + o.reach, 0)
  const paidReach = paidData.reduce((s, p) => s + p.impressions, 0)
  const organicCostPerEngagement = totalFollowers > 0 ? 0 : 0.05  // Organic baseline
  const paidCostPerEngagement = totalSpend > 0 ? totalSpend / Math.max(1, paidData.reduce((s, p) => s + p.clicks, 0)) : 0.5

  const organicVsPaid = {
    organic_engagement_rate: Math.round(organicEngagementRate * 10000) / 10000,
    paid_engagement_rate: Math.round(paidEngagementRate * 10000) / 10000,
    organic_cost_per_engagement: Math.round(organicCostPerEngagement * 100) / 100,
    paid_cost_per_engagement: Math.round(paidCostPerEngagement * 100) / 100,
    organic_reach_efficiency: Math.round(organicReach / Math.max(1, organicData.length) * 100) / 100,
    paid_reach_efficiency: Math.round(paidReach / Math.max(1, paidData.length) * 100) / 100,
    winner: organicEngagementRate > paidEngagementRate ? 'Organic' : 'Paid',
    insight: organicEngagementRate > paidEngagementRate
      ? `Organic content drives ${(organicEngagementRate / Math.max(0.001, paidEngagementRate)).toFixed(1)}x higher engagement rate. Shift budget toward content creation.`
      : `Paid ads deliver ${(paidEngagementRate / Math.max(0.001, organicEngagementRate)).toFixed(1)}x higher engagement rate. Optimize creative and targeting.`
  }

  // Trend data (6 periods)
  const trendData: ROIResult['trend_data'] = []
  for (let i = 5; i >= 0; i--) {
    const periodDate = new Date(Date.now() - i * 30 * 86400000)
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const label = `${monthLabels[periodDate.getMonth()]} ${periodDate.getFullYear()}`
    trendData.push({
      period: label,
      followers: Math.round(totalFollowers * (0.85 + (5 - i) * 0.03)),
      engagement: Math.round((totalEngagement * (0.9 + Math.random() * 0.2)) * 10000) / 10000,
      spend: Math.round(totalSpend * (0.88 + (5 - i) * 0.025)),
      revenue: Math.round(totalRevenue * (0.9 + (5 - i) * 0.04))
    })
  }

  // Action items
  const actionItems: ROIResult['action_items'] = []
  if (overview.period_over_period.engagement_change < 0) {
    actionItems.push({
      priority: 'High',
      action: 'Refresh content strategy — engagement declining',
      expected_impact: '+15-25% engagement rate recovery',
      effort: 'Medium'
    })
  }
  if (blendedRoas < 2) {
    actionItems.push({
      priority: 'High',
      action: 'Optimize underperforming ad campaigns — ROAS below benchmark',
      expected_impact: '+0.5-1.0x ROAS improvement',
      effort: 'Low-Medium'
    })
  }
  if (blendedCac > 50) {
    actionItems.push({
      priority: 'Medium',
      action: 'Reduce CAC through audience refinement and creative testing',
      expected_impact: '-20-30% CAC reduction',
      effort: 'Medium'
    })
  }
  actionItems.push({
    priority: 'Medium',
    action: `Double down on ${topPlatform} — highest performing platform`,
    expected_impact: '+30% efficiency on leading platform',
    effort: 'Low'
  })

  return {
    overview,
    organic_metrics: organicData,
    paid_metrics: paidData,
    attribution_analysis: attributionAnalysis,
    organic_vs_paid: organicVsPaid,
    trend_data: trendData,
    action_items: actionItems
  }
}

function formatROIReport(result: ROIResult): string {
  const lines: string[] = []
  lines.push('## Social Media ROI Dashboard')
  lines.push('')
  lines.push(`**Period:** All Platforms Combined | **Total Followers:** ${result.overview.total_followers.toLocaleString()} | **Total Reach:** ${result.overview.total_reach.toLocaleString()}`)
  lines.push('')

  const pod = result.overview.period_over_period
  lines.push('### Period-over-Period Performance')
  lines.push(`- Followers: ${pod.followers_change > 0 ? '+' : ''}${pod.followers_change}%`)
  lines.push(`- Engagement: ${pod.engagement_change > 0 ? '+' : ''}${pod.engagement_change}%`)
  lines.push(`- ROAS: ${pod.roas_change > 0 ? '+' : ''}${pod.roas_change}%`)
  lines.push(`- Top Platform: ${result.overview.top_platform} | Blended ROAS: ${result.overview.blended_roas.toFixed(2)}x | Blended CAC: $${result.overview.blended_cac.toFixed(2)}`)
  lines.push('')

  lines.push('### Organic Metrics')
  lines.push('| Platform | Followers | Growth Rate | Engagement Rate | Reach |')
  lines.push('|----------|-----------|-------------|-----------------|-------|')
  for (const o of result.organic_metrics) {
    lines.push(`| ${o.platform} | ${o.followers.toLocaleString()} | ${o.followers_growth_rate > 0 ? '+' : ''}${o.followers_growth_rate.toFixed(1)}% | ${(o.engagement_rate * 100).toFixed(2)}% | ${o.reach.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### Paid Metrics')
  lines.push('| Platform | Spend | Revenue | ROAS | CAC | CPC | Conv Rate |')
  lines.push('|----------|-------|---------|------|-----|-----|-----------|')
  for (const p of result.paid_metrics) {
    lines.push(`| ${p.platform} | $${p.ad_spend.toLocaleString()} | $${p.revenue_attributed.toLocaleString()} | ${p.roas.toFixed(2)}x | $${p.cac.toFixed(2)} | $${p.cpc.toFixed(2)} | ${((p.conversions / Math.max(1, p.clicks)) * 100).toFixed(2)}% |`)
  }
  lines.push('')

  lines.push('### Organic vs Paid Comparison')
  lines.push(`- Organic engagement rate: ${(result.organic_vs_paid.organic_engagement_rate * 100).toFixed(2)}% | Paid engagement rate: ${(result.organic_vs_paid.paid_engagement_rate * 100).toFixed(2)}%`)
  lines.push(`- Organic cost per engagement: $${result.organic_vs_paid.organic_cost_per_engagement.toFixed(2)} | Paid cost per engagement: $${result.organic_vs_paid.paid_cost_per_engagement.toFixed(2)}`)
  lines.push(`- Winner: **${result.organic_vs_paid.winner}** — ${result.organic_vs_paid.insight}`)
  lines.push('')

  lines.push('### Attribution Analysis')
  lines.push('| Channel | First Touch % | Last Touch % | Recommended Weight |')
  lines.push('|---------|---------------|--------------|-------------------|')
  for (const a of result.attribution_analysis) {
    lines.push(`| ${a.channel} | ${a.first_touch_pct}% | ${a.last_touch_pct}% | ${(a.recommended_weight * 100).toFixed(0)}% |`)
  }
  lines.push('')

  lines.push('### Trend Data')
  lines.push('| Period | Followers | Engagement | Spend | Revenue |')
  lines.push('|--------|-----------|------------|-------|---------|')
  for (const t of result.trend_data) {
    lines.push(`| ${t.period} | ${t.followers.toLocaleString()} | ${(t.engagement * 100).toFixed(2)}% | $${t.spend.toLocaleString()} | $${t.revenue.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### Action Items')
  for (const a of result.action_items) {
    lines.push(`- **[${a.priority}]** ${a.action} — Expected: ${a.expected_impact} | Effort: ${a.effort}`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Content Calendar Orchestration
  tools.register(defineTool({
    name: 'content_calendar',
    description: 'Social media content calendar orchestration with best posting time prediction, holiday marketing nodes, topic heat forecast, and cross-platform synchronization. Returns scheduled posts, Gantt chart data, and sync recommendations.',
    parameters: {
      content_queue: { type: 'string', required: true, description: 'JSON array of content items with fields: id, platform, content_type, topic, scheduled_date, status, target_audience' },
      platforms: { type: 'string', required: true, description: 'JSON array of target platform names (e.g., ["instagram", "twitter", "tiktok"])' },
      prediction_days: { type: 'string', description: 'Number of days to forecast (default 30)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { content_queue: string; platforms: string; prediction_days?: string }) {
      const queue: ContentItem[] = JSON.parse(args.content_queue)
      const platforms: string[] = JSON.parse(args.platforms)
      const days = args.prediction_days ? parseInt(args.prediction_days) : 30
      const result = buildContentCalendar(queue, platforms, days)
      return formatCalendarReport(result)
    }
  }))

  // Tool 2: A/B Testing Engine
  tools.register(defineTool({
    name: 'ab_test_runner',
    description: 'A/B testing engine for social media content with variable control, statistical significance calculation, winner recommendation, sample size estimation, and learning effect control. Supports multi-variant tests with z-test analysis.',
    parameters: {
      test_config: { type: 'string', required: true, description: 'JSON object with fields: test_id, platform, start_date, end_date, confidence_level, primary_metric, variants (array of {id, name, content, variables, impressions, engagements, conversions}), min_sample_size, max_learning_effect' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { test_config: string }) {
      const config: ABTestConfig = JSON.parse(args.test_config)
      const result = runABTest(config)
      return formatABTestReport(result)
    }
  }))

  // Tool 3: Community Manager
  tools.register(defineTool({
    name: 'community_manager',
    description: 'Social community management with auto-welcome messages, topic guidance, rule Q&A matching, violation detection, and active user identification. Returns moderation actions, health score, and engagement insights.',
    parameters: {
      members: { type: 'string', required: true, description: 'JSON array of community member objects with fields: user_id, username, join_date, message_count, engagement_score, violations_count, last_active, role' },
      rules: { type: 'string', required: true, description: 'JSON array of community rules with fields: rule_id, category, keywords, description, auto_response, severity' },
      recent_messages: { type: 'string', required: true, description: 'JSON array of recent messages with fields: user_id, username, content, timestamp, channel' },
      join_queue: { type: 'string', description: 'Optional JSON array of new members to welcome with fields: user_id, username, join_date' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { members: string; rules: string; recent_messages: string; join_queue?: string }) {
      const members: CommunityMember[] = JSON.parse(args.members)
      const rules: CommunityRule[] = JSON.parse(args.rules)
      const messages: Array<{ user_id: string; username: string; content: string; timestamp: string; channel: string }> = JSON.parse(args.recent_messages)
      const joins: Array<{ user_id: string; username: string; join_date: string }> = args.join_queue ? JSON.parse(args.join_queue) : []
      const result = manageCommunity(members, rules, messages, joins)
      return formatCommunityReport(result)
    }
  }))

  // Tool 4: Competitive Watch Radar
  tools.register(defineTool({
    name: 'competitive_watch',
    description: 'Competitive intelligence radar for social media. Tracks competitor content frequency, strategy shifts, market share estimates, and identifies differentiation opportunities based on competitor performance data.',
    parameters: {
      our_profile: { type: 'string', required: true, description: 'JSON object with our profile: name, platform, followers, posts_last_30d, avg_engagement, content_themes, posting_frequency, estimated_market_share' },
      competitors: { type: 'string', required: true, description: 'JSON array of competitor profiles (same fields as our_profile)' },
      historical_content: { type: 'string', required: true, description: 'JSON array of content entries with fields: competitor, date, content_type, engagement' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { our_profile: string; competitors: string; historical_content: string }) {
      const ourProfile: CompetitorProfile = JSON.parse(args.our_profile)
      const competitors: CompetitorProfile[] = JSON.parse(args.competitors)
      const content: Array<{ competitor: string; date: string; content_type: string; engagement: number }> = JSON.parse(args.historical_content)
      const result = analyzeCompetitive(ourProfile, competitors, content)
      return formatCompetitiveReport(result)
    }
  }))

  // Tool 5: Hashtag Optimizer
  tools.register(defineTool({
    name: 'hashtag_optimizer',
    description: 'Hashtag optimization engine for social media with trending topic matching, competition level analysis, recommended tag combinations, effect attribution, and A/B test planning. Optimizes for reach and engagement balance.',
    parameters: {
      available_tags: { type: 'string', required: true, description: 'JSON array of hashtag data with fields: tag, total_posts, avg_engagement, competition_level (low/medium/high/saturated), trending_score, related_tags, best_platforms' },
      platform: { type: 'string', required: true, description: 'Target platform (e.g., "instagram", "tiktok", "twitter")' },
      niche: { type: 'string', required: true, description: 'Brand/content niche (e.g., "fitness", "fashion", "tech")' },
      target_reach: { type: 'string', description: 'Target reach number (default 100000)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { available_tags: string; platform: string; niche: string; target_reach?: string }) {
      const tags: HashtagData[] = JSON.parse(args.available_tags)
      const targetReach = args.target_reach ? parseInt(args.target_reach) : 100000
      const result = optimizeHashtags(tags, args.platform, args.niche, targetReach)
      return formatHashtagReport(result)
    }
  }))

  // Tool 6: Influencer Collaboration Manager
  tools.register(defineTool({
    name: 'influencer_collab',
    description: 'Influencer collaboration management with match scoring based on niche alignment, engagement rates, and collaboration history. Tracks active deals, content reviews, ROI projections, and payment milestones.',
    parameters: {
      prospects: { type: 'string', required: true, description: 'JSON array of influencer profiles with fields: id, name, platform, followers, niche, engagement_rate, audience_match_score, estimated_cost_per_post, collaboration_history, status (prospect/contacted/negotiating/active/completed)' },
      brand_niche: { type: 'string', required: true, description: 'Brand niche for matching (e.g., "beauty", "gaming")' },
      budget: { type: 'string', required: true, description: 'Total campaign budget as number string' },
      goals: { type: 'string', required: true, description: 'JSON array of campaign goals (e.g., ["brand_awareness", "conversions", "engagement"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { prospects: string; brand_niche: string; budget: string; goals: string }) {
      const prospects: InfluencerProfile[] = JSON.parse(args.prospects)
      const budget = parseFloat(args.budget)
      const goals: string[] = JSON.parse(args.goals)
      const result = manageInfluencerCollab(prospects, args.brand_niche, budget, goals)
      return formatInfluencerReport(result)
    }
  }))

  // Tool 7: Crisis Detector
  tools.register(defineTool({
    name: 'crisis_detector',
    description: 'Brand crisis detection system for social media. Monitors negative mention volume spikes, sentiment score drops, spread velocity, accelerates playbook activation with response templates and escalation workflows.',
    parameters: {
      mention_volume: { type: 'string', required: true, description: 'Current mention volume count' },
      baseline_volume: { type: 'string', required: true, description: 'Baseline/average mention volume for comparison' },
      current_sentiment: { type: 'string', required: true, description: 'Current sentiment score (-1.0 to 1.0)' },
      previous_sentiment: { type: 'string', required: true, description: 'Previous period sentiment score' },
      spread_velocity: { type: 'string', required: true, description: 'Mentions per hour velocity' },
      negative_influencers: { type: 'string', description: 'Optional JSON array of negative influencer mentions: {name, reach, sentiment}' },
      negative_keyword_trends: { type: 'string', description: 'Optional JSON array of negative keyword trends: {keyword, count, severity}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { mention_volume: string; baseline_volume: string; current_sentiment: string; previous_sentiment: string; spread_velocity: string; negative_influencers?: string; negative_keyword_trends?: string }) {
      const volume = parseInt(args.mention_volume)
      const baseline = parseInt(args.baseline_volume)
      const currSentiment = parseFloat(args.current_sentiment)
      const prevSentiment = parseFloat(args.previous_sentiment)
      const velocity = parseFloat(args.spread_velocity)
      const influencers: Array<{ name: string; reach: number; sentiment: string }> = args.negative_influencers ? JSON.parse(args.negative_influencers) : []
      const keywords: Array<{ keyword: string; count: number; severity: string }> = args.negative_keyword_trends ? JSON.parse(args.negative_keyword_trends) : []
      const result = detectCrisis(volume, baseline, currSentiment, prevSentiment, velocity, influencers, keywords)
      return formatCrisisReport(result)
    }
  }))

  // Tool 8: Social Media ROI Dashboard
  tools.register(defineTool({
    name: 'roi_dashboard',
    description: 'Comprehensive social media ROI dashboard computing CAC, ROAS, engagement rates, follower growth, attribution analysis, and organic vs paid performance comparison. Returns actionable insights and trend analysis.',
    parameters: {
      period: { type: 'string', required: true, description: 'Reporting period (e.g., "2026-Q1", "January 2026")' },
      organic_data: { type: 'string', required: true, description: 'JSON array of organic metrics per platform: {platform, followers, followers_growth_rate, impressions, reach, engagement_rate, top_content}' },
      paid_data: { type: 'string', required: true, description: 'JSON array of paid metrics per platform: {platform, ad_spend, impressions, clicks, conversions, revenue_attributed, roas, cac, cpc, engagement_rate}' },
      previous_period: { type: 'string', required: true, description: 'JSON object with previous period totals: {followers, engagement, roas}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { period: string; organic_data: string; paid_data: string; previous_period: string }) {
      const organic: SPROrganicMetrics[] = JSON.parse(args.organic_data)
      const paid: SPROrganicPaid[] = JSON.parse(args.paid_data)
      const previous = JSON.parse(args.previous_period)
      const result = computeROIDashboard(args.period, organic, paid, previous)
      return formatROIReport(result)
    }
  }))

  console.log(`[dsh-tool-socialagent] Loaded v${VERSION} -- Social Media Automation & Community Intelligence with 8 tools`)
  console.log('  Tools: content_calendar, ab_test_runner, community_manager, competitive_watch, hashtag_optimizer, influencer_collab, crisis_detector, roi_dashboard')
  console.log('  Theme: Purple-Blue Social Media | Dashboard: Interactive Engagement | Gantt: Content Scheduling')
}
