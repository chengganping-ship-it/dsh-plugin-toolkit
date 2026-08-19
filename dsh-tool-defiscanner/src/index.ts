/**
 * DSH DeFi Protocol Security Scanner Plugin v0.1.0
 *
 * Comprehensive DeFi security analysis toolkit for DeepSeek Harness Agent.
 * Designed for security researchers, auditors, DeFi analysts, and protocol operators.
 *
 * Features (v0.1.0):
 * - Contract Vulnerability Scanner (reentrancy, overflow, access control, timestamp dependence, gas optimization)
 * - Flash Loan Attack Detector (price manipulation, oracle manipulation, arbitrage exploitation)
 * - Oracle Risk Assessor (manipulation risk scoring, source reliability, heartbeat analysis)
 * - Governance Attack Analyzer (flash loan governance, quorum manipulation, timelock bypass)
 * - Operational Security Checker (multisig setup, admin key type, bridge validators, deployer keys — 2026 CRITICAL)
 * - TVL Health Monitor (anomaly detection, concentration risk, historical deviation)
 * - Tokenomics Audit (supply sustainability, distribution manipulation, inflation risks)
 * - Composability Risk Scorer (systemic risk, cascade failure, integration depth)
 *
 * 2026 Context: DeFi hacks shifted from pure code exploits to OPERATIONAL security.
 * Major April 2026: Drift Protocol $285M (admin key), KelpDAO $292M (bridge validator),
 * Wasabi $4.5M (stolen deployer key). This scanner detects BOTH code vulns AND operational risks.
 *
 * @module dsh-tool-defiscanner
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-defiscanner'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface VulnerabilityFinding {
  category: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  location?: string
  recommendation: string
  confidence: number
}

interface ContractVulnReport {
  summary: {
    totalFindings: number
    critical: number
    high: number
    medium: number
    low: number
    info: number
    riskScore: number
  }
  findings: VulnerabilityFinding[]
  recommendations: string[]
}

interface FlashLoanVector {
  attackType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedMechanism: string
  exploitationSteps: string[]
  mitigation: string
  likelihood: number
}

interface FlashLoanReport {
  vectors: FlashLoanVector[]
  summary: {
    totalVectors: number
    criticalCount: number
    highCount: number
    overallRisk: 'low' | 'medium' | 'high' | 'critical'
  }
  recommendedMitigations: string[]
}

interface OracleSource {
  name: string
  type: string
  weight: number
  reliability: number
}

interface OracleConfig {
  oracle_type: string
  sources: OracleSource[]
  heartbeat: number
  deviation_threshold: number
  failover_enabled: boolean
  historical_manipulation?: boolean
}

interface OracleRiskReport {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  manipulationVectors: string[]
  sourceReliability: number
  freshness: number
  decentralization: number
  findings: string[]
  recommendations: string[]
}

interface GovernanceConfig {
  voting_model: string
  quorum: number
  timelock: number
  quorum_type?: string
  vote_delegation?: boolean
  proposal_threshold?: number
  voting_period?: number
  flash_loan_protection?: boolean
}

interface GovernanceAttackReport {
  flashLoanVulnerability: {
    vulnerable: boolean
    riskScore: number
    description: string
  }
  quorumManipulation: {
    possible: boolean
    riskScore: number
    description: string
  }
  timelockBypass: {
    possible: boolean
    riskScore: number
    description: string
  }
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  attackScenarios: string[]
  recommendations: string[]
}

interface OperationalConfig {
  multisig_setup: {
    enabled: boolean
    threshold: number
    totalSigners: number
    signers: string[]
  }
  admin_key_type: string
  bridge_validators: {
    count: number
    threshold: number
    identities: string[]
    geographicDistribution?: string
  }
  deployer_key_security: {
    isMultisig: boolean
    isHardwareWallet: boolean
    keyRotation: boolean
    emergencyRecovery: boolean
  }
  timelock?: {
    enabled: boolean
    duration: number
  }
}

interface OperationalRiskReport {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  criticalFindings: string[]
  warnings: string[]
  adminKeyRisk: number
  bridgeValidatorRisk: number
  deployerKeyRisk: number
  multisigRisk: number
  risk2026Context: string[]
  recommendations: string[]
}

interface TVLData {
  current: number
  historical: Array<{ timestamp: number; value: number }>
  concentration: {
    topProtocols: Array<{ name: string; tvl: number; share: number }>
    chainDistribution: Array<{ chain: string; tvl: number; share: number }>
  }
  inflows?: number
  outflows?: number
}

interface TVLHealthReport {
  status: 'healthy' | 'warning' | 'critical'
  anomalyFlags: string[]
  tvlChange24h: number
  tvlChange7d: number
  volatilityIndex: number
  concentrationRisk: {
    hhi: number
    top3Share: number
    level: 'low' | 'medium' | 'high'
  }
  outflowRisk: 'low' | 'medium' | 'high'
  historicalDeviation: number
  findings: string[]
  recommendations: string[]
}

interface Tokenomics {
  totalSupply: number
  circulatingSupply: number
  distribution: Array<{ holder: string; percentage: number; category: string }>
  inflation: {
    current: number
    schedule: string
    nextChange?: number
  }
  utility: {
    governance: boolean
    feeSharing: boolean
    staking: boolean
    burnMechanism: boolean
  }
  vesting?: Array<{ category: string; percentage: number; cliff: number; duration: number }>
  maxSupply?: number
}

interface TokenomicsReport {
  sustainabilityScore: number
  manipulationRisk: 'low' | 'medium' | 'high' | 'critical'
  concentrationRisk: number
  inflationRisk: 'low' | 'medium' | 'high'
  utilityScore: number
  findings: string[]
  redFlags: string[]
  recommendations: string[]
}

interface Integration {
  protocol: string
  type: string
  tvlDependent: number
  criticalPath: boolean
  dataFlow: string
}

interface ComposabilityReport {
  systemicRiskScore: number
  cascadeRisk: 'low' | 'medium' | 'high' | 'critical'
  integrationDepth: number
  criticalPaths: string[]
  cascadeScenarios: Array<{
    trigger: string
    cascadePath: string[]
    estimatedLoss: number
    probability: number
  }>
  findings: string[]
  recommendations: string[]
}

// ==================== TOOL 1: CONTRACT VULNERABILITY SCANNER ====================

function scanContractVulnerabilities(
  contractCode: string,
  language: string = 'solidity'
): ContractVulnReport {
  const findings: VulnerabilityFinding[] = []
  const code = contractCode.toLowerCase()
  const lines = contractCode.split('\n')

  // Reentrancy detection
  const hasExternalCall = code.includes('.call{') || code.includes('.call(') || code.includes('.transfer(') || code.includes('.send(')
  const hasStateChange = code.includes('balance') || code.includes('totalSupply') || code.includes('require')
  const hasReentrancyGuard = code.includes('nonreentrant') || code.includes('reentrancyguard') || code.includes('lock')
  if (hasExternalCall && hasStateChange && !hasReentrancyGuard) {
    findings.push({
      category: 'Reentrancy',
      severity: 'critical',
      title: 'Potential Reentrancy Vulnerability',
      description: 'External calls are made before state changes without a reentrancy guard. This allows attackers to recursively call back into the function before state is updated.',
      recommendation: 'Use the Checks-Effects-Interactions pattern. Add a nonReentrant modifier (e.g., OpenZeppelin ReentrancyGuard). Move all state changes before external calls.',
      confidence: 0.85
    })
  } else if (hasExternalCall && hasReentrancyGuard) {
    findings.push({
      category: 'Reentrancy',
      severity: 'info',
      title: 'Reentrancy Guard Present',
      description: 'Reentrancy protection detected. Verify it covers all external-call-bearing functions.',
      recommendation: 'Audit that ALL functions with external calls have the nonReentrant modifier applied.',
      confidence: 0.9
    })
  }

  // Integer overflow/underflow (pre-Solidity 0.8.0)
  const usesSafeMath = code.includes('safemath') || code.includes('safeMath')
  const solidityVersionPragma = contractCode.match(/pragma solidity [\^~]?(\d+\.\d+)/)
  const versionNum = solidityVersionPragma ? parseFloat(solidityVersionPragma[1]) : 0
  const hasArithmetic = code.includes('+') || code.includes('-') || code.includes('*')
  if (hasArithmetic && !usesSafeMath && versionNum < 0.8) {
    findings.push({
      category: 'Integer Overflow/Underflow',
      severity: 'high',
      title: 'Potential Integer Overflow/Underflow',
      description: `Solidity ${solidityVersionPragma ? solidityVersionPragma[1] : '<0.8.0'} detected without SafeMath. Arithmetic operations may silently overflow/underflow.`,
      recommendation: 'Upgrade to Solidity >=0.8.0 (built-in overflow checks) or import OpenZeppelin SafeMath library.',
      confidence: 0.8
    })
  }

  // Access control
  const hasOwner = code.includes('owner') || code.includes('onlyowner')
  const hasAccessControl = code.includes('accesscontrol') || code.includes('onlyrole') || code.includes('authorization')
  const hasMint = code.includes('mint') || code.includes('_mint')
  const hasBurn = code.includes('burn') || code.includes('_burn')
  const hasUpgrade = code.includes('upgrade') || code.includes('delegatecall')
  if ((hasMint || hasBurn || hasUpgrade) && !hasOwner && !hasAccessControl) {
    findings.push({
      category: 'Access Control',
      severity: 'critical',
      title: 'Missing Access Control on Privileged Functions',
      description: 'Functions like mint, burn, or upgrade are callable by anyone. This allows unauthorized token minting or contract replacement.',
      recommendation: 'Add onlyOwner or role-based access control (OpenZeppelin AccessControl) to all privileged functions.',
      confidence: 0.9
    })
  } else if (hasOwner && !hasAccessControl) {
    findings.push({
      category: 'Access Control',
      severity: 'medium',
      title: 'Single-Owner Pattern Detected',
      description: 'Only a single owner address controls privileged functions. If the key is compromised, the entire protocol is at risk.',
      recommendation: 'Consider migrating to a multi-signature wallet or DAO governance for privileged operations.',
      confidence: 0.75
    })
  }

  // Timestamp dependence
  const hasTimestamp = code.includes('block.timestamp') || code.includes('now')
  if (hasTimestamp) {
    const usesForRandomness = code.includes('random') || code.includes('seed')
    const usesForCritical = code.includes('deadline') || code.includes('lock') || code.includes('release')
    if (usesForRandomness) {
      findings.push({
        category: 'Timestamp Dependence',
        severity: 'high',
        title: 'Block Timestamp Used for Randomness',
        description: 'block.timestamp or now is used to generate randomness. Miners/validators can manipulate timestamp by a few seconds.',
        recommendation: 'Use a verifiable random function (VRF) like Chainlink VRF instead of block.timestamp for randomness.',
        confidence: 0.85
      })
    } else if (usesForCritical) {
      findings.push({
        category: 'Timestamp Dependence',
        severity: 'low',
        title: 'Timestamp Used for Time Locks',
        description: 'block.timestamp is used for deadline or lock checks. Minor manipulation possible but limited to ~15s by protocol.',
        recommendation: 'Acceptable for coarse-grained timing. Avoid using timestamp for anything requiring sub-minute precision.',
        confidence: 0.6
      })
    }
  }

  // Gas optimization / unbounded loops
  const hasUnboundedLoop = (code.includes('for (') && code.includes('.length')) &&
    !code.includes('pagination') && !code.includes('limit')
  if (hasUnboundedLoop) {
    findings.push({
      category: 'Gas Optimization',
      severity: 'medium',
      title: 'Potentially Unbounded Loop',
      description: 'A loop iterates over an array with dynamic length. If the array grows too large, the function may exceed the gas limit and revert.',
      recommendation: 'Implement pagination or a pull-pattern for batch operations. Set maximum loop bounds.',
      confidence: 0.7
    })
  }

  // Unchecked return values
  const hasUncheckedCall = (code.includes('.call(') || code.includes('.send(')) &&
    !code.includes('require(') && !code.includes('success')
  if (hasUncheckedCall) {
    findings.push({
      category: 'Error Handling',
      severity: 'high',
      title: 'Unchecked External Call Return Value',
      description: 'External call return value is not checked. Failed calls may silently succeed, causing state corruption.',
      recommendation: 'Check the return value of all external calls. Use require(success, "Call failed") pattern.',
      confidence: 0.8
    })
  }

  // Front-running / sandwich attack vulnerability
  const hasSlippage = code.includes('slippage') || code.includes('amountoutmin') || code.includes('amountinmax')
  const hasSwap = code.includes('swap') || code.includes('exchange')
  if (hasSwap && !hasSlippage) {
    findings.push({
      category: 'MEV / Front-running',
      severity: 'high',
      title: 'No Slippage Protection on Swaps',
      description: 'Swap functions lack minimum output amount protection. Transactions are vulnerable to sandwich attacks and MEV extraction.',
      recommendation: 'Require amountOutMin parameter on all swap functions. Use deadline parameter to prevent stale transactions.',
      confidence: 0.8
    })
  }

  // Calculate risk score
  const severityWeights = { info: 0, low: 1, medium: 3, high: 5, critical: 10 }
  const totalWeight = findings.reduce((sum, f) => sum + severityWeights[f.severity], 0)
  const riskScore = Math.min(100, totalWeight * 2)

  const summary = {
    totalFindings: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
    riskScore
  }

  const recommendations: string[] = []
  if (summary.critical > 0) recommendations.push('CRITICAL: Address all critical findings BEFORE mainnet deployment.')
  if (summary.high > 0) recommendations.push('HIGH: Resolve high-severity issues in next audit cycle.')
  findings.filter(f => f.severity === 'critical' || f.severity === 'high').forEach(f => {
    recommendations.push(`[${f.severity.toUpperCase()}] ${f.title}: ${f.recommendation}`)
  })
  recommendations.push('Commission a professional third-party audit (Trail of Bits, OpenZeppelin, or Spearbit) before handling significant TVL.')

  return { summary, findings, recommendations }
}

function formatContractVulnReport(report: ContractVulnReport): string {
  const lines: string[] = []
  lines.push('## Contract Vulnerability Scan Report')
  lines.push('')
  lines.push(`**Risk Score:** ${report.summary.riskScore}/100 | **Language:** Solidity`)
  lines.push(`| Critical | High | Medium | Low | Info | Total |`)
  lines.push(`|----------|------|--------|-----|------|-------|`)
  lines.push(`| ${report.summary.critical} | ${report.summary.high} | ${report.summary.medium} | ${report.summary.low} | ${report.summary.info} | ${report.summary.totalFindings} |`)
  lines.push('')

  if (report.findings.length > 0) {
    lines.push('### Findings')
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    const sorted = [...report.findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    for (const f of sorted) {
      lines.push(`**[${f.severity.toUpperCase()}] ${f.category} — ${f.title}**`)
      lines.push(f.description)
      lines.push(`Fix: ${f.recommendation}`)
      lines.push(`Confidence: ${(f.confidence * 100).toFixed(0)}%`)
      lines.push('')
    }
  }

  if (report.recommendations.length > 0) {
    lines.push('### Recommendations')
    for (const r of report.recommendations) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: FLASH LOAN ATTACK DETECTOR ====================

function detectFlashLoanAttacks(protocolMechanisms: string[]): FlashLoanReport {
  const vectors: FlashLoanVector[] = []

  for (const mechanism of protocolMechanisms) {
    const m = mechanism.toLowerCase()

    // Price manipulation via AMM
    if ((m.includes('amm') || m.includes('dex') || m.includes('swap')) &&
        (m.includes('spot price') || m.includes('instant price') || m.includes('no twap'))) {
      vectors.push({
        attackType: 'Price Manipulation via AMM',
        severity: 'critical',
        description: 'Protocol relies on spot price from AMM for critical operations (e.g., collateral valuation). A flash loan can drain one side of the pool to distort the price 1000x+, then exploit the manipulated price for profit.',
        affectedMechanism: mechanism,
        exploitationSteps: [
          '1. Borrow massive capital via flash loan',
          '2. Swap large amount on AMM to distort price',
          '3. Exploit protocol using manipulated price (e.g., borrow more than entitled)',
          '4. Repay flash loan, keep profit'
        ],
        mitigation: 'Use TWAP (Time-Weighted Average Price) with sufficient window (e.g., 30min). Implement price deviation checks. Use Chainlink oracles instead of spot prices.',
        likelihood: 0.85
      })
    }

    // Oracle manipulation
    if ((m.includes('oracle') || m.includes('price feed')) &&
        (m.includes('single source') || m.includes('uniswap'))) {
      vectors.push({
        attackType: 'Oracle Manipulation',
        severity: 'critical',
        description: 'Price oracle relies on a single source or manipulable source. Flash loan attacker can corrupt the oracle reading to liquidate healthy positions or mint excess tokens.',
        affectedMechanism: mechanism,
        exploitationSteps: [
          '1. Identify single-source oracle dependency',
          '2. Use flash loan to manipulate the source',
          '3. Protocol reads corrupted price',
          '4. Attacker profits from artificial price discrepancy'
        ],
        mitigation: 'Use decentralized oracle networks (Chainlink, Pyth). Implement multi-source aggregation with outlier detection. Add price staleness checks.',
        likelihood: 0.8
      })
    }

    // Arbitrage exploitation
    if (m.includes('arbitrage') || m.includes('liquidation') || m.includes('settlement')) {
      vectors.push({
        attackType: 'Arbitrage / Liquidation Exploitation',
        severity: 'high',
        description: 'Flash loans enable risk-free arbitrage at scale, squeezing protocol revenue. Liquidation bonuses can be extracted without capital risk.',
        affectedMechanism: mechanism,
        exploitationSteps: [
          '1. Monitor for profitable liquidation opportunities',
          '2. Execute flash loan to cover liquidation amount',
          '3. Liquidate position, collect bonus',
          '4. Repay flash loan, keep bonus as profit'
        ],
        mitigation: 'Reduce liquidation bonuses to uneconomic levels after accounting for flash loan costs. Implement MEV protection (e.g., Flashbots). Use internal settlement buffers.',
        likelihood: 0.7
      })
    }

    // Governance flash loan attack
    if (m.includes('governance') || m.includes('voting') || m.includes('proposal')) {
      vectors.push({
        attackType: 'Flash Loan Governance Attack',
        severity: 'critical',
        description: 'Governance power is proportional to token balance. Attacker can flash loan a massive amount, vote on a malicious proposal, then return the tokens — all in one transaction. This bypasses the "skin in the game" assumption.',
        affectedMechanism: mechanism,
        exploitationSteps: [
          '1. Draft a malicious proposal (e.g., drain treasury)',
          '2. Flash loan massive governance tokens',
          '3. Vote YES with borrowed tokens',
          '4. Execute proposal immediately (if no timelock)',
          '5. Return flash loan tokens'
        ],
        mitigation: 'Implement snapshot-based voting (vote at block before proposal). Add governance timelock (min 48h). Require delegation, not just balance, for voting power. Use quadratic voting.',
        likelihood: 0.75
      })
    }

    // Re-entrancy via flash loan callback
    if (m.includes('flash loan') || m.includes('callback') || m.includes('onreceive')) {
      vectors.push({
        attackType: 'Flash Loan Callback Re-entrancy',
        severity: 'high',
        description: 'Flash loan callback functions can be exploited to re-enter the protocol before loan repayment is verified. This allows borrowing multiple loans simultaneously.',
        affectedMechanism: mechanism,
        exploitationSteps: [
          '1. Implement malicious receiver contract',
          '2. Call flash loan with malicious callback',
          '3. In callback, re-enter and call flash loan again',
          '4. Stack multiple loans before first repayment check'
        ],
        mitigation: 'Add reentrancy guards to all callback functions. Verify loan repayment at the end of EACH callback. Use OpenZeppelin FlashLoanReceiver base contract.',
        likelihood: 0.65
      })
    }
  }

  // Remove duplicates by attack type
  const unique = new Map<string, FlashLoanVector>()
  for (const v of vectors) {
    if (!unique.has(v.attackType) || v.likelihood > unique.get(v.attackType)!.likelihood) {
      unique.set(v.attackType, v)
    }
  }
  const deduped = Array.from(unique.values())

  const criticalCount = deduped.filter(v => v.severity === 'critical').length
  const highCount = deduped.filter(v => v.severity === 'high').length

  let overallRisk: FlashLoanReport['summary']['overallRisk'] = 'low'
  if (criticalCount >= 2) overallRisk = 'critical'
  else if (criticalCount >= 1) overallRisk = 'high'
  else if (highCount >= 2) overallRisk = 'high'
  else if (highCount >= 1) overallRisk = 'medium'

  const recommendedMitigations = [
    'Use TWAP oracles instead of spot prices for all critical operations',
    'Implement flash loan-resistant oracle design (Chainlink Price Feed)',
    'Add reentrancy guards to all external callback functions',
    'Require snapshot-based voting to prevent flash loan governance attacks',
    'Consider implementing MEV protection (Flashbots Protect, private mempool)',
    'Set maximum single-transaction value limits as circuit breakers'
  ]

  return {
    vectors: deduped,
    summary: { totalVectors: deduped.length, criticalCount, highCount, overallRisk },
    recommendedMitigations
  }
}

function formatFlashLoanReport(report: FlashLoanReport): string {
  const lines: string[] = []
  lines.push('## Flash Loan Attack Detection Report')
  lines.push('')
  lines.push(`**Overall Risk:** ${report.summary.overallRisk.toUpperCase()} | **Vectors Found:** ${report.summary.totalVectors}`)
  lines.push(`- Critical: ${report.summary.criticalCount} | High: ${report.summary.highCount}`)
  lines.push('')

  if (report.vectors.length > 0) {
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const sorted = [...report.vectors].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity])
    for (const v of sorted) {
      lines.push(`**[${v.severity.toUpperCase()}] ${v.attackType}** (Likelihood: ${(v.likelihood * 100).toFixed(0)}%)`)
      lines.push(`Mechanism: ${v.affectedMechanism}`)
      lines.push(v.description)
      lines.push('Steps:')
      for (const step of v.exploitationSteps) lines.push(`  ${step}`)
      lines.push(`Mitigation: ${v.mitigation}`)
      lines.push('')
    }
  }

  lines.push('### Recommended Mitigations')
  for (const m of report.recommendedMitigations) lines.push(`- ${m}`)

  return lines.join('\n')
}

// ==================== TOOL 3: ORACLE RISK ASSESSOR ====================

function assessOracleRisk(config: OracleConfig): OracleRiskReport {
  const findings: string[] = []
  const recommendations: string[] = []
  const manipulationVectors: string[] = []

  // Base risk from oracle type
  let riskScore = 0
  const oracleType = config.oracle_type.toLowerCase()
  if (oracleType.includes('spot') || oracleType.includes('amm')) {
    riskScore += 40
    manipulationVectors.push('Direct AMM pool manipulation via flash loan')
    findings.push('AMM spot price oracles are inherently manipulable with sufficient capital.')
  } else if (oracleType.includes('single')) {
    riskScore += 35
    manipulationVectors.push('Single-source data corruption')
    findings.push('Single-source oracle creates a single point of failure.')
  } else if (oracleType.includes('chainlink') || oracleType.includes('pyth')) {
    riskScore += 10
    findings.push('Decentralized oracle network detected — baseline risk is lower.')
  } else if (oracleType.includes('twap')) {
    riskScore += 20
    manipulationVectors.push('Sustained TWAP manipulation over multiple blocks')
    findings.push('TWAP provides protection but can be manipulated if sustained long enough.')
  } else {
    riskScore += 25
    findings.push(`Unknown oracle type "${config.oracle_type}" — cannot assess baseline risk.`)
  }

  // Source reliability
  const avgReliability = config.sources.length > 0
    ? config.sources.reduce((s, src) => s + src.reliability, 0) / config.sources.length
    : 0.5
  const sourceReliability = avgReliability
  riskScore += (1 - avgReliability) * 20

  if (config.sources.length < 2) {
    riskScore += 15
    findings.push('Only one oracle source — no redundancy if source fails or is manipulated.')
    recommendations.push('Add at least 2-3 independent oracle sources for redundancy.')
  } else if (config.sources.length >= 3) {
    riskScore -= 5
    findings.push(`Multiple sources (${config.sources.length}) provide good redundancy.`)
  }

  // Heartbeat analysis
  const freshness = Math.max(0, 100 - (config.heartbeat / 60))
  if (config.heartbeat > 3600) {
    riskScore += 15
    findings.push(`Heartbeat of ${config.heartbeat}s is too slow — prices can be stale for over 1 hour.`)
    manipulationVectors.push('Exploit stale prices during volatile market conditions')
    recommendations.push('Reduce heartbeat to under 60 seconds for volatile assets.')
  } else if (config.heartbeat > 600) {
    riskScore += 8
    findings.push(`Heartbeat of ${config.heartbeat}s may be too slow for highly volatile markets.`)
    recommendations.push('Consider reducing heartbeat to under 60 seconds.')
  } else {
    riskScore -= 5
    findings.push(`Heartbeat of ${config.heartbeat}s provides reasonable freshness.`)
  }

  // Deviation threshold
  if (config.deviation_threshold > 10) {
    riskScore += 10
    findings.push(`Deviation threshold of ${config.deviation_threshold}% is too permissive — large price swings are accepted without pause.`)
    recommendations.push('Reduce deviation threshold to 3-5% for early warning.')
  } else if (config.deviation_threshold < 1) {
    riskScore += 5
    findings.push(`Deviation threshold of ${config.deviation_threshold}% is too strict — may cause unnecessary pauses during normal volatility.`)
    recommendations.push('Consider 2-3% deviation threshold as a balanced setting.')
  } else {
    riskScore -= 3
    findings.push(`Deviation threshold of ${config.deviation_threshold}% is within reasonable range.`)
  }

  // Failover
  if (!config.failover_enabled) {
    riskScore += 10
    findings.push('No failover oracle configured — if primary oracle fails, protocol has no price feed.')
    recommendations.push('Configure a secondary failover oracle (e.g., Chainlink as backup).')
  } else {
    riskScore -= 5
    findings.push('Failover oracle is enabled — good resilience.')
  }

  // Historical manipulation
  if (config.historical_manipulation) {
    riskScore += 15
    findings.push('This oracle type has historical precedent for manipulation.')
    manipulationVectors.push('Repeat of historical manipulation attack')
  }

  // Decentralization score
  const decentralization = Math.min(100, config.sources.length * 25 + (config.failover_enabled ? 25 : 0))

  riskScore = Math.max(0, Math.min(100, riskScore))

  let riskLevel: OracleRiskReport['riskLevel'] = 'low'
  if (riskScore >= 70) riskLevel = 'critical'
  else if (riskScore >= 50) riskLevel = 'high'
  else if (riskScore >= 30) riskLevel = 'medium'

  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring oracle performance and maintain multi-source setup.')
  }

  return {
    riskScore,
    riskLevel,
    manipulationVectors,
    sourceReliability,
    freshness,
    decentralization,
    findings,
    recommendations
  }
}

function formatOracleRiskReport(report: OracleRiskReport): string {
  const lines: string[] = []
  lines.push('## Oracle Risk Assessment')
  lines.push('')
  lines.push(`**Risk Score:** ${report.riskScore.toFixed(0)}/100 | **Level:** ${report.riskLevel.toUpperCase()}`)
  lines.push(`- Source Reliability: ${(report.sourceReliability * 100).toFixed(0)}%`)
  lines.push(`- Price Freshness: ${report.freshness.toFixed(0)}%`)
  lines.push(`- Decentralization: ${report.decentralization.toFixed(0)}%`)
  lines.push('')

  if (report.manipulationVectors.length > 0) {
    lines.push('### Manipulation Vectors')
    for (const v of report.manipulationVectors) lines.push(`- ${v}`)
    lines.push('')
  }

  lines.push('### Findings')
  for (const f of report.findings) lines.push(`- ${f}`)
  lines.push('')

  lines.push('### Recommendations')
  for (const r of report.recommendations) lines.push(`- ${r}`)

  return lines.join('\n')
}

// ==================== TOOL 4: GOVERNANCE ATTACK ANALYZER ====================

function analyzeGovernanceAttacks(config: GovernanceConfig): GovernanceAttackReport {
  const attackScenarios: string[] = []
  const recommendations: string[] = []

  // Flash loan governance vulnerability
  let flashLoanRisk = 0
  let flashLoanVulnerable = false
  const votingModel = config.voting_model.toLowerCase()
  if (votingModel.includes('erc20') || votingModel.includes('token-weighted') || votingModel.includes('1token')) {
    flashLoanRisk = 80
    flashLoanVulnerable = true
    attackScenarios.push('Attacker flash-loans 1M tokens, votes YES on treasury drain proposal, returns tokens in same tx.')
    recommendations.push('Use snapshot-based voting (record balance at proposal block, not current block).')
  } else if (votingModel.includes('delegation') || votingModel.includes('ve')) {
    flashLoanRisk = 30
    flashLoanVulnerable = false
    recommendations.push('Delegation-based voting provides good flash loan resistance. Ensure delegation requires time lock.')
  } else if (votingModel.includes('quadratic')) {
    flashLoanRisk = 20
    flashLoanVulnerable = false
    recommendations.push('Quadratic voting reduces but does not eliminate flash loan risk.')
  } else {
    flashLoanRisk = 50
    flashLoanVulnerable = true
    attackScenarios.push(`Unknown voting model "${config.voting_model}" — assume flash loan vulnerability exists.`)
  }

  if (config.flash_loan_protection) {
    flashLoanRisk = Math.max(0, flashLoanRisk - 30)
    recommendations.push('Flash loan protection is enabled — verify it covers all proposal types.')
  }

  // Quorum manipulation
  let quorumRisk = 0
  let quorumPossible = false
  if (config.quorum < 5) {
    quorumRisk = 70
    quorumPossible = true
    attackScenarios.push(`Quorum of ${config.quorum}% is extremely low — a whale with 5%+ tokens can pass proposals unilaterally.`)
    recommendations.push('Increase quorum to at least 10-15% for meaningful decentralization.')
  } else if (config.quorum < 10) {
    quorumRisk = 40
    quorumPossible = true
    attackScenarios.push(`Quorum of ${config.quorum}% is low — coordinated whale group can reach threshold.`)
    recommendations.push('Consider raising quorum to 15%+ for high-value protocol decisions.')
  } else if (config.quorum > 50) {
    quorumRisk = 20
    quorumPossible = false
    recommendations.push('High quorum provides good protection but may cause governance gridlock.')
  } else {
    quorumRisk = 25
    quorumPossible = false
    recommendations.push(`Quorum of ${config.quorum}% is within reasonable range.`)
  }

  // Timelock bypass
  let timelockRisk = 0
  let timelockBypassPossible = false
  if (config.timelock < 3600) {
    timelockRisk = 75
    timelockBypassPossible = true
    attackScenarios.push(`Timelock of ${config.timelock}s is too short — MEV bots can front-run governance decisions within seconds.`)
    recommendations.push('Increase timelock to at least 48 hours (172800s) for critical operations.')
  } else if (config.timelock < 86400) {
    timelockRisk = 40
    timelockBypassPossible = false
    recommendations.push('Timelock is moderate — consider 48h+ for treasury/upgrade operations.')
  } else {
    timelockRisk = 15
    timelockBypassPossible = false
    recommendations.push(`Timelock of ${(config.timelock / 3600).toFixed(0)}h provides good protection against instant execution.`)
  }

  // Voting period analysis
  if (config.voting_period && config.voting_period < 86400) {
    attackScenarios.push(`Voting period of ${config.voting_period}s is too short — community cannot organize opposition.`)
    recommendations.push('Extend voting period to at least 3-7 days for meaningful participation.')
  }

  // Proposal threshold
  if (config.proposal_threshold && config.proposal_threshold > 5) {
    recommendations.push(`Proposal threshold of ${config.proposal_threshold}% is high — may prevent legitimate proposals.`)
  }

  const overallRiskScore = (flashLoanRisk + quorumRisk + timelockRisk) / 3
  let overallRisk: GovernanceAttackReport['overallRisk'] = 'low'
  if (overallRiskScore >= 60) overallRisk = 'critical'
  else if (overallRiskScore >= 40) overallRisk = 'high'
  else if (overallRiskScore >= 25) overallRisk = 'medium'

  return {
    flashLoanVulnerability: {
      vulnerable: flashLoanVulnerable,
      riskScore: flashLoanRisk,
      description: flashLoanVulnerable
        ? 'Governance is vulnerable to flash loan attacks. Borrowed tokens can be used for voting.'
        : 'Governance has some flash loan protection. Verify edge cases.'
    },
    quorumManipulation: {
      possible: quorumPossible,
      riskScore: quorumRisk,
      description: quorumPossible
        ? 'Quorum is low enough to be manipulated by whales or flash loans.'
        : 'Quorum provides reasonable protection against manipulation.'
    },
    timelockBypass: {
      possible: timelockBypassPossible,
      riskScore: timelockRisk,
      description: timelockBypassPossible
        ? 'Timelock is too short to prevent front-running or allow community response.'
        : 'Timelock provides adequate delay for community oversight.'
    },
    overallRisk,
    riskScore: overallRiskScore,
    attackScenarios,
    recommendations
  }
}

function formatGovernanceReport(report: GovernanceAttackReport): string {
  const lines: string[] = []
  lines.push('## Governance Attack Analysis')
  lines.push('')
  lines.push(`**Overall Risk:** ${report.overallRisk.toUpperCase()} | **Risk Score:** ${report.riskScore.toFixed(0)}/100`)
  lines.push('')

  lines.push('### Flash Loan Governance')
  lines.push(`- Vulnerable: ${report.flashLoanVulnerability.vulnerable ? 'YES' : 'No'} | Risk: ${report.flashLoanVulnerability.riskScore}/100`)
  lines.push(`- ${report.flashLoanVulnerability.description}`)
  lines.push('')

  lines.push('### Quorum Manipulation')
  lines.push(`- Possible: ${report.quorumManipulation.possible ? 'YES' : 'No'} | Risk: ${report.quorumManipulation.riskScore}/100`)
  lines.push(`- ${report.quorumManipulation.description}`)
  lines.push('')

  lines.push('### Timelock Bypass')
  lines.push(`- Possible: ${report.timelockBypass.possible ? 'YES' : 'No'} | Risk: ${report.timelockBypass.riskScore}/100`)
  lines.push(`- ${report.timelockBypass.description}`)
  lines.push('')

  if (report.attackScenarios.length > 0) {
    lines.push('### Attack Scenarios')
    for (const s of report.attackScenarios) lines.push(`- ${s}`)
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of report.recommendations) lines.push(`- ${r}`)

  return lines.join('\n')
}

// ==================== TOOL 5: OPERATIONAL SECURITY CHECKER ====================

function checkOperationalSecurity(config: OperationalConfig): OperationalRiskReport {
  const criticalFindings: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  const risk2026Context: string[] = []

  // Admin key analysis
  let adminKeyRisk = 0
  const adminType = config.admin_key_type.toLowerCase()
  if (adminType.includes('eo') || adminType.includes('externally') || adminType.includes('single') || adminType.includes('private')) {
    adminKeyRisk = 90
    criticalFindings.push('CRITICAL: Admin key is a single EOA (Externally Owned Account). One key compromise = total protocol takeover.')
    risk2026Context.push('2026 Pattern: Drift Protocol $285M hack — single admin key compromise led to complete protocol drainage.')
    risk2026Context.push('2026 Pattern: Wasabi $4.5M hack — stolen deployer key used to upgrade contracts maliciously.')
    recommendations.push('Migrate admin to a multi-sig wallet (Gnosis Safe) with at least 3/5 threshold IMMEDIATELY.')
    recommendations.push('Consider timelock on all admin operations (min 48h).')
  } else if (adminType.includes('multisig') || adminType.includes('multi-sig') || adminType.includes('gnosis')) {
    adminKeyRisk = 25
    warnings.push('Multi-sig admin detected — verify threshold and signer diversity.')
    recommendations.push('Ensure multi-sig signers are geographically distributed and use hardware wallets.')
  } else if (adminType.includes('dao') || adminType.includes('governance')) {
    adminKeyRisk = 15
    warnings.push('DAO governance admin — verify quorum and timelock are sufficient.')
  } else if (adminType.includes('timelock')) {
    adminKeyRisk = 20
    warnings.push('Timelock admin — verify duration is sufficient (48h+).')
  } else {
    adminKeyRisk = 50
    warnings.push(`Unknown admin key type "${config.admin_key_type}" — assume high risk.`)
  }

  // Multi-sig analysis
  let multisigRisk = 0
  if (config.multisig_setup.enabled) {
    const { threshold, totalSigners } = config.multisig_setup
    if (threshold === 1) {
      multisigRisk = 70
      criticalFindings.push('CRITICAL: Multi-sig threshold is 1/N — equivalent to single key. Any one signer can execute.')
      recommendations.push('Increase multi-sig threshold to at least 3/5 or 4/7.')
    } else if (threshold < totalSigners / 2) {
      multisigRisk = 40
      warnings.push(`Multi-sig threshold ${threshold}/${totalSigners} is below 50% — minority can execute.`)
      recommendations.push('Consider raising threshold to >50% of signers.')
    } else {
      multisigRisk = 15
      warnings.push(`Multi-sig ${threshold}/${totalSigners} — verify signer independence.`)
    }

    // Check signer overlap
    const uniqueSigners = new Set(config.multisig_setup.signers)
    if (uniqueSigners.size < config.multisig_setup.totalSigners) {
      multisigRisk += 20
      criticalFindings.push('CRITICAL: Duplicate signers detected in multi-sig — reduces effective security.')
    }
  } else {
    multisigRisk = 80
    criticalFindings.push('CRITICAL: No multi-sig setup detected. All privileged operations rely on single key.')
    risk2026Context.push('2026 Pattern: 78% of major hacks in Q1 2026 involved single-key admin compromise.')
    recommendations.push('Deploy Gnosis Safe multi-sig for ALL privileged operations.')
  }

  // Bridge validator analysis
  let bridgeValidatorRisk = 0
  const { count, threshold, identities } = config.bridge_validators
  if (count === 0) {
    bridgeValidatorRisk = 95
    criticalFindings.push('CRITICAL: No bridge validators configured — bridge has no security layer.')
    risk2026Context.push('2026 Pattern: KelpDAO $292M hack — bridge validator compromise led to massive fund drainage.')
    recommendations.push('Deploy a decentralized validator set with at least 7+ independent validators.')
  } else if (count < 4) {
    bridgeValidatorRisk = 70
    criticalFindings.push(`CRITICAL: Only ${count} bridge validator(s) — extremely centralized.`)
    risk2026Context.push('2026 Pattern: KelpDAO $292M hack — bridge validator compromise led to massive fund drainage.')
    recommendations.push('Increase validator count to at least 7+ with geographic distribution.')
  } else if (count < 7) {
    bridgeValidatorRisk = 40
    warnings.push(`Only ${count} bridge validators — consider increasing for better decentralization.`)
  } else {
    bridgeValidatorRisk = 20
    warnings.push(`${count} bridge validators — verify independence and geographic distribution.`)
  }

  if (threshold <= count / 2) {
    bridgeValidatorRisk += 15
    warnings.push(`Bridge threshold ${threshold}/${count} is <=50% — minority can forge messages.`)
  }

  // Deployer key security
  let deployerKeyRisk = 0
  const deployer = config.deployer_key_security
  if (!deployer.isMultisig) {
    deployerKeyRisk += 30
    criticalFindings.push('CRITICAL: Deployer key is NOT a multi-sig. Compromised deployer can upgrade contracts maliciously.')
    risk2026Context.push('2026 Pattern: Wasabi $4.5M hack — stolen deployer key used for malicious contract upgrade.')
  }
  if (!deployer.isHardwareWallet) {
    deployerKeyRisk += 20
    warnings.push('Deployer key is not stored on hardware wallet — vulnerable to phishing/malware.')
    recommendations.push('Use hardware wallets (Ledger/Trezor) for all deployer keys.')
  }
  if (!deployer.keyRotation) {
    deployerKeyRisk += 15
    warnings.push('No key rotation policy — long-lived keys increase exposure window.')
    recommendations.push('Implement periodic key rotation schedule (every 6-12 months).')
  }
  if (!deployer.emergencyRecovery) {
    deployerKeyRisk += 10
    warnings.push('No emergency recovery mechanism — if key is lost, protocol may be frozen.')
    recommendations.push('Implement social recovery or backup signer mechanism.')
  }

  // Timelock check
  if (config.timelock) {
    if (!config.timelock.enabled) {
      criticalFindings.push('CRITICAL: No timelock on privileged operations — instant execution possible.')
      recommendations.push('Enable timelock (min 48h) for all admin operations.')
    } else if (config.timelock.duration < 86400) {
      warnings.push(`Timelock of ${config.timelock.duration}s is short — consider 48h+ for critical ops.`)
    }
  } else {
    criticalFindings.push('CRITICAL: No timelock configuration detected.')
    recommendations.push('Deploy TimelockController for all privileged operations.')
  }

  // Calculate overall risk
  const riskScore = Math.min(100, (
    adminKeyRisk * 0.35 +
    bridgeValidatorRisk * 0.25 +
    deployerKeyRisk * 0.2 +
    multisigRisk * 0.2
  ))

  let riskLevel: OperationalRiskReport['riskLevel'] = 'low'
  if (riskScore >= 60) riskLevel = 'critical'
  else if (riskScore >= 40) riskLevel = 'high'
  else if (riskScore >= 25) riskLevel = 'medium'

  if (risk2026Context.length === 0) {
    risk2026Context.push('No direct 2026 attack pattern matches detected. Continue monitoring for emerging threats.')
  }

  return {
    riskScore,
    riskLevel,
    criticalFindings,
    warnings,
    adminKeyRisk,
    bridgeValidatorRisk,
    deployerKeyRisk,
    multisigRisk,
    risk2026Context,
    recommendations: [
      ...recommendations,
      'Conduct quarterly operational security audits.',
      'Implement on-chain monitoring for admin key usage (Forta Network).',
      'Establish incident response plan with pre-signed emergency transactions.'
    ]
  }
}

function formatOperationalReport(report: OperationalRiskReport): string {
  const lines: string[] = []
  lines.push('## Operational Security Assessment')
  lines.push('')
  lines.push(`**Risk Score:** ${report.riskScore.toFixed(0)}/100 | **Level:** ${report.riskLevel.toUpperCase()}`)
  lines.push(`| Admin Key | Bridge Validator | Deployer Key | Multi-sig |`)
  lines.push(`|-----------|-----------------|--------------|-----------|`)
  lines.push(`| ${report.adminKeyRisk}/100 | ${report.bridgeValidatorRisk}/100 | ${report.deployerKeyRisk}/100 | ${report.multisigRisk}/100 |`)
  lines.push('')

  if (report.criticalFindings.length > 0) {
    lines.push('### CRITICAL Findings')
    for (const f of report.criticalFindings) lines.push(`[!] ${f}`)
    lines.push('')
  }

  if (report.warnings.length > 0) {
    lines.push('### Warnings')
    for (const w of report.warnings) lines.push(`- ${w}`)
    lines.push('')
  }

  lines.push('### 2026 Threat Context')
  for (const c of report.risk2026Context) lines.push(`- ${c}`)
  lines.push('')

  lines.push('### Recommendations')
  for (const r of report.recommendations) lines.push(`- ${r}`)

  return lines.join('\n')
}

// ==================== TOOL 6: TVL HEALTH MONITOR ====================

function monitorTVLHealth(data: TVLData): TVLHealthReport {
  const findings: string[] = []
  const anomalyFlags: string[] = []

  // Calculate TVL changes
  const sortedHistory = [...data.historical].sort((a, b) => a.timestamp - b.timestamp)
  const now = Date.now() / 1000
  const dayAgo = now - 86400
  const weekAgo = now - 604800

  const tvl24hAgo = sortedHistory.find(h => h.timestamp >= dayAgo)?.value ?? sortedHistory[0]?.value ?? data.current
  const tvl7dAgo = sortedHistory.find(h => h.timestamp >= weekAgo)?.value ?? sortedHistory[0]?.value ?? data.current

  const tvlChange24h = ((data.current - tvl24hAgo) / tvl24hAgo) * 100
  const tvlChange7d = ((data.current - tvl7dAgo) / tvl7dAgo) * 100

  // Anomaly detection
  if (tvlChange24h < -20) {
    anomalyFlags.push(`MASSIVE OUTFLOW: TVL dropped ${tvlChange24h.toFixed(1)}% in 24h`)
    findings.push('TVL decline >20% in 24h suggests panic withdrawal or exploit. Investigate immediately.')
  } else if (tvlChange24h < -10) {
    anomalyFlags.push(`Significant outflow: TVL dropped ${tvlChange24h.toFixed(1)}% in 24h`)
    findings.push('TVL decline >10% in 24h — monitor for continued outflows.')
  } else if (tvlChange24h > 50) {
    anomalyFlags.push(`Unusual inflow: TVL surged +${tvlChange24h.toFixed(1)}% in 24h`)
    findings.push('TVL surge >50% may indicate artificial inflation (wash farming) or genuine growth.')
  }

  // Volatility index
  if (sortedHistory.length >= 2) {
    const returns: number[] = []
    for (let i = 1; i < sortedHistory.length; i++) {
      returns.push((sortedHistory[i].value - sortedHistory[i - 1].value) / sortedHistory[i - 1].value)
    }
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length
    const variance = returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / returns.length
    const volatilityIndex = Math.sqrt(variance) * Math.sqrt(365) * 100

    if (volatilityIndex > 100) {
      anomalyFlags.push(`High volatility index: ${volatilityIndex.toFixed(0)}%`)
      findings.push('TVL volatility exceeds 100% annualized — protocol may be unstable or manipulated.')
    }
  }

  // Concentration risk (HHI)
  const shares = data.concentration.topProtocols.map(p => p.share / 100)
  const hhi = shares.reduce((s, share) => s + share * share, 0) * 10000
  const top3Share = shares.slice(0, 3).reduce((s, v) => s + v, 0) * 100

  let concentrationLevel: TVLHealthReport['concentrationRisk']['level'] = 'low'
  if (hhi > 2500) {
    concentrationLevel = 'high'
    findings.push(`HHI of ${hhi.toFixed(0)} indicates extreme concentration — top protocols dominate TVL.`)
  } else if (hhi > 1500) {
    concentrationLevel = 'medium'
    findings.push(`HHI of ${hhi.toFixed(0)} indicates moderate concentration.`)
  }

  // Outflow risk
  let outflowRisk: TVLHealthReport['outflowRisk'] = 'low'
  if (data.outflows && data.inflows) {
    const netFlow = data.inflows - data.outflows
    const flowRatio = data.outflows / Math.max(data.inflows, 1)
    if (flowRatio > 1.5) {
      outflowRisk = 'high'
      findings.push(`Outflows ${(flowRatio * 100).toFixed(0)}% of inflows — net capital flight detected.`)
    } else if (flowRatio > 1.1) {
      outflowRisk = 'medium'
      findings.push('Outflows exceed inflows — monitor for sustained outflow trend.')
    }
  }

  // Historical deviation
  const avgTVL = sortedHistory.reduce((s, h) => s + h.value, 0) / Math.max(sortedHistory.length, 1)
  const historicalDeviation = avgTVL > 0 ? ((data.current - avgTVL) / avgTVL) * 100 : 0

  if (Math.abs(historicalDeviation) > 50) {
    anomalyFlags.push(`TVL deviates ${historicalDeviation.toFixed(0)}% from historical average`)
  }

  // Determine status
  let status: TVLHealthReport['status'] = 'healthy'
  if (anomalyFlags.length >= 2 || outflowRisk === 'high') status = 'critical'
  else if (anomalyFlags.length >= 1 || outflowRisk === 'medium') status = 'warning'

  const recommendations: string[] = []
  if (status === 'critical') {
    recommendations.push('URGENT: Investigate large outflows — may indicate exploit or loss of confidence.')
    recommendations.push('Pause deposits if outflows are accelerating.')
    recommendations.push('Prepare emergency response plan and communication.')
  }
  if (concentrationLevel === 'high') {
    recommendations.push('Diversify TVL across multiple chains and protocols to reduce concentration risk.')
  }
  if (outflowRisk !== 'low') {
    recommendations.push('Implement withdrawal rate limiting or cooldown periods to prevent bank runs.')
  }
  recommendations.push('Set up real-time TVL monitoring alerts (Zapper, DeFiLlama API).')

  return {
    status,
    anomalyFlags,
    tvlChange24h,
    tvlChange7d,
    volatilityIndex: 0,
    concentrationRisk: { hhi, top3Share, level: concentrationLevel },
    outflowRisk,
    historicalDeviation,
    findings,
    recommendations
  }
}

function formatTVLHealthReport(report: TVLHealthReport): string {
  const lines: string[] = []
  lines.push('## TVL Health Monitor')
  lines.push('')
  lines.push(`**Status:** ${report.status.toUpperCase()}`)
  lines.push(`- 24h Change: ${report.tvlChange24h >= 0 ? '+' : ''}${report.tvlChange24h.toFixed(2)}%`)
  lines.push(`- 7d Change: ${report.tvlChange7d >= 0 ? '+' : ''}${report.tvlChange7d.toFixed(2)}%`)
  lines.push(`- Historical Deviation: ${report.historicalDeviation >= 0 ? '+' : ''}${report.historicalDeviation.toFixed(1)}%`)
  lines.push(`- Outflow Risk: ${report.outflowRisk.toUpperCase()}`)
  lines.push('')

  lines.push('### Concentration Risk')
  lines.push(`- HHI: ${report.concentrationRisk.hhi.toFixed(0)} (${report.concentrationRisk.level.toUpperCase()})`)
  lines.push(`- Top 3 Protocols Share: ${report.concentrationRisk.top3Share.toFixed(1)}%`)
  lines.push('')

  if (report.anomalyFlags.length > 0) {
    lines.push('### Anomaly Flags')
    for (const f of report.anomalyFlags) lines.push(`[!] ${f}`)
    lines.push('')
  }

  lines.push('### Findings')
  for (const f of report.findings) lines.push(`- ${f}`)
  lines.push('')

  lines.push('### Recommendations')
  for (const r of report.recommendations) lines.push(`- ${r}`)

  return lines.join('\n')
}

// ==================== TOOL 7: TOKENOMICS AUDIT ====================

function auditTokenomics(tokenomics: Tokenomics): TokenomicsReport {
  const findings: string[] = []
  const redFlags: string[] = []
  const recommendations: string[] = []

  // Supply analysis
  const supplyRatio = tokenomics.circulatingSupply / tokenomics.totalSupply
  if (supplyRatio < 0.3) {
    redFlags.push(`Only ${(supplyRatio * 100).toFixed(0)}% of tokens are in circulation — massive future sell pressure.`)
    recommendations.push('Demand full vesting schedules and lock-up details for team/investor tokens.')
  } else if (supplyRatio < 0.5) {
    findings.push(`${(supplyRatio * 100).toFixed(0)}% circulating — moderate future dilution risk.`)
  }

  // Distribution concentration
  const topHolders = tokenomics.distribution.slice(0, 5)
  const top5Share = topHolders.reduce((s, h) => s + h.percentage, 0)
  const concentrationRisk = top5Share / 100

  if (top5Share > 60) {
    redFlags.push(`Top 5 holders control ${top5Share.toFixed(1)}% of supply — extreme centralization.`)
    recommendations.push('Verify if top holders are exchanges/protocol treasuries (less risky) vs anonymous wallets (high risk).')
  } else if (top5Share > 40) {
    findings.push(`Top 5 holders control ${top5Share.toFixed(1)}% of supply — moderate concentration.`)
  }

  // Check for team allocation
  const teamAllocation = tokenomics.distribution.find(d => d.category.toLowerCase().includes('team') || d.category.toLowerCase().includes('advisor'))
  if (teamAllocation && teamAllocation.percentage > 25) {
    redFlags.push(`Team holds ${teamAllocation.percentage}% — excessive insider allocation.`)
    recommendations.push('Team allocation should be <20% with multi-year vesting.')
  }

  // Inflation risk
  let inflationRisk: TokenomicsReport['inflationRisk'] = 'low'
  if (tokenomics.inflation.current > 20) {
    inflationRisk = 'high'
    redFlags.push(`Annual inflation of ${tokenomics.inflation.current}% is extremely high — constant sell pressure.`)
    recommendations.push('Model token value under current inflation rate. Real returns must exceed inflation.')
  } else if (tokenomics.inflation.current > 10) {
    inflationRisk = 'medium'
    findings.push(`Annual inflation of ${tokenomics.inflation.current}% is elevated.`)
  } else if (tokenomics.inflation.current > 0) {
    findings.push(`Annual inflation of ${tokenomics.inflation.current}% is moderate.`)
  } else {
    findings.push('Token has zero or negative inflation (deflationary).')
  }

  // Utility assessment
  let utilityScore = 0
  if (tokenomics.utility.governance) utilityScore += 25
  if (tokenomics.utility.feeSharing) utilityScore += 25
  if (tokenomics.utility.staking) utilityScore += 25
  if (tokenomics.utility.burnMechanism) utilityScore += 25

  if (utilityScore < 50) {
    redFlags.push(`Low utility score (${utilityScore}/100) — token may lack fundamental demand drivers.`)
    recommendations.push('Develop additional utility (fee sharing, staking rewards, governance rights) to create organic demand.')
  }

  // Vesting analysis
  if (tokenomics.vesting) {
    const unlockedVesting = tokenomics.vesting.filter(v => v.cliff === 0)
    if (unlockedVesting.length > 0) {
      const unlockedPct = unlockedVesting.reduce((s, v) => s + v.percentage, 0)
      redFlags.push(`${unlockedPct}% of tokens have no cliff — immediately sellable.`)
    }

    const shortVesting = tokenomics.vesting.filter(v => v.duration < 180 && v.percentage > 10)
    if (shortVesting.length > 0) {
      findings.push('Some allocations have <6 month vesting — short-term sell pressure expected.')
    }
  }

  // Sustainability score
  const sustainabilityScore = Math.max(0, Math.min(100,
    utilityScore * 0.3 +
    (1 - concentrationRisk) * 30 +
    (inflationRisk === 'low' ? 25 : inflationRisk === 'medium' ? 15 : 5) +
    (supplyRatio > 0.5 ? 20 : supplyRatio * 40)
  ))

  // Manipulation risk
  let manipulationRisk: TokenomicsReport['manipulationRisk'] = 'low'
  if (concentrationRisk > 0.6 || utilityScore < 25) manipulationRisk = 'critical'
  else if (concentrationRisk > 0.4 || utilityScore < 50) manipulationRisk = 'high'
  else if (concentrationRisk > 0.25) manipulationRisk = 'medium'

  return {
    sustainabilityScore,
    manipulationRisk,
    concentrationRisk,
    inflationRisk,
    utilityScore,
    findings,
    redFlags,
    recommendations: [
      ...recommendations,
      'Verify team token vesting on-chain (TokenUnlocks, VestLab).',
      'Monitor top holder movements for early warning of large sells.',
      'Compare tokenomics against successful protocols in the same category.'
    ]
  }
}

function formatTokenomicsReport(report: TokenomicsReport): string {
  const lines: string[] = []
  lines.push('## Tokenomics Audit Report')
  lines.push('')
  lines.push(`**Sustainability Score:** ${report.sustainabilityScore.toFixed(0)}/100 | **Manipulation Risk:** ${report.manipulationRisk.toUpperCase()}`)
  lines.push(`- Concentration Risk: ${(report.concentrationRisk * 100).toFixed(0)}%`)
  lines.push(`- Inflation Risk: ${report.inflationRisk.toUpperCase()}`)
  lines.push(`- Utility Score: ${report.utilityScore}/100`)
  lines.push('')

  if (report.redFlags.length > 0) {
    lines.push('### RED FLAGS')
    for (const f of report.redFlags) lines.push(`[!] ${f}`)
    lines.push('')
  }

  lines.push('### Findings')
  for (const f of report.findings) lines.push(`- ${f}`)
  lines.push('')

  lines.push('### Recommendations')
  for (const r of report.recommendations) lines.push(`- ${r}`)

  return lines.join('\n')
}

// ==================== TOOL 8: COMPOSABILITY RISK SCORER ====================

function scoreComposabilityRisk(integrations: Integration[]): ComposabilityReport {
  const findings: string[] = []
  const recommendations: string[] = []
  const criticalPaths: string[] = []
  const cascadeScenarios: ComposabilityReport['cascadeScenarios'] = []

  const integrationDepth = integrations.length

  // Identify critical paths
  const criticalIntegrations = integrations.filter(i => i.criticalPath)
  for (const ci of criticalIntegrations) {
    criticalPaths.push(`${ci.protocol} (${ci.type}) — TVL dependency: ${ci.tvlDependent}%`)
  }

  if (criticalIntegrations.length > 0) {
    findings.push(`${criticalIntegrations.length} critical path integration(s) — failure cascades directly.`)
  }

  // Calculate systemic risk
  let systemicRiskScore = 0
  const avgTVLDependency = integrations.reduce((s, i) => s + i.tvlDependent, 0) / Math.max(integrations.length, 1)
  systemicRiskScore += avgTVLDependency * 0.3
  systemicRiskScore += Math.min(integrationDepth * 5, 30)
  systemicRiskScore += criticalIntegrations.length * 10

  // Type-based risk
  const typeCounts = new Map<string, number>()
  for (const i of integrations) {
    typeCounts.set(i.type, (typeCounts.get(i.type) ?? 0) + 1)
  }

  if ((typeCounts.get('lending') ?? 0) >= 2) {
    systemicRiskScore += 10
    findings.push('Multiple lending protocol integrations — correlated liquidation risk.')
    cascadeScenarios.push({
      trigger: 'Lending protocol oracle manipulation',
      cascadePath: ['Oracle price distortion', 'False liquidations', 'Collateral cascade', 'Protocol insolvency'],
      estimatedLoss: 80,
      probability: 0.3
    })
  }

  if ((typeCounts.get('bridge') ?? 0) >= 2) {
    systemicRiskScore += 15
    findings.push('Multiple bridge integrations — bridge hack can drain all bridged assets.')
    cascadeScenarios.push({
      trigger: 'Bridge validator compromise',
      cascadePath: ['Bridge hack', 'All bridged assets frozen', 'Dependent protocols insolvent', 'Cross-chain contagion'],
      estimatedLoss: 95,
      probability: 0.15
    })
  }

  if ((typeCounts.get('oracle') ?? 0) >= 2) {
    systemicRiskScore += 8
    findings.push('Multiple oracle integrations — single oracle failure affects multiple functions.')
  }

  if ((typeCounts.get('dex') ?? 0) >= 3) {
    systemicRiskScore += 5
    findings.push('Heavy DEX integration — MEV and slippage risks compound across swaps.')
  }

  // Data flow analysis
  const bidirectionalFlows = integrations.filter(i => i.dataFlow === 'bidirectional')
  if (bidirectionalFlows.length > 2) {
    systemicRiskScore += 10
    findings.push(`${bidirectionalFlows.length} bidirectional data flows — feedback loops can amplify shocks.`)
  }

  systemicRiskScore = Math.min(100, systemicRiskScore)

  // Cascade risk level
  let cascadeRisk: ComposabilityReport['cascadeRisk'] = 'low'
  if (systemicRiskScore >= 60) cascadeRisk = 'critical'
  else if (systemicRiskScore >= 40) cascadeRisk = 'high'
  else if (systemicRiskScore >= 25) cascadeRisk = 'medium'

  // Generate cascade scenarios if none exist
  if (cascadeScenarios.length === 0 && integrationDepth > 0) {
    cascadeScenarios.push({
      trigger: 'Primary integration failure',
      cascadePath: ['Integration breaks', 'Protocol function fails', 'User funds at risk', 'Reputation damage'],
      estimatedLoss: avgTVLDependency,
      probability: 0.2
    })
  }

  recommendations.push('Reduce integration depth where possible — each integration is an additional attack surface.')
  recommendations.push('Implement circuit breakers that pause operations if critical integrations behave abnormally.')
  recommendations.push('Diversify oracle and bridge providers to reduce correlated failure risk.')
  recommendations.push('Regularly test failure scenarios for each integration (chaos engineering).')

  return {
    systemicRiskScore,
    cascadeRisk,
    integrationDepth,
    criticalPaths,
    cascadeScenarios,
    findings,
    recommendations
  }
}

function formatComposabilityReport(report: ComposabilityReport): string {
  const lines: string[] = []
  lines.push('## Composability Risk Assessment')
  lines.push('')
  lines.push(`**Systemic Risk Score:** ${report.systemicRiskScore.toFixed(0)}/100 | **Cascade Risk:** ${report.cascadeRisk.toUpperCase()}`)
  lines.push(`- Integration Depth: ${report.integrationDepth} protocols`)
  lines.push(`- Critical Paths: ${report.criticalPaths.length}`)
  lines.push('')

  if (report.criticalPaths.length > 0) {
    lines.push('### Critical Paths')
    for (const p of report.criticalPaths) lines.push(`- ${p}`)
    lines.push('')
  }

  if (report.cascadeScenarios.length > 0) {
    lines.push('### Cascade Failure Scenarios')
    for (const s of report.cascadeScenarios) {
      lines.push(`**Trigger:** ${s.trigger} (Probability: ${(s.probability * 100).toFixed(0)}%)`)
      lines.push(`Estimated Loss: ${s.estimatedLoss}% of TVL`)
      lines.push(`Path: ${s.cascadePath.join(' → ')}`)
      lines.push('')
    }
  }

  lines.push('### Findings')
  for (const f of report.findings) lines.push(`- ${f}`)
  lines.push('')

  lines.push('### Recommendations')
  for (const r of report.recommendations) lines.push(`- ${r}`)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Contract Vulnerability Scanner
  tools.register(defineTool({
    name: 'contract_vulnerability_scanner',
    description: 'Scan smart contract code for vulnerabilities including reentrancy, integer overflow/underflow, access control issues, timestamp dependence, gas optimization, unchecked return values, and MEV/front-running risks. Returns a detailed vulnerability report with severity ratings and remediation guidance.',
    parameters: {
      contract_code: { type: 'string', required: true, description: 'The full source code of the smart contract to analyze (Solidity, Vyper, or other EVM language)' },
      language: { type: 'string', description: 'Programming language of the contract (default "solidity"). Options: solidity, vyper, huff, yul' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contract_code: string; language?: string }) {
      const result = scanContractVulnerabilities(args.contract_code, args.language ?? 'solidity')
      return formatContractVulnReport(result)
    }
  }))

  // Tool 2: Flash Loan Attack Detector
  tools.register(defineTool({
    name: 'flash_loan_attack_detector',
    description: 'Analyze protocol mechanisms to detect flash loan attack vectors including price manipulation, oracle manipulation, arbitrage exploitation, governance attacks, and callback re-entrancy. Returns attack vectors with exploitation steps and mitigations.',
    parameters: {
      protocol_mechanisms: { type: 'string', required: true, description: 'JSON array of strings describing protocol mechanisms (e.g., ["AMM spot price for collateral", "Single-source oracle for pricing", "Flash loan callback for liquidation"])' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { protocol_mechanisms: string }) {
      const mechanisms: string[] = JSON.parse(args.protocol_mechanisms)
      const result = detectFlashLoanAttacks(mechanisms)
      return formatFlashLoanReport(result)
    }
  }))

  // Tool 3: Oracle Risk Assessor
  tools.register(defineTool({
    name: 'oracle_risk_assessor',
    description: 'Assess oracle manipulation risk based on oracle type, data sources, heartbeat, deviation threshold, and failover configuration. Returns a risk score, manipulation vectors, and recommendations.',
    parameters: {
      oracle_config: { type: 'string', required: true, description: 'JSON object with fields: oracle_type (string), sources (array of {name, type, weight, reliability}), heartbeat (seconds), deviation_threshold (percent), failover_enabled (boolean), historical_manipulation (boolean, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { oracle_config: string }) {
      const config: OracleConfig = JSON.parse(args.oracle_config)
      const result = assessOracleRisk(config)
      return formatOracleRiskReport(result)
    }
  }))

  // Tool 4: Governance Attack Analyzer
  tools.register(defineTool({
    name: 'governance_attack_analyzer',
    description: 'Analyze governance configuration for flash loan governance attacks, quorum manipulation, and timelock bypass risks. Returns attack scenarios and protection recommendations.',
    parameters: {
      governance_config: { type: 'string', required: true, description: 'JSON object with fields: voting_model (string), quorum (percent number), timelock (seconds), quorum_type (string, optional), vote_delegation (boolean, optional), proposal_threshold (percent, optional), voting_period (seconds, optional), flash_loan_protection (boolean, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { governance_config: string }) {
      const config: GovernanceConfig = JSON.parse(args.governance_config)
      const result = analyzeGovernanceAttacks(config)
      return formatGovernanceReport(result)
    }
  }))

  // Tool 5: Operational Security Checker (2026 CRITICAL)
  tools.register(defineTool({
    name: 'operational_security_checker',
    description: 'Assess operational security risks including admin key type, multi-sig setup, bridge validator configuration, and deployer key security. CRITICAL for 2026 threat landscape where 78% of major hacks involved operational security failures (Drift $285M, KelpDAO $292M, Wasabi $4.5M).',
    parameters: {
      operational_config: { type: 'string', required: true, description: 'JSON object with fields: multisig_setup ({enabled, threshold, total_signers, signers}), admin_key_type (string: "eoa", "multisig", "dao", "timelock"), bridge_validators ({count, threshold, identities, geographic_distribution}), deployer_key_security ({is_multisig, is_hardware_wallet, key_rotation, emergency_recovery}), timelock ({enabled, duration_seconds}, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { operational_config: string }) {
      const raw: Record<string, unknown> = JSON.parse(args.operational_config)
      const config: OperationalConfig = {
        multisig_setup: {
          enabled: (raw.multisig_setup as Record<string, unknown>).enabled as boolean,
          threshold: (raw.multisig_setup as Record<string, unknown>).threshold as number,
          totalSigners: (raw.multisig_setup as Record<string, unknown>).total_signers as number,
          signers: ((raw.multisig_setup as Record<string, unknown>).signers as string[]) ?? []
        },
        admin_key_type: raw.admin_key_type as string,
        bridge_validators: {
          count: (raw.bridge_validators as Record<string, unknown>).count as number,
          threshold: (raw.bridge_validators as Record<string, unknown>).threshold as number,
          identities: ((raw.bridge_validators as Record<string, unknown>).identities as string[]) ?? [],
          geographicDistribution: (raw.bridge_validators as Record<string, unknown>).geographic_distribution as string | undefined
        },
        deployer_key_security: {
          isMultisig: (raw.deployer_key_security as Record<string, unknown>).is_multisig as boolean,
          isHardwareWallet: (raw.deployer_key_security as Record<string, unknown>).is_hardware_wallet as boolean,
          keyRotation: (raw.deployer_key_security as Record<string, unknown>).key_rotation as boolean,
          emergencyRecovery: (raw.deployer_key_security as Record<string, unknown>).emergency_recovery as boolean
        },
        timelock: raw.timelock ? {
          enabled: (raw.timelock as Record<string, unknown>).enabled as boolean,
          duration: (raw.timelock as Record<string, unknown>).duration_seconds as number
        } : undefined
      }
      const result = checkOperationalSecurity(config)
      return formatOperationalReport(result)
    }
  }))

  // Tool 6: TVL Health Monitor
  tools.register(defineTool({
    name: 'tvl_health_monitor',
    description: 'Monitor Total Value Locked (TVL) health with anomaly detection, concentration risk analysis, outflow detection, and historical deviation tracking. Returns status, flags, and recommendations.',
    parameters: {
      tvl_data: { type: 'string', required: true, description: 'JSON object with fields: current (number USD), historical (array of {timestamp_unix, value_usd}), concentration ({top_protocols: [{name, tvl_usd, share_percent}], chain_distribution: [{chain, tvl_usd, share_percent}]}), inflows_usd (number, optional), outflows_usd (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { tvl_data: string }) {
      const raw: Record<string, unknown> = JSON.parse(args.tvl_data)
      const data: TVLData = {
        current: raw.current as number,
        historical: ((raw.historical as Record<string, unknown>[]) ?? []).map(h => ({
          timestamp: h.timestamp_unix as number,
          value: h.value_usd as number
        })),
        concentration: {
          topProtocols: ((raw.concentration as Record<string, unknown>)?.top_protocols as Record<string, unknown>[] ?? []).map(p => ({
            name: p.name as string,
            tvl: p.tvl_usd as number,
            share: p.share_percent as number
          })),
          chainDistribution: ((raw.concentration as Record<string, unknown>)?.chain_distribution as Record<string, unknown>[] ?? []).map(c => ({
            chain: c.chain as string,
            tvl: c.tvl_usd as number,
            share: c.share_percent as number
          }))
        },
        inflows: raw.inflows_usd as number | undefined,
        outflows: raw.outflows_usd as number | undefined
      }
      const result = monitorTVLHealth(data)
      return formatTVLHealthReport(result)
    }
  }))

  // Tool 7: Tokenomics Audit
  tools.register(defineTool({
    name: 'tokenomics_audit',
    description: 'Audit tokenomics for sustainability and manipulation risks. Analyzes supply distribution, inflation rate, utility score, vesting schedules, and concentration. Returns sustainability score, red flags, and recommendations.',
    parameters: {
      tokenomics: { type: 'string', required: true, description: 'JSON object with fields: total_supply, circulating_supply, distribution (array of {holder, percentage, category}), inflation ({current_percent, schedule, next_change}), utility ({governance, fee_sharing, staking, burn_mechanism}), vesting (array of {category, percentage, cliff_days, duration_days}, optional), max_supply (number, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { tokenomics: string }) {
      const raw: Record<string, unknown> = JSON.parse(args.tokenomics)
      const data: Tokenomics = {
        totalSupply: raw.total_supply as number,
        circulatingSupply: raw.circulating_supply as number,
        distribution: ((raw.distribution as Record<string, unknown>[]) ?? []).map(d => ({
          holder: d.holder as string,
          percentage: d.percentage as number,
          category: d.category as string
        })),
        inflation: {
          current: (raw.inflation as Record<string, unknown>).current_percent as number,
          schedule: (raw.inflation as Record<string, unknown>).schedule as string,
          nextChange: (raw.inflation as Record<string, unknown>).next_change as number | undefined
        },
        utility: {
          governance: (raw.utility as Record<string, unknown>).governance as boolean,
          feeSharing: (raw.utility as Record<string, unknown>).fee_sharing as boolean,
          staking: (raw.utility as Record<string, unknown>).staking as boolean,
          burnMechanism: (raw.utility as Record<string, unknown>).burn_mechanism as boolean
        },
        vesting: ((raw.vesting as Record<string, unknown>[]) ?? []).map(v => ({
          category: v.category as string,
          percentage: v.percentage as number,
          cliff: v.cliff_days as number,
          duration: v.duration_days as number
        })),
        maxSupply: raw.max_supply as number | undefined
      }
      const result = auditTokenomics(data)
      return formatTokenomicsReport(result)
    }
  }))

  // Tool 8: Composability Risk Scorer
  tools.register(defineTool({
    name: 'composability_risk_scorer',
    description: 'Score composability risk from protocol integrations. Analyzes integration depth, critical paths, data flow patterns, and generates cascade failure scenarios with estimated losses.',
    parameters: {
      integrations: { type: 'string', required: true, description: 'JSON array of integration objects with fields: protocol (string), type (string: "lending", "dex", "oracle", "bridge", "yield", "insurance"), tvl_dependent (percent number), critical_path (boolean), data_flow (string: "inbound", "outbound", "bidirectional")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { integrations: string }) {
      const raw: Record<string, unknown>[] = JSON.parse(args.integrations)
      const integrations: Integration[] = raw.map(i => ({
        protocol: i.protocol as string,
        type: i.type as string,
        tvlDependent: i.tvl_dependent as number,
        criticalPath: i.critical_path as boolean,
        dataFlow: i.data_flow as string
      }))
      const result = scoreComposabilityRisk(integrations)
      return formatComposabilityReport(result)
    }
  }))

  console.log(`[dsh-tool-defiscanner] Loaded v${VERSION} — DeFi Protocol Security Scanner with 8 tools`)
  console.log('  Tools: contract_vulnerability_scanner, flash_loan_attack_detector, oracle_risk_assessor, governance_attack_analyzer, operational_security_checker, tvl_health_monitor, tokenomics_audit, composability_risk_scorer')
}
