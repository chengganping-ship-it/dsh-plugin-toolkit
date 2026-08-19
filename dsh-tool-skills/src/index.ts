/**
 * DSH Agent Skills Marketplace Plugin v0.1.0
 *
 * Skill discovery, composition, versioning, quality scoring, packaging,
 * trigger optimization, analytics, and lifecycle management for AI agent skills.
 * Inspired by Superpowers (GitHub, 78k stars) and the Claude Code skills marketplace.
 *
 * Features (v0.1.0):
 * - Skill Discoverer (semantic matching and relevance scoring)
 * - Skill Composer (workflow composition and dependency analysis)
 * - Skill Version Manager (version tree, breaking changes, upgrade paths)
 * - Skill Quality Scorer (completeness, trigger accuracy, improvement suggestions)
 * - Skill Packager (multi-format packaging, manifest generation, validation)
 * - Trigger Optimizer (pattern optimization, precision/recall improvement)
 * - Skill Analytics (popularity ranking, success rates, abandonment analysis)
 * - Skill Template Generator (domain-specific templates, test cases, publishing)
 *
 * @module dsh-tool-skills
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-skills'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface SkillEntry {
  name: string
  description: string
  category: string
  triggers?: string[]
}

interface MatchResult {
  skill: string
  relevance_score: number
  trigger_confidence: number
  matched_triggers: string[]
  composition_suggestions: string[]
}

interface ComposedSkill {
  name: string
  parameters: Record<string, unknown>
}

interface WorkflowResult {
  composed_workflow: {
    steps: Array<{
      order: number
      skill: string
      parameters: Record<string, unknown>
      depends_on: number[]
      execution_mode: 'sequential' | 'parallel' | 'conditional'
    }>
    total_steps: number
    estimated_duration: string
  }
  dependency_graph: {
    nodes: string[]
    edges: Array<{ from: string; to: string; type: string }>
  }
  failure_points: Array<{
    step: number
    skill: string
    risk: string
    mitigation: string
  }>
  optimization_hints: string[]
}

interface VersionEntry {
  version: string
  changes: string[]
  date: string
  compatibility: 'compatible' | 'breaking' | 'deprecated'
}

interface VersionTreeResult {
  version_tree: Array<{
    version: string
    date: string
    compatibility: string
    children: string[]
    parent: string | null
  }>
  breaking_changes: Array<{
    version: string
    change: string
    impact: 'low' | 'medium' | 'high'
    migration_effort: string
  }>
  upgrade_path: Array<{
    from: string
    to: string
    steps: string[]
    risk: string
  }>
  rollback_readiness: {
    can_rollback: boolean
    rollback_target: string | null
    data_loss_risk: string
    steps: string[]
  }
}

interface SkillDefinition {
  name: string
  description: string
  triggers: string[]
  instructions: string
  tests?: string[]
}

interface QualityResult {
  quality_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  completeness_score: number
  trigger_accuracy: number
  improvement_suggestions: string[]
  detailed_scores: {
    description_quality: number
    trigger_coverage: number
    instruction_clarity: number
    test_coverage: number
    naming_convention: number
  }
}

interface PackagedSkill {
  packaged_skill: string
  manifest: {
    name: string
    version: string
    author: string
    dependencies: string[]
    format: string
    checksum: string
    size_bytes: number
    created_at: string
  }
  validation_result: {
    valid: boolean
    errors: string[]
    warnings: string[]
  }
  marketplace_ready: boolean
  format_notes: string[]
}

interface TriggerPattern {
  pattern: string
  type: 'keyword' | 'regex' | 'semantic' | 'contextual'
  weight: number
}

interface FalsePositiveEntry {
  pattern: string
  context: string
  expected_match: boolean
  actual_match: boolean
}

interface OptimizedTriggerResult {
  optimized_triggers: Array<{
    original: string
    optimized: string
    type: string
    expected_precision: number
    expected_recall: number
  }>
  precision_improvement: number
  recall_improvement: number
  ab_test_recommendation: {
    should_test: boolean
    test_name: string
    control_group: string[]
    variant_group: string[]
    success_metric: string
    duration_days: number
    min_sample_size: number
  }
}

interface UsageEntry {
  skill_name: string
  trigger_count: number
  success_count: number
  avg_duration: number
}

interface AnalyticsResult {
  popularity_ranking: Array<{
    rank: number
    skill_name: string
    trigger_count: number
    trend: 'rising' | 'stable' | 'declining'
  }>
  success_rate: Array<{
    skill_name: string
    rate: number
    total_invocations: number
    confidence_interval: [number, number]
  }>
  abandonment_points: Array<{
    skill_name: string
    stage: string
    abandonment_rate: number
    likely_cause: string
  }>
  improvement_priorities: Array<{
    skill_name: string
    priority: number
    issue: string
    recommended_action: string
    expected_impact: string
  }>
}

interface TemplateResult {
  skill_template: {
    name: string
    description: string
    triggers: string[]
    parameters: Record<string, { type: string; required: boolean; description: string }>
    instructions: string
    output_schema: { type: string }
  }
  test_cases: Array<{
    name: string
    input: Record<string, unknown>
    expected_output: string
    category: 'happy_path' | 'edge_case' | 'error_handling'
  }>
  documentation_outline: Array<{
    section: string
    content_description: string
    required: boolean
  }>
  publishing_checklist: Array<{
    item: string
    status: 'required' | 'recommended' | 'optional'
    description: string
  }>
}

// ==================== TOOL 1: SKILL DISCOVERER ====================

function discoverSkills(
  taskDescription: string,
  availableSkills: SkillEntry[]
): MatchResult[] {
  const taskLower = taskDescription.toLowerCase()
  const taskTokens = new Set(taskLower.split(/\W+/).filter(t => t.length > 2))
  const results: MatchResult[] = []

  for (const skill of availableSkills) {
    const descLower = skill.description.toLowerCase()
    const nameLower = skill.name.toLowerCase()
    const categoryLower = skill.category.toLowerCase()

    // Token overlap scoring
    const descTokens = new Set(descLower.split(/\W+/).filter(t => t.length > 2))
    let overlap = 0
    for (const token of taskTokens) {
      if (descTokens.has(token)) overlap++
    }
    const relevanceBase = taskTokens.size > 0 ? overlap / taskTokens.size : 0

    // Name match boost
    const nameBoost = taskLower.includes(nameLower) ? 0.3 : 0

    // Category match boost
    const categoryBoost = taskLower.includes(categoryLower) ? 0.15 : 0

    // Trigger matching
    const matchedTriggers: string[] = []
    let triggerScore = 0
    if (skill.triggers) {
      for (const trigger of skill.triggers) {
        const triggerLower = trigger.toLowerCase()
        const triggerTokens = triggerLower.split(/\W+/).filter(t => t.length > 2)
        const triggerOverlap = triggerTokens.filter(t => taskTokens.has(t)).length
        if (triggerOverlap > 0 || taskLower.includes(triggerLower)) {
          matchedTriggers.push(trigger)
          triggerScore += triggerTokens.length > 0 ? triggerOverlap / triggerTokens.length : 0.5
        }
      }
    }
    const triggerConfidence = skill.triggers && skill.triggers.length > 0
      ? Math.min(triggerScore / skill.triggers.length, 1)
      : 0

    const relevanceScore = Math.min(relevanceBase + nameBoost + categoryBoost + triggerConfidence * 0.3, 1)

    // Composition suggestions
    const suggestions: string[] = []
    if (relevanceScore > 0.6) {
      suggestions.push(`Use ${skill.name} as primary skill for this task`)
    }
    if (skill.category === 'data_processing' && taskLower.includes('analyze')) {
      suggestions.push(`Pair ${skill.name} with a visualization skill for end-to-end analysis`)
    }
    if (skill.category === 'communication' && taskLower.includes('report')) {
      suggestions.push(`Chain ${skill.name} with a formatting skill for polished output`)
    }
    if (matchedTriggers.length > 1) {
      suggestions.push(`Multiple triggers matched — ${skill.name} is highly relevant`)
    }

    results.push({
      skill: skill.name,
      relevance_score: Math.round(relevanceScore * 100) / 100,
      trigger_confidence: Math.round(triggerConfidence * 100) / 100,
      matched_triggers: matchedTriggers,
      composition_suggestions: suggestions
    })
  }

  results.sort((a, b) => b.relevance_score - a.relevance_score)
  return results
}

function formatDiscoveryReport(results: MatchResult[], taskDescription: string): string {
  const lines: string[] = []
  lines.push('## Skill Discovery Report')
  lines.push('')
  lines.push(`**Task:** "${taskDescription}"`)
  lines.push(`**Matches Found:** ${results.filter(r => r.relevance_score > 0.2).length}`)
  lines.push('')

  const strong = results.filter(r => r.relevance_score >= 0.6)
  const moderate = results.filter(r => r.relevance_score >= 0.3 && r.relevance_score < 0.6)
  const weak = results.filter(r => r.relevance_score < 0.3)

  if (strong.length > 0) {
    lines.push('### Strong Matches (>= 0.6)')
    lines.push('| Skill | Relevance | Trigger Confidence | Matched Triggers |')
    lines.push('|-------|-----------|-------------------|------------------|')
    for (const r of strong) {
      lines.push(`| ${r.skill} | ${(r.relevance_score * 100).toFixed(0)}% | ${(r.trigger_confidence * 100).toFixed(0)}% | ${r.matched_triggers.join(', ') || 'none'} |`)
    }
    lines.push('')
  }

  if (moderate.length > 0) {
    lines.push('### Moderate Matches (0.3 - 0.6)')
    lines.push('| Skill | Relevance | Trigger Confidence |')
    lines.push('|-------|-----------|-------------------|')
    for (const r of moderate) {
      lines.push(`| ${r.skill} | ${(r.relevance_score * 100).toFixed(0)}% | ${(r.trigger_confidence * 100).toFixed(0)}% |`)
    }
    lines.push('')
  }

  const allSuggestions = results.flatMap(r => r.composition_suggestions)
  if (allSuggestions.length > 0) {
    lines.push('### Composition Suggestions')
    for (const s of allSuggestions.slice(0, 10)) {
      lines.push(`- ${s}`)
    }
  }

  if (weak.length > 0) {
    lines.push('')
    lines.push(`**Weak matches (${weak.length}):** ${weak.map(w => w.skill).join(', ')}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 2: SKILL COMPOSER ====================

function composeSkills(
  skills: ComposedSkill[],
  executionOrder: 'sequential' | 'parallel' | 'conditional' = 'sequential'
): WorkflowResult {
  const steps: WorkflowResult['composed_workflow']['steps'] = []
  const nodes: string[] = []
  const edges: WorkflowResult['dependency_graph']['edges'] = []
  const failurePoints: WorkflowResult['failure_points'] = []
  const hints: string[] = []

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i]
    const dependsOn: number[] = []

    if (executionOrder === 'sequential' && i > 0) {
      dependsOn.push(i - 1)
      edges.push({ from: skills[i - 1].name, to: skill.name, type: 'sequential' })
    } else if (executionOrder === 'conditional' && i > 0) {
      dependsOn.push(i - 1)
      edges.push({ from: skills[i - 1].name, to: skill.name, type: 'conditional' })
    }

    steps.push({
      order: i + 1,
      skill: skill.name,
      parameters: skill.parameters,
      depends_on: dependsOn,
      execution_mode: executionOrder === 'parallel' ? 'parallel' : executionOrder === 'conditional' ? 'conditional' : 'sequential'
    })
    nodes.push(skill.name)

    // Identify failure points
    if (skill.parameters.requires_auth || skill.parameters.external_api) {
      failurePoints.push({
        step: i + 1,
        skill: skill.name,
        risk: 'External dependency failure',
        mitigation: 'Add retry logic and fallback behavior'
      })
    }
    if (skill.parameters.input_schema && !skill.parameters.output_schema) {
      failurePoints.push({
        step: i + 1,
        skill: skill.name,
        risk: 'Schema mismatch between steps',
        mitigation: 'Add data validation and transformation layer'
      })
    }
  }

  // Optimization hints
  if (executionOrder === 'sequential' && skills.length > 3) {
    hints.push('Consider parallel execution for independent steps to reduce latency')
  }
  if (skills.length > 5) {
    hints.push('Large workflow detected — consider splitting into sub-workflows')
  }
  if (failurePoints.length > 0) {
    hints.push(`${failurePoints.length} failure point(s) identified — add error handling`)
  }
  const hasDataProcessing = skills.some(s => s.name.includes('data') || s.name.includes('transform'))
  const hasOutput = skills.some(s => s.name.includes('output') || s.name.includes('render') || s.name.includes('format'))
  if (hasDataProcessing && !hasOutput) {
    hints.push('Data processing detected without output step — add a rendering skill')
  }

  return {
    composed_workflow: {
      steps,
      total_steps: steps.length,
      estimated_duration: `${steps.length * 2}-${steps.length * 5}s`
    },
    dependency_graph: { nodes, edges },
    failure_points: failurePoints,
    optimization_hints: hints
  }
}

function formatCompositionReport(result: WorkflowResult): string {
  const lines: string[] = []
  lines.push('## Skill Composition Report')
  lines.push('')
  lines.push(`**Total Steps:** ${result.composed_workflow.total_steps}`)
  lines.push(`**Estimated Duration:** ${result.composed_workflow.estimated_duration}`)
  lines.push('')

  lines.push('### Workflow Steps')
  lines.push('| Step | Skill | Depends On | Mode |')
  lines.push('|------|-------|------------|------|')
  for (const step of result.composed_workflow.steps) {
    lines.push(`| ${step.order} | ${step.skill} | ${step.depends_on.length > 0 ? step.depends_on.join(', ') : 'none'} | ${step.execution_mode} |`)
  }
  lines.push('')

  if (result.dependency_graph.edges.length > 0) {
    lines.push('### Dependency Graph')
    for (const edge of result.dependency_graph.edges) {
      lines.push(`- ${edge.from} --[${edge.type}]--> ${edge.to}`)
    }
    lines.push('')
  }

  if (result.failure_points.length > 0) {
    lines.push('### Failure Points')
    for (const fp of result.failure_points) {
      lines.push(`- **Step ${fp.step} (${fp.skill}):** ${fp.risk} — ${fp.mitigation}`)
    }
    lines.push('')
  }

  if (result.optimization_hints.length > 0) {
    lines.push('### Optimization Hints')
    for (const hint of result.optimization_hints) {
      lines.push(`- ${hint}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: SKILL VERSION MANAGER ====================

function manageVersions(skillHistory: VersionEntry[]): VersionTreeResult {
  const tree: VersionTreeResult['version_tree'] = []
  const breakingChanges: VersionTreeResult['breaking_changes'] = []
  const upgradePath: VersionTreeResult['upgrade_path'] = []

  // Build version tree
  for (let i = 0; i < skillHistory.length; i++) {
    const entry = skillHistory[i]
    const parent = i > 0 ? skillHistory[i - 1].version : null
    const children = i < skillHistory.length - 1 ? [skillHistory[i + 1].version] : []

    tree.push({
      version: entry.version,
      date: entry.date,
      compatibility: entry.compatibility,
      children,
      parent
    })

    // Identify breaking changes
    if (entry.compatibility === 'breaking') {
      for (const change of entry.changes) {
        breakingChanges.push({
          version: entry.version,
          change,
          impact: change.includes('remove') || change.includes('delete') ? 'high' : change.includes('rename') ? 'medium' : 'low',
          migration_effort: change.includes('remove') ? 'High — requires code changes' : change.includes('rename') ? 'Medium — find and replace' : 'Low — minor adjustments'
        })
      }
    }

    // Build upgrade path
    if (i > 0) {
      const prev = skillHistory[i - 1]
      const steps: string[] = []
      if (entry.compatibility === 'breaking') {
        steps.push(`Review breaking changes in ${entry.version}`)
        steps.push('Update dependent code')
        steps.push('Run test suite')
      } else {
        steps.push(`Direct upgrade from ${prev.version} to ${entry.version}`)
      }
      steps.push('Validate with integration tests')

      upgradePath.push({
        from: prev.version,
        to: entry.version,
        steps,
        risk: entry.compatibility === 'breaking' ? 'high' : entry.compatibility === 'deprecated' ? 'medium' : 'low'
      })
    }
  }

  // Rollback readiness
  const latest = skillHistory[skillHistory.length - 1]
  const previous = skillHistory.length > 1 ? skillHistory[skillHistory.length - 2] : null
  const canRollback = previous !== null && latest.compatibility !== 'deprecated'
  const rollbackReadiness: VersionTreeResult['rollback_readiness'] = {
    can_rollback: canRollback,
    rollback_target: canRollback ? previous!.version : null,
    data_loss_risk: latest.compatibility === 'breaking' ? 'High — data format may have changed' : 'Low — backward compatible',
    steps: canRollback ? [
      `Pin version to ${previous!.version}`,
      'Restore previous skill definition',
      'Validate rollback with smoke tests',
      'Monitor for regressions'
    ] : ['No rollback target available']
  }

  return {
    version_tree: tree,
    breaking_changes: breakingChanges,
    upgrade_path: upgradePath,
    rollback_readiness: rollbackReadiness
  }
}

function formatVersionReport(result: VersionTreeResult): string {
  const lines: string[] = []
  lines.push('## Skill Version Management Report')
  lines.push('')

  lines.push('### Version Tree')
  lines.push('| Version | Date | Compatibility | Parent | Children |')
  lines.push('|---------|------|---------------|--------|----------|')
  for (const v of result.version_tree) {
    lines.push(`| ${v.version} | ${v.date} | ${v.compatibility} | ${v.parent ?? 'root'} | ${v.children.join(', ') || 'leaf'} |`)
  }
  lines.push('')

  if (result.breaking_changes.length > 0) {
    lines.push('### Breaking Changes')
    for (const bc of result.breaking_changes) {
      lines.push(`- **${bc.version}:** ${bc.change} (impact: ${bc.impact}, effort: ${bc.migration_effort})`)
    }
    lines.push('')
  }

  if (result.upgrade_path.length > 0) {
    lines.push('### Upgrade Path')
    for (const up of result.upgrade_path) {
      lines.push(`**${up.from} → ${up.to}** (risk: ${up.risk})`)
      for (const step of up.steps) {
        lines.push(`  - ${step}`)
      }
    }
    lines.push('')
  }

  lines.push('### Rollback Readiness')
  const rb = result.rollback_readiness
  lines.push(`- Can rollback: ${rb.can_rollback ? 'Yes' : 'No'}`)
  if (rb.rollback_target) {
    lines.push(`- Target: ${rb.rollback_target}`)
  }
  lines.push(`- Data loss risk: ${rb.data_loss_risk}`)
  for (const step of rb.steps) {
    lines.push(`- ${step}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: SKILL QUALITY SCORER ====================

function scoreSkillQuality(definition: SkillDefinition): QualityResult {
  const scores = {
    description_quality: 0,
    trigger_coverage: 0,
    instruction_clarity: 0,
    test_coverage: 0,
    naming_convention: 0
  }

  // Description quality (0-1)
  const descLen = definition.description.length
  if (descLen > 100) scores.description_quality = 0.9
  else if (descLen > 50) scores.description_quality = 0.7
  else if (descLen > 20) scores.description_quality = 0.5
  else scores.description_quality = 0.2

  // Trigger coverage (0-1)
  const triggerCount = definition.triggers?.length ?? 0
  if (triggerCount >= 5) scores.trigger_coverage = 0.95
  else if (triggerCount >= 3) scores.trigger_coverage = 0.75
  else if (triggerCount >= 1) scores.trigger_coverage = 0.5
  else scores.trigger_coverage = 0.0

  // Instruction clarity (0-1)
  const instrLen = definition.instructions.length
  const hasSteps = /step|first|then|finally|1\.|2\./i.test(definition.instructions)
  const hasExamples = /example|e\.g\.|for instance|such as/i.test(definition.instructions)
  if (instrLen > 200 && hasSteps && hasExamples) scores.instruction_clarity = 0.95
  else if (instrLen > 100 && hasSteps) scores.instruction_clarity = 0.75
  else if (instrLen > 50) scores.instruction_clarity = 0.55
  else scores.instruction_clarity = 0.25

  // Test coverage (0-1)
  const testCount = definition.tests?.length ?? 0
  if (testCount >= 5) scores.test_coverage = 0.95
  else if (testCount >= 3) scores.test_coverage = 0.75
  else if (testCount >= 1) scores.test_coverage = 0.45
  else scores.test_coverage = 0.0

  // Naming convention (0-1)
  const name = definition.name
  const isKebab = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)
  const isSnake = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(name)
  const isDescriptive = name.length >= 5 && name.length <= 40
  if ((isKebab || isSnake) && isDescriptive) scores.naming_convention = 0.95
  else if (isDescriptive) scores.naming_convention = 0.6
  else scores.naming_convention = 0.3

  // Overall scores
  const completeness = (
    scores.description_quality * 0.25 +
    scores.trigger_coverage * 0.25 +
    scores.instruction_clarity * 0.25 +
    scores.test_coverage * 0.25
  )

  const triggerAccuracy = scores.trigger_coverage * 0.6 + scores.description_quality * 0.4

  // Grade
  let grade: QualityResult['quality_grade']
  if (completeness >= 0.85) grade = 'A'
  else if (completeness >= 0.7) grade = 'B'
  else if (completeness >= 0.55) grade = 'C'
  else if (completeness >= 0.4) grade = 'D'
  else grade = 'F'

  // Improvement suggestions
  const suggestions: string[] = []
  if (scores.description_quality < 0.7) suggestions.push('Expand description to clearly explain purpose, inputs, and outputs')
  if (scores.trigger_coverage < 0.5) suggestions.push('Add more trigger patterns to improve discoverability')
  if (scores.instruction_clarity < 0.7) suggestions.push('Structure instructions with numbered steps and examples')
  if (scores.test_coverage < 0.5) suggestions.push('Add test cases covering happy path, edge cases, and error handling')
  if (scores.naming_convention < 0.7) suggestions.push('Use kebab-case or snake_case naming with descriptive names')
  if (suggestions.length === 0) suggestions.push('Skill is well-defined — consider adding advanced edge case tests')

  return {
    quality_grade: grade,
    completeness_score: Math.round(completeness * 100) / 100,
    trigger_accuracy: Math.round(triggerAccuracy * 100) / 100,
    improvement_suggestions: suggestions,
    detailed_scores: {
      description_quality: Math.round(scores.description_quality * 100) / 100,
      trigger_coverage: Math.round(scores.trigger_coverage * 100) / 100,
      instruction_clarity: Math.round(scores.instruction_clarity * 100) / 100,
      test_coverage: Math.round(scores.test_coverage * 100) / 100,
      naming_convention: Math.round(scores.naming_convention * 100) / 100
    }
  }
}

function formatQualityReport(result: QualityResult): string {
  const lines: string[] = []
  lines.push('## Skill Quality Assessment')
  lines.push('')
  lines.push(`**Overall Grade:** ${result.quality_grade}`)
  lines.push(`**Completeness Score:** ${(result.completeness_score * 100).toFixed(0)}%`)
  lines.push(`**Trigger Accuracy:** ${(result.trigger_accuracy * 100).toFixed(0)}%`)
  lines.push('')

  lines.push('### Detailed Scores')
  lines.push('| Dimension | Score |')
  lines.push('|-----------|-------|')
  lines.push(`| Description Quality | ${(result.detailed_scores.description_quality * 100).toFixed(0)}% |`)
  lines.push(`| Trigger Coverage | ${(result.detailed_scores.trigger_coverage * 100).toFixed(0)}% |`)
  lines.push(`| Instruction Clarity | ${(result.detailed_scores.instruction_clarity * 100).toFixed(0)}% |`)
  lines.push(`| Test Coverage | ${(result.detailed_scores.test_coverage * 100).toFixed(0)}% |`)
  lines.push(`| Naming Convention | ${(result.detailed_scores.naming_convention * 100).toFixed(0)}% |`)
  lines.push('')

  lines.push('### Improvement Suggestions')
  for (const s of result.improvement_suggestions) {
    lines.push(`- ${s}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: SKILL PACKAGER ====================

function packageSkill(
  skillCode: string,
  metadata: { name: string; version: string; author: string; dependencies?: string[] },
  format: 'dsh' | 'claude' | 'cursor' = 'dsh'
): PackagedSkill {
  const errors: string[] = []
  const warnings: string[] = []
  const formatNotes: string[] = []

  // Validation
  if (!skillCode || skillCode.trim().length === 0) {
    errors.push('Skill code is empty')
  }
  if (!metadata.name) {
    errors.push('Skill name is required')
  }
  if (!metadata.version) {
    errors.push('Version is required')
  }
  if (!metadata.author) {
    warnings.push('Author not specified')
  }

  // Check for common issues
  if (skillCode && skillCode.includes('console.log')) {
    warnings.push('Skill contains console.log statements — remove for production')
  }
  if (skillCode && !skillCode.includes('export')) {
    warnings.push('Skill code does not export anything — may not be importable')
  }

  // Format-specific packaging
  let packaged = ''
  const deps = metadata.dependencies ?? []

  if (format === 'dsh') {
    formatNotes.push('Packaged in DSH format (defineTool compatible)')
    formatNotes.push('Includes cordis.yml manifest for DSH runtime')
    packaged = JSON.stringify({
      format: 'dsh',
      metadata: { ...metadata, dependencies: deps },
      code: skillCode,
      manifest_version: '1.0'
    }, null, 2)
  } else if (format === 'claude') {
    formatNotes.push('Packaged in Claude Code skills format')
    formatNotes.push('Compatible with .claude/skills/ directory structure')
    packaged = JSON.stringify({
      format: 'claude',
      name: metadata.name,
      version: metadata.version,
      description: `Skill: ${metadata.name}`,
      content: skillCode,
      dependencies: deps
    }, null, 2)
  } else if (format === 'cursor') {
    formatNotes.push('Packaged in Cursor rules format (.cursorrules compatible)')
    formatNotes.push('Can be placed in .cursor/rules/ directory')
    packaged = JSON.stringify({
      format: 'cursor',
      metadata: { name: metadata.name, version: metadata.version },
      rules: skillCode,
      dependencies: deps
    }, null, 2)
  }

  // Generate checksum (simple hash)
  const checksum = simpleHash(packaged)
  const sizeBytes = new TextEncoder().encode(packaged).length

  const valid = errors.length === 0
  const marketplaceReady = valid && warnings.length === 0 && metadata.author !== undefined

  return {
    packaged_skill: packaged,
    manifest: {
      name: metadata.name,
      version: metadata.version,
      author: metadata.author,
      dependencies: deps,
      format,
      checksum,
      size_bytes: sizeBytes,
      created_at: new Date().toISOString()
    },
    validation_result: { valid, errors, warnings },
    marketplace_ready: marketplaceReady,
    format_notes: formatNotes
  }
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

function formatPackagerReport(result: PackagedSkill): string {
  const lines: string[] = []
  lines.push('## Skill Packaging Report')
  lines.push('')
  lines.push(`**Format:** ${result.manifest.format}`)
  lines.push(`**Name:** ${result.manifest.name}`)
  lines.push(`**Version:** ${result.manifest.version}`)
  lines.push(`**Author:** ${result.manifest.author}`)
  lines.push(`**Size:** ${result.manifest.size_bytes} bytes`)
  lines.push(`**Checksum:** ${result.manifest.checksum}`)
  lines.push(`**Marketplace Ready:** ${result.marketplace_ready ? 'Yes' : 'No'}`)
  lines.push('')

  lines.push('### Validation')
  lines.push(`- Valid: ${result.validation_result.valid ? 'Yes' : 'No'}`)
  if (result.validation_result.errors.length > 0) {
    lines.push('- **Errors:**')
    for (const e of result.validation_result.errors) {
      lines.push(`  - ${e}`)
    }
  }
  if (result.validation_result.warnings.length > 0) {
    lines.push('- **Warnings:**')
    for (const w of result.validation_result.warnings) {
      lines.push(`  - ${w}`)
    }
  }
  lines.push('')

  if (result.manifest.dependencies.length > 0) {
    lines.push('### Dependencies')
    for (const dep of result.manifest.dependencies) {
      lines.push(`- ${dep}`)
    }
    lines.push('')
  }

  lines.push('### Format Notes')
  for (const note of result.format_notes) {
    lines.push(`- ${note}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: TRIGGER OPTIMIZER ====================

function optimizeTriggers(
  triggerPatterns: TriggerPattern[],
  falsePositiveLog: FalsePositiveEntry[]
): OptimizedTriggerResult {
  const optimized: OptimizedTriggerResult['optimized_triggers'] = []
  let totalPrecisionGain = 0
  let totalRecallGain = 0

  for (const tp of triggerPatterns) {
    const relatedFPs = falsePositiveLog.filter(fp => fp.pattern === tp.pattern)
    const fpCount = relatedFPs.filter(fp => !fp.expected_match && fp.actual_match).length
    const fnCount = relatedFPs.filter(fp => fp.expected_match && !fp.actual_match).length

    let optimizedPattern = tp.pattern
    let expectedPrecision = 0.8
    let expectedRecall = 0.7

    if (fpCount > 2) {
      // Too many false positives — make pattern more specific
      if (tp.type === 'keyword') {
        optimizedPattern = `\\b${tp.pattern}\\b`
      } else if (tp.type === 'regex') {
        optimizedPattern = tp.pattern.replace(/.*/g, '(?:^|\\s)')
      }
      expectedPrecision = Math.min(0.95, 0.8 + fpCount * 0.03)
      expectedRecall = Math.max(0.5, 0.7 - fpCount * 0.02)
      totalPrecisionGain += expectedPrecision - 0.8
    } else if (fnCount > 2) {
      // Too many false negatives — make pattern more general
      if (tp.type === 'keyword') {
        optimizedPattern = `${tp.pattern}*`
      } else if (tp.type === 'regex') {
        optimizedPattern = tp.pattern.replace(/\\b/g, '').replace(/\s+/g, '\\s*')
      }
      expectedPrecision = Math.max(0.6, 0.8 - fnCount * 0.02)
      expectedRecall = Math.min(0.95, 0.7 + fnCount * 0.03)
      totalRecallGain += expectedRecall - 0.7
    } else {
      expectedPrecision = 0.85
      expectedRecall = 0.75
    }

    optimized.push({
      original: tp.pattern,
      optimized: optimizedPattern,
      type: tp.type,
      expected_precision: Math.round(expectedPrecision * 100) / 100,
      expected_recall: Math.round(expectedRecall * 100) / 100
    })
  }

  const avgPrecisionImprovement = triggerPatterns.length > 0 ? totalPrecisionGain / triggerPatterns.length : 0
  const avgRecallImprovement = triggerPatterns.length > 0 ? totalRecallGain / triggerPatterns.length : 0

  const shouldTest = optimized.some(o => o.original !== o.optimized)

  return {
    optimized_triggers: optimized,
    precision_improvement: Math.round(avgPrecisionImprovement * 100) / 100,
    recall_improvement: Math.round(avgRecallImprovement * 100) / 100,
    ab_test_recommendation: {
      should_test: shouldTest,
      test_name: 'trigger_optimization_v1',
      control_group: triggerPatterns.map(tp => tp.pattern),
      variant_group: optimized.map(o => o.optimized),
      success_metric: 'f1_score',
      duration_days: 14,
      min_sample_size: 200
    }
  }
}

function formatTriggerReport(result: OptimizedTriggerResult): string {
  const lines: string[] = []
  lines.push('## Trigger Optimization Report')
  lines.push('')
  lines.push(`**Precision Improvement:** +${(result.precision_improvement * 100).toFixed(1)}%`)
  lines.push(`**Recall Improvement:** +${(result.recall_improvement * 100).toFixed(1)}%`)
  lines.push('')

  lines.push('### Optimized Triggers')
  lines.push('| Original | Optimized | Type | Exp. Precision | Exp. Recall |')
  lines.push('|----------|-----------|------|----------------|-------------|')
  for (const t of result.optimized_triggers) {
    lines.push(`| ${t.original} | ${t.optimized} | ${t.type} | ${(t.expected_precision * 100).toFixed(0)}% | ${(t.expected_recall * 100).toFixed(0)}% |`)
  }
  lines.push('')

  const ab = result.ab_test_recommendation
  lines.push('### A/B Test Recommendation')
  lines.push(`- Should test: ${ab.should_test ? 'Yes' : 'No'}`)
  if (ab.should_test) {
    lines.push(`- Test name: ${ab.test_name}`)
    lines.push(`- Success metric: ${ab.success_metric}`)
    lines.push(`- Duration: ${ab.duration_days} days`)
    lines.push(`- Min sample size: ${ab.min_sample_size}`)
    lines.push(`- Control: ${ab.control_group.join(', ')}`)
    lines.push(`- Variant: ${ab.variant_group.join(', ')}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: SKILL ANALYTICS ====================

function analyzeSkillUsage(usageData: UsageEntry[]): AnalyticsResult {
  // Popularity ranking
  const sorted = [...usageData].sort((a, b) => b.trigger_count - a.trigger_count)
  const popularityRanking = sorted.map((entry, idx) => ({
    rank: idx + 1,
    skill_name: entry.skill_name,
    trigger_count: entry.trigger_count,
    trend: entry.trigger_count > 100 ? 'rising' as const : entry.trigger_count > 20 ? 'stable' as const : 'declining' as const
  }))

  // Success rate
  const successRates = usageData.map(entry => {
    const rate = entry.trigger_count > 0 ? entry.success_count / entry.trigger_count : 0
    const n = entry.trigger_count
    const z = 1.96
    const margin = n > 0 ? z * Math.sqrt((rate * (1 - rate)) / n) : 0
    return {
      skill_name: entry.skill_name,
      rate: Math.round(rate * 100) / 100,
      total_invocations: entry.trigger_count,
      confidence_interval: [
        Math.round(Math.max(0, rate - margin) * 100) / 100,
        Math.round(Math.min(1, rate + margin) * 100) / 100
      ] as [number, number]
    }
  }).sort((a, b) => b.rate - a.rate)

  // Abandonment points
  const abandonmentPoints: AnalyticsResult['abandonment_points'] = []
  for (const entry of usageData) {
    const rate = entry.trigger_count > 0 ? entry.success_count / entry.trigger_count : 0
    if (rate < 0.5) {
      abandonmentPoints.push({
        skill_name: entry.skill_name,
        stage: 'execution',
        abandonment_rate: Math.round((1 - rate) * 100) / 100,
        likely_cause: 'High failure rate during execution — check error handling'
      })
    }
    if (entry.avg_duration > 10000) {
      abandonmentPoints.push({
        skill_name: entry.skill_name,
        stage: 'completion',
        abandonment_rate: 0.3,
        likely_cause: 'Long execution time — users may timeout or cancel'
      })
    }
  }

  // Improvement priorities
  const priorities: AnalyticsResult['improvement_priorities'] = []
  for (const entry of usageData) {
    const rate = entry.trigger_count > 0 ? entry.success_count / entry.trigger_count : 0
    if (rate < 0.6) {
      priorities.push({
        skill_name: entry.skill_name,
        priority: rate < 0.3 ? 1 : 2,
        issue: `Low success rate (${(rate * 100).toFixed(0)}%)`,
        recommended_action: 'Review failure logs and improve error handling',
        expected_impact: 'High — could double success rate'
      })
    }
    if (entry.trigger_count < 10 && entry.avg_duration > 5000) {
      priorities.push({
        skill_name: entry.skill_name,
        priority: 3,
        issue: 'Low usage with high latency',
        recommended_action: 'Optimize performance and improve discoverability',
        expected_impact: 'Medium — could increase adoption'
      })
    }
  }
  priorities.sort((a, b) => a.priority - b.priority)

  return {
    popularity_ranking: popularityRanking,
    success_rate: successRates,
    abandonment_points: abandonmentPoints,
    improvement_priorities: priorities
  }
}

function formatAnalyticsReport(result: AnalyticsResult): string {
  const lines: string[] = []
  lines.push('## Skill Analytics Report')
  lines.push('')

  lines.push('### Popularity Ranking')
  lines.push('| Rank | Skill | Triggers | Trend |')
  lines.push('|------|-------|----------|-------|')
  for (const p of result.popularity_ranking.slice(0, 15)) {
    lines.push(`| ${p.rank} | ${p.skill_name} | ${p.trigger_count} | ${p.trend} |`)
  }
  lines.push('')

  lines.push('### Success Rates')
  lines.push('| Skill | Rate | Invocations | 95% CI |')
  lines.push('|-------|------|-------------|--------|')
  for (const s of result.success_rate.slice(0, 15)) {
    lines.push(`| ${s.skill_name} | ${(s.rate * 100).toFixed(0)}% | ${s.total_invocations} | [${(s.confidence_interval[0] * 100).toFixed(0)}%-${(s.confidence_interval[1] * 100).toFixed(0)}%] |`)
  }
  lines.push('')

  if (result.abandonment_points.length > 0) {
    lines.push('### Abandonment Points')
    for (const a of result.abandonment_points) {
      lines.push(`- **${a.skill_name}** (${a.stage}): ${(a.abandonment_rate * 100).toFixed(0)}% — ${a.likely_cause}`)
    }
    lines.push('')
  }

  if (result.improvement_priorities.length > 0) {
    lines.push('### Improvement Priorities')
    for (const p of result.improvement_priorities) {
      lines.push(`- **[P${p.priority}] ${p.skill_name}:** ${p.issue} → ${p.recommended_action} (impact: ${p.expected_impact})`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: SKILL TEMPLATE GENERATOR ====================

function generateTemplate(
  domain: string,
  complexity: 'simple' | 'moderate' | 'complex',
  standards?: string[]
): TemplateResult {
  const domainLower = domain.toLowerCase()

  // Base template structure
  const parameters: TemplateResult['skill_template']['parameters'] = {
    input: { type: 'string', required: true, description: `Input data for the ${domain} skill` }
  }

  if (complexity === 'moderate' || complexity === 'complex') {
    parameters['options'] = { type: 'string', required: false, description: 'JSON object with configuration options' }
    parameters['format'] = { type: 'string', required: false, description: 'Output format (json, text, markdown)' }
  }
  if (complexity === 'complex') {
    parameters['context'] = { type: 'string', required: false, description: 'Additional context for processing' }
    parameters['constraints'] = { type: 'string', required: false, description: 'Processing constraints and limits' }
  }

  const triggers: string[] = []
  if (domainLower.includes('data') || domainLower.includes('analytics')) {
    triggers.push('analyze data', 'process data', 'data transformation', 'extract insights')
  } else if (domainLower.includes('code') || domainLower.includes('dev')) {
    triggers.push('write code', 'refactor', 'debug', 'code review', 'implement')
  } else if (domainLower.includes('content') || domainLower.includes('writing')) {
    triggers.push('write content', 'draft', 'edit', 'generate text', 'rewrite')
  } else if (domainLower.includes('research') || domainLower.includes('search')) {
    triggers.push('research', 'find information', 'search', 'investigate', 'look up')
  } else {
    triggers.push(`handle ${domain}`, `process ${domain}`, `${domain} task`, `${domain} request`)
  }

  const instructions = complexity === 'simple'
    ? `1. Receive input\n2. Process according to ${domain} rules\n3. Return result`
    : complexity === 'moderate'
      ? `1. Parse and validate input\n2. Apply ${domain} processing logic\n3. Handle edge cases\n4. Format and return output\n5. Log any warnings`
      : `1. Parse input, options, and context\n2. Validate all parameters against schema\n3. Apply ${domain} processing with constraint checking\n4. Handle edge cases and error conditions\n5. Transform output to requested format\n6. Validate output quality\n7. Return result with metadata`

  // Test cases
  const testCases: TemplateResult['test_cases'] = [
    {
      name: 'Basic happy path',
      input: { input: `Sample ${domain} input` },
      expected_output: `Processed ${domain} output`,
      category: 'happy_path'
    },
    {
      name: 'Empty input handling',
      input: { input: '' },
      expected_output: 'Error: input is required',
      category: 'error_handling'
    }
  ]

  if (complexity !== 'simple') {
    testCases.push({
      name: 'Options parsing',
      input: { input: 'Test input', options: '{"format": "json"}' },
      expected_output: 'JSON formatted output',
      category: 'happy_path'
    })
    testCases.push({
      name: 'Invalid options',
      input: { input: 'Test input', options: 'not-valid-json' },
      expected_output: 'Error: invalid options JSON',
      category: 'error_handling'
    })
  }

  if (complexity === 'complex') {
    testCases.push({
      name: 'Context-aware processing',
      input: { input: 'Test input', context: 'Additional context', constraints: '{"max_length": 100}' },
      expected_output: 'Context-aware output within constraints',
      category: 'happy_path'
    })
    testCases.push({
      name: 'Constraint violation',
      input: { input: 'Very long input...', constraints: '{"max_length": 10}' },
      expected_output: 'Error: input exceeds max_length constraint',
      category: 'edge_case'
    })
  }

  // Documentation outline
  const docOutline: TemplateResult['documentation_outline'] = [
    { section: 'Overview', content_description: `What ${domain} skill does and when to use it`, required: true },
    { section: 'Parameters', content_description: 'Detailed description of each parameter', required: true },
    { section: 'Usage Examples', content_description: 'Common usage patterns with code samples', required: true },
    { section: 'Return Value', content_description: 'Output format and structure', required: true }
  ]

  if (complexity !== 'simple') {
    docOutline.push({ section: 'Configuration', content_description: 'Options and their effects', required: true })
    docOutline.push({ section: 'Error Handling', content_description: 'Error types and recovery strategies', required: false })
  }
  if (complexity === 'complex') {
    docOutline.push({ section: 'Advanced Usage', content_description: 'Complex scenarios and edge cases', required: false })
    docOutline.push({ section: 'Performance', content_description: 'Latency and resource considerations', required: false })
    docOutline.push({ section: 'Constraints', content_description: 'Limitations and constraint handling', required: false })
  }

  // Publishing checklist
  const checklist: TemplateResult['publishing_checklist'] = [
    { item: 'Skill name follows naming convention', status: 'required', description: 'Use kebab-case, descriptive name' },
    { item: 'Description is clear and complete', status: 'required', description: 'Explain what, why, and when to use' },
    { item: 'All parameters documented', status: 'required', description: 'Type, required/optional, description' },
    { item: 'At least one test case', status: 'required', description: 'Happy path test minimum' },
    { item: 'Error handling implemented', status: 'recommended', description: 'Graceful failure with clear messages' },
    { item: 'Triggers defined', status: 'recommended', description: 'At least 3 trigger patterns' }
  ]

  if (complexity !== 'simple') {
    checklist.push({ item: 'Edge case tests', status: 'recommended', description: 'Boundary conditions covered' })
    checklist.push({ item: 'Performance benchmarks', status: 'optional', description: 'Expected latency documented' })
  }
  if (complexity === 'complex') {
    checklist.push({ item: 'Integration tests', status: 'recommended', description: 'End-to-end workflow tests' })
    checklist.push({ item: 'Security review', status: 'required', description: 'Input validation and sanitization' })
    checklist.push({ item: 'Rate limiting documented', status: 'optional', description: 'Usage limits and throttling' })
  }

  // Apply standards if provided
  if (standards && standards.length > 0) {
    for (const standard of standards) {
      checklist.push({
        item: `Compliance: ${standard}`,
        status: 'required',
        description: `Meets ${standard} standard requirements`
      })
    }
  }

  return {
    skill_template: {
      name: `${domain}-skill`,
      description: `A ${complexity} skill for ${domain} operations`,
      triggers,
      parameters,
      instructions,
      output_schema: { type: 'string' }
    },
    test_cases: testCases,
    documentation_outline: docOutline,
    publishing_checklist: checklist
  }
}

function formatTemplateReport(result: TemplateResult): string {
  const lines: string[] = []
  lines.push('## Skill Template')
  lines.push('')
  lines.push(`**Name:** ${result.skill_template.name}`)
  lines.push(`**Description:** ${result.skill_template.description}`)
  lines.push(`**Triggers:** ${result.skill_template.triggers.join(', ')}`)
  lines.push('')

  lines.push('### Parameters')
  lines.push('| Name | Type | Required | Description |')
  lines.push('|------|------|----------|-------------|')
  for (const [name, param] of Object.entries(result.skill_template.parameters)) {
    lines.push(`| ${name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |`)
  }
  lines.push('')

  lines.push('### Instructions')
  lines.push(result.skill_template.instructions)
  lines.push('')

  lines.push('### Test Cases')
  lines.push('| Name | Category | Input | Expected Output |')
  lines.push('|------|----------|-------|-----------------|')
  for (const tc of result.test_cases) {
    lines.push(`| ${tc.name} | ${tc.category} | ${JSON.stringify(tc.input)} | ${tc.expected_output} |`)
  }
  lines.push('')

  lines.push('### Documentation Outline')
  for (const doc of result.documentation_outline) {
    lines.push(`- **${doc.section}** ${doc.required ? '(required)' : '(optional)'}: ${doc.content_description}`)
  }
  lines.push('')

  lines.push('### Publishing Checklist')
  for (const item of result.publishing_checklist) {
    const icon = item.status === 'required' ? '[REQ]' : item.status === 'recommended' ? '[REC]' : '[OPT]'
    lines.push(`- ${icon} ${item.item}: ${item.description}`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Skill Discoverer
  tools.register(defineTool({
    name: 'skill_discoverer',
    description: 'Discover and match skills to a task description using semantic analysis. Returns relevance scores, trigger confidence, and composition suggestions for available skills.',
    parameters: {
      task_description: { type: 'string', required: true, description: 'Natural language description of the task to find skills for' },
      available_skills: { type: 'string', required: true, description: 'JSON array of skill objects with fields: name, description, category, triggers (array of strings)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { task_description: string; available_skills: string }) {
      const skills: SkillEntry[] = JSON.parse(args.available_skills)
      const results = discoverSkills(args.task_description, skills)
      return formatDiscoveryReport(results, args.task_description)
    }
  }))

  // Tool 2: Skill Composer
  tools.register(defineTool({
    name: 'skill_composer',
    description: 'Compose multiple skills into a coordinated workflow. Generates dependency graphs, identifies failure points, and provides optimization hints for skill chains.',
    parameters: {
      skills: { type: 'string', required: true, description: 'JSON array of skill objects with fields: name, parameters (object of key-value pairs)' },
      execution_order: { type: 'string', description: 'Execution strategy: "sequential" (default), "parallel", or "conditional"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { skills: string; execution_order?: string }) {
      const skills: ComposedSkill[] = JSON.parse(args.skills)
      const order = (args.execution_order as 'sequential' | 'parallel' | 'conditional') ?? 'sequential'
      const result = composeSkills(skills, order)
      return formatCompositionReport(result)
    }
  }))

  // Tool 3: Skill Version Manager
  tools.register(defineTool({
    name: 'skill_version_manager',
    description: 'Manage skill versioning with version trees, breaking change detection, upgrade paths, and rollback readiness assessment.',
    parameters: {
      skill_history: { type: 'string', required: true, description: 'JSON array of version entries with fields: version (semver), changes (string array), date (ISO date), compatibility ("compatible"|"breaking"|"deprecated")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { skill_history: string }) {
      const history: VersionEntry[] = JSON.parse(args.skill_history)
      const result = manageVersions(history)
      return formatVersionReport(result)
    }
  }))

  // Tool 4: Skill Quality Scorer
  tools.register(defineTool({
    name: 'skill_quality_scorer',
    description: 'Score skill quality across multiple dimensions: completeness, trigger accuracy, instruction clarity, test coverage, and naming conventions. Returns letter grade and improvement suggestions.',
    parameters: {
      skill_definition: { type: 'string', required: true, description: 'JSON object with fields: name, description, triggers (string array), instructions, tests (optional string array)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { skill_definition: string }) {
      const definition: SkillDefinition = JSON.parse(args.skill_definition)
      const result = scoreSkillQuality(definition)
      return formatQualityReport(result)
    }
  }))

  // Tool 5: Skill Packager
  tools.register(defineTool({
    name: 'skill_packager',
    description: 'Package skills for distribution in multiple formats (DSH, Claude Code, Cursor). Generates manifests, validates structure, and checks marketplace readiness.',
    parameters: {
      skill_code: { type: 'string', required: true, description: 'The skill source code or definition as a string' },
      metadata: { type: 'string', required: true, description: 'JSON object with fields: name, version, author, dependencies (optional string array)' },
      format: { type: 'string', description: 'Target format: "dsh" (default), "claude", or "cursor"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { skill_code: string; metadata: string; format?: string }) {
      const meta = JSON.parse(args.metadata)
      const fmt = (args.format as 'dsh' | 'claude' | 'cursor') ?? 'dsh'
      const result = packageSkill(args.skill_code, meta, fmt)
      return formatPackagerReport(result)
    }
  }))

  // Tool 6: Trigger Optimizer
  tools.register(defineTool({
    name: 'trigger_optimizer',
    description: 'Optimize trigger patterns to reduce false positives and false negatives. Provides precision/recall improvements and A/B test recommendations.',
    parameters: {
      trigger_patterns: { type: 'string', required: true, description: 'JSON array of trigger pattern objects with fields: pattern, type ("keyword"|"regex"|"semantic"|"contextual"), weight (number)' },
      false_positive_log: { type: 'string', required: true, description: 'JSON array of false positive entries with fields: pattern, context, expected_match (bool), actual_match (bool)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { trigger_patterns: string; false_positive_log: string }) {
      const patterns: TriggerPattern[] = JSON.parse(args.trigger_patterns)
      const fpLog: FalsePositiveEntry[] = JSON.parse(args.false_positive_log)
      const result = optimizeTriggers(patterns, fpLog)
      return formatTriggerReport(result)
    }
  }))

  // Tool 7: Skill Analytics
  tools.register(defineTool({
    name: 'skill_analytics',
    description: 'Analyze skill usage data to generate popularity rankings, success rates, abandonment points, and improvement priorities.',
    parameters: {
      usage_data: { type: 'string', required: true, description: 'JSON array of usage entries with fields: skill_name, trigger_count, success_count, avg_duration (ms)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { usage_data: string }) {
      const data: UsageEntry[] = JSON.parse(args.usage_data)
      const result = analyzeSkillUsage(data)
      return formatAnalyticsReport(result)
    }
  }))

  // Tool 8: Skill Template Generator
  tools.register(defineTool({
    name: 'skill_template_generator',
    description: 'Generate skill templates for a given domain and complexity level. Includes test cases, documentation outlines, and publishing checklists.',
    parameters: {
      domain: { type: 'string', required: true, description: 'The domain or category for the skill (e.g., "data analysis", "code generation", "content writing")' },
      complexity: { type: 'string', required: true, description: 'Complexity level: "simple", "moderate", or "complex"' },
      standards: { type: 'string', description: 'Optional JSON array of compliance standards to include in the checklist' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { domain: string; complexity: string; standards?: string }) {
      const stds = args.standards ? JSON.parse(args.standards) : undefined
      const result = generateTemplate(args.domain, args.complexity as 'simple' | 'moderate' | 'complex', stds)
      return formatTemplateReport(result)
    }
  }))

  console.log(`[dsh-tool-skills] Loaded v${VERSION} — Agent Skills Marketplace with 8 tools`)
  console.log('  Tools: skill_discoverer, skill_composer, skill_version_manager, skill_quality_scorer, skill_packager, trigger_optimizer, skill_analytics, skill_template_generator')
}
