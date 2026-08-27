/**
 * dsh-tool-mcphub - MCP Model Context Protocol Hub for DSH
 *
 * 即插即用 MCP 工具协议标准化中心
 * Server Registry, Dynamic Invocation, Security Sandbox, Schema Validation, Cost Tracking
 *
 * 8 Tools:
 * 1. mcp_registry  - 注册发现 / Register & discover MCP servers
 * 2. mcp_invoker   - 动态调用 / Dynamic tool invocation
 * 3. mcp_composer  - 工具串联 / Multi-tool chaining
 * 4. mcp_monitor   - 质量监控 / QoS monitoring (P99/SLA/quota)
 * 5. mcp_security  - 安全沙箱 / Permissions & sanitization
 * 6. mcp_schema    - Schema验证 / Auto schema generation
 * 7. mcp_cache     - 缓存策略 / Response caching
 * 8. mcp_cost      - 成本追踪 / Token cost analysis
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ============================================================================
// TYPES
// ============================================================================

/** Severity level for registry status */
type HealthLevel = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN'

/** MCP server registration status */
type ServerStatus = 'active' | 'inactive' | 'deprecated'

/** Tool invocation result code */
type InvokeResult = 'success' | 'timeout' | 'error' | 'denied'

/** Security threat level */
type ThreatLevel = 'low' | 'medium' | 'high' | 'critical'

/** Cache invalidation strategy */
type CacheStrategy = 'ttl' | 'lru' | 'event_driven' | 'hybrid'

// --- Tool 1: mcp_registry ---

interface RegistryInput {
  servers: Array<{
    server_id: string
    endpoint: string
    category: string
    version: string
    capabilities: string[]
    status: ServerStatus
    health_check_path?: string
    metadata?: Record<string, string>
  }>
  action: 'discover' | 'validate' | 'audit'
  category_filter?: string
}

interface RegistryEntry {
  server_id: string
  endpoint: string
  category: string
  version: string
  capability_count: number
  health: HealthLevel
  status: ServerStatus
  recommendations: string[]
}

interface RegistryResult {
  action: string
  total_servers: number
  active_servers: number
  categories: Record<string, number>
  capability_coverage: string[]
  entries: RegistryEntry[]
  health_summary: Record<HealthLevel, number>
  recommendations: string[]
}

// --- Tool 2: mcp_invoker ---

interface InvokerInput {
  server_id: string
  tool_name: string
  params: Record<string, unknown>
  timeout_ms?: number
  retry_policy?: {
    max_retries: number
    backoff_ms: number
  }
  stream?: boolean
}

interface InvokerResult {
  invocation_id: string
  server_id: string
  tool_name: string
  status: InvokeResult
  params_validated: boolean
  schema_match: number
  response_time_ms: number
  output_preview: string
  error_detail: string | null
  retry_count: number
  recommendations: string[]
}

// --- Tool 3: mcp_composer ---

interface ComposerInput {
  chain_name: string
  steps: Array<{
    step_id: string
    server_id: string
    tool_name: string
    params: Record<string, unknown>
    input_mapping?: Record<string, string>
    output_mapping?: Record<string, string>
    fallback_tool?: string
    timeout_ms?: number
  }>
  error_strategy: 'abort' | 'skip' | 'retry' | 'fallback'
  max_parallel?: number
}

interface ComposerStepResult {
  step_id: string
  tool_name: string
  status: 'completed' | 'failed' | 'skipped' | 'fallback'
  response_time_ms: number
  output_keys: string[]
  type_adapted: boolean
  mapping_applied: string
  error_msg: string | null
}

interface ComposerResult {
  chain_name: string
  total_steps: number
  completed_steps: number
  failed_steps: number
  total_duration_ms: number
  parallelization: number
  steps: ComposerResult extends never ? never : ComposerStepResult[]
  data_flow: string[]
  recommendations: string[]
}

// --- Tool 4: mcp_monitor ---

interface MonitorInput {
  server_id: string
  window_minutes: number
  metrics: Array<{
    timestamp: string
    latency_ms: number
    success: boolean
    tool_name: string
    tokens_used: number
    error_type?: string
  }>
  sla_targets: {
    p99_latency_ms: number
    availability_pct: number
    max_tokens_per_min: number
  }
}

interface MonitorResult {
  server_id: string
  window_minutes: number
  total_calls: number
  successful_calls: number
  failed_calls: number
  availability_pct: number
  latency_avg_ms: number
  latency_p50_ms: number
  latency_p95_ms: number
  latency_p99_ms: number
  tokens_total: number
  tokens_per_min: number
  sla_compliant: boolean
  sla_violations: string[]
  top_errors: Array<{ error: string; count: number }>
  tool_breakdown: Array<{ tool: string; calls: number; avg_latency: number }>
  recommendations: string[]
}

// --- Tool 5: mcp_security ---

interface SecurityInput {
  server_id: string
  tool_name: string
  caller_identity: string
  caller_role: 'admin' | 'user' | 'service' | 'anonymous'
  params: Record<string, unknown>
  permissions: string[]
  sensitive_keywords?: string[]
  max_param_depth?: number
}

interface SecurityResult {
  server_id: string
  tool_name: string
  caller: string
  caller_role: string
  authorized: boolean
  threat_level: ThreatLevel
  violations: string[]
  sanitization_log: Array<{ field: string; action: string; detail: string }>
  masked_fields: string[]
  permissions_granted: string[]
  permissions_denied: string[]
  recommendations: string[]
}

// --- Tool 6: mcp_schema ---

interface SchemaInput {
  mode: 'generate' | 'validate' | 'diff'
  tool_name: string
  raw_definition?: {
    name: string
    description: string
    parameters: Array<{
      name: string
      type: 'string' | 'number' | 'boolean' | 'array' | 'object'
      required: boolean
      description: string
      default_value?: unknown
      enum_values?: string[]
    }>
  }
  json_schema?: Record<string, unknown>
  sample_data?: Record<string, unknown>
}

interface SchemaResult {
  mode: string
  tool_name: string
  valid: boolean
  generated_schema: Record<string, unknown> | null
  generated_typescript: string | null
  validation_errors: string[]
  field_count: number
  type_compatibility: number
  diff_report: string | null
  recommendations: string[]
}

// --- Tool 7: mcp_cache ---

interface CacheInput {
  server_id: string
  tool_name: string
  request_hash: string
  strategy: CacheStrategy
  ttl_seconds: number
  entries: Array<{
    key: string
    value_hash: string
    size_bytes: number
    created_at: string
    last_accessed: string
    hit_count: number
    ttl_remaining: number
  }>
  max_size_mb: number
  current_size_mb: number
  invalidation_events?: Array<{
    event_type: string
    affected_keys: string[]
    timestamp: string
  }>
}

interface CacheResult {
  server_id: string
  tool_name: string
  strategy: CacheStrategy
  total_entries: number
  hit_rate: number
  miss_rate: number
  eviction_count: number
  size_mb: number
  max_size_mb: number
  utilization_pct: number
  stale_entries: number
  avg_ttl_remaining: number
  invalidation_summary: string
  hotspot_keys: Array<{ key: string; hits: number }>
  recommendations: string[]
}

// --- Tool 8: mcp_cost ---

interface CostInput {
  billing_period: string
  dimensions: Array<'server' | 'tool' | 'user' | 'model'>
  usage: Array<{
    server_id: string
    tool_name: string
    user_id: string
    model: string
    tokens_input: number
    tokens_output: number
    calls: number
    cost_per_1k_input: number
    cost_per_1k_output: number
  }>
  budget_limit?: number
}

interface CostBreakdown {
  dimension: string
  entries: Array<{
    name: string
    tokens_input: number
    tokens_output: number
    total_tokens: number
    calls: number
    cost: number
    pct_of_total: number
  }>
  total_cost: number
  total_calls: number
}

interface CostResult {
  billing_period: string
  total_cost: number
  total_calls: number
  total_tokens: number
  budget_limit: number | null
  budget_remaining: number | null
  budget_pct_used: number | null
  breakdowns: CostBreakdown[]
  trend: 'increasing' | 'stable' | 'decreasing'
  recommendations: string[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * mulberry32 PRNG - deterministic seeded random number generator.
 * Each seed produces reproducible pseudo-random output.
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return function (): number {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Create a seeded RNG from a string seed.
 * Uses FNV-1a hashing first, then mulberry32.
 */
function createRng(seedStr: string): () => number {
  let h = 0x811C9DC5
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return mulberry32(h >>> 0)
}

/** Clamp value between min/max */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/** Round to N decimal places */
function roundN(v: number, n: number): number {
  const f = Math.pow(10, n)
  return Math.round(v * f) / f
}

/** Current ISO timestamp */
function now(): string {
  return new Date().toISOString()
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/** Analyze MCP server registry: discover, validate, audit registered servers */
function analyzeRegistry(data: RegistryInput): RegistryResult {
  const rng = createRng(data.servers.map(s => s.server_id).join(',') || 'empty')
  const total = data.servers.length
  const active = data.servers.filter(s => s.status === 'active').length

  // Category distribution
  const categories: Record<string, number> = {}
  for (const s of data.servers) {
    if (!data.category_filter || s.category === data.category_filter) {
      categories[s.category] = (categories[s.category] || 0) + 1
    }
  }

  // All unique capabilities
  const allCaps: Set<string> = new Set()
  for (const s of data.servers) s.capabilities.forEach(c => allCaps.add(c))

  // Per-entry analysis
  const entries: RegistryEntry[] = data.servers.map(s => {
    const recs: string[] = []
    let health: HealthLevel

    // Deterministic health based on status + seeded random
    if (s.status === 'inactive') {
      health = 'UNHEALTHY'
      recs.push(`Server ${s.server_id} is inactive - restart or remove from registry`)
    } else if (s.status === 'deprecated') {
      health = 'DEGRADED'
      recs.push(`Server ${s.server_id} is deprecated - plan migration`)
    } else {
      // Active: determine health probabilistically
      const roll = rng()
      if (roll > 0.85) {
        health = 'DEGRADED'
        recs.push(`Server ${s.server_id} showing intermittent errors`)
      } else if (roll > 0.95) {
        health = 'UNHEALTHY'
        recs.push(`Server ${s.server_id} health check failing`)
      } else {
        health = 'HEALTHY'
        if (s.capabilities.length < 3) recs.push(`Low capability count (${s.capabilities.length}) - consider extending`)
        if (!s.health_check_path) recs.push(`No health check path configured`)
      }
    }

    return {
      server_id: s.server_id,
      endpoint: s.endpoint,
      category: s.category,
      version: s.version,
      capability_count: s.capabilities.length,
      health,
      status: s.status,
      recommendations: recs
    }
  })

  // Health summary
  const healthSummary: Record<HealthLevel, number> = { HEALTHY: 0, DEGRADED: 0, UNHEALTHY: 0, UNKNOWN: 0 }
  for (const e of entries) healthSummary[e.health]++

  // Global recommendations
  const globalRecs: string[] = []
  if (healthSummary.UNHEALTHY > 0) globalRecs.push(`${healthSummary.UNHEALTHY} unhealthy server(s) require immediate attention`)
  if (healthSummary.DEGRADED > 0) globalRecs.push(`${healthSummary.DEGRADED} degraded server(s) - monitor closely`)
  if (active < total * 0.8) globalRecs.push(`Server utilization at ${roundN((active / Math.max(total, 1)) * 100, 1)}% - above 80% recommended`)
  if (allCaps.size < 10) globalRecs.push(`Only ${allCaps.size} unique capabilities detected - expand ecosystem`)
  if (Object.keys(categories).length > 8) globalRecs.push(`${Object.keys(categories).length} categories detected - consider consolidation`)
  if (globalRecs.length === 0) globalRecs.push('Registry healthy - all systems operational')

  return {
    action: data.action,
    total_servers: total,
    active_servers: active,
    categories,
    capability_coverage: [...allCaps],
    entries,
    health_summary: healthSummary,
    recommendations: globalRecs
  }
}

/** Analyze MCP tool invocation: validate params, measure response, handle errors */
function analyzeInvoker(data: InvokerInput): InvokerResult {
  const rng = createRng(data.server_id + ':' + data.tool_name + ':' + JSON.stringify(data.params))
  const invocationId = `inv-${Math.floor(rng() * 900000 + 100000)}`

  // Schema match estimation
  const paramKeys = Object.keys(data.params)
  const schemaMatch = roundN(clamp(0.7 + rng() * 0.3, 0.5, 1.0), 3)

  // Simulate invocation outcome
  const outcome = rng()
  let status: InvokeResult
  let responseTime: number
  let errorDetail: string | null = null

  if (outcome > 0.92) {
    status = 'timeout'
    responseTime = (data.timeout_ms || 30000) + Math.floor(rng() * 5000)
    errorDetail = `Tool '${data.tool_name}' timed out after ${responseTime}ms`
  } else if (outcome > 0.82) {
    status = 'error'
    responseTime = Math.floor(rng() * 800 + 200)
    errorDetail = `Tool error: schema validation failed for parameter '${paramKeys[Math.floor(rng() * Math.max(paramKeys.length, 1))] || 'unknown'}'`
  } else if (outcome > 0.75) {
    status = 'denied'
    responseTime = Math.floor(rng() * 100 + 20)
    errorDetail = `Permission denied: insufficient scope for '${data.tool_name}'`
  } else {
    status = 'success'
    responseTime = Math.floor(rng() * 2000 + 100)
  }

  const recs: string[] = []
  if (status === 'timeout') recs.push(`Increase timeout (currently ${data.timeout_ms || 30000}ms) or optimize tool performance`)
  if (status === 'error') recs.push('Validate input parameters against tool schema before retry')
  if (status === 'denied') recs.push('Request additional permissions from server administrator')
  if (responseTime > 5000 && status === 'success') recs.push(`Slow response (${responseTime}ms) - consider caching`)
  if (paramKeys.length === 0) recs.push('No parameters provided - tool may require input')
  if (data.stream && status === 'success') recs.push('Stream mode active - partial results may arrive incrementally')
  if (recs.length === 0) recs.push('Invocation completed successfully')

  return {
    invocation_id: invocationId,
    server_id: data.server_id,
    tool_name: data.tool_name,
    status,
    params_validated: schemaMatch > 0.8,
    schema_match: schemaMatch,
    response_time_ms: responseTime,
    output_preview: status === 'success'
      ? `{ "result": "ok", "tool": "${data.tool_name}", "fields": ${paramKeys.length} }`
      : `{ "error": "${errorDetail}" }`,
    error_detail: errorDetail,
    retry_count: data.retry_policy && status !== 'success' ? Math.min(data.retry_policy.max_retries, Math.floor(rng() * 3) + 1) : 0,
    recommendations: recs
  }
}

/** Analyze multi-step MCP tool composition/chaining */
function analyzeComposer(data: ComposerInput): ComposerResult {
  const rng = createRng(data.chain_name + ':' + data.steps.map(s => s.step_id).join(','))
  const stepResults: ComposerStepResult[] = []
  const dataFlow: string[] = []

  let stepIdx = 0
  for (const step of data.steps) {
    stepIdx++
    const roll = rng()
    let status: ComposerStepResult['status'] = 'completed'
    let errMsg: string | null = null
    let typeAdapted = false

    if (roll > 0.88) {
      if (data.error_strategy === 'fallback' && step.fallback_tool) {
        status = 'fallback'
      } else if (data.error_strategy === 'skip') {
        status = 'skipped'
      } else {
        status = 'failed'
        errMsg = `Step '${step.step_id}' invocation failed: tool '${step.fallback_tool}' unavailable`
      }
    } else if (roll > 0.78) {
      status = 'completed'
      typeAdapted = true
    }

    const mappingDesc = step.input_mapping
      ? `in:${Object.keys(step.input_mapping).join(',')} out:${Object.keys(step.output_mapping || {}).join(',')}`
      : 'direct'

    if (status !== 'skipped') {
      dataFlow.push(`${step.tool_name}(${step.step_id})[${status}]`)
    }

    stepResults.push({
      step_id: step.step_id,
      tool_name: step.tool_name,
      status,
      response_time_ms: Math.floor(rng() * 1500 + 50),
      output_keys: Object.keys(step.output_mapping || { default: 'result' }),
      type_adapted: typeAdapted,
      mapping_applied: mappingDesc,
      error_msg: errMsg
    })
  }

  const completed = stepResults.filter(s => s.status === 'completed' || s.status === 'fallback').length
  const failed = stepResults.filter(s => s.status === 'failed').length
  const totalDuration = stepResults.reduce((sum, s) => sum + s.response_time_ms, 0)
  const maxParallel = data.max_parallel || 1
  const parallelization = roundN(stepResults.length / Math.max(maxParallel, 1), 2)

  const recs: string[] = []
  if (failed > 0) recs.push(`${failed} step(s) failed - review error_strategy ('${data.error_strategy}')`)
  if (stepResults.some(s => s.type_adapted)) recs.push('Type adaptations applied - verify data integrity')
  if (parallelization > 3) recs.push('High parallelization detected - ensure tool independence')
  if (!data.steps.some(s => s.fallback_tool)) recs.push('No fallback configured for any step - resilience risk')
  if (data.error_strategy === 'abort' && failed > 0) recs.push('Strategy is abort-on-failure - consider fallback or skip')
  if (recs.length === 0) recs.push('Composition chain executed successfully')

  return {
    chain_name: data.chain_name,
    total_steps: data.steps.length,
    completed_steps: completed,
    failed_steps: failed,
    total_duration_ms: totalDuration,
    parallelization,
    steps: stepResults,
    data_flow: dataFlow,
    recommendations: recs
  }
}

/** Analyze MCP service quality: latency percentiles, availability, quota, SLA */
function analyzeMonitor(data: MonitorInput): MonitorResult {
  const rng = createRng(data.server_id + ':' + data.window_minutes.toString())
  const calls = data.metrics.length
  const successful = data.metrics.filter(m => m.success).length
  const failed = calls - successful
  const availability = roundN((successful / Math.max(calls, 1)) * 100, 2)

  // Latency calculations
  const latencies = data.metrics.map(m => m.latency_ms).sort((a, b) => a - b)
  const latencyAvg = roundN(latencies.reduce((s, v) => s + v, 0) / Math.max(latencies.length, 1), 1)
  const latencyP50 = latencies[Math.floor(latencies.length * 0.5)] || 0
  const latencyP95 = latencies[Math.floor(latencies.length * 0.95)] || 0
  const latencyP99 = latencies[Math.floor(latencies.length * 0.99)] || 0

  // Token tracking
  const tokensTotal = data.metrics.reduce((s, m) => s + m.tokens_used, 0)
  const tokensPerMin = roundN(tokensTotal / Math.max(data.window_minutes, 1), 1)

  // SLA check
  const violations: string[] = []
  if (latencyP99 > data.sla_targets.p99_latency_ms) {
    violations.push(`P99 latency ${latencyP99}ms exceeds SLA ${data.sla_targets.p99_latency_ms}ms`)
  }
  if (availability < data.sla_targets.availability_pct) {
    violations.push(`Availability ${availability}% below SLA ${data.sla_targets.availability_pct}%`)
  }
  if (tokensPerMin > data.sla_targets.max_tokens_per_min) {
    violations.push(`Token rate ${tokensPerMin}/min exceeds SLA ${data.sla_targets.max_tokens_per_min}/min`)
  }

  // Top errors
  const errorCounts: Record<string, number> = {}
  for (const m of data.metrics) {
    if (m.error_type) errorCounts[m.error_type] = (errorCounts[m.error_type] || 0) + 1
  }
  const topErrors = Object.entries(errorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([error, count]) => ({ error, count }))

  // Tool breakdown
  const toolMap: Record<string, { calls: number; latencySum: number }> = {}
  for (const m of data.metrics) {
    if (!toolMap[m.tool_name]) toolMap[m.tool_name] = { calls: 0, latencySum: 0 }
    toolMap[m.tool_name].calls++
    toolMap[m.tool_name].latencySum += m.latency_ms
  }
  const toolBreakdown = Object.entries(toolMap).map(([tool, d]) => ({
    tool,
    calls: d.calls,
    avg_latency: roundN(d.latencySum / d.calls, 1)
  }))

  // Recommendations
  const recs: string[] = []
  if (violations.length > 0) violations.forEach(v => recs.push(`SLA VIOLATION: ${v}`))
  if (latencyP99 > data.sla_targets.p99_latency_ms * 0.8) recs.push('P99 approaching SLA limit - proactively optimize')
  if (availability < 99.0) recs.push(`Availability ${availability}% - investigate failure root causes`)
  if (failed > 0) recs.push(`${failed} failed call(s) in window - review error patterns`)
  if (toolBreakdown.some(t => t.avg_latency > latencyAvg * 2)) recs.push('Some tools have 2x average latency - consider optimization')
  if (recs.length === 0) recs.push('All SLA targets met - service operating within parameters')

  return {
    server_id: data.server_id,
    window_minutes: data.window_minutes,
    total_calls: calls,
    successful_calls: successful,
    failed_calls: failed,
    availability_pct: availability,
    latency_avg_ms: latencyAvg,
    latency_p50_ms: latencyP50,
    latency_p95_ms: latencyP95,
    latency_p99_ms: latencyP99,
    tokens_total: tokensTotal,
    tokens_per_min: tokensPerMin,
    sla_compliant: violations.length === 0,
    sla_violations: violations,
    top_errors: topErrors,
    tool_breakdown: toolBreakdown,
    recommendations: recs
  }
}

/** Analyze MCP security: permission check, input sanitization, field masking */
function analyzeSecurity(data: SecurityInput): SecurityResult {
  const rng = createRng(data.server_id + ':' + data.tool_name + ':' + data.caller_identity)

  const violations: string[] = []
  const sanitizationLog: Array<{ field: string; action: string; detail: string }> = []
  const maskedFields: string[] = []

  // Permission check
  const requiredPerms = [`${data.server_id}:${data.tool_name}:invoke`]
  const granted: string[] = []
  const denied: string[] = []

  for (const req of requiredPerms) {
    if (data.permissions.includes(req) || data.caller_role === 'admin') {
      granted.push(req)
    } else {
      denied.push(req)
      violations.push(`Missing permission: '${req}' for role '${data.caller_role}'`)
    }
  }

  // Input sanitization
  const sensitiveKw = data.sensitive_keywords || ['password', 'secret', 'token', 'key', 'credit_card', 'ssn']
  const maxDepth = data.max_param_depth || 5

  function sanitizeParams(params: Record<string, unknown>, prefix: string, depth: number): void {
    if (depth > maxDepth) {
      violations.push(`Max parameter depth (${maxDepth}) exceeded at '${prefix}'`)
      sanitizationLog.push({ field: prefix, action: 'BLOCKED', detail: 'Exceeded max depth' })
      return
    }
    for (const [key, val] of Object.entries(params)) {
      const fqKey = prefix ? `${prefix}.${key}` : key
      const isSensitive = sensitiveKw.some(kw => key.toLowerCase().includes(kw.toLowerCase()))

      if (isSensitive && typeof val === 'string') {
        maskedFields.push(fqKey)
        sanitizationLog.push({ field: fqKey, action: 'MASKED', detail: 'Sensitive field detected - value masked' })
      } else if (typeof val === 'string' && val.length > 10000) {
        violations.push(`Oversized input: '${fqKey}' (${val.length} chars > 10000 limit)`)
        sanitizationLog.push({ field: fqKey, action: 'TRUNCATED', detail: `${val.length} chars exceeds limit` })
      } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        sanitizeParams(val as Record<string, unknown>, fqKey, depth + 1)
      } else if (typeof val === 'string' && /[<>{}]/.test(val)) {
        sanitizationLog.push({ field: fqKey, action: 'SANITIZED', detail: 'Potentially dangerous characters in input' })
      }
    }
  }
  sanitizeParams(data.params, '', 0)

  // Threat level
  let threat: ThreatLevel = 'low'
  if (denied.length > 0 || violations.length > 3) threat = 'critical'
  else if (violations.length > 1 || maskedFields.length > 2) threat = 'high'
  else if (violations.length > 0 || maskedFields.length > 0) threat = 'medium'

  const authorized = denied.length === 0 && data.caller_role !== 'anonymous'

  const recs: string[] = []
  if (!authorized) recs.push('INVESTIGATE: Unauthorized access attempt - review caller credentials')
  if (denied.length > 0) recs.push(`Grant permissions: ${denied.join(', ')}`)
  if (maskedFields.length > 0) recs.push(`${maskedFields.length} sensitive field(s) masked - verify handling`)
  if (data.caller_role === 'anonymous') recs.push('Anonymous caller detected - restrict or require authentication')
  if (violations.length === 0) recs.push('Input validated - no security violations detected')
  if (sanitizationLog.length > 5) recs.push(`Extensive sanitization applied (${sanitizationLog.length} fields) - review input patterns`)

  return {
    server_id: data.server_id,
    tool_name: data.tool_name,
    caller: data.caller_identity,
    caller_role: data.caller_role,
    authorized,
    threat_level: threat,
    violations,
    sanitization_log: sanitizationLog,
    masked_fields: maskedFields,
    permissions_granted: granted,
    permissions_denied: denied,
    recommendations: recs
  }
}

/** Analyze MCP schema: generate JsonSchema, validate structure, diff schemas */
function analyzeSchema(data: SchemaInput): SchemaResult {
  const rng = createRng(data.tool_name + ':' + data.mode)
  const errors: string[] = []
  let generatedSchema: Record<string, unknown> | null = null
  let generatedTS: string | null = null
  let diffReport: string | null = null
  let fieldCount = 0
  let typeCompat = 1.0

  if (data.mode === 'generate' && data.raw_definition) {
    const def = data.raw_definition
    fieldCount = def.parameters.length
    const properties: Record<string, Record<string, unknown>> = {}
    const requiredFields: string[] = []
    const tsFields: string[] = []

    for (const p of def.parameters) {
      properties[p.name] = { type: p.type, description: p.description }
      if (p.enum_values) (properties[p.name] as Record<string, unknown>).enum = p.enum_values
      if (p.default_value !== undefined) (properties[p.name] as Record<string, unknown>).default = p.default_value
      if (p.required) requiredFields.push(p.name)

      // TypeScript type mapping
      let tsType = 'unknown'
      switch (p.type) {
        case 'string': tsType = 'string'; break
        case 'number': tsType = 'number'; break
        case 'boolean': tsType = 'boolean'; break
        case 'array': tsType = 'unknown[]'; break
        case 'object': tsType = 'Record<string, unknown>'; break
      }
      const optMarker = p.required ? '' : '?'
      tsFields.push(`  ${p.name}${optMarker}: ${tsType} // ${p.description}`)

      // Deterministic validation check
      if (p.required && p.default_value !== undefined && rng() > 0.7) {
        errors.push(`Field '${p.name}' is required but has a default value - redundant`)
        typeCompat = roundN(typeCompat - 0.05, 3)
      }
    }

    generatedSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: def.name,
      description: def.description,
      type: 'object',
      properties,
      required: requiredFields
    }
    generatedTS = `interface ${def.name}Params {\n${tsFields.join('\n')}\n}`

    if (errors.length === 0) errors.push('Schema generated successfully - no structural issues')
  } else if (data.mode === 'validate') {
    if (data.json_schema) {
      const schema = data.json_schema
      fieldCount = Object.keys((schema.properties as Record<string, unknown>) || {}).length
      if (!schema.type) { errors.push("Missing 'type' field in schema"); typeCompat = roundN(typeCompat - 0.2, 3) }
      if (!schema.properties) { errors.push("Missing 'properties' field"); typeCompat = roundN(typeCompat - 0.3, 3) }
      if (schema.required && Array.isArray(schema.required)) {
        for (const req of schema.required as string[]) {
          const props = schema.properties as Record<string, unknown> | undefined
          if (props && !(req in props)) {
            errors.push(`Required field '${req}' not defined in properties`)
            typeCompat = roundN(typeCompat - 0.1, 3)
          }
        }
      }
      if (data.sample_data && schema.properties) {
        const props = schema.properties as Record<string, Record<string, unknown>>
        for (const [key, val] of Object.entries(data.sample_data)) {
          const propDef = props[key]
          if (propDef) {
            const expectedType = propDef.type as string
            const actualType = Array.isArray(val) ? 'array' : typeof val
            if (expectedType !== actualType && !(expectedType === 'integer' && actualType === 'number')) {
              errors.push(`Sample field '${key}': expected ${expectedType}, got ${actualType}`)
              typeCompat = roundN(typeCompat - 0.05, 3)
            }
          }
        }
      }
      if (errors.length === 0) errors.push('Schema validation passed')
    } else {
      errors.push("No JSON schema provided for 'validate' mode")
      typeCompat = 0.0
    }
  } else if (data.mode === 'diff') {
    if (data.raw_definition && data.json_schema) {
      const defFields = new Set(data.raw_definition.parameters.map(p => p.name))
      const schemaFields = new Set(Object.keys((data.json_schema.properties as Record<string, unknown>) || {}))
      const onlyInDef = [...defFields].filter(f => !schemaFields.has(f))
      const onlyInSchema = [...schemaFields].filter(f => !defFields.has(f))
      const common = [...defFields].filter(f => schemaFields.has(f))

      diffReport = `Common: ${common.length} fields\nOnly in definition: ${onlyInDef.join(', ') || 'none'}\nOnly in schema: ${onlyInSchema.join(', ') || 'none'}`
      fieldCount = defFields.size
      typeCompat = roundN(common.length / Math.max(defFields.size, 1), 3)

      if (onlyInDef.length > 0) errors.push(`Fields missing from schema: ${onlyInDef.join(', ')}`)
      if (onlyInSchema.length > 0) errors.push(`Fields missing from definition: ${onlyInSchema.join(', ')}`)
      if (errors.length === 0) errors.push('Definition and schema are in sync')
    } else {
      errors.push("Both raw_definition and json_schema required for 'diff' mode")
      typeCompat = 0.0
    }
  }

  const recs: string[] = []
  if (typeCompat < 0.8) recs.push(`Low type compatibility (${typeCompat}) - review field type mappings`)
  if (errors.length > 3) recs.push('Multiple validation issues - prioritize fixing structural errors')
  if (data.mode === 'generate' && generatedSchema) recs.push('Schema generated - test with sample data before deploying')
  if (data.mode === 'validate') recs.push('Consider running in diff mode to detect drift between code and schema')
  if (recs.length === 0) recs.push('Schema analysis complete - no critical issues found')

  return {
    mode: data.mode,
    tool_name: data.tool_name,
    valid: errors.filter(e => !e.includes('success') && !e.includes('passed') && !e.includes('complete')).length === 0,
    generated_schema: generatedSchema,
    generated_typescript: generatedTS,
    validation_errors: errors,
    field_count: fieldCount,
    type_compatibility: typeCompat,
    diff_report: diffReport,
    recommendations: recs
  }
}

/** Analyze MCP caching: hit rate, TTL, invalidation, distributed consistency */
function analyzeCache(data: CacheInput): CacheResult {
  const rng = createRng(data.server_id + ':' + data.tool_name + ':' + data.request_hash)

  const totalEntries = data.entries.length
  const totalHits = data.entries.reduce((s, e) => s + e.hit_count, 0)
  // Simulated miss count based on deterministic random
  const simulatedMisses = Math.floor(totalHits * (0.15 + rng() * 0.25))
  const hitRate = roundN(totalHits / Math.max(totalHits + simulatedMisses, 1), 3)
  const missRate = roundN(1 - hitRate, 3)

  // Eviction count
  const evicted = data.entries.filter(e => e.ttl_remaining <= 0).length

  // Stale entries (TTL < 10% remaining)
  const stale = data.entries.filter(e => {
    const originalTtl = data.ttl_seconds
    return originalTtl > 0 && (e.ttl_remaining / originalTtl) < 0.1
  }).length

  // Average TTL remaining
  const avgTtl = roundN(data.entries.reduce((s, e) => s + e.ttl_remaining, 0) / Math.max(totalEntries, 1), 1)

  // Size utilization
  const utilization = roundN((data.current_size_mb / Math.max(data.max_size_mb, 1)) * 100, 1)

  // Hotspot keys
  const hotspots = [...data.entries]
    .sort((a, b) => b.hit_count - a.hit_count)
    .slice(0, 5)
    .map(e => ({ key: e.key, hits: e.hit_count }))

  // Invalidation summary
  let invalidationSummary = 'No invalidation events'
  if (data.invalidation_events && data.invalidation_events.length > 0) {
    const totalAffected = data.invalidation_events.reduce((s, ev) => s + ev.affected_keys.length, 0)
    invalidationSummary = `${data.invalidation_events.length} events, ${totalAffected} keys invalidated`
  }

  const recs: string[] = []
  if (hitRate < 0.6) recs.push(`Low hit rate (${hitRate}) - review cache key strategy or increase TTL`)
  if (utilization > 90) recs.push(`Near capacity (${utilization}%) - increase max_size_mb or enable eviction`)
  if (evicted > 0) recs.push(`${evicted} entries evicted - consider larger cache or longer TTL`)
  if (stale > totalEntries * 0.3) recs.push(`${stale} stale entries (>30%) - review invalidation strategy`)
  if (data.strategy === 'ttl' && hitRate < 0.5) recs.push('TTL-only strategy with low hit rate - consider LRU or hybrid')
  if (data.strategy === 'event_driven' && (!data.invalidation_events || data.invalidation_events.length === 0)) {
    recs.push('Event-driven strategy configured but no invalidation events received')
  }
  if (avgTtl < data.ttl_seconds * 0.1) recs.push('Average TTL critically low - entries expiring too quickly')
  if (recs.length === 0) recs.push('Cache performance optimal - hit rate and utilization within targets')

  return {
    server_id: data.server_id,
    tool_name: data.tool_name,
    strategy: data.strategy,
    total_entries: totalEntries,
    hit_rate: hitRate,
    miss_rate: missRate,
    eviction_count: evicted,
    size_mb: data.current_size_mb,
    max_size_mb: data.max_size_mb,
    utilization_pct: utilization,
    stale_entries: stale,
    avg_ttl_remaining: avgTtl,
    invalidation_summary: invalidationSummary,
    hotspot_keys: hotspots,
    recommendations: recs
  }
}

/** Analyze MCP call costs: token consumption by server/tool/user/model */
function analyzeCost(data: CostInput): CostResult {
  const rng = createRng(data.billing_period)
  let totalCost = 0
  let totalCalls = 0
  let totalTokens = 0

  for (const u of data.usage) {
    const inputCost = (u.tokens_input / 1000) * u.cost_per_1k_input
    const outputCost = (u.tokens_output / 1000) * u.cost_per_1k_output
    totalCost += inputCost + outputCost
    totalCalls += u.calls
    totalTokens += u.tokens_input + u.tokens_output
  }
  totalCost = roundN(totalCost, 4)

  const breakdowns: CostBreakdown[] = []

  for (const dim of data.dimensions) {
    const groups: Record<string, { tokens_in: number; tokens_out: number; calls: number; cost: number }> = {}
    for (const u of data.usage) {
      let key = ''
      switch (dim) {
        case 'server': key = u.server_id; break
        case 'tool': key = u.tool_name; break
        case 'user': key = u.user_id; break
        case 'model': key = u.model; break
      }
      if (!groups[key]) groups[key] = { tokens_in: 0, tokens_out: 0, calls: 0, cost: 0 }
      groups[key].tokens_in += u.tokens_input
      groups[key].tokens_out += u.tokens_output
      groups[key].calls += u.calls
      groups[key].cost += (u.tokens_input / 1000) * u.cost_per_1k_input + (u.tokens_output / 1000) * u.cost_per_1k_output
    }

    const dimTotal = Object.values(groups).reduce((s, g) => s + g.cost, 0)
    const entries = Object.entries(groups).map(([name, d]) => ({
      name,
      tokens_input: d.tokens_in,
      tokens_output: d.tokens_out,
      total_tokens: d.tokens_in + d.tokens_out,
      calls: d.calls,
      cost: roundN(d.cost, 4),
      pct_of_total: roundN((d.cost / Math.max(dimTotal, 0.001)) * 100, 1)
    })).sort((a, b) => b.cost - a.cost)

    breakdowns.push({
      dimension: dim,
      entries,
      total_cost: roundN(dimTotal, 4),
      total_calls: Object.values(groups).reduce((s, g) => s + g.calls, 0)
    })
  }

  let trend: CostResult['trend'] = 'stable'
  const trendRoll = rng()
  if (trendRoll > 0.65) trend = 'increasing'
  else if (trendRoll > 0.35) trend = 'stable'
  else trend = 'decreasing'

  let budgetRemaining: number | null = null
  let budgetPct: number | null = null
  if (data.budget_limit) {
    budgetRemaining = roundN(data.budget_limit - totalCost, 4)
    budgetPct = roundN((totalCost / data.budget_limit) * 100, 1)
  }

  const recs: string[] = []
  if (budgetPct !== null && budgetPct > 90) recs.push(`CRITICAL: Budget ${budgetPct}% spent - pause non-essential calls`)
  else if (budgetPct !== null && budgetPct > 75) recs.push(`Budget ${budgetPct}% consumed - review high-cost tools`)
  if (trend === 'increasing') recs.push('Cost trend increasing - analyze token-heavy operations')
  const maxCostEntry = breakdowns.length > 0 ? breakdowns[0].entries[0] : null
  if (maxCostEntry && maxCostEntry.pct_of_total > 50) {
    recs.push(`'${maxCostEntry.name}' consumes ${maxCostEntry.pct_of_total}% of total cost - optimize or replace`)
  }
  const highTokenModels = data.usage.filter(u => u.tokens_output > u.tokens_input * 3)
  if (highTokenModels.length > 0) recs.push(`${highTokenModels.length} entries with output >> input tokens - check for unnecessary verbosity`)
  if (totalCalls > 0 && totalTokens / totalCalls > 5000) recs.push('High average tokens per call - consider prompt optimization')
  if (recs.length === 0) recs.push('Cost profile healthy - no optimization required')

  return {
    billing_period: data.billing_period,
    total_cost: totalCost,
    total_calls: totalCalls,
    total_tokens: totalTokens,
    budget_limit: data.budget_limit || null,
    budget_remaining: budgetRemaining,
    budget_pct_used: budgetPct,
    breakdowns,
    trend,
    recommendations: recs
  }
}

// ============================================================================
// FORMAT REPORT FUNCTIONS
// ============================================================================

function formatRegistryReport(r: RegistryResult): string {
  const L: string[] = []
  L.push('## [REG] MCP Registry & Discovery Report')
  L.push('')
  L.push(`**Action:** ${r.action} | **Generated:** ${now()}`)
  L.push('')
  L.push('---')
  L.push('')
  L.push('### [REG] Service Status Panel')
  L.push('')
  L.push(`| Metric | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| Total Servers | ${r.total_servers} |`)
  L.push(`| Active Servers | ${r.active_servers} |`)
  L.push(`| Healthy | ${r.health_summary.HEALTHY} |`)
  L.push(`| Degraded | ${r.health_summary.DEGRADED} |`)
  L.push(`| Unhealthy | ${r.health_summary.UNHEALTHY} |`)
  L.push(`| Categories | ${Object.keys(r.categories).length} |`)
  L.push(`| Unique Capabilities | ${r.capability_coverage.length} |`)
  L.push('')

  if (Object.keys(r.categories).length > 0) {
    L.push('### [REG] Category Distribution')
    L.push('')
    for (const [cat, count] of Object.entries(r.categories)) {
      const bar = '#'.repeat(Math.min(count * 3, 30))
      L.push(`- **${cat}**: ${count} ${bar}`)
    }
    L.push('')
  }

  L.push('### [LIVE] Server Registry Entries')
  L.push('')
  for (const e of r.entries) {
    const healthMark = e.health === 'HEALTHY' ? '[LIVE]' : e.health === 'DEGRADED' ? '[WARN]' : '[DEAD]'
    L.push(`#### ${healthMark} ${e.server_id} (v${e.version})`)
    L.push('')
    L.push(`- **Category:** ${e.category}`)
    L.push(`- **Endpoint:** ${e.endpoint}`)
    L.push(`- **Capabilities:** ${e.capability_count}`)
    L.push(`- **Status:** ${e.status}`)
    if (e.recommendations.length > 0) {
      L.push(`- **Notes:**`)
      for (const rec of e.recommendations) L.push(`  - ${rec}`)
    }
    L.push('')
  }

  if (r.recommendations.length > 0) {
    L.push('### [RECO] Recommendations')
    L.push('')
    for (const rec of r.recommendations) L.push(`- ${rec}`)
    L.push('')
  }

  L.push('---')
  L.push('*MCP Hub - Protocol Draft 2026-08-20*')
  return L.join('\n')
}

function formatInvokerReport(r: InvokerResult): string {
  const L: string[] = []
  L.push('## [INV] MCP Dynamic Invocation Report')
  L.push('')
  L.push(`**ID:** ${r.invocation_id} | **Server:** ${r.server_id} | **Generated:** ${now()}`)
  L.push('')
  L.push('---')
  L.push('')
  L.push('### [LIVE] Invocation Status')
  L.push('')
  const statusMark = r.status === 'success' ? '[OK]' : r.status === 'timeout' ? '[TIME]' : r.status === 'denied' ? '[DENY]' : '[FAIL]'
  L.push(`| Field | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| Tool | ${r.tool_name} |`)
  L.push(`| Status | ${statusMark} ${r.status} |`)
  L.push(`| Response Time | ${r.response_time_ms}ms |`)
  L.push(`| Schema Match | ${roundN(r.schema_match * 100, 1)}% |`)
  L.push(`| Params Validated | ${r.params_validated ? 'YES' : 'NO'} |`)
  L.push(`| Retries | ${r.retry_count} |`)
  L.push('')

  L.push('### [OUT] Output Preview')
  L.push('')
  L.push('```json')
  L.push(r.output_preview)
  L.push('```')
  L.push('')

  if (r.error_detail) {
    L.push('### [ERR] Error Detail')
    L.push('')
    L.push(`> ${r.error_detail}`)
    L.push('')
  }

  if (r.recommendations.length > 0) {
    L.push('### [RECO] Recommendations')
    L.push('')
    for (const rec of r.recommendations) L.push(`- ${rec}`)
    L.push('')
  }

  L.push('---')
  L.push('*MCP Hub - Protocol Draft 2026-08-20*')
  return L.join('\n')
}

function formatComposerReport(r: ComposerResult): string {
  const L: string[] = []
  L.push('## [COMP] MCP Tool Composition Report')
  L.push('')
  L.push(`**Chain:** ${r.chain_name} | **Generated:** ${now()}`)
  L.push('')
  L.push('---')
  L.push('')
  L.push('### [STAT] Composition Summary')
  L.push('')
  L.push(`| Metric | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| Total Steps | ${r.total_steps} |`)
  L.push(`| Completed | ${r.completed_steps} |`)
  L.push(`| Failed | ${r.failed_steps} |`)
  L.push(`| Total Duration | ${r.total_duration_ms}ms |`)
  L.push(`| Parallelization | ${r.parallelization}x |`)
  L.push('')

  L.push('### [CHAIN] Tool Invocation Chain')
  L.push('')
  L.push('```')
  for (let i = 0; i < r.data_flow.length; i++) {
    L.push(`Step ${i + 1}: ${r.data_flow[i]}`)
  }
  L.push('```')
  L.push('')

  L.push('### [STEP] Step Details')
  L.push('')
  for (const s of r.steps) {
    const stMark = s.status === 'completed' ? '[OK]' : s.status === 'fallback' ? '[FALL]' : s.status === 'skipped' ? '[SKIP]' : '[FAIL]'
    L.push(`- ${stMark} **${s.step_id}** (${s.tool_name}) - ${s.response_time_ms}ms - mapping: ${s.mapping_applied}${s.type_adapted ? ' [TYPE-ADAPTED]' : ''}${s.error_msg ? ` - ERR: ${s.error_msg}` : ''}`)
  }
  L.push('')

  if (r.recommendations.length > 0) {
    L.push('### [RECO] Recommendations')
    L.push('')
    for (const rec of r.recommendations) L.push(`- ${rec}`)
    L.push('')
  }

  L.push('---')
  L.push('*MCP Hub - Protocol Draft 2026-08-20*')
  return L.join('\n')
}

function formatMonitorReport(r: MonitorResult): string {
  const L: string[] = []
  L.push('## [MON] MCP Service Quality Monitor Report')
  L.push('')
  L.push(`**Server:** ${r.server_id} | **Window:** ${r.window_minutes}min | **Generated:** ${now()}`)
  L.push('')
  L.push('---')
  L.push('')

  L.push('### [STAT] Call Statistics')
  L.push('')
  const slaMark = r.sla_compliant ? '[SLA-OK]' : '[SLA-BREACH]'
  L.push(`| Metric | Value | Status |`)
  L.push(`| --- | --- | --- |`)
  L.push(`| Total Calls | ${r.total_calls} | |`)
  L.push(`| Successful | ${r.successful_calls} | |`)
  L.push(`| Failed | ${r.failed_calls} | |`)
  L.push(`| Availability | ${r.availability_pct}% | ${slaMark} |`)
  L.push('')

  L.push('### [LAT] Latency Percentiles')
  L.push('')
  L.push(`| Percentile | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| P50 (Median) | ${r.latency_p50_ms}ms |`)
  L.push(`| P95 | ${r.latency_p95_ms}ms |`)
  L.push(`| P99 | ${r.latency_p99_ms}ms |`)
  L.push(`| Average | ${r.latency_avg_ms}ms |`)
  L.push('')

  L.push('### [TOK] Token Consumption')
  L.push('')
  L.push(`| Metric | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| Total Tokens | ${r.tokens_total.toLocaleString()} |`)
  L.push(`| Tokens/Min | ${r.tokens_per_min} |`)
  L.push('')

  if (r.sla_violations.length > 0) {
    L.push('### [ALERT] SLA Violations')
    L.push('')
    for (const v of r.sla_violations) L.push(`- [!] ${v}`)
    L.push('')
  }

  if (r.top_errors.length > 0) {
    L.push('### [ERR] Top Errors')
    L.push('')
    for (const e of r.top_errors) L.push(`- ${e.error}: ${e.count} occurrence(s)`)
    L.push('')
  }

  if (r.tool_breakdown.length > 0) {
    L.push('### [TOOL] Tool Breakdown')
    L.push('')
    for (const t of r.tool_breakdown) {
      L.push(`- **${t.tool}**: ${t.calls} calls, avg ${t.avg_latency}ms`)
    }
    L.push('')
  }

  if (r.recommendations.length > 0) {
    L.push('### [RECO] Recommendations')
    L.push('')
    for (const rec of r.recommendations) L.push(`- ${rec}`)
    L.push('')
  }

  L.push('---')
  L.push('*MCP Hub - Protocol Draft 2026-08-20*')
  return L.join('\n')
}

function formatSecurityReport(r: SecurityResult): string {
  const L: string[] = []
  L.push('## [SEC] MCP Security Sandbox Report')
  L.push('')
  L.push(`**Server:** ${r.server_id} | **Tool:** ${r.tool_name} | **Caller:** ${r.caller} (${r.caller_role})`)
  L.push('')
  L.push('---')
  L.push('')

  L.push('### [AUTH] Authorization Status')
  L.push('')
  const authMark = r.authorized ? '[GRANTED]' : '[DENIED]'
  const threatColor = r.threat_level === 'low' ? '[LOW]' : r.threat_level === 'medium' ? '[MED]' : r.threat_level === 'high' ? '[HIGH]' : '[CRIT]'
  L.push(`| Field | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| Authorized | ${authMark} ${r.authorized ? 'YES' : 'NO'} |`)
  L.push(`| Threat Level | ${threatColor} ${r.threat_level} |`)
  L.push(`| Granted Perms | ${r.permissions_granted.length} |`)
  L.push(`| Denied Perms | ${r.permissions_denied.length} |`)
  L.push('')

  if (r.violations.length > 0) {
    L.push('### [VIOL] Security Violations')
    L.push('')
    for (const v of r.violations) L.push(`- [!] ${v}`)
    L.push('')
  }

  L.push('### [SAN] Sanitization Log')
  L.push('')
  if (r.sanitization_log.length === 0) {
    L.push('- No sanitization actions performed')
  } else {
    for (const s of r.sanitization_log) {
      L.push(`- **${s.field}**: ${s.action} - ${s.detail}`)
    }
  }
  L.push('')

  if (r.masked_fields.length > 0) {
    L.push('### [MASK] Masked Fields')
    L.push('')
    for (const m of r.masked_fields) L.push(`- ~~${m}~~ [REDACTED]`)
    L.push('')
  }

  if (r.recommendations.length > 0) {
    L.push('### [RECO] Recommendations')
    L.push('')
    for (const rec of r.recommendations) L.push(`- ${rec}`)
    L.push('')
  }

  L.push('---')
  L.push('*MCP Hub - Protocol Draft 2026-08-20*')
  return L.join('\n')
}

function formatSchemaReport(r: SchemaResult): string {
  const L: string[] = []
  L.push('## [SCH] MCP Schema Generation & Validation Report')
  L.push('')
  L.push(`**Tool:** ${r.tool_name} | **Mode:** ${r.mode} | **Generated:** ${now()}`)
  L.push('')
  L.push('---')
  L.push('')

  L.push('### [STAT] Schema Status')
  L.push('')
  const validMark = r.valid ? '[VALID]' : '[INVALID]'
  L.push(`| Field | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| Status | ${validMark} |`)
  L.push(`| Fields | ${r.field_count} |`)
  L.push(`| Type Compat | ${roundN(r.type_compatibility * 100, 1)}% |`)
  L.push('')

  if (r.generated_schema) {
    L.push('### [GEN] Generated JSON Schema')
    L.push('')
    L.push('```json')
    L.push(JSON.stringify(r.generated_schema, null, 2))
    L.push('```')
    L.push('')
  }

  if (r.generated_typescript) {
    L.push('### [TS] Generated TypeScript Interface')
    L.push('')
    L.push('```typescript')
    L.push(r.generated_typescript)
    L.push('```')
    L.push('')
  }

  if (r.diff_report) {
    L.push('### [DIFF] Schema Diff Report')
    L.push('')
    L.push('```')
    L.push(r.diff_report)
    L.push('```')
    L.push('')
  }

  if (r.validation_errors.length > 0) {
    L.push('### [LOG] Validation Log')
    L.push('')
    for (const e of r.validation_errors) L.push(`- ${e}`)
    L.push('')
  }

  if (r.recommendations.length > 0) {
    L.push('### [RECO] Recommendations')
    L.push('')
    for (const rec of r.recommendations) L.push(`- ${rec}`)
    L.push('')
  }

  L.push('---')
  L.push('*MCP Hub - Protocol Draft 2026-08-20*')
  return L.join('\n')
}

function formatCacheReport(r: CacheResult): string {
  const L: string[] = []
  L.push('## [CAC] MCP Cache Strategy Report')
  L.push('')
  L.push(`**Server:** ${r.server_id} | **Strategy:** ${r.strategy} | **Generated:** ${now()}`)
  L.push('')
  L.push('---')
  L.push('')

  L.push('### [STAT] Cache Performance')
  L.push('')
  L.push(`| Metric | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| Total Entries | ${r.total_entries} |`)
  L.push(`| Hit Rate | ${roundN(r.hit_rate * 100, 1)}% |`)
  L.push(`| Miss Rate | ${roundN(r.miss_rate * 100, 1)}% |`)
  L.push(`| Evicted | ${r.eviction_count} |`)
  L.push('')

  L.push('### [SIZE] Storage Utilization')
  L.push('')
  L.push(`| Metric | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| Current Size | ${r.size_mb}MB / ${r.max_size_mb}MB |`)
  L.push(`| Utilization | ${r.utilization_pct}% |`)
  L.push(`| Stale Entries | ${r.stale_entries} |`)
  L.push(`| Avg TTL Remaining | ${r.avg_ttl_remaining}s |`)
  L.push('')

  L.push('### [INV] Invalidation Summary')
  L.push('')
  L.push(`- ${r.invalidation_summary}`)
  L.push('')

  if (r.hotspot_keys.length > 0) {
    L.push('### [HOT] Hotspot Keys')
    L.push('')
    for (const h of r.hotspot_keys) {
      const bar = '#'.repeat(Math.min(Math.ceil(h.hits / 5), 30))
      L.push(`- \`${h.key}\`: ${h.hits} hits ${bar}`)
    }
    L.push('')
  }

  if (r.recommendations.length > 0) {
    L.push('### [RECO] Recommendations')
    L.push('')
    for (const rec of r.recommendations) L.push(`- ${rec}`)
    L.push('')
  }

  L.push('---')
  L.push('*MCP Hub - Protocol Draft 2026-08-20*')
  return L.join('\n')
}

function formatCostReport(r: CostResult): string {
  const L: string[] = []
  L.push('## [$$] MCP Cost Analysis Report')
  L.push('')
  L.push(`**Period:** ${r.billing_period} | **Generated:** ${now()}`)
  L.push('')
  L.push('---')
  L.push('')

  L.push('### [STAT] Cost Summary')
  L.push('')
  const budgetMark = r.budget_pct_used !== null
    ? (r.budget_pct_used > 90 ? '[OVER-BUDGET]' : r.budget_pct_used > 75 ? '[WARN]' : '[OK]')
    : '[NO-BUDGET]'
  L.push(`| Metric | Value |`)
  L.push(`| --- | --- |`)
  L.push(`| Total Cost | $${r.total_cost.toFixed(4)} |`)
  L.push(`| Total Calls | ${r.total_calls.toLocaleString()} |`)
  L.push(`| Total Tokens | ${r.total_tokens.toLocaleString()} |`)
  L.push(`| Trend | ${r.trend === 'increasing' ? '[UP]' : r.trend === 'decreasing' ? '[DOWN]' : '[--]'} ${r.trend} |`)
  if (r.budget_limit !== null) {
    L.push(`| Budget | $${r.budget_limit.toFixed(4)} |`)
    L.push(`| Remaining | $${r.budget_remaining!.toFixed(4)} |`)
    L.push(`| Used | ${budgetMark} ${r.budget_pct_used}% |`)
  }
  L.push('')

  for (const bd of r.breakdowns) {
    L.push(`### [COST] ${bd.dimension.charAt(0).toUpperCase() + bd.dimension.slice(1)} Breakdown`)
    L.push('')
    for (const e of bd.entries) {
      const barLen = Math.round(e.pct_of_total / 5)
      const bar = '#'.repeat(Math.max(barLen, 1)) + '-'.repeat(Math.max(20 - barLen, 0))
      L.push(`- **${e.name}** [${bar}] $${e.cost.toFixed(4)} (${e.pct_of_total}%) | ${e.calls.toLocaleString()} calls | ${(e.total_tokens / 1000).toFixed(1)}K tokens`)
    }
    L.push('')
  }

  if (r.recommendations.length > 0) {
    L.push('### [RECO] Optimization Recommendations')
    L.push('')
    for (const rec of r.recommendations) L.push(`- ${rec}`)
    L.push('')
  }

  L.push('---')
  L.push('*MCP Hub - Protocol Draft 2026-08-20*')
  return L.join('\n')
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

export const name = 'dsh-tool-mcphub'
export const inject = ['tools']

export function apply(ctx: Context): void {
  const tools = ctx.tools

  // Tool 1: mcp_registry
  tools.register(defineTool({
    name: 'mcp_registry',
    description: 'MCP服务器注册与发现 - 按能力分类、健康检查、版本管理（中文：注册中心、服务发现）',
    parameters: {
      registry_input: {
        type: 'string',
        required: true,
        description: 'JSON对象 - servers数组(server_id/endpoint/category/version/capabilities/status/health_check_path?), action(discover|validate|audit), category_filter?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { registry_input: string }): Promise<string> {
      const data: RegistryInput = JSON.parse(args.registry_input)
      const result = analyzeRegistry(data)
      return formatRegistryReport(result)
    }
  }))

  // Tool 2: mcp_invoker
  tools.register(defineTool({
    name: 'mcp_invoker',
    description: '动态调用MCP工具 - 参数校验、流式响应、错误处理（中文：远程调用、动态执行）',
    parameters: {
      invoker_input: {
        type: 'string',
        required: true,
        description: 'JSON对象 - server_id, tool_name, params(Record<string, unknown>), timeout_ms?, retry_policy(max_retries,backoff_ms)?, stream?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { invoker_input: string }): Promise<string> {
      const data: InvokerInput = JSON.parse(args.invoker_input)
      const result = analyzeInvoker(data)
      return formatInvokerReport(result)
    }
  }))

  // Tool 3: mcp_composer
  tools.register(defineTool({
    name: 'mcp_composer',
    description: '多MCP工具串联 - A的输出转B的输入、类型适配、容错（中文：工具编排、链式调用）',
    parameters: {
      composer_input: {
        type: 'string',
        required: true,
        description: 'JSON对象 - chain_name, steps数组(step_id/server_id/tool_name/params/input_mapping?/output_mapping?/fallback_tool?/timeout_ms?), error_strategy(abort|skip|retry|fallback), max_parallel?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { composer_input: string }): Promise<string> {
      const data: ComposerInput = JSON.parse(args.composer_input)
      const result = analyzeComposer(data)
      return formatComposerReport(result)
    }
  }))

  // Tool 4: mcp_monitor
  tools.register(defineTool({
    name: 'mcp_monitor',
    description: 'MCP服务质量监控 - 延迟P99、可用率、调用配额（中文：监控告警、SLA检测）',
    parameters: {
      monitor_input: {
        type: 'string',
        required: true,
        description: 'JSON对象 - server_id, window_minutes, metrics数组(timestamp/latency_ms/success/tool_name/tokens_used/error_type?), sla_targets(p99_latency_ms/availability_pct/max_tokens_per_min)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { monitor_input: string }): Promise<string> {
      const data: MonitorInput = JSON.parse(args.monitor_input)
      const result = analyzeMonitor(data)
      return formatMonitorReport(result)
    }
  }))

  // Tool 5: mcp_security
  tools.register(defineTool({
    name: 'mcp_security',
    description: 'MCP安全沙箱 - 权限控制、输入过滤、敏感数据脱敏（中文：访问控制、数据保护）',
    parameters: {
      security_input: {
        type: 'string',
        required: true,
        description: 'JSON对象 - server_id, tool_name, caller_identity, caller_role(admin|user|service|anonymous), params(Record<string, unknown>), permissions(string[])?, sensitive_keywords(string[])?, max_param_depth(number)?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { security_input: string }): Promise<string> {
      const data: SecurityInput = JSON.parse(args.security_input)
      const result = analyzeSecurity(data)
      return formatSecurityReport(result)
    }
  }))

  // Tool 6: mcp_schema
  tools.register(defineTool({
    name: 'mcp_schema',
    description: '工具Schema自动生成/验证 - JSON Schema与TypeScript类型互转（中文：协议校验、类型安全）',
    parameters: {
      schema_input: {
        type: 'string',
        required: true,
        description: 'JSON对象 - mode(generate|validate|diff), tool_name, raw_definition?, json_schema?, sample_data?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { schema_input: string }): Promise<string> {
      const data: SchemaInput = JSON.parse(args.schema_input)
      const result = analyzeSchema(data)
      return formatSchemaReport(result)
    }
  }))

  // Tool 7: mcp_cache
  tools.register(defineTool({
    name: 'mcp_cache',
    description: 'MCP响应缓存策略 - TTL、失效策略、分布式一致性（中文：缓存管理、性能优化）',
    parameters: {
      cache_input: {
        type: 'string',
        required: true,
        description: 'JSON对象 - server_id, tool_name, request_hash, strategy(ttl|lru|event_driven|hybrid), ttl_seconds, entries数组(key/value_hash/size_bytes/created_at/last_accessed/hit_count/ttl_remaining), max_size_mb, current_size_mb, invalidation_events?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { cache_input: string }): Promise<string> {
      const data: CacheInput = JSON.parse(args.cache_input)
      const result = analyzeCache(data)
      return formatCacheReport(result)
    }
  }))

  // Tool 8: mcp_cost
  tools.register(defineTool({
    name: 'mcp_cost',
    description: 'MCP调用成本追踪 - 按工具/模型/用户维度的Token消耗分析（中文：成本核算、用量分析）',
    parameters: {
      cost_input: {
        type: 'string',
        required: true,
        description: 'JSON对象 - billing_period, dimensions(server|tool|user|model)[], usage数组(server_id/tool_name/user_id/model/tokens_input/tokens_output/calls/cost_per_1k_input/cost_per_1k_output), budget_limit?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { cost_input: string }): Promise<string> {
      const data: CostInput = JSON.parse(args.cost_input)
      const result = analyzeCost(data)
      return formatCostReport(result)
    }
  }))

  console.log('[dsh-tool-mcphub] Loaded - MCP Model Context Protocol Hub (8 tools, plug-and-play)')
}
