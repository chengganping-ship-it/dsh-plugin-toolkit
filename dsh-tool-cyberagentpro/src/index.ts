import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'cyberagentpro'
export const inject = ['tools']

/* ─────────────────────────────────────────────
   Disclaimer
   ───────────────────────────────────────────── */
const DISCLAIMER =
  '本分析基于AI模型推断，仅供安全运营参考，不替代专业安全评估。'

/* ─────────────────────────────────────────────
   1. threat_intelligence
   ───────────────────────────────────────────── */
interface ThreatIntelInput {
  ioc_value: string
  ioc_type: 'ip' | 'domain' | 'hash' | 'url' | 'email'
  context?: string
}

interface ThreatIntelResult {
  ioc: string
  type: string
  verdict: 'malicious' | 'suspicious' | 'benign' | 'unknown'
  confidence: number
  attack_patterns: string[]
  attribution: string[]
  recommendations: string[]
}

function analyzeThreatIntel(input: ThreatIntelInput): ThreatIntelResult {
  const patterns: string[] = []
  const attribution: string[] = []
  const recommendations: string[] = []
  let verdict: ThreatIntelResult['verdict'] = 'unknown'
  let confidence = 0.5

  switch (input.ioc_type) {
    case 'ip':
      patterns.push('C2通信', '扫描行为', '暴力破解')
      attribution.push('疑似APT组织', '僵尸网络节点')
      recommendations.push('在防火墙封禁该IP', '检查内网是否有连接记录', '上报威胁情报平台')
      verdict = 'suspicious'
      confidence = 0.72
      break
    case 'domain':
      patterns.push('DGA域名', '钓鱼域名', '域名仿冒')
      attribution.push('黑产团伙', '钓鱼即服务(PhaaS)')
      recommendations.push('加入DNS黑名单', '检查邮件网关日志', '通知用户安全意识培训')
      verdict = 'malicious'
      confidence = 0.85
      break
    case 'hash':
      patterns.push('已知恶意软件', '勒索软件变种', '木马程序')
      attribution.push('已知恶意软件家族')
      recommendations.push('在EDR中全局搜索该Hash', '隔离受感染主机', '更新防病毒特征库')
      verdict = 'malicious'
      confidence = 0.91
      break
    case 'url':
      patterns.push('钓鱼链接', '恶意下载', '水坑攻击')
      recommendations.push('封禁URL', '检查Web代理日志', '回溯访问用户')
      verdict = 'suspicious'
      confidence = 0.68
      break
    case 'email':
      patterns.push('商业邮件欺诈(BEC)', '钓鱼邮件', '恶意附件')
      recommendations.push('隔离邮件', '检查是否有用户点击', '更新邮件安全策略')
      verdict = 'suspicious'
      confidence = 0.65
      break
  }

  return {
    ioc: input.ioc_value,
    type: input.ioc_type,
    verdict,
    confidence,
    attack_patterns: patterns,
    attribution,
    recommendations,
  }
}

function formatThreatIntel(r: ThreatIntelResult): string {
  return [
    '## 威胁情报分析报告',
    '',
    '### IOC 信息',
    `- **值**: \`${r.ioc}\``,
    `- **类型**: ${r.type.toUpperCase()}`,
    `- **判定**: ${r.verdict.toUpperCase()}`,
    `- **置信度**: ${(r.confidence * 100).toFixed(1)}%`,
    '',
    '### ATT&CK 攻击模式',
    ...r.attack_patterns.map((p) => `- ${p}`),
    '',
    '### 归因分析',
    ...r.attribution.map((a) => `- ${a}`),
    '',
    '### 处置建议',
    ...r.recommendations.map((rec) => `- [ ] ${rec}`),
    '',
    `> ⚠️ ${DISCLAIMER}`,
  ].join('\n')
}

/* ─────────────────────────────────────────────
   2. vulnerability_management
   ───────────────────────────────────────────── */
interface VulnMgmtInput {
  cve_id?: string
  cvss_score?: number
  asset_criticality: 'critical' | 'high' | 'medium' | 'low'
  exploit_available: boolean
  patch_available: boolean
}

interface VulnMgmtResult {
  cve: string
  severity: string
  priority_score: number
  sla_hours: number
  remediation: string[]
  risk_level: '紧急' | '高' | '中' | '低'
}

function analyzeVulnMgmt(input: VulnMgmtInput): VulnMgmtResult {
  const cvss = input.cvss_score ?? 5.0
  let priority = cvss
  if (input.asset_criticality === 'critical') priority += 2
  if (input.asset_criticality === 'high') priority += 1
  if (input.exploit_available) priority += 1.5
  if (!input.patch_available) priority += 0.5

  let risk_level: VulnMgmtResult['risk_level'] = '低'
  let sla = 168
  if (priority >= 10) { risk_level = '紧急'; sla = 4 }
  else if (priority >= 8) { risk_level = '高'; sla = 24 }
  else if (priority >= 5) { risk_level = '中'; sla = 72 }

  const remediation: string[] = []
  if (input.patch_available) remediation.push('立即应用官方补丁')
  else remediation.push('实施虚拟补丁/WAF规则', '联系厂商获取缓解方案')
  remediation.push('隔离受影响资产', '验证修复效果', '更新CMDB漏洞状态')

  return {
    cve: input.cve_id || 'CVE-UNKNOWN',
    severity: `CVSS ${cvss.toFixed(1)}`,
    priority_score: Math.min(priority, 15),
    sla_hours: sla,
    remediation,
    risk_level,
  }
}

function formatVulnMgmt(r: VulnMgmtResult): string {
  return [
    '## 漏洞管理分析报告',
    '',
    '### 漏洞信息',
    `- **CVE**: ${r.cve}`,
    `- **严重程度**: ${r.severity}`,
    `- **优先级评分**: ${r.priority_score.toFixed(1)}/15`,
    `- **风险等级**: ${r.risk_level}`,
    `- **修复SLA**: ${r.sla_hours} 小时`,
    '',
    '### 修复建议',
    ...r.remediation.map((s) => `- [ ] ${s}`),
    '',
    `> ⚠️ ${DISCLAIMER}`,
  ].join('\n')
}

/* ─────────────────────────────────────────────
   3. soc_analytics
   ───────────────────────────────────────────── */
interface SocAnalyticsInput {
  total_alerts: number
  true_positives: number
  false_positives: number
  mttr_minutes: number
  analyst_count: number
  shift_hours: number
}

interface SocAnalyticsResult {
  alert_volume: number
  precision_rate: number
  false_positive_rate: number
  mttr: string
  alerts_per_analyst: number
  fatigue_index: number
  recommendations: string[]
}

function analyzeSocAnalytics(input: SocAnalyticsInput): SocAnalyticsResult {
  const precision = input.total_alerts > 0 ? input.true_positives / input.total_alerts : 0
  const fpRate = input.total_alerts > 0 ? input.false_positives / input.total_alerts : 0
  const alertsPerAnalyst = input.analyst_count > 0 ? input.total_alerts / input.analyst_count : 0
  const fatigueIndex = Math.min(1, (fpRate * 0.6) + (alertsPerAnalyst > 50 ? 0.4 : alertsPerAnalyst / 125))

  const recommendations: string[] = []
  if (fpRate > 0.7) recommendations.push('优化检测规则，降低误报率（当前>70%）')
  if (alertsPerAnalyst > 40) recommendations.push('增加分析师数量或部署SOAR自动化')
  if (input.mttr_minutes > 60) recommendations.push('优化事件响应流程，缩短MTTR')
  recommendations.push('实施告警关联和聚合策略', '定期审查和调优SIEM规则', '建立告警分级分类机制')

  return {
    alert_volume: input.total_alerts,
    precision_rate: precision,
    false_positive_rate: fpRate,
    mttr: `${input.mttr_minutes} 分钟`,
    alerts_per_analyst: Math.round(alertsPerAnalyst),
    fatigue_index: Math.round(fatigueIndex * 100) / 100,
    recommendations,
  }
}

function formatSocAnalytics(r: SocAnalyticsResult): string {
  return [
    '## SOC 运营分析报告',
    '',
    '### 核心指标',
    `- **告警总量**: ${r.alert_volume}`,
    `- **精确率**: ${(r.precision_rate * 100).toFixed(1)}%`,
    `- **误报率**: ${(r.false_positive_rate * 100).toFixed(1)}%`,
    `- **MTTR**: ${r.mttr}`,
    `- **人均告警量**: ${r.alerts_per_analyst} 条/人`,
    `- **疲劳指数**: ${(r.fatigue_index * 100).toFixed(0)}%`,
    '',
    '### 优化建议',
    ...r.recommendations.map((s) => `- [ ] ${s}`),
    '',
    `> ⚠️ ${DISCLAIMER}`,
  ].join('\n')
}

/* ─────────────────────────────────────────────
   4. zero_trust_enforcer
   ───────────────────────────────────────────── */
interface ZeroTrustInput {
  user_role: string
  device_trust_level: 'trusted' | 'managed' | 'unmanaged' | 'unknown'
  network_zone: 'internal' | 'dmz' | 'external' | 'vpn'
  resource_sensitivity: 'public' | 'internal' | 'confidential' | 'restricted'
  mfa_enabled: boolean
  session_age_minutes: number
}

interface ZeroTrustResult {
  access_decision: 'allow' | 'deny' | 'step_up'
  trust_score: number
  policies_applied: string[]
  conditions: string[]
  next_steps: string[]
}

function analyzeZeroTrust(input: ZeroTrustInput): ZeroTrustResult {
  let trustScore = 100
  const policies: string[] = []
  const conditions: string[] = []
  const nextSteps: string[] = []

  if (!input.mfa_enabled) { trustScore -= 30; policies.push('MFA强制策略') }
  if (input.device_trust_level === 'unmanaged') { trustScore -= 25; policies.push('设备合规策略') }
  if (input.device_trust_level === 'unknown') { trustScore -= 35; policies.push('未知设备隔离策略') }
  if (input.network_zone === 'external') { trustScore -= 20; policies.push('外部网络限制策略') }
  if (input.network_zone === 'vpn') { trustScore -= 10; policies.push('VPN访问策略') }
  if (input.session_age_minutes > 120) { trustScore -= 15; policies.push('会话超时策略') }
  if (input.resource_sensitivity === 'restricted') { trustScore -= 10; policies.push('高敏感资源保护') }

  conditions.push(`设备信任级别: ${input.device_trust_level}`)
  conditions.push(`网络区域: ${input.network_zone}`)
  conditions.push(`资源敏感度: ${input.resource_sensitivity}`)
  conditions.push(`MFA状态: ${input.mfa_enabled ? '已启用' : '未启用'}`)
  conditions.push(`会话时长: ${input.session_age_minutes} 分钟`)

  let decision: ZeroTrustResult['access_decision'] = 'allow'
  if (trustScore < 40) decision = 'deny'
  else if (trustScore < 70) decision = 'step_up'

  if (decision === 'deny') nextSteps.push('拒绝访问并记录审计日志', '通知安全团队')
  if (decision === 'step_up') { nextSteps.push('要求MFA验证', '限制为只读访问', '缩短会话有效期') }
  nextSteps.push('持续监控会话行为', '定期重新评估信任评分')

  return {
    access_decision: decision,
    trust_score: Math.max(0, trustScore),
    policies_applied: policies,
    conditions,
    next_steps: nextSteps,
  }
}

function formatZeroTrust(r: ZeroTrustResult): string {
  const decisionLabel = { allow: '✅ 允许', deny: '❌ 拒绝', step_up: '🔐 升级验证' }
  return [
    '## 零信任访问决策报告',
    '',
    '### 决策结果',
    `- **访问决定**: ${decisionLabel[r.access_decision]}`,
    `- **信任评分**: ${r.trust_score}/100`,
    '',
    '### 评估条件',
    ...r.conditions.map((c) => `- ${c}`),
    '',
    '### 已应用策略',
    ...r.policies_applied.map((p) => `- ${p}`),
    '',
    '### 后续步骤',
    ...r.next_steps.map((s) => `- [ ] ${s}`),
    '',
    `> ⚠️ ${DISCLAIMER}`,
  ].join('\n')
}

/* ─────────────────────────────────────────────
   5. data_protection
   ───────────────────────────────────────────── */
interface DataProtectionInput {
  data_type: 'pii' | 'phi' | 'financial' | 'ip' | 'credentials' | 'public'
  volume_gb: number
  encryption_status: 'encrypted' | 'partial' | 'unencrypted'
  access_control: 'rbac' | 'acl' | 'open' | 'none'
  dlp_enabled: boolean
  cross_border: boolean
}

interface DataProtectionResult {
  classification: string
  risk_score: number
  compliance_gaps: string[]
  protection_measures: string[]
  dlp_actions: string[]
}

function analyzeDataProtection(input: DataProtectionInput): DataProtectionResult {
  const classificationMap: Record<string, string> = {
    pii: '个人敏感信息(PII)',
    phi: '健康医疗信息(PHI)',
    financial: '金融数据',
    ip: '知识产权',
    credentials: '凭证数据',
    public: '公开数据',
  }

  let risk = 0
  const gaps: string[] = []
  const measures: string[] = []
  const dlpActions: string[] = []

  if (input.encryption_status === 'unencrypted') { risk += 30; gaps.push('数据未加密存储') }
  else if (input.encryption_status === 'partial') { risk += 15; gaps.push('部分数据未加密') }

  if (input.access_control === 'open' || input.access_control === 'none') {
    risk += 25; gaps.push('访问控制不足')
  }

  if (!input.dlp_enabled) { risk += 20; gaps.push('DLP未部署') }

  if (input.cross_border) { risk += 15; gaps.push('跨境数据传输需合规评估') }

  measures.push('实施数据分类分级', '部署端到端加密', '启用DLP策略监控', '实施最小权限原则')
  dlpActions.push('监控敏感数据外传', '阻断未授权USB拷贝', '审计云存储上传行为', '邮件附件内容检测')

  return {
    classification: classificationMap[input.data_type] || '未分类',
    risk_score: Math.min(risk, 100),
    compliance_gaps: gaps,
    protection_measures: measures,
    dlp_actions: dlpActions,
  }
}

function formatDataProtection(r: DataProtectionResult): string {
  return [
    '## 数据保护分析报告',
    '',
    '### 数据分类',
    `- **分类**: ${r.classification}`,
    `- **风险评分**: ${r.risk_score}/100`,
    '',
    '### 合规差距',
    ...r.compliance_gaps.map((g) => `- ⚠️ ${g}`),
    '',
    '### 保护措施',
    ...r.protection_measures.map((m) => `- [ ] ${m}`),
    '',
    '### DLP 执行动作',
    ...r.dlp_actions.map((a) => `- 🔒 ${a}`),
    '',
    `> ⚠️ ${DISCLAIMER}`,
  ].join('\n')
}

/* ─────────────────────────────────────────────
   6. incident_response_automation
   ───────────────────────────────────────────── */
interface IRInput {
  incident_type: 'malware' | 'ransomware' | 'phishing' | 'ddos' | 'data_breach' | 'insider'
  severity: 'p1' | 'p2' | 'p3' | 'p4'
  affected_hosts: number
  data_exfiltrated: boolean
  containment_status: 'none' | 'partial' | 'full'
}

interface IRResult {
  incident_id: string
  playbook: string
  containment_steps: string[]
  eradication_steps: string[]
  recovery_steps: string[]
  forensic_actions: string[]
}

function analyzeIR(input: IRInput): IRResult {
  const playbookMap: Record<string, string> = {
    malware: '恶意软件事件响应预案',
    ransomware: '勒索软件事件响应预案',
    phishing: '钓鱼攻击事件响应预案',
    ddos: 'DDoS攻击事件响应预案',
    data_breach: '数据泄露事件响应预案',
    insider: '内部威胁事件响应预案',
  }

  const containment: string[] = []
  if (input.containment_status === 'none') {
    containment.push('立即隔离受影响主机/网段', '阻断C2通信通道', '禁用受影响账户')
  }
  containment.push('保留现场证据', '通知应急响应团队', '启动事件指挥链')

  const eradication = [
    '清除恶意代码/后门',
    '修补被利用的漏洞',
    '重置受影响凭证',
    '更新检测规则',
  ]

  const recovery = [
    '从可信备份恢复系统',
    '逐步恢复网络连接',
    '持续监控异常行为',
    '验证业务功能正常',
  ]

  const forensic = [
    '采集内存镜像',
    '提取磁盘取证镜像',
    '分析网络流量日志',
    '保全审计日志证据链',
    '生成取证报告',
  ]

  return {
    incident_id: `INC-${Date.now().toString(36).toUpperCase()}`,
    playbook: playbookMap[input.incident_type] || '通用事件响应预案',
    containment_steps: containment,
    eradication_steps: eradication,
    recovery_steps: recovery,
    forensic_actions: forensic,
  }
}

function formatIR(r: IRResult): string {
  return [
    '## 事件响应自动化报告',
    '',
    '### 事件信息',
    `- **事件ID**: ${r.incident_id}`,
    `- **响应预案**: ${r.playbook}`,
    '',
    '### 遏制措施',
    ...r.containment_steps.map((s) => `- 🛑 ${s}`),
    '',
    '### 根除步骤',
    ...r.eradication_steps.map((s) => `- 🧹 ${s}`),
    '',
    '### 恢复步骤',
    ...r.recovery_steps.map((s) => `- 🔄 ${s}`),
    '',
    '### 取证行动',
    ...r.forensic_actions.map((s) => `- 🔍 ${s}`),
    '',
    `> ⚠️ ${DISCLAIMER}`,
  ].join('\n')
}

/* ─────────────────────────────────────────────
   7. compliance_checker_sec
   ───────────────────────────────────────────── */
interface ComplianceInput {
  framework: 'mlps_2_0' | 'gdpr' | 'iso27001' | 'pci_dss' | 'soc2'
  domain: string
  controls_assessed: number
  controls_passed: number
  findings: string[]
}

interface ComplianceResult {
  framework: string
  compliance_rate: number
  status: '合规' | '部分合规' | '不合规'
  gaps: string[]
  remediation_plan: string[]
  next_audit: string
}

function analyzeCompliance(input: ComplianceInput): ComplianceResult {
  const frameworkNames: Record<string, string> = {
    mlps_2_0: '网络安全等级保护 2.0',
    gdpr: '欧盟通用数据保护条例',
    iso27001: 'ISO/IEC 27001',
    pci_dss: 'PCI DSS 支付卡行业',
    soc2: 'SOC 2 服务组织控制',
  }

  const rate = input.controls_assessed > 0 ? input.controls_passed / input.controls_assessed : 0
  let status: ComplianceResult['status'] = '合规'
  if (rate < 0.6) status = '不合规'
  else if (rate < 0.85) status = '部分合规'

  const gaps = [...input.findings]
  if (rate < 0.9) gaps.push('部分控制措施未完全实施')
  if (rate < 0.7) gaps.push('安全策略文档需更新')

  const remediation = [
    '制定整改计划并分配责任人',
    '实施缺失的技术控制措施',
    '更新安全策略和程序文档',
    '开展员工安全意识培训',
    '建立持续监控机制',
  ]

  const nextAudit = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return {
    framework: frameworkNames[input.framework] || input.framework,
    compliance_rate: Math.round(rate * 100),
    status,
    gaps,
    remediation_plan: remediation,
    next_audit: nextAudit,
  }
}

function formatCompliance(r: ComplianceResult): string {
  const statusIcon = { '合规': '✅', '部分合规': '⚠️', '不合规': '❌' }
  return [
    '## 合规检查报告',
    '',
    '### 合规状态',
    `- **框架**: ${r.framework}`,
    `- **合规率**: ${r.compliance_rate}%`,
    `- **状态**: ${statusIcon[r.status]} ${r.status}`,
    '',
    '### 差距分析',
    ...r.gaps.map((g) => `- ${g}`),
    '',
    '### 整改计划',
    ...r.remediation_plan.map((s) => `- [ ] ${s}`),
    '',
    `**下次审计建议日期**: ${r.next_audit}`,
    '',
    `> ⚠️ ${DISCLAIMER}`,
  ].join('\n')
}

/* ─────────────────────────────────────────────
   8. red_team_ai
   ───────────────────────────────────────────── */
interface RedTeamInput {
  engagement_type: 'pentest' | 'phishing' | 'social_engineering' | 'physical' | 'wireless'
  target_scope: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  evasion_required: boolean
}

interface RedTeamResult {
  engagement: string
  attack_vectors: string[]
  phishing_templates: string[]
  evasion_techniques: string[]
  success_criteria: string[]
  ethical_notes: string[]
}

function analyzeRedTeam(input: RedTeamInput): RedTeamResult {
  const vectors: string[] = []
  const phishing: string[] = []
  const evasion: string[] = []
  const criteria: string[] = []

  switch (input.engagement_type) {
    case 'pentest':
      vectors.push('外部渗透测试', 'Web应用漏洞利用', '内网横向移动', '权限提升')
      criteria.push('获取域管理员权限', '访问核心数据库', '突破网络边界')
      break
    case 'phishing':
      vectors.push('鱼叉式钓鱼', '水坑攻击', '商业邮件欺诈')
      phishing.push('IT部门密码重置通知', 'HR福利更新通知', '高管紧急转账请求')
      criteria.push('钓鱼邮件打开率>30%', '凭证获取率>10%', 'MFA绕过测试')
      break
    case 'social_engineering':
      vectors.push('电话钓鱼(Vishing)', '尾随进入', '伪装IT支持')
      criteria.push('获取敏感信息', '物理进入受限区域', '诱导执行恶意操作')
      break
    case 'physical':
      vectors.push('门禁绕过', 'RFID克隆', '安全摄像头盲区')
      criteria.push('进入数据中心', '获取物理设备', '植入硬件后门')
      break
    case 'wireless':
      vectors.push('WPA3破解', '恶意AP', '蓝牙漏洞利用')
      criteria.push('获取WiFi密码', '中间人攻击成功', '数据截获')
      break
  }

  if (input.evasion_required) {
    evasion.push('免杀Payload生成', '流量加密/混淆', '内存注入技术', '日志清除')
  }

  return {
    engagement: `${input.engagement_type} - ${input.target_scope}`,
    attack_vectors: vectors,
    phishing_templates: phishing,
    evasion_techniques: evasion,
    success_criteria: criteria,
    ethical_notes: [
      '所有测试必须在授权范围内进行',
      '测试前签署正式的授权协议',
      '发现高危漏洞立即报告',
      '测试数据需安全销毁',
      '遵守负责任披露原则',
    ],
  }
}

function formatRedTeam(r: RedTeamResult): string {
  return [
    '## 红队AI 评估报告',
    '',
    '### 任务信息',
    `- **任务**: ${r.engagement}`,
    '',
    '### 攻击向量',
    ...r.attack_vectors.map((v) => `- 🎯 ${v}`),
    ...(r.phishing_templates.length > 0 ? ['', '### 钓鱼模板', ...r.phishing_templates.map((t) => `- 📧 ${t}`)] : []),
    ...(r.evasion_techniques.length > 0 ? ['', '### 规避技术', ...r.evasion_techniques.map((e) => `- 👻 ${e}`)] : []),
    '',
    '### 成功标准',
    ...r.success_criteria.map((c) => `- ✅ ${c}`),
    '',
    '### 伦理注意事项',
    ...r.ethical_notes.map((n) => `- ⚖️ ${n}`),
    '',
    `> ⚠️ ${DISCLAIMER}`,
  ].join('\n')
}

/* ─────────────────────────────────────────────
   Plugin Registration
   ───────────────────────────────────────────── */
export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. threat_intelligence
  tools.register(defineTool({
    name: 'threat_intelligence',
    description: '威胁情报分析 — 对IOC(IP/域名/Hash/URL/邮件)进行威胁评估、ATT&CK攻击模式映射、归因分析和处置建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { ioc_value: string, ioc_type: "ip"|"domain"|"hash"|"url"|"email", context?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatThreatIntel(analyzeThreatIntel(JSON.parse(args.input_data)))
    },
  }))

  // 2. vulnerability_management
  tools.register(defineTool({
    name: 'vulnerability_management',
    description: '漏洞管理 — 基于CVSS评分、资产重要性、漏洞利用条件计算修复优先级和SLA，输出修复建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { cve_id?: string, cvss_score?: number, asset_criticality: "critical"|"high"|"medium"|"low", exploit_available: boolean, patch_available: boolean }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatVulnMgmt(analyzeVulnMgmt(JSON.parse(args.input_data)))
    },
  }))

  // 3. soc_analytics
  tools.register(defineTool({
    name: 'soc_analytics',
    description: 'SOC运营分析 — 分析告警量、精确率、误报率、MTTR、告警疲劳指数，输出运营优化建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { total_alerts: number, true_positives: number, false_positives: number, mttr_minutes: number, analyst_count: number, shift_hours: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSocAnalytics(analyzeSocAnalytics(JSON.parse(args.input_data)))
    },
  }))

  // 4. zero_trust_enforcer
  tools.register(defineTool({
    name: 'zero_trust_enforcer',
    description: '零信任策略执行 — 基于设备信任级别、网络区域、MFA状态、会话时长等计算信任评分并做出访问决策',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { user_role: string, device_trust_level: "trusted"|"managed"|"unmanaged"|"unknown", network_zone: "internal"|"dmz"|"external"|"vpn", resource_sensitivity: "public"|"internal"|"confidential"|"restricted", mfa_enabled: boolean, session_age_minutes: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatZeroTrust(analyzeZeroTrust(JSON.parse(args.input_data)))
    },
  }))

  // 5. data_protection
  tools.register(defineTool({
    name: 'data_protection',
    description: '数据保护评估 — 评估数据分类、加密状态、访问控制、DLP部署和跨境传输的合规差距及保护措施',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { data_type: "pii"|"phi"|"financial"|"ip"|"credentials"|"public", volume_gb: number, encryption_status: "encrypted"|"partial"|"unencrypted", access_control: "rbac"|"acl"|"open"|"none", dlp_enabled: boolean, cross_border: boolean }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatDataProtection(analyzeDataProtection(JSON.parse(args.input_data)))
    },
  }))

  // 6. incident_response_automation
  tools.register(defineTool({
    name: 'incident_response_automation',
    description: '事件响应自动化 — 根据事件类型自动匹配响应预案，输出遏制、根除、恢复和取证全流程步骤',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { incident_type: "malware"|"ransomware"|"phishing"|"ddos"|"data_breach"|"insider", severity: "p1"|"p2"|"p3"|"p4", affected_hosts: number, data_exfiltrated: boolean, containment_status: "none"|"partial"|"full" }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatIR(analyzeIR(JSON.parse(args.input_data)))
    },
  }))

  // 7. compliance_checker_sec
  tools.register(defineTool({
    name: 'compliance_checker_sec',
    description: '合规安全检查 — 评估等保2.0/GDPR/ISO27001/PCI DSS/SOC2合规状态，输出差距分析和整改计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { framework: "mlps_2_0"|"gdpr"|"iso27001"|"pci_dss"|"soc2", domain: string, controls_assessed: number, controls_passed: number, findings: string[] }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCompliance(analyzeCompliance(JSON.parse(args.input_data)))
    },
  }))

  // 8. red_team_ai
  tools.register(defineTool({
    name: 'red_team_ai',
    description: '红队AI评估 — 模拟渗透测试、钓鱼攻击、社会工程学等红队行动，输出攻击向量、规避技术和伦理注意事项',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { engagement_type: "pentest"|"phishing"|"social_engineering"|"physical"|"wireless", target_scope: string, difficulty: "basic"|"intermediate"|"advanced", evasion_required: boolean }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatRedTeam(analyzeRedTeam(JSON.parse(args.input_data)))
    },
  }))
}
