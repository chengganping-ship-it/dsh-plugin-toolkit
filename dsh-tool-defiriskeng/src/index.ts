/**
 * DSH DeFi Risk Engineering Toolkit Plugin v0.1.0
 *
 * Comprehensive DeFi risk engineering toolkit for DeepSeek Harness Agent.
 * Designed for DeFi analysts, risk managers, protocol operators, and auditors.
 *
 * Features (v0.1.0):
 * - Protocol Risk Scorer (multi-dimensional risk scoring 0-100 from TVL/audit/gov/oracle/composability)
 * - Flash Loan Attack Detector (price manipulation, oracle manipulation, arbitrage vectors)
 * - TVL Health Monitor (anomaly detection, concentration risk, outflow detection, historical deviation)
 * - Oracle Manipulation Detector (manipulation vector analysis, source reliability, heartbeat checks)
 * - Impermanent Loss Calculator (IL simulation for AMM pools, break-even analysis, time horizon)
 * - Smart Contract Vulnerability Scanner (reentrancy, overflow, access control, timestamp, unchecked)
 * - Governance Attack Analyzer (flash loan governance, quorum manipulation, timelock bypass)
 * - DeFi Portfolio Risk Manager (portfolio VaR, correlation risk, exposure limits, rebalancing)
 *
 * 2026 Context: DeFi protocols lose billions annually to hacks, exploits, and risk failures.
 * Risk management infrastructure is a critical multi-billion dollar market.
 * This toolkit provides deterministic, seeded analysis for all major DeFi risk vectors.
 *
 * @module dsh-tool-defiriskeng
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-defiriskeng'
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

// ==================== SECTION 2 — Type Definitions ====================

// --- Tool 1: Protocol Risk Scorer ---
export interface ProtocolRiskInput {
  input_data: string
}

export interface ProtocolDimensions {
  tvl_score: number
  audit_score: number
  governance_score: number
  oracle_score: number
  composability_score: number
  longevity_score: number
  findings: string[]
  recommendations: string[]
}

export interface ProtocolRiskResult {
  protocol_name: string
  overall_risk_score: number
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  dimensions: ProtocolDimensions
  critical_risks: string[]
  risk_rank_percentile: number
  dashboard_data: Record<string, number>
}

// --- Tool 2: Flash Loan Attack Detector ---
export interface FlashLoanInput {
  input_data: string
}

export interface FlashLoanVector {
  vector_type: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  description: string
  attack_steps: string[]
  affected_component: string
  likelihood: number
  potential_loss_pct: number
  mitigation: string
}

export interface FlashLoanResult {
  total_vectors: number
  critical_count: number
  high_count: number
  overall_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  vectors: FlashLoanVector[]
  recommended_mitigations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 3: TVL Health Monitor ---
export interface TVLHealthInput {
  input_data: string
}

export interface TVLAnomaly {
  type: string
  severity: 'info' | 'warning' | 'critical'
  description: string
  deviation_pct: number
}

export interface TVLHealthResult {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  current_tvl: number
  tvl_change_24h_pct: number
  tvl_change_7d_pct: number
  volatility_index: number
  concentration_hhi: number
  concentration_level: 'LOW' | 'MEDIUM' | 'HIGH'
  outflow_risk: 'LOW' | 'MEDIUM' | 'HIGH'
  anomalies: TVLAnomaly[]
  findings: string[]
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 4: Oracle Manipulation Detector ---
export interface OracleInput {
  input_data: string
}

export interface OracleVulnerability {
  vulnerability: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  description: string
  exploit_cost_estimate: string
  likelihood: number
}

export interface OracleManipulationResult {
  manipulation_risk_score: number
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  oracle_type: string
  source_reliability: number
  freshness_score: number
  decentralization_score: number
  vulnerabilities: OracleVulnerability[]
  attack_scenarios: string[]
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 5: Impermanent Loss Calculator ---
export interface ImpermanentLossInput {
  input_data: string
}

export interface ILScenario {
  price_change_pct: number
  impermanent_loss_pct: number
  hold_value: number
  pool_value: number
  break_even_fee_earnings: number
}

export interface ImpermanentLossResult {
  pool_name: string
  token_a: string
  token_b: string
  initial_price_ratio: number
  scenarios: ILScenario[]
  max_il_pct: number
  break_even_daily_volume_ratio: number
  recommendation: string
  findings: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 6: Smart Contract Vulnerability Scanner ---
export interface ContractScannerInput {
  input_data: string
}

export interface VulnFinding {
  category: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  line_hint: string
  confidence: number
  remediation: string
}

export interface ContractScannerResult {
  total_findings: number
  critical: number
  high: number
  medium: number
  low: number
  info: number
  risk_score: number
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  findings: VulnFinding[]
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 7: Governance Attack Analyzer ---
export interface GovernanceInput {
  input_data: string
}

export interface GovernanceVulnerability {
  attack_type: string
  vulnerable: boolean
  risk_score: number
  description: string
  attack_scenario: string
  mitigation: string
}

export interface GovernanceAttackResult {
  overall_governance_risk: number
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  flash_loan_governance: GovernanceVulnerability
  quorum_manipulation: GovernanceVulnerability
  timelock_bypass: GovernanceVulnerability
  proposal_suppression: GovernanceVulnerability
  voting_bribery: GovernanceVulnerability
  recommendations: string[]
  dashboard_data: Record<string, number>
}

// --- Tool 8: DeFi Portfolio Risk Manager ---
export interface PortfolioInput {
  input_data: string
}

export interface PositionRisk {
  protocol: string
  allocation_pct: number
  risk_contribution_pct: number
  var_contribution: number
  liquidation_risk: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface PortfolioRiskResult {
  total_value_usd: number
  portfolio_var_95: number
  portfolio_var_99: number
  portfolio_cvar_95: number
  risk_score: number
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  diversification_score: number
  correlation_risk: 'LOW' | 'MEDIUM' | 'HIGH'
  concentration_risk: 'LOW' | 'MEDIUM' | 'HIGH'
  position_risks: PositionRisk[]
  risk_factors: string[]
  rebalancing_suggestions: string[]
  dashboard_data: Record<string, number>
}

// ==================== SECTION 3 — Analysis Functions ====================

// --- Tool 1: Protocol Risk Scorer ---
function analyzeProtocolRisk(data: string): ProtocolRiskResult {
  const input: {
    protocol_name: string
    tvl_usd: number
    audit_count: number
    has_active_audits: boolean
    governance_model: string
    admin_key_risk: boolean
    oracle_type: string
    composability_dependencies: number
    days_since_launch: number
    exploit_history_count: number
    has_bug_bounty: boolean
    insurance_coverage_pct: number
  } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const findings: string[] = []
  const recommendations: string[] = []
  const critical_risks: string[] = []

  // TVL score (0-100, higher = more secure)
  let tvl_score = 30
  if (input.tvl_usd > 10_000_000_000) { tvl_score = 90 }
  else if (input.tvl_usd > 1_000_000_000) { tvl_score = 75 }
  else if (input.tvl_usd > 100_000_000) { tvl_score = 60 }
  else if (input.tvl_usd > 10_000_000) { tvl_score = 45 }
  else if (input.tvl_usd > 1_000_000) { tvl_score = 30 }
  else { tvl_score = 15 }
  tvl_score += rng.nextInt(-3, 3)
  tvl_score = Math.max(0, Math.min(100, tvl_score))

  if (input.tvl_usd < 10_000_000) {
    findings.push('Low TVL ($' + (input.tvl_usd / 1_000_000).toFixed(1) + 'M) increases vulnerability to price manipulation attacks')
    critical_risks.push('Low TVL enables cheap oracle/price manipulation')
  }

  // Audit score
  let audit_score = 20
  if (input.audit_count >= 5) audit_score = 90
  else if (input.audit_count >= 3) audit_score = 75
  else if (input.audit_count >= 2) audit_score = 60
  else if (input.audit_count >= 1) audit_score = 40
  else { audit_score = 10; critical_risks.push('No external audits completed') }
  if (input.has_active_audits) audit_score = Math.min(100, audit_score + 10)
  if (input.has_bug_bounty) audit_score = Math.min(100, audit_score + 5)
  audit_score += rng.nextInt(-3, 3)
  audit_score = Math.max(0, Math.min(100, audit_score))

  if (input.audit_count === 0) {
    findings.push('Protocol has zero external smart contract audits')
    recommendations.push('Commission at least 2 independent audits from reputable firms')
  }

  // Governance score
  let governance_score = 50
  const gov_model = input.governance_model.toLowerCase()
  if (gov_model.includes('dao') && !input.admin_key_risk) governance_score = 85
  else if (gov_model.includes('dao') && input.admin_key_risk) governance_score = 60
  else if (gov_model.includes('multisig')) governance_score = 50
  else if (gov_model.includes('admin') || gov_model.includes('owner')) { governance_score = 20; critical_risks.push('Single admin key controls protocol') }
  else governance_score = 40

  if (input.admin_key_risk) {
    findings.push('Admin key risk detected — single key compromise could drain protocol')
    critical_risks.push('Admin key compromise = total protocol takeover')
    recommendations.push('Migrate to multi-sig with timelock or renounce admin key')
  }
  governance_score += rng.nextInt(-3, 3)
  governance_score = Math.max(0, Math.min(100, governance_score))

  // Oracle score
  let oracle_score = 50
  const oracle = input.oracle_type.toLowerCase()
  if (oracle.includes('chainlink') && oracle.includes('multiple')) oracle_score = 90
  else if (oracle.includes('chainlink') || oracle.includes('band') || oracle.includes('pyth')) oracle_score = 75
  else if (oracle.includes('uniswap') || oracle.includes('twap')) oracle_score = 55
  else if (oracle.includes('single') || oracle.includes('internal')) { oracle_score = 25; critical_risks.push('Single-source oracle is high manipulation risk') }
  else oracle_score = 45
  oracle_score += rng.nextInt(-3, 3)
  oracle_score = Math.max(0, Math.min(100, oracle_score))

  if (oracle.includes('single') || oracle.includes('internal')) {
    findings.push('Single-source oracle creates a single point of failure and manipulation target')
    recommendations.push('Migrate to decentralized oracle network (Chainlink, Pyth, or Band)')
  }

  // Composability score (fewer dependencies = higher score)
  let composability_score = 80
  if (input.composability_dependencies > 15) { composability_score = 25; critical_risks.push('Excessive composability: >15 deep dependencies') }
  else if (input.composability_dependencies > 10) composability_score = 40
  else if (input.composability_dependencies > 5) composability_score = 60
  else if (input.composability_dependencies > 3) composability_score = 70
  composability_score += rng.nextInt(-3, 3)
  composability_score = Math.max(0, Math.min(100, composability_score))

  if (input.composability_dependencies > 8) {
    findings.push('High composability: ' + input.composability_dependencies + ' dependencies create cascade failure risk')
    recommendations.push('Implement circuit breakers and reduce integration depth')
  }

  // Longevity score
  let longevity_score = 30
  if (input.days_since_launch > 1095) longevity_score = 90
  else if (input.days_since_launch > 730) longevity_score = 75
  else if (input.days_since_launch > 365) longevity_score = 60
  else if (input.days_since_launch > 180) longevity_score = 40
  else longevity_score = 20

  if (input.exploit_history_count > 0) {
    longevity_score -= input.exploit_history_count * 15
    findings.push('Protocol has ' + input.exploit_history_count + ' historical exploit(s) — pattern suggests systemic issues')
    critical_risks.push('Previous exploit(s) indicate unresolved systemic risks')
    longevity_score = Math.max(0, longevity_score)
  }
  longevity_score += rng.nextInt(-3, 3)
  longevity_score = Math.max(0, Math.min(100, longevity_score))

  // Insurance
  if (input.insurance_coverage_pct < 10) {
    findings.push('Minimal insurance coverage (' + input.insurance_coverage_pct + '%) leaves users unprotected')
    recommendations.push('Obtain DeFi insurance coverage (Nexus Mutual, InsurAce)')
  }

  // Overall score (weighted)
  const overall_risk_score = Math.round(
    (100 - tvl_score) * 0.20 +
    (100 - audit_score) * 0.25 +
    (100 - governance_score) * 0.20 +
    (100 - oracle_score) * 0.15 +
    (100 - composability_score) * 0.10 +
    (100 - longevity_score) * 0.10
  )

  let risk_level: ProtocolRiskResult['risk_level']
  if (overall_risk_score >= 65) risk_level = 'CRITICAL'
  else if (overall_risk_score >= 45) risk_level = 'HIGH'
  else if (overall_risk_score >= 25) risk_level = 'MODERATE'
  else risk_level = 'LOW'

  const risk_rank_percentile = Math.min(99, Math.max(1, overall_risk_score + rng.nextInt(-5, 5)))

  if (critical_risks.length === 0 && overall_risk_score < 25) {
    recommendations.push('Protocol demonstrates strong risk profile — continue monitoring')
  }

  const dashboard_data: Record<string, number> = {
    overall_risk_score,
    tvl_score,
    audit_score,
    governance_score,
    oracle_score,
    composability_score,
    longevity_score,
    critical_risks_count: critical_risks.length,
    tvl_millions: Math.round(input.tvl_usd / 1_000_000),
    audit_count: input.audit_count,
    dependencies: input.composability_dependencies,
    exploit_count: input.exploit_history_count,
  }

  return {
    protocol_name: input.protocol_name,
    overall_risk_score,
    risk_level,
    dimensions: {
      tvl_score,
      audit_score,
      governance_score,
      oracle_score,
      composability_score,
      longevity_score,
      findings,
      recommendations,
    },
    critical_risks,
    risk_rank_percentile,
    dashboard_data,
  }
}

// --- Tool 2: Flash Loan Attack Detector ---
function analyzeFlashLoanAttacks(data: string): FlashLoanResult {
  const input: {
    protocol_name: string
    mechanisms: string[]
    oracle_sources: string[]
    has_flash_loan_protection: boolean
    uses_spot_price: boolean
    liquidation_mechanism: string
    governance_token: string
  } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const vectors: FlashLoanVector[] = []
  const mechs = input.mechanisms.map(m => m.toLowerCase())

  // Price manipulation via AMM spot price
  if (input.uses_spot_price || mechs.some(m => m.includes('spot') || m.includes('amm price'))) {
    vectors.push({
      vector_type: 'Spot Price Manipulation',
      severity: 'critical',
      description: 'Protocol uses AMM spot price as oracle. Attacker can borrow massive capital via flash loan, skew spot price, exploit protocol, then repay.',
      attack_steps: [
        'Take flash loan of stablecoins (millions)',
        'Swap large amount on AMM to manipulate spot price',
        'Use inflated/devalued price to borrow more than allowed',
        'Repay flash loan, keep profit',
      ],
      affected_component: 'Pricing oracle / Collateral valuation',
      likelihood: 0.6 + rng.nextFloat(-0.1, 0.1),
      potential_loss_pct: rng.nextFloat(15, 45),
      mitigation: 'Use TWAP oracles or price thresholds. Implement time-weighted average prices.',
    })
  }

  // Single oracle manipulation
  if (input.oracle_sources.length <= 1) {
    vectors.push({
      vector_type: 'Single Oracle Manipulation',
      severity: 'critical',
      description: 'Only one oracle source detected. Flash loan attacker can manipulate single source to control protocol pricing.',
      attack_steps: [
        'Identify single oracle source',
        'Manipulate source price via flash loan + swap',
        'Execute exploit at manipulated price',
        'Profit from price difference on other venues',
      ],
      affected_component: 'Oracle feed',
      likelihood: 0.5 + rng.nextFloat(-0.1, 0.1),
      potential_loss_pct: rng.nextFloat(20, 60),
      mitigation: 'Use 3+ independent oracle sources. Implement median/aggregator with deviation checks.',
    })
  }

  // Oracle stale price
  vectors.push({
    vector_type: 'Stale Oracle Price Exploit',
    severity: mechs.some(m => m.includes('chainlink')) ? 'low' : 'high',
    description: 'Oracle may return stale prices during high volatility. Attacker capitalizes on delayed price updates after flash loan moves market.',
    attack_steps: [
      'Monitor oracle heartbeat/delay',
      'Flash loan to move reference market price',
      'Wait for oracle to lag behind market',
      'Execute profitable trades at stale oracle prices',
    ],
    affected_component: 'Oracle price freshness',
    likelihood: rng.nextFloat(0.2, 0.5),
    potential_loss_pct: rng.nextFloat(5, 25),
    mitigation: 'Implement heartbeat checks. Reject transactions if oracle price is stale. Use multi-source validation.',
  })

  // Liquidation mechanism exploitation
  if (input.liquidation_mechanism && input.liquidation_mechanism.length > 0) {
    vectors.push({
      vector_type: 'Liquidation Front-Running via Flash Loan',
      severity: 'medium',
      description: 'Flash loan enables attackers to trigger and capture liquidations atomically, extracting MEV from liquidation bonuses.',
      attack_steps: [
        'Flash loan to get large capital',
        'Manipulate price to create underwater positions',
        'Liquidate positions for bonus',
        'Repay flash loan with profit from liquidation bonus',
      ],
      affected_component: 'Liquidation engine',
      likelihood: rng.nextFloat(0.3, 0.6),
      potential_loss_pct: rng.nextFloat(2, 10),
      mitigation: 'Implement flash-loan-resistant liquidation. Use TWAP for health factors. Add minimum holding period.',
    })
  }

  // Governance flash loan attack
  if (input.governance_token && !input.has_flash_loan_protection) {
    vectors.push({
      vector_type: 'Flash Loan Governance Attack',
      severity: 'high',
      description: 'Governance token can be borrowed via flash loan to pass malicious proposals without long-term economic commitment.',
      attack_steps: [
        'Flash loan governance tokens',
        'Submit malicious proposal',
        'Vote with borrowed tokens',
        'Execute proposal immediately (if no timelock)',
        'Repay flash loan',
      ],
      affected_component: 'Governance module',
      likelihood: rng.nextFloat(0.2, 0.4),
      potential_loss_pct: rng.nextFloat(30, 100),
      mitigation: 'Implement snapshot voting at block height. Add timelock to proposals. Use quadratic voting or delegation requirements.',
    })
  }

  // Arbitrage between lending pools
  if (mechs.some(m => m.includes('lending') || m.includes('borrow'))) {
    vectors.push({
      vector_type: 'Cross-Protocol Arbitrage Exploit',
      severity: 'medium',
      description: 'Flash loan capital enables simultaneous multi-protocol arbitrage that can drain lending pools through price discrepancies.',
      attack_steps: [
        'Borrow via flash loan on Protocol A',
        'Deposit on Protocol B at different rate',
        'Use borrowed funds to exploit rate mismatch',
        'Repay Protocol A, keep spread',
      ],
      affected_component: 'Lending/Borrowing pool',
      likelihood: rng.nextFloat(0.3, 0.5),
      potential_loss_pct: rng.nextFloat(1, 8),
      mitigation: 'Implement rate limits per block. Use gradual rate updates. Add borrows-per-block cap.',
    })
  }

  // Reentrancy via flash loan callback
  vectors.push({
    vector_type: 'Flash Loan Callback Reentrancy',
    severity: mechs.some(m => m.includes('callback') || m.includes('receiver')) ? 'high' : 'low',
    description: 'Flash loan callbacks can trigger reentrancy if external calls are made before state updates.',
    attack_steps: [
      'Initiate flash loan with malicious callback',
      'Callback re-enters protocol functions',
      'Exploit inconsistent state',
      'Repay flash loan',
    ],
    affected_component: 'Flash loan receiver logic',
    likelihood: rng.nextFloat(0.1, 0.35),
    potential_loss_pct: rng.nextFloat(5, 30),
    mitigation: 'Use checks-effects-interactions pattern. Apply reentrancy guards to all flash loan callbacks.',
  })

  // Count severity levels
  const critical_count = vectors.filter(v => v.severity === 'critical').length
  const high_count = vectors.filter(v => v.severity === 'high').length

  let overall_risk: FlashLoanResult['overall_risk']
  if (critical_count >= 2) overall_risk = 'CRITICAL'
  else if (critical_count >= 1 || high_count >= 2) overall_risk = 'HIGH'
  else if (high_count === 1) overall_risk = 'MODERATE'
  else overall_risk = 'LOW'

  const recommended_mitigations: string[] = []
  if (critical_count > 0) {
    recommended_mitigations.push('URGENT: Address critical severity vectors before production deployment')
    recommended_mitigations.push('Implement multi-source oracle aggregation with deviation thresholds')
  }
  recommended_mitigations.push('Add flash loan attack simulation to test suite')
  recommended_mitigations.push('Implement real-time monitoring for unusual borrowing patterns')
  recommended_mitigations.push('Consider using flash-loan-resistant design patterns')
  if (input.has_flash_loan_protection) {
    recommended_mitigations.push('Current flash loan protection detected — verify coverage of all attack surfaces')
  }

  const dashboard_data: Record<string, number> = {
    total_vectors: vectors.length,
    critical_count,
    high_count,
    overall_risk_numeric: overall_risk === 'CRITICAL' ? 4 : overall_risk === 'HIGH' ? 3 : overall_risk === 'MODERATE' ? 2 : 1,
    oracle_sources: input.oracle_sources.length,
    has_flash_loan_protection: input.has_flash_loan_protection ? 1 : 0,
  }

  return {
    total_vectors: vectors.length,
    critical_count,
    high_count,
    overall_risk,
    vectors,
    recommended_mitigations,
    dashboard_data,
  }
}

// --- Tool 3: TVL Health Monitor ---
function analyzeTVLHealth(data: string): TVLHealthResult {
  const input: {
    current_tvl: number
    historical: Array<{ timestamp_unix: number; value_usd: number }>
    inflows_24h: number
    outflows_24h: number
    top_protocols: Array<{ name: string; tvl_usd: number }>
    chain_distribution: Array<{ chain: string; tvl_usd: number }>
  } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const anomalies: TVLAnomaly[] = []
  const findings: string[] = []
  const recommendations: string[] = []

  // Calculate TVL changes
  let tvl_change_24h_pct = 0
  let tvl_change_7d_pct = 0

  if (input.historical.length >= 2) {
    const sorted = [...input.historical].sort((a, b) => a.timestamp_unix - b.timestamp_unix)
    const now = sorted[sorted.length - 1].value_usd

    const one_day_ago = Date.now() / 1000 - 86400
    const seven_days_ago = Date.now() / 1000 - 7 * 86400

    const day_ago_point = sorted.find(h => h.timestamp_unix >= one_day_ago)
    if (day_ago_point && day_ago_point.value_usd > 0) {
      tvl_change_24h_pct = ((now - day_ago_point.value_usd) / day_ago_point.value_usd) * 100
    }

    const week_ago_point = sorted.find(h => h.timestamp_unix >= seven_days_ago)
    if (week_ago_point && week_ago_point.value_usd > 0) {
      tvl_change_7d_pct = ((now - week_ago_point.value_usd) / week_ago_point.value_usd) * 100
    }
  }

  // Detect 24h anomalies
  if (Math.abs(tvl_change_24h_pct) > 20) {
    anomalies.push({
      type: 'extreme_tvl_movement_24h',
      severity: 'critical',
      description: 'TVL changed ' + tvl_change_24h_pct.toFixed(1) + '% in 24 hours — possible exploit or bank run',
      deviation_pct: tvl_change_24h_pct,
    })
    findings.push('Extreme ' + (tvl_change_24h_pct > 0 ? 'inflow' : 'outflow') + ': ' + tvl_change_24h_pct.toFixed(1) + '% TVL change in 24h')
  } else if (Math.abs(tvl_change_24h_pct) > 10) {
    anomalies.push({
      type: 'significant_tvl_movement_24h',
      severity: 'warning',
      description: 'TVL changed ' + tvl_change_24h_pct.toFixed(1) + '% in 24 hours — monitor for contagion',
      deviation_pct: tvl_change_24h_pct,
    })
    findings.push('Significant ' + (tvl_change_24h_pct > 0 ? 'inflow' : 'outflow') + ': ' + tvl_change_24h_pct.toFixed(1) + '% TVL change in 24h')
  }

  // Volatility index
  let volatility_index = 5
  if (input.historical.length > 5) {
    const returns: number[] = []
    const sorted = [...input.historical].sort((a, b) => a.timestamp_unix - b.timestamp_unix)
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].value_usd > 0) {
        returns.push((sorted[i].value_usd - sorted[i - 1].value_usd) / sorted[i - 1].value_usd * 100)
      }
    }
    if (returns.length > 1) {
      const mean = returns.reduce((s, r) => s + r, 0) / returns.length
      const variance = returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / (returns.length - 1)
      volatility_index = Math.sqrt(variance)
    }
  }
  volatility_index = Math.min(100, volatility_index + rng.nextFloat(-0.5, 0.5))

  if (volatility_index > 15) {
    findings.push('High TVL volatility index: ' + volatility_index.toFixed(1) + '% — indicates instability')
  }

  // Concentration (HHI)
  let concentration_hhi = 0
  if (input.top_protocols.length > 0) {
    const total_top = input.top_protocols.reduce((s, p) => s + p.tvl_usd, 0)
    if (total_top > 0) {
      concentration_hhi = input.top_protocols.reduce((s, p) => {
        const share = (p.tvl_usd / total_top) * 100
        return s + share * share
      }, 0)
    }
  }

  let concentration_level: TVLHealthResult['concentration_level']
  if (concentration_hhi > 2500) { concentration_level = 'HIGH'; findings.push('High TVL concentration (HHI: ' + Math.round(concentration_hhi) + ') — top protocols dominate') }
  else if (concentration_hhi > 1500) concentration_level = 'MEDIUM'
  else concentration_level = 'LOW'

  // Outflow risk
  const net_flow = input.inflows_24h - input.outflows_24h
  let outflow_risk: TVLHealthResult['outflow_risk']
  if (net_flow < -input.current_tvl * 0.1) { outflow_risk = 'HIGH'; findings.push('High outflow risk: net outflow exceeds 10% of TVL') }
  else if (net_flow < -input.current_tvl * 0.05) outflow_risk = 'MEDIUM'
  else outflow_risk = 'LOW'

  if (outflow_risk === 'HIGH') {
    recommendations.push('Implement emergency withdrawal limits to prevent bank runs')
    recommendations.push('Review if outflow is due to exploit response or loss of confidence')
  }

  // Historical deviation
  let historical_deviation = 0
  if (input.historical.length > 10) {
    const sorted = [...input.historical].sort((a, b) => a.timestamp_unix - b.timestamp_unix)
    const values = sorted.map(h => h.value_usd)
    const mean_val = values.reduce((s, v) => s + v, 0) / values.length
    const std_dev = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean_val, 2), 0) / values.length)
    if (mean_val > 0) {
      historical_deviation = (std_dev / mean_val) * 100
    }
  }

  // Chain distribution check
  if (input.chain_distribution.length > 0) {
    const sorted_chains = [...input.chain_distribution].sort((a, b) => b.tvl_usd - a.tvl_usd)
    const top_share = sorted_chains.length > 0 ? (sorted_chains[0].tvl_usd / input.current_tvl) * 100 : 0
    if (top_share > 80) {
      findings.push('Chain concentration: ' + sorted_chains[0].chain + ' holds ' + top_share.toFixed(0) + '% of TVL')
      recommendations.push('Consider cross-chain expansion to reduce single-chain risk')
    }
  }

  // Overall status
  let status: TVLHealthResult['status']
  const critical_anomalies = anomalies.filter(a => a.severity === 'critical').length
  if (critical_anomalies > 0 || outflow_risk === 'HIGH') status = 'CRITICAL'
  else if (anomalies.filter(a => a.severity === 'warning').length > 1 || outflow_risk === 'MEDIUM') status = 'WARNING'
  else status = 'HEALTHY'

  if (findings.length === 0) {
    findings.push('TVL health appears stable — no critical anomalies detected')
  }
  recommendations.push('Continue monitoring TVL metrics for early warning signals')
  recommendations.push('Set up automated alerts for TVL changes exceeding 15% in 24h')

  const dashboard_data: Record<string, number> = {
    current_tvl: Math.round(input.current_tvl),
    tvl_change_24h_pct: Math.round(tvl_change_24h_pct * 100) / 100,
    tvl_change_7d_pct: Math.round(tvl_change_7d_pct * 100) / 100,
    volatility_index: Math.round(volatility_index * 100) / 100,
    concentration_hhi: Math.round(concentration_hhi),
    historical_deviation: Math.round(historical_deviation * 100) / 100,
    anomaly_count: anomalies.length,
    net_flow_24h: Math.round(net_flow),
    status_numeric: status === 'CRITICAL' ? 3 : status === 'WARNING' ? 2 : 1,
  }

  return {
    status,
    current_tvl: input.current_tvl,
    tvl_change_24h_pct: Math.round(tvl_change_24h_pct * 100) / 100,
    tvl_change_7d_pct: Math.round(tvl_change_7d_pct * 100) / 100,
    volatility_index: Math.round(volatility_index * 100) / 100,
    concentration_hhi: Math.round(concentration_hhi),
    concentration_level,
    outflow_risk,
    anomalies,
    findings,
    recommendations,
    dashboard_data,
  }
}

// --- Tool 4: Oracle Manipulation Detector ---
function analyzeOracleManipulation(data: string): OracleManipulationResult {
  const input: {
    oracle_type: string
    sources: Array<{ name: string; type: string; weight: number; reliability: number }>
    heartbeat_seconds: number
    deviation_threshold_pct: number
    has_failover: boolean
    has_circuit_breaker: boolean
    historical_manipulations: number
  } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const vulnerabilities: OracleVulnerability[] = []
  const attack_scenarios: string[] = []
  const recommendations: string[] = []

  const oracle = input.oracle_type.toLowerCase()

  // Source reliability analysis
  const total_sources = input.sources.length
  const avg_reliability = total_sources > 0
    ? input.sources.reduce((s, src) => s + src.reliability, 0) / total_sources
    : 0

  // Source concentration
  let top_source_weight = 0
  if (total_sources > 0) {
    top_source_weight = Math.max(...input.sources.map(s => s.weight))
  }

  // Single source vulnerability
  if (total_sources <= 1) {
    vulnerabilities.push({
      vulnerability: 'Single Source Dependency',
      severity: 'critical',
      description: 'Oracle relies on a single data source. Compromise of this source grants full control over protocol pricing.',
      exploit_cost_estimate: 'Low (manipulate one source)',
      likelihood: 0.6 + rng.nextFloat(-0.1, 0.1),
    })
  }

  // Centralized source
  if (total_sources > 0 && top_source_weight > 70) {
    vulnerabilities.push({
      vulnerability: 'Source Weight Concentration',
      severity: 'high',
      description: 'Top source controls ' + top_source_weight.toFixed(0) + '% of oracle weight. Single point of failure dominates pricing.',
      exploit_cost_estimate: 'Medium (manipulate dominant source)',
      likelihood: 0.5 + rng.nextFloat(-0.1, 0.1),
    })
  }

  // Stale heartbeat
  if (input.heartbeat_seconds > 3600) {
    vulnerabilities.push({
      vulnerability: 'Stale Price Heartbeat',
      severity: 'medium',
      description: 'Oracle updates every ' + Math.round(input.heartbeat_seconds / 60) + ' minutes. Market can move significantly between updates.',
      exploit_cost_estimate: 'Medium (trade at stale price during volatility)',
      likelihood: 0.4 + rng.nextFloat(-0.1, 0.1),
    })
  }

  // Low deviation threshold
  if (input.deviation_threshold_pct < 1) {
    vulnerabilities.push({
      vulnerability: 'Overly Sensitive Deviation Threshold',
      severity: 'low',
      description: 'Deviation threshold of ' + input.deviation_threshold_pct + '% may cause unnecessary rejections during normal volatility.',
      exploit_cost_estimate: 'N/A (availability risk, not direct exploit)',
      likelihood: 0.2,
    })
  } else if (input.deviation_threshold_pct > 10) {
    vulnerabilities.push({
      vulnerability: 'Permissive Deviation Threshold',
      severity: 'high',
      description: 'Deviation threshold of ' + input.deviation_threshold_pct + '% allows significant price manipulation before circuit break.',
      exploit_cost_estimate: 'Medium (wider manipulation window)',
      likelihood: 0.45 + rng.nextFloat(-0.1, 0.1),
    })
  }

  // No failover
  if (!input.has_failover) {
    vulnerabilities.push({
      vulnerability: 'No Failover Oracle',
      severity: 'medium',
      description: 'If primary oracle fails, protocol has no backup pricing source. Could freeze operations or use last known price.',
      exploit_cost_estimate: 'Medium (trigger oracle failure)',
      likelihood: 0.3,
    })
  }

  // No circuit breaker
  if (!input.has_circuit_breaker) {
    vulnerabilities.push({
      vulnerability: 'Missing Circuit Breaker',
      severity: 'high',
      description: 'Protocol can pause operations if price moves beyond safe threshold. Without it, attacks execute fully before intervention.',
      exploit_cost_estimate: 'N/A (amplifies all attacks)',
      likelihood: 0.5 + rng.nextFloat(-0.1, 0.1),
    })
  }

  // Historical manipulations
  if (input.historical_manipulations > 0) {
    vulnerabilities.push({
      vulnerability: 'Historical Manipulation Pattern',
      severity: 'high',
      description: 'This oracle has been manipulated ' + input.historical_manipulations + ' time(s) previously. Attack vectors are proven to exist.',
      exploit_cost_estimate: 'Known (previous attacks documented)',
      likelihood: 0.5 + rng.nextFloat(-0.05, 0.1),
    })
  }

  // Oracle-specific vulnerabilities
  if (oracle.includes('uniswap') || oracle.includes('amm')) {
    vulnerabilities.push({
      vulnerability: 'AMM Spot Price Vulnerability',
      severity: 'critical',
      description: 'AMM spot prices are directly manipulable via large swaps. Flash loans enable zero-capital manipulation.',
      exploit_cost_estimate: 'Low (flash loan capital, no upfront cost)',
      likelihood: 0.7 + rng.nextFloat(-0.1, 0.05),
    })
    attack_scenarios.push('Flash loan drags AMM price, protocol uses manipulated price for lending/liquidations')
  }

  if (oracle.includes('internal') || oracle.includes('self')) {
    vulnerabilities.push({
      vulnerability: 'Internal Oracle Centralization',
      severity: 'critical',
      description: 'Protocol uses its own pricing mechanism. Operator can set arbitrary prices.',
      exploit_cost_estimate: 'Very Low (operator key only)',
      likelihood: 0.35,
    })
  }

  // Freshness score
  const freshness_score = Math.max(0, Math.min(100,
    100 - (input.heartbeat_seconds / 60)
  ))

  // Decentralization score
  let decentralization_score = 20
  if (total_sources >= 5) decentralization_score = 90
  else if (total_sources >= 3) decentralization_score = 70
  else if (total_sources >= 2) decentralization_score = 50
  if (top_source_weight > 80) decentralization_score -= 30
  else if (top_source_weight > 50) decentralization_score -= 15
  decentralization_score = Math.max(0, Math.min(100, decentralization_score + rng.nextInt(-3, 3)))

  // Manipulation risk score
  const critical_vulns = vulnerabilities.filter(v => v.severity === 'critical').length
  const high_vulns = vulnerabilities.filter(v => v.severity === 'high').length
  let manipulation_risk_score = Math.round(
    critical_vulns * 25 + high_vulns * 15 +
    (100 - avg_reliability) * 0.2 +
    (100 - freshness_score) * 0.15 +
    (100 - decentralization_score) * 0.2
  )
  manipulation_risk_score = Math.max(0, Math.min(100, manipulation_risk_score + rng.nextInt(-3, 3)))

  let risk_level: OracleManipulationResult['risk_level']
  if (manipulation_risk_score >= 60) risk_level = 'CRITICAL'
  else if (manipulation_risk_score >= 40) risk_level = 'HIGH'
  else if (manipulation_risk_score >= 20) risk_level = 'MODERATE'
  else risk_level = 'LOW'

  // Generate attack scenarios if none exist
  if (attack_scenarios.length === 0) {
    if (total_sources <= 2) {
      attack_scenarios.push('Manipulate single oracle source → Protocol uses wrong price → Exploit pricing error for profit')
    }
    attack_scenarios.push('Wait for oracle heartbeat lag → Execute trade at stale price → Capture profit from price discrepancy')
  }

  // Recommendations
  if (total_sources < 3) {
    recommendations.push('Add at least 3 independent oracle sources for redundancy')
  }
  if (!input.has_failover) {
    recommendations.push('Implement failover oracle (secondary source if primary fails)')
  }
  if (!input.has_circuit_breaker) {
    recommendations.push('Add circuit breaker that pauses protocol on abnormal price movements')
  }
  if (top_source_weight > 50) {
    recommendations.push('Redistribute oracle weights to prevent single-source dominance')
  }
  if (input.heartbeat_seconds > 600) {
    recommendations.push('Reduce oracle heartbeat to under 10 minutes for fresher prices')
  }
  if (oracle.includes('spot') || oracle.includes('amm')) {
    recommendations.push('Migrate from AMM spot price to TWAP or external oracle')
  }
  if (recommendations.length === 0) {
    recommendations.push('Oracle configuration appears robust — continue monitoring')
  }

  const source_reliability = Math.round(avg_reliability)

  const dashboard_data: Record<string, number> = {
    manipulation_risk_score,
    source_reliability,
    freshness_score: Math.round(freshness_score),
    decentralization_score,
    total_sources,
    top_source_weight: Math.round(top_source_weight),
    heartbeat_seconds: input.heartbeat_seconds,
    deviation_threshold: input.deviation_threshold_pct,
    critical_vulns,
    high_vulns,
    historical_manipulations: input.historical_manipulations,
  }

  return {
    manipulation_risk_score,
    risk_level,
    oracle_type: input.oracle_type,
    source_reliability,
    freshness_score: Math.round(freshness_score),
    decentralization_score,
    vulnerabilities,
    attack_scenarios,
    recommendations,
    dashboard_data,
  }
}

// --- Tool 5: Impermanent Loss Calculator ---
function analyzeImpermanentLoss(data: string): ImpermanentLossResult {
  const input: {
    pool_name: string
    token_a: string
    token_b: string
    initial_price_a_usd: number
    initial_price_b_usd: number
    fee_tier_pct: number
    daily_volume_usd: number
    hold_duration_days: number
  } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const scenarios: ILScenario[] = []
  const findings: string[] = []

  const initial_price_ratio = input.initial_price_a_usd / input.initial_price_b_usd

  // Generate scenarios for different price changes
  const price_changes = [-80, -50, -30, -10, 10, 25, 50, 100, 200, 500]

  for (const price_change_pct of price_changes) {
    const price_ratio = 1 + price_change_pct / 100

    // Standard AMM IL formula: IL = (2 * sqrt(r)) / (1 + r) - 1, where r = price ratio
    const r = price_ratio
    const il_ratio = (2 * Math.sqrt(r)) / (1 + r) - 1
    const impermanent_loss_pct = Math.abs(il_ratio * 100)

    // Assume $1000 initial position
    const initial_value = 1000
    const hold_value = initial_value * (1 + price_change_pct / 100) / 2 + initial_value / 2
    const pool_value = initial_value * (1 - il_ratio)

    // Break-even: how much fee earnings are needed to offset IL?
    const break_even_fee_earnings = initial_value - pool_value

    scenarios.push({
      price_change_pct,
      impermanent_loss_pct: Math.round(impermanent_loss_pct * 100) / 100,
      hold_value: Math.round(hold_value * 100) / 100,
      pool_value: Math.round(pool_value * 100) / 100,
      break_even_fee_earnings: Math.round(break_even_fee_earnings * 100) / 100,
    })
  }

  const max_il_pct = Math.max(...scenarios.map(s => s.impermanent_loss_pct))

  // Break-even daily volume ratio
  const pool_tvl_estimate = input.daily_volume_usd * 0.1 // rough estimate
  const daily_fee_revenue = pool_tvl_estimate * (input.fee_tier_pct / 100) * (input.daily_volume_usd / Math.max(pool_tvl_estimate, 1))
  const break_even_daily_volume_ratio = pool_tvl_estimate > 0 ? (scenarios.find(s => s.price_change_pct === 10)?.break_even_fee_earnings ?? 10) / Math.max(daily_fee_revenue, 0.01) : 999

  // Recommendation
  let recommendation: string
  if (max_il_pct > 20) {
    recommendation = 'HIGH IL RISK: Consider stablecoin or correlated-asset pools to minimize impermanent loss'
  } else if (max_il_pct > 8) {
    recommendation = 'MODERATE IL RISK: Ensure fee earnings sufficiently compensate for expected IL over hold period'
  } else {
    recommendation = 'LOW IL RISK: Pool assets are well-correlated. IL is manageable with adequate fee revenue'
  }

  if (max_il_pct > 15) {
    findings.push('Max IL of ' + max_il_pct.toFixed(2) + '% exceeds 15% threshold — high risk for volatile pairs')
  }
  findings.push('At 100% price increase: IL = ' + (scenarios.find(s => s.price_change_pct === 100)?.impermanent_loss_pct ?? 0).toFixed(2) + '%')
  findings.push('At 50% price decrease: IL = ' + (scenarios.find(s => s.price_change_pct === -50)?.impermanent_loss_pct ?? 0).toFixed(2) + '%')

  if (input.fee_tier_pct < 0.05) {
    findings.push('Low fee tier (' + input.fee_tier_pct + '%) may not compensate for IL in volatile pairs')
  }

  const dashboard_data: Record<string, number> = {
    max_il_pct: Math.round(max_il_pct * 100) / 100,
    initial_price_ratio: Math.round(initial_price_ratio * 100) / 100,
    fee_tier_pct: input.fee_tier_pct,
    daily_volume_usd: input.daily_volume_usd,
    hold_duration_days: input.hold_duration_days,
    break_even_volume_ratio: Math.round(Math.min(99, break_even_daily_volume_ratio * 100)) / 100,
    scenario_count: scenarios.length,
  }

  return {
    pool_name: input.pool_name,
    token_a: input.token_a,
    token_b: input.token_b,
    initial_price_ratio: Math.round(initial_price_ratio * 100) / 100,
    scenarios,
    max_il_pct: Math.round(max_il_pct * 100) / 100,
    break_even_daily_volume_ratio: Math.round(Math.min(99, break_even_daily_volume_ratio) * 100) / 100,
    recommendation,
    findings,
    dashboard_data,
  }
}

// --- Tool 6: Smart Contract Vulnerability Scanner ---
function analyzeContractVulnerabilities(data: string): ContractScannerResult {
  const input: {
    contract_code: string
    language: string
    contract_name: string
  } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const findings: VulnFinding[] = []
  const code = input.contract_code.toLowerCase()
  const lines = input.contract_code.split('\n')

  // Reentrancy detection
  const has_external_call = code.includes('.call{') || code.includes('.call(') || code.includes('.transfer(')
  const has_state_variable = code.includes('balance') || code.includes('totalsupply') || code.includes('mapping')
  const has_reentrancy_guard = code.includes('nonreentrant') || code.includes('reentrancyguard') || code.includes('locked')

  if (has_external_call && has_state_variable && !has_reentrancy_guard) {
    const call_line = lines.findIndex(l => l.includes('.call{') || l.includes('.call('))
    findings.push({
      category: 'Reentrancy',
      severity: 'critical',
      title: 'Potential Reentrancy Vulnerability',
      description: 'External calls made before state updates without reentrancy guard. Classic attack vector exploited in multiple major hacks.',
      line_hint: 'Line ' + (call_line >= 0 ? call_line + 1 : '?') + ': external call detected',
      confidence: 0.82 + rng.nextFloat(-0.05, 0.05),
      remediation: 'Add nonReentrant modifier. Follow checks-effects-interactions pattern. Move state changes before external calls.',
    })
  }

  // Integer overflow/underflow (pre-Solidity 0.8)
  const uses_safemath = code.includes('safemath')
  const pragma_match = input.contract_code.match(/pragma solidity [\^~]?(\d+\.\d+)/)
  const version = pragma_match ? parseFloat(pragma_match[1]) : 0
  const has_arithmetic = (code.match(/[+\-*\/]/g) || []).length > 5

  if (has_arithmetic && !uses_safemath && version > 0 && version < 0.8) {
    findings.push({
      category: 'Integer Overflow/Underflow',
      severity: 'high',
      title: 'Potential Integer Overflow/Underflow Risk',
      description: 'Pre-Solidity 0.8 contract without SafeMath. Arithmetic operations can silently overflow/underflow corrupting state.',
      line_hint: 'Pragma: Solidity ' + (pragma_match ? pragma_match[1] : '<0.8.0'),
      confidence: 0.75 + rng.nextFloat(-0.05, 0.05),
      remediation: 'Upgrade to Solidity >=0.8.0 (built-in overflow checks) or import OpenZeppelin SafeMath.',
    })
  }

  // Access control
  const has_owner = code.includes('owner') || code.includes('onlyowner')
  const has_access_control = code.includes('accesscontrol') || code.includes('onlyrole')
  const has_privileged = code.includes('mint') || code.includes('burn') || code.includes('upgrade') || code.includes('pause')

  if (has_privileged && !has_owner && !has_access_control) {
    findings.push({
      category: 'Access Control',
      severity: 'critical',
      title: 'Missing Access Control on Privileged Functions',
      description: 'Functions like mint, burn, upgrade, or pause are callable by anyone. Full protocol takeover is possible.',
      line_hint: 'Search for mint/burn/upgrade functions',
      confidence: 0.88 + rng.nextFloat(-0.03, 0.03),
      remediation: 'Add onlyOwner or role-based access control (OpenZeppelin AccessControl). Restrict all privileged functions.',
    })
  } else if (has_owner && !has_access_control) {
    findings.push({
      category: 'Access Control',
      severity: 'medium',
      title: 'Single-Owner Pattern',
      description: 'Protocol controlled by single owner address. Key compromise = total protocol compromise.',
      line_hint: 'onlyOwner modifier detected',
      confidence: 0.7 + rng.nextFloat(-0.05, 0.05),
      remediation: 'Migrate to multi-sig (Gnosis Safe) or DAO governance for privileged operations.',
    })
  }

  // Timestamp dependence
  if (code.includes('block.timestamp') || code.includes('now')) {
    const uses_for_randomness = code.includes('random') || code.includes('seed') || code.includes('probability')
    const uses_for_critical = code.includes('deadline') || code.includes('lock') || code.includes('release')

    if (uses_for_randomness) {
      findings.push({
        category: 'Timestamp Dependence',
        severity: 'high',
        title: 'Block Timestamp Used for Randomness',
        description: 'Miners/validators can manipulate block.timestamp by a few seconds. Unfair randomness can be exploited.',
        line_hint: 'block.timestamp or now used in random/seed context',
        confidence: 0.8 + rng.nextFloat(-0.05, 0.05),
        remediation: 'Use Chainlink VRF or verifiable random functions for on-chain randomness.',
      })
    } else if (uses_for_critical) {
      findings.push({
        category: 'Timestamp Dependence',
        severity: 'low',
        title: 'Block Timestamp in Critical Logic',
        description: 'block.timestamp used for deadlines or time locks. Miners can slightly manipulate timing.',
        line_hint: 'block.timestamp used in deadline/lock logic',
        confidence: 0.5 + rng.nextFloat(-0.1, 0.1),
        remediation: 'Use block.number instead of block.timestamp for coarse time tracking. Allow grace periods.',
      })
    }
  }

  // Unchecked return values
  const unchecked_call = code.includes('.call(') && !code.includes('require(') && !code.includes('success')
  if (unchecked_call) {
    findings.push({
      category: 'Unchecked Return Value',
      severity: 'medium',
      title: 'Unchecked External Call Return Value',
      description: 'External call return value not checked. Call can fail silently, corrupting protocol state.',
      line_hint: 'Direct .call() without success check',
      confidence: 0.65 + rng.nextFloat(-0.1, 0.1),
      remediation: 'Check return value: require(success, "Call failed"). Or use SafeERC20 for token transfers.',
    })
  }

  // Delegatecall risk
  if (code.includes('delegatecall')) {
    findings.push({
      category: 'Delegatecall',
      severity: 'high',
      title: 'Delegatecall Usage Detected',
      description: 'delegatecall executes code in context of calling contract. Malicious target can overwrite storage.',
      line_hint: 'delegatecall keyword found',
      confidence: 0.75 + rng.nextFloat(-0.05, 0.05),
      remediation: 'Validate delegatecall target address is trusted. Use proxy patterns from OpenZeppelin.',
    })
  }

  // Gas griefing
  if (code.includes('for ') || code.includes('.length')) {
    findings.push({
      category: 'Gas Griefing',
      severity: 'low',
      title: 'Potential Unbounded Loop',
      description: 'Iterating over unbounded arrays can hit gas limit. Block operations or cause DoS.',
      line_hint: 'Loop or array iteration detected',
      confidence: 0.45 + rng.nextFloat(-0.1, 0.1),
      remediation: 'Add pagination or gas limits to loops. Consider using pull-over-push patterns.',
    })
  }

  // Floating pragma
  if (pragma_match && (pragma_match[0].includes('^') || pragma_match[0].includes('~'))) {
    findings.push({
      category: 'Compiler Version',
      severity: 'info',
      title: 'Floating Pragma Version',
      description: 'Pragma uses ^ or ~ allowing non-deterministic compiler versions. Different bytecodes across builds.',
      line_hint: pragma_match[0],
      confidence: 0.6,
      remediation: 'Pin to exact compiler version (e.g., 0.8.24) for reproducible bytecode.',
    })
  }

  // Count severity
  const critical = findings.filter(f => f.severity === 'critical').length
  const high = findings.filter(f => f.severity === 'high').length
  const medium = findings.filter(f => f.severity === 'medium').length
  const low = findings.filter(f => f.severity === 'low').length
  const info_count = findings.filter(f => f.severity === 'info').length

  const total_findings = findings.length

  // Risk score
  let risk_score = Math.round(
    critical * 30 + high * 15 + medium * 8 + low * 3 + info_count * 1
  )
  risk_score = Math.min(100, risk_score + rng.nextInt(-2, 2))

  let risk_level: ContractScannerResult['risk_level']
  if (risk_score >= 60 || critical >= 2) risk_level = 'CRITICAL'
  else if (risk_score >= 40 || critical >= 1) risk_level = 'HIGH'
  else if (risk_score >= 20) risk_level = 'MODERATE'
  else risk_level = 'LOW'

  const recommendations: string[] = []
  if (critical > 0) recommendations.push('CRITICAL: Address all critical severity findings before deployment')
  if (high > 0) recommendations.push('HIGH: Prioritize high-severity fixes — these are commonly exploited')
  if (!has_reentrancy_guard && has_external_call) recommendations.push('Add reentrancy guard to all functions with external calls')
  if (!has_access_control && has_privileged) recommendations.push('Implement access control immediately — privileged functions are unprotected')
  recommendations.push('Commission an external audit by a reputable security firm')
  recommendations.push('Set up continuous monitoring for known attack patterns')

  const dashboard_data: Record<string, number> = {
    total_findings,
    critical,
    high,
    medium,
    low,
    info: info_count,
    risk_score,
    has_reentrancy_guard: has_reentrancy_guard ? 1 : 0,
    has_access_control: has_access_control ? 1 : 0,
    lines_of_code: lines.length,
  }

  return {
    total_findings,
    critical,
    high,
    medium,
    low,
    info: info_count,
    risk_score,
    risk_level,
    findings,
    recommendations,
    dashboard_data,
  }
}

// --- Tool 7: Governance Attack Analyzer ---
function analyzeGovernanceAttacks(data: string): GovernanceAttackResult {
  const input: {
    voting_model: string
    quorum_pct: number
    timelock_seconds: number
    total_supply: number
    quorum_type: string
    vote_delegation: boolean
    proposal_threshold_pct: number
    voting_period_seconds: number
    flash_loan_protection: boolean
    quadratic_voting: boolean
  } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  // Flash loan governance
  let flash_loan_risk = 40
  if (!input.flash_loan_protection) flash_loan_risk += 30
  if (input.voting_model.toLowerCase().includes('token')) flash_loan_risk += 20
  if (input.timelock_seconds < 3600) flash_loan_risk += 15
  flash_loan_risk += rng.nextInt(-3, 3)
  flash_loan_risk = Math.max(0, Math.min(100, flash_loan_risk))

  const flash_loan_governance: GovernanceVulnerability = {
    attack_type: 'Flash Loan Governance Attack',
    vulnerable: flash_loan_risk > 50,
    risk_score: flash_loan_risk,
    description: 'Attacker can borrow governance tokens via flash loan, pass malicious proposal, and repay.',
    attack_scenario: 'Flash loan tokens -> Submit proposal -> Vote -> Execute -> Repay loan',
    mitigation: 'Use snapshot voting at specific block height. Add token holding period requirement.',
  }

  // Quorum manipulation
  let quorum_risk = 30
  if (input.quorum_pct < 5) quorum_risk += 30
  else if (input.quorum_pct < 10) quorum_risk += 15
  if (input.quorum_type === 'participation') quorum_risk += 10
  if (input.total_supply > 0 && input.timelock_seconds < 86400) quorum_risk += 10
  quorum_risk += rng.nextInt(-3, 3)
  quorum_risk = Math.max(0, Math.min(100, quorum_risk))

  const quorum_manipulation: GovernanceVulnerability = {
    attack_type: 'Quorum Manipulation',
    vulnerable: quorum_risk > 50,
    risk_score: quorum_risk,
    description: 'Quorum can be manipulated through flash loans, vote buying, or coalition formation.',
    attack_scenario: 'Borrow/buy tokens -> Reach quorum -> Pass proposal -> Sell tokens',
    mitigation: 'Implement quorum floor, quadratic voting, or conviction voting to prevent manipulation.',
  }

  // Timelock bypass
  let timelock_risk = 20
  if (input.timelock_seconds === 0) timelock_risk += 50
  else if (input.timelock_seconds < 3600) timelock_risk += 30
  else if (input.timelock_seconds < 86400) timelock_risk += 10
  if (!input.vote_delegation) timelock_risk -= 5
  timelock_risk += rng.nextInt(-3, 3)
  timelock_risk = Math.max(0, Math.min(100, timelock_risk))

  const timelock_bypass: GovernanceVulnerability = {
    attack_type: 'Timelock Bypass',
    vulnerable: timelock_risk > 50,
    risk_score: timelock_risk,
    description: 'Insufficient timelock allows instant execution of malicious proposals with no response window.',
    attack_scenario: 'Pass proposal -> Instant execution -> No time for users to exit',
    mitigation: 'Set minimum 24-48 hour timelock. Allow emergency council to cancel proposals.',
  }

  // Proposal suppression
  let suppression_risk = 30
  if (input.proposal_threshold_pct > 5) suppression_risk += 25
  else if (input.proposal_threshold_pct > 2) suppression_risk += 15
  if (!input.vote_delegation) suppression_risk += 10
  suppression_risk += rng.nextInt(-3, 3)
  suppression_risk = Math.max(0, Math.min(100, suppression_risk))

  const proposal_suppression: GovernanceVulnerability = {
    attack_type: 'Proposal Suppression',
    vulnerable: suppression_risk > 50,
    risk_score: suppression_risk,
    description: 'High proposal threshold prevents legitimate proposals from reaching vote stage.',
    attack_scenario: 'Accumulate tokens -> Block proposals -> Maintain status quo',
    mitigation: 'Lower proposal threshold or introduce delegation. Add optimistic governance for low-risk changes.',
  }

  // Voting bribery
  let bribery_risk = 40
  if (!input.quadratic_voting) bribery_risk += 20
  if (input.voting_model.toLowerCase().includes('token')) bribery_risk += 15
  if (input.vote_delegation) bribery_risk += 10
  bribery_risk += rng.nextInt(-3, 3)
  bribery_risk = Math.max(0, Math.min(100, bribery_risk))

  const voting_bribery: GovernanceVulnerability = {
    attack_type: 'Voting Bribery (Collusion)',
    vulnerable: bribery_risk > 50,
    risk_score: bribery_risk,
    description: 'Token-weighted voting is susceptible to bribery. Vote buyers can accumulate votes without economic stake.',
    attack_scenario: 'Offer yield/rewards for vote delegation -> Accumulate votes -> Pass proposals -> Extract value',
    mitigation: 'Implement quadratic voting or conviction voting. Use hidden vote mechanisms.',
  }

  // Overall governance risk
  const overall_governance_risk = Math.round(
    flash_loan_risk * 0.25 +
    quorum_risk * 0.20 +
    timelock_risk * 0.20 +
    suppression_risk * 0.15 +
    bribery_risk * 0.20
  )

  let risk_level: GovernanceAttackResult['risk_level']
  if (overall_governance_risk >= 60) risk_level = 'CRITICAL'
  else if (overall_governance_risk >= 40) risk_level = 'HIGH'
  else if (overall_governance_risk >= 25) risk_level = 'MODERATE'
  else risk_level = 'LOW'

  const recommendations: string[] = []
  if (!input.flash_loan_protection) recommendations.push('CRITICAL: Add flash loan protection via snapshot block height')
  if (input.timelock_seconds < 86400) recommendations.push('Increase timelock to minimum 24 hours (48h recommended)')
  if (input.quorum_pct < 5) recommendations.push('Increase quorum threshold to resist flash loan governance attacks')
  if (!input.quadratic_voting) recommendations.push('Consider quadratic voting to reduce bribery and whale dominance')
  if (input.proposal_threshold_pct > 3) recommendations.push('Lower proposal threshold to prevent proposal suppression')
  if (!input.vote_delegation) recommendations.push('Enable vote delegation for better governance participation')
  if (recommendations.length === 0) recommendations.push('Governance configuration demonstrates strong resistance to attacks — monitor continuously')

  const dashboard_data: Record<string, number> = {
    overall_governance_risk,
    flash_loan_risk,
    quorum_risk,
    timelock_risk,
    suppression_risk,
    bribery_risk,
    quorum_pct: input.quorum_pct,
    timelock_hours: Math.round(input.timelock_seconds / 3600 * 10) / 10,
    proposal_threshold_pct: input.proposal_threshold_pct,
    flash_loan_protection: input.flash_loan_protection ? 1 : 0,
    quadratic_voting: input.quadratic_voting ? 1 : 0,
  }

  return {
    overall_governance_risk,
    risk_level,
    flash_loan_governance,
    quorum_manipulation,
    timelock_bypass,
    proposal_suppression,
    voting_bribery,
    recommendations,
    dashboard_data,
  }
}

// --- Tool 8: DeFi Portfolio Risk Manager ---
function analyzePortfolioRisk(data: string): PortfolioRiskResult {
  const input: {
    total_value_usd: number
    positions: Array<{
      protocol: string
      allocation_usd: number
      volatility_annual: number
      risk_rating: number
      chain: string
      category: string
    }>
    risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  } = JSON.parse(data)
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const position_risks: PositionRisk[] = []
  const risk_factors: string[] = []
  const rebalancing_suggestions: string[] = []

  // Calculate portfolio metrics
  const total_volatility = input.positions.reduce((sum, p) => {
    const weight = p.allocation_usd / Math.max(input.total_value_usd, 1)
    return sum + p.volatility_annual * weight
  }, 0)

  // Chain concentration
  const chain_totals: Record<string, number> = {}
  const category_totals: Record<string, number> = {}
  for (const pos of input.positions) {
    chain_totals[pos.chain] = (chain_totals[pos.chain] || 0) + pos.allocation_usd
    category_totals[pos.category] = (category_totals[pos.category] || 0) + pos.allocation_usd
  }

  const chain_shares = Object.values(chain_totals).map(v => (v / input.total_value_usd) * 100)
  const max_chain_share = chain_shares.length > 0 ? Math.max(...chain_shares) : 0

  const category_shares = Object.values(category_totals).map(v => (v / input.total_value_usd) * 100)
  const max_category_share = category_shares.length > 0 ? Math.max(...category_shares) : 0

  // Protocol concentration
  const protocol_shares = input.positions.map(p => (p.allocation_usd / input.total_value_usd) * 100)
  const max_protocol_share = protocol_shares.length > 0 ? Math.max(...protocol_shares) : 0

  // Correlation risk estimation
  let correlation_risk: PortfolioRiskResult['correlation_risk']
  const same_category = input.positions.filter(p => {
    const catShares = Object.entries(category_totals)
      .map(([k, v]) => ({ category: k, share: (v / input.total_value_usd) * 100 }))
      .filter(c => c.share > 50)
    return catShares.length > 0
  })
  if (same_category.length > input.positions.length * 0.7) correlation_risk = 'HIGH'
  else if (same_category.length > input.positions.length * 0.4) correlation_risk = 'MEDIUM'
  else correlation_risk = 'LOW'

  if (correlation_risk === 'HIGH') {
    risk_factors.push('High correlation risk: >70% positions in same category move together')
  }

  // Concentration risk
  let concentration_risk: PortfolioRiskResult['concentration_risk']
  if (max_chain_share > 70 || max_protocol_share > 40) { concentration_risk = 'HIGH'; risk_factors.push('High concentration: single chain/protocol exceeds safe limit') }
  else if (max_chain_share > 50 || max_protocol_share > 25) concentration_risk = 'MEDIUM'
  else concentration_risk = 'LOW'

  // Diversification score
  const diversification_score = Math.max(0, Math.min(100,
    (Object.keys(chain_totals).length * 15) +
    (Object.keys(category_totals).length * 15) +
    (Math.min(8, input.positions.length) * 3)
  ))

  // VaR calculation (simplified parametric)
  const z_95 = 1.645
  const z_99 = 2.326
  const sqrt_365 = Math.sqrt(365)

  const portfolio_var_95 = input.total_value_usd * (total_volatility / 100) * z_95 / sqrt_365 * Math.sqrt(30)
  const portfolio_var_99 = input.total_value_usd * (total_volatility / 100) * z_99 / sqrt_365 * Math.sqrt(30)
  const portfolio_cvar_95 = portfolio_var_95 * 1.2 // CVaR is typically ~20% higher

  // Position risk contributions
  for (const pos of input.positions) {
    const weight = pos.allocation_usd / Math.max(input.total_value_usd, 1)
    const risk_contribution = (weight * pos.volatility_annual) / Math.max(total_volatility, 0.01) * 100
    const var_contribution = portfolio_var_95 * weight * (pos.volatility_annual / Math.max(total_volatility, 0.01))

    let liquidation_risk: PositionRisk['liquidation_risk']
    if (pos.risk_rating > 70) liquidation_risk = 'HIGH'
    else if (pos.risk_rating > 40) liquidation_risk = 'MEDIUM'
    else liquidation_risk = 'LOW'

    position_risks.push({
      protocol: pos.protocol,
      allocation_pct: Math.round(weight * 10000) / 100,
      risk_contribution_pct: Math.round(risk_contribution * 100) / 100,
      var_contribution: Math.round(var_contribution),
      liquidation_risk,
    })
  }

  // Total risk score
  let risk_score = Math.round(
    (total_volatility * 0.3) +
    (max_protocol_share * 1.5) +
    (correlation_risk === 'HIGH' ? 25 : correlation_risk === 'MEDIUM' ? 12 : 0) +
    (concentration_risk === 'HIGH' ? 20 : concentration_risk === 'MEDIUM' ? 10 : 0) +
    ((100 - diversification_score) * 0.2)
  )
  risk_score = Math.max(0, Math.min(100, risk_score + rng.nextInt(-3, 3)))

  let risk_level: PortfolioRiskResult['risk_level']
  if (risk_score >= 65) risk_level = 'CRITICAL'
  else if (risk_score >= 45) risk_level = 'HIGH'
  else if (risk_score >= 25) risk_level = 'MODERATE'
  else risk_level = 'LOW'

  // Risk tolerance check
  if (input.risk_tolerance === 'conservative' && risk_level !== 'LOW') {
    risk_factors.push('Portfolio exceeds conservative risk tolerance — consider reducing high-risk positions')
    rebalancing_suggestions.push('Reduce overall portfolio risk to match conservative tolerance')
  } else if (input.risk_tolerance === 'moderate' && risk_level === 'CRITICAL') {
    risk_factors.push('Portfolio significantly exceeds moderate risk tolerance')
    rebalancing_suggestions.push('Reduce concentration in high-risk protocols')
  }

  // Rebalancing suggestions
  if (max_chain_share > 50) {
    const top_chain = Object.entries(chain_totals).sort((a, b) => b[1] - a[1])[0][0]
    rebalancing_suggestions.push('Diversify across chains: ' + top_chain + ' dominates ' + max_chain_share.toFixed(0) + '% of portfolio')
  }
  if (max_protocol_share > 25) {
    const top_protocol = input.positions.sort((a, b) => b.allocation_usd - a.allocation_usd)[0].protocol
    rebalancing_suggestions.push('Reduce concentration: ' + top_protocol + ' is ' + max_protocol_share.toFixed(0) + '% of portfolio')
  }
  if (max_category_share > 50) {
    const top_cat = Object.entries(category_totals).sort((a, b) => b[1] - a[1])[0][0]
    rebalancing_suggestions.push('Diversify categories: ' + top_cat + ' represents ' + max_category_share.toFixed(0) + '%')
  }
  if (diversification_score < 40) {
    rebalancing_suggestions.push('Add positions on different chains and categories to improve diversification')
  }
  if (total_volatility > 80) {
    rebalancing_suggestions.push('Portfolio volatility is very high (' + total_volatility.toFixed(0) + '% annualized) — consider stablecoin yield positions')
  }

  if (rebalancing_suggestions.length === 0) {
    rebalancing_suggestions.push('Portfolio allocation appears well-balanced for risk tolerance')
  }

  const dashboard_data: Record<string, number> = {
    total_value_usd: Math.round(input.total_value_usd),
    portfolio_var_95: Math.round(portfolio_var_95),
    portfolio_var_99: Math.round(portfolio_var_99),
    portfolio_cvar_95: Math.round(portfolio_cvar_95),
    risk_score,
    diversification_score,
    portfolio_volatility: Math.round(total_volatility * 100) / 100,
    position_count: input.positions.length,
    chain_count: Object.keys(chain_totals).length,
    category_count: Object.keys(category_totals).length,
    max_chain_share: Math.round(max_chain_share * 100) / 100,
    max_protocol_share: Math.round(max_protocol_share * 100) / 100,
  }

  return {
    total_value_usd: input.total_value_usd,
    portfolio_var_95: Math.round(portfolio_var_95),
    portfolio_var_99: Math.round(portfolio_var_99),
    portfolio_cvar_95: Math.round(portfolio_cvar_95),
    risk_score,
    risk_level,
    diversification_score,
    correlation_risk,
    concentration_risk,
    position_risks,
    risk_factors,
    rebalancing_suggestions,
    dashboard_data,
  }
}

// ==================== SECTION 4 — Report Formatting Functions ====================

function formatProtocolRiskReport(result: ProtocolRiskResult): string {
  const lines: string[] = []
  lines.push('## Protocol Risk Scorer Report')
  lines.push('')
  lines.push('**Protocol:** ' + result.protocol_name + ' | **Risk Score:** ' + result.overall_risk_score + '/100 | **Risk Level:** ' + result.risk_level)
  lines.push('**Risk Rank Percentile:** ' + result.risk_rank_percentile + '%')
  lines.push('')
  lines.push('### Risk Dimension Scores')
  lines.push('| Dimension | Score | Assessment |')
  lines.push('|-----------|-------|------------|')
  lines.push('| TVL / Economic Security | ' + result.dimensions.tvl_score + '/100 | ' + (result.dimensions.tvl_score >= 70 ? 'Strong' : result.dimensions.tvl_score >= 40 ? 'Moderate' : 'Weak') + ' |')
  lines.push('| Audit Coverage | ' + result.dimensions.audit_score + '/100 | ' + (result.dimensions.audit_score >= 70 ? 'Strong' : result.dimensions.audit_score >= 40 ? 'Moderate' : 'Weak') + ' |')
  lines.push('| Governance | ' + result.dimensions.governance_score + '/100 | ' + (result.dimensions.governance_score >= 70 ? 'Strong' : result.dimensions.governance_score >= 40 ? 'Moderate' : 'Weak') + ' |')
  lines.push('| Oracle Security | ' + result.dimensions.oracle_score + '/100 | ' + (result.dimensions.oracle_score >= 70 ? 'Strong' : result.dimensions.oracle_score >= 40 ? 'Moderate' : 'Weak') + ' |')
  lines.push('| Composability | ' + result.dimensions.composability_score + '/100 | ' + (result.dimensions.composability_score >= 70 ? 'Strong' : result.dimensions.composability_score >= 40 ? 'Moderate' : 'Weak') + ' |')
  lines.push('| Longevity | ' + result.dimensions.longevity_score + '/100 | ' + (result.dimensions.longevity_score >= 70 ? 'Strong' : result.dimensions.longevity_score >= 40 ? 'Moderate' : 'Weak') + ' |')
  lines.push('')

  if (result.critical_risks.length > 0) {
    lines.push('### Critical Risks')
    for (const r of result.critical_risks) lines.push('- **CRITICAL:** ' + r)
    lines.push('')
  }

  lines.push('### Findings')
  for (const f of result.dimensions.findings) lines.push('- ' + f)
  lines.push('')

  lines.push('### Recommendations')
  for (const r of result.dimensions.recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('---')
  lines.push('*Analysis powered by mulberry32-seeded protocol risk model. Deterministic for identical inputs.*')
  return lines.join('\n')
}

function formatFlashLoanReport(result: FlashLoanResult): string {
  const lines: string[] = []
  lines.push('## Flash Loan Attack Detector Report')
  lines.push('')
  lines.push('**Total Vectors Found:** ' + result.total_vectors + ' | **Critical:** ' + result.critical_count + ' | **High:** ' + result.high_count + ' | **Overall Risk:** ' + result.overall_risk)
  lines.push('')

  if (result.vectors.length > 0) {
    lines.push('### Attack Vectors')
    for (const v of result.vectors) {
      lines.push('**' + v.vector_type + '** (' + v.severity.toUpperCase() + ' | Likelihood: ' + (v.likelihood * 100).toFixed(0) + '% | Potential Loss: ' + v.potential_loss_pct.toFixed(1) + '%)')
      lines.push('- ' + v.description)
      lines.push('- **Attack Steps:** ' + v.attack_steps.join(' -> '))
      lines.push('- **Mitigation:** ' + v.mitigation)
      lines.push('')
    }
  }

  lines.push('### Recommended Mitigations')
  for (const m of result.recommended_mitigations) lines.push('- ' + m)
  lines.push('')

  lines.push('---')
  lines.push('*Flash loan attack vectors identified via mulberry32-seeded analysis. Deterministic for identical inputs.*')
  return lines.join('\n')
}

function formatTVLHealthReport(result: TVLHealthResult): string {
  const lines: string[] = []
  lines.push('## TVL Health Monitor Report')
  lines.push('')
  lines.push('**Status:** ' + result.status + ' | **Current TVL:** $' + result.current_tvl.toLocaleString() + ' | **24h Change:** ' + result.tvl_change_24h_pct.toFixed(2) + '% | **7d Change:** ' + result.tvl_change_7d_pct.toFixed(2) + '%')
  lines.push('')
  lines.push('### Health Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Volatility Index | ' + result.volatility_index.toFixed(2) + ' |')
  lines.push('| Concentration (HHI) | ' + result.concentration_hhi + ' (' + result.concentration_level + ') |')
  lines.push('| Outflow Risk | ' + result.outflow_risk + ' |')
  lines.push('| TVL Change 24h | ' + result.tvl_change_24h_pct.toFixed(2) + '% |')
  lines.push('| TVL Change 7d | ' + result.tvl_change_7d_pct.toFixed(2) + '% |')
  lines.push('')

  if (result.anomalies.length > 0) {
    lines.push('### Anomalies Detected')
    for (const a of result.anomalies) {
      lines.push('- [' + a.severity.toUpperCase() + '] ' + a.description)
    }
    lines.push('')
  }

  lines.push('### Findings')
  for (const f of result.findings) lines.push('- ' + f)
  lines.push('')

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('---')
  lines.push('*TVL health analysis powered by mulberry32-seeded monitoring model. Deterministic for identical inputs.*')
  return lines.join('\n')
}

function formatOracleManipulationReport(result: OracleManipulationResult): string {
  const lines: string[] = []
  lines.push('## Oracle Manipulation Detector Report')
  lines.push('')
  lines.push('**Oracle Type:** ' + result.oracle_type + ' | **Manipulation Risk Score:** ' + result.manipulation_risk_score + '/100 | **Risk Level:** ' + result.risk_level)
  lines.push('')
  lines.push('### Oracle Health Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Source Reliability | ' + result.source_reliability + '/100 |')
  lines.push('| Freshness Score | ' + result.freshness_score + '/100 |')
  lines.push('| Decentralization Score | ' + result.decentralization_score + '/100 |')
  lines.push('')

  if (result.vulnerabilities.length > 0) {
    lines.push('### Vulnerabilities')
    for (const v of result.vulnerabilities) {
      lines.push('**' + v.vulnerability + '** (' + v.severity.toUpperCase() + ' | Likelihood: ' + (v.likelihood * 100).toFixed(0) + '%)')
      lines.push('- ' + v.description)
      lines.push('- Exploit Cost: ' + v.exploit_cost_estimate)
      lines.push('')
    }
  }

  if (result.attack_scenarios.length > 0) {
    lines.push('### Attack Scenarios')
    for (const s of result.attack_scenarios) lines.push('- ' + s)
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('---')
  lines.push('*Oracle manipulation analysis powered by mulberry32-seeded model. Deterministic for identical inputs.*')
  return lines.join('\n')
}

function formatImpermanentLossReport(result: ImpermanentLossResult): string {
  const lines: string[] = []
  lines.push('## Impermanent Loss Calculator Report')
  lines.push('')
  lines.push('**Pool:** ' + result.pool_name + ' (' + result.token_a + '/' + result.token_b + ') | **Initial Price Ratio:** ' + result.initial_price_ratio + ' | **Max IL:** ' + result.max_il_pct.toFixed(2) + '%')
  lines.push('')
  lines.push('### Price Change Scenarios')
  lines.push('| Price Change | IL % | Hold Value | Pool Value | Break-Even Fees |')
  lines.push('|--------------|-------|------------|------------|-----------------|')
  for (const s of result.scenarios) {
    lines.push('| ' + s.price_change_pct + '% | ' + s.impermanent_loss_pct.toFixed(2) + '% | $' + s.hold_value.toFixed(2) + ' | $' + s.pool_value.toFixed(2) + ' | $' + s.break_even_fee_earnings.toFixed(2) + ' |')
  }
  lines.push('')

  lines.push('### Key Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Maximum Impermanent Loss | ' + result.max_il_pct.toFixed(2) + '% |')
  lines.push('| Break-Even Daily Volume Ratio | ' + result.break_even_daily_volume_ratio.toFixed(2) + ' |')
  lines.push('')

  lines.push('### Recommendation')
  lines.push(result.recommendation)
  lines.push('')

  lines.push('### Findings')
  for (const f of result.findings) lines.push('- ' + f)
  lines.push('')

  lines.push('---')
  lines.push('*Impermanent loss calculation uses standard AMM formula. Deterministic via mulberry32 seeding.*')
  return lines.join('\n')
}

function formatContractScannerReport(result: ContractScannerResult): string {
  const lines: string[] = []
  lines.push('## Smart Contract Vulnerability Scanner Report')
  lines.push('')
  lines.push('**Total Findings:** ' + result.total_findings + ' | **Risk Score:** ' + result.risk_score + '/100 | **Risk Level:** ' + result.risk_level)
  lines.push('')
  lines.push('### Severity Breakdown')
  lines.push('| Severity | Count |')
  lines.push('|----------|-------|')
  lines.push('| CRITICAL | ' + result.critical + ' |')
  lines.push('| HIGH | ' + result.high + ' |')
  lines.push('| MEDIUM | ' + result.medium + ' |')
  lines.push('| LOW | ' + result.low + ' |')
  lines.push('| INFO | ' + result.info + ' |')
  lines.push('')

  if (result.findings.length > 0) {
    lines.push('### Findings')
    for (const f of result.findings) {
      lines.push('**' + f.title + '** [' + f.severity.toUpperCase() + ' | Confidence: ' + (f.confidence * 100).toFixed(0) + '%]')
      lines.push('- Category: ' + f.category)
      lines.push('- ' + f.description)
      lines.push('- Hint: ' + f.line_hint)
      lines.push('- Fix: ' + f.remediation)
      lines.push('')
    }
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('---')
  lines.push('*Static analysis powered by mulberry32-seeded scanner. Deterministic for identical inputs.*')
  return lines.join('\n')
}

function formatGovernanceAttackReport(result: GovernanceAttackResult): string {
  const lines: string[] = []
  lines.push('## Governance Attack Analyzer Report')
  lines.push('')
  lines.push('**Overall Governance Risk:** ' + result.overall_governance_risk + '/100 | **Risk Level:** ' + result.risk_level)
  lines.push('')

  const vulns = [
    result.flash_loan_governance,
    result.quorum_manipulation,
    result.timelock_bypass,
    result.proposal_suppression,
    result.voting_bribery,
  ]

  lines.push('### Vulnerability Assessment')
  lines.push('| Attack Type | Vulnerable | Risk Score | Description |')
  lines.push('|-------------|------------|------------|-------------|')
  for (const v of vulns) {
    lines.push('| ' + v.attack_type + ' | ' + (v.vulnerable ? 'YES' : 'NO') + ' | ' + v.risk_score + '/100 | ' + v.description.substring(0, 50) + '... |')
  }
  lines.push('')

  for (const v of vulns) {
    if (v.vulnerable) {
      lines.push('**' + v.attack_type + '** (Risk: ' + v.risk_score + '/100)')
      lines.push('- Scenario: ' + v.attack_scenario)
      lines.push('- Mitigation: ' + v.mitigation)
      lines.push('')
    }
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')

  lines.push('---')
  lines.push('*Governance attack analysis powered by mulberry32-seeded model. Deterministic for identical inputs.*')
  return lines.join('\n')
}

function formatPortfolioRiskReport(result: PortfolioRiskResult): string {
  const lines: string[] = []
  lines.push('## DeFi Portfolio Risk Manager Report')
  lines.push('')
  lines.push('**Total Value:** $' + result.total_value_usd.toLocaleString() + ' | **Risk Score:** ' + result.risk_score + '/100 | **Risk Level:** ' + result.risk_level)
  lines.push('')

  lines.push('### Portfolio Risk Metrics')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| VaR 95% (30-day) | $' + result.portfolio_var_95.toLocaleString() + ' |')
  lines.push('| VaR 99% (30-day) | $' + result.portfolio_var_99.toLocaleString() + ' |')
  lines.push('| CVaR 95% (30-day) | $' + result.portfolio_cvar_95.toLocaleString() + ' |')
  lines.push('| Diversification Score | ' + result.diversification_score + '/100 |')
  lines.push('| Correlation Risk | ' + result.correlation_risk + ' |')
  lines.push('| Concentration Risk | ' + result.concentration_risk + ' |')
  lines.push('')

  if (result.position_risks.length > 0) {
    lines.push('### Position Risk Breakdown')
    lines.push('| Protocol | Allocation % | Risk Contribution % | VaR Contribution | Liquidation Risk |')
    lines.push('|----------|---------------|---------------------|-------------------|-----------------|')
    for (const p of result.position_risks.slice(0, 15)) {
      lines.push('| ' + p.protocol + ' | ' + p.allocation_pct.toFixed(1) + '% | ' + p.risk_contribution_pct.toFixed(1) + '% | $' + p.var_contribution.toLocaleString() + ' | ' + p.liquidation_risk + ' |')
    }
    lines.push('')
  }

  if (result.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const f of result.risk_factors) lines.push('- ' + f)
    lines.push('')
  }

  if (result.rebalancing_suggestions.length > 0) {
    lines.push('### Rebalancing Suggestions')
    for (const s of result.rebalancing_suggestions) lines.push('- ' + s)
    lines.push('')
  }

  lines.push('---')
  lines.push('*Portfolio risk analysis powered by mulberry32-seeded VaR model. Deterministic for identical inputs.*')
  return lines.join('\n')
}

// ==================== SECTION 5 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Protocol Risk Scorer
  tools.register(defineTool({
    name: 'protocol_risk_scorer',
    description: 'Multi-dimensional DeFi protocol risk scoring (TVL, audit, governance, oracle, composability, longevity). Returns 0-100 risk score, risk level, dimension breakdown, critical risks, and recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: protocol_name, tvl_usd, audit_count, has_active_audits, governance_model, admin_key_risk, oracle_type, composability_dependencies, days_since_launch, exploit_history_count, has_bug_bounty, insurance_coverage_pct' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatProtocolRiskReport(analyzeProtocolRisk(args.input_data))
    }
  }))

  // Tool 2: Flash Loan Attack Detector
  tools.register(defineTool({
    name: 'flash_loan_attack_detector',
    description: 'Detect flash loan attack vectors in DeFi protocol mechanisms. Analyzes oracle usage, liquidation mechanisms, governance setup for flash loan exploitability. Returns attack vectors with exploitation steps and mitigations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: protocol_name, mechanisms (string[]), oracle_sources (string[]), has_flash_loan_protection, uses_spot_price, liquidation_mechanism, governance_token' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatFlashLoanReport(analyzeFlashLoanAttacks(args.input_data))
    }
  }))

  // Tool 3: TVL Health Monitor
  tools.register(defineTool({
    name: 'tvl_health_monitor',
    description: 'Monitor Total Value Locked (TVL) health with anomaly detection, concentration risk (HHI), outflow risk, volatility index, and historical deviation tracking. Returns status, anomalies, findings, and recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: current_tvl, historical ({timestamp_unix, value_usd}[]), inflows_24h, outflows_24h, top_protocols ({name, tvl_usd}[]), chain_distribution ({chain, tvl_usd}[])' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatTVLHealthReport(analyzeTVLHealth(args.input_data))
    }
  }))

  // Tool 4: Oracle Manipulation Detector
  tools.register(defineTool({
    name: 'oracle_manipulation_detector',
    description: 'Detect oracle manipulation vulnerabilities. Analyzes source count, weight concentration, heartbeat, deviation threshold, failover, circuit breaker, and historical manipulation patterns. Returns manipulation risk score, vulnerabilities, and attack scenarios.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: oracle_type, sources ({name, type, weight, reliability}[]), heartbeat_seconds, deviation_threshold_pct, has_failover, has_circuit_breaker, historical_manipulations' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatOracleManipulationReport(analyzeOracleManipulation(args.input_data))
    }
  }))

  // Tool 5: Impermanent Loss Calculator
  tools.register(defineTool({
    name: 'impermanent_loss_calculator',
    description: 'Calculate impermanent loss for AMM liquidity pools across price scenarios. Returns IL at various price changes, max IL, break-even fee requirements, and pool-specific recommendations.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: pool_name, token_a, token_b, initial_price_a_usd, initial_price_b_usd, fee_tier_pct, daily_volume_usd, hold_duration_days' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatImpermanentLossReport(analyzeImpermanentLoss(args.input_data))
    }
  }))

  // Tool 6: Smart Contract Vulnerability Scanner
  tools.register(defineTool({
    name: 'smart_contract_vulnerability_scanner',
    description: 'Scan smart contract code for vulnerabilities. Detects reentrancy, integer overflow/underflow, access control issues, timestamp dependence, unchecked return values, delegatecall risks, gas griefing, and compiler version issues. Returns findings with severity and remediation.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: contract_code (string), language (string, default "solidity"), contract_name (string)' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatContractScannerReport(analyzeContractVulnerabilities(args.input_data))
    }
  }))

  // Tool 7: Governance Attack Analyzer
  tools.register(defineTool({
    name: 'governance_attack_analyzer',
    description: 'Analyze governance configuration for attack vectors. Detects flash loan governance vulnerability, quorum manipulation, timelock bypass, proposal suppression, and voting bribery risks. Returns per-attack risk scores and mitigation strategies.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: voting_model, quorum_pct, timelock_seconds, total_supply, quorum_type, vote_delegation, proposal_threshold_pct, voting_period_seconds, flash_loan_protection, quadratic_voting' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatGovernanceAttackReport(analyzeGovernanceAttacks(args.input_data))
    }
  }))

  // Tool 8: DeFi Portfolio Risk Manager
  tools.register(defineTool({
    name: 'defi_portfolio_risk_manager',
    description: 'Manage DeFi portfolio risk. Computes VaR/CVaR at multiple confidence levels, concentration risk, correlation risk, diversification score, position-level risk contributions, and generates rebalancing suggestions.',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON: total_value_usd, positions ({protocol, allocation_usd, volatility_annual, risk_rating, chain, category}[]), risk_tolerance ("conservative", "moderate", "aggressive")' }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPortfolioRiskReport(analyzePortfolioRisk(args.input_data))
    }
  }))

  console.log('[dsh-tool-defiriskeng] Loaded v' + VERSION + ' -- DeFi Risk Engineering Toolkit with 8 tools')
  console.log('  Tools: protocol_risk_scorer, flash_loan_attack_detector, tvl_health_monitor, oracle_manipulation_detector, impermanent_loss_calculator, smart_contract_vulnerability_scanner, governance_attack_analyzer, defi_portfolio_risk_manager')
}
