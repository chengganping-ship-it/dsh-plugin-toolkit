/**
 * DSH 婚礼策划AI助手 Plugin v0.1.0
 * 婚庆预算分配与成本控制 / 婚宴场地筛选与档期协调 / 婚礼筹备倒计时与任务排期 /
 * 婚庆四大金刚比价与档期锁定 / 婚礼主题色系VI设计推荐 / 宾客名单管理与座位安排 /
 * 婚纱礼服与搭配建议 / 蜜月旅行方案与签证建议
 *
 * 以专业、细致、创意为核心，覆盖婚礼全流程策划服务。
 *
 * 工具清单:
 * 1. wedding_budget_planner       — 婚庆预算分配与成本控制
 * 2. venue_selector               — 婚宴场地筛选与档期协调
 * 3. wedding_timeline_scheduler   — 婚礼筹备倒计时与任务排期
 * 4. vendor_comparison            — 婚庆四大金刚比价与档期锁定
 * 5. wedding_theme_designer       — 婚礼主题色系VI设计推荐
 * 6. guest_list_manager           — 宾客名单管理与座位安排
 * 7. wedding_attire_advisor       — 婚纱礼服与搭配建议
 * 8. honeymoon_planner            — 蜜月旅行方案与签证建议
 *
 * @module dsh-tool-weddingagentpro | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-weddingagentpro'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

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

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: 婚庆预算分配 ---
interface BudgetInput {
  total_budget: number
  guest_count: number
  wedding_style: 'luxury' | 'premium' | 'standard' | 'budget'
  priority_categories?: ('venue' | 'catering' | 'photography' | 'attire' | 'flowers' | 'music' | 'cake' | 'favors' | 'transport' | 'misc')[]
  region: string
  wedding_date?: string
}

interface BudgetCategory {
  category_id: string
  category_name: string
  allocated_amount: number
  percentage: number
  min_spend: number
  max_spend: number
  notes: string
  priority: 'essential' | 'recommended' | 'optional'
}

interface SavingsTip {
  tip: string
  potential_savings: number
  difficulty: 'easy' | 'moderate' | 'challenging'
}

interface BudgetResult {
  plan_id: string
  total_budget: number
  guest_count: number
  cost_per_guest: number
  categories: BudgetCategory[]
  allocated_total: number
  contingency_fund: number
  savings_tips: SavingsTip[]
  cost_control_alerts: string[]
  budget_style: string
}

// --- Tool 2: 婚宴场地筛选 ---
interface VenueInput {
  action: 'search' | 'compare' | 'check_availability' | 'book_tour'
  city: string
  preferred_areas?: string[]
  wedding_date: string
  guest_count: number
  budget_range: { min: number; max: number }
  venue_types?: ('hotel' | 'restaurant' | 'garden' | 'beach' | 'church' | 'banquet hall' | 'outdoor')[]
  style_preference?: 'modern' | 'classic' | 'rustic' | 'luxury' | 'minimalist'
}

interface VenueInfo {
  venue_id: string
  name: string
  type: string
  area: string
  capacity: min_max
  price_per_table: number
  rating: number
  style: string
  features: string[]
  availability: 'available' | 'limited' | 'waitlist' | 'booked'
  deposit_required: number
  contact: string
}

interface min_max {
  min: number
  max: number
}

interface VenueResult {
  action: string
  city: string
  search_date: string
  venues: VenueInfo[]
  total_matches: number
  price_range: { min: number; max: number }
  availability_summary: { available: number; limited: number; waitlist: number; booked: number }
  recommendations: string[]
  booking_tips: string[]
}

// --- Tool 3: 婚礼筹备倒计时 ---
interface TimelineInput {
  wedding_date: string
  current_date?: string
  wedding_size: 'intimate' | 'medium' | 'large' | 'grand'
  vendor_status?: ('venue' | 'photographer' | 'makeup' | 'mc' | 'video' | 'catering' | 'flowers' | 'cake' | 'attire' | 'invitations')[]
  custom_tasks?: string[]
}

interface TimelinePhase {
  phase_name: string
  phase_timeframe: string
  tasks: TimelineTask[]
  phase_status: 'completed' | 'in_progress' | 'upcoming' | 'urgent'
  completion_percentage: number
}

interface TimelineTask {
  task_id: string
  task_name: string
  deadline: string
  status: 'done' | 'in_progress' | 'pending' | 'overdue'
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimated_cost?: string
  notes?: string
}

interface MilestoneEvent {
  event: string
  target_date: string
  days_until: number
  status: 'passed' | 'approaching' | 'upcoming'
}

interface TimelineResult {
  schedule_id: string
  wedding_date: string
  days_remaining: number
  phases: TimelinePhase[]
  milestones: MilestoneEvent[]
  urgent_tasks: TimelineTask[]
  overall_progress: number
  next_actions: string[]
  tips: string[]
}

// --- Tool 4: 四大金刚比价 ---
interface VendorInput {
  vendor_type: 'photographer' | 'makeup_artist' | 'mc' | 'videographer' | 'all'
  city: string
  wedding_date: string
  budget_per_vendor?: number
  style_preference?: string
  comparison_criteria?: ('price' | 'experience' | 'portfolio' | 'reviews' | 'availability' | 'packages')[]
}

interface VendorInfo {
  vendor_id: string
  name: string
  type: string
  experience_years: number
  price_range: { min: number; max: number }
  rating: number
  review_count: number
  style: string
  portfolio_highlights: string[]
  packages: VendorPackage[]
  availability: 'available' | 'limited' | 'booked'
  booking_lead_time_days: number
  deposit_pct: number
}

interface VendorPackage {
  package_name: string
  price: number
  includes: string[]
  duration_hours?: number
  extras: string[]
}

interface VendorResult {
  search_id: string
  vendor_type: string
  city: string
  wedding_date: string
  vendors: VendorInfo[]
  price_benchmark: { low: number; median: number; high: number }
  top_rated: string[]
  best_value: string[]
  booking_urgency: 'low' | 'medium' | 'high' | 'critical'
  comparison_summary: string
  negotiation_tips: string[]
}

// --- Tool 5: 婚礼主题设计 ---
interface ThemeInput {
  style_preference: 'romantic' | 'modern' | 'vintage' | 'bohemian' | 'minimalist' | 'luxury' | 'rustic' | 'cultural'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  venue_type: string
  couple_vibe?: string
  cultural_elements?: string[]
  color_inspiration?: string
}

interface ColorPalette {
  palette_name: string
  primary: string
  secondary: string[]
  accent: string
  neutrals: string[]
  mood_description: string
}

interface VIElement {
  element: string
  description: string
  design_suggestions: string[]
  diy_options?: string[]
}

interface DecorIdea {
  area: string
  ideas: string[]
  estimated_budget_range: string
  impact_level: 'high' | 'medium' | 'low'
}

interface ThemeResult {
  design_id: string
  theme_name: string
  style: string
  color_palettes: ColorPalette[]
  vi_elements: VIElement[]
  decor_ideas: DecorIdea[]
  floral_suggestions: string[]
  lighting_recommendations: string[]
  personalization_tips: string[]
  mood_board_description: string
}

// --- Tool 6: 宾客名单管理 ---
interface GuestInput {
  action: 'add_guests' | 'manage_rsvp' | 'assign_seats' | 'generate_stats'
  guest_list?: GuestInfo[]
  total_tables?: number
  seats_per_table?: number
  seating_constraints?: ('separate' | 'together' | 'avoid_children_bar' | 'vip_front')[]
  meal_preferences?: boolean
}

interface GuestInfo {
  name: string
  side: 'bride' | 'groom' | 'mutual'
  relation: string
  rsvv_status?: 'confirmed' | 'declined' | 'pending'
  plus_one?: boolean
  meal_preference?: 'standard' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'gluten_free'
  age_group?: 'child' | 'teen' | 'adult' | 'elder'
  table_assignment?: number
  notes?: string
  gift_received?: string
}

interface TableAssignment {
  table_number: number
  seats: { seat_number: number; guest_name: string }[]
  table_theme?: string
  special_notes: string
}

interface GuestResult {
  report_id: string
  action: string
  total_guests: number
  confirmed_count: number
  declined_count: number
  pending_count: number
  bride_side_count: number
  groom_side_count: number
  plus_one_count: number
  meal_breakdown: Record<string, number>
  table_assignments: TableAssignment[]
  seating_chart_notes: string[]
  buffer_recommendation: string
  tips: string[]
}

// --- Tool 7: 婚纱礼服建议 ---
interface AttireInput {
  role: 'bride' | 'groom' | 'bridesmaid' | 'groomsman' | 'mother' | 'father'
  body_type?: 'slim' | 'athletic' | 'curvy' | 'petite' | 'tall' | 'plus_size'
  height_cm?: number
  skin_tone?: 'fair' | 'medium' | 'olive' | 'tan' | 'dark'
  wedding_style: 'formal' | 'semi_formal' | 'casual' | 'beach' | 'garden' | 'cultural'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  budget?: number
  cultural_preferences?: string[]
  venue_type?: string
}

interface AttireRecommendation {
  attire_type: string
  description: string
  best_for: string[]
  fabric_suggestions: string[]
  color_options: string[]
  style_notes: string
  price_range: { budget: number; mid: number; premium: number }
}

interface AccessoryItem {
  category: string;
  item: string;
  suggestion: string;
  priority: 'must_have' | 'recommended' | 'optional'
}

interface StylingTip {
  tip: string
  applicable_to: string
  reason: string
}

interface AttireResult {
  advisor_id: string
  role: string
  recommendations: AttireRecommendation[]
  accessories: AccessoryItem[]
  styling_tips: StylingTip[]
  color_palette: string[]
  fabric_guide: string[]
  fitting_timeline: { milestone: string; timing: string }[]
  budget_breakdown: { item: string; estimated_cost: number }[]
  coordination_notes: string[]
}

// --- Tool 8: 蜜月旅行规划 ---
interface HoneymoonInput {
  destination_type: 'beach' | 'mountain' | 'city' | 'cultural' | 'adventure' | 'cruise' | 'resort'
  preferred_regions?: string[]
  duration_days: number
  budget_total: number
  travel_month: string
  departure_city: string
  passport_holder?: 'cn' | 'hk' | 'tw' | 'other'
  visa_flexibility?: boolean
  interests?: ('sightseeing' | 'relaxation' | 'food' | 'adventure' | 'culture' | 'shopping' | 'nightlife' | 'nature')[]
}

interface Destination {
  name: string
  country: string
  region: string
  best_months: string[]
  highlights: string[]
  estimated_cost_per_person: number
  visa_info: VisaInfo
  flight_hours_from_cn: number
  romantic_rating: number
}

interface VisaInfo {
  requirement: 'visa_free' | 'visa_on_arrival' | 'eta' | 'e_visa' | 'embassy_visa'
  processing_days: number
  difficulty: 'easy' | 'moderate' | 'complex'
  documents_needed: string[]
  notes: string
}

interface HoneymoonItinerary {
  day: number
  activities: string[]
  accommodation_type: string
  meal_highlights: string[]
  transportation: string
}

interface HoneymoonResult {
  plan_id: string
  destinations: Destination[]
  recommended_destination: string
  itinerary: HoneymoonItinerary[]
  budget_breakdown: { category: string; amount: number; notes: string }[]
  visa_guide: VisaInfo
  packing_tips: string[]
  travel_checklist: string[]
  romantic_experiences: string[]
  booking_tips: string[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: 婚庆预算分配 分析 ---
function analyzeBudget(input: BudgetInput): BudgetResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.total_budget.toString() + input.wedding_style + input.region
  ))

  const planId = 'BUD-' + Date.now() + '-' + rng.nextInt(1000, 9999)
  const costPerGuest = Math.round(input.total_budget / input.guest_count)

  const defaultAllocations: { name: string; pct: number; priority: 'essential' | 'recommended' | 'optional'; notes: string }[] = [
    { name: '婚宴餐饮', pct: 40, priority: 'essential', notes: '最大开销，含酒水' },
    { name: '婚礼策划', pct: 15, priority: 'essential', notes: '含四大金刚协调' },
    { name: '婚纱礼服', pct: 10, priority: 'essential', notes: '新娘/新郎服装' },
    { name: '摄影摄像', pct: 8, priority: 'essential', notes: '双机位起' },
    { name: '场地布置', pct: 8, priority: 'recommended', notes: '花艺、背景、灯光' },
    { name: '婚戒首饰', pct: 5, priority: 'essential', notes: '对戒+三金' },
    { name: '化妆造型', pct: 4, priority: 'recommended', notes: '新娘全天跟妆' },
    { name: '婚礼蛋糕', pct: 2, priority: 'optional', notes: '多层设计' },
    { name: '喜糖伴手礼', pct: 3, priority: 'recommended', notes: '按宾客人数' },
    { name: '交通杂费', pct: 5, priority: 'recommended', notes: '婚车、住宿、备用' },
  ]

  const categories: BudgetCategory[] = defaultAllocations.map((cat, idx) => {
    const amount = Math.round(input.total_budget * cat.pct / 100)
    return {
      category_id: 'CAT-' + String(idx + 1).padStart(2, '0'),
      category_name: cat.name,
      allocated_amount: amount,
      percentage: cat.pct,
      min_spend: Math.round(amount * 0.7),
      max_spend: Math.round(amount * 1.3),
      notes: cat.notes,
      priority: cat.priority,
    }
  })

  const allocatedTotal = categories.reduce((sum, c) => sum + c.allocated_amount, 0)
  const contingency = input.total_budget - allocatedTotal

  const savingsTips: SavingsTip[] = [
    { tip: '选择非周末/淡季日期可降低场地费15-30%', potential_savings: Math.round(input.total_budget * 0.15), difficulty: 'easy' },
    { tip: '自带酒水可节省餐饮预算20%', potential_savings: Math.round(input.total_budget * 0.08), difficulty: 'moderate' },
    { tip: '精简宾客名单，每减少10人节省约3-5%', potential_savings: Math.round(input.total_budget * 0.05), difficulty: 'challenging' },
    { tip: '选择套餐服务而非单项外包', potential_savings: Math.round(input.total_budget * 0.1), difficulty: 'easy' },
    { tip: '提前6个月以上预订锁定早鸟价', potential_savings: Math.round(input.total_budget * 0.05), difficulty: 'easy' },
  ]

  const alerts: string[] = []
  if (costPerGuest < 500) alerts.push('人均餐饮预算偏低，建议增加或精简菜单')
  if (input.wedding_style === 'luxury' && input.total_budget < 200000) alerts.push('总预算可能不足以支撑奢华风格')
  if (input.guest_count > 300) alerts.push('大型婚礼需要更多交通和接待预算')

  return {
    plan_id: planId,
    total_budget: input.total_budget,
    guest_count: input.guest_count,
    cost_per_guest: costPerGuest,
    categories: categories,
    allocated_total: allocatedTotal,
    contingency_fund: contingency,
    savings_tips: savingsTips,
    cost_control_alerts: alerts,
    budget_style: input.wedding_style,
  }
}

// --- Tool 2: 婚宴场地筛选 分析 ---
function analyzeVenue(input: VenueInput): VenueResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.city + input.wedding_date + input.guest_count.toString()
  ))

  const areaList = input.preferred_areas || ['市中心', '滨江新区', '西湖景区', '新城商圈', '大学城']
  const venueNames = ['香格里拉酒店', '万豪大酒店', '希尔顿花园', '凯悦酒店中心', '世茂喜来登', '丽思卡尔顿', '君悦酒店', '洲际酒店', '悦榕庄', '温德姆酒店']
  const venues: VenueInfo[] = []

  for (let i = 0; i < rng.nextInt(5, 10); i++) {
    const capacity = { min: rng.nextInt(50, 150), max: rng.nextInt(200, 500) }
    if (capacity.min > input.guest_count * 1.5) continue

    const pricePerTable = rng.nextInt(3000, 12000)
    const estimatedTotal = pricePerTable * Math.ceil(input.guest_count / 10)
    if (estimatedTotal > input.budget_range.max * 1.3) continue

    venues.push({
      venue_id: 'VEN-' + rng.nextInt(10000, 99999),
      name: rng.pick(venueNames) + ' - ' + rng.pick(['宴会厅', '多功能厅', '花园露台', '草坪区', '水上厅']),
      type: rng.pick(['hotel', 'restaurant', 'garden', 'banquet hall']),
      area: rng.pick(areaList),
      capacity: capacity,
      price_per_table: pricePerTable,
      rating: Math.round(rng.nextFloat(3.8, 5.0) * 10) / 10,
      style: rng.pick(['modern', 'classic', 'rustic', 'luxury']),
      features: [
        rng.pick(['LED大屏', '专业音响', '舞台灯光', '新娘房', '免费停车']),
        rng.pick(['自带厨房', '独立入口', '露台观景', '花园仪式区', '泳池']),
        rng.pick(['星级厨师', '定制菜单', '主题布置', '婚礼策划', '摄影服务']),
      ],
      availability: rng.pick(['available', 'available', 'available', 'limited', 'waitlist', 'booked']),
      deposit_required: Math.round(pricePerTable * rng.nextFloat(0.2, 0.5)),
      contact: '138-' + rng.nextInt(1000, 9999) + '-' + rng.nextInt(1000, 9999),
    })
  }

  const prices = venues.map(v => v.price_per_table)
  const availSummary = {
    available: venues.filter(v => v.availability === 'available').length,
    limited: venues.filter(v => v.availability === 'limited').length,
    waitlist: venues.filter(v => v.availability === 'waitlist').length,
    booked: venues.filter(v => v.availability === 'booked').length,
  }

  const recommendations: string[] = [
    '建议提前6-12个月预订热门档期',
    '实地考察时重点关注灯光效果和音响设备',
    '确认是否允许自带酒水及开瓶费标准',
    '了解场地布置时间限制和撤场要求',
    '询问是否赠送婚房或蜜月套房',
  ]

  const bookingTips: string[] = [
    '旺季（5月、10月）需提前1年预订',
    '工作日/周日价格通常比周六低20-30%',
    '签订合同时明确违约条款和退款政策',
    '要求场地提供过往婚礼案例参考',
  ]

  return {
    action: input.action,
    city: input.city,
    search_date: input.wedding_date,
    venues: venues,
    total_matches: venues.length,
    price_range: { min: prices.length > 0 ? Math.min(...prices) : 0, max: prices.length > 0 ? Math.max(...prices) : 0 },
    availability_summary: availSummary,
    recommendations: recommendations,
    booking_tips: bookingTips,
  }
}

// --- Tool 3: 婚礼筹备倒计时 分析 ---
function analyzeTimeline(input: TimelineInput): TimelineResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.wedding_date + input.wedding_size
  ))

  const scheduleId = 'TL-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const phases: TimelinePhase[] = [
    {
      phase_name: '前期筹备（婚前6-12个月）',
      phase_timeframe: '6-12个月前',
      phase_status: 'completed',
      completion_percentage: 100,
      tasks: [
        { task_id: 'T-01', task_name: '确定婚期', deadline: '12个月前', status: 'done', priority: 'critical', notes: '已确定' },
        { task_id: 'T-02', task_name: '制定预算', deadline: '12个月前', status: 'done', priority: 'critical', notes: input.wedding_size + '规模' },
        { task_id: 'T-03', task_name: '预订场地', deadline: '10个月前', status: 'done', priority: 'critical', estimated_cost: '40-50%预算' },
        { task_id: 'T-04', task_name: '确定婚庆公司', deadline: '8个月前', status: 'done', priority: 'high', notes: '四大金刚推荐' },
        { task_id: 'T-05', task_name: '预订四大金刚', deadline: '8个月前', status: 'done', priority: 'high', estimated_cost: '15-20%预算' },
      ],
    },
    {
      phase_name: '中期准备（婚前3-6个月）',
      phase_timeframe: '3-6个月前',
      phase_status: 'in_progress',
      completion_percentage: 65,
      tasks: [
        { task_id: 'T-06', task_name: '选购婚纱礼服', deadline: '5个月前', status: 'in_progress', priority: 'high', estimated_cost: '10%预算' },
        { task_id: 'T-07', task_name: '设计请柬', deadline: '4个月前', status: 'pending', priority: 'medium', estimated_cost: '2-3%预算' },
        { task_id: 'T-08', task_name: '确定伴郎伴娘', deadline: '4个月前', status: 'done', priority: 'medium', notes: '服装统一' },
        { task_id: 'T-09', task_name: '蜜月行程规划', deadline: '4个月前', status: 'pending', priority: 'medium', estimated_cost: '10-15%预算' },
        { task_id: 'T-10', task_name: '试菜确定菜单', deadline: '3个月前', status: 'pending', priority: 'high', notes: '含酒水确认' },
      ],
    },
    {
      phase_name: '冲刺阶段（婚前1-3个月）',
      phase_timeframe: '1-3个月前',
      phase_status: 'upcoming',
      completion_percentage: 20,
      tasks: [
        { task_id: 'T-11', task_name: '发送请柬', deadline: '2个月前', status: 'pending', priority: 'high', notes: '含回执收集' },
        { task_id: 'T-12', task_name: '婚礼彩排', deadline: '2周前', status: 'pending', priority: 'high', notes: '全员参与' },
        { task_id: 'T-13', task_name: '确定座位表', deadline: '1个月前', status: 'pending', priority: 'medium', notes: '根据回执调整' },
        { task_id: 'T-14', task_name: '婚戒选购', deadline: '2个月前', status: 'pending', priority: 'high', estimated_cost: '5%预算' },
        { task_id: 'T-15', task_name: '伴手礼准备', deadline: '1个月前', status: 'pending', priority: 'medium', estimated_cost: '3%预算' },
      ],
    },
    {
      phase_name: '最后冲刺（婚前1周）',
      phase_timeframe: '1周内',
      phase_status: 'upcoming',
      completion_percentage: 0,
      tasks: [
        { task_id: 'T-16', task_name: '确认最终人数', deadline: '3天前', status: 'pending', priority: 'critical', notes: '通知酒店' },
        { task_id: 'T-17', task_name: '婚礼当天流程表', deadline: '1周前', status: 'pending', priority: 'critical', notes: '发给所有参与者' },
        { task_id: 'T-18', task_name: '红包准备', deadline: '2天前', status: 'pending', priority: 'high', notes: '各种面额' },
        { task_id: 'T-19', task_name: '婚房布置', deadline: '1天前', status: 'pending', priority: 'medium', notes: '压床、装饰' },
        { task_id: 'T-20', task_name: '最终彩排', deadline: '1天前', status: 'pending', priority: 'high', notes: '确认所有细节' },
      ],
    },
  ]

  const milestones: MilestoneEvent[] = [
    { event: '确定婚期', target_date: '12个月前', days_until: -365, status: 'passed' },
    { event: '预订场地', target_date: '10个月前', days_until: -300, status: 'passed' },
    { event: '发送请柬', target_date: '2个月前', days_until: -60, status: 'approaching' },
    { event: '婚礼彩排', target_date: '2周前', days_until: -14, status: 'upcoming' },
    { event: '婚礼当天', target_date: input.wedding_date, days_until: 0, status: 'upcoming' },
  ]

  const urgentTasks = phases.flatMap(p => p.tasks.filter(t => t.status === 'pending' && (t.priority === 'critical' || t.priority === 'high'))).slice(0, 5)

  const nextActions: string[] = [
    '尽快确定婚纱礼服租赁/购买方案',
    '联系婚庆公司确认四大金刚档期',
    '开始设计电子请柬模板',
    '预订蜜月机票和酒店',
    '安排伴郎伴娘服装统一',
  ]

  const tips: string[] = [
    '建立婚礼筹备共享文档，双方家长可查看进度',
    '设置手机日历提醒关键节点',
    '预留10-15%预算作为应急资金',
    '婚礼前一周尽量不安排加班',
  ]

  return {
    schedule_id: scheduleId,
    wedding_date: input.wedding_date,
    days_remaining: rng.nextInt(30, 365),
    phases: phases,
    milestones: milestones,
    urgent_tasks: urgentTasks,
    overall_progress: 45,
    next_actions: nextActions,
    tips: tips,
  }
}

// --- Tool 4: 四大金刚比价 分析 ---
function analyzeVendors(input: VendorInput): VendorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.vendor_type + input.city + input.wedding_date
  ))

  const searchId = 'VND-' + Date.now() + '-' + rng.nextInt(1000, 9999)
  const types = input.vendor_type === 'all' ? ['photographer', 'makeup_artist', 'mc', 'videographer'] : [input.vendor_type]

  const vendors: VendorInfo[] = []

  for (const vType of types) {
    const count = rng.nextInt(3, 6)
    for (let i = 0; i < count; i++) {
      const basePrice = vType === 'photographer' ? 5000 : vType === 'makeup_artist' ? 3000 : vType === 'mc' ? 2500 : 4000
      const priceMin = Math.round(basePrice * rng.nextFloat(0.6, 1.0))
      const priceMax = Math.round(basePrice * rng.nextFloat(1.2, 2.5))

      const packages: VendorPackage[] = [
        {
          package_name: '基础套餐',
          price: priceMin,
          includes: vType === 'photographer' ? ['单机位', '200张精修', '全天跟拍'] : vType === 'makeup_artist' ? ['新娘早妆', '伴娘妆', '补妆2次'] : vType === 'mc' ? ['仪式主持', '流程策划', '音乐编排'] : ['单机位', '5分钟精剪', '全程记录'],
          duration_hours: vType === 'mc' ? 4 : 10,
          extras: [],
        },
        {
          package_name: '标准套餐',
          price: Math.round((priceMin + priceMax) / 2),
          includes: vType === 'photographer' ? ['双机位', '300张精修', '全天跟拍', '相册一本'] : vType === 'makeup_artist' ? ['新娘全天跟妆', '伴娘妆2位', '妈妈妆', '不限次补妆'] : vType === 'mc' ? ['仪式+宴会主持', '流程策划', '音乐编排', '互动游戏'] : ['双机位', '10分钟精剪', '全程记录', '航拍'],
          duration_hours: vType === 'mc' ? 8 : 12,
          extras: ['预告片'],
        },
        {
          package_name: '豪华套餐',
          price: priceMax,
          includes: vType === 'photographer' ? ['三机位', '500张精修', '全天跟拍', '相册+相框', '航拍'] : vType === 'makeup_artist' ? ['新娘全天跟妆+婚前试妆', '伴娘妆4位', '妈妈妆2位', '不限次补妆', '美甲'] : vType === 'mc' ? ['全程策划+主持', '定制流程', '乐队协调', '互动游戏', '备稿'] : ['三机位+航拍', '15分钟精剪', '全程记录', '爱情微电影'],
          duration_hours: vType === 'mc' ? 12 : 14,
          extras: ['预告片', '快剪直播'],
        },
      ]

      vendors.push({
        vendor_id: 'V-' + rng.nextInt(10000, 99999),
        name: rng.pick(['星辰', '花嫁', '良缘', '锦绣', '唯美', '时光', '蜜语', '挚爱']) + rng.pick(['工作室', '影像', '婚礼', '创意', '']),
        type: vType,
        experience_years: rng.nextInt(2, 15),
        price_range: { min: priceMin, max: priceMax },
        rating: Math.round(rng.nextFloat(4.0, 5.0) * 10) / 10,
        review_count: rng.nextInt(20, 500),
        style: rng.pick(['清新自然', '电影感', '纪实', '复古', '时尚大片', '文艺']),
        portfolio_highlights: [
          rng.pick(['户外草坪婚礼', '海边婚礼', '酒店宴会', '教堂婚礼', '中式婚礼']),
          rng.pick(['新人好评如潮', '作品获行业奖项', '服务超1000对新人']),
        ],
        packages: packages,
        availability: rng.pick(['available', 'available', 'available', 'limited', 'booked']),
        booking_lead_time_days: rng.nextInt(30, 180),
        deposit_pct: rng.nextInt(20, 50),
      })
    }
  }

  const allPrices = vendors.flatMap(v => [v.price_range.min, v.price_range.max])
  const sortedPrices = allPrices.sort((a, b) => a - b)
  const median = sortedPrices[Math.floor(sortedPrices.length / 2)]

  const topRated = vendors.filter(v => v.rating >= 4.7).map(v => v.name).slice(0, 3)
  const bestValue = vendors.filter(v => v.rating >= 4.5 && v.price_range.min < median).map(v => v.name).slice(0, 3)

  const bookingUrgency: 'low' | 'medium' | 'high' | 'critical' =
    input.wedding_date.includes('5月') || input.wedding_date.includes('10月') ? 'critical' :
    input.wedding_date.includes('6月') || input.wedding_date.includes('9月') ? 'high' : 'medium'

  const negotiationTips: string[] = [
    '淡季（1-3月、7-8月）可争取8-9折优惠',
    '同时预订多项服务可要求打包折扣',
    '要求看完整客片而非精选样片',
    '确认是否包含交通费、住宿费、加班费',
    '合同中明确交付时间和违约条款',
  ]

  return {
    search_id: searchId,
    vendor_type: input.vendor_type,
    city: input.city,
    wedding_date: input.wedding_date,
    vendors: vendors,
    price_benchmark: { low: sortedPrices[0] || 0, median: median, high: sortedPrices[sortedPrices.length - 1] || 0 },
    top_rated: topRated,
    best_value: bestValue,
    booking_urgency: bookingUrgency,
    comparison_summary: '共找到 ' + vendors.length + ' 家' + (input.vendor_type === 'all' ? '各类型' : '') + '供应商，价格区间 ' + (sortedPrices[0] || 0) + '-' + (sortedPrices[sortedPrices.length - 1] || 0) + '元',
    negotiation_tips: negotiationTips,
  }
}

// --- Tool 5: 婚礼主题设计 分析 ---
function analyzeTheme(input: ThemeInput): ThemeResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.style_preference + input.season + input.venue_type
  ))

  const designId: string = 'THM-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const paletteMap: Record<string, ColorPalette[]> = {
    romantic: [
      { palette_name: '玫瑰花园', primary: '#E8A0BF', secondary: ['#F5D5E0', '#D4739D'], accent: '#8B4513', neutrals: ['#FFF8F0', '#F5E6D3'], mood_description: '温柔浪漫，充满女性魅力' },
      { palette_name: '日落粉橙', primary: '#F4A460', secondary: ['#FFD700', '#FF6B6B'], accent: '#8B0000', neutrals: ['#FFFAF0', '#FAEBD7'], mood_description: '温暖活力，热情洋溢' },
    ],
    modern: [
      { palette_name: '极简黑白', primary: '#000000', secondary: ['#FFFFFF', '#333333'], accent: '#C0C0C0', neutrals: ['#F5F5F5', '#E0E0E0'], mood_description: '简约高级，永恒经典' },
      { palette_name: '雾霾蓝金', primary: '#6B8E9B', secondary: ['#A8C5D6', '#4A6D7C'], accent: '#D4AF37', neutrals: ['#F0F4F8', '#D9E2EC'], mood_description: '优雅知性，低调奢华' },
    ],
    vintage: [
      { palette_name: '复古红金', primary: '#8B0000', secondary: ['#D4AF37', '#CD853F'], accent: '#2F4F4F', neutrals: ['#FAEBD7', '#F5DEB3'], mood_description: '华丽复古，宫廷气质' },
      { palette_name: '怀旧绿白', primary: '#556B2F', secondary: ['#8FBC8F', '#6B8E23'], accent: '#D2691E', neutrals: ['#F5F5DC', '#FAFAD2'], mood_description: '自然怀旧，清新淡雅' },
    ],
    bohemian: [
      { palette_name: '波西米亚', primary: '#CD853F', secondary: ['#DEB887', '#D2691E'], accent: '#8B4513', neutrals: ['#FAEBD7', '#F5F5DC'], mood_description: '自由奔放，异域风情' },
    ],
    minimalist: [
      { palette_name: '纯白极简', primary: '#FFFFFF', secondary: ['#F8F8FF', '#F0F0F0'], accent: '#000000', neutrals: ['#FAFAFA', '#EEEEEE'], mood_description: '纯净简洁，极致优雅' },
    ],
    luxury: [
      { palette_name: '皇家紫金', primary: '#6A0DAD', secondary: ['#9B59B6', '#4A0080'], accent: '#FFD700', neutrals: ['#F8F0FF', '#E8D5F5'], mood_description: '尊贵华丽，气场全开' },
    ],
    rustic: [
      { palette_name: '森系绿棕', primary: '#6B8E23', secondary: ['#8FBC8F', '#556B2F'], accent: '#8B4513', neutrals: ['#F5F5DC', '#FAEBD7'], mood_description: '自然清新，田园诗意' },
    ],
    cultural: [
      { palette_name: '中国红金', primary: '#DC143C', secondary: ['#FFD700', '#FF4500'], accent: '#8B0000', neutrals: ['#FFFAF0', '#FAEBD7'], mood_description: '喜庆吉祥，传统韵味' },
    ],
  }

  const palettes = paletteMap[input.style_preference] || paletteMap.romantic

  const viElements: VIElement[] = [
    { element: '婚礼Logo', description: '新人姓名首字母组合设计', design_suggestions: ['手写体Logo', '几何图形Logo', '花卉环绕Logo'], diy_options: ['Canva在线设计', '请平面设计朋友帮忙'] },
    { element: '请柬设计', description: '与主题色系一致的邀请卡', design_suggestions: ['烫金工艺', '火漆印章', '丝带装饰'], diy_options: ['淘宝定制', '电子请柬'] },
    { element: '迎宾牌', description: '入口处的欢迎标识', design_suggestions: ['亚克力透明牌', '木质雕刻牌', '黑板手绘'], diy_options: ['手写黑板画', '打印+相框'] },
    { element: '桌卡席位卡', description: '每桌的桌号和宾客座位', design_suggestions: ['主题色系搭配', '植物元素点缀', '照片展示'], diy_options: ['打印+折叠座'] },
    { element: '感谢卡', description: '送给宾客的感谢小卡', design_suggestions: ['新人照片+感谢语', '与请柬风格统一'], diy_options: ['手写卡片'] },
  ]

  const decorIdeas: DecorIdea[] = [
    { area: '仪式区', ideas: ['花艺拱门', '纱幔背景', '地毯两侧花艺', '誓言台装饰'], estimated_budget_range: '3000-15000元', impact_level: 'high' },
    { area: '签到区', ideas: ['签到台布置', '照片展示墙', '留言簿/指纹树', '伴手礼展示'], estimated_budget_range: '1000-5000元', impact_level: 'medium' },
    { area: '宴会区', ideas: ['桌花中心装饰', '椅背纱/花', '桌布餐巾配色', '菜单卡'], estimated_budget_range: '2000-8000元', impact_level: 'high' },
    { area: '甜品区', ideas: ['甜品台布置', '蛋糕展示', '主题装饰', '拍照道具'], estimated_budget_range: '1500-6000元', impact_level: 'medium' },
    { area: '拍照区', ideas: ['主题背景墙', '手持道具', '霓虹灯字', '气球装置'], estimated_budget_range: '1000-5000元', impact_level: 'medium' },
  ]

  const floralSuggestions: string[] = [
    input.season === 'spring' ? '春季推荐：樱花、郁金香、洋牡丹、小手球' :
    input.season === 'summer' ? '夏季推荐：向日葵、绣球、玫瑰、雏菊' :
    input.season === 'autumn' ? '秋季推荐：大丽花、芦苇、枫叶、果实枝' :
    '冬季推荐：松果、冬青、银叶、腊梅',
    '主花与配花比例建议 7:3',
    '考虑花粉过敏宾客，避免百合等强花粉花卉',
  ]

  const lightingRecommendations: string[] = [
    '暖色串灯营造温馨氛围',
    'LED染色灯配合主题色系',
    '追光灯聚焦新人入场',
    '蜡烛/电子蜡烛增加浪漫感',
    '户外婚礼注意自然光利用',
  ]

  const personalizationTips: string[] = [
    '加入两人恋爱故事元素（如相遇地、定情信物）',
    '定制婚礼 hashtag 用于社交媒体',
    '准备专属婚礼小物（如定制火漆、印章）',
    '融入双方文化背景元素',
    '设计独特的婚礼仪式环节（如时间胶囊、种树）',
  ]

  return {
    design_id: designId,
    theme_name: input.style_preference + '风格婚礼',
    style: input.style_preference,
    color_palettes: palettes,
    vi_elements: viElements,
    decor_ideas: decorIdeas,
    floral_suggestions: floralSuggestions,
    lighting_recommendations: lightingRecommendations,
    personalization_tips: personalizationTips,
    mood_board_description: input.style_preference + '风格，' + input.season + '季婚礼，' + input.venue_type + '场地，整体氛围' + rng.pick(['温馨浪漫', '高级优雅', '自然清新', '华丽震撼']),
  }
}

// --- Tool 6: 宾客名单管理 分析 ---
function analyzeGuests(input: GuestInput): GuestResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + (input.total_tables?.toString() || '0')
  ))

  const reportId = 'GST-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const sampleGuests: GuestInfo[] = input.guest_list || [
    { name: '张三', side: 'bride', relation: '父亲', rsvv_status: 'confirmed', meal_preference: 'standard', age_group: 'elder' },
    { name: '李四', side: 'bride', relation: '母亲', rsvv_status: 'confirmed', meal_preference: 'standard', age_group: 'elder' },
    { name: '王五', side: 'groom', relation: '父亲', rsvv_status: 'confirmed', meal_preference: 'standard', age_group: 'elder' },
    { name: '赵六', side: 'groom', relation: '母亲', rsvv_status: 'confirmed', meal_preference: 'vegetarian', age_group: 'elder' },
    { name: '小明', side: 'bride', relation: '表哥', rsvv_status: 'confirmed', plus_one: true, meal_preference: 'standard', age_group: 'adult' },
    { name: '小红', side: 'groom', relation: '表妹', rsvv_status: 'pending', meal_preference: 'standard', age_group: 'adult' },
    { name: '大伟', side: 'mutual', relation: '大学同学', rsvv_status: 'confirmed', plus_one: true, meal_preference: 'standard', age_group: 'adult' },
    { name: '小美', side: 'bride', relation: '闺蜜', rsvv_status: 'confirmed', meal_preference: 'vegan', age_group: 'adult' },
    { name: '阿强', side: 'groom', relation: '同事', rsvv_status: 'declined', meal_preference: 'standard', age_group: 'adult' },
    { name: '小丽', side: 'bride', relation: '同事', rsvv_status: 'confirmed', meal_preference: 'standard', age_group: 'adult' },
    { name: '大宝', side: 'mutual', relation: '邻居', rsvv_status: 'pending', plus_one: true, meal_preference: 'standard', age_group: 'adult' },
    { name: '豆豆', side: 'bride', relation: '侄女', rsvv_status: 'confirmed', meal_preference: 'standard', age_group: 'child' },
  ]

  const totalGuests = sampleGuests.length
  const confirmed = sampleGuests.filter(g => g.rsvv_status === 'confirmed').length
  const declined = sampleGuests.filter(g => g.rsvv_status === 'declined').length
  const pending = sampleGuests.filter(g => g.rsvv_status === 'pending').length
  const brideSide = sampleGuests.filter(g => g.side === 'bride').length
  const groomSide = sampleGuests.filter(g => g.side === 'groom').length
  const plusOnes = sampleGuests.filter(g => g.plus_one).length

  const mealBreakdown: Record<string, number> = {}
  for (const g of sampleGuests) {
    const meal = g.meal_preference || 'standard'
    mealBreakdown[meal] = (mealBreakdown[meal] || 0) + 1
  }

  const totalTables = input.total_tables || Math.ceil(confirmed / 10)
  const seatsPerTable = input.seats_per_table || 10
  const tableAssignments: TableAssignment[] = []

  const confirmedGuests = sampleGuests.filter(g => g.rsvv_status === 'confirmed')
  for (let t = 1; t <= totalTables; t++) {
    const tableGuests = confirmedGuests.filter((_, idx) => idx % totalTables === t - 1)
    if (tableGuests.length === 0) continue
    tableAssignments.push({
      table_number: t,
      seats: tableGuests.map((g, idx) => ({ seat_number: idx + 1, guest_name: g.name })),
      table_theme: t === 1 ? '主桌（新人+父母）' : t <= 3 ? '亲友桌' : '朋友桌',
      special_notes: t === 1 ? '安排新人及双方父母' : '',
    })
  }

  const seatingNotes: string[] = [
    '主桌安排新人+双方父母+重要长辈',
    '伴郎伴娘安排在靠近主桌位置',
    '单身朋友可安排在同一桌促进交流',
    '有矛盾的宾客分开安排',
    '儿童区可安排在靠近出口处',
  ]

  return {
    report_id: reportId,
    action: input.action,
    total_guests: totalGuests,
    confirmed_count: confirmed,
    declined_count: declined,
    pending_count: pending,
    bride_side_count: brideSide,
    groom_side_count: groomSide,
    plus_one_count: plusOnes,
    meal_breakdown: mealBreakdown,
    table_assignments: tableAssignments,
    seating_chart_notes: seatingNotes,
    buffer_recommendation: '建议多预留 ' + Math.ceil(confirmed * 0.1) + ' 个座位（约10%余量）',
    tips: [
      '提前收集宾客饮食禁忌和过敏信息',
      '制作座位表时考虑宾客间关系',
      '为带小孩的宾客准备儿童座椅',
      '准备座位表二维码方便宾客查询',
    ],
  }
}

// --- Tool 7: 婚纱礼服建议 分析 ---
function analyzeAttire(input: AttireInput): AttireResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.role + input.wedding_style + input.season
  ))

  const advisorId = 'ATTIRE-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const recommendations: AttireRecommendation[] = []

  if (input.role === 'bride') {
    recommendations.push(
      {
        attire_type: '主婚纱（仪式纱）',
        description: '婚礼仪式环节穿着，强调庄重感和仪式感',
        best_for: ['formal', 'semi_formal'],
        fabric_suggestions: ['缎面', '蕾丝', '薄纱', '欧根纱'],
        color_options: ['纯白', '象牙白', '香槟色', '浅粉色'],
        style_notes: input.body_type === 'petite' ? '建议高腰线设计，避免过大拖尾' : input.body_type === 'curvy' ? '建议A字裙或鱼尾款' : '可根据个人喜好选择',
        price_range: { budget: 2000, mid: 8000, premium: 30000 },
      },
      {
        attire_type: '敬酒服',
        description: '宴会敬酒环节穿着，便于走动',
        best_for: ['formal', 'semi_formal', 'casual'],
        fabric_suggestions: ['真丝', '雪纺', '丝绒'],
        color_options: ['红色', '香槟色', '粉色', '蓝色'],
        style_notes: '建议选择便于行走的短款或开叉设计',
        price_range: { budget: 800, mid: 3000, premium: 10000 },
      },
      {
        attire_type: '出门纱/秀禾服',
        description: '新郎接亲环节穿着',
        best_for: ['cultural', 'formal'],
        fabric_suggestions: ['真丝', '织锦缎', '蕾丝'],
        color_options: ['红色', '金色', '粉色'],
        style_notes: '中式婚礼推荐秀禾服/龙凤褂，西式可选短款出门纱',
        price_range: { budget: 1000, mid: 5000, premium: 20000 },
      },
    )
  } else if (input.role === 'groom') {
    recommendations.push(
      {
        attire_type: '西装套装',
        description: '婚礼全程穿着',
        best_for: ['formal', 'semi_formal'],
        fabric_suggestions: ['羊毛', '羊毛混纺', '天鹅绒'],
        color_options: ['黑色', '深蓝色', '灰色', '白色'],
        style_notes: '建议定制或半定制，确保合身',
        price_range: { budget: 2000, mid: 8000, premium: 25000 },
      },
      {
        attire_type: '衬衫+马甲',
        description: '搭配西装或单独穿着',
        best_for: ['formal', 'semi_formal', 'casual'],
        fabric_suggestions: ['纯棉', '免烫面料', '真丝'],
        color_options: ['白色', '浅蓝色', '粉色'],
        style_notes: '准备2-3件备用衬衫',
        price_range: { budget: 300, mid: 1000, premium: 5000 },
      },
    )
  } else if (input.role === 'bridesmaid') {
    recommendations.push({
      attire_type: '伴娘服',
      description: '伴娘团统一着装',
      best_for: ['formal', 'semi_formal', 'casual'],
      fabric_suggestions: ['雪纺', '蕾丝', '缎面'],
      color_options: ['粉色', '紫色', '蓝色', '绿色', '香槟色'],
      style_notes: '统一色系，可不同款式适应不同身材',
      price_range: { budget: 300, mid: 800, premium: 3000 },
    })
  } else {
    recommendations.push({
      attire_type: input.role === 'groomsman' ? '伴郎服' : '父母装',
      description: input.role === 'groomsman' ? '伴郎团统一着装' : '双方父母婚礼着装',
      best_for: ['formal', 'semi_formal'],
      fabric_suggestions: ['羊毛', '真丝', '混纺'],
      color_options: ['黑色', '深蓝', '灰色', '酒红色'],
      style_notes: input.role === 'groomsman' ? '与新郎风格协调' : '母亲推荐旗袍/套装，父亲推荐西装',
      price_range: { budget: 500, mid: 3000, premium: 15000 },
    })
  }

  const accessories: AccessoryItem[] = []
  if (input.role === 'bride') {
    accessories.push(
      { category: '头纱', item: '头纱', suggestion: '根据婚纱长度选择：短纱配长拖尾，长纱配短婚纱', priority: 'must_have' },
      { category: '首饰', item: '项链+耳环', suggestion: '简约款配复杂婚纱，华丽款配简单婚纱', priority: 'must_have' },
      { category: '鞋子', item: '婚鞋', suggestion: '准备一双高跟+一双平底备用', priority: 'must_have' },
      { category: '手捧花', item: '手捧花', suggestion: '与整体花艺风格统一', priority: 'recommended' },
      { category: '手套', item: '手套', suggestion: '长款婚纱可配长手套', priority: 'optional' },
    )
  } else if (input.role === 'groom') {
    accessories.push(
      { category: '领结/领带', item: '领结/领带', suggestion: '与伴郎统一，与新娘手捧花呼应', priority: 'must_have' },
      { category: '袖扣', item: '袖扣', suggestion: '定制款更有纪念意义', priority: 'recommended' },
      { category: '手表', item: '手表', suggestion: '选择经典款式', priority: 'recommended' },
      { category: '口袋巾', item: '口袋巾', suggestion: '与领结色系协调', priority: 'optional' },
    )
  }

  const stylingTips: StylingTip[] = [
    { tip: '提前3-4个月开始挑选，留出修改时间', applicable_to: '所有人', reason: '定制和修改需要时间' },
    { tip: '试纱时带上婚鞋和内衣', applicable_to: '新娘', reason: '确保整体搭配效果' },
    { tip: '考虑婚礼场地和季节选择面料', applicable_to: '所有人', reason: '夏季选轻薄面料，冬季选保暖面料' },
    { tip: '准备备用服装以防意外', applicable_to: '新娘', reason: '防止当天出现意外' },
    { tip: '提前穿着婚鞋在家练习走路', applicable_to: '新娘', reason: '避免当天不适' },
  ]

  const colorPalette = input.role === 'bride'
    ? ['纯白/象牙白为主', '香槟色点缀', '金属色配饰']
    : input.role === 'groom'
    ? ['黑色/深蓝为主', '白色衬衫', '主题色领结']
    : ['与主题色系协调', '避免与新娘撞色', '统一色系不同深浅']

  const fabricGuide = [
    input.season === 'spring' ? '春季：轻薄面料如雪纺、薄纱、蕾丝' :
    input.season === 'summer' ? '夏季：透气面料如真丝、棉麻、欧根纱' :
    input.season === 'autumn' ? '秋季：中等厚度如缎面、丝绒、羊毛' :
    '冬季：保暖面料如丝绒、天鹅绒、厚缎',
    '避免易皱面料（如亚麻）用于长时间仪式',
  ]

  const fittingTimeline = [
    { milestone: '首次选款', timing: '婚前4-6个月' },
    { milestone: '量体定制', timing: '婚前3-4个月' },
    { milestone: '第一次试衣', timing: '婚前2个月' },
    { milestone: '第二次试衣（微调）', timing: '婚前1个月' },
    { milestone: '最终取衣', timing: '婚前1-2周' },
  ]

  const budgetBreakdown = [
    { item: '主服装', estimated_cost: input.budget ? Math.round(input.budget * 0.5) : 5000 },
    { item: '备用服装', estimated_cost: input.budget ? Math.round(input.budget * 0.2) : 2000 },
    { item: '鞋子', estimated_cost: input.budget ? Math.round(input.budget * 0.1) : 1000 },
    { item: '配饰首饰', estimated_cost: input.budget ? Math.round(input.budget * 0.15) : 1500 },
    { item: '修改/干洗', estimated_cost: input.budget ? Math.round(input.budget * 0.05) : 500 },
  ]

  const coordinationNotes = [
    '新人服装风格需统一（如都正式或都休闲）',
    '伴郎伴娘服装与新人协调但不抢镜',
    '双方父母服装建议提前沟通',
    '花童服装与整体风格统一',
  ]

  return {
    advisor_id: advisorId,
    role: input.role,
    recommendations: recommendations,
    accessories: accessories,
    styling_tips: stylingTips,
    color_palette: colorPalette,
    fabric_guide: fabricGuide,
    fitting_timeline: fittingTimeline,
    budget_breakdown: budgetBreakdown,
    coordination_notes: coordinationNotes,
  }
}

// --- Tool 8: 蜜月旅行规划 分析 ---
function analyzeHoneymoon(input: HoneymoonInput): HoneymoonResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.destination_type + input.duration_days.toString() + input.travel_month
  ))

  const planId = 'HONEY-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const allDestinations: Destination[] = [
    { name: '马尔代夫', country: '马尔代夫', region: '南亚', best_months: ['11月-4月'], highlights: ['水上屋', '浮潜', '私人沙滩', 'SPA'], estimated_cost_per_person: 15000, visa_info: { requirement: 'visa_free', processing_days: 0, difficulty: 'easy', documents_needed: ['护照', '往返机票', '酒店预订单'], notes: '中国公民免签30天' }, flight_hours_from_cn: 8, romantic_rating: 5 },
    { name: '巴厘岛', country: '印度尼西亚', region: '东南亚', best_months: ['4月-10月'], highlights: ['海神庙', '乌布梯田', '悬崖酒店', '日落海滩'], estimated_cost_per_person: 8000, visa_info: { requirement: 'visa_on_arrival', processing_days: 1, difficulty: 'easy', documents_needed: ['护照', '往返机票'], notes: '落地签35美元，可延长30天' }, flight_hours_from_cn: 6, romantic_rating: 4 },
    { name: '圣托里尼', country: '希腊', region: '欧洲', best_months: ['5月-10月'], highlights: ['蓝顶教堂', '伊亚日落', '爱琴海', '葡萄酒庄'], estimated_cost_per_person: 20000, visa_info: { requirement: 'embassy_visa', processing_days: 15, difficulty: 'moderate', documents_needed: ['护照', '在职证明', '银行流水', '行程单', '酒店预订单'], notes: '需办理申根签证' }, flight_hours_from_cn: 12, romantic_rating: 5 },
    { name: '京都', country: '日本', region: '东亚', best_months: ['3月-5月', '10月-11月'], highlights: ['清水寺', '岚山竹林', '和服体验', '怀石料理'], estimated_cost_per_person: 10000, visa_info: { requirement: 'e_visa', processing_days: 5, difficulty: 'easy', documents_needed: ['护照', '在职证明', '银行流水'], notes: '可办理单次或三年多次签证' }, flight_hours_from_cn: 3, romantic_rating: 4 },
    { name: '新西兰', country: '新西兰', region: '大洋洲', best_months: ['11月-3月'], highlights: ['霍比特人村', '皇后镇', '极光', '温泉'], estimated_cost_per_person: 18000, visa_info: { requirement: 'e_visa', processing_days: 10, difficulty: 'moderate', documents_needed: ['护照', '在职证明', '银行流水', '行程单'], notes: '可在线申请电子签' }, flight_hours_from_cn: 12, romantic_rating: 4 },
    { name: '普吉岛', country: '泰国', region: '东南亚', best_months: ['11月-4月'], highlights: ['皮皮岛', '丛林飞跃', '泰式按摩', '夜市'], estimated_cost_per_person: 5000, visa_info: { requirement: 'visa_free', processing_days: 0, difficulty: 'easy', documents_needed: ['护照', '往返机票'], notes: '中国公民免签30天' }, flight_hours_from_cn: 4, romantic_rating: 3 },
    { name: '巴黎', country: '法国', region: '欧洲', best_months: ['4月-6月', '9月-10月'], highlights: ['埃菲尔铁塔', '卢浮宫', '塞纳河游船', '香榭丽舍'], estimated_cost_per_person: 22000, visa_info: { requirement: 'embassy_visa', processing_days: 15, difficulty: 'moderate', documents_needed: ['护照', '在职证明', '银行流水', '行程单', '酒店预订单', '保险'], notes: '需办理申根签证' }, flight_hours_from_cn: 11, romantic_rating: 5 },
    { name: '塞舌尔', country: '塞舌尔', region: '非洲', best_months: ['4月-5月', '10月-11月'], highlights: ['世界最美海滩', '象龟', '花岗岩海滩', '自然保护区'], estimated_cost_per_person: 25000, visa_info: { requirement: 'visa_free', processing_days: 0, difficulty: 'easy', documents_needed: ['护照', '往返机票', '酒店预订单'], notes: '中国公民免签30天' }, flight_hours_from_cn: 10, romantic_rating: 5 },
  ]

  const filtered = allDestinations.filter(d => {
    if (input.preferred_regions && input.preferred_regions.length > 0) {
      if (!input.preferred_regions.some(r => d.region.includes(r) || d.country.includes(r) || d.name.includes(r))) return false
    }
    return true
  })

  const destinations = filtered.length > 0 ? filtered : allDestinations.slice(0, 4)
  const recommended = destinations[0]

  const itinerary: HoneymoonItinerary[] = []
  for (let day = 1; day <= Math.min(input.duration_days, 7); day++) {
    itinerary.push({
      day: day,
      activities: day === 1
        ? ['抵达目的地', '酒店入住', '欢迎晚餐']
        : day === Math.min(input.duration_days, 7)
        ? ['最后购物', '整理行李', '返程']
        : [rng.pick(['浪漫海滩漫步', '当地特色美食', '文化景点游览', 'SPA放松', '冒险运动', '日落巡航']), rng.pick(['拍照留念', '购物', '休闲时光', '特色体验'])],
      accommodation_type: day <= 2 ? '豪华海景房' : '精品酒店',
      meal_highlights: [day === 1 ? '欢迎晚宴' : rng.pick(['当地特色餐厅', '海边烛光晚餐', '酒店自助', '街头美食'])],
      transportation: day === 1 ? '机场接送' : rng.pick(['租车自驾', '包车游览', '公共交通', '步行']),
    })
  }

  const perPersonCost = recommended.estimated_cost_per_person
  const totalEstimate = perPersonCost * 2
  const budgetRatio = input.budget_total / totalEstimate

  const budgetBreakdown = [
    { category: '机票', amount: Math.round(input.budget_total * 0.25), notes: '往返双人' },
    { category: '住宿', amount: Math.round(input.budget_total * 0.3), notes: input.duration_days + '晚' },
    { category: '餐饮', amount: Math.round(input.budget_total * 0.15), notes: '含特色餐厅' },
    { category: '活动体验', amount: Math.round(input.budget_total * 0.15), notes: '含景点门票、体验项目' },
    { category: '购物', amount: Math.round(input.budget_total * 0.1), notes: '纪念品+免税店' },
    { category: '保险+杂费', amount: Math.round(input.budget_total * 0.05), notes: '旅行保险、签证费' },
  ]

  const packingTips = [
    '护照+签证材料（复印件+电子版备份）',
    '转换插头（各国标准不同）',
    '防晒用品（防晒霜、墨镜、帽子）',
    '浪漫装备（情侣装、连衣裙）',
    '常用药品（感冒药、肠胃药、创可贴）',
    '水下相机/GoPro（海岛游必备）',
  ]

  const travelChecklist = [
    '确认护照有效期（6个月以上）',
    '办理签证（提前1-2个月）',
    '预订机票和酒店',
    '购买旅行保险',
    '下载离线地图和翻译APP',
    '通知银行境外用卡',
    '准备当地货币现金',
    '打印重要文件备份',
  ]

  const romanticExperiences = [
    '预订一次私人烛光晚餐',
    '安排一次情侣SPA',
    '预订日出/日落观赏活动',
    '准备惊喜小礼物',
    '预订一次浪漫巡航',
  ]

  const bookingTips = [
    '提前3-6个月预订可获得更好价格',
    '关注航空公司促销活动',
    '酒店选择可免费取消的选项',
    '蜜月旅行可告知酒店，可能获得升级',
    '购买包含行程取消的旅行保险',
  ]

  return {
    plan_id: planId,
    destinations: destinations,
    recommended_destination: recommended.name,
    itinerary: itinerary,
    budget_breakdown: budgetBreakdown,
    visa_guide: recommended.visa_info,
    packing_tips: packingTips,
    travel_checklist: travelChecklist,
    romantic_experiences: romanticExperiences,
    booking_tips: bookingTips,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

function formatBudgetReport(result: BudgetResult): string {
  const lines: string[] = []
  lines.push('## 婚庆预算分配报告')
  lines.push('')
  lines.push('方案编号: ' + result.plan_id + ' | 总预算: ' + result.total_budget.toLocaleString() + '元 | 宾客: ' + result.guest_count + '人')
  lines.push('人均成本: ' + result.cost_per_guest.toLocaleString() + '元 | 预算风格: ' + result.budget_style)
  lines.push('')
  lines.push('### 预算分配明细')
  lines.push('| 编号 | 类别 | 分配金额(元) | 占比 | 最低 | 最高 | 优先级 | 备注 |')
  lines.push('|------|------|-------------|------|------|------|--------|------|')
  for (const cat of result.categories) {
    const pri = cat.priority === 'essential' ? '必需' : cat.priority === 'recommended' ? '推荐' : '可选'
    lines.push('| ' + cat.category_id + ' | ' + cat.category_name + ' | ' + cat.allocated_amount.toLocaleString() + ' | ' + cat.percentage + '% | ' + cat.min_spend.toLocaleString() + ' | ' + cat.max_spend.toLocaleString() + ' | ' + pri + ' | ' + cat.notes + ' |')
  }
  lines.push('')
  lines.push('**已分配合计: ' + result.allocated_total.toLocaleString() + '元 | 应急资金: ' + result.contingency_fund.toLocaleString() + '元**')
  lines.push('')
  if (result.cost_control_alerts.length > 0) {
    lines.push('### 成本预警')
    for (const alert of result.cost_control_alerts) lines.push('- ⚠️ ' + alert)
    lines.push('')
  }
  lines.push('### 省钱建议')
  for (const tip of result.savings_tips) {
    const diff = tip.difficulty === 'easy' ? '简单' : tip.difficulty === 'moderate' ? '中等' : '有挑战'
    lines.push('- 💡 ' + tip.tip + '（预计节省: ' + tip.potential_savings.toLocaleString() + '元，难度: ' + diff + '）')
  }
  lines.push('')
  lines.push('---')
  lines.push('*婚礼策划AI助手 - 让每一分预算都花在刀刃上*')
  return lines.join('\n')
}

function formatVenueReport(result: VenueResult): string {
  const lines: string[] = []
  lines.push('## 婚宴场地筛选报告')
  lines.push('')
  lines.push('城市: ' + result.city + ' | 婚期: ' + result.search_date + ' | 匹配场地: ' + result.total_matches + '家')
  lines.push('价格区间: ' + result.price_range.min.toLocaleString() + '-' + result.price_range.max.toLocaleString() + '元/桌')
  lines.push('可订: ' + result.availability_summary.available + ' | 紧张: ' + result.availability_summary.limited + ' | 候补: ' + result.availability_summary.waitlist + ' | 已满: ' + result.availability_summary.booked)
  lines.push('')
  if (result.venues.length > 0) {
    lines.push('### 推荐场地')
    lines.push('| 编号 | 名称 | 类型 | 区域 | 容纳 | 元/桌 | 评分 | 状态 | 特色 |')
    lines.push('|------|------|------|------|------|-------|------|------|------|')
    for (const v of result.venues) {
      const status = v.availability === 'available' ? '可订' : v.availability === 'limited' ? '紧张' : v.availability === 'waitlist' ? '候补' : '已满'
      lines.push('| ' + v.venue_id + ' | ' + v.name + ' | ' + v.type + ' | ' + v.area + ' | ' + v.capacity.min + '-' + v.capacity.max + ' | ' + v.price_per_table.toLocaleString() + ' | ' + v.rating + ' | ' + status + ' | ' + v.features[0] + ' |')
    }
    lines.push('')
  }
  lines.push('### 推荐建议')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('### 预订贴士')
  for (const t of result.booking_tips) lines.push('- 📌 ' + t)
  lines.push('')
  lines.push('---')
  lines.push('*婚礼策划AI助手 - 找到梦想中的婚礼场地*')
  return lines.join('\n')
}

function formatTimelineReport(result: TimelineResult): string {
  const lines: string[] = []
  lines.push('## 婚礼筹备倒计时报告')
  lines.push('')
  lines.push('计划编号: ' + result.schedule_id + ' | 婚期: ' + result.wedding_date + ' | 剩余天数: ' + result.days_remaining + '天')
  lines.push('整体进度: ' + result.overall_progress + '%')
  lines.push('')
  for (const phase of result.phases) {
    const status = phase.phase_status === 'completed' ? '已完成' : phase.phase_status === 'in_progress' ? '进行中' : phase.phase_status === 'urgent' ? '紧急' : '待开始'
    lines.push('### ' + phase.phase_name + ' [' + status + '] - 完成度: ' + phase.completion_percentage + '%')
    lines.push('| 编号 | 任务 | 截止日期 | 状态 | 优先级 | 备注 |')
    lines.push('|------|------|----------|------|--------|------|')
    for (const task of phase.tasks) {
      const st = task.status === 'done' ? '已完成' : task.status === 'in_progress' ? '进行中' : task.status === 'overdue' ? '逾期' : '待办'
      const pri = task.priority === 'critical' ? '关键' : task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'
      lines.push('| ' + task.task_id + ' | ' + task.task_name + ' | ' + task.deadline + ' | ' + st + ' | ' + pri + ' | ' + (task.estimated_cost || task.notes) + ' |')
    }
    lines.push('')
  }
  if (result.urgent_tasks.length > 0) {
    lines.push('### 紧急待办')
    for (const t of result.urgent_tasks) lines.push('- 🔴 ' + t.task_name + '（截止: ' + t.deadline + '）')
    lines.push('')
  }
  lines.push('### 下一步行动')
  for (const a of result.next_actions) lines.push('- ' + a)
  lines.push('')
  lines.push('### 贴心提示')
  for (const t of result.tips) lines.push('- 💡 ' + t)
  lines.push('')
  lines.push('---')
  lines.push('*婚礼策划AI助手 - 筹备有序，从容备婚*')
  return lines.join('\n')
}

function formatVendorReport(result: VendorResult): string {
  const lines: string[] = []
  lines.push('## 四大金刚比价报告')
  lines.push('')
  lines.push('搜索编号: ' + result.search_id + ' | 类型: ' + result.vendor_type + ' | 城市: ' + result.city + ' | 婚期: ' + result.wedding_date)
  lines.push('预订紧迫度: ' + (result.booking_urgency === 'critical' ? '极高' : result.booking_urgency === 'high' ? '高' : result.booking_urgency === 'medium' ? '中' : '低'))
  lines.push('价格基准: 低 ' + result.price_benchmark.low.toLocaleString() + ' | 中位数 ' + result.price_benchmark.median.toLocaleString() + ' | 高 ' + result.price_benchmark.high.toLocaleString() + '元')
  lines.push('')
  lines.push(result.comparison_summary)
  lines.push('')
  if (result.vendors.length > 0) {
    lines.push('### 供应商列表')
    for (const v of result.vendors) {
      lines.push('#### ' + v.name + ' [' + v.type + ']')
      lines.push('- 经验: ' + v.experience_years + '年 | 评分: ' + v.rating + '分 (' + v.review_count + '评价) | 风格: ' + v.style)
      lines.push('- 价格区间: ' + v.price_range.min.toLocaleString() + '-' + v.price_range.max.toLocaleString() + '元')
      lines.push('- 档期: ' + (v.availability === 'available' ? '可订' : v.availability === 'limited' ? '紧张' : '已满') + ' | 需提前' + v.booking_lead_time_days + '天预订 | 定金' + v.deposit_pct + '%')
      lines.push('- 套餐:')
      for (const pkg of v.packages) {
        lines.push('  - ' + pkg.package_name + ': ' + pkg.price.toLocaleString() + '元（' + pkg.includes.join('、') + '）')
      }
      lines.push('')
    }
  }
  if (result.top_rated.length > 0) {
    lines.push('### ⭐ 评分最高: ' + result.top_rated.join('、'))
  }
  if (result.best_value.length > 0) {
    lines.push('### 💰 性价比之选: ' + result.best_value.join('、'))
  }
  lines.push('')
  lines.push('### 谈判技巧')
  for (const t of result.negotiation_tips) lines.push('- 💡 ' + t)
  lines.push('')
  lines.push('---')
  lines.push('*婚礼策划AI助手 - 锁定心仪四大金刚*')
  return lines.join('\n')
}

function formatThemeReport(result: ThemeResult): string {
  const lines: string[] = []
  lines.push('## 婚礼主题设计报告')
  lines.push('')
  lines.push('设计编号: ' + result.design_id + ' | 主题: ' + result.theme_name + ' | 风格: ' + result.style)
  lines.push('整体氛围: ' + result.mood_board_description)
  lines.push('')
  lines.push('### 推荐色系')
  for (const palette of result.color_palettes) {
    lines.push('#### ' + palette.palette_name + ' - ' + palette.mood_description)
    lines.push('- 主色: ' + palette.primary + ' | 辅色: ' + palette.secondary.join('、') + ' | 点缀: ' + palette.accent)
    lines.push('- 中性色: ' + palette.neutrals.join('、'))
    lines.push('')
  }
  lines.push('### VI设计元素')
  for (const vi of result.vi_elements) {
    lines.push('#### ' + vi.element)
    lines.push('- ' + vi.description)
    lines.push('- 设计建议: ' + vi.design_suggestions.join('、'))
    if (vi.diy_options) lines.push('- DIY方案: ' + vi.diy_options.join('、'))
    lines.push('')
  }
  lines.push('### 场景布置')
  for (const decor of result.decor_ideas) {
    const impact = decor.impact_level === 'high' ? '高' : decor.impact_level === 'medium' ? '中' : '低'
    lines.push('#### ' + decor.area + '（影响力: ' + impact + ' | 预算: ' + decor.estimated_budget_range + '）')
    for (const idea of decor.ideas) lines.push('- ' + idea)
    lines.push('')
  }
  lines.push('### 花艺建议')
  for (const f of result.floral_suggestions) lines.push('- 🌸 ' + f)
  lines.push('')
  lines.push('### 灯光建议')
  for (const l of result.lighting_recommendations) lines.push('- 💡 ' + l)
  lines.push('')
  lines.push('### 个性化贴士')
  for (const p of result.personalization_tips) lines.push('- ✨ ' + p)
  lines.push('')
  lines.push('---')
  lines.push('*婚礼策划AI助手 - 打造独一无二的婚礼美学*')
  return lines.join('\n')
}

function formatGuestReport(result: GuestResult): string {
  const lines: string[] = []
  lines.push('## 宾客名单管理报告')
  lines.push('')
  lines.push('报告编号: ' + result.report_id + ' | 操作: ' + result.action)
  lines.push('总宾客: ' + result.total_guests + ' | 已确认: ' + result.confirmed_count + ' | 已拒绝: ' + result.declined_count + ' | 待定: ' + result.pending_count)
  lines.push('新娘方: ' + result.bride_side_count + ' | 新郎方: ' + result.groom_side_count + ' | 携带伴侣: ' + result.plus_one_count)
  lines.push('')
  lines.push('### 饮食偏好分布')
  lines.push('| 偏好类型 | 人数 |')
  lines.push('|----------|------|')
  for (const [meal, count] of Object.entries(result.meal_breakdown)) {
    const label = meal === 'standard' ? '标准' : meal === 'vegetarian' ? '素食' : meal === 'vegan' ? '纯素' : meal === 'halal' ? '清真' : meal === 'kosher' ? '犹太' : '无麸质'
    lines.push('| ' + label + ' | ' + count + ' |')
  }
  lines.push('')
  if (result.table_assignments.length > 0) {
    lines.push('### 座位安排')
    for (const table of result.table_assignments) {
      lines.push('#### 桌 ' + table.table_number + ' - ' + (table.table_theme || '普通桌'))
      lines.push(table.seats.map(s => s.seat_number + '.' + s.guest_name).join(' '))
      if (table.special_notes) lines.push('备注: ' + table.special_notes)
      lines.push('')
    }
  }
  lines.push('### 座位安排建议')
  for (const note of result.seating_chart_notes) lines.push('- ' + note)
  lines.push('')
  lines.push('### 缓冲建议')
  lines.push('- ' + result.buffer_recommendation)
  lines.push('')
  lines.push('### 贴心提示')
  for (const t of result.tips) lines.push('- 💡 ' + t)
  lines.push('')
  lines.push('---')
  lines.push('*婚礼策划AI助手 - 宾客尽欢，座无虚席*')
  return lines.join('\n')
}

function formatAttireReport(result: AttireResult): string {
  const lines: string[] = []
  lines.push('## 婚纱礼服建议报告')
  lines.push('')
  lines.push('建议编号: ' + result.advisor_id + ' | 角色: ' + result.role)
  lines.push('')
  lines.push('### 服装推荐')
  for (const rec of result.recommendations) {
    lines.push('#### ' + rec.attire_type)
    lines.push('- ' + rec.description)
    lines.push('- 适用场合: ' + rec.best_for.join('、'))
    lines.push('- 面料建议: ' + rec.fabric_suggestions.join('、'))
    lines.push('- 颜色选择: ' + rec.color_options.join('、'))
    lines.push('- 风格提示: ' + rec.style_notes)
    lines.push('- 价格区间: 经济 ' + rec.price_range.budget.toLocaleString() + ' | 中等 ' + rec.price_range.mid.toLocaleString() + ' | 高端 ' + rec.price_range.premium.toLocaleString() + '元')
    lines.push('')
  }
  if (result.accessories.length > 0) {
    lines.push('### 配饰建议')
    for (const acc of result.accessories) {
      const pri = acc.priority === 'must_have' ? '必需' : acc.priority === 'recommended' ? '推荐' : '可选'
      lines.push('- **' + acc.item + '**（' + pri + '）: ' + acc.suggestion)
    }
    lines.push('')
  }
  lines.push('### 造型贴士')
  for (const tip of result.styling_tips) {
    lines.push('- 💡 ' + tip.tip + '（适用: ' + tip.applicable_to + '）- ' + tip.reason)
  }
  lines.push('')
  lines.push('### 色系搭配')
  for (const c of result.color_palette) lines.push('- ' + c)
  lines.push('')
  lines.push('### 面料指南')
  for (const f of result.fabric_guide) lines.push('- ' + f)
  lines.push('')
  lines.push('### 试衣时间表')
  lines.push('| 里程碑 | 时间 |')
  lines.push('|--------|------|')
  for (const ft of result.fitting_timeline) {
    lines.push('| ' + ft.milestone + ' | ' + ft.timing + ' |')
  }
  lines.push('')
  lines.push('### 预算分配')
  for (const b of result.budget_breakdown) {
    lines.push('- ' + b.item + ': 约 ' + b.estimated_cost.toLocaleString() + '元')
  }
  lines.push('')
  lines.push('### 协调注意事项')
  for (const c of result.coordination_notes) lines.push('- ' + c)
  lines.push('')
  lines.push('---')
  lines.push('*婚礼策划AI助手 - 最美的一天，最美的你*')
  return lines.join('\n')
}

function formatHoneymoonReport(result: HoneymoonResult): string {
  const lines: string[] = []
  lines.push('## 蜜月旅行规划报告')
  lines.push('')
  lines.push('计划编号: ' + result.plan_id + ' | 推荐目的地: ' + result.recommended_destination)
  lines.push('')
  lines.push('### 推荐目的地')
  lines.push('| 目的地 | 国家 | 最佳月份 | 人均费用 | 飞行时长 | 浪漫指数 | 签证 |')
  lines.push('|--------|------|----------|----------|----------|----------|------|')
  for (const d of result.destinations) {
    const visa = d.visa_info.requirement === 'visa_free' ? '免签' : d.visa_info.requirement === 'visa_on_arrival' ? '落地签' : d.visa_info.requirement === 'e_visa' ? '电子签' : '使馆签'
    lines.push('| ' + d.name + ' | ' + d.country + ' | ' + d.best_months.join('/') + ' | ' + d.estimated_cost_per_person.toLocaleString() + '元 | ' + d.flight_hours_from_cn + 'h | ' + '⭐'.repeat(d.romantic_rating) + ' | ' + visa + ' |')
  }
  lines.push('')
  lines.push('### 行程安排')
  for (const day of result.itinerary) {
    lines.push('#### 第' + day.day + '天')
    lines.push('- 活动: ' + day.activities.join(' → '))
    lines.push('- 住宿: ' + day.accommodation_type + ' | 餐饮: ' + day.meal_highlights.join('、') + ' | 交通: ' + day.transportation)
    lines.push('')
  }
  lines.push('### 预算分配')
  lines.push('| 类别 | 金额(元) | 备注 |')
  lines.push('|------|----------|------|')
  for (const b of result.budget_breakdown) {
    lines.push('| ' + b.category + ' | ' + b.amount.toLocaleString() + ' | ' + b.notes + ' |')
  }
  lines.push('')
  lines.push('### 签证指南')
  const visa = result.visa_guide
  lines.push('- 签证类型: ' + (visa.requirement === 'visa_free' ? '免签' : visa.requirement === 'visa_on_arrival' ? '落地签' : visa.requirement === 'e_visa' ? '电子签' : '使馆签'))
  lines.push('- 办理时间: ' + visa.processing_days + '天 | 难度: ' + (visa.difficulty === 'easy' ? '简单' : visa.difficulty === 'moderate' ? '中等' : '复杂'))
  lines.push('- 所需材料: ' + visa.documents_needed.join('、'))
  lines.push('- 备注: ' + visa.notes)
  lines.push('')
  lines.push('### 打包清单')
  for (const p of result.packing_tips) lines.push('- 🧳 ' + p)
  lines.push('')
  lines.push('### 出行准备清单')
  for (const c of result.travel_checklist) lines.push('- [ ] ' + c)
  lines.push('')
  lines.push('### 浪漫体验推荐')
  for (const r of result.romantic_experiences) lines.push('- 💕 ' + r)
  lines.push('')
  lines.push('### 预订贴士')
  for (const b of result.booking_tips) lines.push('- 💡 ' + b)
  lines.push('')
  lines.push('---')
  lines.push('*婚礼策划AI助手 - 开启幸福旅程*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 工具注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: 婚庆预算分配
  tools.register(defineTool({
    name: 'wedding_budget_planner',
    description: '婚庆预算分配与成本控制 | 根据总预算、宾客人数、婚礼风格生成详细预算分配方案，含成本预警和省钱建议 | Wedding budget allocation with cost control and savings tips.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: total_budget (number), guest_count (number), wedding_style (luxury|premium|standard|budget), priority_categories?, region, wedding_date?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: BudgetInput = JSON.parse(args.input_data)
      return formatBudgetReport(analyzeBudget(input))
    }
  }))

  // Tool 2: 婚宴场地筛选
  tools.register(defineTool({
    name: 'venue_selector',
    description: '婚宴场地筛选与档期协调 | 搜索比较婚宴场地，含价格、容量、档期、特色信息，提供预订建议 | Wedding venue selection with availability check and booking tips.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: action (search|compare|check_availability|book_tour), city, preferred_areas?, wedding_date, guest_count, budget_range{min,max}, venue_types?, style_preference?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: VenueInput = JSON.parse(args.input_data)
      return formatVenueReport(analyzeVenue(input))
    }
  }))

  // Tool 3: 婚礼筹备倒计时
  tools.register(defineTool({
    name: 'wedding_timeline_scheduler',
    description: '婚礼筹备倒计时与任务排期 | 生成婚礼筹备全周期倒计时计划，含阶段任务、里程碑、紧急待办、进度跟踪 | Wedding countdown timeline with task scheduling and milestone tracking.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: wedding_date, current_date?, wedding_size (intimate|medium|large|grand), vendor_status?, custom_tasks?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TimelineInput = JSON.parse(args.input_data)
      return formatTimelineReport(analyzeTimeline(input))
    }
  }))

  // Tool 4: 四大金刚比价
  tools.register(defineTool({
    name: 'vendor_comparison',
    description: '婚庆四大金刚比价与档期锁定 | 摄影/化妆/主持/摄像供应商比价，含套餐详情、档期状态、谈判技巧 | Photographer/Makeup/MC/Video vendor comparison with packages and booking.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: vendor_type (photographer|makeup_artist|mc|videographer|all), city, wedding_date, budget_per_vendor?, style_preference?, comparison_criteria?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: VendorInput = JSON.parse(args.input_data)
      return formatVendorReport(analyzeVendors(input))
    }
  }))

  // Tool 5: 婚礼主题设计
  tools.register(defineTool({
    name: 'wedding_theme_designer',
    description: '婚礼主题色系VI设计推荐 | 根据风格偏好、季节、场地推荐主题色系、VI元素、场景布置、花艺灯光 | Wedding theme/color/VI design with decor and floral recommendations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: style_preference (romantic|modern|vintage|bohemian|minimalist|luxury|rustic|cultural), season, venue_type, couple_vibe?, cultural_elements?, color_inspiration?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ThemeInput = JSON.parse(args.input_data)
      return formatThemeReport(analyzeTheme(input))
    }
  }))

  // Tool 6: 宾客名单管理
  tools.register(defineTool({
    name: 'guest_list_manager',
    description: '宾客名单管理与座位安排 | 管理宾客名单、RSVP状态、座位分配、饮食偏好统计、缓冲建议 | Guest list management with RSVP tracking and seating arrangements.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: action (add_guests|manage_rsvp|assign_seats|generate_stats), guest_list?, total_tables?, seats_per_table?, seating_constraints?, meal_preferences?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: GuestInput = JSON.parse(args.input_data)
      return formatGuestReport(analyzeGuests(input))
    }
  }))

  // Tool 7: 婚纱礼服建议
  tools.register(defineTool({
    name: 'wedding_attire_advisor',
    description: '婚纱礼服与搭配建议 | 根据角色、身材、婚礼风格推荐服装、配饰、面料、色系搭配、试衣时间表 | Wedding attire advice with outfit matching and fitting timeline.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: role (bride|groom|bridesmaid|groomsman|mother|father), body_type?, height_cm?, skin_tone?, wedding_style, season, budget?, cultural_preferences?, venue_type?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: AttireInput = JSON.parse(args.input_data)
      return formatAttireReport(analyzeAttire(input))
    }
  }))

  // Tool 8: 蜜月旅行规划
  tools.register(defineTool({
    name: 'honeymoon_planner',
    description: '蜜月旅行方案与签证建议 | 推荐蜜月目的地、行程规划、预算分配、签证指南、打包清单、浪漫体验 | Honeymoon trip planning with visa guidance and romantic experiences.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: destination_type (beach|mountain|city|cultural|adventure|cruise|resort), preferred_regions?, duration_days, budget_total, travel_month, departure_city, passport_holder?, visa_flexibility?, interests?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: HoneymoonInput = JSON.parse(args.input_data)
      return formatHoneymoonReport(analyzeHoneymoon(input))
    }
  }))

  console.log('[dsh-tool-weddingagentpro] Loaded v' + VERSION + ' - 婚礼策划AI助手, 8 tools active')
  console.log('  Tools: wedding_budget_planner, venue_selector, wedding_timeline_scheduler, vendor_comparison, wedding_theme_designer, guest_list_manager, wedding_attire_advisor, honeymoon_planner')
}
