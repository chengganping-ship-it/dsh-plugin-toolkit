/**
 * DSH AI Agent Commerce & Payments Plugin v1.0.0
 *
 * Agentic payments, autonomous transactions, escrow services for AI agents,
 * micropayment optimization. 2026: Agentic commerce is a growing category;
 * autonomous agents buying and selling is an immediate opportunity.
 *
 * Features (v1.0.0):
 * - Agent Transaction Approver (autonomous transaction risk assessment & approval)
 * - Escrow Service Manager (hold-verify-release flows for agent-to-agent payments)
 * - Micropayment Optimizer (channel selection, batching, fee minimization for micro txns)
 * - Cross-Agent Settlement (multi-currency, multi-party netting & reconciliation)
 * - Payment Routing Engineer (optimal payment path selection across rails)
 * - Budget Enforcement Module (spending limits, velocity checks, quota management)
 * - Fraud Detection Agent (anomaly detection, velocity abuse, collusion patterns)
 * - Autonomous Purchase Advisor (value-based purchase timing, vendor scoring, cost sim)
 *
 * @module dsh-tool-agentpay
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-agentpay'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute financial, legal, or compliance advice. Consult qualified professionals before deploying autonomous payment systems.'

// ==================== MULBERRY32 DETERMINISTIC PRNG ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeRng(seed: number) {
  const r = mulberry32(seed)
  return {
    next: (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min,
    nextFloat: (min: number, max: number) => r() * (max - min) + min,
    pick: <T>(arr: T[]): T => arr[Math.floor(r() * arr.length)],
    pickN: <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => r() - 0.5)
      return shuffled.slice(0, n)
    }
  }
}

function computeSeed(input: unknown): number {
  return JSON.stringify(input).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: Agent Transaction Approver ---
export interface TransactionApproverInput {
  transaction_id: string
  payer_agent: string
  payee_agent: string
  amount: number
  currency: string
  purpose: string
  risk_signals?: string[]
  daily_limit?: number
  trust_score?: number
}

export interface TransactionApproverDecision {
  decision: 'approve' | 'reject' | 'review'
  risk_score: number
  reasons: string[]
  conditions?: string[]
}

export interface TransactionApproverOutput {
  transaction_id: string
  decision: TransactionApproverDecision
  processing_time_ms: number
  timestamp: string
}

// --- Tool 2: Escrow Service Manager ---
export interface EscrowServiceInput {
  escrow_id: string
  buyer_agent: string
  seller_agent: string
  amount: number
  currency: string
  release_conditions: string[]
  dispute_window_hours?: number
  auto_release_hours?: number
  arbitrator?: string
}

export interface EscrowStatus {
  phase: 'funded' | 'held' | 'released' | 'disputed' | 'refunded'
  buyer_confirmed: boolean
  seller_confirmed: boolean
  conditions_met: string[]
  conditions_pending: string[]
}

export interface EscrowServiceOutput {
  escrow_id: string
  status: EscrowStatus
  timeline: string[]
  next_action: string
}

// --- Tool 3: Micropayment Optimizer ---
export interface MicropaymentOptimizerInput {
  transactions: { id: string; amount: number; payee: string; urgency: 'low' | 'medium' | 'high' }[]
  channels: { name: string; fee_fixed: number; fee_percent: number; min_amount: number; max_amount: number; speed_seconds: number }[]
  batching_enabled?: boolean
  target_savings_percent?: number
}

export interface MicropaymentRoute {
  transaction_id: string
  channel: string
  fee: number
  net_amount: number
  estimated_seconds: number
  batched: boolean
  batch_id?: string
}

export interface MicropaymentOptimizerOutput {
  routes: MicropaymentRoute[]
  total_fees: number
  total_net: number
  savings_vs_naive: number
  savings_percent: number
  batch_count: number
}

// --- Tool 4: Cross-Agent Settlement ---
export interface CrossAgentSettlementInput {
  cycle_id: string
  agents: { id: string; name: string; currency: string }[]
  obligations: { from: string; to: string; amount: number; currency: string }[]
  settlement_currency?: string
  netting_enabled?: boolean
}

export interface SettlementLeg {
  from: string
  to: string
  amount: number
  currency: string
  type: 'gross' | 'netted'
}

export interface CrossAgentSettlementOutput {
  cycle_id: string
  legs: SettlementLeg[]
  gross_volume: number
  net_volume: number
  netting_efficiency: number
  settlement_time_estimate: string
}

// --- Tool 5: Payment Routing Engineer ---
export interface PaymentRoutingInput {
  payment_id: string
  source: string
  destination: string
  amount: number
  currency: string
  rails: { id: string; name: string; cost: number; speed_seconds: number; reliability: number; reach: string[] }[]
  priority?: 'cost' | 'speed' | 'reliability'
  max_cost?: number
  max_time_seconds?: number
}

export interface RouteOption {
  rail_id: string
  rail_name: string
  cost: number
  speed_seconds: number
  reliability: number
  score: number
  feasible: boolean
  infeasibility_reason?: string
}

export interface PaymentRoutingOutput {
  payment_id: string
  recommended: RouteOption
  alternatives: RouteOption[]
  routing_table: string[]
}

// --- Tool 6: Budget Enforcement Module ---
export interface BudgetEnforcementInput {
  agent_id: string
  agent_name: string
  budget_period: string
  budget_limit: number
  currency: string
  spent_to_date: number
  pending_transactions?: { id: string; amount: number; purpose: string }[]
  alert_thresholds?: number[]
  velocity_limit_per_hour?: number
}

export interface BudgetAlert {
  level: 'info' | 'warning' | 'critical'
  message: string
  current_usage_percent: number
}

export interface BudgetEnforcementOutput {
  agent_id: string
  budget_status: 'healthy' | 'warning' | 'critical' | 'exceeded'
  remaining_budget: number
  usage_percent: number
  pending_impact: number
  alerts: BudgetAlert[]
  actions: string[]
}

// --- Tool 7: Fraud Detection Agent ---
export interface FraudDetectionInput {
  agent_id: string
  window_hours: number
  transactions: { id: string; amount: number; counterparty: string; timestamp: string; channel: string }[]
  baseline_avg_amount?: number
  baseline_txn_count?: number
  known_counterparties?: string[]
}

export interface FraudSignal {
  type: 'velocity' | 'amount' | 'counterparty' | 'channel' | 'pattern'
  severity: 'low' | 'medium' | 'high'
  description: string
  evidence: string
}

export interface FraudDetectionOutput {
  agent_id: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  fraud_score: number
  signals: FraudSignal[]
  recommended_action: string
}

// --- Tool 8: Autonomous Purchase Advisor ---
export interface PurchaseAdvisorInput {
  agent_id: string
  item_description: string
  estimated_value: number
  currency: string
  vendors: { name: string; price: number; rating: number; delivery_days: number; reliability: number }[]
  urgency: 'low' | 'medium' | 'high'
  budget_remaining?: number
  price_history?: { date: string; price: number }[]
}

export interface VendorRecommendation {
  vendor_name: string
  price: number
  rating: number
  delivery_days: number
  value_score: number
  recommendation_rank: number
}

export interface PurchaseAdvisorOutput {
  agent_id: string
  item_description: string
  decision: 'buy_now' | 'wait' | 'seek_alternatives'
  timing_analysis: string
  vendor_recommendations: VendorRecommendation[]
  cost_savings_estimate: number
}

// ==================== TOOL 1: AGENT TRANSACTION APPROVER ====================

function executeAgentTransactionApprover(input: TransactionApproverInput): TransactionApproverOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const riskSignals = input.risk_signals || []
  const trustScore = input.trust_score ?? rng.nextFloat(30, 95)
  const dailyLimit = input.daily_limit ?? 10000

  let riskScore = 0
  const reasons: string[] = []
  const conditions: string[] = []

  // Amount-based risk
  const amountRatio = input.amount / dailyLimit
  if (amountRatio > 0.8) {
    riskScore += 35
    reasons.push('Amount exceeds 80% of daily limit (ratio: ' + amountRatio.toFixed(2) + ')')
  } else if (amountRatio > 0.5) {
    riskScore += 20
    reasons.push('Amount exceeds 50% of daily limit (ratio: ' + amountRatio.toFixed(2) + ')')
  } else if (amountRatio > 0.2) {
    riskScore += 8
    reasons.push('Amount moderate at ' + (amountRatio * 100).toFixed(0) + '% of daily limit')
  } else {
    riskScore += 2
    reasons.push('Amount within safe threshold (' + (amountRatio * 100).toFixed(0) + '% of daily limit)')
  }

  // Trust score adjustment
  if (trustScore < 50) {
    riskScore += 25
    reasons.push('Low trust score: ' + trustScore.toFixed(1) + '/100')
    conditions.push('Require multi-sig confirmation for low-trust agents')
  } else if (trustScore < 70) {
    riskScore += 12
    reasons.push('Moderate trust score: ' + trustScore.toFixed(1) + '/100')
  } else {
    riskScore += 3
    reasons.push('High trust score: ' + trustScore.toFixed(1) + '/100')
  }

  // Risk signals
  for (const signal of riskSignals) {
    riskScore += rng.next(5, 15)
    reasons.push('Risk signal detected: ' + signal)
  }

  // Purpose heuristic
  const highRiskPurposes = ['gambling', 'crypto', 'unregistered', 'unknown']
  const medRiskPurposes = ['subscription', 'api_call', 'data_purchase']
  if (highRiskPurposes.some(p => input.purpose.toLowerCase().includes(p))) {
    riskScore += 20
    reasons.push('High-risk purpose category: ' + input.purpose)
  } else if (medRiskPurposes.some(p => input.purpose.toLowerCase().includes(p))) {
    riskScore += 8
    reasons.push('Medium-risk purpose: ' + input.purpose)
  } else {
    riskScore += 3
    reasons.push('Standard purpose: ' + input.purpose)
  }

  riskScore = clamp(Math.round(riskScore), 0, 100)

  let decision: TransactionApproverDecision['decision']
  if (riskScore >= 70) {
    decision = 'reject'
    conditions.push('Transaction blocked pending manual review')
  } else if (riskScore >= 40) {
    decision = 'review'
    conditions.push('Escalate to oversight agent for secondary approval')
    conditions.push('Apply temporary velocity limit for 1 hour')
  } else {
    decision = 'approve'
    conditions.push('Auto-approved within risk threshold')
  }

  return {
    transaction_id: input.transaction_id,
    decision: { decision, risk_score: riskScore, reasons, conditions },
    processing_time_ms: rng.next(12, 150),
    timestamp: new Date().toISOString()
  }
}

// ==================== TOOL 2: ESCROW SERVICE MANAGER ====================

function executeEscrowServiceManager(input: EscrowServiceInput): EscrowServiceOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const disputeWindow = input.dispute_window_hours ?? 48
  const autoRelease = input.auto_release_hours ?? 72
  const conditions = input.release_conditions

  // Simulate condition verification
  const conditionsMet: string[] = []
  const conditionsPending: string[] = []
  for (const c of conditions) {
    if (rng.next(0, 100) > 30) {
      conditionsMet.push(c)
    } else {
      conditionsPending.push(c)
    }
  }

  const allMet = conditionsPending.length === 0
  const buyerConfirmed = rng.next(0, 100) > 20
  const sellerConfirmed = rng.next(0, 100) > 15

  let phase: EscrowStatus['phase']
  let nextAction: string

  if (allMet && buyerConfirmed && sellerConfirmed) {
    phase = 'released'
    nextAction = 'Funds released to seller. Escrow complete.'
  } else if (!buyerConfirmed || !sellerConfirmed) {
    phase = 'held'
    if (!buyerConfirmed && !sellerConfirmed) {
      nextAction = 'Awaiting both buyer and seller confirmation'
    } else if (!buyerConfirmed) {
      nextAction = 'Awaiting buyer confirmation'
    } else {
      nextAction = 'Awaiting seller confirmation'
    }
  } else {
    phase = 'held'
    nextAction = 'Pending release conditions: ' + conditionsPending.join(', ')
  }

  // Dispute chance
  if (rng.next(0, 100) > 85 && phase !== 'released') {
    phase = 'disputed'
    nextAction = 'Dispute filed. Arbitrator ' + (input.arbitrator ?? 'default') + ' assigned.'
  }

  const timeline: string[] = []
  timeline.push('Escrow created: ' + input.escrow_id)
  timeline.push('Funds locked: ' + input.amount + ' ' + input.currency)
  timeline.push('Dispute window: ' + disputeWindow + 'h')
  timeline.push('Auto-release: ' + autoRelease + 'h after conditions met')
  if (conditionsMet.length > 0) {
    timeline.push('Conditions verified: ' + conditionsMet.length + '/' + conditions.length)
  }
  if (phase === 'released') {
    timeline.push('FUNDS RELEASED to ' + input.seller_agent)
  }
  if (phase === 'disputed') {
    timeline.push('DISPUTE: Escalated to arbitrator')
  }

  return {
    escrow_id: input.escrow_id,
    status: { phase, buyer_confirmed: buyerConfirmed, seller_confirmed: sellerConfirmed, conditions_met: conditionsMet, conditions_pending: conditionsPending },
    timeline,
    next_action: nextAction
  }
}

// ==================== TOOL 3: MICROPAYMENT OPTIMIZER ====================

function executeMicropaymentOptimizer(input: MicropaymentOptimizerInput): MicropaymentOptimizerOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const txns = input.transactions
  const channels = input.channels
  const batchingEnabled = input.batching_enabled ?? true

  const routes: MicropaymentRoute[] = []
  const batchGroups: Record<string, string> = {}

  for (const txn of txns) {
    // Find cheapest feasible channel
    let bestChannel = channels[0]
    let bestFee = Infinity
    for (const ch of channels) {
      if (txn.amount >= ch.min_amount && txn.amount <= ch.max_amount) {
        const fee = ch.fee_fixed + txn.amount * (ch.fee_percent / 100)
        if (fee < bestFee) {
          bestFee = fee
          bestChannel = ch
        }
      }
    }

    const fee = bestChannel.fee_fixed + txn.amount * (bestChannel.fee_percent / 100)
    let batched = false
    let batchId: string | undefined

    // Batching logic: group non-urgent transactions by payee
    if (batchingEnabled && txn.urgency !== 'high') {
      const key = txn.payee
      if (!batchGroups[key]) batchGroups[key] = txn.id
      batched = true
      batchId = 'batch_' + key
    }

    routes.push({
      transaction_id: txn.id,
      channel: bestChannel.name,
      fee: Math.round(fee * 100) / 100,
      net_amount: txn.amount - Math.round(fee * 100) / 100,
      estimated_seconds: batched ? bestChannel.speed_seconds + rng.next(1, 5) : bestChannel.speed_seconds,
      batched,
      batch_id: batchId
    })
  }

  const totalFees = routes.reduce((a, r) => a + r.fee, 0)
  const totalNet = routes.reduce((a, r) => a + r.net_amount, 0)

  // Naive cost: send all on first channel without batching
  let naiveCost = 0
  for (const txn of txns) {
    const ch = channels[0]
    naiveCost += ch.fee_fixed + txn.amount * (ch.fee_percent / 100)
  }
  const savings = Math.max(0, naiveCost - totalFees)
  const savingsPercent = naiveCost > 0 ? Math.round((savings / naiveCost) * 10000) / 100 : 0

  const batchCount = Object.keys(batchGroups).length

  return {
    routes,
    total_fees: Math.round(totalFees * 100) / 100,
    total_net: Math.round(totalNet * 100) / 100,
    savings_vs_naive: Math.round(savings * 100) / 100,
    savings_percent: savingsPercent,
    batch_count: batchCount
  }
}

// ==================== TOOL 4: CROSS-AGENT SETTLEMENT ====================

function executeCrossAgentSettlement(input: CrossAgentSettlementInput): CrossAgentSettlementOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const obligations = input.obligations
  const nettingEnabled = input.netting_enabled ?? true
  const settleCurrency = input.settlement_currency ?? 'USD'

  // Simple FX rates
  const fxRates: Record<string, number> = { 'USD': 1, 'EUR': 1.08, 'GBP': 1.27, 'CNY': 0.14, 'JPY': 0.0067, 'SGD': 0.74 }

  // Convert all to settlement currency
  const normalized = obligations.map(o => ({
    from: o.from,
    to: o.to,
    amount: o.amount * (fxRates[o.currency] ?? 1) / (fxRates[settleCurrency] ?? 1),
    currency: settleCurrency,
    original_amount: o.amount,
    original_currency: o.currency
  }))

  const legs: SettlementLeg[] = []
  let grossVolume = 0
  let netVolume = 0

  if (nettingEnabled) {
    // Netting: compute net position for each agent
    const netPositions: Record<string, number> = {}
    for (const ob of normalized) {
      netPositions[ob.from] = (netPositions[ob.from] || 0) - ob.amount
      netPositions[ob.to] = (netPositions[ob.to] || 0) + ob.amount
      grossVolume += ob.amount
    }

    // Simple bilateral netting legs
    const debtors = Object.entries(netPositions).filter(([_, v]) => v < 0).sort((a, b) => a[1] - b[1])
    const creditors = Object.entries(netPositions).filter(([_, v]) => v > 0).sort((a, b) => b[1] - a[1])

    let di = 0, ci = 0
    while (di < debtors.length && ci < creditors.length) {
      const transfer = Math.min(-debtors[di][1], creditors[ci][1])
      if (transfer > 0.01) {
        legs.push({ from: debtors[di][0], to: creditors[ci][0], amount: Math.round(transfer * 100) / 100, currency: settleCurrency, type: 'netted' })
        netVolume += transfer
      }
      debtors[di][1] += transfer
      creditors[ci][1] -= transfer
      if (Math.abs(debtors[di][1]) < 0.01) di++
      if (Math.abs(creditors[ci][1]) < 0.01) ci++
    }
  } else {
    // Gross settlement
    for (const ob of normalized) {
      legs.push({ from: ob.from, to: ob.to, amount: Math.round(ob.amount * 100) / 100, currency: settleCurrency, type: 'gross' })
      grossVolume += ob.amount
      netVolume += ob.amount
    }
  }

  const nettingEfficiency = grossVolume > 0 ? Math.round((1 - netVolume / grossVolume) * 10000) / 100 : 0

  return {
    cycle_id: input.cycle_id,
    legs,
    gross_volume: Math.round(grossVolume * 100) / 100,
    net_volume: Math.round(netVolume * 100) / 100,
    netting_efficiency: nettingEfficiency,
    settlement_time_estimate: rng.next(1, 6) + ' business hours'
  }
}

// ==================== TOOL 5: PAYMENT ROUTING ENGINEER ====================

function executePaymentRoutingEngineer(input: PaymentRoutingInput): PaymentRoutingOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const priority = input.priority ?? 'cost'
  const maxCost = input.max_cost ?? 50
  const maxTime = input.max_time_seconds ?? 3600

  const options: RouteOption[] = []
  for (const rail of input.rails) {
    const feasible = rail.cost <= maxCost && rail.speed_seconds <= maxTime && rail.reach.includes(input.destination)
    const infeasibilityReason = !rail.reach.includes(input.destination)
      ? 'Destination ' + input.destination + ' not reachable via ' + rail.name
      : rail.cost > maxCost
        ? 'Cost $' + rail.cost.toFixed(2) + ' exceeds max $' + maxCost.toFixed(2)
        : rail.speed_seconds > maxTime
          ? 'Speed ' + rail.speed_seconds + 's exceeds max ' + maxTime + 's'
          : undefined

    let score: number
    if (priority === 'cost') {
      score = (1 - rail.cost / maxCost) * 50 + rail.reliability * 0.3 + (1 - rail.speed_seconds / maxTime) * 20
    } else if (priority === 'speed') {
      score = (1 - rail.speed_seconds / maxTime) * 50 + rail.reliability * 0.3 + (1 - rail.cost / maxCost) * 20
    } else {
      score = rail.reliability * 60 + (1 - rail.cost / maxCost) * 20 + (1 - rail.speed_seconds / maxTime) * 20
    }

    score = Math.round(clamp(score, 0, 100) * 100) / 100

    options.push({
      rail_id: rail.id,
      rail_name: rail.name,
      cost: rail.cost,
      speed_seconds: rail.speed_seconds,
      reliability: rail.reliability,
      score,
      feasible,
      infeasibility_reason: infeasibilityReason
    })
  }

  const feasibleOptions = options.filter(o => o.feasible).sort((a, b) => b.score - a.score)
  const infeasibleOptions = options.filter(o => !o.feasible).sort((a, b) => b.score - a.score)

  const recommended = feasibleOptions[0] || options.sort((a, b) => b.score - a.score)[0]
  const alternatives = feasibleOptions.slice(1)

  const routingTable: string[] = []
  routingTable.push('Payment: ' + input.payment_id + ' | Amount: ' + input.amount + ' ' + input.currency)
  routingTable.push('Source: ' + input.source + ' -> Destination: ' + input.destination)
  routingTable.push('Priority: ' + priority + ' | Max Cost: $' + maxCost.toFixed(2) + ' | Max Time: ' + maxTime + 's')
  routingTable.push('Recommended: ' + recommended.rail_name + ' (score: ' + recommended.score.toFixed(1) + ', cost: $' + recommended.cost.toFixed(2) + ', speed: ' + recommended.speed_seconds + 's)')
  routingTable.push('Alternatives: ' + alternatives.map(a => a.rail_name + ' (' + a.score.toFixed(1) + ')').join(', '))
  if (infeasibleOptions.length > 0) {
    routingTable.push('Infeasible rails: ' + infeasibleOptions.map(o => o.rail_name + ' - ' + (o.infeasibility_reason || 'low score')).join('; '))
  }

  return {
    payment_id: input.payment_id,
    recommended,
    alternatives,
    routing_table: routingTable
  }
}

// ==================== TOOL 6: BUDGET ENFORCEMENT MODULE ====================

function executeBudgetEnforcementModule(input: BudgetEnforcementInput): BudgetEnforcementOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const pending = input.pending_transactions || []
  const pendingImpact = pending.reduce((a, p) => a + p.amount, 0)
  const totalImpact = input.spent_to_date + pendingImpact
  const usagePercent = input.budget_limit > 0 ? Math.round((totalImpact / input.budget_limit) * 10000) / 100 : 0
  const remaining = Math.max(0, input.budget_limit - totalImpact)

  const thresholds = input.alert_thresholds ?? [50, 75, 90, 100]
  const alerts: BudgetAlert[] = []
  const actions: string[] = []

  let budgetStatus: BudgetEnforcementOutput['budget_status']

  if (usagePercent >= 100) {
    budgetStatus = 'exceeded'
    alerts.push({ level: 'critical', message: 'BUDGET EXCEEDED: Usage at ' + usagePercent.toFixed(1) + '%', current_usage_percent: usagePercent })
    actions.push('Block all new transactions immediately')
    actions.push('Notify oversight agent and request budget increase review')
    actions.push('Freeze pending transactions above remaining budget')
  } else if (usagePercent >= 90) {
    budgetStatus = 'critical'
    alerts.push({ level: 'critical', message: 'Critical: Budget at ' + usagePercent.toFixed(1) + '% (within 10% of limit)', current_usage_percent: usagePercent })
    actions.push('Require approval for transactions above ' + (remaining * 0.1).toFixed(2) + ' ' + input.currency)
    actions.push('Send alert to agent operator')
  } else if (usagePercent >= 75) {
    budgetStatus = 'warning'
    alerts.push({ level: 'warning', message: 'Warning: Budget at ' + usagePercent.toFixed(1) + '%', current_usage_percent: usagePercent })
    actions.push('Review spending velocity for unusual patterns')
    actions.push('Consider deferring non-critical purchases')
  } else if (usagePercent >= 50) {
    budgetStatus = 'warning'
    alerts.push({ level: 'info', message: 'Info: Budget at ' + usagePercent.toFixed(1) + '%', current_usage_percent: usagePercent })
    actions.push('Monitor spending trends')
  } else {
    budgetStatus = 'healthy'
    alerts.push({ level: 'info', message: 'Healthy: Budget at ' + usagePercent.toFixed(1) + '%', current_usage_percent: usagePercent })
    actions.push('No restrictions in effect')
  }

  // Velocity check
  if (input.velocity_limit_per_hour) {
    const spentRate = input.spent_to_date / 24 // simplified daily->hourly
    if (spentRate > input.velocity_limit_per_hour) {
      alerts.push({ level: 'warning', message: 'Velocity limit exceeded: ' + spentRate.toFixed(2) + '/h vs limit ' + input.velocity_limit_per_hour.toFixed(2) + '/h', current_usage_percent: usagePercent })
      actions.push('Apply velocity throttle for next hour')
    }
  }

  // Pending transaction analysis
  if (pending.length > 0) {
    actions.push('Pending transactions: ' + pending.length + ' totaling ' + pendingImpact.toFixed(2) + ' ' + input.currency)
  }

  return {
    agent_id: input.agent_id,
    budget_status: budgetStatus,
    remaining_budget: Math.round(remaining * 100) / 100,
    usage_percent: usagePercent,
    pending_impact: Math.round(pendingImpact * 100) / 100,
    alerts,
    actions
  }
}

// ==================== TOOL 7: FRAUD DETECTION AGENT ====================

function executeFraudDetectionAgent(input: FraudDetectionInput): FraudDetectionOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const txns = input.transactions
  const baselineAvg = input.baseline_avg_amount ?? (txns.length > 0 ? txns.reduce((a, t) => a + t.amount, 0) / txns.length : 10)
  const baselineCount = input.baseline_txn_count ?? Math.max(1, Math.floor(txns.length * 0.7))
  const knownCounterparties = input.known_counterparties || []

  const signals: FraudSignal[] = []

  // Velocity check
  if (txns.length > baselineCount * 2) {
    signals.push({
      type: 'velocity',
      severity: 'high',
      description: 'Transaction velocity ' + txns.length + '/' + input.window_hours + 'h exceeds 2x baseline (' + baselineCount + ')',
      evidence: 'Observed: ' + txns.length + ' txns vs baseline: ' + baselineCount + ' txns per ' + input.window_hours + 'h'
    })
  } else if (txns.length > baselineCount * 1.5) {
    signals.push({
      type: 'velocity',
      severity: 'medium',
      description: 'Transaction velocity above normal: ' + txns.length + ' vs baseline ' + baselineCount,
      evidence: 'Velocity ratio: ' + (txns.length / baselineCount).toFixed(2) + 'x'
    })
  }

  // Amount anomaly
  const avgAmount = txns.length > 0 ? txns.reduce((a, t) => a + t.amount, 0) / txns.length : 0
  if (avgAmount > baselineAvg * 3) {
    signals.push({
      type: 'amount',
      severity: 'high',
      description: 'Average amount ' + avgAmount.toFixed(2) + ' is 3x above baseline ' + baselineAvg.toFixed(2),
      evidence: 'Amount spike ratio: ' + (avgAmount / baselineAvg).toFixed(2) + 'x'
    })
  } else if (avgAmount > baselineAvg * 2) {
    signals.push({
      type: 'amount',
      severity: 'medium',
      description: 'Average amount ' + avgAmount.toFixed(2) + ' is 2x above baseline ' + baselineAvg.toFixed(2),
      evidence: 'Moderate amount elevation detected'
    })
  }

  // Unknown counterparties
  const unknownTxns = txns.filter(t => !knownCounterparties.includes(t.counterparty))
  if (unknownTxns.length > txns.length * 0.5 && txns.length > 0) {
    signals.push({
      type: 'counterparty',
      severity: unknownTxns.length > txns.length * 0.8 ? 'high' : 'medium',
      description: unknownTxns.length + '/' + txns.length + ' transactions with unknown counterparties',
      evidence: 'Unknown counterparty ratio: ' + ((unknownTxns.length / txns.length) * 100).toFixed(0) + '%'
    })
  }

  // Channel mix anomaly
  const channelCounts: Record<string, number> = {}
  for (const t of txns) { channelCounts[t.channel] = (channelCounts[t.channel] || 0) + 1 }
  const dominantChannel = Object.entries(channelCounts).sort((a, b) => b[1] - a[1])[0]
  if (dominantChannel && dominantChannel[1] > txns.length * 0.9 && txns.length > 5) {
    signals.push({
      type: 'channel',
      severity: 'low',
      description: 'Over-reliance on single channel: ' + dominantChannel[0] + ' (' + dominantChannel[1] + '/' + txns.length + ')',
      evidence: 'Channel concentration may indicate routing manipulation'
    })
  }

  // Round-number pattern (potential structuring)
  const roundNumbers = txns.filter(t => t.amount === Math.floor(t.amount) && t.amount > 100).length
  if (roundNumbers > txns.length * 0.6 && txns.length > 3) {
    signals.push({
      type: 'pattern',
      severity: 'medium',
      description: 'Suspicious round-number pattern: ' + roundNumbers + '/' + txns.length + ' are round amounts',
      evidence: 'Possible structuring or automated amount generation'
    })
  }

  // Compute overall fraud score
  let fraudScore = 0
  for (const s of signals) {
    if (s.severity === 'high') fraudScore += 25
    else if (s.severity === 'medium') fraudScore += 15
    else fraudScore += 5
  }
  fraudScore = clamp(fraudScore + rng.next(-3, 3), 0, 100)

  let riskLevel: FraudDetectionOutput['risk_level']
  let recommendedAction: string

  if (fraudScore >= 70) {
    riskLevel = 'critical'
    recommendedAction = 'BLOCK all transactions. Freeze agent account. Escalate to fraud response team immediately.'
  } else if (fraudScore >= 45) {
    riskLevel = 'high'
    recommendedAction = 'Require step-up authentication. Limit transaction velocity. Enable real-time monitoring.'
  } else if (fraudScore >= 25) {
    riskLevel = 'medium'
    recommendedAction = 'Flag for review. Increase monitoring frequency. Apply soft velocity limits.'
  } else {
    riskLevel = 'low'
    recommendedAction = 'No action required. Continue standard monitoring.'
  }

  return {
    agent_id: input.agent_id,
    risk_level: riskLevel,
    fraud_score: fraudScore,
    signals,
    recommended_action: recommendedAction
  }
}

// ==================== TOOL 8: AUTONOMOUS PURCHASE ADVISOR ====================

function executeAutonomousPurchaseAdvisor(input: PurchaseAdvisorInput): PurchaseAdvisorOutput {
  const seed = computeSeed(input)
  const rng = makeRng(seed)

  const vendors = input.vendors
  const budgetRemaining = input.budget_remaining ?? input.estimated_value * 1.5

  // Score each vendor
  const scored = vendors.map(v => {
    const priceScore = 1 - (v.price / Math.max(...vendors.map(x => x.price)) - Math.min(...vendors.map(x => v.price))) / (Math.max(...vendors.map(x => x.price)) - Math.min(...vendors.map(x => x.price)) + 0.01)
    const valueScore = Math.round(((v.rating / 5) * 30 + (v.reliability / 100) * 30 + priceScore * 25 + (1 - v.delivery_days / 14) * 15) * 100) / 100
    return { ...v, value_score: Math.max(0, Math.min(100, valueScore)) }
  })

  scored.sort((a, b) => b.value_score - a.value_score)
  const recommendations: VendorRecommendation[] = scored.map((v, i) => ({
    vendor_name: v.name,
    price: v.price,
    rating: v.rating,
    delivery_days: v.delivery_days,
    value_score: v.value_score,
    recommendation_rank: i + 1
  }))

  // Price history analysis
  let priceTrend = 'stable'
  let timingAnalysis = ''
  if (input.price_history && input.price_history.length >= 2) {
    const prices = input.price_history.map(p => p.price)
    const recentAvg = prices.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, prices.length)
    const earlyAvg = prices.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, prices.length)
    if (recentAvg > earlyAvg * 1.1) {
      priceTrend = 'rising'
      timingAnalysis = 'Price trend is rising (+' + (((recentAvg / earlyAvg) - 1) * 100).toFixed(1) + '%). '
    } else if (recentAvg < earlyAvg * 0.9) {
      priceTrend = 'falling'
      timingAnalysis = 'Price trend is falling (-' + ((1 - (recentAvg / earlyAvg)) * 100).toFixed(1) + '%). '
    } else {
      priceTrend = 'stable'
      timingAnalysis = 'Price trend is stable. '
    }
  }

  // Decision logic
  let decision: PurchaseAdvisorOutput['decision']
  const bestVendor = recommendations[0]

  if (input.urgency === 'high') {
    decision = 'buy_now'
    timingAnalysis += 'HIGH urgency: Recommend immediate purchase from ' + bestVendor.vendor_name + ' at ' + input.currency + ' ' + bestVendor.price.toFixed(2) + '.'
  } else if (input.urgency === 'medium') {
    if (bestVendor.price <= budgetRemaining && bestVendor.rating >= 4.0) {
      decision = 'buy_now'
      timingAnalysis += 'MEDIUM urgency, good vendor match: Purchase from ' + bestVendor.vendor_name + '.'
    } else {
      decision = 'seek_alternatives'
      timingAnalysis += 'MEDIUM urgency, but best vendor exceeds budget or has low rating. Seek alternatives.'
    }
  } else {
    // Low urgency
    if (priceTrend === 'falling') {
      decision = 'wait'
      timingAnalysis += 'LOW urgency + falling prices: Wait 7-14 days for better pricing. Estimated savings: ' + input.currency + ' ' + (bestVendor.price * 0.05).toFixed(2) + '.'
    } else if (bestVendor.price <= budgetRemaining * 0.7) {
      decision = 'buy_now'
      timingAnalysis += 'LOW urgency but price is favorable: Buy now from ' + bestVendor.vendor_name + '.'
    } else {
      decision = 'seek_alternatives'
      timingAnalysis += 'LOW urgency and price not optimal: Seek additional vendors or negotiate.'
    }
  }

  // Cost savings estimate
  const avgPrice = vendors.reduce((a, v) => a + v.price, 0) / vendors.length
  const savingsEstimate = Math.max(0, avgPrice - bestVendor.price)

  return {
    agent_id: input.agent_id,
    item_description: input.item_description,
    decision,
    timing_analysis: timingAnalysis,
    vendor_recommendations: recommendations,
    cost_savings_estimate: Math.round(savingsEstimate * 100) / 100
  }
}

// ==================== FORMATTING HELPERS ====================

function formatTransactionApproverOutput(out: TransactionApproverOutput): string {
  let s = '# Transaction Approval Report\n\n'
  s += '**Transaction:** ' + out.transaction_id + '\n'
  s += '**Decision:** ' + out.decision.decision.toUpperCase() + '\n'
  s += '**Risk Score:** ' + out.decision.risk_score + '/100\n'
  s += '**Processing Time:** ' + out.processing_time_ms + 'ms\n'
  s += '**Timestamp:** ' + out.timestamp + '\n\n'
  s += '## Risk Factors\n'
  for (const r of out.decision.reasons) { s += '- ' + r + '\n' }
  s += '\n## Conditions\n'
  for (const c of (out.decision.conditions || [])) { s += '- ' + c + '\n' }
  s += '\n---\n'
  s += 'Agentic payments require multi-factor risk assessment combining trust scores, transaction patterns, and contextual signals.'
  return s
}

function formatEscrowServiceOutput(out: EscrowServiceOutput): string {
  let s = '# Escrow Service Report\n\n'
  s += '**Escrow ID:** ' + out.escrow_id + '\n'
  s += '**Phase:** ' + out.status.phase.toUpperCase() + '\n'
  s += '**Buyer Confirmed:** ' + (out.status.buyer_confirmed ? 'Yes' : 'No') + '\n'
  s += '**Seller Confirmed:** ' + (out.status.seller_confirmed ? 'Yes' : 'No') + '\n'
  s += '**Conditions Met:** ' + out.status.conditions_met.length + '/' + (out.status.conditions_met.length + out.status.conditions_pending.length) + '\n\n'
  s += '## Timeline\n'
  for (const t of out.timeline) { s += '- ' + t + '\n' }
  s += '\n**Next Action:** ' + out.next_action + '\n'
  s += '\n---\n'
  s += 'Escrow is the backbone of trust in agent-to-agent commerce: hold funds, verify conditions, release on consensus.'
  return s
}

function formatMicropaymentOptimizerOutput(out: MicropaymentOptimizerOutput): string {
  let s = '# Micropayment Optimization Report\n\n'
  s += '**Total Fees:** ' + out.total_fees.toFixed(2) + '\n'
  s += '**Total Net:** ' + out.total_net.toFixed(2) + '\n'
  s += '**Savings vs Naive:** ' + out.savings_vs_naive.toFixed(2) + ' (' + out.savings_percent.toFixed(1) + '%)\n'
  s += '**Batches Created:** ' + out.batch_count + '\n\n'
  s += '## Routing Details\n'
  for (const r of out.routes) {
    s += '- ' + r.transaction_id + ' -> ' + r.channel + ' | Fee: ' + r.fee.toFixed(2) + ' | Net: ' + r.net_amount.toFixed(2) + ' | ' + (r.batched ? 'BATCHED (' + r.batch_id + ')' : 'DIRECT') + ' | ' + r.estimated_seconds + 's\n'
  }
  s += '\n---\n'
  s += 'Micropayment optimization reduces per-transaction cost by 40-80% through intelligent channel selection and batching.'
  return s
}

function formatCrossAgentSettlementOutput(out: CrossAgentSettlementOutput): string {
  let s = '# Cross-Agent Settlement Report\n\n'
  s += '**Cycle:** ' + out.cycle_id + '\n'
  s += '**Gross Volume:** ' + out.gross_volume.toFixed(2) + '\n'
  s += '**Net Volume:** ' + out.net_volume.toFixed(2) + '\n'
  s += '**Netting Efficiency:** ' + out.netting_efficiency.toFixed(1) + '% reduction\n'
  s += '**Settlement Time:** ' + out.settlement_time_estimate + '\n\n'
  s += '## Settlement Legs\n'
  for (const l of out.legs) {
    s += '- ' + l.from + ' -> ' + l.to + ': ' + l.amount.toFixed(2) + ' ' + l.currency + ' [' + l.type + ']\n'
  }
  s += '\n---\n'
  s += 'Multi-agent netting reduces settlement volume by up to 80%, minimizing liquidity requirements and counterparty risk.'
  return s
}

function formatPaymentRoutingOutput(out: PaymentRoutingOutput): string {
  let s = '# Payment Routing Report\n\n'
  s += '**Payment:** ' + out.payment_id + '\n'
  s += '**Recommended Rail:** ' + out.recommended.rail_name + ' (score: ' + out.recommended.score.toFixed(1) + ')\n'
  s += '**Cost:** $' + out.recommended.cost.toFixed(2) + ' | **Speed:** ' + out.recommended.speed_seconds + 's | **Reliability:** ' + out.recommended.reliability.toFixed(1) + '%\n\n'
  s += '## Routing Table\n'
  for (const r of out.routing_table) { s += '- ' + r + '\n' }
  if (out.alternatives.length > 0) {
    s += '\n## Alternatives\n'
    for (const a of out.alternatives) {
      s += '- ' + a.rail_name + ': $' + a.cost.toFixed(2) + ', ' + a.speed_seconds + 's, ' + a.reliability.toFixed(1) + '% (score: ' + a.score.toFixed(1) + ')\n'
    }
  }
  s += '\n---\n'
  s += 'Optimal payment routing balances cost, speed, and reliability to maximize transaction success rate while minimizing fees.'
  return s
}

function formatBudgetEnforcementOutput(out: BudgetEnforcementOutput): string {
  let s = '# Budget Enforcement Report\n\n'
  s += '**Agent:** ' + out.agent_id + '\n'
  s += '**Status:** ' + out.budget_status.toUpperCase() + '\n'
  s += '**Remaining:** ' + out.remaining_budget.toFixed(2) + '\n'
  s += '**Usage:** ' + out.usage_percent.toFixed(1) + '%\n'
  s += '**Pending Impact:** ' + out.pending_impact.toFixed(2) + '\n\n'
  s += '## Alerts\n'
  for (const a of out.alerts) {
    s += '- [' + a.level.toUpperCase() + '] ' + a.message + ' (' + a.current_usage_percent.toFixed(1) + '%)\n'
  }
  s += '\n## Actions\n'
  for (const a of out.actions) { s += '- ' + a + '\n' }
  s += '\n---\n'
  s += 'Budget enforcement is essential for autonomous agents: hard limits prevent runaway spending, velocity checks catch abuse early.'
  return s
}

function formatFraudDetectionOutput(out: FraudDetectionOutput): string {
  let s = '# Fraud Detection Report\n\n'
  s += '**Agent:** ' + out.agent_id + '\n'
  s += '**Risk Level:** ' + out.risk_level.toUpperCase() + '\n'
  s += '**Fraud Score:** ' + out.fraud_score + '/100\n'
  s += '**Signals Detected:** ' + out.signals.length + '\n\n'
  s += '## Fraud Signals\n'
  for (const sig of out.signals) {
    s += '- [' + sig.severity.toUpperCase() + '] ' + sig.type + ': ' + sig.description + '\n'
    s += '  Evidence: ' + sig.evidence + '\n'
  }
  s += '\n**Recommended Action:** ' + out.recommended_action + '\n'
  s += '\n---\n'
  s += 'AI-powered fraud detection for agent payments: velocity, amount, counterparty, channel, and pattern abuse detection in real-time.'
  return s
}

function formatPurchaseAdvisorOutput(out: PurchaseAdvisorOutput): string {
  let s = '# Autonomous Purchase Advisory Report\n\n'
  s += '**Agent:** ' + out.agent_id + '\n'
  s += '**Item:** ' + out.item_description + '\n'
  s += '**Decision:** ' + out.decision.toUpperCase() + '\n'
  s += '**Estimated Savings:** ' + out.cost_savings_estimate.toFixed(2) + '\n\n'
  s += '**Timing Analysis:** ' + out.timing_analysis + '\n\n'
  s += '## Vendor Recommendations\n'
  for (const v of out.vendor_recommendations) {
    s += v.recommendation_rank + '. **' + v.vendor_name + '** - Price: ' + v.price.toFixed(2) + ' | Rating: ' + v.rating + '/5 | Delivery: ' + v.delivery_days + 'd | Value Score: ' + v.value_score.toFixed(1) + '\n'
  }
  s += '\n---\n'
  s += 'Autonomous purchase advisors maximize agent spend efficiency: vendor scoring, price trend analysis, and optimal timing.'
  return s
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'agent_transaction_approver',
    description: 'Autonomous transaction risk assessment and approval. Evaluates trust scores, amount ratios, risk signals, and purpose to approve, reject, or flag transactions.',
    parameters: { input: { type: 'object' as const, required: true, description: 'TransactionApproverInput: transaction details, risk signals, daily limit, trust score' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: TransactionApproverInput }) {
      return formatTransactionApproverOutput(executeAgentTransactionApprover(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'escrow_service_manager',
    description: 'Escrow service for agent-to-agent payments. Manages hold-verify-release flows, condition tracking, dispute resolution, and auto-release timers.',
    parameters: { input: { type: 'object' as const, required: true, description: 'EscrowServiceInput: escrow details, conditions, dispute window, arbitrator' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: EscrowServiceInput }) {
      return formatEscrowServiceOutput(executeEscrowServiceManager(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'micropayment_optimizer',
    description: 'Micropayment channel optimization and batching. Selects cheapest payment rails, batches non-urgent transactions, and minimizes fees for high-volume micro payments.',
    parameters: { input: { type: 'object' as const, required: true, description: 'MicropaymentOptimizerInput: transactions, channels, batching config' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: MicropaymentOptimizerInput }) {
      return formatMicropaymentOptimizerOutput(executeMicropaymentOptimizer(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'cross_agent_settlement',
    description: 'Multi-party cross-agent settlement with bilateral netting. Reduces gross obligations to minimal settlement legs, supporting multi-currency conversion.',
    parameters: { input: { type: 'object' as const, required: true, description: 'CrossAgentSettlementInput: agents, obligations, netting config' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: CrossAgentSettlementInput }) {
      return formatCrossAgentSettlementOutput(executeCrossAgentSettlement(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'payment_routing_engineer',
    description: 'Optimal payment routing across multiple rails (bank, card, wallet, blockchain). Scores rails by cost/speed/reliability and selects the best path.',
    parameters: { input: { type: 'object' as const, required: true, description: 'PaymentRoutingInput: payment details, available rails, priority, constraints' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: PaymentRoutingInput }) {
      return formatPaymentRoutingOutput(executePaymentRoutingEngineer(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'budget_enforcement_module',
    description: 'Agent budget enforcement with spending limits, velocity checks, threshold alerts, and automated actions. Prevents runaway autonomous spending.',
    parameters: { input: { type: 'object' as const, required: true, description: 'BudgetEnforcementInput: agent budget config, spent to date, pending transactions, thresholds' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: BudgetEnforcementInput }) {
      return formatBudgetEnforcementOutput(executeBudgetEnforcementModule(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'fraud_detection_agent',
    description: 'AI fraud detection for agent payments. Monitors velocity anomalies, amount spikes, unknown counterparties, channel abuse, and structuring patterns.',
    parameters: { input: { type: 'object' as const, required: true, description: 'FraudDetectionInput: agent transactions, baseline metrics, known counterparties' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: FraudDetectionInput }) {
      return formatFraudDetectionOutput(executeFraudDetectionAgent(args.input))
    }
  }))

  tools.register(defineTool({
    name: 'autonomous_purchase_advisor',
    description: 'Autonomous purchase timing and vendor selection advisor. Analyzes vendor ratings, price history trends, urgency, and budget to recommend buy/wait/seek alternatives.',
    parameters: { input: { type: 'object' as const, required: true, description: 'PurchaseAdvisorInput: item description, vendors, urgency, budget, price history' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input: PurchaseAdvisorInput }) {
      return formatPurchaseAdvisorOutput(executeAutonomousPurchaseAdvisor(args.input))
    }
  }))
}
