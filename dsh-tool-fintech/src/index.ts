/**
 * DSH Financial Risk & Fraud Detection Toolkit Plugin v0.1.0
 *
 * Comprehensive financial risk management and fraud detection toolkit for DeepSeek Harness Agent.
 * Designed for fraud analysts, risk officers, compliance professionals, and fintech engineers.
 *
 * Features (v0.1.0):
 * - Transaction Monitor (suspicious pattern detection and risk scoring)
 * - Credit Scorer (creditworthiness assessment and default probability)
 * - AML Detector (anti-money laundering pattern recognition)
 * - Merchant Risk Scorer (merchant account risk evaluation)
 * - Identity Verification Scorer (identity fraud and verification assessment)
 * - Payment Fraud Detector (real-time payment fraud analysis)
 * - KYC Compliance_checker (Know Your Customer compliance validation)
 * - Behavior Biometrics Analyzer (bot detection and account takeover prevention)
 *
 * @module dsh-tool-fintech
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-fintech'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface Transaction {
  tx_id: string
  amount: number
  sender: string
  receiver: string
  timestamp: string
  channel: string
}

interface ApplicantData {
  income: number
  debt: number
  payment_history: number
  credit_age: number
  recent_inquiries: number
}

interface CustomerTransaction {
  customer_id: string
  amount: number
  frequency: number
  countries: string[]
  counterparties: string[]
}

interface MerchantData {
  business_type: string
  transaction_volume: number
  chargeback_ratio: number
  processing_history: number
}

interface IdentityData {
  document_type: string
  biometric_match: number
  address_verification: boolean
  device_fingerprint: string
  behavior_pattern: string
}

interface PaymentData {
  amount: number
  card_country: string
  merchant_country: string
  ip_address: string
  device_id: string
  velocity: number
}

interface KYCData {
  documents_provided: string[]
  pep_status: boolean
  sanctions_watchlist: boolean
  adverse_media: boolean
  source_of_wealth: string
}

interface SessionData {
  typing_speed: number
  mouse_movements: number
  touch_pressure: number
  session_duration: number
  navigation_pattern: string
}

// ==================== TOOL 1: TRANSACTION MONITOR ====================

interface TransactionMonitorResult {
  suspicious_patterns: Array<{
    tx_id: string
    pattern_type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    related_transactions: string[]
  }>
  risk_scores: Array<{
    tx_id: string
    score: number
    factors: string[]
  }>
  alert_levels: {
    low: number
    medium: number
    high: number
    critical: number
  }
  recommended_actions: Array<{
    action: string
    priority: string
    affected_transactions: string[]
  }>
  summary: {
    total_transactions: number
    flagged_count: number
    average_risk_score: number
    max_risk_score: number
  }
}

function analyzeTransactions(transactions: Transaction[]): TransactionMonitorResult {
  const suspicious_patterns: TransactionMonitorResult['suspicious_patterns'] = []
  const risk_scores: TransactionMonitorResult['risk_scores'] = []
  const alert_levels = { low: 0, medium: 0, high: 0, critical: 0 }
  const recommended_actions: TransactionMonitorResult['recommended_actions'] = []

  const senderCounts = new Map<string, number>()
  const receiverCounts = new Map<string, number>()
  const amountBySender = new Map<string, number>()

  for (const tx of transactions) {
    senderCounts.set(tx.sender, (senderCounts.get(tx.sender) ?? 0) + 1)
    receiverCounts.set(tx.receiver, (receiverCounts.get(tx.receiver) ?? 0) + 1)
    amountBySender.set(tx.sender, (amountBySender.get(tx.sender) ?? 0) + tx.amount)
  }

  for (const tx of transactions) {
    let score = 0
    const factors: string[] = []

    if (tx.amount > 10000) {
      score += 30
      factors.push('High transaction amount (>$10,000)')
    } else if (tx.amount > 5000) {
      score += 15
      factors.push('Elevated transaction amount (>$5,000)')
    }

    const senderTxCount = senderCounts.get(tx.sender) ?? 0
    if (senderTxCount > 10) {
      score += 25
      factors.push(`High frequency sender (${senderTxCount} transactions)`)
    }

    const receiverTxCount = receiverCounts.get(tx.receiver) ?? 0
    if (receiverTxCount > 10) {
      score += 20
      factors.push(`High frequency receiver (${receiverTxCount} transactions)`)
    }

    if (tx.channel === 'wire' && tx.amount > 5000) {
      score += 15
      factors.push('Large wire transfer')
    }
    if (tx.channel === 'crypto') {
      score += 20
      factors.push('Cryptocurrency channel')
    }

    const senderTotal = amountBySender.get(tx.sender) ?? 0
    if (senderTotal > 50000) {
      score += 20
      factors.push(`Sender cumulative volume $${senderTotal.toLocaleString()}`)
    }

    score = Math.min(score, 100)
    risk_scores.push({ tx_id: tx.tx_id, score, factors })

    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (score >= 80) {
      severity = 'critical'
      alert_levels.critical++
      suspicious_patterns.push({
        tx_id: tx.tx_id,
        pattern_type: 'high_risk_composite',
        severity,
        description: `Composite risk score ${score}/100 — multiple risk factors detected`,
        related_transactions: transactions.filter(t => t.sender === tx.sender && t.tx_id !== tx.tx_id).map(t => t.tx_id).slice(0, 5)
      })
    } else if (score >= 60) {
      severity = 'high'
      alert_levels.high++
      suspicious_patterns.push({
        tx_id: tx.tx_id,
        pattern_type: 'elevated_risk',
        severity,
        description: `Elevated risk score ${score}/100`,
        related_transactions: []
      })
    } else if (score >= 40) {
      alert_levels.medium++
    } else {
      alert_levels.low++
    }
  }

  const flagged = risk_scores.filter(r => r.score >= 60).length
  const scores = risk_scores.map(r => r.score)
  const avgScore = scores.reduce((s, v) => s + v, 0) / scores.length

  if (alert_levels.critical > 0) {
    recommended_actions.push({
      action: 'Immediate review required for critical risk transactions',
      priority: 'URGENT',
      affected_transactions: risk_scores.filter(r => r.score >= 80).map(r => r.tx_id)
    })
  }
  if (alert_levels.high > 0) {
    recommended_actions.push({
      action: 'Enhanced due diligence for high-risk transactions',
      priority: 'HIGH',
      affected_transactions: risk_scores.filter(r => r.score >= 60 && r.score < 80).map(r => r.tx_id)
    })
  }
  if (flagged > 0) {
    recommended_actions.push({
      action: 'File SAR for suspicious activity patterns',
      priority: 'MEDIUM',
      affected_transactions: risk_scores.filter(r => r.score >= 70).map(r => r.tx_id)
    })
  }

  return {
    suspicious_patterns,
    risk_scores,
    alert_levels,
    recommended_actions,
    summary: {
      total_transactions: transactions.length,
      flagged_count: flagged,
      average_risk_score: avgScore,
      max_risk_score: scores.length > 0 ? Math.max(...scores) : 0
    }
  }
}

function formatTransactionMonitorReport(result: TransactionMonitorResult): string {
  const lines: string[] = []
  lines.push('## Transaction Monitoring Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_transactions} transactions analyzed | ${result.summary.flagged_count} flagged`)
  lines.push(`- Average Risk Score: ${result.summary.average_risk_score.toFixed(1)}/100 | Max Score: ${result.summary.max_risk_score}/100`)
  lines.push('')
  lines.push('### Alert Distribution')
  lines.push(`- Critical: ${result.alert_levels.critical} | High: ${result.alert_levels.high} | Medium: ${result.alert_levels.medium} | Low: ${result.alert_levels.low}`)
  lines.push('')

  if (result.suspicious_patterns.length > 0) {
    lines.push('### Suspicious Patterns Detected')
    lines.push('| TX ID | Pattern | Severity | Description |')
    lines.push('|-------|---------|----------|-------------|')
    for (const p of result.suspicious_patterns.slice(0, 15)) {
      lines.push(`| ${p.tx_id} | ${p.pattern_type} | ${p.severity.toUpperCase()} | ${p.description.substring(0, 60)} |`)
    }
    lines.push('')
  }

  if (result.recommended_actions.length > 0) {
    lines.push('### Recommended Actions')
    for (const a of result.recommended_actions) {
      lines.push(`**[${a.priority}]** ${a.action}`)
      lines.push(`  - Affected: ${a.affected_transactions.join(', ') || 'None'}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: CREDIT SCORER ====================

interface CreditScorerResult {
  credit_score: number
  risk_grade: string
  approval_recommendation: string
  credit_limit_suggestion: number
  probability_of_default: number
  factors: string[]
  recommendations: string[]
}

function scoreCredit(applicant: ApplicantData): CreditScorerResult {
  let score = 300
  const factors: string[] = []

  const dti = applicant.income > 0 ? (applicant.debt / applicant.income) * 100 : 100
  if (dti < 20) {
    score += 150
    factors.push(`Low DTI ratio (${dti.toFixed(1)}%)`)
  } else if (dti < 36) {
    score += 100
    factors.push(`Moderate DTI ratio (${dti.toFixed(1)}%)`)
  } else if (dti < 50) {
    score += 30
    factors.push(`Elevated DTI ratio (${dti.toFixed(1)}%)`)
  } else {
    score -= 50
    factors.push(`High DTI ratio (${dti.toFixed(1)}%)`)
  }

  score += Math.round(applicant.payment_history * 1.5)
  factors.push(`Payment history score: ${applicant.payment_history}/100`)

  if (applicant.credit_age > 7) {
    score += 100
    factors.push(`Long credit history (${applicant.credit_age} years)`)
  } else if (applicant.credit_age > 3) {
    score += 60
    factors.push(`Moderate credit history (${applicant.credit_age} years)`)
  } else {
    score += 20
    factors.push(`Short credit history (${applicant.credit_age} years)`)
  }

  if (applicant.recent_inquiries === 0) {
    score += 50
    factors.push('No recent credit inquiries')
  } else if (applicant.recent_inquiries <= 2) {
    score += 20
    factors.push(`Few recent inquiries (${applicant.recent_inquiries})`)
  } else {
    score -= 30
    factors.push(`Multiple recent inquiries (${applicant.recent_inquiries})`)
  }

  if (applicant.income > 100000) {
    score += 80
    factors.push('High income')
  } else if (applicant.income > 50000) {
    score += 40
    factors.push('Moderate income')
  } else {
    score += 10
    factors.push('Lower income')
  }

  score = Math.max(300, Math.min(score, 850))

  let risk_grade: string
  let approval: string
  if (score >= 750) {
    risk_grade = 'AAA'
    approval = 'Strongly Approve'
  } else if (score >= 700) {
    risk_grade = 'AA'
    approval = 'Approve'
  } else if (score >= 650) {
    risk_grade = 'A'
    approval = 'Approve with standard terms'
  } else if (score >= 600) {
    risk_grade = 'BBB'
    approval = 'Approved with conditions'
  } else if (score >= 550) {
    risk_grade = 'BB'
    approval = 'Marginal — manual review required'
  } else if (score >= 500) {
    risk_grade = 'B'
    approval = 'Decline or require collateral'
  } else {
    risk_grade = 'C'
    approval = 'Decline'
  }

  const pd = Math.max(0.1, Math.min(40, (850 - score) / 20))

  let creditLimit: number
  if (score >= 750) {
    creditLimit = applicant.income * 0.3
  } else if (score >= 700) {
    creditLimit = applicant.income * 0.2
  } else if (score >= 650) {
    creditLimit = applicant.income * 0.1
  } else if (score >= 600) {
    creditLimit = applicant.income * 0.05
  } else {
    creditLimit = applicant.income * 0.02
  }

  const recommendations: string[] = []
  if (dti > 36) recommendations.push('Recommend debt reduction before approval')
  if (applicant.recent_inquiries > 3) recommendations.push('High inquiry count suggests credit shopping')
  if (applicant.payment_history < 70) recommendations.push('Suboptimal payment history — consider secured product')
  if (applicant.credit_age < 2) recommendations.push('Thin credit file — limited data for assessment')

  return {
    credit_score: score,
    risk_grade,
    approval_recommendation: approval,
    credit_limit_suggestion: Math.round(creditLimit),
    probability_of_default: pd,
    factors,
    recommendations
  }
}

function formatCreditScorerReport(result: CreditScorerResult): string {
  const lines: string[] = []
  lines.push('## Credit Scoring Report')
  lines.push('')
  lines.push(`**Credit Score:** ${result.credit_score} | **Risk Grade:** ${result.risk_grade}`)
  lines.push(`**Approval:** ${result.approval_recommendation}`)
  lines.push(`**Credit Limit Suggestion:** $${result.credit_limit_suggestion.toLocaleString()}`)
  lines.push(`**Probability of Default:** ${result.probability_of_default.toFixed(2)}%`)
  lines.push('')
  lines.push('### Scoring Factors')
  for (const f of result.factors) {
    lines.push(`- ${f}`)
  }
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const r of result.recommendations) {
      lines.push(`→ ${r}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 3: AML DETECTOR ====================

interface AMLResult {
  structuring_indicators: Array<{
    customer_id: string
    indicator: string
    severity: 'low' | 'medium' | 'high'
    details: string
  }>
  layering_patterns: Array<{
    customer_id: string
    pattern: string
    complexity_score: number
    description: string
  }>
  integration_risk: Array<{
    customer_id: string
    risk_level: string
    risk_factors: string[]
  }>
  sar_filing_recommendation: {
    should_file: boolean
    priority: string
    affected_customers: string[]
    rationale: string
  }
  summary: {
    total_customers_analyzed: number
    suspicious_customers: number
    structuring_detected: number
    layering_detected: number
  }
}

function detectAML(transactions: CustomerTransaction[]): AMLResult {
  const structuring_indicators: AMLResult['structuring_indicators'] = []
  const layering_patterns: AMLResult['layering_patterns'] = []
  const integration_risk: AMLResult['integration_risk'] = []

  const suspiciousCustomers = new Set<string>()

  for (const tx of transactions) {
    if (tx.amount >= 9000 && tx.amount < 10000) {
      structuring_indicators.push({
        customer_id: tx.customer_id,
        indicator: 'just_below_threshold',
        severity: 'high',
        details: `Transaction amount $${tx.amount.toLocaleString()} is just below the $10,000 CTR threshold`
      })
      suspiciousCustomers.add(tx.customer_id)
    }

    if (tx.frequency > 20) {
      structuring_indicators.push({
        customer_id: tx.customer_id,
        indicator: 'high_frequency_structuring',
        severity: 'high',
        details: `${tx.frequency} transactions detected — possible structured frequency patterns`
      })
      suspiciousCustomers.add(tx.customer_id)
    }

    if (tx.countries.length > 3) {
      layering_patterns.push({
        customer_id: tx.customer_id,
        pattern: 'multi_jurisdictional_layering',
        complexity_score: Math.min(10, tx.countries.length * 2),
        description: `Transactions across ${tx.countries.length} jurisdictions: ${tx.countries.join(', ')}`
      })
      suspiciousCustomers.add(tx.customer_id)
    }

    if (tx.counterparties.length > 5) {
      layering_patterns.push({
        customer_id: tx.customer_id,
        pattern: 'rapid_counterparty_movement',
        complexity_score: Math.min(10, tx.counterparties.length * 1.5),
        description: `Rapid movement between ${tx.counterparties.length} counterparties`
      })
      suspiciousCustomers.add(tx.customer_id)
    }

    const risk_factors: string[] = []
    if (tx.amount > 50000) risk_factors.push('Large transaction amount')
    if (tx.countries.some(c => ['high_risk', 'sanctioned', 'offshore'].includes(c.toLowerCase()))) {
      risk_factors.push('High-risk jurisdiction involvement')
    }
    if (tx.frequency > 15) risk_factors.push('Abnormal transaction frequency')
    if (tx.counterparties.length > 8) risk_factors.push('Excessive counterparty count')

    if (risk_factors.length > 0) {
      const risk_level = risk_factors.length >= 3 ? 'HIGH' : risk_factors.length >= 2 ? 'MEDIUM' : 'LOW'
      integration_risk.push({
        customer_id: tx.customer_id,
        risk_level,
        risk_factors
      })
    }
  }

  const structuringCount = structuring_indicators.length > 0
    ? new Set(structuring_indicators.map(s => s.customer_id)).size
    : 0
  const layeringCount = layering_patterns.length > 0
    ? new Set(layering_patterns.map(l => l.customer_id)).size
    : 0

  const shouldFileSAR = suspiciousCustomers.size > 0 && (structuringCount > 0 || layeringCount > 0)

  return {
    structuring_indicators,
    layering_patterns,
    integration_risk,
    sar_filing_recommendation: {
      should_file: shouldFileSAR,
      priority: structuringCount > 2 ? 'URGENT' : structuringCount > 0 ? 'HIGH' : 'STANDARD',
      affected_customers: Array.from(suspiciousCustomers),
      rationale: shouldFileSAR
        ? `${suspiciousCustomers.size} customer(s) exhibit structuring or layering patterns consistent with money laundering`
        : 'No significant AML patterns detected'
    },
    summary: {
      total_customers_analyzed: new Set(transactions.map(t => t.customer_id)).size,
      suspicious_customers: suspiciousCustomers.size,
      structuring_detected: structuringCount,
      layering_detected: layeringCount
    }
  }
}

function formatAMLReport(result: AMLResult): string {
  const lines: string[] = []
  lines.push('## Anti-Money Laundering Detection Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.total_customers_analyzed} customers analyzed | ${result.summary.suspicious_customers} suspicious`)
  lines.push(`- Structuring detected: ${result.summary.structuring_detected} | Layering detected: ${result.summary.layering_detected}`)
  lines.push('')

  if (result.structuring_indicators.length > 0) {
    lines.push('### Structuring Indicators')
    lines.push('| Customer | Indicator | Severity | Details |')
    lines.push('|----------|-----------|----------|---------|')
    for (const s of result.structuring_indicators.slice(0, 15)) {
      lines.push(`| ${s.customer_id} | ${s.indicator} | ${s.severity.toUpperCase()} | ${s.details.substring(0, 50)} |`)
    }
    lines.push('')
  }

  if (result.layering_patterns.length > 0) {
    lines.push('### Layering Patterns')
    lines.push('| Customer | Pattern | Complexity | Description |')
    lines.push('|----------|---------|------------|-------------|')
    for (const l of result.layering_patterns.slice(0, 15)) {
      lines.push(`| ${l.customer_id} | ${l.pattern} | ${l.complexity_score.toFixed(1)}/10 | ${l.description.substring(0, 50)} |`)
    }
    lines.push('')
  }

  if (result.integration_risk.length > 0) {
    lines.push('### Integration Risk')
    for (const r of result.integration_risk.slice(0, 10)) {
      lines.push(`- **${r.customer_id}**: ${r.risk_level} risk`)
      for (const f of r.risk_factors) {
        lines.push(`  - ${f}`)
      }
    }
    lines.push('')
  }

  lines.push('### SAR Filing Recommendation')
  lines.push(`**Should File SAR:** ${result.sar_filing_recommendation.should_file ? 'YES' : 'NO'}`)
  lines.push(`**Priority:** ${result.sar_filing_recommendation.priority}`)
  lines.push(`**Rationale:** ${result.sar_filing_recommendation.rationale}`)
  if (result.sar_filing_recommendation.affected_customers.length > 0) {
    lines.push(`**Affected Customers:** ${result.sar_filing_recommendation.affected_customers.join(', ')}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 4: MERCHANT RISK SCORER ====================

interface MerchantRiskResult {
  risk_rating: string
  reserve_requirement: number
  monitoring_level: string
  termination_recommendation: boolean
  risk_factors: string[]
  score_breakdown: {
    chargeback_score: number
    volume_score: number
    history_score: number
    business_type_score: number
    total_score: number
  }
  recommendations: string[]
}

function scoreMerchantRisk(merchant: MerchantData): MerchantRiskResult {
  const risk_factors: string[] = []
  let totalScore = 0

  let chargeback_score = 0
  if (merchant.chargeback_ratio > 0.02) {
    chargeback_score = 40
    risk_factors.push(`Critical chargeback ratio: ${(merchant.chargeback_ratio * 100).toFixed(2)}%`)
  } else if (merchant.chargeback_ratio > 0.01) {
    chargeback_score = 25
    risk_factors.push(`Elevated chargeback ratio: ${(merchant.chargeback_ratio * 100).toFixed(2)}%`)
  } else if (merchant.chargeback_ratio > 0.005) {
    chargeback_score = 10
    risk_factors.push(`Moderate chargeback ratio: ${(merchant.chargeback_ratio * 100).toFixed(2)}%`)
  }
  totalScore += chargeback_score

  let volume_score = 0
  if (merchant.transaction_volume > 500000) {
    volume_score = 20
    risk_factors.push(`High transaction volume: $${merchant.transaction_volume.toLocaleString()}/mo`)
  } else if (merchant.transaction_volume > 100000) {
    volume_score = 10
  }
  totalScore += volume_score

  let history_score = 0
  if (merchant.processing_history < 6) {
    history_score = 25
    risk_factors.push(`Limited processing history: ${merchant.processing_history} months`)
  } else if (merchant.processing_history < 12) {
    history_score = 10
  }
  totalScore += history_score

  let business_type_score = 0
  const highRiskBusinesses = ['gambling', 'crypto', 'adult', 'pharmaceutical', 'travel', 'telemarketing']
  if (highRiskBusinesses.includes(merchant.business_type.toLowerCase())) {
    business_type_score = 20
    risk_factors.push(`High-risk business type: ${merchant.business_type}`)
  }
  totalScore += business_type_score

  let risk_rating: string
  let monitoring_level: string
  let reserve_requirement: number
  let termination: boolean

  if (totalScore >= 70) {
    risk_rating = 'CRITICAL'
    monitoring_level = 'Continuous real-time monitoring'
    reserve_requirement = 0.15
    termination = true
  } else if (totalScore >= 50) {
    risk_rating = 'HIGH'
    monitoring_level = 'Daily review with weekly audits'
    reserve_requirement = 0.10
    termination = false
  } else if (totalScore >= 30) {
    risk_rating = 'MEDIUM'
    monitoring_level = 'Weekly review'
    reserve_requirement = 0.05
    termination = false
  } else {
    risk_rating = 'LOW'
    monitoring_level = 'Monthly review'
    reserve_requirement = 0.02
    termination = false
  }

  const recommendations: string[] = []
  if (termination) {
    recommendations.push('Recommend immediate termination of merchant account')
  }
  if (chargeback_score >= 25) {
    recommendations.push('Implement chargeback alert system and reserve hold')
  }
  if (history_score >= 25) {
    recommendations.push('Require additional financial documentation and personal guarantee')
  }
  if (business_type_score >= 20) {
    recommendations.push('Apply high-risk industry surcharge and enhanced monitoring')
  }
  if (recommendations.length === 0) {
    recommendations.push('Standard monitoring sufficient — no additional action required')
  }

  return {
    risk_rating,
    reserve_requirement,
    monitoring_level,
    termination_recommendation: termination,
    risk_factors,
    score_breakdown: {
      chargeback_score,
      volume_score,
      history_score,
      business_type_score,
      total_score: totalScore
    },
    recommendations
  }
}

function formatMerchantRiskReport(result: MerchantRiskResult): string {
  const lines: string[] = []
  lines.push('## Merchant Risk Assessment')
  lines.push('')
  lines.push(`**Risk Rating:** ${result.risk_rating}`)
  lines.push(`**Monitoring Level:** ${result.monitoring_level}`)
  lines.push(`**Reserve Requirement:** ${(result.reserve_requirement * 100).toFixed(0)}%`)
  lines.push(`**Termination Recommended:** ${result.termination_recommendation ? 'YES' : 'NO'}`)
  lines.push('')
  lines.push('### Score Breakdown')
  const sb = result.score_breakdown
  lines.push(`- Chargeback Score: ${sb.chargeback_score}/40`)
  lines.push(`- Volume Score: ${sb.volume_score}/20`)
  lines.push(`- History Score: ${sb.history_score}/25`)
  lines.push(`- Business Type Score: ${sb.business_type_score}/20`)
  lines.push(`- **Total: ${sb.total_score}/105**`)
  lines.push('')

  if (result.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const f of result.risk_factors) {
      lines.push(`- ${f}`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`→ ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: IDENTITY VERIFICATION SCORER ====================

interface IdentityVerificationResult {
  verification_score: number
  fraud_indicators: string[]
  step_up_authentication_needed: boolean
  manual_review_required: boolean
  confidence_level: string
  risk_factors: string[]
  recommendations: string[]
}

function scoreIdentityVerification(identity: IdentityData): IdentityVerificationResult {
  let score = 0
  const fraud_indicators: string[] = []
  const risk_factors: string[] = []

  const docScores: Record<string, number> = {
    'passport': 30, 'drivers_license': 25, 'national_id': 28,
    'residence_permit': 20, 'military_id': 22, 'other': 10
  }
  const docScore = docScores[identity.document_type.toLowerCase()] ?? 10
  score += docScore
  if (docScore < 20) {
    risk_factors.push(`Document type "${identity.document_type}" has lower verification reliability`)
  }

  const bioScore = Math.round(identity.biometric_match * 0.35)
  score += bioScore
  if (identity.biometric_match < 80) {
    fraud_indicators.push(`Low biometric match: ${identity.biometric_match}%`)
    risk_factors.push('Biometric confidence below acceptable threshold')
  } else if (identity.biometric_match < 90) {
    risk_factors.push('Biometric match is acceptable but not strong')
  }

  if (identity.address_verification) {
    score += 20
  } else {
    fraud_indicators.push('Address verification failed')
    risk_factors.push('Unverified residential address')
  }

  const deviceRisk = identity.device_fingerprint === 'new' ? -10 :
    identity.device_fingerprint === 'flagged' ? -20 : 5
  score += deviceRisk
  if (deviceRisk < 0) {
    fraud_indicators.push(`Device risk: ${identity.device_fingerprint}`)
    risk_factors.push(`Device fingerprint status: ${identity.device_fingerprint}`)
  }

  const behaviorScores: Record<string, number> = {
    'normal': 15, 'hesitant': 5, 'rushed': -5,
    'automated': -20, 'inconsistent': -15, 'suspicious': -25
  }
  const behaviorScore = behaviorScores[identity.behavior_pattern.toLowerCase()] ?? 0
  score += behaviorScore
  if (behaviorScore < 0) {
    fraud_indicators.push(`Behavioral anomaly: ${identity.behavior_pattern}`)
    risk_factors.push(`Pattern "${identity.behavior_pattern}" indicates potential fraud`)
  }

  score = Math.max(0, Math.min(score, 100))

  const stepUp = score < 70 || fraud_indicators.length >= 2
  const manualReview = score < 60 || fraud_indicators.length >= 3
  const confidence = score >= 85 ? 'HIGH' : score >= 65 ? 'MEDIUM' : 'LOW'

  const recommendations: string[] = []
  if (score < 50) {
    recommendations.push('Reject application — high fraud risk')
  } else if (score < 70) {
    recommendations.push('Request additional identity documents (secondary ID + proof of address)')
  }
  if (identity.biometric_match < 85) {
    recommendations.push('Re-run biometric verification with liveness detection')
  }
  if (!identity.address_verification) {
    recommendations.push('Require utility bill or bank statement for address confirmation')
  }
  if (identity.device_fingerprint === 'new') {
    recommendations.push('Flag new device — consider device binding for future authentication')
  }
  if (identity.behavior_pattern === 'automated') {
    recommendations.push('Automated behavior detected — block and investigate for bot activity')
  }
  if (recommendations.length === 0) {
    recommendations.push('Identity verified successfully — proceed with onboarding')
  }

  return {
    verification_score: score,
    fraud_indicators,
    step_up_authentication_needed: stepUp,
    manual_review_required: manualReview,
    confidence_level: confidence,
    risk_factors,
    recommendations
  }
}

function formatIdentityVerificationReport(result: IdentityVerificationResult): string {
  const lines: string[] = []
  lines.push('## Identity Verification Report')
  lines.push('')
  lines.push(`**Verification Score:** ${result.verification_score}/100 | **Confidence:** ${result.confidence_level}`)
  lines.push(`**Step-Up Authentication:** ${result.step_up_authentication_needed ? 'REQUIRED' : 'Not Required'}`)
  lines.push(`**Manual Review:** ${result.manual_review_required ? 'REQUIRED' : 'Not Required'}`)
  lines.push('')

  if (result.fraud_indicators.length > 0) {
    lines.push('### Fraud Indicators')
    for (const f of result.fraud_indicators) {
      lines.push(`⚠ ${f}`)
    }
    lines.push('')
  }

  if (result.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const r of result.risk_factors) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`→ ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: PAYMENT FRAUD DETECTOR ====================

interface PaymentFraudResult {
  fraud_score: number
  rule_triggers: string[]
  velocity_checks: {
    status: string
    current_velocity: number
    threshold: number
    exceeded: boolean
  }
  device_risk: {
    score: number
    risk_level: string
    factors: string[]
  }
  recommendation: string
  risk_factors: string[]
}

function detectPaymentFraud(payment: PaymentData): PaymentFraudResult {
  let fraud_score = 0
  const rule_triggers: string[] = []
  const risk_factors: string[] = []

  if (payment.amount > 5000) {
    fraud_score += 25
    rule_triggers.push('Large transaction amount (>$5,000)')
  } else if (payment.amount > 2000) {
    fraud_score += 15
    rule_triggers.push('Elevated transaction amount (>$2,000)')
  }

  if (payment.card_country !== payment.merchant_country) {
    fraud_score += 20
    rule_triggers.push(`Cross-border: card issued in ${payment.card_country}, merchant in ${payment.merchant_country}`)
    risk_factors.push('Country mismatch between card and merchant')
  }

  if (payment.velocity > 5) {
    fraud_score += 30
    rule_triggers.push(`High velocity: ${payment.velocity} transactions in short window`)
    risk_factors.push('Transaction velocity significantly above normal')
  } else if (payment.velocity > 3) {
    fraud_score += 15
    rule_triggers.push(`Moderate velocity: ${payment.velocity} transactions`)
  }

  const highRiskCountries = ['NG', 'GH', 'PK', 'BD', 'VN', 'ID', 'RU', 'UA']
  if (highRiskCountries.includes(payment.card_country.toUpperCase())) {
    fraud_score += 15
    rule_triggers.push(`Card issued in higher-risk country: ${payment.card_country}`)
    risk_factors.push('Card country has elevated fraud rates')
  }

  let deviceScore = 0
  const deviceFactors: string[] = []
  if (payment.device_id === 'new') {
    deviceScore += 20
    deviceFactors.push('New device not previously seen')
  } else if (payment.device_id === 'flagged') {
    deviceScore += 35
    deviceFactors.push('Device previously flagged for fraud')
  } else if (payment.device_id === 'emulator') {
    deviceScore += 40
    deviceFactors.push('Emulator or virtual machine detected')
  } else if (payment.device_id === 'known') {
    deviceScore -= 5
  }

  if (payment.ip_address.startsWith('tor_') || payment.ip_address.startsWith('vpn_')) {
    fraud_score += 15
    rule_triggers.push('Anonymizing network detected (TOR/VPN)')
    risk_factors.push('Connection through anonymizing network')
    deviceFactors.push('Anonymizing network usage')
  }

  fraud_score = Math.min(fraud_score + deviceScore, 100)

  const velocityStatus = payment.velocity > 5 ? 'EXCEEDED' : payment.velocity > 3 ? 'WARNING' : 'NORMAL'
  const deviceRiskLevel = deviceScore >= 30 ? 'HIGH' : deviceScore >= 15 ? 'MEDIUM' : 'LOW'

  let recommendation: string
  if (fraud_score >= 75) {
    recommendation = 'DECLINE — High fraud risk. Block transaction and flag account for review.'
  } else if (fraud_score >= 50) {
    recommendation = 'CHALLENGE — Request additional authentication (3DS, OTP) before proceeding.'
  } else if (fraud_score >= 30) {
    recommendation = 'MONITOR — Allow with enhanced monitoring. Consider step-up auth for future transactions.'
  } else {
    recommendation = 'APPROVE — Low fraud risk. Transaction can proceed normally.'
  }

  return {
    fraud_score,
    rule_triggers,
    velocity_checks: {
      status: velocityStatus,
      current_velocity: payment.velocity,
      threshold: 5,
      exceeded: payment.velocity > 5
    },
    device_risk: {
      score: deviceScore,
      risk_level: deviceRiskLevel,
      factors: deviceFactors
    },
    recommendation,
    risk_factors
  }
}

function formatPaymentFraudReport(result: PaymentFraudResult): string {
  const lines: string[] = []
  lines.push('## Payment Fraud Detection Report')
  lines.push('')
  lines.push(`**Fraud Score:** ${result.fraud_score}/100`)
  lines.push(`**Recommendation:** ${result.recommendation}`)
  lines.push('')
  lines.push('### Velocity Checks')
  lines.push(`- Status: ${result.velocity_checks.status}`)
  lines.push(`- Current: ${result.velocity_checks.current_velocity} tx (threshold: ${result.velocity_checks.threshold})`)
  lines.push(`- Exceeded: ${result.velocity_checks.exceeded ? 'YES' : 'No'}`)
  lines.push('')

  lines.push('### Device Risk')
  lines.push(`- Score: ${result.device_risk.score} | Level: ${result.device_risk.risk_level}`)
  if (result.device_risk.factors.length > 0) {
    for (const f of result.device_risk.factors) {
      lines.push(`  - ${f}`)
    }
  }
  lines.push('')

  if (result.rule_triggers.length > 0) {
    lines.push('### Rule Triggers')
    for (const r of result.rule_triggers) {
      lines.push(`⚡ ${r}`)
    }
    lines.push('')
  }

  if (result.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const r of result.risk_factors) {
      lines.push(`- ${r}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: KYC COMPLIANCE CHECKER ====================

interface KYCResult {
  compliance_status: string
  missing_documents: string[]
  enhanced_due_diligence_needed: boolean
  risk_classification: string
  pep_details: string
  sanctions_status: string
  next_review_date: string
  recommendations: string[]
  compliance_score: number
}

function checkKYCCompliance(kyc: KYCData): KYCResult {
  let compliance_score = 0
  const missing_documents: string[] = []
  const recommendations: string[] = []

  const requiredDocs = ['government_id', 'proof_of_address', 'proof_of_income']
  for (const doc of requiredDocs) {
    if (kyc.documents_provided.includes(doc)) {
      compliance_score += 15
    } else {
      missing_documents.push(doc)
      recommendations.push(`Obtain ${doc.replace(/_/g, ' ')}`)
    }
  }

  const optionalDocs = ['source_of_wealth_doc', 'tax_return', 'bank_statement']
  for (const doc of optionalDocs) {
    if (kyc.documents_provided.includes(doc)) {
      compliance_score += 5
    }
  }

  if (kyc.pep_status) {
    compliance_score -= 10
    recommendations.push('PEP identified — apply enhanced due diligence procedures')
  }

  if (kyc.sanctions_watchlist) {
    compliance_score -= 40
    recommendations.push('URGENT: Sanctions match detected — escalate to compliance officer immediately')
  }

  if (kyc.adverse_media) {
    compliance_score -= 15
    recommendations.push('Adverse media found — conduct detailed investigation and document findings')
  }

  const validWealthSources = ['employment', 'business_income', 'investment', 'inheritance', 'pension']
  if (validWealthSources.includes(kyc.source_of_wealth.toLowerCase())) {
    compliance_score += 10
  } else {
    compliance_score -= 5
    recommendations.push('Verify and document source of wealth')
  }

  compliance_score = Math.max(0, Math.min(compliance_score, 100))

  let compliance_status: string
  let edd_needed: boolean
  let risk_classification: string

  if (kyc.sanctions_watchlist) {
    compliance_status = 'NON_COMPLIANT'
    edd_needed = true
    risk_classification = 'PROHIBITED'
  } else if (compliance_score >= 80) {
    compliance_status = 'COMPLIANT'
    edd_needed = false
    risk_classification = 'LOW'
  } else if (compliance_score >= 60) {
    compliance_status = 'PARTIALLY_COMPLIANT'
    edd_needed = kyc.pep_status || kyc.adverse_media
    risk_classification = 'MEDIUM'
  } else if (compliance_score >= 40) {
    compliance_status = 'COMPLIANCE_GAP'
    edd_needed = true
    risk_classification = 'HIGH'
  } else {
    compliance_status = 'NON_COMPLIANT'
    edd_needed = true
    risk_classification = 'VERY_HIGH'
  }

  const now = new Date()
  const reviewMonths = risk_classification === 'LOW' ? 12 : risk_classification === 'MEDIUM' ? 6 : 3
  const nextReview = new Date(now.setMonth(now.getMonth() + reviewMonths))

  const pep_details = kyc.pep_status
    ? 'Customer is a Politically Exposed Person — enhanced monitoring required'
    : 'No PEP status identified'

  const sanctions_status = kyc.sanctions_watchlist
    ? 'MATCH FOUND — Immediate action required'
    : 'Clear — No sanctions list match'

  return {
    compliance_status,
    missing_documents,
    enhanced_due_diligence_needed: edd_needed,
    risk_classification,
    pep_details,
    sanctions_status,
    next_review_date: nextReview.toISOString().slice(0, 10),
    recommendations,
    compliance_score
  }
}

function formatKYCReport(result: KYCResult): string {
  const lines: string[] = []
  lines.push('## KYC Compliance Report')
  lines.push('')
  lines.push(`**Compliance Status:** ${result.compliance_status} | **Score:** ${result.compliance_score}/100`)
  lines.push(`**Risk Classification:** ${result.risk_classification}`)
  lines.push(`**Enhanced Due Diligence:** ${result.enhanced_due_diligence_needed ? 'REQUIRED' : 'Not Required'}`)
  lines.push(`**Next Review Date:** ${result.next_review_date}`)
  lines.push('')
  lines.push('### Sanctions & PEP')
  lines.push(`- Sanctions Status: ${result.sanctions_status}`)
  lines.push(`- PEP Details: ${result.pep_details}`)
  lines.push('')

  if (result.missing_documents.length > 0) {
    lines.push('### Missing Documents')
    for (const d of result.missing_documents) {
      lines.push(`- ${d.replace(/_/g, ' ')}`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`→ ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 8: BEHAVIOMETRICS ANALYZER ====================

interface BehaviorBiometricsResult {
  bot_probability: number
  account_takeover_risk: string
  session_anomaly_score: number
  user_confidence: string
  behavioral_flags: string[]
  risk_factors: string[]
  recommendations: string[]
}

function analyzeBehaviorBiometrics(session: SessionData): BehaviorBiometricsResult {
  let botScore = 0
  const behavioral_flags: string[] = []
  const risk_factors: string[] = []

  if (session.typing_speed > 600) {
    botScore += 25
    behavioral_flags.push(`Abnormally fast typing: ${session.typing_speed} WPM`)
    risk_factors.push('Typing speed exceeds human capability range')
  } else if (session.typing_speed < 10 && session.session_duration > 60) {
    botScore += 10
    behavioral_flags.push('Minimal typing activity during lengthy session')
  }

  if (session.mouse_movements < 5 && session.session_duration > 120) {
    botScore += 30
    behavioral_flags.push(`Near-zero mouse movement: ${session.mouse_movements} events`)
    risk_factors.push('Lack of mouse interaction suggests non-human activity')
  } else if (session.mouse_movements < 20) {
    botScore += 10
    behavioral_flags.push('Below-average mouse movement')
  }

  if (session.touch_pressure === 0) {
    botScore += 15
    behavioral_flags.push('No touch pressure data — possible automation')
  } else if (session.touch_pressure < 0.2 || session.touch_pressure > 0.9) {
    botScore += 10
    behavioral_flags.push(`Unusual touch pressure: ${session.touch_pressure}`)
  }

  if (session.session_duration < 5 && session.typing_speed > 200) {
    botScore += 20
    behavioral_flags.push('Measured task completion — possible credential stuffing')
    risk_factors.push('Session too short for legitimate user action')
  }

  const patternRisks: Record<string, { score: number; desc: string }> = {
    'linear': { score: 20, desc: 'Linear navigation pattern — bot-like behavior' },
    'random_rapid': { score: 25, desc: 'Random rapid navigation — scraping or enumeration' },
    'repetitive': { score: 15, desc: 'Repetitive navigation pattern — automation suspected' },
    'normal': { score: 0, desc: '' },
    'exploratory': { score: 0, desc: '' },
    'hesitant': { score: 5, desc: 'Hesitant navigation — possible uncertainty or learning curve' }
  }

  const patternData = patternRisks[session.navigation_pattern.toLowerCase()]
  if (patternData) {
    botScore += patternData.score
    if (patternData.desc && patternData.score > 0) {
      behavioral_flags.push(patternData.desc)
    }
  }

  botScore = Math.min(botScore, 100)

  let atoRisk: string
  let anomalyScore: number
  if (botScore >= 60) {
    atoRisk = 'HIGH'
    anomalyScore = 85 + (botScore - 60) * 0.375
  } else if (botScore >= 30) {
    atoRisk = 'MEDIUM'
    anomalyScore = 50 + (botScore - 30) * 1.17
  } else {
    atoRisk = 'LOW'
    anomalyScore = botScore * 1.67
  }
  anomalyScore = Math.min(anomalyScore, 100)

  const confidence = botScore >= 70 ? 'LOW — Likely automated' :
    botScore >= 40 ? 'MEDIUM — Inconclusive' :
    botScore >= 20 ? 'MODERATE-HIGH' : 'HIGH — Likely legitimate user'

  const recommendations: string[] = []
  if (botScore >= 70) {
    recommendations.push('Block session — high confidence bot activity detected')
    recommendations.push('Implement CAPTCHA challenge for retry attempts')
  } else if (botScore >= 40) {
    recommendations.push('Enable step-up authentication (OTP/biometric)')
    recommendations.push('Flag account for behavioral monitoring')
  } else if (botScore >= 20) {
    recommendations.push('Continue monitoring — minor anomalies detected')
  }
  if (atoRisk === 'HIGH') {
    recommendations.push('Force password reset and notify account holder')
  }
  if (recommendations.length === 0) {
    recommendations.push('Session behavior within normal parameters — no action needed')
  }

  return {
    bot_probability: botScore,
    account_takeover_risk: atoRisk,
    session_anomaly_score: Math.round(anomalyScore),
    user_confidence: confidence,
    behavioral_flags,
    risk_factors,
    recommendations
  }
}

function formatBehaviorBiometricsReport(result: BehaviorBiometricsResult): string {
  const lines: string[] = []
  lines.push('## Behavior Biometrics Analysis')
  lines.push('')
  lines.push(`**Bot Probability:** ${result.bot_probability}% | **User Confidence:** ${result.user_confidence}`)
  lines.push(`**Account Takeover Risk:** ${result.account_takeover_risk}`)
  lines.push(`**Session Anomaly Score:** ${result.session_anomaly_score}/100`)
  lines.push('')

  if (result.behavioral_flags.length > 0) {
    lines.push('### Behavioral Flags')
    for (const f of result.behavioral_flags) {
      lines.push(`⚡ ${f}`)
    }
    lines.push('')
  }

  if (result.risk_factors.length > 0) {
    lines.push('### Risk Factors')
    for (const r of result.risk_factors) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`→ ${r}`)
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'transaction_monitor',
    description: 'Analyze transaction data to detect suspicious patterns, assign risk scores, and generate alert levels. Flags high-amount, high-frequency, and anomalous transaction behavior with recommended actions.',
    parameters: {
      transactions: { type: 'string', required: true, description: 'JSON array of transaction objects with fields: tx_id, amount, sender, receiver, timestamp, channel' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { transactions: string }) {
      const data: Transaction[] = JSON.parse(args.transactions)
      const result = analyzeTransactions(data)
      return formatTransactionMonitorReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'credit_scorer',
    description: 'Assess creditworthiness of an applicant using income, debt, payment history, credit age, and recent inquiries. Returns credit score, risk grade, approval recommendation, credit limit, and probability of default.',
    parameters: {
      applicant_data: { type: 'string', required: true, description: 'JSON object with fields: income (annual), debt (total), payment_history (0-100 score), credit_age (years), recent_inquiries (count)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { applicant_data: string }) {
      const data: ApplicantData = JSON.parse(args.applicant_data)
      const result = scoreCredit(data)
      return formatCreditScorerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'aml_detector',
    description: 'Detect anti-money laundering patterns including structuring, layering, and integration risks. Analyzes transaction frequency, amounts, jurisdictions, and counterparties to identify suspicious activity.',
    parameters: {
      customer_transactions: { type: 'string', required: true, description: 'JSON array of customer transaction objects with fields: customer_id, amount, frequency, countries (array), counterparties (array)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { customer_transactions: string }) {
      const data: CustomerTransaction[] = JSON.parse(args.customer_transactions)
      const result = detectAML(data)
      return formatAMLReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'merchant_risk_scorer',
    description: 'Evaluate merchant account risk based on business type, transaction volume, chargeback ratio, and processing history. Provides risk rating, reserve requirements, and monitoring level recommendations.',
    parameters: {
      merchant_data: { type: 'string', required: true, description: 'JSON object with fields: business_type, transaction_volume (monthly USD), chargeback_ratio (decimal), processing_history (months)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { merchant_data: string }) {
      const data: MerchantData = JSON.parse(args.merchant_data)
      const result = scoreMerchantRisk(data)
      return formatMerchantRiskReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'identity_verification_scorer',
    description: 'Score identity verification strength using document type, biometric match, address verification, device fingerprint, and behavior patterns. Detects fraud indicators and recommends authentication steps.',
    parameters: {
      identity_data: { type: 'string', required: true, description: 'JSON object with fields: document_type, biometric_match (0-100), address_verification (boolean), device_fingerprint (known/new/flagged/emulator), behavior_pattern (normal/hesitant/rushed/automated/inconsistent/suspicious)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { identity_data: string }) {
      const data: IdentityData = JSON.parse(args.identity_data)
      const result = scoreIdentityVerification(data)
      return formatIdentityVerificationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'payment_fraud_detector',
    description: 'Analyze payment transactions for fraud indicators including amount anomalies, velocity checks, device risk, cross-border patterns, and network analysis. Returns fraud score and actionable recommendations.',
    parameters: {
      payment_data: { type: 'string', required: true, description: 'JSON object with fields: amount, card_country, merchant_country, ip_address, device_id (known/new/flagged/emulator), velocity (tx count in window)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { payment_data: string }) {
      const data: PaymentData = JSON.parse(args.payment_data)
      const result = detectPaymentFraud(data)
      return formatPaymentFraudReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'kyc_compliance_checker',
    description: 'Validate KYC/AML compliance status using provided documents, PEP status, sanctions watchlist, adverse media, and source of wealth. Returns compliance score, missing documents, and EDD requirements.',
    parameters: {
      kyc_data: { type: 'string', required: true, description: 'JSON object with fields: documents_provided (array), pep_status (boolean), sanctions_watchlist (boolean), adverse_media (boolean), source_of_wealth' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { kyc_data: string }) {
      const data: KYCData = JSON.parse(args.kyc_data)
      const result = checkKYCCompliance(data)
      return formatKYCReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'behavior_biometrics_analyzer',
    description: 'Analyze session behavior biometrics to detect bots, account takeover attempts, and anomalous user activity. Uses typing speed, mouse movements, touch pressure, session duration, and navigation patterns.',
    parameters: {
      session_data: { type: 'string', required: true, description: 'JSON object with fields: typing_speed (WPM), mouse_movements (count), touch_pressure (0-1), session_duration (seconds), navigation_pattern (normal/exploratory/hesitant/linear/random_rapid/repetitive)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { session_data: string }) {
      const data: SessionData = JSON.parse(args.session_data)
      const result = analyzeBehaviorBiometrics(data)
      return formatBehaviorBiometricsReport(result)
    }
  }))

  console.log(`[dsh-tool-fintech] Loaded v${VERSION} — Financial Risk & Fraud Detection Toolkit with 8 tools`)
  console.log('  Tools: transaction_monitor, credit_scorer, aml_detector, merchant_risk_scorer, identity_verification_scorer, payment_fraud_detector, kyc_compliance_checker, behavior_biometrics_analyzer')
}
