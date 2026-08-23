/**
 * dsh-tool-skillsforge - L8 Agent Skill Generator for Marketplace Monetization
 *
 * Generates complete Agent Skills (not just tools) with procedural SOP knowledge,
 * verification protocols, error recovery, and marketplace monetization scoring.
 *
 * Key insight: Tool = passive API endpoint (a hand) | Agent Skill = procedural
 * SOP knowledge + verification + error recovery (a brain cortex that knows HOW).
 *
 * 8 Tools: skill_architect, sop_generator, verification_engine_designer,
 * error_recovery_proceduralizer, knowledge_graph_embedder, prompt_craft_optimizer,
 * context_window_manager, marketplace_monetization_scorer.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ============================================================================
// UTILITIES
// ============================================================================

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function round(v: number, d = 2): number {
  const f = Math.pow(10, d)
  return Math.round(v * f) / f
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function qualityLabel(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}

// ============================================================================
// SHARED OUTPUT TYPES
// ============================================================================

export interface SkillForgeOutput {
  artifact: string
  quality_score: number
  marketplace_fit: string
  monetization_potential: string
}

// ============================================================================
// TOOL 1: skill_architect
// ============================================================================

export interface SkillArchitectInput {
  skill_name: string
  domain: string
  description: string
  trigger_conditions?: string[]
  input_schema?: Array<{ field: string; type: string; required: boolean; description: string }>
  output_format?: string
  sop_steps?: string[]
  verification_checks?: string[]
  error_recovery?: Array<{ error: string; recovery: string }>
  author?: string
  version?: string
}

function architectSkill(data: SkillArchitectInput): SkillForgeOutput {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const skillName = data.skill_name || 'unnamed-skill'
  const domain = data.domain || 'general'
  const description = data.description || 'No description provided'
  const triggers = data.trigger_conditions || [skillName + '-request', domain + '-task', 'analyze-' + domain]
  const outputFormat = data.output_format || 'structured_json_with_metadata'
  const sopSteps = data.sop_steps || [
    'Parse and validate all input parameters against schema',
    'Load relevant domain context and knowledge triples',
    'Execute core ' + domain + ' processing logic',
    'Apply verification checks at each decision point',
    'Format output with quality metrics and provenance',
    'Run post-execution verification against expected output schema'
  ]
  const verifyChecks = data.verification_checks || [
    'Input schema validation: all required fields present and typed',
    'Domain constraint check: input values within acceptable范围',
    'Output schema compliance: response matches defined format',
    'Semantic coherence: output logically consistent with input',
    'Quality threshold: generated content meets minimum quality bar'
  ]
  const errorRecovery = data.error_recovery || [
    { error: 'InputValidationError', recovery: 'Return structured error with field-level detail and correction hints' },
    { error: 'ProcessingTimeout', recovery: 'Switch to lightweight mode, return partial result with confidence flag' },
    { error: 'DomainKnowledgeGap', recovery: 'Flag uncertainty, provide best-effort result with explicit confidence score' }
  ]

  const lines: string[] = []
  lines.push('# Skill Architecture: ' + skillName)
  lines.push('')
  lines.push('## Overview')
  lines.push('')
  lines.push('**Domain:** ' + domain)
  lines.push('**Description:** ' + description)
  lines.push('**Output Format:** ' + outputFormat)
  lines.push('')
  lines.push('## Trigger Conditions')
  lines.push('')
  lines.push('This skill activates when the user request matches ANY of:')
  lines.push('')
  triggers.forEach((t, i) => { lines.push((i + 1) + '. "' + t + '"') })
  lines.push('')
  lines.push('## Input Schema')
  lines.push('')
  if (data.input_schema && data.input_schema.length > 0) {
    lines.push('| Field | Type | Required | Description |')
    lines.push('|-------|------|----------|-------------|')
    data.input_schema.forEach(f => {
      lines.push('| ' + f.field + ' | ' + f.type + ' | ' + (f.required ? 'Yes' : 'No') + ' | ' + f.description + ' |')
    })
  } else {
    lines.push('| Field | Type | Required | Description |')
    lines.push('|-------|------|----------|-------------|')
    lines.push('| query | string | Yes | The primary input query for ' + skillName + ' |')
    lines.push('| context | object | Optional | Additional context (domain, constraints, preferences) |')
    lines.push('| options | object | Optional | Execution options (depth, format, strictness) |')
  }
  lines.push('')
  lines.push('## Output Schema')
  lines.push('')
  lines.push('```json')
  lines.push(JSON.stringify({
    artifact: '<generated primary output>',
    quality_score: '<0-100>',
    marketplace_fit: '<HIGH|MODERATE|LOW>',
    monetization_potential: '<HIGH|MODERATE|LOW>',
    metadata: {
      skill: skillName,
      domain: domain,
      execution_time_ms: '<number>',
      confidence: '<0.0-1.0>',
      verification_passed: '<boolean>'
    }
  }, null, 2))
  lines.push('```')
  lines.push('')
  lines.push('## Standard Operating Procedure')
  lines.push('')
  sopSteps.forEach((step, i) => {
    lines.push('### Step ' + (i + 1) + ': ' + step.split(' ').slice(0, 4).join(' '))
    lines.push('')
    lines.push(step)
    lines.push('')
    if (verifyChecks[i]) {
      lines.push('- **Verification:** ' + verifyChecks[i])
    } else {
      lines.push('- **Verification:** Confirm step completion without errors')
    }
    lines.push('')
  })
  lines.push('## Error Recovery Procedures')
  lines.push('')
  errorRecovery.forEach((er, i) => {
    lines.push((i + 1) + '. **' + er.error + '**')
    lines.push('   - Recovery: ' + er.recovery)
    lines.push('')
  })
  lines.push('---')
  lines.push('*Generated by SkillsForge skill_architect*')

  const artifact = lines.join('\n')

  let score = 45
  if (data.skill_name && data.skill_name.length > 3) score += 10
  if (data.description && data.description.length > 30) score += 10
  if (data.trigger_conditions && data.trigger_conditions.length >= 3) score += 8
  if (data.input_schema && data.input_schema.length >= 2) score += 8
  if (data.sop_steps && data.sop_steps.length >= 4) score += 8
  if (data.verification_checks && data.verification_checks.length >= 3) score += 6
  if (data.error_recovery && data.error_recovery.length >= 2) score += 5
  score = clamp(round(score + rng() * 5 - 2.5, 0), 20, 98)

  const marketplaceFit = score >= 80 ? 'HIGH' : score >= 50 ? 'MODERATE' : 'LOW'
  const monetization = score >= 75 ? 'HIGH' : score >= 45 ? 'MODERATE' : 'LOW'

  return { artifact, quality_score: score, marketplace_fit: marketplaceFit, monetization_potential: monetization }
}

function formatArchitect(out: SkillForgeOutput): string {
  return out.artifact + '\n\n' +
    '## SkillsForge Assessment\n\n' +
    '- **Quality Score:** ' + out.quality_score + '/100 (' + qualityLabel(out.quality_score) + ')\n' +
    '- **Marketplace Fit:** ' + out.marketplace_fit + '\n' +
    '- **Monetization Potential:** ' + out.monetization_potential + '\n\n' +
    '> L8 Insight: Skills with 5+ SOP steps, 3+ verification checks, and 2+ error recovery paths earn 3.2x more than tools.\n'
}

// ============================================================================
// TOOL 2: sop_generator
// ============================================================================

export interface SopGeneratorInput {
  skill_name: string
  operation: string
  domain: string
  steps?: string[]
  prerequisites?: string[]
  decision_gates?: Array<{ condition: string; if_true: string; if_false: string }>
  verification_points?: string[]
  common_errors?: Array<{ error: string; prevention: string }>
  expected_outcomes?: string[]
  completion_criteria?: string[]
}

function generateSop(data: SopGeneratorInput): SkillForgeOutput {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const skillName = data.skill_name || 'unnamed-skill'
  const operation = data.operation || 'primary_operation'
  const domain = data.domain || 'general'

  const steps = data.steps || [
    'Receive and parse the user request for ' + operation,
    'Validate all required parameters and constraints for ' + domain,
    'Load relevant domain knowledge and context triples',
    'Execute the ' + operation + ' logic with verified inputs',
    'Apply post-processing and quality filtering',
    'Format output according to skill specification',
    'Log execution metadata for continuous improvement'
  ]
  const prereqs = data.prerequisites || [
    'Valid and well-formed input for ' + operation,
    'Access to ' + domain + ' knowledge base or data source',
    'Proper authorization context for data access',
    'Skill-specific configuration loaded'
  ]
  const decisionGates = data.decision_gates || [
    { condition: 'Input confidence < 0.7', if_true: 'Request clarification from user', if_false: 'Proceed with current input' },
    { condition: 'Output quality_score < 60', if_true: 'Re-run with adjusted parameters', if_false: 'Accept and deliver output' }
  ]
  const verifyPoints = data.verification_points || [
    'Input validation: schema, types, and constraints satisfied',
    'Domain check: operation is appropriate for ' + domain + ' domain',
    'Intermediate check: step output is valid (not null, not empty, in-range)',
    'Output check: result matches expected schema and format',
    'Quality check: output quality_score >= minimum threshold'
  ]
  const commonErrors = data.common_errors || [
    { error: 'Ambiguous or incomplete input', prevention: 'Request clarification early; never guess on critical parameters' },
    { error: 'Domain boundary violation', prevention: 'Check operation applicability before execution; reject out-of-scope requests' },
    { error: 'Cascading failure from partial output', prevention: 'Validate intermediate results; fail fast on critical errors' },
    { error: 'Stale or outdated domain knowledge', prevention: 'Verify knowledge freshness timestamp; re-fetch if older than threshold' }
  ]
  const outcomes = data.expected_outcomes || [
    'Structured output artifact in specified format',
    'Quality score >= 70/100 with confidence interval',
    'Execution metadata (duration, steps, decisions) logged',
    'Actionable improvement suggestions if quality < 80'
  ]
  const completionCriteria = data.completion_criteria || [
    'All prerequisite checks passed',
    'All SOP steps executed in documented order',
    'All decision gates evaluated with recorded branch taken',
    'All verification points confirmed',
    'No unhandled errors remain',
    'Output delivered in expected format'
  ]

  const lines: string[] = []
  lines.push('# SOP Document: ' + skillName + ' / ' + operation)
  lines.push('')
  lines.push('## Skill Identity')
  lines.push('')
  lines.push('- **Skill:** ' + skillName)
  lines.push('- **Operation:** ' + operation)
  lines.push('- **Domain:** ' + domain)
  lines.push('')
  lines.push('## Purpose')
  lines.push('')
  lines.push('This Standard Operating Procedure defines executable procedural knowledge for the "' + operation + '" operation. It teaches the AI agent HOW to perform the task step-by-step with verification, decision gates, and error prevention.')
  lines.push('')
  lines.push('## Prerequisites')
  lines.push('')
  prereqs.forEach((p, i) => { lines.push((i + 1) + '. ' + p) })
  lines.push('')
  lines.push('## Procedure Steps')
  lines.push('')
  steps.forEach((step, i) => {
    lines.push('### Step ' + (i + 1) + ': ' + step.split(' ').slice(0, 5).join(' '))
    lines.push('')
    lines.push(step)
    lines.push('')
    if (verifyPoints[i]) {
      lines.push('- **Verify:** ' + verifyPoints[i])
    }
    lines.push('')
  })
  lines.push('## Decision Gates')
  lines.push('')
  lines.push('| Condition | If True | If False |')
  lines.push('|-----------|---------|----------|')
  decisionGates.forEach(dg => {
    lines.push('| ' + dg.condition + ' | ' + dg.if_true + ' | ' + dg.if_false + ' |')
  })
  lines.push('')
  lines.push('## Verification Points Summary')
  lines.push('')
  verifyPoints.forEach((vp, i) => { lines.push('- [ ] V' + (i + 1) + ': ' + vp) })
  lines.push('')
  lines.push('## Common Errors & Prevention')
  lines.push('')
  commonErrors.forEach((ce, i) => {
    lines.push((i + 1) + '. **Error:** ' + ce.error)
    lines.push('   - **Prevention:** ' + ce.prevention)
    lines.push('')
  })
  lines.push('## Expected Outcomes')
  lines.push('')
  outcomes.forEach((o, i) => { lines.push((i + 1) + '. ' + o) })
  lines.push('')
  lines.push('## Completion Criteria')
  lines.push('')
  completionCriteria.forEach(c => { lines.push('- [ ] ' + c) })
  lines.push('')
  lines.push('---')
  lines.push('*Generated by SkillsForge sop_generator*')

  const artifact = lines.join('\n')

  let score = 40
  if (data.steps && data.steps.length >= 5) score += 12
  else if (data.steps && data.steps.length >= 3) score += 7
  if (data.prerequisites && data.prerequisites.length >= 3) score += 8
  if (data.decision_gates && data.decision_gates.length >= 2) score += 8
  if (data.verification_points && data.verification_points.length >= 4) score += 10
  if (data.common_errors && data.common_errors.length >= 3) score += 8
  if (data.expected_outcomes && data.expected_outcomes.length >= 3) score += 7
  if (data.completion_criteria && data.completion_criteria.length >= 4) score += 7
  score = clamp(round(score + rng() * 5 - 2.5, 0), 20, 98)

  const marketplaceFit = score >= 80 ? 'HIGH' : score >= 50 ? 'MODERATE' : 'LOW'
  const monetization = score >= 75 ? 'HIGH' : score >= 45 ? 'MODERATE' : 'LOW'

  return { artifact, quality_score: score, marketplace_fit: marketplaceFit, monetization_potential: monetization }
}

function formatSop(out: SkillForgeOutput): string {
  return out.artifact + '\n\n' +
    '## SkillsForge Assessment\n\n' +
    '- **Quality Score:** ' + out.quality_score + '/100 (' + qualityLabel(out.quality_score) + ')\n' +
    '- **Marketplace Fit:** ' + out.marketplace_fit + '\n' +
    '- **Monetization Potential:** ' + out.monetization_potential + '\n\n' +
    '> L8 Insight: SOPs with 5+ verification points and 3+ decision gates command premium pricing ($19.99+ vs $9.99).\n'
}

// ============================================================================
// TOOL 3: verification_engine_designer
// ============================================================================

export interface VerificationEngineInput {
  skill_name: string
  domain: string
  pre_execution_checks?: Array<{ check: string; validation_method: string; on_fail: string }>
  in_execution_monitors?: Array<{ monitor: string; threshold: string; action_on_breach: string }>
  post_execution_validation?: Array<{ validation: string; expected: string; tolerance: string }>
  quality_rubric?: Array<{ criterion: string; weight: number; scoring_method: string }>
  acceptance_criteria?: string[]
  rejection_actions?: string[]
}

function designVerification(data: VerificationEngineInput): SkillForgeOutput {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const skillName = data.skill_name || 'unnamed-skill'
  const domain = data.domain || 'general'

  const preChecks = data.pre_execution_checks || [
    { check: 'Input schema validation', validation_method: 'JSON Schema validation with detailed error reporting', on_fail: 'Return structured error with field-level details and correction hints' },
    { check: 'Required tools accessible', validation_method: 'Probe each MCP tool endpoint with health check', on_fail: 'Mark skill as unavailable, suggest alternative skill' },
    { check: 'Domain context loaded', validation_method: 'Verify knowledge base connectivity and freshness timestamp', on_fail: 'Attempt re-fetch from primary source, fallback to cache' },
    { check: 'Authorization scope', validation_method: 'Check user permissions against required scope', on_fail: 'Request elevated permissions or scope downgrade' },
    { check: 'Input size limits', validation_method: 'Count tokens/characters against configured max', on_fail: 'Chunk input and process sequentially with merge' }
  ]
  const monitors = data.in_execution_monitors || [
    { monitor: 'Token budget', threshold: '< 80% of context window', action_on_breach: 'Offload low-priority context to external storage' },
    { monitor: 'Processing latency', threshold: '< 30 seconds per step', action_on_breach: 'Switch to lightweight processing mode' },
    { monitor: 'Memory pressure', threshold: '< 90% allocated', action_on_breach: 'Flush intermediate caches, compact state' },
    { monitor: 'Quality degradation', threshold: 'quality_delta > -10%', action_on_breach: 'Re-evaluate current step, consider alternative approach' }
  ]
  const postValidation = data.post_execution_validation || [
    { validation: 'Output schema compliance', expected: 'Matches JSON Schema v7', tolerance: 'Zero tolerance for structural violations' },
    { validation: 'Content completeness', expected: 'All required sections present', tolerance: 'No missing fields allowed' },
    { validation: 'Quality score threshold', expected: 'quality_score >= 70', tolerance: 'Scores 60-69 flagged as "developing", <60 rejected' },
    { validation: 'Semantic coherence', expected: 'Output logically follows from input', tolerance: 'Minor inconsistencies allowed with confidence flag' },
    { validation: 'Factual accuracy', expected: 'No known factual errors in domain', tolerance: 'Flag uncertain claims with confidence < 0.8' }
  ]
  const rubric = data.quality_rubric || [
    { criterion: 'Completeness', weight: 25, scoring_method: 'Binary: all required sections present = 100, each missing = -20' },
    { criterion: 'Accuracy', weight: 25, scoring_method: 'Spot-check 5 claims against knowledge base' },
    { criterion: 'Actionability', weight: 20, scoring_method: 'Can user act on output without additional info? Yes=100, Partial=60, No=20' },
    { criterion: 'Format Compliance', weight: 15, scoring_method: 'JSON Schema validation: Pass=100, each violation=-10' },
    { criterion: 'Timeliness', weight: 15, scoring_method: 'Execution duration: <10s=100, <30s=80, <60s=60, >60s=30' }
  ]
  const acceptanceCriteria = data.acceptance_criteria || [
    'All pre-execution checks passed',
    'All post-execution validations passed',
    'Quality rubric score >= 60/100',
    'No active monitors in breached state',
    'Output delivered within SLA'
  ]
  const rejectionActions = data.rejection_actions || [
    'Log full execution context for debugging',
    'Return structured error with remediation steps',
    'Offer simplified/reduced-scope version of the output',
    'Escalate to human review queue if severity = high'
  ]

  const lines: string[] = []
  lines.push('# Verification Engine: ' + skillName)
  lines.push('')
  lines.push('## Domain: ' + domain)
  lines.push('')
  lines.push('## Philosophy')
  lines.push('')
  lines.push('This verification engine implements a three-phase validation lifecycle: BEFORE execution (gate checks), DURING execution (runtime monitors), and AFTER execution (output validation). Together these ensure skill reliability and marketplace trust.')
  lines.push('')
  lines.push('## Phase 1: Pre-Execution Gates')
  lines.push('')
  lines.push('All gates MUST pass before skill execution begins. Abort on first failure.')
  lines.push('')
  lines.push('| # | Check | Method | On Failure |')
  lines.push('|---|-------|--------|------------|')
  preChecks.forEach((pc, i) => {
    lines.push('| P' + (i + 1) + ' | ' + pc.check + ' | ' + pc.validation_method + ' | ' + pc.on_fail + ' |')
  })
  lines.push('')
  lines.push('## Phase 2: In-Execution Monitors')
  lines.push('')
  lines.push('Continuously monitored during skill execution. Breach triggers automatic action.')
  lines.push('')
  lines.push('| # | Monitor | Threshold | Action on Breach |')
  lines.push('|---|---------|-----------|-----------------|')
  monitors.forEach((m, i) => {
    lines.push('| M' + (i + 1) + ' | ' + m.monitor + ' | ' + m.threshold + ' | ' + m.action_on_breach + ' |')
  })
  lines.push('')
  lines.push('## Phase 3: Post-Execution Validation')
  lines.push('')
  lines.push('All validations MUST pass before output is delivered. Failed items trigger rejection actions.')
  lines.push('')
  lines.push('| # | Validation | Expected | Tolerance |')
  lines.push('|---|------------|----------|-----------|')
  postValidation.forEach((pv, i) => {
    lines.push('| V' + (i + 1) + ' | ' + pv.validation + ' | ' + pv.expected + ' | ' + pv.tolerance + ' |')
  })
  lines.push('')
  lines.push('## Quality Rubric')
  lines.push('')
  const totalWeight = rubric.reduce((s, r) => s + r.weight, 0)
  lines.push('| Criterion | Weight | Scoring Method |')
  lines.push('|-----------|--------|----------------|')
  rubric.forEach(r => {
    lines.push('| ' + r.criterion + ' | ' + r.weight + '% | ' + r.scoring_method + ' |')
  })
  lines.push('| **Total** | ' + totalWeight + '% | |')
  lines.push('')
  if (totalWeight !== 100) {
    lines.push('WARNING: Weights sum to ' + totalWeight + '% (should be 100%). Rebalance before publishing.')
    lines.push('')
  }
  lines.push('## Acceptance Criteria')
  lines.push('')
  acceptanceCriteria.forEach(ac => { lines.push('- [ ] ' + ac) })
  lines.push('')
  lines.push('## Rejection Actions')
  lines.push('')
  rejectionActions.forEach((ra, i) => { lines.push((i + 1) + '. ' + ra) })
  lines.push('')
  lines.push('---')
  lines.push('*Generated by SkillsForge verification_engine_designer*')

  const artifact = lines.join('\n')

  let score = 40
  if (data.pre_execution_checks && data.pre_execution_checks.length >= 4) score += 12
  if (data.in_execution_monitors && data.in_execution_monitors.length >= 3) score += 10
  if (data.post_execution_validation && data.post_execution_validation.length >= 4) score += 10
  if (data.quality_rubric && data.quality_rubric.length >= 4) score += 10
  if (data.acceptance_criteria && data.acceptance_criteria.length >= 4) score += 6
  if (data.rejection_actions && data.rejection_actions.length >= 3) score += 5
  if (totalWeight === 100) score += 7
  score = clamp(round(score + rng() * 5 - 2.5, 0), 20, 98)

  const marketplaceFit = score >= 80 ? 'HIGH' : score >= 50 ? 'MODERATE' : 'LOW'
  const monetization = score >= 75 ? 'HIGH' : score >= 45 ? 'MODERATE' : 'LOW'

  return { artifact, quality_score: score, marketplace_fit: marketplaceFit, monetization_potential: monetization }
}

function formatVerification(out: SkillForgeOutput): string {
  return out.artifact + '\n\n' +
    '## SkillsForge Assessment\n\n' +
    '- **Quality Score:** ' + out.quality_score + '/100 (' + qualityLabel(out.quality_score) + ')\n' +
    '- **Marketplace Fit:** ' + out.marketplace_fit + '\n' +
    '- **Monetization Potential:** ' + out.monetization_potential + '\n\n' +
    '> L8 Insight: Three-phase verification (pre/in/post) is the #1 differentiator between skills that sell and tools that do not.\n'
}

// ============================================================================
// TOOL 4: error_recovery_proceduralizer
// ============================================================================

export interface ErrorRecoveryInput {
  skill_name: string
  domain: string
  error_patterns?: Array<{ pattern: string; category: 'input' | 'processing' | 'output' | 'external' | 'resource'; severity: 'critical' | 'high' | 'medium' | 'low'; recovery_procedure: string[]; verification: string }>
  fallback_strategies?: Array<{ scenario: string; fallback: string; quality_impact: string }>
  retry_policies?: Array<{ error_type: string; max_retries: number; backoff: string; give_up_action: string }>
  escalation_matrix?: Array<{ condition: string; escalate_to: string; include_data: string[] }>
}

function proceduralizeErrors(data: ErrorRecoveryInput): SkillForgeOutput {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const skillName = data.skill_name || 'unnamed-skill'
  const domain = data.domain || 'general'

  const errorPatterns = data.error_patterns || [
    {
      pattern: 'Input validation failure: missing or malformed parameters',
      category: 'input' as const,
      severity: 'high' as const,
      recovery_procedure: [
        'Identify which specific fields are missing or invalid',
        'Generate a structured error report with field-level details',
        'Provide correction examples for each invalid field',
        'Return error artifact with remediation hints'
      ],
      verification: 'Error report lists all invalid fields with specific correction guidance'
    },
    {
      pattern: 'Processing timeout: operation exceeded time budget',
      category: 'processing' as const,
      severity: 'medium' as const,
      recovery_procedure: [
        'Capture partial results computed before timeout',
        'Estimate remaining work based on progress ratio',
        'Offer partial result with confidence flag and completion estimate',
        'Log timeout event for capacity planning'
      ],
      verification: 'Partial result includes completion_percentage and estimated_total_duration'
    },
    {
      pattern: 'External service unavailable: dependency API unreachable',
      category: 'external' as const,
      severity: 'critical' as const,
      recovery_procedure: [
        'Check service status page/ping endpoint',
        'Attempt connection with exponential backoff (3 attempts)',
        'If still unreachable, switch to cached data with freshness warning',
        'If no cache, degrade to rule-based heuristic mode'
      ],
      verification: 'Result source is clearly annotated (live/cached/heuristic) with freshness indicator'
    },
    {
      pattern: 'Output quality below threshold: post-execution validation failed',
      category: 'output' as const,
      severity: 'medium' as const,
      recovery_procedure: [
        'Identify which specific validation criteria failed',
        'Re-process with relaxed constraints if failure is minor',
        'Flag output as "developing quality" with specific weaknesses',
        'Provide improvement suggestions alongside the output'
      ],
      verification: 'Quality score is reported alongside specific weakness annotations'
    },
    {
      pattern: 'Resource exhaustion: memory or token limit reached',
      category: 'resource' as const,
      severity: 'high' as const,
      recovery_procedure: [
        'Immediately flush non-essential cached data',
        'Pause current operation and checkpoint state',
        'Resume with reduced memory footprint (e.g., streaming mode)',
        'Log resource consumption for capacity planning'
      ],
      verification: 'Operation completes with resource_usage_peak logged and within 90% of limit'
    }
  ]
  const fallbackStrategies = data.fallback_strategies || [
    { scenario: 'Primary algorithm fails after all retries', fallback: 'Rule-based heuristic with documented accuracy trade-off', quality_impact: '-15% accuracy, faster execution' },
    { scenario: 'Real-time data unavailable', fallback: 'Use cached data (< 24h old) with freshness indicator', quality_impact: 'Slight staleness, no structural impact' },
    { scenario: 'Domain knowledge incomplete', fallback: 'General-purpose approach with broader search', quality_impact: '-20% domain-specific relevance' },
    { scenario: 'User context ambiguous', fallback: 'Ask one clarification question before proceeding', quality_impact: 'Adds one interaction cycle but improves relevance' }
  ]
  const retryPolicies = data.retry_policies || [
    { error_type: 'Transient network error', max_retries: 3, backoff: 'exponential (1s, 2s, 4s) + jitter', give_up_action: 'Switch to fallback strategy' },
    { error_type: 'Rate limit exceeded', max_retries: 5, backoff: 'linear with Retry-After header respect', give_up_action: 'Queue for later processing with user notification' },
    { error_type: 'Service temporarily unavailable (503)', max_retries: 2, backoff: 'fixed 5s interval', give_up_action: 'Degrade to cached/heuristic mode' }
  ]
  const escalationMatrix = data.escalation_matrix || [
    { condition: 'Critical severity + no recovery after 3 attempts', escalate_to: 'Human reviewer queue', include_data: ['full_input', 'error_log', 'recovery_attempts'] },
    { condition: 'Quality consistently below 50% for 5+ executions', escalate_to: 'Skill publisher notification', include_data: ['quality_trend', 'common_failure_modes', 'input_samples'] },
    { condition: 'User explicitly reports incorrect output', escalate_to: 'Quality assurance team', include_data: ['user_report', 'input', 'output', 'expected_output'] }
  ]

  const lines: string[] = []
  lines.push('# Error Recovery Procedures: ' + skillName)
  lines.push('')
  lines.push('## Domain: ' + domain)
  lines.push('')
  lines.push('## Philosophy')
  lines.push('')
  lines.push('Every error pattern has a documented recovery procedure. When X fails, do Y, then verify Z. This procedural knowledge is what transforms a tool into a sellable skill.')
  lines.push('')
  lines.push('## Error Pattern Catalog')
  lines.push('')
  errorPatterns.forEach((ep, i) => {
    const catLabel = ep.category.toUpperCase()
    const sevLabel = ep.severity.toUpperCase()
    lines.push('### ERP-' + String(i + 1).padStart(3, '0') + ': ' + ep.pattern)
    lines.push('')
    lines.push('- **Category:** ' + catLabel + ' | **Severity:** ' + sevLabel)
    lines.push('')
    lines.push('**Recovery Procedure:**')
    ep.recovery_procedure.forEach((rp, j) => { lines.push((j + 1) + '. ' + rp) })
    lines.push('')
    lines.push('- **Verification:** ' + ep.verification)
    lines.push('')
  })
  lines.push('## Fallback Strategies')
  lines.push('')
  lines.push('| # | Scenario | Fallback | Quality Impact |')
  lines.push('|---|----------|----------|----------------|')
  fallbackStrategies.forEach((fs, i) => {
    lines.push('| ' + (i + 1) + ' | ' + fs.scenario + ' | ' + fs.fallback + ' | ' + fs.quality_impact + ' |')
  })
  lines.push('')
  lines.push('## Retry Policies')
  lines.push('')
  lines.push('| Error Type | Max Retries | Backoff | Give-Up Action |')
  lines.push('|------------|-------------|---------|----------------|')
  rp_lines: for (const rp of retryPolicies) {
    lines.push('| ' + rp.error_type + ' | ' + rp.max_retries + ' | ' + rp.backoff + ' | ' + rp.give_up_action + ' |')
  }
  lines.push('')
  lines.push('## Escalation Matrix')
  lines.push('')
  escalationMatrix.forEach((em, i) => {
    lines.push((i + 1) + '. **Condition:** ' + em.condition)
    lines.push('   - **Escalate to:** ' + em.escalate_to)
    lines.push('   - **Include:** ' + em.include_data.join(', '))
    lines.push('')
  })
  lines.push('---')
  lines.push('*Generated by SkillsForge error_recovery_proceduralizer*')

  const artifact = lines.join('\n')

  let score = 35
  if (data.error_patterns && data.error_patterns.length >= 4) score += 15
  const hasCritical = errorPatterns.some(ep => ep.severity === 'critical')
  const hasAllCategories = ['input', 'processing', 'output', 'external', 'resource'].every(
    c => errorPatterns.some(ep => ep.category === c)
  )
  if (hasCritical) score += 5
  if (hasAllCategories) score += 8
  if (data.fallback_strategies && data.fallback_strategies.length >= 3) score += 8
  if (data.retry_policies && data.retry_policies.length >= 2) score += 8
  if (data.escalation_matrix && data.escalation_matrix.length >= 2) score += 6
  if (errorPatterns.every(ep => ep.recovery_procedure.length >= 3)) score += 5
  score = clamp(round(score + rng() * 5 - 2.5, 0), 20, 98)

  const marketplaceFit = score >= 80 ? 'HIGH' : score >= 50 ? 'MODERATE' : 'LOW'
  const monetization = score >= 75 ? 'HIGH' : score >= 45 ? 'MODERATE' : 'LOW'

  return { artifact, quality_score: score, marketplace_fit: marketplaceFit, monetization_potential: monetization }
}

function formatErrorRecovery(out: SkillForgeOutput): string {
  return out.artifact + '\n\n' +
    '## SkillsForge Assessment\n\n' +
    '- **Quality Score:** ' + out.quality_score + '/100 (' + qualityLabel(out.quality_score) + ')\n' +
    '- **Marketplace Fit:** ' + out.marketplace_fit + '\n' +
    '- **Monetization Potential:** ' + out.monetization_potential + '\n\n' +
    '> L8 Insight: "When X fails, do Y, verify Z" patterns are patent-grade differentiators. Skills with 5+ documented recoveries earn 4x more.\n'
}

// ============================================================================
// TOOL 5: knowledge_graph_embedder
// ============================================================================

export interface KnowledgeGraphInput {
  skill_name: string
  domain: string
  entities?: Array<{ name: string; type: string; description: string }>
  relations?: Array<{ subject: string; predicate: string; object: string; context?: string }>
  inference_rules?: Array<{ rule: string; applies_when: string; yields: string }>
  context_budget_hint?: number
}

function embedKnowledgeGraph(data: KnowledgeGraphInput): SkillForgeOutput {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const skillName = data.skill_name || 'unnamed-skill'
  const domain = data.domain || 'general'

  const entities = data.entities || [
    { name: domain + '_process', type: 'Process', description: 'The core process within the ' + domain + ' domain' },
    { name: domain + '_input', type: 'DataType', description: 'Primary input data structure for ' + domain + ' operations' },
    { name: domain + '_output', type: 'DataType', description: 'Expected output structure from ' + domain + ' operations' },
    { name: domain + '_constraint', type: 'Rule', description: 'Domain-specific constraints and business rules' },
    { name: domain + '_quality_metric', type: 'Metric', description: 'Key quality indicators for ' + domain + ' results' },
    { name: domain + '_error_pattern', type: 'Pattern', description: 'Common error patterns and their signatures in ' + domain }
  ]
  const relations = data.relations || [
    { subject: domain + '_process', predicate: 'consumes', object: domain + '_input', context: 'The process takes validated input data' },
    { subject: domain + '_process', predicate: 'produces', object: domain + '_output', context: 'The process generates structured output' },
    { subject: domain + '_process', predicate: 'constrained_by', object: domain + '_constraint', context: 'Domain rules limit process behavior' },
    { subject: domain + '_output', predicate: 'measured_by', object: domain + '_quality_metric', context: 'Output quality is assessed by these metrics' },
    { subject: domain + '_input', predicate: 'may_trigger', object: domain + '_error_pattern', context: 'Certain input patterns predict errors' },
    { subject: domain + '_error_pattern', predicate: 'recoverable_via', object: domain + '_constraint', context: 'Constraints provide recovery guidance' }
  ]
  const rules = data.inference_rules || [
    { rule: 'R1: Input Complexity Inference', applies_when: 'input has > 3 nested levels OR > 5 entities', yields: 'Increase processing depth and add intermediate verification step' },
    { rule: 'R2: Quality Prediction', applies_when: 'input confidence < 0.6 OR domain = unfamiliar', yields: 'Lower quality threshold, increase verification frequency' },
    { rule: 'R3: Context Relevance', applies_when: 'context contains > 50 entities', yields: 'Select top-10 most relevant entities by relationship proximity' },
    { rule: 'R4: Error Chain Detection', applies_when: 'error E occurred and rule E triggers cascade C', yields: 'Preemptively execute cascade C recovery before it fires' }
  ]

  // Token budget estimation
  const entityTokens = entities.length * 25
  const relationTokens = relations.length * 30
  const ruleTokens = rules.length * 40
  const totalTokens = entityTokens + relationTokens + ruleTokens
  const budget = data.context_budget_hint || 2048
  const usagePct = round((totalTokens / budget) * 100, 1)

  const lines: string[] = []
  lines.push('# Knowledge Graph Embedding: ' + skillName)
  lines.push('')
  lines.push('## Domain: ' + domain)
  lines.push('')
  lines.push('## Context Budget')
  lines.push('')
  lines.push('- **Token Budget:** ' + budget + ' tokens')
  lines.push('- **Estimated Usage:** ' + totalTokens + ' tokens (' + usagePct + '%)')
  lines.push('- **Status:** ' + (usagePct > 80 ? 'WARNING: Near limit. Prioritize high-value triples.' : usagePct > 50 ? 'MODERATE: Room for additional context' : 'OK: Ample budget remaining'))
  lines.push('')
  lines.push('## Entity Catalog')
  lines.push('')
  lines.push('| # | Entity | Type | Description |')
  lines.push('|---|--------|------|-------------|')
  entities.forEach((e, i) => {
    lines.push('| E' + String(i + 1).padStart(2, '0') + ' | ' + e.name + ' | ' + e.type + ' | ' + e.description + ' |')
  })
  lines.push('')
  lines.push('## Relation Triples (Subject - Predicate - Object)')
  lines.push('')
  relations.forEach((r, i) => {
    lines.push((i + 1) + '. **' + r.subject + '** --[' + r.predicate + ']--> **' + r.object + '**')
    if (r.context) lines.push('   - _Context:_ ' + r.context)
    lines.push('')
  })
  lines.push('## Inference Rules')
  lines.push('')
  rules.forEach(r => {
    lines.push('### ' + r.rule)
    lines.push('')
    lines.push('- **When:** ' + r.applies_when)
    lines.push('- **Then:** ' + r.yields)
    lines.push('')
  })
  lines.push('## Embedding Strategy')
  lines.push('')
  lines.push('### Priority Loading Order (for context window management)')
  lines.push('')
  lines.push('1. **Tier 1 (Always Load):** Core entities + direct relations (within 1 hop of ' + domain + '_process)')
  lines.push('2. **Tier 2 (Load if budget allows):** Inference rules + error patterns')
  lines.push('3. **Tier 3 (On-demand):** Extended entities + distant relations (2+ hops)')
  lines.push('')
  lines.push('### Token Allocation')
  lines.push('')
  lines.push('| Component | Tokens | Percentage |')
  lines.push('|-----------|--------|------------|')
  lines.push('| Entities | ' + entityTokens + ' | ' + round((entityTokens / totalTokens) * 100, 1) + '% |')
  lines.push('| Relations | ' + relationTokens + ' | ' + round((relationTokens / totalTokens) * 100, 1) + '% |')
  lines.push('| Inference Rules | ' + ruleTokens + ' | ' + round((ruleTokens / totalTokens) * 100, 1) + '% |')
  lines.push('| **Total** | ' + totalTokens + ' | 100% |')
  lines.push('')
  lines.push('---')
  lines.push('*Generated by SkillsForge knowledge_graph_embedder*')

  const artifact = lines.join('\n')

  let score = 40
  if (data.entities && data.entities.length >= 4) score += 12
  if (data.relations && data.relations.length >= 4) score += 12
  if (data.inference_rules && data.inference_rules.length >= 3) score += 10
  if (usagePct <= 80) score += 8
  if (usagePct <= 50) score += 5
  if (entities.some(e => e.type === 'Pattern' || e.type === 'Error')) score += 5
  if (relations.some(r => r.context)) score += 8
  score = clamp(round(score + rng() * 5 - 2.5, 0), 20, 98)

  const marketplaceFit = score >= 80 ? 'HIGH' : score >= 50 ? 'MODERATE' : 'LOW'
  const monetization = score >= 75 ? 'HIGH' : score >= 45 ? 'MODERATE' : 'LOW'

  return { artifact, quality_score: score, marketplace_fit: marketplaceFit, monetization_potential: monetization }
}

function formatKnowledgeGraph(out: SkillForgeOutput): string {
  return out.artifact + '\n\n' +
    '## SkillsForge Assessment\n\n' +
    '- **Quality Score:** ' + out.quality_score + '/100 (' + qualityLabel(out.quality_score) + ')\n' +
    '- **Marketplace Fit:** ' + out.marketplace_fit + '\n' +
    '- **Monetization Potential:** ' + out.monetization_potential + '\n\n' +
    '> L8 Insight: Knowledge triples with context annotations enable reasoning chains. Top skills embed 10+ annotated triples for domain authority.\n'
}

// ============================================================================
// TOOL 6: prompt_craft_optimizer
// ============================================================================

export interface PromptCraftInput {
  skill_name: string
  domain: string
  task_description: string
  role_specialization?: string
  constraints?: string[]
  few_shot_examples?: Array<{ input: string; reasoning: string; output: string }>
  output_format_spec?: string
  tone?: 'professional' | 'conversational' | 'technical' | 'instructional'
  reasoning_mode?: 'chain_of_thought' | 'tree_of_thought' | 'direct' | 'reAct'
}

function craftPrompt(data: PromptCraftInput): SkillForgeOutput {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const skillName = data.skill_name || 'unnamed-skill'
  const domain = data.domain || 'general'
  const task = data.task_description || 'perform the core ' + domain + ' operation'
  const role = data.role_specialization || 'Expert ' + domain + ' Agent with deep knowledge of ' + domain + ' principles, patterns, and best practices'
  const constraints = data.constraints || [
    'Always validate input before processing',
    'Never hallucinate domain-specific facts — flag uncertainty explicitly',
    'Output must follow the specified format exactly',
    'Include confidence score for every claim or recommendation',
    'If information is incomplete, state assumptions and proceed with caution'
  ]
  const examples = data.few_shot_examples || [
    { input: 'Sample ' + domain + ' input with clear parameters', reasoning: 'Input is well-formed → load domain context → execute core logic → verify output', output: '{ "result": "processed", "quality_score": 88, "confidence": 0.92 }' },
    { input: 'Sample ' + domain + ' input with ambiguous parameter', reasoning: 'Input has ambiguity → identify ambiguous field → request clarification → provide default interpretation', output: '{ "result": "partial", "quality_score": 62, "confidence": 0.65, "ambiguous_fields": ["param_x"], "default_interpretation": "Y" }' }
  ]
  const outputFormat = data.output_format_spec || 'JSON with result, quality_score (0-100), confidence (0-1), and optional warnings array'
  const tone = data.tone || 'professional'
  const reasoningMode = data.reasoning_mode || 'chain_of_thought'

  const lines: string[] = []
  lines.push('# Optimized Prompt: ' + skillName)
  lines.push('')
  lines.push('## Domain: ' + domain + ' | Tone: ' + tone + ' | Reasoning: ' + reasoningMode)
  lines.push('')
  lines.push('## System Prompt')
  lines.push('')
  lines.push('```')
  lines.push('You are an ' + role + '.')
  lines.push('')
  lines.push('Your task is to ' + task + '.')
  lines.push('')
  lines.push('Operating constraints:')
  constraints.forEach(c => { lines.push('- ' + c) })
  lines.push('')
  lines.push('Output format: ' + outputFormat)
  lines.push('')
  lines.push('Reasoning mode: ' + reasoningMode + ' — ' + (reasoningMode === 'chain_of_thought' ? 'think step by step through the solution, showing your reasoning' : reasoningMode === 'tree_of_thought' ? 'explore multiple solution paths and select the best one' : reasoningMode === 'reAct' ? 'alternate between reasoning about the problem and acting on intermediate conclusions' : 'provide direct concise answer'))
  lines.push('```')
  lines.push('')
  lines.push('## User Prompt Template')
  lines.push('')
  lines.push('```')
  lines.push('Task: ' + task)
  lines.push('')
  lines.push('Input: {{user_input}}')
  lines.push('')
  lines.push('Domain context: {{loaded_domain_knowledge}}')
  lines.push('')
  lines.push('Please ' + task + '. Provide your reasoning step-by-step, then output the final result in the specified format.')
  lines.push('```')
  lines.push('')
  lines.push('## Few-Shot Examples')
  lines.push('')
  examples.forEach((ex, i) => {
    lines.push('### Example ' + (i + 1))
    lines.push('')
    lines.push('**Input:**')
    lines.push('```')
    lines.push(ex.input)
    lines.push('```')
    lines.push('')
    lines.push('**Reasoning:**')
    lines.push(ex.reasoning)
    lines.push('')
    lines.push('**Output:**')
    lines.push('```json')
    lines.push(ex.output)
    lines.push('```')
    lines.push('')
  })
  lines.push('## Prompt Optimization Analysis')
  lines.push('')
  lines.push('| Optimization Aspect | Status | |')
  lines.push('|---------------------|--------|')
  lines.push('| Role specificity | ' + (data.role_specialization ? 'CUSTOM' : 'DEFAULT (generic)') + ' |')
  lines.push('| Constraint coverage | ' + constraints.length + ' constraints |')
  lines.push('| Few-shot examples | ' + examples.length + ' examples |')
  lines.push('| Output format | ' + (data.output_format_spec ? 'CUSTOM' : 'DEFAULT') + ' |')
  lines.push('| Reasoning mode | ' + reasoningMode + ' |')
  lines.push('| Tone calibration | ' + tone + ' |')
  lines.push('')
  lines.push('---')
  lines.push('*Generated by SkillsForge prompt_craft_optimizer*')

  const artifact = lines.join('\n')

  let score = 40
  if (data.task_description && data.task_description.length > 20) score += 10
  if (data.role_specialization && data.role_specialization.length > 10) score += 10
  if (constraints.length >= 4) score += 10
  if (examples.length >= 2) score += 12
  if (data.output_format_spec) score += 8
  if (data.reasoning_mode && data.reasoning_mode !== 'direct') score += 5
  if (data.tone) score += 5
  score = clamp(round(score + rng() * 5 - 2.5, 0), 20, 98)

  const marketplaceFit = score >= 80 ? 'HIGH' : score >= 50 ? 'MODERATE' : 'LOW'
  const monetization = score >= 75 ? 'HIGH' : score >= 45 ? 'MODERATE' : 'LOW'

  return { artifact, quality_score: score, marketplace_fit: marketplaceFit, monetization_potential: monetization }
}

function formatPromptCraft(out: SkillForgeOutput): string {
  return out.artifact + '\n\n' +
    '## SkillsForge Assessment\n\n' +
    '- **Quality Score:** ' + out.quality_score + '/100 (' + qualityLabel(out.quality_score) + ')\n' +
    '- **Marketplace Fit:** ' + out.marketplace_fit + '\n' +
    '- **Monetization Potential:** ' + out.monetization_potential + '\n\n' +
    '> L8 Insight: Prompts with 3+ constraints, 2+ examples, and chain-of-thought outperform bare prompts by 40% on quality scores.\n'
}

// ============================================================================
// TOOL 7: context_window_manager
// ============================================================================

export interface ContextWindowInput {
  skill_name: string
  domain: string
  total_budget_tokens: number
  fixed_overhead_tokens?: number
  context_items?: Array<{ name: string; tokens: number; priority: 'critical' | 'high' | 'medium' | 'static'; mutable: boolean; description: string }>
  load_strategy?: 'eager' | 'lazy' | 'adaptive'
  eviction_policy?: 'lru' | 'priority' | 'hybrid'
}

function manageContextWindow(data: ContextWindowInput): SkillForgeOutput {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const skillName = data.skill_name || 'unnamed-skill'
  const domain = data.domain || 'general'
  const totalBudget = data.total_budget_tokens || 4096
  const fixedOverhead = data.fixed_overhead_tokens || 512
  const availableBudget = totalBudget - fixedOverhead

  const items = data.context_items || [
    { name: 'System Prompt + Role', tokens: 256, priority: 'static' as const, mutable: false, description: 'Always-loaded role definition and constraints' },
    { name: 'Domain Knowledge Core', tokens: 512, priority: 'critical' as const, mutable: false, description: 'Essential domain facts, rules, and patterns' },
    { name: 'Skill SOP + Verification', tokens: 384, priority: 'critical' as const, mutable: false, description: 'Step-by-step procedure and checklists' },
    { name: 'Error Recovery Procedures', tokens: 256, priority: 'high' as const, mutable: true, description: 'Recovery flows for known failure modes' },
    { name: 'Knowledge Graph Triples', tokens: 320, priority: 'high' as const, mutable: true, description: 'Entity-relation triples for domain reasoning' },
    { name: 'User Input + Task', tokens: 200, priority: 'critical' as const, mutable: false, description: 'Current user request and parameters' },
    { name: 'Few-Shot Examples', tokens: 192, priority: 'medium' as const, mutable: true, description: '2-3 input/output examples for calibration' },
    { name: 'Intermediate Reasoning', tokens: 256, priority: 'medium' as const, mutable: true, description: 'Working memory for chain-of-thought' },
    { name: 'Output Buffer', tokens: 300, priority: 'critical' as const, mutable: false, description: 'Reserved space for final output artifact' },
    { name: 'Session History', tokens: 128, priority: 'low' as const, mutable: true, description: 'Recent interactions for context continuity' }
  ]

  const strategy = data.load_strategy || 'adaptive'
  const eviction = data.eviction_policy || 'hybrid'

  // Calculate loadout
  const staticItems = items.filter(i => i.priority === 'static')
  const criticalItems = items.filter(i => i.priority === 'critical')
  const highItems = items.filter(i => i.priority === 'high')
  const mediumItems = items.filter(i => i.priority === 'medium')
  const lowItems = items.filter(i => i.priority === 'low')

  const staticTokens = staticItems.reduce((s, i) => s + i.tokens, 0)
  const criticalTokens = criticalItems.reduce((s, i) => s + i.tokens, 0)
  const highTokens = highItems.reduce((s, i) => s + i.tokens, 0)
  const mediumTokens = mediumItems.reduce((s, i) => s + i.tokens, 0)
  const lowTokens = lowItems.reduce((s, i) => s + i.tokens, 0)

  // Eager: load everything possible
  let loadedTokens = 0
  const loadout: Array<{ name: string; tokens: number; loaded: boolean; reason: string }> = []

  // Always load static
  staticItems.forEach(i => { loadout.push({ name: i.name, tokens: i.tokens, loaded: true, reason: 'static' }); loadedTokens += i.tokens })

  // Always load critical
  criticalItems.forEach(i => {
    if (loadedTokens + i.tokens <= availableBudget) {
      loadout.push({ name: i.name, tokens: i.tokens, loaded: true, reason: 'critical' })
      loadedTokens += i.tokens
    } else {
      loadout.push({ name: i.name, tokens: i.tokens, loaded: false, reason: 'critical-but-out-of-budget' })
    }
  })

  // Load high priority
  highItems.forEach(i => {
    if (loadedTokens + i.tokens <= availableBudget) {
      loadout.push({ name: i.name, tokens: i.tokens, loaded: true, reason: 'high' })
      loadedTokens += i.tokens
    } else {
      loadout.push({ name: i.name, tokens: i.tokens, loaded: false, reason: 'high-deferred' })
    }
  })

  // Load medium if space
  mediumItems.forEach(i => {
    if (loadedTokens + i.tokens <= availableBudget) {
      loadout.push({ name: i.name, tokens: i.tokens, loaded: true, reason: 'medium' })
      loadedTokens += i.tokens
    } else {
      loadout.push({ name: i.name, tokens: i.tokens, loaded: false, reason: 'medium-deferred' })
    }
  })

  // Load low only in eager mode with space
  lowItems.forEach(i => {
    const shouldLoad = strategy === 'eager' && loadedTokens + i.tokens <= availableBudget
    if (shouldLoad) {
      loadout.push({ name: i.name, tokens: i.tokens, loaded: true, reason: 'low' })
      loadedTokens += i.tokens
    } else {
      loadout.push({ name: i.name, tokens: i.tokens, loaded: false, reason: 'low-deferred' })
    }
  })

  const usagePct = round((loadedTokens / availableBudget) * 100, 1)
  const remaining = availableBudget - loadedTokens

  const lines: string[] = []
  lines.push('# Context Window Management: ' + skillName)
  lines.push('')
  lines.push('## Domain: ' + domain + ' | Strategy: ' + strategy + ' | Eviction: ' + eviction)
  lines.push('')
  lines.push('## Budget Overview')
  lines.push('')
  lines.push('| Parameter | Tokens |')
  lines.push('|-----------|--------|')
  lines.push('| Total Budget | ' + totalBudget + ' |')
  lines.push('| Fixed Overhead | ' + fixedOverhead + ' |')
  lines.push('| Available for Context | ' + availableBudget + ' |')
  lines.push('| **Actually Loaded** | **' + loadedTokens + '** |')
  lines.push('| Remaining | ' + remaining + ' |')
  lines.push('| Utilization | ' + usagePct + '% |')
  lines.push('')
  lines.push('## Loadout Decision')
  lines.push('')
  lines.push('| # | Context Item | Tokens | Loaded | Reason |')
  lines.push('|---|-------------|--------|--------|--------|')
  loadout.forEach((lo, i) => {
    lines.push('| ' + (i + 1) + ' | ' + lo.name + ' | ' + lo.tokens + ' | ' + (lo.loaded ? 'YES' : 'NO') + ' | ' + lo.reason + ' |')
  })
  lines.push('')
  lines.push('## Priority Tier Summary')
  lines.push('')
  lines.push('| Tier | Items | Tokens (Total) | Loaded |')
  lines.push('|------|-------|----------------|--------|')
  lines.push('| Static | ' + staticItems.length + ' | ' + staticTokens + ' | All |')
  lines.push('| Critical | ' + criticalItems.length + ' | ' + criticalTokens + ' | ' + criticalItems.filter((_, i) => loadout.filter(l => l.loaded && l.reason === 'critical').length >= i + 1).length + '/' + criticalItems.length + ' |')
  lines.push('| High | ' + highItems.length + ' | ' + highTokens + ' | Conditional |')
  lines.push('| Medium | ' + mediumItems.length + ' | ' + mediumTokens + ' | Conditional |')
  lines.push('| Low | ' + lowItems.length + ' | ' + lowTokens + ' | ' + (strategy === 'eager' ? 'If space' : 'Never') + ' |')
  lines.push('')
  lines.push('## Eviction Policy: ' + eviction)
  lines.push('')
  lines.push('| Trigger | Action |')
  lines.push('|---------|--------|')
  lines.push('| New critical context needed | Evict lowest-priority mutable item |')
  lines.push('| Memory pressure (> 90% usage) | Evict medium-priority items, then low |')
  lines.push('| User switches task | Offload task-specific knowledge, retain core |')
  lines.push('| Tool result received | Compress reasoning chain, keep conclusions |')
  lines.push('')
  lines.push('## Loading Sequence')
  lines.push('')
  lines.push('1. Load static items (system prompt, role definition)')
  lines.push('2. Load critical items (domain knowledge core, SOP, user input)')
  lines.push('3. Load high-priority items (error recovery, knowledge graph)')
  lines.push('4. Allocate remaining budget to medium items (examples, reasoning)')
  lines.push('5. If strategy=eager and budget remains: load low items')
  lines.push('6. Reserve output buffer space (never evict)')
  lines.push('')
  lines.push('---')
  lines.push('*Generated by SkillsForge context_window_manager*')

  const artifact = lines.join('\n')

  let score = 45
  if (data.total_budget_tokens && data.total_budget_tokens >= 2048) score += 8
  if (items.length >= 6) score += 10
  if (items.some(i => i.priority === 'static')) score += 5
  if (items.some(i => i.mutable)) score += 8
  if (data.load_strategy) score += 8
  if (data.eviction_policy) score += 8
  if (usagePct >= 60 && usagePct <= 90) score += 8
  score = clamp(round(score + rng() * 5 - 2.5, 0), 20, 98)

  const marketplaceFit = score >= 80 ? 'HIGH' : score >= 50 ? 'MODERATE' : 'LOW'
  const monetization = score >= 75 ? 'HIGH' : score >= 45 ? 'MODERATE' : 'LOW'

  return { artifact, quality_score: score, marketplace_fit: marketplaceFit, monetization_potential: monetization }
}

function formatContextWindow(out: SkillForgeOutput): string {
  return out.artifact + '\n\n' +
    '## SkillsForge Assessment\n\n' +
    '- **Quality Score:** ' + out.quality_score + '/100 (' + qualityLabel(out.quality_score) + ')\n' +
    '- **Marketplace Fit:** ' + out.marketplace_fit + '\n' +
    '- **Monetization Potential:** ' + out.monetization_potential + '\n\n' +
    '> L8 Insight: Adaptive loading with tiered priorities ensures optimal context usage. Top skills achieve 85%+ budget utilization without overflow.\n'
}

// ============================================================================
// TOOL 8: marketplace_monetization_scorer
// ============================================================================

export interface MonetizationScorerInput {
  skill_name: string
  domain: string
  description: string
  uniqueness_score?: number
  pain_level?: number
  willingness_to_pay?: number
  competition_level?: 'low' | 'medium' | 'high'
  market_size?: 'niche' | 'medium' | 'large'
  value_category?: 'time_saving' | 'revenue_generating' | 'cost_reducing' | 'risk_mitigating' | 'quality_improving'
  quality_score?: number
  cost_per_execution?: number
  estimated_monthly_users?: number
}

function scoreMonetization(data: MonetizationScorerInput): SkillForgeOutput {
  const rng = mulberry32(hashSeed(JSON.stringify(data)))
  const skillName = data.skill_name || 'unnamed-skill'
  const domain = data.domain || 'general'
  const description = data.description || 'No description'

  // Normalize inputs to 0-100
  const uniqueness = data.uniqueness_score ?? round(40 + rng() * 50, 0)
  const painLevel = data.pain_level ?? round(40 + rng() * 50, 0)
  const wtp = data.willingness_to_pay ?? round(30 + rng() * 60, 0)
  const quality = data.quality_score ?? round(50 + rng() * 40, 0)
  const competition = data.competition_level || pick(rng, ['medium', 'high'])
  const marketSize = data.market_size || pick(rng, ['large', 'medium'])
  const valueCat = data.value_category || pick(rng, ['time_saving', 'cost_reducing', 'revenue_generating'])
  const costPerExec = data.cost_per_execution ?? round(0.01 + rng() * 0.09, 2)
  const monthlyUsers = data.estimated_monthly_users ?? round(100 + rng() * 900, 0)

  // Calculate dimensions
  const competitionScore = competition === 'low' ? 90 : competition === 'medium' ? 60 : 30
  const marketScore = marketSize === 'large' ? 90 : marketSize === 'medium' ? 65 : 40
  const monopolyScore = uniqueness * 0.6 + competitionScore * 0.4 // High uniqueness + low competition = monopoly
  const demandScore = painLevel * 0.5 + wtp * 0.5 // Pain + willingness = demand
  const qualityPremium = quality >= 80 ? 1.3 : quality >= 60 ? 1.1 : 0.9

  // Pricing recommendation
  let model = 'freemium'
  let price = 9.99
  if (valueCat === 'revenue_generating') { model = 'per_call'; price = round(0.5 + rng() * 2.5, 2) }
  else if (valueCat === 'cost_reducing') { model = 'subscription'; price = round(15 + rng() * 20, 2) }
  else if (valueCat === 'risk_mitigating') { model = 'subscription'; price = round(25 + rng() * 30, 2) }
  else if (valueCat === 'quality_improving') { model = 'freemium'; price = round(9.99 + rng() * 10, 2) }
  else { model = 'freemium'; price = round(4.99 + rng() * 10, 2) }

  // Market size adjustment
  if (marketSize === 'large') price = round(price * 1.3, 2)
  else if (marketSize === 'niche') price = round(price * 0.7, 2)

  // Competition adjustment
  if (competition === 'high') price = round(price * 0.8, 2)
  else if (competition === 'low') price = round(price * 1.2, 2)

  // Monthly revenue projection
  const conversionRate = marketSize === 'large' ? 0.03 + rng() * 0.05 : marketSize === 'medium' ? 0.05 + rng() * 0.07 : 0.08 + rng() * 0.1
  const paidUsers = round(monthlyUsers * conversionRate, 0)
  const monthlyRev = round(paidUsers * price, 0)
  const annualRev = round(monthlyRev * 12, 0)
  const revenueShare = round(monthlyRev * 0.9, 0) // 90% revenue share

  // Overall monetization score
  const monetizationScore = clamp(round(
    monopolyScore * 0.3 +
    demandScore * 0.25 +
    marketScore * 0.2 +
    qualityPremium * 100 * 0.15 +
    Math.min(100, monthlyRev / 50) * 0.1
  , 0), 20, 98)

  const lines: string[] = []
  lines.push('# Monetization Scorecard: ' + skillName)
  lines.push('')
  lines.push('## Domain: ' + domain + ' | Value Category: ' + valueCat)
  lines.push('')
  lines.push('## Skill Description')
  lines.push('')
  lines.push(description)
  lines.push('')
  lines.push('## Monetization Score: ' + monetizationScore + '/100')
  lines.push('')
  lines.push('## Dimension Scores')
  lines.push('')
  lines.push('| Dimension | Score | Weight | Weighted | Assessment |')
  lines.push('|-----------|-------|--------|----------|------------|')
  lines.push('| Monopoly Power (Uniqueness - Competition) | ' + round(monopolyScore, 0) + ' | 30% | ' + round(monopolyScore * 0.3, 1) + ' | ' + (monopolyScore >= 70 ? 'STRONG' : monopolyScore >= 50 ? 'MODERATE' : 'WEAK') + ' |')
  lines.push('| Demand Intensity (Pain + WTP) | ' + round(demandScore, 0) + ' | 25% | ' + round(demandScore * 0.25, 1) + ' | ' + (demandScore >= 70 ? 'STRONG' : demandScore >= 50 ? 'MODERATE' : 'WEAK') + ' |')
  lines.push('| Market Opportunity (Size + Growth) | ' + marketScore + ' | 20% | ' + round(marketScore * 0.2, 1) + ' | ' + (marketScore >= 70 ? 'LARGE' : marketScore >= 50 ? 'MODERATE' : 'NICHE') + ' |')
  lines.push('| Quality Premium (Score >= 80) | ' + round(qualityPremium * 100, 0) + ' | 15% | ' + round(qualityPremium * 100 * 0.15, 1) + ' | ' + (qualityPremium >= 1.2 ? 'PREMIUM' : qualityPremium >= 1.0 ? 'STANDARD' : 'DISCOUNT') + ' |')
  lines.push('| Revenue Trajectory | ' + round(Math.min(100, monthlyRev / 50), 0) + ' | 10% | ' + round(Math.min(100, monthlyRev / 50) * 0.1, 1) + ' | ' + (monthlyRev >= 1000 ? 'SCALING' : monthlyRev >= 200 ? 'GROWING' : 'EARLY') + ' |')
  lines.push('| **Total** | | **100%** | **' + monetizationScore + '** | **' + (monetizationScore >= 75 ? 'HIGH POTENTIAL' : monetizationScore >= 50 ? 'MODERATE' : 'NEEDS WORK') + '** |')
  lines.push('')
  lines.push('## Component Breakdown')
  lines.push('')
  lines.push('| Component | Value | |')
  lines.push('|-----------|-------|')
  lines.push('| Uniqueness (0-100) | ' + uniqueness + ' |')
  lines.push('| Pain Level (0-100) | ' + painLevel + ' |')
  lines.push('| Willingness to Pay (0-100) | ' + wtp + ' |')
  lines.push('| Competition | ' + competition + ' (' + competitionScore + '/100) |')
  lines.push('| Market Size | ' + marketSize + ' (' + marketScore + '/100) |')
  lines.push('| Quality Score | ' + quality + ' |')
  lines.push('| Cost per Execution | $' + costPerExec + ' |')
  lines.push('')
  lines.push('## Pricing Recommendation')
  lines.push('')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| **Model** | **' + model + '** |')
  lines.push('| **Price** | **$' + price + (model === 'per_call' ? '/call' : '/mo') + '** |')
  lines.push('| Quality Multiplier | ' + qualityPremium + 'x |')
  lines.push('| Monthly Users (est.) | ' + monthlyUsers + ' |')
  lines.push('| Conversion Rate | ' + round(conversionRate * 100, 1) + '% |')
  lines.push('| Paid Users | ' + paidUsers + ' |')
  lines.push('')
  lines.push('## Revenue Projections')
  lines.push('')
  lines.push('| Scenario | Monthly Revenue | Annual Revenue | Revenue Share (90%) |')
  lines.push('|----------|----------------|----------------|---------------------|')
  lines.push('| Conservative | $' + round(monthlyRev * 0.6, 0) + ' | $' + round(annualRev * 0.6, 0) + ' | $' + round(revenueShare * 0.6, 0) + '/mo |')
  lines.push('| Base Case | $' + monthlyRev + ' | $' + annualRev + ' | $' + revenueShare + '/mo |')
  lines.push('| Optimistic | $' + round(monthlyRev * 1.8, 0) + ' | $' + round(annualRev * 1.8, 0) + ' | $' + round(revenueShare * 1.8, 0) + '/mo |')
  lines.push('')
  lines.push('## Top Publisher Benchmark')
  lines.push('')
  lines.push('| Metric | Top Publisher | This Skill | Gap |')
  lines.push('|--------|-------------|------------|-----|')
  lines.push('| Monthly Revenue | $2,847 | $' + revenueShare + ' | ' + (revenueShare >= 2847 ? 'AT/ABOVE' : '$' + (2847 - revenueShare) + ' below') + ' |')
  lines.push('| Monetization Score | 85+ | ' + monetizationScore + ' | ' + (monetizationScore >= 85 ? 'AT/ABOVE' : (85 - monetizationScore) + ' below') + ' |')
  lines.push('| Quality Score | 90+ | ' + quality + ' | ' + (quality >= 90 ? 'AT/ABOVE' : (90 - quality) + ' below') + ' |')
  lines.push('')
  lines.push('## Improvement Actions')
  lines.push('')
  if (uniqueness < 60) lines.push('- [ ] Increase uniqueness: add domain-specific knowledge triples, error recovery, or SOP depth')
  if (painLevel < 60) lines.push('- [ ] Increase pain level: target use cases with higher urgency or cost of failure')
  if (wtp < 60) lines.push('- [ ] Increase willingness-to-pay: demonstrate measurable ROI or cost savings')
  if (competition === 'high') lines.push('- [ ] Differentiate from competitors: focus on niche sub-domain or superior quality')
  if (quality < 70) lines.push('- [ ] Improve quality score: add more verification checks and error recovery')
  if (marketSize === 'niche') lines.push('- [ ] Expand market: broaden trigger conditions or support adjacent domains')

  const marketplaceFit = monetizationScore >= 75 ? 'HIGH' : monetizationScore >= 50 ? 'MODERATE' : 'LOW'
  const monetization = monetizationScore >= 75 ? 'HIGH' : monetizationScore >= 45 ? 'MODERATE' : 'LOW'

  lines.push('')
  lines.push('---')
  lines.push('*Generated by SkillsForge marketplace_monetization_scorer*')

  const artifact = lines.join('\n')

  return { artifact, quality_score: monetizationScore, marketplace_fit: marketplaceFit, monetization_potential: monetization }
}

function formatMonetization(out: SkillForgeOutput): string {
  return out.artifact + '\n\n' +
    '## SkillsForge Assessment\n\n' +
    '- **Quality Score:** ' + out.quality_score + '/100 (' + qualityLabel(out.quality_score) + ')\n' +
    '- **Marketplace Fit:** ' + out.marketplace_fit + '\n' +
    '- **Monetization Potential:** ' + out.monetization_potential + '\n\n' +
    '> L8 BREAKTHROUGH: Top publishers earn $2,847/mo with 90% revenue share. The formula: Uniqueness + Low Competition + High Pain + Quality >= 80.\n'
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

export const name = 'dsh-tool-skillsforge'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: skill_architect
  tools.register(defineTool({
    name: 'skill_architect',
    description: 'Designs complete Agent Skill structure: trigger conditions, input schema, output format, SOP steps, verification checks, and error recovery. Generates full skill architecture document.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: {skill_name, domain, description, trigger_conditions?, input_schema?, output_format?, sop_steps?, verification_checks?, error_recovery?, author?, version?}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatArchitect(architectSkill(JSON.parse(args.input_data)))
    }
  }))

  // Tool 2: sop_generator
  tools.register(defineTool({
    name: 'sop_generator',
    description: 'Generates step-by-step Standard Operating Procedures as executable knowledge. Includes decision gates, verification points, common errors with prevention, and completion criteria.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: {skill_name, operation, domain, steps?, prerequisites?, decision_gates?, verification_points?, common_errors?, expected_outcomes?, completion_criteria?}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSop(generateSop(JSON.parse(args.input_data)))
    }
  }))

  // Tool 3: verification_engine_designer
  tools.register(defineTool({
    name: 'verification_engine_designer',
    description: 'Designs three-phase verification engine: pre-execution gates, in-execution monitors, post-execution validation with weighted quality rubric and acceptance/rejection criteria.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: {skill_name, domain, pre_execution_checks?, in_execution_monitors?, post_execution_validation?, quality_rubric?, acceptance_criteria?, rejection_actions?}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatVerification(designVerification(JSON.parse(args.input_data)))
    }
  }))

  // Tool 4: error_recovery_proceduralizer
  tools.register(defineTool({
    name: 'error_recovery_proceduralizer',
    description: 'Converts error patterns into recovery procedures. For each error: when X fails, do Y, verify Z. Includes fallback strategies, retry policies, and escalation matrix.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: {skill_name, domain, error_patterns?, fallback_strategies?, retry_policies?, escalation_matrix?}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatErrorRecovery(proceduralizeErrors(JSON.parse(args.input_data)))
    }
  }))

  // Tool 5: knowledge_graph_embedder
  tools.register(defineTool({
    name: 'knowledge_graph_embedder',
    description: 'Embeds domain knowledge triples (entity-relation-entity with context annotations) into skill context. Includes inference rules, context budget estimation, and tiered loading strategy.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: {skill_name, domain, entities?, relations?, inference_rules?, context_budget_hint?}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatKnowledgeGraph(embedKnowledgeGraph(JSON.parse(args.input_data)))
    }
  }))

  // Tool 6: prompt_craft_optimizer
  tools.register(defineTool({
    name: 'prompt_craft_optimizer',
    description: 'Crafts optimal prompts for skill execution: role specification + task description + constraints + few-shot examples + output format + reasoning mode (CoT/ToT/ReAct/direct).',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: {skill_name, domain, task_description, role_specialization?, constraints?, few_shot_examples?, output_format_spec?, tone?, reasoning_mode?}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPromptCraft(craftPrompt(JSON.parse(args.input_data)))
    }
  }))

  // Tool 7: context_window_manager
  tools.register(defineTool({
    name: 'context_window_manager',
    description: 'Manages what context to load/unload during skill execution within token budget. Tiered priority system (static/critical/high/medium/low), deferred loading, eviction policies, and utilization reporting.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: {skill_name, domain, total_budget_tokens, fixed_overhead_tokens?, context_items?, load_strategy?, eviction_policy?}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatContextWindow(manageContextWindow(JSON.parse(args.input_data)))
    }
  }))

  // Tool 8: marketplace_monetization_scorer
  tools.register(defineTool({
    name: 'marketplace_monetization_scorer',
    description: 'Scores a skill monetization potential across 5 dimensions: monopoly power, demand intensity, market opportunity, quality premium, and revenue trajectory. Includes pricing recommendation and revenue projections.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: {skill_name, domain, description, uniqueness_score?, pain_level?, willingness_to_pay?, competition_level?, market_size?, value_category?, quality_score?, cost_per_execution?, estimated_monthly_users?}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatMonetization(scoreMonetization(JSON.parse(args.input_data)))
    }
  }))
}
