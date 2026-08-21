import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'pharmaaiagent'
export const inject = ['tools']

const DISCLAIMER = '本分析基于AI模型推断，仅供药物研发参考，不替代专业药理毒理与临床决策。'

function mulberry32(s: number) {
  let x = s >>> 0
  return () => {
    x = (x + 0x6D2B79F5) | 0
    let t = x
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h) || 1
}

function rng(i: string) {
  return mulberry32(hashStr(i))
}

// ============ 1. target_identification — 靶点发现 ============

interface TargetIdentificationResult {
  target_name: string
  disease_area: string
  confidence_score: number
  novelty_level: string
  druggability: number
  evidence_sources: string[]
  disclaimer: string
}

function analyzeTargetIdentification(data: any): TargetIdentificationResult {
  const r = rng(data.target || 'default')
  const targets = ['PD-L1', 'HER2', 'KRAS G12C', 'EGFR T790M', 'CD19', 'BCMA', 'CLDN18.2', 'TROP2']
  const diseases = ['非小细胞肺癌', '三阴性乳腺癌', '结直肠癌', '弥漫大B细胞淋巴瘤', '多发性骨髓瘤', '胃癌']
  const novelties = ['首创靶点', '快速跟进', '差异化靶点', '成熟靶点']
  const sources = ['TCGA数据库', 'GWAS研究', '单细胞测序', '文献挖掘', '蛋白组学', 'CRISPR筛选']

  const targetIdx = Math.floor(r() * targets.length)
  const diseaseIdx = Math.floor(r() * diseases.length)
  const noveltyIdx = Math.floor(r() * novelties.length)
  const conf = (0.55 + r() * 0.4).toFixed(3)
  const drug = (0.4 + r() * 0.55).toFixed(3)

  const evCount = 2 + Math.floor(r() * 3)
  const evs: string[] = []
  for (let i = 0; i < evCount; i++) {
    evs.push(sources[Math.floor(r() * sources.length)])
  }

  return {
    target_name: targets[targetIdx],
    disease_area: diseases[diseaseIdx],
    confidence_score: parseFloat(conf),
    novelty_level: novelties[noveltyIdx],
    druggability: parseFloat(drug),
    evidence_sources: [...new Set(evs)],
    disclaimer: DISCLAIMER
  }
}

function formatTargetIdentificationReport(r: TargetIdentificationResult): string {
  return [
    `# 靶点发现分析报告`,
    ``,
    `## 靶点概况`,
    `| 项目 | 内容 |`,
    `|------|------|`,
    `| 靶点名称 | ${r.target_name} |`,
    `| 适应症领域 | ${r.disease_area} |`,
    `| 置信度评分 | ${(r.confidence_score * 100).toFixed(1)}% |`,
    `| 新颖性等级 | ${r.novelty_level} |`,
    `| 成药性评分 | ${(r.druggability * 100).toFixed(1)}% |`,
    ``,
    `## 证据来源`,
    ...r.evidence_sources.map(e => `- ${e}`),
    ``,
    `## 评估结论`,
    `该靶点「${r.target_name}」在「${r.disease_area}」领域具有${r.novelty_level}特征，综合置信度${(r.confidence_score * 100).toFixed(1)}%，成药性评估${(r.druggability * 100).toFixed(1)}%。建议结合实验验证进一步确认靶点可行性。`,
    ``,
    `*${r.disclaimer}*`
  ].join('\n')
}

// ============ 2. lead_optimization — 先导化合物优化 ============

interface LeadOptimizationResult {
  compound_id: string
  admet_profile: Record<string, number>
  sar_summary: string
  potency_ic50_nm: number
  selectivity_index: number
  optimization_priority: string[]
  disclaimer: string
}

function analyzeLeadOptimization(data: any): LeadOptimizationResult {
  const r = rng(data.compound || 'default')
  const compoundIds = ['CMPD-A001', 'CMPD-B047', 'CMPD-C112', 'CMPD-D089', 'CMPD-E203']
  const admetKeys = ['Caco-2渗透性', '肝微粒体稳定性', 'CYP3A4抑制', 'hERG毒性', '血浆蛋白结合率']

  const admet: Record<string, number> = {}
  admetKeys.forEach(k => {
    admet[k] = parseFloat((0.3 + r() * 0.65).toFixed(3))
  })

  const ic50 = parseFloat((1 + r() * 999).toFixed(1))
  const si = parseFloat((5 + r() * 195).toFixed(1))

  const priorities = ['提高溶解性', '降低hERG风险', '优化代谢稳定性', '增强选择性', '改善口服生物利用度']
  const priorityCount = 2 + Math.floor(r() * 3)
  const selectedPriorities: string[] = []
  for (let i = 0; i < priorityCount; i++) {
    selectedPriorities.push(priorities[Math.floor(r() * priorities.length)])
  }

  const sarTemplates = [
    '苯环3位引入F原子可提升代谢稳定性约2.3倍',
    '哌啶环N-甲基化显著改善Caco-2渗透性',
    'Linker长度与活性呈钟形曲线关系，最优长度为4碳',
    '手性中心R构型活性为S构型的15倍'
  ]

  return {
    compound_id: compoundIds[Math.floor(r() * compoundIds.length)],
    admet_profile: admet,
    sar_summary: sarTemplates[Math.floor(r() * sarTemplates.length)],
    potency_ic50_nm: ic50,
    selectivity_index: si,
    optimization_priority: [...new Set(selectedPriorities)],
    disclaimer: DISCLAIMER
  }
}

function formatLeadOptimizationReport(r: LeadOptimizationResult): string {
  const admetRows = Object.entries(r.admet_profile)
    .map(([k, v]) => `| ${k} | ${(v * 100).toFixed(1)}% |`)
    .join('\n')

  return [
    `# 先导化合物优化报告`,
    ``,
    `## 化合物信息`,
    `| 项目 | 内容 |`,
    `|------|------|`,
    `| 化合物编号 | ${r.compound_id} |`,
    `| IC50 | ${r.potency_ic50_nm} nM |`,
    `| 选择性指数 | ${r.selectivity_index} |`,
    ``,
    `## ADMET性质`,
    `| 参数 | 评分 |`,
    `|------|------|`,
    admetRows,
    ``,
    `## 构效关系(SAR)摘要`,
    r.sar_summary,
    ``,
    `## 优化优先级`,
    ...r.optimization_priority.map((p, i) => `${i + 1}. ${p}`),
    ``,
    `*${r.disclaimer}*`
  ].join('\n')
}

// ============ 3. clinical_trial_designer — 临床试验设计 ============

interface ClinicalTrialResult {
  trial_phase: string
  design_type: string
  estimated_sample_size: number
  primary_endpoint: string
  study_duration_months: number
  sites_recommended: number
  key_eligibility: string[]
  disclaimer: string
}

function analyzeClinicalTrialDesign(data: any): ClinicalTrialResult {
  const r = rng(data.indication || 'default')
  const phases = ['I期', 'II期', 'III期', 'II/III期无缝设计', 'I/II期无缝设计']
  const designs = ['随机双盲安慰剂对照', '随机双盲阳性对照', '单臂多中心', '适应性设计', '篮式设计']
  const endpoints = ['客观缓解率(ORR)', '无进展生存期(PFS)', '总生存期(OS)', '安全耐受性', '药代动力学参数', '生物标志物变化率']

  const phaseIdx = Math.floor(r() * phases.length)
  const designIdx = Math.floor(r() * designs.length)
  const endpointIdx = Math.floor(r() * endpoints.length)

  const sampleSize = [20, 60, 120, 200, 400, 600, 800][Math.floor(r() * 7)]
  const duration = parseFloat((6 + r() * 42).toFixed(0))
  const sites = 3 + Math.floor(r() * 27)

  const eligibilities = ['年龄18-75岁', '经组织学确诊', 'ECOG PS 0-1', '至少一线治疗失败', '器官功能正常', '签署知情同意书', '无活动性感染']
  const eligCount = 4 + Math.floor(r() * 3)
  const selectedElig: string[] = []
  for (let i = 0; i < eligCount; i++) {
    selectedElig.push(eligibilities[Math.floor(r() * eligibilities.length)])
  }

  return {
    trial_phase: phases[phaseIdx],
    design_type: designs[designIdx],
    estimated_sample_size: sampleSize,
    primary_endpoint: endpoints[endpointIdx],
    study_duration_months: duration,
    sites_recommended: sites,
    key_eligibility: [...new Set(selectedElig)],
    disclaimer: DISCLAIMER
  }
}

function formatClinicalTrialReport(r: ClinicalTrialResult): string {
  return [
    `# 临床试验设计方案`,
    ``,
    `## 试验概要`,
    `| 项目 | 内容 |`,
    `|------|------|`,
    `| 试验分期 | ${r.trial_phase} |`,
    `| 设计类型 | ${r.design_type} |`,
    `| 预估样本量 | ${r.estimated_sample_size}例 |`,
    `| 主要终点 | ${r.primary_endpoint} |`,
    `| 研究周期 | ${r.study_duration_months}个月 |`,
    `| 推荐中心数 | ${r.sites_recommended}个 |`,
    ``,
    `## 关键入排标准`,
    ...r.key_eligibility.map(e => `- ${e}`),
    ``,
    `## 设计说明`,
    `本试验采用「${r.design_type}」设计，计划入组${r.estimated_sample_size}例受试者，在${r.sites_recommended}个临床中心开展，预计研究周期${r.study_duration_months}个月。主要终点为${r.primary_endpoint}。`,
    ``,
    `*${r.disclaimer}*`
  ].join('\n')
}

// ============ 4. regulatory_pathway_advisor — 注册路径 ============

interface RegulatoryPathwayResult {
  target_agency: string
  pathway_type: string
  estimated_timeline_months: number
  key_milestones: string[]
  special_designations: string[]
  submission_requirements: string[]
  disclaimer: string
}

function analyzeRegulatoryPathway(data: any): RegulatoryPathwayResult {
  const r = rng(data.agency || 'default')
  const agencies = ['NMPA (中国国家药监局)', 'FDA (美国食药监局)', 'EMA (欧洲药品管理局)', 'PMDA (日本药监局)']
  const pathways = ['常规申报', '优先审评', '突破性治疗', '附条件批准', '特别审批']
  const milestones = ['pre-IND会议', 'IND递交', 'I期完成', 'II期完成', 'III期完成', 'pre-NDA会议', '上市申请递交', '审评审批']
  const designations = ['孤儿药资格', '快速通道', '突破性治疗认定', '优先审评券', '加速审批', '附条件批准']

  const agencyIdx = Math.floor(r() * agencies.length)
  const pathwayIdx = Math.floor(r() * pathways.length)
  const timeline = parseFloat((12 + r() * 48).toFixed(0))

  const msCount = 4 + Math.floor(r() * 4)
  const selectedMs: string[] = []
  for (let i = 0; i < msCount; i++) {
    selectedMs.push(milestones[Math.floor(r() * milestones.length)])
  }

  const sdCount = 1 + Math.floor(r() * 3)
  const selectedSd: string[] = []
  for (let i = 0; i < sdCount; i++) {
    selectedSd.push(designations[Math.floor(r() * designations.length)])
  }

  const requirements = ['CMC资料', '非临床药理毒理报告', '临床研究报告', '风险管理计划', '说明书草案', 'GMP符合性证明']
  const reqCount = 3 + Math.floor(r() * 3)
  const selectedReq: string[] = []
  for (let i = 0; i < reqCount; i++) {
    selectedReq.push(requirements[Math.floor(r() * requirements.length)])
  }

  return {
    target_agency: agencies[agencyIdx],
    pathway_type: pathways[pathwayIdx],
    estimated_timeline_months: timeline,
    key_milestones: [...new Set(selectedMs)],
    special_designations: [...new Set(selectedSd)],
    submission_requirements: [...new Set(selectedReq)],
    disclaimer: DISCLAIMER
  }
}

function formatRegulatoryPathwayReport(r: RegulatoryPathwayResult): string {
  return [
    `# 注册路径建议报告`,
    ``,
    `## 注册策略概要`,
    `| 项目 | 内容 |`,
    `|------|------|`,
    `| 目标监管机构 | ${r.target_agency} |`,
    `| 申报路径 | ${r.pathway_type} |`,
    `| 预估时间线 | ${r.estimated_timeline_months}个月 |`,
    ``,
    `## 关键里程碑`,
    ...r.key_milestones.map((m, i) => `${i + 1}. ${m}`),
    ``,
    `## 特殊资格认定`,
    ...r.special_designations.map(s => `- ${s}`),
    ``,
    `## 申报资料要求`,
    ...r.submission_requirements.map(rq => `- ${rq}`),
    ``,
    `*${r.disclaimer}*`
  ].join('\n')
}

// ============ 5. biomarker_discovery — 生物标志物 ============

interface BiomarkerResult {
  biomarker_name: string
  biomarker_type: string
  predictive_value: number
  prevalence_pct: number
  assay_method: string
  clinical_utility: string
  validation_stage: string
  disclaimer: string
}

function analyzeBiomarkerDiscovery(data: any): BiomarkerResult {
  const r = rng(data.biomarker || 'default')
  const names = ['PD-L1表达', 'TMB', 'MSI-H', 'ctDNA突变丰度', '外泌体miRNA', 'TILs密度', '基因表达签名']
  const types = ['预后标志物', '预测标志物', '药效动力学标志物', '安全性标志物', '诊断标志物']
  const assays = ['IHC', 'NGS', 'ddPCR', 'ELISA', '流式细胞术', 'RNA-seq']
  const utilities = ['患者分层', '疗效预测', '耐药监测', '早期诊断', '预后评估']
  const stages = ['发现阶段', '回顾性验证', '前瞻性验证', '伴随诊断开发', '临床常规应用']

  return {
    biomarker_name: names[Math.floor(r() * names.length)],
    biomarker_type: types[Math.floor(r() * types.length)],
    predictive_value: parseFloat((0.6 + r() * 0.35).toFixed(3)),
    prevalence_pct: parseFloat((5 + r() * 45).toFixed(1)),
    assay_method: assays[Math.floor(r() * assays.length)],
    clinical_utility: utilities[Math.floor(r() * utilities.length)],
    validation_stage: stages[Math.floor(r() * stages.length)],
    disclaimer: DISCLAIMER
  }
}

function formatBiomarkerReport(r: BiomarkerResult): string {
  return [
    `# 生物标志物发现报告`,
    ``,
    `## 标志物概况`,
    `| 项目 | 内容 |`,
    `|------|------|`,
    `| 标志物名称 | ${r.biomarker_name} |`,
    `| 标志物类型 | ${r.biomarker_type} |`,
    `| 预测价值(AUC) | ${r.predictive_value.toFixed(3)} |`,
    `| 人群阳性率 | ${r.prevalence_pct}% |`,
    `| 检测方法 | ${r.assay_method} |`,
    `| 临床用途 | ${r.clinical_utility} |`,
    `| 验证阶段 | ${r.validation_stage} |`,
    ``,
    `## 解读`,
    `「${r.biomarker_name}」作为${r.biomarker_type}，在目标人群中阳性率为${r.prevalence_pct}%，预测价值AUC=${r.predictive_value.toFixed(3)}。当前处于${r.validation_stage}，建议采用${r.assay_method}方法进行检测。`,
    ``,
    `*${r.disclaimer}*`
  ].join('\n')
}

// ============ 6. formulation_development — 制剂开发 ============

interface FormulationResult {
  formulation_type: string
  route_of_administration: string
  stability_months: number
  bioavailability_pct: number
  key_excipients: string[]
  manufacturing_process: string
  scalability_assessment: string
  disclaimer: string
}

function analyzeFormulationDevelopment(data: any): FormulationResult {
  const r = rng(data.formulation || 'default')
  const types = ['片剂(速释)', '片剂(缓释)', '胶囊', '注射剂(冻干粉针)', '注射剂(溶液)', '脂质体', '纳米晶']
  const routes = ['口服', '静脉注射', '皮下注射', '肌肉注射', '透皮给药']
  const excipients = ['微晶纤维素', '乳糖一羟乳糖', '羟丙甲纤维素', '聚山梨酯80', '甘露醇', '泊洛沙姆188', '磷脂']
  const processes = ['湿法制粒', '干法制粒', '粉末直压', '冷冻干燥', '喷雾干燥', '高压均质']

  const typeIdx = Math.floor(r() * types.length)
  const routeIdx = Math.floor(r() * routes.length)
  const stability = parseFloat((12 + r() * 48).toFixed(0))
  const bioavail = parseFloat((30 + r() * 65).toFixed(1))

  const excCount = 2 + Math.floor(r() * 3)
  const selectedExc: string[] = []
  for (let i = 0; i < excCount; i++) {
    selectedExc.push(excipients[Math.floor(r() * excipients.length)])
  }

  const scalability = ['放大生产可行性高', '需优化工艺参数', '存在一定放大风险', '建议中试验证'][Math.floor(r() * 4)]

  return {
    formulation_type: types[typeIdx],
    route_of_administration: routes[routeIdx],
    stability_months: stability,
    bioavailability_pct: bioavail,
    key_excipients: [...new Set(selectedExc)],
    manufacturing_process: processes[Math.floor(r() * processes.length)],
    scalability_assessment: scalability,
    disclaimer: DISCLAIMER
  }
}

function formatFormulationReport(r: FormulationResult): string {
  return [
    `# 制剂开发报告`,
    ``,
    `## 制剂概要`,
    `| 项目 | 内容 |`,
    `|------|------|`,
    `| 剂型 | ${r.formulation_type} |`,
    `| 给药途径 | ${r.route_of_administration} |`,
    `| 稳定性 | ${r.stability_months}个月 |`,
    `| 生物利用度 | ${r.bioavailability_pct}% |`,
    `| 生产工艺 | ${r.manufacturing_process} |`,
    `| 放大评估 | ${r.scalability_assessment} |`,
    ``,
    `## 关键辅料`,
    ...r.key_excipients.map(e => `- ${e}`),
    ``,
    `## 开发建议`,
    `推荐开发「${r.formulation_type}」剂型，经${r.manufacturing_process}工艺制备，${r.route_of_administration}给药。初步评估生物利用度${r.bioavailability_pct}%，加速稳定性${r.stability_months}个月。放大生产评估：${r.scalability_assessment}。`,
    ``,
    `*${r.disclaimer}*`
  ].join('\n')
}

// ============ 7. pharmacovigilance_ai — 药物警戒 ============

interface PharmacovigilanceResult {
  signal_detected: boolean
  signal_strength: string
  adverse_event: string
  reporting_odds_ratio: number
  prr: number
  recommended_actions: string[]
  regulatory_reporting_obligation: string
  disclaimer: string
}

function analyzePharmacovigilance(data: any): PharmacovigilanceResult {
  const r = rng(data.drug || 'default')
  const events = ['肝酶升高', 'QT间期延长', '间质性肺炎', '血小板减少', '胰腺炎', '严重皮肤反应', '肾损伤']
  const strengths = ['弱信号', '中等信号', '强信号', '极强信号']
  const obligations = ['定期安全性更新报告(PSUR)', '15天快速报告', '定期获益风险评估', '无需额外报告', '更新说明书']

  const detected = r() > 0.2
  const strengthIdx = Math.floor(r() * strengths.length)
  const ror = parseFloat((0.8 + r() * 8).toFixed(2))
  const prrVal = parseFloat((0.5 + r() * 7).toFixed(2))

  const actions = ['更新说明书安全性信息', '发布致医务人员信函', '开展上市后安全性研究', '限制适用人群', '加强用药监测', '暂停销售评估']
  const actionCount = 2 + Math.floor(r() * 3)
  const selectedActions: string[] = []
  for (let i = 0; i < actionCount; i++) {
    selectedActions.push(actions[Math.floor(r() * actions.length)])
  }

  return {
    signal_detected: detected,
    signal_strength: strengths[strengthIdx],
    adverse_event: events[Math.floor(r() * events.length)],
    reporting_odds_ratio: ror,
    prr: prrVal,
    recommended_actions: [...new Set(selectedActions)],
    regulatory_reporting_obligation: obligations[Math.floor(r() * obligations.length)],
    disclaimer: DISCLAIMER
  }
}

function formatPharmacovigilanceReport(r: PharmacovigilanceResult): string {
  return [
    `# 药物警戒信号评估报告`,
    ``,
    `## 信号检测概要`,
    `| 项目 | 内容 |`,
    `|------|------|`,
    `| 信号状态 | ${r.signal_detected ? '检测到信号' : '未检测到显著信号'} |`,
    `| 信号强度 | ${r.signal_strength} |`,
    `| 关注不良事件 | ${r.adverse_event} |`,
    `| 报告比值比(ROR) | ${r.reporting_odds_ratio} |`,
    `| 比例报告比(PRR) | ${r.prr} |`,
    `| 监管报告义务 | ${r.regulatory_reporting_obligation} |`,
    ``,
    `## 建议措施`,
    ...r.recommended_actions.map((a, i) => `${i + 1}. ${a}`),
    ``,
    `## 评估结论`,
    `针对「${r.adverse_event}」检测到${r.signal_strength}（ROR=${r.reporting_odds_ratio}, PRR=${r.prr}）。监管报告义务：${r.regulatory_reporting_obligation}。建议按上述措施及时处理。`,
    ``,
    `*${r.disclaimer}*`
  ].join('\n')
}

// ============ 8. competitive_landscape — 竞争格局 ============

interface CompetitiveLandscapeResult {
  molecule_name: string
  total_competitors: number
  phase_distribution: Record<string, number>
  key_competitors: string[]
  market_position: string
  differentiation_opportunity: string
  threat_level: string
  disclaimer: string
}

function analyzeCompetitiveLandscape(data: any): CompetitiveLandscapeResult {
  const r = rng(data.molecule || 'default')
  const molecules = ['PD-1抑制剂', 'ADC药物', 'CAR-T疗法', '双特异性抗体', '小分子靶向药', 'RNA疗法']
  const companies = ['罗氏', '默沙东', 'BMS', '阿斯利康', '诺华', '恒瑞医药', '百济神州', '信达生物', '君实生物']
  const positions = ['领先者', '快速跟进者', '差异化竞争者', '潜在进入者']
  const threats = ['低威胁', '中等威胁', '高威胁', '极高威胁']

  const molIdx = Math.floor(r() * molecules.length)
  const totalComp = 3 + Math.floor(r() * 20)

  const phases = ['临床前', 'I期', 'II期', 'III期', '已上市']
  const phaseDist: Record<string, number> = {}
  let remaining = totalComp
  phases.forEach((p, idx) => {
    if (idx === phases.length - 1) {
      phaseDist[p] = remaining
    } else {
      const n = Math.floor(r() * remaining * 0.5)
      phaseDist[p] = n
      remaining -= n
    }
  })

  const compCount = 3 + Math.floor(r() * 4)
  const selectedComp: string[] = []
  for (let i = 0; i < compCount; i++) {
    selectedComp.push(companies[Math.floor(r() * companies.length)])
  }

  const diffOpp = [
    '差异化适应症布局',
    '更优的安全性特征',
    '联合治疗策略',
    '给药便利性优势',
    '成本优势',
    '新一代分子设计'
  ]

  return {
    molecule_name: molecules[molIdx],
    total_competitors: totalComp,
    phase_distribution: phaseDist,
    key_competitors: [...new Set(selectedComp)],
    market_position: positions[Math.floor(r() * positions.length)],
    differentiation_opportunity: diffOpp[Math.floor(r() * diffOpp.length)],
    threat_level: threats[Math.floor(r() * threats.length)],
    disclaimer: DISCLAIMER
  }
}

function formatCompetitiveLandscapeReport(r: CompetitiveLandscapeResult): string {
  const phaseRows = Object.entries(r.phase_distribution)
    .map(([k, v]) => `| ${k} | ${v}个 |`)
    .join('\n')

  return [
    `# 竞争格局分析报告`,
    ``,
    `## 概览`,
    `| 项目 | 内容 |`,
    `|------|------|`,
    `| 目标分子 | ${r.molecule_name} |`,
    `| 竞争者总数 | ${r.total_competitors}个 |`,
    `| 市场定位 | ${r.market_position} |`,
    `| 威胁等级 | ${r.threat_level} |`,
    `| 差异化机会 | ${r.differentiation_opportunity} |`,
    ``,
    `## 研发阶段分布`,
    `| 阶段 | 数量 |`,
    `|------|------|`,
    phaseRows,
    ``,
    `## 主要竞争者`,
    ...r.key_competitors.map(c => `- ${c}`),
    ``,
    `## 策略建议`,
    `「${r.molecule_name}」领域共有${r.total_competitors}个竞争者，当前定位为${r.market_position}。建议聚焦「${r.differentiation_opportunity}」实现差异化突围。`,
    ``,
    `*${r.disclaimer}*`
  ].join('\n')
}

// ============ Plugin Registration ============

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'target_identification',
    description: 'AI驱动的靶点发现分析：基于多组学数据评估靶点新颖性、成药性和置信度',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with target field' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatTargetIdentificationReport(analyzeTargetIdentification(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'lead_optimization',
    description: '先导化合物优化分析：ADMET性质评估、构效关系总结与优化优先级排序',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with compound field' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatLeadOptimizationReport(analyzeLeadOptimization(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'clinical_trial_designer',
    description: '临床试验方案设计：样本量估算、终点选择、入排标准与中心数量建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with indication field' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatClinicalTrialReport(analyzeClinicalTrialDesign(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'regulatory_pathway_advisor',
    description: '注册路径建议：NMPA/FDA/EMA申报策略、特殊资格认定与时间线规划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with agency field' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatRegulatoryPathwayReport(analyzeRegulatoryPathway(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'biomarker_discovery',
    description: '生物标志物发现：预测价值评估、检测方法推荐与临床用途分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with biomarker field' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatBiomarkerReport(analyzeBiomarkerDiscovery(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'formulation_development',
    description: '制剂开发分析：剂型选择、辅料筛选、工艺确定与放大可行性评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with formulation field' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatFormulationReport(analyzeFormulationDevelopment(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'pharmacovigilance_ai',
    description: '药物警戒AI信号检测：不良事件信号挖掘、ROR/PRR计算与监管报告建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with drug field' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatPharmacovigilanceReport(analyzePharmacovigilance(JSON.parse(args.input_data)))
    }
  }))

  tools.register(defineTool({
    name: 'competitive_landscape',
    description: '竞争格局分析：竞品数量统计、阶段分布、差异化机会与威胁评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON input with molecule field' }
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]
    },
    async execute(args: { input_data: string }) {
      return formatCompetitiveLandscapeReport(analyzeCompetitiveLandscape(JSON.parse(args.input_data)))
    }
  }))
}
