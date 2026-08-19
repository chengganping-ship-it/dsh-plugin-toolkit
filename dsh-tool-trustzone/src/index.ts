/**
 * dsh-tool-trustzone — Agent Trust & Sandbox Management Plugin for DeepSeek Harness
 *
 * Provides 8 core tools for agent governance:
 *   1. permission_scoper      — Minimal privilege scope definition
 *   2. risk_scorer            — Operation risk scoring (0–100)
 *   3. sandbox_configurator   — Sandbox environment configuration
 *   4. policy_enforcer        — Policy decision engine (allow/deny)
 *   5. trust_chain_validator  — Agent trust chain integrity verification
 *   6. escape_detector        — Anomaly / escape attempt detection
 *   7. resource_quota_manager — Resource quota monitoring & throttling
 *   8. trust_audit_logger     — Structured audit logging & pattern analysis
 *
 * @author chengganping-ship-it
 * @license MIT
 * @version 0.1.0
 */

// ============================================================================
// SECTION 1 — Imports & Shared Utilities
// ============================================================================

import type { ToolDefinition, ToolRunContext } from '@deepseek-ai/dsh-tools';
import type { ContentBlock } from '@deepseek-ai/dsh-llm';

// ---------------------------------------------------------------------------
// Seeded Random Number Generator (deterministic for reproducible scoring)
// ---------------------------------------------------------------------------

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /** Returns an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns a float in [min, max) */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Pick a random element from an array */
  pick<T>(arr: readonly T[]): T {
    return arr[this.nextInt(0, arr.length - 1)] as T;
  }
}

/** Compute a numeric hash from a string (for seeding) */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

// ---------------------------------------------------------------------------
// Shared Types & Enums
// ---------------------------------------------------------------------------

type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';
type IsolationLevel = 'process' | 'container' | 'vm';
type ClearanceLevel = 'top_secret' | 'secret' | 'confidential' | 'internal' | 'public';
type QuotaStatus = 'healthy' | 'warning' | 'critical' | 'exceeded';
type TrustChainStatus = 'valid' | 'partial' | 'broken' | 'unverifiable';
type PolicyDecision = 'allow' | 'deny' | 'escalate';
type EscapeSeverity = 'none' | 'suspicious' | 'anomalous' | 'critical';
type ActionType = 'read' | 'write' | 'execute' | 'delete' | 'admin';

interface ResourceRef {
  id: string;
  type: 'file' | 'network' | 'database' | 'api' | 'process' | 'secret' | 'compute';
  path?: string;
  sensitivity?: ClearanceLevel;
}

interface PermissionGrant {
  resource: string;
  actions: ActionType[];
  conditions?: string[];
  expiry?: string;
}

/** Helper: render a markdown string as a text ContentBlock */
function md(text: string): ContentBlock {
  return { type: 'text', text } as ContentBlock;
}

// ============================================================================
// SECTION 2 — Tool 1: permission_scoper
// ============================================================================

interface PermissionScoperInput {
  agent_role: string;
  task_type: string;
  resources: ResourceRef[];
}

interface PermissionScoperOutput {
  agent_role: string;
  task_type: string;
  minimal_permissions: PermissionGrant[];
  scope_boundary: {
    allowed_resources: string[];
    denied_resources: string[];
    max_privilege_level: string;
    time_bound: string;
  };
  report_markdown: string;
}

const ROLE_PERMISSION_MAP: Record<string, ActionType[]> = {
  'data-analyst': ['read'],
  'data-scientist': ['read', 'write'],
  'devops-engineer': ['read', 'write', 'execute'],
  'security-auditor': ['read', 'admin'],
  'ml-engineer': ['read', 'write', 'execute'],
  'code-reviewer': ['read'],
  'deployment-agent': ['read', 'write', 'execute'],
  'research-agent': ['read'],
  'admin-agent': ['read', 'write', 'execute', 'delete', 'admin'],
};

const TASK_PERMISSION_MAP: Record<string, ActionType[]> = {
  'data-query': ['read'],
  'data-export': ['read'],
  'model-training': ['read', 'write', 'execute'],
  'code-execution': ['read', 'execute'],
  'deployment': ['read', 'write', 'execute'],
  'security-scan': ['read'],
  'system-config': ['read', 'write', 'execute'],
  'report-generation': ['read', 'write'],
  'file-management': ['read', 'write', 'delete'],
};

function deriveMinimalPermissions(
  role: string,
  task: string,
  resources: ResourceRef[]
): PermissionGrant[] {
  const rolePerms = ROLE_PERMISSION_MAP[role] || ['read'];
  const taskPerms = TASK_PERMISSION_MAP[task] || ['read'];
  const combined = new Set<ActionType>([...rolePerms, ...taskPerms]);

  const grants: PermissionGrant[] = [];
  for (const res of resources) {
    let actions = Array.from(combined);
    // Restrict sensitive resources
    if (res.sensitivity === 'top_secret' || res.sensitivity === 'secret') {
      actions = actions.filter((a) => a !== 'delete' && a !== 'admin');
    }
    if (res.type === 'secret') {
      actions = actions.filter((a) => a === 'read');
    }
    if (res.type === 'compute' && !combined.has('execute')) {
      actions = actions.filter((a) => a !== 'execute');
    }
    grants.push({
      resource: res.id,
      actions: actions.length > 0 ? actions : ['read'],
      conditions: res.sensitivity ? [`clearance >= ${res.sensitivity}`] : undefined,
    });
  }
  return grants;
}

function buildScopeBoundary(
  permissions: PermissionGrant[],
  resources: ResourceRef[]
): PermissionScoperOutput['scope_boundary'] {
  const allowed = permissions.map((p) => p.resource);
  const denied = resources
    .filter((r) => !allowed.includes(r.id))
    .map((r) => r.id);
  const allActions = permissions.flatMap((p) => p.actions);
  const maxPriv = allActions.includes('admin')
    ? 'admin'
    : allActions.includes('delete')
      ? 'delete'
      : allActions.includes('execute')
        ? 'execute'
        : allActions.includes('write')
          ? 'write'
          : 'read';
  return {
    allowed_resources: allowed,
    denied_resources: denied,
    max_privilege_level: maxPriv,
    time_bound: 'session-scoped (expires on task completion)',
  };
}

function generatePermissionReport(
  input: PermissionScoperInput,
  permissions: PermissionGrant[],
  boundary: PermissionScoperOutput['scope_boundary']
): string {
  const lines: string[] = [];
  lines.push('# 🔐 Permission Scope Report');
  lines.push('');
  lines.push('## 📋 Input Summary');
  lines.push('');
  lines.push(`| Property | Value |`);
  lines.push(`|----------|-------|`);
  lines.push(`| Agent Role | \`${input.agent_role}\` |`);
  lines.push(`| Task Type | \`${input.task_type}\` |`);
  lines.push(`| Resource Count | ${input.resources.length} |`);
  lines.push('');
  lines.push('## 🎯 Minimal Permissions (Principle of Least Privilege)');
  lines.push('');
  lines.push(`| Resource | Actions | Conditions |`);
  lines.push(`|----------|---------|------------|`);
  for (const p of permissions) {
    const cond = p.conditions?.join(', ') || 'none';
    lines.push(`| \`${p.resource}\` | ${p.actions.join(', ')} | ${cond} |`);
  }
  lines.push('');
  lines.push('## 🚧 Scope Boundary');
  lines.push('');
  lines.push(`| Boundary Element | Value |`);
  lines.push(`|-------------------|-------|`);
  lines.push(`| Allowed Resources | ${boundary.allowed_resources.map((r) => `\`${r}\``).join(', ')} |`);
  lines.push(`| Denied Resources | ${boundary.denied_resources.length > 0 ? boundary.denied_resources.map((r) => `\`${r}\``).join(', ') : '*none*'} |`);
  lines.push(`| Max Privilege Level | \`${boundary.max_privilege_level}\` |`);
  lines.push(`| Time Bound | ${boundary.time_bound} |`);
  lines.push('');
  lines.push('## ✅ Recommendation');
  lines.push('');
  lines.push('> Permissions are scoped to the minimum required for the declared task.');
  lines.push('> Review denied resources if the agent reports access failures.');
  lines.push('');
  return lines.join('\n');
}

function permissionScoper(input: PermissionScoperInput): PermissionScoperOutput {
  const permissions = deriveMinimalPermissions(input.agent_role, input.task_type, input.resources);
  const boundary = buildScopeBoundary(permissions, input.resources);
  const report = generatePermissionReport(input, permissions, boundary);
  return {
    agent_role: input.agent_role,
    task_type: input.task_type,
    minimal_permissions: permissions,
    scope_boundary: boundary,
    report_markdown: report,
  };
}

// ============================================================================
// SECTION 3 — Tool 2: risk_scorer
// ============================================================================

interface RiskScorerInput {
  operation: string;
  target_resource: ResourceRef;
  agent_clearance_level: ClearanceLevel;
}

interface RiskScorerOutput {
  operation: string;
  target_resource: string;
  risk_score: number;
  risk_level: RiskLevel;
  requires_human_approval: boolean;
  risk_factors: { factor: string; contribution: number }[];
  report_markdown: string;
}

const CLEARANCE_RANK: Record<ClearanceLevel, number> = {
  'top_secret': 5,
  'secret': 4,
  'confidential': 3,
  'internal': 2,
  'public': 1,
};

const OPERATION_BASE_RISK: Record<string, number> = {
  'read': 5,
  'write': 25,
  'execute': 40,
  'delete': 60,
  'admin': 75,
  'export': 35,
  'deploy': 50,
  'config-change': 45,
  'privilege-escalation': 90,
  'network-access': 30,
};

const RESOURCE_TYPE_RISK: Record<string, number> = {
  'file': 10,
  'network': 25,
  'database': 30,
  'api': 20,
  'process': 35,
  'secret': 45,
  'compute': 15,
};

function computeRiskScore(
  operation: string,
  resource: ResourceRef,
  clearance: ClearanceLevel,
  rng: SeededRandom
): { score: number; factors: { factor: string; contribution: number }[] } {
  const factors: { factor: string; contribution: number }[] = [];

  // Base risk from operation type
  const opRisk = OPERATION_BASE_RISK[operation] ?? 30;
  factors.push({ factor: `operation_type:${operation}`, contribution: opRisk });

  // Resource type risk
  const resRisk = RESOURCE_TYPE_RISK[resource.type] ?? 15;
  factors.push({ factor: `resource_type:${resource.type}`, contribution: resRisk });

  // Sensitivity mismatch
  const clearanceRank = CLEARANCE_RANK[clearance];
  const sensitivityRank = CLEARANCE_RANK[resource.sensitivity || 'public'];
  const mismatch = Math.max(0, sensitivityRank - clearanceRank);
  const mismatchRisk = mismatch * 15;
  if (mismatchRisk > 0) {
    factors.push({ factor: 'clearance_mismatch', contribution: mismatchRisk });
  }

  // Deterministic jitter (+/- 5)
  const jitter = rng.nextInt(-5, 5);
  factors.push({ factor: 'environmental_jitter', contribution: jitter });

  const rawScore = opRisk + resRisk + mismatchRisk + jitter;
  const score = Math.max(0, Math.min(100, rawScore));
  return { score, factors };
}

function classifyRisk(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'minimal';
}

function generateRiskReport(
  input: RiskScorerInput,
  score: number,
  level: RiskLevel,
  factors: { factor: string; contribution: number }[]
): string {
  const lines: string[] = [];
  const emoji = score >= 80 ? '🔴' : score >= 60 ? '🟠' : score >= 40 ? '🟡' : score >= 20 ? '🟢' : '⚪';
  lines.push(`# ${emoji} Risk Assessment Report`);
  lines.push('');
  lines.push('## 📋 Input Parameters');
  lines.push('');
  lines.push(`| Parameter | Value |`);
  lines.push(`|-----------|-------|`);
  lines.push(`| Operation | \`${input.operation}\` |`);
  lines.push(`| Target Resource | \`${input.target_resource.id}\` (${input.target_resource.type}) |`);
  lines.push(`| Agent Clearance | \`${input.agent_clearance_level}\` |`);
  lines.push(`| Resource Sensitivity | \`${input.target_resource.sensitivity || 'public'}\` |`);
  lines.push('');
  lines.push('## 📊 Risk Score');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| **Score** | **${score}/100** |`);
  lines.push(`| Level | \`${level}\` |`);
  lines.push(`| Human Approval Required | ${score >= 60 ? '✅ Yes' : '❌ No'} |`);
  lines.push('');
  lines.push('## 🔍 Risk Factor Breakdown');
  lines.push('');
  lines.push(`| Factor | Contribution |`);
  lines.push(`|--------|-------------|`);
  for (const f of factors) {
    const sign = f.contribution >= 0 ? '+' : '';
    lines.push(`| \`${f.factor}\` | ${sign}${f.contribution} |`);
  }
  lines.push('');
  lines.push('## 💡 Recommendation');
  lines.push('');
  if (score >= 80) {
    lines.push('> 🚨 **CRITICAL**: This operation poses severe risk. Immediate human review required.');
  } else if (score >= 60) {
    lines.push('> ⚠️ **HIGH**: Elevated risk detected. Human approval recommended before execution.');
  } else if (score >= 40) {
    lines.push('> ⚡ **MEDIUM**: Moderate risk. Proceed with monitoring and logging enabled.');
  } else if (score >= 20) {
    lines.push('> ℹ️ **LOW**: Acceptable risk level. Standard safeguards sufficient.');
  } else {
    lines.push('> ✅ **MINIMAL**: Negligible risk. Safe to proceed.');
  }
  lines.push('');
  return lines.join('\n');
}

function riskScorer(input: RiskScorerInput): RiskScorerOutput {
  const seed = hashString(`${input.operation}:${input.target_resource.id}:${input.agent_clearance_level}`);
  const rng = new SeededRandom(seed);
  const { score, factors } = computeRiskScore(input.operation, input.target_resource, input.agent_clearance_level, rng);
  const level = classifyRisk(score);
  const report = generateRiskReport(input, score, level, factors);
  return {
    operation: input.operation,
    target_resource: input.target_resource.id,
    risk_score: score,
    risk_level: level,
    requires_human_approval: score >= 60,
    risk_factors: factors,
    report_markdown: report,
  };
}

// ============================================================================
// SECTION 4 — Tool 3: sandbox_configurator
// ============================================================================

interface SandboxConfiguratorInput {
  task_risk_level: RiskLevel;
  required_resources: ResourceRef[];
  isolation_level: IsolationLevel;
}

interface SandboxConfiguratorOutput {
  task_risk_level: RiskLevel;
  isolation_level: IsolationLevel;
  sandbox_config: {
    network_access: { enabled: boolean; allowed_hosts: string[]; blocked_ports: number[] };
    filesystem: { read_only_paths: string[]; writable_paths: string[]; max_file_size_mb: number };
    syscalls: { whitelist: string[]; blacklist: string[] };
    resource_limits: { max_cpu_percent: number; max_memory_mb: number; max_processes: number; timeout_seconds: number };
    seccomp_profile: string;
    capabilities_dropped: string[];
  };
  report_markdown: string;
}

const RISK_ISOLATION_MAP: Record<RiskLevel, { cpu: number; mem: number; timeout: number; net: boolean }> = {
  critical: { cpu: 25, mem: 256, timeout: 60, net: false },
  high: { cpu: 50, mem: 512, timeout: 300, net: false },
  medium: { cpu: 75, mem: 1024, timeout: 600, net: true },
  low: { cpu: 90, mem: 2048, timeout: 1800, net: true },
  minimal: { cpu: 100, mem: 4096, timeout: 3600, net: true },
};

const SYSCALL_WHITELIST_BASE = [
  'read', 'write', 'open', 'close', 'fstat', 'mmap', 'mprotect',
  'munmap', 'brk', 'ioctl', 'access', 'pipe', 'select', 'sched_yield',
  'dup', 'dup2', 'nanosleep', 'getpid', 'getppid', 'getuid', 'getgid',
  'rt_sigaction', 'rt_sigprocmask', 'clone', 'fork', 'execve', 'wait4',
  'exit_group', 'fcntl', 'flock', 'fsync', 'ftruncate', 'getcwd',
  'lseek', 'lstat', 'readlink', 'stat', 'unlink', 'gettimeofday',
];

const SYSCALL_BLACKLIST_BASE = [
  'ptrace', 'kexec_load', 'reboot', 'init_module', 'finit_module',
  'delete_module', 'setns', 'unshare', 'mount', 'umount2', 'swapon',
  'swapoff', 'chroot', 'pivot_root', 'bpf', 'perf_event_open',
];

function buildSandboxConfig(
  riskLevel: RiskLevel,
  resources: ResourceRef[],
  isolation: IsolationLevel
): SandboxConfiguratorOutput['sandbox_config'] {
  const riskConfig = RISK_ISOLATION_MAP[riskLevel];
  const needsNetwork = resources.some((r) => r.type === 'network' || r.type === 'api');
  const needsFilesystem = resources.some((r) => r.type === 'file' || r.type === 'database');

  const allowedHosts: string[] = [];
  const writablePaths: string[] = [];
  const readOnlyPaths: string[] = [];

  for (const r of resources) {
    if (r.path) {
      if (r.type === 'file' || r.type === 'database') {
        writablePaths.push(r.path);
      } else {
        readOnlyPaths.push(r.path);
      }
    }
    if (r.type === 'network' && r.path) {
      allowedHosts.push(r.path);
    }
  }

  // Determine syscall whitelist based on isolation level
  const syscallWhitelist: string[] = [...SYSCALL_WHITELIST_BASE];
  if (isolation === 'vm') {
    // VMs can have broader syscall access
    syscallWhitelist.push('socket', 'connect', 'bind', 'listen', 'accept');
  }
  if (needsNetwork && isolation !== 'process') {
    syscallWhitelist.push('socket', 'connect', 'sendto', 'recvfrom', 'sendmsg', 'recvmsg');
  }

  const capabilitiesDropped = [
    'CAP_SYS_ADMIN', 'CAP_NET_ADMIN', 'CAP_SYS_PTRACE', 'CAP_SYS_MODULE',
    'CAP_DAC_OVERRIDE', 'CAP_SETUID', 'CAP_SETGID', 'CAP_SYS_RAWIO',
    'CAP_SYS_BOOT', 'CAP_SYS_TIME', 'CAP_MKNOD', 'CAP_LEASE',
  ];

  if (isolation === 'container') {
    capabilitiesDropped.push('CAP_NET_RAW', 'CAP_SYS_CHROOT');
  }

  return {
    network_access: {
      enabled: riskConfig.net && needsNetwork,
      allowed_hosts: allowedHosts.length > 0 ? allowedHosts : ['*'],
      blocked_ports: [22, 23, 25, 53, 135, 139, 445, 3389],
    },
    filesystem: {
      read_only_paths: readOnlyPaths.length > 0 ? readOnlyPaths : ['/usr', '/lib', '/bin'],
      writable_paths: writablePaths.length > 0 ? writablePaths : ['/tmp/sandbox-workspace'],
      max_file_size_mb: riskLevel === 'critical' ? 10 : riskLevel === 'high' ? 50 : 500,
    },
    syscalls: {
      whitelist: syscallWhitelist,
      blacklist: [...SYSCALL_BLACKLIST_BASE],
    },
    resource_limits: {
      max_cpu_percent: riskConfig.cpu,
      max_memory_mb: riskConfig.mem,
      max_processes: riskLevel === 'critical' ? 5 : riskLevel === 'high' ? 10 : 50,
      timeout_seconds: riskConfig.timeout,
    },
    seccomp_profile: isolation === 'vm' ? 'vm-default' : isolation === 'container' ? 'container-default' : 'restrictive',
    capabilities_dropped: capabilitiesDropped,
  };
}

function generateSandboxReport(
  input: SandboxConfiguratorInput,
  config: SandboxConfiguratorOutput['sandbox_config']
): string {
  const lines: string[] = [];
  lines.push('# 🏖️ Sandbox Configuration Report', '');
  lines.push('## 📋 Configuration Input', '');
  lines.push(`| Parameter | Value |`, `|-----------|-------|`);
  lines.push(`| Task Risk Level | \`${input.task_risk_level}\` |`, `| Isolation Level | \`${input.isolation_level}\` |`);
  lines.push(`| Required Resources | ${input.required_resources.length} |`, '');
  lines.push('## 🌐 Network Access', '');
  lines.push(`| Setting | Value |`, `|---------|-------|`);
  lines.push(`| Enabled | ${config.network_access.enabled ? '✅ Yes' : '❌ No'} |`);
  lines.push(`| Allowed Hosts | ${config.network_access.allowed_hosts.map((h) => `\`${h}\``).join(', ')} |`);
  lines.push(`| Blocked Ports | ${config.network_access.blocked_ports.join(', ')} |`, '');
  lines.push('## 📁 Filesystem', '');
  lines.push(`| Setting | Value |`, `|---------|-------|`);
  lines.push(`| Read-Only Paths | ${config.filesystem.read_only_paths.map((p) => `\`${p}\``).join(', ')} |`);
  lines.push(`| Writable Paths | ${config.filesystem.writable_paths.map((p) => `\`${p}\``).join(', ')} |`);
  lines.push(`| Max File Size | ${config.filesystem.max_file_size_mb} MB |`, '');
  lines.push('## ⚙️ System Calls', '');
  lines.push(`| Category | Count |`, `|----------|-------|`);
  lines.push(`| Whitelisted | ${config.syscalls.whitelist.length} |`, `| Blacklisted | ${config.syscalls.blacklist.length} |`, '');
  lines.push('## 📏 Resource Limits', '');
  lines.push(`| Resource | Limit |`, `|----------|-------|`);
  lines.push(`| Max CPU | ${config.resource_limits.max_cpu_percent}% |`, `| Max Memory | ${config.resource_limits.max_memory_mb} MB |`);
  lines.push(`| Max Processes | ${config.resource_limits.max_processes} |`, `| Timeout | ${config.resource_limits.timeout_seconds}s |`, '');
  lines.push('## 🛡️ Security', '');
  lines.push(`| Setting | Value |`, `|---------|-------|`);
  lines.push(`| Seccomp Profile | \`${config.seccomp_profile}\` |`, `| Capabilities Dropped | ${config.capabilities_dropped.length} |`, '');
  lines.push('## 💡 Notes', '');
  lines.push('> Configuration auto-tuned based on risk level and isolation tier.');
  lines.push('> Adjust resource limits if the task requires extended execution time.', '');
  return lines.join('\n');
}

function sandboxConfigurator(input: SandboxConfiguratorInput): SandboxConfiguratorOutput {
  const config = buildSandboxConfig(input.task_risk_level, input.required_resources, input.isolation_level);
  const report = generateSandboxReport(input, config);
  return {
    task_risk_level: input.task_risk_level,
    isolation_level: input.isolation_level,
    sandbox_config: config,
    report_markdown: report,
  };
}

// ============================================================================
// SECTION 5 — Tool 4: policy_enforcer
// ============================================================================

interface PolicyRule {
  id: string;
  name: string;
  effect: 'allow' | 'deny';
  conditions: {
    operation?: string[];
    resource_type?: string[];
    max_risk_score?: number;
    required_clearance?: ClearanceLevel[];
    time_window?: { start: string; end: string };
  };
  priority: number;
}

interface PolicyEnforcerInput {
  action_request: {
    operation: string;
    target_resource: ResourceRef;
    agent_clearance: ClearanceLevel;
    risk_score: number;
    timestamp: string;
  };
  active_policies: PolicyRule[];
}

interface PolicyEnforcerOutput {
  decision: PolicyDecision;
  violated_policies: PolicyRule[];
  matched_allow: PolicyRule[];
  matched_deny: PolicyRule[];
  report_markdown: string;
}

function evaluatePolicy(
  policy: PolicyRule,
  request: PolicyEnforcerInput['action_request']
): boolean {
  const conds = policy.conditions;

  if (conds.operation && !conds.operation.includes(request.operation)) {
    return false;
  }
  if (conds.resource_type && !conds.resource_type.includes(request.target_resource.type)) {
    return false;
  }
  if (conds.max_risk_score !== undefined && request.risk_score > conds.max_risk_score) {
    return false;
  }
  if (conds.required_clearance && !conds.required_clearance.includes(request.agent_clearance)) {
    return false;
  }
  if (conds.time_window) {
    const now = request.timestamp;
    if (now < conds.time_window.start || now > conds.time_window.end) {
      return false;
    }
  }
  return true;
}

function policyEnforcer(input: PolicyEnforcerInput): PolicyEnforcerOutput {
  const { action_request, active_policies } = input;

  // Sort by priority (higher = evaluated first)
  const sorted = [...active_policies].sort((a, b) => b.priority - a.priority);

  const matchedAllow: PolicyRule[] = [];
  const matchedDeny: PolicyRule[] = [];

  for (const policy of sorted) {
    if (evaluatePolicy(policy, action_request)) {
      if (policy.effect === 'deny') {
        matchedDeny.push(policy);
      } else {
        matchedAllow.push(policy);
      }
    }
  }

  // Deny-overrides: any matched deny takes precedence
  let decision: PolicyDecision = 'allow';
  if (matchedDeny.length > 0) {
    decision = 'deny';
  } else if (matchedAllow.length === 0 && active_policies.length > 0) {
    decision = 'escalate';
  }

  const violated = decision === 'deny' ? matchedDeny : [];

  const lines: string[] = [];
  lines.push('# ⚖️ Policy Enforcement Decision', '');
  lines.push('## 📋 Action Request', '');
  lines.push(`| Field | Value |`, `|-------|-------|`);
  lines.push(`| Operation | \`${action_request.operation}\` |`);
  lines.push(`| Target Resource | \`${action_request.target_resource.id}\` (${action_request.target_resource.type}) |`);
  lines.push(`| Agent Clearance | \`${action_request.agent_clearance}\` |`);
  lines.push(`| Risk Score | ${action_request.risk_score} |`, `| Timestamp | \`${action_request.timestamp}\` |`, '');
  const decisionEmoji = decision === 'allow' ? '✅' : decision === 'deny' ? '🚫' : '⚠️';
  lines.push('## 🎯 Decision', '', `> ${decisionEmoji} **Decision: \`${decision.toUpperCase()}\`**`, '');
  lines.push('## 📜 Policy Evaluation', '');
  lines.push(`| Metric | Count |`, `|--------|-------|`);
  lines.push(`| Active Policies | ${active_policies.length} |`, `| Matched Allow | ${matchedAllow.length} |`);
  lines.push(`| Matched Deny | ${matchedDeny.length} |`, '');
  if (violated.length > 0) {
    lines.push('## 🚫 Violated Policies', '');
    lines.push(`| ID | Name | Priority |`, `|----|------|----------|`);
    for (const p of violated) lines.push(`| \`${p.id}\` | ${p.name} | ${p.priority} |`);
    lines.push('');
  }
  if (matchedAllow.length > 0) {
    lines.push('## ✅ Allowing Policies', '');
    lines.push(`| ID | Name | Priority |`, `|----|------|----------|`);
    for (const p of matchedAllow) lines.push(`| \`${p.id}\` | ${p.name} | ${p.priority} |`);
    lines.push('');
  }
  lines.push('## 💡 Notes', '');
  lines.push('> Deny-overrides strategy: any matched deny policy blocks the action.');
  lines.push('> Escalate decision requires human review before proceeding.', '');

  return {
    decision,
    violated_policies: violated,
    matched_allow: matchedAllow,
    matched_deny: matchedDeny,
    report_markdown: lines.join('\n'),
  };
}

// ============================================================================
// SECTION 6 — Tool 5: trust_chain_validator
// ============================================================================

interface TrustChainNode {
  id: string;
  type: 'root' | 'intermediate' | 'leaf';
  issuer: string;
  subject: string;
  valid_from: string;
  valid_until: string;
  signature_valid: boolean;
  metadata?: Record<string, string>;
}

interface TrustAnchor {
  id: string;
  public_key_fingerprint: string;
  trusted_issuer: string;
  valid_from: string;
  valid_until: string;
}

interface TrustChainValidatorInput {
  agent_chain: TrustChainNode[];
  trust_anchors: TrustAnchor[];
}

interface TrustChainValidatorOutput {
  chain_status: TrustChainStatus;
  chain_length: number;
  broken_points: { node_id: string; reason: string }[];
  anchor_matches: { node_id: string; anchor_id: string }[];
  report_markdown: string;
}

function validateTrustChain(
  chain: TrustChainNode[],
  anchors: TrustAnchor[]
): TrustChainValidatorOutput {
  const brokenPoints: { node_id: string; reason: string }[] = [];
  const anchorMatches: { node_id: string; anchor_id: string }[] = [];

  if (chain.length === 0) {
    return {
      chain_status: 'unverifiable',
      chain_length: 0,
      broken_points: [{ node_id: 'N/A', reason: 'Empty trust chain provided' }],
      anchor_matches: [],
      report_markdown: generateTrustChainReport([], anchors, 'unverifiable', [], []),
    };
  }

  // Check each node
  for (let i = 0; i < chain.length; i++) {
    const node = chain[i]!;

    // Check signature validity
    if (!node.signature_valid) {
      brokenPoints.push({ node_id: node.id, reason: 'Invalid signature' });
    }

    // Check temporal validity (simplified: compare against a fixed reference)
    const now = '2026-08-19T00:00:00Z';
    if (node.valid_from > now) {
      brokenPoints.push({ node_id: node.id, reason: 'Certificate not yet valid' });
    }
    if (node.valid_until < now) {
      brokenPoints.push({ node_id: node.id, reason: 'Certificate expired' });
    }

    // Check chain linkage (issuer of current = subject of previous)
    if (i > 0) {
      const prev = chain[i - 1]!;
      if (node.issuer !== prev.subject) {
        brokenPoints.push({
          node_id: node.id,
          reason: `Issuer mismatch: expected \`${prev.subject}\`, got \`${node.issuer}\``,
        });
      }
    }

    // Check against trust anchors
    for (const anchor of anchors) {
      if (node.issuer === anchor.trusted_issuer && node.type === 'root') {
        anchorMatches.push({ node_id: node.id, anchor_id: anchor.id });
      }
    }
  }

  // Determine overall status
  let status: TrustChainStatus;
  if (brokenPoints.length > 0) {
    status = 'broken';
  } else if (anchorMatches.length === 0 && anchors.length > 0) {
    status = 'unverifiable';
  } else if (chain.some((n) => n.type === 'root') && anchorMatches.length > 0) {
    status = 'valid';
  } else {
    status = 'partial';
  }

  return {
    chain_status: status,
    chain_length: chain.length,
    broken_points: brokenPoints,
    anchor_matches: anchorMatches,
    report_markdown: generateTrustChainReport(chain, anchors, status, brokenPoints, anchorMatches),
  };
}

function generateTrustChainReport(
  chain: TrustChainNode[],
  anchors: TrustAnchor[],
  status: TrustChainStatus,
  brokenPoints: { node_id: string; reason: string }[],
  anchorMatches: { node_id: string; anchor_id: string }[]
): string {
  const statusEmoji: Record<TrustChainStatus, string> = { valid: '✅', partial: '⚠️', broken: '🚫', unverifiable: '❓' };
  const lines: string[] = [];
  lines.push(`# ${statusEmoji[status]} Trust Chain Validation Report`, '');
  lines.push('## 📋 Chain Overview', '');
  lines.push(`| Property | Value |`, `|----------|-------|`);
  lines.push(`| Chain Length | ${chain.length} |`, `| Trust Anchors | ${anchors.length} |`, `| Status | **\`${status}\`** |`, '');
  if (chain.length > 0) {
    lines.push('## 🔗 Chain Nodes', '');
    lines.push(`| # | ID | Type | Issuer | Subject | Valid |`, `|---|----|------|--------|---------|-------|`);
    for (let i = 0; i < chain.length; i++) {
      const n = chain[i]!;
      lines.push(`| ${i + 1} | \`${n.id}\` | ${n.type} | \`${n.issuer}\` | \`${n.subject}\` | ${n.signature_valid ? '✅' : '❌'} |`);
    }
    lines.push('');
  }
  if (anchorMatches.length > 0) {
    lines.push('## ⚓ Anchor Matches', '');
    lines.push(`| Node | Anchor |`, `|------|--------|`);
    for (const m of anchorMatches) lines.push(`| \`${m.node_id}\` | \`${m.anchor_id}\` |`);
    lines.push('');
  }
  if (brokenPoints.length > 0) {
    lines.push('## 🔴 Broken Points', '');
    lines.push(`| Node | Reason |`, `|------|--------|`);
    for (const bp of brokenPoints) lines.push(`| \`${bp.node_id}\` | ${bp.reason} |`);
    lines.push('');
  }
  const rec = status === 'valid'
    ? '> ✅ Trust chain is intact and anchored. Agent identity is verified.'
    : status === 'partial'
      ? '> ⚠️ Chain is internally consistent but not anchored to a known root. Consider adding a trust anchor.'
      : status === 'broken'
        ? '> 🚫 Chain has broken links. Do not trust this agent until the chain is repaired.'
        : '> ❓ Cannot verify chain against known anchors. Manual verification required.';
  lines.push('## 💡 Recommendation', '', rec, '');
  return lines.join('\n');
}

// ============================================================================
// SECTION 7 — Tool 6: escape_detector
// ============================================================================

interface ExecutionLogEntry {
  timestamp: string;
  syscall: string;
  args: string;
  result: string;
  process_id: number;
}

interface EscapeDetectorInput {
  execution_log: ExecutionLogEntry[];
  expected_behavior: {
    allowed_syscalls: string[];
    allowed_processes: number[];
    max_file_ops_per_second: number;
    max_network_connections: number;
  };
}

interface EscapeDetectorOutput {
  overall_severity: EscapeSeverity;
  anomalies: {
    entry: ExecutionLogEntry;
    type: string;
    severity: EscapeSeverity;
    description: string;
  }[];
  escape_attempts: {
    entry: ExecutionLogEntry;
    technique: string;
    confidence: number;
  }[];
  report_markdown: string;
}

const ESCAPE_TECHNIQUES: Record<string, { pattern: RegExp; technique: string }> = {
  'namespace-manipulation': { pattern: /unshare|setns|clone.*CLONE_NEW/i, technique: 'Namespace Manipulation' },
  'container-escape': { pattern: /mount.*cgroup|chroot.*escape|procfs.*write/i, technique: 'Container Escape' },
  'privilege-escalation': { pattern: /setuid|setgid|capset|prctl/i, technique: 'Privilege Escalation' },
  'process-injection': { pattern: /ptrace.*attach|process_vm_writev|memfd_create/i, technique: 'Process Injection' },
  'covert-channel': { pattern: /socket.*raw|packet.*inject|icmp.*tunnel/i, technique: 'Covert Channel' },
};

function detectEscape(
  log: ExecutionLogEntry[],
  expected: EscapeDetectorInput['expected_behavior']
): EscapeDetectorOutput {
  const anomalies: EscapeDetectorOutput['anomalies'] = [];
  const escapeAttempts: EscapeDetectorOutput['escape_attempts'] = [];

  for (const entry of log) {
    // Check for unexpected syscalls
    if (!expected.allowed_syscalls.includes(entry.syscall)) {
      anomalies.push({
        entry,
        type: 'unexpected_syscall',
        severity: 'suspicious',
        description: `Syscall \`${entry.syscall}\` not in expected behavior profile`,
      });
    }

    // Check for unexpected processes
    if (!expected.allowed_processes.includes(entry.process_id)) {
      anomalies.push({
        entry,
        type: 'unexpected_process',
        severity: 'anomalous',
        description: `Process ID ${entry.process_id} not in allowed process list`,
      });
    }

    // Check for known escape techniques
    const fullEntry = `${entry.syscall} ${entry.args} ${entry.result}`;
    for (const [, tech] of Object.entries(ESCAPE_TECHNIQUES)) {
      if (tech.pattern.test(fullEntry)) {
        escapeAttempts.push({
          entry,
          technique: tech.technique,
          confidence: 0.85,
        });
        anomalies.push({
          entry,
          type: 'escape_technique',
          severity: 'critical',
          description: `Detected potential ${tech.technique} attempt`,
        });
      }
    }
  }

  // Determine overall severity
  let severity: EscapeSeverity = 'none';
  if (escapeAttempts.length > 0) {
    severity = 'critical';
  } else if (anomalies.some((a) => a.severity === 'anomalous')) {
    severity = 'anomalous';
  } else if (anomalies.some((a) => a.severity === 'suspicious')) {
    severity = 'suspicious';
  }

  return {
    overall_severity: severity,
    anomalies,
    escape_attempts: escapeAttempts,
    report_markdown: generateEscapeReport(log, expected, severity, anomalies, escapeAttempts),
  };
}

function generateEscapeReport(
  log: ExecutionLogEntry[],
  expected: EscapeDetectorInput['expected_behavior'],
  severity: EscapeSeverity,
  anomalies: EscapeDetectorOutput['anomalies'],
  escapeAttempts: EscapeDetectorOutput['escape_attempts']
): string {
  const lines: string[] = [];
  const sevEmoji: Record<EscapeSeverity, string> = { none: '✅', suspicious: '⚠️', anomalous: '🟠', critical: '🔴' };
  lines.push(`# ${sevEmoji[severity]} Escape Detection Report`, '');
  lines.push('## 📋 Scan Summary', '');
  lines.push(`| Metric | Value |`, `|--------|-------|`);
  lines.push(`| Log Entries Scanned | ${log.length} |`, `| Overall Severity | **\`${severity}\`** |`);
  lines.push(`| Anomalies Found | ${anomalies.length} |`, `| Escape Attempts | ${escapeAttempts.length} |`, '');
  lines.push('## 🎯 Expected Behavior Profile', '');
  lines.push(`| Constraint | Value |`, `|------------|-------|`);
  lines.push(`| Allowed Syscalls | ${expected.allowed_syscalls.length} |`, `| Allowed Processes | ${expected.allowed_processes.length} |`);
  lines.push(`| Max File Ops/sec | ${expected.max_file_ops_per_second} |`, `| Max Network Connections | ${expected.max_network_connections} |`, '');
  if (anomalies.length > 0) {
    lines.push('## 🔍 Anomalies Detected', '');
    lines.push(`| Timestamp | Type | Severity | Description |`, `|-----------|------|----------|-------------|`);
    for (const a of anomalies.slice(0, 50)) {
      lines.push(`| \`${a.entry.timestamp}\` | ${a.type} | ${a.severity} | ${a.description} |`);
    }
    if (anomalies.length > 50) {
      lines.push(`| ... | ... | ... | *${anomalies.length - 50} more anomalies* |`);
    }
    lines.push('');
  }
  if (escapeAttempts.length > 0) {
    lines.push('## 🚨 Escape Attempts', '');
    lines.push(`| Timestamp | Technique | Confidence |`, `|-----------|-----------|------------|`);
    for (const e of escapeAttempts) {
      lines.push(`| \`${e.entry.timestamp}\` | ${e.technique} | ${(e.confidence * 100).toFixed(0)}% |`);
    }
    lines.push('');
  }
  const rec = severity === 'critical'
    ? '> 🔴 **IMMEDIATE ACTION**: Active escape attempt detected. Terminate agent and isolate resources.'
    : severity === 'anomalous'
      ? '> 🟠 **WARNING**: Anomalous behavior detected. Increase monitoring and restrict permissions.'
      : severity === 'suspicious'
        ? '> ⚡ **CAUTION**: Suspicious activity noted. Review logs and tighten sandbox constraints.'
        : '> ✅ **CLEAR**: No escape attempts or anomalies detected. Agent behavior is within expected parameters.';
  lines.push('## 💡 Recommendation', '', rec, '');
  return lines.join('\n');
}

// ============================================================================
// SECTION 8 — Tool 7: resource_quota_manager
// ============================================================================

interface ResourceQuotaManagerInput {
  agent_id: string;
  resource_type: 'cpu' | 'memory' | 'network' | 'storage' | 'api_calls' | 'processes';
  current_usage: number;
  quota_limit: number;
}

interface ResourceQuotaManagerOutput {
  agent_id: string;
  resource_type: string;
  quota_status: QuotaStatus;
  usage_percent: number;
  remaining: number;
  throttling: {
    should_throttle: boolean;
    throttle_percent: number;
    reason: string;
  };
  recommendations: string[];
  report_markdown: string;
}

function computeQuotaStatus(usage: number, limit: number): { status: QuotaStatus; percent: number; remaining: number } {
  const percent = limit > 0 ? (usage / limit) * 100 : 0;
  const remaining = Math.max(0, limit - usage);
  let status: QuotaStatus;
  if (percent >= 100) status = 'exceeded';
  else if (percent >= 85) status = 'critical';
  else if (percent >= 60) status = 'warning';
  else status = 'healthy';
  return { status, percent, remaining };
}

function computeThrottling(status: QuotaStatus, percent: number): ResourceQuotaManagerOutput['throttling'] {
  switch (status) {
    case 'exceeded':
      return { should_throttle: true, throttle_percent: 100, reason: 'Quota exceeded — all operations must be blocked' };
    case 'critical':
      return { should_throttle: true, throttle_percent: 75, reason: 'Critical usage level — aggressive throttling required' };
    case 'warning':
      return { should_throttle: true, throttle_percent: 25, reason: 'Elevated usage — moderate throttling recommended' };
    case 'healthy':
      return { should_throttle: false, throttle_percent: 0, reason: 'Usage within normal range' };
  }
}

function generateQuotaRecommendations(status: QuotaStatus, resourceType: string, percent: number): string[] {
  const recs: string[] = [];
  if (status === 'exceeded') {
    recs.push(`Immediately halt all ${resourceType} operations for this agent`);
    recs.push('Review agent task for resource leaks or infinite loops');
    recs.push('Consider terminating the agent session');
  } else if (status === 'critical') {
    recs.push(`Reduce ${resourceType} allocation or optimize agent workload`);
    recs.push('Enable aggressive rate limiting');
    recs.push('Alert operations team for potential intervention');
  } else if (status === 'warning') {
    recs.push(`Monitor ${resourceType} usage trends for continued growth`);
    recs.push('Consider pre-emptive throttling during peak hours');
  } else {
    recs.push(`${resourceType} usage is healthy — no action required`);
  }
  if (percent > 50) {
    recs.push('Set up alerts at 75% and 90% thresholds for proactive management');
  }
  return recs;
}

function resourceQuotaManager(input: ResourceQuotaManagerInput): ResourceQuotaManagerOutput {
  const { status, percent, remaining } = computeQuotaStatus(input.current_usage, input.quota_limit);
  const throttling = computeThrottling(status, percent);
  const recommendations = generateQuotaRecommendations(status, input.resource_type, percent);

  const statusEmoji: Record<QuotaStatus, string> = { healthy: '🟢', warning: '🟡', critical: '🟠', exceeded: '🔴' };
  const lines: string[] = [];
  lines.push(`# ${statusEmoji[status]} Resource Quota Report`, '');
  lines.push('## 📋 Quota Status', '');
  lines.push(`| Property | Value |`, `|----------|-------|`);
  lines.push(`| Agent ID | \`${input.agent_id}\` |`, `| Resource Type | \`${input.resource_type}\` |`);
  lines.push(`| Current Usage | ${input.current_usage} |`, `| Quota Limit | ${input.quota_limit} |`);
  lines.push(`| Usage Percent | **${percent.toFixed(1)}%** |`, `| Remaining | ${remaining} |`);
  lines.push(`| Status | **\`${status}\`** |`, '');
  lines.push('## 🚦 Throttling', '');
  lines.push(`| Setting | Value |`, `|---------|-------|`);
  lines.push(`| Should Throttle | ${throttling.should_throttle ? '✅ Yes' : '❌ No'} |`);
  lines.push(`| Throttle Percent | ${throttling.throttle_percent}% |`, `| Reason | ${throttling.reason} |`, '');
  lines.push('## 💡 Recommendations', '');
  for (const rec of recommendations) lines.push(`- ${rec}`);
  const filled = Math.round(percent / 5);
  const empty = 20 - filled;
  const gauge = '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));
  lines.push('## 📈 Usage Gauge', '', `> [\`${gauge}\`] ${percent.toFixed(1)}%`, '');

  return {
    agent_id: input.agent_id,
    resource_type: input.resource_type,
    quota_status: status,
    usage_percent: percent,
    remaining,
    throttling,
    recommendations,
    report_markdown: lines.join('\n'),
  };
}

// ============================================================================
// SECTION 9 — Tool 8: trust_audit_logger
// ============================================================================

interface AuditEvent {
  timestamp: string;
  agent_id: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'denied' | 'error';
  risk_score?: number;
  metadata?: Record<string, string>;
}

interface TrustAuditLoggerInput {
  events: AuditEvent[];
  time_range: { start: string; end: string };
}

interface AnomalyPattern {
  pattern_type: string;
  description: string;
  occurrences: number;
  affected_agents: string[];
  severity: RiskLevel;
}

interface TrustAuditLoggerOutput {
  total_events: number;
  time_range: { start: string; end: string };
  summary: {
    success_count: number;
    failure_count: number;
    denied_count: number;
    error_count: number;
    unique_agents: number;
    avg_risk_score: number;
  };
  anomaly_patterns: AnomalyPattern[];
  structured_log: string;
  report_markdown: string;
}

function analyzeAnomalyPatterns(events: AuditEvent[]): AnomalyPattern[] {
  const patterns: AnomalyPattern[] = [];

  // Pattern 1: Repeated failures from same agent
  const agentFailures = new Map<string, number>();
  for (const e of events) {
    if (e.outcome === 'failure') {
      agentFailures.set(e.agent_id, (agentFailures.get(e.agent_id) || 0) + 1);
    }
  }
  for (const [agent, count] of agentFailures) {
    if (count >= 3) {
      patterns.push({
        pattern_type: 'repeated_failures',
        description: `Agent \`${agent}\` has ${count} consecutive failures`,
        occurrences: count,
        affected_agents: [agent],
        severity: count >= 5 ? 'high' : 'medium',
      });
    }
  }

  // Pattern 2: High-risk operations cluster
  const highRiskEvents = events.filter((e) => (e.risk_score ?? 0) >= 70);
  if (highRiskEvents.length >= 3) {
    patterns.push({
      pattern_type: 'high_risk_cluster',
      description: `${highRiskEvents.length} high-risk operations detected in time window`,
      occurrences: highRiskEvents.length,
      affected_agents: [...new Set(highRiskEvents.map((e) => e.agent_id))],
      severity: highRiskEvents.length >= 5 ? 'critical' : 'high',
    });
  }

  // Pattern 3: Denied access spike
  const deniedEvents = events.filter((e) => e.outcome === 'denied');
  if (deniedEvents.length >= 3) {
    patterns.push({
      pattern_type: 'denied_access_spike',
      description: `${deniedEvents.length} access denials detected — possible policy violation attempts`,
      occurrences: deniedEvents.length,
      affected_agents: [...new Set(deniedEvents.map((e) => e.agent_id))],
      severity: deniedEvents.length >= 5 ? 'high' : 'medium',
    });
  }

  // Pattern 4: Unusual action diversity (agent doing many different things)
  const agentActions = new Map<string, Set<string>>();
  for (const e of events) {
    if (!agentActions.has(e.agent_id)) agentActions.set(e.agent_id, new Set());
    (agentActions.get(e.agent_id) as Set<string>).add(e.action);
  }
  for (const [agent, actions] of agentActions) {
    if (actions.size >= 5) {
      patterns.push({
        pattern_type: 'action_diversity_anomaly',
        description: `Agent \`${agent}\` performed ${actions.size} distinct action types`,
        occurrences: actions.size,
        affected_agents: [agent],
        severity: actions.size >= 8 ? 'high' : 'low',
      });
    }
  }

  return patterns;
}

function generateStructuredLog(events: AuditEvent[]): string {
  const header = ['=== TRUST AUDIT LOG ===', `Generated: ${new Date().toISOString()}`, `Events: ${events.length}`, '=======================', ''];
  const rows: string[] = [];
  for (const e of events) {
    const meta = e.metadata ? ` | ${JSON.stringify(e.metadata)}` : '';
    rows.push(`[${e.timestamp}] agent=${e.agent_id} action=${e.action} resource=${e.resource} outcome=${e.outcome} risk=${e.risk_score ?? 'N/A'}${meta}`);
  }
  return [...header, ...rows].join('\n');
}

function generateAuditReport(
  _events: AuditEvent[],
  timeRange: TrustAuditLoggerInput['time_range'],
  summary: TrustAuditLoggerOutput['summary'],
  patterns: AnomalyPattern[]
): string {
  const total = summary.success_count + summary.failure_count + summary.denied_count + summary.error_count;
  const lines: string[] = [];
  lines.push('# 📝 Trust Audit Log Report', '');
  lines.push('## 📋 Summary', '');
  lines.push(`| Metric | Value |`, `|--------|-------|`);
  lines.push(`| Time Range | \`${timeRange.start}\` → \`${timeRange.end}\` |`);
  lines.push(`| Total Events | ${total} |`, `| Unique Agents | ${summary.unique_agents} |`);
  lines.push(`| Avg Risk Score | ${summary.avg_risk_score.toFixed(1)} |`, '');
  lines.push('## 📊 Outcome Distribution', '');
  lines.push(`| Outcome | Count |`, `|---------|-------|`);
  lines.push(`| ✅ Success | ${summary.success_count} |`, `| ❌ Failure | ${summary.failure_count} |`);
  lines.push(`| 🚫 Denied | ${summary.denied_count} |`, `| ⚠️ Error | ${summary.error_count} |`, '');
  if (patterns.length > 0) {
    lines.push('## 🔍 Anomaly Patterns', '');
    lines.push(`| Type | Description | Occurrences | Agents | Severity |`, `|------|-------------|-------------|--------|----------|`);
    for (const p of patterns) {
      lines.push(`| ${p.pattern_type} | ${p.description} | ${p.occurrences} | ${p.affected_agents.map((a) => `\`${a}\``).join(', ')} | ${p.severity} |`);
    }
    lines.push('');
  }
  lines.push('## 💡 Recommendations', '');
  const rec = patterns.some((p) => p.severity === 'critical')
    ? '> 🔴 Critical anomaly patterns detected. Immediate investigation required.'
    : patterns.some((p) => p.severity === 'high')
      ? '> 🟠 High-severity patterns found. Review affected agents and tighten policies.'
      : patterns.length > 0
        ? '> ⚡ Minor anomalies detected. Monitor trends and review if patterns persist.'
        : '> ✅ No anomaly patterns detected. Audit log is clean.';
  lines.push(rec, '');
  return lines.join('\n');
}

function trustAuditLogger(input: TrustAuditLoggerInput): TrustAuditLoggerOutput {
  const { events, time_range } = input;

  const successCount = events.filter((e) => e.outcome === 'success').length;
  const failureCount = events.filter((e) => e.outcome === 'failure').length;
  const deniedCount = events.filter((e) => e.outcome === 'denied').length;
  const errorCount = events.filter((e) => e.outcome === 'error').length;
  const uniqueAgents = new Set(events.map((e) => e.agent_id)).size;
  const riskScores = events.filter((e) => e.risk_score !== undefined).map((e) => e.risk_score as number);
  const avgRisk = riskScores.length > 0 ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length : 0;

  const patterns = analyzeAnomalyPatterns(events);
  const structuredLog = generateStructuredLog(events);
  const report = generateAuditReport(events, time_range, {
    success_count: successCount,
    failure_count: failureCount,
    denied_count: deniedCount,
    error_count: errorCount,
    unique_agents: uniqueAgents,
    avg_risk_score: avgRisk,
  }, patterns);

  return {
    total_events: events.length,
    time_range,
    summary: {
      success_count: successCount,
      failure_count: failureCount,
      denied_count: deniedCount,
      error_count: errorCount,
      unique_agents: uniqueAgents,
      avg_risk_score: avgRisk,
    },
    anomaly_patterns: patterns,
    structured_log: structuredLog,
    report_markdown: report,
  };
}

// ============================================================================
// SECTION 10 — Tool Registration & Exports (via defineTool)
// ============================================================================

/**
 * Helper: create a ToolDefinition with proper typing.
 * The ToolDefinition.execute accepts (args: unknown, exec: ToolRunContext) => Promise<unknown>,
 * so we cast args to the expected input type internally.
 */
function makeTool<I, O>(
  name: string,
  description: string,
  parameters: Record<string, unknown>,
  fn: (input: I) => O
): ToolDefinition {
  return {
    name,
    description,
    parameters,
    output: {
      schema: { type: 'object', additionalProperties: true } as Record<string, unknown>,
      render: (_args: unknown, value: unknown) => [md(JSON.stringify(value, null, 2))],
    },
    execute: (args: unknown, _exec: ToolRunContext): Promise<unknown> => {
      return Promise.resolve(fn(args as I));
    },
  } as ToolDefinition;
}

const permissionScoperTool = makeTool<PermissionScoperInput, PermissionScoperOutput>(
  'permission_scoper',
  'Defines minimal permission scope for an agent based on role, task type, and required resources. Outputs least-privilege grants and scope boundaries.',
  {
    type: 'object',
    properties: {
      agent_role: { type: 'string', description: 'The agent role identifier' },
      task_type: { type: 'string', description: 'The type of task being performed' },
      resources: { type: 'array', description: 'List of resources the agent needs to access' },
    },
    required: ['agent_role', 'task_type', 'resources'],
  },
  permissionScoper
);

const riskScorerTool = makeTool<RiskScorerInput, RiskScorerOutput>(
  'risk_scorer',
  'Scores an operation on a 0-100 risk scale based on operation type, target resource sensitivity, and agent clearance level.',
  {
    type: 'object',
    properties: {
      operation: { type: 'string', description: 'The operation being performed' },
      target_resource: { type: 'object', description: 'The target resource reference' },
      agent_clearance_level: { type: 'string', description: 'The agent clearance level' },
    },
    required: ['operation', 'target_resource', 'agent_clearance_level'],
  },
  riskScorer
);

const sandboxConfiguratorTool = makeTool<SandboxConfiguratorInput, SandboxConfiguratorOutput>(
  'sandbox_configurator',
  'Generates sandbox configuration (network, filesystem, syscalls, resource limits) tuned to the task risk level and required isolation tier.',
  {
    type: 'object',
    properties: {
      task_risk_level: { type: 'string', description: 'Risk level of the task' },
      required_resources: { type: 'array', description: 'Resources required for the task' },
      isolation_level: { type: 'string', description: 'Isolation tier (process, container, vm)' },
    },
    required: ['task_risk_level', 'required_resources', 'isolation_level'],
  },
  sandboxConfigurator
);

const policyEnforcerTool = makeTool<PolicyEnforcerInput, PolicyEnforcerOutput>(
  'policy_enforcer',
  'Evaluates an action request against active policies using deny-overrides strategy. Returns allow/deny/escalate decision.',
  {
    type: 'object',
    properties: {
      action_request: { type: 'object', description: 'The action request to evaluate' },
      active_policies: { type: 'array', description: 'List of active policy rules' },
    },
    required: ['action_request', 'active_policies'],
  },
  policyEnforcer
);

const trustChainValidatorTool = makeTool<TrustChainValidatorInput, TrustChainValidatorOutput>(
  'trust_chain_validator',
  'Validates the integrity of an agent trust chain against known trust anchors. Detects broken links and expired certs.',
  {
    type: 'object',
    properties: {
      agent_chain: { type: 'array', description: 'The trust chain nodes' },
      trust_anchors: { type: 'array', description: 'Known trust anchors' },
    },
    required: ['agent_chain', 'trust_anchors'],
  },
  (input) => validateTrustChain(input.agent_chain, input.trust_anchors)
);

const escapeDetectorTool = makeTool<EscapeDetectorInput, EscapeDetectorOutput>(
  'escape_detector',
  'Analyzes execution logs for sandbox escape attempts, anomalous behavior, and known container/namespace escape techniques.',
  {
    type: 'object',
    properties: {
      execution_log: { type: 'array', description: 'Execution log entries to analyze' },
      expected_behavior: { type: 'object', description: 'Expected behavior profile for comparison' },
    },
    required: ['execution_log', 'expected_behavior'],
  },
  (input) => detectEscape(input.execution_log, input.expected_behavior)
);

const resourceQuotaManagerTool = makeTool<ResourceQuotaManagerInput, ResourceQuotaManagerOutput>(
  'resource_quota_manager',
  'Monitors resource usage against quotas and provides throttling recommendations.',
  {
    type: 'object',
    properties: {
      agent_id: { type: 'string', description: 'The agent identifier' },
      resource_type: { type: 'string', description: 'Type of resource' },
      current_usage: { type: 'number', description: 'Current resource usage amount' },
      quota_limit: { type: 'number', description: 'Maximum allowed quota' },
    },
    required: ['agent_id', 'resource_type', 'current_usage', 'quota_limit'],
  },
  resourceQuotaManager
);

const trustAuditLoggerTool = makeTool<TrustAuditLoggerInput, TrustAuditLoggerOutput>(
  'trust_audit_logger',
  'Generates structured audit logs from agent events and detects anomaly patterns.',
  {
    type: 'object',
    properties: {
      events: { type: 'array', description: 'Audit events to process' },
      time_range: { type: 'object', description: 'Time range for the audit (start, end)' },
    },
    required: ['events', 'time_range'],
  },
  trustAuditLogger
);

export {
  permissionScoperTool,
  riskScorerTool,
  sandboxConfiguratorTool,
  policyEnforcerTool,
  trustChainValidatorTool,
  escapeDetectorTool,
  resourceQuotaManagerTool,
  trustAuditLoggerTool,
};

export type {
  PermissionScoperInput,
  PermissionScoperOutput,
  RiskScorerInput,
  RiskScorerOutput,
  SandboxConfiguratorInput,
  SandboxConfiguratorOutput,
  PolicyEnforcerInput,
  PolicyEnforcerOutput,
  TrustChainValidatorInput,
  TrustChainValidatorOutput,
  EscapeDetectorInput,
  EscapeDetectorOutput,
  ResourceQuotaManagerInput,
  ResourceQuotaManagerOutput,
  TrustAuditLoggerInput,
  TrustAuditLoggerOutput,
  ResourceRef,
  PermissionGrant,
  PolicyRule,
  TrustChainNode,
  TrustAnchor,
  ExecutionLogEntry,
  AuditEvent,
  AnomalyPattern,
  RiskLevel,
  IsolationLevel,
  ClearanceLevel,
  QuotaStatus,
  TrustChainStatus,
  PolicyDecision,
  EscapeSeverity,
};
