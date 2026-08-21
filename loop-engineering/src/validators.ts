/**
 * Loop Engineering Self-Verification Layer — Built-in Validators
 *
 * A collection of reusable output validators. Each validator is a pure function
 * `(output: string) => string[]` that returns an array of error messages
 * (empty = passed).
 *
 * @module dsh-loop-engineering
 */

import type {
  Validator,
  JsonValidatorOptions,
  MarkdownValidatorOptions,
  LengthValidatorOptions,
  KeywordValidatorOptions,
} from './types'

// ---------------------------------------------------------------------------
// jsonValidator
// ---------------------------------------------------------------------------

/**
 * Validates that the output is syntactically valid JSON.
 *
 * @example
 * ```ts
 * const validate = jsonValidator({ requireObject: true, requiredKeys: ['price'] })
 * validate('{"price": 50}')  // []  — passes
 * validate('not json')        // ['Invalid JSON: ...']
 * ```
 */
export function jsonValidator(options: JsonValidatorOptions = {}): Validator {
  return (output: string): string[] => {
    const trimmed = output.trim()
    let parsed: unknown

    try {
      parsed = JSON.parse(trimmed)
    } catch (e) {
      return [`Invalid JSON: ${(e as Error).message}`]
    }

    if (options.requireObject) {
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return ['JSON must be an object (not array or primitive)']
      }
    }

    if (options.requiredKeys && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>
      const missing = options.requiredKeys.filter((key: string) => !(key in obj))
      if (missing.length > 0) {
        return [`Missing required JSON keys: ${missing.join(', ')}`]
      }
    }

    return []
  }
}

// ---------------------------------------------------------------------------
// markdownStructureValidator
// ---------------------------------------------------------------------------

/**
 * Validates that the output has proper markdown structure: headers, sections,
 * and optionally tables.
 *
 * @example
 * ```ts
 * const validate = markdownStructureValidator({ minHeaders: 2, requireTable: true })
 * validate('# Title\n## Section\n| col | col |') // [] — passes
 * ```
 */
export function markdownStructureValidator(options: MarkdownValidatorOptions = {}): Validator {
  const minHeaders = options.minHeaders ?? 1
  const requireTable = options.requireTable ?? false

  return (output: string): string[] => {
    const errors: string[] = []

    // Count markdown headers (# through ######)
    const headerMatches = output.match(/^#{1,6}\s+/gm)
    const headerCount = headerMatches?.length ?? 0
    if (headerCount < minHeaders) {
      errors.push(`Expected at least ${minHeaders} markdown header(s), found ${headerCount}`)
    }

    if (requireTable) {
      // Look for markdown table patterns (| col | col | with separator line)
      const tablePattern = /\|.+\|\s*\n\|[-:\s|]+\|/
      if (!tablePattern.test(output)) {
        errors.push('Expected at least one markdown table')
      }
    }

    return errors
  }
}

// ---------------------------------------------------------------------------
// noHallucinationMarkers
// ---------------------------------------------------------------------------

/**
 * Detects common hallucination patterns that suggest the output may contain
 * fabricated or unreliable information.
 *
 * Patterns detected:
 * - "As an AI" / "I cannot" type disclaimers mixed into analytical output
 * - Unverifiable absolute claims ("always", "never", "100%")
 * - Placeholder text patterns
 */
export function noHallucinationMarkers(): Validator {
  return (output: string): string[] => {
    const errors: string[] = []

    // Check for AI disclaimers embedded in analytical output
    const aiPatterns = [
      /as an ai( language model)?[,.]/i,
      /i (cannot|can't|am unable to|don't have (access|the ability))/i,
      /i don't have real-time/i,
      /my (knowledge|training) (is |)cut off/i,
    ]

    for (const pattern of aiPatterns) {
      if (pattern.test(output)) {
        errors.push(`Possible AI hallucination marker detected: "${pattern.source}"`)
      }
    }

    // Check for placeholder/incomplete text
    const placeholderPatterns = [
      /\[(insert|TODO|FIXME|placeholder|xxx)\]/i,
      /lorem ipsum/i,
      /placeholder (text|data|content)/i,
    ]

    for (const pattern of placeholderPatterns) {
      if (pattern.test(output)) {
        errors.push(`Placeholder text detected: "${pattern.source}"`)
      }
    }

    // Check for unverifiable absolutes (only flag if multiple found)
    const absolutePatterns = [/\balways\b/gi, /\bnever\b/gi, /\b100%\b/gi]
    let absoluteCount = 0
    for (const pattern of absolutePatterns) {
      const matches = output.match(pattern)
      if (matches) absoluteCount += matches.length
    }
    if (absoluteCount >= 3) {
      errors.push(`Excessive absolute claims detected (${absoluteCount} instances of "always"/"never"/"100%")`)
    }

    return errors
  }
}

// ---------------------------------------------------------------------------
// lengthValidator
// ---------------------------------------------------------------------------

/**
 * Validates that the output length falls within expected bounds (characters
 * and/or words).
 */
export function lengthValidator(options: LengthValidatorOptions = {}): Validator {
  const minChars = options.minChars ?? 0
  const maxChars = options.maxChars ?? Infinity
  const minWords = options.minWords ?? 0
  const maxWords = options.maxWords ?? Infinity

  return (output: string): string[] => {
    const errors: string[] = []
    const charLen = output.length
    const wordCount = output.trim() === '' ? 0 : output.trim().split(/\s+/).length

    if (charLen < minChars) {
      errors.push(`Output too short: ${charLen} chars (minimum ${minChars})`)
    }
    if (charLen > maxChars) {
      errors.push(`Output too long: ${charLen} chars (maximum ${maxChars})`)
    }
    if (wordCount < minWords) {
      errors.push(`Output too short: ${wordCount} words (minimum ${minWords})`)
    }
    if (wordCount > maxWords) {
      errors.push(`Output too long: ${wordCount} words (maximum ${maxWords})`)
    }

    return errors
  }
}

// ---------------------------------------------------------------------------
// keywordPresenceValidator
// ---------------------------------------------------------------------------

/**
 * Validates keyword presence: require ALL "required" keywords, AT LEAST ONE
 * of "anyOf" keywords, and NONE of "forbidden" keywords.
 */
export function keywordPresenceValidator(options: KeywordValidatorOptions = {}): Validator {
  return (output: string): string[] => {
    const errors: string[] = []
    const text = options.caseSensitive ? output : output.toLowerCase()

    if (options.required) {
      for (const keyword of options.required) {
        const searchKey = options.caseSensitive ? keyword : keyword.toLowerCase()
        if (!text.includes(searchKey)) {
          errors.push(`Missing required keyword: "${keyword}"`)
        }
      }
    }

    if (options.anyOf && options.anyOf.length > 0) {
      const found = options.anyOf.some((keyword: string) => {
        const searchKey = options.caseSensitive ? keyword : keyword.toLowerCase()
        return text.includes(searchKey)
      })
      if (!found) {
        errors.push(`Expected at least one of: ${options.anyOf.map((k: string) => `"${k}"`).join(', ')}`)
      }
    }

    if (options.forbidden) {
      for (const keyword of options.forbidden) {
        const searchKey = options.caseSensitive ? keyword : keyword.toLowerCase()
        if (text.includes(searchKey)) {
          errors.push(`Forbidden keyword detected: "${keyword}"`)
        }
      }
    }

    return errors
  }
}

// ---------------------------------------------------------------------------
// disclaimerValidator
// ---------------------------------------------------------------------------

/**
 * Validates that the output contains a disclaimer marker. Essential for
 * financial, medical, or legal tools where output should not be interpreted
 * as professional advice.
 *
 * Looks for common disclaimer patterns in both English and Chinese.
 */
export function disclaimerValidator(): Validator {
  const disclaimerPatterns = [
    /免责/i,
    /disclaimer/i,
    /not (professional|financial|legal|medical) advice/i,
    /不(构成|替代|作为)(专业|法律|金融|医学)/i,
    /仅供参考/i,
    /for reference only/i,
    /risk (warning|notice)/i,
  ]

  return (output: string): string[] => {
    const hasDisclaimer = disclaimerPatterns.some((p) => p.test(output))
    if (!hasDisclaimer) {
      return ['Missing disclaimer statement (required for financial/medical/legal output)']
    }
    return []
  }
}
