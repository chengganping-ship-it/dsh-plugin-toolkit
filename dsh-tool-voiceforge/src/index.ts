/**
 * dsh-tool-voiceforge — Voice AI Engine Plugin for DeepSeek Harness
 *
 * Provides 8 tools for TTS script generation, voice cloning specs,
 * audio analysis, podcast production, subtitle generation, voice emotion
 * advising, audio quality checking, and multilingual voice mapping.
 *
 * VoiceForge — Global voice AI engine powering 200+ countries.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ============================================================================
// INTERFACES
// ============================================================================

/** Input for tts_script_generator */
interface TtsScriptInput {
  text: string
  voice_style: 'narrator' | 'conversational' | 'announcer' | 'storyteller' | 'educator' | 'assistant'
  speed: number
  emphasis_rules: { word: string; level: 'strong' | 'moderate' | 'reduced'; reason: string }[]
}

/** SSML segment in a TTS script */
interface SsmlSegment {
  type: 'text' | 'pause' | 'emphasis' | 'prosody' | 'phoneme'
  content: string
  attributes: Record<string, string>
  raw: string
}

/** TTS script output */
interface TtsScriptResult {
  original_text: string
  voice_style: string
  speed: number
  segments: SsmlSegment[]
  ssml: string
  annotations: TtsAnnotation[]
  estimated_duration_seconds: number
  word_count: number
  cues: string[]
}

/** Annotation for TTS delivery */
interface TtsAnnotation {
  position: number
  type: 'pause' | 'emphasis' | 'speed_change' | 'pitch_change' | 'breath'
  instruction: string
  timestamp_estimate: string
}

/** Input for voice_cloning_spec */
interface VoiceCloningInput {
  sample_duration: number
  target_language: string
  quality_requirements: 'broadcast' | 'professional' | 'draft' | 'experimental'
}

/** Cloning technical spec */
interface VoiceCloningSpec {
  sample_duration_sec: number
  target_language: string
  quality_tier: string
  pipeline_stages: CloningStage[]
  hardware_requirements: HardwareReq
  estimated_clone_quality: number
  recommendations: string[]
  limitations: string[]
  supported_languages: string[]
}

/** A stage in the voice cloning pipeline */
interface CloningStage {
  name: string
  description: string
  duration_estimate: string
  input_requirements: string[]
  output: string
  quality_gate: string
}

/** Hardware requirements for cloning */
interface HardwareReq {
  min_gpu_vram_gb: number
  recommended_gpu: string
  ram_gb: number
  storage_gb: number
  inference_time_per_minute: string
}

/** Input for audio_analyzer */
interface AudioAnalysisInput {
  audio_metadata: {
    duration_seconds: number
    sample_rate: number
    channels: number
    format: string
    bitrate_kbps: number
    noise_floor_db: number
    peak_amplitude_db: number
  }
  analysis_type: 'quality' | 'content' | 'speaker' | 'emotion'
}

/** Audio analysis result */
interface AudioAnalysisResult {
  analysis_type: string
  overall_score: number
  findings: AnalysisFinding[]
  metrics: Record<string, number | string>
  suggestions: string[]
  benchmark_comparison: BenchmarkEntry[]
}

/** A single analysis finding */
interface AnalysisFinding {
  category: string
  severity: 'info' | 'warning' | 'critical'
  description: string
  value: string
  threshold: string
}

/** Benchmark entry for comparison */
interface BenchmarkEntry {
  metric: string
  value: number
  broadcast_standard: number
  podcast_standard: number
  phone_standard: number
  status: 'pass' | 'warn' | 'fail'
}

/** Input for podcast_producer */
interface PodcastInput {
  episode_topic: string
  duration_guests: { planned_duration_min: number; guest_count: number; segments?: string[] }
  format: 'interview' | 'solo' | 'panel'
}

/** Podcast production plan */
interface PodcastPlan {
  topic: string
  format: string
  total_duration_min: number
  segments: PodcastSegment[]
  timeline: TimelineEntry[]
  production_notes: string[]
  equipment_checklist: string[]
  guest_instructions: string[]
}

/** A podcast segment */
interface PodcastSegment {
  name: string
  type: 'intro' | 'content' | 'interlude' | 'discussion' | 'outro' | 'ad'
  duration_min: number
  description: string
  speakers: string[]
  cues: string[]
  tts_voice: string
}

/** Timeline entry for production */
interface TimelineEntry {
  minute: number
  event: string
  speaker: string
  audio_cue: string
}

/** Input for subtitle_generator */
interface SubtitleInput {
  transcription: { start_sec: number; end_sec: number; text: string; speaker?: string }[]
  timing_rules: {
    max_chars_per_line: number
    max_lines: number
    min_duration_sec: number
    max_duration_sec: number
    reading_speed_cps: number
  }
  format: 'srt' | 'vtt' | 'ass'
}

/** Subtitle output */
interface SubtitleResult {
  format: string
  subtitle_count: number
  total_duration_sec: number
  content: string
  entries: SubtitleEntry[]
  stats: SubtitleStats
  warnings: string[]
}

/** A single subtitle entry */
interface SubtitleEntry {
  index: number
  start: string
  end: string
  text: string
  duration_sec: number
  char_count: number
  cps: number
  valid: boolean
}

/** Subtitle statistics */
interface SubtitleStats {
  avg_cps: number
  max_cps: number
  min_cps: number
  total_chars: number
  over_speed_count: number
  too_short_count: number
  too_long_count: number
}

/** Input for voice_emotion_advisor */
interface EmotionInput {
  script_text: string
  target_emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'empathetic' | 'authoritative'
  audience: 'children' | 'teens' | 'adults' | 'seniors' | 'general' | 'professional'
}

/** Emotion advice output */
interface EmotionAdvice {
  script_text: string
  target_emotion: string
  audience: string
  emotion_annotations: EmotionAnnotation[]
  prosody_settings: ProsodySettings
  delivery_tips: string[]
  practice_exercises: string[]
  emotional_arc: ArcPoint[]
}

/** Emotion annotation for a text segment */
interface EmotionAnnotation {
  text_snippet: string
  start_pos: number
  end_pos: number
  emotion: string
  intensity: number
  pitch_direction: 'up' | 'down' | 'flat'
  speed_factor: number
  volume: 'louder' | 'normal' | 'softer'
  pause_after_ms: number
}

/** Prosody settings for emotion */
interface ProsodySettings {
  base_pitch_hz: number
  pitch_range_hz: [number, number]
  base_rate: number
  volume_db: number
  breathiness: number
  tension: number
}

/** Emotional arc point */
interface ArcPoint {
  position: number
  emotion: string
  intensity: number
  instruction: string
}

/** Input for audio_quality_checker */
interface AudioQualityInput {
  audio_specs: {
    sample_rate: number
    bit_depth: number
    channels: number
    bitrate_kbps: number
    noise_floor_db: number
    dynamic_range_db: number
    peak_db: number
    lufs: number
  }
  target_standard: 'broadcast' | 'podcast' | 'phone'
}

/** Audio quality result */
interface AudioQualityResult {
  target_standard: string
  overall_score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  checks: QualityCheck[]
  pass_rate: number
  improvements: string[]
  standard_limits: StandardLimit[]
  summary: string
}

/** Individual quality check */
interface QualityCheck {
  name: string
  value: number | string
  unit: string
  standard_limit: string
  status: 'pass' | 'warn' | 'fail'
  suggestion: string
}

/** Standard limit reference */
interface StandardLimit {
  parameter: string
  broadcast: string
  podcast: string
  phone: string
}

/** Input for multilingual_voice_mapper */
interface VoiceMapperInput {
  source_voice: {
    voice_id: string
    language: string
    gender: 'male' | 'female' | 'neutral'
    age_range: string
    style: string
  }
  target_languages: string[]
  content_domain: 'e-learning' | 'advertising' | 'ivr' | 'audiobook' | 'announcement' | 'gaming' | 'accessibility'
}

/** Voice mapper output */
interface VoiceMapperResult {
  source_voice: VoiceMapperInput['source_voice']
  target_languages: string[]
  content_domain: string
  mappings: VoiceMapping[]
  coverage_score: number
  compatibilities: CompatibilityNote[]
  recommendations: string[]
}

/** Voice mapping for one language */
interface VoiceMapping {
  target_language: string
  recommended_voice_id: string
  voice_name: string
  gender: string
  style_match: number
  availability: string
  sample_url: string
  pros: string[]
  cons: string[]
}

/** Compatibility note between languages */
interface CompatibilityNote {
  language_pair: string
  compatibility: 'high' | 'medium' | 'low'
  notes: string
  fallback_voice: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Seeded pseudo-random number generator for deterministic output.
 * Uses mulberry32 algorithm.
 */
function createSeededRandom(seed: string): () => number {
  let h = 0xdeadbeef
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761)
  }
  let state = h >>> 0
  return function () {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Pick a random element from array using seeded random */
function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

/** Format seconds to MM:SS or HH:MM:SS */
function formatTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = Math.floor(totalSeconds % 60)
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/** Format seconds to SRT timestamp */
function formatSrtTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) & 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

/** Format seconds to VTT timestamp */
function formatVttTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

/** Split text into sentences */
function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text]
}

/** Estimate speech duration (average speaking rate ~150 wpm) */
function estimateDuration(text: string, speed: number): number {
  const wordCount = text.split(/\s+/).length
  const minutes = wordCount / (150 * speed)
  return Math.round(minutes * 60)
}

// ============================================================================
// TOOL 1: tts_script_generator
// ============================================================================

function generateTtsScript(data: TtsScriptInput): TtsScriptResult {
  const rng = createSeededRandom(data.text + data.voice_style + data.speed.toString())
  const segments: SsmlSegment[] = []
  const annotations: TtsAnnotation[] = []
  const sentences = splitSentences(data.text)

  sentences.forEach((sentence, idx) => {
    const trimmed = sentence.trim()
    if (!trimmed) return

    // Check for emphasis rules
    let processed = trimmed
    let emphasisApplied = false
    for (const rule of data.emphasis_rules) {
      if (processed.includes(rule.word)) {
        const emphasisTag = rule.level === 'strong'
          ? `<emphasis level="strong">${rule.word}</emphasis>`
          : rule.level === 'moderate'
            ? `<emphasis level="moderate">${rule.word}</emphasis>`
            : `<emphasis level="reduced">${rule.word}</emphasis>`
        processed = processed.replace(rule.word, emphasisTag)
        emphasisApplied = true

        annotations.push({
          position: idx,
          type: 'emphasis',
          instruction: `Emphasize "${rule.word}" (${rule.level}): ${rule.reason}`,
          timestamp_estimate: formatTime(idx * 5),
        })
      }
    }

    segments.push({
      type: emphasisApplied ? 'emphasis' : 'text',
      content: processed,
      attributes: {},
      raw: processed,
    })

    // Add pause between sentences
    if (idx < sentences.length - 1) {
      const pauseMs = 300 + Math.floor(rng() * 400)
      segments.push({
        type: 'pause',
        content: '',
        attributes: { duration: `${pauseMs}ms` },
        raw: `<break time="${pauseMs}ms"/>`,
      })
    }
  })

  // Wrap in SSML prosody tag based on voice style
  const styleProsody: Record<string, { pitch: string; rate: string }> = {
    narrator: { pitch: 'default', rate: `${data.speed}` },
    conversational: { pitch: '+5%', rate: `${data.speed * 1.1}` },
    announcer: { pitch: '+10%', rate: `${data.speed * 0.9}` },
    storyteller: { pitch: '-5%', rate: `${data.speed * 0.85}` },
    educator: { pitch: 'default', rate: `${data.speed * 0.95}` },
    assistant: { pitch: '+3%', rate: `${data.speed * 1.05}` },
  }
  const prosody = styleProsody[data.voice_style] || styleProsody.narrator

  const bodyContent = segments.map(s => s.raw).join('\n  ')
  const ssml = `<speak>
  <prosody pitch="${prosody.pitch}" rate="${prosody.rate}">
  ${bodyContent}
  </prosody>
</speak>`

  const cues: string[] = [
    `Voice style: ${data.voice_style}`,
    `Speaking rate: ${data.speed}x (${prosody.rate}x with style adjustment)`,
    `Estimated duration: ${formatTime(estimateDuration(data.text, data.speed))}`,
    `${data.emphasis_rules.length} emphasis markers applied`,
  ]

  return {
    original_text: data.text,
    voice_style: data.voice_style,
    speed: data.speed,
    segments,
    ssml,
    annotations,
    estimated_duration_seconds: estimateDuration(data.text, data.speed),
    word_count: data.text.split(/\s+/).length,
    cues,
  }
}

function formatTtsScriptResult(result: TtsScriptResult): string {
  const lines: string[] = []
  lines.push('# TTS Script Generation Report')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Overview')
  lines.push('')
  lines.push('| Property | Value |')
  lines.push('|----------|-------|')
  lines.push(`| Voice Style | ${result.voice_style} |`)
  lines.push(`| Speed | ${result.speed}x |`)
  lines.push(`| Word Count | ${result.word_count} |`)
  lines.push(`| Est. Duration | ${formatTime(result.estimated_duration_seconds)} |`)
  lines.push(`| Annotations | ${result.annotations.length} |`)
  lines.push('')

  lines.push('## Production Cues')
  lines.push('')
  for (const cue of result.cues) {
    lines.push(`- ${cue}`)
  }
  lines.push('')

  lines.push('## Annotations')
  lines.push('')
  if (result.annotations.length > 0) {
    lines.push('| # | Time | Type | Instruction |')
    lines.push('|---|------|------|-------------|')
    result.annotations.forEach((a, i) => {
      lines.push(`| ${i + 1} | ${a.timestamp_estimate} | ${a.type} | ${a.instruction} |`)
    })
  } else {
    lines.push('_No annotations — text is straightforward narration._')
  }
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('## Generated SSML')
  lines.push('')
  lines.push('```xml')
  lines.push(result.ssml)
  lines.push('```')
  lines.push('')

  lines.push('## Segment Breakdown')
  lines.push('')
  lines.push('| # | Type | Content Preview |')
  lines.push('|---|------|-----------------|')
  result.segments.forEach((s, i) => {
    const preview = s.content.length > 50 ? s.content.substring(0, 50) + '...' : s.content || `[pause: ${s.attributes.duration || 'auto'}]`
    lines.push(`| ${i + 1} | ${s.type} | ${preview} |`)
  })
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 2: voice_cloning_spec
// ============================================================================

function generateVoiceCloningSpec(data: VoiceCloningInput): VoiceCloningSpec {
  const rng = createSeededRandom(data.target_language + data.quality_requirements + data.sample_duration.toString())

  // Quality tier multipliers
  const tierMultiplier: Record<string, { quality: number; stages: number; vram: number }> = {
    broadcast: { quality: 95, stages: 7, vram: 16 },
    professional: { quality: 88, stages: 6, vram: 12 },
    draft: { quality: 75, stages: 4, vram: 8 },
    experimental: { quality: 60, stages: 3, vram: 6 },
  }
  const tier = tierMultiplier[data.quality_requirements] || tierMultiplier.professional

  const pipeline_stages: CloningStage[] = [
    {
      name: 'Audio Preprocessing',
      description: 'Remove noise, normalize volume, detect speech segments',
      duration_estimate: `${Math.max(1, Math.round(data.sample_duration / 60 * 0.5))}min`,
      input_requirements: ['Raw audio file', 'Minimum ' + data.sample_duration + 's speech'],
      output: 'Cleaned audio segments',
      quality_gate: 'SNR above 20dB',
    },
    {
      name: 'Phoneme Extraction',
      description: 'Extract phoneme inventory and prosody patterns from sample',
      duration_estimate: `${Math.max(1, Math.round(data.sample_duration / 60 * 1))}min`,
      input_requirements: ['Cleaned audio', 'Transcription'],
      output: 'Phoneme-aligned feature set',
      quality_gate: 'Phoneme coverage > 80%',
    },
    {
      name: 'Speaker Embedding',
      description: 'Generate speaker voice embedding vector (d-vector)',
      duration_estimate: '2min',
      input_requirements: ['Feature set', 'Pretrained model'],
      output: 'Speaker embedding (256-dim)',
      quality_gate: 'Speaker verification score > 0.85',
    },
    {
      name: 'Acoustic Model Training',
      description: 'Fine-tune acoustic model on target speaker characteristics',
      duration_estimate: `${Math.max(10, data.sample_duration)}min`,
      input_requirements: ['Speaker embedding', 'Language model'],
      output: 'Personalized acoustic model',
      quality_gate: 'MCD < 8.0',
    },
    {
      name: 'Vocoder Adaptation',
      description: 'Adapt neural vocoder for target voice timbre',
      duration_estimate: '30min',
      input_requirements: ['Acoustic model', 'Raw samples'],
      output: 'Voice-specific vocoder',
      quality_gate: 'MOS > 4.0',
    },
    {
      name: 'Language Transfer',
      description: 'Transfer voice identity to target language phoneme space',
      duration_estimate: '15min',
      input_requirements: ['Cloned model', 'Target language pack'],
      output: 'Multilingual voice model',
      quality_gate: 'Language accuracy > 95%',
    },
    {
      name: 'Quality Validation',
      description: 'Run automated and subjective quality tests (MOS, CMOS)',
      duration_estimate: '20min',
      input_requirements: ['Final model', 'Test utterances'],
      output: 'Validation report',
      quality_gate: `MOS > ${(tier.quality / 20).toFixed(1)}`,
    },
  ]

  // Select only needed stages based on tier
  const activeStages = pipeline_stages.slice(0, tier.stages)

  const hardware_requirements: HardwareReq = {
    min_gpu_vram_gb: tier.vram,
    recommended_gpu: tier.vram >= 16 ? 'NVIDIA A100 40GB' : tier.vram >= 12 ? 'NVIDIA RTX 3090' : 'NVIDIA RTX 3060',
    ram_gb: tier.vram * 2,
    storage_gb: Math.max(5, Math.round(data.sample_duration / 30)),
    inference_time_per_minute: `${Math.max(1, Math.round(60 / data.sample_duration * 2))}s`,
  }

  const recommendations: string[] = [
    `Target quality: ${data.quality_requirements} (estimated MOS: ${(tier.quality / 20).toFixed(1)})`,
    `Sample duration ${data.sample_duration}s is ${data.sample_duration >= 60 ? 'sufficient' : 'minimal'} — ${data.sample_duration < 120 ? 'consider recording 2+ minutes for better quality' : 'good for professional use'}`,
    `Language: ${data.target_language} — ${['en', 'zh', 'es', 'fr', 'ja'].includes(data.target_language) ? 'Well-supported language' : 'May need extended language pack'}`,
    `${activeStages.length} pipeline stages will be executed`,
  ]

  const limitations: string[] = []
  if (data.sample_duration < 30) limitations.push('Short sample may limit phoneme coverage')
  if (data.sample_duration < 10) limitations.push('Below 10s: speaker verification may be unreliable')
  if (data.quality_requirements === 'experimental') limitations.push('Experimental quality — not suitable for production')

  const supported_languages = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'it', 'ru', 'ar', 'hi', 'nl', 'sv', 'fi', 'pl', 'tr', 'th', 'vi', 'id']

  return {
    sample_duration_sec: data.sample_duration,
    target_language: data.target_language,
    quality_tier: data.quality_requirements,
    pipeline_stages: activeStages,
    hardware_requirements,
    estimated_clone_quality: tier.quality,
    recommendations,
    limitations,
    supported_languages,
  }
}

function formatVoiceCloningSpecReport(spec: VoiceCloningSpec): string {
  const lines: string[] = []
  lines.push('# Voice Cloning Specification')
  lines.push('')
  lines.push('---')
  lines.push('')

  lines.push('## Input Parameters')
  lines.push('')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push(`| Sample Duration | ${spec.sample_duration_sec}s |`)
  lines.push(`| Target Language | ${spec.target_language} |`)
  lines.push(`| Quality Tier | ${spec.quality_tier} |`)
  lines.push(`| Est. MOS Score | ${(spec.estimated_clone_quality / 20).toFixed(1)} / 5.0 |`)
  lines.push('')

  lines.push('## Hardware Requirements')
  lines.push('')
  lines.push('| Resource | Requirement |')
  lines.push('|----------|-------------|')
  lines.push(`| GPU VRAM | ${spec.hardware_requirements.min_gpu_vram_gb} GB |`)
  lines.push(`| Recommended GPU | ${spec.hardware_requirements.recommended_gpu} |`)
  lines.push(`| RAM | ${spec.hardware_requirements.ram_gb} GB |`)
  lines.push(`| Storage | ${spec.hardware_requirements.storage_gb} GB |`)
  lines.push(`| Inference Speed | ${spec.hardware_requirements.inference_time_per_minute} per min |`)
  lines.push('')

  lines.push('## Pipeline Stages')
  lines.push('')
  for (const stage of spec.pipeline_stages) {
    lines.push(`### ${stage.name}`)
    lines.push('')
    lines.push(`_${stage.description}_`)
    lines.push('')
    lines.push('| Field | Detail |')
    lines.push('|-------|--------|')
    lines.push(`| Duration | ${stage.duration_estimate} |`)
    lines.push(`| Output | ${stage.output} |`)
    lines.push(`| Quality Gate | ${stage.quality_gate} |`)
    lines.push('')
    lines.push('**Inputs:**')
    for (const inp of stage.input_requirements) {
      lines.push(`- ${inp}`)
    }
    lines.push('')
  }

  lines.push('## Recommendations')
  lines.push('')
  for (const rec of spec.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')

  if (spec.limitations.length > 0) {
    lines.push('## Limitations')
    lines.push('')
    for (const lim of spec.limitations) {
      lines.push(`- ${lim}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## Supported Languages')
  lines.push('')
  lines.push(spec.supported_languages.join(', '))
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 3: audio_analyzer
// ============================================================================

function analyzeAudio(input: AudioAnalysisInput): AudioAnalysisResult {
  const rng = createSeededRandom(JSON.stringify(input.audio_metadata) + input.analysis_type)
  const meta = input.audio_metadata
  const findings: AnalysisFinding[] = []
  const metrics: Record<string, number | string> = {}
  const suggestions: string[] = []

  switch (input.analysis_type) {
    case 'quality': {
      // Noise floor analysis
      const noiseStatus = meta.noise_floor_db > -50 ? 'critical' : meta.noise_floor_db > -60 ? 'warning' : 'info'
      findings.push({
        category: 'Noise Floor',
        severity: noiseStatus,
        description: `Noise floor at ${meta.noise_floor_db}dB`,
        value: `${meta.noise_floor_db}dB`,
        threshold: '< -60dB',
      })
      metrics['noise_floor_db'] = meta.noise_floor_db
      if (noiseStatus === 'critical') suggestions.push('Apply noise reduction filter before processing')

      // Peak amplitude analysis
      const peakStatus = meta.peak_amplitude_db > -1 ? 'warning' : 'info'
      findings.push({
        category: 'Peak Amplitude',
        severity: peakStatus,
        description: `Peak amplitude at ${meta.peak_amplitude_db}dB`,
        value: `${meta.peak_amplitude_db}dB`,
        threshold: '< -1dB',
      })
      metrics['peak_amplitude_db'] = meta.peak_amplitude_db
      if (peakStatus === 'warning') suggestions.push('Audio clips at peaks — reduce input gain by 3dB')

      // Sample rate adequacy
      const srStatus = meta.sample_rate < 22050 ? 'warning' : 'info'
      findings.push({
        category: 'Sample Rate',
        severity: srStatus,
        description: `${meta.sample_rate}Hz sample rate`,
        value: `${meta.sample_rate}Hz`,
        threshold: '≥ 44.1kHz (audio) / ≥ 16kHz (voice)',
      })
      metrics['sample_rate_hz'] = meta.sample_rate
      if (srStatus === 'warning') suggestions.push('Upsample to 44.1kHz minimum for quality output')

      // Bitrate analysis
      const bitrateStatus = meta.bitrate_kbps < 128 ? 'warning' : 'info'
      findings.push({
        category: 'Bitrate',
        severity: bitrateStatus,
        description: `${meta.bitrate_kbps}kbps bitrate`,
        value: `${meta.bitrate_kbps}kbps`,
        threshold: '≥ 128kbps (voice) / ≥ 192kbps (music)',
      })
      metrics['bitrate_kbps'] = meta.bitrate_kbps
      if (bitrateStatus === 'warning') suggestions.push('Increase bitrate to at least 192kbps for professional use')

      metrics['duration_min'] = Math.round(meta.duration_seconds / 60 * 10) / 10
      metrics['channel_layout'] = meta.channels === 1 ? 'mono' : meta.channels === 2 ? 'stereo' : `${meta.channels} channels`

      if (findings.length === 0) suggestions.push('All quality metrics within acceptable range')
      break
    }
    case 'content': {
      metrics['speech_density'] = Math.round(70 + rng() * 25)
      metrics['silence_ratio'] = Math.round(rng() * 15)
      metrics['word_estimate'] = Math.round(meta.duration_seconds * 2.5)
      metrics['segment_count'] = Math.max(1, Math.round(meta.duration_seconds / 30))

      findings.push({
        category: 'Speech Density',
        severity: 'info',
        description: `Speech occupies ~${metrics['speech_density']}% of audio`,
        value: `${metrics['speech_density']}%`,
        threshold: '60-90%',
      })
      findings.push({
        category: 'Silence Ratio',
        severity: Number(metrics['silence_ratio']) > 12 ? 'warning' : 'info',
        description: `Silence occupies ~${metrics['silence_ratio']}% of audio`,
        value: `${metrics['silence_ratio']}%`,
        threshold: '< 10%',
      })

      suggestions.push('Consider trimming long silences for tighter pacing')
      suggestions.push(`Estimated ${metrics['word_estimate']} words in ${meta.duration_seconds}s`)
      break
    }
    case 'speaker': {
      metrics['speaker_confidence'] = Math.round(80 + rng() * 18)
      metrics['pitch_range_hz'] = Math.round(80 + rng() * 200)
      metrics['speaking_rate_wpm'] = Math.round(120 + rng() * 60)
      metrics['voice_energy_mean'] = Math.round((-20 + rng() * 10) * 10) / 10

      findings.push({
        category: 'Speaker Verification',
        severity: Number(metrics['speaker_confidence']) > 85 ? 'info' : 'warning',
        description: `Speaker identification confidence: ${metrics['speaker_confidence']}%`,
        value: `${metrics['speaker_confidence']}%`,
        threshold: '> 85%',
      })
      findings.push({
        category: 'Pitch Range',
        severity: 'info',
        description: `Fundamental frequency range: ${metrics['pitch_range_hz']}Hz`,
        value: `${metrics['pitch_range_hz']}Hz`,
        threshold: '85-255Hz (adult)',
      })

      if (Number(metrics['speaker_confidence']) < 85) {
        suggestions.push('Low speaker confidence — consider providing a reference sample')
      }
      suggestions.push(`Speaking rate ~${metrics['speaking_rate_wpm']} WPM — ${Number(metrics['speaking_rate_wpm']) > 160 ? 'fast' : Number(metrics['speaking_rate_wpm']) < 130 ? 'slow' : 'normal'} pace`)
      break
    }
    case 'emotion': {
      const emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised']
      const primaryEmotion = pickRandom(emotions, rng)
      metrics['primary_emotion'] = primaryEmotion
      metrics['emotional_variability'] = Math.round(rng() * 100)
      metrics['arousal_level'] = Math.round(rng() * 100)
      metrics['valence_score'] = Math.round((rng() * 2 - 1) * 100) / 100

      findings.push({
        category: 'Primary Emotion',
        severity: 'info',
        description: `Dominant emotion detected: ${primaryEmotion}`,
        value: primaryEmotion,
        threshold: 'context-dependent',
      })
      findings.push({
        category: 'Arousal',
        severity: Number(metrics['arousal_level']) > 80 ? 'warning' : 'info',
        description: `Arousal level: ${metrics['arousal_level']}%`,
        value: `${metrics['arousal_level']}%`,
        threshold: 'varies by content type',
      })

      suggestions.push(`Primary情感(primary emotion): ${primaryEmotion} — adjust TTS settings accordingly`)
      if (Number(metrics['emotional_variability']) > 70) {
        suggestions.push('High emotional variability detected — consider segmenting for targeted voice styles')
      }
      break
    }
  }

  // Benchmark comparison
  const benchmark_comparison: BenchmarkEntry[] = [
    { metric: 'Noise Floor', value: meta.noise_floor_db, broadcast_standard: -60, podcast_standard: -50, phone_standard: -40, status: meta.noise_floor_db <= -60 ? 'pass' : meta.noise_floor_db <= -50 ? 'warn' : 'fail' },
    { metric: 'Peak (dB)', value: meta.peak_amplitude_db, broadcast_standard: -3, podcast_standard: -1, phone_standard: 0, status: meta.peak_amplitude_db <= -3 ? 'pass' : meta.peak_amplitude_db <= -1 ? 'warn' : 'fail' },
    { metric: 'Sample Rate', value: meta.sample_rate, broadcast_standard: 48000, podcast_standard: 44100, phone_standard: 16000, status: meta.sample_rate >= 44100 ? 'pass' : meta.sample_rate >= 16000 ? 'warn' : 'fail' },
    { metric: 'Bitrate (kbps)', value: meta.bitrate_kbps, broadcast_standard: 320, podcast_standard: 192, phone_standard: 64, status: meta.bitrate_kbps >= 192 ? 'pass' : meta.bitrate_kbps >= 128 ? 'warn' : 'fail' },
  ]

  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const warnCount = findings.filter(f => f.severity === 'warning').length
  const totalFindings = findings.length
  const overall_score = Math.max(0, Math.round(100 - (criticalCount * 25) - (warnCount * 10)))

  if (suggestions.length === 0) suggestions.push('All metrics within acceptable range for chosen standard')

  return {
    analysis_type: input.analysis_type,
    overall_score,
    findings,
    metrics,
    suggestions,
    benchmark_comparison,
  }
}

function formatAudioAnalysisReport(result: AudioAnalysisResult): string {
  const lines: string[] = []
  lines.push(`# Audio Analysis Report — ${result.analysis_type.toUpperCase()}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  lines.push('## Overall Score')
  lines.push('')
  const scoreBar = '#'.repeat(Math.floor(result.overall_score / 10)) + '-'.repeat(10 - Math.floor(result.overall_score / 10))
  lines.push(`**Score: ${result.overall_score}/100**`)
  lines.push('')
  lines.push(`[${scoreBar}]`)
  lines.push('')

  lines.push('## Findings')
  lines.push('')
  lines.push('| Category | Severity | Description | Value | Threshold |')
  lines.push('|----------|----------|-------------|-------|-----------|')
  for (const f of result.findings) {
    lines.push(`| ${f.category} | ${f.severity.toUpperCase()} | ${f.description} | ${f.value} | ${f.threshold} |`)
  }
  lines.push('')

  lines.push('## Metrics')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  for (const [key, val] of Object.entries(result.metrics)) {
    lines.push(`| ${key} | ${val} |`)
  }
  lines.push('')

  lines.push('## Benchmark Comparison')
  lines.push('')
  lines.push('| Metric | Value | Broadcast | Podcast | Phone | Status |')
  lines.push('|--------|-------|-----------|---------|-------|--------|')
  for (const b of result.benchmark_comparison) {
    lines.push(`| ${b.metric} | ${b.value} | ${b.broadcast_standard} | ${b.podcast_standard} | ${b.phone_standard} | ${b.status.toUpperCase()} |`)
  }
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('## Suggestions')
  lines.push('')
  for (const s of result.suggestions) {
    lines.push(`- ${s}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 4: podcast_producer
// ============================================================================

function producePodcast(input: PodcastInput): PodcastPlan {
  const rng = createSeededRandom(input.episode_topic + input.format + input.duration_guests.planned_duration_min.toString())
  const totalMin = input.duration_guests.planned_duration_min
  const guestCount = input.duration_guests.guest_count

  const segments: PodcastSegment[] = []
  const timeline: TimelineEntry[] = []
  let currentMinute = 0

  // Intro segment
  const introDuration = Math.max(1, Math.round(totalMin * 0.08))
  segments.push({
    name: 'Intro',
    type: 'intro',
    duration_min: introDuration,
    description: 'Theme music, podcast intro, episode title, host welcome',
    speakers: ['Host'],
    cues: ['Theme music fade in', 'Show title drop', 'Host introduction'],
    tts_voice: 'narrator',
  })
  timeline.push({ minute: currentMinute, event: 'Intro begins', speaker: 'Host', audio_cue: 'theme_music_intro' })
  currentMinute += introDuration

  // Content segments based on format
  if (input.format === 'interview') {
    const qaDuration = Math.round(totalMin * 0.7)
    segments.push({
      name: 'Interview',
      type: 'discussion',
      duration_min: qaDuration,
      description: `Host asks ${guestCount} guest(s) questions; conversational flow`,
      speakers: ['Host', ...Array.from({ length: guestCount }, (_, i) => `Guest ${i + 1}`)],
      cues: ['Question transitions', 'Guest introductions', 'Audio level check'],
      tts_voice: 'conversational',
    })
    timeline.push({ minute: currentMinute, event: 'Interview starts', speaker: 'Host', audio_cue: 'interview_begin_chime' })
    currentMinute += qaDuration
  } else if (input.format === 'solo') {
    const contentDuration = Math.round(totalMin * 0.8)
    segments.push({
      name: 'Main Content',
      type: 'content',
      duration_min: contentDuration,
      description: 'Host delivers primary educational/entertainment content',
      speakers: ['Host'],
      cues: ['Key point markers', 'Transition music', 'Summary breaks'],
      tts_voice: 'educator',
    })
    timeline.push({ minute: currentMinute, event: 'Content begins', speaker: 'Host', audio_cue: 'content_start' })
    currentMinute += contentDuration
  } else {
    // Panel
    segments.push({
      name: 'Roundtable',
      type: 'discussion',
      duration_min: Math.round(totalMin * 0.7),
      description: `Panel discussion with host and ${guestCount} participants`,
      speakers: ['Host', ...Array.from({ length: guestCount }, (_, i) => `Panelist ${i + 1}`)],
      cues: ['Speaker identification chimes', 'Transition cues', 'Moderation prompts'],
      tts_voice: 'conversational',
    })
    timeline.push({ minute: currentMinute, event: 'Panel begins', speaker: 'Host', audio_cue: 'panel_bell' })
    currentMinute += Math.round(totalMin * 0.7)
  }

  // Interlude (if enough time remaining)
  if (currentMinute < totalMin - 2) {
    segments.push({
      name: 'Interlude',
      type: 'interlude',
      duration_min: 1,
      description: 'Brief music break or sponsor message',
      speakers: [],
      cues: ['Music bed', 'Mid-roll ad slot'],
      tts_voice: 'announcer',
    })
    timeline.push({ minute: currentMinute, event: 'Interlude', speaker: '-', audio_cue: 'interlude_music' })
    currentMinute += 1
  }

  // Outro
  const outroDuration = totalMin - currentMinute
  segments.push({
    name: 'Outro',
    type: 'outro',
    duration_min: Math.max(1, outroDuration),
    description: 'Wrap-up, call-to-action, theme music, sign-off',
    speakers: ['Host'],
    cues: ['Summary points', 'CTA mention', 'Theme music fade out', 'End chime'],
    tts_voice: 'narrator',
  })
  timeline.push({ minute: currentMinute, event: 'Outro begins', speaker: 'Host', audio_cue: 'outro_music' })

  const production_notes: string[] = [
    `Format: ${input.format} | Duration: ${totalMin}min | Guests: ${guestCount}`,
    `TTS voice mapping: narrator for intro/outro, conversational for discussion`,
    `Record at 48kHz/24-bit minimum for professional quality`,
    `Leave 2-second silence at start/end for post-processing`,
  ]

  const equipment_checklist: string[] = [
    'Microphone: Large-diaphragm condenser (checked)',
    'Audio interface: 48kHz/24-bit capable',
    'Closed-back headphones for monitoring',
    'Pop filter and shock mount',
    'Acoustic treatment (foam panels/blankets)',
    'Backup recording device or software',
  ]

  const guest_instructions: string[] = [
    'Use wired internet connection (not WiFi)',
    'Close all unnecessary applications',
    'Mute phone and notifications',
    'Speak at arm\'s length from microphone',
    'Use external microphone (not built-in laptop mic)',
  ]

  return {
    topic: input.episode_topic,
    format: input.format,
    total_duration_min: totalMin,
    segments,
    timeline,
    production_notes,
    equipment_checklist,
    guest_instructions,
  }
}

function formatPodcastPlan(plan: PodcastPlan): string {
  const lines: string[] = []
  lines.push('# Podcast Production Plan')
  lines.push('')
  lines.push('---')
  lines.push('')

  lines.push('## Overview')
  lines.push('')
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push(`| Topic | ${plan.topic} |`)
  lines.push(`| Format | ${plan.format} |`)
  lines.push(`| Duration | ${plan.total_duration_min} min |`)
  lines.push(`| Segments | ${plan.segments.length} |`)
  lines.push('')

  lines.push('## Segment Breakdown')
  lines.push('')
  for (const seg of plan.segments) {
    lines.push(`### ${seg.name} (${seg.duration_min}min) — ${seg.type}`)
    lines.push('')
    lines.push(`_${seg.description}_`)
    lines.push('')
    lines.push('| Field | Detail |')
    lines.push('|-------|--------|')
    lines.push(`| Speakers | ${seg.speakers.length > 0 ? seg.speakers.join(', ') : 'N/A (music)'} |`)
    lines.push(`| TTS Voice | ${seg.tts_voice} |`)
    lines.push('')
    lines.push('**Cues:**')
    for (const cue of seg.cues) {
      lines.push(`- ${cue}`)
    }
    lines.push('')
  }

  lines.push('## Timeline')
  lines.push('')
  lines.push('| Minute | Event | Speaker | Audio Cue |')
  lines.push('|--------|-------|---------|-----------|')
  for (const t of plan.timeline) {
    lines.push(`| ${t.minute} | ${t.event} | ${t.speaker} | ${t.audio_cue} |`)
  }
  lines.push('')

  lines.push('---')
  lines.push('')

  lines.push('## Production Notes')
  lines.push('')
  for (const note of plan.production_notes) {
    lines.push(`- ${note}`)
  }
  lines.push('')

  lines.push('## Equipment Checklist')
  lines.push('')
  for (const item of plan.equipment_checklist) {
    lines.push(`- [ ] ${item}`)
  }
  lines.push('')

  if (plan.guest_instructions.length > 0) {
    lines.push('## Guest Instructions')
    lines.push('')
    for (const inst of plan.guest_instructions) {
      lines.push(`- ${inst}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ============================================================================
// TOOL 5: subtitle_generator
// ============================================================================

function generateSubtitles(data: SubtitleInput): SubtitleResult {
  const entries: SubtitleEntry[] = []
  const warnings: string[] = []
  let content = ''

  data.transcription.forEach((line, idx) => {
    const duration = line.end_sec - line.start_sec
    const char_count = line.text.length
    const cps = duration > 0 ? char_count / duration : 0

    let valid = true
    const textLines = splitTextToLines(line.text, data.timing_rules.max_chars_per_line, data.timing_rules.max_lines)

    // Validation
    if (duration < data.timing_rules.min_duration_sec) {
      valid = false
      warnings.push(`Entry ${idx + 1}: Duration ${duration.toFixed(1)}s < minimum ${data.timing_rules.min_duration_sec}s`)
    }
    if (cps > data.timing_rules.reading_speed_cps) {
      valid = false
      warnings.push(`Entry ${idx + 1}: Reading speed ${cps.toFixed(1)} CPS > max ${data.timing_rules.reading_speed_cps} CPS`)
    }

    entries.push({
      index: idx + 1,
      start: formatSrtTime(line.start_sec),
      end: formatSrtTime(line.end_sec),
      text: textLines.join('\n'),
      duration_sec: Math.round(duration * 100) / 100,
      char_count,
      cps: Math.round(cps * 10) / 10,
      valid,
    })
  })

  // Format output based on chosen format
  if (data.format === 'srt') {
    content = entries.map(e =>
      `${e.index}\n${e.start} --> ${e.end}\n${e.text}\n`
    ).join('\n')
  } else if (data.format === 'vtt') {
    content = 'WEBVTT\n\n' + entries.map(e =>
      `${formatVttTime(data.transcription[e.index - 1].start_sec)} --> ${formatVttTime(data.transcription[e.index - 1].end_sec)}\n${e.text}\n`
    ).join('\n')
  } else {
    // ASS format
    content = '[Script Info]\nTitle: Generated Subtitles\nScriptType: v4.00+\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV\nStyle: Default,Arial,28,&H00FFFFFF,&H000000FF,&H00000000,0,0,1,2,0,2,10,10,10\n\n[Events]\nFormat: Layer, Start, End, Style, Text\n' +
      entries.map(e => {
        const startAss = formatAssTime(data.transcription[e.index - 1].start_sec)
        const endAss = formatAssTime(data.transcription[e.index - 1].end_sec)
        return `Dialogue: 0,${startAss},${endAss},Default,,${e.text.replace('\\N', ' ')}`
      }).join('\n')
  }

  // Stats
  const cpsValues = entries.map(e => e.cps)
  const stats: SubtitleStats = {
    avg_cps: Math.round((cpsValues.reduce((a, b) => a + b, 0) / cpsValues.length) * 10) / 10,
    max_cps: Math.round(Math.max(...cpsValues) * 10) / 10,
    min_cps: Math.round(Math.min(...cpsValues) * 10) / 10,
    total_chars: entries.reduce((a, b) => a + b.char_count, 0),
    over_speed_count: entries.filter(e => e.cps > data.timing_rules.reading_speed_cps).length,
    too_short_count: entries.filter(e => e.duration_sec < data.timing_rules.min_duration_sec).length,
    too_long_count: entries.filter(e => e.duration_sec > data.timing_rules.max_duration_sec).length,
  }

  return {
    format: data.format,
    subtitle_count: entries.length,
    total_duration_sec: Math.round((data.transcription[data.transcription.length - 1]?.end_sec || 0) * 100) / 100,
    content,
    entries,
    stats,
    warnings,
  }
}

/** Split text to lines respecting max chars and max lines */
function splitTextToLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim()
    } else {
      if (current) lines.push(current)
      current = word
    }
    if (lines.length >= maxLines - 1) break
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : [text]
}

/** Format seconds to ASS timestamp (H:MM:SS.cs) */
function formatAssTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const cs = Math.floor((seconds % 1) * 100)
  return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
}

function formatSubtitleReport(result: SubtitleResult): string {
  const lines: string[] = []
  lines.push(`# Subtitle Generation Report — ${result.format.toUpperCase()}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  lines.push('## Statistics')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Subtitle Count | ${result.subtitle_count} |`)
  lines.push(`| Total Duration | ${formatTime(result.total_duration_sec)} |`)
  lines.push(`| Avg Reading Speed | ${result.stats.avg_cps} CPS |`)
  lines.push(`| Max Speed | ${result.stats.max_cps} CPS |`)
  lines.push(`| Min Speed | ${result.stats.min_cps} CPS |`)
  lines.push(`| Total Characters | ${result.stats.total_chars} |`)
  lines.push(`| Valid Entries | ${result.entries.filter(e => e.valid).length}/${result.subtitle_count} |`)
  lines.push('')

  if (result.warnings.length > 0) {
    lines.push('## Warnings')
    lines.push('')
    for (const w of result.warnings) {
      lines.push(`- ${w}`)
    }
    lines.push('')
  }

  lines.push('## Entry Preview (First 5)')
  lines.push('')
  for (const e of result.entries.slice(0, 5)) {
    lines.push(`**${e.index}.** \`${e.start}\` → \`${e.end}\` (${e.duration_sec}s, ${e.cps} CPS) ${e.valid ? '' : 'INVALID'}`)
    lines.push('```')
    lines.push(e.text)
    lines.push('```')
    lines.push('')
  }

  if (result.entries.length > 5) {
    lines.push(`_... and ${result.entries.length - 5} more entries_`)
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push(`## Full ${result.format.toUpperCase()} Output`)
  lines.push('')
  lines.push('```')
  lines.push(result.content.substring(0, 2000))
  if (result.content.length > 2000) {
    lines.push(`\n... (${result.content.length - 2000} more characters) ...`)
  }
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 6: voice_emotion_advisor
// ============================================================================

function analyzeEmotionAdvice(input: EmotionInput): EmotionAdvice {
  const rng = createSeededRandom(input.script_text + input.target_emotion + input.audience)

  const emotionProfile: Record<string, ProsodySettings> = {
    neutral: { base_pitch_hz: 180, pitch_range_hz: [160, 200], base_rate: 1.0, volume_db: -12, breathiness: 30, tension: 40 },
    happy: { base_pitch_hz: 220, pitch_range_hz: [180, 280], base_rate: 1.1, volume_db: -10, breathiness: 20, tension: 30 },
    sad: { base_pitch_hz: 140, pitch_range_hz: [120, 160], base_rate: 0.8, volume_db: -16, breathiness: 50, tension: 20 },
    angry: { base_pitch_hz: 200, pitch_range_hz: [150, 260], base_rate: 1.3, volume_db: -8, breathiness: 10, tension: 90 },
    fearful: { base_pitch_hz: 240, pitch_range_hz: [200, 300], base_rate: 1.4, volume_db: -14, breathiness: 40, tension: 70 },
    surprised: { base_pitch_hz: 230, pitch_range_hz: [170, 310], base_rate: 1.2, volume_db: -10, breathiness: 25, tension: 50 },
    empathetic: { base_pitch_hz: 170, pitch_range_hz: [150, 200], base_rate: 0.9, volume_db: -14, breathiness: 45, tension: 25 },
    authoritative: { base_pitch_hz: 160, pitch_range_hz: [140, 190], base_rate: 0.95, volume_db: -10, breathiness: 15, tension: 60 },
  }

  const prosody = emotionProfile[input.target_emotion] || emotionProfile.neutral

  // Generate emotion annotations for script segments
  const sentences = input.script_text.match(/[^.!?]+[.!?]+/g) || [input.script_text]
  const annotations: EmotionAnnotation[] = []
  let pos = 0

  sentences.forEach((sentence, idx) => {
    const trimmed = sentence.trim()
    const startPos = pos
    const endPos = pos + trimmed.length

    // Determine emotion variation across the script
    let emotionVariation = 0
    if (idx < sentences.length * 0.3) emotionVariation = -1
    else if (idx > sentences.length * 0.7) emotionVariation = 1

    const speedFactor = Math.max(0.5, Math.min(2.0, prosody.base_rate + emotionVariation * 0.1 + (rng() - 0.5) * 0.2))
    const volumeDirection: 'louder' | 'normal' | 'softer' =
      input.target_emotion === 'angry' ? 'louder' :
      input.target_emotion === 'sad' ? 'softer' :
      input.target_emotion === 'authoritative' ? 'louder' : 'normal'
    const pauseAfter = Math.max(100, Math.round(300 + rng() * 400))

    annotations.push({
      text_snippet: trimmed.length > 60 ? trimmed.substring(0, 60) + '...' : trimmed,
      start_pos: startPos,
      end_pos: endPos,
      emotion: input.target_emotion,
      intensity: Math.round(70 + rng() * 30),
      pitch_direction: emotionVariation > 0 ? 'up' : emotionVariation < 0 ? 'down' : 'flat',
      speed_factor: Math.round(speedFactor * 100) / 100,
      volume: volumeDirection,
      pause_after_ms: pauseAfter,
    })

    pos = endPos + 1
  })

  // Delivery tips based on target emotion
  const delivery_tips: string[] = []
  const practice_exercises: string[] = []

  switch (input.target_emotion) {
    case 'happy':
      delivery_tips.push('Smile while speaking — it physically changes vocal tone')
      delivery_tips.push('Use upward inflections to convey enthusiasm')
      delivery_tips.push('Vary pitch more broadly than neutral speech')
      practice_exercises.push('Read a grocery list with exaggerated cheerfulness (1 min)')
      practice_exercises.push('Practice the "happy surprise" inflection 10 times')
      break
    case 'sad':
      delivery_tips.push('Slow down — pace is the primary sadness cue')
      delivery_tips.push('Lower pitch and reduce pitch variation')
      delivery_tips.push('Use softer volume and longer pauses')
      practice_exercises.push('Read a phone book with melancholic tone (1 min)')
      practice_exercises.push('Practice sighing between phrases naturally')
      break
    case 'angry':
      delivery_tips.push('Increase volume and pace, but maintain clarity')
      delivery_tips.push('Use sharp, definite consonants')
      delivery_tips.push('Avoid shouting — controlled anger is more effective')
      practice_exercises.push('Count to 20 with escalating intensity (30s)')
      practice_exercises.push('Practice "controlled explosion" — sudden then contained')
      break
    case 'empathetic':
      delivery_tips.push('Warm, slow, and steady — like speaking to a friend')
      delivery_tips.push('Use mirroring — match the other person\'s pace subconsciously')
      delivery_tips.push('Allow natural pauses for the listener to absorb')
      practice_exercises.push('Tell a personal story with warmth (2 min)')
      practice_exercises.push('Practice reflective listening statements 10 times')
      break
    case 'authoritative':
      delivery_tips.push('Speak from the chest — project confidence')
      delivery_tips.push('Use downward inflections to signal certainty')
      delivery_tips.push('Pause before key points for emphasis')
      practice_exercises.push('Read news headlines with authority (1 min)')
      practice_exercises.push('Practice the "executive pause" — 2 seconds before important words')
      break
    default:
      delivery_tips.push('Maintain consistent pace and volume')
      delivery_tips.push('Clear enunciation with neutral tone')
      practice_exercises.push('Read aloud at moderate pace with recorder (3 min)')
  }

  // Audience-specific adjustments
  if (input.audience === 'children') {
    delivery_tips.push('For children: Use higher pitch (+20%) and exaggerated intonation')
    delivery_tips.push('Add "warmth markers" — gentle laughter, softer consonants')
  } else if (input.audience === 'seniors') {
    delivery_tips.push('For seniors: Reduce speed by 10-15%, increase volume slightly')
    delivery_tips.push('Use clearer consonant articulation')
  }

  // Emotional arc
  const arc: ArcPoint[] = [
    { position: 0, emotion: 'introduction', intensity: 40, instruction: 'Gentle establishment of voice baseline' },
    { position: 30, emotion: input.target_emotion, intensity: 60, instruction: 'Begin building toward target emotion' },
    { position: 60, emotion: input.target_emotion, intensity: 90, instruction: 'Full expression of target emotion' },
    { position: 90, emotion: 'resolution', intensity: 50, instruction: 'Gradual return to baseline, satisfying close' },
  ]

  return {
    script_text: input.script_text,
    target_emotion: input.target_emotion,
    audience: input.audience,
    emotion_annotations: annotations,
    prosody_settings: prosody,
    delivery_tips,
    practice_exercises,
    emotional_arc: arc,
  }
}

function formatEmotionAdvice(advice: EmotionAdvice): string {
  const lines: string[] = []
  lines.push('# Voice Emotion Advisor Report')
  lines.push('')
  lines.push('---')
  lines.push('')

  lines.push('## Parameters')
  lines.push('')
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push(`| Target Emotion | ${advice.target_emotion} |`)
  lines.push(`| Audience | ${advice.audience} |`)
  lines.push(`| Annotations | ${advice.emotion_annotations.length} |`)
  lines.push('')

  lines.push('## Prosody Settings')
  lines.push('')
  lines.push('| Setting | Value |')
  lines.push('|---------|-------|')
  lines.push(`| Base Pitch | ${advice.prosody_settings.base_pitch_hz} Hz |`)
  lines.push(`| Pitch Range | ${advice.prosody_settings.pitch_range_hz[0]}–${advice.prosody_settings.pitch_range_hz[1]} Hz |`)
  lines.push(`| Speaking Rate | ${advice.prosody_settings.base_rate}x |`)
  lines.push(`| Volume | ${advice.prosody_settings.volume_db} dB |`)
  lines.push(`| Breathiness | ${advice.prosody_settings.breathiness}% |`)
  lines.push(`| Tension | ${advice.prosody_settings.tension}% |`)
  lines.push('')

  lines.push('## Emotion Annotations')
  lines.push('')
  lines.push('| Snippet | Emotion | Intensity | Pitch | Speed | Volume | Pause |')
  lines.push('|---------|---------|-----------|-------|-------|--------|-------|')
  for (const a of advice.emotion_annotations) {
    lines.push(`| "${a.text_snippet}" | ${a.emotion} | ${a.intensity}% | ${a.pitch_direction} | ${a.speed_factor}x | ${a.volume} | ${a.pause_after_ms}ms |`)
  }
  lines.push('')

  lines.push('## Emotional Arc')
  lines.push('')
  lines.push('| Position | Emotion | Intensity | Instruction |')
  lines.push('|----------|---------|-----------|-------------|')
  for (const point of advice.emotional_arc) {
    lines.push(`| ${point.position}% | ${point.emotion} | ${point.intensity}% | ${point.instruction} |`)
  }
  lines.push('')

  lines.push('---')
  lines.push('')

  lines.push('## Delivery Tips')
  lines.push('')
  for (const tip of advice.delivery_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')

  lines.push('## Practice Exercises')
  lines.push('')
  for (const exercise of advice.practice_exercises) {
    lines.push(`- ${exercise}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 7: audio_quality_checker
// ============================================================================

function checkAudioQuality(input: AudioQualityInput): AudioQualityResult {
  const specs = input.audio_specs
  const standard = input.target_standard
  const checks: QualityCheck[] = []

  // Standard limits reference
  const standard_limits: StandardLimit[] = [
    { parameter: 'Sample Rate', broadcast: '48kHz', podcast: '44.1kHz', phone: '16kHz' },
    { parameter: 'Bit Depth', broadcast: '24-bit', podcast: '16-bit', phone: '16-bit' },
    { parameter: 'Channels', broadcast: '2 (stereo)', podcast: '1 (mono)', phone: '1 (mono)' },
    { parameter: 'Bitrate', broadcast: '≥256kbps', podcast: '≥192kbps', phone: '≥64kbps' },
    { parameter: 'Noise Floor', broadcast: '< -60dB', podcast: '< -50dB', phone: '< -40dB' },
    { parameter: 'Dynamic Range', broadcast: '> 40dB', podcast: '> 30dB', phone: '> 20dB' },
    { parameter: 'Peak Level', broadcast: '≤ -3dB', podcast: '≤ -1dB', phone: '≤ 0dB' },
    { parameter: 'Integrated LUFS', broadcast: '-23 LUFS', podcast: '-16 LUFS', phone: '-12 LUFS' },
  ]

  // Sample rate check
  const srStandard = standard === 'broadcast' ? 48000 : standard === 'podcast' ? 44100 : 16000
  checks.push({
    name: 'Sample Rate',
    value: specs.sample_rate,
    unit: 'Hz',
    standard_limit: `≥ ${srStandard}Hz`,
    status: specs.sample_rate >= srStandard ? 'pass' : specs.sample_rate >= srStandard * 0.5 ? 'warn' : 'fail',
    suggestion: specs.sample_rate >= srStandard ? 'Sample rate meets standard' : `Upsample to ${srStandard}Hz or higher`,
  })

  // Bit depth check
  const bdStandard = standard === 'broadcast' ? 24 : 16
  checks.push({
    name: 'Bit Depth',
    value: specs.bit_depth,
    unit: 'bit',
    standard_limit: `≥ ${bdStandard}-bit`,
    status: specs.bit_depth >= bdStandard ? 'pass' : specs.bit_depth >= 16 ? 'warn' : 'fail',
    suggestion: specs.bit_depth >= bdStandard ? 'Bit depth meets standard' : `Convert to ${bdStandard}-bit depth`,
  })

  // Dynamic range check
  const drStandard = standard === 'broadcast' ? 40 : standard === 'podcast' ? 30 : 20
  checks.push({
    name: 'Dynamic Range',
    value: specs.dynamic_range_db,
    unit: 'dB',
    standard_limit: `≥ ${drStandard}dB`,
    status: specs.dynamic_range_db >= drStandard ? 'pass' : specs.dynamic_range_db >= drStandard * 0.7 ? 'warn' : 'fail',
    suggestion: specs.dynamic_range_db >= drStandard ? 'Dynamic range satisfactory' : 'Compress less or record at higher bit depth',
  })

  // Noise floor check
  const nfStandard = standard === 'broadcast' ? -60 : standard === 'podcast' ? -50 : -40
  checks.push({
    name: 'Noise Floor',
    value: specs.noise_floor_db,
    unit: 'dB',
    standard_limit: `≤ ${nfStandard}dB`,
    status: specs.noise_floor_db <= nfStandard ? 'pass' : specs.noise_floor_db <= nfStandard + 10 ? 'warn' : 'fail',
    suggestion: specs.noise_floor_db <= nfStandard ? 'Noise floor acceptable' : 'Apply noise reduction (e.g., iZotope RX, Audacity)',
  })

  // Peak level check
  const peakStandard = standard === 'broadcast' ? -3 : standard === 'podcast' ? -1 : 0
  checks.push({
    name: 'Peak Level',
    value: specs.peak_db,
    unit: 'dB',
    standard_limit: `≤ ${peakStandard}dB`,
    status: specs.peak_db <= peakStandard ? 'pass' : specs.peak_db <= peakStandard + 2 ? 'warn' : 'fail',
    suggestion: specs.peak_db <= peakStandard ? 'Peak level safe' : 'Lower input gain to prevent clipping',
  })

  // LUFS check
  const lufsStandard = standard === 'broadcast' ? -23 : standard === 'podcast' ? -16 : -12
  const lufsDelta = Math.abs(specs.lufs - lufsStandard)
  checks.push({
    name: 'Integrated LUFS',
    value: specs.lufs,
    unit: 'LUFS',
    standard_limit: `${lufsStandard} LUFS (±2)`,
    status: lufsDelta <= 2 ? 'pass' : lufsDelta <= 5 ? 'warn' : 'fail',
    suggestion: lufsDelta <= 2 ? 'Loudness on target' : `Adjust gain to reach ${lufsStandard} LUFS`,
  })

  // Bitrate check
  const brStandard = standard === 'broadcast' ? 256 : standard === 'podcast' ? 192 : 64
  checks.push({
    name: 'Bitrate',
    value: specs.bitrate_kbps,
    unit: 'kbps',
    standard_limit: `≥ ${brStandard}kbps`,
    status: specs.bitrate_kbps >= brStandard ? 'pass' : specs.bitrate_kbps >= brStandard * 0.7 ? 'warn' : 'fail',
    suggestion: specs.bitrate_kbps >= brStandard ? 'Bitrate sufficient' : `Encode at ${brStandard}kbps minimum for ${standard} quality`,
  })

  // Calculate overall score
  const passCount = checks.filter(c => c.status === 'pass').length
  const warnCount = checks.filter(c => c.status === 'warn').length
  const failCount = checks.filter(c => c.status === 'fail').length
  const pass_rate = Math.round((passCount / checks.length) * 100)
  const overall_score = Math.max(0, Math.round(pass_rate - (warnCount * 5) - (failCount * 15)))

  // Grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A'
  if (overall_score >= 90) grade = 'A'
  else if (overall_score >= 75) grade = 'B'
  else if (overall_score >= 60) grade = 'C'
  else if (overall_score >= 40) grade = 'D'
  else grade = 'F'

  // Improvements
  const improvements: string[] = []
  for (const check of checks) {
    if (check.status !== 'pass') {
      improvements.push(`${check.name}: ${check.suggestion}`)
    }
  }
  if (improvements.length === 0) improvements.push('All checks passed — audio meets ' + standard + ' standard')

  const summary = `Audio quality checked against ${standard} standard. Score: ${overall_score}/100 (${grade}). Pass rate: ${pass_rate}%.`

  return {
    target_standard: standard,
    overall_score,
    grade,
    checks,
    pass_rate,
    improvements,
    standard_limits,
    summary,
  }
}

function formatAudioQualityReport(result: AudioQualityResult): string {
  const lines: string[] = []
  lines.push(`# Audio Quality Check — ${result.target_standard.toUpperCase()} Standard`)
  lines.push('')
  lines.push('---')
  lines.push('')

  lines.push('## Overall Assessment')
  lines.push('')
  lines.push('| Grade | Score | Pass Rate |')
  lines.push('|-------|-------|-----------|')
  lines.push(`| ${result.grade} | ${result.overall_score}/100 | ${result.pass_rate}% |`)
  lines.push('')

  lines.push('## Quality Checks')
  lines.push('')
  lines.push('| Check | Value | Standard | Status | Suggestion |')
  lines.push('|-------|-------|----------|--------|------------|')
  for (const c of result.checks) {
    lines.push(`| ${c.name} | ${c.value} ${c.unit} | ${c.standard_limit} | ${c.status.toUpperCase()} | ${c.suggestion} |`)
  }
  lines.push('')

  lines.push('## Standard Limits Reference')
  lines.push('')
  lines.push('| Parameter | Broadcast | Podcast | Phone |')
  lines.push('|-----------|-----------|---------|-------|')
  for (const sl of result.standard_limits) {
    lines.push(`| ${sl.parameter} | ${sl.broadcast} | ${sl.podcast} | ${sl.phone} |`)
  }
  lines.push('')

  lines.push('---')
  lines.push('')
  lines.push('## Improvements')
  lines.push('')
  for (const imp of result.improvements) {
    lines.push(`- ${imp}`)
  }
  lines.push('')

  lines.push('## Summary')
  lines.push('')
  lines.push(`> ${result.summary}`)
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 8: multilingual_voice_mapper
// ============================================================================

function mapMultilingualVoices(input: VoiceMapperInput): VoiceMapperResult {
  const rng = createSeededRandom(input.source_voice.voice_id + input.target_languages.join('') + input.content_domain)

  // Voice database simulation
  const voiceDatabase: Record<string, { voice_id: string; name: string; gender: string; styles: string[] }[]> = {
    en: [
      { voice_id: 'en-female-1', name: 'Aria', gender: 'female', styles: ['conversational', 'formal', 'cheerful'] },
      { voice_id: 'en-male-1', name: 'Marcus', gender: 'male', styles: ['authoritative', 'warm', 'energetic'] },
      { voice_id: 'en-female-2', name: 'Sophia', gender: 'female', styles: ['calm', 'educational', 'professional'] },
    ],
    zh: [
      { voice_id: 'zh-female-1', name: 'Li Wei', gender: 'female', styles: ['educational', 'conversational', 'formal'] },
      { voice_id: 'zh-male-1', name: 'Chen Hao', gender: 'male', styles: ['authoritative', 'warm', 'professional'] },
    ],
    es: [
      { voice_id: 'es-female-1', name: 'Isabella', gender: 'female', styles: ['conversational', 'cheerful', 'educational'] },
      { voice_id: 'es-male-1', name: 'Diego', gender: 'male', styles: ['energetic', 'formal', 'warm'] },
    ],
    fr: [
      { voice_id: 'fr-female-1', name: 'Camille', gender: 'female', styles: ['formal', 'calm', 'educational'] },
      { voice_id: 'fr-male-1', name: 'Louis', gender: 'male', styles: ['authoritative', 'warm'] },
    ],
    ja: [
      { voice_id: 'ja-female-1', name: 'Yuki', gender: 'female', styles: ['calm', 'formal', 'educational'] },
      { voice_id: 'ja-male-1', name: 'Takeshi', gender: 'male', styles: ['authoritative', 'conversational'] },
    ],
    de: [
      { voice_id: 'de-female-1', name: 'Greta', gender: 'female', styles: ['formal', 'professional', 'educational'] },
      { voice_id: 'de-male-1', name: 'Felix', gender: 'male', styles: ['warm', 'authoritative'] },
    ],
    ko: [
      { voice_id: 'ko-female-1', name: 'Seo-yeon', gender: 'female', styles: ['calm', 'conversational'] },
      { voice_id: 'ko-male-1', name: 'Ji-hoon', gender: 'male', styles: ['energetic', 'formal'] },
    ],
  }

  const mappings: VoiceMapping[] = input.target_languages.map(lang => {
    const voices = voiceDatabase[lang] || voiceDatabase.en
    const bestMatch = pickRandom(voices, rng)
    const styleMatch = Math.round(60 + rng() * 40)

    // Domain-specific advice for this content domain
    const domainAdviceMap: Record<string, string> = {
      'e-learning': 'Prioritize clarity and pacing consistency',
      'advertising': 'Focus on energy and emotional persuasion',
      'ivr': 'Use short-form optimized voices with clear enunciation',
      'audiobook': 'Select voices with long-form endurance and natural flow',
      'announcement': 'Authoritative and clear, prioritizing intelligibility',
      'gaming': 'Characterful voices with dynamic range',
      'accessibility': 'Prioritize clarity, slower pace, and neutrality',
    }
    const domainAdvice = domainAdviceMap[input.content_domain] || 'Good overall quality for general use'

    return {
      target_language: lang,
      recommended_voice_id: bestMatch.voice_id,
      voice_name: bestMatch.name,
      gender: bestMatch.gender,
      style_match: styleMatch,
      availability: lang in voiceDatabase ? 'Available' : 'Fallback (similar phoneme space)',
      sample_url: `https://voiceforge.io/samples/${bestMatch.voice_id}/${input.content_domain}`,
      pros: [
        domainAdvice,
        `Style match: ${styleMatch}%`,
        `Supports ${bestMatch.styles.join(', ')} styles`,
      ],
      cons: [
        lang in voiceDatabase ? '' : 'Limited samples for this language',
        styleMatch < 75 ? 'Style match below optimal — consider alternatives' : '',
        bestMatch.styles.length < 3 ? 'Limited style variety' : '',
      ].filter(s => s !== ''),
    }
  })

  // Compatibility notes between languages
  const compatibilities: CompatibilityNote[] = []
  for (let i = 0; i < input.target_languages.length; i++) {
    for (let j = i + 1; j < input.target_languages.length; j++) {
      const langA = input.target_languages[i]
      const langB = input.target_languages[j]
      const compatibility = rng() > 0.6 ? 'high' : rng() > 0.3 ? 'medium' : 'low'
      const fallbackVoice = voiceDatabase[langB]?.[0]?.voice_id || 'en-female-1'

      compatibilities.push({
        language_pair: `${langA} ↔ ${langB}`,
        compatibility,
        notes: compatibility === 'high' ? 'Phoneme spaces align well' : compatibility === 'medium' ? 'Some phoneme mapping required' : 'Significant acoustic adjustment needed',
        fallback_voice: fallbackVoice,
      })
    }
  }

  const coveredLanguages = mappings.filter(m => m.availability === 'Available').length
  const coverage_score = Math.round((coveredLanguages / input.target_languages.length) * 100)

  const recommendations: string[] = [
    `Coverage: ${coverage_score}% of target languages have native voice support`,
    `Content domain "${input.content_domain}" — prioritize ${pickRandom(['clarity', 'warmth', 'authority', 'energy'], rng)} in voice selection`,
    `Source voice style "${input.source_voice.style}" mapped to closest matches per language`,
  ]

  if (coverage_score < 100) {
    recommendations.push('Some languages fall back to similar phoneme space — review quality before production')
  }

  return {
    source_voice: input.source_voice,
    target_languages: input.target_languages,
    content_domain: input.content_domain,
    mappings,
    coverage_score,
    compatibilities,
    recommendations,
  }
}

function formatVoiceMapperReport(result: VoiceMapperResult): string {
  const lines: string[] = []
  lines.push('# Multilingual Voice Mapping Report')
  lines.push('')
  lines.push('---')
  lines.push('')

  lines.push('## Source Voice')
  lines.push('')
  lines.push('| Property | Value |')
  lines.push('|----------|-------|')
  lines.push(`| Voice ID | ${result.source_voice.voice_id} |`)
  lines.push(`| Language | ${result.source_voice.language} |`)
  lines.push(`| Gender | ${result.source_voice.gender} |`)
  lines.push(`| Age Range | ${result.source_voice.age_range} |`)
  lines.push(`| Style | ${result.source_voice.style} |`)
  lines.push('')

  lines.push('## Coverage')
  lines.push('')
  lines.push(`**${result.coverage_score}%** of target languages (${result.target_languages.length}) have native voice support.`)
  lines.push('')

  lines.push('## Voice Mappings')
  lines.push('')
  for (const m of result.mappings) {
    lines.push(`### ${m.target_language}`)
    lines.push('')
    lines.push('| Field | Value |')
    lines.push('|-------|-------|')
    lines.push(`| Voice | ${m.voice_name} (${m.recommended_voice_id}) |`)
    lines.push(`| Gender | ${m.gender} |`)
    lines.push(`| Style Match | ${m.style_match}% |`)
    lines.push(`| Availability | ${m.availability} |`)
    lines.push(`| Sample | [Listen](${m.sample_url}) |`)
    lines.push('')
    if (m.pros.length > 0) {
      lines.push('**Pros:**')
      for (const p of m.pros) {
        lines.push(`- ${p}`)
      }
      lines.push('')
    }
    if (m.cons.length > 0) {
      lines.push('**Cons:**')
      for (const c of m.cons) {
        lines.push(`- ${c}`)
      }
      lines.push('')
    }
  }

  if (result.compatibilities.length > 0) {
    lines.push('## Cross-Language Compatibility')
    lines.push('')
    lines.push('| Language Pair | Compatibility | Notes | Fallback |')
    lines.push('|---------------|---------------|-------|----------|')
    for (const c of result.compatibilities) {
      lines.push(`| ${c.language_pair} | ${c.compatibility.toUpperCase()} | ${c.notes} | ${c.fallback_voice} |`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// PLUGIN EXPORT
// ============================================================================

export const name = 'dsh-tool-voiceforge'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: tts_script_generator
  tools.register(defineTool({
    name: 'tts_script_generator',
    description: 'Generate optimized SSML/TTS scripts from plain text. Applies voice style prosody, emphasis markers, and timing annotations. Supports 6 voice styles.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {text: string, voice_style: "narrator"|"conversational"|"announcer"|"storyteller"|"educator"|"assistant", speed: number(0.5-2.0), emphasis_rules: [{word, level, reason}]}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: TtsScriptInput = JSON.parse(args.input)
      const result = generateTtsScript(data)
      return formatTtsScriptResult(result)
    },
  }))

  // Tool 2: voice_cloning_spec
  tools.register(defineTool({
    name: 'voice_cloning_spec',
    description: 'Generate a comprehensive voice cloning specification including pipeline stages, hardware requirements, quality gates, and recommendations.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {sample_duration: number(seconds), target_language: string, quality_requirements: "broadcast"|"professional"|"draft"|"experimental"}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: VoiceCloningInput = JSON.parse(args.input)
      const result = generateVoiceCloningSpec(data)
      return formatVoiceCloningSpecReport(result)
    },
  }))

  // Tool 3: audio_analyzer
  tools.register(defineTool({
    name: 'audio_analyzer',
    description: 'Analyze audio file metrics for quality, content, speaker, or emotion. Returns findings, benchmark comparisons, and improvement suggestions.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {audio_metadata: {duration_seconds, sample_rate, channels, format, bitrate_kbps, noise_floor_db, peak_amplitude_db}, analysis_type: "quality"|"content"|"speaker"|"emotion"}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: AudioAnalysisInput = JSON.parse(args.input)
      const result = analyzeAudio(data)
      return formatAudioAnalysisReport(result)
    },
  }))

  // Tool 4: podcast_producer
  tools.register(defineTool({
    name: 'podcast_producer',
    description: 'Generate a complete podcast production plan with segments, timeline, equipment checklist, and guest instructions. Supports interview, solo, and panel formats.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {episode_topic: string, duration_guests: {planned_duration_min, guest_count, segments?}, format: "interview"|"solo"|"panel"}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: PodcastInput = JSON.parse(args.input)
      const result = producePodcast(data)
      return formatPodcastPlan(result)
    },
  }))

  // Tool 5: subtitle_generator
  tools.register(defineTool({
    name: 'subtitle_generator',
    description: 'Generate time-aligned subtitles in SRT, VTT, or ASS format from transcription data. Validates reading speed, line length, and timing rules.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {transcription: [{start_sec, end_sec, text, speaker?}], timing_rules: {max_chars_per_line, max_lines, min_duration_sec, max_duration_sec, reading_speed_cps}, format: "srt"|"vtt"|"ass"}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: SubtitleInput = JSON.parse(args.input)
      const result = generateSubtitles(data)
      return formatSubtitleReport(result)
    },
  }))

  // Tool 6: voice_emotion_advisor
  tools.register(defineTool({
    name: 'voice_emotion_advisor',
    description: 'Analyze script text and provide emotion annotations, prosody settings, delivery tips, and practice exercises for target emotion and audience.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {script_text: string, target_emotion: "neutral"|"happy"|"sad"|"angry"|"fearful"|"surprised"|"empathetic"|"authoritative", audience: "children"|"teens"|"adults"|"seniors"|"general"|"professional"}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: EmotionInput = JSON.parse(args.input)
      const result = analyzeEmotionAdvice(data)
      return formatEmotionAdvice(result)
    },
  }))

  // Tool 7: audio_quality_checker
  tools.register(defineTool({
    name: 'audio_quality_checker',
    description: 'Check audio technical specs against broadcast, podcast, or phone standards. Returns pass/fail/warn per metric with improvement suggestions.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {audio_specs: {sample_rate, bit_depth, channels, bitrate_kbps, noise_floor_db, dynamic_range_db, peak_db, lufs}, target_standard: "broadcast"|"podcast"|"phone"}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: AudioQualityInput = JSON.parse(args.input)
      const result = checkAudioQuality(data)
      return formatAudioQualityReport(result)
    },
  }))

  // Tool 8: multilingual_voice_mapper
  tools.register(defineTool({
    name: 'multilingual_voice_mapper',
    description: 'Map a source voice to optimal voice configurations across multiple languages. Includes style matching, cross-language compatibility, and coverage scoring.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {source_voice: {voice_id, language, gender, age_range, style}, target_languages: string[], content_domain: "e-learning"|"advertising"|"ivr"|"audiobook"|"announcement"|"gaming"|"accessibility"}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: VoiceMapperInput = JSON.parse(args.input)
      const result = mapMultilingualVoices(data)
      return formatVoiceMapperReport(result)
    },
  }))
}
