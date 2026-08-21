/**
 * DSH 殡仪服务AI助手 Plugin v0.1.0
 * 殡仪服务方案策划与个性化定制 / 墓位管理与节地生态葬规划 / 告别仪式与纪念活动设计 /
 * 哀伤辅导资源与心理援助匹配 / 丧葬补助与保险理赔申请 / 殡仪费用透明化与比价 /
 * 生前契约与遗嘱规划咨询 / 各地丧葬习俗与宗教仪式指南
 *
 * 以尊重、关怀、文化敏感为核心，覆盖殡仪全生命周期服务。
 *
 * 工具清单:
 * 1. funeral_service_planner     — 殡仪服务方案策划与个性化定制
 * 2. cemetery_plot_manager       — 墓位管理与节地生态葬规划
 * 3. memorial_ceremony_designer  — 告别仪式与纪念活动设计
 * 4. grief_counseling_resource   — 哀伤辅导资源与心理援助匹配
 * 5. bereavement_benefit_navigator — 丧葬补助与保险理赔申请
 * 6. funeral_cost_transparency   — 殡仪费用透明化与比价
 * 7. pre_need_planning_advisor   — 生前契约与遗嘱规划咨询
 * 8. cultural_ritual_guide        — 各地丧葬习俗与宗教仪式指南
 *
 * @module dsh-tool-funeralagentpro | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-funeralagentpro'
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

// --- Tool 1: 殡仪服务方案策划 ---
interface PlannerInput {
  service_type: 'traditional' | 'modern' | 'eco' | 'religious' | 'custom'
  religion?: 'buddhist' | 'taoist' | 'christian' | 'islamic' | 'secular' | 'other'
  budget_range: 'economy' | 'standard' | 'premium' | 'luxury'
  deceased_info: { name: string; age: number; gender: 'male' | 'female' }
  preferences: {
    flower_style?: string
    music_preference?: string
    ceremony_duration?: 'brief' | 'standard' | 'extended'
    special_requests?: string
  }
  region: string
}

interface ServiceItem {
  item_id: string
  name: string
  category: string
  description: string
  estimated_cost: number
  status: 'confirmed' | 'optional' | 'recommended'
  notes: string
}

interface TimelineEvent {
  time: string
  activity: string
  location: string
  responsible: string
  status: 'scheduled' | 'pending' | 'flexible'
}

interface PlannerResult {
  plan_id: string
  plan_name: string
  service_type: string
  religion?: string
  items: ServiceItem[]
  total_estimated_cost: number
  budget_tier: string
  timeline: TimelineEvent[]
  checklist: { task: string; responsible: string; done: boolean }[]
  special_arrangements: string[]
}

// --- Tool 2: 墓位管理 ---
interface CemeteryInput {
  action: 'search' | 'compare' | 'eco_planning' | 'maintenance'
  location: string
  plot_type?: 'traditional' | 'wall' | 'garden' | 'sea_burial' | 'tree_burial' | 'scattering'
  budget_ceiling?: number
  eco_preference?: boolean
  family_size?: number
}

interface PlotInfo {
  plot_id: string
  cemetery_name: string
  section: string
  plot_type: string
  size_sqm: number
  price: number
  availability: 'available' | 'reserved' | 'occupied'
  eco_certified: boolean
  features: string[]
  maintenance_fee_annual: number
}

interface EcoOption {
  method: string
  description: string
  environmental_impact: string
  cost_estimate: number
  legal_status: string
  popularity_pct: number
}

interface CemeteryResult {
  action: string
  plots: PlotInfo[]
  eco_options: EcoOption[]
  total_available: number
  price_range: { min: number; max: number }
  recommendations: string[]
  regulations: string[]
}

// --- Tool 3: 告别仪式设计 ---
interface CeremonyInput {
  ceremony_type: 'funeral' | 'memorial' | 'celebration_of_life' | 'graveside' | 'virtual'
  deceased_name: string
  attendee_count: number
  venue_type: 'chapel' | 'outdoor' | 'home' | 'temple' | 'mosque' | 'church' | 'online'
  religious_tradition?: string
  tone: 'solemn' | 'warm' | 'celebratory' | 'simple'
  media_elements?: ('slideshow' | 'video' | 'live_stream' | 'music' | 'eulogy')[]
  special_tributes?: string[]
}

interface ProgramSegment {
  order: number
  title: string
  duration_min: number
  description: string
  participants: string[]
  media?: string
  notes: string
}

interface VenueSetup {
  area: string
  arrangement: string
  capacity: number
  equipment: string[]
  accessibility: string[]
}

interface CeremonyResult {
  ceremony_id: string
  ceremony_type: string
  program: ProgramSegment[]
  total_duration_min: number
  venue_setup: VenueSetup
  attire_suggestion: string
  floral_arrangement: string
  music_playlist: string[]
  contingency_plan: string
}

// --- Tool 4: 哀伤辅导资源 ---
interface GriefInput {
  seeker_type: 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'caregiver'
  relationship_to_deceased: string
  loss_type: 'sudden' | 'expected' | 'traumatic' | 'after_illness'
  time_since_loss_weeks: number
  symptoms: ('insomnia' | 'anxiety' | 'depression' | 'anger' | 'guilt' | 'numbness' | 'withdrawal' | 'physical_pain')[]
  support_group_preference: 'individual' | 'group' | 'family' | 'online'
  language: string
}

interface Counselor {
  counselor_id: string
  name: string
  credentials: string[]
  specialties: string[]
  languages: string[]
  session_format: string[]
  availability: string
  rating: number
  experience_years: number
}

interface SupportResource {
  resource_id: string
  name: string
  type: 'hotline' | 'support_group' | 'workshop' | 'literature' | 'app' | 'retreat'
  description: string
  contact: string
  cost: string
  schedule: string
}

interface WellnessPlan {
  phase: string
  goals: string[]
  activities: string[]
  duration_weeks: number
  self_care_tips: string[]
}

interface GriefResult {
  assessment_id: string
  grief_stage_estimate: string
  risk_level: 'low' | 'moderate' | 'high'
  matched_counselors: Counselor[]
  resources: SupportResource[]
  wellness_plan: WellnessPlan[]
  crisis_hotline: string
  coping_strategies: string[]
}

// --- Tool 5: 丧葬补助与保险理赔 ---
interface BenefitInput {
  applicant_relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other'
  deceased_employment_status: 'employed' | 'retired' | 'self_employed' | 'unemployed' | 'military' | 'child'
  insurance_types: ('life' | 'accident' | 'social_security' | 'workers_comp' | 'military' | 'commercial')[]
  region: string
  monthly_income?: number
  has_documents: boolean
  urgency: 'standard' | 'urgent' | 'emergency'
}

interface BenefitItem {
  benefit_id: string
  name: string
  provider: string
  category: 'government' | 'insurance' | 'employer' | 'charity'
  max_amount: number
  estimated_amount: number
  requirements: string[]
  application_deadline: string
  processing_time_days: number
  status: 'eligible' | 'pending_review' | 'needs_document' | 'not_applicable'
}

interface DocumentChecklist {
  document: string
  required: boolean
  obtained: boolean
  notes: string
}

interface ClaimsStep {
  step: number
  action: string
  responsible: string
  timeframe: string
  status: 'pending' | 'in_progress' | 'completed'
  notes: string
}

interface BenefitResult {
  application_id: string
  total_estimated_benefit: number
  benefits: BenefitItem[]
  documents: DocumentChecklist[]
  claims_steps: ClaimsStep[]
  legal_aid_available: boolean
  additional_resources: string[]
}

// --- Tool 6: 殡仪费用透明化 ---
interface CostInput {
  service_packages: ('basic' | 'standard' | 'premium' | 'custom')[]
  region: string
  funeral_home_count?: number
  comparison_criteria: ('price' | 'service_quality' | 'facilities' | 'location' | 'reviews')[]
  itemized_only?: boolean
}

interface CostItem {
  item_name: string
  category: string
  low_price: number
  avg_price: number
  high_price: number
  mandatory: boolean
  description: string
}

interface FuneralHomeComparison {
  home_id: string
  name: string
  address: string
  overall_rating: number
  price_level: 'budget' | 'mid_range' | 'premium'
  packages_offered: string[]
  review_highlights: string[]
  transparency_score: number
}

interface CostBreakdown {
  category: string
  items: CostItem[]
  subtotal_low: number
  subtotal_avg: number
  subtotal_high: number
}

interface CostResult {
  report_id: string
  region: string
  cost_breakdowns: CostBreakdown[]
  grand_total: { low: number; avg: number; high: number }
  funeral_homes: FuneralHomeComparison[]
  savings_tips: string[]
  hidden_fees_warnings: string[]
  consumer_rights: string[]
}

// --- Tool 7: 生前契约与遗嘱规划 ---
interface PreNeedInput {
  planning_type: 'pre_need_contract' | 'will_planning' | 'estate_planning' | 'all'
  age_group: 'under_40' | '40_55' | '55_70' | 'over_70'
  marital_status: 'single' | 'married' | 'divorced' | 'widowed'
  has_children: boolean
  estate_value_estimate?: 'under_100k' | '100k_500k' | '500k_1m' | 'over_1m'
  existing_will: boolean
  healthcare_directive: boolean
  financial_goals?: string[]
}

interface ContractOption {
  contract_id: string
  provider: string
  plan_name: string
  total_cost: number
  payment_options: string[]
  coverage_items: string[]
  refund_policy: string
  inflation_protection: boolean
  rating: number
}

interface WillComponent {
  section: string
  required: boolean
  completed: boolean
  description: string
  legal_reference: string
  common_mistakes: string[]
}

interface EstateAsset {
  asset_type: string
  estimated_value: number
  beneficiary_suggestion: string
  probate_required: boolean
  tax_implications: string
}

interface PreNeedResult {
  plan_id: string
  planning_type: string
  contract_options: ContractOption[]
  will_components: WillComponent[]
  estate_assets: EstateAsset[]
  legal_referrals: string[]
  action_items: { task: string; priority: 'high' | 'medium' | 'low'; deadline: string }[]
  tax_saving_estimate: number
}

// --- Tool 8: 各地丧葬习俗 ---
interface RitualInput {
  culture_region: string
  query_type: 'overview' | 'preparation' | 'ceremony' | 'mourning_period' | 'taboos' | 'modern_adaptation'
  language: string
  detail_level: 'summary' | 'detailed' | 'expert'
  specific_customs?: string[]
}

interface CustomDetail {
  custom_name: string
  description: string
  significance: string
  when_observed: string
  variations: string[]
  modern_adaptation: string
}

interface MourningPeriod {
  period_name: string
  duration: string
  practices: string[]
  restrictions: string[]
  modern_context: string
}

interface RitualResource {
  resource_type: 'book' | 'website' | 'organization' | 'expert'
  title: string
  description: string
  relevance: string
}

interface RitualResult {
  guide_id: string
  culture_region: string
  overview: string
  customs: CustomDetail[]
  mourning_periods: MourningPeriod[]
  preparation_checklist: string[]
  taboos: { taboo: string; reason: string; severity: 'strict' | 'moderate' | 'suggestion' }[]
  modern_adaptations: string[]
  interfaith_considerations: string[]
  resources: RitualResource[]
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: 殡仪服务方案策划 分析 ---
function analyzePlanner(input: PlannerInput): PlannerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.deceased_info.name + input.service_type + input.region
  ))

  const planId = 'PLAN-' + Date.now() + '-' + rng.nextInt(1000, 9999)
  const budgetMultiplier = input.budget_range === 'luxury' ? 3 : input.budget_range === 'premium' ? 2 : input.budget_range === 'standard' ? 1.2 : 1

  const items: ServiceItem[] = [
    { item_id: 'srv-001', name: '遗体接运', category: '基础服务', description: '专业遗体接运车辆，配备冷藏设备', estimated_cost: Math.round(800 * budgetMultiplier), status: 'confirmed', notes: '24小时服务' },
    { item_id: 'srv-002', name: '遗体整容化妆', category: '基础服务', description: '专业整容师进行面部修复与化妆', estimated_cost: Math.round(1500 * budgetMultiplier), status: 'confirmed', notes: '尊重遗容，恢复自然面貌' },
    { item_id: 'srv-003', name: '遗体冷藏', category: '基础服务', description: '殡仪馆冷藏设备存放', estimated_cost: Math.round(300 * budgetMultiplier), status: 'confirmed', notes: '按天计费' },
    { item_id: 'srv-004', name: '告别厅租赁', category: '场地服务', description: '提供告别仪式场地', estimated_cost: Math.round(2000 * budgetMultiplier), status: 'confirmed', notes: '含音响、空调设备' },
    { item_id: 'srv-005', name: '火化服务', category: '基础服务', description: '标准火化流程', estimated_cost: Math.round(1200 * budgetMultiplier), status: 'confirmed', notes: '含骨灰装殓' },
    { item_id: 'srv-006', name: '骨灰盒', category: '用品', description: '精致骨灰盒（多种材质可选）', estimated_cost: Math.round(1000 * budgetMultiplier), status: 'optional', notes: '材质从木质到玉石可选' },
    { item_id: 'srv-007', name: '鲜花花圈', category: '用品', description: '鲜花布置，含花圈花篮', estimated_cost: Math.round(1200 * budgetMultiplier), status: 'optional', notes: input.preferences.flower_style || '可定制鲜花风格' },
    { item_id: 'srv-008', name: '礼仪主持', category: '人员服务', description: '专业司仪主持告别仪式', estimated_cost: Math.round(1500 * budgetMultiplier), status: 'recommended', notes: '可根据宗教需求调整流程' },
  ]

  if (input.religion && input.religion !== 'secular') {
    const priest = input.religion === 'buddhist' ? '法师' : input.religion === 'taoist' ? '道长' : input.religion === 'christian' ? '神父/牧师' : '阿訇/伊玛目'
    items.push({
      item_id: 'srv-009',
      name: input.religion + '宗教仪式',
      category: '宗教服务',
      description: '由' + priest + '主持宗教仪式',
      estimated_cost: Math.round(2000 * budgetMultiplier),
      status: 'recommended',
      notes: '尊重信仰传统，提供经文诵读'
    })
  }

  const totalCost = items.reduce((sum, item) => sum + item.estimated_cost, 0)

  const timeline: TimelineEvent[] = [
    { time: '第1天 上午', activity: '遗体接运至殡仪馆', location: '医院/住所到殡仪馆', responsible: '殡仪服务人员', status: 'scheduled' },
    { time: '第1天 下午', activity: '遗体整容化妆', location: '殡仪馆整容室', responsible: '整容师', status: 'scheduled' },
    { time: '第2天 上午', activity: '家属确认仪式流程', location: '殡仪馆接待厅', responsible: '礼仪顾问', status: 'pending' },
    { time: '第2天 下午', activity: '告别仪式', location: '告别厅', responsible: '礼仪主持', status: 'scheduled' },
    { time: '第3天 上午', activity: '火化', location: '火化车间', responsible: '火化师', status: 'flexible' },
    { time: '第3天 下午', activity: '骨灰领取/安葬', location: '骨灰寄存处/墓地', responsible: '家属', status: 'flexible' },
  ]

  const checklist = [
    { task: '死亡证明获取', responsible: '家属', done: false },
    { task: '身份关系证明', responsible: '家属', done: false },
    { task: '遗体接运确认', responsible: '殡仪馆', done: false },
    { task: '仪式流程确认', responsible: '礼仪顾问', done: false },
    { task: '骨灰处理方式确认', responsible: '家属', done: false },
  ]

  const specialArrangements: string[] = []
  if (input.preferences.special_requests) {
    specialArrangements.push('特别需求: ' + input.preferences.special_requests)
  }
  if (input.preferences.music_preference) {
    specialArrangements.push('音乐偏好: ' + input.preferences.music_preference)
  }
  if (input.preferences.ceremony_duration === 'extended') {
    specialArrangements.push('延长仪式时间，增设家属告别环节')
  }

  return {
    plan_id: planId,
    plan_name: input.deceased_info.name + '殡仪服务方案',
    service_type: input.service_type,
    religion: input.religion,
    items: items,
    total_estimated_cost: totalCost,
    budget_tier: input.budget_range,
    timeline: timeline,
    checklist: checklist,
    special_arrangements: specialArrangements,
  }
}

// --- Tool 2: 墓位管理 分析 ---
function analyzeCemetery(input: CemeteryInput): CemeteryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.action + input.location + (input.plot_type || 'all')
  ))

  const cemeteryNames = ['福寿园', '长青公墓', '永安陵园', '祥和墓园', '龙山公墓', '永怀陵园']
  const plotTypes = input.plot_type ? [input.plot_type] : ['traditional', 'wall', 'garden', 'sea_burial', 'tree_burial', 'scattering']
  const plots: PlotInfo[] = []

  for (let i = 0; i < rng.nextInt(4, 8); i++) {
    const pType = rng.pick(plotTypes)
    const basePrice = pType === 'sea_burial' ? 3000 : pType === 'tree_burial' ? 8000 : pType === 'scattering' ? 1000 : pType === 'wall' ? 15000 : pType === 'garden' ? 35000 : 50000
    const price = Math.round(basePrice * rng.nextFloat(0.7, 1.5))
    if (input.budget_ceiling && price > input.budget_ceiling) continue

    plots.push({
      plot_id: 'PLOT-' + rng.nextInt(10000, 99999),
      cemetery_name: rng.pick(cemeteryNames),
      section: rng.pick(['福', '寿', '安', '康', '和', '顺']) + rng.nextInt(1, 20) + '区',
      plot_type: pType,
      size_sqm: pType === 'tree_burial' ? rng.nextFloat(2, 4) : pType === 'wall' ? rng.nextFloat(0.3, 0.8) : rng.nextFloat(1, 3),
      price: price,
      availability: rng.pick(['available', 'available', 'available', 'reserved', 'occupied']),
      eco_certified: pType !== 'traditional',
      features: [
        rng.pick(['绿化环绕', '交通便利', '风水佳位', '安静肃穆', '园林式设计']),
        rng.pick(['免费祭扫停车', '全年维护', '在线祭拜', '代客扫墓']),
      ],
      maintenance_fee_annual: Math.round(price * rng.nextFloat(0.01, 0.03)),
    })
  }

  const ecoOptions: EcoOption[] = [
    { method: '海葬', description: '将骨灰撒入指定海域，回归自然', environmental_impact: '零土地占用，无环保负担', cost_estimate: 1000, legal_status: '国家鼓励，政府补贴', popularity_pct: 15 },
    { method: '树葬', description: '骨灰安葬于树下，以树为记', environmental_impact: '绿化环境，固碳减排', cost_estimate: 8000, legal_status: '多地推广，有补贴政策', popularity_pct: 12 },
    { method: '花坛葬', description: '骨灰安葬于花坛中，上植花卉', environmental_impact: '美化环境，节约土地', cost_estimate: 5000, legal_status: '城市公墓主推', popularity_pct: 8 },
    { method: '草坪葬', description: '骨灰安葬于草坪下，自然石标记', environmental_impact: '保持绿地面积，生态友好', cost_estimate: 12000, legal_status: '广泛认可', popularity_pct: 10 },
    { method: '壁葬', description: '骨灰存放于墙壁格位中', environmental_impact: '节约土地80%以上', cost_estimate: 15000, legal_status: '城市主流选择', popularity_pct: 20 },
    { method: '降解葬', description: '可降解骨灰罐深埋，自然分解', environmental_impact: '完全零污染，土地可循环', cost_estimate: 6000, legal_status: '新兴方式，试点推广', popularity_pct: 5 },
  ]

  const recommendations: string[] = [
    '建议实地考察墓园环境，关注交通便利性和维护状况',
    '确认墓园经营资质（民政部门批准文件）',
    '了解20年管理费收费周期和标准',
    '优先考虑生态葬法，多数地区有政府补贴',
    input.eco_preference ? '已选择生态葬偏好，推荐海葬/树葬/花坛葬' : '生态葬既环保又经济，建议了解',
  ]

  const regulations: string[] = [
    '墓穴使用权期限一般为20年，到期需续缴管理费',
    '禁止在农村公益性墓地外从事经营性活动',
    '生态葬各地补贴标准不同，请咨询当地民政局',
    '海葬需在指定海域进行，由民政部门组织',
  ]

  const prices = plots.map(p => p.price)
  return {
    action: input.action,
    plots: plots,
    eco_options: ecoOptions,
    total_available: plots.filter(p => p.availability === 'available').length,
    price_range: { min: prices.length > 0 ? Math.min(...prices) : 0, max: prices.length > 0 ? Math.max(...prices) : 0 },
    recommendations: recommendations,
    regulations: regulations,
  }
}

// --- Tool 3: 告别仪式设计 分析 ---
function analyzeCeremony(input: CeremonyInput): CeremonyResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.ceremony_type + input.deceased_name + input.venue_type
  ))

  const ceremonyId = 'CER-' + Date.now() + '-' + rng.nextInt(1000, 9999)
  const program: ProgramSegment[] = []

  program.push({ order: 1, title: '来宾签到', duration_min: 15, description: '来宾陆续到场签到，佩戴胸花', participants: ['家属代表', '司仪'], notes: '播放轻柔背景音乐' })

  if (input.religious_tradition) {
    program.push({
      order: 2,
      title: '宗教仪轨',
      duration_min: 20,
      description: '按照' + input.religious_tradition + '传统进行祈祷/诵经/圣仪',
      participants: [rng.pick(['法师', '道长', '神父', '牧师', '阿訇', '拉比'])],
      notes: '提前与宗教人士确认流程细节',
      media: input.media_elements && input.media_elements.includes('music') ? '宗教音乐' : undefined,
    })
  }

  program.push({
    order: program.length + 1,
    title: '生平回顾',
    duration_min: 10,
    description: '展示' + input.deceased_name + '生平照片与重要时刻',
    participants: ['司仪'],
    media: input.media_elements && input.media_elements.includes('slideshow') ? '电子相册/视频' : '照片展示',
    notes: '可配合旁白讲述',
  })

  program.push({
    order: program.length + 1,
    title: '致悼词',
    duration_min: 15,
    description: '家属及友人代表致悼词',
    participants: ['家属代表', '亲友代表'],
    notes: '控制每人在3-5分钟',
  })

  if (input.media_elements && input.media_elements.includes('eulogy')) {
    program.push({
      order: program.length + 1,
      title: '追思发言',
      duration_min: 15,
      description: '来宾自由分享与逝者的珍贵回忆',
      participants: ['来宾自愿'],
      notes: '提供开放麦环节',
    })
  }

  program.push({
    order: program.length + 1,
    title: '默哀告别',
    duration_min: 5,
    description: '全体默哀，向遗体告别',
    participants: ['全体来宾'],
    notes: '奏哀乐',
  })

  program.push({
    order: program.length + 1,
    title: '送别',
    duration_min: 10,
    description: '来宾列队送别，家属致谢',
    participants: ['全体来宾', '家属'],
    notes: '发放感谢卡',
  })

  const totalDuration = program.reduce((sum, seg) => sum + seg.duration_min, 0)

  const venueSetup: VenueSetup = {
    area: input.venue_type,
    arrangement: input.tone === 'solemn' ? '黑白肃穆布置' : input.tone === 'warm' ? '温暖色调花艺布置' : input.tone === 'celebratory' ? '明快色彩生命礼赞' : '简洁朴素布置',
    capacity: input.attendee_count + rng.nextInt(10, 30),
    equipment: ['音响系统', '投影设备', '空调系统', '座椅'],
    accessibility: ['轮椅通道', '无障碍卫生间', '老人专座区'],
  }

  const musicPlaylist = [
    '哀乐（传统）',
    '送别（骊歌）',
    '思念曲',
  ]

  const specialTributes = input.special_tributes || []
  if (specialTributes.length > 0) {
    program.push({
      order: program.length + 1,
      title: '特别致敬',
      duration_min: specialTributes.length * 5,
      description: specialTributes.join('；'),
      participants: ['家属安排'],
      notes: '根据家属特殊需求定制',
    })
  }

  return {
    ceremony_id: ceremonyId,
    ceremony_type: input.ceremony_type,
    program: program,
    total_duration_min: totalDuration,
    venue_setup: venueSetup,
    attire_suggestion: input.tone === 'celebratory' ? '可穿着逝者喜爱的颜色或服饰，不必全黑' : '深色或素色服装为主，保持庄重',
    floral_arrangement: input.tone === 'warm' ? '白色百合+粉色玫瑰+绿色植物' : input.tone === 'celebratory' ? '多彩鲜花搭配，体现生命力' : '白色菊花+松枝（传统庄重）',
    music_playlist: musicPlaylist,
    contingency_plan: '备用方案：如遇恶劣天气，户外仪式转移至室内备用厅；设备故障时使用备用音响；人数超出预期时启用分会场直播',
  }
}

// --- Tool 4: 哀伤辅导资源 分析 ---
function analyzeGrief(input: GriefInput): GriefResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.seeker_type + input.relationship_to_deceased + input.loss_type
  ))

  const assessmentId = 'GRIEF-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const symptomSeverity = input.symptoms.length
  const isHighRisk = symptomSeverity >= 5 || input.loss_type === 'traumatic' || (input.time_since_loss_weeks > 12 && symptomSeverity >= 4)
  const riskLevel: GriefResult['risk_level'] = isHighRisk ? 'high' : symptomSeverity >= 3 ? 'moderate' : 'low'

  const griefStages = ['震惊与否认', '思念与回忆', '愤怒与自责', '沮丧与空洞', '接纳与重建', '意义与成长']
  const stageIndex = Math.min(Math.floor(input.time_since_loss_weeks / 4), griefStages.length - 1)

  const counselorNames = ['李心语', '王明慧', '陈静雅', '张伟民', '林若兰', '赵思远', '周慧敏', '郑安然']
  const credentialsList = [
    ['国家二级心理咨询师', '哀伤辅导认证'],
    ['临床心理学硕士', '悲伤治疗师'],
    ['社工师', '危机干预认证'],
    ['精神健康咨询认证', '正念减压导师'],
  ]
  const specialtiesList = [
    ['丧失与哀伤', '婚姻丧偶', '老年丧偶'],
    ['儿童哀伤', '青少年心理', '家庭治疗'],
    ['创伤后应激', '突发丧亲', '危机干预'],
    ['正念疗愈', '存在主义治疗', '意义疗法'],
  ]

  const numCounselors = rng.nextInt(3, 5)
  const matchedCounselors: Counselor[] = []
  for (let i = 0; i < numCounselors; i++) {
    matchedCounselors.push({
      counselor_id: 'Coun-' + rng.nextInt(1000, 9999),
      name: counselorNames[i % counselorNames.length],
      credentials: rng.pick(credentialsList),
      specialties: rng.pick(specialtiesList),
      languages: [input.language],
      session_format: input.support_group_preference === 'online' ? ['线上视频', '电话咨询'] : ['面对面', '线上视频', '电话'],
      availability: rng.pick(['工作日下午', '周末可约', '全周灵活', '仅工作日']),
      rating: Math.round(rng.nextFloat(4.2, 5.0) * 10) / 10,
      experience_years: rng.nextInt(3, 20),
    })
  }
  matchedCounselors.sort((a, b) => b.rating - a.rating)

  const resources: SupportResource[] = [
    { resource_id: 'res-001', name: '24小时心理援助热线', type: 'hotline', description: '专业心理咨询师24小时在线', contact: '400-161-9995', cost: '免费', schedule: '全天候' },
    { resource_id: 'res-002', name: '哀伤互助小组', type: 'support_group', description: '由经历类似丧失的成员组成的支持团体', contact: '各地社区中心', cost: '免费', schedule: '每周一次' },
    { resource_id: 'res-003', name: '正念减压工作坊', type: 'workshop', description: '8周正念减压课程，缓解哀伤躯体症状', contact: '各心理咨询机构', cost: '500-2000元', schedule: '周末班' },
    { resource_id: 'res-004', name: '哀伤疗愈书籍推荐', type: 'literature', description: '《哀伤疗愈》《直视骄阳》《当呼吸化为空气》等', contact: '线上书店', cost: '30-80元/本', schedule: '自助阅读' },
    { resource_id: 'res-005', name: '线上哀伤辅导APP', type: 'app', description: '每日情绪记录、冥想引导、互助社区', contact: '应用商店', cost: '部分免费', schedule: '7x24小时' },
  ]

  const wellnessPlan: WellnessPlan[] = [
    { phase: '急性期（1-4周）', goals: ['稳定情绪', '接受丧失现实'], activities: ['允许自己哭泣', '与信任的人倾诉', '保持基本作息'], duration_weeks: 4, self_care_tips: ['保证睡眠', '简单运动', '写日记记录感受'] },
    { phase: '适应期（1-3月）', goals: ['建立新生活节奏', '处理遗留事务'], activities: ['参加互助小组', '纪念仪式活动', '逐步恢复社交'], duration_weeks: 8, self_care_tips: ['规律运动', '营养饮食', '设定小目标'] },
    { phase: '重建期（3月以上）', goals: ['找到生命新意义', '与他人建立联结'], activities: ['志愿服务', '培养新兴趣', '深度心理咨询'], duration_weeks: 12, self_care_tips: ['尊重自己的节奏', '庆祝小进步', '纪念不等于遗忘'] },
  ]

  const copingStrategies = [
    '允许哀伤存在，不急于走出来',
    '与有类似经历的人交流',
    '保持身体活动，每天30分钟散步',
    '写哀伤日记或给逝者的信',
    '保留纪念物，创造私人纪念仪式',
    '避免做重大人生决定（丧亲6个月内）',
    '寻求专业帮助是勇敢的表现',
  ]

  return {
    assessment_id: assessmentId,
    grief_stage_estimate: griefStages[stageIndex],
    risk_level: riskLevel,
    matched_counselors: matchedCounselors,
    resources: resources,
    wellness_plan: wellnessPlan,
    crisis_hotline: '全国心理援助热线：400-161-9995 | 心理危机干预热线：010-82951332',
    coping_strategies: copingStrategies,
  }
}

// --- Tool 5: 丧葬补助与保险理赔 分析 ---
function analyzeBenefits(input: BenefitInput): BenefitResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.applicant_relationship + input.deceased_employment_status + input.region
  ))

  const applicationId = 'BEN-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const benefits: BenefitItem[] = []

  if (input.insurance_types.includes('social_security')) {
    benefits.push({
      benefit_id: 'BNF-' + rng.nextInt(1000, 9999),
      name: '丧葬补助金',
      provider: '社保经办机构',
      category: 'government',
      max_amount: 10000,
      estimated_amount: Math.round(10000 * rng.nextFloat(0.5, 0.95)),
      requirements: ['死亡证明', '申请人身份证', '关系证明', '申请表'],
      application_deadline: '死亡后6个月内',
      processing_time_days: 15,
      status: input.has_documents ? 'eligible' : 'needs_document'
    })
    benefits.push({
      benefit_id: 'BNF-' + rng.nextInt(1000, 9999),
      name: '遗属抚恤金',
      provider: '社保经办机构',
      category: 'government',
      max_amount: 200000,
      estimated_amount: Math.round(200000 * rng.nextFloat(0.5, 0.95)),
      requirements: ['死亡证明', '劳动关系证明', '遗属申请表'],
      application_deadline: '死亡后3个月内',
      processing_time_days: 30,
      status: input.has_documents ? 'eligible' : 'needs_document'
    })
  }

  if (input.insurance_types.includes('life') || input.insurance_types.includes('commercial')) {
    benefits.push({
      benefit_id: 'BNF-' + rng.nextInt(1000, 9999),
      name: '身故保险理赔',
      provider: '商业保险公司',
      category: 'insurance',
      max_amount: 500000,
      estimated_amount: Math.round(500000 * rng.nextFloat(0.5, 0.95)),
      requirements: ['保险合同', '死亡证明', '受益人身份证', '理赔申请表'],
      application_deadline: '事故发生后2年内',
      processing_time_days: 10,
      status: input.has_documents ? 'eligible' : 'needs_document'
    })
  }

  if (input.insurance_types.includes('military')) {
    benefits.push({
      benefit_id: 'BNF-' + rng.nextInt(1000, 9999),
      name: '烈士/军人抚恤金',
      provider: '退役军人事务局',
      category: 'government',
      max_amount: 800000,
      estimated_amount: Math.round(800000 * rng.nextFloat(0.5, 0.95)),
      requirements: ['烈士/军人证明', '死亡证明', '遗属关系证明'],
      application_deadline: '死亡后6个月内',
      processing_time_days: 20,
      status: input.has_documents ? 'eligible' : 'needs_document'
    })
  }

  if (input.insurance_types.includes('workers_comp')) {
    benefits.push({
      benefit_id: 'BNF-' + rng.nextInt(1000, 9999),
      name: '工亡补助金',
      provider: '工伤保险基金',
      category: 'insurance',
      max_amount: 900000,
      estimated_amount: Math.round(900000 * rng.nextFloat(0.5, 0.95)),
      requirements: ['工伤认定书', '死亡证明', '劳动关系证明'],
      application_deadline: '工伤认定后1年内',
      processing_time_days: 20,
      status: input.has_documents ? 'eligible' : 'needs_document'
    })
  }

  if (benefits.length === 0) {
    benefits.push({
      benefit_id: 'BNF-' + rng.nextInt(1000, 9999),
      name: '单位丧葬抚慰金',
      provider: '原工作单位',
      category: 'employer',
      max_amount: 50000,
      estimated_amount: Math.round(50000 * rng.nextFloat(0.3, 0.8)),
      requirements: ['死亡证明', '劳动合同', '单位申请表'],
      application_deadline: '死亡后3个月内',
      processing_time_days: 14,
      status: input.has_documents ? 'pending_review' : 'needs_document'
    })
  }

  const totalBenefit = benefits.reduce((sum, b) => sum + b.estimated_amount, 0)

  const documents: DocumentChecklist[] = [
    { document: '居民死亡医学证明书', required: true, obtained: input.has_documents, notes: '医院或社区卫生中心开具' },
    { document: '申请人身份证原件及复印件', required: true, obtained: input.has_documents, notes: '正反面复印' },
    { document: '户口簿或亲属关系证明', required: true, obtained: input.has_documents, notes: '证明与逝者关系' },
    { document: '逝者社保卡/退休证', required: true, obtained: false, notes: '用于核实身份' },
    { document: '银行账户信息', required: true, obtained: false, notes: '用于接收补助款项' },
    { document: '火化证明', required: true, obtained: false, notes: '殡仪馆开具' },
    { document: '保险合同（如有商业保险）', required: false, obtained: false, notes: '联系保险公司确认' },
  ]

  const claimsSteps: ClaimsStep[] = [
    { step: 1, action: '获取死亡证明', responsible: '家属', timeframe: '死亡后尽快', status: 'completed', notes: '医院或居委会' },
    { step: 2, action: '注销户口', responsible: '家属', timeframe: '死亡后1个月内', status: 'pending', notes: '当地派出所' },
    { step: 3, action: '准备申请材料', responsible: '家属', timeframe: '1周内', status: 'in_progress', notes: '按清单准备' },
    { step: 4, action: '提交社保丧葬补助申请', responsible: '家属/代办', timeframe: '材料齐全后', status: 'pending', notes: '社保经办大厅' },
    { step: 5, action: '保险理赔申请', responsible: '受益人', timeframe: '知道事故后及时', status: 'pending', notes: '联系保险公司' },
    { step: 6, action: '跟踪审核进度', responsible: '家属', timeframe: '每1-2周', status: 'pending', notes: '电话/现场查询' },
    { step: 7, action: '领取补助/理赔款', responsible: '家属/受益人', timeframe: '审核通过后', status: 'pending', notes: '银行转账' },
  ]

  const additionalResources = [
    '当地民政局社会救助窗口',
    '法律援助中心（12348）',
    '工会困难职工帮扶（如有）',
    '红十字会大病救助（特定情况）',
  ]

  return {
    application_id: applicationId,
    total_estimated_benefit: totalBenefit,
    benefits: benefits,
    documents: documents,
    claims_steps: claimsSteps,
    legal_aid_available: true,
    additional_resources: additionalResources,
  }
}

// --- Tool 6: 殡仪费用透明化 分析 ---
function analyzeCost(input: CostInput): CostResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.region + input.service_packages.join(',')
  ))

  const reportId = 'COST-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const costDatabase: Record<string, CostItem[]> = {
    '基础服务': [
      { item_name: '遗体接运', category: '基础服务', low_price: 500, avg_price: 800, high_price: 2000, mandatory: true, description: '含车辆费和基础设备' },
      { item_name: '遗体冷藏（每天）', category: '基础服务', low_price: 100, avg_price: 200, high_price: 500, mandatory: true, description: '按日计费' },
      { item_name: '火化费', category: '基础服务', low_price: 800, avg_price: 1200, high_price: 3000, mandatory: true, description: '含基本火化服务' },
    ],
    '仪式服务': [
      { item_name: '告别厅租赁', category: '仪式服务', low_price: 1000, avg_price: 2500, high_price: 8000, mandatory: false, description: '按时段计费' },
      { item_name: '司仪/主持费', category: '仪式服务', low_price: 800, avg_price: 1500, high_price: 5000, mandatory: false, description: '专业司仪主持' },
      { item_name: '遗体整容化妆', category: '仪式服务', low_price: 800, avg_price: 2000, high_price: 10000, mandatory: false, description: '按复杂程度' },
    ],
    '用品': [
      { item_name: '骨灰盒', category: '用品', low_price: 300, avg_price: 1500, high_price: 20000, mandatory: true, description: '材质差异大' },
      { item_name: '花圈花篮', category: '用品', low_price: 200, avg_price: 800, high_price: 3000, mandatory: false, description: '数量和材质不同' },
      { item_name: '寿衣', category: '用品', low_price: 300, avg_price: 1200, high_price: 8000, mandatory: false, description: '传统或现代款式' },
    ],
    '可选服务': [
      { item_name: '灵车装饰', category: '可选服务', low_price: 500, avg_price: 1500, high_price: 5000, mandatory: false, description: '鲜花装饰' },
      { item_name: '乐队演奏', category: '可选服务', low_price: 1000, avg_price: 3000, high_price: 8000, mandatory: false, description: '传统乐队或铜管' },
      { item_name: '摄像纪念', category: '可选服务', low_price: 1000, avg_price: 3000, high_price: 10000, mandatory: false, description: '全程或精编' },
    ],
  }

  const costBreakdowns: CostBreakdown[] = []
  for (const [category, items] of Object.entries(costDatabase)) {
    const catItems = input.itemized_only && category === '可选服务' ? [] : items
    if (catItems.length > 0) {
      costBreakdowns.push({
        category: category,
        items: catItems,
        subtotal_low: catItems.reduce((s, i) => s + i.low_price, 0),
        subtotal_avg: catItems.reduce((s, i) => s + i.avg_price, 0),
        subtotal_high: catItems.reduce((s, i) => s + i.high_price, 0),
      })
    }
  }

  const grandLow = costBreakdowns.reduce((s, b) => s + b.subtotal_low, 0)
  const grandAvg = costBreakdowns.reduce((s, b) => s + b.subtotal_avg, 0)
  const grandHigh = costBreakdowns.reduce((s, b) => s + b.subtotal_high, 0)

  const funeralHomeNames = [
    '福安殡仪馆', '祥和永恒殡仪', '安宁送别服务', '纪念园殡仪中心', '清风殡仪服务', '永恒之光殡仪',
  ]
  const funeralHomes: FuneralHomeComparison[] = []
  const count = input.funeral_home_count || rng.nextInt(3, 6)
  for (let i = 0; i < count; i++) {
    funeralHomes.push({
      home_id: 'FH-' + rng.nextInt(100, 999),
      name: funeralHomeNames[i],
      address: input.region + rng.pick(['市中心区', '东郊', '西城区', '南山']) + rng.nextInt(1, 100) + '号',
      overall_rating: Math.round(rng.nextFloat(3.0, 5.0) * 10) / 10,
      price_level: rng.pick(['budget', 'mid_range', 'premium']),
      packages_offered: ['基础套餐', '标准套餐', '高端套餐', '个性化定制'],
      review_highlights: [
        rng.pick(['服务态度好', '环境整洁', '价格合理', '专业规范']),
        rng.pick(['工作人员耐心', '设施齐全', '流程透明', '尊重逝者']),
      ],
      transparency_score: Math.round(rng.nextFloat(60, 98)),
    })
  }
  funeralHomes.sort((a, b) => b.transparency_score - a.transparency_score)

  const savingsTips = [
    '选择政府定价的基础服务项目，价格受监管',
    '提前了解殡仪馆服务套餐，避免单项高价',
    '考虑生态葬法（海葬/树葬）享受政府补贴',
    '骨灰盒等用品可自行采购，殡仪馆内价格通常较高',
    '选择在工作日或非高峰时段举行仪式可能有折扣',
    '多家比价，不要急于做决定',
  ]

  const hiddenFeesWarnings = [
    '注意"遗体 SPA"、"高档化妆"等升级服务的隐性加价',
    '告别厅超时使用可能有额外费用',
    '骨灰寄存首年通常免费，但后续年费需确认',
    '部分殡仪馆收取"空调费"、"清洁费"等附加费',
    '确认"免费"项目是否包含后续收费',
  ]

  const consumerRights = [
    '有权要求查看服务项目和收费标准公示',
    '有权选择不接受强制打包消费',
    '有权索要正规发票和费用清单',
    '有权向民政部门投诉价格违规（12345）',
    '先签合同后付费，确认服务内容和价格',
  ]

  return {
    report_id: reportId,
    region: input.region,
    cost_breakdowns: costBreakdowns,
    grand_total: { low: grandLow, avg: grandAvg, high: grandHigh },
    funeral_homes: funeralHomes,
    savings_tips: savingsTips,
    hidden_fees_warnings: hiddenFeesWarnings,
    consumer_rights: consumerRights,
  }
}

// --- Tool 7: 生前契约与遗嘱规划 分析 ---
function analyzePreNeed(input: PreNeedInput): PreNeedResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.planning_type + input.age_group + input.marital_status
  ))

  const planId = 'PRE-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const contractOptions: ContractOption[] = [
    { contract_id: 'CTR-001', provider: '福寿园', plan_name: '福泽计划', total_cost: 28000, payment_options: ['一次性', '3年分期', '5年分期'], coverage_items: ['遗体接运', '告别厅', '火化', '骨灰盒'], refund_policy: '可退保，扣除手续费', inflation_protection: true, rating: 4.5 },
    { contract_id: 'CTR-002', provider: '长青公墓', plan_name: '长青守护', total_cost: 38000, payment_options: ['一次性', '5年分期', '10年分期'], coverage_items: ['全项殡仪服务', '墓位使用权', '20年管理费'], refund_policy: '生效前全额退', inflation_protection: true, rating: 4.7 },
    { contract_id: 'CTR-003', provider: '永安陵园', plan_name: '永安无忧', total_cost: 48000, payment_options: ['一次性', '3年分期', '5年分期', '10年分期'], coverage_items: ['全项殡仪', '中等墓位', '20年维护', '清明代祭'], refund_policy: '按比例退还', inflation_protection: true, rating: 4.3 },
  ]

  const willComponents: WillComponent[] = [
    { section: '立遗嘱人声明', required: true, completed: input.existing_will, description: '表明遗嘱为本人真实意愿', legal_reference: '《民法典》第1133条', common_mistakes: ['受胁迫订立', '处分他人财产'] },
    { section: '财产清单', required: true, completed: input.existing_will, description: '列明全部个人财产（房产、存款、车辆、股票、保险等）', legal_reference: '《民法典》第1133条', common_mistakes: ['遗漏数字财产', '共有财产未析产'] },
    { section: '继承人/受遗赠人', required: true, completed: input.existing_will, description: '明确各继承人身份及继承份额', legal_reference: '《民法典》第1133条', common_mistakes: ['使用昵称', '未考虑继承人死亡情形'] },
    { section: '遗嘱执行人', required: false, completed: false, description: '指定信任的人执行遗嘱', legal_reference: '《民法典》第1133条', common_mistakes: ['未告知执行人', '执行人无法联系'] },
    { section: '未成年子女监护', required: input.has_children, completed: false, description: '指定未成年子女监护人', legal_reference: '《民法典》第1133条', common_mistakes: ['未与监护人沟通', '未考虑监护人能力'] },
    { section: '特留份保留', required: true, completed: false, description: '为缺乏劳动能力的继承人保留必要份额', legal_reference: '《民法典》第1141条', common_mistakes: ['遗漏必留份导致遗嘱部分无效'] },
    { section: '签署与见证', required: true, completed: input.existing_will, description: '自书/代书/公证遗嘱的形式要求', legal_reference: '《民法典》第1134-1139条', common_mistakes: ['代书遗嘱见证人不合格', '日期不全'] },
  ]

  const estateAssets: EstateAsset[] = [
    { asset_type: '房产', estimated_value: rng.nextInt(50, 500) * 10000, beneficiary_suggestion: input.marital_status === 'married' ? '配偶优先继承' : '子女继承', probate_required: true, tax_implications: '目前中国无遗产税，继承过户需公证费' },
    { asset_type: '银行存款', estimated_value: rng.nextInt(10, 200) * 10000, beneficiary_suggestion: input.has_children ? '与子女协商分配' : '指定受益人', probate_required: false, tax_implications: '免遗产税，需继承权公证书' },
    { asset_type: '商业保险', estimated_value: rng.nextInt(20, 300) * 10000, beneficiary_suggestion: '直接指定受益人，不参与继承', probate_required: false, tax_implications: '指定受益人的保险理赔款不交遗产税' },
    { asset_type: '股票基金', estimated_value: rng.nextInt(10, 100) * 10000, beneficiary_suggestion: '可指定继承人或变卖分配', probate_required: true, tax_implications: '继承人不需缴纳个人所得税' },
  ]

  const actionItems: PreNeedResult['action_items'] = []
  if (!input.existing_will) {
    actionItems.push({ task: '咨询专业律师起草遗嘱', priority: 'high', deadline: '1个月内' })
  }
  if (!input.healthcare_directive) {
    actionItems.push({ task: '签署生前预嘱（医疗预嘱）', priority: 'high', deadline: '2周内' })
  }
  if (input.planning_type === 'pre_need_contract' || input.planning_type === 'all') {
    actionItems.push({ task: '比较生前契约方案', priority: 'medium', deadline: '1个月内' })
    actionItems.push({ task: '签订生前契约', priority: 'medium', deadline: '3个月内' })
  }
  if (input.planning_type === 'estate_planning' || input.planning_type === 'all') {
    actionItems.push({ task: '清点全部资产', priority: 'high', deadline: '2周内' })
    actionItems.push({ task: '指定遗嘱执行人', priority: 'medium', deadline: '1个月内' })
  }

  const legalReferrals = [
    '当地公证处（遗嘱公证）',
    '律师事务所（遗产规划）',
    '中华遗嘱库（公益遗嘱服务）',
    '中国法律服务网（12348.gov.cn）',
  ]

  const taxSaving = Math.round(rng.nextFloat(5, 15) * 10000)

  return {
    plan_id: planId,
    planning_type: input.planning_type,
    contract_options: contractOptions,
    will_components: willComponents,
    estate_assets: estateAssets,
    legal_referrals: legalReferrals,
    action_items: actionItems,
    tax_saving_estimate: taxSaving,
  }
}

// --- Tool 8: 各地丧葬习俗 分析 ---
function analyzeRitual(input: RitualInput): RitualResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.culture_region + input.query_type
  ))

  const guideId = 'RIT-' + Date.now() + '-' + rng.nextInt(1000, 9999)

  const cultureData: Record<string, { overview: string; customs: CustomDetail[]; mourning_periods: MourningPeriod[]; taboos: RitualResult['taboos']; adaptations: string[]; interfaith: string[] }> = {
    chinese_traditional: {
      overview: '中国传统丧葬礼仪以儒家孝道为核心，融合了佛教、道教元素，体现慎终追远的文化精神。传统仪式包含初终、复礼、小殓、大殓、出殡、下葬等环节，各地习俗差异显著。',
      customs: [
        { custom_name: '复礼（招魂）', description: '人死后，亲属持遗体上衣登高呼唤逝者名字，希望灵魂回归', significance: '表达对逝者的不舍与挽留', when_observed: '初终时', variations: ['北方喊魂三次', '南方焚衣招魂'], modern_adaptation: '部分地区保留简化形式' },
        { custom_name: '披麻戴孝', description: '子女穿粗麻布丧服，分斩衰、齐衰、大功、小功、缌麻五等', significance: '以服饰表达哀悼之深重', when_observed: '全程', variations: ['各地孝服样式不同', '孙辈可用红布条'], modern_adaptation: '多简化为黑纱+白花' },
        { custom_name: '守灵', description: '遗体停放期间，子女日夜陪伴，点长明灯，定时焚香上供', significance: '陪伴逝者最后一程，尽儿女孝心', when_observed: '出殡前', variations: ['守灵天数3-7天不等', '现代多为1-3天'], modern_adaptation: '殡仪馆设守灵室，简化但保留核心意义' },
        { custom_name: '做七', description: '每7天祭奠一次，共49天，由和尚或道士诵经超度', significance: '佛教认为中阴身49天转生，每七日关键节点', when_observed: '死后每7天', variations: ['头七、三七、五七、七七最重要', '部分简化为只做七七'], modern_adaptation: '多在清明节、中元节集中祭奠' },
      ],
      mourning_periods: [
        { period_name: '热丧期', duration: '49天（七七）', practices: ['穿孝服', '不参与喜庆活动', '设灵位供奉'], restrictions: ['不参加婚礼', '不去他人家串门', '不穿红衣'], modern_context: '现代多在出殡后解除大部分禁忌' },
        { period_name: '百日祭', duration: '100天', practices: ['到墓前祭拜', '整理逝者遗物'], restrictions: ['部分地区仍守部分禁忌'], modern_context: '逐渐淡化' },
        { period_name: '守孝期', duration: '传统三年（实际25个月）', practices: ['忌日祭拜', '春节不贴红对联'], restrictions: ['古代官员需丁忧', '不婚嫁'], modern_context: '现代已大大简化，多为一年象征性守孝' },
      ],
      taboos: [
        { taboo: '收到丧事后不进入别人家中', reason: '认为带去晦气', severity: 'moderate' },
        { taboo: '逝者遗物不能随意丢弃', reason: '对逝者的尊重', severity: 'moderate' },
        { taboo: '送礼不送钟表（谐音送终）', reason: '文化忌讳', severity: 'suggestion' },
      ],
      adaptations: ['网络追思会', '电子蜡烛代替明火', '骨灰撒海生态葬', '追思录代替厚重纸扎'],
      interfaith: ['中国丧葬融合儒释道元素', '不同宗教人士可共同参与', '尊重个人信仰选择'],
    },
    buddhist_mahayana: {
      overview: '汉传佛教丧葬仪式以超度亡灵为核心，通过诵经、念佛、忏悔等功德回向，祈愿逝者脱离轮回、往生净土。仪轨庄严慈悲。',
      customs: [
        { custom_name: '助念', description: '在临终前后，同修或僧人帮助逝者持续念佛号，使其心不散乱', significance: '助最后一念往生净土', when_observed: '临终至入殓后8-12小时', variations: ['分班轮念', '可在家中或医院'], modern_adaptation: '很多寺院提供助念团服务' },
        { custom_name: '七七超度', description: '每七日作法事一次，诵《地藏经》《阿弥陀经》等，共七次', significance: '中阴阶段累积功德', when_observed: '死后每七天', variations: ['富裕家庭做全套', '一般家庭做重点七'], modern_adaptation: '部分合并或简化' },
        { custom_name: '放焰口', description: '施食法会，以佛法布施饿鬼道众生', significance: '不仅利益逝者，也广结善缘', when_observed: '出殡前夜或七七当日', variations: ['家庭可请僧人主持'], modern_adaptation: '寺院定期举办也可参加' },
      ],
      mourning_periods: [
        { period_name: '中阴期', duration: '49天', practices: ['每七日诵经回向', '素食', '布施功德回向'], restrictions: ['不行淫', '不杀生', '不行恶业'], modern_context: '重在精神纪念' },
        { period_name: '忌日追思', duration: '每年', practices: ['诵经、供灯、放生', '寺院设牌位'], restrictions: [], modern_context: '通过网络也可参与' },
      ],
      taboos: [
        { taboo: '临终八小时内不搬动遗体', reason: '神识未离，搬动令逝者痛苦', severity: 'strict' },
        { taboo: '丧期内不食荤腥', reason: '为逝者积福', severity: 'moderate' },
        { taboo: '不用荤腥祭祀', reason: '佛教主张慈悲不杀', severity: 'strict' },
      ],
      adaptations: ['线上法会', '电子功德', '环保香烛', '云端牌位'],
      interfaith: ['佛教仪式可与一般丧礼融合', '尊重不同宗派差异', '非佛教徒也可参与念佛'],
    },
    christian_protestant: {
      overview: '基督教（新教）丧葬强调"息了劳苦、在主里安息"，仪式以追思赞美为主，表达对复活的盼望。仪式相对简洁庄重，由牧师主持。',
      customs: [
        { custom_name: '安息礼拜', description: '在教堂举行的追思礼拜，包含圣诗、祷告、读经、生平回顾', significance: '纪念逝者一生，安慰生者', when_observed: '出殡前', variations: ['可在殡仪馆举行', '也可在墓地举行'], modern_adaptation: '可结合线上直播' },
        { custom_name: '入殓礼拜', description: '将遗体放入棺木前的简短祈祷', significance: '将身体交托上帝', when_observed: '出殡前', variations: ['可在家中或殡仪馆'], modern_adaptation: '保留核心祈祷' },
        { custom_name: '安葬礼拜', description: '在墓地举行的最后告别仪式', significance: '尘归尘、土归土，等候复活', when_observed: '下葬时', variations: ['火化也可举行'], modern_adaptation: '简短而庄重' },
      ],
      mourning_periods: [
        { period_name: '追思期', duration: '无固定期限', practices: ['祷告纪念', '探访家属', '协助处理事务'], restrictions: [], modern_context: '教会持续关怀' },
        { period_name: '忌日纪念', duration: '每年', practices: ['献花', '祷告', '追思礼拜'], restrictions: [], modern_context: '教会可协助举办' },
      ],
      taboos: [
        { taboo: '不焚烧纸钱纸扎', reason: '基督教信仰不认同', severity: 'moderate' },
        { taboo: '不跪拜逝者（仅鞠躬）', reason: '只敬拜上帝', severity: 'moderate' },
      ],
      adaptations: ['线上追思礼拜', '电子纪念册', '环保安葬', '器官捐献（视为爱的延续）'],
      interfaith: ['可与非基督徒亲友共同参与', '仪式可融合部分传统元素', '尊重不同教派差异'],
    },
    islamic: {
      overview: '伊斯兰教丧葬遵循"速葬、简葬、土葬"三大原则，主张人生来平等、死后亦平等。仪式包含洗尸、站礼、土葬等环节。',
      customs: [
        { custom_name: '洗尸（大净）', description: '由同性别的穆斯林为逝者清洗遗体，共三次，按部位顺序', significance: '使逝者洁净归真', when_observed: '去世后尽快', variations: ['按伊斯兰教法规定顺序'], modern_adaptation: '各地清真寺有专门洗尸房' },
        { custom_name: '站礼（者那则）', description: '穆斯林集体为逝者祈祷，无鞠躬叩首，仅站立祈祷', significance: '为逝者求主饶恕', when_observed: '洗尸后、下葬前', variations: ['人数越多越好'], modern_adaptation: '可在家中或清真寺举行' },
        { custom_name: '土葬', description: '不用棺木，直接放入土穴中，遗体面朝麦加天房方向', significance: '体现众生平等', when_observed: '去世后24小时内', variations: ['可用木匣代替棺木'], modern_adaptation: '需符合当地殡葬法规' },
      ],
      mourning_periods: [
        { period_name: '三日哀悼', duration: '3天', practices: ['亲友前来慰问', '诵读《古兰经》', '为逝者祈祷'], restrictions: ['不披头散发', '不捶胸顿足'], modern_context: '保持庄重节制' },
        { period_name: '周年祭', duration: '每年', practices: ['诵经、施舍、游坟'], restrictions: [], modern_context: '持续纪念' },
      ],
      taboos: [
        { taboo: '不用棺木', reason: '教义规定直接入土', severity: 'strict' },
        { taboo: '不火化', reason: '教义禁止火葬', severity: 'strict' },
        { taboo: '不焚烧纸钱', reason: '伊斯兰教不认同', severity: 'strict' },
        { taboo: '不嚎啕大哭', reason: '主张平静接受前定', severity: 'moderate' },
      ],
      adaptations: ['线上站礼参与', '电子古兰经诵读', '环保裹尸布', '穆斯林公墓规划'],
      interfaith: ['非穆斯林不可参加洗尸', '站礼可旁观但不参与', '尊重穆斯林速葬需求'],
    },
    secular_humanist: {
      overview: '世俗人文主义丧葬不依赖宗教信仰，强调以人的尊严和价值为中心，通过追思、纪念、生命庆典等方式缅怀逝者。仪式灵活个性化。',
      customs: [
        { custom_name: '生命庆典', description: '以庆祝逝者一生为主题的告别仪式，分享故事、播放音乐、展示照片', significance: '以积极方式纪念生命', when_observed: '去世后1-2周内', variations: ['可在家中、户外或殡仪馆'], modern_adaptation: '越来越受欢迎' },
        { custom_name: '个性化告别', description: '根据逝者生前爱好定制仪式', significance: '体现逝者独特个性', when_observed: '灵活安排', variations: ['无固定形式'], modern_adaptation: '主流趋势' },
        { custom_name: '环保安葬', description: '选择海葬、树葬、降解葬等生态方式', significance: '回归自然、保护环境', when_observed: '灵活', variations: ['多种生态葬法'], modern_adaptation: '政府鼓励推广' },
      ],
      mourning_periods: [
        { period_name: '个人哀悼期', duration: '无固定期限', practices: ['按个人节奏哀悼', '寻求心理支持'], restrictions: [], modern_context: '尊重个体差异' },
        { period_name: '纪念日', duration: '每年', practices: ['扫墓、追思、家庭聚餐'], restrictions: [], modern_context: '温馨回忆为主' },
      ],
      taboos: [
        { taboo: '无特定禁忌', reason: '人文主义不强调禁忌', severity: 'suggestion' },
      ],
      adaptations: ['线上追思会', '数字纪念册', '生命故事书', '器官/遗体捐献'],
      interfaith: ['可与任何信仰背景的人共同参与', '仪式可融合多种元素', '尊重不同信仰家属'],
    },
  }

  const defaultData = {
    overview: input.culture_region + '的丧葬习俗具有独特的文化传统和宗教背景。建议咨询当地相关文化组织或宗教人士获取详细信息。',
    customs: [
      { custom_name: '传统仪式', description: '各地有独特的传统丧葬仪式', significance: '文化传承与精神寄托', when_observed: '按当地习俗', variations: ['地区差异大'], modern_adaptation: '在保留核心精神的基础上现代化' },
    ],
    mourning_periods: [
      { period_name: '哀悼期', duration: '按当地习俗', practices: ['祭拜、祈祷、纪念'], restrictions: ['按当地习俗'], modern_context: '现代多简化' },
    ],
    taboos: [
      { taboo: '尊重当地习俗', reason: '文化敏感性', severity: 'moderate' },
    ],
    adaptations: ['结合现代生活方式', '环保理念融入', '数字化纪念日'],
    interfaith: ['尊重不同信仰', '包容多元文化', '寻求共同价值'],
  }

  const data = cultureData[input.culture_region] || defaultData

  const preparationChecklist = [
    '了解逝者/家属的宗教信仰和文化背景',
    '确认仪式流程和所需物品',
    '联系相关宗教人士或文化顾问',
    '准备适当的服装和用品',
    '了解并尊重当地法规',
    '提前与家属沟通特殊需求',
  ]

  const resources: RitualResource[] = [
    { resource_type: 'book', title: '《中国丧葬史》', description: '系统介绍中国丧葬文化演变', relevance: '了解传统习俗' },
    { resource_type: 'book', title: '《生死学与临终关怀》', description: '探讨现代生死观', relevance: '现代视角' },
    { resource_type: 'organization', title: '中国殡葬协会', description: '行业权威机构', relevance: '政策咨询' },
    { resource_type: 'expert', title: '民俗文化学者', description: '各地风俗研究专家', relevance: '深度咨询' },
  ]

  return {
    guide_id: guideId,
    culture_region: input.culture_region,
    overview: data.overview,
    customs: data.customs,
    mourning_periods: data.mourning_periods,
    preparation_checklist: preparationChecklist,
    taboos: data.taboos,
    modern_adaptations: data.adaptations,
    interfaith_considerations: data.interfaith,
    resources: resources,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

function formatPlannerReport(result: PlannerResult): string {
  const lines: string[] = []
  lines.push('## 殡仪服务方案策划报告')
  lines.push('')
  lines.push('方案编号: ' + result.plan_id + ' | 方案名称: ' + result.plan_name)
  lines.push('服务类型: ' + result.service_type + ' | 宗教传统: ' + (result.religion || '无') + ' | 预算等级: ' + result.budget_tier)
  lines.push('')
  lines.push('### 服务项目清单')
  lines.push('| 编号 | 服务名称 | 类别 | 预估费用(元) | 状态 | 备注 |')
  lines.push('|------|----------|------|-------------|------|------|')
  for (const item of result.items) {
    const statusText = item.status === 'confirmed' ? '已确认' : item.status === 'optional' ? '可选' : '推荐'
    lines.push('| ' + item.item_id + ' | ' + item.name + ' | ' + item.category + ' | ' + item.estimated_cost + ' | ' + statusText + ' | ' + item.notes + ' |')
  }
  lines.push('')
  lines.push('**预估总费用: ' + result.total_estimated_cost + ' 元**')
  lines.push('')
  lines.push('### 时间线安排')
  lines.push('| 时间 | 活动 | 地点 | 负责人 | 状态 |')
  lines.push('|------|------|------|--------|------|')
  for (const ev of result.timeline) {
    const st = ev.status === 'scheduled' ? '已安排' : ev.status === 'pending' ? '待定' : '灵活'
    lines.push('| ' + ev.time + ' | ' + ev.activity + ' | ' + ev.location + ' | ' + ev.responsible + ' | ' + st + ' |')
  }
  lines.push('')
  lines.push('### 待办事项')
  for (const c of result.checklist) {
    lines.push('- [' + (c.done ? 'x' : ' ') + '] ' + c.task + '（' + c.responsible + '）')
  }
  if (result.special_arrangements.length > 0) {
    lines.push('')
    lines.push('### 特别安排')
    for (const s of result.special_arrangements) lines.push('- ' + s)
  }
  lines.push('')
  lines.push('---')
  lines.push('*殡仪服务AI助手 - 尊重生命，温暖告别*')
  return lines.join('\n')
}

function formatCemeteryReport(result: CemeteryResult): string {
  const lines: string[] = []
  lines.push('## 墓位管理与生态葬规划报告')
  lines.push('')
  lines.push('操作类型: ' + result.action + ' | 可售墓位: ' + result.total_available + ' | 价格区间: ' + result.price_range.min + '-' + result.price_range.max + '元')
  lines.push('')
  if (result.plots.length > 0) {
    lines.push('### 墓位信息')
    lines.push('| 编号 | 墓园 | 区域 | 类型 | 面积(m2) | 价格(元) | 状态 | 年维护费 |')
    lines.push('|------|------|------|------|----------|----------|------|----------|')
    for (const p of result.plots) {
      const avail = p.availability === 'available' ? '可售' : p.availability === 'reserved' ? '预留' : '已售'
      lines.push('| ' + p.plot_id + ' | ' + p.cemetery_name + ' | ' + p.section + ' | ' + p.plot_type + ' | ' + p.size_sqm.toFixed(1) + ' | ' + p.price + ' | ' + avail + ' | ' + p.maintenance_fee_annual + ' |')
    }
    lines.push('')
  }
  if (result.eco_options.length > 0) {
    lines.push('### 生态葬选项')
    lines.push('| 方式 | 描述 | 环保效益 | 费用(元) | 法律状态 | 普及率 |')
    lines.push('|------|------|----------|----------|----------|--------|')
    for (const e of result.eco_options) {
      lines.push('| ' + e.method + ' | ' + e.description + ' | ' + e.environmental_impact + ' | ' + e.cost_estimate + ' | ' + e.legal_status + ' | ' + e.popularity_pct + '% |')
    }
    lines.push('')
  }
  lines.push('### 建议')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('### 法规提醒')
  for (const r of result.regulations) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*殡仪服务AI助手 - 绿色殡葬，回归自然*')
  return lines.join('\n')
}

function formatCeremonyReport(result: CeremonyResult): string {
  const lines: string[] = []
  lines.push('## 告别仪式设计方案')
  lines.push('')
  lines.push('仪式编号: ' + result.ceremony_id + ' | 类型: ' + result.ceremony_type + ' | 总时长: ' + result.total_duration_min + '分钟')
  lines.push('')
  lines.push('### 仪式流程')
  lines.push('| 序号 | 环节 | 时长(分钟) | 内容 | 参与者 | 备注 |')
  lines.push('|------|------|-----------|------|--------|------|')
  for (const seg of result.program) {
    lines.push('| ' + seg.order + ' | ' + seg.title + ' | ' + seg.duration_min + ' | ' + seg.description + ' | ' + seg.participants.join('、') + ' | ' + seg.notes + ' |')
  }
  lines.push('')
  lines.push('### 场地布置')
  lines.push('- 场地类型: ' + result.venue_setup.area)
  lines.push('- 布置风格: ' + result.venue_setup.arrangement)
  lines.push('- 容纳人数: ' + result.venue_setup.capacity)
  lines.push('- 设备: ' + result.venue_setup.equipment.join('、'))
  lines.push('- 无障碍设施: ' + result.venue_setup.accessibility.join('、'))
  lines.push('')
  lines.push('### 服装与花艺')
  lines.push('- 着装建议: ' + result.attire_suggestion)
  lines.push('- 花艺布置: ' + result.floral_arrangement)
  lines.push('- 音乐曲目: ' + result.music_playlist.join('、'))
  lines.push('')
  lines.push('### 应急预案')
  lines.push(result.contingency_plan)
  lines.push('')
  lines.push('---')
  lines.push('*殡仪服务AI助手 - 以爱之名，温暖告别*')
  return lines.join('\n')
}

function formatGriefReport(result: GriefResult): string {
  const lines: string[] = []
  lines.push('## 哀伤辅导资源与心理援助报告')
  lines.push('')
  const riskText = result.risk_level === 'high' ? '高' : result.risk_level === 'moderate' ? '中' : '低'
  lines.push('评估编号: ' + result.assessment_id + ' | 哀伤阶段: ' + result.grief_stage_estimate + ' | 风险等级: ' + riskText)
  lines.push('')
  if (result.risk_level === 'high') {
    lines.push('### 重要提醒')
    lines.push('根据评估，您目前可能处于较高哀伤风险中。强烈建议尽快寻求专业心理帮助。')
    lines.push('**危机热线: ' + result.crisis_hotline + '**')
    lines.push('')
  }
  lines.push('### 匹配咨询师')
  lines.push('| 编号 | 姓名 | 资质 | 专长 | 语言 | 形式 | 经验(年) | 评分 |')
  lines.push('|------|------|------|------|------|------|----------|------|')
  for (const c of result.matched_counselors) {
    lines.push('| ' + c.counselor_id + ' | ' + c.name + ' | ' + c.credentials.join('、') + ' | ' + c.specialties.join('、') + ' | ' + c.languages.join('、') + ' | ' + c.session_format.join('、') + ' | ' + c.experience_years + ' | ' + c.rating + '星 |')
  }
  lines.push('')
  lines.push('### 支持资源')
  lines.push('| 编号 | 名称 | 类型 | 描述 | 联系方式 | 费用 | 时间 |')
  lines.push('|------|------|------|------|----------|------|------|')
  for (const r of result.resources) {
    lines.push('| ' + r.resource_id + ' | ' + r.name + ' | ' + r.type + ' | ' + r.description + ' | ' + r.contact + ' | ' + r.cost + ' | ' + r.schedule + ' |')
  }
  lines.push('')
  lines.push('### 康复计划')
  for (const plan of result.wellness_plan) {
    lines.push('**' + plan.phase + '（' + plan.duration_weeks + '周）**')
    lines.push('- 目标: ' + plan.goals.join('、'))
    lines.push('- 活动: ' + plan.activities.join('、'))
    lines.push('- 自我照顾: ' + plan.self_care_tips.join('、'))
    lines.push('')
  }
  lines.push('### 应对策略')
  for (const s of result.coping_strategies) lines.push('- ' + s)
  lines.push('')
  lines.push('---')
  lines.push('*殡仪服务AI助手 - 哀伤需要时间，你并不孤单*')
  return lines.join('\n')
}

function formatBenefitReport(result: BenefitResult): string {
  const lines: string[] = []
  lines.push('## 丧葬补助与保险理赔申请报告')
  lines.push('')
  lines.push('申请编号: ' + result.application_id + ' | 预估总补助: ' + result.total_estimated_benefit + ' 元 | 法律援助: ' + (result.legal_aid_available ? '可用' : '不可用'))
  lines.push('')
  lines.push('### 可申请补助/理赔')
  lines.push('| 编号 | 名称 | 提供方 | 类别 | 最高额度(元) | 预估金额(元) | 办理时限(天) | 状态 |')
  lines.push('|------|------|--------|------|-------------|-------------|-------------|------|')
  for (const b of result.benefits) {
    const catText = b.category === 'government' ? '政府' : b.category === 'insurance' ? '保险' : b.category === 'employer' ? '单位' : '慈善'
    const statusText = b.status === 'eligible' ? '符合' : b.status === 'pending_review' ? '待审' : b.status === 'needs_document' ? '需补件' : '不适用'
    lines.push('| ' + b.benefit_id + ' | ' + b.name + ' | ' + b.provider + ' | ' + catText + ' | ' + b.max_amount + ' | ' + b.estimated_amount + ' | ' + b.processing_time_days + ' | ' + statusText + ' |')
  }
  lines.push('')
  lines.push('### 所需材料清单')
  lines.push('| 材料 | 必需 | 已获取 | 备注 |')
  lines.push('|------|------|--------|------|')
  for (const d of result.documents) {
    lines.push('| ' + d.document + ' | ' + (d.required ? '是' : '否') + ' | ' + (d.obtained ? '已获取' : '未获取') + ' | ' + d.notes + ' |')
  }
  lines.push('')
  lines.push('### 办理步骤')
  lines.push('| 步骤 | 操作 | 负责人 | 时间要求 | 状态 | 备注 |')
  lines.push('|------|------|--------|----------|------|------|')
  for (const s of result.claims_steps) {
    const st = s.status === 'completed' ? '已完成' : s.status === 'in_progress' ? '进行中' : '待办'
    lines.push('| ' + s.step + ' | ' + s.action + ' | ' + s.responsible + ' | ' + s.timeframe + ' | ' + st + ' | ' + s.notes + ' |')
  }
  lines.push('')
  lines.push('### 额外资源')
  for (const r of result.additional_resources) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*殡仪服务AI助手 - 权益保障，温暖护航*')
  return lines.join('\n')
}

function formatCostReport(result: CostResult): string {
  const lines: string[] = []
  lines.push('## 殡仪费用透明化与比价报告')
  lines.push('')
  lines.push('报告编号: ' + result.report_id + ' | 地区: ' + result.region)
  lines.push('费用区间: ' + result.grand_total.low + ' - ' + result.grand_total.avg + ' - ' + result.grand_total.high + ' 元（低/中/高）')
  lines.push('')
  for (const cb of result.cost_breakdowns) {
    lines.push('### ' + cb.category + '（小计: ' + cb.subtotal_low + '-' + cb.subtotal_avg + '-' + cb.subtotal_high + '元）')
    lines.push('| 项目 | 低价(元) | 均价(元) | 高价(元) | 是否必需 | 说明 |')
    lines.push('|------|----------|----------|----------|----------|------|')
    for (const item of cb.items) {
      lines.push('| ' + item.item_name + ' | ' + item.low_price + ' | ' + item.avg_price + ' | ' + item.high_price + ' | ' + (item.mandatory ? '是' : '否') + ' | ' + item.description + ' |')
    }
    lines.push('')
  }
  if (result.funeral_homes.length > 0) {
    lines.push('### 殡仪馆比价')
    lines.push('| 编号 | 名称 | 地址 | 评分 | 价格档次 | 透明度分 | 评价亮点 |')
    lines.push('|------|------|------|------|----------|----------|----------|')
    for (const fh of result.funeral_homes) {
      const levelText = fh.price_level === 'budget' ? '经济' : fh.price_level === 'mid_range' ? '中等' : '高端'
      lines.push('| ' + fh.home_id + ' | ' + fh.name + ' | ' + fh.address + ' | ' + fh.overall_rating + '星 | ' + levelText + ' | ' + fh.transparency_score + ' | ' + fh.review_highlights.join('、') + ' |')
    }
    lines.push('')
  }
  lines.push('### 省钱建议')
  for (const t of result.savings_tips) lines.push('- ' + t)
  lines.push('')
  lines.push('### 隐性收费警示')
  for (const w of result.hidden_fees_warnings) lines.push('- ' + w)
  lines.push('')
  lines.push('### 消费者权益')
  for (const r of result.consumer_rights) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*殡仪服务AI助手 - 透明消费，明白选择*')
  return lines.join('\n')
}

function formatPreNeedReport(result: PreNeedResult): string {
  const lines: string[] = []
  lines.push('## 生前契约与遗嘱规划咨询报告')
  lines.push('')
  lines.push('规划编号: ' + result.plan_id + ' | 规划类型: ' + result.planning_type + ' | 预估节税: ' + result.tax_saving_estimate + ' 元')
  lines.push('')
  if (result.contract_options.length > 0) {
    lines.push('### 生前契约方案')
    lines.push('| 编号 | 提供方 | 方案名称 | 总费用(元) | 缴费方式 | 通胀保护 | 评分 |')
    lines.push('|------|--------|----------|-----------|----------|----------|------|')
    for (const c of result.contract_options) {
      lines.push('| ' + c.contract_id + ' | ' + c.provider + ' | ' + c.plan_name + ' | ' + c.total_cost + ' | ' + c.payment_options.join('、') + ' | ' + (c.inflation_protection ? '有' : '无') + ' | ' + c.rating + '星 |')
    }
    lines.push('')
  }
  lines.push('### 遗嘱要件清单')
  lines.push('| 要件 | 必需 | 已完成 | 法律依据 | 常见错误 |')
  lines.push('|------|------|--------|----------|----------|')
  for (const w of result.will_components) {
    lines.push('| ' + w.section + ' | ' + (w.required ? '是' : '否') + ' | ' + (w.completed ? '已完成' : '未完成') + ' | ' + w.legal_reference + ' | ' + w.common_mistakes.join('、') + ' |')
  }
  lines.push('')
  lines.push('### 资产规划')
  lines.push('| 资产类型 | 预估价值(元) | 受益人建议 | 需遗嘱认证 | 税务影响 |')
  lines.push('|----------|-------------|-----------|------------|----------|')
  for (const a of result.estate_assets) {
    lines.push('| ' + a.asset_type + ' | ' + a.estimated_value + ' | ' + a.beneficiary_suggestion + ' | ' + (a.probate_required ? '是' : '否') + ' | ' + a.tax_implications + ' |')
  }
  lines.push('')
  lines.push('### 行动清单')
  for (const a of result.action_items) {
    const prioText = a.priority === 'high' ? '高' : a.priority === 'medium' ? '中' : '低'
    lines.push('- [ ] ' + a.task + '（优先级: ' + prioText + '，截止: ' + a.deadline + '）')
  }
  lines.push('')
  lines.push('### 法律资源')
  for (const r of result.legal_referrals) lines.push('- ' + r)
  lines.push('')
  lines.push('---')
  lines.push('*殡仪服务AI助手 - 未雨绸缪，安心未来*')
  return lines.join('\n')
}

function formatRitualReport(result: RitualResult): string {
  const lines: string[] = []
  lines.push('## 丧葬习俗与宗教仪式指南')
  lines.push('')
  lines.push('指南编号: ' + result.guide_id + ' | 文化/宗教: ' + result.culture_region)
  lines.push('')
  lines.push('### 概述')
  lines.push(result.overview)
  lines.push('')
  if (result.customs.length > 0) {
    lines.push('### 主要习俗')
    for (const c of result.customs) {
      lines.push('**' + c.custom_name + '**')
      lines.push('- 描述: ' + c.description)
      lines.push('- 意义: ' + c.significance)
      lines.push('- 时机: ' + c.when_observed)
      lines.push('- 变体: ' + c.variations.join('、'))
      lines.push('- 现代适应: ' + c.modern_adaptation)
      lines.push('')
    }
  }
  if (result.mourning_periods.length > 0) {
    lines.push('### 哀悼期')
    for (const m of result.mourning_periods) {
      lines.push('**' + m.period_name + '（' + m.duration + '）**')
      lines.push('- 习俗: ' + m.practices.join('、'))
      lines.push('- 禁忌: ' + m.restrictions.join('、'))
      lines.push('- 现代语境: ' + m.modern_context)
      lines.push('')
    }
  }
  lines.push('### 准备清单')
  for (const c of result.preparation_checklist) lines.push('- [ ] ' + c)
  lines.push('')
  if (result.taboos.length > 0) {
    lines.push('### 禁忌提醒')
    lines.push('| 禁忌 | 原因 | 严格程度 |')
    lines.push('|------|------|----------|')
    for (const t of result.taboos) {
      const sevText = t.severity === 'strict' ? '严格' : t.severity === 'moderate' ? '中等' : '建议'
      lines.push('| ' + t.taboo + ' | ' + t.reason + ' | ' + sevText + ' |')
    }
    lines.push('')
  }
  lines.push('### 现代适应')
  for (const a of result.modern_adaptations) lines.push('- ' + a)
  lines.push('')
  lines.push('### 跨信仰考量')
  for (const i of result.interfaith_considerations) lines.push('- ' + i)
  lines.push('')
  lines.push('### 推荐资源')
  for (const r of result.resources) {
    const typeText = r.resource_type === 'book' ? '书籍' : r.resource_type === 'website' ? '网站' : r.resource_type === 'organization' ? '机构' : '专家'
    lines.push('- ' + typeText + ': ' + r.title + ' - ' + r.description + '（' + r.relevance + '）')
  }
  lines.push('')
  lines.push('---')
  lines.push('*殡仪服务AI助手 - 尊重多元，文化共融*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: 殡仪服务方案策划
  tools.register(defineTool({
    name: 'funeral_service_planner',
    description: '殡仪服务方案策划与个性化定制 | 根据逝者信息、宗教信仰、预算范围生成个性化殡仪服务方案，含服务项目、时间线、待办清单 | Personalized funeral service planning with timeline and checklist.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: service_type (traditional|modern|eco|religious|custom), religion?, budget_range (economy|standard|premium|luxury), deceased_info{name, age, gender}, preferences{flower_style?, music_preference?, ceremony_duration?, special_requests?}, region'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PlannerInput = JSON.parse(args.input_data)
      return formatPlannerReport(analyzePlanner(input))
    }
  }))

  // Tool 2: 墓位管理
  tools.register(defineTool({
    name: 'cemetery_plot_manager',
    description: '墓位管理与节地生态葬规划 | 搜索比较墓位、规划生态葬法（海葬/树葬/花坛葬等），含价格、法规、补贴信息 | Cemetery plot search, comparison, and eco-burial planning.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: action (search|compare|eco_planning|maintenance), location, plot_type?, budget_ceiling?, eco_preference?, family_size?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CemeteryInput = JSON.parse(args.input_data)
      return formatCemeteryReport(analyzeCemetery(input))
    }
  }))

  // Tool 3: 告别仪式设计
  tools.register(defineTool({
    name: 'memorial_ceremony_designer',
    description: '告别仪式与纪念活动设计 | 设计个性化告别仪式流程，含环节安排、场地布置、音乐花艺、应急预案 | Memorial ceremony design with program, venue, music, and contingency planning.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: ceremony_type (funeral|memorial|celebration_of_life|graveside|virtual), deceased_name, attendee_count, venue_type, religious_tradition?, tone (solemn|warm|celebratory|simple), media_elements?, special_tributes?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CeremonyInput = JSON.parse(args.input_data)
      return formatCeremonyReport(analyzeCeremony(input))
    }
  }))

  // Tool 4: 哀伤辅导资源
  tools.register(defineTool({
    name: 'grief_counseling_resource',
    description: '哀伤辅导资源与心理援助匹配 | 评估哀伤阶段与风险等级，匹配咨询师、支持资源、康复计划 | Grief assessment with counselor matching and psychological support resources.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: seeker_type (spouse|child|parent|sibling|friend|caregiver), relationship_to_deceased, loss_type (sudden|expected|traumatic|after_illness), time_since_loss_weeks, symptoms[], support_group_preference (individual|group|family|online), language'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: GriefInput = JSON.parse(args.input_data)
      return formatGriefReport(analyzeGrief(input))
    }
  }))

  // Tool 5: 丧葬补助与保险理赔
  tools.register(defineTool({
    name: 'bereavement_benefit_navigator',
    description: '丧葬补助与保险理赔申请 | 评估可申请的丧葬补助、保险理赔项目，提供材料清单和办理步骤 | Bereefit benefits and insurance claims assistance with document checklist.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: applicant_relationship, deceased_employment_status, insurance_types[], region, monthly_income?, has_documents, urgency (standard|urgent|emergency)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: BenefitInput = JSON.parse(args.input_data)
      return formatBenefitReport(analyzeBenefits(input))
    }
  }))

  // Tool 6: 殡仪费用透明化
  tools.register(defineTool({
    name: 'funeral_cost_transparency',
    description: '殡仪费用透明化与比价 | 提供殡仪服务价格明细、殡仪馆比价、省钱建议、隐性收费警示、消费者权益 | Funeral cost transparency with price comparison and consumer rights.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: service_packages[], region, funeral_home_count?, comparison_criteria[], itemized_only?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: CostInput = JSON.parse(args.input_data)
      return formatCostReport(analyzeCost(input))
    }
  }))

  // Tool 7: 生前契约与遗嘱规划
  tools.register(defineTool({
    name: 'pre_need_planning_advisor',
    description: '生前契约与遗嘱规划咨询 | 提供生前契约方案比较、遗嘱要件清单、资产规划、法律资源、行动清单 | Pre-need planning with will preparation advisory and estate planning.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: planning_type (pre_need_contract|will_planning|estate_planning|all), age_group, marital_status, has_children, estate_value_estimate?, existing_will, healthcare_directive, financial_goals?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: PreNeedInput = JSON.parse(args.input_data)
      return formatPreNeedReport(analyzePreNeed(input))
    }
  }))

  // Tool 8: 各地丧葬习俗
  tools.register(defineTool({
    name: 'cultural_ritual_guide',
    description: '各地丧葬习俗与宗教仪式指南 | 提供中国传统、佛教、基督教、伊斯兰教、世俗人文主义等多种丧葬习俗、禁忌、现代适应 | Cultural funeral customs with religious ritual guide and modern adaptations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: culture_region, query_type (overview|preparation|ceremony|mourning_period|taboos|modern_adaptation), language, detail_level (summary|detailed|expert), specific_customs?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: RitualInput = JSON.parse(args.input_data)
      return formatRitualReport(analyzeRitual(input))
    }
  }))

  console.log('[dsh-tool-funeralagentpro] Loaded v' + VERSION + ' - 殡仪服务AI助手, 8 tools active')
  console.log('  Tools: funeral_service_planner, cemetery_plot_manager, memorial_ceremony_designer, grief_counseling_resource, bereavement_benefit_navigator, funeral_cost_transparency, pre_need_planning_advisor, cultural_ritual_guide')
}
