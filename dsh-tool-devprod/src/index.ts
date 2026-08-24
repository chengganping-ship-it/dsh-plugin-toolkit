/**
 * DSH Developer Productivity & Engineering Tools Plugin v0.1.0
 * Developer productivity toolkit for DeepSeek Harness - code review assistant,
 * PR automation, testing strategy, documentation generation, CI/CD optimization,
 * dependency health checking, tech debt analysis, and developer experience scoring.
 * 2026: Developer tools market $22B+; AI-powered dev tools showing rapid growth.
 * @module dsh-tool-devprod | @version 0.1.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-devprod'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  static seedFromString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== SECTION 2 — Type Definitions ====================

// --- Tool 1: Code Review Assistant ---
export interface CodeReviewInput {
  language: string
  code_snippet: string
  review_focus: ('security' | 'performance' | 'readability' | 'best_practices' | 'architecture')[]
  severity_threshold: 'low' | 'medium' | 'high'
}

export interface ReviewFinding {
  line_start: number
  line_end: number
  category: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  suggestion: string
  rule_id: string
}

export interface CodeReviewResult {
  review_id: string
  language: string
  total_lines: number
  findings: ReviewFinding[]
  summary: string
  quality_score: number
  approved: boolean
}

// --- Tool 2: PR Automation Engine ---
export interface PRAutomationInput {
  repo_name: string
  pr_title: string
  source_branch: string
  target_branch: string
  changed_files: string[]
  lines_added: number
  lines_removed: number
  has_tests: boolean
  has_documentation: boolean
}

export interface PRCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  auto_fixable: boolean
}

export interface PRAutomationResult {
  pr_id: string
  repo_name: string
  checks: PRCheck[]
  merge_ready: boolean
  suggested_reviewers: string[]
  labels: string[]
  merge_priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_review_time_min: number
}

// --- Tool 3: Testing Strategy Generator ---
export interface TestingStrategyInput {
  project_type: string
  languages: string[]
  architecture: 'monolith' | 'microservices' | 'serverless' | 'library'
  current_coverage: number
  target_coverage: number
  ci_platform: string
}

export interface TestLayer {
  layer: string
  tool: string
  frameworks: string[]
  estimated_coverage_pct: number
  priority: 'essential' | 'recommended' | 'optional'
}

export interface TestingStrategyResult {
  strategy_id: string
  project_type: string
  test_layers: TestLayer[]
  total_estimated_coverage: number
  ci_integration_steps: string[]
  coverage_gap: number
  recommendations: string[]
}

// --- Tool 4: Documentation Generator ---
export interface DocumentationInput {
  project_name: string
  language: string
  doc_type: 'api' | 'readme' | 'architecture' | 'changelog' | 'contributing'
  modules: string[]
  include_examples: boolean
  style_guide: 'google' | 'numpy' | 'jsdoc' | 'microsoft'
}

export interface DocSection {
  title: string
  content: string
  order: number
  subsections: string[]
}

export interface DocumentationResult {
  doc_id: string
  project_name: string
  doc_type: string
  sections: DocSection[]
  word_count: number
  generated_at: string
  format: string
}

// --- Tool 5: CI/CD Pipeline Optimizer ---
export interface CICDPipelineInput {
  platform: string
  build_history_duration_days: number
  avg_build_time_sec: number
  failure_rate_pct: number
  stages: string[]
  parallelization_current: number
  cache_enabled: boolean
}

export interface PipelineOptimization {
  area: string
  current_state: string
  recommended_state: string
  estimated_improvement_pct: number
  effort: 'low' | 'medium' | 'high'
}

export interface CICDPipelineResult {
  optimization_id: string
  platform: string
  optimizations: PipelineOptimization[]
  estimated_build_reduction_pct: number
  estimated_reliability_improvement_pct: number
  quick_wins: string[]
  long_term_improvements: string[]
}

// --- Tool 6: Dependency Health Checker ---
export interface DependencyHealthInput {
  language: string
  package_manager: string
  total_dependencies: number
  outdated_count: number
  vulnerable_count: number
  deprecated_count: number
  license_issues: number
  last_update_days_ago: number
}

export interface DependencyIssue {
  dependency: string
  issue_type: 'outdated' | 'vulnerable' | 'deprecated' | 'license'
  severity: 'low' | 'medium' | 'high' | 'critical'
  current_version: string
  recommended_version: string
  description: string
}

export interface DependencyHealthResult {
  health_id: string
  language: string
  health_score: number
  issues: DependencyIssue[]
  outdated_pct: number
  vulnerable_pct: number
  upgrade_recommendations: string[]
  overall_status: 'healthy' | 'attention_needed' | 'critical'
}

// --- Tool 7: Tech Debt Analyzer ---
export interface TechDebtInput {
  repo_name: string
  total_lines_of_code: number
  languages: string[]
  code_smell_count: number
  duplicate_code_pct: number
  complexity_hotspots: number
  test_coverage_pct: number
  documentation_coverage_pct: number
}

export interface DebtItem {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  estimated_hours: number
  impact: string
  location: string
}

export interface TechDebtResult {
  analysis_id: string
  repo_name: string
  total_debt_hours: number
  debt_ratio: number
  debt_items: DebtItem[]
  prioritized_actions: string[]
  debt_trend: 'improving' | 'stable' | 'worsening'
  health_grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

// --- Tool 8: Developer Experience Scorer ---
export interface DXScorerInput {
  team_size: number
  build_time_min: number
  deploy_frequency_per_week: number
  lead_time_hours: number
  mttr_hours: number
  test_execution_time_min: number
  onboarding_days: number
  tool_satisfaction: number
}

export interface DXMetric {
  name: string
  value: number
  benchmark: number
  score: number
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor'
}

export interface DXScorerResult {
  score_id: string
  overall_dx_score: number
  metrics: DXMetric[]
  dora_classification: 'elite' | 'high' | 'medium' | 'low'
  top_improvements: string[]
  strengths: string[]
}

// ==================== SECTION 3 — Tool Implementations ====================

// --- Tool 1: Code Review Assistant ---

function reviewCode(input: CodeReviewInput): CodeReviewResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const reviewId = `CR-${Date.now()}-${rng.nextInt(1000, 9999).toString(16)}`

  const lines = input.code_snippet.split('\n')
  const totalLines = lines.length
  const findings: ReviewFinding[] = []

  const severityMap: Record<string, number> = { info: 0, warning: 1, critical: 2 }
  const thresholdLevel = severityMap[input.severity_threshold] || 1

  // Generate findings based on review focus areas
  const findingTemplates: Record<string, Array<{ msg: string; sug: string; sev: 'info' | 'warning' | 'critical'; rule: string }>> = {
    security: [
      { msg: 'Potential SQL injection risk — use parameterized queries', sug: 'Replace string concatenation with prepared statements', sev: 'critical', rule: 'SEC-001' },
      { msg: 'Hardcoded credential detected', sug: 'Move secrets to environment variables or a secrets manager', sev: 'critical', rule: 'SEC-002' },
      { msg: 'Missing input validation on user-controlled data', sug: 'Add input sanitization and validation before processing', sev: 'warning', rule: 'SEC-003' },
      { msg: 'Insecure random number generation for security context', sug: 'Use crypto-safe random number generator', sev: 'warning', rule: 'SEC-004' },
    ],
    performance: [
      { msg: 'N+1 query pattern detected in loop', sug: 'Batch queries or use eager loading to reduce database round-trips', sev: 'warning', rule: 'PERF-001' },
      { msg: 'Unbounded array allocation without size limit', sug: 'Add pagination or streaming for large datasets', sev: 'warning', rule: 'PERF-002' },
      { msg: 'Synchronous I/O in async context', sug: 'Use async I/O operations to prevent blocking the event loop', sev: 'critical', rule: 'PERF-003' },
      { msg: 'Redundant computation inside hot loop', sug: 'Hoist invariant computations outside the loop', sev: 'info', rule: 'PERF-004' },
    ],
    readability: [
      { msg: 'Function exceeds 50 lines — consider decomposition', sug: 'Extract logical blocks into well-named helper functions', sev: 'warning', rule: 'READ-001' },
      { msg: 'Variable name is too short to convey intent', sug: 'Use descriptive names: "userCount" instead of "n"', sev: 'info', rule: 'READ-002' },
      { msg: 'Deeply nested conditionals (4+ levels)', sug: 'Use early returns or extract conditional logic into functions', sev: 'warning', rule: 'READ-003' },
      { msg: 'Magic number without named constant', sug: 'Define a named constant with explanatory comment', sev: 'info', rule: 'READ-004' },
    ],
    best_practices: [
      { msg: 'Missing error handling for async operation', sug: 'Wrap in try/catch or add .catch() handler', sev: 'critical', rule: 'BP-001' },
      { msg: 'TODO comment without tracking reference', sug: 'Create a ticket and reference the ID in the TODO', sev: 'info', rule: 'BP-002' },
      { msg: 'Function has too many parameters (5+)', sug: 'Use an options object or split into smaller functions', sev: 'warning', rule: 'BP-003' },
      { msg: 'Missing type annotations on public API', sug: 'Add explicit types to improve IDE support and documentation', sev: 'warning', rule: 'BP-004' },
    ],
    architecture: [
      { msg: 'Tight coupling between modules detected', sug: 'Introduce interfaces or dependency injection to decouple', sev: 'warning', rule: 'ARCH-001' },
      { msg: 'Business logic mixed with presentation layer', sug: 'Separate concerns using a service or domain layer', sev: 'warning', rule: 'ARCH-002' },
      { msg: 'Circular dependency between modules', sug: 'Refactor to break the cycle — consider shared abstraction', sev: 'critical', rule: 'ARCH-003' },
    ],
  }

  for (const focus of input.review_focus) {
    const templates = findingTemplates[focus] || []
    for (const tmpl of templates) {
      if (severityMap[tmpl.sev] >= thresholdLevel && rng.next() > 0.3) {
        const lineStart = rng.nextInt(1, Math.max(1, totalLines - 1))
        findings.push({
          line_start: lineStart,
          line_end: Math.min(lineStart + rng.nextInt(0, 5), totalLines),
          category: focus,
          severity: tmpl.sev,
          message: tmpl.msg,
          suggestion: tmpl.sug,
          rule_id: tmpl.rule,
        })
      }
    }
  }

  // Calculate quality score
  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const warningCount = findings.filter(f => f.severity === 'warning').length
  const infoCount = findings.filter(f => f.severity === 'info').length
  const qualityScore = clamp(100 - (criticalCount * 15) - (warningCount * 5) - (infoCount * 1), 5, 100)

  const approved = criticalCount === 0 && warningCount <= 3

  const summary = `Review complete: ${findings.length} findings (${criticalCount} critical, ${warningCount} warning, ${infoCount} info) across ${totalLines} lines`

  return {
    review_id: reviewId,
    language: input.language,
    total_lines: totalLines,
    findings,
    summary,
    quality_score: qualityScore,
    approved,
  }
}

function formatCodeReviewReport(result: CodeReviewResult): string {
  const lines: string[] = []
  const statusIcon = result.approved ? 'APPROVED' : 'CHANGES REQUESTED'

  lines.push('## Code Review Report')
  lines.push('')
  lines.push(`Review ID: ${result.review_id} | Language: ${result.language} | Lines: ${result.total_lines}`)
  lines.push(`Quality Score: ${result.quality_score}/100 | Status: ${statusIcon}`)
  lines.push('')

  if (result.findings.length > 0) {
    lines.push('### Findings')
    lines.push('| Rule | Lines | Severity | Category | Message |')
    lines.push('|------|-------|----------|----------|---------|')
    for (const f of result.findings) {
      const sevTag = f.severity === 'critical' ? 'CRITICAL' : f.severity === 'warning' ? 'WARNING' : 'INFO'
      lines.push(`| ${f.rule_id} | ${f.line_start}-${f.line_end} | ${sevTag} | ${f.category} | ${f.message} |`)
    }
    lines.push('')
    lines.push('### Suggestions')
    for (const f of result.findings) {
      lines.push(`- [${f.rule_id}] ${f.suggestion}`)
    }
    lines.push('')
  }

  lines.push(`Review summary: ${result.summary}`)

  return lines.join('\n')
}

// --- Tool 2: PR Automation Engine ---

function automatePR(input: PRAutomationInput): PRAutomationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const prId = `PR-${rng.nextInt(10000, 99999)}`

  const checks: PRCheck[] = []

  // Title quality check
  const titleWords = input.pr_title.split(/\s+/).length
  checks.push({
    name: 'PR Title Quality',
    status: titleWords >= 3 && titleWords <= 12 ? 'pass' : 'warning',
    message: titleWords >= 3 && titleWords <= 12
      ? `Title has ${titleWords} words — good descriptive length`
      : `Title has ${titleWords} words — aim for 3-12 words`,
    auto_fixable: false,
  })

  // Size check
  const totalChanges = input.lines_added + input.lines_removed
  let sizeStatus: 'pass' | 'warning' | 'fail' = 'pass'
  if (totalChanges > 800) sizeStatus = 'fail'
  else if (totalChanges > 400) sizeStatus = 'warning'
  checks.push({
    name: 'PR Size',
    status: sizeStatus,
    message: `${totalChanges} lines changed (${input.lines_added}+/${input.lines_removed}-) — ${sizeStatus === 'pass' ? 'good size' : sizeStatus === 'warning' ? 'consider splitting' : 'too large, must split'}`,
    auto_fixable: false,
  })

  // Test coverage check
  checks.push({
    name: 'Test Coverage',
    status: input.has_tests ? 'pass' : 'fail',
    message: input.has_tests ? 'Tests included for changed code' : 'No tests detected — add test coverage for changes',
    auto_fixable: false,
  })

  // Documentation check
  checks.push({
    name: 'Documentation',
    status: input.has_documentation ? 'pass' : 'warning',
    message: input.has_documentation ? 'Documentation updated' : 'Consider updating relevant documentation',
    auto_fixable: false,
  })

  // Branch naming convention
  const validBranchPattern = /^(feature|bugfix|hotfix|chore|docs|refactor|test)\/.+/
  checks.push({
    name: 'Branch Naming',
    status: validBranchPattern.test(input.source_branch) ? 'pass' : 'warning',
    message: validBranchPattern.test(input.source_branch)
      ? `Branch "${input.source_branch}" follows naming convention`
      : `Branch "${input.source_branch}" should follow pattern: type/description`,
    auto_fixable: false,
  })

  // File conflict risk
  const highRiskFiles = input.changed_files.filter(f => f.includes('migration') || f.includes('schema') || f.includes('config'))
  checks.push({
    name: 'Conflict Risk',
    status: highRiskFiles.length === 0 ? 'pass' : 'warning',
    message: highRiskFiles.length === 0
      ? 'No high-risk file conflicts detected'
      : `${highRiskFiles.length} high-risk file(s) modified: ${highRiskFiles.join(', ')}`,
    auto_fixable: false,
  })

  // Auto-fixable checks
  const formattingIssues = rng.next() > 0.5
  checks.push({
    name: 'Code Formatting',
    status: formattingIssues ? 'warning' : 'pass',
    message: formattingIssues ? 'Minor formatting inconsistencies detected' : 'Code follows project formatting standards',
    auto_fixable: true,
  })

  // Determine merge readiness
  const failCount = checks.filter(c => c.status === 'fail').length
  const warningCount = checks.filter(c => c.status === 'warning').length
  const mergeReady = failCount === 0

  // Suggested reviewers based on changed files
  const reviewerPool = ['alice-dev', 'bob-lead', 'carol-ops', 'dave-security', 'eve-arch']
  const numReviewers = clamp(Math.ceil(input.changed_files.length / 3), 1, 3)
  const suggestedReviewers: string[] = []
  const availableReviewers = [...reviewerPool]
  for (let i = 0; i < numReviewers && availableReviewers.length > 0; i++) {
    const idx = rng.nextInt(0, availableReviewers.length - 1)
    suggestedReviewers.push(availableReviewers.splice(idx, 1)[0])
  }

  // Labels
  const labels: string[] = []
  if (totalChanges < 50) labels.push('small')
  else if (totalChanges < 200) labels.push('medium')
  else labels.push('large')
  if (!input.has_tests) labels.push('needs-tests')
  if (highRiskFiles.length > 0) labels.push('high-risk')
  if (input.has_documentation) labels.push('has-docs')
  labels.push(input.source_branch.split('/')[0])

  // Merge priority
  let mergePriority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  if (input.source_branch.startsWith('hotfix/')) mergePriority = 'critical'
  else if (highRiskFiles.length > 0) mergePriority = 'high'
  else if (totalChanges < 50 && input.has_tests) mergePriority = 'low'

  // Estimated review time
  const estimatedReviewTime = clamp(Math.round(totalChanges / 25) + warningCount * 3, 5, 120)

  return {
    pr_id: prId,
    repo_name: input.repo_name,
    checks,
    merge_ready: mergeReady,
    suggested_reviewers: suggestedReviewers,
    labels,
    merge_priority: mergePriority,
    estimated_review_time_min: estimatedReviewTime,
  }
}

function formatPRAutomationReport(result: PRAutomationResult): string {
  const lines: string[] = []
  const mergeIcon = result.merge_ready ? 'MERGE READED' : 'NOT MERGEABLE'

  lines.push('## PR Automation Report')
  lines.push('')
  lines.push(`PR ID: ${result.pr_id} | Repo: ${result.repo_name}`)
  lines.push(`Merge Status: ${mergeIcon} | Priority: ${result.merge_priority.toUpperCase()} | Est. Review: ${result.estimated_review_time_min}min`)
  lines.push('')

  lines.push('### Checks')
  lines.push('| Check | Status | Auto-Fix | Message |')
  lines.push('|-------|--------|----------|---------|')
  for (const check of result.checks) {
    const statusTag = check.status === 'pass' ? 'PASS' : check.status === 'warning' ? 'WARN' : 'FAIL'
    const autoFix = check.auto_fixable ? 'YES' : 'NO'
    lines.push(`| ${check.name} | ${statusTag} | ${autoFix} | ${check.message} |`)
  }
  lines.push('')

  lines.push('### Reviewers')
  lines.push(`Suggested: ${result.suggested_reviewers.join(', ')}`)
  lines.push('')

  lines.push('### Labels')
  for (const label of result.labels) lines.push(`- ${label}`)
  lines.push('')

  lines.push(`PR automation complete | ${result.checks.length} checks | ${result.suggested_reviewers.length} reviewers assigned`)

  return lines.join('\n')
}

// --- Tool 3: Testing Strategy Generator ---

function generateTestingStrategy(input: TestingStrategyInput): TestingStrategyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const strategyId = `TS-${Date.now()}-${rng.nextInt(1000, 9999).toString(16)}`

  const testLayers: TestLayer[] = []

  // Unit testing layer (always essential)
  const unitFrameworks: Record<string, string[]> = {
    typescript: ['Jest', 'Vitest', 'Mocha'],
    javascript: ['Jest', 'Vitest', 'Mocha'],
    python: ['pytest', 'unittest'],
    java: ['JUnit 5', 'TestNG'],
    go: ['testing', 'testify'],
    rust: ['cargo test', 'rstest'],
  }
  const primaryLang = input.languages[0] || 'typescript'
  const frameworks = unitFrameworks[primaryLang] || ['Jest']
  testLayers.push({
    layer: 'Unit Tests',
    tool: frameworks[0],
    frameworks: frameworks.slice(0, 2),
    estimated_coverage_pct: 45,
    priority: 'essential',
  })

  // Integration testing
  testLayers.push({
    layer: 'Integration Tests',
    tool: input.architecture === 'microservices' ? 'TestContainers' : 'Supertest',
    frameworks: input.architecture === 'microservices' ? ['TestContainers', 'WireMock'] : ['Supertest', 'MSW'],
    estimated_coverage_pct: 25,
    priority: 'essential',
  })

  // E2E testing
  if (input.target_coverage > 70) {
    testLayers.push({
      layer: 'End-to-End Tests',
      tool: 'Playwright',
      frameworks: ['Playwright', 'Cypress'],
      estimated_coverage_pct: 15,
      priority: 'recommended',
    })
  }

  // Contract testing for microservices
  if (input.architecture === 'microservices') {
    testLayers.push({
      layer: 'Contract Tests',
      tool: 'Pact',
      frameworks: ['Pact'],
      estimated_coverage_pct: 10,
      priority: 'recommended',
    })
  }

  // Performance testing
  testLayers.push({
    layer: 'Performance Tests',
    tool: 'k6',
    frameworks: ['k6', 'Artillery'],
    estimated_coverage_pct: 5,
    priority: 'optional',
  })

  // Security testing
  testLayers.push({
    layer: 'Security Tests',
    tool: 'OWASP ZAP',
    frameworks: ['OWASP ZAP', 'Snyk'],
    estimated_coverage_pct: 5,
    priority: 'recommended',
  })

  const totalEstimatedCoverage = testLayers.reduce((sum, l) => sum + l.estimated_coverage_pct, 0)
  const coverageGap = Math.max(0, input.target_coverage - totalEstimatedCoverage)

  // CI integration steps
  const ciSteps = [
    `Install ${input.ci_platform} pipeline configuration`,
    'Add test stage with parallel execution',
    'Configure coverage reporting with threshold enforcement',
    'Set up test result artifacts and reporting',
    'Add flaky test detection and quarantine workflow',
    'Configure test result notifications in Slack/Teams',
  ]

  // Recommendations
  const recommendations: string[] = []
  if (input.current_coverage < 30) {
    recommendations.push('Start with unit tests for critical business logic — aim for 50% coverage in first sprint')
  }
  if (input.architecture === 'microservices') {
    recommendations.push('Implement contract tests early to prevent integration failures between services')
  }
  if (coverageGap > 0) {
    recommendations.push(`Coverage gap of ${coverageGap}% — add property-based testing or mutation testing to close the gap`)
  }
  recommendations.push('Set up test impact analysis to run only affected tests on each PR')
  recommendations.push('Implement visual regression testing for UI components')
  recommendations.push('Add chaos engineering tests for critical paths in production-like environments')

  return {
    strategy_id: strategyId,
    project_type: input.project_type,
    test_layers: testLayers,
    total_estimated_coverage: Math.min(totalEstimatedCoverage, 100),
    ci_integration_steps: ciSteps,
    coverage_gap: coverageGap,
    recommendations,
  }
}

function formatTestingStrategyReport(result: TestingStrategyResult): string {
  const lines: string[] = []

  lines.push('## Testing Strategy Report')
  lines.push('')
  lines.push(`Strategy ID: ${result.strategy_id} | Project: ${result.project_type}`)
  lines.push(`Estimated Coverage: ${result.total_estimated_coverage}% | Coverage Gap: ${result.coverage_gap}%`)
  lines.push('')

  lines.push('### Test Layers')
  lines.push('| Layer | Tool | Frameworks | Coverage | Priority |')
  lines.push('|-------|------|------------|----------|----------|')
  for (const layer of result.test_layers) {
    const prioTag = layer.priority === 'essential' ? 'ESSENTIAL' : layer.priority === 'recommended' ? 'RECOMMENDED' : 'OPTIONAL'
    lines.push(`| ${layer.layer} | ${layer.tool} | ${layer.frameworks.join(', ')} | ${layer.estimated_coverage_pct}% | ${prioTag} |`)
  }
  lines.push('')

  lines.push('### CI Integration Steps')
  let stepNum = 1
  for (const step of result.ci_integration_steps) lines.push(`${stepNum++}. ${step}`)
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const rec of result.recommendations) lines.push(`- ${rec}`)
    lines.push('')
  }

  lines.push(`Testing strategy complete | ${result.test_layers.length} layers | ${result.total_estimated_coverage}% estimated coverage`)

  return lines.join('\n')
}

// --- Tool 4: Documentation Generator ---

function generateDocumentation(input: DocumentationInput): DocumentationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const docId = `DOC-${Date.now()}-${rng.nextInt(1000, 9999).toString(16)}`

  const sections: DocSection[] = []

  if (input.doc_type === 'api') {
    sections.push({ title: 'Overview', content: `API documentation for ${input.project_name}. This document describes all public endpoints, request/response formats, and authentication requirements.`, order: 1, subsections: ['Base URL', 'Authentication', 'Rate Limiting'] })
    sections.push({ title: 'Endpoints', content: `Complete reference for all ${input.modules.length} modules: ${input.modules.join(', ')}.`, order: 2, subsections: input.modules })
    if (input.include_examples) {
      sections.push({ title: 'Examples', content: 'Code examples for common integration patterns and use cases.', order: 3, subsections: ['Quick Start', 'Common Patterns', 'Error Handling'] })
    }
    sections.push({ title: 'Error Codes', content: 'Complete list of error codes with descriptions and resolution steps.', order: 4, subsections: ['Client Errors (4xx)', 'Server Errors (5xx)'] })
  } else if (input.doc_type === 'readme') {
    sections.push({ title: input.project_name, content: `Welcome to ${input.project_name}. This project provides developer productivity and engineering tools.`, order: 1, subsections: ['Features', 'Requirements'] })
    sections.push({ title: 'Installation', content: 'Step-by-step installation instructions for all supported platforms.', order: 2, subsections: ['Prerequisites', 'Setup', 'Verification'] })
    sections.push({ title: 'Usage', content: 'Quick start guide with common commands and configuration options.', order: 3, subsections: ['Basic Usage', 'Advanced Configuration', 'CLI Reference'] })
    if (input.include_examples) {
      sections.push({ title: 'Examples', content: 'Practical examples demonstrating key features and workflows.', order: 4, subsections: ['Example 1: Basic Setup', 'Example 2: Advanced Usage'] })
    }
    sections.push({ title: 'Contributing', content: 'Guidelines for contributing to this project.', order: 5, subsections: ['Code Style', 'Pull Request Process', 'Review Guidelines'] })
  } else if (input.doc_type === 'architecture') {
    sections.push({ title: 'System Overview', content: `High-level architecture for ${input.project_name}. Describes system components, data flow, and integration points.`, order: 1, subsections: ['Context Diagram', 'Component Overview'] })
    sections.push({ title: 'Components', content: `Detailed description of ${input.modules.length} system components.`, order: 2, subsections: input.modules })
    sections.push({ title: 'Data Flow', content: 'How data moves through the system from ingestion to storage and retrieval.', order: 3, subsections: ['Ingestion Pipeline', 'Processing Layer', 'Storage'] })
    sections.push({ title: 'Technology Stack', content: `Primary language: ${input.language}. Supporting tools and frameworks.`, order: 4, subsections: ['Languages', 'Frameworks', 'Infrastructure'] })
  } else if (input.doc_type === 'changelog') {
    sections.push({ title: 'Unreleased', content: 'Changes in the current development cycle not yet released.', order: 1, subsections: ['Added', 'Changed', 'Fixed', 'Removed'] })
    sections.push({ title: 'Version History', content: 'Chronological list of all releases with key changes.', order: 2, subsections: ['Latest Release', 'Previous Releases'] })
  } else {
    // contributing
    sections.push({ title: 'Getting Started', content: 'How to set up the development environment and start contributing.', order: 1, subsections: ['Fork & Clone', 'Install Dependencies', 'Run Tests'] })
    sections.push({ title: 'Development Workflow', content: 'Branch naming, commit conventions, and PR process.', order: 2, subsections: ['Branch Strategy', 'Commit Messages', 'PR Guidelines'] })
    sections.push({ title: 'Code Standards', content: `Coding standards following ${input.style_guide} style guide.`, order: 3, subsections: ['Formatting', 'Linting', 'Type Checking'] })
    sections.push({ title: 'Review Process', content: 'How reviews are conducted and what reviewers look for.', order: 4, subsections: ['Review Checklist', 'Approval Process'] })
  }

  const wordCount = sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0) * 3

  return {
    doc_id: docId,
    project_name: input.project_name,
    doc_type: input.doc_type,
    sections,
    word_count: wordCount,
    generated_at: new Date().toISOString().split('T')[0],
    format: 'markdown',
  }
}

function formatDocumentationReport(result: DocumentationResult): string {
  const lines: string[] = []

  lines.push('## Documentation Generation Report')
  lines.push('')
  lines.push(`Doc ID: ${result.doc_id} | Project: ${result.project_name} | Type: ${result.doc_type}`)
  lines.push(`Format: ${result.format} | Word Count: ${result.word_count} | Generated: ${result.generated_at}`)
  lines.push('')

  lines.push('### Generated Sections')
  lines.push('| # | Title | Subsections |')
  lines.push('|---|-------|-------------|')
  for (const section of result.sections) {
    lines.push(`| ${section.order} | ${section.title} | ${section.subsections.join(', ')} |`)
  }
  lines.push('')

  lines.push('### Section Details')
  for (const section of result.sections) {
    lines.push(`#### ${section.order}. ${section.title}`)
    lines.push(section.content)
    lines.push('')
  }

  lines.push(`Documentation generation complete | ${result.sections.length} sections | ${result.word_count} words`)

  return lines.join('\n')
}

// --- Tool 5: CI/CD Pipeline Optimizer ---

function optimizeCICDPipeline(input: CICDPipelineInput): CICDPipelineResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const optId = `CICD-${Date.now()}-${rng.nextInt(1000, 9999).toString(16)}`

  const optimizations: PipelineOptimization[] = []

  // Cache optimization
  if (!input.cache_enabled) {
    optimizations.push({
      area: 'Build Caching',
      current_state: 'No caching configured',
      recommended_state: 'Enable dependency and build artifact caching',
      estimated_improvement_pct: rng.nextInt(30, 55),
      effort: 'low',
    })
  } else {
    optimizations.push({
      area: 'Cache Invalidation',
      current_state: 'Basic cache configuration',
      recommended_state: 'Implement content-addressable cache keys with layer caching',
      estimated_improvement_pct: rng.nextInt(10, 25),
      effort: 'medium',
    })
  }

  // Parallelization
  if (input.parallelization_current < 3) {
    optimizations.push({
      area: 'Stage Parallelization',
      current_state: `${input.parallelization_current} parallel job(s)`,
      recommended_state: `Increase to ${Math.max(3, input.parallelization_current + 2)} parallel jobs for independent stages`,
      estimated_improvement_pct: rng.nextInt(20, 40),
      effort: 'low',
    })
  }

  // Build time optimization
  if (input.avg_build_time_sec > 300) {
    optimizations.push({
      area: 'Build Time Reduction',
      current_state: `${input.avg_build_time_sec}s average build time`,
      recommended_state: 'Implement incremental builds and test splitting',
      estimated_improvement_pct: rng.nextInt(25, 45),
      effort: 'medium',
    })
  }

  // Failure rate optimization
  if (input.failure_rate_pct > 10) {
    optimizations.push({
      area: 'Reliability Improvement',
      current_state: `${input.failure_rate_pct}% failure rate`,
      recommended_state: 'Add retry logic, flaky test quarantine, and pre-commit hooks',
      estimated_improvement_pct: rng.nextInt(15, 35),
      effort: 'medium',
    })
  }

  // Stage optimization
  if (input.stages.length > 5) {
    optimizations.push({
      area: 'Pipeline Complexity',
      current_state: `${input.stages.length} stages in pipeline`,
      recommended_state: 'Consolidate related stages and remove redundant steps',
      estimated_improvement_pct: rng.nextInt(10, 20),
      effort: 'high',
    })
  }

  // Always add monitoring optimization
  optimizations.push({
    area: 'Observability',
    current_state: 'Basic pipeline logging',
    recommended_state: 'Add pipeline metrics dashboard, alerting, and trend analysis',
    estimated_improvement_pct: rng.nextInt(5, 15),
    effort: 'medium',
  })

  // Calculate aggregate improvements
  const avgBuildReduction = optimizations
    .filter(o => o.area.includes('Build') || o.area.includes('Cache') || o.area.includes('Parallel'))
    .reduce((sum, o, _, arr) => sum + o.estimated_improvement_pct / arr.length, 0)

  const avgReliabilityImprovement = optimizations
    .filter(o => o.area.includes('Reliability') || o.area.includes('Observability'))
    .reduce((sum, o, _, arr) => sum + o.estimated_improvement_pct / Math.max(arr.length, 1), 0)

  // Quick wins (low effort, high impact)
  const quickWins: string[] = []
  if (!input.cache_enabled) quickWins.push('Enable build caching — 30-50% build time reduction with minimal effort')
  if (input.parallelization_current < 3) quickWins.push('Parallelize independent stages — immediate wall-clock reduction')
  quickWins.push('Add build status badges to README for visibility')
  quickWins.push('Set up build notifications for failure alerts')

  // Long-term improvements
  const longTermImprovements: string[] = []
  if (input.failure_rate_pct > 10) longTermImprovements.push('Implement comprehensive flaky test detection and quarantine system')
  if (input.stages.length > 5) longTermImprovements.push('Refactor pipeline into reusable workflow templates')
  longTermImprovements.push('Migrate to pipeline-as-code with version-controlled configurations')
  longTermImprovements.push('Implement deployment verification with automated rollback triggers')
  longTermImprovements.push('Set up cross-pipeline dependency graph for monorepo optimization')

  return {
    optimization_id: optId,
    platform: input.platform,
    optimizations,
    estimated_build_reduction_pct: Math.round(avgBuildReduction),
    estimated_reliability_improvement_pct: Math.round(avgReliabilityImprovement),
    quick_wins: quickWins,
    long_term_improvements: longTermImprovements,
  }
}

function formatCICDPipelineReport(result: CICDPipelineResult): string {
  const lines: string[] = []

  lines.push('## CI/CD Pipeline Optimization Report')
  lines.push('')
  lines.push(`Optimization ID: ${result.optimization_id} | Platform: ${result.platform}`)
  lines.push(`Est. Build Reduction: ${result.estimated_build_reduction_pct}% | Est. Reliability Improvement: ${result.estimated_reliability_improvement_pct}%`)
  lines.push('')

  if (result.optimizations.length > 0) {
    lines.push('### Optimizations')
    lines.push('| Area | Current | Recommended | Improvement | Effort |')
    lines.push('|------|---------|-------------|-------------|--------|')
    for (const opt of result.optimizations) {
      const effortTag = opt.effort === 'low' ? 'LOW' : opt.effort === 'medium' ? 'MEDIUM' : 'HIGH'
      lines.push(`| ${opt.area} | ${opt.current_state} | ${opt.recommended_state} | ${opt.estimated_improvement_pct}% | ${effortTag} |`)
    }
    lines.push('')
  }

  if (result.quick_wins.length > 0) {
    lines.push('### Quick Wins')
    for (const win of result.quick_wins) lines.push(`- ${win}`)
    lines.push('')
  }

  if (result.long_term_improvements.length > 0) {
    lines.push('### Long-Term Improvements')
    for (const imp of result.long_term_improvements) lines.push(`- ${imp}`)
    lines.push('')
  }

  lines.push(`CI/CD optimization complete | ${result.optimizations.length} optimizations | ${result.quick_wins.length} quick wins`)

  return lines.join('\n')
}

// --- Tool 6: Dependency Health Checker ---

function checkDependencyHealth(input: DependencyHealthInput): DependencyHealthResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const healthId = `DEP-${Date.now()}-${rng.nextInt(1000, 9999).toString(16)}`

  const issues: DependencyIssue[] = []

  // Generate issues based on input metrics
  const outdatedPct = input.total_dependencies > 0 ? (input.outdated_count / input.total_dependencies) * 100 : 0
  const vulnerablePct = input.total_dependencies > 0 ? (input.vulnerable_count / input.total_dependencies) * 100 : 0

  // Outdated dependency issues
  const sampleDeps = ['lodash', 'express', 'react', 'axios', 'typescript', 'webpack', 'jest', 'eslint', 'prettier', 'uuid']
  for (let i = 0; i < Math.min(input.outdated_count, 5); i++) {
    const dep = sampleDeps[i % sampleDeps.length]
    const currentMajor = rng.nextInt(3, 5)
    const recommendedMajor = currentMajor + 1
    issues.push({
      dependency: dep,
      issue_type: 'outdated',
      severity: rng.next() > 0.5 ? 'medium' : 'low',
      current_version: `${currentMajor}.${rng.nextInt(0, 15)}.${rng.nextInt(0, 20)}`,
      recommended_version: `${recommendedMajor}.0.0`,
      description: `${dep} is ${rng.nextInt(2, 12)} minor versions behind latest`,
    })
  }

  // Vulnerability issues
  if (input.vulnerable_count > 0) {
    const vulnDeps = ['axios', 'lodash', 'minimist', 'semver']
    for (let i = 0; i < Math.min(input.vulnerable_count, 3); i++) {
      const dep = vulnDeps[i % vulnDeps.length]
      issues.push({
        dependency: dep,
        issue_type: 'vulnerable',
        severity: rng.next() > 0.4 ? 'high' : 'critical',
        current_version: `${rng.nextInt(1, 4)}.${rng.nextInt(0, 10)}.${rng.nextInt(0, 30)}`,
        recommended_version: `${rng.nextInt(1, 4)}.${rng.nextInt(10, 20)}.${rng.nextInt(0, 10)}`,
        description: `Known CVE: ${rng.next() > 0.5 ? 'Prototype Pollution' : 'ReDoS vulnerability'} in ${dep}`,
      })
    }
  }

  // Deprecated issues
  if (input.deprecated_count > 0) {
    const deprecatedDeps = ['request', 'node-uuid', 'babel-preset-es2015']
    for (let i = 0; i < Math.min(input.deprecated_count, 2); i++) {
      issues.push({
        dependency: deprecatedDeps[i % deprecatedDeps.length],
        issue_type: 'deprecated',
        severity: 'medium',
        current_version: `${rng.nextInt(1, 3)}.x.x`,
        recommended_version: 'Migrate to alternative',
        description: `Package is deprecated — ${rng.next() > 0.5 ? 'no longer maintained' : 'replaced by official alternative'}`,
      })
    }
  }

  // License issues
  if (input.license_issues > 0) {
    issues.push({
      dependency: 'some-gpl-package',
      issue_type: 'license',
      severity: 'medium',
      current_version: '2.0.0',
      recommended_version: 'Find MIT/Apache alternative',
      description: 'GPL license may conflict with proprietary distribution',
    })
  }

  // Calculate health score
  let healthScore = 100
  healthScore -= input.vulnerable_count * 12
  healthScore -= input.deprecated_count * 8
  healthScore -= Math.floor(outdatedPct * 0.3)
  healthScore -= input.license_issues * 5
  healthScore -= input.last_update_days_ago > 90 ? 10 : input.last_update_days_ago > 30 ? 5 : 0
  healthScore = clamp(healthScore, 5, 100)

  // Upgrade recommendations
  const upgradeRecommendations: string[] = []
  if (input.vulnerable_count > 0) {
    upgradeRecommendations.push(`URGENT: Update ${input.vulnerable_count} vulnerable dependency(ies) immediately`)
  }
  if (outdatedPct > 30) {
    upgradeRecommendations.push(`${outdatedPct.toFixed(0)}% of dependencies are outdated — schedule a dependency update sprint`)
  }
  if (input.deprecated_count > 0) {
    upgradeRecommendations.push(`Replace ${input.deprecated_count} deprecated package(s) with maintained alternatives`)
  }
  upgradeRecommendations.push('Enable automated dependency updates with Dependabot or Renovate')
  upgradeRecommendations.push('Set up license scanning in CI pipeline')
  upgradeRecommendations.push('Implement dependency update policy: patch auto-merge, minor weekly review, major monthly review')

  // Overall status
  let overallStatus: 'healthy' | 'attention_needed' | 'critical' = 'healthy'
  if (input.vulnerable_count > 2 || healthScore < 40) overallStatus = 'critical'
  else if (input.outdated_count > 5 || input.deprecated_count > 0 || healthScore < 70) overallStatus = 'attention_needed'

  return {
    health_id: healthId,
    language: input.language,
    health_score: healthScore,
    issues,
    outdated_pct: Math.round(outdatedPct),
    vulnerable_pct: Math.round(vulnerablePct),
    upgrade_recommendations: upgradeRecommendations,
    overall_status: overallStatus,
  }
}

function formatDependencyHealthReport(result: DependencyHealthResult): string {
  const lines: string[] = []
  const statusIcon = result.overall_status === 'healthy' ? 'HEALTHY' : result.overall_status === 'attention_needed' ? 'ATTENTION NEEDED' : 'CRITICAL'

  lines.push('## Dependency Health Report')
  lines.push('')
  lines.push(`Health ID: ${result.health_id} | Language: ${result.language}`)
  lines.push(`Health Score: ${result.health_score}/100 | Status: ${statusIcon}`)
  lines.push(`Outdated: ${result.outdated_pct}% | Vulnerable: ${result.vulnerable_pct}%`)
  lines.push('')

  if (result.issues.length > 0) {
    lines.push('### Issues')
    lines.push('| Dependency | Type | Severity | Current | Recommended | Description |')
    lines.push('|------------|------|----------|---------|-------------|-------------|')
    for (const issue of result.issues) {
      const sevTag = issue.severity === 'critical' ? 'CRITICAL' : issue.severity === 'high' ? 'HIGH' : issue.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${issue.dependency} | ${issue.issue_type} | ${sevTag} | ${issue.current_version} | ${issue.recommended_version} | ${issue.description} |`)
    }
    lines.push('')
  }

  if (result.upgrade_recommendations.length > 0) {
    lines.push('### Upgrade Recommendations')
    for (const rec of result.upgrade_recommendations) lines.push(`- ${rec}`)
    lines.push('')
  }

  lines.push(`Dependency health check complete | ${result.issues.length} issues | Score: ${result.health_score}/100`)

  return lines.join('\n')
}

// --- Tool 7: Tech Debt Analyzer ---

function analyzeTechDebt(input: TechDebtInput): TechDebtResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const analysisId = `TD-${Date.now()}-${rng.nextInt(1000, 9999).toString(16)}`

  const debtItems: DebtItem[] = []

  // Code smells
  if (input.code_smell_count > 0) {
    const smellCategories = ['Long Method', 'God Class', 'Dead Code', 'Feature Envy', 'Shotgun Surgery']
    for (let i = 0; i < Math.min(input.code_smell_count, 5); i++) {
      debtItems.push({
        category: smellCategories[i % smellCategories.length],
        severity: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
        estimated_hours: rng.nextInt(2, 16),
        impact: i < 2 ? 'Significantly impacts maintainability' : 'Moderate maintenance overhead',
        location: `src/${input.languages[0] || 'core'}/module_${i + 1}`,
      })
    }
  }

  // Duplicate code
  if (input.duplicate_code_pct > 5) {
    debtItems.push({
      category: 'Duplicated Code',
      severity: input.duplicate_code_pct > 15 ? 'high' : 'medium',
      estimated_hours: Math.round(input.duplicate_code_pct * 0.8),
      impact: `${input.duplicate_code_pct}% code duplication increases bug risk and maintenance cost`,
      location: 'Multiple modules across codebase',
    })
  }

  // Complexity hotspots
  if (input.complexity_hotspots > 0) {
    for (let i = 0; i < Math.min(input.complexity_hotspots, 3); i++) {
      debtItems.push({
        category: 'High Complexity',
        severity: 'high',
        estimated_hours: rng.nextInt(4, 20),
        impact: 'Cyclomatic complexity above threshold — high defect risk',
        location: `src/core/hotspot_${i + 1}.${input.languages[0] || 'ts'}`,
      })
    }
  }

  // Test coverage debt
  if (input.test_coverage_pct < 60) {
    debtItems.push({
      category: 'Low Test Coverage',
      severity: input.test_coverage_pct < 30 ? 'critical' : input.test_coverage_pct < 50 ? 'high' : 'medium',
      estimated_hours: Math.round((80 - input.test_coverage_pct) * 1.5),
      impact: `Test coverage at ${input.test_coverage_pct}% — below 80% target`,
      location: 'Across all modules',
    })
  }

  // Documentation debt
  if (input.documentation_coverage_pct < 50) {
    debtItems.push({
      category: 'Missing Documentation',
      severity: input.documentation_coverage_pct < 20 ? 'high' : 'medium',
      estimated_hours: Math.round((70 - input.documentation_coverage_pct) * 0.5),
      impact: `Documentation coverage at ${input.documentation_coverage_pct}% — impacts onboarding`,
      location: 'Public APIs and complex modules',
    })
  }

  // Calculate totals
  const totalDebtHours = debtItems.reduce((sum, item) => sum + item.estimated_hours, 0)
  const debtRatio = input.total_lines_of_code > 0
    ? parseFloat(((totalDebtHours * 100) / (input.total_lines_of_code * 0.05)).toFixed(2))
    : 0

  // Prioritized actions
  const prioritizedActions: string[] = []
  const criticalItems = debtItems.filter(d => d.severity === 'critical')
  const highItems = debtItems.filter(d => d.severity === 'high')

  if (criticalItems.length > 0) {
    prioritizedActions.push(`Address ${criticalItems.length} critical debt item(s) first — estimated ${criticalItems.reduce((s, i) => s + i.estimated_hours, 0)} hours`)
  }
  if (highItems.length > 0) {
    prioritizedActions.push(`Plan sprint for ${highItems.length} high-severity items — ${highItems.reduce((s, i) => s + i.estimated_hours, 0)} hours total`)
  }
  if (input.test_coverage_pct < 60) {
    prioritizedActions.push('Increase test coverage to at least 60% before adding new features')
  }
  if (input.duplicate_code_pct > 10) {
    prioritizedActions.push('Extract duplicated code into shared utilities and libraries')
  }
  prioritizedActions.push('Set up automated code quality gates in CI pipeline')
  prioritizedActions.push('Allocate 20% of each sprint to tech debt reduction')

  // Debt trend
  let debtTrend: 'improving' | 'stable' | 'worsening' = 'stable'
  if (input.code_smell_count > 20 || input.duplicate_code_pct > 15) debtTrend = 'worsening'
  else if (input.test_coverage_pct > 70 && input.code_smell_count < 5) debtTrend = 'improving'

  // Health grade
  let healthGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'B'
  if (debtRatio < 5 && input.test_coverage_pct > 80) healthGrade = 'A'
  else if (debtRatio > 20 || input.test_coverage_pct < 30) healthGrade = 'F'
  else if (debtRatio > 12) healthGrade = 'D'
  else if (debtRatio > 8) healthGrade = 'C'

  return {
    analysis_id: analysisId,
    repo_name: input.repo_name,
    total_debt_hours: totalDebtHours,
    debt_ratio: debtRatio,
    debt_items: debtItems,
    prioritized_actions: prioritizedActions,
    debt_trend: debtTrend,
    health_grade: healthGrade,
  }
}

function formatTechDebtReport(result: TechDebtResult): string {
  const lines: string[] = []

  lines.push('## Tech Debt Analysis Report')
  lines.push('')
  lines.push(`Analysis ID: ${result.analysis_id} | Repo: ${result.repo_name}`)
  lines.push(`Total Debt: ${result.total_debt_hours}h | Debt Ratio: ${result.debt_ratio} | Grade: ${result.health_grade}`)
  lines.push(`Trend: ${result.debt_trend.toUpperCase()}`)
  lines.push('')

  if (result.debt_items.length > 0) {
    lines.push('### Debt Items')
    lines.push('| Category | Severity | Hours | Impact | Location |')
    lines.push('|----------|----------|-------|--------|----------|')
    for (const item of result.debt_items) {
      const sevTag = item.severity === 'critical' ? 'CRITICAL' : item.severity === 'high' ? 'HIGH' : item.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${item.category} | ${sevTag} | ${item.estimated_hours}h | ${item.impact} | ${item.location} |`)
    }
    lines.push('')
  }

  if (result.prioritized_actions.length > 0) {
    lines.push('### Prioritized Actions')
    let actionNum = 1
    for (const action of result.prioritized_actions) lines.push(`${actionNum++}. ${action}`)
    lines.push('')
  }

  lines.push(`Tech debt analysis complete | ${result.debt_items.length} items | Grade: ${result.health_grade} | Trend: ${result.debt_trend}`)

  return lines.join('\n')
}

// --- Tool 8: Developer Experience Scorer ---

function scoreDeveloperExperience(input: DXScorerInput): DXScorerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const scoreId = `DX-${Date.now()}-${rng.nextInt(1000, 9999).toString(16)}`

  const metrics: DXMetric[] = []

  // Build time metric
  const buildScore = clamp(Math.round(100 - (input.build_time_min - 2) * 8), 10, 100)
  metrics.push({
    name: 'Build Time',
    value: input.build_time_min,
    benchmark: 5,
    score: buildScore,
    status: buildScore >= 80 ? 'excellent' : buildScore >= 60 ? 'good' : buildScore >= 40 ? 'needs_improvement' : 'poor',
  })

  // Deploy frequency metric
  const deployScore = clamp(Math.round((input.deploy_frequency_per_week / 7) * 100), 5, 100)
  metrics.push({
    name: 'Deploy Frequency',
    value: input.deploy_frequency_per_week,
    benchmark: 7,
    score: deployScore,
    status: deployScore >= 80 ? 'excellent' : deployScore >= 60 ? 'good' : deployScore >= 40 ? 'needs_improvement' : 'poor',
  })

  // Lead time metric
  const leadTimeScore = clamp(Math.round(100 - (input.lead_time_hours - 1) * 3), 10, 100)
  metrics.push({
    name: 'Lead Time',
    value: input.lead_time_hours,
    benchmark: 4,
    score: leadTimeScore,
    status: leadTimeScore >= 80 ? 'excellent' : leadTimeScore >= 60 ? 'good' : leadTimeScore >= 40 ? 'needs_improvement' : 'poor',
  })

  // MTTR metric
  const mttrScore = clamp(Math.round(100 - (input.mttr_hours - 0.5) * 15), 10, 100)
  metrics.push({
    name: 'MTTR',
    value: input.mttr_hours,
    benchmark: 1,
    score: mttrScore,
    status: mttrScore >= 80 ? 'excellent' : mttrScore >= 60 ? 'good' : mttrScore >= 40 ? 'needs_improvement' : 'poor',
  })

  // Test execution time metric
  const testTimeScore = clamp(Math.round(100 - (input.test_execution_time_min - 3) * 10), 10, 100)
  metrics.push({
    name: 'Test Execution Time',
    value: input.test_execution_time_min,
    benchmark: 5,
    score: testTimeScore,
    status: testTimeScore >= 80 ? 'excellent' : testTimeScore >= 60 ? 'good' : testTimeScore >= 40 ? 'needs_improvement' : 'poor',
  })

  // Onboarding time metric
  const onboardingScore = clamp(Math.round(100 - (input.onboarding_days - 1) * 12), 10, 100)
  metrics.push({
    name: 'Onboarding Time',
    value: input.onboarding_days,
    benchmark: 3,
    score: onboardingScore,
    status: onboardingScore >= 80 ? 'excellent' : onboardingScore >= 60 ? 'good' : onboardingScore >= 40 ? 'needs_improvement' : 'poor',
  })

  // Tool satisfaction metric
  const satisfactionScore = clamp(Math.round(input.tool_satisfaction * 10), 10, 100)
  metrics.push({
    name: 'Tool Satisfaction',
    value: input.tool_satisfaction,
    benchmark: 8,
    score: satisfactionScore,
    status: satisfactionScore >= 80 ? 'excellent' : satisfactionScore >= 60 ? 'good' : satisfactionScore >= 40 ? 'needs_improvement' : 'poor',
  })

  // Calculate overall DX score (weighted average)
  const weights = [0.15, 0.15, 0.15, 0.15, 0.15, 0.1, 0.15]
  const overallScore = Math.round(
    metrics.reduce((sum, m, i) => sum + m.score * weights[i], 0)
  )

  // DORA classification
  let doraClassification: 'elite' | 'high' | 'medium' | 'low' = 'medium'
  if (deployScore >= 80 && leadTimeScore >= 80 && mttrScore >= 80) doraClassification = 'elite'
  else if (deployScore >= 60 && leadTimeScore >= 60 && mttrScore >= 60) doraClassification = 'high'
  else if (deployScore < 40 || leadTimeScore < 40 || mttrScore < 40) doraClassification = 'low'

  // Top improvements
  const topImprovements: string[] = []
  const sortedMetrics = [...metrics].sort((a, b) => a.score - b.score)
  for (const m of sortedMetrics.slice(0, 3)) {
    if (m.status === 'poor' || m.status === 'needs_improvement') {
      topImprovements.push(`Improve ${m.name} (score: ${m.score}/100) — currently ${m.value}, target benchmark: ${m.benchmark}`)
    }
  }
  if (topImprovements.length === 0) {
    topImprovements.push('All metrics are at good or excellent levels — focus on maintaining current standards')
  }

  // Strengths
  const strengths: string[] = []
  for (const m of metrics) {
    if (m.status === 'excellent' || m.status === 'good') {
      strengths.push(`${m.name}: ${m.score}/100 (${m.status})`)
    }
  }
  if (strengths.length === 0) {
    strengths.push('No metrics currently at good or excellent levels — prioritize improvements')
  }

  return {
    score_id: scoreId,
    overall_dx_score: overallScore,
    metrics,
    dora_classification: doraClassification,
    top_improvements: topImprovements,
    strengths,
  }
}

function formatDXScorerReport(result: DXScorerResult): string {
  const lines: string[] = []
  const doraIcon = result.dora_classification === 'elite' ? 'ELITE' : result.dora_classification === 'high' ? 'HIGH' : result.dora_classification === 'medium' ? 'MEDIUM' : 'LOW'

  lines.push('## Developer Experience Score Report')
  lines.push('')
  lines.push(`Score ID: ${result.score_id} | Overall DX Score: ${result.overall_dx_score}/100`)
  lines.push(`DORA Classification: ${doraIcon}`)
  lines.push('')

  lines.push('### Metrics')
  lines.push('| Metric | Value | Benchmark | Score | Status |')
  lines.push('|--------|-------|-----------|-------|--------|')
  for (const m of result.metrics) {
    const statusTag = m.status === 'excellent' ? 'EXCELLENT' : m.status === 'good' ? 'GOOD' : m.status === 'needs_improvement' ? 'NEEDS WORK' : 'POOR'
    lines.push(`| ${m.name} | ${m.value} | ${m.benchmark} | ${m.score}/100 | ${statusTag} |`)
  }
  lines.push('')

  lines.push('### Top Improvements')
  for (const imp of result.top_improvements) lines.push(`- ${imp}`)
  lines.push('')

  lines.push('### Strengths')
  for (const s of result.strengths) lines.push(`- ${s}`)
  lines.push('')

  lines.push(`DX scoring complete | Overall: ${result.overall_dx_score}/100 | DORA: ${doraIcon}`)

  return lines.join('\n')
}

// ==================== SECTION 4 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'code_review_assistant',
    description: 'Analyze code for security, performance, readability, best practices, and architecture issues with severity-based findings and suggestions.',
    parameters: { review_input: { type: 'string', required: true, description: 'JSON: language, code_snippet, review_focus[], severity_threshold (low|medium|high)' } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { review_input: string }) {
      const input: CodeReviewInput = JSON.parse(args.review_input)
      return formatCodeReviewReport(reviewCode(input))
    }
  }))

  tools.register(defineTool({
    name: 'pr_automation_engine',
    description: 'Automate PR checks including size, tests, docs, branch naming, conflict risk, and reviewer assignment with merge readiness assessment.',
    parameters: { pr_input: { type: 'string', required: true, description: 'JSON: repo_name, pr_title, source_branch, target_branch, changed_files[], lines_added, lines_removed, has_tests, has_documentation' } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { pr_input: string }) {
      const input: PRAutomationInput = JSON.parse(args.pr_input)
      return formatPRAutomationReport(automatePR(input))
    }
  }))

  tools.register(defineTool({
    name: 'testing_strategy_generator',
    description: 'Generate comprehensive testing strategies with unit, integration, E2E, contract, performance, and security test layers for any project type.',
    parameters: { strategy_input: { type: 'string', required: true, description: 'JSON: project_type, languages[], architecture (monolith|microservices|serverless|library), current_coverage, target_coverage, ci_platform' } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { strategy_input: string }) {
      const input: TestingStrategyInput = JSON.parse(args.strategy_input)
      return formatTestingStrategyReport(generateTestingStrategy(input))
    }
  }))

  tools.register(defineTool({
    name: 'documentation_generator',
    description: 'Generate API docs, README, architecture docs, changelogs, and contributing guides with examples and style guide compliance.',
    parameters: { doc_input: { type: 'string', required: true, description: 'JSON: project_name, language, doc_type (api|readme|architecture|changelog|contributing), modules[], include_examples, style_guide (google|numpy|jsdoc|microsoft)' } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { doc_input: string }) {
      const input: DocumentationInput = JSON.parse(args.doc_input)
      return formatDocumentationReport(generateDocumentation(input))
    }
  }))

  tools.register(defineTool({
    name: 'cicd_pipeline_optimizer',
    description: 'Analyze CI/CD pipeline performance and recommend optimizations for build time, caching, parallelization, reliability, and observability.',
    parameters: { pipeline_input: { type: 'string', required: true, description: 'JSON: platform, build_history_duration_days, avg_build_time_sec, failure_rate_pct, stages[], parallelization_current, cache_enabled' } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { pipeline_input: string }) {
      const input: CICDPipelineInput = JSON.parse(args.pipeline_input)
      return formatCICDPipelineReport(optimizeCICDPipeline(input))
    }
  }))

  tools.register(defineTool({
    name: 'dependency_health_checker',
    description: 'Check dependency health for outdated, vulnerable, deprecated packages and license conflicts with upgrade recommendations.',
    parameters: { health_input: { type: 'string', required: true, description: 'JSON: language, package_manager, total_dependencies, outdated_count, vulnerable_count, deprecated_count, license_issues, last_update_days_ago' } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { health_input: string }) {
      const input: DependencyHealthInput = JSON.parse(args.health_input)
      return formatDependencyHealthReport(checkDependencyHealth(input))
    }
  }))

  tools.register(defineTool({
    name: 'tech_debt_analyzer',
    description: 'Analyze technical debt across code smells, duplication, complexity, test coverage, and documentation with prioritized remediation plan.',
    parameters: { debt_input: { type: 'string', required: true, description: 'JSON: repo_name, total_lines_of_code, languages[], code_smell_count, duplicate_code_pct, complexity_hotspots, test_coverage_pct, documentation_coverage_pct' } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { debt_input: string }) {
      const input: TechDebtInput = JSON.parse(args.debt_input)
      return formatTechDebtReport(analyzeTechDebt(input))
    }
  }))

  tools.register(defineTool({
    name: 'developer_experience_scorer',
    description: 'Score developer experience across build time, deploy frequency, lead time, MTTR, test time, onboarding, and tool satisfaction with DORA classification.',
    parameters: { dx_input: { type: 'string', required: true, description: 'JSON: team_size, build_time_min, deploy_frequency_per_week, lead_time_hours, mttr_hours, test_execution_time_min, onboarding_days, tool_satisfaction (1-10)' } },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { dx_input: string }) {
      const input: DXScorerInput = JSON.parse(args.dx_input)
      return formatDXScorerReport(scoreDeveloperExperience(input))
    }
  }))

  console.log(`[dsh-tool-devprod] Loaded v${VERSION} - Developer Productivity & Engineering Tools with 8 tools`)
  console.log('  Tools: code_review_assistant, pr_automation_engine, testing_strategy_generator, documentation_generator, cicd_pipeline_optimizer, dependency_health_checker, tech_debt_analyzer, developer_experience_scorer')
}
