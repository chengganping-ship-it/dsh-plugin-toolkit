/**
 * Loop Engineering Self-Verification Layer — Core Loop Executor
 *
 * The heart of the Loop Engineering paradigm: execute a tool, validate its
 * output, retry with feedback if validation fails, and escalate if max
 * retries are exceeded. Tracks all attempts and produces a {@link LoopResult}.
 *
 * @module dsh-loop-engineering
 */

import type {
  LoopConfig,
  LoopResult,
  AttemptRecord,
  Validator,
} from './types'
import { DEFAULT_LOOP_CONFIG } from './types'
import { analyzeCritique } from './self-critique'

// ---------------------------------------------------------------------------
// Utility: sleep
// ---------------------------------------------------------------------------

/** Returns a promise that resolves after `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Utility: runValidators
// ---------------------------------------------------------------------------

/**
 * Runs all validators against the output and collects error messages.
 * @returns Flattened array of all validation errors (empty = all passed)
 */
function runValidators(output: string, validators: Validator[]): string[] {
  const errors: string[] = []
  for (const validator of validators) {
    try {
      const result = validator(output)
      errors.push(...result)
    } catch (e) {
      errors.push(`Validator threw error: ${(e as Error).message}`)
    }
  }
  return errors
}

// ---------------------------------------------------------------------------
// Utility: calculateFinalScore
// ---------------------------------------------------------------------------

/**
 * Calculates the overall quality score (0-100) based on:
 * - Whether any attempt passed validation (50 points)
 * - The best critique score across attempts (50 points)
 */
function calculateFinalScore(attempts: AttemptRecord[]): number {
  if (attempts.length === 0) return 0

  // Check if any attempt passed all validators
  const anyPassed = attempts.some((a) => a.validationErrors.length === 0)
  const passScore = anyPassed ? 50 : 0

  // Best critique score contribution (0-50)
  const critiqueScores = attempts
    .map((a) => a.critiqueScore)
    .filter((s): s is number => s !== undefined)

  const bestCritique = critiqueScores.length > 0 ? Math.max(...critiqueScores) : 50
  const critiqueContribution = Math.round((bestCritique / 100) * 50)

  return Math.min(100, passScore + critiqueContribution)
}

// ---------------------------------------------------------------------------
// Public: executeWithLoop
// ---------------------------------------------------------------------------

/**
 * Executes a tool function within a self-verifying retry loop.
 *
 * Loop algorithm:
 * 1. Execute the tool function with the provided input
 * 2. Run all validators on the output
 * 3. Optionally run self-critique analysis
 * 4. If all validators pass → return immediately
 * 5. If validators fail and retries remain → invoke `onRetry` callback,
 *    wait for backoff, then retry
 * 6. If max retries exceeded → return best-effort result with warnings
 *
 * @param toolName - Human-readable name for logging/identification
 * @param executeFn - Async function that executes the tool and returns output
 * @param input - Input string passed to the tool
 * @param config - Loop configuration (validators, retries, backoff, etc.)
 *
 * @returns A {@link LoopResult} containing the output, all attempts, timing,
 *          quality score, and any warnings.
 *
 * @example
 * ```ts
 * const result = await executeWithLoop(
 *   'carbon_price_predictor',
 *   async (input) => carbonTool.execute(input),
 *   '{"market": "CN-ETS", "historical_prices": [50, 55, 60]}',
 *   {
 *     maxRetries: 3,
 *     validators: [markdownStructureValidator({ minHeaders: 2 }), disclaimerValidator()],
 *     selfCritique: true,
 *   }
 * )
 * ```
 */
export async function executeWithLoop(
  toolName: string,
  executeFn: (input: string) => Promise<string>,
  input: string,
  config: LoopConfig,
): Promise<LoopResult> {
  // Merge with defaults
  const maxRetries = config.maxRetries ?? DEFAULT_LOOP_CONFIG.maxRetries
  const backoffMs = config.backoffMs ?? DEFAULT_LOOP_CONFIG.backoffMs
  const validators = config.validators
  const onRetry = config.onRetry
  const selfCritique = config.selfCritique ?? DEFAULT_LOOP_CONFIG.selfCritique

  const startTime = Date.now()
  const attempts: AttemptRecord[] = []
  const warnings: string[] = []

  for (let attemptNum = 1; attemptNum <= maxRetries; attemptNum++) {
    const attemptStart = Date.now()

    // --- Execute the tool ---
    let output: string
    try {
      output = await executeFn(input)
    } catch (e) {
      const errorMsg = `Tool execution failed: ${(e as Error).message}`
      const durationMs = Date.now() - attemptStart
      attempts.push({
        attempt: attemptNum,
        output: errorMsg,
        durationMs,
        validationErrors: [errorMsg],
      })

      // Decide whether to retry or give up
      if (attemptNum < maxRetries) {
        onRetry?.(attemptNum, errorMsg)
        await sleep(backoffMs * attemptNum) // Linear backoff
        continue
      } else {
        warnings.push(`Max retries (${maxRetries}) exceeded. Tool threw an error on final attempt.`)
        break
      }
    }

    const durationMs = Date.now() - attemptStart

    // --- Run validators ---
    const validationErrors = runValidators(output, validators)

    // --- Run self-critique if enabled ---
    let critiqueScore: number | undefined
    if (selfCritique) {
      critiqueScore = analyzeCritique(output).score
    }

    // --- Record this attempt ---
    const record: AttemptRecord = {
      attempt: attemptNum,
      output,
      durationMs,
      validationErrors,
      critiqueScore,
    }
    attempts.push(record)

    // --- Check if all validators passed ---
    if (validationErrors.length === 0) {
      // Success — return immediately
      const totalDurationMs = Date.now() - startTime
      const finalScore = calculateFinalScore(attempts)

      return {
        success: true,
        output,
        attempts,
        totalDurationMs,
        finalScore,
        warnings,
      }
    }

    // --- Validation failed: decide whether to retry ---
    if (attemptNum < maxRetries) {
      const errorSummary = validationErrors.slice(0, 3).join('; ')
      onRetry?.(attemptNum, errorSummary)
      // Linear backoff: attempt 1 waits 1x, attempt 2 waits 2x, etc.
      await sleep(backoffMs * attemptNum)
    } else {
      // Final attempt failed
      warnings.push(
        `Max retries (${maxRetries}) exceeded with ${validationErrors.length} validation error(s).`,
      )
    }
  }

  // --- All attempts exhausted: determine best output ---
  // Priority: lowest validation errors > highest critique score > last attempt
  const bestAttempt = selectBestAttempt(attempts)
  const totalDurationMs = Date.now() - startTime
  const finalScore = calculateFinalScore(attempts)

  return {
    success: false,
    output: bestAttempt.output,
    attempts,
    totalDurationMs,
    finalScore,
    warnings,
  }
}

// ---------------------------------------------------------------------------
// Helper: selectBestAttempt
// ---------------------------------------------------------------------------

/**
 * Selects the best attempt from the list based on:
 * 1. Fewest validation errors
 * 2. Highest critique score (tiebreaker)
 * 3. Latest attempt (final tiebreaker)
 */
function selectBestAttempt(attempts: AttemptRecord[]): AttemptRecord {
  if (attempts.length === 0) {
    return { attempt: 0, output: '', durationMs: 0, validationErrors: ['No attempts recorded'] }
  }

  return attempts.reduce((best, current) => {
    // Primary: fewer validation errors
    if (current.validationErrors.length < best.validationErrors.length) return current
    if (current.validationErrors.length > best.validationErrors.length) return best

    // Tiebreaker 1: higher critique score
    const bestScore = best.critiqueScore ?? 50
    const currentScore = current.critiqueScore ?? 50
    if (currentScore > bestScore) return current
    if (currentScore < bestScore) return best

    // Tiebreaker 2: later attempt
    return current.attempt > best.attempt ? current : best
  })
}
