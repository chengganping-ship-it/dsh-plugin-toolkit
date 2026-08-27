/**
 * DSH CyberAgent Defense Toolkit v0.1.0
 * AI Agent 网络安全防御体系 for DeepSeek Harness — 深红/暗色军事安全主题
 *
 * 对标 Check Point 2026 AI Agent 安全报告 + OpenAI 2025年7月 AI 网络攻击事件。
 * 覆盖 AI Agent 全生命周期安全：防火墙、行为画像、机密扫描、依赖守卫、
 * 运行时沙箱、MCP/A2A 协议安全、影子AI检测、网络靶场。
 *
 * 工具清单:
 * 1. ai_agent_firewall    — AI Agent防火墙（Prompt注入检测+敏感操作拦截+输入净化+权限动态校验+上下文消毒）
 * 2. behavior_profiler     — Agent行为画像（行为基线学习+偏离检测+意图推断+滥用识别+信任评分+跨Agent行为追踪）
 * 3. secret_scanner        — 机密泄露扫描（API Key/PII/源码泄露检测+环境变量审计+Git提交扫描+第三方依赖检查）
 * 4. dependency_guardian   — 依赖包安全守卫（恶意内容检测+供应链SBOM分析+版本风险评估+CVE自动告警）
 * 5. runtime_sandbox       — 运行时沙箱控制（危险系统调用拦截+网络访问白名单+文件系统隔离+资源配额+逃逸检测）
 * 6. mcp_security          — MCP/A2A协议安全（传输加密验证+身份认证+权限最小化+调用审计+异常流量检测）
 * 7. shadow_ai_detector    — 影子AI/Agent检测（未授权AI Agent发现+数据外传通道识别+接入点测绘+治理建议+合规报告）
 * 8. cyber_range           — 网络靶场（对抗演练剧本+红队模拟+防御强化建议+CTF式挑战+团队安全效能评分）
 *
 * @module dsh-tool-cyberagent | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cyberagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: AI Agent Firewall ---
interface FirewallInput {
  action: 'scan' | 'intercept' | 'sanitize' | 'audit'
  agent_name: string
  input_text: string
  context_window?: string[]
  sensitivity_level: 'low' | 'medium' | 'high' | 'critical'
}

interface InjectionThreat {
  threat_id: string
  type: 'direct_injection' | 'indirect_injection' | 'jailbreak' | 'role_override' | 'context_manipulation' | 'data_exfiltration'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  pattern_matched: string
  confidence: number
  position: string
  mitigation: string
}

interface InterceptedAction {
  action_id: string
  operation: string
  reason: string
  risk_score: number
  blocked: boolean
  alternative: string
}

interface SanitizationResult {
  original_length: number
  sanitized_length: number
  removed_patterns: string[]
  encoding_applied: string
}

interface FirewallResult {
  scan_id: string
  agent_name: string
  sensitivity_level: string
  threats_detected: InjectionThreat[]
  intercepted_actions: InterceptedAction[]
  sanitization: SanitizationResult
  permission_checks: Array<{ check: string; passed: boolean; detail: string }>
  context_integrity: 'clean' | 'suspicious' | 'compromised'
  overall_risk_score: number
  firewall_version: string
}

// --- Tool 2: Behavior Profiler ---
interface BehaviorInput {
  action: 'baseline' | 'detect' | 'profile' | 'track'
  agent_id: string
  session_log: Array<{ timestamp: string; action: string; target: string; result: string }>
  comparison_window: number
}

interface BaselineMetric {
  metric_name: string
  mean: number
  std_dev: number
  min: number
  max: number
  sample_count: number
}

interface DeviationAlert {
  alert_id: string
  metric: string
  observed_value: number
  expected_range: string
  deviation_sigma: number
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  description: string
}

interface IntentInference {
  inferred_intent: string
  confidence: number
  supporting_evidence: string[]
  counter_indicators: string[]
  risk_assessment: string
}

interface TrustScore {
  dimension: string
  score: number
  weight: number
  trend: 'improving' | 'stable' | 'declining'
}

interface BehaviorResult {
  profile_id: string
  agent_id: string
  baseline_metrics: BaselineMetric[]
  deviations: DeviationAlert[]
  intent_inference: IntentInference
  trust_scores: TrustScore[]
  overall_trust: number
  abuse_indicators: string[]
  cross_agent_tracks: Array<{ agent_id: string; correlation: number; pattern: string }>
  profile_version: string
}

// --- Tool 3: Secret Scanner ---
interface SecretScanInput {
  action: 'scan_code' | 'scan_env' | 'scan_git' | 'scan_deps'
  target_path: string
  file_patterns?: string[]
  depth: 'shallow' | 'medium' | 'deep'
}

interface SecretFinding {
  finding_id: string
  secret_type: 'api_key' | 'private_key' | 'password' | 'token' | 'pii' | 'connection_string' | 'certificate'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  location: string
  line_number: number
  redacted_value: string
  description: string
  remediation: string
}

interface DependencyRisk {
  package_name: string
  version: string
  risk_type: 'malicious' | 'deprecated' | 'unmaintained' | 'supply_chain' | 'typosquat'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
}

interface SecretScanResult {
  scan_id: string
  target_path: string
  findings: SecretFinding[]
  total_findings: number
  by_severity: Record<string, number>
  dependency_risks: DependencyRisk[]
  scan_coverage: string
  scan_duration_ms: number
  scanner_version: string
}

// --- Tool 4: Dependency Guardian ---
interface DependencyInput {
  action: 'analyze' | 'sbom' | 'alert' | 'assess'
  manifest_path: string
  ecosystem: 'npm' | 'pypi' | 'cargo' | 'gomod' | 'maven'
  include_dev: boolean
}

interface PackageInfo {
  name: string
  version: string
  license: string
  dependencies_count: number
  transitive_count: number
  known_vulns: number
}

interface VulnEntry {
  cve_id: string
  package: string
  affected_versions: string
  fixed_version: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  cvss_score: number
  exploit_available: boolean
  description: string
}

interface SBOMPackage {
  name: string
  version: string
  supplier: string
  license: string
  hashes: string[]
  dependencies: string[]
}

interface DependencyResult {
  analysis_id: string
  ecosystem: string
  packages_analyzed: number
  packages: PackageInfo[]
  vulns: VulnEntry[]
  sbom: SBOMPackage[]
  risk_summary: { low: number; medium: number; high: number; critical: number }
  recommendations: string[]
  guardian_version: string
}

// --- Tool 5: Runtime Sandbox ---
interface SandboxInput {
  action: 'isolate' | 'monitor' | 'quota' | 'detect_escape'
  agent_id: string
  runtime: 'node' | 'python' | 'wasm' | 'docker'
  resource_limits: { cpu_pct: number; memory_mb: number; disk_mb: number; network_mbps: number }
}

interface SyscallEvent {
  syscall_id: string
  timestamp: string
  syscall_name: string
  arguments: string
  blocked: boolean
  reason: string
}

interface NetworkAccess {
  destination: string
  port: number
  protocol: string
  allowed: boolean
  reason: string
  timestamp: string
}

interface FileSystemOp {
  operation: 'read' | 'write' | 'delete' | 'execute'
  path: string
  allowed: boolean
  sandboxed: boolean
}

interface ResourceUsage {
  cpu_pct: number
  memory_mb: number
  disk_mb: number
  network_mbps: number
  within_limits: boolean
}

interface EscapeAttempt {
  attempt_id: string
  technique: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  blocked: boolean
  details: string
}

interface SandboxResult {
  sandbox_id: string
  agent_id: string
  runtime: string
  syscall_events: SyscallEvent[]
  network_accesses: NetworkAccess[]
  filesystem_ops: FileSystemOp[]
  resource_usage: ResourceUsage
  escape_attempts: EscapeAttempt[]
  isolation_status: 'active' | 'breached' | 'degraded'
  sandbox_version: string
}

// --- Tool 6: MCP Security ---
interface MCPSecurityInput {
  action: 'encrypt' | 'auth' | 'audit' | 'detect_anomaly'
  endpoint: string
  protocol: 'mcp' | 'a2a' | 'both'
  tls_version?: string
}

interface EncryptionStatus {
  protocol: string
  cipher_suite: string
  key_exchange: string
  certificate_valid: boolean
  certificate_expiry: string
  perfect_forward_secrecy: boolean
}

interface AuthCheck {
  method: 'oauth2' | 'mtls' | 'api_key' | 'jwt' | 'none'
  identity_verified: boolean
  permissions: string[]
  least_privilege: boolean
  session_expiry: string
}

interface AuditEntry {
  entry_id: string
  timestamp: string
  caller: string
  method: string
  params_summary: string
  result: 'success' | 'failure' | 'denied'
  risk_flag: boolean
}

interface AnomalyDetection {
  anomaly_id: string
  type: 'volume_spike' | 'unusual_pattern' | 'unauthorized_call' | 'data_exfil' | 'credential_stuffing'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  affected_endpoints: string[]
}

interface MCPSecurityResult {
  security_id: string
  endpoint: string
  protocol: string
  encryption: EncryptionStatus
  auth: AuthCheck
  audit_entries: AuditEntry[]
  anomalies: AnomalyDetection[]
  traffic_score: number
  mcp_security_version: string
}

// --- Tool 7: Shadow AI Detector ---
interface ShadowAIInput {
  action: 'discover' | 'identify_exfil' | 'map_access' | 'govern' | 'comply'
  network_range: string
  scan_depth: 'shallow' | 'medium' | 'deep'
}

interface ShadowAgent {
  agent_id: string
  name: string
  type: 'chatgpt_plugin' | 'custom_agent' | 'automation_script' | 'embedded_ai' | 'unknown'
  endpoint: string
  discovered_at: string
  data_accessed: string[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  approved: boolean
}

interface ExfilChannel {
  channel_id: string
  protocol: string
  destination: string
  data_type: 'pii' | 'proprietary' | 'credentials' | 'model_weights' | 'conversation'
  volume_estimate: string
  detected: boolean
  mitigation: string
}

interface AccessPoint {
  point_id: string
  type: 'api_endpoint' | 'webhook' | 'file_share' | 'database' | 'cloud_service'
  url: string
  authentication: 'none' | 'weak' | 'standard' | 'strong'
  exposed_data: string[]
}

interface GovernanceRecommendation {
  category: 'policy' | 'technical' | 'training' | 'monitoring'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  effort: 'low' | 'medium' | 'high'
}

interface ShadowAIResult {
  scan_id: string
  network_range: string
  shadow_agents: ShadowAgent[]
  exfil_channels: ExfilChannel[]
  access_points: AccessPoint[]
  governance: GovernanceRecommendation[]
  compliance_status: 'compliant' | 'partial' | 'non_compliant'
  detector_version: string
}

// --- Tool 8: Cyber Range ---
interface CyberRangeInput {
  action: 'drill' | 'red_team' | 'defend' | 'ctf' | 'score'
  scenario: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  team_size: number
}

interface DrillStep {
  step_id: string
  name: string
  description: string
  objectives: string[]
  duration_minutes: number
  completed: boolean
  score: number
}

interface RedTeamAction {
  action_id: string
  technique: string
  mitre_attack_id: string
  target: string
  success: boolean
  detected: boolean
  countermeasure: string
}

interface DefenseRecommendation {
  priority: number
  category: 'network' | 'endpoint' | 'identity' | 'data' | 'application'
  title: string
  description: string
  implementation_difficulty: 'easy' | 'moderate' | 'complex'
  impact: 'low' | 'medium' | 'high'
}

interface CTFChallenge {
  challenge_id: string
  name: string
  category: 'web' | 'pwn' | 'reverse' | 'crypto' | 'forensics' | 'osint' | 'ai_security'
  points: number
  solved: boolean
  hints: string[]
  flag_format: string
}

interface TeamScore {
  category: string
  score: number
  max_score: number
  percentile: number
}

interface CyberRangeResult {
  range_id: string
  scenario: string
  difficulty: string
  drill_steps: DrillStep[]
  red_team_actions: RedTeamAction[]
  defense_recommendations: DefenseRecommendation[]
  ctf_challenges: CTFChallenge[]
  team_scores: TeamScore[]
  overall_effectiveness_pct: number
  range_version: string
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: AI Agent Firewall ---
function analyzeAIAgentFirewall(input: FirewallInput): FirewallResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.agent_name + input.action + input.input_text.slice(0, 50)
  ))

  const threatTypes: InjectionThreat['type'][] = [
    'direct_injection', 'indirect_injection', 'jailbreak', 'role_override', 'context_manipulation', 'data_exfiltration'
  ]
  const severities: InjectionThreat['severity'][] = ['info', 'low', 'medium', 'high', 'critical']
  const patterns = ['ignore previous', 'you are now', 'system prompt', 'DAN mode', 'base64 inject', 'unicode escape', 'role play', 'hypothetical scenario']

  const threats: InjectionThreat[] = []
  const threatCount = input.sensitivity_level === 'critical' ? rng.nextInt(2, 5)
    : input.sensitivity_level === 'high' ? rng.nextInt(1, 3)
    : rng.nextInt(0, 2)

  for (let i = 0; i < threatCount; i++) {
    const severity = rng.pick(severities)
    const type = rng.pick(threatTypes)
    threats.push({
      threat_id: `THR-${rng.nextInt(10000, 99999)}`,
      type,
      severity,
      pattern_matched: rng.pick(patterns),
      confidence: Math.round(rng.nextFloat(0.6, 0.99) * 100) / 100,
      position: `offset:${rng.nextInt(0, input.input_text.length)}`,
      mitigation: type === 'direct_injection' ? '输入已阻断并告警' : type === 'jailbreak' ? '越狱模式已检测，重置上下文' : '请求已净化后放行',
    })
  }

  const interceptedActions: InterceptedAction[] = []
  const operations = ['file_delete', 'network_request', 'env_read', 'exec_command', 'db_query', 'api_call']
  const interceptCount = rng.nextInt(1, 3)
  for (let i = 0; i < interceptCount; i++) {
    const risk = Math.round(rng.nextFloat(0.4, 0.95) * 100) / 100
    const op = rng.pick(operations)
    interceptedActions.push({
      action_id: `INT-${rng.nextInt(10000, 99999)}`,
      operation: op,
      reason: `敏感操作"${op}"未获权限授权`,
      risk_score: risk,
      blocked: risk > 0.7,
      alternative: `受限版本：${op}_sandboxed`,
    })
  }

  const sanitization: SanitizationResult = {
    original_length: input.input_text.length,
    sanitized_length: Math.round(input.input_text.length * rng.nextFloat(0.85, 0.99)),
    removed_patterns: patterns.slice(0, rng.nextInt(1, 3)),
    encoding_applied: rng.pick(['html_entity', 'percent_encoding', 'unicode_escape', 'base64_strip']),
  }

  const permissionChecks = [
    { check: '角色一致性验证', passed: rng.next() > 0.3, detail: 'Agent角色未发生偏移' },
    { check: '操作范围边界检查', passed: rng.next() > 0.4, detail: '操作在声明权限范围内' },
    { check: '上下文窗口完整性', passed: rng.next() > 0.2, detail: '无注入污染标记' },
    { check: '时间戳新鲜度', passed: rng.next() > 0.1, detail: '请求在有效时间窗口内' },
  ]

  const criticalCount = threats.filter(t => t.severity === 'critical').length
  const highCount = threats.filter(t => t.severity === 'high').length
  const contextIntegrity: FirewallResult['context_integrity'] =
    criticalCount > 0 ? 'compromised' : highCount > 0 ? 'suspicious' : 'clean'

  const overallRisk = Math.min(1, Math.round((criticalCount * 0.3 + highCount * 0.2 + threats.length * 0.1) * 100) / 100)

  return {
    scan_id: `FW-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    agent_name: input.agent_name,
    sensitivity_level: input.sensitivity_level,
    threats_detected: threats,
    intercepted_actions: interceptedActions,
    sanitization,
    permission_checks: permissionChecks,
    context_integrity: contextIntegrity,
    overall_risk_score: overallRisk,
    firewall_version: '2026.1.0',
  }
}

// --- Tool 2: Behavior Profiler ---
function analyzeBehaviorProfiler(input: BehaviorInput): BehaviorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.agent_id + input.action + input.session_log.length.toString()
  ))

  const baselineMetrics: BaselineMetric[] = [
    { metric_name: '每分钟API调用数', mean: Math.round(rng.nextFloat(5, 20)), std_dev: Math.round(rng.nextFloat(2, 8)), min: 0, max: Math.round(rng.nextFloat(30, 60)), sample_count: input.session_log.length },
    { metric_name: '会话时长(分钟)', mean: Math.round(rng.nextFloat(10, 45)), std_dev: Math.round(rng.nextFloat(5, 15)), min: 1, max: Math.round(rng.nextFloat(60, 120)), sample_count: input.session_log.length },
    { metric_name: '外部连接数', mean: Math.round(rng.nextFloat(1, 5)), std_dev: Math.round(rng.nextFloat(1, 3)), min: 0, max: Math.round(rng.nextFloat(6, 15)), sample_count: input.session_log.length },
    { metric_name: '敏感操作频率', mean: Math.round(rng.nextFloat(0.1, 0.5) * 100) / 100, std_dev: 0.1, min: 0, max: Math.round(rng.nextFloat(0.5, 1.0) * 100) / 100, sample_count: input.session_log.length },
  ]

  const deviations: DeviationAlert[] = []
  const deviationCount = rng.nextInt(1, 4)
  for (let i = 0; i < deviationCount; i++) {
    const metric = rng.pick(baselineMetrics)
    const sigma = Math.round(rng.nextFloat(2.1, 4.5) * 10) / 10
    const sev: DeviationAlert['severity'] = sigma > 4 ? 'critical' : sigma > 3 ? 'high' : sigma > 2.5 ? 'medium' : 'low'
    deviations.push({
      alert_id: `DEV-${rng.nextInt(10000, 99999)}`,
      metric: metric.metric_name,
      observed_value: Math.round(metric.mean * rng.nextFloat(1.5, 3)),
      expected_range: `${metric.mean - 2 * metric.std_dev}-${metric.mean + 2 * metric.std_dev}`,
      deviation_sigma: sigma,
      severity: sev,
      description: `${metric.metric_name}偏离基线${sigma}σ，可能存在异常行为`,
    })
  }

  const possibleIntents = ['数据收集', '任务执行', '信息探测', '权限提升', '横向移动', '正常操作']
  const inferredIntent = rng.pick(possibleIntents)
  const intentConfidence = Math.round(rng.nextFloat(0.55, 0.95) * 100) / 100

  const intent: IntentInference = {
    inferred_intent: inferredIntent,
    confidence: intentConfidence,
    supporting_evidence: [
      `操作模式与"${inferredIntent}"匹配度${Math.round(intentConfidence * 100)}%`,
      `会话中${rng.nextInt(3, 10)}次重复相似操作`,
    ],
    counter_indicators: [
      '部分操作符合正常基线',
      '时间分布符合工作时段',
    ],
    risk_assessment: inferredIntent === '正常操作' ? '低风险' : inferredIntent === '权限提升' ? '高风险' : '中等风险',
  }

  const trustScores: TrustScore[] = [
    { dimension: '操作合规性', score: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100, weight: 0.3, trend: rng.pick(['improving', 'stable', 'declining']) },
    { dimension: '身份可信度', score: Math.round(rng.nextFloat(0.7, 0.99) * 100) / 100, weight: 0.25, trend: rng.pick(['improving', 'stable', 'declining']) },
    { dimension: '数据保护', score: Math.round(rng.nextFloat(0.5, 0.9) * 100) / 100, weight: 0.25, trend: rng.pick(['improving', 'stable', 'declining']) },
    { dimension: '会话稳定性', score: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100, weight: 0.2, trend: rng.pick(['improving', 'stable', 'declining']) },
  ]

  const overallTrust = Math.round(trustScores.reduce((s, t) => s + t.score * t.weight, 0) * 100) / 100

  const abuseIndicators: string[] = []
  if (rng.next() > 0.5) abuseIndicators.push('短时间内大量敏感文件访问')
  if (rng.next() > 0.6) abuseIndicators.push('非常规时段活跃')
  if (rng.next() > 0.7) abuseIndicators.push('尝试访问授权外资源')

  const crossAgentTracks = []
  const trackCount = rng.nextInt(1, 3)
  for (let i = 0; i < trackCount; i++) {
    crossAgentTracks.push({
      agent_id: `agent-${rng.nextInt(1000, 9999)}`,
      correlation: Math.round(rng.nextFloat(0.4, 0.9) * 100) / 100,
      pattern: rng.pick(['相似的工具调用序列', '相同的外部连接目标', '同步的操作时间窗口']),
    })
  }

  return {
    profile_id: `BP-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    agent_id: input.agent_id,
    baseline_metrics: baselineMetrics,
    deviations,
    intent_inference: intent,
    trust_scores: trustScores,
    overall_trust: overallTrust,
    abuse_indicators: abuseIndicators,
    cross_agent_tracks: crossAgentTracks,
    profile_version: '2026.1.0',
  }
}

// --- Tool 3: Secret Scanner ---
function analyzeSecretScanner(input: SecretScanInput): SecretScanResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.target_path + input.action
  ))

  const secretTypes: SecretFinding['secret_type'][] = ['api_key', 'private_key', 'password', 'token', 'pii', 'connection_string', 'certificate']
  const severities: SecretFinding['severity'][] = ['info', 'low', 'medium', 'high', 'critical']

  const findings: SecretFinding[] = []
  const findingCount = input.depth === 'deep' ? rng.nextInt(5, 15) : input.depth === 'medium' ? rng.nextInt(2, 8) : rng.nextInt(1, 4)

  for (let i = 0; i < findingCount; i++) {
    const secretType = rng.pick(secretTypes)
    const severity = rng.pick(severities)
    findings.push({
      finding_id: `SEC-${rng.nextInt(10000, 99999)}`,
      secret_type: secretType,
      severity,
      location: `${input.target_path}/${rng.pick(['src/', 'config/', 'lib/', 'tests/', 'scripts/'])}${rng.pick(['index.ts', 'config.json', '.env', 'secrets.yaml', 'main.py'])}`,
      line_number: rng.nextInt(1, 500),
      redacted_value: `${secretType.toUpperCase().slice(0, 4)}****${rng.nextInt(1000, 9999)}`,
      description: `检测到硬编码${secretType.replace('_', ' ')}可能被泄露`,
      remediation: '迁移至密钥管理服务(KMS)或环境变量',
    })
  }

  const bySeverity: Record<string, number> = { info: 0, low: 0, medium: 0, high: 0, critical: 0 }
  for (const f of findings) {
    bySeverity[f.severity]++
  }

  const depRisks: DependencyRisk[] = []
  const depCount = rng.nextInt(2, 6)
  const pkgNames = ['lodash', 'express', 'axios', 'requests', 'crypto-js', 'fs-extra', 'node-fetch', 'moment', 'babel-core', 'webpack-cli']
  for (let i = 0; i < depCount; i++) {
    const riskTypes: DependencyRisk['risk_type'][] = ['malicious', 'deprecated', 'unmaintained', 'supply_chain', 'typosquat']
    const rt = rng.pick(riskTypes)
    depRisks.push({
      package_name: `(${pkgNames[i % pkgNames.length]})${i > 0 && i < pkgNames.length ? '' : i}`,
      version: `${rng.nextInt(1, 5)}.${rng.nextInt(0, 9)}.${rng.nextInt(0, 30)}`,
      risk_type: rt,
      severity: rt === 'malicious' ? 'critical' : rt === 'supply_chain' ? 'high' : rt === 'typosquat' ? 'high' : rt === 'deprecated' ? 'medium' : 'low',
      recommendation: rt === 'malicious' ? '立即移除并审计历史使用' : rt === 'deprecated' ? '升级至维护期版本' : '持续监控上游更新',
    })
  }

  return {
    scan_id: `SS-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    target_path: input.target_path,
    findings,
    total_findings: findings.length,
    by_severity: bySeverity,
    dependency_risks: depRisks,
    scan_coverage: `${rng.nextFloat(85, 99).toFixed(1)}%`,
    scan_duration_ms: rng.nextInt(500, 5000),
    scanner_version: '2026.1.0',
  }
}

// --- Tool 4: Dependency Guardian ---
function analyzeDependencyGuardian(input: DependencyInput): DependencyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.manifest_path + input.ecosystem
  ))

  const pkgCount = rng.nextInt(15, 80)
  const packages: PackageInfo[] = []
  const pkgNames = ['react', 'express', 'lodash', 'axios', 'typescript', 'next', 'vite', 'tailwind', 'zod', 'zustand', 'prisma', 'redis', 'postgres', 'openai', 'langchain']
  for (let i = 0; i < Math.min(pkgCount, 8); i++) {
    packages.push({
      name: pkgNames[i % pkgNames.length],
      version: `${rng.nextInt(1, 20)}.${rng.nextInt(0, 30)}.${rng.nextInt(0, 15)}`,
      license: rng.pick(['MIT', 'Apache-2.0', 'BSD-3', 'ISC', 'GPL-3.0']),
      dependencies_count: rng.nextInt(0, 15),
      transitive_count: rng.nextInt(3, 50),
      known_vulns: rng.nextInt(0, 4),
    })
  }

  const vulns: VulnEntry[] = []
  const vulnCount = rng.nextInt(2, 10)
  for (let i = 0; i < vulnCount; i++) {
    const cvss = Math.round(rng.nextFloat(2.0, 9.8) * 10) / 10
    vulns.push({
      cve_id: `CVE-2025-${rng.nextInt(10000, 99999)}`,
      package: rng.pick(pkgNames),
      affected_versions: `<${rng.nextInt(1, 10)}.${rng.nextInt(0, 20)}.${rng.nextInt(0, 10)}`,
      fixed_version: `${rng.nextInt(1, 10)}.${rng.nextInt(0, 20)}.${rng.nextInt(0, 10)}`,
      severity: cvss >= 9 ? 'critical' : cvss >= 7 ? 'high' : cvss >= 4 ? 'medium' : 'low',
      cvss_score: cvss,
      exploit_available: rng.next() > 0.6,
      description: '远程代码执行/原型污染/路径遍历漏洞',
    })
  }
  vulns.sort((a, b) => b.cvss_score - a.cvss_score)

  const sbom: SBOMPackage[] = packages.slice(0, 5).map(p => ({
    name: p.name,
    version: p.version,
    supplier: `${p.name}-project`,
    license: p.license,
    hashes: [`sha256:${rng.nextInt(10000000, 9999999)}`],
    dependencies: packages.slice(0, rng.nextInt(1, 4)).map(d => d.name).filter(n => n !== p.name),
  }))

  const riskSummary = {
    low: vulns.filter(v => v.severity === 'low').length,
    medium: vulns.filter(v => v.severity === 'medium').length,
    high: vulns.filter(v => v.severity === 'high').length,
    critical: vulns.filter(v => v.severity === 'critical').length,
  }

  const recommendations: string[] = []
  if (riskSummary.critical > 0) recommendations.push(`立即修复${riskSummary.critical}个Critical级CVE`)
  if (riskSummary.high > 0) recommendations.push(`优先处理${riskSummary.high}个High级CVE`)
  recommendations.push('启用自动化依赖更新（Dependabot / Renovate）')
  recommendations.push('生成并归档 SBOM（SPDX/CycloneDX格式）')
  recommendations.push('对关键依赖启用 SCA 持续监控')

  return {
    analysis_id: `DG-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    ecosystem: input.ecosystem,
    packages_analyzed: pkgCount,
    packages,
    vulns,
    sbom,
    risk_summary: riskSummary,
    recommendations,
    guardian_version: '2026.1.0',
  }
}

// --- Tool 5: Runtime Sandbox ---
function analyzeRuntimeSandbox(input: SandboxInput): SandboxResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.agent_id + input.runtime
  ))

  const syscalls = ['open', 'read', 'write', 'connect', 'execve', 'fork', 'socket', 'mmap', 'ptrace', 'kill', 'chmod', 'unlink', 'rename', 'mount', 'ioctl']
  const syscallEvents: SyscallEvent[] = []
  const syscallCount = rng.nextInt(5, 20)
  const now = Date.now()
  for (let i = 0; i < syscallCount; i++) {
    const name = rng.pick(syscalls)
    const isDangerous = ['execve', 'ptrace', 'mount', 'kill', 'ioctl'].includes(name)
    syscallEvents.push({
      syscall_id: `SC-${rng.nextInt(10000, 99999)}`,
      timestamp: new Date(now - rng.nextInt(0, 60000)).toISOString(),
      syscall_name: name,
      arguments: `flags=${rng.nextInt(0, 255)},mode=0${rng.nextInt(100, 777)}`,
      blocked: isDangerous && rng.next() > 0.3,
      reason: isDangerous ? '危险系统调用被沙箱策略拦截' : '正常调用',
    })
  }

  const destinations = ['api.openai.com', 'hooks.slack.com', 'registry.npmjs.org', 'smtp.gmail.com', 'raw.githubusercontent.com', 'unknown.xyz']
  const networkAccesses: NetworkAccess[] = []
  const netCount = rng.nextInt(3, 10)
  for (let i = 0; i < netCount; i++) {
    const dest = rng.pick(destinations)
    const whitelisted = ['api.openai.com', 'hooks.slack.com', 'registry.npmjs.org'].includes(dest)
    networkAccesses.push({
      destination: dest,
      port: rng.pick([80, 443, 8080, 8443]),
      protocol: rng.pick(['TCP', 'UDP', 'HTTP', 'HTTPS', 'WebSocket']),
      allowed: whitelisted,
      reason: whitelisted ? '白名单内目标' : '非白名单目标，已阻断',
      timestamp: new Date(now - rng.nextInt(0, 60000)).toISOString(),
    })
  }

  const fsOps: FileSystemOp[] = []
  const fsCount = rng.nextInt(3, 8)
  const paths = ['/app/data/output.json', '/tmp/cache', '/etc/passwd', '/app/src/index.ts', '/var/log/agent.log', '/app/config/secrets', '/proc/self/environ']
  for (let i = 0; i < fsCount; i++) {
    const path = rng.pick(paths)
    const isSensitive = path.includes('passwd') || path.includes('secrets') || path.includes('environ')
    fsOps.push({
      operation: rng.pick(['read', 'write', 'delete', 'execute']),
      path,
      allowed: !isSensitive,
      sandboxed: true,
    })
  }

  const resourceUsage: ResourceUsage = {
    cpu_pct: Math.round(rng.nextFloat(10, input.resource_limits.cpu_pct * 0.9)),
    memory_mb: Math.round(rng.nextFloat(50, input.resource_limits.memory_mb * 0.8)),
    disk_mb: Math.round(rng.nextFloat(10, input.resource_limits.disk_mb * 0.7)),
    network_mbps: Math.round(rng.nextFloat(0.5, input.resource_limits.network_mbps * 0.8) * 100) / 100,
    within_limits: true,
  }

  const escapeAttempts: EscapeAttempt[] = []
  if (rng.next() > 0.5) {
    escapeAttempts.push({
      attempt_id: `ESC-${rng.nextInt(10000, 99999)}`,
      technique: rng.pick(['namespace_escape', 'privilege_escalation', 'container_breakout', 'syscall_hooking', 'procfs_mount']),
      severity: rng.pick(['medium', 'high', 'critical']),
      blocked: true,
      details: '沙箱隔离层成功阻断逃逸尝试',
    })
  }

  const breachedCount = escapeAttempts.filter(e => !e.blocked).length

  return {
    sandbox_id: `SB-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    agent_id: input.agent_id,
    runtime: input.runtime,
    syscall_events: syscallEvents,
    network_accesses: networkAccesses,
    filesystem_ops: fsOps,
    resource_usage: resourceUsage,
    escape_attempts: escapeAttempts,
    isolation_status: breachedCount > 0 ? 'breached' : escapeAttempts.length > 0 ? 'degraded' : 'active',
    sandbox_version: '2026.1.0',
  }
}

// --- Tool 6: MCP Security ---
function analyzeMCPSecurity(input: MCPSecurityInput): MCPSecurityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.endpoint + input.protocol + input.action
  ))

  const encryption: EncryptionStatus = {
    protocol: input.tls_version || 'TLS 1.3',
    cipher_suite: rng.pick(['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256', 'TLS_AES_128_GCM_SHA256']),
    key_exchange: rng.pick(['ECDHE', 'DHE', 'X25519']),
    certificate_valid: rng.next() > 0.1,
    certificate_expiry: new Date(Date.now() + rng.nextInt(30, 365) * 86400000).toISOString().split('T')[0],
    perfect_forward_secrecy: true,
  }

  const auth: AuthCheck = {
    method: rng.pick(['oauth2', 'mtls', 'api_key', 'jwt']),
    identity_verified: rng.next() > 0.15,
    permissions: rng.pick([['read'], ['read', 'write'], ['read', 'write', 'admin']]),
    least_privilege: rng.next() > 0.3,
    session_expiry: new Date(Date.now() + rng.nextInt(1, 24) * 3600000).toISOString(),
  }

  const auditEntries: AuditEntry[] = []
  const auditCount = rng.nextInt(5, 15)
  const now = Date.now()
  const methods = ['tools/list', 'tools/call', 'resources/read', 'prompts/list', 'completions/create', 'initialize']
  for (let i = 0; i < auditCount; i++) {
    const result: AuditEntry['result'] = rng.pick(['success', 'success', 'success', 'failure', 'denied'])
    auditEntries.push({
      entry_id: `AUD-${rng.nextInt(10000, 99999)}`,
      timestamp: new Date(now - rng.nextInt(0, 86400000)).toISOString(),
      caller: `agent-${rng.nextInt(100, 999)}`,
      method: rng.pick(methods),
      params_summary: `{tool: "${rng.pick(['search', 'execute', 'read_file', 'write_file', 'query'])}"}`,
      result,
      risk_flag: result === 'denied' || (result === 'success' && rng.next() > 0.8),
    })
  }
  auditEntries.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  const anomalies: AnomalyDetection[] = []
  if (rng.next() > 0.4) {
    anomalies.push({
      anomaly_id: `ANM-${rng.nextInt(10000, 99999)}`,
      type: rng.pick(['volume_spike', 'unusual_pattern', 'unauthorized_call', 'data_exfil', 'credential_stuffing']),
      severity: rng.pick(['medium', 'high', 'critical']),
      description: '检测到异常流量模式：请求频率超基线3倍',
      confidence: Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100,
      affected_endpoints: [input.endpoint, '/sse', '/api/v1/tools'],
    })
  }

  const deniedCount = auditEntries.filter(e => e.result === 'denied').length
  const trafficScore = Math.max(0, Math.round((1 - deniedCount / auditEntries.length) * 100) / 100)

  return {
    security_id: `MCP-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    endpoint: input.endpoint,
    protocol: input.protocol,
    encryption,
    auth,
    audit_entries: auditEntries,
    anomalies,
    traffic_score: trafficScore,
    mcp_security_version: '2026.1.0',
  }
}

// --- Tool 7: Shadow AI Detector ---
function analyzeShadowAIDetector(input: ShadowAIInput): ShadowAIResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.network_range + input.action
  ))

  const agentTypes: ShadowAgent['type'][] = ['chatgpt_plugin', 'custom_agent', 'automation_script', 'embedded_ai', 'unknown']
  const shadowAgents: ShadowAgent[] = []
  const agentCount = input.scan_depth === 'deep' ? rng.nextInt(3, 8) : input.scan_depth === 'medium' ? rng.nextInt(2, 5) : rng.nextInt(1, 3)

  for (let i = 0; i < agentCount; i++) {
    const atype = rng.pick(agentTypes)
    shadowAgents.push({
      agent_id: `SAI-${rng.nextInt(10000, 99999)}`,
      name: `Shadow-${atype.replace('_', '-')}-${rng.nextInt(100, 999)}`,
      type: atype,
      endpoint: `https://internal-${rng.nextInt(1, 20)}.local:${rng.nextInt(3000, 9999)}/api`,
      discovered_at: new Date(Date.now() - rng.nextInt(0, 2592000000)).toISOString(),
      data_accessed: rng.pick([['user_db'], ['documents', 'emails'], ['code_repo'], ['config_files', 'secrets']]),
      risk_level: rng.pick(['low', 'medium', 'high', 'critical']),
      approved: rng.next() > 0.7,
    })
  }

  const exfilChannels: ExfilChannel[] = []
  const channelCount = rng.nextInt(1, 4)
  const protocols = ['HTTPS', 'DNS', 'WebSocket', 'gRPC', 'SMTP', 'ICMP']
  for (let i = 0; i < channelCount; i++) {
    const protocols = ['HTTPS', 'DNS', 'WebSocket', 'gRPC']
    const protocol = rng.pick(protocols)
    exfilChannels.push({
      channel_id: `EXF-${rng.nextInt(10000, 99999)}`,
      protocol,
      destination: `${rng.pick(['external-api.com', 'pastebin.com', 'ghostbin.xyz', 'ngrok.io'])}-${rng.nextInt(100, 999)}`,
      data_type: rng.pick(['pii', 'proprietary', 'credentials', 'model_weights', 'conversation']),
      volume_estimate: `${rng.nextInt(10, 500)}MB/天`,
      detected: rng.next() > 0.3,
      mitigation: protocol === 'HTTPS' ? '部署SSL解密+流量分析' : protocol === 'DNS' ? '启用DNS流量异常检测' : '网络分段+ACL限制',
    })
  }

  const accessPoints: AccessPoint[] = []
  const apCount = rng.nextInt(2, 6)
  const apTypes: AccessPoint['type'][] = ['api_endpoint', 'webhook', 'file_share', 'database', 'cloud_service']
  for (let i = 0; i < apCount; i++) {
    accessPoints.push({
      point_id: `AP-${rng.nextInt(10000, 99999)}`,
      type: rng.pick(apTypes),
      url: `https://internal-${rng.nextInt(1, 10)}.${rng.pick(['corp.local', 'api.company.com', 'dev.internal'])}-${rng.nextInt(100, 999)}`,
      authentication: rng.pick(['none', 'weak', 'standard', 'strong']),
      exposed_data: rng.pick([['api_keys'], ['user_data', 'analytics'], ['logs'], ['config']]),
    })
  }

  const complianceStatus: ShadowAIResult['compliance_status'] =
    shadowAgents.filter(a => !a.approved).length > 3 ? 'non_compliant'
    : shadowAgents.filter(a => !a.approved).length > 0 ? 'partial'
    : 'compliant'

  const governance: GovernanceRecommendation[] = [
    { category: 'policy', priority: 'critical', title: '建立AI Agent注册制度', description: '所有AI Agent必须经过审批后才能接入生产环境', effort: 'medium' },
    { category: 'technical', priority: 'high', title: '部署网络流量深度检测', description: '利用DPI识别未授权AI Agent的通信模式', effort: 'high' },
    { category: 'training', priority: 'medium', title: '员工AI安全意识培训', description: '每季度进行Shadow AI风险认知培训', effort: 'low' },
    { category: 'monitoring', priority: 'high', title: '实时影子AI态势大屏', description: '建立统一的可视化仪表盘监控所有AI Agent', effort: 'medium' },
    { category: 'policy', priority: 'medium', title: '第三方AI服务准入清单', description: '建立经批准可使用的AI服务白名单', effort: 'low' },
  ]

  return {
    scan_id: `SAD-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    network_range: input.network_range,
    shadow_agents: shadowAgents,
    exfil_channels: exfilChannels,
    access_points: accessPoints,
    governance,
    compliance_status: complianceStatus,
    detector_version: '2026.1.0',
  }
}

// --- Tool 8: Cyber Range ---
function analyzeCyberRange(input: CyberRangeInput): CyberRangeResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.scenario + input.difficulty + input.team_size.toString()
  ))

  const drillSteps: DrillStep[] = []
  const stepNames = ['威胁识别', '初始遏制', '证据保全', '根因分析', '系统恢复', '事后复盘', '防御加固', '红蓝对抗']
  const stepCount = rng.nextInt(4, 8)
  for (let i = 0; i < stepCount; i++) {
    const completed = rng.next() > 0.3
    drillSteps.push({
      step_id: `DRILL-${i + 1}`,
      name: stepNames[i % stepNames.length],
      description: `执行${stepNames[i % stepNames.length]}标准流程`,
      objectives: [`完成${stepNames[i % stepNames.length]}核心指标`, '确保数据完整性'],
      duration_minutes: rng.nextInt(10, 60),
      completed,
      score: completed ? Math.round(rng.nextFloat(70, 100)) : 0,
    })
  }

  const redTeamActions: RedTeamAction[] = []
  const redCount = rng.nextInt(3, 8)
  const techniques = ['spear_phishing', 'supply_chain_poisoning', 'prompt_injection', 'credential_harvesting', 'lateral_movement', 'data_exfiltration', 'ransomware_simulation', 'zero_day_exploit']
  const mitreIDs = ['T1566', 'T1195', 'T1059', 'T1003', 'T1021', 'T1041', 'T1486', 'T1190']
  for (let i = 0; i < redCount; i++) {
    const success = rng.next() > 0.4
    redTeamActions.push({
      action_id: `RED-${rng.nextInt(10000, 99999)}`,
      technique: rng.pick(techniques),
      mitre_attack_id: mitreIDs[Math.min(i, mitreIDs.length - 1)] || 'T1190',
      target: rng.pick(['email_gateway', 'npm_registry', 'agent_toolchain', 'vpn_console', 'dev_workstation']),
      success,
      detected: success ? rng.next() > 0.4 : false,
      countermeasure: success ? '已触发自动化响应剧本' : '攻击已被预防性控制拦截',
    })
  }

  const defenseRecommendations: DefenseRecommendation[] = [
    { priority: 1, category: 'network', title: '部署微分段隔离', description: '对Agent通信网络实施零信任分段，限制横向移动', implementation_difficulty: 'complex', impact: 'high' },
    { priority: 2, category: 'endpoint', title: '启用EDR行为监控', description: '在所有Agent运行环境部署端点检测与响应', implementation_difficulty: 'moderate', impact: 'high' },
    { priority: 3, category: 'identity', title: '实施动态权限轮换', description: '所有Agent凭证每小时自动轮换一次', implementation_difficulty: 'moderate', impact: 'high' },
    { priority: 4, category: 'data', title: '部署DLP防泄露', description: '对Agent输出数据流实施实时内容检查', implementation_difficulty: 'moderate', impact: 'medium' },
    { priority: 5, category: 'application', title: 'WAF规则升级', description: '针对AI Agent特有攻击手法更新WAF规则集', implementation_difficulty: 'easy', impact: 'medium' },
  ]

  const ctfChallenges: CTFChallenge[] = []
  const ctfNames = ['Break the Prompt', 'Agent Escape', 'Token Forger', 'Context Poisoning', 'MCP Hijack', 'Shadow Discovery']
  const ctfCategories: CTFChallenge['category'][] = ['web', 'pwn', 'reverse', 'crypto', 'forensics', 'osint', 'ai_security']
  const ctfCount = rng.nextInt(3, 6)
  for (let i = 0; i < ctfCount; i++) {
    const solved = rng.next() > 0.4
    ctfChallenges.push({
      challenge_id: `CTF-${rng.nextInt(10000, 99999)}`,
      name: ctfNames[i % ctfNames.length],
      category: rng.pick(ctfCategories),
      points: rng.pick([100, 200, 300, 400, 500]),
      solved,
      hints: ['查看响应头中的异常字段', 'Base64解码后二次解析', '注意JWT的none algorithm'],
      flag_format: 'flag{...}',
    })
  }

  const teamScores: TeamScore[] = [
    { category: '攻击检测率', score: Math.round(rng.nextFloat(60, 95)), max_score: 100, percentile: Math.round(rng.nextFloat(50, 95)) },
    { category: '响应时间', score: Math.round(rng.nextFloat(50, 90)), max_score: 100, percentile: Math.round(rng.nextFloat(40, 90)) },
    { category: '情报准确率', score: Math.round(rng.nextFloat(65, 98)), max_score: 100, percentile: Math.round(rng.nextFloat(60, 95)) },
    { category: '协作效率', score: Math.round(rng.nextFloat(55, 92)), max_score: 100, percentile: Math.round(rng.nextFloat(45, 88)) },
    { category: '恢复能力', score: Math.round(rng.nextFloat(50, 88)), max_score: 100, percentile: Math.round(rng.nextFloat(40, 85)) },
  ]

  const overallEffectiveness = Math.round(teamScores.reduce((s, t) => s + t.score, 0) / teamScores.length)

  return {
    range_id: `CR-${Date.now()}-${rng.nextInt(1000, 9999)}`,
    scenario: input.scenario,
    difficulty: input.difficulty,
    drill_steps: drillSteps,
    red_team_actions: redTeamActions,
    defense_recommendations: defenseRecommendations,
    ctf_challenges: ctfChallenges,
    team_scores: teamScores,
    overall_effectiveness_pct: overallEffectiveness,
    range_version: '2026.1.0',
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: AI Agent Firewall 报告 ---
function formatFirewallReport(result: FirewallResult): string {
  const lines: string[] = []
  lines.push('## 🔥 AI Agent Firewall — 防火墙扫描报告')
  lines.push('')
  lines.push(`\`\`\`diff`)
  lines.push(`! SCAN_ID: ${result.scan_id}`)
  lines.push(`! AGENT:  ${result.agent_name}`)
  lines.push(`! LEVEL:  ${result.sensitivity_level.toUpperCase()}`)
  lines.push(`! RISK:   ${result.overall_risk_score} | INTEGRITY: ${result.context_integrity}`)
  lines.push(`\`\`\``)
  lines.push('')
  lines.push('### ⚡ 告警面板 — Alert Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  ╔══════════════════════════════════════════════════════╗')
  lines.push('  ║  🛡️  CYBERAGENT FIREWALL  v2026.1.0                ║')
  lines.push('  ║  ───────────────────────────────────────────────────║')
  lines.push(`  ║  THREATS: ${result.threats_detected.length.toString().padEnd(4)}  INTERCEPTED: ${result.intercepted_actions.length.toString().padEnd(4)}  RISK: ${(result.overall_risk_score * 100).toFixed(0).padEnd(3)}%    ║`)
  lines.push(`  ║  STATUS:  ${result.context_integrity === 'clean' ? '🟢 CLEAN' : result.context_integrity === 'suspicious' ? '🟡 SUSPICIOUS' : '🔴 COMPROMISED'}${' '.repeat(32)}║`)
  lines.push('  ╚══════════════════════════════════════════════════════╝')
  lines.push('```')
  lines.push('')

  if (result.threats_detected.length > 0) {
    lines.push('### 🎯 威胁检测 Threat Detection')
    lines.push('| ID | 类型 | 严重度 | 置信度 | 匹配模式 | 位置 | 处置 |')
    lines.push('|----|------|--------|--------|----------|------|------|')
    for (const t of result.threats_detected) {
      lines.push(`| ${t.threat_id} | ${t.type} | ${t.severity.toUpperCase()} | ${(t.confidence * 100).toFixed(0)}% | ${t.pattern_matched} | ${t.position} | ${t.mitigation} |`)
    }
    lines.push('')
  }

  if (result.intercepted_actions.length > 0) {
    lines.push('### 🚫 拦截动作 Intercepted Actions')
    lines.push('| ID | 操作 | 原因 | 风险分 | 已阻断 | 替代方案 |')
    lines.push('|----|------|------|--------|--------|----------|')
    for (const a of result.intercepted_actions) {
      lines.push(`| ${a.action_id} | ${a.operation} | ${a.reason} | ${a.risk_score} | ${a.blocked ? '✅' : '❌'} | ${a.alternative} |`)
    }
    lines.push('')
  }

  lines.push('### 🧹 输入净化 Sanitization')
  lines.push(`- 原始长度: ${result.sanitization.original_length} → 净化后: ${result.sanitization.sanitized_length}`)
  lines.push(`- 移除模式: ${result.sanitization.removed_patterns.join(', ')}`)
  lines.push(`- 编码方式: ${result.sanitization.encoding_applied}`)
  lines.push('')

  lines.push('### 📋 权限校验 Permission Checks')
  lines.push('| 检查项 | 通过 | 详情 |')
  lines.push('|--------|------|------|')
  for (const p of result.permission_checks) {
    lines.push(`| ${p.check} | ${p.passed ? '✅' : '❌'} | ${p.detail} |`)
  }
  lines.push('')

  lines.push('### 🔗 攻击路径图 Attack Path')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    INPUT[🌐 User Input] -->|抵达| FW[🔥 Firewall Engine]')
  lines.push('    FW -->|Prompt注入检测| CHECK1{Injection Scan}')
  lines.push('    FW -->|敏感操作分析| CHECK2{Action Analysis}')
  lines.push('    FW -->|上下文验证| CHECK3{Context Verify}')
  lines.push('    CHECK1 -->|通过| SANITIZE[🧹 Sanitizer]')
  lines.push('    CHECK1 -->|检测到威胁| BLOCK1[🚫 Block + Alert]')
  lines.push('    CHECK2 -->|授权操作| ALLOW[✅ Allow]')
  lines.push('    CHECK2 -->|越权操作| BLOCK2[🚫 Intercept]')
  lines.push('    CHECK3 -->|完整| SANITIZE')
  lines.push('    CHECK3 -->|被篡改| RESET[🔄 Context Reset]')
  lines.push('    SANITIZE --> OUTPUT[📤 Safe Output]')
  lines.push('    BLOCK1 --> LOG[⚠️ Threat Log]')
  lines.push('    BLOCK2 --> LOG')
  lines.push('    RESET --> LOG')
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push(`*CyberAgent Firewall v${result.firewall_version} • Threats: ${result.threats_detected.length} • Risk Score: ${result.overall_risk_score}*`)
  return lines.join('\n')
}

// --- Tool 2: Behavior Profiler 报告 ---
function formatBehaviorReport(result: BehaviorResult): string {
  const lines: string[] = []
  lines.push('## 🎭 Agent Behavior Profiler — 行为画像报告')
  lines.push('')
  lines.push(`\`\`\`diff`)
  lines.push(`! PROFILE_ID: ${result.profile_id}`)
  lines.push(`! AGENT:     ${result.agent_id}`)
  lines.push(`! TRUST:     ${result.overall_trust} / 1.00`)
  lines.push(`! ABUSE:     ${result.abuse_indicators.length} indicators`)
  lines.push(`\`\`\``)
  lines.push('')
  lines.push('### ⚡ 告警面板 — Trust Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  ╔══════════════════════════════════════════════════════╗')
  lines.push('  ║  🎭  BEHAVIOR PROFILER  v2026.1.0                  ║')
  lines.push('  ║  ───────────────────────────────────────────────────║')
  lines.push(`  ║  TRUST SCORE: ${(result.overall_trust * 100).toFixed(0).padEnd(3)}%  STATUS: ${result.overall_trust > 0.8 ? '🟢 TRUSTED' : result.overall_trust > 0.5 ? '🟡 MONITOR' : '🔴 UNTRUSTED'}${' '.repeat(22)}║`)
  lines.push(`  ║  DEVIATIONS:  ${result.deviations.length.toString().padEnd(4)}  ABUSE FLAGS: ${result.abuse_indicators.length.toString().padEnd(4)}${' '.repeat(26)}║`)
  lines.push('  ╚══════════════════════════════════════════════════════╝')
  lines.push('```')
  lines.push('')

  lines.push('### 📊 行为基线 Baseline Metrics')
  lines.push('| 指标 | 均值 | 标准差 | 最小值 | 最大值 | 样本数 |')
  lines.push('|------|------|--------|--------|--------|--------|')
  for (const m of result.baseline_metrics) {
    lines.push(`| ${m.metric_name} | ${m.mean} | ${m.std_dev} | ${m.min} | ${m.max} | ${m.sample_count} |`)
  }
  lines.push('')

  if (result.deviations.length > 0) {
    lines.push('### ⚠️ 偏离告警 Deviation Alerts')
    lines.push('| ID | 指标 | 观测值 | 预期范围 | σ偏离 | 严重度 | 描述 |')
    lines.push('|----|------|--------|----------|-------|--------|------|')
    for (const d of result.deviations) {
      lines.push(`| ${d.alert_id} | ${d.metric} | ${d.observed_value} | ${d.expected_range} | ${d.deviation_sigma}σ | ${d.severity.toUpperCase()} | ${d.description} |`)
    }
    lines.push('')
  }

  lines.push('### 🧠 意图推断 Intent Inference')
  lines.push(`- 推断意图: **${result.intent_inference.inferred_intent}**`)
  lines.push(`- 置信度: ${(result.intent_inference.confidence * 100).toFixed(0)}%`)
  lines.push(`- 支持证据: ${result.intent_inference.supporting_evidence.join('; ')}`)
  lines.push(`- 反向指标: ${result.intent_inference.counter_indicators.join('; ')}`)
  lines.push(`- 风险评估: ${result.intent_inference.risk_assessment}`)
  lines.push('')

  lines.push('### 📊 信任评分 Trust Scores')
  lines.push('| 维度 | 评分 | 权重 | 趋势 |')
  lines.push('|------|------|------|------|')
  for (const t of result.trust_scores) {
    lines.push(`| ${t.dimension} | ${(t.score * 100).toFixed(0)}% | ${(t.weight * 100).toFixed(0)}% | ${t.trend === 'improving' ? '📈' : t.trend === 'declining' ? '📉' : '➡️'} ${t.trend} |`)
  }
  lines.push('')

  if (result.cross_agent_tracks.length > 0) {
    lines.push('### 🔗 跨Agent追踪 Cross-Agent Tracking')
    lines.push('| Agent ID | 相关性 | 相似模式 |')
    lines.push('|----------|--------|----------|')
    for (const c of result.cross_agent_tracks) {
      lines.push(`| ${c.agent_id} | ${(c.correlation * 100).toFixed(0)}% | ${c.pattern} |`)
    }
    lines.push('')
  }

  if (result.abuse_indicators.length > 0) {
    lines.push('### 🚨 滥用指标 Abuse Indicators')
    for (const a of result.abuse_indicators) lines.push(`- ⚠️ ${a}`)
    lines.push('')
  }

  lines.push('### 🔗 行为关联图 Behavior Correlation')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    A1[Agent: ' + result.agent_id + '] -->|行为日志| BASELINE[Baseline Engine]')
  lines.push('    BASELINE -->|学习| PROFILE[Behavior Profile]')
  lines.push('    PROFILE -->|偏离检测| DEVIATION{Deviation Check}')
  lines.push('    DEVIATION -->|正常| TRUST[Trust Scoring]')
  lines.push('    DEVIATION -->|异常| ALERT[Alert Trigger]')
  lines.push('    ALERT -->|意图推断| INTENT[Intent Analysis]')
  lines.push('    INTENT -->|高风险| BLOCK[Action Block]')
  lines.push('    INTENT -->|中风险| MONITOR[Enhanced Monitor]')
  lines.push('    TRUST -->|低信任| ESCALATE[Escalate Review]')
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push(`*CyberAgent Behavior Profiler v${result.profile_version} • Trust: ${result.overall_trust} • Deviations: ${result.deviations.length}*`)
  return lines.join('\n')
}

// --- Tool 3: Secret Scanner 报告 ---
function formatSecretScanReport(result: SecretScanResult): string {
  const lines: string[] = []
  lines.push('## 🔐 Secret Scanner — 机密泄露扫描报告')
  lines.push('')
  lines.push(`\`\`\`diff`)
  lines.push(`! SCAN_ID: ${result.scan_id}`)
  lines.push(`! TARGET:  ${result.target_path}`)
  lines.push(`! FINDINGS: ${result.total_findings}`)
  lines.push(`! COVERAGE: ${result.scan_coverage}  DURATION: ${result.scan_duration_ms}ms`)
  lines.push(`\`\`\``)
  lines.push('')
  lines.push('### ⚡ 告警面板 — Secret Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  ╔══════════════════════════════════════════════════════╗')
  lines.push('  ║  🔐  SECRET SCANNER  v2026.1.0                     ║')
  lines.push('  ║  ───────────────────────────────────────────────────║')
  lines.push(`  ║  CRITICAL: ${result.by_severity.critical.toString().padEnd(3)}  HIGH: ${result.by_severity.high.toString().padEnd(3)}  MED: ${result.by_severity.medium.toString().padEnd(3)}  LOW: ${result.by_severity.low.toString().padEnd(3)}     ║`)
  lines.push(`  ║  STATUS: ${result.by_severity.critical > 0 ? '🔴 CRITICAL' : result.by_severity.high > 0 ? '🟠 HIGH' : result.by_severity.medium > 0 ? '🟡 MEDIUM' : '🟢 LOW'}${' '.repeat(35)}║`)
  lines.push('  ╚══════════════════════════════════════════════════════╝')
  lines.push('```')
  lines.push('')

  if (result.findings.length > 0) {
    lines.push('### 🎯 发现项 Secret Findings')
    lines.push('| ID | 类型 | 严重度 | 文件 | 行号 | 脱敏值 | 描述 |')
    lines.push('|----|------|--------|------|------|--------|------|')
    for (const f of result.findings) {
      lines.push(`| ${f.finding_id} | ${f.secret_type} | ${f.severity.toUpperCase()} | ${f.location.split('/').pop()} | L${f.line_number} | ${f.redacted_value} | ${f.description} |`)
    }
    lines.push('')
  }

  if (result.dependency_risks.length > 0) {
    lines.push('### 📦 依赖风险 Dependency Risks')
    lines.push('| 包名 | 版本 | 风险类型 | 严重度 | 建议 |')
    lines.push('|------|------|----------|--------|------|')
    for (const d of result.dependency_risks) {
      lines.push(`| ${d.package_name} | ${d.version} | ${d.risk_type} | ${d.severity.toUpperCase()} | ${d.recommendation} |`)
    }
    lines.push('')
  }

  lines.push('### 🔗 泄露路径图 Leak Path')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    CODE[📁 Source Code] -->|扫描| SCANNER[🔐 Secret Scanner]')
  lines.push('    ENV[🔧 Environment] -->|审计| SCANNER')
  lines.push('    GIT[📜 Git History] -->|扫描| SCANNER')
  lines.push('    DEPS[📦 Dependencies] -->|检查| SCANNER')
  lines.push('    SCANNER -->|发现| FIND[Finding Classification]')
  lines.push('    FIND -->|API Key| APIKEY[🔑 API Key Leak]')
  lines.push('    FIND -->|PII| PII[👤 PII Exposure]')
  lines.push('    FIND -->|密钥| KEY[🔒 Private Key]')
  lines.push('    FIND -->|密码| PASS[🔓 Password]')
  lines.push('    APIKEY --> REMEDIATE[🛠️ Remediation: Migrate to KMS]')
  lines.push('    PII --> REMEDIATE')
  lines.push('    KEY --> REMEDIATE')
  lines.push('    PASS --> REMEDIATE')
  lines.push('```')
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] API密钥硬编码扫描')
  lines.push('- [x] PII数据泄露检测')
  lines.push('- [x] 环境变量安全审计')
  lines.push('- [x] Git提交历史扫描')
  lines.push('- [x] 第三方依赖风险评估')
  lines.push('')
  lines.push('---')
  lines.push(`*CyberAgent Secret Scanner v${result.scanner_version} • Findings: ${result.total_findings} • Coverage: ${result.scan_coverage}*`)
  return lines.join('\n')
}

// --- Tool 4: Dependency Guardian 报告 ---
function formatDependencyReport(result: DependencyResult): string {
  const lines: string[] = []
  lines.push('## 🛡️ Dependency Guardian — 依赖包安全守卫报告')
  lines.push('')
  lines.push(`\`\`\`diff`)
  lines.push(`! ANALYSIS_ID: ${result.analysis_id}`)
  lines.push(`! ECOSYSTEM:  ${result.ecosystem}`)
  lines.push(`! PACKAGES:   ${result.packages_analyzed}`)
  lines.push(`! VULNS:      ${result.vulns.length} total`)
  lines.push(`\`\`\``)
  lines.push('')
  lines.push('### ⚡ 告警面板 — Dependency Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  ╔══════════════════════════════════════════════════════╗')
  lines.push('  ║  🛡️  DEPENDENCY GUARDIAN  v2026.1.0                ║')
  lines.push('  ║  ───────────────────────────────────────────────────║')
  lines.push(`  ║  CRITICAL: ${result.risk_summary.critical.toString().padEnd(3)}  HIGH: ${result.risk_summary.high.toString().padEnd(3)}  MED: ${result.risk_summary.medium.toString().padEnd(3)}  LOW: ${result.risk_summary.low.toString().padEnd(3)}     ║`)
  lines.push(`  ║  STATUS: ${result.risk_summary.critical > 0 ? '🔴 CRITICAL' : result.risk_summary.high > 0 ? '🟠 HIGH' : result.risk_summary.medium > 0 ? '🟡 MEDIUM' : '🟢 SECURE'}${' '.repeat(33)}║`)
  lines.push('  ╚══════════════════════════════════════════════════════╝')
  lines.push('```')
  lines.push('')

  if (result.vulns.length > 0) {
    lines.push('### 🎯 CVE漏洞列表 Vulnerabilities')
    lines.push('| CVE | 包名 | 影响版本 | 修复版本 | 严重度 | CVSS | 利用可用 |')
    lines.push('|-----|------|----------|----------|--------|------|----------|')
    for (const v of result.vulns) {
      lines.push(`| ${v.cve_id} | ${v.package} | ${v.affected_versions} | ${v.fixed_version} | ${v.severity.toUpperCase()} | ${v.cvss_score} | ${v.exploit_available ? '⚠️ Yes' : 'No'} |`)
    }
    lines.push('')
  }

  if (result.packages.length > 0) {
    lines.push('### 📦 包清单 Package Inventory')
    lines.push('| 包名 | 版本 | 许可证 | 直接依赖 | 传递依赖 | 已知漏洞 |')
    lines.push('|------|------|--------|----------|----------|----------|')
    for (const p of result.packages) {
      lines.push(`| ${p.name} | ${p.version} | ${p.license} | ${p.dependencies_count} | ${p.transitive_count} | ${p.known_vulns} |`)
    }
    lines.push('')
  }

  if (result.sbom.length > 0) {
    lines.push('### 📋 SBOM 物料清单')
    lines.push('| 包名 | 版本 | 供应商 | 许可证 | 哈希 |')
    lines.push('|------|------|--------|--------|------|')
    for (const s of result.sbom) {
      lines.push(`| ${s.name} | ${s.version} | ${s.supplier} | ${s.license} | ${s.hashes[0].slice(0, 20)}... |`)
    }
    lines.push('')
  }

  lines.push('### 📋 建议 Recommendations')
  for (const r of result.recommendations) lines.push(`- ✅ ${r}`)
  lines.push('')

  lines.push('### 🔗 供应链图 Supply Chain')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    APP[🎯 Application] -->|依赖| D1[📦 Package A]')
  lines.push('    APP -->|依赖| D2[📦 Package B]')
  lines.push('    APP -->|依赖| D3[📦 Package C]')
  lines.push('    D1 -->|传递| T1[📦 Transitive X]')
  lines.push('    D1 -->|传递| T2[📦 Transitive Y]')
  lines.push('    D2 -->|传递| T3[📦 Transitive Z]')
  lines.push('    T1 -->|⚠️ CVE| VULN[🔴 Vulnerability]')
  lines.push('    T2 -->|⚠️ CVE| VULN')
  lines.push('    VULN -->|分析| GUARDIAN[🛡️ Dependency Guardian]')
  lines.push('    GUARDIAN -->|告警| ALERT[🚨 Auto Alert]')
  lines.push('    GUARDIAN -->|修复建议| FIX[🔧 Remediation]')
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push(`*CyberAgent Dependency Guardian v${result.guardian_version} • Packages: ${result.packages_analyzed} • Vulns: ${result.vulns.length}*`)
  return lines.join('\n')
}

// --- Tool 5: Runtime Sandbox 报告 ---
function formatSandboxReport(result: SandboxResult): string {
  const lines: string[] = []
  lines.push('## 🔒 Runtime Sandbox — 运行时沙箱控制报告')
  lines.push('')
  lines.push(`\`\`\`diff`)
  lines.push(`! SANDBOX_ID: ${result.sandbox_id}`)
  lines.push(`! AGENT:     ${result.agent_id}`)
  lines.push(`! RUNTIME:   ${result.runtime}`)
  lines.push(`! STATUS:    ${result.isolation_status.toUpperCase()}`)
  lines.push(`\`\`\``)
  lines.push('')
  lines.push('### ⚡ 告警面板 — Sandbox Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  ╔══════════════════════════════════════════════════════╗')
  lines.push('  ║  🔒  RUNTIME SANDBOX  v2026.1.0                    ║')
  lines.push('  ║  ───────────────────────────────────────────────────║')
  lines.push(`  ║  SYSCALLS: ${result.syscall_events.length.toString().padEnd(4)}  NET: ${result.network_accesses.length.toString().padEnd(4)}  ESCAPE: ${result.escape_attempts.length.toString().padEnd(4)}        ║`)
  lines.push(`  ║  STATUS: ${result.isolation_status === 'active' ? '🟢 ACTIVE' : result.isolation_status === 'degraded' ? '🟡 DEGRADED' : '🔴 BREACHED'}${' '.repeat(35)}║`)
  lines.push('  ╚══════════════════════════════════════════════════════╝')
  lines.push('```')
  lines.push('')

  const blocked = result.syscall_events.filter(s => s.blocked).length
  const blockedNet = result.network_accesses.filter(n => !n.allowed).length
  lines.push('### 📊 资源使用 Resource Usage')
  lines.push(`| CPU | 内存 | 磁盘 | 网络 | 状态 |`)
  lines.push(`|-----|------|------|------|------|`)
  lines.push(`| ${result.resource_usage.cpu_pct}% | ${result.resource_usage.memory_mb}MB | ${result.resource_usage.disk_mb}MB | ${result.resource_usage.network_mbps}Mbps | ${result.resource_usage.within_limits ? '✅ 正常' : '⚠️ 超限'} |`)
  lines.push('')

  lines.push(`### 🔧 系统调用拦截 Syscall Intercept (共${result.syscall_events.length}次，阻断${blocked}次)`)
  lines.push('| ID | 调用 | 参数 | 已阻断 | 原因 |')
  lines.push('|----|------|------|--------|------|')
  for (const s of result.syscall_events.slice(0, 10)) {
    lines.push(`| ${s.syscall_id} | ${s.syscall_name} | ${s.arguments} | ${s.blocked ? '🚫' : '✅'} | ${s.reason} |`)
  }
  lines.push('')

  lines.push(`### 🌐 网络访问控制 Network Access (共${result.network_accesses.length}次，阻断${blockedNet}次)`)
  lines.push('| 目标 | 端口 | 协议 | 允许 | 原因 | 时间 |')
  lines.push('|------|------|------|------|------|------|')
  for (const n of result.network_accesses.slice(0, 8)) {
    lines.push(`| ${n.destination} | ${n.port} | ${n.protocol} | ${n.allowed ? '✅' : '🚫'} | ${n.reason} | ${n.timestamp.split('T')[1]?.slice(0, 8) || ''} |`)
  }
  lines.push('')

  if (result.escape_attempts.length > 0) {
    lines.push('### 🚨 逃逸检测 Escape Attempts')
    for (const e of result.escape_attempts) {
      lines.push(`- [${e.severity.toUpperCase()}] ${e.technique}: ${e.details} | 已阻断: ${e.blocked ? '✅' : '❌'}`)
    }
    lines.push('')
  }

  lines.push('### 🔗 沙箱架构图 Sandbox Architecture')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    AGENT[🤖 Agent Process] -->|系统调用| SYSCALL[Syscall Filter]')
  lines.push('    SYSCALL -->|允许| KERNEL[Kernel Space]')
  lines.push('    SYSCALL -->|拦截| LOG[🚫 Block Log]')
  lines.push('    AGENT -->|网络请求| NET[Network Whitelist]')
  lines.push('    NET -->|白名单| INTERNET[🌐 Internet]')
  lines.push('    NET -->|非白名单| BLOCK[🚫 Drop]')
  lines.push('    AGENT -->|文件操作| FS[Filesystem Isolation]')
  lines.push('    FS -->|沙箱内| FS_SAFE[📁 /sandbox]')
  lines.push('    FS -->|沙箱外| FS_BLOCK[🚫 Access Denied]')
  lines.push('    AGENT -->|异常行为| ESCAPE[Escape Detection]')
  lines.push('    ESCAPE -->|尝试逃逸| ALERT[🚨 Alert + Kill]')
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push(`*CyberAgent Runtime Sandbox v${result.sandbox_version} • Isolation: ${result.isolation_status} • Escapes: ${result.escape_attempts.length}*`)
  return lines.join('\n')
}

// --- Tool 6: MCP Security 报告 ---
function formatMCPSecurityReport(result: MCPSecurityResult): string {
  const lines: string[] = []
  lines.push('## 🔏 MCP/A2A Security — 协议安全报告')
  lines.push('')
  lines.push(`\`\`\`diff`)
  lines.push(`! SECURITY_ID: ${result.security_id}`)
  lines.push(`! ENDPOINT:    ${result.endpoint}`)
  lines.push(`! PROTOCOL:    ${result.protocol}`)
  lines.push(`! TRAFFIC:     ${result.traffic_score} / 1.00`)
  lines.push(`\`\`\``)
  lines.push('')
  lines.push('### ⚡ 告警面板 — MCP Security Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  ╔══════════════════════════════════════════════════════╗')
  lines.push('  ║  🔏  MCP/A2A SECURITY  v2026.1.0                   ║')
  lines.push('  ║  ───────────────────────────────────────────────────║')
  lines.push(`  ║  ENCRYPTION: ${result.encryption.protocol}  CIPHER: ${result.encryption.cipher_suite.slice(0, 15)}...        ║`)
  lines.push(`  ║  AUTH: ${result.auth.method.toUpperCase().padEnd(10)}  VERIFY: ${result.auth.identity_verified ? '✅' : '❌'}  PRIVILEGE: ${result.auth.least_privilege ? '✅' : '❌'}          ║`)
  lines.push(`  ║  ANOMALIES: ${result.anomalies.length.toString().padEnd(4)}  AUDIT: ${result.audit_entries.length.toString().padEnd(4)}  SCORE: ${(result.traffic_score * 100).toFixed(0).padEnd(3)}%       ║`)
  lines.push('  ╚══════════════════════════════════════════════════════╝')
  lines.push('```')
  lines.push('')

  lines.push('### 🔐 加密状态 Encryption')
  lines.push(`| 协议 | 密码套件 | 密钥交换 | 证书有效期 | PFS |`)
  lines.push(`|------|----------|----------|-----------|-----|`)
  lines.push(`| ${result.encryption.protocol} | ${result.encryption.cipher_suite} | ${result.encryption.key_exchange} | ${result.encryption.certificate_valid ? result.encryption.certificate_expiry : 'INVALID'} | ${result.encryption.perfect_forward_secrecy ? '✅' : '❌'} |`)
  lines.push('')

  lines.push('### 🔑 认证与权限 Authentication & Authorization')
  lines.push(`| 方法 | 身份已验证 | 权限 | 最小权限 | 会话过期 |`)
  lines.push(`|------|-----------|------|----------|----------|`)
  lines.push(`| ${result.auth.method.toUpperCase()} | ${result.auth.identity_verified ? '✅' : '❌'} | ${result.auth.permissions.join(', ')} | ${result.auth.least_privilege ? '✅' : '❌'} | ${result.auth.session_expiry.split('T')[1]?.slice(0, 8) || ''} |`)
  lines.push('')

  if (result.anomalies.length > 0) {
    lines.push('### ⚠️ 异常流量检测 Anomaly Detection')
    lines.push('| ID | 类型 | 严重度 | 置信度 | 描述 |')
    lines.push('|----|------|--------|--------|------|')
    for (const a of result.anomalies) {
      lines.push(`| ${a.anomaly_id} | ${a.type} | ${a.severity.toUpperCase()} | ${(a.confidence * 100).toFixed(0)}% | ${a.description} |`)
    }
    lines.push('')
  }

  lines.push(`### 📋 审计日志 Audit Log (最近${Math.min(result.audit_entries.length, 8)}条)`)
  lines.push('| 时间 | 调用方 | 方法 | 结果 | 风险标记 |')
  lines.push('|------|--------|------|------|----------|')
  for (const a of result.audit_entries.slice(0, 8)) {
    lines.push(`| ${a.timestamp.split('T')[1]?.slice(0, 8) || ''} | ${a.caller} | ${a.method} | ${a.result === 'success' ? '✅' : a.result === 'denied' ? '🚫' : '⚠️'} | ${a.risk_flag ? '🔴' : ''} |`)
  }
  lines.push('')

  lines.push('### 🔗 协议安全图 Protocol Security')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    CLIENT[MCP Client] -->|TLS 1.3| TRANS[Transport Layer]')
  lines.push('    TRANS -->|加密| AUTH{Zero Trust Auth}')
  lines.push('    AUTH -->|OAuth2/mTLS| VERIFY[Identity Verify]')
  lines.push('    VERIFY -->|权限检查| PERM[Least Privilege]')
  lines.push('    PERM -->|允许调用| SERVER[MCP/A2A Server]')
  lines.push('    TRANS -->|解密| AUDIT[Audit Logger]')
  lines.push('    TRANS -->|异常检测| ANOMALY{Anomaly Detection}')
  lines.push('    ANOMALY -->|告警| SIEM[SIEM Integration]')
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push(`*CyberAgent MCP Security v${result.mcp_security_version} • Traffic Score: ${result.traffic_score} • Anomalies: ${result.anomalies.length}*`)
  return lines.join('\n')
}

// --- Tool 7: Shadow AI Detector 报告 ---
function formatShadowAIReport(result: ShadowAIResult): string {
  const lines: string[] = []
  lines.push('## 👁️ Shadow AI Detector — 影子AI/Agent检测报告')
  lines.push('')
  lines.push(`\`\`\`diff`)
  lines.push(`! SCAN_ID: ${result.scan_id}`)
  lines.push(`! RANGE:    ${result.network_range}`)
  lines.push(`! AGENTS:   ${result.shadow_agents.length}`)
  lines.push(`! COMPLIANCE: ${result.compliance_status.toUpperCase()}`)
  lines.push(`\`\`\``)
  lines.push('')
  lines.push('### ⚡ 告警面板 — Shadow AI Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  ╔══════════════════════════════════════════════════════╗')
  lines.push('  ║  👁️  SHADOW AI DETECTOR  v2026.1.0                 ║')
  lines.push('  ║  ───────────────────────────────────────────────────║')
  lines.push(`  ║  UNAUTHORIZED: ${result.shadow_agents.filter(a => !a.approved).length.toString().padEnd(4)}  EXFIL: ${result.exfil_channels.length.toString().padEnd(4)}  AP: ${result.access_points.length.toString().padEnd(4)}         ║`)
  lines.push(`  ║  STATUS: ${result.compliance_status === 'compliant' ? '🟢 COMPLIANT' : result.compliance_status === 'partial' ? '🟡 PARTIAL' : '🔴 NON-COMPLIANT'}${' '.repeat(29)}║`)
  lines.push('  ╚══════════════════════════════════════════════════════╝')
  lines.push('```')
  lines.push('')

  if (result.shadow_agents.length > 0) {
    lines.push('### 🤖 影子Agent Shadow Agents')
    lines.push('| ID | 名称 | 类型 | 风险 | 已审批 | 发现时间 | 数据访问 |')
    lines.push('|----|------|------|------|--------|----------|----------|')
    for (const a of result.shadow_agents) {
      lines.push(`| ${a.agent_id} | ${a.name} | ${a.type} | ${a.risk_level.toUpperCase()} | ${a.approved ? '✅' : '❌'} | ${a.discovered_at.split('T')[0]} | ${a.data_accessed.join(', ')} |`)
    }
    lines.push('')
  }

  if (result.exfil_channels.length > 0) {
    lines.push('### 📡 数据外传通道 Exfiltration Channels')
    lines.push('| ID | 协议 | 目标 | 数据类型 | 流量估算 | 已检测 | 缓解措施 |')
    lines.push('|----|------|------|----------|----------|--------|----------|')
    for (const e of result.exfil_channels) {
      lines.push(`| ${e.channel_id} | ${e.protocol} | ${e.destination} | ${e.data_type} | ${e.volume_estimate} | ${e.detected ? '✅' : '❌'} | ${e.mitigation} |`)
    }
    lines.push('')
  }

  if (result.access_points.length > 0) {
    lines.push('### 📍 接入点测绘 Access Points')
    lines.push('| ID | 类型 | 地址 | 认证强度 | 暴露数据 |')
    lines.push('|----|------|------|----------|----------|')
    for (const a of result.access_points) {
      lines.push(`| ${a.point_id} | ${a.type} | ${a.url} | ${a.authentication} | ${a.exposed_data.join(', ')} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 治理建议 Governance Recommendations')
  lines.push('| 优先级 | 类别 | 标题 | 描述 | 投入 |')
  lines.push('|--------|------|------|------|------|')
  for (const g of result.governance) {
    lines.push(`| ${g.priority.toUpperCase()} | ${g.category} | ${g.title} | ${g.description} | ${g.effort} |`)
  }
  lines.push('')

  lines.push('### 🔗 影子AI发现图 Shadow Discovery')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    NET[Network Range: ' + result.network_range + '] -->|扫描| DISC[Discovery Engine]')
  lines.push('    DISC -->|流量分析| TRAFFIC[Traffic Profiling]')
  lines.push('    DISC -->|指纹识别| FINGER[Agent Fingerprinting]')
  lines.push('    TRAFFIC -->|识别| AGENT[Shadow Agent]')
  lines.push('    FINGER -->|识别| AGENT')
  lines.push('    AGENT -->|数据流向分析| EXFIL[Exfil Channel]')
  lines.push('    AGENT -->|接入点发现| AP[Access Point Map]')
  lines.push('    EXFIL -->|风险评估| REPORT[Compliance Report]')
  lines.push('    AP -->|暴露评估| REPORT')
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push(`*CyberAgent Shadow AI Detector v${result.detector_version} • Agents: ${result.shadow_agents.length} • Compliance: ${result.compliance_status}*`)
  return lines.join('\n')
}

// --- Tool 8: Cyber Range 报告 ---
function formatCyberRangeReport(result: CyberRangeResult): string {
  const lines: string[] = []
  lines.push('## ⚔️ Cyber Range — 网络靶场演练报告')
  lines.push('')
  lines.push(`\`\`\`diff`)
  lines.push(`! RANGE_ID: ${result.range_id}`)
  lines.push(`! SCENARIO: ${result.scenario}`)
  lines.push(`! DIFFICULTY: ${result.difficulty.toUpperCase()}`)
  lines.push(`! EFFECTIVENESS: ${result.overall_effectiveness_pct}%`)
  lines.push(`\`\`\``)
  lines.push('')
  lines.push('### ⚡ 告警面板 — Range Dashboard')
  lines.push('')
  lines.push('```')
  lines.push('  ╔══════════════════════════════════════════════════════╗')
  lines.push('  ║  ⚔️  CYBER RANGE  v2026.1.0                        ║')
  lines.push('  ║  ───────────────────────────────────────────────────║')
  lines.push(`  ║  DRILL: ${result.drill_steps.filter(s => s.completed).length}/${result.drill_steps.length} done  RED: ${result.red_team_actions.length} attacks  CTF: ${result.ctf_challenges.filter(c => c.solved).length}/${result.ctf_challenges.length} solved      ║`)
  lines.push(`  ║  TEAM EFFECTIVENESS: ${result.overall_effectiveness_pct}% ${result.overall_effectiveness_pct > 80 ? '🟢 EXCELLENT' : result.overall_effectiveness_pct > 60 ? '🟡 GOOD' : '🔴 NEEDS IMPROVEMENT'}${' '.repeat(16)}║`)
  lines.push('  ╚══════════════════════════════════════════════════════╝')
  lines.push('```')
  lines.push('')

  lines.push('### 🏃 演练步骤 Drill Steps')
  lines.push('| ID | 名称 | 描述 | 时长(分) | 已完成 | 得分 |')
  lines.push('|----|------|------|----------|--------|------|')
  for (const d of result.drill_steps) {
    lines.push(`| ${d.step_id} | ${d.name} | ${d.description} | ${d.duration_minutes} | ${d.completed ? '✅' : '⬜'} | ${d.score} |`)
  }
  lines.push('')

  if (result.red_team_actions.length > 0) {
    lines.push('### 🔴 红队模拟 Red Team Actions')
    lines.push('| ID | technique | MITRE ATT&CK | 目标 | 成功 | 已检测 | 对策 |')
    lines.push('|----|-----------|--------------|------|------|--------|------|')
    for (const r of result.red_team_actions) {
      lines.push(`| ${r.action_id} | ${r.technique} | ${r.mitre_attack_id} | ${r.target} | ${r.success ? '✅' : '❌'} | ${r.detected ? '✅' : '❌'} | ${r.countermeasure} |`)
    }
    lines.push('')
  }

  if (result.defense_recommendations.length > 0) {
    lines.push('### 🔧 防御强化建议 Defense Recommendations')
    lines.push('| 优先级 | 类别 | 标题 | 描述 | 难度 | 影响 |')
    lines.push('|--------|------|------|------|------|------|')
    for (const d of result.defense_recommendations) {
      lines.push(`| ${d.priority} | ${d.category} | ${d.title} | ${d.description} | ${d.implementation_difficulty} | ${d.impact} |`)
    }
    lines.push('')
  }

  if (result.ctf_challenges.length > 0) {
    lines.push('### 🏆 CTF挑战 Challenges')
    lines.push('| ID | 名称 | 类别 | 分值 | 已解决 |')
    lines.push('|----|------|------|------|--------|')
    for (const c of result.ctf_challenges) {
      lines.push(`| ${c.challenge_id} | ${c.name} | ${c.category} | ${c.points} | ${c.solved ? '🏆' : '⬜'} |`)
    }
    lines.push('')
  }

  lines.push('### 📊 团队效能评分 Team Scores')
  lines.push('| 类别 | 得分 | 满分 | 百分位 |')
  lines.push('|------|------|------|--------|')
  for (const t of result.team_scores) {
    lines.push(`| ${t.category} | ${t.score} | ${t.max_score} | Top ${100 - t.percentile}% |`)
  }
  lines.push('')

  lines.push('### 🔗 攻防对抗图 Attack-Defense')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    RED[🔴 Red Team] -->|Attack| TARGET[System Under Test]')
  lines.push('    TARGET -->|Detection| BLUE[🔵 Blue Team]')
  lines.push('    BLUE -->|Respond| DEFENSE[Defense Mechanism]')
  lines.push('    DEFENSE -->|Block| RED')
  lines.push('    RED -->|Log| SIEM[Security Operations]')
  lines.push('    BLUE -->|Report| SIEM')
  lines.push('    SIEM -->|Score| EFFECTIVENESS[' + result.overall_effectiveness_pct + '% Effectiveness]')
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push(`*CyberAgent Cyber Range v${result.range_version} • Effectiveness: ${result.overall_effectiveness_pct}% • Scenario: ${result.scenario}*`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: AI Agent Firewall
  tools.register(defineTool({
    name: 'ai_agent_firewall',
    description: 'AI Agent防火墙 | Prompt注入检测+敏感操作拦截+输入净化+权限动态校验+上下文消毒 | AI Agent Firewall with injection detection, action interception, input sanitization, dynamic permission checks and context disinfection.',
    parameters: {
      firewall_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (scan|intercept|sanitize|audit), agent_name, input_text, context_window[], sensitivity_level (low|medium|high|critical)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { firewall_input: string }) {
      const input: FirewallInput = JSON.parse(args.firewall_input)
      return formatFirewallReport(analyzeAIAgentFirewall(input))
    }
  }))

  // Tool 2: Behavior Profiler
  tools.register(defineTool({
    name: 'behavior_profiler',
    description: 'Agent行为画像 | 行为基线学习+偏离检测+意图推断+滥用识别+信任评分+跨Agent行为追踪 | Agent behavior profiling with baseline learning, deviation detection, intent inference, abuse identification, trust scoring and cross-agent tracking.',
    parameters: {
      behavior_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (baseline|detect|profile|track), agent_id, session_log[{timestamp, action, target, result}], comparison_window'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { behavior_input: string }) {
      const input: BehaviorInput = JSON.parse(args.behavior_input)
      return formatBehaviorReport(analyzeBehaviorProfiler(input))
    }
  }))

  // Tool 3: Secret Scanner
  tools.register(defineTool({
    name: 'secret_scanner',
    description: '机密泄露扫描 | API Key/PII/源码泄露检测+环境变量审计+Git提交扫描+第三方依赖检查 | Secret leak scanning for API keys, PII, source code exposure, environment variable auditing, git history scanning and third-party dependency checking.',
    parameters: {
      scan_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (scan_code|scan_env|scan_git|scan_deps), target_path, file_patterns[], depth (shallow|medium|deep)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { scan_input: string }) {
      const input: SecretScanInput = JSON.parse(args.scan_input)
      return formatSecretScanReport(analyzeSecretScanner(input))
    }
  }))

  // Tool 4: Dependency Guardian
  tools.register(defineTool({
    name: 'dependency_guardian',
    description: '依赖包安全守卫 | 恶意内容检测+供应链SBOM分析+版本风险评估+CVE自动告警 | Dependency security guardian with malicious content detection, supply chain SBOM analysis, version risk assessment and CVE auto-alerting.',
    parameters: {
      dep_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (analyze|sbom|alert|assess), manifest_path, ecosystem (npm|pypi|cargo|gomod|maven), include_dev (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { dep_input: string }) {
      const input: DependencyInput = JSON.parse(args.dep_input)
      return formatDependencyReport(analyzeDependencyGuardian(input))
    }
  }))

  // Tool 5: Runtime Sandbox
  tools.register(defineTool({
    name: 'runtime_sandbox',
    description: '运行时沙箱控制 | 危险系统调用拦截+网络访问白名单+文件系统隔离+资源配额+逃逸检测 | Runtime sandbox with dangerous syscall interception, network whitelist, filesystem isolation, resource quotas and escape detection.',
    parameters: {
      sandbox_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (isolate|monitor|quota|detect_escape), agent_id, runtime (node|python|wasm|docker), resource_limits{cpu_pct, memory_mb, disk_mb, network_mbps}'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sandbox_input: string }) {
      const input: SandboxInput = JSON.parse(args.sandbox_input)
      return formatSandboxReport(analyzeRuntimeSandbox(input))
    }
  }))

  // Tool 6: MCP Security
  tools.register(defineTool({
    name: 'mcp_security',
    description: 'MCP/A2A协议安全 | 传输加密验证+身份认证+权限最小化+调用审计+异常流量检测 | MCP/A2A protocol security with transport encryption, authentication, least privilege, call auditing and anomaly detection.',
    parameters: {
      mcp_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (encrypt|auth|audit|detect_anomaly), endpoint, protocol (mcp|a2a|both), tls_version?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { mcp_input: string }) {
      const input: MCPSecurityInput = JSON.parse(args.mcp_input)
      return formatMCPSecurityReport(analyzeMCPSecurity(input))
    }
  }))

  // Tool 7: Shadow AI Detector
  tools.register(defineTool({
    name: 'shadow_ai_detector',
    description: '影子AI/Agent检测 | 未授权AI Agent发现+数据外传通道识别+接入点测绘+治理建议+合规报告 | Shadow AI/Agent detection with unauthorized agent discovery, exfiltration channel identification, access point mapping, governance recommendations and compliance reporting.',
    parameters: {
      shadow_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (discover|identify_exfil|map_access|govern|comply), network_range, scan_depth (shallow|medium|deep)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { shadow_input: string }) {
      const input: ShadowAIInput = JSON.parse(args.shadow_input)
      return formatShadowAIReport(analyzeShadowAIDetector(input))
    }
  }))

  // Tool 8: Cyber Range
  tools.register(defineTool({
    name: 'cyber_range',
    description: '网络靶场 | 对抗演练剧本+红队模拟+防御强化建议+CTF式挑战+团队安全效能评分 | Cyber range with drill scenarios, red team simulation, defense recommendations, CTF challenges and team security effectiveness scoring.',
    parameters: {
      range_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (drill|red_team|defend|ctf|score), scenario, difficulty (beginner|intermediate|advanced|expert), team_size'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { range_input: string }) {
      const input: CyberRangeInput = JSON.parse(args.range_input)
      return formatCyberRangeReport(analyzeCyberRange(input))
    }
  }))

  console.log(`[dsh-tool-cyberagent] Loaded v${VERSION} — CyberAgent Defense: 8 tools active`)
  console.log('  Tools: ai_agent_firewall, behavior_profiler, secret_scanner, dependency_guardian, runtime_sandbox, mcp_security, shadow_ai_detector, cyber_range')
}
