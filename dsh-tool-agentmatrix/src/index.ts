/**
 * dsh-tool-agentmatrix - Multi-Agent Collaboration Matrix for DSH
 *
 * Dynamic role assignment, task orchestration, capability matching, progress visualization.
 * Evolved from ECC's 61-agent collaboration pattern with advanced capabilities.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Collaboration patterns */
type CollabPattern = 'hierarchical' | 'peer' | 'pipeline' | 'swarm'

/** Agent capability level */
type CapLevel = 'novice' | 'intermediate' | 'expert' | 'master'

/** Task priority */
type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

/** Task status */
type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'blocked' | 'completed' | 'failed'

/** Input for agent_role_assign tool */
interface RoleAssignInput {
  task_description: string
  required_capabilities: string[]
  available_agents: Array<{
    id: string
    capabilities: string[]
    current_load: number
    perf_history: number[]
  }>
  team_size?: number
  collaboration_pattern?: CollabPattern
}

/** A role assignment */
interface RoleAssignment {
  agent_id: string
  role: string
  match_score: number
  responsibilities: string[]
  dependencies: string[]
}

/** Result of role assignment */
interface RoleAssignResult {
  pattern: CollabPattern
  assignments: RoleAssignment[]
  coverage_score: number
  uncovered_caps: string[]
  recommendations: string[]
}

/** Input for task_orchestrate tool */
interface OrchestrateInput {
  task_description: string
  sub_tasks: Array<{
    id: string
    description: string
    required_caps: string[]
    estimated_effort: number
    dependencies: string[]
    priority: TaskPriority
  }>
  available_agents?: string[]
}

/** A scheduled task step */
interface ScheduledStep {
  task_id: string
  assigned_to: string
  phase: number
  estimated_start: number
  estimated_duration: number
  parallel_group: number
}

/** Result of task orchestration */
interface OrchestrateResult {
  task: string
  schedule: ScheduledStep[]
  total_phases: number
  total_effort: number
  critical_path: string[]
  parallelization_degree: number
}

/** Input for capability_match tool */
interface CapabilityMatchInput {
  task_requirements: Array<{
    capability: string
    min_level: CapLevel
    importance: number
  }>
  agents: Array<{
    id: string
    capabilities: Record<string, CapLevel>
    history: number[]
  }>
}

/** A capability match result */
interface CapabilityMatchResult {
  agent_id: string
  overall_match: number
  matched_caps: string[]
  gap_caps: string[]
  strength_caps: string[]
  recommendation: string
}

/** Result of capability matching */
interface CapabilityMatchOutput {
  matches: CapabilityMatchResult[]
  best_team: string[]
  coverage_gaps: string[]
  suggestions: string[]
}

/** Input for collaboration_graph tool */
interface CollabGraphInput {
  agents: string[]
  interactions: Array<{
    from: string
    to: string
    type: 'data_flow' | 'control_flow' | 'feedback' | 'dependency'
    frequency: number
  }>
}

/** A node in collaboration graph */
interface CollabNode {
  agent_id: string
  centrality: number
  inbound_count: number
  outbound_count: number
  role: 'hub' | 'leaf' | 'bridge' | 'isolated'
}

/** Result of collaboration graph analysis */
interface CollabGraphResult {
  nodes: CollabNode[]
  bottlenecks: string[]
  isolated_agents: string[]
  overloaded_agents: string[]
  recommendations: string[]
}

/** Input for conflict_resolution tool */
interface ConflictInput {
  conflicts: Array<{
    type: 'resource' | 'opinion' | 'responsibility' | 'priority'
    parties: string[]
    description: string
    severity: 'high' | 'medium' | 'low'
  }>
}

/** A resolved conflict */
interface ResolvedConflict {
  conflict_type: string
  parties: string[]
  resolution: string
  strategy: string
  prevention: string
}

/** Result of conflict resolution */
interface ConflictResult {
  resolved: ResolvedConflict[]
  escalations: string[]
  system_health: number
}

/** Input for workload_balance tool */
interface WorkloadInput {
  agents: Array<{
    id: string
    current_tasks: number
    capacity: number
    avg_task_duration: number
    skill_level: CapLevel
  }>
}

/** An agent's workload status */
interface WorkloadStatus {
  agent_id: string
  utilization: number
  status: 'overloaded' | 'balanced' | 'underloaded'
  recommended_action: string
  transfer_suggestions: Array<{ to: string; tasks: number }>
}

/** Result of workload balancing */
interface WorkloadResult {
  statuses: WorkloadStatus[]
  overall_gini: number
  transfers: Array<{ from: string; to: string; task_count: number }>
  recommendations: string[]
}

/** Input for progress_dashboard tool */
interface ProgressInput {
  project_name: string
  tasks: Array<{
    id: string
    agent_id: string
    status: TaskStatus
    progress: number
    estimated_total: number
    elapsed: number
    block_reason?: string
  }>
}

/** Agent progress summary */
interface AgentProgress {
  agent_id: string
  completed: number
  in_progress: number
  blocked: number
  overall_progress: number
  risk: 'high' | 'medium' | 'low'
}

/** Result of progress tracking */
interface ProgressResult {
  project: string
  agents: AgentProgress[]
  overall_progress: number
  blocked_tasks: string[]
  estimated_completion: string
  risks: string[]
}

/** Input for team_health_check tool */
interface HealthInput {
  agents: Array<{
    id: string
    response_time_ms: number
    error_rate: number
    tasks_completed: number
    tasks_failed: number
    uptime_hours: number
  }>
  period_hours?: number
}

/** An agent's health status */
interface AgentHealth {
  agent_id: string
  health_score: number
  status: 'healthy' | 'degraded' | 'critical'
  issues: string[]
  recommendations: string[]
}

/** Result of team health check */
interface HealthResult {
  agents: AgentHealth[]
  team_score: number
  critical_agents: string[]
  overall_status: 'healthy' | 'degraded' | 'critical'
  action_items: string[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Simple seeded random number generator */
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs((Math.sin(hash) * 10000) % 1)
}

/** Get current timestamp */
function now(): string {
  return new Date().toISOString()
}

/** Capability level numeric value */
function capLevelValue(level: CapLevel): number {
  const values = { novice: 1, intermediate: 2, expert: 3, master: 4 }
  return values[level]
}

/** Priority emoji */
function priorityEmoji(p: TaskPriority): string {
  const emojis = { critical: '[!!!]', high: '[!]', medium: '[~]', low: '[L]' }
  return emojis[p]
}

/** Status emoji */
function statusEmoji(s: TaskStatus): string {
  const emojis = { pending: '[ ]', assigned: '[>]', in_progress: '[~]', blocked: '[X]', completed: '[OK]', failed: '[!]' }
  return emojis[s]
}

/** Gini coefficient for inequality measurement */
function giniCoefficient(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const mean = sorted.reduce((a, b) => a + b, 0) / n
  if (mean === 0) return 0
  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += (2 * (i + 1) - n - 1) * sorted[i]
  }
  return sum / (n * n * mean)
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/** Assign optimal agent roles based on task requirements and capabilities */
function assignRoles(data: RoleAssignInput): RoleAssignResult {
  const pattern = data.collaboration_pattern || 'peer'
  const teamSize = data.team_size || Math.min(data.available_agents.length, data.required_capabilities.length)
  const assignments: RoleAssignment[] = []

  const sortedAgents = [...data.available_agents].sort((a, b) => {
    const aMatch = a.capabilities.filter(c => data.required_capabilities.includes(c)).length
    const bMatch = b.capabilities.filter(c => data.required_capabilities.includes(c)).length
    return bMatch - aMatch || a.current_load - b.current_load
  })

  const roleTemplates = {
    hierarchical: ['Lead', 'Senior', 'Junior', 'Reviewer'],
    peer: ['Worker', 'Worker', 'Worker', 'Coordinator'],
    pipeline: ['Input', 'Process', 'Validate', 'Output'],
    swarm: ['Explorer', 'Analyzer', 'Builder', 'Tester']
  }

  const roles = roleTemplates[pattern]
  const coveredCaps = new Set<string>()

  for (let i = 0; i < Math.min(teamSize, sortedAgents.length); i++) {
    const agent = sortedAgents[i]
    const role = roles[i % roles.length]
    const matchedCaps = agent.capabilities.filter(c => data.required_capabilities.includes(c))
    matchedCaps.forEach(c => coveredCaps.add(c))

    const avgPerf = agent.perf_history.length > 0
      ? agent.perf_history.reduce((a, b) => a + b, 0) / agent.perf_history.length
      : 0.5

    const matchScore = Math.round(
      (matchedCaps.length / Math.max(data.required_capabilities.length, 1)) * 0.6 +
      avgPerf * 0.3 +
      (1 - agent.current_load / 10) * 0.1
    * 100) / 100

    const responsibilities: string[] = []
    if (pattern === 'hierarchical' && i === 0) responsibilities.push('Coordinate team', 'Make final decisions', 'Review outputs')
    else if (pattern === 'pipeline') responsibilities.push(`Handle ${role.toLowerCase()} stage`, 'Pass result to next stage')
    else if (pattern === 'swarm') responsibilities.push(`Perform ${role.toLowerCase()} tasks`, 'Share findings with swarm')
    else responsibilities.push(`Execute ${matchedCaps.join(', ') || 'assigned tasks'}`, 'Report progress')

    const dependencies: string[] = []
    if (i > 0 && pattern === 'pipeline') dependencies.push(sortedAgents[i - 1].id)
    if (pattern === 'hierarchical' && i > 0) dependencies.push(sortedAgents[0].id)

    assignments.push({
      agent_id: agent.id,
      role: `${role}-${i + 1}`,
      match_score: matchScore,
      responsibilities,
      dependencies
    })
  }

  const uncoveredCaps = data.required_capabilities.filter(c => !coveredCaps.has(c))
  const coverage_score = Math.round((coveredCaps.size / Math.max(data.required_capabilities.length, 1)) * 100)

  const recommendations: string[] = []
  if (uncoveredCaps.length > 0) recommendations.push(`Recruit agents with: ${uncoveredCaps.join(', ')}`)
  if (sortedAgents.slice(teamSize).length > 0) recommendations.push(`${sortedAgents.slice(teamSize).length} agents available as backup`)
  recommendations.push(`Pattern "${pattern}" selected - ${getPatternDescription(pattern)}`)

  return { pattern, assignments, coverage_score, uncovered_caps: uncoveredCaps, recommendations }
}

function getPatternDescription(p: CollabPattern): string {
  const desc = {
    hierarchical: 'top-down control, clear chain of command',
    peer: 'equal collaboration, consensus decisions',
    pipeline: 'sequential processing, each stage feeds next',
    swarm: 'parallel exploration, emergent coordination'
  }
  return desc[p]
}

/** Orchestrate task decomposition and scheduling */
function orchestrateTasks(data: OrchestrateInput): OrchestrateResult {
  const subTasks = data.sub_tasks
  const sortedTasks = [...subTasks].sort((a, b) => {
    const prioOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return prioOrder[b.priority] - prioOrder[a.priority]
  })

  const schedule: ScheduledStep[] = []
  const completed: Set<string> = new Set()
  let phase = 0
  let currentTime = 0

  while (completed.size < sortedTasks.length) {
    phase++
    const ready = sortedTasks.filter(t =>
      !completed.has(t.id) && t.dependencies.every(d => completed.has(d))
    )

    if (ready.length === 0) break

    const parallelGroup = phase
    const maxDuration = Math.max(...ready.map(t => t.estimated_effort))

    for (const task of ready) {
      schedule.push({
        task_id: task.id,
        assigned_to: data.available_agents ? data.available_agents[schedule.length % data.available_agents.length] : `agent-${schedule.length + 1}`,
        phase,
        estimated_start: currentTime,
        estimated_duration: task.estimated_effort,
        parallel_group: parallelGroup
      })
      completed.add(task.id)
    }

    currentTime += maxDuration
  }

  const criticalPath = sortedTasks.filter(t => t.priority === 'critical' || t.priority === 'high').map(t => t.id)
  const totalEffort = sortedTasks.reduce((sum, t) => sum + t.estimated_effort, 0)
  const parallelization = Math.round((schedule.length / Math.max(phase, 1)) * 100) / 100

  return {
    task: data.task_description,
    schedule,
    total_phases: phase,
    total_effort: totalEffort,
    critical_path: criticalPath,
    parallelization_degree: parallelization
  }
}

/** Match agents to capability requirements */
function matchCapabilities(data: CapabilityMatchInput): CapabilityMatchOutput {
  const matches: CapabilityMatchResult[] = []

  for (const agent of data.agents) {
    const matchedCaps: string[] = []
    const gapCaps: string[] = []
    const strengthCaps: string[] = []
    let totalScore = 0
    let maxScore = 0

    for (const req of data.task_requirements) {
      maxScore += req.importance * 4
      const agentLevel = agent.capabilities[req.capability]
      if (!agentLevel) {
        gapCaps.push(req.capability)
        continue
      }

      const levelVal = capLevelValue(agentLevel)
      const minVal = capLevelValue(req.min_level)

      if (levelVal >= minVal) {
        matchedCaps.push(req.capability)
        totalScore += req.importance * levelVal
        if (levelVal > minVal) strengthCaps.push(req.capability)
      } else {
        gapCaps.push(req.capability)
        totalScore += req.importance * (levelVal / minVal) * 2
      }
    }

    const overallMatch = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) / 100 : 0

    let recommendation = 'Suitable for the role'
    if (overallMatch < 0.5) recommendation = 'Significant gaps - needs support or replacement'
    else if (overallMatch < 0.7) recommendation = 'Partially suitable - pair with stronger agent'
    else if (gapCaps.length > 0) recommendation = 'Strong fit with minor gaps'

    matches.push({
      agent_id: agent.id,
      overall_match: overallMatch,
      matched_caps: matchedCaps,
      gap_caps: gapCaps,
      strength_caps: strengthCaps,
      recommendation
    })
  }

  matches.sort((a, b) => b.overall_match - a.overall_match)

  const bestTeam = matches.filter(m => m.overall_match >= 0.6).map(m => m.agent_id)
  const allGaps = [...new Set(matches.flatMap(m => m.gap_caps))]

  const suggestions: string[] = []
  if (bestTeam.length === 0) suggestions.push('No single agent meets requirements - consider multi-agent team')
  if (allGaps.length > 0) suggestions.push(`Coverage gaps: ${allGaps.join(', ')} - recruit or train`)
  suggestions.push(`Best match: ${matches[0]?.agent_id || 'none'} (${matches[0]?.overall_match || 0})`)

  return { matches, best_team: bestTeam, coverage_gaps: allGaps, suggestions }
}

/** Build and analyze collaboration graph */
function analyzeCollabGraph(data: CollabGraphInput): CollabGraphResult {
  const nodes: CollabNode[] = []
  const inCounts: Record<string, number> = {}
  const outCounts: Record<string, number> = {}

  for (const agent of data.agents) {
    inCounts[agent] = 0
    outCounts[agent] = 0
  }

  for (const edge of data.interactions) {
    outCounts[edge.from] = (outCounts[edge.from] || 0) + edge.frequency
    inCounts[edge.to] = (inCounts[edge.to] || 0) + edge.frequency
  }

  const totalInteractions = data.interactions.reduce((sum, e) => sum + e.frequency, 0) || 1

  for (const agent of data.agents) {
    const inbound = inCounts[agent] || 0
    const outbound = outCounts[agent] || 0
    const centrality = Math.round((inbound + outbound) / totalInteractions * 100) / 100

    let role: CollabNode['role'] = 'leaf'
    if (inbound === 0 && outbound === 0) role = 'isolated'
    else if (inbound > totalInteractions * 0.3 || outbound > totalInteractions * 0.3) role = 'hub'
    else if (inbound > 0 && outbound > 0) role = 'bridge'

    nodes.push({ agent_id: agent, centrality, inbound_count: inbound, outbound_count: outbound, role })
  }

  const bottlenecks = nodes.filter(n => n.role === 'hub').map(n => n.agent_id)
  const isolated = nodes.filter(n => n.role === 'isolated').map(n => n.agent_id)
  const overloaded = nodes.filter(n => n.centrality > 0.4).map(n => n.agent_id)

  const recommendations: string[] = []
  if (isolated.length > 0) recommendations.push(`Connect isolated agents: ${isolated.join(', ')}`)
  if (overloaded.length > 0) recommendations.push(`Reduce load on hubs: ${overloaded.join(', ')}`)
  if (bottlenecks.length === 0) recommendations.push('No clear bottleneck - consider adding coordination hub')
  recommendations.push('Review interaction patterns to optimize flow')

  return { nodes, bottlenecks, isolated_agents: isolated, overloaded_agents: overloaded, recommendations }
}

/** Resolve conflicts between agents */
function resolveConflicts(data: ConflictInput): ConflictResult {
  const resolved: ResolvedConflict[] = []
  const escalations: string[] = []

  for (const conflict of data.conflicts) {
    let resolution = ''
    let strategy = ''
    let prevention = ''

    switch (conflict.type) {
      case 'resource':
        resolution = 'Implement priority-based resource scheduling with preemption'
        strategy = 'priority_scheduling'
        prevention = 'Define clear resource ownership and borrowing protocols'
        break
      case 'opinion':
        resolution = 'Use evidence-based decision: run experiments, compare results'
        strategy = 'empirical_comparison'
        prevention = 'Establish decision criteria before discussion begins'
        break
      case 'responsibility':
        resolution = 'Clarify ownership with RACI matrix, assign primary owner'
        strategy = 'raci_clarification'
        prevention = 'Define role boundaries at team formation'
        break
      case 'priority':
        resolution = 'Apply weighted scoring: urgency x importance x dependencies'
        strategy = 'weighted_scoring'
        prevention = 'Regular priority alignment sessions'
        break
    }

    if (conflict.severity === 'high') {
      escalations.push(`Requires mediator for: ${conflict.description}`)
    }

    resolved.push({
      conflict_type: conflict.type,
      parties: conflict.parties,
      resolution,
      strategy,
      prevention
    })
  }

  const systemHealth = Math.max(0, 100 - escalations.length * 15 - data.conflicts.filter(c => c.severity === 'medium').length * 5)

  return { resolved, escalations, system_health: systemHealth }
}

/** Analyze and balance workload across agents */
function balanceWorkload(data: WorkloadInput): WorkloadResult {
  const statuses: WorkloadStatus[] = []
  const transfers: Array<{ from: string; to: string; task_count: number }> = []

  for (const agent of data.agents) {
    const utilization = Math.round((agent.current_tasks / Math.max(agent.capacity, 1)) * 100)

    let status: WorkloadStatus['status'] = 'balanced'
    let recommendedAction = 'Maintain current load'

    if (utilization > 90) {
      status = 'overloaded'
      recommendedAction = `Transfer ${Math.ceil((agent.current_tasks - agent.capacity * 0.8))} tasks to other agents`
    } else if (utilization < 40) {
      status = 'underloaded'
      recommendedAction = `Can accept ${Math.floor((agent.capacity * 0.8) - agent.current_tasks)} more tasks`
    }

    const transferSuggestions: Array<{ to: string; tasks: number }> = []
    if (status === 'overloaded') {
      const excess = Math.ceil((agent.current_tasks - agent.capacity * 0.8))
      const underloaded = data.agents.filter(a => a.id !== agent.id && a.current_tasks < a.capacity * 0.5)
      if (underloaded.length > 0) {
        transferSuggestions.push({ to: underloaded[0].id, tasks: excess })
      }
    }

    statuses.push({
      agent_id: agent.id,
      utilization,
      status,
      recommended_action: recommendedAction,
      transfer_suggestions: transferSuggestions
    })
  }

  for (const s of statuses.filter(s => s.status === 'overloaded')) {
    for (const suggestion of s.transfer_suggestions) {
      transfers.push({ from: s.agent_id, to: suggestion.to, task_count: suggestion.tasks })
    }
  }

  const utilizations = statuses.map(s => s.utilization)
  const overallGini = Math.round(giniCoefficient(utilizations) * 100) / 100

  const recommendations: string[] = []
  if (overallGini > 0.3) recommendations.push('High load imbalance detected - redistribute tasks')
  const overloadedCount = statuses.filter(s => s.status === 'overloaded').length
  if (overloadedCount > 0) recommendations.push(`${overloadedCount} agent(s) overloaded - immediate attention needed`)
  const underloadedCount = statuses.filter(s => s.status === 'underloaded').length
  if (underloadedCount > 0) recommendations.push(`${underloadedCount} agent(s) underloaded - assign more work`)

  return { statuses, overall_gini: overallGini, transfers, recommendations }
}

/** Track progress across all agents and tasks */
function trackProgress(data: ProgressInput): ProgressResult {
  const agentMap: Record<string, AgentProgress> = {}

  for (const task of data.tasks) {
    if (!agentMap[task.agent_id]) {
      agentMap[task.agent_id] = {
        agent_id: task.agent_id,
        completed: 0,
        in_progress: 0,
        blocked: 0,
        overall_progress: 0,
        risk: 'low'
      }
    }

    const agent = agentMap[task.agent_id]
    if (task.status === 'completed') agent.completed++
    else if (task.status === 'in_progress') agent.in_progress++
    else if (task.status === 'blocked') agent.blocked++
  }

  const agents = Object.values(agentMap).map(agent => {
    const totalTasks = agent.completed + agent.in_progress + agent.blocked
    agent.overall_progress = totalTasks > 0 ? Math.round((agent.completed / totalTasks) * 100) : 0

    if (agent.blocked > agent.completed) agent.risk = 'high'
    else if (agent.blocked > 0) agent.risk = 'medium'
    else agent.risk = 'low'

    return agent
  })

  const totalTasks = data.tasks.length
  const completedTasks = data.tasks.filter(t => t.status === 'completed').length
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const blockedTasks = data.tasks.filter(t => t.status === 'blocked').map(t => t.id)

  const totalElapsed = data.tasks.reduce((sum, t) => sum + t.elapsed, 0)
  const totalEstimated = data.tasks.reduce((sum, t) => sum + t.estimated_total, 0)
  const remainingRatio = totalEstimated > 0 ? (totalEstimated - totalElapsed) / totalEstimated : 0
  const estimatedDate = new Date(Date.now() + remainingRatio * totalElapsed * 3600000)

  const risks: string[] = []
  if (blockedTasks.length > 0) risks.push(`${blockedTasks.length} blocked task(s) need attention`)
  if (agents.some(a => a.risk === 'high')) risks.push('High-risk agents detected')
  if (overallProgress < 30) risks.push('Project behind schedule')

  return {
    project: data.project_name,
    agents,
    overall_progress: overallProgress,
    blocked_tasks: blockedTasks,
    estimated_completion: estimatedDate.toLocaleDateString('zh-CN'),
    risks
  }
}

/** Perform team health check */
function checkTeamHealth(data: HealthInput): HealthResult {
  const agents: AgentHealth[] = []
  const period = data.period_hours || 24

  for (const agent of data.agents) {
    const issues: string[] = []
    const recommendations: string[] = []
    let healthScore = 100

    // Response time check
    if (agent.response_time_ms > 5000) {
      issues.push(`High response time: ${agent.response_time_ms}ms`)
      healthScore -= 20
      recommendations.push('Investigate latency bottleneck')
    } else if (agent.response_time_ms > 2000) {
      issues.push(`Moderate latency: ${agent.response_time_ms}ms`)
      healthScore -= 5
    }

    // Error rate check
    const totalTasks = agent.tasks_completed + agent.tasks_failed
    const errorRate = totalTasks > 0 ? agent.tasks_failed / totalTasks : 0
    if (errorRate > 0.1) {
      issues.push(`High error rate: ${Math.round(errorRate * 100)}%`)
      healthScore -= 25
      recommendations.push('Review error patterns and add safeguards')
    } else if (errorRate > 0.05) {
      issues.push(`Elevated error rate: ${Math.round(errorRate * 100)}%`)
      healthScore -= 10
    }

    // Uptime check
    const expectedUptime = period
    if (agent.uptime_hours < expectedUptime * 0.9) {
      issues.push(`Low uptime: ${agent.uptime_hours}h/${expectedUptime}h`)
      healthScore -= 15
      recommendations.push('Investigate downtime causes')
    }

    healthScore = Math.max(0, healthScore)

    let status: AgentHealth['status'] = 'healthy'
    if (healthScore < 50) status = 'critical'
    else if (healthScore < 75) status = 'degraded'

    if (issues.length === 0) recommendations.push('Agent operating normally')

    agents.push({
      agent_id: agent.id,
      health_score: healthScore,
      status,
      issues,
      recommendations
    })
  }

  const teamScore = Math.round(agents.reduce((sum, a) => sum + a.health_score, 0) / Math.max(agents.length, 1))
  const criticalAgents = agents.filter(a => a.status === 'critical').map(a => a.agent_id)

  let overallStatus: HealthResult['overall_status'] = 'healthy'
  if (teamScore < 50) overallStatus = 'critical'
  else if (teamScore < 75) overallStatus = 'degraded'

  const actionItems: string[] = []
  if (criticalAgents.length > 0) actionItems.push(`URGENT: Restart/replace critical agents: ${criticalAgents.join(', ')}`)
  if (agents.some(a => a.issues.some(i => i.includes('latency')))) actionItems.push('Scale up compute resources for slow agents')
  if (agents.some(a => a.issues.some(i => i.includes('error')))) actionItems.push('Review and improve error handling')

  return { agents, team_score: teamScore, critical_agents: criticalAgents, overall_status: overallStatus, action_items: actionItems }
}

// ============================================================================
// FORMAT FUNCTIONS
// ============================================================================

function formatRoleAssignResult(result: RoleAssignResult): string {
  const lines: string[] = []
  lines.push('# AgentMatrix: Role Assignment Report')
  lines.push('')
  lines.push(`**Pattern:** ${result.pattern}`)
  lines.push(`**Coverage:** ${result.coverage_score}%`)
  lines.push(`**Assignments:** ${result.assignments.length}`)
  lines.push('')

  if (result.uncovered_caps.length > 0) {
    lines.push('## Uncovered Capabilities')
    lines.push('')
    for (const cap of result.uncovered_caps) {
      lines.push(`- [GAP] ${cap}`)
    }
    lines.push('')
  }

  lines.push('## Assignments')
  lines.push('')
  for (const a of result.assignments) {
    lines.push(`### ${a.agent_id} -> ${a.role}`)
    lines.push('')
    lines.push(`- **Match Score:** ${a.match_score}`)
    lines.push('- **Responsibilities:**')
    for (const r of a.responsibilities) lines.push(`  - ${r}`)
    if (a.dependencies.length > 0) {
      lines.push(`- **Depends on:** ${a.dependencies.join(', ')}`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of result.recommendations) {
      lines.push(`- [>] ${rec}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by AgentMatrix at ${now()}*`)
  return lines.join('\n')
}

function formatOrchestrateResult(result: OrchestrateResult): string {
  const lines: string[] = []
  lines.push('# AgentMatrix: Task Orchestration Report')
  lines.push('')
  lines.push(`**Task:** ${result.task}`)
  lines.push(`**Total Phases:** ${result.total_phases}`)
  lines.push(`**Total Effort:** ${result.total_effort} person-hours`)
  lines.push(`**Parallelization:** ${result.parallelization_degree}x`)
  lines.push('')

  if (result.critical_path.length > 0) {
    lines.push('## Critical Path')
    lines.push('')
    lines.push(result.critical_path.join(' -> '))
    lines.push('')
  }

  lines.push('## Schedule')
  lines.push('')
  for (const step of result.schedule) {
    lines.push(`- [Phase ${step.phase}] **${step.task_id}** -> ${step.assigned_to} (${step.estimated_duration}h, start: +${step.estimated_start}h)`)
  }
  lines.push('')

  lines.push('---')
  lines.push(`*Generated by AgentMatrix at ${now()}*`)
  return lines.join('\n')
}

function formatCapabilityMatchOutput(result: CapabilityMatchOutput): string {
  const lines: string[] = []
  lines.push('# AgentMatrix: Capability Match Report')
  lines.push('')
  lines.push(`**Best Team:** ${result.best_team.join(', ') || 'none qualified'}`)
  lines.push('')

  if (result.coverage_gaps.length > 0) {
    lines.push('## Coverage Gaps')
    lines.push('')
    for (const gap of result.coverage_gaps) {
      lines.push(`- [GAP] ${gap}`)
    }
    lines.push('')
  }

  lines.push('## Agent Matches')
  lines.push('')
  for (const m of result.matches) {
    const matchBar = '[' + '#'.repeat(Math.round(m.overall_match * 20)) + '-'.repeat(20 - Math.round(m.overall_match * 20)) + ']'
    lines.push(`### ${m.agent_id} - ${Math.round(m.overall_match * 100)}%`)
    lines.push('')
    lines.push(matchBar)
    lines.push('')
    if (m.matched_caps.length > 0) lines.push(`- **Matched:** ${m.matched_caps.join(', ')}`)
    if (m.strength_caps.length > 0) lines.push(`- **Strengths:** ${m.strength_caps.join(', ')}`)
    if (m.gap_caps.length > 0) lines.push(`- **Gaps:** ${m.gap_caps.join(', ')}`)
    lines.push(`- **Verdict:** ${m.recommendation}`)
    lines.push('')
  }

  if (result.suggestions.length > 0) {
    lines.push('## Suggestions')
    lines.push('')
    for (const s of result.suggestions) lines.push(`- [>] ${s}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by AgentMatrix at ${now()}*`)
  return lines.join('\n')
}

function formatCollabGraphResult(result: CollabGraphResult): string {
  const lines: string[] = []
  lines.push('# AgentMatrix: Collaboration Graph Analysis')
  lines.push('')
  lines.push(`**Total Nodes:** ${result.nodes.length}`)
  lines.push('')

  if (result.bottlenecks.length > 0) {
    lines.push('## Bottlenecks')
    lines.push('')
    for (const b of result.bottlenecks) lines.push(`- [BOTTLENECK] ${b}`)
    lines.push('')
  }

  if (result.isolated_agents.length > 0) {
    lines.push('## Isolated Agents')
    lines.push('')
    for (const iso of result.isolated_agents) lines.push(`- [ISOLATED] ${iso}`)
    lines.push('')
  }

  if (result.overloaded_agents.length > 0) {
    lines.push('## Overloaded Agents')
    lines.push('')
    for (const ov of result.overloaded_agents) lines.push(`- [OVERLOADED] ${ov}`)
    lines.push('')
  }

  lines.push('## Node Details')
  lines.push('')
  for (const node of result.nodes) {
    const roleMark = node.role === 'hub' ? '[HUB]' : node.role === 'bridge' ? '[BRIDGE]' : node.role === 'isolated' ? '[ISOLATED]' : '[LEAF]'
    lines.push(`- ${roleMark} ${node.agent_id} | Centrality: ${node.centrality} | In: ${node.inbound_count} | Out: ${node.outbound_count}`)
  }
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const r of result.recommendations) lines.push(`- [>] ${r}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by AgentMatrix at ${now()}*`)
  return lines.join('\n')
}

function formatConflictResult(result: ConflictResult): string {
  const lines: string[] = []
  lines.push('# AgentMatrix: Conflict Resolution Report')
  lines.push('')
  lines.push(`**System Health:** ${result.system_health}/100`)
  lines.push(`**Resolved:** ${result.resolved.length}`)
  lines.push('')

  if (result.escalations.length > 0) {
    lines.push('## Escalations Required')
    lines.push('')
    for (const e of result.escalations) lines.push(`- [ESCALATE] ${e}`)
    lines.push('')
  }

  if (result.resolved.length > 0) {
    lines.push('## Resolutions')
    lines.push('')
    for (const r of result.resolved) {
      lines.push(`### ${r.conflict_type} (parties: ${r.parties.join(' vs ')})`)
      lines.push('')
      lines.push(`- **Resolution:** ${r.resolution}`)
      lines.push(`- **Strategy:** ${r.strategy}`)
      lines.push(`- **Prevention:** ${r.prevention}`)
      lines.push('')
    }
  }

  lines.push('---')
  lines.push(`*Generated by AgentMatrix at ${now()}*`)
  return lines.join('\n')
}

function formatWorkloadResult(result: WorkloadResult): string {
  const lines: string[] = []
  lines.push('# AgentMatrix: Workload Balance Report')
  lines.push('')
  lines.push(`**Gini Coefficient:** ${result.overall_gini} (0=perfect balance, 1=max imbalance)`)
  lines.push('')

  if (result.transfers.length > 0) {
    lines.push('## Suggested Transfers')
    lines.push('')
    for (const t of result.transfers) {
      lines.push(`- ${t.from} -> ${t.to}: ${t.task_count} task(s)`)
    }
    lines.push('')
  }

  lines.push('## Agent Status')
  lines.push('')
  for (const s of result.statuses) {
    const statusMark = s.status === 'overloaded' ? '[OVER]' : s.status === 'underloaded' ? '[UNDER]' : '[OK]'
    lines.push(`- ${statusMark} ${s.agent_id} | Utilization: ${s.utilization}% | ${s.recommended_action}`)
  }
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const r of result.recommendations) lines.push(`- [>] ${r}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by AgentMatrix at ${now()}*`)
  return lines.join('\n')
}

function formatProgressResult(result: ProgressResult): string {
  const lines: string[] = []
  lines.push('# AgentMatrix: Progress Dashboard')
  lines.push('')
  lines.push(`**Project:** ${result.project}`)
  lines.push(`**Overall Progress:** ${result.overall_progress}%`)
  lines.push(`**Estimated Completion:** ${result.estimated_completion}`)
  lines.push('')

  if (result.blocked_tasks.length > 0) {
    lines.push('## Blocked Tasks')
    lines.push('')
    for (const bt of result.blocked_tasks) lines.push(`- [BLOCKED] ${bt}`)
    lines.push('')
  }

  lines.push('## Agent Progress')
  lines.push('')
  for (const agent of result.agents) {
    const riskMark = agent.risk === 'high' ? '[!]' : agent.risk === 'medium' ? '[~]' : '[OK]'
    const bar = '[' + '#'.repeat(Math.round(agent.overall_progress / 5)) + '-'.repeat(20 - Math.round(agent.overall_progress / 5)) + ']'
    lines.push(`### ${riskMark} ${agent.agent_id} (${agent.overall_progress}%)`)
    lines.push('')
    lines.push(bar)
    lines.push('')
    lines.push(`- Completed: ${agent.completed} | In Progress: ${agent.in_progress} | Blocked: ${agent.blocked}`)
    lines.push('')
  }

  if (result.risks.length > 0) {
    lines.push('## Risks')
    lines.push('')
    for (const risk of result.risks) lines.push(`- [RISK] ${risk}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by AgentMatrix at ${now()}*`)
  return lines.join('\n')
}

function formatHealthResult(result: HealthResult): string {
  const lines: string[] = []
  lines.push('# AgentMatrix: Team Health Check')
  lines.push('')
  lines.push(`**Team Score:** ${result.team_score}/100`)
  lines.push(`**Overall Status:** ${result.overall_status.toUpperCase()}`)
  lines.push('')

  if (result.critical_agents.length > 0) {
    lines.push('## Critical Agents')
    lines.push('')
    for (const ca of result.critical_agents) lines.push(`- [CRITICAL] ${ca}`)
    lines.push('')
  }

  if (result.action_items.length > 0) {
    lines.push('## Action Items')
    lines.push('')
    for (const ai of result.action_items) lines.push(`- [ACTION] ${ai}`)
    lines.push('')
  }

  lines.push('## Agent Health')
  lines.push('')
  for (const agent of result.agents) {
    const statusMark = agent.status === 'healthy' ? '[HEALTHY]' : agent.status === 'degraded' ? '[DEGRADED]' : '[CRITICAL]'
    lines.push(`### ${statusMark} ${agent.agent_id} (${agent.health_score}/100)`)
    lines.push('')
    if (agent.issues.length > 0) {
      lines.push('- **Issues:**')
      for (const issue of agent.issues) lines.push(`  - ${issue}`)
    }
    if (agent.recommendations.length > 0) {
      lines.push('- **Recommendations:**')
      for (const rec of agent.recommendations) lines.push(`  - [>] ${rec}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by AgentMatrix at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

export const name = 'dsh-tool-agentmatrix'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: agent_role_assign
  tools.register(defineTool({
    name: 'agent_role_assign',
    description: 'Dynamically assign optimal agent roles based on task requirements, agent capabilities, and workload. Supports role templates for common collaboration patterns.',
    parameters: {
      assignment_request: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: task_description (string), required_capabilities (string[]), available_agents (array of {id, capabilities, current_load, perf_history}), team_size (optional number), collaboration_pattern ("hierarchical"|"peer"|"pipeline"|"swarm")'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { assignment_request: string }) {
      const data: RoleAssignInput = JSON.parse(args.assignment_request)
      const result = assignRoles(data)
      return formatRoleAssignResult(result)
    }
  }))

  // Tool 2: task_orchestrate
  tools.register(defineTool({
    name: 'task_orchestrate',
    description: 'Decompose complex tasks into scheduled sub-tasks with dependencies, phases, and parallel groups. Returns complete execution DAG.',
    parameters: {
      orchestrate_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: task_description (string), sub_tasks (array of {id, description, required_caps, estimated_effort, dependencies, priority}), available_agents (string[], optional)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { orchestrate_input: string }) {
      const data: OrchestrateInput = JSON.parse(args.orchestrate_input)
      const result = orchestrateTasks(data)
      return formatOrchestrateResult(result)
    }
  }))

  // Tool 3: capability_match
  tools.register(defineTool({
    name: 'capability_match',
    description: 'Match agents to task capability requirements. Returns match scores, gap analysis, and best team recommendations.',
    parameters: {
      cap_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: task_requirements (array of {capability, min_level, importance}), agents (array of {id, capabilities: Record<string, level>, history: number[]})'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { cap_input: string }) {
      const data: CapabilityMatchInput = JSON.parse(args.cap_input)
      const result = matchCapabilities(data)
      return formatCapabilityMatchOutput(result)
    }
  }))

  // Tool 4: collaboration_graph
  tools.register(defineTool({
    name: 'collaboration_graph',
    description: 'Build collaboration relationship network. Identifies bottlenecks, isolated agents, and overloaded nodes.',
    parameters: {
      graph_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: agents (string[]), interactions (array of {from, to, type: "data_flow"|"control_flow"|"feedback"|"dependency", frequency})'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { graph_input: string }) {
      const data: CollabGraphInput = JSON.parse(args.graph_input)
      const result = analyzeCollabGraph(data)
      return formatCollabGraphResult(result)
    }
  }))

  // Tool 5: conflict_resolution
  tools.register(defineTool({
    name: 'conflict_resolution',
    description: 'Detect and resolve agent conflicts (resource, opinion, responsibility, priority). Returns resolution strategies and prevention measures.',
    parameters: {
      conflict_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: conflicts (array of {type: "resource"|"opinion"|"responsibility"|"priority", parties: string[], description: string, severity: "high"|"medium"|"low"})'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { conflict_input: string }) {
      const data: ConflictInput = JSON.parse(args.conflict_input)
      const result = resolveConflicts(data)
      return formatConflictResult(result)
    }
  }))

  // Tool 6: workload_balance
  tools.register(defineTool({
    name: 'workload_balance',
    description: 'Analyze agent workload distribution. Detect overloaded/underloaded agents and suggest task reallocation.',
    parameters: {
      workload_input: {
        type: 'string',
        required: true,
        description: 'JSON object with agents (array of {id, current_tasks, capacity, avg_task_duration, skill_level})'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { workload_input: string }) {
      const data: WorkloadInput = JSON.parse(args.workload_input)
      const result = balanceWorkload(data)
      return formatWorkloadResult(result)
    }
  }))

  // Tool 7: progress_dashboard
  tools.register(defineTool({
    name: 'progress_dashboard',
    description: 'Track multi-agent project progress. Per-agent completion rates, blocked tasks, estimated completion date, and risk assessment.',
    parameters: {
      progress_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: project_name (string), tasks (array of {id, agent_id, status, progress, estimated_total, elapsed, block_reason?})'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { progress_input: string }) {
      const data: ProgressInput = JSON.parse(args.progress_input)
      const result = trackProgress(data)
      return formatProgressResult(result)
    }
  }))

  // Tool 8: team_health_check
  tools.register(defineTool({
    name: 'team_health_check',
    description: 'Evaluate multi-agent system health. Checks response time, error rate, uptime, and task success rate. Returns health scores and action items.',
    parameters: {
      health_input: {
        type: 'string',
        required: true,
        description: 'JSON object with agents (array of {id, response_time_ms, error_rate, tasks_completed, tasks_failed, uptime_hours}) and period_hours (optional)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { health_input: string }) {
      const data: HealthInput = JSON.parse(args.health_input)
      const result = checkTeamHealth(data)
      return formatHealthResult(result)
    }
  }))

  console.log(`[dsh-tool-agentmatrix] Loaded - Multi-Agent Collaboration Matrix with 8 tools`)
}

