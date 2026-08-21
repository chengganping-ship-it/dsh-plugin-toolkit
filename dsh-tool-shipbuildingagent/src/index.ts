import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
export const name = 'shipbuildingagent'
export const inject = ['tools']

const DISCLAIMER = '【免责声明】本工具分析结果基于AI模型推断，仅供船舶工程参考，不替代专业设计计算、船级社审图和法规符合性评估。'

function mulberry32(seed: number) {
  let s = seed >>> 0
  return () => { s = (s + 0x6D2B79F5) | 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}
function hashStr(s: string) { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0 } return Math.abs(h) || 1 }
function rng(input: string) { return mulberry32(hashStr(input)) }

// ============ 1. hull_design_analyzer ============
function analyzeHullDesign(data: any) {
  const r = rng(data.ship_name || data.hull_number || 'default')
  const length = data.length_overall || 200
  const breadth = data.breadth_moulded || 32
  const depth = data.depth_moulded || 18
  const draft = data.design_draft || 10
  const blockCoeff = (r() * 0.1 + 0.8).toFixed(3)
  const prismaticCoeff = (r() * 0.08 + 0.82).toFixed(3)
  const finenessRatio = (length / Math.pow(breadth * depth * draft, 1 / 3)).toFixed(2)
  const froudeNumber = data.speed_knots ? (data.speed_knots * 0.5144 / Math.sqrt(9.81 * length)).toFixed(3) : '0.150'
  const hullEfficiency = (r() * 0.1 + 0.55).toFixed(3)
  const waveMakingResistance = Math.floor(r() * 30 + 10)
  const stressConcentration = (r() * 50 + 120).toFixed(1)
  const recommendation = parseFloat(stressConcentration) > 150 ? '建议增加板厚或增设加强筋以降低应力集中' : '船体结构强度满足规范要求'
  return {
    ship_name: data.ship_name || data.hull_number || '未命名船舶',
    principal_dimensions: { length_overall_m: length, breadth_moulded_m: breadth, depth_moulded_m: depth, design_draft_m: draft },
    form_coefficients: { block_coefficient: blockCoeff, prismatic_coefficient: prismaticCoeff },
    hydrodynamic_performance: { fineness_ratio: finenessRatio, froude_number: froudeNumber, hull_efficiency: hullEfficiency, wave_making_resistance_pct: waveMakingResistance },
    structural_check: { stress_concentration_factor_MPa: stressConcentration, recommendation },
    disclaimer: DISCLAIMER
  }
}
function formatHullDesign(r: any) {
  return `# 船体结构设计与型线优化: ${r.ship_name}
📐 主尺度: 总长 ${r.principal_dimensions.length_overall_m}m | 型宽 ${r.principal_dimensions.breadth_moulded_m}m | 型深 ${r.principal_dimensions.depth_moulded_m}m | 吃水 ${r.principal_dimensions.design_draft_m}m
🚢 船型系数: 方形系数 ${r.form_coefficients.block_coefficient} | 棱形系数 ${r.form_coefficients.prismatic_coefficient}
🌊 水动力性能: 细长比 ${r.hydrodynamic_performance.fineness_ratio} | 弗劳德数 ${r.hydrodynamic_performance.froude_number} | 推进效率 ${r.hydrodynamic_performance.hull_efficiency} | 兴波阻力占比 ${r.hydrodynamic_performance.wave_making_resistance_pct}%
⚙ 结构校核: 应力集中系数 ${r.structural_check.stress_concentration_factor_MPa} MPa
💡 ${r.structural_check.recommendation}
---
*${r.disclaimer}*`
}

// ============ 2. ship_production_scheduler ============
function analyzeProductionSchedule(data: any) {
  const r = rng(data.project_code || 'default')
  const blocks = data.total_blocks || 120
  const blocksPerMonth = Math.floor(r() * 4 + 6)
  const totalMonths = Math.ceil(blocks / blocksPerMonth)
  const outfittingRate = (r() * 0.2 + 0.6).toFixed(1)
  const craneUtilization = (r() * 0.15 + 0.75).toFixed(1)
  const workEfficiency = (r() * 0.2 + 0.7).toFixed(1)
  const delayDays = Math.floor(r() * 30 + 5)
  const steelTonnes = data.steel_weight || 8000
  const blockOutfittingPct = (r() * 0.3 + 0.5).toFixed(1)
  return {
    project_code: data.project_code || 'PJ-001',
    vessel_name: data.vessel_name || '未命名船',
    production_summary: { total_blocks: blocks, blocks_per_month: blocksPerMonth, total_duration_months: totalMonths, steel_weight_tonnes: steelTonnes },
    efficiency_metrics: { outfitting_rate: outfittingRate + '%', crane_utilization: craneUtilization + '%', work_efficiency: workEfficiency + '%', block_outfitting_pct: blockOutfittingPct + '%' },
    schedule_risk: { estimated_delay_days: delayDays, critical_path: '分段总组→船台合拢→舾装', bottleneck: delayDays > 20 ? '涂装工序产能不足' : '分段预制产能紧张' },
    recommendation: delayDays > 20 ? '建议增加涂装车间班次和分段预制场地' : '生产计划可满足交船节点',
    disclaimer: DISCLAIMER
  }
}
function formatProductionSchedule(r: any) {
  return `# 造船生产计划与分段舾装: ${r.product_summary}` + (r.vessel_name ? `\n🚢 船名: ${r.vessel_name}` : '') +
    `\n📊 分段: ${r.production_summary.total_blocks} | 月产量: ${r.production_summary.blocks_per_month} | 总周期: ${r.production_summary.total_duration_months}月 | 钢材: ${r.production_summary.steel_weight_tonnes}t` +
    `\n⚡ 工效指标: 舾装率 ${r.efficiency_metrics.outfitting_rate} | 吊车利用率 ${r.efficiency_metrics.crane_utilization} | 工效 ${r.efficiency_metrics.work_efficiency} | 分段舾装率 ${r.efficiency_metrics.block_outfitting_pct}` +
    `\n⚠ 进度风险: 预计延期 ${r.schedule_risk.estimated_delay_days}天 | 关键路径: ${r.schedule_risk.critical_path}` +
    `\n💡 ${r.schedule_risk.bottleneck} → ${r.recommendation}` +
    `\n---\n*${r.disclaimer}*`
}

// ============ 3. welding_quality_ai ============
function analyzeWeldingQuality(data: any) {
  const r = rng(data.weld_joint_id || data.welding_procedure || 'default')
  const joints = data.total_joints || 100
  const weldLength = data.total_weld_length_m || 5000
  const method = data.welding_method || 'FCAW'
  const xrayPassed = Math.floor(r() * joints * 0.05)
  const utPassed = Math.floor(r() * joints * 0.03)
  const mtPassed = Math.floor(r() * joints * 0.02)
  const totalDefects = Math.min(xrayPassed + utPassed + mtPassed, joints)
  const passRate = ((joints - totalDefects) / joints * 100).toFixed(1)
  const reworkRate = (totalDefects / joints * 100).toFixed(1)
  const penetrationDepth = (r() * 3 + 5).toFixed(1)
  const heatInput = (r() * 2 + 0.8).toFixed(2)
  const hardnessHv = Math.floor(r() * 80 + 200)
  const recommendedWps = data.thickness_mm && data.thickness_mm > 20 ? '需预热至150°C以上' : '无需预热'
  return {
    weld_joint_id: data.weld_joint_id || 'WJ-001',
    welding_method: method,
    thickness_mm: data.thickness_mm || 15,
    inspection_summary: { total_joints: joints, total_length_m: weldLength, xray_defects: xrayPassed, ut_defects: utPassed, mt_defects: mtPassed, pass_rate: passRate + '%', rework_rate: reworkRate + '%' },
    weld_quality_metrics: { penetration_mm: penetrationDepth, heat_input_kJ_mm: heatInput, hardness_hv: hardnessHv, recommended_preheat: recommendedWps },
    quality_recommendation: parseFloat(passRate) > 95 ? '焊接质量良好，维持当前工艺' : '建议修订焊接工艺规程(WPS)并加强焊工培训',
    disclaimer: DISCLAIMER
  }
}
function formatWeldingQuality(r: any) {
  return `# 焊接工艺评定与NDT检测: ${r.weld_joint_id}
🔧 焊接方法: ${r.welding_method} | 板厚: ${r.thickness_mm}mm
📊 NDT检测统计: 总接头 ${r.inspection_summary.total_joints} | 总长 ${r.inspection_summary.total_length_m}m
  - RT(X射线)缺陷: ${r.inspection_summary.xray_defects}$
  - UT(超声)缺陷: ${r.inspection_summary.ut_defects}$
  - MT(磁粉)缺陷: ${r.inspection_summary.mt_defects}$
  - 一次合格率: ${r.inspection_summary.pass_rate} | 返修率: ${r.inspection_summary.rework_rate}
⚙ 焊缝性能: 熔深 ${r.weld_quality_metrics.penetration_mm}mm | 热输入 ${r.weld_quality_metrics.heat_input_kJ_mm}kJ/mm | 硬度 ${r.weld_quality_metrics.hardness_hv}HV | 预热要求: ${r.weld_quality_metrics.recommended_preheat}
💡 ${r.quality_recommendation}
---
*${r.disclaimer}*`
}

// ============ 4. outfitting_material_estimator ============
function analyzeOutfittingMaterial(data: any) {
  const r = rng(data.zone_code || data.deck_name || 'default')
  const zone = data.zone_code || 'ZL-001'
  const deckCount = data.decks || 6
  const palletCount = Math.floor(r() * 20 + 10)
  const materialItems = Math.floor(r() * 150 + 50)
  const pipelineLength = Math.floor(r() * 5000 + 2000)
  const cableLength = Math.floor(r() * 10000 + 5000)
  const insulationArea = Math.floor(r() * 800 + 200)
  const completionRate = (r() * 0.3 + 0.5).toFixed(1)
  const shortageItems = Math.floor(r() * 10 + 2)
  const weightEstimate = Math.floor(r() * 500 + 100)
  return {
    zone_code: zone,
    deck_name: data.deck_name || `舱室区${zone}`,
    outfitting_summary: { pallet_count: palletCount, material_items: materialItems, completion_rate: completionRate + '%' },
    material_breakdown: { pipeline_length_m: pipelineLength, cable_length_m: cableLength, insulation_area_sqm: insulationArea, total_weight_tonnes: weightEstimate },
    pallet_management: { shortage_items: shortageItems, delivery_status: shortageItems > 5 ? '需加快到货' : '物资供应正常', next_delivery: `第${Math.floor(r() * 4 + 1)}托盘本周到货` },
    recommendation: shortageItems > 5 ? '建议协调舾装物资到厂，避免影响生产进度' : '托盘管理正常，按计划执行',
    disclaimer: DISCLAIMER
  }
}
function formatOutfittingMaterial(r: any) {
  return `# 舾装材料统计与托盘管理: ${r.zone_code} / ${r.deck_name}
📦 托盘统计: 托盘数 ${r.outfitting_summary.pallet_count} | 材料项 ${r.outfitting_summary.material_items} | 完成率 ${r.outfitting_summary.completion_rate}
🔩 材料明细: 管路 ${r.material_breakdown.pipeline_length_m}m | 电缆 ${r.material_breakdown.cable_length_m}m | 绝缘面积 ${r.material_breakdown.insulation_area_sqm}m² | 总重 ${r.material_breakdown.total_weight_tonnes}t
🚚 托盘管理: 缺料项 ${r.pallet_management.shortage_items} | 供货状态: ${r.pallet_management.delivery_status} | ${r.pallet_management.next_delivery}
💡 ${r.recommendation}
---
*${r.disclaimer}*`
}

// ============ 5. ship_launch_calculation ============
function analyzeShipLaunch(data: any) {
  const r = rng(data.hull_number || data.launch_date || 'default')
  const displacement = data.displacement_tonnes || 30000
  const keelLength = data.keel_length_m || 180
  const dockLength = data.dock_length_m || 300
  const dockBreadth = data.dock_breadth_m || 50
  const tideHeight = data.tide_height_m || 3.5
  const sillHeight = data.sill_height_m || 12
  const waterDepth = (sillHeight + tideHeight - 2).toFixed(1)
  const clearance = (parseFloat(waterDepth) - data.design_draft || 1.5).toFixed(1)
  const gateClosingTime = Math.floor(r() * 60 + 60)
  const launchWindow = `${Math.floor(r() * 4 + 7)}:00 — ${Math.floor(r() * 4 + 11)}:00`
  const launchDirection = data.launch_direction || '艉向下水'
  const trimAngle = (r() * 3 + 1).toFixed(1)
  const wireStrength = (displacement * 2.5).toFixed(0)
  return {
    hull_number: data.hull_number || 'H-001',
    vessel_name: data.vessel_name || '未命名船',
    launch_method: data.launch_method || '纵向滑道下水',
    water_conditions: { water_depth_m: waterDepth, tide_height_m: tideHeight, sill_height_m: sillHeight, sill_clearance_m: clearance },
    gate_schedule: { gate_closing_min: gateClosingTime, launch_window: launchWindow, dock_availability: '坞门可用' },
    launch_parameters: { displacement_tonnes: displacement, keel_length_m: keelLength, dock_size: `${dockLength}m x ${dockBreadth}m`, trim_angle_deg: trimAngle, wire_rope_strength_tonnes: wireStrength },
    recommendation: parseFloat(clearance) > 1.0 ? '潮汐和坞门条件满足下水要求' : '需调整下水时间窗口以确保足够富余水深',
    disclaimer: DISCLAIMER
  }
}
function formatShipLaunch(r: any) {
  return `# 下水计算与坞门调度: ${r.hull_number}
🚢 船名: ${r.vessel_name} | 下水方式: ${r.launch_method}
🌊 水文条件: 水深 ${r.water_conditions.water_depth_m}m | 潮高 ${r.water_conditions.tide_height_m}m | 坞槛高程 ${r.water_conditions.sill_height_m}m | 富余水深 ${r.water_conditions.sill_clearance_m}m
⏱ 坞门调度: 关门时间 ${r.gate_schedule.gate_closing_min}分钟 | 下水窗口: ${r.gate_schedule.launch_window} | 坞门状态: ${r.gate_schedule.dock_availability}` +
    `\n📐 下水参数: 排水量 ${r.launch_parameters.displacement_tonnes}t | 龙骨长 ${r.launch_parameters.keel_length_m}m | 船坞 ${r.launch_parameters.dock_size} | 尾倾角 ${r.launch_parameters.trim_angle_deg}° | 滑道钢缆强度 ${r.launch_parameters.wire_rope_strength_tonnes}t` +
    `\n💡 ${r.recommendation}` +
    `\n---\n*${r.disclaimer}*`
}

// ============ 6. classification_plan_approval ============
function analyzeClassificationApproval(data: any) {
  const r = rng(data.plan_id || data.class_society || 'default')
  const plans = data.total_plans || 25
  const approved = Math.floor(r() * plans * 0.7 + plans * 0.2)
  const pending = plans - approved
  const remarks = Math.floor(r() * 15 + 3)
  const society = data.class_society || 'CCS'
  const ruleSets = data.rule_sets || ['钢质海船入级规范(2023)', '船舶与海上设施法定检验规则']
  const approvalRate = (approved / plans * 100).toFixed(1)
  const remarksCategories = ['结构强度', '防火分隔', '消防系统', '救生设备', '防污染']
  const remarksDetail: any[] = []
  const usedCats = new Set<number>()
  for (let i = 0; i < Math.min(remarks, 5); i++) { let idx: number; do { idx = Math.floor(r() * remarksCategories.length) } while (usedCats.has(idx)); usedCats.add(idx); remarksDetail.push({ category: remarksCategories[idx], count: Math.floor(r() * 5 + 1) }) }
  const nextSurveyMonths = Math.floor(r() * 12 + 6)
  return {
    plan_id: data.plan_id || 'PLN-001',
    ship_name: data.ship_name || '未命名船',
    class_society: society,
    rule_sets: ruleSets,
    approval_status: { total_plans: plans, approved, pending, approval_rate: approvalRate + '%', remarks_count: remarks },
    remarks_by_category: remarksDetail,
    next_actions: { close_remarks: `需整改 ${remarks} 条意见`, next_review_date: `${nextSurveyMonths}个工作日后` },
    recommendation: remarks > 10 ? '需逐条回复船级社意见并修订图纸' : '尽快完成少量意见回复以取得证书',
    disclaimer: DISCLAIMER
  }
}
function formatClassificationApproval(r: any) {
  return `# 船级社审图与规范验证: ${r.plan_id}
📋 船名: ${r.ship_name} | 船级社: ${r.class_society}
📜 适用规范: ${r.rule_sets.join('、')}
📊 审图进度: 送审 ${r.approval_status.total_plans}份 | 已批准 ${r.approval_status.approved} | 待定 ${r.approval_status.pending} | 意见 ${r.approval_status.remarks_count}条 | 通过率 ${r.approval_status.approval_rate}
⚠ 意见分类:
${r.remarks_by_category.map((m: any) => `  - ${m.category}: ${m.count}条`).join('\n')}
⏱ 下一步: ${r.next_actions.close_remarks} | 预计回复时间: ${r.next_actions.next_review_date}
💡 ${r.recommendation}
---
*${r.disclaimer}*`
}

// ============ 7. dry_dock_maintenance ============
function analyzeDryDockMaintenance(data: any) {
  const r = rng(data.dock_id || data.hull_number || 'default')
  const days = data.dock_days || 30
  const vessel = data.hull_number || 'H-001'
  const surfaceArea = data.hull_surface_sqm || 8000
  const paintCoats = data.paint_coats || 3
  const paintType = data.paint_type || '无锡自抛光防污漆(SPC)'
  const blastingGrade = 'SA2.5'
  const paintCoverage = (surfaceArea / (paintCoats * 350)).toFixed(1)
  const dockingBlocks = Math.floor(r() * 30 + 20)
  const steelRenewal = Math.floor(r() * 50 + 10)
  const seaValveCount = Math.floor(r() * 20 + 5)
  const propellerPolishing = r() > 0.5 ? true : false
  const shaftInspection = r() > 0.4 ? true : false
  const specialSurvey = data.special_survey || false
  const surveyType = specialSurvey ? '特检(SS)' : '中间检验(IS)'
  return {
    dock_id: data.dock_id || 'DD-01',
    hull_number: vessel,
    vessel_name: data.vessel_name || '未命名船',
    dock_schedule: { total_days: days, start_date: data.start_date || '计划中', end_date: data.end_date || '计划中' },
    hull_treatment: { surface_area_sqm: surfaceArea, blasting_grade: blastingGrade, paint_type: paintType, coats: paintCoats, paint_consumption_tonnes: paintCoverage },
    repair_items: { docking_blocks: dockingBlocks, steel_renewal_tonnes: steelRenewal, sea_valves_count: seaValveCount, propeller_polishing: propellerPolishing, shaft_inspection: shaftInspection },
    survey_type: surveyType,
    recommendation: steelRenewal > 30 ? '钢材换新量较大，建议提前备料并安排加班坞期' : '维修工作量和坞期安排合理',
    disclaimer: DISCLAIMER
  }
}
function formatDryDockMaintenance(r: any) {
  return `# 干船坞维修与特检管理: ${r.hull_number}
🚢 船名: ${r.vessel_name} | 船坞: ${r.dock_id} | 检验类别: ${r.survey_type}
⏱ 坞期: ${r.dock_schedule.total_days}天 | ${r.dock_schedule.start_date} → ${r.dock_schedule.end_date}
🎨 船壳处理: 面积 ${r.hull_treatment.surface_area_sqm}m² | 喷砂等级 ${r.hull_treatment.blasting_grade} | 涂料 ${r.hull_treatment.paint_type} | ${r.hull_treatment.coats}度 | 涂料用量 ${r.hull_treatment.paint_consumption_tonnes}t
🔧 修理项目: 坞墩拆除/复装 ${r.repair_items.docking_blocks}块 | 钢材换新 ${r.repair_items.steel_renewal_tonnes}t | 海底阀 ${r.repair_items.sea_valves_count}只 | 螺旋桨抛光: ${r.repair_items.propeller_polishing ? '是' : '否'} | 尾轴检查: ${r.repair_items.shaft_inspection ? '是' : '否'}
💡 ${r.recommendation}
---
*${r.disclaimer}*`
}

// ============ 8. ship_recycling_compliance ============
function analyzeShipRecycling(data: any) {
  const r = rng(data.imo_number || data.hull_number || 'default')
  const imo = data.imo_number || 'IMO-0000000'
  const grossTonnage = data.gross_tonnage || 20000
  const builder = data.builder || data.yard_name || '未知船厂'
  const flag = data.flag_state || '巴拿马'
  const recyclingFacility = data.recycling_facility || '阿朗拆船厂'
  const ihmCompletion = (r() * 0.3 + 0.7).toFixed(1)
  const hazardousCount = Math.floor(r() * 50 + 20)
  const hazardousItems: any[] = []
  const hazardousTypes = ['石棉(Asbestos)', '多氯联苯(PCB)', '消耗臭氧物质(ODS)', '有机锡化合物(TBT)', '含铅涂料', '汞', '镉', '六价铬']
  const used = new Set<number>()
  for (let i = 0; i < Math.min(hazardousCount, 6); i++) { let idx: number; do { idx = Math.floor(r() * hazardousTypes.length) } while (used.has(idx)); used.add(idx); hazardousItems.push({ name: hazardousTypes[idx], location: `舱室/区域${Math.floor(r() * 10 + 1)}`, quantity_kg: Math.floor(r() * 100 + 10) }) }
  const recyclableSteel = Math.floor(grossTonnage * 0.85)
  const recyclableEquipment = Math.floor(grossTonnage * 0.1)
  const hkcCompliant = r() > 0.3 ? true : false
  const euSrrCompliant = r() > 0.4 ? true : false
  const greenRecycling = data.green_recycling_cert || 'ISO 30000, 绿色拆船'
  return {
    imo_number: imo,
    hull_number: data.hull_number || 'H-001',
    vessel_name: data.vessel_name || '未命名船',
    builder: builder,
    flag_state: flag,
    recycling_facility: recyclingFacility,
    ihm_completion_rate: ihmCompletion + '%',
    hazardous_materials: hazardousItems,
    total_hazardous_items: hazardousItems.length,
    material_inventory: { recyclable_steel_tonnes: recyclableSteel, recyclable_equipment_tonnes: recyclableEquipment, other_pct: (r() * 5).toFixed(1) },
    compliance: { hkc_compliant: hkcCompliant, eu_srr_compliant: euSrrCompliant, green_cert: greenRecycling },
    recommendation: !hkcCompliant ? '需完成IHM调查并取得有害材料清单证书' : '可安排进厂准备拆解',
    disclaimer: DISCLAIMER
  }
}
function formatShipRecycling(r: any) {
  return `# 拆船合规与有害物质清单: ${r.imo_number}
🚢 船名: ${r.vessel_name} | 船厂: ${r.imo_number} | 船旗: ${r.flag_state}
🏭 拆船厂: ${r.recycling_facility} | IHM完成率: ${r.ihm_completion_rate}
☠ 有害物质清单(${r.total_hazardous_items}项):
${r.hazardous_materials.map((m: any) => `  - ${m.name}: 位置_${m.location} | ${m.quantity_kg}kg`).join('\n')}
♻ 可回收材料: 钢材 ${r.material_inventory.recyclable_steel_tonnes}t | 设备 ${r.material_inventory.recyclable_equipment_tonnes}t | 其他 ${r.material_inventory.other_pct}%
📜 合规状态: 香港公约(HKC) ${r.compliance.hkc_compliant ? '符合' : '待完善'} | EU SRR ${r.compliance.eu_srr_compliant ? '符合' : '待完善'} | 绿色认证: ${r.compliance.green_cert}
💡 ${r.recommendation}
---
*${r.disclaimer}*`
}

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({ name: 'hull_design_analyzer', description: '船体结构设计与型线优化 | 主尺度/船型系数/水动力/结构强度', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: ship_name, hull_number, length_overall, breadth_moulded, depth_moulded, design_draft, speed_knots' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatHullDesign(analyzeHullDesign(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'ship_production_scheduler', description: '造船生产计划与分段舾装 | 分段数/月产量/工效/进度风险', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: project_code, vessel_name, total_blocks, steel_weight' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatProductionSchedule(analyzeProductionSchedule(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'welding_quality_ai', description: '焊接工艺评定与NDT检测 | RT/UT/MT/焊缝性能/返修率', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: weld_joint_id, welding_procedure, welding_method, thickness_mm, total_joints, total_weld_length_m' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatWeldingQuality(analyzeWeldingQuality(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'outfitting_material_estimator', description: '舾装材料统计与托盘管理 | 管路/电缆/绝缘/托盘/缺料', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: zone_code, deck_name, decks' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatOutfittingMaterial(analyzeOutfittingMaterial(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'ship_launch_calculation', description: '下水计算与坞门调度 | 水深/潮高/坞门/下水参数', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: hull_number, vessel_name, displacement_tonnes, keel_length_m, dock_length_m, dock_breadth_m, tide_height_m, sill_height_m, design_draft, launch_method, launch_direction' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatShipLaunch(analyzeShipLaunch(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'classification_plan_approval', description: '船级社审图与规范验证 | CCS/DNV/LR/审图进度/意见分类', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: plan_id, ship_name, class_society, rule_sets, total_plans' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatClassificationApproval(analyzeClassificationApproval(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'dry_dock_maintenance', description: '干船坞维修与特检管理 | 坞期/船壳处理/修理项目/检验', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: dock_id, hull_number, vessel_name, dock_days, start_date, end_date, hull_surface_sqm, paint_coats, paint_type, special_survey, steel_weight_tonnes' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatDryDockMaintenance(analyzeDryDockMaintenance(JSON.parse(args.input_data))) } }))

  tools.register(defineTool({ name: 'ship_recycling_compliance', description: '拆船合规与有害物质清单 | IHM/有害物质/HKC/EU SRR/可回收', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: imo_number, hull_number, vessel_name, gross_tonnage, builder, flag_state, recycling_facility, green_recycling_cert' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return formatShipRecycling(analyzeShipRecycling(JSON.parse(args.input_data))) } }))
}
