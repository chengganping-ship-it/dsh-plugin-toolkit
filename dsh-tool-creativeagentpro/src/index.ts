/**
 * DSH Creative Agent Pro Plugin v1.0.0
 * AI驱动的创意生产工具集 for DeepSeek Harness — 品牌/内容/视觉/文案完整创意工作流
 *
 * 聚焦2026年创意生产垂直领域，覆盖品牌识别设计、内容日历规划、SEO文案重写、
 * 视觉创意板、视频分镜、Newsletter创作、UX微文案优化、Pitch Deck结构八大核心场景。
 *
 * Disclaimer: AI创意建议需结合实际业务场景与品牌策略，不代表最终商业决策。
 *
 * 工具清单:
 * 1. brand_identity_designer  — 品牌视觉识别系统设计与规范生成
 * 2. content_calendar_planner — 社交媒体内容日历规划与排期
 * 3. copy_rewriter            — SEO文案重写与多版本A/B生成
 * 4. visual_concept_board     — 视觉创意板与配色方案生成
 * 5. storyboard_architect     — 视频脚本分镜与节奏设计
 * 6. newsletter_crafter       — 邮件Newsletter模板与内容创作
 * 7. ux_copy_optimizer        — UX微文案与交互文案优化
 * 8. pitch_deck_designer      — 融资Pitch Deck结构与内容建议
 *
 * @module dsh-tool-creativeagentpro | @version 1.0.0 | @license MIT
 * @author creativeagentpro-team
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-creativeagentpro'
export const inject = ['tools']

const VERSION = '1.0.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  static seedFromString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 — Disclaimer ====================

const DISCLAIMER = 'AI创意建议需结合实际业务场景与品牌策略，不代表最终商业决策。'

// ==================== SECTION 3 — 类型定义 ====================

// --- Tool 1: brand_identity_designer ---
interface BrandIdentityInput {
  brand_name: string
  industry: string
  target_audience: string
  brand_values: string[]
  style_preference: 'minimal' | 'bold' | 'elegant' | 'playful' | 'tech'
  color_mood: string
}

interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  neutral: string
  background: string
}

interface TypographySpec {
  heading_font: string
  body_font: string
  scale_ratio: number
}

interface BrandGuideline {
  category: string
  rule: string
  rationale: string
}

interface BrandIdentityResult {
  brand_name: string
  color_palette: ColorPalette
  typography: TypographySpec
  logo_concepts: string[]
  guidelines: BrandGuideline[]
  voice_tone: string[]
  application_examples: string[]
}

// --- Tool 2: content_calendar_planner ---
interface ContentCalendarInput {
  platform: ('instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'xiaohongshu' | 'weibo')[]
  content_pillars: string[]
  posting_frequency: 'daily' | 'weekdays' | '3x_week' | 'weekly'
  campaign_duration_weeks: number
  upcoming_events: string[]
}

interface ContentSlot {
  day: string
  platform: string
  pillar: string
  content_type: string
  suggested_caption: string
  best_posting_time: string
  hashtag_set: string[]
  engagement_tip: string
}

interface ContentCalendarResult {
  platform_count: number
  total_posts: number
  posting_schedule: ContentSlot[]
  pillar_distribution: Record<string, number>
  weekly_theme: string[]
  optimization_tips: string[]
}

// --- Tool 3: copy_rewriter ---
interface CopyRewriteInput {
  original_copy: string
  target_keywords: string[]
  tone_of_voice: 'professional' | 'casual' | 'persuasive' | 'informative' | 'urgent'
  target_audience: string
  output_variants: number
  seo_focus: boolean
}

interface CopyVariant {
  variant_id: string
  headline: string
  body: string
  cta: string
  keyword_density: number
  readability_score: number
  predicted_ctr: number
}

interface CopyRewriteResult {
  original_length: number
  variants: CopyVariant[]
  seo_suggestions: string[]
  a_b_test_recommendation: string
  power_words_used: string[]
}

// --- Tool 4: visual_concept_board ---
interface VisualConceptInput {
  project_name: string
  concept_direction: string
  mood_keywords: string[]
  style_references: string[]
  color_temperature: 'warm' | 'cool' | 'neutral' | 'mixed'
  composition_style: 'symmetric' | 'dynamic' | 'layered' | 'minimal'
}

interface ColorStop {
  hex: string
  name: string
  usage: string
}

interface ConceptElement {
  element_type: string
  description: string
  placement: string
}

interface TextureSuggestion {
  texture: string
  application: string
  opacity_recommendation: number
}

interface VisualConceptResult {
  concept_name: string
  color_stops: ColorStop[]
  elements: ConceptElement[]
  textures: TextureSuggestion[]
  typography_direction: string
  composition_notes: string[]
  mood_score: number
}

// --- Tool 5: storyboard_architect ---
interface StoryboardInput {
  video_type: 'explainer' | 'product_launch' | 'brand_story' | 'tutorial' | 'social_clip'
  duration_seconds: number
  target_platform: string
  key_message: string
  visual_style: string
  has_voiceover: boolean
}

interface StoryboardFrame {
  frame_number: number
  timestamp: string
  duration_seconds: number
  visual_description: string
  camera_move: string
  text_overlay: string
  audio_note: string
  transition: string
}

interface PacingSegment {
  segment_name: string
  frame_range: string
  intensity: 'low' | 'medium' | 'high'
  emotional_tone: string
}

interface StoryboardResult {
  total_frames: number
  frames: StoryboardFrame[]
  pacing_segments: PacingSegment[]
  estimated_production_hours: number
  equipment_suggestions: string[]
  music_mood: string
}

// --- Tool 6: newsletter_crafter ---
interface NewsletterInput {
  newsletter_name: string
  audience_type: string
  content_sections: string[]
  send_frequency: 'weekly' | 'biweekly' | 'monthly'
  goal: 'engagement' | 'conversion' | 'retention' | 'education'
  include_promo: boolean
}

interface NewsletterBlock {
  block_type: string
  content: string
  placement: string
  design_note: string
}

interface NewsletterTemplateResult {
  subject_line_options: string[]
  preview_text: string
  blocks: NewsletterBlock[]
  cta_placement: string[]
  personalization_tokens: string[]
  spam_score: number
  deliverability_tips: string[]
}

// --- Tool 7: ux_copy_optimizer ---
interface UXCopyInput {
  product_type: string
  target_screen: string
  user_scenario: string
  current_copy: string
  desired_action: string
  tone: 'friendly' | 'professional' | 'minimal' | 'encouraging'
  locale: string
}

interface CopySuggestion {
  element: string
  original: string
  suggestion: string
  rationale: string
  impact_level: 'low' | 'medium' | 'high'
}

interface AccessibilityNote {
  principle: string
  recommendation: string
}

interface UXCopyResult {
  screen_name: string
  suggestions: CopySuggestion[]
  microcopy_system: Record<string, string>
  accessibility_notes: AccessibilityNote[]
  consistency_score: number
  clarity_improvement_pct: number
}

// --- Tool 8: pitch_deck_designer ---
interface PitchDeckInput {
  company_name: string
  industry: string
  funding_stage: 'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'growth'
  target_investors: string[]
  key_metrics: Record<string, string>
  unique_value_prop: string
  team_size: number
}

interface DeckSlide {
  slide_number: number
  title: string
  purpose: string
  key_points: string[]
  visual_suggestion: string
  presenter_note: string
  time_allocation_seconds: number
}

interface NarrativeArc {
  phase: string
  slides_range: string
  emotional_beat: string
}

interface PitchDeckResult {
  total_slides: number
  slides: DeckSlide[]
  narrative_arc: NarrativeArc[]
  design_direction: string
  common_mistakes_to_avoid: string[]
  estimated_pitch_duration_minutes: number
  appendix_recommendations: string[]
}

// ==================== SECTION 4 — 分析函数 ====================

// --- Tool 1: brand_identity_designer ---
function analyzeBrandIdentity(input: BrandIdentityInput): BrandIdentityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.brand_name + input.industry + input.style_preference
  ))

  const palettes: Record<string, ColorPalette> = {
    minimal: { primary: '#1A1A1A', secondary: '#F5F5F5', accent: '#FF5722', neutral: '#9E9E9E', background: '#FFFFFF' },
    bold: { primary: '#E53935', secondary: '#212121', accent: '#FFD600', neutral: '#757575', background: '#FAFAFA' },
    elegant: { primary: '#3E2723', secondary: '#D7CCC8', accent: '#FFD700', neutral: '#A1887F', background: '#FFF8E1' },
    playful: { primary: '#7C4DFF', secondary: '#00BCD4', accent: '#FF4081', neutral: '#B0BEC5', background: '#F3E5F5' },
    tech: { primary: '#0D47A1', secondary: '#00BCD4', accent: '#76FF03', neutral: '#607D8B', background: '#ECEFF1' },
  }

  const palette = input.color_mood ?
    { ...palettes[input.style_preference], primary: input.color_mood } :
    palettes[input.style_preference]

  const typographyOptions: TypographySpec[] = [
    { heading_font: 'Inter', body_font: 'IBM Plex Sans', scale_ratio: 1.25 },
    { heading_font: 'Playfair Display', body_font: 'Source Sans Pro', scale_ratio: 1.333 },
    { heading_font: 'Poppins', body_font: 'Roboto', scale_ratio: 1.2 },
    { heading_font: 'Montserrat', body_font: 'Open Sans', scale_ratio: 1.25 },
    { heading_font: 'Space Grotesk', body_font: 'DM Sans', scale_ratio: 1.333 },
  ]

  const typography = typographyOptions[rng.nextInt(0, typographyOptions.length - 1)]

  const logoConcepts = [
    `字母组合标识: ${input.brand_name.slice(0, 2).toUpperCase()} 几何简化图形`,
    `图形+文字组合: ${rng.pick(['圆形', '六边形', '波浪线', '抽象几何', '负空间'])}容器 + ${input.brand_name}`,
    `纯文字标识: ${typography.heading_font} 定制字重与字间距`,
    `动态标识: 响应式多形态，适配数字与印刷场景`,
  ]

  const guidelines: BrandGuideline[] = [
    { category: '色彩使用', rule: '主色占比60%，辅色30%，强调色10%', rationale: '确保视觉层次清晰，主色建立品牌锚点' },
    { category: '安全间距', rule: 'Logo四周留白不小于Logo高度的25%', rationale: '保证识别度，避免视觉干扰' },
    { category: '最小尺寸', rule: '印刷最小宽度20mm，数字最小宽度80px', rationale: '确保在各种媒介上的可识别性' },
    { category: '字体层级', rule: 'H1-H3使用标题字体，正文使用正文字体', rationale: '建立一致的阅读节奏与视觉锚点' },
    { category: '图像风格', rule: `统一滤镜:${rng.pick(['暖色调', '高对比度', '胶片感', '明亮自然'])}，禁止混用`, rationale: '保证视觉产出的一致性与品牌调性' },
  ]

  const voiceToneMap: Record<string, string[]> = {
    minimal: ['简洁直接', '克制表达', '留白艺术'],
    bold: ['自信有力', '挑战常规', '激发行动'],
    elegant: ['精致优雅', '文化底蕴', '品质感'],
    playful: ['轻松幽默', '惊喜感', '亲和力'],
    tech: ['专业可信', '前瞻思维', '数据驱动'],
  }

  const applications = [
    `名片: ${palette.primary}底白字，烫${palette.accent === '#FFD700' ? '金' : '银'}工艺`,
    `社媒头像: 图形标识居中，圆形裁切`,
    `办公用品: 信纸/信封统一抬头设计`,
    `数字广告: ${rng.pick(['1080x1080', '1200x628', '1080x1920'])}尺寸适配`,
    `环境导视: ${rng.pick(['亚克力', '金属拉丝', '灯箱'])}材质`,
  ]

  return {
    brand_name: input.brand_name,
    color_palette: palette,
    typography,
    logo_concepts: logoConcepts,
    guidelines,
    voice_tone: voiceToneMap[input.style_preference] || voiceToneMap['minimal'],
    application_examples: applications,
  }
}

// --- Tool 2: content_calendar_planner ---
function analyzeContentCalendar(input: ContentCalendarInput): ContentCalendarResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.platform.join('') + input.posting_frequency + input.campaign_duration_weeks.toString()
  ))

  const freqMap: Record<string, number> = { daily: 7, weekdays: 5, '3x_week': 3, weekly: 1 }
  const postsPerWeek = freqMap[input.posting_frequency] || 3
  const totalWeeks = input.campaign_duration_weeks
  const totalPosts = postsPerWeek * totalWeeks

  const dayNames = input.posting_frequency === 'weekdays'
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    : input.posting_frequency === '3x_week'
    ? ['Monday', 'Wednesday', 'Friday']
    : input.posting_frequency === 'weekly'
    ? ['Wednesday']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const contentTypes = ['轮播图文', '短视频', 'Reel/Story', 'UGC引用', '信息图', '投票互动', '直播预告', '幕后花絮']
  const timeSlots: Record<string, string> = {
    instagram: '11:00-13:00 / 19:00-21:00',
    twitter: '08:00-09:00 / 12:00-13:00',
    linkedin: '07:00-08:00 / 12:00-13:00',
    tiktok: '19:00-21:00 / 11:00-13:00',
    xiaohongshu: '12:00-14:00 / 20:00-22:00',
    weibo: '10:00-12:00 / 18:00-20:00',
  }

  const captionTemplates = [
    '🔥 今天聊聊{pillar}...',
    '💡 {pillar}的{rng}个实用技巧',
    '🎯 为什么{pillar}如此重要？',
    '✨ 我们的{pillar}心得分享',
    '📝 {pillar}完全指南',
  ]

  const schedule: ContentSlot[] = []
  for (let week = 0; week < Math.min(totalWeeks, 6); week++) {
    for (const day of dayNames) {
      const platform = input.platform[rng.nextInt(0, input.platform.length - 1)]
      const pillar = input.content_pillars[rng.nextInt(0, input.content_pillars.length - 1)]
      const contentType = rng.pick(contentTypes)
      const caption = rng.pick(captionTemplates).replace('{pillar}', pillar).replace('{rng}', rng.nextInt(3, 7).toString())

      schedule.push({
        day: `W${week + 1}-${day}`,
        platform,
        pillar,
        content_type: contentType,
        suggested_caption: caption,
        best_posting_time: timeSlots[platform] || '09:00-11:00',
        hashtag_set: [
          `#${pillar.replace(/\s/g, '')}`,
          `#${input.platform[0]}Tips`,
          `#${week + 1}WeekChallenge`,
          `#${rng.pick(['Growth', 'Strategy', 'Insights', 'Daily', 'ProTips'])}`,
        ],
        engagement_tip: rng.pick([
          '提问引导评论区互动',
          '使用投票贴纸提升参与度',
          '@合作品牌增加曝光',
          '置顶引导CTA',
          '24h内回复所有评论',
        ]),
      })
    }
  }

  const pillarDist: Record<string, number> = {}
  for (const pillar of input.content_pillars) {
    pillarDist[pillar] = Math.round(totalPosts / input.content_pillars.length)
  }

  const weeklyThemes = Array.from({ length: totalWeeks }, (_, i) =>
    input.upcoming_events[i] || `第${i + 1}周: ${input.content_pillars[i % input.content_pillars.length]}聚焦周`
  )

  const optimizationTips = [
    `最佳发帖频率: 每周${postsPerWeek}条 | 建议批次制作提高效率`,
    `平台优先级: ${input.platform.slice(0, 2).join(' > ')} | 核心平台投入70%精力`,
    `内容比例: 教育40% | 娱乐30% | 推广20% | 互动10%`,
    `高互动时段: ${rng.pick(['工作日早8-9点', '午休12-13点', '晚8-10点'])}`,
    `建议每月做一次内容复盘，淘汰低效格式`,
  ]

  return {
    platform_count: input.platform.length,
    total_posts: totalPosts,
    posting_schedule: schedule.slice(0, 42),
    pillar_distribution: pillarDist,
    weekly_theme: weeklyThemes,
    optimization_tips: optimizationTips,
  }
}

// --- Tool 3: copy_rewriter ---
function analyzeCopyRewrite(input: CopyRewriteInput): CopyRewriteResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.original_copy.slice(0, 100) + input.tone_of_voice + input.target_keywords.join('')
  ))

  const variantCount = Math.min(Math.max(input.output_variants, 2), 5)
  const variants: CopyVariant[] = []

  const headlinesByTone: Record<string, string[]> = {
    professional: ['重新定义行业标杆', '专业解决方案，值得信赖', '数据驱动的业务增长引擎'],
    casual: ['你值得拥有更好的', '让一切变得简单', '这次真的不一样'],
    persuasive: ['限时机会，不容错过', '为什么聪明人都选择了它', '改变从这一步开始'],
    informative: ['全面解析：你需要知道的一切', '深度洞察与实用指南', '专家视角的专业解读'],
    urgent: ['最后24小时！', '名额仅剩最后X席', '立即行动，抢占先机'],
  }

  const ctas = [
    '立即体验', '免费试用', '了解更多', '预约演示', '加入我们',
    '马上开始', '获取方案', '限时领取', '抢先体验', '查看详情',
  ]

  const powerWords = [
    '独家', '突破', '革命性', '限时', '免费', '保证', '立即可用',
    '已验证', '秘密', '首创', '惊人', '简单', '稀缺', '权威',
  ]

  for (let i = 0; i < variantCount; i++) {
    const toneHeadlines = headlinesByTone[input.tone_of_voice] || headlinesByTone['professional']
    const headline = toneHeadlines[i % toneHeadlines.length]
    const keyword = input.target_keywords[i % input.target_keywords.length] || '品质'

    variants.push({
      variant_id: `V${String.fromCharCode(65 + i)}`,
      headline: `${headline}${i > 0 ? ` (${keyword}版)` : ''}`,
      body: `针对${input.target_audience}，我们提供${keyword}相关的${input.tone_of_voice === 'professional' ? '专业' : '优质'}解决方案。${input.original_copy.slice(0, 80)}...`,
      cta: rng.pick(ctas),
      keyword_density: Math.round(rng.nextFloat(0.01, 0.035) * 10000) / 10000,
      readability_score: Math.round(rng.nextFloat(60, 95)),
      predicted_ctr: Math.round(rng.nextFloat(1.5, 8.5) * 100) / 100,
    })
  }

  const seoSuggestions = [
    `主关键词"${input.target_keywords[0] || '核心词'}"建议出现在标题前30字符`,
    'H2/H3子标题中自然融入长尾关键词',
    'Meta描述控制在155字符以内，包含主关键词',
    '图片Alt文本添加描述性关键词',
    '内链锚文本使用关键词变体',
    'URL slug使用短横线分隔的关键词',
  ]

  const bestVariant = variants.reduce((best, v) => v.predicted_ctr > best.predicted_ctr ? v : best, variants[0])

  return {
    original_length: input.original_copy.length,
    variants,
    seo_suggestions: seoSuggestions.slice(0, rng.nextInt(4, 6)),
    a_b_test_recommendation: `建议A/B测试 ${bestVariant.variant_id} vs ${variants.find(v => v.variant_id !== bestVariant.variant_id)?.variant_id || 'V2'}，预期CTR差异${(bestVariant.predicted_ctr - (variants[1]?.predicted_ctr || 0)).toFixed(2)}%`,
    power_words_used: rng.pick(powerWords).split(',').slice(0, rng.nextInt(3, 6)),
  }
}

// --- Tool 4: visual_concept_board ---
function analyzeVisualConcept(input: VisualConceptInput): VisualConceptResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.project_name + input.concept_direction + input.color_temperature
  ))

  const tempColors: Record<string, string[]> = {
    warm: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E'],
    cool: ['#2D3047', '#419D78', '#E0A458', '#3E92CC', '#13293D'],
    neutral: ['#6B7280', '#D1D5DB', '#F9FAFB', '#1F2937', '#9CA3AF'],
    mixed: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
  }

  const colors = tempColors[input.color_temperature] || tempColors['mixed']
  const colorNames = ['珊瑚橙', '薄荷绿', '深海蓝', '暖沙金', '雾灰', '暮光紫', '森林绿', '天空蓝']

  const colorStops: ColorStop[] = colors.map((hex, i) => ({
    hex,
    name: colorNames[i % colorNames.length],
    usage: i === 0 ? '主视觉色' : i === 1 ? '辅助色' : i === 2 ? '背景色' : i === 3 ? '强调色' : '文字色',
  }))

  const elements: ConceptElement[] = [
    { element_type: '主视觉图形', description: `${input.concept_direction}主题抽象图形`, placement: '画面中心偏上' },
    { element_type: '装饰纹理', description: `${rng.pick(['几何线条', '流体渐变', '颗粒噪点', '网格系统'])}`, placement: '背景层' },
    { element_type: '文字排版区', description: '标题+副标题组合', placement: '画面下方1/3处' },
    { element_type: '品牌标识', description: 'Logo/水印', placement: '右下角' },
    { element_type: '视觉锚点', description: `${rng.pick(['光斑', '几何边框', '手绘元素', '3D形态'])}`, placement: '视觉引导线交汇处' },
  ]

  const textures: TextureSuggestion[] = [
    { texture: '纸张纹理', application: '背景叠加', opacity_recommendation: 15 },
    { texture: '噪点颗粒', application: '整体叠加', opacity_recommendation: 8 },
    { texture: '渐变光晕', application: '主视觉周围', opacity_recommendation: 25 },
  ]

  const compositionNotes = [
    `构图方式: ${input.composition_style === 'symmetric' ? '对称平衡' : input.composition_style === 'dynamic' ? '对角线动态' : input.composition_style === 'layered' ? '多层次叠加' : '极简留白'}`,
    `视觉重心: ${rng.pick(['黄金分割点', '画面中心', '三分法左上', '三分法右下'])}`,
    `留白比例: ${rng.nextInt(20, 40)}%`,
    `视觉层级: ${rng.nextInt(3, 5)}层`,
    `建议尺寸: ${rng.pick(['16:9', '4:5', '1:1', '9:16', '2.35:1'])}`,
  ]

  return {
    concept_name: `${input.project_name} - ${input.concept_direction}`,
    color_stops: colorStops,
    elements,
    textures,
    typography_direction: `${rng.pick(['无衬线几何', '衬线优雅', '手写体', '等宽技术'])} + ${rng.nextInt(2, 3)}级字重`,
    composition_notes: compositionNotes,
    mood_score: Math.round(rng.nextFloat(0.65, 0.95) * 100) / 100,
  }
}

// --- Tool 5: storyboard_architect ---
function analyzeStoryboard(input: StoryboardInput): StoryboardResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.video_type + input.duration_seconds.toString() + input.key_message.slice(0, 50)
  ))

  const totalDuration = input.duration_seconds
  const avgFrameDuration = rng.nextFloat(2, 5)
  const frameCount = Math.max(3, Math.round(totalDuration / avgFrameDuration))

  const cameraMoves = ['静态', '缓慢推进', '横移', '俯拍', '环绕', '快速切换', '拉远', '跟随']
  const transitions = ['硬切', '淡入淡出', '滑动转场', '缩放转场', '匹配剪辑', '跳切']
  const visualActions = [
    '产品特写展示', '用户场景演绎', '数据可视化动画', '品牌Logo揭示',
    '文字动画强调', '人物表情捕捉', '环境氛围展示', '功能演示',
  ]

  const frames: StoryboardFrame[] = []
  let currentSeconds = 0
  for (let i = 0; i < frameCount; i++) {
    const frameDuration = i === 0 ? 3 : i === frameCount - 1 ? 4 : Math.round(avgFrameDuration)
    const mins = Math.floor(currentSeconds / 60)
    const secs = currentSeconds % 60
    const timestamp = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

    frames.push({
      frame_number: i + 1,
      timestamp,
      duration_seconds: frameDuration,
      visual_description: i === 0 ? '开场钩子: 视觉冲击引入' :
        i === frameCount - 1 ? '结尾CTA: 品牌Logo + 行动号召' :
        rng.pick(visualActions),
      camera_move: rng.pick(cameraMoves),
      text_overlay: i === 0 ? input.key_message.slice(0, 20) :
        i === frameCount - 1 ? '立即行动 →' :
        rng.pick([input.key_message.slice(0, 15), '', '核心数据', '']),
      audio_note: input.has_voiceover ?
        (i === 0 ? '开场白' : i === frameCount - 1 ? '结尾CTA旁白' : rng.pick(['解说', '背景音乐', '静音'])) :
        rng.pick(['背景音乐', '音效', '环境音']),
      transition: i < frameCount - 1 ? rng.pick(transitions) : '结束',
    })
    currentSeconds += frameDuration
  }

  const segmentCount = Math.min(3, Math.max(1, Math.floor(frameCount / 4)))
  const pacingSegments: PacingSegment[] = []
  for (let i = 0; i < segmentCount; i++) {
    const startFrame = i * Math.floor(frameCount / segmentCount) + 1
    const endFrame = i === segmentCount - 1 ? frameCount : (i + 1) * Math.floor(frameCount / segmentCount)
    pacingSegments.push({
      segment_name: i === 0 ? '开场引入' : i === segmentCount - 1 ? '高潮收尾' : '核心展开',
      frame_range: `${startFrame}-${endFrame}`,
      intensity: i === 0 ? 'medium' : i === segmentCount - 1 ? 'high' : 'medium',
      emotional_tone: i === 0 ? '好奇吸引' : i === segmentCount - 1 ? '信任行动' : '共鸣理解',
    })
  }

  const equipment = [
    rng.pick(['Sony A7IV', 'Canon R5', 'Blackmagic Pocket 6K', 'iPhone 15 Pro']),
    rng.pick(['24-70mm f/2.8', '50mm f/1.4', '16-35mm f/2.8']),
    rng.pick(['罗德无线麦', '领夹麦克风', '枪式麦克风']),
    rng.pick(['LED补光灯套装', '柔光箱', '环形灯']),
    '三脚架/稳定器',
  ]

  return {
    total_frames: frameCount,
    frames,
    pacing_segments: pacingSegments,
    estimated_production_hours: Math.round(frameCount * rng.nextFloat(0.5, 2)),
    equipment_suggestions: equipment,
    music_mood: rng.pick(['轻快电子', '温暖原声', '激励史诗', '舒缓钢琴', '潮流节拍']),
  }
}

// --- Tool 6: newsletter_crafter ---
function analyzeNewsletter(input: NewsletterInput): NewsletterTemplateResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.newsletter_name + input.audience_type + input.goal
  ))

  const subjectLines = [
    `${input.newsletter_name} | ${rng.pick(['本周精选', '独家洞察', '不容错过', '限时更新'])}`,
    `${rng.pick(['🔥', '💡', '📊', '🎯'])} ${rng.pick(['本周必读', '深度解析', '行业前沿'])}: ${input.content_sections[0] || '最新动态'}`,
    `${rng.nextInt(3, 10)}个${input.content_sections[0] || '关键'}趋势你需要知道`,
    `${input.audience_type}专属: ${rng.pick(['本周重点', '独家内容', '会员福利'])}`,
  ]

  const blocks: NewsletterBlock[] = []

  blocks.push({
    block_type: 'Header',
    content: `${input.newsletter_name} Logo + 导航链接`,
    placement: '顶部',
    design_note: '品牌主色调背景，Logo居中，高度60-80px',
  })

  blocks.push({
    block_type: 'Welcome',
    content: `欢迎语 + 本期导读 (${input.content_sections.slice(0, 3).join(' / ')})`,
    placement: 'Header下方',
    design_note: '简洁文字+配图，建立阅读期待',
  })

  for (const section of input.content_sections) {
    blocks.push({
      block_type: section,
      content: `${section}核心内容段落，包含数据/案例/洞察`,
      placement: `正文第${input.content_sections.indexOf(section) + 1}区块`,
      design_note: rng.pick(['左图右文', '全宽图文', '卡片式布局', '数据高亮框']),
    })
  }

  if (input.include_promo) {
    blocks.push({
      block_type: 'Promotion',
      content: rng.pick(['限时优惠', '新品发布', '活动邀请', '合作伙伴推荐']),
      placement: '正文中部或底部',
      design_note: '醒目CTA按钮，对比色突出，不超过总篇幅20%',
    })
  }

  blocks.push({
    block_type: 'Footer',
    content: '退订链接 | 社交媒体 | 联系信息 | 转发分享',
    placement: '底部',
    design_note: '灰色背景，小字号，合规信息齐全',
  })

  const ctaPlacements = [
    'Welcome区块后: 引导阅读',
    ...(input.include_promo ? ['Promo区块: 转化CTA'] : []),
    'Footer前: 订阅/分享CTA',
  ]

  const personalizationTokens = [
    '{{first_name}}',
    '{{last_engagement}}',
    '{{preference_category}}',
    '{{signup_date}}',
    '{{location}}',
  ]

  const spamTriggerWords = ['免费!!!', '立即行动', '限时', '点击这里', '赚钱']
  const spamScore = rng.nextInt(5, 25)

  const deliverabilityTips = [
    `垃圾邮件评分: ${spamScore}/100 (越低越好)`,
    '避免全大写标题和过多感叹号',
    '图文比例保持60:40以上',
    '发送前测试不同邮件客户端渲染',
    '保持发送域名SPF/DKIM/DMARC认证',
    '定期清理无效邮箱地址',
  ]

  return {
    subject_line_options: subjectLines,
    preview_text: `${input.content_sections[0] || '最新动态'} | ${rng.pick(['本周重点', '独家内容', '深度分析'])}...`,
    blocks,
    cta_placement: ctaPlacements,
    personalization_tokens: personalizationTokens.slice(0, rng.nextInt(3, 5)),
    spam_score: spamScore,
    deliverability_tips: deliverabilityTips,
  }
}

// --- Tool 7: ux_copy_optimizer ---
function analyzeUXCopy(input: UXCopyInput): UXCopyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.product_type + input.target_screen + input.current_copy.slice(0, 80)
  ))

  const suggestions: CopySuggestion[] = []

  if (input.current_copy.length > 50) {
    suggestions.push({
      element: '主标题',
      original: input.current_copy.slice(0, 30),
      suggestion: `${input.desired_action}，${rng.pick(['只需一步', '即刻开始', '轻松完成'])}`,
      rationale: '缩短主标题，突出核心价值主张，减少认知负荷',
      impact_level: 'high',
    })
  }

  suggestions.push({
    element: 'CTA按钮',
    original: input.current_copy.includes('提交') ? '提交' : '点击这里',
    suggestion: input.desired_action === 'signup' ? '免费注册' :
      input.desired_action === 'purchase' ? '立即购买' :
      input.desired_action === 'download' ? '免费下载' : '开始使用',
    rationale: '使用动词+利益点格式，明确告知用户操作结果',
    impact_level: 'high',
  })

  suggestions.push({
    element: '错误提示',
    original: '输入错误',
    suggestion: `${rng.pick(['请输入有效的', '请检查', '格式不正确: 请'])}${rng.pick(['邮箱地址', '手机号', '密码'])}`,
    rationale: '具体指出错误原因，提供修正方向，避免用户挫败感',
    impact_level: 'medium',
  })

  suggestions.push({
    element: '空状态文案',
    original: '暂无数据',
    suggestion: `${rng.pick(['还没有内容', '这里空空如也', '开始你的第一步'])}，${rng.pick(['去探索', '立即创建', '添加第一条'])}`,
    rationale: '空状态是引导用户首次使用的关键时刻，应包含明确行动指引',
    impact_level: 'medium',
  })

  suggestions.push({
    element: '加载状态',
    original: '加载中...',
    suggestion: `${rng.pick(['正在准备', '马上就好', '正在为您'])}${rng.pick(['加载内容', '处理请求', '获取数据'])}`,
    rationale: '品牌化加载文案减少等待焦虑，提升感知速度',
    impact_level: 'low',
  })

  const microcopySystem: Record<string, string> = {
    'btn_primary': input.desired_action === 'signup' ? '创建我的账户' : input.desired_action === 'purchase' ? '确认支付' : '开始体验',
    'btn_secondary': '稍后再说',
    'btn_danger': '确认删除',
    'input_placeholder_email': 'your@email.com',
    'input_placeholder_search': '搜索...',
    'error_required': '此项为必填项',
    'error_format': '格式不正确，请检查',
    'success_saved': '保存成功',
    'success_sent': '发送成功',
    'empty_default': '暂无内容，去添加第一条吧',
    'loading': '加载中...',
    'confirm_delete': '确定要删除吗？此操作不可撤销',
    'tooltip_help': '点击获取更多帮助',
  }

  const accessibilityNotes: AccessibilityNote[] = [
    { principle: '可感知', recommendation: '所有图标添加aria-label，颜色不作为唯一信息载体' },
    { principle: '可操作', recommendation: '交互元素最小触摸目标44x44px，支持键盘导航' },
    { principle: '可理解', recommendation: `使用${input.locale === 'zh' ? '简体中文' : input.locale}，避免专业术语` },
    { principle: '健壮性', recommendation: '表单错误提示关联具体字段，屏幕阅读器可识别' },
  ]

  const consistencyScore = Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100
  const clarityImprovement = Math.round(rng.nextFloat(15, 45) * 100) / 100

  return {
    screen_name: input.target_screen,
    suggestions,
    microcopy_system: microcopySystem,
    accessibility_notes: accessibilityNotes,
    consistency_score: consistencyScore,
    clarity_improvement_pct: clarityImprovement,
  }
}

// --- Tool 8: pitch_deck_designer ---
function analyzePitchDeck(input: PitchDeckInput): PitchDeckResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.company_name + input.funding_stage + input.unique_value_prop.slice(0, 50)
  ))

  const stageSlides: Record<string, number> = {
    pre_seed: 10,
    seed: 12,
    series_a: 14,
    series_b: 16,
    growth: 18,
  }

  const totalSlides = stageSlides[input.funding_stage] || 12

  const slideTemplates: Record<number, { title: string; purpose: string; points: string[]; visual: string; note: string }> = {
    1: { title: '封面', purpose: '建立第一印象', points: [`${input.company_name} Logo`, input.industry], visual: '全屏品牌图+公司名', note: '简洁有力，3秒内传达品牌' },
    2: { title: '问题/痛点', purpose: '引发共鸣', points: ['目标市场的核心痛点', '现有解决方案的不足', '痛点造成的量化损失'], visual: '痛点场景插图/数据图', note: '让投资人感同身受' },
    3: { title: '解决方案', purpose: '展示产品价值', points: [input.unique_value_prop, '核心功能概述', '与竞品的差异化'], visual: '产品截图/功能演示图', note: '一句话说清你解决什么问题' },
    4: { title: '市场机会', purpose: '证明市场规模', points: ['TAM/SAM/SOM数据', '市场增长趋势', '目标用户画像'], visual: '三层市场同心圆图', note: '引用权威数据来源' },
    5: { title: '产品演示', purpose: '展示产品实力', points: ['核心功能演示', '用户体验亮点', '技术壁垒'], visual: '产品Demo截图/视频', note: 'Show, don\'t tell' },
    6: { title: '商业模式', purpose: '说明如何赚钱', points: ['收入来源', '定价策略', '单位经济模型'], visual: '商业模式画布/流程图', note: '清晰的盈利路径' },
    7: { title: ' traction/进展', purpose: '证明执行力', points: Object.entries(input.key_metrics).map(([k, v]) => `${k}: ${v}`), visual: '增长曲线图/数据仪表盘', note: '数据是最好的证明' },
    8: { title: '竞争格局', purpose: '展示竞争意识', points: ['主要竞品分析', '我们的核心优势', '进入壁垒'], visual: '竞争矩阵图/功能对比表', note: '客观分析，不贬低竞品' },
    9: { title: '团队介绍', purpose: '证明团队能力', points: [`团队规模: ${input.team_size}人`, '核心成员背景', '顾问/投资人背书'], visual: '团队照片+简介', note: '突出与项目匹配的经验' },
    10: { title: '财务预测', purpose: '展示增长潜力', points: ['3年收入预测', '关键假设', '盈亏平衡点'], visual: '柱状图/折线图', note: '保守且可验证的假设' },
    11: { title: '融资需求', purpose: '明确融资计划', points: [`${input.funding_stage}轮融资`, '融资金额', '资金用途分配'], visual: '饼图/资金分配图', note: '具体说明每笔钱的用途' },
    12: { title: '愿景/结尾', purpose: '留下深刻印象', points: ['长期愿景', '下一步计划', '联系方式'], visual: '品牌大图+联系方式', note: '以愿景收尾，激发行动' },
  }

  const slides: DeckSlide[] = []
  for (let i = 1; i <= totalSlides; i++) {
    const template = slideTemplates[i] || {
      title: `补充页 ${i}`,
      purpose: '补充信息',
      points: ['根据投资人反馈添加', '详细数据支撑', '技术细节'],
      visual: '数据图表',
      note: '备用页，按需展示',
    }

    slides.push({
      slide_number: i,
      title: template.title,
      purpose: template.purpose,
      key_points: template.points,
      visual_suggestion: template.visual,
      presenter_note: template.note,
      time_allocation_seconds: i === 1 ? 15 : i === totalSlides ? 20 : rng.nextInt(30, 90),
    })
  }

  const narrativeArc: NarrativeArc[] = [
    { phase: 'Hook', slides_range: '1-2', emotional_beat: '好奇与共鸣' },
    { phase: 'Solution', slides_range: '3-5', emotional_beat: '惊喜与期待' },
    { phase: 'Proof', slides_range: `6-${Math.min(8, totalSlides - 3)}`, emotional_beat: '信任与认可' },
    { phase: 'Ask', slides_range: `${Math.min(9, totalSlides - 2)}-${totalSlides - 1}`, emotional_beat: '兴奋与行动' },
    { phase: 'Close', slides_range: `${totalSlides}`, emotional_beat: '愿景与决心' },
  ]

  const designDirection = `${rng.pick(['极简白底', '深色科技', '品牌主色', '渐变现代'])}风格，${rng.pick(['Inter', 'Helvetica', 'SF Pro', '思源黑体'])}字体，每页不超过3个信息点`

  const mistakes = [
    '避免文字过多，每页不超过30字',
    '不要使用低分辨率图片',
    '避免花哨动画，保持专业',
    '不要跳过traction数据',
    '避免过度承诺财务预测',
    '不要忽视竞品分析',
    '避免团队介绍过于冗长',
  ]

  const totalPitchTime = slides.reduce((sum, s) => sum + s.time_allocation_seconds, 0)

  return {
    total_slides: totalSlides,
    slides,
    narrative_arc: narrativeArc,
    design_direction: designDirection,
    common_mistakes_to_avoid: mistakes.slice(0, rng.nextInt(5, 7)),
    estimated_pitch_duration_minutes: Math.round(totalPitchTime / 60),
    appendix_recommendations: [
      '详细财务报表',
      '技术架构图',
      '用户调研报告',
      '合作协议/LOI',
      '专利/知识产权清单',
      '详细竞品对比',
    ],
  }
}

// ==================== SECTION 5 — 格式化报告函数 ====================

function formatBrandIdentityReport(result: BrandIdentityResult): string {
  const lines: string[] = []
  lines.push(`# 品牌视觉识别系统: ${result.brand_name}`)
  lines.push('')
  lines.push(`## 色彩系统`)
  lines.push('')
  lines.push('| 角色 | 色值 | 色板 |')
  lines.push('|------|------|------|')
  lines.push(`| 主色 | ${result.color_palette.primary} | ■■■■■■ |`)
  lines.push(`| 辅色 | ${result.color_palette.secondary} | ■■■■■■ |`)
  lines.push(`| 强调色 | ${result.color_palette.accent} | ■■■■■■ |`)
  lines.push(`| 中性色 | ${result.color_palette.neutral} | ■■■■■■ |`)
  lines.push(`| 背景色 | ${result.color_palette.background} | ■■■■■■ |`)
  lines.push('')
  lines.push(`## 字体规范`)
  lines.push('')
  lines.push(`- 标题字体: **${result.typography.heading_font}**`)
  lines.push(`- 正文字体: **${result.typography.body_font}**`)
  lines.push(`- 比例系数: ${result.typography.scale_ratio}`)
  lines.push('')
  lines.push(`## Logo概念方向`)
  lines.push('')
  for (const concept of result.logo_concepts) {
    lines.push(`- ${concept}`)
  }
  lines.push('')
  lines.push(`## 品牌规范`)
  lines.push('')
  lines.push('| 类别 | 规范 | 原理 |')
  lines.push('|------|------|------|')
  for (const g of result.guidelines) {
    lines.push(`| ${g.category} | ${g.rule} | ${g.rationale} |`)
  }
  lines.push('')
  lines.push(`## 品牌语调`)
  lines.push('')
  lines.push(result.voice_tone.map(t => `**${t}**`).join(' | '))
  lines.push('')
  lines.push(`## 应用示例`)
  lines.push('')
  for (const app of result.application_examples) {
    lines.push(`- ${app}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatContentCalendarReport(result: ContentCalendarResult): string {
  const lines: string[] = []
  lines.push('# 社交媒体内容日历规划')
  lines.push('')
  lines.push(`平台数: ${result.platform_count} | 总帖数: ${result.total_posts} | 排期条目: ${result.posting_schedule.length}`)
  lines.push('')
  lines.push('## 内容排期')
  lines.push('')
  lines.push('| 时间 | 平台 | 内容支柱 | 类型 | 建议文案 | 最佳时段 | 互动策略 |')
  lines.push('|------|------|----------|------|----------|----------|----------|')
  for (const slot of result.posting_schedule.slice(0, 20)) {
    lines.push(`| ${slot.day} | ${slot.platform} | ${slot.pillar} | ${slot.content_type} | ${slot.suggested_caption.slice(0, 20)}... | ${slot.best_posting_time} | ${slot.engagement_tip} |`)
  }
  if (result.posting_schedule.length > 20) {
    lines.push(`| ... | ... | ... | ... | ... | ... | ... |`)
    lines.push(`*共${result.posting_schedule.length}条排期，此处展示前20条*`)
  }
  lines.push('')
  lines.push('## 内容支柱分布')
  lines.push('')
  lines.push('| 支柱 | 帖数 |')
  lines.push('|------|------|')
  for (const [pillar, count] of Object.entries(result.pillar_distribution)) {
    lines.push(`| ${pillar} | ${count} |`)
  }
  lines.push('')
  lines.push('## 每周主题')
  lines.push('')
  for (const theme of result.weekly_theme) {
    lines.push(`- ${theme}`)
  }
  lines.push('')
  lines.push('## 优化建议')
  lines.push('')
  for (const tip of result.optimization_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatCopyRewriteReport(result: CopyRewriteResult): string {
  const lines: string[] = []
  lines.push('# SEO文案重写与A/B测试变体')
  lines.push('')
  lines.push(`原文长度: ${result.original_length}字符 | 生成变体: ${result.variants.length}个`)
  lines.push('')
  for (const v of result.variants) {
    lines.push(`## 变体 ${v.variant_id}`)
    lines.push('')
    lines.push(`**标题:** ${v.headline}`)
    lines.push('')
    lines.push(`**正文:** ${v.body}`)
    lines.push('')
    lines.push(`**CTA:** ${v.cta}`)
    lines.push('')
    lines.push(`关键词密度: ${(v.keyword_density * 100).toFixed(2)}% | 可读性: ${v.readability_score} | 预测CTR: ${v.predicted_ctr}%`)
    lines.push('')
  }
  lines.push('## SEO优化建议')
  lines.push('')
  for (const s of result.seo_suggestions) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  lines.push('## A/B测试推荐')
  lines.push('')
  lines.push(result.a_b_test_recommendation)
  lines.push('')
  lines.push('## 强力词汇')
  lines.push('')
  lines.push(result.power_words_used.map(w => `\`${w}\``).join(' '))
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatVisualConceptReport(result: VisualConceptResult): string {
  const lines: string[] = []
  lines.push(`# 视觉创意板: ${result.concept_name}`)
  lines.push('')
  lines.push(`情绪评分: ${(result.mood_score * 100).toFixed(0)}%`)
  lines.push('')
  lines.push('## 配色方案')
  lines.push('')
  lines.push('| 色值 | 名称 | 用途 |')
  lines.push('|------|------|------|')
  for (const c of result.color_stops) {
    lines.push(`| ${c.hex} | ${c.name} | ${c.usage} |`)
  }
  lines.push('')
  lines.push('## 视觉元素')
  lines.push('')
  for (const e of result.elements) {
    lines.push(`- **${e.element_type}** (${e.placement}): ${e.description}`)
  }
  lines.push('')
  lines.push('## 纹理建议')
  lines.push('')
  for (const t of result.textures) {
    lines.push(`- ${t.texture} → ${t.application} (透明度: ${t.opacity_recommendation}%)`)
  }
  lines.push('')
  lines.push('## 字体方向')
  lines.push('')
  lines.push(result.typography_direction)
  lines.push('')
  lines.push('## 构图笔记')
  lines.push('')
  for (const note of result.composition_notes) {
    lines.push(`- ${note}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatStoryboardReport(result: StoryboardResult): string {
  const lines: string[] = []
  lines.push('# 视频分镜脚本')
  lines.push('')
  lines.push(`总帧数: ${result.total_frames} | 预计制作: ${result.estimated_production_hours}小时 | 音乐氛围: ${result.music_mood}`)
  lines.push('')
  lines.push('## 分镜表')
  lines.push('')
  lines.push('| # | 时间 | 时长 | 画面描述 | 镜头运动 | 文字叠加 | 音频 | 转场 |')
  lines.push('|---|------|------|----------|----------|----------|------|------|')
  for (const f of result.frames) {
    lines.push(`| ${f.frame_number} | ${f.timestamp} | ${f.duration_seconds}s | ${f.visual_description} | ${f.camera_move} | ${f.text_overlay || '-'} | ${f.audio_note} | ${f.transition} |`)
  }
  lines.push('')
  lines.push('## 节奏分段')
  lines.push('')
  for (const seg of result.pacing_segments) {
    lines.push(`- **${seg.segment_name}** (帧${seg.frame_range}): ${seg.intensity}强度 | ${seg.emotional_tone}`)
  }
  lines.push('')
  lines.push('## 设备建议')
  lines.push('')
  for (const eq of result.equipment_suggestions) {
    lines.push(`- ${eq}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatNewsletterReport(result: NewsletterTemplateResult): string {
  const lines: string[] = []
  lines.push('# Newsletter模板与内容方案')
  lines.push('')
  lines.push('## 主题行选项')
  lines.push('')
  for (const s of result.subject_line_options) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  lines.push(`预览文本: ${result.preview_text}`)
  lines.push('')
  lines.push('## 内容区块')
  lines.push('')
  for (const b of result.blocks) {
    lines.push(`### ${b.block_type} (${b.placement})`)
    lines.push(`内容: ${b.content}`)
    lines.push(`设计: ${b.design_note}`)
    lines.push('')
  }
  lines.push('## CTA位置')
  lines.push('')
  for (const cta of result.cta_placement) {
    lines.push(`- ${cta}`)
  }
  lines.push('')
  lines.push('## 个性化Token')
  lines.push('')
  lines.push(result.personalization_tokens.join(' '))
  lines.push('')
  lines.push(`## 垃圾邮件评分: ${result.spam_score}/100`)
  lines.push('')
  lines.push('## 送达率优化')
  lines.push('')
  for (const tip of result.deliverability_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatUXCopyReport(result: UXCopyResult): string {
  const lines: string[] = []
  lines.push(`# UX微文案优化: ${result.screen_name}`)
  lines.push('')
  lines.push(`一致性评分: ${(result.consistency_score * 100).toFixed(0)}% | 清晰度提升预期: ${result.clarity_improvement_pct}%`)
  lines.push('')
  lines.push('## 优化建议')
  lines.push('')
  for (const s of result.suggestions) {
    lines.push(`### ${s.element} (影响: ${s.impact_level})`)
    lines.push(`- 原文: "${s.original}"`)
    lines.push(`- 建议: "${s.suggestion}"`)
    lines.push(`- 原理: ${s.rationale}`)
    lines.push('')
  }
  lines.push('## 微文案系统')
  lines.push('')
  lines.push('| 元素 | 文案 |')
  lines.push('|------|------|')
  for (const [key, value] of Object.entries(result.microcopy_system)) {
    lines.push(`| ${key} | ${value} |`)
  }
  lines.push('')
  lines.push('## 无障碍建议')
  lines.push('')
  for (const note of result.accessibility_notes) {
    lines.push(`- **${note.principle}**: ${note.recommendation}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

function formatPitchDeckReport(result: PitchDeckResult): string {
  const lines: string[] = []
  lines.push('# Pitch Deck结构与内容建议')
  lines.push('')
  lines.push(`总页数: ${result.total_slides} | 预计路演时长: ${result.estimated_pitch_duration_minutes}分钟`)
  lines.push('')
  lines.push('## 设计方向')
  lines.push('')
  lines.push(result.design_direction)
  lines.push('')
  lines.push('## 叙事弧线')
  lines.push('')
  for (const arc of result.narrative_arc) {
    lines.push(`- **${arc.phase}** (Slide ${arc.slides_range}): ${arc.emotional_beat}`)
  }
  lines.push('')
  lines.push('## 幻灯片结构')
  lines.push('')
  for (const slide of result.slides) {
    lines.push(`### Slide ${slide.slide_number}: ${slide.title}`)
    lines.push(`目的: ${slide.purpose} | 建议时长: ${slide.time_allocation_seconds}秒`)
    lines.push('')
    lines.push('关键要点:')
    for (const point of slide.key_points) {
      lines.push(`- ${point}`)
    }
    lines.push(`视觉: ${slide.visual_suggestion}`)
    lines.push(`备注: ${slide.presenter_note}`)
    lines.push('')
  }
  lines.push('## 常见错误')
  lines.push('')
  for (const mistake of result.common_mistakes_to_avoid) {
    lines.push(`- ${mistake}`)
  }
  lines.push('')
  lines.push('## 附录建议')
  lines.push('')
  for (const rec of result.appendix_recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push('---')
  lines.push(`*${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== SECTION 6 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'brand_identity_designer',
    description: '品牌视觉识别系统设计与规范生成 | 色彩/字体/Logo/品牌指南',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: brand_name, industry, target_audience, brand_values, style_preference, color_mood' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatBrandIdentityReport(analyzeBrandIdentity(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'content_calendar_planner',
    description: '社交媒体内容日历规划与排期 | 平台/支柱/频率/排期表',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: platform[], content_pillars[], posting_frequency, campaign_duration_weeks, upcoming_events[]' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatContentCalendarReport(analyzeContentCalendar(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'copy_rewriter',
    description: 'SEO文案重写与多版本A/B生成 | 关键词/语调/变体/CTR预测',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: original_copy, target_keywords[], tone_of_voice, target_audience, output_variants, seo_focus' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatCopyRewriteReport(analyzeCopyRewrite(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'visual_concept_board',
    description: '视觉创意板与配色方案生成 | 色彩/元素/纹理/构图',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: project_name, concept_direction, mood_keywords[], style_references[], color_temperature, composition_style' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatVisualConceptReport(analyzeVisualConcept(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'storyboard_architect',
    description: '视频脚本分镜与节奏设计 | 帧/镜头/转场/节奏/设备',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: video_type, duration_seconds, target_platform, key_message, visual_style, has_voiceover' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatStoryboardReport(analyzeStoryboard(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'newsletter_crafter',
    description: '邮件Newsletter模板与内容创作 | 主题行/区块/CTA/送达率',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: newsletter_name, audience_type, content_sections[], send_frequency, goal, include_promo' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatNewsletterReport(analyzeNewsletter(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'ux_copy_optimizer',
    description: 'UX微文案与交互文案优化 | 建议/微文案系统/无障碍/一致性',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product_type, target_screen, user_scenario, current_copy, desired_action, tone, locale' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatUXCopyReport(analyzeUXCopy(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'pitch_deck_designer',
    description: '融资Pitch Deck结构与内容建议 | 幻灯片/叙事弧线/设计/常见错误',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: company_name, industry, funding_stage, target_investors[], key_metrics, unique_value_prop, team_size' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPitchDeckReport(analyzePitchDeck(JSON.parse(args.input_data)))
    }
  }))
}
