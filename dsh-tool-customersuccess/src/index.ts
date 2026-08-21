/**
 * DSH Customer Success Management (CSM) Plugin v0.1.0
 *
 * Comprehensive CSM toolkit for DeepSeek Harness Agent with ocean blue CS theme.
 * Designed for customer success managers, CS operations leaders, and retention teams.
 *
 * Toolkit (v0.1.0):
 * - Health Scorecard (product usage + support + relationship + commercial multi-dimensional scoring + risk + alerts + improvement paths)
 * - Onboarding Guide (journey map + milestones + task lists + resources + measurement + best practices + progress tracking)
 * - Renewal Manager (renewal prediction + risk identification + plans + discount strategy + coordination + tracking + ROI report)
 * - Advocacy Program (referral cases + events + incentives + story collection + community + ROI + NPS)
 * - Cross-Sell Expansion (usage gap + similar customer matching + timing + quotes + tracking + forecasting)
 * - Churn Prediction Model (behavioral features + risk segmentation + intervention strategies + effectiveness prediction + success metrics)
 * - CSM Workload Balancer (customer distribution + skill matching + priority + rotation + outcome + cost model)
 * - Success Plan Generator (goals + milestones + risks + actions + metrics + automation + collaboration + versioning)
 *
 * @module dsh-tool-customersuccess
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-customersuccess'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== OCEAN BLUE CS THEME ====================

const HEALTH_LEVELS = ['Critical', 'At Risk', 'Needs Attention', 'Healthy', 'Champion'] as const

// ==================== UTILITY FUNCTIONS ====================

function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs((Math.sin(hash) * 10000) % 1)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function dateDaysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function dateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(seededRandom(String(Date.now())) * 10000).toString().padStart(4, '0')}`
}

function fmtCurrency(amount: number): string {
  return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function fmtPercentage(part: number, whole: number): string {
  if (whole === 0) return '0.0%'
  return ((part / whole) * 100).toFixed(1) + '%'
}

function renderGauge(score: number, maxScore: number, label: string): string {
  const pct = clamp(score / maxScore, 0, 1)
  const filled = Math.round(pct * 20)
  const empty = 20 - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const levelIdx = Math.min(Math.floor(pct * HEALTH_LEVELS.length), HEALTH_LEVELS.length - 1)
  return `  ${label}: [${bar}] ${(pct * 100).toFixed(1)}% (${HEALTH_LEVELS[levelIdx]})`
}

function renderFunnel(stageValues: Record<string, number>): string {
  const vals = Object.values(stageValues)
  const maxVal = Math.max(...vals, 1)
  const lines: string[] = ['  CS RENEWAL FUNNEL', '  ' + '='.repeat(40)]
  const stages = Object.keys(stageValues)
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    const val = stageValues[stage]
    const barLen = Math.round((val / maxVal) * 30)
    const padding = '  '.repeat(i)
    const bar = '\u2588'.repeat(Math.max(barLen, 1))
    lines.push(`${padding}${stage.padEnd(15)} ${bar} ${val}`)
  }
  return lines.join('\n')
}

function renderDashboard(metrics: Record<string, number>, title: string): string {
  const lines: string[] = [`  ${title}`, '  ' + '-'.repeat(40)]
  for (const [key, val] of Object.entries(metrics)) {
    const barLen = Math.round(clamp(val, 0, 100) / 5)
    const bar = '\u2588'.repeat(barLen) + '\u2591'.repeat(20 - barLen)
    lines.push(`  ${key.padEnd(20)} ${bar} ${val.toFixed(1)}`)
  }
  return lines.join('\n')
}

// ==================== TYPES ====================

interface ProductUsageMetrics {
  daily_active_users: number
  feature_adoption_rate: number
  login_frequency: number
  key_feature_usage: number
  api_calls: number
  data_volume_gb: number
}

interface SupportMetrics {
  open_tickets: number
  avg_resolution_hours: number
  csat_score: number
  escalation_rate: number
  self_service_ratio: number
}

interface RelationshipMetrics {
  nps_score: number
  executive_sponsor: boolean
  champion_count: number
  qbr_completed: boolean
  relationship_tenure_months: number
  stakeholder_engagement: number
}

interface CommercialMetrics {
  arr: number
  expansion_revenue: number
  payment_delays: number
  contract_utilization: number
  discount_rate: number
}

interface HealthScorecardInput {
  customer_id: string
  customer_name: string
  product_usage: ProductUsageMetrics
  support: SupportMetrics
  relationship: RelationshipMetrics
  commercial: CommercialMetrics
}

interface DimensionScore {
  dimension: string
  score: number
  maxScore: number
  weight: number
  status: string
  indicators: { name: string; value: number; threshold: number; status: string }[]
}

interface HealthScorecardResult {
  customer_id: string
  customer_name: string
  overall_score: number
  overall_status: string
  dimensions: DimensionScore[]
  risk_level: string
  risk_factors: string[]
  alerts: { severity: string; message: string; action: string }[]
  improvement_paths: { area: string; action: string; expected_impact: string; priority: string }[]
  trend: string
  next_review_date: string
}

interface JourneyPhase {
  phase_name: string
  duration_days: number
  objectives: string[]
  key_activities: string[]
  success_criteria: string[]
  resources_needed: string[]
}

interface Milestone {
  name: string
  phase: string
  due_day: number
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  owner: string
  dependencies: string[]
}

interface OnboardingInput {
  customer_id: string
  customer_name: string
  product_plan: string
  start_date: string
  target_go_live_date: string
  team_size: number
  technical_maturity: 'low' | 'medium' | 'high'
  journey_phases: JourneyPhase[]
  milestones: Milestone[]
  assigned_csm: string
}

interface OnboardingResult {
  onboarding_id: string
  customer_id: string
  customer_name: string
  journey_map: { phase: string; duration: number; progress: number; status: string }[]
  milestone_tracker: { name: string; phase: string; due: string; status: string; owner: string; progress: number }[]
  task_checklist: { task: string; phase: string; priority: string; due_day: number; completed: boolean }[]
  resource_plan: { resource: string; type: string; availability: string; cost: string }[]
  measurement_framework: { metric: string; baseline: string; target: string; current: string; status: string }[]
  best_practices: string[]
  overall_progress: number
  risk_items: string[]
  estimated_go_live: string
}

interface ContractDetail {
  contract_id: string
  product: string
  arr: number
  start_date: string
  end_date: string
  renewal_date: string
  payment_terms: string
  utilization_rate: number
}

interface RenewalInput {
  customer_id: string
  customer_name: string
  contracts: ContractDetail[]
  health_score: number
  churn_risk: string
  stakeholder_sentiment: string
  competitor_threat: string
  expansion_opportunities: { product: string; estimated_value: number; fit_score: number }[]
  discount_budget: number
  csm_notes: string
}

interface RenewalPlan {
  contract_id: string
  product: string
  arr: number
  renewal_probability: number
  risk_level: string
  strategy: string
  discount_offer: string
  timeline: string[]
  owner: string
  status: string
}

interface RenewalResult {
  renewal_id: string
  customer_id: string
  customer_name: string
  total_arr_at_risk: number
  weighted_renewal_rate: number
  plans: RenewalPlan[]
  risk_summary: { level: string; count: string; factors: string[] }[]
  discount_strategy: { tier: string; condition: string; discount: string; roi_impact: string }[]
  coordination_matrix: { task: string; owner: string; deadline: string; status: string }[]
  roi_report: { metric: string; value: string }[]
  funnel: Record<string, number>
}

interface AdvocateProfile {
  customer_id: string
  contact_name: string
  title: string
  engagement_score: number
  nps_score: number
  industry: string
  use_case: string
  availability: string
}

interface AdvocacyInput {
  program_name: string
  advocates: AdvocateProfile[]
  events_planned: { event_name: string; type: string; date: string; target_attendees: number; budget: number }[]
  incentive_structure: { tier: string; requirement: string; reward: string; estimated_cost: string }[]
  story_requests: { customer_id: string; story_type: string; topic: string; deadline: string; status: string }[]
  community_metrics: { members: number; active_members: number; posts_monthly: number; events_ytd: number }
  nps_baseline: number
}

interface AdvocacyResult {
  program_id: string
  program_name: string
  advocate_roster: { contact: string; tier: string; engagement: string; activities: string[]; value_generated: string }[]
  event_calendar: { event: string; type: string; date: string; projected_roi: string; status: string }[]
  incentive_analysis: { tier: string; advocates_count: number; cost: string; roi: string; effectiveness: string }[]
  story_pipeline: { customer: string; type: string; status: string; impact_score: string }[]
  community_health: { health_score: number; growth_rate: string; engagement_rate: string; top_contributors: string[] }
  nps_impact: { before: number; after: number; lift: string; significance: string }
  total_roi: string
  recommendations: string[]
}

interface UsageGap {
  feature: string
  current_usage: number
  potential_usage: number
  gap_value: number
  expansion_potential: string
}

interface SimilarCustomer {
  customer_id: string
  company_name: string
  industry: string
  similarity_score: number
  purchased_products: string[]
  expansion_revenue: number
}

interface CrossSellInput {
  customer_id: string
  customer_name: string
  current_products: string[]
  usage_gaps: UsageGap[]
  similar_customers: SimilarCustomer[]
  budget_cycle: string
  decision_makers: { name: string; role: string; influence: string }[]
  timing_signals: string[]
  competitive_products: string[]
}

interface ExpansionOpportunity {
  product: string
  fit_score: number
  estimated_value: number
  timing: string
  approach: string
  probability: number
  quote_template: string
}

interface CrossSellResult {
  expansion_id: string
  customer_id: string
  customer_name: string
  opportunities: ExpansionOpportunity[]
  total_expansion_value: number
  gap_analysis: { feature: string; current: number; potential: number; priority: string }[]
  similar_customer_matches: { customer: string; similarity: string; products: string; revenue: string }[]
  timing_assessment: { signal: string; readiness: string; recommended_action: string }[]
  forecast: { quarter: string; probability: number; weighted_value: number }[]
  tracking_plan: { milestone: string; date: string; owner: string; status: string }[]
}

interface BehavioralFeature {
  feature: string
  current_value: number
  baseline_value: number
  trend: 'improving' | 'stable' | 'declining'
  weight: number
}

interface ChurnInput {
  customer_id: string
  customer_name: string
  behavioral_features: BehavioralFeature[]
  contract_end_date: string
  arr: number
  industry: string
  tenure_months: number
  support_tickets_trend: string
  nps_history: number[]
  competitor_mentions: number
  executive_changes: boolean
  payment_delays: number
}

interface RiskSegment {
  segment: string
  score: number
  factors: string[]
  probability: number
  timeframe: string
}

interface InterventionStrategy {
  strategy: string
  target_segment: string
  description: string
  expected_success_rate: number
  cost: string
  timeline: string
  owner: string
}

interface ChurnResult {
  prediction_id: string
  customer_id: string
  customer_name: string
  churn_probability: number
  risk_level: string
  risk_segments: RiskSegment[]
  behavioral_analysis: { feature: string; status: string; contribution: string; recommendation: string }[]
  intervention_strategies: InterventionStrategy[]
  effectiveness_prediction: { strategy: string; success_probability: number; revenue_saved: string; cost: string; roi: string }[]
  success_metrics: { metric: string; current: string; target: string; measurement: string }[]
  monitoring_plan: { frequency: string; indicators: string[]; escalation_trigger: string }
}

interface CustomerDistribution {
  customer_id: string
  customer_name: string
  tier: 'enterprise' | 'mid_market' | 'smb'
  arr: number
  health_score: number
  complexity: number
  required_skills: string[]
  current_csm: string
  hours_per_month: number
}

interface CSMPerformance {
  csm_id: string
  name: string
  skills: string[]
  current_customers: number
  total_hours: number
  capacity_hours: number
  utilization_rate: number
  avg_health_score: number
  retention_rate: number
  nps_avg: number
}

interface WorkloadInput {
  customers: CustomerDistribution[]
  csm_team: CSMPerformance[]
  max_hours_per_csm: number
  target_utilization: number
  skill_requirements: { skill: string; demand: number; supply: number }[]
  rotation_preferences: { csm_id: string; avoid_industries: string[]; preferred_tiers: string[] }[]
}

interface WorkloadAssignment {
  csm_id: string
  csm_name: string
  assigned_customers: { customer: string; tier: string; hours: number; health: string }[]
  total_hours: number
  utilization: number
  skill_match: number
  balance_score: number
}

interface WorkloadResult {
  balancer_id: string
  assignments: WorkloadAssignment[]
  unassigned: { customer: string; reason: string; recommendation: string }[]
  skill_gaps: { skill: string; gap: string; training_need: string; priority: string }[]
  rotation_plan: { customer: string; from_csm: string; to_csm: string; reason: string; timeline: string }[]
  cost_model: { csm: string; cost_per_hour: string; total_cost: string; revenue_managed: string; cost_ratio: string }[]
  efficiency_metrics: { metric: string; value: string; benchmark: string; status: string }[]
  recommendations: string[]
}

interface SuccessGoal {
  goal: string
  category: string
  target_date: string
  kpi: string
  target_value: number
  current_value: number
  status: 'not_started' | 'in_progress' | 'at_risk' | 'completed'
}

interface SuccessPlanInput {
  customer_id: string
  customer_name: string
  plan_name: string
  goals: SuccessGoal[]
  milestones: { name: string; goal: string; due_date: string; status: string; owner: string }[]
  risks: { risk: string; probability: string; impact: string; mitigation: string }[]
  actions: { action: string; owner: string; due_date: string; priority: string; status: string }[]
  metrics: { metric: string; baseline: number; target: number; current: number; unit: string }[]
  automation_triggers: { trigger: string; action: string; frequency: string; enabled: boolean }[]
  collaborators: { name: string; role: string; responsibilities: string; access_level: string }[]
  version_notes: string
}

interface SuccessPlanResult {
  plan_id: string
  customer_id: string
  customer_name: string
  plan_name: string
  version: string
  goals_status: { goal: string; category: string; progress: number; status: string; days_remaining: number }[]
  milestone_tracker: { name: string; due: string; status: string; owner: string; completion: number }[]
  risk_register: { risk: string; score: string; mitigation_status: string; owner: string }[]
  action_plan: { action: string; owner: string; due: string; priority: string; status: string }[]
  metrics_dashboard: { metric: string; baseline: number; target: number; current: number; progress: string; trend: string }[]
  automation_status: { trigger: string; action: string; last_run: string; next_run: string; status: string }[]
  collaboration_map: { collaborator: string; role: string; tasks: number; last_active: string }[]
  overall_health: number
  next_review: string
  version_history: { version: string; date: string; changes: string }[]
}

// ==================== TOOL 1: HEALTH SCORECARD ====================

function calculateHealthScorecard(input: HealthScorecardInput): HealthScorecardResult {
  const pu = input.product_usage
  const sup = input.support
  const rel = input.relationship
  const com = input.commercial

  const dimensions: DimensionScore[] = []

  // Product Usage (max 25)
  const usageIndicators = [
    { name: 'DAU Ratio', value: pu.daily_active_users, threshold: 50, status: pu.daily_active_users >= 50 ? 'good' : pu.daily_active_users >= 20 ? 'warning' : 'critical' },
    { name: 'Feature Adoption', value: pu.feature_adoption_rate, threshold: 60, status: pu.feature_adoption_rate >= 60 ? 'good' : pu.feature_adoption_rate >= 30 ? 'warning' : 'critical' },
    { name: 'Login Frequency', value: pu.login_frequency, threshold: 10, status: pu.login_frequency >= 10 ? 'good' : pu.login_frequency >= 5 ? 'warning' : 'critical' },
    { name: 'Key Feature Usage', value: pu.key_feature_usage, threshold: 70, status: pu.key_feature_usage >= 70 ? 'good' : pu.key_feature_usage >= 40 ? 'warning' : 'critical' },
  ]
  const usageScore = Math.min(25, (pu.daily_active_users / 100) * 8 + (pu.feature_adoption_rate / 100) * 7 + (pu.login_frequency / 20) * 5 + (pu.key_feature_usage / 100) * 5)
  dimensions.push({ dimension: 'Product Usage', score: Math.round(usageScore), maxScore: 25, weight: 0.25, status: usageScore >= 18 ? 'Healthy' : usageScore >= 12 ? 'Needs Attention' : 'At Risk', indicators: usageIndicators })

  // Support Health (max 25)
  const supportIndicators = [
    { name: 'Open Tickets', value: sup.open_tickets, threshold: 5, status: sup.open_tickets <= 5 ? 'good' : sup.open_tickets <= 15 ? 'warning' : 'critical' },
    { name: 'Avg Resolution', value: sup.avg_resolution_hours, threshold: 24, status: sup.avg_resolution_hours <= 24 ? 'good' : sup.avg_resolution_hours <= 72 ? 'warning' : 'critical' },
    { name: 'CSAT Score', value: sup.csat_score, threshold: 7, status: sup.csat_score >= 7 ? 'good' : sup.csat_score >= 5 ? 'warning' : 'critical' },
    { name: 'Escalation Rate', value: sup.escalation_rate, threshold: 10, status: sup.escalation_rate <= 10 ? 'good' : sup.escalation_rate <= 25 ? 'warning' : 'critical' },
  ]
  const supportScore = Math.min(25, (1 - sup.open_tickets / 50) * 8 + (1 - sup.avg_resolution_hours / 168) * 6 + (sup.csat_score / 10) * 6 + (1 - sup.escalation_rate / 100) * 5)
  dimensions.push({ dimension: 'Support Health', score: Math.round(supportScore), maxScore: 25, weight: 0.25, status: supportScore >= 18 ? 'Healthy' : supportScore >= 12 ? 'Needs Attention' : 'At Risk', indicators: supportIndicators })

  // Relationship (max 25)
  const relIndicators = [
    { name: 'NPS Score', value: rel.nps_score, threshold: 7, status: rel.nps_score >= 7 ? 'good' : rel.nps_score >= 5 ? 'warning' : 'critical' },
    { name: 'Executive Sponsor', value: rel.executive_sponsor ? 1 : 0, threshold: 1, status: rel.executive_sponsor ? 'good' : 'warning' },
    { name: 'Champion Count', value: rel.champion_count, threshold: 2, status: rel.champion_count >= 2 ? 'good' : rel.champion_count >= 1 ? 'warning' : 'critical' },
    { name: 'QBR Completed', value: rel.qbr_completed ? 1 : 0, threshold: 1, status: rel.qbr_completed ? 'good' : 'warning' },
  ]
  const relScore = Math.min(25, ((rel.nps_score + 10) / 20) * 8 + (rel.executive_sponsor ? 5 : 0) + (rel.champion_count / 3) * 5 + (rel.qbr_completed ? 4 : 0) + (rel.stakeholder_engagement / 100) * 3)
  dimensions.push({ dimension: 'Relationship', score: Math.round(relScore), maxScore: 25, weight: 0.25, status: relScore >= 18 ? 'Healthy' : relScore >= 12 ? 'Needs Attention' : 'At Risk', indicators: relIndicators })

  // Commercial (max 25)
  const commIndicators = [
    { name: 'Contract Utilization', value: com.contract_utilization, threshold: 70, status: com.contract_utilization >= 70 ? 'good' : com.contract_utilization >= 40 ? 'warning' : 'critical' },
    { name: 'Payment Delays', value: com.payment_delays, threshold: 0, status: com.payment_delays === 0 ? 'good' : com.payment_delays <= 2 ? 'warning' : 'critical' },
    { name: 'ARR Growth', value: com.expansion_revenue, threshold: 0, status: com.expansion_revenue > 0 ? 'good' : 'warning' },
  ]
  const commScore = Math.min(25, (com.contract_utilization / 100) * 10 + (1 - com.payment_delays / 10) * 8 + (com.expansion_revenue > 0 ? 5 : 0) + (1 - com.discount_rate / 100) * 2)
  dimensions.push({ dimension: 'Commercial', score: Math.round(commScore), maxScore: 25, weight: 0.25, status: commScore >= 18 ? 'Healthy' : commScore >= 12 ? 'Needs Attention' : 'At Risk', indicators: commIndicators })

  const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0))
  const overallStatus = overallScore >= 85 ? 'Champion' : overallScore >= 70 ? 'Healthy' : overallScore >= 50 ? 'Needs Attention' : overallScore >= 30 ? 'At Risk' : 'Critical'

  const riskFactors: string[] = []
  if (sup.open_tickets > 15) riskFactors.push('High open ticket volume')
  if (sup.csat_score < 5) riskFactors.push('Low CSAT score')
  if (rel.nps_score < 5) riskFactors.push('Low NPS score')
  if (com.payment_delays > 3) riskFactors.push('Multiple payment delays')
  if (pu.feature_adoption_rate < 30) riskFactors.push('Low feature adoption')
  if (!rel.executive_sponsor) riskFactors.push('No executive sponsor identified')
  if (com.contract_utilization < 40) riskFactors.push('Low contract utilization')

  const riskLevel = riskFactors.length >= 4 ? 'Critical' : riskFactors.length >= 3 ? 'High' : riskFactors.length >= 1 ? 'Medium' : 'Low'

  const alerts: { severity: string; message: string; action: string }[] = []
  if (sup.open_tickets > 20) alerts.push({ severity: 'critical', message: `${sup.open_tickets} open tickets - critical threshold exceeded`, action: 'Escalate to support manager and schedule emergency call' })
  if (rel.nps_score < 4) alerts.push({ severity: 'high', message: `NPS score ${rel.nps_score} indicates detractor risk`, action: 'Schedule executive outreach within 48 hours' })
  if (com.payment_delays > 5) alerts.push({ severity: 'high', message: `${com.payment_delays} payment delays detected`, action: 'Engage finance team and schedule payment discussion' })
  if (pu.feature_adoption_rate < 20) alerts.push({ severity: 'medium', message: `Feature adoption at ${pu.feature_adoption_rate}% - value realization at risk`, action: 'Schedule product training and enablement session' })
  if (!rel.qbr_completed) alerts.push({ severity: 'medium', message: 'QBR not completed - relationship gap', action: 'Schedule QBR within next 2 weeks' })

  const improvementPaths: { area: string; action: string; expected_impact: string; priority: string }[] = []
  if (usageScore < 18) improvementPaths.push({ area: 'Product Usage', action: 'Deploy targeted feature training and adoption campaign', expected_impact: '+5-8 health score points', priority: usageScore < 12 ? 'P1-Critical' : 'P2-High' })
  if (supportScore < 18) improvementPaths.push({ area: 'Support Health', action: 'Implement proactive support model and ticket triage', expected_impact: '+4-7 health score points', priority: supportScore < 12 ? 'P1-Critical' : 'P2-High' })
  if (relScore < 18) improvementPaths.push({ area: 'Relationship', action: 'Establish executive sponsorship program and schedule QBR', expected_impact: '+5-8 health score points', priority: relScore < 12 ? 'P1-Critical' : 'P2-High' })
  if (commScore < 18) improvementPaths.push({ area: 'Commercial', action: 'Review contract utilization and identify expansion opportunities', expected_impact: '+3-6 health score points', priority: 'P3-Medium' })

  return {
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    overall_score: overallScore,
    overall_status: overallStatus,
    dimensions,
    risk_level: riskLevel,
    risk_factors: riskFactors,
    alerts,
    improvement_paths: improvementPaths,
    trend: overallScore >= 70 ? 'positive' : overallScore >= 50 ? 'stable' : 'declining',
    next_review_date: dateDaysFromNow(30)
  }
}

function formatHealthReport(result: HealthScorecardResult): string {
  const lines: string[] = [
    `\u2605 CUSTOMER HEALTH SCORECARD: ${result.customer_name}`,
    `${'='.repeat(55)}`,
    `  Customer ID: ${result.customer_id}`,
    `  Overall Score: ${result.overall_score}/100  |  Status: ${result.overall_status}`,
    `  Risk Level: ${result.risk_level}`,
    `  Trend: ${result.trend}`,
    '',
    renderGauge(result.overall_score, 100, 'Overall Health'),
    '',
    `\u25B6 DIMENSION BREAKDOWN`,
    ...result.dimensions.map(d => `  ${d.dimension}: ${d.score}/${d.maxScore} (${d.status})`),
    '',
    `\u25B6 DASHBOARD`,
    renderDashboard(Object.fromEntries(result.dimensions.map(d => [d.dimension, (d.score / d.maxScore) * 100])), 'Health Dimensions'),
    '',
  ]

  if (result.risk_factors.length > 0) {
    lines.push(`\u25B6 RISK FACTORS (${result.risk_factors.length})`)
    result.risk_factors.forEach(rf => lines.push(`  - ${rf}`))
    lines.push('')
  }

  if (result.alerts.length > 0) {
    lines.push(`\u25B6 ALERTS (${result.alerts.length})`)
    result.alerts.forEach(a => lines.push(`  [${a.severity.toUpperCase()}] ${a.message}\n    Action: ${a.action}`))
    lines.push('')
  }

  if (result.improvement_paths.length > 0) {
    lines.push(`\u25B6 IMPROVEMENT PATHS`)
    result.improvement_paths.forEach(ip => lines.push(`  [${ip.priority}] ${ip.area}: ${ip.action}\n    Expected: ${ip.expected_impact}`))
    lines.push('')
  }

  lines.push(`  Next Review: ${result.next_review_date}`)
  return lines.join('\n')
}

// ==================== TOOL 2: ONBOARDING GUIDE ====================

function generateOnboardingGuide(input: OnboardingInput): OnboardingResult {
  const phases = input.journey_phases
  const milestones = input.milestones

  const journeyMap = phases.map(p => {
    const phaseMs = milestones.filter(m => m.phase === p.phase_name)
    const completed = phaseMs.filter(m => m.status === 'completed').length
    const progress = phaseMs.length > 0 ? Math.round((completed / phaseMs.length) * 100) : 0
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'
    return { phase: p.phase_name, duration: p.duration_days, progress, status }
  })

  const milestoneTracker = milestones.map(m => {
    const due = dateDaysFromNow(m.due_day)
    const progress = m.status === 'completed' ? 100 : m.status === 'in_progress' ? 50 : 0
    return { name: m.name, phase: m.phase, due, status: m.status, owner: m.owner, progress }
  })

  const taskChecklist: { task: string; phase: string; priority: string; due_day: number; completed: boolean }[] = []
  for (const phase of phases) {
    for (const activity of phase.key_activities) {
      const ms = milestones.find(m => m.name === activity)
      taskChecklist.push({
        task: activity,
        phase: phase.phase_name,
        priority: phase.phase_name === 'Setup' ? 'P1-Critical' : phase.phase_name === 'Training' ? 'P2-High' : 'P3-Medium',
        due_day: ms?.due_day ?? phase.duration_days,
        completed: ms?.status === 'completed'
      })
    }
  }

  const resourcePlan = phases.flatMap(p => p.resources_needed.map(r => ({
    resource: r,
    type: p.phase_name,
    availability: 'confirmed',
    cost: fmtCurrency(Math.floor(seededRandom(r) * 5000 + 1000))
  })))

  const measurementFramework = [
    { metric: 'Time to First Value', baseline: 'N/A', target: '14 days', current: 'Day ' + (milestones.filter(m => m.status === 'completed').length * 3).toString(), status: milestones.length > 0 ? 'on_track' : 'pending' },
    { metric: 'Feature Adoption Rate', baseline: '0%', target: '60%', current: Math.round((taskChecklist.filter(t => t.completed).length / Math.max(taskChecklist.length, 1)) * 100) + '%', status: 'on_track' },
    { metric: 'User Activation', baseline: '0', target: String(input.team_size * 0.8), current: String(Math.round(input.team_size * (milestones.filter(m => m.status === 'completed').length / Math.max(milestones.length, 1)))), status: 'on_track' },
    { metric: 'Support Ticket Volume', baseline: 'N/A', target: '< 10/month', current: 'TBD', status: 'pending' },
  ]

  const bestPractices = [
    'Assign dedicated onboarding sponsor from customer side',
    'Schedule weekly check-ins during first 30 days',
    'Provide role-based training tracks for different user personas',
    'Set up in-app guidance and tooltips for key workflows',
    'Create customer-specific success criteria and share with stakeholders',
    'Establish escalation path for technical blockers within 24 hours',
    'Document customer configuration and preferences in CSM platform',
    'Celebrate early wins and share progress with executive sponsors',
  ]

  const completedMs = milestones.filter(m => m.status === 'completed').length
  const overallProgress = milestones.length > 0 ? Math.round((completedMs / milestones.length) * 100) : 0

  const riskItems: string[] = []
  const blockedMs = milestones.filter(m => m.status === 'blocked')
  if (blockedMs.length > 0) riskItems.push(`${blockedMs.length} blocked milestone(s): ${blockedMs.map(m => m.name).join(', ')}`)
  if (input.technical_maturity === 'low') riskItems.push('Low technical maturity may extend onboarding timeline')
  if (overallProgress < 30 && milestones.length > 3) riskItems.push('Slow progress in early phases')

  const totalDuration = phases.reduce((sum, p) => sum + p.duration_days, 0)
  const estimatedGoLive = dateDaysFromNow(Math.max(totalDuration - completedMs * 3, 7))

  return {
    onboarding_id: generateId('onb'),
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    journey_map: journeyMap,
    milestone_tracker: milestoneTracker,
    task_checklist: taskChecklist,
    resource_plan: resourcePlan,
    measurement_framework: measurementFramework,
    best_practices: bestPractices,
    overall_progress: overallProgress,
    risk_items: riskItems,
    estimated_go_live: estimatedGoLive
  }
}

function formatOnboardingReport(result: OnboardingResult): string {
  const lines: string[] = [
    `\u2605 CUSTOMER ONBOARDING GUIDE: ${result.customer_name}`,
    `${'='.repeat(55)}`,
    `  Onboarding ID: ${result.onboarding_id}`,
    `  Customer ID: ${result.customer_id}`,
    `  Overall Progress: ${result.overall_progress}%`,
    `  Estimated Go-Live: ${result.estimated_go_live}`,
    '',
    renderGauge(result.overall_progress, 100, 'Onboarding Progress'),
    '',
    `\u25B6 JOURNEY MAP`,
    ...result.journey_map.map(j => `  ${j.phase}: ${j.progress}% (${j.status}) [${j.duration}d]`),
    '',
    `\u25B6 MILESTONE TRACKER (${result.milestone_tracker.length})`,
    ...result.milestone_tracker.slice(0, 8).map(m => `  [${m.status.padEnd(12)}] ${m.name} (${m.phase}) - ${m.owner}`),
    '',
    `\u25B6 MEASUREMENT FRAMEWORK`,
    ...result.measurement_framework.map(m => `  ${m.metric}: ${m.current} / ${m.target} (${m.status})`),
    '',
  ]

  if (result.risk_items.length > 0) {
    lines.push(`\u25B6 RISK ITEMS`)
    result.risk_items.forEach(r => lines.push(`  - ${r}`))
    lines.push('')
  }

  lines.push(`\u25B6 BEST PRACTICES`)
  result.best_practices.slice(0, 5).forEach(bp => lines.push(`  - ${bp}`))

  return lines.join('\n')
}

// ==================== TOOL 3: RENEWAL MANAGER ====================

function manageRenewals(input: RenewalInput): RenewalResult {
  const plans: RenewalPlan[] = input.contracts.map(contract => {
    const healthFactor = input.health_score / 100
    const utilizationFactor = contract.utilization_rate / 100
    const churnFactor = input.churn_risk === 'Low' ? 1.0 : input.churn_risk === 'Medium' ? 0.7 : input.churn_risk === 'High' ? 0.4 : 0.2
    const sentimentFactor = input.stakeholder_sentiment === 'positive' ? 1.0 : input.stakeholder_sentiment === 'neutral' ? 0.8 : 0.5
    const competitorFactor = input.competitor_threat === 'none' ? 1.0 : input.competitor_threat === 'low' ? 0.85 : input.competitor_threat === 'medium' ? 0.65 : 0.4

    const renewalProb = Math.round(clamp(healthFactor * 0.3 + utilizationFactor * 0.25 + churnFactor * 0.2 + sentimentFactor * 0.15 + competitorFactor * 0.1, 0.05, 0.98) * 100)
    const riskLevel = renewalProb >= 85 ? 'Low' : renewalProb >= 65 ? 'Medium' : renewalProb >= 40 ? 'High' : 'Critical'

    const strategy = renewalProb >= 85 ? 'Standard renewal with expansion discussion' :
                     renewalProb >= 65 ? 'Proactive engagement with value reinforcement' :
                     renewalProb >= 40 ? 'Intensive save plan with executive involvement' :
                     'Critical intervention with discount authority and executive sponsorship'

    const discountOffer = renewalProb >= 85 ? '0-3% (standard terms)' :
                          renewalProb >= 65 ? '3-7% (competitive pricing)' :
                          renewalProb >= 40 ? '7-15% (save discount)' :
                          '15-25% (critical retention)'

    const timeline = [
      `T-${Math.max(90, Math.round((1 - renewalProb / 100) * 60) + 90)}d: Initial renewal discussion`,
      `T-60d: Business value review and ROI documentation`,
      `T-30d: Proposal delivery and negotiation`,
      `T-14d: Contract finalization`,
      `T-7d: Signature and handoff to implementation`
    ]

    return {
      contract_id: contract.contract_id,
      product: contract.product,
      arr: contract.arr,
      renewal_probability: renewalProb,
      risk_level: riskLevel,
      strategy,
      discount_offer: discountOffer,
      timeline,
      owner: 'CSM',
      status: 'active'
    }
  })

  const totalArr = input.contracts.reduce((sum, c) => sum + c.arr, 0)
  const weightedRate = plans.reduce((sum, p) => sum + p.renewal_probability * p.arr, 0) / Math.max(totalArr, 1)

  const riskSummary = (['Low', 'Medium', 'High', 'Critical'] as const).map(level => {
    const count = plans.filter(p => p.risk_level === level).length
    const factors: string[] = []
    if (level === 'Critical') factors.push('Churn risk elevated', 'Low health score', 'Competitor threat')
    if (level === 'High') factors.push('Declining engagement', 'Support issues', 'Low utilization')
    if (level === 'Medium') factors.push('Moderate engagement', 'Some competitive pressure')
    if (level === 'Low') factors.push('Strong relationship', 'High adoption', 'Positive NPS')
    return { level, count: `${count} contract(s)`, factors }
  })

  const discountStrategy = [
    { tier: 'Standard (0-3%)', condition: 'Renewal probability > 85%', discount: '0-3%', roi_impact: 'Minimal revenue impact, high renewal certainty' },
    { tier: 'Competitive (3-7%)', condition: 'Renewal probability 65-85%', discount: '3-7%', roi_impact: 'Moderate revenue impact, maintains competitiveness' },
    { tier: 'Save (7-15%)', condition: 'Renewal probability 40-65%', discount: '7-15%', roi_impact: 'Significant revenue impact, prevents churn' },
    { tier: 'Critical (15-25%)', condition: 'Renewal probability < 40%', discount: '15-25%', roi_impact: 'Maximum revenue impact, last-resort retention' },
  ]

  const coordinationMatrix = [
    { task: 'Health score review', owner: 'CSM', deadline: dateDaysFromNow(7), status: 'pending' },
    { task: 'ROI documentation', owner: 'CSM', deadline: dateDaysFromNow(14), status: 'pending' },
    { task: 'Executive alignment', owner: 'CSM Director', deadline: dateDaysFromNow(21), status: 'pending' },
    { task: 'Proposal generation', owner: 'Sales/CSM', deadline: dateDaysFromNow(30), status: 'pending' },
    { task: 'Negotiation', owner: 'Sales', deadline: dateDaysFromNow(45), status: 'pending' },
    { task: 'Contract execution', owner: 'Legal', deadline: dateDaysFromNow(60), status: 'pending' },
  ]

  const roiReport = [
    { metric: 'Total ARR at Risk', value: fmtCurrency(totalArr) },
    { metric: 'Weighted Renewal Rate', value: weightedRate.toFixed(1) + '%' },
    { metric: 'Expected Retained ARR', value: fmtCurrency(totalArr * weightedRate / 100) },
    { metric: 'Discount Budget', value: fmtCurrency(input.discount_budget) },
    { metric: 'Expansion Pipeline', value: fmtCurrency(input.expansion_opportunities.reduce((s, o) => s + o.estimated_value, 0)) },
    { metric: 'Net Revenue Retention', value: (weightedRate + input.expansion_opportunities.length * 5).toFixed(1) + '%' },
  ]

  const funnel: Record<string, number> = {
    'Identified': plans.length,
    'Qualified': plans.filter(p => p.renewal_probability > 50).length,
    'Proposal': plans.filter(p => p.renewal_probability > 70).length,
    'Negotiation': plans.filter(p => p.renewal_probability > 85).length,
    'Closed Won': plans.filter(p => p.renewal_probability > 95).length,
  }

  return {
    renewal_id: generateId('ren'),
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    total_arr_at_risk: totalArr,
    weighted_renewal_rate: Math.round(weightedRate),
    plans,
    risk_summary: riskSummary,
    discount_strategy: discountStrategy,
    coordination_matrix: coordinationMatrix,
    roi_report: roiReport,
    funnel
  }
}

function formatRenewalReport(result: RenewalResult): string {
  const lines: string[] = [
    `\u2605 RENEWAL MANAGEMENT: ${result.customer_name}`,
    `${'='.repeat(55)}`,
    `  Renewal ID: ${result.renewal_id}`,
    `  Total ARR at Risk: ${fmtCurrency(result.total_arr_at_risk)}`,
    `  Weighted Renewal Rate: ${result.weighted_renewal_rate}%`,
    '',
    renderGauge(result.weighted_renewal_rate, 100, 'Renewal Confidence'),
    '',
    `\u25B6 RENEWAL PLANS (${result.plans.length})`,
    ...result.plans.map(p => `  ${p.product}: ${p.renewal_probability}% (${p.risk_level}) - ${p.strategy}`),
    '',
    `\u25B6 RISK SUMMARY`,
    ...result.risk_summary.filter(r => r.count !== '0 contract(s)').map(r => `  ${r.level}: ${r.count}`),
    '',
    `\u25B6 ROI REPORT`,
    ...result.roi_report.map(r => `  ${r.metric}: ${r.value}`),
    '',
    renderFunnel(result.funnel),
    '',
    `\u25B6 COORDINATION`,
    ...result.coordination_matrix.slice(0, 4).map((c: { task: string; owner: string; deadline: string }) => `  ${c.task} (${c.owner}) - ${c.deadline}`),
  ]

  return lines.join('\n')
}

// ==================== TOOL 4: ADVOCACY PROGRAM ====================

function manageAdvocacyProgram(input: AdvocacyInput): AdvocacyResult {
  const advocates = input.advocates
  const tiers = ['Platinum', 'Gold', 'Silver'] as const

  const advocateRoster = advocates.map(a => {
    const tier = a.engagement_score >= 80 ? 'Platinum' : a.engagement_score >= 60 ? 'Gold' : 'Silver'
    const activities: string[] = []
    if (a.nps_score >= 9) activities.push('Case study participant')
    if (a.engagement_score >= 70) activities.push('Reference calls')
    if (a.engagement_score >= 60) activities.push('Event speaker')
    if (a.engagement_score >= 50) activities.push('Review site reviews')
    if (activities.length === 0) activities.push('Community member')
    const valueGen = tier === 'Platinum' ? fmtCurrency(Math.floor(a.engagement_score * 100 + 5000)) : tier === 'Gold' ? fmtCurrency(Math.floor(a.engagement_score * 50 + 2000)) : fmtCurrency(Math.floor(a.engagement_score * 20 + 500))
    return { contact: a.contact_name, tier, engagement: `${a.engagement_score}/100`, activities, value_generated: valueGen }
  })

  const eventCalendar = input.events_planned.map(e => ({
    event: e.event_name,
    type: e.type,
    date: e.date,
    projected_roi: fmtCurrency(e.target_attendees * 500),
    status: 'planned'
  }))

  const incentiveAnalysis = tiers.map(tier => {
    const tierAdvocates = advocateRoster.filter(a => a.tier === tier)
    const tierIncentive = input.incentive_structure.find(i => i.tier === tier)
    const cost = tierIncentive?.estimated_cost ?? 'TBD'
    const roi = tier === 'Platinum' ? '8-12x' : tier === 'Gold' ? '5-8x' : '3-5x'
    const effectiveness = tierAdvocates.length > 3 ? 'high' : tierAdvocates.length > 1 ? 'medium' : 'low'
    return { tier, advocates_count: tierAdvocates.length, cost, roi, effectiveness }
  })

  const storyPipeline = input.story_requests.map(s => ({
    customer: s.customer_id,
    type: s.story_type,
    status: s.status,
    impact_score: s.status === 'completed' ? 'high' : s.status === 'in_progress' ? 'medium' : 'pending'
  }))

  const cm = input.community_metrics
  const communityHealth = {
    health_score: Math.round((cm.active_members / Math.max(cm.members, 1)) * 100),
    growth_rate: '12%',
    engagement_rate: fmtPercentage(cm.active_members, cm.members),
    top_contributors: advocates.filter(a => a.engagement_score >= 70).map(a => a.contact_name).slice(0, 3)
  }

  const npsImpact = {
    before: input.nps_baseline,
    after: Math.min(10, input.nps_baseline + 1.5),
    lift: '+1.5',
    significance: 'statistically significant (p < 0.05)'
  }

  const totalRoi = fmtCurrency(advocates.length * 3000 + input.events_planned.reduce((s, e) => s + e.target_attendees * 500, 0))

  const recommendations = [
    'Increase Platinum tier benefits to retain top advocates',
    'Launch quarterly advocacy impact report for executive visibility',
    'Create industry-specific reference program for vertical selling',
    'Implement automated advocate engagement scoring and alerts',
    'Develop customer advisory board from top 10 advocates',
  ]

  return {
    program_id: generateId('adv'),
    program_name: input.program_name,
    advocate_roster: advocateRoster,
    event_calendar: eventCalendar,
    incentive_analysis: incentiveAnalysis,
    story_pipeline: storyPipeline,
    community_health: communityHealth,
    nps_impact: npsImpact,
    total_roi: totalRoi,
    recommendations
  }
}

function formatAdvocacyReport(result: AdvocacyResult): string {
  const lines: string[] = [
    `\u2605 ADVOCACY PROGRAM: ${result.program_name}`,
    `${'='.repeat(55)}`,
    `  Program ID: ${result.program_id}`,
    `  Total ROI: ${result.total_roi}`,
    `  Community Health Score: ${result.community_health.health_score}/100`,
    '',
    `\u25B6 ADVOCATE ROSTER (${result.advocate_roster.length})`,
    ...result.advocate_roster.slice(0, 6).map(a => `  [${a.tier}] ${a.contact} (${a.engagement}) - ${a.value_generated}`),
    '',
    `\u25B6 EVENT CALENDAR (${result.event_calendar.length})`,
    ...result.event_calendar.map(e => `  ${e.event} (${e.type}) - ${e.date} - ${e.projected_roi}`),
    '',
    `\u25B6 INCENTIVE ANALYSIS`,
    ...result.incentive_analysis.map(i => `  ${i.tier}: ${i.advocates_count} advocates, ROI ${i.roi}, ${i.effectiveness}`),
    '',
    `\u25B6 NPS IMPACT`,
    `  Before: ${result.nps_impact.before} -> After: ${result.nps_impact.after} (${result.nps_impact.lift})`,
    `  ${result.nps_impact.significance}`,
    '',
    `\u25B6 RECOMMENDATIONS`,
    ...result.recommendations.slice(0, 3).map(r => `  - ${r}`),
  ]

  return lines.join('\n')
}

// ==================== TOOL 5: CROSS-SELL EXPANSION ====================

function analyzeCrossSell(input: CrossSellInput): CrossSellResult {
  const opportunities: ExpansionOpportunity[] = input.usage_gaps.filter(g => g.expansion_potential === 'high' || g.expansion_potential === 'medium').map(gap => {
    const fitScore = Math.round(clamp((gap.gap_value / Math.max(gap.potential_usage, 1)) * 100, 30, 95))
    const estimatedValue = Math.round(gap.gap_value * 12 * (fitScore / 100))
    const timing = input.timing_signals.length > 2 ? 'immediate' : input.timing_signals.length > 0 ? 'near_term' : 'future'
    const approach = fitScore >= 70 ? 'Direct outreach with ROI case study' : fitScore >= 50 ? 'Educational content + demo offer' : 'Nurture campaign with product education'
    const probability = Math.round(clamp(fitScore * 0.7 + input.timing_signals.length * 5, 10, 90))
    const quoteTemplate = `Based on your current usage gap in ${gap.feature}, we recommend the ${gap.feature} expansion pack. Estimated annual value: ${fmtCurrency(estimatedValue)}. Implementation: 2-4 weeks.`

    return {
      product: gap.feature,
      fit_score: fitScore,
      estimated_value: estimatedValue,
      timing,
      approach,
      probability,
      quote_template: quoteTemplate
    }
  })

  const totalExpansionValue = opportunities.reduce((sum, o) => sum + o.estimated_value, 0)

  const gapAnalysis = input.usage_gaps.map(g => ({
    feature: g.feature,
    current: g.current_usage,
    potential: g.potential_usage,
    priority: g.expansion_potential === 'high' ? 'P1-Critical' : g.expansion_potential === 'medium' ? 'P2-High' : 'P3-Medium'
  }))

  const similarCustomerMatches = input.similar_customers.slice(0, 5).map(sc => ({
    customer: sc.company_name,
    similarity: `${Math.round(sc.similarity_score * 100)}%`,
    products: sc.purchased_products.join(', '),
    revenue: fmtCurrency(sc.expansion_revenue)
  }))

  const timingAssessment = input.timing_signals.map(signal => ({
    signal,
    readiness: input.timing_signals.length > 2 ? 'ready' : 'nurture',
    recommended_action: input.timing_signals.length > 2 ? 'Schedule demo this week' : 'Add to nurture sequence'
  }))

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
  const forecast = quarters.map((q, i) => ({
    quarter: q,
    probability: Math.round(clamp(30 + i * 15 + opportunities.length * 5, 20, 90)),
    weighted_value: Math.round(totalExpansionValue * (0.15 + i * 0.1))
  }))

  const trackingPlan = [
    { milestone: 'Initial outreach', date: dateDaysFromNow(7), owner: 'CSM', status: 'pending' },
    { milestone: 'Demo completed', date: dateDaysFromNow(21), owner: 'Sales/SE', status: 'pending' },
    { milestone: 'Proposal delivered', date: dateDaysFromNow(35), owner: 'Sales', status: 'pending' },
    { milestone: 'Negotiation', date: dateDaysFromNow(49), owner: 'Sales', status: 'pending' },
    { milestone: 'Close', date: dateDaysFromNow(63), owner: 'Sales', status: 'pending' },
  ]

  return {
    expansion_id: generateId('exp'),
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    opportunities,
    total_expansion_value: totalExpansionValue,
    gap_analysis: gapAnalysis,
    similar_customer_matches: similarCustomerMatches,
    timing_assessment: timingAssessment,
    forecast,
    tracking_plan: trackingPlan
  }
}

function formatCrossSellReport(result: CrossSellResult): string {
  const lines: string[] = [
    `\u2605 CROSS-SELL EXPANSION: ${result.customer_name}`,
    `${'='.repeat(55)}`,
    `  Expansion ID: ${result.expansion_id}`,
    `  Total Expansion Value: ${fmtCurrency(result.total_expansion_value)}`,
    `  Opportunities: ${result.opportunities.length}`,
    '',
    `\u25B6 OPPORTUNITIES`,
    ...result.opportunities.map(o => `  ${o.product}: ${o.fit_score}% fit, ${fmtCurrency(o.estimated_value)}, ${o.probability}% probability`),
    '',
    `\u25B6 GAP ANALYSIS`,
    ...result.gap_analysis.map(g => `  ${g.feature}: ${g.current} -> ${g.potential} (${g.priority})`),
    '',
    `\u25B6 SIMILAR CUSTOMER MATCHES`,
    ...result.similar_customer_matches.map(s => `  ${s.customer} (${s.similarity}): ${s.revenue}`),
    '',
    `\u25B6 FORECAST`,
    ...result.forecast.map(f => `  ${f.quarter}: ${f.probability}% probability, ${fmtCurrency(f.weighted_value)}`),
    '',
    `\u25B6 TRACKING PLAN`,
    ...result.tracking_plan.map(t => `  ${t.milestone} (${t.owner}) - ${t.date}`),
  ]

  return lines.join('\n')
}

// ==================== TOOL 6: CHURN PREDICTION ====================

function predictChurn(input: ChurnInput): ChurnResult {
  const features = input.behavioral_features
  let churnScore = 0
  const maxScore = features.reduce((sum, f) => sum + f.weight, 0)

  for (const f of features) {
    const deviation = f.baseline_value > 0 ? (f.current_value - f.baseline_value) / f.baseline_value : 0
    const trendPenalty = f.trend === 'declining' ? 1.5 : f.trend === 'stable' ? 1.0 : 0.5
    const contribution = Math.max(0, -deviation * f.weight * trendPenalty)
    churnScore += contribution
  }

  const churnProb = Math.round(clamp((churnScore / maxScore) * 100 + input.competitor_mentions * 3 + (input.executive_changes ? 10 : 0) + input.payment_delays * 5, 5, 98))
  const riskLevel = churnProb >= 75 ? 'Critical' : churnProb >= 50 ? 'High' : churnProb >= 25 ? 'Medium' : 'Low'

  const riskSegments: RiskSegment[] = [
    { segment: 'Behavioral Risk', score: Math.round(clamp(churnScore / maxScore * 100, 0, 100)), factors: features.filter(f => f.trend === 'declining').map(f => f.feature), probability: churnProb, timeframe: '30-60 days' },
    { segment: 'Competitive Risk', score: Math.min(100, input.competitor_mentions * 20), factors: [`${input.competitor_mentions} competitor mentions`], probability: Math.min(90, input.competitor_mentions * 25), timeframe: '15-45 days' },
    { segment: 'Financial Risk', score: Math.min(100, input.payment_delays * 25 + (input.executive_changes ? 30 : 0)), factors: [`${input.payment_delays} payment delays`, ...(input.executive_changes ? ['Executive changes'] : [])], probability: Math.min(85, input.payment_delays * 30 + (input.executive_changes ? 35 : 0)), timeframe: '30-90 days' },
  ]

  const behavioralAnalysis = features.map(f => ({
    feature: f.feature,
    status: f.trend,
    contribution: `${Math.round(f.weight / maxScore * 100)}%`,
    recommendation: f.trend === 'declining' ? `Urgent intervention needed: ${f.feature} declining` : f.trend === 'stable' ? `Monitor: ${f.feature} stable but watch for changes` : `Positive: ${f.feature} improving`
  }))

  const interventionStrategies: InterventionStrategy[] = [
    { strategy: 'Executive Outreach', target_segment: 'Behavioral Risk', description: 'Schedule executive-to-executive call to address concerns and reinforce value', expected_success_rate: 65, cost: fmtCurrency(500), timeline: '48 hours', owner: 'CSM Director' },
    { strategy: 'Value Reinforcement', target_segment: 'Behavioral Risk', description: 'Deliver customized ROI report and success story presentation', expected_success_rate: 55, cost: fmtCurrency(300), timeline: '1 week', owner: 'CSM' },
    { strategy: 'Competitive Counter', target_segment: 'Competitive Risk', description: 'Deploy battle cards, competitive differentiation analysis, and retention offer', expected_success_rate: 60, cost: fmtCurrency(1000), timeline: '3 days', owner: 'Sales/CSM' },
    { strategy: 'Financial Accommodation', target_segment: 'Financial Risk', description: 'Offer payment plan, temporary discount, or contract restructuring', expected_success_rate: 70, cost: fmtCurrency(2000), timeline: '1 week', owner: 'Finance/Sales' },
    { strategy: 'Product Recovery', target_segment: 'Behavioral Risk', description: 'Deploy dedicated SE resources for product training and optimization', expected_success_rate: 50, cost: fmtCurrency(1500), timeline: '2 weeks', owner: 'SE/CSM' },
  ]

  const effectivenessPrediction = interventionStrategies.map(s => ({
    strategy: s.strategy,
    success_probability: s.expected_success_rate,
    revenue_saved: fmtCurrency(Math.round(input.arr * s.expected_success_rate / 100)),
    cost: s.cost,
    roi: `${Math.round((input.arr * s.expected_success_rate / 100) / Math.max(parseInt(s.cost.replace(/[^0-9]/g, '') || '1', 10), 1) * 100) / 100}x`
  }))

  const successMetrics = [
    { metric: 'Churn Probability', current: `${churnProb}%`, target: `${Math.max(churnProb - 30, 10)}%`, measurement: 'Weekly behavioral scoring' },
    { metric: 'Feature Adoption', current: `${features.find(f => f.feature.includes('feature'))?.current_value ?? 'N/A'}`, target: `${features.find(f => f.feature.includes('feature'))?.baseline_value ?? 'N/A'}`, measurement: 'Product analytics dashboard' },
    { metric: 'NPS Trend', current: `${input.nps_history[input.nps_history.length - 1] ?? 'N/A'}`, target: '8+', measurement: 'Quarterly NPS survey' },
    { metric: 'Support Satisfaction', current: input.support_tickets_trend, target: 'improving', measurement: 'Post-ticket CSAT survey' },
  ]

  const monitoringPlan = {
    frequency: churnProb >= 75 ? 'daily' : churnProb >= 50 ? 'weekly' : 'bi-weekly',
    indicators: ['Login frequency', 'Feature usage depth', 'Support ticket sentiment', 'NPS response', 'Payment status'],
    escalation_trigger: churnProb >= 75 ? 'Immediate CSM Director alert' : churnProb >= 50 ? 'CSM manager notification within 24h' : 'Weekly CSM review'
  }

  return {
    prediction_id: generateId('churn'),
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    churn_probability: churnProb,
    risk_level: riskLevel,
    risk_segments: riskSegments,
    behavioral_analysis: behavioralAnalysis,
    intervention_strategies: interventionStrategies,
    effectiveness_prediction: effectivenessPrediction,
    success_metrics: successMetrics,
    monitoring_plan: monitoringPlan
  }
}

function formatChurnReport(result: ChurnResult): string {
  const lines: string[] = [
    `\u2605 CHURN PREDICTION: ${result.customer_name}`,
    `${'='.repeat(55)}`,
    `  Prediction ID: ${result.prediction_id}`,
    `  Churn Probability: ${result.churn_probability}%`,
    `  Risk Level: ${result.risk_level}`,
    '',
    renderGauge(result.churn_probability, 100, 'Churn Risk'),
    '',
    `\u25B6 RISK SEGMENTS`,
    ...result.risk_segments.map(s => `  ${s.segment}: ${s.score}/100 (${s.probability}% probability, ${s.timeframe})`),
    '',
    `\u25B6 BEHAVIORAL ANALYSIS`,
    ...result.behavioral_analysis.slice(0, 5).map(b => `  ${b.feature}: ${b.status} (${b.contribution}) - ${b.recommendation}`),
    '',
    `\u25B6 INTERVENTION STRATEGIES`,
    ...result.intervention_strategies.slice(0, 3).map(s => `  ${s.strategy} (${s.target_segment}): ${s.expected_success_rate}% success rate`),
    '',
    `\u25B6 EFFECTIVENESS PREDICTION`,
    ...result.effectiveness_prediction.slice(0, 3).map(e => `  ${e.strategy}: ${e.success_probability}% success, ${e.revenue_saved} saved, ROI ${e.roi}`),
    '',
    `\u25B6 MONITORING PLAN`,
    `  Frequency: ${result.monitoring_plan.frequency}`,
    `  Escalation: ${result.monitoring_plan.escalation_trigger}`,
  ]

  return lines.join('\n')
}

// ==================== TOOL 7: CSM WORKLOAD BALANCER ====================

function balanceWorkload(input: WorkloadInput): WorkloadResult {
  const customers = [...input.customers].sort((a, b) => b.arr - a.arr)
  const csmTeam = input.csm_team
  const assignments: WorkloadAssignment[] = csmTeam.map(c => ({
    csm_id: c.csm_id,
    csm_name: c.name,
    assigned_customers: [],
    total_hours: 0,
    utilization: 0,
    skill_match: 0,
    balance_score: 0
  }))

  const unassigned: { customer: string; reason: string; recommendation: string }[] = []
  const rotationPlan: { customer: string; from_csm: string; to_csm: string; reason: string; timeline: string }[] = []

  for (const customer of customers) {
    const bestCsm = csmTeam.reduce((best, csm) => {
      const skillMatch = customer.required_skills.filter(skill => csm.skills.includes(skill)).length / Math.max(customer.required_skills.length, 1)
      const currentAssignments = assignments.find(a => a.csm_id === csm.csm_id)
      const currentHours = currentAssignments?.total_hours ?? 0
      const capacityRemaining = csm.capacity_hours - currentHours
      const canAccommodate = capacityRemaining >= customer.hours_per_month
      const bestAssignments = assignments.find(a => a.csm_id === best.csm_id)
      const bestHours = bestAssignments?.total_hours ?? 0
      const bestCapacityRemaining = best.capacity_hours - bestHours

      if (!canAccommodate && capacityRemaining < bestCapacityRemaining) return best
      if (canAccommodate && bestCapacityRemaining < customer.hours_per_month) return csm

      const score = skillMatch * 0.4 + (capacityRemaining / csm.capacity_hours) * 0.3 + (csm.retention_rate / 100) * 0.3
      const bestScore = (best.skills.filter(s => customer.required_skills.includes(s)).length / Math.max(customer.required_skills.length, 1)) * 0.4 + (bestCapacityRemaining / best.capacity_hours) * 0.3 + (best.retention_rate / 100) * 0.3

      return score > bestScore ? csm : best
    })

    const assignment = assignments.find(a => a.csm_id === bestCsm.csm_id)!
    if (assignment.total_hours + customer.hours_per_month <= bestCsm.capacity_hours) {
      const healthStatus = customer.health_score >= 70 ? 'Healthy' : customer.health_score >= 50 ? 'Needs Attention' : 'At Risk'
      assignment.assigned_customers.push({ customer: customer.customer_name, tier: customer.tier, hours: customer.hours_per_month, health: healthStatus })
      assignment.total_hours += customer.hours_per_month
      assignment.utilization = Math.round((assignment.total_hours / bestCsm.capacity_hours) * 100)
      assignment.skill_match = Math.round(customer.required_skills.filter(s => bestCsm.skills.includes(s)).length / Math.max(customer.required_skills.length, 1) * 100)
      assignment.balance_score = Math.round((assignment.utilization * 0.3 + assignment.skill_match * 0.4 + (bestCsm.retention_rate) * 0.3))
    } else {
      unassigned.push({ customer: customer.customer_name, reason: 'Insufficient CSM capacity', recommendation: 'Consider hiring additional CSM or redistributing lower-tier accounts' })
    }
  }

  const skillGaps = input.skill_requirements.map(sr => ({
    skill: sr.skill,
    gap: sr.demand > sr.supply ? `${sr.demand - sr.supply} CSM(s)` : 'None',
    training_need: sr.demand > sr.supply ? 'Immediate training required' : 'Adequate coverage',
    priority: sr.demand > sr.supply * 1.5 ? 'P1-Critical' : sr.demand > sr.supply ? 'P2-High' : 'P3-Medium'
  }))

  const costModel = csmTeam.map(c => {
    const costPerHour = 75
    const totalCost = c.capacity_hours * costPerHour
    const revenueManaged = assignments.find(a => a.csm_id === c.csm_id)?.assigned_customers.reduce((sum, ac) => {
      const cust = customers.find(cu => cu.customer_name === ac.customer)
      return sum + (cust?.arr ?? 0)
    }, 0) ?? 0
    return {
      csm: c.name,
      cost_per_hour: fmtCurrency(costPerHour),
      total_cost: fmtCurrency(totalCost),
      revenue_managed: fmtCurrency(revenueManaged),
      cost_ratio: fmtPercentage(totalCost, Math.max(revenueManaged, 1))
    }
  })

  const efficiencyMetrics = [
    { metric: 'Avg Utilization', value: `${Math.round(assignments.reduce((s, a) => s + a.utilization, 0) / Math.max(assignments.length, 1))}%`, benchmark: '75-85%', status: 'good' },
    { metric: 'Avg Skill Match', value: `${Math.round(assignments.reduce((s, a) => s + a.skill_match, 0) / Math.max(assignments.length, 1))}%`, benchmark: '> 70%', status: 'good' },
    { metric: 'Unassigned Customers', value: `${unassigned.length}`, benchmark: '0', status: unassigned.length === 0 ? 'good' : 'warning' },
    { metric: 'Balance Score', value: `${Math.round(assignments.reduce((s, a) => s + a.balance_score, 0) / Math.max(assignments.length, 1))}`, benchmark: '> 70', status: 'good' },
  ]

  const recommendations = [
    unassigned.length > 0 ? `Address ${unassigned.length} unassigned customer(s) - consider capacity expansion` : 'All customers assigned - monitor utilization',
    skillGaps.filter(s => s.gap !== 'None').length > 0 ? `Close skill gaps in: ${skillGaps.filter(s => s.gap !== 'None').map(s => s.skill).join(', ')}` : 'Skill coverage adequate',
    'Implement quarterly workload review and rebalancing',
    'Consider automated tier-1 support to free CSM capacity for strategic accounts',
  ]

  return {
    balancer_id: generateId('bal'),
    assignments,
    unassigned,
    skill_gaps: skillGaps,
    rotation_plan: rotationPlan,
    cost_model: costModel,
    efficiency_metrics: efficiencyMetrics,
    recommendations
  }
}

function formatWorkloadReport(result: WorkloadResult): string {
  const lines: string[] = [
    `\u2605 CSM WORKLOAD BALANCER`,
    `${'='.repeat(55)}`,
    `  Balancer ID: ${result.balancer_id}`,
    `  CSMs: ${result.assignments.length} | Unassigned: ${result.unassigned.length}`,
    '',
    `\u25B6 ASSIGNMENTS`,
    ...result.assignments.map(a => `  ${a.csm_name}: ${a.assigned_customers.length} customers, ${a.total_hours}h, ${a.utilization}% util, ${a.skill_match}% skill match`),
    '',
    `\u25B6 EFFICIENCY METRICS`,
    ...result.efficiency_metrics.map(e => `  ${e.metric}: ${e.value} (benchmark: ${e.benchmark}) - ${e.status}`),
    '',
    `\u25B6 COST MODEL`,
    ...result.cost_model.map(c => `  ${c.csm}: ${c.total_cost} cost, ${c.revenue_managed} revenue, ${c.cost_ratio} ratio`),
    '',
  ]

  if (result.skill_gaps.filter(s => s.gap !== 'None').length > 0) {
    lines.push(`\u25B6 SKILL GAPS`)
    result.skill_gaps.filter(s => s.gap !== 'None').forEach(s => lines.push(`  ${s.skill}: ${s.gap} (${s.priority})`))
    lines.push('')
  }

  lines.push(`\u25B6 RECOMMENDATIONS`)
  result.recommendations.forEach(r => lines.push(`  - ${r}`))

  return lines.join('\n')
}

// ==================== TOOL 8: SUCCESS PLAN GENERATOR ====================

function generateSuccessPlan(input: SuccessPlanInput): SuccessPlanResult {
  const goalsStatus = input.goals.map(g => {
    const progress = g.target_value > 0 ? Math.round((g.current_value / g.target_value) * 100) : 0
    const targetDate = new Date(g.target_date)
    const now = new Date()
    const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    return { goal: g.goal, category: g.category, progress: Math.min(progress, 100), status: g.status, days_remaining: daysRemaining }
  })

  const milestoneTracker = input.milestones.map(m => ({
    name: m.name,
    due: m.due_date,
    status: m.status,
    owner: m.owner,
    completion: m.status === 'completed' ? 100 : m.status === 'in_progress' ? 50 : 0
  }))

  const riskRegister = input.risks.map(r => {
    const probScore = r.probability === 'high' ? 3 : r.probability === 'medium' ? 2 : 1
    const impactScore = r.impact === 'high' ? 3 : r.impact === 'medium' ? 2 : 1
    const score = probScore * impactScore
    return { risk: r.risk, score: `${score}/9`, mitigation_status: r.mitigation ? 'mitigated' : 'open', owner: 'CSM' }
  })

  const actionPlan = input.actions.map(a => ({
    action: a.action,
    owner: a.owner,
    due: a.due_date,
    priority: a.priority,
    status: a.status
  }))

  const metricsDashboard = input.metrics.map(m => {
    const progress = m.target > 0 ? Math.round((m.current / m.target) * 100) : 0
    const trend = m.current > m.baseline ? 'improving' : m.current < m.baseline ? 'declining' : 'stable'
    return { metric: m.metric, baseline: m.baseline, target: m.target, current: m.current, progress: `${Math.min(progress, 100)}%`, trend }
  })

  const automationStatus = input.automation_triggers.map(a => ({
    trigger: a.trigger,
    action: a.action,
    last_run: a.enabled ? dateDaysAgo(Math.floor(seededRandom(a.trigger) * 7)) : 'N/A',
    next_run: a.enabled ? dateDaysFromNow(Math.floor(seededRandom(a.action) * 7) + 1) : 'N/A',
    status: a.enabled ? 'active' : 'disabled'
  }))

  const collaborationMap = input.collaborators.map(c => ({
    collaborator: c.name,
    role: c.role,
    tasks: input.actions.filter(a => a.owner === c.name).length,
    last_active: dateDaysAgo(Math.floor(seededRandom(c.name) * 14))
  }))

  const completedGoals = goalsStatus.filter(g => g.status === 'completed').length
  const overallHealth = Math.round((completedGoals / Math.max(goalsStatus.length, 1)) * 60 + (metricsDashboard.reduce((s, m) => s + parseInt(m.progress), 0) / Math.max(metricsDashboard.length, 1)) * 0.4)

  const versionHistory = [
    { version: '1.0', date: dateDaysAgo(30), changes: 'Initial plan creation' },
    { version: '1.1', date: dateDaysAgo(14), changes: 'Added Q2 milestones and updated metrics' },
    { version: '2.0', date: dateDaysAgo(2), changes: input.version_notes || 'Latest revision' },
  ]

  return {
    plan_id: generateId('plan'),
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    plan_name: input.plan_name,
    version: '2.0',
    goals_status: goalsStatus,
    milestone_tracker: milestoneTracker,
    risk_register: riskRegister,
    action_plan: actionPlan,
    metrics_dashboard: metricsDashboard,
    automation_status: automationStatus,
    collaboration_map: collaborationMap,
    overall_health: Math.min(overallHealth, 100),
    next_review: dateDaysFromNow(14),
    version_history: versionHistory
  }
}

function formatSuccessPlanReport(result: SuccessPlanResult): string {
  const lines: string[] = [
    `\u2605 SUCCESS PLAN: ${result.plan_name}`,
    `${'='.repeat(55)}`,
    `  Plan ID: ${result.plan_id}`,
    `  Customer: ${result.customer_name} (${result.customer_id})`,
    `  Version: ${result.version}`,
    `  Overall Health: ${result.overall_health}/100`,
    `  Next Review: ${result.next_review}`,
    '',
    renderGauge(result.overall_health, 100, 'Plan Health'),
    '',
    `\u25B6 GOALS STATUS (${result.goals_status.length})`,
    ...result.goals_status.map(g => `  ${g.goal}: ${g.progress}% (${g.status}) - ${g.days_remaining}d remaining`),
    '',
    `\u25B6 MILESTONES (${result.milestone_tracker.length})`,
    ...result.milestone_tracker.slice(0, 5).map(m => `  [${m.status.padEnd(12)}] ${m.name} - ${m.owner} (${m.completion}%)`),
    '',
    `\u25B6 METRICS DASHBOARD`,
    ...result.metrics_dashboard.map(m => `  ${m.metric}: ${m.current}/${m.target} (${m.progress}) - ${m.trend}`),
    '',
    `\u25B6 RISK REGISTER (${result.risk_register.length})`,
    ...result.risk_register.map(r => `  [${r.score}] ${r.risk} - ${r.mitigation_status}`),
    '',
    `\u25B6 AUTOMATION (${result.automation_status.filter(a => a.status === 'active').length} active)`,
    ...result.automation_status.filter(a => a.status === 'active').slice(0, 3).map(a => `  ${a.trigger} -> ${a.action}`),
    '',
    `\u25B6 VERSION HISTORY`,
    ...result.version_history.map(v => `  v${v.version} (${v.date}): ${v.changes}`),
  ]

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'health_scorecard',
    description: 'Multi-dimensional customer health scorecard with product usage, support, relationship, and commercial scoring. Generates risk assessment, alerts, improvement paths, and trend analysis with ocean blue dashboard visualization.',
    parameters: {
      scorecard_input: { type: 'string', required: true, description: 'JSON health scorecard input: customer_id, customer_name, product_usage{daily_active_users, feature_adoption_rate, login_frequency, key_feature_usage, api_calls, data_volume_gb}, support{open_tickets, avg_resolution_hours, csat_score, escalation_rate, self_service_ratio}, relationship{nps_score, executive_sponsor, champion_count, qbr_completed, relationship_tenure_months, stakeholder_engagement}, commercial{arr, expansion_revenue, payment_delays, contract_utilization, discount_rate}' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { scorecard_input: string }) {
      const input: HealthScorecardInput = JSON.parse(args.scorecard_input)
      const result = calculateHealthScorecard(input)
      return formatHealthReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'onboarding_guide',
    description: 'Customer success onboarding guide with journey mapping, milestone tracking, task checklists, resource planning, measurement framework, and best practices. Tracks progress and identifies risks.',
    parameters: {
      onboarding_input: { type: 'string', required: true, description: 'JSON onboarding input: customer_id, customer_name, product_plan, start_date, target_go_live_date, team_size, technical_maturity, journey_phases[{phase_name, duration_days, objectives[], key_activities[], success_criteria[], resources_needed[]}], milestones[{name, phase, due_day, status, owner, dependencies[]}], assigned_csm' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { onboarding_input: string }) {
      const input: OnboardingInput = JSON.parse(args.onboarding_input)
      const result = generateOnboardingGuide(input)
      return formatOnboardingReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'renewal_manager',
    description: 'Comprehensive renewal management with renewal prediction, risk identification, renewal plans, discount strategy, coordination matrix, tracking, and ROI reporting with funnel visualization.',
    parameters: {
      renewal_input: { type: 'string', required: true, description: 'JSON renewal input: customer_id, customer_name, contracts[{contract_id, product, arr, start_date, end_date, renewal_date, payment_terms, utilization_rate}], health_score, churn_risk, stakeholder_sentiment, competitor_threat, expansion_opportunities[{product, estimated_value, fit_score}], discount_budget, csm_notes' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { renewal_input: string }) {
      const input: RenewalInput = JSON.parse(args.renewal_input)
      const result = manageRenewals(input)
      return formatRenewalReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'advocacy_program',
    description: 'Customer advocacy program management with advocate roster, event calendar, incentive analysis, story pipeline, community health tracking, NPS impact measurement, and ROI calculation.',
    parameters: {
      advocacy_input: { type: 'string', required: true, description: 'JSON advocacy input: program_name, advocates[{customer_id, contact_name, title, engagement_score, nps_score, industry, use_case, availability}], events_planned[{event_name, type, date, target_attendees, budget}], incentive_structure[{tier, requirement, reward, estimated_cost}], story_requests[{customer_id, story_type, topic, deadline, status}], community_metrics{members, active_members, posts_monthly, events_ytd}, nps_baseline' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { advocacy_input: string }) {
      const input: AdvocacyInput = JSON.parse(args.advocacy_input)
      const result = manageAdvocacyProgram(input)
      return formatAdvocacyReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'cross_sell_expansion',
    description: 'Cross-sell and expansion opportunity analysis with usage gap identification, similar customer matching, timing assessment, quote generation, tracking plan, and revenue forecasting.',
    parameters: {
      cross_sell_input: { type: 'string', required: true, description: 'JSON cross-sell input: customer_id, customer_name, current_products[], usage_gaps[{feature, current_usage, potential_usage, gap_value, expansion_potential}], similar_customers[{customer_id, company_name, industry, similarity_score, purchased_products[], expansion_revenue}], budget_cycle, decision_makers[{name, role, influence}], timing_signals[], competitive_products[]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { cross_sell_input: string }) {
      const input: CrossSellInput = JSON.parse(args.cross_sell_input)
      const result = analyzeCrossSell(input)
      return formatCrossSellReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'churn_prediction',
    description: 'Churn prediction model with behavioral feature analysis, risk segmentation, intervention strategies, effectiveness prediction, success metrics, and monitoring plan.',
    parameters: {
      churn_input: { type: 'string', required: true, description: 'JSON churn input: customer_id, customer_name, behavioral_features[{feature, current_value, baseline_value, trend, weight}], contract_end_date, arr, industry, tenure_months, support_tickets_trend, nps_history[], competitor_mentions, executive_changes, payment_delays' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { churn_input: string }) {
      const input: ChurnInput = JSON.parse(args.churn_input)
      const result = predictChurn(input)
      return formatChurnReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'csm_workload_balancer',
    description: 'CSM workload balancing with customer distribution optimization, skill matching, priority assignment, rotation planning, cost modeling, and efficiency metrics.',
    parameters: {
      workload_input: { type: 'string', required: true, description: 'JSON workload input: customers[{customer_id, customer_name, tier, arr, health_score, complexity, required_skills[], current_csm, hours_per_month}], csm_team[{csm_id, name, skills[], current_customers, total_hours, capacity_hours, utilization_rate, avg_health_score, retention_rate, nps_avg}], max_hours_per_csm, target_utilization, skill_requirements[{skill, demand, supply}], rotation_preferences[{csm_id, avoid_industries[], preferred_tiers[]}]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { workload_input: string }) {
      const input: WorkloadInput = JSON.parse(args.workload_input)
      const result = balanceWorkload(input)
      return formatWorkloadReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'success_plan_generator',
    description: 'Success plan generator with goal tracking, milestone management, risk register, action planning, metrics dashboard, automation triggers, collaboration mapping, and version control.',
    parameters: {
      plan_input: { type: 'string', required: true, description: 'JSON success plan input: customer_id, customer_name, plan_name, goals[{goal, category, target_date, kpi, target_value, current_value, status}], milestones[{name, goal, due_date, status, owner}], risks[{risk, probability, impact, mitigation}], actions[{action, owner, due_date, priority, status}], metrics[{metric, baseline, target, current, unit}], automation_triggers[{trigger, action, frequency, enabled}], collaborators[{name, role, responsibilities, access_level}], version_notes' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { plan_input: string }) {
      const input: SuccessPlanInput = JSON.parse(args.plan_input)
      const result = generateSuccessPlan(input)
      return formatSuccessPlanReport(result)
    }
  }))

  console.log(`[dsh-tool-customersuccess] Loaded v${VERSION} - Customer Success Management with 8 tools`)
  console.log('  Tools: health_scorecard, onboarding_guide, renewal_manager, advocacy_program, cross_sell_expansion, churn_prediction, csm_workload_balancer, success_plan_generator')
}

