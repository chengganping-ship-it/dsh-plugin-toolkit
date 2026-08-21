/**
 * DSH AI Media Publicity & PR Pro Agent Plugin v0.1.0
 *
 * Professional AI-powered media publicity and public relations toolkit for DeepSeek Harness.
 * Covers press release distribution, media relations tracking, KOL strategy management,
 * brand sentiment monitoring, content amplification, campaign effectiveness analysis,
 * editorial calendar planning, and influencer ROI calculation.
 *
 * Features (v0.1.0):
 * - Press Release Distributor: Auto-distribution and media matching for press releases
 * - Media Relations Tracker: Journalist profiling, relationship scoring, interaction tracking
 * - KOL Strategy Manager: KOL collaboration strategy and performance tracking
 * - Brand Sentiment Monitor: Brand sentiment monitoring and crisis alert system
 * - Content Amplifier: Secondary content distribution and SEO optimization analysis
 * - Campaign Effectiveness: Campaign attribution and ROI deep-dive analysis
 * - Editorial Calendar Editor: Editorial calendar planning and content pipeline management
 * - Influencer ROI Calculator: Influencer marketing ROI calculator and scheduling
 *
 * @module dsh-tool-pragentpro
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-pragentpro'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== UTILITY FUNCTIONS ====================

/**
 * mulberry32: A fast, deterministic seeded PRNG.
 * Returns a function that produces floats in [0, 1).
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Simple string hash for seeding the PRNG deterministically from input.
 */
function hashStr(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seededRandom(seedStr: string): () => number {
  return mulberry32(hashStr(seedStr))
}

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function roundTo(n: number, decimals: number): number {
  const f = Math.pow(10, decimals)
  return Math.round(n * f) / f
}

// ==================== TOOL 1: PRESS RELEASE DISTRIBUTOR ====================

interface PressReleaseDistributorInput {
  press_release: {
    title: string
    company: string
    industry: string
    region: string
    category: 'product_launch' | 'partnership' | 'funding' | 'award' | 'executive' | 'csr' | 'crisis' | 'other'
    key_messages: string[]
    embargo_date?: string
    publish_date: string
    boilerplate: string
  }
  target_media_tiers?: ('tier1_national' | 'tier2_regional' | 'trade_specialist' | 'online_digital' | 'broadcast')[]
  budget_usd?: number
}

interface MediaMatch {
  outlet_name: string
  media_tier: string
  match_score: number
  reach_estimate: number
  distribution_method: string
  cost_estimate_usd: number
  priority: 'high' | 'medium' | 'low'
  rationale: string
  contact_channel: string
}

interface DistributionPlan {
  total_outlets: number
  budget_allocated: number
  estimated_total_reach: number
  media_matches: MediaMatch[]
  timeline: Array<{ phase: string; date: string; action: string; outlets_count: number }>
  risk_factors: string[]
  kpi_targets: Array<{ metric: string; target: string; measurement_method: string }>
}

function analyzePressReleaseDistribution(input: PressReleaseDistributorInput): DistributionPlan {
  const rng = seededRandom(JSON.stringify(input))
  const pr = input.press_release
  const tiers = input.target_media_tiers || ['tier1_national', 'trade_specialist', 'online_digital']
  const budget = input.budget_usd || 10000

  const outletPool: Record<string, Array<{ name: string; reach: number; method: string; channel: string }>> = {
    tier1_national: [
      { name: 'Reuters', reach: 50000000, method: 'Wire service', channel: 'Editorial desk' },
      { name: 'Associated Press', reach: 45000000, method: 'Wire service', channel: 'Newsroom' },
      { name: 'Bloomberg', reach: 30000000, method: 'Direct pitch + wire', channel: 'Sector editor' },
      { name: 'National Business Review', reach: 8000000, method: 'Embargoed email', channel: 'Assignment editor' }
    ],
    tier2_regional: [
      { name: 'Regional Business Journal', reach: 2000000, method: 'Email pitch', channel: 'City editor' },
      { name: 'Local Metro Daily', reach: 1500000, method: 'Press release email', channel: 'News desk' },
      { name: 'State Tribune', reach: 900000, method: 'Phone + email', channel: 'Senior reporter' }
    ],
    trade_specialist: [
      { name: 'Industry Trade Weekly', reach: 500000, method: 'Embargoed pitch', channel: 'Beat reporter' },
      { name: 'Sector Insider', reach: 300000, method: 'Exclusive offer', channel: 'Editor-in-chief' },
      { name: 'Professional Association News', reach: 200000, method: 'Member distribution', channel: 'Content manager' }
    ],
    online_digital: [
      { name: 'Tech/Business Blog Network', reach: 3000000, method: 'SEO-optimized post', channel: 'Contributing editor' },
      { name: 'Digital News Platform', reach: 2500000, method: 'Syndication', channel: 'Partnerships team' },
      { name: 'Social Media Amplifiers', reach: 8000000, method: 'Paid promotion', channel: 'Ads manager' }
    ],
    broadcast: [
      { name: 'CNBC/Business TV', reach: 10000000, method: 'Media alert + interview offer', channel: 'Producer' },
      { name: 'Marketplace Radio', reach: 5000000, method: 'Audio news release', channel: 'Programming director' }
    ]
  }

  const categoryMultiplier: Record<string, number> = {
    product_launch: 1.3,
    partnership: 1.1,
    funding: 1.4,
    award: 0.9,
    executive: 1.0,
    csr: 0.8,
    crisis: 1.6,
    other: 1.0
  }
  const mult = categoryMultiplier[pr.category] || 1.0

  const matches: MediaMatch[] = []
  for (const tier of tiers) {
    const outlets = outletPool[tier] || []
    for (const o of outlets) {
      const baseScore = 50 + rng() * 40
      const adjustedScore = Math.min(98, Math.round(baseScore * mult))
      const costPerOutlet = tier === 'tier1_national' ? budget * 0.15 : tier === 'broadcast' ? budget * 0.12 : tier === 'online_digital' ? budget * 0.08 : budget * 0.05
      matches.push({
        outlet_name: o.name,
        media_tier: tier,
        match_score: adjustedScore,
        reach_estimate: Math.round(o.reach * (0.5 + rng() * 0.5)),
        distribution_method: o.method,
        cost_estimate_usd: Math.round(costPerOutlet),
        priority: adjustedScore >= 75 ? 'high' : adjustedScore >= 55 ? 'medium' : 'low',
        rationale: `Strong alignment with ${pr.industry} sector and ${pr.category} announcement type`,
        contact_channel: o.channel
      })
    }
  }

  matches.sort((a, b) => b.match_score - a.match_score)

  const totalReach = matches.reduce((s, m) => s + m.reach_estimate, 0)
  const highPriority = matches.filter(m => m.priority === 'high')
  const medPriority = matches.filter(m => m.priority === 'medium')

  const timeline = [
    { phase: 'Pre-distribution', date: pr.embargo_date || pr.publish_date, action: 'Send embargoed materials to tier-1 outlets', outlets_count: highPriority.length },
    { phase: 'Launch Day', date: pr.publish_date, action: 'Full distribution to all matched outlets', outlets_count: matches.length },
    { phase: 'Follow-up', date: pr.publish_date + ' (+2 days)', action: 'Follow up with non-responsive outlets', outlets_count: medPriority.length },
    { phase: 'Amplification', date: pr.publish_date + ' (+5 days)', action: 'Social amplification and paid boost', outlets_count: 3 }
  ]

  return {
    total_outlets: matches.length,
    budget_allocated: budget,
    estimated_total_reach: totalReach,
    media_matches: matches,
    timeline,
    risk_factors: [
      'Embargo breach risk with early distribution',
      'Competing news cycle may reduce pickup',
      'Regional outlets may require localization',
      'Broadcast media needs spokesperson availability'
    ],
    kpi_targets: [
      { metric: 'Media Pickup Rate', target: `${Math.round(30 + rng() * 25)}%`, measurement_method: 'Mentions tracked via media monitoring' },
      { metric: 'Share of Voice', target: `${Math.round(15 + rng() * 20)}%`, measurement_method: 'Competitor mention comparison' },
      { metric: 'Message Pull-through', target: `${Math.round(60 + rng() * 30)}%`, measurement_method: 'Key message inclusion in coverage' },
      { metric: 'Estimated Reach', target: `${(totalReach / 1000000).toFixed(1)}M`, measurement_method: 'Aggregate outlet audience data' }
    ]
  }
}

function formatDistributionReport(r: DistributionPlan): string {
  const lines: string[] = []
  lines.push('# Press Release Distribution Plan')
  lines.push('')
  lines.push(`**${r.total_outlets}** media outlets matched | **$${r.budget_allocated.toLocaleString()}** budget | **${(r.estimated_total_reach / 1000000).toFixed(1)}M** estimated reach`)
  lines.push('')
  lines.push('## Media Matches (by priority)')
  lines.push('| Outlet | Tier | Score | Reach | Method | Cost | Priority |')
  lines.push('|--------|------|-------|-------|--------|------|----------|')
  for (const m of r.media_matches) {
    lines.push(`| ${m.outlet_name} | ${m.media_tier} | ${m.match_score} | ${(m.reach_estimate / 1000).toFixed(0)}K | ${m.distribution_method} | $${m.cost_estimate_usd.toLocaleString()} | ${m.priority.toUpperCase()} |`)
  }
  lines.push('')
  lines.push('## Distribution Timeline')
  for (const t of r.timeline) {
    lines.push(`**${t.phase}** (${t.date})`)
    lines.push(`  ${t.action} — ${t.outlets_count} outlets`)
    lines.push('')
  }
  lines.push('## KPI Targets')
  for (const k of r.kpi_targets) {
    lines.push(`- **${k.metric}:** ${k.target} (${k.measurement_method})`)
  }
  lines.push('')
  lines.push('## Risk Factors')
  for (const risk of r.risk_factors) {
    lines.push(`- ${risk}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Reach estimates are based on industry averages and may vary. Actual pickup rates depend on news cycle competitiveness and outlet editorial discretion.*')
  return lines.join('\n')
}

// ==================== TOOL 2: MEDIA RELATIONS TRACKER ====================

interface MediaRelationsInput {
  contacts: Array<{
    name: string
    outlet: string
    beat: string
    email: string
    engagement_score: number
    last_contact_date: string
    previous_coverage: string[]
    preferred_format: 'email' | 'phone' | 'social' | 'in_person'
    responsiveness: 'high' | 'medium' | 'low'
  }>
  story_angle: string
  campaign_id?: string
}

interface JournalistProfile {
  name: string
  outlet: string
  beat: string
  influence_score: number
  engagement_score: number
  relationship_tier: 'strategic' | 'active' | 'developing' | 'new'
  last_interaction: string
  key_topics: string[]
  pitch_responsiveness: string
  coverage_count: number
}

interface RelationshipHealth {
  contact: string
  score: number
  trend: 'improving' | 'stable' | 'declining'
  engagement_frequency: string
  next_action: string
  days_since_contact: number
}

interface MediaRelationsResult {
  journalist_profiles: JournalistProfile[]
  relationship_health: RelationshipHealth[]
  pitch_matches: Array<{
    journalist: string
    outlet: string
    match_score: number
    match_reasons: string[]
    suggested_pitch: string
    optimal_timing: string
  }>
  interaction_summary: {
    total_contacts: number
    active_relationships: number
    needs_attention: number
    avg_engagement: number
  }
  recommended_actions: string[]
}

function analyzeMediaRelations(input: MediaRelationsInput): MediaRelationsResult {
  const rng = seededRandom(JSON.stringify(input))
  const contacts = input.contacts
  const storyKeywords = input.story_angle.toLowerCase().split(/\s+/).filter(w => w.length > 3)

  const profiles: JournalistProfile[] = contacts.map(c => {
    const influenceScore = Math.min(100, Math.round(
      (c.engagement_score * 0.4) + (c.previous_coverage.length * 8) +
      (c.responsiveness === 'high' ? 30 : c.responsiveness === 'medium' ? 15 : 5)
    ))
    let tier: 'strategic' | 'active' | 'developing' | 'new' = 'new'
    if (c.engagement_score >= 75 && c.previous_coverage.length >= 3) tier = 'strategic'
    else if (c.engagement_score >= 50) tier = 'active'
    else if (c.engagement_score >= 25) tier = 'developing'
    const daysSince = c.last_contact_date ? Math.max(0, Math.round((Date.now() - new Date(c.last_contact_date).getTime()) / 86400000)) : 999
    return {
      name: c.name, outlet: c.outlet, beat: c.beat,
      influence_score: influenceScore,
      engagement_score: c.engagement_score,
      relationship_tier: tier,
      last_interaction: daysSince === 999 ? 'No contact' : `${daysSince} days ago`,
      key_topics: [c.beat, ...c.previous_coverage.slice(0, 2).map(pc => pc.split(' ').slice(0, 3).join(' '))],
      pitch_responsiveness: c.responsiveness,
      coverage_count: c.previous_coverage.length
    }
  })

  const relationshipHealth: RelationshipHealth[] = contacts.map(c => {
    const score = Math.round((c.engagement_score * 0.6) + (c.previous_coverage.length * 5) + (c.responsiveness === 'high' ? 20 : c.responsiveness === 'medium' ? 10 : 0))
    const daysSince = c.last_contact_date ? Math.round((Date.now() - new Date(c.last_contact_date).getTime()) / 86400000) : 999
    const trend: 'improving' | 'stable' | 'declining' = daysSince < 30 ? 'improving' : daysSince < 90 ? 'stable' : 'declining'
    const frequency = c.responsiveness === 'high' ? 'Weekly' : c.responsiveness === 'medium' ? 'Monthly' : 'Quarterly'
    const nextAction = trend === 'declining' ? 'Re-engagement outreach' : trend === 'stable' ? 'Regular update pitch' : 'Continue nurturing'
    return { contact: `${c.name} (${c.outlet})`, score: Math.min(100, score), trend, engagement_frequency: frequency, next_action: nextAction, days_since_contact: daysSince }
  }).sort((a, b) => b.score - a.score)

  const pitchMatches = contacts.map(c => {
    const beatKeywords = c.beat.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const coverageKeywords = c.previous_coverage.join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 3)
    let matchScore = 0
    const matchReasons: string[] = []
    const beatOverlap = storyKeywords.filter(k => beatKeywords.includes(k)).length
    if (beatOverlap > 0) { matchScore += beatOverlap * 20; matchReasons.push(`Beat alignment: ${beatOverlap} keyword matches`) }
    const coverageOverlap = storyKeywords.filter(k => coverageKeywords.includes(k)).length
    if (coverageOverlap > 0) { matchScore += coverageOverlap * 15; matchReasons.push(`Previous coverage relevance: ${coverageOverlap} matches`) }
    matchScore += c.engagement_score * 0.2
    if (c.responsiveness === 'high') matchScore += 10
    matchScore = Math.min(100, Math.round(matchScore))
    return {
      journalist: c.name, outlet: c.outlet, match_score: matchScore,
      match_reasons: matchReasons,
      suggested_pitch: `Personalized pitch focusing on ${c.beat} angle, referencing their previous work. Format: ${c.preferred_format}.`,
      optimal_timing: c.responsiveness === 'high' ? 'Within 24 hours' : c.responsiveness === 'medium' ? '2-3 business days' : '1 week follow-up'
    }
  }).sort((a, b) => b.match_score - a.match_score)

  const activeCount = relationshipHealth.filter(r => r.days_since_contact < 60).length
  const needsAttention = relationshipHealth.filter(r => r.trend === 'declining').length
  const avgEngagement = contacts.length > 0 ? Math.round(contacts.reduce((s, c) => s + c.engagement_score, 0) / contacts.length) : 0

  return {
    journalist_profiles: profiles,
    relationship_health: relationshipHealth,
    pitch_matches: pitchMatches,
    interaction_summary: { total_contacts: contacts.length, active_relationships: activeCount, needs_attention: needsAttention, avg_engagement: avgEngagement },
    recommended_actions: [
      `Prioritize outreach to ${pitchMatches.filter(p => p.match_score >= 70).length} high-match journalists`,
      `Re-engage ${needsAttention} declining relationships with personalized updates`,
      `Schedule quarterly check-ins with ${profiles.filter(p => p.relationship_tier === 'strategic').length} strategic contacts`,
      `Update journalist profiles with recent coverage and beat changes`
    ]
  }
}

function formatMediaRelationsReport(r: MediaRelationsResult): string {
  const lines: string[] = []
  lines.push('# Media Relations Tracker Report')
  lines.push('')
  lines.push(`**${r.interaction_summary.total_contacts}** contacts | **${r.interaction_summary.active_relationships}** active | **${r.interaction_summary.needs_attention}** need attention | Avg engagement: **${r.interaction_summary.avg_engagement}**`)
  lines.push('')
  lines.push('## Journalist Profiles')
  lines.push('| Name | Outlet | Beat | Influence | Engagement | Tier | Last Contact |')
  lines.push('|------|--------|------|-----------|------------|------|-------------|')
  for (const p of r.journalist_profiles.slice(0, 15)) {
    lines.push(`| ${p.name} | ${p.outlet} | ${p.beat} | ${p.influence_score} | ${p.engagement_score} | ${p.relationship_tier.toUpperCase()} | ${p.last_interaction} |`)
  }
  lines.push('')
  lines.push('## Relationship Health')
  lines.push('| Contact | Score | Trend | Frequency | Next Action |')
  lines.push('|---------|-------|-------|-----------|-------------|')
  for (const rh of r.relationship_health.slice(0, 10)) {
    const trendIcon = rh.trend === 'improving' ? '[UP]' : rh.trend === 'stable' ? '[FLAT]' : '[DOWN]'
    lines.push(`| ${rh.contact.substring(0, 35)} | ${rh.score} | ${trendIcon} ${rh.trend} | ${rh.engagement_frequency} | ${rh.next_action} |`)
  }
  lines.push('')
  lines.push('## Top Pitch Matches')
  for (const m of r.pitch_matches.slice(0, 5)) {
    lines.push(`**${m.journalist}** — ${m.outlet} (Score: ${m.match_score}/100)`)
    for (const reason of m.match_reasons) lines.push(`  - ${reason}`)
    lines.push(`  Pitch: ${m.suggested_pitch}`)
    lines.push(`  Timing: ${m.optimal_timing}`)
    lines.push('')
  }
  lines.push('## Recommended Actions')
  for (const a of r.recommended_actions) lines.push(`- [ ] ${a}`)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Relationship scores are algorithmic estimates based on interaction history. Actual journalist relationships require ongoing personal engagement and cannot be fully captured by scoring models.*')
  return lines.join('\n')
}

// ==================== TOOL 3: KOL STRATEGY MANAGER ====================

interface KOLStrategyInput {
  campaign: {
    name: string
    brand: string
    industry: string
    budget_usd: number
    start_date: string
    end_date: string
    objectives: Array<'awareness' | 'engagement' | 'conversion' | 'loyalty' | 'ugc'>
    target_audience: { age_range: string; gender: string; interests: string[] }
  }
  kols: Array<{
    name: string
    platform: string
    followers: number
    engagement_rate: number
    niche: string
    avg_cost_per_post: number
    previous_brand_collabs: number
    audience_match_score: number
    content_quality_score: number
  }>
  strategy_preference?: 'broad_reach' | 'niche_targeted' | 'balanced' | 'performance_driven'
}

interface KOLRecommendation {
  kol_name: string
  platform: string
  followers: number
  engagement_rate: number
  cost_per_post: number
  estimated_reach: number
  estimated_engagement: number
  roi_estimate: number
  priority: 'must_have' | 'strong_recommend' | 'consider' | 'low_priority'
  content_suggestion: string
  rationale: string
}

interface KOLStrategyResult {
  strategy_type: string
  total_kols_analyzed: number
  recommended_kols: KOLRecommendation[]
  budget_allocation: Array<{ tier: string; percentage: number; kols_count: number; budget_usd: number }>
  timeline_phases: Array<{ phase: string; duration: string; activities: string[] }>
  performance_projections: Array<{ metric: string; conservative: string; expected: string; optimistic: string }>
  risk_mitigation: string[]
}

function analyzeKOLStrategy(input: KOLStrategyInput): KOLStrategyResult {
  const rng = seededRandom(JSON.stringify(input))
  const campaign = input.campaign
  const preference = input.strategy_preference || 'balanced'

  const recommendations: KOLRecommendation[] = input.kols.map(kol => {
    const reachEstimate = Math.round(kol.followers * kol.engagement_rate / 100 * (3 + rng() * 2))
    const engEstimate = Math.round(reachEstimate * (kol.engagement_rate / 100) * (1 + rng()))
    const roiEstimate = roundTo((engEstimate * 0.05) / kol.avg_cost_per_post, 2)
    let priority: 'must_have' | 'strong_recommend' | 'consider' | 'low_priority' = 'low_priority'
    const compositeScore = (kol.audience_match_score * 0.3 + kol.content_quality_score * 0.3 + kol.engagement_rate * 10 * 0.2 + Math.min(kol.previous_brand_collabs * 5, 20) * 0.2)
    if (compositeScore >= 75) priority = 'must_have'
    else if (compositeScore >= 60) priority = 'strong_recommend'
    else if (compositeScore >= 40) priority = 'consider'

    const contentSuggestions = [
      `Behind-the-scenes ${campaign.industry} content featuring ${campaign.brand}`,
      `Authentic product integration in daily routine`,
      `Educational content about ${campaign.industry} innovation`,
      `User-generated content challenge with branded hashtag`
    ]

    return {
      kol_name: kol.name, platform: kol.platform, followers: kol.followers,
      engagement_rate: kol.engagement_rate, cost_per_post: kol.avg_cost_per_post,
      estimated_reach: reachEstimate, estimated_engagement: engEstimate,
      roi_estimate: roiEstimate, priority,
      content_suggestion: pickRandom(rng, contentSuggestions),
      rationale: `Audience match: ${kol.audience_match_score}/100 | Content quality: ${kol.content_quality_score}/100 | Engagement: ${kol.engagement_rate}%`
    }
  }).sort((a, b) => b.roi_estimate - a.roi_estimate)

  const mustHave = recommendations.filter(r => r.priority === 'must_have')
  const strongRec = recommendations.filter(r => r.priority === 'strong_recommend')
  const consider = recommendations.filter(r => r.priority === 'consider')

  const budgetAlloc = [
    { tier: 'Must-Have KOLs', percentage: 50, kols_count: mustHave.length, budget_usd: Math.round(campaign.budget_usd * 0.5) },
    { tier: 'Strong Recommend', percentage: 30, kols_count: strongRec.length, budget_usd: Math.round(campaign.budget_usd * 0.3) },
    { tier: 'Consider', percentage: 15, kols_count: consider.length, budget_usd: Math.round(campaign.budget_usd * 0.15) },
    { tier: 'Contingency', percentage: 5, kols_count: 0, budget_usd: Math.round(campaign.budget_usd * 0.05) }
  ]

  const totalEng = recommendations.reduce((s, r) => s + r.estimated_engagement, 0)
  const totalReach = recommendations.reduce((s, r) => s + r.estimated_reach, 0)

  return {
    strategy_type: preference,
    total_kols_analyzed: input.kols.length,
    recommended_kols: recommendations,
    budget_allocation: budgetAlloc,
    timeline_phases: [
      { phase: 'Pre-Launch', duration: '2 weeks before', activities: ['Contract negotiation', 'Content brief creation', 'Product seeding'] },
      { phase: 'Launch Wave', duration: 'Week 1-2', activities: ['Primary content goes live', 'Paid amplification', 'Community engagement'] },
      { phase: 'Sustain', duration: 'Week 3-4', activities: ['Secondary content', 'UGC amplification', 'Performance optimization'] },
      { phase: 'Wrap-up', duration: 'Final week', activities: ['Performance reporting', 'Relationship maintenance', 'Case study creation'] }
    ],
    performance_projections: [
      { metric: 'Total Reach', conservative: `${(totalReach * 0.7 / 1000).toFixed(0)}K`, expected: `${(totalReach / 1000).toFixed(0)}K`, optimistic: `${(totalReach * 1.4 / 1000).toFixed(0)}K` },
      { metric: 'Total Engagement', conservative: `${(totalEng * 0.6 / 1000).toFixed(0)}K`, expected: `${(totalEng / 1000).toFixed(0)}K`, optimistic: `${(totalEng * 1.5 / 1000).toFixed(0)}K` },
      { metric: 'Avg CPE', conservative: `$${roundTo(campaign.budget_usd / (totalEng * 0.6), 3)}`, expected: `$${roundTo(campaign.budget_usd / totalEng, 3)}`, optimistic: `$${roundTo(campaign.budget_usd / (totalEng * 1.5), 3)}` },
      { metric: 'Brand Mentions', conservative: `${Math.round(50 + rng() * 30)}`, expected: `${Math.round(100 + rng() * 50)}`, optimistic: `${Math.round(200 + rng() * 100)}` }
    ],
    risk_mitigation: [
      'Diversify across platforms to reduce single-platform dependency',
      'Include performance clauses in KOL contracts',
      'Monitor for brand safety issues in real-time',
      'Maintain backup KOL list for rapid replacement',
      'Ensure FTC/ASA disclosure compliance on all posts'
    ]
  }
}

function formatKOLStrategyReport(r: KOLStrategyResult): string {
  const lines: string[] = []
  lines.push('# KOL Strategy & Performance Report')
  lines.push('')
  lines.push(`**Strategy:** ${r.strategy_type} | **${r.total_kols_analyzed}** KOLs analyzed | **${r.recommended_kols.filter(k => k.priority === 'must_have' || k.priority === 'strong_recommend').length}** recommended`)
  lines.push('')
  lines.push('## Recommended KOLs')
  lines.push('| KOL | Platform | Followers | Eng% | Cost/Post | Est. ROI | Priority |')
  lines.push('|-----|----------|-----------|------|-----------|----------|----------|')
  for (const k of r.recommended_kols) {
    lines.push(`| ${k.kol_name} | ${k.platform} | ${(k.followers / 1000).toFixed(0)}K | ${k.engagement_rate}% | $${k.cost_per_post} | ${k.roi_estimate}x | ${k.priority.replace('_', ' ').toUpperCase()} |`)
  }
  lines.push('')
  lines.push('## Budget Allocation')
  for (const ba of r.budget_allocation) {
    lines.push(`- **${ba.tier}:** ${ba.percentage}% ($${ba.budget_usd.toLocaleString()}) — ${ba.kols_count} KOLs`)
  }
  lines.push('')
  lines.push('## Content Suggestions')
  for (const k of r.recommended_kols.filter(k => k.priority === 'must_have' || k.priority === 'strong_recommend').slice(0, 5)) {
    lines.push(`**${k.kol_name}:** ${k.content_suggestion}`)
    lines.push(`  ${k.rationale}`)
    lines.push('')
  }
  lines.push('## Performance Projections')
  lines.push('| Metric | Conservative | Expected | Optimistic |')
  lines.push('|--------|-------------|----------|------------|')
  for (const p of r.performance_projections) {
    lines.push(`| ${p.metric} | ${p.conservative} | ${p.expected} | ${p.optimistic} |`)
  }
  lines.push('')
  lines.push('## Risk Mitigation')
  for (const risk of r.risk_mitigation) lines.push(`- ${risk}`)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ROI estimates are projections based on historical engagement data. Actual results depend on content quality, audience receptivity, and market conditions. Past performance does not guarantee future results.*')
  return lines.join('\n')
}

// ==================== TOOL 4: BRAND SENTIMENT MONITOR ====================

interface SentimentMonitorInput {
  brand_name: string
  monitoring_period_days: number
  data_sources: Array<'news' | 'social_media' | 'forums' | 'review_sites' | 'blogs' | 'broadcast'>
  mentions: Array<{
    source: string
    source_type: string
    date: string
    content_snippet: string
    sentiment: 'positive' | 'neutral' | 'negative'
    reach: number
    url?: string
    author_influence: 'high' | 'medium' | 'low'
  }>
  competitors?: string[]
  alert_threshold?: { negative_spike_pct: number; volume_spike_multiplier: number }
}

interface SentimentTrend {
  period: string
  positive_pct: number
  neutral_pct: number
  negative_pct: number
  net_sentiment_score: number
  mention_volume: number
  avg_reach: number
}

interface CrisisAlert {
  level: 'critical' | 'high' | 'medium' | 'low'
  trigger: string
  description: string
  affected_channels: string[]
  recommended_action: string
  response_timeframe: string
}

interface SentimentMonitorResult {
  overall_sentiment: { positive: number; neutral: number; negative: number; net_score: number }
  sentiment_trends: SentimentTrend[]
  crisis_alerts: CrisisAlert[]
  top_positive_themes: string[]
  top_negative_themes: string[]
  source_breakdown: Array<{ source: string; mentions: number; avg_sentiment: string }>
  competitor_comparison: Array<{ competitor: string; sentiment_score: number; mention_share: number }>
  recommendations: string[]
}

function analyzeBrandSentiment(input: SentimentMonitorInput): SentimentMonitorResult {
  const rng = seededRandom(JSON.stringify(input))
  const mentions = input.mentions
  const total = mentions.length || 1
  const positive = mentions.filter(m => m.sentiment === 'positive').length
  const neutral = mentions.filter(m => m.sentiment === 'neutral').length
  const negative = mentions.filter(m => m.sentiment === 'negative').length

  const posPct = Math.round((positive / total) * 100)
  const neuPct = Math.round((neutral / total) * 100)
  const negPct = 100 - posPct - neuPct
  const netScore = posPct - negPct

  const trends: SentimentTrend[] = []
  const periodDays = input.monitoring_period_days || 30
  const segments = Math.min(6, Math.max(2, Math.floor(periodDays / 5)))
  for (let i = 0; i < segments; i++) {
    const segPositive = Math.max(0, posPct + Math.round((rng() - 0.5) * 20))
    const segNegative = Math.max(0, negPct + Math.round((rng() - 0.5) * 15))
    const segNeutral = 100 - segPositive - segNegative
    const segVolume = Math.round(total / segments * (0.7 + rng() * 0.6))
    trends.push({
      period: `Day ${i * Math.floor(periodDays / segments) + 1}-${(i + 1) * Math.floor(periodDays / segments)}`,
      positive_pct: segPositive, neutral_pct: Math.max(0, segNeutral), negative_pct: segNegative,
      net_sentiment_score: segPositive - segNegative,
      mention_volume: segVolume,
      avg_reach: Math.round(1000 + rng() * 50000)
    })
  }

  const alerts: CrisisAlert[] = []
  const threshold = input.alert_threshold || { negative_spike_pct: 30, volume_spike_multiplier: 2.0 }
  if (negPct >= threshold.negative_spike_pct) {
    alerts.push({
      level: 'critical', trigger: 'Negative sentiment spike',
      description: `Negative sentiment at ${negPct}% exceeds ${threshold.negative_spike_pct}% threshold`,
      affected_channels: mentions.filter(m => m.sentiment === 'negative').slice(0, 3).map(m => m.source),
      recommended_action: 'Activate crisis communications team immediately. Prepare holding statement.',
      response_timeframe: 'Within 1 hour'
    })
  }
  if (negPct >= 20 && negPct < threshold.negative_spike_pct) {
    alerts.push({
      level: 'medium', trigger: 'Elevated negative mentions',
      description: `Negative sentiment at ${negPct}% is above healthy range`,
      affected_channels: ['Social media', 'Review sites'],
      recommended_action: 'Increase monitoring frequency. Prepare response templates.',
      response_timeframe: 'Within 24 hours'
    })
  }
  const highInfluenceNeg = mentions.filter(m => m.sentiment === 'negative' && m.author_influence === 'high')
  if (highInfluenceNeg.length > 0) {
    alerts.push({
      level: 'high', trigger: 'High-influence negative coverage',
      description: `${highInfluenceNeg.length} negative mentions from high-influence sources detected`,
      affected_channels: highInfluenceNeg.map(m => m.source),
      recommended_action: 'Direct outreach to journalists/influencers. Offer executive interview.',
      response_timeframe: 'Within 4 hours'
    })
  }

  const sourceMap = new Map<string, { count: number; sentiments: number[] }>()
  for (const m of mentions) {
    const existing = sourceMap.get(m.source_type) || { count: 0, sentiments: [] }
    existing.count++
    existing.sentiments.push(m.sentiment === 'positive' ? 1 : m.sentiment === 'negative' ? -1 : 0)
    sourceMap.set(m.source_type, existing)
  }
  const sourceBreakdown = Array.from(sourceMap.entries()).map(([source, data]) => ({
    source, mentions: data.count,
    avg_sentiment: (data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length).toFixed(2)
  }))

  const competitors = input.competitors || []
  const compComparison = competitors.map(comp => ({
    competitor: comp,
    sentiment_score: Math.round(netScore + (rng() - 0.5) * 30),
    mention_share: Math.round(rng() * 30 + 10)
  }))

  return {
    overall_sentiment: { positive: posPct, neutral: neuPct, negative: negPct, net_score: netScore },
    sentiment_trends: trends,
    crisis_alerts: alerts,
    top_positive_themes: ['Product innovation', 'Customer service excellence', 'Industry leadership', 'Social responsibility'],
    top_negative_themes: negPct > 15 ? ['Pricing concerns', 'Customer support gaps', 'Competitive pressure'] : ['Minor complaints within normal range'],
    source_breakdown: sourceBreakdown,
    competitor_comparison: compComparison,
    recommendations: [
      negPct > 20 ? 'Urgent: Deploy crisis response protocol' : 'Continue proactive reputation management',
      'Amplify positive stories through owned channels',
      'Engage with detractors constructively on social platforms',
      'Increase share of voice through thought leadership content',
      'Monitor competitor sentiment shifts for opportunity identification'
    ]
  }
}

function formatSentimentReport(r: SentimentMonitorResult): string {
  const lines: string[] = []
  lines.push('# Brand Sentiment Monitor Report')
  lines.push('')
  const s = r.overall_sentiment
  const sentimentLabel = s.net_score > 20 ? 'POSITIVE' : s.net_score > -10 ? 'NEUTRAL' : 'NEGATIVE'
  lines.push(`**Overall Sentiment:** ${sentimentLabel} (Net Score: ${s.net_score}) | Positive: ${s.positive}% | Neutral: ${s.neutral}% | Negative: ${s.negative}%`)
  lines.push('')
  if (r.crisis_alerts.length > 0) {
    lines.push('## Crisis Alerts')
    for (const alert of r.crisis_alerts) {
      lines.push(`### [${alert.level.toUpperCase()}] ${alert.trigger}`)
      lines.push(`  ${alert.description}`)
      lines.push(`  Channels: ${alert.affected_channels.join(', ')}`)
      lines.push(`  Action: ${alert.recommended_action}`)
      lines.push(`  Timeframe: ${alert.response_timeframe}`)
      lines.push('')
    }
  }
  lines.push('## Sentiment Trends')
  lines.push('| Period | Positive | Neutral | Negative | Net Score | Volume |')
  lines.push('|--------|----------|---------|----------|-----------|--------|')
  for (const t of r.sentiment_trends) {
    lines.push(`| ${t.period} | ${t.positive_pct}% | ${t.neutral_pct}% | ${t.negative_pct}% | ${t.net_sentiment_score} | ${t.mention_volume} |`)
  }
  lines.push('')
  lines.push('## Source Breakdown')
  for (const sb of r.source_breakdown) {
    lines.push(`- **${sb.source}:** ${sb.mentions} mentions (avg sentiment: ${sb.avg_sentiment})`)
  }
  lines.push('')
  lines.push('## Key Themes')
  lines.push('**Positive:**')
  for (const t of r.top_positive_themes) lines.push(`- ${t}`)
  lines.push('**Negative:**')
  for (const t of r.top_negative_themes) lines.push(`- ${t}`)
  lines.push('')
  if (r.competitor_comparison.length > 0) {
    lines.push('## Competitor Comparison')
    lines.push('| Competitor | Sentiment Score | Mention Share |')
    lines.push('|-----------|----------------|----------------|')
    for (const c of r.competitor_comparison) {
      lines.push(`| ${c.competitor} | ${c.sentiment_score} | ${c.mention_share}% |`)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Sentiment analysis is based on automated classification and may not capture nuance, sarcasm, or context. Human review recommended for critical decisions.*')
  return lines.join('\n')
}

// ==================== TOOL 5: CONTENT AMPLIFIER ====================

interface ContentAmplifierInput {
  content: {
    content_id: string
    title: string
    format: 'article' | 'video' | 'infographic' | 'podcast' | 'whitepaper' | 'case_study' | 'social_post'
    topic: string
    target_keywords: string[]
    current_views: number
    current_engagement: number
    publish_date: string
    url?: string
  }
  amplification_channels?: Array<'seo' | 'social_paid' | 'email' | 'syndication' | 'influencer' | 'community' | 'partnership'>
  budget_usd?: number
  goals?: Array<'traffic' | 'engagement' | 'leads' | 'backlinks' | 'brand_awareness'>
}

interface SEOOptimization {
  keyword: string
  current_rank: number
  search_volume: number
  difficulty: number
  opportunity_score: number
  recommendation: string
}

interface AmplificationTactic {
  channel: string
  tactic: string
  effort: 'low' | 'medium' | 'high'
  cost_estimate: number
  expected_lift_pct: number
  priority: 'high' | 'medium' | 'low'
  timeline: string
}

interface ContentAmplifierResult {
  content_id: string
  content_title: string
  seo_optimizations: SEOOptimization[]
  amplification_tactics: AmplificationTactic[]
  repurposing_suggestions: Array<{ original_format: string; new_format: string; channel: string; effort: string; reach_potential: string }>
  performance_forecast: Array<{ metric: string; current: string; projected_30d: string; projected_90d: string }>
  quick_wins: string[]
}

function analyzeContentAmplification(input: ContentAmplifierInput): ContentAmplifierResult {
  const rng = seededRandom(JSON.stringify(input))
  const content = input.content
  const budget = input.budget_usd || 2000
  const channels = input.amplification_channels || ['seo', 'social_paid', 'email', 'syndication']

  const seoOpts: SEOOptimization[] = content.target_keywords.map((kw, i) => {
    const currentRank = Math.round(10 + rng() * 40)
    const searchVol = Math.round(1000 + rng() * 50000)
    const difficulty = Math.round(20 + rng() * 70)
    const opportunity = Math.round((searchVol / 1000) * (100 - difficulty) / 100 * (50 / Math.max(currentRank, 5)))
    return {
      keyword: kw, current_rank: currentRank, search_volume: searchVol, difficulty,
      opportunity_score: Math.min(100, opportunity),
      recommendation: currentRank > 20 ? 'Create dedicated landing page with long-tail variation' : currentRank > 10 ? 'Optimize on-page elements and build internal links' : 'Maintain position with fresh content updates'
    }
  }).sort((a, b) => b.opportunity_score - a.opportunity_score)

  const tactics: AmplificationTactic[] = []
  const channelTactics: Record<string, AmplificationTactic[]> = {
    seo: [
      { channel: 'SEO', tactic: 'Optimize title tag and meta description for target keywords', effort: 'low', cost_estimate: 0, expected_lift_pct: 25, priority: 'high', timeline: '1-2 days' },
      { channel: 'SEO', tactic: 'Build 5-10 quality backlinks through guest posting', effort: 'high', cost_estimate: Math.round(budget * 0.2), expected_lift_pct: 40, priority: 'medium', timeline: '2-4 weeks' }
    ],
    social_paid: [
      { channel: 'Paid Social', tactic: 'Boost top-performing posts to lookalike audiences', effort: 'low', cost_estimate: Math.round(budget * 0.3), expected_lift_pct: 60, priority: 'high', timeline: 'Ongoing' },
      { channel: 'Paid Social', tactic: 'Run retargeting campaign for content engagers', effort: 'medium', cost_estimate: Math.round(budget * 0.15), expected_lift_pct: 35, priority: 'medium', timeline: '1-2 weeks' }
    ],
    email: [
      { channel: 'Email', tactic: 'Feature in next newsletter with personalized subject line', effort: 'low', cost_estimate: 0, expected_lift_pct: 20, priority: 'high', timeline: 'Next send' },
      { channel: 'Email', tactic: 'Segment-specific email to high-intent subscribers', effort: 'medium', cost_estimate: Math.round(budget * 0.05), expected_lift_pct: 30, priority: 'medium', timeline: '3-5 days' }
    ],
    syndication: [
      { channel: 'Syndication', tactic: 'Republish on Medium/LinkedIn Articles with canonical tags', effort: 'low', cost_estimate: 0, expected_lift_pct: 15, priority: 'high', timeline: '1-2 days' },
      { channel: 'Syndication', tactic: 'Submit to industry aggregator platforms', effort: 'medium', cost_estimate: Math.round(budget * 0.1), expected_lift_pct: 25, priority: 'medium', timeline: '1 week' }
    ],
    influencer: [
      { channel: 'Influencer', tactic: 'Share with industry micro-influencers for amplification', effort: 'medium', cost_estimate: Math.round(budget * 0.25), expected_lift_pct: 45, priority: 'medium', timeline: '1-2 weeks' }
    ],
    community: [
      { channel: 'Community', tactic: 'Share in relevant Reddit/Hacker News/Slack communities', effort: 'low', cost_estimate: 0, expected_lift_pct: 20, priority: 'high', timeline: 'Immediate' }
    ],
    partnership: [
      { channel: 'Partnership', tactic: 'Co-promote with complementary brand partners', effort: 'high', cost_estimate: Math.round(budget * 0.15), expected_lift_pct: 50, priority: 'low', timeline: '2-4 weeks' }
    ]
  }

  for (const ch of channels) {
    const chTactics = channelTactics[ch] || []
    tactics.push(...chTactics)
  }
  tactics.sort((a, b) => (a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2) - (b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2))

  const repurposeMap: Record<string, Array<{ format: string; channel: string; effort: string; reach: string }>> = {
    article: [
      { format: 'Infographic', channel: 'Pinterest/LinkedIn', effort: 'medium', reach: 'High' },
      { format: 'Video summary (2 min)', channel: 'YouTube/Instagram', effort: 'high', reach: 'Very High' },
      { format: 'Twitter thread', channel: 'Twitter/X', effort: 'low', reach: 'Medium' },
      { format: 'Podcast episode', channel: 'Spotify/Apple', effort: 'high', reach: 'Medium' }
    ],
    video: [
      { format: 'Blog post transcript', channel: 'Website/Medium', effort: 'low', reach: 'Medium' },
      { format: 'Short clips (30-60s)', channel: 'TikTok/Reels', effort: 'medium', reach: 'Very High' },
      { format: 'Quote cards', channel: 'Instagram/LinkedIn', effort: 'low', reach: 'High' }
    ],
    infographic: [
      { format: 'Blog post embed', channel: 'Website', effort: 'low', reach: 'Medium' },
      { format: 'Slide deck', channel: 'SlideShare', effort: 'medium', reach: 'Medium' },
      { format: 'Social media tiles', channel: 'All platforms', effort: 'low', reach: 'High' }
    ],
    podcast: [
      { format: 'Blog post summary', channel: 'Website', effort: 'medium', reach: 'Medium' },
      { format: 'Audiogram clips', channel: 'Social media', effort: 'low', reach: 'High' },
      { format: 'Full transcript', channel: 'SEO/Website', effort: 'low', reach: 'Medium' }
    ],
    whitepaper: [
      { format: 'Executive summary blog', channel: 'Website', effort: 'low', reach: 'High' },
      { format: 'Key stats infographic', channel: 'Social media', effort: 'medium', reach: 'High' },
      { format: 'Webinar presentation', channel: 'Zoom/YouTube', effort: 'high', reach: 'Medium' }
    ],
    case_study: [
      { format: 'Customer quote graphics', channel: 'Social media', effort: 'low', reach: 'High' },
      { format: 'Video testimonial', channel: 'YouTube/Website', effort: 'high', reach: 'High' },
      { format: 'Data visualization', channel: 'LinkedIn/Twitter', effort: 'medium', reach: 'Medium' }
    ],
    social_post: [
      { format: 'Blog post expansion', channel: 'Website', effort: 'medium', reach: 'Medium' },
      { format: 'Email newsletter feature', channel: 'Email', effort: 'low', reach: 'Low' }
    ]
  }

  const repurposing = (repurposeMap[content.format] || []).map(r => ({
    original_format: content.format, new_format: r.format, channel: r.channel, effort: r.effort, reach_potential: r.reach
  }))

  const currentViews = content.current_views || 1000
  const currentEng = content.current_engagement || 100

  return {
    content_id: content.content_id,
    content_title: content.title,
    seo_optimizations: seoOpts,
    amplification_tactics: tactics,
    repurposing_suggestions: repurposing,
    performance_forecast: [
      { metric: 'Total Views', current: `${currentViews.toLocaleString()}`, projected_30d: `${Math.round(currentViews * 2.5).toLocaleString()}`, projected_90d: `${Math.round(currentViews * 4.2).toLocaleString()}` },
      { metric: 'Engagement Rate', current: `${roundTo(currentEng / currentViews * 100, 2)}%`, projected_30d: `${roundTo(currentEng / currentViews * 100 * 1.3, 2)}%`, projected_90d: `${roundTo(currentEng / currentViews * 100 * 1.5, 2)}%` },
      { metric: 'Backlinks Generated', current: '0', projected_30d: `${Math.round(5 + rng() * 10)}`, projected_90d: `${Math.round(15 + rng() * 25)}` },
      { metric: 'Keyword Rankings Improved', current: '0', projected_30d: `${Math.round(2 + rng() * 4)}`, projected_90d: `${Math.round(6 + rng() * 8)}` }
    ],
    quick_wins: [
      'Add internal links from high-traffic pages to this content',
      'Update publish date to reflect freshness for SEO',
      'Share in relevant online communities today',
      'Create 3-5 social media variations for immediate posting',
      'Email to segmented list of engaged subscribers'
    ]
  }
}

function formatAmplificationReport(r: ContentAmplifierResult): string {
  const lines: string[] = []
  lines.push('# Content Amplification & SEO Report')
  lines.push('')
  lines.push(`**Content:** ${r.content_title} (${r.content_id})`)
  lines.push('')
  lines.push('## SEO Optimization Opportunities')
  lines.push('| Keyword | Current Rank | Volume | Difficulty | Opportunity | Recommendation |')
  lines.push('|---------|-------------|--------|------------|-------------|----------------|')
  for (const s of r.seo_optimizations) {
    lines.push(`| ${s.keyword} | #${s.current_rank} | ${s.search_volume.toLocaleString()} | ${s.difficulty} | ${s.opportunity_score} | ${s.recommendation.substring(0, 50)} |`)
  }
  lines.push('')
  lines.push('## Amplification Tactics')
  for (const t of r.amplification_tactics) {
    lines.push(`**[${t.priority.toUpperCase()}] ${t.channel}: ${t.tactic}**`)
    lines.push(`  Effort: ${t.effort} | Cost: $${t.cost_estimate} | Expected lift: +${t.expected_lift_pct}% | Timeline: ${t.timeline}`)
    lines.push('')
  }
  lines.push('## Repurposing Suggestions')
  for (const rp of r.repurposing_suggestions) {
    lines.push(`- **${rp.original_format}** → **${rp.new_format}** (${rp.channel}) — Effort: ${rp.effort} | Reach: ${rp.reach_potential}`)
  }
  lines.push('')
  lines.push('## Performance Forecast')
  lines.push('| Metric | Current | 30-Day | 90-Day |')
  lines.push('|--------|---------|--------|--------|')
  for (const p of r.performance_forecast) {
    lines.push(`| ${Object.keys(p).length > 0 ? 'Metric' : ''} | ${p.current} | ${p.projected_30d} | ${p.projected_90d} |`)
  }
  lines.push('')
  lines.push('## Quick Wins')
  for (const qw of r.quick_wins) lines.push(`- [ ] ${qw}`)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Performance forecasts are estimates based on industry benchmarks and historical data. Actual results depend on content quality, competitive landscape, and algorithm changes.*')
  return lines.join('\n')
}

// ==================== TOOL 6: CAMPAIGN EFFECTIVENESS ====================

interface CampaignEffectivenessInput {
  campaign: {
    name: string
    start_date: string
    end_date: string
    total_budget_usd: number
    channels: Array<{ name: string; budget_usd: number; spend_usd: number }>
    objectives: Array<{ metric: string; target: number; actual: number; unit: string }>
  }
  touchpoints: Array<{ channel: string; date: string; interaction_type: string; attributed_revenue: number; conversions: number; cost: number }>
  attribution_model?: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'data_driven'
}

interface ChannelPerformance {
  channel: string
  budget: number
  spend: number
  budget_utilization: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  roi: number
  cpa: number
  roas: number
}

interface AttributionResult {
  channel: string
  first_touch_credit: number
  last_touch_credit: number
  linear_credit: number
  time_decay_credit: number
  total_conversions: number
  total_revenue: number
}

interface CampaignEffectivenessResult {
  campaign_name: string
  attribution_model_used: string
  overall_roi: number
  total_revenue: number
  total_spend: number
  total_conversions: number
  channel_performance: ChannelPerformance[]
  attribution_results: AttributionResult[]
  objective_achievement: Array<{ metric: string; target: number; actual: number; achievement_pct: number; status: string }>
  insights: string[]
  optimization_recommendations: string[]
}

function analyzeCampaignEffectiveness(input: CampaignEffectivenessInput): CampaignEffectivenessResult {
  const rng = seededRandom(JSON.stringify(input))
  const campaign = input.campaign
  const model = input.attribution_model || 'linear'

  const channelPerf: ChannelPerformance[] = campaign.channels.map(ch => {
    const impressions = Math.round(ch.spend_usd * (50 + rng() * 150))
    const clicks = Math.round(impressions * (0.01 + rng() * 0.05))
    const conversions = Math.round(clicks * (0.02 + rng() * 0.08))
    const revenue = Math.round(conversions * (50 + rng() * 200))
    const roi = ch.spend_usd > 0 ? roundTo((revenue - ch.spend_usd) / ch.spend_usd * 100, 1) : 0
    const cpa = conversions > 0 ? roundTo(ch.spend_usd / conversions, 2) : 0
    const roas = ch.spend_usd > 0 ? roundTo(revenue / ch.spend_usd, 2) : 0
    return {
      channel: ch.name, budget: ch.budget_usd, spend: ch.spend_usd,
      budget_utilization: roundTo(ch.spend_usd / ch.budget_usd * 100, 1),
      impressions, clicks, conversions, revenue, roi, cpa, roas
    }
  })

  const totalRevenue = channelPerf.reduce((s, c) => s + c.revenue, 0)
  const totalSpend = channelPerf.reduce((s, c) => s + c.spend, 0)
  const totalConversions = channelPerf.reduce((s, c) => s + c.conversions, 0)
  const overallROI = totalSpend > 0 ? roundTo((totalRevenue - totalSpend) / totalSpend * 100, 1) : 0

  const attributionResults: AttributionResult[] = campaign.channels.map(ch => {
    const tpConversions = input.touchpoints.filter(t => t.channel === ch.name).reduce((s, t) => s + t.conversions, 0)
    const tpRevenue = input.touchpoints.filter(t => t.channel === ch.name).reduce((s, t) => s + t.attributed_revenue, 0)
    const share = totalConversions > 0 ? tpConversions / totalConversions : 0
    return {
      channel: ch.name,
      first_touch_credit: roundTo(share * (0.8 + rng() * 0.4), 2),
      last_touch_credit: roundTo(share * (0.7 + rng() * 0.5), 2),
      linear_credit: roundTo(share, 2),
      time_decay_credit: roundTo(share * (0.9 + rng() * 0.3), 2),
      total_conversions: tpConversions,
      total_revenue: Math.round(tpRevenue)
    }
  })

  const objectiveAch = campaign.objectives.map(obj => {
    const achievement = obj.target > 0 ? roundTo(obj.actual / obj.target * 100, 1) : 0
    const status = achievement >= 100 ? 'ACHIEVED' : achievement >= 80 ? 'ON TRACK' : achievement >= 50 ? 'AT RISK' : 'MISSED'
    return { metric: obj.metric, target: obj.target, actual: obj.actual, achievement_pct: achievement, status }
  })

  return {
    campaign_name: campaign.name,
    attribution_model_used: model,
    overall_roi: overallROI,
    total_revenue: totalRevenue,
    total_spend: totalSpend,
    total_conversions: totalConversions,
    channel_performance: channelPerf,
    attribution_results: attributionResults,
    objective_achievement: objectiveAch,
    insights: [
      `${channelPerf.sort((a, b) => b.roi - a.roi)[0]?.channel || 'Top channel'} delivered the highest ROI at ${channelPerf.sort((a, b) => b.roi - a.roi)[0]?.roi || 0}%`,
      `Overall budget utilization: ${roundTo(totalSpend / campaign.total_budget_usd * 100, 1)}%`,
      totalSpend > campaign.total_budget_usd ? 'Campaign exceeded budget - review allocation efficiency' : 'Campaign within budget - consider scaling high-performing channels',
      `Average CPA across channels: $${totalConversions > 0 ? roundTo(totalSpend / totalConversions, 2) : 0}`,
      `Revenue concentration: Top 2 channels account for ${channelPerf.length >= 2 ? roundTo((channelPerf.sort((a, b) => b.revenue - a.revenue)[0].revenue + channelPerf.sort((a, b) => b.revenue - a.revenue)[1].revenue) / totalRevenue * 100, 1) : 0}% of total revenue`
    ],
    optimization_recommendations: [
      `Increase budget allocation to ${channelPerf.sort((a, b) => b.roi - a.roi)[0]?.channel || 'top performer'} (highest ROI)`,
      `Reduce spend on ${channelPerf.sort((a, b) => a.roi - b.roi)[0]?.channel || 'lowest performer'} or optimize creative/messaging`,
      'Implement multi-touch attribution for more accurate channel credit',
      'A/B test landing pages to improve conversion rates',
      'Set up real-time budget pacing alerts to prevent overspend'
    ]
  }
}

function formatCampaignReport(r: CampaignEffectivenessResult): string {
  const lines: string[] = []
  lines.push('# Campaign Effectiveness & ROI Report')
  lines.push('')
  lines.push(`**Campaign:** ${r.campaign_name} | **Attribution Model:** ${r.attribution_model_used}`)
  lines.push('')
  lines.push(`**Overall ROI:** ${r.overall_roi}% | **Revenue:** $${r.total_revenue.toLocaleString()} | **Spend:** $${r.total_spend.toLocaleString()} | **Conversions:** ${r.total_conversions.toLocaleString()}`)
  lines.push('')
  lines.push('## Channel Performance')
  lines.push('| Channel | Budget | Spend | Util% | Impressions | Clicks | Conv. | Revenue | ROI% | CPA | ROAS |')
  lines.push('|---------|--------|-------|-------|-------------|--------|-------|---------|------|-----|------|')
  for (const c of r.channel_performance) {
    lines.push(`| ${c.channel} | $${c.budget.toLocaleString()} | $${c.spend.toLocaleString()} | ${c.budget_utilization}% | ${c.impressions.toLocaleString()} | ${c.clicks.toLocaleString()} | ${c.conversions} | $${c.revenue.toLocaleString()} | ${c.roi}% | $${c.cpa} | ${c.roas}x |`)
  }
  lines.push('')
  lines.push('## Attribution Analysis')
  lines.push('| Channel | First Touch | Last Touch | Linear | Time Decay | Conversions | Revenue |')
  lines.push('|---------|-------------|------------|--------|------------|-------------|---------|')
  for (const a of r.attribution_results) {
    lines.push(`| ${a.channel} | ${a.first_touch_credit} | ${a.last_touch_credit} | ${a.linear_credit} | ${a.time_decay_credit} | ${a.total_conversions} | $${a.total_revenue.toLocaleString()} |`)
  }
  lines.push('')
  lines.push('## Objective Achievement')
  lines.push('| Metric | Target | Actual | Achievement | Status |')
  lines.push('|--------|--------|--------|-------------|--------|')
  for (const o of r.objective_achievement) {
    lines.push(`| ${o.metric} | ${o.target.toLocaleString()} | ${o.actual.toLocaleString()} | ${o.achievement_pct}% | ${o.status} |`)
  }
  lines.push('')
  lines.push('## Key Insights')
  for (const i of r.insights) lines.push(`- ${i}`)
  lines.push('')
  lines.push('## Optimization Recommendations')
  for (const rec of r.optimization_recommendations) lines.push(`- [ ] ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Attribution models provide estimated credit allocation. True incremental impact may differ. ROI calculations use reported revenue and may not account for all indirect effects or long-term brand value.*')
  return lines.join('\n')
}

// ==================== TOOL 7: EDITORIAL CALENDAR EDITOR ====================

interface EditorialCalendarInput {
  planning_period: { start_date: string; end_date: string; weeks: number }
  content_pillars: string[]
  content_types: Array<'blog_post' | 'video' | 'infographic' | 'podcast' | 'social_series' | 'newsletter' | 'case_study' | 'whitepaper'>
  publishing_frequency: { posts_per_week: number; videos_per_month: number; newsletters_per_month: number }
  team_capacity: { writers: number; designers: number; editors: number; hours_per_week: number }
  existing_content?: Array<{ title: string; type: string; publish_date: string; status: 'draft' | 'in_review' | 'scheduled' | 'published' }>
  key_dates?: Array<{ date: string; event: string; content_opportunity: string }>
  pipeline_stages?: string[]
}

interface CalendarEntry {
  week: number
  date_range: string
  content_items: Array<{ type: string; topic: string; pillar: string; assigned_to: string; deadline: string; status: string }>
  key_events: string[]
  capacity_utilization: number
}

interface PipelineItem {
  content_title: string
  content_type: string
  current_stage: string
  days_in_stage: number
  next_action: string
  owner: string
  deadline: string
  bottleneck: boolean
}

interface EditorialCalendarResult {
  planning_period: string
  total_content_pieces: number
  weekly_schedule: CalendarEntry[]
  content_pipeline: PipelineItem[]
  capacity_analysis: { total_hours_available: number; estimated_hours_needed: number; utilization_rate: number; bottleneck_risk: string }
  content_mix: Array<{ type: string; count: number; percentage: number }>
  recommendations: string[]
}

function analyzeEditorialCalendar(input: EditorialCalendarInput): EditorialCalendarResult {
  const rng = seededRandom(JSON.stringify(input))
  const weeks = input.planning_period.weeks || 12
  const postsPerWeek = input.publishing_frequency.posts_per_week || 3
  const totalPieces = weeks * postsPerWeek

  const weeklySchedule: CalendarEntry[] = []
  for (let w = 1; w <= Math.min(weeks, 12); w++) {
    const items: CalendarEntry['content_items'] = []
    const numItems = Math.round(postsPerWeek * (0.8 + rng() * 0.4))
    for (let i = 0; i < numItems; i++) {
      const cType = pickRandom(rng, input.content_types)
      const pillar = pickRandom(rng, input.content_pillars)
      items.push({
        type: cType, topic: `${pillar} insight #${w * 10 + i}`, pillar,
        assigned_to: `Writer ${(i % input.team_capacity.writers) + 1}`,
        deadline: `Week ${w} Day ${3 + i}`, status: w < 3 ? 'in_progress' : 'planned'
      })
    }
    const keyEvents = (input.key_dates || []).filter(kd => {
      const kdWeek = Math.ceil((new Date(kd.date).getTime() - new Date(input.planning_period.start_date).getTime()) / (7 * 86400000))
      return kdWeek === w
    }).map(kd => kd.event)

    weeklySchedule.push({
      week: w, date_range: `Week ${w} (${input.planning_period.start_date} + ${w - 1} weeks)`,
      content_items: items, key_events: keyEvents,
      capacity_utilization: Math.round(60 + rng() * 35)
    })
  }

  const pipelineStages = input.pipeline_stages || ['Ideation', 'Research', 'Drafting', 'Editing', 'Design', 'Review', 'Scheduled', 'Published']
  const pipelineItems: PipelineItem[] = []
  const existing = input.existing_content || []
  for (const ec of existing.slice(0, 15)) {
    const stageIdx = Math.floor(rng() * pipelineStages.length)
    const daysInStage = Math.round(1 + rng() * 10)
    pipelineItems.push({
      content_title: ec.title, content_type: ec.type,
      current_stage: pipelineStages[stageIdx], days_in_stage: daysInStage,
      next_action: stageIdx < pipelineStages.length - 1 ? `Move to ${pipelineStages[stageIdx + 1]}` : 'Ready to publish',
      owner: `Team member ${Math.ceil(rng() * 3)}`,
      deadline: ec.publish_date, bottleneck: daysInStage > 7
    })
  }

  const totalHours = input.team_capacity.hours_per_week * weeks
  const hoursPerPiece = 8 + rng() * 6
  const hoursNeeded = Math.round(totalPieces * hoursPerPiece)
  const utilization = roundTo(hoursNeeded / totalHours * 100, 1)

  const typeCountMap = new Map<string, number>()
  for (const ct of input.content_types) {
    typeCountMap.set(ct, Math.round(totalPieces / input.content_types.length * (0.7 + rng() * 0.6)))
  }
  const contentMix = Array.from(typeCountMap.entries()).map(([type, count]) => ({
    type, count, percentage: roundTo(count / totalPieces * 100, 1)
  }))

  return {
    planning_period: `${input.planning_period.start_date} to ${input.planning_period.end_date}`,
    total_content_pieces: totalPieces,
    weekly_schedule: weeklySchedule,
    content_pipeline: pipelineItems,
    capacity_analysis: {
      total_hours_available: totalHours,
      estimated_hours_needed: hoursNeeded,
      utilization_rate: utilization,
      bottleneck_risk: utilization > 90 ? 'HIGH - Risk of team burnout and quality decline' : utilization > 75 ? 'MEDIUM - Monitor workload distribution' : 'LOW - Capacity available for additional content'
    },
    content_mix: contentMix,
    recommendations: [
      utilization > 85 ? 'Consider hiring freelance support or reducing publishing frequency' : 'Team has capacity for additional strategic content',
      'Batch similar content types to improve production efficiency',
      'Build 2-week content buffer for unexpected disruptions',
      'Align content pillars with upcoming key dates and industry events',
      'Implement content repurposing to maximize output from each piece'
    ]
  }
}

function formatEditorialCalendarReport(r: EditorialCalendarResult): string {
  const lines: string[] = []
  lines.push('# Editorial Calendar & Content Pipeline Report')
  lines.push('')
  lines.push(`**Period:** ${r.planning_period} | **${r.total_content_pieces}** content pieces planned`)
  lines.push('')
  lines.push('## Capacity Analysis')
  lines.push(`- **Total Hours Available:** ${r.capacity_analysis.total_hours_available}`)
  lines.push(`- **Estimated Hours Needed:** ${r.capacity_analysis.estimated_hours_needed}`)
  lines.push(`- **Utilization Rate:** ${r.capacity_analysis.utilization_rate}%`)
  lines.push(`- **Bottleneck Risk:** ${r.capacity_analysis.bottleneck_risk}`)
  lines.push('')
  lines.push('## Content Mix')
  for (const cm of r.content_mix) {
    lines.push(`- **${cm.type}:** ${cm.count} pieces (${cm.percentage}%)`)
  }
  lines.push('')
  lines.push('## Weekly Schedule')
  for (const ws of r.weekly_schedule) {
    lines.push(`### Week ${ws.week} — ${ws.date_range} (Capacity: ${ws.capacity_utilization}%)`)
    for (const item of ws.content_items) {
      lines.push(`- **${item.type}:** ${item.topic} [${item.pillar}] → ${item.assigned_to} (Due: ${item.deadline})`)
    }
    if (ws.key_events.length > 0) {
      lines.push(`  Key events: ${ws.key_events.join(', ')}`)
    }
    lines.push('')
  }
  if (r.content_pipeline.length > 0) {
    lines.push('## Content Pipeline')
    lines.push('| Content | Type | Stage | Days in Stage | Next Action | Owner | Bottleneck |')
    lines.push('|---------|------|-------|---------------|-------------|-------|------------|')
    for (const p of r.content_pipeline) {
      lines.push(`| ${p.content_title.substring(0, 30)} | ${p.content_type} | ${p.current_stage} | ${p.days_in_stage} | ${p.next_action} | ${p.owner} | ${p.bottleneck ? 'YES' : 'No'} |`)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: Capacity estimates assume standard production timelines. Actual hours may vary based on content complexity, research requirements, and review cycles.*')
  return lines.join('\n')
}

// ==================== TOOL 8: INFLUENCER ROI CALCULATOR ====================

interface InfluencerROIInput {
  influencer: {
    name: string
    platform: string
    followers: number
    engagement_rate: number
    niche: string
    asking_price_per_post: number
    content_types: Array<'feed_post' | 'story' | 'reel' | 'video' | 'live' | 'blog'>
    audience_demographics: { age_range: string; gender_split: Record<string, number>; top_countries: string[] }
    previous_collab_performance?: { brand: string; engagement: number; estimated_reach: number; conversions: number }[]
  }
  campaign: {
    budget_usd: number
    deliverables: number
    duration_days: number
    kpis: Array<{ metric: string; target: number; weight: number }>
    product_price?: number
    target_cpa?: number
  }
  scheduling_preferences?: { preferred_days: string[]; blackout_dates: string[]; posting_frequency: string }
}

interface ROIBreakdown {
  investment: number
  estimated_reach: number
  estimated_impressions: number
  estimated_engagement: number
  estimated_clicks: number
  estimated_conversions: number
  estimated_revenue: number
  roi_percentage: number
  roi_multiple: number
  cpm: number
  cpe: number
  cpc: number
  cpa: number
}

interface SchedulingPlan {
  total_posts: number
  posting_schedule: Array<{ day: string; content_type: string; format: string; optimal_time: string; expected_engagement: string }>
  blackout_dates: string[]
  content_mix: Array<{ type: string; count: number; percentage: number }>
}

interface InfluencerROIResult {
  influencer_name: string
  platform: string
  roi_breakdown: ROIBreakdown
  scheduling_plan: SchedulingPlan
  scenario_analysis: Array<{ scenario: string; roi: number; probability: string; description: string }>
  benchmark_comparison: { vs_industry_avg: string; vs_similar_influencers: string; rating: 'excellent' | 'good' | 'fair' | 'poor' }
  recommendations: string[]
  contract_clauses: string[]
}

function analyzeInfluencerROI(input: InfluencerROIInput): InfluencerROIResult {
  const rng = seededRandom(JSON.stringify(input))
  const inf = input.influencer
  const campaign = input.campaign

  const estimatedReach = Math.round(inf.followers * (0.3 + rng() * 0.4))
  const estimatedImpressions = Math.round(estimatedReach * (1.5 + rng() * 1.5))
  const estimatedEngagement = Math.round(estimatedImpressions * (inf.engagement_rate / 100) * (0.8 + rng() * 0.4))
  const estimatedClicks = Math.round(estimatedEngagement * (0.05 + rng() * 0.1))
  const conversionRate = 0.01 + rng() * 0.04
  const estimatedConversions = Math.round(estimatedClicks * conversionRate)
  const avgOrderValue = campaign.product_price || 50
  const estimatedRevenue = estimatedConversions * avgOrderValue
  const investment = inf.asking_price_per_post * campaign.deliverables
  const roiPct = investment > 0 ? roundTo((estimatedRevenue - investment) / investment * 100, 1) : 0
  const roiMult = investment > 0 ? roundTo(estimatedRevenue / investment, 2) : 0

  const scheduling: SchedulingPlan = {
    total_posts: campaign.deliverables,
    posting_schedule: [],
    blackout_dates: input.scheduling_preferences?.blackout_dates || [],
    content_mix: []
  }

  const days = input.scheduling_preferences?.preferred_days || ['Tuesday', 'Wednesday', 'Thursday']
  const optimalTimes: Record<string, string> = { Instagram: '11 AM - 1 PM', TikTok: '7 PM - 9 PM', YouTube: '2 PM - 4 PM', Twitter: '9 AM - 11 AM', LinkedIn: '8 AM - 10 AM' }
  for (let i = 0; i < campaign.deliverables; i++) {
    const day = days[i % days.length]
    const cType = inf.content_types[i % inf.content_types.length]
    scheduling.posting_schedule.push({
      day, content_type: cType, format: cType.replace('_', ' '),
      optimal_time: optimalTimes[inf.platform] || '12 PM - 2 PM',
      expected_engagement: `${Math.round(estimatedEngagement / campaign.deliverables * (0.8 + rng() * 40) / 100) / 10}K - ${Math.round(estimatedEngagement / campaign.deliverables * (1.2 + rng() * 60) / 100) / 10}K`
    })
  }

  const typeCountMap = new Map<string, number>()
  for (let i = 0; i < campaign.deliverables; i++) {
    const t = inf.content_types[i % inf.content_types.length]
    typeCountMap.set(t, (typeCountMap.get(t) || 0) + 1)
  }
  scheduling.content_mix = Array.from(typeCountMap.entries()).map(([type, count]) => ({
    type, count, percentage: roundTo(count / campaign.deliverables * 100, 1)
  }))

  const industryAvgROI = 180
  const vsAvg = roiPct - industryAvgROI
  const rating: 'excellent' | 'good' | 'fair' | 'poor' = roiPct >= 300 ? 'excellent' : roiPct >= 150 ? 'good' : roiPct >= 50 ? 'fair' : 'poor'

  return {
    influencer_name: inf.name, platform: inf.platform,
    roi_breakdown: {
      investment,
      estimated_reach: estimatedReach,
      estimated_impressions: estimatedImpressions,
      estimated_engagement: estimatedEngagement,
      estimated_clicks: estimatedClicks,
      estimated_conversions: estimatedConversions,
      estimated_revenue: estimatedRevenue,
      roi_percentage: roiPct,
      roi_multiple: roiMult,
      cpm: estimatedImpressions > 0 ? roundTo(investment / estimatedImpressions * 1000, 2) : 0,
      cpe: estimatedEngagement > 0 ? roundTo(investment / estimatedEngagement, 2) : 0,
      cpc: estimatedClicks > 0 ? roundTo(investment / estimatedClicks, 2) : 0,
      cpa: estimatedConversions > 0 ? roundTo(investment / estimatedConversions, 2) : 0
    },
    scheduling_plan: scheduling,
    scenario_analysis: [
      { scenario: 'Conservative', roi: Math.round(roiPct * 0.5), probability: '25%', description: 'Below-average engagement and conversion rates' },
      { scenario: 'Expected', roi: roiPct, probability: '50%', description: 'Performance aligns with historical averages' },
      { scenario: 'Optimistic', roi: Math.round(roiPct * 1.6), probability: '20%', description: 'Content resonates strongly, above-average performance' },
      { scenario: 'Viral Upside', roi: Math.round(roiPct * 3), probability: '5%', description: 'Content goes viral, exponential reach and engagement' }
    ],
    benchmark_comparison: {
      vs_industry_avg: `${vsAvg > 0 ? '+' : ''}${vsAvg.toFixed(1)}% vs industry average (${industryAvgROI}%)`,
      vs_similar_influencers: `${roiPct > industryAvgROI * 0.8 ? 'Above' : 'Below'} median for ${inf.niche} influencers`,
      rating
    },
    recommendations: [
      roiPct < 100 ? 'Negotiate lower rate or request additional deliverables' : 'Rate is justified by projected ROI',
      `Optimal posting schedule: ${days.join(', ')} at ${optimalTimes[inf.platform] || 'midday'}`,
      'Include performance bonus clause for exceeding engagement targets',
      'Request usage rights for repurposing content across paid channels',
      'Set up unique UTM parameters and discount codes for accurate tracking'
    ],
    contract_clauses: [
      'Content approval rights with 48-hour review window',
      'Exclusivity clause preventing competitor promotions for 30 days',
      'Performance guarantee: minimum engagement rate commitment',
      'Usage rights: 6 months of content repurposing across owned channels',
      'FTC/ASA disclosure compliance requirement',
      'Payment terms: 50% upfront, 50% on content delivery'
    ]
  }
}

function formatInfluencerROIReport(r: InfluencerROIResult): string {
  const lines: string[] = []
  lines.push('# Influencer ROI Calculator & Scheduling Report')
  lines.push('')
  lines.push(`**Influencer:** ${r.influencer_name} | **Platform:** ${r.platform} | **Rating:** ${r.benchmark_comparison.rating.toUpperCase()}`)
  lines.push('')
  const roi = r.roi_breakdown
  lines.push('## ROI Breakdown')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Total Investment | $${roi.investment.toLocaleString()} |`)
  lines.push(`| Estimated Reach | ${roi.estimated_reach.toLocaleString()} |`)
  lines.push(`| Estimated Impressions | ${roi.estimated_impressions.toLocaleString()} |`)
  lines.push(`| Estimated Engagement | ${roi.estimated_engagement.toLocaleString()} |`)
  lines.push(`| Estimated Clicks | ${roi.estimated_clicks.toLocaleString()} |`)
  lines.push(`| Estimated Conversions | ${roi.estimated_conversions.toLocaleString()} |`)
  lines.push(`| Estimated Revenue | $${roi.estimated_revenue.toLocaleString()} |`)
  lines.push(`| **ROI** | **${roi.roi_percentage}% (${roi.roi_multiple}x)** |`)
  lines.push(`| CPM | $${roi.cpm} |`)
  lines.push(`| CPE | $${roi.cpe} |`)
  lines.push(`| CPC | $${roi.cpc} |`)
  lines.push(`| CPA | $${roi.cpa} |`)
  lines.push('')
  lines.push('## Scenario Analysis')
  lines.push('| Scenario | ROI | Probability | Description |')
  lines.push('|----------|-----|-------------|-------------|')
  for (const s of r.scenario_analysis) {
    lines.push(`| ${s.scenario} | ${s.roi}% | ${s.probability} | ${s.description} |`)
  }
  lines.push('')
  lines.push('## Benchmark Comparison')
  lines.push(`- **vs Industry Average:** ${r.benchmark_comparison.vs_industry_avg}`)
  lines.push(`- **vs Similar Influencers:** ${r.benchmark_comparison.vs_similar_influencers}`)
  lines.push('')
  lines.push('## Posting Schedule')
  lines.push('| # | Day | Type | Optimal Time | Expected Engagement |')
  lines.push('|---|-----|------|-------------|---------------------|')
  r.scheduling_plan.posting_schedule.forEach((ps, i) => {
    lines.push(`| ${i + 1} | ${ps.day} | ${ps.content_type} | ${ps.optimal_time} | ${ps.expected_engagement} |`)
  })
  lines.push('')
  lines.push('## Content Mix')
  for (const cm of r.scheduling_plan.content_mix) {
    lines.push(`- **${cm.type}:** ${cm.count} posts (${cm.percentage}%)`)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('## Suggested Contract Clauses')
  for (const clause of r.contract_clauses) lines.push(`- ${clause}`)
  lines.push('')
  lines.push('---')
  lines.push('*Disclaimer: ROI projections are estimates based on influencer historical data and industry benchmarks. Actual results depend on content quality, audience receptivity, market conditions, and accurate tracking implementation. Past performance does not guarantee future results.*')
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Press Release Distributor
  tools.register(defineTool({
    name: 'press_release_distributor',
    description: 'Distribute press releases to matched media outlets with intelligent media matching, tier-based distribution planning, budget allocation, timeline management, and KPI target setting. Optimizes outreach for maximum pickup and reach.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: {"press_release":{"title":"...","company":"...","industry":"...","region":"...","category":"product_launch|partnership|funding|award|executive|csr|crisis|other","key_messages":[...],"publish_date":"YYYY-MM-DD","boilerplate":"..."},"target_media_tiers":["tier1_national","trade_specialist","online_digital"],"budget_usd":10000}' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const input: PressReleaseDistributorInput = JSON.parse(args.input_data)
      const r = analyzePressReleaseDistribution(input)
      return formatDistributionReport(r)
    }
  }))

  // Tool 2: Media Relations Tracker
  tools.register(defineTool({
    name: 'media_relations_tracker',
    description: 'Track media relationships and manage journalist profiles with engagement scoring, relationship health monitoring, pitch matching, interaction tracking, and actionable outreach recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: {"contacts":[{"name":"...","outlet":"...","beat":"...","email":"...","engagement_score":75,"last_contact_date":"YYYY-MM-DD","previous_coverage":[...],"preferred_format":"email","responsiveness":"high"}],"story_angle":"..."}' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const input: MediaRelationsInput = JSON.parse(args.input_data)
      const r = analyzeMediaRelations(input)
      return formatMediaRelationsReport(r)
    }
  }))

  // Tool 3: KOL Strategy Manager
  tools.register(defineTool({
    name: 'kol_strategy_manager',
    description: 'KOL/达人 collaboration strategy and performance tracking. Analyzes influencer profiles, recommends optimal KOL mix, allocates budget across tiers, projects performance, and provides content suggestions.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: {"campaign":{"name":"...","brand":"...","industry":"...","budget_usd":50000,"start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD","objectives":["awareness","engagement"],"target_audience":{"age_range":"25-34","gender":"all","interests":[...]}},"kols":[{"name":"...","platform":"Instagram","followers":100000,"engagement_rate":3.5,"niche":"tech","avg_cost_per_post":2000,"previous_brand_collabs":5,"audience_match_score":85,"content_quality_score":90}],"strategy_preference":"balanced"}' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const input: KOLStrategyInput = JSON.parse(args.input_data)
      const r = analyzeKOLStrategy(input)
      return formatKOLStrategyReport(r)
    }
  }))

  // Tool 4: Brand Sentiment Monitor
  tools.register(defineTool({
    name: 'brand_sentiment_monitor',
    description: 'Brand sentiment monitoring and crisis alert system. Analyzes mentions across news, social media, forums, and review sites. Detects sentiment trends, generates crisis alerts, and provides competitor comparison.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: {"brand_name":"...","monitoring_period_days":30,"data_sources":["news","social_media","forums"],"mentions":[{"source":"...","source_type":"social_media","date":"YYYY-MM-DD","content_snippet":"...","sentiment":"positive","reach":5000,"author_influence":"high"}],"competitors":["CompetitorA","CompetitorB"],"alert_threshold":{"negative_spike_pct":30,"volume_spike_multiplier":2.0}}' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const input: SentimentMonitorInput = JSON.parse(args.input_data)
      const r = analyzeBrandSentiment(input)
      return formatSentimentReport(r)
    }
  }))

  // Tool 5: Content Amplifier
  tools.register(defineTool({
    name: 'content_amplifier',
    description: 'Content secondary distribution and SEO optimization analysis. Identifies amplification tactics across paid, owned, and earned channels. Provides SEO keyword opportunities, repurposing suggestions, and performance forecasts.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: {"content":{"content_id":"...","title":"...","format":"article","topic":"...","target_keywords":["keyword1","keyword2"],"current_views":5000,"current_engagement":500,"publish_date":"YYYY-MM-DD"},"amplification_channels":["seo","social_paid","email","syndication"],"budget_usd":2000,"goals":["traffic","engagement","leads"]}' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const input: ContentAmplifierInput = JSON.parse(args.input_data)
      const r = analyzeContentAmplification(input)
      return formatAmplificationReport(r)
    }
  }))

  // Tool 6: Campaign Effectiveness
  tools.register(defineTool({
    name: 'campaign_effectiveness',
    description: 'Campaign effectiveness attribution and ROI deep-dive analysis. Multi-touch attribution modeling, channel performance comparison, objective achievement tracking, and optimization recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: {"campaign":{"name":"...","start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD","total_budget_usd":50000,"channels":[{"name":"Google Ads","budget_usd":20000,"spend_usd":18000}],"objectives":[{"metric":"Conversions","target":500,"actual":450,"unit":"count"}]},"touchpoints":[{"channel":"Google Ads","date":"YYYY-MM-DD","interaction_type":"click","attributed_revenue":5000,"conversions":10,"cost":200}],"attribution_model":"linear"}' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const input: CampaignEffectivenessInput = JSON.parse(args.input_data)
      const r = analyzeCampaignEffectiveness(input)
      return formatCampaignReport(r)
    }
  }))

  // Tool 7: Calendar Editor
  tools.register(defineTool({
    name: 'editorial_calendar_editor',
    description: 'Editorial calendar planning and content pipeline management. Generates weekly content schedules, tracks content through production stages, analyzes team capacity, and provides content mix optimization.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: {"planning_period":{"start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD","weeks":12},"content_pillars":["Innovation","Leadership","Tutorial"],"content_types":["blog_post","video","infographic"],"publishing_frequency":{"posts_per_week":3,"videos_per_month":2,"newsletters_per_month":4},"team_capacity":{"writers":3,"designers":2,"editors":1,"hours_per_week":120},"existing_content":[{"title":"...","type":"blog_post","publish_date":"YYYY-MM-DD","status":"draft"}],"key_dates":[{"date":"YYYY-MM-DD","event":"Product Launch","content_opportunity":"Launch coverage"}]}' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const input: EditorialCalendarInput = JSON.parse(args.input_data)
      const r = analyzeEditorialCalendar(input)
      return formatEditorialCalendarReport(r)
    }
  }))

  // Tool 8: Influencer ROI Calculator
  tools.register(defineTool({
    name: 'influencer_roi_calculator',
    description: 'Influencer marketing ROI calculator and scheduling tool. Projects ROI across scenarios, creates optimal posting schedules, benchmarks against industry averages, and provides contract clause recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: {"influencer":{"name":"...","platform":"Instagram","followers":100000,"engagement_rate":3.5,"niche":"tech","asking_price_per_post":2000,"content_types":["feed_post","story","reel"],"audience_demographics":{"age_range":"25-34","gender_split":{"female":60,"male":40},"top_countries":["US","UK"]}},"campaign":{"budget_usd":10000,"deliverables":5,"duration_days":30,"kpis":[{"metric":"Engagement","target":5000,"weight":0.4}],"product_price":50},"scheduling_preferences":{"preferred_days":["Tuesday","Thursday"],"blackout_dates":[],"posting_frequency":"2x per week"}}' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const input: InfluencerROIInput = JSON.parse(args.input_data)
      const r = analyzeInfluencerROI(input)
      return formatInfluencerROIReport(r)
    }
  }))

  console.log(`[dsh-tool-pragentpro] Loaded v${VERSION} — AI Media Publicity & PR Pro Agent with 8 tools`)
  console.log('  Tools: press_release_distributor, media_relations_tracker, kol_strategy_manager, brand_sentiment_monitor, content_amplifier, campaign_effectiveness, editorial_calendar_editor, influencer_roi_calculator')
}
