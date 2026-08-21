/**
 * DSH Plugin: Music Production AI Agent v0.1.0
 * DeepSeek Harness toolkit for music production:
 * chord progressions, melody composition, mixing, mastering,
 * sample organization, copyright checking, arrangement, AI music generation.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ─── Seeded Random Helpers ───────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function pickN<T>(rng: () => number, arr: T[], n: number): T[] {
  const copy = [...arr]
  const result: T[] = []
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length)
    result.push(copy.splice(idx, 1)[0])
  }
  return result
}

// ─── Music Theory Constants ──────────────────────────────────────────────────

const KEYS_MAJOR = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const KEYS_MINOR = ['Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm']
const ALL_KEYS = [...KEYS_MAJOR, ...KEYS_MINOR]
const MODES = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian']

const CHORD_QUALITIES = ['', 'm', 'm7', 'maj7', '7', 'sus4', 'sus2', 'dim', 'aug', 'add9', '6', '9']
const CHORD_PROGRESSION_PATTERNS = [
  { name: 'I-V-vi-IV', degrees: [1, 5, 6, 4], genre: 'Pop' },
  { name: 'I-IV-V-I', degrees: [1, 4, 5, 1], genre: 'Blues/Rock' },
  { name: 'ii-V-I', degrees: [2, 5, 1], genre: 'Jazz' },
  { name: 'I-vi-IV-V', degrees: [1, 6, 4, 5], genre: '50s Doo-Wop' },
  { name: 'vi-IV-I-V', degrees: [6, 4, 1, 5], genre: 'Emotional Ballad' },
  { name: 'I-V-vi-iii-IV', degrees: [1, 5, 6, 3, 4], genre: 'Axis of Awesome' },
  { name: 'i-VII-VI-V', degrees: [1, 7, 6, 5], genre: 'Minor Andalusian' },
  { name: 'I-IV-vi-V', degrees: [1, 4, 6, 5], genre: 'Pop-Punk' },
]

const INSTRUMENTS = [
  'Piano', 'Electric Guitar', 'Acoustic Guitar', 'Bass Guitar', 'Drums',
  'Strings', 'Synth Pad', 'Synth Lead', 'Brass', 'Woodwinds',
  'Violin', 'Cello', 'Harp', 'Organ', 'Choir', 'Electric Piano'
]

const SCALES = [
  'Major (Ionian)', 'Minor (Aeolian)', 'Harmonic Minor', 'Melodic Minor',
  'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Pentatonic Major',
  'Pentatonic Minor', 'Blues', 'Whole Tone', 'Diminished', 'Chromatic'
]

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Jazz', 'Blues', 'Electronic',
  'Classical', 'Country', 'Funk', 'Soul', 'Reggae', 'Metal', 'Folk',
  'Latin', 'K-Pop', 'Ambient', 'Lo-Fi'
]

const MOODS = [
  'Happy', 'Sad', 'Energetic', 'Melancholic', 'Dreamy', 'Aggressive',
  'Romantic', 'Mysterious', 'Uplifting', 'Dark', 'Peaceful', 'Tense'
]

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const INTERVALS = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8']

// ─── Tool 1: Chord Progression Generator ─────────────────────────────────────

interface ChordProgInput {
  key?: string
  genre?: string
  mood?: string
  bars?: number
  complexity?: number  // 1-5
}

interface GeneratedChord {
  degree: string
  chord: string
  quality: string
  function: string
  durationBars: number
}

interface ChordProgResult {
  key: string
  genre: string
  mood: string
  pattern: string
  complexity: number
  tempo: number
  timeSignature: string
  bars: number
  chordProgression: GeneratedChord[]
  analysis: {
    harmonicFunctions: string[]
    cadenceType: string
    borrowingDetected: boolean
    modalInterchange: string[]
    secondaryDominants: string[]
  }
  alternatives: { pattern: string; chords: string[] }[]
  tips: string[]
}

function generateChordProgression(input: ChordProgInput): ChordProgResult {
  const seedStr = `${input.key}-${input.genre}-${input.mood}-${input.bars}-${input.complexity}`
  const rng = mulberry32(hashStr(seedStr))

  const key = input.key || pick(rng, ALL_KEYS)
  const genre = input.genre || pick(rng, GENRES)
  const mood = input.mood || pick(rng, MOODS)
  const bars = input.bars || 8
  const complexity = input.complexity || Math.ceil(rng() * 4)

  const pattern = pick(rng, CHORD_PROGRESSION_PATTERNS)
  const tempo = Math.floor(70 + rng() * 90)
  const timeSignatures = ['4/4', '3/4', '6/8', '7/8', '5/4']
  const timeSignature = complexity >= 4 ? pick(rng, timeSignatures) : '4/4'

  const isMinor = key.includes('m') || ['Dark', 'Sad', 'Melancholic', 'Mysterious', 'Tense'].includes(mood)
  const keyRoot = key.replace('m', '')
  const keyIndex = NOTE_NAMES.indexOf(keyRoot) >= 0 ? NOTE_NAMES.indexOf(keyRoot) : 0

  const majorScaleDegrees = isMinor
    ? ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
    : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']

  const chordProgression: GeneratedChord[] = []
  let totalBars = 0
  let degIdx = 0

  while (totalBars < bars) {
    const degreeNum = pattern.degrees[degIdx % pattern.degrees.length]
    const degreeName = majorScaleDegrees[(degreeNum - 1) % 7]
    const chordNote = NOTE_NAMES[(keyIndex + (degreeNum - 1) * 2) % 12]

    const quality = isMinor && (degreeNum === 1 || degreeNum === 4 || degreeNum === 5)
      ? 'm'
      : !isMinor && (degreeNum === 2 || degreeNum === 3 || degreeNum === 6)
        ? 'm'
        : ''

    const functions = ['Tonic', 'Subdominant', 'Dominant']
    const fn = degreeNum === 1 ? 'Tonic' : degreeNum === 5 ? 'Dominant' : degreeNum === 4 ? 'Subdominant' : pick(rng, functions)

    const duration = complexity >= 3 && rng() > 0.6 ? 1 : 2
    if (totalBars + duration > bars) break

    const qualityExt = complexity >= 3 && rng() > 0.5
      ? pick(rng, ['', '7', 'maj7', 'add9', 'sus4'])
      : ''

    chordProgression.push({
      degree: degreeName,
      chord: `${chordNote}${quality}${qualityExt}`,
      quality: qualityExt || (quality === 'm' ? 'minor' : 'major'),
      function: fn,
      durationBars: duration,
    })

    totalBars += duration
    degIdx++
  }

  const alternates = Array.from({ length: 2 }, () => {
    const altPattern = pick(rng, CHORD_PROGRESSION_PATTERNS)
    return {
      pattern: altPattern.name,
      chords: altPattern.degrees.map(d => majorScaleDegrees[(d - 1) % 7]),
    }
  })

  const cadences = ['Authentic (V-I)', 'Plagal (IV-I)', 'Deceptive (V-vi)', 'Half (ending on V)', 'Picardy (i-I)']

  return {
    key,
    genre,
    mood,
    pattern: pattern.name,
    complexity,
    tempo,
    timeSignature,
    bars,
    chordProgression,
    analysis: {
      harmonicFunctions: [...new Set(chordProgression.map(c => c.function))],
      cadenceType: pick(rng, cadences),
      borrowingDetected: complexity >= 3 && rng() > 0.5,
      modalInterchange: complexity >= 3 && rng() > 0.6
        ? pickN(rng, MODES, 2)
        : [],
      secondaryDominants: complexity >= 4 && rng() > 0.5
        ? [`V/${majorScaleDegrees[1]}`, `V/${majorScaleDegrees[3]}`]
        : [],
    },
    alternatives: alternates,
    tips: [
      complexity >= 3 ? 'Try adding passing chords between diatonic changes for smoother voice leading' : 'Keep chord changes on strong beats for clarity',
      isMinor ? 'Consider borrowing the major V chord for a stronger cadence' : 'Try modal interchange from parallel minor for color',
      `For ${genre} style, typical tempo is ${tempo - 10}-${tempo + 20} BPM`,
      timeSignature !== '4/4' ? `${timeSignature} adds rhythmic interest; experiment with accent patterns` : 'Syncopated rhythms can add groove even in 4/4',
    ],
  }
}

function formatChordProg(r: ChordProgResult): string {
  const lines: string[] = []
  lines.push(`# Chord Progression: ${r.key} — ${r.genre} / ${r.mood}`)
  lines.push('')
  lines.push(`**Pattern:** ${r.pattern}  |  **Tempo:** ${r.tempo} BPM  |  **Time:** ${r.timeSignature}  |  **Bars:** ${r.bars}  |  **Complexity:** ${'★'.repeat(r.complexity)}${'☆'.repeat(5 - r.complexity)}`)
  lines.push('')
  lines.push('## Chord Chart')
  lines.push('')
  lines.push('| Bar | Degree | Chord | Quality | Function |')
  lines.push('|-----|--------|-------|---------|----------|')
  let bar = 1
  for (const c of r.chordProgression) {
    lines.push(`| ${bar} | ${c.degree} | **${c.chord}** | ${c.quality} | ${c.function} |`)
    bar += c.durationBars
  }
  lines.push('')
  lines.push('## Harmonic Analysis')
  lines.push('')
  lines.push(`- **Harmonic Functions Used:** ${r.analysis.harmonicFunctions.join(', ')}`)
  lines.push(`- **Cadence Type:** ${r.analysis.cadenceType}`)
  lines.push(`- **Modal Interchange:** ${r.analysis.modalInterchange.length > 0 ? r.analysis.modalInterchange.join(', ') : 'None'}`)
  lines.push(`- **Secondary Dominants:** ${r.analysis.secondaryDominants.length > 0 ? r.analysis.secondaryDominants.join(', ') : 'None'}`)
  lines.push(`- **Borrowing Detected:** ${r.analysis.borrowingDetected ? 'Yes' : 'No'}`)
  lines.push('')
  lines.push('## Alternative Progressions')
  r.alternatives.forEach((a, i) => {
    lines.push(`${i + 1}. **${a.pattern}**: ${a.chords.join(' → ')}`)
  })
  lines.push('')
  lines.push('## Production Tips')
  r.tips.forEach(t => lines.push(`- ${t}`))
  return lines.join('\n')
}

// ─── Tool 2: Melody Composer AI ──────────────────────────────────────────────

interface MelodyInput {
  key?: string
  scale?: string
  mood?: string
  bars?: number
  range?: string  // e.g., "C4-C6"
  motifLength?: number
}

interface MelodyNote {
  pitch: string
  midi: number
  duration: string
  durationBeats: number
  bar: number
  beat: number
  interval: string
  role: string
}

interface MelodyResult {
  key: string
  scale: string
  mood: string
  bars: number
  range: string
  tempo: number
  timeSignature: string
  motif: MelodyNote[]
  development: {
    technique: string
    description: string
    appliedAt: number[]
  }[]
  fullMelody: MelodyNote[]
  contour: string
  phraseStructure: string
  analysis: {
    rangeSemitones: number
    averageInterval: number
    stepwiseRatio: number
    climax: string
    rhythmicDensity: number
  }
  tips: string[]
}

function composeMelody(input: MelodyInput): MelodyResult {
  const seedStr = `${input.key}-${input.scale}-${input.mood}-${input.bars}-${input.range}-${input.motifLength}`
  const rng = mulberry32(hashStr(seedStr))

  const key = input.key || pick(rng, ALL_KEYS)
  const scale = input.scale || pick(rng, SCALES)
  const mood = input.mood || pick(rng, MOODS)
  const bars = input.bars || 8
  const range = input.range || 'C4-C6'
  const motifLength = input.motifLength || 4
  const tempo = Math.floor(80 + rng() * 80)
  const timeSignature = '4/4'

  const rangeParts = range.split('-')
  const lowMidi = nameToMidi(rangeParts[0] || 'C4')
  const highMidi = nameToMidi(rangeParts[1] || 'C6')

  const scaleIntervals = getScaleIntervals(scale)
  const keyMidi = nameToMidi(key.replace('m', '') + '4')
  const availableNotes: number[] = []
  for (let midi = lowMidi; midi <= highMidi; midi++) {
    if (scaleIntervals.includes((midi - keyMidi) % 12)) {
      availableNotes.push(midi)
    }
  }
  if (availableNotes.length === 0) {
    for (let midi = lowMidi; midi <= highMidi; midi++) availableNotes.push(midi)
  }

  const durations = ['1/4', '1/8', '1/2', '1/16', 'dotted 1/4']
  const durationBeats = [1, 0.5, 2, 0.25, 1.5]

  // Generate motif
  const motif: MelodyNote[] = []
  let currentMidi = availableNotes[Math.floor(availableNotes.length * 0.4)]
  let beat = 1
  let bar = 1
  let prevMidi = currentMidi

  for (let i = 0; i < motifLength; i++) {
    const durIdx = Math.floor(rng() * durations.length)
    const intervalSemitones = currentMidi - prevMidi
    motif.push({
      pitch: midiToName(currentMidi),
      midi: currentMidi,
      duration: durations[durIdx],
      durationBeats: durationBeats[durIdx],
      bar,
      beat,
      interval: semitonesToInterval(intervalSemitones),
      role: i === 0 ? 'head' : i === motifLength - 1 ? 'tail' : 'body',
    })
    prevMidi = currentMidi
    beat += durationBeats[durIdx]
    if (beat > 4) { beat -= 4; bar++ }
    const step = pick(rng, [-2, -1, -1, 0, 1, 1, 2, 3])
    currentMidi = Math.max(lowMidi, Math.min(highMidi, currentMidi + step))
  }

  // Develop melody using techniques
  const techniques = ['Sequence', 'Inversion', 'Augmentation', 'Diminution', 'Fragmentation', 'Sequence + Inversion']
  const development: { technique: string; description: string; appliedAt: number[] }[] = []

  const fullMelody: MelodyNote[] = [...motif]
  let currentBar = 2

  const numDevs = Math.min(3, Math.floor(bars / 3))
  for (let d = 0; d < numDevs && currentBar <= bars; d++) {
    const tech = pick(rng, techniques)
    const appliedAt = [currentBar]
    const devNotes: MelodyNote[] = []

    if (tech === 'Sequence') {
      motif.forEach(n => {
        const shifted = Math.min(highMidi, n.midi + pick(rng, [2, 3, 4]))
        devNotes.push({ ...n, midi: shifted, pitch: midiToName(shifted), bar: currentBar, beat: n.beat })
      })
    } else if (tech === 'Inversion') {
      const motifCenter = motif.reduce((s, n) => s + n.midi, 0) / motif.length
      motif.forEach(n => {
        const inverted = Math.round(2 * motifCenter - n.midi)
        const clamped = Math.max(lowMidi, Math.min(highMidi, inverted))
        devNotes.push({ ...n, midi: clamped, pitch: midiToName(clamped), bar: currentBar, beat: n.beat })
      })
    } else if (tech === 'Augmentation') {
      motif.forEach(n => {
        devNotes.push({ ...n, duration: '1/2', durationBeats: 2, bar: currentBar, beat: n.beat })
      })
    } else {
      motif.slice(0, Math.ceil(motif.length / 2)).forEach(n => {
        devNotes.push({ ...n, bar: currentBar, beat: n.beat })
      })
    }

    fullMelody.push(...devNotes)
    development.push({
      technique: tech,
      description: `${tech} applied to motif starting at bar ${currentBar}`,
      appliedAt,
    })
    currentBar += 2
  }

  // Fill remaining bars
  while (currentBar <= bars) {
    motif.forEach(n => {
      const variation = Math.max(lowMidi, Math.min(highMidi, n.midi + pick(rng, [-1, 0, 0, 1])))
      fullMelody.push({ ...n, midi: variation, pitch: midiToName(variation), bar: currentBar, beat: n.beat })
    })
    currentBar++
  }

  const allMidis = fullMelody.map(n => n.midi)
  const rangeSemis = Math.max(...allMidis) - Math.min(...allMidis)
  const intervals = fullMelody.slice(1).map((n, i) => Math.abs(n.midi - fullMelody[i].midi))
  const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0
  const stepwise = intervals.filter(i => i <= 2).length / Math.max(1, intervals.length)
  const climaxMidi = Math.max(...allMidis)
  const climaxNote = fullMelody.find(n => n.midi === climaxMidi)

  const contours = ['Ascending', 'Descending', 'Arch (rise-fall)', 'Valley (fall-rise)', 'Flat/Static', 'Undulating']
  const phraseStructures = ['AABA', 'ABAC', 'AABB', 'ABAB', 'Through-composed', 'Period (antecedent-consequent)']

  return {
    key, scale, mood, bars, range, tempo, timeSignature,
    motif,
    development,
    fullMelody,
    contour: pick(rng, contours),
    phraseStructure: pick(rng, phraseStructures),
    analysis: {
      rangeSemitones: rangeSemis,
      averageInterval: Math.round(avgInterval * 10) / 10,
      stepwiseRatio: Math.round(stepwise * 100) / 100,
      climax: climaxNote ? climaxNote.pitch : 'N/A',
      rhythmicDensity: Math.round(fullMelody.length / bars * 10) / 10,
    },
    tips: [
      `The motif spans ${motif.length} notes — try varying the rhythm for contrast`,
      `Stepwise motion: ${Math.round(stepwise * 100)}% — ${stepwise > 0.6 ? 'good singability' : 'consider more stepwise motion for vocal melodies'}`,
      `Climax at ${climaxNote?.pitch} (bar ${climaxNote?.bar}) — ensure it aligns with harmonic peak`,
      `Phrase structure: ${pick(rng, phraseStructures)} — consider call-and-response for engagement`,
      mood === 'Sad' || mood === 'Melancholic' ? 'Minor 6th and minor 7th intervals add emotional depth' : 'Major 3rds and perfect 5ths create brightness',
    ],
  }
}

function nameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(\d)$/)
  if (!match) return 60
  const noteNames: Record<string, number> = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 }
  return (parseInt(match[2]) + 1) * 12 + (noteNames[match[1]] || 0)
}

function midiToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1
  return NOTE_NAMES[midi % 12] + octave
}

function getScaleIntervals(scale: string): number[] {
  const scaleMap: Record<string, number[]> = {
    'Major (Ionian)': [0, 2, 4, 5, 7, 9, 11],
    'Minor (Aeolian)': [0, 2, 3, 5, 7, 8, 10],
    'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
    'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Phrygian': [0, 1, 3, 5, 7, 8, 10],
    'Lydian': [0, 2, 4, 6, 7, 9, 11],
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'Pentatonic Major': [0, 2, 4, 7, 9],
    'Pentatonic Minor': [0, 3, 5, 7, 10],
    'Blues': [0, 3, 5, 6, 7, 10],
    'Whole Tone': [0, 2, 4, 6, 8, 10],
    'Diminished': [0, 2, 3, 5, 6, 8, 9, 11],
    'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  }
  return scaleMap[scale] || scaleMap['Major (Ionian)']
}

function semitonesToInterval(semitones: number): string {
  const abs = Math.abs(semitones)
  if (abs === 0) return 'P1 (same)'
  const dir = semitones > 0 ? '↑' : '↓'
  return `${dir}${INTERVALS[abs % 12] || `${abs}st`}`
}

function formatMelody(r: MelodyResult): string {
  const lines: string[] = []
  lines.push(`# Melody Composition: ${r.key} ${r.scale} — ${r.mood}`)
  lines.push('')
  lines.push(`**Tempo:** ${r.tempo} BPM  |  **Time:** ${r.timeSignature}  |  **Bars:** ${r.bars}  |  **Range:** ${r.range}  |  **Contour:** ${r.contour}`)
  lines.push('')
  lines.push('## Motif')
  lines.push('')
  lines.push('| Note | MIDI | Duration | Bar:Beat | Interval | Role |')
  lines.push('|------|------|----------|----------|----------|------|')
  r.motif.forEach(n => {
    lines.push(`| ${n.pitch} | ${n.midi} | ${n.duration} | ${n.bar}:${n.beat} | ${n.interval} | ${n.role} |`)
  })
  lines.push('')
  lines.push('## Development Techniques')
  r.development.forEach(d => {
    lines.push(`- **${d.technique}** (bar ${d.appliedAt.join(', ')}): ${d.description}`)
  })
  lines.push('')
  lines.push('## Full Melody')
  lines.push('')
  lines.push('| Bar | Note | Duration | Interval |')
  lines.push('|-----|------|----------|----------|')
  r.fullMelody.forEach(n => {
    lines.push(`| ${n.bar} | ${n.pitch} | ${n.duration} | ${n.interval} |`)
  })
  lines.push('')
  lines.push('## Analysis')
  lines.push('')
  lines.push(`- **Range:** ${r.analysis.rangeSemitones} semitones`)
  lines.push(`- **Average Interval:** ${r.analysis.averageInterval} semitones`)
  lines.push(`- **Stepwise Motion:** ${Math.round(r.analysis.stepwiseRatio * 100)}%`)
  lines.push(`- **Climax Note:** ${r.analysis.climax}`)
  lines.push(`- **Rhythmic Density:** ${r.analysis.rhythmicDensity} notes/bar`)
  lines.push(`- **Phrase Structure:** ${r.phraseStructure}`)
  lines.push('')
  lines.push('## Composition Tips')
  r.tips.forEach(t => lines.push(`- ${t}`))
  return lines.join('\n')
}

// ─── Tool 3: Mixing Engine Advisor ───────────────────────────────────────────

interface MixingInput {
  genre?: string
  trackType?: string  // e.g., "vocal", "drums", "full mix"
  problem?: string  // e.g., "muddy", "harsh", "thin"
  budget?: string  // "low", "mid", "high"
}

interface EQBand {
  frequency: string
  gain: string
  q: string
  type: string
  reason: string
}

interface MixingResult {
  genre: string
  trackType: string
  problem: string
  budget: string
  eq: EQBand[]
  compression: {
    threshold: string
    ratio: string
    attack: string
    release: string
    knee: string
    gainReduction: string
    reason: string
  }
  spatial: {
    width: string
    reverb: string
    delay: string
    pan: string
    depth: string
  }
  busRouting: string[]
  signalChain: string[]
  metering: {
    lufs: string
    peak: string
    stereoWidth: string
    dynamicRange: string
  }
  tips: string[]
}

function adviseMixing(input: MixingInput): MixingResult {
  const seedStr = `${input.genre}-${input.trackType}-${input.problem}-${input.budget}`
  const rng = mulberry32(hashStr(seedStr))

  const genre = input.genre || pick(rng, GENRES)
  const trackType = input.trackType || pick(rng, ['vocal', 'drums', 'bass', 'guitar', 'synth', 'full mix', 'strings'])
  const problem = input.problem || pick(rng, ['muddy', 'harsh', 'thin', 'boomy', 'dull', 'noisy', 'phasey', 'balanced'])
  const budget = input.budget || pick(rng, ['low', 'mid', 'high'])

  const eqBands: EQBand[] = []

  if (problem === 'muddy') {
    eqBands.push({ frequency: '200-400 Hz', gain: '-3 dB', q: '1.4', type: 'Bell', reason: 'Reduce muddiness buildup' })
    eqBands.push({ frequency: '80 Hz', gain: '-2 dB', q: '0.7', type: 'High-pass', reason: 'Remove sub rumble' })
    eqBands.push({ frequency: '3-5 kHz', gain: '+2 dB', q: '1.0', type: 'Bell', reason: 'Add presence and clarity' })
  } else if (problem === 'harsh') {
    eqBands.push({ frequency: '2-4 kHz', gain: '-3 dB', q: '2.0', type: 'Bell', reason: 'Tame harshness' })
    eqBands.push({ frequency: '6-8 kHz', gain: '-2 dB', q: '1.4', type: 'Bell', reason: 'Reduce sibilance' })
    eqBands.push({ frequency: '100 Hz', gain: '+1 dB', q: '0.8', type: 'Bell', reason: 'Add warmth back' })
  } else if (problem === 'thin') {
    eqBands.push({ frequency: '100-200 Hz', gain: '+3 dB', q: '0.8', type: 'Bell', reason: 'Add body and warmth' })
    eqBands.push({ frequency: '800 Hz-1 kHz', gain: '+1.5 dB', q: '1.0', type: 'Bell', reason: 'Add thickness' })
    eqBands.push({ frequency: '10 kHz+', gain: '+2 dB', q: '0.6', type: 'Shelf', reason: 'Add air' })
  } else {
    eqBands.push({ frequency: '60 Hz', gain: '-1 dB', q: '0.5', type: 'Bell', reason: 'Control sub energy' })
    eqBands.push({ frequency: '3 kHz', gain: '+1 dB', q: '1.2', type: 'Bell', reason: 'Enhance presence' })
    eqBands.push({ frequency: '12 kHz', gain: '+1.5 dB', q: '0.4', type: 'Shelf', reason: 'Add brightness' })
  }

  const compPresets: Record<string, MixingResult['compression']> = {
    vocal: { threshold: '-18 dB', ratio: '3:1', attack: '10 ms', release: '100 ms', knee: 'Soft (3 dB)', gainReduction: '4-6 dB', reason: 'Smooth vocal dynamics while preserving transients' },
    drums: { threshold: '-12 dB', ratio: '4:1', attack: '5 ms', release: '50 ms', knee: 'Hard', gainReduction: '6-10 dB', reason: 'Punch and sustain for drums' },
    bass: { threshold: '-15 dB', ratio: '4:1', attack: '20 ms', release: '150 ms', knee: 'Soft (6 dB)', gainReduction: '5-8 dB', reason: 'Even out bass performance' },
    'full mix': { threshold: '-20 dB', ratio: '2:1', attack: '30 ms', release: '200 ms', knee: 'Soft (6 dB)', gainReduction: '2-4 dB', reason: 'Gentle bus compression for glue' },
  }

  const compression = compPresets[trackType] || compPresets['full mix']

  const spatialPresets: Record<string, MixingResult['spatial']> = {
    vocal: { width: 'Mono to narrow stereo', reverb: 'Plate, 1.2s decay, -12 dB', delay: 'Slapback 120ms, -15 dB', pan: 'Center', depth: 'Front-center' },
    drums: { width: 'Wide stereo', reverb: 'Room, 0.8s decay, -18 dB', delay: 'None', pan: 'Natural kit spread', depth: 'Mid-front' },
    bass: { width: 'Mono', reverb: 'None', delay: 'None', pan: 'Center', depth: 'Front' },
    'full mix': { width: 'Full stereo', reverb: 'Hall, 2.0s decay, -20 dB', delay: 'Stereo ping-pong, 1/4 note', pan: 'LCR panning', depth: '3D layered' },
  }

  const spatial = spatialPresets[trackType] || spatialPresets['full mix']

  const busRouting = [
    `${trackType} → ${trackType} bus → mix bus`,
    'Reverb bus (parallel)',
    'Delay bus (parallel)',
    'Mix bus → master bus',
  ]

  if (budget === 'high') {
    busRouting.push('Analog summing bus')
    busRouting.push('Parallel compression bus')
  }

  const signalChain = [
    '1. Gain staging (-18 dBFS RMS target)',
    '2. Subtractive EQ (problem frequencies)',
    '3. Compression (dynamics control)',
    '4. Tonal EQ (sweetening)',
    '5. Spatial processing (reverb/delay)',
    '6. Automation (volume rides)',
    '7. Metering check',
  ]

  if (budget === 'high') {
    signalChain.splice(4, 0, '4b. Saturation/color')
    signalChain.splice(5, 0, '4c. Mid-side EQ')
  }

  return {
    genre, trackType, problem, budget,
    eq: eqBands,
    compression,
    spatial,
    busRouting,
    signalChain,
    metering: {
      lufs: trackType === 'full mix' ? '-14 LUFS (streaming)' : '-18 LUFS (stem)',
      peak: '-1 dBTP (true peak)',
      stereoWidth: trackType === 'bass' ? 'Mono (0%)' : `${Math.floor(60 + rng() * 40)}%`,
      dynamicRange: `${Math.floor(8 + rng() * 8)} dB`,
    },
    tips: [
      `For ${genre} ${trackType}: target ${trackType === 'full mix' ? '-14' : '-18'} LUFS`,
      problem === 'muddy' ? 'Use high-pass filter on non-bass elements (80-120 Hz)' : problem === 'harsh' ? 'Try dynamic EQ instead of static cut for harshness' : 'Reference against commercial tracks in same genre',
      budget === 'high' ? 'Use parallel compression for punch without squashing' : 'Free plugins like TDR Nova can handle most EQ tasks',
      'Always A/B with bypass to avoid over-processing',
      'Check mix in mono for phase coherence',
    ],
  }
}

function formatMixing(r: MixingResult): string {
  const lines: string[] = []
  lines.push(`# Mixing Advice: ${r.trackType} — ${r.problem} problem`)
  lines.push('')
  lines.push(`**Genre:** ${r.genre}  |  **Budget tier:** ${r.budget}  |  **Track type:** ${r.trackType}`)
  lines.push('')
  lines.push('## EQ Recommendations')
  lines.push('')
  lines.push('| Freq | Gain | Q | Type | Reason |')
  lines.push('|------|------|---|------|--------|')
  r.eq.forEach(b => {
    lines.push(`| ${b.frequency} | ${b.gain} | ${b.q} | ${b.type} | ${b.reason} |`)
  })
  lines.push('')
  lines.push('## Compression Settings')
  lines.push('')
  lines.push(`- **Threshold:** ${r.compression.threshold}`)
  lines.push(`- **Ratio:** ${r.compression.ratio}`)
  lines.push(`- **Attack:** ${r.compression.attack}`)
  lines.push(`- **Release:** ${r.compression.release}`)
  lines.push(`- **Knee:** ${r.compression.knee}`)
  lines.push(`- **Gain Reduction:** ${r.compression.gainReduction}`)
  lines.push(`- **Reason:** ${r.compression.reason}`)
  lines.push('')
  lines.push('## Spatial Processing')
  lines.push('')
  lines.push(`- **Width:** ${r.spatial.width}`)
  lines.push(`- **Reverb:** ${r.spatial.reverb}`)
  lines.push(`- **Delay:** ${r.spatial.delay}`)
  lines.push(`- **Pan:** ${r.spatial.pan}`)
  lines.push(`- **Depth:** ${r.spatial.depth}`)
  lines.push('')
  lines.push('## Bus Routing')
  r.busRouting.forEach(b => lines.push(`- ${b}`))
  lines.push('')
  lines.push('## Signal Chain')
  r.signalChain.forEach(s => lines.push(s))
  lines.push('')
  lines.push('## Metering Targets')
  lines.push('')
  lines.push(`- **LUFS:** ${r.metering.lufs}`)
  lines.push(`- **Peak:** ${r.metering.peak}`)
  lines.push(`- **Stereo Width:** ${r.metering.stereoWidth}`)
  lines.push(`- **Dynamic Range:** ${r.metering.dynamicRange}`)
  lines.push('')
  lines.push('## Tips')
  r.tips.forEach(t => lines.push(`- ${t}`))
  return lines.join('\n')
}

// ─── Tool 4: Mastering Chain Designer ────────────────────────────────────────

interface MasteringInput {
  genre?: string
  targetPlatform?: string  // "spotify", "apple music", "youtube", "cd", "vinyl"
  loudnessTarget?: string  // "streaming", "club", "audiophile"
  dynamicRange?: number  // 1-10
}

interface MasteringProcessor {
  order: number
  processor: string
  settings: string
  purpose: string
}

interface MasteringResult {
  genre: string
  targetPlatform: string
  loudnessTarget: string
  dynamicRange: number
  chain: MasteringProcessor[]
  loudness: {
    integratedLufs: number
    shortTermLufs: number
    momentaryLufs: number
    truePeak: number
    loudnessRange: number
  }
  eq: {
    lowShelf: string
    midCut: string
    highShelf: string
    airBand: string
  }
  stereo: {
    monoBass: string
    stereoWidth: string
    midSide: string
  }
  dither: string
  format: string
  tips: string[]
}

function designMasteringChain(input: MasteringInput): MasteringResult {
  const seedStr = `${input.genre}-${input.targetPlatform}-${input.loudnessTarget}-${input.dynamicRange}`
  const rng = mulberry32(hashStr(seedStr))

  const genre = input.genre || pick(rng, GENRES)
  const targetPlatform = input.targetPlatform || pick(rng, ['spotify', 'apple music', 'youtube', 'cd', 'vinyl', 'soundcloud'])
  const loudnessTarget = input.loudnessTarget || pick(rng, ['streaming', 'club', 'audiophile'])
  const dynamicRange = input.dynamicRange || Math.ceil(rng() * 10)

  const platformLufs: Record<string, number> = {
    'spotify': -14, 'apple music': -16, 'youtube': -14, 'soundcloud': -14, 'cd': -9, 'vinyl': -12,
  }
  const targetLufs = platformLufs[targetPlatform] || -14

  const chain: MasteringProcessor[] = [
    { order: 1, processor: 'Gain/Trim', settings: 'Input gain staging to -6 dBFS peak', purpose: 'Headroom for processing' },
    { order: 2, processor: 'Linear Phase EQ', settings: 'Low cut 20 Hz, 24 dB/oct', purpose: 'Remove subsonic content' },
    { order: 3, processor: 'Dynamic EQ', settings: '200 Hz, -2 dB, Q=1.0, threshold -30 dB', purpose: 'Control low-mid buildup' },
    { order: 4, processor: 'Multiband Compressor', settings: '4 bands: 20-200, 200-2k, 2k-8k, 8k-20k', purpose: 'Frequency-dependent dynamics' },
    { order: 5, processor: 'Stereo Widener', settings: 'Above 2 kHz only, +15% width', purpose: 'Enhance stereo image' },
    { order: 6, processor: 'Limiter', settings: `Ceiling -1.0 dBTP, target ${targetLufs} LUFS`, purpose: 'Final loudness and peak control' },
  ]

  if (loudnessTarget === 'audiophile') {
    chain.push({ order: 7, processor: 'Saturation', settings: 'Tape emulation, subtle 2% THD', purpose: 'Analog warmth and harmonics' })
  }

  const lufsVariance = Math.round((rng() * 2 - 1) * 10) / 10

  return {
    genre, targetPlatform, loudnessTarget, dynamicRange,
    chain,
    loudness: {
      integratedLufs: targetLufs + lufsVariance,
      shortTermLufs: targetLufs + 2 + lufsVariance,
      momentaryLufs: targetLufs + 4 + lufsVariance,
      truePeak: -1.0,
      loudnessRange: Math.round((dynamicRange + rng() * 3) * 10) / 10,
    },
    eq: {
      lowShelf: `${rng() > 0.5 ? '+' : '-'}${(1 + rng() * 2).toFixed(1)} dB @ 60 Hz`,
      midCut: rng() > 0.6 ? `-1.5 dB @ 400 Hz, Q=1.4` : 'No cut needed',
      highShelf: `+${(0.5 + rng() * 1.5).toFixed(1)} dB @ 12 kHz`,
      airBand: `+1 dB @ 18 kHz, shelf`,
    },
    stereo: {
      monoBass: 'Below 120 Hz summed to mono',
      stereoWidth: `${Math.floor(70 + rng() * 25)}% overall`,
      midSide: 'Mid focused, sides widened above 2 kHz',
    },
    dither: targetPlatform === 'cd' ? '16-bit, POW-r3 dither' : '24-bit, no dither needed',
    format: targetPlatform === 'vinyl' ? '24-bit/96kHz WAV, RIAA pre-emphasis' : targetPlatform === 'cd' ? '16-bit/44.1kHz WAV' : '24-bit/48kHz WAV',
    tips: [
      `Target ${targetLufs} LUFS for ${targetPlatform} — platform will normalize anyway`,
      `Dynamic range: ${dynamicRange}/10 — ${dynamicRange > 7 ? 'excellent dynamics, audiophile-friendly' : dynamicRange < 4 ? 'very compressed, consider backing off' : 'balanced for modern release'}`,
      'Always check true peak (intersample peaks) — aim for -1 dBTP minimum',
      targetPlatform === 'vinyl' ? 'Keep bass mono and avoid excessive stereo below 200 Hz' : 'Use reference tracks matched in LUFS for A/B comparison',
      loudnessTarget === 'audiophile' ? 'Less is more — preserve transients and dynamics' : 'Modern streaming rewards competitive loudness',
    ],
  }
}

function formatMastering(r: MasteringResult): string {
  const lines: string[] = []
  lines.push(`# Mastering Chain: ${r.genre} → ${r.targetPlatform}`)
  lines.push('')
  lines.push(`**Loudness target:** ${r.loudnessTarget}  |  **Dynamic range:** ${r.dynamicRange}/10  |  **Format:** ${r.format}`)
  lines.push('')
  lines.push('## Processing Chain')
  lines.push('')
  lines.push('| # | Processor | Settings | Purpose |')
  lines.push('|---|-----------|----------|---------|')
  r.chain.forEach(p => {
    lines.push(`| ${p.order} | ${p.processor} | ${p.settings} | ${p.purpose} |`)
  })
  lines.push('')
  lines.push('## Loudness Targets')
  lines.push('')
  lines.push(`- **Integrated:** ${r.loudness.integratedLufs} LUFS`)
  lines.push(`- **Short-term:** ${r.loudness.shortTermLufs} LUFS`)
  lines.push(`- **Momentary:** ${r.loudness.momentaryLufs} LUFS`)
  lines.push(`- **True Peak:** ${r.loudness.truePeak} dBTP`)
  lines.push(`- **Loudness Range:** ${r.loudness.loudnessRange} LU`)
  lines.push('')
  lines.push('## EQ Summary')
  lines.push('')
  lines.push(`- **Low Shelf:** ${r.eq.lowShelf}`)
  lines.push(`- **Mid Cut:** ${r.eq.midCut}`)
  lines.push(`- **High Shelf:** ${r.eq.highShelf}`)
  lines.push(`- **Air Band:** ${r.eq.airBand}`)
  lines.push('')
  lines.push('## Stereo Processing')
  lines.push('')
  lines.push(`- **Mono Bass:** ${r.stereo.monoBass}`)
  lines.push(`- **Stereo Width:** ${r.stereo.stereoWidth}`)
  lines.push(`- **Mid/Side:** ${r.stereo.midSide}`)
  lines.push('')
  lines.push(`**Dither:** ${r.dither}`)
  lines.push('')
  lines.push('## Tips')
  r.tips.forEach(t => lines.push(`- ${t}`))
  return lines.join('\n')
}

// ─── Tool 5: Sample Library Organizer ────────────────────────────────────────

interface SampleOrgInput {
  librarySize?: number
  categories?: string[]
  tagStyle?: string  // "genre-based", "mood-based", "technical", "hybrid"
}

interface SampleCategory {
  name: string
  count: number
  subcategories: { name: string; count: number; tags: string[] }[]
}

interface SampleOrgResult {
  librarySize: number
  tagStyle: string
  totalCategories: number
  totalTags: number
  categories: SampleCategory[]
  namingConvention: string
  folderStructure: string[]
  metadata: {
    fields: string[]
    autoTagRules: string[]
  }
  searchTips: string[]
  stats: {
    avgTagsPerSample: number
    untaggedCount: number
    duplicateEstimate: number
  }
}

function organizeSamples(input: SampleOrgInput): SampleOrgResult {
  const seedStr = `${input.librarySize}-${input.categories?.join(',')}-${input.tagStyle}`
  const rng = mulberry32(hashStr(seedStr))

  const librarySize = input.librarySize || Math.floor(500 + rng() * 4500)
  const tagStyle = input.tagStyle || pick(rng, ['genre-based', 'mood-based', 'technical', 'hybrid'])

  const defaultCategories = [
    { name: 'Drums', subs: ['Kicks', 'Snares', 'Hi-Hats', 'Cymbals', 'Toms', 'Percussion', 'Loops', 'Fills'] },
    { name: 'Bass', subs: ['Sub Bass', 'Electric Bass', 'Synth Bass', 'Acoustic Bass', 'Slap Bass', 'Bass Loops'] },
    { name: 'Synth', subs: ['Pads', 'Leads', 'Plucks', 'Keys', 'Arps', 'Textures', 'Risers', 'Drops'] },
    { name: 'Vocals', subs: ['Chops', 'Phrases', 'Ad-libs', 'Chants', 'Whispers', 'Vocal Loops'] },
    { name: 'FX', subs: ['Impacts', 'Transitions', 'Risers', 'Downlifters', 'Sweeps', 'Glitch', 'Ambience'] },
    { name: 'Instruments', subs: ['Guitar', 'Piano', 'Strings', 'Brass', 'Woodwinds', 'Ethnic', 'Harp', 'Organ'] },
    { name: 'Loops', subs: ['Drum Loops', 'Melodic Loops', 'Bass Loops', 'Full Loops', 'Top Loops'] },
    { name: 'One-Shots', subs: ['Hits', 'Stabs', 'Tonal', 'Noise', 'Percussive'] },
  ]

  const categories: SampleCategory[] = defaultCategories.map(cat => {
    const subcats: string[] = cat.subs
    return {
      name: cat.name,
      count: 0,
      subcategories: subcats.map((sub: string) => {
        const count = Math.floor(5 + rng() * 45)
        return {
          name: sub,
          count,
          tags: generateTags(rng, tagStyle, cat.name, sub),
        }
      }),
    }
  }).map((c: SampleCategory) => ({ ...c, count: c.subcategories.reduce((s: number, sc: { count: number }) => s + sc.count, 0) }))

  const totalTags = categories.reduce((s: number, c: SampleCategory) => s + c.subcategories.reduce((ss: number, sc: { tags: string[] }) => ss + sc.tags.length, 0), 0)

  const namingConvention = tagStyle === 'technical'
    ? '[Category]_[Subcategory]_[Key]_[BPM]_[Name] — e.g., SYN_Lead_Cmin_140_Shimmer'
    : tagStyle === 'genre-based'
      ? '[Genre]_[Category]_[Mood]_[BPM] — e.g., Trap_Kick_Hard_140'
      : tagStyle === 'mood-based'
        ? '[Mood]_[Category]_[Energy]_[Key] — e.g., Dark_Pad_High_Fm'
        : '[Category]_[Subcategory]_[Tags]_[BPM]_[Key] — e.g., DRUM_Kick_Punchy_140_C'

  const folderStructure = [
    '📁 Samples/',
    '  📁 01_Drums/',
    '    📁 Kicks/',
    '    📁 Snares/',
    '    📁 HiHats/',
    '    📁 Loops/',
    '  📁 02_Bass/',
    '  📁 03_Synth/',
    '  📁 04_Vocals/',
    '  📁 05_FX/',
    '  📁 06_Instruments/',
    '  📁 07_Loops/',
    '  📁 08_OneShots/',
    '  📁 09_Multi/',
    '  📁 10_Archive/',
  ]

  const metadataFields = ['Name', 'Category', 'Subcategory', 'Key', 'BPM', 'Duration', 'Tags', 'Rating', 'Date Added', 'Format', 'Size']
  const autoTagRules = [
    'Auto-detect BPM from filename or analysis',
    'Auto-detect key from audio analysis',
    'Tag by file format (WAV/AIFF/FLAC)',
    'Tag by duration category (<2s: one-shot, >4s: loop)',
    'Auto-tag stereo/mono',
  ]

  return {
    librarySize,
    tagStyle,
    totalCategories: categories.length,
    totalTags,
    categories,
    namingConvention,
    folderStructure,
    metadata: { fields: metadataFields, autoTagRules },
    searchTips: [
      'Use BPM range search: 120-130 for versatile results',
      'Combine tags: "dark" + "pad" + "Fm" for precise results',
      'Rate your top samples (5-star) for quick access',
      'Use "similar" search based on spectral analysis',
      'Create smart playlists by genre + BPM + key',
    ],
    stats: {
      avgTagsPerSample: Math.round(totalTags / categories.length * 10) / 10,
      untaggedCount: Math.floor(librarySize * 0.05),
      duplicateEstimate: Math.floor(librarySize * 0.03),
    },
  }
}

function generateTags(rng: () => number, style: string, category: string, subcategory: string): string[] {
  const genreTags = ['trap', 'house', 'lofi', 'pop', 'hiphop', 'rnb', 'techno', 'ambient', 'cinematic', 'dubstep']
  const moodTags = ['dark', 'bright', 'warm', 'cold', 'aggressive', 'smooth', 'ethereal', 'gritty', 'dreamy', 'punchy']
  const techTags = ['analog', 'digital', 'processed', 'raw', 'vintage', 'modern', 'layered', 'minimal', 'complex', 'clean']
  const energyTags = ['high-energy', 'low-energy', 'medium-energy', 'building', 'decaying', 'sustained', 'staccato']

  const allTags: string[] = []
  if (style === 'genre-based' || style === 'hybrid') allTags.push(...pickN(rng, genreTags, 2))
  if (style === 'mood-based' || style === 'hybrid') allTags.push(...pickN(rng, moodTags, 2))
  if (style === 'technical' || style === 'hybrid') allTags.push(...pickN(rng, techTags, 2))
  allTags.push(...pickN(rng, energyTags, 1))
  allTags.push(category.toLowerCase(), subcategory.toLowerCase())

  return [...new Set(allTags)].slice(0, 6)
}

function formatSampleOrg(r: SampleOrgResult): string {
  const lines: string[] = []
  lines.push(`# Sample Library Organization — ${r.tagStyle} style`)
  lines.push('')
  lines.push(`**Library size:** ${r.librarySize.toLocaleString()} samples  |  **Categories:** ${r.totalCategories}  |  **Total tags:** ${r.totalTags}`)
  lines.push('')
  lines.push('## Category Breakdown')
  lines.push('')
  lines.push('| Category | Count | Subcategories | Sample Tags |')
  lines.push('|----------|-------|---------------|-------------|')
  r.categories.forEach(c => {
    const subSummary = c.subcategories.map(s => `${s.name}(${s.count})`).join(', ')
    const sampleTags = c.subcategories[0]?.tags.slice(0, 3).join(', ') || ''
    lines.push(`| ${c.name} | ${c.count} | ${subSummary} | ${sampleTags} |`)
  })
  lines.push('')
  lines.push('## Naming Convention')
  lines.push('')
  lines.push(`\`${r.namingConvention}\``)
  lines.push('')
  lines.push('## Folder Structure')
  r.folderStructure.forEach(f => lines.push(f))
  lines.push('')
  lines.push('## Metadata Fields')
  lines.push('')
  lines.push(r.metadata.fields.map(f => `\`${f}\``).join(' · '))
  lines.push('')
  lines.push('## Auto-Tag Rules')
  r.metadata.autoTagRules.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push('## Library Stats')
  lines.push('')
  lines.push(`- **Avg tags/sample:** ${r.stats.avgTagsPerSample}`)
  lines.push(`- **Untagged samples:** ${r.stats.untaggedCount}`)
  lines.push(`- **Estimated duplicates:** ${r.stats.duplicateEstimate}`)
  lines.push('')
  lines.push('## Search Tips')
  r.searchTips.forEach(t => lines.push(`- ${t}`))
  return lines.join('\n')
}

// ─── Tool 6: Music Copyright Checker ─────────────────────────────────────────

interface CopyrightInput {
  title?: string
  artist?: string
  isrc?: string
  checkType?: string  // "similarity", "sample-clearance", "composition", "full"
}

interface SimilarWork {
  title: string
  artist: string
  similarity: number
  matchType: string
  riskLevel: string
  notes: string
}

interface CopyrightResult {
  title: string
  artist: string
  isrc: string
  checkType: string
  overallRisk: string
  overallRiskScore: number
  similarWorks: SimilarWork[]
  compositionCheck: {
    melodyOriginality: number
    harmonyOriginality: number
    rhythmOriginality: number
    lyricsOriginality: number
    arrangementOriginality: number
  }
  sampleClearance: {
    detectedSamples: string[]
    clearanceRequired: boolean
    estimatedCost: string
    timeline: string
  }
  recommendations: string[]
  legalNotes: string[]
}

function checkCopyright(input: CopyrightInput): CopyrightResult {
  const seedStr = `${input.title}-${input.artist}-${input.isrc}-${input.checkType}`
  const rng = mulberry32(hashStr(seedStr))

  const title = input.title || 'Untitled Track'
  const artist = input.artist || 'Unknown Artist'
  const isrc = input.isrc || generateISRC(rng)
  const checkType = input.checkType || pick(rng, ['similarity', 'sample-clearance', 'composition', 'full'])

  const numSimilar = Math.floor(2 + rng() * 5)
  const similarWorks: SimilarWork[] = []
  const matchTypes = ['Melodic similarity', 'Harmonic similarity', 'Rhythmic pattern', 'Lyrical theme', 'Timbre/Production', 'Structural']
  const riskLevels = ['Low', 'Medium', 'High', 'Critical']

  for (let i = 0; i < numSimilar; i++) {
    const similarity = Math.round((20 + rng() * 65) * 10) / 10
    const risk = similarity > 70 ? 'Critical' : similarity > 50 ? 'High' : similarity > 30 ? 'Medium' : 'Low'
    similarWorks.push({
      title: `Similar Track ${i + 1}`,
      artist: `Artist ${String.fromCharCode(65 + i)}`,
      similarity,
      matchType: pick(rng, matchTypes),
      riskLevel: risk,
      notes: similarity > 50 ? 'Requires further legal review' : 'Likely coincidental',
    })
  }

  const maxSimilarity = Math.max(...similarWorks.map(s => s.similarity), 0)
  const overallRiskScore = Math.round(maxSimilarity)
  const overallRisk = overallRiskScore > 70 ? 'HIGH' : overallRiskScore > 40 ? 'MEDIUM' : 'LOW'

  const detectedSamples = checkType === 'sample-clearance' || checkType === 'full'
    ? pickN(rng, ['Drum break (1970s funk)', 'Vocal chop (unknown)', 'Melodic loop (royalty-free)', 'Sound effect (CC0)', 'Bass line (original)'], Math.floor(1 + rng() * 3))
    : []

  return {
    title, artist, isrc, checkType,
    overallRisk,
    overallRiskScore,
    similarWorks,
    compositionCheck: {
      melodyOriginality: Math.round(60 + rng() * 35),
      harmonyOriginality: Math.round(50 + rng() * 40),
      rhythmOriginality: Math.round(55 + rng() * 35),
      lyricsOriginality: Math.round(70 + rng() * 25),
      arrangementOriginality: Math.round(60 + rng() * 30),
    },
    sampleClearance: {
      detectedSamples,
      clearanceRequired: detectedSamples.length > 0 && rng() > 0.3,
      estimatedCost: detectedSamples.length > 0 ? `$${Math.floor(500 + rng() * 4500)}` : '$0',
      timeline: detectedSamples.length > 0 ? `${Math.floor(2 + rng() * 10)} weeks` : 'N/A',
    },
    recommendations: [
      overallRisk === 'HIGH' ? 'URGENT: Consult music attorney before release' : 'Standard clearance process recommended',
      maxSimilarity > 50 ? `Address similarity with "${similarWorks[0]?.title}" (${similarWorks[0]?.similarity}% match)` : 'No critical similarities detected',
      detectedSamples.length > 0 ? `Clear ${detectedSamples.length} detected samples before distribution` : 'No uncleared samples detected',
      'Register with PRO (ASCAP/BMI/SESAC) for performance royalties',
      'Consider Content ID registration for YouTube monetization',
    ],
    legalNotes: [
      'Copyright automatically applies upon fixation in tangible medium',
      'Similarity does not equal infringement — substantial access must be proven',
      'Fair use is a defense, not a right — case-by-case determination',
      'International copyright varies by territory — check local laws',
      'Sample clearance requires both master and composition rights',
    ],
  }
}

function generateISRC(rng: () => number): string {
  const countries = ['US', 'GB', 'DE', 'JP', 'KR', 'FR', 'AU', 'CA']
  const country = pick(rng, countries)
  const year = 2020 + Math.floor(rng() * 6)
  const code = String(Math.floor(rng() * 100000)).padStart(5, '0')
  return `${country}-${year}-${code}`
}

function formatCopyright(r: CopyrightResult): string {
  const lines: string[] = []
  lines.push(`# Copyright Check: "${r.title}" by ${r.artist}`)
  lines.push('')
  lines.push(`**ISRC:** ${r.isrc}  |  **Check type:** ${r.checkType}  |  **Overall risk:** ${r.overallRisk} (${r.overallRiskScore}/100)`)
  lines.push('')
  lines.push('## Similar Works Analysis')
  lines.push('')
  lines.push('| # | Title | Artist | Match Type | Similarity | Risk |')
  lines.push('|---|-------|--------|------------|------------|------|')
  r.similarWorks.forEach((s, i) => {
    lines.push(`| ${i + 1} | ${s.title} | ${s.artist} | ${s.matchType} | ${s.similarity}% | ${s.riskLevel} |`)
  })
  lines.push('')
  lines.push('## Composition Originality Scores')
  lines.push('')
  lines.push(`- **Melody:** ${r.compositionCheck.melodyOriginality}/100`)
  lines.push(`- **Harmony:** ${r.compositionCheck.harmonyOriginality}/100`)
  lines.push(`- **Rhythm:** ${r.compositionCheck.rhythmOriginality}/100`)
  lines.push(`- **Lyrics:** ${r.compositionCheck.lyricsOriginality}/100`)
  lines.push(`- **Arrangement:** ${r.compositionCheck.arrangementOriginality}/100`)
  lines.push('')
  lines.push('## Sample Clearance')
  lines.push('')
  if (r.sampleClearance.detectedSamples.length > 0) {
    lines.push(`**Detected samples:** ${r.sampleClearance.detectedSamples.join(', ')}`)
    lines.push(`**Clearance required:** ${r.sampleClearance.clearanceRequired ? 'Yes' : 'No'}`)
    lines.push(`**Estimated cost:** ${r.sampleClearance.estimatedCost}`)
    lines.push(`**Timeline:** ${r.sampleClearance.timeline}`)
  } else {
    lines.push('No samples detected — original composition.')
  }
  lines.push('')
  lines.push('## Recommendations')
  r.recommendations.forEach(rec => lines.push(`- ${rec}`))
  lines.push('')
  lines.push('## Legal Notes')
  r.legalNotes.forEach(n => lines.push(`- ${n}`))
  return lines.join('\n')
}

// ─── Tool 7: Arrangement Structurer ──────────────────────────────────────────

interface ArrangementInput {
  genre?: string
  duration?: number  // in seconds
  mood?: string
  ensembleSize?: string  // "solo", "small", "medium", "large", "orchestra"
}

interface ArrangementSection {
  name: string
  startBar: number
  endBar: number
  duration: string
  energy: number
  description: string
  instruments: string[]
  dynamics: string
  role: string
}

interface ArrangementResult {
  genre: string
  duration: number
  mood: string
  ensembleSize: string
  tempo: number
  key: string
  timeSignature: string
  totalBars: number
  sections: ArrangementSection[]
  instrumentation: {
    core: string[]
    supporting: string[]
    accent: string[]
  }
  dynamics: {
    overall: string
    peak: string
    contrast: string
  }
  orchestration: string[]
  tips: string[]
}

function structureArrangement(input: ArrangementInput): ArrangementResult {
  const seedStr = `${input.genre}-${input.duration}-${input.mood}-${input.ensembleSize}`
  const rng = mulberry32(hashStr(seedStr))

  const genre = input.genre || pick(rng, GENRES)
  const duration = input.duration || Math.floor(180 + rng() * 180)
  const mood = input.mood || pick(rng, MOODS)
  const ensembleSize = input.ensembleSize || pick(rng, ['solo', 'small', 'medium', 'large', 'orchestra'])
  const tempo = Math.floor(70 + rng() * 100)
  const key = pick(rng, ALL_KEYS)
  const timeSignature = '4/4'
  const totalBars = Math.floor(duration / (60 / tempo) * 4 / 4)

  const sectionTemplates = [
    { name: 'Intro', energy: 2, role: 'Setup atmosphere and establish key' },
    { name: 'Verse 1', energy: 4, role: 'Present main theme, build narrative' },
    { name: 'Pre-Chorus', energy: 5, role: 'Build tension toward chorus' },
    { name: 'Chorus', energy: 8, role: 'Main hook, highest energy' },
    { name: 'Verse 2', energy: 4, role: 'Develop theme, add variation' },
    { name: 'Pre-Chorus', energy: 6, role: 'Build tension (slight variation)' },
    { name: 'Chorus', energy: 8, role: 'Main hook repeat' },
    { name: 'Bridge', energy: 5, role: 'Contrast section, new harmonic area' },
    { name: 'Solo/Break', energy: 6, role: 'Instrumental showcase' },
    { name: 'Final Chorus', energy: 9, role: 'Climactic hook with variations' },
    { name: 'Outro', energy: 3, role: 'Resolve and fade' },
  ]

  const ensembleInstruments: Record<string, { core: string[]; supporting: string[]; accent: string[] }> = {
    solo: { core: ['Piano'], supporting: ['Bass (solo)'], accent: ['Percussion'] },
    small: { core: ['Piano', 'Bass', 'Drums'], supporting: ['Guitar', 'Keys'], accent: ['Percussion', 'Horns'] },
    medium: { core: ['Drums', 'Bass', 'Guitar', 'Keys'], supporting: ['Synth Pad', 'Rhodes', 'Percussion'], accent: ['Horns', 'Strings', 'Backing Vocals'] },
    large: { core: ['Drums', 'Bass', 'Guitar', 'Keys', 'Lead Vocal'], supporting: ['Synth', 'Horns', 'Strings', 'Backing Vocals'], accent: ['Percussion', 'Brass', 'Woodwinds', 'Choir'] },
    orchestra: { core: ['Strings', 'Woodwinds', 'Brass'], supporting: ['Percussion', 'Harp', 'Piano'], accent: ['Choir', 'Timpani', 'Celesta', 'Harp'] },
  }

  const inst = ensembleInstruments[ensembleSize] || ensembleInstruments['medium']

  const sections: ArrangementSection[] = []
  let currentBar = 1
  const barsPerSection = Math.max(2, Math.floor(totalBars / sectionTemplates.length))

  sectionTemplates.forEach((tpl, i) => {
    const sectionBars = i === 0 || i === sectionTemplates.length - 1 ? Math.max(2, barsPerSection - 2) : barsPerSection
    if (currentBar + sectionBars > totalBars) return

    const sectionInstruments = i < 2
      ? inst.core.slice(0, Math.ceil(inst.core.length / 2))
      : i >= sectionTemplates.length - 2
        ? [...inst.core, ...inst.supporting, ...inst.accent.slice(0, 1)]
        : [...inst.core, ...inst.supporting.slice(0, 2)]

    sections.push({
      name: tpl.name,
      startBar: currentBar,
      endBar: currentBar + sectionBars - 1,
      duration: `${Math.round(sectionBars * 4 * 60 / tempo)}s`,
      energy: tpl.energy,
      description: tpl.role,
      instruments: sectionInstruments,
      dynamics: tpl.energy >= 7 ? 'ff (fortissimo)' : tpl.energy >= 5 ? 'mf (mezzo-forte)' : 'mp (mezzo-piano)',
      role: tpl.role,
    })
    currentBar += sectionBars
  })

  const dynamicsLevels = ['pp', 'p', 'mp', 'mf', 'f', 'ff']
  const peakSection = sections.reduce((max, s) => s.energy > max.energy ? s : max, sections[0])

  return {
    genre, duration, mood, ensembleSize, tempo, key, timeSignature, totalBars,
    sections,
    instrumentation: inst,
    dynamics: {
      overall: `${dynamicsLevels[Math.floor(rng() * 3)]} → ${dynamicsLevels[3 + Math.floor(rng() * 3)]}`,
      peak: `${peakSection.name} (energy ${peakSection.energy}/10)`,
      contrast: `${sections.length} sections, ${Math.max(...sections.map(s => s.energy)) - Math.min(...sections.map(s => s.energy))} energy levels`,
    },
    orchestration: [
      `Core: ${inst.core.join(', ')} — always present, foundation`,
      `Supporting: ${inst.supporting.join(', ')} — add in verses/choruses`,
      `Accent: ${inst.accent.join(', ')} — highlights and transitions`,
      ensembleSize === 'orchestra' ? 'Use divisi in strings for rich harmonies' : 'Layer synths for width in choruses',
      `Genre tip: ${genre} typically uses ${pick(rng, ['sparse', 'moderate', 'dense'])} arrangement`,
    ],
    tips: [
      `${sections.length} sections over ${totalBars} bars — average ${Math.round(totalBars / sections.length)} bars/section`,
      `Peak energy at "${peakSection.name}" — ensure it feels like the climax`,
      `Ensemble: ${ensembleSize} (${inst.core.length + inst.supporting.length + inst.accent.length} instruments)`,
      'Use energy contour to guide listener attention',
      'Contrast is key — vary instrumentation between sections',
    ],
  }
}

function formatArrangement(r: ArrangementResult): string {
  const lines: string[] = []
  lines.push(`# Arrangement Structure: ${r.genre} — ${r.mood}`)
  lines.push('')
  lines.push(`**Duration:** ${r.duration}s  |  **Tempo:** ${r.tempo} BPM  |  **Key:** ${r.key}  |  **Time:** ${r.timeSignature}  |  **Ensemble:** ${r.ensembleSize}  |  **Total bars:** ${r.totalBars}`)
  lines.push('')
  lines.push('## Section Map')
  lines.push('')
  lines.push('| Section | Bars | Duration | Energy | Dynamics | Instruments |')
  lines.push('|---------|------|----------|--------|----------|-------------|')
  r.sections.forEach(s => {
    const energyBar = '█'.repeat(s.energy) + '░'.repeat(10 - s.energy)
    lines.push(`| ${s.name} | ${s.startBar}-${s.endBar} | ${s.duration} | ${energyBar} | ${s.dynamics} | ${s.instruments.join(', ')} |`)
  })
  lines.push('')
  lines.push('## Instrumentation')
  lines.push('')
  lines.push(`- **Core:** ${r.instrumentation.core.join(', ')}`)
  lines.push(`- **Supporting:** ${r.instrumentation.supporting.join(', ')}`)
  lines.push(`- **Accent:** ${r.instrumentation.accent.join(', ')}`)
  lines.push('')
  lines.push('## Dynamics')
  lines.push('')
  lines.push(`- **Overall range:** ${r.dynamics.overall}`)
  lines.push(`- **Peak:** ${r.dynamics.peak}`)
  lines.push(`- **Contrast:** ${r.dynamics.contrast}`)
  lines.push('')
  lines.push('## Orchestration Notes')
  r.orchestration.forEach(o => lines.push(`- ${o}`))
  lines.push('')
  lines.push('## Tips')
  r.tips.forEach(t => lines.push(`- ${t}`))
  return lines.join('\n')
}

// ─── Tool 8: AI Music Generator Prompt ───────────────────────────────────────

interface AIPromptInput {
  genre?: string
  mood?: string
  duration?: number
  tempo?: number
  model?: string
  complexity?: number  // 1-5
}

interface AIPromptResult {
  model: string
  genre: string
  mood: string
  duration: number
  tempo: number
  complexity: number
  prompt: string
  negativePrompt: string
  parameters: Record<string, string | number>
  styleTags: string[]
  structure: string
  instrumentation: string
  productionNotes: string[]
  alternatives: { model: string; prompt: string }[]
  tips: string[]
}

function generateAIPrompt(input: AIPromptInput): AIPromptResult {
  const seedStr = `${input.genre}-${input.mood}-${input.duration}-${input.tempo}-${input.model}-${input.complexity}`
  const rng = mulberry32(hashStr(seedStr))

  const genre = input.genre || pick(rng, GENRES)
  const mood = input.mood || pick(rng, MOODS)
  const duration = input.duration || Math.floor(30 + rng() * 150)
  const tempo = input.tempo || Math.floor(70 + rng() * 100)
  const model = input.model || pick(rng, ['suno', 'udio', 'stable-audio', 'mubert'])
  const complexity = input.complexity || Math.ceil(rng() * 5)

  const styleDescriptors: Record<string, string[]> = {
    Pop: ['catchy', 'radio-friendly', 'polished', 'mainstream'],
    Rock: ['distorted', 'energetic', 'raw', 'powerful'],
    'Hip-Hop': ['boom-bap', 'trap-influenced', 'hard-hitting', 'street'],
    'R&B': ['smooth', 'soulful', 'groovy', 'sensual'],
    Jazz: ['improvisational', 'swinging', 'complex harmonies', 'acoustic'],
    Electronic: ['synthesized', 'pulsating', 'futuristic', 'danceable'],
    Classical: ['orchestral', 'symphonic', 'romantic era', 'acoustic'],
    Ambient: ['atmospheric', 'textural', 'meditative', 'spacious'],
    'Lo-Fi': ['chill', 'nostalgic', 'dusty', 'relaxed'],
    Metal: ['heavy', 'aggressive', 'fast', 'dark'],
  }

  const moodDescriptors: Record<string, string[]> = {
    Happy: ['uplifting', 'bright', 'joyful', 'major key'],
    Sad: ['melancholic', 'minor key', 'emotional', 'slow'],
    Energetic: ['driving', 'fast-paced', 'intense', 'powerful'],
    Melancholic: ['wistful', 'bittersweet', 'reflective', 'atmospheric'],
    Dreamy: ['ethereal', 'floating', 'ambient', 'reverb-heavy'],
    Aggressive: ['hard-hitting', 'distorted', 'intense', 'heavy'],
    Romantic: ['warm', 'tender', 'intimate', 'lush'],
    Mysterious: ['dark', 'enigmatic', 'tension-building', 'minor key'],
    Uplifting: ['inspiring', 'anthemic', 'building', 'major key'],
    Dark: ['ominous', 'brooding', 'minor key', 'heavy bass'],
    Peaceful: ['calm', 'serene', 'gentle', 'acoustic'],
    Tense: ['suspenseful', 'building', 'dissonant', 'driving'],
  }

  const genreStyles = styleDescriptors[genre] || styleDescriptors['Pop']
  const moodStyles = moodDescriptors[mood] || moodDescriptors['Happy']

  const selectedStyles = [...pickN(rng, genreStyles, 2), ...pickN(rng, moodStyles, 2)]
  const styleTags = [...new Set(selectedStyles)]

  const instruments = pickN(rng, INSTRUMENTS, Math.min(complexity + 1, 6))

  const prompt = [
    `${genre} track`,
    `${mood} mood`,
    styleTags.join(', '),
    `featuring ${instruments.join(', ')}`,
    `${tempo} BPM`,
    complexity >= 3 ? 'complex arrangement' : 'simple arrangement',
    complexity >= 4 ? 'with dynamic builds and drops' : '',
    `${duration} seconds`,
  ].filter(Boolean).join(', ')

  const negativePrompts: Record<string, string> = {
    suno: 'vocals, low quality, distorted, noisy, amateur, off-key, out of tune, clipping',
    udio: 'low quality, distorted, noisy, amateur, off-key, clipping, bad mix',
    'stable-audio': 'low quality, distorted, noisy, clipping, bad mix, amateur, off-key',
    mubert: 'low quality, distorted, noisy, amateur, off-key, clipping, repetitive',
  }

  const modelParams: Record<string, Record<string, string | number>> = {
    suno: { style: `${genre}, ${mood}`, instrumental: 'false', custom: 'true' },
    udio: { prompt_style: `${genre} ${mood}`, duration: duration, quality: complexity >= 3 ? 'high' : 'standard' },
    'stable-audio': { genres: genre, moods: mood, duration: duration, tempo: tempo, cfg_scale: 7 + complexity },
    mubert: { genre: genre, mood: mood, duration: duration, tempo: tempo, complexity: complexity },
  }

  const alternatives = [
    { model: 'suno', prompt: `${genre} ${mood} track, ${tempo} BPM, ${styleTags.slice(0, 2).join(', ')}` },
    { model: 'udio', prompt: `${mood} ${genre} with ${instruments.slice(0, 3).join(', ')}, ${tempo} BPM` },
  ]

  return {
    model, genre, mood, duration, tempo, complexity,
    prompt,
    negativePrompt: negativePrompts[model] || negativePrompts['suno'],
    parameters: modelParams[model] || modelParams['suno'],
    styleTags,
    structure: complexity >= 4 ? 'Intro-Verse-Chorus-Verse-Chorus-Bridge-Chorus-Outro' : complexity >= 3 ? 'Intro-Verse-Chorus-Verse-Chorus-Outro' : 'Intro-Verse-Chorus-Outro',
    instrumentation: instruments.join(', '),
    productionNotes: [
      `Target duration: ${duration}s (${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')})`,
      `Tempo: ${tempo} BPM — ${tempo < 90 ? 'slow/groove' : tempo < 120 ? 'mid-tempo' : tempo < 150 ? 'upbeat' : 'fast/intense'}`,
      `Complexity: ${complexity}/5 — ${complexity >= 4 ? 'full arrangement with sections' : complexity >= 3 ? 'standard song structure' : 'minimal/loop-based'}`,
      `Model: ${model} — ${model === 'suno' ? 'best for vocals and full songs' : model === 'udio' ? 'best for audio quality' : model === 'stable-audio' ? 'best for instrumental/textural' : 'best for generative/loop-based'}`,
    ],
    alternatives,
    tips: [
      `For ${model}: ${model === 'suno' ? 'Use style tags and keep prompts concise' : model === 'udio' ? 'Detailed prompts work well, include instrumentation' : model === 'stable-audio' ? 'Focus on mood and texture descriptions' : 'Genre + mood + BPM is the sweet spot'}`,
      complexity >= 4 ? 'Complex prompts may need multiple generations to get right' : 'Simple prompts often yield more coherent results',
      `Add "instrumental" tag if you don't want vocals`,
      'Iterate: generate 3-4 variations and pick the best',
      'Post-process with mixing/mastering for professional results',
    ],
  }
}

function formatAIPrompt(r: AIPromptResult): string {
  const lines: string[] = []
  lines.push(`# AI Music Generation Prompt — ${r.model}`)
  lines.push('')
  lines.push(`**Genre:** ${r.genre}  |  **Mood:** ${r.mood}  |  **Tempo:** ${r.tempo} BPM  |  **Duration:** ${r.duration}s  |  **Complexity:** ${r.complexity}/5`)
  lines.push('')
  lines.push('## Prompt')
  lines.push('')
  lines.push(`> ${r.prompt}`)
  lines.push('')
  lines.push('## Negative Prompt')
  lines.push('')
  lines.push(`> ${r.negativePrompt}`)
  lines.push('')
  lines.push('## Parameters')
  lines.push('')
  Object.entries(r.parameters).forEach(([k, v]) => {
    lines.push(`- **${k}:** ${v}`)
  })
  lines.push('')
  lines.push('## Style Tags')
  lines.push('')
  lines.push(r.styleTags.map(t => `\`${t}\``).join(' '))
  lines.push('')
  lines.push('## Structure')
  lines.push('')
  lines.push(r.structure)
  lines.push('')
  lines.push('## Instrumentation')
  lines.push('')
  lines.push(r.instrumentation)
  lines.push('')
  lines.push('## Production Notes')
  r.productionNotes.forEach(n => lines.push(`- ${n}`))
  lines.push('')
  lines.push('## Alternative Models')
  r.alternatives.forEach(a => {
    lines.push(`- **${a.model}:** ${a.prompt}`)
  })
  lines.push('')
  lines.push('## Tips')
  r.tips.forEach(t => lines.push(`- ${t}`))
  return lines.join('\n')
}

// ─── Plugin Registration ─────────────────────────────────────────────────────

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Chord Progression Generator
  tools.register(defineTool({
    name: 'chord_progression_generator',
    description: 'Generate chord progressions with key analysis, harmonic function labeling, cadence detection, modal interchange suggestions, and alternative progressions',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"key":"C","genre":"Pop","mood":"Happy","bars":8,"complexity":3}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatChordProg(generateChordProgression(JSON.parse(args.input_data))) },
  }))

  // Tool 2: Melody Composer AI
  tools.register(defineTool({
    name: 'melody_composer_ai',
    description: 'Compose melodies with motif development, interval analysis, phrase structure, contour mapping, and development techniques (sequence, inversion, augmentation)',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"key":"C","scale":"Major (Ionian)","mood":"Happy","bars":8,"range":"C4-C6","motifLength":4}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMelody(composeMelody(JSON.parse(args.input_data))) },
  }))

  // Tool 3: Mixing Engine Advisor
  tools.register(defineTool({
    name: 'mixing_engine_advisor',
    description: 'Mixing advice with EQ recommendations, compression settings, spatial processing, bus routing, signal chain, and metering targets',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"genre":"Pop","trackType":"vocal","problem":"muddy","budget":"mid"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMixing(adviseMixing(JSON.parse(args.input_data))) },
  }))

  // Tool 4: Mastering Chain Designer
  tools.register(defineTool({
    name: 'mastering_chain_designer',
    description: 'Design mastering chain with loudness standards (LUFS), platform-specific targets, EQ, stereo processing, dither, and format recommendations',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"genre":"Electronic","targetPlatform":"spotify","loudnessTarget":"streaming","dynamicRange":6}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMastering(designMasteringChain(JSON.parse(args.input_data))) },
  }))

  // Tool 5: Sample Library Organizer
  tools.register(defineTool({
    name: 'sample_library_organizer',
    description: 'Organize sample library with category breakdown, tagging system, naming convention, folder structure, metadata fields, and auto-tag rules',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"librarySize":2000,"tagStyle":"hybrid"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSampleOrg(organizeSamples(JSON.parse(args.input_data))) },
  }))

  // Tool 6: Music Copyright Checker
  tools.register(defineTool({
    name: 'music_copyright_checker',
    description: 'Music copyright detection with similarity analysis, composition originality scores, sample clearance requirements, and legal recommendations',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"title":"My Song","artist":"Artist","checkType":"full"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCopyright(checkCopyright(JSON.parse(args.input_data))) },
  }))

  // Tool 7: Arrangement Structurer
  tools.register(defineTool({
    name: 'arrangement_structurer',
    description: 'Arrangement structure with section mapping, energy contour, instrumentation layers, dynamics, orchestration notes, and genre-specific advice',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"genre":"Pop","duration":210,"mood":"Energetic","ensembleSize":"medium"}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatArrangement(structureArrangement(JSON.parse(args.input_data))) },
  }))

  // Tool 8: AI Music Generator Prompt
  tools.register(defineTool({
    name: 'ai_music_generator_prompt',
    description: 'AI music generation prompt engineering with model-specific parameters (Suno/Udio/Stable Audio/Mubert), style tags, negative prompts, and structure planning',
    parameters: { input_data: { type: 'string' as const, required: true, description: '{"genre":"Electronic","mood":"Dreamy","duration":60,"tempo":120,"model":"suno","complexity":3}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatAIPrompt(generateAIPrompt(JSON.parse(args.input_data))) },
  }))
}
