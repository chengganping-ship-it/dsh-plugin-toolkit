/**
 * DSH AI Music Producer Plugin v1.0.0
 *
 * AI Music Production toolkit providing tools for AI-assisted music creation,
 * arrangement, mixing, mastering, sample generation, copyright advisory,
 * playlist curation, and music business analysis. Leverages state-of-the-art
 * AI music generation models (Suno, Udio, Stable Audio) alongside traditional
 * production workflows.
 *
 * Features (v1.0.0):
 * - Composition Assistant (chord progressions, melodies, bass lines, structure)
 * - Arrangement Optimizer (instrument placement, dynamics, transitions)
 * - Mixing Engineer AI (levels, panning, EQ, compression, reverb recommendations)
 * - Mastering Chain Designer (EQ, compression, limiting, stereo enhancement)
 * - Sample Generator Config (AI sample/sound generation parameter configuration)
 * - Music CopyClear Advisor (copyright, licensing, clearance, royalties)
 * - Playlist Curator AI (mood/activity-based playlist creation with flow optimization)
 * - Music Business Analyzer (streaming revenue, royalty splits, marketing ROI)
 *
 * @module dsh-tool-musicproducer
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-musicproducer'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated music production analysis for informational purposes only. It does not constitute legal, financial, or professional advice. Consult qualified music professionals, attorneys, and accountants before making creative or business decisions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function computeSeed(input: unknown): number {
  const json = JSON.stringify(input)
  let seed = 0
  for (let i = 0; i < json.length; i++) {
    seed = (seed + json.charCodeAt(i)) % 2147483647
  }
  return seed || 1
}

function makeRng(input: unknown) {
  const seed = computeSeed(input)
  const rand = mulberry32(seed)
  return {
    next: (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min,
    nextFloat: (min: number, max: number) => rand() * (max - min) + min,
    pick: <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)],
    pickN: <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => rand() - 0.5)
      return shuffled.slice(0, n)
    },
    chance: (pct: number) => rand() * 100 < pct,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: Composition Assistant ---
interface CompositionInput {
  genre?: string
  mood?: string
  tempo_bpm?: number
  key?: string
  duration_sec?: number
  structure_type?: string
  instrumentation?: string[]
}

interface ChordProgression {
  section: string
  chords: string[]
  roman_numerals: string[]
  description: string
}

interface MelodyIdea {
  contour: string
  rhythm_pattern: string
  scale_degrees: string[]
  description: string
}

interface CompositionOutput {
  generated_progressions: ChordProgression[]
  melody_ideas: MelodyIdea[]
  bass_line: string
  song_structure: string[]
  arrangement_notes: string[]
  production_tips: string[]
}

// --- Tool 2: Arrangement Optimizer ---
interface CompositionSketch {
  tempo_bpm?: number
  key?: string
  time_signature?: string
  instrumentation?: string[]
  sections?: string[]
}

interface ArrangementInput {
  composition_sketch?: CompositionSketch
  target_genre?: string
  energy_curve?: string
  instrumentation?: string[]
  arrangement_style?: string
}

interface InstrumentLayer {
  instrument: string
  sections_active: string[]
  dynamics: string
  frequency_range: string
  arrangement_note: string
}

interface TransitionPlan {
  from_section: string
  to_section: string
  technique: string
  duration_beats: number
  description: string
}

interface ArrangementOutput {
  instrument_layers: InstrumentLayer[]
  transitions: TransitionPlan[]
  energy_curve_actual: string[]
  dynamics_plan: string
  arrangement_notes: string[]
  mixing_considerations: string[]
}

// --- Tool 3: Mixing Engineer AI ---
interface TrackInfo {
  name: string
  type?: string
  frequency_range?: string
  priority?: string
}

interface MixingInput {
  track_list?: TrackInfo[]
  genre_reference?: string
  target_loudness_lufs?: number
  mix_style?: string
  problem_areas?: string[]
}

interface TrackMixSetting {
  track_name: string
  volume_db: number
  pan: number
  eq_low_hz: number
  eq_mid_db: number
  eq_high_db: number
  compression_ratio: number
  compression_threshold_db: number
  reverb_send_pct: number
  delay_send_pct: number
  notes: string
}

interface MixingOutput {
  track_settings: TrackMixSetting[]
  bus_routing: string[]
  master_chain: string[]
  loudness_target: string
  mix_summary: string
  problem_solutions: string[]
  reference_tracks: string[]
}

// --- Tool 4: Mastering Chain Designer ---
interface SourceFormat {
  sample_rate?: number
  bit_depth?: number
  channels?: string
  peak_db?: number
  rms_db?: number
}

interface MasteringInput {
  source_format?: SourceFormat
  target_platforms?: string[]
  loudness_target_lufs?: number
  dynamic_range_target?: number
  genre?: string
}

interface MasteringStage {
  stage_name: string
  processor_type: string
  parameters: string
  purpose: string
  order_index: number
}

interface MasteringOutput {
  chain_stages: MasteringStage[]
  loudness_spec: string
  true_peak_limit_db: number
  stereo_enhancement: string
  format_recommendations: string[]
  delivery_notes: string[]
  quality_check_items: string[]
}

// --- Tool 5: Sample Generator Config ---
interface SoundCharacteristics {
  brightness?: string
  texture?: string
  complexity?: string
  modulation?: string
  harmonic_content?: string
}

interface SampleGeneratorInput {
  sound_type?: string
  model_preference?: string
  duration_sec?: number
  characteristics?: SoundCharacteristics
  output_format?: string
  usage_rights?: string
}

interface ModelRecommendation {
  model_name: string
  strengths: string
  best_for: string
  prompt_tips: string
}

interface GeneratorParameter {
  param_name: string
  value: string
  description: string
}

interface SampleGeneratorOutput {
  recommended_models: ModelRecommendation[]
  generation_parameters: GeneratorParameter[]
  prompt_template: string
  output_config: string
  usage_guidelines: string[]
  alternative_suggestions: string[]
}

// --- Tool 6: Music CopyClear Advisor ---
interface CopyClearInput {
  usage_type?: string
  territory?: string
  duration_sec?: number
  original_composition?: boolean
  similar_works?: string[]
  budget_usd?: number
}

interface LicenseRequirement {
  license_type: string
  rights_holder: string
  estimated_cost_usd: number
  timeline_days: number
  notes: string
  priority: string
}

interface CopyClearOutput {
  licensing_requirements: LicenseRequirement[]
  total_estimated_cost: number
  risk_assessment: string
  clearance_timeline: string
  alternative_strategies: string[]
  fair_use_analysis: string
  recommendations: string[]
}

// --- Tool 7: Playlist Curator AI ---
interface PlaylistInput {
  playlist_purpose?: string
  duration_minutes?: number
  genre_constraints?: string[]
  mood_target?: string
  flow_preference?: string
  track_count?: number
}

interface CuratedTrack {
  position: number
  title_description: string
  genre: string
  energy_level: number
  bpm_range: string
  transition_note: string
}

interface PlaylistOutput {
  curated_tracks: CuratedTrack[]
  total_duration_estimate: string
  mood_arc: string[]
  flow_analysis: string
  playlist_name: string
  optimization_tips: string[]
  platform_notes: string[]
}

// --- Tool 8: Music Business Analyzer ---
interface PlatformDistribution {
  spotify?: number
  apple_music?: number
  youtube_music?: number
  amazon_music?: number
  tidal?: number
  soundcloud?: number
  other?: number
}

interface RoyaltyStructure {
  artist_share_pct?: number
  label_share_pct?: number
  producer_share_pct?: number
  songwriter_share_pct?: number
  publisher_share_pct?: number
}

interface BusinessInput {
  project_type?: string
  platform_distribution?: PlatformDistribution
  expected_streams_month?: number
  production_budget?: number
  royalty_structure?: RoyaltyStructure
}

interface RevenueProjection {
  platform: string
  streams: number
  revenue_per_stream: number
  monthly_revenue: number
  annual_revenue: number
}

interface BusinessOutput {
  revenue_projections: RevenueProjection[]
  total_monthly_revenue: number
  total_annual_revenue: number
  marketing_roi_estimate: string
  royalty_breakdown: string[]
  break_even_timeline: string
  growth_recommendations: string[]
  risk_factors: string[]
}

// ==================== TOOL 1: COMPOSITION ASSISTANT ====================

function generateComposition(input: CompositionInput): CompositionOutput {
  const r = makeRng(input)
  const genre = (input.genre || 'pop').toLowerCase()
  const mood = (input.mood || 'happy').toLowerCase()
  const tempo = input.tempo_bpm || 120
  const key = input.key || 'C major'
  const duration = input.duration_sec || 210
  const structureType = (input.structure_type || 'standard').toLowerCase()
  const instrumentation = input.instrumentation || ['piano', 'bass', 'drums', 'synth']

  // Generate chord progressions
  const progressions: ChordProgression[] = []
  const commonProgressions: Record<string, string[][]> = {
    pop: [['I', 'V', 'vi', 'IV'], ['I', 'IV', 'V', 'I'], ['vi', 'IV', 'I', 'V']],
    jazz: [['ii', 'V', 'I', 'vi'], ['I', 'vi', 'ii', 'V'], ['iii', 'vi', 'ii', 'V']],
    rock: [['I', 'IV', 'V', 'IV'], ['I', 'V', 'IV', 'V'], ['i', 'VI', 'III', 'VII']],
    edm: [['vi', 'IV', 'I', 'V'], ['I', 'V', 'vi', 'iii'], ['i', 'VI', 'VII', 'i']],
    rnb: [['I', 'iii', 'IV', 'vi'], ['ii', 'V', 'I', 'IV'], ['I', 'V', 'vi', 'iii']],
    classical: [['I', 'IV', 'V', 'I'], ['I', 'vi', 'IV', 'V'], ['I', 'V', 'vi', 'IV']],
  }

  const sections = structureType === 'through-composed' ? ['Section A', 'Section B', 'Section C', 'Section D'] :
    structureType === 'aba' ? ['A Section', 'B Section', 'A Section (Return)'] :
    structureType === 'verse-chorus' ? ['Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus'] :
    ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro']

  const genreProg = commonProgressions[genre] || commonProgressions.pop

  for (let i = 0; i < Math.min(sections.length, 6); i++) {
    const prog = r.pick(genreProg)
    const chordNames = prog.map(numeral => {
      const roots: Record<string, string[]> = {
        'C major': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
        'G major': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
        'D major': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
        'A minor': ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
        'E minor': ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'],
      }
      const keyRoots = roots[key] || roots['C major']
      const numeralIndex = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].indexOf(numeral.replace(/[^IV]/g, ''))
      return keyRoots[numeralIndex >= 0 ? numeralIndex : 0]
    })

    progressions.push({
      section: sections[i],
      chords: chordNames,
      roman_numerals: prog,
      description: `Progression for ${sections[i]} in ${key} at ${tempo} BPM`
    })
  }

  // Melody ideas
  const melodyIdeas: MelodyIdea[] = []
  const contours = ['ascending', 'descending', 'arch-shaped', 'wave-like', 'stepwise', 'leap-focused']
  const rhythms = ['syncopated eighths', 'dotted quarter-eighth', 'sixteenth-note runs', 'whole/half notes', 'triplet feel', 'swing eighths']

  for (let i = 0; i < 3; i++) {
    const scaleDegrees = r.pickN(['1', '2', '3', '4', '5', '6', '7'], r.next(3, 6))
    melodyIdeas.push({
      contour: r.pick(contours),
      rhythm_pattern: r.pick(rhythms),
      scale_degrees: scaleDegrees,
      description: `${r.pick(contours)} melody using scale degrees ${scaleDegrees.join('-')} with ${r.pick(rhythms)} rhythm`
    })
  }

  // Bass line
  const bassPatterns = [
    `Root notes on beats 1 and 3, fifth on beat 2, octave on beat 4 — steady eighth-note pulse at ${tempo} BPM`,
    `Walking bass line: root-third-fifth-sixth movement, chromatic approach tones into chord changes`,
    `Syncopated bass: emphasize the "and" of beat 2 and beat 4, ghost notes for groove`,
    `Pedal tone foundation with occasional root-fifth-octave movement during transitions`,
  ]
  const bassLine = r.pick(bassPatterns)

  // Production tips based on genre/mood
  const productionTips: string[] = []
  if (genre === 'edm') {
    productionTips.push('Sidechain compression on synths to the kick drum for pumping effect')
    productionTips.push('Use risers and impacts before drops for energy build-up')
    productionTips.push('Layer 2-3 supersaw oscillators for thick pad sounds')
  } else if (genre === 'jazz') {
    productionTips.push('Leave space — jazz thrives on what you do not play')
    productionTips.push('Use swung eighth notes (65-75% swing ratio)')
    productionTips.push('Record live instruments when possible for authentic feel')
  } else if (genre === 'rock') {
    productionTips.push('Double-track guitars hard-panned left and right for width')
    productionTips.push('Use room mics on drums for natural ambience')
    productionTips.push('Keep bass guitar in mono and centered for low-end focus')
  } else if (genre === 'rnb') {
    productionTips.push('Smooth sub-bass layered below main bass for warmth')
    productionTips.push('Use vocal runs and melismas for emotional delivery')
    productionTips.push('Tight quantized drums with subtle swing (52-58%)')
  } else {
    productionTips.push('Ensure melody sits clearly above the chordal instruments in the mix')
    productionTips.push('Use dynamics — vary section intensity to maintain listener engagement')
    productionTips.push(`Target duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')} — plan section lengths accordingly`)
  }

  if (mood.includes('dark') || mood.includes('melancholy')) {
    productionTips.push('Lower register voicings and minor 9th intervals enhance dark atmosphere')
  }
  if (mood.includes('uplifting') || mood.includes('energetic')) {
    productionTips.push('Major key progressions with ascending melodic lines reinforce uplifting feel')
  }

  return {
    generated_progressions: progressions,
    melody_ideas: melodyIdeas,
    bass_line: bassLine,
    song_structure: sections,
    arrangement_notes: [
      `Key: ${key} | Tempo: ${tempo} BPM | Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      `Instrumentation: ${instrumentation.join(', ')}`,
      `Structure: ${structureType} with ${sections.length} sections`,
      `Genre: ${genre} | Mood: ${mood}`,
    ],
    production_tips: productionTips,
  }
}

function formatCompositionReport(input: CompositionInput, output: CompositionOutput): string {
  const lines: string[] = []
  lines.push('## AI Composition Assistant')
  lines.push('')
  lines.push(`**${input.genre || 'Pop'} in ${input.key || 'C major'}** — ${input.tempo_bpm || 120} BPM | ${input.mood || 'Happy'} mood | ${input.structure_type || 'Standard'} structure`)
  lines.push('')

  lines.push('### Song Structure')
  lines.push(output.song_structure.join(' -> '))
  lines.push('')

  lines.push('### Chord Progressions')
  lines.push('| Section | Chords | Roman Numerals |')
  lines.push('|---------|--------|----------------|')
  for (const prog of output.generated_progressions) {
    lines.push(`| ${prog.section} | ${prog.chords.join(' - ')} | ${prog.roman_numerals.join(' - ')} |`)
  }
  lines.push('')

  lines.push('### Melody Ideas')
  for (let i = 0; i < output.melody_ideas.length; i++) {
    const m = output.melody_ideas[i]
    lines.push(`${i + 1}. **${m.contour}** — Scale degrees: ${m.scale_degrees.join(', ')} | Rhythm: ${m.rhythm_pattern}`)
  }
  lines.push('')

  lines.push('### Bass Line')
  lines.push(output.bass_line)
  lines.push('')

  lines.push('### Production Tips')
  for (const tip of output.production_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: ARRANGEMENT OPTIMIZER ====================

function optimizeArrangement(input: ArrangementInput): ArrangementOutput {
  const r = makeRng(input)
  const sketch = input.composition_sketch || {}
  const genre = (input.target_genre || 'pop').toLowerCase()
  const energyCurve = (input.energy_curve || 'build-release').toLowerCase()
  const instruments = input.instrumentation || ['drums', 'bass', 'guitar', 'keys', 'synth', 'vocals']
  const style = (input.arrangement_style || 'modern').toLowerCase()

  // Instrument layers
  const layers: InstrumentLayer[] = []
  const sections = sketch.sections || ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro']

  for (const inst of instruments) {
    const activeSections: string[] = []
    const isRhythm = inst.toLowerCase().includes('drum') || inst.toLowerCase().includes('perc')
    const isBass = inst.toLowerCase().includes('bass') || inst.toLowerCase().includes('sub')
    const isLead = inst.toLowerCase().includes('vocal') || inst.toLowerCase().includes('lead') || inst.toLowerCase().includes('solo')

    for (const section of sections) {
      if (isRhythm || isBass) {
        activeSections.push(section)
      } else if (isLead) {
        if (section.toLowerCase().includes('verse') || section.toLowerCase().includes('chorus') || section.toLowerCase().includes('bridge')) {
          activeSections.push(section)
        }
      } else {
        if (r.chance(70)) activeSections.push(section)
      }
    }

    const dynamics = isRhythm ? 'Consistent, driving' :
      isBass ? 'Steady with subtle variation' :
      isLead ? 'Expressive, dynamic range' :
      r.pick(['Sparse to full', 'Building throughout', 'Accent hits only', 'Sustained pads', 'Rhythmic stabs'])

    const freqRange = isBass ? '20-250 Hz' :
      isRhythm ? '60 Hz - 10 kHz (full spectrum)' :
      inst.toLowerCase().includes('guitar') ? '80 Hz - 5 kHz' :
      inst.toLowerCase().includes('synth') ? '100 Hz - 12 kHz' :
      inst.toLowerCase().includes('vocal') ? '80 Hz - 12 kHz (fundamental + presence)' :
      '200 Hz - 8 kHz'

    layers.push({
      instrument: inst,
      sections_active: activeSections,
      dynamics,
      frequency_range: freqRange,
      arrangement_note: `${inst}: ${activeSections.length}/${sections.length} sections | ${dynamics} | ${freqRange}`,
    })
  }

  // Transitions
  const transitions: TransitionPlan[] = []
  for (let i = 0; i < sections.length - 1; i++) {
    const techniques = ['Fill/drum break', 'Filter sweep', 'Riser build', 'Drop-out', 'Key change', 'Tempo shift', 'Layer addition', 'Reverb wash']
    transitions.push({
      from_section: sections[i],
      to_section: sections[i + 1],
      technique: r.pick(techniques),
      duration_beats: r.next(1, 8),
      description: `Transition from ${sections[i]} to ${sections[i + 1]} using ${r.pick(techniques)} over ${r.next(1, 8)} beats`,
    })
  }

  // Energy curve
  const energyCurveActual: string[] = []
  for (const section of sections) {
    let energy: string
    if (section.toLowerCase().includes('intro') || section.toLowerCase().includes('outro')) {
      energy = 'Low (2-3/10)'
    } else if (section.toLowerCase().includes('verse')) {
      energy = 'Medium (4-5/10)'
    } else if (section.toLowerCase().includes('chorus')) {
      energy = 'High (8-9/10)'
    } else if (section.toLowerCase().includes('bridge')) {
      energy = r.pick(['Medium-High (6/10)', 'Low (3/10) for contrast', 'Building (5-8/10)'])
    } else {
      energy = 'Medium (5/10)'
    }
    energyCurveActual.push(`${section}: ${energy}`)
  }

  return {
    instrument_layers: layers,
    transitions,
    energy_curve_actual: energyCurveActual,
    dynamics_plan: `Energy curve: ${energyCurve} | Style: ${style} | Peak energy at chorus sections, valleys at intro/outro`,
    arrangement_notes: [
      `${instruments.length} instruments arranged across ${sections.length} sections`,
      `Arrangement style: ${style} — ${style === 'minimal' ? 'less is more, focus on space' : style === 'dense' ? 'full spectrum, layered approach' : 'balanced, modern production'}`,
      `Genre target: ${genre} — instrumentation choices reflect genre conventions`,
    ],
    mixing_considerations: [
      'Ensure frequency separation between instruments in same register',
      'Pan rhythm section elements for width while keeping bass centered',
      'Use automation to create movement in sustained parts',
      'Consider mono compatibility for low-frequency elements',
    ],
  }
}

function formatArrangementReport(input: ArrangementInput, output: ArrangementOutput): string {
  const lines: string[] = []
  lines.push('## Arrangement Optimizer')
  lines.push('')
  lines.push(`**${input.target_genre || 'Pop'}** — ${input.arrangement_style || 'Modern'} style | Energy: ${input.energy_curve || 'Build-release'}`)
  lines.push('')

  lines.push('### Instrument Layers')
  lines.push('| Instrument | Active Sections | Dynamics | Frequency Range |')
  lines.push('|------------|-----------------|----------|-----------------|')
  for (const layer of output.instrument_layers) {
    lines.push(`| ${layer.instrument} | ${layer.sections_active.length} sections | ${layer.dynamics} | ${layer.frequency_range} |`)
  }
  lines.push('')

  lines.push('### Energy Curve')
  for (const e of output.energy_curve_actual) {
    lines.push(`- ${e}`)
  }
  lines.push('')

  lines.push('### Transitions')
  lines.push('| From | To | Technique | Duration |')
  lines.push('|------|----|-----------|----------|')
  for (const t of output.transitions) {
    lines.push(`| ${t.from_section} | ${t.to_section} | ${t.technique} | ${t.duration_beats} beats |`)
  }
  lines.push('')

  lines.push('### Mixing Considerations')
  for (const mc of output.mixing_considerations) {
    lines.push(`- ${mc}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: MIXING ENGINEER AI ====================

function generateMixingRecommendations(input: MixingInput): MixingOutput {
  const r = makeRng(input)
  const tracks = input.track_list || [
    { name: 'Kick', type: 'drums', frequency_range: '60-120 Hz', priority: 'high' },
    { name: 'Snare', type: 'drums', frequency_range: '150-5 kHz', priority: 'high' },
    { name: 'Bass', type: 'bass', frequency_range: '40-250 Hz', priority: 'high' },
    { name: 'Guitar', type: 'instrument', frequency_range: '80-5 kHz', priority: 'medium' },
    { name: 'Keys', type: 'instrument', frequency_range: '100-8 kHz', priority: 'medium' },
    { name: 'Lead Vocal', type: 'vocal', frequency_range: '200-8 kHz', priority: 'high' },
  ]
  const targetLoudness = input.target_loudness_lufs || -14
  const mixStyle = (input.mix_style || 'balanced').toLowerCase()
  const problems = input.problem_areas || []

  const trackSettings: TrackMixSetting[] = []
  for (const track of tracks) {
    const isVocal = (track.type || '').toLowerCase().includes('vocal')
    const isBass = (track.type || '').toLowerCase().includes('bass') || (track.name || '').toLowerCase().includes('bass')
    const isKick = (track.name || '').toLowerCase().includes('kick')
    const isSnare = (track.name || '').toLowerCase().includes('snare')

    const volume = isVocal ? r.nextFloat(-6, -2) :
      isKick ? r.nextFloat(-8, -4) :
      isBass ? r.nextFloat(-10, -5) :
      isSnare ? r.nextFloat(-9, -5) :
      r.nextFloat(-14, -6)

    const pan = isBass || isKick || isVocal ? 0 :
      r.next(-30, 30)

    trackSettings.push({
      track_name: track.name,
      volume_db: Math.round(volume * 10) / 10,
      pan,
      eq_low_hz: isVocal ? 80 : isBass ? 40 : r.next(60, 120),
      eq_mid_db: Math.round(r.nextFloat(-3, 3) * 10) / 10,
      eq_high_db: Math.round(r.nextFloat(-2, 4) * 10) / 10,
      compression_ratio: isVocal ? r.next(3, 6) : isBass ? r.next(4, 8) : r.next(2, 4),
      compression_threshold_db: Math.round(r.nextFloat(-20, -8)),
      reverb_send_pct: isVocal ? r.next(15, 35) : isKick ? r.next(0, 5) : r.next(5, 25),
      delay_send_pct: isVocal ? r.next(5, 20) : r.next(0, 10),
      notes: `${isVocal ? 'Lead element — keep forward in mix' : isBass ? 'Low-end foundation — mono, controlled' : isKick ? 'Anchor — punch and clarity' : 'Support element — blend with arrangement'}`,
    })
  }

  const problemSolutions: string[] = []
  for (const problem of problems) {
    const p = problem.toLowerCase()
    if (p.includes('muddy')) problemSolutions.push('MUD: High-pass non-bass tracks at 80-150 Hz. Cut 200-400 Hz on competing elements.')
    else if (p.includes('harsh')) problemSolutions.push('HARSH: Reduce 2-5 kHz on offending tracks. Use de-esser on vocals at 6-8 kHz.')
    else if (p.includes('thin')) problemSolutions.push('THIN: Add subtle saturation/harmonics. Boost 60-100 Hz on bass elements.')
    else if (p.includes('dull')) problemSolutions.push('DULL: Add air at 10-16 kHz shelf boost. Check for phase cancellation.')
    else if (p.includes('loud') || p.includes('dynamic')) problemSolutions.push('DYNAMICS: Apply parallel compression. Use clipper on transients. Automate levels.')
    else problemSolutions.push(`Address "${problem}": Analyze frequency content and adjust EQ/compression accordingly.`)
  }

  return {
    track_settings: trackSettings,
    bus_routing: [
      'Drums -> Drum Bus (parallel compression)',
      'Bass -> Bass Bus (sidechain to kick)',
      'Instruments -> Music Bus (gentle glue compression)',
      'Vocals -> Vocal Bus (de-esser -> EQ -> compression)',
      'All -> Mix Bus (subtle glue, 1-2 dB gain reduction)',
    ],
    master_chain: [
      '1. Subtractive EQ (remove unwanted frequencies)',
      '2. Bus compression (2:1 ratio, slow attack, auto release)',
      '3. Stereo enhancement (above 2 kHz only)',
      '4. Limiter (ceiling at -1.0 dBFS, target LUFS)',
    ],
    loudness_target: `${targetLoudness} LUFS integrated | True peak: -1.0 dBFS`,
    mix_summary: `${tracks.length} tracks mixed in "${mixStyle}" style targeting ${targetLoudness} LUFS. ${problems.length} problem areas addressed.`,
    problem_solutions: problemSolutions,
    reference_tracks: [
      'Reference A: Genre-matched commercial release at similar tempo',
      'Reference B: Track with desired tonal balance',
      'Reference C: Track with target dynamic range',
    ],
  }
}

function formatMixingReport(input: MixingInput, output: MixingOutput): string {
  const lines: string[] = []
  lines.push('## AI Mixing Engineer')
  lines.push('')
  lines.push(`**${input.mix_style || 'Balanced'} mix** — Target: ${input.target_loudness_lufs || -14} LUFS | ${output.track_settings.length} tracks`)
  lines.push('')

  lines.push('### Track Settings')
  lines.push('| Track | Vol (dB) | Pan | EQ Low | EQ Mid | EQ High | Comp Ratio | Comp Thresh | Reverb % | Delay % |')
  lines.push('|-------|----------|-----|--------|--------|---------|------------|-------------|----------|---------|')
  for (const t of output.track_settings) {
    const panStr = t.pan === 0 ? 'C' : `${t.pan > 0 ? 'R' : 'L'}${Math.abs(t.pan)}`
    lines.push(`| ${t.track_name} | ${t.volume_db} | ${panStr} | ${t.eq_low_hz} Hz | ${t.eq_mid_db} dB | ${t.eq_high_db} dB | ${t.compression_ratio}:1 | ${t.compression_threshold_db} dB | ${t.reverb_send_pct} | ${t.delay_send_pct} |`)
  }
  lines.push('')

  lines.push('### Bus Routing')
  for (const bus of output.bus_routing) {
    lines.push(`- ${bus}`)
  }
  lines.push('')

  lines.push('### Master Chain')
  for (const stage of output.master_chain) {
    lines.push(`- ${stage}`)
  }
  lines.push('')

  if (output.problem_solutions.length > 0) {
    lines.push('### Problem Area Solutions')
    for (const sol of output.problem_solutions) {
      lines.push(`- ${sol}`)
    }
    lines.push('')
  }

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: MASTERING CHAIN DESIGNER ====================

function designMasteringChain(input: MasteringInput): MasteringOutput {
  const r = makeRng(input)
  const source = input.source_format || {}
  const platforms = input.target_platforms || ['spotify', 'apple_music', 'youtube']
  const loudnessTarget = input.loudness_target_lufs || -14
  const dynamicRangeTarget = input.dynamic_range_target || 8
  const genre = (input.genre || 'pop').toLowerCase()

  const stages: MasteringStage[] = []

  // Stage 1: Corrective EQ
  stages.push({
    stage_name: 'Corrective EQ',
    processor_type: 'Linear Phase EQ',
    parameters: `HPF at 20 Hz, notch resonances at ${r.next(200, 800)} Hz, shelf at ${r.next(10, 16)} kHz`,
    purpose: 'Remove unwanted resonances and rumble, prepare tonal foundation',
    order_index: 1,
  })

  // Stage 2: Tonal Shaping
  stages.push({
    stage_name: 'Tonal Shaping',
    processor_type: 'Analog-modeled EQ',
    parameters: `Low shelf: ${r.nextFloat(-2, 2).toFixed(1)} dB at 100 Hz | Mid: ${r.nextFloat(-1.5, 1.5).toFixed(1)} dB at 1 kHz | High shelf: ${r.nextFloat(-1, 2).toFixed(1)} dB at 10 kHz`,
    purpose: 'Shape overall tonal balance for genre and target platforms',
    order_index: 2,
  })

  // Stage 3: Dynamics Control
  stages.push({
    stage_name: 'Dynamics Control',
    processor_type: 'Multi-band Compressor',
    parameters: `Low band (20-200 Hz): ${r.next(2, 4)}:1 at ${r.next(-30, -20)} dB | Mid band (200-2k): ${r.next(2, 3)}:1 at ${r.next(-25, -15)} dB | High band (2k-20k): ${r.next(2, 4)}:1 at ${r.next(-20, -12)} dB`,
    purpose: `Control dynamic range to target ${dynamicRangeTarget} dB without squashing transients`,
    order_index: 3,
  })

  // Stage 4: Stereo Enhancement
  stages.push({
    stage_name: 'Stereo Enhancement',
    processor_type: 'Mid-Side Processor',
    parameters: `Side boost above 2 kHz: +${r.nextFloat(1, 3).toFixed(1)} dB | Mono below 120 Hz | Stereo width: ${r.next(110, 140)}%`,
    purpose: 'Widen stereo image while maintaining mono compatibility in low end',
    order_index: 4,
  })

  // Stage 5: Harmonic Enhancement
  if (r.chance(60)) {
    stages.push({
      stage_name: 'Harmonic Enhancement',
      processor_type: 'Saturation/Exciter',
      parameters: `Even harmonics at ${r.nextFloat(1, 3).toFixed(1)}% mix | Frequency focus: ${r.next(2, 8)} kHz | Tape saturation emulation`,
      purpose: 'Add warmth and presence, improve perceived loudness without clipping',
      order_index: 5,
    })
  }

  // Stage 6: Limiting
  stages.push({
    stage_name: 'Final Limiting',
    processor_type: 'True Peak Limiter',
    parameters: `Ceiling: -1.0 dBFS | Target: ${loudnessTarget} LUFS | Release: auto (${r.next(50, 150)} ms) | ISP protection: enabled`,
    purpose: `Achieve target loudness of ${loudnessTarget} LUFS while preventing inter-sample peaks`,
    order_index: stages.length + 1,
  })

  const formatRecs: string[] = []
  for (const platform of platforms) {
    const p = platform.toLowerCase()
    if (p.includes('spotify')) formatRecs.push('Spotify: -14 LUFS, 44.1kHz/16-bit WAV, -1 dBTP')
    else if (p.includes('apple')) formatRecs.push('Apple Music: -16 LUFS (Apple Digital Masters), 44.1kHz/24-bit WAV')
    else if (p.includes('youtube')) formatRecs.push('YouTube: -14 LUFS, 48kHz/16-bit WAV, -1 dBTP')
    else if (p.includes('tidal')) formatRecs.push('Tidal: -14 LUFS (HiFi), up to 96kHz/24-bit for Master')
    else if (p.includes('soundcloud')) formatRecs.push('SoundCloud: -14 LUFS, 44.1kHz/16-bit WAV')
    else if (p.includes('cd')) formatRecs.push('CD: -9 to -11 LUFS (Red Book), 44.1kHz/16-bit WAV')
    else if (p.includes('vinyl')) formatRecs.push('Vinyl: -12 to -15 LUFS, mono bass, de-essed, 44.1kHz/24-bit')
    else formatRecs.push(`${platform}: -14 LUFS standard, 44.1kHz/16-bit WAV minimum`)
  }

  return {
    chain_stages: stages,
    loudness_spec: `${loudnessTarget} LUFS integrated | Dynamic range: ${dynamicRangeTarget} dB | True peak: -1.0 dBFS`,
    true_peak_limit_db: -1.0,
    stereo_enhancement: `Mid-Side processing: widen above 2 kHz, mono below 120 Hz, width ${r.next(110, 140)}%`,
    format_recommendations: formatRecs,
    delivery_notes: [
      `Source: ${source.sample_rate || 44100} Hz / ${source.bit_depth || 24}-bit / ${source.channels || 'stereo'}`,
      `Peak level: ${source.peak_db || -3} dBFS | RMS: ${source.rms_db || -18} dBFS`,
      `Target platforms: ${platforms.join(', ')}`,
      `Genre considerations: ${genre} — ${genre === 'classical' ? 'preserve wide dynamic range' : genre === 'edm' ? 'maximize loudness and punch' : 'balanced loudness with dynamics'}`,
    ],
    quality_check_items: [
      'Check mono compatibility (phase correlation > 0)',
      'Verify no inter-sample peaks exceed -1.0 dBTP',
      'Listen at multiple volume levels for balance consistency',
      'A/B compare with reference track at matched loudness',
      'Check for distortion on headphones, monitors, and earbuds',
    ],
  }
}

function formatMasteringReport(input: MasteringInput, output: MasteringOutput): string {
  const lines: string[] = []
  lines.push('## Mastering Chain Designer')
  lines.push('')
  lines.push(`**${input.genre || 'Pop'}** — Target: ${input.loudness_target_lufs || -14} LUFS | Dynamic range: ${input.dynamic_range_target || 8} dB`)
  lines.push('')

  lines.push('### Mastering Chain')
  lines.push('| # | Stage | Processor | Parameters | Purpose |')
  lines.push('|---|-------|-----------|------------|---------|')
  for (const stage of output.chain_stages) {
    lines.push(`| ${stage.order_index} | ${stage.stage_name} | ${stage.processor_type} | ${stage.parameters} | ${stage.purpose} |`)
  }
  lines.push('')

  lines.push('### Loudness Specification')
  lines.push(output.loudness_spec)
  lines.push('')

  lines.push('### Stereo Enhancement')
  lines.push(output.stereo_enhancement)
  lines.push('')

  lines.push('### Format Recommendations')
  for (const rec of output.format_recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')

  lines.push('### Quality Check Items')
  for (const qc of output.quality_check_items) {
    lines.push(`- ${qc}`)
  }
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: SAMPLE GENERATOR CONFIG ====================

function configureSampleGenerator(input: SampleGeneratorInput): SampleGeneratorOutput {
  const r = makeRng(input)
  const soundType = (input.sound_type || 'ambient pad').toLowerCase()
  const modelPref = (input.model_preference || 'any').toLowerCase()
  const duration = input.duration_sec || 10
  const chars = input.characteristics || {}
  const outputFormat = (input.output_format || 'wav').toLowerCase()
  const usageRights = (input.usage_rights || 'royalty-free').toLowerCase()

  // Model recommendations
  const allModels: ModelRecommendation[] = [
    { model_name: 'Suno AI', strengths: 'Full song generation with vocals and instruments', best_for: 'Complete musical compositions, songs with lyrics', prompt_tips: 'Use genre tags, mood descriptors, and BPM specifications' },
    { model_name: 'Udio', strengths: 'High-fidelity audio, genre versatility', best_for: 'Professional-quality tracks across genres', prompt_tips: 'Detailed style references and structural cues work best' },
    { model_name: 'Stable Audio', strengths: 'Short-form samples, loops, sound effects', best_for: 'Samples, loops, SFX, and short musical phrases', prompt_tips: 'Specify duration, instrumentation, and mood precisely' },
    { model_name: 'ElevenLabs Music', strengths: 'Vocal-centric generation', best_for: 'Vocal melodies, harmonies, and vocal arrangements', prompt_tips: 'Describe vocal style, range, and emotional quality' },
    { model_name: 'Google MusicLM', strengths: 'Text-to-music with high coherence', best_for: 'Instrumental pieces from text descriptions', prompt_tips: 'Use detailed musical terminology and references' },
    { model_name: 'AIVA', strengths: 'Classical and cinematic composition', best_for: 'Orchestral, cinematic, and classical-style music', prompt_tips: 'Reference classical forms and orchestral arrangements' },
  ]

  const recommendedModels = modelPref === 'any' ? r.pickN(allModels, 3) :
    allModels.filter(m => m.model_name.toLowerCase().includes(modelPref)).length > 0
      ? allModels.filter(m => m.model_name.toLowerCase().includes(modelPref))
      : r.pickN(allModels, 2)

  // Generation parameters
  const params: GeneratorParameter[] = [
    { param_name: 'duration_sec', value: `${duration}`, description: `Output length: ${duration} seconds` },
    { param_name: 'sample_rate', value: '44100 Hz', description: 'CD-quality sample rate for professional use' },
    { param_name: 'bit_depth', value: '24-bit', description: 'High-resolution audio for post-processing headroom' },
    { param_name: 'channels', value: 'stereo', description: 'Stereo output for spatial width' },
    { param_name: 'temperature', value: `${r.nextFloat(0.7, 1.2).toFixed(2)}`, description: 'Creativity vs adherence balance (higher = more creative)' },
    { param_name: 'top_p', value: `${r.nextFloat(0.85, 0.98).toFixed(2)}`, description: 'Nucleus sampling parameter for output diversity' },
    { param_name: 'guidance_scale', value: `${r.nextFloat(3.0, 7.0).toFixed(1)}`, description: 'How closely to follow the prompt (higher = more literal)' },
  ]

  if (chars.brightness) params.push({ param_name: 'brightness', value: chars.brightness, description: 'Tonal brightness character' })
    if (chars.texture) params.push({ param_name: 'texture', value: chars.texture, description: 'Surface texture quality' })
  if (chars.complexity) params.push({ param_name: 'complexity', value: chars.complexity, description: 'Structural complexity level' })
  if (chars.modulation) params.push({ param_name: 'modulation', value: chars.modulation, description: 'Movement and modulation characteristics' })
  if (chars.harmonic_content) params.push({ param_name: 'harmonic_content', value: chars.harmonic_content, description: 'Harmonic richness specification' })

  // Prompt template
  const promptTemplate = `[${soundType}] | ${chars.brightness || 'balanced'} brightness | ${chars.texture || 'smooth'} texture | ${chars.complexity || 'moderate'} complexity | ${duration}s | ${usageRights} usage`

  return {
    recommended_models: recommendedModels,
    generation_parameters: params,
    prompt_template: promptTemplate,
    output_config: `${outputFormat.toUpperCase()} | 44100 Hz | 24-bit | stereo | ${duration}s`,
    usage_guidelines: [
      `Usage rights: ${usageRights} — ${usageRights.includes('royalty') ? 'No ongoing royalty payments required' : 'Verify specific license terms before commercial use'}`,
      'Credit the AI model used in liner notes when required by license',
      'Check platform-specific rules for AI-generated content (some platforms require disclosure)',
      'For commercial release, consider human modification to strengthen copyright claim',
      'Keep generation logs and metadata for licensing documentation',
    ],
    alternative_suggestions: [
      `Try generating at ${Math.round(duration * 0.75)}s and ${Math.round(duration * 1.25)}s for variation`,
      'Generate 3-5 variations and composite the best sections',
      'Layer multiple generated samples for richer textures',
      'Post-process with reverb, EQ, and saturation for unique character',
    ],
  }
}

function formatSampleGeneratorReport(input: SampleGeneratorInput, output: SampleGeneratorOutput): string {
  const lines: string[] = []
  lines.push('## AI Sample Generator Configuration')
  lines.push('')
  lines.push(`**${input.sound_type || 'Ambient Pad'}** — ${input.duration_sec || 10}s | ${input.output_format || 'WAV'} | ${input.usage_rights || 'Royalty-free'}`)
  lines.push('')

  lines.push('### Recommended Models')
  for (const model of output.recommended_models) {
    lines.push(`**${model.model_name}**`)
    lines.push(`- Strengths: ${model.strengths}`)
    lines.push(`- Best for: ${model.best_for}`)
    lines.push(`- Prompt tips: ${model.prompt_tips}`)
    lines.push('')
  }

  lines.push('### Generation Parameters')
  lines.push('| Parameter | Value | Description |')
  lines.push('|-----------|-------|-------------|')
  for (const param of output.generation_parameters) {
    lines.push(`| ${param.param_name} | ${param.value} | ${param.description} |`)
  }
  lines.push('')

  lines.push('### Prompt Template')
  lines.push(`\`${output.prompt_template}\``)
  lines.push('')

  lines.push('### Output Configuration')
  lines.push(output.output_config)
  lines.push('')

  lines.push('### Usage Guidelines')
  for (const guide of output.usage_guidelines) {
    lines.push(`- ${guide}`)
  }
  lines.push('')

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: MUSIC COPYCLEAR ADVISOR ====================

function adviseCopyClear(input: CopyClearInput): CopyClearOutput {
  const r = makeRng(input)
  const usageType = (input.usage_type || 'commercial_release').toLowerCase()
  const territory = (input.territory || 'worldwide').toLowerCase()
  const duration = input.duration_sec || 180
  const isOriginal = input.original_composition !== false
  const similarWorks = input.similar_works || []
  const budget = input.budget_usd || 5000

  const requirements: LicenseRequirement[] = []

  if (isOriginal) {
    requirements.push({
      license_type: 'Composition Copyright Registration',
      rights_holder: 'Composer/ songwriter',
      estimated_cost_usd: territory.includes('us') ? 85 : r.next(50, 200),
      timeline_days: r.next(3, 90),
      notes: 'Register with copyright office for legal protection. Required before infringement claims.',
      priority: 'high',
    })
    requirements.push({
      license_type: 'Performance Rights Organization (PRO) Registration',
      rights_holder: 'Songwriter/ publisher',
      estimated_cost_usd: 0,
      timeline_days: r.next(1, 30),
      notes: 'Register with ASCAP/BMI/SESAC (US) or equivalent for performance royalty collection.',
      priority: 'high',
    })
  } else {
    requirements.push({
      license_type: 'Master Use License',
      rights_holder: 'Original recording owner (label/artist)',
      estimated_cost_usd: Math.round(duration * r.nextFloat(5, 50)),
      timeline_days: r.next(14, 90),
      notes: 'Required to use the original sound recording. Negotiated directly with rights holder.',
      priority: 'critical',
    })
    requirements.push({
      license_type: 'Synchronization License',
      rights_holder: 'Publisher/ songwriter',
      estimated_cost_usd: Math.round(duration * r.nextFloat(10, 100)),
      timeline_days: r.next(14, 120),
      notes: 'Required when pairing music with visual media (video, film, ads).',
      priority: 'critical',
    })
  }

  if (usageType.includes('cover') || usageType.includes('derivative')) {
    requirements.push({
      license_type: 'Mechanical License',
      rights_holder: 'Original composition publisher',
      estimated_cost_usd: Math.round(duration * r.nextFloat(0.5, 5)),
      timeline_days: r.next(7, 45),
      notes: 'Required for cover songs and derivative works. Statutory rate applies in US (12 cents per copy).',
      priority: 'critical',
    })
  }

  if (usageType.includes('sample') || usageType.includes('interpolation')) {
    requirements.push({
      license_type: 'Sample Clearance',
      rights_holder: 'Original rights holders (master + composition)',
      estimated_cost_usd: r.next(1000, 50000),
      timeline_days: r.next(30, 180),
      notes: 'Most expensive clearance. Requires both master and composition rights. Costs vary wildly by popularity.',
      priority: 'critical',
    })
  }

  if (territory.includes('international') || territory.includes('worldwide')) {
    requirements.push({
      license_type: 'International Territory Rights',
      rights_holder: 'Multiple territorial rights holders',
      estimated_cost_usd: r.next(500, 5000),
      timeline_days: r.next(30, 90),
      notes: 'Worldwide rights require clearance in each territory or blanket license from local CMOs.',
      priority: 'medium',
    })
  }

  const totalCost = requirements.reduce((sum, req) => sum + req.estimated_cost_usd, 0)
  const maxTimeline = Math.max(...requirements.map(r => r.timeline_days))

  const riskLevel = similarWorks.length > 3 ? 'HIGH' : similarWorks.length > 1 ? 'MEDIUM' : 'LOW'
  const riskDetail = similarWorks.length > 3
    ? `HIGH RISK: ${similarWorks.length} similar works identified. Significant clearance complexity and potential for infringement claims.`
    : similarWorks.length > 1
    ? `MEDIUM RISK: ${similarWorks.length} similar works noted. Standard clearance procedures should suffice.`
    : 'LOW RISK: No significant similar works detected. Standard licensing should be straightforward.'

  return {
    licensing_requirements: requirements,
    total_estimated_cost: totalCost,
    risk_assessment: riskDetail,
    clearance_timeline: `${maxTimeline} days maximum (longest license). Start clearance process immediately.`,
    alternative_strategies: [
      'Consider original composition to avoid clearance costs entirely',
      'Use royalty-free sample libraries for similar sounds',
      'Commission original recordings that capture the desired feel',
      'Explore Creative Commons licensed works (verify specific CC terms)',
      'For covers, use services like Easy Song Licensing or DistroKid mechanical licensing',
    ],
    fair_use_analysis: usageType.includes('commentary') || usageType.includes('education') || usageType.includes('parody')
      ? 'Fair use MAY apply — but fair use is a legal defense, not a right. Consult an attorney before relying on fair use.'
      : 'Fair use unlikely to apply for commercial music releases. Do not rely on fair use without legal counsel.',
    recommendations: [
      `Budget: $${budget.toLocaleString()} available vs $${totalCost.toLocaleString()} estimated — ${budget >= totalCost ? 'sufficient' : 'INSUFFICIENT — increase budget or reduce scope'}`,
      `Start clearance process at least ${maxTimeline} days before release date`,
      'Document all license agreements in writing — verbal agreements are unenforceable',
      'Consider errors & omissions (E&O) insurance for distribution',
      'Register with a PRO to collect performance royalties on your composition',
    ],
  }
}

function formatCopyClearReport(input: CopyClearInput, output: CopyClearOutput): string {
  const lines: string[] = []
  lines.push('## Music Copyright & Clearance Advisor')
  lines.push('')
  lines.push(`**${input.usage_type || 'Commercial Release'}** — ${input.territory || 'Worldwide'} | ${input.duration_sec || 180}s | Budget: $${(input.budget_usd || 5000).toLocaleString()}`)
  lines.push('')

  lines.push('### Risk Assessment')
  lines.push(output.risk_assessment)
  lines.push('')

  lines.push('### Licensing Requirements')
  lines.push('| License Type | Rights Holder | Cost (USD) | Timeline | Priority |')
  lines.push('|-------------|---------------|------------|----------|----------|')
  for (const req of output.licensing_requirements) {
    lines.push(`| ${req.license_type} | ${req.rights_holder} | $${req.estimated_cost_usd.toLocaleString()} | ${req.timeline_days} days | ${req.priority.toUpperCase()} |`)
  }
  lines.push('')
  lines.push(`**Total Estimated Cost: $${output.total_estimated_cost.toLocaleString()}**`)
  lines.push('')

  lines.push('### Clearance Timeline')
  lines.push(output.clearance_timeline)
  lines.push('')

  lines.push('### Fair Use Analysis')
  lines.push(output.fair_use_analysis)
  lines.push('')

  lines.push('### Alternative Strategies')
  for (const alt of output.alternative_strategies) {
    lines.push(`- ${alt}`)
  }
  lines.push('')

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: PLAYLIST CURATOR AI ====================

function curatePlaylist(input: PlaylistInput): PlaylistOutput {
  const r = makeRng(input)
  const purpose = (input.playlist_purpose || 'focus work').toLowerCase()
  const durationMin = input.duration_minutes || 60
  const genres = input.genre_constraints || ['electronic', 'ambient']
  const mood = (input.mood_target || 'calm focused').toLowerCase()
  const flow = (input.flow_preference || 'smooth').toLowerCase()
  const trackCount = input.track_count || r.next(12, 25)

  const tracks: CuratedTrack[] = []
  const avgTrackDuration = durationMin / trackCount

  const energyLevels: number[] = []
  if (flow === 'smooth') {
    for (let i = 0; i < trackCount; i++) {
      const progress = i / trackCount
      energyLevels.push(clamp(Math.round(3 + Math.sin(progress * Math.PI) * 3 + r.nextFloat(-1, 1)), 1, 10))
    }
  } else if (flow === 'dynamic') {
    for (let i = 0; i < trackCount; i++) {
      energyLevels.push(r.next(2, 9))
    }
  } else if (flow === 'ascending') {
    for (let i = 0; i < trackCount; i++) {
      energyLevels.push(clamp(Math.round(2 + (i / trackCount) * 7), 1, 10))
    }
  } else if (flow === 'descending') {
    for (let i = 0; i < trackCount; i++) {
      energyLevels.push(clamp(Math.round(9 - (i / trackCount) * 7), 1, 10))
    }
  } else {
    for (let i = 0; i < trackCount; i++) {
      energyLevels.push(r.next(3, 7))
    }
  }

  const titlePrefixes = ['Midnight', 'Crystal', 'Velvet', 'Electric', 'Golden', 'Silver', 'Cosmic', 'Urban', 'Neon', 'Silent', 'Deep', 'Bright', 'Warm', 'Cool', 'Liquid']
  const titleSuffixes = ['Dreams', 'Waves', 'Horizons', 'Pulses', 'Echoes', 'Visions', 'Rhythms', 'Lights', 'Shadows', 'Moments', 'Journeys', 'Spaces', 'Flows', 'Drifts', 'Beats']

  for (let i = 0; i < trackCount; i++) {
    const energy = energyLevels[i]
    const bpmBase = purpose.includes('workout') ? 130 : purpose.includes('sleep') ? 60 : purpose.includes('focus') ? 90 : 110
    const bpm = bpmBase + r.next(-15, 15)

    tracks.push({
      position: i + 1,
      title_description: `${r.pick(titlePrefixes)} ${r.pick(titleSuffixes)}`,
      genre: r.pick(genres),
      energy_level: energy,
      bpm_range: `${bpm - 5}-${bpm + 5}`,
      transition_note: i < trackCount - 1
        ? `Energy ${energy} -> ${energyLevels[i + 1]} (${energyLevels[i + 1] > energy ? 'rising' : energyLevels[i + 1] < energy ? 'falling' : 'stable'})`
        : 'Final track — closing energy',
    })
  }

  const moodArc: string[] = []
  const segments = 5
  const segmentSize = Math.ceil(trackCount / segments)
  for (let s = 0; s < segments; s++) {
    const start = s * segmentSize
    const end = Math.min(start + segmentSize, trackCount)
    const avgEnergy = energyLevels.slice(start, end).reduce((a, b) => a + b, 0) / (end - start)
    moodArc.push(`Segment ${s + 1} (tracks ${start + 1}-${end}): Energy ${avgEnergy.toFixed(1)}/10`)
  }

  const playlistNames: Record<string, string[]> = {
    focus: ['Deep Focus Flow', 'Concentration Station', 'Mindful Productivity', 'Flow State Essentials'],
    workout: ['Power Pulse', 'Energy Surge', 'Peak Performance', 'Adrenaline Engine'],
    sleep: ['Dream Drift', 'Midnight Lullaby', 'Sleep Sanctuary', 'Nocturnal Calm'],
    party: ['Vibe Catalyst', 'Dance Dynamo', 'Party Pulse', 'Energy Explosion'],
    chill: ['Chill Circuit', 'Easy Flow', 'Laid Back Lounge', 'Mellow Motion'],
    study: ['Study Stream', 'Brain Food', 'Academic Ambience', 'Scholarly Sounds'],
  }

  const nameOptions = playlistNames[purpose.split(' ')[0]] || ['Curated Collection', 'AI Playlist', 'Custom Mix', 'Personal Selection']
  const playlistName = r.pick(nameOptions)

  return {
    curated_tracks: tracks,
    total_duration_estimate: `${durationMin} minutes (${trackCount} tracks, avg ${avgTrackDuration.toFixed(1)} min/track)`,
    mood_arc: moodArc,
    flow_analysis: `Flow style: ${flow} | Energy range: ${Math.min(...energyLevels)}-${Math.max(...energyLevels)}/10 | Genre mix: ${genres.join(', ')}`,
    playlist_name: playlistName,
    optimization_tips: [
      `Purpose: "${purpose}" — ${trackCount} tracks selected for ${durationMin}-minute session`,
      `Flow: ${flow} — ${flow === 'smooth' ? 'gradual energy changes for seamless listening' : flow === 'dynamic' ? 'varied energy for engagement' : 'structured energy progression'}`,
      'Crossfade: 3-5 seconds for smooth flow, 0-1 second for dynamic',
      'Place highest energy tracks at 60-75% through for peak engagement',
      'Include 1-2 "wildcard" tracks to maintain listener interest',
    ],
    platform_notes: [
      'Spotify: Use playlist pitching tool 7+ days before release',
      'Apple Music: Submit for editorial consideration with mood/activity tags',
      'YouTube Music: Create companion video playlist for algorithmic boost',
      'SoundCloud: Use timed comments to highlight key moments',
    ],
  }
}

function formatPlaylistReport(input: PlaylistInput, output: PlaylistOutput): string {
  const lines: string[] = []
  lines.push('## AI Playlist Curator')
  lines.push('')
  lines.push(`**${output.playlist_name}** — ${input.playlist_purpose || 'Focus Work'} | ${output.total_duration_estimate}`)
  lines.push('')

  lines.push('### Mood Arc')
  for (const arc of output.mood_arc) {
    lines.push(`- ${arc}`)
  }
  lines.push('')

  lines.push('### Track Listing')
  lines.push('| # | Title | Genre | Energy | BPM | Transition |')
  lines.push('|---|-------|-------|--------|-----|------------|')
  for (const track of output.curated_tracks) {
    lines.push(`| ${track.position} | ${track.title_description} | ${track.genre} | ${track.energy_level}/10 | ${track.bpm_range} | ${track.transition_note} |`)
  }
  lines.push('')

  lines.push('### Flow Analysis')
  lines.push(output.flow_analysis)
  lines.push('')

  lines.push('### Optimization Tips')
  for (const tip of output.optimization_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: MUSIC BUSINESS ANALYZER ====================

function analyzeMusicBusiness(input: BusinessInput): BusinessOutput {
  const r = makeRng(input)
  const projectType = (input.project_type || 'single_release').toLowerCase()
  const platforms = input.platform_distribution || { spotify: 40, apple_music: 25, youtube_music: 15, amazon_music: 10, tidal: 5, other: 5 }
  const expectedStreams = input.expected_streams_month || 50000
  const budget = input.production_budget || 10000
  const royalty = input.royalty_structure || {}

  const artistShare = royalty.artist_share_pct || 50
  const labelShare = royalty.label_share_pct || 30
  const producerShare = royalty.producer_share_pct || 10
  const songwriterShare = royalty.songwriter_share_pct || 5
  const publisherShare = royalty.publisher_share_pct || 5

  // Revenue per stream by platform (2026 estimates)
  const rpm: Record<string, number> = {
    spotify: 0.0033,
    apple_music: 0.0075,
    youtube_music: 0.0022,
    amazon_music: 0.0045,
    tidal: 0.012,
    soundcloud: 0.0015,
    other: 0.002,
  }

  const projections: RevenueProjection[] = []
  const platformKeys = Object.keys(platforms) as (keyof PlatformDistribution)[]

  for (const platform of platformKeys) {
    const pct = (platforms[platform] || 0) / 100
    const streams = Math.round(expectedStreams * pct)
    const rps = rpm[platform] || 0.003
    const monthly = Math.round(streams * rps)
    const annual = monthly * 12

    projections.push({
      platform: platform.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      streams,
      revenue_per_stream: rps,
      monthly_revenue: monthly,
      annual_revenue: annual,
    })
  }

  const totalMonthly = projections.reduce((s, p) => s + p.monthly_revenue, 0)
  const totalAnnual = totalMonthly * 12

  // Marketing ROI
  const marketingBudget = budget * r.nextFloat(0.2, 0.5)
  const estimatedNewStreams = Math.round(marketingBudget * r.nextFloat(50, 200))
  const marketingROI = `Marketing budget: $${Math.round(marketingBudget).toLocaleString()} | Est. new streams: ${estimatedNewStreams.toLocaleString()}/mo | ROI: ${estimatedNewStreams > 0 ? Math.round((estimatedNewStreams * 0.003 / marketingBudget) * 100) : 0}% (streaming revenue vs spend)`

  // Royalty breakdown
  const royaltyBreakdown: string[] = [
    `Artist share (${artistShare}%): $${Math.round(totalMonthly * artistShare / 100).toLocaleString()}/mo`,
    `Label share (${labelShare}%): $${Math.round(totalMonthly * labelShare / 100).toLocaleString()}/mo`,
    `Producer share (${producerShare}%): $${Math.round(totalMonthly * producerShare / 100).toLocaleString()}/mo`,
    `Songwriter share (${songwriterShare}%): $${Math.round(totalMonthly * songwriterShare / 100).toLocaleString()}/mo`,
    `Publisher share (${publisherShare}%): $${Math.round(totalMonthly * publisherShare / 100).toLocaleString()}/mo`,
  ]

  // Break-even
  const monthsToBreakEven = totalMonthly > 0 ? Math.ceil(budget / totalMonthly) : 999
  const breakEven = monthsToBreakEven > 60
    ? `Projected break-even: NOT ACHIEVABLE within 5 years at current trajectory. Increase streams or reduce budget.`
    : `Projected break-even: ${monthsToBreakEven} months ($${budget.toLocaleString()} budget / $${totalMonthly.toLocaleString()}/mo revenue)`

  return {
    revenue_projections: projections,
    total_monthly_revenue: totalMonthly,
    total_annual_revenue: totalAnnual,
    marketing_roi_estimate: marketingROI,
    royalty_breakdown: royaltyBreakdown,
    break_even_timeline: breakEven,
    growth_recommendations: [
      `Release frequency: ${projectType.includes('album') ? 'Single every 4-6 weeks to maintain algorithm momentum' : 'Consider EP release (4-6 tracks) for catalog depth'}`,
      'Playlist pitching: Submit to Spotify editorial 4 weeks before release',
      'Social content: 3-5 short-form videos per track for TikTok/Reels/Shorts',
      'Sync licensing: Register with music supervisors for TV/film/ad placements',
      'Direct-to-fan: Bandcamp, Patreon, or merch for higher-margin revenue',
      'Collaborate: Features can expose your music to new audiences',
    ],
    risk_factors: [
      'Platform dependency: Algorithm changes can significantly impact streaming revenue',
      'Market saturation: 100,000+ tracks uploaded daily to Spotify',
      'Royalty rate uncertainty: Per-stream rates may decrease as streaming grows',
      'Marketing effectiveness: Paid acquisition costs rising 15-20% YoY',
      'Catalog longevity: Most tracks see 70% of lifetime streams in first 90 days',
    ],
  }
}

function formatBusinessReport(input: BusinessInput, output: BusinessOutput): string {
  const lines: string[] = []
  lines.push('## Music Business Analyzer')
  lines.push('')
  lines.push(`**${input.project_type || 'Single Release'}** — ${input.expected_streams_month || 50000} streams/mo | Budget: $${(input.production_budget || 10000).toLocaleString()}`)
  lines.push('')

  lines.push('### Revenue Projections')
  lines.push('| Platform | Streams/mo | Rev/Stream | Monthly | Annual |')
  lines.push('|----------|-----------|------------|---------|--------|')
  for (const proj of output.revenue_projections) {
    lines.push(`| ${proj.platform} | ${proj.streams.toLocaleString()} | $${proj.revenue_per_stream.toFixed(4)} | $${proj.monthly_revenue.toLocaleString()} | $${proj.annual_revenue.toLocaleString()} |`)
  }
  lines.push(`| **TOTAL** | | | **$${output.total_monthly_revenue.toLocaleString()}** | **$${output.total_annual_revenue.toLocaleString()}** |`)
  lines.push('')

  lines.push('### Royalty Breakdown')
  for (const rb of output.royalty_breakdown) {
    lines.push(`- ${rb}`)
  }
  lines.push('')

  lines.push('### Marketing ROI Estimate')
  lines.push(output.marketing_roi_estimate)
  lines.push('')

  lines.push('### Break-Even Timeline')
  lines.push(output.break_even_timeline)
  lines.push('')

  lines.push('### Growth Recommendations')
  for (const rec of output.growth_recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')

  lines.push('### Risk Factors')
  for (const risk of output.risk_factors) {
    lines.push(`- ${risk}`)
  }
  lines.push('')

  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Composition Assistant
  tools.register(defineTool({
    name: 'composition_assistant',
    description: 'Assists in music composition by generating chord progressions, melody ideas, bass lines, and song structure for a given genre, mood, and key. Returns Roman numeral analysis, scale degree suggestions, and production tips.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: genre, mood, tempo_bpm, key, duration_sec, structure_type, instrumentation[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CompositionInput = JSON.parse(args.input_data)
      const result = generateComposition(input)
      return formatCompositionReport(input, result)
    }
  }))

  // Tool 2: Arrangement Optimizer
  tools.register(defineTool({
    name: 'arrangement_optimizer',
    description: 'Optimizes arrangement by planning instrument placement across sections, designing transitions, mapping energy curves, and providing dynamics plans. Returns instrument layer assignments, transition techniques, and mixing considerations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: composition_sketch{}, target_genre, energy_curve, instrumentation[], arrangement_style', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ArrangementInput = JSON.parse(args.input_data)
      const result = optimizeArrangement(input)
      return formatArrangementReport(input, result)
    }
  }))

  // Tool 3: Mixing Engineer AI
  tools.register(defineTool({
    name: 'mixing_engineer_ai',
    description: 'Provides AI mixing recommendations including volume levels, panning, EQ settings, compression parameters, and reverb/delay sends for each track. Returns complete mix settings, bus routing, master chain, and problem area solutions.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: track_list[], genre_reference, target_loudness_lufs, mix_style, problem_areas[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: MixingInput = JSON.parse(args.input_data)
      const result = generateMixingRecommendations(input)
      return formatMixingReport(input, result)
    }
  }))

  // Tool 4: Mastering Chain Designer
  tools.register(defineTool({
    name: 'mastering_chain_designer',
    description: 'Designs a complete mastering chain including corrective EQ, tonal shaping, multi-band compression, stereo enhancement, harmonic excitation, and limiting. Returns stage-by-stage parameters, loudness specs, and platform-specific delivery formats.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: source_format{}, target_platforms[], loudness_target_lufs, dynamic_range_target, genre', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: MasteringInput = JSON.parse(args.input_data)
      const result = designMasteringChain(input)
      return formatMasteringReport(input, result)
    }
  }))

  // Tool 5: Sample Generator Config
  tools.register(defineTool({
    name: 'sample_generator_config',
    description: 'Configures AI sample/sound generation parameters for synthesis models (Suno, Udio, Stable Audio, etc.). Returns model recommendations, generation parameters, prompt templates, output configuration, and usage guidelines.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: sound_type, model_preference, duration_sec, characteristics{}, output_format, usage_rights', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: SampleGeneratorInput = JSON.parse(args.input_data)
      const result = configureSampleGenerator(input)
      return formatSampleGeneratorReport(input, result)
    }
  }))

  // Tool 6: Music CopyClear Advisor
  tools.register(defineTool({
    name: 'music_copyclear_advisor',
    description: 'Advises on music copyright, licensing, clearance, and royalty considerations. Returns licensing requirements with costs and timelines, risk assessment, fair use analysis, and alternative clearance strategies.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: usage_type, territory, duration_sec, original_composition, similar_works[], budget_usd', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CopyClearInput = JSON.parse(args.input_data)
      const result = adviseCopyClear(input)
      return formatCopyClearReport(input, result)
    }
  }))

  // Tool 7: Playlist Curator AI
  tools.register(defineTool({
    name: 'playlist_curator_ai',
    description: 'Creates curated playlists based on mood, activity, genre constraints, and flow optimization. Returns track-by-track listing with energy levels, BPM ranges, transition notes, mood arc analysis, and platform-specific tips.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: playlist_purpose, duration_minutes, genre_constraints[], mood_target, flow_preference, track_count', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PlaylistInput = JSON.parse(args.input_data)
      const result = curatePlaylist(input)
      return formatPlaylistReport(input, result)
    }
  }))

  // Tool 8: Music Business Analyzer
  tools.register(defineTool({
    name: 'music_business_analyzer',
    description: 'Analyzes music business metrics including streaming revenue by platform, royalty splits, marketing ROI, break-even timeline, and growth recommendations. Returns detailed revenue projections, risk factors, and strategic advice.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: project_type, platform_distribution{}, expected_streams_month, production_budget, royalty_structure{}', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: BusinessInput = JSON.parse(args.input_data)
      const result = analyzeMusicBusiness(input)
      return formatBusinessReport(input, result)
    }
  }))

  console.log(`[dsh-tool-musicproducer] Loaded v${VERSION} - AI Music Production toolkit with 8 tools`)
  console.log('  Tools: composition_assistant, arrangement_optimizer, mixing_engineer_ai, mastering_chain_designer, sample_generator_config, music_copyclear_advisor, playlist_curator_ai, music_business_analyzer')
}
