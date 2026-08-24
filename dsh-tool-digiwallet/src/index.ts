/**
 * DSH Digital Wallets & Payments Plugin v0.1.0
 *
 * Digital Wallets & Payments -- wallet security, payment routing,
 * multi-currency support, fraud detection, compliance checking,
 * merchant onboarding, transaction analysis, cross-border payments.
 * 2026: Digital payments $15T+; mobile wallet market $4T+.
 *
 * Features (v1.0.0):
 * - Wallet Security Analyst (security posture & threat analysis)
 * - Payment Routing Optimizer (route selection & cost optimization)
 * - Multi-Currency Manager (FX exposure & currency hedging)
 * - Fraud Detection Wallet (real-time fraud scoring & prevention)
 * - Compliance Checker Payments (AML/KYC/regulatory compliance)
 * - Merchant Onboarding Assessor (merchant risk & onboarding)
 * - Transaction Analyzer (pattern detection & anomaly analysis)
 * - Cross-Border Payment Advisor (international transfer optimization)
 *
 * @module dsh-tool-digiwallet
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-digiwallet'
export const inject = ['tools']

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

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

// ==================== HELPERS ====================

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function rateSecurity(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Strong'
  if (score >= 50) return 'Moderate'
  if (score >= 30) return 'Weak'
  return 'Critical'
}

// ==================== TYPES ====================

// --- Tool 1: Wallet Security Analyst ---
export interface WalletSecurityInput {
  wallet_type?: 'hot' | 'cold' | 'hybrid' | 'custodial' | 'non_custodial'
  two_factor_enabled?: boolean
  biometric_auth?: boolean
  encryption_level?: 'none' | 'basic' | 'aes256' | 'end_to_end'
  backup_recovery?: boolean
  audit_log_enabled?: boolean
  suspicious_activity?: string[]
  daily_limit_usd?: number
  connected_apps?: number
  last_security_audit_days?: number
}

export interface SecurityThreat {
  threat: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  mitigation: string
}

export interface WalletSecurityResult {
  security_score: number
  security_rating: string
  threats: SecurityThreat[]
  compliance_gaps: string[]
  recommendations: string[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  summary: string
}

// --- Tool 2: Payment Routing Optimizer ---
export interface PaymentRoutingInput {
  amount_usd?: number
  source_country?: string
  target_country?: string
  currency_pair?: string
  urgency?: 'instant' | 'same_day' | 'next_day' | 'standard'
  available_routes?: string[]
  cost_sensitivity?: 'low' | 'medium' | 'high'
  reliability_threshold?: number
}

export interface RouteOption {
  route: string
  estimated_cost_usd: number
  estimated_time: string
  reliability_pct: number
  recommended: boolean
  notes: string
}

export interface PaymentRoutingResult {
  optimal_route: string
  routes: RouteOption[]
  total_savings_usd: number
  cost_breakdown: Record<string, number>
  speed_vs_cost: string
  recommendations: string[]
  summary: string
}

// --- Tool 3: Multi-Currency Manager ---
export interface MultiCurrencyInput {
  base_currency?: string
  held_currencies?: string[]
  target_allocation?: Record<string, number>
  fx_volatility_tolerance?: 'low' | 'medium' | 'high'
  hedging_strategy?: 'none' | 'forward' | 'options' | 'natural'
  monthly_fx_volume_usd?: number
  preferred_stablecoins?: string[]
}

export interface CurrencyPosition {
  currency: string
  current_pct: number
  target_pct: number
  adjustment: string
  risk_contribution: string
}

export interface MultiCurrencyResult {
  portfolio_score: number
  positions: CurrencyPosition[]
  hedge_effectiveness_pct: number
  fx_exposure_risk: 'low' | 'medium' | 'high'
  rebalancing_actions: string[]
  stablecoin_recommendation: string
  summary: string
}

// --- Tool 4: Fraud Detection Wallet ---
export interface FraudDetectionInput {
  transaction_amount_usd?: number
  transaction_type?: 'purchase' | 'transfer' | 'withdrawal' | 'deposit' | 'merchant_payment'
  merchant_category?: string
  user_country?: string
  device_trust_score?: number
  velocity_check?: 'pass' | 'warn' | 'fail'
  unusual_pattern?: boolean
  ip_risk_score?: number
  account_age_days?: number
  previous_fraud_flags?: number
}

export interface FraudIndicator {
  indicator: string
  risk_weight: number
  triggered: boolean
  description: string
}

export interface FraudDetectionResult {
  fraud_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  indicators: FraudIndicator[]
  action: 'allow' | 'review' | 'block' | 'escalate'
  confidence_pct: number
  recommendations: string[]
  summary: string
}

// --- Tool 5: Compliance Checker Payments ---
export interface ComplianceInput {
  jurisdiction?: string[]
  transaction_volume_usd?: number
  customer_type?: 'individual' | 'business' | 'both'
  kyc_level?: 'none' | 'basic' | 'enhanced' | 'full'
  aml_program?: boolean
  sanctions_screening?: boolean
  transaction_monitoring?: boolean
  record_retention_years?: number
  data_residency?: string[]
  regulatory_frameworks?: string[]
}

export interface ComplianceGap {
  requirement: string
  status: 'compliant' | 'partial' | 'non_compliant'
  regulation: string
  remediation: string
}

export interface ComplianceResult {
  overall_compliance_pct: number
  compliance_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  gaps: ComplianceGap[]
  risk_exposure: 'low' | 'medium' | 'high' | 'critical'
  upcoming_deadlines: string[]
  recommendations: string[]
  summary: string
}

// --- Tool 6: Merchant Onboarding Assessor ---
export interface MerchantOnboardingInput {
  business_name?: string
  business_type?: string
  country?: string
  monthly_volume_usd?: number
  avg_transaction_usd?: number
  business_age_months?: number
  existing_chargebacks_pct?: number
  high_risk_industry?: boolean
  website_url?: string
  beneficial_owners?: number
  financial_statements_available?: boolean
}

export interface MerchantRiskFactor {
  factor: string
  risk_level: 'low' | 'medium' | 'high'
  score_impact: number
  notes: string
}

export interface MerchantOnboardingResult {
  approval_recommendation: 'approve' | 'review' | 'decline'
  risk_score: number
  risk_tier: 'tier1' | 'tier2' | 'tier3' | 'tier4'
  risk_factors: MerchantRiskFactor[]
  suggested_limits: { daily_usd: number; monthly_usd: number; per_transaction_usd: number }
  onboarding_steps: string[]
  monitoring_frequency: string
  summary: string
}

// --- Tool 7: Transaction Analyzer ---
export interface TransactionAnalyzerInput {
  transactions?: Array<{ amount_usd: number; type: string; merchant: string; timestamp: string; country: string }>
  analysis_period_days?: number
  anomaly_threshold?: number
  category_breakdown?: boolean
  trend_analysis?: boolean
  peer_comparison?: boolean
}

export interface TransactionPattern {
  pattern: string
  frequency: number
  avg_amount_usd: number
  trend: 'increasing' | 'stable' | 'decreasing'
  anomaly_score: number
}

export interface TransactionAnalyzerResult {
  total_transactions: number
  total_volume_usd: number
  patterns: TransactionPattern[]
  anomalies_detected: number
  top_merchants: string[]
  spending_trend: 'increasing' | 'stable' | 'decreasing'
  risk_flags: string[]
  insights: string[]
  summary: string
}

// --- Tool 8: Cross-Border Payment Advisor ---
export interface CrossBorderInput {
  send_amount_usd?: number
  send_currency?: string
  receive_currency?: string
  send_country?: string
  receive_country?: string
  transfer_method?: 'bank' | 'wallet' | 'remittance' | 'card' | 'crypto'
  speed_preference?: 'fastest' | 'cheapest' | 'balanced'
  regulatory_constraints?: string[]
}

export interface TransferOption {
  method: string
  provider: string
  total_cost_usd: number
  exchange_rate_markup_pct: number
  estimated_delivery: string
  transparency_score: number
  recommended: boolean
}

export interface CrossBorderResult {
  optimal_method: string
  transfer_options: TransferOption[]
  total_cost_range: { min: number; max: number }
  regulatory_notes: string[]
  corridor_risk: 'low' | 'medium' | 'high'
  savings_vs_traditional: number
  recommendations: string[]
  summary: string
}

// ==================== TOOL 1: WALLET SECURITY ANALYST ====================

export function analyzeWalletSecurity(input: WalletSecurityInput): WalletSecurityResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const threats: SecurityThreat[] = []
  let securityScore = 100

  // Two-factor check
  if (!input.two_factor_enabled) {
    securityScore -= 20
    threats.push({ threat: 'No 2FA/MFA', severity: 'critical', mitigation: 'Enable TOTP or hardware key 2FA immediately' })
  }

  // Biometric check
  if (!input.biometric_auth) {
    securityScore -= 10
    threats.push({ threat: 'No biometric auth', severity: 'medium', mitigation: 'Enable fingerprint or face recognition' })
  }

  // Encryption level
  const encPenalty: Record<string, number> = { none: 30, basic: 15, aes256: 0, end_to_end: 0 }
  const enc = input.encryption_level || 'none'
  securityScore -= encPenalty[enc] || 0
  if (enc === 'none' || enc === 'basic') {
    threats.push({ threat: 'Weak encryption: ' + enc, severity: 'high', mitigation: 'Upgrade to AES-256 or end-to-end encryption' })
  }

  // Backup & recovery
  if (!input.backup_recovery) {
    securityScore -= 15
    threats.push({ threat: 'No backup/recovery', severity: 'high', mitigation: 'Set up seed phrase backup and social recovery' })
  }

  // Audit log
  if (!input.audit_log_enabled) {
    securityScore -= 5
    threats.push({ threat: 'No audit logging', severity: 'medium', mitigation: 'Enable comprehensive transaction audit logging' })
  }

  // Security audit age
  const auditAge = input.last_security_audit_days || 365
  if (auditAge > 180) {
    securityScore -= 10
    threats.push({ threat: 'Stale security audit (' + auditAge + ' days)', severity: 'medium', mitigation: 'Schedule quarterly security audits' })
  }

  // Suspicious activity
  const suspicious = input.suspicious_activity || []
  if (suspicious.length > 0) {
    securityScore -= suspicious.length * 5
    threats.push({ threat: suspicious.length + ' suspicious activities detected', severity: 'high', mitigation: 'Review and resolve all flagged activities' })
  }

  // Connected apps
  const connected = input.connected_apps || 0
  if (connected > 5) {
    securityScore -= 5
    threats.push({ threat: connected + ' connected apps increase attack surface', severity: 'low', mitigation: 'Revoke unused app permissions' })
  }

  securityScore = clamp(securityScore, 0, 100)

  const recommendations: string[] = []
  if (!input.two_factor_enabled) recommendations.push('Enable 2FA immediately')
  if (enc === 'none' || enc === 'basic') recommendations.push('Upgrade encryption to AES-256 minimum')
  if (!input.backup_recovery) recommendations.push('Set up secure seed phrase backup')
  if (auditAge > 90) recommendations.push('Conduct security audit within 30 days')
  if (connected > 3) recommendations.push('Audit and revoke unnecessary app permissions')
  if (suspicious.length > 0) recommendations.push('Investigate and clear all suspicious activity flags')

  const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
    securityScore >= 80 ? 'low' : securityScore >= 60 ? 'medium' : securityScore >= 40 ? 'high' : 'critical'

  const complianceGaps: string[] = []
  if (!input.audit_log_enabled) complianceGaps.push('Missing audit trail (PCI-DSS requirement)')
  if (enc !== 'aes256' && enc !== 'end_to_end') complianceGaps.push('Insufficient encryption standard')
  if (!input.two_factor_enabled) complianceGaps.push('No strong customer authentication (PSD2 SCA)')

  return {
    security_score: securityScore,
    security_rating: rateSecurity(securityScore),
    threats,
    compliance_gaps: complianceGaps,
    recommendations,
    risk_level: riskLevel,
    summary: 'Wallet security score: ' + securityScore + '/100 (' + rateSecurity(securityScore) + '). ' +
      threats.length + ' threat(s) identified. Risk level: ' + riskLevel + '.'
  }
}

export function formatWalletSecurityReport(input: WalletSecurityInput, result: WalletSecurityResult): string {
  const lines: string[] = []
  lines.push('# Wallet Security Analysis')
  lines.push('Wallet Type: ' + (input.wallet_type || 'unknown') + ' | Security Score: ' + result.security_score + '/100 (' + result.security_rating + ')')
  lines.push('Risk Level: ' + result.risk_level.toUpperCase() + ' | Threats Found: ' + result.threats.length)
  lines.push('')
  lines.push('## Threats')
  for (const t of result.threats) {
    const icon = t.severity === 'critical' ? '[CRITICAL]' : t.severity === 'high' ? '[HIGH]' : t.severity === 'medium' ? '[MEDIUM]' : '[LOW]'
    lines.push('- ' + icon + ' ' + t.threat + ' -> ' + t.mitigation)
  }
  if (result.threats.length === 0) lines.push('- No threats detected')
  lines.push('')
  lines.push('## Compliance Gaps')
  for (const g of result.compliance_gaps) {
    lines.push('- ' + g)
  }
  if (result.compliance_gaps.length === 0) lines.push('- No compliance gaps')
  lines.push('')
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('---')
  lines.push('2026: Mobile wallet market $4T+. Security is the #1 factor for wallet adoption.')
  return lines.join('\n')
}

// ==================== TOOL 2: PAYMENT ROUTING OPTIMIZER ====================

export function optimizePaymentRouting(input: PaymentRoutingInput): PaymentRoutingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const amount = input.amount_usd || 1000
  const urgency = input.urgency || 'standard'
  const routes = input.available_routes || ['SWIFT', 'SEPA', 'ACH', 'RealTime', 'CardNetwork']
  const costSensitivity = input.cost_sensitivity || 'medium'

  const routeOptions: RouteOption[] = []
  const urgencyMultiplier: Record<string, number> = { instant: 3.0, same_day: 2.0, next_day: 1.5, standard: 1.0 }

  for (const route of routes) {
    const baseCostRate: Record<string, number> = { SWIFT: 0.015, SEPA: 0.005, ACH: 0.002, RealTime: 0.008, CardNetwork: 0.025 }
    const baseReliability: Record<string, number> = { SWIFT: 99.5, SEPA: 99.9, ACH: 99.8, RealTime: 99.7, CardNetwork: 99.2 }
    const baseTime: Record<string, string> = { SWIFT: '1-3 days', SEPA: 'Same day', ACH: '1-2 days', RealTime: 'Instant', CardNetwork: 'Instant' }

    const costRate = (baseCostRate[route] || 0.01) * urgencyMultiplier[urgency]
    const cost = Math.max(1, amount * costRate + rng.nextFloat(0, 5))
    const reliability = Math.min(99.99, (baseReliability[route] || 99) + rng.nextFloat(-0.5, 0.3))

    routeOptions.push({
      route,
      estimated_cost_usd: parseFloat(cost.toFixed(2)),
      estimated_time: baseTime[route] || '1-2 days',
      reliability_pct: parseFloat(reliability.toFixed(2)),
      recommended: false,
      notes: ''
    })
  }

  // Mark optimal route based on cost sensitivity
  if (costSensitivity === 'high') {
    const cheapest = routeOptions.reduce((a, b) => a.estimated_cost_usd < b.estimated_cost_usd ? a : b)
    cheapest.recommended = true
    cheapest.notes = 'Lowest cost option'
  } else if (costSensitivity === 'low') {
    const fastest = routeOptions.reduce((a, b) => a.reliability_pct > b.reliability_pct ? a : b)
    fastest.recommended = true
    fastest.notes = 'Highest reliability option'
  } else {
    const bestValue = routeOptions.reduce((a, b) =>
      (a.reliability_pct / a.estimated_cost_usd) > (b.reliability_pct / b.estimated_cost_usd) ? a : b)
    bestValue.recommended = true
    bestValue.notes = 'Best value (reliability/cost)'
  }

  const optimal = routeOptions.find(r => r.recommended) || routeOptions[0]
  const maxCost = Math.max(...routeOptions.map(r => r.estimated_cost_usd))
  const savings = parseFloat((maxCost - optimal.estimated_cost_usd).toFixed(2))

  const costBreakdown: Record<string, number> = {}
  for (const r of routeOptions) {
    costBreakdown[r.route] = r.estimated_cost_usd
  }

  const recommendations: string[] = []
  if (amount > 10000) recommendations.push('Consider splitting large payments across routes for redundancy')
  if (urgency === 'instant') recommendations.push('For non-urgent payments, standard routing saves 50-70%')
  if (routeOptions.length < 3) recommendations.push('Add backup routes to improve reliability')
  recommendations.push('Optimal route: ' + optimal.route + ' at $' + optimal.estimated_cost_usd)

  return {
    optimal_route: optimal.route,
    routes: routeOptions,
    total_savings_usd: savings,
    cost_breakdown: costBreakdown,
    speed_vs_cost: urgency === 'instant' ? 'Speed prioritized (2-3x cost)' : 'Cost-optimized routing',
    recommendations,
    summary: 'Optimal route: ' + optimal.route + ' | Cost: $' + optimal.estimated_cost_usd +
      ' | Savings: $' + savings + ' | Reliability: ' + optimal.reliability_pct + '%'
  }
}

export function formatPaymentRoutingReport(input: PaymentRoutingInput, result: PaymentRoutingResult): string {
  const lines: string[] = []
  lines.push('# Payment Routing Optimization')
  lines.push('Amount: $' + (input.amount_usd || 0).toLocaleString() + ' | Urgency: ' + (input.urgency || 'standard') + ' | Cost Sensitivity: ' + (input.cost_sensitivity || 'medium'))
  lines.push('Optimal Route: ' + result.optimal_route + ' | Total Savings: $' + result.total_savings_usd)
  lines.push('')
  lines.push('## Route Comparison')
  for (const r of result.routes) {
    const marker = r.recommended ? ' [RECOMMENDED]' : ''
    lines.push('- ' + r.route + marker + ': $' + r.estimated_cost_usd + ' | ' + r.estimated_time + ' | ' + r.reliability_pct + '% reliable')
    if (r.notes) lines.push('  -> ' + r.notes)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const rec of result.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('---')
  lines.push('2026: Digital payments exceed $15T globally. Smart routing saves 15-40% on transaction costs.')
  return lines.join('\n')
}

// ==================== TOOL 3: MULTI-CURRENCY MANAGER ====================

export function manageMultiCurrency(input: MultiCurrencyInput): MultiCurrencyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const heldCurrencies = input.held_currencies || ['USD', 'EUR', 'GBP']
  const targetAlloc = input.target_allocation || {}
  const volatilityTolerance = input.fx_volatility_tolerance || 'medium'
  const hedgingStrategy = input.hedging_strategy || 'none'
  const monthlyVolume = input.monthly_fx_volume_usd || 10000

  const positions: CurrencyPosition[] = []
  const equalWeight = parseFloat((100 / heldCurrencies.length).toFixed(1))

  for (const currency of heldCurrencies) {
    const target = targetAlloc[currency] || equalWeight
    const drift = rng.nextFloat(-8, 8)
    const current = parseFloat(Math.max(0, target + drift).toFixed(1))
    const diff = current - target
    const adjustment = diff > 5 ? 'Reduce ' + Math.abs(diff).toFixed(1) + '%' : diff < -5 ? 'Increase ' + Math.abs(diff).toFixed(1) + '%' : 'Hold'

    positions.push({
      currency,
      current_pct: current,
      target_pct: target,
      adjustment,
      risk_contribution: currency === 'USD' || currency === 'EUR' ? 'low' : currency.includes('BTC') || currency.includes('ETH') ? 'high' : 'medium'
    })
  }

  // Hedge effectiveness
  const hedgeBase: Record<string, number> = { none: 0, forward: 75, options: 85, natural: 50 }
  const hedgeEffectiveness = clamp((hedgeBase[hedgingStrategy] || 0) + rng.nextFloat(-5, 5), 0, 100)

  // FX exposure risk
  const volatileCount = positions.filter(p => p.risk_contribution === 'high').length
  const fxExposure: 'low' | 'medium' | 'high' =
    volatileCount === 0 && hedgingStrategy !== 'none' ? 'low' :
    volatileCount <= 1 ? 'medium' : 'high'

  // Rebalancing actions
  const rebalancing: string[] = []
  for (const p of positions) {
    if (p.adjustment !== 'Hold') {
      rebalancing.push(p.currency + ': ' + p.adjustment + ' (current ' + p.current_pct + '%, target ' + p.target_pct + '%)')
    }
  }
  if (rebalancing.length === 0) rebalancing.push('Portfolio is within tolerance bands -- no rebalancing needed')

  // Stablecoin recommendation
  const preferredStablecoins = input.preferred_stablecoins || ['USDC', 'USDT']
  const stableRec = monthlyVolume > 50000
    ? 'High volume: Use ' + preferredStablecoins[0] + ' for settlements + hold 30% in yield-bearing stablecoins'
    : 'Standard: Maintain 20% allocation in ' + preferredStablecoins.join('/') + ' for liquidity'

  // Portfolio score
  const driftPenalty = positions.reduce((sum, p) => sum + Math.abs(p.current_pct - p.target_pct), 0)
  const hedgeBonus = hedgeEffectiveness * 0.2
  const portfolioScore = clamp(Math.round(100 - driftPenalty * 0.5 + hedgeBonus), 0, 100)

  const recommendations: string[] = []
  if (hedgingStrategy === 'none') recommendations.push('Implement hedging strategy to reduce FX risk')
  if (volatileCount > 1) recommendations.push('Reduce exposure to volatile currencies')
  if (driftPenalty > 20) recommendations.push('Rebalance portfolio -- drift exceeds threshold')

  return {
    portfolio_score: portfolioScore,
    positions,
    hedge_effectiveness_pct: parseFloat(hedgeEffectiveness.toFixed(1)),
    fx_exposure_risk: fxExposure,
    rebalancing_actions: rebalancing,
    stablecoin_recommendation: stableRec,
    summary: 'Multi-currency portfolio score: ' + portfolioScore + '/100. FX exposure: ' + fxExposure +
      '. Hedge effectiveness: ' + hedgeEffectiveness.toFixed(1) + '%. ' + rebalancing.length + ' rebalancing action(s).'
  }
}

export function formatMultiCurrencyReport(input: MultiCurrencyInput, result: MultiCurrencyResult): string {
  const lines: string[] = []
  lines.push('# Multi-Currency Management')
  lines.push('Base Currency: ' + (input.base_currency || 'USD') + ' | Portfolio Score: ' + result.portfolio_score + '/100')
  lines.push('Hedging Strategy: ' + (input.hedging_strategy || 'none') + ' | Hedge Effectiveness: ' + result.hedge_effectiveness_pct + '%')
  lines.push('FX Exposure Risk: ' + result.fx_exposure_risk.toUpperCase())
  lines.push('')
  lines.push('## Currency Positions')
  for (const p of result.positions) {
    lines.push('- ' + p.currency + ': ' + p.current_pct + '% (target ' + p.target_pct + '%) -- ' + p.adjustment + ' [' + p.risk_contribution + ' risk]')
  }
  lines.push('')
  lines.push('## Rebalancing Actions')
  for (const a of result.rebalancing_actions) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push('## Stablecoin Strategy')
  lines.push('- ' + result.stablecoin_recommendation)
  lines.push('')
  lines.push('---')
  lines.push('2026: Multi-currency wallets are standard. FX volatility management is critical for global payment operations.')
  return lines.join('\n')
}

// ==================== TOOL 4: FRAUD DETECTION WALLET ====================

export function detectWalletFraud(input: FraudDetectionInput): FraudDetectionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const indicators: FraudIndicator[] = []
  let fraudScore = 0

  // Amount-based risk
  const amount = input.transaction_amount_usd || 0
  if (amount > 10000) { fraudScore += 25; indicators.push({ indicator: 'Large transaction amount', risk_weight: 25, triggered: true, description: 'Amount $' + amount.toLocaleString() + ' exceeds $10K threshold' }) }
  else if (amount > 5000) { fraudScore += 15; indicators.push({ indicator: 'Elevated transaction amount', risk_weight: 15, triggered: true, description: 'Amount $' + amount.toLocaleString() + ' exceeds $5K threshold' }) }
  else { indicators.push({ indicator: 'Normal transaction amount', risk_weight: 0, triggered: false, description: 'Amount within normal range' }) }

  // Device trust
  const deviceTrust = input.device_trust_score ?? 100
  if (deviceTrust < 40) { fraudScore += 20; indicators.push({ indicator: 'Low device trust', risk_weight: 20, triggered: true, description: 'Device trust score: ' + deviceTrust + '/100' }) }
  else if (deviceTrust < 70) { fraudScore += 10; indicators.push({ indicator: 'Moderate device trust', risk_weight: 10, triggered: true, description: 'Device trust score: ' + deviceTrust + '/100' }) }

  // Velocity check
  const velocity = input.velocity_check || 'pass'
  if (velocity === 'fail') { fraudScore += 25; indicators.push({ indicator: 'Velocity check failed', risk_weight: 25, triggered: true, description: 'Transaction velocity exceeds limits' }) }
  else if (velocity === 'warn') { fraudScore += 10; indicators.push({ indicator: 'Velocity warning', risk_weight: 10, triggered: true, description: 'Transaction velocity approaching limits' }) }

  // IP risk
  const ipRisk = input.ip_risk_score || 0
  if (ipRisk > 70) { fraudScore += 15; indicators.push({ indicator: 'High IP risk', risk_weight: 15, triggered: true, description: 'IP risk score: ' + ipRisk + '/100' }) }
  else if (ipRisk > 40) { fraudScore += 5; indicators.push({ indicator: 'Moderate IP risk', risk_weight: 5, triggered: true, description: 'IP risk score: ' + ipRisk + '/100' }) }

  // Account age
  const accountAge = input.account_age_days || 365
  if (accountAge < 7) { fraudScore += 20; indicators.push({ indicator: 'New account', risk_weight: 20, triggered: true, description: 'Account age: ' + accountAge + ' days' }) }
  else if (accountAge < 30) { fraudScore += 10; indicators.push({ indicator: 'Young account', risk_weight: 10, triggered: true, description: 'Account age: ' + accountAge + ' days' }) }

  // Previous fraud flags
  const prevFlags = input.previous_fraud_flags || 0
  if (prevFlags > 0) { fraudScore += prevFlags * 10; indicators.push({ indicator: 'Previous fraud flags', risk_weight: prevFlags * 10, triggered: true, description: prevFlags + ' previous fraud flag(s) on record' }) }

  // Unusual pattern
  if (input.unusual_pattern) { fraudScore += 15; indicators.push({ indicator: 'Unusual pattern detected', risk_weight: 15, triggered: true, description: 'Transaction pattern deviates from user baseline' }) }

  fraudScore = clamp(fraudScore, 0, 100)

  const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
    fraudScore >= 75 ? 'critical' : fraudScore >= 50 ? 'high' : fraudScore >= 25 ? 'medium' : 'low'

  const action: 'allow' | 'review' | 'block' | 'escalate' =
    fraudScore >= 75 ? 'block' : fraudScore >= 50 ? 'escalate' : fraudScore >= 25 ? 'review' : 'allow'

  const confidence = clamp(60 + rng.nextInt(0, 30) + (indicators.filter(i => i.triggered).length * 3), 60, 99)

  const recommendations: string[] = []
  if (action === 'block') recommendations.push('BLOCK: Transaction exceeds fraud threshold. Manual review required.')
  if (action === 'escalate') recommendations.push('ESCALATE: Flag for fraud analyst review before processing')
  if (action === 'review') recommendations.push('REVIEW: Additional verification recommended (3DS/biometric)')
  if (deviceTrust < 60) recommendations.push('Require device fingerprint verification')
  if (velocity !== 'pass') recommendations.push('Implement rate limiting for this account')
  if (accountAge < 14) recommendations.push('Apply enhanced monitoring for new accounts')
  recommendations.push('Real-time fraud detection reduces chargebacks by 60-80%')

  return {
    fraud_score: fraudScore,
    risk_level: riskLevel,
    indicators,
    action,
    confidence_pct: confidence,
    recommendations,
    summary: 'Fraud score: ' + fraudScore + '/100 (' + riskLevel + '). Action: ' + action.toUpperCase() +
      '. Confidence: ' + confidence + '%. ' + indicators.filter(i => i.triggered).length + ' indicator(s) triggered.'
  }
}

export function formatFraudDetectionReport(input: FraudDetectionInput, result: FraudDetectionResult): string {
  const lines: string[] = []
  lines.push('# Fraud Detection Analysis')
  lines.push('Transaction: $' + (input.transaction_amount_usd || 0).toLocaleString() + ' | Type: ' + (input.transaction_type || 'unknown'))
  lines.push('Fraud Score: ' + result.fraud_score + '/100 | Risk Level: ' + result.risk_level.toUpperCase())
  lines.push('Action: ' + result.action.toUpperCase() + ' | Confidence: ' + result.confidence_pct + '%')
  lines.push('')
  lines.push('## Fraud Indicators')
  for (const ind of result.indicators) {
    const status = ind.triggered ? '[TRIGGERED]' : '[CLEAR]'
    lines.push('- ' + status + ' ' + ind.indicator + ' (weight: ' + ind.risk_weight + ') -- ' + ind.description)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('---')
  lines.push('2026: AI-powered fraud detection prevents $30B+ in annual payment fraud globally.')
  return lines.join('\n')
}

// ==================== TOOL 5: COMPLIANCE CHECKER PAYMENTS ====================

export function checkPaymentCompliance(input: ComplianceInput): ComplianceResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const jurisdictions = input.jurisdiction || ['US']
  const kycLevel = input.kyc_level || 'none'
  const frameworks = input.regulatory_frameworks || ['BSA/AML', 'PSD2', 'PCI-DSS']

  const gaps: ComplianceGap[] = []
  let complianceScore = 100

  // KYC check
  if (kycLevel === 'none' || kycLevel === 'basic') {
    complianceScore -= 25
    gaps.push({ requirement: 'Know Your Customer (KYC)', status: 'non_compliant', regulation: 'FATF Recommendation 10', remediation: 'Implement full KYC with identity verification and ongoing due diligence' })
  } else if (kycLevel === 'enhanced') {
    complianceScore -= 5
    gaps.push({ requirement: 'Know Your Customer (KYC)', status: 'partial', regulation: 'FATF Recommendation 10', remediation: 'Consider full KYC for high-risk jurisdictions' })
  }

  // AML program
  if (!input.aml_program) {
    complianceScore -= 20
    gaps.push({ requirement: 'Anti-Money Laundering Program', status: 'non_compliant', regulation: 'Bank Secrecy Act / AMLD', remediation: 'Establish formal AML program with designated compliance officer' })
  }

  // Sanctions screening
  if (!input.sanctions_screening) {
    complianceScore -= 15
    gaps.push({ requirement: 'Sanctions Screening (OFAC/UN/EU)', status: 'non_compliant', regulation: 'OFAC Sanctions', remediation: 'Implement real-time sanctions list screening for all transactions' })
  }

  // Transaction monitoring
  if (!input.transaction_monitoring) {
    complianceScore -= 15
    gaps.push({ requirement: 'Transaction Monitoring', status: 'non_compliant', regulation: 'FATF Recommendation 20', remediation: 'Deploy automated transaction monitoring with suspicious activity reporting' })
  }

  // Record retention
  const retention = input.record_retention_years || 0
  if (retention < 5) {
    complianceScore -= 10
    gaps.push({ requirement: 'Record Retention (5+ years)', status: retention > 0 ? 'partial' : 'non_compliant', regulation: 'BSA / GDPR', remediation: 'Extend record retention to minimum 5 years' })
  }

  // Data residency
  const residency = input.data_residency || []
  if (residency.length === 0 && jurisdictions.length > 0) {
    complianceScore -= 10
    gaps.push({ requirement: 'Data Residency Compliance', status: 'non_compliant', regulation: 'GDPR / Local Data Laws', remediation: 'Establish data residency policies for each jurisdiction' })
  }

  complianceScore = clamp(complianceScore, 0, 100)

  const grade: 'A' | 'B' | 'C' | 'D' | 'F' =
    complianceScore >= 90 ? 'A' : complianceScore >= 75 ? 'B' : complianceScore >= 60 ? 'C' : complianceScore >= 40 ? 'D' : 'F'

  const riskExposure: 'low' | 'medium' | 'high' | 'critical' =
    complianceScore >= 85 ? 'low' : complianceScore >= 65 ? 'medium' : complianceScore >= 40 ? 'high' : 'critical'

  const upcomingDeadlines: string[] = []
  if (!input.aml_program) upcomingDeadlines.push('AML program implementation: 90 days')
  if (!input.sanctions_screening) upcomingDeadlines.push('Sanctions screening deployment: 60 days')
  if (kycLevel !== 'full') upcomingDeadlines.push('KYC upgrade: 120 days')
  if (retention < 5) upcomingDeadlines.push('Record retention policy update: 30 days')
  if (upcomingDeadlines.length === 0) upcomingDeadlines.push('No immediate deadlines -- maintain current compliance posture')

  const recommendations: string[] = []
  if (kycLevel !== 'full') recommendations.push('Upgrade to full KYC with biometric verification')
  if (!input.aml_program) recommendations.push('Establish AML program with independent audit')
  if (!input.sanctions_screening) recommendations.push('Integrate real-time OFAC/UN/EU sanctions screening')
  if (!input.transaction_monitoring) recommendations.push('Deploy AI-powered transaction monitoring')
  recommendations.push('Schedule quarterly compliance review')

  return {
    overall_compliance_pct: complianceScore,
    compliance_grade: grade,
    gaps,
    risk_exposure: riskExposure,
    upcoming_deadlines: upcomingDeadlines,
    recommendations,
    summary: 'Compliance: ' + complianceScore + '% (Grade: ' + grade + '). ' + gaps.length +
      ' gap(s) identified. Risk exposure: ' + riskExposure + '.'
  }
}

export function formatComplianceReport(input: ComplianceInput, result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('# Compliance Checker -- Payments')
  lines.push('Jurisdictions: ' + (input.jurisdiction || ['N/A']).join(', ') + ' | Customer Type: ' + (input.customer_type || 'unknown'))
  lines.push('Compliance: ' + result.overall_compliance_pct + '% | Grade: ' + result.compliance_grade + ' | Risk: ' + result.risk_exposure.toUpperCase())
  lines.push('')
  lines.push('## Compliance Gaps')
  for (const g of result.gaps) {
    const status = g.status === 'compliant' ? '[PASS]' : g.status === 'partial' ? '[PARTIAL]' : '[FAIL]'
    lines.push('- ' + status + ' ' + g.requirement + ' (' + g.regulation + ')')
    lines.push('  Remediation: ' + g.remediation)
  }
  if (result.gaps.length === 0) lines.push('- All checks passed')
  lines.push('')
  lines.push('## Upcoming Deadlines')
  for (const d of result.upcoming_deadlines) {
    lines.push('- ' + d)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('---')
  lines.push('2026: Payment compliance fines exceed $5B annually. Proactive compliance is cheaper than remediation.')
  return lines.join('\n')
}

// ==================== TOOL 6: MERCHANT ONBOARDING ASSESSOR ====================

export function assessMerchantOnboarding(input: MerchantOnboardingInput): MerchantOnboardingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const riskFactors: MerchantRiskFactor[] = []
  let riskScore = 0

  // Business age
  const ageMonths = input.business_age_months || 0
  if (ageMonths < 6) { riskScore += 20; riskFactors.push({ factor: 'New business (< 6 months)', risk_level: 'high', score_impact: 20, notes: 'Limited operating history increases risk' }) }
  else if (ageMonths < 12) { riskScore += 10; riskFactors.push({ factor: 'Young business (6-12 months)', risk_level: 'medium', score_impact: 10, notes: 'Building track record' }) }
  else if (ageMonths >= 24) { riskScore -= 5; riskFactors.push({ factor: 'Established business (24+ months)', risk_level: 'low', score_impact: -5, notes: 'Proven operating history' }) }

  // Chargeback rate
  const chargebacks = input.existing_chargebacks_pct || 0
  if (chargebacks > 1) { riskScore += 25; riskFactors.push({ factor: 'High chargeback rate (' + chargebacks + '%)', risk_level: 'high', score_impact: 25, notes: 'Exceeds 1% threshold -- card network risk' }) }
  else if (chargebacks > 0.5) { riskScore += 10; riskFactors.push({ factor: 'Elevated chargeback rate (' + chargebacks + '%)', risk_level: 'medium', score_impact: 10, notes: 'Approaching threshold' }) }
  else { riskFactors.push({ factor: 'Low chargeback rate (' + chargebacks + '%)', risk_level: 'low', score_impact: 0, notes: 'Within acceptable range' }) }

  // High risk industry
  if (input.high_risk_industry) { riskScore += 20; riskFactors.push({ factor: 'High-risk industry', risk_level: 'high', score_impact: 20, notes: 'Industry classification triggers enhanced due diligence' }) }

  // Monthly volume
  const monthlyVol = input.monthly_volume_usd || 0
  if (monthlyVol > 500000) { riskScore += 10; riskFactors.push({ factor: 'High monthly volume ($' + monthlyVol.toLocaleString() + ')', risk_level: 'medium', score_impact: 10, notes: 'Requires enhanced monitoring' }) }

  // Financial statements
  if (!input.financial_statements_available) { riskScore += 10; riskFactors.push({ factor: 'No financial statements', risk_level: 'medium', score_impact: 10, notes: 'Unable to verify financial health' }) }

  // Beneficial owners
  const owners = input.beneficial_owners || 0
  if (owners === 0) { riskScore += 15; riskFactors.push({ factor: 'No beneficial owner disclosure', risk_level: 'high', score_impact: 15, notes: 'AML/KYC requirement unmet' }) }
  else if (owners === 1) { riskScore += 5; riskFactors.push({ factor: 'Single beneficial owner', risk_level: 'low', score_impact: 5, notes: 'Concentrated ownership' }) }

  riskScore = clamp(riskScore, 0, 100)

  const riskTier: 'tier1' | 'tier2' | 'tier3' | 'tier4' =
    riskScore <= 20 ? 'tier1' : riskScore <= 40 ? 'tier2' : riskScore <= 60 ? 'tier3' : 'tier4'

  const approval: 'approve' | 'review' | 'decline' =
    riskScore <= 35 ? 'approve' : riskScore <= 65 ? 'review' : 'decline'

  // Suggested limits based on tier
  const tierLimits: Record<string, { daily_usd: number; monthly_usd: number; per_transaction_usd: number }> = {
    tier1: { daily_usd: 50000, monthly_usd: 1000000, per_transaction_usd: 10000 },
    tier2: { daily_usd: 25000, monthly_usd: 500000, per_transaction_usd: 5000 },
    tier3: { daily_usd: 10000, monthly_usd: 200000, per_transaction_usd: 2500 },
    tier4: { daily_usd: 2500, monthly_usd: 50000, per_transaction_usd: 1000 }
  }

  const onboardingSteps: string[] = []
  onboardingSteps.push('Business registration verification')
  onboardingSteps.push('Beneficial owner identity verification')
  if (input.high_risk_industry) onboardingSteps.push('Enhanced due diligence (EDD)')
  if (monthlyVol > 100000) onboardingSteps.push('Financial statement review')
  onboardingSteps.push('Terms of service acceptance')
  onboardingSteps.push('Technical integration review')

  const monitoringFreq: Record<string, string> = { tier1: 'Quarterly', tier2: 'Monthly', tier3: 'Weekly', tier4: 'Daily' }

  return {
    approval_recommendation: approval,
    risk_score: riskScore,
    risk_tier: riskTier,
    risk_factors: riskFactors,
    suggested_limits: tierLimits[riskTier],
    onboarding_steps: onboardingSteps,
    monitoring_frequency: monitoringFreq[riskTier],
    summary: 'Merchant risk: ' + riskScore + '/100 (' + riskTier + '). Recommendation: ' +
      approval.toUpperCase() + '. Monitoring: ' + monitoringFreq[riskTier] + '.'
  }
}

export function formatMerchantOnboardingReport(input: MerchantOnboardingInput, result: MerchantOnboardingResult): string {
  const lines: string[] = []
  lines.push('# Merchant Onboarding Assessment')
  lines.push('Business: ' + (input.business_name || 'N/A') + ' | Type: ' + (input.business_type || 'N/A') + ' | Country: ' + (input.country || 'N/A'))
  lines.push('Risk Score: ' + result.risk_score + '/100 | Tier: ' + result.risk_tier.toUpperCase())
  lines.push('Recommendation: ' + result.approval_recommendation.toUpperCase() + ' | Monitoring: ' + result.monitoring_frequency)
  lines.push('')
  lines.push('## Risk Factors')
  for (const f of result.risk_factors) {
    lines.push('- [' + f.risk_level.toUpperCase() + '] ' + f.factor + ' (impact: ' + f.score_impact + ') -- ' + f.notes)
  }
  lines.push('')
  lines.push('## Suggested Limits')
  lines.push('- Daily: $' + result.suggested_limits.daily_usd.toLocaleString())
  lines.push('- Monthly: $' + result.suggested_limits.monthly_usd.toLocaleString())
  lines.push('- Per Transaction: $' + result.suggested_limits.per_transaction_usd.toLocaleString())
  lines.push('')
  lines.push('## Onboarding Steps')
  for (const s of result.onboarding_steps) {
    lines.push('- ' + s)
  }
  lines.push('')
  lines.push('---')
  lines.push('2026: Automated merchant onboarding reduces time-to-accept-payments from weeks to hours.')
  return lines.join('\n')
}

// ==================== TOOL 7: TRANSACTION ANALYZER ====================

export function analyzeTransactions(input: TransactionAnalyzerInput): TransactionAnalyzerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const transactions = input.transactions || []
  const periodDays = input.analysis_period_days || 30
  const anomalyThreshold = input.anomaly_threshold || 2

  let totalVolume = 0
  const merchantTotals: Record<string, { count: number; total: number }> = {}
  const typeTotals: Record<string, { count: number; total: number }> = {}
  const countryTotals: Record<string, number> = {}

  for (const tx of transactions) {
    totalVolume += tx.amount_usd
    if (!merchantTotals[tx.merchant]) merchantTotals[tx.merchant] = { count: 0, total: 0 }
    merchantTotals[tx.merchant].count++
    merchantTotals[tx.merchant].total += tx.amount_usd
    if (!typeTotals[tx.type]) typeTotals[tx.type] = { count: 0, total: 0 }
    typeTotals[tx.type].count++
    typeTotals[tx.type].total += tx.amount_usd
    countryTotals[tx.country] = (countryTotals[tx.country] || 0) + tx.amount_usd
  }

  // Detect patterns
  const patterns: TransactionPattern[] = []
  for (const [merchant, data] of Object.entries(merchantTotals)) {
    const avgAmount = data.total / data.count
    const frequencyScore = data.count / periodDays
    patterns.push({
      pattern: 'Recurring: ' + merchant,
      frequency: data.count,
      avg_amount_usd: parseFloat(avgAmount.toFixed(2)),
      trend: frequencyScore > 0.5 ? 'increasing' : frequencyScore > 0.2 ? 'stable' : 'decreasing',
      anomaly_score: rng.nextFloat(0, 3)
    })
  }

  // Detect anomalies (amounts > threshold * average)
  const avgTxnAmount = transactions.length > 0 ? totalVolume / transactions.length : 0
  let anomaliesDetected = 0
  for (const tx of transactions) {
    if (tx.amount_usd > avgTxnAmount * anomalyThreshold) anomaliesDetected++
  }

  // Top merchants by volume
  const topMerchants = Object.entries(merchantTotals)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([name]) => name)

  // Spending trend (compare first half vs second half)
  const midpoint = Math.floor(transactions.length / 2)
  const firstHalf = transactions.slice(0, midpoint).reduce((s, t) => s + t.amount_usd, 0)
  const secondHalf = transactions.slice(midpoint).reduce((s, t) => s + t.amount_usd, 0)
  const spendingTrend: 'increasing' | 'stable' | 'decreasing' =
    secondHalf > firstHalf * 1.2 ? 'increasing' : secondHalf < firstHalf * 0.8 ? 'decreasing' : 'stable'

  // Risk flags
  const riskFlags: string[] = []
  if (anomaliesDetected > 0) riskFlags.push(anomaliesDetected + ' anomalous transaction(s) detected')
  if (totalVolume > 50000) riskFlags.push('High total volume: $' + totalVolume.toLocaleString())
  if (Object.keys(countryTotals).length > 5) riskFlags.push('Transactions across ' + Object.keys(countryTotals).length + ' countries')
  if (riskFlags.length === 0) riskFlags.push('No risk flags detected')

  // Insights
  const insights: string[] = []
  if (topMerchants.length > 0) insights.push('Top merchant: ' + topMerchants[0] + ' by volume')
  if (transactions.length > 0) insights.push('Average transaction: $' + avgTxnAmount.toFixed(2))
  const typeCount = Object.keys(typeTotals).length
  if (typeCount > 0) insights.push('Transaction types used: ' + typeCount)
  insights.push('Spending trend: ' + spendingTrend)

  return {
    total_transactions: transactions.length,
    total_volume_usd: parseFloat(totalVolume.toFixed(2)),
    patterns,
    anomalies_detected: anomaliesDetected,
    top_merchants: topMerchants,
    spending_trend: spendingTrend,
    risk_flags: riskFlags,
    insights,
    summary: 'Analyzed ' + transactions.length + ' transactions ($' + totalVolume.toFixed(2) +
      '). ' + anomaliesDetected + ' anomaly(ies). Trend: ' + spendingTrend + '.'
  }
}

export function formatTransactionAnalyzerReport(input: TransactionAnalyzerInput, result: TransactionAnalyzerResult): string {
  const lines: string[] = []
  lines.push('# Transaction Analysis Report')
  lines.push('Period: ' + (input.analysis_period_days || 30) + ' days | Total Transactions: ' + result.total_transactions)
  lines.push('Total Volume: $' + result.total_volume_usd.toLocaleString() + ' | Trend: ' + result.spending_trend.toUpperCase())
  lines.push('Anomalies Detected: ' + result.anomalies_detected)
  lines.push('')
  lines.push('## Detected Patterns')
  for (const p of result.patterns) {
    lines.push('- ' + p.pattern + ': ' + p.frequency + 'x, avg $' + p.avg_amount_usd + ' (' + p.trend + ', anomaly: ' + p.anomaly_score.toFixed(1) + ')')
  }
  if (result.patterns.length === 0) lines.push('- No recurring patterns detected')
  lines.push('')
  lines.push('## Top Merchants')
  for (const m of result.top_merchants) {
    lines.push('- ' + m)
  }
  if (result.top_merchants.length === 0) lines.push('- No merchant data')
  lines.push('')
  lines.push('## Risk Flags')
  for (const f of result.risk_flags) {
    lines.push('- ' + f)
  }
  lines.push('')
  lines.push('## Insights')
  for (const i of result.insights) {
    lines.push('- ' + i)
  }
  lines.push('')
  lines.push('---')
  lines.push('2026: Real-time transaction analysis enables proactive fraud prevention and personalized financial insights.')
  return lines.join('\n')
}

// ==================== TOOL 8: CROSS-BORDER PAYMENT ADVISOR ====================

export function adviseCrossBorderPayment(input: CrossBorderInput): CrossBorderResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const amount = input.send_amount_usd || 1000
  const sendCurrency = input.send_currency || 'USD'
  const receiveCurrency = input.receive_currency || 'EUR'
  const sendCountry = input.send_country || 'US'
  const receiveCountry = input.receive_country || 'DE'
  const speedPref = input.speed_preference || 'balanced'

  const transferOptions: TransferOption[] = []

  // Bank transfer
  const bankCost = amount * 0.015 + rng.nextFloat(15, 35)
  transferOptions.push({
    method: 'Bank Wire',
    provider: 'SWIFT Network',
    total_cost_usd: parseFloat(bankCost.toFixed(2)),
    exchange_rate_markup_pct: parseFloat(rng.nextFloat(1.5, 3.5).toFixed(1)),
    estimated_delivery: '2-5 business days',
    transparency_score: 60,
    recommended: false
  })

  // Wallet transfer
  const walletCost = amount * 0.008 + rng.nextFloat(1, 10)
  transferOptions.push({
    method: 'Digital Wallet',
    provider: 'PayPal/Wise',
    total_cost_usd: parseFloat(walletCost.toFixed(2)),
    exchange_rate_markup_pct: parseFloat(rng.nextFloat(0.5, 1.5).toFixed(1)),
    estimated_delivery: 'Same day',
    transparency_score: 80,
    recommended: false
  })

  // Remittance
  const remitCost = amount * 0.02 + rng.nextFloat(2, 8)
  transferOptions.push({
    method: 'Remittance Service',
    provider: 'Western Union/Remitly',
    total_cost_usd: parseFloat(remitCost.toFixed(2)),
    exchange_rate_markup_pct: parseFloat(rng.nextFloat(2.0, 4.0).toFixed(1)),
    estimated_delivery: 'Instant to 1 day',
    transparency_score: 70,
    recommended: false
  })

  // Card transfer
  const cardCost = amount * 0.025 + rng.nextFloat(3, 8)
  transferOptions.push({
    method: 'Card Network',
    provider: 'Visa/Mastercard',
    total_cost_usd: parseFloat(cardCost.toFixed(2)),
    exchange_rate_markup_pct: parseFloat(rng.nextFloat(1.0, 2.5).toFixed(1)),
    estimated_delivery: 'Instant',
    transparency_score: 75,
    recommended: false
  })

  // Crypto corridor
  const cryptoCost = amount * 0.005 + rng.nextFloat(1, 5)
  transferOptions.push({
    method: 'Crypto Corridor',
    provider: 'Stablecoin Bridge',
    total_cost_usd: parseFloat(cryptoCost.toFixed(2)),
    exchange_rate_markup_pct: parseFloat(rng.nextFloat(0.1, 0.8).toFixed(1)),
    estimated_delivery: 'Minutes',
    transparency_score: 65,
    recommended: false
  })

  // Select optimal based on speed preference
  if (speedPref === 'fastest') {
    const fastest = transferOptions.reduce((a, b) => {
      const timeRank: Record<string, number> = { 'Minutes': 0, 'Instant': 1, 'Instant to 1 day': 2, 'Same day': 3, '2-5 business days': 4 }
      return (timeRank[a.estimated_delivery] || 5) < (timeRank[b.estimated_delivery] || 5) ? a : b
    })
    fastest.recommended = true
  } else if (speedPref === 'cheapest') {
    const cheapest = transferOptions.reduce((a, b) => a.total_cost_usd < b.total_cost_usd ? a : b)
    cheapest.recommended = true
  } else {
    const bestValue = transferOptions.reduce((a, b) => a.transparency_score / a.total_cost_usd > b.transparency_score / b.total_cost_usd ? a : b)
    bestValue.recommended = true
  }

  const optimal = transferOptions.find(o => o.recommended) || transferOptions[0]
  const costs = transferOptions.map(o => o.total_cost_usd)
  const minCost = Math.min(...costs)
  const maxCost = Math.max(...costs)

  // Corridor risk
  const highRiskCorridors = ['NG', 'BD', 'PK', 'KE', 'GH']
  const corridorRisk: 'low' | 'medium' | 'high' =
    highRiskCorridors.includes(receiveCountry) ? 'high' :
    ['IN', 'PH', 'VN', 'MX', 'BR'].includes(receiveCountry) ? 'medium' : 'low'

  // Regulatory notes
  const regulatoryNotes: string[] = []
  regulatoryNotes.push('Send: ' + sendCountry + ' -- compliance verified')
  regulatoryNotes.push('Receive: ' + receiveCountry + ' -- ' + corridorRisk + ' risk corridor')
  if (amount > 10000) regulatoryNotes.push('Amount exceeds $10K -- CTR filing may be required')
  if (receiveCountry !== sendCountry) regulatoryNotes.push('Cross-border: ensure both jurisdictions permit ' + sendCurrency + '/' + receiveCurrency + ' conversion')
  const constraints = input.regulatory_constraints || []
  for (const c of constraints) regulatoryNotes.push('Constraint: ' + c)

  // Savings vs traditional bank
  const traditionalCost = amount * 0.03 + 35
  const savings = parseFloat((traditionalCost - optimal.total_cost_usd).toFixed(2))

  const recommendations: string[] = []
  recommendations.push('Optimal method: ' + optimal.method + ' ($' + optimal.total_cost_usd + ')')
  if (amount > 5000) recommendations.push('Consider splitting across corridors for better rates')
  if (corridorRisk === 'high') recommendations.push('High enhanced due diligence on ' + receiveCountry + ' corridor')
  recommendations.push('Monitor exchange rates -- lock in when rate moves 0.5% in your favor')
  if (speedPref === 'cheapest') recommendations.push('For time-sensitive transfers, wallet method adds only $' + (walletCost - minCost < 0 ? 0 : (walletCost - minCost)).toFixed(2) + ' for same-day delivery')

  return {
    optimal_method: optimal.method,
    transfer_options: transferOptions,
    total_cost_range: { min: parseFloat(minCost.toFixed(2)), max: parseFloat(maxCost.toFixed(2)) },
    regulatory_notes: regulatoryNotes,
    corridor_risk: corridorRisk,
    savings_vs_traditional: savings,
    recommendations,
    summary: 'Optimal: ' + optimal.method + ' | Cost: $' + optimal.total_cost_usd +
      ' | Savings vs bank: $' + savings + ' | Corridor: ' + corridorRisk + ' risk'
  }
}

export function formatCrossBorderReport(input: CrossBorderInput, result: CrossBorderResult): string {
  const lines: string[] = []
  lines.push('# Cross-Border Payment Advisory')
  lines.push('Send: $' + (input.send_amount_usd || 0).toLocaleString() + ' ' + (input.send_currency || 'USD') + ' (' + (input.send_country || 'US') + ')')
  lines.push('Receive: ' + (input.receive_currency || 'EUR') + ' (' + (input.receive_country || 'DE') + ')')
  lines.push('Optimal Method: ' + result.optimal_method + ' | Savings vs Bank: $' + result.savings_vs_traditional)
  lines.push('Corridor Risk: ' + result.corridor_risk.toUpperCase())
  lines.push('')
  lines.push('## Transfer Options')
  for (const o of result.transfer_options) {
    const marker = o.recommended ? ' [RECOMMENDED]' : ''
    lines.push('- ' + o.method + ' (' + o.provider + ')' + marker)
    lines.push('  Cost: $' + o.total_cost_usd + ' | Markup: ' + o.exchange_rate_markup_pct + '% | Delivery: ' + o.estimated_delivery + ' | Transparency: ' + o.transparency_score + '/100')
  }
  lines.push('')
  lines.push('## Regulatory Notes')
  for (const n of result.regulatory_notes) {
    lines.push('- ' + n)
  }
  lines.push('')
  lines.push('## Recommendations')
  for (const r of result.recommendations) {
    lines.push('- ' + r)
  }
  lines.push('')
  lines.push('---')
  lines.push('2026: Cross-border payments market exceeds $15T. Digital corridors reduce costs by 60-80% vs traditional banking.')
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Wallet Security Analyst
  tools.register(defineTool({
    name: 'wallet_security_analyst',
    description: 'Analyzes digital wallet security posture. Evaluates 2FA, biometric auth, encryption, backup, audit logging, and suspicious activity. Returns security score (0-100), threat list, compliance gaps, and actionable recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: wallet_type (hot|cold|hybrid|custodial|non_custodial), two_factor_enabled, biometric_auth, encryption_level (none|basic|aes256|end_to_end), backup_recovery, audit_log_enabled, suspicious_activity[], daily_limit_usd, connected_apps, last_security_audit_days', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: WalletSecurityInput = JSON.parse(args.input_data)
      const result = analyzeWalletSecurity(input)
      return formatWalletSecurityReport(input, result)
    }
  }))

  // Tool 2: Payment Routing Optimizer
  tools.register(defineTool({
    name: 'payment_routing_optimizer',
    description: 'Optimizes payment route selection based on amount, urgency, cost sensitivity, and reliability requirements. Compares SWIFT/SEPA/ACH/RealTime/CardNetwork routes with cost, speed, and reliability analysis.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: amount_usd, source_country, target_country, currency_pair, urgency (instant|same_day|next_day|standard), available_routes[], cost_sensitivity (low|medium|high), reliability_threshold', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PaymentRoutingInput = JSON.parse(args.input_data)
      const result = optimizePaymentRouting(input)
      return formatPaymentRoutingReport(input, result)
    }
  }))

  // Tool 3: Multi-Currency Manager
  tools.register(defineTool({
    name: 'multi_currency_manager',
    description: 'Manages multi-currency portfolio with FX exposure analysis, hedging strategy evaluation, rebalancing recommendations, and stablecoin allocation. Returns portfolio score, position analysis, and hedging effectiveness.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: base_currency, held_currencies[], target_allocation{}, fx_volatility_tolerance (low|medium|high), hedging_strategy (none|forward|options|natural), monthly_fx_volume_usd, preferred_stablecoins[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: MultiCurrencyInput = JSON.parse(args.input_data)
      const result = manageMultiCurrency(input)
      return formatMultiCurrencyReport(input, result)
    }
  }))

  // Tool 4: Fraud Detection Wallet
  tools.register(defineTool({
    name: 'fraud_detection_wallet',
    description: 'Real-time fraud detection for wallet transactions. Analyzes amount, device trust, velocity, IP risk, account age, and behavioral patterns. Returns fraud score (0-100), risk level, action (allow/review/block/escalate), and triggered indicators.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: transaction_amount_usd, transaction_type (purchase|transfer|withdrawal|deposit|merchant_payment), merchant_category, user_country, device_trust_score, velocity_check (pass|warn|fail), unusual_pattern, ip_risk_score, account_age_days, previous_fraud_flags', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: FraudDetectionInput = JSON.parse(args.input_data)
      const result = detectWalletFraud(input)
      return formatFraudDetectionReport(input, result)
    }
  }))

  // Tool 5: Compliance Checker Payments
  tools.register(defineTool({
    name: 'compliance_checker_payments',
    description: 'Checks payment compliance across jurisdictions. Evaluates KYC/AML programs, sanctions screening, transaction monitoring, record retention, and data residency. Returns compliance score, grade (A-F), gaps, and remediation steps.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: jurisdiction[], transaction_volume_usd, customer_type (individual|business|both), kyc_level (none|basic|enhanced|full), aml_program, sanctions_screening, transaction_monitoring, record_retention_years, data_residency[], regulatory_frameworks[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ComplianceInput = JSON.parse(args.input_data)
      const result = checkPaymentCompliance(input)
      return formatComplianceReport(input, result)
    }
  }))

  // Tool 6: Merchant Onboarding Assessor
  tools.register(defineTool({
    name: 'merchant_onboarding_assessor',
    description: 'Assesses merchant risk for payment onboarding. Evaluates business age, chargeback rate, industry risk, volume, financials, and ownership. Returns approval recommendation (approve/review/decline), risk tier, suggested limits, and onboarding steps.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_name, business_type, country, monthly_volume_usd, avg_transaction_usd, business_age_months, existing_chargebacks_pct, high_risk_industry, website_url, beneficial_owners, financial_statements_available', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: MerchantOnboardingInput = JSON.parse(args.input_data)
      const result = assessMerchantOnboarding(input)
      return formatMerchantOnboardingReport(input, result)
    }
  }))

  // Tool 7: Transaction Analyzer
  tools.register(defineTool({
    name: 'transaction_analyzer',
    description: 'Analyzes wallet transaction history for patterns, anomalies, and insights. Detects recurring payments, spending trends, unusual activity, and merchant concentration. Returns pattern analysis, anomaly count, risk flags, and actionable insights.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: transactions[{amount_usd, type, merchant, timestamp, country}], analysis_period_days, anomaly_threshold, category_breakdown, trend_analysis, peer_comparison', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TransactionAnalyzerInput = JSON.parse(args.input_data)
      const result = analyzeTransactions(input)
      return formatTransactionAnalyzerReport(input, result)
    }
  }))

  // Tool 8: Cross-Border Payment Advisor
  tools.register(defineTool({
    name: 'cross_border_payment_advisor',
    description: 'Advises on optimal cross-border payment methods. Compares bank wire, digital wallet, remittance, card network, and crypto corridors. Returns cost comparison, delivery times, regulatory notes, corridor risk, and savings vs traditional banking.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: send_amount_usd, send_currency, receive_currency, send_country, receive_country, transfer_method (bank|wallet|remittance|card|crypto), speed_preference (fastest|cheapest|balanced), regulatory_constraints[]', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CrossBorderInput = JSON.parse(args.input_data)
      const result = adviseCrossBorderPayment(input)
      return formatCrossBorderReport(input, result)
    }
  }))
}
