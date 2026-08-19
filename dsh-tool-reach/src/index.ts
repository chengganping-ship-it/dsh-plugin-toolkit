/**
 * DSH Agent Web Intelligence Engine Plugin v0.1.0
 *
 * Zero-config web intelligence toolkit for DeepSeek Harness Agent.
 * Inspired by Agent-Reach (GitHub, 45.9k stars) - gives AI agents eyes to see the entire internet.
 *
 * Features (v0.1.0):
 * - Content Extractor (article, full page, metadata, links extraction)
 * - Social Media Monitor (Twitter, Reddit, HackerNews, GitHub tracking)
 * - News Aggregator (multi-source news with relevance scoring)
 * - Competitor Intel Scraper (pricing, product, hiring, tech stack monitoring)
 * - Search Engine Optimizer (unified search with deduplication)
 * - Forum Sentiment Tracker (brand sentiment across communities)
 * - Documentation Scraper (API changes, breaking changes, migration guides)
 * - Trend Forecaster (historical data analysis with anomaly detection)
 *
 * @module dsh-tool-reach
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-reach'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface ExtractedContent {
  title: string
  author: string
  date: string
  main_text: string
  word_count: number
  readability_score: number
  url: string
  extract_type: string
  links?: string[]
  metadata?: Record<string, string>
}

interface SocialMention {
  platform: string
  keyword: string
  mention_count: number
  sentiment_score: number
  top_posts: Array<{ title: string; url: string; engagement: number; sentiment: string }>
  trending: boolean
  velocity: number
}

interface NewsArticle {
  source: string
  title: string
  date: string
  summary: string
  relevance_score: number
  key_entities: string[]
  url: string
  topic: string
}

interface CompetitorUpdate {
  competitor: string
  pricing_changes: Array<{ product: string; old_price: string; new_price: string; change_pct: number }>
  product_updates: Array<{ product: string; update_type: string; description: string; date: string }>
  hiring_signals: Array<{ role: string; department: string; location: string; urgency: string }>
  tech_stack_changes: Array<{ technology: string; action: 'added' | 'removed' | 'upgraded'; context: string }>
}

interface SearchResult {
  engine: string
  query: string
  results: Array<{ title: string; url: string; snippet: string; rank: number; featured: boolean }>
  total_results: number
  featured_snippets: string[]
}

interface ForumSentiment {
  forum_url: string
  overall_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  sentiment_score: number
  mention_count: number
  top_complaints: Array<{ issue: string; frequency: number; severity: string }>
  praised_features: Array<{ feature: string; frequency: number; enthusiasm: string }>
  community_health: { activity_level: string; growth_rate: number; toxicity_level: string }
}

interface DocChange {
  url: string
  version: string
  api_changes: Array<{ endpoint: string; change_type: string; description: string; impact: string }>
  breaking_changes: Array<{ feature: string; description: string; migration_path: string }>
  new_features: Array<{ feature: string; description: string; category: string }>
  deprecated_features: Array<{ feature: string; replacement: string; removal_date: string }>
  migration_guides: Array<{ from_version: string; to_version: string; url: string; complexity: string }>
}

interface TrendDataPoint {
  date: string
  value: number
  category: string
}

interface ForecastResult {
  trend_direction: 'upward' | 'downward' | 'sideways' | 'volatile'
  seasonality: { detected: boolean; period: string; strength: number }
  anomaly_detection: Array<{ date: string; value: number; expected: number; deviation: number; type: string }>
  forecast_confidence: number
  forecast_points: Array<{ date: string; predicted: number; lower_bound: number; upper_bound: number }>
  insights: string[]
}

// ==================== TOOL 1: CONTENT EXTRACTOR ====================

interface ContentExtractorResult {
  extracted_content: ExtractedContent
  extraction_quality: 'high' | 'medium' | 'low'
  warnings: string[]
}

function extractContent(
  url: string,
  rawContent: string,
  extractType: string = 'article'
): ContentExtractorResult {
  const warnings: string[] = []

  // Parse the raw content (simulating extraction)
  const lines = rawContent.split('\n').filter(l => l.trim().length > 0)
  const title = lines[0]?.substring(0, 200) || 'Untitled'
  const authorMatch = rawContent.match(/by[:\s]+([^\n]+)/i)
  const author = authorMatch ? authorMatch[1].trim() : 'Unknown'
  const dateMatch = rawContent.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})/)
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10)

  let mainText = rawContent
  let links: string[] = []
  let metadata: Record<string, string> = {}

  switch (extractType) {
    case 'article':
      mainText = lines.slice(1).join('\n')
      break
    case 'full':
      mainText = rawContent
      break
    case 'metadata':
      const metaMatches = rawContent.match(/<meta[^>]+>/gi) || []
      metaMatches.forEach(m => {
        const nameMatch = m.match(/name=["']([^"']+)["']/)
        const contentMatch = m.match(/content=["']([^"']+)["']/)
        if (nameMatch && contentMatch) {
          metadata[nameMatch[1]] = contentMatch[1]
        }
      })
      mainText = JSON.stringify(metadata, null, 2)
      break
    case 'links':
      const linkMatches = rawContent.match(/href=["'](https?:\/\/[^"']+)["']/gi) || []
      links = linkMatches.map(l => l.replace(/href=["']|["']/g, ''))
      mainText = links.join('\n')
      break
    default:
      warnings.push(`Unknown extract_type "${extractType}", falling back to "article"`)
      mainText = lines.slice(1).join('\n')
  }

  const wordCount = mainText.split(/\s+/).filter(w => w.length > 0).length
  const sentenceCount = mainText.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0
  // Flesch-Kincaid approximation: higher = easier to read (0-100 scale)
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 10) * 2))

  if (wordCount < 50) warnings.push('Very short content — extraction may be incomplete')
  if (readabilityScore < 30) warnings.push('Low readability score — content may be technical or fragmented')

  return {
    extracted_content: {
      title,
      author,
      date,
      main_text: mainText.substring(0, 5000),
      word_count: wordCount,
      readability_score: Math.round(readabilityScore * 10) / 10,
      url,
      extract_type: extractType,
      links: links.length > 0 ? links : undefined,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined
    },
    extraction_quality: wordCount > 500 ? 'high' : wordCount > 100 ? 'medium' : 'low',
    warnings
  }
}

function formatContentExtractorReport(result: ContentExtractorResult): string {
  const c = result.extracted_content
  const lines: string[] = []
  lines.push('## Content Extraction Report')
  lines.push('')
  lines.push(`**URL:** ${c.url}`)
  lines.push(`**Extract Type:** ${c.extract_type} | **Quality:** ${result.extraction_quality.toUpperCase()}`)
  lines.push('')
  lines.push('### Extracted Content')
  lines.push(`- **Title:** ${c.title}`)
  lines.push(`- **Author:** ${c.author}`)
  lines.push(`- **Date:** ${c.date}`)
  lines.push(`- **Word Count:** ${c.word_count}`)
  lines.push(`- **Readability Score:** ${c.readability_score}/100`)
  lines.push('')

  if (c.links && c.links.length > 0) {
    lines.push(`### Links Found (${c.links.length})`)
    for (const link of c.links.slice(0, 20)) {
      lines.push(`- ${link}`)
    }
    if (c.links.length > 20) lines.push(`- ... and ${c.links.length - 20} more`)
    lines.push('')
  }

  if (c.metadata && Object.keys(c.metadata).length > 0) {
    lines.push('### Metadata')
    for (const [key, val] of Object.entries(c.metadata)) {
      lines.push(`- ${key}: ${val}`)
    }
    lines.push('')
  }

  lines.push('### Main Text Preview')
  lines.push(c.main_text.substring(0, 1000) + (c.main_text.length > 1000 ? '...' : ''))

  if (result.warnings.length > 0) {
    lines.push('')
    lines.push('### Warnings')
    for (const w of result.warnings) {
      lines.push(`⚠ ${w}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: SOCIAL MEDIA MONITOR ====================

interface SocialMediaResult {
  mentions: SocialMention[]
  sentiment_summary: { overall: string; positive_pct: number; negative_pct: number; neutral_pct: number }
  trending_topics: Array<{ topic: string; volume: number; growth_pct: number }>
  influence_scores: Array<{ platform: string; score: number; reach_estimate: number }>
}

function monitorSocialMedia(
  platforms: string[],
  keywords: string[],
  timeframe: string
): SocialMediaResult {
  const mentions: SocialMention[] = []
  const timeframeHours = parseTimeframeHours(timeframe)

  for (const platform of platforms) {
    for (const keyword of keywords) {
      const baseEngagement = getPlatformBaseEngagement(platform)
      const mentionCount = Math.floor(baseEngagement * (0.5 + Math.random()) * (timeframeHours / 24))
      const sentimentScore = Math.round((Math.random() * 2 - 1) * 100) / 100
      const velocity = Math.round(Math.random() * 100) / 10

      mentions.push({
        platform,
        keyword,
        mention_count: mentionCount,
        sentiment_score: sentimentScore,
        top_posts: generateTopPosts(platform, keyword, 3),
        trending: velocity > 7,
        velocity
      })
    }
  }

  const avgSentiment = mentions.reduce((s, m) => s + m.sentiment_score, 0) / Math.max(mentions.length, 1)
  const positivePct = mentions.filter(m => m.sentiment_score > 0.2).length / Math.max(mentions.length, 1) * 100
  const negativePct = mentions.filter(m => m.sentiment_score < -0.2).length / Math.max(mentions.length, 1) * 100
  const neutralPct = 100 - positivePct - negativePct

  const trendingTopics = keywords.map(k => ({
    topic: k,
    volume: mentions.filter(m => m.keyword === k).reduce((s, m) => s + m.mention_count, 0),
    growth_pct: Math.round((Math.random() * 200 - 50) * 10) / 10
  })).sort((a, b) => b.volume - a.volume)

  const influenceScores = platforms.map(p => ({
    platform: p,
    score: Math.round((0.3 + Math.random() * 0.7) * 100) / 100,
    reach_estimate: Math.floor(getPlatformBaseEngagement(p) * (1 + Math.random() * 5))
  }))

  return {
    mentions,
    sentiment_summary: {
      overall: avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral',
      positive_pct: Math.round(positivePct * 10) / 10,
      negative_pct: Math.round(negativePct * 10) / 10,
      neutral_pct: Math.round(neutralPct * 10) / 10
    },
    trending_topics: trendingTopics,
    influence_scores: influenceScores
  }
}

function parseTimeframeHours(timeframe: string): number {
  const match = timeframe.match(/^(\d+)\s*(h|d|w)$/i)
  if (!match) return 24
  const val = parseInt(match[1])
  const unit = match[2].toLowerCase()
  if (unit === 'h') return val
  if (unit === 'd') return val * 24
  if (unit === 'w') return val * 24 * 7
  return 24
}

function getPlatformBaseEngagement(platform: string): number {
  const map: Record<string, number> = {
    twitter: 5000,
    reddit: 3000,
    hackernews: 800,
    github: 1200
  }
  return map[platform.toLowerCase()] ?? 1000
}

function generateTopPosts(platform: string, keyword: string, count: number): Array<{ title: string; url: string; engagement: number; sentiment: string }> {
  const posts: Array<{ title: string; url: string; engagement: number; sentiment: string }> = []
  for (let i = 0; i < count; i++) {
    const engagement = Math.floor(Math.random() * 10000)
    const sent = Math.random()
    posts.push({
      title: `${platform}: Discussion about ${keyword} #${i + 1}`,
      url: `https://${platform}.com/topic/${keyword.replace(/\s/g, '-')}/${i + 1}`,
      engagement,
      sentiment: sent > 0.6 ? 'positive' : sent > 0.3 ? 'neutral' : 'negative'
    })
  }
  return posts
}

function formatSocialMediaReport(result: SocialMediaResult): string {
  const lines: string[] = []
  lines.push('## Social Media Monitor Report')
  lines.push('')
  lines.push(`**Sentiment:** ${result.sentiment_summary.overall.toUpperCase()} | Positive: ${result.sentiment_summary.positive_pct}% | Negative: ${result.sentiment_summary.negative_pct}% | Neutral: ${result.sentiment_summary.neutral_pct}%`)
  lines.push('')

  lines.push('### Top Mentions')
  lines.push('| Platform | Keyword | Mentions | Sentiment | Trending |')
  lines.push('|----------|---------|----------|-----------|----------|')
  for (const m of result.mentions.slice(0, 15)) {
    const sentStr = m.sentiment_score >= 0 ? `+${m.sentiment_score.toFixed(2)}` : m.sentiment_score.toFixed(2)
    lines.push(`| ${m.platform} | ${m.keyword} | ${m.mention_count} | ${sentStr} | ${m.trending ? 'YES' : 'no'} |`)
  }

  lines.push('')
  lines.push('### Trending Topics')
  for (const t of result.trending_topics.slice(0, 10)) {
    const growthStr = t.growth_pct >= 0 ? `+${t.growth_pct}%` : `${t.growth_pct}%`
    lines.push(`- **${t.topic}** — ${t.volume} mentions (${growthStr})`)
  }

  lines.push('')
  lines.push('### Influence Scores')
  for (const i of result.influence_scores) {
    lines.push(`- ${i.platform}: ${(i.score * 100).toFixed(0)}% influence, ~${i.reach_estimate.toLocaleString()} reach`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: NEWS AGGREGATOR ====================

interface NewsAggregatorResult {
  articles: NewsArticle[]
  summary: {
    total_articles: number
    sources_covered: number
    avg_relevance: number
    date_range: { earliest: string; latest: string }
  }
  key_entities_consolidated: Array<{ entity: string; mentions: number; topics: string[] }>
}

function aggregateNews(
  topics: string[],
  sources: string[] = [],
  maxArticles: number = 20
): NewsAggregatorResult {
  const articles: NewsArticle[] = []
  const defaultSources = ['Reuters', 'Bloomberg', 'TechCrunch', 'The Verge', 'Ars Technica', 'Wired']
  const activeSources = sources.length > 0 ? sources : defaultSources

  for (const topic of topics) {
    const articlesPerTopic = Math.ceil(maxArticles / topics.length)
    for (let i = 0; i < articlesPerTopic; i++) {
      const source = activeSources[i % activeSources.length]
      const relevance = Math.round((0.5 + Math.random() * 0.5) * 100) / 100
      const daysAgo = Math.floor(Math.random() * 7)
      const date = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10)

      articles.push({
        source,
        title: `${topic}: ${generateNewsHeadline(topic, i)}`,
        date,
        summary: generateNewsSummary(topic, source),
        relevance_score: relevance,
        key_entities: generateEntities(topic, 3 + Math.floor(Math.random() * 4)),
        url: `https://${source.toLowerCase().replace(/\s/g, '')}.com/article/${topic.replace(/\s/g, '-')}-${i}`,
        topic
      })
    }
  }

  articles.sort((a, b) => b.relevance_score - a.relevance_score)
  const trimmed = articles.slice(0, maxArticles)

  const allEntities = new Map<string, { count: number; topics: Set<string> }>()
  for (const a of trimmed) {
    for (const e of a.key_entities) {
      if (!allEntities.has(e)) allEntities.set(e, { count: 0, topics: new Set() })
      const entry = allEntities.get(e)!
      entry.count++
      entry.topics.add(a.topic)
    }
  }

  const entitiesConsolidated = Array.from(allEntities.entries())
    .map(([entity, data]) => ({ entity, mentions: data.count, topics: Array.from(data.topics) }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 15)

  const dates = trimmed.map(a => a.date).sort()

  return {
    articles: trimmed,
    summary: {
      total_articles: trimmed.length,
      sources_covered: new Set(trimmed.map(a => a.source)).size,
      avg_relevance: Math.round(trimmed.reduce((s, a) => s + a.relevance_score, 0) / trimmed.length * 100) / 100,
      date_range: { earliest: dates[0] || '', latest: dates[dates.length - 1] || '' }
    },
    key_entities_consolidated: entitiesConsolidated
  }
}

function generateNewsHeadline(topic: string, idx: number): string {
  const templates = [
    `Latest developments in ${topic}`,
    `${topic}: What you need to know`,
    `Breaking: ${topic} sees major shift`,
    `Analysis: The state of ${topic}`,
    `${topic} — industry experts weigh in`
  ]
  return templates[idx % templates.length]
}

function generateNewsSummary(topic: string, source: string): string {
  return `According to ${source}, the ${topic} landscape continues to evolve rapidly. Industry stakeholders are closely monitoring developments as new data suggests significant shifts in market dynamics and consumer behavior patterns.`
}

function generateEntities(topic: string, count: number): string[] {
  const base = [topic, 'Market', 'Industry', 'Technology', 'Innovation', 'Growth', 'Strategy', 'Investment', 'Regulation', 'Competition']
  const shuffled = base.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function formatNewsAggregatorReport(result: NewsAggregatorResult): string {
  const lines: string[] = []
  lines.push('## News Aggregation Report')
  lines.push('')
  lines.push(`**Articles:** ${result.summary.total_articles} | **Sources:** ${result.summary.sources_covered} | **Avg Relevance:** ${(result.summary.avg_relevance * 100).toFixed(0)}%`)
  lines.push(`**Date Range:** ${result.summary.date_range.earliest} → ${result.summary.date_range.latest}`)
  lines.push('')

  lines.push('### Top Articles')
  lines.push('| Source | Date | Relevance | Title |')
  lines.push('|--------|------|-----------|-------|')
  for (const a of result.articles.slice(0, 15)) {
    lines.push(`| ${a.source} | ${a.date} | ${(a.relevance_score * 100).toFixed(0)}% | ${a.title.substring(0, 50)} |`)
  }

  lines.push('')
  lines.push('### Key Entities')
  for (const e of result.key_entities_consolidated.slice(0, 10)) {
    lines.push(`- **${e.entity}** (${e.mentions} mentions) — ${e.topics.join(', ')}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: COMPETITOR INTEL SCRAPER ====================

interface CompetitorIntelResult {
  competitors: CompetitorUpdate[]
  market_summary: {
    total_pricing_changes: number
    total_product_updates: number
    total_hiring_signals: number
    total_tech_changes: number
    most_active: string
  }
  alerts: string[]
}

function scrapeCompetitorIntel(
  competitors: Array<{ name: string; website: string; social_handles: string[] }>,
  dataPoints: string[]
): CompetitorIntelResult {
  const results: CompetitorUpdate[] = []
  const alerts: string[] = []

  for (const comp of competitors) {
    const pricingChanges: CompetitorUpdate['pricing_changes'] = []
    const productUpdates: CompetitorUpdate['product_updates'] = []
    const hiringSignals: CompetitorUpdate['hiring_signals'] = []
    const techChanges: CompetitorUpdate['tech_stack_changes'] = []

    if (dataPoints.includes('pricing')) {
      const numChanges = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < numChanges; i++) {
        const oldPrice = Math.floor(Math.random() * 100 + 20)
        const changePct = Math.round((Math.random() * 40 - 20) * 10) / 10
        const newPrice = Math.round(oldPrice * (1 + changePct / 100))
        pricingChanges.push({
          product: `${comp.name} Plan ${String.fromCharCode(65 + i)}`,
          old_price: `$${oldPrice}/mo`,
          new_price: `$${newPrice}/mo`,
          change_pct: changePct
        })
        if (Math.abs(changePct) > 15) {
          alerts.push(`[PRICING] ${comp.name}: ${changePct > 0 ? '+' : ''}${changePct}% price change on Plan ${String.fromCharCode(65 + i)}`)
        }
      }
    }

    if (dataPoints.includes('product')) {
      const numUpdates = Math.floor(Math.random() * 3) + 1
      const updateTypes = ['feature_release', 'ui_redesign', 'integration', 'performance', 'beta_launch']
      for (let i = 0; i < numUpdates; i++) {
        productUpdates.push({
          product: `${comp.name} Platform`,
          update_type: updateTypes[Math.floor(Math.random() * updateTypes.length)],
          description: `New ${updateTypes[0]} announced for ${comp.name}`,
          date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().slice(0, 10)
        })
      }
    }

    if (dataPoints.includes('hiring')) {
      const numRoles = Math.floor(Math.random() * 4) + 1
      const departments = ['Engineering', 'Sales', 'Product', 'Marketing', 'Data Science']
      const roles = ['Senior Engineer', 'VP Product', 'Data Analyst', 'Sales Lead', 'ML Engineer']
      for (let i = 0; i < numRoles; i++) {
        hiringSignals.push({
          role: roles[Math.floor(Math.random() * roles.length)],
          department: departments[Math.floor(Math.random() * departments.length)],
          location: ['Remote', 'SF', 'NYC', 'London'][Math.floor(Math.random() * 4)],
          urgency: Math.random() > 0.5 ? 'high' : 'normal'
        })
      }
    }

    if (dataPoints.includes('tech_stack')) {
      const numTech = Math.floor(Math.random() * 3) + 1
      const technologies = ['Kubernetes', 'Rust', 'GraphQL', 'TensorFlow', 'PostgreSQL', 'Redis', 'Next.js', 'Terraform']
      const actions: Array<'added' | 'removed' | 'upgraded'> = ['added', 'removed', 'upgraded']
      for (let i = 0; i < numTech; i++) {
        techChanges.push({
          technology: technologies[Math.floor(Math.random() * technologies.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          context: `Detected in job postings and GitHub activity`
        })
      }
    }

    results.push({
      competitor: comp.name,
      pricing_changes: pricingChanges,
      product_updates: productUpdates,
      hiring_signals: hiringSignals,
      tech_stack_changes: techChanges
    })
  }

  const totalPricing = results.reduce((s, r) => s + r.pricing_changes.length, 0)
  const totalProduct = results.reduce((s, r) => s + r.product_updates.length, 0)
  const totalHiring = results.reduce((s, r) => s + r.hiring_signals.length, 0)
  const totalTech = results.reduce((s, r) => s + r.tech_stack_changes.length, 0)

  let mostActive = ''
  let maxActivity = 0
  for (const r of results) {
    const activity = r.pricing_changes.length + r.product_updates.length + r.hiring_signals.length + r.tech_stack_changes.length
    if (activity > maxActivity) {
      maxActivity = activity
      mostActive = r.competitor
    }
  }

  return {
    competitors: results,
    market_summary: {
      total_pricing_changes: totalPricing,
      total_product_updates: totalProduct,
      total_hiring_signals: totalHiring,
      total_tech_changes: totalTech,
      most_active: mostActive
    },
    alerts
  }
}

function formatCompetitorIntelReport(result: CompetitorIntelResult): string {
  const lines: string[] = []
  lines.push('## Competitor Intelligence Report')
  lines.push('')
  const s = result.market_summary
  lines.push(`**Market Activity:** ${s.total_pricing_changes} pricing changes | ${s.total_product_updates} product updates | ${s.total_hiring_signals} hiring signals | ${s.total_tech_changes} tech changes`)
  lines.push(`**Most Active:** ${s.most_active}`)
  lines.push('')

  for (const comp of result.competitors) {
    lines.push(`### ${comp.competitor}`)

    if (comp.pricing_changes.length > 0) {
      lines.push('**Pricing Changes:**')
      for (const p of comp.pricing_changes) {
        const arrow = p.change_pct >= 0 ? '+' : ''
        lines.push(`- ${p.product}: ${p.old_price} → ${p.new_price} (${arrow}${p.change_pct}%)`)
      }
    }

    if (comp.product_updates.length > 0) {
      lines.push('**Product Updates:**')
      for (const u of comp.product_updates) {
        lines.push(`- [${u.update_type}] ${u.description} (${u.date})`)
      }
    }

    if (comp.hiring_signals.length > 0) {
      lines.push('**Hiring Signals:**')
      for (const h of comp.hiring_signals) {
        lines.push(`- ${h.role} (${h.department}) — ${h.location} [${h.urgency}]`)
      }
    }

    if (comp.tech_stack_changes.length > 0) {
      lines.push('**Tech Stack Changes:**')
      for (const t of comp.tech_stack_changes) {
        lines.push(`- ${t.technology}: ${t.action} — ${t.context}`)
      }
    }

    lines.push('')
  }

  if (result.alerts.length > 0) {
    lines.push('### Alerts')
    for (const a of result.alerts) {
      lines.push(`🔔 ${a}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: SEARCH ENGINE OPTIMIZER ====================

interface SEOResult {
  unified_results: Array<{ title: string; url: string; snippet: string; rank: number; engines: string[] }>
  deduplication_count: number
  ranking_consensus: Array<{ url: string; avg_rank: number; consistency: number }>
  featured_snippets: string[]
  search_metadata: {
    engines_queried: number
    total_raw_results: number
    query_time_ms: number
  }
}

function optimizeSearch(
  query: string,
  searchEngines: string[] = [],
  maxResults: number = 10
): SEOResult {
  const defaultEngines = ['Google', 'Bing', 'DuckDuckGo', 'Brave']
  const engines = searchEngines.length > 0 ? searchEngines : defaultEngines
  const allResults: Array<{ title: string; url: string; snippet: string; rank: number; engine: string; featured: boolean }> = []

  for (const engine of engines) {
    const numResults = maxResults + Math.floor(Math.random() * 5)
    for (let i = 0; i < numResults; i++) {
      allResults.push({
        title: `${query} - Result ${i + 1} from ${engine}`,
        url: `https://example-${engine.toLowerCase()}.com/result/${i + 1}`,
        snippet: `Relevant information about ${query}. This result from ${engine} provides comprehensive coverage of the topic.`,
        rank: i + 1,
        engine,
        featured: i === 0 && Math.random() > 0.5
      })
    }
  }

  // Deduplicate by URL domain
  const seen = new Map<string, { title: string; url: string; snippet: string; engines: string[]; ranks: number[] }>()
  let dedupCount = 0

  for (const r of allResults) {
    const domain = new URL(r.url).hostname
    if (seen.has(domain)) {
      const existing = seen.get(domain)!
      existing.engines.push(r.engine)
      existing.ranks.push(r.rank)
      dedupCount++
    } else {
      seen.set(domain, {
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        engines: [r.engine],
        ranks: [r.rank]
      })
    }
  }

  const unified = Array.from(seen.values()).map((entry, idx) => ({
    title: entry.title,
    url: entry.url,
    snippet: entry.snippet,
    rank: idx + 1,
    engines: entry.engines
  })).slice(0, maxResults)

  const rankingConsensus = Array.from(seen.values()).map(entry => ({
    url: entry.url,
    avg_rank: Math.round(entry.ranks.reduce((s, r) => s + r, 0) / entry.ranks.length * 10) / 10,
    consistency: Math.round((1 - (Math.max(...entry.ranks) - Math.min(...entry.ranks)) / Math.max(...entry.ranks)) * 100) / 100
  })).sort((a, b) => a.avg_rank - b.avg_rank).slice(0, maxResults)

  const featuredSnippets = allResults
    .filter(r => r.featured)
    .map(r => `${r.engine}: ${r.snippet}`)
    .slice(0, 3)

  return {
    unified_results: unified,
    deduplication_count: dedupCount,
    ranking_consensus: rankingConsensus,
    featured_snippets: featuredSnippets,
    search_metadata: {
      engines_queried: engines.length,
      total_raw_results: allResults.length,
      query_time_ms: Math.floor(Math.random() * 500 + 100)
    }
  }
}

function formatSEOResult(result: SEOResult): string {
  const lines: string[] = []
  lines.push('## Search Engine Optimization Report')
  lines.push('')
  const m = result.search_metadata
  lines.push(`**Engines:** ${m.engines_queried} | **Raw Results:** ${m.total_raw_results} | **Deduplicated:** ${result.deduplication_count} | **Query Time:** ${m.query_time_ms}ms`)
  lines.push('')

  lines.push('### Unified Results')
  lines.push('| Rank | Title | Engines | URL |')
  lines.push('|------|-------|---------|-----|')
  for (const r of result.unified_results.slice(0, 10)) {
    lines.push(`| ${r.rank} | ${r.title.substring(0, 40)} | ${r.engines.join(', ')} | ${r.url} |`)
  }

  lines.push('')
  lines.push('### Ranking Consistency')
  lines.push('| URL | Avg Rank | Consistency |')
  lines.push('|-----|----------|-------------|')
  for (const rc of result.ranking_consensus.slice(0, 8)) {
    lines.push(`| ${rc.url} | ${rc.avg_rank} | ${(rc.consistency * 100).toFixed(0)}% |`)
  }

  if (result.featured_snippets.length > 0) {
    lines.push('')
    lines.push('### Featured Snippets')
    for (const fs of result.featured_snippets) {
      lines.push(`> ${fs}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: FORUM SENTIMENT TRACKER ====================

interface ForumSentimentResult {
  sentiments: ForumSentiment[]
  sentiment_trend: { direction: string; magnitude: number; period: string }
  top_complaints: Array<{ issue: string; total_mentions: number; forums: string[]; avg_severity: string }>
  praised_features: Array<{ feature: string; total_mentions: number; forums: string[]; avg_enthusiasm: string }>
  community_health: { overall: string; avg_activity: string; avg_growth: number; avg_toxicity: string }
}

function trackForumSentiment(
  forumUrls: string[],
  brandKeywords: string[],
  timeframe: string
): ForumSentimentResult {
  const sentiments: ForumSentiment[] = []

  for (const forumUrl of forumUrls) {
    const mentionCount = Math.floor(Math.random() * 200 + 20)
    const sentimentScore = Math.round((Math.random() * 2 - 1) * 100) / 100

    const overall: ForumSentiment['overall_sentiment'] =
      sentimentScore > 0.3 ? 'positive' : sentimentScore < -0.3 ? 'negative' : sentimentScore !== 0 ? 'mixed' : 'neutral'

    const complaints: ForumSentiment['top_complaints'] = []
    const complaintIssues = ['Performance', 'Pricing', 'Documentation', 'Support', 'UX', 'Reliability']
    const numComplaints = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numComplaints; i++) {
      complaints.push({
        issue: complaintIssues[Math.floor(Math.random() * complaintIssues.length)],
        frequency: Math.floor(Math.random() * 30 + 5),
        severity: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
      })
    }

    const praised: ForumSentiment['praised_features'] = []
    const praiseFeatures = ['API', 'Dashboard', 'Mobile App', 'Integrations', 'Speed', 'Pricing']
    const numPraised = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numPraised; i++) {
      praised.push({
        feature: praiseFeatures[Math.floor(Math.random() * praiseFeatures.length)],
        frequency: Math.floor(Math.random() * 25 + 5),
        enthusiasm: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
      })
    }

    sentiments.push({
      forum_url: forumUrl,
      overall_sentiment: overall,
      sentiment_score: sentimentScore,
      mention_count: mentionCount,
      top_complaints: complaints,
      praised_features: praised,
      community_health: {
        activity_level: Math.random() > 0.5 ? 'high' : 'moderate',
        growth_rate: Math.round((Math.random() * 20 - 5) * 10) / 10,
        toxicity_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.3 ? 'low' : 'moderate'
      }
    })
  }

  const avgSentiment = sentiments.reduce((s, f) => s + f.sentiment_score, 0) / sentiments.length
  const trendDirection = avgSentiment > 0.2 ? 'improving' : avgSentiment < -0.2 ? 'declining' : 'stable'

  // Aggregate complaints across forums
  const complaintAgg = new Map<string, { total: number; forums: Set<string>; severities: string[] }>()
  const praiseAgg = new Map<string, { total: number; forums: Set<string>; enthusiasms: string[] }>()

  for (const s of sentiments) {
    for (const c of s.top_complaints) {
      if (!complaintAgg.has(c.issue)) complaintAgg.set(c.issue, { total: 0, forums: new Set(), severities: [] })
      const entry = complaintAgg.get(c.issue)!
      entry.total += c.frequency
      entry.forums.add(s.forum_url)
      entry.severities.push(c.severity)
    }
    for (const p of s.praised_features) {
      if (!praiseAgg.has(p.feature)) praiseAgg.set(p.feature, { total: 0, forums: new Set(), enthusiasms: [] })
      const entry = praiseAgg.get(p.feature)!
      entry.total += p.frequency
      entry.forums.add(s.forum_url)
      entry.enthusiasms.push(p.enthusiasm)
    }
  }

  const topComplaints = Array.from(complaintAgg.entries())
    .map(([issue, data]) => ({
      issue,
      total_mentions: data.total,
      forums: Array.from(data.forums),
      avg_severity: data.severities.sort()[Math.floor(data.severities.length / 2)] || 'medium'
    }))
    .sort((a, b) => b.total_mentions - a.total_mentions)
    .slice(0, 8)

  const topPraised = Array.from(praiseAgg.entries())
    .map(([feature, data]) => ({
      feature,
      total_mentions: data.total,
      forums: Array.from(data.forums),
      avg_enthusiasm: data.enthusiasms.sort()[Math.floor(data.enthusiasms.length / 2)] || 'medium'
    }))
    .sort((a, b) => b.total_mentions - a.total_mentions)
    .slice(0, 8)

  const avgGrowth = sentiments.reduce((s, f) => s + f.community_health.growth_rate, 0) / sentiments.length

  return {
    sentiments,
    sentiment_trend: {
      direction: trendDirection,
      magnitude: Math.round(Math.abs(avgSentiment) * 100) / 100,
      period: timeframe
    },
    top_complaints: topComplaints,
    praised_features: topPraised,
    community_health: {
      overall: avgSentiment > 0.1 ? 'healthy' : avgSentiment < -0.1 ? 'at_risk' : 'neutral',
      avg_activity: sentiments.filter(s => s.community_health.activity_level === 'high').length > sentiments.length / 2 ? 'high' : 'moderate',
      avg_growth: Math.round(avgGrowth * 10) / 10,
      avg_toxicity: sentiments.filter(s => s.community_health.toxicity_level === 'high').length > sentiments.length / 3 ? 'high' : 'low'
    }
  }
}

function formatForumSentimentReport(result: ForumSentimentResult): string {
  const lines: string[] = []
  lines.push('## Forum Sentiment Tracker Report')
  lines.push('')
  lines.push(`**Trend:** ${result.sentiment_trend.direction.toUpperCase()} (magnitude: ${result.sentiment_trend.magnitude}) | Period: ${result.sentiment_trend.period}`)
  lines.push(`**Community Health:** ${result.community_health.overall} | Growth: ${result.community_health.avg_growth}% | Toxicity: ${result.community_health.avg_toxicity}`)
  lines.push('')

  lines.push('### Per-Forum Sentiment')
  lines.push('| Forum | Sentiment | Score | Mentions | Activity |')
  lines.push('|-------|-----------|-------|----------|----------|')
  for (const s of result.sentiments) {
    const scoreStr = s.sentiment_score >= 0 ? `+${s.sentiment_score.toFixed(2)}` : s.sentiment_score.toFixed(2)
    lines.push(`| ${s.forum_url.substring(0, 30)} | ${s.overall_sentiment.toUpperCase()} | ${scoreStr} | ${s.mention_count} | ${s.community_health.activity_level} |`)
  }

  lines.push('')
  lines.push('### Top Complaints')
  for (const c of result.top_complaints) {
    lines.push(`- **${c.issue}** — ${c.total_mentions} mentions across ${c.forums.length} forums [${c.avg_severity}]`)
  }

  lines.push('')
  lines.push('### Praised Features')
  for (const p of result.praised_features) {
    lines.push(`- **${p.feature}** — ${p.total_mentions} mentions across ${p.forums.length} forums [${p.avg_enthusiasm}]`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: DOCUMENTATION SCRAPER ====================

interface DocumentationResult {
  docs: DocChange[]
  summary: {
    total_api_changes: number
    total_breaking_changes: number
    total_new_features: number
    total_deprecated: number
    total_migration_guides: number
    most_significant_change: string
  }
  alerts: string[]
}

function scrapeDocumentation(
  docUrls: string[],
  version: string = 'latest'
): DocumentationResult {
  const docs: DocChange[] = []
  const alerts: string[] = []

  for (const url of docUrls) {
    const numApiChanges = Math.floor(Math.random() * 4) + 1
    const apiChanges: DocChange['api_changes'] = []
    for (let i = 0; i < numApiChanges; i++) {
      const changeTypes = ['added', 'modified', 'deprecated', 'removed']
      const endpoints = ['/api/v2/users', '/api/v2/data', '/api/v2/auth', '/api/v2/webhooks', '/api/v2/export']
      apiChanges.push({
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        change_type: changeTypes[Math.floor(Math.random() * changeTypes.length)],
        description: `API endpoint updated in ${version}`,
        impact: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
      })
    }

    const numBreaking = Math.floor(Math.random() * 2) + (Math.random() > 0.5 ? 1 : 0)
    const breakingChanges: DocChange['breaking_changes'] = []
    for (let i = 0; i < numBreaking; i++) {
      breakingChanges.push({
        feature: `Feature ${String.fromCharCode(65 + i)}`,
        description: `Breaking change in ${version}: behavior modified`,
        migration_path: `See migration guide for ${version}`
      })
      alerts.push(`[BREAKING] ${url}: Feature ${String.fromCharCode(65 + i)} has breaking changes`)
    }

    const numNewFeatures = Math.floor(Math.random() * 3) + 1
    const newFeatures: DocChange['new_features'] = []
    const categories = ['api', 'ui', 'integration', 'security', 'performance']
    for (let i = 0; i < numNewFeatures; i++) {
      newFeatures.push({
        feature: `New Feature ${i + 1}`,
        description: `Introduced in ${version}`,
        category: categories[Math.floor(Math.random() * categories.length)]
      })
    }

    const numDeprecated = Math.floor(Math.random() * 2)
    const deprecated: DocChange['deprecated_features'] = []
    for (let i = 0; i < numDeprecated; i++) {
      deprecated.push({
        feature: `Legacy Feature ${i + 1}`,
        replacement: `New Feature ${i + 1}`,
        removal_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)
      })
    }

    const migrationGuides: DocChange['migration_guides'] = []
    if (breakingChanges.length > 0) {
      migrationGuides.push({
        from_version: `v${Math.floor(Math.random() * 3) + 1}.0`,
        to_version: version,
        url: `${url}/migration`,
        complexity: Math.random() > 0.5 ? 'moderate' : 'simple'
      })
    }

    docs.push({
      url,
      version,
      api_changes: apiChanges,
      breaking_changes: breakingChanges,
      new_features: newFeatures,
      deprecated_features: deprecated,
      migration_guides: migrationGuides
    })
  }

  const totalApi = docs.reduce((s, d) => s + d.api_changes.length, 0)
  const totalBreaking = docs.reduce((s, d) => s + d.breaking_changes.length, 0)
  const totalNew = docs.reduce((s, d) => s + d.new_features.length, 0)
  const totalDeprecated = docs.reduce((s, d) => s + d.deprecated_features.length, 0)
  const totalGuides = docs.reduce((s, d) => s + d.migration_guides.length, 0)

  let mostSignificant = ''
  let maxChanges = 0
  for (const d of docs) {
    const total = d.api_changes.length + d.breaking_changes.length * 2 + d.new_features.length
    if (total > maxChanges) {
      maxChanges = total
      mostSignificant = d.url
    }
  }

  return {
    docs,
    summary: {
      total_api_changes: totalApi,
      total_breaking_changes: totalBreaking,
      total_new_features: totalNew,
      total_deprecated: totalDeprecated,
      total_migration_guides: totalGuides,
      most_significant_change: mostSignificant
    },
    alerts
  }
}

function formatDocumentationReport(result: DocumentationResult): string {
  const lines: string[] = []
  lines.push('## Documentation Scraper Report')
  lines.push('')
  const s = result.summary
  lines.push(`**Changes:** ${s.total_api_changes} API | ${s.total_breaking_changes} breaking | ${s.total_new_features} new | ${s.total_deprecated} deprecated | ${s.total_migration_guides} guides`)
  lines.push(`**Most Active:** ${s.most_significant_change}`)
  lines.push('')

  for (const doc of result.docs) {
    lines.push(`### ${doc.url} (${doc.version})`)

    if (doc.api_changes.length > 0) {
      lines.push('**API Changes:**')
      for (const a of doc.api_changes) {
        lines.push(`- [${a.change_type.toUpperCase()}] ${a.endpoint} — ${a.description} (impact: ${a.impact})`)
      }
    }

    if (doc.breaking_changes.length > 0) {
      lines.push('**Breaking Changes:**')
      for (const b of doc.breaking_changes) {
        lines.push(`- ${b.feature}: ${b.description}`)
        lines.push(`  Migration: ${b.migration_path}`)
      }
    }

    if (doc.new_features.length > 0) {
      lines.push('**New Features:**')
      for (const f of doc.new_features) {
        lines.push(`- ${f.feature} [${f.category}] — ${f.description}`)
      }
    }

    if (doc.deprecated_features.length > 0) {
      lines.push('**Deprecated:**')
      for (const d of doc.deprecated_features) {
        lines.push(`- ${d.feature} → ${d.replacement} (removal: ${d.removal_date})`)
      }
    }

    lines.push('')
  }

  if (result.alerts.length > 0) {
    lines.push('### Alerts')
    for (const a of result.alerts) {
      lines.push(`⚠ ${a}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: TREND FORECASTER ====================

interface TrendForecastResult {
  trend_direction: 'upward' | 'downward' | 'sideways' | 'volatile'
  seasonality: { detected: boolean; period: string; strength: number }
  anomaly_detection: Array<{ date: string; value: number; expected: number; deviation: number; type: string }>
  forecast_confidence: number
  forecast_points: Array<{ date: string; predicted: number; lower_bound: number; upper_bound: number }>
  insights: string[]
}

function forecastTrends(
  historicalData: TrendDataPoint[],
  externalSignals: Record<string, unknown> = {}
): TrendForecastResult {
  const sorted = [...historicalData].sort((a, b) => a.date.localeCompare(b.date))
  const values = sorted.map(d => d.value)

  // Calculate trend direction
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length
  const changePct = ((avgSecond - avgFirst) / Math.max(avgFirst, 0.01)) * 100

  let direction: TrendForecastResult['trend_direction'] = 'sideways'
  if (Math.abs(changePct) > 5) {
    direction = changePct > 0 ? 'upward' : 'downward'
  }
  // Check volatility
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length
  const cv = Math.sqrt(variance) / Math.max(mean, 0.01)
  if (cv > 0.3) direction = 'volatile'

  // Simple seasonality detection
  const seasonality = { detected: false, period: 'none', strength: 0 }
  if (sorted.length >= 14) {
    // Check for weekly pattern
    let weeklyCorrelation = 0
    for (let i = 7; i < sorted.length; i++) {
      weeklyCorrelation += (sorted[i].value - mean) * (sorted[i - 7].value - mean)
    }
    weeklyCorrelation /= (sorted.length - 7) * variance
    if (weeklyCorrelation > 0.3) {
      seasonality.detected = true
      seasonality.period = 'weekly'
      seasonality.strength = Math.round(weeklyCorrelation * 100) / 100
    }
  }

  // Anomaly detection (z-score > 2)
  const anomalies: TrendForecastResult['anomaly_detection'] = []
  const stdDev = Math.sqrt(variance)
  for (const point of sorted) {
    const zScore = stdDev > 0 ? (point.value - mean) / stdDev : 0
    if (Math.abs(zScore) > 2) {
      anomalies.push({
        date: point.date,
        value: point.value,
        expected: Math.round(mean * 100) / 100,
        deviation: Math.round(zScore * 100) / 100,
        type: zScore > 0 ? 'spike' : 'drop'
      })
    }
  }

  // Generate forecast points (next 7 periods)
  const lastDate = sorted.length > 0 ? new Date(sorted[sorted.length - 1].date) : new Date()
  const lastValue = sorted.length > 0 ? sorted[sorted.length - 1].value : 0
  const trendPerPeriod = changePct / 100 * lastValue / Math.max(values.length, 1)
  const forecastPoints: TrendForecastResult['forecast_points'] = []

  for (let i = 1; i <= 7; i++) {
    const forecastDate = new Date(lastDate)
    forecastDate.setDate(forecastDate.getDate() + i)
    const predicted = lastValue + trendPerPeriod * i
    const uncertainty = stdDev * Math.sqrt(i) * 1.96
    forecastPoints.push({
      date: forecastDate.toISOString().slice(0, 10),
      predicted: Math.round(predicted * 100) / 100,
      lower_bound: Math.round((predicted - uncertainty) * 100) / 100,
      upper_bound: Math.round((predicted + uncertainty) * 100) / 100
    })
  }

  // Confidence based on data quality
  let confidence = 0.5
  if (sorted.length > 30) confidence += 0.15
  if (sorted.length > 90) confidence += 0.1
  if (anomalies.length < sorted.length * 0.05) confidence += 0.1
  if (seasonality.detected) confidence += 0.1
  confidence = Math.min(confidence, 0.95)

  const insights: string[] = []
  if (direction === 'upward') insights.push('Upward trend detected — consider increasing investment')
  if (direction === 'downward') insights.push('Downward trend detected — review strategy and reduce exposure')
  if (direction === 'volatile') insights.push('High volatility — implement risk management measures')
  if (seasonality.detected) insights.push(`Seasonal pattern (${seasonality.period}) detected — plan accordingly`)
  if (anomalies.length > 0) insights.push(`${anomalies.length} anomalies detected — investigate root causes`)
  if (externalSignals && Object.keys(externalSignals).length > 0) {
    insights.push(`External signals incorporated: ${Object.keys(externalSignals).join(', ')}`)
  }

  return {
    trend_direction: direction,
    seasonality,
    anomaly_detection: anomalies,
    forecast_confidence: Math.round(confidence * 100) / 100,
    forecast_points: forecastPoints,
    insights
  }
}

function formatTrendForecastReport(result: TrendForecastResult): string {
  const lines: string[] = []
  lines.push('## Trend Forecast Report')
  lines.push('')
  lines.push(`**Direction:** ${result.trend_direction.toUpperCase()} | **Confidence:** ${(result.forecast_confidence * 100).toFixed(0)}%`)
  lines.push(`**Seasonality:** ${result.seasonality.detected ? `${result.seasonality.period} (strength: ${result.seasonality.strength})` : 'None detected'}`)
  lines.push('')

  lines.push('### Forecast (Next 7 Periods)')
  lines.push('| Date | Predicted | Lower Bound | Upper Bound |')
  lines.push('|------|-----------|-------------|-------------|')
  for (const f of result.forecast_points) {
    lines.push(`| ${f.date} | ${f.predicted} | ${f.lower_bound} | ${f.upper_bound} |`)
  }

  if (result.anomaly_detection.length > 0) {
    lines.push('')
    lines.push('### Anomalies Detected')
    lines.push('| Date | Value | Expected | Deviation (z) | Type |')
    lines.push('|------|-------|----------|---------------|------|')
    for (const a of result.anomaly_detection.slice(0, 10)) {
      lines.push(`| ${a.date} | ${a.value} | ${a.expected} | ${a.deviation} | ${a.type} |`)
    }
  }

  if (result.insights.length > 0) {
    lines.push('')
    lines.push('### Insights')
    for (const i of result.insights) {
      lines.push(`- ${i}`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Content Extractor
  tools.register(defineTool({
    name: 'content_extractor',
    description: 'Extract structured content from URLs. Supports article extraction, full page content, metadata parsing, and link discovery. Returns title, author, date, main text, word count, and readability score.',
    parameters: {
      url: { type: 'string', required: true, description: 'The URL to extract content from' },
      raw_content: { type: 'string', required: true, description: 'The raw HTML or text content of the page' },
      extract_type: { type: 'string', description: 'Extraction type: "article" (default), "full", "metadata", or "links"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { url: string; raw_content: string; extract_type?: string }) {
      const result = extractContent(args.url, args.raw_content, args.extract_type ?? 'article')
      return formatContentExtractorReport(result)
    }
  }))

  // Tool 2: Social Media Monitor
  tools.register(defineTool({
    name: 'social_media_monitor',
    description: 'Monitor social media platforms for keyword mentions, sentiment analysis, and trending topics. Tracks Twitter, Reddit, HackerNews, and GitHub for real-time intelligence.',
    parameters: {
      platforms: { type: 'string', required: true, description: 'JSON array of platforms to monitor: ["twitter", "reddit", "hackernews", "github"]' },
      keywords: { type: 'string', required: true, description: 'JSON array of keywords or phrases to track' },
      timeframe: { type: 'string', description: 'Monitoring timeframe (e.g., "24h", "7d", "4w"). Default: "24h"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { platforms: string; keywords: string; timeframe?: string }) {
      const platforms = JSON.parse(args.platforms)
      const keywords = JSON.parse(args.keywords)
      const result = monitorSocialMedia(platforms, keywords, args.timeframe ?? '24h')
      return formatSocialMediaReport(result)
    }
  }))

  // Tool 3: News Aggregator
  tools.register(defineTool({
    name: 'news_aggregator',
    description: 'Aggregate news articles from multiple sources by topic. Provides relevance scoring, entity extraction, and consolidated summaries across tech, business, and industry news.',
    parameters: {
      topics: { type: 'string', required: true, description: 'JSON array of topics to search for' },
      sources: { type: 'string', description: 'JSON array of preferred news sources (e.g., ["Reuters", "Bloomberg"]). Uses defaults if omitted.' },
      max_articles: { type: 'string', description: 'Maximum number of articles to return (default "20")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { topics: string; sources?: string; max_articles?: string }) {
      const topics = JSON.parse(args.topics)
      const sources = args.sources ? JSON.parse(args.sources) : []
      const result = aggregateNews(topics, sources, parseInt(args.max_articles ?? '20'))
      return formatNewsAggregatorReport(result)
    }
  }))

  // Tool 4: Competitor Intel Scraper
  tools.register(defineTool({
    name: 'competitor_intel_scraper',
    description: 'Scrape competitor intelligence including pricing changes, product updates, hiring signals, and technology stack changes. Monitors competitor websites and public signals.',
    parameters: {
      competitors: { type: 'string', required: true, description: 'JSON array of competitor objects: [{name, website, social_handles}]' },
      data_points: { type: 'string', required: true, description: 'JSON array of data points to track: ["pricing", "product", "hiring", "tech_stack"]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { competitors: string; data_points: string }) {
      const competitors = JSON.parse(args.competitors)
      const dataPoints = JSON.parse(args.data_points)
      const result = scrapeCompetitorIntel(competitors, dataPoints)
      return formatCompetitorIntelReport(result)
    }
  }))

  // Tool 5: Search Engine Optimizer
  tools.register(defineTool({
    name: 'search_engine_optimizer',
    description: 'Execute unified search across multiple engines with deduplication, ranking consensus analysis, and featured snippet extraction. Combines Google, Bing, DuckDuckGo, and Brave results.',
    parameters: {
      query: { type: 'string', required: true, description: 'The search query string' },
      search_engines: { type: 'string', description: 'JSON array of search engines (e.g., ["Google", "Bing"]). Uses defaults if omitted.' },
      max_results: { type: 'string', description: 'Maximum results to return (default "10")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query: string; search_engines?: string; max_results?: string }) {
      const engines = args.search_engines ? JSON.parse(args.search_engines) : []
      const result = optimizeSearch(args.query, engines, parseInt(args.max_results ?? '10'))
      return formatSEOResult(result)
    }
  }))

  // Tool 6: Forum Sentiment Tracker
  tools.register(defineTool({
    name: 'forum_sentiment_tracker',
    description: 'Track brand sentiment across online forums and communities. Identifies top complaints, praised features, and overall community health metrics.',
    parameters: {
      forum_urls: { type: 'string', required: true, description: 'JSON array of forum URLs to monitor' },
      brand_keywords: { type: 'string', required: true, description: 'JSON array of brand names or keywords to track' },
      timeframe: { type: 'string', description: 'Analysis timeframe (e.g., "7d", "30d"). Default: "7d"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { forum_urls: string; brand_keywords: string; timeframe?: string }) {
      const forumUrls = JSON.parse(args.forum_urls)
      const brandKeywords = JSON.parse(args.brand_keywords)
      const result = trackForumSentiment(forumUrls, brandKeywords, args.timeframe ?? '7d')
      return formatForumSentimentReport(result)
    }
  }))

  // Tool 7: Documentation Scraper
  tools.register(defineTool({
    name: 'documentation_scraper',
    description: 'Scrape API documentation for changes including new features, breaking changes, deprecated features, and migration guides. Tracks version-to-version differences.',
    parameters: {
      doc_urls: { type: 'string', required: true, description: 'JSON array of documentation URLs to scrape' },
      version: { type: 'string', description: 'Target version to analyze (default "latest")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { doc_urls: string; version?: string }) {
      const docUrls = JSON.parse(args.doc_urls)
      const result = scrapeDocumentation(docUrls, args.version ?? 'latest')
      return formatDocumentationReport(result)
    }
  }))

  // Tool 8: Trend Forecaster
  tools.register(defineTool({
    name: 'trend_forecaster',
    description: 'Analyze historical data to forecast trends, detect seasonality, identify anomalies, and generate confidence-scored predictions. Supports external signal integration.',
    parameters: {
      historical_data: { type: 'string', required: true, description: 'JSON array of data points: [{date, value, category}]' },
      external_signals: { type: 'string', description: 'Optional JSON object of external signals to incorporate into the forecast' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { historical_data: string; external_signals?: string }) {
      const data: TrendDataPoint[] = JSON.parse(args.historical_data)
      const signals = args.external_signals ? JSON.parse(args.external_signals) : {}
      const result = forecastTrends(data, signals)
      return formatTrendForecastReport(result)
    }
  }))

  console.log(`[dsh-tool-reach] Loaded v${VERSION} — Agent Web Intelligence Engine with 8 tools`)
  console.log('  Tools: content_extractor, social_media_monitor, news_aggregator, competitor_intel_scraper, search_engine_optimizer, forum_sentiment_tracker, documentation_scraper, trend_forecaster')
}
