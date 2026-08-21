import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'ecoagentpro'
export const inject = ['tools']

const DISCLAIMER = '本分析基于AI模型推断，仅供环保管理参考，不替代专业环境监测与合规决策。'

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

function percentile(r: () => number, min: number, max: number): number {
  return Math.round(min + r() * (max - min))
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. ENVIRONMENTAL MONITORING — 环境监测 (水质/大气/土壤/噪声)
   ═══════════════════════════════════════════════════════════════════════════ */

function analyzeEnvironmental(data: any) {
  const seed = data.location || data.site || data.medium || 'default'
  const r = rng(seed)

  const levels = ['I类', 'II类', 'III类', 'IV类', 'V类']
  const airLevels = ['优', '良', '轻度污染', '中度污染', '重度污染']
  const soilLevels = ['清洁', '尚清洁', '轻度污染', '中度污染', '重度污染']

  const medium = data.medium || 'water'
  const waterQuality = pickOne(levels, r)
  const airQuality = pickOne(airLevels, r)
  const soilStatus = pickOne(soilLevels, r)
  const noiseLevel = percentile(r, 35, 75)
  const monitoringPoints = percentile(r, 5, 25)
  const complianceRate = (70 + r() * 30).toFixed(1)
  const riskLevel = pickOne(['低', '中', '高'], r)

  return {
    disclaimer: DISCLAIMER,
    medium: medium,
    waterQuality: waterQuality,
    airQuality: airQuality,
    soilStatus: soilStatus,
    noiseLevel: noiseLevel + ' dB',
    monitoringPoints: monitoringPoints,
    complianceRate: complianceRate + '%',
    riskLevel: riskLevel
  }
}

function formatEnvReport(r: any): string {
  const lines = [
    '# 环境监测分析报告',
    '',
    '## 监测介质: ' + r.medium,
    '',
    '| 指标 | 结果 |',
    '|------|------|',
    '| 水质等级 | ' + r.waterQuality + ' |',
    '| 空气质量 | ' + r.airQuality + ' |',
    '| 土壤状况 | ' + r.soilStatus + ' |',
    '| 噪声水平 | ' + r.noiseLevel + ' |',
    '',
    '## 综合评估',
    '- 监测点位数量: ' + r.monitoringPoints + ' 个',
    '- 达标率: ' + r.complianceRate,
    '- 风险等级: ' + r.riskLevel,
    '',
    '*---*',
    '*' + r.disclaimer + '*'
  ]
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. CARBON NEUTRALITY PLANNER — 碳中和规划 (核算/路径/CCER/碳汇)
   ═══════════════════════════════════════════════════════════════════════════ */

function analyzeCarbonNeutrality(data: any) {
  const seed = data.company || data.org || data.industry || 'default'
  const r = rng(seed)

  const totalEmissions = percentile(r, 10000, 100000)
  const scope1 = Math.round(totalEmissions * (0.2 + r() * 0.3))
  const scope2 = Math.round(totalEmissions * (0.15 + r() * 0.25))
  const scope3 = totalEmissions - scope1 - scope2
  const targetYear = percentile(r, 2030, 2050)
  const reductionPath = pickOne(['能源替代', '能效提升', '碳捕集', '工艺优化', '绿电采购'], r)
  const ccerPotential = percentile(r, 500, 8000)
  const carbonSink = percentile(r, 200, 3000)
  const progress = (10 + r() * 45).toFixed(1)

  return {
    disclaimer: DISCLAIMER,
    totalEmissions: totalEmissions + ' tCO2e',
    scope1: scope1 + ' tCO2e',
    scope2: scope2 + ' tCO2e',
    scope3: scope3 + ' tCO2e',
    targetYear: targetYear + '年',
    reductionPath: reductionPath,
    ccerPotential: ccerPotential + ' tCO2e/年',
    carbonSink: carbonSink + ' tCO2e/年',
    progress: progress + '%'
  }
}

function formatCarbonReport(r: any): string {
  const lines = [
    '# 碳中和规划报告',
    '',
    '## 碳排放核算',
    '- 总排放量: ' + r.totalEmissions,
    '- 范围一(直接排放): ' + r.scope1,
    '- 范围二(间接排放-能源): ' + r.scope2,
    '- 范围三(其他间接排放): ' + r.scope3,
    '',
    '## 中和路径',
    '- 目标达峰年份: ' + r.targetYear,
    '- 核心减排路径: ' + r.reductionPath,
    '- CCER抵消潜力: ' + r.ccerPotential,
    '- 碳汇增汇量: ' + r.carbonSink,
    '- 当前中和进度: ' + r.progress,
    '',
    '*---*',
    '*' + r.disclaimer + '*'
  ]
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. GREEN BUILDING OPTIMIZER — 绿色建筑 (能耗/采光/通风/材料)
   ═══════════════════════════════════════════════════════════════════════════ */

function analyzeGreenBuilding(data: any) {
  const seed = data.building || data.project || data.name || 'default'
  const r = rng(seed)

  const energyConsumption = percentile(r, 50, 200)
  const lightingEfficiency = (60 + r() * 35).toFixed(1)
  const ventilationScore = percentile(r, 50, 90)
  const materialRating = pickOne(['A级', 'B级', 'C级', 'D级'], r)
  const greenCoverage = (15 + r() * 25).toFixed(1)
  const waterSavingRate = (20 + r() * 35).toFixed(1)
  const indoorQuality = pickOne(['优', '良', '一般', '较差'], r)
  const certification = pickOne(['LEED铂金', 'LEED金级', '绿建三星', '绿建二星', '绿建一星'], r)

  return {
    disclaimer: DISCLAIMER,
    energyConsumption: energyConsumption + ' kWh/m²·年',
    lightingEfficiency: lightingEfficiency + '%',
    ventilationScore: ventilationScore + ' 分',
    materialRating: materialRating,
    greenCoverage: greenCoverage + '%',
    waterSaving: waterSavingRate + '%',
    indoorQuality: indoorQuality,
    certification: certification
  }
}

function formatGreenBuildingReport(r: any): string {
  const lines = [
    '# 绿色建筑优化报告',
    '',
    '## 能耗分析',
    '- 单位面积能耗: ' + r.energyConsumption,
    '- 采光效率: ' + r.lightingEfficiency,
    '- 通风性能评分: ' + r.ventilationScore,
    '',
    '## 材料与绿化',
    '- 材料环保评级: ' + r.materialRating,
    '- 绿化覆盖率: ' + r.greenCoverage,
    '- 节水率: ' + r.waterSaving,
    '',
    '## 室内环境',
    '- 室内空气质量: ' + r.indoorQuality,
    '- 推荐认证等级: ' + r.certification,
    '',
    '*---*',
    '*' + r.disclaimer + '*'
  ]
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. CIRCULAR ECONOMY ADVISOR — 循环经济 (再利用/再制造/回收)
   ═══════════════════════════════════════════════════════════════════════════ */

function analyzeCircularEconomy(data: any) {
  const seed = data.product || data.material || data.sector || 'default'
  const r = rng(seed)

  const reuseRate = (30 + r() * 45).toFixed(1)
  const remanufacturingPotential = pickOne(['极高', '高', '中', '低'], r)
  const recyclingRate = (40 + r() * 40).toFixed(1)
  const wasteReduction = percentile(r, 10, 40)
  const materialEfficiency = (65 + r() * 30).toFixed(1)
  const economicBenefit = percentile(r, 100, 800)
  const co2Reduction = percentile(r, 50, 500)

  return {
    disclaimer: DISCLAIMER,
    reuseRate: reuseRate + '%',
    remanufacturingPotential: remanufacturingPotential,
    recyclingRate: recyclingRate + '%',
    wasteReduction: wasteReduction + '%',
    materialEfficiency: materialEfficiency + '%',
    economicBenefit: economicBenefit + ' 万元/年',
    co2Reduction: co2Reduction + ' tCO2e/年'
  }
}

function formatCircularEconomyReport(r: any): string {
  const lines = [
    '# 循环经济评估报告',
    '',
    '## 资源循环利用',
    '- 材料再利用率: ' + r.reuseRate,
    '- 再制造潜力: ' + r.remanufacturingPotential,
    '- 回收率: ' + r.recyclingRate,
    '- 废弃物减量潜力: ' + r.wasteReduction,
    '',
    '## 效益分析',
    '- 材料利用效率: ' + r.materialEfficiency,
    '- 年经济效益: ' + r.economicBenefit,
    '- 年CO2减排量: ' + r.co2Reduction,
    '',
    '*---*',
    '*' + r.disclaimer + '*'
  ]
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. BIODIVERSITY ASSESSMENT — 生物多样性 (物种/栖息地/廊道)
   ═══════════════════════════════════════════════════════════════════════════ */

function analyzeBiodiversity(data: any) {
  const seed = data.area || data.region || data.site || 'default'
  const r = rng(seed)

  const speciesCount = percentile(r, 50, 300)
  const habitatQuality = pickOne(['优', '良', '中', '差'], r)
  const corridorConnectivity = (50 + r() * 45).toFixed(1)
  const endangeredSpecies = percentile(r, 1, 15)
  const vegetationCoverage = (40 + r() * 40).toFixed(1)
  const ecosystemValue = percentile(r, 1000, 8000)
  const protectionLevel = pickOne(['一级', '二级', '三级'], r)

  return {
    disclaimer: DISCLAIMER,
    speciesCount: speciesCount + ' 种',
    habitatQuality: habitatQuality,
    corridorConnectivity: corridorConnectivity + '%',
    endangeredSpecies: endangeredSpecies + ' 种',
    vegetationCoverage: vegetationCoverage + '%',
    ecosystemValue: ecosystemValue + ' 万元/年',
    protectionLevel: protectionLevel + '保护'
  }
}

function formatBiodiversityReport(r: any): string {
  const lines = [
    '# 生物多样性评估报告',
    '',
    '## 物种与栖息地',
    '- 物种总数: ' + r.speciesCount,
    '- 栖息地质量: ' + r.habitatQuality,
    '- 廊道连通性: ' + r.corridorConnectivity,
    '- 濒危物种数量: ' + r.endangeredSpecies,
    '',
    '## 生态服务',
    '- 植被覆盖率: ' + r.vegetationCoverage,
    '- 生态系统服务价值: ' + r.ecosystemValue,
    '- 保护等级: ' + r.protectionLevel,
    '',
    '*---*',
    '*' + r.disclaimer + '*'
  ]
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. RENEWABLE ENERGY SITING — 新能源选址 (风光资源/接入/消纳)
   ═══════════════════════════════════════════════════════════════════════════ */

function analyzeRenewableEnergy(data: any) {
  const seed = data.site || data.location || data.region || 'default'
  const r = rng(seed)

  const solarResource = percentile(r, 1200, 2000)
  const windSpeed = (4 + r() * 6).toFixed(1)
  const gridAccess = pickOne(['便利', '一般', '困难'], r)
  const absorptionCapacity = percentile(r, 20, 95)
  const landArea = percentile(r, 100, 600)
  const estimatedCapacity = percentile(r, 20, 150)
  const annualGeneration = percentile(r, 100, 500)
  const investmentReturn = (4 + r() * 10).toFixed(1)

  return {
    disclaimer: DISCLAIMER,
    solarResource: solarResource + ' kWh/m²·年',
    windSpeed: windSpeed + ' m/s',
    gridAccess: gridAccess,
    absorptionCapacity: absorptionCapacity + '%',
    landArea: landArea + ' 亩',
    estimatedCapacity: estimatedCapacity + ' MW',
    annualGeneration: annualGeneration + ' GWh',
    investmentReturn: investmentReturn + '%'
  }
}

function formatRenewableEnergyReport(r: any): string {
  const lines = [
    '# 新能源选址评估报告',
    '',
    '## 资源条件',
    '- 太阳能年辐射量: ' + r.solarResource,
    '- 平均风速: ' + r.windSpeed,
    '- 可用土地面积: ' + r.landArea,
    '',
    '## 接入与消纳',
    '- 电网接入条件: ' + r.gridAccess,
    '- 消纳能力: ' + r.absorptionCapacity,
    '',
    '## 项目规模',
    '- 预估装机容量: ' + r.estimatedCapacity,
    '- 年发电量: ' + r.annualGeneration,
    '- 投资回报率: ' + r.investmentReturn,
    '',
    '*---*',
    '*' + r.disclaimer + '*'
  ]
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. WASTE MANAGEMENT AI — 固废管理 (分类/处理/危废/监管)
   ═══════════════════════════════════════════════════════════════════════════ */

function analyzeWasteManagement(data: any) {
  const seed = data.waste || data.type || data.stream || 'default'
  const r = rng(seed)

  const classificationAccuracy = (75 + r() * 20).toFixed(1)
  const treatmentCapacity = percentile(r, 100, 600)
  const hazardousTypes = percentile(r, 3, 20)
  const landfillRate = (20 + r() * 40).toFixed(1)
  const recyclingRate = (30 + r() * 40).toFixed(1)
  const complianceScore = percentile(r, 60, 95)
  const costEfficiency = percentile(r, 50, 90)
  const riskLevel = pickOne(['低', '中', '高'], r)

  return {
    disclaimer: DISCLAIMER,
    classificationAccuracy: classificationAccuracy + '%',
    treatmentCapacity: treatmentCapacity + ' 吨/日',
    hazardousTypes: hazardousTypes + ' 种',
    landfillRate: landfillRate + '%',
    recyclingRate: recyclingRate + '%',
    complianceScore: complianceScore + ' 分',
    costEfficiency: costEfficiency + ' 分',
    riskLevel: riskLevel
  }
}

function formatWasteReport(r: any): string {
  const lines = [
    '# 固废管理AI报告',
    '',
    '## 分类与处理',
    '- 分类准确率: ' + r.classificationAccuracy,
    '- 处理能力: ' + r.treatmentCapacity,
    '- 危废种类: ' + r.hazardousTypes,
    '',
    '## 处置与回收',
    '- 填埋率: ' + r.landfillRate,
    '- 回收利用率: ' + r.recyclingRate,
    '',
    '## 合规与风险',
    '- 合规评分: ' + r.complianceScore,
    '- 成本效率: ' + r.costEfficiency,
    '- 风险等级: ' + r.riskLevel,
    '',
    '*---*',
    '*' + r.disclaimer + '*'
  ]
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════════════════
   8. WATER RESOURCE MANAGER — 水资源管理 (配置/节约/水生态)
   ═══════════════════════════════════════════════════════════════════════════ */

function analyzeWaterResource(data: any) {
  const seed = data.water || data.basin || data.region || 'default'
  const r = rng(seed)

  const waterDemand = percentile(r, 2000, 15000)
  const waterSupply = percentile(r, 3000, 18000)
  const savingPotential = (15 + r() * 30).toFixed(1)
  const ecologicalFlow = (30 + r() * 30).toFixed(1)
  const waterQuality = pickOne(['I类', 'II类', 'III类', 'IV类', 'V类'], r)
  const allocationEfficiency = (60 + r() * 35).toFixed(1)
  const reuseRate = (20 + r() * 40).toFixed(1)
  const stressLevel = pickOne(['低', '中', '高'], r)

  return {
    disclaimer: DISCLAIMER,
    waterDemand: waterDemand + ' 万m³/年',
    waterSupply: waterSupply + ' 万m³/年',
    savingPotential: savingPotential + '%',
    ecologicalFlow: ecologicalFlow + '%',
    waterQuality: waterQuality,
    allocationEfficiency: allocationEfficiency + '%',
    reuseRate: reuseRate + '%',
    stressLevel: stressLevel + '压力'
  }
}

function formatWaterResourceReport(r: any): string {
  const lines = [
    '# 水资源管理报告',
    '',
    '## 供需分析',
    '- 用水需求: ' + r.waterDemand,
    '- 供水能力: ' + r.waterSupply,
    '- 节水潜力: ' + r.savingPotential,
    '',
    '## 水生态',
    '- 生态流量保障: ' + r.ecologicalFlow,
    '- 水质等级: ' + r.waterQuality,
    '- 用水压力: ' + r.stressLevel,
    '',
    '## 效率与回用',
    '- 配置效率: ' + r.allocationEfficiency,
    '- 再生水回用率: ' + r.reuseRate,
    '',
    '*---*',
    '*' + r.disclaimer + '*'
  ]
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════════════════
   PLUGIN REGISTRATION
   ═══════════════════════════════════════════════════════════════════════════ */

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. Environmental Monitoring
  tools.register(defineTool({
    name: 'environmental_monitoring',
    description: '环境监测分析工具 — 对水质、大气、土壤、噪声等环境介质进行参数分析与达标评估，提供综合评级和改进建议。',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { medium: "water"|"air"|"soil"|"noise", location?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatEnvReport(analyzeEnvironmental(JSON.parse(args.input_data)))
    },
  }))

  // 2. Carbon Neutrality Planner
  tools.register(defineTool({
    name: 'carbon_neutrality_planner',
    description: '碳中和规划工具 — 核算碳排放、制定减排路径、评估CCER开发潜力与碳汇方案，助力实现双碳目标。',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { company?: string, industry?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCarbonReport(analyzeCarbonNeutrality(JSON.parse(args.input_data)))
    },
  }))

  // 3. Green Building Optimizer
  tools.register(defineTool({
    name: 'green_building_optimizer',
    description: '绿色建筑优化工具 — 分析建筑能耗、采光、通风与材料性能，提供绿色建筑认证路径和优化建议。',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { building?: string, project?: string, name?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatGreenBuildingReport(analyzeGreenBuilding(JSON.parse(args.input_data)))
    },
  }))

  // 4. Circular Economy Advisor
  tools.register(defineTool({
    name: 'circular_economy_advisor',
    description: '循环经济咨询工具 — 评估物料循环利用水平，制定再利用/再制造/回收体系方案，挖掘循环经济价值。',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { product?: string, material?: string, sector?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCircularEconomyReport(analyzeCircularEconomy(JSON.parse(args.input_data)))
    },
  }))

  // 5. Biodiversity Assessment
  tools.register(defineTool({
    name: 'biodiversity_assessment',
    description: '生物多样性评估工具 — 评估物种多样性、栖息地质量和生态廊道需求，制定生物多样性保护策略。',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { area?: string, region?: string, site?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatBiodiversityReport(analyzeBiodiversity(JSON.parse(args.input_data)))
    },
  }))

  // 6. Renewable Energy Siting
  tools.register(defineTool({
    name: 'renewable_energy_siting',
    description: '新能源选址评估工具 — 评估风光资源潜力、电网接入条件、用地需求和消纳方案，为新能源项目选址提供决策支持。',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { site?: string, location?: string, region?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatRenewableEnergyReport(analyzeRenewableEnergy(JSON.parse(args.input_data)))
    },
  }))

  // 7. Waste Management AI
  tools.register(defineTool({
    name: 'waste_management_ai',
    description: '固废管理AI工具 — 分析固废分类方案、处理工艺和危废管理要求，提供合规监管建议。',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { waste?: string, type?: string, stream?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatWasteReport(analyzeWasteManagement(JSON.parse(args.input_data)))
    },
  }))

  // 8. Water Resource Manager
  tools.register(defineTool({
    name: 'water_resource_manager',
    description: '水资源管理工具 — 分析流域供需平衡、优化配置方案、制定节水措施和生态保护策略。',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { water?: string, basin?: string, region?: string }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatWaterResourceReport(analyzeWaterResource(JSON.parse(args.input_data)))
    },
  }))
}
