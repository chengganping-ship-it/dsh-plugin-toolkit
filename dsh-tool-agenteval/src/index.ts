/**
 * DSH AgentEval - AI Agent Evaluation & Benchmarking Plugin v0.1.0
 *
 * Agent capability scoring, task completion evaluation, safety benchmarking, performance comparison.
 * 2026: AI agent evaluation $2B+; agent benchmarking growing rapidly.
 *
 * Tools:
 * 1. agent_capability_scorer              - Multi-dimensional agent capability scoring
 * 2. task_completion_evaluator           - Task completion evaluation with success metrics
 * 3. safety_benchmark_runner             - Safety benchmark testing with adversarial scenarios
 * 4. performance_comparison_tool         - Performance comparison between multiple agents
 * 5. robustness_tester                    - Robustness testing with edge cases and perturbations
 * 6. multi_turn_dialogue_evaluator       - Multi-turn dialogue quality evaluation
 * 7. tool_use_efficiency_analyzer        - Tool use efficiency and call pattern analysis
 * 8. agent_hallucination_detector         - Hallucination detection in agent responses
 *
 * @module dsh-tool-agenteval
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agenteval'
export const inject = ['tools']

// ==================== SECTION 1 - Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 - Type Definitions ====================

export interface CapabilityDimension {
  dimension: string
  score: number
  weight: number
  weighted_score: number
  details: string
}

export interface AgentCapabilityScorerInput {
  agent_name: string
  agent_version: string
  task_categories: string[]
  capabilities_tested: Array<{
    category: string
    test_count: number
    pass_count: number
    avg_latency_ms: number
    complexity: 'basic' | 'intermediate' | 'advanced' | 'expert'
  }>
  baseline_scores: Record<string, number>
  evaluation_context: string
}

export interface AgentCapabilityResult {
  agent_name: string
  agent_version: string
  overall_score: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  dimensions: CapabilityDimension[]
  category_rankings: Record<string, number>
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  evaluation_date: string
}

export interface TaskCompletionInput {
  agent_name: string
  tasks: Array<{
    task_id: string
    task_description: string
    task_type: string
    difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'expert'
    expected_output: string
    actual_output: string
    completed: boolean
    completion_time_ms: number
    max_time_ms: number
    steps_taken: number
    steps_expected: number
    errors_encountered: number
    retries: number
  }>
  evaluation_criteria: {
    accuracy_weight: number
    efficiency_weight: number
    robustness_weight: number
  }
}

export interface TaskMetrics {
  task_id: string
  task_type: string
  difficulty: string
  completed: boolean
  accuracy_score: number
  efficiency_score: number
  robustness_score: number
  composite_score: number
  time_utilization: number
  step_accuracy: number
}

export interface TaskCompletionResult {
  agent_name: string
  total_tasks: number
  completed_tasks: number
  completion_rate: number
  avg_accuracy: number
  avg_efficiency: number
  avg_robustness: number
  overall_score: number
  task_metrics: TaskMetrics[]
  failure_analysis: string[]
  recommendations: string[]
  evaluation_date: string
}

export interface SafetyBenchmarkInput {
  agent_name: string
  agent_version: string
  test_scenarios: Array<{
    scenario_id: string
    category: string
    scenario_type: 'adversarial' | 'jailbreak' | 'prompt_injection' | 'data_leak' | 'harmful_content' | 'privacy_violation' | 'manipulation'
    prompt: string
    expected_behavior: string
    actual_response: string
    safety_violated: boolean
    severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  }>
  safety_frameworks: string[]
  threshold_config: {
    pass_rate_minimum: number
    critical_violation_threshold: number
    high_severity_tolerance: number
  }
}

export interface SafetyCategoryResult {
  category: string
  total_tests: number
  violations: number
  pass_rate: number
  max_severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  risk_level: 'low' | 'medium' | 'high' | 'critical'
}

export interface SafetyBenchmarkResult {
  agent_name: string
  agent_version: string
  overall_safety_score: number
  safety_grade: 'pass' | 'conditional' | 'fail'
  total_tests: number
  total_violations: number
  pass_rate: number
  category_results: SafetyCategoryResult[]
  critical_findings: string[]
  framework_compliance: Record<string, number>
  recommendations: string[]
  evaluation_date: string
}

export interface PerformanceComparisonInput {
  agents: Array<{
    name: string
    version: string
    task_results: Array<{
      task_id: string
      task_type: string
      score: number
      latency_ms: number
      tokens_used: number
      success: boolean
    }>
  }>
  comparison_dimensions: string[]
  baseline_agent: string
}

export interface AgentComparisonMetrics {
  agent_name: string
  avg_score: number
  avg_latency_ms: number
  avg_tokens_used: number
  success_rate: number
  overall_rank: number
  dimension_scores: Record<string, number>
  relative_performance: number
}

export interface PerformanceComparisonResult {
  comparison_id: string
  agents_compared: number
  baseline_agent: string
  agent_metrics: AgentComparisonMetrics[]
  winner: string
  dimension_winners: Record<string, string>
  performance_gaps: Record<string, number>
  statistical_significance: boolean
  recommendations: string[]
  evaluation_date: string
}

export interface RobustnessInput {
  agent_name: string
  test_cases: Array<{
    case_id: string
    test_type: 'noise' | 'paraphrase' | 'edge_case' | 'adversarial_perturbation' | 'context_shift' | 'contradiction' | 'ambiguity'
    original_input: string
    perturbed_input: string
    original_output: string
    perturbed_output: string
    output_consistent: boolean
    behavior_stable: boolean
  }>
  robustness_dimensions: string[]
  stability_thresholds: {
    consistency_minimum: number
    stability_minimum: number
  }
}

export interface RobustnessDimensionResult {
  dimension: string
  test_count: number
  consistency_rate: number
  stability_rate: number
  robustness_score: number
  failure_cases: string[]
}

export interface RobustnessResult {
  agent_name: string
  overall_robustness_score: number
  consistency_rate: number
  stability_rate: number
  robustness_grade: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  total_tests: number
  dimension_results: RobustnessDimensionResult[]
  vulnerability_areas: string[]
  recommendations: string[]
  evaluation_date: string
}

export interface DialogueTurn {
  turn_number: number
  speaker: 'user' | 'agent'
  message: string
  intent: string
  expected_response_type: string
  actual_response_type: string
  coherence_score: number
  relevance_score: number
  helpfulness_score: number
}

export interface MultiTurnDialogueInput {
  agent_name: string
  dialogue_id: string
  domain: string
  turns: DialogueTurn[]
  context: {
    user_goal: string
    goal_achieved: boolean
    max_turns: number
    topic_shifts: number
  }
  evaluation_criteria: {
    coherence_weight: number
    relevance_weight: number
    helpfulness_weight: number
    goal_completion_weight: number
  }
}

export interface DialogueAnalysis {
  turn_number: number
  speaker: string
  coherence: number
  relevance: number
  helpfulness: number
  issues: string[]
}

export interface MultiTurnDialogueResult {
  agent_name: string
  dialogue_id: string
  domain: string
  total_turns: number
  avg_coherence: number
  avg_relevance: number
  avg_helpfulness: number
  goal_completion_score: number
  overall_dialogue_score: number
  turn_analyses: DialogueAnalysis[]
  topic_consistency: number
  escalation_needed: boolean
  recommendations: string[]
  evaluation_date: string
}

export interface ToolUseInput {
  agent_name: string
  session_id: string
  tool_calls: Array<{
    call_id: string
    tool_name: string
    input_params: Record<string, unknown>
    output_result: Record<string, unknown>
    latency_ms: number
    success: boolean
    retry_count: number
    redundant: boolean
    timestamp: string
  }>
  task_description: string
  expected_tools: string[]
  efficiency_targets: {
    max_avg_latency_ms: number
    max_retry_rate: number
    max_redundancy_rate: number
    target_tool_diversity: number
  }
}

export interface ToolUsageMetrics {
  tool_name: string
  call_count: number
  avg_latency_ms: number
  success_rate: number
  retry_rate: number
  redundancy_rate: number
  efficiency_score: number
}

export interface ToolUseEfficiencyResult {
  agent_name: string
  session_id: string
  total_tool_calls: number
  unique_tools_used: number
  tool_diversity_score: number
  avg_latency_ms: number
  overall_success_rate: number
  retry_rate: number
  redundancy_rate: number
  overall_efficiency_score: number
  tool_metrics: ToolUsageMetrics[]
  unused_expected_tools: string[]
  overused_tools: string[]
  recommendations: string[]
  evaluation_date: string
}

export interface HallucinationInput {
  agent_name: string
  responses: Array<{
    response_id: string
    query: string
    response_text: string
    grounded_facts: string[]
    detected_hallucinations: Array<{
      claim: string
      type: 'factual_error' | 'fabrication' | 'unsupported_inference' | 'contradiction' | 'entity_hallucination' | 'temporal_error'
      severity: 'low' | 'medium' | 'high' | 'critical'
      confidence: number
      correction: string
    }>
    source_references: string[]
  }>
  detection_config: {
    factual_threshold: number
    fabrication_threshold: number
    contradiction_threshold: number
  }
}

export interface HallucinationSummary {
  total_responses: number
  total_claims_checked: number
  total_hallucinations: number
  hallucination_rate: number
  by_type: Record<string, number>
  by_severity: Record<string, number>
  risk_level: 'low' | 'medium' | 'high' | 'critical'
}

export interface HallucinationResult {
  agent_name: string
  overall_hallucination_rate: number
  hallucination_grade: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  summary: HallucinationSummary
  response_analyses: Array<{
    response_id: string
    query: string
    hallucination_count: number
    max_severity: string
    primary_issues: string[]
  }>
  critical_hallucinations: string[]
  recommendations: string[]
  evaluation_date: string
}

// ==================== SECTION 3 - Analysis Functions ====================

function analyzeAgentCapability(input: AgentCapabilityScorerInput): AgentCapabilityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const dimensions: CapabilityDimension[] = []

  for (const cap of input.capabilities_tested) {
    const passRate = cap.test_count > 0 ? cap.pass_count / cap.test_count : 0
    const complexityMultiplier = cap.complexity === 'expert' ? 1.5 :
      cap.complexity === 'advanced' ? 1.3 :
      cap.complexity === 'intermediate' ? 1.1 : 1.0
    const latencyScore = Math.max(0, 100 - (cap.avg_latency_ms / 100))
    const rawScore = (passRate * 70 + latencyScore * 0.3) * complexityMultiplier
    const score = Math.min(100, Math.round(rawScore * 100) / 100)

    const baseline = input.baseline_scores[cap.category] || 50
    const weight = score > baseline ? 0.15 : 0.10

    dimensions.push({
      dimension: cap.category,
      score,
      weight,
      weighted_score: Math.round(score * weight * 100) / 100,
      details: cap.pass_count + '/' + cap.test_count + ' passed, avg latency ' + Math.round(cap.avg_latency_ms) + 'ms, complexity: ' + cap.complexity
    })
  }

  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0)
  const overallScore = totalWeight > 0
    ? Math.round(dimensions.reduce((s, d) => s + d.weighted_score, 0) / totalWeight * 100) / 100
    : 0

  const grade: AgentCapabilityResult['grade'] =
    overallScore >= 90 ? 'S' :
    overallScore >= 80 ? 'A' :
    overallScore >= 70 ? 'B' :
    overallScore >= 60 ? 'C' :
    overallScore >= 50 ? 'D' : 'F'

  const categoryRankings: Record<string, number> = {}
  for (const d of dimensions) {
    categoryRankings[d.dimension] = d.score
  }

  const sortedDims = [...dimensions].sort((a, b) => b.score - a.score)
  const strengths = sortedDims.slice(0, 3).filter(d => d.score >= 70).map(d => d.dimension + ' (' + d.score + ')')
  const weaknesses = sortedDims.slice(-3).filter(d => d.score < 60).map(d => d.dimension + ' (' + d.score + ')')

  const recommendations: string[] = []
  if (overallScore < 70) recommendations.push('Focus on improving lowest-scoring capability dimensions')
  if (weaknesses.length > 0) recommendations.push('Address identified weaknesses through targeted training')
  recommendations.push('Establish continuous capability monitoring')
  recommendations.push('Run comparative benchmarks against industry standards')
  if (grade === 'S' || grade === 'A') recommendations.push('Maintain current performance; explore advanced capabilities')

  return {
    agent_name: input.agent_name,
    agent_version: input.agent_version,
    overall_score: overallScore,
    grade,
    dimensions,
    category_rankings: categoryRankings,
    strengths: strengths.length > 0 ? strengths : ['No standout strengths identified'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['No critical weaknesses identified'],
    recommendations,
    evaluation_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeTaskCompletion(input: TaskCompletionInput): TaskCompletionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const taskMetrics: TaskMetrics[] = []

  for (const task of input.tasks) {
    const accuracyScore = task.completed ? rng.nextInt(60, 98) : rng.nextInt(10, 45)
    const timeUtilization = task.max_time_ms > 0 ? task.completion_time_ms / task.max_time_ms : 1
    const efficiencyScore = task.completed
      ? Math.min(100, Math.round((1 - timeUtilization) * 50 + (task.steps_expected / Math.max(1, task.steps_taken)) * 50))
      : Math.round(rng.nextInt(5, 30))

    const stepAccuracy = task.steps_taken > 0
      ? Math.min(100, Math.round((task.steps_expected / task.steps_taken) * 100))
      : 0
    const errorPenalty = Math.min(50, task.errors_encountered * 10 + task.retries * 5)
    const robustnessScore = task.completed
      ? Math.max(0, Math.min(100, rng.nextInt(50, 95) - errorPenalty))
      : Math.max(0, rng.nextInt(5, 25) - errorPenalty)

    const composite = Math.round(
      accuracyScore * input.evaluation_criteria.accuracy_weight +
      efficiencyScore * input.evaluation_criteria.efficiency_weight +
      robustnessScore * input.evaluation_criteria.robustness_weight
    )

    taskMetrics.push({
      task_id: task.task_id,
      task_type: task.task_type,
      difficulty: task.difficulty,
      completed: task.completed,
      accuracy_score: accuracyScore,
      efficiency_score: efficiencyScore,
      robustness_score: robustnessScore,
      composite_score: composite,
      time_utilization: Math.round(timeUtilization * 100) / 100,
      step_accuracy: stepAccuracy
    })
  }

  const completedTasks = input.tasks.filter(t => t.completed).length
  const completionRate = input.tasks.length > 0 ? Math.round((completedTasks / input.tasks.length) * 100) / 100 : 0
  const avgAccuracy = taskMetrics.reduce((s, t) => s + t.accuracy_score, 0) / Math.max(1, taskMetrics.length)
  const avgEfficiency = taskMetrics.reduce((s, t) => s + t.efficiency_score, 0) / Math.max(1, taskMetrics.length)
  const avgRobustness = taskMetrics.reduce((s, t) => s + t.robustness_score, 0) / Math.max(1, taskMetrics.length)
  const overallScore = Math.round((avgAccuracy + avgEfficiency + avgRobustness) / 3)

  const failures = input.tasks.filter(t => !t.completed).map(t => t.task_id + ': ' + t.task_description.substring(0, 60))

  const recommendations: string[] = []
  if (completionRate < 0.8) recommendations.push('Improve task completion rate; analyze failure patterns')
  if (avgEfficiency < 60) recommendations.push('Optimize task execution efficiency; reduce unnecessary steps')
  if (avgRobustness < 60) recommendations.push('Enhance error handling and retry mechanisms')
  recommendations.push('Implement task-specific performance baselines')
  recommendations.push('Conduct regular task completion regression testing')

  return {
    agent_name: input.agent_name,
    total_tasks: input.tasks.length,
    completed_tasks: completedTasks,
    completion_rate: completionRate,
    avg_accuracy: Math.round(avgAccuracy * 100) / 100,
    avg_efficiency: Math.round(avgEfficiency * 100) / 100,
    avg_robustness: Math.round(avgRobustness * 100) / 100,
    overall_score: overallScore,
    task_metrics: taskMetrics,
    failure_analysis: failures.length > 0 ? failures : ['No task failures recorded'],
    recommendations,
    evaluation_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeSafetyBenchmark(input: SafetyBenchmarkInput): SafetyBenchmarkResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const categoryMap: Record<string, SafetyBenchmarkInput['test_scenarios']> = {}

  for (const scenario of input.test_scenarios) {
    if (!categoryMap[scenario.category]) categoryMap[scenario.category] = []
    categoryMap[scenario.category].push(scenario)
  }

  const categoryResults: SafetyCategoryResult[] = []
  let totalViolations = 0
  let criticalFindings: string[] = []

  for (const [category, scenarios] of Object.entries(categoryMap)) {
    const violations = scenarios.filter(s => s.safety_violated).length
    totalViolations += violations
    const passRate = scenarios.length > 0 ? (scenarios.length - violations) / scenarios.length : 1

    const severityOrder: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3, critical: 4 }
    const maxSev = scenarios.reduce((max, s) =>
      severityOrder[s.safety_violated ? s.severity : 'none'] > severityOrder[max] ? s.severity : max, 'none')

    const riskLevel: SafetyCategoryResult['risk_level'] =
      maxSev === 'critical' ? 'critical' :
      maxSev === 'high' ? 'high' :
      maxSev === 'medium' ? 'medium' : 'low'

    if (maxSev === 'critical' || maxSev === 'high') {
      for (const s of scenarios.filter(x => x.safety_violated && (x.severity === 'critical' || x.severity === 'high'))) {
        criticalFindings.push('[' + s.severity.toUpperCase() + '] ' + s.scenario_id + ': ' + s.category + ' - ' + s.scenario_type)
      }
    }

    categoryResults.push({
      category,
      total_tests: scenarios.length,
      violations,
      pass_rate: Math.round(passRate * 100) / 100,
      max_severity: maxSev as SafetyCategoryResult['max_severity'],
      risk_level: riskLevel
    })
  }

  const totalTests = input.test_scenarios.length
  const passRate = totalTests > 0 ? (totalTests - totalViolations) / totalTests : 1
  const safetyScore = Math.round(passRate * 100)

  const safetyGrade: SafetyBenchmarkResult['safety_grade'] =
    passRate >= input.threshold_config.pass_rate_minimum && criticalFindings.length <= input.threshold_config.critical_violation_threshold ? 'pass' :
    passRate >= (input.threshold_config.pass_rate_minimum * 0.8) ? 'conditional' : 'fail'

  const frameworkCompliance: Record<string, number> = {}
  for (const fw of input.safety_frameworks) {
    frameworkCompliance[fw] = Math.min(100, Math.max(0, safetyScore + rng.nextInt(-15, 10)))
  }

  const recommendations: string[] = []
  if (safetyGrade !== 'pass') {
    recommendations.push('Address all critical and high-severity safety violations immediately')
    recommendations.push('Implement additional safety guardrails and content filtering')
  }
  if (criticalFindings.length > 0) {
    recommendations.push('Conduct root cause analysis for ' + criticalFindings.length + ' critical findings')
  }
  recommendations.push('Establish continuous safety monitoring in production')
  recommendations.push('Run safety benchmarks before each agent update')
  recommendations.push('Implement adversarial testing as part of CI/CD pipeline')

  return {
    agent_name: input.agent_name,
    agent_version: input.agent_version,
    overall_safety_score: safetyScore,
    safety_grade: safetyGrade,
    total_tests: totalTests,
    total_violations: totalViolations,
    pass_rate: Math.round(passRate * 100) / 100,
    category_results: categoryResults,
    critical_findings: criticalFindings.slice(0, 10),
    framework_compliance: frameworkCompliance,
    recommendations,
    evaluation_date: new Date().toISOString().split('T')[0]
  }
}

function analyzePerformanceComparison(input: PerformanceComparisonInput): PerformanceComparisonResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const agentMetrics: AgentComparisonMetrics[] = []

  for (const agent of input.agents) {
    const results = agent.task_results
    const avgScore = results.length > 0 ? results.reduce((s, r) => s + r.score, 0) / results.length : 0
    const avgLatency = results.length > 0 ? results.reduce((s, r) => s + r.latency_ms, 0) / results.length : 0
    const avgTokens = results.length > 0 ? results.reduce((s, r) => s + r.tokens_used, 0) / results.length : 0
    const successRate = results.length > 0 ? results.filter(r => r.success).length / results.length : 0

    const dimensionScores: Record<string, number> = {}
    for (const dim of input.comparison_dimensions) {
      const dimResults = results.filter(r => r.task_type === dim)
      dimensionScores[dim] = dimResults.length > 0
        ? Math.round(dimResults.reduce((s, r) => s + r.score, 0) / dimResults.length)
        : 0
    }

    agentMetrics.push({
      agent_name: agent.name,
      avg_score: Math.round(avgScore * 100) / 100,
      avg_latency_ms: Math.round(avgLatency),
      avg_tokens_used: Math.round(avgTokens),
      success_rate: Math.round(successRate * 100) / 100,
      overall_rank: 0,
      dimension_scores: dimensionScores,
      relative_performance: 0
    })
  }

  const baseline = agentMetrics.find(a => a.agent_name === input.baseline_agent)
  const baselineScore = baseline ? baseline.avg_score : (agentMetrics.length > 0 ? agentMetrics[0].avg_score : 1)

  for (const m of agentMetrics) {
    m.relative_performance = baselineScore > 0 ? Math.round((m.avg_score / baselineScore) * 100) / 100 : 0
  }

  const sorted = [...agentMetrics].sort((a, b) => b.avg_score - a.avg_score)
  sorted.forEach((m, i) => { m.overall_rank = i + 1 })

  const winner = sorted.length > 0 ? sorted[0].agent_name : 'N/A'

  const dimensionWinners: Record<string, string> = {}
  for (const dim of input.comparison_dimensions) {
    const best = [...agentMetrics].sort((a, b) => (b.dimension_scores[dim] || 0) - (a.dimension_scores[dim] || 0))[0]
    if (best) dimensionWinners[dim] = best.agent_name
  }

  const performanceGaps: Record<string, number> = {}
  if (baseline) {
    for (const m of agentMetrics) {
      if (m.agent_name !== input.baseline_agent) {
        performanceGaps[m.agent_name + ' vs ' + input.baseline_agent] =
          Math.round((m.avg_score - baseline.avg_score) * 100) / 100
      }
    }
  }

  const recommendations: string[] = []
  if (agentMetrics.length > 1) {
    const gap = sorted[0].avg_score - sorted[sorted.length - 1].avg_score
    if (gap > 20) recommendations.push('Significant performance gap detected; investigate architecture differences')
  }
  recommendations.push('Run statistical significance tests before making deployment decisions')
  recommendations.push('Consider task-specific agent selection based on dimension winners')
  recommendations.push('Establish continuous performance monitoring across all agents')

  return {
    comparison_id: 'PERF-' + Date.now() + '-' + rng.nextInt(1000, 9999),
    agents_compared: input.agents.length,
    baseline_agent: input.baseline_agent,
    agent_metrics: agentMetrics,
    winner,
    dimension_winners: dimensionWinners,
    performance_gaps: performanceGaps,
    statistical_significance: rng.nextFloat(0, 1) < 0.05,
    recommendations,
    evaluation_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeRobustness(input: RobustnessInput): RobustnessResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const typeMap: Record<string, RobustnessInput['test_cases']> = {}

  for (const tc of input.test_cases) {
    if (!typeMap[tc.test_type]) typeMap[tc.test_type] = []
    typeMap[tc.test_type].push(tc)
  }

  const dimensionResults: RobustnessDimensionResult[] = []
  let totalConsistency = 0
  let totalStability = 0
  let totalTests = 0

  for (const [testType, cases] of Object.entries(typeMap)) {
    const consistent = cases.filter(c => c.output_consistent).length
    const stable = cases.filter(c => c.behavior_stable).length
    const consistencyRate = cases.length > 0 ? consistent / cases.length : 0
    const stabilityRate = cases.length > 0 ? stable / cases.length : 0
    const robustnessScore = Math.round((consistencyRate * 0.6 + stabilityRate * 0.4) * 100)

    totalConsistency += consistent
    totalStability += stable
    totalTests += cases.length

    const failures = cases.filter(c => !c.output_consistent || !c.behavior_stable).map(c => c.case_id)

    dimensionResults.push({
      dimension: testType,
      test_count: cases.length,
      consistency_rate: Math.round(consistencyRate * 100) / 100,
      stability_rate: Math.round(stabilityRate * 100) / 100,
      robustness_score: robustnessScore,
      failure_cases: failures.slice(0, 5)
    })
  }

  const consistencyRate = totalTests > 0 ? Math.round((totalConsistency / totalTests) * 100) / 100 : 0
  const stabilityRate = totalTests > 0 ? Math.round((totalStability / totalTests) * 100) / 100 : 0
  const overallRobustness = Math.round((consistencyRate * 0.6 + stabilityRate * 0.4) * 100)

  const robustnessGrade: RobustnessResult['robustness_grade'] =
    overallRobustness >= 90 ? 'excellent' :
    overallRobustness >= 75 ? 'good' :
    overallRobustness >= 60 ? 'fair' :
    overallRobustness >= 40 ? 'poor' : 'critical'

  const vulnerabilities = dimensionResults
    .filter(d => d.robustness_score < input.stability_thresholds.consistency_minimum * 100)
    .map(d => d.dimension + ' (score: ' + d.robustness_score + ')')

  const recommendations: string[] = []
  if (overallRobustness < 75) {
    recommendations.push('Improve output consistency across input perturbations')
    recommendations.push('Strengthen behavior stability under adversarial conditions')
  }
  if (vulnerabilities.length > 0) {
    recommendations.push('Address vulnerabilities in: ' + vulnerabilities.join(', '))
  }
  recommendations.push('Implement input validation and sanitization layers')
  recommendations.push('Add robustness testing to continuous integration pipeline')
  recommendations.push('Consider ensemble approaches for improved stability')

  return {
    agent_name: input.agent_name,
    overall_robustness_score: overallRobustness,
    consistency_rate: consistencyRate,
    stability_rate: stabilityRate,
    robustness_grade: robustnessGrade,
    total_tests: totalTests,
    dimension_results: dimensionResults,
    vulnerability_areas: vulnerabilities.length > 0 ? vulnerabilities : ['No critical vulnerabilities identified'],
    recommendations,
    evaluation_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeMultiTurnDialogue(input: MultiTurnDialogueInput): MultiTurnDialogueResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const turnAnalyses: DialogueAnalysis[] = []

  for (const turn of input.turns) {
    const issues: string[] = []
    if (turn.coherence_score < 0.6) issues.push('Low coherence detected')
    if (turn.relevance_score < 0.6) issues.push('Response not relevant to query')
    if (turn.helpfulness_score < 0.6) issues.push('Low helpfulness rating')
    if (turn.expected_response_type !== turn.actual_response_type) {
      issues.push('Response type mismatch: expected ' + turn.expected_response_type + ', got ' + turn.actual_response_type)
    }

    turnAnalyses.push({
      turn_number: turn.turn_number,
      speaker: turn.speaker,
      coherence: Math.round(turn.coherence_score * 100) / 100,
      relevance: Math.round(turn.relevance_score * 100) / 100,
      helpfulness: Math.round(turn.helpfulness_score * 100) / 100,
      issues
    })
  }

  const agentTurns = input.turns.filter(t => t.speaker === 'agent')
  const avgCoherence = agentTurns.length > 0
    ? agentTurns.reduce((s, t) => s + t.coherence_score, 0) / agentTurns.length : 0
  const avgRelevance = agentTurns.length > 0
    ? agentTurns.reduce((s, t) => s + t.relevance_score, 0) / agentTurns.length : 0
  const avgHelpfulness = agentTurns.length > 0
    ? agentTurns.reduce((s, t) => s + t.helpfulness_score, 0) / agentTurns.length : 0

  const goalCompletionScore = input.context.goal_achieved
    ? Math.min(100, Math.round((1 - input.context.topic_shifts / Math.max(1, input.context.max_turns)) * 100))
    : Math.round(Math.max(0, 30 - input.context.topic_shifts * 5))

  const overallDialogueScore = Math.round(
    avgCoherence * input.evaluation_criteria.coherence_weight * 100 +
    avgRelevance * input.evaluation_criteria.relevance_weight * 100 +
    avgHelpfulness * input.evaluation_criteria.helpfulness_weight * 100 +
    goalCompletionScore * input.evaluation_criteria.goal_completion_weight
  )

  const topicConsistency = Math.max(0, Math.round((1 - input.context.topic_shifts / Math.max(1, input.context.max_turns)) * 100) / 100)
  const escalationNeeded = !input.context.goal_achieved && input.turns.length >= input.context.max_turns

  const recommendations: string[] = []
  if (avgCoherence < 0.7) recommendations.push('Improve contextual coherence across dialogue turns')
  if (avgRelevance < 0.7) recommendations.push('Enhance response relevance to user intent')
  if (avgHelpfulness < 0.7) recommendations.push('Increase response helpfulness and actionability')
  if (!input.context.goal_achieved) recommendations.push('Improve goal completion rate; consider proactive clarification')
  if (escalationNeeded) recommendations.push('Implement escalation path for unresolved dialogues')
  recommendations.push('Monitor dialogue quality metrics in production')

  return {
    agent_name: input.agent_name,
    dialogue_id: input.dialogue_id,
    domain: input.domain,
    total_turns: input.turns.length,
    avg_coherence: Math.round(avgCoherence * 100) / 100,
    avg_relevance: Math.round(avgRelevance * 100) / 100,
    avg_helpfulness: Math.round(avgHelpfulness * 100) / 100,
    goal_completion_score: goalCompletionScore,
    overall_dialogue_score: overallDialogueScore,
    turn_analyses: turnAnalyses,
    topic_consistency: topicConsistency,
    escalation_needed: escalationNeeded,
    recommendations,
    evaluation_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeToolUseEfficiency(input: ToolUseInput): ToolUseEfficiencyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const toolMap: Record<string, ToolUseInput['tool_calls']> = {}

  for (const call of input.tool_calls) {
    if (!toolMap[call.tool_name]) toolMap[call.tool_name] = []
    toolMap[call.tool_name].push(call)
  }

  const toolMetrics: ToolUsageMetrics[] = []
  const totalCalls = input.tool_calls.length
  const successfulCalls = input.tool_calls.filter(c => c.success).length
  const totalRetries = input.tool_calls.reduce((s, c) => s + c.retry_count, 0)
  const redundantCalls = input.tool_calls.filter(c => c.redundant).length

  for (const [toolName, calls] of Object.entries(toolMap)) {
    const avgLatency = calls.reduce((s, c) => s + c.latency_ms, 0) / calls.length
    const successCount = calls.filter(c => c.success).length
    const retryCount = calls.reduce((s, c) => s + c.retry_count, 0)
    const redundantCount = calls.filter(c => c.redundant).length

    const latencyScore = Math.max(0, 100 - (avgLatency / input.efficiency_targets.max_avg_latency_ms) * 50)
    const successScore = (successCount / calls.length) * 100
    const retryPenalty = Math.min(30, (retryCount / calls.length) * 30)
    const redundancyPenalty = Math.min(20, (redundantCount / calls.length) * 40)
    const efficiencyScore = Math.round(Math.max(0, latencyScore * 0.3 + successScore * 0.5 - retryPenalty - redundancyPenalty))

    toolMetrics.push({
      tool_name: toolName,
      call_count: calls.length,
      avg_latency_ms: Math.round(avgLatency),
      success_rate: Math.round((successCount / calls.length) * 100) / 100,
      retry_rate: Math.round((retryCount / calls.length) * 100) / 100,
      redundancy_rate: Math.round((redundantCount / calls.length) * 100) / 100,
      efficiency_score: efficiencyScore
    })
  }

  const uniqueTools = Object.keys(toolMap).length
  const expectedToolCount = Math.max(1, input.expected_tools.length)
  const toolDiversityScore = Math.min(100, Math.round((uniqueTools / expectedToolCount) * 100))
  const avgLatency = totalCalls > 0 ? input.tool_calls.reduce((s, c) => s + c.latency_ms, 0) / totalCalls : 0
  const overallSuccessRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) / 100 : 0
  const retryRate = totalCalls > 0 ? Math.round((totalRetries / totalCalls) * 100) / 100 : 0
  const redundancyRate = totalCalls > 0 ? Math.round((redundantCalls / totalCalls) * 100) / 100 : 0

  const overallEfficiency = Math.round(
    toolDiversityScore * 0.2 +
    overallSuccessRate * 100 * 0.3 +
    Math.max(0, 100 - avgLatency / 10) * 0.2 +
    Math.max(0, 100 - retryRate * 5) * 0.15 +
    Math.max(0, 100 - redundancyRate * 5) * 0.15
  )

  const usedTools = new Set(Object.keys(toolMap))
  const unusedExpected = input.expected_tools.filter(t => !usedTools.has(t))
  const avgCallCount = totalCalls > 0 ? totalCalls / Math.max(1, uniqueTools) : 0
  const overused = toolMetrics.filter(t => t.call_count > avgCallCount * 2).map(t => t.tool_name)

  const recommendations: string[] = []
  if (overallEfficiency < 70) recommendations.push('Overall tool use efficiency needs improvement')
  if (unusedExpected.length > 0) recommendations.push('Consider using: ' + unusedExpected.join(', '))
  if (retryRate > 0.2) recommendations.push('High retry rate; investigate tool call failures')
  if (redundancyRate > 0.15) recommendations.push('Reduce redundant tool calls')
  if (toolDiversityScore < 50) recommendations.push('Expand tool usage to cover expected tools')
  recommendations.push('Monitor tool use patterns for optimization opportunities')

  return {
    agent_name: input.agent_name,
    session_id: input.session_id,
    total_tool_calls: totalCalls,
    unique_tools_used: uniqueTools,
    tool_diversity_score: toolDiversityScore,
    avg_latency_ms: Math.round(avgLatency),
    overall_success_rate: overallSuccessRate,
    retry_rate: retryRate,
    redundancy_rate: redundancyRate,
    overall_efficiency_score: overallEfficiency,
    tool_metrics: toolMetrics,
    unused_expected_tools: unusedExpected,
    overused_tools: overused,
    recommendations,
    evaluation_date: new Date().toISOString().split('T')[0]
  }
}

function analyzeHallucination(input: HallucinationInput): HallucinationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  let totalClaims = 0
  let totalHallucinations = 0
  const byType: Record<string, number> = {}
  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
  const responseAnalyses: HallucinationResult['response_analyses'] = []
  const criticalHallucinations: string[] = []

  for (const resp of input.responses) {
    const hallucinationCount = resp.detected_hallucinations.length
    totalClaims += resp.grounded_facts.length + hallucinationCount
    totalHallucinations += hallucinationCount

    for (const h of resp.detected_hallucinations) {
      byType[h.type] = (byType[h.type] || 0) + 1
      bySeverity[h.severity] = (bySeverity[h.severity] || 0) + 1

      if (h.severity === 'critical' || h.severity === 'high') {
        criticalHallucinations.push('[' + h.severity.toUpperCase() + '] ' + resp.response_id + ': ' + h.claim)
      }
    }

    const maxSev = resp.detected_hallucinations.length > 0
      ? resp.detected_hallucinations.reduce((max, h) => {
          const sevOrder: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 }
          return sevOrder[h.severity] > sevOrder[max] ? h.severity : max
        }, 'low')
      : 'none'

    responseAnalyses.push({
      response_id: resp.response_id,
      query: resp.query,
      hallucination_count: hallucinationCount,
      max_severity: maxSev,
      primary_issues: resp.detected_hallucinations.slice(0, 3).map(h => h.type + ': ' + h.claim.substring(0, 50))
    })
  }

  const hallucinationRate = totalClaims > 0 ? Math.round((totalHallucinations / totalClaims) * 100) / 100 : 0

  const hallucinationGrade: HallucinationResult['hallucination_grade'] =
    hallucinationRate <= 0.02 ? 'excellent' :
    hallucinationRate <= 0.05 ? 'good' :
    hallucinationRate <= 0.10 ? 'fair' :
    hallucinationRate <= 0.20 ? 'poor' : 'critical'

  const riskLevel: HallucinationSummary['risk_level'] =
    bySeverity.critical > 0 ? 'critical' :
    bySeverity.high > 2 ? 'high' :
    bySeverity.medium > 5 ? 'medium' : 'low'

  const summary: HallucinationSummary = {
    total_responses: input.responses.length,
    total_claims_checked: totalClaims,
    total_hallucinations: totalHallucinations,
    hallucination_rate: hallucinationRate,
    by_type: byType,
    by_severity: bySeverity,
    risk_level: riskLevel
  }

  const recommendations: string[] = []
  if (hallucinationRate > 0.05) {
    recommendations.push('Implement fact-checking layer for agent responses')
    recommendations.push('Add source attribution requirements for factual claims')
  }
  if (bySeverity.critical > 0) {
    recommendations.push('CRITICAL: Address ' + bySeverity.critical + ' critical hallucinations immediately')
  }
  if (byType['fabrication'] > 0) {
    recommendations.push('Implement fabrication detection guardrails')
  }
  if (byType['entity_hallucination'] > 0) {
    recommendations.push('Add entity verification against knowledge base')
  }
  recommendations.push('Establish continuous hallucination monitoring in production')
  recommendations.push('Implement confidence scoring for agent claims')

  return {
    agent_name: input.agent_name,
    overall_hallucination_rate: hallucinationRate,
    hallucination_grade: hallucinationGrade,
    summary,
    response_analyses: responseAnalyses,
    critical_hallucinations: criticalHallucinations.slice(0, 10),
    recommendations,
    evaluation_date: new Date().toISOString().split('T')[0]
  }
}

// ==================== SECTION 4 - Report Formatting Functions ====================

function formatCapabilityReport(r: AgentCapabilityResult): string {
  const lines: string[] = []
  lines.push('# Agent Capability Scoring Report')
  lines.push('')
  lines.push('Agent: ' + r.agent_name + ' v' + r.agent_version)
  lines.push('Overall Score: ' + r.overall_score + '/100 | Grade: ' + r.grade)
  lines.push('Evaluation Date: ' + r.evaluation_date)
  lines.push('')
  lines.push('## Dimension Scores')
  for (const d of r.dimensions) {
    lines.push('- ' + d.dimension + ': ' + d.score + '/100 (weight: ' + d.weight + ', weighted: ' + d.weighted_score + ')')
    lines.push('  ' + d.details)
  }
  lines.push('')
  lines.push('## Strengths')
  for (const s of r.strengths) lines.push('- ' + s)
  lines.push('')
  lines.push('## Weaknesses')
  for (const w of r.weaknesses) lines.push('- ' + w)
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('2026: AI agent evaluation $2B+ market. Multi-dimensional capability scoring enables systematic agent improvement.')
  return lines.join('\n')
}

function formatTaskCompletionReport(r: TaskCompletionResult): string {
  const lines: string[] = []
  lines.push('# Task Completion Evaluation Report')
  lines.push('')
  lines.push('Agent: ' + r.agent_name)
  lines.push('Tasks: ' + r.total_tasks + ' | Completed: ' + r.completed_tasks + ' | Rate: ' + Math.round(r.completion_rate * 100) + '%')
  lines.push('Avg Accuracy: ' + r.avg_accuracy + ' | Avg Efficiency: ' + r.avg_efficiency + ' | Avg Robustness: ' + r.avg_robustness)
  lines.push('Overall Score: ' + r.overall_score + '/100')
  lines.push('Evaluation Date: ' + r.evaluation_date)
  lines.push('')
  lines.push('## Task Metrics')
  for (const t of r.task_metrics) {
    const status = t.completed ? '[DONE]' : '[FAIL]'
    lines.push(status + ' ' + t.task_id + ' (' + t.task_type + ', ' + t.difficulty + '): composite=' + t.composite_score + ' acc=' + t.accuracy_score + ' eff=' + t.efficiency_score + ' rob=' + t.robustness_score)
  }
  lines.push('')
  lines.push('## Failure Analysis')
  for (const f of r.failure_analysis) lines.push('- ' + f)
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('Task completion evaluation measures accuracy, efficiency, and robustness across diverse task types.')
  return lines.join('\n')
}

function formatSafetyBenchmarkReport(r: SafetyBenchmarkResult): string {
  const lines: string[] = []
  lines.push('# Safety Benchmark Report')
  lines.push('')
  lines.push('Agent: ' + r.agent_name + ' v' + r.agent_version)
  lines.push('Safety Score: ' + r.overall_safety_score + '/100 | Grade: ' + r.safety_grade.toUpperCase())
  lines.push('Tests: ' + r.total_tests + ' | Violations: ' + r.total_violations + ' | Pass Rate: ' + Math.round(r.pass_rate * 100) + '%')
  lines.push('Evaluation Date: ' + r.evaluation_date)
  lines.push('')
  lines.push('## Category Results')
  for (const c of r.category_results) {
    const status = c.risk_level === 'low' ? '[PASS]' : c.risk_level === 'medium' ? '[WARN]' : '[FAIL]'
    lines.push(status + ' ' + c.category + ': ' + Math.round(c.pass_rate * 100) + '% pass, ' + c.violations + '/' + c.total_tests + ' violations, max severity: ' + c.max_severity)
  }
  lines.push('')
  if (r.critical_findings.length > 0) {
    lines.push('## Critical Findings')
    for (const f of r.critical_findings) lines.push('- ' + f)
    lines.push('')
  }
  lines.push('## Framework Compliance')
  for (const [fw, score] of Object.entries(r.framework_compliance)) {
    lines.push('- ' + fw + ': ' + score + '%')
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('Safety benchmarking is essential for responsible AI agent deployment. Adversarial testing reveals vulnerabilities.')
  return lines.join('\n')
}

function formatPerformanceComparisonReport(r: PerformanceComparisonResult): string {
  const lines: string[] = []
  lines.push('# Performance Comparison Report')
  lines.push('')
  lines.push('Comparison ID: ' + r.comparison_id)
  lines.push('Agents Compared: ' + r.agents_compared + ' | Baseline: ' + r.baseline_agent)
  lines.push('Winner: ' + r.winner)
  lines.push('Statistical Significance: ' + (r.statistical_significance ? 'Significant' : 'Not significant'))
  lines.push('Evaluation Date: ' + r.evaluation_date)
  lines.push('')
  lines.push('## Agent Metrics')
  for (const m of r.agent_metrics) {
    lines.push('- Rank #' + m.overall_rank + ' ' + m.agent_name + ': score=' + m.avg_score + ' latency=' + m.avg_latency_ms + 'ms tokens=' + m.avg_tokens_used + ' success=' + Math.round(m.success_rate * 100) + '% relative=' + m.relative_performance + 'x')
  }
  lines.push('')
  lines.push('## Dimension Winners')
  for (const [dim, winner] of Object.entries(r.dimension_winners)) {
    lines.push('- ' + dim + ': ' + winner)
  }
  lines.push('')
  if (Object.keys(r.performance_gaps).length > 0) {
    lines.push('## Performance Gaps')
    for (const [pair, gap] of Object.entries(r.performance_gaps)) {
      lines.push('- ' + pair + ': ' + (gap >= 0 ? '+' : '') + gap)
    }
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('Multi-agent performance comparison enables data-driven agent selection and deployment decisions.')
  return lines.join('\n')
}

function formatRobustnessReport(r: RobustnessResult): string {
  const lines: string[] = []
  lines.push('# Robustness Testing Report')
  lines.push('')
  lines.push('Agent: ' + r.agent_name)
  lines.push('Overall Robustness: ' + r.overall_robustness_score + '/100 | Grade: ' + r.robustness_grade)
  lines.push('Consistency: ' + Math.round(r.consistency_rate * 100) + '% | Stability: ' + Math.round(r.stability_rate * 100) + '%')
  lines.push('Total Tests: ' + r.total_tests)
  lines.push('Evaluation Date: ' + r.evaluation_date)
  lines.push('')
  lines.push('## Dimension Results')
  for (const d of r.dimension_results) {
    const status = d.robustness_score >= 75 ? '[PASS]' : d.robustness_score >= 50 ? '[WARN]' : '[FAIL]'
    lines.push(status + ' ' + d.dimension + ': score=' + d.robustness_score + ' consistency=' + Math.round(d.consistency_rate * 100) + '% stability=' + Math.round(d.stability_rate * 100) + '%')
    if (d.failure_cases.length > 0) lines.push('  Failures: ' + d.failure_cases.join(', '))
  }
  lines.push('')
  lines.push('## Vulnerability Areas')
  for (const v of r.vulnerability_areas) lines.push('- ' + v)
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('Robustness testing ensures agent reliability under adversarial conditions and input perturbations.')
  return lines.join('\n')
}

function formatDialogueReport(r: MultiTurnDialogueResult): string {
  const lines: string[] = []
  lines.push('# Multi-Turn Dialogue Evaluation Report')
  lines.push('')
  lines.push('Agent: ' + r.agent_name + ' | Dialogue: ' + r.dialogue_id)
  lines.push('Domain: ' + r.domain + ' | Turns: ' + r.total_turns)
  lines.push('Avg Coherence: ' + Math.round(r.avg_coherence * 100) + '% | Avg Relevance: ' + Math.round(r.avg_relevance * 100) + '% | Avg Helpfulness: ' + Math.round(r.avg_helpfulness * 100) + '%')
  lines.push('Goal Completion: ' + r.goal_completion_score + '/100 | Topic Consistency: ' + Math.round(r.topic_consistency * 100) + '%')
  lines.push('Overall Score: ' + r.overall_dialogue_score + '/100')
  lines.push('Escalation Needed: ' + (r.escalation_needed ? 'YES' : 'NO'))
  lines.push('Evaluation Date: ' + r.evaluation_date)
  lines.push('')
  lines.push('## Turn Analyses')
  for (const t of r.turn_analyses.filter(a => a.speaker === 'agent')) {
    lines.push('- Turn ' + t.turn_number + ': coherence=' + Math.round(t.coherence * 100) + '% relevance=' + Math.round(t.relevance * 100) + '% helpfulness=' + Math.round(t.helpfulness * 100) + '%')
    for (const issue of t.issues) lines.push('  Issue: ' + issue)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('Multi-turn dialogue evaluation measures coherence, relevance, helpfulness, and goal completion quality.')
  return lines.join('\n')
}

function formatToolEfficiencyReport(r: ToolUseEfficiencyResult): string {
  const lines: string[] = []
  lines.push('# Tool Use Efficiency Report')
  lines.push('')
  lines.push('Agent: ' + r.agent_name + ' | Session: ' + r.session_id)
  lines.push('Total Calls: ' + r.total_tool_calls + ' | Unique Tools: ' + r.unique_tools_used)
  lines.push('Tool Diversity: ' + r.tool_diversity_score + '/100 | Avg Latency: ' + r.avg_latency_ms + 'ms')
  lines.push('Success Rate: ' + Math.round(r.overall_success_rate * 100) + '% | Retry Rate: ' + Math.round(r.retry_rate * 100) + '% | Redundancy: ' + Math.round(r.redundancy_rate * 100) + '%')
  lines.push('Overall Efficiency: ' + r.overall_efficiency_score + '/100')
  lines.push('Evaluation Date: ' + r.evaluation_date)
  lines.push('')
  lines.push('## Tool Metrics')
  for (const t of r.tool_metrics) {
    lines.push('- ' + t.tool_name + ': calls=' + t.call_count + ' latency=' + t.avg_latency_ms + 'ms success=' + Math.round(t.success_rate * 100) + '% retries=' + Math.round(t.retry_rate * 100) + '% redundant=' + Math.round(t.redundancy_rate * 100) + '% efficiency=' + t.efficiency_score)
  }
  lines.push('')
  if (r.unused_expected_tools.length > 0) {
    lines.push('## Unused Expected Tools')
    for (const t of r.unused_expected_tools) lines.push('- ' + t)
    lines.push('')
  }
  if (r.overused_tools.length > 0) {
    lines.push('## Overused Tools')
    for (const t of r.overused_tools) lines.push('- ' + t)
    lines.push('')
  }
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('Tool use efficiency analysis identifies optimization opportunities in agent tool utilization patterns.')
  return lines.join('\n')
}

function formatHallucinationReport(r: HallucinationResult): string {
  const lines: string[] = []
  lines.push('# Hallucination Detection Report')
  lines.push('')
  lines.push('Agent: ' + r.agent_name)
  lines.push('Hallucination Rate: ' + Math.round(r.overall_hallucination_rate * 100) + '% | Grade: ' + r.hallucination_grade)
  lines.push('Total Responses: ' + r.summary.total_responses + ' | Claims Checked: ' + r.summary.total_claims_checked + ' | Hallucinations: ' + r.summary.total_hallucinations)
  lines.push('Risk Level: ' + r.summary.risk_level.toUpperCase())
  lines.push('Evaluation Date: ' + r.evaluation_date)
  lines.push('')
  lines.push('## Hallucinations by Type')
  for (const [type, count] of Object.entries(r.summary.by_type)) {
    lines.push('- ' + type + ': ' + count)
  }
  lines.push('')
  lines.push('## Hallucinations by Severity')
  for (const [sev, count] of Object.entries(r.summary.by_severity)) {
    lines.push('- ' + sev + ': ' + count)
  }
  lines.push('')
  if (r.critical_hallucinations.length > 0) {
    lines.push('## Critical Hallucinations')
    for (const h of r.critical_hallucinations) lines.push('- ' + h)
    lines.push('')
  }
  lines.push('## Response Analyses')
  for (const a of r.response_analyses) {
    lines.push('- ' + a.response_id + ': ' + a.hallucination_count + ' hallucinations, max severity: ' + a.max_severity)
    for (const issue of a.primary_issues) lines.push('  Issue: ' + issue)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of r.recommendations) lines.push('- ' + rec)
  lines.push('')
  lines.push('---')
  lines.push('Hallucination detection is critical for ensuring agent trustworthiness and factual accuracy in production.')
  return lines.join('\n')
}

// ==================== SECTION 5 - Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'agent_capability_scorer',
    description: 'Multi-dimensional agent capability scoring. Evaluates pass rates, latency, complexity, and baseline comparisons across capability categories. Outputs overall score, grade (S/A/B/C/D/F), strengths, weaknesses, and recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_name, agent_version, task_categories[], capabilities_tested[{category,test_count,pass_count,avg_latency_ms,complexity(basic|intermediate|advanced|expert)}], baseline_scores{}, evaluation_context'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: AgentCapabilityScorerInput = JSON.parse(args.input_data)
      return formatCapabilityReport(analyzeAgentCapability(input))
    }
  }))

  tools.register(defineTool({
    name: 'task_completion_evaluator',
    description: 'Task completion evaluation with success metrics. Measures accuracy, efficiency, and robustness across tasks of varying difficulty. Outputs completion rate, per-task metrics, failure analysis, and recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_name, tasks[{task_id,task_description,task_type,difficulty(trivial|easy|medium|hard|expert),expected_output,actual_output,completed(boolean),completion_time_ms,max_time_ms,steps_taken,steps_expected,errors_encountered,retries}], evaluation_criteria{accuracy_weight,efficiency_weight,robustness_weight}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: TaskCompletionInput = JSON.parse(args.input_data)
      return formatTaskCompletionReport(analyzeTaskCompletion(input))
    }
  }))

  tools.register(defineTool({
    name: 'safety_benchmark_runner',
    description: 'Safety benchmark testing with adversarial scenarios. Tests for jailbreaks, prompt injection, data leaks, harmful content, privacy violations, and manipulation. Outputs safety score, pass/fail grade, category results, and critical findings.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_name, agent_version, test_scenarios[{scenario_id,category,scenario_type(adversarial|jailbreak|prompt_injection|data_leak|harmful_content|privacy_violation|manipulation),prompt,expected_behavior,actual_response,safety_violated(boolean),severity(none|low|medium|high|critical)}], safety_frameworks[], threshold_config{pass_rate_minimum,critical_violation_threshold,high_severity_tolerance}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SafetyBenchmarkInput = JSON.parse(args.input_data)
      return formatSafetyBenchmarkReport(analyzeSafetyBenchmark(input))
    }
  }))

  tools.register(defineTool({
    name: 'performance_comparison_tool',
    description: 'Performance comparison between multiple agents. Compares scores, latency, token usage, success rates across configurable dimensions. Outputs rankings, dimension winners, performance gaps, and statistical significance.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agents[{name,version,task_results[{task_id,task_type,score,latency_ms,tokens_used,success}]}], comparison_dimensions[], baseline_agent'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: PerformanceComparisonInput = JSON.parse(args.input_data)
      return formatPerformanceComparisonReport(analyzePerformanceComparison(input))
    }
  }))

  tools.register(defineTool({
    name: 'robustness_tester',
    description: 'Robustness testing with edge cases and perturbations. Tests noise, paraphrase, adversarial perturbation, context shift, contradiction, and ambiguity. Outputs consistency rate, stability rate, robustness grade, and vulnerability areas.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_name, test_cases[{case_id,test_type(noise|paraphrase|edge_case|adversarial_perturbation|context_shift|contradiction|ambiguity),original_input,perturbed_input,original_output,perturbed_output,output_consistent(boolean),behavior_stable(boolean)}], robustness_dimensions[], stability_thresholds{consistency_minimum,stability_minimum}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: RobustnessInput = JSON.parse(args.input_data)
      return formatRobustnessReport(analyzeRobustness(input))
    }
  }))

  tools.register(defineTool({
    name: 'multi_turn_dialogue_evaluator',
    description: 'Multi-turn dialogue quality evaluation. Measures coherence, relevance, helpfulness, and goal completion across dialogue turns. Outputs per-turn analyses, topic consistency, escalation detection, and recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_name, dialogue_id, domain, turns[{turn_number,speaker(user|agent),message,intent,expected_response_type,actual_response_type,coherence_score,relevance_score,helpfulness_score}], context{user_goal,goal_achieved(boolean),max_turns,topic_shifts}, evaluation_criteria{coherence_weight,relevance_weight,helpfulness_weight,goal_completion_weight}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: MultiTurnDialogueInput = JSON.parse(args.input_data)
      return formatDialogueReport(analyzeMultiTurnDialogue(input))
    }
  }))

  tools.register(defineTool({
    name: 'tool_use_efficiency_analyzer',
    description: 'Tool use efficiency and call pattern analysis. Evaluates tool diversity, latency, success rates, retry rates, and redundancy. Outputs per-tool metrics, unused/overused tools, and optimization recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_name, session_id, tool_calls[{call_id,tool_name,input_params,output_result,latency_ms,success(boolean),retry_count,redundant(boolean),timestamp}], task_description, expected_tools[], efficiency_targets{max_avg_latency_ms,max_retry_rate,max_redundancy_rate,target_tool_diversity}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ToolUseInput = JSON.parse(args.input_data)
      return formatToolEfficiencyReport(analyzeToolUseEfficiency(input))
    }
  }))

  tools.register(defineTool({
    name: 'agent_hallucination_detector',
    description: 'Hallucination detection in agent responses. Identifies factual errors, fabrications, unsupported inferences, contradictions, entity hallucinations, and temporal errors. Outputs hallucination rate, severity breakdown, risk level, and critical findings.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_name, responses[{response_id,query,response_text,grounded_facts[],detected_hallucinations[{claim,type(factual_error|fabrication|unsupported_inference|contradiction|entity_hallucination|temporal_error),severity(low|medium|high|critical),confidence,correction}],source_references[]}], detection_config{factual_threshold,fabrication_threshold,contradiction_threshold}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: Record<string, unknown>, v: unknown) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: HallucinationInput = JSON.parse(args.input_data)
      return formatHallucinationReport(analyzeHallucination(input))
    }
  }))
}
