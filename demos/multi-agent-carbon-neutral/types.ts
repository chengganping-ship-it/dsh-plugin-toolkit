/**
 * L4 Multi-Agent Orchestration Demo — Core Types
 *
 * Shared type definitions for the carbon neutrality multi-agent workflow.
 * These types define the task execution model, agent result tracking,
 * and workflow phase structures used across the orchestrator.
 */

/** Represents a single task dispatched to a plugin agent */
export interface AgentTask {
  /** Unique task identifier */
  taskId: string
  /** Which plugin agent should execute this task */
  agentId: AgentId
  /** Which tool within the plugin to invoke */
  toolName: string
  /** JSON input_data string for the tool */
  input: string
  /** Task IDs that must complete before this task can run */
  dependencies?: string[]
}

/** Result returned by an agent task execution */
export interface AgentResult {
  taskId: string
  agentId: AgentId
  toolName: string
  output: string
  durationMs: number
  tokenEstimate: number
  timestamp: number
}

/** Consolidated phase output that feeds into the next phase */
export interface PhaseOutput {
  phaseId: number
  phaseName: string
  results: AgentResult[]
  summary: string
  durationMs: number
  tokenEstimate: number
}

/** Final consolidated carbon neutrality plan */
export interface NeutralityPlan {
  title: string
  generatedAt: string
  totalDurationMs: number
  totalTokenEstimate: number
  totalAgentCalls: number
  phaseOutputs: PhaseOutput[]
  consolidatedReport: string
  executionTimeline: ExecutionTimelineEntry[]
}

/** Timeline entry for execution tracing */
export interface ExecutionTimelineEntry {
  taskId: string
  agentId: AgentId
  toolName: string
  startedAt: number
  endedAt: number
  durationMs: number
  dependencies: string[]
  status: 'completed' | 'failed' | 'running' | 'pending'
}

/** The 5 agent IDs orchestrated in this demo */
export type AgentId =
  | 'carbontradingagent'
  | 'energyagentpro'
  | 'manufacturingagent'
  | 'ecoagentpro'
  | 'wealthagentpro'

/** Agent metadata for display and cost tracking */
export interface AgentMetadata {
  id: AgentId
  displayName: string
  description: string
  toolsUsed: string[]
  color: string
}

/** Workflow phase definition */
export interface WorkflowPhase {
  id: number
  name: string
  description: string
  tasks: AgentTask[]
}
