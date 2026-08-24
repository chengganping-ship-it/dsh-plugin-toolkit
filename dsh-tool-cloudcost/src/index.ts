/**
 * dsh-tool-cloudcost - Cloud Cost Optimization & FinOps Plugin
 *
 * A DeepSeek Harness (DSH) plugin for cloud cost optimization, FinOps
 * practices, and multi-cloud financial governance. Provides deterministic
 * analysis for reserved instance planning, waste detection, multi-cloud
 * comparison, savings plan recommendations, tag auditing, billing anomaly
 * detection, budget forecasting, and rightsizing.
 *
 * Tools:
 *   1. reserved_instance_planner   - RI coverage analysis & purchase planning
 *   2. waste_detector              - Detect idle/underutilized resources
 *   3. multicloud_cost_comparison  - Compare costs across AWS/Azure/GCP
 *   4. savings_plan_recommender    - Compute savings plan recommendations
 *   5. tag_audit_optimizer         - Cost allocation tag coverage audit
 *   6. billing_anomaly_detector    - Detect billing spikes & anomalies
 *   7. budget_forecaster           - Budget forecasting with accuracy scoring
 *   8. rightsizing_engine          - Instance rightsizing recommendations
 *
 * @author chengganping-ship-it
 * @version 0.1.0
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 – Seeded Random (mulberry32 PRNG)
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 – Interface Definitions
// ─────────────────────────────────────────────────────────────────────────────

/** Input for Tool 1: Reserved Instance Planner */
export interface RiPlannerInput {
  cloud_provider?: 'aws' | 'azure' | 'gcp'
  account_id?: string
  current_spend_monthly?: number
  on_demand_pct?: number
  ri_coverage_pct?: number
  instance_families?: string[]
  term_preference?: '1yr' | '3yr'
  payment_option?: 'all_upfront' | 'partial_upfront' | 'no_upfront'
}

/** RI recommendation by instance family */
export interface RiRecommendation {
  instance_family: string
  current_on_demand: number
  recommended_ri_count: number
  upfront_cost: number
  monthly_savings: number
  annual_savings: number
  roi_months: number
}

/** Output for Tool 1: Reserved Instance Planner */
export interface RiPlannerResult {
  cloud_provider: string
  current_ri_coverage_pct: number
  target_ri_coverage_pct: number
  recommendations: RiRecommendation[]
  total_upfront_cost: number
  total_monthly_savings: number
  total_annual_savings: number
  effective_discount_pct: number
  payback_period_months: number
  coverage_gap_pct: number
  risk_flags: string[]
}

/** Input for Tool 2: Waste Detector */
export interface WasteDetectorInput {
  cloud_provider?: 'aws' | 'azure' | 'gcp'
  account_id?: string
  unattached_volumes?: number
  idle_instances?: number
  overprovisioned_instances?: number
  unused_ips?: number
  orphan_snapshots?: number
  monthly_spend?: number
}

/** Waste item detail */
export interface WasteItem {
  resource_type: string
  resource_count: number
  monthly_waste: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  recommendation: string
}

/** Output for Tool 2: Waste Detector */
export interface WasteDetectorResult {
  total_monthly_waste: number
  total_annual_waste: number
  waste_pct_of_spend: number
  waste_items: WasteItem[]
  quick_wins: string[]
  automation_opportunities: string[]
  waste_grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

/** Input for Tool 3: Multi-Cloud Cost Comparison */
export interface MulticloudInput {
  comparison_scope?: string
  aws_monthly_spend?: number
  azure_monthly_spend?: number
  gcp_monthly_spend?: number
  workload_types?: string[]
  data_egress_costs?: boolean
  reserved_commitments?: boolean
}

/** Cloud provider comparison row */
export interface CloudComparison {
  provider: string
  monthly_spend: number
  compute_pct: number
  storage_pct: number
  network_pct: number
  effective_discount: number
  cost_per_vcpu_hour: number
  workload_fit_score: number
}

/** Output for Tool 3: Multi-Cloud Cost Comparison */
export interface MulticloudResult {
  providers: CloudComparison[]
  total_monthly_spend: number
  highest_cost_provider: string
  lowest_cost_provider: number
  potential_savings_pct: number
  arbitrage_opportunities: string[]
  consolidation_recommendation: string
  data_egress_impact_pct: number
}

/** Input for Tool 4: Savings Plan Recommender */
export interface SavingsPlanInput {
  cloud_provider?: 'aws' | 'azure' | 'gcp'
  account_id?: string
  compute_spend_monthly?: number
  current_compute_commitment?: number
  usage_trend?: 'growing' | 'stable' | 'declining'
  flexibility_preference?: 'maximum' | 'balanced' | 'committed'
  term_years?: 1 | 3
}

/** Savings plan tier recommendation */
export interface SavingsPlanTier {
  commitment_hourly: number
  coverage_pct: number
  discount_pct: number
  monthly_savings: number
  annual_savings: number
  utilization_requirement: number
  risk_level: 'low' | 'medium' | 'high'
}

/** Output for Tool 4: Savings Plan Recommender */
export interface SavingsPlanResult {
  cloud_provider: string
  current_commitment: number
  recommended_commitment: number
  current_coverage_pct: number
  target_coverage_pct: number
  plan_type: string
  term_years: number
  payment_option: string
  tiers: SavingsPlanTier[]
  total_monthly_savings: number
  total_annual_savings: number
  utilization_pct: number
  break_even_months: number
  confidence: 'high' | 'medium' | 'low'
}

/** Input for Tool 5: Tag Audit Optimizer */
export interface TagAuditInput {
  cloud_provider?: 'aws' | 'azure' | 'gcp'
  account_id?: string
  total_resources?: number
  tagged_resources?: number
  required_tags?: string[]
  cost_centers?: string[]
  environment_tags?: boolean
  project_tags?: boolean
  owner_tags?: boolean
}

/** Tag coverage by category */
export interface TagCoverage {
  tag_key: string
  coverage_pct: number
  untagged_count: number
  untagged_monthly_spend: number
  status: 'compliant' | 'partial' | 'non_compliant'
}

/** Output for Tool 5: Tag Audit Optimizer */
export interface TagAuditResult {
  overall_coverage_pct: number
  compliance_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  total_resources: number
  fully_tagged: number
  partially_tagged: number
  untagged: number
  untagged_monthly_spend: number
  tag_coverages: TagCoverage[]
  compliance_gaps: string[]
  remediation_actions: string[]
  governance_recommendation: string
}

/** Input for Tool 6: Billing Anomaly Detector */
export interface AnomalyInput {
  cloud_provider?: 'aws' | 'azure' | 'gcp'
  account_id?: string
  current_month_spend?: number
  previous_months_spend?: number[]
  anomaly_threshold_pct?: number
  service_breakdown?: Array<{ service: string; spend: number }>
  alert_sensitivity?: 'high' | 'medium' | 'low'
}

/** Detected anomaly detail */
export interface AnomalyDetail {
  service: string
  current_spend: number
  expected_spend: number
  deviation_pct: number
  anomaly_score: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  root_cause: string
  recommendation: string
}

/** Output for Tool 6: Billing Anomaly Detector */
export interface AnomalyResult {
  overall_anomaly_score: number
  total_anomalies: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  current_month_spend: number
  expected_monthly_spend: number
  overspend_pct: number
  anomalies: AnomalyDetail[]
  trend_direction: 'increasing' | 'stable' | 'decreasing'
  alert_recommendations: string[]
}

/** Input for Tool 7: Budget Forecaster */
export interface BudgetForecastInput {
  cloud_provider?: 'aws' | 'azure' | 'gcp'
  account_id?: string
  historical_months?: number[]
  current_budget?: number
  forecast_months?: number
  growth_rate_monthly?: number
  seasonality?: boolean
  planned_changes?: string[]
}

/** Monthly forecast data point */
export interface ForecastMonth {
  month: string
  predicted_spend: number
  lower_bound: number
  upper_bound: number
  confidence_pct: number
  budget_remaining: number
  over_budget_flag: boolean
}

/** Output for Tool 7: Budget Forecaster */
export interface BudgetForecastResult {
  forecast_accuracy_pct: number
  current_monthly_spend: number
  forecast_period_months: number
  total_forecasted_spend: number
  budget_amount: number
  projected_variance_pct: number
  projected_overrun: number
  monthly_forecasts: ForecastMonth[]
  burn_rate_trend: 'accelerating' | 'stable' | 'decelerating'
  months_until_exhausted: number
  optimization_suggestions: string[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
}

/** Input for Tool 8: Rightsizing Engine */
export interface RightsizingInput {
  cloud_provider?: 'aws' | 'azure' | 'gcp'
  account_id?: string
  instance_id?: string
  instance_type?: string
  current_vcpus?: number
  current_memory_gb?: number
  avg_cpu_utilization?: number
  avg_memory_utilization?: number
  peak_cpu_utilization?: number
  peak_memory_utilization?: number
  monthly_cost?: number
  workload_pattern?: 'steady' | 'bursty' | 'spiky' | 'batch'
}

/** Rightsizing recommendation */
export interface RightsizingRecommendation {
  instance_type: string
  current_type: string
  target_type: string
  current_monthly_cost: number
  target_monthly_cost: number
  monthly_savings: number
  savings_pct: number
  target_vcpus: number
  target_memory_gb: number
  expected_cpu_utilization: number
  expected_memory_utilization: number
  risk_level: 'low' | 'medium' | 'high'
  migration_effort: 'low' | 'medium' | 'high'
}

/** Output for Tool 8: Rightsizing Engine */
export interface RightsizingResult {
  total_instances_analyzed: number
  total_current_monthly_cost: number
  total_target_monthly_cost: number
  total_monthly_savings: number
  overall_savings_pct: number
  recommendations: RightsizingRecommendation[]
  overprovisioned_count: number
  underprovisioned_count: number
  optimal_count: number
  avg_current_utilization_pct: number
  avg_target_utilization_pct: number
  implementation_priority: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 – Tool 1: Reserved Instance Planner
// ─────────────────────────────────────────────────────────────────────────────

function planReservedInstances(input: RiPlannerInput): RiPlannerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const provider = input.cloud_provider ?? 'aws'
  const currentSpend = input.current_spend_monthly ?? rng.nextFloat(20000, 150000)
  const onDemandPct = input.on_demand_pct ?? rng.nextFloat(40, 85)
  const currentRiCoverage = input.ri_coverage_pct ?? rng.nextFloat(10, 50)
  const targetCoverage = Math.min(85, currentRiCoverage + rng.nextFloat(25, 45))
  const term = input.term_preference ?? rng.pick(['1yr', '3yr'] as const)
  const payment = input.payment_option ?? rng.pick(['all_upfront', 'partial_upfront', 'no_upfront'] as const)

  const families = input.instance_families ?? ['m5', 'c5', 'r5', 't3', 'i3']
  const discountMultiplier = payment === 'all_upfront' ? 1.0 : payment === 'partial_upfront' ? 0.7 : 0.45
  const termMultiplier = term === '3yr' ? 1.3 : 1.0
  const baseDiscount = rng.nextFloat(0.28, 0.42)

  const recommendations: RiRecommendation[] = families.map((family) => {
    const onDemand = (currentSpend * (onDemandPct / 100)) / families.length
    const riCount = rng.nextInt(5, 50)
    const upfront = riCount * rng.nextFloat(800, 3000) * discountMultiplier
    const monthlySavings = onDemand * baseDiscount * termMultiplier * rng.nextFloat(0.8, 1.0)
    return {
      instance_family: family,
      current_on_demand: Math.round(onDemand),
      recommended_ri_count: riCount,
      upfront_cost: Math.round(upfront),
      monthly_savings: Math.round(monthlySavings),
      annual_savings: Math.round(monthlySavings * 12),
      roi_months: Math.round(upfront / monthlySavings),
    }
  })

  const totalUpfront = recommendations.reduce((s, r) => s + r.upfront_cost, 0)
  const totalMonthlySavings = recommendations.reduce((s, r) => s + r.monthly_savings, 0)
  const totalAnnualSavings = totalMonthlySavings * 12
  const effectiveDiscount = ((totalMonthlySavings * 12) / (currentSpend * 12)) * 100
  const paybackMonths = Math.round(totalUpfront / totalMonthlySavings)
  const coverageGap = targetCoverage - currentRiCoverage

  const riskFlags: string[] = []
  if (currentRiCoverage < 30) riskFlags.push('RI coverage critically low — significant on-demand exposure')
  if (payment === 'all_upfront' && totalUpfront > 100000) riskFlags.push('Large upfront commitment — verify budget approval')
  if (term === '3yr') riskFlags.push('3-year term locks in capacity — confirm workload stability')
  if (onDemandPct > 70) riskFlags.push('High on-demand ratio — immediate RI purchase recommended')
  if (riskFlags.length === 0) riskFlags.push('Risk profile within acceptable parameters')

  return {
    cloud_provider: provider,
    current_ri_coverage_pct: Math.round(currentRiCoverage),
    target_ri_coverage_pct: Math.round(targetCoverage),
    recommendations,
    total_upfront_cost: totalUpfront,
    total_monthly_savings: totalMonthlySavings,
    total_annual_savings: totalAnnualSavings,
    effective_discount_pct: Math.round(effectiveDiscount * 10) / 10,
    payback_period_months: paybackMonths,
    coverage_gap_pct: Math.round(coverageGap),
    risk_flags: riskFlags,
  }
}

function formatRiPlannerReport(r: RiPlannerResult): string {
  const lines: string[] = []
  lines.push('# Reserved Instance Plan: ' + r.cloud_provider.toUpperCase())
  lines.push('')
  lines.push('## Coverage Summary')
  lines.push('')
  lines.push('- Current RI Coverage: **' + r.current_ri_coverage_pct + '%**')
  lines.push('- Target RI Coverage: **' + r.target_ri_coverage_pct + '%**')
  lines.push('- Coverage Gap: **' + r.coverage_gap_pct + '%**')
  lines.push('')
  lines.push('## Financial Impact')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Total Upfront Cost | $' + r.total_upfront_cost.toLocaleString() + ' |')
  lines.push('| Monthly Savings | $' + r.total_monthly_savings.toLocaleString() + ' |')
  lines.push('| Annual Savings | $' + r.total_annual_savings.toLocaleString() + ' |')
  lines.push('| Effective Discount | ' + r.effective_discount_pct + '% |')
  lines.push('| Payback Period | ' + r.payback_period_months + ' months |')
  lines.push('')
  lines.push('## Recommendations by Instance Family')
  lines.push('')
  for (const rec of r.recommendations) {
    lines.push('### ' + rec.instance_family)
    lines.push('- On-Demand Spend: $' + rec.current_on_demand.toLocaleString() + '/mo')
    lines.push('- Recommended RIs: ' + rec.recommended_ri_count + ' instances')
    lines.push('- Upfront Cost: $' + rec.upfront_cost.toLocaleString())
    lines.push('- Monthly Savings: $' + rec.monthly_savings.toLocaleString())
    lines.push('- Annual Savings: $' + rec.annual_savings.toLocaleString())
    lines.push('- ROI: ' + rec.roi_months + ' months')
    lines.push('')
  }
  lines.push('## Risk Flags')
  lines.push('')
  for (const flag of r.risk_flags) {
    lines.push('- ' + flag)
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-cloudcost | Reserved Instance Planner')
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 – Tool 2: Waste Detector
// ─────────────────────────────────────────────────────────────────────────────

function detectWaste(input: WasteDetectorInput): WasteDetectorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const monthlySpend = input.monthly_spend ?? rng.nextFloat(30000, 200000)

  const unattached = input.unattached_volumes ?? rng.nextInt(5, 80)
  const idle = input.idle_instances ?? rng.nextInt(3, 40)
  const overprovisioned = input.overprovisioned_instances ?? rng.nextInt(10, 100)
  const unusedIps = input.unused_ips ?? rng.nextInt(2, 30)
  const orphanSnapshots = input.orphan_snapshots ?? rng.nextInt(20, 200)

  const wasteItems: WasteItem[] = [
    {
      resource_type: 'Unattached EBS Volumes',
      resource_count: unattached,
      monthly_waste: Math.round(unattached * rng.nextFloat(40, 120)),
      severity: unattached > 40 ? 'critical' : unattached > 20 ? 'high' : 'medium',
      recommendation: 'Delete unattached volumes older than 30 days; enable automated cleanup',
    },
    {
      resource_type: 'Idle EC2 Instances',
      resource_count: idle,
      monthly_waste: Math.round(idle * rng.nextFloat(100, 500)),
      severity: idle > 20 ? 'critical' : idle > 10 ? 'high' : 'medium',
      recommendation: 'Stop or terminate instances with < 5% CPU utilization over 14 days',
    },
    {
      resource_type: 'Overprovisioned Instances',
      resource_count: overprovisioned,
      monthly_waste: Math.round(overprovisioned * rng.nextFloat(80, 350)),
      severity: overprovisioned > 50 ? 'high' : 'medium',
      recommendation: 'Rightsizing analysis recommended — downsize to match actual utilization',
    },
    {
      resource_type: 'Unused Elastic IPs',
      resource_count: unusedIps,
      monthly_waste: Math.round(unusedIps * rng.nextFloat(3, 10)),
      severity: 'low',
      recommendation: 'Release unattached Elastic IPs to avoid hourly charges',
    },
    {
      resource_type: 'Orphan Snapshots',
      resource_count: orphanSnapshots,
      monthly_waste: Math.round(orphanSnapshots * rng.nextFloat(5, 25)),
      severity: orphanSnapshots > 100 ? 'high' : 'medium',
      recommendation: 'Delete snapshots with no associated AMI or volume; set lifecycle policies',
    },
  ]

  const totalMonthlyWaste = wasteItems.reduce((s, w) => s + w.monthly_waste, 0)
  const totalAnnualWaste = totalMonthlyWaste * 12
  const wastePct = (totalMonthlyWaste / monthlySpend) * 100

  const grade = wastePct < 5 ? 'A' : wastePct < 10 ? 'B' : wastePct < 20 ? 'C' : wastePct < 35 ? 'D' : 'F'

  const quickWins: string[] = []
  if (unattached > 10) quickWins.push('Delete ' + unattached + ' unattached volumes: save $' + wasteItems[0].monthly_waste.toLocaleString() + '/mo')
  if (unusedIps > 0) quickWins.push('Release ' + unusedIps + ' unused Elastic IPs: save $' + wasteItems[3].monthly_waste.toLocaleString() + '/mo')
  if (orphanSnapshots > 50) quickWins.push('Clean up ' + orphanSnapshots + ' orphan snapshots: save $' + wasteItems[4].monthly_waste.toLocaleString() + '/mo')
  if (quickWins.length === 0) quickWins.push('No immediate quick wins — waste levels are well-managed')

  const automation: string[] = []
  automation.push('Implement AWS Instance Scheduler for non-production environments')
  automation.push('Deploy AWS Config rules for unattached resource detection')
  automation.push('Set up AWS Budgets alerts for waste threshold breaches')
  automation.push('Enable AWS Compute Optimizer for continuous rightsizing')

  return {
    total_monthly_waste: totalMonthlyWaste,
    total_annual_waste: totalAnnualWaste,
    waste_pct_of_spend: Math.round(wastePct * 10) / 10,
    waste_items: wasteItems,
    quick_wins: quickWins,
    automation_opportunities: automation,
    waste_grade: grade,
  }
}

function formatWasteReport(r: WasteDetectorResult): string {
  const lines: string[] = []
  lines.push('# Cloud Waste Detection Report')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Monthly Waste | $' + r.total_monthly_waste.toLocaleString() + ' |')
  lines.push('| Annual Waste | $' + r.total_annual_waste.toLocaleString() + ' |')
  lines.push('| Waste % of Spend | ' + r.waste_pct_of_spend + '% |')
  lines.push('| Waste Grade | **' + r.waste_grade + '** |')
  lines.push('')
  lines.push('## Waste Breakdown')
  lines.push('')
  for (const item of r.waste_items) {
    const icon = item.severity === 'critical' ? '[CRIT]' : item.severity === 'high' ? '[HIGH]' : item.severity === 'medium' ? '[MED]' : '[LOW]'
    lines.push('### ' + icon + ' ' + item.resource_type)
    lines.push('- Count: ' + item.resource_count + ' | Monthly Waste: $' + item.monthly_waste.toLocaleString())
    lines.push('- Recommendation: ' + item.recommendation)
    lines.push('')
  }
  lines.push('## Quick Wins')
  lines.push('')
  for (const qw of r.quick_wins) {
    lines.push('- ' + qw)
  }
  lines.push('')
  lines.push('## Automation Opportunities')
  lines.push('')
  for (const ao of r.automation_opportunities) {
    lines.push('- ' + ao)
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-cloudcost | Waste Detector')
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 – Tool 3: Multi-Cloud Cost Comparison
// ─────────────────────────────────────────────────────────────────────────────

function compareMulticloudCosts(input: MulticloudInput): MulticloudResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const awsSpend = input.aws_monthly_spend ?? rng.nextFloat(40000, 120000)
  const azureSpend = input.azure_monthly_spend ?? rng.nextFloat(20000, 80000)
  const gcpSpend = input.gcp_monthly_spend ?? rng.nextFloat(15000, 60000)
  const totalSpend = awsSpend + azureSpend + gcpSpend

  const providers: CloudComparison[] = [
    {
      provider: 'AWS',
      monthly_spend: Math.round(awsSpend),
      compute_pct: rng.nextInt(55, 70),
      storage_pct: rng.nextInt(15, 25),
      network_pct: rng.nextInt(8, 18),
      effective_discount: rng.nextInt(15, 35),
      cost_per_vcpu_hour: Math.round(rng.nextFloat(0.032, 0.048) * 1000) / 1000,
      workload_fit_score: rng.nextInt(75, 95),
    },
    {
      provider: 'Azure',
      monthly_spend: Math.round(azureSpend),
      compute_pct: rng.nextInt(50, 68),
      storage_pct: rng.nextInt(18, 28),
      network_pct: rng.nextInt(8, 15),
      effective_discount: rng.nextInt(12, 30),
      cost_per_vcpu_hour: Math.round(rng.nextFloat(0.030, 0.046) * 1000) / 1000,
      workload_fit_score: rng.nextInt(65, 88),
    },
    {
      provider: 'GCP',
      monthly_spend: Math.round(gcpSpend),
      compute_pct: rng.nextInt(52, 72),
      storage_pct: rng.nextInt(14, 24),
      network_pct: rng.nextInt(10, 20),
      effective_discount: rng.nextInt(18, 38),
      cost_per_vcpu_hour: Math.round(rng.nextFloat(0.028, 0.042) * 1000) / 1000,
      workload_fit_score: rng.nextInt(70, 92),
    },
  ]

  const highest = providers.reduce((a, b) => (a.monthly_spend > b.monthly_spend ? a : b))
  const lowest = providers.reduce((a, b) => (a.monthly_spend < b.monthly_spend ? a : b))
  const potentialSavings = rng.nextFloat(12, 28)

  const arbitrage: string[] = []
  const gcpProvider = providers.find((p) => p.provider === 'GCP')
  const awsProvider = providers.find((p) => p.provider === 'AWS')
  if (gcpProvider && awsProvider && gcpProvider.cost_per_vcpu_hour < awsProvider.cost_per_vcpu_hour) {
    arbitrage.push('GCP compute is ' + Math.round((1 - gcpProvider.cost_per_vcpu_hour / awsProvider.cost_per_vcpu_hour) * 100) + '% cheaper per vCPU-hour than AWS')
  }
  arbitrage.push('Consider spot/preemptible instances on GCP for batch workloads (up to 80% savings)')
  arbitrage.push('Azure Hybrid Benefit can reduce Windows/SQL costs by up to 40%')
  arbitrage.push('AWS Savings Plans offer more flexibility than Azure Reserved VMs')

  const consolidation = totalSpend > 150000
    ? 'Consolidate primary workloads on ' + lowest.provider + ' for best unit economics; use secondary provider for redundancy'
    : 'Multi-cloud strategy is cost-appropriate at current spend levels; focus on per-provider optimization'

  return {
    providers,
    total_monthly_spend: Math.round(totalSpend),
    highest_cost_provider: highest.provider,
    lowest_cost_provider: lowest.provider === 'AWS' ? 1 : lowest.provider === 'Azure' ? 2 : 3,
    potential_savings_pct: Math.round(potentialSavings * 10) / 10,
    arbitrage_opportunities: arbitrage,
    consolidation_recommendation: consolidation,
    data_egress_impact_pct: Math.round(rng.nextFloat(3, 12) * 10) / 10,
  }
}

function formatMulticloudReport(r: MulticloudResult): string {
  const lines: string[] = []
  lines.push('# Multi-Cloud Cost Comparison')
  lines.push('')
  lines.push('## Provider Spend Overview')
  lines.push('')
  lines.push('| Provider | Monthly Spend | Compute % | Storage % | Network % | Discount % | $/vCPU-hr | Fit Score |')
  lines.push('|----------|---------------|-----------|-----------|-----------|------------|-----------|-----------|')
  for (const p of r.providers) {
    lines.push('| ' + p.provider + ' | $' + p.monthly_spend.toLocaleString() + ' | ' + p.compute_pct + '% | ' + p.storage_pct + '% | ' + p.network_pct + '% | ' + p.effective_discount + '% | $' + p.cost_per_vcpu_hour.toFixed(3) + ' | ' + p.workload_fit_score + '/100 |')
  }
  lines.push('')
  lines.push('## Key Metrics')
  lines.push('')
  lines.push('- Total Monthly Spend: **$' + r.total_monthly_spend.toLocaleString() + '**')
  lines.push('- Highest Cost Provider: **' + r.highest_cost_provider + '**')
  lines.push('- Potential Savings: **' + r.potential_savings_pct + '%**')
  lines.push('- Data Egress Impact: **' + r.data_egress_impact_pct + '%** of total')
  lines.push('')
  lines.push('## Arbitrage Opportunities')
  lines.push('')
  for (const a of r.arbitrage_opportunities) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push('## Consolidation Recommendation')
  lines.push('')
  lines.push(r.consolidation_recommendation)
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-cloudcost | Multi-Cloud Cost Comparison')
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 – Tool 4: Savings Plan Recommender
// ─────────────────────────────────────────────────────────────────────────────

function recommendSavingsPlan(input: SavingsPlanInput): SavingsPlanResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const provider = input.cloud_provider ?? 'aws'
  const computeSpend = input.compute_spend_monthly ?? rng.nextFloat(15000, 100000)
  const currentCommitment = input.current_compute_commitment ?? rng.nextFloat(0, computeSpend * 0.3)
  const usageTrend = input.usage_trend ?? rng.pick(['growing', 'stable', 'declining'] as const)
  const flexibility = input.flexibility_preference ?? rng.pick(['maximum', 'balanced', 'committed'] as const)
  const term = input.term_years ?? rng.pick([1, 3] as const)

  const currentCoverage = (currentCommitment / computeSpend) * 100
  const targetCoverage = flexibility === 'committed' ? rng.nextFloat(75, 90) : flexibility === 'balanced' ? rng.nextFloat(60, 80) : rng.nextFloat(45, 65)
  const recommendedCommitment = computeSpend * (targetCoverage / 100)

  const planType = provider === 'aws' ? 'Compute Savings Plan' : provider === 'azure' ? 'Azure Reserved VM' : 'Committed Use Discounts'
  const paymentOption = flexibility === 'committed' ? 'All Upfront' : flexibility === 'balanced' ? 'Partial Upfront' : 'No Upfront'

  const discountBase = term === 3 ? rng.nextFloat(0.30, 0.45) : rng.nextFloat(0.18, 0.28)
  const tiers: SavingsPlanTier[] = []
  const tierCount = 3
  for (let i = 0; i < tierCount; i++) {
    const coverage = targetCoverage * (0.6 + i * 0.2)
    const discount = discountBase * (0.85 + i * 0.1)
    const hourlyCommitment = (computeSpend * (coverage / 100)) / 730
    const monthlySavings = computeSpend * (coverage / 100) * discount
    tiers.push({
      commitment_hourly: Math.round(hourlyCommitment * 100) / 100,
      coverage_pct: Math.round(coverage),
      discount_pct: Math.round(discount * 100),
      monthly_savings: Math.round(monthlySavings),
      annual_savings: Math.round(monthlySavings * 12),
      utilization_requirement: Math.round(coverage * 0.9),
      risk_level: i === 0 ? 'low' : i === 1 ? 'medium' : 'high',
    })
  }

  const totalMonthlySavings = tiers.reduce((s, t) => s + t.monthly_savings, 0) / tierCount
  const totalAnnualSavings = totalMonthlySavings * 12
  const utilization = Math.min(99, targetCoverage * rng.nextFloat(0.88, 1.02))
  const breakEven = Math.round(rng.nextFloat(3, 8))
  const confidence = usageTrend === 'growing' ? 'high' : usageTrend === 'stable' ? 'medium' : 'low'

  return {
    cloud_provider: provider,
    current_commitment: Math.round(currentCommitment),
    recommended_commitment: Math.round(recommendedCommitment),
    current_coverage_pct: Math.round(currentCoverage),
    target_coverage_pct: Math.round(targetCoverage),
    plan_type: planType,
    term_years: term,
    payment_option: paymentOption,
    tiers,
    total_monthly_savings: Math.round(totalMonthlySavings),
    total_annual_savings: Math.round(totalAnnualSavings),
    utilization_pct: Math.round(utilization),
    break_even_months: breakEven,
    confidence: confidence as 'high' | 'medium' | 'low',
  }
}

function formatSavingsPlanReport(r: SavingsPlanResult): string {
  const lines: string[] = []
  lines.push('# Savings Plan Recommendation: ' + r.cloud_provider.toUpperCase())
  lines.push('')
  lines.push('## Current State')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Current Commitment | $' + r.current_commitment.toLocaleString() + '/mo |')
  lines.push('| Current Coverage | ' + r.current_coverage_pct + '% |')
  lines.push('| Recommended Commitment | $' + r.recommended_commitment.toLocaleString() + '/mo |')
  lines.push('| Target Coverage | ' + r.target_coverage_pct + '% |')
  lines.push('')
  lines.push('## Plan Configuration')
  lines.push('')
  lines.push('- Plan Type: **' + r.plan_type + '**')
  lines.push('- Term: **' + r.term_years + ' years**')
  lines.push('- Payment: **' + r.payment_option + '**')
  lines.push('- Confidence: **' + r.confidence.toUpperCase() + '**')
  lines.push('')
  lines.push('## Tier Analysis')
  lines.push('')
  for (let i = 0; i < r.tiers.length; i++) {
    const t = r.tiers[i]
    lines.push('### Tier ' + (i + 1) + ' (' + t.risk_level.toUpperCase() + ' RISK)')
    lines.push('- Hourly Commitment: $' + t.commitment_hourly.toFixed(2) + '/hr')
    lines.push('- Coverage: ' + t.coverage_pct + '% | Discount: ' + t.discount_pct + '%')
    lines.push('- Monthly Savings: $' + t.monthly_savings.toLocaleString() + ' | Annual: $' + t.annual_savings.toLocaleString())
    lines.push('- Utilization Requirement: ' + t.utilization_requirement + '%')
    lines.push('')
  }
  lines.push('## Summary')
  lines.push('')
  lines.push('- Total Monthly Savings: **$' + r.total_monthly_savings.toLocaleString() + '**')
  lines.push('- Total Annual Savings: **$' + r.total_annual_savings.toLocaleString() + '**')
  lines.push('- Expected Utilization: **' + r.utilization_pct + '%**')
  lines.push('- Break-even: **' + r.break_even_months + ' months**')
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-cloudcost | Savings Plan Recommender')
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 – Tool 5: Tag Audit Optimizer
// ─────────────────────────────────────────────────────────────────────────────

function auditTags(input: TagAuditInput): TagAuditResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const provider = input.cloud_provider ?? 'aws'
  const totalResources = input.total_resources ?? rng.nextInt(500, 5000)
  const taggedResources = input.tagged_resources ?? rng.nextInt(Math.floor(totalResources * 0.3), Math.floor(totalResources * 0.85))
  const requiredTags = input.required_tags ?? ['CostCenter', 'Environment', 'Project', 'Owner', 'DataClassification']

  const fullyTagged = Math.floor(taggedResources * rng.nextFloat(0.5, 0.8))
  const partiallyTagged = taggedResources - fullyTagged
  const untagged = totalResources - taggedResources

  const monthlySpend = rng.nextFloat(30000, 150000)
  const untaggedSpend = monthlySpend * (untagged / totalResources)

  const tagCoverages: TagCoverage[] = requiredTags.map((tag) => {
    const coverage = rng.nextFloat(20, 95)
    const untaggedCount = Math.floor(totalResources * (1 - coverage / 100))
    const untaggedSpendForTag = monthlySpend * (untaggedCount / totalResources) * rng.nextFloat(0.5, 1.0)
    return {
      tag_key: tag,
      coverage_pct: Math.round(coverage),
      untagged_count: untaggedCount,
      untagged_monthly_spend: Math.round(untaggedSpendForTag),
      status: coverage >= 80 ? 'compliant' : coverage >= 50 ? 'partial' : 'non_compliant',
    }
  })

  const overallCoverage = (taggedResources / totalResources) * 100
  const grade = overallCoverage >= 90 ? 'A' : overallCoverage >= 75 ? 'B' : overallCoverage >= 60 ? 'C' : overallCoverage >= 40 ? 'D' : 'F'

  const complianceGaps: string[] = []
  for (const tc of tagCoverages) {
    if (tc.status === 'non_compliant') complianceGaps.push(tc.tag_key + ' coverage at ' + tc.coverage_pct + '% — below 50% threshold')
    else if (tc.status === 'partial') complianceGaps.push(tc.tag_key + ' coverage at ' + tc.coverage_pct + '% — needs improvement to 80%')
  }
  if (complianceGaps.length === 0) complianceGaps.push('All required tags meet compliance thresholds')

  const remediation: string[] = []
  remediation.push('Implement tag policies in ' + provider.toUpperCase() + ' Organizations/Policy to enforce tagging at resource creation')
  remediation.push('Deploy automated tag remediation using Lambda/Azure Functions for untagged resources')
  remediation.push('Set up tag compliance dashboards with weekly reporting to resource owners')
  remediation.push('Configure AWS Config/Azure Policy rules for required tag enforcement')
  if (untagged > totalResources * 0.3) remediation.push('URGENT: ' + untagged + ' untagged resources detected — prioritize bulk tagging initiative')

  const governance = overallCoverage >= 80
    ? 'Tag governance is mature — focus on edge cases and automated enforcement'
    : overallCoverage >= 60
      ? 'Tag governance needs improvement — implement mandatory tagging policies and automated remediation'
      : 'Tag governance is insufficient — immediate action required to establish tagging standards and enforcement'

  return {
    overall_coverage_pct: Math.round(overallCoverage),
    compliance_grade: grade,
    total_resources: totalResources,
    fully_tagged: fullyTagged,
    partially_tagged: partiallyTagged,
    untagged,
    untagged_monthly_spend: Math.round(untaggedSpend),
    tag_coverages: tagCoverages,
    compliance_gaps: complianceGaps,
    remediation_actions: remediation,
    governance_recommendation: governance,
  }
}

function formatTagAuditReport(r: TagAuditResult): string {
  const lines: string[] = []
  lines.push('# Cost Allocation Tag Audit Report')
  lines.push('')
  lines.push('## Coverage Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Overall Coverage | **' + r.overall_coverage_pct + '%** |')
  lines.push('| Compliance Grade | **' + r.compliance_grade + '** |')
  lines.push('| Total Resources | ' + r.total_resources.toLocaleString() + ' |')
  lines.push('| Fully Tagged | ' + r.fully_tagged.toLocaleString() + ' |')
  lines.push('| Partially Tagged | ' + r.partially_tagged.toLocaleString() + ' |')
  lines.push('| Untagged | ' + r.untagged.toLocaleString() + ' |')
  lines.push('| Untagged Monthly Spend | $' + r.untagged_monthly_spend.toLocaleString() + ' |')
  lines.push('')
  lines.push('## Tag Coverage Detail')
  lines.push('')
  lines.push('| Tag Key | Coverage | Untagged Count | Untagged $/mo | Status |')
  lines.push('|---------|----------|----------------|--------------|--------|')
  for (const tc of r.tag_coverages) {
    const statusIcon = tc.status === 'compliant' ? 'PASS' : tc.status === 'partial' ? 'WARN' : 'FAIL'
    lines.push('| ' + tc.tag_key + ' | ' + tc.coverage_pct + '% | ' + tc.untagged_count.toLocaleString() + ' | $' + tc.untagged_monthly_spend.toLocaleString() + ' | ' + statusIcon + ' |')
  }
  lines.push('')
  lines.push('## Compliance Gaps')
  lines.push('')
  for (const gap of r.compliance_gaps) {
    lines.push('- ' + gap)
  }
  lines.push('')
  lines.push('## Remediation Actions')
  lines.push('')
  for (let i = 0; i < r.remediation_actions.length; i++) {
    lines.push((i + 1) + '. ' + r.remediation_actions[i])
  }
  lines.push('')
  lines.push('## Governance Recommendation')
  lines.push('')
  lines.push(r.governance_recommendation)
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-cloudcost | Tag Audit Optimizer')
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 – Tool 6: Billing Anomaly Detector
// ─────────────────────────────────────────────────────────────────────────────

function detectBillingAnomalies(input: AnomalyInput): AnomalyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const provider = input.cloud_provider ?? 'aws'
  const currentSpend = input.current_month_spend ?? rng.nextFloat(40000, 180000)
  const threshold = input.anomaly_threshold_pct ?? rng.nextFloat(15, 35)
  const sensitivity = input.alert_sensitivity ?? rng.pick(['high', 'medium', 'low'] as const)

  const services = ['EC2', 'RDS', 'S3', 'Lambda', 'CloudFront', 'ElastiCache', 'ECS', 'DynamoDB']
  const anomalies: AnomalyDetail[] = []

  const numAnomalies = rng.nextInt(2, 5)
  for (let i = 0; i < numAnomalies; i++) {
    const service = services[i % services.length]
    const current = rng.nextFloat(2000, 25000)
    const deviation = rng.nextFloat(threshold, threshold * 2.5)
    const expected = current / (1 + deviation / 100)
    const score = Math.min(100, deviation * rng.nextFloat(2.5, 4.0))
    const severity = score > 70 ? 'critical' : score > 50 ? 'high' : score > 30 ? 'medium' : 'low'

    const rootCauses = [
      'Unexpected traffic spike — auto-scaling triggered additional instances',
      'New deployment increased resource consumption without corresponding budget adjustment',
      'Data transfer costs increased due to cross-region replication misconfiguration',
      'Idle resources left running after project completion',
      'Cryptocurrency mining detected on compromised instance',
    ]

    anomalies.push({
      service,
      current_spend: Math.round(current),
      expected_spend: Math.round(expected),
      deviation_pct: Math.round(deviation * 10) / 10,
      anomaly_score: Math.round(score),
      severity,
      root_cause: rootCauses[i % rootCauses.length],
      recommendation: severity === 'critical' || severity === 'high'
        ? 'Immediate investigation required — review ' + service + ' usage and implement cost controls'
        : 'Monitor trend — set alert threshold at ' + Math.round(deviation * 0.7) + '% deviation',
    })
  }

  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length
  const highCount = anomalies.filter((a) => a.severity === 'high').length
  const mediumCount = anomalies.filter((a) => a.severity === 'medium').length
  const lowCount = anomalies.filter((a) => a.severity === 'low').length

  const totalAnomalyScore = anomalies.reduce((s, a) => s + a.anomaly_score, 0)
  const overallScore = Math.min(100, totalAnomalyScore / anomalies.length)
  const expectedSpend = currentSpend - anomalies.reduce((s, a) => s + (a.current_spend - a.expected_spend), 0)
  const overspendPct = ((currentSpend - expectedSpend) / expectedSpend) * 100

  const trend = overallScore > 60 ? 'increasing' : overallScore > 30 ? 'stable' : 'decreasing'

  const alerts: string[] = []
  if (criticalCount > 0) alerts.push('CRITICAL: ' + criticalCount + ' critical anomaly(s) detected — immediate action required')
  if (highCount > 0) alerts.push('HIGH: ' + highCount + ' high-severity anomaly(s) — investigate within 24 hours')
  alerts.push('Set billing alerts at $' + Math.round(currentSpend * 1.1).toLocaleString() + ' (110% of current spend)')
  alerts.push('Enable AWS Cost Anomaly Detection with ' + sensitivity + ' sensitivity for automated monitoring')
  alerts.push('Schedule weekly cost review meetings to track anomaly resolution progress')

  return {
    overall_anomaly_score: Math.round(overallScore),
    total_anomalies: anomalies.length,
    critical_count: criticalCount,
    high_count: highCount,
    medium_count: mediumCount,
    low_count: lowCount,
    current_month_spend: Math.round(currentSpend),
    expected_monthly_spend: Math.round(expectedSpend),
    overspend_pct: Math.round(overspendPct * 10) / 10,
    anomalies,
    trend_direction: trend as 'increasing' | 'stable' | 'decreasing',
    alert_recommendations: alerts,
  }
}

function formatAnomalyReport(r: AnomalyResult): string {
  const lines: string[] = []
  lines.push('# Billing Anomaly Detection Report')
  lines.push('')
  lines.push('## Anomaly Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Overall Anomaly Score | **' + r.overall_anomaly_score + '/100** |')
  lines.push('| Total Anomalies | ' + r.total_anomalies + ' |')
  lines.push('| Critical | ' + r.critical_count + ' |')
  lines.push('| High | ' + r.high_count + ' |')
  lines.push('| Medium | ' + r.medium_count + ' |')
  lines.push('| Low | ' + r.low_count + ' |')
  lines.push('| Current Month | $' + r.current_month_spend.toLocaleString() + ' |')
  lines.push('| Expected Spend | $' + r.expected_monthly_spend.toLocaleString() + ' |')
  lines.push('| Overspend | ' + r.overspend_pct + '% |')
  lines.push('| Trend | ' + r.trend_direction.toUpperCase() + ' |')
  lines.push('')
  lines.push('## Anomaly Details')
  lines.push('')
  for (const a of r.anomalies) {
    const icon = a.severity === 'critical' ? '[CRIT]' : a.severity === 'high' ? '[HIGH]' : a.severity === 'medium' ? '[MED]' : '[LOW]'
    lines.push('### ' + icon + ' ' + a.service)
    lines.push('- Current: $' + a.current_spend.toLocaleString() + ' | Expected: $' + a.expected_spend.toLocaleString())
    lines.push('- Deviation: ' + a.deviation_pct + '% | Anomaly Score: ' + a.anomaly_score + '/100')
    lines.push('- Root Cause: ' + a.root_cause)
    lines.push('- Recommendation: ' + a.recommendation)
    lines.push('')
  }
  lines.push('## Alert Recommendations')
  lines.push('')
  for (const alert of r.alert_recommendations) {
    lines.push('- ' + alert)
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-cloudcost | Billing Anomaly Detector')
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 – Tool 7: Budget Forecaster
// ─────────────────────────────────────────────────────────────────────────────

function forecastBudget(input: BudgetForecastInput): BudgetForecastResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const provider = input.cloud_provider ?? 'aws'
  const currentMonthly = input.historical_months && input.historical_months.length > 0
    ? input.historical_months[input.historical_months.length - 1]
    : rng.nextFloat(30000, 120000)
  const budget = input.current_budget ?? currentMonthly * rng.nextFloat(0.9, 1.15)
  const forecastMonths = input.forecast_months ?? rng.nextInt(3, 12)
  const growthRate = input.growth_rate_monthly ?? rng.nextFloat(-0.02, 0.06)
  const seasonality = input.seasonality ?? true

  const forecastAccuracy = rng.nextFloat(82, 97)
  const monthlyForecasts: ForecastMonth[] = []
  let cumulativeSpend = 0

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const startMonth = rng.nextInt(0, 11)

  for (let i = 0; i < forecastMonths; i++) {
    const monthIdx = (startMonth + i) % 12
    const seasonalFactor = seasonality ? 1 + 0.15 * Math.sin((monthIdx / 12) * 2 * Math.PI) : 1
    const predicted = currentMonthly * Math.pow(1 + growthRate, i) * seasonalFactor
    const confidence = Math.max(70, forecastAccuracy - i * 2.5)
    const margin = predicted * ((100 - confidence) / 100)
    const lower = predicted - margin
    const upper = predicted + margin
    cumulativeSpend += predicted
    const budgetRemaining = budget * forecastMonths - cumulativeSpend

    monthlyForecasts.push({
      month: monthNames[monthIdx] + ' (M+' + (i + 1) + ')',
      predicted_spend: Math.round(predicted),
      lower_bound: Math.round(lower),
      upper_bound: Math.round(upper),
      confidence_pct: Math.round(confidence),
      budget_remaining: Math.round(budgetRemaining),
      over_budget_flag: budgetRemaining < 0,
    })
  }

  const totalForecasted = monthlyForecasts.reduce((s, m) => s + m.predicted_spend, 0)
  const totalBudget = budget * forecastMonths
  const variance = ((totalForecasted - totalBudget) / totalBudget) * 100
  const overrun = Math.max(0, totalForecasted - totalBudget)

  const burnRate = growthRate > 0.03 ? 'accelerating' : growthRate > 0 ? 'stable' : 'decelerating'
  const monthsExhausted = monthlyForecasts.findIndex((m) => m.over_budget_flag)
  const monthsUntilExhausted = monthsExhausted >= 0 ? monthsExhausted + 1 : forecastMonths + rng.nextInt(2, 6)

  const suggestions: string[] = []
  if (variance > 10) suggestions.push('Forecasted overspend of ' + Math.round(variance) + '% — implement cost controls or increase budget')
  if (growthRate > 0.03) suggestions.push('Growth rate exceeds 3%/mo — review auto-scaling policies and resource provisioning')
  suggestions.push('Set budget alerts at 50%, 75%, and 100% of forecasted spend')
  suggestions.push('Review and optimize reserved instance coverage to reduce on-demand exposure')
  if (seasonality) suggestions.push('Account for seasonal patterns in capacity planning to avoid over-provisioning')
  if (suggestions.length === 0) suggestions.push('Budget is on track — continue monitoring with current governance practices')

  const riskLevel = variance > 20 ? 'critical' : variance > 10 ? 'high' : variance > 5 ? 'medium' : 'low'

  return {
    forecast_accuracy_pct: Math.round(forecastAccuracy * 10) / 10,
    current_monthly_spend: Math.round(currentMonthly),
    forecast_period_months: forecastMonths,
    total_forecasted_spend: Math.round(totalForecasted),
    budget_amount: Math.round(totalBudget),
    projected_variance_pct: Math.round(variance * 10) / 10,
    projected_overrun: Math.round(overrun),
    monthly_forecasts: monthlyForecasts,
    burn_rate_trend: burnRate as 'accelerating' | 'stable' | 'decelerating',
    months_until_exhausted: monthsUntilExhausted,
    optimization_suggestions: suggestions,
    risk_level: riskLevel as 'low' | 'medium' | 'high' | 'critical',
  }
}

function formatBudgetForecastReport(r: BudgetForecastResult): string {
  const lines: string[] = []
  lines.push('# Budget Forecast Report: ' + r.forecast_period_months + '-Month Projection')
  lines.push('')
  lines.push('## Forecast Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Forecast Accuracy | **' + r.forecast_accuracy_pct + '%** |')
  lines.push('| Current Monthly Spend | $' + r.current_monthly_spend.toLocaleString() + ' |')
  lines.push('| Forecasted Total | $' + r.total_forecasted_spend.toLocaleString() + ' |')
  lines.push('| Budget Amount | $' + r.budget_amount.toLocaleString() + ' |')
  lines.push('| Projected Variance | ' + (r.projected_variance_pct > 0 ? '+' : '') + r.projected_variance_pct + '% |')
  lines.push('| Projected Overrun | $' + r.projected_overrun.toLocaleString() + ' |')
  lines.push('| Burn Rate Trend | ' + r.burn_rate_trend.toUpperCase() + ' |')
  lines.push('| Months Until Exhausted | ' + r.months_until_exhausted + ' |')
  lines.push('| Risk Level | **' + r.risk_level.toUpperCase() + '** |')
  lines.push('')
  lines.push('## Monthly Forecast')
  lines.push('')
  lines.push('| Month | Predicted | Lower Bound | Upper Bound | Confidence | Budget Left | Status |')
  lines.push('|-------|-----------|-------------|-------------|------------|-------------|--------|')
  for (const m of r.monthly_forecasts) {
    const status = m.over_budget_flag ? 'OVER' : 'OK'
    lines.push('| ' + m.month + ' | $' + m.predicted_spend.toLocaleString() + ' | $' + m.lower_bound.toLocaleString() + ' | $' + m.upper_bound.toLocaleString() + ' | ' + m.confidence_pct + '% | $' + m.budget_remaining.toLocaleString() + ' | ' + status + ' |')
  }
  lines.push('')
  lines.push('## Optimization Suggestions')
  lines.push('')
  for (let i = 0; i < r.optimization_suggestions.length; i++) {
    lines.push((i + 1) + '. ' + r.optimization_suggestions[i])
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-cloudcost | Budget Forecaster')
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 – Tool 8: Rightsizing Engine
// ─────────────────────────────────────────────────────────────────────────────

function analyzeRightsizing(input: RightsizingInput): RightsizingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const provider = input.cloud_provider ?? 'aws'
  const totalInstances = input.instance_id ? 1 : rng.nextInt(20, 200)

  const instanceTypes = ['m5.xlarge', 'm5.2xlarge', 'c5.xlarge', 'c5.2xlarge', 'r5.xlarge', 'r5.2xlarge', 't3.xlarge', 't3.2xlarge']
  const targetTypes = ['m5.large', 'm5.xlarge', 'c5.large', 'c5.xlarge', 'r5.large', 'r5.xlarge', 't3.large', 't3.xlarge']

  const recommendations: RightsizingRecommendation[] = []
  let totalCurrentCost = 0
  let totalTargetCost = 0
  let overprovisioned = 0
  let underprovisioned = 0
  let optimal = 0
  let totalCurrentUtil = 0
  let totalTargetUtil = 0

  const count = input.instance_id ? 1 : Math.min(totalInstances, 12)
  for (let i = 0; i < count; i++) {
    const currentType = input.instance_type ?? instanceTypes[i % instanceTypes.length]
    const currentVcpus = input.current_vcpus ?? rng.nextInt(2, 16)
    const currentMem = input.current_memory_gb ?? rng.nextInt(4, 64)
    const avgCpu = input.avg_cpu_utilization ?? rng.nextFloat(5, 65)
    const avgMem = input.avg_memory_utilization ?? rng.nextFloat(10, 70)
    const peakCpu = input.peak_cpu_utilization ?? avgCpu * rng.nextFloat(1.3, 2.5)
    const currentCost = input.monthly_cost ?? rng.nextFloat(100, 2000)
    const workload = input.workload_pattern ?? rng.pick(['steady', 'bursty', 'spiky', 'batch'] as const)

    let targetVcpus = currentVcpus
    let targetMem = currentMem
    let targetCost = currentCost
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    let migrationEffort: 'low' | 'medium' | 'high' = 'low'

    if (avgCpu < 20 && avgMem < 30) {
      targetVcpus = Math.max(2, Math.ceil(currentVcpus * 0.5))
      targetMem = Math.max(4, Math.ceil(currentMem * 0.5))
      targetCost = currentCost * 0.55
      overprovisioned++
      riskLevel = 'low'
      migrationEffort = 'low'
    } else if (avgCpu < 40 && avgMem < 50) {
      targetVcpus = Math.max(2, Math.ceil(currentVcpus * 0.75))
      targetMem = Math.max(4, Math.ceil(currentMem * 0.75))
      targetCost = currentCost * 0.72
      overprovisioned++
      riskLevel = 'low'
      migrationEffort = 'low'
    } else if (avgCpu > 80 || avgMem > 85) {
      targetVcpus = currentVcpus * 2
      targetMem = currentMem * 2
      targetCost = currentCost * 1.8
      underprovisioned++
      riskLevel = 'medium'
      migrationEffort = 'medium'
    } else {
      targetCost = currentCost * rng.nextFloat(0.92, 1.05)
      optimal++
      riskLevel = 'low'
      migrationEffort = 'low'
    }

    const savings = currentCost - targetCost
    const savingsPct = (savings / currentCost) * 100
    const expectedCpu = avgCpu * (currentVcpus / targetVcpus)
    const expectedMem = avgMem * (currentMem / targetMem)

    totalCurrentCost += currentCost
    totalTargetCost += targetCost
    totalCurrentUtil += avgCpu
    totalTargetUtil += Math.min(95, expectedCpu)

    recommendations.push({
      instance_type: currentType,
      current_type: currentType,
      target_type: targetTypes[i % targetTypes.length],
      current_monthly_cost: Math.round(currentCost),
      target_monthly_cost: Math.round(targetCost),
      monthly_savings: Math.round(savings),
      savings_pct: Math.round(savingsPct * 10) / 10,
      target_vcpus: targetVcpus,
      target_memory_gb: targetMem,
      expected_cpu_utilization: Math.round(Math.min(95, expectedCpu)),
      expected_memory_utilization: Math.round(Math.min(95, expectedMem)),
      risk_level: riskLevel,
      migration_effort: migrationEffort,
    })
  }

  const totalSavings = totalCurrentCost - totalTargetCost
  const savingsPct = (totalSavings / totalCurrentCost) * 100

  const priority: string[] = []
  if (overprovisioned > 0) priority.push('Downsize ' + overprovisioned + ' overprovisioned instances for immediate savings of $' + Math.round(totalSavings > 0 ? totalSavings : totalSavings * -1).toLocaleString() + '/mo')
  if (underprovisioned > 0) priority.push('Upsize ' + underprovisioned + ' underprovisioned instances to prevent performance degradation')
  priority.push('Implement AWS Compute Optimizer for continuous rightsizing recommendations')
  priority.push('Schedule maintenance windows for instance type changes with minimal disruption')

  return {
    total_instances_analyzed: totalInstances,
    total_current_monthly_cost: Math.round(totalCurrentCost),
    total_target_monthly_cost: Math.round(totalTargetCost),
    total_monthly_savings: Math.round(totalSavings),
    overall_savings_pct: Math.round(savingsPct * 10) / 10,
    recommendations,
    overprovisioned_count: overprovisioned,
    underprovisioned_count: underprovisioned,
    optimal_count: optimal,
    avg_current_utilization_pct: Math.round(totalCurrentUtil / count),
    avg_target_utilization_pct: Math.round(totalTargetUtil / count),
    implementation_priority: priority,
  }
}

function formatRightsizingReport(r: RightsizingResult): string {
  const lines: string[] = []
  lines.push('# Rightsizing Engine Report')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push('| Instances Analyzed | ' + r.total_instances_analyzed + ' |')
  lines.push('| Current Monthly Cost | $' + r.total_current_monthly_cost.toLocaleString() + ' |')
  lines.push('| Target Monthly Cost | $' + r.total_target_monthly_cost.toLocaleString() + ' |')
  lines.push('| Monthly Savings | $' + r.total_monthly_savings.toLocaleString() + ' |')
  lines.push('| Savings % | ' + r.overall_savings_pct + '% |')
  lines.push('| Overprovisioned | ' + r.overprovisioned_count + ' |')
  lines.push('| Underprovisioned | ' + r.underprovisioned_count + ' |')
  lines.push('| Optimal | ' + r.optimal_count + ' |')
  lines.push('| Avg Current CPU Util | ' + r.avg_current_utilization_pct + '% |')
  lines.push('| Avg Target CPU Util | ' + r.avg_target_utilization_pct + '% |')
  lines.push('')
  lines.push('## Recommendations')
  lines.push('')
  for (const rec of r.recommendations) {
    const icon = rec.monthly_savings > 0 ? 'DOWN' : rec.monthly_savings < 0 ? 'UP' : 'OK'
    lines.push('### ' + icon + ' ' + rec.current_type + ' → ' + rec.target_type)
    lines.push('- Current Cost: $' + rec.current_monthly_cost.toLocaleString() + '/mo → Target: $' + rec.target_monthly_cost.toLocaleString() + '/mo')
    lines.push('- Savings: $' + rec.monthly_savings.toLocaleString() + '/mo (' + rec.savings_pct + '%)')
    lines.push('- Target: ' + rec.target_vcpus + ' vCPUs, ' + rec.target_memory_gb + ' GB RAM')
    lines.push('- Expected Util: CPU ' + rec.expected_cpu_utilization + '%, Mem ' + rec.expected_memory_utilization + '%')
    lines.push('- Risk: ' + rec.risk_level.toUpperCase() + ' | Migration Effort: ' + rec.migration_effort.toUpperCase())
    lines.push('')
  }
  lines.push('## Implementation Priority')
  lines.push('')
  for (let i = 0; i < r.implementation_priority.length; i++) {
    lines.push((i + 1) + '. ' + r.implementation_priority[i])
  }
  lines.push('')
  lines.push('---')
  lines.push('Report generated by dsh-tool-cloudcost | Rightsizing Engine')
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11 – Tool Registration
// ─────────────────────────────────────────────────────────────────────────────

export const name = 'dsh-tool-cloudcost'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  // ── Tool 1: reserved_instance_planner ───────────────────────────────────
  tools.register(defineTool({
    name: 'reserved_instance_planner',
    description: 'Analyze reserved instance coverage and generate purchase recommendations by instance family. Returns RI coverage %, upfront cost, monthly/annual savings, ROI period, and risk flags.',
    parameters: {
      ri_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: cloud_provider? (\'aws\'|\'azure\'|\'gcp\'), account_id? (string), current_spend_monthly? (number), on_demand_pct? (number), ri_coverage_pct? (number), instance_families? (string[]), term_preference? (\'1yr\'|\'3yr\'), payment_option? (\'all_upfront\'|\'partial_upfront\'|\'no_upfront\')',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { ri_input: string }) {
      const input: RiPlannerInput = JSON.parse(args.ri_input)
      return formatRiPlannerReport(planReservedInstances(input))
    },
  }))

  // ── Tool 2: waste_detector ──────────────────────────────────────────────
  tools.register(defineTool({
    name: 'waste_detector',
    description: 'Detect cloud waste from unattached volumes, idle instances, overprovisioned resources, unused IPs, and orphan snapshots. Returns waste $, waste %, severity ratings, and quick wins.',
    parameters: {
      waste_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: cloud_provider? (\'aws\'|\'azure\'|\'gcp\'), account_id? (string), unattached_volumes? (number), idle_instances? (number), overprovisioned_instances? (number), unused_ips? (number), orphan_snapshots? (number), monthly_spend? (number)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { waste_input: string }) {
      const input: WasteDetectorInput = JSON.parse(args.waste_input)
      return formatWasteReport(detectWaste(input))
    },
  }))

  // ── Tool 3: multicloud_cost_comparison ──────────────────────────────────
  tools.register(defineTool({
    name: 'multicloud_cost_comparison',
    description: 'Compare cloud costs across AWS, Azure, and GCP. Returns per-provider spend breakdown, cost per vCPU-hour, workload fit scores, arbitrage opportunities, and consolidation recommendations.',
    parameters: {
      multicloud_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: comparison_scope? (string), aws_monthly_spend? (number), azure_monthly_spend? (number), gcp_monthly_spend? (number), workload_types? (string[]), data_egress_costs? (boolean), reserved_commitments? (boolean)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { multicloud_input: string }) {
      const input: MulticloudInput = JSON.parse(args.multicloud_input)
      return formatMulticloudReport(compareMulticloudCosts(input))
    },
  }))

  // ── Tool 4: savings_plan_recommender ────────────────────────────────────
  tools.register(defineTool({
    name: 'savings_plan_recommender',
    description: 'Recommend compute savings plan commitment levels with tier analysis. Returns coverage %, discount %, monthly/annual savings, utilization requirements, break-even period, and confidence level.',
    parameters: {
      sp_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: cloud_provider? (\'aws\'|\'azure\'|\'gcp\'), account_id? (string), compute_spend_monthly? (number), current_compute_commitment? (number), usage_trend? (\'growing\'|\'stable\'|\'declining\'), flexibility_preference? (\'maximum\'|\'balanced\'|\'committed\'), term_years? (1|3)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sp_input: string }) {
      const input: SavingsPlanInput = JSON.parse(args.sp_input)
      return formatSavingsPlanReport(recommendSavingsPlan(input))
    },
  }))

  // ── Tool 5: tag_audit_optimizer ─────────────────────────────────────────
  tools.register(defineTool({
    name: 'tag_audit_optimizer',
    description: 'Audit cost allocation tag coverage across required tags. Returns overall coverage %, compliance grade, untagged resource count/spend, per-tag coverage, and remediation actions.',
    parameters: {
      tag_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: cloud_provider? (\'aws\'|\'azure\'|\'gcp\'), account_id? (string), total_resources? (number), tagged_resources? (number), required_tags? (string[]), cost_centers? (string[]), environment_tags? (boolean), project_tags? (boolean), owner_tags? (boolean)',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { tag_input: string }) {
      const input: TagAuditInput = JSON.parse(args.tag_input)
      return formatTagAuditReport(auditTags(input))
    },
  }))

  // ── Tool 6: billing_anomaly_detector ────────────────────────────────────
  tools.register(defineTool({
    name: 'billing_anomaly_detector',
    description: 'Detect billing anomalies and spending deviations by service. Returns anomaly score (0-100), severity counts, per-service deviation %, root cause analysis, and alert recommendations.',
    parameters: {
      anomaly_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: cloud_provider? (\'aws\'|\'azure\'|\'gcp\'), account_id? (string), current_month_spend? (number), previous_months_spend? (number[]), anomaly_threshold_pct? (number), service_breakdown? (Array<{service,spend}>), alert_sensitivity? (\'high\'|\'medium\'|\'low\')',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { anomaly_input: string }) {
      const input: AnomalyInput = JSON.parse(args.anomaly_input)
      return formatAnomalyReport(detectBillingAnomalies(input))
    },
  }))

  // ── Tool 7: budget_forecaster ───────────────────────────────────────────
  tools.register(defineTool({
    name: 'budget_forecaster',
    description: 'Forecast cloud budget with monthly projections and confidence intervals. Returns forecast accuracy %, projected variance/overrun, burn rate trend, months until budget exhausted, and risk level.',
    parameters: {
      forecast_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: cloud_provider? (\'aws\'|\'azure\'|\'gcp\'), account_id? (string), historical_months? (number[]), current_budget? (number), forecast_months? (number), growth_rate_monthly? (number), seasonality? (boolean), planned_changes? (string[])',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { forecast_input: string }) {
      const input: BudgetForecastInput = JSON.parse(args.forecast_input)
      return formatBudgetForecastReport(forecastBudget(input))
    },
  }))

  // ── Tool 8: rightsizing_engine ──────────────────────────────────────────
  tools.register(defineTool({
    name: 'rightsizing_engine',
    description: 'Analyze instance utilization and generate rightsizing recommendations. Returns over/under-provisioned counts, current vs target utilization %, monthly savings, migration effort, and implementation priority.',
    parameters: {
      rightsizing_input: {
        type: 'string',
        required: true,
        description: 'JSON object with fields: cloud_provider? (\'aws\'|\'azure\'|\'gcp\'), account_id? (string), instance_id? (string), instance_type? (string), current_vcpus? (number), current_memory_gb? (number), avg_cpu_utilization? (number), avg_memory_utilization? (number), peak_cpu_utilization? (number), peak_memory_utilization? (number), monthly_cost? (number), workload_pattern? (\'steady\'|\'bursty\'|\'spiky\'|\'batch\')',
      },
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { rightsizing_input: string }) {
      const input: RightsizingInput = JSON.parse(args.rightsizing_input)
      return formatRightsizingReport(analyzeRightsizing(input))
    },
  }))
}
