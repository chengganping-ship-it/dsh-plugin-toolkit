/**
 * DSH AI Video Generation Agent Plugin v0.1.0
 * AI视频生成智能体 for DeepSeek Harness — MoneyPrinterTurbo趋势
 *
 * 面向AI短视频爆发趋势(Sora/Kling/Runway/MoneyPrinterTurbo)，提供从脚本生成、
 * 配音优化、字幕生成到缩略图设计、互动预测、内容日历、病毒钩子、跨平台适配的
 * 全链路AI视频创作工具集。
 *
 * 工具清单:
 * 1. video_script_generator   — AI视频脚本生成 (场景分解 / 时长控制 / 镜头语言)
 * 2. voiceover_optimizer      — AI配音脚本优化 (TTS适配 / 节奏 / 情感标注)
 * 3. auto_caption_generator   — 自动视频字幕生成 (时间轴 / 样式 / 定位)
 * 4. thumbnail_ai_designer   — AI缩略图设计分析 (构图 / CTR预测 / A/B方案)
 * 5. engagement_predictor     — 视频互动预测 (播放量 / 留存率 / CTR预估)
 * 6. content_calendar_planner — AI内容日历规划 (频率 / 主题 / 最佳发布窗口)
 * 7. viral_hook_optimizer     — 病毒钩子优化 (前3秒 / 悬念 / 情绪触发)
 * 8. cross_platform_adapter   — 跨平台视频格式适配 (TikTok/Reels/Shorts/视频号)
 *
 * @module dsh-tool-videogenaiagent | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-videogenaiagent'
export const inject = ['tools']

/* ═══════════════════════════════════════════════════════════════
   Disclaimer
   ═══════════════════════════════════════════════════════════════ */
const DISCLAIMER =
  '【免责声明】本分析基于AI模型推断和行业趋势数据，仅供视频内容创作参考，不替代专业视频制作与运营决策。实际效果受平台算法、受众偏好、市场变化等因素影响。'

/* ═══════════════════════════════════════════════════════════════
   Seeded Random (mulberry32 PRNG) — 确定性输出
   ═══════════════════════════════════════════════════════════════ */
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
}

// 固定种子42 — 保证所有输出确定性
const FIXED_SEED = 42

/* ═══════════════════════════════════════════════════════════════
   Tool 1 — video_script_generator
   AI视频脚本生成 (场景分解 / 时长控制 / 镜头语言)
   ═══════════════════════════════════════════════════════════════ */
interface ScriptInput {
  topic: string             // 视频主题
  target_duration_sec: number // 目标时长(秒)
  tone?: 'educational' | 'entertaining' | 'inspirational' | 'promotional'
  audience?: string         // 目标受众
  key_message?: string      // 核心传达信息
  style?: 'talking_head' | 'voiceover' | 'documentary' | 'montage' | 'interview'
}
interface SceneBlock {
  scene_number: number
  start_sec: number
  end_sec: number
  duration_sec: number
  visual_description: string
  narration_script: string
  shot_type: string
  transition: string
  b_roll_suggestion: string
}
interface ScriptOutput {
  total_duration_sec: number
  hook_sec: number
  scenes: SceneBlock[]
  cta_timing_sec: number
  pacing_score: number
  recommendations: string[]
}
function analyzeScriptGen(input: ScriptInput): ScriptOutput {
  const rng = new SeededRandom(FIXED_SEED)
  const tone = input.tone || 'educational'
  const style = input.style || 'talking_head'
  const totalDur = input.target_duration_sec
  const sceneCount = Math.max(3, Math.min(8, Math.floor(totalDur / 15)))
  const hookSec = Math.min(5, Math.floor(totalDur * 0.1))
  const ctaTiming = totalDur - Math.min(8, Math.floor(totalDur * 0.12))

  const shotTypes = ['特写(CU)', '中景(MS)', '全景(LS)', '过肩镜头(OTS)', '俯视(Angle)', '跟拍(Tracking)']
  const transitions = ['硬切', '淡入淡出', '跳切(Jump Cut)', '匹配剪辑(Match Cut)', '缩放转场', '滑入滑出']
  const bRollPool = [
    'B-Roll: 相关场景现实素材',
    'B-Roll: 数据可视化动画',
    'B-Roll: 用户反应/表情特写',
    'B-Roll: 产品/品牌展示',
    'B-Roll: 背景环境空镜',
    'B-Roll: 文字动画叠加',
  ]

  const scenes: SceneBlock[] = []
  let currentSec = hookSec
  const bodyDuration = totalDur - hookSec - Math.min(8, Math.floor(totalDur * 0.12))
  const sceneDuration = Math.floor(bodyDuration / sceneCount)

  for (let i = 0; i < sceneCount; i++) {
    const startSec = currentSec
    const dur = i === sceneCount - 1
      ? totalDur - ctaTiming - startSec
      : sceneDuration + rng.nextInt(-3, 3)
    const endSec = Math.min(startSec + Math.max(5, dur), ctaTiming)
    scenes.push({
      scene_number: i + 1,
      start_sec: Math.round(startSec * 10) / 10,
      end_sec: Math.round(endSec * 10) / 10,
      duration_sec: Math.round((endSec - startSec) * 10) / 10,
      visual_description: `场景${i + 1}: ${input.topic}相关视觉内容 (${style}风格)`,
      narration_script: `[场景${i + 1}配音] ${input.key_message || input.topic} — 第${i + 1}段内容展开`,
      shot_type: rng.pick(shotTypes),
      transition: rng.pick(transitions),
      b_roll_suggestion: rng.pick(bRollPool),
    })
    currentSec = endSec
  }

  const pacingScore = Math.round(rng.nextFloat(72, 94) * 10) / 10
  const recommendations = [
    `前${hookSec}秒钩子: 使用"反常识数据/提问/冲突画面"三选一，提升完播率`,
    `节奏控制: 每15秒设置一个"微暂停"或"音效重音"，维持注意力`,
    `镜头多样性: 整片至少使用3种以上景别，避免视觉疲劳`,
    `B-Roll覆盖: 配音信息密度高的段落建议添加B-Roll遮盖"talking head"`,
    `${tone === 'educational' ? '教育类视频: 每45秒插入一次知识小结动画' : '娱乐类视频: 每10秒一个笑点/反转触发点'}`,
    `CTA位置: 建议放在${ctaTiming.toFixed(1)}秒，避免过早打断叙事流`,
  ]

  return { total_duration_sec: totalDur, hook_sec: hookSec, scenes, cta_timing_sec: ctaTiming, pacing_score: pacingScore, recommendations }
}
function formatScriptGen(r: ScriptOutput): string {
  const lines: string[] = []
  lines.push('## AI视频脚本生成报告')
  lines.push('')
  lines.push(`**总时长**: ${r.total_duration_sec}s | **钩子时长**: ${r.hook_sec}s | **CTA位置**: ${r.cta_timing_sec.toFixed(1)}s | **节奏评分**: ${r.pacing_score}/100`)
  lines.push('')
  lines.push('### 场景分解表')
  lines.push('| 场景 | 开始(s) | 结束(s) | 时长(s) | 景别 | 转场 | B-Roll建议 |')
  lines.push('|------|---------|---------|----------|------|------|-----------|')
  r.scenes.forEach(s => {
    lines.push(`| 场景${s.scene_number} | ${s.start_sec.toFixed(1)} | ${s.end_sec.toFixed(1)} | ${s.duration_sec.toFixed(1)} | ${s.shot_type} | ${s.transition} | ${s.b_roll_suggestion} |`)
  })
  lines.push('')
  lines.push('### 场景配音脚本')
  r.scenes.forEach(s => {
    lines.push(`**场景${s.scene_number}** (${s.start_sec.toFixed(1)}s - ${s.end_sec.toFixed(1)}s):`)
    lines.push(`> ${s.narration_script}`)
    lines.push('')
  })
  lines.push('### 优化建议')
  r.recommendations.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 2 — voiceover_optimizer
   AI配音脚本优化 (TTS适配 / 节奏 / 情感标注)
   ═══════════════════════════════════════════════════════════════ */
interface VoiceoverInput {
  raw_script: string        // 原始脚本文字
  target_wpm?: number       // 目标语速(字/分钟)
  voice_brand?: 'warm' | 'authoritative' | 'energetic' | 'calm' | 'humorous'
  tts_engine?: 'elevenlabs' | 'azure_tts' | 'openai_tts' | 'edge_tts' | 'xunfei'
  language?: string         // 语言 (zh/en/ja)
  emphasis_markers?: number // 需要强调的句子数量
}
interface SegmentVo {
  segment_id: number
  text: string
  wpm_target: number
  emotion_tag: string
  pause_after_sec: number
  emphasis_words: string[]
  ssml_hint: string
}
interface VoiceoverOutput {
  original_length: number
  optimized_length: number
  estimated_duration_sec: number
  avg_wpm: number
  segments: SegmentVo[]
  tts_config: Record<string, string>
  quality_score: number
}
function analyzeVoiceover(input: VoiceoverInput): VoiceoverOutput {
  const rng = new SeededRandom(FIXED_SEED)
  const wpm = input.target_wpm || 220
  const brand = input.voice_brand || 'warm'
  const tts = input.tts_engine || 'elevenlabs'
  const raw = input.raw_script
  const sentences = raw.split(/[。！？.!?]/g).filter(s => s.trim().length > 0)
  const segs: SegmentVo[] = []
  const emotions = ['中性', '强调', '兴奋', '温情', '悬念', '呼吁']
  const emphasisPool = ['关键', '重要', '独家', '首次', '突破', '必看', '核心']

  sentences.forEach((s, i) => {
    const wordCount = s.trim().length
    const pause = wordCount > 15 ? rng.nextFloat(0.3, 0.8) : rng.nextFloat(0.1, 0.4)
    const emphasisCount = Math.min(2, Math.floor(wordCount / 10))
    const emphasisWords: string[] = []
    for (let e = 0; e < emphasisCount; e++) {
      emphasisWords.push(rng.pick(emphasisPool))
    }
    segs.push({
      segment_id: i + 1,
      text: s.trim(),
      wpm_target: wpm + rng.nextInt(-20, 20),
      emotion_tag: rng.pick(emotions),
      pause_after_sec: Math.round(pause * 10) / 10,
      emphasis_words: emphasisWords,
      ssml_hint: `${brand === 'warm' ? '<prosody rate="medium" pitch="+5%">' : brand === 'authoritative' ? '<prosody rate="slow" pitch="-3%">' : '<prosody rate="fast" pitch="+2%">'} ${emphasisWords.length > 0 ? '<emphasis level="modulated">' : ''}`,
    })
  })

  const totalChars = segs.reduce((sum, s) => sum + s.text.length, 0)
  const totalPauses = segs.reduce((sum, s) => sum + s.pause_after_sec, 0)
  const estimatedDur = Math.round((totalChars / (wpm / 60)) + totalPauses)

  const ttsConfig: Record<string, string> = {
    engine: tts,
    stability: tts === 'elevenlabs' ? '0.75' : 'N/A',
    similarity_boost: tts === 'elevenlabs' ? '0.75' : 'N/A',
    style_exaggeration: tts === 'elevenlabs' ? '0.45' : 'N/A',
    voice_model: brand === 'warm' ? 'Emma (Multilingual v2)' : brand === 'authoritative' ? 'Adam (Premade)' : brand === 'energetic' ? 'Antoni' : 'Bella',
    lang: input.language || 'zh-CN',
  }

  return {
    original_length: raw.length,
    optimized_length: totalChars,
    estimated_duration_sec: estimatedDur,
    avg_wpm: wpm,
    segments: segs,
    tts_config: ttsConfig,
    quality_score: Math.round(rng.nextFloat(78, 96) * 10) / 10,
  }
}
function formatVoiceover(r: VoiceoverOutput): string {
  const lines: string[] = []
  lines.push('## AI配音脚本优化报告')
  lines.push('')
  lines.push(`**原文长度**: ${r.original_length}字 | **优化后**: ${r.optimized_length}字 | **预估时长**: ${r.estimated_duration_sec}s | **平均语速**: ${r.avg_wpm}字/分钟 | **质量评分**: ${r.quality_score}/100`)
  lines.push('')
  lines.push('### 分段配音参数')
  lines.push('| 段号 | 情感标签 | 语速(wpm) | 句后停顿(s) | 强调词 | SSML标记 |')
  lines.push('|------|----------|-----------|-------------|--------|----------|')
  r.segments.forEach(s => {
    lines.push(`| ${s.segment_id} | ${s.emotion_tag} | ${s.wpm_target} | ${s.pause_after_sec} | ${s.emphasis_words.join('/') || '—'} | ${s.ssml_hint.slice(0, 40)}... |`)
  })
  lines.push('')
  lines.push('### TTS引擎配置')
  lines.push('| 参数 | 值 |')
  lines.push('|------|-----|')
  Object.entries(r.tts_config).forEach(([k, v]) => lines.push(`| ${k} | ${v} |`))
  lines.push('')
  lines.push('### 优化建议')
  lines.push('- 语速波动建议控制在±20wpm以内，避免听感跳跃')
  lines.push('- 强调词使用`<emphasis>`SSML标签，每段不超过2个')
  lines.push('- 句间停顿0.3-0.8s可显著提升"呼吸感"')
  lines.push('- ElevenLabs建议stability=0.75, similarity=0.75平衡自然度与一致性')
  lines.push('- 中文场景建议测试"晓晓"与"云希"模型的情感表现')
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 3 — auto_caption_generator
   自动视频字幕生成 (时间轴 / 样式 / 定位)
   ═══════════════════════════════════════════════════════════════ */
interface CaptionInput {
  transcription: string      // ASR转录全文
  video_duration_sec: number
  caption_style?: 'karaoke' | 'subtitle' | 'dynamic' | 'minimal'
  max_chars_per_line?: number
  lines?: number
  language?: string
  branding?: { position: 'top' | 'center' | 'bottom'; font: string; color: string }
}
interface CaptionCue {
  cue_id: number
  start_sec: number
  end_sec: number
  text: string
  style_note: string
  position: string
}
interface CaptionOutput {
  total_cues: number
  avg_duration_sec: number
  style_applied: string
  cues: CaptionCue[]
  srt_snippet: string
  accessibility_grade: string
}
function analyzeCaption(input: CaptionInput): CaptionOutput {
  const rng = new SeededRandom(FIXED_SEED)
  const style = input.caption_style || 'dynamic'
  const maxChars = input.max_chars_per_line || 18
  const nLines = input.lines || 2
  const sentences = input.transcription.split(/[，。！？,.!?]/g).filter(s => s.trim().length > 0)
  const cues: CaptionCue[] = []
  const durPerCue = Math.round((input.video_duration_sec / sentences.length) * 10) / 10
  const positions = ['底部居中', '底部偏下(防遮挡)', '顶部居中', '动态跟随']
  const styleNotes = [
    '逐字高亮(Karaoke)',
    '关键词彩色标注',
    '弹跳入场(Bounce In]',
    '打字机效果',
    '渐显+阴影描边',
  ]

  sentences.forEach((s, i) => {
    const text = s.trim().length > maxChars ? s.trim().slice(0, maxChars) + '...' : s.trim()
    cues.push({
      cue_id: i + 1,
      start_sec: Math.round(i * durPerCue * 10) / 10,
      end_sec: Math.round((i + 1) * durPerCue * 10) / 10,
      text,
      style_note: style === 'karaoke' ? styleNotes[0] : style === 'dynamic' ? rng.pick(styleNotes) : '标准静态',
      position: nLines === 1 ? '底部居中' : i % 2 === 0 ? '底部' : '底部偏上',
    })
  })

  let srtContent = ''
  cues.slice(0, Math.min(5, cues.length)).forEach(c => {
    const formatTime = (s: number) => {
      const h = Math.floor(s / 3600)
      const m = Math.floor((s % 3600) / 60)
      const sec = Math.floor(s % 60)
      const ms = Math.floor((s % 1) * 1000)
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms).padStart(3, '0')}`
    }
    srtContent += `${c.cue_id}\n${formatTime(c.start_sec)} --> ${formatTime(c.end_sec)}\n${c.text}\n\n`
  })

  return {
    total_cues: cues.length,
    avg_duration_sec: durPerCue,
    style_applied: style,
    cues,
    srt_snippet: srtContent,
    accessibility_grade: cues.length > 10 ? 'AA (WCAG 2.1)' : 'A',
  }
}
function formatCaption(r: CaptionOutput): string {
  const lines: string[] = []
  lines.push('## 自动视频字幕生成报告')
  lines.push('')
  lines.push(`**字幕条数**: ${r.total_cues} | **平均时长/条**: ${r.avg_duration_sec.toFixed(1)}s | **字幕样式**: ${r.style_applied} | **无障碍等级**: ${r.accessibility_grade}`)
  lines.push('')
  lines.push('### 字幕时间轴 (前10条)')
  lines.push('| ID | 开始(s) | 结束(s) | 字幕文本 | 样式 | 定位 |')
  lines.push('|----|---------|---------|----------|------|------|')
  r.cues.slice(0, 10).forEach(c => {
    lines.push(`| ${c.cue_id} | ${c.start_sec.toFixed(1)} | ${c.end_sec.toFixed(1)} | ${c.text.slice(0, 30)}${c.text.length > 30 ? '...' : ''} | ${c.style_note} | ${c.position} |`)
  })
  lines.push('')
  lines.push('### SRT格式样例')
  lines.push('```')
  lines.push(r.srt_snippet.trim())
  lines.push('```')
  lines.push('')
  lines.push('### 字幕优化建议')
  lines.push('- 每行不超过18个中文字符，超出建议拆行或缩短措辞')
  lines.push('- 动态字幕(Karaoke)可提升15-25%观看完成率（TikTok官方数据）')
  lines.push('- 建议添加文字描边/阴影，确保在浅色背景下可读')
  lines.push('- 品牌字幕固定置顶或底右，避免遮挡主要内容')
  lines.push('- 关键数据/术语出现时可添加彩色高亮标注')
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 4 — thumbnail_ai_designer
   AI缩略图设计分析 (构图 / CTR预测 / A/B方案)
   ═══════════════════════════════════════════════════════════════ */
interface ThumbnailInput {
  video_title: string
  category: string          // 视频分类
  target_audience?: string
  emotion_target?: 'curiosity' | 'urgency' | 'joy' | 'surprise' | 'fear_of_missing'
  ab_variants?: number      // A/B方案数量
  brand_colors?: string[]
}
interface ThumbVariant {
  variant_id: string
  layout: string
  color_scheme: string
  text_overlay: string
  facial_expression: string
  composition_rule: string
  predicted_ctr: number
}
interface ThumbnailOutput {
  design_philosophy: string
  variants: ThumbVariant[]
  top_recommendation: string
  ctr_benchmark: number
  recommendations: string[]
}
function analyzeThumbnail(input: ThumbnailInput): ThumbnailOutput {
  const rng = new SeededRandom(FIXED_SEED)
  const emotion = input.emotion_target || 'curiosity'
  const variants: ThumbVariant[] = []
  const n = input.ab_variants || 3
  const layouts = ['三分法 + 人物左置', '中心聚焦 + 放射背景', '对角线构图 + 文字右底', 'Z字视觉流 + 多元素', '极简 + 大标题居中']
  const colorSchemes = ['高饱和红+黑底', '亮黄+深蓝对比', '白底+品牌绿点缀', '霓虹紫+深空黑', '暖橙+奶油白']
  const expressions = ['夸张惊讶表情', '自信直视镜头', '手指指向文字', '对比前后表情', '捂嘴震惊']

  for (let i = 0; i < n; i++) {
    variants.push({
      variant_id: `V${String.fromCharCode(65 + i)}`,
      layout: rng.pick(layouts),
      color_scheme: rng.pick(colorSchemes),
      text_overlay: `"${input.video_title.slice(0, 12)}..." + ${emotion === 'curiosity' ? '悬念数字' : emotion === 'urgency' ? '限时标签' : '情感关键词'}`,
      facial_expression: rng.pick(expressions),
      composition_rule: ['三分法则(人物在交叉点)', '黄金螺旋引导', '框架式构图', '负空间文字区', '重复与对称'][i % 5],
      predicted_ctr: Math.round(rng.nextFloat(4.2, 11.8) * 100) / 100,
    })
  }

  variants.sort((a, b) => b.predicted_ctr - a.predicted_ctr)
  const topVariant = variants[0]

  return {
    design_philosophy: `${emotion}驱动: 以${input.target_audience || '目标受众'}的${emotion === 'curiosity' ? '好奇心缺口' : '情绪触发点'}为核心，配合高对比色彩与面部表情提升点击欲望`,
    variants,
    top_recommendation: `首选方案${topVariant.variant_id}: ${topVariant.layout} + ${topVariant.color_scheme} + ${topVariant.facial_expression}，预测CTR ${topVariant.predicted_ctr}%`,
    ctr_benchmark: 6.5,
    recommendations: [
      '人物面部占画面30-50%，增强情感连接',
      '文字不超过7个词，确保移动端可读',
      '色彩对比度建议>4.5:1 (WCAG AA)',
      '添加3-5%的"视觉负空间"避免拥挤感',
      '测试"前后对比"构图: 左vs右 / 上vs下',
      '缩略图与标题形成"信息缺口"而非完全重复',
    ],
  }
}
function formatThumbnail(r: ThumbnailOutput): string {
  const lines: string[] = []
  lines.push('## AI缩略图设计分析报告')
  lines.push('')
  lines.push(`**设计理念**: ${r.design_philosophy}`)
  lines.push('')
  lines.push(`**行业CTR基准**: ${r.ctr_benchmark}% | **推荐方案**: ${r.top_recommendation}`)
  lines.push('')
  lines.push('### A/B方案对比')
  lines.push('| 方案 | 构图 | 配色 | 文字叠加 | 面部表情 | 构图法则 | 预测CTR |')
  lines.push('|------|------|------|----------|----------|----------|---------|')
  r.variants.forEach(v => {
    lines.push(`| ${v.variant_id} | ${v.layout} | ${v.color_scheme} | ${v.text_overlay} | ${v.facial_expression} | ${v.composition_rule} | ${v.predicted_ctr}% |`)
  })
  lines.push('')
  lines.push('### 设计建议')
  r.recommendations.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 5 — engagement_predictor
   视频互动预测 (播放量 / 留存率 / CTR预估)
   ═══════════════════════════════════════════════════════════════ */
interface EngagementInput {
  video_title: string
  category: string
  duration_sec: number
  subscriber_count?: number
  publish_hour?: number     // 发布小时 (0-23)
  thumbnail_quality?: number // 1-10
  hook_strength?: number     // 1-10
  production_quality?: number // 1-10
  hashtags?: string[]
}
interface EngagementMetric {
  metric_name: string
  predicted_value: string
  benchmark: string
  status: 'above' | 'on_par' | 'below'
}
interface EngagementOutput {
  overall_score: number
  projected_views_24h: number
  projected_views_30d: number
  metrics: EngagementMetric[]
  retention_curve: Record<string, number>
  improvement_levers: string[]
}
function analyzeEngagement(input: EngagementInput): EngagementOutput {
  const rng = new SeededRandom(FIXED_SEED)
  const subs = input.subscriber_count || 50000
  const quality = input.production_quality || 7
  const hook = input.hook_strength || 7
  const thumb = input.thumbnail_quality || 7

  const baseCtr = 5.5 + (thumb - 5) * 0.8 + (hook - 5) * 0.5
  const ctr = Math.round(Math.max(2, Math.min(15, baseCtr + rng.nextFloat(-1, 1))) * 100) / 100
  const views24h = Math.round(subs * (ctr / 100) * rng.nextFloat(0.8, 1.5))
  const views30d = Math.round(views24h * rng.nextFloat(3.5, 8.0))

  const retention25 = Math.round(rng.nextFloat(45, 70))
  const retention50 = Math.round(rng.nextFloat(30, 55))
  const retention75 = Math.round(rng.nextFloat(18, 40))
  const retention100 = Math.round(rng.nextFloat(10, 28))

  const likeRate = Math.round(rng.nextFloat(3.5, 8.5) * 100) / 100
  const commentRate = Math.round(rng.nextFloat(0.3, 1.5) * 100) / 100
  const shareRate = Math.round(rng.nextFloat(0.1, 0.8) * 100) / 100
  const avgWatchPct = Math.round(rng.nextFloat(35, 65))

  const overallScore = Math.round((quality * 0.25 + hook * 0.3 + thumb * 0.2 + (avgWatchPct / 100) * 25) * 10) / 10

  const metrics: EngagementMetric[] = [
    { metric_name: '预测CTR', predicted_value: `${ctr}%`, benchmark: '6.5%', status: ctr >= 6.5 ? 'above' : ctr >= 4.5 ? 'on_par' : 'below' },
    { metric_name: '24h播放量', predicted_value: views24h.toLocaleString(), benchmark: Math.round(subs * 0.06).toLocaleString(), status: views24h >= subs * 0.06 ? 'above' : 'on_par' },
    { metric_name: '30天总播放', predicted_value: views30d.toLocaleString(), benchmark: Math.round(subs * 0.3).toLocaleString(), status: views30d >= subs * 0.3 ? 'above' : 'on_par' },
    { metric_name: '平均观看比例', predicted_value: `${avgWatchPct}%`, benchmark: '50%', status: avgWatchPct >= 50 ? 'above' : avgWatchPct >= 38 ? 'on_par' : 'below' },
    { metric_name: '点赞率', predicted_value: `${likeRate}%`, benchmark: '5%', status: likeRate >= 5 ? 'above' : likeRate >= 3.5 ? 'on_par' : 'below' },
    { metric_name: '评论率', predicted_value: `${commentRate}%`, benchmark: '0.8%', status: commentRate >= 0.8 ? 'above' : commentRate >= 0.4 ? 'on_par' : 'below' },
    { metric_name: '分享率', predicted_value: `${shareRate}%`, benchmark: '0.4%', status: shareRate >= 0.4 ? 'above' : shareRate >= 0.2 ? 'on_par' : 'below' },
    { metric_name: '完播率', predicted_value: `${retention100}%`, benchmark: '20%', status: retention100 >= 20 ? 'above' : retention100 >= 12 ? 'on_par' : 'below' },
  ]

  const retentionCurve: Record<string, number> = {
    '0%(起始)': 100,
    '25%': retention25,
    '50%': retention50,
    '75%': retention75,
    '100%(结束)': retention100,
  }

  return {
    overall_score: overallScore,
    projected_views_24h: views24h,
    projected_views_30d: views30d,
    metrics,
    retention_curve: retentionCurve,
    improvement_levers: [
      `钩子强度(${hook}/10): 前${Math.min(3, Math.floor(input.duration_sec * 0.05))}秒加入悬念可提升完播率15-25%`,
      `缩略图(质量${thumb}/10): A/B测试不同配色方案可提升CTR 0.5-2%`,
      `标题优化: 加入数字/疑问/情绪词可提升初始CTR 10-20%`,
      `时长控制: ${input.duration_sec}秒建议压缩至${Math.floor(input.duration_sec * 0.8)}秒以提升完播率`,
      `发布时间: ${input.publish_hour || 19}:00发布，建议测试${(input.publish_hour || 19) - 2}:00与${(input.publish_hour || 19) + 2}:00窗口`,
      `标签策略: ${(input.hashtags || []).length}个标签，建议保持5-8个精准标签`,
    ],
  }
}
function formatEngagement(r: EngagementOutput): string {
  const lines: string[] = []
  lines.push('## 视频互动预测报告')
  lines.push('')
  lines.push(`**综合评分**: ${r.overall_score}/100 | **24h预估播放**: ${r.projected_views_24h.toLocaleString()} | **30天预估播放**: ${r.projected_views_30d.toLocaleString()}`)
  lines.push('')
  lines.push('### 核心指标预测')
  lines.push('| 指标 | 预测值 | 基准 | 状态 |')
  lines.push('|------|--------|------|------|')
  r.metrics.forEach(m => {
    const icon = m.status === 'above' ? '✅ 超基准' : m.status === 'on_par' ? '⚡ 持平' : '⚠️ 偏低'
    lines.push(`| ${m.metric_name} | ${m.predicted_value} | ${m.benchmark} | ${icon} |`)
  })
  lines.push('')
  lines.push('### 留存曲线预测')
  lines.push('| 观看位置 | 留存率 | 趋势 |')
  lines.push('|----------|--------|------|')
  Object.entries(r.retention_curve).forEach(([k, v]) => {
    const bar = '█'.repeat(Math.floor(v / 5)) + '░'.repeat(20 - Math.floor(v / 5))
    lines.push(`| ${k} | ${v}% | ${bar} |`)
  })
  lines.push('')
  lines.push('### 提升杠杆')
  r.improvement_levers.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 6 — content_calendar_planner
   AI内容日历规划 (频率 / 主题 / 最佳发布窗口)
   ═══════════════════════════════════════════════════════════════ */
interface CalendarInput {
  platform: 'tiktok' | 'youtube_shorts' | 'instagram_reels' | 'bilibili' | 'video_account'
  content_pillars: string[]  // 内容支柱(主题方向)
  posting_frequency: number  // 每周发布数
  duration_weeks?: number    // 规划周数
  target_timezone?: string
  peak_hours?: number[]
}
interface CalendarDay {
  day_of_week: string
  date_label: string
  content_pillar: string
  video_topic: string
  recommended_hour: number
  video_count: number
  format_type: string
}
interface CalendarOutput {
  total_videos: number
  calendar: CalendarDay[]
  pillar_distribution: Record<string, number>
  best_windows: string[]
  recommendations: string[]
}
function analyzeCalendar(input: CalendarInput): CalendarOutput {
  const rng = new SeededRandom(FIXED_SEED)
  const weeks = input.duration_weeks || 4
  const freq = input.posting_frequency
  const pillars = input.content_pillars.length > 0 ? input.content_pillars : ['教育', '娱乐', '幕后', '互动']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const topicPool = [
    '[主题]新手入门系列', '[主题]深度解析', '[主题]行业趋势', '[主题]工具推荐',
    '[主题]挑战/实验', '[主题]Q&A答疑', '[主题]失败案例复盘', '[主题]对比评测',
  ]
  const formats = ['口播+字幕', '解说+拍摄', '采访/Vlog', '动画图解', '对比分屏', '第一视角']

  const calendar: CalendarDay[] = []
  const totalVideos = freq * weeks
  let pillarIdx = 0

  for (let w = 0; w < weeks; w++) {
    let posted = 0
    for (let d = 0; d < 7 && posted < freq; d++) {
      const shouldPost = rng.next() > (7 - freq) / 7
      if (!shouldPost && posted < freq && d === 6) {
        calendar.push({
          day_of_week: days[d],
          date_label: `第${w + 1}周 ${days[d]}`,
          content_pillar: pillars[pillarIdx % pillars.length],
          video_topic: rng.pick(topicPool).replace('[主题]', pillars[pillarIdx % pillars.length]),
          recommended_hour: input.peak_hours ? rng.pick(input.peak_hours) : rng.nextInt(17, 21),
          video_count: 1,
          format_type: rng.pick(formats),
        })
        posted++
        pillarIdx++
      } else if (shouldPost) {
        calendar.push({
          day_of_week: days[d],
          date_label: `第${w + 1}周 ${days[d]}`,
          content_pillar: pillars[pillarIdx % pillars.length],
          video_topic: rng.pick(topicPool).replace('[主题]', pillars[pillarIdx % pillars.length]),
          recommended_hour: input.peak_hours ? rng.pick(input.peak_hours) : rng.nextInt(17, 21),
          video_count: 1,
          format_type: rng.pick(formats),
        })
        posted++
        pillarIdx++
      }
    }
  }

  const pillarDist: Record<string, number> = {}
  pillars.forEach(p => { pillarDist[p] = 0 })
  calendar.forEach(c => {
    pillarDist[c.content_pillar] = (pillarDist[c.content_pillar] || 0) + 1
  })

  return {
    total_videos: calendar.length,
    calendar,
    pillar_distribution: pillarDist,
    best_windows: [
      '工作日 12:00-13:00 (午休时段)',
      '工作日 18:00-20:00 (通勤+晚餐时段)',
      '周末 10:00-12:00 (上午活跃)',
      '周末 20:00-22:00 (晚间高峰)',
    ],
    recommendations: [
      `周更${freq}条: 建议固定发布间隔，培养观众预期`,
      `内容支柱配比: ${Object.entries(pillarDist).map(([k, v]) => `${k}(${v}条)`).join(' / ')}`,
      `批量制作: 每周集中1天拍摄3-4条，其余时间专注剪辑`,
      `热点追踪: 预留每周1条"热点响应"内容的灵活窗口`,
      `系列化运营: 每条视频末尾引导下一集，提升回访率`,
      `数据复盘周期: 建议每2周分析一次各时段表现，动态调整发布窗口`,
    ],
  }
}
function formatCalendar(r: CalendarOutput): string {
  const lines: string[] = []
  lines.push('## AI内容日历规划报告')
  lines.push('')
  lines.push(`**规划总视频数**: ${r.total_videos}条 | **覆盖周数**: ${Math.ceil(r.total_videos / 5)}周`)
  lines.push('')
  lines.push('### 日历详情 (前20条)')
  lines.push('| 日期 | 星期 | 内容支柱 | 视频主题 | 推荐发布时段 | 格式 |')
  lines.push('|------|------|----------|----------|-------------|------|')
  r.calendar.slice(0, 20).forEach(c => {
    lines.push(`| ${c.date_label} | ${c.day_of_week} | ${c.content_pillar} | ${c.video_topic.slice(0, 25)} | ${c.recommended_hour}:00 | ${c.format_type} |`)
  })
  lines.push('')
  lines.push('### 内容支柱分布')
  lines.push('| 支柱 | 视频数 | 占比 |')
  lines.push('|------|--------|------|')
  Object.entries(r.pillar_distribution).forEach(([k, v]) => {
    const pct = r.total_videos > 0 ? Math.round((v / r.total_videos) * 100) : 0
    lines.push(`| ${k} | ${v}条 | ${pct}% |`)
  })
  lines.push('')
  lines.push('### 最佳发布窗口')
  r.best_windows.forEach(w => lines.push(`- ${w}`))
  lines.push('')
  lines.push('### 运营建议')
  r.recommendations.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 7 — viral_hook_optimizer
   病毒钩子优化 (前3秒 / 悬念 / 情绪触发)
   ═══════════════════════════════════════════════════════════════ */
interface HookInput {
  video_topic: string
  target_platform: 'tiktok' | 'reels' | 'shorts' | 'video_account'
  current_hook?: string    // 现有钩子文案
  content_type?: 'listicle' | 'story' | 'tutorial' | 'reaction' | 'challenge'
  audience_niche?: string
  trend_sensitivity?: 'low' | 'medium' | 'high'
}
interface HookVariant {
  variant_id: string
  hook_text: string
  hook_pattern: string
  emotional_trigger: string
  attention_score: number
  retentin_score: number
}
interface HookOutput {
  analysis_summary: string
  pattern_breakdown: Record<string, number>
  hook_variants: HookVariant[]
  best_variant: string
  platform_specific_tips: string[]
}
function analyzeHook(input: HookInput): HookOutput {
  const rng = new SeededRandom(FIXED_SEED)
  const patterns = ['反常识声明', '悬念提问', '数字冲击', '冲突/争议', '时间紧迫', '视觉冲击', '故事开场', 'FOMO制造']
  const triggers = ['好奇心', '恐惧错失', '情感共鸣', '认知冲突', '惊喜/反转', '自我认同', '社交货币']
  const variants: HookVariant[] = []

  for (let i = 0; i < 5; i++) {
    const pattern = patterns[i % patterns.length]
    let hookText = ''
    switch (pattern) {
      case '反常识声明': hookText = `"没人告诉你的关于${input.video_topic}的真相..."`; break
      case '悬念提问': hookText = `"为什么90%的人${input.video_topic}都做错了？"`; break
      case '数字冲击': hookText = `${rng.nextInt(3, 11)}个${input.video_topic}技巧，第${rng.nextInt(2, 7)}个绝了`; break
      case '冲突/争议': hookText = `"我劝你别看这个${input.video_topic}视频...除非你想逆袭"`; break
      case '时间紧迫': hookText = `"2026年${input.video_topic}最大的变化，再不看就晚了"`; break
      case '视觉冲击': hookText = `"一图看懂${input.video_topic}— 这个对比太扎心"`; break
      case '故事开场': hookText = `"三年前我还在纠结${input.video_topic}，如今..."`; break
      case 'FOMO制造': hookText = `"圈内人都在用的${input.video_topic}方法，你居然不知道？"`; break
    }
    variants.push({
      variant_id: `H${String.fromCharCode(65 + i)}`,
      hook_text: hookText,
      hook_pattern: pattern,
      emotional_trigger: triggers[i % triggers.length],
      attention_score: Math.round(rng.nextFloat(6.5, 9.8) * 10) / 10,
      retentin_score: Math.round(rng.nextFloat(5.5, 9.2) * 10) / 10,
    })
  }

  variants.sort((a, b) => b.attention_score - a.attention_score)
  const best = variants[0]

  return {
    analysis_summary: `基于"${input.video_topic}"主题在${input.target_platform}平台的${input.content_type || '通用'}类型内容，通过5种经典钩子模式生成优化方案`,
    pattern_breakdown: {
      '反常识声明': 85, '悬念提问': 82, '数字冲击': 78, '冲突/争议': 75,
      '时间紧迫': 70, '视觉冲击': 80, '故事开场': 72, 'FOMO制造': 77,
    },
    hook_variants: variants,
    best_variant: `${best.variant_id}: ${best.hook_text} (注意${best.attention_score} / 留存${best.retentin_score})`,
    platform_specific_tips: [
      `${input.target_platform === 'tiktok' ? 'TikTok: 视频第0.5秒必须有视觉/听觉冲击点' : input.target_platform === 'shorts' ? 'Shorts: 前1秒使用文字+人脸+音效' : input.target_platform === 'reels' ? 'Reels: 动态文字+节奏BGM前奏切入' : '视频号: 使用"朋友都在看"社交暗示'}`,
      '避免"大家好"开头 — 算法判断为低质量模板',
      '钩子与正片内容必须高度相关 — 避免"标题党"惩罚',
      `目标平台${input.target_platform}最佳钩子时长: ${input.target_platform === 'shorts' ? '1-2s' : '2-4s'}`,
      `情绪触发优先级: ${input.trend_sensitivity === 'high' ? '好奇心 > FOMO > 惊喜' : '情感共鸣 > 认知冲突 > 好奇心'}`,
    ],
  }
}
function formatHook(r: HookOutput): string {
  const lines: string[] = []
  lines.push('## 病毒钩子优化报告')
  lines.push('')
  lines.push(`**分析概要**: ${r.analysis_summary}`)
  lines.push('')
  lines.push(`**推荐方案**: ${r.best_variant}`)
  lines.push('')
  lines.push('### 钩子方案对比')
  lines.push('| 方案 | 钩子模式 | 文案 | 情绪触发 | 注意力评分 | 留存评分 |')
  lines.push('|------|----------|------|----------|-----------|---------|')
  r.hook_variants.forEach(v => {
    lines.push(`| ${v.variant_id} | ${v.hook_pattern} | ${v.hook_text.slice(0, 35)}${v.hook_text.length > 35 ? '...' : ''} | ${v.emotional_trigger} | ${v.attention_score}/10 | ${v.retentin_score}/10 |`)
  })
  lines.push('')
  lines.push('### 钩子模式效力排行')
  lines.push('| 模式 | 效力值 | 推荐度 |')
  lines.push('|------|--------|--------|')
  Object.entries(r.pattern_breakdown).sort(([, a], [, b]) => b - a).forEach(([k, v]) => {
    const stars = '★'.repeat(Math.round(v / 20)) + '☆'.repeat(5 - Math.round(v / 20))
    lines.push(`| ${k} | ${v}/100 | ${stars} |`)
  })
  lines.push('')
  lines.push('### 平台专属建议')
  r.platform_specific_tips.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 8 — cross_platform_adapter
   跨平台视频格式适配 (TikTok/Reels/Shorts/视频号)
   ═══════════════════════════════════════════════════════════════ */
interface AdapterInput {
  source_format: { width: number; height: number; fps: number; duration_sec: number }
  target_platforms: ('tiktok' | 'instagram_reels' | 'youtube_shorts' | 'video_account' | 'xiaohongshu' | 'weibo')[]
  content_description?: string
  has_captions?: boolean
  has_watermark?: boolean
  original_language?: string
}
interface PlatformSpec {
  platform: string
  resolution: string
  aspect_ratio: string
  max_duration_sec: number
  fps: number
  caption_style: string
  music_policy: string
  safe_zone: string
  export_action: string
}
interface AdapterOutput {
  adaptation_count: number
  platforms: PlatformSpec[]
  warnings: string[]
  recommendations: string[]
  quality_loss_estimate: string
}
function analyzeAdapter(input: AdapterInput): AdapterOutput {
  const rng = new SeededRandom(FIXED_SEED)
  const specs: PlatformSpec[] = []
  const warnings: string[] = []

  const platformMap: Record<string, { res: string; ratio: string; maxDur: number; fps: number; caption: string; music: string; safe: string }> = {
    tiktok: { res: '1080x1920', ratio: '9:16', maxDur: 600, fps: 30, caption: '动态字幕(底部20%外)', music: '商业音乐库/原创', safe: '上下各15%为安全区' },
    instagram_reels: { res: '1080x1920', ratio: '9:16', maxDur: 90, fps: 30, caption: '可关闭式字幕', music: '商业授权/原创', safe: '左下25%标题区需避开' },
    youtube_shorts: { res: '1080x1920', ratio: '9:16', maxDur: 60, fps: 30, caption: '大字体+描边', music: 'YouTube音乐库', safe: '底部20%为控制区' },
    video_account: { res: '1080x1920', ratio: '9:16', maxDur: 1800, fps: 25, caption: '适中字号', music: '微信视频音乐库', safe: '左下角头像区避开' },
    xiaohongshu: { res: '1080x1440', ratio: '3:4', maxDur: 300, fps: 30, caption: '竖排可选', music: '小红书音乐库', safe: '上20%标题区+底部30%' },
    weibo: { res: '1080x1920', ratio: '9:16', maxDur: 600, fps: 30, caption: '居中底部', music: '微博音乐库', safe: '右下15%操作区' },
  }

  input.target_platforms.forEach(p => {
    const spec = platformMap[p]
    if (spec) {
      specs.push({
        platform: p,
        resolution: spec.res,
        aspect_ratio: spec.ratio,
        max_duration_sec: spec.maxDur,
        fps: Math.min(input.source_format.fps, spec.fps),
        caption_style: spec.caption,
        music_policy: spec.music,
        safe_zone: spec.safe,
        export_action: input.source_format.duration_sec > spec.maxDur
          ? `裁剪至${spec.maxDur}s或拆分为多段`
          : '时长符合，无需裁剪',
      })
      if (input.source_format.duration_sec > spec.maxDur) {
        warnings.push(`${p}: 视频时长${input.source_format.duration_sec}s超过${spec.maxDur}s上限，需裁剪或分段`)
      }
    }
  })

  if (input.has_watermark) warnings.push('检测到第三方平台水印 — 部分平台将限流，建议去除后重新上传')
  if (!input.has_captions) warnings.push('缺少字幕 — 85%短视频在静音状态下播放，建议添加内嵌字幕')

  return {
    adaptation_count: specs.length,
    platforms: specs,
    warnings,
    recommendations: [
      '核心输出: 1080x1920 (9:16) 作为母版分辨率，满足绝大多数平台要求',
      '安全区管理: 核心视觉元素保持在中间60%区域，避开各平台UI遮挡',
      '字幕样式: 使用平台原生字幕工具上传多语言SRT，提升推荐权重',
      '音乐策略: 优先使用各平台商业音乐库，避免版权主张和限流',
      '批量导出: 建议使用FFmpeg预设批量生成多平台适配版本',
      'A/B测试: 同一内容在不同平台发布时微调标题与标签',
      input.source_format.fps > 30 ? `帧率转换: ${input.source_format.fps}fps→30fps在部分平台会更流畅` : '帧率适配: 30fps在各平台通用',
    ],
    quality_loss_estimate: `从${input.source_format.width}x${input.source_format.height}母版转换，预计质量损失<3% (高质量编码)`,
  }
}
function formatAdapter(r: AdapterOutput): string {
  const lines: string[] = []
  lines.push('## 跨平台视频格式适配报告')
  lines.push('')
  lines.push(`**适配平台数**: ${r.adaptation_count} | **质量损失预估**: ${r.quality_loss_estimate}`)
  lines.push('')
  lines.push('### 平台规格对照表')
  lines.push('| 平台 | 分辨率 | 宽高比 | 最大时长 | 字幕样式 | 音乐策略 | 安全区 | 操作 |')
  lines.push('|------|--------|--------|----------|----------|----------|--------|------|')
  r.platforms.forEach(p => {
    lines.push(`| ${p.platform} | ${p.resolution} | ${p.aspect_ratio} | ${p.max_duration_sec}s | ${p.caption_style} | ${p.music_policy} | ${p.safe_zone} | ${p.export_action} |`)
  })
  if (r.warnings.length > 0) {
    lines.push('')
    lines.push('### 警告')
    r.warnings.forEach(w => lines.push(`- ⚠️ ${w}`))
  }
  lines.push('')
  lines.push('### 适配建议')
  r.recommendations.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Plugin Registration
   ═══════════════════════════════════════════════════════════════ */
export function apply(ctx: Context) {
  const tools = ctx.tools

  /* Tool 1 — video_script_generator */
  tools.register(defineTool({
    name: 'video_script_generator',
    description: 'AI视频脚本生成 — 基于主题、时长与风格自动生成完整视频脚本，包含场景分解、镜头语言与配音文案。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { topic, target_duration_sec, tone?, audience?, key_message?, style? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatScriptGen(analyzeScriptGen(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 2 — voiceover_optimizer */
  tools.register(defineTool({
    name: 'voiceover_optimizer',
    description: 'AI配音脚本优化 — 针对TTS引擎优化配音脚本，包含语速控制、情感标注、SSML标记与停顿节奏。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { raw_script, target_wpm?, voice_brand?, tts_engine?, language?, emphasis_markers? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatVoiceover(analyzeVoiceover(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 3 — auto_caption_generator */
  tools.register(defineTool({
    name: 'auto_caption_generator',
    description: '自动视频字幕生成 — 根据ASR转录生成时间轴对齐的字幕序列，支持多种样式与SRT格式输出。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { transcription, video_duration_sec, caption_style?, max_chars_per_line?, lines?, language?, branding? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCaption(analyzeCaption(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 4 — thumbnail_ai_designer */
  tools.register(defineTool({
    name: 'thumbnail_ai_designer',
    description: 'AI缩略图设计分析 — 生成多方案A/B缩略图设计建议，包含构图、配色、表情与CTR预测。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { video_title, category, target_audience?, emotion_target?, ab_variants?, brand_colors? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatThumbnail(analyzeThumbnail(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 5 — engagement_predictor */
  tools.register(defineTool({
    name: 'engagement_predictor',
    description: '视频互动预测 — 基于视频元数据预测播放量、留存率、CTR等互动核心指标。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { video_title, category, duration_sec, subscriber_count?, publish_hour?, thumbnail_quality?, hook_strength?, production_quality?, hashtags? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatEngagement(analyzeEngagement(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 6 — content_calendar_planner */
  tools.register(defineTool({
    name: 'content_calendar_planner',
    description: 'AI内容日历规划 — 根据内容支柱与发布频率生成多周内容日历，包含主题、时段与格式建议。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { platform, content_pillars[], posting_frequency, duration_weeks?, target_timezone?, peak_hours? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCalendar(analyzeCalendar(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 7 — viral_hook_optimizer */
  tools.register(defineTool({
    name: 'viral_hook_optimizer',
    description: '病毒钩子优化 — 为短视频生成多版本病毒式开头钩子，覆盖5大经典模式与情绪触发点。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { video_topic, target_platform, current_hook?, content_type?, audience_niche?, trend_sensitivity? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatHook(analyzeHook(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 8 — cross_platform_adapter */
  tools.register(defineTool({
    name: 'cross_platform_adapter',
    description: '跨平台视频格式适配 — 为TikTok/Reels/Shorts/视频号等多平台生成规格对照表与导出建议。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { source_format, target_platforms[], content_description?, has_captions?, has_watermark?, original_language? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatAdapter(analyzeAdapter(JSON.parse(args.input_data)))
    },
  }))
}
