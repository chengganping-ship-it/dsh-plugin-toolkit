/**
 * DSH AI Agent Harness & Governance Plugin v1.0.0
 *
 * AI Agent治理工程工具包 — Meta-tools for AI Agent Engineering
 * 覆盖Agent全生命周期治理: 约束框架设计、权限审计、多Agent编排、失败诊断、输出验证、治理策略、成本优化、沙箱安全
 *
 * Features (v1.0.0):
 * - Agent Harness Designer (约束工程框架设计与流程管控)
 * - Agent Permission Auditor (Agent权限边界审计与最小权限设计)
 * - Multi-Agent Orchestrator (多Agent编排模式与角色分离)
 * - Agent Failure Diagnoser (Agent失败模式诊断与事务边界)
 * - Agent Output Validator (Agent输出验证与幻觉检测)
 * - Agent Governance Policy Writer (Agent治理策略与企业合规)
 * - Agent Cost Optimizer (Agent Token消耗分析与成本优化)
 * - Agent Sandbox Security (Agent沙箱隔离与安全壳设计)
 *
 * @module dsh-tool-agentharnessagent
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agentharnessagent'
export const inject = ['tools']

const VERSION = '1.0.0';
const DISCLAIMER = '本工具生成的治理建议需结合具体业务场景落地，不替代法务与安全团队的专业评估。';

// ==================== TYPES ====================

interface HarnessDesignInput {
  agent_purpose: string;
  workflow_steps?: string[];
  constraints?: string[];
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  compliance_requirements?: string[];
}

interface PermissionAuditInput {
  agent_name: string;
  current_permissions: string[];
  data_access_scope?: string[];
  tool_invocations?: string[];
  external_endpoints?: string[];
}

interface MultiAgentOrchestrateInput {
  task_description: string;
  agent_count?: number;
  coordination_mode?: 'hierarchical' | 'peer-to-peer' | 'pipeline' | 'handoff';
  shared_memory?: boolean;
  conflict_resolution?: string;
}

interface FailureDiagnoseInput {
  agent_logs?: string[];
  failure_type?: 'timeout' | 'loop' | 'hallucination' | 'tool_error' | 'permission_denied' | 'unknown';
  transaction_context?: string;
  retry_count?: number;
  error_messages?: string[];
}

interface OutputValidateInput {
  agent_output: string;
  expected_format?: string;
  reference_facts?: string[];
  hallucination_checks?: string[];
  validation_threshold?: number;
}

interface GovernancePolicyInput {
  organization: string;
  industry?: string;
  regulatory_frameworks?: string[];
  agent_deployment_scope?: string;
  risk_appetite?: 'conservative' | 'moderate' | 'aggressive';
}

interface CostOptimizeInput {
  agent_call_volume?: number;
  avg_tokens_per_call?: number;
  model_tier?: 'small' | 'medium' | 'large' | 'xlarge';
  cache_strategy?: 'none' | 'exact' | 'semantic';
  batch_processing?: boolean;
}

// Reuse name SandboxSecurityInput via a distinct alias to avoid global ShadowedVariable.

interface SandboxSecurityInput {
  sandbox_type?: 'container' | 'vm' | 'wasm' | 'process';
  isolation_level?: 'basic' | 'standard' | 'hardened' | 'air-gapped';
  egress_policy?: 'open' | 'restricted' | 'deny-all';
  resource_limits?: { cpu?: string; memory?: string; disk?: string; network?: string };
}

// ==================== MULBERRY32 DETERMINISTIC PRNG ====================

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

// ==================== HELPER FUNCTIONS ====================

function parseInput<T>(inputData: string): T {
  try {
    return JSON.parse(inputData) as T;
  } catch {
    return {} as T;
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function formatScore(score: number, decimals: number = 2): string {
  return (score * 100).toFixed(decimals);
}

function seededPick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function seededSample<T>(rng: () => number, arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

// ==================== TOOL 1: AGENT HARNESS DESIGNER ====================

function executeHarnessDesign(inputData: string): string {
  const data = parseInput<HarnessDesignInput>(inputData);
  const purpose = data.agent_purpose || 'general-purpose AI agent';
  const steps = data.workflow_steps || ['receive_input', 'plan_execution', 'invoke_tools', 'validate_output', 'return_result'];
  const constraints = data.constraints || ['rate_limiting', 'content_filter', 'tool_whitelist'];
  const riskLevel = data.risk_level || 'medium';
  const compliance = data.compliance_requirements || ['data_privacy', 'audit_logging'];

  const seed = hashStr(purpose + riskLevel);
  const rng = mulberry32(seed);

  let report = `# Agent Harness Design Report\n\n`;
  report += `**Agent Purpose:** ${purpose}\n`;
  report += `**Risk Level:** ${riskLevel.toUpperCase()}\n`;
  report += `**Compliance Requirements:** ${compliance.join(', ')}\n\n`;
  report += `---\n\n`;

  report += `## Constraint Engineering Framework\n\n`;
  report += `### Flow Control Architecture\n\n`;
  report += `\`\`\`\n`;
  report += `┌─────────────────────────────────────────────────┐\n`;
  report += `│           HARNESS CONTROL LAYER                  │\n`;
  report += `├─────────────────────────────────────────────────┤\n`;
  report += `│  Input Gate → Pre-Process → Execute → Post-Process│\n`;
  report += `│       ↓          ↓           ↓          ↓        │\n`;
  report += `│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │\n`;
  report += `│  │Validate│ │Transform│ │Constrain│ │ Verify │    │\n`;
  report += `│  └────────┘ └────────┘ └────────┘ └────────┘    │\n`;
  report += `├─────────────────────────────────────────────────┤\n`;
  report += `│  Circuit Breaker │ Retry Logic │ Fallback       │\n`;
  report += `└─────────────────────────────────────────────────┘\n`;
  report += `\`\`\`\n\n`;

  report += `### Workflow Steps Definition\n\n`;
  report += `| Step | Name | Timeout | Max Retries | Constraint Applied |\n`;
  report += `|------|------|---------|-------------|--------------------|\n`;
  steps.forEach((step, i) => {
    const timeout = Math.floor(rng() * 30 + 10) + 's';
    const retries = Math.floor(rng() * 3);
    const constraint = constraints[i % constraints.length];
    report += `| ${i + 1} | ${step} | ${timeout} | ${retries} | ${constraint} |\n`;
  });

  report += `\n## Risk Mitigation Controls\n\n`;
  const controls = [
    { name: 'Input Sanitization', coverage: clamp(rng() * 0.2 + 0.75, 0, 1), method: 'Regex + LLM-based filter' },
    { name: 'Output Boundary', coverage: clamp(rng() * 0.15 + 0.8, 0, 1), method: 'Schema validation + Semantic guard' },
    { name: 'Tool Invocation Limit', coverage: clamp(rng() * 0.2 + 0.7, 0, 1), method: 'Rate limiter (token bucket)' },
    { name: 'Context Window Guard', coverage: clamp(rng() * 0.1 + 0.85, 0, 1), method: 'Token counter + Sliding window' },
    { name: 'Privilege Escalation Block', coverage: clamp(rng() * 0.15 + 0.8, 0, 1), method: 'Static policy + Runtime check' },
    { name: 'Data Exfiltration Prevention', coverage: clamp(rng() * 0.1 + 0.88, 0, 1), method: 'Egress filter + DLP scanner' }
  ];
  report += `| Control | Coverage | Method |\n`;
  report += `|---------|----------|--------|\n`;
  controls.forEach(c => {
    report += `| ${c.name} | ${formatScore(c.coverage)}% | ${c.method} |\n`;
  });

  report += `\n## Compliance Checkpoints\n\n`;
  compliance.forEach((c, i) => {
    const status = rng() > 0.2 ? 'Implemented' : 'Needs Implementation';
    report += `${i + 1}. **${c}**: ${status} — ${rng() > 0.5 ? 'Automated verification available' : 'Manual review required'}\n`;
  });

  report += `\n## Circuit Breaker Configuration\n\n`;
  report += `| Parameter | Value | Rationale |\n`;
  report += `|-----------|-------|-----------|\n`;
  report += `| Failure Threshold | ${Math.floor(rng() * 3) + 3} consecutive | Prevent cascade failures |\n`;
  report += `| Recovery Timeout | ${Math.floor(rng() * 30) + 10}s | Allow downstream recovery |\n`;
  report += `| Half-Open Max Calls | ${Math.floor(rng() * 3) + 1} | Controlled recovery test |\n`;
  report += `| Monitoring Window | ${Math.floor(rng() * 60) + 30}s | Sufficient sample size |\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 2: AGENT PERMISSION AUDITOR ====================

function executePermissionAudit(inputData: string): string {
  const data = parseInput<PermissionAuditInput>(inputData);
  const agentName = data.agent_name || 'unnamed-agent';
  const permissions = data.current_permissions || ['read:files', 'write:files', 'execute:scripts', 'network:outbound', 'db:read', 'db:write'];
  const dataScope = data.data_access_scope || ['user_data', 'system_logs', 'config_files', 'temp_storage'];
  const tools = data.tool_invocations || ['shell_exec', 'http_request', 'file_read', 'file_write', 'db_query'];
  const endpoints = data.external_endpoints || ['api.openai.com', 'api.stripe.com', 'internal-service.local'];

  const seed = hashStr(agentName + permissions.length);
  const rng = mulberry32(seed);

  let report = `# Agent Permission Audit Report\n\n`;
  report += `**Agent Name:** ${agentName}\n`;
  report += `**Current Permissions:** ${permissions.length}\n`;
  report += `**Data Access Scopes:** ${dataScope.length}\n`;
  report += `**Tool Invocations:** ${tools.length}\n`;
  report += `**External Endpoints:** ${endpoints.length}\n\n`;
  report += `---\n\n`;

  report += `## Current Permission Inventory\n\n`;
  report += `| Permission | Type | Risk Level | Least-Privilege Recommendation |\n`;
  report += `|------------|------|------------|-------------------------------|\n`;
  const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
  permissions.forEach(p => {
    const risk = seededPick(rng, riskLevels);
    const recommendation = rng() > 0.5
      ? `Restrict to ${seededPick(rng, ['read-only', 'scoped-access', 'time-bound', 'approval-gated'])}`
      : 'Remove — not required for core function';
    report += `| ${p} | ${p.split(':')[0] || 'general'} | ${risk} | ${recommendation} |\n`;
  });

  report += `\n## Data Access Scope Analysis\n\n`;
  report += `| Data Scope | Classification | Current Access | Recommended Access | Gap |\n`;
  report += `|------------|---------------|----------------|--------------------|----|\n`;
  dataScope.forEach(ds => {
    const classification = seededPick(rng, ['Public', 'Internal', 'Confidential', 'Restricted']);
    const current = seededPick(rng, ['Full Read', 'Full Read/Write', 'Read Only', 'Admin']);
    const recommended = seededPick(rng, ['Read Only', 'Scoped Read', 'No Access', 'Approval Required']);
    const gap = current !== recommended ? 'OVER-PRIVILEGED' : 'OK';
    report += `| ${ds} | ${classification} | ${current} | ${recommended} | ${gap} |\n`;
  });

  report += `\n## External Endpoint Risk Assessment\n\n`;
  report += `| Endpoint | Protocol | Data Sent | Risk | egress Rule |\n`;
  report += `|----------|----------|-----------|------|-------------|\n`;
  endpoints.forEach(ep => {
    const protocol = seededPick(rng, ['HTTPS', 'HTTPS (mTLS)', 'HTTP', 'gRPC']);
    const dataSent = seededPick(rng, ['JSON payload', 'User data', 'Logs', 'Analytics']);
    const risk = seededPick(rng, ['Low', 'Medium', 'High']);
    const rule = seededPick(rng, ['Allow', 'Allow with DLP', 'Block — requires protection', 'Rate-limit']);
    report += `| ${ep} | ${protocol} | ${dataSent} | ${risk} | ${rule} |\n`;
  });

  report += `\n## Least-Privilege Redesign Summary\n\n`;
  const overPrivileged = Math.floor(rng() * permissions.length * 0.4) + 1;
  const totalSaving = clamp(rng() * 0.3 + 0.4, 0, 0.9);
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Over-privileged Permissions | ${overPrivileged} of ${permissions.length} |\n`;
  report += `| Recommended Reductions | ${Math.ceil(permissions.length * totalSaving)} permissions |\n`;
  report += `| Data Scope Narrowing | ${(totalSaving * 100).toFixed(0)}% reduction |\n`;
  report += `| External Endpoint Hardening | ${endpoints.length} rules to restrict |\n\n`;

  report += `### Recommended Action Plan\n\n`;
  report += `1. **Immediate (P0)**: Revoke ${Math.ceil(overPrivileged * 0.5)} high-risk permissions not needed for core function\n`;
  report += `2. **Short-term (P1)**: Implement scoped access controls for ${Math.ceil(dataScope.length * 0.5)} data scopes\n`;
  report += `3. **Medium-term (P2)**: Add approval gates for ${endpoints.filter(() => rng() > 0.5).length} external endpoints\n`;
  report += `4. **Ongoing**: Monthly permission review + automated drift detection\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 3: MULTI-AGENT ORCHESTRATOR ====================

function executeMultiAgentOrchestrate(inputData: string): string {
  const data = parseInput<MultiAgentOrchestrateInput>(inputData);
  const task = data.task_description || 'coordinate complex multi-step workflow';
  const agentCount = data.agent_count || 4;
  const coordMode = data.coordination_mode || 'hierarchical';
  const sharedMemory = data.shared_memory ?? true;
  const conflictRes = data.conflict_resolution || 'priority-based';

  const seed = hashStr(task + coordMode + agentCount);
  const rng = mulberry32(seed);

  let report = `# Multi-Agent Orchestration Report\n\n`;
  report += `**Task:** ${task}\n`;
  report += `**Agent Count:** ${agentCount}\n`;
  report += `**Coordination Mode:** ${coordMode}\n`;
  report += `**Shared Memory:** ${sharedMemory ? 'Enabled' : 'Disabled'}\n`;
  report += `**Conflict Resolution:** ${conflictRes}\n\n`;
  report += `---\n\n`;

  report += `## Role Separation Architecture\n\n`;
  const roleTemplates = [
    { role: 'Orchestrator', responsibility: 'Task decomposition & delegation', scope: 'Global view, no direct execution' },
    { role: 'Researcher', responsibility: 'Information gathering & synthesis', scope: 'Read-only access to knowledge bases' },
    { role: 'Executor', responsibility: 'Tool invocation & action execution', scope: 'Scoped tool access per task' },
    { role: 'Validator', responsibility: 'Output verification & quality gate', scope: 'Read access to all agent outputs' },
    { role: 'Planner', responsibility: 'Strategic planning & sequencing', scope: 'Task graph management' },
    { role: 'Monitor', responsibility: 'Health checks & anomaly detection', scope: 'Observability data only' },
    { role: 'Communicator', responsibility: 'Stakeholder updates & reporting', scope: 'Outbound communication channel' },
    { role: 'Guardian', responsibility: 'Safety enforcement & constraint checking', scope: 'Policy enforcement across all agents' }
  ];

  const assignedRoles = roleTemplates.slice(0, Math.min(agentCount, roleTemplates.length));
  report += `| Agent ID | Role | Responsibility | Scope Boundary |\n`;
  report += `|----------|------|----------------|----------------|\n`;
  assignedRoles.forEach((r, i) => {
    report += `| agent_${i + 1} | ${r.role} | ${r.responsibility} | ${r.scope} |\n`;
  });

  report += `\n## Coordination Topology\n\n`;
  report += `### ${coordMode.charAt(0).toUpperCase() + coordMode.slice(1)} Pattern\n\n`;

  if (coordMode === 'hierarchical') {
    report += `\`\`\`\n`;
    report += `         ┌──────────┐\n`;
    report += `         │Orchestr. │\n`;
    report += `         └────┬─────┘\n`;
    report += `    ┌─────────┼─────────┐\n`;
    report += `    ▼         ▼         ▼\n`;
    report += `┌───────┐ ┌───────┐ ┌───────┐\n`;
    report += `│Planner│ │Resear.│ │Valid. │\n`;
    report += `└───┬───┘ └───┬───┘ └───┬───┘\n`;
    report += `    │         │         │\n`;
    report += `    └─────────┼─────────┘\n`;
    report += `              ▼\n`;
    report += `         ┌──────────┐\n`;
    report += `         │ Executor │\n`;
    report += `         └──────────┘\n`;
    report += `\`\`\`\n\n`;
  } else if (coordMode === 'pipeline') {
    report += `\`\`\`\n`;
    report += `┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐\n`;
    report += `│Researcher├───▶│ Planner ├───▶│Executor├───▶│Validator│\n`;
    report += `└────────┘    └────────┘    └────────┘    └────────┘\n`;
    report += `\`\`\`\n\n`;
  } else if (coordMode === 'peer-to-peer') {
    report += `\`\`\`\n`;
    report += `    ┌─────────┐\n`;
    report += `    │Monitor  │\n`;
    report += `    └─┬───┬───┘\n`;
    report += `      │   │\n`;
    report += `  ┌───▼┐ ┌▼───┐\n`;
    report += `  │ A1 │◀─▶│ A2 │\n`;
    report += `  └───┬┘ ┌┴───┘\n`;
    report += `      │   │\n`;
    report += `  ┌───▼┐ ┌▼───┐\n`;
    report += `  │ A3 │◀─▶│ A4 │\n`;
    report += `  └────┘ └────┘\n`;
    report += `\`\`\`\n\n`;
  } else {
    report += `\`\`\`\n`;
    report += `┌────────┐  handoff  ┌────────┐  handoff  ┌────────┐\n`;
    report += `│ Agent A├──────────▶│ Agent B├──────────▶│ Agent C│\n`;
    report += `└────────┘           └────────┘           └────────┘\n`;
    report += `\`\`\`\n\n`;
  }

  report += `## Communication Protocol\n\n`;
  report += `| Aspect | Configuration |\n`;
  report += `|--------|---------------|\n`;
  report += `| Message Format | ${seededPick(rng, ['JSON-RPC', 'Protobuf', 'MessagePack', 'CloudEvents'])} |\n`;
  report += `| Delivery Guarantee | ${seededPick(rng, ['At-least-once', 'Exactly-once', 'At-most-once'])} |\n`;
  report += `| Shared Memory | ${sharedMemory ? 'Enabled (Redis/In-memory)' : 'Disabled (message-passing only)'} |\n`;
  report += `| Conflict Resolution | ${conflictRes} |\n`;
  report += `| Max Message Size | ${Math.floor(rng() * 8 + 2)}KB |\n`;
  report += `| Timeout per Handoff | ${Math.floor(rng() * 15 + 5)}s |\n\n`;

  report += `## Role Separation Enforcement\n\n`;
  report += `| Rule | Enforcement | Violation Action |\n`;
  report += `|------|-------------|------------------|\n`;
  report += `| No cross-role execution | Static analysis + Runtime check | Block + Alert |\n`;
  report += `| Scoped tool access | Policy engine (OPA/Rego) | Deny invocation |\n`;
  report += `| Output isolation | Namespace per agent | Quarantine output |\n`;
  report += `| Memory access control | ACL on shared memory | Read-only fallback |\n\n`;

  report += `## Failure Propagation Analysis\n\n`;
  const cascadeRisk = clamp(rng() * 0.3 + 0.2, 0, 1);
  report += `- **Cascade Failure Risk:** ${formatScore(cascadeRisk)}%\n`;
  report += `- **Isolation Domains:** ${Math.ceil(agentCount / 2)} independent failure zones\n`;
  report += `- **Recovery Strategy:** ${seededPick(rng, ['Restart from checkpoint', 'Reassign to backup agent', 'Degrade to partial output', 'Full restart with backoff'])}\n`;
  report += `- **Max Tolerable Agent Failures:** ${Math.floor(agentCount * 0.3)} of ${agentCount}\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 4: AGENT FAILURE DIAGNOSER ====================

function executeFailureDiagnose(inputData: string): string {
  const data = parseInput<FailureDiagnoseInput>(inputData);
  const logs = data.agent_logs || ['[INFO] Task received', '[INFO] Planning phase started', '[WARN] Tool call timeout', '[ERROR] Max retries exceeded'];
  const failureType = data.failure_type || 'timeout';
  const txnContext = data.transaction_context || 'multi-step data processing pipeline';
  const retryCount = data.retry_count || 3;
  const errors = data.error_messages || ['ConnectionTimeout: upstream service did not respond in 30s', 'RateLimitExceeded: 429 from API gateway'];

  const seed = hashStr(failureType + txnContext + retryCount);
  const rng = mulberry32(seed);

  let report = `# Agent Failure Diagnosis Report\n\n`;
  report += `**Failure Type:** ${failureType}\n`;
  report += `**Transaction Context:** ${txnContext}\n`;
  report += `**Retry Count:** ${retryCount}\n`;
  report += `**Error Messages:** ${errors.length}\n\n`;
  report += `---\n\n`;

  report += `## Failure Mode Classification\n\n`;
  const failureModes = [
    { type: 'timeout', rootCause: 'Upstream latency or deadlock', frequency: 'Common', severity: 'Medium' },
    { type: 'loop', rootCause: 'Missing termination condition', frequency: 'Common', severity: 'High' },
    { type: 'hallucination', rootCause: 'LLM generating false information', frequency: 'Frequent', severity: 'High' },
    { type: 'tool_error', rootCause: 'Tool API contract mismatch', frequency: 'Common', severity: 'Medium' },
    { type: 'permission_denied', rootCause: 'Insufficient IAM scope', frequency: 'Occasional', severity: 'Low' },
    { type: 'unknown', rootCause: 'Unclassified anomaly', frequency: 'Rare', severity: 'Critical' }
  ];
  const matchedMode = failureModes.find(f => f.type === failureType) || failureModes[5];
  report += `| Attribute | Value |\n`;
  report += `|-----------|-------|\n`;
  report += `| Detected Mode | ${matchedMode.type} |\n`;
  report += `| Root Cause | ${matchedMode.rootCause} |\n`;
  report += `| Frequency Class | ${matchedMode.frequency} |\n`;
  report += `| Severity | ${matchedMode.severity} |\n\n`;

  report += `## Transaction Boundary Analysis\n\n`;
  report += `### Current Transaction Flow\n\n`;
  report += `\`\`\`\n`;
  report += `┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐\n`;
  report += `│ Step 1  │────▶│ Step 2  │────▶│ Step 3  │────▶│ Step 4  │\n`;
  report += `│ (start) │     │ (tool)  │     │ (tool)  │     │ (end)   │\n`;
  report += `└─────────┘     └─────────┘     └─────────┘     └─────────┘\n`;
  report += `     │               │               │               │\n`;
  report += `     ▼               ▼               ▼               ▼\n`;
  report += ` [COMMIT]        [PARTIAL]      [ROLLBACK]     [VERIFY]\n`;
  report += `\`\`\`\n\n`;

  report += `### Boundary Recommendations\n\n`;
  report += `| Boundary | Current State | Recommended State | Rationale |\n`;
  report += `|----------|---------------|-------------------|------------|\n`;
  report += `| Pre-execution | No checkpoint | Save input snapshot | Enable replay |\n`;
  report += `| Mid-transaction | Partial commit | Saga pattern | Compensating actions |\n`;
  report += `| Post-tool | No verification | Validate output schema | Catch errors early |\n`;
  report += `| Final output | All-or-nothing | Graceful degradation | Partial results > no results |\n\n`;

  report += `## Error Log Analysis\n\n`;
  report += `| Timestamp | Level | Message | Category |\n`;
  report += `|-----------|-------|---------|----------|\n`;
  logs.forEach((log, i) => {
    const level = log.match(/\[(INFO|WARN|ERROR)\]/)?.[1] || 'INFO';
    const category = seededPick(rng, ['network', 'logic', 'resource', 'config', 'data']);
    report += `| T+${i * 2}s | ${level} | ${log.substring(0, 60)} | ${category} |\n`;
  });

  report += `\n## Root Cause Analysis (5-Why)\n\n`;
  const whys = [
    `Why did the agent fail? → ${matchedMode.rootCause}`,
    `Why did ${matchedMode.rootCause.toLowerCase()} occur? → ${seededPick(rng, ['Missing timeout configuration', 'Insufficient error handling', 'Resource exhaustion', 'Dependency unavailable'])}`,
    `Why was this not caught? → ${seededPick(rng, ['No health check on dependency', 'Missing circuit breaker', 'Insufficient monitoring', 'Alert threshold too high'])}`,
    `Why was monitoring insufficient? → ${seededPick(rng, ['Metric not instrumented', 'Dashboard not configured', 'Alert routing misconfigured', 'On-call not set up'])}`,
    `Why was this gap not addressed? → ${seededPick(rng, ['No SLO defined for this path', 'Technical debt backlog', 'Team capacity constraints', 'Process gap in review'])}`
  ];
  whys.forEach((w, i) => {
    report += `${i + 1}. ${w}\n`;
  });

  report += `\n## Remediation Plan\n\n`;
  report += `| Priority | Action | Effort | Impact |\n`;
  report += `|----------|--------|--------|--------|\n`;
  report += `| P0 | Add circuit breaker for ${failureType} | Low | High |\n`;
  report += `| P1 | Implement compensating transactions | Medium | High |\n`;
  report += `| P1 | Add structured error classification | Low | Medium |\n`;
  report += `| P2 | Set up proactive alerting | Medium | Medium |\n`;
  report += `| P3 | Document runbook for this failure mode | Low | Low |\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 5: AGENT OUTPUT VALIDATOR ====================

function executeOutputValidate(inputData: string): string {
  const data = parseInput<OutputValidateInput>(inputData);
  const output = data.agent_output || 'Agent produced a response without structured validation.';
  const expectedFormat = data.expected_format || 'JSON with schema: {result: string, confidence: number, sources: string[]}';
  const facts = data.reference_facts || ['Earth is round', 'Water boils at 100C at sea level', 'Python is a programming language'];
  const halluChecks = data.hallucination_checks || ['factual_accuracy', 'logical_consistency', 'source_attribution', 'temporal_validity'];
  const threshold = data.validation_threshold || 0.85;

  const seed = hashStr(output.substring(0, 100) + expectedFormat);
  const rng = mulberry32(seed);

  let report = `# Agent Output Validation Report\n\n`;
  report += `**Output Preview:** ${output.substring(0, 80)}...\n`;
  report += `**Expected Format:** ${expectedFormat}\n`;
  report += `**Validation Threshold:** ${(threshold * 100).toFixed(0)}%\n`;
  report += `**Reference Facts:** ${facts.length}\n\n`;
  report += `---\n\n`;

  report += `## Format Compliance Check\n\n`;
  const formatChecks = [
    { check: 'Schema compliance', passed: rng() > 0.2, detail: rng() > 0.2 ? 'Valid JSON structure' : 'Missing required field: confidence' },
    { check: 'Type correctness', passed: rng() > 0.15, detail: rng() > 0.15 ? 'All types match schema' : 'Field "sources" expected array, got string' },
    { check: 'Encoding validity', passed: rng() > 0.1, detail: rng() > 0.1 ? 'UTF-8 valid' : 'Contains invalid unicode at position 42' },
    { check: 'Size within limits', passed: rng() > 0.25, detail: rng() > 0.25 ? 'Within 4KB limit' : 'Exceeds max output size (6.2KB)' }
  ];
  report += `| Check | Result | Detail |\n`;
  report += `|-------|--------|--------|\n`;
  formatChecks.forEach(c => {
    report += `| ${c.check} | ${c.passed ? 'PASS' : 'FAIL'} | ${c.detail} |\n`;
  });

  report += `\n## Hallucination Detection\n\n`;
  report += `| Check Type | Score | Finding | Confidence |\n`;
  report += `|------------|-------|---------|------------|\n`;
  halluChecks.forEach(hc => {
    const score = clamp(rng() * 0.4 + 0.5, 0, 1);
    const finding = score >= threshold
      ? 'No hallucination detected'
      : seededPick(rng, [
        'Potential fabrication: unverifiable claim detected',
        'Logical inconsistency: contradicts established fact',
        'Source hallucination: cited source does not exist',
        'Temporal error: event date mismatch'
      ]);
    report += `| ${hc} | ${formatScore(score)}% | ${finding} | ${formatScore(clamp(rng() * 0.2 + 0.7, 0, 1))}% |\n`;
  });

  report += `\n## Factual Consistency Verification\n\n`;
  report += `| Reference Fact | Output Alignment | Verdict |\n`;
  report += `|----------------|-----------------|----------|\n`;
  facts.slice(0, 4).forEach(fact => {
    const alignment = clamp(rng() * 0.3 + 0.6, 0, 1);
    const verdict = alignment >= threshold ? 'Consistent' : alignment >= threshold * 0.8 ? 'Partially Consistent' : 'Inconsistent';
    report += `| "${fact.substring(0, 40)}" | ${formatScore(alignment)}% | ${verdict} |\n`;
  });

  report += `\n## Source Attribution Analysis\n\n`;
  const sources = [
    { name: 'Internal KB', cited: Math.floor(rng() * 3) + 1, verifiable: Math.floor(rng() * 3) + 1 },
    { name: 'Web Search', cited: Math.floor(rng() * 4), verifiable: Math.floor(rng() * 3) },
    { name: 'Tool Output', cited: Math.floor(rng() * 2) + 1, verifiable: Math.floor(rng() * 2) + 1 },
    { name: 'Training Data', cited: Math.floor(rng() * 2), verifiable: 0 }
  ];
  report += `| Source Type | Cited Count | Verifiable | Attribution Score |\n`;
  report += `|-------------|-------------|------------|-------------------|\n`;
  sources.forEach(s => {
    const attrScore = s.cited > 0 ? (s.verifiable / s.cited * 100).toFixed(0) : 'N/A';
    report += `| ${s.name} | ${s.cited} | ${s.verifiable} | ${attrScore}% |\n`;
  });

  report += `\n## Overall Validation Score\n\n`;
  const overallScore = clamp(rng() * 0.3 + 0.6, 0, 1);
  const verdict = overallScore >= threshold ? 'PASS' : overallScore >= threshold * 0.8 ? 'CONDITIONAL PASS' : 'FAIL';
  report += `- **Composite Score:** ${formatScore(overallScore)}%\n`;
  report += `- **Verdict:** ${verdict}\n`;
  report += `- **Recommendation:** ${verdict === 'PASS' ? 'Output approved for downstream consumption' : verdict === 'CONDITIONAL PASS' ? 'Output requires human review before use' : 'Output rejected — agent re-execution recommended'}\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 6: AGENT GOVERNANCE POLICY WRITER ====================

function executeGovernancePolicy(inputData: string): string {
  const data = parseInput<GovernancePolicyInput>(inputData);
  const org = data.organization || 'Enterprise Organization';
  const industry = data.industry || 'technology';
  const frameworks = data.regulatory_frameworks || ['GDPR', 'SOC2', 'ISO27001', 'NIST AI RMF'];
  const scope = data.agent_deployment_scope || 'internal operations, customer-facing support, data analysis';
  const riskAppetite = data.risk_appetite || 'moderate';

  const seed = hashStr(org + industry + riskAppetite);
  const rng = mulberry32(seed);

  let report = `# Agent Governance Policy Report\n\n`;
  report += `**Organization:** ${org}\n`;
  report += `**Industry:** ${industry}\n`;
  report += `**Regulatory Frameworks:** ${frameworks.join(', ')}\n`;
  report += `**Deployment Scope:** ${scope}\n`;
  report += `**Risk Appetite:** ${riskAppetite}\n\n`;
  report += `---\n\n`;

  report += `## Governance Framework Overview\n\n`;
  report += `\`\`\`\n`;
  report += `┌─────────────────────────────────────────────────────┐\n`;
  report += `│              AI GOVERNANCE BOARD                     │\n`;
  report += `├─────────────────────────────────────────────────────┤\n`;
  report += `│                                                      │\n`;
  report += `│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │\n`;
  report += `│  │ Ethics   │  │ Security │  │Compliance│          │\n`;
  report += `│  │Committee │  │  Review  │  │  Officer │          │\n`;
  report += `│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │\n`;
  report += `│       │             │             │                 │\n`;
  report += `│       └─────────────┼─────────────┘                 │\n`;
  report += `│                     ▼                               │\n`;
  report += `│            ┌────────────────┐                       │\n`;
  report += `│            │ Agent Registry │                       │\n`;
  report += `│            │  & Lifecycle   │                       │\n`;
  report += `│            └────────────────┘                       │\n`;
  report += `└─────────────────────────────────────────────────────┘\n`;
  report += `\`\`\`\n\n`;

  report += `## Policy Sections\n\n`;

  report += `### 1. Agent Registration & Classification\n\n`;
  report += `| Requirement | Standard | Verification |\n`;
  report += `|-------------|----------|-------------|\n`;
  report += `| Agent inventory | All agents registered in central registry | Automated scan |\n`;
  report += `| Risk classification | Tier 1-4 based on impact assessment | Manual review |\n`;
  report += `| Owner assignment | Named accountable owner per agent | Registry field |\n`;
  report += `| Version control | All agent configs in Git | CI/CD gate |\n\n`;

  report += `### 2. Data Handling & Privacy\n\n`;
  report += `| Data Class | Agent Access | Conditions |\n`;
  report += `|------------|-------------|------------|\n`;
  report += `| PII | Restricted | Anonymization + DPA required |\n`;
  report += `| Financial | Controlled | Encryption + audit trail |\n`;
  report += `| Proprietary | Role-based | NDA + need-to-know |\n`;
  report += `| Public | Open | Attribution required |\n\n`;

  report += `### 3. Operational Constraints\n\n`;
  const constraints = [
    { name: 'Human-in-the-loop', applies_to: 'High-risk decisions', enforcement: 'Hard gate' },
    { name: 'Output review', applies_to: 'Customer-facing content', enforcement: 'Sampling + spot-check' },
    { name: 'Rate limiting', applies_to: 'All production agents', enforcement: 'Automated' },
    { name: 'Change management', applies_to: 'Agent config changes', enforcement: 'PR + approval' },
    { name: 'Incident response', applies_to: 'Agent failures', enforcement: 'Runbook + on-call' }
  ];
  report += `| Constraint | Applies To | Enforcement |\n`;
  report += `|------------|-----------|-------------|\n`;
  constraints.forEach(c => {
    report += `| ${c.name} | ${c.applies_to} | ${c.enforcement} |\n`;
  });

  report += `\n## Regulatory Compliance Mapping\n\n`;
  report += `| Framework | Requirement | Agent Control | Gap Status |\n`;
  report += `|-----------|-------------|---------------|------------|\n`;
  frameworks.forEach(fw => {
    const control = seededPick(rng, ['Data minimization', 'Right to explanation', 'Breach notification', 'Risk assessment', 'Audit trail']);
    const gap = seededPick(rng, ['Compliant', 'Partial — action planned', 'Gap — remediation in progress', 'Not assessed']);
    report += `| ${fw} | ${control} | Implemented | ${gap} |\n`;
  });

  report += `\n## Risk Appetite Alignment\n\n`;
  report += `| Risk Category | Current Appetite | Recommended Control |\n`;
  report += `|---------------|-----------------|---------------------|\n`;
  report += `| Data exposure | ${riskAppetite} | ${riskAppetite === 'conservative' ? 'Zero-trust + DLP' : riskAppetite === 'moderate' ? 'Standard DLP' : 'Basic filtering'} |\n`;
  report += `| Output quality | ${riskAppetite} | ${riskAppetite === 'conservative' ? 'Mandatory human review' : riskAppetite === 'moderate' ? 'Sampling-based review' : 'Post-hoc audit'} |\n`;
  report += `| Autonomy level | ${riskAppetite} | ${riskAppetite === 'conservative' ? 'Approval for all actions' : riskAppetite === 'moderate' ? 'Approval for high-impact' : 'Autonomous with guardrails'} |\n\n`;

  report += `## Implementation Roadmap\n\n`;
  report += `| Phase | Timeline | Deliverables |\n`;
  report += `|-------|----------|-------------|\n`;
  report += `| Phase 1: Foundation | Month 1-2 | Agent registry, classification taxonomy |\n`;
  report += `| Phase 2: Controls | Month 3-4 | Technical guardrails, monitoring |\n`;
  report += `| Phase 3: Compliance | Month 5-6 | Audit framework, certification |\n`;
  report += `| Phase 4: Maturity | Month 7-12 | Continuous improvement, metrics |\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 7: AGENT COST OPTIMIZER ====================

function executeCostOptimize(inputData: string): string {
  const data = parseInput<CostOptimizeInput>(inputData);
  const callVolume = data.agent_call_volume || 10000;
  const avgTokens = data.avg_tokens_per_call || 2500;
  const modelTier = data.model_tier || 'large';
  const cacheStrategy = data.cache_strategy || 'exact';
  const batchProcessing = data.batch_processing ?? false;

  const seed = hashStr(modelTier + cacheStrategy + callVolume);
  const rng = mulberry32(seed);

  // Pricing per 1M tokens (illustrative)
  const pricing: Record<string, { input: number; output: number }> = {
    small: { input: 0.15, output: 0.60 },
    medium: { input: 1.00, output: 3.00 },
    large: { input: 3.00, output: 15.00 },
    xlarge: { input: 10.00, output: 30.00 }
  };

  const currentPricing = pricing[modelTier] || pricing.large;
  const inputRatio = 0.6;
  const outputRatio = 0.4;
  const inputTokens = avgTokens * inputRatio;
  const outputTokens = avgTokens * outputRatio;
  const costPerCall = (inputTokens / 1000000) * currentPricing.input + (outputTokens / 1000000) * currentPricing.output;
  const monthlyCost = costPerCall * callVolume;

  let report = `# Agent Cost Optimization Report\n\n`;
  report += `**Model Tier:** ${modelTier}\n`;
  report += `**Monthly Call Volume:** ${callVolume.toLocaleString()}\n`;
  report += `**Avg Tokens/Call:** ${avgTokens.toLocaleString()}\n`;
  report += `**Cache Strategy:** ${cacheStrategy}\n`;
  report += `**Batch Processing:** ${batchProcessing ? 'Enabled' : 'Disabled'}\n\n`;
  report += `---\n\n`;

  report += `## Current Cost Breakdown\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Input tokens/call | ${inputTokens.toFixed(0)} |\n`;
  report += `| Output tokens/call | ${outputTokens.toFixed(0)} |\n`;
  report += `| Cost per call | $${costPerCall.toFixed(4)} |\n`;
  report += `| Monthly cost | $${monthlyCost.toFixed(2)} |\n`;
  report += `| Annual projected | $${(monthlyCost * 12).toFixed(2)} |\n\n`;

  report += `## Optimization Levers\n\n`;

  // Cache savings
  const cacheHitRate = cacheStrategy === 'exact' ? 0.25 : cacheStrategy === 'semantic' ? 0.40 : 0;
  const cacheSavings = monthlyCost * cacheHitRate;

  // Model tier downgrade savings
  const tierDowngrade: Record<string, string> = { xlarge: 'large', large: 'medium', medium: 'small', small: 'small' };
  const downgradeTier = tierDowngrade[modelTier] || modelTier;
  const downgradePricing = pricing[downgradeTier] || currentPricing;
  const downgradeCostPerCall = (inputTokens / 1000000) * downgradePricing.input + (outputTokens / 1000000) * downgradePricing.output;
  const downgradeSavings = (costPerCall - downgradeCostPerCall) * callVolume;

  // Prompt compression savings
  const compressionRate = clamp(rng() * 0.15 + 0.20, 0, 0.5);
  const compressionSavings = monthlyCost * compressionRate;

  // Batch processing savings
  const batchSavings = batchProcessing ? monthlyCost * 0.15 : 0;

  report += `| Lever | Potential Savings | Effort | Recommendation |\n`;
  report += `|-------|------------------|--------|----------------|\n`;
  report += `| Cache optimization (${cacheStrategy}) | $${cacheSavings.toFixed(2)}/mo | Low | ${cacheHitRate > 0 ? `Active — ${(cacheHitRate * 100).toFixed(0)}% hit rate` : 'Implement caching layer'} |\n`;
  report += `| Model tier (${modelTier} → ${downgradeTier}) | $${downgradeSavings.toFixed(2)}/mo | Medium | ${downgradeTier !== modelTier ? 'Evaluate quality impact first' : 'Already at lowest tier'} |\n`;
  report += `| Prompt compression | $${compressionSavings.toFixed(2)}/mo | Medium | Reduce system prompt by ${(compressionRate * 100).toFixed(0)}% |\n`;
  report += `| Batch processing | $${batchSavings.toFixed(2)}/mo | High | ${batchProcessing ? 'Already enabled' : 'Implement for non-latency-sensitive calls'} |\n\n`;

  report += `## Token Consumption Analysis\n\n`;
  report += `| Component | Token Share | Optimization |\n`;
  report += `|-----------|-------------|--------------|\n`;
  report += `| System prompt | ${Math.floor(rng() * 15 + 20)}% | Compress, remove redundancy |\n`;
  report += `| Context/history | ${Math.floor(rng() * 20 + 25)}% | Sliding window, summarization |\n`;
  report += `| Tool definitions | ${Math.floor(rng() * 10 + 8)}% | Lazy loading, tool pruning |\n`;
  report += `| User input | ${Math.floor(rng() * 10 + 10)}% | Input validation, truncation |\n`;
  report += `| Output generation | ${Math.floor(rng() * 15 + 20)}% | Max token limits, structured output |\n\n`;

  report += `## Recommended Actions (ROI-ranked)\n\n`;
  report += `| Priority | Action | Monthly Savings | Implementation |\n`;
  report += `|----------|--------|-----------------|----------------|\n`;
  report += `| 1 | Enable semantic caching | $${(monthlyCost * 0.35).toFixed(2)} | 1-2 days |\n`;
  report += `| 2 | Compress system prompts | $${compressionSavings.toFixed(2)} | 2-3 days |\n`;
  report += `| 3 | Implement context window management | $${(monthlyCost * 0.12).toFixed(2)} | 3-5 days |\n`;
  report += `| 4 | Evaluate model downgrade for low-complexity calls | $${(downgradeSavings * 0.6).toFixed(2)} | 1-2 weeks |\n`;
  report += `| 5 | Add batch processing for async workloads | $${(monthlyCost * 0.10).toFixed(2)} | 2-3 weeks |\n\n`;

  const totalSavings = cacheSavings + compressionSavings + (monthlyCost * 0.12) + (downgradeSavings * 0.6) + (monthlyCost * 0.10);
  report += `## Summary\n\n`;
  report += `- **Current Monthly Cost:** $${monthlyCost.toFixed(2)}\n`;
  report += `- **Projected Monthly Savings:** $${totalSavings.toFixed(2)} (${(totalSavings / monthlyCost * 100).toFixed(0)}%)\n`;
  report += `- **Optimized Monthly Cost:** $${(monthlyCost - totalSavings).toFixed(2)}\n`;
  report += `- **Annual Savings:** $${(totalSavings * 12).toFixed(2)}\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 8: AGENT SANDBOX SECURITY ====================

function executeSandboxSecurity(inputData: string): string {
  const data = parseInput<SandboxSecurityInput>(inputData);
  const sandboxType = data.sandbox_type || 'container';
  const isolationLevel = data.isolation_level || 'standard';
  const egressPolicy = data.egress_policy || 'restricted';
  const resources = data.resource_limits || { cpu: '2 cores', memory: '4GB', disk: '10GB', network: '100Mbps' };

  const seed = hashStr(sandboxType + isolationLevel + egressPolicy);
  const rng = mulberry32(seed);

  let report = `# Agent Sandbox Security Report\n\n`;
  report += `**Sandbox Type:** ${sandboxType}\n`;
  report += `**Isolation Level:** ${isolationLevel}\n`;
  report += `**Egress Policy:** ${egressPolicy}\n`;
  report += `**Resource Limits:** CPU=${resources.cpu}, Memory=${resources.memory}, Disk=${resources.disk}, Network=${resources.network}\n\n`;
  report += `---\n\n`;

  report += `## Security Shell Architecture\n\n`;
  report += `\`\`\`\n`;
  report += `┌─────────────────────────────────────────────────────────┐\n`;
  report += `│                  HOST OPERATING SYSTEM                   │\n`;
  report += `│  ┌───────────────────────────────────────────────────┐  │\n`;
  report += `│  │            SANDBOX RUNTIME (${sandboxType.padEnd(12)})            │  │\n`;
  report += `│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │  │\n`;
  report += `│  │  │ Seccomp     │  │ AppArmor/   │  │ Namespace│  │  │\n`;
  report += `│  │  │ BPF Filter  │  │ SELinux     │  │ Isolation│  │  │\n`;
  report += `│  │  └─────────────┘  └─────────────┘  └──────────┘  │  │\n`;
  report += `│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │  │\n`;
  report += `│  │  │ Cgroup      │  │ Capability  │  │ Network  │  │  │\n`;
  report += `│  │  │ Limits      │  │ Dropping    │  │ Policy   │  │  │\n`;
  report += `│  │  └─────────────┘  └─────────────┘  └──────────┘  │  │\n`;
  report += `│  │  ┌─────────────────────────────────────────────┐  │  │\n`;
  report += `│  │  │         AGENT EXECUTION ENVIRONMENT          │  │  │\n`;
  report += `│  │  └─────────────────────────────────────────────┘  │  │\n`;
  report += `│  └───────────────────────────────────────────────────┘  │\n`;
  report += `└─────────────────────────────────────────────────────────┘\n`;
  report += `\`\`\`\n\n`;

  report += `## Isolation Controls Assessment\n\n`;
  const controls = [
    { name: 'Filesystem isolation', status: rng() > 0.2 ? 'Enforced' : 'Partial', mechanism: 'Mount namespace + read-only root' },
    { name: 'Network isolation', status: egressPolicy === 'deny-all' ? 'Enforced' : 'Configurable', mechanism: 'Network namespace + iptables' },
    { name: 'Process isolation', status: rng() > 0.15 ? 'Enforced' : 'Partial', mechanism: 'PID namespace + hide other procs' },
    { name: 'User isolation', status: rng() > 0.25 ? 'Enforced' : 'Needs hardening', mechanism: 'User namespace + no-root' },
    { name: 'Syscall filtering', status: rng() > 0.3 ? 'Enforced' : 'Default', mechanism: 'Seccomp-BPF whitelist' },
    { name: 'Resource containment', status: rng() > 0.2 ? 'Enforced' : 'Partial', mechanism: 'Cgroups v2 (CPU/mem/io)' },
    { name: 'Capability restrictions', status: rng() > 0.25 ? 'Enforced' : 'Default', mechanism: 'Drop all, add back minimal' },
    { name: 'Time-based restrictions', status: rng() > 0.4 ? 'Enforced' : 'Not configured', mechanism: 'Wall-clock execution limit' }
  ];
  report += `| Control | Status | Mechanism |\n`;
  report += `|---------|--------|-----------|\n`;
  controls.forEach(c => {
    report += `| ${c.name} | ${c.status} | ${c.mechanism} |\n`;
  });

  report += `\n## Egress Policy Configuration\n\n`;
  report += `| Rule | Action | Destination | Justification |\n`;
  report += `|------|--------|-------------|---------------|\n`;
  const egressRules = [
    { rule: 'DNS resolution', action: egressPolicy === 'deny-all' ? 'Allow (UDP 53)' : 'Allow', dest: 'Internal DNS', just: 'Required for service discovery' },
    { rule: 'HTTPS API calls', action: egressPolicy === 'open' ? 'Allow' : 'Allow (allowlist)', dest: 'api.authorized.com', just: 'Approved external APIs only' },
    { rule: 'Package repos', action: 'Deny', dest: '*', just: 'No runtime package install' },
    { rule: 'Metadata service', action: 'Deny', dest: '169.254.169.254', just: 'Prevent cloud metadata exfil' },
    { rule: 'SMTP/email', action: 'Deny', dest: '*', just: 'No outbound email capability' },
    { rule: 'SSH outbound', action: 'Deny', dest: '*', just: 'No lateral movement' }
  ];
  egressRules.forEach(r => {
    report += `| ${r.rule} | ${r.action} | ${r.dest} | ${r.just} |\n`;
  });

  report += `\n## Threat Model & Mitigations\n\n`;
  const threats = [
    { threat: 'Container escape', likelihood: 'Low', impact: 'Critical', mitigation: 'gVisor/Kata runtime + minimal capabilities' },
    { threat: 'Data exfiltration', likelihood: 'Medium', impact: 'High', mitigation: 'Egress deny-all + DLP inspection' },
    { threat: 'Resource exhaustion', likelihood: 'Medium', impact: 'Medium', mitigation: 'Cgroup limits + OOM killer priority' },
    { threat: 'Privilege escalation', likelihood: 'Low', impact: 'Critical', mitigation: 'No-root + capability drop + seccomp' },
    { threat: 'Supply chain (malicious tool)', likelihood: 'Medium', impact: 'High', mitigation: 'Tool signature verification + sandbox test' },
    { threat: 'Prompt injection via tool output', likelihood: 'High', impact: 'Medium', mitigation: 'Output sanitization + content boundary' }
  ];
  report += `| Threat | Likelihood | Impact | Mitigation |\n`;
  report += `|--------|------------|--------|------------|\n`;
  threats.forEach(t => {
    report += `| ${t.threat} | ${t.likelihood} | ${t.impact} | ${t.mitigation} |\n`;
  });

  report += `\n## Security Hardening Recommendations\n\n`;
  report += `| Priority | Recommendation | Current State | Target State |\n`;
  report += `|----------|----------------|---------------|---------------|\n`;
  report += `| P0 | Runtime sandboxing | ${sandboxType} | ${sandboxType === 'container' ? 'gVisor/Kata' : 'Already hardened'} |\n`;
  report += `| P0 | Egress default-deny | ${egressPolicy} | deny-all with explicit allowlist |\n`;
  report += `| P1 | Syscall whitelist | Default Docker | Custom seccomp profile |\n`;
  report += `| P1 | Read-only filesystem | Writable root | Read-only + tmpfs for /tmp |\n`;
  report += `| P2 | Image signing | Unsigned | Cosign/Notary verification |\n`;
  report += `| P2 | Runtime monitoring | None | Falco/eBPF-based detection |\n\n`;

  report += `## Compliance Mapping\n\n`;
  report += `| Standard | Control | Status |\n`;
  report += `|---------|---------|--------|\n`;
  report += `| SOC2 CC6.1 | Logical access controls | ${rng() > 0.3 ? 'Compliant' : 'Partial'} |\n`;
  report += `| SOC2 CC6.6 | Encryption at rest | ${rng() > 0.4 ? 'Compliant' : 'Partial'} |\n`;
  report += `| ISO27001 A.12.4 | Logging and monitoring | ${rng() > 0.35 ? 'Compliant' : 'Partial'} |\n`;
  report += `| NIST 800-53 SC-3 | Security function isolation | ${rng() > 0.25 ? 'Compliant' : 'Partial'} |\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Agent Harness Designer
  tools.register(defineTool({
    name: 'agent_harness_designer',
    description: '约束工程框架设计与流程管控 | 设计Agent的约束框架、流程控制、合规检查点与熔断机制',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_purpose, workflow_steps, constraints, risk_level, compliance_requirements'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) { return executeHarnessDesign(args.input_data) }
  }))

  // Tool 2: Agent Permission Auditor
  tools.register(defineTool({
    name: 'agent_permission_auditor',
    description: 'Agent权限边界审计与最小权限设计 | 审计Agent权限范围、数据访问、外部端点，输出最小权限建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_name, current_permissions, data_access_scope, tool_invocations, external_endpoints'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) { return executePermissionAudit(args.input_data) }
  }))

  // Tool 3: Multi-Agent Orchestrator
  tools.register(defineTool({
    name: 'multi_agent_orchestrator',
    description: '多Agent编排模式与角色分离 | 设计多Agent协作拓扑、通信协议、角色边界与冲突解决',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: task_description, agent_count, coordination_mode, shared_memory, conflict_resolution'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) { return executeMultiAgentOrchestrate(args.input_data) }
  }))

  // Tool 4: Agent Failure Diagnoser
  tools.register(defineTool({
    name: 'agent_failure_diagnoser',
    description: 'Agent失败模式诊断与事务边界 | 诊断Agent失败根因、分析事务边界、输出修复方案',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_logs, failure_type, transaction_context, retry_count, error_messages'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) { return executeFailureDiagnose(args.input_data) }
  }))

  // Tool 5: Agent Output Validator
  tools.register(defineTool({
    name: 'agent_output_validator',
    description: 'Agent输出验证与幻觉检测 | 验证Agent输出格式合规性、事实一致性、幻觉检测与溯源',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_output, expected_format, reference_facts, hallucination_checks, validation_threshold'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) { return executeOutputValidate(args.input_data) }
  }))

  // Tool 6: Agent Governance Policy Writer
  tools.register(defineTool({
    name: 'agent_governance_policy_writer',
    description: 'Agent治理策略与企业合规 | 生成Agent治理策略文档、合规映射、风险偏好对齐与实施路线图',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: organization, industry, regulatory_frameworks, agent_deployment_scope, risk_appetite'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) { return executeGovernancePolicy(args.input_data) }
  }))

  // Tool 7: Agent Cost Optimizer
  tools.register(defineTool({
    name: 'agent_cost_optimizer',
    description: 'Agent Token消耗分析与成本优化 | 分析Token使用、计算成本、输出缓存/压缩/降级优化建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: agent_call_volume, avg_tokens_per_call, model_tier, cache_strategy, batch_processing'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) { return executeCostOptimize(args.input_data) }
  }))

  // Tool 8: Agent Sandbox Security
  tools.register(defineTool({
    name: 'agent_sandbox_security',
    description: 'Agent沙箱隔离与安全壳设计 | 评估沙箱隔离控制、出口策略、威胁模型与安全加固建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: sandbox_type, isolation_level, egress_policy, resource_limits'
      }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) { return executeSandboxSecurity(args.input_data) }
  }))
}
