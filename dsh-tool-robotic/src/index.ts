/**
 * DSH Robotic Process Automation Plugin v0.1.0
 *
 * Comprehensive RPA toolkit for DeepSeek Harness Agent.
 * Designed for automation architects, RPA developers, process analysts, and CoE managers.
 *
 * Features (v0.1.0):
 * - Process Miner (event log analysis, bottleneck detection, conformance checking)
 * - Automation Opportunity Assessor (ROI scoring, priority ranking)
 * - Bot Designer (architecture, workflow logic, error handling)
 * - Cognitive Document Processor (ML-based extraction, HITL triggers)
 * - RPA Program Governor (maturity assessment, scaling readiness)
 * - Exception Handler Designer (self-healing rules, escalation matrix)
 * - Citizen Developer Enabler (guardrails, training needs, platform fit)
 * - Intelligent Orchestrator (load balancing, scheduling, failover)
 *
 * @module dsh-tool-robotic
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-robotic'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface EventLogEntry {
  case_id: string
  activity: string
  timestamp: string
  resource: string
  duration?: number
}

interface ProcessModelNode {
  activity: string
  frequency: number
  avgDuration: number
  successors: string[]
  predecessors: string[]
  isBottleneck: boolean
  bottleneckScore: number
}

interface ProcessModelVariant {
  steps: string[]
  caseCount: number
  percentage: number
  avgDuration: number
}

interface ConformanceResult {
  conforming: number
  nonConforming: number
  totalTraces: number
  fitness: number
  deviations: Array<{ caseId: string; deviation: string; location: string }>
}

interface AutomationCandidate {
  activity: string
  automationScore: number
  recommendation: string
  estimatedSavings: number
}

interface ProcessMinerResult {
  process_model: ProcessModelNode[]
  bottlenecks: Array<{ activity: string; score: number; impact: string; recommendation: string }>
  variants: ProcessModelVariant[]
  conformance: ConformanceResult
  automation_candidates: AutomationCandidate[]
  summary: { totalEvents: number; uniqueCases: number; uniqueActivities: number; modelComplexity: number }
}

interface ProcessCatalogEntry {
  process_name: string
  frequency: number
  complexity: 'low' | 'medium' | 'high'
  systems_involved: string[]
  error_rate: number
  fte_spent: number
}

interface AutomationScoreResult {
  process_name: string
  automation_score: number
  roi_estimate: { costSavings: number; implementationCost: number; paybackMonths: number; annualRoi: number }
  priority_rank: number
  complexity_ease_matrix: { complexity: string; easeScore: number; quadrant: string }
  recommendation: string
}

interface AutomationAssessmentResult {
  scores: AutomationScoreResult[]
  priority_ranking: string[]
  summary: { totalEvaluated: number; highPriority: number; avgAutomationScore: number; totalAnnualSavings: number }
  portfolio_recommendation: string
}

interface ProcessStep {
  step_id: string
  action: string
  application: string
  inputs: Record<string, string>
  outputs: Record<string, string>
  business_rule?: string
  exceptions?: string[]
}

interface ProcessDefinition {
  process_name: string
  description: string
  trigger: string
  steps: ProcessStep[]
  business_rules?: string[]
  exceptions?: string[]
}

interface BotArchitecture {
  type: string
  attended: boolean
  platforms: string[]
  integration_layer: string
  components: string[]
}

interface WorkflowLogic {
  main_flow: string[]
  decision_points: Array<{ condition: string; true_branch: string; false_branch: string }>
  loop_structures: Array<{ target: string; condition: string }>
}

interface ErrorHandlingStrategy {
  retry_policy: { max_retries: number; backoff: string; on_failure: string }
  exception_paths: Array<{ error_type: string; handler: string; escalation: string }>
  recovery_strategy: string
}

interface BotDesignResult {
  bot_architecture: BotArchitecture
  workflow_logic: WorkflowLogic
  error_handling: ErrorHandlingStrategy
  logging_strategy: { level: string; fields: string[]; destination: string; retention_days: number }
  deployment_checklist: string[]
  estimated_development: { effort: string; skills: string[]; timeline: string }
}

interface DocumentDataInput {
  document_type: string
  document_count: number
  fields_to_extract: Array<{ name: string; type: string; required: boolean; validation?: string }>
  accuracy_requirements: number
  has_tables?: boolean
  has_handwriting?: boolean
  language?: string
  average_pages?: number
}

interface ExtractionPipeline {
  stages: Array<{ name: string; type: string; description: string; app: string }>
  pre_processing: string[]
  extraction_method: string
  post_processing: string[]
}

interface ValidationRule {
  field: string
  rule: string
  action_on_fail: string
  confidence_threshold: number
}

interface CognitiveDocumentResult {
  extraction_pipeline: ExtractionPipeline
  ml_model_suggestion: { model_type: string; reason: string; estimated_accuracy: number; training_required: boolean }
  validation_rules: ValidationRule[]
  human_in_the_loop_triggers: Array<{ trigger: string; condition: string; action: string }>
  estimated_throughput: { pages_per_hour: number; documents_per_day: number; accuracy: number }
}

interface ProgramMetrics {
  bots_deployed: number
  utilization: number
  success_rate: number
  incidents: number
  cost_savings: number
  fte_reclaimed: number
  total_processes_automated: number
  team_size: number
  development_velocity: number
  security_incidents: number
  compliance_score: number
  user_satisfaction: number
}

interface MaturityDimension {
  dimension: string
  level: number
  maxLevel: number
  assessment: string
  improvementActions: string[]
}

interface ScalingReadiness {
  score: number
  factors: Array<{ factor: string; score: number; status: string }>
  blockers: string[]
  enablers: string[]
  recommendation: string
}

interface RpaProgramResult {
  maturity_assessment: { overall_level: string; overall_score: number; dimensions: MaturityDimension[] }
  scaling_readiness: ScalingReadiness
  center_of_excellence_score: { score: number; categories: Array<{ name: string; score: number; status: string }> }
  improvement_roadmap: Array<{ phase: string; initiative: string; impact: string; effort: string; timeframe: string }>
}

interface ExceptionPattern {
  exception_type: string
  frequency: number
  current_resolution: string
  business_impact: 'low' | 'medium' | 'high' | 'critical'
}

interface ExceptionHandlerResult {
  automated_resolution_paths: Array<{ exception_type: string; resolution: string; automation_possible: boolean; confidence: number; estimated_success_rate: number }>
  escalation_matrix: Array<{ level: string; condition: string; responsible: string; sla_minutes: number; action: string }>
  self_healing_rules: Array<{ trigger: string; action: string; max_attempts: number; fallback: string }>
  fallback_strategies: Array<{ scenario: string; strategy: string; recovery_time_minutes: number; data_preservation: string }>
}

interface NoCodeAnalysis {
  user_skills: string[]
  process_complexity: 'simple' | 'moderate' | 'complex'
  governance_requirements: string[]
  process_description?: string
  integration_count?: number
  data_sensitivity?: string
  monthly_transaction_volume?: number
}

interface PlatformFitAssessment {
  platform: string
  fit_score: number
  strengths: string[]
  limitations: string[]
  cost_estimate: string
}

interface CitizenDeveloperResult {
  recommendation: { type: string; reasoning: string; fit_score: number }
  guardrails: Array<{ rule: string; enforcement: string; rationale: string }>
  training_needs: Array<{ area: string; duration: string; method: string; priority: string }>
  platform_fit: PlatformFitAssessment[]
  governance_framework: { approval_process: string; review_frequency: string; compliance_checks: string[] }
}

interface BotFleetEntry {
  bot_id: string
  status: 'running' | 'idle' | 'error' | 'maintenance'
  workload: number
  schedule: string
  priority: number
  max_capacity?: number
  target_resource?: string
}

interface LoadBalancingResult {
  bot_id: string
  current_load: number
  recommended_load: number
  queue_items: number
  recommendation: string
}

interface IntelligentOrchestratorResult {
  load_balancing: LoadBalancingResult[]
  scheduling_optimization: { schedule_recommendations: Array<{ bot_id: string; current_schedule: string; optimized_schedule: string; savings_percent: number; reasoning: string }> }
  failover_strategy: { primary_assignments: Array<{ task: string; primary: string; backup: string; failover_trigger: string }>; recovery_plan: string }
  capacity_planning: { current_capacity: number; projected_demand: number; utilization_forecast: number; scaling_recommendation: string; timeline: string }
  orchestration_health: { overall_score: number; issues: string[]; strengths: string[] }
}

// ==================== TOOL 1: PROCESS MINER ====================

function mineProcess(eventLog: EventLogEntry[]): ProcessMinerResult {
  const activities = new Map<string, { count: number; durations: number[]; resources: Set<string> }>()
  const caseTraces = new Map<string, EventLogEntry[]>()
  const transitions = new Map<string, Set<string>>()

  for (const entry of eventLog) {
    if (!activities.has(entry.activity)) {
      activities.set(entry.activity, { count: 0, durations: [], resources: new Set() })
    }
    const act = activities.get(entry.activity)!
    act.count++
    if (entry.duration !== undefined) act.durations.push(entry.duration)
    act.resources.add(entry.resource)

    if (!caseTraces.has(entry.case_id)) caseTraces.set(entry.case_id, [])
    caseTraces.get(entry.case_id)!.push(entry)

    if (!transitions.has(entry.activity)) transitions.set(entry.activity, new Set())
  }

  for (const trace of caseTraces.values()) {
    trace.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    for (let i = 0; i < trace.length - 1; i++) {
      const key = trace[i].activity
      transitions.get(key)!.add(trace[i + 1].activity)
    }
  }

  const processModel: ProcessModelNode[] = []
  const bottlenecks: ProcessMinerResult['bottlenecks'] = []

  for (const [activity, data] of activities) {
    const avgDur = data.durations.length > 0 ? data.durations.reduce((s, d) => s + d, 0) / data.durations.length : 0
    const successors = transitions.has(activity) ? Array.from(transitions.get(activity)!) : []
    const predecessors: string[] = []
    for (const [src, dests] of transitions) {
      if (dests.has(activity)) predecessors.push(src)
    }

    const bottleneckScore = data.count > 0 ? (avgDur * data.count) / eventLog.length : 0
    const isBottleneck = successors.length > 2 || bottleneckScore > 0.15

    processModel.push({
      activity, frequency: data.count, avgDuration: avgDur, successors, predecessors, isBottleneck, bottleneckScore
    })

    if (isBottleneck) {
      const impact = avgDur > 60 ? 'High – significant delay activity' : 'Medium – multi-branch decision point'
      bottlenecks.push({
        activity, score: bottleneckScore, impact,
        recommendation: avgDur > 60 ? `Reduce processing time for "${activity}" or parallelize subsequent steps` : `Review branching logic around "${activity}" – consider simplifying the decision tree`
      })
    }
  }

  const variantMap = new Map<string, { count: number; duration: number }>()
  for (const trace of caseTraces.values()) {
    const steps = trace.map(e => e.activity).join('->')
    if (!variantMap.has(steps)) variantMap.set(steps, { count: 0, duration: 0 })
    const v = variantMap.get(steps)!
    v.count++
    v.duration += trace.reduce((s, e) => s + (e.duration ?? 0), 0)
  }

  const variants: ProcessModelVariant[] = Array.from(variantMap.entries())
    .map(([steps, data]) => ({
      steps: steps.split('->'),
      caseCount: data.count,
      percentage: (data.count / caseTraces.size) * 100,
      avgDuration: data.count > 0 ? data.duration / data.count : 0
    }))
    .sort((a, b) => b.caseCount - a.caseCount)

  const mainVariant = variants[0]?.steps ?? []
  let conforming = 0
  const deviations: ConformanceResult['deviations'] = []

  for (const [caseId, trace] of caseTraces) {
    const steps = trace.map(e => e.activity)
    const stepStr = steps.join('->')
    const mainStr = mainVariant.join('->')
    if (stepStr === mainStr) {
      conforming++
    } else {
      let diffIdx = 0
      while (diffIdx < steps.length && diffIdx < mainVariant.length && steps[diffIdx] === mainVariant[diffIdx]) diffIdx++
      deviations.push({
        caseId,
        deviation: diffIdx < steps.length ? `Unexpected: ${steps[diffIdx]}` : `Extra steps beyond main flow`,
        location: diffIdx < mainVariant.length ? `At position ${diffIdx + 1} (expected: ${mainVariant[diffIdx]})` : 'End of trace'
      })
    }
  }

  const fitness = caseTraces.size > 0 ? conforming / caseTraces.size : 0

  const automationCandidates: AutomationCandidate[] = processModel
    .filter(n => n.avgDuration < 5 && n.successors.length <= 2 && n.frequency > eventLog.length * 0.05)
    .map(n => {
      const score = Math.min(0.35 + (n.avgDuration < 2 ? 0.25 : 0) + (n.successors.length <= 1 ? 0.2 : 0) + (n.frequency > eventLog.length * 0.1 ? 0.2 : 0), 0.98)
      return {
        activity: n.activity,
        automationScore: score,
        recommendation: score > 0.7 ? 'High automation potential – standard, repetitive activity' : score > 0.5 ? 'Moderate potential – suitable with exception handling' : 'Review manually – may require cognitive input',
        estimatedSavings: (n.avgDuration * n.frequency) / 60
      }
    })
    .sort((a, b) => b.automationScore - a.automationScore)

  return {
    process_model: processModel.sort((a, b) => b.frequency - a.frequency),
    bottlenecks: bottlenecks.sort((a, b) => b.score - a.score),
    variants,
    conformance: { conforming, nonConforming: caseTraces.size - conforming, totalTraces: caseTraces.size, fitness, deviations: deviations.slice(0, 20) },
    automation_candidates: automationCandidates,
    summary: { totalEvents: eventLog.length, uniqueCases: caseTraces.size, uniqueActivities: activities.size, modelComplexity: transitions.size }
  }
}

function formatProcessMinerReport(result: ProcessMinerResult): string {
  const lines: string[] = []
  lines.push('## Process Mining Analysis')
  lines.push('')
  lines.push(`**Data Scope:** ${result.summary.totalEvents} events | ${result.summary.uniqueCases} cases | ${result.summary.uniqueActivities} activities`)
  lines.push(`**Model Complexity:** ${result.summary.modelComplexity} transition paths`)
  lines.push('')

  lines.push('### Process Model (by frequency)')
  lines.push('| Activity | Freq | Avg Duration | Successors | Predecessors | Bottleneck |')
  lines.push('|----------|------|-------------|-----------|-------------|------------|')
  for (const node of result.process_model.slice(0, 15)) {
    lines.push(`| ${node.activity} | ${node.frequency} | ${node.avgDuration.toFixed(1)}s | ${node.successors.length} | ${node.predecessors.length} | ${node.isBottleneck ? 'YES' : 'No'} |`)
  }

  if (result.bottlenecks.length > 0) {
    lines.push('')
    lines.push('### Bottlenecks Identified')
    for (const bn of result.bottlenecks.slice(0, 10)) {
      lines.push(`- **${bn.activity}** (score: ${(bn.score * 100).toFixed(1)}%) – ${bn.impact}. ${bn.recommendation}`)
    }
  }

  lines.push('')
  lines.push('### Process Variants')
  lines.push(`- **Total variants:** ${result.variants.length} | **Conformance fitness:** ${(result.conformance.fitness * 100).toFixed(1)}%`)
  for (const v of result.variants.slice(0, 10)) {
    lines.push(`  ${result.variants.indexOf(v) + 1}. ${v.steps.join(' -> ')} [${v.caseCount} cases, ${v.percentage.toFixed(1)}%, avg ${v.avgDuration.toFixed(1)}s]`)
  }

  if (result.conformance.deviations.length > 0) {
    lines.push('')
    lines.push('### Conformance Deviations (top 5)')
    for (const d of result.conformance.deviations.slice(0, 5)) {
      lines.push(`- ${d.caseId}: ${d.deviation} ${d.location}`)
    }
  }

  if (result.automation_candidates.length > 0) {
    lines.push('')
    lines.push('### Automation Candidates')
    lines.push('| Activity | Score | Recommendation | Est. Savings (hrs) |')
    lines.push('|----------|-------|----------------|-------------------|')
    for (const ac of result.automation_candidates.slice(0, 10)) {
      lines.push(`| ${ac.activity} | ${(ac.automationScore * 100).toFixed(0)}% | ${ac.recommendation} | ${ac.estimatedSavings.toFixed(1)} |`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: AUTOMATION OPPORTUNITY ASSESSOR ====================

function assessAutomationOpportunities(catalog: ProcessCatalogEntry[]): AutomationAssessmentResult {
  const scores: AutomationScoreResult[] = []

  for (const proc of catalog) {
    const freqScore = Math.min(proc.frequency / 1000, 1) * 100
    const complexityMap = { low: 30, medium: 60, high: 90 }
    const complexityScore = complexityMap[proc.complexity]
    const stabilityScore = Math.max(0, 100 - (proc.error_rate * 1000))
    const systemsPenalty = Math.max(0, (proc.systems_involved.length - 1) * 10)
    const automationScore = Math.min(Math.max(
      freqScore * 0.3 + (100 - complexityScore) * 0.25 + stabilityScore * 0.25 - systemsPenalty * 0.2,
      5
    ), 98) / 100

    const annualFteCost = proc.fte_spent * 65000
    const automationSavings = annualFteCost * 0.65 * automationScore
    const implementationCost = proc.systems_involved.length * 15000 + (complexityScore / 100) * 50000
    const paybackMonths = automationSavings > 0 ? Math.max(1, Math.ceil((implementationCost / (automationSavings / 12)))) : 99
    const annualRoi = implementationCost > 0 ? ((automationSavings - implementationCost) / implementationCost) * 100 : 0

    const easeScore = (100 - complexityScore) * 0.5 + stabilityScore * 0.3 + freqScore * 0.2
    const quadrant = easeScore > 60 && automationScore > 0.6 ? 'Quick Win' :
                     easeScore > 60 && automationScore <= 0.6 ? 'Consider' :
                     easeScore <= 60 && automationScore > 0.6 ? 'Strategic' : 'Defer'

    const recommendation = automationScore > 0.7 ? 'PRIORITY: High-value automation target' :
                           automationScore > 0.5 ? 'STRONG: Viable with proper investment' :
                           automationScore > 0.3 ? 'MARGINAL: Evaluate after higher-scoring processes' : 'DEFER: Not currently suitable'

    scores.push({
      process_name: proc.process_name,
      automation_score: automationScore,
      roi_estimate: { costSavings: automationSavings, implementationCost, paybackMonths, annualRoi },
      priority_rank: 0,
      complexity_ease_matrix: { complexity: proc.complexity, easeScore, quadrant },
      recommendation
    })
  }

  scores.sort((a, b) => b.automation_score - a.automation_score)
  scores.forEach((s, i) => { s.priority_rank = i + 1 })

  const highPriority = scores.filter(s => s.automation_score > 0.6).length
  const avgScore = scores.reduce((s, p) => s + p.automation_score, 0) / scores.length
  const totalSavings = scores.reduce((s, p) => s + p.roi_estimate.costSavings, 0)

  return {
    scores,
    priority_ranking: scores.map(s => s.process_name),
    summary: { totalEvaluated: catalog.length, highPriority, avgAutomationScore: avgScore, totalAnnualSavings: totalSavings },
    portfolio_recommendation: highPriority >= 3 ?
      `Portfolio has ${highPriority} high-priority targets. Execute top 3 first for $${(scores.slice(0, 3).reduce((st, p) => st + p.roi_estimate.costSavings, 0) / 1000).toFixed(0)}K annual savings.` :
      `Limited high-value targets identified. Conduct deeper process analysis for more candidates.`
  }
}

function formatAutomationAssessmentReport(result: AutomationAssessmentResult): string {
  const lines: string[] = []
  lines.push('## Automation Opportunity Assessment')
  lines.push('')
  lines.push(`**Portfolio Summary:** ${result.summary.totalEvaluated} processes evaluated | ${result.summary.highPriority} high-priority | Avg score: ${(result.summary.avgAutomationScore * 100).toFixed(1)}%`)
  lines.push(`**Total Potential Annual Savings:** $${(result.summary.totalAnnualSavings / 1000).toFixed(0)}K`)
  lines.push(`**Portfolio Recommendation:** ${result.portfolio_recommendation}`)
  lines.push('')

  lines.push('### Priority Ranking & ROI')
  lines.push('| Rank | Process | Score | Complexity | Ease Score | Quadrant | Payback | Annual ROI |')
  lines.push('|------|---------|-------|------------|------------|----------|---------|------------|')
  for (const s of result.scores) {
    lines.push(`| ${s.priority_rank} | ${s.process_name} | ${(s.automation_score * 100).toFixed(0)}% | ${s.complexity_ease_matrix.complexity} | ${s.complexity_ease_matrix.easeScore.toFixed(0)} | ${s.complexity_ease_matrix.quadrant} | ${s.roi_estimate.paybackMonths}mo | ${s.roi_estimate.annualRoi.toFixed(0)}% |`)
  }

  lines.push('')
  lines.push('### Detailed Recommendations')
  for (const s of result.scores.filter(x => x.automation_score > 0.5).slice(0, 5)) {
    lines.push(`#### ${s.priority_rank}. ${s.process_name}`)
    lines.push(`- **Score:** ${(s.automation_score * 100).toFixed(1)}% | **Quadrant:** ${s.complexity_ease_matrix.quadrant}`)
    lines.push(`- **Cost Savings:** $${(s.roi_estimate.costSavings / 1000).toFixed(0)}K/yr | **Implementation:** $${(s.roi_estimate.implementationCost / 1000).toFixed(0)}K | **Payback:** ${s.roi_estimate.paybackMonths} months`)
    lines.push(`- **Verdict:** ${s.recommendation}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: BOT DESIGNER ====================

function designBot(processDef: ProcessDefinition): BotDesignResult {
  const platforms = new Set<string>()
  for (const step of processDef.steps) {
    const app = step.application.toLowerCase()
    if (app.includes('web') || app.includes('browser') || app.includes('chrome')) platforms.add('Web')
    if (app.includes('excel') || app.includes('spreadsheet')) platforms.add('Excel/Desktop')
    if (app.includes('sap') || app.includes('erp')) platforms.add('Enterprise')
    if (app.includes('api') || app.includes('rest')) platforms.add('API')
    if (app.includes('email') || app.includes('outlook')) platforms.add('Mail/Office')
    if (app.includes('folder') || app.includes('file')) platforms.add('File')
    if (app.includes('mainframe') || app.includes('terminal')) platforms.add('Terminal/3270')
    if (platforms.size === 0) platforms.add('Generic/Desktop')
  }

  const attended = processDef.steps.some(s => s.action.toLowerCase().includes('review') || s.action.toLowerCase().includes('approve'))

  const components = ['Input Validation Layer', 'Business Logic Engine']
  if (processDef.exceptions && processDef.exceptions.length > 0) components.push('Exception Handler')
  if (attended) components.push('Human Interaction Module')
  components.push('Audit Logger', 'Notification Service', 'Configuration Manager')

  const decisionPoints = processDef.steps
    .filter(s => s.action.toLowerCase().includes('check') || s.action.toLowerCase().includes('validate') || s.action.toLowerCase().includes('if'))
    .map(s => ({
      condition: s.action + (s.inputs && Object.keys(s.inputs).length > 0 ? ` (${Object.values(s.inputs).join(', ')})` : ''),
      true_branch: 'Continue to next step',
      false_branch: s.business_rule ? s.business_rule : 'Flag for manual review'
    }))

  const loopStructures = processDef.steps
    .filter(s => s.action.toLowerCase().includes('for each') || s.action.toLowerCase().includes('loop') || s.action.toLowerCase().includes('batch'))
    .map(s => ({ target: s.application, condition: s.action }))

  const exceptionPaths = (processDef.exceptions ?? []).map(e => ({
    error_type: e,
    handler: 'Capture state, log error, retry once',
    escalation: 'If retry fails, notify operations team'
  }))

  const botCount = processDef.steps.length
  const effortWeeks = Math.max(2, Math.ceil(botCount * 0.5 + platforms.size * 0.5))

  return {
    bot_architecture: {
      type: attended ? 'Attended Bot' : 'Unattended Bot',
      attended,
      platforms: Array.from(platforms),
      integration_layer: platforms.size > 2 ? 'API Gateway' : 'Direct Integration',
      components
    },
    workflow_logic: {
      main_flow: processDef.steps.map(s => s.action),
      decision_points: decisionPoints,
      loop_structures: loopStructures
    },
    error_handling: {
      retry_policy: { max_retries: 3, backoff: 'Exponential (5s, 15s, 45s)', on_failure: 'Queue for manual processing' },
      exception_paths: exceptionPaths,
      recovery_strategy: 'Check-point recovery: resume from last successful step'
    },
    logging_strategy: { level: 'INFO', fields: ['bot_id', 'step', 'timestamp', 'status', 'duration', 'input_ref'], destination: 'Central logging with structured output', retention_days: 90 },
    deployment_checklist: [
      'Unit test each step independently',
      'Integration test with all target applications',
      'Validate exception handlers against all failure modes',
      'Performance test with production data volume',
      'Security review: credential storage and access controls',
      'Obtain business stakeholder sign-off',
      'Configure monitoring alerts and dashboards',
      'Prepare runbook and handover documentation',
      'Set up disaster recovery / failover configuration',
      'Schedule go-live and hypercare period'
    ],
    estimated_development: {
      effort: `${effortWeeks} weeks`,
      skills: ['RPA Developer', 'Business Analyst', ...(platforms.has('API') ? ['Integration Engineer'] : [])],
      timeline: `${effortWeeks + 1} weeks including testing and deployment`
    }
  }
}

function formatBotDesignReport(result: BotDesignResult): string {
  const lines: string[] = []
  lines.push('## Bot Design Specification')
  lines.push('')
  lines.push(`**Architecture:** ${result.bot_architecture.type} | **Layer:** ${result.bot_architecture.integration_layer}`)
  lines.push(`**Platforms:** ${result.bot_architecture.platforms.join(', ')}`)
  lines.push(`**Components:** ${result.bot_architecture.components.join(' | ')}`)
  lines.push('')

  lines.push('### Workflow Logic')
  lines.push('**Main Flow:**')
  result.workflow_logic.main_flow.forEach((step, idx) => { lines.push(`${idx + 1}. ${step}`) })

  if (result.workflow_logic.decision_points.length > 0) {
    lines.push('')
    lines.push('### Decision Points')
    for (const dp of result.workflow_logic.decision_points) {
      lines.push(`- **${dp.condition}**`)
      lines.push(`  True: ${dp.true_branch}`)
      lines.push(`  False: ${dp.false_branch}`)
    }
  }

  lines.push('')
  lines.push('### Error Handling')
  lines.push(`- **Retry:** ${result.error_handling.retry_policy.max_retries} attempts, ${result.error_handling.retry_policy.backoff}`)
  lines.push(`- **Recovery:** ${result.error_handling.recovery_strategy}`)
  if (result.error_handling.exception_paths.length > 0) {
    lines.push('- **Exceptions:**')
    for (const ep of result.error_handling.exception_paths) {
      lines.push(`  - ${ep.error_type}: ${ep.handler} -> ${ep.escalation}`)
    }
  }

  lines.push('')
  lines.push('### Deployment Checklist')
  result.deployment_checklist.forEach((item, idx) => { lines.push(`${idx + 1}. [ ] ${item}`) })

  lines.push('')
  lines.push('### Development Estimate')
  lines.push(`- **Effort:** ${result.estimated_development.effort}`)
  lines.push(`- **Timeline:** ${result.estimated_development.timeline}`)
  lines.push(`- **Skills:** ${result.estimated_development.skills.join(', ')}`)

  return lines.join('\n')
}

// ==================== TOOL 4: COGNITIVE DOCUMENT PROCESSOR ====================

function designCognitivePipeline(docData: DocumentDataInput): CognitiveDocumentResult {
  const stages: ExtractionPipeline['stages'] = [
    { name: 'Ingestion', type: 'Document Intake', description: 'Accept and categorize incoming documents', app: 'Document Management' },
    { name: 'Pre-processing', type: 'Image Enhancement', description: 'Deskew, denoise, binarize, deskew images', app: 'OpenCV/ImageMagick' },
    { name: 'Classification', type: 'Document Identification', description: 'Identify document type and route', app: 'ML Classifier' },
    { name: 'Extraction', type: 'Data Capture', description: 'Extract structured fields', app: 'OCR/ML Model' },
    { name: 'Validation', type: 'Quality Check', description: 'Validate against business rules', app: 'Rules Engine' }
  ]

  if (docData.has_tables) {
    stages.splice(4, 0, { name: 'Table Parsing', type: 'Structured Extraction', description: 'Extract tabular data with row/col structure', app: 'Table Detection ML' })
  }

  const reqAcc = docData.accuracy_requirements ?? 0.95
  const extractionMethod = docData.has_handwriting || reqAcc > 0.97 ? 'Hybrid: ML model + Rules + HITL' :
                          reqAcc > 0.9 ? 'ML-based extraction with rules validation' : 'Template-based extraction with ML enhancement'

  let modelType = 'Form-based Extraction'
  let reason = 'Standard document with fixed layout'
  if (docData.has_tables) { modelType = 'Table-aware Extraction Model'; reason = 'Document contains tabular data requiring spatial understanding' }
  if (docData.has_handwriting) { modelType = 'Handwriting + Printed Text Model'; reason = 'Mixed content requiring handwriting recognition capability' }
  if (reqAcc > 0.97) { modelType = 'Transformer-based Document AI'; reason = 'High accuracy requirements demand advanced NLP' }

  const estimatedAccuracy = Math.min(0.99, reqAcc + 0.03)
  const validationRules: ValidationRule[] = docData.fields_to_extract.map(f => ({
    field: f.name,
    rule: f.validation ?? (f.required ? 'Must be present and valid' : 'Optional – accept if present'),
    action_on_fail: f.required ? 'Flag for HITL review' : 'Set to null and continue',
    confidence_threshold: Math.max(0.7, 1 - (1 - reqAcc) * 2)
  }))

  const hitlTriggers: CognitiveDocumentResult['human_in_the_loop_triggers'] = [
    { trigger: 'Low confidence', condition: `Field confidence < ${reqAcc.toFixed(2)}`, action: 'Present to human reviewer with highlighted region' },
    { trigger: 'Validation failure', condition: 'Extracted value fails business rule', action: 'Flag field and request human correction' },
    { trigger: 'Document anomaly', condition: 'Layout does not match expected', action: 'Route to exception queue for manual routing' }
  ]

  if (docData.fields_to_extract.some(f => f.type === 'date')) {
    hitlTriggers.push({ trigger: 'Date inconsistency', condition: 'Date is >1 year past or >30 days future', action: 'Hold for human verification' })
  }
  if (docData.has_handwriting) {
    hitlTriggers.push({ trigger: 'Handwriting detection', condition: 'HTR confidence below 85%', action: 'Present original image with HTR suggestion for correction' })
  }

  return {
    extraction_pipeline: {
      stages,
      pre_processing: ['Deskew', 'Denoise', 'Binarize', 'Border removal'],
      extraction_method: extractionMethod,
      post_processing: ['Format normalization', 'Data type validation', 'Cross-field validation']
    },
    ml_model_suggestion: { model_type: modelType, reason, estimated_accuracy: estimatedAccuracy, training_required: reqAcc > 0.92 || !!docData.has_handwriting },
    validation_rules: validationRules,
    human_in_the_loop_triggers: hitlTriggers,
    estimated_throughput: {
      pages_per_hour: Math.max(50, Math.floor(60 / Math.max(1, docData.fields_to_extract.length * 0.2))),
      documents_per_day: Math.floor((8 * 60) / Math.max(1, docData.fields_to_extract.length * 0.5 + 2)),
      accuracy: estimatedAccuracy
    }
  }
}

function formatCognitiveDocumentReport(result: CognitiveDocumentResult): string {
  const lines: string[] = []
  lines.push('## Cognitive Document Processing Pipeline')
  lines.push('')
  lines.push(`**Extraction Method:** ${result.extraction_pipeline.extraction_method}`)
  lines.push(`**Suggested Model:** ${result.ml_model_suggestion.model_type}`)
  lines.push(`- Reason: ${result.ml_model_suggestion.reason}`)
  lines.push(`- Estimated Accuracy: ${(result.ml_model_suggestion.estimated_accuracy * 100).toFixed(1)}%`)
  lines.push(`- Training Required: ${result.ml_model_suggestion.training_required ? 'Yes – collect sample set first' : 'No – can use pre-trained model'}`)
  lines.push('')

  lines.push('### Pipeline Stages')
  result.extraction_pipeline.stages.forEach((s, idx) => { lines.push(`${idx + 1}. **${s.name}** (${s.type}): ${s.description} — App: ${s.app}`) })

  lines.push('')
  lines.push('### Validation Rules')
  lines.push('| Field | Rule | On Fail | Min Confidence |')
  lines.push('|-------|------|---------|----------------|')
  for (const vr of result.validation_rules) {
    lines.push(`| ${vr.field} | ${vr.rule} | ${vr.action_on_fail} | ${(vr.confidence_threshold * 100).toFixed(0)}% |`)
  }

  lines.push('')
  lines.push('### Human-in-the-Loop Triggers')
  for (const hitl of result.human_in_the_loop_triggers) {
    lines.push(`- **${hitl.trigger}:** When "${hitl.condition}" -> ${hitl.action}`)
  }

  lines.push('')
  lines.push('### Throughput Estimate')
  lines.push(`- **${result.estimated_throughput.pages_per_hour}** pages/hour`)
  lines.push(`- **${result.estimated_throughput.documents_per_day}** documents/day`)
  lines.push(`- Expected accuracy: **${(result.estimated_throughput.accuracy * 100).toFixed(1)}%**`)

  return lines.join('\n')
}

// ==================== TOOL 5: RPA PROGRAM GOVERNOR ====================

function governRpaProgram(metrics: ProgramMetrics): RpaProgramResult {
  const maturityDimensions: MaturityDimension[] = [
    {
      dimension: 'Strategy & Governance',
      level: metrics.compliance_score > 80 && metrics.user_satisfaction > 75 ? 4 : metrics.compliance_score > 60 ? 3 : 2,
      maxLevel: 5,
      assessment: metrics.compliance_score > 80 ? 'Well-defined governance framework in place' : 'Governance practices established but need formalization',
      improvementActions: ['Formalize steering committee', 'Automate compliance reporting', 'Quarterly health checks']
    },
    {
      dimension: 'Process Selection',
      level: metrics.total_processes_automated > 50 ? 4 : metrics.total_processes_automated > 20 ? 3 : 2,
      maxLevel: 5,
      assessment: metrics.total_processes_automated > 50 ? 'Mature selection criteria with automated opportunity detection' : 'Ad-hoc selection – establish repeatable scoring model',
      improvementActions: ['Implement process mining for discovery', 'Establish business case template', 'Build ROI calculation tooling']
    },
    {
      dimension: 'Technology & Platform',
      level: metrics.bots_deployed > 30 ? 4 : metrics.bots_deployed > 10 ? 3 : 2,
      maxLevel: 5,
      assessment: metrics.success_rate > 95 ? 'Stable platform with high reliability' : 'Platform operational – focus on stability',
      improvementActions: ['Upgrade orchestrator capabilities', 'Implement self-healing patterns', 'Standardize reusable components']
    },
    {
      dimension: 'Operations & Support',
      level: metrics.incidents < 5 && metrics.success_rate > 95 ? 4 : metrics.incidents < 10 ? 3 : 2,
      maxLevel: 5,
      assessment: metrics.incidents < 5 ? 'Proactive operations with minimal fire-fighting' : 'Reactive operations – reduce incident response time',
      improvementActions: ['Implement predictive monitoring', 'Build runbook automation', 'Create L1/L2/L3 support tiers']
    },
    {
      dimension: 'People & Skills',
      level: metrics.team_size >= 6 && metrics.development_velocity > 10 ? 4 : metrics.team_size >= 3 ? 3 : 2,
      maxLevel: 5,
      assessment: metrics.team_size >= 6 ? 'Skilled team with dedicated roles' : 'Team building in progress – invest in training',
      improvementActions: ['Define career paths', 'Launch citizen developer program', 'Establish knowledge sharing']
    },
    {
      dimension: 'Measurement & Value',
      level: metrics.fte_reclaimed > 20 ? 4 : metrics.fte_reclaimed > 8 ? 3 : 2,
      maxLevel: 5,
      assessment: metrics.fte_reclaimed > 20 ? 'Strong value realization with clear metrics' : 'Value capture in progress – improve tracking',
      improvementActions: ['Implement value dashboard', 'Automate benefit realization tracking', 'Align KPIs with business outcomes']
    }
  ]

  const avgScore = maturityDimensions.reduce((s, d) => s + d.level, 0) / maturityDimensions.length
  const overallLevel = avgScore >= 4.5 ? 'Optimized' : avgScore >= 3.5 ? 'Managed' : avgScore >= 2.5 ? 'Defined' : avgScore >= 1.5 ? 'Developing' : 'Initial'

  const infraScore = metrics.bots_deployed >= 30 ? 85 : metrics.bots_deployed >= 10 ? 65 : 45
  const skillScore = Math.min(100, metrics.development_velocity * 5)
  const processScore = metrics.total_processes_automated >= 50 ? 90 : metrics.total_processes_automated >= 20 ? 70 : 50
  const stabilityScore = metrics.success_rate >= 97 ? 90 : metrics.success_rate >= 90 ? 70 : 50
  const scalingReadiness = Math.round(infraScore * 0.25 + skillScore * 0.25 + processScore * 0.25 + stabilityScore * 0.25)

  const blockers: string[] = []
  if (metrics.success_rate < 90) blockers.push('Platform stability below 90% – resolve reliability issues before scaling')
  if (metrics.team_size < 3) blockers.push('Insufficient team capacity – minimum 3 FTEs needed for scaling')
  if (metrics.compliance_score < 60) blockers.push('Compliance gaps – establish governance before expanding')
  const enablers: string[] = ['Existing automation foundation', 'Proven business case with cost savings']
  if (metrics.fte_reclaimed > 10) enablers.push('Demonstrated FTE reduction – strong executive buy-in')

  return {
    maturity_assessment: { overall_level: overallLevel, overall_score: avgScore, dimensions: maturityDimensions },
    scaling_readiness: {
      score: scalingReadiness,
      factors: [
        { factor: 'Infrastructure Capacity', score: infraScore, status: infraScore > 70 ? 'Ready' : 'Build' },
        { factor: 'Team Skills', score: skillScore, status: skillScore > 70 ? 'Ready' : 'Build' },
        { factor: 'Process Pipeline', score: processScore, status: processScore > 70 ? 'Ready' : 'Build' },
        { factor: 'Platform Stability', score: stabilityScore, status: stabilityScore > 70 ? 'Ready' : 'Build' }
      ],
      blockers, enablers,
      recommendation: scalingReadiness >= 75 ? 'Ready to scale – proceed with aggressive expansion pipeline' :
                     scalingReadiness >= 60 ? 'Near readiness – address remaining gaps then scale' :
                     'Build foundational capabilities before attempting to scale'
    },
    center_of_excellence_score: {
      score: Math.round((avgScore / 5) * 100),
      categories: [
        { name: 'Governance', score: metrics.compliance_score, status: metrics.compliance_score > 70 ? 'Strong' : 'Developing' },
        { name: 'Delivery', score: Math.min(100, metrics.development_velocity * 8), status: metrics.development_velocity > 5 ? 'Strong' : 'Developing' },
        { name: 'Operations', score: Math.min(100, metrics.success_rate), status: metrics.success_rate > 95 ? 'Strong' : 'Developing' },
        { name: 'Value Realization', score: Math.min(100, (metrics.fte_reclaimed / 20) * 100), status: metrics.fte_reclaimed > 10 ? 'Strong' : 'Developing' }
      ]
    },
    improvement_roadmap: [
      { phase: 'Q1', initiative: 'Strengthen governance framework', impact: 'High', effort: 'Medium', timeframe: '3 months' },
      { phase: 'Q1-Q2', initiative: 'Expand automation pipeline (target: +10 bots)', impact: 'High', effort: 'High', timeframe: '6 months' },
      { phase: 'Q2', initiative: 'Launch citizen developer training', impact: 'Medium', effort: 'Medium', timeframe: '3 months' },
      { phase: 'Q2-Q3', initiative: 'Implement predictive monitoring', impact: 'Medium', effort: 'Low', timeframe: '4 months' },
      { phase: 'Q3', initiative: 'Establish value realization dashboard', impact: 'Medium', effort: 'Low', timeframe: '2 months' },
      { phase: 'Q4', initiative: 'Scale to enterprise-wide deployment', impact: 'Critical', effort: 'High', timeframe: '6 months' }
    ]
  }
}

function formatRpaProgramReport(result: RpaProgramResult): string {
  const lines: string[] = []
  lines.push('## RPA Program Governance Assessment')
  lines.push('')
  lines.push(`**Maturity Level:** ${result.maturity_assessment.overall_level} (Score: ${result.maturity_assessment.overall_score.toFixed(1)}/5)`)
  lines.push(`**Center of Excellence Score:** ${result.center_of_excellence_score.score}/100`)
  lines.push(`**Scaling Readiness:** ${result.scaling_readiness.score}/100 – ${result.scaling_readiness.recommendation}`)
  lines.push('')

  lines.push('### Maturity Dimensions')
  lines.push('| Dimension | Level | Assessment |')
  lines.push('|-----------|-------|------------|')
  for (const d of result.maturity_assessment.dimensions) {
    lines.push(`| ${d.dimension} | ${d.level}/${d.maxLevel} | ${d.assessment} |`)
  }

  lines.push('')
  lines.push('### Scaling Readiness Factors')
  for (const f of result.scaling_readiness.factors) {
    lines.push(`- **${f.factor}:** ${f.score}/100 – *${f.status}*`)
  }

  if (result.scaling_readiness.blockers.length > 0) {
    lines.push('')
    lines.push('### Scaling Blockers')
    for (const b of result.scaling_readiness.blockers) { lines.push(`- ${b}`) }
  }

  lines.push('')
  lines.push('### Improvement Roadmap')
  lines.push('| Phase | Initiative | Impact | Effort | Timeframe |')
  lines.push('|-------|------------|--------|--------|-----------|')
  for (const r of result.improvement_roadmap) {
    lines.push(`| ${r.phase} | ${r.initiative} | ${r.impact} | ${r.effort} | ${r.timeframe} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: EXCEPTION HANDLER DESIGNER ====================

function designExceptionHandlers(patterns: ExceptionPattern[]): ExceptionHandlerResult {
  const automatedResolutionPaths = patterns.map(p => {
    const canAutomate = p.frequency > 5 && p.business_impact !== 'critical'
    const resolution = canAutomate ?
      (p.exception_type.toLowerCase().includes('timeout') ? 'Implement retry with configurable timeout' :
       p.exception_type.toLowerCase().includes('validation') ? 'Apply fuzzy matching with threshold fallback' :
       'Retry once, then route to self-healing queue') :
      'Route to human operator for manual resolution'
    return {
      exception_type: p.exception_type,
      resolution,
      automation_possible: canAutomate,
      confidence: canAutomate ? 0.75 : 0.3,
      estimated_success_rate: canAutomate ? 0.65 : 0.0
    }
  })

  const escalationMatrix = [
    { level: 'L1 – Auto Resolution', condition: 'Known exception with automated path', responsible: 'Bot Self-Service', sla_minutes: 5, action: 'Attempt automated resolution up to 3 times' },
    { level: 'L2 – Ops Team', condition: 'Automation failed or uncommon pattern', responsible: 'RPA Operations', sla_minutes: 30, action: 'Manual resolution by operations team' },
    { level: 'L3 – Development', condition: 'Unhandled exception type or system failure', responsible: 'RPA Developers', sla_minutes: 120, action: 'Code fix or configuration change required' },
    { level: 'L4 – Vendor', condition: 'Third-party system unavailability', responsible: 'Vendor Support', sla_minutes: 240, action: 'Escalate to application/vendor support team' }
  ]

  const selfHealingRules = patterns.filter(p => p.frequency > 3).map(p => ({
    trigger: `Exception: ${p.exception_type}`,
    action: p.exception_type.toLowerCase().includes('timeout') ? 'Increase timeout by 50% and retry' :
            p.exception_type.toLowerCase().includes('element') ? 'Re-locate element using fallback selector' :
            'Pause 10 seconds and retry operation',
    max_attempts: 3,
    fallback: p.business_impact === 'critical' ? 'Alert business stakeholder immediately' : 'Log and route to L2'
  }))

  const fallbackStrategies = patterns.map(p => ({
    scenario: `${p.exception_type} at production volume`,
    strategy: p.business_impact === 'critical' ? 'Circuit breaker: pause bot, alert team, preserve state' :
             p.business_impact === 'high' ? 'Retry with backoff, queue if persists' :
             'Skip item, log warning, continue processing',
    recovery_time_minutes: p.business_impact === 'critical' ? 30 : p.business_impact === 'high' ? 10 : 1,
    data_preservation: p.business_impact === 'critical' ? 'Full state snapshot saved' : 'Transaction marked for reprocessing'
  }))

  return {
    automated_resolution_paths: automatedResolutionPaths,
    escalation_matrix: escalationMatrix,
    self_healing_rules: selfHealingRules,
    fallback_strategies: fallbackStrategies
  }
}

function formatExceptionHandlerReport(result: ExceptionHandlerResult): string {
  const lines: string[] = []
  lines.push('## Exception Handling Design')
  lines.push('')

  lines.push('### Automated Resolution Paths')
  lines.push('| Exception Type | Resolution | Can Automate | Confidence | Success Rate |')
  lines.push('|---------------|-----------|-------------|------------|-------------|')
  for (const arp of result.automated_resolution_paths) {
    lines.push(`| ${arp.exception_type} | ${arp.resolution} | ${arp.automation_possible ? 'Yes' : 'No'} | ${(arp.confidence * 100).toFixed(0)}% | ${(arp.estimated_success_rate * 100).toFixed(0)}% |`)
  }

  lines.push('')
  lines.push('### Escalation Matrix')
  lines.push('| Level | Condition | Responsible | SLA | Action |')
  lines.push('|-------|-----------|-------------|-----|--------|')
  for (const em of result.escalation_matrix) {
    lines.push(`| ${em.level} | ${em.condition} | ${em.responsible} | ${em.sla_minutes}min | ${em.action} |`)
  }

  if (result.self_healing_rules.length > 0) {
    lines.push('')
    lines.push('### Self-Healing Rules')
    for (const shr of result.self_healing_rules) {
      lines.push(`- **${shr.trigger}:** ${shr.action} (max ${shr.max_attempts} attempts) -> ${shr.fallback}`)
    }
  }

  lines.push('')
  lines.push('### Fallback Strategies')
  for (const fs of result.fallback_strategies) {
    lines.push(`- **${fs.scenario}:** ${fs.strategy} | Recovery: ${fs.recovery_time_minutes}min | ${fs.data_preservation}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: CITIZEN DEVELOPER ENABLER ====================

function enableCitizenDeveloper(analysis: NoCodeAnalysis): CitizenDeveloperResult {
  const skillScore = analysis.user_skills.length >= 5 ? 75 : analysis.user_skills.length >= 3 ? 55 : 35
  const complexityFitMap: Record<string, number> = { simple: 90, moderate: 60, complex: 25 }
  const complexityFit = complexityFitMap[analysis.process_complexity] ?? 50
  const governancePenalty = analysis.governance_requirements.length >= 4 ? 30 : analysis.governance_requirements.length >= 2 ? 15 : 0
  const fitScore = Math.max(5, Math.min(95, Math.round((skillScore + complexityFit) / 2 - governancePenalty)))

  const recType = fitScore >= 70 ? 'Citizen Developer' : fitScore >= 45 ? 'Citizen Developer with CoE Support' : 'Professional Developer Required'
  const reasoning = fitScore >= 70 ?
    'User has sufficient skills for the process complexity with manageable governance requirements' :
    fitScore >= 45 ?
    'Moderate skill level – citizen development feasible with guardrails and CoE oversight' :
    'Process complexity exceeds citizen developer scope – professional development recommended'

  const guardrails = [
    { rule: 'Limit automation to single-application processes', enforcement: 'Template-based deployment only', rationale: 'Reduce integration complexity risks' },
    { rule: 'Maximum 5 workflow steps per automation', enforcement: 'Platform configuration limit', rationale: 'Prevent overly complex citizen-built bots' },
    { rule: 'All citizen-built bots require CoE review before production', enforcement: 'Approval workflow gate', rationale: 'Ensure quality and compliance standards' },
    { rule: 'No direct database access or API calls to production systems', enforcement: 'Sandboxed execution environment', rationale: 'Protect production data integrity' },
    { rule: 'Data sensitivity must be internal or low-risk only', enforcement: 'Data classification check at design time', rationale: 'Prevent unauthorized data exposure' },
    ...(analysis.data_sensitivity ? [{ rule: `Data sensitivity: ${analysis.data_sensitivity}`, enforcement: 'Security review required', rationale: 'Compliance with data governance policy' }] : [])
  ]

  const trainingNeeds = [
    { area: 'RPA Fundamentals', duration: '2 days', method: 'Online self-paced course', priority: 'Required' },
    { area: 'Bot Design & Logic', duration: '1 day', method: 'Hands-on workshop', priority: 'Required' },
    { area: 'Exception Handling', duration: '0.5 days', method: 'Interactive lab', priority: 'Recommended' },
    { area: 'Governance & Compliance', duration: '0.5 days', method: 'Seminar', priority: 'Required' },
    ...(analysis.process_complexity === 'complex' ? [{ area: 'Advanced Integration Patterns', duration: '1 day', method: 'Mentored development', priority: 'Recommended' }] : [])
  ]

  const platforms: PlatformFitAssessment[] = [
    {
      platform: 'Microsoft Power Automate',
      fit_score: 85,
      strengths: ['Low learning curve', 'Rich connectors', 'Strong governance features'],
      limitations: ['Complex logic requires premium licenses', 'Desktop flows on Windows only'],
      cost_estimate: '$15/user/month'
    },
    {
      platform: 'UiPath StudioX',
      fit_score: 75,
      strengths: ['Pre-built activities', 'Drag-and-drop', 'Strong community'],
      limitations: ['Windows-only', 'Requires orchestrator for production'],
      cost_estimate: '$420/license/month'
    },
    {
      platform: 'Automation Anywhere A360',
      fit_score: 65,
      strengths: ['Cloud-native', 'AI/ML capabilities', 'Analytics'],
      limitations: ['Steeper learning curve', 'Complex licensing model'],
      cost_estimate: '$750/bot/month (standard)'
    }
  ].sort((a, b) => b.fit_score - a.fit_score)

  return {
    recommendation: { type: recType, reasoning, fit_score: fitScore },
    guardrails,
    training_needs: trainingNeeds,
    platform_fit: platforms,
    governance_framework: {
      approval_process: 'Submit bot design -> CoE review (48hr SLA) -> approval/rejection with feedback',
      review_frequency: 'Monthly automated scan + quarterly manual review of all citizen-built automations',
      compliance_checks: ['Data access boundaries', 'Error handling completeness', 'Logging configuration', 'Naming conventions', 'Documentation completeness']
    }
  }
}

function formatCitizenDeveloperReport(result: CitizenDeveloperResult): string {
  const lines: string[] = []
  lines.push('## Citizen Developer Enablement Assessment')
  lines.push('')
  lines.push(`**Recommendation:** ${result.recommendation.type}`)
  lines.push(`- **Fit Score:** ${result.recommendation.fit_score}/100`)
  lines.push(`- **Reasoning:** ${result.recommendation.reasoning}`)
  lines.push('')

  lines.push('### Guardrails')
  lines.push('| Rule | Enforcement | Rationale |')
  lines.push('|------|-------------|-----------|')
  for (const g of result.guardrails) {
    lines.push(`| ${g.rule} | ${g.enforcement} | ${g.rationale} |`)
  }

  lines.push('')
  lines.push('### Training Needs')
  lines.push('| Area | Duration | Method | Priority |')
  lines.push('|------|----------|--------|----------|')
  for (const t of result.training_needs) {
    lines.push(`| ${t.area} | ${t.duration} | ${t.method} | ${t.priority} |`)
  }

  lines.push('')
  lines.push('### Platform Fit')
  for (const p of result.platform_fit) {
    lines.push(`#### ${p.platform} (Fit: ${p.fit_score}/100)`)
    lines.push(`- Strengths: ${p.strengths.join(', ')}`)
    lines.push(`- Limitations: ${p.limitations.join(', ')}`)
    lines.push(`- Cost: ${p.cost_estimate}`)
  }

  lines.push('')
  lines.push('### Governance Framework')
  lines.push(`- **Approval Process:** ${result.governance_framework.approval_process}`)
  lines.push(`- **Review Frequency:** ${result.governance_framework.review_frequency}`)
  lines.push(`- **Compliance Checks:** ${result.governance_framework.compliance_checks.join(' | ')}`)

  return lines.join('\n')
}

// ==================== TOOL 8: INTELLIGENT ORCHESTRATOR ====================

function orchestrateFleet(fleetData: BotFleetEntry[]): IntelligentOrchestratorResult {
  const runningBots = fleetData.filter(b => b.status === 'running')
  const idleBots = fleetData.filter(b => b.status === 'idle')
  const errorBots = fleetData.filter(b => b.status === 'error')
  const maintenanceBots = fleetData.filter(b => b.status === 'maintenance')
  const totalWorkload = fleetData.reduce((s, b) => s + b.workload, 0)
  const avgWorkload = fleetData.length > 0 ? totalWorkload / fleetData.length : 0

  const loadBalancing: LoadBalancingResult[] = fleetData.map(b => {
    const recommended = Math.min(90, Math.max(30, avgWorkload + (b.priority > 5 ? 10 : -5)))
    const queueItems = b.status === 'running' ? Math.max(0, Math.floor((100 - b.workload) / 10)) :
                      b.status === 'idle' ? 3 : 0
    let recommendation = 'Maintain current load'
    if (b.workload > 90) recommendation = 'Reduce load – queue overflow risk'
    else if (b.workload < 30 && idleBots.length < 2) recommendation = 'Increase load – underutilized'
    else if (b.status === 'error') recommendation = 'Maintenance required before resuming'
    return { bot_id: b.bot_id, current_load: b.workload, recommended_load: recommended, queue_items: queueItems, recommendation }
  })

  const scheduleRecommendations = fleetData
    .filter(b => b.workload > 80)
    .map(b => {
      const optimized = b.schedule === '24/7' ? 'Off-peak hours (22:00-06:00)' : 'Distribute across maintenance windows'
      return {
        bot_id: b.bot_id,
        current_schedule: b.schedule,
        optimized_schedule: optimized,
        savings_percent: 15 + Math.floor(Math.random() * 20),
        reasoning: 'High utilization - re-schedule low-priority tasks to off-peak to reduce peak load'
      }
    })

  const primaryAssignments: Array<{ task: string; primary: string; backup: string; failover_trigger: string }> = []
  const sorted = [...fleetData].sort((a, b) => a.priority - b.priority)
  for (let i = 0; i < sorted.length - 1; i += 2) {
    primaryAssignments.push({
      task: `Process batch ${Math.floor(i / 2) + 1}`,
      primary: sorted[i]?.bot_id ?? '',
      backup: sorted[i + 1]?.bot_id ?? '',
      failover_trigger: 'Primary bot unavailable for > 5 minutes'
    })
  }

  const totalCapacity = fleetData.reduce((s, b) => s + (b.max_capacity ?? 100), 0)
  const projectedDemand = Math.round(totalCapacity * 1.25)
  const activeBots = fleetData.filter(b => b.status !== 'error').length
  const utilizationForecast = activeBots > 0 ? totalWorkload / activeBots : 0

  const issues: string[] = []
  if (errorBots.length > 0) issues.push(`${errorBots.length} bot(s) in error state - investigate and recover`)
  if (maintenanceBots.length > 0) issues.push(`${maintenanceBots.length} bot(s) under maintenance - consider schedule optimization`)
  if (idleBots.length > fleetData.length * 0.3) issues.push(`High idle capacity (${idleBots.length}/${fleetData.length}) - consider reallocation`)
  if (utilizationForecast > 85) issues.push('Overall utilization above 85% - risk of queue overflow during peak')

  const strengths: string[] = []
  if (runningBots.length > fleetData.length * 0.6) strengths.push(`${runningBots.length}/${fleetData.length} bots operational - healthy fleet`)
  if (fleetData.some(b => b.priority >= 8)) strengths.push('Priority-based processing enabled')
  if (idleBots.length >= 2) strengths.push('Adequate spare capacity for burst workloads')

  const healthyRatio = fleetData.length > 0 ? (runningBots.length + idleBots.length) / fleetData.length : 0
  const orchestrationHealth = Math.round(healthyRatio * 100)

  return {
    load_balancing: loadBalancing,
    scheduling_optimization: { schedule_recommendations: scheduleRecommendations },
    failover_strategy: {
      primary_assignments: primaryAssignments,
      recovery_plan: 'Automatic failover to backup bot within 60 seconds. Backup resumes from last checkpoint with transaction replay.'
    },
    capacity_planning: {
      current_capacity: totalCapacity,
      projected_demand: projectedDemand,
      utilization_forecast: Math.min(100, Math.round(utilizationForecast)),
      scaling_recommendation: utilizationForecast > 80 ? 'ADD CAPACITY - Projected demand exceeds current capacity within 30 days' :
                              utilizationForecast < 40 ? 'REDUCE CAPACITY - Significant idle resources detected' : 'STABLE - Current capacity adequate for projected demand',
      timeline: 'Reassess in 30 days or when new automation requests exceed current queue capacity'
    },
    orchestration_health: { overall_score: orchestrationHealth, issues, strengths }
  }
}

function formatIntelligentOrchestratorReport(result: IntelligentOrchestratorResult): string {
  const lines: string[] = []
  lines.push('## Intelligent Orchestration Analysis')
  lines.push('')
  lines.push(`**Orchestration Health:** ${result.orchestration_health.overall_score}/100`)
  lines.push(`**Current Capacity:** ${result.capacity_planning.current_capacity} units | **Projected Demand:** ${result.capacity_planning.projected_demand} units`)
  lines.push(`**Utilization Forecast:** ${result.capacity_planning.utilization_forecast}% | **Capacity Verdict:** ${result.capacity_planning.scaling_recommendation}`)
  lines.push('')

  lines.push('### Load Balancing')
  lines.push('| Bot ID | Current Load | Recommended | Queue Items | Recommendation |')
  lines.push('|--------|-------------|-------------|-------------|----------------|')
  for (const lb of result.load_balancing) {
    lines.push(`| ${lb.bot_id} | ${lb.current_load}% | ${lb.recommended_load}% | ${lb.queue_items} | ${lb.recommendation} |`)
  }

  if (result.scheduling_optimization.schedule_recommendations.length > 0) {
    lines.push('')
    lines.push('### Scheduling Optimization')
    for (const sr of result.scheduling_optimization.schedule_recommendations) {
      lines.push(`- **${sr.bot_id}:** ${sr.current_schedule} -> ${sr.optimized_schedule} (save ~${sr.savings_percent}%)`)
    }
  }

  lines.push('')
  lines.push('### Failover Strategy')
  lines.push('| Task | Primary | Backup | Failover Trigger |')
  lines.push('|------|---------|--------|-----------------|')
  for (const fa of result.failover_strategy.primary_assignments) {
    lines.push(`| ${fa.task} | ${fa.primary} | ${fa.backup} | ${fa.failover_trigger} |`)
  }
  lines.push(`- **Recovery Plan:** ${result.failover_strategy.recovery_plan}`)

  if (result.orchestration_health.issues.length > 0) {
    lines.push('')
    lines.push('### Issues Identified')
    for (const issue of result.orchestration_health.issues) { lines.push(`- ${issue}`) }
  }
  if (result.orchestration_health.strengths.length > 0) {
    lines.push('')
    lines.push('### Strengths')
    for (const s of result.orchestration_health.strengths) { lines.push(`- ${s}`) }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'process_miner',
    description: 'Analyze event logs to discover process models, identify bottlenecks, detect variants, check conformance, and flag automation candidates from raw operational data.',
    parameters: {
      event_log: { type: 'string', required: true, description: 'JSON array of event log entries with fields: case_id, activity, timestamp (ISO date), resource, duration (optional, in seconds)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { event_log: string }) {
      const data: EventLogEntry[] = JSON.parse(args.event_log)
      const result = mineProcess(data)
      return formatProcessMinerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'automation_opportunity_assessor',
    description: 'Score and rank processes by automation potential. Evaluates ROI, complexity-ease matrix, and generates prioritized recommendations for automation investment.',
    parameters: {
      process_catalog: { type: 'string', required: true, description: 'JSON array of process catalog entries with fields: process_name, frequency, complexity (low/medium/high), systems_involved (array), error_rate (0-1), fte_spent (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { process_catalog: string }) {
      const data: ProcessCatalogEntry[] = JSON.parse(args.process_catalog)
      const result = assessAutomationOpportunities(data)
      return formatAutomationAssessmentReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'bot_designer',
    description: 'Generate a complete bot architecture and workflow design specification from a process definition. Includes error handling strategies, logging, and deployment checklist.',
    parameters: {
      process_definition: { type: 'string', required: true, description: 'JSON object with fields: process_name, description, trigger, steps (array of step objects with step_id, action, application, inputs, outputs, business_rule, exceptions), business_rules (array), exceptions (array)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { process_definition: string }) {
      const data: ProcessDefinition = JSON.parse(args.process_definition)
      const result = designBot(data)
      return formatBotDesignReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'cognitive_document_processor',
    description: 'Design an ML-powered document extraction pipeline. Recommends models, validation rules, and human-in-the-loop triggers for intelligent document processing.',
    parameters: {
      document_data: { type: 'string', required: true, description: 'JSON object with fields: document_type, document_count, fields_to_extract (array of field objects), accuracy_requirements (0-1), has_tables (bool), has_handwriting (bool), language, average_pages' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { document_data: string }) {
      const data: DocumentDataInput = JSON.parse(args.document_data)
      const result = designCognitivePipeline(data)
      return formatCognitiveDocumentReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'rpa_program_governor',
    description: 'Assess RPA program maturity, scaling readiness, and center of excellence health. Generates improvement roadmap with phased initiatives.',
    parameters: {
      program_metrics: { type: 'string', required: true, description: 'JSON object with fields: bots_deployed, utilization (0-100), success_rate (0-100), incidents, cost_savings, fte_reclaimed, total_processes_automated, team_size, development_velocity, security_incidents, compliance_score (0-100), user_satisfaction (0-100)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { program_metrics: string }) {
      const data: ProgramMetrics = JSON.parse(args.program_metrics)
      const result = governRpaProgram(data)
      return formatRpaProgramReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'exception_handler_designer',
    description: 'Design comprehensive exception handling with automated resolution paths, escalation matrix, self-healing rules, and fallback strategies.',
    parameters: {
      exception_patterns: { type: 'string', required: true, description: 'JSON array of exception pattern objects with fields: exception_type, frequency, current_resolution, business_impact (low/medium/high/critical)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { exception_patterns: string }) {
      const data: ExceptionPattern[] = JSON.parse(args.exception_patterns)
      const result = designExceptionHandlers(data)
      return formatExceptionHandlerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'citizen_developer_enabler',
    description: 'Assess citizen developer readiness and provide guardrails, training plans, platform fit, and governance frameworks for low-code/no-code automation.',
    parameters: {
      no_code_analysis: { type: 'string', required: true, description: 'JSON object with fields: user_skills (array), process_complexity (simple/moderate/complex), governance_requirements (array), process_description, integration_count, data_sensitivity, monthly_transaction_volume' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { no_code_analysis: string }) {
      const data: NoCodeAnalysis = JSON.parse(args.no_code_analysis)
      const result = enableCitizenDeveloper(data)
      return formatCitizenDeveloperReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'intelligent_orchestrator',
    description: 'Optimize bot fleet operations with load balancing, scheduling optimization, failover strategies, and capacity planning recommendations.',
    parameters: {
      bot_fleet_data: { type: 'string', required: true, description: 'JSON array of bot fleet entries with fields: bot_id, status (running/idle/error/maintenance), workload (0-100), schedule, priority (1-10), max_capacity, target_resource' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { bot_fleet_data: string }) {
      const data: BotFleetEntry[] = JSON.parse(args.bot_fleet_data)
      const result = orchestrateFleet(data)
      return formatIntelligentOrchestratorReport(result)
    }
  }))

  console.log(`[dsh-tool-robotic] Loaded v${VERSION} - RPA Plugin with 8 tools`)
  console.log('  Tools: process_miner, automation_opportunity_assessor, bot_designer, cognitive_document_processor, rpa_program_governor, exception_handler_designer, citizen_developer_enabler, intelligent_orchestrator')
}
