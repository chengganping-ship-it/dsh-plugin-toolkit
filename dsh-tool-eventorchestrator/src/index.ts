/**
 * DSH AI Event Planning & Event Management Orchestrator Plugin v0.1.0
 * Full-cycle event management toolkit for DeepSeek Harness - event planning, venue selection,
 * budget optimization, speaker management, attendee journey design, marketing engine,
 * on-site operations, and post-event analytics.
 * @module dsh-tool-eventorchestrator | @version 0.1.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-eventorchestrator'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== UTILITY ====================

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

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

// ==================== TYPES ====================

// --- Tool 1: Event Planner ---
interface EventGoal {
  primary: string
  secondary?: string[]
  kpis?: string[]
}

interface AudienceProfile {
  target_demographic: string
  expected_size: number
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  industries?: string[]
}

interface EventPlannerInput {
  event_name: string
  event_type: 'conference' | 'workshop' | 'webinar' | 'summit' | 'networking' | 'hybrid' | 'product_launch' | 'gala'
  goals: EventGoal
  audience: AudienceProfile
  preferred_dates?: string[]
  budget_range?: string
}

interface GoalAlignment {
  goal: string
  measurement: string
  priority: 'primary' | 'secondary'
}

interface ThemeRecommendation {
  theme: string
  rationale: string
  visual_direction: string
  tagline: string
}

interface ProjectMilestone {
  phase: string
  tasks: string[]
  duration_weeks: number
  dependencies?: string[]
}

interface EventPlannerResult {
  plan_id: string
  event_name: string
  event_type: string
  goal_alignment: GoalAlignment[]
  theme_recommendation: ThemeRecommendation
  audience_analysis: Record<string, string>
  date_recommendation: string
  scale_estimate: Record<string, string>
  project_plan: ProjectMilestone[]
  gantt_chart: string
}

// --- Tool 2: Venue Selector ---
interface VenueCriteria {
  capacity: number
  location: string
  budget_max: number
  style_preference?: string[]
  required_facilities?: string[]
  accessibility_required?: boolean
}

interface VenueCandidate {
  name: string
  capacity: number
  location: string
  cost: number
  facilities: string[]
  style: string
  accessibility_score: number
  availability?: boolean
}

interface VenueSelectorInput {
  criteria: VenueCriteria
  candidates: VenueCandidate[]
}

interface VenueScore {
  venue_name: string
  overall_score: number
  capacity_fit: number
  location_fit: number
  budget_fit: number
  facilities_fit: number
  style_fit: number
  accessibility_fit: number
  recommendation: string
}

interface ContractClause {
  clause: string
  priority: 'critical' | 'important' | 'standard'
  notes: string
}

interface VenueSelectorResult {
  selection_id: string
  ranked_venues: VenueScore[]
  top_recommendation: string
  contract_negotiation_checklist: ContractClause[]
  risk_factors: string[]
}

// --- Tool 3: Budget Optimizer ---
interface CostCategory {
  category: string
  estimated_cost: number
  vendor_options?: string[]
  notes?: string
}

interface BudgetOptimizerInput {
  total_budget: number
  cost_categories: CostCategory[]
  expected_revenue?: number
  roi_target?: number
  contingency_percentage?: number
}

interface CostOptimization {
  category: string
  current_estimate: number
  optimized_estimate: number
  savings: number
  strategy: string
  confidence: 'high' | 'medium' | 'low'
}

interface BudgetOptimizerResult {
  optimization_id: string
  total_budget: number
  original_total_cost: number
  optimized_total_cost: number
  total_savings: number
  savings_percentage: number
  roi_projection: Record<string, string>
  optimizations: CostOptimization[]
  contingency_fund: Record<string, string>
  tracking_dashboard: Record<string, string[]>
}

// --- Tool 4: Speaker Talent Manager ---
interface SpeakerProfile {
  name: string
  topic: string
  format: 'keynote' | 'panel' | 'workshop' | 'fireside_chat' | 'lightning_talk'
  duration_min: number
  fee?: number
  travel_required?: boolean
  tech_requirements?: string[]
}

interface SpeakerManagerInput {
  speakers: SpeakerProfile[]
  event_dates: string[]
  rehearsal_required?: boolean
}

interface SpeakerSchedule {
  speaker_name: string
  topic: string
  format: string
  day: string
  time_slot: string
  duration_min: number
  status: 'confirmed' | 'pending' | 'invite_sent' | 'rehearsing'
  contract_signed: boolean
}

interface SpeakerDocument {
  speaker_name: string
  documents: string[]
  missing_documents: string[]
  deadline: string
}

interface SpeakerManagerResult {
  management_id: string
  speaker_count: number
  total_speaking_minutes: number
  schedule: SpeakerSchedule[]
  documents_status: SpeakerDocument[]
  total_fees: number
  rehearsal_plan: Record<string, string[]>
  feedback_framework: string[]
}

// --- Tool 5: Attendee Journey Designer ---
interface JourneyStage {
  stage: 'registration' | 'pre_event' | 'arrival' | 'session_attendance' | 'networking' | 'meal_break' | 'post_event' | 'follow_up'
  touchpoint: string
  channel: string
  duration_min?: number
  description: string
}

interface AttendeeJourneyInput {
  journey_stages: JourneyStage[]
  event_type: string
  expected_attendees: number
}

interface JourneyPhase {
  phase: string
  touchpoints: string[]
  emotions: string[]
  pain_points: string[]
  opportunities: string[]
}

interface ExperienceMetric {
  metric_name: string
  measurement_method: string
  target_score: string
  frequency: string
}

interface AttendeeJourneyResult {
  design_id: string
  journey_map: JourneyPhase[]
  experience_metrics: ExperienceMetric[]
  communication_plan: Record<string, string[]>
  feedback_collection_points: string[]
  continuous_engagement: string[]
}

// --- Tool 6: Event Marketing Engine ---
interface MarketingChannel {
  channel: string
  budget: number
  target_audience: string
  content_type: string
}

interface MarketingEngineInput {
  channels: MarketingChannel[]
  event_dates: string[]
  registration_deadline: string
  email_sequence_length?: number
}

interface ChannelPerformance {
  channel: string
  reach_estimate: number
  engagement_rate: string
  conversion_rate: string
  cost_per_acquisition: string
  roi_estimate: string
  status: 'planned' | 'active' | 'optimizing' | 'completed'
}

interface FunnelStage {
  stage: string
  visitors: number
  conversion_rate: string
  cumulative_conversion: string
}

interface EmailSequence {
  sequence_number: number
  trigger: string
  subject: string
  content_focus: string
  timing: string
}

interface MarketingEngineResult {
  engine_id: string
  channel_performances: ChannelPerformance[]
  registration_funnel: FunnelStage[]
  email_sequences: EmailSequence[]
  social_ad_recommendations: string[]
  landing_page_optimization: string[]
  overall_projected_registrations: number
  budget_allocation: Record<string, string>
}

// --- Tool 7: On-Site Operations ---
interface CheckInConfig {
  method: 'qr_code' | 'manual' | 'nfc' | 'facial_recognition'
  stations: number
  expected_peak_per_hour: number
}

interface VolunteerRole {
  role: string
  count: number
  shift: string
  responsibilities: string[]
}

interface EmergencyProtocol {
  scenario: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  response_steps: string[]
  responsible_role: string
}

interface OnSiteOperationsInput {
  checkin_config: CheckInConfig
  volunteers: VolunteerRole[]
  emergency_protocols: EmergencyProtocol[]
  safety_requirements?: string[]
}

interface TrafficFlowZone {
  zone: string
  capacity: number
  peak_times: string[]
  flow_direction: string
  bottleneck_risk: 'low' | 'medium' | 'high'
}

interface OnSiteOperationsResult {
  operations_id: string
  checkin_plan: Record<string, string>
  traffic_flow: TrafficFlowZone[]
  volunteer_assignments: Record<string, string[]>
  emergency_readiness: Record<string, string>
  communication_system: string[]
  real_time_monitoring: string[]
  safety_compliance: string[]
}

// --- Tool 8: Post-Event Analytics ---
interface FeedbackSummaryItem {
  source: string
  response_count: number
  average_rating: number
  key_themes?: string[]
}

interface LeadCaptureItem {
  source: string
  lead_count: number
  qualification_rate: number
  estimated_value: number
}

interface PostEventAnalyticsInput {
  event_name: string
  actual_attendees: number
  total_budget: number
  total_cost: number
  actual_revenue?: number
  feedback: FeedbackSummaryItem[]
  leads: LeadCaptureItem[]
  content_assets_created?: number
}

interface ImprovementArea {
  area: string
  issue: string
  severity: 'high' | 'medium' | 'low'
  recommendation: string
  effort: 'high' | 'medium' | 'low'
}

interface PostEventAnalyticsResult {
  analytics_id: string
  event_name: string
  roi_analysis: Record<string, string>
  feedback_summary: Record<string, string>
  content_value: Record<string, string>
  lead_analysis: Record<string, string>
  improvements: ImprovementArea[]
  knowledge_base_items: string[]
  next_event_recommendations: string[]
  impact_score: number
}

// ==================== TOOL 1: EVENT PLANNER ====================

function planEvent(input: EventPlannerInput): EventPlannerResult {
  const planId = `EVT-${Date.now()}-${Math.abs(hashCode(input.event_name)).toString(16).substring(0, 4)}`

  const goalAlignment: GoalAlignment[] = [
    { goal: input.goals.primary, measurement: input.goals.kpis?.[0] || 'Post-event survey score', priority: 'primary' },
    ...(input.goals.secondary || []).map((g, i) => ({
      goal: g,
      measurement: input.goals.kpis?.[i + 1] || 'Engagement metric tracking',
      priority: 'secondary' as const,
    })),
  ]

  const themes: Record<string, ThemeRecommendation> = {
    conference: { theme: 'Connect & Catalyze', rationale: 'Emphasizes networking and actionable outcomes', visual_direction: 'Deep purple with copper accents, hexagonal patterns', tagline: 'Where Ideas Ignite Action' },
    workshop: { theme: 'Build Together', rationale: 'Hands-on collaborative learning environment', visual_direction: 'Warm orange with cream backgrounds, organic shapes', tagline: ' Learn by Doing, Grow by Sharing' },
    webinar: { theme: 'Insight Stream', rationale: 'Continuous flow of knowledge and expertise', visual_direction: 'Electric blue with white space, clean lines', tagline: 'Expert Knowledge, On Demand' },
    summit: { theme: 'Summit Forward', rationale: 'Elevated thinking and future-focused vision', visual_direction: 'Navy with gold accents, mountain silhouette motifs', tagline: 'Elevate Your Perspective' },
    networking: { theme: 'Spark Network', rationale: 'Creating unexpected connections and opportunities', visual_direction: 'Coral and amber gradients, spark/lightning motifs', tagline: 'Every Connection Sparks Opportunity' },
    hybrid: { theme: 'Bridge Worlds', rationale: 'Seamlessly connecting physical and digital experiences', visual_direction: 'Teal and magenta, interconnected node patterns', tagline: 'One Event, Infinite Access' },
    product_launch: { theme: 'Unveiled', rationale: 'Building anticipation and revealing innovation', visual_direction: 'Black with purple-orange reveal gradient, dramatic lighting', tagline: 'The Future, Revealed' },
    gala: { theme: 'Luminary Night', rationale: 'Celebrating achievements under a shared light', visual_direction: 'Deep indigo with gold shimmer, celestial motifs', tagline: 'Celebrating Excellence Together' },
  }

  const themeRecommendation = themes[input.event_type] || themes.conference

  const audience_analysis: Record<string, string> = {
    target: input.audience.target_demographic,
    size: `${input.audience.expected_size} expected attendees`,
    skill_level: input.audience.skill_level || 'mixed',
    industries: (input.audience.industries || []).join(', ') || 'cross-industry',
    engagement_strategy: input.audience.expected_size > 200 ? 'tiered engagement tracks' : 'intimate interactive format',
  }

  // Date recommendation
  let dateRecommendation = 'No preference specified'
  if (input.preferred_dates && input.preferred_dates.length > 0) {
    const scored = input.preferred_dates.map(d => {
      const day = new Date(d).getDay()
      const score = day >= 2 && day <= 4 ? 3 : day === 1 || day === 5 ? 2 : 1
      return { date: d, score, day_name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] }
    })
    scored.sort((a, b) => b.score - a.score)
    dateRecommendation = `${scored[0].date} (${scored[0].day_name}) - Optimal weekday selection`
  }

  // Scale estimate
  const estSize = input.audience.expected_size
  const scale_estimate: Record<string, string> = {
    category: estSize <= 50 ? 'intimate' : estSize <= 200 ? 'mid-size' : estSize <= 1000 ? 'large' : 'mega',
    venue_tier: estSize <= 50 ? 'boutique' : estSize <= 200 ? 'conference center' : estSize <= 1000 ? 'convention center' : 'arena/exhibition hall',
    staff_needed: `${Math.ceil(estSize / 30)} team members`,
    session_rooms: `${Math.ceil(estSize / 40)} parallel tracks`,
    catering_tier: estSize <= 100 ? 'premium' : estSize <= 500 ? 'standard+' : 'volume',
  }

  // Project plan
  const project_plan: ProjectMilestone[] = [
    { phase: 'Strategy & initiation', tasks: ['Finalize goals', 'Secure budget approval', 'Form planning committee', 'Set project timeline'], duration_weeks: 2 },
    { phase: 'Content & programming', tasks: ['Curate agenda', 'Confirm speakers', 'Design session formats', 'Plan workshops'], duration_weeks: 4, dependencies: ['Strategy & initiation'] },
    { phase: 'Venue & logistics', tasks: ['Select and book venue', 'Arrange catering', 'Coordinate AV production', 'Plan floor layout'], duration_weeks: 3, dependencies: ['Strategy & initiation'] },
    { phase: 'Marketing & promotion', tasks: ['Launch registration', 'Execute marketing campaign', 'Manage speaker promotion', 'Drive early-bird sales'], duration_weeks: 6, dependencies: ['Content & programming'] },
    { phase: 'Production & rehearsal', tasks: ['Speaker rehearsals', 'Tech check', 'Print materials', 'Volunteer training'], duration_weeks: 2, dependencies: ['Venue & logistics', 'Content & programming'] },
    { phase: 'Event execution', tasks: ['Day-of coordination', 'Real-time issue resolution', 'Attendee experience management', 'Content capture'], duration_weeks: 1, dependencies: ['Production & rehearsal'] },
    { phase: 'Post-event follow-up', tasks: ['Send follow-up communications', 'Compile analytics report', 'Conduct retrospective', 'Plan next iteration'], duration_weeks: 2, dependencies: ['Event execution'] },
  ]

  // Gantt chart (ASCII)
  const ganttLines: string[] = []
  ganttLines.push('Gantt Chart: Event Planning Timeline')
  ganttLines.push(''.padEnd(28, '='))
  const totalWeeks = project_plan.reduce((s, p) => s + p.duration_weeks, 0)
  let currentWeek = 0
  for (const m of project_plan) {
    const start = currentWeek
    const dur = m.duration_weeks
    currentWeek += dur
    const bar = '█'.repeat(dur * 2)
    const padding = ' '.repeat((totalWeeks - currentWeek) * 2)
    ganttLines.push(`${m.phase.padEnd(24)} |${bar}${padding}| W${start + 1}-${currentWeek}`)
  }
  ganttLines.push(''.padEnd(28, '='))
  ganttLines.push(`Total Duration: ${totalWeeks} weeks | Today: ${todayISO()}`)

  return {
    plan_id: planId,
    event_name: input.event_name,
    event_type: input.event_type,
    goal_alignment: goalAlignment,
    theme_recommendation: themeRecommendation,
    audience_analysis,
    date_recommendation: dateRecommendation,
    scale_estimate,
    project_plan,
    gantt_chart: ganttLines.join('\n'),
  }
}

function formatEventPlannerReport(r: EventPlannerResult): string {
  const lines: string[] = []
  lines.push('## Event Planning Report')
  lines.push('')
  lines.push(`Plan ID: ${r.plan_id} | Event: ${r.event_name} | Type: ${r.event_type}`)
  lines.push('')
  lines.push('### Goal Alignment')
  lines.push('| Priority | Goal | Measurement |')
  lines.push('|----------|------|-------------|')
  for (const g of r.goal_alignment) {
    lines.push(`| ${g.priority} | ${g.goal} | ${g.measurement} |`)
  }
  lines.push('')
  lines.push('### Theme Recommendation')
  lines.push(`Theme: ${r.theme_recommendation.theme} | Tagline: "${r.theme_recommendation.tagline}"`)
  lines.push(`Visual: ${r.theme_recommendation.visual_direction}`)
  lines.push(`Rationale: ${r.theme_recommendation.rationale}`)
  lines.push('')
  lines.push('### Audience Analysis')
  for (const [k, v] of Object.entries(r.audience_analysis)) {
    lines.push(`- ${k}: ${v}`)
  }
  lines.push('')
  lines.push(`Date Recommendation: ${r.date_recommendation}`)
  lines.push('')
  lines.push('### Scale Estimate')
  for (const [k, v] of Object.entries(r.scale_estimate)) {
    lines.push(`- ${k}: ${v}`)
  }
  lines.push('')
  lines.push('### Project Plan')
  lines.push('| Phase | Duration | Tasks | Dependencies |')
  lines.push('|-------|----------|-------|--------------|')
  for (const m of r.project_plan) {
    const deps = (m.dependencies || []).join(', ') || 'none'
    lines.push(`| ${m.phase} | ${m.duration_weeks}w | ${m.tasks.join('; ')} | ${deps} |`)
  }
  lines.push('')
  lines.push('### Gantt Chart')
  lines.push('```')
  lines.push(r.gantt_chart)
  lines.push('```')
  lines.push('')
  lines.push(`Event planning complete | ${r.goal_alignment.length} goals | ${r.project_plan.length} phases | ${r.theme_recommendation.theme} theme`)
  return lines.join('\n')
}

// ==================== TOOL 2: VENUE SELECTOR ====================

function selectVenue(input: VenueSelectorInput): VenueSelectorResult {
  const selectionId = `VEN-${Date.now()}-${Math.abs(hashCode(input.criteria.location)).toString(16).substring(0, 4)}`

  const { criteria, candidates } = input
  const scored: VenueScore[] = candidates.map(venue => {
    // Capacity fit: prefer 1.2-2x headroom
    const capacityRatio = venue.capacity / criteria.capacity
    const capacityFit = capacityRatio >= 1.1 && capacityRatio <= 2.5 ? 100 : capacityRatio < 1 ? capacityRatio * 60 : Math.max(0, 100 - (capacityRatio - 2.5) * 20)

    // Location fit: simple keyword match
    const locationFit = venue.location.toLowerCase().includes(criteria.location.toLowerCase()) ? 100 : 60

    // Budget fit: lower is better, penalty for over budget
    const budgetFit = venue.cost <= criteria.budget_max ? Math.max(40, 100 - (venue.cost / criteria.budget_max) * 30) : Math.max(0, 50 - ((venue.cost - criteria.budget_max) / criteria.budget_max) * 100)

    // Facilities fit
    const required = criteria.required_facilities || []
    const matchedFacilities = required.filter(f => venue.facilities.some(vf => vf.toLowerCase().includes(f.toLowerCase()))).length
    const facilitiesFit = required.length > 0 ? (matchedFacilities / required.length) * 100 : 80

    // Style fit
    const stylePrefs = criteria.style_preference || []
    const styleMatch = stylePrefs.some(s => venue.style.toLowerCase().includes(s.toLowerCase())) ? 90 : 65

    // Accessibility
    const accessibilityFit = criteria.accessibility_required ? venue.accessibility_score : Math.min(venue.accessibility_score + 20, 100)

    const overall = Math.round(
      capacityFit * 0.2 + locationFit * 0.2 + budgetFit * 0.2 +
      facilitiesFit * 0.15 + styleMatch * 0.1 + accessibilityFit * 0.15
    )

    let recommendation = 'Consider'
    if (overall >= 85) recommendation = 'Highly Recommended'
    else if (overall >= 70) recommendation = 'Strong Candidate'
    else if (overall >= 55) recommendation = 'Possible with adjustments'

    return {
      venue_name: venue.name,
      overall_score: overall,
      capacity_fit: Math.round(capacityFit),
      location_fit: Math.round(locationFit),
      budget_fit: Math.round(budgetFit),
      facilities_fit: Math.round(facilitiesFit),
      style_fit: Math.round(styleMatch),
      accessibility_fit: Math.round(accessibilityFit),
      recommendation,
    }
  })

  scored.sort((a, b) => b.overall_score - a.overall_score)
  const topVenue = scored[0]

  const contractClauses: ContractClause[] = [
    { clause: 'Cancellation terms', priority: 'critical', notes: 'Force majeure clause; refund schedule for 30/60/90 days out' },
    { clause: 'Capacity guarantee', priority: 'critical', notes: 'Minimum room block commitment; attrition penalties' },
    { clause: 'Payment schedule', priority: 'critical', notes: 'Deposit 25% on signing; 50% at 60 days; balance at event' },
    { clause: 'Liability insurance', priority: 'important', notes: '$2M general liability certificate; additional insured endorsement' },
    { clause: 'AV and tech support', priority: 'important', notes: 'Dedicated tech on-site; backup equipment included' },
    { clause: 'Catering minimums', priority: 'important', notes: 'F&B minimums for meeting space waiver; service charge caps' },
    { clause: 'Accessibility compliance', priority: 'important', notes: 'ADA/wheelchair accessibility; hearing loop; sign language on request' },
    { clause: 'Exclusive vendor rights', priority: 'standard', notes: 'In-house A/V or approved list; catering exclusivity terms' },
    { clause: 'Room block release', priority: 'standard', notes: 'Unsold rooms released 30 days prior; complimentary upgrades' },
    { clause: 'Damage responsibility', priority: 'standard', notes: 'Pre-event walkthrough; damage deposit; normal wear exclusion' },
  ]

  const riskFactors: string[] = []
  if (scored.length > 0 && scored[0].budget_fit < 60) riskFactors.push('Top venue exceeds budget threshold — negotiate or expand budget')
  if (criteria.accessibility_required && scored.some(v => v.accessibility_fit < 70)) riskFactors.push('Accessibility requirements may limit venue options')
  if (candidates.length < 3) riskFactors.push('Limited candidate pool — consider expanding search radius')
  riskFactors.push('Confirm availability for preferred dates before signing')
  riskFactors.push('Verify load-in/load-out access and storage availability')

  return {
    selection_id: selectionId,
    ranked_venues: scored,
    top_recommendation: topVenue ? `${topVenue.venue_name} (Score: ${topVenue.overall_score})` : 'No suitable venue found',
    contract_negotiation_checklist: contractClauses,
    risk_factors: riskFactors,
  }
}

function formatVenueSelectorReport(r: VenueSelectorResult): string {
  const lines: string[] = []
  lines.push('## Venue Selection Report')
  lines.push('')
  lines.push(`Selection ID: ${r.selection_id}`)
  lines.push(`Top Recommendation: ${r.top_recommendation}`)
  lines.push('')
  lines.push('### Venue Rankings')
  lines.push('| Rank | Venue | Score | Capacity | Location | Budget | Facilities | Style | Accessibility | Verdict |')
  lines.push('|------|-------|-------|----------|----------|--------|------------|-------|---------------|---------|')
  for (let i = 0; i < r.ranked_venues.length; i++) {
    const v = r.ranked_venues[i]
    lines.push(`| ${i + 1} | ${v.venue_name} | ${v.overall_score} | ${v.capacity_fit} | ${v.location_fit} | ${v.budget_fit} | ${v.facilities_fit} | ${v.style_fit} | ${v.accessibility_fit} | ${v.recommendation} |`)
  }
  lines.push('')
  lines.push('### Contract Negotiation Checklist')
  lines.push('| Priority | Clause | Key Notes |')
  lines.push('|----------|--------|-----------|')
  for (const c of r.contract_negotiation_checklist) {
    const prioTag = c.priority === 'critical' ? 'CRITICAL' : c.priority === 'important' ? 'IMPORTANT' : 'STANDARD'
    lines.push(`| ${prioTag} | ${c.clause} | ${c.notes} |`)
  }
  lines.push('')
  lines.push('### Risk Factors')
  for (const rf of r.risk_factors) lines.push(`- ${rf}`)
  lines.push('')
  lines.push(`Venue selection complete | ${r.ranked_venues.length} venues evaluated | ${r.contract_negotiation_checklist.length} contract clauses`)
  return lines.join('\n')
}

// ==================== TOOL 3: BUDGET OPTIMIZER ====================

function optimizeBudget(input: BudgetOptimizerInput): BudgetOptimizerResult {
  const optId = `BGT-${Date.now()}-${Math.abs(hashCode(`${input.total_budget}`)).toString(16).substring(0, 4)}`

  const originalTotal = input.cost_categories.reduce((s, c) => s + c.estimated_cost, 0)
  const contingencyPct = input.contingency_percentage ?? 10

  const optimizations: CostOptimization[] = input.cost_categories.map(cat => {
    let savingsRate = seededRandom(cat.category) * 0.15 + 0.03
    // Categories with more vendor options offer more savings potential
    if (cat.vendor_options && cat.vendor_options.length >= 3) savingsRate += 0.05
    if (cat.category.toLowerCase().includes('catering')) savingsRate += 0.03
    if (cat.category.toLowerCase().includes('av') || cat.category.toLowerCase().includes('tech')) savingsRate += 0.04
    if (cat.category.toLowerCase().includes('marketing') || cat.category.toLowerCase().includes('advertising')) savingsRate += 0.06
    savingsRate = clamp(savingsRate, 0.02, 0.25)

    const savings = Math.round(cat.estimated_cost * savingsRate)
    const optimized = cat.estimated_cost - savings

    const strategies = [
      'Negotiate group/volume discount with preferred vendor',
      'Bundle services with single vendor for package rate',
      'Shift to digital alternatives where applicable',
      'Sponsor offset — seek category-exclusive sponsorship',
      'Early-bird booking discount (30+ days advance)',
      'Compare 3+ vendor quotes for competitive pricing',
      'Reduce scope to essentials; eliminate nice-to-haves',
      'Leverage in-kind sponsorship for specific categories',
    ]
    const strategy = strategies[Math.floor(seededRandom(cat.category) * strategies.length)]

    const confidence: 'high' | 'medium' | 'low' = savingsRate > 0.12 ? 'high' : savingsRate > 0.06 ? 'medium' : 'low'

    return {
      category: cat.category,
      current_estimate: cat.estimated_cost,
      optimized_estimate: optimized,
      savings,
      strategy,
      confidence,
    }
  })

  const totalSavings = optimizations.reduce((s, o) => s + o.savings, 0)
  const optimizedTotal = originalTotal - totalSavings
  const savingsPct = originalTotal > 0 ? Math.round((totalSavings / originalTotal) * 100) : 0

  const expectedRevenue = input.expected_revenue ?? Math.round(optimizedTotal * 1.5)
  const roiProjection: Record<string, string> = {
    total_cost: `$${optimizedTotal.toLocaleString()}`,
    projected_revenue: `$${expectedRevenue.toLocaleString()}`,
    gross_profit: `$${(expectedRevenue - optimizedTotal).toLocaleString()}`,
    roi_percentage: `${Math.round(((expectedRevenue - optimizedTotal) / optimizedTotal) * 100)}%`,
    roi_target: input.roi_target ? `${input.roi_target}%` : 'Not set',
    status: input.roi_target ? (((expectedRevenue - optimizedTotal) / optimizedTotal) * 100 >= input.roi_target ? 'TARGET MET' : 'BELOW TARGET') : 'NOT EVALUATED',
  }

  const contingencyAmount = Math.round(optimizedTotal * contingencyPct / 100)
  const contingency_fund: Record<string, string> = {
    percentage: `${contingencyPct}%`,
    amount: `$${contingencyAmount.toLocaleString()}`,
    total_with_contingency: `$${(optimizedTotal + contingencyAmount).toLocaleString()}`,
    budget_utilization: `${Math.round((optimizedTotal / input.total_budget) * 100)}%`,
    remaining_headroom: `$${Math.max(0, input.total_budget - optimizedTotal - contingencyAmount).toLocaleString()}`,
  }

  const tracking_dashboard: Record<string, string[]> = {
    'Financial Health': [`Budget: $${optimizedTotal.toLocaleString()} / $${input.total_budget.toLocaleString()}`, `Savings: $${totalSavings.toLocaleString()} (${savingsPct}%)`, `Contingency: $${contingencyAmount.toLocaleString()}`],
    'Vendor Status': optimizations.map(o => `${o.category}: ${o.confidence} confidence — ${o.strategy}`),
    'Action Items': [`Review ${optimizations.filter(o => o.confidence === 'high').length} high-confidence savings opportunities`, 'Schedule vendor comparison meetings', 'Set up weekly budget tracking review', 'Identify 2-3 sponsorship targets'],
  }

  return {
    optimization_id: optId,
    total_budget: input.total_budget,
    original_total_cost: originalTotal,
    optimized_total_cost: optimizedTotal,
    total_savings: totalSavings,
    savings_percentage: savingsPct,
    roi_projection: roiProjection,
    optimizations,
    contingency_fund,
    tracking_dashboard,
  }
}

function formatBudgetOptimizerReport(r: BudgetOptimizerResult): string {
  const lines: string[] = []
  lines.push('## Budget Optimization Report')
  lines.push('')
  lines.push(`Optimization ID: ${r.optimization_id}`)
  lines.push(`Original Cost: $${r.original_total_cost.toLocaleString()} | Optimized: $${r.optimized_total_cost.toLocaleString()} | Savings: $${r.total_savings.toLocaleString()} (${r.savings_percentage}%)`)
  lines.push('')
  lines.push('### ROI Projection')
  for (const [k, v] of Object.entries(r.roi_projection)) {
    lines.push(`- ${k}: ${v}`)
  }
  lines.push('')
  lines.push('### Cost Optimizations')
  lines.push('| Category | Current | Optimized | Savings | Strategy | Confidence |')
  lines.push('|----------|---------|-----------|---------|----------|------------|')
  for (const o of r.optimizations) {
    const confTag = o.confidence === 'high' ? 'HIGH' : o.confidence === 'medium' ? 'MEDIUM' : 'LOW'
    lines.push(`| ${o.category} | $${o.current_estimate.toLocaleString()} | $${o.optimized_estimate.toLocaleString()} | $${o.savings.toLocaleString()} | ${o.strategy} | ${confTag} |`)
  }
  lines.push('')
  lines.push('### Contingency Fund')
  for (const [k, v] of Object.entries(r.contingency_fund)) {
    lines.push(`- ${k}: ${v}`)
  }
  lines.push('')
  lines.push('### Tracking Dashboard')
  for (const [section, items] of Object.entries(r.tracking_dashboard)) {
    lines.push(`#### ${section}`)
    for (const item of items) lines.push(`- ${item}`)
    lines.push('')
  }
  lines.push(`Budget optimization complete | ${r.savings_percentage}% saved | ROI: ${r.roi_projection.roi_percentage}`)
  return lines.join('\n')
}

// ==================== TOOL 4: SPEAKER TALENT MANAGER ====================

function manageSpeakers(input: SpeakerManagerInput): SpeakerManagerResult {
  const mgmtId = `SPK-${Date.now()}-${Math.abs(hashCode(`${input.speakers.length}`)).toString(16).substring(0, 4)}`

  let totalMinutes = 0
  let totalFees = 0
  const schedule: SpeakerSchedule[] = []
  const documents_status: SpeakerDocument[] = []

  const timeSlots = ['09:00-09:45', '10:00-10:45', '11:00-12:00', '14:00-14:45', '15:00-15:45', '16:00-17:00']
  let slotIdx = 0
  let dayIdx = 0

  for (const speaker of input.speakers) {
    totalMinutes += speaker.duration_min
    totalFees += speaker.fee ?? 0

    const day = input.event_dates[dayIdx % input.event_dates.length] || 'TBD'
    const timeSlot = timeSlots[slotIdx % timeSlots.length]

    schedule.push({
      speaker_name: speaker.name,
      topic: speaker.topic,
      format: speaker.format,
      day,
      time_slot: timeSlot,
      duration_min: speaker.duration_min,
      status: 'confirmed',
      contract_signed: !(speaker.fee && speaker.fee > 0),
    })

    slotIdx++
    if (slotIdx % timeSlots.length === 0) dayIdx++

    const docs: string[] = []
    const missing: string[] = []
    docs.push('Speaker bio & headshot')
    docs.push('Session description & learning objectives')
    if (speaker.fee && speaker.fee > 0) docs.push('Speaker agreement/contract')
    if (speaker.travel_required) {
      docs.push('Travel itinerary')
      docs.push('Accommodation confirmation')
    }
    if (speaker.tech_requirements && speaker.tech_requirements.length > 0) {
      docs.push('AV/tech requirements form')
    }
    if (input.rehearsal_required) missing.push('Rehearsal attendance confirmation')
    if (speaker.fee && speaker.fee > 0) missing.push('Invoice received')
    missing.push('Presentation slides (final)')

    documents_status.push({
      speaker_name: speaker.name,
      documents: docs,
      missing_documents: missing,
      deadline: input.event_dates[0] || 'TBD',
    })
  }

  const rehearsal_plan: Record<string, string[]> = {}
  if (input.rehearsal_required) {
    rehearsal_plan['Tech Rehearsal (Day Before)'] = input.speakers.map(s => `${s.name}: 15-min slot`)
    rehearsal_plan['Run-Through (Morning Of)'] = input.speakers.filter(s => s.format === 'keynote' || s.format === 'workshop').map(s => `${s.name}: Full walkthrough`)
  }

  const feedback_framework: string[] = [
    'Post-session attendee rating (1-5 stars) collected via event app',
    'Net Promoter Score (NPS) question after each session',
    'Speaker self-assessment form (challenges, wins, improvements)',
    'Organizer observation notes (audience engagement, timing, content quality)',
    'Social media sentiment tracking for speaker mentions',
    'Speaker satisfaction survey (facilities, support, audience quality)',
  ]

  return {
    management_id: mgmtId,
    speaker_count: input.speakers.length,
    total_speaking_minutes: totalMinutes,
    schedule,
    documents_status,
    total_fees: totalFees,
    rehearsal_plan,
    feedback_framework,
  }
}

function formatSpeakerManagerReport(r: SpeakerManagerResult): string {
  const lines: string[] = []
  lines.push('## Speaker & Talent Management Report')
  lines.push('')
  lines.push(`Management ID: ${r.management_id} | Speakers: ${r.speaker_count} | Total Minutes: ${r.total_speaking_minutes}`)
  lines.push(`Total Speaker Fees: $${r.total_fees.toLocaleString()}`)
  lines.push('')
  lines.push('### Schedule')
  lines.push('| Speaker | Topic | Format | Day | Time | Duration | Status | Contract |')
  lines.push('|---------|-------|--------|-----|------|----------|--------|----------|')
  for (const s of r.schedule) {
    const contractStatus = s.contract_signed ? 'Signed' : 'Pending'
    lines.push(`| ${s.speaker_name} | ${s.topic} | ${s.format} | ${s.day} | ${s.time_slot} | ${s.duration_min}m | ${s.status} | ${contractStatus} |`)
  }
  lines.push('')
  lines.push('### Document Status')
  for (const d of r.documents_status) {
    lines.push(`#### ${d.speaker_name} (Deadline: ${d.deadline})`)
    lines.push(`Submitted: ${d.documents.join(', ')}`)
    lines.push(`Missing: ${d.missing_documents.join(', ')}`)
    lines.push('')
  }
  if (Object.keys(r.rehearsal_plan).length > 0) {
    lines.push('### Rehearsal Plan')
    for (const [session, participants] of Object.entries(r.rehearsal_plan)) {
      lines.push(`#### ${session}`)
      for (const p of participants) lines.push(`- ${p}`)
      lines.push('')
    }
  }
  lines.push('### Feedback Framework')
  for (const f of r.feedback_framework) lines.push(`- ${f}`)
  lines.push('')
  lines.push(`Speaker management complete | ${r.speaker_count} speakers | ${r.total_speaking_minutes} minutes of content`)
  return lines.join('\n')
}

// ==================== TOOL 5: ATTENDEE JOURNEY DESIGNER ====================

function designAttendeeJourney(input: AttendeeJourneyInput): AttendeeJourneyResult {
  const designId = `JNY-${Date.now()}-${Math.abs(hashCode(input.event_type)).toString(16).substring(0, 4)}`

  const phaseEmotions: Record<string, string[]> = {
    registration: ['Excited', 'Curious', 'Slightly anxious'],
    pre_event: ['Anticipating', 'Preparing', 'Engaged'],
    arrival: ['Welcomed', 'Oriented', 'Ready'],
    session_attendance: ['Focused', 'Inspired', 'Connected'],
    networking: ['Open', 'Energized', 'Building relationships'],
    meal_break: ['Relaxed', 'Reflective', 'Social'],
    post_event: ['Accomplished', 'Satisfied', 'Motivated'],
    follow_up: ['Connected', 'Valued', 'Committed'],
  }

  const phasePainPoints: Record<string, string[]> = {
    registration: ['Complex forms', 'Payment issues', 'unclear pricing tiers'],
    pre_event: ['Information overload', 'Unclear schedule', 'Logistics uncertainty'],
    arrival: ['Long queues', 'Poor signage', 'Lost or confused'],
    session_attendance: ['Content mismatch', 'Room too crowded', 'AV issues'],
    networking: ['Difficulty starting conversations', 'No quiet spaces', 'Crowded venues'],
    meal_break: ['Long food lines', 'Dietary restriction issues', 'No seating'],
    post_event: ['Overwhelming amount of content', 'Missing action items', 'Unclear next steps'],
    follow_up: ['No follow-up communication', 'Lost connections', 'Forgotten content'],
  }

  const journey_map: JourneyPhase[] = input.journey_stages.map(js => ({
    phase: js.stage,
    touchpoints: [js.touchpoint],
    emotions: phaseEmotions[js.stage] || ['Neutral'],
    pain_points: phasePainPoints[js.stage] || ['None identified'],
    opportunities: [
      `Enhance ${js.touchpoint} with personalization`,
      `Add pre-emptive communication via ${js.channel}`,
      `Measure satisfaction at ${js.stage} touchpoint`,
    ],
  }))

  const experience_metrics: ExperienceMetric[] = [
    { metric_name: 'Net Promoter Score (NPS)', measurement_method: 'Post-event survey: likelihood to recommend', target_score: '>= 50', frequency: 'Post-event' },
    { metric_name: 'Session Satisfaction', measurement_method: 'Per-session rating (1-5 stars)', target_score: '>= 4.2', frequency: 'Per session' },
    { metric_name: 'Content Relevance', measurement_method: 'Survey: relevance to role/goals', target_score: '>= 80% agree', frequency: 'Post-event' },
    { metric_name: 'Networking Value', measurement_method: 'Connections made per attendee', target_score: '>= 3 meaningful', frequency: 'Post-event' },
    { metric_name: 'Check-in Experience', measurement_method: 'Time to complete + satisfaction rating', target_score: '< 3 min, >= 4.5', frequency: 'On-site' },
    { metric_name: 'Overall Event Rating', measurement_method: 'End-of-event comprehensive survey', target_score: '>= 4.5/5', frequency: 'Post-event' },
  ]

  const communication_plan: Record<string, string[]> = {
    'Registration Confirmation': ['Email with ticket, logistics, preparation tips'],
    '1 Week Before': ['Schedule preview', 'Speaker highlights', 'Networking tips', 'Tech setup guide'],
    'Day Before': ['Final logistics', 'Weather/parking info', 'Event app download link'],
    'Day Of (Morning)': ['Welcome message', 'Check-in reminder', 'Live updates channel'],
    'During Event': ['Session reminders', 'Networking prompts', 'Real-time announcements'],
    'Day After': ['Thank you', 'Recording access', 'Feedback survey link', 'Slide deck links'],
    '1 Week After': ['Impact summary', 'Photo gallery', 'Certificate of attendance'],
    '1 Month After': ['Community invitation', 'Next event preview', 'Continue learning resources'],
  }

  const feedback_collection_points: string[] = [
    'After each session (in-app rating)',
    'End of Day 1 (daily pulse survey)',
    'Post-event comprehensive survey (24h after)',
    '30-day impact follow-up survey',
    'Speaker-specific evaluations',
    'Net Promoter Score assessment',
  ]

  const continuous_engagement: string[] = [
    'Exclusive attendee community (Slack/Discord/LinkedIn group)',
    'Monthly webinar series with event speakers',
    'Quarterly newsletter with industry insights',
    'Early access to next year\'s event registration',
    'Peer networking facilitated introductions',
    'Content library access (recordings, slides, summaries)',
    'Annual alumni reunion or virtual meetup',
  ]

  return {
    design_id: designId,
    journey_map,
    experience_metrics,
    communication_plan,
    feedback_collection_points,
    continuous_engagement,
  }
}

function formatAttendeeJourneyReport(r: AttendeeJourneyResult): string {
  const lines: string[] = []
  lines.push('## Attendee Journey Design Report')
  lines.push('')
  lines.push(`Design ID: ${r.design_id}`)
  lines.push('')
  lines.push('### Journey Map')
  lines.push('| Phase | Touchpoints | Emotions | Pain Points | Opportunities |')
  lines.push('|-------|-------------|----------|-------------|---------------|')
  for (const j of r.journey_map) {
    lines.push(`| ${j.phase} | ${j.touchpoints.join(', ')} | ${j.emotions.join(', ')} | ${j.pain_points.join('; ')} | ${j.opportunities[0]} |`)
  }
  lines.push('')
  lines.push('### Experience Metrics')
  lines.push('| Metric | Method | Target | Frequency |')
  lines.push('|--------|--------|--------|-----------|')
  for (const m of r.experience_metrics) {
    lines.push(`| ${m.metric_name} | ${m.measurement_method} | ${m.target_score} | ${m.frequency} |`)
  }
  lines.push('')
  lines.push('### Communication Plan')
  for (const [timing, items] of Object.entries(r.communication_plan)) {
    lines.push(`#### ${timing}`)
    for (const item of items) lines.push(`- ${item}`)
    lines.push('')
  }
  lines.push('### Feedback Collection Points')
  for (const f of r.feedback_collection_points) lines.push(`- ${f}`)
  lines.push('')
  lines.push('### Continuous Engagement')
  for (const c of r.continuous_engagement) lines.push(`- ${c}`)
  lines.push('')
  lines.push(`Journey design complete | ${r.journey_map.length} phases | ${r.experience_metrics.length} metrics | ${r.continuous_engagement.length} engagement strategies`)
  return lines.join('\n')
}

// ==================== TOOL 6: EVENT MARKETING ENGINE ====================

function runMarketingEngine(input: MarketingEngineInput): MarketingEngineResult {
  const engineId = `MKT-${Date.now()}-${Math.abs(hashCode(`${input.channels.length}`)).toString(16).substring(0, 4)}`

  const totalBudget = input.channels.reduce((s, c) => s + c.budget, 0)
  const seqLength = input.email_sequence_length || 5

  const channelDefaults: Record<string, { reachMultiplier: number; engRate: number; convRate: number }> = {
    'social_media': { reachMultiplier: 80, engRate: 3.5, convRate: 1.2 },
    'email': { reachMultiplier: 25, engRate: 22, convRate: 4.5 },
    'paid_ads': { reachMultiplier: 120, engRate: 2.1, convRate: 2.8 },
    'content_marketing': { reachMultiplier: 45, engRate: 5.5, convRate: 1.8 },
    'influencer': { reachMultiplier: 60, engRate: 6.2, convRate: 3.1 },
    'partnerships': { reachMultiplier: 35, engRate: 8.0, convRate: 5.5 },
    'community': { reachMultiplier: 20, engRate: 12.0, convRate: 6.0 },
    'pr': { reachMultiplier: 50, engRate: 4.0, convRate: 1.5 },
  }

  const channel_performances: ChannelPerformance[] = input.channels.map(ch => {
    const defaults = channelDefaults[ch.channel] || { reachMultiplier: 40, engRate: 4.0, convRate: 2.0 }
    const seed = seededRandom(ch.channel + ch.budget)
    const reach = Math.round((ch.budget * defaults.reachMultiplier * (0.8 + seed * 0.4)) / 10) * 10
    const engRate = (defaults.engRate * (0.9 + seed * 0.2)).toFixed(1)
    const convRate = (defaults.convRate * (0.85 + seed * 0.3)).toFixed(1)
    const cpa = reach > 0 ? `$${Math.max(5, Math.round(ch.budget / (reach * parseFloat(convRate) / 100))).toLocaleString()}` : 'N/A'
    const roi = Math.round(((reach * parseFloat(convRate) / 100) * 150 - ch.budget) / ch.budget * 100)

    return {
      channel: ch.channel,
      reach_estimate: reach,
      engagement_rate: `${engRate}%`,
      conversion_rate: `${convRate}%`,
      cost_per_acquisition: cpa,
      roi_estimate: `${roi}%`,
      status: 'planned',
    }
  })

  // Registration funnel
  const totalReach = channel_performances.reduce((s, c) => s + c.reach_estimate, 0)
  const registration_funnel: FunnelStage[] = [
    { stage: 'Awareness', visitors: totalReach, conversion_rate: '100%', cumulative_conversion: '100%' },
    { stage: 'Landing Page Visit', visitors: Math.round(totalReach * 0.25), conversion_rate: '25%', cumulative_conversion: '25%' },
    { stage: 'Start Registration', visitors: Math.round(totalReach * 0.25 * 0.6), conversion_rate: '60%', cumulative_conversion: '15%' },
    { stage: 'Complete Payment', visitors: Math.round(totalReach * 0.25 * 0.6 * 0.85), conversion_rate: '85%', cumulative_conversion: '12.8%' },
    { stage: 'Confirmed Attendee', visitors: Math.round(totalReach * 0.25 * 0.6 * 0.85 * 0.9), conversion_rate: '90%*', cumulative_conversion: '11.5%' },
  ]

  const projectedRegistrations = registration_funnel[registration_funnel.length - 1].visitors

  // Email sequences
  const email_templates = [
    { subject: 'Early Bird: Secure Your Spot', content_focus: 'Scarcity + value proposition', timing: 'Launch day' },
    { subject: 'Meet Our Speakers', content_focus: 'Speaker credibility + agenda highlights', timing: 'Week 2' },
    { subject: 'What You\'ll Learn', content_focus: 'Content deep-dive + outcomes', timing: 'Week 4' },
    { subject: 'Last Chance: Early Bird Ends', content_focus: 'Urgency + testimonials', timing: '1 week before deadline' },
    { subject: 'Final Hours to Register', content_focus: 'Final push + social proof', timing: 'Day before deadline' },
    { subject: 'Don\'t Miss Out — Limited Seats', content_focus: 'Last-minute urgency', timing: 'Day of deadline' },
  ]

  const email_sequences: EmailSequence[] = []
  for (let i = 0; i < seqLength; i++) {
    const template = email_templates[i % email_templates.length]
    email_sequences.push({
      sequence_number: i + 1,
      trigger: i === 0 ? 'Campaign launch' : `Day ${i * 7}`,
      subject: template.subject,
      content_focus: template.content_focus,
      timing: template.timing,
    })
  }

  const social_ad_recommendations: string[] = [
    'LinkedIn Sponsored Content: Target by job title, industry, company size',
    'Retargeting: Pixel-based ads for landing page visitors who didn\'t register',
    'Speaker Takeover: Let headline speakers promote to their followers',
    'Video Teaser: 30-second highlight reel from previous event',
    'User-Generated Content: Attendee testimonial carousel ads',
    'Lookalike Audiences: Based on past attendee email lists',
  ]

  const landing_page_optimization: string[] = [
    'Headline: Clear value proposition + event name + date',
    'Social Proof: Speaker logos, attendee count, past event rating',
    'CTA Above Fold: Prominent "Register Now" button (orange/green)',
    'Urgency Timer: Early bird countdown or limited seats indicator',
    'Video: 60-second event preview or past event highlights',
    'Agenda Preview: Top sessions visible without scrolling',
    'Trust Signals: Venue photos, sponsor logos, media mentions',
    'Mobile-First: 60%+ of traffic will be mobile — optimize for speed',
  ]

  const budget_allocation: Record<string, string> = {}
  for (const ch of input.channels) {
    budget_allocation[ch.channel] = `$${ch.budget.toLocaleString()} (${((ch.budget / totalBudget) * 100).toFixed(0)}%)`
  }

  return {
    engine_id: engineId,
    channel_performances,
    registration_funnel,
    email_sequences,
    social_ad_recommendations,
    landing_page_optimization,
    overall_projected_registrations: projectedRegistrations,
    budget_allocation,
  }
}

function formatMarketingEngineReport(r: MarketingEngineResult): string {
  const lines: string[] = []
  lines.push('## Event Marketing Engine Report')
  lines.push('')
  lines.push(`Engine ID: ${r.engine_id} | Projected Registrations: ${r.overall_projected_registrations.toLocaleString()}`)
  lines.push('')
  lines.push('### Channel Performances')
  lines.push('| Channel | Reach | Engagement | Conv. Rate | CPA | ROI |')
  lines.push('|---------|-------|------------|------------|-----|-----|')
  for (const c of r.channel_performances) {
    lines.push(`| ${c.channel} | ${c.reach_estimate.toLocaleString()} | ${c.engagement_rate} | ${c.conversion_rate} | ${c.cost_per_acquisition} | ${c.roi_estimate} |`)
  }
  lines.push('')
  lines.push('### Registration Funnel')
  lines.push('| Stage | Visitors | Conversion | Cumulative |')
  lines.push('|-------|----------|------------|------------|')
  for (const f of r.registration_funnel) {
    lines.push(`| ${f.stage} | ${f.visitors.toLocaleString()} | ${f.conversion_rate} | ${f.cumulative_conversion} |`)
  }
  lines.push('')
  lines.push('### Email Sequence')
  lines.push('| # | Trigger | Subject | Content Focus | Timing |')
  lines.push('|---|---------|---------|---------------|--------|')
  for (const e of r.email_sequences) {
    lines.push(`| ${e.sequence_number} | ${e.trigger} | ${e.subject} | ${e.content_focus} | ${e.timing} |`)
  }
  lines.push('')
  lines.push('### Budget Allocation')
  for (const [channel, allocation] of Object.entries(r.budget_allocation)) {
    lines.push(`- ${channel}: ${allocation}`)
  }
  lines.push('')
  lines.push('### Social Ad Recommendations')
  for (const s of r.social_ad_recommendations) lines.push(`- ${s}`)
  lines.push('')
  lines.push('### Landing Page Optimization')
  for (const l of r.landing_page_optimization) lines.push(`- ${l}`)
  lines.push('')
  lines.push(`Marketing engine complete | ${r.overall_projected_registrations} projected registrations | ${r.channel_performances.length} channels | ${r.email_sequences.length} emails`)
  return lines.join('\n')
}

// ==================== TOOL 7: ON-SITE OPERATIONS ====================

function manageOnSiteOperations(input: OnSiteOperationsInput): OnSiteOperationsResult {
  const opsId = `OPS-${Date.now()}-${Math.abs(hashCode(input.checkin_config.method)).toString(16).substring(0, 4)}`

  // Check-in plan
  const avgProcessingTime = input.checkin_config.method === 'qr_code' ? 30 : input.checkin_config.method === 'nfc' ? 45 : input.checkin_config.method === 'facial_recognition' ? 20 : 90
  const throughputPerStation = Math.round(3600 / avgProcessingTime)
  const totalThroughput = throughputPerStation * input.checkin_config.stations
  const estimatedWaitTime = input.checkin_config.stations > 0 ? Math.max(1, Math.round(input.checkin_config.expected_peak_per_hour / totalThroughput)) : 999

  const checkin_plan: Record<string, string> = {
    method: input.checkin_config.method,
    stations: `${input.checkin_config.stations} open`,
    throughput_per_hour: `${totalThroughput} attendees/hour`,
    peak_capacity: `${input.checkin_config.expected_peak_per_hour} expected / ${totalThroughput} capacity`,
    estimated_wait: `${estimatedWaitTime} min avg`,
    backup_plan: input.checkin_config.method === 'qr_code' ? 'Manual fallback list at Station 1' : 'QR code backup at registration desk',
    express_lane: 'Speaker/VIP/Press express check-in (separate station)',
  }

  // Traffic flow zones
  const traffic_flow: TrafficFlowZone[] = [
    { zone: 'Entrance / Lobby', capacity: input.checkin_config.expected_peak_per_hour, peak_times: ['08:00-09:30', '12:30-13:30'], flow_direction: 'One-way in; badge scan at entry', bottleneck_risk: input.checkin_config.stations < 3 ? 'high' : 'medium' },
    { zone: 'Registration Area', capacity: totalThroughput, peak_times: ['08:00-09:30'], flow_direction: 'Queue management with stanchions', bottleneck_risk: 'medium' },
    { zone: 'Main Session Hall', capacity: 500, peak_times: ['09:30-12:00', '14:00-17:00'], flow_direction: 'Theater seating; aisles stay clear', bottleneck_risk: 'low' },
    { zone: 'Networking Lounge', capacity: 150, peak_times: ['12:00-13:30', '17:00-18:00'], flow_direction: 'Open flow; multiple entry points', bottleneck_risk: 'low' },
    { zone: 'Catering Area', capacity: 200, peak_times: ['12:00-13:30'], flow_direction: 'Serpentine queue; multiple serving stations', bottleneck_risk: 'medium' },
  ]

  // Volunteer assignments
  const volunteer_assignments: Record<string, string[]> = {}
  for (const v of input.volunteers) {
    volunteer_assignments[`${v.role} (${v.count} ppl, ${v.shift})`] = v.responsibilities
  }

  // Emergency readiness
  const emergency_readiness: Record<string, string> = {}
  for (const ep of input.emergency_protocols) {
    const sevTag = ep.severity === 'critical' ? 'CRITICAL' : ep.severity === 'high' ? 'HIGH' : ep.severity === 'medium' ? 'MEDIUM' : 'LOW'
    emergency_readiness[`[${sevTag}] ${ep.scenario}`] = `${ep.responsible_role}: ${ep.response_steps.length} response steps defined`
  }

  const communication_system: string[] = [
    'Walkie-talkie channel for all lead volunteers (Channel 1: Operations; Channel 2: Emergency)',
    'Event app push notifications for real-time updates and schedule changes',
    'Designated WhatsApp group for staff coordination',
    'PA system for venue-wide announcements',
    'SMS blast capability for emergency notifications',
    'Digital signage at key wayfinding points (changeable in real-time)',
  ]

  const real_time_monitoring: string[] = [
    'Check-in counter: live registration count vs target',
    'Session rooms: occupancy monitoring (capacity compliance)',
    'Social media wall: track event hashtag volume and sentiment',
    'Help desk ticket queue: open/resolved/in-progress counts',
    'Catering: meal service rate and stock levels',
    'WiFi bandwidth usage per zone',
  ]

  const safety_compliance: string[] = [
    ...(input.safety_requirements || ['Fire safety briefing completed']),
    'Emergency exits clearly marked and unobstructed',
    'First aid station staffed with certified personnel',
    'AED devices accessible within 3 minutes of any point',
    'Evacuation route maps posted at all session rooms',
    'Crowd density monitoring at all bottleneck points',
    'Incident reporting log maintained by security lead',
    'COVID/health screening protocols (if applicable)',
    'Alcohol service compliance (if applicable — licensed bartender)',
  ]

  return {
    operations_id: opsId,
    checkin_plan,
    traffic_flow,
    volunteer_assignments,
    emergency_readiness,
    communication_system,
    real_time_monitoring,
    safety_compliance,
  }
}

function formatOnSiteOperationsReport(r: OnSiteOperationsResult): string {
  const lines: string[] = []
  lines.push('## On-Site Operations Plan')
  lines.push('')
  lines.push(`Operations ID: ${r.operations_id}`)
  lines.push('')
  lines.push('### Check-In Plan')
  for (const [k, v] of Object.entries(r.checkin_plan)) {
    lines.push(`- ${k}: ${v}`)
  }
  lines.push('')
  lines.push('### Traffic Flow Management')
  lines.push('| Zone | Capacity | Peak Times | Flow Direction | Bottleneck Risk |')
  lines.push('|------|----------|------------|----------------|-----------------|')
  for (const t of r.traffic_flow) {
    const riskTag = t.bottleneck_risk === 'high' ? 'HIGH' : t.bottleneck_risk === 'medium' ? 'MEDIUM' : 'LOW'
    lines.push(`| ${t.zone} | ${t.capacity} | ${t.peak_times.join('; ')} | ${t.flow_direction} | ${riskTag} |`)
  }
  lines.push('')
  lines.push('### Volunteer Assignments')
  for (const [role, responsibilities] of Object.entries(r.volunteer_assignments)) {
    lines.push(`#### ${role}`)
    for (const resp of responsibilities) lines.push(`- ${resp}`)
    lines.push('')
  }
  lines.push('### Emergency Readiness')
  for (const [scenario, status] of Object.entries(r.emergency_readiness)) {
    lines.push(`- ${scenario}: ${status}`)
  }
  lines.push('')
  lines.push('### Communication System')
  for (const c of r.communication_system) lines.push(`- ${c}`)
  lines.push('')
  lines.push('### Real-Time Monitoring')
  for (const m of r.real_time_monitoring) lines.push(`- ${m}`)
  lines.push('')
  lines.push('### Safety Compliance')
  for (const s of r.safety_compliance) lines.push(`- ${s}`)
  lines.push('')
  lines.push(`On-site operations plan complete | ${r.traffic_flow.length} zones | ${Object.keys(r.emergency_readiness).length} emergency protocols | ${r.safety_compliance.length} safety items`)
  return lines.join('\n')
}

// ==================== TOOL 8: POST-EVENT ANALYTICS ====================

function analyzePostEvent(input: PostEventAnalyticsInput): PostEventAnalyticsResult {
  const analyticsId = `PST-${Date.now()}-${Math.abs(hashCode(input.event_name)).toString(16).substring(0, 4)}`

  // ROI analysis
  const profit = (input.actual_revenue ?? 0) - input.total_cost
  const roiPct = input.total_cost > 0 ? Math.round((profit / input.total_cost) * 100) : 0
  const budgetVariance = input.total_budget > 0 ? Math.round(((input.total_cost - input.total_budget) / input.total_budget) * 100) : 0
  const revenuePerAttendee = input.actual_attendees > 0 ? Math.round((input.actual_revenue ?? 0) / input.actual_attendees) : 0
  const costPerAttendee = input.actual_attendees > 0 ? Math.round(input.total_cost / input.actual_attendees) : 0

  const roi_analysis: Record<string, string> = {
    total_cost: `$${input.total_cost.toLocaleString()}`,
    actual_revenue: `$${(input.actual_revenue ?? 0).toLocaleString()}`,
    gross_profit: `$${profit.toLocaleString()}`,
    roi_percentage: `${roiPct}%`,
    budget_variance: `${budgetVariance > 0 ? '+' : ''}${budgetVariance}%`,
    cost_per_attendee: `$${costPerAttendee}`,
    revenue_per_attendee: `$${revenuePerAttendee}`,
  }

  // Feedback summary
  const totalResponses = input.feedback.reduce((s, f) => s + f.response_count, 0)
  const weightedRating = input.feedback.reduce((s, f) => s + f.average_rating * f.response_count, 0) / (totalResponses || 1)
  const feedback_summary: Record<string, string> = {
    total_responses: `${totalResponses}`,
    overall_rating: `${weightedRating.toFixed(1)} / 5.0`,
    response_rate: input.actual_attendees > 0 ? `${Math.round((totalResponses / input.actual_attendees) * 100)}%` : 'N/A',
    feedback_sources: input.feedback.map(f => `${f.source} (${f.response_count}, avg ${f.average_rating})`).join('; '),
    key_themes: input.feedback.flatMap(f => f.key_themes || []).join(', ') || 'No themes reported',
  }

  // Content value
  const contentAssets = input.content_assets_created ?? 0
  const content_value: Record<string, string> = {
    assets_created: `${contentAssets} items`,
    content_types: 'Recordings, slide decks, photos, blog posts, social clips',
    estimated_content_lifespan: '12-18 months of usable content',
    content_reuse_potential: 'Repurpose into blog series, email nurture, social clips, pitch decks',
    asset_distribution: 'Upload to content hub within 7 days; distribute via email within 48h',
  }

  // Lead analysis
  const totalLeads = input.leads.reduce((s, l) => s + l.lead_count, 0)
  const qualifiedLeads = input.leads.reduce((s, l) => s + Math.round(l.lead_count * l.qualification_rate / 100), 0)
  const totalLeadValue = input.leads.reduce((s, l) => s + l.estimated_value, 0)
  const lead_analysis: Record<string, string> = {
    total_leads_captured: `${totalLeads}`,
    qualified_leads: `${qualifiedLeads} (${totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0}%)`,
    total_pipeline_value: `$${totalLeadValue.toLocaleString()}`,
    lead_sources: input.leads.map(l => `${l.source}: ${l.lead_count} (${l.qualification_rate}% qualified)`).join('; '),
    follow_up_timeline: 'Hot leads within 24h; warm leads within 72h; all leads within 7 days',
  }

  // Improvements
  const improvements: ImprovementArea[] = []
  if (weightedRating < 4.0) {
    improvements.push({ area: 'Content Quality', issue: 'Overall rating below 4.0', severity: 'high', recommendation: 'Conduct deeper session-level analysis; adjust topics/speakers for next event', effort: 'medium' })
  }
  if (totalResponses < input.actual_attendees * 0.3) {
    improvements.push({ area: 'Feedback Collection', issue: 'Low response rate', severity: 'medium', recommendation: 'Incentivize surveys with prize draws; shorten survey; use in-app micro-surveys', effort: 'low' })
  }
  if (budgetVariance > 10) {
    improvements.push({ area: 'Budget Control', issue: `${budgetVariance}% over budget`, severity: 'high', recommendation: 'Implement weekly budget reviews; negotiate earlier with vendors; build larger contingency', effort: 'medium' })
  }
  if (roiPct < 20) {
    improvements.push({ area: 'Revenue Optimization', issue: `ROI at ${roiPct}% below target`, severity: 'medium', recommendation: 'Increase sponsorship tiers; introduce premium tickets; add virtual access upsell', effort: 'high' })
  }
  improvements.push({ area: 'Registration Experience', issue: 'Always room for improvement', severity: 'low', recommendation: 'A/B test registration flow; reduce form fields; add social login', effort: 'low' })
  improvements.push({ area: 'Networking Outcomes', issue: 'Difficult to measure quantitatively', severity: 'low', recommendation: 'Implement connection-tracking in event app; survey attendees on connections made', effort: 'medium' })

  const knowledge_base_items: string[] = [
    'Event planning timeline (actual vs planned)',
    'Vendor performance evaluation scores',
    'Speaker effectiveness rankings',
    'Attendee demographic profile and feedback',
    'Budget actuals and variance analysis',
    'Marketing channel ROI comparison',
    'Operations incident log and resolution notes',
    'Lessons learned and best practices document',
  ]

  const next_event_recommendations: string[] = [
    `Based on ${input.actual_attendees} attendees — ${input.actual_attendees > 200 ? 'scale up' : 'maintain or grow'} attendance target for next event`,
    `Schedule next event within ${weightedRating >= 4.5 ? '6' : '12'} months to maintain momentum`,
    'Recruit top-rated speakers for return appearances; replace bottom 20%',
    'Double down on top-performing marketing channels from analytics',
    'Implement improvement items from this report in next planning phase',
    'Begin sponsor sales 3 months earlier to secure better deals',
    'Consider hybrid/virtual expansion to increase reach and revenue',
    'Start attendee community engagement immediately to build anticipation',
  ]

  // Impact score (0-100)
  let impactScore = 0
  impactScore += Math.min(weightedRating * 10, 30) // up to 30 from ratings
  impactScore += Math.min(roiPct / 2, 25) // up to 25 from ROI
  impactScore += Math.min(totalLeads / 5, 20) // up to 20 from leads
  impactScore += Math.min(totalResponses / 10, 15) // up to 15 from engagement
  impactScore += contentAssets > 5 ? 10 : contentAssets * 2 // up to 10 from content
  impactScore = Math.round(clamp(impactScore, 0, 100))

  return {
    analytics_id: analyticsId,
    event_name: input.event_name,
    roi_analysis,
    feedback_summary,
    content_value,
    lead_analysis,
    improvements,
    knowledge_base_items,
    next_event_recommendations,
    impact_score: impactScore,
  }
}

function formatPostEventAnalyticsReport(r: PostEventAnalyticsResult): string {
  const lines: string[] = []
  lines.push('## Post-Event Analytics Report')
  lines.push('')
  lines.push(`Analytics ID: ${r.analytics_id} | Event: ${r.event_name} | Impact Score: ${r.impact_score}/100`)
  lines.push('')
  lines.push('### ROI Analysis')
  for (const [k, v] of Object.entries(r.roi_analysis)) {
    lines.push(`- ${k}: ${v}`)
  }
  lines.push('')
  lines.push('### Feedback Summary')
  for (const [k, v] of Object.entries(r.feedback_summary)) {
    lines.push(`- ${k}: ${v}`)
  }
  lines.push('')
  lines.push('### Content Value')
  for (const [k, v] of Object.entries(r.content_value)) {
    lines.push(`- ${k}: ${v}`)
  }
  lines.push('')
  lines.push('### Lead Analysis')
  for (const [k, v] of Object.entries(r.lead_analysis)) {
    lines.push(`- ${k}: ${v}`)
  }
  lines.push('')
  lines.push('### Improvement Areas')
  lines.push('| Area | Issue | Severity | Recommendation | Effort |')
  lines.push('|------|-------|----------|----------------|--------|')
  for (const i of r.improvements) {
    const sevTag = i.severity === 'high' ? 'HIGH' : i.severity === 'medium' ? 'MEDIUM' : 'LOW'
    const effortTag = i.effort === 'high' ? 'HIGH' : i.effort === 'medium' ? 'MEDIUM' : 'LOW'
    lines.push(`| ${i.area} | ${i.issue} | ${sevTag} | ${i.recommendation} | ${effortTag} |`)
  }
  lines.push('')
  lines.push('### Knowledge Base')
  for (const k of r.knowledge_base_items) lines.push(`- ${k}`)
  lines.push('')
  lines.push('### Next Event Recommendations')
  for (const n of r.next_event_recommendations) lines.push(`- ${n}`)
  lines.push('')
  lines.push(`Post-event analytics complete | Impact: ${r.impact_score}/100 | ${r.improvements.length} improvements identified | ${r.knowledge_base_items.length} knowledge items`)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'event_planner',
    description: 'Plan overall event strategy including goal definition, audience analysis, theme design, date selection, scale estimation, and project timeline with Gantt chart.',
    parameters: { event_input: { type: 'string', required: true, description: 'JSON: event_name, event_type (conference|workshop|webinar|summit|networking|hybrid|product_launch|gala), goals{primary, secondary[], kpis[]}, audience{target_demographic, expected_size, skill_level?, industries?}, preferred_dates?, budget_range?' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { event_input: string }) {
      const input: EventPlannerInput = JSON.parse(args.event_input)
      return formatEventPlannerReport(planEvent(input))
    }
  }))

  tools.register(defineTool({
    name: 'venue_selector',
    description: 'Score and rank venue candidates based on capacity, location, facilities, budget, style, accessibility, and availability. Includes contract negotiation checklist.',
    parameters: { venue_input: { type: 'string', required: true, description: 'JSON: criteria{capacity, location, budget_max, style_preference?, required_facilities?, accessibility_required?}, candidates[{name, capacity, location, cost, facilities[], style, accessibility_score, availability?}]' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { venue_input: string }) {
      const input: VenueSelectorInput = JSON.parse(args.venue_input)
      return formatVenueSelectorReport(selectVenue(input))
    }
  }))

  tools.register(defineTool({
    name: 'budget_optimizer',
    description: 'Optimize event budget with cost modeling, ROI projections, vendor comparison strategies, savings opportunities, contingency fund allocation, and tracking dashboard.',
    parameters: { budget_input: { type: 'string', required: true, description: 'JSON: total_budget, cost_categories[{category, estimated_cost, vendor_options?, notes?}], expected_revenue?, roi_target?, contingency_percentage?' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { budget_input: string }) {
      const input: BudgetOptimizerInput = JSON.parse(args.budget_input)
      return formatBudgetOptimizerReport(optimizeBudget(input))
    }
  }))

  tools.register(defineTool({
    name: 'speaker_talent_manager',
    description: 'Manage speaker invitations, agenda scheduling, document tracking, rehearsal planning, feedback collection, contracts, and logistics for all event speakers.',
    parameters: { speaker_input: { type: 'string', required: true, description: 'JSON: speakers[{name, topic, format (keynote|panel|workshop|fireside_chat|lightning_talk), duration_min, fee?, travel_required?, tech_requirements?}], event_dates[], rehearsal_required?' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { speaker_input: string }) {
      const input: SpeakerManagerInput = JSON.parse(args.speaker_input)
      return formatSpeakerManagerReport(manageSpeakers(input))
    }
  }))

  tools.register(defineTool({
    name: 'attendee_journey_designer',
    description: 'Design attendee experience from registration through follow-up, mapping touchpoints, emotions, pain points, and opportunities at each journey phase.',
    parameters: { journey_input: { type: 'string', required: true, description: 'JSON: journey_stages[{stage (registration|pre_event|arrival|session_attendance|networking|meal_break|post_event|follow_up), touchpoint, channel, duration_min?, description}], event_type, expected_attendees' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { journey_input: string }) {
      const input: AttendeeJourneyInput = JSON.parse(args.journey_input)
      return formatAttendeeJourneyReport(designAttendeeJourney(input))
    }
  }))

  tools.register(defineTool({
    name: 'event_marketing_engine',
    description: 'Multi-channel event marketing engine with social ads, email sequences, landing page optimization, registration funnel, and performance tracking.',
    parameters: { marketing_input: { type: 'string', required: true, description: 'JSON: channels[{channel, budget, target_audience, content_type}], event_dates[], registration_deadline, email_sequence_length?' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { marketing_input: string }) {
      const input: MarketingEngineInput = JSON.parse(args.marketing_input)
      return formatMarketingEngineReport(runMarketingEngine(input))
    }
  }))

  tools.register(defineTool({
    name: 'on_site_operations',
    description: 'Plan on-site operations including check-in flow, traffic management, emergency protocols, volunteer assignments, real-time monitoring, and safety compliance.',
    parameters: { ops_input: { type: 'string', required: true, description: 'JSON: checkin_config{method (qr_code|manual|nfc|facial_recognition), stations, expected_peak_per_hour}, volunteers[{role, count, shift, responsibilities[]}], emergency_protocols[{scenario, severity, response_steps[], responsible_role}], safety_requirements?' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { ops_input: string }) {
      const input: OnSiteOperationsInput = JSON.parse(args.ops_input)
      return formatOnSiteOperationsReport(manageOnSiteOperations(input))
    }
  }))

  tools.register(defineTool({
    name: 'post_event_analytics',
    description: 'Comprehensive post-event analysis including ROI calculation, feedback synthesis, content value assessment, lead capture analysis, improvement recommendations, and knowledge base generation.',
    parameters: { analytics_input: { type: 'string', required: true, description: 'JSON: event_name, actual_attendees, total_budget, total_cost, actual_revenue?, feedback[{source, response_count, average_rating, key_themes?}], leads[{source, lead_count, qualification_rate, estimated_value}], content_assets_created?' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { analytics_input: string }) {
      const input: PostEventAnalyticsInput = JSON.parse(args.analytics_input)
      return formatPostEventAnalyticsReport(analyzePostEvent(input))
    }
  }))

  console.log(`[dsh-tool-eventorchestrator] Loaded v${VERSION} - AI Event Planning & Management Orchestrator with 8 tools`)
  console.log('  Tools: event_planner, venue_selector, budget_optimizer, speaker_talent_manager, attendee_journey_designer, event_marketing_engine, on_site_operations, post_event_analytics')
}
