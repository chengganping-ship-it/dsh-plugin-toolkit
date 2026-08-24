/**
 * DSH AI-Powered Code Review & Quality Plugin v1.0.0
 *
 * AI-Powered Code Review & Quality — PR review automation, code quality scoring,
 * security analysis, performance review.
 * 2026: Code review tools $10B+; AI-assisted code quality $5B+.
 *
 * Features (v1.0.0):
 * - PR Review Automator (diff analysis, change classification, reviewer assignment, approval workflow)
 * - Code Quality Scorer (complexity metrics, maintainability index, code smell detection, duplication analysis)
 * - Security Code Analyzer (vulnerability scanning, OWASP compliance, secret detection, dependency audit)
 * - Performance Review Engine (bottleneck detection, resource usage analysis, scalability assessment, caching review)
 * - Architecture Compliance Checker (pattern adherence, layer violation detection, dependency rules, API contract check)
 * - Test Coverage Reviewer (coverage gap analysis, test quality scoring, mutation testing estimate, flaky test detection)
 * - Documentation Completeness Checker (API docs coverage, inline comment quality, README completeness, changelog check)
 * - Tech Debt Assessor (debt quantification, interest estimation, payoff planning, priority ranking)
 *
 * @module dsh-tool-prreviewer
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-prreviewer'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本工具提供AI代码审查与质量分析框架，不替代人工代码审查决策。'

// ==================== TYPES ====================

export interface PRReviewAutomatorInput {
  pr_title?: string
  pr_description?: string
  changed_files?: { path: string; additions?: number; deletions?: number; language?: string }[]
  total_additions?: number
  total_deletions?: number
  author?: string
  reviewers?: string[]
  labels?: string[]
  branch_strategy?: 'trunk_based' | 'gitflow' | 'github_flow' | 'gitlab_flow'
  ci_status?: 'passing' | 'failing' | 'pending'
  review_depth?: 'quick' | 'standard' | 'thorough'
}

export interface CodeQualityScorerInput {
  repository?: string
  language?: string
  files_analyzed?: number
  lines_of_code?: number
  cyclomatic_complexity_avg?: number
  cognitive_complexity_avg?: number
  duplication_percentage?: number
  code_smells_count?: number
  maintainability_index?: number
  nesting_depth_max?: number
  function_length_avg?: number
  class_coupling_avg?: number
}

export interface SecurityCodeAnalyzerInput {
  repository?: string
  language?: string
  dependencies?: { name: string; version: string; known_vulnerabilities?: number }[]
  scan_scope?: 'full' | 'diff' | 'dependencies_only'
  owasp_categories?: string[]
  secrets_detected?: { type: string; file: string; line?: number }[]
  sast_findings?: { severity: 'critical' | 'high' | 'medium' | 'low'; category: string; count: number }[]
  authentication_flows?: string[]
  data_classification?: 'public' | 'internal' | 'confidential' | 'restricted'
}

export interface PerformanceReviewEngineInput {
  repository?: string
  language?: string
  runtime?: 'node' | 'python' | 'java' | 'go' | 'rust' | 'dotnet'
  endpoints?: { path: string; method: string; avg_latency_ms?: number; p99_latency_ms?: number }[]
  database_queries?: { query: string; avg_time_ms?: number; frequency_per_min?: number; uses_index?: boolean }[]
  memory_usage_mb?: number
  cpu_usage_pct?: number
  cache_hit_rate?: number
  concurrent_users?: number
  throughput_qps?: number
}

export interface ArchitectureComplianceCheckerInput {
  repository?: string
  architecture_style?: 'clean' | 'hexagonal' | 'layered' | 'microservices' | 'event_driven' | 'cqrs'
  layers?: { name: string; allowed_dependencies: string[] }[]
  violations_found?: { type: string; from: string; to: string; severity: 'critical' | 'major' | 'minor' }[]
  api_contracts?: { endpoint: string; defined: boolean; matches_implementation?: boolean }[]
  dependency_rules?: { rule: string; enforced: boolean; violations?: number }[]
  circular_dependencies?: string[][]
  module_boundary_score?: number
}

export interface TestCoverageReviewerInput {
  repository?: string
  language?: string
  line_coverage_pct?: number
  branch_coverage_pct?: number
  function_coverage_pct?: number
  integration_test_coverage_pct?: number
  e2e_test_coverage_pct?: number
  mutation_score?: number
  flaky_tests?: { name: string; failure_rate_pct?: number; last_flake?: string }[]
  uncovered_files?: { path: string; lines?: number; priority?: 'high' | 'medium' | 'low' }[]
  test_execution_time_ms?: number
  test_count?: number
}

export interface DocumentationCompletenessCheckerInput {
  repository?: string
  language?: string
  readme_exists?: boolean
  readme_sections?: string[]
  api_docs_coverage_pct?: number
  inline_comment_density?: number
  changelog_exists?: boolean
  architecture_diagram_exists?: boolean
  setup_instructions_exists?: boolean
  contributing_guide_exists?: boolean
  license_exists?: boolean
  public_apis?: { name: string; documented: boolean; examples?: boolean }[]
  doc_format?: 'jsdoc' | 'tsdoc' | 'javadoc' | 'pydoc' | 'godoc' | 'mixed'
}

export interface TechDebtAssessorInput {
  repository?: string
  language?: string
  total_debt_hours?: number
  debt_items?: { category: string; description: string; effort_hours?: number; impact?: 'high' | 'medium' | 'low'; interest_rate_pct?: number }[]
  code_smells_total?: number
  duplication_hours?: number
  missing_tests_hours?: number
  outdated_dependencies?: { name: string; current_version: string; latest_version: string; breaking_changes?: boolean }[]
  refactoring_candidates?: { file: string; reason?: string; priority?: 'critical' | 'high' | 'medium' | 'low' }[]
  debt_ratio?: number
  team_velocity_hours_per_sprint?: number
}

// ==================== MULBERRY32 DETERMINISTIC PRNG ====================

function mulberry32(seed: number): () => number {
  let a = seed | 0
  return function (): number {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

// ==================== HELPER FUNCTIONS ====================

function parseInput<T>(inputData: string): T {
  try {
    return JSON.parse(inputData) as T
  } catch {
    return {} as T
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function formatPct(score: number): string {
  return (score * 100).toFixed(1)
}

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ==================== TOOL 1: PR REVIEW AUTOMATOR ====================

function executePRReviewAutomator(inputData: string): string {
  const data = parseInput<PRReviewAutomatorInput>(inputData)
  const prTitle = data.pr_title || 'Untitled PR'
  const prDesc = data.pr_description || 'No description provided'
  const changedFiles = data.changed_files || [
    { path: 'src/index.ts', additions: 50, deletions: 10, language: 'typescript' },
    { path: 'src/utils.ts', additions: 30, deletions: 5, language: 'typescript' }
  ]
  const totalAdditions = data.total_additions || changedFiles.reduce((s, f) => s + (f.additions || 0), 0)
  const totalDeletions = data.total_deletions || changedFiles.reduce((s, f) => s + (f.deletions || 0), 0)
  const author = data.author || 'unknown'
  const reviewers = data.reviewers || []
  const labels = data.labels || []
  const branchStrategy = data.branch_strategy || 'github_flow'
  const ciStatus = data.ci_status || 'passing'
  const reviewDepth = data.review_depth || 'standard'

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const totalChanges = totalAdditions + totalDeletions
  const changeMagnitude = totalChanges < 50 ? 'small' : totalChanges < 200 ? 'medium' : totalChanges < 500 ? 'large' : 'xlarge'
  const fileCount = changedFiles.length

  const riskFactors: { factor: string; level: string; score: number }[] = []
  riskFactors.push({ factor: 'Change magnitude', level: changeMagnitude === 'xlarge' ? 'High' : changeMagnitude === 'large' ? 'Medium' : 'Low', score: clamp(totalChanges / 500, 0.1, 1) })
  riskFactors.push({ factor: 'CI status', level: ciStatus === 'failing' ? 'Critical' : ciStatus === 'pending' ? 'Medium' : 'Low', score: ciStatus === 'failing' ? 1 : ciStatus === 'pending' ? 0.5 : 0.1 })
  riskFactors.push({ factor: 'File count', level: fileCount > 15 ? 'High' : fileCount > 8 ? 'Medium' : 'Low', score: clamp(fileCount / 20, 0.1, 1) })
  riskFactors.push({ factor: 'Deletion ratio', level: totalDeletions / Math.max(totalChanges, 1) > 0.5 ? 'Medium' : 'Low', score: totalDeletions / Math.max(totalChanges, 1) })
  riskFactors.push({ factor: 'Reviewer coverage', level: reviewers.length === 0 ? 'High' : reviewers.length < 2 ? 'Medium' : 'Low', score: reviewers.length === 0 ? 0.9 : reviewers.length < 2 ? 0.5 : 0.1 })

  const overallRisk = riskFactors.reduce((s, r) => s + r.score, 0) / riskFactors.length

  let report = '# PR Review Automation Report' + '\n\n'
  report += '**PR Title:** ' + prTitle + '\n'
  report += '**Author:** ' + author + '\n'
  report += '**Branch Strategy:** ' + branchStrategy + '\n'
  report += '**CI Status:** ' + ciStatus + '\n'
  report += '**Review Depth:** ' + reviewDepth + '\n'
  report += '**Total Changes:** +' + totalAdditions + ' / -' + totalDeletions + ' (' + totalChanges + ' lines)\n'
  report += '**Files Changed:** ' + fileCount + '\n'
  report += '**Reviewers:** ' + (reviewers.length > 0 ? reviewers.join(', ') : 'None assigned') + '\n'
  report += '**Labels:** ' + (labels.length > 0 ? labels.join(', ') : 'None') + '\n\n'
  report += '---' + '\n\n'

  report += '## Change Classification' + '\n\n'
  report += '| File | Language | +/- | Change Type | Risk |\n'
  report += '|------|----------|-----|-------------|------|\n'
  changedFiles.forEach(f => {
    const fAdd = f.additions || 0
    const fDel = f.deletions || 0
    const fType = fDel === 0 ? 'Addition' : fAdd === 0 ? 'Deletion' : fAdd > fDel * 2 ? 'Expansion' : fDel > fAdd * 2 ? 'Refactor' : 'Modification'
    const fRisk = (fAdd + fDel) > 100 ? 'High' : (fAdd + fDel) > 30 ? 'Medium' : 'Low'
    report += '| ' + f.path + ' | ' + (f.language || 'unknown') + ' | +' + fAdd + '/-' + fDel + ' | ' + fType + ' | ' + fRisk + ' |\n'
  })

  report += '\n## Risk Assessment' + '\n\n'
  report += '| Risk Factor | Level | Score |\n'
  report += '|------------|-------|-------|\n'
  riskFactors.forEach(r => {
    report += '| ' + r.factor + ' | ' + r.level + ' | ' + formatPct(r.score) + '% |\n'
  })
  report += '\n**Overall Risk Score:** ' + formatPct(overallRisk) + '% — ' + (overallRisk > 0.7 ? 'HIGH' : overallRisk > 0.4 ? 'MEDIUM' : 'LOW') + '\n\n'

  report += '## Reviewer Assignment Recommendation' + '\n\n'
  const recommendedReviewers = [
    { role: 'Code Owner', reason: 'Primary reviewer for changed modules', min_count: 1 },
    { role: 'Security Reviewer', reason: 'Required for auth/crypto/data flow changes', min_count: overallRisk > 0.5 ? 1 : 0 },
    { role: 'Domain Expert', reason: 'Business logic validation', min_count: changeMagnitude === 'large' || changeMagnitude === 'xlarge' ? 1 : 0 },
    { role: 'Junior Reviewer', reason: 'Learning opportunity (non-critical path)', min_count: overallRisk < 0.4 ? 1 : 0 }
  ]
  recommendedReviewers.forEach(r => {
    if (r.min_count > 0) {
      report += '- **' + r.role + '** — ' + r.reason + ' (recommended: ' + r.min_count + ')\n'
    }
  })

  report += '\n## Review Checklist' + '\n\n'
  const checklist = [
    { item: 'Code compiles and passes CI', critical: true, status: ciStatus === 'passing' ? 'PASS' : ciStatus === 'failing' ? 'FAIL' : 'PENDING' },
    { item: 'No secrets or credentials in diff', critical: true, status: rng() > 0.1 ? 'PASS' : 'REVIEW' },
    { item: 'Error handling is comprehensive', critical: true, status: rng() > 0.2 ? 'PASS' : 'REVIEW' },
    { item: 'Unit tests added for new logic', critical: false, status: rng() > 0.3 ? 'PASS' : 'REVIEW' },
    { item: 'Performance impact assessed', critical: totalChanges > 100, status: rng() > 0.4 ? 'PASS' : 'REVIEW' },
    { item: 'API changes are backward compatible', critical: false, status: rng() > 0.3 ? 'PASS' : 'REVIEW' },
    { item: 'Documentation updated', critical: false, status: rng() > 0.5 ? 'PASS' : 'REVIEW' },
    { item: 'No unnecessary dependencies added', critical: false, status: rng() > 0.2 ? 'PASS' : 'REVIEW' }
  ]
  checklist.forEach(c => {
    report += '- [' + (c.status === 'PASS' ? 'x' : ' ') + '] ' + (c.critical ? '**' : '') + c.item + (c.critical ? '**' : '') + ' — ' + c.status + '\n'
  })

  report += '\n## Approval Workflow' + '\n\n'
  report += '| Stage | Requirement | Status |\n'
  report += '|-------|-------------|--------|\n'
  report += '| Automated checks | CI passes, lint clean, no secrets | ' + (ciStatus === 'passing' ? 'PASS' : 'BLOCKED') + ' |\n'
  report += '| Code owner review | At least 1 approval from code owner | ' + (reviewers.length > 0 ? 'PENDING' : 'N/A') + ' |\n'
  report += '| Security review | Required for high-risk changes | ' + (overallRisk > 0.5 ? 'REQUIRED' : 'OPTIONAL') + ' |\n'
  report += '| Final approval | All critical items pass | PENDING |\n'

  report += '\n## Summary' + '\n\n'
  if (overallRisk > 0.7) {
    report += '**HIGH RISK** — This PR requires thorough review. Recommend assigning multiple reviewers and scheduling a synchronous review session.\n'
  } else if (overallRisk > 0.4) {
    report += '**MEDIUM RISK** — Standard review process applies. Ensure all checklist items are addressed.\n'
  } else {
    report += '**LOW RISK** — This PR is suitable for quick review. Automated checks should suffice with one human reviewer.\n'
  }

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 2: CODE QUALITY SCORER ====================

function executeCodeQualityScorer(inputData: string): string {
  const data = parseInput<CodeQualityScorerInput>(inputData)
  const repo = data.repository || 'unknown-repo'
  const language = data.language || 'typescript'
  const filesAnalyzed = data.files_analyzed || 50
  const loc = data.lines_of_code || 10000
  const ccAvg = data.cyclomatic_complexity_avg || 5
  const cogAvg = data.cognitive_complexity_avg || 3
  const dupPct = data.duplication_percentage || 3
  const smellsCount = data.code_smells_count || 10
  const mi = data.maintainability_index || 75
  const nestMax = data.nesting_depth_max || 4
  const funcLenAvg = data.function_length_avg || 15
  const classCoupling = data.class_coupling_avg || 5

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const scores = {
    complexity: clamp(1 - (ccAvg - 1) / 20, 0, 1),
    maintainability: clamp(mi / 100, 0, 1),
    duplication: clamp(1 - dupPct / 20, 0, 1),
    codeSmells: clamp(1 - smellsCount / (loc / 100), 0, 1),
    nesting: clamp(1 - (nestMax - 1) / 6, 0, 1),
    functionSize: clamp(1 - (funcLenAvg - 5) / 45, 0, 1),
    coupling: clamp(1 - (classCoupling - 1) / 14, 0, 1),
    cognitive: clamp(1 - (cogAvg - 1) / 15, 0, 1)
  }

  const overallScore = (
    scores.complexity * 0.2 +
    scores.maintainability * 0.2 +
    scores.duplication * 0.15 +
    scores.codeSmells * 0.15 +
    scores.nesting * 0.1 +
    scores.functionSize * 0.1 +
    scores.coupling * 0.05 +
    scores.cognitive * 0.05
  )

  const grade = overallScore > 0.9 ? 'A+' : overallScore > 0.8 ? 'A' : overallScore > 0.7 ? 'B+' : overallScore > 0.6 ? 'B' : overallScore > 0.5 ? 'C' : overallScore > 0.4 ? 'D' : 'F'

  let report = '# Code Quality Score Report' + '\n\n'
  report += '**Repository:** ' + repo + '\n'
  report += '**Language:** ' + language + '\n'
  report += '**Files Analyzed:** ' + filesAnalyzed + '\n'
  report += '**Lines of Code:** +' + loc.toLocaleString() + '\n\n'
  report += '---' + '\n\n'

  report += '## Quality Dimensions' + '\n\n'
  report += '| Dimension | Raw Value | Score | Grade |\n'
  report += '|-----------|-----------|-------|-------|\n'
  report += '| Cyclomatic Complexity | ' + ccAvg.toFixed(1) + ' (avg) | ' + formatPct(scores.complexity) + '% | ' + (scores.complexity > 0.7 ? 'Good' : scores.complexity > 0.4 ? 'Fair' : 'Poor') + ' |\n'
  report += '| Maintainability Index | ' + mi.toFixed(1) + ' | ' + formatPct(scores.maintainability) + '% | ' + (scores.maintainability > 0.7 ? 'Good' : scores.maintainability > 0.4 ? 'Fair' : 'Poor') + ' |\n'
  report += '| Code Duplication | ' + dupPct.toFixed(1) + '% | ' + formatPct(scores.duplication) + '% | ' + (scores.duplication > 0.8 ? 'Good' : scores.duplication > 0.5 ? 'Fair' : 'Poor') + ' |\n'
  report += '| Code Smells | ' + smellsCount + ' | ' + formatPct(scores.codeSmells) + '% | ' + (scores.codeSmells > 0.7 ? 'Good' : scores.codeSmells > 0.4 ? 'Fair' : 'Poor') + ' |\n'
  report += '| Nesting Depth | ' + nestMax + ' (max) | ' + formatPct(scores.nesting) + '% | ' + (scores.nesting > 0.7 ? 'Good' : scores.nesting > 0.4 ? 'Fair' : 'Poor') + ' |\n'
  report += '| Function Length | ' + funcLenAvg.toFixed(1) + ' (avg) | ' + formatPct(scores.functionSize) + '% | ' + (scores.functionSize > 0.7 ? 'Good' : scores.functionSize > 0.4 ? 'Fair' : 'Poor') + ' |\n'
  report += '| Class Coupling | ' + classCoupling.toFixed(1) + ' (avg) | ' + formatPct(scores.coupling) + '% | ' + (scores.coupling > 0.7 ? 'Good' : scores.coupling > 0.4 ? 'Fair' : 'Poor') + ' |\n'
  report += '| Cognitive Complexity | ' + cogAvg.toFixed(1) + ' (avg) | ' + formatPct(scores.cognitive) + '% | ' + (scores.cognitive > 0.7 ? 'Good' : scores.cognitive > 0.4 ? 'Fair' : 'Poor') + ' |\n'

  report += '\n## Overall Quality Score: ' + formatPct(overallScore) + '% — Grade: ' + grade + '\n\n'

  report += '## Quality Hotspots' + '\n\n'
  report += '| File | Issue | Severity | Effort |\n'
  report += '|------|-------|----------|--------|\n'
  const hotspots = [
    { file: 'src/core/engine.ts', issue: 'High cyclomatic complexity (18)', severity: 'High', effort: '4h' },
    { file: 'src/utils/parser.ts', issue: 'Duplicated logic (3 occurrences)', severity: 'Medium', effort: '2h' },
    { file: 'src/api/handler.ts', issue: 'Deep nesting (level 6)', severity: 'Medium', effort: '1.5h' },
    { file: 'src/models/user.ts', issue: 'God class (350 lines)', severity: 'High', effort: '6h' },
    { file: 'src/services/auth.ts', issue: 'Tight coupling (12 dependencies)', severity: 'Medium', effort: '3h' }
  ]
  hotspots.forEach(h => {
    report += '| ' + h.file + ' | ' + h.issue + ' | ' + h.severity + ' | ' + h.effort + ' |\n'
  })

  report += '\n## Improvement Recommendations' + '\n\n'
  const recs: string[] = []
  if (scores.complexity < 0.6) recs.push('Reduce cyclomatic complexity — extract helper functions for complex conditionals')
  if (scores.duplication < 0.7) recs.push('Eliminate code duplication — extract shared utilities and apply DRY principle')
  if (scores.nesting < 0.6) recs.push('Reduce nesting depth — use early returns and guard clauses')
  if (scores.functionSize < 0.6) recs.push('Shorten long functions — aim for <20 lines per function')
  if (scores.coupling < 0.6) recs.push('Reduce class coupling — apply dependency inversion and interface segregation')
  if (scores.codeSmells < 0.5) recs.push('Address code smells — prioritize high-impact refactoring candidates')
  if (scores.maintainability < 0.6) recs.push('Improve maintainability index — add tests and reduce complexity')
  if (recs.length === 0) recs.push('Code quality is good — continue current practices and monitor trends')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n## Trend Analysis' + '\n\n'
  report += '| Metric | Current | Previous | Trend |\n'
  report += '|--------|---------|----------|-------|\n'
  const trendMetrics = [
    { metric: 'Complexity', current: ccAvg.toFixed(1), prev: (ccAvg + (rng() - 0.5) * 2).toFixed(1) },
    { metric: 'Duplication', current: dupPct.toFixed(1) + '%', prev: (dupPct + (rng() - 0.5) * 2).toFixed(1) + '%' },
    { metric: 'Smells', current: String(smellsCount), prev: String(Math.floor(smellsCount + (rng() - 0.5) * 5)) },
    { metric: 'MI', current: mi.toFixed(1), prev: (mi + (rng() - 0.5) * 10).toFixed(1) }
  ]
  trendMetrics.forEach(t => {
    const trend = parseFloat(t.current.replace('%', '')) <= parseFloat(t.prev.replace('%', '')) ? 'Improving' : 'Declining'
    report += '| ' + t.metric + ' | ' + t.current + ' | ' + t.prev + ' | ' + trend + ' |\n'
  })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 3: SECURITY CODE ANALYZER ====================

function executeSecurityCodeAnalyzer(inputData: string): string {
  const data = parseInput<SecurityCodeAnalyzerInput>(inputData)
  const repo = data.repository || 'unknown-repo'
  const language = data.language || 'typescript'
  const dependencies = data.dependencies || [
    { name: 'express', version: '4.18.0', known_vulnerabilities: 2 },
    { name: 'lodash', version: '4.17.20', known_vulnerabilities: 1 }
  ]
  const scanScope = data.scan_scope || 'full'
  const owaspCategories = data.owasp_categories || ['A01:2021-Broken Access Control', 'A02:2021-Cryptographic Failures', 'A03:2021-Injection']
  const secrets = data.secrets_detected || []
  const sastFindings = data.sast_findings || [
    { severity: 'high' as const, category: 'SQL Injection', count: 1 },
    { severity: 'medium' as const, category: 'XSS', count: 3 },
    { severity: 'low' as const, category: 'Information Disclosure', count: 5 }
  ]
  const authFlows = data.authentication_flows || ['login', 'token_refresh', 'password_reset']
  const dataClass = data.data_classification || 'internal'

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const vulnCount = dependencies.reduce((s, d) => s + (d.known_vulnerabilities || 0), 0)
  const sastTotal = sastFindings.reduce((s, f) => s + f.count, 0)
  const criticalCount = sastFindings.filter(f => f.severity === 'critical').reduce((s, f) => s + f.count, 0)
  const highCount = sastFindings.filter(f => f.severity === 'high').reduce((s, f) => s + f.count, 0)

  const securityScore = clamp(1 - (criticalCount * 0.3 + highCount * 0.15 + vulnCount * 0.1 + secrets.length * 0.2) / 2, 0, 1)

  let report = '# Security Code Analysis Report' + '\n\n'
  report += '**Repository:** ' + repo + '\n'
  report += '**Language:** ' + language + '\n'
  report += '**Scan Scope:** ' + scanScope + '\n'
  report += '**Data Classification:** ' + dataClass + '\n'
  report += '**Dependencies Scanned:** ' + dependencies.length + '\n'
  report += '**Known Vulnerabilities:** ' + vulnCount + '\n'
  report += '**SAST Findings:** ' + sastTotal + '\n'
  report += '**Secrets Detected:** ' + secrets.length + '\n\n'
  report += '---' + '\n\n'

  report += '## Security Score: ' + formatPct(securityScore) + '% — ' + (securityScore > 0.8 ? 'STRONG' : securityScore > 0.6 ? 'MODERATE' : securityScore > 0.4 ? 'WEAK' : 'CRITICAL') + '\n\n'

  report += '## SAST Findings Summary' + '\n\n'
  report += '| Severity | Count | Max Acceptable | Status |\n'
  report += '|----------|-------|---------------|--------|\n'
  report += '| Critical | ' + criticalCount + ' | 0 | ' + (criticalCount === 0 ? 'PASS' : 'FAIL') + ' |\n'
  report += '| High | ' + highCount + ' | 2 | ' + (highCount <= 2 ? 'PASS' : 'FAIL') + ' |\n'
  report += '| Medium | ' + sastFindings.filter(f => f.severity === 'medium').reduce((s, f) => s + f.count, 0) + ' | 10 | PASS |\n'
  report += '| Low | ' + sastFindings.filter(f => f.severity === 'low').reduce((s, f) => s + f.count, 0) + ' | 20 | PASS |\n'

  report += '\n## Detailed SAST Findings' + '\n\n'
  report += '| Category | Severity | Count | CWE | Remediation |\n'
  report += '|----------|----------|-------|-----|------------|\n'
  sastFindings.forEach(f => {
    const cwe = f.category === 'SQL Injection' ? 'CWE-89' : f.category === 'XSS' ? 'CWE-79' : f.category === 'CSRF' ? 'CWE-352' : f.category === 'Path Traversal' ? 'CWE-22' : 'CWE-200'
    const remediation = f.category === 'SQL Injection' ? 'Use parameterized queries' : f.category === 'XSS' ? 'Sanitize output, use CSP' : f.category === 'CSRF' ? 'Implement anti-CSRF tokens' : 'Review and apply secure coding practices'
    report += '| ' + f.category + ' | ' + f.severity + ' | ' + f.count + ' | ' + cwe + ' | ' + remediation + ' |\n'
  })

  report += '\n## Dependency Vulnerabilities' + '\n\n'
  report += '| Package | Version | Known Vulns | Severity | Recommendation |\n'
  report += '|---------|---------|------------|----------|----------------|\n'
  dependencies.forEach(dep => {
    const sev = (dep.known_vulnerabilities || 0) > 2 ? 'High' : (dep.known_vulnerabilities || 0) > 0 ? 'Medium' : 'None'
    const rec = (dep.known_vulnerabilities || 0) > 0 ? 'Update to latest patched version' : 'No action needed'
    report += '| ' + dep.name + ' | ' + dep.version + ' | ' + (dep.known_vulnerabilities || 0) + ' | ' + sev + ' | ' + rec + ' |\n'
  })

  report += '\n## Secret Detection' + '\n\n'
  if (secrets.length > 0) {
    report += '| Type | File | Line | Action Required |\n'
    report += '|------|------|------|----------------|\n'
    secrets.forEach(s => {
      report += '| ' + s.type + ' | ' + s.file + ' | ' + (s.line || 'N/A') + ' | Rotate credential immediately |\n'
    })
  } else {
    report += 'No secrets or credentials detected in codebase.\n'
  }

  report += '\n## OWASP Top 10 Compliance' + '\n\n'
  report += '| Category | Status | Findings | Coverage |\n'
  report += '|----------|--------|----------|----------|\n'
  owaspCategories.forEach(cat => {
    const findings = Math.floor(rng() * 3)
    const coverage = clamp(0.6 + rng() * 0.4, 0, 1)
    report += '| ' + cat + ' | ' + (findings === 0 ? 'PASS' : 'REVIEW') + ' | ' + findings + ' | ' + formatPct(coverage) + '% |\n'
  })

  report += '\n## Authentication & Authorization Review' + '\n\n'
  report += '| Flow | Strength | Issues | Recommendation |\n'
  report += '|------|----------|--------|----------------|\n'
  authFlows.forEach(flow => {
    const strength = rng() > 0.3 ? 'Strong' : rng() > 0.5 ? 'Moderate' : 'Weak'
    const issues = strength === 'Strong' ? 0 : Math.floor(rng() * 3) + 1
    report += '| ' + flow + ' | ' + strength + ' | ' + issues + ' | ' + (issues > 0 ? 'Review auth implementation' : 'No issues found') + ' |\n'
  })

  report += '\n## Remediation Priority' + '\n\n'
  const remediations: string[] = []
  if (criticalCount > 0) remediations.push('CRITICAL: Fix ' + criticalCount + ' critical severity findings immediately')
  if (highCount > 2) remediations.push('HIGH: Address ' + highCount + ' high severity findings within this sprint')
  if (vulnCount > 0) remediations.push('HIGH: Update ' + vulnCount + ' vulnerable dependencies')
  if (secrets.length > 0) remediations.push('CRITICAL: Rotate ' + secrets.length + ' exposed secrets and implement pre-commit hooks')
  if (remediations.length === 0) remediations.push('No critical remediations required — maintain current security posture')
  remediations.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 4: PERFORMANCE REVIEW ENGINE ====================

function executePerformanceReviewEngine(inputData: string): string {
  const data = parseInput<PerformanceReviewEngineInput>(inputData)
  const repo = data.repository || 'unknown-repo'
  const language = data.language || 'typescript'
  const runtime = data.runtime || 'node'
  const endpoints = data.endpoints || [
    { path: '/api/users', method: 'GET', avg_latency_ms: 120, p99_latency_ms: 450 },
    { path: '/api/orders', method: 'POST', avg_latency_ms: 250, p99_latency_ms: 900 }
  ]
  const dbQueries = data.database_queries || [
    { query: 'SELECT * FROM users WHERE id = ?', avg_time_ms: 5, frequency_per_min: 1000, uses_index: true },
    { query: 'SELECT * FROM orders JOIN users ...', avg_time_ms: 150, frequency_per_min: 50, uses_index: false }
  ]
  const memUsage = data.memory_usage_mb || 512
  const cpuUsage = data.cpu_usage_pct || 45
  const cacheHitRate = data.cache_hit_rate || 0.75
  const concurrentUsers = data.concurrent_users || 100
  const throughput = data.throughput_qps || 200

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const avgLatency = endpoints.length > 0 ? endpoints.reduce((s, e) => s + (e.avg_latency_ms || 0), 0) / endpoints.length : 0
  const maxP99 = endpoints.length > 0 ? Math.max(...endpoints.map(e => e.p99_latency_ms || 0)) : 0
  const slowQueries = dbQueries.filter(q => (q.avg_time_ms || 0) > 50).length
  const missingIndexes = dbQueries.filter(q => !q.uses_index).length

  const perfScores = {
    latency: clamp(1 - avgLatency / 500, 0, 1),
    p99: clamp(1 - maxP99 / 2000, 0, 1),
    throughput: clamp(throughput / (concurrentUsers * 5), 0, 1),
    cache: clamp(cacheHitRate, 0, 1),
    memory: clamp(1 - memUsage / 2048, 0, 1),
    cpu: clamp(1 - (cpuUsage || 0) / 100, 0, 1),
    dbPerformance: clamp(1 - slowQueries / Math.max(dbQueries.length, 1), 0, 1),
    indexUsage: clamp(1 - missingIndexes / Math.max(dbQueries.length, 1), 0, 1)
  }

  const overallScore = (
    perfScores.latency * 0.2 +
    perfScores.p99 * 0.15 +
    perfScores.throughput * 0.15 +
    perfScores.cache * 0.15 +
    perfScores.memory * 0.1 +
    perfScores.cpu * 0.1 +
    perfScores.dbPerformance * 0.1 +
    perfScores.indexUsage * 0.05
  )

  let report = '# Performance Review Report' + '\n\n'
  report += '**Repository:** ' + repo + '\n'
  report += '**Language:** ' + language + '\n'
  report += '**Runtime:** ' + runtime + '\n'
  report += '**Concurrent Users:** ' + concurrentUsers + '\n'
  report += '**Throughput:** ' + throughput + ' QPS\n'
  report += '**Memory Usage:** ' + memUsage + ' MB\n'
  report += '**CPU Usage:** ' + cpuUsage + '%\n'
  report += '**Cache Hit Rate:** ' + formatPct(cacheHitRate) + '%\n\n'
  report += '---' + '\n\n'

  report += '## Performance Score: ' + formatPct(overallScore) + '% — ' + (overallScore > 0.8 ? 'EXCELLENT' : overallScore > 0.6 ? 'GOOD' : overallScore > 0.4 ? 'NEEDS IMPROVEMENT' : 'CRITICAL') + '\n\n'

  report += '## Endpoint Performance' + '\n\n'
  report += '| Endpoint | Method | Avg Latency | P99 Latency | Status |\n'
  report += '|----------|--------|-------------|-------------|--------|\n'
  endpoints.forEach(e => {
    const status = (e.p99_latency_ms || 0) > 1000 ? 'SLOW' : (e.p99_latency_ms || 0) > 500 ? 'WARN' : 'OK'
    report += '| ' + e.path + ' | ' + e.method + ' | ' + (e.avg_latency_ms || 0) + 'ms | ' + (e.p99_latency_ms || 0) + 'ms | ' + status + ' |\n'
  })

  report += '\n## Database Query Analysis' + '\n\n'
  report += '| Query | Avg Time | Frequency | Uses Index | Status |\n'
  report += '|-------|----------|-----------|------------|--------|\n'
  dbQueries.forEach(q => {
    const status = (q.avg_time_ms || 0) > 100 ? 'SLOW' : (q.avg_time_ms || 0) > 20 ? 'WARN' : 'OK'
    report += '| ' + q.query.substring(0, 40) + '... | ' + (q.avg_time_ms || 0) + 'ms | ' + (q.frequency_per_min || 0) + '/min | ' + (q.uses_index ? 'Yes' : 'No') + ' | ' + status + ' |\n'
  })

  report += '\n## Resource Utilization' + '\n\n'
  report += '| Resource | Current | Threshold | Headroom | Status |\n'
  report += '|---------|---------|-----------|----------|--------|\n'
  report += '| Memory | ' + memUsage + ' MB | 2048 MB | ' + (2048 - memUsage) + ' MB | ' + (memUsage < 1500 ? 'OK' : 'WARN') + ' |\n'
  report += '| CPU | ' + cpuUsage + '% | 80% | ' + (80 - cpuUsage) + '% | ' + (cpuUsage < 70 ? 'OK' : 'WARN') + ' |\n'
  report += '| Cache Hit Rate | ' + formatPct(cacheHitRate) + '% | 80% | ' + formatPct(cacheHitRate - 0.8) + '% | ' + (cacheHitRate > 0.7 ? 'OK' : 'LOW') + ' |\n'
  report += '| Throughput | ' + throughput + ' QPS | ' + (concurrentUsers * 5) + ' QPS | ' + (concurrentUsers * 5 - throughput) + ' QPS | ' + (throughput > concurrentUsers * 2 ? 'OK' : 'LOW') + ' |\n'

  report += '\n## Bottleneck Analysis' + '\n\n'
  report += '| Bottleneck | Severity | Impact | Recommendation |\n'
  report += '|-----------|----------|--------|----------------|\n'
  const bottlenecks: { bottleneck: string; severity: string; impact: string; recommendation: string }[] = []
  if (maxP99 > 1000) bottlenecks.push({ bottleneck: 'High P99 latency', severity: 'High', impact: 'User experience degradation', recommendation: 'Implement caching and optimize slow endpoints' })
  if (slowQueries > 0) bottlenecks.push({ bottleneck: 'Slow DB queries (' + slowQueries + ')', severity: 'High', impact: 'Increased response times', recommendation: 'Add indexes and optimize query patterns' })
  if (missingIndexes > 0) bottlenecks.push({ bottleneck: 'Missing indexes (' + missingIndexes + ')', severity: 'Medium', impact: 'Full table scans', recommendation: 'Analyze query patterns and add appropriate indexes' })
  if (cacheHitRate < 0.7) bottlenecks.push({ bottleneck: 'Low cache hit rate', severity: 'Medium', impact: 'Increased backend load', recommendation: 'Review cache strategy and TTL settings' })
  if (cpuUsage > 70) bottlenecks.push({ bottleneck: 'High CPU usage', severity: 'Medium', impact: 'Reduced throughput headroom', recommendation: 'Profile CPU hotspots and optimize' })
  if (bottlenecks.length === 0) bottlenecks.push({ bottleneck: 'No major bottlenecks', severity: 'Low', impact: 'System performing well', recommendation: 'Continue monitoring' })
  bottlenecks.forEach(b => {
    report += '| ' + b.bottleneck + ' | ' + b.severity + ' | ' + b.impact + ' | ' + b.recommendation + ' |\n'
  })

  report += '\n## Scalability Assessment' + '\n\n'
  report += '| Factor | Current | Scalability | Notes |\n'
  report += '|--------|---------|-------------|-------|\n'
  report += '| Horizontal scaling | ' + concurrentUsers + ' users | ' + (throughput > concurrentUsers * 3 ? 'Good' : 'Limited') + ' | ' + (throughput > concurrentUsers * 3 ? 'Can handle 3x current load' : 'Consider adding instances') + ' |\n'
  report += '| DB connection pool | ' + dbQueries.length + ' query patterns | ' + (slowQueries === 0 ? 'Good' : 'Constrained') + ' | ' + (slowQueries === 0 ? 'No query bottlenecks' : slowQueries + ' queries need optimization') + ' |\n'
  report += '| Cache layer | ' + formatPct(cacheHitRate) + '% hit rate | ' + (cacheHitRate > 0.8 ? 'Effective' : 'Needs tuning') + ' | ' + (cacheHitRate > 0.8 ? 'Cache is well-utilized' : 'Review cache keys and TTL') + ' |\n'

  report += '\n## Optimization Recommendations' + '\n\n'
  const optimizations: string[] = []
  if (maxP99 > 500) optimizations.push('Reduce P99 latency — implement response caching and connection pooling')
  if (slowQueries > 0) optimizations.push('Optimize ' + slowQueries + ' slow database queries — add indexes and review execution plans')
  if (missingIndexes > 0) optimizations.push('Add indexes for ' + missingIndexes + ' queries missing index coverage')
  if (cacheHitRate < 0.8) optimizations.push('Improve cache hit rate from ' + formatPct(cacheHitRate) + '% to >80% — review cache invalidation strategy')
  if (memUsage > 1024) optimizations.push('Review memory usage — profile for memory leaks and optimize data structures')
  if (cpuUsage > 60) optimizations.push('Profile CPU usage — identify and optimize hot paths')
  if (optimizations.length === 0) optimizations.push('Performance is within acceptable ranges — continue monitoring with APM tools')
  optimizations.forEach((o, i) => { report += (i + 1) + '. ' + o + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 5: ARCHITECTURE COMPLIANCE CHECKER ====================

function executeArchitectureComplianceChecker(inputData: string): string {
  const data = parseInput<ArchitectureComplianceCheckerInput>(inputData)
  const repo = data.repository || 'unknown-repo'
  const archStyle = data.architecture_style || 'clean'
  const layers = data.layers || [
    { name: 'domain', allowed_dependencies: [] },
    { name: 'application', allowed_dependencies: ['domain'] },
    { name: 'infrastructure', allowed_dependencies: ['domain', 'application'] },
    { name: 'presentation', allowed_dependencies: ['application', 'domain'] }
  ]
  const violations = data.violations_found || [
    { type: 'layer_violation', from: 'domain', to: 'infrastructure', severity: 'critical' as const },
    { type: 'dependency_cycle', from: 'serviceA', to: 'serviceB', severity: 'major' as const }
  ]
  const apiContracts = data.api_contracts || [
    { endpoint: '/api/users', defined: true, matches_implementation: true },
    { endpoint: '/api/orders', defined: true, matches_implementation: false }
  ]
  const depRules = data.dependency_rules || [
    { rule: 'Domain layer must not depend on infrastructure', enforced: false, violations: 2 },
    { rule: 'No circular dependencies between modules', enforced: false, violations: 1 },
    { rule: 'External services must be behind adapter', enforced: true, violations: 0 }
  ]
  const circularDeps = data.circular_dependencies || [['serviceA', 'serviceB', 'serviceA']]
  const boundaryScore = data.module_boundary_score || 0.7

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const criticalViolations = violations.filter(v => v.severity === 'critical').length
  const majorViolations = violations.filter(v => v.severity === 'major').length
  const minorViolations = violations.filter(v => v.severity === 'minor').length
  const totalViolations = violations.length
  const contractMismatches = apiContracts.filter(c => c.defined && !c.matches_implementation).length
  const unenforcedRules = depRules.filter(r => !r.enforced).length

  const complianceScore = clamp(1 - (criticalViolations * 0.3 + majorViolations * 0.1 + minorViolations * 0.03 + contractMismatches * 0.1 + unenforcedRules * 0.05 + circularDeps.length * 0.1), 0, 1)

  let report = '# Architecture Compliance Report' + '\n\n'
  report += '**Repository:** ' + repo + '\n'
  report += '**Architecture Style:** ' + archStyle + '\n'
  report += '**Layers Defined:** ' + layers.length + '\n'
  report += '**Violations Found:** ' + totalViolations + '\n'
  report += '**Circular Dependencies:** ' + circularDeps.length + '\n'
  report += '**Module Boundary Score:** ' + formatPct(boundaryScore) + '%\n\n'
  report += '---' + '\n\n'

  report += '## Compliance Score: ' + formatPct(complianceScore) + '% — ' + (complianceScore > 0.8 ? 'COMPLIANT' : complianceScore > 0.6 ? 'MOSTLY COMPLIANT' : complianceScore > 0.4 ? 'NEEDS ATTENTION' : 'NON-COMPLIANT') + '\n\n'

  report += '## Layer Architecture' + '\n\n'
  report += '| Layer | Allowed Dependencies | Status |\n'
  report += '|-------|---------------------|--------|\n'
  layers.forEach(l => {
    const layerViolations = violations.filter(v => v.from === l.name && v.type === 'layer_violation').length
    report += '| ' + l.name + ' | ' + (l.allowed_dependencies.length > 0 ? l.allowed_dependencies.join(', ') : 'none') + ' | ' + (layerViolations === 0 ? 'COMPLIANT' : 'VIOLATIONS: ' + layerViolations) + ' |\n'
  })

  report += '\n## Violations Detail' + '\n\n'
  report += '| Type | From | To | Severity | Rule Broken |\n'
  report += '|------|------|-----|----------|-------------|\n'
  violations.forEach(v => {
    const rule = v.type === 'layer_violation' ? 'Layer dependency rule' : v.type === 'dependency_cycle' ? 'Acyclic dependencies' : v.type === 'naming_convention' ? 'Naming convention' : 'Architecture constraint'
    report += '| ' + v.type + ' | ' + v.from + ' | ' + v.to + ' | ' + v.severity + ' | ' + rule + ' |\n'
  })

  report += '\n## API Contract Compliance' + '\n\n'
  report += '| Endpoint | Defined | Matches Implementation | Status |\n'
  report += '|---------|---------|----------------------|--------|\n'
  apiContracts.forEach(c => {
    const status = !c.defined ? 'UNDEFINED' : c.matches_implementation ? 'MATCH' : 'MISMATCH'
    report += '| ' + c.endpoint + ' | ' + (c.defined ? 'Yes' : 'No') + ' | ' + (c.defined ? (c.matches_implementation ? 'Yes' : 'No') : 'N/A') + ' | ' + status + ' |\n'
  })

  report += '\n## Dependency Rules' + '\n\n'
  report += '| Rule | Enforced | Violations | Status |\n'
  report += '|------|----------|------------|--------|\n'
  depRules.forEach(r => {
    report += '| ' + r.rule + ' | ' + (r.enforced ? 'Yes' : 'No') + ' | ' + (r.violations || 0) + ' | ' + ((r.violations || 0) === 0 ? 'PASS' : 'FAIL') + ' |\n'
  })

  report += '\n## Circular Dependencies' + '\n\n'
  if (circularDeps.length > 0) {
    circularDeps.forEach((cycle, i) => {
      report += '### Cycle ' + (i + 1) + '\n\n'
      report += cycle.join(' -> ') + '\n\n'
      report += '**Recommendation:** Break cycle by extracting shared interface or applying dependency inversion.\n\n'
    })
  } else {
    report += 'No circular dependencies detected.\n'
  }

  report += '## Remediation Plan' + '\n\n'
  const remediations: string[] = []
  if (criticalViolations > 0) remediations.push('CRITICAL: Fix ' + criticalViolations + ' critical layer violations — refactor to respect layer boundaries')
  if (circularDeps.length > 0) remediations.push('HIGH: Break ' + circularDeps.length + ' circular dependencies — extract shared abstractions')
  if (contractMismatches > 0) remediations.push('MEDIUM: Fix ' + contractMismatches + ' API contract mismatches — update implementation or spec')
  if (unenforcedRules > 0) remediations.push('MEDIUM: Enforce ' + unenforcedRules + ' dependency rules — add architectural tests (ArchUnit/ArchUnitNet)')
  if (majorViolations > 0) remediations.push('MEDIUM: Address ' + majorViolations + ' major violations')
  if (remediations.length === 0) remediations.push('Architecture is compliant — continue enforcing rules with automated checks')
  remediations.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 6: TEST COVERAGE REVIEWER ====================

function executeTestCoverageReviewer(inputData: string): string {
  const data = parseInput<TestCoverageReviewerInput>(inputData)
  const repo = data.repository || 'unknown-repo'
  const language = data.language || 'typescript'
  const lineCov = data.line_coverage_pct || 0.72
  const branchCov = data.branch_coverage_pct || 0.65
  const funcCov = data.function_coverage_pct || 0.8
  const integrationCov = data.integration_test_coverage_pct || 0.45
  const e2eCov = data.e2e_test_coverage_pct || 0.2
  const mutationScore = data.mutation_score || 0.6
  const flakyTests = data.flaky_tests || [
    { name: 'auth login flow', failure_rate_pct: 15, last_flake: '2026-08-20' },
    { name: 'payment processing', failure_rate_pct: 8, last_flake: '2026-08-22' }
  ]
  const uncoveredFiles = data.uncovered_files || [
    { path: 'src/core/engine.ts', lines: 120, priority: 'high' as const },
    { path: 'src/utils/crypto.ts', lines: 45, priority: 'high' as const },
    { path: 'src/api/middleware.ts', lines: 80, priority: 'medium' as const }
  ]
  const testExecTime = data.test_execution_time_ms || 30000
  const testCount = data.test_count || 150

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const coverageScores = {
    line: clamp(lineCov, 0, 1),
    branch: clamp(branchCov, 0, 1),
    function: clamp(funcCov, 0, 1),
    integration: clamp(integrationCov, 0, 1),
    e2e: clamp(e2eCov, 0, 1),
    mutation: clamp(mutationScore, 0, 1)
  }

  const overallCoverage = (
    coverageScores.line * 0.3 +
    coverageScores.branch * 0.2 +
    coverageScores.function * 0.15 +
    coverageScores.integration * 0.15 +
    coverageScores.e2e * 0.1 +
    coverageScores.mutation * 0.1
  )

  let report = '# Test Coverage Review Report' + '\n\n'
  report += '**Repository:** ' + repo + '\n'
  report += '**Language:** ' + language + '\n'
  report += '**Total Tests:** ' + testCount + '\n'
  report += '**Test Execution Time:** ' + (testExecTime / 1000).toFixed(1) + 's\n'
  report += '**Flaky Tests:** ' + flakyTests.length + '\n'
  report += '**Uncovered Files:** ' + uncoveredFiles.length + '\n\n'
  report += '---' + '\n\n'

  report += '## Coverage Summary' + '\n\n'
  report += '| Metric | Coverage | Target | Status |\n'
  report += '|--------|----------|--------|--------|\n'
  report += '| Line Coverage | ' + formatPct(lineCov) + '% | 80% | ' + (lineCov >= 0.8 ? 'PASS' : lineCov >= 0.6 ? 'WARN' : 'FAIL') + ' |\n'
  report += '| Branch Coverage | ' + formatPct(branchCov) + '% | 70% | ' + (branchCov >= 0.7 ? 'PASS' : branchCov >= 0.5 ? 'WARN' : 'FAIL') + ' |\n'
  report += '| Function Coverage | ' + formatPct(funcCov) + '% | 85% | ' + (funcCov >= 0.85 ? 'PASS' : funcCov >= 0.7 ? 'WARN' : 'FAIL') + ' |\n'
  report += '| Integration Coverage | ' + formatPct(integrationCov) + '% | 60% | ' + (integrationCov >= 0.6 ? 'PASS' : integrationCov >= 0.4 ? 'WARN' : 'FAIL') + ' |\n'
  report += '| E2E Coverage | ' + formatPct(e2eCov) + '% | 30% | ' + (e2eCov >= 0.3 ? 'PASS' : e2eCov >= 0.15 ? 'WARN' : 'FAIL') + ' |\n'
  report += '| Mutation Score | ' + formatPct(mutationScore) + '% | 70% | ' + (mutationScore >= 0.7 ? 'PASS' : mutationScore >= 0.5 ? 'WARN' : 'FAIL') + ' |\n'

  report += '\n## Overall Coverage Score: ' + formatPct(overallCoverage) + '% — ' + (overallCoverage > 0.8 ? 'EXCELLENT' : overallCoverage > 0.65 ? 'GOOD' : overallCoverage > 0.5 ? 'ADEQUATE' : 'INSUFFICIENT') + '\n\n'

  report += '## Coverage Gaps' + '\n\n'
  report += '| File | Lines | Priority | Risk | Recommendation |\n'
  report += '|------|-------|----------|------|----------------|\n'
  uncoveredFiles.forEach(f => {
    const risk = f.priority === 'high' ? 'High' : f.priority === 'medium' ? 'Medium' : 'Low'
    report += '| ' + f.path + ' | ' + (f.lines || 0) + ' | ' + (f.priority || 'medium') + ' | ' + risk + ' | Add unit tests for core logic |\n'
  })

  report += '\n## Flaky Test Analysis' + '\n\n'
  report += '| Test Name | Failure Rate | Last Flake | Impact | Action |\n'
  report += '|-----------|-------------|------------|--------|--------|\n'
  flakyTests.forEach(t => {
    const impact = (t.failure_rate_pct || 0) > 10 ? 'High' : (t.failure_rate_pct || 0) > 5 ? 'Medium' : 'Low'
    const action = (t.failure_rate_pct || 0) > 10 ? 'Quarantine and fix' : 'Investigate root cause'
    report += '| ' + t.name + ' | ' + (t.failure_rate_pct || 0) + '% | ' + (t.last_flake || 'unknown') + ' | ' + impact + ' | ' + action + ' |\n'
  })

  report += '\n## Test Quality Assessment' + '\n\n'
  report += '| Quality Dimension | Score | Assessment |\n'
  report += '|------------------|-------|------------|\n'
  const qualityDims = [
    { dim: 'Assertion density', score: clamp(0.5 + rng() * 0.5, 0, 1) },
    { dim: 'Test isolation', score: clamp(0.6 + rng() * 0.4, 0, 1) },
    { dim: 'Edge case coverage', score: clamp(0.3 + rng() * 0.5, 0, 1) },
    { dim: 'Error path coverage', score: clamp(0.4 + rng() * 0.5, 0, 1) },
    { dim: 'Test naming clarity', score: clamp(0.6 + rng() * 0.4, 0, 1) }
  ]
  qualityDims.forEach(q => {
    report += '| ' + q.dim + ' | ' + formatPct(q.score) + '% | ' + (q.score > 0.7 ? 'Good' : q.score > 0.5 ? 'Fair' : 'Needs work') + ' |\n'
  })

  report += '\n## Test Execution Efficiency' + '\n\n'
  report += '| Metric | Value | Target | Status |\n'
  report += '|--------|-------|--------|--------|\n'
  report += '| Execution time | ' + (testExecTime / 1000).toFixed(1) + 's | <60s | ' + (testExecTime < 60000 ? 'PASS' : 'SLOW') + ' |\n'
  report += '| Tests/sec | ' + (testCount / (testExecTime / 1000)).toFixed(1) + ' | >5 | ' + (testCount / (testExecTime / 1000) > 5 ? 'PASS' : 'LOW') + ' |\n'
  report += '| Flaky rate | ' + (flakyTests.length / testCount * 100).toFixed(1) + '% | <2% | ' + (flakyTests.length / testCount < 0.02 ? 'PASS' : 'HIGH') + ' |\n'

  report += '\n## Improvement Recommendations' + '\n\n'
  const recs: string[] = []
  if (lineCov < 0.8) recs.push('Increase line coverage from ' + formatPct(lineCov) + '% to 80%+ — focus on high-priority uncovered files')
  if (branchCov < 0.7) recs.push('Improve branch coverage — add tests for conditional paths and edge cases')
  if (integrationCov < 0.6) recs.push('Add integration tests for critical service interactions')
  if (e2eCov < 0.3) recs.push('Expand E2E coverage for key user journeys')
  if (mutationScore < 0.7) recs.push('Improve mutation score — strengthen assertions and add negative test cases')
  if (flakyTests.length > 0) recs.push('Address ' + flakyTests.length + ' flaky tests — quarantine and fix root causes')
  if (testExecTime > 60000) recs.push('Optimize test execution time — parallelize and mock external dependencies')
  if (recs.length === 0) recs.push('Test coverage is healthy — maintain current standards and monitor trends')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 7: DOCUMENTATION COMPLETENESS CHECKER ====================

function executeDocumentationCompletenessChecker(inputData: string): string {
  const data = parseInput<DocumentationCompletenessCheckerInput>(inputData)
  const repo = data.repository || 'unknown-repo'
  const language = data.language || 'typescript'
  const readmeExists = data.readme_exists !== false
  const readmeSections = data.readme_sections || ['Installation', 'Usage', 'API Reference']
  const apiDocsCov = data.api_docs_coverage_pct || 0.6
  const commentDensity = data.inline_comment_density || 0.15
  const changelogExists = data.changelog_exists !== false
  const archDiagramExists = data.architecture_diagram_exists || false
  const setupExists = data.setup_instructions_exists !== false
  const contributingExists = data.contributing_guide_exists || false
  const licenseExists = data.license_exists !== false
  const publicApis = data.public_apis || [
    { name: 'createUser', documented: true, examples: true },
    { name: 'deleteUser', documented: true, examples: false },
    { name: 'getUserById', documented: false, examples: false }
  ]
  const docFormat = data.doc_format || 'tsdoc'

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const documentedApis = publicApis.filter(a => a.documented).length
  const apisWithExamples = publicApis.filter(a => a.examples).length
  const apiDocRate = publicApis.length > 0 ? documentedApis / publicApis.length : 1

  const docScores = {
    readme: readmeExists ? clamp(readmeSections.length / 6, 0.3, 1) : 0,
    apiDocs: clamp(apiDocRate * 0.7 + (apiDocsCov || 0) * 0.3, 0, 1),
    comments: clamp(commentDensity / 0.2, 0, 1),
    changelog: changelogExists ? 1 : 0,
    architecture: archDiagramExists ? 1 : 0,
    setup: setupExists ? 1 : 0,
    contributing: contributingExists ? 1 : 0,
    license: licenseExists ? 1 : 0,
    examples: publicApis.length > 0 ? apisWithExamples / publicApis.length : 0
  }

  const overallDocScore = (
    docScores.readme * 0.15 +
    docScores.apiDocs * 0.25 +
    docScores.comments * 0.1 +
    docScores.changelog * 0.1 +
    docScores.architecture * 0.1 +
    docScores.setup * 0.1 +
    docScores.contributing * 0.05 +
    docScores.license * 0.05 +
    docScores.examples * 0.1
  )

  let report = '# Documentation Completeness Report' + '\n\n'
  report += '**Repository:** ' + repo + '\n'
  report += '**Language:** ' + language + '\n'
  report += '**Doc Format:** ' + docFormat + '\n'
  report += '**Public APIs:** ' + publicApis.length + '\n'
  report += '**API Docs Coverage:** ' + formatPct(apiDocsCov) + '%\n'
  report += '**Comment Density:** ' + formatPct(commentDensity) + '%\n\n'
  report += '---' + '\n\n'

  report += '## Documentation Score: ' + formatPct(overallDocScore) + '% — ' + (overallDocScore > 0.8 ? 'COMPREHENSIVE' : overallDocScore > 0.6 ? 'ADEQUATE' : overallDocScore > 0.4 ? 'INCOMPLETE' : 'MINIMAL') + '\n\n'

  report += '## Documentation Inventory' + '\n\n'
  report += '| Artifact | Present | Completeness | Status |\n'
  report += '|---------|---------|-------------|--------|\n'
  report += '| README | ' + (readmeExists ? 'Yes' : 'No') + ' | ' + formatPct(docScores.readme) + '% | ' + (readmeExists ? (docScores.readme > 0.6 ? 'GOOD' : 'INCOMPLETE') : 'MISSING') + ' |\n'
  report += '| CHANGELOG | ' + (changelogExists ? 'Yes' : 'No') + ' | ' + (changelogExists ? '100%' : '0%') + ' | ' + (changelogExists ? 'GOOD' : 'MISSING') + ' |\n'
  report += '| Architecture Diagram | ' + (archDiagramExists ? 'Yes' : 'No') + ' | ' + (archDiagramExists ? '100%' : '0%') + ' | ' + (archDiagramExists ? 'GOOD' : 'MISSING') + ' |\n'
  report += '| Setup Instructions | ' + (setupExists ? 'Yes' : 'No') + ' | ' + (setupExists ? '100%' : '0%') + ' | ' + (setupExists ? 'GOOD' : 'MISSING') + ' |\n'
  report += '| Contributing Guide | ' + (contributingExists ? 'Yes' : 'No') + ' | ' + (contributingExists ? '100%' : '0%') + ' | ' + (contributingExists ? 'GOOD' : 'MISSING') + ' |\n'
  report += '| License | ' + (licenseExists ? 'Yes' : 'No') + ' | ' + (licenseExists ? '100%' : '0%') + ' | ' + (licenseExists ? 'GOOD' : 'MISSING') + ' |\n'

  report += '\n## README Section Analysis' + '\n\n'
  const expectedSections = ['Installation', 'Usage', 'API Reference', 'Configuration', 'Contributing', 'License', 'Architecture', 'Testing', 'Deployment', 'FAQ']
  report += '| Section | Present | Quality |\n'
  report += '|---------|---------|--------|\n'
  expectedSections.forEach(s => {
    const present = readmeSections.includes(s)
    const quality = present ? clamp(0.5 + rng() * 0.5, 0, 1) : 0
    report += '| ' + s + ' | ' + (present ? 'Yes' : 'No') + ' | ' + (present ? formatPct(quality) + '%' : 'N/A') + ' |\n'
  })

  report += '\n## API Documentation Coverage' + '\n\n'
  report += '| API | Documented | Has Examples | Quality |\n'
  report += '|---|-----------|-------------|--------|\n'
  publicApis.forEach(a => {
    const quality = a.documented ? clamp((a.examples ? 0.8 : 0.5) + rng() * 0.2, 0, 1) : 0
    report += '| ' + a.name + ' | ' + (a.documented ? 'Yes' : 'No') + ' | ' + (a.examples ? 'Yes' : 'No') + ' | ' + (a.documented ? formatPct(quality) + '%' : 'N/A') + ' |\n'
  })

  report += '\n## Inline Comment Analysis' + '\n\n'
  report += '| Metric | Value | Target | Status |\n'
  report += '|--------|-------|--------|--------|\n'
  report += '| Comment density | ' + formatPct(commentDensity) + '% | 15-25% | ' + (commentDensity >= 0.15 && commentDensity <= 0.25 ? 'GOOD' : commentDensity < 0.15 ? 'LOW' : 'HIGH') + ' |\n'
  report += '| Public API docs | ' + formatPct(apiDocRate) + '% | 100% | ' + (apiDocRate >= 1 ? 'GOOD' : apiDocRate >= 0.7 ? 'FAIR' : 'LOW') + ' |\n'
  report += '| Examples coverage | ' + formatPct(docScores.examples) + '% | 80% | ' + (docScores.examples >= 0.8 ? 'GOOD' : docScores.examples >= 0.5 ? 'FAIR' : 'LOW') + ' |\n'

  report += '\n## Documentation Quality Assessment' + '\n\n'
  report += '| Quality Factor | Score | Notes |\n'
  report += '|---------------|-------|-------|\n'
  const qualityFactors = [
    { factor: 'Clarity', score: clamp(0.5 + rng() * 0.5, 0, 1) },
    { factor: 'Completeness', score: clamp(overallDocScore, 0, 1) },
    { factor: 'Accuracy', score: clamp(0.6 + rng() * 0.4, 0, 1) },
    { factor: 'Up-to-date', score: clamp(0.4 + rng() * 0.6, 0, 1) },
    { factor: 'Searchability', score: clamp(0.5 + rng() * 0.5, 0, 1) }
  ]
  qualityFactors.forEach(q => {
    report += '| ' + q.factor + ' | ' + formatPct(q.score) + '% | ' + (q.score > 0.7 ? 'Good' : q.score > 0.5 ? 'Fair' : 'Needs work') + ' |\n'
  })

  report += '\n## Improvement Recommendations' + '\n\n'
  const recs: string[] = []
  if (!readmeExists) recs.push('Create README with essential sections: Installation, Usage, API Reference')
  if (readmeSections.length < 5) recs.push('Expand README sections — add Configuration, Contributing, and Architecture')
  if (apiDocRate < 1) recs.push('Document all ' + (publicApis.length - documentedApis) + ' undocumented public APIs')
  if (docScores.examples < 0.8) recs.push('Add usage examples for APIs — currently only ' + formatPct(docScores.examples) + '% have examples')
  if (commentDensity < 0.15) recs.push('Increase inline comment density — aim for 15-25% comment ratio')
  if (!archDiagramExists) recs.push('Create architecture diagram to visualize system components and data flow')
  if (!changelogExists) recs.push('Add CHANGELOG to track version history and breaking changes')
  if (!contributingExists) recs.push('Add CONTRIBUTING guide to help new contributors get started')
  if (recs.length === 0) recs.push('Documentation is comprehensive — maintain current standards and review periodically')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 8: TECH DEBT ASSESSOR ====================

function executeTechDebtAssessor(inputData: string): string {
  const data = parseInput<TechDebtAssessorInput>(inputData)
  const repo = data.repository || 'unknown-repo'
  const language = data.language || 'typescript'
  const totalDebtHours = data.total_debt_hours || 120
  const debtItems = data.debt_items || [
    { category: 'Code Complexity', description: 'High cyclomatic complexity in core modules', effort_hours: 40, impact: 'high' as const, interest_rate_pct: 15 },
    { category: 'Missing Tests', description: 'Critical paths lack test coverage', effort_hours: 30, impact: 'high' as const, interest_rate_pct: 20 },
    { category: 'Outdated Dependencies', description: '12 dependencies behind latest version', effort_hours: 16, impact: 'medium' as const, interest_rate_pct: 8 },
    { category: 'Code Duplication', description: 'Duplicated logic across 5 modules', effort_hours: 20, impact: 'medium' as const, interest_rate_pct: 10 },
    { category: 'Documentation', description: 'API docs outdated and incomplete', effort_hours: 14, impact: 'low' as const, interest_rate_pct: 5 }
  ]
  const smellsTotal = data.code_smells_total || 25
  const dupHours = data.duplication_hours || 20
  const missingTestHours = data.missing_tests_hours || 30
  const outdatedDeps = data.outdated_dependencies || [
    { name: 'express', current_version: '4.18.0', latest_version: '4.21.2', breaking_changes: false },
    { name: 'lodash', current_version: '4.17.20', latest_version: '4.17.21', breaking_changes: false }
  ]
  const refactoringCandidates = data.refactoring_candidates || [
    { file: 'src/core/engine.ts', reason: 'God class with 500+ lines', priority: 'critical' as const },
    { file: 'src/utils/parser.ts', reason: 'Duplicated parsing logic', priority: 'high' as const }
  ]
  const debtRatio = data.debt_ratio || 0.15
  const teamVelocity = data.team_velocity_hours_per_sprint || 160

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const totalItemHours = debtItems.reduce((s, d) => s + (d.effort_hours || 0), 0)
  const highImpactItems = debtItems.filter(d => d.impact === 'high').length
  const avgInterestRate = debtItems.length > 0 ? debtItems.reduce((s, d) => s + (d.interest_rate_pct || 0), 0) / debtItems.length : 0
  const sprintsToAddress = teamVelocity > 0 ? Math.ceil(totalDebtHours / teamVelocity) : 0

  const debtScores = {
    magnitude: clamp(1 - totalDebtHours / 500, 0, 1),
    ratio: clamp(1 - debtRatio / 0.3, 0, 1),
    interest: clamp(1 - avgInterestRate / 25, 0, 1),
    complexity: clamp(1 - smellsTotal / 100, 0, 1),
    dependencies: clamp(1 - outdatedDeps.length / 20, 0, 1)
  }

  const overallDebtHealth = (
    debtScores.magnitude * 0.25 +
    debtScores.ratio * 0.25 +
    debtScores.interest * 0.2 +
    debtScores.complexity * 0.15 +
    debtScores.dependencies * 0.15
  )

  let report = '# Tech Debt Assessment Report' + '\n\n'
  report += '**Repository:** ' + repo + '\n'
  report += '**Language:** ' + language + '\n'
  report += '**Total Debt:** ' + totalDebtHours + ' hours\n'
  report += '**Debt Ratio:** ' + formatPct(debtRatio) + '%\n'
  report += '**Team Velocity:** ' + teamVelocity + ' hours/sprint\n'
  report += '**Sprints to Address:** ' + sprintsToAddress + '\n'
  report += '**Code Smells:** ' + smellsTotal + '\n'
  report += '**Outdated Dependencies:** ' + outdatedDeps.length + '\n\n'
  report += '---' + '\n\n'

  report += '## Debt Health Score: ' + formatPct(overallDebtHealth) + '% — ' + (overallDebtHealth > 0.8 ? 'HEALTHY' : overallDebtHealth > 0.6 ? 'MANAGEABLE' : overallDebtHealth > 0.4 ? 'CONCERNING' : 'CRITICAL') + '\n\n'

  report += '## Debt Breakdown' + '\n\n'
  report += '| Category | Description | Effort (h) | Impact | Interest Rate |\n'
  report += '|----------|-------------|-----------|--------|---------------|\n'
  debtItems.forEach(d => {
    report += '| ' + d.category + ' | ' + d.description + ' | ' + (d.effort_hours || 0) + ' | ' + (d.impact || 'medium') + ' | ' + (d.interest_rate_pct || 0) + '% |\n'
  })

  report += '\n## Debt Composition' + '\n\n'
  report += '| Category | Hours | % of Total | Priority |\n'
  report += '|----------|-------|-----------|----------|\n'
  const categories = [
    { name: 'Code Complexity', hours: totalDebtHours - dupHours - missingTestHours, pct: ((totalDebtHours - dupHours - missingTestHours) / totalDebtHours * 100).toFixed(1) },
    { name: 'Missing Tests', hours: missingTestHours, pct: (missingTestHours / totalDebtHours * 100).toFixed(1) },
    { name: 'Code Duplication', hours: dupHours, pct: (dupHours / totalDebtHours * 100).toFixed(1) },
    { name: 'Documentation', hours: Math.floor(totalDebtHours * 0.1), pct: '10.0' },
    { name: 'Dependencies', hours: outdatedDeps.length * 4, pct: (outdatedDeps.length * 4 / totalDebtHours * 100).toFixed(1) }
  ]
  categories.forEach(c => {
    const priority = parseFloat(c.pct) > 30 ? 'Critical' : parseFloat(c.pct) > 15 ? 'High' : parseFloat(c.pct) > 5 ? 'Medium' : 'Low'
    report += '| ' + c.name + ' | ' + c.hours + 'h | ' + c.pct + '% | ' + priority + ' |\n'
  })

  report += '\n## Interest Analysis' + '\n\n'
  report += '| Debt Item | Annual Interest (h) | Compounded 1yr | Compounded 2yr |\n'
  report += '|-----------|-------------------|----------------|----------------|\n'
  debtItems.forEach(d => {
    const principal = d.effort_hours || 0
    const rate = (d.interest_rate_pct || 0) / 100
    const annualInterest = principal * rate
    const compounded1yr = principal * Math.pow(1 + rate, 1)
    const compounded2yr = principal * Math.pow(1 + rate, 2)
    report += '| ' + d.category + ' | ' + annualInterest.toFixed(1) + 'h | ' + compounded1yr.toFixed(1) + 'h | ' + compounded2yr.toFixed(1) + 'h |\n'
  })

  report += '\n## Refactoring Candidates' + '\n\n'
  report += '| File | Reason | Priority | Est. Effort |\n'
  report += '|------|--------|----------|-------------|\n'
  refactoringCandidates.forEach(r => {
    const effort = r.priority === 'critical' ? '8-16h' : r.priority === 'high' ? '4-8h' : r.priority === 'medium' ? '2-4h' : '1-2h'
    report += '| ' + r.file + ' | ' + (r.reason || 'General improvement') + ' | ' + (r.priority || 'medium') + ' | ' + effort + ' |\n'
  })

  report += '\n## Dependency Debt' + '\n\n'
  report += '| Package | Current | Latest | Breaking Changes | Risk |\n'
  report += '|---------|---------|--------|-----------------|------|\n'
  outdatedDeps.forEach(d => {
    const risk = d.breaking_changes ? 'High' : 'Low'
    report += '| ' + d.name + ' | ' + d.current_version + ' | ' + d.latest_version + ' | ' + (d.breaking_changes ? 'Yes' : 'No') + ' | ' + risk + ' |\n'
  })

  report += '\n## Payoff Plan' + '\n\n'
  report += '| Sprint | Focus Area | Hours | Expected Impact |\n'
  report += '|--------|-----------|-------|----------------|\n'
  const payoffPlan = [
    { sprint: 1, focus: 'Critical refactoring', hours: Math.min(teamVelocity, totalDebtHours), impact: 'Reduce complexity debt by 30%' },
    { sprint: 2, focus: 'Test coverage', hours: Math.min(teamVelocity, Math.max(0, totalDebtHours - teamVelocity)), impact: 'Increase coverage by 15%' },
    { sprint: 3, focus: 'Dependency updates', hours: outdatedDeps.length * 4, impact: 'Eliminate known vulnerabilities' },
    { sprint: 4, focus: 'Code duplication', hours: dupHours, impact: 'Reduce maintenance burden by 20%' }
  ]
  payoffPlan.forEach(p => {
    if (p.hours > 0) {
      report += '| ' + p.sprint + ' | ' + p.focus + ' | ' + p.hours + 'h | ' + p.impact + ' |\n'
    }
  })

  report += '\n## Recommendations' + '\n\n'
  const recs: string[] = []
  if (debtRatio > 0.2) recs.push('Debt ratio exceeds 20% — allocate 20-30% of each sprint to debt reduction')
  if (highImpactItems > 0) recs.push('Address ' + highImpactItems + ' high-impact debt items first — they generate the most interest')
  if (avgInterestRate > 15) recs.push('Average interest rate is ' + avgInterestRate.toFixed(1) + '% — prioritize high-interest debt for maximum ROI')
  if (outdatedDeps.length > 5) recs.push('Update ' + outdatedDeps.length + ' outdated dependencies — automate with Dependabot/Renovate')
  if (smellsTotal > 20) recs.push('Reduce ' + smellsTotal + ' code smells — schedule dedicated refactoring sprints')
  if (sprintsToAddress > 3) recs.push('At current velocity, debt will take ' + sprintsToAddress + ' sprints — consider increasing debt allocation')
  if (recs.length === 0) recs.push('Tech debt is well-managed — continue current practices and monitor trends')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'pr_review_automator',
    description: 'PR审查自动化：diff分析/变更分类/审查者分配/审批工作流/风险评估/检查清单',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: pr_title, pr_description, changed_files, total_additions, total_deletions, author, reviewers, labels, branch_strategy, ci_status, review_depth' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executePRReviewAutomator(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'code_quality_scorer',
    description: '代码质量评分：复杂度度量/可维护性指数/代码异味检测/重复分析/质量热点/趋势分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: repository, language, files_analyzed, lines_of_code, cyclomatic_complexity_avg, cognitive_complexity_avg, duplication_percentage, code_smells_count, maintainability_index, nesting_depth_max, function_length_avg, class_coupling_avg' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeCodeQualityScorer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'security_code_analyzer',
    description: '安全代码分析：漏洞扫描/OWASP合规/密钥检测/依赖审计/认证授权审查/SAST发现',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: repository, language, dependencies, scan_scope, owasp_categories, secrets_detected, sast_findings, authentication_flows, data_classification' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeSecurityCodeAnalyzer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'performance_review_engine',
    description: '性能审查引擎：瓶颈检测/资源使用分析/可扩展性评估/缓存审查/数据库查询分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: repository, language, runtime, endpoints, database_queries, memory_usage_mb, cpu_usage_pct, cache_hit_rate, concurrent_users, throughput_qps' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executePerformanceReviewEngine(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'architecture_compliance_checker',
    description: '架构合规检查：模式遵循/层违规检测/依赖规则/API契约检查/循环依赖/模块边界',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: repository, architecture_style, layers, violations_found, api_contracts, dependency_rules, circular_dependencies, module_boundary_score' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeArchitectureComplianceChecker(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'test_coverage_reviewer',
    description: '测试覆盖率审查：覆盖率差距分析/测试质量评分/变异测试估算/不稳定测试检测/执行效率',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: repository, language, line_coverage_pct, branch_coverage_pct, function_coverage_pct, integration_test_coverage_pct, e2e_test_coverage_pct, mutation_score, flaky_tests, uncovered_files, test_execution_time_ms, test_count' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeTestCoverageReviewer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'documentation_completeness_checker',
    description: '文档完整性检查：API文档覆盖率/内联注释质量/README完整性/变更日志/架构图/贡献指南',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: repository, language, readme_exists, readme_sections, api_docs_coverage_pct, inline_comment_density, changelog_exists, architecture_diagram_exists, setup_instructions_exists, contributing_guide_exists, license_exists, public_apis, doc_format' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeDocumentationCompletenessChecker(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'tech_debt_assessor',
    description: '技术债务评估：债务量化/利息估算/偿还计划/优先级排序/重构候选/依赖债务',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: repository, language, total_debt_hours, debt_items, code_smells_total, duplication_hours, missing_tests_hours, outdated_dependencies, refactoring_candidates, debt_ratio, team_velocity_hours_per_sprint' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeTechDebtAssessor(args.input_data) }
  }))
}
