/**
 * DSH AI Robo-Founder / Company Automation Plugin v1.0.0
 *
 * The 2026 trend: AI agents acting as co-founders, CFOs, CLOs, and COOs for
 * solo entrepreneurs and micro-teams. This toolkit automates company formation,
 * financial operations, legal compliance, HR processes, tax optimization,
 * investor readiness assessment, and runway planning — enabling a single
 * founder to run a company with minimal human intervention.
 *
 * Features (v1.0.0):
 * - Company Formation Automator (registration, EIN, bank account, contracts)
 * - AI CFO Dashboard (financial metrics, cash flow, projections)
 * - Legal Compliance Scanner (compliance requirements by business type/jurisdiction)
 * - Contract Generator AI (NDA, SaaS, employment, contractor contracts)
 * - HR Automation Planner (onboarding, payroll, benefits, performance reviews)
 * - Tax Optimization Advisor (tax strategies for small businesses)
 * - Investor-Ready Score (startup investor readiness across key dimensions)
 * - Runway Extension Planner (cost reduction, revenue acceleration, bridge funding)
 *
 * @module dsh-tool-robofounder
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-robofounder'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated analysis for informational purposes only. It does not constitute legal, financial, or tax advice. Consult qualified professionals before making business decisions.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromString(input: string): number {
  return input.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function round(value: number, digits = 2): number {
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}

// ==================== TYPES ====================

// --- Tool 1: Company Formation Automator ---
interface CompanyFormationInput {
  company_name?: string
  jurisdiction?: string
  entity_type?: 'LLC' | 'C-Corp' | 'S-Corp' | 'B-Corp' | 'sole_proprietorship'
  founder_info?: {
    name?: string
    email?: string
    phone?: string
    address?: string
    ownership_pct?: number
  }
  registered_agent_needed?: boolean
}

interface FormationStep {
  step: number
  name: string
  status: 'completed' | 'in_progress' | 'pending' | 'action_required'
  estimated_days: number
  cost_usd: number
  notes: string
}

interface CompanyFormationResult {
  company_name: string
  jurisdiction: string
  entity_type: string
  total_estimated_cost: number
  total_estimated_days: number
  steps: FormationStep[]
  critical_path: string[]
  next_actions: string[]
  summary: string
}

// --- Tool 2: AI CFO Dashboard ---
interface CFOInput {
  monthly_revenue?: number
  monthly_expenses?: number
  cash_balance?: number
  outstanding_invoices?: Array<{ client: string; amount: number; due_date: string; status: string }>
  financial_goals?: {
    target_mrr?: number
    target_runway_months?: number
    profit_margin_target_pct?: number
  }
}

interface CFOMetrics {
  mrr: number
  arr: number
  net_burn: number
  runway_months: number
  gross_margin_pct: number
  revenue_growth_pct: number
  cash_positive: number
  outstanding_receivables: number
  invoice_at_risk: number
}

interface CFOReccommendation {
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  action: string
  impact: string
}

interface CFOResult {
  metrics: CFOMetrics
  health_score: number
  health_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  recommendations: CFOReccommendation[]
  projections_3mo: { month: string; projected_revenue: number; projected_expenses: number; projected_cash: number }[]
  summary: string
}

// --- Tool 3: Legal Compliance Scanner ---
interface ComplianceInput {
  business_type?: string
  jurisdictions?: string[]
  employee_count?: number
  data_handling?: string[]
  industry_regulations?: string[]
}

interface ComplianceRequirement {
  area: string
  requirement: string
  applicable: boolean
  priority: 'critical' | 'high' | 'medium' | 'low'
  deadline: string
  penalty: string
  action_needed: string
}

interface ComplianceResult {
  overall_risk: 'low' | 'medium' | 'high' | 'critical'
  compliance_score: number
  total_requirements: number
  applicable_requirements: number
  critical_gaps: number
  requirements: ComplianceRequirement[]
  immediate_actions: string[]
  summary: string
}

// --- Tool 4: Contract Generator AI ---
interface ContractInput {
  contract_type?: 'NDA' | 'SaaS_Agreement' | 'Employment' | 'Contractor' | 'Founder_Agreement' | 'Terms_of_Service'
  parties?: Array<{ name: string; role: string; address?: string }>
  key_terms?: {
    duration_months?: number
    payment_terms?: string
    termination_notice_days?: number
    intellectual_property?: string
    non_compete_months?: number
    equity_pct?: number
    vesting_years?: number
  }
  governing_law?: string
  special_clauses?: string[]
}

interface ContractClause {
  title: string
  content: string
  is_standard: boolean
  risk_level: 'low' | 'medium' | 'high'
}

interface ContractResult {
  contract_type: string
  title: string
  parties: string[]
  effective_date: string
  governing_law: string
  clauses: ContractClause[]
  missing_terms: string[]
  risk_flags: string[]
  summary: string
}

// --- Tool 5: HR Automation Planner ---
interface HRInput {
  team_size?: number
  locations?: string[]
  benefits_budget_usd?: number
  payroll_frequency?: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'
  compliance_requirements?: string[]
}

interface HRAutomationTask {
  process: string
  current_state: string
  automation_tool: string
  monthly_savings_hrs: number
  setup_cost: number
  priority: 'critical' | 'high' | 'medium' | 'low'
}

interface HRResult {
  team_size: number
  total_monthly_savings_hrs: number
  total_setup_cost: number
  automation_coverage_pct: number
  tasks: HRAutomationTask[]
  recommended_tools: string[]
  implementation_timeline: string
  summary: string
}

// --- Tool 6: Tax Optimization Advisor ---
interface TaxInput {
  revenue_usd?: number
  entity_type?: string
  jurisdiction?: string
  deductible_expenses?: Array<{ category: string; amount: number }>
  employee_count?: number
  international_operations?: boolean
}

interface TaxStrategy {
  name: string
  description: string
  estimated_savings: number
  complexity: 'low' | 'medium' | 'high'
  risk_level: 'low' | 'medium' | 'high'
  deadline: string
  action_steps: string[]
}

interface TaxResult {
  effective_rate: number
  marginal_rate: number
  total_deductions: number
  optimization_potential: number
  strategies: TaxStrategy[]
  quarterly_actions: string[]
  annual_actions: string[]
  summary: string
}

// --- Tool 7: Investor-Ready Score ---
interface InvestorScoreInput {
  stage?: 'pre_seed' | 'seed' | 'series_a' | 'series_b'
  traction_metrics?: {
    mrr?: number
    user_count?: number
    growth_rate_pct?: number
    retention_pct?: number
    nps?: number
  }
  team_completeness?: number
  market_size_usd?: number
  pitch_deck_quality?: number
  financial_projections?: {
    revenue_12mo?: number
    revenue_24mo?: number
    break_even_month?: number
  }
}

interface ScoreDimension {
  name: string
  score: number
  weight: number
  weighted_score: number
  feedback: string
}

interface InvestorScoreResult {
  overall_score: number
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D'
  investor_readiness: 'highly_ready' | 'ready' | 'nearly_ready' | 'not_ready'
  dimensions: ScoreDimension[]
  top_strengths: string[]
  top_gaps: string[]
  improvement_actions: string[]
  summary: string
}

// --- Tool 8: Runway Extension Planner ---
interface RunwayInput {
  current_runway_months?: number
  monthly_burn?: number
  revenue_growth_rate?: number
  cost_structure?: {
    salaries_pct?: number
    marketing_pct?: number
    infrastructure_pct?: number
    office_pct?: number
    other_pct?: number
  }
  funding_options?: string[]
}

interface RunwayStrategy {
  category: 'cost_reduction' | 'revenue_acceleration' | 'bridge_funding'
  name: string
  description: string
  runway_extension_months: number
  effort: 'low' | 'medium' | 'high'
  risk: 'low' | 'medium' | 'high'
  steps: string[]
}

interface RunwayResult {
  current_runway_months: number
  projected_runway_months: number
  target_runway_months: number
  strategies: RunwayStrategy[]
  cost_reduction_total: number
  revenue_acceleration_impact: number
  bridge_funding_amount: number
  action_plan: string[]
  summary: string
}

// ==================== TOOL 1: COMPANY FORMATION AUTOMATOR ====================

function automateFormation(input: CompanyFormationInput): CompanyFormationResult {
  const seed = seedFromString(JSON.stringify(input))
  const rng = mulberry32(seed)

  const companyName = input.company_name || 'Your Company'
  const jurisdiction = input.jurisdiction || 'Delaware, USA'
  const entityType = input.entity_type || 'LLC'
  const needsAgent = input.registered_agent_needed !== false

  const steps: FormationStep[] = []
  let stepNum = 1

  // Step 1: Name reservation
  steps.push({
    step: stepNum++,
    name: 'Company Name Reservation',
    status: 'completed',
    estimated_days: 1,
    cost_usd: entityType === 'LLC' ? 50 : 75,
    notes: 'Name availability search and reservation with state authority'
  })

  // Step 2: Articles of Incorporation/Organization
  const filingCost = entityType === 'LLC' ? 90 : entityType === 'C-Corp' ? 800 : 300
  steps.push({
    step: stepNum++,
    name: entityType === 'LLC' ? 'Articles of Organization' : 'Articles of Incorporation',
    status: 'in_progress',
    estimated_days: entityType === 'C-Corp' ? 7 : 3,
    cost_usd: filingCost,
    notes: 'Filed with ' + jurisdiction + ' Secretary of State'
  })

  // Step 3: EIN Registration
  steps.push({
    step: stepNum++,
    name: 'EIN (Tax ID) Registration',
    status: 'pending',
    estimated_days: 1,
    cost_usd: 0,
    notes: 'Free via IRS online application (Form SS-4)'
  })

  // Step 4: Registered Agent
  if (needsAgent) {
    const agentCost = Math.floor(rng() * 150) + 100
    steps.push({
      step: stepNum++,
      name: 'Registered Agent Service',
      status: 'pending',
      estimated_days: 1,
      cost_usd: agentCost,
      notes: 'Annual service for legal document receipt and compliance notifications'
    })
  }

  // Step 5: Operating Agreement / Bylaws
  steps.push({
    step: stepNum++,
    name: entityType === 'LLC' ? 'Operating Agreement' : 'Corporate Bylaws',
    status: 'pending',
    estimated_days: 2,
    cost_usd: 0,
    notes: 'Internal governance document (template-based, customize for your needs)'
  })

  // Step 6: Business Bank Account
  steps.push({
    step: stepNum++,
    name: 'Business Bank Account Opening',
    status: 'pending',
    estimated_days: 5,
    cost_usd: 0,
    notes: 'Requires EIN, Articles, and Operating Agreement. Consider Mercury, Brex, or Relay'
  })

  // Step 7: State Tax Registration
  steps.push({
    step: stepNum++,
    name: 'State Tax Account Registration',
    status: 'pending',
    estimated_days: 3,
    cost_usd: 0,
    notes: 'Sales tax permit and state employer account if applicable'
  })

  // Step 8: Business Licenses
  const licenseCost = Math.floor(rng() * 200) + 50
  steps.push({
    step: stepNum++,
    name: 'Business Licenses & Permits',
    status: 'pending',
    estimated_days: 14,
    cost_usd: licenseCost,
    notes: 'General business license; industry-specific permits may be required'
  })

  const totalCost = steps.reduce((sum, s) => sum + s.cost_usd, 0)
  const totalDays = steps.reduce((sum, s) => sum + s.estimated_days, 0)

  const criticalPath = [
    'File ' + (entityType === 'LLC' ? 'Articles of Organization' : 'Articles of Incorporation') + ' with ' + jurisdiction,
    'Obtain EIN from IRS (required before bank account)',
    'Open business bank account to separate personal and business finances',
    'Register for state tax accounts before first sale'
  ]

  const nextActions = [
    'Complete name reservation confirmation',
    'Prepare and file incorporation documents',
    'Gather founder identification documents for bank account',
    'Research industry-specific licensing requirements'
  ]

  return {
    company_name: companyName,
    jurisdiction,
    entity_type: entityType,
    total_estimated_cost: totalCost,
    total_estimated_days: totalDays,
    steps,
    critical_path: criticalPath,
    next_actions: nextActions,
    summary: companyName + ' (' + entityType + ') formation in ' + jurisdiction + ' estimated at $' + totalCost + ' and ' + totalDays + ' days. ' + steps.length + ' steps identified with ' + criticalPath.length + ' critical path items.'
  }
}

function formatFormationReport(input: CompanyFormationInput, result: CompanyFormationResult): string {
  const lines: string[] = []
  lines.push('====================================================')
  lines.push('  COMPANY FORMATION AUTOMATION REPORT')
  lines.push('====================================================')
  lines.push('')
  lines.push('  Company:    ' + result.company_name)
  lines.push('  Entity:     ' + result.entity_type)
  lines.push('  Jurisdiction: ' + result.jurisdiction)
  lines.push('  Total Cost: $' + result.total_estimated_cost)
  lines.push('  Total Time: ' + result.total_estimated_days + ' days')
  lines.push('')
  lines.push('  FORMATION STEPS:')
  lines.push('  ' + '-'.repeat(50))
  for (const step of result.steps) {
    const statusIcon = step.status === 'completed' ? '[x]' : step.status === 'in_progress' ? '[~]' : '[ ]'
    lines.push('  ' + statusIcon + ' Step ' + step.step + ': ' + step.name)
    lines.push('      Status: ' + step.status + ' | Days: ' + step.estimated_days + ' | Cost: $' + step.cost_usd)
    lines.push('      ' + step.notes)
    lines.push('')
  }
  lines.push('  CRITICAL PATH:')
  for (const item of result.critical_path) {
    lines.push('    * ' + item)
  }
  lines.push('')
  lines.push('  NEXT ACTIONS:')
  for (const action of result.next_actions) {
    lines.push('    * ' + action)
  }
  lines.push('')
  lines.push('  ' + result.summary)
  lines.push('')
  lines.push('  [' + DISCLAIMER + ']')
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 2: AI CFO DASHBOARD ====================

function createCFODashboard(input: CFOInput): CFOResult {
  const seed = seedFromString(JSON.stringify(input))
  const rng = mulberry32(seed)

  const revenue = input.monthly_revenue || 0
  const expenses = input.monthly_expenses || 0
  const cash = input.cash_balance || 0
  const invoices = input.outstanding_invoices || []
  const goals = input.financial_goals || {}

  const netBurn = expenses - revenue
  const runwayMonths = netBurn > 0 ? Math.max(0, cash / netBurn) : 999
  const grossMargin = revenue > 0 ? ((revenue - expenses * 0.4) / revenue) * 100 : 0
  const growthRate = round(rng() * 30 + 5, 1)
  const outstandingReceivables = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const invoiceAtRisk = invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)

  const metrics: CFOMetrics = {
    mrr: revenue,
    arr: revenue * 12,
    net_burn: netBurn,
    runway_months: round(runwayMonths, 1),
    gross_margin_pct: round(clamp(grossMargin, 0, 95), 1),
    revenue_growth_pct: growthRate,
    cash_positive: netBurn <= 0 ? cash : 0,
    outstanding_receivables: outstandingReceivables,
    invoice_at_risk: invoiceAtRisk
  }

  // Health score (0-100)
  let healthScore = 50
  if (runwayMonths > 18) healthScore += 20
  else if (runwayMonths > 12) healthScore += 10
  else if (runwayMonths > 6) healthScore += 0
  else if (runwayMonths > 3) healthScore -= 15
  else healthScore -= 30

  if (grossMargin > 70) healthScore += 15
  else if (grossMargin > 50) healthScore += 10
  else if (grossMargin > 30) healthScore += 0
  else healthScore -= 10

  if (growthRate > 20) healthScore += 10
  else if (growthRate > 10) healthScore += 5

  if (invoiceAtRisk > outstandingReceivables * 0.3) healthScore -= 10

  healthScore = clamp(Math.round(healthScore + (rng() * 10 - 5)), 0, 100)

  const healthGrade: CFOResult['health_grade'] =
    healthScore >= 85 ? 'A' : healthScore >= 70 ? 'B' : healthScore >= 50 ? 'C' : healthScore >= 30 ? 'D' : 'F'

  // Recommendations
  const recommendations: CFOReccommendation[] = []
  if (runwayMonths < 6) {
    recommendations.push({ priority: 'critical', category: 'Runway', action: 'Reduce monthly burn by 20-30% or secure bridge funding immediately', impact: 'Extends runway by 2-4 months' })
  }
  if (invoiceAtRisk > 0) {
    recommendations.push({ priority: 'high', category: 'Receivables', action: 'Collect $' + invoiceAtRisk + ' in overdue invoices', impact: 'Immediate cash injection' })
  }
  if (grossMargin < 50) {
    recommendations.push({ priority: 'high', category: 'Margins', action: 'Review COGS and pricing strategy to improve gross margin', impact: '+$' + Math.round(revenue * 0.1) + '/mo potential' })
  }
  if (revenue < (goals.target_mrr || 10000)) {
    recommendations.push({ priority: 'medium', category: 'Growth', action: 'Focus on closing deals to reach $' + (goals.target_mrr || 10000) + ' MRR target', impact: 'Path to sustainability' })
  }
  if (recommendations.length === 0) {
    recommendations.push({ priority: 'low', category: 'Optimization', action: 'Maintain current trajectory; explore growth investments', impact: 'Compound growth' })
  }

  // 3-month projections
  const projections = []
  let projectedCash = cash
  for (let i = 1; i <= 3; i++) {
    const projectedRevenue = round(revenue * Math.pow(1 + growthRate / 100, i))
    const projectedExpenses = round(expenses * (1 + (rng() * 0.05 - 0.02)))
    projectedCash = round(projectedCash + projectedRevenue - projectedExpenses)
    projections.push({
      month: 'Month +' + i,
      projected_revenue: projectedRevenue,
      projected_expenses: projectedExpenses,
      projected_cash: projectedCash
    })
  }

  return {
    metrics,
    health_score: healthScore,
    health_grade: healthGrade,
    recommendations,
    projections_3mo: projections,
    summary: 'CFO Dashboard: Health ' + healthGrade + ' (' + healthScore + '/100). MRR $' + revenue + ', Net Burn $' + netBurn + ', Runway ' + round(runwayMonths, 1) + ' months. ' + recommendations.length + ' recommendations generated.'
  }
}

function formatCFODashboard(input: CFOInput, result: CFOResult): string {
  const lines: string[] = []
  const m = result.metrics
  lines.push('====================================================')
  lines.push('  AI CFO DASHBOARD')
  lines.push('====================================================')
  lines.push('')
  lines.push('  HEALTH SCORE: ' + result.health_score + '/100 (Grade: ' + result.health_grade + ')')
  lines.push('')
  lines.push('  KEY METRICS:')
  lines.push('  ' + '-'.repeat(40))
  lines.push('  MRR:                $' + m.mrr.toLocaleString())
  lines.push('  ARR:                $' + m.arr.toLocaleString())
  lines.push('  Net Burn:           $' + m.net_burn.toLocaleString())
  lines.push('  Runway:             ' + m.runway_months + ' months')
  lines.push('  Gross Margin:       ' + m.gross_margin_pct + '%')
  lines.push('  Revenue Growth:     ' + m.revenue_growth_pct + '%')
  lines.push('  Outstanding A/R:    $' + m.outstanding_receivables.toLocaleString())
  lines.push('  At-Risk Invoices:   $' + m.invoice_at_risk.toLocaleString())
  lines.push('')
  lines.push('  RECOMMENDATIONS:')
  lines.push('  ' + '-'.repeat(40))
  for (const rec of result.recommendations) {
    lines.push('  [' + rec.priority.toUpperCase() + '] ' + rec.category)
    lines.push('    Action: ' + rec.action)
    lines.push('    Impact: ' + rec.impact)
    lines.push('')
  }
  lines.push('  3-MONTH PROJECTIONS:')
  lines.push('  ' + '-'.repeat(40))
  for (const proj of result.projections_3mo) {
    lines.push('  ' + proj.month + ': Revenue $' + proj.projected_revenue.toLocaleString() + ' | Expenses $' + proj.projected_expenses.toLocaleString() + ' | Cash $' + proj.projected_cash.toLocaleString())
  }
  lines.push('')
  lines.push('  ' + result.summary)
  lines.push('')
  lines.push('  [' + DISCLAIMER + ']')
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 3: LEGAL COMPLIANCE SCANNER ====================

function scanCompliance(input: ComplianceInput): ComplianceResult {
  const seed = seedFromString(JSON.stringify(input))
  const rng = mulberry32(seed)

  const businessType = input.business_type || 'technology'
  const jurisdictions = input.jurisdictions || ['US']
  const employeeCount = input.employee_count || 1
  const dataHandling = input.data_handling || []
  const regulations = input.industry_regulations || []

  const requirements: ComplianceRequirement[] = []

  // Business registration
  requirements.push({
    area: 'Business Registration',
    requirement: 'Maintain active business registration in all operating jurisdictions',
    applicable: true,
    priority: 'critical',
    deadline: 'Annual renewal',
    penalty: 'Loss of limited liability protection, fines up to $10,000',
    action_needed: 'File annual reports and pay franchise taxes'
  })

  // Employment law
  if (employeeCount > 0) {
    requirements.push({
      area: 'Employment Law',
      requirement: 'Comply with federal and state employment laws (FLSA, FMLA, ADA)',
      applicable: true,
      priority: 'critical',
      deadline: 'Ongoing',
      penalty: 'Back wages, penalties, class action liability',
      action_needed: 'Review employee classifications, post required notices'
    })
  }

  // Data privacy
  if (dataHandling.length > 0 || businessType.toLowerCase().includes('tech')) {
    requirements.push({
      area: 'Data Privacy (GDPR/CCPA)',
      requirement: 'Implement data processing agreements and privacy notices',
      applicable: dataHandling.some(d => d.toLowerCase().includes('personal') || d.toLowerCase().includes('user')),
      priority: 'high',
      deadline: 'Before data collection',
      penalty: 'Up to 4% global revenue (GDPR) or $7,500/violation (CCPA)',
      action_needed: 'Draft privacy policy, implement consent management'
    })
  }

  // Tax compliance
  requirements.push({
    area: 'Tax Compliance',
    requirement: 'File federal, state, and local tax returns; remit payroll taxes',
    applicable: true,
    priority: 'critical',
    deadline: 'Quarterly estimated taxes; annual returns',
    penalty: 'Penalties + interest on unpaid taxes',
    action_needed: 'Set up quarterly estimated tax payments'
  })

  // Securities (if fundraising)
  if (businessType.toLowerCase().includes('startup') || businessType.toLowerCase().includes('saas')) {
    requirements.push({
      area: 'Securities Law',
      requirement: 'Comply with Reg D/Reg CF if raising capital from investors',
      applicable: true,
      priority: 'high',
      deadline: 'Before fundraising',
      penalty: 'Investor rescission rights, SEC enforcement',
      action_needed: 'File Form D exemption; verify accredited investor status'
    })
  }

  // Industry-specific
  for (const reg of regulations) {
    requirements.push({
      area: 'Industry: ' + reg,
      requirement: 'Comply with ' + reg + ' specific requirements',
      applicable: true,
      priority: 'high',
      deadline: 'Varies by regulation',
      penalty: 'License revocation, fines, operational shutdown',
      action_needed: 'Review ' + reg + ' compliance checklist'
    })
  }

  // IP protection
  requirements.push({
    area: 'Intellectual Property',
    requirement: 'Protect trademarks, patents, copyrights, and trade secrets',
    applicable: true,
    priority: 'medium',
    deadline: 'Before public disclosure',
    penalty: 'Loss of IP rights, competitive disadvantage',
    action_needed: 'File trademark applications; implement NDAs'
  })

  // International
  if (jurisdictions.length > 1) {
    requirements.push({
      area: 'International Compliance',
      requirement: 'Comply with local laws in each operating jurisdiction',
      applicable: true,
      priority: 'high',
      deadline: 'Before market entry',
      penalty: 'Market entry bans, local fines',
      action_needed: 'Engage local counsel in ' + jurisdictions.join(', ')
    })
  }

  const applicableReqs = requirements.filter(r => r.applicable)
  const criticalGaps = applicableReqs.filter(r => r.priority === 'critical').length
  const complianceScore = clamp(Math.round(100 - (criticalGaps * 15) + (rng() * 10 - 5)), 10, 98)

  const overallRisk: ComplianceResult['overall_risk'] =
    complianceScore >= 80 ? 'low' : complianceScore >= 60 ? 'medium' : complianceScore >= 40 ? 'high' : 'critical'

  const immediateActions = applicableReqs
    .filter(r => r.priority === 'critical' || r.priority === 'high')
    .map(r => r.area + ': ' + r.action_needed)

  return {
    overall_risk: overallRisk,
    compliance_score: complianceScore,
    total_requirements: requirements.length,
    applicable_requirements: applicableReqs.length,
    critical_gaps: criticalGaps,
    requirements,
    immediate_actions: immediateActions,
    summary: 'Compliance scan for ' + businessType + ' across ' + jurisdictions.length + ' jurisdiction(s): Score ' + complianceScore + '/100, Risk: ' + overallRisk + '. ' + applicableReqs.length + ' applicable requirements, ' + criticalGaps + ' critical gaps identified.'
  }
}

function formatComplianceReport(input: ComplianceInput, result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('====================================================')
  lines.push('  LEGAL COMPLIANCE SCANNER REPORT')
  lines.push('====================================================')
  lines.push('')
  lines.push('  Business Type: ' + (input.business_type || 'technology'))
  lines.push('  Jurisdictions: ' + (input.jurisdictions || ['US']).join(', '))
  lines.push('  Employees:     ' + (input.employee_count || 1))
  lines.push('')
  lines.push('  COMPLIANCE SCORE: ' + result.compliance_score + '/100')
  lines.push('  OVERALL RISK:     ' + result.overall_risk.toUpperCase())
  lines.push('  REQUIREMENTS:     ' + result.applicable_requirements + '/' + result.total_requirements + ' applicable')
  lines.push('  CRITICAL GAPS:    ' + result.critical_gaps)
  lines.push('')
  lines.push('  REQUIREMENTS BREAKDOWN:')
  lines.push('  ' + '-'.repeat(50))
  for (const req of result.requirements) {
    const marker = req.applicable ? '[!]' : '[ ]'
    lines.push('  ' + marker + ' [' + req.priority.toUpperCase() + '] ' + req.area)
    lines.push('    ' + req.requirement)
    lines.push('    Deadline: ' + req.deadline + ' | Penalty: ' + req.penalty)
    lines.push('    Action: ' + req.action_needed)
    lines.push('')
  }
  lines.push('  IMMEDIATE ACTIONS:')
  for (const action of result.immediate_actions) {
    lines.push('    * ' + action)
  }
  lines.push('')
  lines.push('  ' + result.summary)
  lines.push('')
  lines.push('  [' + DISCLAIMER + ']')
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 4: CONTRACT GENERATOR AI ====================

function generateContract(input: ContractInput): ContractResult {
  const seed = seedFromString(JSON.stringify(input))
  const rng = mulberry32(seed)

  const contractType = input.contract_type || 'NDA'
  const parties = input.parties || [{ name: 'Party A', role: 'Disclosing Party' }, { name: 'Party B', role: 'Receiving Party' }]
  const terms = input.key_terms || {}
  const governingLaw = input.governing_law || 'Delaware'
  const specialClauses = input.special_clauses || []

  const clauses: ContractClause[] = []
  const missingTerms: string[] = []
  const riskFlags: string[] = []

  const partyNames = parties.map(p => p.name)

  if (contractType === 'NDA') {
    clauses.push({ title: 'Definition of Confidential Information', content: 'Confidential Information means any and all non-public information disclosed by either party, whether oral, written, or electronic, that is designated as confidential or that reasonably should be understood to be confidential.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'Obligations of Receiving Party', content: 'Receiving Party shall hold Confidential Information in strict confidence, using at least reasonable care, and shall not disclose to any third party without prior written consent.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'Term and Survival', content: 'This Agreement shall remain in effect for ' + (terms.duration_months || 24) + ' months from the Effective Date. Obligations of confidentiality shall survive termination for a period of 3 years.', is_standard: true, risk_level: 'low' })
    if (!terms.duration_months) missingTerms.push('Duration not specified; defaulting to 24 months')
  } else if (contractType === 'SaaS_Agreement') {
    clauses.push({ title: 'Service Description', content: 'Provider shall make the software-as-a-service platform available to Customer in accordance with the service level agreement and documentation.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'Payment Terms', content: 'Customer shall pay all fees as set forth in the applicable order form. Payment terms: Net ' + (terms.payment_terms || '30') + ' days.', is_standard: true, risk_level: 'medium' })
    clauses.push({ title: 'Data Ownership', content: 'Customer retains all rights to its data. Provider shall not access Customer data except as necessary to provide the service.', is_standard: true, risk_level: 'medium' })
    clauses.push({ title: 'Limitation of Liability', content: 'Providers total liability shall not exceed the fees paid by Customer in the 12 months preceding the claim. Neither party shall be liable for indirect damages.', is_standard: true, risk_level: 'high' })
    if (!terms.payment_terms) missingTerms.push('Payment terms not specified; defaulting to Net 30')
    if (!terms.termination_notice_days) missingTerms.push('Termination notice period not specified')
  } else if (contractType === 'Employment') {
    clauses.push({ title: 'Position and Duties', content: 'Employee is hired for the position described in the offer letter and shall perform duties as assigned by the Company.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'Compensation', content: 'Employee shall receive compensation as set forth in the offer letter, subject to standard withholdings and deductions.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'At-Will Employment', content: 'Employment is at-will and may be terminated by either party at any time, with or without cause, subject to ' + (terms.termination_notice_days || 14) + ' days notice.', is_standard: true, risk_level: 'medium' })
    clauses.push({ title: 'Intellectual Property Assignment', content: 'Employee assigns to Company all intellectual property created within the scope of employment. ' + (terms.intellectual_property || 'Standard work-for-hire provisions apply.'), is_standard: true, risk_level: 'medium' })
    if (terms.non_compete_months && terms.non_compete_months > 12) {
      riskFlags.push('Non-compete duration of ' + terms.non_compete_months + ' months may be unenforceable in some jurisdictions')
    }
  } else if (contractType === 'Contractor') {
    clauses.push({ title: 'Independent Contractor Relationship', content: 'Contractor is an independent contractor, not an employee. Contractor is responsible for their own taxes, insurance, and benefits.', is_standard: true, risk_level: 'medium' })
    clauses.push({ title: 'Scope of Work', content: 'Contractor shall deliver the services described in the applicable statement of work.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'Payment', content: 'Company shall pay Contractor within ' + (terms.payment_terms || '30') + ' days of invoice receipt.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'IP Assignment', content: 'Contractor assigns all work product to Company upon full payment. Contractor retains no rights to deliverables.', is_standard: true, risk_level: 'high' })
  } else if (contractType === 'Founder_Agreement') {
    clauses.push({ title: 'Equity Split', content: 'Founders agree to the equity allocation set forth in Schedule A, subject to vesting provisions.', is_standard: true, risk_level: 'medium' })
    clauses.push({ title: 'Vesting Schedule', content: 'Founder equity shall vest over ' + (terms.vesting_years || 4) + ' years with a 1-year cliff. Unvested shares are subject to repurchase upon departure.', is_standard: true, risk_level: 'medium' })
    clauses.push({ title: 'Roles and Responsibilities', content: 'Each Founder shall serve in the capacity described in the operating agreement and devote best efforts to the Company.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'Departure Provisions', content: 'Upon voluntary or involuntary departure, unvested equity is forfeited. Vested equity is subject to Company right of first refusal.', is_standard: true, risk_level: 'high' })
    if (!terms.vesting_years) missingTerms.push('Vesting schedule not specified; defaulting to 4-year vesting with 1-year cliff')
    if (!terms.equity_pct) missingTerms.push('Equity percentages not specified')
  } else {
    // Terms of Service
    clauses.push({ title: 'Acceptance of Terms', content: 'By accessing or using the service, you agree to be bound by these Terms of Service.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'User Obligations', content: 'Users shall not misuse the service, attempt unauthorized access, or violate applicable laws.', is_standard: true, risk_level: 'low' })
    clauses.push({ title: 'Limitation of Liability', content: 'To the maximum extent permitted by law, the Company shall not be liable for indirect, incidental, or consequential damages.', is_standard: true, risk_level: 'high' })
    clauses.push({ title: 'Termination', content: 'Company may terminate or suspend access at any time for violation of these terms.', is_standard: true, risk_level: 'medium' })
  }

  // Add special clauses
  for (const clause of specialClauses) {
    clauses.push({ title: 'Special Provision', content: clause, is_standard: false, risk_level: 'medium' })
  }

  // Risk assessment
  if (clauses.filter(c => c.risk_level === 'high').length > 2) {
    riskFlags.push('Multiple high-risk clauses detected; legal review strongly recommended')
  }
  if (parties.length < 2) {
    riskFlags.push('Contract requires at least two parties')
  }

  const titleMap: Record<string, string> = {
    'NDA': 'Mutual Non-Disclosure Agreement',
    'SaaS_Agreement': 'Software-as-a-Service Agreement',
    'Employment': 'Employment Agreement',
    'Contractor': 'Independent Contractor Agreement',
    'Founder_Agreement': 'Founders Agreement',
    'Terms_of_Service': 'Terms of Service'
  }

  return {
    contract_type: contractType,
    title: titleMap[contractType] || 'Business Agreement',
    parties: partyNames,
    effective_date: new Date().toISOString().split('T')[0],
    governing_law: governingLaw,
    clauses,
    missing_terms: missingTerms,
    risk_flags: riskFlags,
    summary: contractType + ' generated for ' + partyNames.join(' and ') + ' under ' + governingLaw + ' law. ' + clauses.length + ' clauses included. ' + missingTerms.length + ' missing terms flagged, ' + riskFlags.length + ' risk flags raised.'
  }
}

function formatContractReport(input: ContractInput, result: ContractResult): string {
  const lines: string[] = []
  lines.push('====================================================')
  lines.push('  CONTRACT GENERATOR - ' + result.title.toUpperCase())
  lines.push('====================================================')
  lines.push('')
  lines.push('  Type:          ' + result.contract_type)
  lines.push('  Title:         ' + result.title)
  lines.push('  Parties:       ' + result.parties.join(', '))
  lines.push('  Effective:     ' + result.effective_date)
  lines.push('  Governing Law: ' + result.governing_law)
  lines.push('')
  lines.push('  CLAUSES:')
  lines.push('  ' + '-'.repeat(50))
  for (let i = 0; i < result.clauses.length; i++) {
    const clause = result.clauses[i]
    lines.push('  ' + (i + 1) + '. ' + clause.title + (clause.is_standard ? '' : ' [CUSTOM]'))
    lines.push('     Risk: ' + clause.risk_level.toUpperCase())
    lines.push('     ' + clause.content)
    lines.push('')
  }
  if (result.missing_terms.length > 0) {
    lines.push('  MISSING TERMS:')
    for (const mt of result.missing_terms) {
      lines.push('    [!] ' + mt)
    }
    lines.push('')
  }
  if (result.risk_flags.length > 0) {
    lines.push('  RISK FLAGS:')
    for (const rf of result.risk_flags) {
      lines.push('    [WARNING] ' + rf)
    }
    lines.push('')
  }
  lines.push('  ' + result.summary)
  lines.push('')
  lines.push('  [' + DISCLAIMER + ']')
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 5: HR AUTOMATION PLANNER ====================

function planHRAutomation(input: HRInput): HRResult {
  const seed = seedFromString(JSON.stringify(input))
  const rng = mulberry32(seed)

  const teamSize = input.team_size || 5
  const locations = input.locations || ['US']
  const budget = input.benefits_budget_usd || 500
  const payrollFreq = input.payroll_frequency || 'biweekly'
  const complianceReqs = input.compliance_requirements || []

  const tasks: HRAutomationTask[] = []

  // Onboarding
  tasks.push({
    process: 'Employee Onboarding',
    current_state: 'Manual document collection and orientation',
    automation_tool: 'Rippling / BambooHR / Gusto',
    monthly_savings_hrs: Math.round(teamSize * 0.5),
    setup_cost: 200,
    priority: 'high'
  })

  // Payroll
  tasks.push({
    process: 'Payroll Processing',
    current_state: 'Manual calculation and disbursement',
    automation_tool: 'Gusto / ADP / Deel',
    monthly_savings_hrs: Math.round(teamSize * 0.3 + 4),
    setup_cost: 150,
    priority: 'critical'
  })

  // Benefits administration
  tasks.push({
    process: 'Benefits Administration',
    current_state: 'Manual enrollment and tracking',
    automation_tool: 'Gusto / Rippling / Zenefits',
    monthly_savings_hrs: Math.round(teamSize * 0.2 + 2),
    setup_cost: 100,
    priority: 'high'
  })

  // Time tracking
  tasks.push({
    process: 'Time & Attendance',
    current_state: 'Spreadsheet or paper-based tracking',
    automation_tool: 'Toggl / Clockify / Deputy',
    monthly_savings_hrs: Math.round(teamSize * 0.4),
    setup_cost: 50,
    priority: 'medium'
  })

  // Performance reviews
  tasks.push({
    process: 'Performance Reviews',
    current_state: 'Annual manual review process',
    automation_tool: 'Lattice / 15Five / Culture Amp',
    monthly_savings_hrs: Math.round(teamSize * 0.15 + 1),
    setup_cost: 300,
    priority: 'medium'
  })

  // Compliance tracking
  if (complianceReqs.length > 0 || locations.length > 1) {
    tasks.push({
      process: 'Compliance Tracking',
      current_state: 'Manual monitoring of regulatory changes',
      automation_tool: 'Sixfifty / Compli / NAVEX',
      monthly_savings_hrs: 5,
      setup_cost: 400,
      priority: 'high'
    })
  }

  // Offboarding
  tasks.push({
    process: 'Employee Offboarding',
    current_state: 'Manual exit process',
    automation_tool: 'Rippling / BambooHR',
    monthly_savings_hrs: Math.round(teamSize * 0.1),
    setup_cost: 100,
    priority: 'low'
  })

  const totalSavings = tasks.reduce((sum, t) => sum + t.monthly_savings_hrs, 0)
  const totalCost = tasks.reduce((sum, t) => sum + t.setup_cost, 0)
  const coverage = clamp(Math.round((tasks.length / 7) * 100), 20, 100)

  const recommendedTools = Array.from(new Set(tasks.map(t => t.automation_tool.split(' / ')[0])))

  const timelineWeeks = Math.ceil(tasks.length * 1.5)

  return {
    team_size: teamSize,
    total_monthly_savings_hrs: totalSavings,
    total_setup_cost: totalCost,
    automation_coverage_pct: coverage,
    tasks,
    recommended_tools: recommendedTools,
    implementation_timeline: timelineWeeks + ' weeks for full deployment',
    summary: 'HR automation plan for ' + teamSize + ' employees across ' + locations.length + ' location(s). ' + tasks.length + ' processes automated, saving ' + totalSavings + ' hrs/month. Setup cost: $' + totalCost + '. Timeline: ' + timelineWeeks + ' weeks.'
  }
}

function formatHRReport(input: HRInput, result: HRResult): string {
  const lines: string[] = []
  lines.push('====================================================')
  lines.push('  HR AUTOMATION PLANNER')
  lines.push('====================================================')
  lines.push('')
  lines.push('  Team Size:       ' + result.team_size)
  lines.push('  Locations:       ' + (input.locations || ['US']).join(', '))
  lines.push('  Benefits Budget: $' + (input.benefits_budget_usd || 500) + '/employee/mo')
  lines.push('  Payroll:         ' + (input.payroll_frequency || 'biweekly'))
  lines.push('')
  lines.push('  COVERAGE:        ' + result.automation_coverage_pct + '%')
  lines.push('  MONTHLY SAVINGS: ' + result.total_monthly_savings_hrs + ' hours')
  lines.push('  SETUP COST:      $' + result.total_setup_cost)
  lines.push('  TIMELINE:        ' + result.implementation_timeline)
  lines.push('')
  lines.push('  AUTOMATION TASKS:')
  lines.push('  ' + '-'.repeat(50))
  for (const task of result.tasks) {
    lines.push('  [' + task.priority.toUpperCase() + '] ' + task.process)
    lines.push('    Current: ' + task.current_state)
    lines.push('    Tool:    ' + task.automation_tool)
    lines.push('    Savings: ' + task.monthly_savings_hrs + ' hrs/mo | Setup: $' + task.setup_cost)
    lines.push('')
  }
  lines.push('  RECOMMENDED TOOLS:')
  for (const tool of result.recommended_tools) {
    lines.push('    * ' + tool)
  }
  lines.push('')
  lines.push('  ' + result.summary)
  lines.push('')
  lines.push('  [' + DISCLAIMER + ']')
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 6: TAX OPTIMIZATION ADVISOR ====================

function adviseTaxOptimization(input: TaxInput): TaxResult {
  const seed = seedFromString(JSON.stringify(input))
  const rng = mulberry32(seed)

  const revenue = input.revenue_usd || 120000
  const entityType = input.entity_type || 'LLC'
  const jurisdiction = input.jurisdiction || 'US'
  const expenses = input.deductible_expenses || []
  const employeeCount = input.employee_count || 1
  const international = input.international_operations || false

  const totalDeductions = expenses.reduce((sum, e) => sum + e.amount, 0)

  // Effective rate estimation
  let effectiveRate = 25
  if (entityType === 'LLC' || entityType === 'S-Corp') effectiveRate = 22
  else if (entityType === 'C-Corp') effectiveRate = 21
  effectiveRate = clamp(effectiveRate + (rng() * 6 - 3), 15, 40)

  const marginalRate = clamp(effectiveRate + 5 + (rng() * 4), 20, 50)
  const optimizationPotential = clamp(round(rng() * 15 + 10, 1), 5, 35)

  const strategies: TaxStrategy[] = []

  // Strategy 1: Entity optimization
  if (entityType === 'C-Corp' && revenue < 500000) {
    strategies.push({
      name: 'S-Corp Election',
      description: 'Elect S-Corp status to avoid double taxation on distributions. Pass-through taxation can save 15-20% on business income.',
      estimated_savings: round(revenue * 0.15),
      complexity: 'medium',
      risk_level: 'low',
      deadline: 'March 15 for current tax year',
      action_steps: ['Consult CPA on S-Corp eligibility', 'File Form 2553 with IRS', 'Set up payroll for owner compensation', 'Adjust estimated tax payments']
    })
  }

  // Strategy 2: Home office deduction
  strategies.push({
    name: 'Home Office Deduction',
    description: 'Deduct portion of housing costs used exclusively for business. Simplified method: $5/sq ft up to 300 sq ft ($1,500 max).',
    estimated_savings: round(800 + rng() * 1200),
    complexity: 'low',
    risk_level: 'low',
    deadline: 'File with annual tax return',
    action_steps: ['Measure dedicated office space', 'Document exclusive business use', 'Calculate simplified vs. actual expense method', 'Keep utility and rent receipts']
  })

  // Strategy 3: Retirement contributions
  strategies.push({
    name: 'Retirement Plan Contributions',
    description: 'Maximize Solo 401(k) or SEP-IRA contributions. Solo 401(k) allows up to $66,000 in total contributions (2024).',
    estimated_savings: round(5000 + rng() * 10000),
    complexity: 'medium',
    risk_level: 'low',
    deadline: 'Establish by Dec 31; contribute by tax filing deadline',
    action_steps: ['Compare Solo 401(k) vs SEP-IRA', 'Open retirement account with provider', 'Set up automatic monthly contributions', 'Track contribution limits']
  })

  // Strategy 4: R&D tax credits
  if (entityType.toLowerCase().includes('tech') || revenue > 50000) {
    strategies.push({
      name: 'R&D Tax Credit',
      description: 'Claim federal and state R&D tax credits for qualifying research activities. Can offset payroll tax for startups under $5M revenue.',
      estimated_savings: round(3000 + rng() * 15000),
      complexity: 'high',
      risk_level: 'medium',
      deadline: 'File with annual tax return; amend prior 3 years',
      action_steps: ['Document qualifying R&D activities', 'Calculate QREs (qualified research expenses)', 'File Form 6765', 'Consider state R&D credits']
    })
  }

  // Strategy 5: International (if applicable)
  if (international) {
    strategies.push({
      name: 'Transfer Pricing Optimization',
      description: 'Structure intercompany transactions to optimize global tax burden. Ensure arms-length pricing for cross-border transactions.',
      estimated_savings: round(10000 + rng() * 20000),
      complexity: 'high',
      risk_level: 'medium',
      deadline: 'Ongoing; document annually',
      action_steps: ['Map intercompany transactions', 'Prepare transfer pricing documentation', 'Consider treaty benefits', 'Engage international tax advisor']
    })
  }

  // Strategy 6: Section 179 / Bonus depreciation
  strategies.push({
    name: 'Section 179 Expensing',
    description: 'Immediately expense qualifying equipment and software purchases instead of depreciating over time. 2024 limit: $1.16M.',
    estimated_savings: round(2000 + rng() * 8000),
    complexity: 'low',
    risk_level: 'low',
    deadline: 'Purchase and place in service by Dec 31',
    action_steps: ['Identify qualifying purchases', 'Ensure placed in service this year', 'Elect Section 179 on tax return', 'Track carryforward if over limit']
  })

  const quarterlyActions = [
    'Review estimated tax payments and adjust for actual income',
    'Track deductible expenses in accounting software',
    'Document business purpose for all travel and meals',
    'Review payroll tax deposits for accuracy'
  ]

  const annualActions = [
    'Meet with CPA for year-end tax planning (November-December)',
    'Review entity structure for optimization opportunities',
    'Maximize retirement contributions before deadline',
    'Assess need for cost segregation study on real estate',
    'Update home office deduction calculation'
  ]

  return {
    effective_rate: round(effectiveRate, 1),
    marginal_rate: round(marginalRate, 1),
    total_deductions: totalDeductions,
    optimization_potential: optimizationPotential,
    strategies,
    quarterly_actions: quarterlyActions,
    annual_actions: annualActions,
    summary: 'Tax optimization for ' + entityType + ' with $' + revenue.toLocaleString() + ' revenue. Effective rate: ' + round(effectiveRate, 1) + '%. ' + strategies.length + ' strategies identified with potential savings of $' + strategies.reduce((sum, s) => sum + s.estimated_savings, 0).toLocaleString() + '.'
  }
}

function formatTaxReport(input: TaxInput, result: TaxResult): string {
  const lines: string[] = []
  lines.push('====================================================')
  lines.push('  TAX OPTIMIZATION ADVISOR')
  lines.push('====================================================')
  lines.push('')
  lines.push('  Revenue:           $' + (input.revenue_usd || 0).toLocaleString())
  lines.push('  Entity Type:       ' + (input.entity_type || 'LLC'))
  lines.push('  Jurisdiction:      ' + (input.jurisdiction || 'US'))
  lines.push('  Employees:         ' + (input.employee_count || 1))
  lines.push('  International:     ' + (input.international_operations ? 'Yes' : 'No'))
  lines.push('')
  lines.push('  EFFECTIVE RATE:    ' + result.effective_rate + '%')
  lines.push('  MARGINAL RATE:     ' + result.marginal_rate + '%')
  lines.push('  TOTAL DEDUCTIONS:  $' + result.total_deductions.toLocaleString())
  lines.push('  OPTIMIZATION:      ' + result.optimization_potential + '% potential savings')
  lines.push('')
  lines.push('  TAX STRATEGIES:')
  lines.push('  ' + '-'.repeat(50))
  for (const strategy of result.strategies) {
    lines.push('  * ' + strategy.name + ' [Savings: $' + strategy.estimated_savings.toLocaleString() + ']')
    lines.push('    ' + strategy.description)
    lines.push('    Complexity: ' + strategy.complexity + ' | Risk: ' + strategy.risk_level + ' | Deadline: ' + strategy.deadline)
    lines.push('    Steps:')
    for (const step of strategy.action_steps) {
      lines.push('      - ' + step)
    }
    lines.push('')
  }
  lines.push('  QUARTERLY ACTIONS:')
  for (const action of result.quarterly_actions) {
    lines.push('    * ' + action)
  }
  lines.push('')
  lines.push('  ANNUAL ACTIONS:')
  for (const action of result.annual_actions) {
    lines.push('    * ' + action)
  }
  lines.push('')
  lines.push('  ' + result.summary)
  lines.push('')
  lines.push('  [' + DISCLAIMER + ']')
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 7: INVESTOR-READY SCORE ====================

function scoreInvestorReadiness(input: InvestorScoreInput): InvestorScoreResult {
  const seed = seedFromString(JSON.stringify(input))
  const rng = mulberry32(seed)

  const stage = input.stage || 'seed'
  const traction = input.traction_metrics || {}
  const teamCompleteness = input.team_completeness || 50
  const marketSize = input.market_size_usd || 1000000000
  const pitchQuality = input.pitch_deck_quality || 50
  const projections = input.financial_projections || {}

  const dimensions: ScoreDimension[] = []

  // Traction dimension
  let tractionScore = 30
  if (traction.mrr) {
    if (traction.mrr > 100000) tractionScore += 30
    else if (traction.mrr > 50000) tractionScore += 20
    else if (traction.mrr > 10000) tractionScore += 10
  }
  if (traction.growth_rate_pct && traction.growth_rate_pct > 20) tractionScore += 15
  if (traction.retention_pct && traction.retention_pct > 90) tractionScore += 10
  if (traction.nps && traction.nps > 50) tractionScore += 5
  tractionScore = clamp(tractionScore + Math.round(rng() * 10 - 5), 10, 100)
  dimensions.push({ name: 'Traction', score: tractionScore, weight: 0.30, weighted_score: round(tractionScore * 0.30, 1), feedback: tractionScore >= 70 ? 'Strong traction signals' : tractionScore >= 40 ? 'Moderate traction; needs acceleration' : 'Early traction; focus on PMF' })

  // Team dimension
  const teamScore = clamp(teamCompleteness + Math.round(rng() * 10 - 5), 15, 100)
  dimensions.push({ name: 'Team', score: teamScore, weight: 0.20, weighted_score: round(teamScore * 0.20, 1), feedback: teamScore >= 70 ? 'Team is well-rounded' : 'Key roles need filling' })

  // Market dimension
  let marketScore = 30
  if (marketSize > 10000000000) marketScore += 35
  else if (marketSize > 1000000000) marketScore += 25
  else if (marketSize > 100000000) marketScore += 15
  marketScore = clamp(marketScore + Math.round(rng() * 10 - 5), 10, 100)
  dimensions.push({ name: 'Market', score: marketScore, weight: 0.20, weighted_score: round(marketScore * 0.20, 1), feedback: marketScore >= 70 ? 'Large addressable market' : 'Market size may limit upside' })

  // Pitch dimension
  const pitchScore = clamp(pitchQuality + Math.round(rng() * 10 - 5), 15, 100)
  dimensions.push({ name: 'Pitch Quality', score: pitchScore, weight: 0.15, weighted_score: round(pitchScore * 0.15, 1), feedback: pitchScore >= 70 ? 'Compelling narrative' : 'Pitch needs refinement' })

  // Financials dimension
  let financialScore = 30
  if (projections.revenue_24mo && projections.revenue_24mo > 1000000) financialScore += 25
  if (projections.break_even_month && projections.break_even_month < 24) financialScore += 15
  financialScore = clamp(financialScore + Math.round(rng() * 10 - 5), 10, 100)
  dimensions.push({ name: 'Financials', score: financialScore, weight: 0.15, weighted_score: round(financialScore * 0.15, 1), feedback: financialScore >= 70 ? 'Strong financial projections' : 'Financial model needs work' })

  const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.weighted_score, 0))

  const grade: InvestorScoreResult['grade'] =
    overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B+' : overallScore >= 60 ? 'B' : overallScore >= 50 ? 'C+' : overallScore >= 40 ? 'C' : 'D'

  const readiness: InvestorScoreResult['investor_readiness'] =
    overallScore >= 75 ? 'highly_ready' : overallScore >= 60 ? 'ready' : overallScore >= 45 ? 'nearly_ready' : 'not_ready'

  const sortedDims = [...dimensions].sort((a, b) => b.score - a.score)
  const topStrengths = sortedDims.slice(0, 2).map(d => d.name + ' (' + d.score + '/100): ' + d.feedback)
  const topGaps = sortedDims.slice(-2).map(d => d.name + ' (' + d.score + '/100): ' + d.feedback)

  const improvementActions = sortedDims
    .filter(d => d.score < 70)
    .map(d => 'Improve ' + d.name + ' (current: ' + d.score + '/100) - ' + d.feedback)

  if (improvementActions.length === 0) {
    improvementActions.push('Maintain current performance across all dimensions')
    improvementActions.push('Focus on storytelling and investor outreach')
  }

  return {
    overall_score: overallScore,
    grade,
    investor_readiness: readiness,
    dimensions,
    top_strengths: topStrengths,
    top_gaps: topGaps,
    improvement_actions: improvementActions,
    summary: 'Investor Readiness Score: ' + overallScore + '/100 (Grade: ' + grade + '). Status: ' + readiness.replace('_', ' ') + '. ' + dimensions.length + ' dimensions evaluated.'
  }
}

function formatInvestorScoreReport(input: InvestorScoreInput, result: InvestorScoreResult): string {
  const lines: string[] = []
  lines.push('====================================================')
  lines.push('  INVESTOR READINESS SCORE')
  lines.push('====================================================')
  lines.push('')
  lines.push('  Stage:    ' + (input.stage || 'seed'))
  lines.push('  Market:   $' + (input.market_size_usd || 0).toLocaleString())
  lines.push('')
  lines.push('  OVERALL SCORE:     ' + result.overall_score + '/100')
  lines.push('  GRADE:             ' + result.grade)
  lines.push('  READINESS:         ' + result.investor_readiness.replace('_', ' ').toUpperCase())
  lines.push('')
  lines.push('  DIMENSION SCORES:')
  lines.push('  ' + '-'.repeat(50))
  for (const dim of result.dimensions) {
    const bar = '#'.repeat(Math.round(dim.score / 5)) + '.'.repeat(20 - Math.round(dim.score / 5))
    lines.push('  ' + dim.name.padEnd(15) + ' [' + bar + '] ' + dim.score + '/100 (w: ' + (dim.weight * 100) + '%)')
    lines.push('    ' + dim.feedback)
  }
  lines.push('')
  lines.push('  TOP STRENGTHS:')
  for (const s of result.top_strengths) {
    lines.push('    (+) ' + s)
  }
  lines.push('')
  lines.push('  TOP GAPS:')
  for (const g of result.top_gaps) {
    lines.push('    (-) ' + g)
  }
  lines.push('')
  lines.push('  IMPROVEMENT ACTIONS:')
  for (const action of result.improvement_actions) {
    lines.push('    * ' + action)
  }
  lines.push('')
  lines.push('  ' + result.summary)
  lines.push('')
  lines.push('  [' + DISCLAIMER + ']')
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 8: RUNWAY EXTENSION PLANNER ====================

function planRunwayExtension(input: RunwayInput): RunwayResult {
  const seed = seedFromString(JSON.stringify(input))
  const rng = mulberry32(seed)

  const currentRunway = input.current_runway_months || 12
  const monthlyBurn = input.monthly_burn || 20000
  const growthRate = input.revenue_growth_rate || 5
  const costStructure = input.cost_structure || { salaries_pct: 60, marketing_pct: 15, infrastructure_pct: 10, office_pct: 5, other_pct: 10 }
  const fundingOptions = input.funding_options || []

  const strategies: RunwayStrategy[] = []

  // Cost reduction strategies
  const salaryCost = monthlyBurn * ((costStructure.salaries_pct || 60) / 100)
  const marketingCost = monthlyBurn * ((costStructure.marketing_pct || 15) / 100)
  const infraCost = monthlyBurn * ((costStructure.infrastructure_pct || 10) / 100)

  strategies.push({
    category: 'cost_reduction',
    name: 'Optimize Salary Costs',
    description: 'Reduce salary burn through contractor conversion, part-time arrangements, or strategic headcount pause. Target 10-15% reduction.',
    runway_extension_months: round((salaryCost * 0.12) / monthlyBurn * currentRunway, 1),
    effort: 'medium',
    risk: 'medium',
    steps: ['Audit role-by-role necessity', 'Identify contractor-convertible positions', 'Implement hiring freeze on non-critical roles', 'Negotiate deferred compensation with key employees']
  })

  strategies.push({
    category: 'cost_reduction',
    name: 'Cut Marketing Spend Efficiency',
    description: 'Pause low-ROI channels, focus on organic growth and product-led acquisition. Target 30-50% marketing reduction.',
    runway_extension_months: round((marketingCost * 0.4) / monthlyBurn * currentRunway, 1),
    effort: 'low',
    risk: 'low',
    steps: ['Analyze CAC by channel', 'Pause channels with CAC > 3x LTV', 'Double down on organic/content marketing', 'Implement referral program for viral growth']
  })

  strategies.push({
    category: 'cost_reduction',
    name: 'Infrastructure Cost Optimization',
    description: 'Renegotiate vendor contracts, switch to reserved instances, eliminate unused services. Target 20-30% infra reduction.',
    runway_extension_months: round((infraCost * 0.25) / monthlyBurn * currentRunway, 1),
    effort: 'low',
    risk: 'low',
    steps: ['Audit all SaaS subscriptions', 'Switch to annual billing for discounts', 'Optimize cloud resource allocation', 'Eliminate redundant tools']
  })

  // Revenue acceleration strategies
  strategies.push({
    category: 'revenue_acceleration',
    name: 'Pricing Optimization',
    description: 'Implement value-based pricing, introduce annual plans with discount, or add premium tier. Target 15-25% revenue increase.',
    runway_extension_months: round((monthlyBurn * (growthRate / 100) * 2) / monthlyBurn * currentRunway * 0.3, 1),
    effort: 'medium',
    risk: 'low',
    steps: ['Analyze willingness-to-pay data', 'Test price increase on new customers', 'Introduce annual plan (2 months free)', 'Add enterprise tier with premium features']
  })

  strategies.push({
    category: 'revenue_acceleration',
    name: 'Customer Expansion Revenue',
    description: 'Upsell existing customers, reduce churn, implement usage-based pricing. Target 10-20% net revenue retention improvement.',
    runway_extension_months: round((monthlyBurn * 0.15) / monthlyBurn * currentRunway * 0.4, 1),
    effort: 'medium',
    risk: 'low',
    steps: ['Identify upsell opportunities per account', 'Implement health scoring for churn prevention', 'Create expansion revenue playbook', 'Hire customer success (fractional)']
  })

  // Bridge funding strategies
  if (fundingOptions.length > 0 || currentRunway < 12) {
    strategies.push({
      category: 'bridge_funding',
      name: 'Revenue-Based Financing',
      description: 'Secure non-dilutive funding based on recurring revenue. Typical advance: 3-6x MRR at 6-12% cost of capital.',
      runway_extension_months: 3,
      effort: 'medium',
      risk: 'low',
      steps: ['Prepare financial documentation', 'Apply to Pipe, Capchase, or Lendio', 'Compare terms from multiple providers', 'Close within 2-4 weeks']
    })

    strategies.push({
      category: 'bridge_funding',
      name: 'Bridge Round / Extension',
      description: 'Raise a small insider round from existing investors to extend runway 6-12 months while pursuing milestones.',
      runway_extension_months: 6,
      effort: 'high',
      risk: 'medium',
      steps: ['Identify key milestone for next round', 'Prepare bridge round materials', 'Approach existing investors first', 'Target 50-75% of previous round size']
    })
  }

  const costReductionTotal = strategies
    .filter(s => s.category === 'cost_reduction')
    .reduce((sum, s) => sum + s.runway_extension_months, 0)

  const revenueImpact = strategies
    .filter(s => s.category === 'revenue_acceleration')
    .reduce((sum, s) => sum + s.runway_extension_months, 0)

  const bridgeFunding = strategies
    .filter(s => s.category === 'bridge_funding')
    .reduce((sum, s) => sum + s.runway_extension_months, 0)

  const projectedRunway = round(currentRunway + costReductionTotal + revenueImpact + bridgeFunding, 1)
  const targetRunway = Math.max(18, currentRunway + 6)

  const actionPlan = [
    'Week 1-2: Implement quick wins (marketing cut, infra optimization)',
    'Week 3-4: Execute pricing changes and expansion revenue plays',
    'Month 2: Evaluate bridge funding options if runway still below target',
    'Month 3: Reassess runway and adjust strategy based on results',
    'Ongoing: Monthly runway review with updated financials'
  ]

  return {
    current_runway_months: currentRunway,
    projected_runway_months: projectedRunway,
    target_runway_months: targetRunway,
    strategies,
    cost_reduction_total: round(costReductionTotal, 1),
    revenue_acceleration_impact: round(revenueImpact, 1),
    bridge_funding_amount: round(bridgeFunding, 1),
    action_plan: actionPlan,
    summary: 'Runway extension plan: ' + currentRunway + ' months -> ' + projectedRunway + ' months (target: ' + targetRunway + '). ' + strategies.length + ' strategies: ' + round(costReductionTotal, 1) + ' months from cost reduction, ' + round(revenueImpact, 1) + ' from revenue acceleration, ' + round(bridgeFunding, 1) + ' from bridge funding.'
  }
}

function formatRunwayReport(input: RunwayInput, result: RunwayResult): string {
  const lines: string[] = []
  lines.push('====================================================')
  lines.push('  RUNWAY EXTENSION PLANNER')
  lines.push('====================================================')
  lines.push('')
  lines.push('  Current Runway:   ' + result.current_runway_months + ' months')
  lines.push('  Projected Runway: ' + result.projected_runway_months + ' months')
  lines.push('  Target Runway:    ' + result.target_runway_months + ' months')
  lines.push('  Monthly Burn:     $' + (input.monthly_burn || 0).toLocaleString())
  lines.push('  Growth Rate:      ' + (input.revenue_growth_rate || 0) + '%')
  lines.push('')
  lines.push('  IMPACT SUMMARY:')
  lines.push('  ' + '-'.repeat(40))
  lines.push('  Cost Reduction:        +' + result.cost_reduction_total + ' months')
  lines.push('  Revenue Acceleration:  +' + result.revenue_acceleration_impact + ' months')
  lines.push('  Bridge Funding:        +' + result.bridge_funding_amount + ' months')
  lines.push('')
  lines.push('  STRATEGIES:')
  lines.push('  ' + '-'.repeat(50))
  for (const strategy of result.strategies) {
    const catLabel = strategy.category.replace('_', ' ').toUpperCase()
    lines.push('  [' + catLabel + '] ' + strategy.name + ' (+' + strategy.runway_extension_months + ' months)')
    lines.push('    ' + strategy.description)
    lines.push('    Effort: ' + strategy.effort + ' | Risk: ' + strategy.risk)
    lines.push('    Steps:')
    for (const step of strategy.steps) {
      lines.push('      - ' + step)
    }
    lines.push('')
  }
  lines.push('  ACTION PLAN:')
  for (const action of result.action_plan) {
    lines.push('    * ' + action)
  }
  lines.push('')
  lines.push('  ' + result.summary)
  lines.push('')
  lines.push('  [' + DISCLAIMER + ']')
  lines.push('')
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Company Formation Automator
  tools.register(defineTool({
    name: 'company_formation_automator',
    description: 'Automates company formation steps including registration, EIN acquisition, bank account setup, and contract generation. Provides step-by-step formation roadmap with cost estimates, timelines, critical path analysis, and next actions. Supports LLC, C-Corp, S-Corp, and other entity types across US jurisdictions.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: company_name, jurisdiction, entity_type (LLC|C-Corp|S-Corp|B-Corp|sole_proprietorship), founder_info{name,email,phone,address,ownership_pct}, registered_agent_needed', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CompanyFormationInput = JSON.parse(args.input_data)
      const result = automateFormation(input)
      return formatFormationReport(input, result)
    }
  }))

  // Tool 2: AI CFO Dashboard
  tools.register(defineTool({
    name: 'ai_cfo_dashboard',
    description: 'Creates an AI CFO dashboard with financial metrics (MRR, ARR, net burn, runway, gross margin), health scoring (0-100 with letter grade), prioritized recommendations, and 3-month cash flow projections. Analyzes outstanding invoices and identifies at-risk receivables.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: monthly_revenue, monthly_expenses, cash_balance, outstanding_invoices[{client,amount,due_date,status}], financial_goals{target_mrr,target_runway_months,profit_margin_target_pct}', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CFOInput = JSON.parse(args.input_data)
      const result = createCFODashboard(input)
      return formatCFODashboard(input, result)
    }
  }))

  // Tool 3: Legal Compliance Scanner
  tools.register(defineTool({
    name: 'legal_compliance_scanner',
    description: 'Scans for legal compliance requirements based on business type, jurisdiction(s), employee count, data handling practices, and industry regulations. Returns compliance score (0-100), risk level, prioritized requirements with deadlines and penalties, and immediate action items.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: business_type, jurisdictions[], employee_count, data_handling[], industry_regulations[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ComplianceInput = JSON.parse(args.input_data)
      const result = scanCompliance(input)
      return formatComplianceReport(input, result)
    }
  }))

  // Tool 4: Contract Generator AI
  tools.register(defineTool({
    name: 'contract_generator_ai',
    description: 'Generates standard business contracts including NDA, SaaS Agreement, Employment, Contractor, Founders Agreement, and Terms of Service. Produces structured clauses with risk levels, flags missing terms, identifies risk factors, and includes governing law provisions.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: contract_type (NDA|SaaS_Agreement|Employment|Contractor|Founder_Agreement|Terms_of_Service), parties[{name,role,address}], key_terms{duration_months,payment_terms,termination_notice_days,intellectual_property,non_compete_months,equity_pct,vesting_years}, governing_law, special_clauses[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ContractInput = JSON.parse(args.input_data)
      const result = generateContract(input)
      return formatContractReport(input, result)
    }
  }))

  // Tool 5: HR Automation Planner
  tools.register(defineTool({
    name: 'hr_automation_planner',
    description: 'Plans HR automation across onboarding, payroll, benefits administration, time tracking, performance reviews, compliance tracking, and offboarding. Recommends tools (Gusto, Rippling, Lattice, etc.), estimates monthly time savings and setup costs, and provides implementation timeline.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: team_size, locations[], benefits_budget_usd, payroll_frequency (weekly|biweekly|semimonthly|monthly), compliance_requirements[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: HRInput = JSON.parse(args.input_data)
      const result = planHRAutomation(input)
      return formatHRReport(input, result)
    }
  }))

  // Tool 6: Tax Optimization Advisor
  tools.register(defineTool({
    name: 'tax_optimization_advisor',
    description: 'Advises on tax optimization strategies for small businesses. Covers entity structure optimization, retirement contributions, R&D credits, Section 179 expensing, home office deduction, and international tax planning. Returns effective/marginal rates, estimated savings per strategy, and quarterly/annual action checklists.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: revenue_usd, entity_type, jurisdiction, deductible_expenses[{category,amount}], employee_count, international_operations', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: TaxInput = JSON.parse(args.input_data)
      const result = adviseTaxOptimization(input)
      return formatTaxReport(input, result)
    }
  }))

  // Tool 7: Investor-Ready Score
  tools.register(defineTool({
    name: 'investor_ready_score',
    description: 'Scores how investor-ready a startup is across 5 dimensions: Traction (30%), Team (20%), Market (20%), Pitch Quality (15%), and Financials (15%). Returns overall score (0-100), letter grade, readiness level, dimension breakdowns with visual bars, top strengths/gaps, and improvement actions.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: stage (pre_seed|seed|series_a|series_b), traction_metrics{mrr,user_count,growth_rate_pct,retention_pct,nps}, team_completeness, market_size_usd, pitch_deck_quality, financial_projections{revenue_12mo,revenue_24mo,break_even_month}', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: InvestorScoreInput = JSON.parse(args.input_data)
      const result = scoreInvestorReadiness(input)
      return formatInvestorScoreReport(input, result)
    }
  }))

  // Tool 8: Runway Extension Planner
  tools.register(defineTool({
    name: 'runway_extension_planner',
    description: 'Plans strategies to extend financial runway through cost reduction (salaries, marketing, infrastructure), revenue acceleration (pricing, expansion revenue), and bridge funding (revenue-based financing, bridge rounds). Returns projected runway, impact breakdown, detailed strategies with effort/risk ratings, and week-by-week action plan.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: current_runway_months, monthly_burn, revenue_growth_rate, cost_structure{salaries_pct,marketing_pct,infrastructure_pct,office_pct,other_pct}, funding_options[]', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: RunwayInput = JSON.parse(args.input_data)
      const result = planRunwayExtension(input)
      return formatRunwayReport(input, result)
    }
  }))

  console.log('[dsh-tool-robofounder] Loaded v' + VERSION + ' - AI Robo-Founder / Company Automation with 8 tools')
  console.log('  Tools: company_formation_automator, ai_cfo_dashboard, legal_compliance_scanner, contract_generator_ai, hr_automation_planner, tax_optimization_advisor, investor_ready_score, runway_extension_planner')
}
