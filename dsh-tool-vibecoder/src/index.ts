/**
 * dsh-tool-vibecoder — Vibe Coding Design System Plugin for DeepSeek Harness
 *
 * Provides 8 tools for design token generation, component specification,
 * style guide building, responsive advice, accessibility auditing,
 * version management, code generation, and design review.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ============================================================================
// INTERFACES
// ============================================================================

/** Input for design_token_generator */
interface ThemeInput {
  name: string
  primary_color: string
  mood: 'professional' | 'playful' | 'minimal' | 'bold'
  target: 'web' | 'mobile' | 'both'
}

/** A single design token value */
interface DesignToken {
  name: string
  value: string
  description: string
}

/** Complete token set output from analyzeDesignTokens */
interface TokenSet {
  name: string
  mood: string
  target: string
  colors: DesignToken[]
  typography: DesignToken[]
  spacing: DesignToken[]
  shadows: DesignToken[]
  breakpoints: DesignToken[]
  borderRadius: DesignToken[]
}

/** Input for component_spec_creator */
interface ComponentSpecInput {
  component_name: string
  variant_count: number
  props: string[]
  states: string[]
}

/** A component variant definition */
interface ComponentVariant {
  name: string
  description: string
  props: Record<string, string>
}

/** Full component spec output */
interface ComponentSpec {
  name: string
  variants: ComponentVariant[]
  propsInterface: PropDefinition[]
  usageExamples: string[]
}

/** Prop definition for component interface */
interface PropDefinition {
  name: string
  type: string
  required: boolean
  description: string
  default_value: string
}

/** Input for style_guide_builder */
interface StyleGuideInput {
  brand_name: string
  color_palette: string[]
  typography: { heading_font: string; body_font: string; mono_font: string }
  spacing_base: number
}

/** Style guide output */
interface StyleGuide {
  brand: string
  colorSystem: ColorSystemEntry[]
  typeScale: TypeScaleEntry[]
  spacingRules: SpacingRule[]
  elevationSystem: ElevationLevel[]
}

interface ColorSystemEntry {
  role: string
  hex: string
  usage: string
  contrast_white: number
  contrast_black: number
}

interface TypeScaleEntry {
  level: string
  size: number
  line_height: number
  weight: number
  usage: string
}

interface SpacingRule {
  name: string
  value: number
  rem: string
  usage: string
}

interface ElevationLevel {
  level: number
  name: string
  shadow: string
  usage: string
}

/** Input for responsive_breakpoint_advisor */
interface BreakpointInput {
  device_targets: string[]
  content_type: 'dashboard' | 'landing' | 'ecommerce' | 'blog'
}

/** Breakpoint recommendation output */
interface BreakpointRecommendation {
  breakpoints: BreakpointDef[]
  layoutStrategy: string
  containerWidths: Record<string, string>
  gridColumns: Record<string, number>
  notes: string[]
}

interface BreakpointDef {
  name: string
  min_width: number
  max_width: number | null
  target_devices: string[]
}

/** Input for accessibility_auditor */
interface AccessibilityInput {
  color_pairs: { foreground: string; background: string; large_text?: boolean }[]
  font_sizes: { element: string; size_px: number; bold?: boolean }[]
  interactive_elements: { element: string; has_label: boolean; has_aria: boolean; keyboard_accessible: boolean }[]
}

/** Accessibility audit output */
interface AccessibilityReport {
  overall_grade: 'AAA' | 'AA' | 'A' | 'Fail'
  colorResults: ColorContrastResult[]
  fontSizeResults: FontSizeResult[]
  interactiveResults: InteractiveElementResult[]
  summary: { pass: number; warn: number; fail: number }
  recommendations: string[]
}

interface ColorContrastResult {
  pair: string
  ratio: number
  AA_normal: boolean
  AA_large: boolean
  AAA_normal: boolean
  AAA_large: boolean
  suggestion: string
}

interface FontSizeResult {
  element: string
  size_px: number
  status: 'pass' | 'warn' | 'fail'
  suggestion: string
}

interface InteractiveElementResult {
  element: string
  has_label: boolean
  has_aria: boolean
  keyboard_accessible: boolean
  status: 'pass' | 'fail'
  issues: string[]
}

/** Input for design_system_versioner */
interface VersionInput {
  current_version: string
  changes: { type: 'breaking' | 'feature' | 'fix' | 'refactor'; description: string }[]
  components_affected: string[]
}

/** Version bump output */
interface VersionResult {
  new_version: string
  bump_type: 'major' | 'minor' | 'patch'
  changelog: ChangelogEntry[]
  migration_guide: string[]
  affected_components: string[]
}

interface ChangelogEntry {
  type: string
  description: string
  component: string
}

/** Input for code_output_generator */
interface CodeGenInput {
  tokens: Record<string, string>
  framework: 'react' | 'vue' | 'svelte' | 'html+css'
  component_name: string
}

/** Code generation output */
interface CodeGenResult {
  framework: string
  componentName: string
  files: CodeFile[]
  dependencies: string[]
  notes: string[]
}

interface CodeFile {
  filename: string
  language: string
  content: string
}

/** Input for design_review_checker */
interface DesignReviewInput {
  design_spec: string
  checklist_items: string[]
}

/** Design review output */
interface DesignReviewReport {
  total_items: number
  passed: number
  failed: number
  warnings: number
  score: number
  items: ReviewItem[]
  overall_verdict: 'approved' | 'needs_revision' | 'rejected'
  improvement_suggestions: string[]
}

interface ReviewItem {
  criterion: string
  status: 'pass' | 'fail' | 'warning'
  detail: string
  suggestion: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Seeded pseudo-random number generator for deterministic output.
 * Uses a simple mulberry32 algorithm.
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

/** Convert hex color to RGB tuple */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  return {
    r: parseInt(full.substring(0, 2), 16),
    g: parseInt(full.substring(2, 4), 16),
    b: parseInt(full.substring(4, 6), 16),
  }
}

/** Calculate relative luminance per WCAG 2.1 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/** Calculate contrast ratio between two hex colors */
function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1)
  const c2 = hexToRgb(hex2)
  const l1 = relativeLuminance(c1.r, c1.g, c1.b)
  const l2 = relativeLuminance(c2.r, c2.g, c2.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Lighten or darken a hex color by a percentage (-100 to 100) */
function adjustColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  const adjust = (c: number) => {
    const v = percent >= 0
      ? c + ((255 - c) * percent) / 100
      : c + (c * percent) / 100
    return Math.max(0, Math.min(255, Math.round(v)))
  }
  const r = adjust(rgb.r)
  const g = adjust(rgb.g)
  const b = adjust(rgb.b)
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

/** Generate a complementary color */
function complementaryColor(hex: string): string {
  const rgb = hexToRgb(hex)
  return '#' + [255 - rgb.r, 255 - rgb.g, 255 - rgb.b]
    .map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0'))
    .join('')
}

/** Generate analogous colors */
function analogousColors(hex: string): string[] {
  const rgb = hexToRgb(hex)
  const shift = 30
  return [
    adjustColor(hex, shift),
    adjustColor(hex, -shift),
  ]
}

/** Convert hex to HSL for manipulation */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex)
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/** Convert HSL back to hex */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Generate a palette of shades (50-950) from a base color */
function generateShades(hex: string): DesignToken[] {
  const hsl = hexToHsl(hex)
  const stops = [
    { name: '50', l: 97 }, { name: '100', l: 94 }, { name: '200', l: 86 },
    { name: '300', l: 76 }, { name: '400', l: 64 }, { name: '500', l: hsl.l },
    { name: '600', l: hsl.l - 12 }, { name: '700', l: hsl.l - 24 },
    { name: '800', l: hsl.l - 36 }, { name: '900', l: hsl.l - 48 }, { name: '950', l: hsl.l - 56 },
  ]
  return stops.map(s => ({
    name: s.name,
    value: hslToHex(hsl.h, hsl.s, Math.max(5, Math.min(98, s.l))),
    description: `Shade ${s.name} — ${s.l > 70 ? 'light' : s.l > 40 ? 'medium' : 'dark'} tone`,
  }))
}

/** Pick a random element from array using seeded random */
function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ============================================================================
// TOOL 1: design_token_generator
// ============================================================================

function analyzeDesignTokens(data: ThemeInput): TokenSet {
  const rng = createSeededRandom(data.name + data.primary_color + data.mood)
  const primary = data.primary_color

  // Generate color tokens
  const primaryShades = generateShades(primary)
  const secondaryBase = hslToHex(
    (hexToHsl(primary).h + 150 + Math.floor(rng() * 60)) % 360,
    hexToHsl(primary).s,
    hexToHsl(primary).l
  )
  const secondaryShades = generateShades(secondaryBase)
  const neutralShades = generateShades('#64748b')

  const colors: DesignToken[] = [
    ...primaryShades.map(t => ({ ...t, description: `Primary ${t.description}` })),
    ...secondaryShades.map(t => ({ ...t, description: `Secondary ${t.description}` })),
    ...neutralShades.map(t => ({ ...t, description: `Neutral ${t.description}` })),
    { name: 'success', value: '#22c55e', description: 'Success state color' },
    { name: 'warning', value: '#f59e0b', description: 'Warning state color' },
    { name: 'error', value: '#ef4444', description: 'Error state color' },
    { name: 'info', value: '#3b82f6', description: 'Info state color' },
  ]

  // Generate typography tokens
  const typeScales: Record<string, number[]> = {
    professional: [12, 14, 16, 18, 20, 24, 30, 36, 48, 60],
    playful: [11, 13, 15, 18, 21, 26, 32, 40, 52, 68],
    minimal: [12, 14, 16, 18, 20, 24, 28, 32, 40, 48],
    bold: [14, 16, 20, 24, 28, 36, 44, 56, 72, 96],
  }
  const scale = typeScales[data.mood] || typeScales.professional
  const typeNames = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']
  const typography: DesignToken[] = typeNames.map((n, i) => ({
    name: n,
    value: `${scale[i]}px`,
    description: `Type scale ${n} — ${scale[i]}px`,
  }))

  // Generate spacing tokens
  const spacingUnit = data.mood === 'minimal' ? 4 : data.mood === 'bold' ? 8 : 6
  const spacing: DesignToken[] = Array.from({ length: 12 }, (_, i) => ({
    name: `space-${i + 1}`,
    value: `${(i + 1) * spacingUnit}px`,
    description: `Spacing level ${i + 1} — ${(i + 1) * spacingUnit}px`,
  }))

  // Generate shadow tokens
  const shadowOpacities = data.mood === 'minimal' ? [0.03, 0.05, 0.07, 0.1] :
    data.mood === 'bold' ? [0.15, 0.2, 0.25, 0.3] : [0.05, 0.08, 0.12, 0.16]
  const shadows: DesignToken[] = [
    { name: 'shadow-sm', value: `0 1px 2px rgba(0,0,0,${shadowOpacities[0]})`, description: 'Subtle shadow for cards' },
    { name: 'shadow-md', value: `0 4px 6px rgba(0,0,0,${shadowOpacities[1]})`, description: 'Medium shadow for dropdowns' },
    { name: 'shadow-lg', value: `0 10px 15px rgba(0,0,0,${shadowOpacities[2]})`, description: 'Large shadow for modals' },
    { name: 'shadow-xl', value: `0 20px 25px rgba(0,0,0,${shadowOpacities[3]})`, description: 'Extra large for popovers' },
  ]

  // Generate breakpoint tokens
  const bpBase = data.target === 'mobile'
    ? [{ name: 'sm', value: '320px' }, { name: 'md', value: '768px' }, { name: 'lg', value: '1024px' }]
    : data.target === 'web'
      ? [{ name: 'md', value: '768px' }, { name: 'lg', value: '1024px' }, { name: 'xl', value: '1280px' }, { name: '2xl', value: '1536px' }]
      : [{ name: 'sm', value: '320px' }, { name: 'md', value: '768px' }, { name: 'lg', value: '1024px' }, { name: 'xl', value: '1280px' }, { name: '2xl', value: '1536px' }]
  const breakpoints: DesignToken[] = bpBase.map(bp => ({
    name: bp.name,
    value: bp.value,
    description: `Breakpoint ${bp.name} — min-width: ${bp.value}`,
  }))

  // Generate border radius tokens
  const radiusBase = data.mood === 'playful' ? 12 : data.mood === 'minimal' ? 2 : 6
  const borderRadius: DesignToken[] = [
    { name: 'radius-sm', value: `${Math.max(1, radiusBase - 4)}px`, description: 'Small radius for tags' },
    { name: 'radius-md', value: `${radiusBase}px`, description: 'Medium radius for buttons' },
    { name: 'radius-lg', value: `${radiusBase * 2}px`, description: 'Large radius for cards' },
    { name: 'radius-full', value: '9999px', description: 'Full radius for pills/avatars' },
  ]

  return {
    name: data.name,
    mood: data.mood,
    target: data.target,
    colors,
    typography,
    spacing,
    shadows,
    breakpoints,
    borderRadius,
  }
}

function formatTokenResult(tokens: TokenSet): string {
  const lines: string[] = []
  lines.push(`# Design Token System: ${tokens.name}`)
  lines.push('')
  lines.push(`> Mood: \`${tokens.mood}\` | Target: \`${tokens.target}\``)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Colors
  lines.push('## Color Tokens')
  lines.push('')
  lines.push('| Token | Value | Description |')
  lines.push('|-------|-------|-------------|')
  for (const c of tokens.colors) {
    lines.push(`| \`${c.name}\` | \`${c.value}\` | ${c.description} |`)
  }
  lines.push('')

  // Typography
  lines.push('## Typography Tokens')
  lines.push('')
  lines.push('| Token | Value | Description |')
  lines.push('|-------|-------|-------------|')
  for (const t of tokens.typography) {
    lines.push(`| \`${t.name}\` | \`${t.value}\` | ${t.description} |`)
  }
  lines.push('')

  // Spacing
  lines.push('## Spacing Tokens')
  lines.push('')
  lines.push('| Token | Value | Description |')
  lines.push('|-------|-------|-------------|')
  for (const s of tokens.spacing) {
    lines.push(`| \`${s.name}\` | \`${s.value}\` | ${s.description} |`)
  }
  lines.push('')

  // Shadows
  lines.push('## Shadow Tokens')
  lines.push('')
  lines.push('| Token | Value | Description |')
  lines.push('|-------|-------|-------------|')
  for (const sh of tokens.shadows) {
    lines.push(`| \`${sh.name}\` | \`${sh.value}\` | ${sh.description} |`)
  }
  lines.push('')

  // Breakpoints
  lines.push('## Breakpoint Tokens')
  lines.push('')
  lines.push('| Token | Value | Description |')
  lines.push('|-------|-------|-------------|')
  for (const bp of tokens.breakpoints) {
    lines.push(`| \`${bp.name}\` | \`${bp.value}\` | ${bp.description} |`)
  }
  lines.push('')

  // Border Radius
  lines.push('## Border Radius Tokens')
  lines.push('')
  lines.push('| Token | Value | Description |')
  lines.push('|-------|-------|-------------|')
  for (const br of tokens.borderRadius) {
    lines.push(`| \`${br.name}\` | \`${br.value}\` | ${br.description} |`)
  }
  lines.push('')

  // CSS Variables output
  lines.push('---')
  lines.push('')
  lines.push('## CSS Custom Properties')
  lines.push('')
  lines.push('```css')
  lines.push(':root {')
  for (const c of tokens.colors) {
    lines.push(`  --color-${c.name}: ${c.value};`)
  }
  for (const t of tokens.typography) {
    lines.push(`  --font-size-${t.name}: ${t.value};`)
  }
  for (const s of tokens.spacing) {
    lines.push(`  --${s.name}: ${s.value};`)
  }
  for (const sh of tokens.shadows) {
    lines.push(`  --${sh.name}: ${sh.value};`)
  }
  for (const bp of tokens.breakpoints) {
    lines.push(`  --breakpoint-${bp.name}: ${bp.value};`)
  }
  for (const br of tokens.borderRadius) {
    lines.push(`  --${br.name}: ${br.value};`)
  }
  lines.push('}')
  lines.push('```')

  return lines.join('\n')
}

// ============================================================================
// TOOL 2: component_spec_creator
// ============================================================================

function analyzeComponentSpecs(input: ComponentSpecInput): ComponentSpec {
  const rng = createSeededRandom(input.component_name + input.variant_count.toString())
  const variants: ComponentVariant[] = []

  const variantNames = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link']
  const count = Math.min(input.variant_count, variantNames.length)

  for (let i = 0; i < count; i++) {
    const props: Record<string, string> = {}
    for (const p of input.props) {
      props[p] = pickRandom(['string', 'number', 'boolean', 'ReactNode', '() => void'], rng)
    }
    variants.push({
      name: variantNames[i],
      description: `${variantNames[i].charAt(0).toUpperCase() + variantNames[i].slice(1)} variant of ${input.component_name}`,
      props,
    })
  }

  const propsInterface: PropDefinition[] = input.props.map(p => ({
    name: p,
    type: pickRandom(['string', 'number', 'boolean', 'React.ReactNode', '() => void', 'string[]'], rng),
    required: rng() > 0.5,
    description: `The ${p} property`,
    default_value: pickRandom(['undefined', '""', '0', 'false', '[]'], rng),
  }))

  const usageExamples: string[] = variants.slice(0, 3).map(v => {
    const propStr = input.props.slice(0, 2).map(p => `${p}="${pickRandom(['value', 'true', 'label', '42'], rng)}"`).join(' ')
    return `<${input.component_name} variant="${v.name}" ${propStr} />`
  })

  return {
    name: input.component_name,
    variants,
    propsInterface,
    usageExamples,
  }
}

function formatComponentSpecsReport(spec: ComponentSpec): string {
  const lines: string[] = []
  lines.push(`# Component Specification: ${spec.name}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Variants
  lines.push('## Variants')
  lines.push('')
  for (const v of spec.variants) {
    lines.push(`### ${v.name}`)
    lines.push('')
    lines.push(`_${v.description}_`)
    lines.push('')
    if (Object.keys(v.props).length > 0) {
      lines.push('| Prop | Type |')
      lines.push('|------|------|')
      for (const [key, val] of Object.entries(v.props)) {
        lines.push(`| \`${key}\` | \`${val}\` |`)
      }
      lines.push('')
    }
  }

  // Props Interface
  lines.push('## Props Interface')
  lines.push('')
  lines.push('| Prop | Type | Required | Default | Description |')
  lines.push('|------|------|----------|---------|-------------|')
  for (const p of spec.propsInterface) {
    lines.push(`| \`${p.name}\` | \`${p.type}\` | ${p.required ? 'Yes' : 'No'} | \`${p.default_value}\` | ${p.description} |`)
  }
  lines.push('')

  // Usage Examples
  lines.push('## Usage Examples')
  lines.push('')
  for (const ex of spec.usageExamples) {
    lines.push('```tsx')
    lines.push(ex)
    lines.push('```')
    lines.push('')
  }

  // States
  lines.push('## States')
  lines.push('')
  const states = ['default', 'hover', 'active', 'focus', 'disabled', 'loading']
  for (const s of states) {
    lines.push(`- **${s}**: ${s === 'default' ? 'Base state' : s === 'hover' ? 'On mouse hover' : s === 'active' ? 'On click/press' : s === 'focus' ? 'On keyboard focus' : s === 'disabled' ? 'Non-interactive state' : 'Loading/async state'}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 3: style_guide_builder
// ============================================================================

function analyzeStyleGuide(input: StyleGuideInput): StyleGuide {
  const rng = createSeededRandom(input.brand_name + input.spacing_base.toString())

  // Color system
  const colorRoles = ['primary', 'secondary', 'accent', 'background', 'surface', 'text-primary', 'text-secondary', 'border']
  const colorSystem: ColorSystemEntry[] = input.color_palette.map((hex, i) => {
    const role = colorRoles[i % colorRoles.length]
    const lum = relativeLuminance(hexToRgb(hex).r, hexToRgb(hex).g, hexToRgb(hex).b)
    return {
      role,
      hex,
      usage: pickRandom(['Main brand color', 'Supporting color', 'Background fill', 'Surface elevation', 'Text color', 'Border definition', 'Accent highlight'], rng),
      contrast_white: Math.round(contrastRatio(hex, '#ffffff') * 100) / 100,
      contrast_black: Math.round(contrastRatio(hex, '#000000') * 100) / 100,
    }
  })

  // Type scale
  const typeScale: TypeScaleEntry[] = [
    { level: 'h1', size: 48, line_height: 1.1, weight: 700, usage: 'Page headings' },
    { level: 'h2', size: 36, line_height: 1.2, weight: 700, usage: 'Section headings' },
    { level: 'h3', size: 28, line_height: 1.3, weight: 600, usage: 'Subsection headings' },
    { level: 'h4', size: 22, line_height: 1.4, weight: 600, usage: 'Card headings' },
    { level: 'body-lg', size: 18, line_height: 1.6, weight: 400, usage: 'Large body text' },
    { level: 'body', size: 16, line_height: 1.5, weight: 400, usage: 'Default body text' },
    { level: 'body-sm', size: 14, line_height: 1.5, weight: 400, usage: 'Secondary text' },
    { level: 'caption', size: 12, line_height: 1.4, weight: 400, usage: 'Captions and labels' },
  ]

  // Spacing rules
  const spacingRules: SpacingRule[] = Array.from({ length: 8 }, (_, i) => {
    const val = input.spacing_base * (i + 1)
    return {
      name: `space-${i + 1}`,
      value: val,
      rem: `${val / 16}rem`,
      usage: pickRandom(['Component padding', 'Section margins', 'Inline gaps', 'Stack layouts', 'Grid gaps'], rng),
    }
  })

  // Elevation system
  const elevationSystem: ElevationLevel[] = [
    { level: 0, name: 'flat', shadow: 'none', usage: 'Base level elements' },
    { level: 1, name: 'raised', shadow: '0 1px 3px rgba(0,0,0,0.12)', usage: 'Cards, buttons' },
    { level: 2, name: 'floating', shadow: '0 4px 6px rgba(0,0,0,0.1)', usage: 'Dropdowns, popovers' },
    { level: 3, name: 'overlay', shadow: '0 10px 15px rgba(0,0,0,0.1)', usage: 'Modals, dialogs' },
    { level: 4, name: 'modal', shadow: '0 25px 50px rgba(0,0,0,0.25)', usage: 'Full-screen overlays' },
  ]

  return {
    brand: input.brand_name,
    colorSystem,
    typeScale,
    spacingRules,
    elevationSystem,
  }
}

function formatStyleGuideReport(guide: StyleGuide): string {
  const lines: string[] = []
  lines.push(`# Style Guide: ${guide.brand}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Color System
  lines.push('## Color System')
  lines.push('')
  lines.push('| Role | Hex | Usage | Contrast (white) | Contrast (black) |')
  lines.push('|------|-----|-------|------------------|------------------|')
  for (const c of guide.colorSystem) {
    lines.push(`| ${c.role} | \`${c.hex}\` | ${c.usage} | ${c.contrast_white}:1 | ${c.contrast_black}:1 |`)
  }
  lines.push('')

  // Type Scale
  lines.push('## Type Scale')
  lines.push('')
  lines.push(`> Fonts: **${guide.brand}** uses a modular type scale`)
  lines.push('')
  lines.push('| Level | Size | Line Height | Weight | Usage |')
  lines.push('|-------|------|-------------|--------|-------|')
  for (const t of guide.typeScale) {
    lines.push(`| ${t.level} | ${t.size}px | ${t.line_height} | ${t.weight} | ${t.usage} |`)
  }
  lines.push('')

  // Spacing Rules
  lines.push('## Spacing System')
  lines.push('')
  lines.push('| Name | Pixels | REM | Usage |')
  lines.push('|------|--------|-----|-------|')
  for (const s of guide.spacingRules) {
    lines.push(`| \`${s.name}\` | ${s.value}px | ${s.rem} | ${s.usage} |`)
  }
  lines.push('')

  // Elevation System
  lines.push('## Elevation System')
  lines.push('')
  lines.push('| Level | Name | Shadow | Usage |')
  lines.push('|-------|------|--------|-------|')
  for (const e of guide.elevationSystem) {
    lines.push(`| ${e.level} | ${e.name} | \`${e.shadow}\` | ${e.usage} |`)
  }
  lines.push('')

  // CSS Output
  lines.push('---')
  lines.push('')
  lines.push('## CSS Implementation')
  lines.push('')
  lines.push('```css')
  lines.push(`/* ${guide.brand} Style Guide - CSS Custom Properties */`)
  lines.push(':root {')
  for (const c of guide.colorSystem) {
    lines.push(`  --color-${c.role}: ${c.hex};`)
  }
  for (const t of guide.typeScale) {
    lines.push(`  --font-${t.level}: ${t.size}px/${t.line_height} sans-serif;`)
  }
  for (const s of guide.spacingRules) {
    lines.push(`  --${s.name}: ${s.rem};`)
  }
  for (const e of guide.elevationSystem) {
    lines.push(`  --elevation-${e.level}: ${e.shadow};`)
  }
  lines.push('}')
  lines.push('```')

  return lines.join('\n')
}

// ============================================================================
// TOOL 4: responsive_breakpoint_advisor
// ============================================================================

function analyzeBreakpoints(input: BreakpointInput): BreakpointRecommendation {
  const rng = createSeededRandom(input.content_type + input.device_targets.join(''))

  const contentStrategies: Record<string, { strategy: string; bps: BreakpointDef[] }> = {
    dashboard: {
      strategy: 'Fluid grid with collapsible sidebar. Prioritize data density on desktop, stack vertically on mobile.',
      bps: [
        { name: 'mobile', min_width: 0, max_width: 639, target_devices: ['phone'] },
        { name: 'tablet', min_width: 640, max_width: 1023, target_devices: ['tablet'] },
        { name: 'desktop', min_width: 1024, max_width: 1439, target_devices: ['laptop', 'desktop'] },
        { name: 'wide', min_width: 1440, max_width: null, target_devices: ['ultrawide', 'tv'] },
      ],
    },
    landing: {
      strategy: 'Single-column mobile-first with progressive enhancement. Hero sections scale with viewport.',
      bps: [
        { name: 'mobile', min_width: 0, max_width: 767, target_devices: ['phone'] },
        { name: 'tablet', min_width: 768, max_width: 1023, target_devices: ['tablet'] },
        { name: 'desktop', min_width: 1024, max_width: null, target_devices: ['laptop', 'desktop'] },
      ],
    },
    ecommerce: {
      strategy: 'Product grid adapts from 1 to 4 columns. Filters collapse to drawer on mobile.',
      bps: [
        { name: 'mobile', min_width: 0, max_width: 479, target_devices: ['phone-sm', 'phone'] },
        { name: 'phablet', min_width: 480, max_width: 767, target_devices: ['phone-lg'] },
        { name: 'tablet', min_width: 768, max_width: 1023, target_devices: ['tablet'] },
        { name: 'desktop', min_width: 1024, max_width: 1279, target_devices: ['laptop'] },
        { name: 'wide', min_width: 1280, max_width: null, target_devices: ['desktop', 'ultrawide'] },
      ],
    },
    blog: {
      strategy: 'Reading-optimized with max line length. Sidebar appears at tablet breakpoint.',
      bps: [
        { name: 'mobile', min_width: 0, max_width: 639, target_devices: ['phone'] },
        { name: 'tablet', min_width: 640, max_width: 1023, target_devices: ['tablet'] },
        { name: 'desktop', min_width: 1024, max_width: null, target_devices: ['laptop', 'desktop'] },
      ],
    },
  }

  const config = contentStrategies[input.content_type] || contentStrategies.landing

  const containerWidths: Record<string, string> = {}
  const gridColumns: Record<string, number> = {}
  for (const bp of config.bps) {
    if (bp.max_width === null) {
      containerWidths[bp.name] = '100%'
      gridColumns[bp.name] = input.content_type === 'ecommerce' ? 4 : input.content_type === 'dashboard' ? 3 : 1
    } else {
      containerWidths[bp.name] = `${bp.max_width}px`
      if (bp.name === 'mobile') gridColumns[bp.name] = 1
      else if (bp.name === 'tablet' || bp.name === 'phablet') gridColumns[bp.name] = 2
      else gridColumns[bp.name] = input.content_type === 'ecommerce' ? 3 : 2
    }
  }

  const notes: string[] = [
    `Content type "${input.content_type}" uses ${config.bps.length} breakpoints`,
    `Target devices: ${input.device_targets.join(', ')}`,
    'Use CSS Grid with minmax() for fluid layouts',
    'Prefer relative units (rem, em) over pixels for spacing',
    'Test on real devices, not just browser resizing',
  ]

  if (input.device_targets.includes('phone')) {
    notes.push('Mobile-first approach recommended: start with smallest viewport')
  }
  if (input.content_type === 'dashboard') {
    notes.push('Consider container queries for widget-level responsiveness')
  }

  return {
    breakpoints: config.bps,
    layoutStrategy: config.strategy,
    containerWidths,
    gridColumns,
    notes,
  }
}

function formatBreakpointReport(rec: BreakpointRecommendation): string {
  const lines: string[] = []
  lines.push('# Responsive Breakpoint Recommendation')
  lines.push('')
  lines.push('---')
  lines.push('')

  // Strategy
  lines.push('## Layout Strategy')
  lines.push('')
  lines.push(`> ${rec.layoutStrategy}`)
  lines.push('')

  // Breakpoints table
  lines.push('## Breakpoints')
  lines.push('')
  lines.push('| Name | Min Width | Max Width | Target Devices |')
  lines.push('|------|-----------|-----------|----------------|')
  for (const bp of rec.breakpoints) {
    lines.push(`| \`${bp.name}\` | ${bp.min_width}px | ${bp.max_width ? bp.max_width + 'px' : '∞'} | ${bp.target_devices.join(', ')} |`)
  }
  lines.push('')

  // Container widths
  lines.push('## Container Widths')
  lines.push('')
  lines.push('| Breakpoint | Max Container |')
  lines.push('|------------|---------------|')
  for (const [bp, width] of Object.entries(rec.containerWidths)) {
    lines.push(`| \`${bp}\` | ${width} |`)
  }
  lines.push('')

  // Grid columns
  lines.push('## Grid Columns')
  lines.push('')
  lines.push('| Breakpoint | Columns |')
  lines.push('|------------|----------|')
  for (const [bp, cols] of Object.entries(rec.gridColumns)) {
    lines.push(`| \`${bp}\` | ${cols} |`)
  }
  lines.push('')

  // Implementation
  lines.push('---')
  lines.push('')
  lines.push('## CSS Implementation')
  lines.push('')
  lines.push('```css')
  for (const bp of rec.breakpoints) {
    if (bp.max_width !== null) {
      lines.push(`@media (min-width: ${bp.min_width}px) and (max-width: ${bp.max_width}px) {`)
    } else {
      lines.push(`@media (min-width: ${bp.min_width}px) {`)
    }
    lines.push(`  .container { max-width: ${rec.containerWidths[bp.name]}; }`)
    lines.push(`  .grid { grid-template-columns: repeat(${rec.gridColumns[bp.name]}, 1fr); }`)
    lines.push('}')
  }
  lines.push('```')
  lines.push('')

  // Notes
  lines.push('## Notes')
  lines.push('')
  for (const note of rec.notes) {
    lines.push(`- ${note}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 5: accessibility_auditor
// ============================================================================

function analyzeAccessibility(input: AccessibilityInput): AccessibilityReport {
  // Color contrast results
  const colorResults: ColorContrastResult[] = input.color_pairs.map(pair => {
    const ratio = Math.round(contrastRatio(pair.foreground, pair.background) * 100) / 100
    const AA_normal = ratio >= 4.5
    const AA_large = ratio >= 3.0
    const AAA_normal = ratio >= 7.0
    const AAA_large = ratio >= 4.5

    let suggestion = 'Passes all WCAG levels'
    if (!AA_normal && !AA_large) {
      suggestion = `Increase contrast. Current ratio ${ratio}:1. Target at least 4.5:1 for normal text.`
    } else if (!AA_normal && AA_large) {
      suggestion = 'Passes AA for large text only. Increase contrast for normal text.'
    } else if (AA_normal && !AAA_normal) {
      suggestion = 'Passes AA. Consider increasing to 7:1 for AAA compliance.'
    }

    return {
      pair: `${pair.foreground} on ${pair.background}`,
      ratio,
      AA_normal,
      AA_large,
      AAA_normal,
      AAA_large,
      suggestion,
    }
  })

  // Font size results
  const fontSizeResults: FontSizeResult[] = input.font_sizes.map(fs => {
    let status: 'pass' | 'warn' | 'fail' = 'pass'
    let suggestion = 'Font size is adequate'

    if (fs.size_px < 12) {
      status = 'fail'
      suggestion = 'Font size below 12px is too small. Minimum 12px required.'
    } else if (fs.size_px < 14 && !fs.bold) {
      status = 'warn'
      suggestion = 'Consider increasing to 14px or using bold weight for small text.'
    } else if (fs.size_px >= 18 || (fs.size_px >= 14 && fs.bold)) {
      status = 'pass'
      suggestion = 'Qualifies as large text (WCAG 18px+ or 14px+ bold).'
    }

    return { element: fs.element, size_px: fs.size_px, status, suggestion }
  })

  // Interactive element results
  const interactiveResults: InteractiveElementResult[] = input.interactive_elements.map(el => {
    const issues: string[] = []
    if (!el.has_label) issues.push('Missing accessible label')
    if (!el.has_aria) issues.push('No ARIA attributes defined')
    if (!el.keyboard_accessible) issues.push('Not keyboard accessible')

    return {
      element: el.element,
      has_label: el.has_label,
      has_aria: el.has_aria,
      keyboard_accessible: el.keyboard_accessible,
      status: issues.length === 0 ? 'pass' : 'fail',
      issues,
    }
  })

  // Summary
  const colorPass = colorResults.filter(c => c.AA_normal).length
  const colorFail = colorResults.length - colorPass
  const fontPass = fontSizeResults.filter(f => f.status === 'pass').length
  const fontWarn = fontSizeResults.filter(f => f.status === 'warn').length
  const fontFail = fontSizeResults.filter(f => f.status === 'fail').length
  const interactivePass = interactiveResults.filter(i => i.status === 'pass').length
  const interactiveFail = interactiveResults.length - interactivePass

  const summary = {
    pass: colorPass + fontPass + interactivePass,
    warn: fontWarn,
    fail: colorFail + fontFail + interactiveFail,
  }

  // Overall grade
  let overall_grade: 'AAA' | 'AA' | 'A' | 'Fail' = 'AAA'
  if (summary.fail > 0) overall_grade = 'Fail'
  else if (summary.warn > 2) overall_grade = 'A'
  else if (colorResults.some(c => !c.AAA_normal)) overall_grade = 'AA'

  // Recommendations
  const recommendations: string[] = []
  if (colorFail > 0) recommendations.push(`Fix ${colorFail} color contrast pair(s) that fail WCAG AA.`)
  if (fontFail > 0) recommendations.push(`Increase ${fontFail} font size(s) to minimum 12px.`)
  if (interactiveFail > 0) recommendations.push(`Add labels and ARIA attributes to ${interactiveFail} interactive element(s).`)
  if (recommendations.length === 0) recommendations.push('All checks passed. Maintain current accessibility standards.')

  return {
    overall_grade,
    colorResults,
    fontSizeResults,
    interactiveResults,
    summary,
    recommendations,
  }
}

function formatAccessibilityReport(report: AccessibilityReport): string {
  const lines: string[] = []
  lines.push('# Accessibility Audit Report')
  lines.push('')
  lines.push('---')
  lines.push('')

  // Overall grade
  const gradeEmoji = report.overall_grade === 'AAA' ? 'AAA' : report.overall_grade === 'AA' ? 'AA' : report.overall_grade === 'A' ? 'A' : 'FAIL'
  lines.push(`## Overall Grade: ${gradeEmoji}`)
  lines.push('')
  lines.push(`| Pass | Warn | Fail |`)
  lines.push(`|------|------|------|`)
  lines.push(`| ${report.summary.pass} | ${report.summary.warn} | ${report.summary.fail} |`)
  lines.push('')

  // Color contrast
  lines.push('## Color Contrast')
  lines.push('')
  lines.push('| Pair | Ratio | AA Normal | AA Large | AAA Normal | AAA Large |')
  lines.push('|------|-------|-----------|----------|------------|-----------|')
  for (const c of report.colorResults) {
    lines.push(`| ${c.pair} | ${c.ratio}:1 | ${c.AA_normal ? 'PASS' : 'FAIL'} | ${c.AA_large ? 'PASS' : 'FAIL'} | ${c.AAA_normal ? 'PASS' : 'FAIL'} | ${c.AAA_large ? 'PASS' : 'FAIL'} |`)
  }
  lines.push('')

  // Color suggestions
  const failingColors = report.colorResults.filter(c => !c.AA_normal)
  if (failingColors.length > 0) {
    lines.push('### Color Suggestions')
    lines.push('')
    for (const fc of failingColors) {
      lines.push(`- **${fc.pair}**: ${fc.suggestion}`)
    }
    lines.push('')
  }

  // Font sizes
  lines.push('## Font Sizes')
  lines.push('')
  lines.push('| Element | Size | Status |')
  lines.push('|---------|------|--------|')
  for (const f of report.fontSizeResults) {
    lines.push(`| ${f.element} | ${f.size_px}px | ${f.status.toUpperCase()} |`)
  }
  lines.push('')

  // Interactive elements
  lines.push('## Interactive Elements')
  lines.push('')
  lines.push('| Element | Label | ARIA | Keyboard |')
  lines.push('|---------|-------|------|----------|')
  for (const el of report.interactiveResults) {
    lines.push(`| ${el.element} | ${el.has_label ? 'YES' : 'NO'} | ${el.has_aria ? 'YES' : 'NO'} | ${el.keyboard_accessible ? 'YES' : 'NO'} |`)
  }
  lines.push('')

  // Recommendations
  lines.push('---')
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of report.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 6: design_system_versioner
// ============================================================================

function analyzeVersionBump(input: VersionInput): VersionResult {
  const hasBreaking = input.changes.some(c => c.type === 'breaking')
  const hasFeature = input.changes.some(c => c.type === 'feature')
  const hasFix = input.changes.some(c => c.type === 'fix')

  let bump_type: 'major' | 'minor' | 'patch' = 'patch'
  if (hasBreaking) bump_type = 'major'
  else if (hasFeature) bump_type = 'minor'
  else if (hasFix) bump_type = 'patch'

  // Parse current version
  const parts = input.current_version.split('.').map(Number)
  let [major, minor, patch] = [parts[0] || 0, parts[1] || 0, parts[2] || 0]

  switch (bump_type) {
    case 'major': major++; minor = 0; patch = 0; break
    case 'minor': minor++; patch = 0; break
    case 'patch': patch++; break
  }

  const new_version = `${major}.${minor}.${patch}`

  // Generate changelog
  const changelog: ChangelogEntry[] = input.changes.map(c => ({
    type: c.type,
    description: c.description,
    component: input.components_affected.length > 0
      ? input.components_affected[Math.floor(Math.random() * input.components_affected.length)]
      : 'core',
  }))

  // Generate migration guide
  const migration_guide: string[] = []
  if (bump_type === 'major') {
    migration_guide.push('## Breaking Changes')
    migration_guide.push('')
    migration_guide.push('1. Review all deprecated APIs listed in changelog')
    migration_guide.push('2. Run migration script: `npx ds-migrate v${major}`')
    migration_guide.push('3. Update component imports to new paths')
    migration_guide.push('4. Test all affected components in isolation')
    migration_guide.push('5. Update design token references if renamed')
  } else if (bump_type === 'minor') {
    migration_guide.push('## New Features')
    migration_guide.push('')
    migration_guide.push('1. New features are backward-compatible')
    migration_guide.push('2. Opt-in to new APIs as needed')
    migration_guide.push('3. Review new component variants')
  } else {
    migration_guide.push('## Patch Changes')
    migration_guide.push('')
    migration_guide.push('1. No breaking changes')
    migration_guide.push('2. Safe to upgrade directly')
    migration_guide.push('3. Bug fixes applied automatically')
  }

  return {
    new_version,
    bump_type,
    changelog,
    migration_guide,
    affected_components: input.components_affected,
  }
}

function formatVersionReport(result: VersionResult): string {
  const lines: string[] = []
  lines.push('# Design System Version Report')
  lines.push('')
  lines.push('---')
  lines.push('')

  // Version bump
  lines.push('## Version Bump')
  lines.push('')
  lines.push(`| Field | Value |`)
  lines.push(`|-------|-------|`)
  lines.push(`| Bump Type | \`${result.bump_type}\` |`)
  lines.push(`| New Version | \`v${result.new_version}\` |`)
  lines.push(`| Affected Components | ${result.affected_components.length > 0 ? result.affected_components.join(', ') : 'None specified'} |`)
  lines.push('')

  // Changelog
  lines.push('## Changelog')
  lines.push('')
  const grouped: Record<string, string[]> = {}
  for (const entry of result.changelog) {
    if (!grouped[entry.type]) grouped[entry.type] = []
    grouped[entry.type].push(`- **${entry.component}**: ${entry.description}`)
  }
  for (const [type, entries] of Object.entries(grouped)) {
    lines.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)}`)
    lines.push('')
    for (const e of entries) {
      lines.push(e)
    }
    lines.push('')
  }

  // Migration guide
  lines.push('---')
  lines.push('')
  lines.push('## Migration Guide')
  lines.push('')
  for (const m of result.migration_guide) {
    lines.push(m)
  }
  lines.push('')

  // Semver explanation
  lines.push('---')
  lines.push('')
  lines.push('## Semver Reference')
  lines.push('')
  lines.push('| Bump | When | Example |')
  lines.push('|------|------|---------|')
  lines.push('| **major** | Breaking API changes | `1.2.3` → `2.0.0` |')
  lines.push('| **minor** | New features, backward-compatible | `1.2.3` → `1.3.0` |')
  lines.push('| **patch** | Bug fixes only | `1.2.3` → `1.2.4` |')
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// TOOL 7: code_output_generator
// ============================================================================

function analyzeCodeGen(input: CodeGenInput): CodeGenResult {
  const rng = createSeededRandom(input.component_name + input.framework)
  const files: CodeFile[] = []
  const dependencies: string[] = []
  const notes: string[] = []

  const componentName = input.component_name
  const tokens = input.tokens

  switch (input.framework) {
    case 'react': {
      dependencies.push('react', 'react-dom')
      const cssContent = generateCSSCustomProperties(tokens)
      files.push({
        filename: `${componentName}.css`,
        language: 'css',
        content: cssContent,
      })
      files.push({
        filename: `${componentName}.tsx`,
        language: 'tsx',
        content: generateReactComponent(componentName, tokens),
      })
      notes.push('React component uses CSS Modules pattern')
      notes.push('Import CSS file in your component module')
      break
    }
    case 'vue': {
      dependencies.push('vue')
      files.push({
        filename: `${componentName}.vue`,
        language: 'vue',
        content: generateVueComponent(componentName, tokens),
      })
      notes.push('Vue SFC with scoped styles')
      break
    }
    case 'svelte': {
      dependencies.push('svelte')
      files.push({
        filename: `${componentName}.svelte`,
        language: 'svelte',
        content: generateSvelteComponent(componentName, tokens),
      })
      notes.push('Svelte component with scoped styles')
      break
    }
    case 'html+css': {
      files.push({
        filename: `${componentName}.html`,
        language: 'html',
        content: generateHTMLComponent(componentName, tokens),
      })
      files.push({
        filename: `${componentName}.css`,
        language: 'css',
        content: generateCSSCustomProperties(tokens),
      })
      notes.push('Vanilla HTML/CSS — no framework required')
      break
    }
  }

  return {
    framework: input.framework,
    componentName,
    files,
    dependencies,
    notes,
  }
}

function generateCSSCustomProperties(tokens: Record<string, string>): string {
  const lines: string[] = []
  lines.push('/**')
  lines.push(' * Design Tokens — CSS Custom Properties')
  lines.push(' */')
  lines.push('')
  lines.push(':root {')
  for (const [key, value] of Object.entries(tokens)) {
    lines.push(`  --${key}: ${value};`)
  }
  lines.push('}')
  return lines.join('\n')
}

function generateReactComponent(name: string, tokens: Record<string, string>): string {
  const lines: string[] = []
  lines.push("import React from 'react'")
  lines.push(`import './${name}.css'`)
  lines.push('')
  lines.push(`interface ${name}Props {`)
  lines.push('  children?: React.ReactNode')
  lines.push('  variant?: "primary" | "secondary" | "outline"')
  lines.push('  size?: "sm" | "md" | "lg"')
  lines.push('  disabled?: boolean')
  lines.push('  onClick?: () => void')
  lines.push('}')
  lines.push('')
  lines.push(`export const ${name}: React.FC<${name}Props> = ({`)
  lines.push('  children,')
  lines.push('  variant = "primary",')
  lines.push('  size = "md",')
  lines.push('  disabled = false,')
  lines.push('  onClick,')
  lines.push('}) => {')
  lines.push('  return (')
  lines.push('    <button')
  lines.push(`      className={\`${name} ${name}--\${variant} ${name}--\${size}\`}`)
  lines.push('      disabled={disabled}')
  lines.push('      onClick={onClick}')
  lines.push('    >')
  lines.push('      {children}')
  lines.push('    </button>')
  lines.push('  )')
  lines.push('}')
  lines.push('')
  lines.push(`export default ${name}`)
  return lines.join('\n')
}

function generateVueComponent(name: string, tokens: Record<string, string>): string {
  const lines: string[] = []
  lines.push('<script setup lang="ts">')
  lines.push('defineProps<{')
  lines.push('  variant?: "primary" | "secondary" | "outline"')
  lines.push('  size?: "sm" | "md" | "lg"')
  lines.push('  disabled?: boolean')
  lines.push('}>()')
  lines.push('</script>')
  lines.push('')
  lines.push('<template>')
  lines.push(`  <button`)
  lines.push(`    :class="[\`${name}\`, \`${name}--\${variant || 'primary'}\`, \`${name}--\${size || 'md'}\`]"`)
  lines.push('    :disabled="disabled"')
  lines.push('  >')
  lines.push('    <slot />')
  lines.push('  </button>')
  lines.push('</template>')
  lines.push('')
  lines.push('<style scoped>')
  for (const [key, value] of Object.entries(tokens)) {
    lines.push(`.${name} { --${key}: ${value}; }`)
  }
  lines.push(`.${name} { display: inline-flex; align-items: center; gap: 0.5rem; }`)
  lines.push(`.${name}--primary { background: var(--color-primary-500); color: white; }`)
  lines.push(`.${name}--secondary { background: var(--color-secondary-500); color: white; }`)
  lines.push(`.${name}--outline { border: 2px solid var(--color-primary-500); color: var(--color-primary-500); }`)
  lines.push(`.${name}--sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }`)
  lines.push(`.${name}--md { padding: 0.5rem 1rem; font-size: 1rem; }`)
  lines.push(`.${name}--lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }`)
  lines.push('</style>')
  return lines.join('\n')
}

function generateSvelteComponent(name: string, tokens: Record<string, string>): string {
  const lines: string[] = []
  lines.push('<script lang="ts">')
  lines.push('  export let variant: "primary" | "secondary" | "outline" = "primary"')
  lines.push('  export let size: "sm" | "md" | "lg" = "md"')
  lines.push('  export let disabled = false')
  lines.push('</script>')
  lines.push('')
  lines.push(`<button`)
  lines.push(`  class="${name}"`)
  lines.push(`  class:variant-primary={variant === 'primary'}`)
  lines.push(`  class:variant-secondary={variant === 'secondary'}`)
  lines.push(`  class:variant-outline={variant === 'outline'}`)
  lines.push(`  class:size-sm={size === 'sm'}`)
  lines.push(`  class:size-md={size === 'md'}`)
  lines.push(`  class:size-lg={size === 'lg'}`)
  lines.push('  {disabled}')
  lines.push('  on:click')
  lines.push('>')
  lines.push('  <slot />')
  lines.push('</button>')
  lines.push('')
  lines.push('<style>')
  for (const [key, value] of Object.entries(tokens)) {
    lines.push(`  :global(:root) { --${key}: ${value}; }`)
  }
  lines.push(`  .${name} { display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; }`)
  lines.push(`  .variant-primary { background: var(--color-primary-500); color: white; }`)
  lines.push(`  .variant-secondary { background: var(--color-secondary-500); color: white; }`)
  lines.push(`  .variant-outline { border: 2px solid var(--color-primary-500); color: var(--color-primary-500); }`)
  lines.push('</style>')
  return lines.join('\n')
}

function generateHTMLComponent(name: string, tokens: Record<string, string>): string {
  const lines: string[] = []
  lines.push('<!DOCTYPE html>')
  lines.push('<html lang="en">')
  lines.push('<head>')
  lines.push(`  <meta charset="UTF-8">`)
  lines.push(`  <meta name="viewport" content="width=device-width, initial-scale=1.0">`)
  lines.push(`  <title>${name} Component</title>`)
  lines.push(`  <link rel="stylesheet" href="${name}.css">`)
  lines.push('</head>')
  lines.push('<body>')
  lines.push(`  <button class="${name} ${name}--primary ${name}--md">`)
  lines.push('    Click me')
  lines.push('  </button>')
  lines.push('</body>')
  lines.push('</html>')
  return lines.join('\n')
}

function formatCodeGenReport(result: CodeGenResult): string {
  const lines: string[] = []
  lines.push(`# Code Output: ${result.componentName}`)
  lines.push('')
  lines.push(`> Framework: \`${result.framework}\``)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Dependencies
  if (result.dependencies.length > 0) {
    lines.push('## Dependencies')
    lines.push('')
    for (const dep of result.dependencies) {
      lines.push(`- \`${dep}\``)
    }
    lines.push('')
  }

  // Files
  lines.push('## Generated Files')
  lines.push('')
  for (const file of result.files) {
    lines.push(`### \`${file.filename}\``)
    lines.push('')
    lines.push(`\`\`\`${file.language}`)
    lines.push(file.content)
    lines.push('```')
    lines.push('')
  }

  // Notes
  if (result.notes.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    for (const note of result.notes) {
      lines.push(`- ${note}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ============================================================================
// TOOL 8: design_review_checker
// ============================================================================

function analyzeDesignReview(input: DesignReviewInput): DesignReviewReport {
  const rng = createSeededRandom(input.design_spec + input.checklist_items.join(''))

  const items: ReviewItem[] = input.checklist_items.map(criterion => {
    const roll = rng()
    let status: 'pass' | 'fail' | 'warning' = 'pass'
    let detail = ''
    let suggestion = ''

    if (roll > 0.75) {
      status = 'pass'
      detail = `Design spec addresses "${criterion}" adequately.`
      suggestion = 'No action needed.'
    } else if (roll > 0.35) {
      status = 'warning'
      detail = `Design spec partially addresses "${criterion}".`
      suggestion = `Consider expanding coverage of "${criterion}" in the spec.`
    } else {
      status = 'fail'
      detail = `Design spec does not adequately address "${criterion}".`
      suggestion = `Add explicit guidance for "${criterion}" before proceeding.`
    }

    return { criterion, status, detail, suggestion }
  })

  const passed = items.filter(i => i.status === 'pass').length
  const failed = items.filter(i => i.status === 'fail').length
  const warnings = items.filter(i => i.status === 'warning').length
  const total = items.length
  const score = total > 0 ? Math.round(((passed + warnings * 0.5) / total) * 100) : 0

  let overall_verdict: 'approved' | 'needs_revision' | 'rejected' = 'approved'
  if (failed > total * 0.3) overall_verdict = 'rejected'
  else if (failed > 0 || warnings > total * 0.3) overall_verdict = 'needs_revision'

  const improvement_suggestions: string[] = []
  if (failed > 0) improvement_suggestions.push(`Address ${failed} failing criterion(s) before next review.`)
  if (warnings > 0) improvement_suggestions.push(`Review ${warnings} warning(s) for potential improvements.`)
  if (score >= 90) improvement_suggestions.push('Excellent design spec quality. Ready for implementation.')
  else if (score >= 70) improvement_suggestions.push('Good foundation. Address warnings to reach excellence.')
  else improvement_suggestions.push('Significant revisions needed. Consider a design review meeting.')

  return {
    total_items: total,
    passed,
    failed,
    warnings,
    score,
    items,
    overall_verdict,
    improvement_suggestions,
  }
}

function formatDesignReviewReport(report: DesignReviewReport): string {
  const lines: string[] = []
  lines.push('# Design Review Report')
  lines.push('')
  lines.push('---')
  lines.push('')

  // Score
  const verdictLabel = report.overall_verdict === 'approved' ? 'APPROVED' : report.overall_verdict === 'needs_revision' ? 'NEEDS REVISION' : 'REJECTED'
  lines.push(`## Verdict: ${verdictLabel}`)
  lines.push('')
  lines.push(`**Score: ${report.score}/100**`)
  lines.push('')
  lines.push('| Total | Passed | Warnings | Failed |')
  lines.push('|-------|--------|----------|--------|')
  lines.push(`| ${report.total_items} | ${report.passed} | ${report.warnings} | ${report.failed} |`)
  lines.push('')

  // Items
  lines.push('## Review Items')
  lines.push('')
  for (const item of report.items) {
    const statusLabel = item.status === 'pass' ? 'PASS' : item.status === 'warning' ? 'WARN' : 'FAIL'
    lines.push(`### ${statusLabel}: ${item.criterion}`)
    lines.push('')
    lines.push(`_${item.detail}_`)
    lines.push('')
    lines.push(`> Suggestion: ${item.suggestion}`)
    lines.push('')
  }

  // Improvement suggestions
  lines.push('---')
  lines.push('')
  lines.push('## Improvement Suggestions')
  lines.push('')
  for (const s of report.improvement_suggestions) {
    lines.push(`- ${s}`)
  }
  lines.push('')

  return lines.join('\n')
}

// ============================================================================
// PLUGIN EXPORT
// ============================================================================

export const name = 'dsh-tool-vibecoder'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: design_token_generator
  tools.register(defineTool({
    name: 'design_token_generator',
    description: 'Generate design tokens (colors, typography, spacing, shadows, breakpoints, border radius) from a theme description. Returns structured token set ready for CSS/SCSS/Tailwind.',
    parameters: {
      theme_input: {
        type: 'string',
        required: true,
        description: 'JSON: {name: string, primary_color: hex, mood: "professional"|"playful"|"minimal"|"bold", target: "web"|"mobile"|"both"}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { theme_input: string }) {
      const data: ThemeInput = JSON.parse(args.theme_input)
      const result = analyzeDesignTokens(data)
      return formatTokenResult(result)
    },
  }))

  // Tool 2: component_spec_creator
  tools.register(defineTool({
    name: 'component_spec_creator',
    description: 'Create a component specification document with variants, props interface, states, and usage examples.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {component_name: string, variant_count: number, props: string[], states: string[]}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: ComponentSpecInput = JSON.parse(args.input)
      const result = analyzeComponentSpecs(data)
      return formatComponentSpecsReport(result)
    },
  }))

  // Tool 3: style_guide_builder
  tools.register(defineTool({
    name: 'style_guide_builder',
    description: 'Build a complete style guide with color system, type scale, spacing rules, and elevation system.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {brand_name: string, color_palette: string[], typography: {heading_font, body_font, mono_font}, spacing_base: number}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: StyleGuideInput = JSON.parse(args.input)
      const result = analyzeStyleGuide(data)
      return formatStyleGuideReport(result)
    },
  }))

  // Tool 4: responsive_breakpoint_advisor
  tools.register(defineTool({
    name: 'responsive_breakpoint_advisor',
    description: 'Get optimal responsive breakpoint configuration and layout strategy for target devices and content type.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {device_targets: string[], content_type: "dashboard"|"landing"|"ecommerce"|"blog"}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: BreakpointInput = JSON.parse(args.input)
      const result = analyzeBreakpoints(data)
      return formatBreakpointReport(result)
    },
  }))

  // Tool 5: accessibility_auditor
  tools.register(defineTool({
    name: 'accessibility_auditor',
    description: 'Audit design for WCAG 2.1 AA/AAA compliance. Checks color contrast, font sizes, and interactive element accessibility.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {color_pairs: [{foreground, background, large_text?}], font_sizes: [{element, size_px, bold?}], interactive_elements: [{element, has_label, has_aria, keyboard_accessible}]}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: AccessibilityInput = JSON.parse(args.input)
      const result = analyzeAccessibility(data)
      return formatAccessibilityReport(result)
    },
  }))

  // Tool 6: design_system_versioner
  tools.register(defineTool({
    name: 'design_system_versioner',
    description: 'Manage design system versioning. Determines semver bump, generates changelog and migration guide.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {current_version: string, changes: [{type: "breaking"|"feature"|"fix"|"refactor", description}], components_affected: string[]}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: VersionInput = JSON.parse(args.input)
      const result = analyzeVersionBump(data)
      return formatVersionReport(result)
    },
  }))

  // Tool 7: code_output_generator
  tools.register(defineTool({
    name: 'code_output_generator',
    description: 'Generate production-ready component code from design tokens for React, Vue, Svelte, or HTML+CSS.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {tokens: Record<string, string>, framework: "react"|"vue"|"svelte"|"html+css", component_name: string}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: CodeGenInput = JSON.parse(args.input)
      const result = analyzeCodeGen(data)
      return formatCodeGenReport(result)
    },
  }))

  // Tool 8: design_review_checker
  tools.register(defineTool({
    name: 'design_review_checker',
    description: 'Run a structured design review against a checklist. Returns pass/fail/warning for each item with improvement suggestions.',
    parameters: {
      input: {
        type: 'string',
        required: true,
        description: 'JSON: {design_spec: string, checklist_items: string[]}',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value as string }],
    },
    async execute(args: { input: string }) {
      const data: DesignReviewInput = JSON.parse(args.input)
      const result = analyzeDesignReview(data)
      return formatDesignReviewReport(result)
    },
  }))
}
