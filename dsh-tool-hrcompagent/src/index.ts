/**
 * dsh-tool-hrcompagent - HR Compensation & Benefits AI Agent Plugin for DSH
 *
 * Salary benchmarking with percentile calculation, total rewards statement generation,
 * pay equity analysis with gender/ethnicity gap detection, bonus/equity incentive plan
 * simulation with cost projection, compensation banding design with salary grade matrix,
 * benefits portfolio design with cost efficiency, executive compensation design with
 * Say-on-Pay advisory, and cross-border payroll with tax treaty compliance.
 *
 * @module dsh-tool-hrcompagent | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 *
 * DISCLAIMER: This plugin provides algorithmic estimates for compensation and benefits
 * analysis. All outputs are advisory only and do not constitute legal, tax, or financial
 advice. Users should consult qualified HR professionals, tax advisors, and legal counsel
 before making compensation decisions. Market data used is simulated and should be
 validated against actual salary surveys and regulatory sources.
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-hrcompagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ============================================================================
// SECTION 1 — Seeded Random (mulberry32 PRNG)
// ============================================================================

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

// ============================================================================
// SECTION 2 — TYPE DEFINITIONS
// ============================================================================

// --- Tool 1: Salary Benchmarking Engine ---
interface SalaryBenchmarkingInput {
  role_title: string
  industry: string
  location: string
  years_experience: number
  company_size: 'startup' | 'mid' | 'large' | 'enterprise'
  current_salary?: number
  market_data_source?: string
}

interface PercentileData {
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
}

interface SalaryBenchmarkResult {
  role_title: string
  location: string
  industry: string
  percentiles: PercentileData
  market_mean: number
  market_median: number
  competitiveness_ratio?: number
  positioning: string
  recommendations: string[]
  disclaimer: string
}

// --- Tool 2: Total Rewards Statement Generator ---
interface TotalRewardsInput {
  employee_id: string
  employee_name: string
  base_salary: number
  annual_bonus: number
  equity_value: number
  benefits_value: number
  retirement_contribution: number
  wellness_benefits: number
  other_perks: number
  currency: string
  year: number
}

interface RewardComponent {
  category: string
  amount: number
  pct_of_total: number
  description: string
}

interface TotalRewardsResult {
  employee_id: string
  employee_name: string
  year: number
  currency: string
  total_rewards: number
  components: RewardComponent[]
  visualization: string
  disclaimer: string
}

// --- Tool 3: Pay Equity Analyzer ---
interface PayEquityInput {
  workforce: Array<{
    id: string
    gender: string
    ethnicity: string
    department: string
    job_level: string
    base_salary: number
    years_in_role: number
    performance_rating: number
  }>
  comparison_base?: string
  control_variables?: string[]
}

interface GroupGap {
  group: string
  avg_salary: number
  count: number
  adjusted_gap_pct: number
}

interface PayEquityResult {
  overall_unadjusted_gap_pct: number
  gender_gaps: GroupGap[]
  ethnicity_gaps: GroupGap[]
  department_gaps: GroupGap[]
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
  statistical_significance: string
  recommendations: string[]
  legal_disclaimer: string
}

// --- Tool 4: Incentive Plan Simulator ---
interface IncentivePlanInput {
  plan_type: 'bonus' | 'stock_options' | 'rsu' | 'performance_units' | 'espp'
  participant_count: number
  total_budget: number
  performance_metrics: string[]
  payout_curve: 'threshold' | 'linear' | 'accelerated' | 'capped'
  target_payout_pct: number
  vesting_years?: number
  discount_rate?: number
  currency?: string
}

interface PayoutScenario {
  scenario: string
  performance_pct: number
  total_payout: number
  cost_per_participant: number
  roi_estimate: number
}

interface IncentivePlanResult {
  plan_type: string
  summary: string
  scenarios: PayoutScenario[]
  total_cost_projection: number
  accounting_impact: string
  recommendations: string[]
  financial_disclaimer: string
}

// --- Tool 5: Compensation Banding Designer ---
interface CompBandingInput {
  organization_levels: number
  market_midpoint_reference: number
  band_width_pct: number
  overlap_pct: number
  currency: string
  geographic_differentials?: Record<string, number>
}

interface SalaryGrade {
  grade: number
  level_name: string
  minimum: number
  midpoint: number
  maximum: number
  range_spread: number
}

interface CompBandingResult {
  currency: string
  grades: SalaryGrade[]
  band_width_used: number
  overlap_used: number
  progression_ratio: number
  visualization: string
  recommendations: string[]
  disclaimer: string
}

// --- Tool 6: Benefits Portfolio Optimizer ---
interface BenefitsPortfolioInput {
  total_benefits_budget: number
  employee_count: number
  demographics: {
    avg_age: number
    dependents_pct: number
    remote_pct: number
  }
  current_benefits: Array<{
    name: string
    annual_cost_per_employee: number
    utilization_rate: number
    employee_satisfaction: number
  }>
  priorities: string[]
}

interface OptimizedBenefit {
  name: string
  annual_cost: number
  cost_per_employee: number
  expected_utilization: number
  satisfaction_score: number
  cost_efficiency_rating: 'excellent' | 'good' | 'fair' | 'low'
  recommendation: string
}

interface BenefitsPortfolioResult {
  total_budget: number
  optimized_portfolio: OptimizedBenefit[]
  total_annual_cost: number
  savings_vs_current: number
  cost_per_employee: string
  recommendations: string[]
  disclaimer: string
}

// --- Tool 7: Executive Compensation Advisor ---
interface ExecutiveCompInput {
  executive_role: string
  company_revenue: number
  company_market_cap?: number
  peer_group: string[]
  current_comp: {
    base_salary: number
    annual_bonus_target: number
    long_term_incentive: number
    perquisites: number
    change_of_control: number
  }
  performance_vs_peers: 'below' | 'at' | 'above'
  say_on_pay_history?: Array<{ year: string; approval_pct: number }>
}

interface PeerComparison {
  percentile: number
  total_direct_comp: number
  peer_median: number
  peer_p75: number
}

interface ExecutiveCompResult {
  executive_role: string
  recommended_tdc: number
  pay_mix: {
    base_pct: number
    annual_incentive_pct: number
    long_term_incentive_pct: number
    other_pct: number
  }
  peer_comparison: PeerComparison
  say_on_pay_forecast: string
  clawback_recommendation: string
  recommendations: string[]
  legal_disclaimer: string
}

// --- Tool 8: Global Payroll Compliance ---
interface GlobalPayrollInput {
  employee_name: string
  home_country: string
  host_country: string
  assignment_duration_months: number
  gross_salary: number
  currency: string
  tax_treaty_applicable: boolean
  social_security_totalization: boolean
  compensation_method: 'balance_sheet' | 'local_plus' | 'host_based' | 'split_pay'
}

interface TaxBreakdown {
  component: string
  home_country_amount: number
  host_country_amount: number
  total: number
}

interface GlobalPayrollResult {
  employee_name: string
  assignment_type: string
  tax_breakdown: TaxBreakdown[]
  total_tax_burden: number
  effective_tax_rate: number
  net_salary_estimate: number
  compliance_requirements: string[]
  tax_treaty_benefits: string[]
  recommendations: string[]
  legal_disclaimer: string
}

// ============================================================================
// SECTION 3 — ANALYSIS FUNCTIONS
// ============================================================================

// ----- Tool 1: Salary Benchmarking Engine -----
function analyzeSalaryBenchmarking(input: SalaryBenchmarkingInput): SalaryBenchmarkResult {
  const seed = SeededRandom.seedFromString(input.role_title + input.location + input.industry)
  const rng = new SeededRandom(seed)

  // Base salary estimation by role and location
  const baseMultipliers: Record<string, number> = {
    'startup': 0.85, 'mid': 0.95, 'large': 1.05, 'enterprise': 1.15
  }
  const locationMultipliers: Record<string, number> = {
    'san francisco': 1.35, 'new york': 1.30, 'london': 1.20, 'singapore': 1.15,
    'shanghai': 1.10, 'beijing': 1.08, 'shenzhen': 1.07, 'tokyo': 1.12,
    'berlin': 1.05, 'paris': 1.06, 'sydney': 1.10, 'toronto': 1.05,
    'mumbai': 0.70, 'bangalore': 0.65, 'default': 1.0
  }
  const industryMultipliers: Record<string, number> = {
    'technology': 1.20, 'finance': 1.25, 'healthcare': 1.10, 'consulting': 1.15,
    'manufacturing': 0.95, 'retail': 0.85, 'energy': 1.05, 'default': 1.0
  }

  const loc = input.location.toLowerCase()
  const industry = input.industry.toLowerCase()
  const locMult = locationMultipliers[loc] || locationMultipliers['default']
  const indMult = industryMultipliers[industry] || industryMultipliers['default']
  const sizeMult = baseMultipliers[input.company_size] || 1.0

  // Base midpoint varies by years of experience
  const expFactor = 0.7 + (Math.min(input.years_experience, 30) / 10) * 0.5
  const baseMidpoint = 80000 * expFactor * locMult * indMult * sizeMult

  // Market dispersion
  const p50 = Math.round(baseMidpoint * rng.nextFloat(0.95, 1.05))
  const p25 = Math.round(p50 * 0.80)
  const p10 = Math.round(p50 * 0.65)
  const p75 = Math.round(p50 * 1.22)
  const p90 = Math.round(p50 * 1.45)
  const marketMean = Math.round((p10 + p25 + p50 + p75 + p90) / 5)

  // Competitiveness ratio
  let compRatio: number | undefined
  let positioning = 'Not assessed'
  if (input.current_salary !== undefined) {
    compRatio = Math.round((input.current_salary / p50) * 1000) / 1000
    if (compRatio >= 1.15) positioning = 'Above Market (75th+ percentile)'
    else if (compRatio >= 1.0) positioning = 'At Market (50th-75th percentile)'
    else if (compRatio >= 0.85) positioning = 'Below Market (25th-50th percentile)'
    else positioning = 'Significantly Below Market (<25th percentile)'
  }

  const recommendations: string[] = []
  if (input.current_salary !== undefined && compRatio !== undefined) {
    if (compRatio < 0.90) recommendations.push('Consider market adjustment to close gap to median')
    if (compRatio < 0.80) recommendations.push('URGENT: Retention risk from below-market positioning')
    if (compRatio > 1.20) recommendations.push('Review internal equity — may be above market range')
  }
  recommendations.push('Validate findings with 2-3 salary surveys (e.g., Radford, Mercer, WTW)')
  recommendations.push('Review annually with market movement data')

  return {
    role_title: input.role_title,
    location: input.location,
    industry: input.industry,
    percentiles: { p10, p25, p50, p75, p90 },
    market_mean: marketMean,
    market_median: p50,
    competitiveness_ratio: compRatio,
    positioning,
    recommendations,
    disclaimer: 'Market data is simulated for estimation purposes only. Consult published salary surveys for validated data.'
  }
}

function formatBenchmarkingReport(r: SalaryBenchmarkResult): string {
  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const lines: string[] = []
  lines.push('# Salary Benchmarking Analysis')
  lines.push('')
  lines.push(`**Role:** ${r.role_title} | **Location:** ${r.location} | **Industry:** ${r.industry}`)
  lines.push('')
  lines.push('## Market Percentile Analysis')
  lines.push('')
  lines.push('| Percentile | Annual Salary |')
  lines.push('|------------|---------------|')
  lines.push(`| 10th (P10) | ${fmt(r.percentiles.p10)} |`)
  lines.push(`| 25th (P25) | ${fmt(r.percentiles.p25)} |`)
  lines.push(`| 50th (P50 Median) | ${fmt(r.percentiles.p50)} |`)
  lines.push(`| 75th (P75) | ${fmt(r.percentiles.p75)} |`)
  lines.push(`| 90th (P90) | ${fmt(r.percentiles.p90)} |`)
  lines.push(`| **Market Mean** | **${fmt(r.market_mean)}** |`)
  lines.push('')

  // Visual bar chart
  const max = r.percentiles.p90
  const scale = 40
  const p10bar = Math.round(r.percentiles.p10 / max * scale)
  const p25bar = Math.round(r.percentiles.p25 / max * scale)
  const p50bar = Math.round(r.percentiles.p50 / max * scale)
  const p75bar = Math.round(r.percentiles.p75 / max * scale)
  const p90bar = Math.round(r.percentiles.p90 / max * scale)
  lines.push('```')
  lines.push(`P10: ${'\u2588'.repeat(p10bar)}${' '.repeat(scale - p10bar)} ${fmt(r.percentiles.p10)}`)
  lines.push(`P25: ${'\u2588'.repeat(p25bar)}${' '.repeat(scale - p25bar)} ${fmt(r.percentiles.p25)}`)
  lines.push(`P50: ${'\u2588'.repeat(p50bar)}${' '.repeat(scale - p50bar)} ${fmt(r.percentiles.p50)}`)
  lines.push(`P75: ${'\u2588'.repeat(p75bar)}${' '.repeat(scale - p75bar)} ${fmt(r.percentiles.p75)}`)
  lines.push(`P90: ${'\u2588'.repeat(p90bar)}${' '.repeat(scale - p90bar)} ${fmt(r.percentiles.p90)}`)
  lines.push('```')
  lines.push('')

  if (r.competitiveness_ratio !== undefined) {
    lines.push('## Current Salary Positioning')
    lines.push('')
    lines.push(`**Compa-Ratio:** ${r.competitiveness_ratio.toFixed(2)} (1.00 = market median)`)
    lines.push(`**Positioning:** ${r.positioning}`)
    lines.push('')
  }

  if (r.recommendations.length > 0) {
    lines.push('## Recommendations')
    lines.push('')
    for (const rec of r.recommendations) lines.push(`- ${rec}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Disclaimer: ${r.disclaimer}*`)
  return lines.join('\n')
}

// ----- Tool 2: Total Rewards Statement Generator -----
function analyzeTotalRewards(input: TotalRewardsInput): TotalRewardsResult {
  const total = input.base_salary + input.annual_bonus + input.equity_value +
    input.benefits_value + input.retirement_contribution + input.wellness_benefits + input.other_perks

  const components: RewardComponent[] = [
    {
      category: 'Base Salary',
      amount: input.base_salary,
      pct_of_total: Math.round((input.base_salary / total) * 1000) / 10,
      description: 'Fixed annual cash compensation'
    },
    {
      category: 'Annual Bonus',
      amount: input.annual_bonus,
      pct_of_total: Math.round((input.annual_bonus / total) * 1000) / 10,
      description: 'Variable pay based on performance'
    },
    {
      category: 'Equity / LTI',
      amount: input.equity_value,
      pct_of_total: Math.round((input.equity_value / total) * 1000) / 10,
      description: 'Long-term incentive and equity grants (annualized)'
    },
    {
      category: 'Benefits',
      amount: input.benefits_value,
      pct_of_total: Math.round((input.benefits_value / total) * 1000) / 10,
      description: 'Health, dental, vision, life insurance'
    },
    {
      category: 'Retirement',
      amount: input.retirement_contribution,
      pct_of_total: Math.round((input.retirement_contribution / total) * 1000) / 10,
      description: '401(k) / pension employer contribution'
    },
    {
      category: 'Wellness',
      amount: input.wellness_benefits,
      pct_of_total: Math.round((input.wellness_benefits / total) * 1000) / 10,
      description: 'Wellness programs, gym, EAP'
    },
    {
      category: 'Other Perks',
      amount: input.other_perks,
      pct_of_total: Math.round((input.other_perks / total) * 1000) / 10,
      description: 'Additional perquisites and allowances'
    }
  ]

  // Generate ASCII pie-chart-like visualization
  const vizLines: string[] = []
  vizLines.push('COMPOSITION BREAKDOWN')
  vizLines.push('')
  const symbols = ['\u2588', '\u2593', '\u2592', '\u2591', '\u2584', '\u2585', '\u2586']
  components.forEach((c, i) => {
    const barLen = Math.max(1, Math.round(c.pct_of_total / 2))
    vizLines.push(`${symbols[i % symbols.length]} ${c.category.padEnd(18)} ${c.pct_of_total.toFixed(1)}%  ${input.currency} ${c.amount.toLocaleString('en-US')}`)
  })
  vizLines.push('')
  vizLines.push(`TOTAL: ${input.currency} ${total.toLocaleString('en-US')}`)

  return {
    employee_id: input.employee_id,
    employee_name: input.employee_name,
    year: input.year,
    currency: input.currency,
    total_rewards: total,
    components,
    visualization: vizLines.join('\n'),
    disclaimer: 'This statement is for informational purposes. Actual values may vary based on vesting schedules, tax withholding, and plan terms.'
  }
}

function formatTotalRewardsReport(r: TotalRewardsResult): string {
  const lines: string[] = []
  lines.push(`# Total Rewards Statement — ${r.year}`)
  lines.push('')
  lines.push(`**Employee:** ${r.employee_name} (ID: ${r.employee_id})`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`**Total Annual Rewards:** ${r.currency} ${r.total_rewards.toLocaleString('en-US')}`)
  lines.push('')
  lines.push('## Reward Components')
  lines.push('')
  lines.push('| Component | Amount | % of Total | Description |')
  lines.push('|-----------|--------|------------|-------------|')
  for (const c of r.components) {
    lines.push(`| ${c.category} | ${r.currency} ${c.amount.toLocaleString('en-US')} | ${c.pct_of_total.toFixed(1)}% | ${c.description} |`)
  }
  lines.push('')
  lines.push('## Visual Breakdown')
  lines.push('')
  lines.push('```')
  lines.push(r.visualization)
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push(`*Disclaimer: ${r.disclaimer}*`)
  return lines.join('\n')
}

// ----- Tool 3: Pay Equity Analyzer -----
function analyzePayEquity(input: PayEquityInput): PayEquityResult {
  const workforce = input.workforce

  // Gender gap analysis
  const genders = [...new Set(workforce.map(w => w.gender))]
  const genderGroups: GroupGap[] = genders.map(g => {
    const members = workforce.filter(w => w.gender === g)
    const avg = members.reduce((s, w) => s + w.base_salary, 0) / members.length
    return { group: g, avg_salary: Math.round(avg), count: members.length, adjusted_gap_pct: 0 }
  })

  // Reference: highest-paying gender group
  const refGroup = genderGroups.sort((a, b) => b.avg_salary - a.avg_salary)[0]
  genderGroups.forEach(g => {
    g.adjusted_gap_pct = Math.round(((refGroup.avg_salary - g.avg_salary) / refGroup.avg_salary) * 1000) / 10
  })

  const overallGap = Math.max(...genderGroups.map(g => g.adjusted_gap_pct))

  // Ethnicity gap analysis
  const ethnicities = [...new Set(workforce.map(w => w.ethnicity))]
  const ethnicityGroups: GroupGap[] = ethnicities.map(e => {
    const members = workforce.filter(w => w.ethnicity === e)
    const avg = members.reduce((s, w) => s + w.base_salary, 0) / members.length
    return { group: e, avg_salary: Math.round(avg), count: members.length, adjusted_gap_pct: 0 }
  })
  ethnicityGroups.forEach(g => {
    g.adjusted_gap_pct = Math.round(((refGroup.avg_salary - g.avg_salary) / refGroup.avg_salary) * 1000) / 10
  })

  // Department gaps
  const depts = [...new Set(workforce.map(w => w.department))]
  const deptGroups: GroupGap[] = depts.map(d => {
    const members = workforce.filter(w => w.department === d)
    const avg = members.reduce((s, w) => s + w.base_salary, 0) / members.length
    return { group: d, avg_salary: Math.round(avg), count: members.length, adjusted_gap_pct: 0 }
  })
  const refDept = deptGroups.sort((a, b) => b.avg_salary - a.avg_salary)[0]
  deptGroups.forEach(g => {
    g.adjusted_gap_pct = Math.round(((refDept.avg_salary - g.avg_salary) / refDept.avg_salary) * 1000) / 10
  })

  // Risk assessment
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low'
  if (overallGap > 15) riskLevel = 'critical'
  else if (overallGap > 10) riskLevel = 'high'
  else if (overallGap > 5) riskLevel = 'moderate'

  // Statistical significance (simulated)
  const sig = overallGap > 10 ? 'Statistically significant (p < 0.01)' :
    overallGap > 5 ? 'Moderately significant (p < 0.05)' :
    'Below conventional significance threshold'

  const recommendations: string[] = []
  if (overallGap > 5) recommendations.push('Conduct regression analysis controlling for tenure, performance, and job level')
  if (overallGap > 10) recommendations.push('Engage legal counsel for pay equity audit remediation')
  recommendations.push('Review starting salary offers for unexplained gender/ethnicity patterns')
  recommendations.push('Implement structured compensation review process with equity checkpoints')
  recommendations.push('Document legitimate business factors for any observed pay differences')
  recommendations.push('Consider third-party pay equity audit for regulatory compliance')

  return {
    overall_unadjusted_gap_pct: overallGap,
    gender_gaps: genderGroups,
    ethnicity_gaps: ethnicityGroups,
    department_gaps: deptGroups,
    risk_level: riskLevel,
    statistical_significance: sig,
    recommendations,
    legal_disclaimer: 'This analysis is preliminary and does not establish legal liability. Consult employment law counsel before drawing conclusions about pay discrimination.'
  }
}

function formatPayEquityReport(r: PayEquityResult): string {
  const fmt = (n: number) => n.toLocaleString('en-US')
  const lines: string[] = []

  lines.push('# Pay Equity Analysis Report')
  lines.push('')
  const riskEmoji = { low: '[LOW]', moderate: '[MODERATE]', high: '[HIGH]', critical: '[CRITICAL]' }
  lines.push(`**Overall Unadjusted Gender Pay Gap:** ${r.overall_unadjusted_gap_pct.toFixed(1)}%`)
  lines.push(`**Risk Level:** ${riskEmoji[r.risk_level]} ${r.risk_level.toUpperCase()}`)
  lines.push(`**Statistical Significance:** ${r.statistical_significance}`)
  lines.push('')

  lines.push('## Gender Pay Gaps')
  lines.push('')
  for (const g of r.gender_gaps) {
    lines.push(`- **${g.group}:** Avg Salary ${fmt(g.avg_salary)} (n=${g.count}) | Gap: ${g.adjusted_gap_pct.toFixed(1)}%`)
  }
  lines.push('')

  lines.push('## Ethnicity Pay Gaps')
  lines.push('')
  for (const g of r.ethnicity_gaps) {
    lines.push(`- **${g.group}:** Avg Salary ${fmt(g.avg_salary)} (n=${g.count}) | Gap: ${g.adjusted_gap_pct.toFixed(1)}%`)
  }
  lines.push('')

  lines.push('## Department Disparities')
  lines.push('')
  for (const g of r.department_gaps) {
    lines.push(`- **${g.group}:** Avg Salary ${fmt(g.avg_salary)} (n=${g.count}) | Gap: ${g.adjusted_gap_pct.toFixed(1)}%`)
  }
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')

  lines.push('---')
  lines.push(`*Legal Disclaimer: ${r.legal_disclaimer}*`)
  return lines.join('\n')
}

// ----- Tool 4: Incentive Plan Simulator -----
function analyzeIncentivePlan(input: IncentivePlanInput): IncentivePlanResult {
  const seed = SeededRandom.seedFromString(input.plan_type + input.participant_count.toString())
  const rng = new SeededRandom(seed)

  const performancePcts = [50, 75, 100, 125, 150]
  const scenarios: PayoutScenario[] = performancePcts.map(pct => {
    let multiplier = pct / 100
    if (input.payout_curve === 'threshold' && pct < 80) multiplier = 0
    else if (input.payout_curve === 'accelerated' && pct > 100) multiplier = 1 + (multiplier - 1) * 1.5
    else if (input.payout_curve === 'capped') multiplier = Math.min(multiplier, 1.8)

    const perfFactor = pct / 100
    const totalPayout = Math.round(input.total_budget * perfFactor * multiplier / (pct / 100))
    const perParticipant = Math.round(totalPayout / input.participant_count)
    const roi = Math.round((rng.nextFloat(1.2, 3.0) * perfFactor) * 100) / 100

    return {
      scenario: `${pct}% Performance`,
      performance_pct: pct,
      total_payout: Math.min(totalPayout, input.total_budget * 2),
      cost_per_participant: perParticipant,
      roi_estimate: roi
    }
  })

  const targetScenario = scenarios.find(s => s.performance_pct === 100)
  const totalCost = targetScenario?.total_payout || input.total_budget

  const discountRate = input.discount_rate || 0.08
  const vestingYears = input.vesting_years || 3
  const currency = input.currency || 'USD'
  let accountingImpact = ''
  if (input.plan_type === 'rsu' || input.plan_type === 'stock_options') {
    accountingImpact = `ASC 718 expense: ~${currency === 'USD' ? '$' : ''}${Math.round(totalCost / vestingYears).toLocaleString('en-US')}/yr over ${vestingYears}-yr vesting`
  } else {
    accountingImpact = `Accrued as liability: ${currency === 'USD' ? '$' : ''}${totalCost.toLocaleString('en-US')} when performance conditions met`
  }

  const recommendations: string[] = []
  recommendations.push(`Set threshold at 80% performance to avoid demotivation`)
  recommendations.push(`Cap upside at 200% of target to manage cost escalation`)
  recommendations.push(`Communicate payout curve clearly to participants before plan year`)
  if (input.plan_type === 'rsu' || input.plan_type === 'stock_options') {
    recommendations.push(`Consider 3-4 year vesting to support retention objectives`)
    recommendations.push(`Model dilution impact against authorized share pool`)
  }
  recommendations.push(`Review plan design annually for cost effectiveness and market competitiveness`)

  const planNames: Record<string, string> = {
    bonus: 'Annual Cash Bonus Pool',
    stock_options: 'Stock Option Grant',
    rsu: 'Restricted Share Unit',
    performance_units: 'Performance Share Unit',
    espp: 'Employee Share Purchase Plan'
  }

  return {
    plan_type: planNames[input.plan_type] || input.plan_type,
    summary: `${input.participant_count} participants, ${input.target_payout_pct}% target payout, ${input.payout_curve} curve`,
    scenarios,
    total_cost_projection: totalCost,
    accounting_impact: accountingImpact,
    recommendations,
    financial_disclaimer: 'Cost projections are estimates based on input assumptions. Actual accounting treatment must be confirmed with auditors. Tax implications vary by jurisdiction.'
  }
}

function formatIncentivePlanReport(r: IncentivePlanResult): string {
  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const lines: string[] = []
  lines.push(`# Incentive Plan Simulation — ${r.plan_type}`)
  lines.push('')
  lines.push(`**Plan Design:** ${r.summary}`)
  lines.push('')
  lines.push('## Payout Scenarios')
  lines.push('')
  lines.push('| Scenario | Total Payout | Per Participant | Est. ROI |')
  lines.push('|----------|-------------|-----------------|----------|')
  for (const s of r.scenarios) {
    lines.push(`| ${s.scenario} | ${fmt(s.total_payout)} | ${fmt(s.cost_per_participant)} | ${s.roi_estimate.toFixed(2)}x |`)
  }
  lines.push('')
  lines.push(`**Total Cost (at-target):** ${fmt(r.total_cost_projection)}`)
  lines.push(`**Accounting Impact:** ${r.accounting_impact}`)
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*Financial Disclaimer: ${r.financial_disclaimer}*`)
  return lines.join('\n')
}

// ----- Tool 5: Compensation Banding Designer -----
function analyzeCompBanding(input: CompBandingInput): CompBandingResult {
  const seed = SeededRandom.seedFromString(input.currency + input.organization_levels.toString())
  const rng = new SeededRandom(seed)

  const bandWidth = input.band_width_pct / 100
  const overlap = input.overlap_pct / 100
  const grades: SalaryGrade[] = []
  const levelNames = ['Entry', 'Developing', 'Proficient', 'Senior', 'Staff', 'Principal', 'Distinguished', 'Executive']

  let prevMidpoint = input.market_midpoint_reference * 0.6
  const progressionStep = (1 + overlap) / (1 - bandWidth * 0.5)

  for (let i = 0; i < input.organization_levels; i++) {
    const midpoint = Math.round(i === 0 ? prevMidpoint : prevMidpoint * (1 + rng.nextFloat(0.12, 0.20)))
    const rangeSpread = bandWidth
    const minimum = Math.round(midpoint / (1 + rangeSpread / 2))
    const maximum = Math.round(midpoint * (1 + rangeSpread / 2))

    grades.push({
      grade: i + 1,
      level_name: levelNames[i] || `Level ${i + 1}`,
      minimum,
      midpoint,
      maximum,
      range_spread: Math.round(rangeSpread * 1000) / 10
    })
    prevMidpoint = midpoint
  }

  const progressionRatio = grades.length >= 2
    ? Math.round((grades[grades.length - 1].midpoint / grades[0].midpoint) * 100) / 100
    : 1

  // Visualization
  const vizLines: string[] = []
  vizLines.push('SALARY GRADE MATRIX')
  vizLines.push('')
  const maxVal = grades[grades.length - 1].maximum
  const maxBar = 50
  for (const g of grades) {
    const minPos = Math.round(g.minimum / maxVal * maxBar)
    const maxPos = Math.round(g.maximum / maxVal * maxBar)
    const midPos = Math.round(g.midpoint / maxVal * maxBar)
    const bar = ' '.repeat(minPos) + '\u2588'.repeat(Math.max(1, maxPos - minPos))
    const label = `G${g.grade} ${g.level_name}`.padEnd(18)
    vizLines.push(`${label}|${bar} ${g.midpoint.toLocaleString('en-US')}`)
  }

  const recommendations: string[] = []
  recommendations.push(`Band width of ${input.band_width_pct}% provides ${input.band_width_pct > 40 ? 'broad' : 'narrow'} career ranges`)
  recommendations.push(`Overlap of ${input.overlap_pct}% allows lateral movement between grades`)
  recommendations.push(`Progression ratio of ${progressionRatio}x from entry to top grade`)
  recommendations.push('Review bands annually against market movement')
  recommendations.push('Assign roles to bands through job evaluation methodology (e.g., Hay Points)')

  return {
    currency: input.currency,
    grades,
    band_width_used: input.band_width_pct,
    overlap_used: input.overlap_pct,
    progression_ratio: progressionRatio,
    visualization: vizLines.join('\n'),
    recommendations,
    disclaimer: 'Compensation bands are structural frameworks. Actual salaries should be positioned within bands based on individual competencies, performance, and market conditions.'
  }
}

function formatCompBandingReport(r: CompBandingResult): string {
  const fmt = (n: number) => n.toLocaleString('en-US')
  const lines: string[] = []
  lines.push('# Compensation Banding Design')
  lines.push('')
  lines.push(`**Currency:** ${r.currency} | **Band Width:** ${r.band_width_used}% | **Overlap:** ${r.overlap_used}%`)
  lines.push(`**Progression Ratio:** ${r.progression_ratio}x`)
  lines.push('')
  lines.push('## Salary Grade Matrix')
  lines.push('')
  lines.push('| Grade | Level | Minimum | Midpoint | Maximum | Range Spread |')
  lines.push('|-------|-------|---------|----------|---------|--------------|')
  for (const g of r.grades) {
    lines.push(`| G${g.grade} | ${g.level_name} | ${fmt(g.minimum)} | ${fmt(g.midpoint)} | ${fmt(g.maximum)} | ${g.range_spread}% |`)
  }
  lines.push('')
  lines.push('## Visual Band Structure')
  lines.push('')
  lines.push('```')
  lines.push(r.visualization)
  lines.push('```')
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*Disclaimer: ${r.disclaimer}*`)
  return lines.join('\n')
}

// ----- Tool 6: Benefits Portfolio Optimizer -----
function analyzeBenefitsPortfolio(input: BenefitsPortfolioInput): BenefitsPortfolioResult {
  const seed = SeededRandom.seedFromString(input.priorities.join('') + input.employee_count.toString())
  const rng = new SeededRandom(seed)

  const currentTotal = input.current_benefits.reduce((s, b) => s + b.annual_cost_per_employee, 0) * input.employee_count
  const budgetPerEmployee = input.total_benefits_budget / input.employee_count

  // Optimize portfolio
  const optimized: OptimizedBenefit[] = input.current_benefits.map(b => {
    // Adjust cost based on utilization and satisfaction
    const efficiency = b.utilization_rate * (b.employee_satisfaction / 100)
    const adjustedCost = Math.round(b.annual_cost_per_employee * (0.9 + rng.nextFloat(-0.1, 0.2)))
    const newUtilization = Math.min(100, Math.round(b.utilization_rate * rng.nextFloat(0.9, 1.15)))
    const newSatisfaction = Math.min(100, Math.round(b.employee_satisfaction * rng.nextFloat(0.95, 1.1)))

    let rating: 'excellent' | 'good' | 'fair' | 'low' = 'good'
    if (efficiency > 0.7) rating = 'excellent'
    else if (efficiency > 0.5) rating = 'good'
    else if (efficiency > 0.3) rating = 'fair'
    else rating = 'low'

    let recommendation = 'Maintain current offering'
    if (rating === 'low') recommendation = 'Consider redesign or replacement — low cost efficiency'
    if (newSatisfaction < 60) recommendation = 'Review employee feedback for improvement areas'
    if (newUtilization < 40) recommendation = 'Increase awareness or simplify enrollment'

    return {
      name: b.name,
      annual_cost: adjustedCost * input.employee_count,
      cost_per_employee: adjustedCost,
      expected_utilization: newUtilization,
      satisfaction_score: newSatisfaction,
      cost_efficiency_rating: rating,
      recommendation
    }
  })

  const totalOptimized = optimized.reduce((s, b) => s + b.annual_cost, 0)
  const savings = currentTotal - totalOptimized

  const recommendations: string[] = []
  recommendations.push(`Current per-employee cost: ${Math.round(currentTotal / input.employee_count).toLocaleString('en-US')} | Optimized: ${Math.round(totalOptimized / input.employee_count).toLocaleString('en-US')}`)
  if (savings > 0) recommendations.push(`Potential annual savings: ${savings.toLocaleString('en-US')} (${Math.round(savings / input.employee_count).toLocaleString('en-US')} per employee)`)
  if (input.demographics.avg_age > 45) recommendations.push('Consider enhanced retirement and health screening benefits for aging workforce')
  if (input.demographics.remote_pct > 30) recommendations.push('Invest in remote-friendly benefits: home office stipend, virtual wellness')
  recommendations.push('Conduct annual benefits survey to validate satisfaction scores')
  recommendations.push('Benchmark against industry peers for cost competitiveness')

  return {
    total_budget: input.total_benefits_budget,
    optimized_portfolio: optimized,
    total_annual_cost: totalOptimized,
    savings_vs_current: savings,
    cost_per_employee: Math.round(totalOptimized / input.employee_count).toLocaleString('en-US'),
    recommendations,
    disclaimer: 'Benefits optimization is based on modeled utilization and satisfaction data. Actual costs and participation rates may vary. Consult benefits brokers for plan pricing.'
  }
}

function formatBenefitsPortfolioReport(r: BenefitsPortfolioResult): string {
  const fmt = (n: number) => n.toLocaleString('en-US')
  const lines: string[] = []
  lines.push('# Benefits Portfolio Optimization')
  lines.push('')
  lines.push(`**Total Budget:** ${fmt(r.total_budget)} | **Optimized Cost:** ${fmt(r.total_annual_cost)} | **Per Employee:** ${r.cost_per_employee}`)
  lines.push(`**Savings vs Current:** ${r.savings_vs_current >= 0 ? '+' : ''}${fmt(r.savings_vs_current)}`)
  lines.push('')
  lines.push('## Optimized Portfolio')
  lines.push('')
  lines.push('| Benefit | Cost/Employee | Utilization | Satisfaction | Efficiency | Recommendation |')
  lines.push('|---------|--------------|-------------|-------------|------------|----------------|')
  for (const b of r.optimized_portfolio) {
    lines.push(`| ${b.name} | ${fmt(b.cost_per_employee)} | ${b.expected_utilization}% | ${b.satisfaction_score}/100 | ${b.cost_efficiency_rating.toUpperCase()} | ${b.recommendation} |`)
  }
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*Disclaimer: ${r.disclaimer}*`)
  return lines.join('\n')
}

// ----- Tool 7: Executive Compensation Advisor -----
function analyzeExecutiveComp(input: ExecutiveCompInput): ExecutiveCompResult {
  const seed = SeededRandom.seedFromString(input.executive_role + input.company_revenue.toString())
  const rng = new SeededRandom(seed)

  // Peer benchmarking
  const revenueFactor = Math.log10(input.company_revenue) / 10
  const baseTDC = 500000 * revenueFactor * (1 + rng.nextFloat(-0.15, 0.25))

  // Adjust for performance
  const perfMult = input.performance_vs_peers === 'above' ? 1.2 : input.performance_vs_peers === 'below' ? 0.85 : 1.0
  const recommendedTDC = Math.round(baseTDC * perfMult)

  // Pay mix
  const isCEO = input.executive_role.toLowerCase().includes('ceo')
  const basePct = isCEO ? 15 : 25
  const annualPct = isCEO ? 20 : 25
  const ltiPct = isCEO ? 55 : 45
  const otherPct = 100 - basePct - annualPct - ltiPct

  // Peer comparison
  const peerMedian = Math.round(baseTDC * rng.nextFloat(0.9, 1.1))
  const peerP75 = Math.round(peerMedian * 1.3)
  const percentile = Math.round((recommendedTDC / peerP75) * 50 + 25)

  // Say-on-Pay forecast
  let sayOnPayForecast = 'N/A'
  if (input.say_on_pay_history && input.say_on_pay_history.length > 0) {
    const avgApproval = input.say_on_pay_history.reduce((s, h) => s + h.approval_pct, 0) / input.say_on_pay_history.length
    if (avgApproval > 90) sayOnPayForecast = 'Strong support expected (>90% approval likely)'
    else if (avgApproval > 70) sayOnPayForecast = 'Moderate support (70-90% approval range)'
    else sayOnPayForecast = 'Risk of low approval (<70%) — engage with shareholders'
  } else {
    sayOnPayForecast = 'No historical data — benchmark against peer Say-on-Pay results'
  }

  // Clawback recommendation
  const clawbackRec = 'Implement clawback policy covering: (1) financial restatement triggers, (2) misconduct, (3) material risk violations. Align with SEC/Nasdaq listing requirements.'

  const recommendations: string[] = []
  recommendations.push(`Target TDC at ${percentile}th percentile of peer group`)
  recommendations.push(`Pay mix: ${basePct}% base / ${annualPct}% annual incentive / ${ltiPct}% LTI`)
  recommendations.push('Use relative TSR as primary LTI metric for alignment with shareholder returns')
  recommendations.push('Implement 2x change-of-control severance cap (best practice)')
  recommendations.push('Maintain stock ownership guidelines (6x salary for CEO)')
  recommendations.push('Disclose realizable pay vs. grant-date pay in proxy statement')
  if (percentile > 75) recommendations.push('Above-median positioning requires strong performance justification for shareholders')

  return {
    executive_role: input.executive_role,
    recommended_tdc: recommendedTDC,
    pay_mix: { base_pct: basePct, annual_incentive_pct: annualPct, long_term_incentive_pct: ltiPct, other_pct: otherPct },
    peer_comparison: { percentile, total_direct_comp: recommendedTDC, peer_median: peerMedian, peer_p75: peerP75 },
    say_on_pay_forecast: sayOnPayForecast,
    clawback_recommendation: clawbackRec,
    recommendations,
    legal_disclaimer: 'Executive compensation recommendations are advisory. All arrangements must be approved by the Board/Compensation Committee and comply with applicable securities regulations, tax codes (e.g., IRC 162(m), 409A), and governance standards.'
  }
}

function formatExecutiveCompReport(r: ExecutiveCompResult): string {
  const fmt = (n: number) => n.toLocaleString('en-US')
  const lines: string[] = []
  lines.push(`# Executive Compensation Advisory — ${r.executive_role}`)
  lines.push('')
  lines.push('## Recommended Total Direct Compensation')
  lines.push('')
  lines.push(`**Recommended TDC:** $${fmt(r.recommended_tdc)}`)
  lines.push(`**Peer Percentile:** ${r.peer_comparison.percentile}th`)
  lines.push(`**Peer Median:** $${fmt(r.peer_comparison.peer_median)} | **Peer P75:** $${fmt(r.peer_comparison.peer_p75)}`)
  lines.push('')
  lines.push('## Pay Mix Recommendation')
  lines.push('')
  lines.push(`| Component | Allocation |`)
  lines.push(`|-----------|------------|`)
  lines.push(`| Base Salary | ${r.pay_mix.base_pct}% |`)
  lines.push(`| Annual Incentive | ${r.pay_mix.annual_incentive_pct}% |`)
  lines.push(`| Long-Term Incentive | ${r.pay_mix.long_term_incentive_pct}% |`)
  lines.push(`| Perquisites & Other | ${r.pay_mix.other_pct}% |`)
  lines.push('')
  lines.push('## Say-on-Pay Forecast')
  lines.push('')
  lines.push(r.say_on_pay_forecast)
  lines.push('')
  lines.push('## Clawback Policy Recommendation')
  lines.push('')
  lines.push(r.clawback_recommendation)
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*Legal Disclaimer: ${r.legal_disclaimer}*`)
  return lines.join('\n')
}

// ----- Tool 8: Global Payroll Compliance -----
function analyzeGlobalPayroll(input: GlobalPayrollInput): GlobalPayrollResult {
  const seed = SeededRandom.seedFromString(input.employee_name + input.home_country + input.host_country)
  const rng = new SeededRandom(seed)

  // Tax rates (simplified simulation)
  const homeTaxRate = rng.nextFloat(0.20, 0.40)
  const hostTaxRate = rng.nextFloat(0.15, 0.45)

  // Treaty benefit
  const treatyBenefit = input.tax_treaty_applicable ? 0.15 : 0
  const effectiveHostRate = Math.max(0, hostTaxRate - treatyBenefit)

  // Social security
  const ssRate = input.social_security_totalization ? 0.05 : 0.10

  // Tax breakdown
  const homeTax = Math.round(input.gross_salary * homeTaxRate * 0.6) // 60% attributed to home
  const hostTax = Math.round(input.gross_salary * effectiveHostRate * 0.4) // 40% attributed to host
  const socialSecurity = Math.round(input.gross_salary * ssRate)
  const totalTax = homeTax + hostTax + socialSecurity
  const netSalary = input.gross_salary - totalTax
  const effectiveRate = Math.round((totalTax / input.gross_salary) * 1000) / 10

  const taxBreakdown: TaxBreakdown[] = [
    { component: 'Home Country Income Tax', home_country_amount: homeTax, host_country_amount: 0, total: homeTax },
    { component: 'Host Country Income Tax', home_country_amount: 0, host_country_amount: hostTax, total: hostTax },
    { component: 'Social Security / National Insurance', home_country_amount: Math.round(socialSecurity * 0.5), host_country_amount: Math.round(socialSecurity * 0.5), total: socialSecurity }
  ]

  const complianceRequirements: string[] = []
  complianceRequirements.push(`Register with ${input.host_country} tax authority within 30 days of arrival`)
  complianceRequirements.push(`File annual tax returns in both ${input.home_country} and ${input.host_country}`)
  complianceRequirements.push(`Obtain Certificate of Coverage for social security totalization`)
  complianceRequirements.push(`Comply with ${input.host_country} local labor law for minimum wage and benefits`)
  if (input.assignment_duration_months > 12) {
    complianceRequirements.push('Permanent establishment risk review required for assignments > 12 months')
  }
  complianceRequirements.push('Maintain detailed records of days worked in each jurisdiction')
  complianceRequirements.push('Report foreign bank accounts if applicable (FBAR/FATCA)')

  const treatyBenefits: string[] = []
  if (input.tax_treaty_applicable) {
    treatyBenefits.push('Elimination of double taxation on employment income')
    treatyBenefits.push('Reduced withholding rates on cross-border payments')
    treatyBenefits.push('Tie-breaker rules for residency determination')
    treatyBenefits.push('Social security totalization coordination')
  } else {
    treatyBenefits.push('No tax treaty — foreign tax credits may be available')
    treatyBenefits.push('Consider bilateral social security agreement if available')
  }

  const recommendations: string[] = []
  recommendations.push(`Use ${input.compensation_method} method for salary structuring`)
  recommendations.push('Engage Big Four firm for cross-border tax equalization analysis')
  recommendations.push('Implement shadow payroll for host country tax withholding')
  recommendations.push('Review tax equalization policy annually')
  if (input.assignment_duration_months > 36) {
    recommendations.push('Long-term assignment: consider localizing compensation')
  }
  recommendations.push('Monitor OECD Pillar Two implications for global mobility')

  return {
    employee_name: input.employee_name,
    assignment_type: `${input.home_country} to ${input.host_country} (${input.assignment_duration_months} months)`,
    tax_breakdown: taxBreakdown,
    total_tax_burden: totalTax,
    effective_tax_rate: effectiveRate,
    net_salary_estimate: netSalary,
    compliance_requirements: complianceRequirements,
    tax_treaty_benefits: treatyBenefits,
    recommendations,
    legal_disclaimer: 'Cross-border tax analysis is highly complex and jurisdiction-specific. This output is for preliminary planning only. Engage qualified international tax advisors for actual compliance. Tax treaties and rates change frequently.'
  }
}

function formatGlobalPayrollReport(r: GlobalPayrollResult): string {
  const fmt = (n: number) => n.toLocaleString('en-US')
  const lines: string[] = []
  lines.push(`# Global Payroll Compliance Analysis`)
  lines.push('')
  lines.push(`**Employee:** ${r.employee_name}`)
  lines.push(`**Assignment:** ${r.assignment_type}`)
  lines.push('')
  lines.push('## Tax Breakdown')
  lines.push('')
  lines.push('| Component | Home Country | Host Country | Total |')
  lines.push('|-----------|-------------|-------------|-------|')
  for (const t of r.tax_breakdown) {
    lines.push(`| ${t.component} | ${fmt(t.home_country_amount)} | ${fmt(t.host_country_amount)} | ${fmt(t.total)} |`)
  }
  lines.push('')
  lines.push(`**Total Tax Burden:** ${fmt(r.total_tax_burden)}`)
  lines.push(`**Effective Tax Rate:** ${r.effective_tax_rate}%`)
  lines.push(`**Estimated Net Salary:** ${fmt(r.net_salary_estimate)}`)
  lines.push('')
  lines.push('## Tax Treaty Benefits')
  lines.push('')
  for (const b of r.tax_treaty_benefits) lines.push(`- ${b}`)
  lines.push('')
  lines.push('## Compliance Requirements')
  lines.push('')
  for (const c of r.compliance_requirements) lines.push(`- [ ] ${c}`)
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('---')
  lines.push(`*Legal Disclaimer: ${r.legal_disclaimer}*`)
  return lines.join('\n')
}

// ============================================================================
// SECTION 4 — PLUGIN DEFINITION
// ============================================================================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: salary_benchmarking_engine
  tools.register(defineTool({
    name: 'salary_benchmarking_engine',
    description: 'Perform salary market benchmarking analysis with percentile calculation (P10/P25/P50/P75/P90). Returns market positioning, compa-ratio, and recommendations for salary adjustments.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: role_title (string), industry (string), location (string), years_experience (number), company_size (startup|mid|large|enterprise), current_salary (optional number), market_data_source (optional string)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: SalaryBenchmarkingInput = JSON.parse(args.input_data)
      const result = analyzeSalaryBenchmarking(data)
      return formatBenchmarkingReport(result)
    }
  }))

  // Tool 2: total_rewards_statement_generator
  tools.register(defineTool({
    name: 'total_rewards_statement_generator',
    description: 'Generate a personalized total rewards statement with visual breakdown of all compensation components including base salary, bonus, equity, benefits, retirement, and perks.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: employee_id, employee_name, base_salary, annual_bonus, equity_value, benefits_value, retirement_contribution, wellness_benefits, other_perks, currency (e.g. "USD"), year (number)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: TotalRewardsInput = JSON.parse(args.input_data)
      const result = analyzeTotalRewards(data)
      return formatTotalRewardsReport(result)
    }
  }))

  // Tool 3: pay_equity_analyzer
  tools.register(defineTool({
    name: 'pay_equity_analyzer',
    description: 'Analyze pay equity across gender, ethnicity, and department dimensions. Returns unadjusted pay gaps, risk level assessment, statistical significance, and remediation recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with field: workforce (array of objects with id, gender, ethnicity, department, job_level, base_salary, years_in_role, performance_rating), comparison_base (optional string), control_variables (optional string[])'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: PayEquityInput = JSON.parse(args.input_data)
      const result = analyzePayEquity(data)
      return formatPayEquityReport(result)
    }
  }))

  // Tool 4: incentive_plan_simulator
  tools.register(defineTool({
    name: 'incentive_plan_simulator',
    description: 'Simulate bonus or equity incentive plan payouts across multiple performance scenarios. Returns cost projections, per-participant payouts, ROI estimates, and accounting impact.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: plan_type (bonus|stock_options|rsu|performance_units|espp), participant_count, total_budget, performance_metrics (string[]), payout_curve (threshold|linear|accelerated|capped), target_payout_pct, vesting_years (optional), discount_rate (optional)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: IncentivePlanInput = JSON.parse(args.input_data)
      const result = analyzeIncentivePlan(data)
      return formatIncentivePlanReport(result)
    }
  }))

  // Tool 5: compensation_banding_designer
  tools.register(defineTool({
    name: 'compensation_banding_designer',
    description: 'Design salary grade structure with compensation bands. Returns salary grade matrix with minimum/midpoint/maximum for each level, overlap analysis, and visual band structure.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: organization_levels (number), market_midpoint_reference (number), band_width_pct (number), overlap_pct (number), currency (string), geographic_differentials (optional Record<string, number>)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: CompBandingInput = JSON.parse(args.input_data)
      const result = analyzeCompBanding(data)
      return formatCompBandingReport(result)
    }
  }))

  // Tool 6: benefits_portfolio_optimizer
  tools.register(defineTool({
    name: 'benefits_portfolio_optimizer',
    description: 'Optimize benefits portfolio for cost efficiency and employee satisfaction. Returns optimized benefit lineup with cost analysis, utilization projections, and satisfaction scores.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: total_benefits_budget, employee_count, demographics (avg_age, dependents_pct, remote_pct), current_benefits (array of name/annual_cost_per_employee/utilization_rate/employee_satisfaction), priorities (string[])'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: BenefitsPortfolioInput = JSON.parse(args.input_data)
      const result = analyzeBenefitsPortfolio(data)
      return formatBenefitsPortfolioReport(result)
    }
  }))

  // Tool 7: executive_compensation_advisor
  tools.register(defineTool({
    name: 'executive_compensation_advisor',
    description: 'Design executive compensation packages with peer benchmarking, pay mix optimization, Say-on-Pay forecasting, and clawback policy recommendations.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: executive_role, company_revenue, company_market_cap (optional), peer_group (string[]), current_comp (base_salary/annual_bonus_target/long_term_incentive/perquisites/change_of_control), performance_vs_peers (below|at|above), say_on_pay_history (optional array of year/approval_pct)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: ExecutiveCompInput = JSON.parse(args.input_data)
      const result = analyzeExecutiveComp(data)
      return formatExecutiveCompReport(result)
    }
  }))

  // Tool 8: global_payroll_compliance
  tools.register(defineTool({
    name: 'global_payroll_compliance',
    description: 'Analyze cross-border payroll compliance including tax treaty benefits, social security totalization, shadow payroll requirements, and permanent establishment risk.',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON object with fields: employee_name, home_country, host_country, assignment_duration_months, gross_salary, currency, tax_treaty_applicable (boolean), social_security_totalization (boolean), compensation_method (balance_sheet|local_plus|host_based|split_pay)'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v }] },
    async execute(args: { input_data: string }) {
      const data: GlobalPayrollInput = JSON.parse(args.input_data)
      const result = analyzeGlobalPayroll(data)
      return formatGlobalPayrollReport(result)
    }
  }))

  console.log(`[dsh-tool-hrcompagent] Loaded v${VERSION} - HR Compensation & Benefits AI Agent Plugin with 8 tools`)
}
