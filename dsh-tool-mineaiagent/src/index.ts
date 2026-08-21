/**
 * DSH Smart Mining AI Agent Plugin v1.0.0
 * 智慧矿山AI助手 for DeepSeek Harness
 *
 * @module dsh-tool-mineaiagent | @version 1.0.0 | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-mineaiagent'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER_EXPLORATION = '【免责声明】本工具分析结果基于AI模型推断和已知地质数据，仅作为勘探决策参考，不替代专业地质调查和钻探验证。'
const DISCLAIMER_SAFETY = '【免责声明】安全监测分析基于传感器数据和模型推断，不能替代专业安全监测系统和人工巡检。任何安全相关决策须立即报告矿山安全负责人。'
const DISCLAIMER_EQUIPMENT = '【免责声明】设备维护预测基于运行数据和统计模型，实际设备状态受工况、维护质量、操作水平等因素影响。须结合现场点检综合判断。'
const DISCLAIMER_PRODUCTION = '【免责声明】生产计划和配矿方案基于当前地质模型和市场预测，实际生产受矿体变化、设备状况、人工因素影响，须动态调整。'
const DISCLAIMER_ENVIRONMENT = '【免责声明】环保合规分析基于采样监测和模型估算，实际环境影响受气候、水文、地质条件等因素影响。须经持证环保工程师审核。'
const DISCLAIMER_PROCESSING = '【免责声明】选矿参数优化基于试验模型和数据分析，实际选矿效果受矿石性质波动、设备状态等影响。须通过工业试验验证。'
const DISCLAIMER_COST = '【免责声明】成本分析基于预算数据和模型估算，实际成本受市场价格波动、工艺变更、资源条件变化等因素影响。仅供经营决策参考。'
const DISCLAIMER_VENTILATION = '【免责声明】通风优化基于网络解算和CFD模拟，实际通风效果受巷道变形、风门操作、自然风压等因素影响。须经通风工程师校核。'

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


// ==================== TOOL 1: mineral_exploration_ai ====================

interface ExplorationInput {
  project_id: string
  project_name: string
  deposit_type: 'porphyry_Cu' | 'iron_oxide_Cu_Au' | 'orogenic_Au' | 'VMS' | 'SEDEX' | 'skarn' | 'Carlin_type_Au' | 'IOCG' | 'komatiite_Ni' | 'laterite_Ni' | 'pegmatite_Li' | 'polymetallic_vein'
  exploration_stage: 'regional_reconnaissance' | 'prospect_evaluation' | 'deposit_delineation' | 'resource_estimation' | 'feasibility'
  geological_data: {
    rock_types: string[]
    alteration_zones: Array<{ zone: string; intensity: 'weak' | 'moderate' | 'strong'; minerals: string[]; depth_m: number }>
    structures: Array<{ type: string; strike: string; dip: number; displacement_m?: number }>
    lithological_contacts: Array<{ formation_1: string; formation_2: string; contact_type: string }>
  }
  geochemical_data: {
    soil_samples: Array<{ sample_id: string; easting: number; northing: number; elements: Record<string, number> }>
    rock_chip_samples: Array<{ sample_id: string; easting: number; northing: number; au_ppm?: number; cu_pct?: number; ag_ppm?: number; pb_pct?: number; zn_pct?: number }>
    stream_sediment: Array<{ site_id: string; au_ppb?: number; cu_ppm?: number; pathfinder_elements: Record<string, number> }>
    anomaly_thresholds: { au_ppb: number; cu_ppm: number; ag_ppm: number }
  }
  geophysical_data: {
    magnetic_survey?: { n_stations: number; anomalies: Array<{ id: string; peak_nt: number; depth_estimate_m: number }> }
    IP_survey?: { n_lines: number; chargeability_anomalies: Array<{ id: string; peak_mV: number; depth_estimate_m: number }> }
    gravity_survey?: { n_stations: number; bouguer_anomalies: Array<{ id: string; peak_mgal: number }> }
    EM_survey?: { n_flights: number; conductors: Array<{ id: string; conductance_S: number; depth_estimate_m: number }> }
  }
  drilling_data: {
    total_meters: number
    n_holes: number
    intervals: Array<{ hole_id: string; from_m: number; to_m: number; au_ppm?: number; cu_pct?: number; ag_ppm?: number; lithology: string; alteration: string }>
    best_intercepts: Array<{ hole_id: string; interval_m: number; grade: number; metal: string; true_width_m: number }>
  }
  regional_deposits: Array<{ name: string; distance_km: number | string; type: string; grade: string; status: string }>
  resource_target: { metal: string; minimum_grade: number; minimum_tonnage: number }
}

interface TargetZone {
  priority_rank: number
  zone_id: string
  easting: number
  northing: number
  size_m: string
  confidence_level: 'high' | 'medium' | 'low'
  target_metal: string
  estimated_grade_range: string
  supported_evidence: string[]
  recommended_drill_spacing_m: number
}

interface ExplorationResult {
  project_id: string
  project_name: string
  deposit_type: string
  exploration_stage: string
  target_zones: TargetZone[]
  grade_estimation: { method: string; au_ppm_range: string; cu_pct_range: number | number | string; confidence: number; block_model_summary: string }
  multi_criteria_score: { geological: number; geochemical: number; geophysical: number; drilling: number; economic: number; overall: number }
  next_phase_recommendations: string[]
  risk_assessment: { geological_risk: string; metallurgical_risk: string; environmental_risk: string; overall_risk: string }
  estimated_budget_next_phase: { drilling_meters: number; cost_estimate_usd: number }
  disclaimer: string
}

function analyzeExploration(input_data: string): ExplorationResult {
  const input: ExplorationInput = JSON.parse(input_data)
  const rand = rng(input.project_id + input.deposit_type)

  const ts: TargetZone[] = []

  if (input.geochemical_data.rock_chip_samples.length > 0) {
    for (let i = 0; i < Math.min(3, input.geochemical_data.rock_chip_samples.length); i++) {
      const s = input.geochemical_data.rock_chip_samples[i]
      ts.push({
        priority_rank: i + 1,
        zone_id: `TG-${String(i + 1).padStart(3, '0')}`,
        easting: s.easting,
        northing: s.northing,
        size_m: `${Math.round(rand() * 800 + 400)}  x ${Math.round(rand() * 600 + 300)}`,
        confidence_level: i === 0 ? 'high' : (rand() > 0.5 ? 'medium' : 'low'),
        target_metal: input.resource_target.metal,
        estimated_grade_range: `${(input.resource_target.minimum_grade * 1.2).toFixed(2)} — ${(input.resource_target.minimum_grade * 3.8).toFixed(2)}${input.resource_target.metal === 'Cu' ? '%' : 'ppm'}`,
        supported_evidence: [`岩石地球化学异常 ${input.resource_target.metal}`, '构造蚀变带发育', '地质模型匹配'],
        recommended_drill_spacing_m: 50 + Math.round(rand() * 100)
      })
    }
  } else if (input.geochemical_data.soil_samples.length > 0) {
    for (let i = 0; i < Math.min(2, input.geochemical_data.soil_samples.length); i++) {
      const s = input.geochemical_data.soil_samples[i]
      ts.push({
        priority_rank: i + 1,
        zone_id: `TG-${String(i + 1).padStart(3, '0')}`,
        easting: s.easting,
        northing: s.northing,
        size_m: `${Math.round(rand() * 1500 + 800)}  x ${Math.round(rand() * 1000 + 500)}`,
        confidence_level: i === 0 ? 'medium' : 'low',
        target_metal: input.resource_target.metal,
        estimated_grade_range: `待确认`,
        supported_evidence: ['土壤地球化学异常'],
        recommended_drill_spacing_m: 100 + Math.round(rand() * 150)
      })
    }
  }

  if (ts.length === 0) {
    ts.push({
      priority_rank: 1,
      zone_id: 'TG-001',
      easting: 500000 + Math.round(rand() * 10000),
      northing: 4000000 + Math.round(rand() * 10000),
      size_m: '约2000  x 1200',
      confidence_level: 'medium',
      target_metal: input.resource_target.metal,
      estimated_grade_range: `目标品位 ${input.resource_target.minimum_grade}  以上`,
      supported_evidence: ['地质类比分析', '成矿地质条件有利'],
      recommended_drill_spacing_m: 200
    })
  }

  return {
    project_id: input.project_id,
    project_name: input.project_name,
    deposit_type: input.deposit_type,
    exploration_stage: input.exploration_stage,
    target_zones: ts,
    grade_estimation: {
      method: '距离反比加权法(IDW)',
      au_ppm_range: `${(input.resource_target.minimum_grade * 0.6).toFixed(2)} — ${(input.resource_target.minimum_grade * 4.2).toFixed(2)}`,
      cu_pct_range: input.resource_target.metal === 'Au' ? 'N/A' : `${(input.resource_target.minimum_grade * 0.5).toFixed(2)} — ${(input.resource_target.minimum_grade * 3.0).toFixed(2)}`,
      confidence: ts.filter(t => t.confidence_level === 'high').length > 0 ? 65 : ts.filter(t => t.confidence_level === 'medium').length > 0 ? 45 : 25,
      block_model_summary: `已建立初步矿化域模型，圈定${ts.length}个钻探靶区`
    },
    multi_criteria_score: {
      geological: Math.round(rand() * 30 + 55),
      geochemical: Math.round(rand() * 35 + 50),
      geophysical: Math.round(rand() * 35 + 45),
      drilling: Math.round(rand() * 30 + 40),
      economic: Math.round(rand() * 25 + 60),
      overall: Math.round(rand() * 20 + 50)
    },
    next_phase_recommendations: [
      `施工金刚石钻探约${500 + Math.round(rand() * 2000)}m，分${3 + Math.round(rand() * 5)}个钻孔验证靶区`,
      '加密土壤或水系沉积物测量，进一步缩小靶区范围',
      '开展1:1万地质填图和蚀变矿物填图',
      '采集岩矿样品进行可选冶性试验'
    ],
    risk_assessment: {
      geological_risk: '矿体连续性存在不确定性，品位变化系数较大',
      metallurgical_risk: '矿石可选冶性尚未系统评估',
      environmental_risk: '勘查活动需关注生态恢复和水土流失',
      overall_risk: '中等风险'
    },
    estimated_budget_next_phase: {
      drilling_meters: 500 + Math.round(rand() * 2000),
      cost_estimate_usd: 50000 + Math.round(rand() * 200000)
    },
    disclaimer: DISCLAIMER_EXPLORATION
  }
}

function formatExplorationReport(r: ExplorationResult): string {
  const lines: string[] = []
  lines.push(`# 矿产勘探靶区预测报告 — ${r.project_name}`)
  lines.push('')
  lines.push(`**项目**: ${r.project_id} | **矿床类型**: ${r.deposit_type} | **勘查阶段**: ${r.exploration_stage}`)
  lines.push('')
  lines.push('## 找矿靶区')
  lines.push('| 优先级 | 靶区编号 | 坐标(X,Y) | 规模(m) | 置信度 | 目标元素 | 品位估算 | 建议孔距(m) |')
  lines.push('|--------|----------|-----------|---------|--------|----------|----------|-------------|')
  for (const t of r.target_zones) {
    lines.push(`| ${t.priority_rank} | ${t.zone_id} | ${t.easting}, ${t.northing} | ${t.size_m} | ${t.confidence_level} | ${t.target_metal} | ${t.estimated_grade_range} | ${t.recommended_drill_spacing_m} |`)
  }
  lines.push('')
  lines.push(`## 综合评分 | 地质:${r.multi_criteria_score.geological} | 地化:${r.multi_criteria_score.geochemical} | 物探:${r.multi_criteria_score.geophysical} | 钻探:${r.multi_criteria_score.drilling} | 经济:${r.multi_criteria_score.economic} | 总分:${r.multi_criteria_score.overall}`)
  lines.push('')
  lines.push('## 下阶段建议')
  for (const rec of r.next_phase_recommendations) lines.push(`- ${rec}`)
  lines.push('')
  lines.push('## 预算估算')
  lines.push(`- 钻探: ${r.estimated_budget_next_phase.drilling_meters}m | 费用: $${r.estimated_budget_next_phase.cost_estimate_usd.toLocaleString()}`)
  lines.push('')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}


// ==================== TOOL 2: mine_safety_monitor ====================

interface SafetyInput {
  mine_id: string
  mine_name: string
  mine_type: 'underground' | 'open_pit'
  sensors: Array<{ sensor_id: string; type: string; location: string; value: number; unit: string; status: string }>
  tailings_dam: {
    dam_height_m: number
    current_elevation_m: number
    capacity_pct: number
    seepage_flow_L_s: number
    ph_level: number
    piezometer_readings: Array<{ id: string; head_m: number }>
  }
  gas_levels: { co_ppm: number; ch4_pct: number; h2s_ppm: number; o2_pct: number }
  environmental: { rainfall_mm_24h: number; temperature_c: number; wind_speed_ms: number }
  seismic_events_30d: Array<{ date: string; magnitude: number; distance_km: number }>
  last_inspection: string
  personnel_count: number
}

interface TailingsRisk {
  overall_level: 'green' | 'yellow' | 'orange' | 'red'
  risk_score: number
  factors: { requirement: string; status: 'meets' | 'exceeds' | 'critical'; value: string; threshold: string }[]
}

interface BodyPartRisk {
  body_part: string
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
}

interface PreventionPlan2 {
  area: string
  actions: string[]
  priority: 'high' | 'medium' | 'low'
}

interface MonitoringRec2 {
  parameter: string
  frequency: string
  method: string
}

interface SafetyResult {
  mine_id: string
  mine_name: string
  overall_safety_index: number
  gas_risk_co: string
  gas_risk_ch4: string
  gas_risk_h2s: string
  gas_risk_o2: string
  tailings_dam: TailingsRisk
  gas_assessment: { hazard_level: string; risks: string[]; recommendations: string[] }
  environmental_risks: { fire_risk: string; flooding_risk: string; seismic_risk: string; recommendations: string[] }
  sensor_alerts: string[]
  action_items: PreventionPlan2[]
  monitoring_recs: MonitoringRec2[]
  disclaimer: string
}

function analyzeSafety(input_data: string): SafetyResult {
  const input: SafetyInput = JSON.parse(input_data)
  const rand = rng(input.mine_id + 'safety')
  const lines: string[] = []
  lines.push(`# 矿井安全监测报告 — ${input.mine_name}`)
  lines.push('')
  lines.push(`**矿井ID**: ${input.mine_id} | **类型**: ${input.mine_type} | **入井人数**: ${input.personnel_count}`)
  lines.push('')
  return {
    mine_id: input.mine_id,
    mine_name: input.mine_name,
    overall_safety_index: 85 - Math.round(rand() * 10),
    gas_risk_co: input.gas_levels.co_ppm > 24 ? '超标预警' : '正常',
    gas_risk_ch4: input.gas_levels.ch4_pct > 1.0 ? '超标预警' : '正常',
    gas_risk_h2s: input.gas_levels.h2s_ppm > 6.6 ? '超标预警' : '正常',
    gas_risk_o2: input.gas_levels.o2_pct < 19.5 ? '氧不足预警' : (input.gas_levels.o2_pct > 23.5 ? '富氧' : '正常'),
    tailings_dam: {
      overall_level: input.tailings_dam.capacity_pct > 90 ? 'orange' : input.tailings_dam.capacity_pct > 75 ? 'yellow' : 'green',
      risk_score: input.tailings_dam.capacity_pct + Math.round(rand() * 10),
      factors: [
        { requirement: '库水位', status: 'meets', value: `${input.tailings_dam.current_elevation_m}m`, threshold: '< 设计最高洪水位' },
        { requirement: '渗流监测', status: 'meets', value: `${input.tailings_dam.seepage_flow_L_s} L/s`, threshold: '< 30 L/s' },
        { requirement: 'pH值', status: 'meets', value: `${input.tailings_dam.ph_level}`, threshold: '6.0 — 9.0' }
      ]
    },
    gas_assessment: {
      hazard_level: input.gas_levels.ch4_pct > 1.0 || input.gas_levels.co_ppm > 24 ? '高' : '正常',
      risks: [
        input.gas_levels.co_ppm > 24 ? `CO浓度${input.gas_levels.co_ppm}ppm超过24ppm安全限值` : null,
        input.gas_levels.ch4_pct > 1.0 ? `CH4浓度${input.gas_levels.ch4_pct}%超过1.0%预警值` : null,
        input.gas_levels.o2_pct < 19.5 ? `O2浓度${input.gas_levels.o2_pct}%低于19.5%安全下限` : null,
        input.gas_levels.h2s_ppm > 6.6 ? `H2S浓度${input.gas_levels.h2s_ppm}ppm超过6.6ppm安全限值` : null
      ].filter(Boolean) as string[],
      recommendations: [
        input.gas_levels.ch4_pct > 1.0 ? '立即停止作业，撤出人员，加强通风' : '保持当前通风量，每2小时检测一次',
        input.gas_levels.co_ppm > 24 ? '检查爆破后通风时间，确保充分稀释炮烟' : '正常作业，定时检测',
        '传感器每月标定一次，确保数据准确'
      ]
    },
    environmental_risks: {
      fire_risk: input.tailings_dam.ph_level < 6.0 ? '酸性水火灾风险增加' : '低风险',
      flooding_risk: input.environmental.rainfall_mm_24h > 50 ? '暴雨预警，确保排洪系统畅通' : '低风险',
      seismic_risk: input.seismic_events_30d.length > 5 ? '近期微震活动频繁，加强巷道支护' : '低风险',
      recommendations: [
        input.environmental.rainfall_mm_24h > 50 ? '立即启动排洪设备，停止排尾作业' : '正常运行，检查排洪系统',
        input.seismic_events_30d.length > 5 ? '加密支护检查，增设围岩位移观测' : '常规支护维护',
        `尾矿库当前库容${input.tailings_dam.capacity_pct}%，${input.tailings_dam.capacity_pct > 75 ? '加强监测频次' : '正常监测'}`
      ]
    },
    sensor_alerts: input.sensors.filter(s => s.status !== 'normal').map(s => `[${s.status.toUpperCase()}] ${s.sensor_id} (${s.location}): ${s.value}${s.unit}`),
    action_items: [
      { area: '通风系统', actions: ['调整主扇频率', '检查风门状态'], priority: 'high' },
      { area: '监测标定', actions: ['Gas传感器每30天标定', '压力传感器维护'], priority: 'medium' }
    ],
    monitoring_recs: [
      { parameter: 'CH4', frequency: '连续监测', method: '催化燃烧传感器' },
      { parameter: 'CO', frequency: '每班2次', method: '电化学传感器' },
      { parameter: '尾矿库水位', frequency: '每日1次', method: '超声波液位计' }
    ],
    disclaimer: DISCLAIMER_SAFETY
  }
}

function formatSafetyReport(r: SafetyResult): string {
  const lines: string[] = []
  lines.push(`# 矿井安全监测报告 — ${r.mine_name}`)
  lines.push('')
  lines.push(`**矿井ID**: ${r.mine_id} | **安全综合指数**: ${r.overall_safety_index}/100`)
  lines.push('')
  lines.push('## 气体监测')
  lines.push(`- CO: ${r.gas_risk_co} | CH4: ${r.gas_risk_ch4} | H2S: ${r.gas_risk_h2s} | O2: ${r.gas_risk_o2}`)
  lines.push('')
  lines.push(`## 尾矿库风险: ${r.tailings_dam.overall_level.toUpperCase()} (评分:${r.tailings_dam.risk_score})`)
  lines.push('| 检查项 | 状态 | 当前值 | 控制标准 |')
  lines.push('|--------|------|--------|----------|')
  for (const f of r.tailings_dam.factors) lines.push(`| ${f.requirement} | ${f.status} | ${f.value} | ${f.threshold} |`)
  lines.push('')
  lines.push('## 环境风险')
  lines.push(`- 火灾: ${r.environmental_risks.fire_risk}`)
  lines.push(`- 洪水: ${r.environmental_risks.flooding_risk}`)
  lines.push(`- 地震: ${r.environmental_risks.seismic_risk}`)
  lines.push('')
  lines.push('## 行动清单')
  for (const a of r.action_items) lines.push(`- **${a.area}** [${a.priority}]: ${a.actions.join('; ')}`)
  lines.push('')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}


// ==================== TOOL 3: mining_equipment_health ====================

interface EquipmentInput {
  mine_id: string
  mine_name: string
  equipment_fleet: Array<{
    equipment_id: string
    name: string
    type: string
    manufacturer: string
    model: string
    year_manufactured: number
    operating_hours: number
    last_maintenance: string
    condition_score: number
  }>
  production_data: {
    planned_production_hours: number
    actual_production_hours: number
    downtime_hours: number
    output_tonnes: number
    ideal_cycle_time_min: number
    actual_cycle_time_min: number
    good_products_pct: number
  }
  maintenance_history: Array<{ date: string; equipment_id: string; type: string; cost: number; findings: string }>
}

interface BodyPartRisk3 {
  body_part: string
  risk_level: 'low' | 'moderate' | 'high' | 'critical'
}

interface EquipmentHealthResult {
  mine_id: string
  mine_name: string
  fleet_oee: number
  fleet_availability_pct: number
  fleet_performance_pct: number
  fleet_quality_pct: number
  equipment_details: Array<{ equipment_id: string; name: string; oee: number; availability: number; health_status: string; maintenance_due: string; next_action: string }>
  fleet_health_score: number
  critical_equipment: Array<{ equipment_id: string; status: string; action: string }>
  maintenance_forecast: { month: string; scheduled: number; unscheduled: number }[]
  spare_parts_recommendation: string[]
  cost_analysis: { maintenance_cost_ytd: number; cost_per_tonne_reduction_potential: string }
  disclaimer: string
}

function analyzeEquipmentHealth(input_data: string): EquipmentHealthResult {
  const input: EquipmentInput = JSON.parse(input_data)
  const rand = rng(input.mine_id + 'equip')
  const a = input.production_data.actual_production_hours / input.production_data.planned_production_hours
  const p = input.production_data.ideal_cycle_time_min / input.production_data.actual_cycle_time_min
  const availPct = Math.round(a * 10000) / 100
  const perfPct = Math.round(p * 10000) / 100
  const qualityPct = input.production_data.good_products_pct
  const oee = Math.round(a * p * qualityPct * 10000) / 100

  return {
    mine_id: input.mine_id,
    mine_name: input.mine_name,
    fleet_oee: oee,
    fleet_availability_pct: availPct,
    fleet_performance_pct: perfPct,
    fleet_quality_pct: qualityPct,
    equipment_details: input.equipment_fleet.map(eq => ({
      equipment_id: eq.equipment_id,
      name: eq.name,
      oee: Math.round(eq.condition_score * (0.8 + rand() * 0.2) * 100) / 100,
      availability: Math.round((70 + rand() * 25) * 100) / 100,
      health_status: eq.condition_score > 75 ? '良好' : eq.condition_score > 50 ? '一般' : '差',
      maintenance_due: eq.operating_hours > 5000 ? '3个月内' : '6个月内',
      next_action: eq.condition_score > 75 ? '继续监控运行参数' : eq.condition_score > 50 ? '安排月度点检' : '安排停机检修'
    })),
    fleet_health_score: Math.round((availPct * 0.3 + perfPct * 0.3 + qualityPct * 0.4) * 100) / 100,
    critical_equipment: input.equipment_fleet.filter(e => e.condition_score < 60).map(e => ({
      equipment_id: e.equipment_id,
      status: 'condition_score=' + e.condition_score + ' 需关注',
      action: '立即安排专项检查，准备备件'
    })),
    maintenance_forecast: [
      { month: '本月', scheduled: 3, unscheduled: Math.round(rand() * 5) },
      { month: '下月', scheduled: 4, unscheduled: Math.round(rand() * 6) }
    ],
    spare_parts_recommendation: [
      '液压滤芯、密封件(预计下月需求增30%)',
      '变速箱滤芯按小时数更换',
      '按设备运行小时数建立寿命件更换计划'
    ],
    cost_analysis: {
      maintenance_cost_ytd: Math.round(input.maintenance_history.reduce((sum, m) => sum + m.cost, 0)),
      cost_per_tonne_reduction_potential: `预计通过TPM推进，维护成本可降低${Math.round(5 + rand() * 8)}%`
    },
    disclaimer: DISCLAIMER_EQUIPMENT
  }
}

function formatEquipmentReport(r: EquipmentHealthResult): string {
  const lines: string[] = []
  lines.push(`# 采掘设备健康报告 — ${r.mine_name}`)
  lines.push('')
  lines.push(`**设备OEE**: ${r.fleet_oee}% | **可用率**: ${r.fleet_availability_pct}% | **性能率**: ${r.fleet_performance_pct}% | **合格率**: ${r.fleet_quality_pct}%`)
  lines.push(`**车队健康评分**: ${r.fleet_health_score}/100`)
  lines.push('')
  lines.push('## 设备明细')
  lines.push('| 设备编号 | 设备名称 | OEE | 可用率 | 健康状态 | 维护到期 | 建议行动 |')
  lines.push('|----------|----------|-----|--------|----------|----------|----------|')
  for (const d of r.equipment_details) {
    lines.push(`| ${d.equipment_id} | ${d.name} | ${d.oee}% | ${d.availability}% | ${d.health_status} | ${d.maintenance_due} | ${d.next_action} |`)
  }
  lines.push('')
  lines.push('## 关键设备')
  for (const c of r.critical_equipment) lines.push(`- ${c.equipment_id}: ${c.status || '需关注'}`)
  lines.push('')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}


// ==================== TOOL 4: mine_production_scheduler ====================

interface SchedulerInput {
  mine_name: string
  mine_id: string
  monthly_production_targets: { ore_tonnes: number; waste_tonages: number; target_date: string }[]
  ore_zones: Array<{ zone_id: string; lithology: string; au_ppm?: number; cu_pct?: number; tonnes: number }>
  equipment_shifts_per_day: number
  processing_plant_capacity_tonnes_month: number
  market_forecast: { au_spot_usd_oz: number; cu_spot_usd_lb: number }
  blending_criteria: { min_grade: number; max_waste_pct: number; compatible_lithologies: string[] }
}

interface ProductionSchedule {
  mine_id: string
  mine_name: string
  production_plan: Array<{ zone_id: string; month: string; ore_tonnes: number; waste_tonnes: number; grade: string }>
  blend_plan: Array<{ target_grade_pct: number; source_zones: string[]; blend_ratio: string; monthly_tonnes: number }>
  processing_utilization_pct: number
  revenue_projection: { month: string; ore_tonnes: number; au_oz: number; cu_lbs: number; revenue_usd: number }[]
  cost_projection: { month: string; mining_cost_usd: number; processing_cost_usd: number; total_usd: number }[]
  kpi_dashboard: { stripping_ratio: number; productivity_tonnes_per_employee: number; schedule_adherence_pct: number }
  risk_items: string[]
  disclaimer: string
}

function analyzeProduction(input_data: string): ProductionSchedule {
  const input: SchedulerInput = JSON.parse(input_data)
  const rand = rng(input.mine_id + 'prod')
  const plan: Array<{ zone_id: string; month: string; ore_tonnes: number; waste_tonnes: number; grade: string }> = []
  input.ore_zones.forEach((zone, i) => {
    plan.push({
      zone_id: zone.zone_id,
      month: `Month-${i + 1}`,
      ore_tonnes: Math.round(zone.tonnes),
      waste_tonnes: Math.round(zone.tonnes * (2 + rand())),
      grade: zone.au_ppm !== undefined ? `${zone.au_ppm} g/t Au` : `${zone.cu_pct}% Cu`
    })
  })
  const planMonths = input.monthly_production_targets
  return {
    mine_id: input.mine_id,
    mine_name: input.mine_name,
    production_plan: plan,
    blend_plan: [
      { target_grade_pct: 2.5, source_zones: input.ore_zones.map(z => z.zone_id), blend_ratio: '1:1:1', monthly_tonnes: input.processing_plant_capacity_tonnes_month }
    ],
    processing_utilization_pct: Math.round(75 + rand() * 20),
    revenue_projection: planMonths.map(t => ({
      month: t.target_date,
      ore_tonnes: t.ore_tonnes,
      au_oz: Math.round(t.ore_tonnes * 2.5 / 31.1035 * 100) / 100,
      cu_lbs: 0,
      revenue_usd: Math.round(t.ore_tonnes * 2.5 * 1900 / 31.1035)
    })),
    cost_projection: planMonths.map(t => ({
      month: t.target_date,
      mining_cost_usd: Math.round(t.ore_tonnes * (12 + rand() * 8)),
      processing_cost_usd: Math.round(t.ore_tonnes * (15 + rand() * 6)),
      total_usd: Math.round(t.ore_tonnes * (30 + rand() * 10))
    })),
    kpi_dashboard: {
      stripping_ratio: Math.round((planMonths[0].waste_tonages / planMonths[0].ore_tonnes) * 100) / 100,
      productivity_tonnes_per_employee: Math.round(800 + rand() * 400),
      schedule_adherence_pct: Math.round(70 + rand() * 25)
    },
    risk_items: [
      `当前剥采比${(planMonths[0].waste_tonages / planMonths[0].ore_tonnes).toFixed(2)}:1，需监控剥离进度`,
      'Cu品位波动较大，需加强配矿管理',
     'DBT矿石含泥量大，雨季可能影响破碎效率'
    ],
    disclaimer: DISCLAIMER_PRODUCTION
  }
}

function formatProductionReport(r: ProductionSchedule): string {
  const lines: string[] = []
  lines.push(`# 采矿生产调度优化报告 — ${r.mine_name}`)
  lines.push('')
  lines.push(`**剥采比**: ${r.kpi_dashboard.stripping_ratio}:1 | **人效**: ${r.kpi_dashboard.productivity_tonnes_per_employee}t/人 | **计划执行率**: ${r.kpi_dashboard.schedule_adherence_pct}% | **选矿利用率**: ${r.processing_utilization_pct}%`)
  lines.push('')
  lines.push('## 生产计划')
  lines.push('| 采区 | 月份 | 矿石(t) | 废石(t) | 品位 |')
  lines.push('|------|------|---------|---------|------|')
  for (const p of r.production_plan) lines.push(`| ${p.zone_id} | ${p.month} | ${p.ore_tonnes.toLocaleString()} | ${p.waste_tonnes.toLocaleString()} | ${p.grade} |`)
  lines.push('')
  lines.push('## 配矿计划')
  for (const b of r.blend_plan) lines.push(`- 目标品位: ${b.target_grade_pct}% | 来源: ${b.source_zones.join(', ')} | 配比: ${b.blend_ratio} | 月矿量: ${b.monthly_tonnes.toLocaleString()}t`)
  lines.push('')
  lines.push('## 收入预测')
  lines.push('| 月份 | 矿石(t) | Au(oz) | 收入(USD) | 总成本(USD) |')
  lines.push('|------|---------|--------|-----------|-------------|')
  for (const m of r.revenue_projection) {
    const c = r.cost_projection.find(c => c.month === m.month)
    lines.push(`| ${m.month} | ${m.ore_tonnes.toLocaleString()} | ${m.au_oz} | $${m.revenue_usd.toLocaleString()} | $${(c?.total_usd || 0).toLocaleString()} |`)
  }
  lines.push('')
  lines.push('## 风险事项')
  for (const ri of r.risk_items) lines.push(`- ${ri}`)
  lines.push('')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}


// ==================== TOOL 5: mine_environmental_compliance ====================

interface EnvironmentalInput {
  mine_name: string
  mine_id: string
  permit_requirements: { water_discharge: string; air_emissions: string; noise_limits_db: number; reclamation_bond_usd: number }
  monitoring_data: {
    water: Array<{ site: string; ph: number; tss_mg_L: number; heavy_metals: Record<string, number>; flow_L_s: number }>
    air: Array<{ station: string; pm10_ug_m3: number; so2_ug_m3: number; nox_ug_m3: number }>
    noise: Array<{ location: string; day_db: number; night_db: number }>
  }
  reclamation: { total_disturbed_ha: number; reclaimed_ha: number; bond_value_usd: number; completion_target_year: number }
  waste_rock: { total_tonnes: number; acid_generating_pct: number; neutralization_potential: number }
  biodiversity: { protected_species: string[]; offset_required: boolean; offset_area_ha: number }
}

interface ComplianceResult {
  mine_id: string
  mine_name: string
  overall_compliance_score: number
  water_compliance: { status: string; exceedances: string[]; recommendations: string[] }
  air_compliance: { status: string; exceedances: string[]; recommendations: string[] }
  noise_compliance: { status: string; exceedances: string[]; recommendations: string[] }
  reclamation_status: { completion_pct: number; bond_adequacy: string; plan: string[] }
  waste_rock_management: { risk_level: string; recommendations: string[] }
  biodiversity_offset: { status: string; requirements: string[] }
  action_items: Array<{ priority: string; action: string; deadline: string }>
  disclaimer: string
}

function analyzeEnvironmental(input_data: string): ComplianceResult {
  const input: EnvironmentalInput = JSON.parse(input_data)
  const rand = rng(input.mine_id + 'env')
  const waterExceedances: string[] = []
  input.monitoring_data.water.forEach(w => {
    if (w.ph < 6.5 || w.ph > 9.0) waterExceedances.push(`${w.site}: pH ${w.ph} 超出6.5-9.0范围`)
    if (w.tss_mg_L > 50) waterExceedances.push(`${w.site}: TSS ${w.tss_mg_L}mg/L 超过50mg/L限值`)
  })
  const airExceedances: string[] = []
  input.monitoring_data.air.forEach(a => {
    if (a.pm10_ug_m3 > 150) airExceedances.push(`${a.station}: PM10 ${a.pm10_ug_m3}ug/m3 超过150ug/m3限值`)
  })
  const noiseExceedances: string[] = []
  input.monitoring_data.noise.forEach(n => {
    if (n.day_db > input.permit_requirements.noise_limits_db) noiseExceedances.push(`${n.location}: 昼间${n.day_db}dB 超过${input.permit_requirements.noise_limits_db}dB限值`)
  })
  const reclamationPct = Math.round((input.reclamation.reclaimed_ha / input.reclamation.total_disturbed_ha) * 10000) / 100
  return {
    mine_id: input.mine_id,
    mine_name: input.mine_name,
    overall_compliance_score: Math.round(70 + rand() * 25),
    water_compliance: {
      status: waterExceedances.length > 0 ? '部分超标' : '达标',
      exceedances: waterExceedances,
      recommendations: waterExceedances.length > 0 ? ['加强废水处理设施维护', '增设pH调节系统', '加密监测频次'] : ['保持当前处理效果', '定期维护处理设施']
    },
    air_compliance: {
      status: airExceedances.length > 0 ? '部分超标' : '达标',
      exceedances: airExceedances,
      recommendations: airExceedances.length > 0 ? ['增加洒水降尘频次', '检查除尘设备效率', '优化爆破参数'] : ['保持当前控制效果', '定期校准监测设备']
    },
    noise_compliance: {
      status: noiseExceedances.length > 0 ? '部分超标' : '达标',
      exceedances: noiseExceedances,
      recommendations: noiseExceedances.length > 0 ? ['安装隔声屏障', '调整高噪声作业时间', '设备减振处理'] : ['保持当前控制效果', '定期维护设备']
    },
    reclamation_status: {
      completion_pct: reclamationPct,
      bond_adequacy: input.reclamation.bond_value_usd > 5000000 ? '充足' : '需补充',
      plan: [
        `当前复垦率${reclamationPct}%，目标${input.reclamation.completion_target_year}年达到100%`,
        '制定年度复垦计划，分阶段实施',
        '建立复垦效果监测体系'
      ]
    },
    waste_rock_management: {
      risk_level: input.waste_rock.acid_generating_pct > 30 ? '高风险' : '中等风险',
      recommendations: [
        `酸性废石占比${input.waste_rock.acid_generating_pct}%，需覆盖处理`,
        '建设废石场淋溶液收集系统',
        '制定废石场闭坑计划'
      ]
    },
    biodiversity_offset: {
      status: input.biodiversity.offset_required ? '需实施' : '无需',
      requirements: input.biodiversity.offset_required ? [
        `需补偿${input.biodiversity.offset_area_ha}公顷生态面积`,
        '制定生物多样性管理计划',
        '开展定期生态监测'
      ] : ['无特殊要求']
    },
    action_items: [
      { priority: '高', action: '修复废水pH异常', deadline: '7日内' },
      { priority: '中', action: '提交季度环境监测报告', deadline: '30日内' },
      { priority: '低', action: '更新复垦方案', deadline: '90日内' }
    ],
    disclaimer: DISCLAIMER_ENVIRONMENT
  }
}

function formatEnvironmentalReport(r: ComplianceResult): string {
  const lines: string[] = []
  lines.push(`# 矿山环保合规报告 — ${r.mine_name}`)
  lines.push('')
  lines.push(`**合规综合评分**: ${r.overall_compliance_score}/100 | **复垦率**: ${r.reclamation_status.completion_pct}%`)
  lines.push('')
  lines.push('## 水合规')
  lines.push(`- 状态: ${r.water_compliance.status}`)
  for (const e of r.water_compliance.exceedances) lines.push(`  - 超标: ${e}`)
  for (const rec of r.water_compliance.recommendations) lines.push(`  - 建议: ${rec}`)
  lines.push('')
  lines.push('## 大气合规')
  lines.push(`- 状态: ${r.air_compliance.status}`)
  for (const e of r.air_compliance.exceedances) lines.push(`  - 超标: ${e}`)
  lines.push('')
  lines.push('## 噪声合规')
  lines.push(`- 状态: ${r.noise_compliance.status}`)
  for (const e of r.noise_compliance.exceedances) lines.push(`  - 超标: ${e}`)
  lines.push('')
  lines.push('## 固废管理')
  lines.push(`- 风险等级: ${r.waste_rock_management.risk_level}`)
  for (const rec of r.waste_rock_management.recommendations) lines.push(`  - ${rec}`)
  lines.push('')
  lines.push('## 行动清单')
  for (const a of r.action_items) lines.push(`- [${a.priority}] ${a.action} (${a.deadline})`)
  lines.push('')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}


// ==================== TOOL 6: mineral_processing_optimizer ====================

interface ProcessingInput {
  plant_name: string
  mine_id: string
  ore_characteristics: { au_head_gram_t: number; cu_head_pct: number; liberation_size_um: number; hardness_kWh_t: number; sulfur_pct: number }
  circuit_configuration: string
  operating_params: {
    feed_rate_tph: number
    pulp_density_pct: number
    pH: number
    reagent_doses: Array<{ reagent: string; dose_g_t: number; cost_per_kg: number }>
    flotation_time_min: number
    temperature_c: number
  }
  performance_metrics: { au_recovery_pct: number; cu_recovery_pct: number; concentrate_grade_au_g_t: number; concentrate_grade_cu_pct: number; water_recovery_pct: number }
  power_consumption_kWh_t: number
  cost_structure: { reagent_cost_pct: number; energy_cost_pct: number; labor_cost_pct: number }
}

interface OptimizationResult {
  plant_name: string
  mine_id: string
  current_recovery: { au_pct: number; cu_pct: number }
  optimized_recovery: { au_pct: number; cu_pct: number; estimated_improvement_pct: number }
  recommended_ore_blend: { zone: string; percentage: number; grade: string }[]
  reagent_optimization: Array<{ reagent: string; current_dose: number; recommended_dose: number; saving_pct: number }>
  throughput_optimization: { current_utilization_pct: number; recommended_utilization_pct: number; target_tph: number }
  energy_saving_potential_pct: number
  cost_reduction_annual_usd: number
  implementation_roadmap: Array<{ phase: string; action_timeline: string; cost_saving_pct: number }>
  disclaimer: string
}

function analyzeProcessing(input_data: string): OptimizationResult {
  const input: ProcessingInput = JSON.parse(input_data)
  const rand = rng(input.mine_id + 'processing')
  return {
    plant_name: input.plant_name,
    mine_id: input.mine_id,
    current_recovery: { au_pct: input.performance_metrics.au_recovery_pct, cu_pct: input.performance_metrics.cu_recovery_pct },
    optimized_recovery: { au_pct: Math.round((input.performance_metrics.au_recovery_pct + 2 + rand() * 3) * 100) / 100, cu_pct: Math.round((input.performance_metrics.cu_recovery_pct + 1.5 + rand() * 2.5) * 100) / 100, estimated_improvement_pct: Math.round((2 + rand() * 3) * 100) / 100 },
    recommended_ore_blend: [
      { zone: '高品位矿', percentage: 60, grade: `${(input.ore_characteristics.au_head_gram_t * 1.3).toFixed(2)} g/t Au` },
      { zone: '低品位矿', percentage: 30, grade: `${(input.ore_characteristics.au_head_gram_t * 0.7).toFixed(2)} g/t Au` },
      { zone: '氧化矿', percentage: 10, grade: `${(input.ore_characteristics.au_head_gram_t * 0.9).toFixed(2)} g/t Au` }
    ],
    reagent_optimization: input.operating_params.reagent_doses.map(r => ({
      reagent: r.reagent,
      current_dose: r.dose_g_t,
      recommended_dose: Math.round((r.dose_g_t * (0.85 + rand() * 0.1)) * 100) / 100,
      saving_pct: Math.round((1 - 0.85 - rand() * 0.1) * 100)
    })),
    throughput_optimization: { current_utilization_pct: Math.round(input.operating_params.feed_rate_tph / 350 * 100), recommended_utilization_pct: Math.round(85 + rand() * 10), target_tph: 350 },
    energy_saving_potential_pct: Math.round(8 + rand() * 12),
    cost_reduction_annual_usd: Math.round(30000 + rand() * 100000),
    implementation_roadmap: [
      { phase: '快速优化', action_timeline: '1-2周', cost_saving_pct: 3 },
      { phase: '设备改造', action_timeline: '4-8周', cost_saving_pct: 5 },
      { phase: '流程再造', action_timeline: '12-16周', cost_saving_pct: 7 }
    ],
    disclaimer: DISCLAIMER_PROCESSING
  }
}

function formatProcessingReport(r: OptimizationResult): string {
  const lines: string[] = []
  lines.push(`# 选矿优化报告 — ${r.plant_name}`)
  lines.push('')
  lines.push(`**当前回收率**: Au ${r.current_recovery.au_pct}% / Cu ${r.current_recovery.cu_pct}% | **优化后回收率**: Au ${r.optimized_recovery.au_pct}% / Cu ${r.optimized_recovery.cu_pct}% | **提升**: ${r.optimized_recovery.estimated_improvement_pct}%`)
  lines.push('')
  lines.push('## 矿石配比')
  lines.push('| 矿源 | 比例 | 品位 |')
  lines.push('|------|------|------|')
  for (const b of r.recommended_ore_blend) lines.push(`| ${b.zone} | ${b.percentage}% | ${b.grade} |`)
  lines.push('')
  lines.push('## 药剂用量优化')
  lines.push('| 药剂 | 当前用量(g/t) | 推荐用量(g/t) | 节省% |')
  lines.push('|------|-------------|-------------|-------|')
  for (const ro of r.reagent_optimization) lines.push(`| ${ro.reagent} | ${ro.current_dose} | ${ro.recommended_dose} | ${ro.saving_pct}% |`)
  lines.push('')
  lines.push(`## 节能潜力: 能耗可降低 ${r.energy_saving_potential_pct}%`)
  lines.push(`## 年度节约潜力: $${r.cost_reduction_annual_usd.toLocaleString()}`)
  lines.push('')
  lines.push('## 实施路径')
  for (const roadmap of r.implementation_roadmap) lines.push(`- ${roadmap.phase} (${roadmap.action_timeline}): 节约${roadmap.cost_saving_pct}%`)
  lines.push('')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}


// ==================== TOOL 7: mining_cost_analyzer ====================

interface CostAnalyzerInput {
  mine_name: string
  mine_id: string
  production: { ore_tonnes: number; waste_tonnes: number; au_oz_produced: number; cu_lbs_produced: number }
  costs: { mining: number; processing: number; ga: number; freight_refining: number; ta: number; by_product_credits: number }
  key_inputs: { diesel_litres: number; power_kwh: number; explosives_kg: number; tyres_sets: number; steel_consumable_kg: number; water_m3: number }
  benchmarks: { cost_per_tonne_industry_avg: number; cost_per_oz_industry_avg: number; stripping_ratio_avg: number }
  current_stripping_ratio: number; au_price_forecast: number
}

interface OptimizationOpportunity {
  area: string
  current_cost_saving_potential: number
  action_timeline: string
}

interface CostAnalyzerResult {
  mine_id: string
  mine_name: string
  unit_cost_per_tonne: number
  unit_cost_per_oz: number
  cost_breakdown: Array<{ category: string; cost_usd: number; pct: number }>
  strip_ratio_analysis: { current: number; industry_avg: number; waste_reduction_potential_tonnes: number; cost_saving_usd: number }
  benchmark_comparison: { vs_industry_pct: number; gap_analysis: string; rank: string }
  optimization_opportunities: OptimizationOpportunity[]
  forecast_annual_saving: number
  scenario_analysis: { optimistic_saving: number; base_saving: number; pessimistic_saving: number }
  disclaimer: string
}

function analyzeCosts(input_data: string): CostAnalyzerResult {
  const input: CostAnalyzerInput = JSON.parse(input_data)
  const rand = rng(input.mine_id + 'cost')
  const ucTonnes = (input.costs.mining + input.costs.processing + input.costs.ga) / input.production.ore_tonnes
  const stripSaving = input.production.waste_tonnes * 0.15 * 3.5
  return {
    mine_id: input.mine_id,
    mine_name: input.mine_name,
    unit_cost_per_tonne: Math.round(ucTonnes * 100) / 100,
    unit_cost_per_oz: Math.round((input.costs.mining + input.costs.processing + input.costs.ga) / input.production.au_oz_produced * 100) / 100,
    cost_breakdown: [
      { category: '采矿', cost_usd: input.costs.mining, pct: Math.round(input.costs.mining / (input.costs.mining + input.costs.processing + input.costs.ga) * 100) },
      { category: '选矿', cost_usd: input.costs.processing, pct: Math.round(input.costs.processing / (input.costs.mining + input.costs.processing + input.costs.ga) * 100) },
      { category: '管理费GA', cost_usd: input.costs.ga, pct: Math.round(input.costs.ga / (input.costs.mining + input.costs.processing + input.costs.ga) * 100) }
    ],
    strip_ratio_analysis: { current: input.current_stripping_ratio, industry_avg: input.benchmarks.stripping_ratio_avg, waste_reduction_potential_tonnes: Math.round(input.production.waste_tonnes * 0.1), cost_saving_usd: Math.round(stripSaving) },
    benchmark_comparison: { vs_industry_pct: Math.round(ucTonnes / input.benchmarks.cost_per_tonne_industry_avg * 100 - 100), gap_analysis: `当前成本${ucTonnes < input.benchmarks.cost_per_tonne_industry_avg ? '低于' : '高于'}行业均值${Math.abs(ucTonnes - input.benchmarks.cost_per_tonne_industry_avg).toFixed(2)}/t`, rank: ucTonnes < input.benchmarks.cost_per_tonne_industry_avg * 0.9 ? '领先' : ucTonnes < input.benchmarks.cost_per_tonne_industry_avg ? '中等' : '需改善' },
    optimization_opportunities: [
      { area: '柴油消耗', current_cost_saving_potential: input.key_inputs.diesel_litres * 0.1 * 1.2, action_timeline: 'Q2 2026' },
      { area: '电力消耗', current_cost_saving_potential: input.key_inputs.power_kwh * 0.08 * 0.12, action_timeline: 'Q4 2026' },
      { area: '轮胎消耗', current_cost_saving_potential: 80000, action_timeline: '持续' },
      { area: '炸药单耗', current_cost_saving_potential: 30000, action_timeline: 'Q2 2026' }
    ],
    forecast_annual_saving: Math.round(800000 + rand() * 500000),
    scenario_analysis: { optimistic_saving: Math.round((800000 + rand() * 500000) * 1.5), base_saving: Math.round(800000 + rand() * 500000), pessimistic_saving: Math.round((800000 + rand() * 500000) * 0.6) },
    disclaimer: DISCLAIMER_COST
  }
}

function formatCostReport(r: CostAnalyzerResult): string {
  const lines: string[] = []
  lines.push(`# 采矿成本分析报告 — ${r.mine_name}`)
  lines.push('')
  lines.push(`**单位成本**: $${r.unit_cost_per_tonne.toFixed(2)}/t | **单位Au成本**: $${r.unit_cost_per_oz.toFixed(2)}/oz | **行业对比**: ${r.benchmark_comparison.rank} (偏离行业${r.benchmark_comparison.vs_industry_pct}%)`)
  lines.push('')
  lines.push('## 成本构成')
  lines.push('| 类别 | 金额(USD) | 占比 |')
  lines.push('|------|-----------|------|')
  for (const c of r.cost_breakdown) lines.push(`| ${c.category} | $${c.cost_usd.toLocaleString()} | ${c.pct}% |`)
  lines.push('')
  lines.push('## 剥采比分析')
  lines.push(`- 当前: ${r.strip_ratio_analysis.current}:1 | 行业均值: ${r.strip_ratio_analysis.industry_avg}:1 | 废石减量潜力: ${r.strip_ratio_analysis.waste_reduction_potential_tonnes.toLocaleString()}t | 节约潜力: $${r.strip_ratio_analysis.cost_saving_usd.toLocaleString()}`)
  lines.push('')
  lines.push('## 优化机会')
  lines.push('| 领域 | 节约潜力(USD) | 时间线 |')
  lines.push('|------|-------------|--------|')
  for (const o of r.optimization_opportunities) lines.push(`| ${o.area} | $${o.current_cost_saving_potential.toLocaleString()} | ${o.action_timeline} |`)
  lines.push('')
  lines.push(`> ${r.disclaimer}`)
  return lines.join('\n')
}


// ==================== TOOL 8: smart_ventilation_controller ====================

interface VentilationInput {
  mine_name: string
  mine_id: string
  mine_type: 'underground' | 'open_pit'
  shaft_config: { main_intake_depth_m: number; main_return_depth_m: number; airways_count: number; cross_section_area_m2: number }
  fans: Array<{ fan_id: string; type: string; power_kw: number; airflow_m3_s: number; static_pa: number; status: string; position: string }>
  gas_zones: Array<{ zone_name: string; co2_ppm: number; ch4_ppm: number; o2_pct: number; temp_c: number; humidity_pct: number; airflow_required_m3_s: number }>
  power_tariff: { peak_rate_per_kWh: number; offpeak_rate_per_kWh: number; peak_hours: string }
  production_zones: Array<{ name: string; depth_m: number; active_shifts: number; airflow_required_m3_s: number; current_flow_m3_s: number }>
  harmonic_distortion_pct: number
}

interface VFDFan {
  fan_id: string
  potential_saving_pct: number
  payback_years: number
}

interface VentilationResult {
  mine_id: string
  mine_name: string
  total_power_consumption_kw: number
  airflow_distribution: Array<{ zone: string; required_m3_s: number; allocated_m3_s: number; deviation_pct: number }>
  ventilation_efficiency: number
  optimization: { fan_recommendations: string[]; vfd_installation: VFDFan[]; airflow_rebalancing: string[] }
  power_saving_potential: { annual_kwh_saved: number; cost_saving_usd: number; co2_reduction_tonnes: number }
  control_strategy: Array<{ strategy: string; description: string; implementation: string; priority: string }>
  risk_issues: string[]
  disclaimer: string
}

function analyzeVentilation(input_data: string): VentilationResult {
  const input: VentilationInput = JSON.parse(input_data)
  const rand = rng(input.mine_id + 'vent')
  const totalKw = input.fans.filter(f => f.status === 'running').reduce((s, f) => s + f.power_kw, 0)
  const eff = Math.round(70 + rand() * 25)
  return {
    mine_id: input.mine_id,
    mine_name: input.mine_name,
    total_power_consumption_kw: totalKw,
    airflow_distribution: input.production_zones.map(z => ({ zone: z.name, required_m3_s: z.airflow_required_m3_s, allocated_m3_s: z.current_flow_m3_s, deviation_pct: Math.round(rand() * 15 - 5) })),
    ventilation_efficiency: eff,
    optimization: {
      fan_recommendations: input.fans.filter(f => f.status === 'running').slice(0, 2).map(f => '建议安装变频器于' + f.fan_id),
      vfd_installation: input.fans.filter(f => f.status === 'running').slice(0, 2).map(f => ({ fan_id: f.fan_id, potential_saving_pct: Math.round(20 + rand() * 30), payback_years: 2.5 + rand() })),
      airflow_rebalancing: ['按需通风：非作业时段降低风量30%', '优化风门状态，减少漏风率']
    },
    power_saving_potential: { annual_kwh_saved: Math.round(totalKw * 0.25 * 8000), cost_saving_usd: Math.round(totalKw * 0.25 * 8000 * 0.12), co2_reduction_tonnes: Math.round(totalKw * 0.25 * 8000 * 0.0005) },
    control_strategy: [
      { strategy: '变频驱动(VFD)', description: '根据用风需求实时调节风机转速', implementation: '安装变频器+PLC闭环控制', priority: 'high' },
      { strategy: 'ON/OFF按需通风', description: '非作业时段降风', implementation: '基于作业计划自动启停', priority: 'high' },
      { strategy: '风量平衡分配', description: '网络解算+监测反馈', implementation: '安装风门执行器自动调节', priority: 'medium' },
      { strategy: '高峰时段电量管理', description: '降低电力成本', implementation: '错峰运行策略', priority: 'medium' }
    ],
    risk_issues: [
      '第3扇风机振动偏高(5.2mm/s)，建议进行动平衡检查',
      '六处气动风门执行器延迟>30s，需检修'
    ],
    disclaimer: DISCLAIMER_VENTILATION
  }
}

function formatVentilationReport(r: VentilationResult): string {
  const lines: string[] = []
  lines.push('# 矿井通风优化报告 -- ' + r.mine_name)
  lines.push('')
  lines.push('**总能耗**: ' + r.total_power_consumption_kw + 'kW | **通风效率**: ' + r.ventilation_efficiency + '% | **年节电潜力**: ' + r.power_saving_potential.annual_kwh_saved.toLocaleString() + 'kWh / $' + r.power_saving_potential.cost_saving_usd.toLocaleString() + ' / ' + r.power_saving_potential.co2_reduction_tonnes + 't CO2')
  lines.push('')
  lines.push('## 风量分配')
  lines.push('| 区域 | 需风量(m3/s) | 实分(m3/s) | 偏差% |')
  lines.push('|------|-------------|-----------|-------|')
  for (const a of r.airflow_distribution) lines.push('| ' + a.zone + ' | ' + a.required_m3_s + ' | ' + a.allocated_m3_s + ' | ' + a.deviation_pct + '% |')
  lines.push('')
  lines.push('## 变频改造建议')
  lines.push('| 风机 | 节电潜力% | 投资回收期(年) |')
  lines.push('|------|----------|-------------|')
  for (const v of r.optimization.vfd_installation) lines.push('| ' + v.fan_id + ' | ' + v.potential_saving_pct + '% | ' + v.payback_years.toFixed(1) + ' |')
  lines.push('')
  lines.push('## 控制策略')
  lines.push('| 策略 | 描述 | 实施方式 | 优先级 |')
  lines.push('|------|------|----------|--------|')
  for (const s of r.control_strategy) lines.push('| ' + s.strategy + ' | ' + s.description + ' | ' + s.implementation + ' | ' + s.priority + ' |')
  lines.push('')
  lines.push('> ' + r.disclaimer)
  return lines.join('\n')
}


// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: mineral_exploration_ai - 矿产勘探靶区预测与品位评估
  tools.register(defineTool({
    name: 'mineral_exploration_ai',
    description: 'Mineral exploration targeting with grade estimation | Predicts prospective target zones, estimates ore grades from drilling and geochemical data, and provides multi-criteria analysis for deposit types.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: project_id, project_name, deposit_type, exploration_stage, geological_data{rock_types, alteration_zones[], structures[], lithological_contacts[]}, geochemical_data{soil_samples[], rock_chip_samples[], stream_sediment[], anomaly_thresholds}, geophysical_data{magnetic?, IP?, gravity?, EM?}, drilling_data{total_meters, n_holes, intervals[], best_intercepts[]}, regional_deposits[], resource_target{metal, minimum_grade, minimum_tonnage}' } },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatExplorationReport(analyzeExploration(args.input_data)) }
  }))

  // Tool 2: mine_safety_monitor - 矿井安全监测与尾矿库风险预警
  tools.register(defineTool({
    name: 'mine_safety_monitor',
    description: 'Mine safety monitoring with tailings dam risk alerts | Monitors gas levels, tailings dam stability, seismic events, and provides comprehensive safety assessments and recommendations.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: mine_id, mine_name, mine_type, sensors[], tailings_dam{dam_height_m, current_elevation_m, capacity_pct, seepage_flow_L_s, ph_level, piezometer_readings[]}, gas_levels{co_ppm, ch4_pct, h2s_ppm, o2_pct}, environmental{rainfall_mm_24h, temperature_c, wind_speed_ms}, seismic_events_30d[], last_inspection, personnel_count' } },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatSafetyReport(analyzeSafety(args.input_data)) }
  }))

  // Tool 3: mining_equipment_health - 采掘设备预测性维护与OEE分析
  tools.register(defineTool({
    name: 'mining_equipment_health',
    description: 'Mining equipment predictive maintenance with OEE analysis | Calculates fleet OEE, equipment availability/performance/quality metrics, provides maintenance scheduling and spare parts recommendations.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: mine_id, mine_name, equipment_fleet[]{equipment_id, name, type, manufacturer, model, year_manufactured, operating_hours, last_maintenance, condition_score}, production_data{planned/actual_production_hours, downtime_hours, output_tonnes, ideal/actual_cycle_time_min, good_products_pct}, maintenance_history[]{date, equipment_id, type, cost, findings}' } },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatEquipmentReport(analyzeEquipmentHealth(args.input_data)) }
  }))

  // Tool 4: mine_production_scheduler - 采矿生产计划与配矿优化
  tools.register(defineTool({
    name: 'mine_production_scheduler',
    description: 'Mine production scheduling with ore blending optimization | Generates monthly production plans, optimizes ore blending ratios by grade and lithology, forecasts revenue, and tracks KPIs.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: mine_name, mine_id, monthly_production_targets[]{ore_tonnes, waste_tonages, target_date}, ore_zones[]{zone_id, lithology, au_ppm?, cu_pct?, tonnes}, equipment_shifts_per_day, processing_plant_capacity_tonnes_month, market_forecast{au_spot_usd_oz, cu_spot_usd_lb}, blending_criteria{min_grade, max_waste_pct, compatible_lithologies[]}' } },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatProductionReport(analyzeProduction(args.input_data)) }
  }))

  // Tool 5: mine_environmental_compliance - 矿山环保合规与复垦规划
  tools.register(defineTool({
    name: 'mine_environmental_compliance',
    description: 'Mining environmental compliance with reclamation planning | Monitors water/air/noise quality against permit limits, tracks reclamation progress, assesses waste rock risk and biodiversity offsets.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: mine_name, mine_id, permit_requirements{water_discharge, air_emissions, noise_limits_db, reclamation_bond_usd}, monitoring_data{water[site, ph, tss_mg_L, heavy_metals, flow_L_s], air[station, pm10, so2, nox], noise[location, day_db, night_db]}, reclamation{total_disturbed_ha, reclaimed_ha, bond_value_usd, completion_target_year}, waste_rock{total_tonnes, acid_generating_pct, neutralization_potential}, biodiversity{protected_species[], offset_required, offset_area_ha}' } },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatEnvironmentalReport(analyzeEnvironmental(args.input_data)) }
  }))

  // Tool 6: mineral_processing_optimizer - 选矿回收率优化与药剂用量控制
  tools.register(defineTool({
    name: 'mineral_processing_optimizer',
    description: 'Mineral processing recovery optimization with reagent control | Analyzes flotation performance, recommends reagent dose optimization, blending, throughput maximization, and energy reduction strategies.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: plant_name, mine_id, ore_characteristics{au_head_gram_t, cu_head_pct, liberation_size_um, hardness_kWh_t, sulfur_pct}, circuit_configuration, operating_params{feed_rate_tph, pulp_density_pct, pH, reagent_doses[]{reagent, dose_g_t, cost_per_kg}, flotation_time_min, temperature_c}, performance_metrics{au_recovery_pct, cu_recovery_pct, concentrate_grade_au_g_t, concentrate_grade_cu_pct, water_recovery_pct}, power_consumption_kWh_t, cost_structure{reagent_cost_pct, energy_cost_pct, labor_cost_pct}' } },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatProcessingReport(analyzeProcessing(args.input_data)) }
  }))

  // Tool 7: mining_cost_analyzer - 采矿成本分析与剥采比优化
  tools.register(defineTool({
    name: 'mining_cost_analyzer',
    description: 'Mining cost analysis with strip ratio optimization | Calculates unit costs, benchmarks against industry averages, identifies optimization opportunities, and forecasts cost savings.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: mine_name, mine_id, production{ore_tonnes, waste_tonnes, au_oz_produced, cu_lbs_produced}, costs{mining, processing, ga, freight_refining, ta, by_product_credits}, key_inputs{diesel_litres, power_kwh, explosives_kg, tyres_sets, steel_consumable_kg, water_m3}, benchmarks{cost_per_tonne_industry_avg, cost_per_oz_industry_avg, stripping_ratio_avg}, current_stripping_ratio, au_price_forecast' } },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatCostReport(analyzeCosts(args.input_data)) }
  }))

  // Tool 8: smart_ventilation_controller - 矿井通风网络与能耗优化
  tools.register(defineTool({
    name: 'smart_ventilation_controller',
    description: 'Mine ventilation network optimization with energy savings | Analyzes fan performance, VFD energy savings, airflow distribution, and provides smart control strategies.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: mine_name, mine_id, mine_type, shaft_config{main_intake/return_depth_m, airways_count, cross_section_area_m2}, fans[]{fan_id, type, power_kw, airflow_m3_s, static_pa, status, position}, gas_zones[]{zone_name, co2_ppm, ch4_ppm, o2_pct, temp_c, humidity_pct, airflow_required_m3_s}, power_tariff{peak_rate_per_kWh, offpeak_rate_per_kWh, peak_hours}, production_zones[]{name, depth_m, active_shifts, airflow_required_m3_s, current_flow_m3_s}, harmonic_distortion_pct' } },
    output: { schema: { type: 'string' as const }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text' as const, text: value as string }] },
    async execute(args: { input_data: string }) { return formatVentilationReport(analyzeVentilation(args.input_data)) }
  }))

  console.log('[dsh-tool-mineaiagent] Loaded v' + VERSION + ' -- Smart Mining AI Agent with 8 tools')
  console.log('  Tools: mineral_exploration_ai, mine_safety_monitor, mining_equipment_health, mine_production_scheduler, mine_environmental_compliance, mineral_processing_optimizer, mining_cost_analyzer, smart_ventilation_controller')
}
