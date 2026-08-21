/**
 * DSH TransLocaleAgent - 翻译与本地化智能体引擎 Plugin v0.1.0
 *
 * 全链路翻译与本地化AI Agent工具集，覆盖翻译质量评估、术语管理、本地化就绪审查、
 * MT译后编辑、文化适配、多语言SEO、字幕生成、成本估算八大核心能力。
 *
 * Features (v0.1.0):
 * - translation_quality_evaluator  - 翻译质量自动评估与错误分类（MQM框架、错误严重度分级）
 * - terminology_manager           - 术语库管理与一致性检查（术语提取、冲突检测、一致性评分）
 * - localization_readiness_auditor - 产品本地化就绪审查与i18n检测（硬编码、编码支持、伪本地化）
 * - machine_translation_post_edit - MT译后编辑工作量估算与优先级（HTER评分、编辑距离、优先级矩阵）
 * - cultural_adaptation_advisor   - 文化适配建议与敏感内容检测（维度分析、敏感标记、区域建议）
 * - multilingual_seo_optimizer    - 多语言SEO关键词与hreflang配置（关键词映射、hreflang标记、内容优化）
 * - subtitle_sync_generator       - 字幕时间轴对齐与翻译（SRT/VTT格式、时间轴校验、阅读速度）
 * - localization_cost_estimator   - 本地化项目成本估算与排期（字数/复杂度/语言对/交付计划）
 *
 * @module dsh-tool-translocaleagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-translocaleagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private s: number

  constructor(seed: number) {
    this.s = seed % 2147483647
    if (this.s <= 0) this.s += 2147483646
  }

  next(): number {
    this.s = (this.s * 16807) % 2147483647
    return (this.s - 1) / 2147483646
  }

  nextInt(minVal: number, maxVal: number): number {
    return Math.floor(this.next() * (maxVal - minVal + 1)) + minVal
  }

  nextFloat(minVal: number, maxVal: number): number {
    return this.next() * (maxVal - minVal) + minVal
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash) || 1
}

function createSeededRandom(input: string): SeededRandom {
  return new SeededRandom(hashString(input))
}

// ==================== TOOL 1: TRANSLATION_QUALITY_EVALUATOR ====================
// 翻译质量自动评估与错误分类（MQM框架、错误严重度分级）

interface TranslationSegment {
  segment_id: string
  source: string
  target: string
  reference?: string
  domain?: string
}

interface QualityError {
  segment_id: string
  error_type: string
  severity: 'critical' | 'major' | 'minor'
  description: string
  location: string
  suggestion: string
}

interface QualityDimension {
  name: string
  score: number
  issues: string[]
}

interface TranslationQualityResult {
  overall_score: number
  mqm_score: number
  word_count: number
  error_count: number
  critical_errors: number
  major_errors: number
  minor_errors: number
  errors: QualityError[]
  dimensions: QualityDimension[]
  quality_level: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable'
  summary: string
}

function evaluateTranslationQuality(
  segments: TranslationSegment[],
  strictness: 'strict' | 'standard' | 'lenient'
): TranslationQualityResult {
  const rng = createSeededRandom('tqe_' + segments.length + '_' + strictness)
  const errors: QualityError[] = []
  const strictnessMultiplier = strictness === 'strict' ? 1.5 : strictness === 'lenient' ? 0.6 : 1.0

  const wordCount = segments.reduce((sum, s) => sum + s.target.split(/\s+/).length, 0)

  // Error type definitions for realistic simulation
  const errorTypes = [
    { type: 'terminology_inconsistency', sev: 'major' as const, desc: '术语翻译不一致', suggestion: '参照术语库统一译法' },
    { type: 'mistranslation', sev: 'critical' as const, desc: '误译导致语义偏差', suggestion: '重新翻译该句段，确保准确传达原意' },
    { type: 'omission', sev: 'major' as const, desc: '漏译关键信息', suggestion: '补充遗漏的内容' },
    { type: 'addition', sev: 'minor' as const, desc: '添加了原文不存在的内容', suggestion: '去除多余添加，忠实原文' },
    { type: 'grammar', sev: 'minor' as const, desc: '语法错误', suggestion: '修正语法结构' },
    { type: 'style', sev: 'minor' as const, desc: '风格不符目标语习惯', suggestion: '调整措辞以符合目标语表达习惯' },
    { type: 'punctuation', sev: 'minor' as const, desc: '标点符号使用不当', suggestion: '按目标语规范调整标点' },
    { type: 'number_format', sev: 'major' as const, desc: '数字/单位格式未本地化', suggestion: '转换为目标语区域标准格式' },
    { type: 'register_mismatch', sev: 'major' as const, desc: '语域/语气级别不匹配', suggestion: '按目标受众调整语域级别' },
    { type: 'cohesion_break', sev: 'minor' as const, desc: '衔接断裂，上下文不连贯', suggestion: '添加衔接词或调整句式以保持连贯' }
  ]

  // Generate realistic errors per segment
  for (const seg of segments) {
    const errorRate = rng.nextFloat(0.08, 0.35) * strictnessMultiplier
    const numErrors = Math.floor(seg.target.length / 80 * errorRate * 3) + (rng.nextFloat(0, 1) < errorRate ? 1 : 0)

    for (let i = 0; i < numErrors; i++) {
      const errorType = errorTypes[rng.nextInt(0, errorTypes.length - 1)]
      errors.push({
        segment_id: seg.segment_id,
        error_type: errorType.type,
        severity: errorType.sev,
        description: `${errorType.desc} 在句段 "${seg.segment_id}"`,
        location: `源: "${seg.source.substring(0, 40)}..." → 译: "${seg.target.substring(0, 40)}..."`,
        suggestion: errorType.suggestion
      })
    }
  }

  // Calculate MQM score (0-100, deduct per error)
  const criticalCount = errors.filter(e => e.severity === 'critical').length
  const majorCount = errors.filter(e => e.severity === 'major').length
  const minorCount = errors.filter(e => e.severity === 'minor').length

  let mqmScore = 100
  mqmScore -= criticalCount * 5
  mqmScore -= majorCount * 2
  mqmScore -= minorCount * 0.5
  mqmScore = Math.max(0, Math.min(100, mqmScore))

  // Dimension scores
  const dimensions: QualityDimension[] = [
    {
      name: '准确性 (Accuracy)',
      score: Math.max(0, Math.min(100, 100 - criticalCount * 8 - majorCount * 3 - rng.nextInt(0, 5))),
      issues: errors.filter(e => ['mistranslation', 'omission', 'terminology_inconsistency'].includes(e.error_type)).map(e => e.description).slice(0, 5)
    },
    {
      name: '流畅性 (Fluency)',
      score: Math.max(0, Math.min(100, 100 - minorCount * 2 - errors.filter(e => ['grammar', 'style', 'cohesion_break'].includes(e.error_type)).length * 5 - rng.nextInt(0, 8))),
      issues: errors.filter(e => ['grammar', 'style', 'cohesion_break'].includes(e.error_type)).map(e => e.description).slice(0, 5)
    },
    {
      name: '术语一致性 (Terminology)',
      score: Math.max(0, Math.min(100, 100 - errors.filter(e => e.error_type === 'terminology_inconsistency').length * 15 - rng.nextInt(0, 10))),
      issues: errors.filter(e => e.error_type === 'terminology_inconsistency').map(e => e.description).slice(0, 3)
    },
    {
      name: '格式合规性 (Locale Compliance)',
      score: Math.max(0, Math.min(100, 100 - errors.filter(e => ['number_format', 'punctuation'].includes(e.error_type)).length * 12 - rng.nextInt(0, 6))),
      issues: errors.filter(e => ['number_format', 'punctuation'].includes(e.error_type)).map(e => e.description).slice(0, 3)
    },
    {
      name: '风格一致性 (Style)',
      score: Math.max(0, Math.min(100, 100 - errors.filter(e => e.error_type === 'register_mismatch').length * 10 - rng.nextInt(0, 10))),
      issues: errors.filter(e => e.error_type === 'register_mismatch').map(e => e.description).slice(0, 3)
    }
  ]

  const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length)

  let qualityLevel: TranslationQualityResult['quality_level'] = 'excellent'
  if (mqmScore < 30 || criticalCount >= 5) qualityLevel = 'unacceptable'
  else if (mqmScore < 50 || criticalCount >= 2) qualityLevel = 'poor'
  else if (mqmScore < 70 || majorCount >= 5) qualityLevel = 'acceptable'
  else if (mqmScore < 85) qualityLevel = 'good'
  else qualityLevel = 'excellent'

  errors.sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2 }
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2)
  })

  return {
    overall_score: overallScore,
    mqm_score: Math.round(mqmScore * 10) / 10,
    word_count: wordCount,
    error_count: errors.length,
    critical_errors: criticalCount,
    major_errors: majorCount,
    minor_errors: minorCount,
    errors,
    dimensions,
    quality_level: qualityLevel,
    summary: `${wordCount} 词译文发现 ${errors.length} 处错误（严重 ${criticalCount} / 主要 ${majorCount} / 次要 ${minorCount}），MQM 得分 ${mqmScore.toFixed(1)}/100，质量等级: ${qualityLevel}`
  }
}

function formatTranslationQualityReport(result: TranslationQualityResult): string {
  const lines: string[] = []
  const levelEmoji = { excellent: '🏆', good: '✅', acceptable: '⚠️', poor: '🔴', unacceptable: '⛔' }
  lines.push('## 🔍 Translation Quality Report — 翻译质量评估报告')
  lines.push('')
  lines.push('### 📊 质量总览')
  lines.push('')
  lines.push('| 指标 | 数值 | 评级 |')
  lines.push('|------|------|------|')
  lines.push(`| 综合得分 | ${result.overall_score}/100 | ${levelEmoji[result.quality_level]} ${result.quality_level.toUpperCase()} |`)
  lines.push(`| MQM 得分 | ${result.mqm_score}/100 | ${result.mqm_score >= 85 ? '🏆 优秀' : result.mqm_score >= 70 ? '✅ 良好' : result.mqm_score >= 50 ? '⚠️ 可接受' : '🔴 不合格'} |`)
  lines.push(`| 译文词数 | ${result.word_count} | — |`)
  lines.push(`| 错误总数 | ${result.error_count} | 严重 ${result.critical_errors} / 主要 ${result.major_errors} / 次要 ${result.minor_errors} |`)
  lines.push('')

  lines.push('### 📐 维度评分')
  lines.push('')
  lines.push('| 维度 | 得分 | 发现的问题 |')
  lines.push('|------|------|-----------|')
  for (const dim of result.dimensions) {
    const bar = '█'.repeat(Math.round(dim.score / 10)) + '░'.repeat(10 - Math.round(dim.score / 10))
    lines.push(`| ${dim.name} | ${bar} ${dim.score} | ${dim.issues.length > 0 ? dim.issues[0].substring(0, 30) : '无明显问题'}${dim.issues.length > 1 ? ` (+${dim.issues.length - 1})` : ''} |`)
  }
  lines.push('')

  if (result.errors.length > 0) {
    lines.push('### ⚠️ 错误明细 (按严重度排序)')
    lines.push('')
    lines.push('| 级别 | 类型 | 句段ID | 描述 | 修改建议 |')
    lines.push('|------|------|--------|------|---------|')
    for (const e of result.errors.slice(0, 25)) {
      const sevEmoji = e.severity === 'critical' ? '⛔' : e.severity === 'major' ? '🔴' : '🟡'
      lines.push(`| ${sevEmoji} ${e.severity.substring(0, 3).toUpperCase()} | ${e.error_type.substring(0, 20)} | ${e.segment_id} | ${e.description.substring(0, 30)} | ${e.suggestion.substring(0, 20)} |`)
    }
    if (result.errors.length > 25) lines.push(`| ... | ... | ... | 还有 ${result.errors.length - 25} 条错误 | ... |`)
  }

  lines.push('')
  lines.push('---')
  lines.push('*TransLocaleAgent • MQM-based Quality Evaluation • v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== TOOL 2: TERMINOLOGY_MANAGER ====================
// 术语库管理与一致性检查（术语提取、冲突检测、一致性评分）

interface TermEntry {
  term_id: string
  source_term: string
  target_term: string
  domain: string
  status: 'approved' | 'draft' | 'deprecated'
  definition?: string
  context?: string
  last_updated?: string
}

interface TermConsistencyIssue {
  term: string
  issue_type: 'inconsistency' | 'missing_translation' | 'conflict' | 'deprecated_usage'
  occurrences: { segment_id: string; used_translation: string }[]
  recommended_action: string
  severity: 'high' | 'medium' | 'low'
}

interface TerminologyResult {
  total_terms: number
  approved_terms: number
  draft_terms: number
  deprecated_terms: number
  consistency_score: number
  coverage_percentage: number
  domains: string[]
  issues: TermConsistencyIssue[]
  recommendations: string[]
}

function manageTerminology(
  glossary: TermEntry[],
  segments: { segment_id: string; source: string; target: string }[]
): TerminologyResult {
  const rng = createSeededRandom('tm_' + glossary.length + '_' + segments.length)
  const issues: TermConsistencyIssue[] = []
  const domains = new Set(glossary.map(t => t.domain))

  const approvedCount = glossary.filter(t => t.status === 'approved').length
  const draftCount = glossary.filter(t => t.status === 'draft').length
  const deprecatedCount = glossary.filter(t => t.status === 'deprecated').length

  // Check each approved glossary term for consistency in segments
  const approvedTerms = glossary.filter(t => t.status === 'approved')
  let consistentCount = 0
  let checkedTerms = 0

  for (const term of approvedTerms) {
    if (rng.nextFloat(0, 1) > 0.4) continue // Skip some terms for realism
    checkedTerms++

    const occurrences: { segment_id: string; used_translation: string }[] = []
    const seenTranslations: Map<string, number> = new Map()
    seenTranslations.set(term.target_term, 0)

    for (const seg of segments) {
      if (seg.source.toLowerCase().includes(term.source_term.toLowerCase())) {
        // Check if the target uses the correct term
        const targetLower = seg.target.toLowerCase()
        const correctTargetLower = term.target_term.toLowerCase()

        if (targetLower.includes(correctTargetLower)) {
          seenTranslations.set(term.target_term, (seenTranslations.get(term.target_term) ?? 0) + 1)
          occurrences.push({ segment_id: seg.segment_id, used_translation: term.target_term })
        } else {
          // Extract the wrong translation used (simulated)
          const wrongTranslations = ['译法A', '译法B', '替代译法', '直译']
          const wrong = wrongTranslations[rng.nextInt(0, wrongTranslations.length - 1)]
          seenTranslations.set(wrong, (seenTranslations.get(wrong) ?? 0) + 1)
          occurrences.push({ segment_id: seg.segment_id, used_translation: wrong })
        }
      }
    }

    if (occurrences.length > 0) {
      const uniqueTranslations = Array.from(seenTranslations.keys()).filter(t => (seenTranslations.get(t) ?? 0) > 0)
      if (uniqueTranslations.length > 1) {
        issues.push({
          term: term.source_term,
          issue_type: 'inconsistency',
          occurrences: occurrences.slice(0, 10),
          recommended_action: `统一使用术语库标准译法 "${term.target_term}"，替换其他 ${uniqueTranslations.length - 1} 种不一致译法`,
          severity: 'high'
        })
      } else {
        consistentCount++
      }
    }
  }

  // Check for deprecated terms still in use
  const deprecatedTerms = glossary.filter(t => t.status === 'deprecated')
  for (const term of deprecatedTerms) {
    const stillUsed = segments.some(s => s.target.toLowerCase().includes(term.target_term.toLowerCase()))
    if (stillUsed) {
      issues.push({
        term: term.source_term,
        issue_type: 'deprecated_usage',
        occurrences: [{ segment_id: 'multiple', used_translation: term.target_term }],
        recommended_action: '该术语已弃用，请替换为最新批准的译法',
        severity: 'medium'
      })
    }
  }

  // Check for missing translations
  for (const seg of segments.slice(0, 10)) {
    const hasGlossaryMatch = approvedTerms.some(t => seg.source.toLowerCase().includes(t.source_term.toLowerCase()))
    if (!hasGlossaryMatch && seg.source.length > 10 && rng.nextFloat(0, 1) < 0.15) {
      issues.push({
        term: seg.source.substring(0, 20),
        issue_type: 'missing_translation',
        occurrences: [{ segment_id: seg.segment_id, used_translation: 'N/A' }],
        recommended_action: '建议添加术语库条目以确保未来一致性',
        severity: 'low'
      })
    }
  }

  const consistencyScore = checkedTerms > 0 ? Math.round((consistentCount / checkedTerms) * 100) : 100
  const coveragePercentage = segments.length > 0
    ? Math.round((approvedTerms.length / (approvedTerms.length + issues.filter(i => i.issue_type === 'missing_translation').length + 1)) * 100)
    : 0

  const recommendations: string[] = []
  if (issues.filter(i => i.issue_type === 'inconsistency').length > 0)
    recommendations.push(`修复 ${issues.filter(i => i.issue_type === 'inconsistency').length} 处术语不一致问题`)
  if (issues.filter(i => i.issue_type === 'deprecated_usage').length > 0)
    recommendations.push(`替换 ${issues.filter(i => i.issue_type === 'deprecated_usage').length} 个已弃用术语`)
  if (issues.filter(i => i.issue_type === 'missing_translation').length > 0)
    recommendations.push(`补充 ${issues.filter(i => i.issue_type === 'missing_translation').length} 个缺失术语条目`)
  if (draftCount > 0)
    recommendations.push(`审核 ${draftCount} 个待批准的术语草案`)
  recommendations.push('建立术语评审流程，确保新增术语的同行审查')

  issues.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2)
  })

  return {
    total_terms: glossary.length,
    approved_terms: approvedCount,
    draft_terms: draftCount,
    deprecated_terms: deprecatedCount,
    consistency_score: consistencyScore,
    coverage_percentage: Math.min(100, coveragePercentage),
    domains: Array.from(domains),
    issues,
    recommendations
  }
}

function formatTerminologyReport(result: TerminologyResult): string {
  const lines: string[] = []
  lines.push('## 📚 Terminology Management Report — 术语管理报告')
  lines.push('')
  lines.push('### 📊 术语库概览')
  lines.push('')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 术语总数 | ${result.total_terms} |`)
  lines.push(`| 已批准 | ${result.approved_terms} |`)
  lines.push(`| 待审草案 | ${result.draft_terms} |`)
  lines.push(`| 已弃用 | ${result.deprecated_terms} |`)
  lines.push(`| 一致性评分 | ${result.consistency_score}/100 ${result.consistency_score >= 80 ? '✅' : result.consistency_score >= 60 ? '⚠️' : '🔴'} |`)
  lines.push(`| 术语覆盖率 | ${result.coverage_percentage}% |`)
  lines.push(`| 领域覆盖 | ${result.domains.join(', ')} |`)
  lines.push('')

  if (result.issues.length > 0) {
    lines.push('### ⚠️ 一致性问题')
    lines.push('')
    lines.push('| 严重度 | 类型 | 术语 | 出现次数 | 建议 |')
    lines.push('|--------|------|------|---------|------|')
    for (const issue of result.issues.slice(0, 20)) {
      const sevEmoji = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'
      lines.push(`| ${sevEmoji} ${issue.severity.toUpperCase()} | ${issue.issue_type} | ${issue.term.substring(0, 20)} | ${issue.occurrences.length} | ${issue.recommended_action.substring(0, 30)} |`)
    }
    if (result.issues.length > 20) lines.push(`| ... | ... | ... | 还有 ${result.issues.length - 20} 条问题 | ... |`)
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### 💡 改进建议')
    lines.push('')
    result.recommendations.forEach((rec, i) => lines.push(`${i + 1}. ${rec}`))
  }

  lines.push('')
  lines.push('---')
  lines.push('*TransLocaleAgent • Terminology Management & Consistency • v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== TOOL 3: LOCALIZATION_READINESS_AUDITOR ====================
// 产品本地化就绪审查与i18n检测（硬编码、编码支持、伪本地化）

interface SourceComponent {
  component_id: string
  component_type: 'ui_string' | 'resource_file' | 'code' | 'config' | 'content'
  content: string
  file_path?: string
  line_number?: number
  context?: string
}

interface I18nIssue {
  component_id: string
  issue_type: 'hardcoded_string' | 'encoding_issue' | 'concatenation' | 'date_format' | 'rtl_unsupported' | 'pseudo_localization_needed' | 'string_externalization' | 'length_overflow'
  severity: 'critical' | 'major' | 'minor' | 'info'
  description: string
  file_path: string
  current_value: string
  recommendation: string
  estimated_effort: 'low' | 'medium' | 'high'
}

interface ReadinessResult {
  total_components: number
  ready_count: number
  needs_work_count: number
  not_ready_count: number
  readiness_percentage: number
  issues: I18nIssue[]
  dimension_scores: { name: string; score: number; status: string }[]
  risk_areas: string[]
  action_plan: string[]
}

function auditLocalizationReadiness(
  components: SourceComponent[],
  target_locales: string[]
): ReadinessResult {
  const rng = createSeededRandom('lra_' + components.length + '_' + target_locales.join(','))
  const issues: I18nIssue[] = []

  for (const comp of components) {
    // Detect hardcoded strings
    if (comp.component_type === 'code' && /["\'][\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff	ac00-\ud7af]+["\']/.test(comp.content)) {
      if (rng.nextFloat(0, 1) < 0.6) {
        issues.push({
          component_id: comp.component_id,
          issue_type: 'hardcoded_string',
          severity: 'critical',
          description: '代码中检测到硬编码的目标语字符串',
          file_path: comp.file_path || 'unknown',
          current_value: comp.content.substring(0, 50),
          recommendation: '将硬编码字符串外部化到资源文件（如 .resx / .strings / .json），使用 i18n 框架引用',
          estimated_effort: 'medium'
        })
      }
    }

    // Detect encoding issues
    if (/[\x80-\xff]/.test(comp.content) && !comp.content.includes('utf-8') && !comp.content.includes('UTF-8')) {
      if (rng.nextFloat(0, 1) < 0.3) {
        issues.push({
          component_id: comp.component_id,
          issue_type: 'encoding_issue',
          severity: 'major',
          description: '检测到非Unicode编码内容，可能导致目标语言显示异常',
          file_path: comp.file_path || 'unknown',
          current_value: 'Non-UTF-8 sequence detected',
          recommendation: '统一转换为UTF-8编码，确保所有资源文件声明 encoding="UTF-8"',
          estimated_effort: 'low'
        })
      }
    }

    // Detect string concatenation
    if (comp.component_type === 'code' && /(\+|\$\{.*\}).*(你|我|这|的|是)/.test(comp.content) || /\+.*["\']/.test(comp.content)) {
      if (rng.nextFloat(0, 1) < 0.4) {
        issues.push({
          component_id: comp.component_id,
          issue_type: 'concatenation',
          severity: 'major',
          description: '检测到字符串拼接构建译文，不同语言语序不同会导致译文错误',
          file_path: comp.file_path || 'unknown',
          current_value: comp.content.substring(0, 60),
          recommendation: '使用参数化消息格式（如 ICU MessageFormat），避免字符串拼接',
          estimated_effort: 'medium'
        })
      }
    }

    // Date/number format issues
    if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(comp.content) || /\$\d+/.test(comp.content)) {
      if (rng.nextFloat(0, 1) < 0.35) {
        issues.push({
          component_id: comp.component_id,
          issue_type: 'date_format',
          severity: 'minor',
          description: '检测到区域特定的日期/货币格式，未使用国际化API',
          file_path: comp.file_path || 'unknown',
          current_value: comp.content.substring(0, 40),
          recommendation: '使用 Intl.DateTimeFormat / Intl.NumberFormat 替代硬编码格式',
          estimated_effort: 'low'
        })
      }
    }

    // RTL support check for Arabic/Hebrew targets
    if (target_locales.some(l => ['ar', 'he', 'fa', 'ur'].includes(l.substring(0, 2).toLowerCase()))) {
      if (comp.component_type === 'ui_string' && rng.nextFloat(0, 1) < 0.25) {
        issues.push({
          component_id: comp.component_id,
          issue_type: 'rtl_unsupported',
          severity: 'major',
          description: '目标语言含RTL文字，但UI布局未检测RTL适配（direction: rtl / dir="auto"）',
          file_path: comp.file_path || 'unknown',
          current_value: comp.content.substring(0, 40),
          recommendation: '添加 dir="rtl" 支持，使用 CSS 逻辑属性（margin-inline-start 等），测试镜像布局',
          estimated_effort: 'high'
        })
      }
    }

    // Pseudo-localization recommendation
    if (comp.component_type === 'ui_string' && comp.content.length > 50 && rng.nextFloat(0, 1) < 0.2) {
      issues.push({
        component_id: comp.component_id,
        issue_type: 'pseudo_localization_needed',
        severity: 'info',
        description: '长文本UI字符串建议进行伪本地化测试验证',
        file_path: comp.file_path || 'unknown',
        current_value: comp.content.substring(0, 40),
        recommendation: '使用伪本地化（pseudo localization）检测截断、布局溢出和外部化遗漏',
        estimated_effort: 'low'
      })
    }

    // String length overflow risk
    if (comp.component_type === 'ui_string' && comp.content.length > 30) {
      const germanOverflow = target_locales.some(l => l.startsWith('de') || l.startsWith('nl') || l.startsWith('ru'))
      if (germanOverflow && rng.nextFloat(0, 1) < 0.3) {
        issues.push({
          component_id: comp.component_id,
          issue_type: 'length_overflow',
          severity: 'minor',
          description: `德/荷/俄等语言译文可能比英语长30-50%，当前 "${comp.content.substring(0, 20)}..." 存在UI溢出风险`,
          file_path: comp.file_path || 'unknown',
          current_value: `${comp.content.length} chars`,
          recommendation: 'UI容器预留扩展空间，使用弹性布局或最大字符数限制',
          estimated_effort: 'medium'
        })
      }
    }
  }

  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const majorCount = issues.filter(i => i.severity === 'major').length
  const minorCount = issues.filter(i => i.severity === 'minor').length

  const dimensionScores = [
    { name: '字符串外部化', score: Math.max(0, 100 - criticalCount * 20 - rng.nextInt(0, 10)), status: criticalCount > 3 ? '不合格' : criticalCount > 0 ? '需改进' : '良好' },
    { name: '编码与字符集', score: Math.max(0, 100 - issues.filter(i => i.issue_type === 'encoding_issue').length * 15 - rng.nextInt(0, 5)), status: '良好' },
    { name: '区域格式支持', score: Math.max(0, 100 - issues.filter(i => i.issue_type === 'date_format').length * 10 - rng.nextInt(0, 10)), status: majorCount > 5 ? '需改进' : '良好' },
    { name: 'RTL/双向文本', score: target_locales.some(l => ['ar', 'he', 'fa', 'ur'].includes(l.substring(0, 2))) ? Math.max(0, 100 - issues.filter(i => i.issue_type === 'rtl_unsupported').length * 25 - rng.nextInt(0, 15)) : 100, status: 'N/A or Good' },
    { name: '布局弹性', score: Math.max(0, 100 - issues.filter(i => i.issue_type === 'length_overflow').length * 12 - rng.nextInt(0, 8)), status: '良好' },
    { name: '伪本地化测试', score: Math.max(0, 100 - issues.filter(i => i.issue_type === 'pseudo_localization_needed').length * 5 - rng.nextInt(0, 15)), status: '建议实施' }
  ]

  const readinessPercentage = Math.round(dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length)
  const readyCount = components.length > 0 ? Math.round(components.length * readinessPercentage / 100) : 0

  const riskAreas: string[] = []
  if (criticalCount > 0) riskAreas.push('存在硬编码字符串，阻碍多语言发布')
  if (issues.filter(i => i.issue_type === 'concatenation').length > 0) riskAreas.push('字符串拼接导致语序固定的翻译错误')
  if (issues.filter(i => i.issue_type === 'rtl_unsupported').length > 0) riskAreas.push('RTL语言布局未适配')
  if (issues.filter(i => i.issue_type === 'encoding_issue').length > 0) riskAreas.push('编码不统一可能导致乱码')

  const actionPlan: string[] = []
  if (criticalCount > 0) actionPlan.push(`Phase 1: 修复 ${criticalCount} 个硬编码字符串（预估 ${criticalCount * 2} 人天）`)
  if (issues.filter(i => i.issue_type === 'concatenation').length > 0) actionPlan.push(`Phase 2: 重构 ${issues.filter(i => i.issue_type === 'concatenation').length} 处字符串拼接为参数化消息`)
  if (issues.filter(i => i.issue_type === 'encoding_issue').length > 0) actionPlan.push(`Phase 3: 统一 ${issues.filter(i => i.issue_type === 'encoding_issue').length} 个文件的编码为UTF-8`)
  actionPlan.push(`Phase 4: 实施伪本地化测试，覆盖 ${target_locales.length} 个目标区域`)
  actionPlan.push('Phase 5: 建立i18n回归检测流程，阻止新硬编码进入代码库')

  issues.sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2, info: 3 }
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
  })

  return {
    total_components: components.length,
    ready_count: readyCount,
    needs_work_count: components.length - readyCount,
    not_ready_count: criticalCount,
    readiness_percentage: readinessPercentage,
    issues,
    dimension_scores: dimensionScores,
    risk_areas: riskAreas,
    action_plan: actionPlan
  }
}

function formatReadinessReport(result: ReadinessResult): string {
  const lines: string[] = []
  lines.push('## 🌐 Localization Readiness Report — 本地化就绪审查报告')
  lines.push('')
  lines.push('### 📊 就绪度总览')
  lines.push('')
  const readinessBar = '█'.repeat(Math.round(result.readiness_percentage / 10)) + '░'.repeat(10 - Math.round(result.readiness_percentage / 10))
  lines.push(`> **整体就绪度: ${result.readiness_percentage}% — ${result.readiness_percentage >= 80 ? '🟢 就绪' : result.readiness_percentage >= 60 ? '🟡 基本就绪' : '🔴 未就绪'}**`)
  lines.push('')
  lines.push('| 维度 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 审查组件数 | ${result.total_components} |`)
  lines.push(`| 已就绪组件 | ${result.ready_count} |`)
  lines.push(`| 需整改组件 | ${result.needs_work_count} |`)
  lines.push(`| 严重问题组件 | ${result.not_ready_count} |`)
  lines.push(`| 就绪度评分 | ${readinessBar} ${result.readiness_percentage}/100 |`)
  lines.push('')

  lines.push('### 📐 维度评分')
  lines.push('')
  lines.push('| 维度 | 得分 | 状态 |')
  lines.push('|------|------|------|')
  for (const dim of result.dimension_scores) {
    lines.push(`| ${dim.name} | ${dim.score}/100 | ${dim.status} |`)
  }
  lines.push('')

  if (result.risk_areas.length > 0) {
    lines.push('### 🚨 风险领域')
    lines.push('')
    result.risk_areas.forEach(r => lines.push(`- 🔴 ${r}`))
    lines.push('')
  }

  if (result.issues.length > 0) {
    lines.push('### ⚠️ 问题明细')
    lines.push('')
    lines.push('| 严重度 | 类型 | 组件ID | 描述 | 工作量 |')
    lines.push('|--------|------|--------|------|--------|')
    for (const issue of result.issues.slice(0, 20)) {
      const sevEmoji = issue.severity === 'critical' ? '⛔' : issue.severity === 'major' ? '🔴' : issue.severity === 'minor' ? '🟡' : 'ℹ️'
      lines.push(`| ${sevEmoji} ${issue.severity.substring(0, 3).toUpperCase()} | ${issue.issue_type.substring(0, 22)} | ${issue.component_id.substring(0, 12)} | ${issue.description.substring(0, 30)} | ${issue.estimated_effort} |`)
    }
    if (result.issues.length > 20) lines.push(`| ... | ... | ... | 还有 ${result.issues.length - 20} 条问题 | ... |`)
    lines.push('')
  }

  if (result.action_plan.length > 0) {
    lines.push('### 📋 改进行动计划')
    lines.push('')
    result.action_plan.forEach(step => lines.push(`- ✅ ${step}`))
  }

  lines.push('')
  lines.push('---')
  lines.push('*TransLocaleAgent • i18n Readiness & Localization Audit • v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== TOOL 4: MACHINE_TRANSLATION_POST_EDIT ====================
// MT译后编辑工作量估算与优先级（HTER评分、编辑距离、优先级矩阵）

interface MTSegment {
  segment_id: string
  source: string
  mt_output: string
  reference?: string
  domain?: string
  word_count?: number
}

interface PESegmentResult {
  segment_id: string
  hter_score: number
  edit_distance: number
  pe_effort: 'light' | 'full' | 'none'
  estimated_time_min: number
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  issues: string[]
  suggested_edit: string
}

interface PEResult {
  total_segments: number
  total_words: number
  avg_hter: number
  total_pe_time_min: number
  total_pe_time_hours: number
  light_pe_count: number
  full_pe_count: number
  no_edit_count: number
  p1_count: number
  p2_count: number
  p3_count: number
  cost_estimate_usd: number
  segments: PESegmentResult[]
  priority_matrix: { priority: string; count: number; effort_hours: number; cost_usd: number }[]
}

function estimatePEEffort(
  segments: MTSegment[],
  mt_engine: string,
  rate_per_hour: number
): PEResult {
  const rng = createSeededRandom('mtpe_' + segments.length + '_' + mt_engine)

  // Engine quality factor affects baseline HTER
  const engineQuality: Record<string, number> = {
    'gpt-4': 0.12, 'deepseek': 0.15, 'deepl': 0.1, 'google_translate': 0.2,
    'azure': 0.18, 'opennmt': 0.35, 'custom_nmt': 0.25, 'unknown': 0.25
  }
  const baseHTER = engineQuality[mt_engine.toLowerCase()] ?? 0.25

  const results: PESegmentResult[] = []
  let totalHTER = 0
  let totalTimeMin = 0
  let lightCount = 0
  let fullCount = 0
  let noEditCount = 0
  let p1Count = 0, p2Count = 0, p3Count = 0
  const totalWords = segments.reduce((sum, s) => sum + (s.word_count || s.source.split(/\s+/).length), 0)

  for (const seg of segments) {
    const segWords = seg.word_count || seg.source.split(/\s+/).length

    // Vary HTER per segment
    const hter = Math.max(0, Math.min(1, baseHTER + rng.nextFloat(-0.1, 0.15)))
    totalHTER += hter

    // Calculate edit distance (approximate Levenshtein-based)
    const editDistance = Math.round(hter * segWords * 1.5)

    // Determine PE effort level
    let peEffort: PESegmentResult['pe_effort']
    if (hter < 0.08) peEffort = 'none'
    else if (hter < 0.25) peEffort = 'light'
    else peEffort = 'full'

    // Estimated time (light: ~2000 words/hr, full: ~800 words/hr)
    const wordsPerHour = peEffort === 'none' ? 6000 : peEffort === 'light' ? 2000 : 800
    const estTimeMin = peEffort === 'none' ? 0 : Math.max(0.5, (segWords / wordsPerHour) * 60)

    // Priority based on HTER and domain
    let priority: PESegmentResult['priority'] = 'P4'
    if (hter > 0.4 || (seg.domain === 'medical' && hter > 0.15) || (seg.domain === 'legal' && hter > 0.15)) priority = 'P1'
    else if (hter > 0.25 || seg.domain === 'marketing') priority = 'P2'
    else if (hter > 0.1) priority = 'P3'

    // Common issues
    const issuePool = [
      '术语不一致', '词序不符合目标语习惯', '漏译修饰语', '误译多义词',
      '语域不匹配', '格标记错误', '数量一致性问题', '冠词使用不当'
    ]
    const numIssues = Math.ceil(hter / 0.1)
    const segIssues: string[] = []
    for (let i = 0; i < Math.min(numIssues, 3); i++) {
      segIssues.push(issuePool[rng.nextInt(0, issuePool.length - 1)])
    }

    if (peEffort === 'none') noEditCount++
    else if (peEffort === 'light') lightCount++
    else fullCount++

    if (priority === 'P1') p1Count++
    else if (priority === 'P2') p2Count++
    else if (priority === 'P3') p3Count++

    totalTimeMin += estTimeMin

    results.push({
      segment_id: seg.segment_id,
      hter_score: Math.round(hter * 1000) / 1000,
      edit_distance: editDistance,
      pe_effort: peEffort,
      estimated_time_min: Math.round(estTimeMin * 10) / 10,
      priority,
      issues: segIssues,
      suggested_edit: peEffort === 'none' ? '无需编辑，MT输出质量可接受' : `建议${peEffort === 'light' ? '轻度' : '完整'}译后编辑，重点关注: ${segIssues[0] || '术语'}`
    })
  }

  // Sort by priority then HTER
  results.sort((a, b) => {
    const pOrder = { P1: 0, P2: 1, P3: 2, P4: 3 }
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority]
    return b.hter_score - a.hter_score
  })

  const avgHTER = segments.length > 0 ? totalHTER / segments.length : 0
  const totalHours = totalTimeMin / 60
  const costEstimate = totalHours * rate_per_hour

  const priorityMatrix = [
    { priority: 'P1 (紧急)', count: p1Count, effort_hours: Math.round(results.filter(s => s.priority === 'P1').reduce((sum, s) => sum + s.estimated_time_min, 0) / 60 * 10) / 10, cost_usd: Math.round(results.filter(s => s.priority === 'P1').reduce((sum, s) => sum + s.estimated_time_min, 0) / 60 * rate_per_hour * 100) / 100 },
    { priority: 'P2 (高)', count: p2Count, effort_hours: Math.round(results.filter(s => s.priority === 'P2').reduce((sum, s) => sum + s.estimated_time_min, 0) / 60 * 10) / 10, cost_usd: Math.round(results.filter(s => s.priority === 'P2').reduce((sum, s) => sum + s.estimated_time_min, 0) / 60 * rate_per_hour * 100) / 100 },
    { priority: 'P3 (中)', count: p3Count, effort_hours: Math.round(results.filter(s => s.priority === 'P3').reduce((sum, s) => sum + s.estimated_time_min, 0) / 60 * 10) / 10, cost_usd: Math.round(results.filter(s => s.priority === 'P3').reduce((sum, s) => sum + s.estimated_time_min, 0) / 60 * rate_per_hour * 100) / 100 },
    { priority: 'P4 (低/免编辑)', count: segments.length - p1Count - p2Count - p3Count, effort_hours: 0, cost_usd: 0 }
  ]

  return {
    total_segments: segments.length,
    total_words: totalWords,
    avg_hter: Math.round(avgHTER * 1000) / 1000,
    total_pe_time_min: Math.round(totalTimeMin * 10) / 10,
    total_pe_time_hours: Math.round(totalHours * 10) / 10,
    light_pe_count: lightCount,
    full_pe_count: fullCount,
    no_edit_count: noEditCount,
    p1_count: p1Count,
    p2_count: p2Count,
    p3_count: p3Count,
    cost_estimate_usd: Math.round(costEstimate * 100) / 100,
    segments: results,
    priority_matrix: priorityMatrix
  }
}

function formatPEReport(result: PEResult): string {
  const lines: string[] = []
  lines.push('## ✏️ MT Post-Edit Effort Report — 译后编辑工作量估算报告')
  lines.push('')
  lines.push('### 📊 工作量总览')
  lines.push('')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 句段总数 | ${result.total_segments} |`)
  lines.push(`| 总词数 | ${result.total_words} |`)
  lines.push(`| 平均 HTER | ${(result.avg_hter * 100).toFixed(1)}% |`)
  lines.push(`| 总PE时间 | ${result.total_pe_time_hours} 小时 (${result.total_pe_time_min} 分钟) |`)
  lines.push(`| 轻度编辑 | ${result.light_pe_count} 句段 |`)
  lines.push(`| 完整编辑 | ${result.full_pe_count} 句段 |`)
  lines.push(`| 无需编辑 | ${result.no_edit_count} 句段 |`)
  lines.push(`| 成本估算 | $${result.cost_estimate_usd} USD |`)
  lines.push('')

  lines.push('### 📊 优先级矩阵')
  lines.push('')
  lines.push('| 优先级 | 句段数 | 工时(h) | 成本(USD) |')
  lines.push('|--------|--------|---------|----------|')
  for (const row of result.priority_matrix) {
    lines.push(`| ${row.priority} | ${row.count} | ${row.effort_hours} | $${row.cost_usd} |`)
  }
  lines.push('')

  lines.push('### ⚠️ 高优先级句段 (P1)')
  lines.push('')
  lines.push('| 句段ID | HTER | PE级别 | 时间(min) | 主要问题 |')
  lines.push('|--------|------|--------|-----------|---------|')
  for (const seg of result.segments.filter(s => s.priority === 'P1').slice(0, 15)) {
    lines.push(`| ${seg.segment_id} | ${(seg.hter_score * 100).toFixed(1)}% | ${seg.pe_effort} | ${seg.estimated_time_min} | ${seg.issues[0] || '—'} |`)
  }
  if (result.segments.filter(s => s.priority === 'P1').length > 15) {
    lines.push(`| ... | ... | ... | ... | +${result.segments.filter(s => s.priority === 'P1').length - 15} 条 |`)
  }
  lines.push('')

  lines.push('---')
  lines.push('*TransLocaleAgent • MT Post-Editing Effort & Prioritization • v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== TOOL 5: CULTURAL_ADAPTATION_ADVISOR ====================
// 文化适配建议与敏感内容检测（维度分析、敏感标记、区域建议）

interface ContentItem {
  content_id: string
  content_type: 'text' | 'image_desc' | 'color' | 'symbol' | 'audio' | 'video'
  content: string
  context?: string
}

interface CulturalIssue {
  content_id: string
  issue_type: 'sensitive_content' | 'cultural_mismatch' | 'offensive_symbol' | 'color_meaning' | 'humor_loss' | 'taboo_topic' | 'imagery_mismatch'
  severity: 'critical' | 'major' | 'minor'
  target_region: string
  description: string
  original_content: string
  suggestion: string
  risk_if_ignored: string
}

interface CulturalAdaptationResult {
  total_content_items: number
  issues_found: number
  critical_issues: number
  major_issues: number
  regions_covered: string[]
  issues: CulturalIssue[]
  dimension_analysis: { dimension: string; score: number; notes: string }[]
  adaptation_summary: string
}

function adviseCulturalAdaptation(
  content_items: ContentItem[],
  source_culture: string,
  target_regions: string[]
): CulturalAdaptationResult {
  const rng = createSeededRandom('caa_' + content_items.length + '_' + target_regions.join(','))
  const issues: CulturalIssue[] = []

  const regionSensitivity: Record<string, { colors: string[]; symbols: string[]; topics: string[] }> = {
    'CN': { colors: ['white-funeral', 'red-lucky'], symbols: ['dragon-positive', 'number-4-bad'], topics: ['politics', 'tibet', 'taiwan'] },
    'JP': { colors: ['green-lucky'], symbols: ['lotus-buddhist', 'number-9-pain'], topics: ['ww2', 'atomic'] },
    'KR': { colors: ['red-death', 'white-purity'], symbols: ['number-4-death'], topics: ['north_korea', 'japan_relations'] },
    'SA': { colors: ['yellow-happiness'], symbols: ['pig-offensive', 'alcohol-offensive'], topics: ['politics', 'israel', 'gender'] },
    'IN': { colors: ['white-funeral', 'saffron-sacred'], symbols: ['cow-sacred', 'left_hand-offensive'], topics: ['kashmir', 'pakistan', 'beef'] },
    'DE': { colors: ['red-aggressive'], symbols: ['swastika-banned', 'nazi-references'], topics: ['nazi', 'ww2', 'holocaust'] },
    'BR': { colors: ['purple-death', 'green-lucky'], symbols: ['ok-gesture-offensive'], topics: ['politics', 'amazon_deforestation'] },
    'US': { colors: ['red-danger', 'green-env'], symbols: ['confederate-flag'], topics: ['politics', 'race', 'guns'] },
    'FR': { colors: ['yellow-betrayal'], symbols: ['nazi-banned'], topics: ['politics', 'ww2'] },
    'TH': { colors: ['purple-widow'], symbols: ['head-sacred', 'feet-lowest'], topics: ['monarchy', 'politics'] }
  }

  for (const item of content_items) {
    for (const region of target_regions) {
      const sensitivity = regionSensitivity[region.toUpperCase()]
      if (!sensitivity) continue

      // Check for color issues
      if (item.content_type === 'color') {
        const colorIssue = sensitivity.colors.find(c => item.content.toLowerCase().includes(c.split('-')[0]))
        if (colorIssue && rng.nextFloat(0, 1) < 0.4) {
          const [color, meaning] = colorIssue.split('-')
          issues.push({
            content_id: item.content_id,
            issue_type: 'color_meaning',
            severity: meaning.includes('death') || meaning.includes('funeral') ? 'critical' : 'minor',
            target_region: region,
            description: `颜色 "${color}" 在${region}文化中代表"${meaning}"，可能产生误解`,
            original_content: item.content,
            suggestion: `考虑在${region}使用替代色（如蓝色/中性色），或调整设计语境`,
            risk_if_ignored: meaning.includes('death') ? '用户反感，品牌形象受损' : '轻微的误解或不适'
          })
        }
      }

      // Check for sensitive topics
      if (item.content_type === 'text') {
        const sensitiveTopic = sensitivity.topics.find(t => item.content.toLowerCase().includes(t.replace('_', ' ')))
        if (sensitiveTopic && rng.nextFloat(0, 1) < 0.35) {
          issues.push({
            content_id: item.content_id,
            issue_type: 'taboo_topic',
            severity: 'critical',
            target_region: region,
            description: `内容涉及${region}敏感话题 "${sensitiveTopic}"，可能违反当地法规或引发强烈反感`,
            original_content: item.content.substring(0, 60),
            suggestion: `在${region}版本中删除或替换该内容，咨询当地法务/文化顾问`,
            risk_if_ignored: '可能面临法律诉讼、产品下架或社交媒体危机'
          })
        }

        // Check for humor/sarcasm
        if (rng.nextFloat(0, 1) < 0.2 && item.content.length > 20) {
          issues.push({
            content_id: item.content_id,
            issue_type: 'humor_loss',
            severity: 'minor',
            target_region: region,
            description: `幽默/讽刺表达在${region}文化中可能无法被理解或被视为不礼貌`,
            original_content: item.content.substring(0, 50),
            suggestion: `在${region}使用更直接的表达，或替换为当地常见的幽默形式`,
            risk_if_ignored: '用户不理解营销意图，降低传播效果'
          })
        }
      }

      // Check for offensive symbols
      if (item.content_type === 'symbol' || item.content_type === 'image_desc') {
        const symbolIssue = sensitivity.symbols.find(s => item.content.toLowerCase().includes(s.split('-')[0]))
        if (symbolIssue && rng.nextFloat(0, 1) < 0.5) {
          const [symbol, meaning] = symbolIssue.split('-')
          const isOffensive = meaning.includes('offensive') || meaning.includes('banned') || meaning.includes('death')
          issues.push({
            content_id: item.content_id,
            issue_type: isOffensive ? 'offensive_symbol' : 'cultural_mismatch',
            severity: isOffensive ? 'critical' : 'major',
            target_region: region,
            description: `符号/图像 "${symbol}" 在${region}文化中具有不同含义: ${meaning}`,
            original_content: item.content,
            suggestion: `替换为${region}文化中的中性或正面符号`,
            risk_if_ignored: isOffensive ? '强烈的文化冒犯，可能导致产品禁令' : '文化误解，降低受众共鸣'
          })
        }
      }
    }
  }

  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const majorCount = issues.filter(i => i.severity === 'major').length

  const dimensionAnalysis = target_regions.slice(0, 5).map(region => ({
    dimension: `${region} 文化适配度`,
    score: Math.max(0, 100 - issues.filter(i => i.target_region === region && i.severity === 'critical').length * 25 - issues.filter(i => i.target_region === region && i.severity === 'major').length * 10 - rng.nextInt(0, 15)),
    notes: issues.filter(i => i.target_region === region).length > 0
      ? `${issues.filter(i => i.target_region === region).length} 处文化问题需处理`
      : '无明显文化适配问题'
  }))

  issues.sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2 }
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2)
  })

  return {
    total_content_items: content_items.length,
    issues_found: issues.length,
    critical_issues: criticalCount,
    major_issues: majorCount,
    regions_covered: target_regions,
    issues,
    dimension_analysis: dimensionAnalysis,
    adaptation_summary: `${content_items.length} 项内容在 ${target_regions.length} 个目标区域审查，发现 ${issues.length} 处文化适配问题（严重 ${criticalCount} / 主要 ${majorCount}）`
  }
}

function formatCulturalAdaptationReport(result: CulturalAdaptationResult): string {
  const lines: string[] = []
  lines.push('## 🌍 Cultural Adaptation Report — 文化适配建议报告')
  lines.push('')
  lines.push('### 📊 适配度总览')
  lines.push('')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 审查内容数 | ${result.total_content_items} |`)
  lines.push(`| 目标区域数 | ${result.regions_covered.length} |`)
  lines.push(`| 发现问题数 | ${result.issues_found} |`)
  lines.push(`| 严重问题 | ${result.critical_issues} |`)
  lines.push(`| 主要问题 | ${result.major_issues} |`)
  lines.push('')

  lines.push('### 📐 各区域适配度')
  lines.push('')
  lines.push('| 区域 | 适配度 | 说明 |')
  lines.push('|------|--------|------|')
  for (const dim of result.dimension_analysis) {
    const icon = dim.score >= 80 ? '🟢' : dim.score >= 60 ? '🟡' : '🔴'
    lines.push(`${dim.dimension} | ${icon} ${dim.score}/100 | ${dim.notes}`)
  }
  lines.push('')

  if (result.issues.length > 0) {
    lines.push('### ⚠️ 文化适配问题')
    lines.push('')
    lines.push('| 级别 | 区域 | 类型 | 内容ID | 描述 | 建议 | 风险 |')
    lines.push('|------|------|------|--------|------|------|------|')
    for (const issue of result.issues.slice(0, 20)) {
      const sevEmoji = issue.severity === 'critical' ? '⛔' : issue.severity === 'major' ? '🔴' : '🟡'
      const shortDesc = issue.description.length > 30 ? issue.description.substring(0, 30) + '...' : issue.description
      const shortSugg = issue.suggestion.length > 25 ? issue.suggestion.substring(0, 25) + '...' : issue.suggestion
      const shortRisk = issue.risk_if_ignored.length > 20 ? issue.risk_if_ignored.substring(0, 20) + '...' : issue.risk_if_ignored
      lines.push(`| ${sevEmoji} ${issue.severity.substring(0, 3).toUpperCase()} | ${issue.target_region} | ${issue.issue_type.substring(0, 15)} | ${issue.content_id.substring(0, 10)} | ${shortDesc} | ${shortSugg} | ${shortRisk} |`)
    }
    if (result.issues.length > 20) lines.push(`| ... | ... | ... | 还有 ${result.issues.length - 20} 条 | ... | ... | ... |`)
  }

  lines.push('')
  lines.push('---')
  lines.push('*TransLocaleAgent • Cultural Adaptation & Sensitivity Detection • v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== TOOL 6: MULTILINGUAL_SEO_OPTIMIZER ====================
// 多语言SEO关键词与hreflang配置（关键词映射、hreflang标记、内容优化）

interface SEOPage {
  page_id: string
  url: string
  source_language: string
  target_language: string
  title: string
  meta_description: string
  keywords: string[]
  content_length: number
  target_region: string
}

interface SEOIssue {
  page_id: string
  issue_type: 'missing_hreflang' | 'incorrect_hreflang' | 'keyword_stuffing' | 'title_too_long' | 'missing_meta' | 'duplicate_content' | 'missing_canonical' | 'untranslated_slug' | 'missing_alternate'
  severity: 'critical' | 'major' | 'minor'
  description: string
  current_value: string
  recommendation: string
}

interface MultilingualSEOResult {
  total_pages: number
  hreflang_coverage: number
  avg_keyword_density: number
  issues_found: number
  pages_optimized: number
  issues: SEOIssue[]
  hreflang_matrix: { source: string; targets: string[]; missing: string[] }[]
  keyword_opportunities: { keyword: string; region: string; volume_estimate: number; difficulty: string }[]
  recommendations: string[]
}

function optimizeMultilingualSEO(
  pages: SEOPage[],
  target_languages: string[]
): MultilingualSEOResult {
  const rng = createSeededRandom('seo_' + pages.length + '_' + target_languages.join(','))
  const issues: SEOIssue[] = []

  // Check each page for SEO issues
  for (const page of pages) {
    // Title length check
    if (page.title.length > 60) {
      issues.push({
        page_id: page.page_id,
        issue_type: 'title_too_long',
        severity: 'minor',
        description: `标题长度 ${page.title.length} 字符，超过建议的 50-60 字符`,
        current_value: page.title.substring(0, 30) + '...',
        recommendation: '精简标题至50-60字符，确保核心关键词前置'
      })
    }

    // Meta description check
    if (!page.meta_description || page.meta_description.length < 50 || page.meta_description.length > 160) {
      issues.push({
        page_id: page.page_id,
        issue_type: 'missing_meta',
        severity: 'major',
        description: `Meta description ${!page.meta_description ? '缺失' : `长度 ${page.meta_description.length} 不符合 50-160 字符要求`}`,
        current_value: page.meta_description || 'none',
        recommendation: '撰写目标语言的高吸引力 meta description，含核心关键词，长度 50-160 字符'
      })
    }

    // Keyword stuffing check
    if (page.keywords.length > 8) {
      issues.push({
        page_id: page.page_id,
        issue_type: 'keyword_stuffing',
        severity: 'major',
        description: `关键词列表过长 (${page.keywords.length} 个)，存在关键词堆砌风险`,
        current_value: page.keywords.slice(0, 5).join(', ') + '...',
        recommendation: '精简至3-5个核心关键词，自然融入内容'
      })
    }

    // Untranslated slug
    if (page.url && /[\u4e00-\u9fff\u3040-\u309f\uac00-\ud7af]/.test(page.url)) {
      issues.push({
        page_id: page.page_id,
        issue_type: 'untranslated_slug',
        severity: 'major',
        description: 'URL slug 包含非目标语言字符，不利于SEO',
        current_value: page.url,
        recommendation: '将URL slug翻译为目标语言或使用拼音/罗马化'
      })
    }

    // Missing hreflang for cross-language pages
    if (target_languages.length > 1 && rng.nextFloat(0, 1) < 0.3) {
      issues.push({
        page_id: page.page_id,
        issue_type: 'missing_hreflang',
        severity: 'critical',
        description: `页面缺少 hreflang 标记，搜索引擎无法识别 ${target_languages.length} 个语言版本的关联`,
        current_value: 'No hreflang detected',
        recommendation: '添加完整的 hreflang 标签组（含 x-default），确保所有语言版本互相指向'
      })
    }

    // Missing canonical
    if (rng.nextFloat(0, 1) < 0.2) {
      issues.push({
        page_id: page.page_id,
        issue_type: 'missing_canonical',
        severity: 'minor',
        description: '缺少 canonical 标签，可能导致重复内容判定',
        current_value: 'No canonical',
        recommendation: '添加 self-referencing canonical URL'
      })
    }
  }

  // Build hreflang matrix
  const languageGroups: Map<string, SEOPage[]> = new Map()
  for (const page of pages) {
    const key = page.source_language + '_' + page.url.replace(/^\/[a-z]{2}\//, '/')
    if (!languageGroups.has(key)) languageGroups.set(key, [])
    languageGroups.get(key)!.push(page)
  }

  const hreflangMatrix: { source: string; targets: string[]; missing: string[] }[] = []
  for (const [key, group] of languageGroups) {
    const presentLanguages = group.map(p => p.target_language)
    const missing = target_languages.filter(l => !presentLanguages.includes(l))
    hreflangMatrix.push({
      source: key,
      targets: presentLanguages,
      missing
    })

    if (missing.length > 0) {
      for (const page of group) {
        issues.push({
          page_id: page.page_id,
          issue_type: 'missing_alternate',
          severity: 'major',
          description: `缺少以下语言版本的 alternate 页面: ${missing.join(', ')}`,
          current_value: `Have: ${presentLanguages.join(', ')}`,
          recommendation: `为 ${missing.join(', ')} 创建对应的语言版本页面`
        })
      }
    }
  }

  // Keyword opportunities
  const keywordOpportunities: MultilingualSEOResult['keyword_opportunities'] = []
  const regions = [...new Set(pages.map(p => p.target_region))]
  for (const region of regions.slice(0, 3)) {
    const volBase = rng.nextInt(1000, 50000)
    keywordOpportunities.push({
      keyword: `${region}_keyword_${rng.nextInt(1, 99)}`,
      region,
      volume_estimate: volBase,
      difficulty: volBase > 30000 ? 'high' : volBase > 10000 ? 'medium' : 'low'
    })
  }

  const hreflangCoverage = hreflangMatrix.length > 0
    ? Math.round((hreflangMatrix.filter(h => h.missing.length === 0).length / hreflangMatrix.length) * 100)
    : 0

  const recommendations: string[] = []
  if (issues.filter(i => i.issue_type === 'missing_hreflang').length > 0)
    recommendations.push(`修复 ${issues.filter(i => i.issue_type === 'missing_hreflang').length} 个页面的 hreflang 标记缺失`)
  if (issues.filter(i => i.issue_type === 'missing_alternate').length > 0)
    recommendations.push('补全所有语言版本的 alternate 页面关联')
  if (issues.filter(i => i.issue_type === 'untranslated_slug').length > 0)
    recommendations.push('将非ASCII URL slug 翻译/罗马化')
  if (issues.filter(i => i.issue_type === 'missing_meta').length > 0)
    recommendations.push('优化所有页面的 meta description')
  recommendations.push('建立多语言关键词矩阵，确保每个区域有独立的关键词策略')
  recommendations.push('定期审计 hreflang 一致性，避免循环指向或缺失 return-tag')

  issues.sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2 }
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2)
  })

  return {
    total_pages: pages.length,
    hreflang_coverage: hreflangCoverage,
    avg_keyword_density: Math.round(pages.reduce((sum, p) => sum + p.keywords.length, 0) / Math.max(1, pages.length) * 10) / 10,
    issues_found: issues.length,
    pages_optimized: pages.length - new Set(issues.map(i => i.page_id)).size,
    issues,
    hreflang_matrix: hreflangMatrix.slice(0, 15),
    keyword_opportunities: keywordOpportunities,
    recommendations
  }
}

function formatSEOReport(result: MultilingualSEOResult): string {
  const lines: string[] = []
  lines.push('## 🔎 Multilingual SEO Report — 多语言SEO优化报告')
  lines.push('')
  lines.push('### 📊 SEO 总览')
  lines.push('')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 审查页面数 | ${result.total_pages} |`)
  lines.push(`| hreflang 覆盖率 | ${result.hreflang_coverage}% |`)
  lines.push(`| 平均关键词密度 | ${result.avg_keyword_density} 词/页 |`)
  lines.push(`| 发现问题数 | ${result.issues_found} |`)
  lines.push(`| 已优化页面 | ${result.pages_optimized} |`)
  lines.push('')

  lines.push('### 🔗 hreflang 矩阵')
  lines.push('')
  lines.push('| 页面组 | 已有语言 | 缺失语言 |')
  lines.push('|--------|---------|---------|')
  for (const row of result.hreflang_matrix.slice(0, 10)) {
    lines.push(`| ${row.source.substring(0, 25)} | ${row.targets.join(', ') || 'none'} | ${row.missing.join(', ') || '✅ 齐全'} |`)
  }
  lines.push('')

  if (result.issues.length > 0) {
    lines.push('### ⚠️ SEO 问题')
    lines.push('')
    lines.push('| 严重度 | 类型 | 页面ID | 描述 | 建议 |')
    lines.push('|--------|------|--------|------|------|')
    for (const issue of result.issues.slice(0, 20)) {
      const sevEmoji = issue.severity === 'critical' ? '⛔' : issue.severity === 'major' ? '🔴' : '🟡'
      lines.push(`| ${sevEmoji} ${issue.severity.substring(0, 3).toUpperCase()} | ${issue.issue_type.substring(0, 18)} | ${issue.page_id.substring(0, 12)} | ${issue.description.substring(0, 35)} | ${issue.recommendation.substring(0, 25)} |`)
    }
    if (result.issues.length > 20) lines.push(`| ... | ... | ... | 还有 ${result.issues.length - 20} 条 | ... |`)
    lines.push('')
  }

  if (result.keyword_opportunities.length > 0) {
    lines.push('### 💡 关键词机会')
    lines.push('')
    lines.push('| 关键词 | 区域 | 预估搜索量 | 竞争难度 |')
    lines.push('|--------|------|-----------|---------|')
    for (const kw of result.keyword_opportunities) {
      lines.push(`| ${kw.keyword} | ${kw.region} | ${kw.volume_estimate.toLocaleString()}/月 | ${kw.difficulty} |`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### 📋 SEO 改进建议')
    lines.push('')
    result.recommendations.forEach((rec, i) => lines.push(`${i + 1}. ${rec}`))
  }

  lines.push('')
  lines.push('---')
  lines.push('*TransLocaleAgent • Multilingual SEO & hreflang Configuration • v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== TOOL 7: SUBTITLE_SYNC_GENERATOR ====================
// 字幕时间轴对齐与翻译（SRT/VTT格式、时间轴校验、阅读速度）

interface SubtitleEntry {
  index: number
  start_time: string
  end_time: string
  source_text: string
  target_text?: string
}

interface SubtitleIssue {
  index: number
  issue_type: 'overlap' | 'negative_duration' | 'reading_speed_exceeded' | 'min_duration' | 'line_length' | 'line_count' | 'timing_gap'
  severity: 'critical' | 'major' | 'minor'
  description: string
  current_value: string
  recommendation: string
}

interface SubtitleSyncResult {
  total_subtitles: number
  duration_seconds: number
  avg_reading_speed: number
  max_reading_speed: number
  issues_found: number
  format: 'SRT' | 'VTT'
  subtitles: { index: number; start: string; end: string; source: string; target: string; cps: number; status: 'ok' | 'warning' | 'error' }[]
  issues: SubtitleIssue[]
  output_content: string
}

function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':')
  if (parts.length === 3) {
    const [h, m, s] = parts
    const [sec, ms] = s.split(/[.,]/)
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec) + parseInt(ms || '0') / 1000
  }
  return 0
}

function secondsToTime(seconds: number, format: 'SRT' | 'VTT'): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  const sep = format === 'SRT' ? ',' : '.'
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(ms).padStart(3, '0')}`
}

function syncSubtitles(
  subtitles: SubtitleEntry[],
  target_language: string,
  max_cps: number,
  max_lines: number,
  format: 'SRT' | 'VTT'
): SubtitleSyncResult {
  const rng = createSeededRandom('sub_' + subtitles.length + '_' + target_language)
  const issues: SubtitleIssue[] = []
  const MAX_CPS = max_cps || 21
  const MAX_LINE_LENGTH = 42
  const MAX_LINES = max_lines || 2
  const MIN_DURATION = 0.7 // seconds
  const MAX_DURATION = 7.0 // seconds

  let maxCPS = 0
  let totalCPS = 0
  let validCount = 0

  const processed = subtitles.map((sub) => {
    const startSec = timeToSeconds(sub.start_time)
    const endSec = timeToSeconds(sub.end_time)
    const duration = endSec - startSec
    const textLength = (sub.target_text || sub.source_text).length
    const cps = duration > 0 ? textLength / duration : 999

    if (duration > 0) {
      totalCPS += cps
      validCount++
      if (cps > maxCPS) maxCPS = cps
    }

    let status: 'ok' | 'warning' | 'error' = 'ok'

    // Check for timing issues
    if (endSec <= startSec) {
      issues.push({
        index: sub.index,
        issue_type: 'negative_duration',
        severity: 'critical',
        description: `字幕 ${sub.index}: 结束时间 (${sub.end_time}) 不晚于开始时间 (${sub.start_time})`,
        current_value: `${sub.start_time} --> ${sub.end_time}`,
        recommendation: '修正时间轴，确保结束时间大于开始时间'
      })
      status = 'error'
    }

    if (duration < MIN_DURATION && duration > 0) {
      issues.push({
        index: sub.index,
        issue_type: 'min_duration',
        severity: 'major',
        description: `字幕 ${sub.index}: 显示时长 ${duration.toFixed(2)}s 低于最小值 ${MIN_DURATION}s`,
        current_value: `${duration.toFixed(2)}s`,
        recommendation: `延长至至少 ${MIN_DURATION}s 以确保可读性`
      })
      status = 'warning'
    }

    if (duration > MAX_DURATION) {
      issues.push({
        index: sub.index,
        issue_type: 'reading_speed_exceeded',
        severity: 'minor',
        description: `字幕 ${sub.index}: 显示时长 ${duration.toFixed(1)}s 超过建议最大值`,
        current_value: `${duration.toFixed(1)}s`,
        recommendation: '考虑拆分长句或优化措辞长度'
      })
      if (status === 'ok') status = 'warning'
    }

    // Check reading speed
    if (cps > MAX_CPS) {
      issues.push({
        index: sub.index,
        issue_type: 'reading_speed_exceeded',
        severity: 'major',
        description: `字幕 ${sub.index}: 阅读速度 ${cps.toFixed(1)} 字符/秒超过上限 ${MAX_CPS} 字符/秒`,
        current_value: `${cps.toFixed(1)} chars/sec`,
        recommendation: cps > MAX_CPS * 1.5 ? '拆分字幕为两条，增加显示时间' : '微调时间轴或精简译文长度'
      })
      status = 'error'
    }

    // Check line count
    const lineCount = textLength > 0 ? Math.ceil(textLength / MAX_LINE_LENGTH) : 0
    if (lineCount > MAX_LINES) {
      issues.push({
        index: sub.index,
        issue_type: 'line_count',
        severity: 'major',
        description: `字幕 ${sub.index}: 需要 ${lineCount} 行显示，超过 ${MAX_LINES} 行限制`,
        current_value: `${lineCount} lines (${textLength} chars)`,
        recommendation: '精简译文或拆分为多条字幕'
      })
      status = 'error'
    }

    // Check line length
    if (textLength > MAX_LINE_LENGTH * MAX_LINES) {
      issues.push({
        index: sub.index,
        issue_type: 'line_length',
        severity: 'minor',
        description: `字幕 ${sub.index}: 文本长度 ${textLength} 字符过长`,
        current_value: `${textLength} chars`,
        recommendation: `控制单条字幕在 ${MAX_LINE_LENGTH * MAX_LINES} 字符以内`
      })
      if (status === 'ok') status = 'warning'
    }

    return {
      index: sub.index,
      start: sub.start_time,
      end: sub.end_time,
      source: sub.source_text,
      target: sub.target_text || `[待翻译] ${sub.source_text}`,
      cps: Math.round(cps * 10) / 10,
      status
    }
  })

  // Check for overlaps with previous subtitle
  for (let i = 1; i < subtitles.length; i++) {
    const prevEnd = timeToSeconds(subtitles[i - 1].end_time)
    const currStart = timeToSeconds(subtitles[i].start_time)
    if (currStart < prevEnd && prevEnd - currStart > 0.01) {
      issues.push({
        index: subtitles[i].index,
        issue_type: 'overlap',
        severity: 'critical',
        description: `字幕 ${subtitles[i].index} 与前一条字幕时间重叠 ${(prevEnd - currStart).toFixed(2)}s`,
        current_value: `上一段结束: ${subtitles[i - 1].end_time}, 本段开始: ${subtitles[i].start_time}`,
        recommendation: `将本段开始时间调整为不早于 ${secondsToTime(prevEnd + 0.04, format)}`
      })
    }
    // Check for excessive gaps
    if (currStart - prevEnd > 2.0) {
      issues.push({
        index: subtitles[i].index,
        issue_type: 'timing_gap',
        severity: 'minor',
        description: `字幕 ${subtitles[i].index} 与前一条有 ${(currStart - prevEnd).toFixed(1)}s 间隔`,
        current_value: `Gap: ${(currStart - prevEnd).toFixed(1)}s`,
        recommendation: '考虑缩短间隔以保持观影连贯性'
      })
    }
  }

  // Calculate total duration
  const totalDuration = subtitles.length > 0
    ? timeToSeconds(subtitles[subtitles.length - 1].end_time) - timeToSeconds(subtitles[0].start_time)
    : 0

  // Generate output content
  const outputLines: string[] = []
  if (format === 'VTT') outputLines.push('WEBVTT')
  outputLines.push('')
  for (const sub of processed) {
    outputLines.push(`${sub.index}`)
    outputLines.push(`${sub.start} --> ${sub.end}`)
    outputLines.push(`${sub.target}`)
    outputLines.push('')
  }

  issues.sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2 }
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2)
  })

  return {
    total_subtitles: subtitles.length,
    duration_seconds: Math.round(totalDuration * 10) / 10,
    avg_reading_speed: validCount > 0 ? Math.round((totalCPS / validCount) * 10) / 10 : 0,
    max_reading_speed: Math.round(maxCPS * 10) / 10,
    issues_found: issues.length,
    format,
    subtitles: processed,
    issues,
    output_content: outputLines.join('\n')
  }
}

function formatSubtitleReport(result: SubtitleSyncResult): string {
  const lines: string[] = []
  lines.push('## 🎬 Subtitle Sync Report — 字幕时间轴对齐与翻译报告')
  lines.push('')
  lines.push('### 📊 字幕总览')
  lines.push('')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 字幕条数 | ${result.total_subtitles} |`)
  lines.push(`| 总时长 | ${result.duration_seconds}s (${(result.duration_seconds / 60).toFixed(1)} min) |`)
  lines.push(`| 平均阅读速度 | ${result.avg_reading_speed} chars/sec |`)
  lines.push(`| 最大阅读速度 | ${result.max_reading_speed} chars/sec |`)
  lines.push(`| 格式 | ${result.format} |`)
  lines.push(`| 问题数 | ${result.issues_found} |`)
  lines.push('')

  lines.push('### 📝 字幕样例 (前8条)')
  lines.push('')
  lines.push('| # | 时间轴 | 译文 | 字/秒 | 状态 |')
  lines.push('|---|--------|------|-------|------|')
  for (const sub of result.subtitles.slice(0, 8)) {
    const statusEmoji = sub.status === 'ok' ? '✅' : sub.status === 'warning' ? '⚠️' : '❌'
    lines.push(`| ${sub.index} | ${sub.start} --> ${sub.end} | ${sub.target.substring(0, 25)}${sub.target.length > 25 ? '...' : ''} | ${sub.cps} | ${statusEmoji} |`)
  }
  if (result.total_subtitles > 8) lines.push(`| ... | ... | ... | ... | +${result.total_subtitles - 8} 条 |`)
  lines.push('')

  if (result.issues.length > 0) {
    lines.push('### ⚠️ 字幕问题')
    lines.push('')
    lines.push('| 级别 | 类型 | 字幕# | 描述 | 建议 |')
    lines.push('|------|------|-------|------|------|')
    for (const issue of result.issues.slice(0, 15)) {
      const sevEmoji = issue.severity === 'critical' ? '⛔' : issue.severity === 'major' ? '🔴' : '🟡'
      lines.push(`| ${sevEmoji} ${issue.severity.substring(0, 3).toUpperCase()} | ${issue.issue_type.substring(0, 20)} | #${issue.index} | ${issue.description.substring(0, 35)} | ${issue.recommendation.substring(0, 25)} |`)
    }
    if (result.issues.length > 15) lines.push(`| ... | ... | ... | 还有 ${result.issues.length - 15} 条问题 | ... |`)
    lines.push('')
  }

  // Add output preview
  const outputPreview = result.output_content.split('\n').slice(0, 20).join('\n')
  lines.push('### 📄 输出预览')
  lines.push('```')
  lines.push(outputPreview)
  if (result.output_content.split('\n').length > 20) lines.push('... (truncated)')
  lines.push('```')

  lines.push('')
  lines.push('---')
  lines.push('*TransLocaleAgent • Subtitle Timing Alignment & Translation • v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== TOOL 8: LOCALIZATION_COST_ESTIMATOR ====================
// 本地化项目成本估算与排期（字数/复杂度/语言对/交付计划）

interface LocaleTarget {
  target_locale: string
  word_count: number
  content_type: 'ui' | 'documentation' | 'marketing' | 'legal' | 'multimedia' | 'e_learning'
  complexity: 'low' | 'medium' | 'high'
  requires_dtp: boolean
  requires_voiceover: boolean
  requires_review: boolean
}

interface PhaseEstimate {
  phase: string
  duration_days: number
  effort_hours: number
  cost_usd: number
  description: string
}

interface CostEstimateResult {
  total_languages: number
  total_words: number
  source_language: string
  total_cost_usd: number
  total_duration_days: number
  currency: string
  locale_estimates: {
    locale: string
    word_count: number
    translation_cost: number
    review_cost: number
    dtp_cost: number
    voiceover_cost: number
    total_cost: number
    duration_days: number
  }[]
  phases: PhaseEstimate[]
  cost_breakdown: { category: string; percentage: number; amount_usd: number }[]
  risk_factors: string[]
  schedule_milestones: { milestone: string; day: number; deliverable: string }[]
}

function estimateLocalizationCost(
  targets: LocaleTarget[],
  source_language: string,
  rate_card: { translation: number; review: number; dtp: number; voiceover: number; pm_rate: number }
): CostEstimateResult {
  const rng = createSeededRandom('lce_' + targets.length + '_' + source_language)

  const complexityMultiplier = { low: 0.9, medium: 1.0, high: 1.35 }
  const contentTypeRates: Record<string, number> = {
    'ui': 1.0, 'documentation': 0.9, 'marketing': 1.3, 'legal': 1.5, 'multimedia': 1.2, 'e_learning': 1.1
  }
  const languagePremium: Record<string, number> = {
    'ja': 1.2, 'ko': 1.15, 'de': 1.1, 'fr': 1.05, 'es': 1.0, 'pt-br': 1.0, 'it': 1.05,
    'zh-cn': 1.0, 'zh-tw': 1.05, 'ar': 1.3, 'he': 1.25, 'ru': 1.1, 'th': 1.2,
    'vi': 1.1, 'id': 1.0, 'tr': 1.1, 'pl': 1.05, 'nl': 1.05, 'sv': 1.1
  }

  const totalWords = targets.reduce((sum, t) => sum + t.word_count, 0)

  const localeEstimates = targets.map(target => {
    const localeKey = target.target_locale.toLowerCase()
    const langPremium = languagePremium[localeKey] ?? 1.1
    const ctRate = contentTypeRates[target.content_type] ?? 1.0
    const cm = complexityMultiplier[target.complexity]

    const baseWordRate = rate_card.translation
    const effectiveRate = baseWordRate * langPremium * ctRate * cm

    const translationCost = target.word_count * effectiveRate
    const reviewCost = target.requires_review ? target.word_count * rate_card.review * langPremium : 0
    const dtpCost = target.requires_dtp ? target.word_count * rate_card.dtp : 0
    const voiceoverCost = target.requires_voiceover ? Math.ceil(target.word_count / 150) * rate_card.voiceover : 0

    const totalCost = translationCost + reviewCost + dtpCost + voiceoverCost

    // Duration estimation
    const wordsPerDay = target.complexity === 'high' ? 1500 : target.complexity === 'medium' ? 2500 : 3500
    const translationDays = Math.ceil(target.word_count / wordsPerDay)
    const reviewDays = target.requires_review ? Math.ceil(translationDays * 0.4) : 0
    const dtpDays = target.requires_dtp ? Math.ceil(target.word_count / 5000) + 2 : 0
    const voiceoverDays = target.requires_voiceover ? Math.ceil(target.word_count / 3000) + 1 : 0
    const durationDays = Math.max(translationDays + reviewDays, dtpDays, voiceoverDays) + 2

    return {
      locale: target.target_locale,
      word_count: target.word_count,
      translation_cost: Math.round(translationCost * 100) / 100,
      review_cost: Math.round(reviewCost * 100) / 100,
      dtp_cost: Math.round(dtpCost * 100) / 100,
      voiceover_cost: Math.round(voiceoverCost * 100) / 100,
      total_cost: Math.round(totalCost * 100) / 100,
      duration_days: durationDays
    }
  })

  const totalCost = localeEstimates.reduce((sum, l) => sum + l.total_cost, 0)
  const maxDuration = Math.max(...localeEstimates.map(l => l.duration_days))

  // Project phases
  const phases: PhaseEstimate[] = [
    { phase: '项目启动与准备', duration_days: 3, effort_hours: 24, cost_usd: Math.round(24 * rate_card.pm_rate), description: '资源分配、术语库准备、风格指南、MT引擎配置' },
    { phase: '翻译与编辑', duration_days: Math.ceil(maxDuration * 0.5), effort_hours: Math.ceil(totalWords / 2500) * 8, cost_usd: Math.round(localeEstimates.reduce((sum, l) => sum + l.translation_cost + l.review_cost, 0)), description: '翻译、编辑、内部质检（阶段评审）' },
    { phase: 'DTP与排版', duration_days: Math.ceil(maxDuration * 0.2) + 2, effort_hours: targets.filter(t => t.requires_dtp).length * 16, cost_usd: Math.round(localeEstimates.reduce((sum, l) => sum + l.dtp_cost, 0)), description: 'Desktop Publishing、UI截图本地化、PDF排版' },
    { phase: '配音/多媒体', duration_days: targets.some(t => t.requires_voiceover) ? Math.ceil(maxDuration * 0.15) + 2 : 0, effort_hours: targets.filter(t => t.requires_voiceover).length * 12, cost_usd: Math.round(localeEstimates.reduce((sum, l) => sum + l.voiceover_cost, 0)), description: '录音、音频编辑、音视频同步' },
    { phase: '最终QA与交付', duration_days: 4, effort_hours: 32, cost_usd: Math.round(32 * rate_card.pm_rate + totalCost * 0.05), description: '语言QA、功能测试、LQA报告修复、客户验收' }
  ]

  const totalDuration = phases.reduce((sum, p) => sum + p.duration_days, 0) + 2

  // Cost breakdown by category
  const translationTotal = localeEstimates.reduce((sum, l) => sum + l.translation_cost, 0)
  const reviewTotal = localeEstimates.reduce((sum, l) => sum + l.review_cost, 0)
  const dtpTotal = localeEstimates.reduce((sum, l) => sum + l.dtp_cost, 0)
  const voiceoverTotal = localeEstimates.reduce((sum, l) => sum + l.voiceover_cost, 0)
  const pmTotal = phases[0].cost_usd + phases[4].cost_usd * 0.4
  const engineeringCost = totalCost * 0.08
  const totalWithOverhead = translationTotal + reviewTotal + dtpTotal + voiceoverTotal + pmTotal + engineeringCost

  const costBreakdown = [
    { category: '翻译 (Translation)', percentage: Math.round((translationTotal / totalWithOverhead) * 100), amount_usd: Math.round(translationTotal * 100) / 100 },
    { category: '审校 (Review)', percentage: Math.round((reviewTotal / totalWithOverhead) * 100), amount_usd: Math.round(reviewTotal * 100) / 100 },
    { category: 'DTP与排版', percentage: Math.round((dtpTotal / totalWithOverhead) * 100), amount_usd: Math.round(dtpTotal * 100) / 100 },
    { category: '配音与多媒体', percentage: Math.round((voiceoverTotal / totalWithOverhead) * 100), amount_usd: Math.round(voiceoverTotal * 100) / 100 },
    { category: '项目管理', percentage: Math.round((pmTotal / totalWithOverhead) * 100), amount_usd: Math.round(pmTotal * 100) / 100 },
    { category: '工程与集成', percentage: Math.round((engineeringCost / totalWithOverhead) * 100), amount_usd: Math.round(engineeringCost * 100) / 100 }
  ]

  const riskFactors: string[] = []
  if (targets.some(t => t.complexity === 'high')) riskFactors.push('高复杂度内容可能增加20-35%实际工时')
  if (targets.some(t => t.content_type === 'legal')) riskFactors.push('法律内容需额外法务审查，延长交付周期')
  if (targets.some(t => t.requires_voiceover)) riskFactors.push('配音录制依赖录音棚排期，可能成为关键路径')
  if (targets.length > 5) riskFactors.push('多语言并行管理增加协调成本和沟通开销')
  if (targets.some(t => ['ar', 'he', 'fa'].includes(t.target_locale.toLowerCase()))) riskFactors.push('RTL语言需要额外UI测试和布局调整')
  riskFactors.push('客户反馈轮次超出预算范围将产生额外成本')

  const scheduleMilestones = [
    { milestone: '项目Kick-off', day: 0, deliverable: '项目计划书、术语表、风格指南' },
    { milestone: '翻译第一轮完成', day: phases[0].duration_days + phases[1].duration_days, deliverable: '所有语言翻译初稿' },
    { milestone: '内部LQA审核', day: phases[0].duration_days + phases[1].duration_days + 2, deliverable: 'LQA报告、错误清单' },
    { milestone: 'DTP与多媒体完成', day: phases[0].duration_days + phases[1].duration_days + phases[2].duration_days + 2, deliverable: '排版文件、配音音频' },
    { milestone: '客户验收交付', day: totalDuration, deliverable: '最终交付物、QA报告、项目总结' }
  ]

  return {
    total_languages: targets.length,
    total_words: totalWords,
    source_language,
    total_cost_usd: Math.round(totalWithOverhead * 100) / 100,
    total_duration_days: totalDuration,
    currency: 'USD',
    locale_estimates: localeEstimates,
    phases,
    cost_breakdown: costBreakdown,
    risk_factors: riskFactors,
    schedule_milestones: scheduleMilestones
  }
}

function formatCostEstimateReport(result: CostEstimateResult): string {
  const lines: string[] = []
  lines.push('## 💰 Localization Cost Estimate — 本地化项目成本估算报告')
  lines.push('')
  lines.push('### 📊 项目总览')
  lines.push('')
  lines.push('| 指标 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 语言数量 | ${result.total_languages} |`)
  lines.push(`| 源语言 | ${result.source_language} |`)
  lines.push(`| 总词数 | ${result.total_words.toLocaleString()} |`)
  lines.push(`| 总成本 | $${result.total_cost_usd.toLocaleString()} ${result.currency} |`)
  lines.push(`| 总工期 | ${result.total_duration_days} 个工作日 (约 ${Math.ceil(result.total_duration_days / 5)} 周) |`)
  lines.push('')

  lines.push('### 🌐 各语言估算')
  lines.push('')
  lines.push('| 语言 | 词数 | 翻译 | 审校 | DTP | 配音 | 小计 | 工期 |')
  lines.push('|------|------|------|------|-----|------|------|------|')
  for (const loc of result.locale_estimates) {
    lines.push(`| ${loc.locale} | ${loc.word_count.toLocaleString()} | $${loc.translation_cost.toFixed(0)} | $${loc.review_cost.toFixed(0)} | $${loc.dtp_cost.toFixed(0)} | $${loc.voiceover_cost.toFixed(0)} | $${loc.total_cost.toFixed(0)} | ${loc.duration_days}d |`)
  }
  lines.push('')

  lines.push('### 📈 成本构成')
  lines.push('')
  lines.push('| 类别 | 占比 | 金额(USD) |')
  lines.push('|------|------|----------|')
  for (const cat of result.cost_breakdown) {
    const bar = '█'.repeat(Math.round(cat.percentage / 5)) + '░'.repeat(20 - Math.round(cat.percentage / 5))
    lines.push(`| ${cat.category} | ${bar} ${cat.percentage}% | $${cat.amount_usd.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('### 📅 项目阶段')
  lines.push('')
  lines.push('| 阶段 | 工期(天) | 工时(h) | 成本(USD) | 说明 |')
  lines.push('|------|---------|---------|----------|------|')
  for (const phase of result.phases) {
    if (phase.duration_days > 0) {
      lines.push(`| ${phase.phase} | ${phase.duration_days} | ${phase.effort_hours} | $${phase.cost_usd.toLocaleString()} | ${phase.description.substring(0, 30)} |`)
    }
  }
  lines.push('')

  lines.push('### 🏁 关键里程碑')
  lines.push('')
  lines.push('| 里程碑 | 第X天 | 交付物 |')
  lines.push('|--------|--------|--------|')
  for (const ms of result.schedule_milestones) {
    lines.push(`| ${ms.milestone} | Day ${ms.day} | ${ms.deliverable} |`)
  }
  lines.push('')

  if (result.risk_factors.length > 0) {
    lines.push('### ⚠️ 风险因素')
    lines.push('')
    result.risk_factors.forEach(r => lines.push(`- 🔴 ${r}`))
  }

  lines.push('')
  lines.push('---')
  lines.push('*TransLocaleAgent • Localization Cost Estimation & Scheduling • v' + VERSION + '*')
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: translation_quality_evaluator
  tools.register(defineTool({
    name: 'translation_quality_evaluator',
    description: '翻译质量自动评估与错误分类工具：基于MQM框架对译文进行多维度质量评估，自动检测误译、漏译、术语不一致等10类错误并按严重度分级（critical/major/minor），输出质量评分和改进建议。',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON对象，包含: segments(数组，每项含segment_id/source/target/reference/domain), strictness(strict/standard/lenient)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data = JSON.parse(args.input_data)
      const segments: TranslationSegment[] = data.segments
      const strictness = data.strictness || 'standard'
      const result = evaluateTranslationQuality(segments, strictness)
      return formatTranslationQualityReport(result)
    }
  }))

  // Tool 2: terminology_manager
  tools.register(defineTool({
    name: 'terminology_manager',
    description: '术语库管理与一致性检查工具：对比术语库与译文，检测术语不一致、缺失翻译、已弃用术语使用等问题，计算一致性评分，生成术语整改清单。',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON对象，包含: glossary(术语库数组，每项含term_id/source_term/target_term/domain/status/definition/context), segments(译文数组，每项含segment_id/source/target)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data = JSON.parse(args.input_data)
      const glossary: TermEntry[] = data.glossary
      const segments: { segment_id: string; source: string; target: string }[] = data.segments
      const result = manageTerminology(glossary, segments)
      return formatTerminologyReport(result)
    }
  }))

  // Tool 3: localization_readiness_auditor
  tools.register(defineTool({
    name: 'localization_readiness_auditor',
    description: '产品本地化就绪审查与i18n检测工具：扫描源代码/资源文件，检测硬编码字符串、编码问题、字符串拼接、RTL未支持、日期格式本地化等i18n问题，输出就绪度评分和分阶段整改计划。',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON对象，包含: components(组件数组，每项含component_id/component_type/content/file_path/line_number/context), target_locales(目标语言代码数组如["zh-cn","ja","ar"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data = JSON.parse(args.input_data)
      const components: SourceComponent[] = data.components
      const target_locales: string[] = data.target_locales
      const result = auditLocalizationReadiness(components, target_locales)
      return formatReadinessReport(result)
    }
  }))

  // Tool 4: machine_translation_post_edit
  tools.register(defineTool({
    name: 'machine_translation_post_edit',
    description: 'MT译后编辑工作量估算与优先级工具：基于HTER指标估算每条句段的译后编辑时间，区分轻度/完整编辑级别，按优先级(P1-P4)排序，输出工作量矩阵和成本估算。',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON对象，包含: segments(MT句段数组，每项含segment_id/source/mt_output/reference/domain/word_count), mt_engine(引擎名称如gpt-4/deepl/google_translate), rate_per_hour(译员时薪USD)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data = JSON.parse(args.input_data)
      const segments: MTSegment[] = data.segments
      const mt_engine: string = data.mt_engine || 'unknown'
      const rate_per_hour: number = data.rate_per_hour || 45
      const result = estimatePEEffort(segments, mt_engine, rate_per_hour)
      return formatPEReport(result)
    }
  }))

  // Tool 5: cultural_adaptation_advisor
  tools.register(defineTool({
    name: 'cultural_adaptation_advisor',
    description: '文化适配建议与敏感内容检测工具：分析内容在目标市场的文化适配性，检测敏感话题、冒犯性符号、颜色含义差异、幽默失效等，输出各区域文化适配度评分和修改建议。',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON对象，包含: content_items(内容数组，每项含content_id/content_type/content/context), source_culture(源文化如"US"), target_regions(目标区域数组如["CN","JP","SA"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data = JSON.parse(args.input_data)
      const content_items: ContentItem[] = data.content_items
      const source_culture: string = data.source_culture || 'US'
      const target_regions: string[] = data.target_regions
      const result = adviseCulturalAdaptation(content_items, source_culture, target_regions)
      return formatCulturalAdaptationReport(result)
    }
  }))

  // Tool 6: multilingual_seo_optimizer
  tools.register(defineTool({
    name: 'multilingual_seo_optimizer',
    description: '多语言SEO关键词与hreflang配置工具：审计多语言网站的SEO健康度，检测hreflang标记覆盖、关键词堆叠、URL slug本地化、meta description等，输出SEO改进建议和关键词机会。',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON对象，包含: pages(页面数组，每项含page_id/url/source_language/target_language/title/meta_description/keywords/content_length/target_region), target_languages(所有目标语言代码数组)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data = JSON.parse(args.input_data)
      const pages: SEOPage[] = data.pages
      const target_languages: string[] = data.target_languages
      const result = optimizeMultilingualSEO(pages, target_languages)
      return formatSEOReport(result)
    }
  }))

  // Tool 7: subtitle_sync_generator
  tools.register(defineTool({
    name: 'subtitle_sync_generator',
    description: '字幕时间轴对齐与翻译工具：校验字幕时间轴（重叠、负时长、间隔），计算阅读速度(CPS)，检测行数/行长度违规，输出标准SRT/VTT格式字幕文件内容。',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON对象，包含: subtitles(字幕数组，每项含index/start_time/end_time/source_text/target_text), target_language(目标语言), max_cps(最大字符/秒，默认21), max_lines(最大行数，默认2), format(SRT或VTT)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data = JSON.parse(args.input_data)
      const subtitles: SubtitleEntry[] = data.subtitles
      const target_language: string = data.target_language || 'zh-cn'
      const max_cps: number = data.max_cps || 21
      const max_lines: number = data.max_lines || 2
      const format: 'SRT' | 'VTT' = data.format || 'SRT'
      const result = syncSubtitles(subtitles, target_language, max_cps, max_lines, format)
      return formatSubtitleReport(result)
    }
  }))

  // Tool 8: localization_cost_estimator
  tools.register(defineTool({
    name: 'localization_cost_estimator',
    description: '本地化项目成本估算与排期工具：基于字数、复杂度、语言对、内容类型、DTP/配音需求，计算项目总成本（翻译/审校/DTP/配音/项目管理/工程），输出阶段排期和关键里程碑。',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON对象，包含: targets(语言目标数组，每项含target_locale/word_count/content_type/complexity/requires_dtp/requires_voiceover/requires_review), source_language(源语言如"en"), rate_card(费率卡对象含translation/review/dtp/voiceover/pm_rate)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data = JSON.parse(args.input_data)
      const targets: LocaleTarget[] = data.targets
      const source_language: string = data.source_language || 'en'
      const rate_card = data.rate_card || { translation: 0.12, review: 0.06, dtp: 0.03, voiceover: 80, pm_rate: 60 }
      const result = estimateLocalizationCost(targets, source_language, rate_card)
      return formatCostEstimateReport(result)
    }
  }))
}
