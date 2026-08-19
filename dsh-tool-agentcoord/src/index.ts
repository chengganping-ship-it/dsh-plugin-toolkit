/**
 * DSH Multi-Agent Orchestration Coordinator Plugin v0.1.0
 *
 * Multi-agent coordination toolkit for DeepSeek Harness Agent.
 * Designed for managing complex workflows with multiple AI agents working in concert.
 *
 * Features (v0.1.0):
 * - Task Decomposer (complex task decomposition into subtask trees)
 * - Agent Capability Matcher (optimal agent-task assignment with confidence scoring)
 * - Dependency Graph Builder (task dependency mapping with critical path identification)
 * - Consensus Mechanism Designer (agent agreement protocol design)
 * - Conflict Resolver (inter-agent conflict detection and resolution recommendations)
 * - Progress Aggregator (multi-agent progress tracking with bottleneck identification)
 * - Communication Optimizer (inter-agent communication efficiency analysis)
 * - Coordination Health Monitor (overall system health dashboard with alerts)
 *
 * @module dsh-tool-agentcoord
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agentcoord'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface Subtask {
  id: string
  name: string
  description: string
  complexity: 'low' | 'medium' | 'high'
  estimatedDuration: number
  dependencies: string[]
  requiredCapabilities: string[]
  priority: number
  children?: Subtask[]
}

interface AgentProfile {
  agent_id: string
  capabilities: string[]
  current_load: number
  performance_score: number
}

interface TaskProfile {
  task_id: string
  required_capabilities: string[]
  complexity: number
  priority: number
}

interface Assignment {
  agent_id: string
  task_id: string
  confidence: number
  capability_match: number
  load_factor: number
  reasoning: string
}

interface DependencyNode {
  task_id: string
  dependencies: string[]
  estimated_duration: number
  priority: number
  earliest_start: number
  earliest_finish: number
  latest_start: number
  latest_finish: number
  slack: number
  is_critical: boolean
}

interface ConsensusProtocol {
  name: string
  voting_rule: string
  quorum: number
  timeout_seconds: number
  rounds: number
  fallback: string
  description: string
}

interface Conflict {
  agent_a: string
  agent_b: string
  conflict_type: 'resource' | 'priority' | 'data' | 'goal' | 'communication'
  context: string
  proposed_solutions: string[]
}

interface ConflictResolution {
  agent_a: string
  agent_b: string
  conflict_type: string
  resolution: string
  fairness_score: number
  reasoning: string
  action_items: string[]
}

interface AgentStatus {
  agent_id: string
  task_id: string
  completion_pct: number
  status: 'idle' | 'working' | 'blocked' | 'completed'
  last_update: string
  blockers: string[]
}

interface CommunicationData {
  message_count: number
  avg_response_time: number
  channel: string
  priority_distribution: Record<string, number>
}

interface HealthData {
  coordination_score: number
  conflict_rate: number
  avg_task_completion: number
  agent_satisfaction: number
  communication_latency: number
}

// ==================== TOOL 1: TASK DECOMPOSER ====================

interface TaskDecompositionResult {
  original_task: string
  subtask_tree: Subtask[]
  total_subtasks: number
  max_depth: number
  critical_path: string[]
  parallel_groups: string[][]
  complexity_assessment: {
    overall: 'low' | 'medium' | 'high' | 'extreme'
    avg_subtask_complexity: number
    risk_factors: string[]
  }
  recommendations: string[]
}

function decomposeTask(
  taskDescription: string,
  constraints?: { max_agents?: number; deadline?: string; priority?: number }
): TaskDecompositionResult {
  const words = taskDescription.trim().split(/\s+/)
  const wordCount = words.length
  const hasMultipleSteps = /then|after|before|followed by|subsequently|next|finally|first|second|third/i.test(taskDescription)
  const hasConditionals = /if|when|unless|depending|conditional/i.test(taskDescription)
  const hasParallel = /parallel|simultaneously|concurrent|meanwhile|at the same time/i.test(taskDescription)

  const subtaskTree: Subtask[] = []
  const maxAgents = constraints?.max_agents ?? 5
  const priority = constraints?.priority ?? 3

  const sentences = taskDescription.split(/(?<=[.!?;])\s+|,\s*(?=(?:then|after|before|next|finally|first|second|third|subsequently))/i).filter(s => s.trim().length > 0)

  let subtaskCount = 0
  const maxSubtasks = Math.max(3, Math.min(maxAgents * 2, 12))

  if (sentences.length > 1) {
    for (let i = 0; i < Math.min(sentences.length, maxSubtasks); i++) {
      subtaskCount++
      const sent = sentences[i].trim()
      const complexity: Subtask['complexity'] = sent.length > 80 ? 'high' : sent.length > 40 ? 'medium' : 'low'
      const dur = complexity === 'high' ? 60 : complexity === 'medium' ? 30 : 15
      subtaskTree.push({
        id: `subtask_${i + 1}`,
        name: `Step ${i + 1}: ${sent.substring(0, 50)}${sent.length > 50 ? '...' : ''}`,
        description: sent,
        complexity,
        estimatedDuration: dur,
        dependencies: i > 0 ? [`subtask_${i}`] : [],
        requiredCapabilities: inferCapabilities(sent),
        priority: Math.max(1, priority - i),
        children: undefined
      })
    }
  } else {
    const phases = ['Analysis and Planning', 'Implementation and Execution', 'Validation and Integration', 'Delivery and Reporting']
    const actualPhases = wordCount > 20 ? phases : wordCount > 10 ? phases.slice(0, 3) : phases.slice(0, 2)
    for (let i = 0; i < actualPhases.length; i++) {
      subtaskCount++
      const dur = i === 1 ? 45 : i === 0 ? 20 : i === 2 ? 25 : 15
      subtaskTree.push({
        id: `subtask_${i + 1}`,
        name: phases[i],
        description: `${phases[i]} phase of: ${taskDescription.substring(0, 80)}`,
        complexity: i === 1 ? 'high' : i === 2 ? 'medium' : 'low',
        estimatedDuration: dur,
        dependencies: i > 0 ? [`subtask_${i}`] : [],
        requiredCapabilities: inferCapabilities(phases[i] + ' ' + taskDescription),
        priority: Math.max(1, priority - i),
        children: i === 1 ? [
          { id: `subtask_${i + 1}a`, name: 'Core Implementation', description: 'Primary implementation work', complexity: 'high', estimatedDuration: 25, dependencies: [`subtask_${i + 1}`], requiredCapabilities: ['implementation'], priority: priority },
          { id: `subtask_${i + 1}b`, name: 'Review & Refine', description: 'Quality review and refinement', complexity: 'medium', estimatedDuration: 20, dependencies: [`subtask_${i + 1}a`], requiredCapabilities: ['review'], priority: priority }
        ] : undefined
      })
    }
  }

  if (hasParallel) {
    const parGroup: string[] = []
    for (const st of subtaskTree) {
      if (st.complexity === 'low' && st.dependencies.length === 0) {
        parGroup.push(st.id)
      }
    }
    if (parGroup.length >= 2) {
      for (const id of parGroup) {
        const node = subtaskTree.find(s => s.id === id)
        if (node) node.dependencies = []
      }
    }
  }

  const criticalPath = calculateCriticalPath(subtaskTree)
  const parallelGroups = findParallelGroups(subtaskTree)
  const maxDepth = calculateMaxDepth(subtaskTree)
  const avgComplex = subtaskTree.reduce((s, t) => s + (t.complexity === 'high' ? 3 : t.complexity === 'medium' ? 2 : 1), 0) / subtaskTree.length
  const overallComplex: TaskDecompositionResult['complexity_assessment']['overall'] = avgComplex > 2.5 ? 'extreme' : avgComplex > 2 ? 'high' : avgComplex > 1.5 ? 'medium' : 'low'

  const riskFactors: string[] = []
  if (maxDepth > 3) riskFactors.push('Deep dependency chain increases coordination overhead')
  if (subtaskTree.length > maxAgents * 2) riskFactors.push('High agent count needed; consider consolidation')
  if (hasConditionals) riskFactors.push('Conditional logic introduces branching uncertainty')
  if (criticalPath.length > subtaskTree.length * 0.7) riskFactors.push('Critical path covers most tasks; little parallelism available')

  const recommendations: string[] = []
  if (parallelGroups.length > 0) recommendations.push(`Execute ${parallelGroups.length} parallel groups simultaneously to reduce total time`)
  if (maxAgents > 1) recommendations.push(`Deploy up to ${maxAgents} agents for optimal throughput`)
  if (hasConditionals) recommendations.push('Establish decision checkpoints before conditional branches')
  recommendations.push(`Estimated total duration: ${criticalPath.reduce((s, id) => { const t = subtaskTree.find(x => x.id === id); return s + (t?.estimatedDuration ?? 0) }, 0)} minutes (critical path)`)

  return {
    original_task: taskDescription,
    subtask_tree: subtaskTree,
    total_subtasks: subtaskTree.length,
    max_depth: maxDepth,
    critical_path: criticalPath,
    parallel_groups: parallelGroups,
    complexity_assessment: { overall: overallComplex, avg_subtask_complexity: avgComplex, risk_factors: riskFactors },
    recommendations
  }
}

function inferCapabilities(text: string): string[] {
  const caps: string[] = []
  const lower = text.toLowerCase()
  if (/research|search|gather|find|analyze|analysis/.test(lower)) caps.push('research')
  if (/code|implement|develop|build|create|write/.test(lower)) caps.push('implementation')
  if (/test|verify|validate|check|review|quality/.test(lower)) caps.push('testing')
  if (/design|architect|structure|plan|organize/.test(lower)) caps.push('design')
  if (/document|report|explain|describe|summary/.test(lower)) caps.push('documentation')
  if (/integrate|connect|merge|combine|coordinate/.test(lower)) caps.push('integration')
  if (/optimize|improve|enhance|refine/.test(lower)) caps.push('optimization')
  if (caps.length === 0) caps.push('general')
  return caps
}

function calculateMaxDepth(tasks: Subtask[]): number {
  const getDepth = (task: Subtask, visited: Set<string>): number => {
    if (visited.has(task.id)) return 0
    visited.add(task.id)
    let maxChildDepth = 0
    if (task.children) {
      for (const child of task.children) {
        maxChildDepth = Math.max(maxChildDepth, getDepth(child, visited))
      }
    }
    return 1 + maxChildDepth
  }
  let maxDepth = 0
  for (const task of tasks) {
    maxDepth = Math.max(maxDepth, getDepth(task, new Set()))
  }
  return maxDepth
}

function calculateCriticalPath(tasks: Subtask[]): string[] {
  const dur = (t: Subtask): number => t.estimatedDuration + (t.children?.reduce((s, c) => s + dur(c), 0) ?? 0)
  return [...tasks].sort((a, b) => dur(b) - dur(a)).map(t => t.id)
}

function findParallelGroups(tasks: Subtask[]): string[][] {
  const groups: string[][] = []
  const independent = tasks.filter(t => t.dependencies.length === 0 && (!t.children || t.children.length === 0))
  if (independent.length >= 2) {
    groups.push(independent.map(t => t.id))
  }
  return groups
}

function formatTaskDecompositionReport(result: TaskDecompositionResult): string {
  const lines: string[] = []
  lines.push('## Task Decomposition Report')
  lines.push('')
  lines.push(`**Task:** ${result.original_task.substring(0, 100)}${result.original_task.length > 100 ? '...' : ''}`)
  lines.push(`**Total Subtasks:** ${result.total_subtasks} | **Max Depth:** ${result.max_depth} | **Complexity:** ${result.complexity_assessment.overall.toUpperCase()}`)
  lines.push('')
  lines.push('### Subtask Tree')
  lines.push('| ID | Name | Complexity | Duration | Dependencies | Priority |')
  lines.push('|----|------|------------|----------|--------------|----------|')
  for (const st of result.subtask_tree) {
    const deps = st.dependencies.length > 0 ? st.dependencies.join(', ') : 'None'
    lines.push(`| ${st.id} | ${st.name.substring(0, 40)} | ${st.complexity} | ${st.estimatedDuration}m | ${deps} | ${st.priority} |`)
    if (st.children) {
      for (const child of st.children) {
        lines.push(`| └─ ${child.id} | ${child.name.substring(0, 35)} | ${child.complexity} | ${child.estimatedDuration}m | ${child.dependencies.join(', ') || 'None'} | ${child.priority} |`)
      }
    }
  }

  if (result.critical_path.length > 0) {
    lines.push('')
    lines.push(`### Critical Path: ${result.critical_path.join(' → ')}`)
  }

  if (result.parallel_groups.length > 0) {
    lines.push('')
    lines.push('### Parallel Execution Groups')
    for (let i = 0; i < result.parallel_groups.length; i++) {
      lines.push(`- Group ${i + 1}: ${result.parallel_groups[i].join(', ')}`)
    }
  }

  if (result.complexity_assessment.risk_factors.length > 0) {
    lines.push('')
    lines.push('### Risk Factors')
    for (const r of result.complexity_assessment.risk_factors) {
      lines.push(`- ⚠ ${r}`)
    }
  }

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: AGENT CAPABILITY MATCHER ====================

interface CapabilityMatchResult {
  assignments: Assignment[]
  unmatched_tasks: string[]
  unmatched_agents: string[]
  overall_confidence: number
  load_balance_index: number
  summary: {
    total_agents: number
    total_tasks: number
    assigned_count: number
    avg_capability_match: number
    avg_load: number
  }
  recommendations: string[]
}

function matchAgentCapabilities(
  agents: AgentProfile[],
  tasks: TaskProfile[]
): CapabilityMatchResult {
  const assignments: Assignment[] = []
  const assignedAgents = new Set<string>()
  const assignedTasks = new Set<string>()

  const taskScores: Array<{ agent_id: string; task_id: string; confidence: number; capability_match: number; load_factor: number; reasoning: string }> = []

  for (const task of tasks) {
    for (const agent of agents) {
      const matchScore = calculateCapabilityMatch(agent.capabilities, task.required_capabilities)
      const loadFactor = 1 - (agent.current_load / 100)
      const perfBonus = agent.performance_score / 100
      const confidence = Math.min(0.95, (matchScore * 0.5 + loadFactor * 0.3 + perfBonus * 0.2))

      const reasoning = buildMatchReasoning(agent, task, matchScore, loadFactor)

      taskScores.push({
        agent_id: agent.agent_id,
        task_id: task.task_id,
        confidence,
        capability_match: matchScore,
        load_factor: loadFactor,
        reasoning
      })
    }
  }

  taskScores.sort((a, b) => b.confidence - a.confidence)

  const agentLoadMap = new Map<string, number>()
  for (const a of agents) {
    agentLoadMap.set(a.agent_id, a.current_load)
  }

  for (const score of taskScores) {
    if (assignedTasks.has(score.task_id)) continue
    const currentAgentLoad = agentLoadMap.get(score.agent_id) ?? 0
    if (currentAgentLoad >= 90) continue

    assignments.push({
      agent_id: score.agent_id,
      task_id: score.task_id,
      confidence: score.confidence,
      capability_match: score.capability_match,
      load_factor: score.load_factor,
      reasoning: score.reasoning
    })
    assignedAgents.add(score.agent_id)
    assignedTasks.add(score.task_id)
    agentLoadMap.set(score.agent_id, currentAgentLoad + 20)
  }

  const unmatchedTasks = tasks.filter(t => !assignedTasks.has(t.task_id)).map(t => t.task_id)
  const unmatchedAgents = agents.filter(a => !assignedAgents.has(a.agent_id)).map(a => a.agent_id)

  const avgConf = assignments.length > 0 ? assignments.reduce((s, a) => s + a.confidence, 0) / assignments.length : 0
  const avgMatch = assignments.length > 0 ? assignments.reduce((s, a) => s + a.capability_match, 0) / assignments.length : 0
  const loads = agents.map(a => agentLoadMap.get(a.agent_id) ?? a.current_load)
  const avgLoad = loads.reduce((s, l) => s + l, 0) / loads.length
  const loadVariance = loads.reduce((s, l) => s + Math.pow(l - avgLoad, 2), 0) / loads.length
  const loadBalanceIndex = Math.max(0, 1 - Math.sqrt(loadVariance) / 100)

  const recommendations: string[] = []
  if (unmatchedTasks.length > 0) recommendations.push(`${unmatchedTasks.length} task(s) have no suitable agent — consider capability expansion or task reallocation`)
  if (unmatchedAgents.length > 0) recommendations.push(`${unmatchedAgents.length} agent(s) are idle — assign overflow tasks or reduce capacity`)
  if (loadBalanceIndex < 0.7) recommendations.push('Load is imbalanced — redistribute tasks for better distribution')
  if (avgMatch < 0.6) recommendations.push('Low average capability match — consider agent training or task redesign')
  if (avgConf > 0.8) recommendations.push('Strong overall assignment confidence — proceed with execution')

  return {
    assignments,
    unmatched_tasks: unmatchedTasks,
    unmatched_agents: unmatchedAgents,
    overall_confidence: avgConf,
    load_balance_index: loadBalanceIndex,
    summary: {
      total_agents: agents.length,
      total_tasks: tasks.length,
      assigned_count: assignments.length,
      avg_capability_match: avgMatch,
      avg_load: avgLoad
    },
    recommendations
  }
}

function calculateCapabilityMatch(agentCaps: string[], requiredCaps: string[]): number {
  if (requiredCaps.length === 0) return 0.5
  let matchCount = 0
  for (const req of requiredCaps) {
    if (agentCaps.some(ac => ac.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(ac.toLowerCase()))) {
      matchCount++
    }
  }
  return matchCount / requiredCaps.length
}

function buildMatchReasoning(agent: AgentProfile, task: TaskProfile, matchScore: number, loadFactor: number): string {
  const parts: string[] = []
  if (matchScore >= 0.8) parts.push('Strong capability match')
  else if (matchScore >= 0.5) parts.push('Partial capability match')
  else parts.push('Capability gap exists')
  if (loadFactor >= 0.7) parts.push('agent has capacity')
  else if (loadFactor >= 0.4) parts.push('agent moderately loaded')
  else parts.push('agent heavily loaded')
  if (agent.performance_score >= 80) parts.push('high performer')
  return parts.join('; ') + '.'
}

function formatCapabilityMatchReport(result: CapabilityMatchResult): string {
  const lines: string[] = []
  lines.push('## Agent Capability Matching Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.assigned_count}/${result.summary.total_tasks} tasks assigned across ${result.summary.total_agents} agents`)
  lines.push(`**Overall Confidence:** ${(result.overall_confidence * 100).toFixed(1)}% | **Load Balance:** ${(result.load_balance_index * 100).toFixed(1)}%`)
  lines.push(`**Avg Capability Match:** ${(result.summary.avg_capability_match * 100).toFixed(1)}% | **Avg Load:** ${result.summary.avg_load.toFixed(1)}%`)
  lines.push('')

  if (result.assignments.length > 0) {
    lines.push('### Assignments')
    lines.push('| Agent | Task | Confidence | Cap Match | Load Factor |')
    lines.push('|-------|------|------------|-----------|-------------|')
    for (const a of result.assignments.sort((x, y) => y.confidence - x.confidence)) {
      lines.push(`| ${a.agent_id} | ${a.task_id} | ${(a.confidence * 100).toFixed(0)}% | ${(a.capability_match * 100).toFixed(0)}% | ${a.load_factor.toFixed(2)} |`)
    }
  }

  if (result.unmatched_tasks.length > 0) {
    lines.push('')
    lines.push(`### Unmatched Tasks: ${result.unmatched_tasks.join(', ')}`)
  }
  if (result.unmatched_agents.length > 0) {
    lines.push('')
    lines.push(`### Idle Agents: ${result.unmatched_agents.join(', ')}`)
  }

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: DEPENDENCY GRAPH BUILDER ====================

interface DependencyGraphResult {
  nodes: DependencyNode[]
  edges: Array<{ from: string; to: string; type: 'blocks' | 'requires' }>
  critical_path: string[]
  total_duration: number
  parallel_duration: number
  parallelism_efficiency: number
  cycles_detected: string[][]
  topological_order: string[]
  summary: {
    total_nodes: number
    total_edges: number
    critical_path_length: number
    max_parallel_streams: number
    bottleneck_tasks: string[]
  }
}

function buildDependencyGraph(
  tasks_input: Array<{ task_id: string; dependencies: string[]; estimated_duration: number; priority: number }>
): DependencyGraphResult {
  const taskMap = new Map<string, DependencyNode>()
  const edges: DependencyGraphResult['edges'] = []

  for (const t of tasks_input) {
    taskMap.set(t.task_id, {
      task_id: t.task_id,
      dependencies: t.dependencies ?? [],
      estimated_duration: t.estimated_duration,
      priority: t.priority,
      earliest_start: 0,
      earliest_finish: 0,
      latest_start: Infinity,
      latest_finish: Infinity,
      slack: 0,
      is_critical: false
    })
  }

  for (const t of tasks_input) {
    for (const dep of (t.dependencies ?? [])) {
      if (taskMap.has(dep)) {
        edges.push({ from: dep, to: t.task_id, type: 'blocks' })
      }
    }
  }

  const cycles = detectCycles(tasks_input.map(t => ({ id: t.task_id, deps: t.dependencies ?? [] })))
  const topoOrder = topologicalSort(tasks_input.map(t => ({ id: t.task_id, deps: t.dependencies ?? [] })))

  const sortedTasks = topoOrder.map(id => taskMap.get(id)).filter(Boolean) as DependencyNode[]
  let projectDuration = 0

  for (const node of sortedTasks) {
    let maxPrevFinish = 0
    for (const depId of node.dependencies) {
      const dep = taskMap.get(depId)
      if (dep) maxPrevFinish = Math.max(maxPrevFinish, dep.earliest_finish)
    }
    node.earliest_start = maxPrevFinish
    node.earliest_finish = maxPrevFinish + node.estimated_duration
    projectDuration = Math.max(projectDuration, node.earliest_finish)
  }

  for (let i = sortedTasks.length - 1; i >= 0; i--) {
    const node = sortedTasks[i]
    if (!edges.some(e => e.from === node.task_id)) {
      node.latest_finish = projectDuration
    }
    let minNextStart = node.latest_finish
    for (const edge of edges) {
      if (edge.from === node.task_id) {
        const target = taskMap.get(edge.to)
        if (target) minNextStart = Math.min(minNextStart, target.latest_start)
      }
    }
    if (minNextStart === Infinity) minNextStart = node.earliest_finish
    node.latest_finish = minNextStart
    node.latest_start = node.latest_finish - node.estimated_duration
    node.slack = node.latest_start - node.earliest_start
    node.is_critical = node.slack === 0
  }

  const criticalPath = sortedTasks.filter(n => n.is_critical).map(n => n.task_id)

  const totalDuration = sortedTasks.reduce((s, n) => s + n.estimated_duration, 0)
  const parallelDuration = projectDuration
  const efficiency = totalDuration > 0 ? totalDuration / (parallelDuration * Math.max(1, sortedTasks.length)) : 1

  const inDegree = new Map<string, number>()
  for (const n of sortedTasks) {
    inDegree.set(n.task_id, 0)
  }
  for (const e of edges) {
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1)
  }
  const maxParallel = Math.max(1, [...inDegree.values()].filter(v => v === 0).length)

  const bottlenecks = sortedTasks.filter(n => n.estimated_duration > projectDuration * 0.2).map(n => n.task_id)

  return {
    nodes: sortedTasks,
    edges,
    critical_path: criticalPath,
    total_duration: totalDuration,
    parallel_duration: parallelDuration,
    parallelism_efficiency: Math.min(1, efficiency),
    cycles_detected: cycles,
    topological_order: topoOrder,
    summary: {
      total_nodes: sortedTasks.length,
      total_edges: edges.length,
      critical_path_length: criticalPath.length,
      max_parallel_streams: maxParallel,
      bottleneck_tasks: bottlenecks
    }
  }
}

function detectCycles(nodes: Array<{ id: string; deps: string[] }>): string[][] {
  const adj = new Map<string, string[]>()
  const allIds = new Set<string>()
  for (const n of nodes) {
    allIds.add(n.id)
    adj.set(n.id, n.deps.filter(d => allIds.has(d) || nodes.some(x => x.id === d)))
  }

  const cycles: string[][] = []
  const visited = new Set<string>()
  const recStack = new Set<string>()
  const path: string[] = []

  const dfs = (nodeId: string): boolean => {
    visited.add(nodeId)
    recStack.add(nodeId)
    path.push(nodeId)

    const neighbors = adj.get(nodeId) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true
      } else if (recStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor)
        cycles.push(path.slice(cycleStart))
        return true
      }
    }

    path.pop()
    recStack.delete(nodeId)
    return false
  }

  for (const id of allIds) {
    if (!visited.has(id)) dfs(id)
  }

  return cycles
}

function topologicalSort(nodes: Array<{ id: string; deps: string[] }>): string[] {
  const adj = new Map<string, string[]>()
  const inDeg = new Map<string, number>()
  for (const n of nodes) {
    if (!adj.has(n.id)) adj.set(n.id, [])
    if (!inDeg.has(n.id)) inDeg.set(n.id, 0)
    for (const d of n.deps) {
      if (!adj.has(d)) adj.set(d, [])
      adj.get(d)!.push(n.id)
      inDeg.set(n.id, (inDeg.get(n.id) ?? 0) + 1)
    }
  }

  const queue: string[] = []
  for (const [id, deg] of inDeg) {
    if (deg === 0) queue.push(id)
  }

  const result: string[] = []
  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    for (const neighbor of (adj.get(node) ?? [])) {
      const newDeg = (inDeg.get(neighbor) ?? 0) - 1
      inDeg.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }

  return result
}

function formatDependencyGraphReport(result: DependencyGraphResult): string {
  const lines: string[] = []
  lines.push('## Dependency Graph Analysis')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_nodes} nodes, ${result.summary.total_edges} edges`)
  lines.push(`**Total Duration (sequential):** ${result.total_duration}h | **Parallel Duration:** ${result.parallel_duration}h`)
  lines.push(`**Parallelism Efficiency:** ${(result.parallelism_efficiency * 100).toFixed(1)}% | **Max Parallel Streams:** ${result.summary.max_parallel_streams}`)
  lines.push('')

  if (result.critical_path.length > 0) {
    lines.push(`### Critical Path: ${result.critical_path.join(' → ')}`)
    lines.push(`**Critical Path Length:** ${result.critical_path.length} tasks`)
    lines.push('')
  }

  lines.push('### Task Schedule')
  lines.push('| Task | Duration | ES | EF | LS | LF | Slack | Critical |')
  lines.push('|------|----------|----|----|----|----|-------|----------|')
  for (const n of result.nodes) {
    lines.push(`| ${n.task_id} | ${n.estimated_duration}h | ${n.earliest_start} | ${n.earliest_finish} | ${n.latest_start === Infinity ? '-' : n.latest_start} | ${n.latest_finish === Infinity ? '-' : n.latest_finish} | ${n.slack} | ${n.is_critical ? 'YES' : 'no'} |`)
  }

  if (result.cycles_detected.length > 0) {
    lines.push('')
    lines.push('### Cycles Detected')
    for (const cycle of result.cycles_detected) {
      lines.push(`- ⚠ Cycle: ${cycle.join(' → ')} → ${cycle[0]}`)
    }
  }

  if (result.summary.bottleneck_tasks.length > 0) {
    lines.push('')
    lines.push(`### Bottleneck Tasks: ${result.summary.bottleneck_tasks.join(', ')}`)
  }

  if (result.topological_order.length > 0) {
    lines.push('')
    lines.push(`### Execution Order: ${result.topological_order.join(' → ')}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: CONSENSUS MECHANISM DESIGNER ====================

interface ConsensusDesignResult {
  protocol: ConsensusProtocol
  voting_rules: {
    type: string
    threshold: number
    weight_distribution: string
    tie_breaker: string
  }
  escalation_path: string[]
  failure_modes: Array<{ mode: string; probability: number; mitigation: string }>
  performance_metrics: {
    expected_rounds: number
    expected_time_seconds: number
    fault_tolerance: number
    scalability_rating: string
  }
  recommendations: string[]
}

function designConsensusMechanism(
  input: { agent_count: number; decision_type: string; required_agreement_level: number; timeout_seconds: number }
): ConsensusDesignResult {
  const { agent_count, decision_type, required_agreement_level, timeout_seconds } = input

  const quorum = Math.ceil(agent_count * (required_agreement_level / 100))
  const isHighStakes = decision_type === 'critical' || decision_type === 'safety' || decision_type === 'financial'
  const isBinary = decision_type === 'binary' || decision_type === 'approval'

  let protocolName: string
  let votingRule: string
  let rounds: number
  let fallback: string

  if (isHighStakes) {
    protocolName = 'Supermajority Consensus with Veto'
    votingRule = `Two-thirds supermajority required (${Math.ceil(agent_count * 0.67)} of ${agent_count} agents)`
    rounds = 3
    fallback = 'Escalate to designated authority agent after max rounds'
  } else if (isBinary) {
    protocolName = 'Simple Majority Vote'
    votingRule = `Simple majority (${Math.ceil(agent_count / 2)} of ${agent_count} agents)`
    rounds = 1
    fallback = 'Default to conservative option on tie'
  } else if (agent_count <= 3) {
    protocolName = 'Unanimity Protocol'
    votingRule = `All ${agent_count} agents must agree`
    rounds = 5
    fallback = 'Mediated negotiation with structured compromise'
  } else {
    protocolName = 'Weighted Ranked Choice'
    votingRule = `Top choice by weighted score exceeding ${required_agreement_level}% threshold`
    rounds = 2
    fallback = 'Runoff between top 2 candidates'
  }

  const escalation = [
    'Round 1: Initial proposal and vote',
    'Round 2: Discussion and revised proposal',
    'Round 3: Final vote with fallback activation'
  ]

  const failureModes: ConsensusDesignResult['failure_modes'] = [
    { mode: 'Split vote (no quorum)', probability: 0.15, mitigation: 'Extend discussion round, provide additional context' },
    { mode: 'Agent unresponsive', probability: 0.08, mitigation: `Timeout after ${Math.floor(timeout_seconds / 3)}s, exclude from quorum` },
    { mode: 'Circular disagreement', probability: 0.05, mitigation: 'Introduce external tie-breaker or random selection' }
  ]

  if (agent_count > 10) {
    failureModes.push({ mode: 'Coordination overhead', probability: 0.2, mitigation: 'Delegate to subgroup representatives' })
  }

  const expectedRounds = Math.min(rounds, isBinary ? 1 : 2)
  const avgTimePerRound = timeout_seconds / rounds
  const expectedTime = expectedRounds * avgTimePerRound
  const faultTolerance = Math.floor((agent_count - quorum) / agent_count * 100)
  const scalability = agent_count <= 5 ? 'excellent' : agent_count <= 10 ? 'good' : agent_count <= 20 ? 'moderate' : 'limited'

  const recommendations: string[] = []
  if (required_agreement_level > 90) recommendations.push('Very high agreement threshold — ensure adequate discussion time')
  if (agent_count > 10 && !isBinary) recommendations.push('Consider hierarchical consensus for large agent groups')
  if (timeout_seconds < 30) recommendations.push('Short timeout may prevent thorough deliberation')
  if (isHighStakes) recommendations.push('High-stakes decision — document rationale for audit trail')
  recommendations.push(`Deploy ${protocolName} with ${rounds} round(s) and ${timeout_seconds}s timeout`)

  return {
    protocol: {
      name: protocolName,
      voting_rule: votingRule,
      quorum,
      timeout_seconds,
      rounds,
      fallback,
      description: `${protocolName} designed for ${agent_count} agents making ${decision_type} decisions at ${required_agreement_level}% agreement level`
    },
    voting_rules: {
      type: isHighStakes ? 'supermajority' : isBinary ? 'simple_majority' : 'ranked_choice',
      threshold: quorum,
      weight_distribution: isHighStakes ? 'equal_with_veto' : 'equal',
      tie_breaker: isHighStakes ? 'authority_agent' : 'conservative_default'
    },
    escalation_path: escalation,
    failure_modes: failureModes,
    performance_metrics: {
      expected_rounds: expectedRounds,
      expected_time_seconds: expectedTime,
      fault_tolerance: faultTolerance,
      scalability_rating: scalability
    },
    recommendations
  }
}

function formatConsensusReport(result: ConsensusDesignResult): string {
  const lines: string[] = []
  lines.push('## Consensus Mechanism Design')
  lines.push('')
  lines.push(`**Protocol:** ${result.protocol.name}`)
  lines.push(`**Description:** ${result.protocol.description}`)
  lines.push(`**Voting Rule:** ${result.protocol.voting_rule}`)
  lines.push(`**Quorum:** ${result.protocol.quorum} agents | **Rounds:** ${result.protocol.rounds} | **Timeout:** ${result.protocol.timeout_seconds}s`)
  lines.push(`**Fallback:** ${result.protocol.fallback}`)
  lines.push('')

  lines.push('### Voting Rules')
  lines.push(`- Type: ${result.voting_rules.type}`)
  lines.push(`- Threshold: ${result.voting_rules.threshold} agents`)
  lines.push(`- Weight Distribution: ${result.voting_rules.weight_distribution}`)
  lines.push(`- Tie Breaker: ${result.voting_rules.tie_breaker}`)
  lines.push('')

  lines.push('### Escalation Path')
  for (const step of result.escalation_path) {
    lines.push(`- ${step}`)
  }

  lines.push('')
  lines.push('### Failure Modes')
  lines.push('| Mode | Probability | Mitigation |')
  lines.push('|------|-------------|------------|')
  for (const fm of result.failure_modes) {
    lines.push(`| ${fm.mode} | ${(fm.probability * 100).toFixed(0)}% | ${fm.mitigation} |`)
  }

  lines.push('')
  lines.push('### Performance Metrics')
  lines.push(`- Expected Rounds: ${result.performance_metrics.expected_rounds}`)
  lines.push(`- Expected Time: ${result.performance_metrics.expected_time_seconds.toFixed(0)}s`)
  lines.push(`- Fault Tolerance: ${result.performance_metrics.fault_tolerance}%`)
  lines.push(`- Scalability: ${result.performance_metrics.scalability_rating}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: CONFLICT RESOLVER ====================

interface ConflictResolutionResult {
  resolutions: ConflictResolution[]
  overall_fairness: number
  unresolved_count: number
  summary: {
    total_conflicts: number
    resolved_count: number
    by_type: Record<string, number>
    avg_fairness: number
  }
  recommendations: string[]
}

function resolveConflicts(conflicts: Conflict[]): ConflictResolutionResult {
  const resolutions: ConflictResolution[] = []
  const byType: Record<string, number> = {}

  for (const conflict of conflicts) {
    byType[conflict.conflict_type] = (byType[conflict.conflict_type] ?? 0) + 1

    const resolution = generateResolution(conflict)
    resolutions.push(resolution)
  }

  const avgFairness = resolutions.length > 0 ? resolutions.reduce((s, r) => s + r.fairness_score, 0) / resolutions.length : 0
  const unresolved = resolutions.filter(r => r.fairness_score < 0.4).length

  const recommendations: string[] = []
  if (unresolved > 0) recommendations.push(`${unresolved} conflict(s) with low fairness — escalate to coordinator`)
  if ((byType['resource'] ?? 0) > 1) recommendations.push('Multiple resource conflicts detected — implement resource allocation policy')
  if ((byType['priority'] ?? 0) > 1) recommendations.push('Priority conflicts recurring — establish clear priority framework')
  if (avgFairness > 0.8) recommendations.push('High overall fairness — current resolution mechanisms are effective')
  recommendations.push('Schedule post-conflict review to prevent recurrence')

  return {
    resolutions,
    overall_fairness: avgFairness,
    unresolved_count: unresolved,
    summary: {
      total_conflicts: conflicts.length,
      resolved_count: resolutions.length - unresolved,
      by_type: byType,
      avg_fairness: avgFairness
    },
    recommendations
  }
}

function generateResolution(conflict: Conflict): ConflictResolution {
  let resolution: string
  let fairness: number
  const actionItems: string[] = []

  switch (conflict.conflict_type) {
    case 'resource':
      resolution = `Split resource allocation proportionally based on task priority. ${conflict.agent_a} receives 60%, ${conflict.agent_b} receives 40% with option to renegotiate after milestone.`
      fairness = 0.75
      actionItems.push('Document resource sharing agreement', 'Set review checkpoint at 50% completion')
      break
    case 'priority':
      resolution = `Apply priority-based preemption: higher-priority task proceeds first. Lower-priority agent receives compensation through extended deadline or additional resources.`
      fairness = 0.7
      actionItems.push('Establish priority matrix', 'Notify both agents of resolution rationale')
      break
    case 'data':
      resolution = `Implement shared data access with version control. Both agents work from a single source of truth with conflict detection on writes.`
      fairness = 0.85
      actionItems.push('Set up shared data repository', 'Define data ownership and access rules')
      break
    case 'goal':
      resolution = `Facilitate goal alignment session. Identify common objectives and decompose into shared and individual subgoals.`
      fairness = 0.8
      actionItems.push('Schedule alignment meeting', 'Document shared goal statement')
      break
    case 'communication':
      resolution = `Establish structured communication protocol with defined channels, response time SLAs, and escalation paths.`
      fairness = 0.9
      actionItems.push('Define communication charter', 'Set up regular sync meetings')
      break
    default:
      resolution = `Mediated negotiation: both agents present cases, coordinator arbitrates based on system-wide optimization.`
      fairness = 0.65
      actionItems.push('Schedule mediation session', 'Prepare position statements')
  }

  if (conflict.proposed_solutions.length >= 2) {
    resolution += ` Consider hybrid approach combining: "${conflict.proposed_solutions[0]}" and "${conflict.proposed_solutions[1]}".`
    fairness = Math.min(0.95, fairness + 0.1)
  }

  return {
    agent_a: conflict.agent_a,
    agent_b: conflict.agent_b,
    conflict_type: conflict.conflict_type,
    resolution,
    fairness_score: fairness,
    reasoning: `Resolution based on ${conflict.conflict_type} conflict type with ${conflict.proposed_solutions.length} proposed solution(s). Fairness assessed by mutual benefit and precedent alignment.`,
    action_items: actionItems
  }
}

function formatConflictResolutionReport(result: ConflictResolutionResult): string {
  const lines: string[] = []
  lines.push('## Conflict Resolution Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_conflicts} conflicts, ${result.summary.resolved_count} resolved, ${result.unresolved_count} need escalation`)
  lines.push(`**Overall Fairness:** ${(result.overall_fairness * 100).toFixed(1)}% | **Avg Fairness:** ${(result.summary.avg_fairness * 100).toFixed(1)}%`)
  lines.push('')

  if (Object.keys(result.summary.by_type).length > 0) {
    lines.push('### Conflicts by Type')
    for (const [type, count] of Object.entries(result.summary.by_type)) {
      lines.push(`- ${type}: ${count}`)
    }
    lines.push('')
  }

  lines.push('### Resolutions')
  for (const r of result.resolutions) {
    lines.push(`#### ${r.agent_a} ↔ ${r.agent_b} (${r.conflict_type})`)
    lines.push(`**Fairness:** ${(r.fairness_score * 100).toFixed(0)}%`)
    lines.push(`**Resolution:** ${r.resolution}`)
    lines.push(`**Action Items:** ${r.action_items.join('; ')}`)
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: PROGRESS AGGREGATOR ====================

interface ProgressResult {
  overall_completion: number
  agent_progress: Array<{
    agent_id: string
    tasks: number
    avg_completion: number
    status: string
    blockers: string[]
    velocity: number
  }>
  task_progress: Array<{
    task_id: string
    agent_id: string
    completion_pct: number
    status: string
    estimated_remaining: number
  }>
  bottlenecks: Array<{
    task_id: string
    agent_id: string
    reason: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    suggestion: string
  }>
  summary: {
    total_agents: number
    total_tasks: number
    completed_tasks: number
    blocked_tasks: number
    idle_agents: number
    avg_velocity: number
  }
  projections: {
    estimated_completion_time: number
    on_track: boolean
    risk_level: 'low' | 'medium' | 'high'
  }
}

function aggregateProgress(statuses: AgentStatus[]): ProgressResult {
  const agentMap = new Map<string, AgentStatus[]>()
  const taskProgress: ProgressResult['task_progress'] = []
  const bottlenecks: ProgressResult['bottlenecks'] = []

  for (const s of statuses) {
    if (!agentMap.has(s.agent_id)) agentMap.set(s.agent_id, [])
    agentMap.get(s.agent_id)!.push(s)
  }

  let totalCompletion = 0
  let completedTasks = 0
  let blockedTasks = 0
  let idleAgents = 0
  let totalVelocity = 0

  const agentProgress: ProgressResult['agent_progress'] = []

  for (const [agentId, agentStatuses] of agentMap) {
    const avgComp = agentStatuses.reduce((s, t) => s + t.completion_pct, 0) / agentStatuses.length
    const allBlockers = agentStatuses.flatMap(s => s.blockers).filter(Boolean)
    const hasBlocked = agentStatuses.some(s => s.status === 'blocked')
    const allIdle = agentStatuses.every(s => s.status === 'idle')
    const allCompleted = agentStatuses.every(s => s.status === 'completed')

    if (allIdle) idleAgents++
    if (hasBlocked) blockedTasks++

    const velocity = avgComp > 0 ? avgComp / Math.max(1, agentStatuses.length) : 0
    totalVelocity += velocity

    agentProgress.push({
      agent_id: agentId,
      tasks: agentStatuses.length,
      avg_completion: avgComp,
      status: allCompleted ? 'completed' : hasBlocked ? 'blocked' : allIdle ? 'idle' : 'working',
      blockers: [...new Set(allBlockers)],
      velocity
    })

    for (const s of agentStatuses) {
      totalCompletion += s.completion_pct
      if (s.status === 'completed') completedTasks++

      const remaining = 100 - s.completion_pct
      taskProgress.push({
        task_id: s.task_id,
        agent_id: s.agent_id,
        completion_pct: s.completion_pct,
        status: s.status,
        estimated_remaining: remaining
      })

      if (s.status === 'blocked' || s.completion_pct < 25 && s.blockers.length > 0) {
        const severity: ProgressResult['bottlenecks'][0]['severity'] = s.status === 'blocked' ? 'critical' : s.completion_pct < 10 ? 'high' : 'medium'
        bottlenecks.push({
          task_id: s.task_id,
          agent_id: s.agent_id,
          reason: s.blockers.length > 0 ? s.blockers[0] : 'Slow progress detected',
          severity,
          suggestion: s.blockers.length > 0 ? `Resolve blocker: ${s.blockers[0]}` : 'Provide additional resources or guidance'
        })
      }
    }
  }

  const totalTasks = statuses.length
  const overallCompletion = totalTasks > 0 ? totalCompletion / totalTasks : 0
  const avgVelocity = agentMap.size > 0 ? totalVelocity / agentMap.size : 0
  const estimatedTime = avgVelocity > 0 ? (100 - overallCompletion) / avgVelocity : Infinity
  const onTrack = overallCompletion >= 50 || (avgVelocity > 5 && blockedTasks === 0)
  const riskLevel: ProgressResult['projections']['risk_level'] = blockedTasks > 2 ? 'high' : blockedTasks > 0 ? 'medium' : 'low'

  return {
    overall_completion: overallCompletion,
    agent_progress: agentProgress.sort((a, b) => b.avg_completion - a.avg_completion),
    task_progress: taskProgress.sort((a, b) => a.completion_pct - b.completion_pct),
    bottlenecks: bottlenecks.sort((a, b) => {
      const sev = { critical: 0, high: 1, medium: 2, low: 3 }
      return sev[a.severity] - sev[b.severity]
    }),
    summary: {
      total_agents: agentMap.size,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      blocked_tasks: blockedTasks,
      idle_agents: idleAgents,
      avg_velocity: avgVelocity
    },
    projections: {
      estimated_completion_time: estimatedTime,
      on_track: onTrack,
      risk_level: riskLevel
    }
  }
}

function formatProgressReport(result: ProgressResult): string {
  const lines: string[] = []
  lines.push('## Progress Aggregation Report')
  lines.push('')
  lines.push(`**Overall Completion:** ${result.overall_completion.toFixed(1)}%`)
  lines.push(`**Agents:** ${result.summary.total_agents} | **Tasks:** ${result.summary.total_tasks} | **Completed:** ${result.summary.completed_tasks} | **Blocked:** ${result.summary.blocked_tasks} | **Idle:** ${result.summary.idle_agents}`)
  lines.push(`**Avg Velocity:** ${result.summary.avg_velocity.toFixed(2)}%/cycle | **Risk Level:** ${result.projections.risk_level.toUpperCase()} | **On Track:** ${result.projections.on_track ? 'YES' : 'NO'}`)
  lines.push('')

  lines.push('### Agent Progress')
  lines.push('| Agent | Tasks | Avg Completion | Status | Velocity | Blockers |')
  lines.push('|-------|-------|----------------|--------|----------|----------|')
  for (const ap of result.agent_progress) {
    const blockers = ap.blockers.length > 0 ? ap.blockers.join(', ') : 'None'
    lines.push(`| ${ap.agent_id} | ${ap.tasks} | ${ap.avg_completion.toFixed(1)}% | ${ap.status} | ${ap.velocity.toFixed(2)} | ${blockers} |`)
  }

  if (result.bottlenecks.length > 0) {
    lines.push('')
    lines.push('### Bottlenecks')
    lines.push('| Task | Agent | Severity | Reason | Suggestion |')
    lines.push('|------|-------|----------|--------|------------|')
    for (const b of result.bottlenecks) {
      lines.push(`| ${b.task_id} | ${b.agent_id} | ${b.severity.toUpperCase()} | ${b.reason.substring(0, 40)} | ${b.suggestion.substring(0, 40)} |`)
    }
  }

  if (result.projections.estimated_completion_time !== Infinity) {
    lines.push('')
    lines.push(`### Projection: ~${result.projections.estimated_completion_time.toFixed(1)} cycles to completion`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: COMMUNICATION OPTIMIZER ====================

interface CommunicationOptimizationResult {
  efficiency_score: number
  analysis: {
    messages_per_agent: number
    response_time_rating: string
    channel_efficiency: string
    priority_balance: string
    overload_risk: 'low' | 'medium' | 'high'
  }
  bottlenecks: Array<{ issue: string; impact: string; severity: 'low' | 'medium' | 'high' }>
  optimizations: Array<{ action: string; expected_improvement: string; effort: 'low' | 'medium' | 'high' }>
  recommendations: string[]
}

function optimizeCommunication(commData: CommunicationData): CommunicationOptimizationResult {
  const { message_count, avg_response_time, channel, priority_distribution } = commData

  const msgsPerAgent = message_count / 5
  const responseRating = avg_response_time < 5 ? 'excellent' : avg_response_time < 15 ? 'good' : avg_response_time < 30 ? 'fair' : 'poor'
  const channelRating = channel === 'structured' ? 'optimal' : channel === 'hybrid' ? 'good' : channel === 'broadcast' ? 'moderate' : 'suboptimal'

  const priorities = Object.values(priority_distribution)
  const totalPrio = priorities.reduce((s, v) => s + v, 0)
  const highRatio = (priority_distribution['high'] ?? 0) / Math.max(totalPrio, 1)
  const prioBalance = highRatio > 0.5 ? 'too many high-priority (alert fatigue risk)' : highRatio > 0.2 ? 'well-balanced' : 'under-prioritized'

  const overloadRisk: CommunicationOptimizationResult['analysis']['overload_risk'] =
    msgsPerAgent > 50 ? 'high' : msgsPerAgent > 20 ? 'medium' : 'low'

  const efficiencyScore = Math.min(1, (
    (responseRating === 'excellent' ? 1 : responseRating === 'good' ? 0.8 : responseRating === 'fair' ? 0.5 : 0.2) * 0.3 +
    (channelRating === 'optimal' ? 1 : channelRating === 'good' ? 0.8 : channelRating === 'moderate' ? 0.5 : 0.3) * 0.25 +
    (overloadRisk === 'low' ? 1 : overloadRisk === 'medium' ? 0.6 : 0.2) * 0.25 +
    (prioBalance === 'well-balanced' ? 1 : prioBalance === 'under-prioritized' ? 0.7 : 0.3) * 0.2
  ))

  const bottlenecks: CommunicationOptimizationResult['bottlenecks'] = []
  if (avg_response_time > 20) bottlenecks.push({ issue: 'Slow response times', impact: 'Delays cascade through dependent tasks', severity: 'high' })
  if (msgsPerAgent > 30) bottlenecks.push({ issue: 'Message overload', impact: 'Agents miss critical messages in noise', severity: 'high' })
  if (highRatio > 0.5) bottlenecks.push({ issue: 'Priority inflation', impact: 'High-priority alerts lose meaning', severity: 'medium' })
  if (channel === 'broadcast') bottlenecks.push({ issue: 'Broadcast-only communication', impact: 'No targeted messaging capability', severity: 'medium' })
  if (bottlenecks.length === 0) bottlenecks.push({ issue: 'No major bottlenecks', impact: 'Communication flowing well', severity: 'low' })

  const optimizations: CommunicationOptimizationResult['optimizations'] = []
  if (avg_response_time > 10) optimizations.push({ action: 'Implement async message batching', expected_improvement: '30% reduction in response time', effort: 'low' })
  if (msgsPerAgent > 20) optimizations.push({ action: 'Add message filtering and routing rules', expected_improvement: '40% reduction in noise', effort: 'medium' })
  if (highRatio > 0.3) optimizations.push({ action: 'Enforce priority classification guidelines', expected_improvement: 'Better signal-to-noise ratio', effort: 'low' })
  if (channel !== 'structured') optimizations.push({ action: 'Migrate to structured communication protocol', expected_improvement: '50% improvement in clarity', effort: 'high' })
  optimizations.push({ action: 'Add message acknowledgment tracking', expected_improvement: 'Visibility into message delivery', effort: 'low' })

  const recommendations: string[] = []
  if (efficiencyScore < 0.5) recommendations.push('Communication efficiency is low — prioritize optimization efforts')
  if (overloadRisk === 'high') recommendations.push('Critical: message volume is overwhelming agents — implement throttling')
  if (responseRating === 'poor') recommendations.push('Response times unacceptable — investigate agent capacity issues')
  recommendations.push(`Current efficiency score: ${(efficiencyScore * 100).toFixed(0)}% — target: 80%`)

  return {
    efficiency_score: efficiencyScore,
    analysis: {
      messages_per_agent: msgsPerAgent,
      response_time_rating: responseRating,
      channel_efficiency: channelRating,
      priority_balance: prioBalance,
      overload_risk: overloadRisk
    },
    bottlenecks,
    optimizations,
    recommendations
  }
}

function formatCommunicationReport(result: CommunicationOptimizationResult): string {
  const lines: string[] = []
  lines.push('## Communication Optimization Report')
  lines.push('')
  lines.push(`**Efficiency Score:** ${(result.efficiency_score * 100).toFixed(0)}%`)
  lines.push(`**Messages/Agent:** ${result.analysis.messages_per_agent.toFixed(1)} | **Response Time:** ${result.analysis.response_time_rating} | **Channel:** ${result.analysis.channel_efficiency}`)
  lines.push(`**Priority Balance:** ${result.analysis.priority_balance} | **Overload Risk:** ${result.analysis.overload_risk.toUpperCase()}`)
  lines.push('')

  lines.push('### Bottlenecks')
  lines.push('| Issue | Impact | Severity |')
  lines.push('|-------|--------|----------|')
  for (const b of result.bottlenecks) {
    lines.push(`| ${b.issue} | ${b.impact} | ${b.severity.toUpperCase()} |`)
  }

  lines.push('')
  lines.push('### Optimization Actions')
  lines.push('| Action | Expected Improvement | Effort |')
  lines.push('|--------|---------------------|--------|')
  for (const o of result.optimizations) {
    lines.push(`| ${o.action} | ${o.expected_improvement} | ${o.effort} |`)
  }

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: COORDINATION HEALTH MONITOR ====================

interface HealthMonitorResult {
  overall_health: number
  status: 'healthy' | 'degraded' | 'critical' | 'failing'
  dashboard: {
    coordination_score: number
    conflict_rate: number
    avg_task_completion: number
    agent_satisfaction: number
    communication_latency: number
  }
  alerts: Array<{ level: 'info' | 'warning' | 'critical'; message: string; metric: string }>
  trends: {
    direction: 'improving' | 'stable' | 'declining'
    confidence: number
    prediction: string
  }
  recommendations: string[]
}

function monitorCoordinationHealth(healthData: HealthData): HealthMonitorResult {
  const { coordination_score, conflict_rate, avg_task_completion, agent_satisfaction, communication_latency } = healthData

  const overallHealth = Math.min(1, (
    (coordination_score / 100) * 0.3 +
    (1 - Math.min(conflict_rate, 1)) * 0.2 +
    (avg_task_completion / 100) * 0.2 +
    (agent_satisfaction / 100) * 0.15 +
    (1 - Math.min(communication_latency / 60, 1)) * 0.15
  ))

  const status: HealthMonitorResult['status'] =
    overallHealth >= 0.8 ? 'healthy' : overallHealth >= 0.6 ? 'degraded' : overallHealth >= 0.4 ? 'critical' : 'failing'

  const alerts: HealthMonitorResult['alerts'] = []

  if (coordination_score < 50) alerts.push({ level: 'critical', message: `Coordination score critically low at ${coordination_score}%`, metric: 'coordination_score' })
  else if (coordination_score < 70) alerts.push({ level: 'warning', message: `Coordination score below target: ${coordination_score}%`, metric: 'coordination_score' })

  if (conflict_rate > 0.3) alerts.push({ level: 'critical', message: `Conflict rate dangerously high: ${(conflict_rate * 100).toFixed(0)}%`, metric: 'conflict_rate' })
  else if (conflict_rate > 0.15) alerts.push({ level: 'warning', message: `Conflict rate elevated: ${(conflict_rate * 100).toFixed(0)}%`, metric: 'conflict_rate' })

  if (avg_task_completion < 40) alerts.push({ level: 'critical', message: `Task completion critically low: ${avg_task_completion}%`, metric: 'avg_task_completion' })
  else if (avg_task_completion < 60) alerts.push({ level: 'warning', message: `Task completion below target: ${avg_task_completion}%`, metric: 'avg_task_completion' })

  if (agent_satisfaction < 40) alerts.push({ level: 'critical', message: `Agent satisfaction critically low: ${agent_satisfaction}%`, metric: 'agent_satisfaction' })
  else if (agent_satisfaction < 60) alerts.push({ level: 'warning', message: `Agent satisfaction declining: ${agent_satisfaction}%`, metric: 'agent_satisfaction' })

  if (communication_latency > 45) alerts.push({ level: 'critical', message: `Communication latency critical: ${communication_latency}s average`, metric: 'communication_latency' })
  else if (communication_latency > 20) alerts.push({ level: 'warning', message: `Communication latency elevated: ${communication_latency}s average`, metric: 'communication_latency' })

  if (alerts.length === 0) alerts.push({ level: 'info', message: 'All metrics within healthy ranges', metric: 'all' })

  const trendDirection: HealthMonitorResult['trends']['direction'] =
    overallHealth > 0.7 ? 'improving' : overallHealth > 0.5 ? 'stable' : 'declining'

  const recommendations: string[] = []
  if (status === 'failing' || status === 'critical') {
    recommendations.push('URGENT: Initiate system-wide coordination review')
    recommendations.push('Consider reducing agent load or adding coordination resources')
  }
  if (conflict_rate > 0.2) recommendations.push('Implement proactive conflict prevention measures')
  if (communication_latency > 20) recommendations.push('Optimize communication infrastructure to reduce latency')
  if (agent_satisfaction < 60) recommendations.push('Conduct agent satisfaction survey and address root causes')
  if (avg_task_completion < 50) recommendations.push('Review task allocation and remove blockers')
  if (status === 'healthy') recommendations.push('System healthy — maintain current coordination practices')
  recommendations.push('Schedule next health check in 24 hours')

  return {
    overall_health: overallHealth,
    status,
    dashboard: {
      coordination_score,
      conflict_rate,
      avg_task_completion,
      agent_satisfaction,
      communication_latency
    },
    alerts,
    trends: {
      direction: trendDirection,
      confidence: 0.75,
      prediction: trendDirection === 'improving' ? 'Health expected to improve over next cycle' : trendDirection === 'stable' ? 'Health expected to remain stable' : 'Health declining — intervention recommended'
    },
    recommendations
  }
}

function formatHealthMonitorReport(result: HealthMonitorResult): string {
  const lines: string[] = []
  lines.push('## Coordination Health Monitor')
  lines.push('')
  lines.push(`**Overall Health:** ${(result.overall_health * 100).toFixed(0)}% | **Status:** ${result.status.toUpperCase()} | **Trend:** ${result.trends.direction}`)
  lines.push('')
  lines.push('### Dashboard')
  lines.push(`| Metric | Value | Status |`)
  lines.push(`|--------|-------|--------|`)
  lines.push(`| Coordination Score | ${result.dashboard.coordination_score}% | ${result.dashboard.coordination_score >= 70 ? 'OK' : result.dashboard.coordination_score >= 50 ? 'WARN' : 'CRITICAL'} |`)
  lines.push(`| Conflict Rate | ${(result.dashboard.conflict_rate * 100).toFixed(1)}% | ${result.dashboard.conflict_rate <= 0.15 ? 'OK' : result.dashboard.conflict_rate <= 0.3 ? 'WARN' : 'CRITICAL'} |`)
  lines.push(`| Avg Task Completion | ${result.dashboard.avg_task_completion}% | ${result.dashboard.avg_task_completion >= 60 ? 'OK' : result.dashboard.avg_task_completion >= 40 ? 'WARN' : 'CRITICAL'} |`)
  lines.push(`| Agent Satisfaction | ${result.dashboard.agent_satisfaction}% | ${result.dashboard.agent_satisfaction >= 60 ? 'OK' : result.dashboard.agent_satisfaction >= 40 ? 'WARN' : 'CRITICAL'} |`)
  lines.push(`| Communication Latency | ${result.dashboard.communication_latency}s | ${result.dashboard.communication_latency <= 20 ? 'OK' : result.dashboard.communication_latency <= 45 ? 'WARN' : 'CRITICAL'} |`)
  lines.push('')

  if (result.alerts.length > 0) {
    lines.push('### Alerts')
    for (const alert of result.alerts) {
      const icon = alert.level === 'critical' ? '🔴' : alert.level === 'warning' ? '🟡' : '🔵'
      lines.push(`${icon} [${alert.level.toUpperCase()}] ${alert.message}`)
    }
    lines.push('')
  }

  lines.push('### Trend Analysis')
  lines.push(`- Direction: ${result.trends.direction}`)
  lines.push(`- Confidence: ${(result.trends.confidence * 100).toFixed(0)}%`)
  lines.push(`- Prediction: ${result.trends.prediction}`)
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'task_decomposer',
    description: 'Decompose complex tasks into structured subtask trees with dependency mapping, complexity assessment, and parallel execution groups. Identifies critical path and provides risk analysis.',
    parameters: {
      task_description: { type: 'string', required: true, description: 'The complex task description to decompose into manageable subtasks' },
      constraints: { type: 'string', description: 'Optional JSON object with fields: max_agents (number), deadline (string), priority (1-5)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { task_description: string; constraints?: string }) {
      const constraints = args.constraints ? JSON.parse(args.constraints) : undefined
      const result = decomposeTask(args.task_description, constraints)
      return formatTaskDecompositionReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'agent_capability_matcher',
    description: 'Match agents to tasks based on capabilities, current load, and performance scores. Returns optimal assignments with confidence scores and load balancing analysis.',
    parameters: {
      agents: { type: 'string', required: true, description: 'JSON array of agent objects with fields: agent_id, capabilities (string[]), current_load (0-100), performance_score (0-100)' },
      tasks: { type: 'string', required: true, description: 'JSON array of task objects with fields: task_id, required_capabilities (string[]), complexity (1-5), priority (1-5)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { agents: string; tasks: string }) {
      const agents: AgentProfile[] = JSON.parse(args.agents)
      const tasks: TaskProfile[] = JSON.parse(args.tasks)
      const result = matchAgentCapabilities(agents, tasks)
      return formatCapabilityMatchReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'dependency_graph_builder',
    description: 'Build a task dependency graph with critical path identification, slack calculation, and topological ordering. Detects cycles and identifies bottleneck tasks.',
    parameters: {
      tasks: { type: 'string', required: true, description: 'JSON array of task objects with fields: task_id, dependencies (string[]), estimated_duration (hours), priority (1-5)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { tasks: string }) {
      const tasks = JSON.parse(args.tasks)
      const result = buildDependencyGraph(tasks)
      return formatDependencyGraphReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'consensus_mechanism_designer',
    description: 'Design consensus mechanisms for agent agreement. Generates voting rules, quorum requirements, escalation paths, and failure mode analysis based on agent count and decision type.',
    parameters: {
      consensus_input: { type: 'string', required: true, description: 'JSON object with fields: agent_count (number), decision_type (string: binary/approval/critical/safety/financial/standard), required_agreement_level (0-100), timeout_seconds (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { consensus_input: string }) {
      const input = JSON.parse(args.consensus_input)
      const result = designConsensusMechanism(input)
      return formatConsensusReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'conflict_resolver',
    description: 'Resolve conflicts between agents by analyzing conflict type, context, and proposed solutions. Returns resolution recommendations with fairness scores and action items.',
    parameters: {
      conflicts: { type: 'string', required: true, description: 'JSON array of conflict objects with fields: agent_a, agent_b, conflict_type (resource/priority/data/goal/communication), context, proposed_solutions (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { conflicts: string }) {
      const conflicts: Conflict[] = JSON.parse(args.conflicts)
      const result = resolveConflicts(conflicts)
      return formatConflictResolutionReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'progress_aggregator',
    description: 'Aggregate progress across multiple agents and tasks. Identifies bottlenecks, calculates velocity, and provides completion projections with risk assessment.',
    parameters: {
      agent_statuses: { type: 'string', required: true, description: 'JSON array of status objects with fields: agent_id, task_id, completion_pct (0-100), status (idle/working/blocked/completed), last_update (ISO string), blockers (string[])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { agent_statuses: string }) {
      const statuses: AgentStatus[] = JSON.parse(args.agent_statuses)
      const result = aggregateProgress(statuses)
      return formatProgressReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'communication_optimizer',
    description: 'Analyze inter-agent communication patterns and optimize for efficiency. Evaluates message volume, response times, channel usage, and priority distribution.',
    parameters: {
      comm_data: { type: 'string', required: true, description: 'JSON object with fields: message_count (number), avg_response_time (seconds), channel (structured/hybrid/broadcast/ad-hoc), priority_distribution (object with high/medium/low counts)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { comm_data: string }) {
      const commData: CommunicationData = JSON.parse(args.comm_data)
      const result = optimizeCommunication(commData)
      return formatCommunicationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'coordination_health_monitor',
    description: 'Monitor overall coordination health across all agents. Provides a dashboard with alerts, trend analysis, and actionable recommendations based on key metrics.',
    parameters: {
      health_data: { type: 'string', required: true, description: 'JSON object with fields: coordination_score (0-100), conflict_rate (0-1), avg_task_completion (0-100), agent_satisfaction (0-100), communication_latency (seconds)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { health_data: string }) {
      const healthData: HealthData = JSON.parse(args.health_data)
      const result = monitorCoordinationHealth(healthData)
      return formatHealthMonitorReport(result)
    }
  }))

  console.log(`[dsh-tool-agentcoord] Loaded v${VERSION} — Multi-Agent Orchestration Coordinator with 8 tools`)
  console.log('  Tools: task_decomposer, agent_capability_matcher, dependency_graph_builder, consensus_mechanism_designer, conflict_resolver, progress_aggregator, communication_optimizer, coordination_health_monitor')
}
