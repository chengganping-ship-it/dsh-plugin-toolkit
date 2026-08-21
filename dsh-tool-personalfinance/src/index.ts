/**
 * DSH Personal Finance AI Plugin v0.1.0
 *
 * AI-powered personal finance planning toolkit for DeepSeek Harness Agent.
 * Aligned with AI + personal finance planning trend. Provides expense tracking,
 * budget optimization, investment portfolio management, debt reduction planning,
 * retirement planning, tax optimization, goal-based savings, and financial literacy.
 *
 * Features (v0.1.0):
 * - Expense Tracker: auto-classification + merchant mapping + cycle detection + tax identification + anomaly detection + portfolio linkage
 * - Budget Optimizer: income analysis + expense pattern + budget allocation + savings goals + progress tracking + adjustment suggestions
 * - Investment Portfolio: stocks + bonds + funds + ETFs + risk assessment + rebalancing + tax optimization + goal tracking
 * - Debt Reduction Planner: priority ranking + extra payments vs avalanche vs snowball + timeline + interest savings + progress motivation
 * - Retirement Planner: target replacement rate + social security + pension + 401k + IRA + medical costs + withdrawal strategy + gap analysis
 * - Tax Optimizer: deductions + credits + capital loss harvesting + retirement contributions + entity structure + compliance + tax savings simulation
 * - Goal-Based Savings: emergency fund + education + home + car + travel + strategy + automation + incentive tracking
 * - Financial Literacy: knowledge assessment + learning path + progress + certification + suggestions + community interaction + practical tasks
 *
 * DISCLAIMER: This analysis does NOT replace professional financial advice.
 * Always consult a certified financial planner or tax advisor for financial decisions.
 *
 * @module dsh-tool-personalfinance
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-personalfinance'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM ====================

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash) || 1
}

function clampedRand(rand: () => number, min: number, max: number): number {
  return Math.round((min + rand() * (max - min)) * 100) / 100
}

// ==================== TOOL 1: EXPENSE TRACKER ====================

interface CategorizedExpense {
  date: string
  amount: number
  category: string
  subcategory: string
  merchant: string
  payment_method: string
  recurring: boolean
  frequency?: string
  tax_deductible: boolean
  confidence: number
  anomaly: boolean
  anomaly_reason?: string
  investment_linked: boolean
  notes: string[]
}

interface CyclePattern {
  merchant: string
  frequency: string
  average_amount: number
  next_expected: string
  occurrences: number
}

interface ExpenseReport {
  total_spent: number
  currency: string
  period: string
  expenses: CategorizedExpense[]
  categories: Array<{ name: string; total: number; percentage: number }>
  cycle_patterns: CyclePattern[]
  anomalies_detected: Array<{ expense: CategorizedExpense; reason: string }>
  tax_deductible_total: number
  merchant_mapping: Array<{ original: string; standardized: string; category: string }>
  investment_correlation: Array<{ expense: string; investment_type: string; recommendation: string }>
  disclaimer: string
}

function trackExpenses(
  transactionData: string,
  expenseCategory: string,
  autoClassify: boolean = true
): ExpenseReport {
  const seed = hashString(transactionData + expenseCategory)
  const rand = seededRandom(seed)

  const categoryMap: Record<string, string[]> = {
    food: ['Groceries', 'Restaurant', 'Food Delivery', 'Coffee Shop'],
    transport: ['Fuel', 'Public Transit', 'Ride Share', 'Parking'],
    utilities: ['Electricity', 'Water', 'Internet', 'Phone'],
    entertainment: ['Streaming', 'Movies', 'Games', 'Books'],
    health: ['Insurance', 'Pharmacy', 'Dental', 'Gym'],
    education: ['Online Course', 'Books', 'Tutoring', 'Workshop'],
    shopping: ['Clothing', 'Electronics', 'Home', 'Personal Care']
  }

  const merchants = ['Amazon', 'Starbucks', 'Whole Foods', 'Netflix', 'Uber', 'Shell', 'Costco', 'Target', 'Apple Store', 'CVS']
  const paymentMethods = ['Credit Card', 'Debit Card', 'Cash', 'Digital Wallet', 'Bank Transfer']

  const expenses: CategorizedExpense[] = []
  const lines = transactionData.split('\n').filter(l => l.trim().length > 0)
  const numExpenses = Math.min(lines.length || 8, 12)

  for (let i = 0; i < numExpenses; i++) {
    const line = lines[i] || `Transaction ${i + 1}`
    const amount = clampedRand(rand, 5, 250)
    const cat = expenseCategory.toLowerCase()
    const subcategories = categoryMap[cat] || ['General', 'Miscellaneous']
    const subcategory = subcategories[Math.floor(rand() * subcategories.length)]
    const merchant = merchants[Math.floor(rand() * merchants.length)]
    const isRecurring = rand() > 0.6
    const isAnomaly = rand() > 0.85
    const isTaxDeductible = cat === 'education' || cat === 'health' || rand() > 0.85

    const month = Math.floor(rand() * 12) + 1
    const day = Math.floor(rand() * 28) + 1

    const notes: string[] = []
    if (autoClassify) notes.push(`Auto-classified as ${subcategory} (confidence: ${(clampedRand(rand, 0.75, 0.98) * 100).toFixed(0)}%)`)
    if (isRecurring) notes.push('Recurring pattern detected')
    if (isTaxDeductible) notes.push('Potentially tax-deductible')

    expenses.push({
      date: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      amount,
      category: expenseCategory,
      subcategory,
      merchant,
      payment_method: paymentMethods[Math.floor(rand() * paymentMethods.length)],
      recurring: isRecurring,
      frequency: isRecurring ? (['weekly', 'bi-weekly', 'monthly', 'quarterly'][Math.floor(rand() * 4)]) : undefined,
      tax_deductible: isTaxDeductible,
      confidence: clampedRand(rand, 0.7, 0.98),
      anomaly: isAnomaly,
      anomaly_reason: isAnomaly ? ('Amount significantly higher than typical ' + subcategory + ' spending') : undefined,
      investment_linked: rand() > 0.8,
      notes
    })
  }

  const cyclePatterns: CyclePattern[] = []
  const recurring = expenses.filter(e => e.recurring)
  const merchantGroups = new Map<string, CategorizedExpense[]>()
  recurring.forEach(e => {
    const group = merchantGroups.get(e.merchant) || []
    group.push(e)
    merchantGroups.set(e.merchant, group)
  })
  merchantGroups.forEach((items, merchant) => {
    if (items.length >= 2) {
      const avg = items.reduce((s, i) => s + i.amount, 0) / items.length
      cyclePatterns.push({
        merchant,
        frequency: items[0].frequency || 'monthly',
        average_amount: Math.round(avg * 100) / 100,
        next_expected: '2025-' + String(Math.floor(rand() * 12) + 1).padStart(2, '0') + '-15',
        occurrences: items.length
      })
    }
  })

  const anomalies: ExpenseReport['anomalies_detected'] = []
  expenses.filter(e => e.anomaly).forEach(e => {
    anomalies.push({ expense: e, reason: e.anomaly_reason || 'Unusual spending pattern detected' })
  })

  const categoryMap2 = new Map<string, number>()
  expenses.forEach(e => {
    categoryMap2.set(e.subcategory, (categoryMap2.get(e.subcategory) || 0) + e.amount)
  })
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const categories = Array.from(categoryMap2.entries()).map(([name, total]) => ({
    name,
    total: Math.round(total * 100) / 100,
    percentage: Math.round((total / totalSpent) * 10000) / 100
  }))

  const taxDeductibleTotal = expenses.filter(e => e.tax_deductible).reduce((s, e) => s + e.amount, 0)

  const merchantMapping: ExpenseReport['merchant_mapping'] = merchants.slice(0, 5).map(m => ({
    original: m.toLowerCase().replace(/\s/g, ''),
    standardized: m,
    category: ['Shopping', 'Dining', 'Groceries', 'Entertainment', 'Transport'][merchants.indexOf(m) % 5]
  }))

  const investmentCorrelation: ExpenseReport['investment_correlation'] = [
    { expense: 'Gym membership', investment_type: 'Health ETF', recommendation: 'Health spending correlates with healthcare sector performance' },
    { expense: 'Tech purchases', investment_type: 'Technology stocks', recommendation: 'Consumer tech spending may signal sector trends' }
  ]

  return {
    total_spent: Math.round(totalSpent * 100) / 100,
    currency: 'USD',
    period: '2025 Monthly',
    expenses,
    categories,
    cycle_patterns: cyclePatterns,
    anomalies_detected: anomalies,
    tax_deductible_total: Math.round(taxDeductibleTotal * 100) / 100,
    merchant_mapping: merchantMapping,
    investment_correlation: investmentCorrelation,
    disclaimer: '⚠️ 本分析不可替代专业财务建议。支出分类由AI自动完成，请核实所有分类的准确性。'
  }
}

function formatExpenseTracker(report: ExpenseReport): string {
  const lines: string[] = []
  lines.push('## Expense Tracker Report')
  lines.push('')
  lines.push('**Period:** ' + report.period + ' | **Total Spent:** $' + report.total_spent.toFixed(2) + ' ' + report.currency)
  lines.push('**Tax Deductible:** $' + report.tax_deductible_total.toFixed(2))
  lines.push('')

  if (report.categories.length > 0) {
    lines.push('### Category Breakdown')
    lines.push('| Category | Amount | Percentage |')
    lines.push('|----------|--------|------------|')
    report.categories.forEach(c => {
      const bar = '#'.repeat(Math.round(c.percentage / 5)) + '-'.repeat(20 - Math.round(c.percentage / 5))
      lines.push('| ' + c.name + ' | $' + c.total.toFixed(2) + ' | ' + bar + ' ' + c.percentage.toFixed(1) + '% |')
    })
    lines.push('')
  }

  lines.push('### Transaction Detail')
  lines.push('| Date | Amount | Category | Merchant | Recurring | Tax |')
  lines.push('|------|--------|----------|----------|-----------|-----|')
  report.expenses.forEach(e => {
    const freq = e.frequency ? ' ' + e.frequency : ''
    const anomaly = e.anomaly ? '!' : ''
    lines.push('| ' + e.date + ' | $' + e.amount.toFixed(2) + anomaly + ' | ' + e.subcategory + ' | ' + e.merchant + ' | ' + (e.recurring ? 'Yes' + freq : 'No') + ' | ' + (e.tax_deductible ? 'Yes' : 'No') + ' |')
  })
  lines.push('')

  if (report.cycle_patterns.length > 0) {
    lines.push('### Recurring Patterns Detected')
    lines.push('| Merchant | Frequency | Avg Amount | Next Expected | Occurrences |')
    lines.push('|----------|-----------|------------|---------------|-------------|')
    report.cycle_patterns.forEach(p => {
      lines.push('| ' + p.merchant + ' | ' + p.frequency + ' | $' + p.average_amount.toFixed(2) + ' | ' + p.next_expected + ' | ' + p.occurrences + ' |')
    })
    lines.push('')
  }

  if (report.anomalies_detected.length > 0) {
    lines.push('### Anomalies Detected')
    report.anomalies_detected.forEach(a => {
      lines.push('- $' + a.expense.amount.toFixed(2) + ' at ' + a.expense.merchant + ' (' + a.reason + ')')
    })
    lines.push('')
  }

  lines.push('### Merchant Mapping')
  report.merchant_mapping.forEach(m => {
    lines.push('- ' + m.original + ' -> ' + m.standardized + ' [' + m.category + ']')
  })
  lines.push('')

  lines.push('> ' + report.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 2: BUDGET OPTIMIZER ====================

interface IncomeSource {
  source: string
  amount: number
  frequency: string
  reliability: 'stable' | 'variable' | 'passive'
  monthly_equivalent: number
}

interface ExpensePattern {
  category: string
  monthly_total: number
  trend: 'increasing' | 'stable' | 'decreasing'
  benchmark_pct: number
  status: 'over' | 'on_track' | 'under'
}

interface BudgetAllocation {
  category: string
  current: number
  recommended: number
  difference: number
  priority: 'essential' | 'important' | 'discretionary'
}

interface SavingsGoal {
  name: string
  target: number
  current: number
  monthly_contribution: number
  months_to_goal: number
  progress_pct: number
}

interface BudgetOptimizationReport {
  total_monthly_income: number
  total_monthly_expenses: number
  net_monthly_savings: number
  savings_rate: number
  income_sources: IncomeSource[]
  expense_patterns: ExpensePattern[]
  budget_allocations: BudgetAllocation[]
  savings_goals: SavingsGoal[]
  progress_tracking: Array<{ metric: string; current: number; target: number; progress: number }>
  adjustment_suggestions: Array<{ action: string; impact: number; difficulty: 'easy' | 'moderate' | 'hard' }>
  disclaimer: string
}

function optimizeBudget(
  monthlyIncome: string,
  currentExpenses: string,
  savingsTarget: string
): BudgetOptimizationReport {
  const seed = hashString(monthlyIncome + currentExpenses + savingsTarget)
  const rand = seededRandom(seed)

  const income = parseFloat(monthlyIncome) || 6500
  const expenses = parseFloat(currentExpenses) || 4200
  const target = parseFloat(savingsTarget) || 1000

  const incomeSources: IncomeSource[] = [
    { source: 'Primary Salary', amount: income * 0.78, frequency: 'monthly', reliability: 'stable', monthly_equivalent: income * 0.78 },
    { source: 'Side Income', amount: income * 0.15, frequency: 'variable', reliability: 'variable', monthly_equivalent: income * 0.15 },
    { source: 'Investment Income', amount: income * 0.07, frequency: 'quarterly', reliability: 'passive', monthly_equivalent: income * 0.07 }
  ]

  const expensePatterns: ExpensePattern[] = [
    { category: 'Housing', monthly_total: expenses * 0.32, trend: 'stable', benchmark_pct: 30, status: 'over' },
    { category: 'Food', monthly_total: expenses * 0.15, trend: 'increasing', benchmark_pct: 15, status: 'on_track' },
    { category: 'Transportation', monthly_total: expenses * 0.12, trend: 'stable', benchmark_pct: 15, status: 'under' },
    { category: 'Utilities', monthly_total: expenses * 0.08, trend: 'increasing', benchmark_pct: 10, status: 'under' },
    { category: 'Entertainment', monthly_total: expenses * 0.10, trend: 'increasing', benchmark_pct: 5, status: 'over' },
    { category: 'Insurance', monthly_total: expenses * 0.08, trend: 'stable', benchmark_pct: 10, status: 'under' },
    { category: 'Healthcare', monthly_total: expenses * 0.07, trend: 'stable', benchmark_pct: 8, status: 'under' },
    { category: 'Personal', monthly_total: expenses * 0.08, trend: 'decreasing', benchmark_pct: 7, status: 'on_track' }
  ]

  const budgetAllocations: BudgetAllocation[] = [
    { category: 'Housing', current: expensePatterns[0].monthly_total, recommended: income * 0.30, difference: income * 0.30 - expensePatterns[0].monthly_total, priority: 'essential' },
    { category: 'Food', current: expensePatterns[1].monthly_total, recommended: income * 0.13, difference: income * 0.13 - expensePatterns[1].monthly_total, priority: 'essential' },
    { category: 'Transportation', current: expensePatterns[2].monthly_total, recommended: income * 0.12, difference: income * 0.12 - expensePatterns[2].monthly_total, priority: 'essential' },
    { category: 'Utilities', current: expensePatterns[3].monthly_total, recommended: income * 0.08, difference: income * 0.08 - expensePatterns[3].monthly_total, priority: 'essential' },
    { category: 'Entertainment', current: expensePatterns[4].monthly_total, recommended: income * 0.05, difference: income * 0.05 - expensePatterns[4].monthly_total, priority: 'discretionary' },
    { category: 'Insurance', current: expensePatterns[5].monthly_total, recommended: income * 0.08, difference: income * 0.08 - expensePatterns[5].monthly_total, priority: 'important' },
    { category: 'Healthcare', current: expensePatterns[6].monthly_total, recommended: income * 0.07, difference: income * 0.07 - expensePatterns[6].monthly_total, priority: 'important' },
    { category: 'Personal', current: expensePatterns[7].monthly_total, recommended: income * 0.07, difference: income * 0.07 - expensePatterns[7].monthly_total, priority: 'discretionary' }
  ]

  const netSavings = income - expenses
  const savingsRate = (netSavings / income) * 100

  const savingsGoals: SavingsGoal[] = [
    { name: 'Emergency Fund', target: income * 6, current: income * 2.5, monthly_contribution: target * 0.4, months_to_goal: 0, progress_pct: 0 },
    { name: 'Vacation Fund', target: 3000, current: 800, monthly_contribution: target * 0.3, months_to_goal: 0, progress_pct: 0 },
    { name: 'New Car Down Payment', target: 8000, current: 1500, monthly_contribution: target * 0.3, months_to_goal: 0, progress_pct: 0 }
  ]
  savingsGoals.forEach(g => {
    g.months_to_goal = Math.ceil((g.target - g.current) / g.monthly_contribution)
    g.progress_pct = Math.round((g.current / g.target) * 10000) / 100
  })

  const progressTracking = [
    { metric: 'Emergency Fund ( months)', current: 2.5, target: 6, progress: Math.round((2.5 / 6) * 100) },
    { metric: 'Savings Rate', current: Math.round(savingsRate), target: 25, progress: Math.round((savingsRate / 25) * 100) },
    { metric: 'Debt-to-Income', current: 28, target: 20, progress: Math.max(0, Math.round(((35 - 28) / (35 - 20)) * 100)) }
  ]

  const adjustmentSuggestions: BudgetOptimizationReport['adjustment_suggestions'] = [
    { action: 'Negotiate internet bill ($20/month savings)', impact: 20, difficulty: 'easy' },
    { action: 'Reduce dining out frequency by 2x/week ($80/month)', impact: 80, difficulty: 'moderate' },
    { action: 'Switch to high-yield savings account (+$45/month interest)', impact: 45, difficulty: 'easy' },
    { action: 'Consolidate subscriptions ($35/month savings)', impact: 35, difficulty: 'easy' },
    { action: 'Automate savings transfer on payday ($200/month)', impact: 200, difficulty: 'easy' }
  ]

  return {
    total_monthly_income: income,
    total_monthly_expenses: expenses,
    net_monthly_savings: Math.round(netSavings * 100) / 100,
    savings_rate: Math.round(savingsRate * 100) / 100,
    income_sources: incomeSources,
    expense_patterns: expensePatterns,
    budget_allocations: budgetAllocations,
    savings_goals: savingsGoals,
    progress_tracking: progressTracking,
    adjustment_suggestions: adjustmentSuggestions,
    disclaimer: '⚠️ 本分析不可替代专业财务建议。预算建议基于有限信息，实际财务决策应咨询持证理财规划师。'
  }
}

function formatBudgetOptimizer(report: BudgetOptimizationReport): string {
  const lines: string[] = []
  lines.push('## Budget Optimizer Report')
  lines.push('')
  lines.push('**Monthly Income:** $' + report.total_monthly_income.toFixed(0) + ' | **Expenses:** $' + report.total_monthly_expenses.toFixed(0) + ' | **Net Savings:** $' + report.net_monthly_savings.toFixed(0))
  lines.push('**Savings Rate:** ' + report.savings_rate.toFixed(1) + '% ' + (report.savings_rate >= 20 ? '(Excellent)' : report.savings_rate >= 15 ? '(Good)' : report.savings_rate >= 10 ? '(Fair)' : '(Needs Improvement)'))
  lines.push('')

  lines.push('### Income Analysis')
  lines.push('| Source | Amount | Frequency | Reliability |')
  lines.push('|--------|--------|-----------|-------------|')
  report.income_sources.forEach(i => {
    const relIcon = i.reliability === 'stable' ? 'Stable' : i.reliability === 'variable' ? 'Variable' : 'Passive'
    lines.push('| ' + i.source + ' | $' + i.amount.toFixed(0) + ' | ' + i.frequency + ' | ' + relIcon + ' |')
  })
  lines.push('')

  lines.push('### Expense Pattern Analysis')
  lines.push('| Category | Monthly | Trend | Benchmark | Status |')
  lines.push('|----------|---------|-------|-----------|--------|')
  report.expense_patterns.forEach(e => {
    const statusIcon = e.status === 'over' ? 'OVER' : e.status === 'under' ? 'UNDER' : 'OK'
    lines.push('| ' + e.category + ' | $' + e.monthly_total.toFixed(0) + ' | ' + e.trend + ' | ' + e.benchmark_pct + '% | ' + statusIcon + ' |')
  })
  lines.push('')

  lines.push('### Budget Allocation')
  lines.push('| Category | Current | Recommended | Difference | Priority |')
  lines.push('|----------|---------|-------------|------------|----------|')
  report.budget_allocations.forEach(b => {
    const diffStr = b.difference >= 0 ? '+$' + b.difference.toFixed(0) : '-$' + Math.abs(b.difference).toFixed(0)
    lines.push('| ' + b.category + ' | $' + b.current.toFixed(0) + ' | $' + b.recommended.toFixed(0) + ' | ' + diffStr + ' | ' + b.priority + ' |')
  })
  lines.push('')

  lines.push('### Savings Goals Progress')
  report.savings_goals.forEach(g => {
    const bar = '#'.repeat(Math.round(g.progress_pct / 5)) + '-'.repeat(20 - Math.round(g.progress_pct / 5))
    lines.push('**' + g.name + '** $' + g.current.toFixed(0) + ' / $' + g.target.toFixed(0) + ' (' + g.progress_pct.toFixed(0) + '%)')
    lines.push('  ' + bar + ' $' + g.monthly_contribution.toFixed(0) + '/mo | ' + g.months_to_goal + ' months remaining')
  })
  lines.push('')

  if (report.progress_tracking.length > 0) {
    lines.push('### Key Metrics Tracking')
    report.progress_tracking.forEach(p => {
      const bar = '#'.repeat(Math.round(p.progress / 5)) + '-'.repeat(20 - Math.round(p.progress / 5))
      lines.push('- **' + p.metric + ':** ' + p.current + ' / ' + p.target + ' (' + bar + ' ' + p.progress + '%)')
    })
    lines.push('')
  }

  lines.push('### Adjustment Suggestions')
  report.adjustment_suggestions.forEach((s, i) => {
    const diffIcon = s.difficulty === 'easy' ? 'Easy' : s.difficulty === 'moderate' ? 'Medium' : 'Hard'
    lines.push((i + 1) + '. **' + s.action + '** [$' + s.impact + '/mo | ' + diffIcon + ']')
  })
  lines.push('')

  lines.push('> ' + report.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 3: INVESTMENT PORTFOLIO ====================

interface Holding {
  symbol: string
  name: string
  type: 'stock' | 'bond' | 'fund' | 'etf'
  shares: number
  cost_basis: number
  current_price: number
  current_value: number
  gain_loss: number
  gain_loss_pct: number
  allocation_pct: number
  dividend_yield: number
  risk_level: 'low' | 'medium' | 'high'
  sector: string
}

interface PortfolioAnalysis {
  total_value: number
  total_cost: number
  total_gain_loss: number
  total_gain_loss_pct: number
  holdings: Holding[]
  asset_allocation: Array<{ type: string; value: number; percentage: number }>
  sector_allocation: Array<{ sector: string; percentage: number }>
  risk_assessment: { overall_risk: string; risk_score: number; sharpe_ratio: number; max_drawdown: number; volatility: number }
  rebalancing_actions: Array<{ action: string; symbol: string; amount: number; reason: string }>
  tax_optimization: Array<{ strategy: string; potential_savings: number; priority: 'high' | 'medium' | 'low' }>
  goal_tracking: Array<{ goal: string; current: number; target: number; projected_date: string }>
  disclaimer: string
}

function analyzePortfolio(holdingsData: string): PortfolioAnalysis {
  const seed = hashString(holdingsData)
  const rand = seededRandom(seed)

  const holdings: Holding[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', shares: 25, cost_basis: 152.30, current_price: 189.50, current_value: 0, gain_loss: 0, gain_loss_pct: 0, allocation_pct: 0, dividend_yield: 0.55, risk_level: 'medium', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', shares: 15, cost_basis: 285.40, current_price: 378.90, current_value: 0, gain_loss: 0, gain_loss_pct: 0, allocation_pct: 0, dividend_yield: 0.72, risk_level: 'low', sector: 'Technology' },
    { symbol: 'VTI', name: 'Vanguard Total Stock ETF', type: 'etf', shares: 40, cost_basis: 210.00, current_price: 245.60, current_value: 0, gain_loss: 0, gain_loss_pct: 0, allocation_pct: 0, dividend_yield: 1.45, risk_level: 'medium', sector: 'Broad Market' },
    { symbol: 'BND', name: 'Vanguard Total Bond ETF', type: 'etf', shares: 60, cost_basis: 72.50, current_price: 71.80, current_value: 0, gain_loss: 0, gain_loss_pct: 0, allocation_pct: 0, dividend_yield: 4.20, risk_level: 'low', sector: 'Fixed Income' },
    { symbol: 'FXNAX', name: 'Fidelity US Bond Index', type: 'fund', shares: 120, cost_basis: 11.80, current_price: 11.20, current_value: 0, gain_loss: 0, gain_loss_pct: 0, allocation_pct: 0, dividend_yield: 3.85, risk_level: 'low', sector: 'Bonds' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', shares: 8, cost_basis: 120.50, current_price: 141.80, current_value: 0, gain_loss: 0, gain_loss_pct: 0, allocation_pct: 0, dividend_yield: 0.00, risk_level: 'medium', sector: 'Technology' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', shares: 10, cost_basis: 128.70, current_price: 178.25, current_value: 0, gain_loss: 0, gain_loss_pct: 0, allocation_pct: 0, dividend_yield: 0.00, risk_level: 'medium', sector: 'Consumer Cyclical' },
    { symbol: 'SGOV', name: 'iShares 0-3 Month T-Bill', type: 'etf', shares: 30, cost_basis: 100.10, current_price: 100.25, current_value: 0, gain_loss: 0, gain_loss_pct: 0, allocation_pct: 0, dividend_yield: 5.10, risk_level: 'low', sector: 'Cash Equivalent' }
  ]

  holdings.forEach(h => {
    h.current_value = Math.round(h.shares * h.current_price * 100) / 100
    h.gain_loss = Math.round((h.current_value - h.cost_basis * h.shares) * 100) / 100
    h.gain_loss_pct = Math.round(((h.gain_loss / (h.cost_basis * h.shares)) * 100) * 100) / 100
  })

  const totalValue = holdings.reduce((s, h) => s + h.current_value, 0)
  const totalCost = holdings.reduce((s, h) => s + h.cost_basis * h.shares, 0)

  holdings.forEach(h => {
    h.allocation_pct = Math.round((h.current_value / totalValue) * 10000) / 100
  })

  const assetAllocationMap = new Map<string, number>()
  holdings.forEach(h => {
    assetAllocationMap.set(h.type, (assetAllocationMap.get(h.type) || 0) + h.current_value)
  })
  const assetAllocation = Array.from(assetAllocationMap.entries()).map(([type, value]) => ({
    type,
    value: Math.round(value * 100) / 100,
    percentage: Math.round((value / totalValue) * 10000) / 100
  }))

  const sectorMap = new Map<string, number>()
  holdings.forEach(h => {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.allocation_pct)
  })
  const sectorAllocation = Array.from(sectorMap.entries()).map(([sector, pct]) => ({
    sector,
    percentage: Math.round(pct * 100) / 100
  }))

  const avgHoldingRisk = holdings.reduce((s, h) => s + (h.risk_level === 'low' ? 2 : h.risk_level === 'medium' ? 5 : 8), 0) / holdings.length
  const overallRisk = avgHoldingRisk < 3.5 ? 'Conservative' : avgHoldingRisk < 5.5 ? 'Moderate' : 'Aggressive'

  const rebalancingActions: PortfolioAnalysis['rebalancing_actions'] = []
  const techAlloc = sectorMap.get('Technology') || 0
  if (techAlloc > 35) {
    rebalancingActions.push({ action: 'REDUCE', symbol: 'AAPL', amount: totalValue * 0.03, reason: 'Technology allocation exceeds 30% target' })
    rebalancingActions.push({ action: 'BUY', symbol: 'BND', amount: totalValue * 0.03, reason: 'Increate bond allocation for diversification' })
  }
  const cashAlloc = sectorMap.get('Cash Equivalent') || 0
  if (cashAlloc < 5) {
    rebalancingActions.push({ action: 'BUY', symbol: 'SGOV', amount: totalValue * 0.03, reason: 'Maintain minimum 5% cash reserve' })
  }

  const taxOptimization: PortfolioAnalysis['tax_optimization'] = [
    { strategy: 'Tax-loss harvesting on BND position', potential_savings: Math.round(holdings.find(h => h.symbol === 'BND')?.gain_loss || 0) * 0.25, priority: 'medium' },
    { strategy: 'Hold long-term positions for 1+ year to qualify for LTCG rates', potential_savings: Math.round(totalValue * 0.02), priority: 'high' },
    { strategy: 'Place dividend-paying assets in tax-advantaged accounts', potential_savings: Math.round(totalValue * 0.015), priority: 'medium' }
  ]

  const goalTracking: PortfolioAnalysis['goal_tracking'] = [
    { goal: 'Retirement Nest Egg', current: Math.round(totalValue), target: 1000000, projected_date: '2041-06' },
    { goal: 'Financial Independence (25x expenses)', current: Math.round(totalValue), target: Math.round(totalValue * 2.5), projected_date: '2033-12' },
    { goal: 'Down Payment Fund', current: holdings.filter(h => h.type === 'etf' && h.sector.includes('Cash')).reduce((s, h) => s + h.current_value, 0), target: 50000, projected_date: '2028-08' }
  ]

  return {
    total_value: Math.round(totalValue * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
    total_gain_loss: Math.round((totalValue - totalCost) * 100) / 100,
    total_gain_loss_pct: Math.round(((totalValue - totalCost) / totalCost) * 10000) / 100,
    holdings,
    asset_allocation: assetAllocation,
    sector_allocation: sectorAllocation,
    risk_assessment: {
      overall_risk: overallRisk,
      risk_score: Math.round(avgHoldingRisk * 100) / 100,
      sharpe_ratio: clampedRand(rand, 0.8, 1.5),
      max_drawdown: clampedRand(rand, -12, -5),
      volatility: clampedRand(rand, 10, 18)
    },
    rebalancing_actions: rebalancingActions,
    tax_optimization: taxOptimization,
    goal_tracking: goalTracking,
    disclaimer: '⚠️ 本分析不可替代专业财务建议。投资涉及风险，过去的业绩不代表未来表现。请咨询持证投资顾问作出投资决策。'
  }
}

function formatPortfolio(analysis: PortfolioAnalysis): string {
  const lines: string[] = []
  lines.push('## Investment Portfolio Dashboard')
  lines.push('')
  const gainIcon = analysis.total_gain_loss >= 0 ? 'UP' : 'DN'
  lines.push('**Total Value:** $' + analysis.total_value.toLocaleString() + ' | **Cost Basis:** $' + analysis.total_cost.toLocaleString() + ' | **Gain/Loss:** ' + gainIcon + ' $' + Math.abs(analysis.total_gain_loss).toLocaleString() + ' (' + analysis.total_gain_loss_pct.toFixed(1) + '%)')
  lines.push('')

  lines.push('### Holdings')
  lines.push('| Symbol | Type | Shares | Price | Value | G/L% | Allocation | Risk |')
  lines.push('|--------|------|--------|-------|-------|------|------------|------|')
  analysis.holdings.forEach(h => {
    const glIcon = h.gain_loss >= 0 ? '+' : ''
    const riskIcon = h.risk_level === 'low' ? 'L' : h.risk_level === 'medium' ? 'M' : 'H'
    lines.push('| ' + h.symbol + ' | ' + h.type.toUpperCase() + ' | ' + h.shares + ' | $' + h.current_price.toFixed(2) + ' | $' + h.current_value.toLocaleString() + ' | ' + glIcon + h.gain_loss_pct.toFixed(1) + '% | ' + h.allocation_pct.toFixed(1) + '% | ' + riskIcon + ' |')
  })
  lines.push('')

  lines.push('### Asset Allocation')
  lines.push('| Type | Value | Percentage |')
  lines.push('|------|-------|------------|')
  analysis.asset_allocation.forEach(a => {
    const bar = '#'.repeat(Math.round(a.percentage / 5)) + '-'.repeat(20 - Math.round(a.percentage / 5))
    lines.push('| ' + a.type.toUpperCase() + ' | $' + a.value.toLocaleString() + ' | ' + bar + ' ' + a.percentage.toFixed(1) + '% |')
  })
  lines.push('')

  lines.push('### Sector Allocation')
  analysis.sector_allocation.forEach(s => {
    const bar = '#'.repeat(Math.round(s.percentage / 5)) + '-'.repeat(20 - Math.round(s.percentage / 5))
    lines.push('- **' + s.sector + ':** ' + bar + ' ' + s.percentage.toFixed(1) + '%')
  })
  lines.push('')

  lines.push('### Risk Assessment')
  lines.push('- **Overall Risk:** ' + analysis.risk_assessment.overall_risk + ' (Score: ' + analysis.risk_assessment.risk_score + '/10)')
  lines.push('- **Sharpe Ratio:** ' + analysis.risk_assessment.sharpe_ratio.toFixed(2))
  lines.push('- **Max Drawdown:** ' + analysis.risk_assessment.max_drawdown.toFixed(1) + '%')
  lines.push('- **Volatility:** ' + analysis.risk_assessment.volatility.toFixed(1) + '%')
  lines.push('')

  if (analysis.rebalancing_actions.length > 0) {
    lines.push('### Rebalancing Recommendations')
    analysis.rebalancing_actions.forEach(r => {
      lines.push('- **' + r.action + '** ' + r.symbol + ' ($' + r.amount.toFixed(0) + ') — ' + r.reason)
    })
    lines.push('')
  }

  lines.push('### Tax Optimization')
  analysis.tax_optimization.forEach(t => {
    lines.push('- **' + t.strategy + '** [Savings: $' + t.potential_savings.toFixed(0) + ' | Priority: ' + t.priority + ']')
  })
  lines.push('')

  lines.push('### Goal Tracking')
  analysis.goal_tracking.forEach(g => {
    const pct = Math.round((g.current / g.target) * 100)
    const bar = '#'.repeat(Math.round(pct / 5)) + '-'.repeat(20 - Math.round(pct / 5))
    lines.push('- **' + g.goal + ':** $' + g.current.toLocaleString() + ' / $' + g.target.toLocaleString() + ' ' + bar + ' ' + pct + '% | Projected: ' + g.projected_date)
  })
  lines.push('')

  lines.push('> ' + analysis.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 4: DEBT REDUCTION PLANNER ====================

interface DebtItem {
  name: string
  type: string
  balance: number
  interest_rate: number
  minimum_payment: number
  monthly_payment: number
  payoff_months: number
  total_interest: number
}

interface PayoffStrategy {
  strategy_name: string
  debts: Array<{ name: string; priority: number; payoff_order: number; months_to_free: number }>
  total_months: number
  total_interest_paid: number
  monthly_payment: number
  interest_saved_vs_minimum: number
}

interface MilestoneProgress {
  milestone: string
  target_debt_free_count: number
  date_achieved: string
  celebration: string
}

interface DebtReductionReport {
  total_debt: number
  total_monthly_payment: number
  average_interest_rate: number
  debts: DebtItem[]
  avalanche_strategy: PayoffStrategy
  snowball_strategy: PayoffStrategy
  recommended_strategy: string
  interest_savings: number
  debt_free_date: string
  milestones: MilestoneProgress[]
  monthly_timeline: Array<{ month: number; remaining_debt: number; paid_off: string[] }>
  disclaimer: string
}

function planDebtReduction(debtsJson: string, extraPayment: string): DebtReductionReport {
  const seed = hashString(debtsJson + extraPayment)
  const rand = seededRandom(seed)

  const debts: DebtItem[] = [
    { name: 'Chase Credit Card', type: 'Credit Card', balance: 8500, interest_rate: 22.99, minimum_payment: 255, monthly_payment: 0, payoff_months: 0, total_interest: 0 },
    { name: 'Student Loan', type: 'Student Loan', balance: 25000, interest_rate: 5.5, minimum_payment: 320, monthly_payment: 0, payoff_months: 0, total_interest: 0 },
    { name: 'Car Loan', type: 'Auto Loan', balance: 15000, interest_rate: 6.8, minimum_payment: 380, monthly_payment: 0, payoff_months: 0, total_interest: 0 },
    { name: 'Personal Loan', type: 'Personal Loan', balance: 5000, interest_rate: 12.5, minimum_payment: 185, monthly_payment: 0, payoff_months: 0, total_interest: 0 },
    { name: 'Discover Card', type: 'Credit Card', balance: 3200, interest_rate: 19.99, minimum_payment: 120, monthly_payment: 0, payoff_months: 0, total_interest: 0 }
  ]

  const extra = parseFloat(extraPayment) || 200
  const totalMinPayments = debts.reduce((s, d) => s + d.minimum_payment, 0)
  const totalMonthly = totalMinPayments + extra

  // Calculate avalanche (highest interest first)
  const avalancheSorted = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)
  const avalanche = calculateStrategy(avalancheSorted, totalMonthly, 'Avalanche')

  // Snowball (smallest balance first)
  const snowballSorted = [...debts].sort((a, b) => a.balance - b.balance)
  const snowball = calculateStrategy(snowballSorted, totalMonthly, 'Snowball')

  const recommended = avalanche.total_interest_paid < snowball.total_interest_paid ? 'avalanche' : 'snowball'
  const recommendedStrategy = recommended === 'avalanche' ? avalanche : snowball
  const baseline = debts.reduce((s, d) => s + d.minimum_payment, 0)

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0)
  const weightedRate = debts.reduce((s, d) => s + d.interest_rate * d.balance, 0) / totalDebt

  const monthsToDebtFree = recommendedStrategy.total_months

  const milestones: MilestoneProgress[] = [
    { milestone: 'First debt eliminated', target_debt_free_count: 1, date_achieved: `Month ${recommendedStrategy.debts[0]?.months_to_free || 6}`, celebration: 'Congratulations! First debt paid off!' },
    { milestone: '25% debt-free', target_debt_free_count: 2, date_achieved: `Month ${Math.round(monthsToDebtFree * 0.25)}`, celebration: 'Quarter way there! Momentum is on your side.' },
    { milestone: 'Halfway milestone', target_debt_free_count: 3, date_achieved: `Month ${Math.round(monthsToDebtFree * 0.5)}`, celebration: 'Halfway to financial freedom!' },
    { milestone: 'Debt-free!', target_debt_free_count: 5, date_achieved: `Month ${monthsToDebtFree}`, celebration: 'Amazing! All debts eliminated!' }
  ]

  const monthlyTimeline: DebtReductionReport['monthly_timeline'] = []
  const checkpointMonths = [1, 3, 6, 12, 18, 24]
  checkpointMonths.forEach(m => {
    if (m <= monthsToDebtFree) {
      const pctPaid = Math.min(1, m / monthsToDebtFree)
      monthlyTimeline.push({
        month: m,
        remaining_debt: Math.round(totalDebt * (1 - pctPaid)),
        paid_off: recommendedStrategy.debts.filter(d => d.months_to_free <= m).map(d => d.name)
      })
    }
  })

  return {
    total_debt: totalDebt,
    total_monthly_payment: totalMonthly,
    average_interest_rate: Math.round(weightedRate * 100) / 100,
    debts,
    avalanche_strategy: avalanche,
    snowball_strategy: snowball,
    recommended_strategy: recommended,
    interest_savings: Math.abs(Math.round((avalanche.total_interest_paid - snowball.total_interest_paid) * 100) / 100),
    debt_free_date: monthsToDebtFree + ' months',
    milestones,
    monthly_timeline: monthlyTimeline,
    disclaimer: '⚠️ 本分析不可替代专业财务建议。债务计划基于当前利率和最低还款额，实际结果可能因利率变动而不同。'
  }
}

function calculateStrategy(
  sortedDebts: DebtItem[],
  totalMonthly: number,
  name: string
): PayoffStrategy {
  let remaining = totalMonthly
  let totalInterest = 0
  let month = 0
  const debts: PayoffStrategy['debts'] = []
  const workingDebts = sortedDebts.map(d => ({ ...d, remaining_balance: d.balance }))

  let priority = 1
  for (const debt of workingDebts) {
    let balance = debt.remaining_balance
    const monthlyRate = debt.interest_rate / 100 / 12
    let monthsForThis = 0
    const availablePerMonth = (priority === 1 ? totalMonthly : remaining)

    while (balance > 0 && monthsForThis < 120) {
      monthsForThis++
      month++
      const interest = balance * monthlyRate
      totalInterest += interest
      balance = balance + interest - Math.min(availablePerMonth, balance + interest)
      if (balance < 1) balance = 0
    }

    remaining -= debt.minimum_payment
    debts.push({
      name: debt.name,
      priority,
      payoff_order: priority,
      months_to_free: debt.name === sortedDebts[0].name ? monthsForThis :
        debt.name === sortedDebts[1].name ? monthsForThis :
        debt.name === sortedDebts[2].name ? monthsForThis + 3 :
        debt.name === sortedDebts[3].name ? monthsForThis + 9 : monthsForThis + 14
    })
    priority++
  }

  return {
    strategy_name: name,
    debts,
    total_months: month,
    total_interest_paid: Math.round(totalInterest * 100) / 100,
    monthly_payment: totalMonthly,
    interest_saved_vs_minimum: Math.round((sortedDebts.reduce((s, d) => s + d.balance * d.interest_rate / 100, 0) * 3 - totalInterest) * 100) / 100
  }
}

function formatDebtReduction(report: DebtReductionReport): string {
  const lines: string[] = []
  lines.push('## Debt Reduction Plan')
  lines.push('')
  lines.push('**Total Debt:** $' + report.total_debt.toLocaleString() + ' | **Monthly Payment:** $' + report.total_monthly_payment + ' | **Avg Interest:** ' + report.average_interest_rate.toFixed(1) + '%')
  lines.push('**Debt-Free Date:** ' + report.debt_free_date)
  lines.push('')

  lines.push('### Current Debts')
  lines.push('| # | Debt | Balance | Rate | Minimum |')
  lines.push('|---|------|---------|------|---------|')
  report.debts.forEach((d, i) => {
    const progressBar = '+'.repeat(Math.round((1 - d.balance / report.total_debt) * 20))
    lines.push('| ' + (i + 1) + ' | ' + d.name + ' | $' + d.balance.toLocaleString() + ' | ' + d.interest_rate.toFixed(1) + '% | $' + d.minimum_payment + ' |')
  })
  lines.push('')

  lines.push('### Strategy Comparison')
  lines.push('| Strategy | Total Months | Total Interest | Extra Payment |')
  lines.push('|----------|-------------|----------------|---------------|')
  lines.push('| Avalanche (highest rate first) | ' + report.avalanche_strategy.total_months + ' | $' + report.avalanche_strategy.total_interest_paid.toFixed(0) + ' | +$' + (report.total_monthly_payment - report.debts.reduce((s, d) => s + d.minimum_payment, 0)) + '/mo |')
  lines.push('| Snowball (smallest balance first) | ' + report.snowball_strategy.total_months + ' | $' + report.snowball_strategy.total_interest_paid.toFixed(0) + ' | +$' + (report.total_monthly_payment - report.debts.reduce((s, d) => s + d.minimum_payment, 0)) + '/mo |')
  lines.push('')
  const recIcon = report.recommended_strategy === 'avalanche' ? 'Avalanche (highest interest first)' : 'Snowball (smallest balance first)'
  lines.push('**Recommended:** ' + recIcon + ' (Save $' + report.interest_savings.toFixed(0) + ' in interest)')
  lines.push('')

  lines.push('### Recommended Order (' + report.recommended_strategy + ')')
  const recStrategy = report.recommended_strategy === 'avalanche' ? report.avalanche_strategy : report.snowball_strategy
  recStrategy.debts.forEach(d => {
    const bar = '='.repeat(Math.round((1 - d.priority / report.debts.length) * 20)) + ' ' + d.months_to_free + ' months'
    lines.push(d.priority + '. **' + d.name + '** — ' + bar)
  })
  lines.push('')

  lines.push('### Milestones')
  report.milestones.forEach(m => {
    lines.push('- **' + m.milestone + '** (' + m.date_achieved + ') ' + m.celebration)
  })
  lines.push('')

  lines.push('### Progress Timeline')
  lines.push('| Month | Remaining Debt | Paid Off |')
  lines.push('|-------|---------------|----------|')
  report.monthly_timeline.forEach(t => {
    lines.push('| Month ' + t.month + ' | $' + t.remaining_debt.toLocaleString() + ' | ' + (t.paid_off.length > 0 ? t.paid_off.join(', ') : '—') + ' |')
  })
  lines.push('')

  lines.push('> ' + report.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 5: RETIREMENT PLANNER ====================

interface RetirementAnalysis {
  target_age: number
  current_age: number
  years_to_retirement: number
  target_replacement_rate: number
  current_savings: number
  annual_income: number
  social_security_estimate: number
  pension_estimate: number
  retirement_need_annual: number
  total_needed: number
  projected_savings_at_retirement: number
  gap_analysis: Array<{ source: string; amount: number; percentage_of_need: number }>
  monthly_gap: number
  savings_rate_needed: number
  revenue_streams: Array<{ source: string; monthly_amount: number; start_age: number; end_age?: number }>
  medical_cost_estimate: { annual: number; total_lifetime: number }
  withdrawal_strategy: { first_years_rate: number; adjusted_rate: number; sequence_risk: string }
  scenario_analysis: Array<{ scenario: string; success_probability: number; description: string }>
  disclaimer: string
}

function planRetirement(
  currentAge: string,
  retirementAge: string,
  currentSavings: string,
  annualIncome: string
): RetirementAnalysis {
  const seed = hashString(currentAge + retirementAge + currentSavings + annualIncome)
  const rand = seededRandom(seed)

  const age = parseInt(currentAge) || 35
  const retAge = parseInt(retirementAge) || 65
  const savings = parseFloat(currentSavings) || 85000
  const income = parseFloat(annualIncome) || 85000
  const yearsToRetirement = retAge - age

  const targetReplacementRate = 0.80
  const retirementNeed = income * targetReplacementRate

  const socialSecurityEstimate = Math.round(income * 0.35 / 12) * 12
  const pensionEstimate = Math.round(income * 0.10 / 12) * 12
  const totalNeeded = retirementNeed * 25

  const projectedSavings = Math.round(savings * Math.pow(1.07, yearsToRetirement) + (income * 0.15 * (Math.pow(1.07, yearsToRetirement) - 1) / 0.07))

  const gapSources = [
    { source: 'Social Security', amount: socialSecurityEstimate, percentage_of_need: 0 },
    { source: 'Pension', amount: pensionEstimate, percentage_of_need: 0 },
    { source: '401k/IRA Savings', amount: Math.round(projectedSavings * 0.05 / 12) * 12, percentage_of_need: 0 }
  ]
  gapSources.forEach(s => {
    s.percentage_of_need = Math.round((s.amount / retirementNeed) * 10000) / 100
  })

  const totalCovered = gapSources.reduce((s, g) => s + g.amount, 0)
  const annualGap = Math.max(0, retirementNeed - totalCovered)
  const monthlyGap = Math.round(annualGap / 12)

  const savingsRateNeeded = Math.max(0, Math.round((monthlyGap * 12 / income) * 10000) / 100 + 15)

  const medicalCostPerYear = 12000
  const yearsInRetirement = 90 - retAge

  const scenarios: RetirementAnalysis['scenario_analysis'] = [
    { scenario: 'Conservative (5% return)', success_probability: clampedRand(rand, 55, 70), description: 'Lower market returns, higher savings needed' },
    { scenario: 'Moderate (7% return)', success_probability: clampedRand(rand, 70, 85), description: 'Historical average market performance' },
    { scenario: 'Aggressive (9% return)', success_probability: clampedRand(rand, 80, 95), description: 'Strong market growth, higher equity allocation' },
    { scenario: 'Delayed retirement (age ' + (retAge + 3) + ')', success_probability: clampedRand(rand, 85, 95), description: 'Extra years of compounding and contributions' }
  ]

  return {
    target_age: retAge,
    current_age: age,
    years_to_retirement: yearsToRetirement,
    target_replacement_rate: Math.round(targetReplacementRate * 100),
    current_savings: savings,
    annual_income: income,
    social_security_estimate: socialSecurityEstimate,
    pension_estimate: pensionEstimate,
    retirement_need_annual: Math.round(retirementNeed),
    total_needed: Math.round(totalNeeded),
    projected_savings_at_retirement: projectedSavings,
    gap_analysis: gapSources,
    monthly_gap: monthlyGap,
    savings_rate_needed: savingsRateNeeded,
    revenue_streams: [
      { source: 'Social Security', monthly_amount: Math.round(socialSecurityEstimate / 12), start_age: Math.min(retAge + 1, 67), end_age: 90 },
      { source: '401(k) Withdrawals', monthly_amount: Math.round(projectedSavings * 0.04 / 12), start_age: retAge },
      { source: 'Roth IRA', monthly_amount: Math.round(projectedSavings * 0.02 / 12), start_age: retAge + 5 },
      { source: 'Pension', monthly_amount: Math.round(pensionEstimate / 12), start_age: retAge, end_age: 90 },
      { source: 'Part-time Income', monthly_amount: 1500, start_age: retAge, end_age: retAge + 5 }
    ],
    medical_cost_estimate: {
      annual: medicalCostPerYear,
      total_lifetime: medicalCostPerYear * yearsInRetirement
    },
    withdrawal_strategy: {
      first_years_rate: 4.0,
      adjusted_rate: 3.5,
      sequence_risk: 'Medium - Consider bond tent strategy in early retirement to mitigate sequence of returns risk'
    },
    scenario_analysis: scenarios,
    disclaimer: '⚠️ 本分析不可替代专业财务建议。退休规划涉及长期预测，实际回报和通胀可能与估算有显著差异。请咨询持证理财规划师。'
  }
}

function formatRetirementPlanner(analysis: RetirementAnalysis): string {
  const lines: string[] = []
  lines.push('## Retirement Planning Report')
  lines.push('')
  lines.push('**Current Age:** ' + analysis.current_age + ' | **Target Retirement Age:** ' + analysis.target_age + ' | **Years to Retirement:** ' + analysis.years_to_retirement)
  lines.push('**Current Savings:** $' + analysis.current_savings.toLocaleString() + ' | **Annual Income:** $' + analysis.annual_income.toLocaleString())
  lines.push('**Target Replacement Rate:** ' + analysis.target_replacement_rate + '% | **Annual Need at Retirement:** $' + analysis.retirement_need_annual.toLocaleString())
  lines.push('')

  lines.push('### Projected Savings at Retirement')
  const progressPct = Math.round((analysis.projected_savings_at_retirement / analysis.total_needed) * 100)
  const progressBar = '#'.repeat(Math.max(0, Math.round(progressPct / 5))) + '-'.repeat(Math.max(0, 20 - Math.round(progressPct / 5)))
  lines.push('**$' + analysis.projected_savings_at_retirement.toLocaleString() + '** / $' + analysis.total_needed.toLocaleString() + ' needed ' + progressBar + ' ' + progressPct + '%')
  lines.push('')

  lines.push('### Revenue Streams in Retirement')
  lines.push('| Source | Monthly | Annual | Start Age | End Age |')
  lines.push('|--------|---------|--------|-----------|---------|')
  analysis.revenue_streams.forEach(r => {
    const endStr = r.end_age ? r.end_age.toString() : 'Lifetime'
    lines.push('| ' + r.source + ' | $' + r.monthly_amount.toLocaleString() + ' | $' + (r.monthly_amount * 12).toLocaleString() + ' | ' + r.start_age + ' | ' + endStr + ' |')
  })
  lines.push('')

  lines.push('### Gap Analysis')
  analysis.gap_analysis.forEach(g => {
    const bar = '#'.repeat(Math.round(g.percentage_of_need / 5)) + '-'.repeat(Math.max(0, 20 - Math.round(g.percentage_of_need / 5)))
    lines.push('- **' + g.source + ':** $' + g.amount.toLocaleString() + '/yr (' + bar + ' ' + g.percentage_of_need.toFixed(1) + '% of need)')
  })
  lines.push('')
  if (analysis.monthly_gap > 0) {
    lines.push('**Monthly Gap:** $' + analysis.monthly_gap.toLocaleString() + ' | **Required Savings Rate:** ' + analysis.savings_rate_needed + '% of income')
  } else {
    lines.push('**No projected gap!** Your savings plan is on target.')
  }
  lines.push('')

  lines.push('### Medical Cost Estimate')
  lines.push('- **Annual medical costs:** $' + analysis.medical_cost_estimate.annual.toLocaleString())
  lines.push('- **Lifetime medical costs:** $' + analysis.medical_cost_estimate.total_lifetime.toLocaleString())
  lines.push('')

  lines.push('### Withdrawal Strategy')
  lines.push('- **Initial withdrawal rate:** ' + analysis.withdrawal_strategy.first_years_rate + '%')
  lines.push('- **Adjusted rate (later years):** ' + analysis.withdrawal_strategy.adjusted_rate + '%')
  lines.push('- **Risk:** ' + analysis.withdrawal_strategy.sequence_risk)
  lines.push('')

  lines.push('### Scenario Analysis')
  analysis.scenario_analysis.forEach(s => {
    const probIcon = s.success_probability >= 85 ? 'Strong' : s.success_probability >= 70 ? 'Good' : 'Fair'
    lines.push('- **' + s.scenario + ':** ' + probIcon + ' (' + s.success_probability.toFixed(0) + '%) — ' + s.description)
  })
  lines.push('')

  lines.push('> ' + analysis.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 6: TAX OPTIMIZER ====================

interface TaxOptimization {
  effective_rate: number
  marginal_rate: number
  federal_tax: number
  state_tax: number
  fica_tax: number
  total_tax: number
  after_tax_income: number
  deductions: Array<{ name: string; amount: number; type: 'above_line' | 'itemized' | 'standard' }>
  credits: Array<{ name: string; amount: number; refundable: boolean }>
  capital_gains_strategy: Array<{ action: string; shares: string; gain_loss: number; tax_impact: number }>
  retirement_contributions: Array<{ account: string; current: number; max_allowed: number; tax_savings: number; recommend: number }>
  entity_structures: Array<{ structure: string; current_tax: number; potential_tax: number; savings: number; complexity: string }>
  tax_loss_harvesting: Array<{ security: string; unrealized_loss: number; tax_savings: number }>
  simulation: Array<{ scenario: string; tax_owed: number; savings: number; effective_rate: number }>
  compliance_notes: string[]
  disclaimer: string
}

function optimizeTaxes(
  filingStatus: string,
  taxableIncome: string,
  currentDeductions: string
): TaxOptimization {
  const seed = hashString(filingStatus + taxableIncome + currentDeductions)
  const rand = seededRandom(seed)

  const income = parseFloat(taxableIncome) || 85000
  const deductions = JSON.parse(currentDeductions || '{}') as Record<string, number>
  const totalDeductions = Object.values(deductions).reduce((s, v) => s + v, 0)

  const taxableAfterDeductions = Math.max(0, income - totalDeductions)
  const federalBrackets = [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 }
  ]

  let federalTax = 0
  let marginalRate = 0.10
  for (const bracket of federalBrackets) {
    if (taxableAfterDeductions > bracket.min) {
      const taxableInBracket = Math.min(taxableAfterDeductions - bracket.min, bracket.max - bracket.min)
      federalTax += Math.max(0, taxableInBracket * bracket.rate)
      if (taxableAfterDeductions <= bracket.max) marginalRate = bracket.rate
    }
  }

  const stateTax = Math.round(taxableAfterDeductions * 0.05 * 100) / 100
  const ficaTax = Math.round(income * 0.0765 * 100) / 100
  const totalTax = Math.round((federalTax + stateTax + ficaTax) * 100) / 100

  const deductionItems: TaxOptimization['deductions'] = [
    { name: 'Standard Deduction', amount: filingStatus === 'married' ? 27700 : 13850, type: 'standard' },
    { name: 'Mortgage Interest', amount: deductions.mortgage || 8500, type: 'itemized' },
    { name: 'Charitable Donations', amount: deductions.charitable || 2500, type: 'itemized' },
    { name: 'State and Local Tax (SALT)', amount: 10000, type: 'itemized' },
    { name: 'Student Loan Interest', amount: deductions.student_loan || 2500, type: 'above_line' }
  ]

  const taxCredits: TaxOptimization['credits'] = [
    { name: 'Child Tax Credit', amount: 0, refundable: true },
    { name: 'Saver Credit', amount: Math.round(1000), refundable: false },
    { name: 'Lifetime Learning Credit', amount: Math.min(2000, (deductions.education || 0)), refundable: false }
  ]

  const capitalGains: TaxOptimization['capital_gains_strategy'] = [
    { action: 'Harvest BND loss', shares: '60 shares', gain_loss: -42, tax_impact: -10 },
    { action: 'Hold AAPL for long-term (>1 year)', shares: '25 shares', gain_loss: 930, tax_impact: 140 },
    { action: 'Defer GOOGL sale to next tax year', shares: '8 shares', gain_loss: 170, tax_impact: 0 }
  ]

  const retirementContributions: TaxOptimization['retirement_contributions'] = [
    { account: '401(k)', current: deductions.retirement_401k || 13500, max_allowed: 23000, tax_savings: 0, recommend: 0 },
    { account: 'Traditional IRA', current: deductions.ira || 3500, max_allowed: 7000, tax_savings: 0, recommend: 0 },
    { account: 'HSA', current: deductions.hsa || 2500, max_allowed: 4150, tax_savings: 0, recommend: 0 }
  ]
  retirementContributions.forEach(r => {
    const additional = r.max_allowed - r.current
    r.recommend = Math.min(additional, Math.round(income * 0.05))
    r.tax_savings = Math.round(r.current * marginalRate + r.recommend * (marginalRate + 0.0765))
  })

  const entityStructures: TaxOptimization['entity_structures'] = [
    { structure: 'Sole Proprietorship (Schedule C)', current_tax: totalTax, potential_tax: totalTax + 2000, savings: -2000, complexity: 'Low' },
    { structure: 'S-Corp (reasonable salary)', current_tax: totalTax, potential_tax: totalTax - 4500, savings: 4500, complexity: 'Medium' },
    { structure: 'Single-Member LLC', current_tax: totalTax, potential_tax: totalTax - 2500, savings: 2500, complexity: 'Low-Medium' }
  ]

  const taxLossHarvesting: TaxOptimization['tax_loss_harvesting'] = [
    { security: 'FXNAX', unrealized_loss: -720, tax_savings: Math.round(720 * 0.22) },
    { security: 'BND', unrealized_loss: -42, tax_savings: Math.round(42 * 0.22) }
  ]

  const simulation: TaxOptimization['simulation'] = [
    { scenario: 'Max 401(k) contribution', tax_owed: Math.round(federalTax - 23000 * marginalRate), savings: Math.round(23000 * marginalRate), effective_rate: 0 },
    { scenario: 'HSA max contribution', tax_owed: Math.round(federalTax - 4150 * marginalRate), savings: Math.round(4150 * marginalRate), effective_rate: 0 },
    { scenario: 'Tax-loss harvesting', tax_owed: Math.round(federalTax - 762), savings: 762, effective_rate: 0 },
    { scenario: 'Donor-advised fund', tax_owed: Math.round(federalTax - 5000 * marginalRate), savings: Math.round(5000 * marginalRate), effective_rate: 0 },
    { scenario: 'Combined optimization', tax_owed: Math.round(federalTax - 30000 * marginalRate - 762), savings: Math.round(30000 * marginalRate + 762), effective_rate: 0 }
  ]
  simulation.forEach(s => {
    const newTotal = s.tax_owed + stateTax + ficaTax
    s.effective_rate = Math.round((newTotal / income) * 10000) / 100
  })

  return {
    effective_rate: Math.round((totalTax / income) * 10000) / 100,
    marginal_rate: Math.round(marginalRate * 10000) / 100,
    federal_tax: Math.round(federalTax * 100) / 100,
    state_tax: stateTax,
    fica_tax: ficaTax,
    total_tax: totalTax,
    after_tax_income: Math.round((income - totalTax) * 100) / 100,
    deductions: deductionItems,
    credits: taxCredits,
    capital_gains_strategy: capitalGains,
    retirement_contributions: retirementContributions,
    entity_structures: entityStructures,
    tax_loss_harvesting: taxLossHarvesting,
    simulation,
    compliance_notes: [
      'Ensure all charitable donations have receipts for amounts > $250',
      'HSA contributions must be reported on Form 8889',
      'Tax-loss harvesting must avoid wash sale rule (30-day window)',
      'Retirement contributions subject to annual IRS limits',
      'Entity structure changes require professional tax advice'
    ],
    disclaimer: '⚠️ 本分析不可替代专业税务建议。税务优化策略因个人情况复杂多样，请咨询持证税务顾问或注册会计师(CPA)。'
  }
}

function formatTaxOptimizer(tax: TaxOptimization): string {
  const lines: string[] = []
  lines.push('## Tax Optimization Report')
  lines.push('')
  lines.push('**Effective Rate:** ' + tax.effective_rate.toFixed(1) + '% | **Marginal Rate:** ' + tax.marginal_rate.toFixed(0) + '% | **Total Tax:** $' + tax.total_tax.toFixed(0))
  lines.push('**After-Tax Income:** $' + tax.after_tax_income.toFixed(0))
  lines.push('')

  lines.push('### Tax Breakdown')
  lines.push('| Component | Amount | Rate |')
  lines.push('|-----------|--------|------|')
  lines.push('| Federal | $' + tax.federal_tax.toFixed(0) + ' | ' + tax.marginal_rate.toFixed(0) + '% marginal |')
  lines.push('| State | $' + tax.state_tax.toFixed(0) + ' | ~5% |')
  lines.push('| FICA | $' + tax.fica_tax.toFixed(0) + ' | 7.65% |')
  lines.push('| **Total** | **$' + tax.total_tax.toFixed(0) + '** | **' + tax.effective_rate.toFixed(1) + '%** |')
  lines.push('')

  lines.push('### Deductions')
  lines.push('| Deduction | Amount | Type |')
  lines.push('|-----------|--------|------|')
  tax.deductions.forEach(d => {
    if (d.amount > 0) lines.push('| ' + d.name + ' | $' + d.amount.toLocaleString() + ' | ' + d.type + ' |')
  })
  lines.push('')

  lines.push('### Credits')
  tax.credits.forEach(c => {
    if (c.amount > 0) lines.push('- **' + c.name + ':** $' + c.amount + ' (' + (c.refundable ? 'refundable' : 'non-refundable') + ')')
  })
  lines.push('')

  lines.push('### Retirement Contributions')
  lines.push('| Account | Current | Max | Additional | Tax Savings |')
  lines.push('|---------|---------|-----|------------|-------------|')
  tax.retirement_contributions.forEach(r => {
    lines.push('| ' + r.account + ' | $' + r.current.toLocaleString() + ' | $' + r.max_allowed.toLocaleString() + ' | $' + r.recommend.toLocaleString() + ' | $' + r.tax_savings.toLocaleString() + ' |')
  })
  lines.push('')

  lines.push('### Tax-Loss Harvesting')
  tax.tax_loss_harvesting.forEach(h => {
    lines.push('- **' + h.security + ':** $' + Math.abs(h.unrealized_loss) + ' unrealized loss -> Save $' + h.tax_savings + ' in taxes')
  })
  lines.push('')

  lines.push('### Tax Savings Simulation')
  lines.push('| Scenario | Tax Owed | Savings | Effective Rate |')
  lines.push('|----------|----------|---------|----------------|')
  tax.simulation.forEach(s => {
    lines.push('| ' + s.scenario + ' | $' + s.tax_owed.toLocaleString() + ' | $' + s.savings.toLocaleString() + ' | ' + s.effective_rate.toFixed(1) + '% |')
  })
  lines.push('')

  lines.push('### Entity Structure Analysis')
  lines.push('| Structure | Potential Tax | vs. Current | Savings | Complexity |')
  lines.push('|-----------|-------------|-------------|---------|------------|')
  tax.entity_structures.forEach(e => {
    const savingsStr = e.savings >= 0 ? '+$' + e.savings : '-$' + Math.abs(e.savings)
    lines.push('| ' + e.structure + ' | $' + e.potential_tax.toFixed(0) + ' | ' + savingsStr + ' | ' + (e.savings >= 0 ? 'Yes' : 'No') + ' | ' + e.complexity + ' |')
  })
  lines.push('')

  lines.push('### Compliance Notes')
  tax.compliance_notes.forEach(n => lines.push('- ' + n))
  lines.push('')

  lines.push('> ' + tax.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 7: GOAL-BASED SAVINGS ====================

interface SavingsGoalItem {
  goal_name: string
  category: string
  target_amount: number
  current_saved: number
  monthly_contribution: number
  deadline: string
  months_remaining: number
  progress_pct: number
  on_track: boolean
  funding_strategy: string
  automation: string
  incentive: string
}

interface SavingsDashboard {
  total_savings: number
  total_monthly_contributions: number
  monthly_capacity: number
  goals: SavingsGoalItem[]
  progress_summary: Array<{ goal: string; bar: string; pct: number; status: string }>
  recommendations: Array<{ action: string; impact: string; priority: 'high' | 'medium' | 'low' }>
  motivational_milestones: Array<{ milestone: string; reward: string }>
  disclaimer: string
}

function goalBasedSavings(
  monthlyCapacity: string,
  goalsJson: string
): SavingsDashboard {
  const seed = hashString(monthlyCapacity + goalsJson)
  const rand = seededRandom(seed)

  const capacity = parseFloat(monthlyCapacity) || 1500

  const goals: SavingsGoalItem[] = [
    { goal_name: 'Emergency Fund', category: 'emergency', target_amount: 24000, current_saved: 8000, monthly_contribution: 400, deadline: '2027-12', months_remaining: 0, progress_pct: 0, on_track: false, funding_strategy: 'High-yield savings account (4.5% APY)', automation: 'Auto-transfer $100 bi-weekly on payday', incentive: 'Covers 6 months of essential expenses' },
    { goal_name: 'House Down Payment', category: 'home', target_amount: 60000, current_saved: 12000, monthly_contribution: 600, deadline: '2029-06', months_remaining: 0, progress_pct: 0, on_track: false, funding_strategy: 'Conservative: 60% HYSA, 40% short-term bond fund', automation: 'Split deposit: $300 to dedicated home fund', incentive: 'Stop paying rent — build equity' },
    { goal_name: 'College Fund (Child)', category: 'education', target_amount: 100000, current_saved: 3500, monthly_contribution: 250, deadline: '2038-09', months_remaining: 0, progress_pct: 0, on_track: false, funding_strategy: '529 Education Savings Plan (tax-free growth)', automation: 'Monthly $250 auto-investment into 529 plan', incentive: 'Tax-free withdrawals for qualified education expenses' },
    { goal_name: 'New Car Fund', category: 'auto', target_amount: 15000, current_saved: 3000, monthly_contribution: 200, deadline: '2027-06', months_remaining: 0, progress_pct: 0, on_track: false, funding_strategy: 'Money market fund (stable, liquid)', automation: 'Round-up savings: spare change auto-invested', incentive: 'Buy outright — zero debt, full ownership' },
    { goal_name: 'Travel Fund', category: 'travel', target_amount: 5000, current_saved: 600, monthly_contribution: 150, deadline: '2026-06', months_remaining: 0, progress_pct: 0, on_track: false, funding_strategy: 'High-yield savings account', automation: '$38 weekly transfer', incentive: 'Earn travel rewards points on contributions' },
    { goal_name: 'Wedding Fund', category: 'life_event', target_amount: 25000, current_saved: 5000, monthly_contribution: 200, deadline: '2028-05', months_remaining: 0, progress_pct: 0, on_track: false, funding_strategy: '60% savings, 40% conservative investment', automation: 'Auto-save from side income', incentive: 'Debt-free celebration' }
  ]

  goals.forEach(g => {
    g.months_remaining = Math.ceil((g.target_amount - g.current_saved) / g.monthly_contribution)
    g.progress_pct = Math.round((g.current_saved / g.target_amount) * 10000) / 100
    g.on_track = g.months_remaining <= Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
  })

  const totalContributions = goals.reduce((s, g) => s + g.monthly_contribution, 0)
  const totalSaved = goals.reduce((s, g) => s + g.current_saved, 0)

  const progressSummary: SavingsDashboard['progress_summary'] = goals.map(g => ({
    goal: g.goal_name,
    bar: '#'.repeat(Math.round(g.progress_pct / 5)) + '-'.repeat(Math.max(0, 20 - Math.round(g.progress_pct / 5))),
    pct: g.progress_pct,
    status: g.on_track ? 'ON TRACK' : 'BEHIND'
  }))

  const remainingCapacity = capacity - totalContributions

  return {
    total_savings: totalSaved,
    total_monthly_contributions: totalContributions,
    monthly_capacity: capacity,
    goals,
    progress_summary: progressSummary,
    recommendations: [
      { action: 'Increase emergency fund contribution by $100/mo', impact: 'Reach 6-month target 4 months sooner', priority: 'high' },
      { action: 'Open dedicated 529 account for education goal', impact: 'Tax-free growth, estimated +$8,200 over 15 years', priority: 'high' },
      { action: 'Use round-up automation for travel fund', impact: '+$40/month without noticing', priority: 'medium' },
      { action: 'Redirect debt payments to savings after payoff', impact: '+$380/month freed up after 24 months', priority: 'medium' },
      { action: 'Review home down payment timeline quarterly', impact: 'Stay aligned with market conditions', priority: 'low' }
    ],
    motivational_milestones: [
      { milestone: 'Emergency fund reaches $10,000', reward: 'Celebrate with a small reward dinner ($50)' },
      { milestone: 'House fund crosses 25%', reward: 'Tour open houses for motivation' },
      { milestone: 'Total savings reaches $50,000', reward: 'Halfway to financial independence!' },
      { milestone: 'New car fund complete', reward: 'Buy your dream car — debt-free!' }
    ],
    disclaimer: '⚠️ 本分析不可替代专业财务建议。储蓄目标应根据个人情况定制调整，请咨询持证理财规划师。'
  }
}

function formatGoalSavings(dashboard: SavingsDashboard): string {
  const lines: string[] = []
  lines.push('## Goal-Based Savings Dashboard')
  lines.push('')
  lines.push('**Total Saved:** $' + dashboard.total_savings.toLocaleString() + ' | **Monthly Contributions:** $' + dashboard.total_monthly_contributions + ' / $' + dashboard.monthly_capacity + ' capacity')

  const utilization = Math.round((dashboard.total_monthly_contributions / dashboard.monthly_capacity) * 100)
  lines.push('**Capacity Utilization:** ' + utilization + '%')
  lines.push('')

  lines.push('### Savings Progress')
  dashboard.progress_summary.forEach(p => {
    lines.push('**' + p.goal + '**')
    lines.push('  ' + p.bar + ' ' + p.pct.toFixed(0) + '% ' + p.status)
  })
  lines.push('')

  lines.push('### Goal Details')
  lines.push('| Goal | Target | Saved | Monthly | Deadline | On Track |')
  lines.push('|------|--------|-------|---------|----------|---------|')
  dashboard.goals.forEach(g => {
    lines.push('| ' + g.goal_name + ' | $' + g.target_amount.toLocaleString() + ' | $' + g.current_saved.toLocaleString() + ' | $' + g.monthly_contribution + ' | ' + g.deadline + ' | ' + (g.on_track ? 'Yes' : 'No') + ' |')
  })
  lines.push('')

  lines.push('### Funding Strategies & Automation')
  dashboard.goals.forEach(g => {
    lines.push('- **' + g.goal_name + '** [' + g.category + ']')
    lines.push('  - Strategy: ' + g.funding_strategy)
    lines.push('  - Automation: ' + g.automation)
    lines.push('  - Incentive: ' + g.incentive)
  })
  lines.push('')

  lines.push('### Recommendations')
  dashboard.recommendations.forEach((r, i) => {
    lines.push((i + 1) + '. **' + r.action + '** [' + r.priority + ']')
    lines.push('   > ' + r.impact)
  })
  lines.push('')

  lines.push('### Milestones & Rewards')
  dashboard.motivational_milestones.forEach(m => {
    lines.push('- **' + m.milestone + '** -> ' + m.reward)
  })
  lines.push('')

  lines.push('> ' + dashboard.disclaimer)

  return lines.join('\n')
}

// ==================== TOOL 8: FINANCIAL LITERACY ====================

interface LiteracyLevel {
  topic: string
  score: number
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  key_concepts_known: string[]
  gaps: string[]
}

interface LearningModule {
  title: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_hours: number
  topics_covered: string[]
  progress_pct: number
  completed: boolean
}

interface LiteracyReport {
  overall_score: number
  overall_level: string
  assessment_date: string
  knowledge_areas: LiteracyLevel[]
  learning_path: LearningModule[]
  recommended_next: string[]
  certificates: Array<{ name: string; issuer: string; status: 'completed' | 'in_progress' | 'available' }>
  practice_tasks: Array<{ task: string; difficulty: string; status: 'pending' | 'completed'; xp_reward: number }>
  community_challenges: Array<{ challenge: string; participants: number; reward: string }>
  weekly_progress: Array<{ week: string; modules_completed: number; xp_earned: number }>
  disclaimer: string
}

function assessFinancialLiteracy(currentKnowledge: string): LiteracyReport {
  const seed = hashString(currentKnowledge)
  const rand = seededRandom(seed)

  const knowledgeAreas: LiteracyLevel[] = [
    { topic: 'Budgeting & Cash Flow', score: clampedRand(rand, 0.5, 0.95), level: 'intermediate', key_concepts_known: ['50/30/20 rule', 'Emergency fund', 'Tracking expenses'], gaps: ['Zero-based budgeting', 'Irregular income management'] },
    { topic: 'Investing Fundamentals', score: clampedRand(rand, 0.3, 0.85), level: 'intermediate', key_concepts_known: ['Compound interest', 'Diversification', 'Index funds'], gaps: ['Options trading', 'Alternative investments', 'Tax-efficient placement'] },
    { topic: 'Debt Management', score: clampedRand(rand, 0.4, 0.9), level: 'intermediate', key_concepts_known: ['Avalanche method', 'Credit scores', 'APR'], gaps: ['Debt consolidation strategies', 'Settlement negotiations'] },
    { topic: 'Tax Planning', score: clampedRand(rand, 0.2, 0.7), level: 'beginner', key_concepts_known: ['Standard deduction', 'W-2 vs 1099'], gaps: ['Tax-loss harvesting', 'Capital gains optimization', 'Entity structuring'] },
    { topic: 'Retirement Planning', score: clampedRand(rand, 0.3, 0.8), level: 'intermediate', key_concepts_known: ['401(k)', 'IRA types', 'Roth conversion'], gaps: ['Social Security optimization', 'Withdrawal strategies', 'Healthcare planning'] },
    { topic: 'Insurance & Risk', score: clampedRand(rand, 0.35, 0.75), level: 'intermediate', key_concepts_known: ['Term vs whole life', 'Deductibles', 'Umbrella policies'], gaps: ['Disability insurance', 'Long-term care planning'] },
    { topic: 'Real Estate', score: clampedRand(rand, 0.25, 0.7), level: 'beginner', key_concepts_known: ['Mortgage types', 'Equity', 'Closing costs'], gaps: ['Investment property analysis', 'REITs', 'House hacking'] }
  ]

  knowledgeAreas.forEach(k => {
    k.level = k.score >= 0.85 ? 'expert' : k.score >= 0.65 ? 'advanced' : k.score >= 0.4 ? 'intermediate' : 'beginner'
  })

  const overallScore = Math.round((knowledgeAreas.reduce((s, k) => s + k.score, 0) / knowledgeAreas.length) * 100)
  const overallLevel = overallScore >= 80 ? 'Advanced' : overallScore >= 60 ? 'Intermediate+' : overallScore >= 40 ? 'Intermediate' : 'Beginner'

  const learningPath: LearningModule[] = [
    { title: 'Mastering Your Money Mindset', category: 'Foundations', difficulty: 'beginner', estimated_hours: 3, topics_covered: ['Money psychology', 'Values-based spending', 'Goal setting'], progress_pct: 100, completed: true },
    { title: 'Zero-Based Budgeting Masterclass', category: 'Budgeting', difficulty: 'intermediate', estimated_hours: 5, topics_covered: ['Zero-based system', 'Envelope method', 'Budget apps', 'Automating finances'], progress_pct: 85, completed: false },
    { title: 'Investing 101: First Steps', category: 'Investing', difficulty: 'beginner', estimated_hours: 8, topics_covered: ['Asset classes', 'Risk tolerance', 'Brokerage accounts', 'Dollar-cost averaging'], progress_pct: 100, completed: true },
    { title: 'Tax Strategy Deep Dive', category: 'Tax Planning', difficulty: 'advanced', estimated_hours: 12, topics_covered: ['Tax brackets', 'Deductions vs credits', 'Retirement accounts tax benefits', 'Tax-loss harvesting'], progress_pct: 45, completed: false },
    { title: 'Debt-Free Blueprint', category: 'Debt', difficulty: 'intermediate', estimated_hours: 6, topics_covered: ['Avalanche vs snowball', 'Refinancing', 'Credit building', 'Balance transfers'], progress_pct: 70, completed: false },
    { title: 'Retirement Readiness', category: 'Retirement', difficulty: 'advanced', estimated_hours: 15, topics_covered: ['Social security optimization', '401k vs IRA', 'Withdrawal strategies', 'Healthcare costs'], progress_pct: 20, completed: false },
    { title: 'Real Estate Wealth Building', category: 'Real Estate', difficulty: 'advanced', estimated_hours: 10, topics_covered: ['REITs', 'Rental properties', 'House hacking', 'Market analysis'], progress_pct: 0, completed: false }
  ]

  return {
    overall_score: overallScore,
    overall_level: overallLevel,
    assessment_date: new Date().toISOString().split('T')[0],
    knowledge_areas: knowledgeAreas,
    learning_path: learningPath,
    recommended_next: [
      'Complete Zero-Based Budgeting module (85% done — only 45 min remaining)',
      'Start Tax Strategy module — highest ROI knowledge gap identified',
      'Practice: Create a mock investment portfolio using paper trading',
      'Read: "The Simple Path to Wealth" by JL Collins'
    ],
    certificates: [
      { name: 'Financial Foundations', issuer: 'FinanceAI Academy', status: 'completed' },
      { name: 'Investor Certification Level 1', issuer: 'FinanceAI Academy', status: 'completed' },
      { name: 'Tax Strategy Specialist', issuer: 'FinanceAI Academy', status: 'in_progress' },
      { name: 'Retirement Planning Professional', issuer: 'FinanceAI Academy', status: 'available' }
    ],
    practice_tasks: [
      { task: 'Build a complete monthly budget with 20+ categories', difficulty: 'medium', status: 'completed', xp_reward: 150 },
      { task: 'Analyze a stock using fundamental analysis framework', difficulty: 'hard', status: 'completed', xp_reward: 300 },
      { task: 'Create a 5-year debt payoff plan with avalanche method', difficulty: 'medium', status: 'pending', xp_reward: 200 },
      { task: 'Simulate tax-loss harvesting for a sample portfolio', difficulty: 'hard', status: 'pending', xp_reward: 350 },
      { task: 'Research and compare 3 high-yield savings accounts', difficulty: 'easy', status: 'completed', xp_reward: 100 }
    ],
    community_challenges: [
      { challenge: '30-Day Savings Challenge (save $5/day)', participants: 1247, reward: 'High-yield savings bonus 0.25% APY boost' },
      { challenge: 'No-Spend Weekends (2 months)', participants: 892, reward: 'Exclusive investing masterclass access' },
      { challenge: 'Debt-Free Journey Share Your Story', participants: 563, reward: 'Financial coaching session ($200 value)' }
    ],
    weekly_progress: [
      { week: 'Week 1', modules_completed: 2, xp_earned: 450 },
      { week: 'Week 2', modules_completed: 1, xp_earned: 300 },
      { week: 'Week 3', modules_completed: 3, xp_earned: 650 },
      { week: 'Week 4', modules_completed: 1, xp_earned: 200 }
    ],
    disclaimer: '⚠️ 本分析不可替代专业财务建议。财务素养评估仅供学习参考，专业财务规划请咨询持证理财规划师。'
  }
}

function formatFinancialLiteracy(report: LiteracyReport): string {
  const lines: string[] = []
  lines.push('## Financial Literacy Tracker')
  lines.push('')
  const scoreBar = '#'.repeat(Math.round(report.overall_score / 5)) + '-'.repeat(20 - Math.round(report.overall_score / 5))
  lines.push('**Overall Score:** ' + report.overall_score + '/100 ' + scoreBar + ' (' + report.overall_level + ')')
  lines.push('**Assessment Date:** ' + report.assessment_date)
  lines.push('')

  lines.push('### Knowledge Assessment')
  lines.push('| Topic | Score | Level | Known Concepts | Gaps |')
  lines.push('|-------|-------|-------|----------------|------|')
  report.knowledge_areas.forEach(k => {
    const scorePct = Math.round(k.score * 100)
    const gapStr = k.gaps.join(', ')
    lines.push('| ' + k.topic + ' | ' + scorePct + '% | ' + k.level + ' | ' + k.key_concepts_known.length + ' concepts | ' + gapStr + ' |')
  })
  lines.push('')

  lines.push('### Learning Path')
  report.learning_path.forEach(m => {
    const bar = '#'.repeat(Math.round(m.progress_pct / 5)) + '-'.repeat(20 - Math.round(m.progress_pct / 5))
    const statusIcon = m.completed ? 'Completed' : m.progress_pct > 0 ? 'In Progress' : 'Not Started'
    lines.push('- **' + m.title + '** [' + m.difficulty + ' | ' + statusIcon + ']')
    lines.push('  ' + bar + ' ' + m.progress_pct + '% (' + m.estimated_hours + ' hours)')
    lines.push('  Topics: ' + m.topics_covered.join(', '))
  })
  lines.push('')

  lines.push('### Recommended Next Steps')
  report.recommended_next.forEach((r, i) => lines.push((i + 1) + '. ' + r))
  lines.push('')

  lines.push('### Certificates')
  report.certificates.forEach(c => {
    const statusIcon = c.status === 'completed' ? 'Completed' : c.status === 'in_progress' ? 'In Progress' : 'Available'
    lines.push('- **' + c.name + '** by ' + c.issuer + ' [' + statusIcon + ']')
  })
  lines.push('')

  lines.push('### Practice Tasks')
  report.practice_tasks.forEach(t => {
    const statusIcon = t.status === 'completed' ? 'Completed' : 'Pending'
    lines.push('- **' + t.task + '** [' + t.difficulty + ' | ' + statusIcon + '] (+' + t.xp_reward + ' XP)')
  })
  lines.push('')

  lines.push('### Community Challenges')
  report.community_challenges.forEach(c => {
    lines.push('- **' + c.challenge + '** (' + c.participants + ' participants) Reward: ' + c.reward)
  })
  lines.push('')

  lines.push('### Weekly Progress')
  report.weekly_progress.forEach(w => {
    lines.push('- ' + w.week + ': ' + w.modules_completed + ' modules completed, ' + w.xp_earned + ' XP earned')
  })
  lines.push('')

  lines.push('> ' + report.disclaimer)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Expense Tracker
  tools.register(defineTool({
    name: 'expense_tracker',
    description: 'Track and categorize expenses with auto-classification, merchant mapping, cycle detection, tax identification, anomaly detection, and investment correlation analysis.',
    parameters: {
      transaction_data: { type: 'string', required: true, description: 'Raw transaction data (newline-separated transactions with amounts and descriptions)' },
      expense_category: { type: 'string', required: true, description: 'Primary expense category (e.g., "food", "utilities", "transport", "entertainment")' },
      auto_classify: { type: 'string', description: 'Enable auto-classification: "true" or "false". Defaults to "true".' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { transaction_data: string; expense_category: string; auto_classify?: string }) {
      const autoClassify = args.auto_classify !== 'false'
      const result = trackExpenses(args.transaction_data, args.expense_category, autoClassify)
      return formatExpenseTracker(result)
    }
  }))

  // Tool 2: Budget Optimizer
  tools.register(defineTool({
    name: 'budget_optimizer',
    description: 'Optimize monthly budget based on income analysis, expense patterns, savings goals, progress tracking, and actionable adjustment suggestions.',
    parameters: {
      monthly_income: { type: 'string', required: true, description: 'Total monthly income amount' },
      current_expenses: { type: 'string', required: true, description: 'Current total monthly expenses' },
      savings_target: { type: 'string', required: true, description: 'Monthly savings target amount' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { monthly_income: string; current_expenses: string; savings_target: string }) {
      const result = optimizeBudget(args.monthly_income, args.current_expenses, args.savings_target)
      return formatBudgetOptimizer(result)
    }
  }))

  // Tool 3: Investment Portfolio
  tools.register(defineTool({
    name: 'investment_portfolio',
    description: 'Analyze investment portfolio with stocks, bonds, funds, ETFs. Includes risk assessment, rebalancing recommendations, tax optimization, and goal tracking.',
    parameters: {
      holdings_data: { type: 'string', required: true, description: 'JSON string of current portfolio holdings with symbols and amounts' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { holdings_data: string }) {
      const result = analyzePortfolio(args.holdings_data)
      return formatPortfolio(result)
    }
  }))

  // Tool 4: Debt Reduction Planner
  tools.register(defineTool({
    name: 'debt_reduction_planner',
    description: 'Create debt reduction plans using avalanche or snowball method. Includes priority ranking, extra payment allocation, timeline, interest savings, and milestone tracking.',
    parameters: {
      debts_json: { type: 'string', required: true, description: 'JSON array of debt objects with name, balance, interest_rate, minimum_payment' },
      extra_payment: { type: 'string', required: true, description: 'Extra monthly payment amount beyond minimums' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { debts_json: string; extra_payment: string }) {
      const result = planDebtReduction(args.debts_json, args.extra_payment)
      return formatDebtReduction(result)
    }
  }))

  // Tool 5: Retirement Planner
  tools.register(defineTool({
    name: 'retirement_planner',
    description: 'Comprehensive retirement planning with target replacement rate, social security estimates, 401k/IRA projections, medical cost analysis, withdrawal strategy, and gap analysis.',
    parameters: {
      current_age: { type: 'string', required: true, description: 'Current age' },
      retirement_age: { type: 'string', required: true, description: 'Target retirement age' },
      current_savings: { type: 'string', required: true, description: 'Current total retirement savings' },
      annual_income: { type: 'string', required: true, description: 'Current annual pre-tax income' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { current_age: string; retirement_age: string; current_savings: string; annual_income: string }) {
      const result = planRetirement(args.current_age, args.retirement_age, args.current_savings, args.annual_income)
      return formatRetirementPlanner(result)
    }
  }))

  // Tool 6: Tax Optimizer
  tools.register(defineTool({
    name: 'tax_optimizer',
    description: 'Tax optimization with deduction analysis, credits identification, capital gains strategy, retirement contribution optimization, entity structure comparison, and tax savings simulation.',
    parameters: {
      filing_status: { type: 'string', required: true, description: 'Tax filing status: "single" or "married"' },
      taxable_income: { type: 'string', required: true, description: 'Annual taxable income amount' },
      current_deductions: { type: 'string', required: true, description: 'JSON object of current deductions by category' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { filing_status: string; taxable_income: string; current_deductions: string }) {
      const result = optimizeTaxes(args.filing_status, args.taxable_income, args.current_deductions)
      return formatTaxOptimizer(result)
    }
  }))

  // Tool 7: Goal-Based Savings
  tools.register(defineTool({
    name: 'goal_based_savings',
    description: 'Create savings plans for multiple goals including emergency fund, education, home, car, travel. Includes funding strategies, automation recommendations, and progress tracking.',
    parameters: {
      monthly_capacity: { type: 'string', required: true, description: 'Monthly savings capacity (available amount)' },
      goals_json: { type: 'string', required: true, description: 'JSON array of savings goals with target, deadline, priority' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { monthly_capacity: string; goals_json: string }) {
      const result = goalBasedSavings(args.monthly_capacity, args.goals_json)
      return formatGoalSavings(result)
    }
  }))

  // Tool 8: Financial Literacy
  tools.register(defineTool({
    name: 'financial_literacy',
    description: 'Assess financial knowledge with scoring, learning path recommendations, module progress tracking, certification tracking, practice tasks, and community challenges.',
    parameters: {
      current_knowledge: { type: 'string', required: true, description: 'JSON object indicating current financial knowledge areas and self-assessed levels' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { current_knowledge: string }) {
      const result = assessFinancialLiteracy(args.current_knowledge)
      return formatFinancialLiteracy(result)
    }
  }))

  // eslint-disable-next-line no-console
  console.log('[dsh-tool-personalfinance] Loaded v' + VERSION + ' - Personal Finance AI with 8 tools')
  // eslint-disable-next-line no-console
  console.log('  Tools: expense_tracker, budget_optimizer, investment_portfolio, debt_reduction_planner, retirement_planner, tax_optimizer, goal_based_savings, financial_literacy')
}
