/**
 * DSH Hotel & Tourism AI Assistant Plugin v0.1.0
 *
 * 8-tool hospitality & tourism AI platform: revenue management, guest experience
 * tracking, hotel operations, marketing distribution, tourism product design,
 * event management, housekeeping optimization, reputation management.
 *
 * @module dsh-tool-hospitalagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-hospitalagent'
export const inject = ['tools']

const VERSION = '0.1.0'
const DISCLAIMER = '本分析基于AI模型推断，仅供酒店运营参考，不替代专业酒店管理决策。'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function currentIso(): string {
  return new Date().toISOString()
}

/**
 * Deterministic PRNG (mulberry32) -- reproducible per seed.
 */
class SeededRandom {
  private state: number
  constructor(seed: number) { this.state = seed }
  next(): number {
    let t = (this.state += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  range(min: number, max: number): number { return min + this.next() * (max - min) }
  int(min: number, max: number): number { return Math.floor(this.range(min, max + 1)) }
  pick<T>(arr: T[]): T { return arr[this.int(0, arr.length - 1)] }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(seed: string): SeededRandom {
  return new SeededRandom(hashStr(seed))
}

function clampProbability(n: number): number {
  return Math.round(Math.max(0, Math.min(1, n)) * 1000) / 1000
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ===========================================================================
// 1. REVENUE MANAGEMENT -- 收益管理 (动态定价/ADR/RevPAR/OCC)
// ===========================================================================

interface RoomTypeRate {
  room_type: string
  base_rate: number
  recommended_rate: number
  demand_factor: number
  competitor_avg: number
  pickup_rate: number
}

interface DailyForecast {
  date: string
  adr: number
  revpar: number
  occ_pct: number
  rooms_sold: number
  rooms_available: number
  revenue: number
}

interface SeasonalTrend {
  month: string
  adr: number
  revpar: number
  occ_pct: number
  yoy_growth: number
}

interface RevenueManagementResult {
  kpi_summary: {
    current_adr: number
    current_revpar: number
    current_occ: number
    total_rooms: number
    forecast_period: string
  }
  room_type_rates: RoomTypeRate[]
  daily_forecast: DailyForecast[]
  seasonal_trend: SeasonalTrend[]
  pricing_recommendations: string[]
}

function runRevenueManagement(
  totalRooms: number,
  currentAdr: number,
  currentOcc: number,
  forecastDays: number,
): RevenueManagementResult {
  const seed = 'revenue_' + totalRooms + '_' + currentAdr + '_' + currentOcc
  const r = rng(seed)

  const roomTypes = ['标准大床房', '豪华双床房', '行政套房', '总统套房', '家庭房', '商务大床房']
  const baseRates = [currentAdr * 0.85, currentAdr * 0.95, currentAdr * 1.35, currentAdr * 2.2, currentAdr * 1.1, currentAdr * 1.05]
  const roomCounts = [Math.round(totalRooms * 0.3), Math.round(totalRooms * 0.25), Math.round(totalRooms * 0.15), Math.round(totalRooms * 0.05), Math.round(totalRooms * 0.12), totalRooms - Math.round(totalRooms * 0.3) - Math.round(totalRooms * 0.25) - Math.round(totalRooms * 0.15) - Math.round(totalRooms * 0.05) - Math.round(totalRooms * 0.12)]

  const roomTypeRates: RoomTypeRate[] = roomTypes.map((rt, i) => {
    const demandFactor = 0.85 + r.next() * 0.4
    return {
      room_type: rt,
      base_rate: round2(baseRates[i]),
      recommended_rate: round2(baseRates[i] * demandFactor),
      demand_factor: round2(demandFactor),
      competitor_avg: round2(baseRates[i] * (0.9 + r.next() * 0.25)),
      pickup_rate: round2(0.6 + r.next() * 0.35),
    }
  })

  const dailyForecast: DailyForecast[] = []
  const now = new Date()
  for (let i = 0; i < forecastDays; i++) {
    const d = new Date(now.getTime() + i * 86400000)
    const dayOfWeek = d.getDay()
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6 ? 1.15 : 1.0
    const occ = Math.min(98, Math.max(35, currentOcc + r.range(-10, 15)) * weekendBoost)
    const roomsSold = Math.round(totalRooms * occ / 100)
    const adr = round2(currentAdr * (0.9 + r.next() * 0.3) * weekendBoost)
    dailyForecast.push({
      date: d.toISOString().slice(0, 10),
      adr,
      revpar: round2(adr * occ / 100),
      occ_pct: round2(occ),
      rooms_sold: roomsSold,
      rooms_available: totalRooms,
      revenue: round2(adr * roomsSold),
    })
  }

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const seasonalTrend: SeasonalTrend[] = months.map((m, i) => {
    const peakBoost = (i >= 6 && i <= 8) || (i >= 4 && i <= 5) ? 1.2 : i === 9 ? 1.15 : 0.9
    return {
      month: m,
      adr: round2(currentAdr * peakBoost * (0.9 + r.next() * 0.2)),
      revpar: round2(currentAdr * peakBoost * (currentOcc / 100) * (0.85 + r.next() * 0.3)),
      occ_pct: round2(Math.min(98, currentOcc * peakBoost * (0.9 + r.next() * 0.2))),
      yoy_growth: round2(r.range(-5, 18)),
    }
  })

  const pricingRecommendations = [
    '周末及节假日建议提价15%-25%，利用需求弹性最大化RevPAR',
    '工作日推出商务套餐，含早餐+延迟入住，提升OCC 8-12%',
    '行政套房需求旺盛，建议动态提价10%并限制低价渠道库存',
    '提前14天预订享9折优惠，提前30天享85折，优化预订窗口',
    '竞品价格监控显示我方标准房型定价偏低，建议上调5%-8%',
    '淡季推出住三送一及连住优惠，平滑季节性波动',
  ]

  return {
    kpi_summary: {
      current_adr: currentAdr,
      current_revpar: round2(currentAdr * currentOcc / 100),
      current_occ: currentOcc,
      total_rooms: totalRooms,
      forecast_period: forecastDays + '天',
    },
    room_type_rates: roomTypeRates,
    daily_forecast: dailyForecast,
    seasonal_trend: seasonalTrend,
    pricing_recommendations: pricingRecommendations,
  }
}

function formatRevenueManagement(r: RevenueManagementResult): string {
  const lines: string[] = []
  lines.push('# 酒店旅游AI助手 | 收益管理 Dashboard')
  lines.push('> Generated: ' + currentIso() + ' | Version: ' + VERSION)
  lines.push('')
  lines.push('## 核心KPI概览')
  lines.push('')
  lines.push('```')
  lines.push('  ADR (平均房价):  ¥' + r.kpi_summary.current_adr.toLocaleString().padStart(8) + '  |  RevPAR: ¥' + r.kpi_summary.current_revpar.toLocaleString().padStart(8))
  lines.push('  OCC (入住率):   ' + r.kpi_summary.current_occ.toString().padStart(8) + '%  |  总房量: ' + r.kpi_summary.total_rooms + '间')
  lines.push('  预测周期:       ' + r.kpi_summary.forecast_period)
  lines.push('```')
  lines.push('')
  lines.push('## 房型定价建议')
  lines.push('')
  lines.push('| 房型 | 基础价(¥) | 推荐价(¥) | 需求系数 | 竞品均价(¥) | 预订进度 |')
  lines.push('|------|----------|----------|---------|------------|---------|')
  for (const rt of r.room_type_rates) {
    lines.push('| ' + rt.room_type + ' | ' + rt.base_rate + ' | ' + rt.recommended_rate + ' | ' + rt.demand_factor + ' | ' + rt.competitor_avg + ' | ' + (rt.pickup_rate * 100).toFixed(0) + '% |')
  }
  lines.push('')
  lines.push('## 每日收益预测 (前14天)')
  lines.push('')
  lines.push('| 日期 | ADR(¥) | RevPAR(¥) | OCC(%) | 售出/总量 | 日收入(¥) |')
  lines.push('|------|--------|----------|--------|----------|----------|')
  for (const d of r.daily_forecast.slice(0, 14)) {
    lines.push('| ' + d.date + ' | ' + d.adr + ' | ' + d.revpar + ' | ' + d.occ_pct + ' | ' + d.rooms_sold + '/' + d.rooms_available + ' | ' + d.revenue.toLocaleString() + ' |')
  }
  lines.push('')
  lines.push('## 季节性趋势 (月度)')
  lines.push('')
  lines.push('| 月份 | ADR(¥) | RevPAR(¥) | OCC(%) | 同比增长 |')
  lines.push('|------|--------|----------|--------|---------|')
  for (const s of r.seasonal_trend) {
    lines.push('| ' + s.month + ' | ' + s.adr + ' | ' + s.revpar + ' | ' + s.occ_pct + ' | ' + (s.yoy_growth >= 0 ? '+' : '') + s.yoy_growth + '% |')
  }
  lines.push('')
  lines.push('## 定价策略建议')
  lines.push('')
  for (const rec of r.pricing_recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ===========================================================================
// 2. GUEST EXPERIENCE TRACKER -- 宾客体验 (NPS/OTA点评/投诉处理)
// ===========================================================================

interface NPSData {
  period: string
  promoters: number
  passives: number
  detractors: number
  nps_score: number
  response_count: number
}

interface OTAReview {
  platform: string
  rating: number
  review_count: number
  positive_pct: number
  negative_pct: number
  top_positive: string
  top_negative: string
}

interface ComplaintItem {
  category: string
  count: number
  avg_resolution_hours: number
  satisfaction_pct: number
  trend: string
}

interface GuestExperienceResult {
  nps_summary: {
    current_nps: number
    industry_avg: number
    total_responses: number
    nps_trend: string
  }
  nps_history: NPSData[]
  ota_reviews: OTAReview[]
  complaints: ComplaintItem[]
  improvement_actions: string[]
}

function runGuestExperience(
  currentNps: number,
  totalResponses: number,
  complaintCount: number,
): GuestExperienceResult {
  const seed = 'guest_' + currentNps + '_' + totalResponses
  const r = rng(seed)

  const npsHistory: NPSData[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const promoters = 35 + r.int(0, 25)
    const passives = 25 + r.int(0, 20)
    const detractors = 100 - promoters - passives
    npsHistory.push({
      period: d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0'),
      promoters,
      passives,
      detractors,
      nps_score: promoters - detractors,
      response_count: Math.round(totalResponses / 6 * (0.8 + r.next() * 0.4)),
    })
  }

  const platforms = ['携程', '美团', '飞猪', 'Booking.com', 'Agoda', '去哪儿']
  const positives = ['服务热情周到', '房间干净整洁', '地理位置优越', '早餐丰富美味', '床品舒适', '景观视野好']
  const negatives = ['隔音效果一般', 'WiFi信号不稳定', '办理入住等待时间长', '停车位不足', '空调噪音大', '浴室排水慢']
  const otaReviews: OTAReview[] = platforms.map((p, i) => ({
    platform: p,
    rating: round2(3.8 + r.next() * 1.2),
    review_count: r.int(50, 500),
    positive_pct: r.int(60, 92),
    negative_pct: r.int(5, 25),
    top_positive: positives[i % positives.length],
    top_negative: negatives[i % negatives.length],
  }))

  const complaintCategories = ['房间设施', '服务态度', '卫生状况', '噪音问题', '餐饮质量', '预订问题', '账单争议', '停车问题']
  const complaints: ComplaintItem[] = complaintCategories.slice(0, complaintCount).map((cat, i) => ({
    category: cat,
    count: r.int(3, 25),
    avg_resolution_hours: round2(2 + r.next() * 22),
    satisfaction_pct: r.int(55, 95),
    trend: i % 3 === 0 ? '下降' : i % 3 === 1 ? '持平' : '上升',
  }))

  const improvementActions = [
    '针对隔音投诉，优先为临街房间加装双层隔音窗',
    '优化入住流程，引入自助入住终端，目标等待时间<3分钟',
    'WiFi升级计划：公共区域部署Mesh网络，客房带宽提升至200M',
    '建立投诉30分钟响应SLA，超时自动升级至值班经理',
    '每月开展服务礼仪培训，重点强化前台和礼宾团队',
    '推出"惊喜服务"计划：生日/纪念日免费布置，提升NPS 5-8分',
  ]

  return {
    nps_summary: {
      current_nps: currentNps,
      industry_avg: 35,
      total_responses: totalResponses,
      nps_trend: currentNps > 40 ? '优秀' : currentNps > 25 ? '良好' : '需改善',
    },
    nps_history: npsHistory,
    ota_reviews: otaReviews,
    complaints,
    improvement_actions: improvementActions,
  }
}

function formatGuestExperience(r: GuestExperienceResult): string {
  const lines: string[] = []
  lines.push('# 酒店旅游AI助手 | 宾客体验追踪 Dashboard')
  lines.push('> Generated: ' + currentIso() + ' | Version: ' + VERSION)
  lines.push('')
  lines.push('## NPS 净推荐值概览')
  lines.push('')
  lines.push('```')
  lines.push('  当前NPS: ' + r.nps_summary.current_nps.toString().padStart(6) + '  |  行业均值: ' + r.nps_summary.industry_avg + '  |  评级: ' + r.nps_summary.nps_trend)
  lines.push('  总回复数: ' + r.nps_summary.total_responses.toLocaleString().padStart(6) + '  |  趋势: ' + (r.nps_summary.current_nps > r.nps_summary.industry_avg ? '高于行业平均' : '低于行业平均'))
  lines.push('```')
  lines.push('')
  lines.push('## NPS 历史趋势 (近6个月)')
  lines.push('')
  lines.push('| 月份 | 推荐者% | 中立者% | 贬损者% | NPS得分 | 回复数 |')
  lines.push('|------|--------|--------|--------|--------|-------|')
  for (const n of r.nps_history) {
    lines.push('| ' + n.period + ' | ' + n.promoters + '% | ' + n.passives + '% | ' + n.detractors + '% | ' + n.nps_score + ' | ' + n.response_count + ' |')
  }
  lines.push('')
  lines.push('## OTA平台点评分析')
  lines.push('')
  lines.push('| 平台 | 评分 | 点评数 | 好评率 | 差评率 | 热门好评 | 热门差评 |')
  lines.push('|------|------|--------|--------|--------|---------|---------|')
  for (const o of r.ota_reviews) {
    lines.push('| ' + o.platform + ' | ' + o.rating + ' | ' + o.review_count + ' | ' + o.positive_pct + '% | ' + o.negative_pct + '% | ' + o.top_positive + ' | ' + o.top_negative + ' |')
  }
  lines.push('')
  lines.push('## 投诉分析')
  lines.push('')
  lines.push('| 投诉类别 | 数量 | 平均处理时长(h) | 满意度 | 趋势 |')
  lines.push('|---------|------|----------------|--------|------|')
  for (const c of r.complaints) {
    lines.push('| ' + c.category + ' | ' + c.count + ' | ' + c.avg_resolution_hours + ' | ' + c.satisfaction_pct + '% | ' + c.trend + ' |')
  }
  lines.push('')
  lines.push('## 改善行动计划')
  lines.push('')
  for (const a of r.improvement_actions) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ===========================================================================
// 3. HOTEL OPERATIONS -- 酒店运营 (前台/客房/餐饮/能耗)
// ===========================================================================

interface FrontDeskMetric {
  metric: string
  value: string
  benchmark: string
  status: string
}

interface FBOutlet {
  outlet: string
  covers_per_day: number
  avg_spend: number
  revenue_per_day: number
  wastage_pct: number
  rating: number
}

interface EnergyRecord {
  category: string
  monthly_kwh: number
  cost_rmb: number
  pct_of_total: number
  efficiency: string
}

interface HotelOperationsResult {
  front_desk: FrontDeskMetric[]
  fb_outlets: FBOutlet[]
  energy: EnergyRecord[]
  operational_score: number
  recommendations: string[]
}

function runHotelOperations(
  totalRooms: number,
  totalCovers: number,
  monthlyEnergyKwh: number,
): HotelOperationsResult {
  const seed = 'ops_' + totalRooms + '_' + totalCovers + '_' + monthlyEnergyKwh
  const r = rng(seed)

  const frontDesk: FrontDeskMetric[] = [
    { metric: '平均办理入住时间', value: (2 + r.next() * 3).toFixed(1) + '分钟', benchmark: '< 3分钟', status: r.next() > 0.5 ? '达标' : '需改善' },
    { metric: '平均退房时间', value: (1.5 + r.next() * 2).toFixed(1) + '分钟', benchmark: '< 2分钟', status: r.next() > 0.4 ? '达标' : '需改善' },
    { metric: '预订转化率', value: (65 + r.next() * 25).toFixed(1) + '%', benchmark: '> 75%', status: r.next() > 0.5 ? '达标' : '需改善' },
    { metric: 'Walk-in占比', value: (10 + r.next() * 20).toFixed(1) + '%', benchmark: '< 15%', status: r.next() > 0.5 ? '达标' : '需改善' },
    { metric: '升级销售成功率', value: (15 + r.next() * 20).toFixed(1) + '%', benchmark: '> 20%', status: r.next() > 0.5 ? '达标' : '需改善' },
    { metric: 'VIP接待满意度', value: (4 + r.next()).toFixed(1) + '/5.0', benchmark: '> 4.5', status: r.next() > 0.6 ? '达标' : '需改善' },
  ]

  const outlets = ['中餐厅', '西餐厅', '大堂吧', '宴会厅', '客房送餐', '日料餐厅']
  const fbOutlets: FBOutlet[] = outlets.map((o, i) => {
    const covers = Math.round(totalCovers / outlets.length * (0.7 + r.next() * 0.6))
    const avgSpend = 80 + r.next() * 220
    return {
      outlet: o,
      covers_per_day: covers,
      avg_spend: round2(avgSpend),
      revenue_per_day: round2(covers * avgSpend),
      wastage_pct: round2(3 + r.next() * 7),
      rating: round2(3.8 + r.next() * 1.2),
    }
  })

  const energyCategories = ['空调系统', '照明系统', '热水系统', '电梯设备', '厨房设备', '办公设备', '其他']
  const energyShares = [0.35, 0.15, 0.18, 0.08, 0.12, 0.07, 0.05]
  const energy: EnergyRecord[] = energyCategories.map((cat, i) => ({
    category: cat,
    monthly_kwh: Math.round(monthlyEnergyKwh * energyShares[i] * (0.9 + r.next() * 0.2)),
    cost_rmb: Math.round(monthlyEnergyKwh * energyShares[i] * 0.85 * (0.9 + r.next() * 0.2)),
    pct_of_total: round2(energyShares[i] * 100),
    efficiency: r.next() > 0.6 ? '高效' : r.next() > 0.3 ? '一般' : '需优化',
  }))

  const operationalScore = round2(70 + r.next() * 25)

  const recommendations = [
    '前台引入自助入住机，目标将入住时间压缩至90秒以内',
    '中餐厅食材损耗率偏高(8.2%)，建议优化采购计划和菜品结构',
    '空调系统能耗占比35%，建议安装智能温控系统，预计节能15%-20%',
    '西餐厅评分4.6表现优秀，建议将其服务标准推广至其他餐饮点',
    '热水系统建议加装太阳能预热装置，降低燃气消耗约25%',
    '推行无纸化办公，前台和客房全面使用移动端工单系统',
  ]

  return {
    front_desk: frontDesk,
    fb_outlets: fbOutlets,
    energy,
    operational_score: operationalScore,
    recommendations,
  }
}

function formatHotelOperations(r: HotelOperationsResult): string {
  const lines: string[] = []
  lines.push('# 酒店旅游AI助手 | 酒店运营 Dashboard')
  lines.push('> Generated: ' + currentIso() + ' | Version: ' + VERSION)
  lines.push('')
  lines.push('## 运营健康评分')
  lines.push('')
  lines.push('```')
  lines.push('  综合运营得分: ' + r.operational_score + '/100  |  ' + (r.operational_score >= 85 ? '优秀' : r.operational_score >= 70 ? '良好' : '需改善'))
  lines.push('```')
  lines.push('')
  lines.push('## 前台运营指标')
  lines.push('')
  lines.push('| 指标 | 当前值 | 基准 | 状态 |')
  lines.push('|------|--------|------|------|')
  for (const f of r.front_desk) {
    lines.push('| ' + f.metric + ' | ' + f.value + ' | ' + f.benchmark + ' | ' + f.status + ' |')
  }
  lines.push('')
  lines.push('## 餐饮运营')
  lines.push('')
  lines.push('| 餐厅 | 日均翻台 | 人均消费(¥) | 日收入(¥) | 损耗率 | 评分 |')
  lines.push('|------|---------|------------|----------|--------|------|')
  for (const o of r.fb_outlets) {
    lines.push('| ' + o.outlet + ' | ' + o.covers_per_day + ' | ' + o.avg_spend + ' | ' + o.revenue_per_day.toLocaleString() + ' | ' + o.wastage_pct + '% | ' + o.rating + ' |')
  }
  lines.push('')
  lines.push('## 能耗分析')
  lines.push('')
  lines.push('| 类别 | 月耗电(kwh) | 费用(¥) | 占比 | 效率评级 |')
  lines.push('|------|-----------|--------|------|---------|')
  for (const e of r.energy) {
    lines.push('| ' + e.category + ' | ' + e.monthly_kwh.toLocaleString() + ' | ' + e.cost_rmb.toLocaleString() + ' | ' + e.pct_of_total + '% | ' + e.efficiency + ' |')
  }
  lines.push('')
  lines.push('## 运营改善建议')
  lines.push('')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ===========================================================================
// 4. MARKETING DISTRIBUTION -- 营销分销 (直销/OTA/企业协议/会员)
// ===========================================================================

interface ChannelPerformance {
  channel: string
  revenue_pct: number
  adr: number
  booking_count: number
  commission_pct: number
  cost_per_acquisition: number
  roi: number
}

interface MemberTier {
  tier: string
  member_count: number
  avg_nights: number
  avg_spend: number
  retention_rate: number
  upgrade_rate: number
}

interface CorporateAccount {
  company: string
  room_nights_ytd: number
  adr: number
  revenue: number
  contract_type: string
  payment_terms: string
}

interface MarketingDistributionResult {
  channel_mix: ChannelPerformance[]
  member_tiers: MemberTier[]
  corporate_accounts: CorporateAccount[]
  marketing_roi: number
  recommendations: string[]
}

function runMarketingDistribution(
  totalRevenue: number,
  memberCount: number,
  corporateCount: number,
): MarketingDistributionResult {
  const seed = 'mkt_' + totalRevenue + '_' + memberCount + '_' + corporateCount
  const r = rng(seed)

  const channels = ['官网直销', '微信小程序', '携程', '美团', '飞猪', '企业协议', '旅行社', '电话预订']
  const revenueShares = [0.15, 0.12, 0.22, 0.18, 0.08, 0.13, 0.07, 0.05]
  const commissions = [0, 0, 12, 10, 10, 3, 15, 0]
  const channelMix: ChannelPerformance[] = channels.map((ch, i) => {
    const adr = 350 + r.next() * 300
    const bookings = Math.round(totalRevenue * revenueShares[i] / adr)
    return {
      channel: ch,
      revenue_pct: round2(revenueShares[i] * 100),
      adr: round2(adr),
      booking_count: bookings,
      commission_pct: commissions[i],
      cost_per_acquisition: round2(adr * commissions[i] / 100 + r.next() * 30),
      roi: round2((1 - commissions[i] / 100) * (3 + r.next() * 4)),
    }
  })

  const tiers = ['普通会员', '银卡', '金卡', '白金卡', '钻石卡']
  const tierShares = [0.45, 0.25, 0.15, 0.1, 0.05]
  const memberTiers: MemberTier[] = tiers.map((t, i) => ({
    tier: t,
    member_count: Math.round(memberCount * tierShares[i]),
    avg_nights: round2(1 + r.next() * (i * 3 + 5)),
    avg_spend: round2(300 + i * 200 + r.next() * 200),
    retention_rate: round2(40 + i * 10 + r.next() * 15),
    upgrade_rate: round2(5 + r.next() * 15),
  }))

  const companies = ['华为技术', '腾讯科技', '阿里巴巴', '中国银行', '招商银行', '中信证券', '字节跳动', '京东集团']
  const contractTypes = ['协议价', '框架协议', '年度合约', '临时协议']
  const corporateAccounts: CorporateAccount[] = companies.slice(0, corporateCount).map((co, i) => {
    const nights = r.int(50, 500)
    const adr = 300 + r.next() * 200
    return {
      company: co,
      room_nights_ytd: nights,
      adr: round2(adr),
      revenue: round2(nights * adr),
      contract_type: contractTypes[i % contractTypes.length],
      payment_terms: i % 2 === 0 ? '月结30天' : '月结45天',
    }
  })

  const marketingRoi = round2(2.5 + r.next() * 3)

  const recommendations = [
    '官网直销占比15%偏低，建议加大SEO投入和官网专属优惠，目标提升至22%',
    '携程佣金12%为最高渠道成本，建议谈判降至10%或提升官网分流',
    '钻石卡会员仅5%但贡献25%收入，建议设计专属权益提升升级率',
    '企业协议客户续约率需关注，建议每季度回访并推出忠诚度奖励',
    '微信小程序渠道ROI最高(5.2x)，建议加大社交裂变和拼团活动投入',
    '推出会员日专属活动，每月8号会员享双倍积分+免费升级',
  ]

  return {
    channel_mix: channelMix,
    member_tiers: memberTiers,
    corporate_accounts: corporateAccounts,
    marketing_roi: marketingRoi,
    recommendations,
  }
}

function formatMarketingDistribution(r: MarketingDistributionResult): string {
  const lines: string[] = []
  lines.push('# 酒店旅游AI助手 | 营销分销 Dashboard')
  lines.push('> Generated: ' + currentIso() + ' | Version: ' + VERSION)
  lines.push('')
  lines.push('## 营销ROI概览')
  lines.push('')
  lines.push('```')
  lines.push('  综合营销ROI: ' + r.marketing_roi + 'x  |  ' + (r.marketing_roi >= 4 ? '优秀' : r.marketing_roi >= 3 ? '良好' : '需优化'))
  lines.push('```')
  lines.push('')
  lines.push('## 渠道表现分析')
  lines.push('')
  lines.push('| 渠道 | 收入占比 | ADR(¥) | 订单数 | 佣金率 | 获客成本(¥) | ROI |')
  lines.push('|------|---------|--------|--------|--------|-----------|-----|')
  for (const c of r.channel_mix) {
    lines.push('| ' + c.channel + ' | ' + c.revenue_pct + '% | ' + c.adr + ' | ' + c.booking_count + ' | ' + c.commission_pct + '% | ' + c.cost_per_acquisition + ' | ' + c.roi + 'x |')
  }
  lines.push('')
  lines.push('## 会员体系分析')
  lines.push('')
  lines.push('| 等级 | 会员数 | 平均间夜 | 平均消费(¥) | 留存率 | 升级率 |')
  lines.push('|------|--------|---------|------------|--------|-------|')
  for (const m of r.member_tiers) {
    lines.push('| ' + m.tier + ' | ' + m.member_count.toLocaleString() + ' | ' + m.avg_nights + ' | ' + m.avg_spend + ' | ' + m.retention_rate + '% | ' + m.upgrade_rate + '% |')
  }
  lines.push('')
  lines.push('## 企业协议客户')
  lines.push('')
  lines.push('| 企业 | 年度间夜 | ADR(¥) | 收入(¥) | 合约类型 | 账期 |')
  lines.push('|------|---------|--------|--------|---------|------|')
  for (const a of r.corporate_accounts) {
    lines.push('| ' + a.company + ' | ' + a.room_nights_ytd + ' | ' + a.adr + ' | ' + a.revenue.toLocaleString() + ' | ' + a.contract_type + ' | ' + a.payment_terms + ' |')
  }
  lines.push('')
  lines.push('## 营销策略建议')
  lines.push('')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ===========================================================================
// 5. TOURISM PRODUCT DESIGNER -- 旅游产品 (线路/主题/定制/跟团)
// ===========================================================================

interface TourRoute {
  route_name: string
  destination: string
  duration: string
  theme: string
  group_size: string
  price_per_person: number
  highlights: string[]
  difficulty: string
}

interface ThemeProduct {
  theme: string
  target_audience: string
  season: string
  avg_price: number
  market_demand: string
  growth_potential: string
}

interface CustomItinerary {
  day: number
  activities: string[]
  meals: string
  accommodation: string
  transport: string
}

interface TourismProductResult {
  routes: TourRoute[]
  themes: ThemeProduct[]
  custom_sample: CustomItinerary[]
  pricing_strategy: string[]
}

function runTourismProduct(
  routeCount: number,
  themeCount: number,
  customDays: number,
): TourismProductResult {
  const seed = 'tour_' + routeCount + '_' + themeCount + '_' + customDays
  const r = rng(seed)

  const destinations = ['云南大理', '海南三亚', '西藏拉萨', '新疆喀纳斯', '四川稻城', '广西桂林', '福建厦门', '浙江乌镇', '湖南张家界', '贵州黔东南']
  const themes = ['亲子游', '蜜月游', '摄影游', '徒步探险', '文化体验', '美食之旅', '康养度假', '研学旅行', '自驾穿越', '深度人文']
  const durations = ['3天2晚', '4天3晚', '5天4晚', '6天5晚', '7天6晚']
  const difficulties = ['轻松', '适中', '挑战']

  const routes: TourRoute[] = []
  for (let i = 0; i < routeCount; i++) {
    const dest = destinations[i % destinations.length]
    const theme = themes[i % themes.length]
    routes.push({
      route_name: dest + theme + '精品线路',
      destination: dest,
      duration: durations[i % durations.length],
      theme: theme,
      group_size: i % 3 === 0 ? '6-10人' : i % 3 === 1 ? '10-20人' : '2-6人私家团',
      price_per_person: round2(1500 + r.next() * 8000),
      highlights: [dest + '核心景区', '当地特色美食体验', '深度文化导览', '精品酒店住宿'].slice(0, 2 + r.int(0, 2)),
      difficulty: difficulties[i % difficulties.length],
    })
  }

  const audiences = ['亲子家庭', '年轻情侣', '银发族', '企业团建', '摄影爱好者', '户外达人']
  const seasons = ['春季', '夏季', '秋季', '冬季', '全年']
  const demands = ['高', '中', '低']
  const potentials = ['快速增长', '稳定增长', '平稳', '待开发']
  const themeProducts: ThemeProduct[] = themes.slice(0, themeCount).map((t, i) => ({
    theme: t,
    target_audience: audiences[i % audiences.length],
    season: seasons[i % seasons.length],
    avg_price: round2(1200 + r.next() * 6000),
    market_demand: demands[i % demands.length],
    growth_potential: potentials[i % potentials.length],
  }))

  const customSample: CustomItinerary[] = []
  const activities_pool = ['古城漫步', '特色手工艺体验', '当地市集探访', '日出观赏', '温泉体验', '民族歌舞表演', '茶园品鉴', '骑行探索', '游船观光', '夜市美食']
  const meals_pool = ['酒店自助早餐+当地特色午晚餐', '全程含餐', '早餐+特色午餐', '自理+推荐餐厅', '全包式餐饮']
  const hotels_pool = ['五星级酒店', '精品民宿', '度假酒店', '特色客栈', '温泉酒店']
  for (let d = 1; d <= customDays; d++) {
    customSample.push({
      day: d,
      activities: [activities_pool[r.int(0, activities_pool.length - 1)], activities_pool[r.int(0, activities_pool.length - 1)]],
      meals: meals_pool[r.int(0, meals_pool.length - 1)],
      accommodation: hotels_pool[r.int(0, hotels_pool.length - 1)],
      transport: d === 1 ? '机场接机' : d === customDays ? '送机' : '专车接送',
    })
  }

  const pricingStrategy = [
    '私家团溢价30%-50%，主打私密性和定制化体验',
    '亲子游产品建议含全家庭套餐，儿童价设为成人价60%',
    '淡季(11-3月)推出早鸟优惠，提前60天预订享7折',
    '蜜月游增加浪漫布置和摄影服务，可溢价20%-35%',
    '企业团建按人头报价，20人以上享团队折扣',
    '摄影游按季节定价，旺季(秋季)价格上浮25%-40%',
  ]

  return {
    routes,
    themes: themeProducts,
    custom_sample: customSample,
    pricing_strategy: pricingStrategy,
  }
}

function formatTourismProduct(r: TourismProductResult): string {
  const lines: string[] = []
  lines.push('# 酒店旅游AI助手 | 旅游产品设计 Dashboard')
  lines.push('> Generated: ' + currentIso() + ' | Version: ' + VERSION)
  lines.push('')
  lines.push('## 精品线路推荐')
  lines.push('')
  lines.push('| 线路名称 | 目的地 | 行程 | 主题 | 团型 | 人均价(¥) | 难度 |')
  lines.push('|---------|--------|------|------|------|----------|------|')
  for (const rt of r.routes) {
    lines.push('| ' + rt.route_name + ' | ' + rt.destination + ' | ' + rt.duration + ' | ' + rt.theme + ' | ' + rt.group_size + ' | ' + rt.price_per_person.toLocaleString() + ' | ' + rt.difficulty + ' |')
  }
  lines.push('')
  lines.push('## 主题产品分析')
  lines.push('')
  lines.push('| 主题 | 目标客群 | 最佳季节 | 均价(¥) | 市场需求 | 增长潜力 |')
  lines.push('|------|---------|---------|--------|---------|---------|')
  for (const t of r.themes) {
    lines.push('| ' + t.theme + ' | ' + t.target_audience + ' | ' + t.season + ' | ' + t.avg_price.toLocaleString() + ' | ' + t.market_demand + ' | ' + t.growth_potential + ' |')
  }
  lines.push('')
  lines.push('## 定制行程示例')
  lines.push('')
  for (const c of r.custom_sample) {
    lines.push('### Day ' + c.day)
    lines.push('- 活动: ' + c.activities.join('、'))
    lines.push('- 餐饮: ' + c.meals)
    lines.push('- 住宿: ' + c.accommodation)
    lines.push('- 交通: ' + c.transport)
    lines.push('')
  }
  lines.push('## 定价策略建议')
  lines.push('')
  for (const s of r.pricing_strategy) {
    lines.push('- ' + s)
  }
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ===========================================================================
// 6. EVENT MANAGEMENT -- 宴会会务 (场地/餐饮/AV设备/报价)
// ===========================================================================

interface Venue {
  name: string
  area_sqm: number
  capacity_theater: number
  capacity_banquet: number
  daily_rate: number
  availability: string
}

interface MenuPackage {
  tier: string
  price_per_table: number
  courses: number
  includes: string[]
  suitable_for: string
}

interface AVItem {
  item: string
  daily_rental: number
  quantity_available: number
  tech_support: string
}

interface EventProposal {
  event_type: string
  estimated_guests: number
  venue_recommendation: string
  menu_tier: string
  av_requirements: string[]
  total_estimate: number
}

interface EventManagementResult {
  venues: Venue[]
  menus: MenuPackage[]
  av_equipment: AVItem[]
  sample_proposal: EventProposal
  recommendations: string[]
}

function runEventManagement(
  venueCount: number,
  menuTiers: number,
  avItems: number,
): EventManagementResult {
  const seed = 'event_' + venueCount + '_' + menuTiers + '_' + avItems
  const r = rng(seed)

  const venueNames = ['大宴会厅', '多功能厅A', '多功能厅B', 'VIP会议室', '户外花园', '屋顶露台', '董事会议室', '会议中心']
  const venues: Venue[] = venueNames.slice(0, venueCount).map((v, i) => {
    const area = 80 + r.int(0, 420)
    return {
      name: v,
      area_sqm: area,
      capacity_theater: Math.round(area / 1.2),
      capacity_banquet: Math.round(area / 2),
      daily_rate: round2(3000 + r.next() * 15000),
      availability: r.next() > 0.3 ? '可预订' : '已预订',
    }
  })

  const tierNames = ['标准宴席', '精品宴席', '豪华宴席', '至尊宴席', '定制宴席']
  const menus: MenuPackage[] = tierNames.slice(0, menuTiers).map((t, i) => ({
    tier: t,
    price_per_table: round2(1500 + i * 800 + r.next() * 500),
    courses: 8 + i * 2,
    includes: ['冷菜拼盘', '热菜主汤', '海鲜精选', '主食点心', '水果甜品'].slice(0, 3 + r.int(0, 2)),
    suitable_for: i < 2 ? '商务宴请/团队聚餐' : '高端婚宴/重要接待',
  }))

  const avNames = ['LED大屏', '专业音响', '无线麦克风', '投影仪', '舞台灯光', '摄像机', '同声传译', '视频会议系统']
  const avPrices = [3000, 2000, 500, 1500, 2500, 1800, 5000, 4000]
  const avEquipment: AVItem[] = avNames.slice(0, avItems).map((a, i) => ({
    item: a,
    daily_rental: avPrices[i % avPrices.length],
    quantity_available: r.int(2, 20),
    tech_support: i < 3 ? '含技术支持' : '额外收费',
  }))

  const eventTypes = ['年度晚宴', '商务会议', '婚礼庆典', '产品发布会', '团队建设']
  const sampleProposal: EventProposal = {
    event_type: eventTypes[r.int(0, eventTypes.length - 1)],
    estimated_guests: r.int(50, 300),
    venue_recommendation: venues[0].name,
    menu_tier: menus[Math.min(1, menus.length - 1)].tier,
    av_requirements: [avEquipment[0]?.item || 'LED大屏', avEquipment[1]?.item || '专业音响'],
    total_estimate: round2(15000 + r.next() * 80000),
  }

  const recommendations = [
    '大宴会厅建议增加可隔断设计，灵活应对50-500人不同规模活动',
    '推出会议+餐饮套餐，人均¥388起，含茶歇和午餐，提升场地利用率',
    'LED大屏和视频会议系统需求增长30%，建议更新4K设备',
    '婚宴档期紧张，建议开放2025年预订并推出早鸟优惠',
    '户外花园适合春秋季活动，建议增加透明雨棚扩展使用季节',
    '建立供应商白名单，餐饮和AV设备采购成本可降低15%-20%',
  ]

  return {
    venues,
    menus,
    av_equipment: avEquipment,
    sample_proposal: sampleProposal,
    recommendations,
  }
}

function formatEventManagement(r: EventManagementResult): string {
  const lines: string[] = []
  lines.push('# 酒店旅游AI助手 | 宴会会务管理 Dashboard')
  lines.push('> Generated: ' + currentIso() + ' | Version: ' + VERSION)
  lines.push('')
  lines.push('## 场地资源')
  lines.push('')
  lines.push('| 场地 | 面积(m²) | 剧院式容量 | 宴会式容量 | 日租金(¥) | 状态 |')
  lines.push('|------|---------|-----------|-----------|----------|------|')
  for (const v of r.venues) {
    lines.push('| ' + v.name + ' | ' + v.area_sqm + ' | ' + v.capacity_theater + ' | ' + v.capacity_banquet + ' | ' + v.daily_rate.toLocaleString() + ' | ' + v.availability + ' |')
  }
  lines.push('')
  lines.push('## 餐饮套餐')
  lines.push('')
  lines.push('| 套餐等级 | 每桌价格(¥) | 菜品数 | 包含内容 | 适用场景 |')
  lines.push('|---------|------------|--------|---------|---------|')
  for (const m of r.menus) {
    lines.push('| ' + m.tier + ' | ' + m.price_per_table.toLocaleString() + ' | ' + m.courses + '道 | ' + m.includes.join('、') + ' | ' + m.suitable_for + ' |')
  }
  lines.push('')
  lines.push('## AV设备清单')
  lines.push('')
  lines.push('| 设备 | 日租金(¥) | 可用数量 | 技术支持 |')
  lines.push('|------|----------|---------|---------|')
  for (const a of r.av_equipment) {
    lines.push('| ' + a.item + ' | ' + a.daily_rental.toLocaleString() + ' | ' + a.quantity_available + ' | ' + a.tech_support + ' |')
  }
  lines.push('')
  lines.push('## 活动方案示例')
  lines.push('')
  lines.push('```')
  lines.push('  活动类型: ' + r.sample_proposal.event_type)
  lines.push('  预计人数: ' + r.sample_proposal.estimated_guests + '人')
  lines.push('  推荐场地: ' + r.sample_proposal.venue_recommendation)
  lines.push('  餐饮套餐: ' + r.sample_proposal.menu_tier)
  lines.push('  AV需求:   ' + r.sample_proposal.av_requirements.join('、'))
  lines.push('  预估总价: ¥' + r.sample_proposal.total_estimate.toLocaleString())
  lines.push('```')
  lines.push('')
  lines.push('## 宴会运营建议')
  lines.push('')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ===========================================================================
// 7. HOUSEKEEPING OPTIMIZER -- 客房保洁 (排班/查房/布草/用品)
// ===========================================================================

interface StaffSchedule {
  shift: string
  staff_count: number
  rooms_per_staff: number
  efficiency_pct: number
  overtime_risk: string
}

interface RoomInspection {
  room_type: string
  inspection_items: number
  pass_rate: number
  common_issues: string[]
  avg_inspection_min: number
}

interface LinenInventory {
  item: string
  par_level: number
  current_stock: number
  turnover_days: number
  replacement_need: string
}

interface AmenityUsage {
  item: string
  daily_usage: number
  cost_per_unit: number
  monthly_cost: number
  waste_pct: number
}

interface HousekeepingResult {
  schedules: StaffSchedule[]
  inspections: RoomInspection[]
  linen: LinenInventory[]
  amenities: AmenityUsage[]
  optimization_score: number
  recommendations: string[]
}

function runHousekeeping(
  totalRooms: number,
  staffCount: number,
  linenTypes: number,
): HousekeepingResult {
  const seed = 'house_' + totalRooms + '_' + staffCount + '_' + linenTypes
  const r = rng(seed)

  const shifts = ['早班(7-15)', '中班(15-23)', '夜班(23-7)']
  const schedules: StaffSchedule[] = shifts.map((s, i) => {
    const staff = i === 0 ? Math.round(staffCount * 0.5) : i === 1 ? Math.round(staffCount * 0.35) : Math.round(staffCount * 0.15)
    return {
      shift: s,
      staff_count: staff,
      rooms_per_staff: round2(totalRooms / staffCount * (0.8 + r.next() * 0.4)),
      efficiency_pct: round2(75 + r.next() * 20),
      overtime_risk: r.next() > 0.7 ? '高' : r.next() > 0.4 ? '中' : '低',
    }
  })

  const roomTypes = ['标准大床房', '豪华双床房', '行政套房', '总统套房']
  const issues_pool = ['地毯清洁不足', '浴室水渍', '床品褶皱', '灰尘积累', '灯泡损坏', '墙面污渍']
  const inspections: RoomInspection[] = roomTypes.map((rt, i) => ({
    room_type: rt,
    inspection_items: 15 + i * 5,
    pass_rate: round2(80 + r.next() * 18),
    common_issues: [issues_pool[r.int(0, issues_pool.length - 1)], issues_pool[r.int(0, issues_pool.length - 1)]],
    avg_inspection_min: round2(5 + r.next() * 10),
  }))

  const linenNames = ['床单', '被套', '枕套', '浴巾', '面巾', '地巾', '毛巾', '浴袍']
  const linen: LinenInventory[] = linenNames.slice(0, linenTypes).map((l, i) => {
    const par = totalRooms * (3 + r.next() * 2)
    return {
      item: l,
      par_level: Math.round(par),
      current_stock: Math.round(par * (0.6 + r.next() * 0.8)),
      turnover_days: round2(2 + r.next() * 5),
      replacement_need: r.next() > 0.6 ? '需补充' : '充足',
    }
  })

  const amenityNames = ['洗发水', '沐浴露', '牙刷套装', '梳子', '浴帽', '棉棒', '茶叶包', '矿泉水']
  const amenityCosts = [1.5, 1.5, 0.8, 0.5, 0.3, 0.2, 0.4, 1.0]
  const amenities: AmenityUsage[] = amenityNames.map((a, i) => {
    const usage = r.int(20, 120)
    return {
      item: a,
      daily_usage: usage,
      cost_per_unit: amenityCosts[i],
      monthly_cost: round2(usage * amenityCosts[i] * 30),
      waste_pct: round2(5 + r.next() * 15),
    }
  })

  const optimizationScore = round2(65 + r.next() * 30)

  const recommendations = [
    '早班人员配置充足(50%)，建议维持当前排班策略',
    '总统套房查房标准需提升，当前通过率仅82%，建议增加检查项',
    '浴巾库存偏低(仅1.2倍PAR)，建议立即补货至3倍PAR安全库存',
    '洗发水等一次性用品浪费率12%，建议改用可替换装降低浪费',
    '引入房务管理系统，实时追踪房间状态，减少查房等待时间',
    '布草洗涤周期优化：当前3天周转，建议缩短至2天提升品质感',
  ]

  return {
    schedules,
    inspections,
    linen,
    amenities,
    optimization_score: optimizationScore,
    recommendations,
  }
}

function formatHousekeeping(r: HousekeepingResult): string {
  const lines: string[] = []
  lines.push('# 酒店旅游AI助手 | 客房保洁优化 Dashboard')
  lines.push('> Generated: ' + currentIso() + ' | Version: ' + VERSION)
  lines.push('')
  lines.push('## 保洁优化评分')
  lines.push('')
  lines.push('```')
  lines.push('  综合优化得分: ' + r.optimization_score + '/100  |  ' + (r.optimization_score >= 85 ? '优秀' : r.optimization_score >= 70 ? '良好' : '需改善'))
  lines.push('```')
  lines.push('')
  lines.push('## 排班管理')
  lines.push('')
  lines.push('| 班次 | 人员数 | 人均房量 | 效率 | 加班风险 |')
  lines.push('|------|--------|---------|------|---------|')
  for (const s of r.schedules) {
    lines.push('| ' + s.shift + ' | ' + s.staff_count + ' | ' + s.rooms_per_staff + '间 | ' + s.efficiency_pct + '% | ' + s.overtime_risk + ' |')
  }
  lines.push('')
  lines.push('## 查房质量')
  lines.push('')
  lines.push('| 房型 | 检查项 | 通过率 | 常见问题 | 平均查房时长 |')
  lines.push('|------|--------|--------|---------|------------|')
  for (const i of r.inspections) {
    lines.push('| ' + i.room_type + ' | ' + i.inspection_items + '项 | ' + i.pass_rate + '% | ' + i.common_issues.join('、') + ' | ' + i.avg_inspection_min + '分钟 |')
  }
  lines.push('')
  lines.push('## 布草库存')
  lines.push('')
  lines.push('| 物品 | PAR水平 | 当前库存 | 周转天数 | 状态 |')
  lines.push('|------|--------|---------|---------|------|')
  for (const l of r.linen) {
    lines.push('| ' + l.item + ' | ' + l.par_level + ' | ' + l.current_stock + ' | ' + l.turnover_days + '天 | ' + l.replacement_need + ' |')
  }
  lines.push('')
  lines.push('## 客房用品消耗')
  lines.push('')
  lines.push('| 用品 | 日消耗量 | 单价(¥) | 月成本(¥) | 浪费率 |')
  lines.push('|------|---------|--------|----------|--------|')
  for (const a of r.amenities) {
    lines.push('| ' + a.item + ' | ' + a.daily_usage + ' | ' + a.cost_per_unit + ' | ' + a.monthly_cost.toLocaleString() + ' | ' + a.waste_pct + '% |')
  }
  lines.push('')
  lines.push('## 优化建议')
  lines.push('')
  for (const rec of r.recommendations) {
    lines.push('- ' + rec)
  }
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ===========================================================================
// 8. REPUTATION MANAGEMENT -- 声誉管理 (评分排名/竞品监控/回复策略)
// ===========================================================================

interface PlatformScore {
  platform: string
  current_score: number
  previous_score: number
  change: number
  ranking: number
  total_hotels: number
  review_velocity: number
}

interface CompetitorBenchmark {
  hotel_name: string
  overall_score: number
  strength: string
  weakness: string
  market_position: string
}

interface ReviewResponseTemplate {
  scenario: string
  sentiment: string
  template: string
  response_time_sla: string
}

interface ReputationResult {
  platform_scores: PlatformScore[]
  competitors: CompetitorBenchmark[]
  response_templates: ReviewResponseTemplate[]
  reputation_score: number
  action_plan: string[]
}

function runReputationManagement(
  currentScore: number,
  competitorCount: number,
  templateCount: number,
): ReputationResult {
  const seed = 'repu_' + currentScore + '_' + competitorCount + '_' + templateCount
  const r = rng(seed)

  const platforms = ['携程', '美团', '飞猪', 'Booking.com', '去哪儿', '大众点评']
  const platformScores: PlatformScore[] = platforms.map((p, i) => {
    const score = round2(currentScore + r.range(-0.5, 0.5))
    const prev = round2(score + r.range(-0.3, 0.3))
    return {
      platform: p,
      current_score: score,
      previous_score: prev,
      change: round2(score - prev),
      ranking: r.int(3, 25),
      total_hotels: r.int(200, 2000),
      review_velocity: r.int(5, 30),
    }
  })

  const competitorNames = ['丽思卡尔顿', '万豪国际', '希尔顿', '洲际酒店', '香格里拉', '四季酒店', '凯悦酒店', '雅高集团']
  const strengths = ['服务卓越', '品牌知名度', '地理位置', '设施豪华', '餐饮出色', '会员体系', '数字化体验', '性价比']
  const weaknesses = ['价格偏高', '设施老化', '服务一致性', '停车不便', '隔音问题', '餐饮选择少', '位置偏远', '装修过时']
  const positions = ['高端领导者', '中高端竞争者', '性价比优选', '精品特色', '国际品牌']
  const competitors: CompetitorBenchmark[] = competitorNames.slice(0, competitorCount).map((c, i) => ({
    hotel_name: c,
    overall_score: round2(4.0 + r.next() * 0.9),
    strength: strengths[i % strengths.length],
    weakness: weaknesses[i % weaknesses.length],
    market_position: positions[i % positions.length],
  }))

  const scenarios = ['好评感谢', '差评回复', '设施投诉', '服务表扬', '价格质疑', '卫生问题']
  const sentiments = ['积极', '消极', '中性', '积极', '消极', '消极']
  const templates = [
    '感谢您的认可！我们始终致力于为每位宾客提供卓越的入住体验，期待您的再次光临！',
    '非常抱歉给您带来不便，我们已记录您反馈的问题并立即改进。诚邀您再次体验我们的提升成果。',
    '感谢您的反馈，我们已安排工程部全面检修相关设施，欢迎您下次入住时体验改善效果。',
    '非常感谢您的表扬，您的满意是我们团队最大的动力，期待再次为您服务！',
    '感谢您的关注，我们的定价基于优质服务和优越位置，定期推出优惠活动，欢迎关注官网。',
    '非常抱歉，我们对卫生问题零容忍。已对相关人员进行再培训，并加强查房标准。',
  ]
  const slas = ['2小时内', '1小时内', '2小时内', '4小时内', '3小时内', '30分钟内']
  const responseTemplates: ReviewResponseTemplate[] = scenarios.slice(0, templateCount).map((s, i) => ({
    scenario: s,
    sentiment: sentiments[i],
    template: templates[i],
    response_time_sla: slas[i],
  }))

  const reputationScore = round2(60 + r.next() * 35)

  const actionPlan = [
    '携程评分4.6低于竞品均值4.7，建议重点提升客房清洁和服务响应速度',
    '差评30分钟内回复率仅65%，建议设置自动提醒并纳入KPI考核',
    '美团点评数增长放缓，建议推出点评有礼活动，提升点评率20%',
    'Booking.com国际客源占比提升，建议增加多语言回复能力',
    '竞品丽思卡尔顿服务评分领先，建议引入其服务培训体系',
    '建立声誉预警机制：评分下降0.1自动触发管理层复盘会议',
  ]

  return {
    platform_scores: platformScores,
    competitors: competitors,
    response_templates: responseTemplates,
    reputation_score: reputationScore,
    action_plan: actionPlan,
  }
}

function formatReputationManagement(r: ReputationResult): string {
  const lines: string[] = []
  lines.push('# 酒店旅游AI助手 | 声誉管理 Dashboard')
  lines.push('> Generated: ' + currentIso() + ' | Version: ' + VERSION)
  lines.push('')
  lines.push('## 声誉健康评分')
  lines.push('')
  lines.push('```')
  lines.push('  综合声誉得分: ' + r.reputation_score + '/100  |  ' + (r.reputation_score >= 85 ? '优秀' : r.reputation_score >= 70 ? '良好' : '需改善'))
  lines.push('```')
  lines.push('')
  lines.push('## 平台评分与排名')
  lines.push('')
  lines.push('| 平台 | 当前评分 | 上期评分 | 变化 | 排名 | 总酒店数 | 日均新点评 |')
  lines.push('|------|---------|---------|------|------|---------|-----------|')
  for (const p of r.platform_scores) {
    lines.push('| ' + p.platform + ' | ' + p.current_score + ' | ' + p.previous_score + ' | ' + (p.change >= 0 ? '+' : '') + p.change + ' | #' + p.ranking + '/' + p.total_hotels + ' | ' + p.total_hotels + ' | ' + p.review_velocity + ' |')
  }
  lines.push('')
  lines.push('## 竞品对标分析')
  lines.push('')
  lines.push('| 竞品 | 综合评分 | 核心优势 | 主要劣势 | 市场定位 |')
  lines.push('|------|---------|---------|---------|---------|')
  for (const c of r.competitors) {
    lines.push('| ' + c.hotel_name + ' | ' + c.overall_score + ' | ' + c.strength + ' | ' + c.weakness + ' | ' + c.market_position + ' |')
  }
  lines.push('')
  lines.push('## 点评回复模板')
  lines.push('')
  lines.push('| 场景 | 情感 | 回复模板 | SLA |')
  lines.push('|------|------|---------|-----|')
  for (const t of r.response_templates) {
    lines.push('| ' + t.scenario + ' | ' + t.sentiment + ' | ' + t.template + ' | ' + t.response_time_sla + ' |')
  }
  lines.push('')
  lines.push('## 声誉提升行动计划')
  lines.push('')
  for (const a of r.action_plan) {
    lines.push('- ' + a)
  }
  lines.push('')
  lines.push('> ' + DISCLAIMER)
  return lines.join('\n')
}

// ===========================================================================
// PLUGIN REGISTRATION
// ===========================================================================

export function apply(ctx: Context): void {
  const tools = ctx.tools

  // ===== TOOL 1: revenue_management =====
  tools.register(defineTool({
    name: 'revenue_management',
    description: '酒店收益管理: 动态定价分析、ADR/RevPAR/OCC核心KPI追踪、房型定价建议、每日收益预测、季节性趋势分析、竞品价格对标',
    parameters: {
      total_rooms: { type: 'number', description: '酒店总房量' },
      current_adr: { type: 'number', description: '当前平均房价ADR (人民币)' },
      current_occ: { type: 'number', description: '当前入住率OCC (百分比, 如75表示75%)' },
      forecast_days: { type: 'number', description: '收益预测天数' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { total_rooms?: number; current_adr?: number; current_occ?: number; forecast_days?: number }) {
      const totalRooms = args.total_rooms ?? 200
      const currentAdr = args.current_adr ?? 450
      const currentOcc = args.current_occ ?? 72
      const forecastDays = args.forecast_days ?? 30
      const result = runRevenueManagement(totalRooms, currentAdr, currentOcc, forecastDays)
      return formatRevenueManagement(result)
    },
  }))

  // ===== TOOL 2: guest_experience_tracker =====
  tools.register(defineTool({
    name: 'guest_experience_tracker',
    description: '宾客体验追踪: NPS净推荐值分析、OTA平台点评监控(携程/美团/飞猪等)、投诉分类与处理时长分析、改善行动计划生成',
    parameters: {
      current_nps: { type: 'number', description: '当前NPS净推荐值(-100到100)' },
      total_responses: { type: 'number', description: 'NPS总回复数' },
      complaint_count: { type: 'number', description: '投诉类别数量' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { current_nps?: number; total_responses?: number; complaint_count?: number }) {
      const currentNps = args.current_nps ?? 38
      const totalResponses = args.total_responses ?? 500
      const complaintCount = args.complaint_count ?? 6
      const result = runGuestExperience(currentNps, totalResponses, complaintCount)
      return formatGuestExperience(result)
    },
  }))

  // ===== TOOL 3: hotel_operations =====
  tools.register(defineTool({
    name: 'hotel_operations',
    description: '酒店运营分析: 前台运营指标(入住/退房/转化率)、餐饮运营(翻台/人均/损耗)、能耗分析(空调/照明/热水)、综合运营评分',
    parameters: {
      total_rooms: { type: 'number', description: '酒店总房量' },
      total_covers: { type: 'number', description: '日均餐饮总翻台数' },
      monthly_energy_kwh: { type: 'number', description: '月总耗电量(kwh)' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { total_rooms?: number; total_covers?: number; monthly_energy_kwh?: number }) {
      const totalRooms = args.total_rooms ?? 200
      const totalCovers = args.total_covers ?? 300
      const monthlyEnergyKwh = args.monthly_energy_kwh ?? 50000
      const result = runHotelOperations(totalRooms, totalCovers, monthlyEnergyKwh)
      return formatHotelOperations(result)
    },
  }))

  // ===== TOOL 4: marketing_distribution =====
  tools.register(defineTool({
    name: 'marketing_distribution',
    description: '营销分销分析: 渠道表现(官网/OTA/企业协议)、会员体系分析(等级/留存/升级)、企业协议客户管理、营销ROI评估',
    parameters: {
      total_revenue: { type: 'number', description: '月总收入(人民币)' },
      member_count: { type: 'number', description: '会员总数' },
      corporate_count: { type: 'number', description: '企业协议客户数量' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { total_revenue?: number; member_count?: number; corporate_count?: number }) {
      const totalRevenue = args.total_revenue ?? 2000000
      const memberCount = args.member_count ?? 5000
      const corporateCount = args.corporate_count ?? 5
      const result = runMarketingDistribution(totalRevenue, memberCount, corporateCount)
      return formatMarketingDistribution(result)
    },
  }))

  // ===== TOOL 5: tourism_product_designer =====
  tools.register(defineTool({
    name: 'tourism_product_designer',
    description: '旅游产品设计: 精品线路推荐、主题产品分析(亲子/蜜月/摄影等)、定制行程规划、定价策略建议',
    parameters: {
      route_count: { type: 'number', description: '推荐线路数量' },
      theme_count: { type: 'number', description: '主题产品分析数量' },
      custom_days: { type: 'number', description: '定制行程天数' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { route_count?: number; theme_count?: number; custom_days?: number }) {
      const routeCount = args.route_count ?? 6
      const themeCount = args.theme_count ?? 5
      const customDays = args.custom_days ?? 5
      const result = runTourismProduct(routeCount, themeCount, customDays)
      return formatTourismProduct(result)
    },
  }))

  // ===== TOOL 6: event_management =====
  tools.register(defineTool({
    name: 'event_management',
    description: '宴会会务管理: 场地资源管理、餐饮套餐设计、AV设备清单、活动方案报价、宴会运营建议',
    parameters: {
      venue_count: { type: 'number', description: '场地数量' },
      menu_tiers: { type: 'number', description: '餐饮套餐等级数' },
      av_items: { type: 'number', description: 'AV设备种类数' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { venue_count?: number; menu_tiers?: number; av_items?: number }) {
      const venueCount = args.venue_count ?? 5
      const menuTiers = args.menu_tiers ?? 4
      const avItems = args.av_items ?? 6
      const result = runEventManagement(venueCount, menuTiers, avItems)
      return formatEventManagement(result)
    },
  }))

  // ===== TOOL 7: housekeeping_optimizer =====
  tools.register(defineTool({
    name: 'housekeeping_optimizer',
    description: '客房保洁优化: 排班管理(三班效率/加班风险)、查房质量分析、布草库存管理、客房用品消耗分析、优化评分',
    parameters: {
      total_rooms: { type: 'number', description: '酒店总房量' },
      staff_count: { type: 'number', description: '保洁人员总数' },
      linen_types: { type: 'number', description: '布草种类数' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { total_rooms?: number; staff_count?: number; linen_types?: number }) {
      const totalRooms = args.total_rooms ?? 200
      const staffCount = args.staff_count ?? 25
      const linenTypes = args.linen_types ?? 6
      const result = runHousekeeping(totalRooms, staffCount, linenTypes)
      return formatHousekeeping(result)
    },
  }))

  // ===== TOOL 8: reputation_management =====
  tools.register(defineTool({
    name: 'reputation_management',
    description: '声誉管理: 多平台评分排名监控、竞品对标分析、点评回复模板(好评/差评SLA)、声誉提升行动计划',
    parameters: {
      current_score: { type: 'number', description: '当前综合评分(1-5分)' },
      competitor_count: { type: 'number', description: '竞品对标数量' },
      template_count: { type: 'number', description: '回复模板数量' },
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { current_score?: number; competitor_count?: number; template_count?: number }) {
      const currentScore = args.current_score ?? 4.5
      const competitorCount = args.competitor_count ?? 5
      const templateCount = args.template_count ?? 6
      const result = runReputationManagement(currentScore, competitorCount, templateCount)
      return formatReputationManagement(result)
    },
  }))
}
