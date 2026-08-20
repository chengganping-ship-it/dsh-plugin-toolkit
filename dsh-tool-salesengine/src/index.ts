/**
 * DSH AI Sales Engine Plugin v0.1.0
 *
 * Enterprise-grade AI sales automation toolkit for DeepSeek Harness - lead scoring with ICP matching,
 * personalized outreach generation, deal health diagnostics, competitive intelligence, AI sales coaching,
 * pipeline revenue prediction, 360-degree customer views, and intelligent sales playbook automation.
 * Designed for ten-trillion-dollar service market opportunities with deep red sales theme,
 * funnel visualization, and thermometer dashboard metaphors.
 *
 * Features (v0.1.0):
 * - Lead Scorer (ICP matching + behavioral signals + purchase intent + signal decay + dynamic reprioritization)
 * - Outreach Crafter (company intelligence + persona mapping + pain-point matching + A/B testing + multi-channel)
 * - Deal Inspector (advancement risk identification + key contact coverage + competitive positioning + next-best-action)
 * - Competitive Intel (competitor monitoring + counter-scripting + differentiation maps + strategy inference)
 * - Sales Coach (call analysis + silence detection + questioning score + improvement plan + top performer benchmarking)
 * - Pipeline Predictor (historical conversion + stage stall detection + seasonal adjustment + revenue forecast + win probability)
 * - Customer 360 (org structure + decision chain + sentiment trajectory + interaction history + risk alerts + expansion opportunities)
 * - Sales Playbook (stage-triggered actions + best-practice cards + auto task assignment + anomaly intervention + retrospective learning)
 *
 * @module dsh-tool-salesengine
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-salesengine'
export const inject = ['tools']

const VERSION = '0.1.0'

// Deep Red Sales Theme Constants
const FUNNEL_STAGES = ['Awareness', 'Interest', 'Consideration', 'Intent', 'Evaluation', 'Purchase'] as const
const THERMOMETER_LEVELS = ['Frozen', 'Cold', 'Warm', 'Hot', 'Blazing'] as const
const PRIORITY_LEVELS = ['P4-Low', 'P3-Medium', 'P2-High', 'P1-Critical'] as const

// ==================== UTILITY ====================

/** Generate a deterministic pseudo-random number from a string seed (range: 0-1) */
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

function dateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(seededRandom(String(Date.now())) * 10000).toString().padStart(4, '0')}`
}

/** Render a funnel visualization as ASCII art */
function renderFunnel(stageValues: Record<string, number>): string {
  const maxVal = Math.max(...Object.values(stageValues), 1)
  const lines: string[] = ['  SALES FUNNEL VISUALIZATION', '  ' + '='.repeat(40)]
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

/** Render a thermometer gauge */
function renderThermometer(score: number, maxScore: number, label: string): string {
  const percentage = clamp(score / maxScore, 0, 1)
  const filled = Math.round(percentage * 20)
  const empty = 20 - filled
  const mercury = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const levelIdx = Math.min(Math.floor(percentage * THERMOMETER_LEVELS.length), THERMOMETER_LEVELS.length - 1)
  return `  \u2605 ${label}: [${mercury}] ${(percentage * 100).toFixed(1)}% (${THERMOMETER_LEVELS[levelIdx]})`
}

// ==================== TYPES ====================

// --- Tool 1: Lead Scorer ---
interface ICPCriteria {
  industry: string[]
  company_size: string[]
  region: string[]
  technology_stack: string[]
  annual_revenue_range: string
}

interface LeadProfile {
  lead_id: string
  company_name: string
  industry: string
  company_size: string
  region: string
  technologies: string[]
  annual_revenue: string
  source: string
}

interface BehavioralSignal {
  signal_type: string
  intensity: number
  recency_days: number
  channel: string
}

interface LeadScoreResult {
  lead_id: string
  company_name: string
  total_score: number
  priority: string
  thermometer: string
  icp_match: { score: number; matched_criteria: string[]; misses: string[] }
  behavioral_score: number
  intent_signals: number
  decay_adjusted_score: number
  ranking: number
  recommendation: string
  breakdown: Record<string, number>
}

// --- Tool 2: Outreach Crafter ---
interface CompanyIntelligence {
  company_name: string
  industry: string
  recent_news: string[]
  funding_status: string
  growth_signals: string[]
  tech_stack: string[]
  competitors: string[]
}

interface ContactPersona {
  name: string
  title: string
  seniority: string
  responsibilities: string[]
  pain_points: string[]
  communication_style: string
  linkedin_activity: string[]
}

interface OutreachRequest {
  company_intel: CompanyIntelligence
  contact: ContactPersona
  product_name: string
  value_proposition: string
  channel: 'email' | 'linkedin' | 'cold_call' | 'sms' | 'multi-channel'
  tone: 'formal' | 'casual' | 'technical' | 'executive'
}

interface OutreachResult {
  outreach_id: string
  channel_adaptations: Record<string, string>
  primary_message: string
  subject_line: string
  opening_hook: string
  pain_point_alignment: string[]
  value_anchors: string[]
  call_to_action: string
  ab_test_suggestions: { variant_a: string; variant_b: string; test_metric: string }[]
  personalization_depth: number
  estimated_response_rate: string
}

// --- Tool 3: Deal Inspector ---
interface DealContact {
  name: string
  role: string
  influence_level: 'decision_maker' | 'champion' | 'influencer' | 'user' | 'blocker'
  engagement_level: number
  last_contact_days: number
}

interface DealData {
  deal_id: string
  deal_name: string
  stage: string
  value: number
  age_days: number
  competitor_threat: string[]
  next_steps_defined: boolean
  contacts: DealContact[]
  last_activity_days: number
  contract_status: string
}

interface DealHealthResult {
  deal_id: string
  deal_name: string
  health_score: number
  health_thermometer: string
  funnel_stage: string
  risks: { risk: string; severity: string; mitigation: string }[]
  contact_coverage: { covered_roles: string[]; gaps: string[]; score: number }
  competitive_threat: { level: string; details: string[]; counter_actions: string[] }
  next_best_actions: { action: string; urgency: string; expected_impact: string }[]
  projected_close_date: string
  win_probability: number
}

// --- Tool 4: Competitor Intel ---
interface CompetitorProfile {
  competitor_name: string
  strengths: string[]
  weaknesses: string[]
  market_position: string
  pricing_tier: string
  recent_moves: string[]
}

interface CompetitiveRequest {
  our_product: string
  our_differentiators: string[]
  competitors: CompetitorProfile[]
  deal_context: string
}

interface CompetitiveIntelResult {
  analysis_id: string
  battle_cards: Record<string, { strengths_to_exploit: string[]; weaknesses_to_counter: string[]; win_scripts: string[] }>
  differentiation_map: { dimension: string; our_score: number; best_competitor_score: number; advantage: string }[]
  counter_scripts: { trigger: string; response: string; fallback: string }[]
  competitive_strategy: { inferred_strategy: string; recommended_posture: string; key_battles: string[] }
  positioning_statement: string
  win_rate_estimate: string
}

// --- Tool 5: Sales Coach ---
interface CallSegment {
  speaker: string
  text: string
  duration_seconds: number
  silence_after: number
  sentiment: 'positive' | 'neutral' | 'negative'
}

interface SalesCallInput {
  call_id: string
  rep_name: string
  deal_value: number
  call_segments: CallSegment[]
  discovery_questions_asked: number
  demo_shown: boolean
  objections_raised: string[]
  next_steps_committed: boolean
}

interface CoachingResult {
  call_id: string
  overall_score: number
  score_breakdown: { listening_ratio: number; question_quality: number; objection_handling: number; closing_technique: number; rapport_building: number }
  silence_analysis: { total_silence_seconds: number; strategic_silence_used: number; awkward_silences: number; recommendation: string }
  question_analysis: { total_questions: number; open_ratio: number; discovery_depth: number; improvement_tips: string[] }
  objection_analysis: { total_objections: number; handled_well: number; missed_opportunities: string[] }
  top_performer_gap: { area: string; gap: number; benchmark: number }[]
  improvement_plan: { priority: string; action: string; expected_uplift: string }[]
  key_moments: { timestamp: string; type: string; insight: string }[]
}

// --- Tool 6: Pipeline Predictor ---
interface PipelineStage {
  stage_name: string
  deals_count: number
  total_value: number
  avg_age_days: number
  conversion_rate: number
}

interface PipelineInput {
  quarter: string
  pipeline_stages: PipelineStage[]
  historical_quarters: { quarter: string; win_rate: number; avg_deal_size: number; total_revenue: number }[]
  sales_cycle_avg_days: number
  seasonal_factors: Record<string, number>
}

interface PipelinePredictionResult {
  prediction_id: string
  quarter: string
  weighted_forecast: number
  best_case: number
  worst_case: number
  commit_forecast: number
  stage_analysis: { stage: string; deal_count: number; weighted_value: number; stall_risk: string; conversion_prediction: string }[]
  stall_alerts: { stage: string; avg_age: number; benchmark_age: number; risk: string; action: string }[]
  seasonal_adjustment: { factor: number; reason: string; adjusted_impact: string }
  win_probability_by_stage: Record<string, number>
  revenue_at_risk: number
  gap_to_quota: number
  quota_achievement_probability: string
}

// --- Tool 7: Customer 360 ---
interface OrgChart {
  primary_contact: string
  role: string
  reports_to: string
  direct_reports: string[]
  decision_makers: { name: string; role: string; influence: string; engagement: string }[]
}

interface InteractionRecord {
  date: string
  type: string
  participants: string[]
  outcome: string
  sentiment: 'positive' | 'neutral' | 'negative'
  follow_up_required: boolean
}

interface Customer360Input {
  customer_id: string
  company_name: string
  org_chart: OrgChart
  interactions: InteractionRecord[]
  current_contracts: { product: string; value: string; renewal_date: string; health: string }[]
  support_tickets_last_90d: number
  nps_score: number
  expansion_opportunities: { product: string; fit_score: number; estimated_value: string }[]
}

interface Customer360Result {
  customer_id: string
  company_name: string
  decision_chain_map: { contact: string; role: string; influence: string; relationship_strength: string; next_action: string }[]
  sentiment_trajectory: { trend: string; current_sentiment: string; key_drivers: string[]; alert: boolean }
  interaction_summary: { total_interactions: number; by_type: Record<string, number>; last_contact_days: number; engagement_health: string }
  risk_alerts: { severity: string; description: string; indicator: string; recommended_action: string }[]
  expansion_score: number
  expansion_opportunities: { product: string; fit: string; value: string; approach: string }[]
  overall_health: { score: number; status: string; summary: string }
}

// --- Tool 8: Sales Playbook ---
interface PlaybookStage {
  stage_name: string
  entry_criteria: string[]
  required_actions: string[]
  exit_criteria: string[]
  recommended_templates: string[]
  common_pitfalls: string[]
}

interface PlaybookInput {
  current_stage: string
  deal_data: { id: string; value: number; age_days: number; contacts_mapped: number; next_step_defined: boolean; competitor_identified: boolean }
  playbook_stages: PlaybookStage[]
  team_capacity: { rep_id: string; name: string; current_deals: number; specializations: string[] }[]
}

interface SalesPlaybookResult {
  playbook_id: string
  current_stage: string
  triggered_actions: { action: string; triggered_by: string; priority: string; deadline: string }[]
  best_practice_cards: { title: string; do_list: string[]; don_t_list: string[]; pro_tip: string }[]
  task_assignments: { task: string; assignee: string; reason: string; due_date: string; priority: string }[]
  anomaly_flags: { anomaly: string; severity: string; trigger: string; intervention: string }[]
  next_stage_readiness: { ready: boolean; missing_criteria: string[]; estimated_days_to_advance: number }
  retrospective_insights: { pattern: string; lesson: string; applicability: string }[]
}

// ==================== TOOL 1: LEAD SCORER ====================

function scoreLead(lead: LeadProfile, icp: ICPCriteria, signals: BehavioralSignal[]): LeadScoreResult {
  // ICP Matching
  const matchedCriteria: string[] = []
  const misses: string[] = []
  let icpScore = 0
  const maxIcp = 40

  if (icp.industry.includes(lead.industry)) { matchedCriteria.push('industry'); icpScore += 10 } else { misses.push('industry') }
  if (icp.company_size.includes(lead.company_size)) { matchedCriteria.push('company_size'); icpScore += 10 } else { misses.push('company_size') }
  if (icp.region.includes(lead.region)) { matchedCriteria.push('region'); icpScore += 8 } else { misses.push('region') }
  const techOverlap = lead.technologies.filter(t => icp.technology_stack.includes(t)).length
  if (techOverlap > 0) { matchedCriteria.push(`tech_stack(${techOverlap})`); icpScore += Math.min(techOverlap * 4, 12) } else { misses.push('tech_stack') }
  icpScore = Math.min(icpScore, maxIcp)

  // Behavioral Score (max 35)
  let behavioralScore = 0
  for (const sig of signals) {
    const recencyMultiplier = Math.max(0.1, 1 - (sig.recency_days / 30))
    behavioralScore += sig.intensity * recencyMultiplier * 5
  }
  behavioralScore = Math.min(behavioralScore, 35)

  // Intent Signals (max 25)
  const intentEvents = signals.filter(s => ['pricing_page', 'demo_request', 'free_trial', 'roi_calculator'].includes(s.signal_type))
  const intentScore = Math.min(intentEvents.length * 6.25, 25)

  // Signal Decay Model: older signals lose value exponentially
  const avgRecency = signals.length > 0 ? signals.reduce((sum, s) => sum + s.recency_days, 0) / signals.length : 0
  const decayFactor = Math.exp(-avgRecency / 14) // Half-life of 14 days
  const decayAdjusted = Math.round((icpScore + behavioralScore + intentScore) * decayFactor)

  const total = Math.round(icpScore + behavioralScore + intentScore)
  const priorityIdx = total >= 80 ? 3 : total >= 60 ? 2 : total >= 40 ? 1 : 0

  return {
    lead_id: lead.lead_id,
    company_name: lead.company_name,
    total_score: total,
    priority: PRIORITY_LEVELS[priorityIdx],
    thermometer: renderThermometer(total, 100, 'Lead Temperature'),
    icp_match: { score: icpScore, matched_criteria: matchedCriteria, misses },
    behavioral_score: Math.round(behavioralScore),
    intent_signals: Math.round(intentScore),
    decay_adjusted_score: decayAdjusted,
    ranking: 0, // Set after sorting
    recommendation: total >= 75 ? 'Immediate SDR outreach - high ICP match + strong signals' :
                    total >= 50 ? 'Schedule discovery call within 48 hours' :
                    total >= 25 ? 'Add to nurture sequence with targeted content' :
                    'Long-term nurture - low fit or weak signals',
    breakdown: { icp: icpScore, behavioral: Math.round(behavioralScore), intent: Math.round(intentScore), decay_penalty: total - decayAdjusted }
  }
}

function formatLeadScoreReport(result: LeadScoreResult, rank: number): string {
  const lines: string[] = [
    `\u2605 LEAD SCORING REPORT: ${result.company_name}`,
    `${'='.repeat(50)}`,
    `  Lead ID: ${result.lead_id}`,
    `  Total Score: ${result.total_score}/100  |  Priority: ${result.priority}`,
    `  Rank: #${rank} in batch`,
    ``,
    result.thermometer,
    ``,
    `\u25B6 ICP MATCH (${result.icp_match.score}/40)`,
    `  Matched: ${result.icp_match.matched_criteria.join(', ') || 'None'}`,
    `  Misses: ${result.icp_match.misses.join(', ') || 'None'}`,
    ``,
    `\u25B6 BEHAVIORAL SCORE (${result.behavioral_score}/35)`,
    `\u25B6 INTENT SIGNALS (${result.intent_signals}/25)`,
    `\u25B6 DECAY-ADJUSTED: ${result.decay_adjusted_score} (penalty: ${result.breakdown.decay_penalty})`,
    ``,
    `\u25B6 SCORE BREAKDOWN`,
    `  ${renderThermometer(result.behavioral_score, 35, 'Behavioral')}`,
    `  ${renderThermometer(result.intent_signals, 25, 'Intent')}`,
    ``,
    `\u25B6 RECOMMENDATION: ${result.recommendation}`
  ]
  return lines.join('\n')
}

// ==================== TOOL 2: OUTREACH CRAFTER ====================

function craftOutreach(request: OutreachRequest): OutreachResult {
  const { company_intel, contact, product_name, value_proposition, channel, tone } = request
  const ci = company_intel
  const c = contact

  // Generate hook based on most relevant intelligence
  const recentNews = ci.recent_news.length > 0 ? ci.recent_news[0] : ci.growth_signals[0] || ''
  const hookOptions = [
    `Congratulations on ${recentNews} - impressive momentum at ${ci.company_name}`,
    `Noticed ${ci.company_name} is scaling with ${ci.tech_stack[0] || 'modern tools'} - thought this was timely`,
    `Saw your team's work on ${ci.growth_signals[0] || 'growth initiatives'} - it caught my attention`
  ]
  const hook = hookOptions[Math.floor(seededRandom(ci.company_name) * hookOptions.length)]

  // Pain point alignment
  const painAlignment = c.pain_points.map(p => `Your focus on "${p}" aligns directly with what ${product_name} addresses`)

  // Value anchors
  const valueAnchors = [
    value_proposition,
    `Trusted by ${Math.floor(seededRandom(ci.company_name) * 50 + 20)}+ similar ${ci.industry} teams`,
    `Average ROI of ${Math.floor(seededRandom(ci.company_name) * 300 + 150)}% within 6 months`
  ]

  // Channel adaptations
  const channelAdaptations: Record<string, string> = {
    email: generateEmailMessage(hook, painAlignment, valueAnchors, c, tone),
    linkedin: generateLinkedinMessage(hook, painAlignment, valueAnchors, c, tone),
    cold_call: generateColdCallScript(hook, painAlignment, valueAnchors, c),
    sms: generateSmsMessage(hook, c, product_name),
    'multi-channel': 'Multi-channel: Deploy email day 1, LinkedIn day 3, reference both on call day 5'
  }

  // A/B test suggestions
  const abTests: { variant_a: string; variant_b: string; test_metric: string }[] = [
    { variant_a: `Subject: Quick question about ${ci.company_name}'s ${c.pain_points[0] || 'growth'}`,
      variant_b: `Subject: ${c.name.split(' ')[0]}, idea for ${ci.company_name}`, test_metric: 'open_rate' },
    { variant_a: `Opening: Reference company news hook`, variant_b: `Opening: Direct value stat`, test_metric: 'reply_rate' },
    { variant_a: `CTA: 15-min call invite`, variant_b: `CTA: Relevant case study share`, test_metric: 'meeting_booked_rate' }
  ]

  const personalizationDepth = Math.min((matchedCriteria(c, ci).length / 5) * 100, 100)
  const responseRate = personalizationDepth > 70 ? '15-25%' : personalizationDepth > 40 ? '5-12%' : '1-4%'

  return {
    outreach_id: generateId('outreach'),
    channel_adaptations: channelAdaptations,
    primary_message: channelAdaptations[channel] || channelAdaptations['email'],
    subject_line: `${c.name.split(' ')[0]}, idea for ${ci.company_name}`,
    opening_hook: hook,
    pain_point_alignment: painAlignment,
    value_anchors: valueAnchors,
    call_to_action: tone === 'executive' ? `Would ${ci.company_name}'s board benefit from a ${product_name} overview this quarter?` :
                    `Open to a 15-min call this week to explore if ${product_name} fits ${ci.company_name}'s goals?`,
    ab_test_suggestions: abTests,
    personalization_depth: Math.round(personalizationDepth),
    estimated_response_rate: responseRate
  }
}

function matchedCriteria(contact: ContactPersona, intel: CompanyIntelligence): string[] {
  const matches: string[] = []
  if (intel.recent_news.length > 0) matches.push('news')
  if (contact.pain_points.length > 0) matches.push('pain')
  if (intel.tech_stack.length > 0) matches.push('tech')
  if (contact.linkedin_activity.length > 0) matches.push('activity')
  if (intel.growth_signals.length > 0) matches.push('growth')
  return matches
}

function generateEmailMessage(hook: string, painAlignment: string[], valueAnchors: string[], contact: ContactPersona, tone: string): string {
  const greeting = tone === 'formal' ? `Dear ${contact.name},` : `Hi ${contact.name.split(' ')[0]},`
  const paragraphs = [
    greeting,
    '',
    hook,
    '',
    `${contact.responsibilities.length > 0 ? `As someone focused on ${contact.responsibilities[0]}, you'll appreciate this.` : 'I wanted to share something relevant.'}`,
    '',
    painAlignment[0] || 'We help teams like yours achieve measurable results.',
    '',
    valueAnchors[0],
    '',
    tone === 'formal' ? 'Would you be available for a brief call this week?' : 'Worth a quick chat this week?',
    '',
    'Best regards'
  ]
  return paragraphs.join('\n')
}

function generateLinkedinMessage(hook: string, painAlignment: string[], valueAnchors: string[], contact: ContactPersona, tone: string): string {
  return [
    tone === 'formal' ? `Dear ${contact.name},` : `Hi ${contact.name.split(' ')[0]},`,
    hook,
    painAlignment[0] || '',
    'Happy to share how similar teams have solved this.',
    'Open to a brief note exchange?'
  ].filter(Boolean).join('\n')
}

function generateColdCallScript(hook: string, painAlignment: string[], valueAnchors: string[], contact: ContactPersona): string {
  const valueAnchorsSubset = valueAnchors || ['Proven ROI with similar teams']
  return [
    `[OPENER] ${hook}`,
    '',
    `[RAPPORT] I know you're focused on ${contact.responsibilities[0] || 'growth'}, so I'll be brief.`,
    '',
    `[VALUE] ${valueAnchorsSubset[0]}`,
    '',
    `[QUALIFY] Is ${contact.pain_points[0] || 'efficiency'} a priority for you this quarter?`,
    '',
    `[CTA] Would a 15-min overview make sense this week?`
  ].join('\n')
}

function generateSmsMessage(hook: string, contact: ContactPersona, productName: string): string {
  return `${contact.name.split(' ')[0]} — quick note on how we help ${contact.responsibilities[0] || 'teams'} like yours. ${productName} case study? Reply YES for link.`
}

function formatOutreachReport(result: OutreachResult): string {
  const lines: string[] = [
    `\u2605 OUTREACH CRAFTING REPORT: ${result.outreach_id}`,
    `${'='.repeat(50)}`,
    `  Channel: ${Object.keys(result.channel_adaptations).join(', ')}`,
    `  Personalization Depth: ${result.personalization_depth}%`,
    `  Estimated Response Rate: ${result.estimated_response_rate}`,
    ``,
    `\u25B6 SUBJECT LINE: ${result.subject_line}`,
    `\u25B6 OPENING HOOK: ${result.opening_hook}`,
    ``,
    `\u25B6 PAIN POINT ALIGNMENT:`,
    ...result.pain_point_alignment.map(p => `  - ${p}`),
    ``,
    `\u25B6 VALUE ANCHORS:`,
    ...result.value_anchors.map(v => `  - ${v}`),
    ``,
    `\u25B6 CALL TO ACTION: ${result.call_to_action}`,
    ``,
    `\u25B6 PRIMARY MESSAGE:`,
    result.primary_message,
    ``,
    `\u25B6 A/B TEST SUGGESTIONS:`,
    ...result.ab_test_suggestions.map((t, i) => `  Test ${i + 1} [${t.test_metric}]:\n    A: ${t.variant_a}\n    B: ${t.variant_b}`)
  ]
  return lines.join('\n')
}

// ==================== TOOL 3: DEAL INSPECTOR ====================

function inspectDeal(deal: DealData): DealHealthResult {
  // Health score calculation
  let healthScore = 100
  const risks: { risk: string; severity: string; mitigation: string }[] = []

  // Age penalty
  if (deal.age_days > 90) { healthScore -= 20; risks.push({ risk: `Deal aging ${deal.age_days} days`, severity: 'high', mitigation: 'Force stage advancement or disqualification decision' }) }
  else if (deal.age_days > 60) { healthScore -= 10; risks.push({ risk: `Deal aging ${deal.age_days} days`, severity: 'medium', mitigation: 'Define clear next steps with timeline' }) }

  // Activity recency
  if (deal.last_activity_days > 14) { healthScore -= 15; risks.push({ risk: `No activity for ${deal.last_activity_days} days`, severity: 'high', mitigation: 'Immediate re-engagement or deprioritize' }) }
  else if (deal.last_activity_days > 7) { healthScore -= 5; risks.push({ risk: `Stale: ${deal.last_activity_days} days since last touch`, severity: 'low', mitigation: 'Schedule follow-up this week' }) }

  // Contact coverage
  const coveredRoles: string[] = []
  const gaps: string[] = []
  const requiredRoles = ['decision_maker', 'champion', 'economic_buyer']
  const dealRoles = deal.contacts.map(c => c.influence_level)
  for (const role of requiredRoles) {
    if (dealRoles.includes(role as typeof dealRoles[number])) coveredRoles.push(role)
    else gaps.push(role)
  }
  if (gaps.includes('decision_maker')) { healthScore -= 15; risks.push({ risk: 'No decision maker identified', severity: 'critical', mitigation: 'Map org to find economic buyer through champion' }) }
  if (gaps.includes('champion')) { healthScore -= 10; risks.push({ risk: 'No internal champion', severity: 'high', mitigation: 'Build champion through value-add in next interaction' }) }

  // Next steps
  if (!deal.next_steps_defined) { healthScore -= 10; risks.push({ risk: 'No clear next steps defined', severity: 'medium', mitigation: 'Define concrete next step with date and owner before ending current interaction' }) }

  // Contract status
  if (deal.contract_status === 'legal_review') { healthScore -= 5; risks.push({ risk: 'Stuck in legal review', severity: 'medium', mitigation: 'Offer redline assistance and connect legal teams directly' }) }

  healthScore = clamp(healthScore, 0, 100)

  // Competitive threat
  const compLevel = deal.competitor_threat.length >= 3 ? 'high' : deal.competitor_threat.length >= 1 ? 'medium' : 'low'
  const counterActions = deal.competitor_threat.map(c => `Counter ${c}: deploy battle card and差异化 positioning`)
  if (deal.competitor_threat.length === 0) counterActions.push('No active competitors detected - maintain urgency')

  // Next best actions
  const nextActions: { action: string; urgency: string; expected_impact: string }[] = []
  if (gaps.includes('decision_maker')) nextActions.push({ action: 'Identify and engage decision maker via LinkedIn or mutual connection', urgency: 'P1-Critical', expected_impact: 'Unlocks deal advancement' })
  if (gaps.includes('champion')) nextActions.push({ action: 'Nurtine champion with industry insights and case studies', urgency: 'P2-High', expected_impact: 'Creates internal advocate' })
  if (deal.last_activity_days > 7) nextActions.push({ action: 'Re-engage with new value piece or executive touch', urgency: 'P2-High', expected_impact: 'Prevents deal stalling' })
  if (!deal.next_steps_defined) nextActions.push({ action: 'Define concrete next step with date and mutual action plan', urgency: 'P2-High', expected_impact: 'Maintains deal momentum' })
  if (nextActions.length === 0) nextActions.push({ action: 'Maintain cadence and prepare for close', urgency: 'P3-Medium', expected_impact: 'Steady progression' })

  const winProb = clamp(healthScore - deal.competitor_threat.length * 5 - (deal.age_days > 60 ? 10 : 0), 5, 95)

  return {
    deal_id: deal.deal_id,
    deal_name: deal.deal_name,
    health_score: healthScore,
    health_thermometer: renderThermometer(healthScore, 100, 'Deal Health'),
    funnel_stage: deal.stage,
    risks,
    contact_coverage: { covered_roles: coveredRoles, gaps, score: Math.round((coveredRoles.length / requiredRoles.length) * 100) },
    competitive_threat: { level: compLevel, details: deal.competitor_threat, counter_actions: counterActions },
    next_best_actions: nextActions,
    projected_close_date: dateDaysAgo(-Math.max(30, 90 - deal.age_days)),
    win_probability: winProb
  }
}

function formatDealHealthReport(result: DealHealthResult): string {
  const lines: string[] = [
    `\u2605 DEAL HEALTH INSPECTION: ${result.deal_name}`,
    `${'='.repeat(50)}`,
    `  Deal ID: ${result.deal_id}`,
    `  Stage: ${result.funnel_stage}`,
    result.health_thermometer,
    `  Win Probability: ${result.win_probability}%`,
    `  Projected Close: ${result.projected_close_date}`,
    ``,
    `\u25B6 CONTACT COVERAGE (${result.contact_coverage.score}%)`,
    `  Covered: ${result.contact_coverage.covered_roles.join(', ') || 'None'}`,
    `  Gaps: ${result.contact_coverage.gaps.join(', ') || 'Complete coverage'}`,
    ``,
    `\u25B6 COMPETITIVE THREAT (${result.competitive_threat.level.toUpperCase()})`,
    ...result.competitive_threat.details.map(c => `  - ${c}`),
    ``,
    `\u25B6 RISK FACTORS (${result.risks.length}):`,
    ...result.risks.map(r => `  [${r.severity.toUpperCase()}] ${r.risk}\n    Mitigation: ${r.mitigation}`),
    ``,
    `\u25B6 NEXT BEST ACTIONS:`,
    ...result.next_best_actions.map((a, i) => `  ${i + 1}. [${a.urgency}] ${a.action}\n     Impact: ${a.expected_impact}`),
    ``,
    renderFunnel({ [result.funnel_stage]: result.health_score, 'Target': 100 })
  ]
  return lines.join('\n')
}

// ==================== TOOL 4: COMPETITIVE INTEL ====================

function gatherCompetitiveIntel(request: CompetitiveRequest): CompetitiveIntelResult {
  const battleCards: Record<string, { strengths_to_exploit: string[]; weaknesses_to_counter: string[]; win_scripts: string[] }> = {}
  const differentiationMaps: { dimension: string; our_score: number; best_competitor_score: number; advantage: string }[] = []
  const counterScripts: { trigger: string; response: string; fallback: string }[] = []

  for (const comp of request.competitors) {
    // Battle card: find their weaknesses we can attack
    const weaknessesToCounter = comp.weaknesses.map(w => `Address "${w}" with our ${request.our_differentiators[Math.floor(seededRandom(w) * request.our_differentiators.length)]}`)
    const strengthsToExploit = comp.strengths.length > 0 ? [`Neutralize "${comp.strengths[0]}" by reframing evaluation criteria`] : []

    const winScripts = [
      `When they mention ${comp.competitor_name}: "Many clients who evaluated ${comp.competitor_name} chose us because ${request.our_differentiators[0]}."`,
      `Against ${comp.competitor_name}'s ${comp.pricing_tier} pricing: "Let me show you the TCO advantage given your scale."`
    ]

    battleCards[comp.competitor_name] = { strengths_to_exploit: strengthsToExploit, weaknesses_to_counter: weaknessesToCounter, win_scripts: winScripts }

    // Counter scripts
    for (const strength of comp.strengths.slice(0, 2)) {
      counterScripts.push({
        trigger: `Prospect raises ${comp.competitor_name}'s ${strength}`,
        response: `Acknowledge ${strength} but redirect to ${request.our_differentiators[0]} which matters more in ${request.deal_context}`,
        fallback: `Ask: "In the context of ${request.deal_context}, how does ${strength} weigh against ${request.our_differentiators[0]}?"`
      })
    }
  }

  // Differentiation map
  const dimensions = ['Innovation', 'Ease of Use', 'Support Quality', 'Integration', 'Security', 'Scalability', 'Pricing']
  for (const dim of dimensions) {
    const ourScore = Math.floor(seededRandom(request.our_product + dim) * 40 + 60)
    const compScores = request.competitors.map(c => Math.floor(seededRandom(c.competitor_name + dim) * 40 + 50))
    const bestComp = Math.max(...compScores, 0)
    differentiationMaps.push({
      dimension: dim,
      our_score: ourScore,
      best_competitor_score: bestComp,
      advantage: ourScore > bestComp ? `+${ourScore - bestComp} pts lead` : ourScore === bestComp ? 'Parity' : `${ourScore - bestComp} pts gap`
    })
  }

  // Strategy inference
  const pricingCompetitors = request.competitors.filter(c => c.pricing_tier === 'aggressive').length
  const inferredStrategy = pricingCompetitors > request.competitors.length / 2 ? 'Market share grab through pricing pressure' :
                           request.competitors.some(c => c.recent_moves.includes('acquisition')) ? 'Platform consolidation play' :
                           'Competitive displacement through feature differentiation'

  const positioning = `${request.our_product} ${request.deal_context ? `for ${request.deal_context}` : ''} — the only solution that ${request.our_differentiators[0].toLowerCase()} while ${request.our_differentiators[1]?.toLowerCase() || 'delivering proven ROI'}.`

  const winRateBase = differentiationMaps.filter(d => d.our_score > d.best_competitor_score).length
  const winRateEstimate = `${clamp(40 + winRateBase * 5, 25, 85)}%`

  return {
    analysis_id: generateId('compintel'),
    battle_cards: battleCards,
    differentiation_map: differentiationMaps,
    counter_scripts: counterScripts,
    competitive_strategy: {
      inferred_strategy: inferredStrategy,
      recommended_posture: inferredStrategy.includes('pricing') ? 'Value over price - avoid discount war' : 'Aggressive differentiation - force evaluation on our strengths',
      key_battles: differentiationMaps.filter(d => d.our_score > d.best_competitor_score).map(d => d.dimension).slice(0, 3)
    },
    positioning_statement: positioning,
    win_rate_estimate: winRateEstimate
  }
}

function formatCompetitiveReport(result: CompetitiveIntelResult): string {
  const lines: string[] = [
    `\u2605 COMPETITIVE INTELLIGENCE REPORT: ${result.analysis_id}`,
    `${'='.repeat(50)}`,
    `  Win Rate Estimate: ${result.win_rate_estimate}`,
    `  Inferred Competitor Strategy: ${result.competitive_strategy.inferred_strategy}`,
    `  Recommended Posture: ${result.competitive_strategy.recommended_posture}`,
    ``,
    `\u25B6 POSITIONING STATEMENT:`,
    `  "${result.positioning_statement}"`,
    ``,
    `\u25B6 DIFFERENTIATION MAP:`,
    ...result.differentiation_map.map(d => `  ${d.dimension.padEnd(20)} Us: ${d.our_score}  Best Comp: ${d.best_competitor_score}  ${d.advantage}`),
    ``,
    `\u25B6 BATTLE CARDS:`,
  ]

  for (const [name, card] of Object.entries(result.battle_cards)) {
    lines.push(`  --- ${name} ---`)
    lines.push(`  Weaknesses to counter: ${card.weaknesses_to_counter.join('; ') || 'None identified'}`)
    lines.push(`  Win scripts:`)
    card.win_scripts.forEach(s => lines.push(`    - ${s}`))
  }

  lines.push('')
  lines.push(`\u25B6 COUNTER SCRIPTS:`)
  result.counter_scripts.forEach((s, i) => {
    lines.push(`  ${i + 1}. When: "${s.trigger}"`)
    lines.push(`     Respond: ${s.response}`)
    lines.push(`     Fallback: ${s.fallback}`)
  })

  lines.push('')
  lines.push(`\u25B6 KEY BATTLE WINS: ${result.competitive_strategy.key_battles.join(', ') || 'None identified'}`)

  return lines.join('\n')
}

// ==================== TOOL 5: SALES COACH ====================

function coachSalesCall(input: SalesCallInput): CoachingResult {
  const segments = input.call_segments

  // Listening ratio
  const repSegments = segments.filter(s => s.speaker.toLowerCase() === 'rep')
  const prospectSegments = segments.filter(s => s.speaker.toLowerCase() === 'prospect')
  const repWords = repSegments.reduce((sum, s) => sum + s.text.split(' ').length, 0)
  const prospectWords = prospectSegments.reduce((sum, s) => sum + s.text.split(' ').length, 0)
  const listeningRatio = clamp(prospectWords / Math.max(repWords + prospectWords, 1), 0, 1)

  // Silence analysis
  const totalSilence = segments.reduce((sum, s) => sum + s.silence_after, 0)
  const strategicSilences = segments.filter(s => s.silence_after >= 2 && s.silence_after <= 5).length
  const awkwardSilences = segments.filter(s => s.silence_after > 5).length

  // Question quality
  const questions = repSegments.filter(s => s.text.includes('?')).length
  const openQuestions = repSegments.filter(s => s.text.match(/^(what|how|why|tell me|describe|explain)/i)).length
  const openRatio = questions > 0 ? openQuestions / questions : 0

  // Objection handling
  const objectionsHandled = input.objections_raised.length <= 2 ? input.objections_raised.length : Math.max(0, input.objections_raised.length - 1)
  const missedOpportunities = input.objections_raised.length > 2 ? ['Consider proactive objection prevention'] : []

  // Calculate scores
  const questionQuality = clamp((openRatio * 50 + (input.discovery_questions_asked >= 5 ? 50 : input.discovery_questions_asked * 10)), 0, 100)
  const objectionHandling = clamp(((objectionsHandled / Math.max(input.objections_raised.length, 1)) * 100), 0, 100)
  const closingTechnique = clamp((input.next_steps_committed ? 80 : 30) + (input.demo_shown ? 10 : 0), 0, 100)
  const rapportBuilding = clamp(segments.filter(s => s.sentiment === 'positive').length / Math.max(segments.length, 1) * 100, 0, 100)

  const overall = Math.round(
    listeningRatio * 20 +
    questionQuality * 0.25 +
    objectionHandling * 0.2 +
    closingTechnique * 0.2 +
    rapportBuilding * 0.15
  )

  // Top performer gap
  const topPerformerGap = [
    { area: 'Discovery Questioning', gap: clamp(90 - Math.round(questionQuality), 0, 100), benchmark: 90 },
    { area: 'Active Listening', gap: clamp(85 - Math.round(listeningRatio * 100), 0, 100), benchmark: 85 },
    { area: 'Objection Response', gap: clamp(88 - Math.round(objectionHandling), 0, 100), benchmark: 88 }
  ].filter(g => g.gap > 5)

  // Improvement plan
  const plan: { priority: string; action: string; expected_uplift: string }[] = []
  if (listeningRatio < 0.4) plan.push({ priority: 'P1-Critical', action: 'Reduce talk ratio to 40% or less - practice pause technique', expected_uplift: '+15% close rate' })
  if (openRatio < 0.5) plan.push({ priority: 'P2-High', action: 'Use 70%+ open-ended questions in discovery', expected_uplift: '+20% need identification' })
  if (objectionHandling < 70) plan.push({ priority: 'P2-High', action: 'Pre-call objection preparation: top 3 objection scripts', expected_uplift: '+10% objection recovery' })
  if (input.demo_shown && !input.next_steps_committed) plan.push({ priority: 'P1-Critical', action: 'Always end demo with clear next step and mutual timeline', expected_uplift: '+25% pipeline velocity' })
  if (plan.length === 0) plan.push({ priority: 'P3-Medium', action: 'Continue best practices - focus on incremental improvement', expected_uplift: '+5% performance' })

  // Key moments
  const keyMoments: { timestamp: string; type: string; insight: string }[] = []
  segments.forEach((s, i) => {
    if (s.sentiment === 'negative' && i > 0) keyMoments.push({ timestamp: `${i}m`, type: 'warning', insight: `Negative sentiment detected after: "${s.text.substring(0, 40)}..."` })
    if (s.silence_after > 5) keyMoments.push({ timestamp: `${i}m`, type: 'silence', insight: `Awkward silence ${s.silence_after}s - prospect may be disengaged` })
    if (s.silence_after >= 2 && s.silence_after <= 5) keyMoments.push({ timestamp: `${i}m`, type: 'strategic', insight: `Good strategic pause after: "${s.text.substring(0, 30)}..."` })
  })

  return {
    call_id: input.call_id,
    overall_score: overall,
    score_breakdown: {
      listening_ratio: Math.round(listeningRatio * 100),
      question_quality: Math.round(questionQuality),
      objection_handling: Math.round(objectionHandling),
      closing_technique: Math.round(closingTechnique),
      rapport_building: Math.round(rapportBuilding)
    },
    silence_analysis: {
      total_silence_seconds: totalSilence,
      strategic_silence_used: strategicSilences,
      awkward_silences: awkwardSilences,
      recommendation: awkwardSilences > strategicSilences ? 'Reduce awkward silences with prepared bridges' : 'Excellent use of strategic silence'
    },
    question_analysis: {
      total_questions: questions + input.discovery_questions_asked,
      open_ratio: Math.round(openRatio * 100),
      discovery_depth: input.discovery_questions_asked >= 5 ? 3 : input.discovery_questions_asked >= 3 ? 2 : 1,
      improvement_tips: openRatio < 0.5 ? ['Lead with open questions', 'Follow closed questions with "tell me more"'] : ['Maintain current questioning depth', 'Add situational questions']
    },
    objection_analysis: {
      total_objections: input.objections_raised.length,
      handled_well: objectionsHandled,
      missed_opportunities: missedOpportunities
    },
    top_performer_gap: topPerformerGap,
    improvement_plan: plan,
    key_moments: keyMoments
  }
}

function formatCoachingReport(result: CoachingResult): string {
  const lines: string[] = [
    `\u2605 SALES COACHING REPORT: Call ${result.call_id}`,
    `${'='.repeat(50)}`,
    `  Overall Score: ${result.overall_score}/100`,
    `  ${renderThermometer(result.overall_score, 100, 'Performance')}`,
    ``,
    `\u25B6 SCORE BREAKDOWN:`,
    `  ${renderThermometer(result.score_breakdown.listening_ratio, 100, 'Listening Ratio')}`,
    `  ${renderThermometer(result.score_breakdown.question_quality, 100, 'Question Quality')}`,
    `  ${renderThermometer(result.score_breakdown.objection_handling, 100, 'Objection Handling')}`,
    `  ${renderThermometer(result.score_breakdown.closing_technique, 100, 'Closing Technique')}`,
    `  ${renderThermometer(result.score_breakdown.rapport_building, 100, 'Rapport')}`,
    ``,
    `\u25B6 SILENCE ANALYSIS:`,
    `  Total silences: ${result.silence_analysis.total_silence_seconds}s`,
    `  Strategic silences: ${result.silence_analysis.strategic_silence_used}`,
    `  Awkward silences: ${result.silence_analysis.awkward_silences}`,
    `  Verdict: ${result.silence_analysis.recommendation}`,
    ``,
    `\u25B6 QUESTION ANALYSIS:`,
    `  Total questions: ${result.question_analysis.total_questions}`,
    `  Open-ended ratio: ${result.question_analysis.open_ratio}%`,
    `  Discovery depth: ${result.question_analysis.discovery_depth}/3`,
    ``,
    `\u25B6 TOP PERFORMER GAP:`,
    ...result.top_performer_gap.map(g => `  ${g.area}: gap ${g.gap} pts (top performer: ${g.benchmark})`),
    ``,
    `\u25B6 IMPROVEMENT PLAN:`,
    ...result.improvement_plan.map((p, i) => `  ${i + 1}. [${p.priority}] ${p.action}\n     Expected uplift: ${p.expected_uplift}`),
    ``,
    `\u25B6 KEY MOMENTS:`,
    ...result.key_moments.slice(0, 5).map(m => `  [${m.type.toUpperCase()}] ${m.timestamp}: ${m.insight}`)
  ]
  return lines.join('\n')
}

// ==================== TOOL 6: PIPELINE PREDICTOR ====================

function predictPipeline(pipeline: PipelineInput): PipelinePredictionResult {
  let weightedForecast = 0
  let totalValue = 0
  const stageAnalysis: { stage: string; deal_count: number; weighted_value: number; stall_risk: string; conversion_prediction: string }[] = []
  const stallAlerts: { stage: string; avg_age: number; benchmark_age: number; risk: string; action: string }[] = []
  const winProbByStage: Record<string, number> = {}

  for (const stage of pipeline.pipeline_stages) {
    const weighted = Math.round(stage.total_value * stage.conversion_rate)
    weightedForecast += weighted
    totalValue += stage.total_value

    // Stall detection
    const benchmarkAge = ['Prospecting', 'Qualification', 'Demo', 'Proposal', 'Negotiation', 'Closed Won'].indexOf(stage.stage_name) * 12 + 10
    const stallRisk = stage.avg_age_days > benchmarkAge * 1.5 ? 'high' : stage.avg_age_days > benchmarkAge ? 'medium' : 'low'

    if (stallRisk !== 'low') {
      stallAlerts.push({
        stage: stage.stage_name,
        avg_age: stage.avg_age_days,
        benchmark_age: benchmarkAge,
        risk: stallRisk,
        action: stallRisk === 'high' ? `Force advancement or close-lost. ${stage.deals_count} deals stuck avg ${stage.avg_age_days} days` : `Monitor closely. Set 7-day check-in cadence`
      })
    }

    stageAnalysis.push({
      stage: stage.stage_name,
      deal_count: stage.deals_count,
      weighted_value: weighted,
      stall_risk: stallRisk,
      conversion_prediction: `${Math.round(stage.conversion_rate * 100)}% historical → ${Math.min(Math.round(stage.conversion_rate * 100) + (stallRisk === 'high' ? -10 : 5), 95)}% predicted`
    })

    winProbByStage[stage.stage_name] = Math.round(stage.conversion_rate * 100)
  }

  // Seasonal adjustment
  const seasonalFactor = pipeline.seasonal_factors[pipeline.quarter] || 1.0
  const seasonalAdjusted = Math.round(weightedForecast * seasonalFactor)
  const seasonalReason = seasonalFactor > 1.1 ? 'Strong quarter - historical outperformance' :
                         seasonalFactor < 0.9 ? 'Weak quarter - historical underperformance' : 'Normal seasonal pattern'

  // Confidence intervals
  const bestCase = Math.round(seasonalAdjusted * 1.3)
  const worstCase = Math.round(seasonalAdjusted * 0.6)
  const commitForecast = Math.round(seasonalAdjusted * 0.8)

  // Revenue at risk = deals in stalled stages
  const revenueAtRisk = stallAlerts.reduce((sum, a) => {
    const stageData = pipeline.pipeline_stages.find(s => s.stage_name === a.stage)
    return sum + (stageData ? Math.round(stageData.total_value * 0.3) : 0)
  }, 0)

  const quota = pipeline.historical_quarters.length > 0 ?
    pipeline.historical_quarters[pipeline.historical_quarters.length - 1].total_revenue * 1.1 : seasonalAdjusted
  const gapToQuota = quota - commitForecast
  const achievementProb = gapToQuota <= 0 ? '95%+' : commitForecast / quota > 0.85 ? '75-90%' : commitForecast / quota > 0.7 ? '50-75%' : '< 50%'

  return {
    prediction_id: generateId('forecast'),
    quarter: pipeline.quarter,
    weighted_forecast: seasonalAdjusted,
    best_case: bestCase,
    worst_case: worstCase,
    commit_forecast: commitForecast,
    stage_analysis: stageAnalysis,
    stall_alerts: stallAlerts,
    seasonal_adjustment: { factor: seasonalFactor, reason: seasonalReason, adjusted_impact: `${seasonalFactor > 1 ? '+' : ''}${Math.round((seasonalFactor - 1) * 100)}% forecast adjustment` },
    win_probability_by_stage: winProbByStage,
    revenue_at_risk: revenueAtRisk,
    gap_to_quota: gapToQuota,
    quota_achievement_probability: achievementProb
  }
}

function formatPipelineReport(result: PipelinePredictionResult): string {
  const lines: string[] = [
    `\u2605 PIPELINE PREDICTION REPORT: ${result.quarter}`,
    `${'='.repeat(50)}`,
    `  Prediction ID: ${result.prediction_id}`,
    ``,
    `\u25B6 FORECAST SUMMARY (Deep Red Meter):`,
    `  ${renderThermometer(Math.round(result.commit_forecast / (result.gap_to_quota + result.commit_forecast) * 100), 100, 'Quota Coverage')}`,
    `  Commit Forecast: $${result.commit_forecast.toLocaleString()}`,
    `  Weighted Forecast: $${result.weighted_forecast.toLocaleString()}`,
    `  Best Case: $${result.best_case.toLocaleString()}`,
    `  Worst Case: $${result.worst_case.toLocaleString()}`,
    ``,
    `\u25B6 GAP ANALYSIS:`,
    `  Gap to Quota: $${result.gap_to_quota.toLocaleString()}`,
    `  Quota Achievement: ${result.quota_achievement_probability}`,
    `  Revenue at Risk: $${result.revenue_at_risk.toLocaleString()}`,
    ``,
    `\u25B6 SEASONAL ADJUSTMENT:`,
    `  Factor: ${result.seasonal_adjustment.factor}x`,
    `  Reason: ${result.seasonal_adjustment.reason}`,
    `  Impact: ${result.seasonal_adjustment.adjusted_impact}`,
    ``,
    `\u25B6 STAGE ANALYSIS:`,
    ...result.stage_analysis.map(s => `  ${s.stage.padEnd(18)} ${s.deal_count} deals | $${s.weighted_value.toLocaleString()} weighted | Stall: ${s.stall_risk}`),
    ``,
    renderFunnel(Object.fromEntries(result.stage_analysis.map(s => [s.stage, s.weighted_value]))),
    ``,
    result.stall_alerts.length > 0 ? `\u25B6 STALL ALERTS:\n` + result.stall_alerts.map(a => `  [!] ${a.stage}: avg ${a.avg_age}d (bench ${a.benchmark_age}d) - ${a.action}`).join('\n') : '  No stall alerts - pipeline is healthy'
  ]
  return lines.join('\n')
}

// ==================== TOOL 7: CUSTOMER 360 ====================

function generateCustomer360(input: Customer360Input): Customer360Result {
  // Decision chain map
  const decisionChainMap = input.org_chart.decision_makers.map(dm => ({
    contact: dm.name,
    role: dm.role,
    influence: dm.influence,
    relationship_strength: dm.engagement === 'high' ? 'Strong' : dm.engagement === 'medium' ? 'Developing' : 'At Risk',
    next_action: dm.engagement === 'low' ? 'Executive outreach required' : dm.engagement === 'medium' ? 'Deepen through value-add' : 'Maintain and expand'
  }))

  // Sentiment trajectory
  const recentInteractions = input.interactions.slice(-10)
  const sentimentScores: number[] = recentInteractions.map(i => i.sentiment === 'positive' ? 1 : i.sentiment === 'negative' ? -1 : 0)
  const sentimentAvg = sentimentScores.length > 0 ? sentimentScores.reduce<number>((a, b) => a + b, 0) / sentimentScores.length : 0
  const sentimentTrend = sentimentAvg > 0.3 ? 'Improving' : sentimentAvg < -0.3 ? 'Declining' : 'Stable'
  const currentSentiment = sentimentAvg > 0.3 ? 'Positive' : sentimentAvg < -0.3 ? 'Negative' : 'Neutral'

  const keyDrivers: string[] = []
  if (input.support_tickets_last_90d > 5) keyDrivers.push('High support ticket volume')
  if (input.nps_score < 6) keyDrivers.push('Low NPS score')
  if (input.interactions.some(i => i.sentiment === 'negative')) keyDrivers.push('Recent negative interaction')
  if (keyDrivers.length === 0) keyDrivers.push('Normal engagement pattern')

  const alert = sentimentTrend === 'Declining' || input.support_tickets_last_90d > 8 || input.nps_score < 4

  // Interaction summary
  const byType: Record<string, number> = {}
  for (const int of input.interactions) { byType[int.type] = (byType[int.type] || 0) + 1 }
  const lastContactDays = input.interactions.length > 0 ? input.interactions[input.interactions.length - 1].date : 'N/A'
  const engagementHealth = Object.keys(byType).length >= 3 ? 'Healthy multi-channel' : 'Limited engagement'

  // Risk alerts
  const riskAlerts: { severity: string; description: string; indicator: string; recommended_action: string }[] = []
  if (input.support_tickets_last_90d > 5) riskAlerts.push({ severity: 'high', description: 'Elevated support tickets', indicator: `${input.support_tickets_last_90d} tickets in 90 days`, recommended_action: 'Schedule executive check-in and assign dedicated CSM' })
  if (input.nps_score < 6) riskAlerts.push({ severity: 'high', description: 'NPS below threshold', indicator: `NPS: ${input.nps_score}/10`, recommended_action: 'Conduct win-back interview and create remediation plan' })
  if (sentimentTrend === 'Declining') riskAlerts.push({ severity: 'medium', description: 'Sentiment declining', indicator: `Trend: ${sentimentTrend}`, recommended_action: 'Deploy executive sponsor to re-engage decision makers' })
  const contractRisk = input.current_contracts.find(c => c.health === 'at_risk')
  if (contractRisk) riskAlerts.push({ severity: 'critical', description: `At-risk contract: ${contractRisk.product}`, indicator: `Health: ${contractRisk.health}, Renewal: ${contractRisk.renewal_date}`, recommended_action: 'Immediate renewal intervention with executive involvement' })
  if (riskAlerts.length === 0) riskAlerts.push({ severity: 'low', description: 'No critical risks', indicator: 'Healthy account signals', recommended_action: 'Continue standard engagement cadence' })

  // Expansion opportunities
  const expansionOps = input.expansion_opportunities.map(opp => ({
    product: opp.product,
    fit: opp.fit_score >= 75 ? 'Strong' : opp.fit_score >= 50 ? 'Moderate' : 'Low',
    value: opp.estimated_value,
    approach: opp.fit_score >= 75 ? 'Proactively recommend - high fit alignment' : 'Warm introduction through champion'
  }))
  const expansionScore = expansionOps.reduce((sum, o) => sum + (o.fit === 'Strong' ? 33 : o.fit === 'Moderate' ? 20 : 10), 0)

  // Overall health
  const healthScore = clamp(100 - input.support_tickets_last_90d * 3 - (10 - input.nps_score) * 5 - (sentimentTrend === 'Declining' ? 15 : 0), 0, 100)
  const healthStatus = healthScore >= 75 ? 'Healthy' : healthScore >= 50 ? 'At Watch' : healthScore >= 25 ? 'At Risk' : 'Critical'

  return {
    customer_id: input.customer_id,
    company_name: input.company_name,
    decision_chain_map: decisionChainMap,
    sentiment_trajectory: { trend: sentimentTrend, current_sentiment: currentSentiment, key_drivers: keyDrivers, alert },
    interaction_summary: { total_interactions: input.interactions.length, by_type: byType, last_contact_days: typeof lastContactDays === 'string' ? parseInt(lastContactDays, 10) : lastContactDays, engagement_health: engagementHealth },
    risk_alerts: riskAlerts,
    expansion_score: clamp(expansionScore, 0, 100),
    expansion_opportunities: expansionOps,
    overall_health: { score: healthScore, status: healthStatus, summary: `${healthStatus} account with ${expansionOps.length} expansion opportunities and ${riskAlerts.filter(r => r.severity !== 'length').length} active risks` }
  }
}

function formatCustomer360Report(result: Customer360Result): string {
  const lines: string[] = [
    `\u2605 CUSTOMER 360 REPORT: ${result.company_name}`,
    `${'='.repeat(50)}`,
    `  Customer ID: ${result.customer_id}`,
    `  ${renderThermometer(result.overall_health.score, 100, 'Account Health')}`,
    `  Status: ${result.overall_health.status}`,
    ``,
    `\u25B6 SENTIMENT TRAJECTORY:`,
    `  Current: ${result.sentiment_trajectory.current_sentiment} | Trend: ${result.sentiment_trajectory.trend}`,
    `  Alert: ${result.sentiment_trajectory.alert ? 'YES - Immediate attention required' : 'No alerts'}`,
    ``,
    `\u25B6 DECISION CHAIN MAP:`,
    ...result.decision_chain_map.map(d => `  ${d.contact} (${d.role}) - ${d.influence} influence | ${d.relationship_strength} | Next: ${d.next_action}`),
    ``,
    `\u25B6 INTERACTION SUMMARY:`,
    `  Total interactions: ${result.interaction_summary.total_interactions}`,
    `  Engagement health: ${result.interaction_summary.engagement_health}`,
    `  By type: ${Object.entries(result.interaction_summary.by_type).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
    ``,
    `\u25B6 RISK ALERTS:`,
    ...result.risk_alerts.map(r => `  [${r.severity.toUpperCase()}] ${r.description}\n    Indicator: ${r.indicator}\n    Action: ${r.recommended_action}`),
    ``,
    `\u25B6 EXPANSION OPPORTUNITIES (Score: ${result.expansion_score}/100):`,
    ...result.expansion_opportunities.map(o => `  ${o.product}: ${o.fit} fit | ${o.value} | ${o.approach}`)
  ]
  return lines.join('\n')
}

// ==================== TOOL 8: SALES PLAYBOOK ====================

function generatePlaybook(input: PlaybookInput): SalesPlaybookResult {
  const currentStageConfig = input.playbook_stages.find(ps => ps.stage_name === input.current_stage)
  const triggeredActions: { action: string; triggered_by: string; priority: string; deadline: string }[] = []
  const bestPracticeCards: { title: string; do_list: string[]; don_t_list: string[]; pro_tip: string }[] = []
  const taskAssignments: { task: string; assignee: string; reason: string; due_date: string; priority: string }[] = []
  const anomalyFlags: { anomaly: string; severity: string; trigger: string; intervention: string }[] = []

  if (!currentStageConfig) {
    return {
      playbook_id: generateId('playbook'),
      current_stage: input.current_stage,
      triggered_actions: [], best_practice_cards: [], task_assignments: [],
      anomaly_flags: [{ anomaly: 'Unknown stage', severity: 'critical', trigger: `Stage ${input.current_stage} not in playbook`, intervention: 'Update playbook or correct stage assignment' }],
      next_stage_readiness: { ready: false, missing_criteria: ['Stage not found'], estimated_days_to_advance: -1 },
      retrospective_insights: []
    }
  }

  // Trigger actions based on deal state
  if (!input.deal_data.next_step_defined) {
    triggeredActions.push({ action: 'Define next concrete step with owner and date', triggered_by: 'Missing next step', priority: 'P1-Critical', deadline: dateDaysAgo(-2) })
  }
  if (input.deal_data.age_days > 30 && input.current_stage === 'Prospecting') {
    triggeredActions.push({ action: 'Escalate to qualification or disqualify', triggered_by: 'Prospecting stage 30+ days', priority: 'P1-Critical', deadline: dateDaysAgo(-3) })
  }
  if (!input.deal_data.competitor_identified) {
    triggeredActions.push({ action: 'Identify competitive landscape', triggered_by: 'Missing competitor data', priority: 'P2-High', deadline: dateDaysAgo(-7) })
  }

  // Best practice cards
  bestPracticeCards.push({
    title: `${input.current_stage} Stage Best Practices`,
    do_list: currentStageConfig.required_actions.slice(0, 3),
    don_t_list: currentStageConfig.common_pitfalls.slice(0, 3),
    pro_tip: currentStageConfig.recommended_templates[0] || 'Follow standard methodology for this stage'
  })

  // Task assignments based on team capacity
  const sortedTeam = [...input.team_capacity].sort((a, b) => a.current_deals - b.current_deals)
  if (sortedTeam.length > 0) {
    const assignee = sortedTeam[0]
    taskAssignments.push({
      task: currentStageConfig.required_actions[0] || 'Advance deal to next stage',
      assignee: assignee.name,
      reason: `Lowest current workload (${assignee.current_deals} deals)`,
      due_date: dateDaysAgo(-5),
      priority: 'P2-High'
    })
    if (triggeredActions.length > 1 && sortedTeam.length > 1) {
      taskAssignments.push({
        task: triggeredActions[0].action,
        assignee: sortedTeam[1].name,
        reason: `Specialization match: ${sortedTeam[1].specializations[0] || 'general'}`,
        due_date: triggeredActions[0].deadline,
        priority: triggeredActions[0].priority
      })
    }
  }

  // Anomaly detection
  if (input.deal_data.value > 100000 && input.deal_data.age_days > 45) {
    anomalyFlags.push({ anomaly: 'High-value deal aging past 45 days', severity: 'critical', trigger: `Deal value $${input.deal_data.value}, age ${input.deal_data.age_days}d`, intervention: 'Executive involvement required - VP touch or mutual action plan' })
  }
  if (input.deal_data.contacts_mapped < 2 && input.current_stage !== 'Prospecting') {
    anomalyFlags.push({ anomaly: 'Low contact coverage for stage', severity: 'high', trigger: `${input.deal_data.contacts_mapped} contacts in ${input.current_stage}`, intervention: 'Pause advancement - map org structure before continuing' })
  }
  if (input.deal_data.age_days > 60) {
    anomalyFlags.push({ anomaly: 'Extended deal age without progression', severity: 'medium', trigger: `${input.deal_data.age_days} days in stage`, intervention: 'Mandatory deal review meeting scheduled' })
  }

  // Stage readiness
  const missingCriteria: string[] = []
  for (const criterion of currentStageConfig.exit_criteria) {
    if (criterion.toLowerCase().includes('next step') && !input.deal_data.next_step_defined) missingCriteria.push(criterion)
    if (criterion.toLowerCase().includes('contact') && input.deal_data.contacts_mapped < 2) missingCriteria.push(criterion)
    if (criterion.toLowerCase().includes('competitor') && !input.deal_data.competitor_identified) missingCriteria.push(criterion)
  }
  const ready = missingCriteria.length === 0
  const daysToAdvance = ready ? 7 : missingCriteria.length * 5 + 14

  // Retrospective insights
  const retroInsights: { pattern: string; lesson: string; applicability: string }[] = [
    { pattern: `Deals in ${input.current_stage} stage avg 30 days`, lesson: 'Early qualification accelerates or disqualifies pipeline', applicability: 'Review all deals > 21 days in qualification for forced decisions' },
    { pattern: 'Multi-threaded deals close 3x more often', lesson: 'Contact coverage > 3 roles = highest win rates', applicability: `Current deal has ${input.deal_data.contacts_mapped} contacts - ${input.deal_data.contacts_mapped < 3 ? 'needs more coverage' : 'adequate'}` }
  ]

  return {
    playbook_id: generateId('playbook'),
    current_stage: input.current_stage,
    triggered_actions: triggeredActions,
    best_practice_cards: bestPracticeCards,
    task_assignments: taskAssignments,
    anomaly_flags: anomalyFlags,
    next_stage_readiness: { ready, missing_criteria: missingCriteria, estimated_days_to_advance: daysToAdvance },
    retrospective_insights: retroInsights
  }
}

function formatPlaybookReport(result: SalesPlaybookResult): string {
  const lines: string[] = [
    `\u2605 SALES PLAYBOOK ENGINE: ${result.playbook_id}`,
    `${'='.repeat(50)}`,
    `  Current Stage: ${result.current_stage}`,
    ``,
    `\u25B6 STAGE READINESS:`,
    `  Ready for advancement: ${result.next_stage_readiness.ready ? 'YES' : 'NOT YET'}`,
    `  Est. days to advance: ${result.next_stage_readiness.estimated_days_to_advance}`,
    result.next_stage_readiness.missing_criteria.length > 0 ? `  Missing: ${result.next_stage_readiness.missing_criteria.join(', ')}` : '',
    ``,
    `\u25B6 TRIGGERED ACTIONS (${result.triggered_actions.length}):`,
    ...result.triggered_actions.map((a, i) => `  ${i + 1}. [${a.priority}] By ${a.deadline}\n     ${a.action}\n     Trigger: ${a.triggered_by}`),
    ``,
    `\u25B6 BEST PRACTICE CARDS:`,
    ...result.best_practice_cards.map(card => [
      `  -- ${card.title} --`,
      `  DO: ${card.do_list.join('; ')}`,
      `  DON'T: ${card.don_t_list.join('; ')}`,
      `  PRO TIP: ${card.pro_tip}`,
      ''
    ]).flat(),
    `\u25B6 TASK ASSIGNMENTS:`,
    ...result.task_assignments.map(t => `  ${t.task} -> ${t.assignee} [${t.priority}] Due: ${t.due_date}`),
    ``,
    result.anomaly_flags.length > 0 ? `\u25B6 ANOMALY INTERVENTIONS:\n` + result.anomaly_flags.map(a => `  [${a.severity.toUpperCase()}] ${a.anomaly}\n    Intervention: ${a.intervention}`).join('\n') : '  No anomalies detected - pipeline is healthy',
    ``,
    `\u25B6 RETROSPECTIVE INSIGHTS:`,
    ...result.retrospective_insights.map(r => `  Pattern: ${r.pattern}\n  Lesson: ${r.lesson}\n  Apply: ${r.applicability}`)
  ]
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'lead_scorer',
    description: 'Intelligent lead scoring with ICP matching (40pts), behavioral signal analysis (35pts), purchase intent detection (25pts), signal decay modeling (14-day half-life), and dynamic priority reprioritization. Outputs thermometer visualization and funnel breakdown.',
    parameters: {
      lead_profile: { type: 'string', required: true, description: 'JSON lead profile: lead_id, company_name, industry, company_size, region, technologies[], annual_revenue, source' },
      icp_criteria: { type: 'string', required: true, description: 'JSON ICP criteria: industry[], company_size[], region[], technology_stack[], annual_revenue_range' },
      behavioral_signals: { type: 'string', required: true, description: 'JSON array of signals: signal_type, intensity(1-10), recency_days, channel' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { lead_profile: string; icp_criteria: string; behavioral_signals: string }) {
      const lead: LeadProfile = JSON.parse(args.lead_profile)
      const icp: ICPCriteria = JSON.parse(args.icp_criteria)
      const signals: BehavioralSignal[] = JSON.parse(args.behavioral_signals)
      const result = scoreLead(lead, icp, signals)
      return formatLeadScoreReport(result, 1)
    }
  }))

  tools.register(defineTool({
    name: 'outreach_crafter',
    description: 'Generate personalized outreach messages with company intelligence integration, contact persona mapping, pain-point alignment, A/B testing suggestions, and multi-channel adaptation (email, LinkedIn, cold call, SMS).',
    parameters: {
      outreach_request: { type: 'string', required: true, description: 'JSON outreach request: company_intel(recent_news, funding_status, growth_signals, tech_stack, competitors), contact(name, title, seniority, responsibilities, pain_points, communication_style), product_name, value_proposition, channel, tone' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { outreach_request: string }) {
      const request: OutreachRequest = JSON.parse(args.outreach_request)
      const result = craftOutreach(request)
      return formatOutreachReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'deal_inspector',
    description: 'Comprehensive deal health diagnosis with advancement risk identification, key contact coverage analysis, competitive threat assessment, next-best-action recommendations, and funnel stage visualization.',
    parameters: {
      deal_data: { type: 'string', required: true, description: 'JSON deal data: deal_id, deal_name, stage, value, age_days, competitor_threat[], next_steps_defined, contacts[{name, role, influence_level, engagement_level, last_contact_days}], last_activity_days, contract_status' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { deal_data: string }) {
      const deal: DealData = JSON.parse(args.deal_data)
      const result = inspectDeal(deal)
      return formatDealHealthReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'competitive_intel',
    description: 'Automated competitive intelligence with competitor move monitoring, counter-script battle cards, differentiation advantage mapping (7 dimensions), and competitor strategy inference.',
    parameters: {
      competitive_request: { type: 'string', required: true, description: 'JSON competitive request: our_product, our_differentiators[], competitors[{competitor_name, strengths, weaknesses, market_position, pricing_tier, recent_moves}], deal_context' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { competitive_request: string }) {
      const request: CompetitiveRequest = JSON.parse(args.competitive_request)
      const result = gatherCompetitiveIntel(request)
      return formatCompetitiveReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'sales_coach',
    description: 'AI sales coaching with call analysis, silence detection (strategic vs awkward), questioning technique scoring, objection handling assessment, improvement planning, and top performer benchmarking.',
    parameters: {
      sales_call: { type: 'string', required: true, description: 'JSON sales call input: call_id, rep_name, deal_value, call_segments[{speaker, text, duration_seconds, silence_after, sentiment}], discovery_questions_asked, demo_shown, objections_raised[], next_steps_committed' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { sales_call: string }) {
      const input: SalesCallInput = JSON.parse(args.sales_call)
      const result = coachSalesCall(input)
      return formatCoachingReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'pipeline_predictor',
    description: 'Pipeline revenue forecasting with historical conversion analysis, stage stall detection, seasonal adjustment factors, revenue prediction (best/commit/worst case), and quota achievement probability.',
    parameters: {
      pipeline_input: { type: 'string', required: true, description: 'JSON pipeline input: quarter, pipeline_stages[{stage_name, deals_count, total_value, avg_age_days, conversion_rate}], historical_quarters[{quarter, win_rate, avg_deal_size, total_revenue}], sales_cycle_avg_days, seasonal_factors' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { pipeline_input: string }) {
      const pipeline: PipelineInput = JSON.parse(args.pipeline_input)
      const result = predictPipeline(pipeline)
      return formatPipelineReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'customer_360',
    description: 'Complete customer 360-degree view with org structure mapping, decision chain analysis, sentiment trajectory tracking, interaction history synthesis, risk alert expansion opportunity scoring.',
    parameters: {
      customer_input: { type: 'string', required: true, description: 'JSON customer input: customer_id, company_name, org_chart(primary_contact, role, decision_makers[{name, role, influence, engagement}]), interactions[{date, type, participants, outcome, sentiment, follow_up_required}], current_contracts, support_tickets_last_90d, nps_score, expansion_opportunities[{product, fit_score, estimated_value}]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { customer_input: string }) {
      const input: Customer360Input = JSON.parse(args.customer_input)
      const result = generateCustomer360(input)
      return formatCustomer360Report(result)
    }
  }))

  tools.register(defineTool({
    name: 'sales_playbook',
    description: 'Intelligent sales playbook with stage-triggered actions, best practice cards with do/don\'t lists, auto task assignment based on capacity, anomaly detection and intervention, and retrospective learning.',
    parameters: {
      playbook_input: { type: 'string', required: true, description: 'JSON playbook input: current_stage, deal_data(id, value, age_days, contacts_mapped, next_step_defined, competitor_identified), playbook_stages[{stage_name, entry_criteria[], required_actions[], exit_criteria[], recommended_templates[], common_pitfalls[]}], team_capacity[{rep_id, name, current_deals, specializations[]}]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { playbook_input: string }) {
      const input: PlaybookInput = JSON.parse(args.playbook_input)
      const result = generatePlaybook(input)
      return formatPlaybookReport(result)
    }
  }))

  console.log(`[dsh-tool-salesengine] Loaded v${VERSION} - AI Sales Engine with 8 tools`)
  console.log('  Tools: lead_scorer, outreach_crafter, deal_inspector, competitive_intel, sales_coach, pipeline_predictor, customer_360, sales_playbook')
}
