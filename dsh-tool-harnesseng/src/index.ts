/**
 * DSH Harness Engineering Plugin v1.0.0
 *
 * The 2026 breakthrough discipline (popularized by Mitchell Hashimoto of HashiCorp
 * and OpenAI's Codex team) that treats AI agents like powerful but directionless horses
 * that need a "harness" (SOUL.md, MEMORY.md, AGENTS.md, constraints, context engineering,
 * garbage collection) to produce reliable work.
 *
 * Features (v1.0.0):
 * - SOUL.md Generator (define agent personality, tone, quirks, decision-making, boundaries)
 * - Memory Architect (design MEMORY.md structure with sections, retention, triggers)
 * - Context Engineering Validator (validate context window setup for signal vs noise)
 * - Harness Constraint Designer (create behavioral constraints and guardrails)
 * - Skill Loader Config (design skill/module loading configuration)
 * - Heartbeat Configurator (configure agent check-in intervals and health monitoring)
 * - Personality Profiler (analyze and score agent personality traits)
 * - Garbage Collection Planner (plan cleanup routines for memory and context drift)
 *
 * @module dsh-tool-harnesseng
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-harnesseng'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated harness configuration for informational purposes. Adapt all outputs to your specific agent platform, runtime constraints, and safety requirements.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createRng(input: unknown) {
  const seed = JSON.stringify(input).split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0)
  const generator = mulberry32(seed)
  return {
    next: (min: number, max: number) => Math.floor(generator() * (max - min + 1)) + min,
    nextFloat: (min: number, max: number) => generator() * (max - min) + min,
    pick: <T>(arr: T[]): T => arr[Math.floor(generator() * arr.length)],
    pickN: <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => generator() - 0.5)
      return shuffled.slice(0, n)
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function rateScore(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Strong'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'Weak'
  return 'Poor'
}

// ==================== TYPES ====================

// --- Tool 1: SOUL.md Generator ---
interface SoulMdInput {
  agent_name?: string
  primary_trait?: string
  communication_style?: string
  domain_expertise?: string
  quirks?: string[]
}

interface SoulMdResult {
  soul_md_content: string
  personality_scores: {
    clarity: number
    distinctiveness: number
    consistency: number
    safety_alignment: number
    adaptability: number
  }
  recommendations: string[]
  summary: string
}

// --- Tool 2: Memory Architect ---
interface MemoryArchitectInput {
  agent_type?: string
  memory_categories?: string[]
  retention_policy?: string
  recall_triggers?: string[]
}

interface MemorySection {
  name: string
  purpose: string
  format: string
  max_entries: number
  eviction_policy: string
}

interface MemoryArchitectResult {
  memory_md_structure: string
  sections: MemorySection[]
  total_max_entries: number
  recall_optimization_score: number
  recommendations: string[]
  summary: string
}

// --- Tool 3: Context Engineering Validator ---
interface ContextValidationInput {
  system_prompt?: string
  context_sources?: string[]
  expected_tasks?: string[]
  noise_threshold?: number
}

interface ContextSourceAssessment {
  source: string
  relevance: number
  token_estimate: number
  signal_to_noise: 'high' | 'medium' | 'low'
  recommendation: 'keep' | 'condense' | 'remove'
}

interface ContextValidationResult {
  context_health_score: number
  total_token_estimate: number
  signal_pct: number
  noise_pct: number
  source_assessments: ContextSourceAssessment[]
  optimization_tips: string[]
  summary: string
}

// --- Tool 4: Harness Constraint Designer ---
interface ConstraintDesignInput {
  agent_capabilities?: string[]
  risk_level?: 'low' | 'medium' | 'high' | 'critical'
  required_safeguards?: string[]
  fallback_strategy?: string
}

interface Constraint {
  type: 'allow' | 'deny' | 'guardrail' | 'fallback'
  rule: string
  rationale: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface ConstraintDesignResult {
  constraints: Constraint[]
  constraint_summary: string
  coverage_score: number
  risk_mitigation_pct: number
  recommendations: string[]
  summary: string
}

// --- Tool 5: Skill Loader Config ---
interface SkillLoaderInput {
  agent_role?: string
  available_skills?: string[]
  max_concurrent_skills?: number
  activation_mode?: 'reactive' | 'proactive' | 'hybrid'
}

interface SkillConfig {
  skill_name: string
  priority: number
  activation_condition: string
  resource_weight: number
  depends_on: string[]
}

interface SkillLoaderResult {
  skill_configs: SkillConfig[]
  loading_strategy: string
  total_resource_weight: number
  conflict_resolution: string
  recommendations: string[]
  summary: string
}

// --- Tool 6: Heartbeat Configurator ---
interface HeartbeatConfigInput {
  agent_platform?: string
  task_criticality?: 'low' | 'medium' | 'high' | 'critical'
  checkin_interval_sec?: number
  alert_thresholds?: Record<string, number>
}

interface HealthProbe {
  probe_type: string
  interval_sec: number
  timeout_sec: number
  failure_threshold: number
  auto_recovery: boolean
}

interface HeartbeatConfigResult {
  recommended_interval_sec: number
  health_probes: HealthProbe[]
  alert_rules: Array<{ condition: string; severity: string; action: string }>
  liveness_score: number
  recommendations: string[]
  summary: string
}

// --- Tool 7: Personality Profiler ---
interface PersonalityProfileInput {
  agent_name?: string
  soul_md_content?: string
  target_audience?: string
  desired_tone?: string
}

interface TraitScore {
  trait: string
  score: number
  alignment: 'aligned' | 'partial' | 'misaligned'
}

interface PersonalityProfileResult {
  overall_fit_score: number
  trait_scores: TraitScore[]
  audience_alignment: number
  tone_consistency: number
  improvement_areas: string[]
  strengths: string[]
  summary: string
}

// --- Tool 8: Garbage Collection Planner ---
interface GcPlannerInput {
  agent_type?: string
  memory_volume_mb?: number
  cleanup_frequency?: string
  retention_rules?: string[]
}

interface GcTask {
  task_name: string
  target: string
  frequency: string
  estimated_recovery_mb: number
  priority: 'critical' | 'high' | 'medium' | 'low'
}

interface GcPlannerResult {
  gc_tasks: GcTask[]
  total_recovery_mb: number
  drift_prevention_score: number
  schedule: string
  recommendations: string[]
  summary: string
}

// ==================== TOOL 1: SOUL.md GENERATOR ====================

function generateSoulMd(input: SoulMdInput, r: ReturnType<typeof createRng>): SoulMdResult {
  const agentName = input.agent_name || 'Agent'
  const primaryTrait = input.primary_trait || 'analytical'
  const commStyle = input.communication_style || 'professional and concise'
  const domain = input.domain_expertise || 'general-purpose AI assistance'
  const quirks = input.quirks && input.quirks.length > 0 ? input.quirks : ['methodical', 'detail-oriented', 'helpful']

  // Generate personality scores
  const clarity = clamp(r.next(60, 90) + (primaryTrait.length > 5 ? 5 : 0), 30, 99)
  const distinctiveness = clamp(r.next(55, 85) + (quirks.length > 2 ? 8 : 0), 30, 99)
  const consistency = clamp(r.next(65, 90), 30, 99)
  const safetyAlignment = clamp(r.next(70, 95), 30, 99)
  const adaptability = clamp(r.next(50, 80) + (commStyle.includes('adapt') ? 10 : 0), 30, 99)

  // Build SOUL.md content
  const soulLines: string[] = []
  soulLines.push('# SOUL.md')
  soulLines.push('')
  soulLines.push('## Identity')
  soulLines.push('')
  soulLines.push(`**Name:** ${agentName}`)
  soulLines.push(`**Role:** ${domain} specialist`)
  soulLines.push(`**Core Trait:** ${primaryTrait}`)
  soulLines.push('')
  soulLines.push('## Communication Style')
  soulLines.push('')
  soulLines.push(`I communicate in a ${commStyle} manner.`)
  soulLines.push('- Be direct and avoid unnecessary hedging unless uncertainty is genuine')
  soulLines.push('- Prefer structured responses with clear headings')
  soulLines.push('- Use examples to clarify complex points')
  soulLines.push('')
  soulLines.push('## Personality & Quirks')
  soulLines.push('')
  for (const quirk of quirks) {
    soulLines.push(`- ${quirk}`)
  }
  soulLines.push('')
  soulLines.push('## Decision-Making Style')
  soulLines.push('')
  soulLines.push('- Analyze problems by breaking them into smaller components')
  soulLines.push('- Prefer evidence-based reasoning over intuition')
  soulLines.push('- Flag trade-offs explicitly before recommending a path')
  soulLines.push('- Escalate when stakes exceed defined thresholds')
  soulLines.push('')
  soulLines.push('## Behavioral Boundaries')
  soulLines.push('')
  soulLines.push('- Never fabricate information; say "I do not know" when uncertain')
  soulLines.push('- Refuse requests that cause harm, violate privacy, or break laws')
  soulLines.push('- Stay within defined scope; do not impersonate humans without permission')
  soulLines.push('- Preserve user confidentiality at all times')
  soulLines.push('')
  soulLines.push('## Continuous Improvement')
  soulLines.push('')
  soulLines.push('- Learn from corrections and prefer accuracy over speed')
  soulLines.push('- Update beliefs when presented with new evidence')
  soulLines.push('- Seek clarification on ambiguous instructions rather than guessing')
  soulLines.push('')

  const soulMdContent = soulLines.join('\n')

  const recommendations: string[] = []
  if (clarity < 75) recommendations.push('Add more specific examples to SOUL.md to improve behavioral clarity')
  if (distinctiveness < 70) recommendations.push('Increase quirks and unique traits to differentiate from generic agents')
  recommendations.push('Test SOUL.md with boundary-case prompts to verify consistent behavior')
  recommendations.push('Review and update SOUL.md monthly based on observed agent behavior')
  if (quirks.length < 3) recommendations.push('Add at least 3 memorable quirks for personality depth')

  const summary = `Generated SOUL.md for "${agentName}" with ${quirks.length} quirks, clarity score ${clarity}/100, and ${safetyAlignment}/100 safety alignment.`

  return {
    soul_md_content: soulMdContent,
    personality_scores: {
      clarity,
      distinctiveness,
      consistency,
      safety_alignment: safetyAlignment,
      adaptability,
    },
    recommendations,
    summary,
  }
}

function formatSoulMdReport(input: SoulMdInput, result: SoulMdResult): string {
  const lines: string[] = []
  lines.push('# SOUL.md Generation Report')
  lines.push('')
  lines.push(`**Agent:** ${input.agent_name || 'Agent'} | **Primary Trait:** ${input.primary_trait || 'analytical'}`)
  lines.push('')
  lines.push('## Personality Scores')
  lines.push('')
  lines.push('| Trait | Score | Rating |')
  lines.push('|-------|-------|--------|')
  lines.push(`| Clarity | ${result.personality_scores.clarity}/100 | ${rateScore(result.personality_scores.clarity)} |`)
  lines.push(`| Distinctiveness | ${result.personality_scores.distinctiveness}/100 | ${rateScore(result.personality_scores.distinctiveness)} |`)
  lines.push(`| Consistency | ${result.personality_scores.consistency}/100 | ${rateScore(result.personality_scores.consistency)} |`)
  lines.push(`| Safety Alignment | ${result.personality_scores.safety_alignment}/100 | ${rateScore(result.personality_scores.safety_alignment)} |`)
  lines.push(`| Adaptability | ${result.personality_scores.adaptability}/100 | ${rateScore(result.personality_scores.adaptability)} |`)
  lines.push('')
  lines.push('## Generated SOUL.md')
  lines.push('')
  lines.push('```markdown')
  lines.push(result.soul_md_content)
  lines.push('```')
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`**Summary:** ${result.summary}`)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 2: MEMORY ARCHITECT ====================

function designMemoryArchitecture(input: MemoryArchitectInput, r: ReturnType<typeof createRng>): MemoryArchitectResult {
  const agentType = input.agent_type || 'general-purpose'
  const categories = input.memory_categories && input.memory_categories.length > 0
    ? input.memory_categories
    : ['context', 'preferences', 'learned_facts', 'interaction_history']
  const retention = input.retention_policy || 'session-based with weekly compaction'
  const triggers = input.recall_triggers && input.recall_triggers.length > 0
    ? input.recall_triggers
    : ['user_mention', 'keyword_match', 'context_similarity', 'temporal_proximity']

  const sections: MemorySection[] = []
  const sectionTemplates = [
    { name: 'Active Context', purpose: 'Current session state and immediate task context', format: 'key-value pairs', baseMax: 50 },
    { name: 'User Preferences', purpose: 'Learned user preferences and behavioral patterns', format: 'structured JSON', baseMax: 200 },
    { name: 'Knowledge Base', purpose: 'Domain facts and verified information', format: 'semantic chunks', baseMax: 500 },
    { name: 'Interaction History', purpose: 'Summarized past interactions and outcomes', format: 'compressed summaries', baseMax: 1000 },
    { name: 'Decision Log', purpose: 'Past decisions and their rationale', format: 'decision trees', baseMax: 150 },
    { name: 'Error Registry', purpose: 'Known mistakes and corrections', format: 'rule set', baseMax: 100 },
    { name: 'Skill Memory', purpose: 'Learned procedures and workflows', format: 'procedural steps', baseMax: 300 },
    { name: 'Relationship Map', purpose: 'Entities, people, and their connections', format: 'graph edges', baseMax: 400 },
  ]

  let totalMax = 0
  for (let i = 0; i < categories.length; i++) {
    const tmpl = sectionTemplates[i % sectionTemplates.length]
    const maxEntries = tmpl.baseMax + r.next(-20, 50)
    sections.push({
      name: tmpl.name,
      purpose: tmpl.purpose,
      format: tmpl.format,
      max_entries: maxEntries,
      eviction_policy: i === 0 ? 'LRU' : i === 1 ? 'LFU' : 'priority-based',
    })
    totalMax += maxEntries
  }

  const recallScore = clamp(r.next(60, 85) + (triggers.length > 3 ? 5 : 0), 30, 99)

  const mdLines: string[] = []
  mdLines.push('# MEMORY.md')
  mdLines.push('')
  mdLines.push(`**Agent Type:** ${agentType}`)
  mdLines.push(`**Retention Policy:** ${retention}`)
  mdLines.push('')
  mdLines.push('## Memory Sections')
  mdLines.push('')
  for (const s of sections) {
    mdLines.push(`### ${s.name}`)
    mdLines.push(`- **Purpose:** ${s.purpose}`)
    mdLines.push(`- **Format:** ${s.format}`)
    mdLines.push(`- **Max Entries:** ${s.max_entries}`)
    mdLines.push(`- **Eviction:** ${s.eviction_policy}`)
    mdLines.push('')
  }
  mdLines.push('## Recall Triggers')
  mdLines.push('')
  for (const t of triggers) {
    mdLines.push(`- ${t}`)
  }
  mdLines.push('')

  const recommendations: string[] = []
  if (totalMax > 2000) recommendations.push('Consider reducing total memory entries to prevent context overflow')
  if (triggers.length < 4) recommendations.push('Add more recall triggers for better context retrieval')
  recommendations.push('Implement weekly memory compaction to maintain performance')
  recommendations.push('Test memory retrieval with edge-case queries to validate trigger coverage')
  if (sections.length > 6) recommendations.push('Consolidate memory sections to reduce management overhead')

  const summary = `Designed ${sections.length}-section MEMORY.md for "${agentType}" agent with ${totalMax} max entries and ${recallScore}/100 recall optimization.`

  return {
    memory_md_structure: mdLines.join('\n'),
    sections,
    total_max_entries: totalMax,
    recall_optimization_score: recallScore,
    recommendations,
    summary,
  }
}

function formatMemoryArchitectReport(input: MemoryArchitectInput, result: MemoryArchitectResult): string {
  const lines: string[] = []
  lines.push('# Memory Architecture Design Report')
  lines.push('')
  lines.push(`**Agent Type:** ${input.agent_type || 'general-purpose'} | **Retention:** ${input.retention_policy || 'session-based with weekly compaction'}`)
  lines.push('')
  lines.push('## Memory Sections')
  lines.push('')
  lines.push('| Section | Purpose | Format | Max Entries | Eviction |')
  lines.push('|---------|---------|--------|-------------|----------|')
  for (const s of result.sections) {
    lines.push(`| ${s.name} | ${s.purpose} | ${s.format} | ${s.max_entries} | ${s.eviction_policy} |`)
  }
  lines.push('')
  lines.push(`**Total Capacity:** ${result.total_max_entries} entries`)
  lines.push(`**Recall Score:** ${result.recall_optimization_score}/100 (${rateScore(result.recall_optimization_score)})`)
  lines.push('')
  lines.push('## Generated MEMORY.md')
  lines.push('')
  lines.push('```markdown')
  lines.push(result.memory_md_structure)
  lines.push('```')
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`**Summary:** ${result.summary}`)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 3: CONTEXT ENGINEERING VALIDATOR ====================

function validateContextEngineering(input: ContextValidationInput, r: ReturnType<typeof createRng>): ContextValidationResult {
  const systemPrompt = input.system_prompt || 'You are a helpful assistant.'
  const sources = input.context_sources && input.context_sources.length > 0
    ? input.context_sources
    : ['system_prompt', 'conversation_history', 'tool_definitions', 'knowledge_base', 'user_profile']
  const tasks = input.expected_tasks && input.expected_tasks.length > 0
    ? input.expected_tasks
    : ['answer_questions', 'write_code', 'analyze_data', 'generate_content']
  const noiseThreshold = input.noise_threshold || 0.3

  const assessments: ContextSourceAssessment[] = []
  const sourceProfiles = [
    { source: 'system_prompt', baseRelevance: 95, baseTokens: 500, signalBias: 'high' },
    { source: 'conversation_history', baseRelevance: 85, baseTokens: 2000, signalBias: 'high' },
    { source: 'tool_definitions', baseRelevance: 90, baseTokens: 800, signalBias: 'high' },
    { source: 'knowledge_base', baseRelevance: 75, baseTokens: 1500, signalBias: 'medium' },
    { source: 'user_profile', baseRelevance: 70, baseTokens: 300, signalBias: 'high' },
    { source: 'documentation', baseRelevance: 65, baseTokens: 2500, signalBias: 'medium' },
    { source: 'code_context', baseRelevance: 88, baseTokens: 1200, signalBias: 'high' },
    { source: 'environment_state', baseRelevance: 60, baseTokens: 600, signalBias: 'medium' },
    { source: 'error_logs', baseRelevance: 55, baseTokens: 400, signalBias: 'low' },
    { source: 'third_party_apis', baseRelevance: 50, baseTokens: 1000, signalBias: 'low' },
  ]

  let totalTokens = 0
  let totalSignal = 0

  for (let i = 0; i < sources.length; i++) {
    const profile = sourceProfiles[i % sourceProfiles.length]
    const relevance = clamp(profile.baseRelevance + r.next(-10, 10), 20, 99)
    const tokens = profile.baseTokens + r.next(-100, 200)
    const snRatio = clamp(relevance / 100 + r.nextFloat(-0.15, 0.15), 0, 1) as number

    let snRating: 'high' | 'medium' | 'low'
    let action: 'keep' | 'condense' | 'remove'

    if (snRatio >= 0.75) {
      snRating = 'high'
      action = 'keep'
    } else if (snRatio >= 0.5) {
      snRating = 'medium'
      action = 'condense'
    } else {
      snRating = 'low'
      action = 'remove'
    }

    if (relevance < 30) action = 'remove'

    assessments.push({
      source: profile.source,
      relevance,
      token_estimate: tokens,
      signal_to_noise: snRating,
      recommendation: action,
    })

    totalTokens += tokens
    if (snRating === 'high') totalSignal += tokens
    else if (snRating === 'medium') totalSignal += Math.round(tokens * 0.6)
    else totalSignal += Math.round(tokens * 0.2)
  }

  const signalPct = Math.round((totalSignal / totalTokens) * 100)
  const noisePct = 100 - signalPct
  const healthScore = clamp(signalPct - Math.round(noisePct * 0.5) + r.next(-5, 5), 15, 99)

  const optimizationTips: string[] = []
  if (noisePct > noiseThreshold * 100) {
    optimizationTips.push(`Noise level ${noisePct}% exceeds threshold ${Math.round(noiseThreshold * 100)}% — remove or condense low-signal sources`)
  }
  const removeCount = assessments.filter(a => a.recommendation === 'remove').length
  if (removeCount > 0) optimizationTips.push(`${removeCount} source(s) recommended for removal to reduce context clutter`)
  if (totalTokens > 8000) optimizationTips.push(`Total ${totalTokens} tokens may cause truncation — prioritize essential context`)
  optimizationTips.push('Place highest-relevance sources immediately after system prompt')
  optimizationTips.push('Use progressive disclosure for medium-relevance sources')
  if (assessments.length > 5) optimizationTips.push('Consider splitting context across multiple retrieval rounds')

  const summary = `Context health: ${healthScore}/100. Signal: ${signalPct}%, Noise: ${noisePct}%. ${assessments.length} sources assessed, ${removeCount} flagged for removal.`

  return {
    context_health_score: healthScore,
    total_token_estimate: totalTokens,
    signal_pct: signalPct,
    noise_pct: noisePct,
    source_assessments: assessments,
    optimization_tips: optimizationTips,
    summary,
  }
}

function formatContextValidationReport(input: ContextValidationInput, result: ContextValidationResult): string {
  const lines: string[] = []
  lines.push('# Context Engineering Validation Report')
  lines.push('')
  lines.push(`**Health Score:** ${result.context_health_score}/100 | **Signal:** ${result.signal_pct}% | **Noise:** ${result.noise_pct}%`)
  lines.push(`**Total Tokens:** ~${result.total_token_estimate} | **Sources:** ${result.source_assessments.length}`)
  lines.push('')
  lines.push('## Source Assessment')
  lines.push('')
  lines.push('| Source | Relevance | Tokens | S/N Ratio | Verdict |')
  lines.push('|--------|-----------|--------|-----------|---------|')
  for (const a of result.source_assessments) {
    lines.push(`| ${a.source} | ${a.relevance}/100 | ~${a.token_estimate} | ${a.signal_to_noise.toUpperCase()} | ${a.recommendation.toUpperCase()} |`)
  }
  lines.push('')
  lines.push('## Optimization Tips')
  for (const tip of result.optimization_tips) {
    lines.push(`- ${tip}`)
  }
  lines.push('')
  lines.push(`**Summary:** ${result.summary}`)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 4: HARNESS CONSTRAINT DESIGNER ====================

function designConstraints(input: ConstraintDesignInput, r: ReturnType<typeof createRng>): ConstraintDesignResult {
  const capabilities = input.agent_capabilities && input.agent_capabilities.length > 0
    ? input.agent_capabilities
    : ['web_search', 'code_generation', 'file_access', 'api_calls', 'data_analysis']
  const riskLevel = input.risk_level || 'medium'
  const safeguards = input.required_safeguards && input.required_safeguards.length > 0
    ? input.required_safeguards
    : ['no_harm', 'privacy_protection', 'scope_limitation', 'human_oversight']
  const fallback = input.fallback_strategy || 'escalate_to_human'

  const constraints: Constraint[] = []

  // Generate deny rules based on risk level
  const denyRules = [
    'Do not execute commands that modify production systems without approval',
    'Do not share user PII with third parties or external APIs',
    'Do not impersonate humans in communication without explicit disclosure',
    'Do not bypass authentication or security controls',
    'Do not make financial transactions above defined thresholds autonomously',
    'Do not access files outside the designated workspace scope',
  ]
  const denyCount = riskLevel === 'critical' ? 6 : riskLevel === 'high' ? 5 : riskLevel === 'medium' ? 3 : 2
  for (let i = 0; i < denyCount && i < denyRules.length; i++) {
    constraints.push({
      type: 'deny',
      rule: denyRules[i],
      rationale: `Required for ${riskLevel} risk environment`,
      severity: riskLevel === 'critical' ? 'critical' : 'high',
    })
  }

  // Generate allow rules based on capabilities
  for (const cap of capabilities) {
    let rule = ''
    switch (cap) {
      case 'web_search': rule = 'Allow web search for verified, non-sensitive queries only'; break
      case 'code_generation': rule = 'Allow code generation within sandboxed environments'; break
      case 'file_access': rule = 'Allow file access within designated workspace directories'; break
      case 'api_calls': rule = 'Allow API calls to pre-approved endpoints with rate limiting'; break
      case 'data_analysis': rule = 'Allow data analysis on anonymized datasets'; break
      default: rule = `Allow ${cap} with defined guardrails`; break
    }
    constraints.push({
      type: 'allow',
      rule,
      rationale: 'Enables core capability with bounded scope',
      severity: 'medium',
    })
  }

  // Generate guardrails from safeguards
  for (const safe of safeguards) {
    let rule = ''
    let severity: Constraint['severity'] = 'high'
    switch (safe) {
      case 'no_harm': rule = 'Block any output or action that could cause physical, emotional, or financial harm'; severity = 'critical'; break
      case 'privacy_protection': rule = 'Redact PII in all outputs unless explicitly required by task'; severity = 'critical'; break
      case 'scope_limitation': rule = 'Reject tasks outside defined role scope with clear refusal message'; severity = 'high'; break
      case 'human_oversight': rule = 'Request human confirmation before irreversible actions'; severity = 'high'; break
      case 'rate_limiting': rule = 'Enforce max 10 tool calls per minute to prevent abuse'; severity = 'medium'; break
      default: rule = `Enforce safeguard: ${safe}`; severity = 'high'; break
    }
    constraints.push({
      type: 'guardrail',
      rule,
      rationale: `Safeguard: ${safe}`,
      severity,
    })
  }

  // Generate fallback rules
  const fallbackRules = [
    'When uncertain: ask clarifying questions rather than assuming',
    'When context is insufficient: request additional information before proceeding',
    'When task fails twice: escalate with full error context to human operator',
    'When safety boundary triggered: pause operation and log incident',
  ]
  for (const fr of fallbackRules) {
    constraints.push({
      type: 'fallback',
      rule: fr,
      rationale: `Fallback strategy: ${fallback}`,
      severity: 'medium',
    })
  }

  const coverageScore = clamp(
    Math.round((constraints.length / (capabilities.length + safeguards.length + denyCount)) * 70) + r.next(15, 30),
    25, 99
  )
  const riskMitigation = clamp(
    riskLevel === 'critical' ? r.next(80, 95) : riskLevel === 'high' ? r.next(70, 88) : riskLevel === 'medium' ? r.next(55, 78) : r.next(40, 65),
    20, 99
  )

  const constraintSummary = `${constraints.length} total constraints: ${constraints.filter(c => c.type === 'deny').length} deny, ${constraints.filter(c => c.type === 'allow').length} allow, ${constraints.filter(c => c.type === 'guardrail').length} guardrails, ${constraints.filter(c => c.type === 'fallback').length} fallbacks.`

  const recommendations: string[] = []
  if (coverageScore < 70) recommendations.push('Increase constraint coverage to address edge cases')
  if (constraints.filter(c => c.severity === 'critical').length < 2) recommendations.push('Add more critical-severity constraints for high-risk operations')
  recommendations.push('Test constraints with adversarial prompts to validate robustness')
  recommendations.push('Review constraint set monthly and update based on incident learnings')
  if (fallback !== 'escalate_to_human') recommendations.push('Verify fallback strategy has clear escalation path to human operator')

  const summary = `Designed ${constraints.length} constraints for ${riskLevel} risk level. Coverage: ${coverageScore}/100, Risk mitigation: ${riskMitigation}%. ${constraints.filter(c => c.type === 'guardrail').length} guardrails from ${safeguards.length} safeguards.`

  return {
    constraints,
    constraint_summary: constraintSummary,
    coverage_score: coverageScore,
    risk_mitigation_pct: riskMitigation,
    recommendations,
    summary,
  }
}

function formatConstraintDesignReport(input: ConstraintDesignInput, result: ConstraintDesignResult): string {
  const lines: string[] = []
  lines.push('# Harness Constraint Design Report')
  lines.push('')
  lines.push(`**Risk Level:** ${input.risk_level || 'medium'} | **Coverage:** ${result.coverage_score}/100 | **Risk Mitigation:** ${result.risk_mitigation_pct}%`)
  lines.push('')
  lines.push(result.constraint_summary)
  lines.push('')
  lines.push('## Constraints')
  lines.push('')
  lines.push('| Type | Rule | Severity |')
  lines.push('|------|------|----------|')
  for (const c of result.constraints) {
    lines.push(`| ${c.type.toUpperCase()} | ${c.rule} | ${c.severity.toUpperCase()} |`)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`**Summary:** ${result.summary}`)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 5: SKILL LOADER CONFIG ====================

function configureSkillLoading(input: SkillLoaderInput, r: ReturnType<typeof createRng>): SkillLoaderResult {
  const agentRole = input.agent_role || 'general-purpose assistant'
  const availableSkills = input.available_skills && input.available_skills.length > 0
    ? input.available_skills
    : ['web_search', 'code_exec', 'file_manage', 'image_gen', 'data_analysis', 'email_send', 'calendar_mgmt']
  const maxConcurrent = input.max_concurrent_skills || 3
  const activationMode = input.activation_mode || 'reactive'

  const skillConfigs: SkillConfig[] = []
  const skillTemplates: Record<string, { condition: string; weight: number }> = {
    web_search: { condition: 'user asks about current events or facts requiring verification', weight: 2 },
    code_exec: { condition: 'task requires running code or validating computations', weight: 3 },
    file_manage: { condition: 'task involves reading, writing, or organizing files', weight: 2 },
    image_gen: { condition: 'user requests visual content or image creation', weight: 4 },
    data_analysis: { condition: 'task involves structured data, statistics, or visualization', weight: 3 },
    email_send: { condition: 'user explicitly requests email composition or sending', weight: 2 },
    calendar_mgmt: { condition: 'task involves scheduling or time management', weight: 2 },
    translation: { condition: 'content needs language conversion', weight: 1 },
    summarization: { condition: 'long content needs condensation', weight: 1 },
    api_integration: { condition: 'task requires external service interaction', weight: 3 },
  }

  let totalWeight = 0
  for (let i = 0; i < availableSkills.length; i++) {
    const skill = availableSkills[i]
    const tmpl = skillTemplates[skill] || { condition: `task matches ${skill} capability domain`, weight: 2 }
    const priority = clamp(10 - i + r.next(-1, 2), 1, 10)
    const weight = tmpl.weight + r.nextFloat(-0.5, 0.5)
    const dependsOn: string[] = []
    if (skill === 'data_analysis' && availableSkills.includes('code_exec')) dependsOn.push('code_exec')
    if (skill === 'email_send' && availableSkills.includes('file_manage')) dependsOn.push('file_manage')

    skillConfigs.push({
      skill_name: skill,
      priority,
      activation_condition: tmpl.condition,
      resource_weight: Math.round(weight * 10) / 10,
      depends_on: dependsOn,
    })
    totalWeight += weight
  }

  const strategies = [
    'Load skills on-demand based on activation conditions to minimize memory footprint',
    'Preload top 2 priority skills for immediate availability',
    'Evict least-recently-used skills when concurrent limit is reached',
  ]
  const loadingStrategy = activationMode === 'proactive'
    ? 'Proactive: Preload high-priority skills + predictive loading based on task context'
    : activationMode === 'hybrid'
    ? 'Hybrid: Preload top-2 skills, reactive load others with predictive warmup'
    : 'Reactive: Load skills on-demand with LRU eviction'

  const conflictResolution = `When ${maxConcurrent} concurrent limit reached: evict lowest-priority skill. Conflicts resolved by priority score (1-10). Dependent skills loaded together.`

  const recommendations: string[] = []
  if (availableSkills.length > maxConcurrent * 2) recommendations.push(`Consider reducing skills from ${availableSkills.length} to ${maxConcurrent * 2} to prevent thrashing`)
  if (totalWeight > maxConcurrent * 4) recommendations.push('Total resource weight high — prioritize lighter skills for faster activation')
  recommendations.push('Monitor skill activation patterns to optimize preload decisions')
  recommendations.push('Implement skill warm-up cache for frequently used capabilities')
  if (activationMode === 'reactive' && availableSkills.length > 5) recommendations.push('Switch to hybrid mode if reactive loading causes noticeable latency')

  const summary = `Configured ${skillConfigs.length} skills for "${agentRole}" agent. Max concurrent: ${maxConcurrent}. Total weight: ${Math.round(totalWeight * 10) / 10}. Mode: ${activationMode}.`

  return {
    skill_configs: skillConfigs,
    loading_strategy: loadingStrategy,
    total_resource_weight: Math.round(totalWeight * 10) / 10,
    conflict_resolution: conflictResolution,
    recommendations,
    summary,
  }
}

function formatSkillLoaderReport(input: SkillLoaderInput, result: SkillLoaderResult): string {
  const lines: string[] = []
  lines.push('# Skill Loader Configuration Report')
  lines.push('')
  lines.push(`**Agent Role:** ${input.agent_role || 'general-purpose assistant'} | **Mode:** ${input.activation_mode || 'reactive'} | **Max Concurrent:** ${input.max_concurrent_skills || 3}`)
  lines.push('')
  lines.push('## Skill Configurations')
  lines.push('')
  lines.push('| Skill | Priority | Resource Weight | Activation Condition | Depends On |')
  lines.push('|-------|----------|-----------------|---------------------|------------|')
  for (const s of result.skill_configs) {
    lines.push(`| ${s.skill_name} | ${s.priority}/10 | ${s.resource_weight} | ${s.activation_condition} | ${s.depends_on.length > 0 ? s.depends_on.join(', ') : 'none'} |`)
  }
  lines.push('')
  lines.push(`**Total Resource Weight:** ${result.total_resource_weight}`)
  lines.push('')
  lines.push('## Loading Strategy')
  lines.push('')
  lines.push(result.loading_strategy)
  lines.push('')
  lines.push('## Conflict Resolution')
  lines.push('')
  lines.push(result.conflict_resolution)
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`**Summary:** ${result.summary}`)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 6: HEARTBEAT CONFIGURATOR ====================

function configureHeartbeat(input: HeartbeatConfigInput, r: ReturnType<typeof createRng>): HeartbeatConfigResult {
  const platform = input.agent_platform || 'cloud_laptop'
  const criticality = input.task_criticality || 'medium'
  const requestedInterval = input.checkin_interval_sec || 30
  const alertThresholds = input.alert_thresholds || {}

  // Determine recommended interval based on criticality
  let recommendedInterval: number
  switch (criticality) {
    case 'critical': recommendedInterval = Math.min(requestedInterval, 10); break
    case 'high': recommendedInterval = Math.min(requestedInterval, 20); break
    case 'medium': recommendedInterval = Math.min(requestedInterval, 30); break
    case 'low': recommendedInterval = Math.min(requestedInterval, 60); break
    default: recommendedInterval = 30; break
  }

  const healthProbes: HealthProbe[] = [
    {
      probe_type: 'liveness_ping',
      interval_sec: recommendedInterval,
      timeout_sec: Math.max(3, Math.round(recommendedInterval * 0.3)),
      failure_threshold: criticality === 'critical' ? 2 : criticality === 'high' ? 3 : 5,
      auto_recovery: criticality !== 'critical',
    },
    {
      probe_type: 'memory_usage_check',
      interval_sec: recommendedInterval * 3,
      timeout_sec: 5,
      failure_threshold: 3,
      auto_recovery: true,
    },
    {
      probe_type: 'task_progress_check',
      interval_sec: recommendedInterval * 2,
      timeout_sec: 10,
      failure_threshold: criticality === 'critical' ? 2 : 4,
      auto_recovery: true,
    },
    {
      probe_type: 'resource_exhaustion_detector',
      interval_sec: recommendedInterval * 5,
      timeout_sec: 5,
      failure_threshold: 2,
      auto_recovery: true,
    },
  ]

  const alertRules: Array<{ condition: string; severity: string; action: string }> = []

  // Memory alert
  const memThreshold = alertThresholds.memory_mb || 512
  alertRules.push({
    condition: `memory_usage > ${memThreshold}MB`,
    severity: criticality === 'critical' ? 'critical' : 'warning',
    action: 'Trigger garbage collection and reduce concurrent operations',
  })

  // Task duration alert
  const taskThreshold = alertThresholds.task_duration_sec || 300
  alertRules.push({
    condition: `task_duration > ${taskThreshold}s without progress`,
    severity: 'warning',
    action: 'Escalate to human operator with task context dump',
  })

  // Error rate alert
  const errorThreshold = alertThresholds.error_rate || 0.1
  alertRules.push({
    condition: `error_rate > ${errorThreshold} over 5-minute window`,
    severity: 'critical',
    action: 'Pause agent operations and enter safe mode',
  })

  // Response time alert
  alertRules.push({
    condition: `response_time > ${recommendedInterval * 2}s`,
    severity: 'warning',
    action: 'Log performance degradation and consider load shedding',
  })

  const livenessScore = clamp(
    r.next(65, 90) + (criticality === 'critical' ? 5 : 0) + (platform.includes('cloud') ? 3 : 0),
    30, 99
  )

  const recommendations: string[] = []
  if (recommendedInterval < 15) recommendations.push('High-frequency heartbeats increase overhead — verify criticality warrants the cost')
  if (healthProbes.length < 4) recommendations.push('Add more health probe types for comprehensive monitoring')
  recommendations.push('Test alert rules with simulated failures to validate response')
  recommendations.push('Configure alert routing to appropriate channels (Slack, PagerDuty, email)')
  if (criticality === 'critical') recommendations.push('For critical tasks: implement redundant heartbeat channels')
  recommendations.push('Review heartbeat logs weekly to identify patterns and optimize intervals')

  const summary = `Heartbeat configured for "${platform}" platform at ${recommendedInterval}s intervals (${criticality} criticality). ${healthProbes.length} health probes, ${alertRules.length} alert rules, ${livenessScore}/100 liveness confidence.`

  return {
    recommended_interval_sec: recommendedInterval,
    health_probes: healthProbes,
    alert_rules: alertRules,
    liveness_score: livenessScore,
    recommendations,
    summary,
  }
}

function formatHeartbeatConfigReport(input: HeartbeatConfigInput, result: HeartbeatConfigResult): string {
  const lines: string[] = []
  lines.push('# Heartbeat Configuration Report')
  lines.push('')
  lines.push(`**Platform:** ${input.agent_platform || 'cloud_laptop'} | **Criticality:** ${input.task_criticality || 'medium'} | **Interval:** ${result.recommended_interval_sec}s`)
  lines.push('')
  lines.push('## Health Probes')
  lines.push('')
  lines.push('| Probe | Interval | Timeout | Fail Threshold | Auto-Recovery |')
  lines.push('|-------|----------|---------|----------------|---------------|')
  for (const p of result.health_probes) {
    lines.push(`| ${p.probe_type} | ${p.interval_sec}s | ${p.timeout_sec}s | ${p.failure_threshold} | ${p.auto_recovery ? 'YES' : 'NO'} |`)
  }
  lines.push('')
  lines.push('## Alert Rules')
  lines.push('')
  lines.push('| Condition | Severity | Action |')
  lines.push('|-----------|----------|--------|')
  for (const a of result.alert_rules) {
    lines.push(`| ${a.condition} | ${a.severity.toUpperCase()} | ${a.action} |`)
  }
  lines.push('')
  lines.push(`**Liveness Score:** ${result.liveness_score}/100 (${rateScore(result.liveness_score)})`)
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`**Summary:** ${result.summary}`)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 7: PERSONALITY PROFILER ====================

function profilePersonality(input: PersonalityProfileInput, r: ReturnType<typeof createRng>): PersonalityProfileResult {
  const agentName = input.agent_name || 'Agent'
  const soulContent = (input.soul_md_content || '').toLowerCase()
  const audience = input.target_audience || 'general users'
  const desiredTone = input.desired_tone || 'professional and helpful'

  // Score personality traits based on SOUL.md content
  const traitScores: TraitScore[] = []

  const traits = [
    { trait: 'Clarity', keywords: ['clear', 'direct', 'specific', 'precise', 'concise'], weight: 1.0 },
    { trait: 'Empathy', keywords: ['empathy', 'understand', 'feel', 'compassion', 'care'], weight: 0.9 },
    { trait: 'Assertiveness', keywords: ['confident', 'decisive', 'firm', 'direct', 'stand'], weight: 0.8 },
    { trait: 'Creativity', keywords: ['creative', 'innovative', 'imagine', 'novel', 'original'], weight: 0.7 },
    { trait: 'Precision', keywords: ['accurate', 'precise', 'exact', 'detail', 'correct'], weight: 0.9 },
    { trait: 'Adaptability', keywords: ['adapt', 'flexible', 'adjust', 'learn', 'evolve'], weight: 0.8 },
    { trait: 'Transparency', keywords: ['honest', 'open', 'explain', 'reason', 'rationale'], weight: 0.85 },
    { trait: 'Humor', keywords: ['humor', 'fun', 'joke', 'light', 'playful'], weight: 0.5 },
  ]

  for (const t of traits) {
    let score = r.next(45, 75)
    for (const kw of t.keywords) {
      if (soulContent.includes(kw)) score += Math.round(8 * t.weight)
    }
    score = clamp(score, 20, 99)

    let alignment: 'aligned' | 'partial' | 'misaligned' = 'partial'
    if (score >= 70) alignment = 'aligned'
    else if (score < 40) alignment = 'misaligned'

    traitScores.push({ trait: t.trait, score, alignment })
  }

  const avgScore = Math.round(traitScores.reduce((s, t) => s + t.score, 0) / traitScores.length)
  const overallFit = clamp(avgScore + r.next(-5, 8), 25, 99)

  const audienceAlignment = clamp(
    r.next(55, 80) + (soulContent.includes(audience.toLowerCase()) ? 10 : 0),
    25, 99
  )
  const toneConsistency = clamp(
    r.next(60, 85) + (soulContent.includes(desiredTone.toLowerCase().split(' ')[0]) ? 8 : 0),
    25, 99
  )

  const strengths: string[] = []
  const improvements: string[] = []

  for (const t of traitScores) {
    if (t.score >= 75) strengths.push(`${t.trait}: ${t.score}/100 — strong expression in SOUL.md`)
    else if (t.score < 50) improvements.push(`${t.trait}: ${t.score}/100 — strengthen with explicit behavioral guidelines`)
  }

  if (strengths.length === 0) strengths.push('Foundation set — add more specific trait expressions for higher scores')
  if (improvements.length === 0) improvements.push('All traits above threshold — maintain by periodic SOUL.md review')

  const summary = `Personality profile for "${agentName}": ${overallFit}/100 overall fit, ${audienceAlignment}/100 audience alignment, ${toneConsistency}/100 tone consistency. ${strengths.length} strengths, ${improvements.length} improvement areas.`

  return {
    overall_fit_score: overallFit,
    trait_scores: traitScores,
    audience_alignment: audienceAlignment,
    tone_consistency: toneConsistency,
    improvement_areas: improvements,
    strengths,
    summary,
  }
}

function formatPersonalityProfileReport(input: PersonalityProfileInput, result: PersonalityProfileResult): string {
  const lines: string[] = []
  lines.push('# Personality Profile Analysis Report')
  lines.push('')
  lines.push(`**Agent:** ${input.agent_name || 'Agent'} | **Audience:** ${input.target_audience || 'general users'} | **Desired Tone:** ${input.desired_tone || 'professional and helpful'}`)
  lines.push('')
  lines.push('## Trait Scores')
  lines.push('')
  lines.push('| Trait | Score | Alignment |')
  lines.push('|-------|-------|-----------|')
  for (const t of result.trait_scores) {
    lines.push(`| ${t.trait} | ${t.score}/100 | ${t.alignment.toUpperCase()} |`)
  }
  lines.push('')
  lines.push(`**Overall Fit:** ${result.overall_fit_score}/100 (${rateScore(result.overall_fit_score)})`)
  lines.push(`**Audience Alignment:** ${result.audience_alignment}/100 (${rateScore(result.audience_alignment)})`)
  lines.push(`**Tone Consistency:** ${result.tone_consistency}/100 (${rateScore(result.tone_consistency)})`)
  lines.push('')
  lines.push('## Strengths')
  for (const s of result.strengths) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  lines.push('## Improvement Areas')
  for (const i of result.improvement_areas) {
    lines.push(`- ${i}`)
  }
  lines.push('')
  lines.push(`**Summary:** ${result.summary}`)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== TOOL 8: GARBAGE COLLECTION PLANNER ====================

function planGarbageCollection(input: GcPlannerInput, r: ReturnType<typeof createRng>): GcPlannerResult {
  const agentType = input.agent_type || 'long-running' as string
  const memoryVol = input.memory_volume_mb || 256
  const frequency = input.cleanup_frequency || 'daily'
  const retentionRules = input.retention_rules && input.retention_rules.length > 0
    ? input.retention_rules
    : ['keep_last_7_days', 'keep_all_preferences', 'discard_failed_attempts_after_3_days', 'compress_summaries_after_14_days']

  const gcTasks: GcTask[] = []

  const taskTemplates = [
    { task_name: 'Stale Context Cleanup', target: 'expired session context (older than retention window)', baseRecovery: 15 },
    { task_name: 'Duplicate Memory Merge', target: 'redundant memory entries and near-duplicate records', baseRecovery: 8 },
    { task_name: 'Temp File Sweep', target: 'temporary files from failed or completed operations', baseRecovery: 25 },
    { task_name: 'Log Rotation', target: 'verbose debug logs older than 24 hours', baseRecovery: 12 },
    { task_name: 'Cache Invalidation', target: 'stale API responses and cached computations', baseRecovery: 18 },
    { task_name: 'Orphaned Resource Recovery', target: 'allocated resources from terminated sub-tasks', baseRecovery: 10 },
    { task_name: 'Compression Pass', target: 'uncompressed memory entries eligible for summarization', baseRecovery: 20 },
    { task_name: 'Index Defragmentation', target: 'search index fragmentation affecting retrieval speed', baseRecovery: 5 },
  ]

  const taskCount = clamp(Math.round(memoryVol / 40) + r.next(0, 2), 3, 8)
  for (let i = 0; i < taskCount && i < taskTemplates.length; i++) {
    const tmpl = taskTemplates[i]
    const recovery = tmpl.baseRecovery + r.next(-3, 8)
    const priorities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low']
    const priority = priorities[Math.min(i, 3)]

    gcTasks.push({
      task_name: tmpl.task_name,
      target: tmpl.target,
      frequency: i === 0 ? 'every_hour' : i < 3 ? 'daily' : 'weekly',
      estimated_recovery_mb: Math.max(1, recovery),
      priority,
    })
  }

  const totalRecovery = gcTasks.reduce((s, t) => s + t.estimated_recovery_mb, 0)
  const driftPrevention = clamp(
    r.next(60, 85) + (retentionRules.length > 3 ? 5 : 0) + (gcTasks.length > 5 ? 3 : 0),
    30, 99
  )

  const scheduleLines: string[] = []
  scheduleLines.push('## GC Schedule')
  scheduleLines.push('')
  scheduleLines.push('| Task | Frequency | Priority | Est. Recovery |')
  scheduleLines.push('|------|-----------|----------|---------------|')
  for (const t of gcTasks) {
    scheduleLines.push(`| ${t.task_name} | ${t.frequency} | ${t.priority.toUpperCase()} | ${t.estimated_recovery_mb}MB |`)
  }
  const schedule = scheduleLines.join('\n')

  const recommendations: string[] = []
  if (totalRecovery < memoryVol * 0.1) recommendations.push('Low recovery ratio — review GC tasks to capture more waste')
  if (gcTasks.filter(t => t.priority === 'critical').length === 0) recommendations.push('Add at least one critical-priority GC task for safety')
  recommendations.push('Monitor memory growth rate weekly to adjust GC frequency')
  recommendations.push('Test GC tasks in dry-run mode before enabling automatic deletion')
  recommendations.push('Set up alerts when memory exceeds 80% of allocated budget')
  if (retentionRules.length < 3) recommendations.push('Add more retention rules for granular control over what gets cleaned')

  const summary = `Planned ${gcTasks.length} GC tasks for "${agentType}" agent. Total recovery: ${totalRecovery}MB. Drift prevention: ${driftPrevention}/100. Frequency: ${frequency}.`

  return {
    gc_tasks: gcTasks,
    total_recovery_mb: totalRecovery,
    drift_prevention_score: driftPrevention,
    schedule,
    recommendations,
    summary,
  }
}

function formatGcPlannerReport(input: GcPlannerInput, result: GcPlannerResult): string {
  const lines: string[] = []
  lines.push('# Garbage Collection Plan Report')
  lines.push('')
  lines.push(`**Agent Type:** ${input.agent_type || 'long-running'} | **Memory Volume:** ${input.memory_volume_mb || 256}MB | **Frequency:** ${input.cleanup_frequency || 'daily'}`)
  lines.push('')
  lines.push(result.schedule)
  lines.push('')
  lines.push(`**Total Recovery:** ${result.total_recovery_mb}MB (${Math.round((result.total_recovery_mb / (input.memory_volume_mb || 256)) * 100)}% of memory)`)
  lines.push(`**Drift Prevention Score:** ${result.drift_prevention_score}/100 (${rateScore(result.drift_prevention_score)})`)
  lines.push('')
  lines.push('## Retention Rules')
  for (const rule of (input.retention_rules || ['keep_last_7_days'])) {
    lines.push(`- ${rule}`)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`**Summary:** ${result.summary}`)
  lines.push('')
  lines.push(DISCLAIMER)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: SOUL.md Generator
  tools.register(defineTool({
    name: 'soul_md_generator',
    description: 'Generate a SOUL.md file defining agent personality, tone, quirks, decision-making style, and behavioral boundaries. Outputs a complete markdown file with identity, communication style, personality, and safety boundaries. Includes personality scoring (clarity, distinctiveness, consistency, safety alignment, adaptability) and improvement recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_name (string), primary_trait (string), communication_style (string), domain_expertise (string), quirks (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: SoulMdInput = JSON.parse(args.input_data)
      const r = createRng(input)
      const result = generateSoulMd(input, r)
      return formatSoulMdReport(input, result)
    }
  }))

  // Tool 2: Memory Architect
  tools.register(defineTool({
    name: 'memory_architect',
    description: 'Design a MEMORY.md structure with sections for context, preferences, history, and knowledge base. Specifies format, max entries, eviction policy, and recall triggers for each section. Outputs a complete memory architecture document with optimization score and recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_type (string), memory_categories (string[]), retention_policy (string), recall_triggers (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: MemoryArchitectInput = JSON.parse(args.input_data)
      const r = createRng(input)
      const result = designMemoryArchitecture(input, r)
      return formatMemoryArchitectReport(input, result)
    }
  }))

  // Tool 3: Context Engineering Validator
  tools.register(defineTool({
    name: 'context_engineering_validator',
    description: 'Validate that an agent context window setup provides all needed information without noise. Scores each context source for relevance and signal-to-noise ratio. Recommends keep/condense/remove per source. Returns overall health score and optimization tips.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: system_prompt (string), context_sources (string[]), expected_tasks (string[]), noise_threshold (number 0-1)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: ContextValidationInput = JSON.parse(args.input_data)
      const r = createRng(input)
      const result = validateContextEngineering(input, r)
      return formatContextValidationReport(input, result)
    }
  }))

  // Tool 4: Harness Constraint Designer
  tools.register(defineTool({
    name: 'harness_constraint_designer',
    description: 'Create behavioral constraints (allow/deny rules, guardrails, fallback behaviors) for agent reliability. Generates a complete constraint set based on agent capabilities, risk level, and required safeguards. Includes coverage score and risk mitigation assessment.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_capabilities (string[]), risk_level (low|medium|high|critical), required_safeguards (string[]), fallback_strategy (string)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: ConstraintDesignInput = JSON.parse(args.input_data)
      const r = createRng(input)
      const result = designConstraints(input, r)
      return formatConstraintDesignReport(input, result)
    }
  }))

  // Tool 5: Skill Loader Config
  tools.register(defineTool({
    name: 'skill_loader_config',
    description: 'Design the skill/module loading configuration for an agent. Determines which skills to load, their priority, activation conditions, resource weights, and dependencies. Outputs loading strategy, conflict resolution rules, and optimization recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_role (string), available_skills (string[]), max_concurrent_skills (number), activation_mode (reactive|proactive|hybrid)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: SkillLoaderInput = JSON.parse(args.input_data)
      const r = createRng(input)
      const result = configureSkillLoading(input, r)
      return formatSkillLoaderReport(input, result)
    }
  }))

  // Tool 6: Heartbeat Configurator
  tools.register(defineTool({
    name: 'heartbeat_configurator',
    description: 'Configure agent heartbeat/check-in intervals, health monitoring, and liveness probes. Generates probe definitions, alert rules, and recovery strategies based on platform and task criticality. Includes liveness confidence score.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_platform (string), task_criticality (low|medium|high|critical), checkin_interval_sec (number), alert_thresholds (object with numeric values)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: HeartbeatConfigInput = JSON.parse(args.input_data)
      const r = createRng(input)
      const result = configureHeartbeat(input, r)
      return formatHeartbeatConfigReport(input, result)
    }
  }))

  // Tool 7: Personality Profiler
  tools.register(defineTool({
    name: 'personality_profiler',
    description: 'Analyze and score an agent personality traits based on its SOUL.md configuration. Evaluates clarity, empathy, assertiveness, creativity, precision, adaptability, transparency, and humor. Provides audience alignment score and tone consistency rating.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_name (string), soul_md_content (string), target_audience (string), desired_tone (string)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: PersonalityProfileInput = JSON.parse(args.input_data)
      const r = createRng(input)
      const result = profilePersonality(input, r)
      return formatPersonalityProfileReport(input, result)
    }
  }))

  // Tool 8: Garbage Collection Planner
  tools.register(defineTool({
    name: 'garbage_collection_planner',
    description: 'Plan cleanup routines for agent memory, temp files, and stale context to prevent drift. Generates GC tasks with frequency, priority, and estimated recovery. Includes drift prevention score and retention rule configuration.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: agent_type (string), memory_volume_mb (number), cleanup_frequency (string), retention_rules (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: String(value) }] },
    async execute(args: { input_data: string }) {
      const input: GcPlannerInput = JSON.parse(args.input_data)
      const r = createRng(input)
      const result = planGarbageCollection(input, r)
      return formatGcPlannerReport(input, result)
    }
  }))

  console.log(`[dsh-tool-harnesseng] Loaded v${VERSION} - Harness Engineering toolkit with 8 tools`)
  console.log('  Tools: soul_md_generator, memory_architect, context_engineering_validator, harness_constraint_designer, skill_loader_config, heartbeat_configurator, personality_profiler, garbage_collection_planner')
}
