/**
 * DSH Cybersecurity Threat Intelligence Plugin v0.1.0
 *
 * Comprehensive threat detection, vulnerability assessment, security scoring,
 * and incident response toolkit for DeepSeek Harness Agent.
 * Designed for security analysts, SOC teams, and compliance officers.
 *
 * Features (v0.1.0):
 * - Threat Intelligence Analyzer (IOC attribution and campaign linking)
 * - Vulnerability Scanner (CVE matching and exploitability assessment)
 * - Attack Surface Mapper (exposed entry point discovery and shadow IT)
 * - Security Posture Scorer (control maturity and gap analysis)
 * - Incident Classifier (type identification and containment actions)
 * - Phishing Detector (email analysis and impersonation detection)
 * - Firewall Rule Auditor (shadow rules and compliance violations)
 * - Compliance Mapper (SOC2/ISO27001/PCI-DSS/HIPAA coverage gaps)
 *
 * @module dsh-tool-cybersec
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cybersec'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface Indicator {
  type: string
  value: string
  source: string
  confidence: number
}

interface ThreatAssessment {
  actor_attribution: string[]
  campaign_links: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  mitre_attack_mapping: string[]
  confidence: number
  summary: string
}

interface TargetInfo {
  os: string
  services: string[]
  versions: string[]
  ports: number[]
}

interface VulnerabilityMatch {
  cve_id: string
  cvss_score: number
  exploitability: 'none' | 'low' | 'medium' | 'high' | 'critical'
  patch_availability: boolean
  description: string
  affected_service: string
}

interface Asset {
  type: string
  domain: string
  ip: string
  technology: string
}

interface AttackSurfaceResult {
  attack_surface_score: number
  exposed_entry_points: string[]
  shadow_it_findings: string[]
  risk_prioritization: string[]
}

interface SecurityControls {
  firewall: string
  edr: string
  mfa: string
  patching: string
  backup: string
  encryption: string
}

interface SecurityPostureResult {
  overall_score: number
  maturity_level: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing'
  gaps: string[]
  improvement_roadmap: string[]
}

interface IncidentData {
  title: string
  description: string
  affected_systems: string[]
  indicators: string[]
}

interface IncidentClassification {
  incident_type: string
  severity_level: 'low' | 'medium' | 'high' | 'critical'
  response_priority: number
  containment_actions: string[]
}

interface EmailData {
  subject: string
  sender: string
  body: string
  links: string[]
  attachments: string[]
}

interface PhishingResult {
  phishing_score: number
  red_flags: string[]
  impersonation_type: string | null
  recommended_action: string
}

interface FirewallRule {
  source: string
  destination: string
  port: number | string
  action: string
  description: string
}

interface FirewallAuditResult {
  shadow_rules: string[]
  redundant_rules: string[]
  overly_permissive: string[]
  violations: string[]
  optimization: string[]
}

interface ControlItem {
  id: string
  name: string
  description: string
  status: 'implemented' | 'partial' | 'not_implemented'
}

interface ComplianceResult {
  coverage_gaps: string[]
  control_mapping: Record<string, string[]>
  evidence_requirements: string[]
  remediation_steps: string[]
}

// ==================== TOOL 1: THREAT INTEL ANALYZER ====================

function analyzeThreatIndicators(indicators: Indicator[]): ThreatAssessment {
  const actorMap: Record<string, string[]> = {
    'apt': ['APT28 (Fancy Bear)', 'APT29 (Cozy Bear)', 'Lazarus Group', 'Equation Group'],
    'ransomware': ['REvil', 'DarkSide', 'LockBit', 'BlackCat/ALPHV'],
    'c2': ['Cobalt Strike', 'Metasploit', 'Mythic', 'Sliver'],
    'phishing': ['TA505', 'Scattered Spider', 'Fin7'],
    'default': ['Unknown Actor - Requires Further Investigation']
  }

  const campaignMap: Record<string, string[]> = {
    'apt': ['Operation Ghost', 'SolarWinds Campaign', 'Cloud Hopper'],
    'ransomware': ['Colonial Pipeline Attack', 'Kaseya VSA Incident', 'JBS Foods Attack'],
    'c2': ['Cobalt Strike Breach Wave', 'Post-Exploitation Campaign'],
    'phishing': ['Business Email Compromise Wave', 'Credential Harvesting Campaign'],
    'default': ['No confirmed campaign linkage']
  }

  const mitreMap: Record<string, string[]> = {
    'apt': ['T1566 - Phishing', 'T1078 - Valid Accounts', 'T1059 - Command and Scripting Interpreter'],
    'ransomware': ['T1486 - Data Encrypted for Impact', 'T1490 - Inhibit System Recovery', 'T1569 - System Services'],
    'c2': ['T1071 - Application Layer Protocol', 'T1572 - Protocol Tunneling', 'T1105 - Ingress Tool Transfer'],
    'phishing': ['T1566.002 - Spearphishing Link', 'T1566.001 - Spearphishing Attachment', 'T1598 - Phishing for Information'],
    'default': ['T1595 - Active Scanning', 'T1592 - Gather Victim Host Information']
  }

  const types = indicators.map(i => i.type.toLowerCase())
  let category = 'default'
  if (types.some(t => ['ip', 'domain', 'hash'].includes(t))) category = 'apt'
  if (types.some(t => t.includes('ransom') || t.includes('malware'))) category = 'ransomware'
  if (types.some(t => t.includes('c2') || t.includes('command'))) category = 'c2'
  if (types.some(t => t.includes('email') || t.includes('url'))) category = 'phishing'

  const avgConfidence = indicators.length > 0
    ? indicators.reduce((s, i) => s + (i.confidence || 0.5), 0) / indicators.length
    : 0.5

  const highConfCount = indicators.filter(i => (i.confidence || 0) > 0.7).length
  let severity: ThreatAssessment['severity'] = 'low'
  if (avgConfidence > 0.8 && highConfCount >= 2) severity = 'critical'
  else if (avgConfidence > 0.6) severity = 'high'
  else if (avgConfidence > 0.4) severity = 'medium'

  return {
    actor_attribution: actorMap[category],
    campaign_links: campaignMap[category],
    severity,
    mitre_attack_mapping: mitreMap[category],
    confidence: avgConfidence,
    summary: `Analysis of ${indicators.length} indicator(s) suggests ${severity.toUpperCase()} threat level. ` +
      `Primary actor category: ${category}. Average confidence: ${(avgConfidence * 100).toFixed(0)}%. ` +
      `High-confidence indicators: ${highConfCount}/${indicators.length}.`
  }
}

function formatThreatIntelReport(assessment: ThreatAssessment): string {
  const lines: string[] = []
  lines.push('## Threat Intelligence Analysis')
  lines.push('')
  lines.push(`**Severity:** ${assessment.severity.toUpperCase()} | **Confidence:** ${(assessment.confidence * 100).toFixed(0)}%`)
  lines.push('')
  lines.push(`**Summary:** ${assessment.summary}`)
  lines.push('')

  lines.push('### Actor Attribution')
  for (const actor of assessment.actor_attribution) {
    lines.push(`- ${actor}`)
  }
  lines.push('')

  lines.push('### Campaign Links')
  for (const campaign of assessment.campaign_links) {
    lines.push(`- ${campaign}`)
  }
  lines.push('')

  lines.push('### MITRE ATT&CK Mapping')
  for (const technique of assessment.mitre_attack_mapping) {
    lines.push(`- ${technique}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 2: VULNERABILITY SCANNER ====================

function scanVulnerabilities(target: TargetInfo): VulnerabilityMatch[] {
  const matches: VulnerabilityMatch[] = []
  const { os, services, versions, ports } = target

  const vulnDatabase: Array<Partial<VulnerabilityMatch> & { matchService: string }> = [
    { cve_id: 'CVE-2024-3400', cvss_score: 10.0, exploitability: 'critical', patch_availability: true, description: 'Palo Alto PAN-OS Command Injection', matchService: 'paloalto' },
    { cve_id: 'CVE-2024-21762', cvss_score: 9.8, exploitability: 'critical', patch_availability: true, description: 'Fortinet FortiOS Out-of-Bound Write', matchService: 'fortinet' },
    { cve_id: 'CVE-2023-44487', cvss_score: 7.5, exploitability: 'high', patch_availability: true, description: 'HTTP/2 Rapid Reset DDoS', matchService: 'nginx' },
    { cve_id: 'CVE-2024-6387', cvss_score: 8.1, exploitability: 'high', patch_availability: true, description: 'OpenSSH regreSSHion RCE', matchService: 'ssh' },
    { cve_id: 'CVE-2023-46805', cvss_score: 8.2, exploitability: 'high', patch_availability: true, description: 'Ivanti Connect Secure Auth Bypass', matchService: 'ivanti' },
    { cve_id: 'CVE-2024-1709', cvss_score: 10.0, exploitability: 'critical', patch_availability: true, description: 'ConnectWise ScreenConnect Auth Bypass', matchService: 'screenconnect' },
    { cve_id: 'CVE-2024-0012', cvss_score: 8.1, exploitability: 'high', patch_availability: false, description: 'PAN-OS Management Interface Auth Bypass', matchService: 'paloalto' },
    { cve_id: 'CVE-2023-34362', cvss_score: 10.0, exploitability: 'critical', patch_availability: true, description: 'MOVEit Transfer SQL Injection', matchService: 'moveit' },
    { cve_id: 'CVE-2024-21413', cvss_score: 9.8, exploitability: 'high', patch_availability: true, description: 'Microsoft Outlook Remote Code Execution', matchService: 'outlook' },
    { cve_id: 'CVE-2024-38077', cvss_score: 9.8, exploitability: 'critical', patch_availability: true, description: 'Windows Remote Desktop Licensing RCE', matchService: 'rdp' },
    { cve_id: 'CVE-2024-49112', cvss_score: 9.8, exploitability: 'critical', patch_availability: true, description: 'Windows LDAP Remote Code Execution', matchService: 'ldap' },
    { cve_id: 'CVE-2023-4966', cvss_score: 8.2, exploitability: 'high', patch_availability: true, description: 'Citrix NetScaler Information Disclosure (CitrixBleed)', matchService: 'netscaler' },
  ]

  for (const service of services) {
    const svcLower = service.toLowerCase()
    for (const vuln of vulnDatabase) {
      if (svcLower.includes(vuln.matchService!)) {
        matches.push({
          cve_id: vuln.cve_id!,
          cvss_score: vuln.cvss_score!,
          exploitability: vuln.exploitability!,
          patch_availability: vuln.patch_availability!,
          description: vuln.description!,
          affected_service: service
        })
      }
    }
  }

  // Check for common open ports with potential vulnerabilities
  if (ports.includes(445) || ports.includes(139)) {
    matches.push({
      cve_id: 'CVE-2017-0144',
      cvss_score: 8.1,
      exploitability: 'high',
      patch_availability: true,
      description: 'EternalBlue SMB Remote Code Execution',
      affected_service: 'SMB (Port 445)'
    })
  }
  if (ports.includes(3389)) {
    matches.push({
      cve_id: 'CVE-2019-0708',
      cvss_score: 9.8,
      exploitability: 'high',
      patch_availability: true,
      description: 'BlueKeep Remote Desktop Remote Code Execution',
      affected_service: 'RDP (Port 3389)'
    })
  }
  if (ports.includes(80) || ports.includes(443) || ports.includes(8080) || ports.includes(8443)) {
    matches.push({
      cve_id: 'CVE-2021-41773',
      cvss_score: 7.5,
      exploitability: 'high',
      patch_availability: true,
      description: 'Apache HTTP Server Path Traversal',
      affected_service: 'HTTP Service'
    })
  }

  if (os.toLowerCase().includes('windows') && os.includes('10')) {
    matches.push({
      cve_id: 'CVE-2023-21716',
      cvss_score: 9.8,
      exploitability: 'high',
      patch_availability: true,
      description: 'Microsoft Word RTF Remote Code Execution',
      affected_service: 'MS Office'
    })
  }

  return matches.sort((a, b) => b.cvss_score - a.cvss_score)
}

function formatVulnerabilityReport(matches: VulnerabilityMatch[], target: TargetInfo): string {
  const lines: string[] = []
  lines.push('## Vulnerability Scan Report')
  lines.push('')
  lines.push(`**Target:** ${target.os} | Services: ${target.services.join(', ')} | Open Ports: ${target.ports.join(', ')}`)
  lines.push('')

  if (matches.length === 0) {
    lines.push('No known CVE matches found for the specified services.')
    return lines.join('\n')
  }

  const critical = matches.filter(m => m.cvss_score >= 9.0)
  const high = matches.filter(m => m.cvss_score >= 7.0 && m.cvss_score < 9.0)
  const medium = matches.filter(m => m.cvss_score < 7.0)

  lines.push(`**Total Vulnerabilities:** ${matches.length} | Critical: ${critical.length} | High: ${high.length} | Medium: ${medium.length}`)
  lines.push('')

  lines.push('| CVE | CVSS | Exploitability | Patch | Affected Service | Description |')
  lines.push('|-----|------|----------------|-------|-----------------|-------------|')
  for (const m of matches) {
    lines.push(`| ${m.cve_id} | ${m.cvss_score.toFixed(1)} | ${m.exploitability} | ${m.patch_availability ? 'Yes' : 'No'} | ${m.affected_service} | ${m.description} |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: ATTACK SURFACE MAPPER ====================

function mapAttackSurface(assets: Asset[]): AttackSurfaceResult {
  const exposedEntryPoints: string[] = []
  const shadowItFindings: string[] = []
  const riskPrioritization: string[] = []

  let score = 0

  for (const asset of assets) {
    const tech = asset.technology.toLowerCase()
    const domain = asset.domain.toLowerCase()

    // Exposed entry points
    if (tech.includes('web') || tech.includes('api')) {
      exposedEntryPoints.push(`${asset.domain} - Web/API endpoint (${asset.technology})`)
      score += 15
    }
    if (tech.includes('email') || tech.includes('smtp')) {
      exposedEntryPoints.push(`${asset.domain} - Email gateway (${asset.technology})`)
      score += 10
    }
    if (tech.includes('vpn') || tech.includes('remote')) {
      exposedEntryPoints.push(`${asset.domain} - Remote access (${asset.technology})`)
      score += 20
    }
    if (tech.includes('cloud') || tech.includes('aws') || tech.includes('azure') || tech.includes('gcp')) {
      exposedEntryPoints.push(`${asset.domain} - Cloud infrastructure (${asset.technology})`)
      score += 18
    }
    if (tech.includes('iot') || tech.includes('scada') || tech.includes('industrial')) {
      exposedEntryPoints.push(`${asset.domain} - IoT/OT device (${asset.technology})`)
      score += 25
    }
    if (domain.includes('dev.') || domain.includes('staging.') || domain.includes('test.')) {
      exposedEntryPoints.push(`${asset.domain} - Non-production environment (${asset.technology})`)
      score += 12
    }

    // Shadow IT detection
    if (tech.includes('unauthorized') || tech.includes('personal') || tech.includes('unsanctioned')) {
      shadowItFindings.push(`${asset.domain} - Unauthorized service detected (${asset.technology})`)
      score += 20
    }
    if (domain.includes('freemium') || domain.includes('trial') || domain.includes('free.')) {
      shadowItFindings.push(`${asset.domain} - Free/trial service in use (${asset.technology})`)
      score += 15
    }
    if (asset.type === 'saas' || asset.type === 'shadow') {
      shadowItFindings.push(`${asset.domain} - Unmanaged SaaS application (${asset.technology})`)
      score += 18
    }
  }

  // Risk prioritization
  if (score > 80) riskPrioritization.push('CRITICAL: Immediate remediation required - extensive attack surface exposure')
  if (score > 60) riskPrioritization.push('HIGH: Prioritize patching internet-facing services within 48 hours')
  if (shadowItFindings.length > 0) riskPrioritization.push(`HIGH: ${shadowItFindings.length} shadow IT asset(s) require immediate review and potential blocking`)
  if (exposedEntryPoints.length > 5) riskPrioritization.push('MEDIUM: Consolidate exposed entry points - potential for service reduction')
  riskPrioritization.push('MEDIUM: Implement continuous attack surface monitoring and automated discovery')
  riskPrioritization.push('LOW: Conduct quarterly external penetration testing against identified assets')

  return {
    attack_surface_score: Math.min(score, 100),
    exposed_entry_points: exposedEntryPoints,
    shadow_it_findings: shadowItFindings,
    risk_prioritization: riskPrioritization
  }
}

function formatAttackSurfaceReport(result: AttackSurfaceResult): string {
  const lines: string[] = []
  lines.push('## Attack Surface Mapping Report')
  lines.push('')
  lines.push(`**Attack Surface Score:** ${result.attack_surface_score}/100 ${result.attack_surface_score > 70 ? '(CRITICAL)' : result.attack_surface_score > 40 ? '(ELEVATED)' : result.attack_surface_score > 20 ? '(MODERATE)' : '(LOW)'}`)
  lines.push('')

  lines.push('### Exposed Entry Points')
  for (const ep of result.exposed_entry_points) {
    lines.push(`- ${ep}`)
  }
  lines.push('')

  lines.push('### Shadow IT Findings')
  if (result.shadow_it_findings.length > 0) {
    for (const si of result.shadow_it_findings) {
      lines.push(`- ${si}`)
    }
  } else {
    lines.push('- No shadow IT findings detected')
  }
  lines.push('')

  lines.push('### Risk Prioritization')
  for (const rp of result.risk_prioritization) {
    lines.push(`- ${rp}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: SECURITY POSTURE SCORER ====================

function scoreSecurityPosture(controls: SecurityControls): SecurityPostureResult {
  const scoring: Record<string, Record<string, number>> = {
    firewall: { 'none': 0, 'basic': 2, 'advanced': 4, 'next-gen': 5 },
    edr: { 'none': 0, 'basic': 2, 'advanced': 4, 'managed': 5 },
    mfa: { 'none': 0, 'sms': 2, 'totp': 4, 'hardware': 5 },
    patching: { 'none': 0, 'manual': 1, 'scheduled': 3, 'automated': 5 },
    backup: { 'none': 0, 'local': 2, 'cloud': 4, 'immutable': 5 },
    encryption: { 'none': 0, 'at-rest': 3, 'in-transit': 4, 'both': 5 }
  }

  let totalScore = 0
  const maxScore = 25
  const gaps: string[] = []
  const roadmap: string[] = []

  for (const [control, value] of Object.entries(controls)) {
    const controlScore = scoring[control]?.[value.toLowerCase()] ?? 0
    totalScore += controlScore
    if (controlScore <= 1) {
      gaps.push(`${control.toUpperCase()}: Current implementation (${value}) is critically insufficient`)
    } else if (controlScore <= 3) {
      gaps.push(`${control.toUpperCase()}: Current implementation (${value}) needs improvement`)
    }
  }

  const overallScore = Math.round((totalScore / maxScore) * 100)

  let maturityLevel: SecurityPostureResult['maturity_level'] = 'initial'
  if (overallScore >= 90) maturityLevel = 'optimizing'
  else if (overallScore >= 70) maturityLevel = 'managed'
  else if (overallScore >= 50) maturityLevel = 'defined'
  else if (overallScore >= 30) maturityLevel = 'developing'

  // Improvement roadmap
  if (controls.firewall.toLowerCase() === 'basic' || controls.firewall.toLowerCase() === 'none') {
    roadmap.push('Phase 1 (0-30 days): Upgrade to next-gen firewall with IPS/IDS capabilities')
  }
  if (controls.edr.toLowerCase() === 'none' || controls.edr.toLowerCase() === 'basic') {
    roadmap.push('Phase 1 (0-30 days): Deploy enterprise EDR solution across all endpoints')
  }
  if (controls.mfa.toLowerCase() === 'none' || controls.mfa.toLowerCase() === 'sms') {
    roadmap.push('Phase 2 (30-60 days): Implement hardware MFA or TOTP for all privileged accounts')
  }
  if (controls.patching.toLowerCase() !== 'automated') {
    roadmap.push('Phase 2 (30-60 days): Implement automated patch management with SLA-based deployment')
  }
  if (controls.backup.toLowerCase() === 'none' || controls.backup.toLowerCase() === 'local') {
    roadmap.push('Phase 3 (60-90 days): Migrate to immutable cloud backup with regular recovery testing')
  }
  if (controls.encryption.toLowerCase() !== 'both') {
    roadmap.push('Phase 3 (60-90 days): Enable both at-rest and in-transit encryption for all sensitive data')
  }

  return { overall_score: overallScore, maturity_level: maturityLevel, gaps, improvement_roadmap: roadmap }
}

function formatPostureReport(result: SecurityPostureResult): string {
  const lines: string[] = []
  lines.push('## Security Posture Assessment')
  lines.push('')
  lines.push(`**Overall Score:** ${result.overall_score}/100 | **Maturity Level:** ${result.maturity_level.toUpperCase()}`)
  lines.push('')

  lines.push('### Gaps Identified')
  if (result.gaps.length > 0) {
    for (const gap of result.gaps) {
      lines.push(`- ${gap}`)
    }
  } else {
    lines.push('- No critical gaps identified')
  }
  lines.push('')

  lines.push('### Improvement Roadmap')
  for (const step of result.improvement_roadmap) {
    lines.push(`- ${step}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: INCIDENT CLASSIFIER ====================

function classifyIncident(incident: IncidentData): IncidentClassification {
  const desc = incident.description.toLowerCase()
  const title = incident.title.toLowerCase()

  let incident_type = 'Unknown'
  let severity_level: IncidentClassification['severity_level'] = 'medium'
  let response_priority = 3
  const containment_actions: string[] = []

  // Determine incident type
  if (desc.includes('ransomware') || desc.includes('encrypted') || desc.includes('ransom')) {
    incident_type = 'Ransomware Attack'
    severity_level = 'critical'
    response_priority = 1
    containment_actions.push('Isolate affected systems immediately (network disconnect)')
    containment_actions.push('Preserve evidence - do not power off affected machines')
    containment_actions.push('Activate incident response team and legal counsel')
    containment_actions.push('Notify cyber insurance provider within 24 hours')
    containment_actions.push('Begin forensic imaging of affected systems')
  } else if (desc.includes('phishing') || desc.includes('credential') || desc.includes('account compromised')) {
    incident_type = 'Credential Compromise'
    severity_level = 'high'
    response_priority = 2
    containment_actions.push('Force password reset for affected accounts')
    containment_actions.push('Revoke active sessions and API tokens')
    containment_actions.push('Enable enhanced monitoring on affected accounts')
    containment_actions.push('Block identified phishing URLs/domains at email gateway')
  } else if (desc.includes('ddos') || desc.includes('denial of service')) {
    incident_type = 'Denial of Service'
    severity_level = 'high'
    response_priority = 2
    containment_actions.push('Activate DDoS mitigation service / CDN WAF')
    containment_actions.push('Implement rate limiting on affected services')
    containment_actions.push('Contact ISP for upstream filtering')
    containment_actions.push('Scale affected infrastructure as mitigation')
  } else if (desc.includes('data breach') || desc.includes('data leak') || desc.includes('exfiltration')) {
    incident_type = 'Data Breach / Exfiltration'
    severity_level = 'critical'
    response_priority = 1
    containment_actions.push('Block identified exfiltration channels')
    containment_actions.push('Isolate compromised database servers')
    containment_actions.push('Notify data protection officer and legal team')
    containment_actions.push('Prepare regulatory notification (GDPR 72-hour requirement)')
  } else if (desc.includes('malware') || desc.includes('virus') || desc.includes('trojan')) {
    incident_type = 'Malware Infection'
    severity_level = 'high'
    response_priority = 2
    containment_actions.push('Quarantine infected endpoints via EDR')
    containment_actions.push('Block identified C2 domains and IPs')
    containment_actions.push('Scan all endpoints for similar indicators')
  } else if (desc.includes('insider') || desc.includes('employee') || desc.includes('privileged')) {
    incident_type = 'Insider Threat'
    severity_level = 'high'
    response_priority = 2
    containment_actions.push('Restrict access for suspected insider accounts')
    containment_actions.push('Preserve audit logs and access records')
    containment_actions.push('Engage HR and legal for coordinated response')
    containment_actions.push('Monitor data movement patterns')
  } else {
    incident_type = 'General Security Incident'
    severity_level = 'medium'
    response_priority = 3
    containment_actions.push('Document all observations and timeline')
    containment_actions.push('Assess scope of impact on affected systems')
    containment_actions.push('Escalate to security operations center')
  }

  // Adjust severity based on affected systems scope
  if (incident.affected_systems.length > 10 && severity_level !== 'critical') {
    severity_level = 'high'
    response_priority = Math.max(1, response_priority - 1)
  }

  return { incident_type, severity_level, response_priority, containment_actions }
}

function formatIncidentReport(classification: IncidentClassification, incident: IncidentData): string {
  const lines: string[] = []
  lines.push('## Incident Classification Report')
  lines.push('')
  lines.push(`**Title:** ${incident.title}`)
  lines.push(`**Type:** ${classification.incident_type} | **Severity:** ${classification.severity_level.toUpperCase()} | **Priority:** P${classification.response_priority}`)
  lines.push('')
  lines.push(`**Affected Systems:** ${incident.affected_systems.join(', ')}`)
  lines.push(`**Indicators:** ${incident.indicators.join(', ')}`)
  lines.push('')

  lines.push('### Containment Actions')
  for (let i = 0; i < classification.containment_actions.length; i++) {
    lines.push(`${i + 1}. ${classification.containment_actions[i]}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: PHISHING DETECTOR ====================

function detectPhishing(email: EmailData): PhishingResult {
  const redFlags: string[] = []
  let score = 0
  let impersonationType: string | null = null

  const senderDomain = email.sender.split('@').pop()?.toLowerCase() || ''
  const senderLocal = email.sender.split('@')[0]?.toLowerCase() || ''

  // Sender analysis
  if (senderDomain.includes('-secure') || senderDomain.includes('-verify') || senderDomain.includes('-alert')) {
    redFlags.push(`Suspicious sender domain: ${senderDomain}`)
    score += 15
  }
  if (senderDomain.includes('gmail.com') || senderDomain.includes('yahoo.com') || senderDomain.includes('outlook.com')) {
    if (email.subject.includes('security') || email.subject.includes('verify') || email.subject.includes('account')) {
      redFlags.push('Financial/security email from free email provider')
      score += 20
    }
  }

  // Subject analysis
  const subjectLower = email.subject.toLowerCase()
  if (subjectLower.includes('urgent') || subjectLower.includes('immediate action') || subjectLower.includes('suspended')) {
    redFlags.push('Urgency language in subject line')
    score += 12
  }
  if (subjectLower.includes('verify your account') || subjectLower.includes('confirm your identity')) {
    redFlags.push('Credential harvesting phrase detected')
    score += 18
  }

  // Body analysis
  const bodyLower = email.body.toLowerCase()
  if (bodyLower.includes('click here') || bodyLower.includes('click the link') || bodyLower.includes('verify now')) {
    redFlags.push('Suspicious call-to-action in email body')
    score += 15
  }
  if (bodyLower.includes('suspended') || bodyLower.includes('locked') || bodyLower.includes('unusual activity')) {
    redFlags.push('Fear-based language designed to create panic')
    score += 12
  }
  if (bodyLower.includes('bank account') || bodyLower.includes('ssn') || bodyLower.includes('social security')) {
    redFlags.push('Request for sensitive personal information')
    score += 20
  }
  if (bodyLower.includes('wire transfer') || bodyLower.includes('bitcoin') || bodyLower.includes('gift card')) {
    redFlags.push('Financial fraud indicator detected')
    score += 25
  }

  // Link analysis
  for (const link of email.links) {
    const linkLower = link.toLowerCase()
    if (linkLower.includes('bit.ly') || linkLower.includes('tinyurl') || linkLower.includes('t.co')) {
      redFlags.push(`URL shortener detected: ${link}`)
      score += 10
    }
    if (linkLower.includes('login') && !linkLower.includes('https')) {
      redFlags.push(`Unencrypted login link: ${link}`)
      score += 15
    }
    if (/^\d+\.\d+\.\d+\.\d+/.test(linkLower)) {
      redFlags.push(`IP-based URL detected: ${link}`)
      score += 18
    }
    if (linkLower.includes('g00gle') || linkLower.includes('micr0soft') || linkLower.includes('amaz0n') || linkLower.includes('paypa1')) {
      redFlags.push(`Homograph attack detected: ${link}`)
      score += 25
      impersonationType = 'Brand Impersonation (Homograph)'
    }
  }

  // Attachment analysis
  for (const attachment of email.attachments) {
    const attLower = attachment.toLowerCase()
    if (attLower.endsWith('.exe') || attLower.endsWith('.scr') || attLower.endsWith('.bat') || attLower.endsWith('.ps1')) {
      redFlags.push(`Dangerous executable attachment: ${attachment}`)
      score += 25
    }
    if (attLower.endsWith('.docm') || attLower.endsWith('.xlsm') || attLower.endsWith('.pptm')) {
      redFlags.push(`Macro-enabled document: ${attachment}`)
      score += 18
    }
    if (attLower.endsWith('.zip') || attLower.endsWith('.rar') || attLower.endsWith('.7z')) {
      redFlags.push(`Compressed archive (potential malware carrier): ${attachment}`)
      score += 12
    }
  }

  // Impersonation detection
  if (!impersonationType) {
    if (bodyLower.includes('microsoft') || bodyLower.includes('office 365') || bodyLower.includes('azure')) {
      impersonationType = 'Microsoft Impersonation'
    } else if (bodyLower.includes('google') || bodyLower.includes('gmail')) {
      impersonationType = 'Google Impersonation'
    } else if (bodyLower.includes('amazon') || bodyLower.includes('aws')) {
      impersonationType = 'Amazon/AWS Impersonation'
    } else if (bodyLower.includes('paypal') || bodyLower.includes('venmo')) {
      impersonationType = 'Payment Provider Impersonation'
    } else if (bodyLower.includes('hr department') || bodyLower.includes('human resources')) {
      impersonationType = 'Internal HR Impersonation'
    } else if (bodyLower.includes('it department') || bodyLower.includes('help desk')) {
      impersonationType = 'Internal IT Impersonation'
    }
  }

  const phishingScore = Math.min(score, 100)

  let recommended_action = 'Monitor'
  if (phishingScore >= 70) recommended_action = 'QUARANTINE IMMEDIATELY - Block sender and report to security team'
  else if (phishingScore >= 50) recommended_action = 'HIGH RISK - Verify through secondary channel before taking any action'
  else if (phishingScore >= 30) recommended_action = 'SUSPICIOUS - Do not click links; verify sender identity'
  else if (phishingScore >= 15) recommended_action = 'MODERATE - Exercise caution; report if context is unexpected'
  else recommended_action = 'LOW RISK - Normal email indicators present'

  return { phishing_score: phishingScore, red_flags: redFlags, impersonation_type: impersonationType, recommended_action }
}

function formatPhishingReport(result: PhishingResult, email: EmailData): string {
  const lines: string[] = []
  lines.push('## Phishing Detection Analysis')
  lines.push('')
  lines.push(`**From:** ${email.sender} | **Subject:** ${email.subject}`)
  lines.push(`**Phishing Score:** ${result.phishing_score}/100 ${result.phishing_score >= 70 ? '(HIGH RISK)' : result.phishing_score >= 40 ? '(MODERATE RISK)' : '(LOW RISK)'}`)
  lines.push(`**Impersonation Type:** ${result.impersonation_type || 'None detected'}`)
  lines.push('')

  lines.push('### Red Flags Detected')
  if (result.red_flags.length > 0) {
    for (const flag of result.red_flags) {
      lines.push(`- ${flag}`)
    }
  } else {
    lines.push('- No red flags detected')
  }
  lines.push('')

  lines.push(`**Recommended Action:** ${result.recommended_action}`)

  return lines.join('\n')
}

// ==================== TOOL 7: FIREWALL RULE AUDITOR ====================

function auditFirewallRules(rules: FirewallRule[]): FirewallAuditResult {
  const shadowRules: string[] = []
  const redundantRules: string[] = []
  const overlyPermissive: string[] = []
  const violations: string[] = []
  const optimization: string[] = []

  // Detect shadow rules (rules that are never matched due to a preceding catch-all)
  for (let i = 1; i < rules.length; i++) {
    const current = rules[i]
    for (let j = 0; j < i; j++) {
      const preceding = rules[j]
      if (preceding.source === 'any' && preceding.destination === 'any' && preceding.action === 'allow') {
        shadowRules.push(`Rule #${i + 1} (${current.description}) - shadowed by preceding catch-all allow at rule #${j + 1}`)
      }
    }
  }

  // Detect redundant rules (duplicate rules with same parameters)
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      if (rules[i].source === rules[j].source &&
        rules[i].destination === rules[j].destination &&
        String(rules[i].port) === String(rules[j].port) &&
        rules[i].action === rules[j].action) {
        redundantRules.push(`Rules #${i + 1} and #${j + 1} are redundant - identical parameters`)
      }
    }
  }

  // Detect overly permissive rules
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    if (rule.source === 'any' && rule.destination === 'any' && rule.action === 'allow') {
      overlyPermissive.push(`Rule #${i + 1}: ${rule.description} - Allows all traffic from any to any`)
    }
    if (String(rule.port) === 'any' && rule.action === 'allow') {
      overlyPermissive.push(`Rule #${i + 1}: ${rule.description} - Allows all ports (${rule.source} -> ${rule.destination})`)
    }
    if ((rule.destination === 'any' || rule.source === 'any') && String(rule.port) === 'any') {
      overlyPermissive.push(`Rule #${i + 1}: ${rule.description} - Wide triple-any rule`)
    }
  }

  // Compliance violations
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    const port = Number(rule.port)
    if (port === 23 && rule.action === 'allow') {
      violations.push(`Rule #${i + 1}: Telnet (port 23) allowed - violates encryption standards`)
    }
    if (port === 21 && rule.action === 'allow') {
      violations.push(`Rule #${i + 1}: FTP (port 21) allowed - violates secure transfer requirements`)
    }
    if (port === 3389 && rule.source === 'any') {
      violations.push(`Rule #${i + 1}: RDP (port 3389) open to internet - critical PCI-DSS violation`)
    }
    if (port === 445 && rule.source === 'any') {
      violations.push(`Rule #${i + 1}: SMB (port 445) exposed to internet - compliance violation`)
    }
    if (port === 1433 && rule.source === 'any') {
      violations.push(`Rule #${i + 1}: MSSQL (port 1433) exposed - should never be internet-facing`)
    }
  }

  // Optimization recommendations
  const allowCount = rules.filter(r => r.action.toLowerCase() === 'allow').length
  const denyCount = rules.filter(r => r.action.toLowerCase() === 'deny' || r.action.toLowerCase() === 'drop').length

  if (allowCount > denyCount * 2) {
    optimization.push('Consider implementing default-deny strategy - current allow rules significantly exceed deny rules')
  }
  optimization.push('Review and consolidate rules with overlapping port ranges')
  optimization.push('Implement rule hit counting to identify unused rules')
  optimization.push('Move most frequently matched rules to top of rule set for performance')
  optimization.push('Add descriptive comments to all rules for audit trail')

  return { shadow_rules: shadowRules, redundant_rules: redundantRules, overly_permissive: overlyPermissive, violations, optimization }
}

function formatFirewallAuditReport(result: FirewallAuditResult, rules: FirewallRule[]): string {
  const lines: string[] = []
  lines.push('## Firewall Rule Audit Report')
  lines.push('')
  lines.push(`**Total Rules Analyzed:** ${rules.length}`)
  lines.push(`**Shadow Rules:** ${result.shadow_rules.length} | **Redundant:** ${result.redundant_rules.length} | **Overly Permissive:** ${result.overly_permissive.length} | **Violations:** ${result.violations.length}`)
  lines.push('')

  if (result.shadow_rules.length > 0) {
    lines.push('### Shadow Rules')
    for (const sr of result.shadow_rules) {
      lines.push(`- ${sr}`)
    }
    lines.push('')
  }

  if (result.redundant_rules.length > 0) {
    lines.push('### Redundant Rules')
    for (const rr of result.redundant_rules) {
      lines.push(`- ${rr}`)
    }
    lines.push('')
  }

  if (result.overly_permissive.length > 0) {
    lines.push('### Overly Permissive Rules')
    for (const op of result.overly_permissive) {
      lines.push(`- ${op}`)
    }
    lines.push('')
  }

  if (result.violations.length > 0) {
    lines.push('### Compliance Violations')
    for (const v of result.violations) {
      lines.push(`- ${v}`)
    }
    lines.push('')
  }

  lines.push('### Optimization Recommendations')
  for (const opt of result.optimization) {
    lines.push(`- ${opt}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: COMPLIANCE MAPPER ====================

function mapCompliance(controls: ControlItem[], framework: string = 'SOC2'): ComplianceResult {
  const frameworkRequirements: Record<string, { name: string; keywords: string[] }[]> = {
    'SOC2': [
      { name: 'CC6.1 - Logical Access Controls', keywords: ['access', 'authentication', 'mfa', 'login'] },
      { name: 'CC6.6 - Encryption', keywords: ['encryption', 'tls', 'ssl', 'aes', 'encrypt'] },
      { name: 'CC6.8 - Data Transmission', keywords: ['transmission', 'transfer', 'network', 'vpn'] },
      { name: 'CC7.1 - Security Monitoring', keywords: ['monitoring', 'logging', 'siem', 'alert'] },
      { name: 'CC7.2 - Incident Management', keywords: ['incident', 'response', 'breach', 'escalation'] },
      { name: 'CC8.1 - Change Management', keywords: ['change', 'change management', 'approval', 'review'] },
    ],
    'ISO27001': [
      { name: 'A.9 - Access Control', keywords: ['access', 'authentication', 'mfa', 'privilege'] },
      { name: 'A.10 - Cryptography', keywords: ['encryption', 'cryptography', 'key', 'cipher'] },
      { name: 'A.13 - Communications Security', keywords: ['network', 'transmission', 'firewall', 'segmentation'] },
      { name: 'A.16 - Incident Management', keywords: ['incident', 'response', 'recovery', 'breach'] },
      { name: 'A.17 - Business Continuity', keywords: ['continuity', 'backup', 'disaster', 'recovery'] },
    ],
    'PCI-DSS': [
      { name: 'Req 1 - Firewall Configuration', keywords: ['firewall', 'rule', 'network', 'segmentation'] },
      { name: 'Req 2 - Default Passwords', keywords: ['password', 'default', 'credential', 'hardening'] },
      { name: 'Req 3 - Data Protection', keywords: ['encryption', 'tokenization', 'masking', 'storage'] },
      { name: 'Req 4 - Encryption in Transit', keywords: ['encryption', 'tls', 'ssl', 'transmission'] },
      { name: 'Req 7 - Access Control', keywords: ['access', 'role', 'least privilege', 'authorization'] },
      { name: 'Req 8 - Authentication', keywords: ['mfa', 'authentication', 'password', 'identity'] },
      { name: 'Req 10 - Logging', keywords: ['logging', 'audit', 'monitoring', 'trail'] },
      { name: 'Req 11 - Security Testing', keywords: ['scan', 'test', 'vulnerability', 'penetration'] },
    ],
    'HIPAA': [
      { name: '164.312(a) - Access Control', keywords: ['access', 'authentication', 'mfa', 'authorization'] },
      { name: '164.312(c) - Integrity', keywords: ['integrity', 'validation', 'checksum', 'tamper'] },
      { name: '164.312(d) - Authentication', keywords: ['authentication', 'mfa', 'password', 'identity'] },
      { name: '164.312(e) - Transmission Security', keywords: ['encryption', 'transmission', 'tls', 'secure'] },
      { name: '164.308(a) - Risk Analysis', keywords: ['risk', 'assessment', 'analysis', 'threat'] },
    ],
  }

  const requirements = frameworkRequirements[framework] ?? frameworkRequirements['SOC2']
  const controlMapping: Record<string, string[]> = {}
  const coverageGaps: string[] = []
  const evidenceRequirements: string[] = []
  const remediationSteps: string[] = []

  for (const req of requirements) {
    const matchingControls: string[] = []
    for (const control of controls) {
      const controlText = `${control.name} ${control.description}`.toLowerCase()
      if (req.keywords.some(kw => controlText.includes(kw.toLowerCase()))) {
        matchingControls.push(control.id)
      }
    }
    controlMapping[req.name] = matchingControls

    if (matchingControls.length === 0) {
      coverageGaps.push(`${req.name}: No implemented controls mapped to this requirement`)
      remediationSteps.push(`Implement controls addressing: ${req.keywords.join(', ')} for ${req.name}`)
    } else {
      const partialControls = controls.filter(c => matchingControls.includes(c.id) && c.status !== 'implemented')
      if (partialControls.length > 0) {
        coverageGaps.push(`${req.name}: Partially covered - ${partialControls.length} control(s) at partial implementation`)
        remediationSteps.push(`Complete implementation of: ${partialControls.map(c => c.name).join(', ')}`)
      }
    }

    evidenceRequirements.push(`${req.name}: Provide policy documents, configuration screenshots, and audit logs`)
  }

  return { coverage_gaps: coverageGaps, control_mapping: controlMapping, evidence_requirements: evidenceRequirements, remediation_steps: remediationSteps }
}

function formatComplianceReport(result: ComplianceResult, framework: string): string {
  const lines: string[] = []
  lines.push(`## Compliance Mapping: ${framework}`)
  lines.push('')
  lines.push(`**Coverage Gaps:** ${result.coverage_gaps.length} | **Mapped Controls:** ${Object.values(result.control_mapping).filter(v => v.length > 0).length}/${Object.keys(result.control_mapping).length}`)
  lines.push('')

  lines.push('### Control Mapping')
  for (const [req, controls] of Object.entries(result.control_mapping)) {
    const status = controls.length > 0 ? `Mapped (${controls.length})` : 'GAP - Not covered'
    lines.push(`- **${req}:** ${status} ${controls.length > 0 ? `[${controls.join(', ')}]` : ''}`)
  }
  lines.push('')

  if (result.coverage_gaps.length > 0) {
    lines.push('### Coverage Gaps')
    for (const gap of result.coverage_gaps) {
      lines.push(`- ${gap}`)
    }
    lines.push('')
  }

  lines.push('### Evidence Requirements')
  for (const ev of result.evidence_requirements) {
    lines.push(`- ${ev}`)
  }
  lines.push('')

  lines.push('### Remediation Steps')
  for (const step of result.remediation_steps) {
    lines.push(`- ${step}`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Threat Intelligence Analyzer
  tools.register(defineTool({
    name: 'threat_intel_analyzer',
    description: 'Analyze threat indicators (IOCs) for actor attribution, campaign linking, MITRE ATT&CK mapping, and severity assessment. Accepts JSON array of indicators with type, value, source, and confidence fields.',
    parameters: {
      indicators: { type: 'string', required: true, description: 'JSON array of indicator objects with fields: type (ip/domain/hash/url/email), value, source, confidence (0-1)' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { indicators: string }) {
      const data: Indicator[] = JSON.parse(args.indicators)
      const result = analyzeThreatIndicators(data)
      return formatThreatIntelReport(result)
    }
  }))

  // Tool 2: Vulnerability Scanner
  tools.register(defineTool({
    name: 'vulnerability_scanner',
    description: 'Scan target system information (OS, services, versions, ports) against known CVE database. Returns vulnerability matches with CVSS scores, exploitability levels, and patch availability.',
    parameters: {
      target_info: { type: 'string', required: true, description: 'JSON object with fields: os, services (array), versions (array), ports (array of numbers)' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { target_info: string }) {
      const target: TargetInfo = JSON.parse(args.target_info)
      const matches = scanVulnerabilities(target)
      return formatVulnerabilityReport(matches, target)
    }
  }))

  // Tool 3: Attack Surface Mapper
  tools.register(defineTool({
    name: 'attack_surface_mapper',
    description: 'Map attack surface from asset inventory. Identifies exposed entry points, shadow IT findings, and generates risk prioritization. Accepts JSON array of assets with type, domain, ip, and technology.',
    parameters: {
      assets: { type: 'string', required: true, description: 'JSON array of asset objects with fields: type, domain, ip, technology' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { assets: string }) {
      const data: Asset[] = JSON.parse(args.assets)
      const result = mapAttackSurface(data)
      return formatAttackSurfaceReport(result)
    }
  }))

  // Tool 4: Security Posture Scorer
  tools.register(defineTool({
    name: 'security_posture_scorer',
    description: 'Score overall security posture based on implemented controls. Evaluates firewall, EDR, MFA, patching, backup, and encryption maturity. Returns overall score, maturity level, gaps, and improvement roadmap.',
    parameters: {
      security_controls: { type: 'string', required: true, description: 'JSON object with fields: firewall (none/basic/advanced/next-gen), edr (none/basic/advanced/managed), mfa (none/sms/totp/hardware), patching (none/manual/scheduled/automated), backup (none/local/cloud/immutable), encryption (none/at-rest/in-transit/both)' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { security_controls: string }) {
      const controls: SecurityControls = JSON.parse(args.security_controls)
      const result = scoreSecurityPosture(controls)
      return formatPostureReport(result)
    }
  }))

  // Tool 5: Incident Classifier
  tools.register(defineTool({
    name: 'incident_classifier',
    description: 'Classify security incidents by type (ransomware, credential compromise, phishing, DoS, data breach, malware, insider threat). Returns severity level, response priority (P1-P5), and recommended containment actions.',
    parameters: {
      incident_data: { type: 'string', required: true, description: 'JSON object with fields: title, description, affected_systems (array of strings), indicators (array of strings)' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { incident_data: string }) {
      const incident: IncidentData = JSON.parse(args.incident_data)
      const classification = classifyIncident(incident)
      return formatIncidentReport(classification, incident)
    }
  }))

  // Tool 6: Phishing Detector
  tools.register(defineTool({
    name: 'phishing_detector',
    description: 'Analyze email data for phishing indicators. Detects suspicious sender patterns, urgency language, malicious links, dangerous attachments, and brand impersonation. Returns phishing score, red flags, impersonation type, and recommended action.',
    parameters: {
      email_data: { type: 'string', required: true, description: 'JSON object with fields: subject, sender, body, links (array of URLs), attachments (array of filenames)' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { email_data: string }) {
      const email: EmailData = JSON.parse(args.email_data)
      const result = detectPhishing(email)
      return formatPhishingReport(result, email)
    }
  }))

  // Tool 7: Firewall Rule Auditor
  tools.register(defineTool({
    name: 'firewall_rule_auditor',
    description: 'Audit firewall rules for shadow rules, redundant rules, overly permissive rules, compliance violations (Telnet, FTP, RDP exposure), and optimization recommendations. Accepts JSON array of rule objects.',
    parameters: {
      rules: { type: 'string', required: true, description: 'JSON array of firewall rule objects with fields: source, destination, port (number or "any"), action (allow/deny/drop), description' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { rules: string }) {
      const data: FirewallRule[] = JSON.parse(args.rules)
      const result = auditFirewallRules(data)
      return formatFirewallAuditReport(result, data)
    }
  }))

  // Tool 8: Compliance Mapper
  tools.register(defineTool({
    name: 'compliance_mapper',
    description: 'Map implemented controls to compliance frameworks (SOC2, ISO27001, PCI-DSS, HIPAA). Identifies coverage gaps, generates control mapping, lists evidence requirements, and provides remediation steps.',
    parameters: {
      controls: { type: 'string', required: true, description: 'JSON array of control objects with fields: id, name, description, status (implemented/partial/not_implemented)' },
      framework: { type: 'string', description: 'Compliance framework to map against: "SOC2", "ISO27001", "PCI-DSS", or "HIPAA" (default: "SOC2")' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { controls: string; framework?: string }) {
      const data: ControlItem[] = JSON.parse(args.controls)
      const framework = args.framework ?? 'SOC2'
      const result = mapCompliance(data, framework)
      return formatComplianceReport(result, framework)
    }
  }))

  console.log(`[dsh-tool-cybersec] Loaded v${VERSION} - Cybersecurity Threat Intelligence with 8 tools`)
  console.log('  Tools: threat_intel_analyzer, vulnerability_scanner, attack_surface_mapper, security_posture_scorer, incident_classifier, phishing_detector, firewall_rule_auditor, compliance_mapper')
}
