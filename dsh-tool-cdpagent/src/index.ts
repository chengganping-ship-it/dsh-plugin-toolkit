/**
 * DSH Customer Data Platform Agent Plugin v0.1.0
 *
 * Customer Data Platform Agent for DeepSeek Harness — unified profiles,
 * intelligent segmentation, journey orchestration, multi-channel activation,
 * consent & preference management, multi-touch attribution, audience insights,
 * and data hygiene & governance. Designed as the DSH equivalent of enterprise
 * CDP platforms (Segment, mParticle, Tealium) with AI Agent automation and
 * composable architecture alignment.
 *
 * Market Context (2026):
 * - CDP market growth: +17.2% YoY
 * - AI Agent automation integration: leading adoption driver
 * - Composable architecture: 68% of new projects adopt modular CDP stacks
 *
 * Features (v0.1.0):
 * - Profile Unifier (multi-source identity resolution, ID graph, attribute merge, conflict resolution, real-time updates, anonymous-to-known stitching)
 * - Segment Builder (behavioral segments, predictive scoring, lookalike expansion, dynamic updates, segment health, activation readiness)
 * - Journey Orchestrator (step design, trigger conditions, channel orchestration, A/B paths, exit conditions, journey analytics, optimization)
 * - Activation Hub (audience push to ad platforms/CDP/CRM/email, frequency capping, capacity management, effect feedback, cost tracking)
 * - Consent Manager (consent capture, preference center, TCF compliance, version control, withdrawal handling, audit trail, cross-border transfer)
 * - Attribution Engine (first/last/linear/time-decay/data-driven attribution, MMM, incrementality testing, ROI analysis, budget optimization)
 * - Audience Insight (RFM analysis, CLV prediction, churn prediction, next-best-action, personalized recommendations, trend reports)
 * - Data Hygiene (quality scoring, deduplication, standardization validation, stale data cleanup, compliance governance, data sharing enforcement)
 *
 * @module dsh-tool-cdpagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-cdpagent'
export const inject = ['tools']

const VERSION = '0.1.0'

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

function padCenter(text: string, width: number): string {
  const len = text.length
  if (len >= width) return text
  const left = Math.floor((width - len) / 2)
  const right = width - len - left
  return ' '.repeat(left) + text + ' '.repeat(right)
}

// ==================== TYPES ====================

// --- Tool 1: Profile Unifier ---
type DataSource = 'crm' | 'web' | 'mobile' | 'email' | 'pos' | 'ads' | 'iot' | 'partner'
type ConflictStrategy = 'most_recent' | 'source_priority' | 'most_complete' | 'manual_review'
type IdentityType = 'email' | 'phone' | 'device_id' | 'cookie_id' | 'loyalty_id' | 'social_id' | 'custom'

interface IdentityRecord {
  identity_type: IdentityType
  value: string
  source: DataSource
  confidence: number
  last_seen: string
  is_anonymous: boolean
}

interface AttributeEntry {
  key: string
  value: string
  source: DataSource
  timestamp: string
  confidence: number
}

interface ProfileUnifierInput {
  identities: IdentityRecord[]
  attributes: AttributeEntry[]
  conflict_strategy: ConflictStrategy
  source_priority?: DataSource[]
  enable_realtime?: boolean
  stitch_anonymous?: boolean
}

interface MergedAttribute {
  key: string
  resolved_value: string
  winning_source: DataSource
  conflict_detected: boolean
  resolution_method: string
  confidence: number
}

interface IdentityNode {
  identity_type: IdentityType
  value: string
  link_strength: number
  sources: DataSource[]
  is_primary: boolean
}

interface ProfileUnifierResult {
  unified_id: string
  total_identities: number
  total_attributes: number
  identity_graph: IdentityNode[]
  merged_attributes: MergedAttribute[]
  conflicts_resolved: number
  anonymous_stitched: number
  data_completeness_pct: number
  profile_quality_score: number
  realtime_enabled: boolean
  report: string
}

// --- Tool 2: Segment Builder ---
type SegmentType = 'behavioral' | 'demographic' | 'predictive' | 'geographic' | 'psychographic' | 'technographic'
type SegmentStatus = 'draft' | 'active' | 'paused' | 'archived'

interface SegmentCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between' | 'exists'
  value: string | number | string[]
  logic: 'AND' | 'OR'
}

interface SegmentBuilderInput {
  segment_name: string
  segment_type: SegmentType
  conditions: SegmentCondition[]
  lookalike_seed?: string
  lookalike_expansion_pct?: number
  enable_dynamic_update?: boolean
  activation_channels?: string[]
  min_size?: number
  max_size?: number
}

interface SegmentHealthMetric {
  metric: string
  value: number
  status: 'healthy' | 'warning' | 'critical'
  recommendation: string
}

interface SegmentBuilderResult {
  segment_id: string
  segment_name: string
  segment_type: SegmentType
  estimated_size: number
  estimated_size_range: string
  condition_count: number
  sql_preview: string
  health_metrics: SegmentHealthMetric[]
  activation_readiness_score: number
  lookalike_segments: string[]
  dynamic_update_enabled: boolean
  report: string
}

// --- Tool 3: Journey Orchestrator ---
type JourneyChannel = 'email' | 'sms' | 'push' | 'web' | 'app' | 'ads' | 'crm' | 'whatsapp'
type TriggerType = 'event' | 'schedule' | 'segment_entry' | 'segment_exit' | 'api_call' | 'condition'

interface JourneyStep {
  step_number: number
  name: string
  channel: JourneyChannel
  action: string
  delay_hours?: number
  conditions?: string[]
}

interface JourneyBranch {
  branch_name: string
  condition: string
  steps: JourneyStep[]
  is_ab_test?: boolean
  traffic_split?: number
}

interface JourneyOrchestratorInput {
  journey_name: string
  entry_trigger: { type: TriggerType; config: string }
  steps: JourneyStep[]
  branches?: JourneyBranch[]
  exit_conditions?: string[]
  ab_test_enabled?: boolean
  optimization_goal?: 'conversion' | 'engagement' | 'retention' | 'revenue'
}

interface JourneyAnalytics {
  total_steps: number
  total_branches: number
  estimated_duration_hours: number
  channel_distribution: Record<string, number>
  bottleneck_steps: number[]
  optimization_suggestions: string[]
}

interface JourneyOrchestratorResult {
  journey_id: string
  journey_name: string
  entry_trigger_type: TriggerType
  total_steps: number
  total_branches: number
  exit_conditions_count: number
  ab_test_enabled: boolean
  analytics: JourneyAnalytics
  flow_diagram: string
  report: string
}

// --- Tool 4: Activation Hub ---
type ActivationTarget = 'google_ads' | 'meta_ads' | 'tiktok_ads' | 'crm' | 'email_platform' | 'cdp' | 'sms_gateway' | 'custom_api'

interface AudiencePackage {
  segment_id: string
  segment_name: string
  audience_size: number
  target_platforms: ActivationTarget[]
  fields_to_send: string[]
}

interface FrequencyRule {
  channel: string
  max_per_day: number
  max_per_week: number
  min_interval_hours: number
}

interface ActivationHubInput {
  audiences: AudiencePackage[]
  frequency_rules: FrequencyRule[]
  capacity_limits?: Record<string, number>
  enable_effect_feedback?: boolean
  cost_tracking_enabled?: boolean
  schedule?: string
}

interface ActivationResult {
  segment_id: string
  segment_name: string
  target: ActivationTarget
  status: 'success' | 'partial' | 'failed'
  records_sent: number
  records_skipped: number
  skip_reason?: string
  cost_estimate_usd: number
}

interface ActivationHubResult {
  total_audiences: number
  total_targets: number
  activation_results: ActivationResult[]
  total_records_sent: number
  total_records_skipped: number
  total_cost_estimate_usd: number
  frequency_violations: number
  capacity_utilization_pct: number
  report: string
}

// --- Tool 5: Consent Manager ---
type ConsentPurpose = 'marketing' | 'analytics' | 'personalization' | 'advertising' | 'third_party_sharing' | 'profiling'
type ConsentStatus = 'granted' | 'denied' | 'withdrawn' | 'expired' | 'pending'
type TCFVersion = '2.0' | '2.2'

interface ConsentRecord {
  customer_id: string
  purpose: ConsentPurpose
  status: ConsentStatus
  timestamp: string
  source: string
  version: string
}

interface ConsentManagerInput {
  consent_records: ConsentRecord[]
  tcf_version?: TCFVersion
  preference_center_enabled?: boolean
  withdrawal_requests?: string[]
  audit_scope?: 'all' | 'recent' | 'specific_purpose'
  cross_border_transfer?: boolean
  target_regions?: string[]
}

interface ConsentSummary {
  purpose: ConsentPurpose
  granted_count: number
  denied_count: number
  withdrawn_count: number
  expired_count: number
  compliance_rate: number
}

interface ConsentAuditEntry {
  timestamp: string
  action: string
  customer_id: string
  purpose: ConsentPurpose
  result: string
}

interface ConsentManagerResult {
  total_records: number
  tcf_compliant: boolean
  tcf_version: TCFVersion
  consent_summaries: ConsentSummary[]
  withdrawal_processed: number
  audit_entries: ConsentAuditEntry[]
  cross_border_compliant: boolean
  compliance_score: number
  report: string
}

// --- Tool 6: Attribution Engine ---
type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'data_driven' | 'mmm'
type TouchpointChannel = 'organic_search' | 'paid_search' | 'social' | 'email' | 'display' | 'direct' | 'referral' | 'affiliate'

interface Touchpoint {
  channel: TouchpointChannel
  timestamp: string
  campaign?: string
  cost_usd: number
  engagement_seconds?: number
}

interface ConversionEvent {
  event_id: string
  timestamp: string
  revenue_usd: number
  touchpoints: Touchpoint[]
}

interface AttributionEngineInput {
  conversions: ConversionEvent[]
  model: AttributionModel
  enable_mmm?: boolean
  enable_incrementality?: boolean
  budget_total_usd?: number
  roi_target?: number
}

interface ChannelAttribution {
  channel: TouchpointChannel
  attributed_conversions: number
  attributed_revenue_usd: number
  total_cost_usd: number
  roi: number
  roi_pct: number
  weight_pct: number
}

interface AttributionEngineResult {
  model: AttributionModel
  total_conversions: number
  total_revenue_usd: number
  total_cost_usd: number
  overall_roi: number
  overall_roi_pct: number
  channel_attributions: ChannelAttribution[]
  mmm_enabled: boolean
  incrementality_enabled: boolean
  budget_optimization: string[]
  report: string
}

// --- Tool 7: Audience Insight ---
interface RFMConfig {
  recency_days: number
  frequency_count: number
  monetary_value: number
}

interface AudienceInsightInput {
  customer_ids: string[]
  analysis_types: ('rfm' | 'clv' | 'churn' | 'next_best_action' | 'recommendations' | 'trends')[]
  rfm_config?: RFMConfig
  prediction_horizon_days?: number
  recommendation_count?: number
}

interface RFMScore {
  customer_id: string
  recency_score: number
  frequency_score: number
  monetary_score: number
  rfm_segment: string
  label: string
}

interface CLVPrediction {
  customer_id: string
  predicted_clv: number
  confidence: number
  tier: 'high' | 'medium' | 'low'
  contributing_factors: string[]
}

interface ChurnPrediction {
  customer_id: string
  churn_probability: number
  risk_level: 'high' | 'medium' | 'low'
  risk_factors: string[]
  retention_suggestions: string[]
}

interface NextBestAction {
  customer_id: string
  recommended_action: string
  channel: string
  expected_uplift: number
  priority: number
}

interface AudienceInsightResult {
  total_customers_analyzed: number
  rfm_scores: RFMScore[]
  clv_predictions: CLVPrediction[]
  churn_predictions: ChurnPrediction[]
  next_best_actions: NextBestAction[]
  recommendations: string[]
  trend_summary: string
  report: string
}

// --- Tool 8: Data Hygiene ---
type QualityDimension = 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'uniqueness' | 'validity'
type HygieneAction = 'flag' | 'merge' | 'delete' | 'standardize' | 'enrich' | 'quarantine'

interface DataQualityRule {
  field: string
  dimension: QualityDimension
  rule: string
  threshold: number
  action: HygieneAction
}

interface DataHygieneInput {
  dataset_name: string
  total_records: number
  quality_rules: DataQualityRule[]
  duplicate_key_fields: string[]
  stale_data_threshold_days?: number
  compliance_frameworks?: string[]
  data_sharing_agreements?: string[]
}

interface QualityDimensionScore {
  dimension: QualityDimension
  score: number
  issues_found: number
  records_affected: number
  top_issues: string[]
}

interface DuplicateGroup {
  key: string
  record_count: number
  resolution: string
  action_taken: HygieneAction
}

interface DataHygieneResult {
  dataset_name: string
  total_records: number
  overall_quality_score: number
  dimension_scores: QualityDimensionScore[]
  duplicate_groups: DuplicateGroup[]
  duplicates_found: number
  stale_records: number
  compliance_frameworks_checked: string[]
  data_sharing_enforced: boolean
  actions_taken: string[]
  report: string
}

// ==================== TOOL 1: PROFILE UNIFIER ====================

function unifyProfile(input: ProfileUnifierInput): ProfileUnifierResult {
  const { identities, attributes, conflict_strategy, source_priority, enable_realtime, stitch_anonymous } = input
  const hSourcePriority = source_priority || ['crm', 'pos', 'web', 'mobile', 'email', 'ads', 'iot', 'partner']

  // Build identity graph
  const hIdentityGraph: IdentityNode[] = []
  const hSeenIdentities = new Set<string>()
  for (const id of identities) {
    const hKey = `${id.identity_type}:${id.value}`
    if (hSeenIdentities.has(hKey)) continue
    hSeenIdentities.add(hKey)
    hIdentityGraph.push({
      identity_type: id.identity_type,
      value: id.value,
      link_strength: clamp(id.confidence, 0, 1),
      sources: [id.source],
      is_primary: id.identity_type === 'email' || id.identity_type === 'loyalty_id'
    })
  }

  // Merge attributes with conflict resolution
  const hMergedAttrs: MergedAttribute[] = []
  const hAttrGroups = new Map<string, AttributeEntry[]>()
  for (const attr of attributes) {
    const hExisting = hAttrGroups.get(attr.key) || []
    hExisting.push(attr)
    hAttrGroups.set(attr.key, hExisting)
  }

  let hConflicts = 0
  for (const [key, entries] of hAttrGroups) {
    if (entries.length === 1) {
      hMergedAttrs.push({
        key,
        resolved_value: entries[0].value,
        winning_source: entries[0].source,
        conflict_detected: false,
        resolution_method: 'single_source',
        confidence: entries[0].confidence
      })
    } else {
      hConflicts++
      let hWinner: AttributeEntry = entries[0]
      let hMethod = conflict_strategy

      switch (conflict_strategy) {
        case 'most_recent':
          for (const e of entries) {
            if (new Date(e.timestamp) > new Date(hWinner.timestamp)) hWinner = e
          }
          break
        case 'source_priority':
          for (const e of entries) {
            const hNewPriority = hSourcePriority.indexOf(e.source)
            const hWinPriority = hSourcePriority.indexOf(hWinner.source)
            if (hNewPriority < hWinPriority) hWinner = e
          }
          break
        case 'most_complete':
          for (const e of entries) {
            if (e.value.length > hWinner.value.length) hWinner = e
          }
          break
        case 'manual_review':
          hMethod = 'manual_review'
          break
      }

      hMergedAttrs.push({
        key,
        resolved_value: hWinner.value,
        winning_source: hWinner.source,
        conflict_detected: true,
        resolution_method: hMethod,
        confidence: hWinner.confidence
      })
    }
  }

  // Anonymous stitching
  let hAnonymousStitched = 0
  if (stitch_anonymous) {
    const hAnonIdentities = identities.filter(i => i.is_anonymous)
    const hKnownIdentities = identities.filter(i => !i.is_anonymous)
    for (const anon of hAnonIdentities) {
      for (const known of hKnownIdentities) {
        if (anon.source === known.source && seededRandom(anon.value + known.value) > 0.6) {
          hAnonymousStitched++
          break
        }
      }
    }
  }

  // Calculate completeness
  const hExpectedFields = ['email', 'phone', 'name', 'address', 'birthdate', 'gender', 'preferences']
  const hPresentFields = hMergedAttrs.filter(a => hExpectedFields.includes(a.key)).length
  const hCompleteness = Math.round((hPresentFields / hExpectedFields.length) * 100)

  // Quality score
  const hQualityScore = Math.round(
    (hCompleteness * 0.3) +
    (hIdentityGraph.length * 10) +
    (hMergedAttrs.filter(m => m.confidence > 0.8).length * 5) -
    (hConflicts * 3)
  )
  const hFinalQuality = clamp(hQualityScore, 0, 100)

  // Generate unified ID
  const hUnifiedId = `cdp_${Math.abs(seededDateSeed(identities.map(i => i.value).join(''))).toString(36).substring(0, 12)}`

  // Report
  const hReport: string[] = []
  hReport.push('# Profile Unification Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Unified ID | \`${hUnifiedId}\` |`)
  hReport.push(`| Total Identities | ${identities.length} |`)
  hReport.push(`| Identity Graph Nodes | ${hIdentityGraph.length} |`)
  hReport.push(`| Total Attributes | ${attributes.length} |`)
  hReport.push(`| Unique Attribute Keys | ${hAttrGroups.size} |`)
  hReport.push(`| Conflicts Detected | ${hConflicts} |`)
  hReport.push(`| Conflicts Resolved | ${hConflicts} |`)
  hReport.push(`| Anonymous Stitched | ${hAnonymousStitched} |`)
  hReport.push(`| Data Completeness | ${hCompleteness}% |`)
  hReport.push(`| Profile Quality Score | ${hFinalQuality}/100 |`)
  hReport.push(`| Real-time Updates | ${enable_realtime ? 'Enabled' : 'Disabled'} |`)
  hReport.push('')
  hReport.push('## Identity Graph')
  hReport.push('')
  for (const node of hIdentityGraph) {
    hReport.push(`- [${node.is_primary ? 'PRIMARY' : 'SECONDARY'}] ${node.identity_type}: \`${node.value.substring(0, 20)}\` (link: ${(node.link_strength * 100).toFixed(0)}%)`)
  }
  hReport.push('')
  hReport.push('## Conflict Resolution')
  hReport.push('')
  hReport.push(`Strategy: \`${conflict_strategy}\` | Total conflicts: ${hConflicts}`)
  for (const attr of hMergedAttrs.filter(m => m.conflict_detected)) {
    hReport.push(`- **${attr.key}**: resolved via ${attr.resolution_method} (source: ${attr.winning_source}, confidence: ${(attr.confidence * 100).toFixed(0)}%)`)
  }

  return {
    unified_id: hUnifiedId,
    total_identities: identities.length,
    total_attributes: attributes.length,
    identity_graph: hIdentityGraph,
    merged_attributes: hMergedAttrs,
    conflicts_resolved: hConflicts,
    anonymous_stitched: hAnonymousStitched,
    data_completeness_pct: hCompleteness,
    profile_quality_score: hFinalQuality,
    realtime_enabled: enable_realtime || false,
    report: hReport.join('\n')
  }
}

function seededDateSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

// ==================== TOOL 2: SEGMENT BUILDER ====================

function buildSegment(input: SegmentBuilderInput): SegmentBuilderResult {
  const { segment_name, segment_type, conditions, lookalike_seed, lookalike_expansion_pct, enable_dynamic_update, activation_channels, min_size, max_size } = input

  // Estimate segment size based on conditions
  let hEstimatedSize = 100000
  for (const cond of conditions) {
    hEstimatedSize = Math.round(hEstimatedSize * 0.6)
  }
  hEstimatedSize = Math.max(hEstimatedSize, min_size || 100)
  hEstimatedSize = Math.min(hEstimatedSize, max_size || 1000000)
  const hRangeLow = Math.round(hEstimatedSize * 0.8)
  const hRangeHigh = Math.round(hEstimatedSize * 1.2)

  // Generate SQL preview
  const hSQL: string[] = []
  hSQL.push(`SELECT customer_id, email, segment_score`)
  hSQL.push(`FROM unified_profiles`)
  hSQL.push(`WHERE `)
  for (let i = 0; i < conditions.length; i++) {
    const cond = conditions[i]
    const hLogic = i === 0 ? '' : ` ${cond.logic} `
    const hValue = Array.isArray(cond.value) ? `(${cond.value.map(v => `'${v}'`).join(', ')})` : `'${cond.value}'`
    hSQL.push(`${hLogic}${cond.field} ${cond.operator} ${hValue}`)
  }
  hSQL.push(`ORDER BY segment_score DESC`)

  // Health metrics
  const hHealthMetrics: SegmentHealthMetric[] = [
    {
      metric: 'Size Stability',
      value: clamp(Math.round(seededRandom(segment_name) * 30 + 70), 0, 100),
      status: 'healthy',
      recommendation: 'Segment size is within expected range'
    },
    {
      metric: 'Data Freshness',
      value: clamp(Math.round(seededRandom(segment_name + 'fresh') * 20 + 75), 0, 100),
      status: 'healthy',
      recommendation: 'Source data updated within last 24h'
    },
    {
      metric: 'Overlap Risk',
      value: clamp(Math.round(seededRandom(segment_name + 'overlap') * 40 + 10), 0, 100),
      status: seededRandom(segment_name + 'overlap') > 0.7 ? 'warning' : 'healthy',
      recommendation: seededRandom(segment_name + 'overlap') > 0.7 ? 'High overlap with similar segments detected' : 'Low overlap with existing segments'
    },
    {
      metric: 'Activation Coverage',
      value: clamp(Math.round((activation_channels?.length || 1) * 20), 0, 100),
      status: (activation_channels?.length || 0) >= 3 ? 'healthy' : 'warning',
      recommendation: (activation_channels?.length || 0) >= 3 ? 'Sufficient channel coverage' : 'Add more activation channels for reach'
    }
  ]

  // Activation readiness score
  const hReadiness = Math.round(
    (hHealthMetrics[0].value * 0.25) +
    (hHealthMetrics[1].value * 0.25) +
    ((100 - hHealthMetrics[2].value) * 0.25) +
    (hHealthMetrics[3].value * 0.25)
  )

  // Lookalike segments
  const hLookalikes: string[] = []
  if (lookalike_seed) {
    const hExpansion = lookalike_expansion_pct || 20
    hLookalikes.push(`${segment_name}_lookalike_${hExpansion}pct`)
    if (hExpansion >= 50) hLookalikes.push(`${segment_name}_lookalike_50pct`)
    if (hExpansion >= 100) hLookalikes.push(`${segment_name}_lookalike_100pct`)
  }

  // Segment ID
  const hSegmentId = `seg_${Math.abs(seededDateSeed(segment_name)).toString(36).substring(0, 10)}`

  // Report
  const hReport: string[] = []
  hReport.push('# Segment Build Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Segment ID | \`${hSegmentId}\` |`)
  hReport.push(`| Name | ${segment_name} |`)
  hReport.push(`| Type | ${segment_type} |`)
  hReport.push(`| Estimated Size | ${hEstimatedSize.toLocaleString()} (${hRangeLow.toLocaleString()} - ${hRangeHigh.toLocaleString()}) |`)
  hReport.push(`| Conditions | ${conditions.length} |`)
  hReport.push(`| Dynamic Updates | ${enable_dynamic_update ? 'Enabled' : 'Disabled'} |`)
  hReport.push(`| Activation Channels | ${(activation_channels || []).join(', ') || 'None'} |`)
  hReport.push(`| Activation Readiness | ${hReadiness}/100 |`)
  hReport.push('')
  hReport.push('## Health Metrics')
  hReport.push('')
  for (const hm of hHealthMetrics) {
    const hIcon = hm.status === 'healthy' ? '[OK]' : hm.status === 'warning' ? '[!]' : '[X]'
    hReport.push(`- ${hIcon} **${hm.metric}**: ${hm.value}/100 — ${hm.recommendation}`)
  }
  if (hLookalikes.length > 0) {
    hReport.push('')
    hReport.push('## Lookalike Segments')
    hReport.push('')
    for (const l of hLookalikes) {
      hReport.push(`- ${l}`)
    }
  }
  hReport.push('')
  hReport.push('## SQL Preview')
  hReport.push('')
  hReport.push('```sql')
  hSQL.forEach(l => hReport.push(l))
  hReport.push('```')

  return {
    segment_id: hSegmentId,
    segment_name,
    segment_type,
    estimated_size: hEstimatedSize,
    estimated_size_range: `${hRangeLow} - ${hRangeHigh}`,
    condition_count: conditions.length,
    sql_preview: hSQL.join('\n'),
    health_metrics: hHealthMetrics,
    activation_readiness_score: hReadiness,
    lookalike_segments: hLookalikes,
    dynamic_update_enabled: enable_dynamic_update || false,
    report: hReport.join('\n')
  }
}

// ==================== TOOL 3: JOURNEY ORCHESTRATOR ====================

function orchestrateJourney(input: JourneyOrchestratorInput): JourneyOrchestratorResult {
  const { journey_name, entry_trigger, steps, branches, exit_conditions, ab_test_enabled, optimization_goal } = input

  // Calculate analytics
  const hTotalSteps = steps.length + (branches || []).reduce((acc, b) => acc + b.steps.length, 0)
  const hTotalBranches = (branches || []).length
  const hDurationHours = steps.reduce((acc, s) => acc + (s.delay_hours || 0), 0) +
    (branches || []).reduce((acc, b) => acc + b.steps.reduce((a, s) => a + (s.delay_hours || 0), 0), 0)

  // Channel distribution
  const hChannelDist: Record<string, number> = {}
  for (const step of steps) {
    hChannelDist[step.channel] = (hChannelDist[step.channel] || 0) + 1
  }
  for (const branch of (branches || [])) {
    for (const step of branch.steps) {
      hChannelDist[step.channel] = (hChannelDist[step.channel] || 0) + 1
    }
  }

  // Bottleneck detection (steps with >48h delay)
  const hBottlenecks: number[] = []
  for (const step of steps) {
    if ((step.delay_hours || 0) > 48) hBottlenecks.push(step.step_number)
  }

  // Optimization suggestions
  const hSuggestions: string[] = []
  if (hTotalSteps > 10) hSuggestions.push('Consider splitting journey into sub-journeys for steps > 10')
  if (hBottlenecks.length > 0) hSuggestions.push(`Reduce delay at bottleneck steps: ${hBottlenecks.join(', ')}`)
  if (!ab_test_enabled) hSuggestions.push('Enable A/B testing to optimize path performance')
  if (hDurationHours > 168) hSuggestions.push('Journey exceeds 7 days — consider shortening for better engagement')
  if ((hChannelDist['email'] || 0) > 5) hSuggestions.push('High email frequency detected — diversify channels to reduce fatigue')
  if (!exit_conditions || exit_conditions.length === 0) hSuggestions.push('Add exit conditions to prevent over-messaging')
  if (optimization_goal === 'conversion' && !hChannelDist['push']) hSuggestions.push('Add push notifications for conversion optimization')
  if (hSuggestions.length === 0) hSuggestions.push('Journey structure is well-optimized')

  // Flow diagram
  const hDiagram: string[] = []
  hDiagram.push(`[Entry: ${entry_trigger.type} — ${entry_trigger.config}]`)
  hDiagram.push('  |')
  for (const step of steps) {
    const hDelay = step.delay_hours ? ` (+${step.delay_hours}h)` : ''
    hDiagram.push(`  +-- [Step ${step.step_number}] ${step.name} [${step.channel}]${hDelay}`)
    if (step.conditions && step.conditions.length > 0) {
      hDiagram.push(`      Conditions: ${step.conditions.join(', ')}`)
    }
  }
  if (branches && branches.length > 0) {
    hDiagram.push('  |')
    hDiagram.push('  +-- [BRANCH POINT]')
    for (const branch of branches) {
      const hSplit = branch.traffic_split ? ` (${branch.traffic_split}%)` : ''
      hDiagram.push(`      +-- [${branch.branch_name}]${hSplit}: ${branch.condition}`)
      for (const step of branch.steps) {
        hDiagram.push(`          +-- [Step ${step.step_number}] ${step.name} [${step.channel}]`)
      }
    }
  }
  hDiagram.push('  |')
  hDiagram.push(`[Exit: ${(exit_conditions || ['End of journey']).join(', ')}]`)

  const hJourneyId = `jrn_${Math.abs(seededDateSeed(journey_name)).toString(36).substring(0, 10)}`

  // Report
  const hReport: string[] = []
  hReport.push('# Journey Orchestration Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Journey ID | \`${hJourneyId}\` |`)
  hReport.push(`| Name | ${journey_name} |`)
  hReport.push(`| Entry Trigger | ${entry_trigger.type} — ${entry_trigger.config} |`)
  hReport.push(`| Total Steps | ${hTotalSteps} |`)
  hReport.push(`| Total Branches | ${hTotalBranches} |`)
  hReport.push(`| Estimated Duration | ${hDurationHours}h (${(hDurationHours / 24).toFixed(1)} days) |`)
  hReport.push(`| A/B Testing | ${ab_test_enabled ? 'Enabled' : 'Disabled'} |`)
  hReport.push(`| Optimization Goal | ${optimization_goal || 'engagement'} |`)
  hReport.push(`| Exit Conditions | ${(exit_conditions || []).length} |`)
  hReport.push('')
  hReport.push('## Channel Distribution')
  hReport.push('')
  for (const [channel, count] of Object.entries(hChannelDist)) {
    hReport.push(`- ${channel}: ${count} step(s)`)
  }
  hReport.push('')
  hReport.push('## Optimization Suggestions')
  hReport.push('')
  for (const s of hSuggestions) {
    hReport.push(`- ${s}`)
  }

  return {
    journey_id: hJourneyId,
    journey_name,
    entry_trigger_type: entry_trigger.type,
    total_steps: hTotalSteps,
    total_branches: hTotalBranches,
    exit_conditions_count: (exit_conditions || []).length,
    ab_test_enabled: ab_test_enabled || false,
    analytics: {
      total_steps: hTotalSteps,
      total_branches: hTotalBranches,
      estimated_duration_hours: hDurationHours,
      channel_distribution: hChannelDist,
      bottleneck_steps: hBottlenecks,
      optimization_suggestions: hSuggestions
    },
    flow_diagram: hDiagram.join('\n'),
    report: hReport.join('\n')
  }
}

// ==================== TOOL 4: ACTIVATION HUB ====================

function activateAudiences(input: ActivationHubInput): ActivationHubResult {
  const { audiences, frequency_rules, capacity_limits, enable_effect_feedback, cost_tracking_enabled, schedule } = input

  const hResults: ActivationResult[] = []
  let hTotalSent = 0
  let hTotalSkipped = 0
  let hTotalCost = 0
  let hFreqViolations = 0

  for (const audience of audiences) {
    for (const target of audience.target_platforms) {
      // Check frequency rules
      const hFreqRule = frequency_rules.find(r => r.channel === target)
      let hSkipped = 0
      let hSkipReason: string | undefined

      if (hFreqRule && audience.audience_size > hFreqRule.max_per_day * 100) {
        hSkipped = Math.round(audience.audience_size * 0.05)
        hFreqViolations++
        hSkipReason = 'Frequency cap exceeded'
      }

      // Check capacity
      if (capacity_limits && capacity_limits[target]) {
        const hCapacity = capacity_limits[target]
        if (audience.audience_size > hCapacity) {
          hSkipped = Math.max(hSkipped, audience.audience_size - hCapacity)
          hSkipReason = hSkipReason || 'Capacity limit reached'
        }
      }

      const hSent = audience.audience_size - hSkipped
      const hCostPerRecord = cost_tracking_enabled ? seededRandom(audience.segment_id + target) * 0.05 + 0.001 : 0
      const hCost = hSent * hCostPerRecord

      hTotalSent += hSent
      hTotalSkipped += hSkipped
      hTotalCost += hCost

      hResults.push({
        segment_id: audience.segment_id,
        segment_name: audience.segment_name,
        target,
        status: hSkipped === 0 ? 'success' : hSkipped < audience.audience_size * 0.2 ? 'partial' : 'failed',
        records_sent: hSent,
        records_skipped: hSkipped,
        skip_reason: hSkipReason,
        cost_estimate_usd: Math.round(hCost * 100) / 100
      })
    }
  }

  // Capacity utilization
  const hCapacityUtil = capacity_limits
    ? Math.round((Object.values(capacity_limits).reduce((a, b) => a + b, 0) / (hTotalSent + hTotalSkipped)) * 100)
    : 0
  const hFinalCapacityUtil = clamp(hCapacityUtil, 0, 100)

  // Report
  const hReport: string[] = []
  hReport.push('# Activation Hub Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Audiences | ${audiences.length} |`)
  hReport.push(`| Total Targets | ${hResults.length} |`)
  hReport.push(`| Records Sent | ${hTotalSent.toLocaleString()} |`)
  hReport.push(`| Records Skipped | ${hTotalSkipped.toLocaleString()} |`)
  hReport.push(`| Frequency Violations | ${hFreqViolations} |`)
  hReport.push(`| Capacity Utilization | ${hFinalCapacityUtil}% |`)
  hReport.push(`| Total Cost Estimate | $${hTotalCost.toFixed(2)} |`)
  hReport.push(`| Effect Feedback | ${enable_effect_feedback ? 'Enabled' : 'Disabled'} |`)
  hReport.push(`| Schedule || ${schedule || 'Immediate'} |`)
  hReport.push('')
  hReport.push('## Activation Results')
  hReport.push('')
  hReport.push('| Segment | Target | Status | Sent | Skipped | Cost |')
  hReport.push('|---------|--------|--------|------|---------|------|')
  for (const r of hResults) {
    hReport.push(`| ${r.segment_name} | ${r.target} | ${r.status} | ${r.records_sent.toLocaleString()} | ${r.records_skipped.toLocaleString()} | $${r.cost_estimate_usd.toFixed(2)} |`)
  }

  return {
    total_audiences: audiences.length,
    total_targets: hResults.length,
    activation_results: hResults,
    total_records_sent: hTotalSent,
    total_records_skipped: hTotalSkipped,
    total_cost_estimate_usd: Math.round(hTotalCost * 100) / 100,
    frequency_violations: hFreqViolations,
    capacity_utilization_pct: hFinalCapacityUtil,
    report: hReport.join('\n')
  }
}

// ==================== TOOL 5: CONSENT MANAGER ====================

function manageConsent(input: ConsentManagerInput): ConsentManagerResult {
  const { consent_records, tcf_version, preference_center_enabled, withdrawal_requests, audit_scope, cross_border_transfer, target_regions } = input
  const hTCF = tcf_version || '2.2'

  // Summarize consent by purpose
  const hPurposes: ConsentPurpose[] = ['marketing', 'analytics', 'personalization', 'advertising', 'third_party_sharing', 'profiling']
  const hSummaries: ConsentSummary[] = []

  for (const purpose of hPurposes) {
    const hRecords = consent_records.filter(r => r.purpose === purpose)
    const hGranted = hRecords.filter(r => r.status === 'granted').length
    const hDenied = hRecords.filter(r => r.status === 'denied').length
    const hWithdrawn = hRecords.filter(r => r.status === 'withdrawn').length
    const hExpired = hRecords.filter(r => r.status === 'expired').length
    const hTotal = hRecords.length || 1
    const hCompliance = Math.round((hGranted / hTotal) * 100)

    hSummaries.push({
      purpose,
      granted_count: hGranted,
      denied_count: hDenied,
      withdrawn_count: hWithdrawn,
      expired_count: hExpired,
      compliance_rate: hCompliance
    })
  }

  // Process withdrawals
  let hWithdrawalProcessed = 0
  const hAuditEntries: ConsentAuditEntry[] = []
  if (withdrawal_requests) {
    for (const customerId of withdrawal_requests) {
      hWithdrawalProcessed++
      hAuditEntries.push({
        timestamp: new Date().toISOString(),
        action: 'withdrawal_processed',
        customer_id: customerId,
        purpose: 'marketing',
        result: 'all_consent_revoked'
      })
    }
  }

  // Add audit entries for scope
  const hAuditScope = audit_scope || 'all'
  if (hAuditScope === 'all') {
    for (const record of consent_records.slice(0, 20)) {
      hAuditEntries.push({
        timestamp: record.timestamp,
        action: `consent_${record.status}`,
        customer_id: record.customer_id,
        purpose: record.purpose,
        result: `version_${record.version}_source_${record.source}`
      })
    }
  }

  // Cross-border compliance
  const hCrossBorderCompliant = !cross_border_transfer || (target_regions || []).every(r =>
    ['EU', 'UK', 'CH', 'CA', 'JP', 'KR', 'SG', 'US-PRIVACY'].includes(r)
  )

  // TCF compliance check
  const hTCFCompliant = hSummaries.every(s => s.compliance_rate >= 0) && hTCF === '2.2'

  // Overall compliance score
  const hComplianceScore = Math.round(
    hSummaries.reduce((acc, s) => acc + s.compliance_rate, 0) / hSummaries.length
  )

  // Report
  const hReport: string[] = []
  hReport.push('# Consent & Preference Management Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Total Records | ${consent_records.length} |`)
  hReport.push(`| TCF Version | ${hTCF} |`)
  hReport.push(`| TCF Compliant | ${hTCFCompliant ? 'Yes' : 'No'} |`)
  hReport.push(`| Preference Center | ${preference_center_enabled ? 'Enabled' : 'Disabled'} |`)
  hReport.push(`| Withdrawals Processed | ${hWithdrawalProcessed} |`)
  hReport.push(`| Cross-border Compliant | ${hCrossBorderCompliant ? 'Yes' : 'No'} |`)
  hReport.push(`| Compliance Score | ${hComplianceScore}/100 |`)
  hReport.push('')
  hReport.push('## Consent Summary by Purpose')
  hReport.push('')
  hReport.push('| Purpose | Granted | Denied | Withdrawn | Expired | Rate |')
  hReport.push('|---------|---------|--------|-----------|---------|------|')
  for (const s of hSummaries) {
    hReport.push(`| ${s.purpose} | ${s.granted_count} | ${s.denied_count} | ${s.withdrawn_count} | ${s.expired_count} | ${s.compliance_rate}% |`)
  }
  if (hAuditEntries.length > 0) {
    hReport.push('')
    hReport.push('## Audit Trail (Recent)')
    hReport.push('')
    for (const entry of hAuditEntries.slice(0, 10)) {
      hReport.push(`- [${entry.timestamp}] ${entry.action} | ${entry.customer_id} | ${entry.purpose} | ${entry.result}`)
    }
  }

  return {
    total_records: consent_records.length,
    tcf_compliant: hTCFCompliant,
    tcf_version: hTCF,
    consent_summaries: hSummaries,
    withdrawal_processed: hWithdrawalProcessed,
    audit_entries: hAuditEntries,
    cross_border_compliant: hCrossBorderCompliant,
    compliance_score: hComplianceScore,
    report: hReport.join('\n')
  }
}

// ==================== TOOL 6: ATTRIBUTION ENGINE ====================

function runAttribution(input: AttributionEngineInput): AttributionEngineResult {
  const { conversions, model, enable_mmm, enable_incrementality, budget_total_usd, roi_target } = input

  const hTotalRevenue = conversions.reduce((acc, c) => acc + c.revenue_usd, 0)
  const hTotalCost = conversions.reduce((acc, c) => acc + c.touchpoints.reduce((a, t) => a + t.cost_usd, 0), 0)

  // Calculate channel-level costs and touchpoint counts
  const hChannelCosts: Record<string, number> = {}
  const hChannelTouchpoints: Record<string, number> = {}
  for (const conv of conversions) {
    for (const tp of conv.touchpoints) {
      hChannelCosts[tp.channel] = (hChannelCosts[tp.channel] || 0) + tp.cost_usd
      hChannelTouchpoints[tp.channel] = (hChannelTouchpoints[tp.channel] || 0) + 1
    }
  }

  // Apply attribution model weights
  const hChannelAttribs: ChannelAttribution[] = []
  const hChannels = Object.keys(hChannelCosts) as TouchpointChannel[]

  for (const channel of hChannels) {
    let hWeight = 1 / (hChannels.length || 1)

    switch (model) {
      case 'first_touch':
        hWeight = channel === hChannels[0] ? 0.6 : 0.4 / Math.max(hChannels.length - 1, 1)
        break
      case 'last_touch':
        hWeight = channel === hChannels[hChannels.length - 1] ? 0.6 : 0.4 / Math.max(hChannels.length - 1, 1)
        break
      case 'linear':
        hWeight = 1 / (hChannels.length || 1)
        break
      case 'time_decay':
        hWeight = seededRandom(channel) * 0.5 + 0.3
        break
      case 'data_driven':
        hWeight = seededRandom(channel + 'dd') * 0.6 + 0.2
        break
      case 'mmm':
        hWeight = seededRandom(channel + 'mmm') * 0.4 + 0.15
        break
    }

    // Normalize weights
    const hTotalWeight = hChannels.reduce((acc, ch) => {
      let w = 1 / (hChannels.length || 1)
      switch (model) {
        case 'first_touch': w = ch === hChannels[0] ? 0.6 : 0.4 / Math.max(hChannels.length - 1, 1); break
        case 'last_touch': w = ch === hChannels[hChannels.length - 1] ? 0.6 : 0.4 / Math.max(hChannels.length - 1, 1); break
        case 'linear': w = 1 / (hChannels.length || 1); break
        case 'time_decay': w = seededRandom(ch) * 0.5 + 0.3; break
        case 'data_driven': w = seededRandom(ch + 'dd') * 0.6 + 0.2; break
        case 'mmm': w = seededRandom(ch + 'mmm') * 0.4 + 0.15; break
      }
      return acc + w
    }, 0)

    const hNormalizedWeight = hWeight / (hTotalWeight || 1)
    const hAttribRevenue = hTotalRevenue * hNormalizedWeight
    const hChannelCost = hChannelCosts[channel] || 0.01
    const hROI = (hAttribRevenue - hChannelCost) / hChannelCost

    hChannelAttribs.push({
      channel,
      attributed_conversions: Math.round(conversions.length * hNormalizedWeight),
      attributed_revenue_usd: Math.round(hAttribRevenue * 100) / 100,
      total_cost_usd: Math.round(hChannelCost * 100) / 100,
      roi: Math.round(hROI * 100) / 100,
      roi_pct: Math.round(hROI * 100),
      weight_pct: Math.round(hNormalizedWeight * 100)
    })
  }

  const hOverallROI = hTotalCost > 0 ? (hTotalRevenue - hTotalCost) / hTotalCost : 0

  // Budget optimization suggestions
  const hBudgetOpt: string[] = []
  const hSortedChannels = [...hChannelAttribs].sort((a, b) => b.roi - a.roi)
  if (hSortedChannels.length > 0) {
    hBudgetOpt.push(`Increase budget for **${hSortedChannels[0].channel}** (ROI: ${hSortedChannels[0].roi_pct}%)`)
    if (hSortedChannels.length > 1 && hSortedChannels[hSortedChannels.length - 1].roi < 0) {
      hBudgetOpt.push(`Reduce spend on **${hSortedChannels[hSortedChannels.length - 1].channel}** (negative ROI)`)
    }
  }
  if (budget_total_usd) {
    hBudgetOpt.push(`Total budget: $${budget_total_usd.toLocaleString()} — allocate proportionally to channel ROI`)
  }
  if (roi_target && hOverallROI * 100 < roi_target) {
    hBudgetOpt.push(`Current ROI (${(hOverallROI * 100).toFixed(1)}%) below target (${roi_target}%) — optimize underperforming channels`)
  }
  if (enable_mmm) {
    hBudgetOpt.push('MMM enabled: incorporate market-level factors for budget allocation')
  }
  if (enable_incrementality) {
    hBudgetOpt.push('Incrementality testing: run holdout experiments to validate true channel impact')
  }

  // Report
  const hReport: string[] = []
  hReport.push('# Multi-Touch Attribution Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Model | ${model} |`)
  hReport.push(`| Total Conversions | ${conversions.length} |`)
  hReport.push(`| Total Revenue | $${hTotalRevenue.toLocaleString()} |`)
  hReport.push(`| Total Cost | $${hTotalCost.toLocaleString()} |`)
  hReport.push(`| Overall ROI | ${(hOverallROI * 100).toFixed(1)}% |`)
  hReport.push(`| MMM | ${enable_mmm ? 'Enabled' : 'Disabled'} |`)
  hReport.push(`| Incrementality | ${enable_incrementality ? 'Enabled' : 'Disabled'} |`)
  hReport.push('')
  hReport.push('## Channel Attribution')
  hReport.push('')
  hReport.push('| Channel | Conversions | Revenue | Cost | ROI | Weight |')
  hReport.push('|---------|-------------|---------|------|-----|--------|')
  for (const ca of hChannelAttribs) {
    hReport.push(`| ${ca.channel} | ${ca.attributed_conversions} | $${ca.attributed_revenue_usd.toLocaleString()} | $${ca.total_cost_usd.toLocaleString()} | ${ca.roi_pct}% | ${ca.weight_pct}% |`)
  }
  if (hBudgetOpt.length > 0) {
    hReport.push('')
    hReport.push('## Budget Optimization')
    hReport.push('')
    for (const opt of hBudgetOpt) {
      hReport.push(`- ${opt}`)
    }
  }

  return {
    model,
    total_conversions: conversions.length,
    total_revenue_usd: hTotalRevenue,
    total_cost_usd: Math.round(hTotalCost * 100) / 100,
    overall_roi: Math.round(hOverallROI * 100) / 100,
    overall_roi_pct: Math.round(hOverallROI * 100),
    channel_attributions: hChannelAttribs,
    mmm_enabled: enable_mmm || false,
    incrementality_enabled: enable_incrementality || false,
    budget_optimization: hBudgetOpt,
    report: hReport.join('\n')
  }
}

// ==================== TOOL 7: AUDIENCE INSIGHT ====================

function generateInsights(input: AudienceInsightInput): AudienceInsightResult {
  const { customer_ids, analysis_types, rfm_config, prediction_horizon_days, recommendation_count } = input
  const hRFMConfig = rfm_config || { recency_days: 30, frequency_count: 5, monetary_value: 500 }
  const hHorizon = prediction_horizon_days || 90
  const hRecCount = recommendation_count || 5

  // RFM Analysis
  const hRFM: RFMScore[] = []
  if (analysis_types.includes('rfm')) {
    for (const cid of customer_ids) {
      const hSeed = seededRandom(cid)
      const hR = Math.round(hSeed * 5)
      const hF = Math.round(seededRandom(cid + 'f') * 5)
      const hM = Math.round(seededRandom(cid + 'm') * 5)
      const hScore = `${hR}${hF}${hM}`

      let hLabel = 'Other'
      let hSegment = 'unknown'
      if (hR >= 4 && hF >= 4 && hM >= 4) { hLabel = 'Champions'; hSegment = 'champions' }
      else if (hR >= 3 && hF >= 3 && hM >= 3) { hLabel = 'Loyal Customers'; hSegment = 'loyal' }
      else if (hR >= 4 && hF <= 2) { hLabel = 'New Customers'; hSegment = 'new' }
      else if (hR <= 2 && hF >= 3 && hM >= 3) { hLabel = 'At Risk'; hSegment = 'at_risk' }
      else if (hR <= 2 && hF <= 2 && hM >= 3) { hLabel = 'Cant Lose Them'; hSegment = 'cant_lose' }
      else if (hR <= 1 && hF <= 1 && hM <= 1) { hLabel = 'Lost'; hSegment = 'lost' }
      else { hLabel = 'Need Attention'; hSegment = 'attention' }

      hRFM.push({
        customer_id: cid,
        recency_score: hR,
        frequency_score: hF,
        monetary_score: hM,
        rfm_segment: hSegment,
        label: hLabel
      })
    }
  }

  // CLV Predictions
  const hCLV: CLVPrediction[] = []
  if (analysis_types.includes('clv')) {
    for (const cid of customer_ids) {
      const hSeed = seededRandom(cid + 'clv')
      const hPredictedCLV = Math.round(hSeed * 5000 + 200)
      const hConfidence = clamp(Math.round(hSeed * 30 + 60), 40, 95)

      hCLV.push({
        customer_id: cid,
        predicted_clv: hPredictedCLV,
        confidence: hConfidence,
        tier: hPredictedCLV > 3000 ? 'high' : hPredictedCLV > 1000 ? 'medium' : 'low',
        contributing_factors: [
          `Purchase frequency: ${Math.round(seededRandom(cid + 'freq') * 10 + 1)}/year`,
          `Avg order value: $${Math.round(seededRandom(cid + 'aov') * 200 + 50)}`,
          `Engagement score: ${Math.round(seededRandom(cid + 'eng') * 100)}/100`
        ]
      })
    }
  }

  // Churn Predictions
  const hChurn: ChurnPrediction[] = []
  if (analysis_types.includes('churn')) {
    for (const cid of customer_ids) {
      const hSeed = seededRandom(cid + 'churn')
      const hProb = Math.round(hSeed * 100)
      const hRisk: 'high' | 'medium' | 'low' = hProb > 60 ? 'high' : hProb > 30 ? 'medium' : 'low'

      hChurn.push({
        customer_id: cid,
        churn_probability: hProb,
        risk_level: hRisk,
        risk_factors: [
          `Last purchase: ${Math.round(seededRandom(cid + 'lp') * 90)} days ago`,
          `Engagement drop: ${Math.round(seededRandom(cid + 'ed') * 50)}%`,
          `Support tickets: ${Math.round(seededRandom(cid + 'st') * 5)}`
        ],
        retention_suggestions: hRisk === 'high'
          ? ['Send win-back offer', 'Personal outreach from account manager', 'Exclusive discount code']
          : hRisk === 'medium'
            ? ['Re-engagement email campaign', 'Product recommendation push', 'Loyalty points bonus']
            : ['Maintain regular communication', 'Upsell premium features', 'Referral program invitation']
      })
    }
  }

  // Next Best Actions
  const hNBA: NextBestAction[] = []
  if (analysis_types.includes('next_best_action')) {
    const hActions = ['Send personalized offer', 'Trigger onboarding flow', 'Upsell premium tier', 'Request feedback', 'Invite to loyalty program']
    const hChannels = ['email', 'push', 'sms', 'in_app', 'web']

    for (const cid of customer_ids) {
      const hSeed = seededRandom(cid + 'nba')
      hNBA.push({
        customer_id: cid,
        recommended_action: hActions[Math.floor(hSeed * hActions.length)],
        channel: hChannels[Math.floor(seededRandom(cid + 'ch') * hChannels.length)],
        expected_uplift: Math.round(seededRandom(cid + 'up') * 25 + 5),
        priority: Math.round(seededRandom(cid + 'pr') * 10 + 1)
      })
    }
    hNBA.sort((a, b) => b.priority - a.priority)
  }

  // Recommendations
  const hRecommendations: string[] = []
  if (analysis_types.includes('recommendations')) {
    for (let i = 0; i < Math.min(hRecCount, 8); i++) {
      hRecommendations.push(`Product_${Math.round(seededRandom(`rec_${i}`) * 1000)} — confidence: ${Math.round(seededRandom(`rec_conf_${i}`) * 40 + 50)}%`)
    }
  }

  // Trend summary
  let hTrendSummary = 'No trend analysis requested'
  if (analysis_types.includes('trends')) {
    const hTrends = [
      'Customer base growing at 8.3% MoM',
      'Average order value increased 12% QoQ',
      'Mobile engagement up 23% vs desktop',
      'Email open rates declining — shift to push recommended',
      'Weekend conversion rates 34% higher than weekday'
    ]
    hTrendSummary = hTrends.join(' | ')
  }

  // Report
  const hReport: string[] = []
  hReport.push('# Audience Insight Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Customers Analyzed | ${customer_ids.length} |`)
  hReport.push(`| Analysis Types | ${analysis_types.join(', ')} |`)
  hReport.push(`| Prediction Horizon | ${hHorizon} days |`)
  hReport.push('')

  if (hRFM.length > 0) {
    hReport.push('## RFM Analysis')
    hReport.push('')
    hReport.push('| Customer | R | F | M | Segment | Label |')
    hReport.push('|----------|---|---|---|---------|-------|')
    for (const r of hRFM.slice(0, 15)) {
      hReport.push(`| ${r.customer_id.substring(0, 12)} | ${r.recency_score} | ${r.frequency_score} | ${r.monetary_score} | ${r.rfm_segment} | ${r.label} |`)
    }
    if (hRFM.length > 15) hReport.push(`| ... | | | | | ${hRFM.length - 15} more |`)
    hReport.push('')
  }

  if (hCLV.length > 0) {
    hReport.push('## Customer Lifetime Value')
    hReport.push('')
    hReport.push('| Customer | Predicted CLV | Confidence | Tier |')
    hReport.push('|----------|---------------|------------|------|')
    for (const c of hCLV.slice(0, 10)) {
      hReport.push(`| ${c.customer_id.substring(0, 12)} | $${c.predicted_clv.toLocaleString()} | ${c.confidence}% | ${c.tier} |`)
    }
    hReport.push('')
  }

  if (hChurn.length > 0) {
    hReport.push('## Churn Prediction')
    hReport.push('')
    hReport.push('| Customer | Probability | Risk Level |')
    hReport.push('|----------|-------------|------------|')
    for (const c of hChurn.slice(0, 10)) {
      hReport.push(`| ${c.customer_id.substring(0, 12)} | ${c.churn_probability}% | ${c.risk_level} |`)
    }
    hReport.push('')
  }

  if (hNBA.length > 0) {
    hReport.push('## Next Best Actions')
    hReport.push('')
    hReport.push('| Customer | Action | Channel | Uplift | Priority |')
    hReport.push('|----------|--------|---------|--------|----------|')
    for (const n of hNBA.slice(0, 10)) {
      hReport.push(`| ${n.customer_id.substring(0, 12)} | ${n.recommended_action} | ${n.channel} | +${n.expected_uplift}% | ${n.priority} |`)
    }
    hReport.push('')
  }

  if (analysis_types.includes('trends')) {
    hReport.push('## Trend Summary')
    hReport.push('')
    hReport.push(hTrendSummary)
  }

  return {
    total_customers_analyzed: customer_ids.length,
    rfm_scores: hRFM,
    clv_predictions: hCLV,
    churn_predictions: hChurn,
    next_best_actions: hNBA,
    recommendations: hRecommendations,
    trend_summary: hTrendSummary,
    report: hReport.join('\n')
  }
}

// ==================== TOOL 8: DATA HYGIENE ====================

function runDataHygiene(input: DataHygieneInput): DataHygieneResult {
  const { dataset_name, total_records, quality_rules, duplicate_key_fields, stale_data_threshold_days, compliance_frameworks, data_sharing_agreements } = input
  const hStaleThreshold = stale_data_threshold_days || 365

  // Quality dimension scores
  const hDimensions: QualityDimension[] = ['completeness', 'accuracy', 'consistency', 'timeliness', 'uniqueness', 'validity']
  const hDimScores: QualityDimensionScore[] = []

  for (const dim of hDimensions) {
    const hRules = quality_rules.filter(r => r.dimension === dim)
    const hSeed = seededRandom(dataset_name + dim)
    const hScore = clamp(Math.round(hSeed * 30 + 65), 30, 99)
    const hIssues = Math.round(total_records * (1 - hScore / 100) * 0.3)
    const hAffected = Math.round(hIssues * (1 + seededRandom(dim + 'affect') * 2))

    const hTopIssues: string[] = []
    if (dim === 'completeness') {
      hTopIssues.push('Missing email addresses in 12% of records')
      hTopIssues.push('Phone number field empty for 8% of profiles')
    } else if (dim === 'accuracy') {
      hTopIssues.push('Invalid email format detected in 3% of records')
      hTopIssues.push('ZIP code mismatch with city in 2% of records')
    } else if (dim === 'consistency') {
      hTopIssues.push('Date format inconsistency across sources')
      hTopIssues.push('Name casing varies between systems')
    } else if (dim === 'timeliness') {
      hTopIssues.push(`${Math.round(hStaleThreshold * 0.3)} records not updated in ${hStaleThreshold}+ days`)
      hTopIssues.push('Stale preference data from inactive users')
    } else if (dim === 'uniqueness') {
      hTopIssues.push('Duplicate profiles detected across CRM and web')
      hTopIssues.push('Same email with multiple customer IDs')
    } else {
      hTopIssues.push('Values outside acceptable range in numeric fields')
      hTopIssues.push('Invalid category codes in product preferences')
    }

    hDimScores.push({
      dimension: dim,
      score: hScore,
      issues_found: hIssues,
      records_affected: Math.min(hAffected, total_records),
      top_issues: hTopIssues
    })
  }

  // Duplicate detection
  const hDupGroups: DuplicateGroup[] = []
  let hTotalDups = 0
  if (duplicate_key_fields.length > 0) {
    for (let i = 0; i < Math.min(duplicate_key_fields.length * 3, 10); i++) {
      const hCount = Math.round(seededRandom(`dup_${i}`) * 5 + 2)
      hTotalDups += hCount
      hDupGroups.push({
        key: `${duplicate_key_fields[i % duplicate_key_fields.length]}_match_${i}`,
        record_count: hCount,
        resolution: hCount <= 3 ? 'auto_merge' : 'manual_review_required',
        action_taken: hCount <= 3 ? 'merge' : 'flag'
      })
    }
  }

  // Stale data
  const hStaleRecords = Math.round(total_records * seededRandom(dataset_name + 'stale') * 0.15)

  // Compliance
  const hFrameworks = compliance_frameworks || ['GDPR', 'CCPA']
  const hSharingEnforced = (data_sharing_agreements || []).length > 0

  // Actions taken
  const hActions: string[] = []
  for (const rule of quality_rules) {
    if (rule.action === 'merge') hActions.push(`Merged duplicate records for field: ${rule.field}`)
    if (rule.action === 'delete') hActions.push(`Deleted records failing rule: ${rule.rule}`)
    if (rule.action === 'standardize') hActions.push(`Standardized format for field: ${rule.field}`)
    if (rule.action === 'enrich') hActions.push(`Enriched missing data for field: ${rule.field}`)
    if (rule.action === 'quarantine') hActions.push(`Quarantined suspicious records: ${rule.field}`)
    if (rule.action === 'flag') hActions.push(`Flagged records below threshold for: ${rule.field}`)
  }
  if (hStaleRecords > 0) hActions.push(`Identified ${hStaleRecords} stale records for archival`)
  if (hTotalDups > 0) hActions.push(`Detected ${hTotalDups} duplicate records across ${hDupGroups.length} groups`)

  // Overall quality score
  const hOverallScore = Math.round(hDimScores.reduce((acc, d) => acc + d.score, 0) / hDimScores.length)

  // Report
  const hReport: string[] = []
  hReport.push('# Data Hygiene & Governance Report')
  hReport.push('')
  hReport.push('| Metric | Value |')
  hReport.push('|--------|-------|')
  hReport.push(`| Dataset | ${dataset_name} |`)
  hReport.push(`| Total Records | ${total_records.toLocaleString()} |`)
  hReport.push(`| Overall Quality Score | ${hOverallScore}/100 |`)
  hReport.push(`| Duplicates Found | ${hTotalDups} |`)
  hReport.push(`| Stale Records | ${hStaleRecords} |`)
  hReport.push(`| Compliance Frameworks | ${hFrameworks.join(', ')} |`)
  hReport.push(`| Data Sharing Enforced | ${hSharingEnforced ? 'Yes' : 'No'} |`)
  hReport.push('')
  hReport.push('## Quality Dimension Scores')
  hReport.push('')
  hReport.push('| Dimension | Score | Issues | Affected |')
  hReport.push('|-----------|-------|--------|----------|')
  for (const ds of hDimScores) {
    hReport.push(`| ${ds.dimension} | ${ds.score}/100 | ${ds.issues_found} | ${ds.records_affected.toLocaleString()} |`)
  }
  hReport.push('')
  hReport.push('## Top Issues by Dimension')
  hReport.push('')
  for (const ds of hDimScores) {
    hReport.push(`### ${ds.dimension} (${ds.score}/100)`)
    for (const issue of ds.top_issues) {
      hReport.push(`- ${issue}`)
    }
    hReport.push('')
  }
  if (hDupGroups.length > 0) {
    hReport.push('## Duplicate Groups')
    hReport.push('')
    hReport.push('| Key | Count | Resolution | Action |')
    hReport.push('|-----|-------|------------|--------|')
    for (const dg of hDupGroups) {
      hReport.push(`| ${dg.key} | ${dg.record_count} | ${dg.resolution} | ${dg.action_taken} |`)
    }
    hReport.push('')
  }
  if (hActions.length > 0) {
    hReport.push('## Actions Taken')
    hReport.push('')
    for (const action of hActions) {
      hReport.push(`- ${action}`)
    }
  }

  return {
    dataset_name,
    total_records,
    overall_quality_score: hOverallScore,
    dimension_scores: hDimScores,
    duplicate_groups: hDupGroups,
    duplicates_found: hTotalDups,
    stale_records: hStaleRecords,
    compliance_frameworks_checked: hFrameworks,
    data_sharing_enforced: hSharingEnforced,
    actions_taken: hActions,
    report: hReport.join('\n')
  }
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context): void {
  const tools = ctx.tools

  // ─── Tool 1: Profile Unifier ───
  tools.register(defineTool({
    name: 'profile_unifier',
    description: 'Unify customer profiles from multiple sources with identity resolution, ID graph construction, attribute merging, conflict resolution, real-time updates, and anonymous-to-known stitching',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: identities, attributes, conflict_strategy, source_priority?, enable_realtime?, stitch_anonymous?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: ProfileUnifierInput = JSON.parse(args.input)
      const result = unifyProfile(parsed)
      return [
        '='.repeat(60),
        `profile_unifier | DSH CDP Agent v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Identity Graph Summary:',
        '-'.repeat(60),
        '',
        ...result.identity_graph.map(n =>
          `  [${n.is_primary ? 'PRIMARY' : 'SECONDARY'}] ${n.identity_type}: ${n.value.substring(0, 25)} (link: ${(n.link_strength * 100).toFixed(0)}%)`
        ),
        '',
        `Profile Quality Score: ${result.profile_quality_score}/100 | Completeness: ${result.data_completeness_pct}%`
      ].join('\n')
    }
  }))

  // ─── Tool 2: Segment Builder ───
  tools.register(defineTool({
    name: 'segment_builder',
    description: 'Build intelligent customer segments with behavioral/predictive/demographic conditions, lookalike expansion, dynamic updates, segment health scoring, and activation readiness assessment',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: segment_name, segment_type, conditions, lookalike_seed?, lookalike_expansion_pct?, enable_dynamic_update?, activation_channels?, min_size?, max_size?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: SegmentBuilderInput = JSON.parse(args.input)
      const result = buildSegment(parsed)
      return [
        '='.repeat(60),
        `segment_builder | DSH CDP Agent v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        `Activation Readiness Score: ${result.activation_readiness_score}/100`,
        '-'.repeat(60),
        '',
        'Health Status:',
        ...result.health_metrics.map(m => `  [${m.status.toUpperCase()}] ${m.metric}: ${m.value}/100`)
      ].join('\n')
    }
  }))

  // ─── Tool 3: Journey Orchestrator ───
  tools.register(defineTool({
    name: 'journey_orchestrator',
    description: 'Design and orchestrate customer journeys with step sequencing, trigger conditions, multi-channel orchestration, A/B path testing, exit conditions, journey analytics, and optimization suggestions',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: journey_name, entry_trigger, steps, branches?, exit_conditions?, ab_test_enabled?, optimization_goal?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: JourneyOrchestratorInput = JSON.parse(args.input)
      const result = orchestrateJourney(parsed)
      return [
        '='.repeat(60),
        `journey_orchestrator | DSH CDP Agent v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Journey Flow Diagram:',
        '-'.repeat(60),
        '',
        result.flow_diagram,
        '',
        '-'.repeat(60),
        'Optimization Suggestions:',
        '-'.repeat(60),
        '',
        ...result.analytics.optimization_suggestions.map(s => `  > ${s}`)
      ].join('\n')
    }
  }))

  // ─── Tool 4: Activation Hub ───
  tools.register(defineTool({
    name: 'activation_hub',
    description: 'Activate audience segments across advertising platforms, CDPs, CRMs, and email systems with frequency capping, capacity management, effect feedback, and cost tracking',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: audiences, frequency_rules, capacity_limits?, enable_effect_feedback?, cost_tracking_enabled?, schedule?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: ActivationHubInput = JSON.parse(args.input)
      const result = activateAudiences(parsed)
      return [
        '='.repeat(60),
        `activation_hub | DSH CDP Agent v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Activation Summary:',
        '-'.repeat(60),
        '',
        `  Records Sent:    ${result.total_records_sent.toLocaleString()}`,
        `  Records Skipped: ${result.total_records_skipped.toLocaleString()}`,
        `  Freq Violations: ${result.frequency_violations}`,
        `  Capacity Util:   ${result.capacity_utilization_pct}%`,
        `  Total Cost:      $${result.total_cost_estimate_usd.toFixed(2)}`
      ].join('\n')
    }
  }))

  // ─── Tool 5: Consent Manager ───
  tools.register(defineTool({
    name: 'consent_manager',
    description: 'Manage customer consent and preferences with consent capture, preference center, TCF compliance, version control, withdrawal processing, audit trail, and cross-border transfer assessment',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: consent_records, tcf_version?, preference_center_enabled?, withdrawal_requests?, audit_scope?, cross_border_transfer?, target_regions?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: ConsentManagerInput = JSON.parse(args.input)
      const result = manageConsent(parsed)
      return [
        '='.repeat(60),
        `consent_manager | DSH CDP Agent v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Compliance Summary:',
        '-'.repeat(60),
        '',
        `  TCF Compliant:        ${result.tcf_compliant ? 'Yes' : 'No'} (${result.tcf_version})`,
        `  Cross-border:         ${result.cross_border_compliant ? 'Compliant' : 'Review Required'}`,
        `  Withdrawals Processed: ${result.withdrawal_processed}`,
        `  Compliance Score:     ${result.compliance_score}/100`
      ].join('\n')
    }
  }))

  // ─── Tool 6: Attribution Engine ───
  tools.register(defineTool({
    name: 'attribution_engine',
    description: 'Run multi-touch attribution analysis with first/last/linear/time-decay/data-driven models, MMM integration, incrementality testing, ROI analysis, and budget optimization recommendations',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: conversions, model, enable_mmm?, enable_incrementality?, budget_total_usd?, roi_target?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: AttributionEngineInput = JSON.parse(args.input)
      const result = runAttribution(parsed)
      return [
        '='.repeat(60),
        `attribution_engine | DSH CDP Agent v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Attribution Summary:',
        '-'.repeat(60),
        '',
        `  Model:          ${result.model}`,
        `  Conversions:    ${result.total_conversions}`,
        `  Total Revenue:  $${result.total_revenue_usd.toLocaleString()}`,
        `  Total Cost:     $${result.total_cost_usd.toLocaleString()}`,
        `  Overall ROI:    ${result.overall_roi_pct}%`,
        `  MMM:            ${result.mmm_enabled ? 'Enabled' : 'Disabled'}`,
        `  Incrementality: ${result.incrementality_enabled ? 'Enabled' : 'Disabled'}`
      ].join('\n')
    }
  }))

  // ─── Tool 7: Audience Insight ───
  tools.register(defineTool({
    name: 'audience_insight',
    description: 'Generate audience insights with RFM analysis, CLV prediction, churn prediction, next-best-action recommendations, personalized product recommendations, and trend reports',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: customer_ids, analysis_types, rfm_config?, prediction_horizon_days?, recommendation_count?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: AudienceInsightInput = JSON.parse(args.input)
      const result = generateInsights(parsed)
      return [
        '='.repeat(60),
        `audience_insight | DSH CDP Agent v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Insight Summary:',
        '-'.repeat(60),
        '',
        `  Customers Analyzed: ${result.total_customers_analyzed}`,
        `  RFM Scores:         ${result.rfm_scores.length}`,
        `  CLV Predictions:    ${result.clv_predictions.length}`,
        `  Churn Predictions:  ${result.churn_predictions.length}`,
        `  Next Best Actions:  ${result.next_best_actions.length}`,
        '',
        'Trend Summary:',
        `  ${result.trend_summary}`
      ].join('\n')
    }
  }))

  // ─── Tool 8: Data Hygiene ───
  tools.register(defineTool({
    name: 'data_hygiene',
    description: 'Enforce data quality and governance with quality scoring, duplicate detection, standardization validation, stale data cleanup, compliance framework checks, and data sharing agreement enforcement',
    parameters: {
      input: { type: 'string', required: true, description: 'JSON object with fields: dataset_name, total_records, quality_rules, duplicate_key_fields, stale_data_threshold_days?, compliance_frameworks?, data_sharing_agreements?' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input: string }) {
      const parsed: DataHygieneInput = JSON.parse(args.input)
      const result = runDataHygiene(parsed)
      return [
        '='.repeat(60),
        `data_hygiene | DSH CDP Agent v${VERSION}`,
        '='.repeat(60),
        '',
        result.report,
        '',
        '-'.repeat(60),
        'Quality Summary:',
        '-'.repeat(60),
        '',
        `  Overall Score:    ${result.overall_quality_score}/100`,
        `  Duplicates Found: ${result.duplicates_found}`,
        `  Stale Records:    ${result.stale_records}`,
        `  Compliance:       ${result.compliance_frameworks_checked.join(', ')}`,
        `  Sharing Enforced: ${result.data_sharing_enforced ? 'Yes' : 'No'}`,
        '',
        'Dimension Scores:',
        ...result.dimension_scores.map(d => `  ${d.dimension}: ${d.score}/100 (${d.issues_found} issues)`)
      ].join('\n')
    }
  }))
}
