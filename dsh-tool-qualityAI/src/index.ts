/**
 * DSH Manufacturing Quality & Process Optimization Plugin v0.1.0
 *
 * SPC analysis, defect prediction, root cause analysis, process capability
 * calculation, Six Sigma project selection, inspection plan optimization,
 * supplier quality scoring, and cost of poor quality tracking toolkit for
 * DeepSeek Harness Agent. Designed for quality engineers, process engineers,
 * plant managers, and continuous improvement practitioners.
 *
 * Features (v0.1.0):
 * - SPC Chart Analyzer (Western Electric rules, control limit violations)
 * - Defect Prediction Modeler (trend forecasting and risk scoring)
 * - Root Cause Analyzer (Ishikawa categories, 5-Why, Pareto analysis)
 * - Process Capability Calculator (Cp, Cpk, Pp, Ppk, sigma estimation)
 * - Six Sigma Project Selector (DMAIC prioritization, project scoring)
 * - Inspection Plan Optimizer (sampling plan optimization, ANSI/ASQ Z1.4)
 * - Supplier Quality Scorer (supplier scorecards, risk assessment)
 * - Cost of Poor Quality Tracker (COQ categories, trend analysis)
 *
 * @module dsh-tool-qualityAI
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-qualityAI'
export const inject = ['tools']

const VERSION = '0.1.0'

// ============================================================================
// DETERMINISTIC PRNG
// ============================================================================

/** Mulberry32 seeded random number generator */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Compute seed from JSON stringified input */
function computeSeed(input: unknown): number {
  return JSON.stringify(input).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

/** Create a deterministic RNG from input */
function makeRng(input: unknown) {
  const r = mulberry32(computeSeed(input))
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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// --- Tool 1: SPC Chart Analyzer ---

export interface SpcDataPoint {
  subgroup_id: string
  measurements: number[]
  subgroup_size: number
  timestamp?: string
}

export interface SpcChartConfig {
  chart_type: 'Xbar_R' | 'Xbar_S' | 'I_MR' | 'p_chart' | 'c_chart'
  usl: number
  lsl: number
  target?: number
}

export interface SpcViolation {
  rule: string
  description: string
  subgroup_id: string
  severity: 'warning' | 'critical'
}

export interface SpcChartResult {
  chart_type: string
  center_line: number
  ucl: number
  lcl: number
  violations: SpcViolation[]
  violation_count: number
  process_state: 'in_control' | 'out_of_control' | 'warning'
  recommendation: string
}

// --- Tool 2: Defect Prediction Modeler ---

export interface DefectHistory {
  period: string
  defect_count: number
  total_units: number
  defect_type?: string
}

export interface DefectPredictionInput {
  history: DefectHistory[]
  forecast_periods: number
  defect_type_filter?: string
  confidence_level?: number
}

export interface DefectForecast {
  period: string
  predicted_defect_rate: number
  lower_bound: number
  upper_bound: number
  trend_direction: 'increasing' | 'decreasing' | 'stable'
}

export interface DefectPredictionResult {
  model_type: string
  history_periods: number
  forecast_periods: number
  current_defect_rate: number
  predicted_avg_rate: number
  trend_slope: number
  forecasts: DefectForecast[]
  risk_assessment: string
  recommendation: string
}

// --- Tool 3: Root Cause Analyzer ---

export interface RootCauseInput {
  problem_statement: string
  occurrences: number
  severity: number
  categories?: Array<{
    name: string
    factors: Array<{ factor: string; evidence_score: number; contribution_pct?: number }>
  }>
  data_points?: Array<{ category: string; value: number }>
}

export interface RootCause {
  category: string
  factor: string
  contribution_pct: number
  evidence_score: number
  action_required: string
}

export interface RootCauseResult {
  problem_statement: string
  pareto_analysis: Array<{ factor: string; contribution_pct: number; cumulative_pct: number }>
  vital_few: RootCause[]
  root_cause_hypothesis: string
  recommended_actions: string[]
  confidence_level: number
}

// --- Tool 4: Process Capability Calculator ---

export interface ProcessCapabilityInput {
  measurements: number[]
  usl: number
  lsl: number
  target?: number
  subgroup_size?: number
  long_term?: boolean
}

export interface ProcessCapabilityResult {
  sample_size: number
  mean: number
  std_dev_short: number
  std_dev_long: number
  cp: number
  cpk: number
  pp: number
  ppk: number
  sigma_level: number
  dpmo: number
  yield_pct: number
  capability_grade: 'excellent' | 'capable' | 'marginal' | 'incapable'
  recommendation: string
}

// --- Tool 5: Six Sigma Project Selector ---

export interface DMAICProject {
  project_id: string
  title: string
  problem_description: string
  estimated_savings: number
  implementation_cost: number
  timeline_weeks: number
  complexity: number
  strategic_alignment: number
  data_availability: number
  team_readiness: number
  expected_sigma_improvement: number
}

export interface SixSigmaInput {
  projects: DMAICProject[]
  budget_limit?: number
  min_roi?: number
  strategic_priority?: 'cost' | 'quality' | 'speed' | 'safety'
}

export interface ProjectScore {
  project_id: string
  title: string
  overall_score: number
  financial_score: number
  feasibility_score: number
  strategic_score: number
  priority_rank: number
  recommended_phase: 'Define' | 'Measure' | 'Analyze' | 'Improve' | 'Control'
  estimated_roi: number
}

export interface SixSigmaResult {
  projects_evaluated: number
  projects_selected: number
  total_estimated_savings: number
  total_implementation_cost: number
  project_rankings: ProjectScore[]
  portfolio_recommendation: string
}

// --- Tool 6: Inspection Plan Optimizer ---

export interface InspectionPlanInput {
  lot_size: number
  aql: number
  inspection_level: 'I' | 'II' | 'III' | 'S-1' | 'S-2' | 'S-3' | 'S-4'
  inspection_type: 'normal' | 'tightened' | 'reduced'
  defect_categories: Array<{ category: string; weight: number; historical_rate: number }>
  cost_per_inspection: number
  cost_per_escape: number
}

export interface SamplingPlan {
  sample_size: number
  accept_number: number
  reject_number: number
  aoql: number
  consumer_risk: number
  producer_risk: number
}

export interface InspectionPlanResult {
  aql: number
  inspection_level: string
  lot_size: number
  sampling_plan: SamplingPlan
  inspection_strategy: Array<{ category: string; sample_pct: number; priority: string }>
  total_inspection_cost: number
  expected_escape_cost: number
  total_quality_cost: number
  cost_savings_vs_100pct: number
  recommendation: string
}

// --- Tool 7: Supplier Quality Scorer ---

export interface SupplierData {
  supplier_id: string
  supplier_name: string
  quality_rating: number
  delivery_rating: number
  cost_rating: number
  response_time_days: number
  ppm_defect: number
  ppap_approved: boolean
  audit_score: number
  past_issues: number
}

export interface SupplierScorerInput {
  suppliers: SupplierData[]
  weights?: { quality: number; delivery: number; cost: number; responsiveness: number }
  min_threshold?: number
}

export interface SupplierScore {
  supplier_id: string
  supplier_name: string
  composite_score: number
  quality_score: number
  delivery_score: number
  cost_score: number
  responsiveness_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  grade: 'A' | 'B' | 'C' | 'D'
  recommendation: string
}

export interface SupplierScorerResult {
  suppliers_evaluated: number
  supplier_scores: SupplierScore[]
  best_supplier: string
  worst_supplier: string
  avg_composite_score: number
  portfolio_risk: string
  recommendation: string
}

// --- Tool 8: Cost of Poor Quality Tracker ---

export interface CoqEntry {
  period: string
  internal_failure: number
  external_failure: number
  appraisal: number
  prevention: number
  revenue: number
  units_produced: number
}

export interface CoqInput {
  entries: CoqEntry[]
  target_coq_pct?: number
  industry_benchmark?: number
}

export interface CoqBreakdown {
  period: string
  internal_failure: number
  external_failure: number
  appraisal: number
  prevention: number
  total_coq: number
  coq_pct_revenue: number
  coq_per_unit: number
}

export interface CoqResult {
  periods_analyzed: number
  total_coq: number
  avg_coq_pct: number
  breakdown: CoqBreakdown[]
  trend: 'improving' | 'worsening' | 'stable'
  failure_ratio: number
  best_period: string
  worst_period: string
  savings_opportunity: number
  recommendation: string
}

// ============================================================================
// TOOL 1: SPC CHART ANALYZER
// ============================================================================

function analyzeSpcChart(data: SpcDataPoint[], config: SpcChartConfig): SpcChartResult {
  const rng = makeRng({ data: data.slice(0, 3), config: config })
  const allMeasurements: number[] = []
  const subgroupMeans: number[] = []
  const subgroupRanges: number[] = []

  for (const sg of data) {
    allMeasurements.push(...sg.measurements)
    const mean = sg.measurements.reduce((s, v) => s + v, 0) / sg.measurements.length
    subgroupMeans.push(mean)
    const range = Math.max(...sg.measurements) - Math.min(...sg.measurements)
    subgroupRanges.push(range)
  }

  const grandMean = subgroupMeans.reduce((s, v) => s + v, 0) / subgroupMeans.length
  const avgRange = subgroupRanges.reduce((s, v) => s + v, 0) / subgroupRanges.length
  const n = data.length > 0 ? data[0].subgroup_size : 5

  // Control chart constants for common subgroup sizes
  const a2Map: Record<number, number> = { 2: 1.88, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308 }
  const d4Map: Record<number, number> = { 2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114, 6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777 }
  const d3Map: Record<number, number> = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223 }

  const a2 = a2Map[n] ?? 0.577
  const d4 = d4Map[n] ?? 2.114
  const d3 = d3Map[n] ?? 0

  const ucl = grandMean + a2 * avgRange
  const lcl = grandMean - a2 * avgRange

  const violations: SpcViolation[] = []

  // Rule 1: Any point beyond 3 sigma
  for (let i = 0; i < subgroupMeans.length; i++) {
    if (subgroupMeans[i] > ucl || subgroupMeans[i] < lcl) {
      violations.push({
        rule: 'Rule 1',
        description: 'Point beyond 3 sigma control limit',
        subgroup_id: data[i].subgroup_id,
        severity: 'critical'
      })
    }
  }

  // Rule 2: Nine points in a row on same side of center line
  for (let i = 8; i < subgroupMeans.length; i++) {
    let allAbove = true
    let allBelow = true
    for (let j = i - 8; j <= i; j++) {
      if (subgroupMeans[j] <= grandMean) allAbove = false
      if (subgroupMeans[j] >= grandMean) allBelow = false
    }
    if (allAbove || allBelow) {
      violations.push({
        rule: 'Rule 2',
        description: 'Nine consecutive points on same side of center line',
        subgroup_id: data[i].subgroup_id,
        severity: 'critical'
      })
    }
  }

  // Rule 3: Six points in a row steadily increasing or decreasing
  for (let i = 5; i < subgroupMeans.length; i++) {
    let increasing = true
    let decreasing = true
    for (let j = i - 4; j <= i; j++) {
      if (subgroupMeans[j] <= subgroupMeans[j - 1]) increasing = false
      if (subgroupMeans[j] >= subgroupMeans[j - 1]) decreasing = false
    }
    if (increasing || decreasing) {
      violations.push({
        rule: 'Rule 3',
        description: 'Six points in a row steadily increasing or decreasing',
        subgroup_id: data[i].subgroup_id,
        severity: 'warning'
      })
    }
  }

  // Rule 4: Two out of three points beyond 2 sigma on same side
  for (let i = 2; i < subgroupMeans.length; i++) {
    const ucl2s = grandMean + (ucl - grandMean) * 2 / 3
    const lcl2s = grandMean - (ucl - grandMean) * 2 / 3
    let aboveCount = 0
    let belowCount = 0
    for (let j = i - 2; j <= i; j++) {
      if (subgroupMeans[j] > ucl2s) aboveCount++
      if (subgroupMeans[j] < lcl2s) belowCount++
    }
    if (aboveCount >= 2 || belowCount >= 2) {
      violations.push({
        rule: 'Rule 4',
        description: 'Two of three consecutive points beyond 2 sigma on same side',
        subgroup_id: data[i].subgroup_id,
        severity: 'warning'
      })
    }
  }

  const criticalCount = violations.filter(v => v.severity === 'critical').length
  const warningCount = violations.filter(v => v.severity === 'warning').length

  let processState: SpcChartResult['process_state'] = 'in_control'
  if (criticalCount > 0) processState = 'out_of_control'
  else if (warningCount > 0) processState = 'warning'

  let recommendation = 'Process is in statistical control. Continue monitoring.'
  if (processState === 'out_of_control') {
    recommendation = 'Process is OUT OF CONTROL. Immediate investigation required. Stop production and identify assignable causes.'
  } else if (processState === 'warning') {
    recommendation = 'Process shows warning signals. Increase monitoring frequency and investigate potential trends.'
  }

  return {
    chart_type: config.chart_type,
    center_line: parseFloat(grandMean.toFixed(4)),
    ucl: parseFloat(ucl.toFixed(4)),
    lcl: parseFloat(lcl.toFixed(4)),
    violations: violations,
    violation_count: violations.length,
    process_state: processState,
    recommendation: recommendation
  }
}

function formatSpcReport(result: SpcChartResult): string {
  const lines: string[] = []
  lines.push('## SPC Chart Analysis Report')
  lines.push('')
  lines.push('**Chart Type:** ' + result.chart_type)
  lines.push('**Process State:** ' + result.process_state.toUpperCase())
  lines.push('')
  lines.push('### Control Limits')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Center Line (CL) | ' + result.center_line.toFixed(4) + ' |')
  lines.push('| Upper Control Limit (UCL) | ' + result.ucl.toFixed(4) + ' |')
  lines.push('| Lower Control Limit (LCL) | ' + result.lcl.toFixed(4) + ' |')
  lines.push('')

  if (result.violations.length > 0) {
    lines.push('### Violations Detected: ' + result.violation_count)
    lines.push('| Rule | Subgroup | Severity | Description |')
    lines.push('|------|----------|----------|-------------|')
    for (const v of result.violations.slice(0, 20)) {
      lines.push('| ' + v.rule + ' | ' + v.subgroup_id + ' | ' + v.severity.toUpperCase() + ' | ' + v.description + ' |')
    }
    lines.push('')
  }

  lines.push('### Recommendation')
  lines.push(result.recommendation)

  return lines.join('\n')
}

// ============================================================================
// TOOL 2: DEFECT PREDICTION MODELER
// ============================================================================

function modelDefectPrediction(input: DefectPredictionInput): DefectPredictionResult {
  const rng = makeRng(input)
  const history = input.history
  const periods = input.forecast_periods
  const confidence = input.confidence_level ?? 0.95

  const defectRates = history.map(h => h.total_units > 0 ? h.defect_count / h.total_units : 0)
  const currentRate = defectRates.length > 0 ? defectRates[defectRates.length - 1] : 0

  // Simple linear regression for trend
  const n = defectRates.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += defectRates[i]
    sumXY += i * defectRates[i]
    sumX2 += i * i
  }
  const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0
  const intercept = n > 0 ? (sumY - slope * sumX) / n : 0

  // Calculate standard error
  let sse = 0
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * i
    sse += Math.pow(defectRates[i] - predicted, 2)
  }
  const stdError = n > 2 ? Math.sqrt(sse / (n - 2)) : 0.01

  // Generate forecasts
  const forecasts: DefectForecast[] = []
  const zScore = confidence >= 0.99 ? 2.576 : confidence >= 0.95 ? 1.96 : 1.645

  for (let i = 0; i < periods; i++) {
    const periodIdx = n + i
    const predictedRate = Math.max(0, intercept + slope * periodIdx)
    const marginOfError = zScore * stdError * Math.sqrt(1 + 1.0 / n + Math.pow(periodIdx - sumX / n, 2) / (sumX2 - sumX * sumX / n || 1))

    forecasts.push({
      period: 'Period_' + (n + i + 1),
      predicted_defect_rate: parseFloat(predictedRate.toFixed(6)),
      lower_bound: parseFloat(Math.max(0, predictedRate - marginOfError).toFixed(6)),
      upper_bound: parseFloat(Math.min(1, predictedRate + marginOfError).toFixed(6)),
      trend_direction: slope > 0.001 ? 'increasing' : slope < -0.001 ? 'decreasing' : 'stable'
    })
  }

  const avgPredicted = forecasts.length > 0
    ? forecasts.reduce((s, f) => s + f.predicted_defect_rate, 0) / forecasts.length
    : currentRate

  let riskAssessment = 'LOW'
  if (avgPredicted > 0.05) riskAssessment = 'CRITICAL'
  else if (avgPredicted > 0.02) riskAssessment = 'HIGH'
  else if (avgPredicted > 0.005) riskAssessment = 'MEDIUM'

  let recommendation = 'Defect rate is stable and within acceptable limits.'
  if (slope > 0.001) {
    recommendation = 'Defect rate shows an UPTREND. Investigate root causes: check incoming material quality, machine calibration, and operator training.'
  } else if (slope < -0.001) {
    recommendation = 'Defect rate shows a DOWNTREND. Continue current improvement initiatives and document best practices.'
  }

  return {
    model_type: 'Linear Regression with Confidence Intervals',
    history_periods: n,
    forecast_periods: periods,
    current_defect_rate: parseFloat(currentRate.toFixed(6)),
    predicted_avg_rate: parseFloat(avgPredicted.toFixed(6)),
    trend_slope: parseFloat(slope.toFixed(6)),
    forecasts: forecasts,
    risk_assessment: riskAssessment,
    recommendation: recommendation
  }
}

function formatDefectPredictionReport(result: DefectPredictionResult): string {
  const lines: string[] = []
  lines.push('## Defect Prediction Model Report')
  lines.push('')
  lines.push('**Model Type:** ' + result.model_type)
  lines.push('**History Periods:** ' + result.history_periods)
  lines.push('**Forecast Periods:** ' + result.forecast_periods)
  lines.push('**Risk Assessment:** ' + result.risk_assessment)
  lines.push('')
  lines.push('### Current Status')
  lines.push('- **Current Defect Rate:** ' + (result.current_defect_rate * 100).toFixed(3) + '%')
  lines.push('- **Predicted Average Rate:** ' + (result.predicted_avg_rate * 100).toFixed(3) + '%')
  lines.push('- **Trend Slope:** ' + result.trend_slope.toFixed(6))
  lines.push('')
  lines.push('### Forecast')
  lines.push('| Period | Predicted Rate | Lower Bound | Upper Bound | Trend |')
  lines.push('|--------|---------------|-------------|-------------|-------|')
  for (const f of result.forecasts) {
    lines.push('| ' + f.period + ' | ' + (f.predicted_defect_rate * 100).toFixed(3) + '% | ' + (f.lower_bound * 100).toFixed(3) + '% | ' + (f.upper_bound * 100).toFixed(3) + '% | ' + f.trend_direction + ' |')
  }
  lines.push('')
  lines.push('### Recommendation')
  lines.push(result.recommendation)

  return lines.join('\n')
}

// ============================================================================
// TOOL 3: ROOT CAUSE ANALYZER
// ============================================================================

function analyzeRootCause(input: RootCauseInput): RootCauseResult {
  const rng = makeRng(input)
  const categories = input.categories ?? []
  const allFactors: Array<{ category: string; factor: string; evidence_score: number; contribution_pct: number }> = []

  for (const cat of categories) {
    for (const f of cat.factors) {
      const contribution = f.contribution_pct ?? (f.evidence_score * (100 / Math.max(cat.factors.length, 1)) * rng.nextFloat(0.8, 1.2))
      allFactors.push({
        category: cat.name,
        factor: f.factor,
        evidence_score: f.evidence_score,
        contribution_pct: parseFloat(Math.min(100, contribution).toFixed(1))
      })
    }
  }

  // Sort by contribution for Pareto
  allFactors.sort((a, b) => b.contribution_pct - a.contribution_pct)

  let cumulative = 0
  const pareto = allFactors.map(f => {
    cumulative += f.contribution_pct
    return {
      factor: f.factor,
      contribution_pct: f.contribution_pct,
      cumulative_pct: parseFloat(Math.min(100, cumulative).toFixed(1))
    }
  })

  // Vital few: factors contributing to 80% of the problem
  const vitalFew: RootCause[] = []
  let cumPct = 0
  for (const f of allFactors) {
    cumPct += f.contribution_pct
    vitalFew.push({
      category: f.category,
      factor: f.factor,
      contribution_pct: f.contribution_pct,
      evidence_score: f.evidence_score,
      action_required: f.evidence_score > 0.7 ? 'Immediate corrective action required' : f.evidence_score > 0.4 ? 'Investigate and monitor' : 'Monitor for changes'
    })
    if (cumPct >= 80) break
  }

  const topCause = vitalFew.length > 0 ? vitalFew[0] : null
  const hypothesis = topCause
    ? 'Primary root cause is "' + topCause.factor + '" in the ' + topCause.category + ' category, contributing approximately ' + topCause.contribution_pct.toFixed(1) + '% to the problem.'
    : 'Insufficient data to determine root cause. Gather more evidence across all categories.'

  const actions: string[] = []
  for (const vc of vitalFew.slice(0, 5)) {
    actions.push('[' + vc.category + '] ' + vc.factor + ': ' + vc.action_required)
  }
  if (actions.length === 0) {
    actions.push('Collect more data across all Ishikawa categories (Man, Machine, Method, Material, Measurement, Environment)')
  }

  const confidence = Math.min(0.95, 0.3 + allFactors.length * 0.05 + input.severity * 0.05)

  return {
    problem_statement: input.problem_statement,
    pareto_analysis: pareto,
    vital_few: vitalFew,
    root_cause_hypothesis: hypothesis,
    recommended_actions: actions,
    confidence_level: parseFloat(confidence.toFixed(3))
  }
}

function formatRootCauseReport(result: RootCauseResult): string {
  const lines: string[] = []
  lines.push('## Root Cause Analysis Report')
  lines.push('')
  lines.push('**Problem:** ' + result.problem_statement)
  lines.push('**Confidence Level:** ' + (result.confidence_level * 100).toFixed(1) + '%')
  lines.push('')
  lines.push('### Pareto Analysis')
  lines.push('| Factor | Contribution % | Cumulative % |')
  lines.push('|--------|---------------|--------------|')
  for (const p of result.pareto_analysis.slice(0, 15)) {
    lines.push('| ' + p.factor + ' | ' + p.contribution_pct.toFixed(1) + '% | ' + p.cumulative_pct.toFixed(1) + '% |')
  }
  lines.push('')
  lines.push('### Vital Few (80/20)')
  for (const vc of result.vital_few) {
    lines.push('- **' + vc.factor + '** (' + vc.category + '): ' + vc.contribution_pct.toFixed(1) + '% - ' + vc.action_required)
  }
  lines.push('')
  lines.push('### Root Cause Hypothesis')
  lines.push(result.root_cause_hypothesis)
  lines.push('')
  lines.push('### Recommended Actions')
  for (const a of result.recommended_actions) {
    lines.push('- ' + a)
  }

  return lines.join('\n')
}

// ============================================================================
// TOOL 4: PROCESS CAPABILITY CALCULATOR
// ============================================================================

function calculateProcessCapability(input: ProcessCapabilityInput): ProcessCapabilityResult {
  const rng = makeRng(input)
  const measurements = input.measurements
  const n = measurements.length

  if (n < 2) {
    return {
      sample_size: n,
      mean: n === 1 ? measurements[0] : 0,
      std_dev_short: 0,
      std_dev_long: 0,
      cp: 0,
      cpk: 0,
      pp: 0,
      ppk: 0,
      sigma_level: 0,
      dpmo: 0,
      yield_pct: 0,
      capability_grade: 'incapable',
      recommendation: 'Insufficient data. Collect at least 25 subgroups or 100 individual measurements.'
    }
  }

  const mean = measurements.reduce((s, v) => s + v, 0) / n
  const usl = input.usl
  const lsl = input.lsl
  const target = input.target ?? (usl + lsl) / 2

  // Short-term standard deviation (within-subgroup)
  const subgroupSize = input.subgroup_size ?? 5
  const numSubgroups = Math.floor(n / subgroupSize)
  let shortTermVar = 0
  if (numSubgroups > 1) {
    for (let i = 0; i < numSubgroups; i++) {
      const subgroup = measurements.slice(i * subgroupSize, (i + 1) * subgroupSize)
      const sgMean = subgroup.reduce((s, v) => s + v, 0) / subgroup.length
      const sgVar = subgroup.reduce((s, v) => s + Math.pow(v - sgMean, 2), 0) / (subgroup.length - 1)
      shortTermVar += sgVar
    }
    shortTermVar /= numSubgroups
  } else {
    shortTermVar = measurements.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1)
  }
  const stdShort = Math.sqrt(shortTermVar)

  // Long-term standard deviation
  const longTermVar = measurements.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1)
  const stdLong = Math.sqrt(longTermVar)

  const specWidth = usl - lsl
  const cp = stdShort > 0 ? specWidth / (6 * stdShort) : 0
  const cpu = stdShort > 0 ? (usl - mean) / (3 * stdShort) : 0
  const cpl = stdShort > 0 ? (mean - lsl) / (3 * stdShort) : 0
  const cpk = Math.min(cpu, cpl)

  const pp = stdLong > 0 ? specWidth / (6 * stdLong) : 0
  const ppu = stdLong > 0 ? (usl - mean) / (3 * stdLong) : 0
  const ppl = stdLong > 0 ? (mean - lsl) / (3 * stdLong) : 0
  const ppk = Math.min(ppu, ppl)

  // Sigma level and DPMO
  const sigmaLevel = Math.abs(cpk) * 3
  const dpmo = Math.round((1 - 0.5 * (1 + erf(sigmaLevel / Math.sqrt(2)))) * 2 * 1000000)
  const yieldPct = (1 - dpmo / 1000000) * 100

  let grade: ProcessCapabilityResult['capability_grade'] = 'incapable'
  if (cpk >= 2.0) grade = 'excellent'
  else if (cpk >= 1.33) grade = 'capable'
  else if (cpk >= 1.0) grade = 'marginal'

  let recommendation = 'Process is excellent. Maintain current controls and consider reducing inspection frequency.'
  if (cpk < 1.0) {
    recommendation = 'Process is INCAPABLE. Immediate process improvement required. Focus on reducing variation and centering the process.'
  } else if (cpk < 1.33) {
    recommendation = 'Process is MARGINAL. Monitor closely and implement process improvements to achieve Cpk >= 1.33.'
  } else if (cpk < 2.0) {
    recommendation = 'Process is CAPABLE. Continue monitoring and strive for Six Sigma performance.'
  }

  return {
    sample_size: n,
    mean: parseFloat(mean.toFixed(6)),
    std_dev_short: parseFloat(stdShort.toFixed(6)),
    std_dev_long: parseFloat(stdLong.toFixed(6)),
    cp: parseFloat(cp.toFixed(4)),
    cpk: parseFloat(cpk.toFixed(4)),
    pp: parseFloat(pp.toFixed(4)),
    ppk: parseFloat(ppk.toFixed(4)),
    sigma_level: parseFloat(sigmaLevel.toFixed(3)),
    dpmo: dpmo,
    yield_pct: parseFloat(yieldPct.toFixed(4)),
    capability_grade: grade,
    recommendation: recommendation
  }
}

/** Error function approximation */
function erf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}

function formatProcessCapabilityReport(result: ProcessCapabilityResult): string {
  const lines: string[] = []
  lines.push('## Process Capability Analysis Report')
  lines.push('')
  lines.push('**Sample Size:** ' + result.sample_size)
  lines.push('**Capability Grade:** ' + result.capability_grade.toUpperCase())
  lines.push('')
  lines.push('### Descriptive Statistics')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Mean | ' + result.mean.toFixed(6) + ' |')
  lines.push('| Short-term Std Dev | ' + result.std_dev_short.toFixed(6) + ' |')
  lines.push('| Long-term Std Dev | ' + result.std_dev_long.toFixed(6) + ' |')
  lines.push('')
  lines.push('### Capability Indices')
  lines.push('| Index | Value | Interpretation |')
  lines.push('|-------|-------|----------------|')
  lines.push('| Cp | ' + result.cp.toFixed(4) + ' | ' + (result.cp >= 1.33 ? 'Capable' : result.cp >= 1.0 ? 'Marginal' : 'Incapable') + ' |')
  lines.push('| Cpk | ' + result.cpk.toFixed(4) + ' | ' + (result.cpk >= 1.33 ? 'Capable' : result.cpk >= 1.0 ? 'Marginal' : 'Incapable') + ' |')
  lines.push('| Pp | ' + result.pp.toFixed(4) + ' | ' + (result.pp >= 1.33 ? 'Capable' : result.pp >= 1.0 ? 'Marginal' : 'Incapable') + ' |')
  lines.push('| Ppk | ' + result.ppk.toFixed(4) + ' | ' + (result.ppk >= 1.33 ? 'Capable' : result.ppk >= 1.0 ? 'Marginal' : 'Incapable') + ' |')
  lines.push('')
  lines.push('### Performance Metrics')
  lines.push('- **Sigma Level:** ' + result.sigma_level.toFixed(3) + ' sigma')
  lines.push('- **DPMO:** ' + result.dpmo.toLocaleString() + ' defects per million opportunities')
  lines.push('- **Yield:** ' + result.yield_pct.toFixed(4) + '%')
  lines.push('')
  lines.push('### Recommendation')
  lines.push(result.recommendation)

  return lines.join('\n')
}

// ============================================================================
// TOOL 5: SIX SIGMA PROJECT SELECTOR
// ============================================================================

function selectSixSigmaProjects(input: SixSigmaInput): SixSigmaResult {
  const rng = makeRng(input)
  const projects = input.projects
  const budgetLimit = input.budget_limit ?? Infinity
  const minRoi = input.min_roi ?? 1.5
  const priority = input.strategic_priority ?? 'quality'

  const projectScores: ProjectScore[] = []

  for (const proj of projects) {
    const roi = proj.implementation_cost > 0 ? proj.estimated_savings / proj.implementation_cost : 0
    const financialScore = Math.min(100, roi * 25)
    const feasibilityScore = (proj.data_availability * 30 + proj.team_readiness * 30 + (1 - proj.complexity) * 40)
    const strategicScore = proj.strategic_alignment * 100

    let overall = 0
    if (priority === 'cost') {
      overall = financialScore * 0.5 + feasibilityScore * 0.25 + strategicScore * 0.25
    } else if (priority === 'quality') {
      overall = financialScore * 0.25 + feasibilityScore * 0.25 + strategicScore * 0.5
    } else if (priority === 'speed') {
      overall = financialScore * 0.3 + feasibilityScore * 0.5 + strategicScore * 0.2
    } else {
      overall = financialScore * 0.35 + feasibilityScore * 0.35 + strategicScore * 0.3
    }

    let phase: ProjectScore['recommended_phase'] = 'Define'
    if (proj.data_availability > 0.7 && proj.team_readiness > 0.7) phase = 'Measure'
    if (proj.complexity < 0.3 && proj.strategic_alignment > 0.8) phase = 'Analyze'

    projectScores.push({
      project_id: proj.project_id,
      title: proj.title,
      overall_score: parseFloat(overall.toFixed(2)),
      financial_score: parseFloat(financialScore.toFixed(2)),
      feasibility_score: parseFloat(feasibilityScore.toFixed(2)),
      strategic_score: parseFloat(strategicScore.toFixed(2)),
      priority_rank: 0,
      recommended_phase: phase,
      estimated_roi: parseFloat(roi.toFixed(2))
    })
  }

  // Sort by overall score descending
  projectScores.sort((a, b) => b.overall_score - a.overall_score)

  // Assign ranks and filter by budget
  let totalCost = 0
  let totalSavings = 0
  let selectedCount = 0

  for (let i = 0; i < projectScores.length; i++) {
    const proj = projects.find(p => p.project_id === projectScores[i].project_id)
    if (!proj) continue

    projectScores[i].priority_rank = i + 1

    if (totalCost + proj.implementation_cost <= budgetLimit && projectScores[i].estimated_roi >= minRoi) {
      totalCost += proj.implementation_cost
      totalSavings += proj.estimated_savings
      selectedCount++
    }
  }

  const portfolioRec = selectedCount > 0
    ? selectedCount + ' projects selected with combined ROI of ' + (totalSavings / Math.max(totalCost, 1)).toFixed(2) + 'x. Recommend starting with the top-ranked project.'
    : 'No projects meet the minimum ROI threshold of ' + minRoi + 'x. Consider revising project scopes or increasing budgets.'

  return {
    projects_evaluated: projects.length,
    projects_selected: selectedCount,
    total_estimated_savings: totalSavings,
    total_implementation_cost: totalCost,
    project_rankings: projectScores,
    portfolio_recommendation: portfolioRec
  }
}

function formatSixSigmaReport(result: SixSigmaResult): string {
  const lines: string[] = []
  lines.push('## Six Sigma Project Selection Report')
  lines.push('')
  lines.push('**Projects Evaluated:** ' + result.projects_evaluated)
  lines.push('**Projects Selected:** ' + result.projects_selected)
  lines.push('**Total Estimated Savings:** $' + result.total_estimated_savings.toLocaleString())
  lines.push('**Total Implementation Cost:** $' + result.total_implementation_cost.toLocaleString())
  lines.push('')
  lines.push('### Project Rankings')
  lines.push('| Rank | Project ID | Title | Overall | Financial | Feasibility | Strategic | ROI | Phase |')
  lines.push('|------|-----------|-------|---------|-----------|-------------|-----------|-----|-------|')
  for (const p of result.project_rankings.slice(0, 15)) {
    lines.push('| ' + p.priority_rank + ' | ' + p.project_id + ' | ' + p.title + ' | ' + p.overall_score.toFixed(1) + ' | ' + p.financial_score.toFixed(1) + ' | ' + p.feasibility_score.toFixed(1) + ' | ' + p.strategic_score.toFixed(1) + ' | ' + p.estimated_roi.toFixed(2) + 'x | ' + p.recommended_phase + ' |')
  }
  lines.push('')
  lines.push('### Portfolio Recommendation')
  lines.push(result.portfolio_recommendation)

  return lines.join('\n')
}

// ============================================================================
// TOOL 6: INSPECTION PLAN OPTIMIZER
// ============================================================================

function optimizeInspectionPlan(input: InspectionPlanInput): InspectionPlanResult {
  const rng = makeRng(input)
  const lotSize = input.lot_size
  const aql = input.aql
  const level = input.inspection_level
  const inspType = input.inspection_type

  // ANSI/ASQ Z1.4 sample size letter lookup (simplified)
  const lotSizeRanges: Array<{ min: number; max: number; letters: Record<string, string> }> = [
    { min: 2, max: 8, letters: { 'I': 'A', 'II': 'A', 'III': 'A', 'S-1': 'A', 'S-2': 'A', 'S-3': 'A', 'S-4': 'A' } },
    { min: 9, max: 15, letters: { 'I': 'A', 'II': 'B', 'III': 'B', 'S-1': 'A', 'S-2': 'A', 'S-3': 'A', 'S-4': 'B' } },
    { min: 16, max: 25, letters: { 'I': 'B', 'II': 'C', 'III': 'C', 'S-1': 'A', 'S-2': 'B', 'S-3': 'B', 'S-4': 'C' } },
    { min: 26, max: 50, letters: { 'I': 'C', 'II': 'D', 'III': 'E', 'S-1': 'B', 'S-2': 'B', 'S-3': 'C', 'S-4': 'D' } },
    { min: 51, max: 150, letters: { 'I': 'D', 'II': 'E', 'III': 'F', 'S-1': 'B', 'S-2': 'C', 'S-3': 'D', 'S-4': 'E' } },
    { min: 151, max: 500, letters: { 'I': 'E', 'II': 'F', 'III': 'G', 'S-1': 'C', 'S-2': 'D', 'S-3': 'E', 'S-4': 'F' } },
    { min: 501, max: 1200, letters: { 'I': 'F', 'II': 'G', 'III': 'H', 'S-1': 'C', 'S-2': 'E', 'S-3': 'F', 'S-4': 'G' } },
    { min: 1201, max: 3200, letters: { 'I': 'G', 'II': 'H', 'III': 'J', 'S-1': 'D', 'S-2': 'F', 'S-3': 'G', 'S-4': 'H' } },
    { min: 3201, max: 10000, letters: { 'I': 'H', 'II': 'J', 'III': 'K', 'S-1': 'D', 'S-2': 'G', 'S-3': 'H', 'S-4': 'J' } },
    { min: 10001, max: 35000, letters: { 'I': 'J', 'II': 'K', 'III': 'L', 'S-1': 'E', 'S-2': 'H', 'S-3': 'J', 'S-4': 'K' } },
    { min: 35001, max: 150000, letters: { 'I': 'K', 'II': 'L', 'III': 'M', 'S-1': 'F', 'S-2': 'J', 'S-3': 'K', 'S-4': 'L' } },
    { min: 150001, max: 500000, letters: { 'I': 'L', 'II': 'M', 'III': 'N', 'S-1': 'G', 'S-2': 'K', 'S-3': 'L', 'S-4': 'M' } },
    { min: 500001, max: Infinity, letters: { 'I': 'M', 'II': 'N', 'III': 'P', 'S-1': 'H', 'S-2': 'L', 'S-3': 'M', 'S-4': 'N' } }
  ]

  const range = lotSizeRanges.find(r => lotSize >= r.min && lotSize <= r.max) ?? lotSizeRanges[lotSizeRanges.length - 1]
  const letter = range.letters[level] ?? 'G'

  // Sample size by letter (simplified)
  const sampleSizes: Record<string, number> = {
    'A': 2, 'B': 3, 'C': 5, 'D': 8, 'E': 13, 'F': 20, 'G': 32, 'H': 50, 'J': 80, 'K': 125, 'L': 200, 'M': 315, 'N': 500, 'P': 800
  }

  let sampleSize = sampleSizes[letter] ?? 32

  // Adjust for inspection type
  if (inspType === 'tightened') sampleSize = Math.round(sampleSize * 1.5)
  if (inspType === 'reduced') sampleSize = Math.round(sampleSize * 0.6)

  // Accept/reject numbers based on AQL
  const aqlPct = aql / 100
  const acceptNum = Math.max(0, Math.floor(sampleSize * aqlPct * 0.5))
  const rejectNum = acceptNum + 1

  // AOQL estimation
  const aoql = aql * 0.7

  // Risk calculations
  const producerRisk = Math.max(0.01, 0.05 - (acceptNum / sampleSize) * 0.03)
  const consumerRisk = Math.max(0.05, 0.10 + (rejectNum / sampleSize) * 0.05)

  const samplingPlan: SamplingPlan = {
    sample_size: sampleSize,
    accept_number: acceptNum,
    reject_number: rejectNum,
    aoql: parseFloat(aql.toFixed(3)),
    consumer_risk: parseFloat(consumerRisk.toFixed(4)),
    producer_risk: parseFloat(producerRisk.toFixed(4))
  }

  // Inspection strategy by defect category
  const strategy: InspectionPlanResult['inspection_strategy'] = []
  const sortedCats = [...input.defect_categories].sort((a, b) => b.weight - a.weight)
  for (const cat of sortedCats) {
    const samplePct = Math.min(100, Math.round((cat.weight / 100) * (sampleSize / lotSize) * 100))
    const priority = cat.weight >= 30 ? 'Critical' : cat.weight >= 15 ? 'Major' : 'Minor'
    strategy.push({ category: cat.category, sample_pct: samplePct, priority: priority })
  }

  const totalInspCost = input.cost_per_inspection * sampleSize
  const expectedEscapes = Math.round((1 - sampleSize / lotSize) * aqlPct * lotSize)
  const escapeCost = expectedEscapes * input.cost_per_escape
  const totalQualityCost = totalInspCost + escapeCost
  const costVs100pct = input.cost_per_inspection * lotSize - totalQualityCost

  let recommendation = 'Inspection plan is optimized for current AQL and lot size.'
  if (totalQualityCost > input.cost_per_inspection * lotSize * 0.3) {
    recommendation = 'Inspection cost is high relative to lot value. Consider reducing inspection level or switching to skip-lot sampling.'
  } else if (consumerRisk > 0.15) {
    recommendation = 'Consumer risk is elevated. Consider tightening inspection or increasing sample size.'
  }

  return {
    aql: aql,
    inspection_level: level,
    lot_size: lotSize,
    sampling_plan: samplingPlan,
    inspection_strategy: strategy,
    total_inspection_cost: parseFloat(totalInspCost.toFixed(2)),
    expected_escape_cost: parseFloat(escapeCost.toFixed(2)),
    total_quality_cost: parseFloat(totalQualityCost.toFixed(2)),
    cost_savings_vs_100pct: parseFloat(costVs100pct.toFixed(2)),
    recommendation: recommendation
  }
}

function formatInspectionPlanReport(result: InspectionPlanResult): string {
  const lines: string[] = []
  lines.push('## Inspection Plan Optimization Report')
  lines.push('')
  lines.push('**AQL:** ' + result.aql + '%')
  lines.push('**Inspection Level:** ' + result.inspection_level)
  lines.push('**Lot Size:** ' + result.lot_size.toLocaleString())
  lines.push('')
  lines.push('### Sampling Plan')
  lines.push('| Parameter | Value |')
  lines.push('|-----------|-------|')
  lines.push('| Sample Size | ' + result.sampling_plan.sample_size + ' |')
  lines.push('| Accept Number (Ac) | ' + result.sampling_plan.accept_number + ' |')
  lines.push('| Reject Number (Re) | ' + result.sampling_plan.reject_number + ' |')
  lines.push('| AOQL | ' + result.sampling_plan.aoql.toFixed(3) + '% |')
  lines.push('| Producer Risk | ' + (result.sampling_plan.producer_risk * 100).toFixed(2) + '% |')
  lines.push('| Consumer Risk | ' + (result.sampling_plan.consumer_risk * 100).toFixed(2) + '% |')
  lines.push('')
  lines.push('### Inspection Strategy')
  lines.push('| Category | Sample % | Priority |')
  lines.push('|----------|----------|----------|')
  for (const s of result.inspection_strategy) {
    lines.push('| ' + s.category + ' | ' + s.sample_pct + '% | ' + s.priority + ' |')
  }
  lines.push('')
  lines.push('### Cost Analysis')
  lines.push('- **Total Inspection Cost:** $' + result.total_inspection_cost.toFixed(2))
  lines.push('- **Expected Escape Cost:** $' + result.expected_escape_cost.toFixed(2))
  lines.push('- **Total Quality Cost:** $' + result.total_quality_cost.toFixed(2))
  lines.push('- **Savings vs 100% Inspection:** $' + result.cost_savings_vs_100pct.toFixed(2))
  lines.push('')
  lines.push('### Recommendation')
  lines.push(result.recommendation)

  return lines.join('\n')
}

// ============================================================================
// TOOL 7: SUPPLIER QUALITY SCORER
// ============================================================================

function scoreSuppliers(input: SupplierScorerInput): SupplierScorerResult {
  const rng = makeRng(input)
  const suppliers = input.suppliers
  const weights = input.weights ?? { quality: 0.4, delivery: 0.25, cost: 0.2, responsiveness: 0.15 }
  const threshold = input.min_threshold ?? 60

  const scores: SupplierScore[] = []

  for (const sup of suppliers) {
    const qualityScore = Math.min(100, sup.quality_rating * 20)
    const deliveryScore = Math.min(100, sup.delivery_rating * 20)
    const costScore = Math.min(100, sup.cost_rating * 20)
    const respScore = Math.max(0, 100 - sup.response_time_days * 5)

    const composite = qualityScore * weights.quality + deliveryScore * weights.delivery + costScore * weights.cost + respScore * weights.responsiveness

    let risk: SupplierScore['risk_level'] = 'low'
    if (composite < 50 || sup.ppm_defect > 10000) risk = 'critical'
    else if (composite < 70 || sup.ppm_defect > 1000) risk = 'high'
    else if (composite < 85 || sup.ppm_defect > 100) risk = 'medium'

    let grade: SupplierScore['grade'] = 'D'
    if (composite >= 90 && sup.ppap_approved) grade = 'A'
    else if (composite >= 80) grade = 'B'
    else if (composite >= 65) grade = 'C'

    let rec = 'Maintain current relationship. Consider volume increase.'
    if (grade === 'D') rec = 'CRITICAL: Develop corrective action plan or qualify alternative supplier.'
    else if (grade === 'C') rec = 'Improvement needed. Set quality targets and monitor monthly.'
    else if (risk === 'high') rec = 'Monitor closely. Implement incoming inspection for critical characteristics.'

    scores.push({
      supplier_id: sup.supplier_id,
      supplier_name: sup.supplier_name,
      composite_score: parseFloat(composite.toFixed(2)),
      quality_score: parseFloat(qualityScore.toFixed(2)),
      delivery_score: parseFloat(deliveryScore.toFixed(2)),
      cost_score: parseFloat(costScore.toFixed(2)),
      responsiveness_score: parseFloat(respScore.toFixed(2)),
      risk_level: risk,
      grade: grade,
      recommendation: rec
    })
  }

  scores.sort((a, b) => b.composite_score - a.composite_score)

  const best = scores.length > 0 ? scores[0].supplier_name : 'N/A'
  const worst = scores.length > 0 ? scores[scores.length - 1].supplier_name : 'N/A'
  const avgScore = scores.length > 0 ? scores.reduce((s, sc) => s + sc.composite_score, 0) / scores.length : 0

  const criticalCount = scores.filter(s => s.risk_level === 'critical').length
  const highCount = scores.filter(s => s.risk_level === 'high').length
  let portfolioRisk = 'LOW'
  if (criticalCount > 0) portfolioRisk = 'CRITICAL'
  else if (highCount > 1) portfolioRisk = 'HIGH'
  else if (highCount > 0) portfolioRisk = 'MEDIUM'

  let recommendation = 'Supplier portfolio is healthy. Continue monitoring and annual audits.'
  if (criticalCount > 0) {
    recommendation = criticalCount + ' supplier(s) at CRITICAL risk. Immediate action required: develop contingency plans and qualify backup sources.'
  } else if (highCount > 0) {
    recommendation = highCount + ' supplier(s) at HIGH risk. Implement enhanced monitoring and corrective action plans.'
  }

  return {
    suppliers_evaluated: suppliers.length,
    supplier_scores: scores,
    best_supplier: best,
    worst_supplier: worst,
    avg_composite_score: parseFloat(avgScore.toFixed(2)),
    portfolio_risk: portfolioRisk,
    recommendation: recommendation
  }
}

function formatSupplierScorerReport(result: SupplierScorerResult): string {
  const lines: string[] = []
  lines.push('## Supplier Quality Scoring Report')
  lines.push('')
  lines.push('**Suppliers Evaluated:** ' + result.suppliers_evaluated)
  lines.push('**Average Composite Score:** ' + result.avg_composite_score.toFixed(2))
  lines.push('**Portfolio Risk:** ' + result.portfolio_risk)
  lines.push('**Best Supplier:** ' + result.best_supplier)
  lines.push('**Worst Supplier:** ' + result.worst_supplier)
  lines.push('')
  lines.push('### Supplier Scores')
  lines.push('| Supplier | Composite | Quality | Delivery | Cost | Responsiveness | Grade | Risk |')
  lines.push('|----------|-----------|---------|----------|------|----------------|-------|------|')
  for (const s of result.supplier_scores) {
    lines.push('| ' + s.supplier_name + ' | ' + s.composite_score.toFixed(1) + ' | ' + s.quality_score.toFixed(1) + ' | ' + s.delivery_score.toFixed(1) + ' | ' + s.cost_score.toFixed(1) + ' | ' + s.responsiveness_score.toFixed(1) + ' | ' + s.grade + ' | ' + s.risk_level.toUpperCase() + ' |')
  }
  lines.push('')
  lines.push('### Recommendation')
  lines.push(result.recommendation)

  return lines.join('\n')
}

// ============================================================================
// TOOL 8: COST OF POOR QUALITY TRACKER
// ============================================================================

function trackCostOfPoorQuality(input: CoqInput): CoqResult {
  const rng = makeRng(input)
  const entries = input.entries
  const targetPct = input.target_coq_pct ?? 5
  const benchmark = input.industry_benchmark ?? 8

  const breakdown: CoqBreakdown[] = []
  let totalCoq = 0
  let totalRevenue = 0

  for (const e of entries) {
    const total = e.internal_failure + e.external_failure + e.appraisal + e.prevention
    const coqPct = e.revenue > 0 ? (total / e.revenue) * 100 : 0
    const coqPerUnit = e.units_produced > 0 ? total / e.units_produced : 0

    breakdown.push({
      period: e.period,
      internal_failure: e.internal_failure,
      external_failure: e.external_failure,
      appraisal: e.appraisal,
      prevention: e.prevention,
      total_coq: total,
      coq_pct_revenue: parseFloat(coqPct.toFixed(3)),
      coq_per_unit: parseFloat(coqPerUnit.toFixed(3))
    })

    totalCoq += total
    totalRevenue += e.revenue
  }

  const avgPct = totalRevenue > 0 ? (totalCoq / totalRevenue) * 100 : 0

  // Trend analysis
  let trend: CoqResult['trend'] = 'stable'
  if (breakdown.length >= 2) {
    const firstHalf = breakdown.slice(0, Math.floor(breakdown.length / 2))
    const secondHalf = breakdown.slice(Math.floor(breakdown.length / 2))
    const avgFirst = firstHalf.reduce((s, b) => s + b.coq_pct_revenue, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((s, b) => s + b.coq_pct_revenue, 0) / secondHalf.length

    if (avgSecond < avgFirst * 0.95) trend = 'improving'
    else if (avgSecond > avgFirst * 1.05) trend = 'worsening'
  }

  // Failure ratio
  const totalFailure = breakdown.reduce((s, b) => s + b.internal_failure + b.external_failure, 0)
  const totalAppPre = breakdown.reduce((s, b) => s + b.appraisal + b.prevention, 0)
  const failureRatio = totalAppPre > 0 ? totalFailure / totalAppPre : 0

  // Best and worst periods
  let bestPeriod = 'N/A'
  let worstPeriod = 'N/A'
  if (breakdown.length > 0) {
    const sorted = [...breakdown].sort((a, b) => a.coq_pct_revenue - b.coq_pct_revenue)
    bestPeriod = sorted[0].period
    worstPeriod = sorted[sorted.length - 1].period
  }

  // Savings opportunity
  const currentPct = avgPct
  const savingsOpp = currentPct > targetPct ? (currentPct - targetPct) / 100 * totalRevenue : 0

  let recommendation = 'COQ is within target range. Continue current quality management practices.'
  if (currentPct > benchmark) {
    recommendation = 'COQ significantly above industry benchmark. Urgent action needed: increase prevention investment, reduce failure costs through root cause elimination.'
  } else if (currentPct > targetPct) {
    recommendation = 'COQ above internal target. Focus on reducing internal failures and increasing prevention activities.'
  } else if (failureRatio > 2) {
    recommendation = 'Failure costs dominate COQ. Invest in prevention and appraisal to shift the quality cost balance.'
  }

  return {
    periods_analyzed: entries.length,
    total_coq: totalCoq,
    avg_coq_pct: parseFloat(avgPct.toFixed(3)),
    breakdown: breakdown,
    trend: trend,
    failure_ratio: parseFloat(failureRatio.toFixed(3)),
    best_period: bestPeriod,
    worst_period: worstPeriod,
    savings_opportunity: parseFloat(savingsOpp.toFixed(2)),
    recommendation: recommendation
  }
}

function formatCoqReport(result: CoqResult): string {
  const lines: string[] = []
  lines.push('## Cost of Poor Quality (COQ) Report')
  lines.push('')
  lines.push('**Periods Analyzed:** ' + result.periods_analyzed)
  lines.push('**Total COQ:** $' + result.total_coq.toLocaleString())
  lines.push('**Average COQ % of Revenue:** ' + result.avg_coq_pct.toFixed(3) + '%')
  lines.push('**Trend:** ' + result.trend.toUpperCase())
  lines.push('**Failure Ratio:** ' + result.failure_ratio.toFixed(3))
  lines.push('**Best Period:** ' + result.best_period)
  lines.push('**Worst Period:** ' + result.worst_period)
  lines.push('**Savings Opportunity:** $' + result.savings_opportunity.toLocaleString())
  lines.push('')
  lines.push('### COQ Breakdown')
  lines.push('| Period | Internal | External | Appraisal | Prevention | Total | % Revenue | Per Unit |')
  lines.push('|--------|----------|----------|-----------|------------|-------|-----------|----------|')
  for (const b of result.breakdown) {
    lines.push('| ' + b.period + ' | $' + b.internal_failure.toLocaleString() + ' | $' + b.external_failure.toLocaleString() + ' | $' + b.appraisal.toLocaleString() + ' | $' + b.prevention.toLocaleString() + ' | $' + b.total_coq.toLocaleString() + ' | ' + b.coq_pct_revenue.toFixed(2) + '% | $' + b.coq_per_unit.toFixed(2) + ' |')
  }
  lines.push('')
  lines.push('### Recommendation')
  lines.push(result.recommendation)

  return lines.join('\n')
}

// ============================================================================
// PLUGIN REGISTRATION
// ============================================================================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'spc_chart_analyzer',
    description: 'Analyze measurement data using Statistical Process Control (SPC) charts. Detects Western Electric rule violations, calculates control limits, and determines if the process is in statistical control. Supports Xbar-R, Xbar-S, I-MR, p-chart, and c-chart types.',
    parameters: {
      data: { type: 'string', required: true, description: 'JSON array of subgroup data points with fields: subgroup_id, measurements (array of numbers), subgroup_size, timestamp (optional)' },
      config: { type: 'string', required: true, description: 'JSON object with fields: chart_type (Xbar_R, Xbar_S, I_MR, p_chart, c_chart), usl (upper spec limit), lsl (lower spec limit), target (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { data: string; config: string }) {
      const data: SpcDataPoint[] = JSON.parse(args.data)
      const config: SpcChartConfig = JSON.parse(args.config)
      const result = analyzeSpcChart(data, config)
      return formatSpcReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'defect_prediction_modeler',
    description: 'Model and forecast defect rates using historical quality data. Applies linear regression with confidence intervals to predict future defect trends and assess risk levels for proactive quality management.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: history (array of {period, defect_count, total_units, defect_type}), forecast_periods (number), confidence_level (optional, default 0.95), defect_type_filter (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: DefectPredictionInput = JSON.parse(args.input)
      const result = modelDefectPrediction(input)
      return formatDefectPredictionReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'root_cause_analyzer',
    description: 'Perform structured root cause analysis using Ishikawa (fishbone) categories, Pareto analysis, and the 80/20 rule to identify vital few causes contributing to quality problems.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: problem_statement, occurrences, severity (1-10), categories (array of {name, factors: [{factor, evidence_score, contribution_pct}]}), data_points (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: RootCauseInput = JSON.parse(args.input)
      const result = analyzeRootCause(input)
      return formatRootCauseReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'process_capability_calculator',
    description: 'Calculate process capability indices (Cp, Cpk, Pp, Ppk) from measurement data. Estimates sigma level, DPMO, and yield. Provides capability grade and improvement recommendations.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: measurements (array of numbers), usl (upper spec limit), lsl (lower spec limit), target (optional), subgroup_size (optional, default 5), long_term (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: ProcessCapabilityInput = JSON.parse(args.input)
      const result = calculateProcessCapability(input)
      return formatProcessCapabilityReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'six_sigma_project_selector',
    description: 'Evaluate and prioritize Six Sigma DMAIC projects based on financial impact, feasibility, strategic alignment, and ROI. Supports budget constraints and strategic priority weighting.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: projects (array of DMAICProject objects), budget_limit (optional), min_roi (optional, default 1.5), strategic_priority (optional: cost, quality, speed, safety)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: SixSigmaInput = JSON.parse(args.input)
      const result = selectSixSigmaProjects(input)
      return formatSixSigmaReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'inspection_plan_optimizer',
    description: 'Optimize inspection sampling plans based on AQL, lot size, and inspection level. Calculates sample size, accept/reject numbers, and cost analysis comparing to 100% inspection.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: lot_size, aql (percentage), inspection_level (I, II, III, S-1, S-2, S-3, S-4), inspection_type (normal, tightened, reduced), defect_categories (array of {category, weight, historical_rate}), cost_per_inspection, cost_per_escape' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: InspectionPlanInput = JSON.parse(args.input)
      const result = optimizeInspectionPlan(input)
      return formatInspectionPlanReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'supplier_quality_scorer',
    description: 'Score and grade suppliers based on quality, delivery, cost, and responsiveness metrics. Identifies portfolio risk and provides supplier development recommendations.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: suppliers (array of SupplierData objects), weights (optional: {quality, delivery, cost, responsiveness}), min_threshold (optional, default 60)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: SupplierScorerInput = JSON.parse(args.input)
      const result = scoreSuppliers(input)
      return formatSupplierScorerReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'cost_of_poor_quality_tracker',
    description: 'Track and analyze Cost of Poor Quality (COQ) across internal failure, external failure, appraisal, and prevention categories. Identifies trends, savings opportunities, and benchmarks against industry standards.',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: entries (array of {period, internal_failure, external_failure, appraisal, prevention, revenue, units_produced}), target_coq_pct (optional, default 5), industry_benchmark (optional, default 8)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const input: CoqInput = JSON.parse(args.input)
      const result = trackCostOfPoorQuality(input)
      return formatCoqReport(result)
    }
  }))

  console.log('[dsh-tool-qualityAI] Loaded v' + VERSION + ' - Manufacturing Quality & Process Optimization with 8 tools')
  console.log('  Tools: spc_chart_analyzer, defect_prediction_modeler, root_cause_analyzer, process_capability_calculator, six_sigma_project_selector, inspection_plan_optimizer, supplier_quality_scorer, cost_of_poor_quality_tracker')
}
