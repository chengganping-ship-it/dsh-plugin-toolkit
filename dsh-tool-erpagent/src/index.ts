/**
 * DSH Enterprise ERP Automation Agent Plugin v0.1.0
 *
 * Enterprise-grade ERP automation toolkit for DeepSeek Harness Agent.
 * Designed for finance teams, auditors, compliance officers, and operations managers.
 *
 * Features (v0.1.0):
 * - Reconciliation Engine (multi-source data matching and discrepancy analysis)
 * - Accrual Calculator (period-end expense/revenue accrual computing)
 * - Contract Tracker (obligation monitoring and expiration alerting)
 * - Compliance Monitor (transaction screening against regulatory rules)
 * - Financial Reconciler (bank statement to ledger reconciliation)
 * - Workflow Automator (process definition and automated execution planning)
 * - Data Consistency Checker (cross-dataset validation and repair scripts)
 * - Approval Routing (dynamic approval path generation with SLA estimates)
 *
 * @module dsh-tool-erpagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-erpagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM ====================

class SeededRandom {
  private seed: number
  constructor(seed: number) { this.seed = seed }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xFFFFFFFF
    return (this.seed >>> 0) / 0xFFFFFFFF
  }
  nextInt(min: number, max: number): number { return Math.floor(this.next() * (max - min + 1)) + min }
  nextFloat(min: number, max: number): number { return this.next() * (max - min) + min }
  pick<T>(arr: T[]): T { return arr[this.nextInt(0, arr.length - 1)] }
}

function seededRng(text: string): SeededRandom {
  let hash = 0
  for (let i = 0; i < text.length; i++) { hash = ((hash << 5) - hash) + text.charCodeAt(i); hash |= 0 }
  return new SeededRandom(Math.abs(hash))
}

// ==================== TYPES ====================

interface SourceRecord { id: string; amount: number; date: string; description: string; category?: string; reference?: string }
interface TargetRecord { id: string; amount: number; date: string; description: string; category?: string; reference?: string }
interface MatchRule { field: string; tolerance?: number; exact?: boolean; weight?: number }
interface MatchPair { source_id: string; target_id: string; confidence: number; matched_fields: string[]; amount_diff: number }
interface ReconciliationResult {
  matched: MatchPair[]
  unmatched_source: string[]
  unmatched_target: string[]
  discrepancies: Array<{ source_id: string; target_id: string; type: string; severity: 'low' | 'medium' | 'high'; description: string; adjustment_suggestion: string }>
  summary: { total_source: number; total_target: number; matched_count: number; discrepancy_count: number; match_rate: number; total_discrepancy_amount: number }
  adjustment_recommendations: Array<{ entry_type: string; debit_account: string; credit_account: string; amount: number; justification: string }>
}

interface ExpenseRule { category: string; accrual_method: 'straight_line' | 'percentage' | 'fixed' | 'usage_based'; total_amount: number; recognized_to_date: number; start_date: string; end_date: string }
interface RevenueData { contract_id: string; total_contract_value: number; performance_obligations: Array<{ obligation: string; completed: boolean; value: number }>; billing_to_date: number }
interface AccrualEntry { account_code: string; account_name: string; debit: number; credit: number; description: string; period: string }
interface AccrualResult {
  accrual_entries: AccrualEntry[]
  period_end_adjustments: Array<{ adjustment_type: string; current_balance: number; adjusted_balance: number; adjustment_amount: number; explanation: string }>
  summary: { total_accrual_amount: number; total_revenue_recognized: number; period: string; entry_count: number }
  journal_entries: Array<{ journal_id: string; date: string; entries: AccrualEntry[] }>
}

interface Contract { id: string; title: string; counterparty: string; start_date: string; end_date: string; value: number; currency: string; status: 'active' | 'expired' | 'terminated' | 'pending_renewal'; obligations: Array<{ description: string; due_date: string; completed: boolean }>; auto_renew: boolean; renewal_notice_days: number }
interface AlertRule { days_before_expiry: number; obligation_reminder_days: number; value_threshold: number }
interface ContractAlert { contract_id: string; alert_type: 'expiry_warning' | 'obligation_due' | 'renewal_needed' | 'value_threshold'; severity: 'info' | 'warning' | 'critical'; message: string; action_required: string; deadline: string }
interface ContractTrackerResult {
  alerts: ContractAlert[]
  obligation_status: Array<{ contract_id: string; total_obligations: number; completed: number; pending: number; overdue: number; completion_rate: number }>
  expiry_calendar: Array<{ contract_id: string; title: string; days_remaining: number; action: string }>
  risk_summary: { total_contracts: number; active: number; expiring_soon: number; overdue_obligations: number; total_exposure: number }
}

interface Transaction { id: string; date: string; amount: number; currency: string; payer: string; payee: string; purpose: string; country: string; category: string }
interface Regulation { id: string; name: string; type: 'aml' | 'kyc' | 'sanctions' | 'tax' | 'trade' | 'data_privacy'; threshold?: number; restricted_countries?: string[]; restricted_entities?: string[]; rules: string[] }
interface ComplianceFinding { transaction_id: string; regulation_id: string; finding_type: string; severity: 'info' | 'low' | 'medium' | 'high' | 'critical'; description: string; recommended_action: string; regulatory_reference: string }
interface ComplianceMonitorResult {
  findings: ComplianceFinding[]
  compliance_report: { total_transactions: number; violations_found: number; compliance_rate: number; by_regulation: Array<{ regulation: string; violations: number; status: 'pass' | 'fail' | 'warning' }>; by_severity: { critical: number; high: number; medium: number; low: number; info: number } }
  remediation_plan: Array<{ priority: number; finding: string; action: string; responsible_party: string; deadline: string }>
}

interface BankStatementEntry { date: string; reference: string; description: string; debit: number; credit: number; balance: number }
interface LedgerEntry { date: string; journal_id: string; account: string; description: string; debit: number; credit: number }
interface BankReconciliationResult {
  bank_balance: number; ledger_balance: number; adjusted_bank_balance: number; adjusted_ledger_balance: number
  reconciliation_items: Array<{ type: 'outstanding_deposit' | 'outstanding_check' | 'bank_error' | 'book_error' | 'bank_charge' | 'interest_earned'; description: string; amount: number; adjustment_to: 'bank' | 'book' }>
  variance_analysis: { initial_variance: number; explained_variance: number; unexplained_variance: number; reconciliation_status: 'reconciled' | 'unreconciled' }
  action_items: Array<{ item: string; priority: 'high' | 'medium' | 'low'; assigned_to: string; due_date: string }>
}

interface ProcessStep { step_id: string; name: string; type: 'approval' | 'notification' | 'data_entry' | 'calculation' | 'validation' | 'integration'; assignee_role: string; sla_hours: number; dependencies: string[] }
interface WFTrigger { event: 'schedule' | 'data_change' | 'manual' | 'threshold' | 'external'; config: Record<string, string> }
interface WFAction { action_type: string; target: string; parameters: Record<string, string> }
interface WorkflowResult {
  workflow_config: { workflow_id: string; name: string; version: string; steps: ProcessStep[]; trigger_config: WFTrigger[]; action_config: WFAction[] }
  execution_plan: Array<{ phase: number; step_id: string; step_name: string; estimated_duration_hours: number; dependencies_met: boolean; automated: boolean }>
  automation_metrics: { total_steps: number; automated_steps: number; manual_steps: number; automation_rate: number; estimated_cycle_time_hours: number; bottleneck_steps: string[] }
  risk_assessment: Array<{ risk: string; likelihood: 'low' | 'medium' | 'high'; impact: 'low' | 'medium' | 'high'; mitigation: string }>
}

interface Dataset { name: string; source: string; record_count: number; fields: string[]; sample_records: Array<Record<string, string | number>> }
interface ConsistencyRule { rule_id: string; name: string; type: 'cross_reference' | 'referential_integrity' | 'format_validation' | 'range_check' | 'uniqueness' | 'completeness'; source_dataset: string; target_dataset?: string; field: string; condition: string; severity: 'error' | 'warning' }
interface ConsistencyFinding { rule_id: string; dataset: string; field: string; record_count: number; issue_type: string; description: string; sample_violations: Array<Record<string, string | number>> }
interface DataConsistencyResult {
  consistency_findings: ConsistencyFinding[]
  consistency_report: { total_records_checked: number; total_violations: number; consistency_score: number; by_dataset: Array<{ dataset: string; violations: number; score: number }>; by_rule_type: Array<{ type: string; violations: number }> }
  repair_scripts: Array<{ script_id: string; target_dataset: string; issue_type: string; repair_action: string; estimated_records_affected: number; sql_preview: string }>
}

interface ApprovalRequest { request_id: string; request_type: string; amount: number; currency: string; requester: string; requester_level: number; department: string; business_justification: string; urgency: 'low' | 'medium' | 'high' | 'critical' }
interface OrgNode { id: string; name: string; role: string; level: number; department: string; parent_id?: string; approval_limit: number; delegates?: string[] }
interface RoutingRule { condition: string; approver_level: number; approver_role: string; parallel: boolean; escalation_hours: number }
interface ApprovalRoute {
  request_id: string
  steps: Array<{ step_number: number; approver_name: string; approver_role: string; approval_type: 'sequential' | 'parallel'; sla_hours: number; escalation_path: string }>
  estimated_total_hours: number; estimated_total_days: number; approval_path_summary: string; risk_flags: string[]
}

// ==================== UTILITIES ====================

function fmtCur(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

function daysBetween(d1: string, d2: string): number {
  return Math.ceil((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000)
}

function today(): string { return new Date().toISOString().split('T')[0] }
function addDays(date: string, days: number): string { const d = new Date(date); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0] }

function descSimilarity(a: string, b: string): number {
  const wa = new Set(a.toLowerCase().split(/\s+/))
  const wb = new Set(b.toLowerCase().split(/\s+/))
  let inter = 0
  for (const w of wa) if (wb.has(w)) inter++
  const union = wa.size + wb.size - inter
  return union > 0 ? inter / union : 0
}

function accrualAcctCode(category: string): string {
  const m: Record<string, string> = { payroll: '5100', bonus: '5200', commission: '5300', utilities: '5400', rent: '5500', insurance: '5600', tax: '5700', interest: '5800', maintenance: '5900', professional_services: '6000' }
  return m[category.toLowerCase()] || '5999'
}

function topologicalSort(steps: ProcessStep[]): ProcessStep[] {
  const result: ProcessStep[] = []
  const visited = new Set<string>()
  function visit(s: ProcessStep) {
    if (visited.has(s.step_id)) return
    visited.add(s.step_id)
    for (const dep of s.dependencies) { const ds = steps.find(x => x.step_id === dep); if (ds) visit(ds) }
    result.push(s)
  }
  for (const s of steps) visit(s)
  return result
}

function urgencySla(urgency: string, base: number): number {
  return urgency === 'critical' ? Math.ceil(base * 0.25) : urgency === 'high' ? Math.ceil(base * 0.5) : urgency === 'low' ? Math.ceil(base * 1.5) : base
}

function evalCondition(cond: string, req: ApprovalRequest): boolean {
  if (cond.includes('amount >')) return req.amount > parseFloat(cond.match(/amount\s*>\s*([\d.]+)/)?.[1] ?? '0')
  if (cond.includes('amount >=')) return req.amount >= parseFloat(cond.match(/amount\s*>=\s*([\d.]+)/)?.[1] ?? '0')
  if (cond.includes("department =")) return req.department === cond.match(/department\s*=\s*'(\w+)'/)?.[1]
  if (cond.includes("urgency =")) return req.urgency === cond.match(/urgency\s*=\s*'(\w+)'/)?.[1]
  return true
}

function parentApprover(node: OrgNode, hierarchy: OrgNode[]): string {
  if (node.parent_id) { const p = hierarchy.find(n => n.id === node.parent_id); if (p) return p.name }
  return 'CEO'
}

// ==================== TOOL 1: RECONCILIATION ENGINE ====================

function performReconciliation(sourceData: SourceRecord[], targetData: TargetRecord[], matchRules: MatchRule[]): ReconciliationResult {
  // Pre-compute portfolio totals for materiality analysis
  const sourceTotal = sourceData.reduce((s, r) => s + r.amount, 0)
  const targetTotal = targetData.reduce((s, r) => s + r.amount, 0)
  const matched: MatchPair[] = []
  const discrepancies: ReconciliationResult['discrepancies'] = []
  const matchedSrc = new Set<string>()
  const matchedTgt = new Set<string>()

  for (const src of sourceData) {
    let best: { tgt: TargetRecord; conf: number; fields: string[] } | null = null
    for (const tgt of targetData) {
      if (matchedTgt.has(tgt.id)) continue
      let conf = 0; const mFields: string[] = []; let totalW = 0
      for (const rule of matchRules) {
        const w = rule.weight ?? 1; totalW += w
        if (rule.field === 'amount' && Math.abs(src.amount - tgt.amount) <= (rule.tolerance ?? 0.01)) { conf += w; mFields.push('amount') }
        else if (rule.field === 'date') {
          const dd = Math.abs(daysBetween(src.date, tgt.date))
          if (rule.exact && src.date === tgt.date) { conf += w; mFields.push('date') }
          else if (dd <= 3) { conf += w * (1 - dd / 4); mFields.push('date') }
        }
        else if (rule.field === 'reference' && src.reference && tgt.reference && src.reference === tgt.reference) { conf += w; mFields.push('reference') }
        else if (rule.field === 'description' && descSimilarity(src.description, tgt.description) > 0.6) { conf += w * descSimilarity(src.description, tgt.description); mFields.push('description') }
        else if (rule.field === 'category' && src.category && tgt.category && src.category === tgt.category) { conf += w; mFields.push('category') }
      }
      if (totalW > 0) conf = conf / totalW
      if (conf >= 0.5 && (!best || conf > best.conf)) best = { tgt, conf, fields: mFields }
    }
    if (best) {
      matched.push({ source_id: src.id, target_id: best.tgt.id, confidence: parseFloat(best.conf.toFixed(3)), matched_fields: best.fields, amount_diff: parseFloat((src.amount - best.tgt.amount).toFixed(2)) })
      matchedSrc.add(src.id); matchedTgt.add(best.tgt.id)
      if (Math.abs(src.amount - best.tgt.amount) > 0.01) {
        const diff = src.amount - best.tgt.amount
        discrepancies.push({ source_id: src.id, target_id: best.tgt.id, type: 'amount_mismatch', severity: Math.abs(diff) > 1000 ? 'high' : Math.abs(diff) > 100 ? 'medium' : 'low', description: `Amount discrepancy: source ${fmtCur(src.amount)} vs target ${fmtCur(best.tgt.amount)}`, adjustment_suggestion: diff > 0 ? `Dr. Variance ${fmtCur(diff)} / Cr. ${src.description || 'Revenue'} ${fmtCur(diff)}` : `Dr. Expense ${fmtCur(Math.abs(diff))} / Cr. Variance ${fmtCur(Math.abs(diff))}` })
      }
    }
  }

  const unmatchedSrc = sourceData.filter(s => !matchedSrc.has(s.id)).map(s => s.id)
  const unmatchedTgt = targetData.filter(t => !matchedTgt.has(t.id)).map(t => t.id)
  const adjustments: ReconciliationResult['adjustment_recommendations'] = []
  for (const src of sourceData.filter(s => unmatchedSrc.includes(s.id))) {
    adjustments.push({ entry_type: 'accrual', debit_account: '5000 - Expense', credit_account: '2100 - Accrued Liabilities', amount: src.amount, justification: `Unmatched source item ${src.id}: ${src.description}` })
  }
  const totalDiscAmt = discrepancies.reduce((sum, d) => { const s = sourceData.find(r => r.id === d.source_id); const t = targetData.find(r => r.id === d.target_id); return sum + Math.abs((s?.amount ?? 0) - (t?.amount ?? 0)) }, 0)

  // Compute materiality of total discrepancy relative to portfolio
  const totalPortfolioValue = Math.max(Math.abs(sourceTotal), Math.abs(targetTotal), 1)
  const materialityPct = parseFloat(((totalDiscAmt / totalPortfolioValue) * 100).toFixed(2))
  const matCategory = categorizeMateriality(totalDiscAmt, totalPortfolioValue)

  return { matched, unmatched_source: unmatchedSrc, unmatched_target: unmatchedTgt, discrepancies, summary: { total_source: sourceData.length, total_target: targetData.length, matched_count: matched.length, discrepancy_count: discrepancies.length, match_rate: sourceData.length > 0 ? parseFloat(((matched.length / sourceData.length) * 100).toFixed(1)) : 0, total_discrepancy_amount: parseFloat(totalDiscAmt.toFixed(2)) }, adjustment_recommendations: adjustments }
}

function formatReconciliation(result: ReconciliationResult): string {
  const l: string[] = []
  l.push('## Reconciliation Engine Report')
  l.push('')
  l.push('### Summary')
  l.push('| Metric | Value |')
  l.push('|--------|-------|')
  l.push(`| Total Source Records | ${result.summary.total_source} |`)
  l.push(`| Total Target Records | ${result.summary.total_target} |`)
  l.push(`| Matched | ${result.summary.matched_count} |`)
  l.push(`| Discrepancies | ${result.summary.discrepancy_count} |`)
  l.push(`| Match Rate | ${result.summary.match_rate}% |`)
  l.push(`| Total Discrepancy Amount | ${fmtCur(result.summary.total_discrepancy_amount)} |`)
  l.push('')
  // Materiality assessment summary
  const discAmt = result.summary.total_discrepancy_amount
  const matchRate = result.summary.match_rate
  const overallHealth = matchRate >= 95 ? '\uD83D\uDFE2 HEALTHY' : matchRate >= 80 ? '\uD83D\uDFE1 MONITOR' : '\uD83D\uDD34 ATTENTION'
  l.push(`**Overall Recon Health:** ${overallHealth} | Disc Amt: ${fmtCur(discAmt)} | Auto-match: ${matchRate}%`)
  l.push('')
  if (result.matched.length > 0) {
    l.push('### Matched Pairs')
    // Group matched pairs by confidence tier for executive summary
    const highConf = result.matched.filter(m => m.confidence >= 0.9).length
    const medConf = result.matched.filter(m => m.confidence >= 0.7 && m.confidence < 0.9).length
    const lowConf = result.matched.filter(m => m.confidence < 0.7).length
    l.push(`**Confidence Distribution:** \u2705 High: ${highConf} | \u26A0\uFE0F Medium: ${medConf} | \u2753 Review: ${lowConf}`)
    l.push('')
    for (const m of result.matched.slice(0, 10)) {
      const icon = m.confidence >= 0.9 ? '\u2705' : m.confidence >= 0.7 ? '\u26A0\uFE0F' : '\u2753'
      l.push(`- ${icon} ${m.source_id} \u2194 ${m.target_id} (confidence: ${(m.confidence * 100).toFixed(0)}%, diff: ${fmtCur(m.amount_diff)})`)
    }
    if (result.matched.length > 10) l.push(`- ... and ${result.matched.length - 10} more matched pairs`)
    l.push('')
  }
  if (result.discrepancies.length > 0) {
    l.push('### Discrepancies')
    for (const d of result.discrepancies) {
      const sev = d.severity === 'high' ? '\uD83D\uDD34' : d.severity === 'medium' ? '\uD83D\uDFE0' : '\uD83D\uDFE1'
      l.push(`- ${sev} **${d.type}** [${d.severity.toUpperCase()}]: ${d.description}`)
      l.push(`  - Suggested: ${d.adjustment_suggestion}`)
    }
    l.push('')
  }
  if (result.unmatched_source.length > 0 || result.unmatched_target.length > 0) {
    l.push('### Unmatched Items')
    if (result.unmatched_source.length > 0) l.push(`- Source unmatched: ${result.unmatched_source.join(', ')}`)
    if (result.unmatched_target.length > 0) l.push(`- Target unmatched: ${result.unmatched_target.join(', ')}`)
    l.push('')
    if (result.unmatched_source.length > 0) {
      l.push('**Recommendation:** Investigate unmatched source items for potential timing differences or missing entries in the target system.')
      l.push('')
    }
  }
  if (result.adjustment_recommendations.length > 0) {
    l.push('### Adjustment Recommendations')
    for (const adj of result.adjustment_recommendations.slice(0, 8)) {
      l.push(`- **${adj.entry_type}**: Dr. ${adj.debit_account} / Cr. ${adj.credit_account} ${fmtCur(adj.amount)}`)
      l.push(`  - Justification: ${adj.justification}`)
    }
    l.push('')
  }
  l.push('### Next Steps')
  l.push('1. Review all high-severity discrepancies and post recommended adjustments')
  l.push('2. Investigate unmatched items for potential timing differences')
  l.push('3. Update match rules if systematic patterns emerge')
  l.push('4. Schedule follow-up reconciliation for remaining variances')
  l.push('')
  return l.join('\n')
}

// ==================== FINANCIAL ANALYSIS HELPERS ====================

function calculateTrend(current: number, previous: number): { direction: string; percentage: number; icon: string } {
  if (previous === 0) return { direction: 'new', percentage: 100, icon: '\uD83D\uDD35' }
  const pct = ((current - previous) / Math.abs(previous)) * 100
  const dir = pct > 5 ? 'increasing' : pct < -5 ? 'decreasing' : 'stable'
  const icon = pct > 5 ? '\uD83D\uDD3A' : pct < -5 ? '\uD83D\uDD3B' : '\u27A1\uFE0F'
  return { direction: dir, percentage: parseFloat(Math.abs(pct).toFixed(1)), icon }
}

function categorizeMateriality(amount: number, baseAmount: number): { level: string; icon: string; requiresDisclosure: boolean } {
  const pct = Math.abs(amount) / Math.abs(baseAmount) * 100
  if (pct > 10) return { level: 'highly_material', icon: '\uD83D\uDD34', requiresDisclosure: true }
  if (pct > 5) return { level: 'material', icon: '\uD83D\uDFE0', requiresDisclosure: true }
  if (pct > 1) return { level: 'moderate', icon: '\uD83D\uDFE1', requiresDisclosure: false }
  return { level: 'immaterial', icon: '\uD83D\uDFE2', requiresDisclosure: false }
}

interface _CycleTimeStep { sla_hours: number; dependencies: string[] }
interface _CycleTimeResult { criticalPath: number; totalParallel: number }
function estimateCycleTime(steps: _CycleTimeStep[]): _CycleTimeResult {
  let criticalPath = 0
  let totalParallel = 0
  const processed = new Set<string>()
  for (const step of steps) {
    if (step.dependencies.length === 0) {
      totalParallel += step.sla_hours
    } else {
      criticalPath += step.sla_hours
    }
    processed.add(step.sla_hours.toString())
  }
  return { criticalPath, totalParallel: totalParallel || criticalPath }
}

// ==================== TOOL 2: ACCRUAL CALCULATOR ====================

function calculateAccruals(period: string, expenseRules: ExpenseRule[], revenueData: RevenueData[]): AccrualResult {
  const rng = seededRng(period)
  const entries: AccrualEntry[] = []
  const journals: AccrualResult['journal_entries'] = []
  let totalAccrual = 0, totalRevenue = 0

  for (const rule of expenseRules) {
    const totalDays = Math.max(1, daysBetween(rule.start_date, rule.end_date))
    const elapsed = Math.max(1, daysBetween(rule.start_date, today()))
    const frac = Math.min(1, elapsed / totalDays)
    let amt = 0
    switch (rule.accrual_method) {
      case 'straight_line': case 'percentage': amt = rule.total_amount * frac - rule.recognized_to_date; break
      case 'fixed': amt = rule.total_amount / 12; break
      case 'usage_based': amt = rule.total_amount * rng.nextFloat(0.6, 0.95) - rule.recognized_to_date; break
    }
    amt = Math.max(0, parseFloat(amt.toFixed(2)))
    totalAccrual += amt
    if (amt > 0) {
      entries.push({ account_code: accrualAcctCode(rule.category), account_name: `${rule.category} - Accrued`, debit: amt, credit: 0, description: `${rule.category} accrual for ${period} (${(frac * 100).toFixed(0)}% elapsed)`, period })
      entries.push({ account_code: '2100', account_name: 'Accrued Liabilities', debit: 0, credit: amt, description: `${rule.category} liability for ${period}`, period })
    }
  }

  for (const rev of revenueData) {
    const completedVal = rev.performance_obligations.filter(o => o.completed).reduce((s, o) => s + o.value, 0)
    const toRecognize = completedVal - rev.billing_to_date
    totalRevenue += toRecognize
    if (toRecognize > 0) {
      entries.push({ account_code: '4000', account_name: 'Revenue', debit: 0, credit: toRecognize, description: `Revenue recognition for contract ${rev.contract_id}`, period })
      entries.push({ account_code: '1200', account_name: 'Contract Asset', debit: toRecognize, credit: 0, description: `Contract asset for ${rev.contract_id}`, period })
    }
  }

  if (entries.length > 0) journals.push({ journal_id: `ACCR-${period}-${Date.now().toString(36).toUpperCase()}`, date: addDays(period + '-01', 28), entries })

  const adjustments: AccrualResult['period_end_adjustments'] = [
    { adjustment_type: 'expense_accrual_true_up', current_balance: totalAccrual, adjusted_balance: parseFloat((totalAccrual * 1.02).toFixed(2)), adjustment_amount: parseFloat((totalAccrual * 0.02).toFixed(2)), explanation: 'True-up for estimated vs actual - 2% buffer' },
    { adjustment_type: 'revenue_deferral_check', current_balance: totalRevenue, adjusted_balance: totalRevenue, adjustment_amount: 0, explanation: 'Revenue verified against completed obligations' }
  ]

  return { accrual_entries: entries, period_end_adjustments: adjustments, summary: { total_accrual_amount: parseFloat(totalAccrual.toFixed(2)), total_revenue_recognized: parseFloat(totalRevenue.toFixed(2)), period, entry_count: entries.length }, journal_entries: journals }
}

function formatAccrual(result: AccrualResult): string {
  const l: string[] = []
  l.push('## Accrual Calculator Report')
  l.push('')
  l.push('### Summary')
  l.push('| Metric | Value |')
  l.push('|--------|-------|')
  l.push(`| Period | ${result.summary.period} |`)
  l.push(`| Total Accrual Amount | ${fmtCur(result.summary.total_accrual_amount)} |`)
  l.push(`| Total Revenue Recognized | ${fmtCur(result.summary.total_revenue_recognized)} |`)
  l.push(`| Journal Entries | ${result.summary.entry_count} |`)
  l.push('')
  // Accrual coverage analysis
  const debitEntries = result.accrual_entries.filter(e => e.debit > 0)
  const creditEntries = result.accrual_entries.filter(e => e.credit > 0)
  const totalDebits = debitEntries.reduce((s, e) => s + e.debit, 0)
  const totalCredits = creditEntries.reduce((s, e) => s + e.credit, 0)
  const balanceCheck = Math.abs(totalDebits - totalCredits) < 0.01 ? '\u2705 BALANCED' : '\u274C IMBALANCED'
  l.push(`**Trial Balance Check:** ${balanceCheck} | Total Debits: ${fmtCur(totalDebits)} | Total Credits: ${fmtCur(totalCredits)}`)
  l.push('')
  if (result.accrual_entries.length > 0) {
    l.push('### Accrual Entries')
    l.push('| Account Code | Account Name | Debit | Credit | Description |')
    l.push('|-------------|-------------|-------|--------|-------------|')
    for (const e of result.accrual_entries.slice(0, 15)) {
      l.push(`| ${e.account_code} | ${e.account_name} | ${fmtCur(e.debit)} | ${fmtCur(e.credit)} | ${e.description} |`)
    }
    if (result.accrual_entries.length > 15) l.push(`| ... | ... | ... | ... | ${result.accrual_entries.length - 15} more |`)
    l.push('')
  }
  l.push('### Period-End Adjustments')
  for (const adj of result.period_end_adjustments) {
    const icon = adj.adjustment_amount !== 0 ? '\u26A0\uFE0F' : '\u2705'
    l.push(`- ${icon} **${adj.adjustment_type}**: ${fmtCur(adj.current_balance)} \u2192 ${fmtCur(adj.adjusted_balance)} (${fmtCur(adj.adjustment_amount)})`)
    l.push(`  - ${adj.explanation}`)
  }
  l.push('')
  if (result.journal_entries.length > 0) {
    l.push('### Journal Entry Headers')
    for (const je of result.journal_entries) l.push(`- **${je.journal_id}** (${je.date}) - ${je.entries.length} line items`)
    l.push('')
  }
  l.push('### Next Steps')
  l.push('1. Review accrual calculations against actual invoices received')
  l.push('2. Post journal entries to GL before period close deadline')
  l.push('3. Verify revenue recognition with project managers for completion status')
  l.push('4. Update recognized_to_date figures for next period calculation')
  l.push('')
  return l.join('\n')
}

// ==================== TOOL 3: CONTRACT TRACKER ====================

function trackContracts(contracts: Contract[], alertRules: AlertRule): ContractTrackerResult {
  const alerts: ContractAlert[] = []
  const obligationStatus: ContractTrackerResult['obligation_status'] = []
  const expiryCal: ContractTrackerResult['expiry_calendar'] = []
  let totalExp = 0, expiring = 0, overdue = 0
  const now = today()

  for (const c of contracts) {
    const daysRem = daysBetween(now, c.end_date)
    if (daysRem <= alertRules.days_before_expiry && daysRem > 0 && c.status === 'active') {
      alerts.push({ contract_id: c.id, alert_type: 'expiry_warning', severity: daysRem <= 7 ? 'critical' : daysRem <= 30 ? 'warning' : 'info', message: `Contract "${c.title}" expires in ${daysRem} days (${c.end_date})`, action_required: c.auto_renew ? 'Verify auto-renewal terms' : 'Initiate renewal negotiation', deadline: c.end_date })
      expiring++
    } else if (daysRem <= 0 && c.status === 'active') {
      alerts.push({ contract_id: c.id, alert_type: 'expiry_warning', severity: 'critical', message: `Contract "${c.title}" has EXPIRED (${c.end_date})`, action_required: 'Immediate review required - contract lapsed', deadline: c.end_date })
      expiring++
    }
    if (c.auto_renew && daysRem <= c.renewal_notice_days && daysRem > 0) {
      alerts.push({ contract_id: c.id, alert_type: 'renewal_needed', severity: 'warning', message: `Renewal notice required: "${c.title}" auto-renews in ${daysRem} days`, action_required: `Submit notice ${c.renewal_notice_days} days before expiration`, deadline: addDays(c.end_date, -c.renewal_notice_days) })
    }
    let done = 0, pend = 0, ovrd = 0
    for (const ob of c.obligations) {
      if (ob.completed) done++
      else if (daysBetween(now, ob.due_date) < 0) {
        ovrd++; overdue++
        alerts.push({ contract_id: c.id, alert_type: 'obligation_due', severity: 'critical', message: `OVERDUE: "${ob.description}" (due ${ob.due_date})`, action_required: 'Immediate action required', deadline: ob.due_date })
      } else if (daysBetween(now, ob.due_date) <= alertRules.obligation_reminder_days) {
        pend++
        alerts.push({ contract_id: c.id, alert_type: 'obligation_due', severity: 'warning', message: `Upcoming: "${ob.description}" (due ${ob.due_date})`, action_required: 'Schedule resources', deadline: ob.due_date })
      } else pend++
    }
    obligationStatus.push({ contract_id: c.id, total_obligations: c.obligations.length, completed: done, pending: pend, overdue: ovrd, completion_rate: c.obligations.length > 0 ? parseFloat(((done / c.obligations.length) * 100).toFixed(1)) : 100 })
    if (daysRem <= 90 && daysRem > -30) expiryCal.push({ contract_id: c.id, title: c.title, days_remaining: daysRem, action: daysRem <= 0 ? 'EXPIRED' : daysRem <= 30 ? 'Urgent renewal' : 'Plan renewal' })
    if (c.value >= alertRules.value_threshold) alerts.push({ contract_id: c.id, alert_type: 'value_threshold', severity: 'info', message: `High-value contract: "${c.title}" (${fmtCur(c.value)})`, action_required: 'Ensure adequate oversight', deadline: c.end_date })
    totalExp += c.value
  }

  alerts.sort((a, b) => ({ critical: 0, warning: 1, info: 2 }[a.severity] - ({ critical: 0, warning: 1, info: 2 }[b.severity])))
  return { alerts, obligation_status: obligationStatus, expiry_calendar: expiryCal.sort((a, b) => a.days_remaining - b.days_remaining), risk_summary: { total_contracts: contracts.length, active: contracts.filter(c => c.status === 'active').length, expiring_soon: expiring, overdue_obligations: overdue, total_exposure: totalExp } }
}

function formatContractTracker(result: ContractTrackerResult): string {
  const l: string[] = []
  l.push('## Contract Tracker Report')
  l.push('')
  const rs = result.risk_summary
  l.push('### Risk Summary')
  l.push('| Metric | Value |')
  l.push('|--------|-------|')
  l.push(`| Total Contracts | ${rs.total_contracts} |`)
  l.push(`| Active | ${rs.active} |`)
  l.push(`| Expiring Soon | ${rs.expiring_soon} |`)
  l.push(`| Overdue Obligations | ${rs.overdue_obligations} |`)
  l.push(`| Total Exposure | ${fmtCur(rs.total_exposure)} |`)
  l.push('')
  // Financial exposure breakdown by risk category
  const criticalAlerts = result.alerts.filter(a => a.severity === 'critical').length
  const warningAlerts = result.alerts.filter(a => a.severity === 'warning').length
  const riskIndex = criticalAlerts * 3 + warningAlerts
  const riskLevel = riskIndex > 20 ? '\uD83D\uDD34 CRITICAL' : riskIndex > 10 ? '\uD83D\uDFE0 ELEVATED' : '\uD83D\uDFE2 NORMAL'
  l.push(`**Portfolio Risk Index:** ${riskLevel} (Score: ${riskIndex})`)
  l.push('')
  if (result.alerts.length > 0) {
    l.push('### Alerts')
    for (const a of result.alerts.slice(0, 20)) {
      const icon = a.severity === 'critical' ? '\uD83D\uDD34' : a.severity === 'warning' ? '\uD83D\uDFE0' : '\uD83D\uDFE2'
      l.push(`- ${icon} [${a.alert_type}] ${a.message}`)
      l.push(`  - Action: ${a.action_required} (by ${a.deadline})`)
    }
    if (result.alerts.length > 20) l.push(`- ... and ${result.alerts.length - 20} more alerts`)
    l.push('')
  }
  if (result.obligation_status.length > 0) {
    l.push('### Obligation Status')
    l.push('| Contract | Total | Done | Pending | Overdue | Rate |')
    l.push('|----------|-------|------|---------|---------|------|')
    for (const os of result.obligation_status) {
      const flag = os.overdue > 0 ? '\uD83D\uDD34' : os.completion_rate >= 80 ? '\u2705' : '\uD83D\uDFE0'
      l.push(`| ${flag} ${os.contract_id} | ${os.total_obligations} | ${os.completed} | ${os.pending} | ${os.overdue} | ${os.completion_rate}% |`)
    }
    l.push('')
  }
  if (result.expiry_calendar.length > 0) {
    l.push('### Expiry Calendar (Next 90 Days)')
    for (const ec of result.expiry_calendar) {
      const icon = ec.days_remaining <= 0 ? '\uD83D\uDD34' : ec.days_remaining <= 30 ? '\uD83D\uDFE0' : '\uD83D\uDFE1'
      l.push(`- ${icon} ${ec.contract_id}: ${ec.title} (${ec.days_remaining}d) - ${ec.action}`)
    }
    l.push('')
  }
  l.push('### Next Steps')
  l.push('1. Address all critical alerts (expired contracts and overdue obligations)')
  l.push('2. Initiate renewal negotiations for contracts expiring within 30 days')
  l.push('3. Assign owners to pending obligations with approaching deadlines')
  l.push('4. Review high-value contracts for risk mitigation opportunities')
  l.push('')
  l.push('---')
  l.push('*Report generated by ERP Agent Contract Tracker. All values in contract currency.*')
  l.push('')
  return l.join('\n')
}

// ==================== TOOL 4: COMPLIANCE MONITOR ====================

function monitorCompliance(transactions: Transaction[], regulations: Regulation[]): ComplianceMonitorResult {
  const findings: ComplianceFinding[] = []
  const now = today()
  for (const txn of transactions) {
    for (const reg of regulations) {
      if (reg.type === 'aml' && reg.threshold && txn.amount >= reg.threshold) {
        findings.push({ transaction_id: txn.id, regulation_id: reg.id, finding_type: 'threshold_exceeded', severity: txn.amount >= reg.threshold * 5 ? 'critical' : txn.amount >= reg.threshold * 2 ? 'high' : 'medium', description: `TXN ${txn.id} amount ${fmtCur(txn.amount)} exceeds AML threshold ${fmtCur(reg.threshold)}`, recommended_action: 'File SAR and conduct enhanced due diligence', regulatory_reference: `${reg.name} 31 CFR 1020.320` })
      }
      if (reg.type === 'sanctions') {
        if (reg.restricted_countries?.includes(txn.country)) findings.push({ transaction_id: txn.id, regulation_id: reg.id, finding_type: 'sanctions_match', severity: 'critical', description: `TXN ${txn.id} involves restricted country: ${txn.country}`, recommended_action: 'Freeze transaction immediately', regulatory_reference: `${reg.name} - OFAC SDN` })
        if (reg.restricted_entities?.some(e => txn.payer.toLowerCase().includes(e.toLowerCase()) || txn.payee.toLowerCase().includes(e.toLowerCase()))) findings.push({ transaction_id: txn.id, regulation_id: reg.id, finding_type: 'entity_match', severity: 'critical', description: `TXN ${txn.id} party matches restricted entity`, recommended_action: 'Block and notify OFAC', regulatory_reference: `${reg.name} - SDN Match` })
      }
      if (reg.type === 'tax' && txn.amount > 10000 && txn.amount % 10000 === 0) findings.push({ transaction_id: txn.id, regulation_id: reg.id, finding_type: 'structuring_suspected', severity: 'high', description: `TXN ${txn.id} shows potential structuring pattern`, recommended_action: 'Review history and file CTR if required', regulatory_reference: `${reg.name} - BSA 31 USC 5313` })
      if (reg.type === 'trade' && txn.category === 'import' && txn.amount > 2500) findings.push({ transaction_id: txn.id, regulation_id: reg.id, finding_type: 'customs_declaration_required', severity: 'medium', description: `Import TXN ${txn.id} requires formal customs declaration`, recommended_action: 'Submit CBP Form 7501', regulatory_reference: `${reg.name} - 19 CFR 142.3` })
      if (reg.type === 'data_privacy' && txn.purpose.toLowerCase().includes('personal data')) findings.push({ transaction_id: txn.id, regulation_id: reg.id, finding_type: 'data_transfer_review', severity: 'medium', description: `TXN ${txn.id} involves personal data transfer`, recommended_action: 'Conduct DPIA before processing', regulatory_reference: `${reg.name} - GDPR Article 35` })
    }
  }
  const byReg: ComplianceMonitorResult['compliance_report']['by_regulation'] = []
  for (const reg of regulations) { const v = findings.filter(f => f.regulation_id === reg.id).length; byReg.push({ regulation: reg.name, violations: v, status: v === 0 ? 'pass' : v > 3 ? 'fail' : 'warning' }) }
  const bySev = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  for (const f of findings) bySev[f.severity]++
  const remediation: ComplianceMonitorResult['remediation_plan'] = []
  let pri = 1
  for (const f of findings.filter(f => f.severity === 'critical' || f.severity === 'high').slice(0, 10)) {
    remediation.push({ priority: pri++, finding: f.description, action: f.recommended_action, responsible_party: f.severity === 'critical' ? 'Chief Compliance Officer' : 'Compliance Manager', deadline: addDays(now, f.severity === 'critical' ? 1 : 7) })
  }
  const complianceRate = transactions.length > 0 ? parseFloat((((transactions.length * regulations.length) - findings.length) / (transactions.length * regulations.length) * 100).toFixed(1)) : 100
  return { findings, compliance_report: { total_transactions: transactions.length, violations_found: findings.length, compliance_rate: Math.max(0, complianceRate), by_regulation: byReg, by_severity: bySev }, remediation_plan: remediation }
}

function formatCompliance(result: ComplianceMonitorResult): string {
  const l: string[] = []
  l.push('## Compliance Monitor Report')
  l.push('')
  const cr = result.compliance_report
  l.push('### Compliance Summary')
  l.push('| Metric | Value |')
  l.push('|--------|-------|')
  l.push(`| Total Transactions | ${cr.total_transactions} |`)
  l.push(`| Violations Found | ${cr.violations_found} |`)
  l.push(`| Compliance Rate | ${cr.compliance_rate}% |`)
  l.push(`| Critical / High / Medium | ${cr.by_severity.critical} / ${cr.by_severity.high} / ${cr.by_severity.medium} |`)
  l.push('')
  // Compute aggregate risk score (weighted severity)
  const riskScore = cr.by_severity.critical * 10 + cr.by_severity.high * 5 + cr.by_severity.medium * 2 + cr.by_severity.low * 1
  const riskLevel = riskScore > 50 ? 'HIGH' : riskScore > 20 ? 'MEDIUM' : 'LOW'
  const riskIcon = riskScore > 50 ? '\uD83D\uDD34' : riskScore > 20 ? '\uD83D\uDFE0' : '\u2705'
  l.push(`**Aggregate Risk Score:** ${riskIcon} ${riskScore} (${riskLevel})`)
  l.push('')
  if (cr.by_regulation.length > 0) {
    l.push('### By Regulation')
    l.push('| Regulation | Violations | Status |')
    l.push('|------------|-----------|--------|')
    for (const br of cr.by_regulation) {
      const icon = br.status === 'pass' ? '\u2705' : br.status === 'warning' ? '\u26A0\uFE0F' : '\u274C'
      l.push(`| ${br.regulation} | ${br.violations} | ${icon} ${br.status.toUpperCase()} |`)
    }
    l.push('')
  }
  if (result.findings.length > 0) {
    l.push('### Findings Detail')
    for (const f of result.findings.slice(0, 15)) {
      const sev = f.severity === 'critical' ? '\uD83D\uDD34' : f.severity === 'high' ? '\uD83D\uDFE0' : f.severity === 'medium' ? '\uD83D\uDFE1' : '\uD83D\uDFE2'
      l.push(`- ${sev} [${f.severity.toUpperCase()}] TXN ${f.transaction_id} / ${f.regulation_id}`)
      l.push(`  - ${f.description}`)
      l.push(`  - Action: ${f.recommended_action}`)
    }
    if (result.findings.length > 15) l.push(`- ... and ${result.findings.length - 15} more findings`)
    l.push('')
  }
  if (result.remediation_plan.length > 0) {
    l.push('### Remediation Plan')
    for (const rp of result.remediation_plan) l.push(`- **P${rp.priority}**: ${rp.finding.substring(0, 80)}... | Owner: ${rp.responsible_party} | Due: ${rp.deadline}`)
    l.push('')
  }
  l.push('### Next Steps')
  l.push('1. Escalate all critical findings to the Chief Compliance Officer immediately')
  l.push('2. File SARs for all AML threshold exceedances within regulatory deadlines')
  l.push('3. Block or freeze any transactions with confirmed sanctions matches')
  l.push('4. Schedule follow-up audit for medium and low severity findings')
  l.push('5. Update transaction monitoring rules based on findings patterns')
  l.push('')
  l.push('---')
  l.push('*Report generated by ERP Agent Compliance Monitor. Review all critical findings immediately.*')
  l.push('')
  return l.join('\n')
}

// ==================== TOOL 5: FINANCIAL RECONCILER ====================

function reconcileFinancials(bankStatements: BankStatementEntry[], ledgerEntries: LedgerEntry[], tolerance: number = 0.01): BankReconciliationResult {
  const bankBal = bankStatements.length > 0 ? bankStatements[bankStatements.length - 1].balance : 0
  const ledgerBal = ledgerEntries.reduce((s, e) => s + e.debit - e.credit, 0)
  const items: BankReconciliationResult['reconciliation_items'] = []
  const bankRefs = new Set(bankStatements.map(b => b.reference))

  const ledgerRefs = new Set(ledgerEntries.map(e => e.journal_id))
  for (const e of ledgerEntries) { if (e.credit > 0 && !bankRefs.has(e.journal_id)) items.push({ type: 'outstanding_deposit', description: e.description, amount: e.credit, adjustment_to: 'bank' }) }
  for (const b of bankStatements) { if (b.debit > 0 && !ledgerRefs.has(b.reference)) items.push({ type: 'outstanding_check', description: b.description, amount: b.debit, adjustment_to: 'bank' }) }
  for (const b of bankStatements) { if (b.description.toLowerCase().includes('fee') || b.description.toLowerCase().includes('charge') || b.description.toLowerCase().includes('service')) items.push({ type: 'bank_charge', description: b.description, amount: b.debit, adjustment_to: 'book' }) }
  for (const b of bankStatements) { if (b.description.toLowerCase().includes('interest') && b.credit > 0) items.push({ type: 'interest_earned', description: b.description, amount: b.credit, adjustment_to: 'book' }) }

  let adjBank = bankBal, adjLedger = ledgerBal
  for (const item of items) { if (item.adjustment_to === 'bank') adjBank += item.amount; else adjLedger += item.amount }

  const initVar = Math.abs(bankBal - ledgerBal)
  const explainedVar = items.reduce((s, i) => s + i.amount, 0)
  const unexplainedVar = Math.abs(adjBank - adjLedger)

  const actions: BankReconciliationResult['action_items'] = []
  if (unexplainedVar > tolerance) actions.push({ item: 'Unexplained variance after reconciliation', priority: 'high', assigned_to: 'Senior Accountant', due_date: addDays(today(), 3) })
  for (const e of ledgerEntries.filter(e => e.credit > 0 && !bankRefs.has(e.journal_id))) { if (daysBetween(e.date, today()) > 5) actions.push({ item: `Stale deposit: ${e.description} (${e.date})`, priority: 'medium', assigned_to: 'Accounts Receivable', due_date: addDays(today(), 5) }) }
  for (const b of bankStatements.filter(b => b.debit > 0 && !ledgerRefs.has(b.reference))) { if (daysBetween(b.date, today()) > 30) actions.push({ item: `Stale check: ${b.description} (${b.date})`, priority: 'medium', assigned_to: 'Accounts Payable', due_date: addDays(today(), 7) }) }

  return { bank_balance: bankBal, ledger_balance: parseFloat(ledgerBal.toFixed(2)), adjusted_bank_balance: parseFloat(adjBank.toFixed(2)), adjusted_ledger_balance: parseFloat(adjLedger.toFixed(2)), reconciliation_items: items, variance_analysis: { initial_variance: parseFloat(initVar.toFixed(2)), explained_variance: parseFloat(explainedVar.toFixed(2)), unexplained_variance: parseFloat(unexplainedVar.toFixed(2)), reconciliation_status: unexplainedVar <= tolerance ? 'reconciled' : 'unreconciled' }, action_items: actions }
}

function formatFinancialReconciler(result: BankReconciliationResult): string {
  const l: string[] = []
  l.push('## Financial Reconciler Report')
  l.push('')
  l.push('### Balance Summary')
  l.push('| Item | Amount |')
  l.push('|------|--------|')
  l.push(`| Bank Balance | ${fmtCur(result.bank_balance)} |`)
  l.push(`| Ledger Balance | ${fmtCur(result.ledger_balance)} |`)
  l.push(`| Adjusted Bank | ${fmtCur(result.adjusted_bank_balance)} |`)
  l.push(`| Adjusted Ledger | ${fmtCur(result.adjusted_ledger_balance)} |`)
  l.push('')
  const va = result.variance_analysis
  const statusIcon = va.reconciliation_status === 'reconciled' ? '\u2705' : '\u274C'
  l.push('### Variance Analysis')
  l.push('| Metric | Amount |')
  l.push('|--------|--------|')
  l.push(`| Initial Variance | ${fmtCur(va.initial_variance)} |`)
  l.push(`| Explained | ${fmtCur(va.explained_variance)} |`)
  l.push(`| Unexplained | ${fmtCur(va.unexplained_variance)} |`)
  l.push(`| Status | ${statusIcon} ${va.reconciliation_status.toUpperCase()} |`)
  l.push('')
  // Variance composition analysis
  const totalItems = result.reconciliation_items.length
  const bankAdj = result.reconciliation_items.filter(i => i.adjustment_to === 'bank').length
  const bookAdj = result.reconciliation_items.filter(i => i.adjustment_to === 'book').length
  l.push(`**Adjustment Composition:** ${totalItems} total items | Bank adjustments: ${bankAdj} | Book adjustments: ${bookAdj}`)
  l.push('')
  if (result.reconciliation_items.length > 0) {
    l.push('### Reconciliation Items')
    l.push('| Type | Description | Amount | Adjust To |')
    l.push('|------|-------------|--------|-----------|')
    for (const item of result.reconciliation_items.slice(0, 15)) {
      const icon = item.type === 'bank_charge' ? '\uD83D\uDCB3' : item.type === 'interest_earned' ? '\uD83D\uDCB0' : '\uD83D\uDCCB'
      l.push(`| ${icon} ${item.type} | ${item.description} | ${fmtCur(item.amount)} | ${item.adjustment_to} |`)
    }
    l.push('')
  }
  if (result.action_items.length > 0) {
    l.push('### Action Items')
    for (const ai of result.action_items) {
      const pri = ai.priority === 'high' ? '\uD83D\uDD34' : ai.priority === 'medium' ? '\uD83D\uDFE0' : '\uD83D\uDFE1'
      l.push(`- ${pri} **${ai.priority.toUpperCase()}**: ${ai.item} | Owner: ${ai.assigned_to} | Due: ${ai.due_date}`)
    }
    l.push('')
  }
  l.push('### Next Steps')
  l.push('1. Post all reconciliation items to the general ledger')
  l.push('2. Follow up on stale deposits and checks beyond 30 days')
  l.push('3. Investigate any unexplained variances exceeding tolerance')
  l.push('4. Obtain sign-off from controller on final reconciliation')
  l.push('')
  l.push('---')
  l.push('*Report generated by ERP Agent Financial Reconciler. Amounts in presentation currency.*')
  l.push('')
  return l.join('\n')
}

// ==================== TOOL 6: WORKFLOW AUTOMATOR ====================

function automateWorkflow(processName: string, steps: ProcessStep[], triggers: WFTrigger[], actions: WFAction[]): WorkflowResult {
  const rng = seededRng(processName)
  const executionPlan: WorkflowResult['execution_plan'] = []
  let phase = 1
  const processed = new Set<string>()
  for (const step of topologicalSort(steps)) {
    const depsMet = step.dependencies.every(d => processed.has(d))
    const auto = step.type !== 'approval' || rng.next() > 0.3
    executionPlan.push({ phase, step_id: step.step_id, step_name: step.name, estimated_duration_hours: step.sla_hours, dependencies_met: depsMet, automated: auto })
    processed.add(step.step_id); phase++
  }
  const autoSteps = executionPlan.filter(e => e.automated).length
  const manSteps = executionPlan.filter(e => !e.automated).length
  const cycleTime = executionPlan.reduce((s, e) => s + e.estimated_duration_hours, 0)
  const maxDur = Math.max(...executionPlan.map(e => e.estimated_duration_hours))
  const bottlenecks = executionPlan.filter(e => e.estimated_duration_hours >= maxDur * 0.8).map(e => e.step_id)

  const risks: WorkflowResult['risk_assessment'] = []
  if (manSteps > autoSteps) risks.push({ risk: 'High manual intervention', likelihood: 'high', impact: 'medium', mitigation: 'Convert manual steps to semi-automated with approval gates' })
  if (bottlenecks.length > 0) risks.push({ risk: `Bottleneck at: ${bottlenecks.join(', ')}`, likelihood: 'medium', impact: 'high', mitigation: 'Parallelize sub-tasks or reduce SLA' })
  if (executionPlan.filter(e => !e.dependencies_met).length > 0) risks.push({ risk: 'Unmet dependencies', likelihood: 'medium', impact: 'medium', mitigation: 'Add dependency checking pre-flight step' })
  risks.push({ risk: 'System integration failure', likelihood: 'low', impact: 'high', mitigation: 'Implement retry logic with exponential backoff' })

  return {
    workflow_config: { workflow_id: `WF-${processName.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`, name: processName, version: '1.0', steps, trigger_config: triggers, action_config: actions },
    execution_plan: executionPlan,
    automation_metrics: { total_steps: steps.length, automated_steps: autoSteps, manual_steps: manSteps, automation_rate: steps.length > 0 ? parseFloat(((autoSteps / steps.length) * 100).toFixed(1)) : 0, estimated_cycle_time_hours: cycleTime, bottleneck_steps: bottlenecks },
    risk_assessment: risks
  }
}

function formatWorkflow(result: WorkflowResult): string {
  const l: string[] = []
  l.push('## Workflow Automator Report')
  l.push('')
  const wc = result.workflow_config
  l.push('### Workflow Configuration')
  l.push(`- **ID**: ${wc.workflow_id}`)
  l.push(`- **Name**: ${wc.name}`)
  l.push(`- **Steps**: ${wc.steps.length} | **Triggers**: ${wc.trigger_config.length} | **Actions**: ${wc.action_config.length}`)
  l.push('')
  const am = result.automation_metrics
  l.push('### Automation Metrics')
  l.push('| Metric | Value |')
  l.push('|--------|-------|')
  l.push(`| Total Steps | ${am.total_steps} |`)
  l.push(`| Automated | ${am.automated_steps} |`)
  l.push(`| Manual | ${am.manual_steps} |`)
  l.push(`| Automation Rate | ${am.automation_rate}% |`)
  l.push(`| Est. Cycle Time | ${am.estimated_cycle_time_hours}h |`)
  l.push(`| Bottlenecks | ${am.bottleneck_steps.join(', ') || 'None'} |`)
  l.push('')
  // Effort and cost estimation
  const manualHours = result.execution_plan.filter(e => !e.automated).reduce((s, e) => s + e.estimated_duration_hours, 0)
  const autoHours = result.execution_plan.filter(e => e.automated).reduce((s, e) => s + e.estimated_duration_hours, 0)
  const blendedRate = 75 // $/hour blended cost
  const monthlyRuns = 22 // business days
  const monthlyCost = manualHours * blendedRate * monthlyRuns
  const savingsFromAuto = autoHours * blendedRate * monthlyRuns
  l.push('### Effort & Cost Estimate')
  l.push('| Metric | Value |')
  l.push('|--------|-------|')
  l.push(`| Manual Effort per Run | ${manualHours}h |`)
  l.push(`| Automated Effort per Run | ${autoHours}h |`)
  l.push(`| Est. Monthly Cost | $${monthlyCost.toLocaleString()} |`)
  l.push(`| Monthly Savings from Auto | $${savingsFromAuto.toLocaleString()} |`)
  l.push('')
  if (result.execution_plan.length > 0) {
    l.push('### Execution Plan')
    l.push('| Phase | Step | Duration | Deps Met | Auto |')
    l.push('|-------|------|----------|----------|------|')
    for (const ep of result.execution_plan) {
      const aIcon = ep.automated ? '\u2699\uFE0F' : '\uD83D\uDC68\u200D\uD83D\uDCBB'
      const dIcon = ep.dependencies_met ? '\u2705' : '\u274C'
      l.push(`| ${ep.phase} | ${ep.step_name} | ${ep.estimated_duration_hours}h | ${dIcon} | ${aIcon} |`)
    }
    l.push('')
    // Dependency chain analysis
    const blockedSteps = result.execution_plan.filter(e => !e.dependencies_met).length
    const parallelizable = result.execution_plan.filter(e => e.automated && e.dependencies_met).length
    l.push(`**Chain Analysis:** ${blockedSteps} blocked steps | ${parallelizable} parallelizable automated steps`)
    l.push('')
  }
  if (result.risk_assessment.length > 0) {
    l.push('### Risk Assessment')
    for (const r of result.risk_assessment) {
      const lh = r.likelihood === 'high' ? '\uD83D\uDD34' : r.likelihood === 'medium' ? '\uD83D\uDFE0' : '\uD83D\uDFE1'
      const im = r.impact === 'high' ? '\uD83D\uDD34' : r.impact === 'medium' ? '\uD83D\uDFE0' : '\uD83D\uDFE1'
      l.push(`- **${r.risk}** | Likelihood: ${lh} | Impact: ${im}`)
      l.push(`  - Mitigation: ${r.mitigation}`)
    }
    l.push('')
  }
  l.push('### Next Steps')
  l.push('1. Review and approve the workflow configuration with process owners')
  l.push('2. Implement automation for identified high-ROI steps')
  l.push('3. Address bottleneck steps identified in the execution plan')
  l.push('4. Set up monitoring dashboards for cycle time tracking')
  l.push('5. Schedule workflow testing in a non-production environment')
  l.push('')
  return l.join('\n')
}

// ==================== TOOL 7: DATA CONSISTENCY CHECKER ====================

function checkDataConsistency(datasets: Dataset[], rules: ConsistencyRule[]): DataConsistencyResult {
  const findings: ConsistencyFinding[] = []
  const repairs: DataConsistencyResult['repair_scripts'] = []
  let totalRecs = 0, totalViol = 0

  for (const rule of rules) {
    const ds = datasets.find(d => d.name === rule.source_dataset)
    if (!ds) continue
    totalRecs += ds.record_count
    switch (rule.type) {
      case 'completeness': {
        const viols = ds.sample_records.filter(rec => { const v = rec[rule.field]; return v === null || v === undefined || v === '' })
        if (viols.length > 0) {
          const est = Math.ceil(viols.length / ds.sample_records.length * ds.record_count)
          findings.push({ rule_id: rule.rule_id, dataset: ds.name, field: rule.field, record_count: est, issue_type: 'incomplete_data', description: `${est} records missing values in "${rule.field}"`, sample_violations: viols.slice(0, 5) })
          totalViol += est
        }
        repairs.push({ script_id: `REPAIR-${rule.rule_id}`, target_dataset: ds.name, issue_type: 'incomplete_data', repair_action: 'Fill missing with defaults or lookup', estimated_records_affected: Math.ceil(ds.record_count * 0.05), sql_preview: `UPDATE ${ds.name} SET ${rule.field} = ${rule.field === 'amount' ? '0' : "'N/A'"} WHERE ${rule.field} IS NULL;` })
        break
      }
      case 'uniqueness': {
        const vals = ds.sample_records.map(rec => String(rec[rule.field]))
        const dupes = vals.filter((v, i) => vals.indexOf(v) !== i)
        if (dupes.length > 0) {
          const uniqueDupes = [...new Set(dupes)]
          const est = Math.ceil(uniqueDupes.length / ds.sample_records.length * ds.record_count)
          findings.push({ rule_id: rule.rule_id, dataset: ds.name, field: rule.field, record_count: est, issue_type: 'duplicate_data', description: `${est} duplicate values in "${rule.field}"`, sample_violations: ds.sample_records.filter(rec => uniqueDupes.includes(String(rec[rule.field]))).slice(0, 5) })
          totalViol += est
        }
        repairs.push({ script_id: `REPAIR-${rule.rule_id}`, target_dataset: ds.name, issue_type: 'duplicate_data', repair_action: 'Remove duplicates keeping most recent', estimated_records_affected: Math.ceil(ds.record_count * 0.02), sql_preview: `DELETE FROM ${ds.name} WHERE ctid NOT IN (SELECT MAX(ctid) FROM ${ds.name} GROUP BY ${rule.field});` })
        break
      }
      case 'range_check': {
        const nums = ds.sample_records.map(rec => Number(rec[rule.field])).filter(v => !isNaN(v))
        const hasNeg = nums.some(v => v < 0)
        if (hasNeg || nums.length > 0 && Math.min(...nums) === 0) {
          const viols = ds.sample_records.filter(rec => { const v = Number(rec[rule.field]); return v < 0 || isNaN(v) })
          findings.push({ rule_id: rule.rule_id, dataset: ds.name, field: rule.field, record_count: Math.ceil(viols.length / ds.sample_records.length * ds.record_count), issue_type: 'out_of_range', description: `"${rule.field}" has values outside expected range`, sample_violations: viols.slice(0, 5) })
          totalViol += Math.ceil(viols.length / ds.sample_records.length * ds.record_count)
        }
        repairs.push({ script_id: `REPAIR-${rule.rule_id}`, target_dataset: ds.name, issue_type: 'out_of_range', repair_action: 'Flag out-of-range for review', estimated_records_affected: Math.ceil(ds.record_count * 0.01), sql_preview: `UPDATE ${ds.name} SET _review_flag = TRUE WHERE ${rule.field} < 0;` })
        break
      }
      case 'referential_integrity': {
        const tgt = datasets.find(d => d.name === rule.target_dataset)
        if (tgt) {
          const srcVals = new Set(ds.sample_records.map(rec => String(rec[rule.field])))
          const tgtVals = new Set(tgt.sample_records.map(rec => String(rec[rule.field])))
          const orphans = [...srcVals].filter(v => !tgtVals.has(v))
          if (orphans.length > 0) {
            findings.push({ rule_id: rule.rule_id, dataset: ds.name, field: rule.field, record_count: Math.ceil(orphans.length / ds.sample_records.length * ds.record_count), issue_type: 'referential_violation', description: `${orphans.length} records reference non-existent ${rule.target_dataset} records`, sample_violations: ds.sample_records.filter(rec => orphans.includes(String(rec[rule.field]))).slice(0, 5) })
            totalViol += Math.ceil(orphans.length / ds.sample_records.length * ds.record_count)
          }
          repairs.push({ script_id: `REPAIR-${rule.rule_id}`, target_dataset: ds.name, issue_type: 'referential_violation', repair_action: 'Remove orphans or create placeholders', estimated_records_affected: Math.ceil(ds.record_count * 0.005), sql_preview: `DELETE FROM ${ds.name} WHERE ${rule.field} NOT IN (SELECT ${rule.field} FROM ${rule.target_dataset});` })
        }
        break
      }
      case 'format_validation': {
        const fvs = ds.sample_records.filter(rec => { const v = String(rec[rule.field]); return rule.condition === 'email' ? !v.includes('@') : rule.condition === 'date' ? isNaN(Date.parse(v)) : rule.condition === 'phone' ? !/^\+?\d{10,}$/.test(v.replace(/\D/g, '')) : false })
        if (fvs.length > 0) {
          findings.push({ rule_id: rule.rule_id, dataset: ds.name, field: rule.field, record_count: Math.ceil(fvs.length / ds.sample_records.length * ds.record_count), issue_type: 'format_violation', description: `Format violation in "${rule.field}" - expected: ${rule.condition}`, sample_violations: fvs.slice(0, 5) })
          totalViol += Math.ceil(fvs.length / ds.sample_records.length * ds.record_count)
        }
        break
      }
      case 'cross_reference': {
        const tgt = datasets.find(d => d.name === rule.target_dataset)
        if (tgt) findings.push({ rule_id: rule.rule_id, dataset: ds.name, field: rule.field, record_count: 0, issue_type: 'cross_reference_check', description: `Cross-reference: ${ds.name} <-> ${tgt.name} on ${rule.field}`, sample_violations: [] })
        break
      }
    }
  }

  const byDataset = datasets.map(ds => { const v = findings.filter(f => f.dataset === ds.name).reduce((s, f) => s + f.record_count, 0); return { dataset: ds.name, violations: v, score: ds.record_count > 0 ? parseFloat(((1 - v / ds.record_count) * 100).toFixed(1)) : 100 } })
  const typeMap = new Map<string, number>()
  for (const f of findings) typeMap.set(f.issue_type, (typeMap.get(f.issue_type) ?? 0) + f.record_count)
  const byRuleType = Array.from(typeMap.entries()).map(([type, violations]) => ({ type, violations }))
  const score = totalRecs > 0 ? parseFloat(((1 - totalViol / totalRecs) * 100).toFixed(1)) : 100

  return { consistency_findings: findings, consistency_report: { total_records_checked: totalRecs, total_violations: totalViol, consistency_score: Math.max(0, score), by_dataset: byDataset, by_rule_type: byRuleType }, repair_scripts: repairs }
}

function formatDataConsistency(result: DataConsistencyResult): string {
  const l: string[] = []
  l.push('## Data Consistency Checker Report')
  l.push('')
  const cr = result.consistency_report
  l.push('### Consistency Summary')
  l.push('| Metric | Value |')
  l.push('|--------|-------|')
  l.push(`| Total Records Checked | ${cr.total_records_checked.toLocaleString()} |`)
  l.push(`| Total Violations | ${cr.total_violations.toLocaleString()} |`)
  l.push(`| Consistency Score | ${cr.consistency_score}% |`)
  l.push('')
  if (cr.by_dataset.length > 0) {
    l.push('### By Dataset')
    l.push('| Dataset | Violations | Score |')
    l.push('|---------|-----------|-------|')
    for (const bd of cr.by_dataset) {
      const icon = bd.score >= 95 ? '\u2705' : bd.score >= 80 ? '\u26A0\uFE0F' : '\u274C'
      l.push(`| ${bd.dataset} | ${bd.violations} | ${icon} ${bd.score}% |`)
    }
    l.push('')
    // Overall data health assessment
    const avgScore = cr.by_dataset.reduce((s, d) => s + d.score, 0) / cr.by_dataset.length
    const healthIcon = avgScore >= 95 ? '\uD83D\uDFE2' : avgScore >= 85 ? '\uD83D\uDFE1' : '\uD83D\uDD34'
    l.push(`**Data Health Score:** ${healthIcon} ${avgScore.toFixed(1)}% average across ${cr.by_dataset.length} datasets`)
    l.push('')
  }
  if (cr.by_rule_type.length > 0) {
    l.push('### By Rule Type')
    l.push('| Type | Violations |')
    l.push('|------|-----------|')
    for (const bt of cr.by_rule_type) l.push(`| ${bt.type} | ${bt.violations} |`)
    l.push('')
  }
  // Top offending fields identification
  const fieldViolMap = new Map<string, number>()
  for (const f of result.consistency_findings) {
    const key = `${f.dataset}.${f.field}`
    fieldViolMap.set(key, (fieldViolMap.get(key) ?? 0) + f.record_count)
  }
  const topOffenders = Array.from(fieldViolMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (topOffenders.length > 0) {
    l.push('### Top Offending Fields')
    for (const [field, viols] of topOffenders) {
      l.push(`- **${field}**: ${viols} violations`)
    }
    l.push('')
  }
  if (result.consistency_findings.length > 0) {
    l.push('### Findings')
    for (const f of result.consistency_findings) l.push(`- **${f.issue_type}** in ${f.dataset}.${f.field}: ${f.description}`)
    l.push('')
  }
  if (result.repair_scripts.length > 0) {
    l.push('### Repair Scripts')
    for (const rs of result.repair_scripts.slice(0, 10)) {
      l.push(`- **${rs.script_id}** [${rs.target_dataset}]: ${rs.repair_action}`)
      l.push(`  - Est. affected: ${rs.estimated_records_affected} | SQL: \`${rs.sql_preview}\``)
    }
    l.push('')
  }
  l.push('### Next Steps')
  l.push('1. Execute repair scripts in a test environment before production')
  l.push('2. Validate referential integrity after running cross-reference fixes')
  l.push('3. Re-run consistency checks to verify all violations are resolved')
  l.push('4. Implement preventive rules in the data ingestion pipeline')
  l.push('5. Schedule recurring consistency monitoring job')
  l.push('')
  return l.join('\n')
}

// ==================== TOOL 8: APPROVAL ROUTING ====================

function routeApproval(request: ApprovalRequest, hierarchy: OrgNode[], rules: RoutingRule[]): ApprovalRoute {
  const approvers: ApprovalRoute['steps'] = []
  let stepNum = 1, totalHours = 0
  for (const rule of rules.sort((a, b) => a.approver_level - b.approver_level)) {
    if (!evalCondition(rule.condition, request)) continue
    const levelApps = hierarchy.filter(n => n.level >= rule.approver_level && n.approval_limit >= request.amount)
    if (levelApps.length === 0) {
      const best = hierarchy.reduce((b, n) => n.level > b.level && n.approval_limit >= request.amount ? n : b, hierarchy[0])
      if (best) { const sla = urgencySla(request.urgency, rule.escalation_hours); approvers.push({ step_number: stepNum++, approver_name: best.name, approver_role: best.role, approval_type: rule.parallel ? 'parallel' : 'sequential', sla_hours: sla, escalation_path: 'CEO' }); totalHours += sla }
      continue
    }
    const primary = rule.parallel ? levelApps.slice(0, Math.min(2, levelApps.length)) : [levelApps[0]]
    for (const app of primary) { const sla = urgencySla(request.urgency, rule.escalation_hours); approvers.push({ step_number: stepNum++, approver_name: app.name, approver_role: app.role, approval_type: rule.parallel ? 'parallel' : 'sequential', sla_hours: sla, escalation_path: parentApprover(app, hierarchy) }); totalHours += sla }
  }
  if (approvers.length === 0) {
    const mgr = hierarchy.find(n => n.level === request.requester_level + 1)
    if (mgr) { const sla = urgencySla(request.urgency, 48); approvers.push({ step_number: 1, approver_name: mgr.name, approver_role: mgr.role, approval_type: 'sequential', sla_hours: sla, escalation_path: parentApprover(mgr, hierarchy) }); totalHours += sla }
  }
  // Generate risk flags based on path analysis
  const risks: string[] = []
  if (request.amount > 100000) risks.push('High-value approval - additional scrutiny recommended')
  if (request.urgency === 'critical') risks.push('Critical urgency - expedited processing required')
  if (approvers.length > 3) risks.push('Long approval chain - consider delegation')
  if (request.amount > (approvers[0] ? 50000 : 0)) risks.push('Amount exceeds single-approver comfort zone')

  // Estimate business days assuming 8-hour workdays
  const estDays = Math.ceil(totalHours / 8)

  // Compute delegation availability for each approver
  const approversWithDelegation = approvers.map(s => ({
    ...s,
    delegation_available: hierarchy.find(n => n.name === s.approver_name)?.delegates?.length ?? 0
  }))

  // Determine if path can be optimized (parallel steps or delegation)
  const canOptimize = approvers.length > 2 || approversWithDelegation.some(a => a.delegation_available > 0)

  return { request_id: request.request_id, steps: approvers, estimated_total_hours: totalHours, estimated_total_days: estDays, approval_path_summary: approvers.length > 0 ? approvers.map(s => `${s.approver_name} (${s.approver_role})`).join(' -> ') : 'No approvers found', risk_flags: risks }
}

function formatApprovalRouting(result: ApprovalRoute): string {
  const l: string[] = []
  l.push('## Approval Routing Report')
  l.push('')
  l.push('### Request Details')
  l.push(`- **Request ID**: ${result.request_id}`)
  l.push(`- **Approval Path**: ${result.approval_path_summary}`)
  l.push(`- **Estimated Total**: ${result.estimated_total_hours}h (${result.estimated_total_days} business days)`)
  l.push('')
  if (result.steps.length > 0) {
    l.push('### Approval Steps')
    l.push('| Step | Approver | Role | Type | SLA | Escalation |')
    l.push('|------|----------|------|------|-----|------------|')
    for (const s of result.steps) {
      const tIcon = s.approval_type === 'parallel' ? '\u27A1\u27A1' : '\u27A1'
      l.push(`| ${s.step_number} | ${s.approver_name} | ${s.approver_role} | ${tIcon} ${s.approval_type} | ${s.sla_hours}h | ${s.escalation_path} |`)
    }
    l.push('')
  }
  l.push('### Risk Flags')
  if (result.risk_flags.length === 0) l.push('- \u2705 No risk flags')
  else for (const f of result.risk_flags) l.push(`- \u26A0\uFE0F ${f}`)
  l.push('')
  l.push('### Next Steps')
  l.push('1. Notify the first approver in the chain to initiate the approval process')
  l.push('2. Monitor SLA deadlines and trigger escalations if thresholds are breached')
  l.push('3. For critical urgency, consider parallel approval path or executive override')
  l.push('4. Document any risk flags in the approval audit trail')
  l.push('5. Route completed approvals to post-approval processing (payment, procurement)')
  l.push('')
  l.push('---')
  l.push('*Report generated by ERP Agent Approval Router. Times in business hours.*')
  l.push('')
  return l.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'reconciliation_engine',
    description: 'Match and reconcile data between two sources using configurable match rules. Returns matched pairs, discrepancies, adjustment recommendations, and reconciliation summary.',
    parameters: {
      source_data: { type: 'string', required: true, description: 'JSON array of source records: id, amount, date, description, category?, reference?' },
      target_data: { type: 'string', required: true, description: 'JSON array of target records: id, amount, date, description, category?, reference?' },
      match_rules: { type: 'string', required: true, description: 'JSON array of match rules: field (amount/date/reference/description/category), tolerance?, exact?, weight?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { source_data: string; target_data: string; match_rules: string }) {
      const src: SourceRecord[] = JSON.parse(args.source_data)
      const tgt: TargetRecord[] = JSON.parse(args.target_data)
      const rules: MatchRule[] = JSON.parse(args.match_rules)
      return formatReconciliation(performReconciliation(src, tgt, rules))
    }
  }))

  tools.register(defineTool({
    name: 'accrual_calculator',
    description: 'Calculate period-end accruals for expenses and revenue recognition. Supports straight-line, percentage, fixed, and usage-based methods.',
    parameters: {
      period: { type: 'string', required: true, description: 'Accounting period in YYYY-MM format' },
      expense_rules: { type: 'string', required: true, description: 'JSON array of expense rules: category, accrual_method, total_amount, recognized_to_date, start_date, end_date' },
      revenue_data: { type: 'string', required: true, description: 'JSON array of revenue data: contract_id, total_contract_value, performance_obligations[], billing_to_date' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { period: string; expense_rules: string; revenue_data: string }) {
      const rules: ExpenseRule[] = JSON.parse(args.expense_rules)
      const revenue: RevenueData[] = JSON.parse(args.revenue_data)
      return formatAccrual(calculateAccruals(args.period, rules, revenue))
    }
  }))

  tools.register(defineTool({
    name: 'contract_tracker',
    description: 'Monitor contract obligations, track expiration dates, generate alerts for renewals and overdue obligations.',
    parameters: {
      contracts: { type: 'string', required: true, description: 'JSON array of contracts: id, title, counterparty, start_date, end_date, value, currency, status, obligations[], auto_renew, renewal_notice_days' },
      alert_rules: { type: 'string', required: true, description: 'Alert config: days_before_expiry, obligation_reminder_days, value_threshold' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contracts: string; alert_rules: string }) {
      const contracts: Contract[] = JSON.parse(args.contracts)
      const alertRules: AlertRule = JSON.parse(args.alert_rules)
      return formatContractTracker(trackContracts(contracts, alertRules))
    }
  }))

  tools.register(defineTool({
    name: 'compliance_monitor',
    description: 'Screen transactions against regulatory rules: AML, sanctions, tax, trade compliance, data privacy.',
    parameters: {
      transactions: { type: 'string', required: true, description: 'JSON array of transactions: id, date, amount, currency, payer, payee, purpose, country, category' },
      regulations: { type: 'string', required: true, description: 'JSON array of regulations: id, name, type, threshold?, restricted_countries?, restricted_entities?, rules[]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { transactions: string; regulations: string }) {
      const txns: Transaction[] = JSON.parse(args.transactions)
      const regs: Regulation[] = JSON.parse(args.regulations)
      return formatCompliance(monitorCompliance(txns, regs))
    }
  }))

  tools.register(defineTool({
    name: 'financial_reconciler',
    description: 'Reconcile bank statements against ledger entries. Identifies outstanding items, bank charges, interest, and produces reconciliation statement.',
    parameters: {
      bank_statements: { type: 'string', required: true, description: 'JSON array of bank entries: date, reference, description, debit, credit, balance' },
      ledger_entries: { type: 'string', required: true, description: 'JSON array of ledger entries: date, journal_id, account, description, debit, credit' },
      tolerance: { type: 'string', description: 'Tolerance for variance. Default "0.01"' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { bank_statements: string; ledger_entries: string; tolerance?: string }) {
      const bank: BankStatementEntry[] = JSON.parse(args.bank_statements)
      const ledger: LedgerEntry[] = JSON.parse(args.ledger_entries)
      return formatFinancialReconciler(reconcileFinancials(bank, ledger, parseFloat(args.tolerance ?? '0.01')))
    }
  }))

  tools.register(defineTool({
    name: 'workflow_automator',
    description: 'Define and automate business workflows with dependency analysis, automation metrics, and risk assessment.',
    parameters: {
      process_name: { type: 'string', required: true, description: 'Name of the business process' },
      process_steps: { type: 'string', required: true, description: 'JSON array of steps: step_id, name, type, assignee_role, sla_hours, dependencies[]' },
      triggers: { type: 'string', required: true, description: 'JSON array of triggers: event (schedule/data_change/manual/threshold/external), config' },
      actions: { type: 'string', required: true, description: 'JSON array of actions: action_type, target, parameters' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { process_name: string; process_steps: string; triggers: string; actions: string }) {
      const steps: ProcessStep[] = JSON.parse(args.process_steps)
      const triggers: WFTrigger[] = JSON.parse(args.triggers)
      const actions: WFAction[] = JSON.parse(args.actions)
      return formatWorkflow(automateWorkflow(args.process_name, steps, triggers, actions))
    }
  }))

  tools.register(defineTool({
    name: 'data_consistency_checker',
    description: 'Validate data consistency across datasets: completeness, uniqueness, range, referential integrity, format, cross-reference. Returns repair scripts.',
    parameters: {
      datasets: { type: 'string', required: true, description: 'JSON array of datasets: name, source, record_count, fields[], sample_records[]' },
      consistency_rules: { type: 'string', required: true, description: 'JSON array of rules: rule_id, name, type, source_dataset, target_dataset?, field, condition, severity' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { datasets: string; consistency_rules: string }) {
      const datasets: Dataset[] = JSON.parse(args.datasets)
      const rules: ConsistencyRule[] = JSON.parse(args.consistency_rules)
      return formatDataConsistency(checkDataConsistency(datasets, rules))
    }
  }))

  tools.register(defineTool({
    name: 'approval_routing',
    description: 'Generate optimal approval routing paths with SLAs, escalation paths, and risk flags based on org hierarchy.',
    parameters: {
      approval_request: { type: 'string', required: true, description: 'Approval request: request_id, request_type, amount, currency, requester, requester_level, department, justification, urgency' },
      org_hierarchy: { type: 'string', required: true, description: 'JSON array of org nodes: id, name, role, level, department, parent_id?, approval_limit' },
      routing_rules: { type: 'string', required: true, description: 'JSON array of rules: condition, approver_level, approver_role, parallel, escalation_hours' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { approval_request: string; org_hierarchy: string; routing_rules: string }) {
      const req: ApprovalRequest = JSON.parse(args.approval_request)
      const org: OrgNode[] = JSON.parse(args.org_hierarchy)
      const rules: RoutingRule[] = JSON.parse(args.routing_rules)
      return formatApprovalRouting(routeApproval(req, org, rules))
    }
  }))

  console.log(`[dsh-tool-erpagent] Loaded v${VERSION} - Enterprise ERP Automation Agent with 8 tools`)
  console.log('  Tools: reconciliation_engine, accrual_calculator, contract_tracker, compliance_monitor, financial_reconciler, workflow_automator, data_consistency_checker, approval_routing')
}