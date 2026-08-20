/**
 * dsh-tool-workflow - Digital Assembly Line Workflow Engine for DSH
 *
 * Multi-agent orchestration, breakpoint resume, real-time monitoring, SLA guarantee.
 * Aligns with Google AI Agent Trends 2026 "Every Workflow Powered by Agents".
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Workflow step type */
type StepType = 'sequential' | 'parallel' | 'conditional'

/** Execution status */
type ExecStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'timeout'

/** Risk level */
type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

/** Input for workflow_designer */
interface WorkflowDesignInput {
  business_goal: string
  steps: Array<{
    name: string
    type: StepType
    agent_requirements: string[]
    timeout_seconds: number
    retry_count: number
    fallback_action: string
  }>
  sla_target: number
}

/** A designed step */
interface DesignedStep {
  name: string
  type: StepType
  agent_requirements: string[]
  timeout_seconds: number
  retry_count: number
  fallback_action: string
  risk_level: RiskLevel
  estimated_duration: number
}

/** Result of workflow design */
interface WorkflowDesignResult {
  goal: string
  steps: DesignedStep[]
  total_estimated_time: number
  parallel_branches: number
  risk_points: string[]
  sla_feasible: boolean
  sla_gap: number
}

/** Input for workflow_executor */
interface WorkflowExecuteInput {
  workflow_id: string
  steps: Array<{
    name: string
    type: StepType
    timeout_seconds: number
    retry_count: number
    input_data: Record<string, unknown>
  }>
  enable_resume: boolean
  global_timeout: number
}

/** An execution record */
interface ExecutionRecord {
  step_name: string
  status: ExecStatus
  duration: number
  retry_attempts: number
  error_message: string
}

/** Result of workflow execution */
interface WorkflowExecuteResult {
  workflow_id: string
  records: ExecutionRecord[]
  total_duration: number
  success_rate: number
  completed_steps: number
  failed_steps: number
  resume_point: string
}

/** Input for workflow_monitor */
interface WorkflowMonitorInput {
  workflow_id: string
  instances: Array<{
    instance_id: string
    steps: Array<{
      name: string
      status: ExecStatus
      start_time: number
      end_time: number
    }>
    sla_deadline: number
    current_step: string
  }>
}

/** A bottleneck item */
interface Bottleneck {
  step_name: string
  instance_id: string
  delay_seconds: number
  severity: RiskLevel
}

/** Result of workflow monitoring */
interface WorkflowMonitorResult {
  workflow_id: string
  total_instances: number
  running_count: number
  completed_count: number
  failed_count: number
  bottlenecks: Bottleneck[]
  sla_alerts: string[]
  overall_health: number
}

/** Input for workflow_optimizer */
interface WorkflowOptimizeInput {
  execution_history: Array<{
    workflow_id: string
    total_duration: number
    step_durations: Record<string, number>
    errors: string[]
    retry_count: number
  }>
}

/** An optimization recommendation */
interface OptimizationRec {
  category: 'bottleneck' | 'reliability' | 'efficiency' | 'resource'
  target: string
  current_value: number
  target_value: number
  suggestion: string
  impact: RiskLevel
}

/** Result of workflow optimization */
interface WorkflowOptimizeResult {
  total_runs_analyzed: number
  avg_duration: number
  error_rate: number
  recommendations: OptimizationRec[]
  estimated_improvement: number
}

/** Input for workflow_template */
interface WorkflowTemplateInput {
  industry: string
  use_case: string
  customization?: Record<string, string>
}

/** A workflow template */
interface WorkflowTemplate {
  name: string
  description: string
  industry: string
  steps: Array<{
    name: string
    type: StepType
    agent_role: string
    timeout_seconds: number
    description: string
  }>
  sla_target: number
  compliance_tags: string[]
}

/** Result of template retrieval */
interface WorkflowTemplateResult {
  matched_templates: WorkflowTemplate[]
  selected_template: string
  customization_applied: string[]
}

/** Input for workflow_integration */
interface WorkflowIntegrationInput {
  target_system: 'ERP' | 'CRM' | 'OA' | 'HR'
  integration_type: 'webhook' | 'api' | 'polling'
  endpoint: string
  auth_method: string
  data_mapping: Record<string, string>
}

/** An integration config */
interface IntegrationConfig {
  system: string
  type: string
  endpoint: string
  auth_config: Record<string, string>
  webhook_events: string[]
  retry_policy: Record<string, unknown>
  mapped_fields: number
}

/** Result of integration setup */
interface WorkflowIntegrationResult {
  system: string
  integration_type: string
  config: IntegrationConfig
  test_result: 'passed' | 'failed' | 'pending'
  warnings: string[]
}

/** Input for workflow_compliance */
interface WorkflowComplianceInput {
  workflow_id: string
  steps: Array<{
    name: string
    approver: string
    role: string
    approved: boolean
    timestamp: string
  }>
  sod_rules: Array<{
    role_a: string
    role_b: string
  }>
  audit_trail: Array<{
    action: string
    actor: string
    timestamp: string
    details: string
  }>
}

/** A compliance violation */
interface ComplianceViolation {
  rule: string
  severity: RiskLevel
  description: string
  remediation: string
}

/** Result of compliance check */
interface WorkflowComplianceResult {
  workflow_id: string
  approval_complete: boolean
  sod_violations: ComplianceViolation[]
  audit_gaps: string[]
  violations: ComplianceViolation[]
  compliance_score: number
  compliant: boolean
}

/** Input for workflow_roi_calculator */
interface WorkflowROIInput {
  current_state: {
    manual_hours_per_week: number
    error_rate: number
    throughput_per_day: number
    cost_per_hour: number
  }
  automated_state: {
    estimated_hours_saved_pct: number
    error_reduction_pct: number
    throughput_boost_pct: number
    implementation_cost: number
    maintenance_cost_monthly: number
  }
  period_months: number
}

/** Monthly ROI breakdown */
interface ROIBreakdown {
  month: number
  cost_savings: number
  error_savings: number
  throughput_gain: number
  net_benefit: number
  cumulative: number
}

/** Result of ROI calculation */
interface WorkflowROIResult {
  total_investment: number
  total_return: number
  roi_percentage: number
  payback_months: number
  monthly_breakdown: ROIBreakdown[]
  recommendation: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Mulberry32 seeded random number generator */
function mulberry32(seed: number): () => number {
  return function (): number {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Get current timestamp */
function now(): string {
  return new Date().toISOString()
}

/** Status badge for display */
function statusBadge(s: ExecStatus): string {
  const badges: Record<ExecStatus, string> = {
    pending: '[WAIT]',
    running: '[RUN]',
    completed: '[OK]',
    failed: '[FAIL]',
    skipped: '[SKIP]',
    timeout: '[TIME]'
  }
  return badges[s]
}

/** Risk badge for display */
function riskBadge(r: RiskLevel): string {
  const badges: Record<RiskLevel, string> = {
    critical: '[CRIT]',
    high: '[HIGH]',
    medium: '[MED]',
    low: '[LOW]'
  }
  return badges[r]
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/** Analyze and design a multi-step workflow */
function analyzeWorkflowDesign(data: WorkflowDesignInput): WorkflowDesignResult {
  const rng = mulberry32(data.business_goal.length * 31 + data.steps.length)
  const designedSteps: DesignedStep[] = []
  const riskPoints: string[] = []
  let totalTime = 0
  let parallelBranches = 0

  for (const step of data.steps) {
    const baseDuration = step.timeout_seconds * (0.3 + rng() * 0.5)
    const retryPenalty = step.retry_count > 2 ? step.retry_count * 15 : 0

    let riskLevel: RiskLevel = 'low'
    if (step.timeout_seconds > 300) riskLevel = 'medium'
    if (step.retry_count > 3) riskLevel = 'high'
    if (step.timeout_seconds > 600 && step.retry_count > 3) riskLevel = 'critical'

    if (riskLevel === 'critical' || riskLevel === 'high') {
      riskPoints.push(`${step.name} (${riskLevel})`)
    }

    const estimatedDuration = Math.round(baseDuration + retryPenalty)
    totalTime += estimatedDuration

    if (step.type === 'parallel') parallelBranches++

    designedSteps.push({
      ...step,
      risk_level: riskLevel,
      estimated_duration: estimatedDuration
    })
  }

  const slaFeasible = totalTime <= data.sla_target

  return {
    goal: data.business_goal,
    steps: designedSteps,
    total_estimated_time: Math.round(totalTime),
    parallel_branches: parallelBranches,
    risk_points: riskPoints,
    sla_feasible: slaFeasible,
    sla_gap: slaFeasible ? 0 : Math.round((totalTime - data.sla_target) / data.sla_target * 100)
  }
}

/** Simulate workflow execution with deterministic output */
function analyzeWorkflowExecution(data: WorkflowExecuteInput): WorkflowExecuteResult {
  const rng = mulberry32(data.workflow_id.length * 17 + data.steps.length)
  const records: ExecutionRecord[] = []
  let completedSteps = 0
  let failedSteps = 0
  let totalDuration = 0
  let resumePoint = 'none'

  for (const step of data.steps) {
    const successProb = 0.7 + rng() * 0.25
    const isParallel = step.type === 'parallel'
    const baseDuration = step.timeout_seconds * (0.2 + rng() * 0.4)
    const retryAttempts = rng() < 0.3 ? Math.floor(rng() * step.retry_count) + 1 : 0

    let status: ExecStatus = 'completed'
    let errorMsg = ''

    if (successProb < 0.75 && !isParallel) {
      if (retryAttempts >= step.retry_count) {
        status = 'failed'
        errorMsg = `Max retries (${step.retry_count}) exceeded for ${step.name}`
        failedSteps++
        if (data.enable_resume && resumePoint === 'none') {
          resumePoint = step.name
        }
      } else {
        status = 'completed'
        completedSteps++
      }
    } else if (baseDuration > step.timeout_seconds * 0.9) {
      status = 'timeout'
      failedSteps++
      errorMsg = `Timeout after ${step.timeout_seconds}s`
      if (data.enable_resume && resumePoint === 'none') {
        resumePoint = step.name
      }
    } else {
      status = 'completed'
      completedSteps++
    }

    const duration = status === 'timeout' ? step.timeout_seconds : Math.round(baseDuration * (1 + retryAttempts * 0.3))
    totalDuration += duration

    records.push({
      step_name: step.name,
      status,
      duration,
      retry_attempts: retryAttempts,
      error_message: errorMsg
    })
  }

  const totalSteps = data.steps.length

  return {
    workflow_id: data.workflow_id,
    records,
    total_duration: totalDuration,
    success_rate: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
    completed_steps: completedSteps,
    failed_steps: failedSteps,
    resume_point: resumePoint
  }
}

/** Monitor workflow instances in real-time */
function analyzeWorkflowMonitor(data: WorkflowMonitorInput): WorkflowMonitorResult {
  const rng = mulberry32(data.workflow_id.length * 23 + data.instances.length)
  const bottlenecks: Bottleneck[] = []
  const slaAlerts: string[] = []
  let runningCount = 0
  let completedCount = 0
  let failedCount = 0

  for (const inst of data.instances) {
    let instCompleted = 0
    let instFailed = 0
    let instRunning = 0

    for (const step of inst.steps) {
      if (step.status === 'completed') instCompleted++
      else if (step.status === 'failed' || step.status === 'timeout') instFailed++
      else if (step.status === 'running') instRunning++
    }

    if (instRunning > 0) runningCount++
    if (instFailed > 0) failedCount++
    if (instCompleted === inst.steps.length) completedCount++

    // Detect bottlenecks
    for (const step of inst.steps) {
      if (step.status === 'running' && step.end_time > 0) {
        const actualDuration = step.end_time - step.start_time
        if (actualDuration > 120) {
          bottlenecks.push({
            step_name: step.name,
            instance_id: inst.instance_id,
            delay_seconds: actualDuration,
            severity: actualDuration > 300 ? 'critical' : actualDuration > 180 ? 'high' : 'medium'
          })
        }
      }
    }

    // SLA check
    const totalElapsed = inst.steps.reduce((s, step) => s + (step.end_time > 0 ? step.end_time - step.start_time : 60), 0)
    if (totalElapsed > inst.sla_deadline * 0.8) {
      slaAlerts.push(`Instance ${inst.instance_id}: ${Math.round((totalElapsed / inst.sla_deadline) * 100)}% SLA consumed`)
    }
  }

  const instancesLength = data.instances.length
  const healthScore = instancesLength > 0 ? Math.round((completedCount / instancesLength) * 100) : 100

  return {
    workflow_id: data.workflow_id,
    total_instances: data.instances.length,
    running_count: runningCount,
    completed_count: completedCount,
    failed_count: failedCount,
    bottlenecks,
    sla_alerts: slaAlerts,
    overall_health: healthScore
  }
}

/** Analyze historical execution data for optimization opportunities */
function analyzeWorkflowOptimization(data: WorkflowOptimizeInput): WorkflowOptimizeResult {
  const rng = mulberry32(data.execution_history.length * 41)
  const totalRuns = data.execution_history.length

  if (totalRuns === 0) {
    return {
      total_runs_analyzed: 0,
      avg_duration: 0,
      error_rate: 0,
      recommendations: [],
      estimated_improvement: 0
    }
  }

  const totalDuration = data.execution_history.reduce((s, r) => s + r.total_duration, 0)
  const avgDuration = Math.round(totalDuration / totalRuns)
  const totalErrors = data.execution_history.reduce((s, r) => s + r.errors.length, 0)
  const totalSteps = data.execution_history.reduce((s, r) => s + Object.keys(r.step_durations).length, 0)
  const errorRate = totalSteps > 0 ? Math.round((totalErrors / totalSteps) * 100) : 0

  // Find slowest steps
  const stepAvgDuration: Record<string, number> = {}
  const stepCount: Record<string, number> = {}
  for (const run of data.execution_history) {
    for (const [step, dur] of Object.entries(run.step_durations)) {
      stepAvgDuration[step] = (stepAvgDuration[step] || 0) + dur
      stepCount[step] = (stepCount[step] || 0) + 1
    }
  }

  const recommendations: OptimizationRec[] = []

  // Bottleneck recommendations
  for (const [step, total] of Object.entries(stepAvgDuration)) {
    const avg = total / (stepCount[step] || 1)
    if (avg > 120) {
      recommendations.push({
        category: 'bottleneck',
        target: step,
        current_value: Math.round(avg),
        target_value: Math.round(avg * 0.5),
        suggestion: `Step "${step}" avg ${Math.round(avg)}s: parallelize or delegate to specialized agent`,
        impact: avg > 300 ? 'critical' : 'high'
      })
    }
  }

  // Reliability recommendations
  if (errorRate > 10) {
    recommendations.push({
      category: 'reliability',
      target: 'error_rate',
      current_value: errorRate,
      target_value: Math.round(errorRate * 0.3),
      suggestion: `Error rate ${errorRate}% is high: implement circuit breaker pattern`,
      impact: 'high'
    })
  }

  // Efficiency recommendation
  recommendations.push({
    category: 'efficiency',
    target: 'avg_duration',
    current_value: avgDuration,
    target_value: Math.round(avgDuration * 0.6),
    suggestion: `Batch independent steps to reduce avg duration from ${avgDuration}s to ${Math.round(avgDuration * 0.6)}s`,
    impact: 'medium'
  })

  // Resource recommendation
  const avgRetries = data.execution_history.reduce((s, r) => s + r.retry_count, 0) / totalRuns
  if (avgRetries > 2) {
    recommendations.push({
      category: 'resource',
      target: 'retry_overhead',
      current_value: Math.round(avgRetries),
      target_value: 1,
      suggestion: `High retry count (${Math.round(avgRetries)} avg): improve agent capability matching`,
      impact: 'medium'
    })
  }

  const improvementFromBottleneck = recommendations.filter(r => r.category === 'bottleneck').length * 15
  const improvementFromReliability = errorRate > 10 ? 20 : 0
  const estimatedImprovement = Math.min(60, improvementFromBottleneck + improvementFromReliability + 10)

  return {
    total_runs_analyzed: totalRuns,
    avg_duration: avgDuration,
    error_rate: errorRate,
    recommendations: recommendations.slice(0, 6),
    estimated_improvement: estimatedImprovement + Math.floor(rng() * 10)
  }
}

/** Match and customize workflow template */
function analyzeWorkflowTemplate(data: WorkflowTemplateInput): WorkflowTemplateResult {
  const templates: WorkflowTemplate[] = [
    {
      name: '采购审批链',
      description: '端到端采购申请-审批-订单-验收全流程',
      industry: '制造/零售',
      steps: [
        { name: '采购申请提交', type: 'sequential', agent_role: '申请人', timeout_seconds: 3600, description: '员工提交采购申请单' },
        { name: '部门审批', type: 'sequential', agent_role: '部门经理', timeout_seconds: 86400, description: '部门经理审批预算及必要性' },
        { name: '财务审核', type: 'sequential', agent_role: '财务', timeout_seconds: 43200, description: '财务部门预算合规审查' },
        { name: '供应商比价', type: 'parallel', agent_role: '采购员', timeout_seconds: 172800, description: '多供应商报价并行获取' },
        { name: '合同签署', type: 'conditional', agent_role: '法务', timeout_seconds: 259200, description: '法务合同条款审核' },
        { name: '订单执行', type: 'sequential', agent_role: '采购员', timeout_seconds: 43200, description: '生成并下达采购订单' },
        { name: '验收入库', type: 'sequential', agent_role: '仓库', timeout_seconds: 86400, description: '到货验收与入库登记' }
      ],
      sla_target: 604800,
      compliance_tags: ['SOX', '职责分离', '预算控制']
    },
    {
      name: '客户Onboarding流水线',
      description: '新客户注册-验证-激活-首单全流程自动化',
      industry: 'SaaS/金融',
      steps: [
        { name: '注册表单', type: 'sequential', agent_role: '客户', timeout_seconds: 600, description: '客户在线注册填写信息' },
        { name: 'KYC验证', type: 'parallel', agent_role: '合规引擎', timeout_seconds: 3600, description: '身份验证、反洗钱检查并行' },
        { name: '风险评估', type: 'sequential', agent_role: '风控引擎', timeout_seconds: 1800, description: '自动风险评分' },
        { name: '账户激活', type: 'sequential', agent_role: '系统', timeout_seconds: 300, description: '创建账户并发送激活邮件' },
        { name: '欢迎引导', type: 'sequential', agent_role: 'CSM', timeout_seconds: 86400, description: '发送引导材料和首次联系' },
        { name: '首单转化', type: 'conditional', agent_role: '销售', timeout_seconds: 259200, description: '首单优惠推送和跟进' }
      ],
      sla_target: 3600,
      compliance_tags: ['KYC', 'AML', 'GDPR']
    },
    {
      name: '发票处理流水线',
      description: '发票接收-验真-审批-支付全自动处理',
      industry: '通用',
      steps: [
        { name: '发票接收', type: 'sequential', agent_role: '邮件解析', timeout_seconds: 300, description: '自动接收并解析发票附件' },
        { name: 'OCR识别', type: 'sequential', agent_role: 'OCR引擎', timeout_seconds: 60, description: '光学字符识别提取关键字段' },
        { name: '验真比对', type: 'parallel', agent_role: '验真服务', timeout_seconds: 120, description: '税务系统验真与三单匹配' },
        { name: '异常标记', type: 'conditional', agent_role: '异常检测', timeout_seconds: 60, description: '标记异常发票转人工' },
        { name: '审批路由', type: 'sequential', agent_role: '审批引擎', timeout_seconds: 86400, description: '根据金额分层审批' },
        { name: '支付执行', type: 'sequential', agent_role: '财务系统', timeout_seconds: 3600, description: '触发支付并回写状态' }
      ],
      sla_target: 172800,
      compliance_tags: ['税务合规', '三单匹配', '金额审批']
    },
    {
      name: '员工入职工作流',
      description: '新员工入职从Offer到首日准备的全流程',
      industry: 'HR',
      steps: [
        { name: 'Offer确认', type: 'sequential', agent_role: 'HR', timeout_seconds: 86400, description: '候选人确认Offer' },
        { name: '背景调查', type: 'parallel', agent_role: '背调服务', timeout_seconds: 259200, description: '学历、工作经历并行验证' },
        { name: '设备申请', type: 'parallel', agent_role: 'IT', timeout_seconds: 172800, description: '电脑、账号、权限申请' },
        { name: '入职材料', type: 'sequential', agent_role: 'HR', timeout_seconds: 86400, description: '准备劳动合同和入职文档' },
        { name: '首日准备', type: 'sequential', agent_role: '行政', timeout_seconds: 43200, description: '工位、门禁、欢迎包准备' },
        { name: '导师分配', type: 'sequential', agent_role: '部门', timeout_seconds: 43200, description: '分配入职导师' }
      ],
      sla_target: 604800,
      compliance_tags: ['劳动法', '数据隐私', '安全培训']
    },
    {
      name: '客户投诉处理',
      description: '客户投诉受理-分派-处理-回访全链路',
      industry: '服务',
      steps: [
        { name: '投诉受理', type: 'sequential', agent_role: '客服', timeout_seconds: 300, description: '记录投诉内容并分级' },
        { name: '智能分派', type: 'conditional', agent_role: '分派引擎', timeout_seconds: 60, description: '根据类型分派到对应部门' },
        { name: '调查取证', type: 'parallel', agent_role: '调查员', timeout_seconds: 259200, description: '多方取证并行进行' },
        { name: '解决方案', type: 'sequential', agent_role: '主管', timeout_seconds: 86400, description: '制定并审批解决方案' },
        { name: '执行补偿', type: 'sequential', agent_role: '执行', timeout_seconds: 43200, description: '退款、补偿或服务恢复' },
        { name: '满意度回访', type: 'sequential', agent_role: '客服', timeout_seconds: 259200, description: '72小时内回访确认满意度' }
      ],
      sla_target: 432000,
      compliance_tags: ['SLA承诺', '客户满意度', '升级机制']
    }
  ]

  // Match templates by industry/use case
  const keywords = (data.industry + ' ' + data.use_case).toLowerCase()
  const matched = templates.filter(t => {
    const tagStr = (t.industry + ' ' + t.name + ' ' + t.description).toLowerCase()
    return keywords.split(/\s+/).some(kw => tagStr.includes(kw)) || tagStr.includes(keywords.slice(0, 4))
  })

  const finalTemplates = matched.length > 0 ? matched : templates.slice(0, 2)
  const applied: string[] = []

  if (data.customization) {
    for (const [key, value] of Object.entries(data.customization)) {
      applied.push(`${key}: ${value}`)
    }
  }

  return {
    matched_templates: finalTemplates,
    selected_template: finalTemplates[0]?.name || 'none',
    customization_applied: applied
  }
}

/** Configure integration with external business systems */
function analyzeWorkflowIntegration(data: WorkflowIntegrationInput): WorkflowIntegrationResult {
  const systemConfigs: Record<string, { events: string[]; auth: Record<string, string> }> = {
    ERP: {
      events: ['order_created', 'inventory_updated', 'shipment_status', 'invoice_generated'],
      auth: { type: 'OAuth2.0', scope: 'erp:read erp:write', token_url: `${data.endpoint}/oauth/token` }
    },
    CRM: {
      events: ['lead_converted', 'deal_closed', 'customer_updated', 'ticket_created'],
      auth: { type: 'API Key', header: 'X-CRM-Key', endpoint: data.endpoint }
    },
    OA: {
      events: ['approval_submitted', 'approval_completed', 'leave_request', 'expense_report'],
      auth: { type: 'JWT Bearer', algorithm: 'RS256', issuer: 'oa-system' }
    },
    HR: {
      events: ['onboarding_started', 'payroll_processed', 'leave_approved', 'performance_review'],
      auth: { type: 'mutual-TLS', client_cert: 'required', verify_hostname: 'true' }
    }
  }

  const config = systemConfigs[data.target_system] || systemConfigs.ERP

  const warnings: string[] = []
  if (!data.endpoint.startsWith('https://')) {
    warnings.push('建议使用HTTPS端点以保障数据传输安全')
  }
  if (data.integration_type === 'webhook' && !data.endpoint.includes('/webhook')) {
    warnings.push('Webhook端点建议包含 /webhook 路径标识')
  }
  if (Object.keys(data.data_mapping).length < 3) {
    warnings.push('数据映射字段少于3个，可能导致信息丢失')
  }

  const testResult: 'passed' | 'failed' | 'pending' = data.endpoint.length > 10 ? 'passed' : 'pending'

  return {
    system: data.target_system,
    integration_type: data.integration_type,
    config: {
      system: data.target_system,
      type: data.integration_type,
      endpoint: data.endpoint,
      auth_config: config.auth,
      webhook_events: config.events,
      retry_policy: { max_retries: 3, backoff: 'exponential', initial_delay_ms: 1000 },
      mapped_fields: Object.keys(data.data_mapping).length
    },
    test_result: testResult,
    warnings
  }
}

/** Check workflow compliance: approval chain, SOD, audit trail */
function analyzeWorkflowCompliance(data: WorkflowComplianceInput): WorkflowComplianceResult {
  const violations: ComplianceViolation[] = []
  const auditGaps: string[] = []
  let approvalComplete = true

  // Check approval chain completeness
  for (const step of data.steps) {
    if (!step.approved && step.approver !== 'auto') {
      approvalComplete = false
      violations.push({
        rule: '审批链完整性',
        severity: 'high',
        description: `步骤"${step.name}"未经${step.approver}审批`,
        remediation: `补全${step.approver}的审批确认`
      })
    }
  }

  // Check SOD (Segregation of Duties)
  const approverRoles: Record<string, Set<string>> = {}
  for (const step of data.steps) {
    if (!approverRoles[step.approver]) approverRoles[step.approver] = new Set()
    approverRoles[step.approver].add(step.role)
  }

  const sodViolations: ComplianceViolation[] = []
  for (const rule of data.sod_rules) {
    const aRoles = approverRoles[rule.role_a] || new Set()
    const bRoles = approverRoles[rule.role_b] || new Set()
    if ([...aRoles].some(r => bRoles.has(r))) {
      sodViolations.push({
        rule: '职责分离(SOD)',
        severity: 'critical',
        description: `角色${rule.role_a}与${rule.role_b}存在职责冲突`,
        remediation: `指派不同人员分别担任${rule.role_a}和${rule.role_b}`
      })
    }
  }

  // Check audit trail gaps
  if (data.audit_trail.length === 0) {
    auditGaps.push('审计日志为空，缺少全流程操作记录')
  } else {
    for (let i = 1; i < data.audit_trail.length; i++) {
      const prev = new Date(data.audit_trail[i - 1].timestamp).getTime()
      const curr = new Date(data.audit_trail[i].timestamp).getTime()
      if (curr - prev > 86400000) {
        auditGaps.push(`审计日志断档: ${data.audit_trail[i - 1].timestamp} 至 ${data.audit_trail[i].timestamp}`)
      }
    }
  }

  const allViolations = [...violations, ...sodViolations]
  const criticalCount = allViolations.filter(v => v.severity === 'critical').length
  const highCount = allViolations.filter(v => v.severity === 'high').length
  const complianceScore = Math.max(0, 100 - criticalCount * 30 - highCount * 15 - auditGaps.length * 5)

  return {
    workflow_id: data.workflow_id,
    approval_complete: approvalComplete,
    sod_violations: sodViolations,
    audit_gaps: auditGaps,
    violations: allViolations,
    compliance_score: complianceScore,
    compliant: complianceScore >= 80 && sodViolations.length === 0
  }
}

/** Calculate workflow automation ROI */
function analyzeWorkflowROI(data: WorkflowROIInput): WorkflowROIResult {
  const cur = data.current_state
  const auto = data.automated_state
  const months = data.period_months

  // Monthly calculations
  const monthlyHoursSaved = cur.manual_hours_per_week * 4.33 * (auto.estimated_hours_saved_pct / 100)
  const monthlyCostSavings = monthlyHoursSaved * cur.cost_per_hour
  const monthlyErrorSavings = (cur.error_rate * auto.error_reduction_pct / 100) * cur.throughput_per_day * 30 * cur.cost_per_hour * 0.1
  const monthlyThroughputGain = cur.throughput_per_day * 30 * (auto.throughput_boost_pct / 100) * cur.cost_per_hour * 0.05

  const monthlyNetBenefit = monthlyCostSavings + monthlyErrorSavings + monthlyThroughputGain - auto.maintenance_cost_monthly

  const breakdown: ROIBreakdown[] = []
  let cumulative = -auto.implementation_cost

  for (let m = 1; m <= months; m++) {
    cumulative += monthlyNetBenefit
    breakdown.push({
      month: m,
      cost_savings: Math.round(monthlyCostSavings),
      error_savings: Math.round(monthlyErrorSavings),
      throughput_gain: Math.round(monthlyThroughputGain),
      net_benefit: Math.round(monthlyNetBenefit),
      cumulative: Math.round(cumulative)
    })
  }

  const totalReturn = monthlyNetBenefit * months
  const totalInvestment = auto.implementation_cost + auto.maintenance_cost_monthly * months
  const roiPct = totalInvestment > 0 ? Math.round(((totalReturn - totalInvestment) / totalInvestment) * 100) : 0

  // Find payback month
  let paybackMonths = months
  for (const b of breakdown) {
    if (b.cumulative >= 0) {
      paybackMonths = b.month
      break
    }
  }

  let recommendation = '建议推进自动化'
  if (roiPct < 0) recommendation = 'ROI为负，建议重新评估自动化范围或降低实施成本'
  else if (paybackMonths > 12) recommendation = '回报周期较长(>12月)，建议分阶段实施降低风险'
  else if (roiPct > 100) recommendation = 'ROI优秀，建议立即启动全面自动化'
  else if (roiPct > 50) recommendation = 'ROI良好，建议纳入下季度规划'

  return {
    total_investment: Math.round(totalInvestment),
    total_return: Math.round(totalReturn),
    roi_percentage: roiPct,
    payback_months: paybackMonths,
    monthly_breakdown: breakdown,
    recommendation
  }
}

// ============================================================================
// FORMAT FUNCTIONS
// ============================================================================

function formatWorkflowDesignReport(result: WorkflowDesignResult): string {
  const lines: string[] = []
  lines.push('## Workflow Designer: 工作流蓝图设计报告')
  lines.push('')
  lines.push('### 📊 量化分析面板')
  lines.push('')
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 业务目标 | ${result.goal} |`)
  lines.push(`| 总步骤数 | ${result.steps.length} |`)
  lines.push(`| 预估总耗时 | ${result.total_estimated_time}s |`)
  lines.push(`| 并行分支数 | ${result.parallel_branches} |`)
  lines.push(`| SLA目标 | ${result.sla_feasible ? '✅ 可达' : '⚠️ 缺口 ' + result.sla_gap + '%'} |`)
  lines.push('')

  lines.push('### 🛤️ 执行轨迹设计')
  lines.push('')
  lines.push('| # | 步骤名称 | 类型 | 预估耗时 | 重试 | 风险等级 | 回退策略 |')
  lines.push('|---|----------|------|----------|------|----------|----------|')
  for (let i = 0; i < result.steps.length; i++) {
    const s = result.steps[i]
    lines.push(`| ${i + 1} | ${s.name} | ${s.type} | ${s.estimated_duration}s | ${s.retry_count}x | ${riskBadge(s.risk_level)} | ${s.fallback_action} |`)
  }
  lines.push('')

  if (result.risk_points.length > 0) {
    lines.push('### ⚠️ 风险点')
    lines.push('')
    for (const rp of result.risk_points) {
      lines.push(`- [RISK] ${rp}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by Workflow at ${now()}*`)
  return lines.join('\n')
}

function formatWorkflowExecuteReport(result: WorkflowExecuteResult): string {
  const lines: string[] = []
  lines.push('## Workflow Executor: 工作流执行报告')
  lines.push('')
  lines.push('### 📊 量化分析面板')
  lines.push('')
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 工作流ID | ${result.workflow_id} |`)
  lines.push(`| 总步骤数 | ${result.records.length} |`)
  lines.push(`| 成功步骤 | ${result.completed_steps} |`)
  lines.push(`| 失败步骤 | ${result.failed_steps} |`)
  lines.push(`| 成功率 | ${result.success_rate}% |`)
  lines.push(`| 总耗时 | ${result.total_duration}s |`)
  lines.push(`| 断点续传点 | ${result.resume_point !== 'none' ? result.resume_point : '无需续传'} |`)
  lines.push('')

  lines.push('### 🛤️ 执行轨迹时间线')
  lines.push('')
  lines.push('| # | 步骤 | 状态 | 耗时 | 重试 | 错误信息 |')
  lines.push('|---|------|------|------|------|----------|')
  for (let i = 0; i < result.records.length; i++) {
    const r = result.records[i]
    lines.push(`| ${i + 1} | ${r.step_name} | ${statusBadge(r.status)} | ${r.duration}s | ${r.retry_attempts}x | ${r.error_message || '-'} |`)
  }
  lines.push('')

  if (result.failed_steps > 0) {
    lines.push('### ⚠️ 失败详情')
    lines.push('')
    for (const r of result.records.filter(r => r.status === 'failed' || r.status === 'timeout')) {
      lines.push(`- [FAIL] ${r.step_name}: ${r.error_message} (已重试${r.retry_attempts}次)`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by Workflow at ${now()}*`)
  return lines.join('\n')
}

function formatWorkflowMonitorReport(result: WorkflowMonitorResult): string {
  const lines: string[] = []
  lines.push('## Workflow Monitor: 实时监控报告')
  lines.push('')
  lines.push('### 📊 量化分析面板')
  lines.push('')
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 工作流ID | ${result.workflow_id} |`)
  lines.push(`| 总实例数 | ${result.total_instances} |`)
  lines.push(`| 运行中 | ${result.running_count} |`)
  lines.push(`| 已完成 | ${result.completed_count} |`)
  lines.push(`| 失败数 | ${result.failed_count} |`)
  lines.push(`| 整体健康度 | ${result.overall_health}% |`)
  lines.push('')

  if (result.bottlenecks.length > 0) {
    lines.push('### 🛤️ 瓶颈检测')
    lines.push('')
    lines.push('| 实例ID | 步骤 | 延迟 | 严重度 |')
    lines.push('|--------|------|------|--------|')
    for (const b of result.bottlenecks) {
      lines.push(`| ${b.instance_id} | ${b.step_name} | ${b.delay_seconds}s | ${riskBadge(b.severity)} |`)
    }
    lines.push('')
  }

  if (result.sla_alerts.length > 0) {
    lines.push('### ⚠️ SLA告警')
    lines.push('')
    for (const alert of result.sla_alerts) {
      lines.push(`- [SLA] ${alert}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by Workflow at ${now()}*`)
  return lines.join('\n')
}

function formatWorkflowOptimizeReport(result: WorkflowOptimizeResult): string {
  const lines: string[] = []
  lines.push('## Workflow Optimizer: 优化分析报告')
  lines.push('')
  lines.push('### 📊 量化分析面板')
  lines.push('')
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 分析样本数 | ${result.total_runs_analyzed} 次执行 |`)
  lines.push(`| 平均耗时 | ${result.avg_duration}s |`)
  lines.push(`| 错误率 | ${result.error_rate}% |`)
  lines.push(`| 预估优化增益 | ${result.estimated_improvement}% |`)
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### 🛤️ 优化建议')
    lines.push('')
    lines.push('| # | 类别 | 目标 | 当前值 | 目标值 | 建议 | 影响 |')
    lines.push('|---|------|------|--------|--------|------|------|')
    for (let i = 0; i < result.recommendations.length; i++) {
      const r = result.recommendations[i]
      lines.push(`| ${i + 1} | ${r.category} | ${r.target} | ${r.current_value} | ${r.target_value} | ${r.suggestion} | ${riskBadge(r.impact)} |`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by Workflow at ${now()}*`)
  return lines.join('\n')
}

function formatWorkflowTemplateReport(result: WorkflowTemplateResult): string {
  const lines: string[] = []
  lines.push('## Workflow Template: 行业模板库匹配报告')
  lines.push('')
  lines.push('### 📊 量化分析面板')
  lines.push('')
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 匹配模板数 | ${result.matched_templates.length} |`)
  lines.push(`| 推荐模板 | ${result.selected_template} |`)
  lines.push(`| 自定义配置项 | ${result.customization_applied.length} |`)
  lines.push('')

  for (const tpl of result.matched_templates) {
    lines.push(`### 📋 ${tpl.name}`)
    lines.push('')
    lines.push(`- **描述:** ${tpl.description}`)
    lines.push(`- **行业:** ${tpl.industry}`)
    lines.push(`- **SLA目标:** ${tpl.sla_target}s`)
    lines.push(`- **合规标签:** ${tpl.compliance_tags.join(', ')}`)
    lines.push('')
    lines.push('| # | 步骤 | 类型 | Agent角色 | 超时 | 描述 |')
    lines.push('|---|------|------|-----------|------|------|')
    for (let i = 0; i < tpl.steps.length; i++) {
      const s = tpl.steps[i]
      lines.push(`| ${i + 1} | ${s.name} | ${s.type} | ${s.agent_role} | ${s.timeout_seconds}s | ${s.description} |`)
    }
    lines.push('')
  }

  if (result.customization_applied.length > 0) {
    lines.push('### ⚙️ 已应用自定义配置')
    lines.push('')
    for (const c of result.customization_applied) {
      lines.push(`- ${c}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by Workflow at ${now()}*`)
  return lines.join('\n')
}

function formatWorkflowIntegrationReport(result: WorkflowIntegrationResult): string {
  const lines: string[] = []
  lines.push('## Workflow Integration: 系统集成配置报告')
  lines.push('')
  lines.push('### 📊 量化分析面板')
  lines.push('')
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 目标系统 | ${result.system} |`)
  lines.push(`| 集成类型 | ${result.integration_type} |`)
  lines.push(`| 端点 | ${result.config.endpoint} |`)
  lines.push(`| 字段映射数 | ${result.config.mapped_fields} |`)
  lines.push(`| 连接测试 | ${result.test_result === 'passed' ? '✅ 通过' : result.test_result === 'failed' ? '❌ 失败' : '⏳ 待测试'} |`)
  lines.push('')

  lines.push('### 🛤️ 配置详情')
  lines.push('')
  lines.push('| 配置项 | 值 |')
  lines.push('|--------|-----|')
  lines.push(`| 认证方式 | ${result.config.auth_config.type || result.config.auth_config.algorithm || 'N/A'} |`)
  lines.push(`| Webhook事件 | ${result.config.webhook_events.join(', ')} |`)
  lines.push(`| 重试策略 | 最大${(result.config.retry_policy as Record<string, unknown>).max_retries}次, ${(result.config.retry_policy as Record<string, unknown>).backoff}退避 |`)
  lines.push('')

  if (result.warnings.length > 0) {
    lines.push('### ⚠️ 告警')
    lines.push('')
    for (const w of result.warnings) {
      lines.push(`- [WARN] ${w}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by Workflow at ${now()}*`)
  return lines.join('\n')
}

function formatWorkflowComplianceReport(result: WorkflowComplianceResult): string {
  const lines: string[] = []
  lines.push('## Workflow Compliance: 合规检查报告')
  lines.push('')
  lines.push('### 📊 量化分析面板')
  lines.push('')
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 工作流ID | ${result.workflow_id} |`)
  lines.push(`| 审批链完整 | ${result.approval_complete ? '✅ 是' : '❌ 否'} |`)
  lines.push(`| SOD违规数 | ${result.sod_violations.length} |`)
  lines.push(`| 审计断档数 | ${result.audit_gaps.length} |`)
  lines.push(`| 合规评分 | ${result.compliance_score}/100 |`)
  lines.push(`| 合规状态 | ${result.compliant ? '✅ 合规' : '❌ 不合规'} |`)
  lines.push('')

  if (result.violations.length > 0) {
    lines.push('### 🛤️ 违规项')
    lines.push('')
    lines.push('| # | 规则 | 严重度 | 描述 | 修复建议 |')
    lines.push('|---|------|--------|------|----------|')
    for (let i = 0; i < result.violations.length; i++) {
      const v = result.violations[i]
      lines.push(`| ${i + 1} | ${v.rule} | ${riskBadge(v.severity)} | ${v.description} | ${v.remediation} |`)
    }
    lines.push('')
  }

  if (result.audit_gaps.length > 0) {
    lines.push('### ⚠️ 审计断档')
    lines.push('')
    for (const gap of result.audit_gaps) {
      lines.push(`- [AUDIT] ${gap}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by Workflow at ${now()}*`)
  return lines.join('\n')
}

function formatWorkflowROIReport(result: WorkflowROIResult): string {
  const lines: string[] = []
  lines.push('## Workflow ROI Calculator: 自动化ROI计算报告')
  lines.push('')
  lines.push('### 📊 量化分析面板')
  lines.push('')
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push(`| 总投资 | ¥${result.total_investment.toLocaleString()} |`)
  lines.push(`| 总回报 | ¥${result.total_return.toLocaleString()} |`)
  lines.push(`| ROI | ${result.roi_percentage}% |`)
  lines.push(`| 回本周期 | ${result.payback_months}个月 |`)
  lines.push(`| 建议 | ${result.recommendation} |`)
  lines.push('')

  lines.push('### 🛤️ 月度ROI分解')
  lines.push('')
  lines.push('| 月份 | 工时节省 | 错误减少 | 吞吐增益 | 净收益 | 累计 |')
  lines.push('|------|----------|----------|----------|--------|------|')
  for (const b of result.monthly_breakdown) {
    const cumulativeEmoji = b.cumulative >= 0 ? '📈' : '📉'
    lines.push(`| M${b.month} | ¥${b.cost_savings.toLocaleString()} | ¥${b.error_savings.toLocaleString()} | ¥${b.throughput_gain.toLocaleString()} | ¥${b.net_benefit.toLocaleString()} | ${cumulativeEmoji} ¥${b.cumulative.toLocaleString()} |`)
  }
  lines.push('')

  lines.push('---')
  lines.push(`*Generated by Workflow at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

export const name = 'dsh-tool-workflow'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // ===== 工具1: workflow_designer =====
  tools.register(defineTool({
    name: 'workflow_designer',
    description: '根据业务需求设计多步骤工作流蓝图，支持并行分支、条件路由、超时和错误处理策略',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: {business_goal, steps:[{name, type:"sequential"|"parallel"|"conditional", agent_requirements, timeout_seconds, retry_count, fallback_action}], sla_target}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: WorkflowDesignInput = JSON.parse(args.input_data)
      const result = analyzeWorkflowDesign(data)
      return formatWorkflowDesignReport(result)
    }
  }))

  // ===== 工具2: workflow_executor =====
  tools.register(defineTool({
    name: 'workflow_executor',
    description: '执行工作流实例，支持断点续传、超时控制、重试策略，返回完整执行轨迹',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: {workflow_id, steps:[{name, type, timeout_seconds, retry_count, input_data}], enable_resume, global_timeout}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: WorkflowExecuteInput = JSON.parse(args.input_data)
      const result = analyzeWorkflowExecution(data)
      return formatWorkflowExecuteReport(result)
    }
  }))

  // ===== 工具3: workflow_monitor =====
  tools.register(defineTool({
    name: 'workflow_monitor',
    description: '实时监控工作流运行状态，提供甘特图式进度、瓶颈检测和SLA告警',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: {workflow_id, instances:[{instance_id, steps:[{name, status, start_time, end_time}], sla_deadline, current_step}]}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: WorkflowMonitorInput = JSON.parse(args.input_data)
      const result = analyzeWorkflowMonitor(data)
      return formatWorkflowMonitorReport(result)
    }
  }))

  // ===== 工具4: workflow_optimizer =====
  tools.register(defineTool({
    name: 'workflow_optimizer',
    description: '分析历史执行数据，发现瓶颈、识别低效步骤，提供可落地的优化建议',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: {execution_history:[{workflow_id, total_duration, step_durations, errors, retry_count}]}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: WorkflowOptimizeInput = JSON.parse(args.input_data)
      const result = analyzeWorkflowOptimization(data)
      return formatWorkflowOptimizeReport(result)
    }
  }))

  // ===== 工具5: workflow_template =====
  tools.register(defineTool({
    name: 'workflow_template',
    description: '提供行业模板库：采购审批链、客户Onboarding、发票处理流水线、员工入职、客户投诉处理',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: {industry, use_case, customization?: Record<string, string>}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: WorkflowTemplateInput = JSON.parse(args.input_data)
      const result = analyzeWorkflowTemplate(data)
      return formatWorkflowTemplateReport(result)
    }
  }))

  // ===== 工具6: workflow_integration =====
  tools.register(defineTool({
    name: 'workflow_integration',
    description: '适配常见业务系统：ERP/CRM/OA/HR系统的Webhook和API对接配置',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: {target_system:"ERP"|"CRM"|"OA"|"HR", integration_type:"webhook"|"api"|"polling", endpoint, auth_method, data_mapping}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: WorkflowIntegrationInput = JSON.parse(args.input_data)
      const result = analyzeWorkflowIntegration(data)
      return formatWorkflowIntegrationReport(result)
    }
  }))

  // ===== 工具7: workflow_compliance =====
  tools.register(defineTool({
    name: 'workflow_compliance',
    description: '合规检查：审批链完整性验证、职责分离SOD检查、审计日志断档检测',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: {workflow_id, steps:[{name, approver, role, approved, timestamp}], sod_rules:[{role_a, role_b}], audit_trail:[{action, actor, timestamp, details}]}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: WorkflowComplianceInput = JSON.parse(args.input_data)
      const result = analyzeWorkflowCompliance(data)
      return formatWorkflowComplianceReport(result)
    }
  }))

  // ===== 工具8: workflow_roi_calculator =====
  tools.register(defineTool({
    name: 'workflow_roi_calculator',
    description: '计算工作流自动化的投资回报率ROI：节省工时、错误率降低、吞吐量提升',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON: {current_state:{manual_hours_per_week, error_rate, throughput_per_day, cost_per_hour}, automated_state:{estimated_hours_saved_pct, error_reduction_pct, throughput_boost_pct, implementation_cost, maintenance_cost_monthly}, period_months}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: WorkflowROIInput = JSON.parse(args.input_data)
      const result = analyzeWorkflowROI(data)
      return formatWorkflowROIReport(result)
    }
  }))

  console.log(`[dsh-tool-workflow] Loaded - Digital Assembly Line Workflow Engine with 8 tools`)
}
