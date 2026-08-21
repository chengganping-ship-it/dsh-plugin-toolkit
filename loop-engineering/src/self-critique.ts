/**
 * Loop Engineering Self-Verification Layer — Self-Critique
 *
 * Heuristic-based self-critique module that evaluates output quality across
 * three dimensions — completeness, consistency, and actionability — without
 * requiring an LLM call. Returns a score (0-100) with improvement suggestions.
 *
 * @module dsh-loop-engineering
 */

import type { CritiqueResult } from './types'

// ---------------------------------------------------------------------------
// Internal Scoring Helpers
// ---------------------------------------------------------------------------

/**
 * Scores completeness based on output richness indicators:
 * - Presence of structured formatting (headers, lists, tables)
 * - Sufficient length (word count)
 * - Presence of quantitative data
 */
function scoreCompleteness(output: string): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 50

  // Check for structured formatting
  const hasHeaders = /^#{1,6}\s+/m.test(output)
  const hasLists = /^[\s]*[-*+]\s+/m.test(output)
  const hasTables = /\|.+\|\s*\n\|[-:\s|]+\|/.test(output)

  if (hasHeaders) {
    score += 15
  } else {
    issues.push('No markdown headers found — output lacks structure')
  }

  if (hasLists || hasTables) {
    score += 10
  } else {
    issues.push('No lists or tables found — output could be more organized')
  }

  // Check for quantitative data (numbers, percentages)
  const numberCount = (output.match(/\d+[\d,.]*/g) ?? []).length
  if (numberCount >= 3) {
    score += 15
  } else if (numberCount >= 1) {
    score += 8
    issues.push('Limited quantitative data — consider adding more specific numbers')
  } else {
    issues.push('No quantitative data found — analytical output should include numbers')
  }

  // Check word count for substance
  const wordCount = output.trim().split(/\s+/).length
  if (wordCount >= 100) {
    score += 10
  } else if (wordCount >= 30) {
    score += 5
    issues.push('Output is somewhat brief — could benefit from more detail')
  } else {
    issues.push('Output is too brief — likely missing key information')
  }

  // Penalty for very short output
  if (wordCount < 10) {
    score -= 20
  }

  return { score: Math.min(100, Math.max(0, score)), issues }
}

/**
 * Scores consistency by checking for:
 * - Internal contradictions (e.g., saying both "surplus" and "deficit")
 * - Formatting consistency (matching sections)
 * - Referential integrity (mentions that are followed up)
 */
function scoreConsistency(output: string): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 70

  // Check for contradictory phrases
  const contradictions: [RegExp, RegExp][] = [
    [/盈余|surplus/i, /缺口|deficit/i],
    [/increase|增长|上升/i, /decrease|下降|减少/i],
    [/bullish|看涨/i, /bearish|看跌/i],
    [/positive|正面|乐观/i, /negative|负面|悲观/i],
  ]

  for (const [patternA, patternB] of contradictions) {
    if (patternA.test(output) && patternB.test(output)) {
      // Could be legitimate contrast — only flag if very short proximity
      const idxA = output.search(patternA)
      const idxB = output.search(patternB)
      if (Math.abs(idxA - idxB) < 100) {
        score -= 5
        issues.push(`Nearby contradictory statements: "${patternA.source}" vs "${patternB.source}"`)
      }
    }
  }

  // Check for consistent formatting (headers should follow hierarchy)
  const headerLevels = output.match(/^#{1,6}\s/gm)?.map((h) => h.trim().length) ?? []
  if (headerLevels.length >= 2) {
    let jumps = 0
    for (let i = 1; i < headerLevels.length; i++) {
      if (headerLevels[i] - headerLevels[i - 1] > 1) {
        jumps++
      }
    }
    if (jumps > 0) {
      score -= jumps * 3
      issues.push(`Non-sequential header hierarchy detected (${jumps} jump(s))`)
    }
  }

  // Check for unfinished sentences
  const trimmed = output.trim()
  if (/[,，:：]$/.test(trimmed) || /[,，:：]\s*$/.test(trimmed)) {
    score -= 15
    issues.push('Output appears to end mid-sentence')
  }

  // Check for excessive repetition
  const sentences = output.split(/[.!?。！？\n]+/).filter((s) => s.trim().length > 10)
  const uniqueSentences = new Set(sentences.map((s) => s.trim()))
  if (sentences.length > 3 && uniqueSentences.size < sentences.length * 0.7) {
    score -= 10
    issues.push('High sentence repetition detected')
  }

  return { score: Math.min(100, Math.max(0, score)), issues }
}

/**
 * Scores actionability by checking for:
 * - Presence of recommendation/action keywords
 * - Specific and concrete language
 * - Clear next steps or call-to-action
 */
function scoreActionability(output: string): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 50

  // Action-oriented keywords (English and Chinese)
  const actionPatterns = [
    /建议|recommend/i,
    /应当|should|must|need to/i,
    /行动|action/i,
    /策略|strategy/i,
    /步骤|step/i,
    /实施|implement/i,
    /优化|optimize/i,
    /目标|target|goal/i,
    /计划|plan/i,
  ]

  let actionCount = 0
  for (const pattern of actionPatterns) {
    if (pattern.test(output)) {
      actionCount++
    }
  }

  if (actionCount >= 3) {
    score += 25
  } else if (actionCount >= 1) {
    score += 12
    issues.push('Limited actionable language — add more specific recommendations')
  } else {
    issues.push('No actionable recommendations found — output should suggest next steps')
  }

  // Check for specificity (presence of dates, numbers, percentages)
  const hasDates = /\d{4}[-/年]\d{1,2}/.test(output) || /20\d{2}/.test(output)
  const hasPercentages = /\d+(\.\d+)?%/.test(output)

  if (hasDates) {
    score += 10
  } else {
    issues.push('No temporal references found — adding timelines would improve actionability')
  }

  if (hasPercentages) {
    score += 10
  } else {
    issues.push('No quantified targets found — adding percentages would improve specificity')
  }

  // Check for bullet points or numbered lists (indicates structured action items)
  const bulletMatches = output.match(/^[\s]*[-*+]\s+/gm) ?? []
  const numberedMatches = output.match(/^[\s]*\d+[.)]\s+/gm) ?? []
  if (bulletMatches.length >= 3 || numberedMatches.length >= 3) {
    score += 5
  } else if (bulletMatches.length === 0 && numberedMatches.length === 0) {
    issues.push('No structured action items (bulleted/numbered lists) found')
  }

  return { score: Math.min(100, Math.max(0, score)), issues }
}

// ---------------------------------------------------------------------------
// Public analyzeCritique
// ---------------------------------------------------------------------------

/**
 * Performs heuristic self-critique analysis on tool output.
 *
 * Evaluates three dimensions:
 * - **Completeness** (0-100): Does the output cover the expected scope?
 * - **Consistency** (0-100): Is the output internally consistent?
 * - **Actionability** (0-100): Does the output provide actionable information?
 *
 * The overall score is the weighted average: completeness (35%),
 * consistency (30%), actionability (35%).
 *
 * @param output - The raw tool output to critique
 * @returns A {@link CritiqueResult} with dimension scores and suggestions
 *
 * @example
 * ```ts
 * const result = analyzeCritique(reportOutput)
 * console.log(result.score) // 72
 * console.log(result.suggestions) // ['Add more specific numbers', ...]
 * ```
 */
export function analyzeCritique(output: string): CritiqueResult {
  const completeness = scoreCompleteness(output)
  const consistency = scoreConsistency(output)
  const actionability = scoreActionability(output)

  // Weighted average: completeness 35%, consistency 30%, actionability 35%
  const overall = Math.round(
    completeness.score * 0.35 + consistency.score * 0.3 + actionability.score * 0.35,
  )

  // Collect and deduplicate suggestions
  const allSuggestions = [
    ...completeness.issues,
    ...consistency.issues,
    ...actionability.issues,
  ]

  // Prioritize: completeness first, then consistency, then actionability
  const suggestions = allSuggestions.slice(0, 5) // cap at 5 suggestions

  return {
    score: Math.min(100, Math.max(0, overall)),
    dimensions: {
      completeness: completeness.score,
      consistency: consistency.score,
      actionability: actionability.score,
    },
    suggestions,
  }
}
