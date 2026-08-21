/**
 * Loop Engineering Self-Verification Layer — Shared Types
 *
 * Core type definitions for the retry/verification loop, attempt records,
 * validators, and self-critique scoring.
 *
 * @module dsh-loop-engineering
 */

// ---------------------------------------------------------------------------
// Result & Attempt Types
// ---------------------------------------------------------------------------

/**
 * A single execution attempt within the loop. Each attempt records the raw
 * output, how long it took, any validation errors that were raised, and an
 * optional self-critique score (0-100).
 */
export interface AttemptRecord {
  /** 1-based attempt number */
  attempt: number
  /** Raw output produced by the tool on this attempt */
  output: string
  /** Wall-clock duration of this attempt in milliseconds */
  durationMs: number
  /** Validation error messages (empty array means all validators passed) */
  validationErrors: string[]
  /** Self-critique score (0-100) if self-critique mode is enabled */
  critiqueScore?: number
}

/**
 * The final result of running {@link executeWithLoop}. Contains the best
 * output found, all attempts, timing, a quality score, and any warnings.
 */
export interface LoopResult {
  /** True if at least one attempt passed all validators */
  success: boolean
  /** Output from the best attempt (highest critique score, or last attempt) */
  output: string
  /** Chronological list of all attempts */
  attempts: AttemptRecord[]
  /** Total wall-clock duration of the entire loop in milliseconds */
  totalDurationMs: number
  /** Quality score 0-100 based on validation pass rate and critique */
  finalScore: number
  /** Human-readable warnings (e.g., "max retries exceeded") */
  warnings: string[]
}

// ---------------------------------------------------------------------------
// Validator Types
// ---------------------------------------------------------------------------

/**
 * A validator examines raw output and returns an array of error messages.
 * An empty array means the output passed validation.
 */
export type Validator = (output: string) => string[]

/**
 * Configuration for the JSON structure validator.
 */
export interface JsonValidatorOptions {
  /** If true, require the parsed JSON to be an object (not array/primitive) */
  requireObject?: boolean
  /** Optional: require specific top-level keys to be present */
  requiredKeys?: string[]
}

/**
 * Configuration for the markdown structure validator.
 */
export interface MarkdownValidatorOptions {
  /** Minimum number of markdown headers required (default: 1) */
  minHeaders?: number
  /** Minimum number of sections (header groups) required (default: 1) */
  minSections?: number
  /** Set to true to also require at least one markdown table */
  requireTable?: boolean
}

/**
 * Configuration for the length validator.
 */
export interface LengthValidatorOptions {
  /** Minimum character length (default: 0) */
  minChars?: number
  /** Maximum character length (default: Infinity) */
  maxChars?: number
  /** Minimum word count (default: 0) */
  minWords?: number
  /** Maximum word count (default: Infinity) */
  maxWords?: number
}

/**
 * Configuration for the keyword presence validator.
 */
export interface KeywordValidatorOptions {
  /** Keywords that must ALL be present */
  required?: string[]
  /** Keywords where AT LEAST ONE must be present */
  anyOf?: string[]
  /** Keywords that must NOT be present */
  forbidden?: string[]
  /** Case-sensitive matching (default: false) */
  caseSensitive?: boolean
}

// ---------------------------------------------------------------------------
// Self-Critique Types
// ---------------------------------------------------------------------------

/**
 * Result of the heuristic self-critique analysis.
 */
export interface CritiqueResult {
  /** Overall quality score 0-100 */
  score: number
  /** Individual dimension scores */
  dimensions: {
    /** Does the output cover the expected scope? (0-100) */
    completeness: number
    /** Is the output internally consistent? (0-100) */
    consistency: number
    /** Does the output provide actionable information? (0-100) */
    actionability: number
  }
  /** Human-readable suggestions for improvement */
  suggestions: string[]
}

// ---------------------------------------------------------------------------
// Loop Executor Types
// ---------------------------------------------------------------------------

/**
 * Configuration for the loop executor.
 */
export interface LoopConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number
  /** Base backoff in milliseconds between retries (default: 1000) */
  backoffMs: number
  /** List of validators to run on each output */
  validators: Validator[]
  /** Optional callback invoked on each retry with attempt number and error summary */
  onRetry?: (attempt: number, error: string) => void
  /** Enable self-critique mode for scoring outputs (default: false) */
  selfCritique?: boolean
}

/**
 * Default loop configuration used when fields are omitted.
 */
export const DEFAULT_LOOP_CONFIG: Omit<LoopConfig, 'validators'> = {
  maxRetries: 3,
  backoffMs: 1000,
  selfCritique: false,
}
