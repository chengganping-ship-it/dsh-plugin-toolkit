/**
 * DSH CI/CD Pipeline Agent Plugin v0.1.0
 * CI/CD pipeline toolkit for DeepSeek Harness - pipeline design, test orchestration,
 * deployment strategies, build optimization, release management, pipeline analytics,
 * environment management, and rollback planning.
 * @module dsh-tool-cicdpipe | @version 0.1.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cicdpipe'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== UTILITY ====================

/** Generate a deterministic pseudo-random number from a string seed (range: 0-1) */
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs((Math.sin(hash) * 10000) % 1)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

// ==================== TYPES ====================

// --- Tool 1: Pipeline Designer ---
interface PipelineStage {
  name: string
  steps: string[]
  parallel?: boolean
  condition?: string
  timeout_minutes?: number
}

interface PipelineTrigger {
  type: 'push' | 'pull_request' | 'schedule' | 'manual' | 'webhook'
  branches?: string[]
  cron?: string
}

interface EnvConfig {
  runtime: string
  variables: Record<string, string>
  secrets?: string[]
}

interface PipelineDesignInput {
  project_type: string
  stages: PipelineStage[]
  triggers: PipelineTrigger[]
  env_config: EnvConfig
}

interface DesignedStage {
  name: string
  steps: string[]
  parallel_group: string | null
  condition: string
  timeout_minutes: number
  order: number
}

interface PipelineDesignResult {
  pipeline_id: string
  project_type: string
  stages: DesignedStage[]
  triggers: PipelineTrigger[]
  env_config: EnvConfig
  total_steps: number
  estimated_duration_min: string
  parallelism_level: string
}

// --- Tool 2: Test Orchestrator ---
interface TestSuite {
  name: string
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security'
  estimated_duration_sec: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  dependencies?: string[]
}

interface TestOrchestratorInput {
  test_suites: TestSuite[]
  coverage_target: number
  parallel_workers: number
}

interface TestExecutionPlan {
  phase: number
  suites: string[]
  estimated_duration_sec: number
  worker_allocation: number
}

interface TestOrchestratorResult {
  orchestration_id: string
  execution_plan: TestExecutionPlan[]
  total_suites: number
  estimated_total_duration_sec: number
  coverage_estimate: number
  worker_utilization: string
  critical_path: string[]
}

// --- Tool 3: Deployment Strategist ---
interface DeploymentInput {
  app_type: string
  current_version: string
  target_env: string
  strategy_type: 'blue_green' | 'canary' | 'rolling' | 'recreate'
}

interface DeploymentStep {
  order: number
  action: string
  duration_estimate: string
  rollback_action: string
}

interface RollbackPlan {
  trigger_condition: string
  steps: string[]
  estimated_rollback_time: string
  data_preservation: string
}

interface DeploymentStrategyResult {
  strategy_id: string
  strategy_type: string
  app_type: string
  target_env: string
  deployment_steps: DeploymentStep[]
  rollback_plan: RollbackPlan
  risk_level: 'low' | 'medium' | 'high'
  estimated_total_duration: string
}

// --- Tool 4: Build Optimizer ---
interface BuildHistoryEntry {
  timestamp: string
  duration_sec: number
  cache_hit: boolean
  dependencies_count: number
}

interface CacheConfig {
  enabled: boolean
  strategy: 'local' | 'remote' | 'hybrid'
  ttl_hours: number
  paths?: string[]
}

interface BuildOptimizerInput {
  build_history: BuildHistoryEntry[]
  cache_config: CacheConfig
  dependencies: string[]
}

interface OptimizationRecommendation {
  area: string
  current_value: string
  recommended_value: string
  estimated_improvement: string
  priority: 'high' | 'medium' | 'low'
}

interface BuildOptimizerResult {
  optimization_id: string
  current_avg_duration_sec: number
  optimized_avg_duration_sec: number
  improvement_percentage: number
  recommendations: OptimizationRecommendation[]
  cache_strategy: string
  dependency_optimizations: string[]
}

// --- Tool 5: Release Manager ---
interface ChangeItem {
  type: 'feature' | 'bugfix' | 'breaking' | 'docs' | 'refactor' | 'perf'
  description: string
  scope: string
  ticket_ref?: string
}

interface SemverRules {
  auto_breaking: boolean
  auto_feature: boolean
  auto_bugfix: boolean
  prefix?: string
}

interface ReleaseManagerInput {
  changes: ChangeItem[]
  semver_rules: SemverRules
  changelog_format: 'markdown' | 'json' | 'conventional'
}

interface ReleaseChecklist {
  category: string
  items: string[]
  required: boolean
}

interface ReleaseManagerResult {
  release_id: string
  new_version: string
  previous_version: string
  changelog: string
  checklist: ReleaseChecklist[]
  breaking_changes: string[]
  total_changes: number
}

// --- Tool 6: Pipeline Analyzer ---
interface PipelineRun {
  run_id: string
  status: 'success' | 'failed' | 'cancelled' | 'timeout'
  duration_sec: number
  stage?: string
  timestamp: string
  error_message?: string
}

interface PipelineAnalyzerInput {
  pipeline_runs: PipelineRun[]
  metrics_window: string
}

interface BottleneckInfo {
  stage: string
  avg_duration_sec: number
  failure_rate: number
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface PipelineAnalyzerResult {
  analysis_id: string
  metrics_window: string
  total_runs: number
  success_rate: number
  avg_duration_sec: number
  bottlenecks: BottleneckInfo[]
  trends: string[]
  improvement_recommendations: string[]
}

// --- Tool 7: Environment Manager ---
interface EnvConfigItem {
  name: string
  region: string
  variables: Record<string, string>
  resources: Record<string, string>
}

interface EnvironmentManagerInput {
  env_configs: EnvConfigItem[]
  secrets_required: string[]
  resource_limits: Record<string, string>
}

interface ConfigDrift {
  variable: string
  environments: string[]
  expected_value: string
  actual_values: Record<string, string>
  severity: 'critical' | 'warning' | 'info'
}

interface EnvironmentManagerResult {
  analysis_id: string
  environments_analyzed: number
  config_drifts: ConfigDrift[]
  missing_secrets: string[]
  resource_violations: string[]
  recommendations: string[]
  overall_health: 'healthy' | 'degraded' | 'critical'
}

// --- Tool 8: Rollback Planner ---
interface CurrentState {
  version: string
  database_version: string
  config_version: string
  active_features: string[]
  active_connections: number
}

interface RollbackPlannerInput {
  current_state: CurrentState
  target_version: string
  data_migration_needed: boolean
}

interface RollbackStep {
  order: number
  action: string
  verification: string
  estimated_duration: string
  reversible: boolean
}

interface RollbackPlannerResult {
  plan_id: string
  from_version: string
  to_version: string
  steps: RollbackStep[]
  verification_points: string[]
  data_backup_strategy: string
  estimated_total_duration: string
  risk_assessment: string
}

// ==================== TOOL 1: PIPELINE DESIGNER ====================

function designPipeline(input: PipelineDesignInput): PipelineDesignResult {
  const pipelineId = `PLD-${Date.now()}-${Math.abs(hashCode(input.project_type)).toString(16).substring(0, 4)}`

  const designedStages: DesignedStage[] = input.stages.map((stage, idx) => ({
    name: stage.name,
    steps: stage.steps,
    parallel_group: stage.parallel ? `group-${Math.floor(idx / 2)}` : null,
    condition: stage.condition || 'always',
    timeout_minutes: stage.timeout_minutes || 30,
    order: idx + 1,
  }))

  const totalSteps = input.stages.reduce((sum, s) => sum + s.steps.length, 0)
  const parallelGroups = new Set(designedStages.map(s => s.parallel_group).filter(Boolean)).size
  const totalTimeout = designedStages.reduce((sum, s) => sum + s.timeout_minutes, 0)
  const estimatedDuration = Math.round(totalTimeout * (parallelGroups > 0 ? 0.6 : 1))

  let parallelismLevel = 'sequential'
  if (parallelGroups >= 4) parallelismLevel = 'highly_parallel'
  else if (parallelGroups >= 2) parallelismLevel = 'moderately_parallel'
  else if (parallelGroups >= 1) parallelismLevel = 'lightly_parallel'

  return {
    pipeline_id: pipelineId,
    project_type: input.project_type,
    stages: designedStages,
    triggers: input.triggers,
    env_config: input.env_config,
    total_steps: totalSteps,
    estimated_duration_min: `${estimatedDuration}m`,
    parallelism_level: parallelismLevel,
  }
}

function formatPipelineDesignReport(result: PipelineDesignResult): string {
  const lines: string[] = []

  lines.push('## Pipeline Design Report')
  lines.push('')
  lines.push(`Pipeline ID: ${result.pipeline_id} | Project: ${result.project_type}`)
  lines.push(`Total Steps: ${result.total_steps} | Estimated Duration: ${result.estimated_duration_min} | Parallelism: ${result.parallelism_level}`)
  lines.push('')

  lines.push('### Pipeline Stages')
  lines.push('| Order | Stage | Steps | Parallel Group | Condition | Timeout |')
  lines.push('|-------|-------|-------|----------------|-----------|---------|')
  for (const stage of result.stages) {
    const pGroup = stage.parallel_group || 'none'
    lines.push(`| ${stage.order} | ${stage.name} | ${stage.steps.length} | ${pGroup} | ${stage.condition} | ${stage.timeout_minutes}m |`)
  }
  lines.push('')

  lines.push('### Triggers')
  lines.push('| Type | Branches | Schedule |')
  lines.push('|------|----------|----------|')
  for (const trigger of result.triggers) {
    const branches = (trigger.branches || []).join(', ') || 'all'
    const cron = trigger.cron || 'N/A'
    lines.push(`| ${trigger.type} | ${branches} | ${cron} |`)
  }
  lines.push('')

  lines.push('### Environment')
  lines.push('| Setting | Value |')
  lines.push('|---------|-------|')
  lines.push(`| Runtime | ${result.env_config.runtime} |`)
  for (const [key, val] of Object.entries(result.env_config.variables)) lines.push(`| ${key} | ${val} |`)
  if (result.env_config.secrets && result.env_config.secrets.length > 0) lines.push(`| Secrets | ${result.env_config.secrets.join(', ')} |`)
  lines.push('')
  lines.push(`Pipeline design complete | ${result.stages.length} stages | ${result.total_steps} total steps | ${result.parallelism_level}`)

  return lines.join('\n')
}

// ==================== TOOL 2: TEST ORCHESTRATOR ====================

function orchestrateTests(input: TestOrchestratorInput): TestOrchestratorResult {
  const orchId = `ORCH-${Date.now()}-${Math.abs(hashCode(`${input.coverage_target}`)).toString(16).substring(0, 4)}`

  if (input.test_suites.length === 0) {
    return {
      orchestration_id: orchId,
      execution_plan: [],
      total_suites: 0,
      estimated_total_duration_sec: 0,
      coverage_estimate: 0,
      worker_utilization: '0%',
      critical_path: [],
    }
  }

  // Sort suites by priority and dependencies
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  const sortedSuites = [...input.test_suites].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  // Group into phases based on worker count
  const phases: TestExecutionPlan[] = []
  let currentPhase: TestSuite[] = []
  let phaseNum = 1

  for (const suite of sortedSuites) {
    currentPhase.push(suite)
    if (currentPhase.length >= input.parallel_workers) {
      phases.push({
        phase: phaseNum,
        suites: currentPhase.map(s => s.name),
        estimated_duration_sec: Math.max(...currentPhase.map(s => s.estimated_duration_sec)),
        worker_allocation: currentPhase.length,
      })
      currentPhase = []
      phaseNum++
    }
  }
  if (currentPhase.length > 0) {
    phases.push({
      phase: phaseNum,
      suites: currentPhase.map(s => s.name),
      estimated_duration_sec: Math.max(...currentPhase.map(s => s.estimated_duration_sec)),
      worker_allocation: currentPhase.length,
    })
  }

  const totalDuration = phases.reduce((sum, p) => sum + p.estimated_duration_sec, 0)

  // Coverage estimation: critical suites contribute more
  const coverageWeights: Record<string, number> = { unit: 0.35, integration: 0.25, e2e: 0.2, performance: 0.1, security: 0.1 }
  let coverageEstimate = 0
  for (const suite of sortedSuites) {
    const weight = coverageWeights[suite.type] || 0.1
    coverageEstimate += weight * input.coverage_target
  }
  coverageEstimate = clamp(coverageEstimate, 0, 100)

  // Worker utilization
  const avgWorkers = phases.reduce((sum, p) => sum + p.worker_allocation, 0) / phases.length
  const workerUtilization = `${((avgWorkers / input.parallel_workers) * 100).toFixed(0)}%`

  // Critical path: suites with critical priority or dependencies
  const criticalPath = sortedSuites
    .filter(s => s.priority === 'critical' || (s.dependencies && s.dependencies.length > 0))
    .map(s => s.name)

  return {
    orchestration_id: orchId,
    execution_plan: phases,
    total_suites: sortedSuites.length,
    estimated_total_duration_sec: totalDuration,
    coverage_estimate: Math.round(coverageEstimate),
    worker_utilization: workerUtilization,
    critical_path: criticalPath,
  }
}

function formatTestOrchestratorReport(result: TestOrchestratorResult): string {
  const lines: string[] = []

  lines.push('## Test Orchestration Plan')
  lines.push('')
  lines.push(`Orchestration ID: ${result.orchestration_id} | Suites: ${result.total_suites}`)
  lines.push(`Coverage Estimate: ${result.coverage_estimate}% | Worker Utilization: ${result.worker_utilization}`)
  lines.push(`Total Estimated Duration: ${result.estimated_total_duration_sec}s`)
  lines.push('')

  if (result.execution_plan.length > 0) {
    lines.push('### Execution Plan')
    lines.push('| Phase | Suites | Workers | Duration |')
    lines.push('|-------|--------|---------|----------|')
    for (const phase of result.execution_plan) lines.push(`| ${phase.phase} | ${phase.suites.join(', ')} | ${phase.worker_allocation} | ${phase.estimated_duration_sec}s |`)
    lines.push('')
  }
  if (result.critical_path.length > 0) {
    lines.push('### Critical Path')
    for (const item of result.critical_path) lines.push(`- ${item}`)
    lines.push('')
  }
  lines.push(`Test orchestration complete | ${result.execution_plan.length} phases | ${result.total_suites} suites`)

  return lines.join('\n')
}

// ==================== TOOL 3: DEPLOYMENT STRATEGIST ====================

function planDeployment(input: DeploymentInput): DeploymentStrategyResult {
  const strategyId = `DEP-${Date.now()}-${Math.abs(hashCode(input.strategy_type + input.app_type)).toString(16).substring(0, 4)}`

  let steps: DeploymentStep[] = []
  let riskLevel: 'low' | 'medium' | 'high' = 'medium'
  let estimatedDuration = ''

  switch (input.strategy_type) {
    case 'blue_green':
      riskLevel = 'low'
      estimatedDuration = '15-30 min'
      steps = [
        { order: 1, action: 'Provision green environment with new version', duration_estimate: '5 min', rollback_action: 'Keep blue environment running' },
        { order: 2, action: 'Run smoke tests on green environment', duration_estimate: '3 min', rollback_action: 'Redirect traffic back to blue' },
        { order: 3, action: 'Switch load balancer to green environment', duration_estimate: '2 min', rollback_action: 'Revert DNS/load balancer to blue' },
        { order: 4, action: 'Monitor green environment health for 10 min', duration_estimate: '10 min', rollback_action: 'Auto-rollback if health check fails' },
        { order: 5, action: 'Decommission blue environment', duration_estimate: '5 min', rollback_action: 'N/A - blue already preserved' },
      ]
      break
    case 'canary':
      riskLevel = 'medium'
      estimatedDuration = '30-60 min'
      steps = [
        { order: 1, action: 'Deploy canary instance (5% traffic)', duration_estimate: '5 min', rollback_action: 'Route 0% traffic to canary' },
        { order: 2, action: 'Monitor canary metrics (latency, errors, CPU)', duration_estimate: '10 min', rollback_action: 'Scale canary to 0 replicas' },
        { order: 3, action: 'Increase canary traffic to 25%', duration_estimate: '5 min', rollback_action: 'Revert to 5% traffic' },
        { order: 4, action: 'Monitor for additional 10 min', duration_estimate: '10 min', rollback_action: 'Rollback to previous version' },
        { order: 5, action: 'Increase to 50% then 100% traffic', duration_estimate: '10 min', rollback_action: 'Full rollback to stable version' },
      ]
      break
    case 'rolling':
      riskLevel = 'medium'
      estimatedDuration = '20-40 min'
      steps = [
        { order: 1, action: 'Mark first instance as unschedulable', duration_estimate: '2 min', rollback_action: 'Restore instance scheduling' },
        { order: 2, action: 'Deploy new version to first instance', duration_estimate: '5 min', rollback_action: 'Revert instance to previous version' },
        { order: 3, action: 'Verify instance health before proceeding', duration_estimate: '3 min', rollback_action: 'Stop rolling update' },
        { order: 4, action: 'Repeat for remaining instances one by one', duration_estimate: '15 min', rollback_action: 'Reverse rolling update order' },
        { order: 5, action: 'Verify all instances on new version', duration_estimate: '5 min', rollback_action: 'Full rollback initiated' },
      ]
      break
    case 'recreate':
      riskLevel = 'high'
      estimatedDuration = '5-15 min'
      steps = [
        { order: 1, action: 'Scale down all existing instances', duration_estimate: '2 min', rollback_action: 'Emergency scale up' },
        { order: 2, action: 'Deploy new version to all instances', duration_estimate: '5 min', rollback_action: 'Switch image to previous version' },
        { order: 3, action: 'Scale up new instances', duration_estimate: '3 min', rollback_action: 'Scale down new, scale up old' },
        { order: 4, action: 'Verify deployment health', duration_estimate: '5 min', rollback_action: 'Full rollback to previous version' },
      ]
      break
  }

  const rollbackPlan: RollbackPlan = {
    trigger_condition: input.strategy_type === 'blue_green'
      ? 'Health check failure on green environment'
      : input.strategy_type === 'canary'
      ? 'Error rate > 1% or latency > 2x on canary'
      : 'Health check failure on any updated instance',
    steps: [
      'Identify last known good version',
      'Execute strategy-specific rollback (steps above)',
      'Verify rollback success with smoke tests',
      'Notify stakeholders of rollback',
      'Create post-mortem incident record',
    ],
    estimated_rollback_time: input.strategy_type === 'blue_green' ? '2-5 min' : input.strategy_type === 'recreate' ? '3-8 min' : '5-10 min',
    data_preservation: input.strategy_type === 'blue_green' ? 'Blue environment unchanged until green confirmed' : 'Database snapshots taken before each traffic shift',
  }

  return {
    strategy_id: strategyId,
    strategy_type: input.strategy_type,
    app_type: input.app_type,
    target_env: input.target_env,
    deployment_steps: steps,
    rollback_plan: rollbackPlan,
    risk_level: riskLevel,
    estimated_total_duration: estimatedDuration,
  }
}

function formatDeploymentStrategyReport(result: DeploymentStrategyResult): string {
  const lines: string[] = []
  const riskIcon = result.risk_level === 'high' ? '[HIGH RISK]' : result.risk_level === 'medium' ? '[MEDIUM RISK]' : '[LOW RISK]'

  lines.push('## Deployment Strategy Plan')
  lines.push('')
  lines.push(`Strategy ID: ${result.strategy_id} | Type: ${result.strategy_type.toUpperCase()} | App: ${result.app_type}`)
  lines.push(`Target: ${result.target_env} | Risk: ${riskIcon} | Duration: ${result.estimated_total_duration}`)
  lines.push('')

  lines.push('### Deployment Steps')
  lines.push('| # | Action | Duration | Rollback Action |')
  lines.push('|---|--------|----------|-----------------|')
  for (const step of result.deployment_steps) {
    lines.push(`| ${step.order} | ${step.action} | ${step.duration_estimate} | ${step.rollback_action} |`)
  }
  lines.push('')

  lines.push('### Rollback Plan')
  lines.push(`Trigger: ${result.rollback_plan.trigger_condition} | Time: ${result.rollback_plan.estimated_rollback_time}`)
  lines.push(`Data Preservation: ${result.rollback_plan.data_preservation}`)
  lines.push('')
  for (const step of result.rollback_plan.steps) lines.push(`- ${step}`)
  lines.push('')
  lines.push(`Deployment plan complete | ${result.deployment_steps.length} steps | Risk: ${result.risk_level} | Rollback ready`)

  return lines.join('\n')
}

// ==================== TOOL 4: BUILD OPTIMIZER ====================

function optimizeBuild(input: BuildOptimizerInput): BuildOptimizerResult {
  const optId = `BOPT-${Date.now()}-${Math.abs(hashCode(`${input.dependencies.length}`)).toString(16).substring(0, 4)}`

  if (input.build_history.length === 0) {
    return {
      optimization_id: optId,
      current_avg_duration_sec: 0,
      optimized_avg_duration_sec: 0,
      improvement_percentage: 0,
      recommendations: [],
      cache_strategy: 'none',
      dependency_optimizations: [],
    }
  }

  // Calculate current metrics
  const avgDuration = input.build_history.reduce((s, h) => s + h.duration_sec, 0) / input.build_history.length
  const cacheHitRate = input.build_history.filter(h => h.cache_hit).length / input.build_history.length
  const avgDependencies = input.build_history.reduce((s, h) => s + h.dependencies_count, 0) / input.build_history.length

  // Generate recommendations
  const recommendations: OptimizationRecommendation[] = []

  if (!input.cache_config.enabled) {
    recommendations.push({
      area: 'Cache',
      current_value: 'Disabled',
      recommended_value: 'Enable with hybrid strategy',
      estimated_improvement: '40-60% faster builds',
      priority: 'high',
    })
  } else if (cacheHitRate < 0.5) {
    recommendations.push({
      area: 'Cache Hit Rate',
      current_value: `${(cacheHitRate * 100).toFixed(0)}%`,
      recommended_value: '>80% hit rate',
      estimated_improvement: '30-50% faster builds',
      priority: 'high',
    })
  }

  if (input.cache_config.strategy === 'local') {
    recommendations.push({
      area: 'Cache Strategy',
      current_value: 'Local only',
      recommended_value: 'Hybrid (local + remote)',
      estimated_improvement: '20-30% faster CI builds',
      priority: 'medium',
    })
  }

  if (avgDependencies > 50) {
    recommendations.push({
      area: 'Dependency Count',
      current_value: `${avgDependencies.toFixed(0)} deps`,
      recommended_value: 'Tree-shaking + lazy loading',
      estimated_improvement: '15-25% faster installs',
      priority: 'medium',
    })
  }

  if (input.build_history.some(h => h.duration_sec > avgDuration * 2)) {
    recommendations.push({
      area: 'Outlier Builds',
      current_value: `Max ${Math.max(...input.build_history.map(h => h.duration_sec))}s`,
      recommended_value: 'Investigate and fix outlier builds',
      estimated_improvement: 'Reduce P95 by 40%',
      priority: 'high',
    })
  }

  recommendations.push({
    area: 'Build Parallelization',
    current_value: 'Sequential steps',
    recommended_value: 'Parallel independent steps',
    estimated_improvement: '20-35% wall time reduction',
    priority: 'medium',
  })

  // Calculate optimized duration
  let improvementFactor = 0
  for (const rec of recommendations) {
    if (rec.estimated_improvement.includes('40-60%')) improvementFactor += 0.25
    else if (rec.estimated_improvement.includes('30-50%')) improvementFactor += 0.2
    else if (rec.estimated_improvement.includes('20-35%')) improvementFactor += 0.15
    else if (rec.estimated_improvement.includes('20-30%')) improvementFactor += 0.12
    else if (rec.estimated_improvement.includes('15-25%')) improvementFactor += 0.1
    else improvementFactor += 0.15
  }
  improvementFactor = clamp(improvementFactor, 0.05, 0.7)

  const optimizedDuration = Math.round(avgDuration * (1 - improvementFactor))
  const improvementPercentage = Math.round(((avgDuration - optimizedDuration) / avgDuration) * 100)

  // Cache strategy recommendation
  const cacheStrategy = !input.cache_config.enabled
    ? 'Enable hybrid cache with remote artifact storage and local node_modules caching'
    : input.cache_config.strategy === 'local'
    ? 'Upgrade to hybrid: add remote cache for CI environments'
    : 'Current hybrid strategy is optimal; focus on cache key precision'

  // Dependency optimizations
  const depOpts: string[] = []
  if (input.dependencies.length > 30) {
    depOpts.push(`Remove or consolidate ${Math.floor(input.dependencies.length * 0.2)} low-usage dependencies`)
  }
  depOpts.push('Pin dependency versions to prevent unpredictable rebuilds')
  depOpts.push('Use lockfile caching to avoid redundant resolution')
  if (input.dependencies.some(d => d.includes('@types'))) {
    depOpts.push('Move @types packages to devDependencies if not needed at runtime')
  }

  return {
    optimization_id: optId,
    current_avg_duration_sec: Math.round(avgDuration),
    optimized_avg_duration_sec: optimizedDuration,
    improvement_percentage: improvementPercentage,
    recommendations: recommendations.sort((a, b) => {
      const prioOrder = { high: 0, medium: 1, low: 2 }
      return prioOrder[a.priority] - prioOrder[b.priority]
    }),
    cache_strategy: cacheStrategy,
    dependency_optimizations: depOpts,
  }
}

function formatBuildOptimizerReport(result: BuildOptimizerResult): string {
  const lines: string[] = []

  lines.push('## Build Optimization Report')
  lines.push('')
  lines.push(`Optimization ID: ${result.optimization_id}`)
  lines.push(`Current Avg Duration: ${result.current_avg_duration_sec}s | Optimized: ${result.optimized_avg_duration_sec}s | Improvement: ${result.improvement_percentage}%`)
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    lines.push('| Priority | Area | Current | Recommended | Improvement |')
    lines.push('|----------|------|---------|-------------|-------------|')
    for (const rec of result.recommendations) {
      const prioTag = rec.priority === 'high' ? 'HIGH' : rec.priority === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${prioTag} | ${rec.area} | ${rec.current_value} | ${rec.recommended_value} | ${rec.estimated_improvement} |`)
    }
    lines.push('')
  }

  lines.push('### Cache Strategy')
  lines.push(result.cache_strategy)
  lines.push('')

  if (result.dependency_optimizations.length > 0) {
    lines.push('### Dependency Optimizations')
    for (const opt of result.dependency_optimizations) lines.push(`- ${opt}`)
    lines.push('')
  }
  lines.push(`Build optimization complete | ${result.improvement_percentage}% improvement | ${result.recommendations.length} recommendations`)

  return lines.join('\n')
}

// ==================== TOOL 5: RELEASE MANAGER ====================

function manageRelease(currentVersion: string, input: ReleaseManagerInput): ReleaseManagerResult {
  const releaseId = `REL-${Date.now()}-${Math.abs(hashCode(currentVersion)).toString(16).substring(0, 4)}`

  // Determine version bump
  let [major, minor, patch] = currentVersion.replace(/^v/, '').split('.').map(Number)
  const hasBreaking = input.changes.some(c => c.type === 'breaking')
  const hasFeature = input.changes.some(c => c.type === 'feature')
  const hasBugfix = input.changes.some(c => c.type === 'bugfix')

  if (hasBreaking && input.semver_rules.auto_breaking) {
    major++
    minor = 0
    patch = 0
  } else if (hasFeature && input.semver_rules.auto_feature) {
    minor++
    patch = 0
  } else if (hasBugfix && input.semver_rules.auto_bugfix) {
    patch++
  } else if (hasFeature) {
    minor++
    patch = 0
  } else if (hasBugfix) {
    patch++
  }

  const prefix = input.semver_rules.prefix || ''
  const newVersion = `${prefix}${major}.${minor}.${patch}`
  const totalChanges = input.changes.length

  // Generate changelog
  const changelogLines: string[] = []
  if (input.changelog_format === 'conventional') {
    changelogLines.push(`# [${newVersion}] - ${new Date().toISOString().split('T')[0]}`)
    changelogLines.push('')
    const grouped: Record<string, string[]> = {}
    for (const change of input.changes) {
      const typeLabel = change.type === 'feature' ? 'Features' :
        change.type === 'bugfix' ? 'Bug Fixes' :
        change.type === 'breaking' ? 'Breaking Changes' :
        change.type === 'perf' ? 'Performance' :
        change.type === 'docs' ? 'Documentation' : 'Refactoring'
      if (!grouped[typeLabel]) grouped[typeLabel] = []
      grouped[typeLabel].push(`${change.description} (${change.scope})${change.ticket_ref ? ` [${change.ticket_ref}]` : ''}`)
    }
    for (const [type, items] of Object.entries(grouped)) {
      changelogLines.push(`## ${type}`)
      for (const item of items) {
        changelogLines.push(`- ${item}`)
      }
      changelogLines.push('')
    }
  } else if (input.changelog_format === 'json') {
    const changelogObj = { version: newVersion, date: new Date().toISOString().split('T')[0], changes: input.changes }
    changelogLines.push(JSON.stringify(changelogObj, null, 2))
  } else {
    changelogLines.push(`# ${newVersion}`)
    changelogLines.push('')
    changelogLines.push(`Released: ${new Date().toISOString().split('T')[0]}`)
    changelogLines.push('')
    for (const change of input.changes) {
      changelogLines.push(`- [${change.type.toUpperCase()}] ${change.description} (${change.scope})${change.ticket_ref ? ` ${change.ticket_ref}` : ''}`)
    }
  }

  const breakingChanges = input.changes.filter(c => c.type === 'breaking').map(c => c.description)

  // Release checklist
  const checklist: ReleaseChecklist[] = [
    {
      category: 'Pre-Release',
      items: [
        'All tests pass in CI',
        'No critical or high-severity bugs open',
        'Documentation updated',
        'Changelog reviewed and approved',
      ],
      required: true,
    },
    {
      category: 'Release',
      items: [
        'Tag release commit',
        'Build and push container image',
        'Deploy to staging environment',
        'Run smoke tests on staging',
      ],
      required: true,
    },
    {
      category: 'Post-Release',
      items: [
        'Deploy to production',
        'Monitor error rates for 30 min',
        'Announce release in #releases channel',
        'Update deployment tracking',
      ],
      required: breakingChanges.length > 0,
    },
  ]

  return {
    release_id: releaseId,
    new_version: newVersion,
    previous_version: currentVersion,
    changelog: changelogLines.join('\n'),
    checklist,
    breaking_changes: breakingChanges,
    total_changes: totalChanges,
  }
}

function formatReleaseManagerReport(result: ReleaseManagerResult): string {
  const lines: string[] = []

  lines.push('## Release Management Report')
  lines.push('')
  lines.push(`Release ID: ${result.release_id} | Version: ${result.previous_version} -> ${result.new_version}`)
  lines.push(`Total Changes: ${result.total_changes} | Breaking: ${result.breaking_changes.length}`)
  lines.push('')

  lines.push('### Version Bump')
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push(`| Previous | ${result.previous_version} |`)
  lines.push(`| New | ${result.new_version} |`)
  lines.push(`| Breaking | ${result.breaking_changes.length} |`)
  lines.push('')
  if (result.breaking_changes.length > 0) {
    lines.push('### Breaking Changes')
    for (const bc of result.breaking_changes) lines.push(`- ${bc}`)
    lines.push('')
  }
  lines.push('### Changelog')
  lines.push(result.changelog)
  lines.push('')
  lines.push('### Release Checklist')
  for (const cat of result.checklist) {
    lines.push(`#### ${cat.category} ${cat.required ? '(Required)' : '(Optional)'}`)
    for (const item of cat.items) lines.push(`- [ ] ${item}`)
    lines.push('')
  }
  lines.push(`Release management complete | ${result.new_version} ready | ${result.breaking_changes.length} breaking changes`)

  return lines.join('\n')
}

// ==================== TOOL 6: PIPELINE ANALYZER ====================

function analyzePipeline(input: PipelineAnalyzerInput): PipelineAnalyzerResult {
  const analysisId = `PANL-${Date.now()}-${Math.abs(hashCode(input.metrics_window)).toString(16).substring(0, 4)}`

  if (input.pipeline_runs.length === 0) {
    return {
      analysis_id: analysisId,
      metrics_window: input.metrics_window,
      total_runs: 0,
      success_rate: 0,
      avg_duration_sec: 0,
      bottlenecks: [],
      trends: [],
      improvement_recommendations: ['No pipeline run data available for analysis'],
    }
  }

  const totalRuns = input.pipeline_runs.length
  const successRuns = input.pipeline_runs.filter(r => r.status === 'success').length
  const successRate = (successRuns / totalRuns) * 100
  const avgDuration = input.pipeline_runs.reduce((s, r) => s + r.duration_sec, 0) / totalRuns

  // Identify bottlenecks by stage
  const stageStats = new Map<string, { total: number; failed: number; totalDuration: number }>()
  for (const run of input.pipeline_runs) {
    const stage = run.stage || 'unknown'
    const stats = stageStats.get(stage) || { total: 0, failed: 0, totalDuration: 0 }
    stats.total++
    if (run.status === 'failed') stats.failed++
    stats.totalDuration += run.duration_sec
    stageStats.set(stage, stats)
  }

  const bottlenecks: BottleneckInfo[] = []
  for (const [stage, stats] of stageStats.entries()) {
    const failureRate = stats.failed / stats.total
    const avgStageDuration = stats.totalDuration / stats.total
    if (failureRate > 0.2 || avgStageDuration > avgDuration * 0.4) {
      let severity: 'critical' | 'high' | 'medium' | 'low' = 'low'
      if (failureRate > 0.5) severity = 'critical'
      else if (failureRate > 0.3) severity = 'high'
      else if (failureRate > 0.2 || avgStageDuration > avgDuration * 0.5) severity = 'medium'

      bottlenecks.push({
        stage,
        avg_duration_sec: Math.round(avgStageDuration),
        failure_rate: Math.round(failureRate * 100),
        severity,
      })
    }
  }
  bottlenecks.sort((a, b) => {
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return sevOrder[a.severity] - sevOrder[b.severity]
  })

  // Trends detection
  const trends: string[] = []
  const recentRuns = input.pipeline_runs.slice(-Math.min(10, totalRuns))
  const recentSuccess = recentRuns.filter(r => r.status === 'success').length / recentRuns.length
  if (recentSuccess < successRate / 100) {
    trends.push(`Recent success rate (${(recentSuccess * 100).toFixed(0)}%) declining vs overall (${successRate.toFixed(0)}%)`)
  } else if (recentSuccess > successRate / 100) {
    trends.push(`Recent success rate (${(recentSuccess * 100).toFixed(0)}%) improving vs overall (${successRate.toFixed(0)}%)`)
  }

  const recentAvgDuration = recentRuns.reduce((s, r) => s + r.duration_sec, 0) / recentRuns.length
  if (recentAvgDuration > avgDuration * 1.3) {
    trends.push(`Build duration trending upward: recent avg ${recentAvgDuration.toFixed(0)}s vs overall ${avgDuration.toFixed(0)}s`)
  } else if (recentAvgDuration < avgDuration * 0.8) {
    trends.push(`Build duration trending downward: recent avg ${recentAvgDuration.toFixed(0)}s vs overall ${avgDuration.toFixed(0)}s`)
  }

  const failedRuns = input.pipeline_runs.filter(r => r.status === 'failed')
  if (failedRuns.length > 3) {
    const errorTypes = new Map<string, number>()
    for (const run of failedRuns) {
      const error = run.error_message || 'unknown'
      errorTypes.set(error, (errorTypes.get(error) || 0) + 1)
    }
    const topError = Array.from(errorTypes.entries()).sort((a, b) => b[1] - a[1])[0]
    if (topError && topError[1] > 2) {
      trends.push(`Recurring failure pattern: "${topError[0]}" occurs ${topError[1]} times`)
    }
  }

  // Improvement recommendations
  const recommendations: string[] = []
  if (bottlenecks.length > 0) {
    for (const bn of bottlenecks.filter(b => b.severity === 'critical' || b.severity === 'high')) {
      recommendations.push(`Optimize stage "${bn.stage}": ${(bn.failure_rate)}% failure rate, ${bn.avg_duration_sec}s avg`)
    }
  }
  if (successRate < 90) {
    recommendations.push(`Overall success rate ${successRate.toFixed(0)}% below 90% target — investigate top failure causes`)
  }
  if (avgDuration > 600) {
    recommendations.push(`Average build time ${avgDuration.toFixed(0)}s exceeds 10min — consider build parallelization`)
  }
  const timeoutRuns = input.pipeline_runs.filter(r => r.status === 'timeout').length
  if (timeoutRuns > 0) {
    recommendations.push(`${timeoutRuns} timeout(s) detected — increase stage timeout or optimize slow steps`)
  }
  recommendations.push('Implement build caching to reduce average duration')
  recommendations.push('Set up Slack/email alerts for consecutive failures')
  recommendations.push('Add automated retry for transient failures')

  return {
    analysis_id: analysisId,
    metrics_window: input.metrics_window,
    total_runs: totalRuns,
    success_rate: Math.round(successRate),
    avg_duration_sec: Math.round(avgDuration),
    bottlenecks,
    trends,
    improvement_recommendations: recommendations,
  }
}

function formatPipelineAnalyzerReport(result: PipelineAnalyzerResult): string {
  const lines: string[] = []
  const healthIcon = result.success_rate >= 95 ? 'HEALTHY' : result.success_rate >= 80 ? 'DEGRADED' : 'CRITICAL'

  lines.push('## Pipeline Analysis Report')
  lines.push('')
  lines.push(`Analysis ID: ${result.analysis_id} | Window: ${result.metrics_window}`)
  lines.push(`Overall Health: ${healthIcon} | Success Rate: ${result.success_rate}% | Avg Duration: ${result.avg_duration_sec}s`)
  lines.push(`Total Runs: ${result.total_runs}`)
  lines.push('')

  if (result.bottlenecks.length > 0) {
    lines.push('### Bottlenecks')
    lines.push('| Stage | Avg Duration | Failure Rate | Severity |')
    lines.push('|-------|-------------|--------------|----------|')
    for (const bn of result.bottlenecks) {
      const sevTag = bn.severity === 'critical' ? 'CRITICAL' : bn.severity === 'high' ? 'HIGH' : bn.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${bn.stage} | ${bn.avg_duration_sec}s | ${bn.failure_rate}% | ${sevTag} |`)
    }
    lines.push('')
  }
  if (result.trends.length > 0) {
    lines.push('### Trends')
    for (const trend of result.trends) lines.push(`- ${trend}`)
    lines.push('')
  }
  if (result.improvement_recommendations.length > 0) {
    lines.push('### Recommendations')
    let idx = 1
    for (const rec of result.improvement_recommendations) lines.push(`${idx++}. ${rec}`)
  }
  lines.push('')
  lines.push(`Pipeline analysis complete | Health: ${healthIcon} | ${result.bottlenecks.length} bottlenecks found`)

  return lines.join('\n')
}

// ==================== TOOL 7: ENVIRONMENT MANAGER ====================

function manageEnvironments(input: EnvironmentManagerInput): EnvironmentManagerResult {
  const analysisId = `ENV-${Date.now()}-${Math.abs(hashCode(`${input.env_configs.length}`)).toString(16).substring(0, 4)}`

  // Find config drifts across environments
  const drifts: ConfigDrift[] = []
  if (input.env_configs.length >= 2) {
    const allVars = new Set<string>()
    for (const env of input.env_configs) {
      for (const key of Object.keys(env.variables)) {
        allVars.add(key)
      }
    }

    for (const varName of allVars) {
      const values: Record<string, string> = {}
      const envsWithVar: string[] = []
      for (const env of input.env_configs) {
        if (varName in env.variables) {
          values[env.name] = env.variables[varName]
          envsWithVar.push(env.name)
        }
      }

      const uniqueValues = new Set(Object.values(values))
      if (uniqueValues.size > 1) {
        const uniqueEnvNames = Object.keys(values)
        const expectedValue = values[input.env_configs[0].name] || ''
        drifts.push({
          variable: varName,
          environments: envsWithVar,
          expected_value: expectedValue,
          actual_values: values,
          severity: varName.toLowerCase().includes('secret') || varName.toLowerCase().includes('password') ? 'critical' : 'warning',
        })
      }
    }
  }

  // Missing secrets check
  const declaredSecrets = new Set<string>()
  for (const env of input.env_configs) {
    for (const key of Object.keys(env.variables)) {
      if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
        declaredSecrets.add(key)
      }
    }
  }
  const missingSecrets = input.secrets_required.filter(s => !declaredSecrets.has(s))

  // Resource limit violations
  const resourceViolations: string[] = []
  for (const env of input.env_configs) {
    for (const [resource, limit] of Object.entries(input.resource_limits)) {
      const envValue = env.resources[resource]
      if (envValue) {
        const numLimit = parseFloat(limit)
        const numValue = parseFloat(envValue)
        if (!isNaN(numLimit) && !isNaN(numValue) && numValue > numLimit) {
          resourceViolations.push(`${env.name}: ${resource} = ${envValue} exceeds limit ${limit}`)
        }
      }
    }
  }

  // Recommendations
  const recommendations: string[] = []
  if (drifts.length > 0) {
    recommendations.push(`${drifts.length} config drift(s) detected — standardize environment variables across all environments`)
  }
  if (missingSecrets.length > 0) {
    recommendations.push(`Add missing secrets: ${missingSecrets.join(', ')}`)
  }
  if (resourceViolations.length > 0) {
    recommendations.push(`${resourceViolations.length} resource limit violation(s) — review and adjust resource allocations`)
  }
  recommendations.push('Use infrastructure-as-code (Terraform/Pulumi) to prevent configuration drift')
  recommendations.push('Implement automated environment parity checks in CI pipeline')
  recommendations.push('Set up secrets rotation policy for all sensitive credentials')
  recommendations.push('Use environment-specific config maps instead of hardcoded values')

  // Overall health
  let overallHealth: 'healthy' | 'degraded' | 'critical' = 'healthy'
  if (drifts.some(d => d.severity === 'critical') || missingSecrets.length > 0) overallHealth = 'critical'
  else if (drifts.length > 0 || resourceViolations.length > 0) overallHealth = 'degraded'

  return {
    analysis_id: analysisId,
    environments_analyzed: input.env_configs.length,
    config_drifts: drifts,
    missing_secrets: missingSecrets,
    resource_violations: resourceViolations,
    recommendations,
    overall_health: overallHealth,
  }
}

function formatEnvironmentManagerReport(result: EnvironmentManagerResult): string {
  const lines: string[] = []
  const healthIcon = result.overall_health === 'healthy' ? 'HEALTHY' : result.overall_health === 'degraded' ? 'DEGRADED' : 'CRITICAL'

  lines.push('## Environment Management Report')
  lines.push('')
  lines.push(`Analysis ID: ${result.analysis_id} | Environments: ${result.environments_analyzed}`)
  lines.push(`Overall Health: ${healthIcon}`)
  lines.push('')

  if (result.config_drifts.length > 0) {
    lines.push('### Configuration Drifts')
    lines.push('| Variable | Environments | Expected | Actual Values | Severity |')
    lines.push('|----------|-------------|----------|---------------|----------|')
    for (const drift of result.config_drifts) {
      const sevTag = drift.severity === 'critical' ? 'CRITICAL' : drift.severity === 'warning' ? 'WARNING' : 'INFO'
      const actualStr = Object.entries(drift.actual_values).map(([k, v]) => `${k}: ${v}`).join('; ')
      lines.push(`| ${drift.variable} | ${drift.environments.join(', ')} | ${drift.expected_value} | ${actualStr} | ${sevTag} |`)
    }
    lines.push('')
  }

  if (result.missing_secrets.length > 0) {
    lines.push('### Missing Secrets')
    for (const secret of result.missing_secrets) lines.push(`- ${secret}`)
    lines.push('')
  }
  if (result.resource_violations.length > 0) {
    lines.push('### Resource Violations')
    for (const violation of result.resource_violations) lines.push(`- ${violation}`)
    lines.push('')
  }
  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const rec of result.recommendations) lines.push(`- ${rec}`)
  }
  lines.push('')
  lines.push(`Environment analysis complete | Health: ${healthIcon} | ${result.config_drifts.length} drifts | ${result.missing_secrets.length} missing secrets`)

  return lines.join('\n')
}

// ==================== TOOL 8: ROLLBACK PLANNER ====================

function planRollback(input: RollbackPlannerInput): RollbackPlannerResult {
  const planId = `RB-${Date.now()}-${Math.abs(hashCode(input.current_state.version + input.target_version)).toString(16).substring(0, 4)}`

  const steps: RollbackStep[] = []
  let order = 1

  // Step 1: Pre-rollback backup
  steps.push({
    order: order++,
    action: 'Create full database snapshot before rollback',
    verification: 'Snapshot completed and verified restorable',
    estimated_duration: '5-10 min',
    reversible: true,
  })

  // Step 2: Drain connections
  if (input.current_state.active_connections > 0) {
    steps.push({
      order: order++,
      action: `Drain ${input.current_state.active_connections} active connections`,
      verification: 'Active connection count reaches zero',
      estimated_duration: '2-5 min',
      reversible: false,
    })
  }

  // Step 3: Config rollback
  if (input.current_state.config_version !== input.target_version) {
    steps.push({
      order: order++,
      action: `Revert configuration from ${input.current_state.config_version} to target baseline`,
      verification: 'Configuration checksum matches target version',
      estimated_duration: '1-3 min',
      reversible: true,
    })
  }

  // Step 4: Feature flags disable
  if (input.current_state.active_features.length > 0) {
    steps.push({
      order: order++,
      action: `Disable features: ${input.current_state.active_features.join(', ')}`,
      verification: 'All target features confirmed disabled',
      estimated_duration: '1-2 min',
      reversible: true,
    })
  }

  // Step 5: Application rollback
  steps.push({
    order: order++,
    action: `Deploy target version ${input.target_version} to all instances`,
    verification: 'All instances report version === target_version',
    estimated_duration: '5-15 min',
    reversible: true,
  })

  // Step 6: Data migration rollback (if needed)
  if (input.data_migration_needed) {
    steps.push({
      order: order++,
      action: 'Execute reverse data migration to restore previous schema',
      verification: 'Schema version matches target, data integrity verified',
      estimated_duration: '10-30 min',
      reversible: false,
    })
  }

  // Step 7: Final verification
  steps.push({
    order: order++,
    action: 'Run full smoke test suite on rolled-back version',
    verification: 'All smoke tests pass (>95% success)',
    estimated_duration: '3-5 min',
    reversible: true,
  })

  // Verification points
  const verificationPoints = [
    'Database snapshot created and restorable test passed',
    'All application instances running target version',
    'Health check endpoints returning 200 OK',
    'Error rate below 0.1% for 5 consecutive minutes',
    'Key user journeys functioning correctly',
    'Configuration values match target version baseline',
  ]

  // Data backup strategy
  const dataBackupStrategy = input.data_migration_needed
    ? 'Full database snapshot + incremental backup every 5 min during rollback + schema version pinning'
    : 'Full database snapshot before rollback + WAL archiving during rollback'

  // Total duration estimation
  const minEstimate = input.data_migration_needed ? 27 : 17
  const maxEstimate = input.data_migration_needed ? 65 : 40

  // Risk assessment
  let riskAssessment: string
  if (input.data_migration_needed && input.current_state.active_connections > 100) {
    riskAssessment = 'HIGH: Data migration rollback with high active connections requires careful coordination. Recommend off-hours execution.'
  } else if (input.data_migration_needed) {
    riskAssessment = 'MEDIUM: Data migration rollback requires schema compatibility. Ensure reverse migration scripts are tested.'
  } else if (input.current_state.active_connections > 50) {
    riskAssessment = 'MEDIUM: Significant active user base. Graceful connection draining recommended to prevent user disruption.'
  } else {
    riskAssessment = 'LOW: Standard rollback with minimal risk. Standard monitoring procedures sufficient.'
  }

  return {
    plan_id: planId,
    from_version: input.current_state.version,
    to_version: input.target_version,
    steps,
    verification_points: verificationPoints,
    data_backup_strategy: dataBackupStrategy,
    estimated_total_duration: `${minEstimate}-${maxEstimate} min`,
    risk_assessment: riskAssessment,
  }
}

function formatRollbackPlannerReport(result: RollbackPlannerResult): string {
  const lines: string[] = []

  lines.push('## Rollback Plan')
  lines.push('')
  lines.push(`Plan ID: ${result.plan_id} | ${result.from_version} -> ${result.to_version}`)
  lines.push(`Estimated Duration: ${result.estimated_total_duration} | Risk: ${result.risk_assessment}`)
  lines.push('')

  lines.push('### Rollback Steps')
  lines.push('| # | Action | Verification | Duration | Reversible |')
  lines.push('|---|--------|-------------|----------|------------|')
  for (const step of result.steps) {
    const revTag = step.reversible ? 'YES' : 'NO'
    lines.push(`| ${step.order} | ${step.action} | ${step.verification} | ${step.estimated_duration} | ${revTag} |`)
  }
  lines.push('')

  lines.push('### Verification Points')
  for (const vp of result.verification_points) lines.push(`- ${vp}`)
  lines.push('')
  lines.push('### Data Backup Strategy')
  lines.push(result.data_backup_strategy)
  lines.push('')
  lines.push('### Risk Assessment')
  lines.push(result.risk_assessment)
  lines.push('')
  lines.push(`Rollback plan complete | ${result.steps.length} steps | Duration: ${result.estimated_total_duration}`)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'pipeline_designer',
    description: 'Design CI/CD pipelines with stages, parallel groups, triggers, env config, and duration estimates.',
    parameters: { pipeline_input: { type: 'string', required: true, description: 'JSON: project_type, stages[{name, steps[], parallel?, condition?, timeout_minutes?}], triggers[{type, branches?, cron?}], env_config{runtime, variables{}, secrets?}' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { pipeline_input: string }) {
      const input: PipelineDesignInput = JSON.parse(args.pipeline_input)
      return formatPipelineDesignReport(designPipeline(input))
    }
  }))

  tools.register(defineTool({
    name: 'test_orchestrator',
    description: 'Orchestrate tests with parallel workers, priority ordering, coverage estimation, and critical path.',
    parameters: { orchestration_input: { type: 'string', required: true, description: 'JSON: test_suites[{name, type, estimated_duration_sec, priority, dependencies?}], coverage_target (0-100), parallel_workers (int)' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { orchestration_input: string }) {
      const input: TestOrchestratorInput = JSON.parse(args.orchestration_input)
      return formatTestOrchestratorReport(orchestrateTests(input))
    }
  }))

  tools.register(defineTool({
    name: 'deployment_strategist',
    description: 'Generate deployment plans (blue-green, canary, rolling, recreate) with rollback procedures and risk assessment.',
    parameters: { deployment_input: { type: 'string', required: true, description: 'JSON: app_type, current_version, target_env, strategy_type (blue_green|canary|rolling|recreate)' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { deployment_input: string }) {
      const input: DeploymentInput = JSON.parse(args.deployment_input)
      return formatDeploymentStrategyReport(planDeployment(input))
    }
  }))

  tools.register(defineTool({
    name: 'build_optimizer',
    description: 'Analyze build history for cache, dependency, and parallelization optimizations with improvement estimates.',
    parameters: { build_input: { type: 'string', required: true, description: 'JSON: build_history[{timestamp, duration_sec, cache_hit, dependencies_count}], cache_config{enabled, strategy, ttl_hours, paths?}, dependencies[]' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { build_input: string }) {
      const input: BuildOptimizerInput = JSON.parse(args.build_input)
      return formatBuildOptimizerReport(optimizeBuild(input))
    }
  }))

  tools.register(defineTool({
    name: 'release_manager',
    description: 'Manage release lifecycle with semantic versioning, changelog generation, and release checklists. Supports conventional commits format, auto-version bumping, and breaking change detection.',
    parameters: {
      current_version: { type: 'string', required: true, description: 'Current version string (e.g., "1.2.3")' },
      release_input: { type: 'string', required: true, description: 'JSON object: changes[{type, description, scope, ticket_ref?}], semver_rules{auto_breaking, auto_feature, auto_bugfix, prefix?}, changelog_format (markdown|json|conventional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { current_version: string; release_input: string }) {
      const input: ReleaseManagerInput = JSON.parse(args.release_input)
      const result = manageRelease(args.current_version, input)
      return formatReleaseManagerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'pipeline_analyzer',
    description: 'Analyze pipeline run metrics to identify bottlenecks, detect trends, and generate improvement recommendations. Provides success rate, duration stats, and health assessment.',
    parameters: {
      analysis_input: { type: 'string', required: true, description: 'JSON object: pipeline_runs[{run_id, status, duration_sec, stage?, timestamp, error_message?}], metrics_window (e.g., "7d", "30d")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { analysis_input: string }) {
      const input: PipelineAnalyzerInput = JSON.parse(args.analysis_input)
      const result = analyzePipeline(input)
      return formatPipelineAnalyzerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'environment_manager',
    description: 'Analyze environment configurations for drift detection, missing secrets, and resource violations. Provides parity recommendations and overall health assessment across environments.',
    parameters: {
      env_input: { type: 'string', required: true, description: 'JSON object: env_configs[{name, region, variables{}, resources{}}], secrets_required[], resource_limits{}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { env_input: string }) {
      const input: EnvironmentManagerInput = JSON.parse(args.env_input)
      const result = manageEnvironments(input)
      return formatEnvironmentManagerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'rollback_planner',
    description: 'Generate detailed rollback plans with step-by-step procedures, verification points, data backup strategies, and risk assessment. Handles application, configuration, and data migration rollbacks.',
    parameters: {
      rollback_input: { type: 'string', required: true, description: 'JSON object: current_state{version, database_version, config_version, active_features[], active_connections}, target_version, data_migration_needed (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { rollback_input: string }) {
      const input: RollbackPlannerInput = JSON.parse(args.rollback_input)
      const result = planRollback(input)
      return formatRollbackPlannerReport(result)
    }
  }))

  console.log(`[dsh-tool-cicdpipe] Loaded v${VERSION} - CI/CD Pipeline Agent with 8 tools`)
  console.log('  Tools: pipeline_designer, test_orchestrator, deployment_strategist, build_optimizer, release_manager, pipeline_analyzer, environment_manager, rollback_planner')
}
