/**
 * DSH AI Multi-modal Content Factory Plugin v0.1.0
 *
 * Content generation, optimization, and repurposing toolkit for DeepSeek Harness Agent.
 * Designed for content creators, marketers, and social media managers.
 *
 * Features (v0.1.0):
 * - Content Brief Generator (angle, outline, keywords, tone)
 * - Image Prompt Engine (Midjourney/DALL-E optimized prompts)
 * - Video Script Writer (timed scripts with hooks, segments, CTAs)
 * - Social Media Optimizer (platform-specific versions with hashtags)
 * - SEO Content Scorer (density, readability analysis)
 * - Brand Voice Analyzer (voice consistency scoring)
 * - Content Calendar Planner (optimal scheduling with timing)
 * - Repurposing Engine (adapt content across formats)
 *
 * @module dsh-tool-amefactory
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-amefactory'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface ContentBrief {
  topic: string
  targetAudience: string
  angle: string
  outline: string[]
  keywords: string[]
  tone: string
  estimatedWordCount: number
  contentFormat: string
  competitiveNotes: string
}

interface ImagePrompt {
  basePrompt: string
  negativePrompt: string
  style: string
  aspectRatio: string
  parameters: Record<string, string>
  variations: string[]
  tips: string[]
}

interface VideoScript {
  topic: string
  totalDuration: number
  hook: string
  segments: Array<{
    title: string
    startTime: number
    endTime: number
    narration: string
    visualNotes: string
    cta?: string
  }>
  closingCta: string
  bRollSuggestions: string[]
}

interface PlatformContent {
  platform: string
  content: string
  characterCount: number
  hashtags: string[]
  bestPostTime: string
  tips: string[]
}

interface SocialMediaResult {
  platforms: PlatformContent[]
  universalHashtags: string[]
  crossPostingOrder: string[]
  summary: {
    totalPlatforms: number
    avgEngagementPotential: 'low' | 'medium' | 'high'
    topPlatform: string
  }
}

interface SEOScore {
  overallScore: number
  keywordDensity: Array<{ keyword: string; count: number; density: number; status: string }>
  readabilityScore: number
  readabilityLevel: string
  wordCount: number
  recommendations: string[]
  strengths: string[]
  warnings: string[]
}

interface BrandVoiceAnalysis {
  overallConsistency: number
  dimensions: {
    tone: { score: number; notes: string }
    vocabulary: { score: number; notes: string }
    sentenceStructure: { score: number; notes: string }
    personality: { score: number; notes: string }
  }
  deviations: string[]
  recommendations: string[]
  sampleComparisons: Array<{ sampleIdx: number; consistency: number; issue: string }>
}

interface CalendarEntry {
  date: string
  dayOfWeek: string
  topic: string
  format: string
  platform: string
  optimalPostTime: string
  status: 'draft' | 'scheduled' | 'published'
}

interface ContentCalendar {
  entries: CalendarEntry[]
  frequency: string
  summary: {
    totalEntries: number
    startDate: string
    endDate: string
    formatDistribution: Record<string, number>
    platformDistribution: Record<string, number>
  }
}

interface RepurposedContent {
  format: string
  content: string
  wordCount: number
  adaptations: string[]
  recommendedPlatform: string
  tips: string[]
}

interface RepurposingResult {
  sourceWordCount: number
  outputs: RepurposedContent[]
  summary: {
    totalFormats: number
    totalOutputWords: number
    compressionRatio: number
    recommendedSequence: string[]
  }
}

// ==================== TOOL 1: CONTENT BRIEF GENERATOR ====================

interface ContentBriefResult {
  brief: ContentBrief
}

function analyzeContentBrief(topic: string, targetAudience: string): ContentBriefResult {
  const audienceLower = targetAudience.toLowerCase()

  let angle = ''
  if (audienceLower.includes('beginner') || audienceLower.includes('starter')) {
    angle = `Beginner-friendly introduction to ${topic}, breaking down complex concepts into actionable steps`
  } else if (audienceLower.includes('expert') || audienceLower.includes('advanced') || audienceLower.includes('professional')) {
    angle = `Deep-dive analysis of ${topic} for industry professionals, covering advanced strategies and emerging trends`
  } else if (audienceLower.includes('entrepreneur') || audienceLower.includes('founder') || audienceLower.includes('business')) {
    angle = `${topic} as a growth lever for entrepreneurs and business owners, focusing on practical ROI`
  } else {
    angle = `Comprehensive ${topic} guide delivering unique value and fresh perspectives for ${targetAudience}`
  }

  const outline = [
    `Introduction: Hook the reader with the most surprising fact or pain point about ${topic}`,
    'Section 1: Problem — Define the core challenge and why it matters to the reader',
    `Section 2: Core Concepts — Explain the foundational principles of ${topic}`,
    `Section 3: Step-by-Step Framework — Provide a repeatable, actionable approach`,
    'Section 4: Real-World Examples — Case studies and concrete implementations',
    `Section 5: Common Mistakes — Pitfalls to avoid when applying ${topic}`,
    'Section 6: Action Plan — Specific next steps the reader can implement today',
    'Conclusion: Summary + Call to action'
  ]

  const keywords = [
    topic.toLowerCase(),
    `${topic.toLowerCase()} guide`,
    `${topic.toLowerCase()} for ${targetAudience.split(' ')[0].toLowerCase()}`,
    `how to ${topic.toLowerCase().includes('how to') ? topic.toLowerCase().replace('how to ', '') : topic.toLowerCase()}`,
    `best ${topic.toLowerCase()} practices`,
    `${topic.toLowerCase()} 2024`,
    `${topic.toLowerCase()} tips`,
    `${topic.toLowerCase()} strategy`
  ]

  const tone = audienceLower.includes('corporate') || audienceLower.includes('b2b')
    ? 'Professional, authoritative, and data-driven'
    : audienceLower.includes('young') || audienceLower.includes('gen z') || audienceLower.includes('teen')
    ? 'Casual, energetic, and relatable with trending references'
    : audienceLower.includes('developer') || audienceLower.includes('technical')
    ? 'Technical yet accessible, with code examples where relevant'
    : 'Conversational, insightful, and engaging'

  const estimatedWordCount = targetAudience.toLowerCase().includes('expert') ? 3000 : 1800

  const contentFormat = 'Long-form blog post / Pillar content piece'

  const competitiveNotes = `Focus on providing 10x value compared to top-ranking content. Include original data, unique frameworks, and actionable templates. Target search intent gaps identified for "${topic}".`

  return {
    brief: {
      topic,
      targetAudience,
      angle,
      outline,
      keywords,
      tone,
      estimatedWordCount,
      contentFormat,
      competitiveNotes
    }
  }
}

function formatContentBriefReport(result: ContentBriefResult): string {
  const b = result.brief
  const lines: string[] = []
  lines.push('## Content Brief')
  lines.push('')
  lines.push(`**Topic:** ${b.topic}`)
  lines.push(`**Target Audience:** ${b.targetAudience}`)
  lines.push(`**Content Format:** ${b.contentFormat}`)
  lines.push(`**Estimated Word Count:** ${b.estimatedWordCount}`)
  lines.push('')
  lines.push(`### Angle`)
  lines.push(b.angle)
  lines.push('')
  lines.push(`### Tone`)
  lines.push(b.tone)
  lines.push('')
  lines.push('### Outline')
  for (const item of b.outline) {
    lines.push(`- ${item}`)
  }
  lines.push('')
  lines.push('### Keywords')
  lines.push(b.keywords.map(k => `\`${k}\``).join(', '))
  lines.push('')
  lines.push('### Competitive Notes')
  lines.push(b.competitiveNotes)

  return lines.join('\n')
}

// ==================== TOOL 2: IMAGE PROMPT ENGINE ====================

interface ImagePromptResult {
  prompts: ImagePrompt
}

function analyzeImagePrompt(concept: string, style: string): ImagePromptResult {
  const styleLower = style.toLowerCase()

  let basePrompt = ''
  let negativePrompt = ''
  const parameters: Record<string, string> = {}
  let aspectRatio = '--ar 16:9'

  if (styleLower.includes('photorealistic') || styleLower.includes('photo') || styleLower.includes('realistic')) {
    basePrompt = `${concept}, ultra photorealistic, 8k resolution, sharp focus, professional photography, natural lighting, depth of field, editorial quality`
    negativePrompt = 'cartoon, illustration, painting, drawing, anime, sketch, low quality, blurry, deformed, watermark, text'
    parameters['--style'] = 'raw'
    parameters['--q'] = '2'
    aspectRatio = '--ar 3:2'
  } else if (styleLower.includes('digital art') || styleLower.includes('illustration') || styleLower.includes('concept art')) {
    basePrompt = `${concept}, digital illustration, vibrant colors, detailed rendering, concept art style, professional digital painting, trending on ArtStation`
    negativePrompt = 'photograph, realistic, 3d render, low quality, blurry, watermark, deformed hands'
    parameters['--style'] = 'expressive'
    parameters['--q'] = '2'
    aspectRatio = '--ar 16:9'
  } else if (styleLower.includes('anime') || styleLower.includes('manga') || styleLower.includes('japanese')) {
    basePrompt = `${concept}, anime style, detailed anime illustration, vibrant colors, clean lines, Studio Ghibli inspired, high quality`
    negativePrompt = 'photograph, realistic, western cartoon, deformed, bad anatomy, watermark'
    parameters['--niji'] = '6'
    parameters['--q'] = '2'
    aspectRatio = '--ar 2:3'
  } else if (styleLower.includes('3d') || styleLower.includes('render') || styleLower.includes('cinematic')) {
    basePrompt = `${concept}, 3D render, octane render, cinematic lighting, ray tracing, hyper-detailed, volumetric fog, Unreal Engine 5 quality`
    negativePrompt = '2d, flat, low poly, pixelated, blurry, low quality'
    parameters['--q'] = '2'
    aspectRatio = '--ar 16:9'
  } else if (styleLower.includes('watercolor') || styleLower.includes('painting') || styleLower.includes('artistic')) {
    basePrompt = `${concept}, watercolor painting, artistic brush strokes, soft colors, textured paper, fine art style, delicate details`
    negativePrompt = 'photograph, 3d, digital art, harsh lines, oversaturated, watermark'
    parameters['--style'] = 'watercolor'
    parameters['--q'] = '2'
    aspectRatio = '--ar 4:5'
  } else {
    basePrompt = `${concept}, ${style}, high quality, detailed, professional, visually striking, composition masterpiece`
    negativePrompt = 'low quality, blurry, deformed, watermark, text, signature'
    parameters['--q'] = '2'
    aspectRatio = '--ar 16:9'
  }

  const variations = [
    `${basePrompt}, golden hour lighting, warm tones`,
    `${basePrompt}, dramatic mood lighting, shadows`,
    `${basePrompt}, minimalist composition, lots of negative space`,
    `${basePrompt}, close-up detail shot, macro perspective`
  ]

  const tips = [
    'Use --chaos 0-100 to control variation in results (lower = more consistent)',
    'Add --seed <number> to reproduce a specific result across runs',
    'Include --stylize 0-1000 for artistic interpretation strength',
    'For Midjourney: use :: between prompt segments for weighted attention',
    'For DALL-E 3: be descriptive in natural language, it follows complex instructions well',
    'Always include negative prompts to exclude unwanted elements',
    'Aspect ratio matters: --ar 1:1 for social, --ar 16:9 for banners, --ar 9:16 for stories'
  ]

  return {
    prompts: {
      basePrompt,
      negativePrompt,
      style,
      aspectRatio,
      parameters,
      variations,
      tips
    }
  }
}

function formatImagePromptReport(result: ImagePromptResult): string {
  const p = result.prompts
  const lines: string[] = []
  lines.push('## Image Prompt Engine')
  lines.push('')
  lines.push(`**Style:** ${p.style}`)
  lines.push(`**Aspect Ratio:** ${p.aspectRatio}`)
  lines.push('')
  lines.push('### Base Prompt')
  lines.push('```')
  lines.push(p.basePrompt)
  lines.push('```')
  lines.push('')
  lines.push('### Negative Prompt')
  lines.push('```')
  lines.push(p.negativePrompt)
  lines.push('```')
  lines.push('')
  lines.push('### Parameters')
  for (const [k, v] of Object.entries(p.parameters)) {
    lines.push(`- \`${k} ${v}\``)
  }
  lines.push('')
  lines.push('### Variations')
  for (let i = 0; i < p.variations.length; i++) {
    lines.push(`**V${i + 1}:** ${p.variations[i]}`)
    lines.push('')
  }
  lines.push('### Tips')
  for (const tip of p.tips) {
    lines.push(`- ${tip}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: VIDEO SCRIPT WRITER ====================

interface VideoScriptResult {
  script: VideoScript
}

function analyzeVideoScript(topic: string, durationSeconds: string): VideoScriptResult {
  const duration = parseInt(durationSeconds, 10)
  const durationNum = isNaN(duration) ? 60 : duration

  const hookDuration = Math.max(3, Math.floor(durationNum * 0.1))
  const closingDuration = Math.max(5, Math.floor(durationNum * 0.1))
  const contentDuration = durationNum - hookDuration - closingDuration

  const segmentCount = durationNum <= 60 ? 3 : durationNum <= 180 ? 4 : 5
  const segmentDuration = Math.floor(contentDuration / segmentCount)

  const segments: VideoScript['segments'] = []
  for (let i = 0; i < segmentCount; i++) {
    const startTime = hookDuration + (i * segmentDuration)
    const endTime = i === segmentCount - 1 ? durationNum - closingDuration : startTime + segmentDuration
    segments.push({
      title: `Part ${i + 1}: ${i === 0 ? 'Core Concept' : i === segmentCount - 1 ? 'Application' : `Deep Dive ${i}`}`,
      startTime,
      endTime,
      narration: `[${formatTime(startTime)}-${formatTime(endTime)}] Explain the ${i === 0 ? 'fundamental idea' : i === segmentCount - 1 ? 'practical takeaway' : `key dimension ${i}`} of ${topic} with concrete examples.`,
      visualNotes: `Show ${i === 0 ? 'intro title card with bold text' : i === segmentCount - 1 ? 'summary graphic with CTA overlay' : `relevant B-roll and on-screen text highlighting key point ${i + 1}`}`,
      cta: i === segmentCount - 1 ? 'Like and subscribe for more content like this — link in description' : undefined
    })
  }

  const hook = `[0-${hookSeconds(durationNum)}s] Open with the most surprising/controversial statement about ${topic}. Make them NEED to watch until the end. Pattern interrupt: bold visual + provocative question.`

  const closingCta = `[${formatTime(durationNum - closingDuration)}-${formatTime(durationNum)}] Recap the single most important takeaway. Clear CTA: subscribe, comment, or click link. End on memorable closing line.`

  const bRollSuggestions = [
    'Close-up hand gestures while speaking',
    'Screen recordings or app demos',
    'Reaction shots and cutaway b-roll',
    'Text overlays for key statistics',
    'Location-transitions between segments'

  ]

  return {
    script: {
      topic,
      totalDuration: durationNum,
      hook: hook.split('[')[0] + '[' + hook.split('[')[1],
      segments,
      closingCta: closingCta.split(' [')[1] ? closingCta : `[${formatTime(durationNum - closingDuration)}-${formatTime(durationNum)}] ` + closingCta,
      bRollSuggestions
    }
  }
}

function hookSeconds(total: number): number {
  return Math.max(3, Math.floor(total * 0.1))
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`
}

function formatVideoScriptReport(result: VideoScriptResult): string {
  const s = result.script
  const lines: string[] = []
  lines.push('## Video Script')
  lines.push('')
  lines.push(`**Topic:** ${s.topic}`)
  lines.push(`**Total Duration:** ${formatTime(s.totalDuration)}`)
  lines.push('')
  lines.push('### Hook')
  lines.push(s.hook)
  lines.push('')
  lines.push('### Segments')
  for (const seg of s.segments) {
    lines.push(`**${seg.title}** (${formatTime(seg.startTime)} → ${formatTime(seg.endTime)})`)
    lines.push(`- Narration: ${seg.narration}`)
    lines.push(`- Visual: ${seg.visualNotes}`)
    if (seg.cta) lines.push(`- CTA: ${seg.cta}`)
    lines.push('')
  }
  lines.push('### Closing CTA')
  lines.push(s.closingCta)
  lines.push('')
  lines.push('### B-Roll Suggestions')
  for (const b of s.bRollSuggestions) {
    lines.push(`- ${b}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: SOCIAL MEDIA OPTIMIZER ====================

interface SocialMediaResultWithInput {
  result: SocialMediaResult
  inputContent: string
}

function analyzeSocialMediaOptimizer(content: string, platforms: string[]): SocialMediaResultWithInput {
  const platformConfigs: Record<string, { maxLength: number; tone: string; bestTime: string; features: string[] }> = {
    twitter: { maxLength: 280, tone: 'concise, punchy, conversational', bestTime: '8-10am, 12-1pm, 5-6pm (weekdays)', features: ['Threads for long content', 'Polls for engagement', 'Alt text for images'] },
    x: { maxLength: 280, tone: 'concise, punchy, conversational', bestTime: '8-10am, 12-1pm, 5-6pm (weekdays)', features: ['Threads for long content', 'Polls for engagement', 'Alt text for images'] },
    instagram: { maxLength: 2200, tone: 'visual-first, emoji-rich, story-driven', bestTime: '11am-1pm, 7-9pm (weekdays)', features: ['Carousel posts', 'Reels for video', 'Stories for ephemeral'] },
    linkedin: { maxLength: 3000, tone: 'professional, value-driven, thought leadership', bestTime: '7-8am, 12pm, 5-6pm (Tue-Thu)', features: ['Document posts', 'Newsletters', 'Articles'] },
    facebook: { maxLength: 63206, tone: 'community-focused, engaging, conversational', bestTime: '1-4pm (Mon-Fri), 12-1pm (Sat-Sun)', features: ['Groups', 'Live video', 'Stories'] },
    tiktok: { maxLength: 2200, tone: 'trend-aware, energetic, authentic', bestTime: '7-9am, 12-3pm, 7-11pm', features: ['Duet/Stitch', 'Trending sounds', 'Hashtag challenges'] },
    youtube: { maxLength: 5000, tone: 'SEO-optimized, descriptive, engaging', bestTime: '2-4pm (Mon-Fri), 9-11am (Sat-Sun)', features: ['Community tab', 'Shorts', 'Premieres'] },
    pinterest: { maxLength: 500, tone: 'visual, keyword-rich, pin-worthy', bestTime: '8-11pm', features: ['Idea pins', 'Rich pins', 'Board organization'] }
  }

  const platformContents: PlatformContent[] = []
  const universalHashtags: string[] = extractHashtags(content)

  for (const platform of platforms) {
    const config = platformConfigs[platform.toLowerCase()]
    if (!config) continue

    let adaptedContent = content
    const hashtags = generateHashtagsForPlatform(content, platform.toLowerCase())
    const tips: string[] = []

    if (platform.toLowerCase() === 'twitter' || platform.toLowerCase() === 'x') {
      if (content.length > 250) {
        adaptedContent = condenseForTwitter(content)
      }
      tips.push('Front-load the most compelling point')
      tips.push('Use line breaks for readability')
      tips.push('End with a question or provocative statement to drive replies')
    } else if (platform.toLowerCase() === 'instagram') {
      adaptedContent = condenseForInstagram(content)
      tips.push('Lead with a bold statement as the first line')
      tips.push('Use 3-5 relevant hashtags in first comment')
      tips.push('Include clear CTA: save, share, or comment')
    } else if (platform.toLowerCase() === 'linkedin') {
      adaptedContent = condenseForLinkedIn(content)
      tips.push('Use single-line paragraph breaks for mobile readability')
      tips.push('Tag 2-3 relevant people (with permission)')
      tips.push('Ask a question to drive comments in first hour')
    } else if (platform.toLowerCase() === 'tiktok') {
      adaptedContent = condenseForTikTok(content)
      tips.push('First 3 seconds must hook the viewer')
      tips.push('Use trending hashtags + 2 niche hashtags')
      tips.push('Include text-on-screen captions for accessibility')
    } else if (platform.toLowerCase() === 'youtube') {
      adaptedContent = condenseForYouTube(content)
      tips.push('Front-load keywords in title and first 150 characters of description')
      tips.push('Add timestamps/chapters in description')
      tips.push('Include 2-3 relevant hashtags in description')
    } else {
      tips.push('Adapt tone to platform norms')
      tips.push('Include platform-appropriate CTA')
    }

    platformContents.push({
      platform: platform.toLowerCase(),
      content: adaptedContent,
      characterCount: adaptedContent.length,
      hashtags,
      bestPostTime: config.bestTime,
      tips
    })
  }

  const allEngagement = platformContents.map(p => p.characterCount > 100 ? 'high' : 'medium')
  const highCount = allEngagement.filter(e => e === 'high').length

  return {
    result: {
      platforms: platformContents,
      universalHashtags: universalHashtags.slice(0, 5),
      crossPostingOrder: ['tiktok', 'instagram', 'twitter', 'linkedin', 'facebook']
        .filter(p => platforms.map(pl => pl.toLowerCase()).includes(p)),
      summary: {
        totalPlatforms: platformContents.length,
        avgEngagementPotential: highCount > platformContents.length / 2 ? 'high' : highCount > 0 ? 'medium' : 'low',
        topPlatform: platformContents.length > 0 ? platformContents[0].platform : 'none'
      }
    },
    inputContent: content
  }
}

function extractHashtags(content: string): string[] {
  const words = content.split(/\s+/)
  const longer = words.filter(w => w.length > 6 && /^[A-Za-z0-9]+$/.test(w))
  return [...new Set(longer)].slice(0, 8).map(w => '#' + w.charAt(0).toUpperCase() + w.slice(1))
}

function generateHashtagsForPlatform(content: string, platform: string): string[] {
  const contentHash = extractHashtags(content)

  const platformSpecific: Record<string, string[]> = {
    twitter: ['#Thread', '#Trending', '#Viral'],
    x: ['#Thread', '#Trending', '#Viral'],
    instagram: ['#InstaDaily', '#ContentCreator', '#Explore'],
    linkedin: ['#Leadership', '#Innovation', '#ThoughtLeadership'],
    facebook: ['#Community', '#Discussion'],
    tiktok: ['#FYP', '#ForYou', '#Viral'],
    youtube: ['#YouTube', '#Tutorial', '#HowTo'],
    pinterest: ['#Ideas', '#Inspiration', '#DIY']
  }

  const specific = platformSpecific[platform] || []
  return [...contentHash.slice(0, 3), ...specific].slice(0, 8)
}

function condenseForTwitter(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length <= 2) return content.trim() + ' Thread below...'
  return sentences.slice(0, 2).map(s => s.trim()).join('. ') + '.'
}

function condenseForInstagram(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length <= 4) return content.trim()
  return sentences.slice(0, 4).map(s => s.trim()).join('\n\n') + '\n\nMore in comments below.'
}

function condenseForLinkedIn(content: string): string {
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0)
  if (paragraphs.length <= 3) return content.trim()
  return paragraphs.slice(0, 3).map(p => p.trim()).join('\n\n') + '\n\n---\nAgree or disagree? Share your thoughts below.'
}

function condenseForTikTok(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length <= 2) return content.trim()
  return sentences[0].trim() + '. ' + '...watch till end for the surprising twist.'
}

function condenseForYouTube(content: string): string {
  return content.trim()
}

function formatSocialMediaOptimizerReport(result: SocialMediaResult): string {
  const lines: string[] = []
  lines.push('## Social Media Optimized Content')
  lines.push('')
  lines.push(`**Platforms:** ${result.summary.totalPlatforms} | **Engagement:** ${result.summary.avgEngagementPotential.toUpperCase()} | **Top:** ${result.summary.topPlatform}`)
  lines.push('')
  lines.push('### Universal Hashtags')
  lines.push(result.universalHashtags.join(' '))
  lines.push('')
  lines.push('### Cross-Posting Order')
  lines.push(result.crossPostingOrder.map((p, i) => `${i + 1}. ${p}`).join(' → '))
  lines.push('')

  for (const pc of result.platforms) {
    lines.push(`### ${pc.platform.toUpperCase()} (${pc.characterCount} chars)`)
    lines.push('')
    lines.push('```')
    lines.push(pc.content)
    lines.push('```')
    lines.push('')
    lines.push(`**Hashtags:** ${pc.hashtags.join(' ')}`)
    lines.push('')
    lines.push(`**Best Posting Time:** ${pc.bestPostTime}`)
    lines.push('')
    lines.push('**Tips:**')
    for (const tip of pc.tips) {
      lines.push(`- ${tip}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== TOOL 5: SEO CONTENT SCORER ====================

interface SEOResultWithInput {
  result: SEOScore
  inputContent: string
}

function analyzeSEOContent(content: string, targetKeywords: string[]): SEOResultWithInput {
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1)
  const syllables = content.split(/\s+/).filter(w => w.length > 0).reduce((sum, w) => sum + countSyllables(w), 0)
  const fleschKincaid = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * (syllables / Math.max(wordCount, 1))
  const readabilityScore = Math.max(0, Math.min(100, fleschKincaid))

  const readabilityLevel = readabilityScore >= 80 ? 'Very Easy (Grade 5-6)'
    : readabilityScore >= 60 ? 'Easy (Grade 7-8)'
    : readabilityScore >= 40 ? 'Moderate (Grade 9-12)'
    : readabilityScore >= 20 ? 'Difficult (College)'
    : 'Very Difficult (Graduate)'

  const keywordDensity = targetKeywords.map(kw => {
    const regex = new RegExp(kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = content.match(regex)
    const count = matches ? matches.length : 0
    const density = (count / Math.max(wordCount, 1)) * 100
    const status = density < 0.5 ? 'Too Low' : density > 3 ? 'Over-Optimized (keyword stuffing)' : 'Optimal'
    return { keyword: kw, count, density, status }
  })

  const recommendations: string[] = []
  const strengths: string[] = []
  const warnings: string[] = []

  if (wordCount < 300) {
    warnings.push('Content is very short — aim for at least 800+ words for SEO')
  } else if (wordCount < 800) {
    recommendations.push('Expand content to 800-1500 words for better ranking potential')
  } else {
    strengths.push(`Good word count (${wordCount} words) for SEO`)
  }

  const underOpt = keywordDensity.filter(k => k.status === 'Too Low')
  const overOpt = keywordDensity.filter(k => k.status === 'Over-Optimized')

  if (underOpt.length > 0) {
    recommendations.push(`Increase density for: ${underOpt.map(k => k.keyword).join(', ')}`)
  }
  if (overOpt.length > 0) {
    warnings.push(`Risk of keyword stuffing for: ${overOpt.map(k => k.keyword).join(', ')}`)
  }
  if (underOpt.length === 0 && overOpt.length === 0 && keywordDensity.length > 0) {
    strengths.push('All keywords within optimal density range (0.5-3%)')
  }

  if (avgWordsPerSentence > 25) {
    warnings.push('Sentences are too long — shorten to 15-20 words for better readability')
  } else if (avgWordsPerSentence <= 20 && avgWordsPerSentence >= 10) {
    strengths.push('Good sentence length for readability')
  }

  if (readabilityScore >= 60) {
    strengths.push(`Good readability score (${readabilityScore.toFixed(1)}/100)`)
  } else {
    recommendations.push('Improve readability — simplify vocabulary and shorten sentences')
  }

  if (!content.includes('#') && !content.includes('##')) {
    recommendations.push('Add H2/H3 headings to structure content for featured snippets')
  } else {
    strengths.push('Content has heading structure')
  }

  const hasLink = content.includes('http') || content.includes('https')
  if (!hasLink) {
    recommendations.push('Add 2-3 internal/external links for link equity')
  } else {
    strengths.push('Contains links for SEO value')
  }

  const hasMetaDesc = content.length > 120
  if (hasMetaDesc) {
    recommendations.push(`Potential meta description: "${content.substring(0, 155).trim()}..."`)
  }

  let overallScore = 50
  overallScore += wordCount >= 800 ? 15 : Math.floor((wordCount / 800) * 15)
  overallScore += readabilityScore >= 60 ? 15 : (readabilityScore / 60) * 15
  overallScore += keywordDensity.filter(k => k.status === 'Optimal').length > 0 ? 15 : 0
  overallScore += content.includes('#') ? 5 : 0
  overallScore = Math.min(Math.round(overallScore), 100)

  return {
    result: {
      overallScore,
      keywordDensity,
      readabilityScore,
      readabilityLevel,
      wordCount,
      recommendations,
      strengths,
      warnings
    },
    inputContent: content
  }
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1
  const vowelGroups = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g)
  return vowelGroups ? vowelGroups.length : 1
}

function formatSEOContentScorerReport(result: SEOScore): string {
  const lines: string[] = []
  lines.push('## SEO Content Score')
  lines.push('')
  const scoreBar = renderScoreBar(result.overallScore)
  lines.push(`**Overall Score:** ${result.overallScore}/100 ${scoreBar}`)
  lines.push(`**Word Count:** ${result.wordCount} words`)
  lines.push(`**Readability:** ${result.readabilityScore.toFixed(1)}/100 — ${result.readabilityLevel}`)
  lines.push('')
  lines.push('### Keyword Density')
  lines.push('| Keyword | Count | Density | Status |')
  lines.push('|---------|-------|---------|--------|')
  for (const k of result.keywordDensity) {
    lines.push(`| ${k.keyword} | ${k.count} | ${k.density.toFixed(2)}% | ${k.status} |`)
  }
  lines.push('')
  if (result.strengths.length > 0) {
    lines.push('### Strengths')
    for (const s of result.strengths) lines.push(`[+] ${s}`)
    lines.push('')
  }
  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) lines.push(`[*] ${r}`)
    lines.push('')
  }
  if (result.warnings.length > 0) {
    lines.push('### Warnings')
    for (const w of result.warnings) lines.push(`[!] ${w}`)
  }

  return lines.join('\n')
}

function renderScoreBar(score: number): string {
  const filled = Math.round(score / 10)
  return '[' + '|'.repeat(filled) + '-'.repeat(10 - filled) + ']'
}

// ==================== TOOL 6: BRAND VOICE ANALYZER ====================

interface BrandVoiceResultWithInput {
  result: BrandVoiceAnalysis
  samples: string[]
}

function analyzeBrandVoice(samples: string[], brandGuidelines?: string): BrandVoiceResultWithInput {
  const dimensions = analyzeDimensions(samples, brandGuidelines)
  const deviations = findDeviations(samples, dimensions, brandGuidelines)
  const recommendations = generateRecommendations(deviations, dimensions, brandGuidelines)
  const sampleComparisons = compareSamplesToAverage(samples, dimensions)

  const overallConsistency = Math.round(
    (dimensions.tone.score + dimensions.vocabulary.score + dimensions.sentenceStructure.score + dimensions.personality.score) / 4
  )

  return {
    result: {
      overallConsistency,
      dimensions,
      deviations,
      recommendations,
      sampleComparisons
    },
    samples
  }
}

function analyzeDimensions(samples: string[], guidelines?: string) {
  const wordCounts = samples.map(s => s.split(/\s+/).length)
  const lengths = samples.map(s => s.split(/\s+/).length)
  const avgLength = lengths.reduce((s, l) => s + l, 0) / lengths.length
  const lengthVariance = lengths.reduce((s, l) => s + Math.pow(l - avgLength, 2), 0) / lengths.length
  const lengthConsistency = Math.max(0, Math.min(100, 100 - (Math.sqrt(lengthVariance) / Math.max(avgLength, 1)) * 100))

  const toneWords: Record<string, string[]> = {
    formal: ['therefore', 'furthermore', 'consequently', 'thus', 'hereby'],
    casual: ['hey', 'cool', 'awesome', 'super', 'totally'],
    technical: ['implementation', 'architecture', 'configuration', 'parameter', 'optimization'],
    energetic: ['amazing', 'incredible', 'revolutionary', 'breakthrough', 'game-changing']
  }

  const toneScores: number[] = []
  for (const s of samples) {
    const lower = s.toLowerCase()
    let maxToneScore = 0
    for (const [tone, words] of Object.entries(toneWords)) {
      const matches = words.filter(w => lower.includes(w)).length
      const score = (matches / words.length) * 100
      maxToneScore = Math.max(maxToneScore, score)
    }
    toneScores.push(50 + maxToneScore / 2)
  }
  const avgTone = toneScores.reduce((s, v) => s + v, 0) / toneScores.length

  const vocabScores: number[] = []
  for (const s of samples) {
    const words = s.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    const uniqueWords = new Set(words)
    const diversityRatio = uniqueWords.size / words.length
    vocabScores.push(Math.min(100, diversityRatio * 150))
  }
  const avgVocab = vocabScores.reduce((s, v) => s + v, 0) / vocabScores.length

  const personalityScores: number[] = []
  for (const s of samples) {
    const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u.test(s)
    const hasExclamation = s.includes('!')
    const hasQuestion = s.includes('?')
    const hasPassive = /\b(was|been|being|is|are)\s+\w+ed\b/i.test(s)
    let score = 60
    if (hasEmoji || hasExclamation) score += 20
    if (hasQuestion) score += 10
    if (hasPassive) score += 15
    personalityScores.push(Math.min(100, score))
  }
  const avgPersonality = personalityScores.reduce((s, v) => s + v, 0) / personalityScores.length

  let toneNotes = 'Consistent professional tone across samples'
  let vocabNotes = 'Good vocabulary diversity'
  let sentenceNotes = 'Sentence structure is reasonably varied'
  let personalityNotes = 'Content has balanced personality'

  if (guidelines) {
    const gl = guidelines.toLowerCase()
    if (gl.includes('formal')) toneNotes = 'Guidelines call for formal tone'
    if (gl.includes('casual')) toneNotes = 'Guidelines call for casual, friendly tone'
    if (gl.includes('technical')) toneNotes = 'Guidelines call for technical precision'
    if (gl.includes('energetic') || gl.includes('bold')) personalityNotes = 'Guidelines call for energetic personality'
  }

  return {
    tone: { score: Math.round(Math.min(avgTone, 100)), notes: toneNotes },
    vocabulary: { score: Math.round(Math.min(avgVocab, 100)), notes: vocabNotes },
    sentenceStructure: { score: Math.round(Math.min(lengthConsistency, 100)), notes: sentenceNotes },
    personality: { score: Math.round(Math.min(avgPersonality, 100)), notes: personalityNotes }
  }
}

function findDeviations(samples: string[], dims: ReturnType<typeof analyzeDimensions>, guidelines?: string): string[] {
  const deviations: string[] = []
  if (dims.tone.score > 70 && dims.personality.score < 50) {
    deviations.push('Tone is formal/consistent but personality is muted — content may feel sterile')
  }
  if (dims.vocabulary.score < 40) {
    deviations.push('Low vocabulary diversity — repetitive word choices detected')
  }
  if (dims.sentenceStructure.score < 40) {
    deviations.push('Inconsistent sentence lengths — some very long, others very short')
  }
  if (samples.length >= 2) {
    const avgTone = samples.map(s => countInformal(s)).reduce((s, v) => s + v, 0) / samples.length
    const informalVariance = samples.map(s => Math.pow(countInformal(s) - avgTone, 2)).reduce((s, v) => s + v, 0) / samples.length
    if (informalVariance > 15) {
      deviations.push('Inconsistent level of formality between samples')
    }
  }
  if (guidelines && guidelines.toLowerCase().includes('formal')) {
    const casualWords = ['hey', 'cool', 'gonna', 'wanna', 'kinda', 'dunno']
    const found = samples.some(s => casualWords.some(w => s.toLowerCase().includes(w)))
    if (found) deviations.push('Casual language detected but brand guidelines require formal tone')
  }

  if (deviations.length === 0) {
    deviations.push('No major deviations detected')
  }

  return deviations
}

function countInformal(text: string): number {
  const informal = ['hey', 'cool', 'awesome', 'super', 'totally', 'gonna', 'wanna', 'kinda', 'lol', 'omg']
  return informal.filter(w => text.toLowerCase().includes(w)).length
}

function generateRecommendations(deviations: string[], dims: ReturnType<typeof analyzeDimensions>, guidelines?: string): string[] {
  const recs: string[] = []
  if (dims.tone.score < 60) recs.push('Establish a consistent tone reference guide with 3-4 tone pillars')
  if (dims.vocabulary.score < 50) recs.push('Build a brand vocabulary list — include 20-30 preferred terms and 10 forbidden terms')
  if (dims.sentenceStructure.score < 50) recs.push('Apply consistent sentence structure rules: aim for 15-20 words per sentence')
  if (dims.personality.score < 60) recs.push('Inject more brand personality through specific word choices, stories, or humor')
  if (guidelines) recs.push('Create a brand voice cheat sheet from these guidelines and share with all content creators')
  recs.push('Schedule quarterly brand voice audits to track consistency improvements')
  return recs.slice(0, 6)
}

function compareSamplesToAverage(samples: string[], dims: ReturnType<typeof analyzeDimensions>): BrandVoiceAnalysis['sampleComparisons'] {
  return samples.map((s, idx) => {
    const words = s.split(/\s+/).length
    const wordDiversity = new Set(s.toLowerCase().split(/\s+/)).size / words
    const consistency = Math.round(50 + wordDiversity * 30 + (dims.tone.score / 100) * 20)
    const issues: string[] = []
    if (words < 50) issues.push('Very short sample — may not represent voice accurately')
    if (wordDiversity < 0.4) issues.push('Low word diversity')
    return {
      sampleIdx: idx + 1,
      consistency: Math.min(consistency, 100),
      issue: issues.length > 0 ? issues[0] : 'Consistent with brand voice'
    }
  })
}

function formatBrandVoiceReport(result: BrandVoiceAnalysis): string {
  const lines: string[] = []
  lines.push('## Brand Voice Analysis')
  lines.push('')
  const consistencyBar = renderScoreBar(result.overallConsistency)
  lines.push(`**Overall Consistency:** ${result.overallConsistency}/100 ${consistencyBar}`)
  lines.push('')
  lines.push('### Dimensions')
  lines.push('| Dimension | Score | Notes |')
  lines.push('|-----------|-------|-------|')
  lines.push(`| Tone | ${result.dimensions.tone.score}/100 | ${result.dimensions.tone.notes} |`)
  lines.push(`| Vocabulary | ${result.dimensions.vocabulary.score}/100 | ${result.dimensions.vocabulary.notes} |`)
  lines.push(`| Sentence Structure | ${result.dimensions.sentenceStructure.score}/100 | ${result.dimensions.sentenceStructure.notes} |`)
  lines.push(`| Personality | ${result.dimensions.personality.score}/100 | ${result.dimensions.personality.notes} |`)
  lines.push('')
  lines.push('### Deviations')
  for (const d of result.deviations) {
    lines.push(`- ${d}`)
  }
  lines.push('')
  lines.push('### Sample Comparison')
  lines.push('| Sample | Consistency | Issue |')
  lines.push('|--------|------------|-------|')
  for (const sc of result.sampleComparisons) {
    lines.push(`| #${sc.sampleIdx} | ${sc.consistency}% | ${sc.issue} |`)
  }
  lines.push('')
  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`[*] ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: CONTENT CALENDAR PLANNER ====================

interface CalendarResultWithInput {
  result: ContentCalendar
  topics: string[]
}

function analyzeContentCalendar(topics: string[], frequency: string, startDate: string): CalendarResultWithInput {
  const freqLower = frequency.toLowerCase()
  const postsPerWeek = freqLower.includes('daily') ? 7 : freqLower.includes('5') ? 5 : freqLower.includes('3') ? 3 : freqLower.includes('2') ? 2 : freqLower.includes('weekly') ? 1 : 3

  const formatRotation = ['Blog Post', 'Social Media Thread', 'Video', 'Newsletter', 'Infographic', 'Podcast Episode']
  const platformRotation = ['Blog/Website', 'Twitter/X', 'Instagram', 'LinkedIn', 'YouTube', 'Newsletter']

  const start = new Date(startDate)
  const entries: CalendarEntry[] = []
  let topicIdx = 0
  let formatIdx = 0
  let platformIdx = 0

  const daysBetween = Math.max(1, Math.floor(7 / postsPerWeek))
  let currentDate = new Date(start)

  for (let i = 0; i < topics.length; i++) {
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
    const optimalTime = getOptimalPostTime(dayOfWeek, platformRotation[platformIdx])

    entries.push({
      date: currentDate.toISOString().split('T')[0],
      dayOfWeek,
      topic: topics[topicIdx],
      format: formatRotation[formatIdx],
      platform: platformRotation[platformIdx],
      optimalPostTime: optimalTime,
      status: 'scheduled'
    })

    topicIdx = (topicIdx + 1) % topics.length
    formatIdx = (formatIdx + 1) % formatRotation.length
    platformIdx = (platformIdx + 1) % platformRotation.length
    currentDate = new Date(currentDate.getTime() + daysBetween * 86400000)
  }

  const endDate = entries.length > 0 ? entries[entries.length - 1].date : startDate
  const formatDist: Record<string, number> = {}
  const platformDist: Record<string, number> = {}
  for (const e of entries) {
    formatDist[e.format] = (formatDist[e.format] || 0) + 1
    platformDist[e.platform] = (platformDist[e.platform] || 0) + 1
  }

  return {
    result: {
      entries,
      frequency: `${postsPerWeek}x per week`,
      summary: {
        totalEntries: entries.length,
        startDate,
        endDate,
        formatDistribution: formatDist,
        platformDistribution: platformDist
      }
    },
    topics
  }
}

function getOptimalPostTime(dayOfWeek: string, platform: string): string {
  const weekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday'
  const times: Record<string, string> = {
    'Blog/Website': weekend ? '10:00 AM' : '8:00 AM',
    'Twitter/X': weekend ? '10:00 AM' : '12:00 PM',
    'Instagram': weekend ? '11:00 AM' : '7:00 PM',
    'LinkedIn': weekend ? 'Not recommended' : '8:00 AM',
    'YouTube': weekend ? '2:00 PM' : '5:00 PM',
    'Newsletter': weekend ? 'Not recommended' : '9:00 AM'
  }
  return times[platform] || '12:00 PM'
}

function formatContentCalendarReport(result: ContentCalendar): string {
  const lines: string[] = []
  lines.push('## Content Calendar')
  lines.push('')
  lines.push(`**Frequency:** ${result.frequency} | **Period:** ${result.summary.startDate} → ${result.summary.endDate}`)
  lines.push(`**Total Entries:** ${result.summary.totalEntries}`)
  lines.push('')
  lines.push('### Schedule')
  lines.push('| Date | Day | Topic | Format | Platform | Best Time |')
  lines.push('|------|-----|-------|--------|----------|-----------|')
  for (const e of result.entries) {
    const topicShort = e.topic.length > 30 ? e.topic.substring(0, 30) + '...' : e.topic
    lines.push(`| ${e.date} | ${e.dayOfWeek.substring(0, 3)} | ${topicShort} | ${e.format.substring(0, 15)} | ${e.platform} | ${e.optimalPostTime} |`)
  }
  lines.push('')
  lines.push('### Format Distribution')
  for (const [fmt, count] of Object.entries(result.summary.formatDistribution)) {
    lines.push(`- ${fmt}: ${count}`)
  }
  lines.push('')
  lines.push('### Platform Distribution')
  for (const [plat, count] of Object.entries(result.summary.platformDistribution)) {
    lines.push(`- ${plat}: ${count}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: REPURPOSING ENGINE ====================

interface RepurposingResultWithInput {
  result: RepurposingResult
  sourceContent: string
}

function analyzeRepurposing(sourceContent: string, targetFormats: string[]): RepurposingResultWithInput {
  const sourceWordCount = sourceContent.split(/\s+/).filter(w => w.length > 0).length
  const sentences = sourceContent.split(/[.!?]+/).filter(s => s.trim().length > 0)

  const outputs: RepurposedContent[] = []

  for (const format of targetFormats) {
    const fmtLower = format.toLowerCase().replace(/[-_\s]/g, '')
    let adapted = ''
    let wordCount = 0
    const adaptations: string[] = []
    let recommendedPlatform = ''
    const tips: string[] = []

    if (fmtLower.includes('tweet') || fmtLower.includes('twitter') || fmtLower.includes('x')) {
      const keySentences = sentences.slice(0, 2).map(s => s.trim()).join('. ')
      adapted = keySentences.length > 250 ? keySentences.substring(0, 247) + '...' : keySentences
      wordCount = adapted.split(/\s+/).length
      adaptations.push('Extracted core message + condensed to 280 chars')
      tips.push('Link to full article for depth')
      recommendedPlatform = 'Twitter/X'
      tips.push('Post as thread for additional context')
      tips.push('Include 2-3 relevant hashtags')
    } else if (fmtLower.includes('linkedin') || fmtLower.includes('linkedinpost')) {
      const paragraphs = sourceContent.split(/\n\n+/).filter(p => p.trim().length > 0)
      adapted = paragraphs.slice(0, 3).map(p => p.trim().substring(0, 200)).join('\n\n') +
        '\n\nWhat are your thoughts? Share in the comments below.'
      wordCount = adapted.split(/\s+/).length
      adaptations.push('Reformatted for LinkedIn professional audience')
      adaptations.push('Added engagement-driving question')
      recommendedPlatform = 'LinkedIn'
      tips.push('Add 3-5 relevant hashtags')
      tips.push('Tag 1-2 relevant people or companies')
    } else if (fmtLower.includes('insta') || fmtLower.includes('instagram') || fmtLower.includes('carousel')) {
      const bulletPoints = sentences.slice(0, 5).map((s, i) => `${i + 1}. ${s.trim().substring(0, 100)}`)
      adapted = bulletPoints.join('\n\n') + '\n\nSave this for later.',
      wordCount = adapted.split(/\s+/).length
      adaptations.push('Converted to numbered list format')
      adaptations.push('Optimized for carousel/save-worthy content')
      recommendedPlatform = 'Instagram'
      tips.push('Design each point as a carousel slide')
      tips.push('Use bold text overlays on visuals')
    } else if (fmtLower.includes('newsletter') || fmtLower.includes('email') || fmtLower.includes('news')) {
      adapted = `Subject: ${sentences[0]?.trim().substring(0, 60) || 'Weekly Update'}\n\nHi there,\n\n${sentences.slice(0, 4).map(s => s.trim()).join(' ')}\n\n[Read more → link to full piece]\n\nUntil next time`
      wordCount = adapted.split(/\s+/).length
      adaptations.push('Structured as newsletter format with subject line')
      adaptations.push('Added personal greeting and sign-off')
      recommendedPlatform = 'Email Newsletter'
      tips.push('Personalize subject line for higher open rates')
      tips.push('Include P.S. line for secondary CTA')
    } else if (fmtLower.includes('video') || fmtLower.includes('script') || fmtLower.includes('short')) {
      const timeEstimate = Math.min(60, sourceWordCount * 0.3)
      adapted = `[HOOK 0-${Math.ceil(timeEstimate * 0.1)}s]: ${sentences[0]?.trim().substring(0, 80) || 'Opening hook'}\n\n[CONTENT]:\n${sentences.slice(1, Math.min(sentences.length, 4)).map((s, i) => `${i + 1}. ${s.trim().substring(0, 100)}`).join('\n')}\n\n[CTA]: Follow for more content like this.`
      wordCount = adapted.split(/\s+/).length
      adaptations.push('Converted to short-form video script structure')
      adaptations.push(`Estimated duration: ${Math.ceil(timeEstimate)}s`)
      recommendedPlatform = 'TikTok / Instagram Reels / YouTube Shorts'
      tips.push('First 3 seconds must hook the viewer')
      tips.push('Use trending audio to boost discovery')
    } else if (fmtLower.includes('blog') || fmtLower.includes('article') || fmtLower.includes('post')) {
      adapted = sentences.map(s => s.trim()).filter(s => s.length > 0).join('.\n\n')
      wordCount = adapted.split(/\s+/).length
      adaptations.push('Expanded into structured article format')
      adaptations.push('Added paragraph breaks for readability')
      recommendedPlatform = 'Blog / Medium'
      tips.push('Add H2 headings to structure for SEO')
      tips.push('Include 2-3 internal/external links')
    } else if (fmtLower.includes('podcast') || fmtLower.includes('audio')) {
      adapted = `INTRO: "${sentences[0]?.trim().substring(0, 80) || 'Welcome to the show'}..."\n\nSEGMENTS:\n${sentences.slice(0, Math.min(sentences.length, 5)).map((s, i) => `Part ${i + 1}: Discuss "${s.trim().substring(0, 60)}"...`).join('\n')}\n\nOUTRO: Recap key takeaway, ask for rating.`
      wordCount = adapted.split(/\s+/).length
      adaptations.push('Converted to podcast discussion format')
      adaptations.push('Added natural transition cues')
      recommendedPlatform = 'Spotify / Apple Podcasts'
      tips.push('Add guest or co-host dynamics for engagement')
      tips.push('Include show notes with key timestamps')
    } else if (fmtLower.includes('infographic') || fmtLower.includes('visual') || fmtLower.includes('graphic')) {
      const stats = sentences.filter(s => /\d/.test(s))
      adapted = `INFOGRAPIC CONCEPT: Extract 5 key data points and stats.\n\nKey Points:\n${sentences.slice(0, 5).map((s, i) => `${i + 1}. ${s.trim().substring(0, 80)}`).join('\n')}\n${stats.length > 0 ? `\nStats to highlight: ${stats.slice(0, 3).map(s => s.trim().substring(0, 60)).join(' | ')}` : ''}`
      wordCount = adapted.split(/\s+/).length
      adaptations.push('Extracted visual-ready data points')
      adaptations.push('Structured for info graphic creation')
      recommendedPlatform = 'Pinterest / LinkedIn / Instagram'
      tips.push('Each point becomes a visual element')
      tips.push('Use contrasting colors for stats')
    } else {
      adapted = `ADAPTED FOR ${format}:\n\n${sentences.slice(0, 3).map(s => s.trim()).join('. ')}.`
      wordCount = adapted.split(/\s+/).length
      adaptations.push('General format adaptation applied')
      recommendedPlatform = 'Platform of choice'
      tips.push('Further customize for specific platform requirements')
    }

    outputs.push({
      format,
      content: adapted,
      wordCount,
      adaptations,
      recommendedPlatform,
      tips
    })
  }

  const totalOutputWords = outputs.reduce((s, o) => s + o.wordCount, 0)
  const compressionRatio = sourceWordCount > 0 ? Math.round((totalOutputWords / sourceWordCount) * 100) / 100 : 0

  return {
    result: {
      sourceWordCount,
      outputs,
      summary: {
        totalFormats: outputs.length,
        totalOutputWords,
        compressionRatio,
        recommendedSequence: outputs.map(o => o.format)
      }
    },
    sourceContent
  }
}

function formatRepurposingReport(result: RepurposingResult): string {
  const lines: string[] = []
  lines.push('## Repurposing Engine')
  lines.push('')
  lines.push(`**Source:** ${result.sourceWordCount} words → ${result.summary.totalFormats} formats | **Compression:** ${result.summary.compressionRatio}x`)
  lines.push('')
  lines.push('### Recommended Sequence')
  lines.push(result.summary.recommendedSequence.map((f, i) => `${i + 1}. ${f}`).join(' → '))
  lines.push('')

  for (const output of result.outputs) {
    lines.push(`### ${output.format} (${output.wordCount} words)`)
    lines.push('')
    lines.push('```')
    lines.push(output.content)
    lines.push('```')
    lines.push('')
    lines.push(`**Platform:** ${output.recommendedPlatform}`)
    lines.push('')
    lines.push('**Adaptations:**')
    for (const a of output.adaptations) {
      lines.push(`  - ${a}`)
    }
    lines.push('')
    lines.push('**Tips:**')
    for (const t of output.tips) {
      lines.push(`  - ${t}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'content_brief_generator',
    description: 'Generate a comprehensive content brief including angle, outline, target keywords, and tone recommendations. Input a topic and target audience to produce a structured brief ready for content creation.',
    parameters: {
      topic: { type: 'string', required: true, description: 'The main topic or subject for the content piece' },
      target_audience: { type: 'string', required: true, description: 'Description of the target audience (e.g., "beginner marketers", "SaaS founders", "Gen Z creators")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { topic: string; target_audience: string }) {
      const result = analyzeContentBrief(args.topic, args.target_audience)
      return formatContentBriefReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'image_prompt_engine',
    description: 'Generate optimized image generation prompts for Midjourney, DALL-E, or Stable Diffusion. Includes base prompt, negative prompt, parameters, and style-specific variations.',
    parameters: {
      concept: { type: 'string', required: true, description: 'The core visual concept or scene to generate (e.g., "futuristic city skyline", "minimalist product photo")' },
      style: { type: 'string', required: true, description: 'Desired image style (e.g., "photorealistic", "digital art", "anime", "3D render", "watercolor")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { concept: string; style: string }) {
      const result = analyzeImagePrompt(args.concept, args.style)
      return formatImagePromptReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'video_script_writer',
    description: 'Generate a timed video script with hooks, content segments, visual notes, and CTAs. Perfect for short-form and long-form video content production.',
    parameters: {
      topic: { type: 'string', required: true, description: 'The video topic or subject' },
      duration_seconds: { type: 'string', required: true, description: 'Target video duration in seconds (e.g., "60", "180", "300")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { topic: string; duration_seconds: string }) {
      const result = analyzeVideoScript(args.topic, args.duration_seconds)
      return formatVideoScriptReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'social_media_optimizer',
    description: 'Optimize content for multiple social media platforms. Produces platform-specific versions with tailored length, hashtags, posting times, and engagement tips.',
    parameters: {
      content: { type: 'string', required: true, description: 'The source content to optimize for social media' },
      platforms: { type: 'string', required: true, description: 'JSON array of target platforms (e.g., ["twitter", "instagram", "linkedin", "tiktok", "youtube"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { content: string; platforms: string }) {
      const platformList: string[] = JSON.parse(args.platforms)
      const { result } = analyzeSocialMediaOptimizer(args.content, platformList)
      return formatSocialMediaOptimizerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'seo_content_scorer',
    description: 'Score content for SEO performance. Analyzes keyword density, readability (Flesch-Kincaid), word count, and provides actionable optimization recommendations.',
    parameters: {
      content: { type: 'string', required: true, description: 'The content text to analyze for SEO' },
      target_keywords: { type: 'string', required: true, description: 'JSON array of target keywords/phrases (e.g., ["content marketing", "SEO strategy", "organic traffic"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { content: string; target_keywords: string }) {
      const keywords: string[] = JSON.parse(args.target_keywords)
      const { result } = analyzeSEOContent(args.content, keywords)
      return formatSEOContentScorerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'brand_voice_analyzer',
    description: 'Analyze content samples for brand voice consistency. Scores tone, vocabulary, sentence structure, and personality dimensions. Identifies deviations and provides improvement recommendations.',
    parameters: {
      content_samples: { type: 'string', required: true, description: 'JSON array of 3-5 content samples (text strings) from the brand' },
      brand_guidelines: { type: 'string', description: 'Optional brand voice guidelines text for comparison (formal, casual, technical, etc.)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { content_samples: string; brand_guidelines?: string }) {
      const samples: string[] = JSON.parse(args.content_samples)
      const { result } = analyzeBrandVoice(samples, args.brand_guidelines)
      return formatBrandVoiceReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'content_calendar_planner',
    description: 'Plan a content calendar with optimal posting times. Takes topics, frequency, and start date to produce a full schedule with format and platform recommendations.',
    parameters: {
      topics: { type: 'string', required: true, description: 'JSON array of content topics/subjects to schedule' },
      frequency: { type: 'string', required: true, description: 'Posting frequency (e.g., "daily", "3x per week", "2x weekly", "weekly")' },
      start_date: { type: 'string', required: true, description: 'Calendar start date in YYYY-MM-DD format' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { topics: string; frequency: string; start_date: string }) {
      const topics: string[] = JSON.parse(args.topics)
      const { result } = analyzeContentCalendar(topics, args.frequency, args.start_date)
      return formatContentCalendarReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'repurposing_engine',
    description: 'Transform source content into multiple formats. Adapts blog posts, videos, or any content into tweets, LinkedIn posts, Instagram carousels, newsletters, podcasts, and more.',
    parameters: {
      source_content: { type: 'string', required: true, description: 'The original content to repurpose' },
      target_formats: { type: 'string', required: true, description: 'JSON array of output formats (e.g., ["twitter", "instagram", "linkedin", "newsletter", "video-script", "infographic"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { source_content: string; target_formats: string }) {
      const formats: string[] = JSON.parse(args.target_formats)
      const { result } = analyzeRepurposing(args.source_content, formats)
      return formatRepurposingReport(result)
    }
  }))

  console.log(`[dsh-tool-amefactory] Loaded v${VERSION} — AI Multi-modal Content Factory with 8 tools`)
  console.log('  Tools: content_brief_generator, image_prompt_engine, video_script_writer, social_media_optimizer, seo_content_scorer, brand_voice_analyzer, content_calendar_planner, repurposing_engine')
}
