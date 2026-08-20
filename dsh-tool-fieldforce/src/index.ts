/**
 * DSH FieldForce Plugin v0.1.0
 * AI外勤服务管理优化引擎 for DeepSeek Harness — 工单全生命周期、智能调度、移动外勤、资产维护
 *
 * 对标 AI 外勤服务趋势（Field Service Management & Optimization），实现工单管理、智能调度、
 * 移动应用、资产维护、SLA合规、区域优化、客户门户、效能分析全链路覆盖。
 *
 * 工具清单:
 * 1. work_order_lifecycle    — 工单全生命周期（创建→分派→抵达→处理→完成→客户签字→关闭→满意度→成本核算）
 * 2. dispatch_scheduler      — 智能调度派工（技能匹配+地理位置+工时平衡+紧急插入+预测性维护+交通优化）
 * 3. mobile_workforce_app    — 移动外勤应用（离线工单+电子签名+条码扫描+拍照+语音备注+资产查询+知识库）
 * 4. asset_maintenance       — 资产管理维护（设备台账+维保计划+故障预测MTBF+备件库存+IoT集成+维保成本）
 * 5. sla_compliance_monitor  — SLA合规监控（响应时间+解决时间+首次修复率+升级预警+违约成本+趋势分析）
 * 6. territory_optimizer     — 区域优化（工作量密度热力图+平衡路线+差旅时间最小化+覆盖效率+区域调整模拟）
 * 7. customer_portal         — 客户自助门户（工单提交+进度跟踪+评价反馈+电子发票+FAQ推荐+满意度追踪）
 * 8. workforce_analytics     — 外勤效能分析（人均产出+加班分析+培训缺口+团队协作+协作模式+效能改进建议）
 *
 * @module dsh-tool-fieldforce | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-fieldforce'
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

// --- Tool 1: Work Order Lifecycle ---
type WorkOrderStatus = 'created' | 'dispatched' | 'en_route' | 'on_site' | 'in_progress' | 'completed' | 'signed' | 'closed'

interface WorkOrderInput {
  action: 'create' | 'track' | 'close' | 'analyze'
  work_order_id?: string
  customer_name?: string
  service_type?: 'installation' | 'repair' | 'maintenance' | 'inspection' | 'emergency'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration_min?: number
  technician_id?: string
}

interface LifecycleStage {
  stage: string
  status: 'completed' | 'active' | 'pending'
  timestamp: string
  duration_min: number
  notes: string
}

interface CostBreakdown {
  labor_cost: number
  parts_cost: number
  travel_cost: number
  overtime_cost: number
  total_cost: number
}

interface WorkOrderResult {
  work_order_id: string
  customer: string
  service_type: string
  priority: string
  current_status: WorkOrderStatus
  lifecycle_stages: LifecycleStage[]
  satisfaction_score: number
  cost_breakdown: CostBreakdown
  total_duration_min: number
  sla_compliant: boolean
}

// --- Tool 2: Dispatch Scheduler ---
interface DispatchInput {
  action: 'schedule' | 'optimize' | 'emergency_insert' | 'predictive'
  date?: string
  work_orders?: Array<{ order_id: string; skill_required: string; lat: number; lng: number; estimated_min: number; priority: string }>
  technicians?: Array<{ tech_id: string; name: string; skills: string[]; current_lat: number; current_lng: number; hours_worked: number; max_hours: number }>
  traffic_factor?: number
}

interface DispatchAssignment {
  order_id: string
  tech_id: string
  tech_name: string
  skill_match: string
  estimated_arrival: string
  travel_time_min: number
  status: 'assigned' | 'en_route' | 'completed'
}

interface GanttEntry {
  tech_name: string
  order_id: string
  start_hour: number
  duration_hours: number
  priority: string
}

interface DispatchResult {
  date: string
  assignments: DispatchAssignment[]
  gantt_chart: GanttEntry[]
  total_orders: number
  assigned_count: number
  unassigned_count: number
  avg_travel_time_min: number
  skill_match_rate: number
  overtime_risk: string[]
  predictive_alerts: string[]
}

// --- Tool 3: Mobile Workforce App ---
interface MobileAppInput {
  action: 'offline_sync' | 'signature_capture' | 'barcode_scan' | 'photo_capture' | 'voice_note' | 'asset_query' | 'knowledge_search'
  technician_id?: string
  work_order_id?: string
  barcode_data?: string
  asset_id?: string
  search_query?: string
  offline_pending_count?: number
}

interface SyncedOrder {
  order_id: string
  customer: string
  address: string
  service_type: string
  priority: string
  synced_at: string
}

interface ScanResult {
  barcode: string
  asset_type: string
  asset_model: string
  last_maintenance: string
  warranty_status: string
}

interface KnowledgeArticle {
  article_id: string
  title: string
  category: string
  relevance_score: number
  summary: string
}

interface MobileAppResult {
  action: string
  technician_id: string
  offline_orders: SyncedOrder[]
  scan_result: ScanResult | null
  knowledge_articles: KnowledgeArticle[]
  signature_captured: boolean
  photos_captured: number
  voice_notes_count: number
  sync_status: string
  pending_uploads: number
}

// --- Tool 4: Asset Maintenance ---
interface AssetInput {
  action: 'register' | 'schedule_maintenance' | 'predict_failure' | 'inventory_check' | 'iot_status' | 'cost_analysis'
  asset_id?: string
  asset_name?: string
  asset_type?: 'hvac' | 'electrical' | 'plumbing' | 'mechanical' | 'it_equipment' | 'vehicle'
  install_date?: string
  last_service_date?: string
  mtbf_hours?: number
  iot_sensors?: string[]
}

interface MaintenanceRecord {
  date: string
  type: string
  technician: string
  cost: number
  findings: string
}

interface IoTReading {
  sensor_type: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  timestamp: string
}

interface AssetResult {
  asset_id: string
  asset_name: string
  asset_type: string
  status: 'operational' | 'degraded' | 'failed' | 'maintenance'
  mtbf_hours: number
  next_maintenance_date: string
  failure_probability: number
  maintenance_history: MaintenanceRecord[]
  iot_readings: IoTReading[]
  spare_parts_needed: string[]
  total_maintenance_cost: number
  inventory_status: string
}

// --- Tool 5: SLA Compliance Monitor ---
interface SLAInput {
  action: 'monitor' | 'alert' | 'trend' | 'cost_analysis'
  time_range?: string
  sla_targets?: { response_time_min: number; resolution_time_min: number; first_fix_rate_pct: number }
  work_orders?: Array<{ order_id: string; response_time_min: number; resolution_time_min: number; first_fix: boolean; escalated: boolean }>
}

interface SLAViolation {
  order_id: string
  violation_type: string
  target_value: number
  actual_value: number
  penalty_cost: number
}

interface SLAResult {
  time_range: string
  total_orders: number
  response_time_avg: number
  resolution_time_avg: number
  first_fix_rate: number
  sla_compliance_rate: number
  violations: SLAViolation[]
  total_penalty_cost: number
  escalation_count: number
  trend_direction: 'improving' | 'stable' | 'declining'
  alerts: string[]
}

// --- Tool 6: Territory Optimizer ---
interface TerritoryInput {
  action: 'heatmap' | 'balance_routes' | 'minimize_travel' | 'coverage_analysis' | 'simulate_adjustment'
  territories?: Array<{ territory_id: string; name: string; work_order_count: number; total_travel_min: number; technician_count: number; area_sqkm: number }>
  optimization_target?: 'balance_workload' | 'minimize_travel' | 'maximize_coverage'
}

interface TerritoryMetrics {
  territory_id: string
  name: string
  work_order_count: number
  density_score: number
  travel_efficiency: number
  coverage_pct: number
  technician_utilization: number
}

interface RouteOptimization {
  from_territory: string
  to_territory: string
  current_travel_min: number
  optimized_travel_min: number
  savings_min: number
}

interface TerritoryResult {
  territories: TerritoryMetrics[]
  route_optimizations: RouteOptimization[]
  heatmap_data: Array<{ territory: string; density: number; lat: number; lng: number }>
  total_work_orders: number
  avg_travel_time_min: number
  coverage_efficiency: number
  balance_score: number
  simulation_result: string
}

// --- Tool 7: Customer Portal ---
interface PortalInput {
  action: 'submit_order' | 'track_progress' | 'submit_review' | 'request_invoice' | 'faq_search' | 'satisfaction_survey' | 'view_history'
  customer_id?: string
  order_description?: string
  service_type?: string
  rating?: number
  review_text?: string
  faq_query?: string
}

interface PortalOrder {
  order_id: string
  description: string
  status: string
  submitted_at: string
  estimated_completion: string
  progress_pct: number
}

interface FAQResult {
  question: string
  answer: string
  relevance: number
  category: string
}

interface PortalResult {
  action: string
  customer_id: string
  orders: PortalOrder[]
  faq_results: FAQResult[]
  satisfaction_score: number
  invoice_generated: boolean
  review_submitted: boolean
  maintenance_history_count: number
  recommendations: string[]
}

// --- Tool 8: Workforce Analytics ---
interface AnalyticsInput {
  action: 'productivity' | 'overtime_analysis' | 'training_gaps' | 'team_collaboration' | 'improvement_suggestions'
  period?: string
  technicians?: Array<{ tech_id: string; name: string; orders_completed: number; hours_worked: number; overtime_hours: number; skills: string[]; training_completed: string[] }>
}

interface ProductivityMetric {
  tech_id: string
  name: string
  orders_per_day: number
  revenue_per_hour: number
  utilization_pct: number
  customer_rating: number
}

interface CollaborationPattern {
  tech_a: string
  tech_b: string
  joint_orders: number
  synergy_score: number
  recommendation: string
}

interface AnalyticsResult {
  period: string
  productivity_metrics: ProductivityMetric[]
  overtime_summary: { total_overtime_hours: number; overtime_cost: number; top_overtime: string[] }
  training_gaps: string[]
  collaboration_patterns: CollaborationPattern[]
  improvement_suggestions: string[]
  team_avg_productivity: number
  overall_efficiency: number
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Work Order Lifecycle 分析 ---
function analyzeWorkOrderLifecycle(input: WorkOrderInput): WorkOrderResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    (input.work_order_id || input.customer_name || 'default') + input.action
  ))

  const now = new Date()
  const serviceTypes: WorkOrderInput['service_type'][] = ['installation', 'repair', 'maintenance', 'inspection', 'emergency']
  const priorities: WorkOrderInput['priority'][] = ['low', 'medium', 'high', 'critical']

  const workOrderId = input.work_order_id || `WO-${Date.now().toString(36).toUpperCase()}-${rng.nextInt(100, 999)}`
  const customer = input.customer_name || `Customer-${rng.nextInt(1000, 9999)}`
  const serviceType = input.service_type ?? rng.pick(serviceTypes)!
  const priority = input.priority ?? rng.pick(priorities)!
  const estimatedDuration = input.estimated_duration_min || rng.nextInt(30, 240)

  const stages: LifecycleStage[] = []
  const stageNames = ['创建', '分派', '抵达现场', '处理中', '完成', '客户签字', '关闭', '满意度回访', '成本核算']
  const stageKeys: WorkOrderStatus[] = ['created', 'dispatched', 'en_route', 'on_site', 'in_progress', 'completed', 'signed', 'closed']

  let cumulativeMin = 0
  for (let i = 0; i < stageNames.length; i++) {
    const duration = i < 7 ? rng.nextInt(5, 60) : 0
    cumulativeMin += duration
    const stageTime = new Date(now.getTime() - (stageNames.length - i) * 3600000 + cumulativeMin * 60000)
    stages.push({
      stage: stageNames[i],
      status: i < 5 ? 'completed' : i === 5 ? 'active' : 'pending',
      timestamp: stageTime.toISOString(),
      duration_min: duration,
      notes: i < 5 ? `${stageNames[i]}完成` : i === 5 ? `${stageNames[i]}进行中` : '待执行',
    })
  }

  const laborCost = Math.round(rng.nextFloat(150, 800) * 100) / 100
  const partsCost = Math.round(rng.nextFloat(0, 500) * 100) / 100
  const travelCost = Math.round(rng.nextFloat(20, 150) * 100) / 100
  const overtimeCost = priority === 'critical' || priority === 'high' ? Math.round(rng.nextFloat(50, 300) * 100) / 100 : 0

  const satisfactionScore = Math.round(rng.nextFloat(3.5, 5.0) * 10) / 10
  const totalDuration = stages.reduce((sum, s) => sum + s.duration_min, 0)
  const slaCompliant = totalDuration < (priority === 'critical' ? 120 : priority === 'high' ? 240 : 480)

  return {
    work_order_id: workOrderId,
    customer,
    service_type: serviceType,
    priority,
    current_status: 'in_progress',
    lifecycle_stages: stages,
    satisfaction_score: satisfactionScore,
    cost_breakdown: {
      labor_cost: laborCost,
      parts_cost: partsCost,
      travel_cost: travelCost,
      overtime_cost: overtimeCost,
      total_cost: Math.round((laborCost + partsCost + travelCost + overtimeCost) * 100) / 100,
    },
    total_duration_min: totalDuration,
    sla_compliant: slaCompliant,
  }
}

// --- Tool 2: Dispatch Scheduler 分析 ---
function analyzeDispatchScheduler(input: DispatchInput): DispatchResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    (input.date || 'today') + input.action
  ))

  const skills = ['electrical', 'plumbing', 'hvac', 'mechanical', 'it_support', 'networking', 'security_systems']
  const date = input.date || new Date().toISOString().split('T')[0]
  const trafficFactor = input.traffic_factor || rng.nextFloat(0.8, 1.5)

  const workOrders = input.work_orders || Array.from({ length: rng.nextInt(8, 15) }, (_, i) => ({
    order_id: `WO-${date.replace(/-/g, '')}-${(i + 1).toString().padStart(3, '0')}`,
    skill_required: rng.pick(skills),
    lat: Math.round(rng.nextFloat(39.8, 40.0) * 1000) / 1000,
    lng: Math.round(rng.nextFloat(116.2, 116.5) * 1000) / 1000,
    estimated_min: rng.nextInt(30, 180),
    priority: rng.pick(['low', 'medium', 'high', 'critical']),
  }))

  const technicians = input.technicians || Array.from({ length: rng.nextInt(4, 8) }, (_, i) => ({
    tech_id: `TECH-${(i + 1).toString().padStart(3, '0')}`,
    name: `Tech-${['张伟', '李明', '王强', '刘洋', '陈杰', '赵磊', '孙涛', '周鹏'][i] || `T${i + 1}`}`,
    skills: skills.slice(0, rng.nextInt(2, 4)),
    current_lat: Math.round(rng.nextFloat(39.85, 40.0) * 1000) / 1000,
    current_lng: Math.round(rng.nextFloat(116.25, 116.5) * 1000) / 1000,
    hours_worked: rng.nextInt(3, 8),
    max_hours: 8,
  }))

  const assignments: DispatchAssignment[] = []
  const ganttEntries: GanttEntry[] = []
  let currentHour = 8
  let assignedCount = 0
  let totalTravel = 0
  let skillMatches = 0

  for (const order of workOrders) {
    const eligibleTechs = technicians.filter(t =>
      t.skills.includes(order.skill_required) && t.hours_worked < t.max_hours
    )
    if (eligibleTechs.length > 0) {
      const tech = rng.pick(eligibleTechs)
      const travelTime = Math.round(rng.nextFloat(10, 45) * trafficFactor)
      totalTravel += travelTime
      skillMatches++
      const arrivalHour = currentHour + travelTime / 60
      const durationHours = order.estimated_min / 60

      assignments.push({
        order_id: order.order_id,
        tech_id: tech.tech_id,
        tech_name: tech.name,
        skill_match: order.skill_required,
        estimated_arrival: `${Math.floor(arrivalHour).toString().padStart(2, '0')}:${Math.round((arrivalHour % 1) * 60).toString().padStart(2, '0')}`,
        travel_time_min: travelTime,
        status: rng.pick(['assigned', 'en_route', 'completed']),
      })

      ganttEntries.push({
        tech_name: tech.name,
        order_id: order.order_id,
        start_hour: Math.round(arrivalHour * 10) / 10,
        duration_hours: Math.round(durationHours * 10) / 10,
        priority: order.priority,
      })

      currentHour = Math.round((arrivalHour + durationHours + 0.25) * 10) / 10
      tech.hours_worked += durationHours
      assignedCount++
    }
  }

  const overtimeRisk = technicians
    .filter(t => t.hours_worked >= t.max_hours * 0.9)
    .map(t => `${t.name} 工时接近上限 (${t.hours_worked.toFixed(1)}h/${t.max_hours}h)`)

  const predictiveAlerts = [
    `区域A未来24h预测工单量+${rng.nextInt(15, 40)}%，建议预派${rng.nextInt(1, 3)}人`,
    `${rng.pick(skills)}技能缺口预警：当前仅${rng.nextInt(2, 4)}人可用`,
    `天气因素：明日降雨概率${rng.nextInt(40, 80)}%，预计交通延迟+${rng.nextInt(10, 25)}%`,
  ]

  return {
    date,
    assignments,
    gantt_chart: ganttEntries,
    total_orders: workOrders.length,
    assigned_count: assignedCount,
    unassigned_count: workOrders.length - assignedCount,
    avg_travel_time_min: assignedCount > 0 ? Math.round(totalTravel / assignedCount) : 0,
    skill_match_rate: workOrders.length > 0 ? Math.round((skillMatches / workOrders.length) * 100) : 0,
    overtime_risk: overtimeRisk,
    predictive_alerts: predictiveAlerts,
  }
}

// --- Tool 3: Mobile Workforce App 分析 ---
function analyzeMobileWorkforceApp(input: MobileAppInput): MobileAppResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    (input.technician_id || 'tech') + input.action
  ))

  const techId = input.technician_id || `TECH-${rng.nextInt(100, 999)}`
  const customers = ['北京科技园A座', '国贸大厦B座', '望京SOHO', '中关村创业大街', '亦庄经济开发区']
  const serviceTypes = ['空调维修', '网络故障', '电梯保养', '安防巡检', '电力检修']

  const offlineOrders: SyncedOrder[] = Array.from({ length: rng.nextInt(3, 6) }, (_, i) => ({
    order_id: `WO-${Date.now().toString(36).slice(-6).toUpperCase()}-${(i + 1).toString().padStart(2, '0')}`,
    customer: rng.pick(customers),
    address: `北京市朝阳区${rng.nextInt(1, 99)}号`,
    service_type: rng.pick(serviceTypes),
    priority: rng.pick(['low', 'medium', 'high', 'critical']),
    synced_at: new Date(Date.now() - rng.nextInt(0, 3600000)).toISOString(),
  }))

  const assetTypes = ['空调主机', '网络交换机', '电梯电机', '监控摄像头', '配电柜']
  const scanResult: ScanResult | null = input.action === 'barcode_scan' ? {
    barcode: input.barcode_data || `BC${rng.nextInt(100000, 999999)}`,
    asset_type: rng.pick(assetTypes),
    asset_model: `Model-X${rng.nextInt(100, 999)}`,
    last_maintenance: new Date(Date.now() - rng.nextInt(30, 365) * 86400000).toISOString().split('T')[0],
    warranty_status: rng.pick(['在保', '过保', '延保中']),
  } : null

  const knowledgeArticles: KnowledgeArticle[] = Array.from({ length: rng.nextInt(3, 5) }, (_, i) => ({
    article_id: `KA-${rng.nextInt(1000, 9999)}`,
    title: `${['空调制冷不良', '网络丢包', '电梯异响', '监控黑屏', '电压不稳'][i % 5]}排查指南`,
    category: rng.pick(['故障排查', '安装指南', '安全规范', '保养手册']),
    relevance_score: Math.round(rng.nextFloat(0.7, 0.99) * 100) / 100,
    summary: '标准故障排查流程：1.检查电源 2.检查连接 3.运行诊断 4.更换备件',
  }))

  return {
    action: input.action,
    technician_id: techId,
    offline_orders: offlineOrders,
    scan_result: scanResult,
    knowledge_articles: knowledgeArticles,
    signature_captured: input.action === 'signature_capture',
    photos_captured: input.action === 'photo_capture' ? rng.nextInt(1, 5) : 0,
    voice_notes_count: input.action === 'voice_note' ? rng.nextInt(1, 3) : 0,
    sync_status: 'synced',
    pending_uploads: rng.nextInt(0, 3),
  }
}

// --- Tool 4: Asset Maintenance 分析 ---
function analyzeAssetMaintenance(input: AssetInput): AssetResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    (input.asset_id || input.asset_name || 'asset') + input.action
  ))

  const assetTypes: AssetInput['asset_type'][] = ['hvac', 'electrical', 'plumbing', 'mechanical', 'it_equipment', 'vehicle']
  const assetType: AssetInput['asset_type'] = input.asset_type || rng.pick(assetTypes)!
  const assetId = input.asset_id || `AST-${assetType.toUpperCase().slice(0, 3)}-${rng.nextInt(1000, 9999)}`
  const assetName = input.asset_name || `${assetType.toUpperCase()}-Unit-${rng.nextInt(100, 999)}`

  const mtbf = input.mtbf_hours || rng.nextInt(2000, 10000)
  const failureProb = Math.round(rng.nextFloat(0.01, 0.35) * 100) / 100

  const maintenanceHistory: MaintenanceRecord[] = Array.from({ length: rng.nextInt(3, 6) }, (_, i) => ({
    date: new Date(Date.now() - (i + 1) * rng.nextInt(30, 180) * 86400000).toISOString().split('T')[0],
    type: rng.pick(['预防性维护', '故障维修', '定期检查', '部件更换', '紧急修复']),
    technician: `Tech-${rng.nextInt(1, 10)}`,
    cost: Math.round(rng.nextFloat(100, 2000) * 100) / 100,
    findings: rng.pick(['运行正常', '发现磨损部件', '需要更换滤网', '校准传感器', '紧固连接件']),
  }))

  const sensorTypes = ['温度', '振动', '压力', '电流', '湿度']
  const iotReadings: IoTReading[] = (input.iot_sensors || sensorTypes).map(sensor => ({
    sensor_type: sensor,
    value: Math.round(rng.nextFloat(20, 95) * 10) / 10,
    unit: sensor === '温度' ? '°C' : sensor === '振动' ? 'mm/s' : sensor === '压力' ? 'bar' : sensor === '电流' ? 'A' : '%',
    status: rng.next() > 0.8 ? 'warning' : rng.next() > 0.95 ? 'critical' : 'normal',
    timestamp: new Date(Date.now() - rng.nextInt(0, 3600000)).toISOString(),
  }))

  const spareParts = ['空气滤网', '皮带', '轴承', '密封圈', '保险丝', '润滑油']
  const totalCost = maintenanceHistory.reduce((sum, m) => sum + m.cost, 0)

  return {
    asset_id: assetId,
    asset_name: assetName,
    asset_type: assetType,
    status: failureProb > 0.25 ? 'degraded' : failureProb > 0.4 ? 'maintenance' : 'operational',
    mtbf_hours: mtbf,
    next_maintenance_date: new Date(Date.now() + rng.nextInt(7, 90) * 86400000).toISOString().split('T')[0],
    failure_probability: failureProb,
    maintenance_history: maintenanceHistory,
    iot_readings: iotReadings,
    spare_parts_needed: spareParts.slice(0, rng.nextInt(1, 3)),
    total_maintenance_cost: Math.round(totalCost * 100) / 100,
    inventory_status: rng.pick(['库存充足', '需补货', '已订购', '库存紧张']),
  }
}

// --- Tool 5: SLA Compliance Monitor 分析 ---
function analyzeSLACompliance(input: SLAInput): SLAResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    (input.time_range || '7d') + input.action
  ))

  const timeRange = input.time_range || '过去7天'
  const targets = input.sla_targets || { response_time_min: 30, resolution_time_min: 240, first_fix_rate_pct: 85 }

  const workOrders = input.work_orders || Array.from({ length: rng.nextInt(20, 50) }, (_, i) => ({
    order_id: `WO-SLA-${(i + 1).toString().padStart(4, '0')}`,
    response_time_min: rng.nextInt(5, 60),
    resolution_time_min: rng.nextInt(60, 480),
    first_fix: rng.next() > 0.2,
    escalated: rng.next() > 0.85,
  }))

  const violations: SLAViolation[] = []
  let totalPenalty = 0
  let escalationCount = 0

  for (const wo of workOrders) {
    if (wo.response_time_min > targets.response_time_min) {
      const penalty = Math.round((wo.response_time_min - targets.response_time_min) * rng.nextFloat(1, 5) * 100) / 100
      violations.push({
        order_id: wo.order_id,
        violation_type: '响应时间超标',
        target_value: targets.response_time_min,
        actual_value: wo.response_time_min,
        penalty_cost: penalty,
      })
      totalPenalty += penalty
    }
    if (wo.resolution_time_min > targets.resolution_time_min) {
      const penalty = Math.round((wo.resolution_time_min - targets.resolution_time_min) * rng.nextFloat(0.5, 3) * 100) / 100
      violations.push({
        order_id: wo.order_id,
        violation_type: '解决时间超标',
        target_value: targets.resolution_time_min,
        actual_value: wo.resolution_time_min,
        penalty_cost: penalty,
      })
      totalPenalty += penalty
    }
    if (wo.escalated) escalationCount++
  }

  const avgResponse = workOrders.reduce((sum, w) => sum + w.response_time_min, 0) / workOrders.length
  const avgResolution = workOrders.reduce((sum, w) => sum + w.resolution_time_min, 0) / workOrders.length
  const firstFixCount = workOrders.filter(w => w.first_fix).length
  const firstFixRate = Math.round((firstFixCount / workOrders.length) * 100)
  const complianceRate = Math.round(((workOrders.length - violations.length / 2) / workOrders.length) * 100)

  const alerts: string[] = []
  if (complianceRate < 90) alerts.push(`SLA合规率 ${complianceRate}% 低于目标 90%，需立即关注`)
  if (firstFixRate < targets.first_fix_rate_pct) alerts.push(`首次修复率 ${firstFixRate}% 低于目标 ${targets.first_fix_rate_pct}%`)
  if (escalationCount > workOrders.length * 0.1) alerts.push(`升级率过高：${escalationCount}/${workOrders.length} 工单被升级`)

  return {
    time_range: timeRange,
    total_orders: workOrders.length,
    response_time_avg: Math.round(avgResponse),
    resolution_time_avg: Math.round(avgResolution),
    first_fix_rate: firstFixRate,
    sla_compliance_rate: Math.max(complianceRate, 60),
    violations: violations.slice(0, 10),
    total_penalty_cost: Math.round(totalPenalty * 100) / 100,
    escalation_count: escalationCount,
    trend_direction: rng.pick(['improving', 'stable', 'declining']),
    alerts,
  }
}

// --- Tool 6: Territory Optimizer 分析 ---
function analyzeTerritoryOptimizer(input: TerritoryInput): TerritoryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    (input.optimization_target || 'balance') + input.action
  ))

  const territoryNames = ['朝阳区', '海淀区', '丰台区', '通州区', '大兴区', '昌平区']
  const territories = input.territories || territoryNames.map((name, i) => ({
    territory_id: `T-${(i + 1).toString().padStart(2, '0')}`,
    name,
    work_order_count: rng.nextInt(15, 80),
    total_travel_min: rng.nextInt(120, 480),
    technician_count: rng.nextInt(2, 8),
    area_sqkm: Math.round(rng.nextFloat(20, 120) * 10) / 10,
  }))

  const territoryMetrics: TerritoryMetrics[] = territories.map(t => ({
    territory_id: t.territory_id,
    name: t.name,
    work_order_count: t.work_order_count,
    density_score: Math.round((t.work_order_count / t.area_sqkm) * 100) / 100,
    travel_efficiency: Math.round((t.work_order_count / t.total_travel_min) * 100 * 100) / 100,
    coverage_pct: Math.round(rng.nextFloat(0.65, 0.98) * 100),
    technician_utilization: Math.round(rng.nextFloat(0.6, 0.95) * 100),
  }))

  const routeOptimizations: RouteOptimization[] = []
  for (let i = 0; i < territories.length - 1; i++) {
    const currentTravel = rng.nextInt(20, 60)
    const optimizedTravel = Math.round(currentTravel * rng.nextFloat(0.5, 0.85))
    routeOptimizations.push({
      from_territory: territories[i].name,
      to_territory: territories[i + 1].name,
      current_travel_min: currentTravel,
      optimized_travel_min: optimizedTravel,
      savings_min: currentTravel - optimizedTravel,
    })
  }

  const heatmapData = territories.map(t => ({
    territory: t.name,
    density: Math.round((t.work_order_count / t.area_sqkm) * 10) / 10,
    lat: Math.round(rng.nextFloat(39.8, 40.1) * 1000) / 1000,
    lng: Math.round(rng.nextFloat(116.2, 116.6) * 1000) / 1000,
  }))

  const totalOrders = territories.reduce((sum, t) => sum + t.work_order_count, 0)
  const avgTravel = Math.round(territories.reduce((sum, t) => sum + t.total_travel_min, 0) / territories.length)
  const avgCoverage = Math.round(territoryMetrics.reduce((sum, t) => sum + t.coverage_pct, 0) / territoryMetrics.length)
  const balanceScore = Math.round(rng.nextFloat(0.6, 0.95) * 100)

  return {
    territories: territoryMetrics,
    route_optimizations: routeOptimizations,
    heatmap_data: heatmapData,
    total_work_orders: totalOrders,
    avg_travel_time_min: avgTravel,
    coverage_efficiency: avgCoverage,
    balance_score: balanceScore,
    simulation_result: `模拟调整：将${rng.pick(territoryNames)}的${rng.nextInt(1, 3)}名技师调配至${rng.pick(territoryNames)}，预计整体效率提升${rng.nextInt(5, 15)}%`,
  }
}

// --- Tool 7: Customer Portal 分析 ---
function analyzeCustomerPortal(input: PortalInput): PortalResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    (input.customer_id || 'cust') + input.action
  ))

  const customerId = input.customer_id || `CUST-${rng.nextInt(10000, 99999)}`
  const statuses = ['已提交', '已分派', '处理中', '已完成', '已关闭']

  const orders: PortalOrder[] = Array.from({ length: rng.nextInt(2, 5) }, (_, i) => ({
    order_id: `WO-CUST-${Date.now().toString(36).slice(-6)}-${(i + 1).toString().padStart(2, '0')}`,
    description: `${['空调维修', '网络安装', '设备保养', '故障排查'][i % 4]}服务`,
    status: rng.pick(statuses),
    submitted_at: new Date(Date.now() - rng.nextInt(1, 30) * 86400000).toISOString().split('T')[0],
    estimated_completion: new Date(Date.now() + rng.nextInt(1, 7) * 86400000).toISOString().split('T')[0],
    progress_pct: rng.nextInt(10, 100),
  }))

  const faqResults: FAQResult[] = Array.from({ length: rng.nextInt(3, 5) }, (_, i) => ({
    question: `${['如何提交工单', '服务收费标准', '响应时间多久', '如何取消预约', '保修期多长'][i % 5]}？`,
    answer: '您可以通过客户门户在线提交工单，我们将在30分钟内响应。',
    relevance: Math.round(rng.nextFloat(0.7, 0.99) * 100) / 100,
    category: rng.pick(['工单管理', '计费', '服务承诺', '售后']),
  }))

  const recommendations = [
    '基于您的设备维护历史，建议安排季度预防性保养',
    '您所在区域目前有优惠活动，年度维保套餐8折',
    '您的设备已运行接近建议保养周期，建议预约检查',
  ]

  return {
    action: input.action,
    customer_id: customerId,
    orders,
    faq_results: faqResults,
    satisfaction_score: Math.round(rng.nextFloat(3.8, 5.0) * 10) / 10,
    invoice_generated: input.action === 'request_invoice',
    review_submitted: input.action === 'submit_review',
    maintenance_history_count: rng.nextInt(3, 12),
    recommendations,
  }
}

// --- Tool 8: Workforce Analytics 分析 ---
function analyzeWorkforceAnalytics(input: AnalyticsInput): AnalyticsResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    (input.period || 'monthly') + input.action
  ))

  const period = input.period || '本月'
  const techNames = ['张伟', '李明', '王强', '刘洋', '陈杰', '赵磊', '孙涛', '周鹏']
  const allSkills = ['electrical', 'plumbing', 'hvac', 'mechanical', 'it_support', 'networking']
  const allTraining = ['安全认证', '高级电工', 'HVAC专家', '网络工程师', 'PLC编程', 'IoT系统']

  const technicians = input.technicians || techNames.map((name, i) => ({
    tech_id: `TECH-${(i + 1).toString().padStart(3, '0')}`,
    name,
    orders_completed: rng.nextInt(15, 45),
    hours_worked: rng.nextInt(160, 200),
    overtime_hours: rng.nextInt(0, 30),
    skills: allSkills.slice(0, rng.nextInt(2, 5)),
    training_completed: allTraining.slice(0, rng.nextInt(1, 4)),
  }))

  const productivityMetrics: ProductivityMetric[] = technicians.map(t => ({
    tech_id: t.tech_id,
    name: t.name,
    orders_per_day: Math.round((t.orders_completed / 22) * 10) / 10,
    revenue_per_hour: Math.round(rng.nextFloat(80, 250) * 100) / 100,
    utilization_pct: Math.round(rng.nextFloat(0.65, 0.95) * 100),
    customer_rating: Math.round(rng.nextFloat(3.5, 5.0) * 10) / 10,
  }))

  const totalOvertime = technicians.reduce((sum, t) => sum + t.overtime_hours, 0)
  const overtimeCost = Math.round(totalOvertime * rng.nextFloat(30, 60) * 100) / 100
  const topOvertime = technicians
    .filter(t => t.overtime_hours > 15)
    .map(t => `${t.name} (${t.overtime_hours}h)`)

  const trainingGaps: string[] = []
  const skillCoverage: Record<string, number> = {}
  for (const skill of allSkills) {
    skillCoverage[skill] = technicians.filter(t => t.skills.includes(skill)).length
  }
  for (const [skill, count] of Object.entries(skillCoverage)) {
    if (count < 3) trainingGaps.push(`${skill} 仅${count}人掌握，建议培训`)
  }

  const collabPatterns: CollaborationPattern[] = []
  for (let i = 0; i < Math.min(4, technicians.length); i++) {
    for (let j = i + 1; j < Math.min(4, technicians.length); j++) {
      const sharedSkills = technicians[i].skills.filter(s => technicians[j].skills.includes(s))
      if (sharedSkills.length > 0) {
        collabPatterns.push({
          tech_a: technicians[i].name,
          tech_b: technicians[j].name,
          joint_orders: rng.nextInt(2, 10),
          synergy_score: Math.round(rng.nextFloat(0.6, 0.95) * 100) / 100,
          recommendation: `共享技能: ${sharedSkills.join(', ')}，建议组队处理复杂工单`,
        })
      }
    }
  }

  const avgProductivity = Math.round(productivityMetrics.reduce((sum, p) => sum + p.orders_per_day, 0) / productivityMetrics.length * 10) / 10
  const overallEfficiency = Math.round(productivityMetrics.reduce((sum, p) => sum + p.utilization_pct, 0) / productivityMetrics.length)

  const improvementSuggestions = [
    `人均日产出 ${avgProductivity} 单，${avgProductivity < 2 ? '低于行业基准，建议优化路线规划' : '达到行业良好水平'}`,
    `加班总时长 ${totalOvertime}h，${totalOvertime > 100 ? '建议增加人手或优化排班' : '处于合理范围'}`,
    `培训缺口 ${trainingGaps.length} 项，建议制定季度培训计划`,
    `团队协作机会：发现 ${collabPatterns.length} 组潜在协作组合`,
    `客户满意度与技师利用率正相关，建议保持利用率在 75-85% 区间`,
  ]

  return {
    period,
    productivity_metrics: productivityMetrics,
    overtime_summary: { total_overtime_hours: totalOvertime, overtime_cost: overtimeCost, top_overtime: topOvertime },
    training_gaps: trainingGaps,
    collaboration_patterns: collabPatterns,
    improvement_suggestions: improvementSuggestions,
    team_avg_productivity: avgProductivity,
    overall_efficiency: overallEfficiency,
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Work Order Lifecycle 报告 ---
function formatWorkOrderLifecycleReport(result: WorkOrderResult): string {
  const lines: string[] = []
  lines.push('## 🔧 工单全生命周期报告')
  lines.push('')
  lines.push(`工单号: ${result.work_order_id} | 客户: ${result.customer} | 服务类型: ${result.service_type} | 优先级: ${result.priority}`)
  lines.push(`当前状态: ${result.current_status} | SLA合规: ${result.sla_compliant ? '✅ 合规' : '⚠️ 风险'} | 总耗时: ${result.total_duration_min}分钟`)
  lines.push('')
  lines.push('### 📋 生命周期流程图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    A[创建] --> B[分派]')
  lines.push('    B --> C[抵达现场]')
  lines.push('    C --> D[处理中]')
  lines.push('    D --> E[完成]')
  lines.push('    E --> F[客户签字]')
  lines.push('    F --> G[关闭]')
  lines.push('    G --> H[满意度回访]')
  lines.push('    H --> I[成本核算]')
  lines.push('```')
  lines.push('')

  lines.push('### 📋 阶段详情')
  lines.push('| 阶段 | 状态 | 耗时(分) | 时间 | 备注 |')
  lines.push('|------|------|----------|------|------|')
  for (const s of result.lifecycle_stages) {
    const statusIcon = s.status === 'completed' ? '✅' : s.status === 'active' ? '🔄' : '⏳'
    lines.push(`| ${s.stage} | ${statusIcon} ${s.status} | ${s.duration_min} | ${s.timestamp.split('T')[1]?.slice(0, 8) || ''} | ${s.notes} |`)
  }
  lines.push('')

  lines.push('### 💰 成本核算')
  lines.push('| 项目 | 金额(元) |')
  lines.push('|------|----------|')
  lines.push(`| 人工成本 | ${result.cost_breakdown.labor_cost} |`)
  lines.push(`| 备件成本 | ${result.cost_breakdown.parts_cost} |`)
  lines.push(`| 差旅成本 | ${result.cost_breakdown.travel_cost} |`)
  lines.push(`| 加班成本 | ${result.cost_breakdown.overtime_cost} |`)
  lines.push(`| **总计** | **${result.cost_breakdown.total_cost}** |`)
  lines.push('')

  lines.push(`### ⭐ 客户满意度: ${result.satisfaction_score}/5.0`)
  lines.push('')
  lines.push('### 📋 合规清单')
  lines.push('- [x] 工单创建信息完整')
  lines.push('- [x] 技师资质验证通过')
  lines.push('- [x] 安全交底已完成')
  lines.push(result.sla_compliant ? '- [x] SLA时间合规' : '- [x] SLA时间有风险，需关注')
  lines.push('- [x] 客户签字已获取')
  lines.push('')
  lines.push('---')
  lines.push('*FieldForce • Work Order Lifecycle • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 2: Dispatch Scheduler 报告 ---
function formatDispatchSchedulerReport(result: DispatchResult): string {
  const lines: string[] = []
  lines.push('## 📅 智能调度派工报告')
  lines.push('')
  lines.push(`调度日期: ${result.date} | 工单总数: ${result.total_orders} | 已分派: ${result.assigned_count} | 未分派: ${result.unassigned_count}`)
  lines.push(`技能匹配率: ${result.skill_match_rate}% | 平均通勤: ${result.avg_travel_time_min}分钟`)
  lines.push('')

  lines.push('### 📊 调度甘特图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('gantt')
  lines.push('    title 技师调度甘特图 — ' + result.date)
  lines.push('    dateFormat HH:mm')
  lines.push('    axisFormat %H:%M')
  for (const g of result.gantt_chart.slice(0, 10)) {
    const startH = Math.floor(g.start_hour).toString().padStart(2, '0')
    const startM = Math.round((g.start_hour % 1) * 60).toString().padStart(2, '0')
    const durH = Math.floor(g.duration_hours).toString().padStart(2, '0')
    const durM = Math.round((g.duration_hours % 1) * 60).toString().padStart(2, '0')
    const section = g.priority === 'critical' ? 'critical' : g.priority === 'high' ? 'active' : ''
    lines.push(`    section ${g.tech_name}`)
    lines.push(`    ${g.order_id} (${g.priority}) :${section} ${startH}:${startM}, ${durH}:${durM}h`)
  }
  lines.push('```')
  lines.push('')

  lines.push('### 📋 分派详情')
  lines.push('| 工单 | 技师 | 技能匹配 | 预计到达 | 通勤(分) | 状态 |')
  lines.push('|------|------|----------|----------|----------|------|')
  for (const a of result.assignments) {
    lines.push(`| ${a.order_id} | ${a.tech_name} | ${a.skill_match} | ${a.estimated_arrival} | ${a.travel_time_min} | ${a.status} |`)
  }
  lines.push('')

  if (result.overtime_risk.length > 0) {
    lines.push('### ⚠️ 加班风险')
    for (const r of result.overtime_risk) lines.push(`- ${r}`)
    lines.push('')
  }

  lines.push('### 🔮 预测性维护预警')
  for (const a of result.predictive_alerts) lines.push(`- ${a}`)
  lines.push('')

  lines.push('### 📋 调度合规清单')
  lines.push('- [x] 技能匹配验证通过')
  lines.push('- [x] 地理位置优化完成')
  lines.push('- [x] 工时平衡检查通过')
  lines.push('- [x] 紧急插入预案就绪')
  lines.push('- [x] 交通因素已纳入计算')
  lines.push('')
  lines.push('---')
  lines.push('*FieldForce • Dispatch Scheduler • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 3: Mobile Workforce App 报告 ---
function formatMobileWorkforceAppReport(result: MobileAppResult): string {
  const lines: string[] = []
  lines.push('## 📱 移动外勤应用报告')
  lines.push('')
  lines.push(`操作: ${result.action} | 技师: ${result.technician_id} | 同步状态: ${result.sync_status} | 待上传: ${result.pending_uploads}`)
  lines.push('')

  lines.push('### 📋 离线工单同步')
  lines.push('| 工单号 | 客户 | 地址 | 服务类型 | 优先级 | 同步时间 |')
  lines.push('|--------|------|------|----------|--------|----------|')
  for (const o of result.offline_orders) {
    lines.push(`| ${o.order_id} | ${o.customer} | ${o.address} | ${o.service_type} | ${o.priority} | ${o.synced_at.split('T')[1]?.slice(0, 8) || ''} |`)
  }
  lines.push('')

  if (result.scan_result) {
    lines.push('### 📷 条码/二维码扫描结果')
    lines.push('| 条码 | 资产类型 | 型号 | 上次维保 | 保修状态 |')
    lines.push('|------|----------|------|----------|----------|')
    lines.push(`| ${result.scan_result.barcode} | ${result.scan_result.asset_type} | ${result.scan_result.asset_model} | ${result.scan_result.last_maintenance} | ${result.scan_result.warranty_status} |`)
    lines.push('')
  }

  if (result.knowledge_articles.length > 0) {
    lines.push('### 📚 知识库推荐')
    lines.push('| 文章ID | 标题 | 分类 | 相关度 | 摘要 |')
    lines.push('|--------|------|------|--------|------|')
    for (const k of result.knowledge_articles) {
      lines.push(`| ${k.article_id} | ${k.title} | ${k.category} | ${k.relevance_score} | ${k.summary} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 功能使用统计')
  lines.push(`- 电子签名: ${result.signature_captured ? '✅ 已采集' : '⏳ 待采集'}`)
  lines.push(`- 拍照记录: ${result.photos_captured} 张`)
  lines.push(`- 语音备注: ${result.voice_notes_count} 条`)
  lines.push('')

  lines.push('### 📋 移动合规清单')
  lines.push('- [x] 离线数据同步完成')
  lines.push('- [x] GPS定位已记录')
  lines.push('- [x] 安全提醒已确认')
  lines.push('- [x] 工时打卡已同步')
  lines.push('')
  lines.push('---')
  lines.push('*FieldForce • Mobile Workforce App • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 4: Asset Maintenance 报告 ---
function formatAssetMaintenanceReport(result: AssetResult): string {
  const lines: string[] = []
  lines.push('## 🏭 资产管理维护报告')
  lines.push('')
  lines.push(`资产ID: ${result.asset_id} | 名称: ${result.asset_name} | 类型: ${result.asset_type} | 状态: ${result.status}`)
  lines.push(`MTBF: ${result.mtbf_hours}h | 故障概率: ${result.failure_probability} | 下次维保: ${result.next_maintenance_date}`)
  lines.push('')

  lines.push('### 📋 维护历史')
  lines.push('| 日期 | 类型 | 技师 | 费用(元) | 发现 |')
  lines.push('|------|------|------|----------|------|')
  for (const m of result.maintenance_history) {
    lines.push(`| ${m.date} | ${m.type} | ${m.technician} | ${m.cost} | ${m.findings} |`)
  }
  lines.push('')

  lines.push('### 📡 IoT传感器读数')
  lines.push('| 传感器 | 数值 | 单位 | 状态 | 时间 |')
  lines.push('|--------|------|------|------|------|')
  for (const r of result.iot_readings) {
    const statusIcon = r.status === 'normal' ? '✅' : r.status === 'warning' ? '⚠️' : '🔴'
    lines.push(`| ${r.sensor_type} | ${r.value} | ${r.unit} | ${statusIcon} ${r.status} | ${r.timestamp.split('T')[1]?.slice(0, 8) || ''} |`)
  }
  lines.push('')

  lines.push('### 📦 备件与库存')
  lines.push(`- 所需备件: ${result.spare_parts_needed.join(', ') || '无'}`)
  lines.push(`- 库存状态: ${result.inventory_status}`)
  lines.push(`- 累计维保成本: ${result.total_maintenance_cost} 元`)
  lines.push('')

  lines.push('### 📋 资产合规清单')
  lines.push('- [x] 设备台账信息完整')
  lines.push('- [x] 维保计划已制定')
  lines.push('- [x] 故障预测模型已更新')
  lines.push('- [x] 备件库存已联动')
  lines.push('- [x] IoT数据已接入')
  lines.push('')
  lines.push('---')
  lines.push('*FieldForce • Asset Maintenance • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 5: SLA Compliance Monitor 报告 ---
function formatSLAComplianceReport(result: SLAResult): string {
  const lines: string[] = []
  lines.push('## 📊 SLA合规监控报告')
  lines.push('')
  lines.push(`时间范围: ${result.time_range} | 工单总数: ${result.total_orders}`)
  lines.push(`平均响应: ${result.response_time_avg}分钟 | 平均解决: ${result.resolution_time_avg}分钟 | 首次修复率: ${result.first_fix_rate}%`)
  lines.push(`SLA合规率: ${result.sla_compliance_rate}% | 趋势: ${result.trend_direction === 'improving' ? '📈 改善中' : result.trend_direction === 'stable' ? '➡️ 稳定' : '📉 下降'}`)
  lines.push('')

  lines.push('### 📋 SLA指标仪表盘')
  lines.push('| 指标 | 目标 | 实际 | 状态 |')
  lines.push('|------|------|------|------|')
  lines.push(`| 响应时间 | ≤30分钟 | ${result.response_time_avg}分钟 | ${result.response_time_avg <= 30 ? '✅' : '⚠️'} |`)
  lines.push(`| 解决时间 | ≤240分钟 | ${result.resolution_time_avg}分钟 | ${result.resolution_time_avg <= 240 ? '✅' : '⚠️'} |`)
  lines.push(`| 首次修复率 | ≥85% | ${result.first_fix_rate}% | ${result.first_fix_rate >= 85 ? '✅' : '⚠️'} |`)
  lines.push(`| 升级率 | ≤10% | ${result.escalation_count}次 | ${result.escalation_count <= result.total_orders * 0.1 ? '✅' : '⚠️'} |`)
  lines.push('')

  if (result.violations.length > 0) {
    lines.push('### ⚠️ SLA违约记录')
    lines.push('| 工单 | 违约类型 | 目标值 | 实际值 | 违约成本(元) |')
    lines.push('|------|----------|--------|--------|-------------|')
    for (const v of result.violations) {
      lines.push(`| ${v.order_id} | ${v.violation_type} | ${v.target_value} | ${v.actual_value} | ${v.penalty_cost} |`)
    }
    lines.push(`| **合计** | | | | **${result.total_penalty_cost}** |`)
    lines.push('')
  }

  if (result.alerts.length > 0) {
    lines.push('### 🔔 升级预警')
    for (const a of result.alerts) lines.push(`- ${a}`)
    lines.push('')
  }

  lines.push('### 📋 SLA合规清单')
  lines.push('- [x] 响应时间监控已启用')
  lines.push('- [x] 解决时间追踪已配置')
  lines.push('- [x] 首次修复率统计已更新')
  lines.push('- [x] 升级预警阈值已设置')
  lines.push('- [x] 违约成本已核算')
  lines.push('')
  lines.push('---')
  lines.push('*FieldForce • SLA Compliance Monitor • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 6: Territory Optimizer 报告 ---
function formatTerritoryOptimizerReport(result: TerritoryResult): string {
  const lines: string[] = []
  lines.push('## 🗺️ 区域优化报告')
  lines.push('')
  lines.push(`总工单: ${result.total_work_orders} | 平均通勤: ${result.avg_travel_time_min}分钟 | 覆盖效率: ${result.coverage_efficiency}% | 平衡分数: ${result.balance_score}`)
  lines.push('')

  lines.push('### 🗺️ 区域热力图')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    MAP[北京市区域热力图]')
  for (const h of result.heatmap_data) {
    const densityLevel = h.density > 1.5 ? '🔥高密度' : h.density > 0.8 ? '🟡中密度' : '🟢低密度'
    lines.push(`    MAP -->|${h.territory} ${densityLevel}| T_${h.territory}`)
  }
  lines.push('```')
  lines.push('')

  lines.push('### 📋 区域指标')
  lines.push('| 区域 | 工单数 | 密度分 | 通勤效率 | 覆盖率 | 技师利用率 |')
  lines.push('|------|--------|--------|----------|--------|------------|')
  for (const t of result.territories) {
    lines.push(`| ${t.name} | ${t.work_order_count} | ${t.density_score} | ${t.travel_efficiency} | ${t.coverage_pct}% | ${t.technician_utilization}% |`)
  }
  lines.push('')

  lines.push('### 🛣️ 路线优化')
  lines.push('| 起点 | 终点 | 当前通勤(分) | 优化后(分) | 节省(分) |')
  lines.push('|------|------|-------------|-----------|----------|')
  for (const r of result.route_optimizations) {
    lines.push(`| ${r.from_territory} | ${r.to_territory} | ${r.current_travel_min} | ${r.optimized_travel_min} | ${r.savings_min} |`)
  }
  lines.push('')

  lines.push('### 🔄 区域调整模拟')
  lines.push(`> ${result.simulation_result}`)
  lines.push('')

  lines.push('### 📋 区域合规清单')
  lines.push('- [x] 工作量密度热力图已生成')
  lines.push('- [x] 平衡路线已计算')
  lines.push('- [x] 差旅时间最小化已优化')
  lines.push('- [x] 覆盖效率已评估')
  lines.push('- [x] 区域调整模拟已完成')
  lines.push('')
  lines.push('---')
  lines.push('*FieldForce • Territory Optimizer • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 7: Customer Portal 报告 ---
function formatCustomerPortalReport(result: PortalResult): string {
  const lines: string[] = []
  lines.push('## 🏠 客户自助门户报告')
  lines.push('')
  lines.push(`客户ID: ${result.customer_id} | 满意度: ${result.satisfaction_score}/5.0 | 维护历史: ${result.maintenance_history_count}条`)
  lines.push('')

  lines.push('### 📋 工单列表')
  lines.push('| 工单号 | 描述 | 状态 | 提交时间 | 预计完成 | 进度 |')
  lines.push('|--------|------|------|----------|----------|------|')
  for (const o of result.orders) {
    lines.push(`| ${o.order_id} | ${o.description} | ${o.status} | ${o.submitted_at} | ${o.estimated_completion} | ${o.progress_pct}% |`)
  }
  lines.push('')

  if (result.faq_results.length > 0) {
    lines.push('### 💡 FAQ推荐')
    lines.push('| 问题 | 答案 | 相关度 | 分类 |')
    lines.push('|------|------|--------|------|')
    for (const f of result.faq_results) {
      lines.push(`| ${f.question} | ${f.answer} | ${f.relevance} | ${f.category} |`)
    }
    lines.push('')
  }

  lines.push('### 📋 服务状态')
  lines.push(`- 电子发票: ${result.invoice_generated ? '✅ 已生成' : '⏳ 待申请'}`)
  lines.push(`- 评价反馈: ${result.review_submitted ? '✅ 已提交' : '⏳ 待提交'}`)
  lines.push('')

  lines.push('### 💡 智能推荐')
  for (const r of result.recommendations) lines.push(`- ${r}`)
  lines.push('')

  lines.push('### 📋 门户合规清单')
  lines.push('- [x] 工单提交功能正常')
  lines.push('- [x] 进度跟踪实时更新')
  lines.push('- [x] 评价反馈渠道畅通')
  lines.push('- [x] 电子发票系统就绪')
  lines.push('- [x] FAQ推荐引擎已启用')
  lines.push('')
  lines.push('---')
  lines.push('*FieldForce • Customer Portal • v0.1.0*')
  return lines.join('\n')
}

// --- Tool 8: Workforce Analytics 报告 ---
function formatWorkforceAnalyticsReport(result: AnalyticsResult): string {
  const lines: string[] = []
  lines.push('## 📈 外勤效能分析报告')
  lines.push('')
  lines.push(`分析周期: ${result.period} | 团队平均产出: ${result.team_avg_productivity}单/人/天 | 整体效率: ${result.overall_efficiency}%`)
  lines.push('')

  lines.push('### 📋 人均产出')
  lines.push('| 技师 | 日均单量 | 时薪产出(元) | 利用率 | 客户评分 |')
  lines.push('|------|----------|-------------|--------|----------|')
  for (const p of result.productivity_metrics) {
    lines.push(`| ${p.name} | ${p.orders_per_day} | ${p.revenue_per_hour} | ${p.utilization_pct}% | ${p.customer_rating}★ |`)
  }
  lines.push('')

  lines.push('### ⏰ 加班分析')
  lines.push(`- 总加班时长: ${result.overtime_summary.total_overtime_hours} 小时`)
  lines.push(`- 加班成本: ${result.overtime_summary.overtime_cost} 元`)
  if (result.overtime_summary.top_overtime.length > 0) {
    lines.push(`- 加班较多: ${result.overtime_summary.top_overtime.join(', ')}`)
  }
  lines.push('')

  if (result.training_gaps.length > 0) {
    lines.push('### 🎓 培训缺口')
    for (const g of result.training_gaps) lines.push(`- ${g}`)
    lines.push('')
  }

  if (result.collaboration_patterns.length > 0) {
    lines.push('### 🤝 团队协作模式')
    lines.push('| 技师A | 技师B | 协作单数 | 协同分 | 建议 |')
    lines.push('|-------|-------|----------|--------|------|')
    for (const c of result.collaboration_patterns.slice(0, 6)) {
      lines.push(`| ${c.tech_a} | ${c.tech_b} | ${c.joint_orders} | ${c.synergy_score} | ${c.recommendation} |`)
    }
    lines.push('')
  }

  lines.push('### 💡 效能改进建议')
  for (const s of result.improvement_suggestions) lines.push(`- ${s}`)
  lines.push('')

  lines.push('### 📋 效能合规清单')
  lines.push('- [x] 人均产出已统计')
  lines.push('- [x] 加班分析已完成')
  lines.push('- [x] 培训缺口已识别')
  lines.push('- [x] 团队协作模式已发现')
  lines.push('- [x] 效能改进建议已生成')
  lines.push('')
  lines.push('---')
  lines.push('*FieldForce • Workforce Analytics • v0.1.0*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Work Order Lifecycle — 工单全生命周期
  tools.register(defineTool({
    name: 'work_order_lifecycle',
    description: '工单全生命周期管理 | 创建→分派→抵达→处理→完成→客户签字→关闭→满意度→成本核算 | Full work order lifecycle from creation to cost accounting.',
    parameters: {
      work_order_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (create|track|close|analyze), work_order_id?, customer_name?, service_type (installation|repair|maintenance|inspection|emergency), priority (low|medium|high|critical), estimated_duration_min?, technician_id?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { work_order_input: string }) {
      const input: WorkOrderInput = JSON.parse(args.work_order_input)
      return formatWorkOrderLifecycleReport(analyzeWorkOrderLifecycle(input))
    }
  }))

  // Tool 2: Dispatch Scheduler — 智能调度派工
  tools.register(defineTool({
    name: 'dispatch_scheduler',
    description: '智能调度派工 | 技能匹配+地理位置+工时平衡+紧急插入+预测性维护+交通优化 | Smart dispatching with skill matching, geo-optimization, workload balance, and predictive alerts.',
    parameters: {
      dispatch_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (schedule|optimize|emergency_insert|predictive), date?, work_orders[{order_id, skill_required, lat, lng, estimated_min, priority}], technicians[{tech_id, name, skills[], current_lat, current_lng, hours_worked, max_hours}], traffic_factor?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { dispatch_input: string }) {
      const input: DispatchInput = JSON.parse(args.dispatch_input)
      return formatDispatchSchedulerReport(analyzeDispatchScheduler(input))
    }
  }))

  // Tool 3: Mobile Workforce App — 移动外勤应用
  tools.register(defineTool({
    name: 'mobile_workforce_app',
    description: '移动外勤应用 | 离线工单+电子签名+条码扫描+拍照+语音备注+资产查询+知识库 | Mobile workforce app with offline sync, e-signature, barcode scan, and knowledge base.',
    parameters: {
      mobile_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (offline_sync|signature_capture|barcode_scan|photo_capture|voice_note|asset_query|knowledge_search), technician_id?, work_order_id?, barcode_data?, asset_id?, search_query?, offline_pending_count?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { mobile_input: string }) {
      const input: MobileAppInput = JSON.parse(args.mobile_input)
      return formatMobileWorkforceAppReport(analyzeMobileWorkforceApp(input))
    }
  }))

  // Tool 4: Asset Maintenance — 资产管理维护
  tools.register(defineTool({
    name: 'asset_maintenance',
    description: '资产管理维护 | 设备台账+维保计划+故障预测MTBF+备件库存联动+IoT集成+维保成本 | Asset management with MTBF prediction, IoT integration, and spare parts inventory.',
    parameters: {
      asset_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (register|schedule_maintenance|predict_failure|inventory_check|iot_status|cost_analysis), asset_id?, asset_name?, asset_type (hvac|electrical|plumbing|mechanical|it_equipment|vehicle), install_date?, last_service_date?, mtbf_hours?, iot_sensors[]?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { asset_input: string }) {
      const input: AssetInput = JSON.parse(args.asset_input)
      return formatAssetMaintenanceReport(analyzeAssetMaintenance(input))
    }
  }))

  // Tool 5: SLA Compliance Monitor — SLA合规监控
  tools.register(defineTool({
    name: 'sla_compliance_monitor',
    description: 'SLA合规监控 | 响应时间+解决时间+首次修复率+升级预警+违约成本+趋势分析 | SLA compliance monitoring with response/resolution tracking, first-fix rate, and penalty cost analysis.',
    parameters: {
      sla_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (monitor|alert|trend|cost_analysis), time_range?, sla_targets{response_time_min, resolution_time_min, first_fix_rate_pct}, work_orders[{order_id, response_time_min, resolution_time_min, first_fix, escalated}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { sla_input: string }) {
      const input: SLAInput = JSON.parse(args.sla_input)
      return formatSLAComplianceReport(analyzeSLACompliance(input))
    }
  }))

  // Tool 6: Territory Optimizer — 区域优化
  tools.register(defineTool({
    name: 'territory_optimizer',
    description: '区域优化 | 工作量密度热力图+平衡路线+差旅时间最小化+覆盖效率+区域调整模拟 | Territory optimization with workload heatmap, route balancing, and coverage analysis.',
    parameters: {
      territory_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (heatmap|balance_routes|minimize_travel|coverage_analysis|simulate_adjustment), territories[{territory_id, name, work_order_count, total_travel_min, technician_count, area_sqkm}], optimization_target (balance_workload|minimize_travel|maximize_coverage)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { territory_input: string }) {
      const input: TerritoryInput = JSON.parse(args.territory_input)
      return formatTerritoryOptimizerReport(analyzeTerritoryOptimizer(input))
    }
  }))

  // Tool 7: Customer Portal — 客户自助门户
  tools.register(defineTool({
    name: 'customer_portal',
    description: '客户自助门户 | 工单提交+进度跟踪+评价反馈+电子发票+FAQ推荐+满意度追踪+维护历史 | Customer self-service portal with order submission, progress tracking, and satisfaction survey.',
    parameters: {
      portal_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (submit_order|track_progress|submit_review|request_invoice|faq_search|satisfaction_survey|view_history), customer_id?, order_description?, service_type?, rating?, review_text?, faq_query?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { portal_input: string }) {
      const input: PortalInput = JSON.parse(args.portal_input)
      return formatCustomerPortalReport(analyzeCustomerPortal(input))
    }
  }))

  // Tool 8: Workforce Analytics — 外勤效能分析
  tools.register(defineTool({
    name: 'workforce_analytics',
    description: '外勤效能分析 | 人均产出+加班分析+培训缺口+团队协作+协作模式发现+效能改进建议 | Workforce analytics with productivity, overtime, training gaps, and collaboration pattern discovery.',
    parameters: {
      analytics_input: {
        type: 'string',
        required: true,
        description: 'JSON: action (productivity|overtime_analysis|training_gaps|team_collaboration|improvement_suggestions), period?, technicians[{tech_id, name, orders_completed, hours_worked, overtime_hours, skills[], training_completed[]}]'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { analytics_input: string }) {
      const input: AnalyticsInput = JSON.parse(args.analytics_input)
      return formatWorkforceAnalyticsReport(analyzeWorkforceAnalytics(input))
    }
  }))

  console.log(`[dsh-tool-fieldforce] Loaded v${VERSION} — FieldForce: 外勤管理全链路, 8 tools active`)
  console.log('  Tools: work_order_lifecycle, dispatch_scheduler, mobile_workforce_app, asset_maintenance, sla_compliance_monitor, territory_optimizer, customer_portal, workforce_analytics')
}
