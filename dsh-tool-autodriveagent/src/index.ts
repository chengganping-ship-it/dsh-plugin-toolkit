import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

/* ------------------------------------------------------------------ */
/*  确定性随机数生成 (mulberry32)                                      */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededRng(seedStr: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return mulberry32(h >>> 0)
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(rng: () => number, min: number, max: number, digits = 2): number {
  return parseFloat((rng() * (max - min) + min).toFixed(digits))
}

const DISCLAIMER =
  '本分析基于AI模型推断，仅供自动驾驶研发参考，不替代专业安全评估与法规合规审查。'

/* ================================================================== */
/*  1. perception_evaluator — 感知系统评估                              */
/* ================================================================== */
interface PerceptionInput {
  sensor_type?: string
  weather?: string
  scenario?: string
  detections?: number
  ground_truth?: number
}

interface PerceptionResult {
  tool: string
  mAP: number
  iou: number
  detection_rate: number
  false_positive_rate: number
  sensor_fusion_score: number
  segmentation_mIoU: number
  depth_rmse: number
  assessment: string
  recommendations: string[]
  disclaimer: string
}

function analyzePerception(data: PerceptionInput): PerceptionResult {
  const rng = seededRng(JSON.stringify(data))
  const detections = data.detections ?? randInt(rng, 800, 5000)
  const groundTruth = data.ground_truth ?? randInt(rng, 900, 5200)
  const tp = Math.min(detections, groundTruth)
  const fp = Math.max(0, detections - groundTruth)
  const fn = Math.max(0, groundTruth - detections)
  const detectionRate = parseFloat(((tp / groundTruth) * 100).toFixed(2))
  const fpr = parseFloat(((fp / (fp + tp + 1)) * 100).toFixed(2))
  const mAP = parseFloat(randFloat(rng, 0.72, 0.97).toFixed(3))
  const iou = parseFloat(randFloat(rng, 0.65, 0.93).toFixed(3))
  const fusion = parseFloat(randFloat(rng, 0.70, 0.95).toFixed(3))
  const segMiou = parseFloat(randFloat(rng, 0.60, 0.90).toFixed(3))
  const depthRmse = parseFloat(randFloat(rng, 0.3, 2.5).toFixed(2))

  let assessment: string
  if (mAP >= 0.9 && iou >= 0.85) {
    assessment = '感知系统性能优秀，满足L4级自动驾驶要求'
  } else if (mAP >= 0.8 && iou >= 0.75) {
    assessment = '感知系统性能良好，满足L3级自动驾驶要求'
  } else {
    assessment = '感知系统需要优化，建议加强传感器融合与算法迭代'
  }

  const recommendations: string[] = []
  if (mAP < 0.85) recommendations.push('增加训练数据多样性，优化目标检测模型')
  if (iou < 0.8) recommendations.push('改进边界框回归精度')
  if (segMiou < 0.75) recommendations.push('增强语义分割网络感受野')
  if (depthRmse > 1.5) recommendations.push('引入多模态深度估计融合策略')
  if (fusion < 0.85) recommendations.push('升级传感器融合框架，引入注意力机制')
  if (recommendations.length === 0) recommendations.push('当前性能优秀，持续监控即可')

  return {
    tool: 'perception_evaluator',
    mAP,
    iou,
    detection_rate: detectionRate,
    false_positive_rate: fpr,
    sensor_fusion_score: fusion,
    segmentation_mIoU: segMiou,
    depth_rmse: depthRmse,
    assessment,
    recommendations,
    disclaimer: DISCLAIMER
  }
}

function formatPerception(r: PerceptionResult): string {
  return [
    '═══════════════════════════════════════════════════',
    '  1. 感知系统评估 (perception_evaluator)',
    '═══════════════════════════════════════════════════',
    '',
    `  mAP (目标检测):          ${r.mAP}`,
    `  IoU:                     ${r.iou}`,
    `  检测率:                  ${r.detection_rate}%`,
    `  误检率:                  ${r.false_positive_rate}%`,
    `  传感器融合评分:          ${r.sensor_fusion_score}`,
    `  语义分割 mIoU:           ${r.segmentation_mIoU}`,
    `  深度估计 RMSE:           ${r.depth_rmse}m`,
    '',
    `  综合评估: ${r.assessment}`,
    '',
    '  优化建议:',
    ...r.recommendations.map((rec, i) => `    ${i + 1}. ${rec}`),
    '',
    `  [免责声明] ${r.disclaimer}`,
    ''
  ].join('\n')
}

/* ================================================================== */
/*  2. planning_decision_auditor — 规划决策审计                         */
/* ================================================================== */
interface PlanningInput {
  scenario_type?: string
  road_condition?: string
  speed_limit?: number
  scenarios?: number
  unsafe_events?: number
}

interface PlanningResult {
  tool: string
  path_smoothness: number
  decision_accuracy: number
  lane_change_success: number
  intersection_handling: number
  safety_score: number
  planner_type: string
  assessment: string
  improvements: string[]
  disclaimer: string
}

function analyzePlanning(data: PlanningInput): PlanningResult {
  const rng = seededRng(JSON.stringify(data))
  const pathSmooth = parseFloat(randFloat(rng, 0.65, 0.98).toFixed(3))
  const decisionAcc = parseFloat(randFloat(rng, 0.70, 0.96).toFixed(3))
  const laneChange = parseFloat(randFloat(rng, 0.60, 0.95).toFixed(3))
  const intersection = parseFloat(randFloat(rng, 0.55, 0.92).toFixed(3))
  const safety = parseFloat(randFloat(rng, 0.68, 0.97).toFixed(3))
  const planner = pick(rng, ['Lattice', 'EM Planner', 'APOLLO', 'LQR+RRT*', 'Hybrid A*', 'MPC'])

  let assessment: string
  if (safety >= 0.9 && decisionAcc >= 0.88) {
    assessment = '规划决策系统安全可靠，具备高级别自动驾驶能力'
  } else if (safety >= 0.8 && decisionAcc >= 0.78) {
    assessment = '规划决策系统基本合格，需针对边缘场景优化'
  } else {
    assessment = '规划决策系统风险较高，需全面升级安全机制'
  }

  const improvements: string[] = []
  if (pathSmooth < 0.85) improvements.push('优化轨迹平滑性，减少乘客不适感')
  if (decisionAcc < 0.85) improvements.push('引入深度强化学习提升行为决策精度')
  if (laneChange < 0.8) improvements.push('改进换道策略模型，增加安全冗余')
  if (intersection < 0.8) improvements.push('强化路口场景理解与通行策略')
  if (safety < 0.85) improvements.push('增加安全约束检查层，建立冗余决策机制')
  if (improvements.length === 0) improvements.push('系统表现出色，持续迭代优化')

  return {
    tool: 'planning_decision_auditor',
    path_smoothness: pathSmooth,
    decision_accuracy: decisionAcc,
    lane_change_success: laneChange,
    intersection_handling: intersection,
    safety_score: safety,
    planner_type: planner,
    assessment,
    improvements,
    disclaimer: DISCLAIMER
  }
}

function formatPlanning(r: PlanningResult): string {
  return [
    '═══════════════════════════════════════════════════',
    '  2. 规划决策审计 (planning_decision_auditor)',
    '═══════════════════════════════════════════════════',
    '',
    `  规划器类型:              ${r.planner_type}`,
    `  路径平滑度:              ${r.path_smoothness}`,
    `  决策准确率:              ${r.decision_accuracy}`,
    `  换道成功率:              ${r.lane_change_success}`,
    `  路口处理能力:            ${r.intersection_handling}`,
    `  安全评分:                ${r.safety_score}`,
    '',
    `  综合评估: ${r.assessment}`,
    '',
    '  改进建议:',
    ...r.improvements.map((imp, i) => `    ${i + 1}. ${imp}`),
    '',
    `  [免责声明] ${r.disclaimer}`,
    ''
  ].join('\n')
}

/* ================================================================== */
/*  3. fleet_management_center — 车队运营中心                           */
/* ================================================================== */
interface FleetInput {
  fleet_size?: number
  avg_daily_mileage?: number
  vehicle_type?: string
  region?: string
}

interface FleetResult {
  tool: string
  fleet_size: number
  active_vehicles: number
  avg_utilization: number
  energy_efficiency: number
  maintenance_due: number
  total_mileage: number
  dispatch_efficiency: number
  assessment: string
  suggestions: string[]
  disclaimer: string
}

function analyzeFleet(data: FleetInput): FleetResult {
  const rng = seededRng(JSON.stringify(data))
  const fleetSize = data.fleet_size ?? randInt(rng, 50, 500)
  const activeVehicles = randInt(rng, Math.floor(fleetSize * 0.7), fleetSize)
  const utilization = parseFloat(((activeVehicles / fleetSize) * 100).toFixed(1))
  const energy = parseFloat(randFloat(rng, 0.70, 0.95).toFixed(3))
  const maintenance = randInt(rng, 3, Math.floor(fleetSize * 0.15))
  const mileage = parseFloat((activeVehicles * (data.avg_daily_mileage ?? randInt(rng, 150, 400)) * 30).toFixed(0))
  const dispatch = parseFloat(randFloat(rng, 0.75, 0.96).toFixed(3))

  let assessment: string
  if (utilization >= 85 && energy >= 0.85) {
    assessment = '车队运营效率高，资源利用率优'
  } else if (utilization >= 70 && energy >= 0.75) {
    assessment = '车队运营正常，有优化空间'
  } else {
    assessment = '车队运营效率偏低，建议优化调度策略'
  }

  const suggestions: string[] = []
  if (utilization < 80) suggestions.push('优化调度算法，提升车辆利用率')
  if (energy < 0.85) suggestions.push('引入能耗优化策略，降低运营成本')
  if (maintenance > fleetSize * 0.1) suggestions.push('加强预防性维护计划，减少故障停运')
  if (dispatch < 0.88) suggestions.push('升级调度系统，实现动态路径优化')
  if (suggestions.length === 0) suggestions.push('运营状态良好，持续监控关键指标')

  return {
    tool: 'fleet_management_center',
    fleet_size: fleetSize,
    active_vehicles: activeVehicles,
    avg_utilization: utilization,
    energy_efficiency: energy,
    maintenance_due: maintenance,
    total_mileage: mileage,
    dispatch_efficiency: dispatch,
    assessment,
    suggestions,
    disclaimer: DISCLAIMER
  }
}

function formatFleet(r: FleetResult): string {
  return [
    '═══════════════════════════════════════════════════',
    '  3. 车队运营中心 (fleet_management_center)',
    '═══════════════════════════════════════════════════',
    '',
    `  车队规模:                ${r.fleet_size} 辆`,
    `  活跃车辆:                ${r.active_vehicles} 辆`,
    `  平均利用率:              ${r.avg_utilization}%`,
    `  能源效率:                ${r.energy_efficiency}`,
    `  待维护车辆:              ${r.maintenance_due} 辆`,
    `  月总里程:                ${r.total_mileage.toLocaleString()} km`,
    `  调度效率:                ${r.dispatch_efficiency}`,
    '',
    `  运营评估: ${r.assessment}`,
    '',
    '  运营建议:',
    ...r.suggestions.map((s, i) => `    ${i + 1}. ${s}`),
    '',
    `  [免责声明] ${r.disclaimer}`,
    ''
  ].join('\n')
}

/* ================================================================== */
/*  4. v2x_communication_manager — 车路协同管理                        */
/* ================================================================== */
interface V2XInput {
  coverage_area?: string
  rsu_count?: number
  vehicle_count?: number
  protocol?: string
}

interface V2XResult {
  tool: string
  connectivity_rate: number
  latency_ms: number
  packet_loss: number
  security_level: string
  data_throughput: number
  rsu_coverage: number
  assessment: string
  optimizations: string[]
  disclaimer: string
}

function analyzeV2X(data: V2XInput): V2XResult {
  const rng = seededRng(JSON.stringify(data))
  const connectivity = parseFloat(randFloat(rng, 0.80, 0.99).toFixed(3))
  const latency = parseFloat(randFloat(rng, 5, 80).toFixed(1))
  const packetLoss = parseFloat(randFloat(rng, 0.01, 5.0).toFixed(2))
  const throughput = parseFloat(randFloat(rng, 10, 100).toFixed(1))
  const rsuCoverage = parseFloat(randFloat(rng, 0.65, 0.98).toFixed(3))

  const secScore = (connectivity * 0.3 + (1 - packetLoss / 10) * 0.3 + rsuCoverage * 0.4)
  let securityLevel: string
  if (secScore >= 0.85) securityLevel = '高 (A级)'
  else if (secScore >= 0.7) securityLevel = '中 (B级)'
  else securityLevel = '低 (C级 — 需加强)'

  let assessment: string
  if (connectivity >= 0.95 && latency < 20) {
    assessment = 'V2X通信性能优异，支持协同式自动驾驶'
  } else if (connectivity >= 0.85 && latency < 50) {
    assessment = 'V2X通信性能良好，基本满足协同需求'
  } else {
    assessment = 'V2X通信质量待改善，需优化网络部署'
  }

  const optimizations: string[] = []
  if (connectivity < 0.92) optimizations.push('增加RSU部署密度，扩大通信覆盖')
  if (latency > 30) optimizations.push('优化通信协议栈，降低端到端延迟')
  if (packetLoss > 2) optimizations.push('增强抗干扰能力，减少丢包率')
  if (rsuCoverage < 0.85) optimizations.push('完善路侧设备布局，消除覆盖盲区')
  if (securityLevel.includes('低')) optimizations.push('升级安全认证体系，防范网络攻击')
  if (optimizations.length === 0) optimizations.push('V2X系统表现优秀，持续监控运行')

  return {
    tool: 'v2x_communication_manager',
    connectivity_rate: connectivity,
    latency_ms: latency,
    packet_loss: packetLoss,
    security_level: securityLevel,
    data_throughput: throughput,
    rsu_coverage: rsuCoverage,
    assessment,
    optimizations,
    disclaimer: DISCLAIMER
  }
}

function formatV2X(r: V2XResult): string {
  return [
    '═══════════════════════════════════════════════════',
    '  4. 车路协同管理 (v2x_communication_manager)',
    '═══════════════════════════════════════════════════',
    '',
    `  通信连接率:              ${r.connectivity_rate}`,
    `  通信延迟:                ${r.latency_ms} ms`,
    `  丢包率:                  ${r.packet_loss}%`,
    `  安全等级:                ${r.security_level}`,
    `  数据吞吐:                ${r.data_throughput} Mbps`,
    `  RSU覆盖率:               ${r.rsu_coverage}`,
    '',
    `  综合评估: ${r.assessment}`,
    '',
    '  优化建议:',
    ...r.optimizations.map((o, i) => `    ${i + 1}. ${o}`),
    '',
    `  [免责声明] ${r.disclaimer}`,
    ''
  ].join('\n')
}

/* ================================================================== */
/*  5. simulation_test_platform — 仿真测试平台                          */
/* ================================================================== */
interface SimulationInput {
  scenario_library?: number
  test_type?: string
  regression_count?: number
}

interface SimulationResult {
  tool: string
  total_scenarios: number
  regression_pass_rate: number
  edge_case_coverage: number
  total_mpi: number
  simulation_mileage: number
  critical_findings: number
  avg_scenario_score: number
  assessment: string
  test_plan: string[]
  disclaimer: string
}

function analyzeSimulation(data: SimulationInput): SimulationResult {
  const rng = seededRng(JSON.stringify(data))
  const scenarios = data.scenario_library ?? randInt(rng, 5000, 100000)
  const passRate = parseFloat(randFloat(rng, 0.75, 0.98).toFixed(3))
  const edgeCoverage = parseFloat(randFloat(rng, 0.40, 0.90).toFixed(3))
  const simMileage = parseFloat((scenarios * randFloat(rng, 0.5, 5.0)).toFixed(0))
  const mpi = parseFloat((simMileage / randInt(rng, 50, 500)).toFixed(1))
  const critical = randInt(rng, 0, 20)
  const avgScore = parseFloat(randFloat(rng, 0.65, 0.95).toFixed(3))

  let assessment: string
  if (passRate >= 0.95 && edgeCoverage >= 0.8 && critical <= 3) {
    assessment = '仿真测试覆盖充分，系统验证可靠'
  } else if (passRate >= 0.85 && edgeCoverage >= 0.6) {
    assessment = '仿真测试基本完善，需补充边缘场景'
  } else {
    assessment = '仿真测试缺口较大，需大幅扩充测试'
  }

  const testPlan: string[] = []
  if (edgeCoverage < 0.75) testPlan.push('扩充边缘场景库，覆盖极端工况')
  if (passRate < 0.9) testPlan.push('加强回归测试，修复已知缺陷')
  if (critical > 5) testPlan.push('优先处理关键发现，进行专项验证')
  if (scenarios < 20000) testPlan.push('增加场景数量，提升测试统计显著性')
  if (mpi < 100) testPlan.push('扩大仿真里程，提升MPI指标可信度')
  if (testPlan.length === 0) testPlan.push('测试体系成熟，推进实车验证')

  return {
    tool: 'simulation_test_platform',
    total_scenarios: scenarios,
    regression_pass_rate: passRate,
    edge_case_coverage: edgeCoverage,
    total_mpi: mpi,
    simulation_mileage: simMileage,
    critical_findings: critical,
    avg_scenario_score: avgScore,
    assessment,
    test_plan: testPlan,
    disclaimer: DISCLAIMER
  }
}

function formatSimulation(r: SimulationResult): string {
  return [
    '═══════════════════════════════════════════════════',
    '  5. 仿真测试平台 (simulation_test_platform)',
    '═══════════════════════════════════════════════════',
    '',
    `  场景总数:                ${r.total_scenarios.toLocaleString()}`,
    `  回归测试通过率:          ${r.regression_pass_rate}`,
    `  边缘场景覆盖率:          ${r.edge_case_coverage}`,
    `  仿真总里程:              ${r.simulation_mileage.toLocaleString()} km`,
    `  MPI (平均接管间隔):      ${r.total_mpi} km`,
    `  关键发现数:              ${r.critical_findings}`,
    `  平均场景得分:            ${r.avg_scenario_score}`,
    '',
    `  测试评估: ${r.assessment}`,
    '',
    '  测试计划:',
    ...r.test_plan.map((t, i) => `    ${i + 1}. ${t}`),
    '',
    `  [免责声明] ${r.disclaimer}`,
    ''
  ].join('\n')
}

/* ================================================================== */
/*  6. safety_monitor_oversight — 安全监控                              */
/* ================================================================== */
interface SafetyInput {
  period?: string
  total_miles?: number
  disengagements?: number
  incidents?: number
}

interface SafetyResult {
  tool: string
  safety_score: number
  disengagement_rate: number
  incident_count: number
  risk_level: string
  compliance_score: number
  mtbf_hours: number
  assessment: string
  actions: string[]
  disclaimer: string
}

function analyzeSafety(data: SafetyInput): SafetyResult {
  const rng = seededRng(JSON.stringify(data))
  const totalMiles = data.total_miles ?? randInt(rng, 10000, 1000000)
  const disengagements = data.disengagements ?? randInt(rng, 5, 200)
  const incidents = data.incidents ?? randInt(rng, 0, 10)
  const disRate = parseFloat((disengagements / totalMiles * 1000).toFixed(3))
  const safetyScore = parseFloat(Math.min(0.99, Math.max(0.4, 1 - disRate / 10 - incidents * 0.05)).toFixed(3))
  const complianceScore = parseFloat(randFloat(rng, 0.75, 0.98).toFixed(3))
  const mtbf = parseFloat(randFloat(rng, 100, 5000).toFixed(0))

  let riskLevel: string
  if (safetyScore >= 0.9) riskLevel = '低风险 (Green)'
  else if (safetyScore >= 0.75) riskLevel = '中风险 (Yellow)'
  else if (safetyScore >= 0.6) riskLevel = '较高风险 (Orange)'
  else riskLevel = '高风险 (Red)'

  let assessment: string
  if (safetyScore >= 0.9 && incidents === 0) {
    assessment = '安全表现优秀，车队运营风险可控'
  } else if (safetyScore >= 0.75 && incidents <= 2) {
    assessment = '安全状况一般，需关注风险趋势'
  } else {
    assessment = '安全风险突出，需立即采取整改措施'
  }

  const actions: string[] = []
  if (disRate > 1) actions.push('分析接管根因，针对性优化算法')
  if (incidents > 0) actions.push('开展事故深度调查，建立防范机制')
  if (complianceScore < 0.9) actions.push('加强合规审查，确保符合安全标准')
  if (mtbf < 1000) actions.push('提升硬件可靠性，延长平均无故障时间')
  if (riskLevel.includes('高风险') || riskLevel.includes('较高')) actions.push('启动安全应急预案，暂停部分运营')
  if (actions.length === 0) actions.push('安全态势良好，保持现有管控措施')

  return {
    tool: 'safety_monitor_oversight',
    safety_score: safetyScore,
    disengagement_rate: disRate,
    incident_count: incidents,
    risk_level: riskLevel,
    compliance_score: complianceScore,
    mtbf_hours: mtbf,
    assessment,
    actions,
    disclaimer: DISCLAIMER
  }
}

function formatSafety(r: SafetyResult): string {
  return [
    '═══════════════════════════════════════════════════',
    '  6. 安全监控 (safety_monitor_oversight)',
    '═══════════════════════════════════════════════════',
    '',
    `  安全评分:                ${r.safety_score}`,
    `  千公里接管率:            ${r.disengagement_rate}`,
    `  事故数量:                ${r.incident_count}`,
    `  风险等级:                ${r.risk_level}`,
    `  合规评分:                ${r.compliance_score}`,
    `  MTBF (平均无故障):       ${r.mtbf_hours} h`,
    '',
    `  安全评估: ${r.assessment}`,
    '',
    '  处置措施:',
    ...r.actions.map((a, i) => `    ${i + 1}. ${a}`),
    '',
    `  [免责声明] ${r.disclaimer}`,
    ''
  ].join('\n')
}

/* ================================================================== */
/*  7. hd_map_updater — 高精地图更新                                    */
/* ================================================================== */
interface HDMapInput {
  region?: string
  map_version?: string
  change_area_km2?: number
  sources?: number
}

interface HDMapResult {
  tool: string
  change_detection_rate: number
  map_accuracy: number
  update_latency_hours: number
  coverage_percent: number
  version: string
  diff_size_mb: number
  crowdsource_contrib: number
  assessment: string
  update_strategy: string[]
  disclaimer: string
}

function analyzeHDMap(data: HDMapInput): HDMapResult {
  const rng = seededRng(JSON.stringify(data))
  const changeRate = parseFloat(randFloat(rng, 0.75, 0.98).toFixed(3))
  const accuracy = parseFloat(randFloat(rng, 0.05, 0.15).toFixed(3))
  const latency = parseFloat(randFloat(rng, 1, 72).toFixed(1))
  const coverage = parseFloat(randFloat(rng, 0.80, 0.99).toFixed(3))
  const diffSize = parseFloat(randFloat(rng, 10, 500).toFixed(1))
  const crowdsource = randInt(rng, 20, 200)

  let version = `v${randInt(rng, 3, 12)}.${randInt(rng, 0, 9)}.${randInt(rng, 0, 9)}`
  if (data.map_version) version = data.map_version

  let assessment: string
  if (changeRate >= 0.9 && accuracy <= 0.1 && latency < 24) {
    assessment = '高精地图更新机制高效，数据鲜度满足要求'
  } else if (changeRate >= 0.8 && accuracy <= 0.15 && latency < 48) {
    assessment = '高精地图更新基本满足需求，有优化空间'
  } else {
    assessment = '高精地图更新滞后，需升级更新策略'
  }

  const updateStrategy: string[] = []
  if (changeRate < 0.88) updateStrategy.push('增强变化检测算法，提高自动化率')
  if (accuracy > 0.12) updateStrategy.push('改进绝对精度，融合多源修正数据')
  if (latency > 24) updateStrategy.push('优化更新管线，缩短发布延迟')
  if (coverage < 0.9) updateStrategy.push('扩大采集覆盖，消除地图盲区')
  if (crowdsource < 50) updateStrategy.push('扩展众包数据源，丰富更新素材')
  if (updateStrategy.length === 0) updateStrategy.push('地图更新体系成熟，引入AI自动标注')

  return {
    tool: 'hd_map_updater',
    change_detection_rate: changeRate,
    map_accuracy: accuracy,
    update_latency_hours: latency,
    coverage_percent: coverage,
    version,
    diff_size_mb: diffSize,
    crowdsource_contrib: crowdsource,
    assessment,
    update_strategy: updateStrategy,
    disclaimer: DISCLAIMER
  }
}

function formatHDMap(r: HDMapResult): string {
  return [
    '═══════════════════════════════════════════════════',
    '  7. 高精地图更新 (hd_map_updater)',
    '═══════════════════════════════════════════════════',
    '',
    `  变化检测率:              ${r.change_detection_rate}`,
    `  地图精度 (RMSE):         ${r.map_accuracy} m`,
    `  更新延迟:                ${r.update_latency_hours} h`,
    `  覆盖率:                  ${r.coverage_percent}`,
    `  地图版本:                ${r.version}`,
    `  差分更新大小:            ${r.diff_size_mb} MB`,
    `  众包贡献数:              ${r.crowdsource_contrib}`,
    '',
    `  更新评估: ${r.assessment}`,
    '',
    '  更新策略:',
    ...r.update_strategy.map((s, i) => `    ${i + 1}. ${s}`),
    '',
    `  [免责声明] ${r.disclaimer}`,
    ''
  ].join('\n')
}

/* ================================================================== */
/*  8. regulatory_compliance — 法规合规                                 */
/* ================================================================== */
interface RegulatoryInput {
  market?: string
  vehicle_class?: string
  automation_level?: string
  data_volume_tb?: number
}

interface RegulatoryResult {
  tool: string
  overall_compliance: number
  regulatory_items: number
  passed_items: number
  pending_items: number
  data_compliance: number
  safety_standard: string
  liability_framework: string
  assessment: string
  action_items: string[]
  disclaimer: string
}

function analyzeRegulatory(data: RegulatoryInput): RegulatoryResult {
  const rng = seededRng(JSON.stringify(data))
  const items = randInt(rng, 20, 60)
  const passed = randInt(rng, Math.floor(items * 0.6), items)
  const pending = items - passed
  const overall = parseFloat((passed / items).toFixed(3))
  const dataCompliance = parseFloat(randFloat(rng, 0.70, 0.98).toFixed(3))

  const safety = pick(rng, ['ISO 26262 ASIL-D', 'ISO/PAS 21448 SOTIF', 'UL 4600', 'GB/T 40429', 'ISO 26262 ASIL-B'])
  const liability = pick(rng, ['制造商主责', '运营方主责', '混合责任', '保险兜底', 'oDB模式'])

  let assessment: string
  if (overall >= 0.9 && dataCompliance >= 0.9) {
    assessment = '法规合规状况良好，具备商业化运营条件'
  } else if (overall >= 0.75 && dataCompliance >= 0.8) {
    assessment = '法规合规基本满足，需关注待整改项'
  } else {
    assessment = '法规合规差距较大，需制定整改计划'
  }

  const actionItems: string[] = []
  if (pending > 5) actionItems.push('加速待整改项闭环，确保准入通过')
  if (dataCompliance < 0.9) actionItems.push('加强数据合规管理，满足个人信息保护法')
  if (overall < 0.85) actionItems.push('全面梳理合规差距，制定整改时间表')
  if (!safety.includes('ASIL-D') && !safety.includes('SOTIF')) actionItems.push('对标最高安全标准，升级安全体系')
  if (liability.includes('混合')) actionItems.push('厘清责任边界，完善保险方案')
  if (actionItems.length === 0) actionItems.push('合规体系健全，持续跟踪法规动态')

  return {
    tool: 'regulatory_compliance',
    overall_compliance: overall,
    regulatory_items: items,
    passed_items: passed,
    pending_items: pending,
    data_compliance: dataCompliance,
    safety_standard: safety,
    liability_framework: liability,
    assessment,
    action_items: actionItems,
    disclaimer: DISCLAIMER
  }
}

function formatRegulatory(r: RegulatoryResult): string {
  return [
    '═══════════════════════════════════════════════════',
    '  8. 法规合规 (regulatory_compliance)',
    '═══════════════════════════════════════════════════',
    '',
    `  整体合规率:              ${r.overall_compliance}`,
    `  合规项总数:              ${r.regulatory_items}`,
    `  已通过:                  ${r.passed_items}`,
    `  待整改:                  ${r.pending_items}`,
    `  数据合规评分:            ${r.data_compliance}`,
    `  安全标准:                ${r.safety_standard}`,
    `  责任框架:                ${r.liability_framework}`,
    '',
    `  合规评估: ${r.assessment}`,
    '',
    '  行动项:',
    ...r.action_items.map((a, i) => `    ${i + 1}. ${a}`),
    '',
    `  [免责声明] ${r.disclaimer}`,
    ''
  ].join('\n')
}

/* ================================================================== */
/*  插件注册                                                           */
/* ================================================================== */
export const name = 'autodriveagent'
export const inject = ['tools']

export function apply(ctx: Context) {
  const tools = ctx.tools

  /* 1. perception_evaluator */
  tools.register(
    defineTool({
      name: 'perception_evaluator',
      description: '感知系统评估 — 目标检测、语义分割、深度估计、传感器融合、精度评估',
      parameters: {
        input_data: {
          type: 'string' as const,
          required: true,
          description: 'JSON格式的感知评估参数'
        }
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
      },
      async execute(args: { input_data: string }) {
        return formatPerception(analyzePerception(JSON.parse(args.input_data)))
      }
    })
  )

  /* 2. planning_decision_auditor */
  tools.register(
    defineTool({
      name: 'planning_decision_auditor',
      description: '规划决策审计 — 路径规划、行为决策、换道策略、路口处理、安全评估',
      parameters: {
        input_data: {
          type: 'string' as const,
          required: true,
          description: 'JSON格式的规划审计参数'
        }
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
      },
      async execute(args: { input_data: string }) {
        return formatPlanning(analyzePlanning(JSON.parse(args.input_data)))
      }
    })
  )

  /* 3. fleet_management_center */
  tools.register(
    defineTool({
      name: 'fleet_management_center',
      description: '车队运营中心 — 车辆调度、远程监控、能耗管理、维护计划、运营效率',
      parameters: {
        input_data: {
          type: 'string' as const,
          required: true,
          description: 'JSON格式的车队运营参数'
        }
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
      },
      async execute(args: { input_data: string }) {
        return formatFleet(analyzeFleet(JSON.parse(args.input_data)))
      }
    })
  )

  /* 4. v2x_communication_manager */
  tools.register(
    defineTool({
      name: 'v2x_communication_manager',
      description: '车路协同管理 — V2X通信、路侧设备、信号协同、安全认证、数据交换',
      parameters: {
        input_data: {
          type: 'string' as const,
          required: true,
          description: 'JSON格式的车路协同参数'
        }
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
      },
      async execute(args: { input_data: string }) {
        return formatV2X(analyzeV2X(JSON.parse(args.input_data)))
      }
    })
  )

  /* 5. simulation_test_platform */
  tools.register(
    defineTool({
      name: 'simulation_test_platform',
      description: '仿真测试平台 — 场景库、回归测试、边缘场景、里程统计、MPI评估',
      parameters: {
        input_data: {
          type: 'string' as const,
          required: true,
          description: 'JSON格式的仿真测试参数'
        }
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
      },
      async execute(args: { input_data: string }) {
        return formatSimulation(analyzeSimulation(JSON.parse(args.input_data)))
      }
    })
  )

  /* 6. safety_monitor_oversight */
  tools.register(
    defineTool({
      name: 'safety_monitor_oversight',
      description: '安全监控 — 风险预警、接管分析、事故分析、安全评分、合规检查',
      parameters: {
        input_data: {
          type: 'string' as const,
          required: true,
          description: 'JSON格式的安全监控参数'
        }
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
      },
      async execute(args: { input_data: string }) {
        return formatSafety(analyzeSafety(JSON.parse(args.input_data)))
      }
    })
  )

  /* 7. hd_map_updater */
  tools.register(
    defineTool({
      name: 'hd_map_updater',
      description: '高精地图更新 — 变化检测、众包更新、精度验证、版本管理、差分更新',
      parameters: {
        input_data: {
          type: 'string' as const,
          required: true,
          description: 'JSON格式的地图更新参数'
        }
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
      },
      async execute(args: { input_data: string }) {
        return formatHDMap(analyzeHDMap(JSON.parse(args.input_data)))
      }
    })
  )

  /* 8. regulatory_compliance */
  tools.register(
    defineTool({
      name: 'regulatory_compliance',
      description: '法规合规 — 法规追踪、准入评估、数据合规、安全标准、责任界定',
      parameters: {
        input_data: {
          type: 'string' as const,
          required: true,
          description: 'JSON格式的法规合规参数'
        }
      },
      output: {
        schema: { type: 'string' as const },
        render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
      },
      async execute(args: { input_data: string }) {
        return formatRegulatory(analyzeRegulatory(JSON.parse(args.input_data)))
      }
    })
  )
}
