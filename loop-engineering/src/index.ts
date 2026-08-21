/**
 * DSH Loop Engineering Self-Verification Layer v1.0.0
 *
 * 2026 Loop Engineering paradigm: build self-correcting agentic loops.
 * Instead of one-shot tool calls, agents execute, verify, retry with
 * feedback, and escalate.
 *
 * This module wraps DSH tools with retry logic, output validation,
 * and self-critique scoring.
 *
 * @module dsh-loop-engineering
 *
 * @example
 * ```ts
 * import {
 *   executeWithLoop,
 *   markdownStructureValidator,
 *   disclaimerValidator,
 *   noHallucinationMarkers,
 * } from 'dsh-loop-engineering'
 *
 * const result = await executeWithLoop(
 *   'carbon_price_predictor',
 *   async (input) => myTool.execute(input),
 *   inputData,
 *   {
 *     maxRetries: 3,
 *     backoffMs: 1000,
 *     validators: [
 *       markdownStructureValidator({ minHeaders: 2 }),
 *       disclaimerValidator(),
 *       noHallucinationMarkers(),
 *     ],
 *     selfCritique: true,
 *   }
 * )
 *
 * console.log(`Success: ${result.success}, Score: ${result.finalScore}`)
 * console.log(`Attempts: ${result.attempts.length}`)
 * console.log(result.output)
 * ```
 */

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

export { executeWithLoop } from './loop-executor'

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

export {
  jsonValidator,
  markdownStructureValidator,
  noHallucinationMarkers,
  lengthValidator,
  keywordPresenceValidator,
  disclaimerValidator,
} from './validators'

// ---------------------------------------------------------------------------
// Self-Critique
// ---------------------------------------------------------------------------

export { analyzeCritique } from './self-critique'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type {
  LoopConfig,
  LoopResult,
  AttemptRecord,
  Validator,
  JsonValidatorOptions,
  MarkdownValidatorOptions,
  LengthValidatorOptions,
  KeywordValidatorOptions,
  CritiqueResult,
} from './types'

export { DEFAULT_LOOP_CONFIG } from './types'
