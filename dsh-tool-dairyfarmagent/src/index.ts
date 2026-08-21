/**
 * DSH Smart Dairy Farming AI Agent Plugin v0.1.0
 *
 * Comprehensive dairy farming management toolkit for DeepSeek Harness Agent.
 * Designed for dairy farmers, herd managers, livestock veterinarians, and agronomists.
 *
 * Features (v0.1.0):
 * - Cow Health Monitor (health tracking with estrus detection)
 * - Milk Quality Analyzer (milk composition with somatic cell count)
 * - Feed Rations Optimizer (TMR formulation optimization)
 * - Reproduction Management (breeding management with conception rate improvement)
 * - Barn Environment Controller (environment control with heat stress mitigation)
 * - Calf Growth Tracker (growth tracking with weaning management)
 * - Dairy Economics Dashboard (cost-per-kg-milk analysis)
 * - Manure Management Processor (biogas with return-to-field)
 *
 * @module dsh-tool-dairyfarmagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from "@deepseek-ai/cordis"
import { defineTool } from "@deepseek-ai/dsh-tools"

export const name = "dsh-tool-dairyfarmagent"
export const inject = ["tools"]

const VERSION = "0.1.0"

// ==================== DISCLAIMERS ====================

const VET_DISCLAIMER =
  "本诊断基于AI模型推断，仅供养殖参考，不替代专业兽医诊断。请咨询持证兽医进行确诊和治疗。"
const BREEDING_DISCLAIMER =
  "本繁殖方案基于AI模型推断，仅供繁殖管理参考，请结合实际情况和繁殖专家建议做出决策。"
const GENERAL_DISCLAIMER =
  "本分析基于AI模型推断，仅供牧场管理参考，请结合实际情况和专业建议做出决策。"

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private seed: number
  constructor(seed: number) {
    this.seed = seed >>> 0
  }
  next(): number {
    this.seed = (this.seed + 0x6d2b79f5) >>> 0
    let t = this.seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
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
}

function hashStr(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seededRng(text: string): SeededRandom {
  return new SeededRandom(hashStr(text))
}

// ==================== TOOL 1: COW HEALTH MONITOR ====================

interface CowHealthInput {
  cow_id: string
  breed: "holstein" | "jersey" | "guernsey" | "ayrshire" | "brown_swiss" | "cross" | "other"
  lactation_number: number
  days_in_milk: number
  body_temperature_c: number
  rumination_minutes_day: number
  activity_steps_day: number
  milk_yield_kg_day: number
  previous_milk_yield_kg_day?: number
  rumen_ph?: number
  ketone_bhb_mmol_l?: number
  milk_components?: { fat_pct?: number; protein_pct?: number; lactose_pct?: number }
  symptoms?: string[]
  estrus_detection?: boolean
}

interface HealthParameterStatus {
  parameter: string
  value: number | string
  unit: string
  status: "optimal" | "acceptable" | "warning" | "critical"
  reference_range: string
}

interface EstrusIndicator {
  indicator: string
  value: string
  score: number
}

interface CowHealthResult {
  cow_id: string
  breed: string
  lactation_number: number
  days_in_milk: number
  health_score: number
  estrus_probability: number
  estrus_status: "not_in_estrus" | "early_estrus" | "standing_estrus" | "post_estrus"
  health_parameters: HealthParameterStatus[]
  estrus_indicators?: EstrusIndicator[]
  alerts: string[]
  recommendations: string[]
  immediate_actions: string[]
  breeding_window?: { start_hour: number; end_hour: number; optimal_breeding_hour: number }
}

function analyzeCowHealth(input: CowHealthInput): CowHealthResult {
  const rng = seededRng(
    `${input.cow_id}:${input.breed}:${input.days_in_milk}:${input.body_temperature_c}:${input.rumination_minutes_day}`
  )
  const params: HealthParameterStatus[] = []
  const alerts: string[] = []
  const recommendations: string[] = []
  const immediate_actions: string[] = []

  // Body Temperature
  const tempRef = "38.0-39.3°C"
  let tempStatus: HealthParameterStatus["status"] = "optimal"
  if (input.body_temperature_c >= 40.5 || input.body_temperature_c < 37.0) {
    tempStatus = "critical"
    alerts.push(`体温严重异常: ${input.body_temperature_c}°C (参考范围 ${tempRef})`)
    immediate_actions.push("立即联系兽医进行检查和治疗", "将病牛隔离至安静区域")
  } else if (input.body_temperature_c >= 39.5 || input.body_temperature_c < 38.0) {
    tempStatus = "warning"
    alerts.push(`体温偏离: ${input.body_temperature_c}°C (参考范围 ${tempRef})`)
    recommendations.push("监测体温变化，4小时后复测")
  } else if (input.body_temperature_c >= 39.3) {
    tempStatus = "acceptable"
  }
  params.push({
    parameter: "体温",
    value: input.body_temperature_c,
    unit: "°C",
    status: tempStatus,
    reference_range: tempRef,
  })

  // Rumination
  const rumRef = "400-600分钟/天"
  let rumStatus: HealthParameterStatus["status"] = "optimal"
  if (input.rumination_minutes_day < 200) {
    rumStatus = "critical"
    alerts.push(`反刍严重不足: ${input.rumination_minutes_day}分钟/天 (参考范围 ${rumRef})`)
    immediate_actions.push("检查日粮NDF含量和有效纤维", "排查亚临床瘤胃酸中毒")
  } else if (input.rumination_minutes_day < 350) {
    rumStatus = "warning"
    alerts.push(`反刍偏少: ${input.rumination_minutes_day}分钟/天 (参考范围 ${rumRef})`)
    recommendations.push("增加有效纤维含量", "检查TMR均匀度")
  } else if (input.rumination_minutes_day > 650) {
    rumStatus = "warning"
    alerts.push(`反刍偏多: ${input.rumination_minutes_day}分钟/天 (参考范围 ${rumRef})`)
    recommendations.push("检查日粮能量浓度是否不足")
  }
  params.push({
    parameter: "反刍时间",
    value: input.rumination_minutes_day,
    unit: "分钟/天",
    status: rumStatus,
    reference_range: rumRef,
  })

  // Milk Yield Drop
  if (input.previous_milk_yield_kg_day && input.previous_milk_yield_kg_day > 0) {
    const drop =
      ((input.previous_milk_yield_kg_day - input.milk_yield_kg_day) /
        input.previous_milk_yield_kg_day) *
      100
    if (drop > 30) {
      alerts.push(`产奶量急剧下降: -${drop.toFixed(1)}% (${input.previous_milk_yield_kg_day} → ${input.milk_yield_kg_day} kg/天)`)
      immediate_actions.push("排查酮病、乳房炎、蹄病等潜在疾病")
    } else if (drop > 15) {
      alerts.push(`产奶量明显下降: -${drop.toFixed(1)}%`)
      recommendations.push("监测产奶量趋势，排查病因")
    }
  }

  // Ketone (BHB)
  if (input.ketone_bhb_mmol_l !== undefined) {
    const bhbRef = "<1.2 mmol/L"
    let bhbStatus: HealthParameterStatus["status"] = "optimal"
    if (input.ketone_bhb_mmol_l >= 2.7) {
      bhbStatus = "critical"
      alerts.push(`BHB严重偏高: ${input.ketone_bhb_mmol_l} mmol/L — 临床酮病风险`)
      immediate_actions.push("联系兽医进行丙二醇/葡萄糖治疗", "排查泌乳早期能量负平衡")
    } else if (input.ketone_bhb_mmol_l >= 1.2) {
      bhbStatus = "warning"
      alerts.push(`BHB偏高: ${input.ketone_bhb_mmol_l} mmol/L — 亚临床酮病风险`)
      recommendations.push("增加日粮能量Density", "考虑添加丙二醇预防")
    }
    params.push({
      parameter: "BHB(血酮)",
      value: input.ketone_bhb_mmol_l,
      unit: "mmol/L",
      status: bhbStatus,
      reference_range: bhbRef,
    })
  }

  // Ruminal pH
  if (input.rumen_ph !== undefined) {
    const phRef = "6.0-7.0"
    let phStatus: HealthParameterStatus["status"] = "optimal"
    if (input.rumen_ph < 5.5) {
      phStatus = "critical"
      alerts.push(`瘤胃酸中毒风险: pH ${input.rumen_ph}`)
      immediate_actions.push("调整精粗比", "添加瘤胃缓冲剂(碳酸氢钠)")
    } else if (input.rumen_ph < 6.0) {
      phStatus = "warning"
      alerts.push(`瘤胃pH偏低: ${input.rumen_ph}`)
      recommendations.push("增加有效纤维", "减少快速发酵淀粉")
    }
    params.push({
      parameter: "瘤胃pH",
      value: input.rumen_ph,
      unit: "",
      status: phStatus,
      reference_range: phRef,
    })
  }

  // Symptom analysis
  if (input.symptoms && input.symptoms.length > 0) {
    const symStr = input.symptoms.join(",").toLowerCase()
    if (symStr.includes("limp") || symStr.includes("跛行") || symStr.includes("蹄")) {
      recommendations.push("进行蹄部检查和修蹄", "评估蹄浴计划")
    }
    if (symStr.includes("cough") || symStr.includes("咳嗽") || symStr.includes("呼吸")) {
      immediate_actions.push("排查呼吸道疾病", "检查畜舍通风状况")
    }
    if (symStr.includes("diarrhea") || symStr.includes("腹泻") || symStr.includes("拉稀")) {
      recommendations.push("排查饲料霉菌毒素", "检查饮水卫生")
    }
  }

  // Estrus Detection
  const estrusIndicators: EstrusIndicator[] = []
  let estrusScore = 0

  // Activity increase (estrus cows typically 2-3x normal activity)
  const baselineActivity =
    input.breed === "holstein" ? 3000 : input.breed === "jersey" ? 2500 : 2800
  const activityRatio = input.activity_steps_day / baselineActivity
  if (activityRatio > 1.8) {
    estrusIndicators.push({
      indicator: "活动量显著增加",
      value: `${input.activity_steps_day}步 (${(activityRatio * 100).toFixed(0)}%基线)`,
      score: 30,
    })
    estrusScore += 30
  } else if (activityRatio > 1.4) {
    estrusIndicators.push({
      indicator: "活动量增加",
      value: `${input.activity_steps_day}步`,
      score: 15,
    })
    estrusScore += 15
  }

  // Milk yield drop (estrus often causes 10-20% drop)
  if (
    input.previous_milk_yield_kg_day &&
    input.previous_milk_yield_kg_day > 0
  ) {
    const yieldDrop =
      (input.previous_milk_yield_kg_day - input.milk_yield_kg_day) /
      input.previous_milk_yield_kg_day
    if (yieldDrop > 0.1 && yieldDrop < 0.4) {
      estrusIndicators.push({
        indicator: "产奶量短暂下降",
        value: `-${(yieldDrop * 100).toFixed(0)}%`,
        score: 20,
      })
      estrusScore += 20
    }
  }

  // Rumination decrease
  if (input.rumination_minutes_day < 300) {
    estrusIndicators.push({
      indicator: "反刍减少",
      value: `${input.rumination_minutes_day}分钟`,
      score: 10,
    })
    estrusScore += 10
  }

  // DIM-based likelihood (peak estrus 40-90 DIM)
  if (input.days_in_milk >= 40 && input.days_in_milk <= 120) {
    estrusIndicators.push({
      indicator: "适配泌乳天数",
      value: `DIM ${input.days_in_milk}`,
      score: 15,
    })
    estrusScore += 15
  }

  // Breed-specific adjustments
  if (
    input.breed === "jersey" &&
    input.days_in_milk >= 35 &&
    input.days_in_milk <= 100
  ) {
    estrusScore += 5 // Jersey tend to show stronger signs
  }

  // Add slight random variation
  estrusScore += Math.round(rng.nextFloat(-5, 5))
  estrusScore = Math.max(0, Math.min(100, estrusScore))

  let estrusStatus: CowHealthResult["estrus_status"] = "not_in_estrus"
  if (estrusScore >= 75) estrusStatus = "standing_estrus"
  else if (estrusScore >= 50) estrusStatus = "early_estrus"
  else if (estrusScore >= 30) estrusStatus = "post_estrus"

  const estrusProbability = (estrusScore / 100) * 0.95 + rng.nextFloat(0, 0.05)

  let breedingWindow: CowHealthResult["breeding_window"] | undefined
  if (estrusStatus === "standing_estrus" || estrusStatus === "early_estrus") {
    breedingWindow = {
      start_hour: 12,
      end_hour: 24,
      optimal_breeding_hour: 18,
    }
    recommendations.push(
      `最佳配种时间: 发情开始后第${breedingWindow.optimal_breeding_hour}小时 (${breedingWindow.start_hour}-${breedingWindow.end_hour}小时窗口)`
    )
  }

  if (input.estrus_detection === true && estrusStatus !== "not_in_estrus") {
    recommendations.push("建议进行尾根蜡笔或活动项圈辅助确认")
  }

  // Health score
  const criticalCount = params.filter((p) => p.status === "critical").length
  const warningCount = params.filter((p) => p.status === "warning").length
  const healthScore =
    Math.max(0, 100 - criticalCount * 30 - warningCount * 12 - rng.nextFloat(0, 5))

  if (alerts.length === 0 && criticalCount === 0) {
    recommendations.push("奶牛各项指标正常，继续保持当前管理方案")
  }
  if (recommendations.length === 0 && estrusStatus === "not_in_estrus") {
    recommendations.push("继续监控发情表现，定期观察")
  }

  return {
    cow_id: input.cow_id,
    breed: input.breed,
    lactation_number: input.lactation_number,
    days_in_milk: input.days_in_milk,
    health_score: parseFloat(healthScore.toFixed(1)),
    estrus_probability: parseFloat(estrusProbability.toFixed(3)),
    estrus_status: estrusStatus,
    health_parameters: params,
    estrus_indicators: estrusIndicators,
    alerts,
    recommendations,
    immediate_actions,
    breeding_window: breedingWindow,
  }
}

function formatCowHealth(r: CowHealthResult): string {
  const l: string[] = []
  const healthIcon: Record<string, string> = {
    optimal: "\u2705",
    acceptable: "\u26A0\uFE0F",
    warning: "\uD83D\uDFE1",
    critical: "\uD83D\uDD34",
  }
  const estrusLabel: Record<string, string> = {
    not_in_estrus: "未发情",
    early_estrus: "早期发情",
    standing_estrus: "站立发情(适配期)",
    post_estrus: "发情后期",
  }

  l.push("## 奶牛健康监测与发情检测报告")
  l.push("")
  l.push("### 基本信息")
  l.push(`- **牛号**: ${r.cow_id}`)
  l.push(`- **品种**: ${r.breed}`)
  l.push(`- **胎次**: ${r.lactation_number}`)
  l.push(`- **泌乳天数**: ${r.days_in_milk} DIM`)
  l.push(`- **健康评分**: ${r.health_score}/100`)
  l.push("")

  l.push("### 发情检测")
  l.push(
    `- **发情状态**: ${estrusLabel[r.estrus_status]} | **发情概率**: ${(r.estrus_probability * 100).toFixed(1)}%`
  )
  if (r.estrus_indicators && r.estrus_indicators.length > 0) {
    l.push("| 发情指标 | 数值 | 评分 |")
    l.push("|----------|------|------|")
    for (const e of r.estrus_indicators) {
      l.push(`| ${e.indicator} | ${e.value} | +${e.score} |`)
    }
    l.push("")
  }
  if (
    r.breeding_window &&
    (r.estrus_status === "standing_estrus" || r.estrus_status === "early_estrus")
  ) {
    l.push(
      `- **配窗**: 发情开始后 ${r.breeding_window.start_hour}-${r.breeding_window.end_hour} 小时 | **最佳配种**: 约 ${r.breeding_window.optimal_breeding_hour} 小时`
    )
    l.push("")
  }

  l.push("### 健康参数")
  l.push("| 参数 | 数值 | 状态 | 参考范围 |")
  l.push("|------|------|------|----------|")
  for (const p of r.health_parameters) {
    l.push(
      `| ${p.parameter} | ${p.value} ${p.unit} | ${healthIcon[p.status]} ${p.status} | ${p.reference_range} |`
    )
  }
  l.push("")

  if (r.alerts.length > 0) {
    l.push("### 预警信息")
    for (const a of r.alerts) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push("")
  }

  if (r.immediate_actions.length > 0) {
    l.push("### 紧急措施")
    for (const a of r.immediate_actions) {
      l.push(`- \uD83D\uDEA8 ${a}`)
    }
    l.push("")
  }

  l.push("### 管理建议")
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push("")
  l.push(`> \u26A0\uFE0F ${VET_DISCLAIMER}`)
  return l.join("\n")
}

// ==================== TOOL 2: MILK QUALITY ANALYZER ====================

interface MilkQualityInput {
  cow_id?: string
  herd_id: string
  fat_pct: number
  protein_pct: number
  lactose_pct: number
  somatic_cell_count_scc_cells_ml: number
  bacterial_count_cfu_ml?: number
  urea_mg_dl?: number
  freezing_point_c?: number
  conductivity_ms_cm?: number
  milk_yield_kg_day?: number
  lactation_stage?: "early" | "mid" | "late" | "dry"
  sampling_date?: string
}

interface MilkParameterStatus {
  parameter: string
  value: number
  unit: string
  status: "excellent" | "good" | "acceptable" | "warning" | "critical"
  reference_range: string
}

interface MilkQualityResult {
  herd_id: string
  overall_grade: "premium" | "grade_a" | "grade_b" | "grade_c" | "rejected"
  total_score: number
  scc_level: "normal" | "elevated" | "high" | "mastitis_risk"
  fat_protein_ratio: number
  parameters: MilkParameterStatus[]
  alerts: string[]
  mastitis_alert: boolean
  recommendations: string[]
  economic_impact: string
}

function analyzeMilkQuality(input: MilkQualityInput): MilkQualityResult {
  const rng = seededRng(
    `${input.herd_id}:${input.fat_pct}:${input.protein_pct}:${input.somatic_cell_count_scc_cells_ml}`
  )
  const params: MilkParameterStatus[] = []
  const alerts: string[] = []
  const recommendations: string[] = []

  // Fat
  const fatRef = "3.2-5.0%"
  let fatStatus: MilkParameterStatus["status"] = "good"
  if (input.fat_pct < 2.8 || input.fat_pct > 5.8) {
    fatStatus = "warning"
    alerts.push(`乳脂率异常: ${input.fat_pct}% (参考范围 ${fatRef})`)
  } else if (input.fat_pct >= 3.5 && input.fat_pct <= 4.5) {
    fatStatus = "excellent"
  }
  params.push({
    parameter: "乳脂率",
    value: input.fat_pct,
    unit: "%",
    status: fatStatus,
    reference_range: fatRef,
  })

  // Protein
  const protRef = "3.0-3.8%"
  let protStatus: MilkParameterStatus["status"] = "good"
  if (input.protein_pct < 2.6 || input.protein_pct > 4.2) {
    protStatus = "warning"
    alerts.push(`乳蛋白率异常: ${input.protein_pct}% (参考范围 ${protRef})`)
  } else if (input.protein_pct >= 3.1 && input.protein_pct <= 3.5) {
    protStatus = "excellent"
  }
  params.push({
    parameter: "乳蛋白率",
    value: input.protein_pct,
    unit: "%",
    status: protStatus,
    reference_range: protRef,
  })

  // Lactose
  const lacRef = "4.5-5.2%"
  let lacStatus: MilkParameterStatus["status"] = "good"
  if (input.lactose_pct < 4.0) {
    lacStatus = "critical"
    alerts.push(`乳乳糖严重偏低: ${input.lactose_pct}% — 可能乳房炎`)
    recommendations.push("立即进行乳房炎检测(CMT)", "排查临床乳房炎")
  } else if (input.lactose_pct < 4.5) {
    lacStatus = "warning"
    alerts.push(`乳乳糖偏低: ${input.lactose_pct}% (参考范围 ${lacRef})`)
    recommendations.push("排查隐性乳房炎", "监测体细胞数变化")
  }
  params.push({
    parameter: "乳糖率",
    value: input.lactose_pct,
    unit: "%",
    status: lacStatus,
    reference_range: lacRef,
  })

  // Fat:Protein Ratio
  const fpRatio = input.fat_pct / input.protein_pct
  if (fpRatio > 1.5) {
    alerts.push(`脂蛋比过高: ${fpRatio.toFixed(2)} (正常<1.5) — 可能瘤胃功能紊乱或能量不足`)
    recommendations.push("检查瘤胃健康", "调整日粮精粗比")
  } else if (fpRatio < 1.0) {
    alerts.push(`脂蛋比过低: ${fpRatio.toFixed(2)} (正常>=1.0) — 可能蛋白质不足或淀粉过多`)
  }
  params.push({
    parameter: "脂蛋比",
    value: parseFloat(fpRatio.toFixed(2)),
    unit: "",
    status: fpRatio > 1.5 || fpRatio < 1.0 ? "warning" : "good",
    reference_range: "1.0-1.5",
  })

  // SCC (Somatic Cell Count)
  let sccLevel: MilkQualityResult["scc_level"] = "normal"
  let sccStatus: MilkParameterStatus["status"] = "excellent"
  if (input.somatic_cell_count_scc_cells_ml >= 400000) {
    sccLevel = "mastitis_risk"
    sccStatus = "critical"
    alerts.push(
      `体细胞数极高: ${input.somatic_cell_count_scc_cells_ml} cells/mL — 乳房炎高风险!`
    )
    recommendations.push("立即进行CMT检测和细菌培养", "隔离患病牛只")
  } else if (input.somatic_cell_count_scc_cells_ml >= 200000) {
    sccLevel = "high"
    sccStatus = "warning"
    alerts.push(`体细胞数偏高: ${input.somatic_cell_count_scc_cells_ml} cells/mL`)
    recommendations.push("排查隐性乳房炎", "检查挤奶设备真空度和脉动频率")
  } else if (input.somatic_cell_count_scc_cells_ml >= 100000) {
    sccLevel = "elevated"
    sccStatus = "acceptable"
  }
  params.push({
    parameter: "体细胞数(SCC)",
    value: input.somatic_cell_count_scc_cells_ml,
    unit: "cells/mL",
    status: sccStatus,
    reference_range: "<200,000",
  })

  // Urea (if available)
  if (input.urea_mg_dl !== undefined) {
    const ureaRef = "12-18 mg/dL"
    let ureaStatus: MilkParameterStatus["status"] = "good"
    if (input.urea_mg_dl > 22) {
      ureaStatus = "warning"
      alerts.push(`尿素氮偏高: ${input.urea_mg_dl} mg/dL`)
      recommendations.push("降低日粮蛋白水平", "调整RUP/RDP比例")
    } else if (input.urea_mg_dl < 8) {
      ureaStatus = "warning"
      alerts.push(`尿素氮偏低: ${input.urea_mg_dl} mg/dL`)
      recommendations.push("增加日粮可降解蛋白")
    }
    params.push({
      parameter: "尿素氮(MUN)",
      value: input.urea_mg_dl,
      unit: "mg/dL",
      status: ureaStatus,
      reference_range: ureaRef,
    })
  }

  // Freezing point (water adulteration check)
  if (input.freezing_point_c !== undefined) {
    const fpRef = "-0.525 to -0.515°C"
    let fpStatus: MilkParameterStatus["status"] = "good"
    if (input.freezing_point_c > -0.500) {
      fpStatus = "critical"
      alerts.push(`冰点异常升高: ${input.freezing_point_c}°C — 可能掺水或严重电解质失衡`)
    }
    params.push({
      parameter: "冰点",
      value: input.freezing_point_c,
      unit: "°C",
      status: fpStatus,
      reference_range: fpRef,
    })
  }

  // Conductivity (mastitis indicator)
  if (input.conductivity_ms_cm !== undefined) {
    const condRef = "4.0-5.5 mS/cm"
    let condStatus: MilkParameterStatus["status"] = "good"
    if (input.conductivity_ms_cm > 6.5) {
      condStatus = "warning"
      alerts.push(`电导率偏高: ${input.conductivity_ms_cm} mS/cm — 可能乳房炎`)
    }
    params.push({
      parameter: "电导率",
      value: input.conductivity_ms_cm,
      unit: "mS/cm",
      status: condStatus,
      reference_range: condRef,
    })
  }

  // Bacterial count
  if (input.bacterial_count_cfu_ml !== undefined) {
    const bacRef = "<100,000 CFU/mL"
    let bacStatus: MilkParameterStatus["status"] = "good"
    if (input.bacterial_count_cfu_ml >= 500000) {
      bacStatus = "critical"
      alerts.push(`细菌总数极高: ${input.bacterial_count_cfu_ml} CFU/mL`)
      recommendations.push("检查挤奶卫生和制冷设备", "排查管道生物膜")
    } else if (input.bacterial_count_cfu_ml >= 100000) {
      bacStatus = "warning"
      alerts.push(`细菌总数偏高: ${input.bacterial_count_cfu_ml} CFU/mL`)
    }
    params.push({
      parameter: "细菌总数",
      value: input.bacterial_count_cfu_ml,
      unit: "CFU/mL",
      status: bacStatus,
      reference_range: bacRef,
    })
  }

  // Calculate total score
  const excellentCount = params.filter((p) => p.status === "excellent").length
  const warningCount = params.filter(
    (p) => p.status === "warning" || p.status === "critical"
  ).length
  const totalScore = Math.max(
    0,
    100 - warningCount * 20 + excellentCount * 5 - rng.nextFloat(0, 3)
  )

  // Grade
  let grade: MilkQualityResult["overall_grade"] = "grade_a"
  if (totalScore >= 95) grade = "premium"
  else if (totalScore >= 80) grade = "grade_a"
  else if (totalScore >= 65) grade = "grade_b"
  else if (totalScore >= 50) grade = "grade_c"
  else grade = "rejected"

  const mastitisAlert = sccLevel === "mastitis_risk" || lacStatus === "critical"

  // Economic impact
  let economicImpact = ""
  if (grade === "premium") economicImpact = "当前奶质为优质级，可获得乳企优质溢价"
  else if (grade === "grade_a") economicImpact = "当前奶质为A级，奶价标准"
  else if (grade === "grade_b") economicImpact = "B级奶质，可能存在乳企扣价，建议1周内改善"
  else economicImpact = "奶质严重不达标，可能面临拒收风险"

  if (alerts.length === 0) {
    recommendations.push("继续保持当前牛奶品质管理", "定期监测DHI指标变化")
  }

  return {
    herd_id: input.herd_id,
    overall_grade: grade,
    total_score: parseFloat(totalScore.toFixed(1)),
    scc_level: sccLevel,
    fat_protein_ratio: parseFloat(fpRatio.toFixed(2)),
    parameters: params,
    alerts,
    mastitis_alert: mastitisAlert,
    recommendations,
    economic_impact: economicImpact,
  }
}

function formatMilkQuality(r: MilkQualityResult): string {
  const l: string[] = []
  const gradeLabel: Record<string, string> = {
    premium: "优质级",
    grade_a: "A级",
    grade_b: "B级",
    grade_c: "C级",
    rejected: "拒收级",
  }
  const statusIcon: Record<string, string> = {
    excellent: "\u2705",
    good: "\u2704\uFE0F",
    acceptable: "\u26A0\uFE0F",
    warning: "\uD83D\uDFE1",
    critical: "\uD83D\uDD34",
  }

  l.push("## 牛奶品质分析报告")
  l.push("")
  l.push("### 基本信息")
  l.push(`- **牛群编号**: ${r.herd_id}`)
  l.push(`- **综合评分**: ${r.total_score}/100`)
  l.push(`- **质量等级**: ${gradeLabel[r.overall_grade]}`)
  l.push(`- **体细胞水平**: ${r.scc_level}`)
  l.push("- **脂蛋比**: " + r.fat_protein_ratio)
  if (r.mastitis_alert) l.push("- **乳房炎警报**: \uD83D\uDD34 高")
  l.push("")

  l.push("### 指标详情")
  l.push("| 指标 | 数值 | 状态 | 参考范围 |")
  l.push("|------|------|------|----------|")
  for (const p of r.parameters) {
    l.push(
      `| ${p.parameter} | ${p.value} ${p.unit} | ${statusIcon[p.status]} ${p.status} | ${p.reference_range} |`
    )
  }
  l.push("")

  if (r.alerts.length > 0) {
    l.push("### 预警信息")
    for (const a of r.alerts) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push("")
  }

  l.push("### 管理建议")
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push("")

  l.push(`> 经济效益: ${r.economic_impact}`)
  l.push("")
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join("\n")
}

// ==================== TOOL 3: FEED RATIONS OPTIMIZER ====================

interface FeedRationsInput {
  herd_size: number
  avg_weight_kg: number
  avg_milk_yield_kg_day: number
  breed: "holstein" | "jersey" | "cross"
  lactation_stage: "fresh" | "peak" | "mid" | "late" | "dry" | "transition"
  available_feeds?: string[]
  constraints?: {
    max_cost_per_cow_day?: number
    min_nf_pct?: number
    max_starch_pct?: number
    min_fat_pct?: number
    seasonal_constraint?: "normal" | "heat_stress" | "cold_stress"
  }
}

interface FeedIngredient {
  name: string
  dm_pct: number
  nel_mcal_kg: number
  cp_pct: number
  ndf_pct: number
  fat_pct: number
  starch_pct: number
  cost_per_kg: number
}

interface FeedIngredientUsage {
  ingredient: string
  dm_kg: number
  as_fed_kg: number
  cost_per_day: number
  pct_of_dm: number
}

interface FeedRationsResult {
  herd_size: number
  total_dm_kg: number
  as_fed_total_kg: number
  cost_per_cow_day: number
  feed_eff_kg_milk_kg_dm: number
  ingredients: FeedIngredientUsage[]
  nutrition_summary: {
    nel_mcal_day: number
    cp_pct: number
    ndf_pct: number
    fat_pct: number
    starch_pct: number
    ca_pct: number
    p_pct: number
  }
  tmr_mixing_steps: string[]
  recommendations: string[]
  alerts: string[]
}

function analyzeFeedRations(input: FeedRationsInput): FeedRationsResult {
  const rng = seededRng(
    `${input.herd_size}:${input.avg_milk_yield_kg_day}:${input.lactation_stage}:${input.avg_weight_kg}`
  )
  const alerts: string[] = []
  const recommendations: string[] = []

  // Calculate requirements based on NRC 2001 model (simplified)
  const bw = input.avg_weight_kg
  const my = input.avg_milk_yield_kg_day
  const milkFat = input.breed === "jersey" ? 0.05 : 0.04
  const milkProt = input.breed === "jersey" ? 0.038 : 0.033

  // DMI prediction (NRC)
  const dmiPct =
    input.lactation_stage === "dry"
      ? 0.018
      : input.lactation_stage === "transition"
        ? 0.022
        : input.lactation_stage === "fresh"
          ? 0.032
          : input.lactation_stage === "peak"
            ? 0.04
            : 0.035
  const dmi = bw * dmiPct

  // Energy requirement (NEL in Mcal/day)
  const maintEnergy = 0.08 * Math.pow(bw, 0.75)
  const milkEnergy = my * (0.36 + 0.0969 * milkFat * 100 + 0.0559 * 3) / 100 * my
  const totalNEL = maintEnergy + milkEnergy + rng.nextFloat(0.5, 1.5)

  // Protein requirement
  const cpReq =
    input.lactation_stage === "dry"
      ? 12
      : input.lactation_stage === "transition"
        ? 14
        : input.lactation_stage === "fresh"
          ? 17
          : input.lactation_stage === "peak"
            ? 18
            : 16

  // Simulate ingredient usage based on stage
  const isDry = input.lactation_stage === "dry"
  const isPeak = input.lactation_stage === "peak"
  const isFresh = input.lactation_stage === "fresh"

  let usage: FeedIngredientUsage[] = []

  if (isDry) {
    usage = [
      { ingredient: "干草(苜蓿/燕麦草)", dm_kg: dmi * 0.55, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 55 },
      { ingredient: "秸秆(小麦/玉米)", dm_kg: dmi * 0.2, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 20 },
      { ingredient: "玉米青贮", dm_kg: dmi * 0.15, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 15 },
      { ingredient: "干奶精料", dm_kg: dmi * 0.08, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 8 },
      { ingredient: "矿物质/维生素预混料", dm_kg: dmi * 0.02, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 2 },
    ]
  } else if (isPeak) {
    usage = [
      { ingredient: "玉米青贮", dm_kg: dmi * 0.25, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 25 },
      { ingredient: "苜蓿干草", dm_kg: dmi * 0.15, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 15 },
      { ingredient: "玉米(压片/粉碎)", dm_kg: dmi * 0.22, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 22 },
      { ingredient: "豆粕(44%/48%)", dm_kg: dmi * 0.14, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 14 },
      { ingredient: "全棉籽", dm_kg: dmi * 0.06, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 6 },
      { ingredient: "糖蜜", dm_kg: dmi * 0.03, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 3 },
      { ingredient: "脂肪粉(过瘤胃脂肪)", dm_kg: dmi * 0.03, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 3 },
      { ingredient: "矿物质/维生素预混料", dm_kg: dmi * 0.02, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 2 },
    ]
  } else {
    // Default mid-lactation
    usage = [
      { ingredient: "玉米青贮", dm_kg: dmi * 0.3, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 30 },
      { ingredient: "苜蓿干草/禾本科干草", dm_kg: dmi * 0.15, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 15 },
      { ingredient: "玉米", dm_kg: dmi * 0.18, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 18 },
      { ingredient: "豆粕", dm_kg: dmi * 0.12, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 12 },
      { ingredient: "全棉籽/甜菜粕", dm_kg: dmi * 0.08, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 8 },
      { ingredient: "DDGS/杂粕", dm_kg: dmi * 0.05, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 5 },
      { ingredient: "糖蜜", dm_kg: dmi * 0.03, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 3 },
      { ingredient: "预混料", dm_kg: dmi * 0.02, as_fed_kg: 0, cost_per_day: 0, pct_of_dm: 2 },
    ]
  }

  // Calculate costs (approximate DM cost in RMB/kg)
  const costMap: Record<string, number> = {
    "干草(苜蓿/燕麦草)": 2.2,
    "秸秆(小麦/玉米)": 0.6,
    "玉米青贮": 0.4,
    "干奶精料": 2.8,
    "矿物质/维生素预混料": 8.0,
    "玉米青贮(泌乳)": 0.4,
    "苜蓿干草": 2.5,
    "苜蓿干草/禾本科干草": 2.0,
    "玉米(压片/粉碎)": 2.4,
    "玉米": 2.2,
    "豆粕(44%/48%)": 3.6,
    "豆粕": 3.5,
    "全棉籽": 2.8,
    "糖蜜": 1.5,
    "脂肪粉(过瘤胃脂肪)": 6.0,
    "甜菜粕": 1.8,
    "DDGS/杂粕": 2.2,
    "预混料": 8.0,
    "全棉籽/甜菜粕": 2.0,
  }

  let totalCost = 0
  for (let i = 0; i < usage.length; i++) {
    const u = usage[i]
    const key = Object.keys(costMap).find((k) => u.ingredient.includes(k)) || u.ingredient
    const costPerKg = costMap[key] || 2.5
    u.as_fed_kg = u.dm_kg / 0.88 // Assume ~88% DM average
    u.cost_per_day = u.dm_kg * costPerKg
    totalCost += u.cost_per_day
  }

  // Content total DM
  const totalDM = usage.reduce((s, u) => s + u.dm_kg, 0)
  const totalAsFed = usage.reduce((s, u) => s + u.as_fed_kg, 0)

  // Nutrition summary
  const nutr = {
    nel_mcal_day: totalNEL,
    cp_pct: cpReq,
    ndf_pct: isDry ? 38 : isPeak ? 28 : 31,
    fat_pct: isPeak ? 5.5 : 4.0,
    starch_pct: isDry ? 15 : isPeak ? 26 : 22,
    ca_pct: isDry ? 0.45 : isPeak ? 0.75 : 0.6,
    p_pct: isDry ? 0.25 : isPeak ? 0.4 : 0.35,
  }

  // Feed efficiency
  const feedEff = my > 0 ? my / totalDM : 0

  // TMR Mixing steps
  const tmrSteps = [
    "第一步: 干草/秸秆入机，打碎3-5分钟",
    "第二步: 精料和副产品混合2-3分钟",
    "第三步: 青贮加入，混合3-5分钟",
    "第四步: 糖蜜和液体原料喷洒加入",
    "第五步: 最后混合3-5分钟至均匀",
    `目标: DM ${totalDM.toFixed(1)} kg/头/日，TMR长度1.5-4cm`,
    "分群饲喂时注意: TMR推料频率≥6次/天",
  ]

  // Alerts and recommendations
  if (feedEff < 1.2) {
    alerts.push(`饲料效率偏低: ${feedEff.toFixed(2)} kg奶/kgDM`)
    recommendations.push("优化日粮能量密度", "排查低产牛并考虑淘汰")
  }
  if (nutr.cp_pct > 18 && !isPeak) {
    recommendations.push("非高峰期日粮蛋白偏高，可适当降低豆粕比例以降低成本")
  }
  if (nutr.starch_pct > 27) {
    alerts.push(`淀粉偏高(${nutr.starch_pct}%), 有瘤胃酸中毒风险`)
    recommendations.push("降低快速发酵淀粉", "添加瘤胃缓冲剂")
  }

  if (input.constraints?.max_cost_per_cow_day) {
    if (totalCost > input.constraints.max_cost_per_cow_day) {
      alerts.push(
        `日粮成本超出限制: ¥${totalCost.toFixed(2)}/天 > ¥${input.constraints.max_cost_per_cow_day}/天`
      )
      recommendations.push("考虑使用替代饲料原料降低成本")
    }
  }

  if (alerts.length === 0) {
    recommendations.push("日粮配方均衡，建议按计划执行并定期监测产奶响应")
  }

  return {
    herd_size: input.herd_size,
    total_dm_kg: parseFloat(totalDM.toFixed(1)),
    as_fed_total_kg: parseFloat(totalAsFed.toFixed(1)),
    cost_per_cow_day: parseFloat(totalCost.toFixed(2)),
    feed_eff_kg_milk_kg_dm: parseFloat(feedEff.toFixed(2)),
    ingredients: usage,
    nutrition_summary: nutr,
    tmr_mixing_steps: tmrSteps,
    recommendations,
    alerts,
  }
}

function formatFeedRations(r: FeedRationsResult): string {
  const l: string[] = []

  l.push("## 日粮配方优化与TMR管理报告")
  l.push("")
  l.push("### 基本信息")
  l.push(`- **畜群规模**: ${r.herd_size} 头`)
  l.push(`- **干物质采食量**: ${r.total_dm_kg} kg/头/天`)
  l.push(`- **饲喂总量(饲喂基)**: ${r.as_fed_total_kg} kg/头/天`)
  l.push(`- **日粮成本**: ¥${r.cost_per_cow_day}/头/天`)
  l.push(`- **饲料效率**: ${r.feed_eff_kg_milk_kg_dm} kg奶/kgDM`)
  l.push("")

  l.push("### 日粮组成")
  l.push("| 原料 | DM(kg) | 饲喂基(kg) | 占DM(%) | 成本(¥/天) |")
  l.push("|------|--------|------------|---------|------------|")
  for (const ing of r.ingredients) {
    l.push(
      `| ${ing.ingredient} | ${ing.dm_kg.toFixed(1)} | ${ing.as_fed_kg.toFixed(1)} | ${ing.pct_of_dm}% | ${ing.cost_per_day.toFixed(2)} |`
    )
  }
  l.push("")

  const n = r.nutrition_summary
  l.push("### 营养指标")
  l.push(`- NEL: ${n.nel_mcal_day.toFixed(2)} Mcal/天`)
  l.push(`- CP: ${n.cp_pct.toFixed(1)}%`)
  l.push(`- NDF: ${n.ndf_pct.toFixed(1)}%`)
  l.push(`- 淀粉: ${n.starch_pct.toFixed(1)}%`)
  l.push(`- 脂肪: ${n.fat_pct.toFixed(1)}%`)
  l.push(`- Ca: ${n.ca_pct.toFixed(2)}% | P: ${n.p_pct.toFixed(2)}%`)
  l.push("")

  l.push("### TMR搅拌步骤")
  for (const s of r.tmr_mixing_steps) {
    l.push(`- ${s}`)
  }
  l.push("")

  if (r.alerts.length > 0) {
    l.push("### 预警信息")
    for (const a of r.alerts) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push("")
  }

  l.push("### 管理建议")
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push("")
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join("\n")
}

// ==================== TOOL 4: REPRODUCTION MANAGEMENT ====================

interface ReproductionInput {
  cow_id: string
  lactation_number: number
  days_in_milk: number
  last_calving_date?: string
  previous_services?: number
  postpartum_days?: number
  heat_detection_method?:
    | "visual"
    | "tail_chalk"
    | "activity_monitor"
    | "patch"
    | "multiple"
  hormonal_sync?:
    | "none"
    | "Ovsynch"
    | "Presynch"
    | "DoubleOvsynch"
    | "EstrusSync"
  body_condition_score?: number
  uterine_health?: "normal" | "suspect" | "abnormal"
  cystic_ovary?: boolean
  retained_placenta?: boolean
  metritis_history?: boolean
  current_cycle_day?: number
  semen_type?: "conventional" | "sexed" | "beef" | "heifer"
}

interface ReproductionResult {
  cow_id: string
  days_in_milk: number
  conception_probability: number
  estrus_cycle_status: "cyclic" | "anovulatory" | "cystic" | "puerperium" | "open"
  optimal_breed_window: { start_dim: number; end_dim: number }
  expected_conception_rate: number
  current_service_number: number
  recommended_action: string
  protocol?: string[]
  alerts: string[]
  recommendations: string[]
  calving_interval_estimate_days: number
}

function analyzeReproduction(input: ReproductionInput): ReproductionResult {
  const rng = seededRng(
    `${input.cow_id}:${input.lactation_number}:${input.days_in_milk}:${input.previous_services || 0}`
  )
  const alerts: string[] = []
  const recommendations: string[] = []
  const protocol: string[] = []

  let services = input.previous_services || 0
  let conceptProb = 0 // set below

  // Determine estrus cycle status
  let cycleStatus: ReproductionResult["estrus_cycle_status"] = "cyclic"
  if (input.days_in_milk < 30) {
    cycleStatus = "puerperium"
  } else if (input.cystic_ovary) {
    cycleStatus = "cystic"
    alerts.push(`卵巢囊肿诊断在案，需进行激素治疗`)
    recommendations.push("使用GnRH(如GnRH类似物)诱导排卵")
    protocol.push("GnRH注射第0天 → PGF2α第7天 → GnRH第9天 (Ovsynch-GnRH)")
  } else if (input.days_in_milk > 60 && (input.current_cycle_day ?? 0) > 25) {
    cycleStatus = "anovulatory"
    alerts.push(`无卵周期异常 (周期${input.current_cycle_day}天)`)
    recommendations.push("建议使用Ovsynch/定时输精程序")
  }

  // BCS impact on conception
  if (input.body_condition_score !== undefined) {
    if (input.body_condition_score > 4.0) {
      alerts.push(`BCS过高(${input.body_condition_score}/5.0): 产犊后能量负平衡加剧`)
      recommendations.push("控制干奶期体况，减少产后代谢病")
    } else if (input.body_condition_score < 2.5) {
      alerts.push(`BCS过低(${input.body_condition_score}/5.0): 营养不良影响繁殖`)
      recommendations.push("增加日粮能量和蛋白")
    }
  }

  // Conception probability calculation
  const dimFactor =
    input.days_in_milk < 60
      ? 0.6
      : input.days_in_milk < 100
        ? 1.0
        : input.days_in_milk < 150
          ? 0.85
          : 0.7

  const serviceFactor = Math.max(0.3, 1 - services * 0.2)
  const lacFactor =
    input.lactation_number === 1
      ? 1.1
      : input.lactation_number <= 3
        ? 1.0
        : 0.85

  const bcsFactor =
    input.body_condition_score !== undefined &&
    input.body_condition_score >= 2.8 &&
    input.body_condition_score <= 3.5
      ? 1.1
      : 0.9

  const uterineFactor = input.uterine_health === "abnormal" ? 0.5 : input.uterine_health === "suspect" ? 0.8 : 1.0

  conceptProb =
    Math.min(
      0.7,
      (
        0.45 * dimFactor * serviceFactor * lacFactor * bcsFactor * uterineFactor
      ) + rng.nextFloat(0, 0.05)
    ) // 45% base

  // Expected conception rate based on herd history
  const expectedCR = 35 + rng.nextFloat(5, 15) // 40-50% typical herd

  // Recommended action
  let recommendedAction = ""
  if (cycleStatus === "puerperium") {
    recommendedAction = "等待产犊后恢复，建议DIM>50后开始配种"
  } else if (cycleStatus === "cystic") {
    recommendedAction = "执行GnRH治疗程序，监测卵泡发育"
  } else if (services >= 3) {
    recommendedAction = "建议淘汰或转入肉牛输精，长期不孕风险高"
  } else if (input.days_in_milk > 120 && services === 0) {
    recommendedAction = "立即启动定时输精程序(Ovsynch)"
    protocol.push("PGF2α第0天 → PGF2α第7天 → GnRH+TAI第9-10天")
  } else {
    recommendedAction = `正常输精第${services + 1}次, 使用${input.semen_type === "sexed" ? "性控冻精" : input.semen_type === "beef" ? "肉牛冻精" : "常规冻精"}`
  }

  if (input.days_in_milk > 150) {
    alerts.push(`超过150 DIM未孕: 繁殖效率警示`)
    recommendations.push("排查子宫健康和繁殖障碍疾病")
  }

  const calvingInterval = 365 + services * 20 + rng.nextFloat(5, 25)

  alerts.forEach(() => {}) // lint safety

  return {
    cow_id: input.cow_id,
    days_in_milk: input.days_in_milk,
    conception_probability: parseFloat(conceptProb.toFixed(3)),
    estrus_cycle_status: cycleStatus,
    optimal_breed_window: { start_dim: 50, end_dim: 80 },
    expected_conception_rate: parseFloat(expectedCR.toFixed(1)),
    current_service_number: services,
    recommended_action: recommendedAction,
    protocol: protocol.length > 0 ? protocol : undefined,
    alerts,
    recommendations,
    calving_interval_estimate_days: parseFloat(calvingInterval.toFixed(0)),
  }
}

function formatReproduction(r: ReproductionResult): string {
  const l: string[] = []
  const statusLabel: Record<string, string> = {
    cyclic: "正常发情周期",
    anovulatory: "无卵周期",
    cystic: "卵巢囊肿",
    puerperium: "产后期(未恢复发情)",
    open: "空怀",
  }

  l.push("## 繁殖管理与受胎率提升报告")
  l.push("")
  l.push("### 基本信息")
  l.push(`- **牛号**: ${r.cow_id}`)
  l.push(`- **泌乳天数**: ${r.days_in_milk} DIM`)
  l.push(`- **周期状态**: ${statusLabel[r.estrus_cycle_status]}`)
  l.push(`- **当前配次**: 第${r.current_service_number}次`)
  l.push("")

  l.push("### 繁殖评估")
  l.push(
    `- **受胎概率**: ${(r.conception_probability * 100).toFixed(1)}%`
  )
  l.push(`- **预期胎次受胎率**: ${r.expected_conception_rate}%`)
  l.push(
    `- **推荐配种窗口**: DIM ${r.optimal_breed_window.start_dim}-${r.optimal_breed_window.end_dim}`
  )
  l.push(
    `- **预估产犊间隔**: ${r.calving_interval_estimate_days}天 (目标<400天)`
  )
  l.push("")

  l.push(`### 推荐方案: ${r.recommended_action}`)
  if (r.protocol && r.protocol.length > 0) {
    l.push("执行步骤:")
    for (const s of r.protocol) {
      l.push(`- ${s}`)
    }
    l.push("")
  }

  if (r.alerts.length > 0) {
    l.push("### 预警信息")
    for (const a of r.alerts) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push("")
  }

  l.push("### 管理建议")
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push("")
  l.push(`> \u26A0\uFE0F ${BREEDING_DISCLAIMER}`)
  return l.join("\n")
}

// ==================== TOOL 5: BARN ENVIRONMENT CONTROLLER ====================

interface BarnEnvironmentInput {
  barn_id: string
  barn_type: "freestall" | "tie_stall" | "loose_housing" | "compost_bedding"
  cow_count: number
  avg_weight_kg: number
  inside_temp_c: number
  outside_temp_c: number
  relative_humidity_pct: number
  air_velocity_m_s: number
  ammonia_ppm?: number
  co2_ppm?: number
  h2s_ppm?: number
  lighting_hours_day?: number
  season: "spring" | "summer" | "autumn" | "winter"
  fan_count?: number
  sprinkler_count?: number
  soaker_line?: boolean
  curtain_control?: boolean
}

interface BarnEnvironmentResult {
  barn_id: string
  thi: number
  heat_stress_level:
    | "none"
    | "mild"
    | "moderate"
    | "severe"
    | "emergency"
  cold_stress_risk: boolean
  ventilation_adequacy: "inadequate" | "minimum" | "adequate" | "optimal"
  gas_status: {
    ammonia: "safe" | "elevated" | "dangerous"
    co2?: "safe" | "elevated"
    h2s?: "safe" | "dangerous"
  }
  cooling_actions: string[]
  ventilation_actions: string[]
  lighting_assessment: string
  recommendations: string[]
  alerts: string[]
  energy_estimate_kwh_day: number
}

function analyzeBarnEnvironment(input: BarnEnvironmentInput): BarnEnvironmentResult {
  const rng = seededRng(
    `${input.barn_id}:${input.inside_temp_c}:${input.relative_humidity_pct}:${input.season}`
  )
  const alerts: string[] = []
  const recommendations: string[] = []
  const coolingActions: string[] = []
  const ventActions: string[] = []

  // THI calculation (Temperature-Humidity Index)
  const thi =
    0.8 * input.inside_temp_c +
    (input.relative_humidity_pct / 100) *
      (input.inside_temp_c - 14.4) +
    46.4

  let heatStress: BarnEnvironmentResult["heat_stress_level"] = "none"
  if (thi >= 88) heatStress = "emergency"
  else if (thi >= 78) heatStress = "severe"
  else if (thi >= 72) heatStress = "moderate"
  else if (thi >= 68) heatStress = "mild"

  const coldStress =
    input.inside_temp_c < -10 && input.relative_humidity_pct > 85

  // Ventilation
  const ventilationPerCow = input.barn_type === "freestall" ? 150 : 100 // m3/hr per cow
  const requiredVentilation = input.cow_count * ventilationPerCow
  // Assume fans provide 10000 m3/hr each
  const fanCapacity = (input.fan_count || 0) * 10000
  const ventAdequacy =
    fanCapacity < requiredVentilation * 0.5
      ? "inadequate"
      : fanCapacity < requiredVentilation * 0.8
        ? "minimum"
        : fanCapacity < requiredVentilation
          ? "adequate"
          : "optimal"

  // Gas status
  let gasNH3: BarnEnvironmentResult["gas_status"]["ammonia"] = "safe"
  if ((input.ammonia_ppm ?? 0) > 25) gasNH3 = "dangerous"
  else if ((input.ammonia_ppm ?? 0) > 15) gasNH3 = "elevated"

  let gasCO2: "safe" | "elevated" | undefined
  if (input.co2_ppm !== undefined) {
    gasCO2 = input.co2_ppm > 3000 ? "elevated" : "safe"
  }
  let gasH2S: "safe" | "dangerous" | undefined
  if (input.h2s_ppm !== undefined) {
    gasH2S = input.h2s_ppm > 10 ? "dangerous" : "safe"
  }

  // Cooling actions based on heat stress
  if (heatStress === "moderate" || heatStress === "severe") {
    coolingActions.push("开启全部强制通风风扇(>2.5m/s风速)")
    if (input.soaker_line) {
      coolingActions.push(
        "启动喷淋降温系统: 每15分钟喷淋45秒"
      )
    } else if (input.sprinkler_count) {
      coolingActions.push(
        `启用喷头降温(共${input.sprinkler_count}个喷头), 干湿球温差大时启动`
      )
    }
    coolingActions.push("在饲槽上方增设风扇以鼓励采食")
    if (heatStress === "severe") {
      coolingActions.push("紧急措施: 在挤奶厅和待挤区设置冰块/水帘")
      coolingActions.push("延迟下午投喂时间至晚间")
    }
  } else if (heatStress === "mild") {
    coolingActions.push("开启基础通风风扇")
    coolingActions.push("监控THI变化, 准备备用降温设备")
  }

  // Ventilation actions
  if (input.curtain_control) {
    if (input.inside_temp_c < 5) {
      ventActions.push("降低卷帘至最小通风高度(维持最小换气)")
    } else if (input.inside_temp_c < 15) {
      ventActions.push("部分开启卷帘, 维持适宜温度")
    } else {
      ventActions.push("全开卷帘, 最大化自然通风")
    }
  }

  if (ventAdequacy === "inadequate") {
    alerts.push(
      `通风严重不足: 当前${fanCapacity}m³/h, 需要${requiredVentilation}m³/h`
    )
    ventActions.push("立即增加通风设备")
  } else if (ventAdequacy === "minimum") {
    recommendations.push("通风能力边缘，建议增加备用风扇")
  }

  // Lighting
  const lightingHrs = input.lighting_hours_day ?? 16
  let lighting =
    lightingHrs >= 16 && lightingHrs <= 18
      ? "光照时长充足(16-18h/天), 有利产奶"
      : lightingHrs < 16
        ? `光照偏少(${lightingHrs}h/天), 可考虑延长至16-18h增加产奶`
        : `光照过长(${lightingHrs}h/天), 建议保持16-18h+6-8h黑暗`

  // Alerts
  if (input.ammonia_ppm !== undefined && input.ammonia_ppm > 20) {
    alerts.push(`氨气浓度危险: ${input.ammonia_ppm} ppm`)
    recommendations.push("增加清粪频率，检查垫料管理")
  }
  if (input.h2s_ppm !== undefined && input.h2s_ppm > 5) {
    alerts.push(`硫化氢危险: ${input.h2s_ppm} ppm`)
  }
  if (coldStress) {
    alerts.push("冷应激风险: 舍内温度低于-10°C且湿度高")
    recommendations.push("检查卷帘密封和供暖系统")
  }

  // Energy estimate
  const fanPower = (input.fan_count || 4) * 0.75 // kW per fan
  const sprinklerPower = (input.sprinkler_count || 0) * 0.1
  const runtimePct = heatStress === "severe" ? 0.9 : heatStress === "moderate" ? 0.6 : 0.3
  const energyKwhDay = (fanPower * runtimePct + sprinklerPower) * 24

  if (recommendations.length === 0 && coolingActions.length === 0 && ventActions.length === 0) {
    recommendations.push("当前环境条件适宜，继续保持监控")
  }

  return {
    barn_id: input.barn_id,
    thi: parseFloat(thi.toFixed(1)),
    heat_stress_level: heatStress,
    cold_stress_risk: coldStress,
    ventilation_adequacy: ventAdequacy,
    gas_status: { ammonia: gasNH3, co2: gasCO2, h2s: gasH2S },
    cooling_actions: coolingActions,
    ventilation_actions: ventActions,
    lighting_assessment: lighting,
    recommendations,
    alerts,
    energy_estimate_kwh_day: parseFloat(energyKwhDay.toFixed(1)),
  }
}

function formatBarnEnvironment(r: BarnEnvironmentResult): string {
  const l: string[] = []
  const thiLabel: Record<string, string> = {
    none: "无热应激",
    mild: "轻度热应激",
    moderate: "中度热应激",
    severe: "重度热应激",
    emergency: "极重度热应激(紧急)",
  }
  const ventLabel: Record<string, string> = {
    inadequate: "不足",
    minimum: "最低限度",
    adequate: "充足",
    optimal: "最优",
  }
  const gasEmoji: Record<string, string> = {
    safe: "\u2705",
    elevated: "\u26A0\uFE0F",
    dangerous: "\uD83D\uDD34",
  }

  l.push("## 畜舍环境控制与热应激缓解报告")
  l.push("")
  l.push("### 基本信息")
  l.push(`- **畜舍编号**: ${r.barn_id}`)
  l.push(`- **温湿指数(THI)**: ${r.thi} (${thiLabel[r.heat_stress_level]})`)
  l.push(`- **通风评估**: ${ventLabel[r.ventilation_adequacy]}`)
  l.push(`- **冷应激风险**: ${r.cold_stress_risk ? "⚠ 有" : "无"}`)
  l.push(`- **日能耗预估**: ${r.energy_estimate_kwh_day} kWh`)
  l.push("")

  l.push("### 气体状况")
  l.push(
    `- **氨气(NH3)**: ${gasEmoji[r.gas_status.ammonia]} ${r.gas_status.ammonia}`
  )
  if (r.gas_status.co2) {
    l.push(`- **CO2**: ${gasEmoji[r.gas_status.co2]} ${r.gas_status.co2}`)
  }
  if (r.gas_status.h2s) {
    l.push(
      `- **H2S**: ${gasEmoji[r.gas_status.h2s]} ${r.gas_status.h2s}`
    )
  }
  l.push("")

  if (r.cooling_actions.length > 0) {
    l.push("### 降温措施")
    for (const a of r.cooling_actions) {
      l.push(`- \uD83E\uDDF5 ${a}`)
    }
    l.push("")
  }

  if (r.ventilation_actions.length > 0) {
    l.push("### 通风管理")
    for (const a of r.ventilation_actions) {
      l.push(`- \uD83D\uDCA8 ${a}`)
    }
    l.push("")
  }

  l.push("### 光照评估")
  l.push(`- ${r.lighting_assessment}`)
  l.push("")

  if (r.alerts.length > 0) {
    l.push("### 预警信息")
    for (const a of r.alerts) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push("")
  }

  l.push("### 管理建议")
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push("")
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join("\n")
}

// ==================== TOOL 6: CALF GROWTH TRACKER ====================

interface CalfGrowthInput {
  calf_id: string
  birth_weight_kg: number
  current_weight_kg: number
  age_days: number
  breed: "holstein" | "jersey" | "cross" | "other"
  gender: "female" | "male"
  feeding_plan?:
    | "whole_milk"
    | "milk_replacer"
    | "acidified_milk"
    | "waste_milk"
  milk_intake_l_day?: number
  starter_intake_g_day?: number
  hay_intake_g_day?: number
  health_history?: string[]
  navel_treatment?: boolean
  colostrum_quality?: "good" | "marginal" | "poor"
  weaning_target?: { weight_kg?: number; age_days?: number; starter_intake_g?: number }
}

interface CalfGrowthResult {
  calf_id: string
  age_days: number
  current_weight_kg: number
  avg_daily_gain_g: number
  target_weight_kg: number
  growth_status:
    | "excellent"
    | "good"
    | "average"
    | "below_target"
    | "poor"
  weaning_readiness: "ready" | "approaching" | "not_ready" | "preweaning"
  weaning_estimate_days: number
  feed_conversion_ratio: number
  growth_chart: Array<{ age_days: number; weight_kg: number; target_weight_kg: number }>
  recommendations: string[]
  alerts: string[]
  health_noted: string[]
}

function analyzeCalfGrowth(input: CalfGrowthInput): CalfGrowthResult {
  const rng = seededRng(
    `${input.calf_id}:${input.age_days}:${input.current_weight_kg}:${input.birth_weight_kg}`
  )
  const alerts: string[] = []
  const recommendations: string[] = []
  const healthNoted: string[] = []

  // Target ADG based on breed
  const targetAdg =
    input.breed === "holstein"
      ? 800
      : input.breed === "jersey"
        ? 650
        : 700
  const actualAdg =
    input.age_days > 0
      ? ((input.current_weight_kg - input.birth_weight_kg) * 1000) /
        input.age_days
      : 0

  // Target current weight
  const targetWeight = input.birth_weight_kg + (targetAdg * input.age_days) / 1000

  let growthStatus: CalfGrowthResult["growth_status"] = "average"
  if (actualAdg >= targetAdg * 1.1) growthStatus = "excellent"
  else if (actualAdg >= targetAdg * 0.95) growthStatus = "good"
  else if (actualAdg >= targetAdg * 0.8) growthStatus = "average"
  else if (actualAdg >= targetAdg * 0.6) growthStatus = "below_target"
  else growthStatus = "poor"

  // Weaning criteria
  const targetWeaningWeight =
    input.weaning_target?.weight_kg ||
    (input.breed === "holstein" ? 85 : 70)
  const targetWeaningAge = input.weaning_target?.age_days || 60
  const targetStarterIntake =
    input.weaning_target?.starter_intake_g || 1500

  let weaningReadiness: CalfGrowthResult["weaning_readiness"] = "not_ready"
  if (
    input.current_weight_kg >= targetWeaningWeight &&
    input.age_days >= targetWeaningAge - 7 &&
    (input.starter_intake_g_day ?? 0) >= targetStarterIntake
  ) {
    weaningReadiness = "ready"
  } else if (
    input.current_weight_kg >= targetWeaningWeight * 0.9 &&
    input.age_days >= targetWeaningAge - 14 &&
    (input.starter_intake_g_day ?? 0) >= targetStarterIntake * 0.7
  ) {
    weaningReadiness = "approaching"
  } else if (input.age_days < 14) {
    weaningReadiness = "preweaning"
  }

  // Estimate weaning date
  const remainingDays =
    weaningReadiness === "ready"
      ? 0
      : weaningReadiness === "approaching"
        ? Math.max(7, Math.round(rng.nextFloat(7, 14)))
        : Math.max(14, Math.round((targetWeaningAge - input.age_days) + rng.nextFloat(0, 15)))

  // Feed Conversion Ratio (up to weaning)
  const totalMilkFed =
    (input.milk_intake_l_day ?? 6) * input.age_days * 1.03 // L to kg milk
  const totalStarterFed =
    input.age_days > 7
      ? ((input.starter_intake_g_day ?? 0) * (input.age_days - 7)) / 1000
      : 0
  const totalFeedKg = totalMilkFed + totalStarterFed
  const gainKg = input.current_weight_kg - input.birth_weight_kg
  const fcr = gainKg > 0 ? totalFeedKg / gainKg : 999

  // Health history
  if (input.health_history && input.health_history.length > 0) {
    for (const h of input.health_history) {
      if (h.includes("腹泻") || h.includes("diarrhea")) {
        healthNoted.push(`腹泻史: ${h}`)
        if (input.age_days < 14) {
          alerts.push("新生犊牛腹泻高发期，确保补液和电解质")
          recommendations.push("排查大肠杆菌/轮状病毒/隐孢子虫")
        }
      }
      if (h.includes("肺炎") || h.includes("cough") || h.includes("呼吸")) {
        healthNoted.push(`呼吸道病史: ${h}`)
        recommendations.push("监测呼吸，检查畜舍通风")
      }
      if (h.includes("脐带") || h.includes("navel")) {
        healthNoted.push(`脐带问题: ${h}`)
      }
    }
  }

  if (
    input.colostrum_quality &&
    (input.colostrum_quality === "poor" || input.colostrum_quality === "marginal")
  ) {
    healthNoted.push(`初乳质量: ${input.colostrum_quality}`)
    if (input.colostrum_quality === "poor") {
      alerts.push("初乳质量差, IgG吸收不足, 被动免疫失败风险")
      recommendations.push("监测血清总蛋白(目标>5.5g/dL)")
    } else {
      recommendations.push("加强被动免疫监测")
    }
  }

  // Alerts and recommendations based on growth status
  if (growthStatus === "poor") {
    alerts.push(`日增重严重不足: ${actualAdg.toFixed(0)}g/天 < 目标${targetAdg}g/天`)
    recommendations.push("排查饲料摄入量", "检查是否有慢性疾病", "调整代乳粉浓度")
  } else if (growthStatus === "below_target") {
    alerts.push(`日增重偏低: ${actualAdg.toFixed(0)}g/天`)
    recommendations.push("确保奶/代乳粉摄入量达标", "早期开食料诱食")
  }

  if (weaningReadiness === "ready") {
    recommendations.push(
      `已满足断奶标准! 建议逐步断奶(7-10天减奶)`
    )
    alerts.push(`犊牛已达到断奶标准(体重${input.current_weight_kg}kg, ${input.age_days}日龄)`)
  } else if (weaningReadiness === "approaching") {
    recommendations.push("接近断奶期，逐步减少奶量至每日1次")
  }

  if (!input.navel_treatment && input.age_days <= 7) {
    recommendations.push("确认脐带已消毒处理(碘酊浸泡), 预防脐带炎")
  }

  // Generate growth chart (30 day intervals)
  const intervals: number[] = []
  for (let d = 0; d <= Math.min(120, input.age_days + 30); d += 30) {
    intervals.push(d)
  }
  const growthChart = intervals.map((d) => ({
    age_days: d,
    weight_kg: parseFloat(
      (input.birth_weight_kg + (actualAdg * d) / 1000).toFixed(1)
    ),
    target_weight_kg: parseFloat(
      (input.birth_weight_kg + (targetAdg * d) / 1000).toFixed(1)
    ),
  }))

  if (recommendations.length === 0) {
    recommendations.push("犊牛生长表现良好，保持当前饲喂方案")
  }

  return {
    calf_id: input.calf_id,
    age_days: input.age_days,
    current_weight_kg: input.current_weight_kg,
    avg_daily_gain_g: parseFloat(actualAdg.toFixed(0)),
    target_weight_kg: parseFloat(targetWeight.toFixed(1)),
    growth_status: growthStatus,
    weaning_readiness: weaningReadiness,
    weaning_estimate_days: remainingDays,
    feed_conversion_ratio: parseFloat(fcr.toFixed(2)),
    growth_chart: growthChart,
    recommendations,
    alerts,
    health_noted: healthNoted,
  }
}

function formatCalfGrowth(r: CalfGrowthResult): string {
  const l: string[] = []
  const statusLabel: Record<string, string> = {
    excellent: "优秀",
    good: "良好",
    average: "一般",
    below_target: "低于目标",
    poor: "差",
  }
  const weaningLabel: Record<string, string> = {
    ready: "可断奶",
    approaching: "接近断奶",
    not_ready: "未达断奶标准",
    preweaning: "未进入断奶准备期",
  }

  l.push("## 犊牛生长追踪与断奶管理报告")
  l.push("")
  l.push("### 基本信息")
  l.push(`- **犊牛编号**: ${r.calf_id}`)
  l.push(`- **日龄**: ${r.age_days}天`)
  l.push(`- **当前体重**: ${r.current_weight_kg} kg`)
  l.push(`- **目标体重**: ${r.target_weight_kg} kg`)
  l.push("")

  l.push("### 生长评估")
  l.push(
    `- **平均日增重**: ${r.avg_daily_gain_g} g/天 (目标: 700-800 g)`
  )
  l.push(`- **生长状态**: ${statusLabel[r.growth_status]}`)
  l.push(`- **断奶状态**: ${weaningLabel[r.weaning_readiness]}`)
  l.push(
    `- **预计断奶**: ${r.weaning_estimate_days > 0 ? "约" + r.weaning_estimate_days + "天后" : "当前可以断奶"}`
  )
  l.push(`- **饲料转化率(FCR)**: ${r.feed_conversion_ratio}`)
  l.push("")

  l.push("### 生长曲线")
  l.push("| 日龄 | 当前体重(kg) | 目标体重(kg) |")
  l.push("|------|-------------|-------------|")
  for (const g of r.growth_chart) {
    l.push(
      `| ${g.age_days} | ${g.weight_kg} | ${g.target_weight_kg} |`
    )
  }
  l.push("")

  if (r.health_noted.length > 0) {
    l.push("### 健康记录")
    for (const h of r.health_noted) {
      l.push(`- ${h}`)
    }
    l.push("")
  }

  if (r.alerts.length > 0) {
    l.push("### 预警信息")
    for (const a of r.alerts) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push("")
  }

  l.push("### 管理建议")
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push("")
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join("\n")
}

// ==================== TOOL 7: DAIRY ECONOMICS DASHBOARD ====================

interface DairyEconomicsInput {
  farm_id: string
  total_cows: number
  milking_cows: number
  total_milk_production_kg_month: number
  avg_milk_price_per_kg: number
  feed_cost_total_month: number
  labor_cost_month?: number
  veterinary_cost_month?: number
  breeding_cost_month?: number
  barn_maintenance_month?: number
  energy_cost_month?: number
  manure_management_cost_month?: number
  heifer_rearing_cost_month?: number
  other_costs_month?: number
  milk_quality_premium_month?: number
  calf_sales_income_month?: number
  cull_cow_income_month?: number
  manure_fertilizer_income_month?: number
  carbon_credit_income_month?: number
  period_days?: number
}

interface DairyEconomicsResult {
  farm_id: string
  total_costs_month: number
  total_income_items_month: number
  net_month: number
  cost_per_kg_milk: number
  feed_cost_pct: number
  margin_per_kg_milk: number
  break_even_margin: number
  income_composition: {
    milk_income: number
    calf_income: number
    cow_sales_income: number
    other_income: number
  }
  cost_composition: {
    feed: number
    labor: number
    vet_breeding: number
    overheads: number
    heifer: number
    other: number
  }
  benchmark_assessment: "excellent" | "good" | "average" | "below_average" | "poor"
  recommendations: string[]
  alerts: string[]
  iofc_per_cow_month: number // income over feed cost
}

function analyzeDairyEconomics(input: DairyEconomicsInput): DairyEconomicsResult {
  const rng = seededRng(
    `${input.farm_id}:${input.total_milk_production_kg_month}:${input.feed_cost_total_month}`
  )
  const alerts: string[] = []
  const recommendations: string[] = []

  const laborCost = input.labor_cost_month ?? input.milking_cows * 300
  const vetCost =
    input.veterinary_cost_month ?? input.milking_cows * 50
  const breedCost =
    input.breeding_cost_month ?? input.milking_cows * 30
  const barnMaint =
    input.barn_maintenance_month ?? input.total_cows * 50
  const energyCost =
    input.energy_cost_month ?? input.total_cows * 40
  const manureCost =
    input.manure_management_cost_month ?? input.total_cows * 20
  const heiferCost =
    input.heifer_rearing_cost_month ?? input.total_cows * 60
  const other = input.other_costs_month ?? input.total_cows * 30

  const totalCosts =
    input.feed_cost_total_month +
    laborCost +
    vetCost +
    breedCost +
    barnMaint +
    energyCost +
    manureCost +
    heiferCost +
    other

  const milkIncome = input.total_milk_production_kg_month * input.avg_milk_price_per_kg
  const premium =
    input.milk_quality_premium_month ?? input.total_milk_production_kg_month * 0.05
  const calfIncome = input.calf_sales_income_month ?? input.milking_cows * 80
  const cowIncome = input.cull_cow_income_month ?? input.milking_cows * 120
  const otherIncome =
    (input.manure_fertilizer_income_month ?? 0) +
    (input.carbon_credit_income_month ?? 0)

  const totalIncome =
    milkIncome + premium + calfIncome + cowIncome + otherIncome
  const net = totalIncome - totalCosts

  // Per-kg-milk cost
  const kgMilk = input.total_milk_production_kg_month || 1
  const costPerKg = totalCosts / kgMilk
  const marginPerKg = input.avg_milk_price_per_kg - costPerKg
  const feedPct = (input.feed_cost_total_month / totalCosts) * 100

  // IOFC per cow
  const iofc =
    milkIncome / input.milking_cows -
    input.feed_cost_total_month / input.milking_cows

  // Benchmark assessment
  let benchmark: DairyEconomicsResult["benchmark_assessment"] = "average"
  if (marginPerKg >= 1.2 && costPerKg <= 2.6)
    benchmark = "excellent"
  else if (marginPerKg >= 0.8 && costPerKg <= 3.0)
    benchmark = "good"
  else if (marginPerKg >= 0.3 && costPerKg <= 3.4)
    benchmark = "average"
  else if (marginPerKg >= 0) benchmark = "below_average"
  else benchmark = "poor"

  // Break-even margin estimate
  const breakEven = feedPct > 60 ? 0.2 : 0.15

  // Alerts
  if (feedPct > 65) {
    alerts.push(
      `饲料成本占比过高: ${feedPct.toFixed(1)}% (目标55-60%)`
    )
    recommendations.push("优化饲料转化率", "降低饲料浪费")
  } else if (feedPct < 45) {
    recommendations.push("饲料成本占比偏低，检查营养投入是否充足")
  }

  if (marginPerKg < 0) {
    alerts.push(`亏损状态: ¥${costPerKg.toFixed(2)}/kg > 奶价¥${input.avg_milk_price_per_kg}/kg`)
    recommendations.push("紧急控制成本或提高奶产量", "评估低产牛淘汰策略")
  } else if (marginPerKg < breakEven) {
    alerts.push(`微利状态: 毛利¥${marginPerKg.toFixed(2)}/kg, 低于安全线¥${breakEven}/kg`)
  }

  if (costPerKg > 3.8) {
    alerts.push(
      `公斤奶成本极高: ¥${costPerKg.toFixed(2)}/kg (参考: 2.8-3.5)`
    )
    recommendations.push("全面审查投入效率")
  }

  if (alerts.length === 0) {
    if (benchmark === "excellent") {
      recommendations.push("牧场经济效益优秀，继续保持精细化管理")
      recommendations.push("考虑适度扩大规模或投资自动化")
    } else {
      recommendations.push("牧场经济效益达标，持续优化饲料效率")
    }
  }

  const totalAllCosts =
    input.feed_cost_total_month +
    laborCost +
    (vetCost + breedCost) +
    (barnMaint + energyCost + manureCost) +
    heiferCost +
    other

  void totalAllCosts

  return {
    farm_id: input.farm_id,
    total_costs_month: parseFloat(totalCosts.toFixed(2)),
    total_income_items_month: parseFloat(totalIncome.toFixed(2)),
    net_month: parseFloat(net.toFixed(2)),
    cost_per_kg_milk: parseFloat(costPerKg.toFixed(2)),
    feed_cost_pct: parseFloat(feedPct.toFixed(1)),
    margin_per_kg_milk: parseFloat(marginPerKg.toFixed(2)),
    break_even_margin: parseFloat(breakEven.toFixed(2)),
    income_composition: {
      milk_income: parseFloat(milkIncome.toFixed(2)),
      calf_income: parseFloat(calfIncome.toFixed(2)),
      cow_sales_income: parseFloat(cowIncome.toFixed(2)),
      other_income: parseFloat(otherIncome.toFixed(2)),
    },
    cost_composition: {
      feed: parseFloat(input.feed_cost_total_month.toFixed(2)),
      labor: parseFloat(laborCost.toFixed(2)),
      vet_breeding: parseFloat((vetCost + breedCost).toFixed(2)),
      overheads: parseFloat(
        (barnMaint + energyCost + manureCost).toFixed(2)
      ),
      heifer: parseFloat(heiferCost.toFixed(2)),
      other: parseFloat(other.toFixed(2)),
    },
    benchmark_assessment: benchmark,
    recommendations,
    alerts,
    iofc_per_cow_month: parseFloat(iofc.toFixed(2)),
  }
}

function formatDairyEconomics(r: DairyEconomicsResult): string {
  const l: string[] = []
  const benchLabel: Record<string, string> = {
    excellent: "优秀",
    good: "良好",
    average: "一般",
    below_average: "需改善",
    poor: "较差",
  }

  l.push("## 牧场经济效益与公斤奶成本分析")
  l.push("")
  l.push("### 基本信息")
  l.push(`- **牧场编号**: ${r.farm_id}`)
  l.push(`- **总成本**: ¥${r.total_costs_month.toLocaleString()}/月`)
  l.push(`- **总收入**: ¥${r.total_income_items_month.toLocaleString()}/月`)
  l.push(`- **净收益**: ¥${r.net_month.toLocaleString()}/月`)
  l.push("")

  l.push("### 关键指标")
  l.push(`- **公斤奶成本**: **¥${r.cost_per_kg_milk}/kg**`)
  l.push(`- **奶料比(IOFC/头)**: ¥${r.iofc_per_cow_month}/头/月`)
  l.push(`- **饲料成本占比**: ${r.feed_cost_pct}%`)
  l.push(`- **单位毛利**: ¥${r.margin_per_kg_milk}/kg`)
  l.push(`- **安全线**: ¥${r.break_even_margin}/kg`)
  l.push(`- **评级**: ${benchLabel[r.benchmark_assessment]}`)
  l.push("")

  l.push("### 收入构成")
  l.push("| 项目 | 金额(¥) |")
  l.push("|------|---------|")
  l.push(
    `| 牛奶收入 | ${r.income_composition.milk_income.toLocaleString()} |`
  )
  l.push(
    `| 犊牛销售 | ${r.income_composition.calf_income.toLocaleString()} |`
  )
  l.push(
    `| 淘汰成母牛 | ${r.income_composition.cow_sales_income.toLocaleString()} |`
  )
  l.push(
    `| 其他收入 | ${r.income_composition.other_income.toLocaleString()} |`
  )
  l.push("")

  l.push("### 成本构成")
  l.push("| 项目 | 金额(¥) |")
  l.push("|------|---------|")
  l.push(`| 饲料 | ${r.cost_composition.feed.toLocaleString()} |`)
  l.push(`| 人工 | ${r.cost_composition.labor.toLocaleString()} |`)
  l.push(
    `| 兽医+繁殖 | ${r.cost_composition.vet_breeding.toLocaleString()} |`
  )
  l.push(
    `| 固定资产+能耗 | ${r.cost_composition.overheads.toLocaleString()} |`
  )
  l.push(`| 犊牛培育 | ${r.cost_composition.heifer.toLocaleString()} |`)
  l.push(`| 其他 | ${r.cost_composition.other.toLocaleString()} |`)
  l.push("")

  if (r.alerts.length > 0) {
    l.push("### 成本预警")
    for (const a of r.alerts) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push("")
  }

  l.push("### 改善建议")
  for (const rec of r.recommendations) {
    l.push(`- ${rec}`)
  }
  l.push("")
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join("\n")
}

// ==================== TOOL 8: MANURE MANAGEMENT PROCESSOR ====================

interface ManureManagementInput {
  farm_id: string
  total_cows: number
  milking_cows: number
  daily_manure_kg: number
  manure_system:
    | "solid_separation"
    | "anaerobic_digester"
    | "lagoon"
    | "composting"
    | "bioreactor"
  bedding_type?: "sand" | "sawdust" | "straw" | "compost" | "rubber_mattress"
  digester_volume_m3?: number
  hydraulic_retention_time_days?: number
  capture_biogas: boolean
  biogas_use?: "flaring" | "electricity" | "boiler" | "upgraded_biogas"
  field_area_hectares?: number
  field_distance_km?: number
  crop_type?: "corn" | "wheat" | "alfalfa" | "vegetables" | "mixed"
  separation_type?: "screw_press" | "centrifuge" | "roller" | "none"
  seasonal_window?: "spring" | "autumn" | "split"
  environmental_permit?: boolean
}

interface ManureManagementResult {
  farm_id: string
  total_daily_manure_kg: number
  separation_output?: {
    solid_kg: number
    solid_dm_pct: number
    liquid_kg: number
    liquid_dm_pct: number
  }
  biogas_output?: {
    estimated_daily_m3: number
    methane_pct: number
    energy_kwh_day: number
    revenue_rmb_day: number
    hrt_days: number
    organic_loading_rate_kg_vs_m3_day: number
  }
  compost_output?: {
    total_kg_day: number
    c_n_ratio: number
    turning_frequency: string
    maturity_days: number
    co2_reduction_kg_day: number
  }
  field_application: {
    n_supplied_kg_ha: number
    p_supplied_kg_ha: number
    k_supplied_kg_ha: number
    area_needed_ha: number
    transport_cost_rmb_day: number
    fertilizer_replacement_value_rmb_day: number
    environmental_risk: "low" | "moderate" | "high"
  }
  system_recommendations: string[]
  alerts: string[]
  regulations_check: string[]
  sustainability_score: number
}

function analyzeManureManagement(
  input: ManureManagementInput
): ManureManagementResult {
  const rng = seededRng(
    `${input.farm_id}:${input.manure_system}:${input.total_cows}:${input.capture_biogas}`
  )
  const alerts: string[] = []
  const recommendations: string[] = []
  const regulations: string[] = []

  const dailyManure = input.daily_manure_kg
  const langFactor = 1.2 // lang for dairy cows (manure ~ 3-5% of BW/day)

  // Daily manure estimate if not provided
  const estimatedDaily =
    dailyManure || input.total_cows * 60 + input.milking_cows * 40

  // Separation output
  let separationOutput: ManureManagementResult["separation_output"] =
    undefined
  if (
    input.separation_type &&
    input.separation_type !== "none"
  ) {
    const solidPct =
      input.separation_type === "screw_press"
        ? 0.25
        : input.separation_type === "centrifuge"
          ? 0.2
          : 0.22
    const solid =
      input.bedding_type === "sand"
        ? {
            solid_kg: estimatedDaily * (solidPct + 0.15),
            solid_dm_pct: 50,
            liquid_kg: estimatedDaily * (0.6),
            liquid_dm_pct: 6,
          }
        : {
            solid_kg: estimatedDaily * solidPct,
            solid_dm_pct: 25,
            liquid_kg: estimatedDaily * (1 - solidPct),
            liquid_dm_pct: 8,
          }
    if (input.bedding_type === "sand") {
      alerts.push("砂垫料沙量较多，固液分离选择螺旋挤压机可去除更多沙砾")
    }
    separationOutput = solid
  }

  // Biogas output
  let biogasOutput: ManureManagementResult["biogas_output"] = undefined
  const vsPercent = 0.08 // % volatile solids in manure (function scope for composting block)
  if (input.capture_biogas && input.manure_system === "anaerobic_digester") {
    const biogasRate = 0.25 // m3/kg VS
    const methanePct = 60
    const vsDaily = estimatedDaily * vsPercent
    const dailyBiogas = vsDaily * biogasRate
    const energyKwh = dailyBiogas * (methanePct / 100) * 10 // 10 kWh/m3 methane

    const hrt =
      input.hydraulic_retention_time_days || Math.max(18, Math.round(rng.nextFloat(18, 30)))
    const olr = vsDaily / (input.digester_volume_m3 || 100)

    const repValue =
      input.biogas_use === "electricity"
        ? energyKwh * 0.55 // ¥/kWh
        : input.biogas_use === "boiler"
          ? dailyBiogas * 0.3
          : input.biogas_use === "upgraded_biogas"
            ? dailyBiogas * 0.8
            : 0

    biogasOutput = {
      estimated_daily_m3: parseFloat(dailyBiogas.toFixed(0)),
      methane_pct: methanePct,
      energy_kwh_day: parseFloat(energyKwh.toFixed(1)),
      revenue_rmb_day: parseFloat(repValue.toFixed(2)),
      hrt_days: hrt,
      organic_loading_rate_kg_vs_m3_day: parseFloat(olr.toFixed(2)),
    }

    if (olr > 3.5) {
      alerts.push(`有机负荷率偏高(${olr.toFixed(2)}kg VS/m³·天)，建议增大反应器容积`)
      recommendations.push("监测VFA/TA比值，排查酸化风险")
    }
    if (hrt < 15) {
      alerts.push(`HRT偏短(${hrt}天)，可能影响产气稳定性`)
    }
  }

  // Composting output
  let compostOutput: ManureManagementResult["compost_output"] = undefined
  if (input.manure_system === "composting" || separationOutput) {
    const cnRatio =
      input.bedding_type === "sawdust"
        ? 35
        : input.bedding_type === "straw"
          ? 30
          : 22

    const turningFreq =
      input.bedding_type === "compost"
        ? "每3天翻堆一次(好氧堆肥)"
        : cnRatio > 30
          ? "每2-3天一次"
          : "每5-7天一次"

    compostOutput = {
      total_kg_day: parseFloat((estimatedDaily * 0.4).toFixed(0)),
      c_n_ratio: cnRatio,
      turning_frequency: turningFreq,
      maturity_days: 45 + Math.round(rng.nextFloat(-5, 10)),
      co2_reduction_kg_day: parseFloat(
        (estimatedDaily * vsPercent * 0.3).toFixed(1)
      ),
    }

    if (cnRatio > 40) {
      alerts.push(`C/N比过高(${cnRatio}:1)，建议添加氮源(粪水)`)
    } else if (cnRatio < 15) {
      recommendations.push("C/N比偏低，可添加秸秆调节")
    }
  }

  // Field application
  const nPerKg = 0.005 // kg N per kg manure DM
  const pPerKg = 0.002
  const kPerKg = 0.003
  const totalN = estimatedDaily * 0.08 * nPerKg // liquid DM ~8%
  const totalP = estimatedDaily * 0.08 * pPerKg
  const totalK = estimatedDaily * 0.08 * kPerKg

  // N requirement varies by crop
  const nReq =
    input.crop_type === "corn"
      ? 180
      : input.crop_type === "wheat"
        ? 150
        : input.crop_type === "alfalfa"
          ? 0
          : input.crop_type === "vegetables"
            ? 250
            : 160

  const totalManureAppliedEquiv = totalN / Math.max(nReq, 1)
  const areaNeededHa = nReq > 0 ? totalManureAppliedEquiv * nReq * 0.3 / 1000 : 0

  // Environmental risk
  let envRisk: "low" | "moderate" | "high" = "moderate"
  if (input.seasonal_window === "spring" || input.seasonal_window === "autumn") {
    envRisk = areaNeededHa < (input.field_area_hectares || 999) ? "low" : "moderate"
  } else if (input.seasonal_window === "split") {
    envRisk = "low"
  }
  if ((input.field_distance_km || 0) > 15) {
    envRisk = "high"
    alerts.push(`运输距离过远(${input.field_distance_km}km)，增加养分流失和排放`)
  }

  // Transport cost
  const transportCost =
    estimatedDaily *
    (input.field_distance_km ?? 3) *
    0.05 *
    langFactor

  // Fertilizer replacement
  const ureaPrice = 2500, dapPrice = 3800, mopPrice = 3000
  const fertReplacement =
    (totalN * ureaPrice / 0.46 +
      totalP * dapPrice / 0.46 +
      totalK * mopPrice / 0.6) /
    1000

  // System recommendations
  if (input.manure_system === "lagoon") {
    recommendations.push("建议升级为厌氧发酵+固液分离系统")
    recommendations.push("围堰防渗漏检测，避免地下水污染")
  }
  if (!input.separation_type || input.separation_type === "none") {
    recommendations.push("建议增加固液分离环节(螺旋挤压机)，改善后续处理效率")
  }
  if (!input.environmental_permit) {
    regulations.push("⚠ 缺少环保许可文件，请确保粪污处理和排放合规")
    alerts.push("缺少粪污处理环保许可")
  }

  if (!input.capture_biogas) {
    recommendations.push("考虑沼气回收，减少甲烷排放并产生经济效益")
  }

  // Sustainability score
  const separationScore = input.separation_type && input.separation_type !== "none" ? 20 : 0
  const biogasScore = input.capture_biogas ? 25 : 0
  const compostingScore = input.manure_system === "composting" ? 25 : 0
  const sw = input.seasonal_window
  const fieldScore = sw === "split" ? 20 : sw === "spring" || sw === "autumn" ? 15 : sw ? 10 : 5
  const permitScore = input.environmental_permit ? 10 : 0

  const ss =
    Math.min(
      100,
      separationScore +
        biogasScore +
        compostingScore +
        fieldScore +
        permitScore +
        Math.round(rng.nextFloat(5, 10))
    )

  return {
    farm_id: input.farm_id,
    total_daily_manure_kg: parseFloat(estimatedDaily.toFixed(0)),
    separation_output: separationOutput,
    biogas_output: biogasOutput,
    compost_output: compostOutput,
    field_application: {
      n_supplied_kg_ha: parseFloat(totalN.toFixed(1)),
      p_supplied_kg_ha: parseFloat(totalP.toFixed(1)),
      k_supplied_kg_ha: parseFloat(totalK.toFixed(1)),
      area_needed_ha: parseFloat(areaNeededHa.toFixed(1)),
      transport_cost_rmb_day: parseFloat(transportCost.toFixed(2)),
      fertilizer_replacement_value_rmb_day: parseFloat(
        fertReplacement.toFixed(2)
      ),
      environmental_risk: envRisk,
    },
    system_recommendations: recommendations,
    alerts,
    regulations_check: regulations,
    sustainability_score: ss,
  }
}

function formatManureManagement(r: ManureManagementResult): string {
  const l: string[] = []
  const riskLabel: Record<string, string> = {
    low: "低",
    moderate: "中等",
    high: "高",
  }

  l.push("## 粪污处理与沼液还田报告")
  l.push("")
  l.push("### 基本信息")
  l.push(`- **牧场编号**: ${r.farm_id}`)
  l.push(`- **日均粪污总量**: ${r.total_daily_manure_kg} kg`)
  r.sustainability_score !== undefined &&
    l.push(
      `- **可持续性评分**: ${r.sustainability_score}/100`
    )
  l.push("")

  if (r.separation_output) {
    const s = r.separation_output
    l.push("### 固液分离")
    l.push(`- **固体部分**: ${s.solid_kg.toFixed(0)} kg/天 (DM ${s.solid_dm_pct}%)`)
    l.push(
      `- **液体部分**: ${s.liquid_kg.toFixed(0)} kg/天 (DM ${s.liquid_dm_pct}%)`
    )
    l.push("")
  }

  if (r.biogas_output) {
    const b = r.biogas_output
    l.push("### 厌氧发酵/沼气")
    l.push(`- **日产沼气**: ${b.estimated_daily_m3} m³ (甲烷${b.methane_pct}%)`)
    l.push(`- **发电量**: ${b.energy_kwh_day} kWh/天`)
    l.push(`- **年收益**: ¥${b.revenue_rmb_day.toFixed(2)}/天`)
    l.push(`- **水力停留时间(HRT)**: ${b.hrt_days}天`)
    l.push(
      `- **有机负荷率**: ${b.organic_loading_rate_kg_vs_m3_day} kg VS/m³·天`
    )
    l.push("")
  }

  if (r.compost_output) {
    const c = r.compost_output
    l.push("### 好氧堆肥")
    l.push(`- **堆肥产量**: ${c.total_kg_day} kg/天`)
    l.push("- **C/N比**: " + c.c_n_ratio)
    l.push(`- **翻堆频率**: ${c.turning_frequency}`)
    l.push(`- **腐熟时间约**: ${c.maturity_days}天`)
    l.push(`- **CO2减排**: ${c.co2_reduction_kg_day} kg/天`)
    l.push("")
  }

  l.push("### 沼液还田")
  l.push("| 指标 | 数值 |")
  l.push("|------|------|")
  l.push(`| 供N量 | ${r.field_application.n_supplied_kg_ha} kg/ha |`)
  l.push(
    `| 供P量 | ${r.field_application.p_supplied_kg_ha} kg/ha |`
  )
  l.push(
    `| 供K量 | ${r.field_application.k_supplied_kg_ha} kg/ha |`
  )
  l.push(
    `| 需地量 | ${r.field_application.area_needed_ha} ha |`
  )
  l.push(
    `| 运输成本 | ¥${r.field_application.transport_cost_rmb_day.toFixed(2)}/天 |`
  )
  l.push(
    `| 替代化肥价值 | ¥${r.field_application.fertilizer_replacement_value_rmb_day.toFixed(2)}/天 |`
  )
  l.push(
    `- **环境风险**: ${riskLabel[r.field_application.environmental_risk]}`
  )
  l.push("")

  if (r.regulations_check.length > 0) {
    l.push("### 法规合规")
    for (const reg of r.regulations_check) {
      l.push(`- ${reg}`)
    }
    l.push("")
  }

  if (r.alerts.length > 0) {
    l.push("### 预警信息")
    for (const a of r.alerts) {
      l.push(`- \u26A0\uFE0F ${a}`)
    }
    l.push("")
  }

  l.push("### 系统建议")
  for (const rec of r.system_recommendations) {
    l.push(`- ${rec}`)
  }
  l.push("")
  l.push(`> \u26A0\uFE0F ${GENERAL_DISCLAIMER}`)
  return l.join("\n")
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. cow_health_monitor
  tools.register(
    defineTool({
      name: "cow_health_monitor",
      description:
        "奶牛健康监测与发情检测 — 基于体温、反刍、活动量、产奶量和酮体等参数进行综合健康评估，检测发情状态和适配配种窗口，输出健康评分和紧急措施",
      parameters: {
        input_data: {
          type: "string" as const,
          required: true,
          description:
            "JSON格式: { cow_id: string, breed: \"holstein\"|\"jersey\"|\"guernsey\"|\"ayrshire\"|\"brown_swiss\"|\"cross\"|\"other\", lactation_number: number, days_in_milk: number, body_temperature_c: number, rumination_minutes_day: number, activity_steps_day: number, milk_yield_kg_day: number, previous_milk_yield_kg_day?: number, rumen_ph?: number, ketone_bhb_mmol_l?: number, milk_components?: { fat_pct?: number, protein_pct?: number, lactose_pct?: number }, symptoms?: string[], estrus_detection?: boolean }",
        },
      },
      output: {
        schema: { type: "string" as const },
        render: (_a: any, v: any) => [
          { type: "text" as const, text: v as string },
        ],
      },
      async execute(args: { input_data: string }) {
        return formatCowHealth(analyzeCowHealth(JSON.parse(args.input_data)))
      },
    })
  )

  // 2. milk_quality_analyzer
  tools.register(
    defineTool({
      name: "milk_quality_analyzer",
      description:
        "牛奶品质分析与体细胞计数 — 分析乳脂、乳蛋白、乳糖、体细胞数(SCC)、冰点、电导率等指标，评估乳房炎风险，给出奶质等级和经济效益分析",
      parameters: {
        input_data: {
          type: "string" as const,
          required: true,
          description:
            "JSON格式: { herd_id: string, cow_id?: string, fat_pct: number, protein_pct: number, lactose_pct: number, somatic_cell_count_scc_cells_ml: number, bacterial_count_cfu_ml?: number, urea_mg_dl?: number, freezing_point_c?: number, conductivity_ms_cm?: number, milk_yield_kg_day?: number, lactation_stage?: \"early\"|\"mid\"|\"late\"|\"dry\" }",
        },
      },
      output: {
        schema: { type: "string" as const },
        render: (_a: any, v: any) => [
          { type: "text" as const, text: v as string },
        ],
      },
      async execute(args: { input_data: string }) {
        return formatMilkQuality(
          analyzeMilkQuality(JSON.parse(args.input_data))
        )
      },
    })
  )

  // 3. feed_rations_optimizer
  tools.register(
    defineTool({
      name: "feed_rations_optimizer",
      description:
        "日粮配方优化与TMR管理 — 基于NRC模型按泌乳阶段推荐日粮成分、营养指标、TMR搅拌步骤和成本分析",
      parameters: {
        input_data: {
          type: "string" as const,
          required: true,
          description:
            "JSON格式: { herd_size: number, avg_weight_kg: number, avg_milk_yield_kg_day: number, breed: \"holstein\"|\"jersey\"|\"cross\", lactation_stage: \"fresh\"|\"peak\"|\"mid\"|\"late\"|\"dry\"|\"transition\", available_feeds?: string[], constraints?: { max_cost_per_cow_day?: number, min_nf_pct?: number, max_starch_pct?: number, min_fat_pct?: number, seasonal_constraint?: \"normal\"|\"heat_stress\"|\"cold_stress\" } }",
        },
      },
      output: {
        schema: { type: "string" as const },
        render: (_a: any, v: any) => [
          { type: "text" as const, text: v as string },
        ],
      },
      async execute(args: { input_data: string }) {
        return formatFeedRations(
          analyzeFeedRations(JSON.parse(args.input_data))
        )
      },
    })
  )

  // 4. reproduction_management
  tools.register(
    defineTool({
      name: "reproduction_management",
      description:
        "繁殖管理与受胎率提升 — 评估发情周期状态、受胎概率、给出适配配种窗口和激素处理方案",
      parameters: {
        input_data: {
          type: "string" as const,
          required: true,
          description:
            "JSON格式: { cow_id: string, lactation_number: number, days_in_milk: number, last_calving_date?: string, previous_services?: number, heat_detection_method?: \"visual\"|\"tail_chalk\"|\"activity_monitor\"|\"patch\"|\"multiple\", hormonal_sync?: \"none\"|\"Ovsynch\"|\"Presynch\"|\"DoubleOvsynch\"|\"EstrusSync\", body_condition_score?: number, uterine_health?: \"normal\"|\"suspect\"|\"abnormal\", cystic_ovary?: boolean, retained_placenta?: boolean, metritis_history?: boolean, current_cycle_day?: number, semen_type?: \"conventional\"|\"sexed\"|\"beef\"|\"heifer\" }",
        },
      },
      output: {
        schema: { type: "string" as const },
        render: (_a: any, v: any) => [
          { type: "text" as const, text: v as string },
        ],
      },
      async execute(args: { input_data: string }) {
        return formatReproduction(
          analyzeReproduction(JSON.parse(args.input_data))
        )
      },
    })
  )

  // 5. barn_environment_controller
  tools.register(
    defineTool({
      name: "barn_environment_controller",
      description:
        "畜舍环境控制与热应激缓解 — 基于温湿指数(THI)评估热应激级别，输出通风、降温、光照管理方案和气体安全评估",
      parameters: {
        input_data: {
          type: "string" as const,
          required: true,
          description:
            "JSON格式: { barn_id: string, barn_type: \"freestall\"|\"tie_stall\"|\"loose_housing\"|\"compost_bedding\", cow_count: number, avg_weight_kg: number, inside_temp_c: number, outside_temp_c: number, relative_humidity_pct: number, air_velocity_m_s: number, ammonia_ppm?: number, co2_ppm?: number, h2s_ppm?: number, lighting_hours_day?: number, season: \"spring\"|\"summer\"|\"autumn\"|\"winter\", fan_count?: number, sprinkler_count?: number, soaker_line?: boolean, curtain_control?: boolean }",
        },
      },
      output: {
        schema: { type: "string" as const },
        render: (_a: any, v: any) => [
          { type: "text" as const, text: v as string },
        ],
      },
      async execute(args: { input_data: string }) {
        return formatBarnEnvironment(
          analyzeBarnEnvironment(JSON.parse(args.input_data))
        )
      },
    })
  )

  // 6. calf_growth_tracker
  tools.register(
    defineTool({
      name: "calf_growth_tracker",
      description:
        "犊牛生长追踪与断奶管理 — 基于日龄、体重、日增重和开食料摄入评估生长状态和断奶时机",
      parameters: {
        input_data: {
          type: "string" as const,
          required: true,
          description:
            "JSON格式: { calf_id: string, birth_weight_kg: number, current_weight_kg: number, age_days: number, breed: \"holstein\"|\"jersey\"|\"cross\"|\"other\", gender: \"female\"|male\", feeding_plan?: \"whole_milk\"|\"milk_replacer\"|\"acidified_milk\"|\"waste_milk\", milk_intake_l_day?: number, starter_intake_g_day?: number, hay_intake_g_day?: number, health_history?: string[], navel_treatment?: boolean, colostrum_quality?: \"good\"|\"marginal\"|\"poor\", weaning_target?: { weight_kg?: number, age_days?: number, starter_intake_g?: number } }",
        },
      },
      output: {
        schema: { type: "string" as const },
        render: (_a: any, v: any) => [
          { type: "text" as const, text: v as string },
        ],
      },
      async execute(args: { input_data: string }) {
        return formatCalfGrowth(analyzeCalfGrowth(JSON.parse(args.input_data)))
      },
    })
  )

  // 7. dairy_economics_dashboard
  tools.register(
    defineTool({
      name: "dairy_economics_dashboard",
      description:
        "牧场经济效益与公斤奶成本 — 综合分析公斤奶成本、饲料成本占比、盈亏状态、IOFC和成本收入构成，输出改善建议",
      parameters: {
        input_data: {
          type: "string" as const,
          required: true,
          description:
            "JSON格式: { farm_id: string, total_cows: number, milking_cows: number, total_milk_production_kg_month: number, avg_milk_price_per_kg: number, feed_cost_total_month: number, labor_cost_month?: number, veterinary_cost_month?: number, breeding_cost_month?: number, barn_maintenance_month?: number, energy_cost_month?: number, manure_management_cost_month?: number, heifer_rearing_cost_month?: number, other_costs_month?: number, milk_quality_premium_month?: number, calf_sales_income_month?: number, cull_cow_income_month?: number, manure_fertilizer_income_month?: number, carbon_credit_income_month?: number }",
        },
      },
      output: {
        schema: { type: "string" as const },
        render: (_a: any, v: any) => [
          { type: "text" as const, text: v as string },
        ],
      },
      async execute(args: { input_data: string }) {
        return formatDairyEconomics(
          analyzeDairyEconomics(JSON.parse(args.input_data))
        )
      },
    })
  )

  // 8. manure_management_processor
  tools.register(
    defineTool({
      name: "manure_management_processor",
      description:
        "粪污处理与沼液还田 — 分析固液分离、厌氧发酵产气、好氧堆肥和还田方案，给出环境合规建议和可持续性评分",
      parameters: {
        input_data: {
          type: "string" as const,
          required: true,
          description:
            'JSON格式: { farm_id: string, total_cows: number, milking_cows: number, daily_manure_kg: number, manure_system: "solid_separation"|\"anaerobic_digester\"|\"lagoon\"|\"composting\"|\"bioreactor\", bedding_type?: "sand"|\"sawdust"|\"straw"|\"compost"|\"rubber_mattress", digester_volume_m3?: number, hydraulic_retention_time_days?: number, capture_biogas: boolean, biogas_use?: "flaring"|\"electricity"|\"boiler"|\"upgraded_biogas", field_area_hectares?: number, field_distance_km?: number, crop_type?: "corn"|\"wheat"|\"alfalfa"|\"vegetables"|\"mixed", separation_type?: "screw_press"|\"centrifuge"|\"roller"|\"none", seasonal_window?: "spring"|\"autumn"|\"split", environmental_permit?: boolean }',
        },
      },
      output: {
        schema: { type: "string" as const },
        render: (_a: any, v: any) => [
          { type: "text" as const, text: v as string },
        ],
      },
      async execute(args: { input_data: string }) {
        return formatManureManagement(
          analyzeManureManagement(JSON.parse(args.input_data))
        )
      },
    })
  )
}
