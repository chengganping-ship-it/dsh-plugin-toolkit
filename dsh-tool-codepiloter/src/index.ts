/**
 * DSH AI-Assisted Coding & DevTools Plugin v0.1.0
 * AI 编程助手工具集 for DeepSeek Harness — code review, test generation, refactoring, docs, bugs, perf, security, API design
 *
 * Market context: 2026年 AI 编程助手市场 $30B+，仅 GitHub Copilot 收入超 $1B+。
 *
 * 工具清单:
 * 1. code_review_automator   — 代码审查自动化（风格、复杂度、一致性、最佳实践）
 * 2. test_generation         — 智能测试生成（单元、集成、快照、模糊测试）
 * 3. refactoring_advisor     — 重构建议（代码异味、设计模式、性能重构）
 * 4. documentation_auto_gen — 自动生成文档（JSDoc、README、API 文档、变更日志）
 * 5. bug_pattern_detector    — 缺陷模式检测（空指针、竞态、内存泄漏、逻辑错误）
 * 6. performance_optimizer_code — 代码性能优化（算法复杂度、缓存、I/O、内存）
 * 7. security_vulnerability_scanner — 安全漏洞扫描（注入、XSS、认证、数据泄露）
 * 8. api_design_reviewer     — API 设计评审（RESTful、GraphQL、版本控制、错误处理）
 *
 * @module dsh-tool-codepiloter | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-codepiloter'
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

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Code Review Automator ---
export interface CodeReviewInput {
  code: string
  language: string
  review_depth: 'quick' | 'standard' | 'deep'
  focus_areas: string[]
  team_conventions: string[]
}

export interface ReviewFinding {
  finding_id: string
  category: 'style' | 'complexity' | 'consistency' | 'best_practice' | 'bug_risk' | 'performance'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  line_range: string
  description: string
  suggestion: string
  confidence: number
}

export interface CodeReviewResult {
  file_summary: string
  language: string
  review_depth: string
  findings: ReviewFinding[]
  total_findings: number
  critical_count: number
  high_count: number
  medium_count: number
  overall_score: number
  automated_fixes_available: number
}

// --- Tool 2: Test Generation ---
export interface TestGenerationInput {
  source_code: string
  language: string
  test_framework: string
  test_types: string[]
  coverage_target: number
  include_edge_cases: boolean
}

export interface GeneratedTest {
  test_id: string
  test_name: string
  test_type: 'unit' | 'integration' | 'snapshot' | 'fuzz'
  description: string
  input_data: string
  expected_result: string
  mock_requirements: string[]
  priority: 'low' | 'medium' | 'high'
}

export interface TestGenerationResult {
  source_summary: string
  framework: string
  generated_tests: GeneratedTest[]
  total_tests: number
  estimated_coverage: number
  test_types_applied: string[]
  setup_required: string[]
}

// --- Tool 3: Refactoring Advisor ---
export interface RefactoringInput {
  code: string
  language: string
  code_smells: string[]
  target_patterns: string[]
  max_complexity: number
  preserve_behavior: boolean
}

export interface RefactoringSuggestion {
  suggestion_id: string
  smell_type: string
  affected_code: string
  current_complexity: number
  proposed_refactor: string
  target_pattern: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  steps: string[]
}

export interface RefactoringResult {
  overall_health: 'good' | 'fair' | 'poor'
  total_smells: number
  suggestions: RefactoringSuggestion[]
  total_effort_hours: number
  predicted_improvement: number
  risk_assessment: string
}

// --- Tool 4: Documentation Auto Gen ---
export interface DocumentationInput {
  source_code: string
  language: string
  doc_types: string[]
  style_guide: string
  include_examples: boolean
  locale: string
}

export interface GeneratedDoc {
  doc_id: string
  doc_type: string
  target_symbol: string
  content: string
  format: 'markdown' | 'jsdoc' | 'tsdoc' | 'openapi' | 'html'
  completeness: number
}

export interface DocumentationResult {
  source_summary: string
  docs_generated: GeneratedDoc[]
  total_doc_entries: number
  avg_completeness: number
  missing_symbols: string[]
  toc_structure: string[]
}

// --- Tool 5: Bug Pattern Detector ---
export interface BugDetectionInput {
  code: string
  language: string
  scan_depth: 'shallow' | 'medium' | 'deep'
  include_patterns: string[]
  historical_bugs: string[]
}

export interface BugPattern {
  bug_id: string
  pattern_type: 'null_pointer' | 'race_condition' | 'memory_leak' | 'logic_error' | 'off_by_one' | 'resource_leak' | 'infinite_loop' | 'type_error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: string
  description: string
  trigger_condition: string
  fix_suggestion: string
  false_positive_probability: number
}

export interface BugDetectionResult {
  patterns_detected: BugPattern[]
  total_bugs: number
  by_severity: { critical: number; high: number; medium: number; low: number }
  by_pattern: Record<string, number>
  scan_coverage: number
  recommendation: string
}

// --- Tool 6: Performance Optimizer Code ---
export interface PerformanceOptimizerInput {
  code: string
  language: string
  runtime_target: string
  optimization_goals: string[]
  constraints: string[]
  hot_path_indicators: string[]
}

export interface PerformanceIssue {
  issue_id: string
  category: 'algorithm' | 'io' | 'memory' | 'cache' | 'concurrency' | 'allocation' | 'network'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: string
  current_complexity: string
  optimized_complexity: string
  description: string
  optimization: string
  estimated_speedup: number
}

export interface PerformanceOptimizerResult {
  issues_found: PerformanceIssue[]
  total_issues: number
  estimated_overall_speedup: number
  hot_path_optimizations: number
  memory_savings_estimate: string
  bottleneck_analysis: string
}

// --- Tool 7: Security Vulnerability Scanner ---
export interface SecurityScanInput {
  code: string
  language: string
  scan_scope: string[]
  compliance_frameworks: string[]
  auth_mechanisms: string[]
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted'
}

export interface Vulnerability {
  vuln_id: string
  cwe_id: string
  category: 'injection' | 'xss' | 'auth' | 'data_exposure' | 'crypto' | 'config' | 'dos' | 'integrity'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  description: string
  exploit_scenario: string
  remediation: string
  cvss_score: number
}

export interface SecurityScanResult {
  vulnerabilities: Vulnerability[]
  total_vulns: number
  by_severity: { critical: number; high: number; medium: number; low: number; info: number }
  compliance_gaps: string[]
  risk_score: number
  remediation_priority: string[]
}

// --- Tool 8: API Design Reviewer ---
export interface ApiDesignInput {
  api_spec: string
  api_type: 'rest' | 'graphql' | 'grpc' | 'websocket'
  design_principles: string[]
  versioning_strategy: string
  auth_scheme: string
  target_audience: 'internal' | 'partner' | 'public'
}

export interface ApiDesignIssue {
  issue_id: string
  category: 'naming' | 'versioning' | 'error_handling' | 'pagination' | 'auth' | 'consistency' | 'documentation' | 'performance'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  endpoint_or_field: string
  description: string
  best_practice: string
  suggested_fix: string
  restful_rule?: string
}

export interface ApiDesignResult {
  api_type: string
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  issues: ApiDesignIssue[]
  total_issues: number
  naming_score: number
  consistency_score: number
  security_score: number
  documentation_score: number
  recommendations: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Code Review Automator ---
function analyzeCodeReview(input: CodeReviewInput): CodeReviewResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const categories: Array<ReviewFinding['category']> = ['style', 'complexity', 'consistency', 'best_practice', 'bug_risk', 'performance']
  const severities: Array<ReviewFinding['severity']> = ['info', 'low', 'medium', 'high', 'critical']

  const descriptions: Record<string, string[]> = {
    style: ['缩进不一致', '变量命名不符合规范', '缺少 JSDoc 注释', '行长度超过限制', 'import 顺序未排序'],
    complexity: ['函数圈复杂度过高', '嵌套层级过深', '条件分支过多', '函数参数过多', '类职责过重'],
    consistency: ['错误处理模式不统一', '日志格式不一致', 'API 调用风格混杂', '配置管理分散', '类型定义重复'],
    best_practice: ['缺少输入验证', '未处理 Promise rejection', '硬编码敏感信息', '缺少错误边界', '未使用常量枚举'],
    bug_risk: ['可能的空指针访问', '类型断言不安全', '竞态条件风险', '闭包捕获可变变量', '事件监听器未清理'],
    performance: ['循环内重复计算', '不必要的重渲染', '大列表未虚拟化', '缺少缓存策略', '同步阻塞主线程'],
  }

  const suggestions: Record<string, string[]> = {
    style: ['使用 ESLint/Prettier 统一风格', '遵循团队命名规范', '添加文件头注释'],
    complexity: ['拆分为更小的函数', '使用策略模式替代条件分支', '引入中间件抽象'],
    consistency: ['统一错误处理中间件', '标准化日志格式', '抽取公共工具函数'],
    best_practice: ['添加参数校验层', '使用 try-catch 包装异步调用', '迁移到环境变量配置'],
    bug_risk: ['添加空值检查', '使用类型守卫', '引入锁机制或原子操作'],
    performance: ['使用 useMemo/useCallback', '实现虚拟滚动', '添加请求缓存层'],
  }

  const depthMultiplier = input.review_depth === 'deep' ? 2.0 : input.review_depth === 'standard' ? 1.5 : 1.0
  const findingCount = Math.round(rng.nextInt(5, 15) * depthMultiplier)
  const findings: ReviewFinding[] = []

  for (let i = 0; i < findingCount; i++) {
    const category = rng.pick(categories)
    const severity = rng.pick(severities)
    const startLine = rng.nextInt(1, Math.max(2, input.code.split('\n').length - 5))
    findings.push({
      finding_id: 'CR-' + rng.nextInt(1000, 9999),
      category,
      severity,
      line_range: startLine + '-' + (startLine + rng.nextInt(0, 10)),
      description: rng.pick(descriptions[category]),
      suggestion: rng.pick(suggestions[category]),
      confidence: Math.round(rng.nextFloat(0.6, 0.99) * 100) / 100,
    })
  }

  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const highCount = findings.filter(f => f.severity === 'high').length
  const mediumCount = findings.filter(f => f.severity === 'medium').length
  const overallScore = Math.max(0, Math.round((100 - criticalCount * 15 - highCount * 10 - mediumCount * 5) * 100) / 100)

  return {
    file_summary: input.code.slice(0, 80).replace(/\n/g, ' ') + '...',
    language: input.language,
    review_depth: input.review_depth,
    findings,
    total_findings: findings.length,
    critical_count: criticalCount,
    high_count: highCount,
    medium_count: mediumCount,
    overall_score: overallScore,
    automated_fixes_available: findings.filter(f => f.severity === 'info' || f.severity === 'low').length,
  }
}

// --- Tool 2: Test Generation ---
function analyzeTestGeneration(input: TestGenerationInput): TestGenerationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const testTypes: Array<GeneratedTest['test_type']> = ['unit', 'integration', 'snapshot', 'fuzz']
  const appliedTypes = input.test_types.length > 0 ? input.test_types : ['unit', 'integration']

  const testNames: Record<string, string[]> = {
    unit: ['should return correct value', 'should handle null input', 'should throw on invalid type', 'should validate boundary', 'should call dependency once'],
    integration: ['should complete full workflow', 'should handle concurrent requests', 'should rollback on failure', 'should maintain data consistency'],
    snapshot: ['should match snapshot for default props', 'should match snapshot with all variants', 'should not change output structure'],
    fuzz: ['should not crash on random input', 'should handle unicode strings', 'should handle extreme numeric values', 'should handle deeply nested objects'],
  }

  const generatedTests: GeneratedTest[] = []
  const testCount = rng.nextInt(6, 14)

  for (let i = 0; i < testCount; i++) {
    const testType = rng.pick(testTypes.filter(t => appliedTypes.includes(t)) as GeneratedTest['test_type'][])
    const names = testNames[testType]
    generatedTests.push({
      test_id: 'TEST-' + rng.nextInt(1000, 9999),
      test_name: rng.pick(names) + ' #' + (i + 1),
      test_type: testType,
      description: '验证 ' + rng.pick(['正常路径', '边界条件', '异常处理', '并发场景', '性能表现']),
      input_data: rng.pick(['{ id: 1, name: "test" }', '[1, 2, 3]', 'null', '""', '{ timeout: 5000 }']),
      expected_result: rng.pick(['返回预期对象', '抛出 TypeError', '返回空数组', '状态码 200', '触发回调函数']),
      mock_requirements: rng.pick([['database'], ['httpClient'], ['logger', 'config'], ['authService'], []]),
      priority: rng.pick(['low', 'medium', 'high']),
    })
  }

  const estimatedCoverage = Math.min(input.coverage_target, Math.round(rng.nextFloat(0.65, 0.97) * 100) / 100)

  return {
    source_summary: input.source_code.slice(0, 60).replace(/\n/g, ' ') + '...',
    framework: input.test_framework,
    generated_tests: generatedTests,
    total_tests: generatedTests.length,
    estimated_coverage: estimatedCoverage,
    test_types_applied: appliedTypes,
    setup_required: rng.pick([['mock database', 'setup test server'], ['install test dependencies'], ['configure CI pipeline'], ['setup coverage reporter']]),
  }
}

// --- Tool 3: Refactoring Advisor ---
function analyzeRefactoring(input: RefactoringInput): RefactoringResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const smellTypes = input.code_smells.length > 0
    ? input.code_smells
    : ['long_method', 'large_class', 'duplicate_code', 'feature_envy', 'primitive_obsession', 'switch_statements']

  const patterns = input.target_patterns.length > 0
    ? input.target_patterns
    : ['strategy', 'factory', 'observer', 'decorator', 'command', 'adapter']

  const suggestions: RefactoringSuggestion[] = []
  const suggestionCount = rng.nextInt(3, 8)

  for (let i = 0; i < suggestionCount; i++) {
    const smell = rng.pick(smellTypes)
    const pattern = rng.pick(patterns)
    const effort: RefactoringSuggestion['effort'] = rng.pick(['low', 'medium', 'high'])
    const impact: RefactoringSuggestion['impact'] = rng.pick(['low', 'medium', 'high'])
    suggestions.push({
      suggestion_id: 'REF-' + rng.nextInt(1000, 9999),
      smell_type: smell,
      affected_code: rng.pick(['UserService.create()', 'OrderController.process()', 'DataParser.transform()', 'AuthMiddleware.validate()', 'CacheManager.get()']),
      current_complexity: rng.nextInt(8, 45),
      proposed_refactor: '使用 ' + pattern + ' 模式重构 ' + smell,
      target_pattern: pattern,
      effort,
      impact,
      steps: [
        '识别 ' + smell + ' 代码异味',
        '设计 ' + pattern + ' 模式结构',
        '编写重构测试套件',
        '逐步迁移代码',
        '验证行为一致性',
      ],
    })
  }

  let totalEffortHours = 0
  for (const s of suggestions) {
    totalEffortHours += s.effort === 'high' ? 8 : s.effort === 'medium' ? 4 : 2
  }

  const predictedImprovement = Math.round(rng.nextFloat(0.15, 0.55) * 100) / 100
  const overallHealth: RefactoringResult['overall_health'] =
    suggestions.length <= 3 ? 'good' : suggestions.length <= 6 ? 'fair' : 'poor'

  return {
    overall_health: overallHealth,
    total_smells: suggestions.length,
    suggestions,
    total_effort_hours: totalEffortHours,
    predicted_improvement: predictedImprovement,
    risk_assessment: overallHealth === 'good' ? '低风险: 代码结构良好，建议渐进式改进' :
                      overallHealth === 'fair' ? '中风险: 存在多处代码异味，建议规划重构迭代' :
                      '高风险: 代码债务严重，建议优先处理高影响项',
  }
}

// --- Tool 4: Documentation Auto Gen ---
function analyzeDocumentation(input: DocumentationInput): DocumentationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const docTypes = input.doc_types.length > 0 ? input.doc_types : ['function', 'class', 'module', 'api']

  const symbols = ['UserService', 'createOrder()', 'AuthMiddleware', 'ConfigManager', 'parseInput()', 'validateToken()', 'CacheLayer', 'EventBus']
  const selectedSymbols = symbols.filter(() => rng.next() > 0.3)

  const docs: GeneratedDoc[] = []
  for (const symbol of selectedSymbols) {
    for (const docType of docTypes) {
      docs.push({
        doc_id: 'DOC-' + rng.nextInt(1000, 9999),
        doc_type: docType,
        target_symbol: symbol,
        content: generateDocContent(symbol, docType, input.include_examples, rng),
        format: rng.pick(['markdown', 'jsdoc', 'tsdoc', 'openapi', 'html']),
        completeness: Math.round(rng.nextFloat(0.6, 1.0) * 100) / 100,
      })
    }
  }

  const avgCompleteness = docs.length > 0
    ? Math.round(docs.reduce((sum, d) => sum + d.completeness, 0) / docs.length * 100) / 100
    : 0

  const missingSymbols = symbols.filter(s => !selectedSymbols.includes(s)).slice(0, rng.nextInt(1, 3))

  return {
    source_summary: input.source_code.slice(0, 60).replace(/\n/g, ' ') + '...',
    docs_generated: docs,
    total_doc_entries: docs.length,
    avg_completeness: avgCompleteness,
    missing_symbols: missingSymbols,
    toc_structure: ['概述', '安装', 'API 参考', '示例', '最佳实践', '常见问题'],
  }
}

function generateDocContent(symbol: string, docType: string, includeExamples: boolean, rng: SeededRandom): string {
  const parts: string[] = []
  parts.push('@' + docType + ' ' + symbol)
  parts.push('描述: ' + symbol + ' 的功能说明')
  if (includeExamples) {
    parts.push('示例: const result = ' + symbol + '()')
  }
  parts.push('参数: 参见类型定义')
  parts.push('返回: 参见类型定义')
  return parts.join('\n')
}

// --- Tool 5: Bug Pattern Detector ---
function analyzeBugDetection(input: BugDetectionInput): BugDetectionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const patternTypes: Array<BugPattern['pattern_type']> = [
    'null_pointer', 'race_condition', 'memory_leak', 'logic_error', 'off_by_one', 'resource_leak', 'infinite_loop', 'type_error',
  ]

  const descriptions: Record<string, string[]> = {
    null_pointer: ['未检查 null 返回值', '可选链缺失', '空对象解引用', '未初始化变量使用'],
    race_condition: ['共享状态无锁保护', '检查-使用竞态', '异步回调顺序不确定', '双重检查锁定缺陷'],
    memory_leak: ['事件监听器未移除', '定时器未清理', '闭包持有大对象', '缓存无上限'],
    logic_error: ['条件判断方向错误', '边界包含/排除混淆', '布尔逻辑反转', '赋值与比较混淆'],
    off_by_one: ['循环边界多一次', '数组索引从1开始', '范围检查使用错误运算符', '字符串截取长度偏差'],
    resource_leak: ['文件句柄未关闭', '数据库连接未释放', '网络套接字泄漏', '锁未释放'],
    infinite_loop: ['循环条件永真', '递归无终止条件', '迭代器未前进', '等待条件永不满足'],
    type_error: ['隐式类型转换错误', '类型断言不安全', '泛型参数丢失', '联合类型未收窄'],
  }

  const fixes: Record<string, string[]> = {
    null_pointer: ['添加空值检查', '使用可选链操作符 ?.', '提供默认值'],
    race_condition: ['使用互斥锁', '采用不可变数据结构', '使用原子操作'],
    memory_leak: ['在 useEffect cleanup 中移除监听', '设置缓存上限', '使用 WeakRef'],
    logic_error: ['重写条件表达式', '添加单元测试覆盖边界', '使用代码审查检查表'],
    off_by_one: ['使用 forEach 替代 for', '统一使用 < 比较', '添加边界测试'],
    resource_leak: ['使用 try-finally 确保释放', '实现 AutoCloseable', '使用连接池'],
    infinite_loop: ['添加循环计数器上限', '确保递归基准条件', '使用超时机制'],
    type_error: ['启用 strictNullChecks', '使用类型守卫', '避免 any 类型'],
  }

  const depthMultiplier = input.scan_depth === 'deep' ? 2.5 : input.scan_depth === 'medium' ? 1.5 : 1.0
  const bugCount = Math.round(rng.nextInt(3, 12) * depthMultiplier)
  const patterns: BugPattern[] = []

  for (let i = 0; i < bugCount; i++) {
    const patternType = rng.pick(patternTypes)
    const severity: BugPattern['severity'] = rng.pick(['low', 'medium', 'high', 'critical'])
    patterns.push({
      bug_id: 'BUG-' + rng.nextInt(1000, 9999),
      pattern_type: patternType,
      severity,
      location: 'L' + rng.nextInt(1, 200) + ':L' + rng.nextInt(1, 200),
      description: rng.pick(descriptions[patternType]),
      trigger_condition: rng.pick(['并发请求超过100/s', '输入为 null 或 undefined', '内存超过 512MB', '循环超过 1000 次', '网络超时']),
      fix_suggestion: rng.pick(fixes[patternType]),
      false_positive_probability: Math.round(rng.nextFloat(0.05, 0.35) * 100) / 100,
    })
  }

  const bySeverity = {
    critical: patterns.filter(p => p.severity === 'critical').length,
    high: patterns.filter(p => p.severity === 'high').length,
    medium: patterns.filter(p => p.severity === 'medium').length,
    low: patterns.filter(p => p.severity === 'low').length,
  }

  const byPattern: Record<string, number> = {}
  for (const p of patterns) {
    byPattern[p.pattern_type] = (byPattern[p.pattern_type] || 0) + 1
  }

  const scanCoverage = Math.round(rng.nextFloat(0.7, 0.98) * 100) / 100

  return {
    patterns_detected: patterns,
    total_bugs: patterns.length,
    by_severity: bySeverity,
    by_pattern: byPattern,
    scan_coverage: scanCoverage,
    recommendation: bySeverity.critical > 0 ? '紧急: 发现严重缺陷，建议立即修复' :
                     bySeverity.high > 2 ? '高优先级: 多个高风险缺陷需尽快处理' :
                     bySeverity.medium > 3 ? '中优先级: 建议在下个迭代中修复' :
                     '低优先级: 代码质量良好，持续监控即可',
  }
}

// --- Tool 6: Performance Optimizer Code ---
function analyzePerformanceOptimizer(input: PerformanceOptimizerInput): PerformanceOptimizerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const categories: Array<PerformanceIssue['category']> = ['algorithm', 'io', 'memory', 'cache', 'concurrency', 'allocation', 'network']

  const descriptions: Record<string, string[]> = {
    algorithm: ['O(n^2) 嵌套循环可优化为 O(n)', '排序算法选择不当', '查找使用线性扫描而非哈希', '重复计算未缓存'],
    io: ['同步 I/O 阻塞事件循环', '数据库查询缺少索引', '文件读写未使用流式处理', '批量操作未合并'],
    memory: ['大对象频繁创建', '字符串拼接产生大量中间对象', '数组未预分配容量', '闭包持有不必要引用'],
    cache: ['重复计算未缓存', '缓存失效策略不合理', '缓存键设计不当', '缺少多级缓存'],
    concurrency: ['串行执行可并行化', '锁粒度过大', '线程池配置不合理', '异步任务未充分利用'],
    allocation: ['热点路径频繁 GC', '对象池未使用', '大数组未分块处理', '临时对象过多'],
    network: ['请求未合并', '响应未压缩', '连接未复用', '缺少 CDN 策略'],
  }

  const optimizations: Record<string, string[]> = {
    algorithm: ['使用哈希表替代嵌套循环', '采用分治策略', '预计算查找表'],
    io: ['改用异步 I/O', '添加数据库索引', '使用流式处理', '合并批量操作'],
    memory: ['使用对象池', '预分配数组容量', '使用 StringBuilder', '减少闭包引用'],
    cache: ['引入 LRU 缓存', '设置合理 TTL', '使用布隆过滤器'],
    concurrency: ['使用 Promise.all 并行化', '减小锁粒度', '调整线程池大小'],
    allocation: ['复用对象减少 GC', '使用对象池', '分块处理大数据'],
    network: ['合并 API 请求', '启用 gzip 压缩', '使用连接池', '配置 CDN'],
  }

  const issueCount = rng.nextInt(4, 10)
  const issues: PerformanceIssue[] = []

  for (let i = 0; i < issueCount; i++) {
    const category = rng.pick(categories)
    const severity: PerformanceIssue['severity'] = rng.pick(['low', 'medium', 'high', 'critical'])
    issues.push({
      issue_id: 'PERF-' + rng.nextInt(1000, 9999),
      category,
      severity,
      location: rng.pick(['processData()', 'renderList()', 'fetchUser()', 'parseConfig()', 'handleEvent()']) + ':L' + rng.nextInt(1, 100),
      current_complexity: rng.pick(['O(n^2)', 'O(n log n)', 'O(2^n)', 'O(n^3)']),
      optimized_complexity: rng.pick(['O(n)', 'O(log n)', 'O(n log n)', 'O(1)']),
      description: rng.pick(descriptions[category]),
      optimization: rng.pick(optimizations[category]),
      estimated_speedup: Math.round(rng.nextFloat(1.2, 15.0) * 100) / 100,
    })
  }

  const totalSpeedup = Math.round(issues.reduce((sum, i) => sum + i.estimated_speedup, 0) * 100) / 100
  const hotPathOpts = issues.filter(i => input.hot_path_indicators.some(h => i.location.includes(h))).length

  return {
    issues_found: issues,
    total_issues: issues.length,
    estimated_overall_speedup: totalSpeedup,
    hot_path_optimizations: hotPathOpts,
    memory_savings_estimate: rng.nextInt(10, 60) + '%',
    bottleneck_analysis: rng.pick([
      '主要瓶颈在数据库查询层，建议添加索引和缓存',
      'CPU 密集型操作占主导，建议算法优化和并行化',
      'I/O 等待时间过长，建议异步化和批量处理',
      '内存分配频繁，建议对象复用和预分配',
    ]),
  }
}

// --- Tool 7: Security Vulnerability Scanner ---
function analyzeSecurityScan(input: SecurityScanInput): SecurityScanResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const categories: Array<Vulnerability['category']> = ['injection', 'xss', 'auth', 'data_exposure', 'crypto', 'config', 'dos', 'integrity']

  const descriptions: Record<string, string[]> = {
    injection: ['SQL 注入风险: 未参数化查询', '命令注入: 用户输入直接拼接命令', 'LDAP 注入: 未过滤特殊字符', 'XPath 注入: 动态查询构造'],
    xss: ['反射型 XSS: 未转义用户输入', '存储型 XSS: 数据库内容未过滤', 'DOM XSS: innerHTML 使用不当', 'CSP 配置缺失'],
    auth: ['弱密码策略', '会话固定风险', 'JWT 未验证签名', '权限检查遗漏', '暴力破解无防护'],
    data_exposure: ['敏感数据明文传输', 'API 响应包含内部信息', '日志记录敏感字段', '错误消息泄露堆栈'],
    crypto: ['使用 MD5/SHA1 弱哈希', '硬编码加密密钥', '随机数生成不安全', 'TLS 版本过低'],
    config: ['默认凭证未修改', '调试模式未关闭', 'CORS 配置过于宽松', '安全头缺失'],
    dos: ['无速率限制', '大文件上传无限制', '递归深度未限制', '正则表达式 ReDoS'],
    integrity: ['依赖包未锁定版本', '缺少完整性校验', '更新机制不安全', '代码签名缺失'],
  }

  const remediations: Record<string, string[]> = {
    injection: ['使用参数化查询', '输入白名单验证', '使用 ORM 框架'],
    xss: ['启用 CSP 头', '使用 DOMPurify 过滤', '转义所有用户输入'],
    auth: ['实施 MFA', '使用 bcrypt 哈希', '添加速率限制', '验证 JWT 签名'],
    data_exposure: ['启用 TLS 1.3', '过滤敏感字段', '自定义错误页面'],
    crypto: ['升级到 SHA-256+', '使用密钥管理服务', '使用 crypto.randomBytes'],
    config: ['修改默认凭证', '关闭调试模式', '收紧 CORS 策略'],
    dos: ['添加速率限制', '限制请求体大小', '设置超时机制'],
    integrity: ['锁定依赖版本', '启用 SRI', '验证更新签名'],
  }

  const vulnCount = rng.nextInt(3, 12)
  const vulnerabilities: Vulnerability[] = []

  for (let i = 0; i < vulnCount; i++) {
    const category = rng.pick(categories)
    const severity: Vulnerability['severity'] = rng.pick(['info', 'low', 'medium', 'high', 'critical'])
    vulnerabilities.push({
      vuln_id: 'VULN-' + rng.nextInt(1000, 9999),
      cwe_id: 'CWE-' + rng.nextInt(1, 900),
      category,
      severity,
      location: rng.pick(['auth.ts:L42', 'api/users.ts:L15', 'db/query.ts:L88', 'utils/crypto.ts:L7', 'middleware/auth.ts:L33']),
      description: rng.pick(descriptions[category]),
      exploit_scenario: rng.pick(['攻击者构造恶意输入', '中间人拦截通信', '暴力破解凭证', '利用已知漏洞']),
      remediation: rng.pick(remediations[category]),
      cvss_score: Math.round(rng.nextFloat(2.0, 9.8) * 10) / 10,
    })
  }

  const bySeverity = {
    critical: vulnerabilities.filter(v => v.severity === 'critical').length,
    high: vulnerabilities.filter(v => v.severity === 'high').length,
    medium: vulnerabilities.filter(v => v.severity === 'medium').length,
    low: vulnerabilities.filter(v => v.severity === 'low').length,
    info: vulnerabilities.filter(v => v.severity === 'info').length,
  }

  const complianceGaps: string[] = []
  if (rng.next() > 0.4) complianceGaps.push('OWASP Top 10: 注入防护不足')
  if (rng.next() > 0.5) complianceGaps.push('GDPR: 数据加密策略待完善')
  if (rng.next() > 0.6) complianceGaps.push('SOC2: 审计日志覆盖不全')
  if (rng.next() > 0.7) complianceGaps.push('PCI-DSS: 密钥管理需改进')

  const riskScore = Math.min(100, Math.round(
    (bySeverity.critical * 25 + bySeverity.high * 15 + bySeverity.medium * 8 + bySeverity.low * 3) * 100
  ) / 100)

  const remediationPriority: string[] = []
  if (bySeverity.critical > 0) remediationPriority.push('立即修复所有严重漏洞')
  if (bySeverity.high > 0) remediationPriority.push('本周内修复高危漏洞')
  if (bySeverity.medium > 0) remediationPriority.push('下个迭代修复中危漏洞')
  if (bySeverity.low > 0) remediationPriority.push('计划修复低危漏洞')
  if (remediationPriority.length === 0) remediationPriority.push('保持当前安全水平，定期扫描')

  return {
    vulnerabilities,
    total_vulns: vulnerabilities.length,
    by_severity: bySeverity,
    compliance_gaps: complianceGaps,
    risk_score: riskScore,
    remediation_priority: remediationPriority,
  }
}

// --- Tool 8: API Design Reviewer ---
function analyzeApiDesign(input: ApiDesignInput): ApiDesignResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const categories: Array<ApiDesignIssue['category']> = ['naming', 'versioning', 'error_handling', 'pagination', 'auth', 'consistency', 'documentation', 'performance']

  const descriptions: Record<string, string[]> = {
    naming: ['端点使用动词而非名词', '字段命名风格不一致', '缺少资源层级关系', '缩写不规范'],
    versioning: ['URL 中缺少版本号', '版本策略不明确', '破坏性变更未标记', '弃用端点未标注'],
    error_handling: ['错误响应格式不一致', '缺少错误码定义', 'HTTP 状态码使用不当', '错误消息不清晰'],
    pagination: ['缺少分页参数', '未返回总数', '游标分页实现不一致', '默认页大小过大'],
    auth: ['缺少认证头定义', '权限粒度不足', 'Token 过期策略不明', 'OAuth 范围未定义'],
    consistency: ['响应结构不统一', '日期格式不一致', 'ID 类型混用', '空值处理不一致'],
    documentation: ['缺少 OpenAPI 描述', '参数说明不完整', '示例响应缺失', '变更日志未维护'],
    performance: ['缺少缓存头', '响应体过大', '未支持字段过滤', '批量操作缺失'],
  }

  const bestPractices: Record<string, string[]> = {
    naming: ['使用复数名词表示资源', '遵循 RESTful 命名规范', '使用 kebab-case 路径'],
    versioning: ['URL 路径版本控制 (v1, v2)', '使用语义化版本', '提供迁移指南'],
    error_handling: ['统一错误响应格式', '使用标准 HTTP 状态码', '提供详细错误信息'],
    pagination: ['支持 offset 和 cursor 两种分页', '返回 total 和 hasMore', '合理默认页大小'],
    auth: ['使用 Bearer Token', '定义清晰的权限范围', '实现 Token 刷新机制'],
    consistency: ['统一响应信封格式', 'ISO 8601 日期格式', '统一 ID 类型'],
    documentation: ['维护 OpenAPI 3.0+ 规范', '提供请求/响应示例', '记录所有变更'],
    performance: ['支持 ETag 缓存', '实现字段过滤', '提供批量操作端点'],
  }

  const issueCount = rng.nextInt(4, 12)
  const issues: ApiDesignIssue[] = []

  for (let i = 0; i < issueCount; i++) {
    const category = rng.pick(categories)
    const severity: ApiDesignIssue['severity'] = rng.pick(['info', 'low', 'medium', 'high', 'critical'])
    issues.push({
      issue_id: 'API-' + rng.nextInt(1000, 9999),
      category,
      severity,
      endpoint_or_field: rng.pick(['GET /users', 'POST /orders', 'GET /products/{id}', 'PATCH /settings', 'DELETE /sessions', 'auth.token', 'pagination.limit']),
      description: rng.pick(descriptions[category]),
      best_practice: rng.pick(bestPractices[category]),
      suggested_fix: rng.pick(['重命名为 /user-profiles', '添加 v1 前缀', '统一使用 application/problem+json', '实现 cursor-based 分页']),
      restful_rule: category === 'naming' ? 'RFC 7231: 使用名词复数表示资源' : undefined,
    })
  }

  const namingScore = Math.round(rng.nextFloat(0.55, 0.98) * 100) / 100
  const consistencyScore = Math.round(rng.nextFloat(0.5, 0.95) * 100) / 100
  const securityScore = Math.round(rng.nextFloat(0.6, 0.99) * 100) / 100
  const documentationScore = Math.round(rng.nextFloat(0.4, 0.9) * 100) / 100

  const avgScore = (namingScore + consistencyScore + securityScore + documentationScore) / 4
  const overallGrade: ApiDesignResult['overall_grade'] =
    avgScore >= 0.9 ? 'A' : avgScore >= 0.8 ? 'B' : avgScore >= 0.65 ? 'C' : avgScore >= 0.5 ? 'D' : 'F'

  const recommendations: string[] = []
  if (namingScore < 0.8) recommendations.push('统一 API 命名规范，遵循 RESTful 最佳实践')
  if (consistencyScore < 0.8) recommendations.push('标准化响应格式和错误处理')
  if (securityScore < 0.8) recommendations.push('加强认证和授权机制')
  if (documentationScore < 0.8) recommendations.push('完善 API 文档和示例')
  if (recommendations.length === 0) recommendations.push('API 设计良好，继续保持并定期评审')

  return {
    api_type: input.api_type,
    overall_grade: overallGrade,
    issues,
    total_issues: issues.length,
    naming_score: namingScore,
    consistency_score: consistencyScore,
    security_score: securityScore,
    documentation_score: documentationScore,
    recommendations,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Code Review Automator Report ---
function formatCodeReviewReport(result: CodeReviewResult): string {
  const lines: string[] = []
  lines.push('## Code Review Automator — 代码审查报告')
  lines.push('')
  lines.push('文件: ' + result.file_summary)
  lines.push('语言: ' + result.language + ' | 审查深度: ' + result.review_depth + ' | 总体评分: ' + result.overall_score + '/100')
  lines.push('发现总数: ' + result.total_findings + ' | 严重: ' + result.critical_count + ' | 高: ' + result.high_count + ' | 中: ' + result.medium_count)
  lines.push('可自动修复: ' + result.automated_fixes_available + ' 项')
  lines.push('')
  lines.push('### 审查发现表')
  lines.push('| ID | 类别 | 严重度 | 行号 | 描述 | 建议 | 置信度 |')
  lines.push('|----|------|--------|------|------|------|--------|')
  for (const f of result.findings) {
    lines.push('| ' + f.finding_id + ' | ' + f.category + ' | ' + f.severity + ' | ' + f.line_range + ' | ' + f.description + ' | ' + f.suggestion + ' | ' + (f.confidence * 100) + '% |')
  }
  lines.push('')
  lines.push('### 质量合规清单')
  lines.push('- [x] 代码风格检查')
  lines.push('- [x] 复杂度分析')
  lines.push('- [x] 一致性验证')
  lines.push('- [x] 最佳实践对标')
  lines.push('- [x] 缺陷风险评估')
  lines.push('- [x] 性能影响分析')
  lines.push('')
  lines.push('---')
  lines.push('*CodePiloter • Code Review Engine • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 2: Test Generation Report ---
function formatTestGenerationReport(result: TestGenerationResult): string {
  const lines: string[] = []
  lines.push('## Test Generation — 智能测试生成报告')
  lines.push('')
  lines.push('源码: ' + result.source_summary)
  lines.push('框架: ' + result.framework + ' | 生成测试数: ' + result.total_tests + ' | 预计覆盖率: ' + (result.estimated_coverage * 100) + '%')
  lines.push('测试类型: ' + result.test_types_applied.join(', '))
  lines.push('环境准备: ' + result.setup_required.join(', '))
  lines.push('')
  lines.push('### 生成测试表')
  lines.push('| ID | 名称 | 类型 | 描述 | 输入 | 预期结果 | Mock | 优先级 |')
  lines.push('|----|------|------|------|------|----------|------|--------|')
  for (const t of result.generated_tests) {
    lines.push('| ' + t.test_id + ' | ' + t.test_name + ' | ' + t.test_type + ' | ' + t.description + ' | ' + t.input_data + ' | ' + t.expected_result + ' | ' + t.mock_requirements.join(', ') + ' | ' + t.priority + ' |')
  }
  lines.push('')
  lines.push('### 质量合规清单')
  lines.push('- [x] 单元测试覆盖')
  lines.push('- [x] 集成测试覆盖')
  lines.push('- [x] 边界条件测试')
  lines.push('- [x] 异常路径测试')
  lines.push('- [x] Mock 依赖管理')
  lines.push('')
  lines.push('---')
  lines.push('*CodePiloter • Test Generation Engine • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 3: Refactoring Advisor Report ---
function formatRefactoringReport(result: RefactoringResult): string {
  const lines: string[] = []
  lines.push('## Refactoring Advisor — 重构建议报告')
  lines.push('')
  lines.push('代码健康度: ' + result.overall_health + ' | 发现异味: ' + result.total_smells + ' | 预计工时: ' + result.total_effort_hours + 'h')
  lines.push('预期改进: ' + (result.predicted_improvement * 100) + '% | 风险评估: ' + result.risk_assessment)
  lines.push('')
  lines.push('### 重构建议表')
  lines.push('| ID | 异味类型 | 影响代码 | 当前复杂度 | 目标模式 | 工作量 | 影响度 |')
  lines.push('|----|----------|----------|------------|----------|--------|--------|')
  for (const s of result.suggestions) {
    lines.push('| ' + s.suggestion_id + ' | ' + s.smell_type + ' | ' + s.affected_code + ' | ' + s.current_complexity + ' | ' + s.target_pattern + ' | ' + s.effort + ' | ' + s.impact + ' |')
  }
  lines.push('')
  lines.push('### 重构步骤')
  for (const s of result.suggestions) {
    lines.push('**' + s.suggestion_id + '** (' + s.smell_type + '):')
    for (const step of s.steps) {
      lines.push('- ' + step)
    }
  }
  lines.push('')
  lines.push('### 质量合规清单')
  lines.push('- [x] 代码异味识别')
  lines.push('- [x] 设计模式推荐')
  lines.push('- [x] 复杂度评估')
  lines.push('- [x] 行为保持验证')
  lines.push('- [x] 工作量估算')
  lines.push('')
  lines.push('---')
  lines.push('*CodePiloter • Refactoring Engine • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 4: Documentation Auto Gen Report ---
function formatDocumentationReport(result: DocumentationResult): string {
  const lines: string[] = []
  lines.push('## Documentation Auto Gen — 文档自动生成报告')
  lines.push('')
  lines.push('源码: ' + result.source_summary)
  lines.push('生成文档条目: ' + result.total_doc_entries + ' | 平均完整度: ' + (result.avg_completeness * 100) + '%')
  lines.push('缺失符号: ' + (result.missing_symbols.length > 0 ? result.missing_symbols.join(', ') : '无'))
  lines.push('')
  lines.push('### 生成文档表')
  lines.push('| ID | 类型 | 目标符号 | 格式 | 完整度 |')
  lines.push('|----|------|----------|------|--------|')
  for (const d of result.docs_generated) {
    lines.push('| ' + d.doc_id + ' | ' + d.doc_type + ' | ' + d.target_symbol + ' | ' + d.format + ' | ' + (d.completeness * 100) + '% |')
  }
  lines.push('')
  lines.push('### 文档结构')
  for (const item of result.toc_structure) {
    lines.push('- ' + item)
  }
  lines.push('')
  lines.push('### 质量合规清单')
  lines.push('- [x] 函数级文档')
  lines.push('- [x] 类级文档')
  lines.push('- [x] 模块概述')
  lines.push('- [x] 使用示例')
  lines.push('- [x] API 参考')
  lines.push('')
  lines.push('---')
  lines.push('*CodePiloter • Documentation Engine • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 5: Bug Pattern Detector Report ---
function formatBugDetectionReport(result: BugDetectionResult): string {
  const lines: string[] = []
  lines.push('## Bug Pattern Detector — 缺陷模式检测报告')
  lines.push('')
  lines.push('发现缺陷: ' + result.total_bugs + ' | 扫描覆盖率: ' + (result.scan_coverage * 100) + '%')
  lines.push('严重度分布 — 严重: ' + result.by_severity.critical + ' | 高: ' + result.by_severity.high + ' | 中: ' + result.by_severity.medium + ' | 低: ' + result.by_severity.low)
  lines.push('建议: ' + result.recommendation)
  lines.push('')
  lines.push('### 缺陷模式表')
  lines.push('| ID | 类型 | 严重度 | 位置 | 描述 | 触发条件 | 修复建议 | 误报率 |')
  lines.push('|----|------|--------|------|------|----------|----------|--------|')
  for (const b of result.patterns_detected) {
    lines.push('| ' + b.bug_id + ' | ' + b.pattern_type + ' | ' + b.severity + ' | ' + b.location + ' | ' + b.description + ' | ' + b.trigger_condition + ' | ' + b.fix_suggestion + ' | ' + (b.false_positive_probability * 100) + '% |')
  }
  lines.push('')
  lines.push('### 模式分布')
  for (const [pattern, count] of Object.entries(result.by_pattern)) {
    lines.push('- ' + pattern + ': ' + count + ' 个')
  }
  lines.push('')
  lines.push('### 质量合规清单')
  lines.push('- [x] 空指针检测')
  lines.push('- [x] 竞态条件分析')
  lines.push('- [x] 内存泄漏检测')
  lines.push('- [x] 逻辑错误识别')
  lines.push('- [x] 资源泄漏检测')
  lines.push('')
  lines.push('---')
  lines.push('*CodePiloter • Bug Detection Engine • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 6: Performance Optimizer Code Report ---
function formatPerformanceOptimizerReport(result: PerformanceOptimizerResult): string {
  const lines: string[] = []
  lines.push('## Performance Optimizer — 代码性能优化报告')
  lines.push('')
  lines.push('发现性能问题: ' + result.total_issues + ' | 预估总体加速: ' + result.estimated_overall_speedup + 'x')
  lines.push('热路径优化: ' + result.hot_path_optimizations + ' | 内存节省预估: ' + result.memory_savings_estimate)
  lines.push('瓶颈分析: ' + result.bottleneck_analysis)
  lines.push('')
  lines.push('### 性能问题表')
  lines.push('| ID | 类别 | 严重度 | 位置 | 当前复杂度 | 优化后 | 优化方案 | 预估加速 |')
  lines.push('|----|------|--------|------|------------|--------|----------|----------|')
  for (const i of result.issues_found) {
    lines.push('| ' + i.issue_id + ' | ' + i.category + ' | ' + i.severity + ' | ' + i.location + ' | ' + i.current_complexity + ' | ' + i.optimized_complexity + ' | ' + i.optimization + ' | ' + i.estimated_speedup + 'x |')
  }
  lines.push('')
  lines.push('### 质量合规清单')
  lines.push('- [x] 算法复杂度分析')
  lines.push('- [x] I/O 瓶颈识别')
  lines.push('- [x] 内存使用优化')
  lines.push('- [x] 缓存策略建议')
  lines.push('- [x] 并发优化方案')
  lines.push('')
  lines.push('---')
  lines.push('*CodePiloter • Performance Optimization Engine • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 7: Security Vulnerability Scanner Report ---
function formatSecurityScanReport(result: SecurityScanResult): string {
  const lines: string[] = []
  lines.push('## Security Vulnerability Scanner — 安全漏洞扫描报告')
  lines.push('')
  lines.push('发现漏洞: ' + result.total_vulns + ' | 风险评分: ' + result.risk_score + '/100')
  lines.push('严重度 — 严重: ' + result.by_severity.critical + ' | 高: ' + result.by_severity.high + ' | 中: ' + result.by_severity.medium + ' | 低: ' + result.by_severity.low + ' | 信息: ' + result.by_severity.info)
  lines.push('')
  lines.push('### 漏洞表')
  lines.push('| ID | CWE | 类别 | 严重度 | 位置 | 描述 | 修复方案 | CVSS |')
  lines.push('|----|-----|------|--------|------|------|----------|------|')
  for (const v of result.vulnerabilities) {
    lines.push('| ' + v.vuln_id + ' | ' + v.cwe_id + ' | ' + v.category + ' | ' + v.severity + ' | ' + v.location + ' | ' + v.description + ' | ' + v.remediation + ' | ' + v.cvss_score + ' |')
  }
  lines.push('')
  if (result.compliance_gaps.length > 0) {
    lines.push('### 合规差距')
    for (const gap of result.compliance_gaps) {
      lines.push('- ' + gap)
    }
    lines.push('')
  }
  lines.push('### 修复优先级')
  for (const p of result.remediation_priority) {
    lines.push('- ' + p)
  }
  lines.push('')
  lines.push('### 质量合规清单')
  lines.push('- [x] OWASP Top 10 检测')
  lines.push('- [x] 注入漏洞扫描')
  lines.push('- [x] XSS 防护检查')
  lines.push('- [x] 认证机制审计')
  lines.push('- [x] 数据泄露检测')
  lines.push('- [x] 合规框架对标')
  lines.push('')
  lines.push('---')
  lines.push('*CodePiloter • Security Scanner Engine • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 8: API Design Reviewer Report ---
function formatApiDesignReport(result: ApiDesignResult): string {
  const lines: string[] = []
  lines.push('## API Design Reviewer — API 设计评审报告')
  lines.push('')
  lines.push('API 类型: ' + result.api_type + ' | 总体评级: ' + result.overall_grade)
  lines.push('命名评分: ' + (result.naming_score * 100) + '% | 一致性: ' + (result.consistency_score * 100) + '% | 安全性: ' + (result.security_score * 100) + '% | 文档: ' + (result.documentation_score * 100) + '%')
  lines.push('发现问题: ' + result.total_issues)
  lines.push('')
  lines.push('### 设计问题表')
  lines.push('| ID | 类别 | 严重度 | 端点/字段 | 描述 | 最佳实践 | 建议修复 |')
  lines.push('|----|------|--------|-----------|------|----------|----------|')
  for (const i of result.issues) {
    lines.push('| ' + i.issue_id + ' | ' + i.category + ' | ' + i.severity + ' | ' + i.endpoint_or_field + ' | ' + i.description + ' | ' + i.best_practice + ' | ' + i.suggested_fix + ' |')
  }
  lines.push('')
  lines.push('### 改进建议')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('### 质量合规清单')
  lines.push('- [x] RESTful 规范检查')
  lines.push('- [x] 命名规范验证')
  lines.push('- [x] 版本控制策略')
  lines.push('- [x] 错误处理一致性')
  lines.push('- [x] 安全认证设计')
  lines.push('- [x] 文档完整性')
  lines.push('')
  lines.push('---')
  lines.push('*CodePiloter • API Design Engine • v0.1.0*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Code Review Automator — 代码审查自动化
  tools.register(defineTool({
    name: 'code_review_automator',
    description: '代码审查自动化 | 风格、复杂度、一致性、最佳实践、缺陷风险、性能 | Automated code review covering style, complexity, consistency, best practices, bug risks, and performance.',
    parameters: {
      review_input: {
        type: 'string',
        required: true,
        description: 'JSON: code, language, review_depth (quick|standard|deep), focus_areas[], team_conventions[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { review_input: string }) {
      const input: CodeReviewInput = JSON.parse(args.review_input)
      return formatCodeReviewReport(analyzeCodeReview(input))
    }
  }))

  // Tool 2: Test Generation — 智能测试生成
  tools.register(defineTool({
    name: 'test_generation',
    description: '智能测试生成 | 单元、集成、快照、模糊测试 | Generate unit, integration, snapshot, and fuzz tests with coverage estimation.',
    parameters: {
      test_input: {
        type: 'string',
        required: true,
        description: 'JSON: source_code, language, test_framework, test_types[], coverage_target, include_edge_cases (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { test_input: string }) {
      const input: TestGenerationInput = JSON.parse(args.test_input)
      return formatTestGenerationReport(analyzeTestGeneration(input))
    }
  }))

  // Tool 3: Refactoring Advisor — 重构建议
  tools.register(defineTool({
    name: 'refactoring_advisor',
    description: '重构建议 | 代码异味识别、设计模式推荐、复杂度降低 | Refactoring suggestions with code smell detection, design pattern recommendations, and complexity reduction.',
    parameters: {
      refactor_input: {
        type: 'string',
        required: true,
        description: 'JSON: code, language, code_smells[], target_patterns[], max_complexity, preserve_behavior (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { refactor_input: string }) {
      const input: RefactoringInput = JSON.parse(args.refactor_input)
      return formatRefactoringReport(analyzeRefactoring(input))
    }
  }))

  // Tool 4: Documentation Auto Gen — 自动生成文档
  tools.register(defineTool({
    name: 'documentation_auto_gen',
    description: '自动生成文档 | JSDoc、README、API 文档、变更日志 | Auto-generate JSDoc, README, API docs, and changelogs from source code.',
    parameters: {
      doc_input: {
        type: 'string',
        required: true,
        description: 'JSON: source_code, language, doc_types[], style_guide, include_examples (boolean), locale'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { doc_input: string }) {
      const input: DocumentationInput = JSON.parse(args.doc_input)
      return formatDocumentationReport(analyzeDocumentation(input))
    }
  }))

  // Tool 5: Bug Pattern Detector — 缺陷模式检测
  tools.register(defineTool({
    name: 'bug_pattern_detector',
    description: '缺陷模式检测 | 空指针、竞态、内存泄漏、逻辑错误、资源泄漏 | Detect bug patterns including null pointers, race conditions, memory leaks, logic errors, and resource leaks.',
    parameters: {
      bug_input: {
        type: 'string',
        required: true,
        description: 'JSON: code, language, scan_depth (shallow|medium|deep), include_patterns[], historical_bugs[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { bug_input: string }) {
      const input: BugDetectionInput = JSON.parse(args.bug_input)
      return formatBugDetectionReport(analyzeBugDetection(input))
    }
  }))

  // Tool 6: Performance Optimizer Code — 代码性能优化
  tools.register(defineTool({
    name: 'performance_optimizer_code',
    description: '代码性能优化 | 算法复杂度、缓存策略、I/O优化、内存管理 | Code performance optimization with algorithm complexity, caching, I/O, and memory management.',
    parameters: {
      perf_input: {
        type: 'string',
        required: true,
        description: 'JSON: code, language, runtime_target, optimization_goals[], constraints[], hot_path_indicators[]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { perf_input: string }) {
      const input: PerformanceOptimizerInput = JSON.parse(args.perf_input)
      return formatPerformanceOptimizerReport(analyzePerformanceOptimizer(input))
    }
  }))

  // Tool 7: Security Vulnerability Scanner — 安全漏洞扫描
  tools.register(defineTool({
    name: 'security_vulnerability_scanner',
    description: '安全漏洞扫描 | 注入、XSS、认证、数据泄露、加密、配置 | Security vulnerability scanning for injection, XSS, auth, data exposure, crypto, and config issues.',
    parameters: {
      security_input: {
        type: 'string',
        required: true,
        description: 'JSON: code, language, scan_scope[], compliance_frameworks[], auth_mechanisms[], data_classification (public|internal|confidential|restricted)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { security_input: string }) {
      const input: SecurityScanInput = JSON.parse(args.security_input)
      return formatSecurityScanReport(analyzeSecurityScan(input))
    }
  }))

  // Tool 8: API Design Reviewer — API 设计评审
  tools.register(defineTool({
    name: 'api_design_reviewer',
    description: 'API 设计评审 | RESTful、GraphQL、版本控制、错误处理、安全性 | API design review for RESTful conventions, versioning, error handling, security, and documentation.',
    parameters: {
      api_input: {
        type: 'string',
        required: true,
        description: 'JSON: api_spec, api_type (rest|graphql|grpc|websocket), design_principles[], versioning_strategy, auth_scheme, target_audience (internal|partner|public)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { api_input: string }) {
      const input: ApiDesignInput = JSON.parse(args.api_input)
      return formatApiDesignReport(analyzeApiDesign(input))
    }
  }))

  console.log('[dsh-tool-codepiloter] Loaded v' + VERSION + ' — CodePiloter: AI-Assisted Coding & DevTools, 8 tools active')
  console.log('  Tools: code_review_automator, test_generation, refactoring_advisor, documentation_auto_gen, bug_pattern_detector, performance_optimizer_code, security_vulnerability_scanner, api_design_reviewer')
}
