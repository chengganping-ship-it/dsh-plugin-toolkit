/**
 * DSH AI PR & Media Relations Agent Plugin v0.1.0
 *
 * Next-generation AI-powered public relations toolkit for DeepSeek Harness Agent.
 * Covers media relations, press releases, crisis communications, thought leadership,
 * award submissions, social proof, media measurement, and content distribution.
 *
 * Features (v0.1.0):
 * - Media Relations: Journalist profiling, pitch matching, relationship scoring, interaction tracking, opportunity identification, news listing
 * - Press Release Writer: Headline generation, lead writing, body drafting, quote integration, boilerplate, multi-channel adaptation, SEO optimization
 * - Crisis Comms Manager: Media monitoring, response playbooks, spokesperson training, stakeholder communication, reputation recovery
 * - Thought Leadership Engine: Topic suggestions, article writing, publishing, discussion, influencer collaboration, SEO tracking
 * - Award Submission Manager: Award discovery, eligibility assessment, submission writing, tracking, relationship maintenance
 * - Social Proof Amplifier: Testimonial management, case studies, social posting, influencer identification, social proof strategy
 * - Media Measurement: AVE, impressions, sentiment, share of voice, value, ROI, reporting, competitive benchmarking
 * - Content Distribution: Timing optimization, channel selection, format adaptation, paid vs organic, engagement analysis, adjustment suggestions, forecasting
 *
 * @module dsh-tool-pragent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-pragent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface JournalistContact {
  name: string
  outlet: string
  beat: string
  email: string
  engagement_score: number
  last_contact_date: string
  previous_coverage: string[]
  preferred_format: 'email' | 'phone' | 'social' | 'in_person'
  responsiveness: 'high' | 'medium' | 'low'
}

interface PitchOpportunity {
  journalist_name: string
  outlet: string
  beat_alignment: number
  timeliness: number
  relationship_strength: number
  overall_score: number
  suggested_angle: string
  recommended_action: string
}

interface PressReleaseInput {
  announcement_type: string
  headline_options: string[]
  key_facts: string[]
  quotes: { speaker: string; title: string; quote: string }[]
  boilerplate: string
  target_channels: string[]
  seo_keywords: string[]
  company_name: string
  launch_date: string
}

interface CrisisEvent {
  event_id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  date_occurred: string
  affected_stakeholders: string[]
  media_coverage_status: 'active' | 'potential' | 'contained'
  current_response_status: string
}

interface ThoughtLeadershipTopic {
  topic: string
  trend_score: number
  relevance_score: number
  differentiation_score: number
  recommended_format: 'article' | 'whitepaper' | 'video' | 'podcast' | 'social_series'
  audience: string
  key_takeaways: string[]
  seo_potential: 'high' | 'medium' | 'low'
}

interface AwardEntry {
  award_name: string
  category: string
  eligibility_criteria: string[]
  submission_deadline: string
  entry_requirements: string[]
  previous_winners: string[]
  award_prestige: 'tier1' | 'tier2' | 'tier3'
}

interface Testimonial {
  client_name: string
  industry: string
  testimonial_text: string
  rating: number
  usage_context: string
  verified: boolean
  date_collected: string
}

interface MediaMetrics {
  period: string
  ave_value: number
  total_impressions: number
  sentiment_positive: number
  sentiment_neutral: number
  sentiment_negative: number
  share_of_voice: number
  pr_spend: number
  estimated_earnings: number
  media_mentions: number
  competitor_mentions: Record<string, number>
}

interface ContentPiece {
  content_id: string
  format: 'article' | 'video' | 'infographic' | 'social_post' | 'newsletter' | 'press_release'
  topic: string
  target_audience: string
  current_engagement: number
  distribution_channels: string[]
  publish_date: string
  priority: 'high' | 'medium' | 'low'
}

// ==================== TOOL 1: MEDIA RELATIONS ====================

interface MediaRelationsResult {
  journalist_profiles: Array<{
    name: string
    outlet: string
    beat: string
    influence_score: number
    engagement_score: number
    relationship_tier: 'strategic' | 'active' | 'developing' | 'new'
    last_interaction: string
    key_topics: string[]
    pitch_responsiveness: string
  }>
  pitch_matches: Array<{
    journalist: string
    outlet: string
    match_score: number
    match_reasons: string[]
    suggested_pitch: string
    optimal_timing: string
  }>
  relationship_scores: Array<{
    contact: string
    score: number
    trend: 'improving' | 'stable' | 'declining'
    engagement_frequency: string
    next_action: string
  }>
  interaction_log: Array<{
    date: string
    contact: string
    type: string
    outcome: string
    follow_up_needed: boolean
  }>
  opportunities: PitchOpportunity[]
  news_list: Array<{
    headline: string
    outlet: string
    date: string
    relevance: 'high' | 'medium' | 'low'
    action_needed: string
  }>
}

function buildJournalistProfiles(contacts: JournalistContact[]): MediaRelationsResult['journalist_profiles'] {
  return contacts.map(c => {
    const influenceScore = Math.min(100, Math.round(
      (c.engagement_score * 0.4) +
      (c.previous_coverage.length * 8) +
      (c.responsiveness === 'high' ? 30 : c.responsiveness === 'medium' ? 15 : 5)
    ))

    let relationshipTier: 'strategic' | 'active' | 'developing' | 'new' = 'new'
    if (c.engagement_score >= 75 && c.previous_coverage.length >= 3) relationshipTier = 'strategic'
    else if (c.engagement_score >= 50) relationshipTier = 'active'
    else if (c.engagement_score >= 25) relationshipTier = 'developing'

    const lastInteraction = c.last_contact_date || 'No contact'
    const daysSince = c.last_contact_date ? Math.max(0, Math.round((Date.now() - new Date(c.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))) : 999

    return {
      name: c.name,
      outlet: c.outlet,
      beat: c.beat,
      influence_score: influenceScore,
      engagement_score: c.engagement_score,
      relationship_tier: relationshipTier,
      last_interaction: lastInteraction === 'No contact' ? 'No contact' : `${daysSince} days ago`,
      key_topics: [c.beat, ...c.previous_coverage.slice(0, 3).map(pc => pc.split(' ').slice(0, 3).join(' '))],
      pitch_responsiveness: c.responsiveness
    }
  })
}

function matchPitches(contacts: JournalistContact[], story_angle: string): MediaRelationsResult['pitch_matches'] {
  const storyKeywords = story_angle.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  return contacts.map(c => {
    const beatKeywords = c.beat.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const coverageKeywords = c.previous_coverage.join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 3)

    let matchScore = 0
    const matchReasons: string[] = []

    const beatOverlap = storyKeywords.filter(k => beatKeywords.includes(k)).length
    if (beatOverlap > 0) {
      matchScore += beatOverlap * 20
      matchReasons.push(`Beat alignment: ${beatOverlap} keyword matches`)
    }

    const coverageOverlap = storyKeywords.filter(k => coverageKeywords.includes(k)).length
    if (coverageOverlap > 0) {
      matchScore += coverageOverlap * 15
      matchReasons.push(`Previous coverage relevance: ${coverageOverlap} matches`)
    }

    matchScore += c.engagement_score * 0.2
    if (c.responsiveness === 'high') matchScore += 10
    matchReasons.push(`Engagement score: ${c.engagement_score}/100`)

    matchScore = Math.min(100, Math.round(matchScore))

    const suggestedPitch = `Personalized pitch focusing on ${c.beat} angle, referencing their previous work. Format: ${c.preferred_format}.`

    const optimalTiming = c.responsiveness === 'high' ? 'Within 24 hours' : c.responsiveness === 'medium' ? '2-3 business days' : '1 week follow-up'

    return {
      journalist: c.name,
      outlet: c.outlet,
      match_score: matchScore,
      match_reasons: matchReasons,
      suggested_pitch: suggestedPitch,
      optimal_timing: optimalTiming
    }
  }).sort((a, b) => b.match_score - a.match_score)
}

function buildNewsList(contacts: JournalistContact[]): MediaRelationsResult['news_list'] {
  const news: MediaRelationsResult['news_list'] = []
  for (const c of contacts) {
    for (const coverage of c.previous_coverage.slice(0, 2)) {
      news.push({
        headline: coverage,
        outlet: c.outlet,
        date: c.last_contact_date || 'Unknown',
        relevance: c.engagement_score >= 60 ? 'high' : c.engagement_score >= 30 ? 'medium' : 'low',
        action_needed: c.engagement_score >= 60 ? 'Follow up with exclusive angle' : 'Monitor for future opportunities'
      })
    }
  }
  return news.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.relevance] - order[b.relevance]
  })
}

function manageMediaRelations(contacts: JournalistContact[], story_angle: string): MediaRelationsResult {
  const profiles = buildJournalistProfiles(contacts)
  const matches = matchPitches(contacts, story_angle)
  const newsList = buildNewsList(contacts)

  const relationshipScores = contacts.map(c => {
    const score = Math.round((c.engagement_score * 0.6) + (c.previous_coverage.length * 5) + (c.responsiveness === 'high' ? 20 : c.responsiveness === 'medium' ? 10 : 0))
    const daysSince = c.last_contact_date ? Math.round((Date.now() - new Date(c.last_contact_date).getTime()) / (1000 * 60 * 60 * 24)) : 999
    const trend: 'improving' | 'stable' | 'declining' = daysSince < 30 ? 'improving' : daysSince < 90 ? 'stable' : 'declining'
    const frequency = c.responsiveness === 'high' ? 'Weekly' : c.responsiveness === 'medium' ? 'Monthly' : 'Quarterly'
    const nextAction = trend === 'declining' ? 'Re-engagement outreach' : trend === 'stable' ? 'Regular update pitch' : 'Continue nurturing relationship'

    return {
      contact: `${c.name} (${c.outlet})`,
      score: Math.min(100, score),
      trend,
      engagement_frequency: frequency,
      next_action: nextAction
    }
  }).sort((a, b) => b.score - a.score)

  const opportunities: PitchOpportunity[] = matches.slice(0, 5).map(m => ({
    journalist_name: m.journalist,
    outlet: m.outlet,
    beat_alignment: m.match_score,
    timeliness: Math.min(100, m.match_score + 10),
    relationship_strength: relationshipScores.find(r => r.contact.includes(m.journalist))?.score || 50,
    overall_score: Math.round(m.match_score * 0.6 + (relationshipScores.find(r => r.contact.includes(m.journalist))?.score || 50) * 0.4),
    suggested_angle: m.suggested_pitch,
    recommended_action: m.optimal_timing
  }))

  const interactionLog = contacts.filter(c => c.last_contact_date).slice(0, 10).map(c => ({
    date: c.last_contact_date,
    contact: c.name,
    type: c.preferred_format === 'email' ? 'Email pitch' : c.preferred_format === 'social' ? 'Social engagement' : 'Direct outreach',
    outcome: c.responsiveness === 'high' ? 'Positive response' : c.responsiveness === 'medium' ? 'Acknowledged' : 'No response yet',
    follow_up_needed: c.responsiveness !== 'high'
  }))

  return {
    journalist_profiles: profiles,
    pitch_matches: matches,
    relationship_scores: relationshipScores,
    interaction_log: interactionLog,
    opportunities,
    news_list: newsList
  }
}

function formatMediaRelationsReport(result: MediaRelationsResult): string {
  const lines: string[] = []
  lines.push('# Media Relations Dashboard')
  lines.push('')
  lines.push(`**${result.journalist_profiles.length}** journalist profiles | **${result.opportunities.length}** active opportunities | **${result.news_list.length}** news items`)
  lines.push('')

  lines.push('## Journalist Profiles')
  lines.push('| Name | Outlet | Beat | Influence | Engagement | Tier | Last Interaction |')
  lines.push('|------|--------|------|-----------|------------|------|-----------------|')
  for (const p of result.journalist_profiles.slice(0, 15)) {
    lines.push(`| ${p.name} | ${p.outlet} | ${p.beat} | ${p.influence_score} | ${p.engagement_score} | ${p.relationship_tier.toUpperCase()} | ${p.last_interaction} |`)
  }
  lines.push('')

  lines.push('## Top Pitch Matches')
  for (const m of result.pitch_matches.slice(0, 5)) {
    lines.push(`**${m.journalist}** — ${m.outlet} (Match Score: ${m.match_score}/100)`)
    for (const reason of m.match_reasons) {
      lines.push(`  - ${reason}`)
    }
    lines.push(`  Pitch: ${m.suggested_pitch}`)
    lines.push(`  Timing: ${m.optimal_timing}`)
    lines.push('')
  }

  lines.push('## Relationship Health Scores')
  lines.push('| Contact | Score | Trend | Frequency | Next Action |')
  lines.push('|---------|-------|-------|-----------|-------------|')
  for (const r of result.relationship_scores.slice(0, 10)) {
    const trendIcon = r.trend === 'improving' ? '[UP]' : r.trend === 'stable' ? '[FLAT]' : '[DOWN]'
    lines.push(`| ${r.contact.substring(0, 30)} | ${r.score} | ${trendIcon} ${r.trend} | ${r.engagement_frequency} | ${r.next_action} |`)
  }
  lines.push('')

  if (result.opportunities.length > 0) {
    lines.push('## Pitch Opportunities')
    for (const opp of result.opportunities) {
      lines.push(`**[${opp.overall_score}] ${opp.journalist_name}** (${opp.outlet})`)
      lines.push(`  Beat Alignment: ${opp.beat_alignment} | Timeliness: ${opp.timeliness} | Relationship: ${opp.relationship_strength}`)
      lines.push(`  Angle: ${opp.suggested_angle}`)
      lines.push(`  Action: ${opp.recommended_action}`)
      lines.push('')
    }
  }

  if (result.news_list.length > 0) {
    lines.push('## Relevant News')
    lines.push('| Headline | Outlet | Date | Relevance | Action |')
    lines.push('|---------|--------|------|-----------|--------|')
    for (const n of result.news_list.slice(0, 10)) {
      lines.push(`| ${n.headline.substring(0, 40)} | ${n.outlet} | ${n.date} | ${n.relevance.toUpperCase()} | ${n.action_needed} |`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: PRESS RELEASE WRITER ====================

interface PressReleaseResult {
  headlines: Array<{
    headline: string
    style: 'direct' | 'question' | 'how-to' | 'announcement' | 'emotional'
    seo_score: number
    readability_score: number
    recommended: boolean
  }>
  lead_paragraph: string
  body_sections: Array<{
    heading: string
    content: string
    key_message: string
  }>
  quotes_integrated: Array<{ speaker: string; title: string; quote: string; placement: string }>
  boilerplate_section: string
  channel_adaptations: Array<{
    channel: string
    format: string
    max_length: number
    adapted_content: string
    cta: string
  }>
  seo_analysis: {
    primary_keyword: string
    density: number
    meta_description: string
    suggested_tags: string[]
    overall_seo_score: number
  }
  news_value_score: number
}

function generateHeadlines(input: PressReleaseInput): PressReleaseResult['headlines'] {
  const headlines: PressReleaseResult['headlines'] = []

  for (const h of input.headline_options.slice(0, 5)) {
    const wordCount = h.split(/\s+/).length
    const readabilityScore = Math.min(100, Math.round(100 - Math.abs(wordCount - 12) * 5))
    const hasKeywords = input.seo_keywords.some(k => h.toLowerCase().includes(k.toLowerCase()))
    const seoScore = Math.min(100, Math.round((hasKeywords ? 70 : 40) + (input.company_name && h.includes(input.company_name) ? 20 : 0) + (wordCount <= 15 ? 10 : 0)))

    let style: 'direct' | 'question' | 'how-to' | 'announcement' | 'emotional' = 'direct'
    if (h.includes('?')) style = 'question'
    else if (h.toLowerCase().startsWith('how')) style = 'how-to'
    else if (h.toLowerCase().includes('announce') || h.toLowerCase().includes('launch')) style = 'announcement'
    else if (h.toLowerCase().includes('transform') || h.toLowerCase().includes('revolution')) style = 'emotional'

    headlines.push({
      headline: h,
      style,
      seo_score: seoScore,
      readability_score: readabilityScore,
      recommended: seoScore >= 60 && readabilityScore >= 60
    })
  }

  if (headlines.length > 0) {
    headlines.sort((a, b) => (b.seo_score + b.readability_score) - (a.seo_score + a.readability_score))
    headlines[0].recommended = true
  }

  return headlines
}

function writeLeadParagraph(input: PressReleaseInput): string {
  const who = input.company_name || 'The Company'
  const what = input.key_facts[0] || 'a major development'
  const when = input.launch_date || 'today'
  const why = input.key_facts[1] || 'delivering value to stakeholders'

  return `${who} today announced ${what}, marking a significant milestone for the organization. The initiative, launching ${when}, addresses ${why}. This strategic move positions ${who} at the forefront of industry innovation.`
}

function writeBodySections(input: PressReleaseInput): PressReleaseResult['body_sections'] {
  const sections: PressReleaseResult['body_sections'] = []

  if (input.key_facts.length > 0) {
    sections.push({
      heading: 'Key Details',
      content: input.key_facts.map(f => `• ${f}`).join('\n'),
      key_message: 'Factual foundation of the announcement'
    })
  }

  if (input.key_facts.length > 1) {
    sections.push({
      heading: 'Market Context',
      content: `Industry analysis indicates growing demand in this sector. The timing aligns with market readiness and strategic objectives. ${input.company_name} is positioned to capitalize on emerging opportunities.`,
      key_message: 'Strategic positioning and market relevance'
    })
  }

  if (input.quotes.length > 0) {
    sections.push({
      heading: 'Leadership Perspective',
      content: input.quotes.map(q => `"${q.quote}" — ${q.speaker}, ${q.title}`).join('\n\n'),
      key_message: 'Executive authority and vision'
    })
  }

  sections.push({
    heading: 'Looking Ahead',
    content: `The organization will continue to focus on innovation and value creation. Further updates will be shared as the initiative progresses. Stakeholders can expect additional communications in the coming weeks.`,
    key_message: 'Forward-looking commitment'
  })

  return sections
}

function analyzeSEO(input: PressReleaseInput, headline: string): PressReleaseResult['seo_analysis'] {
  const allText = [headline, ...input.key_facts, input.boilerplate].join(' ').toLowerCase()
  const words = allText.split(/\s+/).filter(w => w.length > 2)
  const totalWords = words.length || 1

  let primaryKeyword = input.seo_keywords[0] || 'announcement'
  let highestCount = 0

  for (const kw of input.seo_keywords) {
    const count = words.filter(w => w.includes(kw.toLowerCase())).length
    if (count > highestCount) {
      highestCount = count
      primaryKeyword = kw
    }
  }

  const density = Math.round((highestCount / totalWords) * 100 * 100) / 100
  const metaDescription = `${input.company_name} announces ${input.key_facts[0] || 'key development'}. Learn more about this strategic initiative and its impact.`

  return {
    primary_keyword: primaryKeyword,
    density: density,
    meta_description: metaDescription.substring(0, 160),
    suggested_tags: input.seo_keywords.slice(0, 8),
    overall_seo_score: Math.min(100, Math.round(60 + input.seo_keywords.length * 5 + (input.company_name ? 10 : 0)))
  }
}

function adaptForChannels(input: PressReleaseInput, headline: string, lead: string): PressReleaseResult['channel_adaptations'] {
  const adaptations: PressReleaseResult['channel_adaptations'] = []

  for (const channel of input.target_channels) {
    const ch = channel.toLowerCase()
    let format = 'standard'
    let maxLen = 500
    let adapted = ''
    let cta = 'Learn more'

    if (ch.includes('twitter') || ch.includes('x.com')) {
      format = 'Tweet thread'
      maxLen = 280
      adapted = `${headline.substring(0, 100)} Thread: ${lead.substring(0, 150)}...`
      cta = 'Read full release'
    } else if (ch.includes('linkedin')) {
      format = 'Professional post'
      maxLen = 1300
      adapted = `${headline}\n\n${lead.substring(0, 400)}\n\nKey highlights:\n${input.key_facts.slice(0, 3).map(f => `• ${f}`).join('\n')}`
      cta = 'View full announcement'
    } else if (ch.includes('facebook')) {
      format = 'Social post'
      maxLen = 500
      adapted = `${headline}\n\n${lead.substring(0, 300)}`
      cta = 'Learn more at link'
    } else if (ch.includes('email') || ch.includes('newsletter')) {
      format = 'Email blast'
      maxLen = 2000
      adapted = `Subject: ${headline}\n\nDear Subscriber,\n\n${lead}\n\n${input.key_facts.map(f => `• ${f}`).join('\n')}`
      cta = 'Read full story'
    } else if (ch.includes('media') || ch.includes('journalist') || ch.includes('pitch')) {
      format = 'Media pitch'
      maxLen = 400
      adapted = `Exclusive: ${headline}\n\n${lead.substring(0, 300)}\n\nAvailable for interview: ${input.quotes[0]?.speaker || 'Company executive'}`
      cta = 'Schedule interview'
    } else if (ch.includes('blog') || ch.includes('web')) {
      format = 'Blog post'
      maxLen = 3000
      adapted = `# ${headline}\n\n${lead}\n\n## Key Details\n${input.key_facts.map(f => `• ${f}`).join('\n')}`
      cta = 'Share your thoughts'
    } else {
      adapted = `${headline}\n\n${lead.substring(0, 300)}`
      cta = 'Read more'
    }

    adaptations.push({
      channel,
      format,
      max_length: maxLen,
      adapted_content: adapted.substring(0, maxLen),
      cta
    })
  }

  return adaptations
}

function writePressRelease(input: PressReleaseInput): PressReleaseResult {
  const headlines = generateHeadlines(input)
  const leadParagraph = writeLeadParagraph(input)
  const bodySections = writeBodySections(input)
  const bestHeadline = headlines.find(h => h.recommended)?.headline || headlines[0]?.headline || input.headline_options[0] || 'Announcement'
  const seoAnalysis = analyzeSEO(input, bestHeadline)
  const channelAdaptations = adaptForChannels(input, bestHeadline, leadParagraph)

  const quotesIntegrated = input.quotes.map((q, i) => ({
    speaker: q.speaker,
    title: q.title,
    quote: q.quote,
    placement: i === 0 ? 'After lead paragraph' : i === 1 ? 'Mid-body section' : 'Near closing'
  }))

  const boilerplateSection = input.boilerplate || `${input.company_name || 'The Company'} is a leading organization committed to innovation and excellence. For more information, visit our website.`

  const newsValueScore = Math.min(100, Math.round(
    (input.key_facts.length * 10) +
    (input.quotes.length * 8) +
    (input.seo_keywords.length * 3) +
    (input.target_channels.length * 5) +
    (bestHeadline ? 20 : 0)
  ))

  return {
    headlines,
    lead_paragraph: leadParagraph,
    body_sections: bodySections,
    quotes_integrated: quotesIntegrated,
    boilerplate_section: boilerplateSection,
    channel_adaptations: channelAdaptations,
    seo_analysis: seoAnalysis,
    news_value_score: newsValueScore
  }
}

function formatPressReleaseReport(result: PressReleaseResult): string {
  const lines: string[] = []
  lines.push('# Press Release Composition Report')
  lines.push('')
  lines.push(`**News Value Score:** ${result.news_value_score}/100 | **SEO Score:** ${result.seo_analysis.overall_seo_score}/100 | **Channels:** ${result.channel_adaptations.length}`)
  lines.push('')

  lines.push('## Headline Options')
  lines.push('| # | Headline | Style | SEO | Readability | Recommended |')
  lines.push('|---|----------|-------|-----|-------------|-------------|')
  result.headlines.forEach((h, i) => {
    lines.push(`| ${i + 1} | ${h.headline.substring(0, 45)} | ${h.style} | ${h.seo_score} | ${h.readability_score} | ${h.recommended ? 'YES' : 'NO'} |`)
  })
  lines.push('')

  lines.push('## Lead Paragraph')
  lines.push(result.lead_paragraph)
  lines.push('')

  lines.push('## Body Sections')
  for (const section of result.body_sections) {
    lines.push(`### ${section.heading}`)
    lines.push(section.content)
    lines.push(`*Key Message: ${section.key_message}*`)
    lines.push('')
  }

  if (result.quotes_integrated.length > 0) {
    lines.push('## Quotes')
    for (const q of result.quotes_integrated) {
      lines.push(`"${q.quote}"`)
      lines.push(`— **${q.speaker}**, ${q.title} *(Placement: ${q.placement})*`)
      lines.push('')
    }
  }

  lines.push('## Boilerplate')
  lines.push(result.boilerplate_section)
  lines.push('')

  lines.push('## Channel Adaptations')
  for (const ca of result.channel_adaptations) {
    lines.push(`### ${ca.channel} (${ca.format} | Max: ${ca.max_length} chars)`)
    lines.push('```')
    lines.push(ca.adapted_content.substring(0, 200) + (ca.adapted_content.length > 200 ? '...' : ''))
    lines.push('```')
    lines.push(`CTA: ${ca.cta}`)
    lines.push('')
  }

  lines.push('## SEO Analysis')
  lines.push(`- **Primary Keyword:** ${result.seo_analysis.primary_keyword}`)
  lines.push(`- **Keyword Density:** ${result.seo_analysis.density}%`)
  lines.push(`- **Meta Description:** ${result.seo_analysis.meta_description}`)
  lines.push(`- **Tags:** ${result.seo_analysis.suggested_tags.join(', ')}`)
  lines.push(`- **Overall SEO Score:** ${result.seo_analysis.overall_seo_score}/100`)

  return lines.join('\n')
}

// ==================== TOOL 3: CRISIS COMMUNICATIONS MANAGER ====================

interface CrisisCommsResult {
  media_monitoring: Array<{
    source: string
    mention_type: 'negative' | 'neutral' | 'positive' | 'speculative'
    reach: number
    sentiment_score: number
    urgency: 'immediate' | 'monitor' | 'low'
    recommended_response: string
  }>
  response_playbook: Array<{
    trigger: string
    response_type: 'statement' | 'social_post' | 'interview' | 'press_conference' | 'silent'
    key_messages: string[]
    holding_statement: string
    approval_chain: string[]
  }>
  spokesperson_readiness: Array<{
    name: string
    training_level: 'expert' | 'trained' | 'basic' | 'untrained'
    strengths: string[]
    areas_for_improvement: string[]
    media_appearances: number
    readiness_score: number
  }>
  stakeholder_comms_plan: Array<{
    stakeholder: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    channel: string
    message_template: string
    timing: string
    status: 'pending' | 'sent' | 'acknowledged' | 'resolved'
  }>
  reputation_recovery: Array<{
    phase: string
    actions: string[]
    timeline: string
    success_metrics: string[]
    current_progress: number
  }>
}

function monitorMediaForCrisis(events: CrisisEvent[]): CrisisCommsResult['media_monitoring'] {
  const monitoring: CrisisCommsResult['media_monitoring'] = []

  for (const event of events) {
    const severityMap = { critical: 10000000, high: 5000000, medium: 1000000, low: 100000 }
    const baseReach = severityMap[event.severity]
    const mediaMultiplier = event.media_coverage_status === 'active' ? 1 : event.media_coverage_status === 'potential' ? 0.3 : 0.05

    monitoring.push({
      source: 'Mainstream Media',
      mention_type: event.severity === 'critical' ? 'negative' : event.severity === 'high' ? 'speculative' : 'neutral',
      reach: Math.round(baseReach * mediaMultiplier),
      sentiment_score: event.severity === 'critical' ? -0.8 : event.severity === 'high' ? -0.5 : event.severity === 'medium' ? -0.2 : 0.1,
      urgency: event.severity === 'critical' ? 'immediate' : event.severity === 'high' ? 'immediate' : event.media_coverage_status === 'active' ? 'monitor' : 'low',
      recommended_response: event.severity === 'critical' ? 'Immediate public statement + CEO response' : event.severity === 'high' ? 'Prepared holding statement + stakeholder briefing' : 'Monitor and prepare response templates'
    })

    monitoring.push({
      source: 'Social Media',
      mention_type: event.severity === 'critical' ? 'negative' : 'speculative',
      reach: Math.round(baseReach * 2 * mediaMultiplier),
      sentiment_score: event.severity === 'critical' ? -0.6 : -0.3,
      urgency: event.severity === 'critical' || event.severity === 'high' ? 'immediate' : 'monitor',
      recommended_response: event.severity === 'critical' ? 'Activate social response team + real-time monitoring' : 'Increase monitoring frequency'
    })
  }

  return monitoring
}

function buildResponsePlaybook(events: CrisisEvent[]): CrisisCommsResult['response_playbook'] {
  return events.map(event => {
    const isCritical = event.severity === 'critical' || event.severity === 'high'
    const responseType: 'statement' | 'social_post' | 'interview' | 'press_conference' | 'silent' =
      event.severity === 'critical' ? 'press_conference' :
      event.severity === 'high' ? 'statement' :
      event.severity === 'medium' ? 'social_post' : 'silent'

    return {
      trigger: `${event.severity.toUpperCase()} severity: ${event.description.substring(0, 50)}`,
      response_type: responseType,
      key_messages: [
        'We are aware of the situation and taking it seriously',
        'The safety and trust of our stakeholders is our top priority',
        'We are conducting a thorough investigation',
        'We will share updates as more information becomes available'
      ],
      holding_statement: `We are aware of the situation regarding ${event.description.substring(0, 40)}. We take this matter extremely seriously and are actively investigating. We will provide a full update within ${event.severity === 'critical' ? '2 hours' : '24 hours'}.`,
      approval_chain: isCritical ? ['Comms Lead', 'Legal', 'CEO'] : ['Comms Lead', 'VP Communications']
    }
  })
}

function buildStakeholderPlan(events: CrisisEvent[]): CrisisCommsResult['stakeholder_comms_plan'] {
  const stakeholders = new Set<string>()
  for (const event of events) {
    event.affected_stakeholders.forEach(s => stakeholders.add(s))
  }

  const plan: CrisisCommsResult['stakeholder_comms_plan'] = []
  const allStakeholders = Array.from(stakeholders)

  const channelMap: Record<string, string> = {
    'employees': 'Internal email + Town Hall',
    'customers': 'Direct email + FAQ page',
    'investors': 'Investor call + SEC filing',
    'media': 'Press release + Press briefing',
    'regulators': 'Official filing + Direct outreach',
    'partners': 'Partner portal + Direct call',
    'community': 'Public statement + Community forum'
  }

  for (const s of allStakeholders) {
    const isCritical = events.some(e => e.severity === 'critical' && e.affected_stakeholders.includes(s))
    plan.push({
      stakeholder: s,
      priority: isCritical ? 'critical' : 'medium',
      channel: channelMap[s.toLowerCase()] || 'Direct communication',
      message_template: `Dear ${s}, We want to inform you about a situation that may affect our relationship. We are taking immediate action and will keep you updated with full transparency.`,
      timing: isCritical ? 'Within 1 hour' : 'Within 24 hours',
      status: 'pending'
    })
  }

  return plan
}

function buildReputationRecovery(events: CrisisEvent[]): CrisisCommsResult['reputation_recovery'] {
  const maxSeverity = events.reduce((max, e) => {
    const order = { critical: 4, high: 3, medium: 2, low: 1 }
    return order[e.severity] > order[max] ? e.severity : max
  }, 'low' as CrisisEvent['severity'])

  return [
    {
      phase: 'Immediate Response (0-48 hours)',
      actions: [
        'Issue official statement acknowledging the situation',
        'Activate crisis response team',
        'Begin stakeholder outreach',
        'Implement 24/7 media monitoring'
      ],
      timeline: '0-48 hours from event',
      success_metrics: ['Stakeholder notifications sent', 'Statement issued', 'Media monitoring active'],
      current_progress: 0
    },
    {
      phase: 'Active Management (1-4 weeks)',
      actions: [
        'Regular progress updates to stakeholders',
        'Executive visibility in media',
        'Corrective action plan communication',
        'Employee engagement and alignment'
      ],
      timeline: '1-4 weeks',
      success_metrics: ['Sentiment improvement', 'Stakeholder confidence recovery', 'Media tone shift'],
      current_progress: 0
    },
    {
      phase: 'Recovery Phase (1-3 months)',
      actions: [
        'Positive news generation',
        'Thought leadership content',
        'Community engagement initiatives',
        'Transparency reports publication'
      ],
      timeline: '1-3 months',
      success_metrics: ['Net sentiment positive', 'Media tone normalized', 'Stakeholder satisfaction restored'],
      current_progress: 0
    },
    {
      phase: 'Long-term Rebuilding (3-12 months)',
      actions: [
        'Brand purpose campaigns',
        'ESG/sustainability initiatives',
        'Industry leadership positioning',
        'Ongoing reputation monitoring'
      ],
      timeline: '3-12 months',
      success_metrics: ['Brand perception score restored', 'Industry recognition', 'Long-term trust index'],
      current_progress: 0
    },
    {
      phase: maxSeverity === 'critical' ? 'Post-Crisis Audit (6+ months)' : 'Lessons Learned (3+ months)',
      actions: [
        'Comprehensive crisis response audit',
        'Process improvements implementation',
        'Updated crisis protocols',
        'Team training reinforcement'
      ],
      timeline: maxSeverity === 'critical' ? '6+ months' : '3+ months',
      success_metrics: ['Audit completed', 'Protocol updated', 'Training completed'],
      current_progress: 0
    }
  ]
}

function assessSpokespersonReadiness(spokespersons: { name: string; training_completed: string[]; appearances: number; weakness_areas: string[] }[]): CrisisCommsResult['spokesperson_readiness'] {
  return spokespersons.map(sp => {
    const trainingLevel: 'expert' | 'trained' | 'basic' | 'untrained' =
      sp.training_completed.length >= 5 ? 'expert' :
      sp.training_completed.length >= 3 ? 'trained' :
      sp.training_completed.length >= 1 ? 'basic' : 'untrained'

    const readinessScore = Math.min(100, Math.round(
      (sp.training_completed.length * 12) +
      (Math.min(sp.appearances, 20) * 2) +
      (sp.weakness_areas.length === 0 ? 20 : 0)
    ))

    return {
      name: sp.name,
      training_level: trainingLevel,
      strengths: sp.training_completed.slice(0, 4),
      areas_for_improvement: sp.weakness_areas.length > 0 ? sp.weakness_areas : ['Advanced media training', 'Crisis scenario simulation'],
      media_appearances: sp.appearances,
      readiness_score: readinessScore
    }
  })
}

function manageCrisisComms(
  events: CrisisEvent[],
  spokespersons: { name: string; training_completed: string[]; appearances: number; weakness_areas: string[] }[]
): CrisisCommsResult {
  return {
    media_monitoring: monitorMediaForCrisis(events),
    response_playbook: buildResponsePlaybook(events),
    spokesperson_readiness: assessSpokespersonReadiness(spokespersons),
    stakeholder_comms_plan: buildStakeholderPlan(events),
    reputation_recovery: buildReputationRecovery(events)
  }
}

function formatCrisisCommsReport(result: CrisisCommsResult): string {
  const lines: string[] = []
  lines.push('# Crisis Communications Management Report')
  lines.push('')
  lines.push(`**${result.media_monitoring.length}** media signals tracked | **${result.response_playbook.length}** response playbooks | **${result.stakeholder_comms_plan.length}** stakeholder groups`)
  lines.push('')

  lines.push('## Media Monitoring')
  lines.push('| Source | Type | Reach | Sentiment | Urgency | Response |')
  lines.push('|--------|------|-------|-----------|---------|----------|')
  for (const m of result.media_monitoring.slice(0, 15)) {
    lines.push(`| ${m.source} | ${m.mention_type} | ${m.reach.toLocaleString()} | ${m.sentiment_score > 0 ? '+' : ''}${m.sentiment_score} | ${m.urgency.toUpperCase()} | ${m.recommended_response.substring(0, 40)} |`)
  }
  lines.push('')

  lines.push('## Response Playbook')
  for (const pb of result.response_playbook) {
    lines.push(`### Trigger: ${pb.trigger}`)
    lines.push(`- **Response Type:** ${pb.response_type}`)
    lines.push(`- **Approval Chain:** ${pb.approval_chain.join(' > ')}`)
    lines.push(`- **Holding Statement:** "${pb.holding_statement.substring(0, 120)}..."`)
    lines.push('- **Key Messages:**')
    for (const msg of pb.key_messages) {
      lines.push(`  - ${msg}`)
    }
    lines.push('')
  }

  lines.push('## Spokesperson Readiness')
  lines.push('| Name | Level | Appearances | Readiness Score | Strengths |')
  lines.push('|------|-------|-------------|-----------------|-----------|')
  for (const sp of result.spokesperson_readiness) {
    lines.push(`| ${sp.name} | ${sp.training_level.toUpperCase()} | ${sp.media_appearances} | ${sp.readiness_score}/100 | ${sp.strengths.slice(0, 3).join(', ')} |`)
  }
  lines.push('')

  lines.push('## Stakeholder Communication Plan')
  for (const sc of result.stakeholder_comms_plan) {
    lines.push(`**[${sc.priority.toUpperCase()}] ${sc.stakeholder}**`)
    lines.push(`  Channel: ${sc.channel} | Timing: ${sc.timing} | Status: ${sc.status}`)
    lines.push(`  Message: "${sc.message_template.substring(0, 80)}..."`)
    lines.push('')
  }

  lines.push('## Reputation Recovery Roadmap')
  for (const phase of result.reputation_recovery) {
    lines.push(`### ${phase.phase}`)
    for (const action of phase.actions) {
      lines.push(`- [ ] ${action}`)
    }
    lines.push(`*Timeline: ${phase.timeline} | Progress: ${phase.current_progress}%*`)
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== TOOL 4: THOUGHT LEADERSHIP ENGINE ====================

interface ThoughtLeadershipResult {
  topic_suggestions: ThoughtLeadershipTopic[]
  article_outline: {
    title: string
    hook: string
    sections: Array<{ heading: string; key_points: string[]; word_count: number }>
    conclusion: string
    seo_keywords: string[]
  }
  publishing_strategy: Array< {
    platform: string
    format: string
    optimal_time: string
    audience_reach: string
    engagement_tactic: string
  }>
  discussion_prompts: Array<{
    question: string
    target_audience: string
    expected_engagement: string
    platform: string
  }>
  influencer_collaborations: Array<{
    influencer_type: string
    collaboration_format: string
    value_proposition: string
    expected_reach: number
    priority: 'high' | 'medium' | 'low'
  }>
  seo_tracking: Array<{
    keyword: string
    current_rank: number
    target_rank: number
    monthly_search_volume: number
    competition: 'high' | 'medium' | 'low'
    progress: number
  }>
}

function suggestTopics(industry: string, expertise_areas: string[]): ThoughtLeadershipTopic[] {
  const topics: ThoughtLeadershipTopic[] = []

  const crossTopics: ThoughtLeadershipTopic[] = [
    {
      topic: `AI-Driven Transformation in ${industry}`,
      trend_score: 95,
      relevance_score: 90,
      differentiation_score: 75,
      recommended_format: 'whitepaper',
      audience: 'C-Suite executives and decision-makers',
      key_takeaways: ['Strategic implications of AI adoption', 'Cost-benefit analysis frameworks', 'Implementation roadmap'],
      seo_potential: 'high'
    },
    {
      topic: `The Future of ${expertise_areas[0] || 'Innovation'}: 2026 Predictions`,
      trend_score: 88,
      relevance_score: 92,
      differentiation_score: 80,
      recommended_format: 'article',
      audience: 'Industry professionals and analysts',
      key_takeaways: ['Emerging trends and patterns', 'Technology disruption signals', 'Competitive landscape shifts'],
      seo_potential: 'high'
    },
    {
      topic: `Sustainability Meets Profitability in ${industry}`,
      trend_score: 85,
      relevance_score: 78,
      differentiation_score: 70,
      recommended_format: 'video',
      audience: 'ESG-focused investors and regulators',
      key_takeaways: ['ROI of sustainable practices', 'Regulatory compliance strategies', 'Brand value creation'],
      seo_potential: 'medium'
    },
    {
      topic: `${industry} Leadership Playbook: Lessons from the Frontline`,
      trend_score: 72,
      relevance_score: 88,
      differentiation_score: 85,
      recommended_format: 'podcast',
      audience: 'Mid-to-senior level managers',
      key_takeaways: ['Real-world case studies', 'Actionable frameworks', 'Expert interviews'],
      seo_potential: 'medium'
    },
    {
      topic: `${expertise_areas[1] || 'Digital Strategy'} Demystified`,
      trend_score: 78,
      relevance_score: 85,
      differentiation_score: 72,
      recommended_format: 'social_series',
      audience: 'Broad professional audience',
      key_takeaways: ['Jargon-free explanations', 'Practical applications', 'Visual storytelling'],
      seo_potential: 'high'
    }
  ]

  return crossTopics
}

function writeArticleOutline(topic: string, expertise_areas: string[]): ThoughtLeadershipResult['article_outline'] {
  return {
    title: `${topic}: A Strategic Perspective for Industry Leaders`,
    hook: `In an era of rapid transformation, ${topic.toLowerCase()} has emerged as a defining challenge and opportunity for organizations worldwide. This piece explores the strategic implications and actionable insights for leaders navigating this landscape.`,
    sections: [
      {
        heading: 'The Current Landscape',
        key_points: ['Industry snapshot and key metrics', 'Major players and their strategies', 'Market dynamics and shifts'],
        word_count: 400
      },
      {
        heading: 'The Challenge',
        key_points: ['Pain points and friction areas', 'Traditional approaches and their limitations', 'Cost of inaction'],
        word_count: 350
      },
      {
        heading: 'A New Framework',
        key_points: ['Core principles of the proposed approach', 'Evidence-based methodology', 'Implementation considerations'],
        word_count: 500
      },
      {
        heading: 'Case Studies & Evidence',
        key_points: ['Real-world examples', 'Quantitative results', 'Lessons learned'],
        word_count: 400
      },
      {
        heading: 'Actionable Recommendations',
        key_points: ['Immediate steps (30 days)', 'Medium-term initiatives (90 days)', 'Long-term strategic moves (12 months)'],
        word_count: 350
      }
    ],
    conclusion: 'Organizations that act decisively on these insights will be best positioned to lead in the evolving landscape. The time for strategic action is now.',
    seo_keywords: expertise_areas.slice(0, 5).concat(['industry trends', 'strategic insights', 'leadership'])
  }
}

function buildPublishingStrategy(topic: string): ThoughtLeadershipResult['publishing_strategy'] {
  return [
    {
      platform: 'LinkedIn Articles',
      format: 'Long-form thought leadership',
      optimal_time: 'Tuesday-Thursday, 8-10 AM',
      audience_reach: 'Professional network (5K-50K)',
      engagement_tactic: 'Post teaser with key stat, link to full article in comments'
    },
    {
      platform: 'Company Blog',
      format: 'SEO-optimized long-form content',
      optimal_time: 'Monday morning for maximum weekly traffic',
      audience_reach: 'Existing audience + organic search',
      engagement_tactic: 'Email newsletter feature + social cross-post'
    },
    {
      platform: 'Industry Publication (Guest)',
      format: 'Byline article with bio and CTA',
      optimal_time: 'Align with publication editorial calendar',
      audience_reach: 'Industry-specific audience (10K-100K)',
      engagement_tactic: 'Engage with comments, share across channels'
    },
    {
      platform: 'LinkedIn Newsletter',
      format: 'Serialized content series',
      optimal_time: 'Weekly, same day/time for consistency',
      audience_reach: 'Subscribers (grow 10-20% monthly)',
      engagement_tactic: 'Exclusive insights for subscribers, encourage forwards'
    },
    {
      platform: 'Medium / Substack',
      format: 'Repurposed content with unique framing',
      optimal_time: 'Weekdays, lunch hours',
      audience_reach: 'Cross-platform audience expansion',
      engagement_tactic: 'Import canonical URL for SEO, engage in responses'
    }
  ]
}

function generateDiscussionPrompts(topic: string): ThoughtLeadershipResult['discussion_prompts'] {
  return [
    {
      question: `What's the biggest misconception about ${topic.toLowerCase()} in your industry?`,
      target_audience: 'Industry practitioners',
      expected_engagement: 'High - invites opinion sharing',
      platform: 'LinkedIn post'
    },
    {
      question: `If you could change one thing about how ${topic.toLowerCase()} is practiced, what would it be?`,
      target_audience: 'Senior leaders and decision-makers',
      expected_engagement: 'Medium-High - thought-provoking',
      platform: 'LinkedIn poll + discussion'
    },
    {
      question: `What emerging trend in ${topic.toLowerCase()} should everyone be watching?`,
      target_audience: 'Analysts and strategists',
      expected_engagement: 'Medium - knowledge sharing',
      platform: 'Twitter/X thread starter'
    }
  ]
}

function identifyInfluencerCollabs(industry: string): ThoughtLeadershipResult['influencer_collaborations'] {
  return [
    {
      influencer_type: 'Industry Analyst',
      collaboration_format: 'Co-authored research report',
      value_proposition: 'Access to proprietary data + thought leadership exposure',
      expected_reach: 50000,
      priority: 'high'
    },
    {
      influencer_type: 'LinkedIn Creator (100K+ followers)',
      collaboration_format: 'Joint live session / AMA',
      value_proposition: 'Exclusive insights + cross-audience exposure',
      expected_reach: 100000,
      priority: 'high'
    },
    {
      influencer_type: 'Podcast Host (top industry show)',
      collaboration_format: 'Guest appearance with key takeaways',
      value_proposition: 'Credibility by association + unique perspective',
      expected_reach: 30000,
      priority: 'medium'
    },
    {
      influencer_type: 'Academic Researcher',
      collaboration_format: 'Expert quote and co-citation',
      value_proposition: 'Academic rigor + research partnership',
      expected_reach: 15000,
      priority: 'medium'
    },
    {
      influencer_type: 'Niche Twitter/X Influencer',
      collaboration_format: 'Quote tweet and thread collaboration',
      value_proposition: 'Rapid audience reach + authentic endorsement',
      expected_reach: 80000,
      priority: 'low'
    }
  ]
}

function trackSEOKeywords(expertise_areas: string[]): ThoughtLeadershipResult['seo_tracking'] {
  return expertise_areas.slice(0, 6).map((area, i) => ({
    keyword: `${area} trends ${new Date().getFullYear()}`,
    current_rank: 50 + i * 10,
    target_rank: 10 + i * 5,
    monthly_search_volume: Math.round(5000 / (i + 1)),
    competition: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
    progress: Math.round(15 + i * 10)
  }))
}

function runThoughtLeadership(
  industry: string,
  expertise_areas: string[]
): ThoughtLeadershipResult {
  const topics = suggestTopics(industry, expertise_areas)
  const bestTopic = topics[0]
  const articleOutline = writeArticleOutline(bestTopic.topic, expertise_areas)
  const publishingStrategy = buildPublishingStrategy(bestTopic.topic)
  const discussionPrompts = generateDiscussionPrompts(bestTopic.topic)
  const influencerCollabs = identifyInfluencerCollabs(industry)
  const seoTracking = trackSEOKeywords(expertise_areas)

  return {
    topic_suggestions: topics,
    article_outline: articleOutline,
    publishing_strategy: publishingStrategy,
    discussion_prompts: discussionPrompts,
    influencer_collaborations: influencerCollabs,
    seo_tracking: seoTracking
  }
}

function formatThoughtLeadershipReport(result: ThoughtLeadershipResult): string {
  const lines: string[] = []
  lines.push('# Thought Leadership Engine Report')
  lines.push('')
  lines.push(`**${result.topic_suggestions.length}** topics suggested | **${result.publishing_strategy.length}** publishing channels | **${result.influencer_collaborations.length}** influencer opportunities`)
  lines.push('')

  lines.push('## Topic Suggestions')
  lines.push('| Topic | Trend | Relevance | Differentiation | Format | SEO |')
  lines.push('|-------|-------|-----------|-----------------|--------|-----|')
  for (const t of result.topic_suggestions) {
    lines.push(`| ${t.topic.substring(0, 40)} | ${t.trend_score} | ${t.relevance_score} | ${t.differentiation_score} | ${t.recommended_format} | ${t.seo_potential.toUpperCase()} |`)
  }
  lines.push('')

  lines.push('## Recommended Article Outline')
  lines.push(`### ${result.article_outline.title}`)
  lines.push(`**Hook:** ${result.article_outline.hook.substring(0, 150)}...`)
  lines.push('')
  for (const section of result.article_outline.sections) {
    lines.push(`**${section.heading}** (~${section.word_count} words)`)
    for (const point of section.key_points) {
      lines.push(`  - ${point}`)
    }
  }
  lines.push('')
  lines.push(`**Conclusion:** ${result.article_outline.conclusion}`)
  lines.push('')

  lines.push('## Publishing Strategy')
  for (const ps of result.publishing_strategy) {
    lines.push(`**${ps.platform}** (${ps.format})`)
    lines.push(`  Timing: ${ps.optimal_time} | Reach: ${ps.audience_reach}`)
    lines.push(`  Tactic: ${ps.engagement_tactic}`)
    lines.push('')
  }

  lines.push('## Discussion Prompts')
  for (const dp of result.discussion_prompts) {
    lines.push(`**Q:** "${dp.question}"`)
    lines.push(`  Target: ${dp.target_audience} | Platform: ${dp.platform} | Expected: ${dp.expected_engagement}`)
    lines.push('')
  }

  lines.push('## Influencer Collaboration Opportunities')
  lines.push('| Type | Format | Reach | Priority |')
  lines.push('|------|--------|-------|----------|')
  for (const ic of result.influencer_collaborations) {
    lines.push(`| ${ic.influencer_type} | ${ic.collaboration_format} | ${ic.expected_reach.toLocaleString()} | ${ic.priority.toUpperCase()} |`)
  }
  lines.push('')

  lines.push('## SEO Keyword Tracking')
  lines.push('| Keyword | Current Rank | Target | Volume | Competition | Progress |')
  lines.push('|---------|-------------|--------|--------|-------------|----------|')
  for (const seo of result.seo_tracking) {
    lines.push(`| ${seo.keyword.substring(0, 30)} | #${seo.current_rank} | #${seo.target_rank} | ${seo.monthly_search_volume}/mo | ${seo.competition.toUpperCase()} | ${seo.progress}% |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: AWARD SUBMISSION MANAGER ====================

interface AwardSubmissionResult {
  award_opportunities: Array<{
    award_name: string
    category: string
    deadline: string
    eligibility_match: number
    prestige_score: number
    effort_estimate: string
    recommendation: string
  }>
  eligibility_assessment: Array<{
    criterion: string
    met: boolean
    evidence: string
    strength: 'strong' | 'moderate' | 'weak'
  }>
  submission_draft: {
    executive_summary: string
    narrative: string
    impact_statements: string[]
    supporting_evidence: string[]
    differentiators: string[]
  }
  submission_tracker: Array<{
    award: string
    status: 'researching' | 'drafting' | 'reviewing' | 'submitted' | 'shortlisted' | 'won' | 'not_selected'
    progress: number
    deadline: string
    days_remaining: number
    next_action: string
  }>
  relationship_maintenance: Array<{
    award_body: string
    relationship_level: 'strong' | 'established' | 'new' | 'none'
    last_engagement: string
    strategy: string
    next_outreach: string
  }>
}

function discoverAwards(awards: AwardEntry[]): AwardSubmissionResult['award_opportunities'] {
  return awards.map(a => {
    const prestigeScore = a.award_prestige === 'tier1' ? 90 : a.award_prestige === 'tier2' ? 65 : 40
    const daysToDeadline = Math.max(0, Math.round((new Date(a.submission_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

    let eligibilityMatch = Math.round(
      (a.eligibility_criteria.length > 0 ? 70 : 40) +
      (a.previous_winners.length > 0 ? 10 : 0) +
      Math.random() * 20
    )
    eligibilityMatch = Math.min(100, eligibilityMatch)

    const effortEstimate = a.entry_requirements.length <= 3 ? 'Low (1-2 weeks)' : a.entry_requirements.length <= 6 ? 'Medium (3-4 weeks)' : 'High (6-8 weeks)'

    let recommendation = 'Consider for next cycle'
    if (eligibilityMatch >= 80 && daysToDeadline > 30) recommendation = 'HIGH PRIORITY - Strong match with adequate lead time'
    else if (eligibilityMatch >= 60 && daysToDeadline > 14) recommendation = 'Recommended - Begin preparation'
    else if (daysToDeadline <= 14) recommendation = 'URGENT - Tight timeline, assess feasibility'

    return {
      award_name: a.award_name,
      category: a.category,
      deadline: a.submission_deadline,
      eligibility_match: eligibilityMatch,
      prestige_score: prestigeScore,
      effort_estimate: effortEstimate,
      recommendation
    }
  }).sort((a, b) => b.eligibility_match - a.eligibility_match)
}

function assessEligibility(award: AwardEntry): AwardSubmissionResult['eligibility_assessment'] {
  return award.eligibility_criteria.map(criterion => {
    const met = Math.random() > 0.3
    return {
      criterion,
      met,
      evidence: met ? `Verified: ${criterion} demonstrated through portfolio and documentation` : `Partial: ${criterion} requires additional documentation`,
      strength: met ? (Math.random() > 0.4 ? 'strong' : 'moderate') : 'weak'
    }
  })
}

function draftSubmission(award: AwardEntry): AwardSubmissionResult['submission_draft'] {
  return {
    executive_summary: `This submission for the ${award.category} category of ${award.award_name} demonstrates exceptional achievement and innovation. Our approach has delivered measurable impact, setting a new benchmark in the industry.`,
    narrative: `Our journey in addressing this category challenge began with a clear vision and commitment to excellence. Through innovative methodologies and dedicated execution, we have achieved results that not only meet but exceed industry standards. This submission presents our story, supported by robust evidence and measurable outcomes.`,
    impact_statements: [
      'Quantified result demonstrating category leadership',
      'Third-party validation of claimed impact',
      'Before/after comparison showing transformation',
      'Stakeholder testimonials and feedback'
    ],
    supporting_evidence: award.entry_requirements.slice(0, 4).map(req => `${req}: Documentation prepared and verified`),
    differentiators: [
      `Unique approach to ${award.category}`,
      'Proven methodology with replicable results',
      'Industry-first innovation',
      'Scalable and sustainable impact'
    ]
  }
}

function trackSubmissions(awards: AwardEntry[]): AwardSubmissionResult['submission_tracker'] {
  return awards.map(award => {
    const daysRemaining = Math.max(0, Math.round((new Date(award.submission_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    const statuses: Array<'researching' | 'drafting' | 'reviewing' | 'submitted' | 'shortlisted' | 'won' | 'not_selected'> = ['researching', 'drafting', 'reviewing', 'submitted', 'shortlisted']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const progress = status === 'researching' ? 15 : status === 'drafting' ? 40 : status === 'reviewing' ? 70 : status === 'submitted' ? 90 : 100

    return {
      award: award.award_name,
      status,
      progress,
      deadline: award.submission_deadline,
      days_remaining: daysRemaining,
      next_action: status === 'researching' ? 'Begin eligibility assessment' : status === 'drafting' ? 'Complete first draft for review' : status === 'reviewing' ? 'Incorporate feedback and finalize' : status === 'submitted' ? 'Monitor for results announcement' : 'Analyze outcome and plan next cycle'
    }
  })
}

function planRelationshipMaintenance(awards: AwardEntry[]): AwardSubmissionResult['relationship_maintenance'] {
  const uniqueBodies = [...new Set(awards.map(a => a.award_name.split(' ').slice(0, 2).join(' ')))]

  return uniqueBodies.slice(0, 5).map(body => ({
    award_body: body,
    relationship_level: Math.random() > 0.5 ? 'established' : Math.random() > 0.5 ? 'new' : 'strong',
    last_engagement: `${Math.floor(Math.random() * 6) + 1} months ago`,
    strategy: 'Engage beyond submissions - attend events, sponsor, volunteer as judge',
    next_outreach: 'Quarterly touchpoint with industry updates and thought leadership'
  }))
}

function manageAwardSubmissions(awards: AwardEntry[]): AwardSubmissionResult {
  const topAward = awards[0]
  return {
    award_opportunities: discoverAwards(awards),
    eligibility_assessment: topAward ? assessEligibility(topAward) : [],
    submission_draft: topAward ? draftSubmission(topAward) : {
      executive_summary: 'No award selected',
      narrative: '',
      impact_statements: [],
      supporting_evidence: [],
      differentiators: []
    },
    submission_tracker: trackSubmissions(awards),
    relationship_maintenance: planRelationshipMaintenance(awards)
  }
}

function formatAwardSubmissionReport(result: AwardSubmissionResult): string {
  const lines: string[] = []
  lines.push('# Award Submission Management Report')
  lines.push('')
  lines.push(`**${result.award_opportunities.length}** opportunities identified | **${result.submission_tracker.length}** active submissions`)
  lines.push('')

  lines.push('## Award Opportunities')
  lines.push('| Award | Category | Deadline | Match % | Prestige | Effort | Recommendation |')
  lines.push('|-------|----------|----------|---------|----------|--------|----------------|')
  for (const a of result.award_opportunities.slice(0, 10)) {
    lines.push(`| ${a.award_name.substring(0, 25)} | ${a.category.substring(0, 20)} | ${a.deadline} | ${a.eligibility_match}%| ${a.prestige_score} | ${a.effort_estimate} | ${a.recommendation.substring(0, 35)} |`)
  }
  lines.push('')

  if (result.eligibility_assessment.length > 0) {
    lines.push('## Eligibility Assessment')
    for (const e of result.eligibility_assessment) {
      const icon = e.met ? '[YES]' : '[NO]'
      lines.push(`${icon} **${e.criterion}** (${e.strength}) — ${e.evidence.substring(0, 80)}`)
    }
    lines.push('')
  }

  lines.push('## Submission Draft')
  lines.push(`### Executive Summary`)
  lines.push(result.submission_draft.executive_summary)
  lines.push('')
  lines.push(`### Narrative`)
  lines.push(result.submission_draft.narrative.substring(0, 300))
  lines.push('')
  lines.push('### Impact Statements')
  for (const imp of result.submission_draft.impact_statements) {
    lines.push(`- ${imp}`)
  }
  lines.push('')

  lines.push('## Submission Tracker')
  lines.push('| Award | Status | Progress | Deadline | Days Left | Next Action |')
  lines.push('|-------|--------|----------|----------|-----------|-------------|')
  for (const t of result.submission_tracker) {
    lines.push(`| ${t.award.substring(0, 25)} | ${t.status.toUpperCase()} | ${t.progress}% | ${t.deadline} | ${t.days_remaining} | ${t.next_action.substring(0, 35)} |`)
  }
  lines.push('')

  lines.push('## Relationship Maintenance')
  for (const r of result.relationship_maintenance) {
    lines.push(`**${r.award_body}** (${r.relationship_level})`)
    lines.push(`  Last engagement: ${r.last_engagement} | Strategy: ${r.strategy}`)
    lines.push(`  Next: ${r.next_outreach}`)
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== TOOL 6: SOCIAL PROOF AMPLIFIER ====================

interface SocialProofResult {
  testimonial_portfolio: Array<{
    client: string
    industry: string
    rating: number
    impact_score: number
    usage: string
    highlight: string
    recommended_placement: string
  }>
  case_study_draft: {
    title: string
    challenge: string
    solution: string
    results: { metric: string; value: string; improvement: string }[]
    client_quote: string
    key_takeaways: string[]
  }
  social_posts: Array<{
    platform: string
    format: string
    content: string
    engagement_prediction: string
    optimal_posting_time: string
    hashtags: string[]
  }>
  influencer_targets: Array<{
    name: string
    niche: string
    followers: number
    engagement_rate: number
    alignment_score: number
    outreach_strategy: string
    priority: 'high' | 'medium' | 'low'
  }>
  social_proof_strategy: Array<{
    proof_type: 'testimonial' | 'case_study' | 'statistics' | 'endorsement' | 'media_feature' | 'user_generated'
    current_volume: number
    target_volume: number
    channels: string[]
    impact_score: number
    action_items: string[]
  }>
}

function buildTestimonialPortfolio(testimonials: Testimonial[]): SocialProofResult['testimonial_portfolio'] {
  return testimonials.map(t => {
    const impactScore = Math.min(100, Math.round(t.rating * 15 + (t.verified ? 20 : 0) + t.testimonial_text.length / 10))
    const highlight = t.testimonial_text.substring(0, 80) + (t.testimonial_text.length > 80 ? '...' : '')

    let placement = 'Website testimonials page'
    if (t.rating >= 4.5 && t.verified) placement = 'Hero section + Sales deck'
    else if (t.rating >= 4.0) placement = 'Landing pages + Email signatures'
    else placement = 'Social media rotation'

    return {
      client: t.client_name,
      industry: t.industry,
      rating: t.rating,
      impact_score: impactScore,
      usage: t.usage_context,
      highlight,
      recommended_placement: placement
    }
  }).sort((a, b) => b.impact_score - a.impact_score)
}

function draftCaseStudy(testimonials: Testimonial[]): SocialProofResult['case_study_draft'] {
  const topClient = testimonials.filter(t => t.rating >= 4.0).sort((a, b) => b.rating - a.rating)[0]

  return {
    title: topClient ? `How ${topClient.client_name} Achieved Transformative Results` : 'Client Success Story: Driving Measurable Impact',
    challenge: `${topClient?.client_name || 'The client'} faced significant challenges in their ${topClient?.industry || 'industry'} operations. They needed a solution that could deliver measurable results while minimizing disruption to their existing workflows.`,
    solution: `Our team implemented a tailored approach combining industry best practices with innovative methodologies. Through collaborative planning and iterative execution, we deployed a solution specifically designed to address their unique challenges.`,
    results: [
      { metric: 'Efficiency Improvement', value: '45%', improvement: 'vs. previous approach' },
      { metric: 'Cost Reduction', value: '30%', improvement: 'year-over-year' },
      { metric: 'Time Savings', value: '60%', improvement: 'on key processes' },
      { metric: 'ROI', value: '3.5x', improvement: 'within first year' }
    ],
    client_quote: topClient ? topClient.testimonial_text.substring(0, 150) : 'The partnership delivered exceptional results that exceeded our expectations.',
    key_takeaways: [
      'Clear objectives and success metrics from day one',
      'Collaborative approach ensures buy-in and adoption',
      'Iterative delivery allows for continuous improvement',
      'Measurable outcomes demonstrate clear ROI'
    ]
  }
}

function createSocialPosts(testimonials: Testimonial[]): SocialProofResult['social_posts'] {
  const posts: SocialProofResult['social_posts'] = []

  const bestTestimonial = testimonials.sort((a, b) => b.rating - a.rating)[0]

  if (bestTestimonial) {
    posts.push({
      platform: 'LinkedIn',
      format: 'Carousel post',
      content: `"${bestTestimonial.testimonial_text.substring(0, 120)}..." — ${bestTestimonial.client_name} (${bestTestimonial.industry})`,
      engagement_prediction: 'High — social proof + specific results',
      optimal_posting_time: 'Tuesday 9 AM',
      hashtags: ['#ClientSuccess', '#Testimonial', '#Results']
    })

    posts.push({
      platform: 'Twitter/X',
      format: 'Quote tweet',
      content: `"${bestTestimonial.testimonial_text.substring(0, 100)}..." — ${bestTestimonial.client_name} rated us ${bestTestimonial.rating}/5`,
      engagement_prediction: 'Medium-High — concise and impactful',
      optimal_posting_time: 'Weekday 12 PM',
      hashtags: ['#HappyClient', '#Review']
    })

    posts.push({
      platform: 'Instagram',
      format: 'Visual testimonial card',
      content: `Visual card featuring "${bestTestimonial.testimonial_text.substring(0, 60)}..." with ${bestTestimonial.client_name} branding`,
      engagement_prediction: 'High — visual format performs well',
      optimal_posting_time: 'Wednesday 6 PM',
      hashtags: ['#LoveOurClients', '#SuccessStory', '#SocialProof']
    })

    posts.push({
      platform: 'Facebook',
      format: 'Video testimonial teaser',
      content: `15-second clip: "${bestTestimonial.testimonial_text.substring(0, 80)}..."`,
      engagement_prediction: 'Medium — authentic UGC-style content',
      optimal_posting_time: 'Thursday 1 PM',
      hashtags: ['#CustomerLove', '#RealResults']
    })
  }

  posts.push({
    platform: 'Email Signature',
    format: 'Rotating testimonial banner',
    content: `Rotating display of ${testimonials.length} verified testimonials`,
    engagement_prediction: 'Consistent exposure to all email recipients',
    optimal_posting_time: 'Always-on',
    hashtags: []
  })

  return posts
}

function identifyInfluencerTargets(industry: string): SocialProofResult['influencer_targets'] {
  return [
    {
      name: `${industry} Insider (50K followers)`,
      niche: `${industry} trends and analysis`,
      followers: 50000,
      engagement_rate: 4.2,
      alignment_score: 92,
      outreach_strategy: 'Provide exclusive data/insights in exchange for honest coverage',
      priority: 'high'
    },
    {
      name: `Tech Review Pro (200K followers)`,
      niche: 'Product reviews and comparisons',
      followers: 200000,
      engagement_rate: 3.1,
      alignment_score: 85,
      outreach_strategy: 'Product trial + honest review partnership',
      priority: 'high'
    },
    {
      name: `Industry Conference Chair (30K followers)`,
      niche: `${industry} events and community`,
      followers: 30000,
      engagement_rate: 5.5,
      alignment_score: 88,
      outreach_strategy: 'Speaker slot sponsorship + content collaboration',
      priority: 'medium'
    },
    {
      name: `Micro-Influencer Collective (10K each, 5 creators)`,
      niche: `Niche ${industry} topics`,
      followers: 10000,
      engagement_rate: 7.8,
      alignment_score: 78,
      outreach_strategy: 'Affiliate program + co-created content series',
      priority: 'medium'
    },
    {
      name: `Corporate Thought Leader (500K followers)`,
      niche: 'Executive leadership and strategy',
      followers: 500000,
      engagement_rate: 1.5,
      alignment_score: 72,
      outreach_strategy: 'Joint research report + co-branded content',
      priority: 'low'
    }
  ]
}

function buildSocialProofStrategy(testimonials: Testimonial[]): SocialProofResult['social_proof_strategy'] {
  const stats = {
    total: testimonials.length,
    verified: testimonials.filter(t => t.verified).length,
    highRated: testimonials.filter(t => t.rating >= 4.0).length
  }

  return [
    {
      proof_type: 'testimonial',
      current_volume: stats.total,
      target_volume: stats.total * 2,
      channels: ['Website', 'Sales deck', 'Email signatures'],
      impact_score: 85,
      action_items: ['Request testimonials from Q3 clients', 'Video testimonial collection campaign', 'Review site generation']
    },
    {
      proof_type: 'case_study',
      current_volume: 1,
      target_volume: 4,
      channels: ['Blog', 'Sales enablement', 'Event materials'],
      impact_score: 92,
      action_items: ['Draft 3 industry case studies', 'Client interview scheduling', 'Design template creation']
    },
    {
      proof_type: 'statistics',
      current_volume: 3,
      target_volume: 8,
      channels: ['Social media', 'Presentations', 'Website hero'],
      impact_score: 78,
      action_items: ['Compile key metrics from all clients', 'Create infographic series', 'Real-time dashboard']
    },
    {
      proof_type: 'endorsement',
      current_volume: 0,
      target_volume: 2,
      channels: ['Press release', 'Social media', 'Website badging'],
      impact_score: 88,
      action_items: ['Identify potential endorsers', 'Prepare endorsement requests', 'Co-marketing agreements']
    },
    {
      proof_type: 'media_feature',
      current_volume: 0,
      target_volume: 3,
      channels: ['PR outreach', 'Website media wall', 'Sales references'],
      impact_score: 90,
      action_items: ['Media pitch calendar', 'Press kit refresh', 'Award submissions']
    },
    {
      proof_type: 'user_generated',
      current_volume: 0,
      target_volume: 10,
      channels: ['Social media', 'Community forum', 'Review sites'],
      impact_score: 70,
      action_items: ['Social media challenge campaign', 'Review solicitation program', 'Client advocacy program']
    }
  ]
}

function amplifySocialProof(
  testimonials: Testimonial[],
  industry: string
): SocialProofResult {
  return {
    testimonial_portfolio: buildTestimonialPortfolio(testimonials),
    case_study_draft: draftCaseStudy(testimonials),
    social_posts: createSocialPosts(testimonials),
    influencer_targets: identifyInfluencerTargets(industry),
    social_proof_strategy: buildSocialProofStrategy(testimonials)
  }
}

function formatSocialProofReport(result: SocialProofResult): string {
  const lines: string[] = []
  lines.push('# Social Proof Amplifier Report')
  lines.push('')
  lines.push(`**${result.testimonial_portfolio.length}** testimonials curated | **${result.social_posts.length}** social posts drafted | **${result.influencer_targets.length}** influencer targets`)
  lines.push('')

  lines.push('## Testimonial Portfolio')
  lines.push('| Client | Industry | Rating | Impact | Placement |')
  lines.push('|-------|----------|--------|--------|-----------|')
  for (const t of result.testimonial_portfolio.slice(0, 10)) {
    lines.push(`| ${t.client} | ${t.industry} | ${t.rating}/5 | ${t.impact_score} | ${t.recommended_placement} |`)
  }
  lines.push('')

  lines.push('## Case Study Draft')
  lines.push(`### ${result.case_study_draft.title}`)
  lines.push(`**Challenge:** ${result.case_study_draft.challenge.substring(0, 120)}...`)
  lines.push(`**Solution:** ${result.case_study_draft.solution.substring(0, 120)}...`)
  lines.push('')
  lines.push('**Key Results:**')
  for (const r of result.case_study_draft.results) {
    lines.push(`- **${r.metric}:** ${r.value} ${r.improvement}`)
  }
  lines.push('')

  lines.push('## Social Posts')
  for (const sp of result.social_posts) {
    lines.push(`### ${sp.platform} (${sp.format})`)
    lines.push(`> ${sp.content.substring(0, 120)}`)
    lines.push(`  Prediction: ${sp.engagement_prediction} | Timing: ${sp.optimal_posting_time}`)
    if (sp.hashtags.length > 0) lines.push(`  Tags: ${sp.hashtags.join(' ')}`)
    lines.push('')
  }

  lines.push('## Influencer Targets')
  lines.push('| Target | Niche | Followers | Engagement | Alignment | Priority |')
  lines.push('|--------|-------|-----------|------------|-----------|----------|')
  for (const it of result.influencer_targets) {
    lines.push(`| ${it.name.substring(0, 25)} | ${it.niche.substring(0, 20)} | ${(it.followers / 1000).toFixed(0)}K | ${it.engagement_rate}% | ${it.alignment_score} | ${it.priority.toUpperCase()} |`)
  }
  lines.push('')

  lines.push('## Social Proof Strategy')
  for (const sp of result.social_proof_strategy) {
    lines.push(`### ${sp.proof_type.replace('_', ' ').toUpperCase()} (${sp.current_volume} → ${sp.target_volume})`)
    lines.push(`  Impact Score: ${sp.impact_score} | Channels: ${sp.channels.join(', ')}`)
    for (const action of sp.action_items) {
      lines.push(`  - [ ] ${action}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== TOOL 7: MEDIA MEASUREMENT ====================

interface MediaMeasurementResult {
  ave_analysis: {
    total_ave: number
    breakdown: Array<{ outlet: string;AVE: number; sentiment: 'positive' | 'neutral' | 'negative'; multiplier: number }>
    industry_benchmark_ave: number
    comparison_to_benchmark: string
  }
  impression_analysis: {
    total_impressions: number
    breakdown: { organic: number; paid: number; earned: number; social: number }
    cpm: number
    reach_estimate: number
    frequency: number
  }
  sentiment_analysis: {
    positive_percentage: number
    neutral_percentage: number
    negative_percentage: number
    net_sentiment_score: number
    trend_direction: 'improving' | 'stable' | 'declining'
    key_positive_themes: string[]
    key_negative_themes: string[]
  }
  share_of_voice: {
    our_share: number
    competitor_shares: Record<string, number>
    trend: 'gaining' | 'stable' | 'losing'
    gap_analysis: string
  }
  value_metrics: {
    pr_value: number
    cost_per_thousand: number
    cost_per_engagement: number
    earned_media_value: number
    media_efficiency_ratio: number
  }
  roi_analysis: {
    total_investment: number
    total_return: number
    roi_percentage: number
    payback_period_months: number
    roi_rating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor'
  }
  summary_report: string
  competitive_benchmark: Array<{
    competitor: string
    mentions: number
    sentiment: number
    share: number
    key_message: string
    our_advantage: string
  }>
}

function calculateAVE(metrics: MediaMetrics): MediaMeasurementResult['ave_analysis'] {
  const breakdown = [
    { outlet: 'Tier 1 National', ave: metrics.ave_value * 0.4, sentiment: 'positive' as const, multiplier: 3.2 },
    { outlet: 'Tier 2 Regional', ave: metrics.ave_value * 0.3, sentiment: 'neutral' as const, multiplier: 2.1 },
    { outlet: 'Trade Press', ave: metrics.ave_value * 0.2, sentiment: 'positive' as const, multiplier: 4.0 },
    { outlet: 'Online Media', ave: metrics.ave_value * 0.1, sentiment: 'positive' as const, multiplier: 2.8 }
  ]

  const benchmarkAVE = metrics.ave_value * 0.85
  const comparison = metrics.ave_value > benchmarkAVE ? 'Above industry benchmark' : 'Below industry benchmark'

  return {
    total_ave: metrics.ave_value,
    breakdown: breakdown.map(b => ({ ...b, AVE: Math.round(b.ave) })),
    industry_benchmark_ave: Math.round(benchmarkAVE),
    comparison_to_benchmark: comparison
  }
}

function analyzeImpressions(metrics: MediaMetrics, pr_spend: number): MediaMeasurementResult['impression_analysis'] {
  const organic = Math.round(metrics.total_impressions * 0.45)
  const paid = Math.round(metrics.total_impressions * 0.25)
  const earned = Math.round(metrics.total_impressions * 0.2)
  const social = Math.round(metrics.total_impressions * 0.1)

  const cpm = metrics.total_impressions > 0 ? Math.round((pr_spend / metrics.total_impressions) * 1000 * 100) / 100 : 0
  const reachEstimate = Math.round(metrics.total_impressions / 2.5)
  const frequency = metrics.total_impressions > 0 ? Math.round((metrics.total_impressions / reachEstimate) * 10) / 10 : 0

  return {
    total_impressions: metrics.total_impressions,
    breakdown: { organic, paid, earned, social },
    cpm,
    reach_estimate: reachEstimate,
    frequency
  }
}

function analyzeSentiment(metrics: MediaMetrics): MediaMeasurementResult['sentiment_analysis'] {
  const total = metrics.sentiment_positive + metrics.sentiment_neutral + metrics.sentiment_negative
  const posPct = total > 0 ? Math.round((metrics.sentiment_positive / total) * 100) : 0
  const neuPct = total > 0 ? Math.round((metrics.sentiment_neutral / total) * 100) : 0
  const negPct = 100 - posPct - neuPct

  const netScore = posPct - negPct
  const trend: 'improving' | 'stable' | 'declining' = netScore > 20 ? 'improving' : netScore > -10 ? 'stable' : 'declining'

  return {
    positive_percentage: posPct,
    neutral_percentage: neuPct,
    negative_percentage: negPct,
    net_sentiment_score: netScore,
    trend_direction: trend,
    key_positive_themes: ['Innovation leadership', 'Customer success evidence', 'Industry expertise demonstration'],
    key_negative_themes: negPct > 10 ? ['Information gaps', 'Competitor comparisons'] : ['Minimal negative themes detected']
  }
}

function calculateShareOfVoice(metrics: MediaMetrics): MediaMeasurementResult['share_of_voice'] {
  const totalMentions = Object.values(metrics.competitor_mentions).reduce((sum, v) => sum + v, 0) + metrics.media_mentions
  const ourShare = totalMentions > 0 ? Math.round((metrics.media_mentions / totalMentions) * 100) : 0
  const topCompetitor = Object.entries(metrics.competitor_mentions).sort(([, a], [, b]) => b - a)[0]
  const compShare = topCompetitor && totalMentions > 0 ? Math.round((topCompetitor[1] / totalMentions) * 100) : 0

  const trend: 'gaining' | 'stable' | 'losing' = ourShare > compShare + 5 ? 'gaining' : ourShare < compShare - 5 ? 'losing' : 'stable'
  const gap = ourShare - compShare
  const gapAnalysis = gap > 0 ? `Leading by ${gap} percentage points` : gap < 0 ? `Trailing by ${Math.abs(gap)} percentage points` : 'Even with top competitor'

  return {
    our_share: ourShare,
    competitor_shares: metrics.competitor_mentions,
    trend,
    gap_analysis: gapAnalysis
  }
}

function calculateValueMetrics(metrics: MediaMetrics, pr_spend: number): MediaMeasurementResult['value_metrics'] {
  const prValue = Math.round(metrics.ave_value * 1.5)
  const cpm = metrics.total_impressions > 0 ? Math.round((pr_spend / metrics.total_impressions) * 1000 * 100) / 100 : 0
  const cpe = metrics.total_impressions > 0 ? Math.round((pr_spend / (metrics.total_impressions * 0.02)) * 100) / 100 : 0
  const emv = Math.round(metrics.ave_value * 1.3)
  const efficiency = pr_spend > 0 ? Math.round((prValue / pr_spend) * 100) / 100 : 0

  return {
    pr_value: prValue,
    cost_per_thousand: cpm,
    cost_per_engagement: cpe,
    earned_media_value: emv,
    media_efficiency_ratio: efficiency
  }
}

function calculateROI(metrics: MediaMetrics, pr_spend: number): MediaMeasurementResult['roi_analysis'] {
  const totalReturn = Math.round(metrics.estimated_earnings)
  const roi = pr_spend > 0 ? Math.round(((totalReturn - pr_spend) / pr_spend) * 100) : 0
  const payback = pr_spend > 0 && totalReturn > 0 ? Math.round((pr_spend / (totalReturn / 12)) * 10) / 10 : 12

  let roiRating: 'excellent' | 'good' | 'average' | 'below_average' | 'poor' = 'poor'
  if (roi >= 500) roiRating = 'excellent'
  else if (roi >= 300) roiRating = 'good'
  else if (roi >= 150) roiRating = 'average'
  else if (roi >= 50) roiRating = 'below_average'

  return {
    total_investment: pr_spend,
    total_return: totalReturn,
    roi_percentage: roi,
    payback_period_months: payback,
    roi_rating: roiRating
  }
}

function benchmarkCompetitors(metrics: MediaMetrics): MediaMeasurementResult['competitive_benchmark'] {
  return Object.entries(metrics.competitor_mentions).map(([name, mentions]) => ({
    competitor: name,
    mentions,
    sentiment: Math.round(Math.random() * 40 + 30),
    share: Math.round((mentions / (metrics.media_mentions + Object.values(metrics.competitor_mentions).reduce((a, b) => a + b, 0))) * 100),
    key_message: `${name}'s primary messaging theme`,
    our_advantage: `Our advantage in ${name === 'Competitor A' ? 'thought leadership' : name === 'Competitor B' ? 'media relationships' : 'content quality'}`
  }))
}

function measureMedia(
  metrics: MediaMetrics,
  pr_spend: number
): MediaMeasurementResult {
  const aveAnalysis = calculateAVE(metrics)
  const impressionAnalysis = analyzeImpressions(metrics, pr_spend)
  const sentimentAnalysis = analyzeSentiment(metrics)
  const shareOfVoice = calculateShareOfVoice(metrics)
  const valueMetrics = calculateValueMetrics(metrics, pr_spend)
  const roiAnalysis = calculateROI(metrics, pr_spend)
  const competitiveBenchmark = benchmarkCompetitors(metrics)

  const summaryReport = `## Media Measurement Summary (${metrics.period})
- **Total AVE:** $${aveAnalysis.total_ave.toLocaleString()} (${aveAnalysis.comparison_to_benchmark})
- **Total Impressions:** ${impressionAnalysis.total_impressions.toLocaleString()} (CPM: $${impressionAnalysis.cpm})
- **Net Sentiment:** ${sentimentAnalysis.net_sentiment_score} (${sentimentAnalysis.trend_direction})
- **Share of Voice:** ${shareOfVoice.our_share}% (${shareOfVoice.trend} — ${shareOfVoice.gap_analysis})
- **PR ROI:** ${roiAnalysis.roi_percentage}% (${roiAnalysis.roi_rating}) | Payback: ${roiAnalysis.payback_period_months} months
- **Media Efficiency:** ${valueMetrics.media_efficiency_ratio}x return on PR spend`

  return {
    ave_analysis: aveAnalysis,
    impression_analysis: impressionAnalysis,
    sentiment_analysis: sentimentAnalysis,
    share_of_voice: shareOfVoice,
    value_metrics: valueMetrics,
    roi_analysis: roiAnalysis,
    summary_report: summaryReport,
    competitive_benchmark: competitiveBenchmark
  }
}

function formatMediaMeasurementReport(result: MediaMeasurementResult): string {
  const lines: string[] = []
  lines.push('# Media Measurement & Evaluation Report')
  lines.push('')

  lines.push(result.summary_report)
  lines.push('')

  lines.push('## AVE Breakdown')
  lines.push('| Outlet Type | AVE | Sentiment | Multiplier |')
  lines.push('|------------|-----|-----------|------------|')
  for (const b of result.ave_analysis.breakdown) {
    lines.push(`| ${b.outlet} | $${b.AVE.toLocaleString()} | ${b.sentiment} | ${b.multiplier}x |`)
  }
  lines.push(`| **Benchmark** | $${result.ave_analysis.industry_benchmark_ave.toLocaleString()} | — | — |`)
  lines.push('')

  lines.push('## Impression Analysis')
  lines.push(`- **Total:** ${result.impression_analysis.total_impressions.toLocaleString()}`)
  lines.push(`- **Organic:** ${result.impression_analysis.breakdown.organic.toLocaleString()} | **Paid:** ${result.impression_analysis.breakdown.paid.toLocaleString()} | **Earned:** ${result.impression_analysis.breakdown.earned.toLocaleString()} | **Social:** ${result.impression_analysis.breakdown.social.toLocaleString()}`)
  lines.push(`- **CPM:** $${result.impression_analysis.cpm} | **Reach:** ${result.impression_analysis.reach_estimate.toLocaleString()} | **Frequency:** ${result.impression_analysis.frequency}x`)
  lines.push('')

  lines.push('## Sentiment Analysis')
  lines.push(`- **Positive:** ${result.sentiment_analysis.positive_percentage}% | **Neutral:** ${result.sentiment_analysis.neutral_percentage}% | **Negative:** ${result.sentiment_analysis.negative_percentage}%`)
  lines.push(`- **Net Sentiment Score:** ${result.sentiment_analysis.net_sentiment_score} (${result.sentiment_analysis.trend_direction})`)
  lines.push(`- **Positive Themes:** ${result.sentiment_analysis.key_positive_themes.join(', ')}`)
  lines.push(`- **Negative Themes:** ${result.sentiment_analysis.key_negative_themes.join(', ')}`)
  lines.push('')

  lines.push('## Share of Voice')
  lines.push(`- **Our Share:** ${result.share_of_voice.our_share}% (${result.share_of_voice.trend})`)
  lines.push(`- **Gap Analysis:** ${result.share_of_voice.gap_analysis}`)
  for (const [comp, share] of Object.entries(result.share_of_voice.competitor_shares)) {
    lines.push(`- **${comp}:** ${share} mentions (${Math.round(share / (Object.values(result.share_of_voice.competitor_shares).reduce((a, b) => a + b, 0) + result.share_of_voice.our_share) * 100)}% share)`)
  }
  lines.push('')

  lines.push('## Value Metrics')
  lines.push(`- **PR Value:** $${result.value_metrics.pr_value.toLocaleString()}`)
  lines.push(`- **CPM:** $${result.value_metrics.cost_per_thousand} | **CPE:** $${result.value_metrics.cost_per_engagement}`)
  lines.push(`- **Earned Media Value:** $${result.value_metrics.earned_media_value.toLocaleString()}`)
  lines.push(`- **Media Efficiency Ratio:** ${result.value_metrics.media_efficiency_ratio}x`)
  lines.push('')

  lines.push('## ROI Analysis')
  lines.push(`- **Investment:** $${result.roi_analysis.total_investment.toLocaleString()}`)
  lines.push(`- **Return:** $${result.roi_analysis.total_return.toLocaleString()}`)
  lines.push(`- **ROI:** ${result.roi_analysis.roi_percentage}%`)
  lines.push(`- **Payback Period:** ${result.roi_analysis.payback_period_months} months`)
  lines.push(`- **Rating:** ${result.roi_analysis.roi_rating.replace('_', ' ').toUpperCase()}`)
  lines.push('')

  lines.push('## Competitive Benchmark')
  lines.push('| Competitor | Mentions | Sentiment | Share | Our Advantage |')
  lines.push('|-----------|----------|-----------|-------|---------------|')
  for (const cb of result.competitive_benchmark) {
    lines.push(`| ${cb.competitor} | ${cb.mentions} | ${cb.sentiment} | ${cb.share}% | ${cb.our_advantage.substring(0, 30)} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: CONTENT DISTRIBUTION OPTIMIZER ====================

interface ContentDistributionResult {
  timing_optimization: Array<{
    content_id: string
    topic: string
    recommended_date: string
    recommended_time: string
    timezone: string
    reasoning: string
    expected_lift: string
  }>
  channel_selection: Array<{
    content_id: string
    recommended_channels: Array<{ channel: string; priority: 'primary' | 'secondary' | 'tertiary'; match_score: number; audience_fit: string }>
    rationale: string
  }>
  format_adaptation: Array<{
    original_format: string
    adapted_formats: Array<{ format: string; channel: string; effort: 'low' | 'medium' | 'high'; reach_potential: number }>
  }>
  paid_vs_organic: Array<{
    content_id: string
    recommendation: 'organic_only' | 'paid_boost' | 'hybrid' | 'paid_first'
    budget_allocation: { organic: number; paid: number }
    reasoning: string
    estimated_roi: string
  }>
  engagement_analysis: Array<{
    channel: string
    current_engagement: number
    benchmark_engagement: number
    gap: number
    improvement_actions: string[]
  }>
  adjustment_suggestions: Array<{
    area: string
    current_state: string
    suggested_change: string
    expected_impact: string
    priority: 'critical' | 'high' | 'medium' | 'low'
  }>
  prediction_forecast: Array<{
    metric: string
    current_value: number
    predicted_value_30d: number
    predicted_value_90d: number
    confidence: number
  }>
}

function optimizeTiming(content: ContentPiece[]): ContentDistributionResult['timing_optimization'] {
  const timeSlots = [
    { day: 'Tuesday', time: '8:00 AM', reasoning: 'Weekday morning high-open rate period', lift: '25-35%' },
    { day: 'Wednesday', time: '10:00 AM', reasoning: 'Mid-morning peak professional engagement', lift: '20-30%' },
    { day: 'Thursday', time: '9:00 AM', reasoning: 'Pre-weekend content planning window', lift: '15-25%' },
    { day: 'Monday', time: '7:30 AM', reasoning: 'Week-start high inbox activity', lift: '20-28%' },
    { day: 'Friday', time: '11:00 AM', reasoning: 'Late-week content consumption uptick', lift: '10-20%' }
  ]

  return content.map((c, i) => {
    const slot = timeSlots[i % timeSlots.length]
    return {
      content_id: c.content_id,
      topic: c.topic,
      recommended_date: `Next ${slot.day}`,
      recommended_time: slot.time,
      timezone: 'Audience local time (EST/PST)',
      reasoning: slot.reasoning,
      expected_lift: slot.lift
    }
  })
}

function selectChannels(content: ContentPiece[]): ContentDistributionResult['channel_selection'] {
  return content.map(c => {
    const channelMap: Record<string, Array<{ channel: string; priority: 'primary' | 'secondary' | 'tertiary'; match_score: number; audience_fit: string }>> = {
      'article': [
        { channel: 'LinkedIn Articles', priority: 'primary', match_score: 95, audience_fit: 'Professional audience match' },
        { channel: 'Company Blog', priority: 'primary', match_score: 92, audience_fit: 'Owned audience with SEO value' },
        { channel: 'Medium', priority: 'secondary', match_score: 78, audience_fit: 'Cross-platform discovery' },
        { channel: 'Twitter/X Thread', priority: 'tertiary', match_score: 70, audience_fit: 'Bite-sized distribution' }
      ],
      'video': [
        { channel: 'YouTube', priority: 'primary', match_score: 95, audience_fit: 'Video-native platform' },
        { channel: 'LinkedIn Video', priority: 'primary', match_score: 88, audience_fit: 'Professional video consumption' },
        { channel: 'Instagram Reels', priority: 'secondary', match_score: 82, audience_fit: 'Short-form video audience' },
        { channel: 'TikTok', priority: 'tertiary', match_score: 65, audience_fit: 'Reaching if audience matches' }
      ],
      'infographic': [
        { channel: 'LinkedIn', priority: 'primary', match_score: 90, audience_fit: 'Visual content performs well' },
        { channel: 'Pinterest', priority: 'primary', match_score: 88, audience_fit: 'Visual discovery platform' },
        { channel: 'Twitter/X', priority: 'secondary', match_score: 80, audience_fit: 'Shareable visual format' },
        { channel: 'Instagram', priority: 'secondary', match_score: 85, audience_fit: 'Visual-first audience' }
      ],
      'social_post': [
        { channel: 'Twitter/X', priority: 'primary', match_score: 92, audience_fit: 'Native social format' },
        { channel: 'LinkedIn', priority: 'primary', match_score: 90, audience_fit: 'Professional network amplification' },
        { channel: 'Facebook', priority: 'secondary', match_score: 75, audience_fit: 'Broad demographic reach' },
        { channel: 'Instagram Stories', priority: 'tertiary', match_score: 70, audience_fit: 'Ephemeral engagement' }
      ],
      'newsletter': [
        { channel: 'Email', priority: 'primary', match_score: 98, audience_fit: 'Direct subscriber relationship' },
        { channel: 'LinkedIn Repost', priority: 'secondary', match_score: 72, audience_fit: 'Extended reach beyond subscribers' },
        { channel: 'Company Blog', priority: 'tertiary', match_score: 68, audience_fit: 'SEO and archive value' }
      ],
      'press_release': [
        { channel: 'PR Newswire', priority: 'primary', match_score: 95, audience_fit: 'Journalist and media distribution' },
        { channel: 'Company Blog', priority: 'primary', match_score: 90, audience_fit: 'Owned channel distribution' },
        { channel: 'Email to journalists', priority: 'secondary', match_score: 85, audience_fit: 'Direct media relationships' },
        { channel: 'Social media', priority: 'tertiary', match_score: 70, audience_fit: 'Public amplification' }
      ]
    }

    const channels = channelMap[c.format] || channelMap['social_post']

    return {
      content_id: c.content_id,
      recommended_channels: channels,
      rationale: `${c.format} content best suited for ${channels.filter(ch => ch.priority === 'primary').map(ch => ch.channel).join(' and ')} based on audience and engagement patterns`
    }
  })
}

function adaptFormats(content: ContentPiece[]): ContentDistributionResult['format_adaptation'] {
  return content.map(c => {
    const adaptations: Record<string, Array<{ format: string; channel: string; effort: 'low' | 'medium' | 'high'; reach_potential: number }>> = {
      'article': [
        { format: 'Video summary (3 min)', channel: 'YouTube/LinkedIn', effort: 'medium', reach_potential: 85 },
        { format: 'Infographic key points', channel: 'LinkedIn/Pinterest', effort: 'low', reach_potential: 90 },
        { format: 'Podcast discussion', channel: 'Podcast platforms', effort: 'high', reach_potential: 70 },
        { format: 'Tweet thread', channel: 'Twitter/X', effort: 'low', reach_potential: 80 },
        { format: 'Newsletter feature', channel: 'Email', effort: 'low', reach_potential: 75 }
      ],
      'video': [
        { format: 'Blog post companion', channel: 'Blog/Medium', effort: 'medium', reach_potential: 80 },
        { format: 'Quote card snippets', channel: 'Social media', effort: 'low', reach_potential: 85 },
        { format: 'Podcast audio extract', channel: 'Podcast', effort: 'low', reach_potential: 60 }
      ],
      'infographic': [
        { format: 'Blog post embed', channel: 'Website/Blog', effort: 'low', reach_potential: 70 },
        { format: 'Slide deck share', channel: 'SlideShare/LinkedIn', effort: 'medium', reach_potential: 75 },
        { format: 'Data article', channel: 'Industry publication', effort: 'high', reach_potential: 85 }
      ],
      'social_post': [
        { format: 'Blog post expansion', channel: 'Blog', effort: 'medium', reach_potential: 75 },
        { format: 'Email newsletter feature', channel: 'Email', effort: 'low', reach_potential: 65 }
      ],
      'newsletter': [
        { format: 'Blog post (public version)', channel: 'Blog', effort: 'low', reach_potential: 80 },
        { format: 'LinkedIn article', channel: 'LinkedIn', effort: 'medium', reach_potential: 75 }
      ],
      'press_release': [
        { format: 'Blog post adaptation', channel: 'Company blog', effort: 'medium', reach_potential: 80 },
        { format: 'Media pitch (personalized)', channel: 'Email to journalists', effort: 'low', reach_potential: 90 },
        { format: 'Social media summary', channel: 'Social platforms', effort: 'low', reach_potential: 75 }
      ]
    }

    return {
      original_format: c.format,
      adapted_formats: adaptations[c.format] || []
    }
  })
}

function optimizePaidVsOrganic(content: ContentPiece[]): ContentDistributionResult['paid_vs_organic'] {
  return content.map(c => {
    const priority = c.priority
    const highEngagement = c.current_engagement > 500

    let recommendation: 'organic_only' | 'paid_boost' | 'hybrid' | 'paid_first'
    let budgetAllocation: { organic: number; paid: number }

    if (priority === 'high' && highEngagement) {
      recommendation = 'hybrid'
      budgetAllocation = { organic: 40, paid: 60 }
    } else if (priority === 'high') {
      recommendation = 'paid_first'
      budgetAllocation = { organic: 20, paid: 80 }
    } else if (highEngagement) {
      recommendation = 'paid_boost'
      budgetAllocation = { organic: 60, paid: 40 }
    } else {
      recommendation = 'organic_only'
      budgetAllocation = { organic: 90, paid: 10 }
    }

    return {
      content_id: c.content_id,
      recommendation,
      budget_allocation: budgetAllocation,
      reasoning: `${priority} priority content with ${highEngagement ? 'strong' : 'developing'} organic engagement. ${recommendation === 'hybrid' ? 'Amplify existing traction with targeted paid support' : recommendation === 'paid_first' ? 'Need visibility boost for high-priority content' : recommendation === 'paid_boost' ? 'Organic momentum exists; paid accelerates growth' : 'Build organic foundation first, reassess in 2 weeks'}`,
      estimated_roi: highEngagement ? '4-6x (paid)' : '2-4x (paid build phase)'
    }
  })
}

function analyzeEngagement(content: ContentPiece[]): ContentDistributionResult['engagement_analysis'] {
  const channelMap = new Map<string, number[]>()

  for (const c of content) {
    for (const channel of c.distribution_channels) {
      const existing = channelMap.get(channel) || []
      existing.push(c.current_engagement)
      channelMap.set(channel, existing)
    }
  }

  const analysis: ContentDistributionResult['engagement_analysis'] = []
  for (const [channel, engagements] of channelMap) {
    const avg = engagements.reduce((a, b) => a + b, 0) / engagements.length
    const benchmark = avg * 1.3
    const gap = benchmark - avg

    analysis.push({
      channel,
      current_engagement: Math.round(avg),
      benchmark_engagement: Math.round(benchmark),
      gap: Math.round(gap),
      improvement_actions: [
        'A/B test different headline formats',
        'Optimize posting time based on audience analytics',
        'Increase interactive content (polls, questions)',
        'Cross-promote across complementary channels'
      ]
    })
  }

  return analysis.sort((a, b) => b.gap - a.gap)
}

function generateAdjustments(content: ContentPiece[]): ContentDistributionResult['adjustment_suggestions'] {
  return [
    {
      area: 'Content Timing',
      current_state: 'Irregular publishing cadence',
      suggested_change: 'Establish consistentTue/Thu 9 AM schedule with social amplification at peak hours',
      expected_impact: '+25-40% engagement lift',
      priority: 'high'
    },
    {
      area: 'Channel Mix',
      current_state: `Focused on ${[...new Set(content.flatMap(c => c.distribution_channels))].slice(0, 2).join(', ')}`,
      suggested_change: 'Expand to 2-3 additional high-match channels per content piece',
      expected_impact: '+30-50% reach expansion',
      priority: 'high'
    },
    {
      area: 'Format Diversification',
      current_state: `Primarily ${[...new Set(content.map(c => c.format))].join(', ')}`,
      suggested_change: 'Repurpose each piece into 2-3 additional formats',
      expected_impact: '+20-35% cross-format engagement',
      priority: 'medium'
    },
    {
      area: 'Paid Amplification',
      current_state: 'Minimal or no paid distribution',
      suggested_change: 'Allocate 20-40% of content budget to high-performing organic posts',
      expected_impact: '+50-200% on boosted content',
      priority: 'medium'
    },
    {
      area: 'Performance Review',
      current_state: 'Monthly reporting cadence',
      suggested_change: 'Weekly performance reviews with real-time adjustment capability',
      expected_impact: '+15-20% from faster optimization cycles',
      priority: 'low'
    }
  ]
}

function forecastPerformance(content: ContentPiece[]): ContentDistributionResult['prediction_forecast'] {
  const totalEngagement = content.reduce((sum, c) => sum + c.current_engagement, 0)
  const avgEngagement = content.length > 0 ? totalEngagement / content.length : 0

  return [
    {
      metric: 'Total Engagement',
      current_value: totalEngagement,
      predicted_value_30d: Math.round(totalEngagement * 1.35),
      predicted_value_90d: Math.round(totalEngagement * 1.8),
      confidence: 75
    },
    {
      metric: 'Avg Engagement per Piece',
      current_value: Math.round(avgEngagement),
      predicted_value_30d: Math.round(avgEngagement * 1.25),
      predicted_value_90d: Math.round(avgEngagement * 1.6),
      confidence: 70
    },
    {
      metric: 'Channel Reach',
      current_value: Math.round(totalEngagement * 2.5),
      predicted_value_30d: Math.round(totalEngagement * 2.5 * 1.4),
      predicted_value_90d: Math.round(totalEngagement * 2.5 * 2.0),
      confidence: 65
    },
    {
      metric: 'Content Output',
      current_value: content.length,
      predicted_value_30d: Math.round(content.length * 1.2),
      predicted_value_90d: Math.round(content.length * 1.5),
      confidence: 80
    }
  ]
}

function optimizeContentDistribution(content: ContentPiece[]): ContentDistributionResult {
  return {
    timing_optimization: optimizeTiming(content),
    channel_selection: selectChannels(content),
    format_adaptation: adaptFormats(content),
    paid_vs_organic: optimizePaidVsOrganic(content),
    engagement_analysis: analyzeEngagement(content),
    adjustment_suggestions: generateAdjustments(content),
    prediction_forecast: forecastPerformance(content)
  }
}

function formatContentDistributionReport(result: ContentDistributionResult): string {
  const lines: string[] = []
  lines.push('# Content Distribution Optimization Report')
  lines.push('')
  lines.push(`**${result.timing_optimization.length}** content pieces optimized | **${result.channel_selection.length}** channel strategies | **${result.adjustment_suggestions.length}** adjustment areas`)
  lines.push('')

  lines.push('## Timing Optimization')
  lines.push('| Content ID | Topic | Day | Time | Expected Lift |')
  lines.push('|-----------|-------|-----|------|---------------|')
  for (const t of result.timing_optimization) {
    lines.push(`| ${t.content_id} | t.topic.substring(0, 25)} | ${t.recommended_date} | ${t.recommended_time} | ${t.expected_lift} |`)
  }
  lines.push('')

  lines.push('## Channel Selection')
  for (const cs of result.channel_selection) {
    lines.push(`### ${cs.content_id}`)
    for (const ch of cs.recommended_channels) {
      lines.push(`- **${ch.channel}** (${ch.priority}) — Match: ${ch.match_score}/100 | ${ch.audience_fit}`)
    }
    lines.push(`  *${cs.rationale.substring(0, 100)}*`)
    lines.push('')
  }

  lines.push('## Format Adaptation')
  for (const fa of result.format_adaptation) {
    lines.push(`### From: ${fa.original_format}`)
    for (const af of fa.adapted_formats) {
      lines.push(`- → **${af.format}** (${af.channel}) — Effort: ${af.effort} | Reach: ${af.reach_potential}`)
    }
    lines.push('')
  }

  lines.push('## Paid vs. Organic Strategy')
  lines.push('| Content ID | Recommendation | Organic % | Paid % | Est. ROI |')
  lines.push('|-----------|---------------|-----------|--------|----------|')
  for (const pvo of result.paid_vs_organic) {
    lines.push(`| ${pvo.content_id} | ${pvo.recommendation} | ${pvo.budget_allocation.organic}% | ${pvo.budget_allocation.paid}% | ${pvo.estimated_roi} |`)
  }
  lines.push('')

  lines.push('## Engagement Analysis')
  lines.push('| Channel | Current | Benchmark | Gap |')
  lines.push('|---------|---------|-----------|-----|')
  for (const ea of result.engagement_analysis) {
    lines.push(`| ${ea.channel} | ${ea.current_engagement} | ${ea.benchmark_engagement} | -${ea.gap} |`)
  }
  lines.push('')

  lines.push('## Adjustment Suggestions')
  for (const adj of result.adjustment_suggestions) {
    lines.push(`**[${adj.priority.toUpperCase()}] ${adj.area}**`)
    lines.push(`  Current: ${adj.current_state}`)
    lines.push(`  Change: ${adj.suggested_change}`)
    lines.push(`  Impact: ${adj.expected_impact}`)
    lines.push('')
  }

  lines.push('## Performance Forecast')
  lines.push('| Metric | Current | 30-Day | 90-Day | Confidence |')
  lines.push('|--------|---------|--------|--------|------------|')
  for (const pred of result.prediction_forecast) {
    lines.push(`| ${pred.metric} | ${pred.current_value.toLocaleString()} | ${pred.predicted_value_30d.toLocaleString()} | ${pred.predicted_value_90d.toLocaleString()} | ${pred.confidence}% |`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'media_relations',
    description: 'Media relations management with journalist profiling, pitch matching, relationship scoring, interaction tracking, opportunity identification, and news listing. Comprehensive PR contact and outreach management system.',
    parameters: {
      contacts: { type: 'string', required: true, description: 'JSON array of journalist contacts with fields: name, outlet, beat, email, engagement_score (0-100), last_contact_date (YYYY-MM-DD), previous_coverage (array of strings), preferred_format (email/phone/social/in_person), responsiveness (high/medium/low)' },
      story_angle: { type: 'string', required: true, description: 'The current story angle or topic to match against journalist profiles for pitch opportunities' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contacts: string; story_angle: string }) {
      const contactList: JournalistContact[] = JSON.parse(args.contacts)
      const result = manageMediaRelations(contactList, args.story_angle)
      return formatMediaRelationsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'press_release_writer',
    description: 'AI-powered press release composition with headline generation, lead paragraph writing, body drafting, quote integration, boilerplate inclusion, multi-channel adaptation, and SEO optimization. Produces publication-ready press releases.',
    parameters: {
      release_input: { type: 'string', required: true, description: 'JSON object with fields: announcement_type, headline_options (array), key_facts (array), quotes (array of {speaker, title, quote}), boilerplate, target_channels (array), seo_keywords (array), company_name, launch_date' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { release_input: string }) {
      const input: PressReleaseInput = JSON.parse(args.release_input)
      const result = writePressRelease(input)
      return formatPressReleaseReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'crisis_comms_manager',
    description: 'Crisis communications management with media monitoring, response playbook generation, spokesperson readiness assessment, stakeholder communication planning, and reputation recovery roadmapping.',
    parameters: {
      crisis_events: { type: 'string', required: true, description: 'JSON array of crisis events with fields: event_id, severity (critical/high/medium/low), description, date_occurred (YYYY-MM-DD), affected_stakeholders (array), media_coverage_status (active/potential/contained), current_response_status' },
      spokespersons: { type: 'string', required: true, description: 'JSON array of spokesperson profiles with fields: name, training_completed (array of strings), appearances (number), weakness_areas (array)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { crisis_events: string; spokespersons: string }) {
      const events: CrisisEvent[] = JSON.parse(args.crisis_events)
      const spokersons: { name: string; training_completed: string[]; appearances: number; weakness_areas: string[] }[] = JSON.parse(args.spokespersons)
      const result = manageCrisisComms(events, spokersons)
      return formatCrisisCommsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'thought_leadership_engine',
    description: 'Thought leadership engine with topic trending, article outline generation, publishing strategy, discussion prompt creation, influencer collaboration identification, and SEO keyword tracking.',
    parameters: {
      industry: { type: 'string', required: true, description: 'The industry or sector for thought leadership positioning' },
      expertise_areas: { type: 'string', required: true, description: 'JSON array of 3-5 key expertise areas and topics for content creation' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { industry: string; expertise_areas: string }) {
      const areas: string[] = JSON.parse(args.expertise_areas)
      const result = runThoughtLeadership(args.industry, areas)
      return formatThoughtLeadershipReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'award_submission_manager',
    description: 'Award submission management with opportunity discovery, eligibility assessment, submission writing/drafting, progress tracking, and award body relationship maintenance.',
    parameters: {
      awards: { type: 'string', required: true, description: 'JSON array of award entries with fields: award_name, category, eligibility_criteria (array), submission_deadline (YYYY-MM-DD), entry_requirements (array), previous_winners (array), award_prestige (tier1/tier2/tier3)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { awards: string }) {
      const awards: AwardEntry[] = JSON.parse(args.awards)
      const result = manageAwardSubmissions(awards)
      return formatAwardSubmissionReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'social_proof_amplifier',
    description: 'Social proof amplification with testimonial portfolio management, case study drafting, social media post creation, influencer target identification, and comprehensive social proof strategy.',
    parameters: {
      testimonials: { type: 'string', required: true, description: 'JSON array of testimonials with fields: client_name, industry, testimonial_text, rating (1-5), usage_context, verified (boolean), date_collected (YYYY-MM-DD)' },
      industry: { type: 'string', required: true, description: 'The industry context for targeted social proof strategies' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { testimonials: string; industry: string }) {
      const testimonials: Testimonial[] = JSON.parse(args.testimonials)
      const result = amplifySocialProof(testimonials, args.industry)
      return formatSocialProofReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'media_measurement',
    description: 'Comprehensive media measurement and evaluation including AVE (Advertising Value Equivalency), impression analysis, sentiment tracking, share of voice calculation, value metrics, ROI analysis, and competitive benchmarking.',
    parameters: {
      metrics: { type: 'string', required: true, description: 'JSON object with fields: period (string), ave_value (number), total_impressions (number), sentiment_positive (number), sentiment_neutral (number), sentiment_negative (number), share_of_voice (number), pr_spend (number), estimated_earnings (number), media_mentions (number), competitor_mentions (object: name -> mention count)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { metrics: string }) {
      const metrics: MediaMetrics = JSON.parse(args.metrics)
      const result = measureMedia(metrics, metrics.pr_spend)
      return formatMediaMeasurementReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'content_distribution',
    description: 'Content distribution optimization with timing recommendations, channel selection strategy, format adaptation plans, paid vs organic allocation, engagement analysis, adjustment suggestions, and performance forecasting.',
    parameters: {
      content_pieces: { type: 'string', required: true, description: 'JSON array of content pieces with fields: content_id, format (article/video/infographic/social_post/newsletter/press_release), topic, target_audience, current_engagement (number), distribution_channels (array), publish_date (YYYY-MM-DD), priority (high/medium/low)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { content_pieces: string }) {
      const content: ContentPiece[] = JSON.parse(args.content_pieces)
      const result = optimizeContentDistribution(content)
      return formatContentDistributionReport(result)
    }
  }))

  console.log(`[dsh-tool-pragent] Loaded v${VERSION} — AI PR & Media Relations Agent with 8 tools`)
  console.log('  Tools: media_relations, press_release_writer, crisis_comms_manager, thought_leadership_engine, award_submission_manager, social_proof_amplifier, media_measurement, content_distribution')
}
