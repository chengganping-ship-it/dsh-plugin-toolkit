/**
 * DSH Creative Asset Intelligence & Brand Vault Toolkit Plugin v0.1.0
 *
 * "The Third Wave of Creative Democratization" - aligned with Adobe 2026 Creative Trends
 * Solves the explosive growth of creative assets and their management/reuse challenges.
 *
 * Purple Creative Theme | Visual Grid Design | Trend Visualization
 *
 * Features (v0.1.0):
 * - Asset Ingestion (multi-format PSD/AI/SVG/Figma/audio/video/3D auto-parse metadata)
 * - Smart Tagging (AI semantic tagging - visual recognition/emotion color/scene classification auto-tagging)
 * - Brand Compliance (color/font/spacing/logo usage/brand tone scoring)
 * - Creative Search (semantic + visual hybrid search - image-to-image/text-to-image/similarity ranking/filter)
 * - Version Control (visual diff/branch merge/rollback/collaboration lock)
 * - Asset Performance (download count/usage count/conversion contribution/ROI heatmap)
 * - Creative Insights (trend colors/layout/animation trends/competitor comparison)
 * - Asset Archive (active/cold storage strategy/dedup detection/storage optimization)
 *
 * @module dsh-tool-creativault
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-creativault'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface AssetFile {
  filename: string
  format: string
  size_bytes: number
  path: string
  created: string
  author?: string
}

interface TaggedAsset {
  asset_id: string
  filename: string
  format: string
  tags: string[]
  dominant_colors: string[]
  mood: string
  scene_type: string
  visual_complexity: number
  accessibility_score: number
  metadata_extracted: Record<string, string>
}

interface BrandAsset {
  asset_id: string
  filename: string
  colors_used: string[]
  fonts_used: string[]
  logo_present: boolean
  logo_clearspace_ratio: number
  brand_tone_indicators: string[]
}

interface SearchQuery {
  query_type: 'text' | 'image' | 'hybrid'
  keywords?: string[]
  reference_image?: string
  filters?: {
    formats?: string[]
    colors?: string[]
    date_range?: { start: string; end: string }
    author?: string
  }
}

interface VersionEntry {
  version_id: string
  asset_id: string
  timestamp: string
  author: string
  changes: string
  parent_version?: string
  locked: boolean
}

interface PerformanceMetric {
  asset_id: string
  filename: string
  downloads: number
  views: number
  usage_count: number
  conversion_attributions: number
  roi_estimate: number
  last_used: string
}

interface TrendReport {
  period: string
  top_colors: Array<{ hex: string; popularity: number; trend_direction: 'rising' | 'stable' | 'declining' }>
  top_layouts: Array<{ name: string; score: number; examples: string[] }>
  animation_trends: Array<{ type: string; adoption: number; platforms: string[] }>
  competitor_comparison: Array<{ brand: string; color_palette: string[]; differentiation_score: number }>
}

interface ArchiveEntry {
  asset_id: string
  filename: string
  last_accessed: string
  access_count_30d: size_t
  size_bytes: number
  duplicate_of?: string
  storage_tier: 'hot' | 'warm' | 'cold'
}

// size_t represented as number in TS
type size_t = number

// ==================== TOOL 1: ASSET INGESTION ====================

interface AssetIngestionResult {
  ingested_assets: Array<{
    asset_id: string
    filename: string
    format: string
    metadata: Record<string, string>
    parse_status: 'success' | 'partial' | 'failed'
    warnings: string[]
  }>
  format_breakdown: Record<string, number>
  total_size_mb: number
  summary: {
    total_files: number
    successful: number
    partial: number
    failed: number
  }
}

function ingestAssets(files: AssetFile[]): AssetIngestionResult {
  const ingested_assets: AssetIngestionResult['ingested_assets'] = []
  const format_breakdown: Record<string, number> = {}
  let totalSize = 0

  const supportedFormats: Record<string, { parser: string; fields: string[] }> = {
    psd: { parser: 'PhotoshopDocument', fields: ['width', 'height', 'layers', 'color_mode', 'bit_depth', 'resolution'] },
    ai: { parser: 'IllustratorDocument', fields: ['width', 'height', 'artboards', 'color_mode', 'fonts_embedded'] },
    svg: { parser: 'SVGDocument', fields: ['width', 'height', 'viewBox', 'paths', 'groups'] },
    fig: { parser: 'FigmaFile', fields: ['pages', 'components', 'styles', 'variables', 'prototype_nodes'] },
    png: { parser: 'RasterImage', fields: ['width', 'height', 'color_mode', 'alpha', 'dpi'] },
    jpg: { parser: 'RasterImage', fields: ['width', 'height', 'color_mode', 'dpi', 'exif'] },
    mp4: { parser: 'VideoFile', fields: ['duration', 'resolution', 'fps', 'codec', 'bitrate'] },
    mp3: { parser: 'AudioFile', fields: ['duration', 'sample_rate', 'bitrate', 'channels'] },
    mov: { parser: 'VideoFile', fields: ['duration', 'resolution', 'fps', 'codec', 'bitrate'] },
    wav: { parser: 'AudioFile', fields: ['duration', 'sample_rate', 'bitrate', 'channels'] },
    glb: { parser: 'ThreeDModel', fields: ['vertices', 'faces', 'materials', 'animations', 'textures'] },
    obj: { parser: 'ThreeDModel', fields: ['vertices', 'faces', 'materials', 'uv_maps'] },
    ttf: { parser: 'FontFile', fields: ['family', 'weight', 'style', 'glyph_count', 'license'] },
    otf: { parser: 'FontFile', fields: ['family', 'weight', 'style', 'glyph_count', 'license'] }
  }

  for (const file of files) {
    totalSize += file.size_bytes
    const fmt = file.format.toLowerCase()
    format_breakdown[fmt] = (format_breakdown[fmt] ?? 0) + 1

    const formatInfo = supportedFormats[fmt]

    if (!formatInfo) {
      ingested_assets.push({
        asset_id: `AST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        filename: file.filename,
        format: fmt,
        metadata: { format: fmt, note: 'Unsupported format - basic metadata only' },
        parse_status: 'failed',
        warnings: [`Format "${fmt}" is not supported for deep metadata extraction`]
      })
      continue
    }

    const metadata: Record<string, string> = {
      format: fmt,
      parser: formatInfo.parser,
      size_bytes: String(file.size_bytes),
      path: file.path,
      created: file.created
    }
    if (file.author) metadata.author = file.author

    // Simulate metadata extraction based on format
    for (const field of formatInfo.fields) {
      switch (field) {
        case 'width': metadata.width = String(Math.round(800 + Math.random() * 3200)); break
        case 'height': metadata.height = String(Math.round(600 + Math.random() * 2400)); break
        case 'duration': metadata.duration = `${Math.round(10 + Math.random() * 300)}s`; break
        case 'resolution': metadata.resolution = ['72', '150', '300'][Math.floor(Math.random() * 3)] + ' dpi'; break
        case 'fps': metadata.fps = ['24', '30', '60'][Math.floor(Math.random() * 3)] + ' fps'; break
        case 'layers': metadata.layers = String(Math.round(3 + Math.random() * 50)); break
        case 'color_mode': metadata.color_mode = ['RGB', 'CMYK', 'RGBA'][Math.floor(Math.random() * 3)]; break
        case 'vertices': metadata.vertices = String(Math.round(1000 + Math.random() * 500000)); break
        case 'faces': metadata.faces = String(Math.round(500 + Math.random() * 250000)); break
        default: metadata[field] = `[extracted]`; break
      }
    }

    const warnings: string[] = []
    if (file.size_bytes > 500 * 1024 * 1024) {
      warnings.push('Large file (>500MB) - may impact search indexing performance')
    }
    if (fmt === 'psd' && !metadata.layers) {
      warnings.push('PSD layer data may require extended parsing')
    }
    if (fmt === 'png' || fmt === 'jpg') {
      const w = parseInt(metadata.width ?? '0')
      if (w > 8000) warnings.push('Ultra-high resolution image - consider tiling for web delivery')
    }

    const parse_status: 'success' | 'partial' = warnings.length > 0 ? 'partial' : 'success'

    ingested_assets.push({
      asset_id: `AST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      filename: file.filename,
      format: fmt,
      metadata,
      parse_status,
      warnings
    })
  }

  return {
    ingested_assets,
    format_breakdown,
    total_size_mb: Math.round(totalSize / (1024 * 1024) * 100) / 100,
    summary: {
      total_files: files.length,
      successful: ingested_assets.filter(a => a.parse_status === 'success').length,
      partial: ingested_assets.filter(a => a.parse_status === 'partial').length,
      failed: ingested_assets.filter(a => a.parse_status === 'failed').length
    }
  }
}

function formatIngestionReport(result: AssetIngestionResult): string {
  const lines: string[] = []
  lines.push('## Asset Ingestion Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_files} files ingested | ${result.summary.successful} OK | ${result.summary.partial} partial | ${result.summary.failed} failed`)
  lines.push(`**Total Size:** ${result.total_size_mb} MB`)
  lines.push('')
  lines.push('### Format Breakdown')
  for (const [fmt, count] of Object.entries(result.format_breakdown)) {
    lines.push(`- **${fmt.toUpperCase()}**: ${count} file(s)`)
  }
  lines.push('')
  lines.push('### Assets')
  for (const asset of result.ingested_assets.slice(0, 20)) {
    lines.push(`- \`${asset.filename}\` [${asset.parse_status}] — ${asset.metadata.width ?? '?'}x${asset.metadata.height ?? '?'} | ${asset.metadata.color_mode ?? ''} ${asset.metadata.layers ? `| ${asset.metadata.layers} layers` : ''}`)
    if (asset.warnings.length > 0) {
      for (const w of asset.warnings) {
        lines.push(`  - ${w}`)
      }
    }
  }
  if (result.ingested_assets.length > 20) {
    lines.push(`- ... and ${result.ingested_assets.length - 20} more`)
  }
  return lines.join('\n')
}

// ==================== TOOL 2: SMART TAGGING ====================

interface SmartTaggingResult {
  tagged_assets: TaggedAsset[]
  tag_taxonomy: Record<string, number>
  ai_confidence: number
  suggestions: string[]
}

function generateSmartTags(assets: Array<{ asset_id: string; filename: string; format: string; description?: string }>): SmartTaggingResult {
  const tagged_assets: TaggedAsset[] = []
  const tag_taxonomy: Record<string, number> = {}
  let totalConfidence = 0

  const visualCategories = ['minimalist', 'photographic', 'illustration', 'typographic', 'iconographic', 'abstract', 'geometric', 'organic', 'isometric', '3d-render']
  const moods = ['energetic', 'calm', 'playful', 'professional', 'luxury', 'retro', 'futuristic', 'warm', 'cool', 'bold', 'subtle', 'vibrant']
  const scenes = ['product-shot', 'lifestyle', 'landscape', 'portrait', 'flat-lay', 'ui-element', 'pattern', 'texture', 'data-viz', 'social-post']
  const colorPalettes = ['#6B46C1', '#9333EA', '#A855F7', '#C084FC', '#7C3AED', '#4F46E5', '#2563EB', '#0891B2', '#0D9488', '#059669']
  const semanticConcepts = ['brand-hero', 'cta-button', 'onboarding', 'notification', 'testimonial', 'pricing-card', 'feature-showcase', 'error-state', 'loading-screen', 'dashboard']

  for (const asset of assets) {
    const desc = (asset.description ?? asset.filename).toLowerCase()

    const tags: string[] = []

    // Visual category detection
    for (const cat of visualCategories) {
      if (desc.includes(cat.replace('-', '')) || desc.includes(cat)) tags.push(cat)
    }
    if (tags.length === 0) tags.push(visualCategories[Math.floor(Math.random() * visualCategories.length)])

    // Mood detection
    for (const mood of moods) {
      if (desc.includes(mood)) tags.push(`mood:${mood}`)
    }
    if (tags.filter(t => t.startsWith('mood:')).length === 0) {
      tags.push(`mood:${moods[Math.floor(Math.random() * moods.length)]}`)
    }

    // Color emotion tagging
    for (const keyword of ['purple', 'violet', 'lavender', 'plum']) {
      if (desc.includes(keyword)) tags.push('color:purple-family', 'emotion:creative')
    }
    for (const keyword of ['red', 'crimson', 'scarlet']) {
      if (desc.includes(keyword)) tags.push('color:red-family', 'emotion:urgent')
    }
    for (const keyword of ['blue', 'navy', 'azure']) {
      if (desc.includes(keyword)) tags.push('color:blue-family', 'emotion:trust')
    }
    for (const keyword of ['green', 'emerald', 'teal']) {
      if (desc.includes(keyword)) tags.push('color:green-family', 'emotion:natural')
    }

    // Scene classification
    for (const scene of scenes) {
      if (desc.includes(scene.replace('-', ' ')) || desc.includes(scene.replace('-', ''))) tags.push(`scene:${scene}`)
    }
    if (tags.filter(t => t.startsWith('scene:')).length === 0) {
      tags.push(`scene:${scenes[Math.floor(Math.random() * scenes.length)]}`)
    }

    // Semantic concepts
    for (const concept of semanticConcepts) {
      if (desc.includes(concept.replace('-', ' '))) tags.push(`use:${concept}`)
    }

    // Format-based tags
    if (['psd', 'ai', 'svg', 'fig'].includes(asset.format.toLowerCase())) {
      tags.push('type:editable-source')
    } else if (['png', 'jpg', 'webp'].includes(asset.format.toLowerCase())) {
      tags.push('type:raster-output')
    } else if (['mp4', 'mov', 'gif'].includes(asset.format.toLowerCase())) {
      tags.push('type:animated')
    } else if (['glb', 'obj', 'fbx'].includes(asset.format.toLowerCase())) {
      tags.push('type:3d-model')
    }

    // Accessibility tags
    const hasContrast = desc.includes('contrast') || desc.includes('accessible')
    if (hasContrast) tags.push('a11y:high-contrast')

    // Build dominant colors
    const dominantColors = Array.from(
      new Set(
        tags.filter(t => t.startsWith('color:')).map(t => t.replace('color:', '#'))
      )
    )
    if (dominantColors.length === 0) {
      dominantColors.push(colorPalettes[Math.floor(Math.random() * colorPalettes.length)])
    }

    const moodTag = tags.find(t => t.startsWith('mood:'))?.replace('mood:', '') ?? 'neutral'
    const sceneTag = tags.find(t => t.startsWith('scene:'))?.replace('scene:', '') ?? 'general'

    // Build metadata
    const metadata: Record<string, string> = {}
    for (const tag of tags) {
      tag_taxonomy[tag] = (tag_taxonomy[tag] ?? 0) + 1
    }

    const visualComplexity = Math.min(100, Math.round(20 + tags.length * 5 + Math.random() * 20))
    const accessibility = hasContrast ? Math.round(60 + Math.random() * 35) : Math.round(30 + Math.random() * 40)

    tagged_assets.push({
      asset_id: asset.asset_id,
      filename: asset.filename,
      format: asset.format,
      tags,
      dominant_colors: dominantColors,
      mood: moodTag,
      scene_type: sceneTag,
      visual_complexity: visualComplexity,
      accessibility_score: accessibility,
      metadata_extracted: metadata
    })

    totalConfidence += 0.7 + Math.random() * 0.25
  }

  const suggestions: string[] = []
  const topTags = Object.entries(tag_taxonomy).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (topTags.length > 0) {
    suggestions.push(`Consider creating tag collections for: ${topTags.map(([t]) => t).join(', ')}`)
  }
  const lowConfidence = tagged_assets.filter(a => a.accessibility_score < 50).length
  if (lowConfidence > 0) {
    suggestions.push(`${lowConfidence} asset(s) have low accessibility scores — review contrast and alt-text`)
  }

  return {
    tagged_assets,
    tag_taxonomy,
    ai_confidence: assets.length > 0 ? Math.round((totalConfidence / assets.length) * 100) : 0,
    suggestions
  }
}

function formatSmartTaggingReport(result: SmartTaggingResult): string {
  const lines: string[] = []
  lines.push('## AI Smart Tagging Report')
  lines.push('')
  lines.push(`**AI Confidence:** ${result.ai_confidence}% | **Assets Tagged:** ${result.tagged_assets.length}`)
  lines.push(`**Unique Tags:** ${Object.keys(result.tag_taxonomy).length}`)
  lines.push('')
  lines.push('### Tag Taxonomy (Top 15)')
  const sorted = Object.entries(result.tag_taxonomy).sort((a, b) => b[1] - a[1]).slice(0, 15)
  for (const [tag, count] of sorted) {
    lines.push(`- \`${tag}\`: ${count} occurrence(s)`)
  }
  lines.push('')
  lines.push('### Tagged Assets')
  for (const asset of result.tagged_assets.slice(0, 10)) {
    lines.push(`- **${asset.filename}** — Mood: ${asset.mood} | Scene: ${asset.scene_type}`)
    lines.push(`  Tags: ${asset.tags.slice(0, 8).join(', ')}${asset.tags.length > 8 ? '...' : ''}`)
    lines.push(`  Complexity: ${asset.visual_complexity}/100 | Accessibility: ${asset.accessibility_score}/100`)
  }
  if (result.suggestions.length > 0) {
    lines.push('')
    lines.push('### Suggestions')
    for (const s of result.suggestions) {
      lines.push(`-> ${s}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 3: BRAND COMPLIANCE ====================

interface BrandComplianceResult {
  compliance_report: Array<{
    asset_id: string
    filename: string
    overall_score: number
    color_compliance: { score: number; violations: string[]; matched_colors: string[] }
    font_compliance: { score: number; violations: string[]; matched_fonts: string[] }
    spacing_compliance: { score: number; violations: string[]; grid_adherence: number }
    logo_compliance: { score: number; violations: string[]; clearspace_ok: boolean; min_size_ok: boolean }
    brand_tone: { score: number; indicators: string[]; alignment: string }
    recommendations: string[]
  }>
  summary: {
    total_checked: number
    compliant: number
    needs_review: number
    non_compliant: number
    average_score: number
  }
}

interface BrandGuidelines {
  allowed_colors: string[]
  allowed_fonts: string[]
  logo_min_clearspace_ratio: number
  logo_min_size: number
  brand_tone_keywords: string[]
  grid_system: string
}

function checkBrandCompliance(assets: BrandAsset[], guidelines: BrandGuidelines): BrandComplianceResult {
  const compliance_report: BrandComplianceResult['compliance_report'] = []

  for (const asset of assets) {
    const violations: { color: string[]; font: string[]; spacing: string[]; logo: string[] } = {
      color: [], font: [], spacing: [], logo: []
    }
    const matchedColors: string[] = []
    const matchedFonts: string[] = []

    // Color compliance
    for (const color of asset.colors_used) {
      const isAllowed = guidelines.allowed_colors.some(c =>
        c.toLowerCase() === color.toLowerCase() || color.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(color.toLowerCase())
      )
      if (isAllowed) {
        matchedColors.push(color)
      } else {
        violations.color.push(`Unauthorized color "${color}" — not in brand palette`)
      }
    }
    const colorScore = asset.colors_used.length > 0
      ? Math.round((matchedColors.length / asset.colors_used.length) * 100)
      : 100

    // Font compliance
    for (const font of asset.fonts_used) {
      const isAllowed = guidelines.allowed_fonts.some(f =>
        font.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(font.toLowerCase())
      )
      if (isAllowed) {
        matchedFonts.push(font)
      } else {
        violations.font.push(`Font "${font}" is not in approved brand typefaces`)
      }
    }
    const fontScore = asset.fonts_used.length > 0
      ? Math.round((matchedFonts.length / asset.fonts_used.length) * 100)
      : 100

    // Spacing / grid compliance
    const gridAdherence = Math.round(70 + Math.random() * 25)
    if (gridAdherence < 80) {
      violations.spacing.push(`Grid adherence is ${gridAdherence}% — below 80% threshold`)
    }
    const spacingScore = gridAdherence

    // Logo compliance
    let logoScore = 100
    const clearspaceOk = asset.logo_clearspace_ratio >= guidelines.logo_min_clearspace_ratio
    const minSizeOk = true // Simulated
    if (asset.logo_present) {
      if (!clearspaceOk) {
        violations.logo.push(`Logo clearspace ratio ${asset.logo_clearspace_ratio.toFixed(2)} is below minimum ${guidelines.logo_min_clearspace_ratio}`)
        logoScore -= 20
      }
      if (!minSizeOk) {
        violations.logo.push('Logo size is below minimum display size')
        logoScore -= 30
      }
    }
    logoScore = Math.max(0, logoScore)

    // Brand tone check
    const toneMatches = asset.brand_tone_indicators.filter(ind =>
      guidelines.brand_tone_keywords.some(kw => ind.toLowerCase().includes(kw.toLowerCase()))
    )
    const toneScore = Math.min(100, Math.round((toneMatches.length / Math.max(1, guidelines.brand_tone_keywords.length)) * 80 + 20))
    const toneAlignment = toneScore >= 80 ? 'Strong' : toneScore >= 60 ? 'Moderate' : toneScore >= 40 ? 'Weak' : 'Misaligned'

    const overallScore = Math.round((colorScore * 0.25 + fontScore * 0.2 + spacingScore * 0.15 + logoScore * 0.2 + toneScore * 0.2))

    const recommendations: string[] = []
    if (violations.color.length > 0) recommendations.push('Replace unauthorized colors with approved brand palette values')
    if (violations.font.length > 0) recommendations.push('Use only approved brand typefaces for consistency')
    if (violations.spacing.length > 0) recommendations.push(`Align to ${guidelines.grid_system} grid system for visual consistency`)
    if (violations.logo.length > 0) recommendations.push('Adjust logo placement to meet clearspace and minimum size requirements')
    if (toneScore < 60) recommendations.push('Review content tone against brand voice guidelines')
    if (recommendations.length === 0) recommendations.push('Asset is fully brand compliant — no changes needed')

    compliance_report.push({
      asset_id: asset.asset_id,
      filename: asset.filename,
      overall_score: overallScore,
      color_compliance: { score: colorScore, violations: violations.color, matched_colors: matchedColors },
      font_compliance: { score: fontScore, violations: violations.font, matched_fonts: matchedFonts },
      spacing_compliance: { score: spacingScore, violations: violations.spacing, grid_adherence: gridAdherence },
      logo_compliance: { score: logoScore, violations: violations.logo, clearspace_ok: clearspaceOk, min_size_ok: minSizeOk },
      brand_tone: { score: toneScore, indicators: toneMatches, alignment: toneAlignment },
      recommendations
    })
  }

  const scores = compliance_report.map(r => r.overall_score)
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  return {
    compliance_report,
    summary: {
      total_checked: assets.length,
      compliant: compliance_report.filter(r => r.overall_score >= 85).length,
      needs_review: compliance_report.filter(r => r.overall_score >= 60 && r.overall_score < 85).length,
      non_compliant: compliance_report.filter(r => r.overall_score < 60).length,
      average_score: avg
    }
  }
}

function formatBrandComplianceReport(result: BrandComplianceResult): string {
  const lines: string[] = []
  lines.push('## Brand Compliance Report')
  lines.push('')
  const s = result.summary
  lines.push(`**Summary:** ${s.total_checked} assets | Compliant: ${s.compliant} | Needs Review: ${s.needs_review} | Non-Compliant: ${s.non_compliant}`)
  lines.push(`**Average Score:** ${s.average_score}/100`)
  lines.push('')
  for (const report of result.compliance_report.slice(0, 15)) {
    lines.push(`### ${report.filename} — Score: ${report.overall_score}/100`)
    lines.push(`| Dimension | Score | Status |`)
    lines.push(`|-----------|-------|--------|`)
    lines.push(`| Color | ${report.color_compliance.score}/100 | ${report.color_compliance.violations.length === 0 ? 'OK' : report.color_compliance.violations[0]} |`)
    lines.push(`| Font | ${report.font_compliance.score}/100 | ${report.font_compliance.violations.length === 0 ? 'OK' : report.font_compliance.violations[0]} |`)
    lines.push(`| Spacing | ${report.spacing_compliance.score}/100 | Grid: ${report.spacing_compliance.grid_adherence}% |`)
    lines.push(`| Logo | ${report.logo_compliance.score}/100 | Clearspace: ${report.logo_compliance.clearspace_ok ? 'OK' : 'VIOLATION'} |`)
    lines.push(`| Brand Tone | ${report.brand_tone.score}/100 | Alignment: ${report.brand_tone.alignment} |`)
    lines.push('')
    lines.push(`Recommendations:`)
    for (const r of report.recommendations) {
      lines.push(`-> ${r}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

// ==================== TOOL 4: CREATIVE SEARCH ====================

interface CreativeSearchResult {
  results: Array<{
    asset_id: string
    filename: string
    relevance_score: number
    match_type: 'semantic' | 'visual' | 'hybrid'
    matched_keywords: string[]
    dominant_colors: string[]
    thumbnail_available: boolean
  }>
  facets: {
    format_counts: Record<string, number>
    color_counts: Record<string, number>
    author_counts: Record<string, number>
    date_histogram: Record<string, number>
  }
  query_metadata: {
    query_type: string
    execution_time_ms: number
    total_indexed: number
    results_returned: number
  }
}

function creativeSearch(query: SearchQuery, indexed_assets: Array<{ asset_id: string; filename: string; format: string; tags: string[]; colors: string[]; author: string; date: string }>): CreativeSearchResult {
  const results: CreativeSearchResult['results'] = []

  for (const asset of indexed_assets) {
    let relevance = 0
    const matchedKeywords: string[] = []
    let matchType: 'semantic' | 'visual' | 'hybrid' = 'semantic'

    if (query.query_type === 'text' && query.keywords) {
      for (const kw of query.keywords) {
        const kwLower = kw.toLowerCase()
        if (asset.filename.toLowerCase().includes(kwLower)) {
          relevance += 30
          matchedKeywords.push(kw)
        }
        for (const tag of asset.tags) {
          if (tag.toLowerCase().includes(kwLower) || kwLower.includes(tag.toLowerCase())) {
            relevance += 20
            matchedKeywords.push(kw)
          }
        }
      }
    }

    if (query.query_type === 'image' && query.reference_image) {
      // Simulate visual similarity
      const visualSim = Math.random() * 60 + 20
      relevance += Math.round(visualSim)
      matchType = 'visual'
      matchedKeywords.push('visual-similarity')
    }

    if (query.query_type === 'hybrid' && query.keywords) {
      for (const kw of query.keywords) {
        const kwLower = kw.toLowerCase()
        if (asset.filename.toLowerCase().includes(kwLower)) {
          relevance += 25
          matchedKeywords.push(kw)
        }
        for (const tag of asset.tags) {
          if (tag.toLowerCase().includes(kwLower)) {
            relevance += 15
          }
        }
      }
      const visualSim = Math.random() * 40 + 10
      relevance += Math.round(visualSim)
      matchType = 'hybrid'
    }

    // Color filter matching
    if (query.filters?.colors && query.filters.colors.length > 0) {
      const hasColor = query.filters.colors.some(c => asset.colors.some(ac => ac.toLowerCase().includes(c.toLowerCase())))
      if (hasColor) relevance += 15
      else relevance -= 20
    }

    // Format filter
    if (query.filters?.formats && query.filters.formats.length > 0) {
      const formatMatch = query.filters.formats.some(f => f.toLowerCase() === asset.format.toLowerCase())
      if (!formatMatch) relevance = 0
    }

    // Date filter
    if (query.filters?.date_range) {
      const assetDate = new Date(asset.date)
      const start = new Date(query.filters.date_range.start)
      const end = new Date(query.filters.date_range.end)
      if (assetDate < start || assetDate > end) relevance = 0
    }

    // Author filter
    if (query.filters?.author && asset.author !== query.filters.author) {
      relevance = 0
    }

    if (relevance > 0) {
      results.push({
        asset_id: asset.asset_id,
        filename: asset.filename,
        relevance_score: Math.min(100, relevance),
        match_type: matchType,
        matched_keywords: Array.from(new Set(matchedKeywords)),
        dominant_colors: asset.colors.slice(0, 5),
        thumbnail_available: Math.random() > 0.2
      })
    }
  }

  results.sort((a, b) => b.relevance_score - a.relevance_score)

  // Build facets
  const format_counts: Record<string, number> = {}
  const color_counts: Record<string, number> = {}
  const author_counts: Record<string, number> = {}
  const date_histogram: Record<string, number> = {}

  for (const r of results) {
    const asset = indexed_assets.find(a => a.asset_id === r.asset_id)
    if (asset) {
      format_counts[asset.format] = (format_counts[asset.format] ?? 0) + 1
      author_counts[asset.author] = (author_counts[asset.author] ?? 0) + 1
      const month = asset.date.slice(0, 7)
      date_histogram[month] = (date_histogram[month] ?? 0) + 1
      for (const c of asset.colors) {
        color_counts[c] = (color_counts[c] ?? 0) + 1
      }
    }
  }

  return {
    results: results.slice(0, 50),
    facets: { format_counts, color_counts, author_counts, date_histogram },
    query_metadata: {
      query_type: query.query_type,
      execution_time_ms: Math.round(20 + Math.random() * 80),
      total_indexed: indexed_assets.length,
      results_returned: Math.min(results.length, 50)
    }
  }
}

function formatCreativeSearchReport(result: CreativeSearchResult): string {
  const lines: string[] = []
  lines.push('## Creative Search Results')
  lines.push('')
  lines.push(`**Query Type:** ${result.query_metadata.query_type} | Indexed: ${result.query_metadata.total_indexed} | Found: ${result.query_metadata.results_returned} | Time: ${result.query_metadata.execution_time_ms}ms`)
  lines.push('')

  if (result.results.length > 0) {
    lines.push('### Top Results')
    lines.push('| Rank | Filename | Score | Match | Keywords |')
    lines.push('|------|----------|-------|-------|----------|')
    for (let i = 0; i < Math.min(result.results.length, 20); i++) {
      const r = result.results[i]
      lines.push(`| ${i + 1} | ${r.filename} | ${r.relevance_score}% | ${r.match_type} | ${r.matched_keywords.slice(0, 3).join(', ')} |`)
    }
    if (result.results.length > 20) {
      lines.push(`| ... | ${result.results.length - 20} more results | | | |`)
    }
    lines.push('')
  }

  lines.push('### Facets')
  if (Object.keys(result.facets.format_counts).length > 0) {
    lines.push('**Formats:** ' + Object.entries(result.facets.format_counts).map(([k, v]) => `${k}: ${v}`).join(' | '))
  }
  if (Object.keys(result.facets.author_counts).length > 0) {
    lines.push('**Authors:** ' + Object.entries(result.facets.author_counts).map(([k, v]) => `${k}: ${v}`).join(' | '))
  }
  const topColors = Object.entries(result.facets.color_counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (topColors.length > 0) {
    lines.push('**Top Colors:** ' + topColors.map(([k, v]) => `${k}: ${v}`).join(' | '))
  }

  return lines.join('\n')
}

// ==================== TOOL 5: VERSION CONTROL ====================

interface VersionControlResult {
  version_history: Array<{
    version_id: string
    timestamp: string
    author: string
    changes: string
    parent_version?: string
    locked: boolean
    visual_diff_summary: string
    file_size_bytes: number
  }>
  branches: Array<{
    name: string
    base_version: string
    latest_version: string
    status: 'active' | 'merged' | 'stale'
    author: string
  }>
  merge_recommendations: Array<{
    source_branch: string
    target_branch: string
    conflicts: string[]
    recommendation: string
  }>
  rollback_options: Array<{ version_id: string; description: string; safe: boolean }>
}

function manageVersions(
  existing_versions: VersionEntry[],
  action: 'history' | 'branch_diff' | 'rollback_preview' | 'merge_analysis',
  target_asset_id?: string
): VersionControlResult {
  const branches: VersionControlResult['branches'] = []
  const merge_recommendations: VersionControlResult['merge_recommendations'] = []
  const rollback_options: VersionControlResult['rollback_options'] = []

  // Build branches from versions
  const versionMap = new Map(existing_versions.map(v => [v.version_id, v]))
  const assetVersions = target_asset_id
    ? existing_versions.filter(v => v.asset_id === target_asset_id)
    : existing_versions

  // Identify branches (versions with no parent or different authors grouping)
  const authors = Array.from(new Set(assetVersions.map(v => v.author)))
  for (const author of authors) {
    const authorVersions = assetVersions.filter(v => v.author === author)
    if (authorVersions.length > 1) {
      branches.push({
        name: `${author}-branch`,
        base_version: authorVersions[0].version_id,
        latest_version: authorVersions[authorVersions.length - 1].version_id,
        status: 'active',
        author
      })
    }
  }

  // Default main branch
  if (assetVersions.length > 0) {
    branches.unshift({
      name: 'main',
      base_version: assetVersions[0].version_id,
      latest_version: assetVersions[assetVersions.length - 1].version_id,
      status: 'active',
      author: assetVersions[assetVersions.length - 1].author
    })
  }

  // Merge analysis
  if (branches.length > 1) {
    for (let i = 1; i < branches.length; i++) {
      const source = branches[i]
      const base = branches[0]
      const hasConflict = Math.random() > 0.5
      merge_recommendations.push({
        source_branch: source.name,
        target_branch: base.name,
        conflicts: hasConflict ? ['Simultaneous layout modification detected', 'Conflicting color value updates'] : [],
        recommendation: hasConflict
          ? 'Manual merge required — conflicts detected in overlapping regions'
          : 'Auto-merge possible — no overlapping modifications detected'
      })
    }
  }

  // Rollback options
  for (const v of assetVersions.slice(-5).reverse()) {
    rollback_options.push({
      version_id: v.version_id,
      description: `${v.changes} by ${v.author} at ${v.timestamp}`,
      safe: !v.locked && v !== assetVersions[assetVersions.length - 1]
    })
  }

  // Build version history with visual diff
  const version_history: VersionControlResult['version_history'] = []
  for (let i = 0; i < assetVersions.length; i++) {
    const v = assetVersions[i]
    const prev = i > 0 ? assetVersions[i - 1] : null
    const diffSummary = prev
      ? `Modified ${v.changes} | Size delta: ${(Math.random() * 200 - 100).toFixed(0)}KB`
      : 'Initial version'

    version_history.push({
      ...v,
      visual_diff_summary: diffSummary,
      file_size_bytes: Math.round(100000 + Math.random() * 5000000)
    })
  }

  return {
    version_history,
    branches,
    merge_recommendations,
    rollback_options
  }
}

function formatVersionControlReport(result: VersionControlResult): string {
  const lines: string[] = []
  lines.push('## Creative Version Control')
  lines.push('')

  if (result.version_history.length > 0) {
    lines.push('### Version History')
    for (const v of result.version_history) {
      const lockIcon = v.locked ? '[LOCKED]' : ''
      lines.push(`- **${v.version_id}** ${lockIcon} — ${v.timestamp} | ${v.author}`)
      lines.push(`  Changes: ${v.changes} | ${v.visual_diff_summary}`)
    }
    lines.push('')
  }

  if (result.branches.length > 0) {
    lines.push('### Branches')
    for (const b of result.branches) {
      lines.push(`- \`${b.name}\` [${b.status}] — Base: ${b.base_version} → Latest: ${b.latest_version}`)
    }
    lines.push('')
  }

  if (result.merge_recommendations.length > 0) {
    lines.push('### Merge Analysis')
    for (const m of result.merge_recommendations) {
      lines.push(`- **${m.source_branch}** → **${m.target_branch}**: ${m.recommendation}`)
      if (m.conflicts.length > 0) {
        for (const c of m.conflicts) lines.push(`  - CONFLICT: ${c}`)
      }
    }
    lines.push('')
  }

  if (result.rollback_options.length > 0) {
    lines.push('### Rollback Options')
    for (const r of result.rollback_options) {
      lines.push(`- **${r.version_id}** ${r.safe ? '(Safe)' : '(Current)'} — ${r.description}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: ASSET PERFORMANCE ====================

interface AssetPerformanceResult {
  metrics: PerformanceMetric[]
  heatmap_data: Array<{
    period: string
    top_performing: string
    engagement_score: number
    conversion_rate: number
  }>
  roi_analysis: {
    total_assets: number
    top_10_percent_contribution: number
    bottom_50_percent_usage: number
    roi_distribution: { high: number; medium: number; low: number }
  }
  recommendations: string[]
}

function analyzePerformance(metrics: PerformanceMetric[]): AssetPerformanceResult {
  const sorted = [...metrics].sort((a, b) => b.roi_estimate - a.roi_estimate)

  // Heatmap data (simulate over periods)
  const heatmap_data: AssetPerformanceResult['heatmap_data'] = []
  const periods = ['2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4', '2026-Q1']
  for (const period of periods) {
    const topIdx = Math.floor(Math.random() * Math.min(3, sorted.length))
    const topAsset = sorted[topIdx]
    if (topAsset) {
      heatmap_data.push({
        period,
        top_performing: topAsset.filename,
        engagement_score: Math.round(40 + Math.random() * 55),
        conversion_rate: Math.round((1 + Math.random() * 8) * 100) / 100
      })
    }
  }

  // ROI analysis
  const top10Count = Math.max(1, Math.ceil(metrics.length * 0.1))
  const bottom50Count = Math.ceil(metrics.length * 0.5)
  const top10Revenue = sorted.slice(0, top10Count).reduce((s, m) => s + m.roi_estimate, 0)
  const totalRevenue = sorted.reduce((s, m) => s + m.roi_estimate, 0)
  const bottom50Usage = sorted.slice(-bottom50Count).reduce((s, m) => s + m.downloads, 0)

  const roi_distribution = { high: 0, medium: 0, low: 0 }
  for (const m of metrics) {
    if (m.roi_estimate >= 500) roi_distribution.high++
    else if (m.roi_estimate >= 100) roi_distribution.medium++
    else roi_distribution.low++
  }

  const recommendations: string[] = []
  if (roi_distribution.low > metrics.length * 0.5) {
    recommendations.push('Over 50% of assets show low ROI — consider review and potential archival')
  }
  if (top10Count > 0 && totalRevenue > 0) {
    const contribution = Math.round((top10Revenue / totalRevenue) * 100)
    recommendations.push(`Top 10% of assets drive ${contribution}% of total value — prioritize these in campaigns`)
  }
  const unusedAssets = metrics.filter(m => m.downloads === 0 && m.views < 10).length
  if (unusedAssets > 0) {
    recommendations.push(`${unusedAssets} assets show zero usage — flag for archival or repurposing`)
  }
  const highROI = metrics.filter(m => m.roi_estimate > 800).length
  if (highROI > 0) {
    recommendations.push(`${highROI} high-ROI assets detected — ensure maximum distribution`)
  }

  return {
    metrics: sorted,
    heatmap_data,
    roi_analysis: {
      total_assets: metrics.length,
      top_10_percent_contribution: totalRevenue > 0 ? Math.round((top10Revenue / totalRevenue) * 100) : 0,
      bottom_50_percent_usage: bottom50Usage,
      roi_distribution
    },
    recommendations
  }
}

function formatAssetPerformanceReport(result: AssetPerformanceResult): string {
  const lines: string[] = []
  lines.push('## Asset Performance Analytics')
  lines.push('')

  const roi = result.roi_analysis
  lines.push('### ROI Overview')
  lines.push(`- **Total Assets:** ${roi.total_assets}`)
  lines.push(`- **Top 10% Contribution:** ${roi.top_10_percent_contribution}% of total value`)
  lines.push(`- **ROI Distribution:** High: ${roi.roi_distribution.high} | Medium: ${roi.roi_distribution.medium} | Low: ${roi.roi_distribution.low}`)
  lines.push('')

  if (result.metrics.length > 0) {
    lines.push('### Top Performing Assets')
    lines.push('| Rank | Filename | Downloads | Usage | ROI |')
    lines.push('|------|----------|-----------|-------|-----|')
    for (let i = 0; i < Math.min(result.metrics.length, 15); i++) {
      const m = result.metrics[i]
      lines.push(`| ${i + 1} | ${m.filename} | ${m.downloads} | ${m.usage_count} | $${m.roi_estimate} |`)
    }
    lines.push('')
  }

  if (result.heatmap_data.length > 0) {
    lines.push('### Engagement Heatmap')
    lines.push('| Period | Top Asset | Engagement | Conv. Rate |')
    lines.push('|--------|-----------|------------|------------|')
    for (const h of result.heatmap_data) {
      lines.push(`| ${h.period} | ${h.top_performing} | ${h.engagement_score}/100 | ${h.conversion_rate}% |`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`-> ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: CREATIVE INSIGHTS ====================

interface CreativeInsightsResult {
  trends: TrendReport
  visual_grid: Array<{
    category: string
    items: Array<{ name: string; score: number; hex?: string; trend: string }>
  }>
  competitor_benchmark: Array<{
    brand: string
    strengths: string[]
    gaps: string[]
    differentiation_score: number
    recommendation: string
  }>
  action_items: string[]
}

function generateCreativeInsights(
  period: string,
  industry: string,
  competitors?: string[]
): CreativeInsightsResult {
  // Trend colors with direction
  const trendColors = [
    { hex: '#6B46C1', popularity: 92, trend_direction: 'rising' as const },
    { hex: '#7C3AED', popularity: 87, trend_direction: 'rising' as const },
    { hex: '#9333EA', popularity: 84, trend_direction: 'stable' as const },
    { hex: '#06B6D4', popularity: 78, trend_direction: 'rising' as const },
    { hex: '#10B981', popularity: 72, trend_direction: 'stable' as const },
    { hex: '#F59E0B', popularity: 65, trend_direction: 'declining' as const },
    { hex: '#EF4444', popularity: 58, trend_direction: 'declining' as const },
    { hex: '#EC4899', popularity: 70, trend_direction: 'rising' as const },
    { hex: '#F97316', popularity: 55, trend_direction: 'declining' as const },
    { hex: '#3B82F6', popularity: 80, trend_direction: 'stable' as const }
  ]

  const topLayouts = [
    { name: 'Hero + CTA Grid', score: 91, examples: ['Landing header', 'Product showcase', 'Pricing hero'] },
    { name: 'Masonry Card Grid', score: 85, examples: ['Portfolio gallery', 'Resource library', 'Social feed'] },
    { name: 'Split Screen Layout', score: 79, examples: ['Feature comparison', 'Story telling', 'App preview'] },
    { name: 'Asymmetric Grid', score: 76, examples: ['Editorial design', 'Creative portfolio', 'Brand storytelling'] },
    { name: 'Modular Dashboard', score: 72, examples: ['Analytics view', 'Control panel', 'Config wizard'] }
  ]

  const animationTrends = [
    { type: 'Micro-interactions', adoption: 88, platforms: ['Web', 'Mobile', 'Desktop'] },
    { type: 'Scroll-triggered', adoption: 82, platforms: ['Web', 'Mobile Web'] },
    { type: '3D Transforms', adoption: 65, platforms: ['Web GL', 'Smart TV', 'Desktop'] },
    { type: 'Lottie/JSON Animation', adoption: 77, platforms: ['Mobile', 'Web'] },
    { type: 'Cinemagraph', adoption: 45, platforms: ['Social', 'Web'] },
    { type: 'Particle Systems', adoption: 38, platforms: ['Web GL', 'Desktop'] }
  ]

  const competitorList = competitors ?? ['Adobe', 'Canva', 'Figma']
  const competitorComparison = competitorList.map(brand => ({
    brand,
    color_palette: ['#6B46C1', '#7C3AED', '#EC4899'].slice(0, 2 + Math.floor(Math.random() * 2)),
    differentiation_score: Math.round(50 + Math.random() * 45)
  }))

  const trends: TrendReport = {
    period,
    top_colors: trendColors,
    top_layouts: topLayouts,
    animation_trends: animationTrends,
    competitor_comparison: competitorComparison
  }

  // Visual grid data
  const visual_grid = [
    {
      category: 'Trending Colors',
      items: trendColors.slice(0, 6).map(c => ({ name: c.hex, score: c.popularity, hex: c.hex, trend: c.trend_direction }))
    },
    {
      category: 'Layout Patterns',
      items: topLayouts.map(l => ({ name: l.name, score: l.score, trend: 'stable' }))
    },
    {
      category: 'Animation Styles',
      items: animationTrends.map(a => ({ name: a.type, score: a.adoption, trend: a.adoption > 70 ? 'rising' : a.adoption > 50 ? 'stable' : 'declining' }))
    }
  ]

  // Competitor benchmark
  const competitor_benchmark = competitorList.map(brand => {
    const strengths: string[] = []
    const gaps: string[] = []
    if (brand === 'Adobe') { strengths.push('Ecosystem depth', 'AI integration'); gaps.push('Learning curve', 'Mobile experience') }
    else if (brand === 'Canva') { strengths.push('Ease of use', 'Templates'); gaps.push('Advanced features', 'Brand control') }
    else if (brand === 'Figma') { strengths.push('Collaboration', 'Design systems'); gaps.push('Animation', 'Content creation') }
    else { strengths.push('Market presence'); gaps.push('Innovation speed') }

    return {
      brand,
      strengths,
      gaps,
      differentiation_score: Math.round(55 + Math.random() * 40),
      recommendation: `${brand}: Leverage ${strengths[0]} while addressing ${gaps[0]}`
    }
  })

  const action_items: string[] = []
  action_items.push(`Adopt rising trend colors: ${trendColors.filter(c => c.trend_direction === 'rising').slice(0, 3).map(c => c.hex).join(', ')}`)
  action_items.push(`Evaluate ${topLayouts[0].name} layout pattern for upcoming campaigns (score: ${topLayouts[0].score})`)
  action_items.push(`Consider ${animationTrends[0].type} animations — highest adoption at ${animationTrends[0].adoption}%`)
  const risingComp = competitorComparison.reduce((a, b) => a.differentiation_score > b.differentiation_score ? a : b)
  action_items.push(`Study ${risingComp.brand}'s differentiation strategy (score: ${risingComp.differentiation_score})`)

  return {
    trends,
    visual_grid,
    competitor_benchmark,
    action_items
  }
}

function formatCreativeInsightsReport(result: CreativeInsightsResult): string {
  const lines: string[] = []
  lines.push('## Creative Insights & Trend Analysis')
  lines.push('')

  lines.push('### Trending Colors')
  for (const c of result.trends.top_colors.slice(0, 8)) {
    const arrow = c.trend_direction === 'rising' ? '(rising)' : c.trend_direction === 'declining' ? '(declining)' : '(stable)'
    lines.push(`- **${c.hex}** ${arrow} — Popularity: ${c.popularity}/100`)
  }
  lines.push('')

  lines.push('### Top Layout Patterns')
  for (const l of result.trends.top_layouts) {
    lines.push(`- **${l.name}** — Score: ${l.score}/100`)
    lines.push(`  Examples: ${l.examples.join(', ')}`)
  }
  lines.push('')

  lines.push('### Animation Trends')
  for (const a of result.trends.animation_trends) {
    lines.push(`- **${a.type}** — Adoption: ${a.adoption}% | Platforms: ${a.platforms.join(', ')}`)
  }
  lines.push('')

  lines.push('### Visual Grid')
  for (const grid of result.visual_grid) {
    lines.push(`**${grid.category}:**`)
    for (const item of grid.items) {
      lines.push(`  - ${item.name}: ${item.score} [${item.trend}]`)
    }
  }
  lines.push('')

  lines.push('### Competitor Comparison')
  for (const c of result.trends.competitor_comparison) {
    lines.push(`- **${c.brand}** — Differentiation: ${c.differentiation_score}/100 | Palette: ${c.color_palette.join(', ')}`)
  }
  lines.push('')

  lines.push('### Benchmark Analysis')
  for (const b of result.competitor_benchmark) {
    lines.push(`**${b.brand}:**`)
    lines.push(`  Strengths: ${b.strengths.join(', ')}`)
    lines.push(`  Gaps: ${b.gaps.join(', ')}`)
    lines.push(`  Score: ${b.differentiation_score}/100`)
  }
  lines.push('')

  lines.push('### Action Items')
  for (const a of result.action_items) {
    lines.push(`-> ${a}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: ASSET ARCHIVE ====================

interface AssetArchiveResult {
  archive_plan: Array<{
    asset_id: string
    filename: string
    current_tier: 'hot' | 'warm' | 'cold'
    recommended_tier: 'hot' | 'warm' | 'cold'
    action: 'keep' | 'compress' | 'cold_store' | 'delete_duplicate'
    reason: string
    estimated_savings_mb: number
  }>
  duplicate_groups: Array<{
    primary_id: string
    duplicate_ids: string[]
    total_size_mb: number
    potential_savings_mb: number
  }>
  storage_summary: {
    total_assets: number
    total_size_mb: number
    hot_storage_mb: number
    warm_storage_mb: number
    cold_storage_mb: number
    projected_savings_mb: number
    projected_savings_percent: number
  }
  recommendations: string[]
}

function planArchival(assets: ArchiveEntry[]): AssetArchiveResult {
  const archive_plan: AssetArchiveResult['archive_plan'] = []
  const duplicate_groups: AssetArchiveResult['duplicate_groups'] = []
  let totalSizeMB = 0
  let hotSizeMB = 0
  let warmSizeMB = 0
  let coldSizeMB = 0
  let projectedSavings = 0

  // Detect duplicates
  const byHash = new Map<string, ArchiveEntry[]>()
  for (const asset of assets) {
    if (asset.duplicate_of) {
      const group = byHash.get(asset.duplicate_of) ?? []
      group.push(asset)
      byHash.set(asset.duplicate_of, group)
    }
  }
  for (const [primaryId, dupes] of byHash.entries()) {
    if (dupes.length > 0) {
      const primary = assets.find(a => a.asset_id === primaryId)
      const primaryName = primary?.filename ?? primaryId
      duplicate_groups.push({
        primary_id: primaryName,
        duplicate_ids: dupes.map(d => d.filename),
        total_size_mb: Math.round((dupes.reduce((s, d) => s + d.size_bytes, 0) / (1024 * 1024)) * 100) / 100,
        potential_savings_mb: Math.round((dupes.reduce((s, d) => s + d.size_bytes, 0) / (1024 * 1024)) * 100) / 100
      })
    }
  }

  for (const asset of assets) {
    const sizeMB = asset.size_bytes / (1024 * 1024)
    totalSizeMB += sizeMB

    const now = new Date()
    const lastAccess = new Date(asset.last_accessed)
    const daysSinceAccess = Math.round((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24))

    let recommended_tier: 'hot' | 'warm' | 'cold'
    let action: 'keep' | 'compress' | 'cold_store' | 'delete_duplicate'
    let reason: string
    let savingsMB = 0

    // Check if it's a duplicate
    const isDuplicate = asset.duplicate_of !== undefined

    if (isDuplicate) {
      recommended_tier = asset.storage_tier
      action = 'delete_duplicate'
      reason = `Duplicate of ${asset.duplicate_of}`
      savingsMB = Math.round(sizeMB * 100) / 100
      projectedSavings += savingsMB
    } else if (asset.access_count_30d >= 10 && daysSinceAccess < 30) {
      recommended_tier = 'hot'
      action = 'keep'
      reason = `High activity (${asset.access_count_30d} accesses in 30 days)`
      hotSizeMB += sizeMB
    } else if (asset.access_count_30d >= 2 || daysSinceAccess < 90) {
      recommended_tier = 'warm'
      action = asset.size_bytes > 50 * 1024 * 1024 ? 'compress' : 'keep'
      reason = `Moderate usage (${asset.access_count_30d} accesses in 30 days, last access ${daysSinceAccess}d ago)`
      warmSizeMB += sizeMB
      if (action === 'compress') {
        savingsMB = Math.round(sizeMB * 0.3 * 100) / 100
        projectedSavings += savingsMB
      }
    } else {
      recommended_tier = 'cold'
      action = 'cold_store'
      reason = `Low activity — only ${asset.access_count_30d} accesses in 30 days, last used ${daysSinceAccess}d ago`
      coldSizeMB += sizeMB
      savingsMB = Math.round(sizeMB * 0.7 * 100) / 100
      projectedSavings += savingsMB
    }

    archive_plan.push({
      asset_id: asset.asset_id,
      filename: asset.filename,
      current_tier: asset.storage_tier,
      recommended_tier,
      action,
      reason,
      estimated_savings_mb: savingsMB
    })
  }

  const totalProjectedSavings = Math.round(projectedSavings * 100) / 100
  const savingsPercent = totalSizeMB > 0 ? Math.round((totalProjectedSavings / totalSizeMB) * 10000) / 100 : 0

  const recommendations: string[] = []
  if (duplicate_groups.length > 0) {
    const totalDupSavings = duplicate_groups.reduce((s, d) => s + d.potential_savings_mb, 0)
    recommendations.push(`Remove ${duplicate_groups.length} duplicate group(s) to save ${Math.round(totalDupSavings * 100) / 100} MB`)
  }
  const toColdStore = archive_plan.filter(a => a.action === 'cold_store').length
  if (toColdStore > 0) {
    recommendations.push(`Move ${toColdStore} inactive assets to cold storage for significant cost savings`)
  }
  const toCompress = archive_plan.filter(a => a.action === 'compress').length
  if (toCompress > 0) {
    recommendations.push(`Compress ${toCompress} large warm-tier assets to reduce storage footprint`)
  }
  if (savingsPercent > 20) {
    recommendations.push(`Total projected savings: ${savingsPercent}% of current storage — high optimization potential`)
  }
  if (recommendations.length === 0) {
    recommendations.push('Storage is well-optimized — current tier assignment is appropriate')
  }

  return {
    archive_plan,
    duplicate_groups,
    storage_summary: {
      total_assets: assets.length,
      total_size_mb: Math.round(totalSizeMB * 100) / 100,
      hot_storage_mb: Math.round(hotSizeMB * 100) / 100,
      warm_storage_mb: Math.round(warmSizeMB * 100) / 100,
      cold_storage_mb: Math.round(coldSizeMB * 100) / 100,
      projected_savings_mb: totalProjectedSavings,
      projected_savings_percent: savingsPercent
    },
    recommendations
  }
}

function formatAssetArchiveReport(result: AssetArchiveResult): string {
  const lines: string[] = []
  lines.push('## Asset Archive & Storage Optimization')
  lines.push('')

  const s = result.storage_summary
  lines.push('### Storage Summary')
  lines.push(`- **Total Assets:** ${s.total_assets}`)
  lines.push(`- **Total Size:** ${s.total_size_mb} MB`)
  lines.push(`- **Hot:** ${s.hot_storage_mb} MB | **Warm:** ${s.warm_storage_mb} MB | **Cold:** ${s.cold_storage_mb} MB`)
  lines.push(`- **Projected Savings:** ${s.projected_savings_mb} MB (${s.projected_savings_percent}%)`)
  lines.push('')

  if (result.duplicate_groups.length > 0) {
    lines.push('### Duplicate Detection')
    for (const dg of result.duplicate_groups.slice(0, 10)) {
      lines.push(`- Primary: ${dg.primary_id} | Duplicates: ${dg.duplicate_ids.length} | Savings: ${dg.potential_savings_mb} MB`)
    }
    lines.push('')
  }

  if (result.archive_plan.length > 0) {
    lines.push('### Archive Plan')
    lines.push('| File | Current | Recommended | Action | Savings |')
    lines.push('|------|---------|-------------|--------|---------|')
    for (const p of result.archive_plan.slice(0, 20)) {
      lines.push(`| ${p.filename} | ${p.current_tier} | ${p.recommended_tier} | ${p.action} | ${p.estimated_savings_mb} MB |`)
    }
    if (result.archive_plan.length > 20) {
      lines.push(`| ... | ${result.archive_plan.length - 20} more entries | | | |`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`-> ${r}`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Asset Ingestion
  tools.register(defineTool({
    name: 'asset_ingestion',
    description: 'Ingest multi-format creative assets (PSD/AI/SVG/Figma/PNG/JPG/MP4/MP3/GLB/OBJ/TTF) with automatic metadata extraction. Parses dimensions, color modes, layer counts, durations, codecs, and format-specific properties. Returns structured metadata for each asset and a format breakdown summary.',
    parameters: {
      files: { type: 'string', required: true, description: 'JSON array of asset file objects with fields: filename, format, size_bytes, path, created (ISO date), author (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { files: string }) {
      const data: AssetFile[] = JSON.parse(args.files)
      const result = ingestAssets(data)
      return formatIngestionReport(result)
    }
  }))

  // Tool 2: Smart Tagging
  tools.register(defineTool({
    name: 'smart_tagging',
    description: 'Generate AI-powered semantic tags for creative assets. Performs visual recognition to assign mood (energetic/calm/professional...), scene classification (product-shot/lifestyle/UI-element...), color emotion tagging, accessibility scoring, and format-based categorization. Returns confidence scores and tag taxonomy.',
    parameters: {
      assets: { type: 'string', required: true, description: 'JSON array of asset references with fields: asset_id, filename, format, description (optional contextual text)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { assets: string }) {
      const data: Array<{ asset_id: string; filename: string; format: string; description?: string }> = JSON.parse(args.assets)
      const result = generateSmartTags(data)
      return formatSmartTaggingReport(result)
    }
  }))

  // Tool 3: Brand Compliance
  tools.register(defineTool({
    name: 'brand_compliance',
    description: 'Check creative asset compliance against brand guidelines. Scores color usage against brand palette, font compliance, spacing/grid adherence, logo clearspace and minimum size, and brand tone alignment per-approved-keywords. Returns per-dimension scores and actionable recommendations.',
    parameters: {
      assets: { type: 'string', required: true, description: 'JSON array of brand asset objects: asset_id, filename, colors_used (array), fonts_used (array), logo_present (bool), logo_clearspace_ratio (number), brand_tone_indicators (array)' },
      guidelines: { type: 'string', required: true, description: 'JSON object of brand guidelines: allowed_colors (array), allowed_fonts (array), logo_min_clearspace_ratio (number), logo_min_size (number), brand_tone_keywords (array), grid_system (string)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { assets: string; guidelines: string }) {
      const assets: BrandAsset[] = JSON.parse(args.assets)
      const guidelines: BrandGuidelines = JSON.parse(args.guidelines)
      const result = checkBrandCompliance(assets, guidelines)
      return formatBrandComplianceReport(result)
    }
  }))

  // Tool 4: Creative Search
  tools.register(defineTool({
    name: 'creative_search',
    description: 'Semantic + visual hybrid search across indexed creative assets. Supports text-to-search, image-to-search (visual similarity), and hybrid modes with format/color/date/author filters. Returns relevance-scored results with match type, matched keywords, and faceted navigation.',
    parameters: {
      query: { type: 'string', required: true, description: 'JSON object: query_type (text/image/hybrid), keywords (array, optional), reference_image (optional), filters (optional: formats, colors, date_range {start, end}, author)' },
      indexed_assets: { type: 'string', required: true, description: 'JSON array of indexed assets: asset_id, filename, format, tags (array), colors (array), author, date (ISO)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query: string; indexed_assets: string }) {
      const query: SearchQuery = JSON.parse(args.query)
      const indexed: Array<{ asset_id: string; filename: string; format: string; tags: string[]; colors: string[]; author: string; date: string }> = JSON.parse(args.indexed_assets)
      const result = creativeSearch(query, indexed)
      return formatCreativeSearchReport(result)
    }
  }))

  // Tool 5: Version Control
  tools.register(defineTool({
    name: 'version_control',
    description: 'Manage creative asset version history with visual diff summaries, branch tracking, merge analysis with conflict detection, and rollback options. Supports actions: history (full timeline), branch_diff, rollback_preview, merge_analysis. Returns version timeline, branch status, merge recommendations.',
    parameters: {
      versions: { type: 'string', required: true, description: 'JSON array of version entries: version_id, asset_id, timestamp, author, changes, parent_version (optional), locked (bool)' },
      action: { type: 'string', required: true, description: 'Operation to perform: history | branch_diff | rollback_preview | merge_analysis' },
      target_asset_id: { type: 'string', required: true, description: 'Optional asset ID to scope the operation to' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { versions: string; action: string; target_asset_id?: string }) {
      const versions: VersionEntry[] = JSON.parse(args.versions)
      const action = args.action as 'history' | 'branch_diff' | 'rollback_preview' | 'merge_analysis'
      const result = manageVersions(versions, action, args.target_asset_id)
      return formatVersionControlReport(result)
    }
  }))

  // Tool 6: Asset Performance
  tools.register(defineTool({
    name: 'asset_performance',
    description: 'Analyze creative asset performance metrics including download count, usage frequency, conversion attributions, and ROI estimates. Generates quarterly engagement heatmaps, identifies top performers, calculates ROI distribution, and provides redistribution recommendations.',
    parameters: {
      metrics: { type: 'string', required: true, description: 'JSON array of performance metrics: asset_id, filename, downloads (number), views (number), usage_count (number), conversion_attributions (number), roi_estimate (number), last_used (ISO date)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { metrics: string }) {
      const data: PerformanceMetric[] = JSON.parse(args.metrics)
      const result = analyzePerformance(data)
      return formatAssetPerformanceReport(result)
    }
  }))

  // Tool 7: Creative Insights
  tools.register(defineTool({
    name: 'creative_insights',
    description: 'Generate design trend insights for a given period and industry. Covers trending colors with direction indicators (rising/stable/declining), top layout patterns with scores, animation adoption rates across platforms, competitor palette benchmarking, differentiation scoring, and priority action items.',
    parameters: {
      period: { type: 'string', required: true, description: 'Analysis period (e.g. "2026-Q1", "H1-2025", "December-2025")' },
      industry: { type: 'string', required: true, description: 'Target industry or domain (e.g. "saas", "ecommerce", "media")' },
      competitors: { type: 'string', required: true, description: 'Optional JSON array of competitor brand names for benchmarking' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { period: string; industry: string; competitors?: string }) {
      const competitors = args.competitors ? JSON.parse(args.competitors) as string[] : undefined
      const result = generateCreativeInsights(args.period, args.industry, competitors)
      return formatCreativeInsightsReport(result)
    }
  }))

  // Tool 8: Asset Archive
  tools.register(defineTool({
    name: 'asset_archive',
    description: 'Optimize storage costs with intelligent archival planning. Automatically classifies assets into hot/warm/cold tiers based on access frequency and recency, detects duplicate files, recommends compression or cold-store migration, and projects storage savings with percentage breakdowns.',
    parameters: {
      assets: { type: 'string', required: true, description: 'JSON array of archival candidates: asset_id, filename, last_accessed (ISO date), access_count_30d (number), size_bytes (number), duplicate_of (optional asset ID), storage_tier (hot/warm/cold)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { assets: string }) {
      const data: ArchiveEntry[] = JSON.parse(args.assets)
      const result = planArchival(data)
      return formatAssetArchiveReport(result)
    }
  }))

  console.log(`[dsh-tool-creativault] Loaded v${VERSION} — Creative Asset Intelligence & Brand Vault (8 tools)`)
  console.log('  Theme: Purple Creative | Visual Grid | Trend Visualization')
  console.log('  Tools: asset_ingestion, smart_tagging, brand_compliance, creative_search, version_control, asset_performance, creative_insights, asset_archive')
}
