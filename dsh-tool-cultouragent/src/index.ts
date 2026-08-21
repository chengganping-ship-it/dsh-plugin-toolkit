/**
 * DSH Cultural Tourism AI Assistant Plugin v1.0.0
 * 文化旅游AI助手 for DeepSeek Harness — 目的地营销·遗产数字化·收益管理·文化IP·行程定制·智慧校园·演艺管理·节庆策划
 *
 * 覆盖文化旅游全产业链：目的地品牌建设 → 文化遗产数字化保护 → 旅游收益优化 → 文化IP开发 → 个性化行程规划 → 智慧校园运营 → 演艺项目管理 → 节庆活动策划
 *
 * 工具清单:
 * 1. destination_marketing       — 目的地营销（品牌定位/渠道策略/客群触达）
 * 2. heritage_digitalization     — 遗产数字化（3D采集/数字展陈/活化利用）
 * 3. tourism_revenue_mgmt       — 旅游收益管理（动态定价/渠道优化/二销提升）
 * 4. cultural_ip_developer       — 文化IP开发（IP挖掘/文创设计/授权策略）
 * 5. itinerary_personalization   — 行程定制（兴趣画像/路线规划/体验编排）
 * 6. smart_campus_operations    — 智慧校园运营（能耗管理/安防调度/空间预约）
 * 7. performance_art_management — 演艺管理（排期优化/票务策略/内容评估）
 * 8. event_festival_planner      — 节庆策划（主题设计/活动排程/传播矩阵）
 *
 * @module dsh-tool-cultouragent | @version 1.0.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'cultouragent'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本分析基于AI模型推断，仅供文化旅游运营参考，不替代专业文旅规划与传播决策。'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

function mulberry32(s: number): () => number {
  let x = s >>> 0
  return () => {
    x = (x + 0x6D2B79F5) | 0
    let t = x
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(seedStr: string): () => number {
  return mulberry32(hashStr(seedStr))
}

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Destination Marketing ---
interface DestinationProfile {
  destination_id: string
  destination_name: string
  region: string
  destination_type: string
  target_markets: string[]
  current_annual_visitors: number
  current_revenue_million: number
  brand_awareness_pct: number
  seasonality_pattern: string[]
  competitive_set: string[]
  unique_selling_points: string[]
  marketing_budget_pct: number
}

interface MarketingChannel {
  channel: string
  reach_score: number
  cost_efficiency: number
  target_match: number
  recommended_budget_pct: number
}

interface DestinationMarketingResult {
  destination_id: string
  brand_positioning: string
  target_segments: Array<{ segment: string; priority: number; message: string }>
  channel_strategy: MarketingChannel[]
  campaign_calendar: Array<{ month: string; campaign: string; channel: string; budget_pct: number }>
  kpi_dashboard: Record<string, number>
  roi_forecast: Record<string, number>
}

// --- Tool 2: Heritage Digitalization ---
interface HeritageSiteInput {
  site_id: string
  site_name: string
  heritage_type: string
  protection_level: string
  current_state: string
  annual_visitors: number
  existing_digital_assets: string[]
  budget_range: string
  stakeholder_requirements: string[]
}

interface DigitalAssetPlan {
  asset_type: string
  method: string
  estimated_cost: number
  timeline_months: number
  priority: 'essential' | 'recommended' | 'optional'
}

interface DigitalExhibition {
  title: string
  format: string
  audience: string
  interactivity_level: string
  revenue_model: string
}

interface HeritageDigitalizationResult {
  site_id: string
  digital_readiness_score: number
  asset_plan: DigitalAssetPlan[]
  exhibitions: DigitalExhibition[]
  preservation_risk_index: number
  visitor_engagement_forecast: Record<string, number>
  investment_priority: string[]
}

// --- Tool 3: Tourism Revenue Management ---
interface RevenueInputData {
  property_id: string
  property_name: string
  property_type: string
  room_count: number
  current_adr: number
  current_occupancy: number
  current_revpar: number
  revenue_streams: Array<{ stream: string; revenue_pct: number; growth_pct: number }>
  distribution_channels: Array<{ channel: string; share_pct: number; commission_pct: number }>
  season_length_days: number
  competitor_adr_range: [number, number]
}

interface PricingRecommendation {
  season: string
  date_range: string
  recommended_adr: number
  discount_ceiling: number
  length_of_stay_rules: string
}

interface RevenueManagementResult {
  property_id: string
  optimized_revpar: number
  revpar_uplift_pct: number
  pricing_recommendations: PricingRecommendation[]
  channel_optimization: Array<{ channel: string; current_share: number; target_share: number; action: string }>
  ancillary_revenue_opportunities: Array<{ stream: string; potential_uplift_pct: number; implementation: string }>
  revenue_forecast: Record<string, number>
}

// --- Tool 4: Cultural IP Developer ---
interface IPDiscoveryInput {
  ip_project_id: string
  cultural_source: string
  ip_category: string
  target_demographic: string
  commercial_goals: string[]
  existing_assets: string[]
  budget_tier: string
  timeline_months: number
}

interface IPAsset {
  asset_name: string
  asset_type: string
  development_cost: number
  revenue_potential: number
  brand_alignment: number
  protection_status: string
}

interface LicensingStrategy {
  category: string
  partner_type: string
  royalty_rate: number
  estimated_annual_revenue: number
  exclusivity: string
}

interface CulturalIPResult {
  ip_project_id: string
  ip_viability_score: number
  developed_assets: IPAsset[]
  licensing_strategies: LicensingStrategy[]
  brand_extension_roadmap: Array<{ phase: string; timeline: string; deliverables: string[] }>
  risk_assessment: Array<{ risk: string; likelihood: string; mitigation: string }>
  revenue_projection: Record<string, number>
}

// --- Tool 5: Itinerary Personalization ---
interface TravelerProfile {
  traveler_id: string
  group_composition: string
  origin_city: string
  destination: string
  trip_duration_days: number
  budget_per_person: number
  travel_style: string[]
  interests: string[]
  mobility_requirements: string[]
  dietary_preferences: string[]
  pace_preference: string
  previous_destinations: string[]
}

interface ActivitySlot {
  day: number
  time_slot: string
  activity: string
  category: string
  duration_hours: number
  estimated_cost: number
  booking_required: boolean
  notes: string
}

interface ItineraryResult {
  traveler_id: string
  overall_score: number
  daily_itinerary: Array<{ day: number; theme: string; activities: ActivitySlot[] }>
  budget_breakdown: Record<string, number>
  logistics_tips: string[]
  personalization_factors: Array<{ factor: string; influence: string }>
  contingency_plans: string[]
}

// --- Tool 6: Smart Campus Operations ---
interface CampusInputData {
  campus_id: string
  campus_name: string
  total_area_sqm: number
  building_count: number
  student_population: number
  staff_count: number
  current_energy_cost_monthly: number
  security_incidents_ytd: number
  existing_smart_systems: string[]
  operational_budget: number
  priority_areas: string[]
}

interface EnergyOptimization {
  system: string
  current_consumption: number
  optimized_consumption: number
  saving_pct: number
  annual_saving_estimate: number
  implementation_cost: number
}

interface SpaceUtilization {
  space_type: string
  current_utilization_pct: number
  peak_hours: string
  recommended_actions: string[]
  improvement_potential: number
}

interface SmartCampusResult {
  campus_id: string
  operational_efficiency_score: number
  energy_optimizations: EnergyOptimization[]
  space_utilizations: SpaceUtilization[]
  security_recommendations: Array<{ area: string; risk: string; action: string; priority: string }>
  automation_roadmap: Array<{ phase: string; system: string; timeline: string; roi_months: number }>
  annual_savings_forecast: Record<string, number>
}

// --- Tool 7: Performance Art Management ---
interface PerformanceInput {
  project_id: string
  project_name: string
  art_form: string
  genre: string
  target_audience: string[]
  venue_capacity: number
  current_tickets_sold: number
  ticket_price_range: [number, number]
  performance_dates: string[]
  artist_fees: number
  production_budget: number
  marketing_spend: number
}

interface ScheduleOptimization {
  date: string
  ticket_price: number
  expected_demand_pct: number
  revenue_forecast: number
  notes: string
}

interface AudienceEngagement {
  channel: string
  engagement_rate: number
  recommended_content: string
  frequency: string
}

interface PerformanceArtResult {
  project_id: string
  revenue_optimization_score: number
  schedule_optimizations: ScheduleOptimization[]
  pricing_tiers: Array<{ tier: string; price: number; allocation_pct: number; perks: string[] }>
  audience_engagement: AudienceEngagement[]
  risk_factors: Array<{ risk: string; impact: string; mitigation: string }>
  financial_projection: Record<string, number>
}

// --- Tool 8: Event Festival Planner ---
interface FestivalInput {
  event_id: string
  event_name: string
  event_type: string
  location: string
  area_sqm: number
  expected_attendance: number
  duration_days: number
  budget_total: number
  theme_concept: string
  target_demographics: string[]
  season: string
  regulatory_requirements: string[]
}

interface EventSchedule {
  day: number
  time: string
  activity: string
  zone: string
  capacity_needed: number
  staffing_required: number
}

interface PromotionChannel {
  channel: string
  phase: string
  budget_pct: number
  reach_estimate: number
  format: string
}

interface EventFestivalResult {
  event_id: string
  feasibility_score: number
  event_schedule: EventSchedule[]
  layout_zones: Array<{ zone: string; area_pct: string; features: string[] }>
  promotion_plan: PromotionChannel[]
  staffing_plan: Record<string, number>
  budget_allocation: Record<string, number>
  safety_checklist: Array<{ category: string; items: string[] }>
  success_metrics: Array<{ metric: string; target: string; measurement: string }>
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Destination Marketing ---
function analyzeDestinationMarketing(data: string): DestinationMarketingResult {
  const profile: DestinationProfile = JSON.parse(data)
  const rand = rng(profile.destination_id + profile.destination_name + profile.current_annual_visitors)
  const targetSegments: DestinationMarketingResult['target_segments'] = []
  const channels: MarketingChannel[] = []
  const campaignCalendar: DestinationMarketingResult['campaign_calendar'] = []

  // Brand positioning based on USP and type
  const uspTop = profile.unique_selling_points.length > 0 ? profile.unique_selling_points[0] : profile.destination_type
  const brandPositioning = `${profile.destination_name}定位为"${uspTop}"为核心的${profile.destination_type}目的地，差异化竞争关键词：${profile.unique_selling_points.slice(0, 3).join('、')}`
  void brandPositioning

  // Target segments
  if (profile.target_markets.includes('family')) {
    targetSegments.push({ segment: '亲子家庭', priority: 9, message: '安全、教育、亲子互动体验' })
  }
  if (profile.target_markets.includes('youth')) {
    targetSegments.push({ segment: '年轻探索者', priority: 8, message: '社交分享、冒险体验、性价比' })
  }
  if (profile.target_markets.includes('luxury')) {
    targetSegments.push({ segment: '高端休闲客群', priority: 7, message: '私密、品质、定制化服务' })
  }
  if (profile.target_markets.includes('cultural')) {
    targetSegments.push({ segment: '文化深度游旅客', priority: 9, message: '原真性、在地体验、文化沉浸' })
  }
  if (targetSegments.length === 0) {
    targetSegments.push({ segment: '大众休闲旅客', priority: 6, message: '舒适、便利、口碑推荐' })
  }

  // Channel strategy
  const channelOptions = [
    { channel: '短视频/直播', reach: 92, costEff: 85, match: 88 },
    { channel: 'OTA平台', reach: 88, costEff: 75, match: 90 },
    { channel: '社交媒体KOL', reach: 78, costEff: 80, match: 85 },
    { channel: '搜索引擎/内容营销', reach: 70, costEff: 90, match: 75 },
    { channel: '线下推介会', reach: 45, costEff: 60, match: 80 },
    { channel: '自媒体矩阵', reach: 65, costEff: 95, match: 70 }
  ]
  const selectedChannels = channelOptions.slice(0, 4 + Math.floor(rand() * 3))
  for (const ch of selectedChannels) {
    channels.push({
      channel: ch.channel,
      reach_score: Math.min(100, Math.round(ch.reach + rand() * 8 - 4)),
      cost_efficiency: Math.min(100, Math.round(ch.costEff + rand() * 8 - 4)),
      target_match: Math.min(100, Math.round(ch.match + rand() * 8 - 4)),
      recommended_budget_pct: Math.round((1 / selectedChannels.length) * 100 + rand() * 10 - 5)
    })
  }

  // Campaign calendar
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const campaignIdeas = ['春节主题推广', '踏青赏花季', '暑期亲子专场', '国庆黄金周预热', '秋冬季深度体验', '年末感恩回馈']
  const selectedMonths = profile.seasonality_pattern && profile.seasonality_pattern.length >= 2
    ? profile.seasonality_pattern
    : [months[Math.floor(rand() * 12)], months[Math.floor(rand() * 12)], months[Math.floor(rand() * 12)]]
  for (let i = 0; i < Math.min(4, selectedMonths.length); i++) {
    const midx = months.indexOf(selectedMonths[i]) >= 0 ? months.indexOf(selectedMonths[i]) : Math.floor(rand() * 12)
    campaignCalendar.push({
      month: selectedMonths[i],
      campaign: campaignIdeas[midx % campaignIdeas.length],
      channel: channels[i % channels.length].channel,
      budget_pct: Math.round(100 / Math.min(4, selectedMonths.length) + rand() * 5)
    })
  }

  // KPI dashboard
  const awarenessLift = Math.round(5 + rand() * 15)
  const visitorGrowth = Math.round(8 + rand() * 20)
  const kpiDashboard: Record<string, number> = {
    brand_awareness_target: Math.min(95, profile.brand_awareness_pct + awarenessLift),
    visitor_growth_target: visitorGrowth,
    digital_engagement_rate: Math.round(3 + rand() * 7),
    conversion_rate: Math.round((2 + rand() * 4) * 10) / 10,
    marketing_roi: Math.round((3 + rand() * 4) * 10) / 10,
    customer_satisfaction: Math.round((85 + rand() * 10) * 10) / 10
  }

  // ROI forecast
  const revenueLift = profile.current_revenue_million * (visitorGrowth / 100)
  const roiForecast: Record<string, number> = {
    year1_revenue_lift_million: Math.round(revenueLift * 10) / 10,
    year1_roi: Math.round((2.5 + rand() * 2) * 10) / 10,
    year2_roi: Math.round((3.5 + rand() * 2.5) * 10) / 10,
    customer_acquisition_cost: Math.round(50 + rand() * 80),
    Lifetime_value_estimate: Math.round(500 + rand() * 1200)
  }

  return {
    destination_id: profile.destination_id,
    brand_positioning: `${profile.destination_name}：以"${uspTop}"为核心卖点的差异化文旅品牌，聚焦${targetSegments[0]?.segment || '大众'}客群`,
    target_segments: targetSegments,
    channel_strategy: channels,
    campaign_calendar: campaignCalendar,
    kpi_dashboard: kpiDashboard,
    roi_forecast: roiForecast
  }
}

function formatDestinationMarketingReport(r: DestinationMarketingResult): string {
  let out = `=== 目的地营销分析报告 ===\n\n`
  out += `目的地ID: ${r.destination_id}\n`
  out += `品牌定位: ${r.brand_positioning}\n\n`
  out += `--- 目标客群细分 ---\n`
  for (const s of r.target_segments) {
    out += `  [优先级${s.priority}] ${s.segment}: ${s.message}\n`
  }
  out += `\n--- 渠道策略 ---\n`
  for (const c of r.channel_strategy) {
    out += `  ${c.channel}: 触达=${c.reach_score} 成本效率=${c.cost_efficiency} 匹配度=${c.target_match} 预算占比=${c.recommended_budget_pct}%\n`
  }
  out += `\n--- 营销日历 ---\n`
  for (const camp of r.campaign_calendar) {
    out += `  ${camp.month}: ${camp.campaign} (${camp.channel}, 预算${camp.budget_pct}%)\n`
  }
  out += `\n--- KPI目标 ---\n`
  for (const [k, v] of Object.entries(r.kpi_dashboard)) {
    out += `  ${k}: ${v}\n`
  }
  out += `\n--- ROI预测 ---\n`
  for (const [k, v] of Object.entries(r.roi_forecast)) {
    out += `  ${k}: ${v}\n`
  }
  out += `\n${DISCLAIMER}`
  return out
}

// --- Tool 2: Heritage Digitalization ---
function analyzeHeritageDigitalization(data: string): HeritageDigitalizationResult {
  const input: HeritageSiteInput = JSON.parse(data)
  const rand = rng(input.site_id + input.site_name + input.annual_visitors)
  const assetPlan: DigitalAssetPlan[] = []
  const exhibitions: DigitalExhibition[] = []

  // Digital readiness score
  const hasExisting = input.existing_digital_assets.length
  const readinessBase = input.protection_level === 'national' ? 60 : input.protection_level === 'provincial' ? 50 : 40
  const digitalReadiness = Math.min(95, Math.round(readinessBase + hasExisting * 8 + rand() * 15))

  // Asset plan
  const assetOptions: DigitalAssetPlan[] = [
    { asset_type: '3D激光扫描点云', method: '地面三维激光扫描+无人机倾斜摄影', estimated_cost: 80 + Math.round(rand() * 60), timeline_months: 3, priority: 'essential' },
    { asset_type: '高光谱影像采集', method: '多光谱相机+近景摄影测量', estimated_cost: 30 + Math.round(rand() * 20), timeline_months: 2, priority: 'recommended' },
    { asset_type: '数字展陈内容', method: '3D建模+AR/VR交互开发', estimated_cost: 50 + Math.round(rand() * 80), timeline_months: 4, priority: 'essential' },
    { asset_type: '数字档案系统', method: '元数据标准+知识图谱构建', estimated_cost: 20 + Math.round(rand() * 30), timeline_months: 3, priority: 'recommended' },
    { asset_type: '虚拟漫游平台', method: 'WebGL/UE5实时渲染', estimated_cost: 40 + Math.round(rand() * 50), timeline_months: 5, priority: 'optional' },
    { asset_type: 'AI讲解系统', method: 'NLP+知识库+多语言TTS', estimated_cost: 25 + Math.round(rand() * 25), timeline_months: 3, priority: 'recommended' }
  ]
  const budgetFilter = input.budget_range === 'high' ? 6 : input.budget_range === 'medium' ? 4 : 2
  for (let i = 0; i < budgetFilter && i < assetOptions.length; i++) {
    assetPlan.push(assetOptions[i])
  }

  // Exhibitions
  exhibitions.push(
    { title: `${input.site_name}数字沉浸展`, format: 'CAVE空间+全息投影', audience: '全年龄段', interactivity_level: '高', revenue_model: '门票+文创销售' },
    { title: '云端遗产VR体验', format: 'WebVR/移动端VR', audience: '远程访客', interactivity_level: '中', revenue_model: '订阅+单次付费' },
    { title: 'AR实景导览', format: '手机AR叠加', audience: '现场游客', interactivity_level: '高', revenue_model: '免费引流+二销转化' }
  )

  // Preservation risk
  const riskBase = input.current_state === 'deteriorating' ? 75 : input.current_state === 'stable' ? 40 : 20
  const preservationRisk = Math.min(100, Math.round(riskBase + rand() * 15))

  // Visitor engagement forecast
  const engagementForecast: Record<string, number> = {
    digital_visitors_year1: Math.round(input.annual_visitors * (0.3 + rand() * 0.5)),
    physical_visitors_uplift_pct: Math.round(10 + rand() * 20),
    avg_session_duration_min: Math.round(8 + rand() * 15),
    social_shares_estimate: Math.round(5000 + rand() * 20000),
    return_visit_rate: Math.round((15 + rand() * 20) * 10) / 10
  }

  // Investment priority
  const investmentPriority = assetPlan
    .filter(a => a.priority === 'essential')
    .map(a => a.asset_type)
    .concat(['人才培养', '标准规范制定', '可持续运营机制'])

  return {
    site_id: input.site_id,
    digital_readiness_score: digitalReadiness,
    asset_plan: assetPlan,
    exhibitions: exhibitions,
    preservation_risk_index: preservationRisk,
    visitor_engagement_forecast: engagementForecast,
    investment_priority: investmentPriority
  }
}

function formatHeritageDigitalizationReport(r: HeritageDigitalizationResult): string {
  let out = `=== 文化遗产数字化方案 ===\n\n`
  out += `遗产地ID: ${r.site_id}\n`
  out += `数字化就绪度评分: ${r.digital_readiness_score}/100\n`
  out += `保护风险指数: ${r.preservation_risk_index}/100\n\n`
  out += `--- 数字资产建设计划 ---\n`
  for (const a of r.asset_plan) {
    out += `  [${a.priority}] ${a.asset_type}: ${a.method} (预算${a.estimated_cost}万, ${a.timeline_months}个月)\n`
  }
  out += `\n--- 数字展陈方案 ---\n`
  for (const e of r.exhibitions) {
    out += `  ${e.title} (${e.format}) | 受众: ${e.audience} | 交互: ${e.interactivity_level} | 收益: ${e.revenue_model}\n`
  }
  out += `\n--- 访客参与预测 ---\n`
  for (const [k, v] of Object.entries(r.visitor_engagement_forecast)) {
    out += `  ${k}: ${v}\n`
  }
  out += `\n--- 投资优先级 ---\n`
  for (const p of r.investment_priority) {
    out += `  • ${p}\n`
  }
  out += `\n${DISCLAIMER}`
  return out
}

// --- Tool 3: Tourism Revenue Management ---
function analyzeTourismRevenue(data: string): RevenueManagementResult {
  const input: RevenueInputData = JSON.parse(data)
  const rand = rng(input.property_id + input.property_name + input.current_adr)
  const pricingRecs: PricingRecommendation[] = []
  const channelOpt: RevenueManagementResult['channel_optimization'] = []
  const ancillaryOps: RevenueManagementResult['ancillary_revenue_opportunities'] = []

  // Optimized RevPAR
  const adrUplift = 0.05 + rand() * 0.12
  const occupancyUplift = 0.03 + rand() * 0.08
  const optimizedADR = Math.round(input.current_adr * (1 + adrUplift))
  const optimizedOcc = Math.min(0.95, input.current_occupancy + occupancyUplift)
  const optimizedRevPAR = Math.round(optimizedADR * optimizedOcc)
  const revparUpliftPct = Math.round(((optimizedRevPAR - input.current_revpar) / input.current_revpar) * 100)

  // Pricing recommendations
  const seasons = [
    { season: '旺季', range: '7-8月/国庆/春节', multiplier: 1.3 + rand() * 0.3 },
    { season: '平季', range: '4-6月/9-10月', multiplier: 1.0 + rand() * 0.15 },
    { season: '淡季', range: '11-3月', multiplier: 0.7 + rand() * 0.15 }
  ]
  for (const s of seasons) {
    pricingRecs.push({
      season: s.season,
      date_range: s.range,
      recommended_adr: Math.round(input.current_adr * s.multiplier),
      discount_ceiling: Math.round(s.season === '淡季' ? 35 + rand() * 10 : s.season === '平季' ? 15 + rand() * 10 : 5 + rand() * 5),
      length_of_stay_rules: s.season === '淡季' ? '连住3晚享额外8折' : s.season === '平季' ? '连住2晚享早餐' : '最少2晚起订'
    })
  }

  // Channel optimization
  for (const ch of input.distribution_channels) {
    const targetShare = ch.channel === '直销官网' ? Math.min(40, ch.share_pct + 15) :
      ch.channel === 'OTA' ? Math.max(20, ch.share_pct - 5) :
      ch.share_pct + Math.round(rand() * 6 - 3)
    channelOpt.push({
      channel: ch.channel,
      current_share: ch.share_pct,
      target_share: targetShare,
      action: targetShare > ch.share_pct ? '加大投入' : targetShare < ch.share_pct ? '优化成本' : '维持现状'
    })
  }

  // Ancillary revenue
  const ancillaryOptions = [
    { stream: '餐饮升级', uplift: 15 + Math.round(rand() * 20), impl: '主题餐厅+在地美食体验' },
    { stream: '文创商品', uplift: 10 + Math.round(rand() * 15), impl: 'IP联名+在地手工艺' },
    { stream: '体验活动', uplift: 20 + Math.round(rand() * 25), impl: '文化工坊+沉浸式体验' },
    { stream: '增值服务', uplift: 8 + Math.round(rand() * 12), impl: '接送+导游+定制服务' }
  ]
  for (const a of ancillaryOptions) {
    ancillaryOps.push({ stream: a.stream, potential_uplift_pct: a.uplift, implementation: a.impl })
  }

  // Revenue forecast
  const revenueForecast: Record<string, number> = {
    current_annual_revenue: Math.round(input.current_revpar * input.room_count * 365),
    optimized_annual_revenue: Math.round(optimizedRevPAR * input.room_count * 365),
    revenue_uplift_pct: revparUpliftPct,
    ancillary_revenue_potential: Math.round(input.current_revpar * input.room_count * 365 * 0.15 * (1 + rand() * 0.3)),
    payback_period_months: Math.round(6 + rand() * 12)
  }

  return {
    property_id: input.property_id,
    optimized_revpar: optimizedRevPAR,
    revpar_uplift_pct: revparUpliftPct,
    pricing_recommendations: pricingRecs,
    channel_optimization: channelOpt,
    ancillary_revenue_opportunities: ancillaryOps,
    revenue_forecast: revenueForecast
  }
}

function formatTourismRevenueReport(r: RevenueManagementResult): string {
  let out = `=== 旅游收益管理分析报告 ===\n\n`
  out += `物业ID: ${r.property_id}\n`
  out += `优化后RevPAR: ${r.optimized_revpar}元 (提升${r.revpar_uplift_pct}%)\n\n`
  out += `--- 动态定价建议 ---\n`
  for (const p of r.pricing_recommendations) {
    out += `  ${p.season}(${p.date_range}): 建议ADR ${p.recommended_adr}元, 最大折扣${p.discount_ceiling}%, ${p.length_of_stay_rules}\n`
  }
  out += `\n--- 渠道优化 ---\n`
  for (const c of r.channel_optimization) {
    out += `  ${c.channel}: ${c.current_share}% → ${c.target_share}% (${c.action})\n`
  }
  out += `\n--- 二销提升机会 ---\n`
  for (const a of r.ancillary_revenue_opportunities) {
    out += `  ${a.stream}: 潜在提升${a.potential_uplift_pct}% | ${a.implementation}\n`
  }
  out += `\n--- 收益预测 ---\n`
  for (const [k, v] of Object.entries(r.revenue_forecast)) {
    out += `  ${k}: ${v}\n`
  }
  out += `\n${DISCLAIMER}`
  return out
}

// --- Tool 4: Cultural IP Developer ---
function analyzeCulturalIP(data: string): CulturalIPResult {
  const input: IPDiscoveryInput = JSON.parse(data)
  const rand = rng(input.ip_project_id + input.cultural_source + input.ip_category)
  const assets: IPAsset[] = []
  const licensing: LicensingStrategy[] = []
  const roadmap: CulturalIPResult['brand_extension_roadmap'] = []
  const risks: CulturalIPResult['risk_assessment'] = []

  // IP viability score
  const sourceStrength = input.cultural_source.length > 4 ? 70 : 50
  const viabilityScore = Math.min(95, Math.round(sourceStrength + input.commercial_goals.length * 5 + rand() * 20))

  // Developed assets
  const assetOptions: IPAsset[] = [
    { asset_name: `${input.cultural_source}主IP形象`, asset_type: '视觉形象', development_cost: 30 + Math.round(rand() * 40), revenue_potential: 80 + Math.round(rand() * 40), brand_alignment: 95, protection_status: '商标注册中' },
    { asset_name: 'IP表情包/贴纸包', asset_type: '数字内容', development_cost: 5 + Math.round(rand() * 10), revenue_potential: 20 + Math.round(rand() * 30), brand_alignment: 85, protection_status: '已完成' },
    { asset_name: 'IP动画短片', asset_type: '影视内容', development_cost: 50 + Math.round(rand() * 80), revenue_potential: 60 + Math.round(rand() * 60), brand_alignment: 90, protection_status: '版权登记中' },
    { asset_name: 'IP文创礼盒', asset_type: '实体商品', development_cost: 20 + Math.round(rand() * 30), revenue_potential: 70 + Math.round(rand() * 50), brand_alignment: 88, protection_status: '外观专利已申请' },
    { asset_name: 'IP沉浸式体验空间', asset_type: '空间体验', development_cost: 100 + Math.round(rand() * 150), revenue_potential: 90 + Math.round(rand() * 60), brand_alignment: 92, protection_status: '商业秘密保护' }
  ]
  const budgetFilter = input.budget_tier === 'high' ? 5 : input.budget_tier === 'medium' ? 3 : 2
  for (let i = 0; i < budgetFilter && i < assetOptions.length; i++) {
    assets.push(assetOptions[i])
  }

  // Licensing strategies
  const licensingOptions: LicensingStrategy[] = [
    { category: '文创商品', partner_type: '品牌联名', royalty_rate: 8 + Math.round(rand() * 5), estimated_annual_revenue: 50 + Math.round(rand() * 100), exclusivity: '非独家' },
    { category: '食品饮料', partner_type: '快消品牌', royalty_rate: 5 + Math.round(rand() * 3), estimated_annual_revenue: 80 + Math.round(rand() * 120), exclusivity: '品类独家' },
    { category: '数字藏品', partner_type: 'NFT平台', royalty_rate: 10 + Math.round(rand() * 5), estimated_annual_revenue: 30 + Math.round(rand() * 60), exclusivity: '限时独家' },
    { category: '文旅空间', partner_type: '景区/商业体', royalty_rate: 6 + Math.round(rand() * 4), estimated_annual_revenue: 100 + Math.round(rand() * 150), exclusivity: '区域独家' }
  ]
  for (const l of licensingOptions.slice(0, 2 + Math.floor(rand() * 3))) {
    licensing.push(l)
  }

  // Roadmap
  roadmap.push({ phase: 'Phase 1: IP孵化', timeline: '0-6个月', deliverables: ['IP形象定稿', '核心内容生产', '商标注册'] })
  roadmap.push({ phase: 'Phase 2:市场验证', timeline: '6-12个月', deliverables: ['首批文创上市', '联名合作落地', '社群运营启动'] })
  roadmap.push({ phase: 'Phase 3:生态扩展', timeline: '12-24个月', deliverables: ['IP宇宙构建', '沉浸式体验空间', '授权体系完善'] })

  // Risks
  risks.push({ risk: '文化误读/过度商业化', likelihood: '中', mitigation: '建立文化顾问委员会，确保内容尊重原真性' })
  risks.push({ risk: 'IP侵权/被抄袭', likelihood: '高', mitigation: '全类别商标注册+数字版权存证+监测维权体系' })
  risks.push({ risk: '市场热度衰减', likelihood: '中', mitigation: '持续内容迭代+跨界联名+社群运营' })
  risks.push({ risk: '政策合规风险', likelihood: '低', mitigation: '合规审查机制+内容分级管理' })

  // Revenue projection
  const totalLicensing = licensing.reduce((s, l) => s + l.estimated_annual_revenue, 0)
  const revenueProjection: Record<string, number> = {
    year1_revenue: Math.round(totalLicensing * 0.4 + rand() * 30),
    year2_revenue: Math.round(totalLicensing * 0.8 + rand() * 50),
    year3_revenue: Math.round(totalLicensing * 1.2 + rand() * 80),
    licensing_income_pct: Math.round((totalLicensing / (totalLicensing + 100)) * 100),
    brand_value_estimate: Math.round(200 + rand() * 500)
  }

  return {
    ip_project_id: input.ip_project_id,
    ip_viability_score: viabilityScore,
    developed_assets: assets,
    licensing_strategies: licensing,
    brand_extension_roadmap: roadmap,
    risk_assessment: risks,
    revenue_projection: revenueProjection
  }
}

function formatCulturalIPReport(r: CulturalIPResult): string {
  let out = `=== 文化IP开发分析报告 ===\n\n`
  out += `项目ID: ${r.ip_project_id}\n`
  out += `IP可行性评分: ${r.ip_viability_score}/100\n\n`
  out += `--- IP资产开发 ---\n`
  for (const a of r.developed_assets) {
    out += `  ${a.asset_name} (${a.asset_type}) | 开发成本: ${a.development_cost}万 | 收益潜力: ${a.revenue_potential} | 保护: ${a.protection_status}\n`
  }
  out += `\n--- 授权策略 ---\n`
  for (const l of r.licensing_strategies) {
    out += `  ${l.category} → ${l.partner_type}: 版税${l.royalty_rate}% | 预估年收入${l.estimated_annual_revenue}万 | ${l.exclusivity}\n`
  }
  out += `\n--- 品牌延展路线图 ---\n`
  for (const rd of r.brand_extension_roadmap) {
    out += `  ${rd.phase} (${rd.timeline}): ${rd.deliverables.join('、')}\n`
  }
  out += `\n--- 风险评估 ---\n`
  for (const rk of r.risk_assessment) {
    out += `  [${rk.likelihood}] ${rk.risk}: ${rk.mitigation}\n`
  }
  out += `\n--- 收益预测 ---\n`
  for (const [k, v] of Object.entries(r.revenue_projection)) {
    out += `  ${k}: ${v}\n`
  }
  out += `\n${DISCLAIMER}`
  return out
}

// --- Tool 5: Itinerary Personalization ---
function analyzeItinerary(data: string): ItineraryResult {
  const profile: TravelerProfile = JSON.parse(data)
  const rand = rng(profile.traveler_id + profile.destination + profile.trip_duration_days)
  const dailyItinerary: ItineraryResult['daily_itinerary'] = []
  const budgetBreakdown: Record<string, number> = {}
  const logisticsTips: string[] = []
  const personalizationFactors: ItineraryResult['personalization_factors'] = []
  const contingencyPlans: string[] = []

  // Overall score
  const overallScore = Math.min(95, Math.round(70 + profile.interests.length * 3 + rand() * 15))

  // Generate daily activities
  const activityPool = [
    { activity: '地标景点深度游览', category: '文化', duration: 3, costFactor: 0.15 },
    { activity: '在地美食体验', category: '美食', duration: 2, costFactor: 0.2 },
    { activity: '博物馆/美术馆', category: '文化', duration: 2, costFactor: 0.08 },
    { activity: '自然风光徒步', category: '户外', duration: 3, costFactor: 0.05 },
    { activity: '文创市集探索', category: '购物', duration: 2, costFactor: 0.12 },
    { activity: '非遗工坊体验', category: '体验', duration: 2, costFactor: 0.1 },
    { activity: '夜景观光', category: '休闲', duration: 1.5, costFactor: 0.06 },
    { activity: '当地节庆活动', category: '文化', duration: 2.5, costFactor: 0.08 },
    { activity: '特色住宿体验', category: '住宿', duration: 0, costFactor: 0.25 },
    { activity: '自由探索时间', category: '休闲', duration: 2, costFactor: 0.03 }
  ]

  const paceMultiplier = profile.pace_preference === 'relaxed' ? 0.7 : profile.pace_preference === 'intensive' ? 1.3 : 1.0
  const dailyThemes = ['初识目的地', '文化深度', '自然探索', '在地生活', '艺术人文', '休闲收尾', '自由探索']

  for (let day = 1; day <= profile.trip_duration_days; day++) {
    const dayActivities: ActivitySlot[] = []
    const theme = dailyThemes[(day - 1) % dailyThemes.length]
    const slots = ['上午', '下午', '晚间']
    const activitiesPerDay = Math.max(2, Math.round(3 * paceMultiplier + rand()))

    for (let s = 0; s < Math.min(slots.length, activitiesPerDay); s++) {
      const poolIdx = Math.floor(rand() * activityPool.length)
      const act = activityPool[poolIdx]
      dayActivities.push({
        day: day,
        time_slot: slots[s],
        activity: act.activity,
        category: act.category,
        duration_hours: act.duration,
        estimated_cost: Math.round(profile.budget_per_person * act.costFactor * (0.8 + rand() * 0.4)),
        booking_required: rand() > 0.6,
        notes: `${profile.destination}热门推荐`
      })
    }
    dailyItinerary.push({ day, theme, activities: dayActivities })
  }

  // Budget breakdown
  const totalBudget = profile.budget_per_person * profile.trip_duration_days
  budgetBreakdown['住宿'] = Math.round(totalBudget * 0.3)
  budgetBreakdown['餐饮'] = Math.round(totalBudget * 0.25)
  budgetBreakdown['门票/体验'] = Math.round(totalBudget * 0.2)
  budgetBreakdown['交通'] = Math.round(totalBudget * 0.15)
  budgetBreakdown['购物/其他'] = Math.round(totalBudget * 0.1)

  // Logistics tips
  logisticsTips.push(`建议提前预订热门景点门票，${profile.destination}旺季排队时间较长`)
  if (profile.mobility_requirements.length > 0) {
    logisticsTips.push(`无障碍需求已标注，已筛选适合的活动路线`)
  }
  logisticsTips.push(`当地公共交通便利，推荐使用一日通票节省交通费用`)
  logisticsTips.push(`建议下载离线地图，部分景区信号覆盖不佳`)

  // Personalization factors
  for (const interest of profile.interests.slice(0, 4)) {
    personalizationFactors.push({ factor: interest, influence: `已优先安排${interest}相关体验活动` })
  }
  personalizationFactors.push({ factor: `节奏偏好: ${profile.pace_preference}`, influence: `每日活动数量已调整为${profile.pace_preference === 'relaxed' ? '轻松' : profile.pace_preference === 'intensive' ? '紧凑' : '适中'}` })

  // Contingency plans
  contingencyPlans.push('恶劣天气备选：室内博物馆/商场/温泉方案')
  contingencyPlans.push('体力不支备选：减少步行，增加观光车/出租车')
  contingencyPlans.push('热门景点满员备选：同类型替代景点清单已准备')

  return {
    traveler_id: profile.traveler_id,
    overall_score: overallScore,
    daily_itinerary: dailyItinerary,
    budget_breakdown: budgetBreakdown,
    logistics_tips: logisticsTips,
    personalization_factors: personalizationFactors,
    contingency_plans: contingencyPlans
  }
}

function formatItineraryReport(r: ItineraryResult): string {
  let out = `=== 个性化行程规划报告 ===\n\n`
  out += `旅客ID: ${r.traveler_id}\n`
  out += `行程匹配度评分: ${r.overall_score}/100\n\n`
  out += `--- 每日行程 ---\n`
  for (const day of r.daily_itinerary) {
    out += `  Day ${day.day} [${day.theme}]\n`
    for (const act of day.activities) {
      out += `    ${act.time_slot}: ${act.activity} (${act.category}, ${act.duration_hours}h, 约${act.estimated_cost}元${act.booking_required ? ', 需预约' : ''})\n`
    }
  }
  out += `\n--- 预算分配 ---\n`
  for (const [k, v] of Object.entries(r.budget_breakdown)) {
    out += `  ${k}: ${v}元\n`
  }
  out += `\n--- 个性化因素 ---\n`
  for (const pf of r.personalization_factors) {
    out += `  ${pf.factor}: ${pf.influence}\n`
  }
  out += `\n--- 出行贴士 ---\n`
  for (const tip of r.logistics_tips) {
    out += `  • ${tip}\n`
  }
  out += `\n--- 应急预案 ---\n`
  for (const cp of r.contingency_plans) {
    out += `  • ${cp}\n`
  }
  out += `\n${DISCLAIMER}`
  return out
}

// --- Tool 6: Smart Campus Operations ---
function analyzeSmartCampus(data: string): SmartCampusResult {
  const input: CampusInputData = JSON.parse(data)
  const rand = rng(input.campus_id + input.campus_name + input.student_population)
  const energyOpts: EnergyOptimization[] = []
  const spaceUtils: SpaceUtilization[] = []
  const securityRecs: SmartCampusResult['security_recommendations'] = []
  const automationRoadmap: SmartCampusResult['automation_roadmap'] = []

  // Operational efficiency score
  const hasSmartBase = input.existing_smart_systems.length
  const efficiencyScore = Math.min(95, Math.round(40 + hasSmartBase * 8 + (input.operational_budget / 100) + rand() * 15))

  // Energy optimizations
  const energySystems = [
    { system: '照明系统', current: 25 + rand() * 15, saving: 30 + rand() * 20 },
    { system: '空调暖通', current: 40 + rand() * 20, saving: 20 + rand() * 15 },
    { system: '热水系统', current: 15 + rand() * 10, saving: 25 + rand() * 15 },
    { system: '光伏发电', current: 5 + rand() * 5, saving: 40 + rand() * 20 }
  ]
  for (const es of energySystems) {
    const savingPct = Math.round(es.saving)
    energyOpts.push({
      system: es.system,
      current_consumption: Math.round(es.current * input.current_energy_cost_monthly / 100),
      optimized_consumption: Math.round(es.current * input.current_energy_cost_monthly / 100 * (1 - savingPct / 100)),
      saving_pct: savingPct,
      annual_saving_estimate: Math.round(es.current * input.current_energy_cost_monthly * 12 * savingPct / 10000),
      implementation_cost: Math.round(20 + rand() * 60)
    })
  }

  // Space utilization
  const spaceTypes = [
    { type: '教室', util: 45 + rand() * 25, peak: '8:00-18:00', actions: ['智能排课系统', '空闲时段开放预约', '共享教室机制'], potential: 20 + Math.round(rand() * 20) },
    { type: '图书馆', util: 55 + rand() * 30, peak: '10:00-21:00', actions: ['座位预约系统', '24h开放区域', '数字资源扩容'], potential: 15 + Math.round(rand() * 15) },
    { type: '实验室', util: 35 + rand() * 25, peak: '9:00-17:00', actions: ['设备共享平台', '预约管理系统', '虚拟仿真实验'], potential: 25 + Math.round(rand() * 20) },
    { type: '体育场馆', util: 30 + rand() * 30, peak: '16:00-21:00', actions: ['线上预约', '分时段定价', '校外开放'], potential: 30 + Math.round(rand() * 20) },
    { type: '食堂', util: 60 + rand() * 25, peak: '11:30-13:00, 17:30-19:00', actions: ['智能点餐', '错峰就餐引导', '菜品推荐'], potential: 10 + Math.round(rand() * 10) }
  ]
  for (const st of spaceTypes) {
    spaceUtils.push({ space_type: st.type, current_utilization_pct: Math.round(st.util), peak_hours: st.peak, recommended_actions: st.actions, improvement_potential: st.potential })
  }

  // Security recommendations
  securityRecs.push({ area: '校门出入口', risk: '外来人员管理', action: '人脸识别闸机+访客预约系统', priority: '高' })
  securityRecs.push({ area: '宿舍区', risk: '晚归/违规用电', action: '智能门禁+用电监测', priority: '高' })
  securityRecs.push({ area: '公共区域', risk: '突发事件响应', action: 'AI视频分析+一键报警', priority: '中' })
  securityRecs.push({ area: '实验室', risk: '危险品管理', action: '智能柜+使用追踪', priority: '中' })

  // Automation roadmap
  automationRoadmap.push({ phase: 'Phase 1', system: '智能照明+空调控制', timeline: '0-6个月', roi_months: Math.round(12 + rand() * 6) })
  automationRoadmap.push({ phase: 'Phase 2', system: '安防AI+门禁系统', timeline: '6-12个月', roi_months: Math.round(18 + rand() * 6) })
  automationRoadmap.push({ phase: 'Phase 3', system: '能源管理平台', timeline: '12-18个月', roi_months: Math.round(24 + rand() * 6) })
  automationRoadmap.push({ phase: 'Phase 4', system: '数字孪生校园', timeline: '18-24个月', roi_months: Math.round(30 + rand() * 12) })

  // Annual savings forecast
  const totalEnergySaving = energyOpts.reduce((s, e) => s + e.annual_saving_estimate, 0)
  const annualSavings: Record<string, number> = {
    energy_savings: totalEnergySaving,
    labor_savings: Math.round(30 + rand() * 50),
    maintenance_savings: Math.round(15 + rand() * 25),
    space_efficiency_gain: Math.round(20 + rand() * 30),
    total_annual_savings: totalEnergySaving + Math.round(50 + rand() * 80)
  }

  return {
    campus_id: input.campus_id,
    operational_efficiency_score: efficiencyScore,
    energy_optimizations: energyOpts,
    space_utilizations: spaceUtils,
    security_recommendations: securityRecs,
    automation_roadmap: automationRoadmap,
    annual_savings_forecast: annualSavings
  }
}

function formatSmartCampusReport(r: SmartCampusResult): string {
  let out = `=== 智慧校园运营分析报告 ===\n\n`
  out += `校园ID: ${r.campus_id}\n`
  out += `运营效率评分: ${r.operational_efficiency_score}/100\n\n`
  out += `--- 能耗优化 ---\n`
  for (const e of r.energy_optimizations) {
    out += `  ${e.system}: ${e.current_consumption} → ${e.optimized_consumption}元/月 (节省${e.saving_pct}%, 年省${e.annual_saving_estimate}万, 投入${e.implementation_cost}万)\n`
  }
  out += `\n--- 空间利用率 ---\n`
  for (const s of r.space_utilizations) {
    out += `  ${s.space_type}: 利用率${s.current_utilization_pct}% | 高峰: ${s.peak_hours} | 提升潜力: ${s.improvement_potential}%\n`
    out += `    建议: ${s.recommended_actions.join('、')}\n`
  }
  out += `\n--- 安防建议 ---\n`
  for (const sr of r.security_recommendations) {
    out += `  [${sr.priority}] ${sr.area}: ${sr.action} (风险: ${sr.risk})\n`
  }
  out += `\n--- 自动化路线图 ---\n`
  for (const ar of r.automation_roadmap) {
    out += `  ${ar.phase}: ${ar.system} (${ar.timeline}, ROI ${ar.roi_months}个月)\n`
  }
  out += `\n--- 年度节省预测 ---\n`
  for (const [k, v] of Object.entries(r.annual_savings_forecast)) {
    out += `  ${k}: ${v}万元\n`
  }
  out += `\n${DISCLAIMER}`
  return out
}

// --- Tool 7: Performance Art Management ---
function analyzePerformanceArt(data: string): PerformanceArtResult {
  const input: PerformanceInput = JSON.parse(data)
  const rand = rng(input.project_id + input.project_name + input.art_form)
  const scheduleOpts: ScheduleOptimization[] = []
  const pricingTiers: PerformanceArtResult['pricing_tiers'] = []
  const audienceEng: PerformanceArtResult['audience_engagement'] = []
  const riskFactors: PerformanceArtResult['risk_factors'] = []

  // Revenue optimization score
  const sellRate = input.current_tickets_sold / input.venue_capacity
  const revenueScore = Math.min(95, Math.round(sellRate * 60 + (input.production_budget > 0 ? 20 : 0) + rand() * 20))

  // Schedule optimizations
  for (const date of input.performance_dates) {
    const demandPct = Math.min(100, Math.round(50 + rand() * 45))
    const priceMult = 0.9 + rand() * 0.4
    const avgPrice = Math.round((input.ticket_price_range[0] + input.ticket_price_range[1]) / 2 * priceMult)
    scheduleOpts.push({
      date: date,
      ticket_price: avgPrice,
      expected_demand_pct: demandPct,
      revenue_forecast: Math.round(avgPrice * input.venue_capacity * demandPct / 100),
      notes: demandPct > 80 ? '热门场次，建议加座' : demandPct > 50 ? '正常销售' : '需加强营销'
    })
  }

  // Pricing tiers
  pricingTiers.push({ tier: 'VIP', price: Math.round(input.ticket_price_range[1] * 1.5), allocation_pct: 10, perks: ['前排座位', '演后见面', '限定周边'] })
  pricingTiers.push({ tier: '一等', price: input.ticket_price_range[1], allocation_pct: 25, perks: ['优质视野', '节目册'] })
  pricingTiers.push({ tier: '二等', price: Math.round((input.ticket_price_range[0] + input.ticket_price_range[1]) / 2), allocation_pct: 35, perks: ['标准座位'] })
  pricingTiers.push({ tier: '学生/早鸟', price: input.ticket_price_range[0], allocation_pct: 30, perks: ['优惠价格', '先到先得'] })

  // Audience engagement
  audienceEng.push({ channel: '短视频预告', engagement_rate: Math.round(5 + rand() * 8), recommended_content: '幕后花絮+演员访谈', frequency: '每周2-3条' })
  audienceEng.push({ channel: '微信公众号', engagement_rate: Math.round(3 + rand() * 5), recommended_content: '深度剧评+主创手记', frequency: '每周1-2篇' })
  audienceEng.push({ channel: '小红书种草', engagement_rate: Math.round(4 + rand() * 7), recommended_content: '打卡攻略+精美剧照', frequency: '每周3-4条' })
  audienceEng.push({ channel: '粉丝社群', engagement_rate: Math.round(8 + rand() * 10), recommended_content: '独家福利+互动问答', frequency: '每日运营' })

  // Risk factors
  riskFactors.push({ risk: '上座率不足', impact: '收入下降30-50%', mitigation: '动态定价+企业包场+惠民票' })
  riskFactors.push({ risk: '演员/主创变动', impact: '演出质量受损', mitigation: 'AB角机制+合同约束' })
  riskFactors.push({ risk: '天气/不可抗力', impact: '场次取消', mitigation: '演出保险+延期方案' })
  riskFactors.push({ risk: '舆情风险', impact: '品牌受损', mitigation: '舆情监测+危机公关预案' })

  // Financial projection
  const totalRevenue = scheduleOpts.reduce((s, d) => s + d.revenue_forecast, 0)
  const totalCost = input.artist_fees + input.production_budget + input.marketing_spend
  const financialProjection: Record<string, number> = {
    projected_total_revenue: totalRevenue,
    total_cost: totalCost,
    net_profit: totalRevenue - totalCost,
    profit_margin_pct: Math.round((totalRevenue - totalCost) / totalRevenue * 100),
    break_even_audience_pct: Math.round(totalCost / (totalRevenue / (input.venue_capacity * input.performance_dates.length)) / input.venue_capacity * 100),
    roi_pct: Math.round((totalRevenue - totalCost) / totalCost * 100)
  }

  return {
    project_id: input.project_id,
    revenue_optimization_score: revenueScore,
    schedule_optimizations: scheduleOpts,
    pricing_tiers: pricingTiers,
    audience_engagement: audienceEng,
    risk_factors: riskFactors,
    financial_projection: financialProjection
  }
}

function formatPerformanceArtReport(r: PerformanceArtResult): string {
  let out = `=== 演艺项目管理分析报告 ===\n\n`
  out += `项目ID: ${r.project_id}\n`
  out += `收益优化评分: ${r.revenue_optimization_score}/100\n\n`
  out += `--- 排期优化 ---\n`
  for (const s of r.schedule_optimizations) {
    out += `  ${s.date}: 票价${s.ticket_price}元 | 预期需求${s.expected_demand_pct}% | 收入预测${s.revenue_forecast}元 | ${s.notes}\n`
  }
  out += `\n--- 票价分层 ---\n`
  for (const pt of r.pricing_tiers) {
    out += `  ${pt.tier}: ${pt.price}元 (占比${pt.allocation_pct}%) | 权益: ${pt.perks.join('、')}\n`
  }
  out += `\n--- 观众互动策略 ---\n`
  for (const ae of r.audience_engagement) {
    out += `  ${ae.channel}: 互动率${ae.engagement_rate}% | ${ae.recommended_content} | 频率: ${ae.frequency}\n`
  }
  out += `\n--- 风险因素 ---\n`
  for (const rf of r.risk_factors) {
    out += `  ${rf.risk} (影响: ${rf.impact}): ${rf.mitigation}\n`
  }
  out += `\n--- 财务预测 ---\n`
  for (const [k, v] of Object.entries(r.financial_projection)) {
    out += `  ${k}: ${v}\n`
  }
  out += `\n${DISCLAIMER}`
  return out
}

// --- Tool 8: Event Festival Planner ---
function analyzeEventFestival(data: string): EventFestivalResult {
  const input: FestivalInput = JSON.parse(data)
  const rand = rng(input.event_id + input.event_name + input.expected_attendance)
  const eventSchedule: EventSchedule[] = []
  const layoutZones: EventFestivalResult['layout_zones'] = []
  const promotionPlan: PromotionChannel[] = []
  const staffingPlan: Record<string, number> = {}
  const budgetAllocation: Record<string, number> = {}
  const safetyChecklist: EventFestivalResult['safety_checklist'] = []
  const successMetrics: EventFestivalResult['success_metrics'] = []

  // Feasibility score
  const budgetPerAttendee = input.budget_total / Math.max(input.expected_attendance, 1)
  const feasibilityScore = Math.min(95, Math.round(
    (budgetPerAttendee > 50 ? 30 : 20) +
    (input.duration_days <= 3 ? 20 : 10) +
    (input.area_sqm / Math.max(input.expected_attendance, 1) > 2 ? 20 : 10) +
    rand() * 25
  ))

  // Event schedule
  const timeSlots = ['09:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00', '19:00-21:00']
  const activityOptions = ['开幕式/启动仪式', '主题演出', '互动体验区', '文化市集', '美食街区', '工作坊/讲座', '灯光秀/闭幕式', '亲子活动区', '艺术展览', '签售/见面会']
  for (let day = 1; day <= input.duration_days; day++) {
    for (let t = 0; t < Math.min(timeSlots.length, 3 + Math.floor(rand() * 3)); t++) {
      eventSchedule.push({
        day: day,
        time: timeSlots[t],
        activity: activityOptions[Math.floor(rand() * activityOptions.length)],
        zone: `Zone ${String.fromCharCode(65 + Math.floor(rand() * 4))}`,
        capacity_needed: Math.round(input.expected_attendance / input.duration_days / timeSlots.length * (0.8 + rand() * 0.4)),
        staffing_required: Math.round(5 + rand() * 15)
      })
    }
  }

  // Layout zones
  layoutZones.push({ zone: '主舞台区', area_pct: '20%', features: ['主舞台', 'LED大屏', '音响系统', '观众区'] })
  layoutZones.push({ zone: '文化市集区', area_pct: '25%', features: ['标准展位', '主题装饰', '互动装置'] })
  layoutZones.push({ zone: '美食餐饮区', area_pct: '15%', features: ['餐饮摊位', '就餐区', '垃圾分类'] })
  layoutZones.push({ zone: '互动体验区', area_pct: '20%', features: ['VR/AR体验', '手工工坊', '打卡点'] })
  layoutZones.push({ zone: '服务区', area_pct: '10%', features: ['医疗点', '失物招领', '母婴室', '充电站'] })
  layoutZones.push({ zone: '后勤保障区', area_pct: '10%', features: ['仓储', '工作人员通道', '安保指挥'] })

  // Promotion plan
  promotionPlan.push({ channel: '社交媒体预热', phase: '活动前30天', budget_pct: 20, reach_estimate: Math.round(input.expected_attendance * 3), format: '短视频+海报' })
  promotionPlan.push({ channel: 'KOL/KOC种草', phase: '活动前15天', budget_pct: 25, reach_estimate: Math.round(input.expected_attendance * 5), format: '探店/探展vlog' })
  promotionPlan.push({ channel: '本地生活平台', phase: '活动前7天', budget_pct: 15, reach_estimate: Math.round(input.expected_attendance * 2), format: '活动页+优惠券' })
  promotionPlan.push({ channel: '线下广告', phase: '活动前7天', budget_pct: 15, reach_estimate: Math.round(input.expected_attendance * 1.5), format: '地铁/公交站牌' })
  promotionPlan.push({ channel: '现场直播', phase: '活动期间', budget_pct: 10, reach_estimate: Math.round(input.expected_attendance * 4), format: '多平台直播' })
  promotionPlan.push({ channel: '长尾传播', phase: '活动后7天', budget_pct: 15, reach_estimate: Math.round(input.expected_attendance * 6), format: 'UGC合集+深度报道' })

  // Staffing plan
  staffingPlan['现场总指挥'] = 1
  staffingPlan['舞台工作人员'] = Math.round(5 + rand() * 10)
  staffingPlan['安保人员'] = Math.round(input.expected_attendance / 100 + rand() * 10)
  staffingPlan['志愿者'] = Math.round(input.expected_attendance / 50 + rand() * 20)
  staffingPlan['医疗人员'] = Math.round(2 + rand() * 4)
  staffingPlan['清洁人员'] = Math.round(input.area_sqm / 500 + rand() * 5)
  staffingPlan['票务/引导'] = Math.round(4 + rand() * 8)

  // Budget allocation
  budgetAllocation['场地租赁'] = Math.round(input.budget_total * 0.2)
  budgetAllocation['舞台搭建'] = Math.round(input.budget_total * 0.15)
  budgetAllocation['演出/嘉宾费用'] = Math.round(input.budget_total * 0.2)
  budgetAllocation['营销推广'] = Math.round(input.budget_total * 0.15)
  budgetAllocation['安保/医疗'] = Math.round(input.budget_total * 0.08)
  budgetAllocation['物料制作'] = Math.round(input.budget_total * 0.07)
  budgetAllocation['人员补贴'] = Math.round(input.budget_total * 0.08)
  budgetAllocation['应急储备'] = Math.round(input.budget_total * 0.07)

  // Safety checklist
  safetyChecklist.push({ category: '消防安全', items: ['灭火器配置', '疏散通道标识', '消防审批文件', '义务消防队'] })
  safetyChecklist.push({ category: '人员安全', items: ['人流管控方案', '应急疏散预案', '医疗急救点', '防踩踏措施'] })
  safetyChecklist.push({ category: '食品安全', items: ['摊位卫生许可', '食材溯源', '餐具消毒', '过敏原标注'] })
  safetyChecklist.push({ category: '设施安全', items: ['临时建筑检测', '电气安全', '舞台结构安全', '天气应对方案'] })

  // Success metrics
  successMetrics.push({ metric: '实际到场人数', target: `${input.expected_attendance}人`, measurement: '票务系统+现场计数' })
  successMetrics.push({ metric: '社交媒体曝光量', target: `${input.expected_attendance * 10}次`, measurement: '各平台数据汇总' })
  successMetrics.push({ metric: '参与者满意度', target: '≥85%', measurement: '现场问卷+线上评价' })
  successMetrics.push({ metric: '预算执行率', target: '90-105%', measurement: '财务核算' })
  successMetrics.push({ metric: '安全事故', target: '0起', measurement: '安全台账' })

  return {
    event_id: input.event_id,
    feasibility_score: feasibilityScore,
    event_schedule: eventSchedule,
    layout_zones: layoutZones,
    promotion_plan: promotionPlan,
    staffing_plan: staffingPlan,
    budget_allocation: budgetAllocation,
    safety_checklist: safetyChecklist,
    success_metrics: successMetrics
  }
}

function formatEventFestivalReport(r: EventFestivalResult): string {
  let out = `=== 节庆活动策划方案 ===\n\n`
  out += `活动ID: ${r.event_id}\n`
  out += `可行性评分: ${r.feasibility_score}/100\n\n`
  out += `--- 活动日程 ---\n`
  for (const es of r.event_schedule) {
    out += `  Day${es.day} ${es.time}: ${es.activity} (${es.zone}, 容量${es.capacity_needed}人, 需${es.staffing_required}人)\n`
  }
  out += `\n--- 空间布局 ---\n`
  for (const z of r.layout_zones) {
    out += `  ${z.zone} (${z.area_pct}): ${z.features.join('、')}\n`
  }
  out += `\n--- 传播计划 ---\n`
  for (const p of r.promotion_plan) {
    out += `  ${p.channel} ({p.phase}): 预算${p.budget_pct}% | 预估触达${p.reach_estimate}人 | ${p.format}\n`
  }
  out += `\n--- 人员配置 ---\n`
  for (const [k, v] of Object.entries(r.staffing_plan)) {
    out += `  ${k}: ${v}人\n`
  }
  out += `\n--- 预算分配 ---\n`
  for (const [k, v] of Object.entries(r.budget_allocation)) {
    out += `  ${k}: ${v}元\n`
  }
  out += `\n--- 安全清单 ---\n`
  for (const sc of r.safety_checklist) {
    out += `  ${sc.category}: ${sc.items.join('、')}\n`
  }
  out += `\n--- 成功指标 ---\n`
  for (const sm of r.success_metrics) {
    out += `  ${sm.metric}: 目标${sm.target} | 测量: ${sm.measurement}\n`
  }
  out += `\n${DISCLAIMER}`
  return out
}

// ==================== SECTION 4 — Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'destination_marketing',
    description: '目的地营销 | 品牌定位/渠道策略/客群触达/营销日历/ROI预测',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 目的地档案(名称/类型/客群/竞品/USP/预算等)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatDestinationMarketingReport(analyzeDestinationMarketing(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'heritage_digitalization',
    description: '遗产数字化 | 3D采集/数字展陈/活化利用/保护风险评估',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 遗产地信息(类型/保护等级/现状/预算/需求)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatHeritageDigitalizationReport(analyzeHeritageDigitalization(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'tourism_revenue_mgmt',
    description: '旅游收益管理 | 动态定价/渠道优化/二销提升/RevPAR优化',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 物业收益数据(ADR/入住率/RevPAR/渠道/收入结构)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatTourismRevenueReport(analyzeTourismRevenue(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'cultural_ip_developer',
    description: '文化IP开发 | IP挖掘/文创设计/授权策略/收益预测',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: IP开发需求(文化源/品类/目标客群/商业目标/预算)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatCulturalIPReport(analyzeCulturalIP(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'itinerary_personalization',
    description: '行程定制 | 兴趣画像/路线规划/体验编排/预算分配',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 旅客画像(人群/兴趣/预算/节奏/饮食/出行需求)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatItineraryReport(analyzeItinerary(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'smart_campus_operations',
    description: '智慧校园运营 | 能耗管理/空间利用/安防调度/自动化路线图',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 校园运营数据(面积/人数/能耗/安防/现有系统/预算)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatSmartCampusReport(analyzeSmartCampus(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'performance_art_management',
    description: '演艺管理 | 排期优化/票务分层/观众互动/财务预测',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 演艺项目(形式/场次/票价/预算/营销/场馆)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatPerformanceArtReport(analyzePerformanceArt(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'event_festival_planner',
    description: '节庆策划 | 主题设计/活动排程/空间布局/传播矩阵/安全清单',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: 节庆活动(类型/规模/场地/预算/主题/受众/法规)' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      return formatEventFestivalReport(analyzeEventFestival(JSON.parse(args.input_data)))
    }
  }))

  console.log(`[cultouragent] Loaded v${VERSION} — Cultural Tourism AI Assistant with 8 tools`)
  console.log('  Tools: destination_marketing, heritage_digitalization, tourism_revenue_mgmt, cultural_ip_developer, itinerary_personalization, smart_campus_operations, performance_art_management, event_festival_planner')
}
