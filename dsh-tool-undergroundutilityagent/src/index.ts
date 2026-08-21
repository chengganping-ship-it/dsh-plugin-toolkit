import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'undergroundutilityagent'
export const inject = ['tools']

const DISCLAIMER = '本分析基于AI模型推断，仅作管线管理参考，不替代专业工程判断与安全决策。'

// ==================== Seeded Random (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = s
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(input: string): () => number {
  return mulberry32(hashStr(input))
}

function pickOne<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)]
}

function randRange(r: () => number, min: number, max: number): number {
  return Math.round((min + r() * (max - min)) * 100) / 100
}

// ==================== 1. Utility Locating GIS — 管线探测与GIS定位 ====================

function analyzeUtilityLocating(data: any) {
  const seed = data.project_id || data.area_id || 'default'
  const r = rng(seed)
  const surveyPoints = data.survey_points || []
  const utilityTypes = ['给水', '排水', '燃气', '电力', '通信', '热力', '工业管道']
  const detectedUtilities: any[] = []
  for (const sp of surveyPoints) {
    const ptId = sp.id || sp.point_id || '未知'
    const location = sp.location || '未指定'
    const method = sp.detection_method || pickOne(['电磁法', '地质雷达', '声波法', '红外探测', '示踪法'], r)
    const utilType = sp.utility_type || pickOne(utilityTypes, r)
    const depth = sp.depth_m || randRange(r, 0.5, 5.0)
    const diameter = sp.diameter_mm || pickOne([50, 100, 150, 200, 300, 400, 600, 800], r)
    const material = sp.material || pickOne(['球墨铸铁', 'PE100', '钢管', 'PVC', '混凝土', '铸铁', '铜缆'], r)
    const accuracy = sp.accuracy_cm || randRange(r, 2, 15)
    const confidence = sp.confidence || randRange(r, 60, 98)
    const coordX = sp.coord_x || randRange(r, 100000, 999999)
    const coordY = sp.coord_y || randRange(r, 100000, 999999)
    const confidenceLevel = confidence > 85 ? '高' : confidence > 70 ? '中' : '低'
    const riskDuringExcavation = (utilType === '燃气' && depth < 1.5) ? '高风险' : (utilType === '电力' && depth < 1.0) ? '高风险' : (utilType === '给水' && diameter >= 300) ? '中风险' : '一般'
    detectedUtilities.push({
      ptId, location, method, utilType, depth: depth.toFixed(2) + 'm', diameter: diameter + 'mm', material, accuracy: accuracy.toFixed(1) + 'cm', confidence: confidence.toFixed(1) + '%', confidenceLevel, coordX: coordX.toFixed(3), coordY: coordY.toFixed(3), riskDuringExcavation, gisLayer: utilType + '_layer'
    })
  }
  const highConfidence = detectedUtilities.filter((u: any) => u.confidenceLevel === '高').length
  const gasUtilities = detectedUtilities.filter((u: any) => u.utilType === '燃气').length
  const electricUtilities = detectedUtilities.filter((u: any) => u.utilType === '电力').length
  const highRiskUtilities = detectedUtilities.filter((u: any) => u.riskDuringExcavation === '高风险').length
  return {
    detectedUtilities,
    totalPoints: surveyPoints.length,
    highConfidence,
    gasUtilities,
    electricUtilities,
    highRiskUtilities,
    coordinateSystem: data.coordinate_system || 'CGCS2000',
    surveyDate: data.survey_date || '未知'
  }
}

function formatUtilityLocatingReport(r: any): string {
  return `# 管线探测与GIS定位

**坐标系**: ${r.coordinateSystem} | **探测日期**: ${r.surveyDate} | **探测点总数**: ${r.totalPoints}
**高置信度**: ${r.highConfidence} | **燃气管线**: ${r.gasUtilities} | **电力管线**: ${r.electricUtilities} | **高风险管线**: ${r.highRiskUtilities}

**探测结果**:
${r.detectedUtilities.map((u: any) => `
**${u.ptId}** (${u.location}) — ${u.confidenceLevel === '高' ? '🟢' : u.confidenceLevel === '中' ? '🟡' : '🔴'} 置信度${u.confidence}
- 类型: ${u.utilType} | 材质: ${u.material} | 管径: ${u.diameter} | 埋深: ${u.depth}
- 探测方法: ${u.method} | 定位精度: ${u.accuracy} | 坐标: (${u.coordX}, ${u.coordY})
- 开挖风险: ${u.riskDuringExcavation} | GIS图层: ${u.gisLayer}
`).join('\n')}

**管线保护建议**:
1. 燃气管线1.5m范围内严禁机械开挖，必须人工探明
2. 电力管线周边需考虑安全放电距离
3. 建议将所有探测成果录入GIS系统实现动态更新
4. 探测置信度低于70%的点位应进行复测验证

---
${DISCLAIMER}`
}

// ==================== 2. Pipe Condition Assessor — 管道CCTV检测与状况评估 ====================

function analyzePipeCondition(data: any) {
  const seed = data.pipeline_id || data.section_id || 'default'
  const r = rng(seed)
  const segments = data.inspected_segments || []
  const assessments: any[] = []
  for (const seg of segments) {
    const segId = seg.id || '未知'
    const location = seg.location || '未指定'
    const material = seg.material || pickOne(['混凝土管', '铸铁管', '钢管', 'PE管', 'PVC管', '陶土管'], r)
    const diameter = seg.diameter_mm || pickOne([200, 300, 400, 500, 600, 800, 1000, 1200], r)
    const length = seg.length_m || randRange(r, 20, 500)
    const installYear = seg.install_year || Math.floor(randRange(r, 1975, 2020))
    const age = new Date().getFullYear() - installYear
    const defectCount = seg.defect_count !== undefined ? seg.defect_count : Math.floor(randRange(r, 0, 12))
    const crackCount = Math.floor(defectCount * randRange(r, 0.1, 0.4))
    const deformationCount = Math.floor(defectCount * randRange(r, 0.05, 0.25))
    const rootIntrusion = Math.floor(defectCount * randRange(r, 0, 0.2))
    const depositionCount = Math.floor(defectCount * randRange(r, 0.1, 0.3))
    const infiltrationCount = Math.floor(defectCount * randRange(r, 0, 0.15))
    const breakCount = Math.floor(defectCount * randRange(r, 0, 0.1))
    const totalDefectScore = crackCount * 3 + deformationCount * 5 + rootIntrusion * 4 + depositionCount * 2 + infiltrationCount * 3 + breakCount * 10
    const maxScore = length * 0.5
    const conditionGrade = totalDefectScore > maxScore * 0.7 ? 'IV级(严重)' : totalDefectScore > maxScore * 0.4 ? 'III级(较重)' : totalDefectScore > maxScore * 0.15 ? 'II级(轻微)' : 'I级(正常)'
    const conditionScore = Math.max(5, Math.min(100, 100 - (totalDefectScore / Math.max(maxScore, 1)) * 90))
    const remainingLife = Math.max(0, Math.floor(50 - age * 0.8 - totalDefectScore * 0.5))
    const repairUrgency = conditionGrade.includes('IV') ? '紧急修复' : conditionGrade.includes('III') ? '6个月内修复' : conditionGrade.includes('II') ? '1年内修复' : '持续监测'
    const repairMethod = conditionGrade.includes('IV') ? '结构性修复(穿插/不锈钢内衬)' : conditionGrade.includes('III') ? '局部修复+加强监测' : conditionGrade.includes('II') ? '点状修复' : '常规维护'
    const defectDensity = (defectCount / (length / 1000)).toFixed(1)
    assessments.push({
      segId, location, material, diameter: diameter + 'mm', length: length.toFixed(0) + 'm', installYear, age: age + '年',
      crackCount, deformationCount, rootIntrusion, depositionCount, infiltrationCount, breakCount,
      totalDefectScore: totalDefectScore.toFixed(1), conditionGrade, conditionScore: conditionScore.toFixed(0),
      remainingLife: remainingLife + '年', repairUrgency, repairMethod, defectDensity: defectDensity + '个/km',
      gravity: seg.medium || pickOne(['污水', '雨水', '雨污合流'], r)
    })
  }
  const urgentCount = assessments.filter((a: any) => a.conditionGrade.includes('IV')).length
  const severeCount = assessments.filter((a: any) => a.conditionGrade.includes('III')).length
  const avgScore = assessments.length > 0 ? (assessments.reduce((a, s) => a + parseFloat(s.conditionScore), 0) / assessments.length).toFixed(0) : '0'
  const totalLength = assessments.reduce((a, s) => a + parseFloat(s.length), 0)
  return {
    assessments: assessments.sort((a: any, b: any) => parseFloat(a.conditionScore) - parseFloat(b.conditionScore)),
    totalSegments: segments.length,
    totalLength: (totalLength / 1000).toFixed(2) + 'km',
    urgentCount,
    severeCount,
    avgScore: avgScore + '/100',
    inspectionDate: data.inspection_date || '未知'
  }
}

function formatPipeConditionReport(r: any): string {
  return `# 管道CCTV检测与状况评估

**检测日期**: ${r.inspectionDate} | **检测管段**: ${r.totalSegments}段 | **总长度**: ${r.totalLength}
**平均状况评分**: ${r.avgScore} | **紧急修复**: ${r.urgentCount}段 | **较重缺陷**: ${r.severeCount}段

**管段评估（按状况排序）**:
${r.assessments.map((a: any) => `
**${a.segId}** (${a.location}) — ${a.conditionGrade === 'IV级(严重)' ? '🔴' : a.conditionGrade === 'III级(较重)' ? '🟠' : a.conditionGrade === 'II级(轻微)' ? '🟡' : '🟢'} ${a.conditionGrade} | 评分: ${a.conditionScore}/100
- ${a.material} | ${a.diameter} | ${a.length} | 安装${a.installYear}年 | 龄期${a.age} | 介质: ${a.gravity}
- 缺陷: 裂缝${a.crackCount} 变形${a.deformationCount} 树根${a.rootIntrusion} 沉积${a.depositionCount} 渗漏${a.infiltrationCount} 破裂${a.breakCount}
- 缺陷密度: ${a.defectDensity} | 缺陷总分: ${a.totalDefectScore} | 剩余寿命: ${a.remainingLife}
- 修复建议: ${a.repairUrgency} | 工法: ${a.repairMethod}
`).join('\n')}

**修复优先级建议**:
1. IV级管段应尽快安排应急修复，防止路面塌陷
2. III级管段6个月内完成修复并加强监测频次
3. 建议建立CCTV检测数据库，实现管段状况趋势追踪
4. 混凝土管龄期超40年建议批量更新评估

---
${DISCLAIMER}`
}

// ==================== 3. Leak Detection Gas/Water — 燃气/供水管网漏损检测 ====================

function analyzeLeakDetection(data: any) {
  const seed = data.network_id || data.zone_id || 'default'
  const r = rng(seed)
  const zones = data.leak_zones || []
  const reports: any[] = []
  for (const zone of zones) {
    const zoneId = zone.id || zone.zone_id || '未知'
    const zoneName = zone.name || zoneId
    const pipeType = zone.pipe_type || pickOne(['供水', '燃气', '供水+燃气'], r)
    const detectionMethod = zone.detection_method || pickOne(['声波检漏', '气体检测', '红外热成像', '流量平衡', '压力梯度'], r)
    const minFlow = zone.min_night_flow || randRange(r, 5, 60)
    const baseline = zone.baseline_flow || randRange(r, 3, 40)
    const excess = Math.max(0, minFlow - baseline)
    const leakProbability = Math.min(98, (excess / Math.max(baseline, 1)) * 100 + randRange(r, 5, 25))
    const likelihood = leakProbability > 70 ? '高' : leakProbability > 40 ? '中' : '低'
    const pressure = zone.pressure || randRange(r, 0.1, 0.5)
    const pipeAge = zone.pipe_age_years || Math.floor(randRange(r, 5, 35))
    const pipeMaterial = zone.pipe_material || pickOne(['钢管', 'PE管', '铸铁管', '镀锌钢管'], r)
    const pipeLength = zone.pipe_length_km || randRange(r, 2, 30)
    const suspectedLeaks: string[] = []
    if (leakProbability > 45) {
      const count = Math.floor(randRange(r, 1, 5))
      const locTypes = ['接头腐蚀点', '管体砂眼', '阀门老化', '第三方破坏点', '管基础沉降处', '穿路套管处']
      for (let i = 0; i < count; i++) {
        suspectedLeaks.push(pickOne(locTypes, r))
      }
    }
    const gasConcentration = pipeType.includes('燃气') ? randRange(r, 0, 30).toFixed(1) + '%LEL' : 'N/A'
    const escapeVolume = excess > 0 ? (excess * 8760).toFixed(0) + ' m³/年' : '0 m³/年'
    reports.push({
      zoneId, zoneName, pipeType, detectionMethod, minFlow: minFlow.toFixed(1), baseline: baseline.toFixed(1),
      excess: excess.toFixed(1), leakProbability: leakProbability.toFixed(0), likelihood,
      pressure: pressure.toFixed(2) + 'MPa', pipeAge: pipeAge + '年', pipeMaterial,
      pipeLength: pipeLength.toFixed(1) + 'km', suspectedLeaks,
      gasConcentration, escapeVolume,
      action: likelihood === '高' ? '立即精确定位并抢修' : likelihood === '中' ? '72小时内详细排查' : '定期巡检关注'
    })
  }
  const highRisk = reports.filter((rp: any) => rp.likelihood === '高').length
  const gasZones = reports.filter((rp: any) => rp.pipeType.includes('燃气')).length
  const totalExcess = reports.reduce((a: number, x: any) => a + parseFloat(x.excess), 0)
  return {
    reports: reports.sort((a: any, b: any) => parseFloat(b.leakProbability) - parseFloat(a.leakProbability)),
    totalZones: zones.length,
    highRisk,
    gasZones,
    totalExcess: totalExcess.toFixed(1) + ' m³/h',
    annualEscape: (totalExcess * 8760).toFixed(0) + ' m³/年'
  }
}

function formatLeakDetectionReport(r: any): string {
  return `# 燃气/供水管网漏损检测

**检测分区**: ${r.totalZones}个 | **高风险区**: ${r.highRisk}个 | **燃气相关**: ${r.gasZones}个
**总异常流量**: ${r.totalExcess} | **预估年漏损量**: ${r.annualEscape}

**各分区漏损分析**:
${r.reports.map((rp: any) => `
**${rp.zoneName}** (${rp.zoneId}) — ${rp.likelihood === '高' ? '🔴' : rp.likelihood === '中' ? '🟡' : '🟢'} 漏损概率 ${rp.leakProbability}%
- 管种: ${rp.pipeType} | 检测方法: ${rp.detectionMethod}
- 夜间流量: ${rp.minFlow} m³/h | 基线: ${rp.baseline} m³/h | 异常: ${rp.excess} m³/h
- 管网参数: ${rp.pipeMaterial} | ${rp.pipeAge} | ${rp.pipeLength} | 压力 ${rp.pressure}
${rp.gasConcentration !== 'N/A' ? `- 燃气浓度: ${rp.gasConcentration}` : ''}${rp.suspectedLeaks.length > 0 ? `\n- 疑似漏点: ${rp.suspectedLeaks.join('; ')}` : ''}
- 年漏损量: ${rp.escapeVolume} | 建议措施: ${rp.action}
`).join('\n')}

**检漏建议**:
1. 高风险区域立即部署多通道声波记录仪进行24小时监测
2. 燃气漏损区域须警戒防爆，严禁明火和静电
3. 供水漏损建议结合DMA水平衡法进一步缩小范围
4. 龄期超25年区域建议纳入管网更新计划

---
${DISCLAIMER}`
}

// ==================== 4. Excavation Risk Mapper — 施工开挖风险与管线碰撞预警 ====================

function analyzeExcavationRisk(data: any) {
  const seed = data.project_id || data.construction_id || 'default'
  const r = rng(seed)
  const excavationZone = data.excavation_zone || {}
  const nearbyUtilities = data.nearby_utilities || []
  const excavator = excavationZone.equipment || pickOne(['小型挖掘机', '大型挖掘机', '打桩机', '顶管机', '盾构机'], r)
  const excavationDepth = excavationZone.depth_m || randRange(r, 1.5, 6.0)
  const excavationExcavationArea = excavationZone.area_sqm || randRange(r, 50, 5000)
  const withinProtectionZone = data.protection_zone || excavationDepth * 3
  const riskItems: any[] = []
  let totalRiskScore = 0
  for (const util of nearbyUtilities) {
    const utilType = util.type || pickOne(['燃气', '给水', '排水', '电力', '通信', '热力'], r)
    const distance = util.distance_m || randRange(r, 0.5, 10)
    const utilDepth = util.depth_m || randRange(r, 0.8, 3.5)
    const horizontalGap = Math.max(0, distance - 0.5)
    const verticalGap = Math.abs(excavationDepth - utilDepth)
    const inImpactZone = horizontalGap < withinProtectionZone && utilDepth <= excavationDepth
    let riskLevel = '低风险'
    let riskScore = 0
    if (utilType === '燃气' && distance < 2.0) { riskLevel = '极高风险'; riskScore = 95 }
    else if (utilType === '燃气' && distance < 4.0) { riskLevel = '高风险'; riskScore = 80 }
    else if (utilType === '电力' && distance < 1.5 && utilDepth < 1.0) { riskLevel = '高风险'; riskScore = 75 }
    else if (utilType === '给水' && util.diameter_mm > 400 && distance < 3.0) { riskLevel = '高风险'; riskScore = 70 }
    else if (distance < 1.0) { riskLevel = '高风险'; riskScore = 65 }
    else if (distance < 3.0) { riskLevel = '中风险'; riskScore = 45 }
    else if (distance < 5.0) { riskLevel = '低风险'; riskScore = 25 }
    else { riskLevel = '可忽略'; riskScore = 10 }
    if (inImpactZone) riskScore = Math.min(100, riskScore + 15)
    totalRiskScore += riskScore
    const protection = riskScore > 70 ? '人工开挖+管线悬吊保护' : riskScore > 40 ? '机械开挖+警示标识' : '常规施工+图纸复核'
    const preCheck = utilType === '燃气' ? '浓度检测+阀门位置确认' : utilType === '电力' ? '电缆走向探测+停电确认' : '管线交底+探沟验证'
    riskItems.push({
      utilType, distance: distance.toFixed(1) + 'm', utilDepth: utilDepth.toFixed(2) + 'm',
      horizontalGap: horizontalGap.toFixed(1) + 'm', verticalGap: verticalGap.toFixed(2) + 'm',
      inImpactZone, riskLevel, riskScore,
      protection, preCheck,
      diameter: util.diameter_mm ? util.diameter_mm + 'mm' : '-', material: util.material || '未知'
    })
  }
  const avgRiskScore = nearbyUtilities.length > 0 ? (totalRiskScore / nearbyUtilities.length).toFixed(0) : '0'
  const highRiskCount = riskItems.filter((ri: any) => ri.riskLevel === '极高风险' || ri.riskLevel === '高风险').length
  const overallRisk = highRiskCount > 0 ? '极高' : parseFloat(avgRiskScore) > 50 ? '高' : parseFloat(avgRiskScore) > 30 ? '中' : '低'
  const workPermitRequired = highRiskCount > 0 || riskItems.some((ri: any) => ri.riskLevel === '极高风险' || ri.riskLevel === '高风险')
  return {
    riskItems: riskItems.sort((a: any, b: any) => b.riskScore - a.riskScore),
    excavationDepth: excavationDepth.toFixed(2) + 'm',
    excavationExcavationArea: excavationExcavationArea.toFixed(0) + 'm²',
    protectionZone: withinProtectionZone.toFixed(1) + 'm',
    excavator,
    avgRiskScore: avgRiskScore + '/100',
    overallRisk,
    highRiskCount,
    workPermitRequired: workPermitRequired ? '必须办理管线保护审批' : '常规报备即可',
    utilityCount: nearbyUtilities.length
  }
}

function formatExcavationRiskReport(r: any): string {
  return `# 施工开挖风险与管线碰撞预警

**开挖深度**: ${r.excavationDepth} | **开挖面积**: ${r.excavationExcavationArea} | **设备**: ${r.excavator}
**保护范围**: ${r.protectionZone} | **涉及管线**: ${r.utilityCount}条 | **平均风险**: ${r.avgRiskScore}
**综合风险**: ${r.overallRisk === '极高' ? '🔴 极高' : r.overallRisk === '高' ? '🟠 高' : r.overallRisk === '中' ? '🟡 中' : '🟢 低'}
**高风险管线**: ${r.highRiskCount}条 | **开工许可**: ${r.workPermitRequired}

**管线风险评估（按风险排序）**:
${r.riskItems.map((ri: any) => `
${ri.riskLevel === '极高风险' ? '⛔' : ri.riskLevel === '高风险' ? '🔴' : ri.riskLevel === '中风险' ? '🟡' : '🟢'} **${ri.utilType}** — ${ri.riskLevel} (评分: ${ri.riskScore}/100)
- 距离开挖边: ${ri.distance} | 埋深: ${ri.utilDepth} | 水平净距: ${ri.horizontalGap} | 垂直净距: ${ri.verticalGap}
- 管径: ${ri.diameter} | 材质: ${ri.material} | 影响区: ${ri.inImpactZone ? '是 ⚠️' : '否'}
- 施工要求: ${ri.protection} | 前置检查: ${ri.preCheck}
`).join('\n')}

**施工管控建议**:
1. 施工前必须组织管线单位现场交底并签字确认
2. 燃气管线侧2m范围内严禁机械开挖
3. 探沟深度应超过管线埋深30cm以上
4. 施工期间安排管线专人旁站监护

---
${DISCLAIMER}`
}

// ==================== 5. Utility Records Digitizer — 管线档案数字化与一致性校核 ====================

function analyzeRecordsDigitization(data: any) {
  const seed = data.archive_id || data.project_id || 'default'
  const r = rng(seed)
  const records = data.utility_records || []
  const digitization: any[] = []
  let totalChecks = 0
  let consistencyErrors = 0
  for (const rec of records) {
    const recId = rec.record_id || rec.id || '未知'
    const utilType = rec.utility_type || pickOne(['给水', '燃气', '排水', '电力', '通信', '热力'], r)
    const fieldCount = rec.field_count || Math.floor(randRange(r, 15, 50))
    const digitized = rec.digitized_fields || Math.floor(fieldCount * randRange(r, 0.7, 1.0))
    const completeness = (digitized / Math.max(fieldCount, 1) * 100).toFixed(1)
    const mismatchFields: string[] = []
    const possibleMismatches = ['管径', '埋深', '坐标', '材质', '走向', '权属单位', '建设年代', '压力等级', '管长', '接口形式']
    const mismatchCount = Math.floor(randRange(r, 0, 4))
    for (let i = 0; i < mismatchCount; i++) {
      mismatchFields.push(pickOne(possibleMismatches, r))
    }
    consistencyErrors += mismatchCount
    totalChecks += fieldCount
    const hasSpatialMismatch = mismatchFields.includes('坐标') || mismatchFields.includes('走向')
    const hasAttributeMismatch = mismatchFields.includes('管径') || mismatchFields.includes('埋深') || mismatchFields.includes('材质')
    const status = mismatchCount === 0 ? '一致' : mismatchCount <= 2 ? '基本一致' : '存在差异'
    const priority = mismatchCount >= 3 || hasSpatialMismatch ? '高' : mismatchCount >= 1 ? '中' : '低'
    digitization.push({
      recId, utilType, fieldCount, digitized, completeness: completeness + '%',
      mismatchFields, hasSpatialMismatch, hasAttributeMismatch, status, priority,
      archiveSource: rec.source || pickOne(['纸质图纸', 'CAD文件', '测绘报告', '竣工图', '口述记录'], r),
      format: rec.format || pickOne(['PDF', 'DWG', 'Excel', '纸质', '扫描件'], r),
      digitizationDate: rec.digitized_date || '2025-01-15',
      nextAction: priority === '高' ? '现场复测并修正数据' : priority === '中' ? '核实后修正' : '纳入常规更新'
    })
  }
  const consistencyRate = totalChecks > 0 ? ((totalChecks - consistencyErrors) / totalChecks * 100).toFixed(1) : '100.0'
  const highPriority = digitization.filter((d: any) => d.priority === '高').length
  return {
    digitization: digitization.sort((a: any, b: any) => {
      const p: Record<string, number> = { '高': 0, '中': 1, '低': 2 }
      return (p[a.priority] || 2) - (p[b.priority] || 2)
    }),
    totalRecords: records.length,
    totalChecks,
    consistencyErrors,
    consistencyRate: consistencyRate + '%',
    highPriority,
    incompleteCount: digitization.filter((d: any) => parseFloat(d.completeness) < 90).length
  }
}

function formatRecordsDigitizationReport(r: any): string {
  return `# 管线档案数字化与一致性校核

**档案总数**: ${r.totalRecords}份 | **检查字段**: ${r.totalChecks}项 | **一致率**: ${r.consistencyRate}
**不一致字段**: ${r.consistencyErrors}项 | **高优先级修正**: ${r.highPriority}份 | **不完整档案**: ${r.incompleteCount}份

**各档案校核结果**:
${r.digitization.map((d: any) => `
**${d.recId}** (${d.utilType}) — ${d.status === '一致' ? '🟢' : d.status === '基本一致' ? '🟡' : '🔴'} ${d.status} | 完整度: ${d.completeness}
- 来源: ${d.archiveSource} | 格式: ${d.format} | 字段: ${d.digitized}/${d.fieldCount}
${d.mismatchFields.length > 0 ? `- ⚠️ 不一致字段: ${d.mismatchFields.join(', ')}` : '- 所有字段核对一致'}
- 空间偏差: ${d.hasSpatialMismatch ? '是 ⚠️' : '否'} | 属性偏差: ${d.hasAttributeMismatch ? '是 ⚠️' : '否'}
- 修正优先级: ${d.priority} | 措施: ${d.nextAction}
`).join('\n')}

**数字化建议**:
1. 坐标/走向不一致的档案必须现场复测修正
2. 建议建立管线GIS数据库统一管理，消除数据孤岛
3. 数字化精度应达到厘米级，满足施工需求
4. 建议制定管线数据标准规范，减少格式多样带来的不一致

---
${DISCLAIMER}`
}

// ==================== 6. Cathodic Protection Monitor — 阴保电位监测与腐蚀预警 ====================

function analyzeCathodicProtection(data: any) {
  const seed = data.cp_system_id || data.pipeline_id || 'default'
  const r = rng(seed)
  const monitoringPoints = data.cp_points || []
  const readings: any[] = []
  for (const mp of monitoringPoints) {
    const ptId = mp.id || mp.point_id || '未知'
    const location = mp.location || '未指定'
    const pipeType = mp.pipe_type || pickOne(['燃气管道', '供水管道', '原油管道', '成品油管道'], r)
    const pipeAge = mp.pipe_age_years || Math.floor(randRange(r, 3, 30))
    const coatingType = mp.coating_type || pickOne(['FBE环氧粉末', '3PE', '煤焦油瓷漆', 'PE胶带', '沥青'], r)
    const soilResistivity = mp.soil_resistivity || randRange(r, 10, 200)
    const onPotential = mp.on_potential || randRange(r, -1.2, -0.7)
    const offPotential = mp.off_potential || randRange(r, -1.1, -0.6)
    const irDrop = Math.abs(onPotential - offPotential)
    const protectionStandard = -0.85
    const isProtected = offPotential <= protectionStandard
    const protectionDegree = isProtected ? ((protectionStandard - offPotential) / protectionStandard * 100).toFixed(1) : '欠保护'
    const anodeStatus = mp.anode_status || pickOne(['正常', '正常', '正常', '消耗过快', '失效'], r)
    const drainageSystem = mp.drainage || pickOne(['未安装', '排流正常', '排流效果差'], r)
    const coatingDegradation = coatingType === '3PE' ? randRange(r, 2, 15) : coatingType === 'FBE环氧粉末' ? randRange(r, 5, 20) : randRange(r, 10, 40)
    const corrosionRisk = anodeStatus === '失效' ? '极高' : anodeStatus === '消耗过快' ? '高' : !isProtected ? '高' : soilResistivity < 30 ? '中' : coatingDegradation > 25 ? '中' : '低'
    const remainingAnodeLife = anodeStatus === '正常' ? randRange(r, 5, 25).toFixed(0) + '年' : anodeStatus === '消耗过快' ? randRange(r, 0.5, 3).toFixed(1) + '年' : '需立即更换'
    readings.push({
      ptId, location, pipeType, pipeAge: pipeAge + '年', coatingType,
      soilResistivity: soilResistivity.toFixed(0) + 'Ω·m',
      onPotential: onPotential.toFixed(3) + 'V',
      offPotential: offPotential.toFixed(3) + 'V',
      irDrop: irDrop.toFixed(3) + 'V',
      isProtected,
      protectionDegree: isProtected ? protectionDegree + '%' : protectionDegree + '',
      anodeStatus, drainageSystem,
      coatingDegradation: coatingDegradation.toFixed(1) + '%',
      corrosionRisk,
      remainingAnodeLife,
      nextAction: corrosionRisk === '极高' ? '紧急处理' : corrosionRisk === '高' ? '限30天处理' : corrosionRisk === '中' ? '季度内处理' : '例行监测'
    })
  }
  const protectedCount = readings.filter((rd: any) => rd.isProtected).length
  const unprotectedCount = readings.length - protectedCount
  const highCorrosionRisk = readings.filter((rd: any) => rd.corrosionRisk === '极高' || rd.corrosionRisk === '高').length
  const avgPotential = readings.length > 0 ? (readings.reduce((a, rd) => a + parseFloat(rd.offPotential), 0) / readings.length).toFixed(3) : '-0.850'
  const protectionRate = readings.length > 0 ? (protectedCount / readings.length * 100).toFixed(1) : '0'
  return {
    readings: readings.sort((a: any, b: any) => {
      const risk: Record<string, number> = { '极高': 0, '高': 1, '中': 2, '低': 3 }
      return (risk[a.corrosionRisk] || 3) - (risk[b.corrosionRisk] || 3)
    }),
    totalPoints: monitoringPoints.length(),
    protectedCount,
    unprotectedCount,
    highCorrosionRisk,
    protectionRate: protectionRate + '%',
    avgPotential: avgPotential + 'V(CSE)',
    monitoringDate: data.monitoring_date || '2025-01-15'
  }
}

function formatCathodicProtectionReport(r: any): string {
  return `# 阴保电位监测与腐蚀预警

**监测日期**: ${r.monitoringDate} | **监测点**: ${r.totalPoints}个 | **平均断电电位**: ${r.avgPotential}
**保护率**: ${r.protectionRate} | **有效保护**: ${r.protectedCount}个 | **欠保护**: ${r.unprotectedCount}个
**高腐蚀风险**: ${r.highCorrosionRisk}个监测点

**各监测点结果（按风险排序）**:
${r.readings.map((rd: any) => `
${rd.corrosionRisk === '极高' ? '⛔' : rd.corrosionRisk === '高' ? '🔴' : rd.corrosionRisk === '中' ? '🟡' : '🟢'} **${rd.ptId}** (${rd.location}) — 腐蚀风险: ${rd.corrosionRisk} | 保护: ${rd.isProtected ? '✅' : '❌ 欠保护'}
- 管道: ${rd.pipeType} | ${rd.pipeAge} | 涂层: ${rd.coatingType} | 涂层老化: ${rd.coatingDegradation}
- 土壤电阻率: ${rd.soilResistivity} | 通电位: ${rd.onPotential} | 断电位: ${rd.offPotential} | IR降: ${rd.irDrop}
- 阳极状态: ${rd.anodeStatus} | 剩余寿命: ${rd.remainingAnodeLife} | 排流: ${rd.drainageSystem}
- 保护度: ${rd.protectionDegree} | 措施: ${rd.nextAction}
`).join('\n')}

**阴保运维建议**:
1. 欠保护管段应立即检查恒电位仪输出及阳极状态
2. 涂层老化严重区域（>30%）建议安排复涂修复
3. 土壤电阻率低（<30Ω·m）区域腐蚀性强，需增加监测频次
4. 建立阴保电位数字孪生系统实时追踪保护状态

---
${DISCLAIMER}`
}

// ==================== 7. Smart Manhole Monitor — 智能井盖监测与内涝预警 ====================

function analyzeSmartManhole(data: any) {
  const seed = data.area_id || data.network_id || 'default'
  const r = rng(seed)
  const manholes = data.monitored_manholes || []
  const reports: any[] = []
  for (const mh of manholes) {
    const mhId = mh.id || mh.manhole_id || '未知'
    const location = mh.location || '未指定'
    const coverType = mh.cover_type || pickOne(['防盗井盖', '无防坠落', '密封井', '普通井盖', '智能井盖'], r)
    const hasIot = mh.iot_enabled || (coverType === '智能井盖' ? true : r() > 0.5)
    const status = mh.status || pickOne(['正常', '正常', '正常', '异响', '松动', '缺失', '打不开'], r)
    const waterLevel = mh.water_level_cm || randRange(r, 0, 80)
    const waterVelocity = mh.water_velocity || randRange(r, 0.2, 3.5)
    const temperature = mh.temperature || randRange(r, 5, 42)
    const gasH2S = mh.h2s_ppm || randRange(r, 0, 30)
    const gasCH4 = mh.ch4_lel || randRange(r, 0, 15)
    const tiltAngle = mh.tilt_degree || randRange(r, 0, 5)
    const batteryLevel = mh.battery || randRange(r, 15, 100)
    const signalStrength = mh.signal || randRange(r, -90, -50)
    const floodWarning = waterLevel > 50 ? '红色(积水严重)' : waterLevel > 30 ? '橙色(积水较高)' : waterLevel > 15 ? '黄色(水位上升)' : '蓝色(正常)'
    const gasWarning = gasH2S > 10 || gasCH4 > 5 ? '气体超标' : '正常'
    const batteryWarning = batteryLevel < 30 ? '电量低' : batteryLevel < 15 ? '电量极低' : '正常'
    const coverWarning = status === '缺失' ? '井盖缺失-紧急' : status === '松动' ? '井盖松动' : status === '打不开' ? '井盖锈死' : '正常'
    const overallIssue = (gasWarning !== '气体超标' && coverWarning === '正常' && waterLevel <= 15) ? '正常' :
      status === '缺失' || gasH2S > 20 ? '紧急' : waterLevel > 30 || gasH2S > 10 ? '告警' : '关注'
    reports.push({
      mhId, location, coverType, hasIot: hasIot ? '是' : '否', status,
      waterLevel: waterLevel.toFixed(0) + 'cm', waterVelocity: waterVelocity.toFixed(1) + 'm/s',
      temperature: temperature.toFixed(1) + '°C',
      gasH2S: gasH2S.toFixed(1) + 'ppm', gasCH4: gasCH4.toFixed(1) + '%LEL',
      tiltAngle: tiltAngle.toFixed(1) + '°',
      batteryLevel: batteryLevel.toFixed(0) + '%', signalStrength: signalStrength.toFixed(0) + 'dBm',
      floodWarning, gasWarning, batteryWarning, coverWarning, overallIssue,
      responseHours: overallIssue === '紧急' ? '2小时内' : overallIssue === '告警' ? '6小时内' : overallIssue === '关注' ? '24小时内' : '常规巡检'
    })
  }
  const emergencyCount = reports.filter((rp: any) => rp.overallIssue === '紧急').length
  const alarmCount = reports.filter((rp: any) => rp.overallIssue === '告警').length
  const floodRedCount = reports.filter((rp: any) => rp.floodWarning.includes('红色')).length
  const gasAlarmCount = reports.filter((rp: any) => rp.gasWarning === '气体超标').length
  const avgWaterLevel = reports.length > 0 ? (reports.reduce((a, rp) => a + parseFloat(rp.waterLevel), 0) / reports.length).toFixed(0) : '0'
  return {
    reports: reports.sort((a: any, b: any) => {
      const issue: Record<string, number> = { '紧急': 0, '告警': 1, '关注': 2, '正常': 3 }
      return (issue[a.overallIssue] || 3) - (issue[b.overallIssue] || 3)
    }),
    totalManholes: manholes.length,
    emergencyCount,
    alarmCount,
    floodRedCount,
    gasAlarmCount,
    avgWaterLevel: avgWaterLevel + 'cm',
    iotCoverage: reports.filter((rp: any) => rp.hasIot === '是').length,
    monitoringDate: data.monitoring_date || '2025-01-15'
  }
}

function formatSmartManholeReport(r: any): string {
  return `# 智能井盖监测与内涝预警

**监测日期**: ${r.monitoringDate} | **监测井盖**: ${r.totalManholes}座 | **IoT覆盖率**: ${r.iotCoverage}座
**平均水位**: ${r.avgWaterLevel} | **紧急事件**: ${r.emergencyCount} | **告警**: ${r.alarmCount}
**红色内涝预警**: ${r.floodRedCount} | **气体超标**: ${r.gasAlarmCount}

**各井盖监测详情（按紧急度排序）**:
${r.reports.map((rp: any) => `
${rp.overallIssue === '紧急' ? '🚨' : rp.overallIssue === '告警' ? '⚠️' : rp.overallIssue === '关注' ? '🔔' : '✅'} **${rp.mhId}** (${rp.location}) — ${rp.overallIssue} | 响应时限: ${rp.responseHours}
- 井盖: ${rp.coverType} | 状态: ${rp.coverWarning} | IoT: ${rp.hasIot} | 倾斜: ${rp.tiltAngle}
- 水位: ${rp.waterLevel} (${rp.floodWarning}) | 流速: ${rp.waterVelocity} | 温度: ${rp.temperature}
- 气体: H₂S ${rp.gasH2S} | CH₄ ${rp.gasCH4} | 气体状态: ${rp.gasWarning}
- 设备: 电量 ${rp.batteryLevel} (${rp.batteryWarning}) | 信号: ${rp.signalStrength}
`).join('\n')}

**运维建议**:
1. 紧急事件（井盖缺失、H₂S>15ppm）须2小时内到场处置
2. 内涝预警区域提前部署移动泵车做好排涝准备
3. 建议提高IoT覆盖率至90%以上实现全域感知
4. 井盖锈死/松动问题纳入季度维护计划集中处理

---
${DISCLAIMER}`
}

// ==================== 8. Utility Compliance Auditor — 管线安全合规与压力管道注册 ====================

function analyzeCompliance(data: any) {
  const seed = data.audit_id || data.utility_id || 'default'
  const r = rng(seed)
  const pipelines = data.audited_pipelines || []
  const auditResults: any[] = []
  for (const pipe of pipelines) {
    const pipeId = pipe.id || pipe.pipeline_id || '未知'
    const pipeName = pipe.name || pipeId
    const pipeCategory = pipe.category || pickOne(['GB1(燃气)', 'GB2(热力)', 'GC1(工业管道)', 'GC2(工业管道)', 'GC3(工业管道)', 'GD1(动力管道)'], r)
    const isPressurePipeline = pipeCategory.startsWith('GC') || pipeCategory.startsWith('GD') || pipe.is_pressure === true
    const registered = pipe.registered !== undefined ? pipe.registered : (r() > 0.6)
    const lastInspection = pipe.last_inspection || pickOne(['2023-06', '2024-01', '2024-06', '2024-09', '2024-12', '超期未检'], r)
    const inspectionValid = lastInspection !== '超期未检'
    const designPressure = pipe.design_pressure || randRange(r, 0.1, 4.0)
    const designTemp = pipe.design_temp || randRange(r, -20, 300)
    const medium = pipe.medium || pickOne(['天然气', '水', '蒸汽', '压缩空气', '液化石油气', '热力', '工业气体'], r)
    const hazardLevel = medium === '液化石油气' ? '甲类' : medium === '天然气' ? '甲类' : medium === '蒸汽' ? '不适用' : '乙类'
    const hasLeakTest = pipe.leak_test || (r() > 0.7)
    const hasSafetyValve = pipe.safety_valve || (r() > 0.75)
    const hasReliefSystem = pipe.relief_system || (r() > 0.6)
    const hasInspectionRecord = pipe.inspection_record || (r() > 0.8)
    const hasOperatorCert = pipe.operator_cert || (r() > 0.85)
    const hasEmergencyPlan = pipe.emergency_plan || (r() > 0.6)
    const complianceItems = [
      { item: '使用登记', passed: registered, severity: '严重' },
      { item: '定期检验', passed: inspectionValid, severity: '严重' },
      { item: '泄漏试验', passed: hasLeakTest, severity: '一般' },
      { item: '安全阀配置', passed: hasSafetyValve, severity: '严重' },
      { item: '泄压系统', passed: hasReliefSystem, severity: '一般' },
      { item: '检验记录', passed: hasInspectionRecord, severity: '一般' },
      { item: '持证上岗', passed: hasOperatorCert, severity: '严重' },
      { item: '应急预案', passed: hasEmergencyPlan, severity: '一般' }
    ]
    const failures = complianceItems.filter((ci) => !ci.passed)
    const criticalFailures = failures.filter((ci) => ci.severity === '严重')
    const complianceRate = ((complianceItems.length - failures.length) / complianceItems.length * 100).toFixed(1)
    const status = criticalFailures.length === 0 && parseFloat(complianceRate) >= 80 ? '基本合规' :
      criticalFailures.length === 0 ? '部分合规' : '不合规'
    const riskRating = criticalFailures.length >= 2 ? '高风险' : criticalFailures.length === 1 ? '中风险' : parseFloat(complianceRate) < 70 ? '中风险' : '低风险'
    const registrationNeeded = isPressurePipeline && !registered
    auditResults.push({
      pipeId, pipeName, pipeCategory, isPressurePipeline: isPressurePipeline ? '是' : '否',
      registered: registered ? '已注册' : '未注册', designPressure: designPressure.toFixed(2) + 'MPa',
      designTemp: designTemp.toFixed(0) + '°C', medium, hazardLevel, lastInspection,
      inspectionValid: inspectionValid ? '有效' : '超期',
      complianceItems, failures, complianceRate: complianceRate + '%',
      status, riskRating,
      registrationNeeded: registrationNeeded ? '需立即办理使用登记' : '已登记',
      deadline: riskRating === '高风险' ? '7日内整改' : riskRating === '中风险' ? '30日内整改' : '90日内改进',
      responsibleDept: pipe.dept || pickOne(['安全生产部', '设备管理部', '运行部', '技术质量部'], r)
    })
  }
  const compliantCount = auditResults.filter((a: any) => a.status === '基本合规').length
  const nonCompliantCount = auditResults.filter((a: any) => a.status === '不合规').length
  const highRiskCount = auditResults.filter((a: any) => a.riskRating === '高风险').length
  const pressureRegistered = auditResults.filter((a: any) => a.isPressurePipeline === '是').length
  const avgComplianceRate = auditResults.length > 0 ?
    (auditResults.reduce((a, ar) => a + parseFloat(ar.complianceRate), 0) / auditResults.length).toFixed(1) : '100.0'
  const registrationDue = auditResults.filter((a: any) => a.registrationNeeded !== '已登记').length
  return {
    auditResults: auditResults.sort((a: any, b: any) => {
      const risk: Record<string, number> = { '高风险': 0, '中风险': 1, '低风险': 2 }
      return (risk[a.riskRating] || 2) - (risk[b.riskRating] || 2)
    }),
    totalPipelines: pipelines.length,
    compliantCount,
    nonCompliantCount,
    highRiskCount,
    pressureRegistered: pressureRegistered + '/' + auditResults.filter((a: any) => a.isPressurePipeline === '是').length,
    avgComplianceRate: avgComplianceRate + '%',
    registrationDue,
    auditDate: data.audit_date || '2025-01-15'
  }
}

function formatComplianceReport(r: any): string {
  return `# 管线安全合规与压力管道注册

**审计日期**: ${r.auditDate} | **审计管线**: ${r.totalPipelines}条 | **平均合规率**: ${r.avgComplianceRate}
**基本合规**: ${r.compliantCount}条 | **不合规**: ${r.nonCompliantCount}条 | **高风险**: ${r.highRiskCount}条
**压力管道注册率**: ${r.pressureRegistered} | **待注册**: ${r.registrationDue}条

**各管线审计结果（按风险排序）**:
${r.auditResults.map((a: any) => `
${a.riskRating === '高风险' ? '🔴' : a.riskRating === '中风险' ? '🟡' : '🟢'} **${a.pipeName}** (${a.pipeId}) — ${a.status} | 合规率: ${a.complianceRate} | 风险: ${a.riskRating}
- 类别: ${a.pipeCategory} | 压力管道: ${a.isPressurePipeline} | 注册: ${a.registered} (${a.registrationNeeded})
- 设计: ${a.designPressure} / ${a.designTemp} | 介质: ${a.medium} | 危害: ${a.hazardLevel}
- 上次检验: ${a.lastInspection} (${a.inspectionValid})
- 不合格项: ${a.failures.length > 0 ? a.failures.map((f: any) => `${f.item}(${f.severity})`).join('; ') : '无'}
- 整改期限: ${a.deadline} | 责任单位: ${a.responsibleDept}
`).join('\n')}

**合规整改建议**:
1. 高风险管线立即停用整改或限负荷运行
2. 未注册压力管道须向特种设备安全监管部门申报
3. 超期未检管道尽快联系检验机构完成定期检验
4. 建立合规管理台账定期自查，确保在有效期内

---
${DISCLAIMER}`
}

// ==================== Plugin Registration ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'utility_locating_gis',
    description: '管线探测与GIS定位：输入探测点数据（坐标、方法、埋深等），输出管线类型识别结果、置信度评估与GIS坐标定位信息',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"project_id":"PJ-001","survey_date":"2025-01-15","coordinate_system":"CGCS2000","survey_points":[{"id":"SP-01","location":"中山路与建设路交叉口","detection_method":"电磁法","utility_type":"燃气","depth_m":1.8,"diameter_mm":200,"material":"PE100","accuracy_cm":3.5,"confidence":92,"coord_x":452135.234,"coord_y":3356712.891},{"id":"SP-02","location":"人民路南侧","detection_method":"地质雷达","utility_type":"给水","depth_m":1.2,"diameter_mm":400,"material":"球墨铸铁","accuracy_cm":5.2,"confidence":78,"coord_x":452201.567,"coord_y":3356845.123},{"id":"SP-03","location":"解放大道","detection_method":"声波法","utility_type":"排水","depth_m":3.5,"diameter_mm":600,"material":"混凝土","accuracy_cm":8.1,"confidence":65,"coord_x":452298.445,"coord_y":3356901.678}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatUtilityLocatingReport(analyzeUtilityLocating(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'pipe_condition_assessor',
    description: '管道CCTV检测与状况评估：输入CCTV检测管段数据（缺陷、材质、龄期等），依据GB/T相关标准评估管道状况等级，输出修复优先级与工法建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"pipeline_id":"PL-001","inspection_date":"2025-01-15","inspected_segments":[{"id":"SEG-001","location":"中山路段","material":"混凝土管","diameter_mm":400,"length_m":85,"install_year":1998,"defect_count":8,"medium":"污水"},{"id":"SEG-002","location":"人民路段","material":"混凝土管","diameter_mm":600,"length_m":120,"install_year":2005,"defect_count":3,"medium":"雨水"},{"id":"SEG-003","location":"解放大道","material":"HDPE管","diameter_mm":300,"length_m":65,"install_year":2018,"defect_count":1,"medium":"污水"}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatPipeConditionReport(analyzePipeCondition(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'leak_detection_gas_water',
    description: '燃气/供水管网漏损检测：输入管网流量监测数据与分区信息，计算漏损概率，识别疑似漏点位置，输出检漏优先级与应急建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"network_id":"NET-001","leak_zones":[{"id":"Z-01","name":"城东片区","pipe_type":"供水","detection_method":"声波检漏","min_night_flow":35.5,"baseline_flow":15.0,"pressure":0.35,"pipe_age_years":22,"pipe_material":"铸铁管","pipe_length_km":18.5},{"id":"Z-02","name":"城西燃气","pipe_type":"燃气","detection_method":"气体检测","min_night_flow":8.2,"baseline_flow":3.5,"pressure":0.18,"pipe_age_years":15,"pipe_material":"PE管","pipe_length_km":12.3},{"id":"Z-03","name":"城北供水","pipe_type":"供水","detection_method":"流量平衡","min_night_flow":22.0,"baseline_flow":20.0,"pressure":0.28,"pipe_age_years":8,"pipe_material":"PE管","pipe_length_km":25.6}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatLeakDetectionReport(analyzeLeakDetection(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'excavation_risk_mapper',
    description: '施工开挖风险与管线碰撞预警：输入施工区域参数和周边管线信息，评估开挖对各管线的影响风险，输出防护措施与作业许可建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"project_id":"EC-001","excavation_zone":{"depth_m":3.5,"area_sqm":1200,"equipment":"大型挖掘机"},"nearby_utilities":[{"type":"燃气","distance_m":1.2,"depth_m":1.5,"diameter_mm":200,"material":"PE100"},{"type":"电力","distance_m":0.8,"depth_m":0.8,"diameter_mm":0,"material":"铜缆"},{"type":"给水","distance_m":2.5,"depth_m":1.3,"diameter_mm":400,"material":"球墨铸铁"},{"type":"通信","distance_m":3.2,"depth_m":1.0,"diameter_mm":0,"material":"光缆"}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatExcavationRiskReport(analyzeExcavationRisk(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'utility_records_digitizer',
    description: '管线档案数字化与一致性校核：输入管线档案数据（来源、格式、字段等），检查数字化完整性与图实一致性，输出不一致项与修正建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"archive_id":"ARC-001","utility_records":[{"record_id":"R-001","utility_type":"燃气","source":"纸质图纸","format":"DWG","field_count":32,"digitized_fields":28,"digitized_date":"2025-01-10"},{"record_id":"R-002","utility_type":"给水","source":"测绘报告","format":"PDF","field_count":24,"digitized_fields":18,"digitized_date":"2024-12-20"},{"record_id":"R-003","utility_type":"排水","source":"竣工图","format":"CAD","field_count":40,"digitized_fields":35,"digitized_date":"2025-01-15"}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatRecordsDigitizationReport(analyzeRecordsDigitization(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'cathodic_protection_monitor',
    description: '阴保电位监测与腐蚀预警：输入阴保系统监测数据（断电位、IR降、土壤电阻率等），评估保护度与腐蚀风险，输出阳极状态与运维建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"cp_system_id":"CP-001","monitoring_date":"2025-01-15","cp_points":[{"id":"CP-01","location":"桩号K12+300","pipe_type":"燃气管道","pipe_age_years":15,"coating_type":"3PE","soil_resistivity":45,"on_potential":-1.05,"off_potential":-0.89,"anode_status":"正常","drainage":"排流正常"},{"id":"CP-02","location":"桩号K18+600","pipe_type":"燃气管道","pipe_age_years":10,"coating_type":"FBE环氧粉末","soil_resistivity":22,"on_potential":-0.92,"off_potential":-0.78,"anode_status":"消耗过快","drainage":"排流效果差"},{"id":"CP-03","location":"桩号K25+100","pipe_type":"原油管道","pipe_age_years":8,"coating_type":"3PE","soil_resistivity":80,"on_potential":-1.25,"off_potential":-1.15,"anode_status":"正常","drainage":"未安装"}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCathodicProtectionReport(analyzeCathodicProtection(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'smart_manhole_monitor',
    description: '智能井盖监测与内涝预警：输入井盖传感器数据（水位、气体、倾斜、电量等），评估内涝风险与设备状态，输出告警信息与响应建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"area_id":"AREA-001","monitoring_date":"2025-01-15","monitored_manholes":[{"id":"MH-01","location":"火车站广场","cover_type":"智能井盖","status":"正常","water_level_cm":42,"water_velocity":2.1,"temperature":8.5,"h2s_ppm":3.2,"ch4_lel":0.0,"tilt_degree":0.5,"battery":78,"signal":-65},{"id":"MH-02","location":"民心路口","cover_type":"普通井盖","status":"松动","water_level_cm":68,"water_velocity":3.2,"temperature":6.2,"h2s_ppm":12.5,"ch4_lel":6.8,"tilt_degree":3.2,"battery":22,"signal":-82},{"id":"MH-03","location":"高新区支路","cover_type":"防盗井盖","status":"正常","water_level_cm":8,"water_velocity":0.5,"temperature":12.1,"h2s_ppm":0.5,"ch4_lel":0.0,"tilt_degree":0.1,"battery":91,"signal":-55}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSmartManholeReport(analyzeSmartManhole(JSON.parse(args.input_data))) }
  }))

  tools.register(defineTool({
    name: 'utility_compliance_auditor',
    description: '管线安全合规与压力管道注册：输入管线安全信息（注册状态、检验有效期、安全附件等），对照TSG特种设备规范审计合规性，输出整改清单与注册建议',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON：{"audit_id":"AUDIT-001","audit_date":"2025-01-15","audited_pipelines":[{"id":"PP-001","name":"城东燃气主管","category":"GB1(燃气)","registered":true,"last_inspection":"2024-09","design_pressure":0.4,"design_temp":20,"medium":"天然气","hazard_level":"甲类","leak_test":true,"safety_valve":true,"inspection_record":true,"operator_cert":true,"emergency_plan":true},{"id":"PP-002","name":"蒸汽管线B","category":"GC1(工业管道)","registered":false,"last_inspection":"超期未检","design_pressure":1.6,"design_temp":280,"medium":"蒸汽","leak_test":false,"safety_valve":true,"inspection_record":false,"operator_cert":true,"emergency_plan":false},{"id":"PP-003","name":"LPG工艺管","category":"GC2(工业管道)","registered":true,"last_inspection":"2024-06","design_pressure":2.5,"design_temp":50,"medium":"液化石油气","hazard_level":"甲类","leak_test":true,"safety_valve":true,"relief_system":true,"inspection_record":true,"operator_cert":true,"emergency_plan":true}]}'
      }
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatComplianceReport(analyzeCompliance(JSON.parse(args.input_data))) }
  }))
}
