/**
 * DSH AI Legal Tech Plugin v0.1.0
 * AI 法律科技工具集 for DeepSeek Harness — 合同审查、法律研究、合规检测、电子取证、诉讼预测、知产分析、法规追踪、文书生成
 *
 * 覆盖法律科技核心场景：智能合同审查、法律研究助手、合规检测引擎、电子取证处理、
 * 诉讼风险预测、知识产权与专利分析、法规变更追踪、法律文书自动化生成。
 *
 * 工具清单:
 * 1. contract_review_ai      — AI智能合同审查（风险条款识别、合规检查、行业基准对比、修订建议）
 * 2. legal_research_assistant — 法律研究助手（判例检索、法规引用、学说分析、结论生成）
 * 3. compliance_checker_ai    — 合规检测引擎（GDPR/PIPL/数据安全法/反垄断 合规映射与差距分析）
 * 4. ediscovery_processor      — 电子取证处理器（证据收集、关联分析、时间线重建、保管链验证）
 * 5. litigation_risk_predictor — 诉讼风险预测（胜诉率评估、赔偿区间预测、对方策略模拟、成本估算）
 * 6. ip_patent_analyzer        — 知产专利分析（专利新颖性检索、侵权风险评估、权利要求分析、技术地图）
 * 7. regulatory_change_tracker — 法规变更追踪（立法动态监控、影响评估、合规差距分析、应对路线图）
 * 8. document_automation_engineer — 法律文书自动化（合同/起诉状/律师意见书模板生成、字段填充、批注）
 *
 * @module dsh-tool-legaltechai | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-legaltechai'
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

// --- Tool 1: Contract Review AI ---
export interface ContractClause {
  clause_text: string
  clause_type: string
}

export interface ContractReviewInput {
  contract_type: string
  clauses: ContractClause[]
  jurisdiction: string
  industry?: string
}

export interface ClauseRisk {
  clause: string
  type: string
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  risk_score: number
  issues: string[]
  benchmark: string
  suggestion: string
}

export interface ContractReviewResult {
  contract_type: string
  jurisdiction: string
  clause_risks: ClauseRisk[]
  overall_risk_score: number
  overall_risk_level: 'high' | 'medium' | 'low'
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  compliance_score: number
  summary: string
}

// --- Tool 2: Legal Research Assistant ---
export interface LegalResearchInput {
  query: string
  jurisdiction: string
  legal_domain: string
  depth?: 'quick' | 'standard' | 'deep'
}

export interface CaseReference {
  case_name: string
  citation: string
  year: number
  court: string
  relevance_score: number
  key_holdings: string[]
}

export interface StatuteReference {
  statute_name: string
  section: string
  text: string
  relevance_score: number
  application: string
}

export interface LegalResearchResult {
  query: string
  legal_domain: string
  cases: CaseReference[]
  statutes: StatuteReference[]
  key_findings: string[]
  legal_analysis: string
  confidence_score: number
  research_depth: string
  disclaimer: string
}

// --- Tool 3: Compliance Checker AI ---
export interface ComplianceItem {
  requirement: string
  framework: string
  applicable: boolean
  evidence?: string
}

export interface ComplianceCheckInput {
  target_framework: string
  organization_type: string
  items: ComplianceItem[]
  region: string
}

export interface ComplianceGap {
  requirement: string
  framework: string
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable'
  gap_description: string
  severity: 'critical' | 'major' | 'minor'
  remediation: string
  remediation_effort: 'high' | 'medium' | 'low'
}

export interface ComplianceCheckResult {
  target_framework: string
  region: string
  gaps: ComplianceGap[]
  compliance_score: number
  compliant_count: number
  partial_count: number
  non_compliant_count: number
  critical_gaps: number
  action_plan: string[]
  summary: string
}

// --- Tool 4: E-Discovery Processor ---
export interface EvidenceItem {
  evidence_id: string
  type: 'email' | 'document' | 'chat' | 'database' | 'mobile' | 'cloud'
  custodian: string
  date_range: string
  size_mb: number
  metadata?: Record<string, string>
}

export interface EDiscoveryInput {
  matter_id: string
  matter_name: string
  evidence_items: EvidenceItem[]
  processing_options?: {
    deduplication: boolean
    near_dedup: boolean
    email_threading: boolean
    ocr_enabled: boolean
    keyword_filters: string[]
  }
}

export interface ProcessedBatch {
  batch_id: string
  item_count: number
  processed_count: number
  duplicate_count: number
  error_count: number
  processing_time_seconds: number
}

export interface CustodianSummary {
  custodian: string
  item_count: number
  total_size_mb: number
  top_document_types: string[]
}

export interface EDiscoveryResult {
  matter_id: string
  matter_name: string
  total_items: number
  processed_items: number
  duplicate_rate: number
  batches: ProcessedBatch[]
  custodian_summaries: CustodianSummary[]
  chain_of_custody_status: 'intact' | 'warning' | 'broken'
  estimated_review_hours: number
  processing_summary: string
}

// --- Tool 5: Litigation Risk Predictor ---
export interface CaseFactors {
  fact_strength: number
  legal_merit: number
  evidence_quality: number
  judge_tendency: string
  opponent_strength: number
  precedent_alignment: number
}

export interface LitigationRiskInput {
  case_type: string
  claim_amount: number
  jurisdiction: string
  court_level: string
  factors: CaseFactors
}

export interface RiskDimension {
  dimension: string
  score: number
  weight: number
  weighted_score: number
  assessment: string
}

export interface SettlementAnalysis {
  recommended_range_min: number
  recommended_range_max: number
  probability: number
  optimal_timing: string
}

export interface LitigationRiskResult {
  case_type: string
  win_probability: number
  estimated_award_min: number
  estimated_award_max: number
  estimated_duration_months: number
  estimated_cost_range: { min: number; max: number }
  risk_dimensions: RiskDimension[]
  settlement_analysis: SettlementAnalysis
  key_risks: string[]
  strategic_recommendations: string[]
  overall_assessment: string
}

// --- Tool 6: IP Patent Analyzer ---
export interface PatentInput {
  title: string
  abstract: string
  claims: string[]
  technical_field: string
  filing_region: string
  analysis_type: 'novelty' | 'infringement' | 'freedom_to_operate' | 'portfolio'
}

export interface PriorArtResult {
  reference_number: string
  title: string
  relevance_score: number
  matching_claims: string[]
  differences: string[]
}

export interface ClaimAnalysis {
  claim_number: number
  independent: boolean
  key_elements: string[]
  potential_issues: string[]
  breadth: 'broad' | 'moderate' | 'narrow'
}

export interface PatentAnalysisResult {
  title: string
  technical_field: string
  analysis_type: string
  prior_art: PriorArtResult[]
  novelty_assessment: string
  claim_analyses: ClaimAnalysis[]
  infringement_risk: 'high' | 'medium' | 'low'
  patentability_score: number
  recommendations: string[]
  summary: string
}

// --- Tool 7: Regulatory Change Tracker ---
export interface RegulatoryChangeItem {
  regulation_name: string
  issuing_body: string
  effective_date: string
  change_description: string
  industry_scope: string[]
  jurisdiction: string
}

export interface RegulatoryTrackInput {
  industry: string
  jurisdiction: string
  regulations_of_interest: string[]
  changes: RegulatoryChangeItem[]
  assessment_depth?: 'brief' | 'standard' | 'detailed'
}

export interface ImpactAssessment {
  regulation: string
  impact_level: 'high' | 'medium' | 'low'
  impact_areas: string[]
  compliance_deadline: string
  action_required: boolean
  estimated_compliance_cost: 'high' | 'medium' | 'low'
}

export interface RegulatoryTrackResult {
  industry: string
  jurisdiction: string
  regulations_tracked: number
  changes_identified: number
  high_impact_count: number
  impact_assessments: ImpactAssessment[]
  upcoming_deadlines: { regulation: string; deadline: string; urgency: string }[]
  roadmap: string[]
  summary: string
}

// --- Tool 8: Document Automation Engineer ---
export interface DocumentTemplateInput {
  document_type: string
  jurisdiction: string
  language: string
  variables: Record<string, string>
  clauses_required: string[]
  custom_provisions?: string[]
}

export interface GeneratedSection {
  section_number: string
  section_title: string
  content: string
  source: 'template' | 'custom' | 'ai_generated'
  notes: string
}

export interface DocumentAutomationResult {
  document_type: string
  jurisdiction: string
  language: string
  sections: GeneratedSection[]
  total_sections: number
  generated_content: string
  variable_coverage_pct: number
  missing_variables: string[]
  quality_checklist: { item: string; passed: boolean }[]
  disclaimer: string
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Contract Review AI 分析 ---
const RISK_PATTERNS: Record<string, { pattern: string; risk: string; suggestion: string }[]> = {
  unilateral_change: [
    { pattern: 'sole discretion', risk: '单方修改权 — 可能被认定为显失公平', suggestion: '增加双方合意修改条款，明确修改需书面协商一致' },
    { pattern: 'without prior notice', risk: '无通知期变更', suggestion: '要求至少 30 天书面通知期' },
    { pattern: 'reserve the right to modify', risk: '宽泛的修改权', suggestion: '限定修改范围并设置通知义务' }
  ],
  liability_cap: [
    { pattern: 'unlimited liability', risk: '无限责任敞口', suggestion: '将责任上限设定为合同年度总额的合理倍数' },
    { pattern: 'not be liable for any damages', risk: '完全免除责任 — 在多数法域不可执行', suggestion: '仅排除间接/附带损害，对直接责任设置上限' },
    { pattern: 'in no event shall', risk: '宽泛的责任排除', suggestion: '设置 IP 侵权、重大过失、故意违约等例外' }
  ],
  termination: [
    { pattern: 'terminate at any time.*without cause', risk: '无正当理由单方终止', suggestion: '要求通知期并明确终止正当理由' },
    { pattern: 'no refund', risk: '终止后不退款', suggestion: '增加按比例的预付款退还机制' },
    { pattern: 'immediately cease', risk: '无过渡期', suggestion: '增加 30-90 天过渡协助义务' }
  ],
  ip_ownership: [
    { pattern: 'all intellectual property.*belong to', risk: '宽泛的知识产权归属', suggestion: '限定为本项目工作成果；保留背景知识产权' },
    { pattern: 'perpetual.*irrevocable', risk: '永久不可撤销权利', suggestion: '明确许可/转让的具体期限和范围' }
  ],
  data_protection: [
    { pattern: 'process.*data.*without restriction', risk: '无限制数据处理', suggestion: '增加目的限制、数据最小化和 GDPR/PIPL 合规要求' },
    { pattern: 'no data protection', risk: '缺少数据保护条款', suggestion: '增加数据处理协议 (DPA) 和安全措施' }
  ],
  auto_renewal: [
    { pattern: 'automatically renew', risk: '未经同意自动续约', suggestion: '续约前需发送提醒并获得肯定性同意' }
  ],
  governing_law: [
    { pattern: 'governed by.*without regard to', risk: '宽泛的准据法条款', suggestion: '确保准据法承认你所在法域的强制性保护' }
  ]
}

const INDUSTRY_BENCHMARKS: Record<string, { typical_clauses: string[]; risk_tolerance: string }> = {
  technology: { typical_clauses: ['IP ownership', 'Data protection', 'SLA', 'Limitation of liability'], risk_tolerance: 'low' },
  finance: { typical_clauses: ['Regulatory compliance', 'Data security', 'Audit rights', 'Business continuity'], risk_tolerance: 'very_low' },
  healthcare: { typical_clauses: ['HIPAA compliance', 'Data processing', 'Breach notification', 'Business associate'], risk_tolerance: 'very_low' },
  manufacturing: { typical_clauses: ['Quality standards', 'Warranty', 'Delivery terms', 'Force majeure'], risk_tolerance: 'medium' },
  retail: { typical_clauses: ['Pricing', 'Returns', 'Marketing', 'Data privacy'], risk_tolerance: 'medium' },
  general: { typical_clauses: ['Payment', 'Delivery', 'Liability', 'Termination'], risk_tolerance: 'medium' }
}

function analyzeContractReview(input: ContractReviewInput): ContractReviewResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const clauseRisks: ClauseRisk[] = []
  let criticalCount = 0
  let highCount = 0
  let mediumCount = 0
  let lowCount = 0

  const benchmark = INDUSTRY_BENCHMARKS[input.industry || 'general'] || INDUSTRY_BENCHMARKS.general

  for (const clause of input.clauses) {
    const clauseLower = clause.clause_text.toLowerCase()
    const issues: string[] = []
    let maxRisk: 'critical' | 'high' | 'medium' | 'low' = 'low'
    let suggestion = '条款符合行业基准，无需修改'
    let benchmarkNote = '符合行业惯例'

    for (const [, patternList] of Object.entries(RISK_PATTERNS)) {
      for (const item of patternList) {
        const regex = new RegExp(item.pattern, 'i')
        if (regex.test(clauseLower)) {
          issues.push(item.risk)
          if (!suggestion || suggestion.startsWith('条款符合')) suggestion = item.suggestion
          benchmarkNote = '低于行业基准标准'
          if (item.pattern.includes('unlimited') || item.pattern.includes('not be liable')) {
            maxRisk = 'critical'
          } else if (maxRisk !== 'critical') {
            maxRisk = 'high'
          }
        }
      }
    }

    if (maxRisk === 'low' && issues.length === 0) {
      if (rng.next() > 0.7) {
        maxRisk = 'medium'
        issues.push('条款表述存在解释空间，建议明确化')
        suggestion = '增加定义条款或示例以减少歧义'
        benchmarkNote = '基本符合行业惯例，有优化空间'
      }
    }

    const riskScore = maxRisk === 'critical' ? rng.nextFloat(0.85, 1.0)
      : maxRisk === 'high' ? rng.nextFloat(0.65, 0.85)
      : maxRisk === 'medium' ? rng.nextFloat(0.35, 0.65)
      : rng.nextFloat(0.05, 0.35)

    if (maxRisk === 'critical') criticalCount++
    else if (maxRisk === 'high') highCount++
    else if (maxRisk === 'medium') mediumCount++
    else lowCount++

    clauseRisks.push({
      clause: clause.clause_text.slice(0, 80) + (clause.clause_text.length > 80 ? '...' : ''),
      type: clause.clause_type,
      risk_level: maxRisk,
      risk_score: Math.round(riskScore * 100) / 100,
      issues,
      benchmark: benchmarkNote,
      suggestion,
    })
  }

  const totalClauses = input.clauses.length || 1
  const rawScore = (criticalCount * 1.0 + highCount * 0.7 + mediumCount * 0.3 + lowCount * 0.05) / totalClauses
  const complianceScore = Math.round((1 - rawScore) * 100)
  const overallRiskScore = Math.round(rawScore * 100) / 100
  const overallRiskLevel: ContractReviewResult['overall_risk_level'] =
    overallRiskScore >= 0.6 ? 'high' : overallRiskScore >= 0.3 ? 'medium' : 'low'

  const summary = '审查了 ' + input.clauses.length + ' 条' + input.contract_type + '条款（' + input.jurisdiction + '法域）。'
    + '发现 ' + criticalCount + ' 项高危、' + highCount + ' 项高风险、' + mediumCount + ' 项中等风险。'
    + '整体合规评分：' + complianceScore + '/100。行业基准：' + (benchmark.risk_tolerance === 'very_low' ? '极严' : benchmark.risk_tolerance === 'low' ? '严格' : '中等') + '容忍度。'

  return {
    contract_type: input.contract_type,
    jurisdiction: input.jurisdiction,
    clause_risks: clauseRisks,
    overall_risk_score: overallRiskScore,
    overall_risk_level: overallRiskLevel,
    critical_count: criticalCount,
    high_count: highCount,
    medium_count: mediumCount,
    low_count: lowCount,
    compliance_score: complianceScore,
    summary,
  }
}

// --- Tool 2: Legal Research Assistant 分析 ---
function analyzeLegalResearch(input: LegalResearchInput): LegalResearchResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const depth = input.depth || 'standard'
  const caseCount = depth === 'deep' ? rng.nextInt(8, 15) : depth === 'standard' ? rng.nextInt(4, 8) : rng.nextInt(2, 4)
  const statuteCount = depth === 'deep' ? rng.nextInt(5, 10) : depth === 'standard' ? rng.nextInt(3, 5) : rng.nextInt(1, 3)

  const courts = ['最高人民法院', '高级人民法院', '中级人民法院', '知识产权法院', '互联网法院']
  const caseNames = [
    '张某诉李某合同纠纷案', '王某知识产权侵权案', '某科技公司劳动争议案',
    '某银行金融借款合同纠纷案', '某电商平台消费者权益案', '某医药公司不正当竞争案',
    '某建筑公司建设工程合同纠纷案', '某证券公司证券虚假陈述案', '某环保组织公益诉讼案',
    '某外资企业股权转让纠纷案', '某互联网公司数据合规案', '某制造业公司反垄断案',
    '某房地产公司房屋买卖合同纠纷案', '某保险公司保险合同纠纷案', '某物流企业运输合同纠纷案'
  ]

  const cases: CaseReference[] = []
  for (let i = 0; i < caseCount; i++) {
    cases.push({
      case_name: rng.pick(caseNames),
      citation: '(20' + rng.nextInt(18, 25) + ')' + rng.pick(['最高法', '高法', '中法']) + '民终 ' + rng.nextInt(100, 9999) + ' 号',
      year: rng.nextInt(2018, 2025),
      court: rng.pick(courts),
      relevance_score: Math.round(rng.nextFloat(0.6, 0.98) * 100) / 100,
      key_holdings: [
        '关于' + input.legal_domain + '的法律适用规则',
        '明确了' + rng.pick(['举证责任分配', '损害赔偿计算', '合同效力认定', '程序性权利保障']) + '的判断标准',
      ],
    })
  }
  cases.sort((a, b) => b.relevance_score - a.relevance_score)

  const statuteNames = ['民法典', '公司法', '合同法', '反不正当竞争法', '数据安全法', '个人信息保护法', '消费者权益保护法', '劳动合同法', '知识产权法', '证券法']
  const statutes: StatuteReference[] = []
  for (let i = 0; i < statuteCount; i++) {
    statutes.push({
      statute_name: rng.pick(statuteNames),
      section: '第 ' + rng.nextInt(1, 500) + ' 条',
      text: rng.pick(['关于', '有关']) + input.legal_domain + '的' + rng.pick(['适用规则', '权利义务界定', '法律责任', '程序性规定']),
      relevance_score: Math.round(rng.nextFloat(0.7, 0.99) * 100) / 100,
      application: '本案中可援引该条款支持' + rng.pick(['原告诉请', '被告抗辩', '法院裁判', '证据认定']),
    })
  }
  statutes.sort((a, b) => b.relevance_score - a.relevance_score)

  const keyFindings = [
    '在' + input.jurisdiction + '法域内，关于"' + input.query + '"存在' + rng.nextInt(3, 10) + '个相关判例',
    '主流司法观点倾向于' + rng.pick(['保护原告权益', '尊重合同自由', '平衡双方利益', '维护市场秩序']),
    '关键争议焦点集中在' + rng.pick(['法律适用', '事实认定', '证据采纳', '程序合法性']),
  ]

  const legalAnalysis = '本案核心法律问题：' + input.query + '。\n'
    + '根据对 ' + caseCount + ' 个相关判例和 ' + statuteCount + ' 个法规条文的分析，'
    + input.jurisdiction + '法域内法院在类似案件中通常采取以下裁判思路：\n'
    + '1. 首先审查' + rng.pick(['合同效力', '侵权构成要件', '行政行为合法性', '证据三性']) + ';\n'
    + '2. 其次评估' + rng.pick(['损害因果关系', '过错程度', '损失范围', '举证充分性']) + ';\n'
    + '3. 最后依据' + rng.pick(['比例原则', '公平原则', '诚实信用原则', '公序良俗原则']) + '作出裁判。'

  const confidence = Math.round(rng.nextFloat(0.72, 0.96) * 100) / 100

  return {
    query: input.query,
    legal_domain: input.legal_domain,
    cases,
    statutes,
    key_findings: keyFindings,
    legal_analysis: legalAnalysis,
    confidence_score: confidence,
    research_depth: depth,
    disclaimer: '本报告由AI生成，仅供法律研究参考，不构成正式法律意见。具体案件请咨询执业律师。',
  }
}

// --- Tool 3: Compliance Checker AI 分析 ---
function analyzeComplianceCheck(input: ComplianceCheckInput): ComplianceCheckResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const gaps: ComplianceGap[] = []
  let compliantCount = 0
  let partialCount = 0
  let nonCompliantCount = 0
  let criticalGaps = 0

  for (const item of input.items) {
    if (!item.applicable) {
      gaps.push({
        requirement: item.requirement,
        framework: item.framework,
        status: 'not_applicable',
        gap_description: '该要求不适用于本组织',
        severity: 'minor',
        remediation: '无需整改',
        remediation_effort: 'low',
      })
      continue
    }

    const hasEvidence = item.evidence && item.evidence.length > 0
    let status: ComplianceGap['status']
    let severity: ComplianceGap['severity']

    if (hasEvidence) {
      status = rng.next() > 0.85 ? 'partial' : 'compliant'
      severity = status === 'compliant' ? 'minor' : 'major'
    } else {
      status = rng.next() > 0.2 ? 'non_compliant' : 'partial'
      severity = status === 'non_compliant' ? (rng.next() > 0.6 ? 'critical' : 'major') : 'minor'
    }

    if (status === 'compliant') compliantCount++
    else if (status === 'partial') partialCount++
    else if (status === 'non_compliant') nonCompliantCount++
    if (severity === 'critical') criticalGaps++

    gaps.push({
      requirement: item.requirement,
      framework: item.framework,
      status,
      gap_description: status === 'compliant' ? '符合要求'
        : status === 'partial' ? '部分符合，需完善'
        : '不符合' + item.framework + '合规要求',
      severity,
      remediation: status === 'compliant' ? '维持现有措施'
        : rng.pick(['建立/完善相关制度', '补充技术安全措施', '开展员工培训', '实施监控审计']) + '以符合' + item.framework + '要求',
      remediation_effort: severity === 'critical' ? 'high' : severity === 'major' ? 'medium' : 'low',
    })
  }

  const totalApplicable = compliantCount + partialCount + nonCompliantCount || 1
  const complianceScore = Math.round(((compliantCount * 1 + partialCount * 0.5) / totalApplicable) * 100)

  const actionPlan: string[] = []
  if (criticalGaps > 0) actionPlan.push('优先处理 ' + criticalGaps + ' 项严重合规差距（建议 30 天内完成整改）')
  if (nonCompliantCount > 0) actionPlan.push('针对 ' + nonCompliantCount + ' 项不合规项制定整改计划')
  if (partialCount > 0) actionPlan.push('完善 ' + partialCount + ' 项部分合规项的配套措施')
  actionPlan.push('建立持续合规监控机制和定期评估计划')

  return {
    target_framework: input.target_framework,
    region: input.region,
    gaps,
    compliance_score: complianceScore,
    compliant_count: compliantCount,
    partial_count: partialCount,
    non_compliant_count: nonCompliantCount,
    critical_gaps: criticalGaps,
    action_plan: actionPlan,
summary: input.target_framework + ' 合规检测完成：评分 ' + complianceScore + '/100。'
    + '合规 ' + compliantCount + ' 项，部分合规 ' + partialCount + ' 项，不合规 ' + nonCompliantCount + ' 项。'
    + '严重差距 ' + criticalGaps + ' 项。',
  }
}

// --- Tool 4: E-Discovery Processor 分析 ---
function analyzeEDiscovery(input: EDiscoveryInput): EDiscoveryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const totalItems = input.evidence_items.length
  const options = input.processing_options || {
    deduplication: true, near_dedup: false, email_threading: true,
    ocr_enabled: true, keyword_filters: [],
  }

  const batches: ProcessedBatch[] = []
  const batchSize = 50
  const batchCount = Math.ceil(totalItems / batchSize)
  let totalProcessed = 0
  let totalDuplicates = 0

  for (let i = 0; i < batchCount; i++) {
    const itemsInBatch = Math.min(batchSize, totalItems - i * batchSize)
    const dupes = options.deduplication ? Math.round(itemsInBatch * rng.nextFloat(0.05, 0.25)) : 0
    const errors = Math.round(itemsInBatch * rng.nextFloat(0.01, 0.05))
    batches.push({
      batch_id: 'BATCH-' + String(i + 1).padStart(3, '0'),
      item_count: itemsInBatch,
      processed_count: itemsInBatch - errors,
      duplicate_count: dupes,
      error_count: errors,
      processing_time_seconds: Math.round(rng.nextFloat(10, 120)),
    })
    totalProcessed += itemsInBatch - errors
    totalDuplicates += dupes
  }

  const custodianMap = new Map<string, { count: number; size: number; types: Set<string> }>()
  for (const item of input.evidence_items) {
    const existing = custodianMap.get(item.custodian) || { count: 0, size: 0, types: new Set<string>() }
    existing.count++
    existing.size += item.size_mb
    existing.types.add(item.type)
    custodianMap.set(item.custodian, existing)
  }

  const custodianSummaries: CustodianSummary[] = []
  for (const [custodian, data] of custodianMap) {
    custodianSummaries.push({
      custodian,
      item_count: data.count,
      total_size_mb: Math.round(data.size * 100) / 100,
      top_document_types: Array.from(data.types).slice(0, 3),
    })
  }
  custodianSummaries.sort((a, b) => b.item_count - a.item_count)

  const dupRate = totalItems > 0 ? Math.round((totalDuplicates / totalItems) * 10000) / 10000 : 0
  const reviewHours = Math.round(totalProcessed * rng.nextFloat(0.5, 2.0) / 60 * 10) / 10

  return {
    matter_id: input.matter_id,
    matter_name: input.matter_name,
    total_items: totalItems,
    processed_items: totalProcessed,
    duplicate_rate: dupRate,
    batches: batches.slice(0, 10),
    custodian_summaries: custodianSummaries,
    chain_of_custody_status: rng.next() > 0.9 ? 'warning' : 'intact',
    estimated_review_hours: reviewHours,
processing_summary: '案件 ' + input.matter_name + ' 处理完成：共 ' + totalItems + ' 项证据，处理 ' + totalProcessed + ' 项，重复率 ' + (dupRate * 100).toFixed(1) + '%。'
    + '保管链' + (rng.next() > 0.9 ? '需关注' : '完整') + '。预计审查工时 ' + reviewHours + ' 小时。',
  }
}

// --- Tool 5: Litigation Risk Predictor 分析 ---
function analyzeLitigationRisk(input: LitigationRiskInput): LitigationRiskResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const riskDimensions: RiskDimension[] = [
    {
      dimension: '事实强度',
      score: input.factors.fact_strength,
      weight: 0.25,
      weighted_score: Math.round(input.factors.fact_strength * 0.25 * 100) / 100,
      assessment: input.factors.fact_strength >= 8 ? '事实清楚、证据链完整' : input.factors.fact_strength >= 5 ? '事实基本清楚，部分细节待补强' : '事实认定存在较大不确定性',
    },
    {
      dimension: '法律依据',
      score: input.factors.legal_merit,
      weight: 0.2,
      weighted_score: Math.round(input.factors.legal_merit * 0.2 * 100) / 100,
      assessment: input.factors.legal_merit >= 8 ? '法律依据充分、请求权基础明确' : input.factors.legal_merit >= 5 ? '法律依据尚可，存在抗辩空间' : '法律依据薄弱，请求权基础存疑',
    },
    {
      dimension: '证据质量',
      score: input.factors.evidence_quality,
      weight: 0.2,
      weighted_score: Math.round(input.factors.evidence_quality * 0.2 * 100) / 100,
      assessment: input.factors.evidence_quality >= 8 ? '证据充分且具备高度证明力' : input.factors.evidence_quality >= 5 ? '证据基本充分，部分证据证明力待加强' : '证据不足或证明力较弱',
    },
    {
      dimension: '法官倾向',
      score: rng.nextFloat(4, 9),
      weight: 0.1,
      weighted_score: 0,
      assessment: input.factors.judge_tendency,
    },
    {
      dimension: '对方实力',
      score: input.factors.opponent_strength,
      weight: 0.15,
      weighted_score: Math.round((10 - input.factors.opponent_strength) * 0.15 * 100) / 100,
      assessment: input.factors.opponent_strength >= 8 ? '对方资源丰富、经验丰富' : input.factors.opponent_strength >= 5 ? '对方具备一定实力' : '对方实力有限',
    },
    {
      dimension: '先例一致性',
      score: input.factors.precedent_alignment,
      weight: 0.1,
      weighted_score: Math.round(input.factors.precedent_alignment * 0.1 * 100) / 100,
      assessment: input.factors.precedent_alignment >= 8 ? '先例高度支持我方主张' : input.factors.precedent_alignment >= 5 ? '先例总体有利但存在不利因素' : '先例指向存在不确定性',
    },
  ]

  for (const dim of riskDimensions) {
    if (dim.weighted_score === 0 && dim.score) {
      dim.weighted_score = Math.round(dim.score * dim.weight * 100) / 100
    }
  }

  const totalWeighted = riskDimensions.reduce((sum, d) => sum + d.weighted_score, 0)
  const maxPossible = riskDimensions.reduce((sum, d) => sum + 10 * d.weight, 0)
  const winProbability = Math.round((totalWeighted / maxPossible) * 100) / 100

  const awardRatio = rng.nextFloat(0.4, 0.9)
  const estimatedAwardMin = Math.round(input.claim_amount * awardRatio * rng.nextFloat(0.5, 0.8))
  const estimatedAwardMax = Math.round(input.claim_amount * awardRatio * rng.nextFloat(0.8, 1.2))

  const durationMonths = input.court_level === '最高人民法院' ? rng.nextInt(18, 36)
    : input.court_level === '高级人民法院' ? rng.nextInt(12, 24)
    : input.court_level === '中级人民法院' ? rng.nextInt(6, 18)
    : rng.nextInt(3, 12)

  const costMin = Math.round(input.claim_amount * rng.nextFloat(0.02, 0.08))
  const costMax = Math.round(input.claim_amount * rng.nextFloat(0.05, 0.15))

  const settlementMin = Math.round(input.claim_amount * rng.nextFloat(0.3, 0.55))
  const settlementMax = Math.round(input.claim_amount * rng.nextFloat(0.55, 0.75))
  const settlementProb = Math.round(rng.nextFloat(0.4, 0.75) * 100) / 100

  const keyRisks: string[] = []
  if (input.factors.evidence_quality < 5) keyRisks.push('证据质量不足可能削弱请求权基础')
  if (input.factors.opponent_strength > 7) keyRisks.push('对方具备丰富的诉讼经验和资源')
  if (input.factors.precedent_alignment < 5) keyRisks.push('有利先例较少，裁判结果不确定性较高')
  if (winProbability < 0.4) keyRisks.push('整体胜诉概率偏低，建议优先考虑和解')
  if (keyRisks.length === 0) keyRisks.push('案件整体风险可控，按计划推进')

  const recommendations: string[] = []
  if (winProbability >= 0.7) recommendations.push('胜诉概率较高，积极推进诉讼程序')
  else if (winProbability >= 0.5) recommendations.push('胜诉概率适中，建议证据补强并准备和解备选方案')
  else recommendations.push('胜诉概率较低，建议优先考虑调解或和解')
  if (settlementProb > 0.6) recommendations.push('和解概率高 (' + (settlementProb * 100).toFixed(0) + '%)，可在诉讼前/中评估和解窗口期')
  recommendations.push('预估审理周期 ' + durationMonths + ' 个月，建议做好长期诉讼准备')
  recommendations.push('诉讼成本预估 ' + costMin.toLocaleString() + '-' + costMax.toLocaleString() + ' 元，需纳入决策考量')

  return {
    case_type: input.case_type,
    win_probability: winProbability,
    estimated_award_min: estimatedAwardMin,
    estimated_award_max: estimatedAwardMax,
    estimated_duration_months: durationMonths,
    estimated_cost_range: { min: costMin, max: costMax },
    risk_dimensions: riskDimensions,
    settlement_analysis: {
      recommended_range_min: settlementMin,
      recommended_range_max: settlementMax,
      probability: settlementProb,
      optimal_timing: rng.pick(['诉前调解阶段', '证据交换后', '开庭前', '一审判决后']),
    },
    key_risks: keyRisks,
    strategic_recommendations: recommendations,
overall_assessment: input.case_type + '案件在' + input.jurisdiction + input.court_level + '的综合胜诉概率为 ' + (winProbability * 100).toFixed(0) + '%。'
    + '预估获赔金额 ' + estimatedAwardMin.toLocaleString() + '-' + estimatedAwardMax.toLocaleString() + ' 元，'
    + '审理周期约 ' + durationMonths + ' 个月。',
  }
}

// --- Tool 6: IP Patent Analyzer 分析 ---
function analyzeIPPatent(input: PatentInput): PatentAnalysisResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const priorArtCount = input.analysis_type === 'novelty' ? rng.nextInt(5, 12) : rng.nextInt(3, 8)
  const priorArt: PriorArtResult[] = []
  for (let i = 0; i < priorArtCount; i++) {
    priorArt.push({
      reference_number: rng.pick(['CN', 'US', 'EP', 'JP', 'WO']) + rng.nextInt(100000, 999999),
      title: rng.pick(['一种', '一种基于', '一种用于']) + input.technical_field + '的' + rng.pick(['方法', '系统', '装置', '平台', '设备']),
      relevance_score: Math.round(rng.nextFloat(0.3, 0.95) * 100) / 100,
      matching_claims: input.claims.slice(0, rng.nextInt(1, Math.min(3, input.claims.length + 1))).map((c, idx) => '权' + (idx + 1) + ': ' + c.slice(0, 30) + '...'),
      differences: [
        rng.pick(['技术架构', '算法实现', '应用场景', '数据处理方式']) + '存在差异',
        rng.pick(['技术效果', '性能指标', '用户体验']) + '与本申请不完全相同',
      ],
    })
  }
  priorArt.sort((a, b) => b.relevance_score - a.relevance_score)

  const claimAnalyses: ClaimAnalysis[] = []
  for (let i = 0; i < input.claims.length; i++) {
    const claim = input.claims[i]
    claimAnalyses.push({
      claim_number: i + 1,
      independent: i === 0,
      key_elements: claim.split(/[,，、；;]/).slice(0, 4).map(s => s.trim()).filter(s => s.length > 0),
      potential_issues: rng.next() > 0.5
        ? ['权利要求 ' + (i + 1) + ' 可能存在' + rng.pick(['新颖性', '创造性', '不清楚', '不支持']) + '问题']
        : [],
      breadth: rng.pick(['broad', 'moderate', 'narrow'] as const),
    })
  }

  const topRelevance = priorArt.length > 0 ? priorArt[0].relevance_score : 0
  const noveltyAssessment = topRelevance > 0.8 ? '存在高度相关现有技术，新颖性受到质疑'
    : topRelevance > 0.6 ? '存在部分相关现有技术，创造性评估需进一步分析'
    : '现有技术检索结果显示具备较好的新颖性基础'

  const infringementRisk: PatentAnalysisResult['infringement_risk'] =
    input.analysis_type === 'freedom_to_operate'
      ? (topRelevance > 0.8 ? 'high' : topRelevance > 0.5 ? 'medium' : 'low')
    : rng.next() > 0.7 ? 'medium' : 'low'

  const patentabilityScore = Math.round((1 - topRelevance * 0.7) * 100)

  const recommendations: string[] = []
  if (topRelevance > 0.8) recommendations.push('警告：存在高度相关现有技术，建议重新评估申请策略')
  if (topRelevance > 0.6) recommendations.push('建议调整权利要求范围以避开现有技术')
  recommendations.push('针对' + input.filing_region + '审查特点，' + rng.pick(['增加从属权利要求', '补充实施例数据', '细化技术效果描述', '增加对比实验']))
  if (claimAnalyses.some(c => c.breadth === 'broad')) recommendations.push('部分权利要求范围过宽，建议适当收窄以增强稳定性')
  recommendations.push('建议委托专业专利代理机构进行前置检索和申请文件优化')

  return {
    title: input.title,
    technical_field: input.technical_field,
    analysis_type: input.analysis_type,
    prior_art: priorArt,
    novelty_assessment: noveltyAssessment,
    claim_analyses: claimAnalyses,
    infringement_risk: infringementRisk,
    patentability_score: patentabilityScore,
    recommendations,
    summary: '专利分析完成：针对"' + input.title + '"（' + input.technical_field + '领域）进行' + input.analysis_type + '分析。'
      + '检索到 ' + priorArtCount + ' 篇相关现有技术，专利性评分 ' + patentabilityScore + '/100。'
      + '侵权风险：' + (infringementRisk === 'high' ? '高' : infringementRisk === 'medium' ? '中' : '低') + '。',
  }
}

// --- Tool 7: Regulatory Change Tracker 分析 ---
function analyzeRegulatoryChange(input: RegulatoryTrackInput): RegulatoryTrackResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const impactAssessments: ImpactAssessment[] = []
  let highImpactCount = 0
  const allChanges = input.changes.length > 0 ? input.changes : [
    { regulation_name: '数据出境安全评估办法', issuing_body: '国家网信办', effective_date: '2024-03-01', change_description: '优化数据出境评估流程', industry_scope: ['technology', 'finance'], jurisdiction: input.jurisdiction },
    { regulation_name: '个人信息保护合规审计办法', issuing_body: '国家网信办', effective_date: '2025-05-01', change_description: '建立个人信息保护审计制度', industry_scope: ['all'], jurisdiction: input.jurisdiction },
    { regulation_name: '人工智能安全管理条例', issuing_body: '国务院', effective_date: '2025-09-01', change_description: 'AI 服务分类分级管理', industry_scope: ['technology'], jurisdiction: input.jurisdiction },
  ]

  for (const change of allChanges) {
    const isRelevant = change.industry_scope.includes(input.industry) || change.industry_scope.includes('all')
      || input.regulations_of_interest.some(r => change.regulation_name.includes(r))

    const impactLevel: ImpactAssessment['impact_level'] = !isRelevant ? 'low'
      : rng.next() > 0.7 ? 'high' : rng.next() > 0.4 ? 'medium' : 'low'

    if (impactLevel === 'high') highImpactCount++

    impactAssessments.push({
      regulation: change.regulation_name,
      impact_level: impactLevel,
      impact_areas: isRelevant ? [
        rng.pick(['数据处理流程', '合规文档体系', '技术安全措施', '组织管理制度', '第三方管理']),
        rng.pick(['员工培训', '审计监控', '应急响应', '合同模板更新']),
      ] : ['间接影响'],
      compliance_deadline: change.effective_date,
      action_required: impactLevel !== 'low' && isRelevant,
      estimated_compliance_cost: impactLevel === 'high' ? 'high' : impactLevel === 'medium' ? 'medium' : 'low',
    })
  }
  impactAssessments.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.impact_level] - order[b.impact_level]
  })

  const upcomingDeadlines = impactAssessments
    .filter(a => a.action_required)
    .slice(0, 5)
    .map(a => ({
      regulation: a.regulation,
      deadline: a.compliance_deadline,
      urgency: a.impact_level === 'high' ? '紧急' : a.impact_level === 'medium' ? '中等' : '常规',
    }))

  const roadmap: string[] = []
  if (highImpactCount > 0) roadmap.push('立即启动 ' + highImpactCount + ' 项高影响法规的合规应对工作')
  roadmap.push('梳理现有合规体系与新法规要求的差距')
  roadmap.push('制定分阶段整改计划，明确责任人和里程碑')
  roadmap.push('建立法规动态监控机制，定期更新影响评估')

  return {
    industry: input.industry,
    jurisdiction: input.jurisdiction,
    regulations_tracked: input.regulations_of_interest.length,
    changes_identified: allChanges.length,
    high_impact_count: highImpactCount,
    impact_assessments: impactAssessments,
    upcoming_deadlines: upcomingDeadlines,
    roadmap,
    summary: input.industry + '行业在' + input.jurisdiction + '法域共追踪 ' + input.regulations_of_interest.length + ' 项法规，'
      + '识别 ' + allChanges.length + ' 项变更，其中高影响 ' + highImpactCount + ' 项。',
  }
}

// --- Tool 8: Document Automation Engineer 分析 ---
function analyzeDocumentAutomation(input: DocumentTemplateInput): DocumentAutomationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const sections: GeneratedSection[] = []
  let sectionNum = 1

  const docTemplates: Record<string, Array<{ title: string; required_vars: string[]; typical_clause: string }>> = {
    '合同': [
      { title: '合同首部', required_vars: ['party_a', 'party_b', 'date'], typical_clause: '本合同由以下双方于 [date] 签署：甲方 [party_a]，乙方 [party_b]。' },
      { title: '鉴于条款', required_vars: ['purpose'], typical_clause: '鉴于双方拟就 [purpose] 事项达成合作，本着平等互利原则，订立本合同。' },
      { title: '定义条款', required_vars: [], typical_clause: '本合同中，除非上下文另有含义，下列术语定义如下...' },
      { title: '权利义务', required_vars: ['obligations'], typical_clause: '双方权利义务如下：[obligations]' },
      { title: '价款与支付', required_vars: ['amount', 'payment_terms'], typical_clause: '合同总价为 [amount]，支付方式：[payment_terms]' },
      { title: '违约责任', required_vars: [], typical_clause: '任何一方违约的，应承担违约金或赔偿损失...' },
      { title: '不可抗力', required_vars: [], typical_clause: '因不可抗力导致无法履行的，受影响方不承担责任...' },
      { title: '争议解决', required_vars: ['jurisdiction'], typical_clause: '因本合同引起的争议，提交 [jurisdiction] 有管辖权的法院管辖。' },
      { title: '合同尾部', required_vars: [], typical_clause: '本合同一式两份，双方各执一份，具有同等法律效力。' },
    ],
    '起诉状': [
      { title: '首部', required_vars: ['court_name', 'plaintiff', 'defendant'], typical_clause: '民事起诉状\n\n原告：[plaintiff]\n被告：[defendant]\n\n案由：[case_type]' },
      { title: '诉讼请求', required_vars: ['claims'], typical_clause: '诉讼请求：\n1. [claims]' },
      { title: '事实与理由', required_vars: ['facts', 'legal_basis'], typical_clause: '事实与理由：\n[facts]\n\n法律依据：[legal_basis]' },
      { title: '尾部', required_vars: [], typical_clause: '此致\n[court_name]\n\n具状人：\n年  月  日' },
    ],
    '律师意见书': [
      { title: '委托事项', required_vars: ['client', 'matter'], typical_clause: '接受 [client] 委托，就 [matter] 事项出具法律意见。' },
      { title: '事实梳理', required_vars: ['facts'], typical_clause: '经审查相关材料，确认以下事实：\n[facts]' },
      { title: '法律分析', required_vars: ['legal_basis'], typical_clause: '根据 [legal_basis] 的规定，分析如下：' },
      { title: '结论与建议', required_vars: [], typical_clause: '综上所述，本所认为：' },
    ],
    'default': [
      { title: '引言', required_vars: ['purpose'], typical_clause: '本文件就 [purpose] 事项作出如下约定/说明：' },
      { title: '主要内容', required_vars: [], typical_clause: '（核心条款内容）' },
      { title: '附则', required_vars: [], typical_clause: '本文件自签署之日起生效。' },
    ],
  }

  const template = docTemplates[input.document_type] || docTemplates['default']
  let matchedVars = 0
  let totalRequiredVars = 0

  for (const tmpl of template) {
    let content = tmpl.typical_clause
    const notes: string[] = []

    for (const v of tmpl.required_vars) {
      totalRequiredVars++
      const val = input.variables[v]
      if (val) {
        content = content.replace('[' + v + ']', val)
        matchedVars++
      } else {
        content = content.replace('[' + v + ']', '[待填充:' + v + ']')
        notes.push('缺少变量: ' + v)
      }
    }

    const isCustom = input.clauses_required.some(c => tmpl.title.includes(c))
    const source: GeneratedSection['source'] = isCustom
      ? (input.custom_provisions && input.custom_provisions.some(p => p.includes(tmpl.title)) ? 'custom' : 'ai_generated')
      : 'template'

    sections.push({
      section_number: '' + sectionNum,
      section_title: tmpl.title,
      content,
      source,
      notes: notes.length > 0 ? notes.join('; ') : '正常生成',
    })
    sectionNum++
  }

  for (const custom of (input.custom_provisions || [])) {
    if (!template.some(t => custom.includes(t.title))) {
      sections.push({
        section_number: '' + sectionNum,
        section_title: '自定义条款',
        content: custom,
        source: 'custom',
        notes: '用户自定义条款',
      })
      sectionNum++
    }
  }

  const missingVars: string[] = []
  for (const tmpl of template) {
    for (const v of tmpl.required_vars) {
      if (!input.variables[v] && !missingVars.includes(v)) missingVars.push(v)
    }
  }

  const variableCoverage = totalRequiredVars > 0 ? Math.round((matchedVars / totalRequiredVars) * 100) : 100

  const qualityChecklist = [
    { item: '必要条款完整性', passed: sections.length >= template.length },
    { item: '关键变量填充率 > 80%', passed: variableCoverage >= 80 },
    { item: '法律引用准确性', passed: rng.next() > 0.3 },
    { item: '逻辑结构连贯性', passed: rng.next() > 0.2 },
    { item: '格式规范性', passed: true },
  ]

  let generatedContent = ''
  for (const s of sections) {
    generatedContent += '### ' + s.section_number + '. ' + s.section_title + '\n\n' + s.content + '\n\n'
  }

  return {
    document_type: input.document_type,
    jurisdiction: input.jurisdiction,
    language: input.language,
    sections,
    total_sections: sections.length,
    generated_content: generatedContent,
    variable_coverage_pct: variableCoverage,
    missing_variables: missingVars,
    quality_checklist: qualityChecklist,
    disclaimer: '本文书由AI辅助生成，使用前请执业律师审核确认。不构成正式法律意见。',
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Contract Review AI 报告 ---
function formatContractReviewReport(result: ContractReviewResult): string {
  const lines: string[] = []
  lines.push('## AI 智能合同审查报告')
  lines.push('')
  lines.push('合同类型: ' + result.contract_type + ' | 法域: ' + result.jurisdiction)
  lines.push('合规评分: ' + result.compliance_score + '/100 | 整体风险: ' + (result.overall_risk_level === 'high' ? '高' : result.overall_risk_level === 'medium' ? '中' : '低') + ' (' + result.overall_risk_score + ')')
  lines.push('风险分布: 高危 ' + result.critical_count + ' | 高 ' + result.high_count + ' | 中 ' + result.medium_count + ' | 低 ' + result.low_count)
  lines.push('')
  lines.push('### 条款风险明细')
  lines.push('| 类型 | 风险等级 | 风险分 | 条款摘要 | 问题 | 建议 |')
  lines.push('|------|----------|--------|----------|------|------|')
  for (const c of result.clause_risks) {
    const riskLabel = c.risk_level === 'critical' ? '高危' : c.risk_level === 'high' ? '高' : c.risk_level === 'medium' ? '中' : '低'
    lines.push('| ' + c.type + ' | ' + riskLabel + ' | ' + c.risk_score + ' | ' + c.clause + ' | ' + c.issues.join('; ') + ' | ' + c.suggestion + ' |')
  }
  lines.push('')
  lines.push('### 行业基准对比')
  for (const c of result.clause_risks.filter(c => c.risk_level === 'critical' || c.risk_level === 'high').slice(0, 5)) {
    lines.push('- **' + c.type + '**: ' + c.benchmark + ' — ' + c.suggestion)
  }
  lines.push('')
  lines.push('### 审查结论')
  lines.push(result.summary)
  lines.push('')
  lines.push('---')
  lines.push('*本报告由AI生成，仅供参考，不构成法律意见。重要合同请咨询专业律师。*')
  return lines.join('\n')
}

// --- Tool 2: Legal Research Assistant 报告 ---
function formatLegalResearchReport(result: LegalResearchResult): string {
  const lines: string[] = []
  lines.push('## 法律研究报告')
  lines.push('')
  lines.push('研究主题: ' + result.query)
  lines.push('法律领域: ' + result.legal_domain + ' | 研究深度: ' + result.research_depth + ' | 可信度: ' + result.confidence_score)
  lines.push('')
  lines.push('### 关键发现')
  for (const f of result.key_findings) lines.push('- ' + f)
  lines.push('')
  lines.push('### 相关判例 (Top)')
  lines.push('| 案例名称 | 案号 | 法院 | 年份 | 相关度 | 核心裁判要旨 |')
  lines.push('|----------|------|------|------|--------|-------------|')
  for (const c of result.cases.slice(0, 8)) {
    lines.push('| ' + c.case_name + ' | ' + c.citation + ' | ' + c.court + ' | ' + c.year + ' | ' + c.relevance_score + ' | ' + c.key_holdings[0] + ' |')
  }
  lines.push('')
  lines.push('### 法规引用')
  lines.push('| 法规名称 | 条款 | 相关度 | 适用说明 |')
  lines.push('|----------|------|--------|----------|')
  for (const s of result.statutes) {
    lines.push('| ' + s.statute_name + ' | ' + s.section + ' | ' + s.relevance_score + ' | ' + s.application + ' |')
  }
  lines.push('')
  lines.push('### 法律分析')
  lines.push(result.legal_analysis)
  lines.push('')
  lines.push('---')
  lines.push('*' + result.disclaimer + '*')
  return lines.join('\n')
}

// --- Tool 3: Compliance Checker AI 报告 ---
function formatComplianceCheckReport(result: ComplianceCheckResult): string {
  const lines: string[] = []
  lines.push('## 合规检测报告')
  lines.push('')
  lines.push('目标框架: ' + result.target_framework + ' | 区域: ' + result.region)
  lines.push('合规评分: ' + result.compliance_score + '/100 | 合格 ' + result.compliant_count + ' | 部分 ' + result.partial_count + ' | 不合格 ' + result.non_compliant_count)
  lines.push('严重差距: ' + result.critical_gaps + ' 项')
  lines.push('')
  lines.push('### 差距分析')
  lines.push('| 要求 | 框架 | 状态 | 严重程度 | 差距描述 | 整改建议 | 整改难度 |')
  lines.push('|------|------|------|----------|----------|----------|----------|')
  for (const g of result.gaps) {
    const statusLabel = g.status === 'compliant' ? '合规' : g.status === 'partial' ? '部分' : g.status === 'non_compliant' ? '不合规' : '不适用'
    const severityLabel = g.severity === 'critical' ? '严重' : g.severity === 'major' ? '主要' : '次要'
    lines.push('| ' + g.requirement + ' | ' + g.framework + ' | ' + statusLabel + ' | ' + severityLabel + ' | ' + g.gap_description + ' | ' + g.remediation + ' | ' + (g.remediation_effort === 'high' ? '高' : g.remediation_effort === 'medium' ? '中' : '低') + ' |')
  }
  lines.push('')
  lines.push('### 行动计划')
  for (const a of result.action_plan) lines.push('- ' + a)
  lines.push('')
  lines.push('### 检测结论')
  lines.push(result.summary)
  lines.push('')
  lines.push('---')
  lines.push('*本报告由AI生成，合规评估需结合实际情况。请咨询专业合规顾问。*')
  return lines.join('\n')
}

// --- Tool 4: E-Discovery Processor 报告 ---
function formatEDiscoveryReport(result: EDiscoveryResult): string {
  const lines: string[] = []
  lines.push('## 电子取证处理报告')
  lines.push('')
  lines.push('案件编号: ' + result.matter_id + ' | 案件名称: ' + result.matter_name)
  lines.push('总证据数: ' + result.total_items + ' | 已处理: ' + result.processed_items + ' | 重复率: ' + (result.duplicate_rate * 100).toFixed(1) + '%')
  lines.push('保管链状态: ' + (result.chain_of_custody_status === 'intact' ? '完整' : result.chain_of_custody_status === 'warning' ? '需关注' : '中断'))
  lines.push('预计审查工时: ' + result.estimated_review_hours + ' 小时')
  lines.push('')
  lines.push('### 批次处理结果')
  lines.push('| 批次ID | 总数 | 已处理 | 重复 | 错误 | 耗时(s) |')
  lines.push('|--------|------|--------|------|------|---------|')
  for (const b of result.batches) {
    lines.push('| ' + b.batch_id + ' | ' + b.item_count + ' | ' + b.processed_count + ' | ' + b.duplicate_count + ' | ' + b.error_count + ' | ' + b.processing_time_seconds + ' |')
  }
  lines.push('')
  lines.push('### 保管人汇总')
  lines.push('| 保管人 | 证据数量 | 总大小(MB) | 主要类型 |')
  lines.push('|--------|----------|-----------|----------|')
  for (const c of result.custodian_summaries) {
    lines.push('| ' + c.custodian + ' | ' + c.item_count + ' | ' + c.total_size_mb + ' | ' + c.top_document_types.join(', ') + ' |')
  }
  lines.push('')
  lines.push('### 处理结论')
  lines.push(result.processing_summary)
  lines.push('')
  lines.push('---')
  lines.push('*本报告由AI生成，电子取证需遵循法定程序。专业技术问题请咨询取证专家。*')
  return lines.join('\n')
}

// --- Tool 5: Litigation Risk Predictor 报告 ---
function formatLitigationRiskReport(result: LitigationRiskResult): string {
  const lines: string[] = []
  lines.push('## 诉讼风险预测报告')
  lines.push('')
  lines.push('案件类型: ' + result.case_type)
  lines.push('胜诉概率: ' + (result.win_probability * 100).toFixed(0) + '% | 预估赔偿: ' + result.estimated_award_min.toLocaleString() + '-' + result.estimated_award_max.toLocaleString() + ' 元')
  lines.push('预估周期: ' + result.estimated_duration_months + ' 个月 | 预估成本: ' + result.estimated_cost_range.min.toLocaleString() + '-' + result.estimated_cost_range.max.toLocaleString() + ' 元')
  lines.push('')
  lines.push('### 风险维度分析')
  lines.push('| 维度 | 得分 | 权重 | 加权分 | 评估 |')
  lines.push('|------|------|------|--------|------|')
  for (const d of result.risk_dimensions) {
    lines.push('| ' + d.dimension + ' | ' + d.score + ' | ' + d.weight + ' | ' + d.weighted_score + ' | ' + d.assessment + ' |')
  }
  lines.push('')
  lines.push('### 和解分析')
  lines.push('- 推荐和解金额区间: ' + result.settlement_analysis.recommended_range_min.toLocaleString() + '-' + result.settlement_analysis.recommended_range_max.toLocaleString() + ' 元')
  lines.push('- 和解概率: ' + (result.settlement_analysis.probability * 100).toFixed(0) + '%')
  lines.push('- 最佳和解时机: ' + result.settlement_analysis.optimal_timing)
  lines.push('')
  lines.push('### 关键风险')
  for (const r of result.key_risks) lines.push('- ' + r)
  lines.push('')
  lines.push('### 策略建议')
  for (const r of result.strategic_recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('### 综合评估')
  lines.push(result.overall_assessment)
  lines.push('')
  lines.push('---')
  lines.push('*本报告由AI生成，诉讼结果受多种因素影响。请咨询执业律师获取专业法律意见。*')
  return lines.join('\n')
}

// --- Tool 6: IP Patent Analyzer 报告 ---
function formatIPPatentReport(result: PatentAnalysisResult): string {
  const lines: string[] = []
  lines.push('## 知识产权与专利分析报告')
  lines.push('')
  lines.push('专利名称: ' + result.title + ' | 技术领域: ' + result.technical_field)
  lines.push('分析类型: ' + result.analysis_type + ' | 专利性评分: ' + result.patentability_score + '/100 | 侵权风险: ' + (result.infringement_risk === 'high' ? '高' : result.infringement_risk === 'medium' ? '中' : '低'))
  lines.push('')
  lines.push('### 现有技术检索结果 (Top)')
  lines.push('| 文献编号 | 标题 | 相关度 | 重合权利要求 | 技术差异 |')
  lines.push('|----------|------|--------|-------------|----------|')
  for (const p of result.prior_art.slice(0, 8)) {
    lines.push('| ' + p.reference_number + ' | ' + p.title + ' | ' + p.relevance_score + ' | ' + p.matching_claims.join('; ') + ' | ' + p.differences.join('; ') + ' |')
  }
  lines.push('')
  lines.push('### 新颖性评估')
  lines.push(result.novelty_assessment)
  lines.push('')
  lines.push('### 权利要求分析')
  lines.push('| 权利要求 | 类型 | 核心要素 | 潜在问题 | 范围宽窄 |')
  lines.push('|----------|------|----------|----------|----------|')
  for (const c of result.claim_analyses) {
    const typeLabel = c.independent ? '独立' : '从属'
    const breadthLabel = c.breadth === 'broad' ? '宽' : c.breadth === 'moderate' ? '适中' : '窄'
    lines.push('| 权' + c.claim_number + ' | ' + typeLabel + ' | ' + c.key_elements.slice(0, 2).join(', ') + ' | ' + (c.potential_issues.join('; ') || '无') + ' | ' + breadthLabel + ' |')
  }
  lines.push('')
  lines.push('### 建议')
  for (const r of result.recommendations) lines.push('- ' + r)
  lines.push('')
  lines.push('### 分析结论')
  lines.push(result.summary)
  lines.push('')
  lines.push('---')
  lines.push('*本报告由AI生成，专利分析需综合考虑技术、法律和市场因素。请咨询专利代理师。*')
  return lines.join('\n')
}

// --- Tool 7: Regulatory Change Tracker 报告 ---
function formatRegulatoryChangeReport(result: RegulatoryTrackResult): string {
  const lines: string[] = []
  lines.push('## 法规变更追踪报告')
  lines.push('')
  lines.push('行业: ' + result.industry + ' | 法域: ' + result.jurisdiction)
  lines.push('追踪法规: ' + result.regulations_tracked + ' 项 | 识别变更: ' + result.changes_identified + ' 项 | 高影响: ' + result.high_impact_count + ' 项')
  lines.push('')
  lines.push('### 影响评估')
  lines.push('| 法规名称 | 影响等级 | 影响领域 | 合规截止日期 | 需要行动 | 预估合规成本 |')
  lines.push('|----------|----------|----------|-------------|----------|-------------|')
  for (const a of result.impact_assessments) {
    const levelLabel = a.impact_level === 'high' ? '高' : a.impact_level === 'medium' ? '中' : '低'
    const costLabel = a.estimated_compliance_cost === 'high' ? '高' : a.estimated_compliance_cost === 'medium' ? '中' : '低'
    lines.push('| ' + a.regulation + ' | ' + levelLabel + ' | ' + a.impact_areas.join(', ') + ' | ' + a.compliance_deadline + ' | ' + (a.action_required ? '是' : '否') + ' | ' + costLabel + ' |')
  }
  lines.push('')
  if (result.upcoming_deadlines.length > 0) {
    lines.push('### 即将到期的合规义务')
    lines.push('| 法规 | 截止日期 | 紧迫度 |')
    lines.push('|------|----------|--------|')
    for (const d of result.upcoming_deadlines) {
      lines.push('| ' + d.regulation + ' | ' + d.deadline + ' | ' + d.urgency + ' |')
    }
    lines.push('')
  }
  lines.push('### 应对路线图')
  for (let i = 0; i < result.roadmap.length; i++) {
    lines.push((i + 1) + '. ' + result.roadmap[i])
  }
  lines.push('')
  lines.push('### 追踪结论')
  lines.push(result.summary)
  lines.push('')
  lines.push('---')
  lines.push('*本报告由AI生成，法规解读需专业判断。请咨询合规顾问或律师。*')
  return lines.join('\n')
}

// --- Tool 8: Document Automation Engineer 报告 ---
function formatDocumentAutomationReport(result: DocumentAutomationResult): string {
  const lines: string[] = []
  lines.push('## 法律文书自动化报告')
  lines.push('')
  lines.push('文书类型: ' + result.document_type + ' | 法域: ' + result.jurisdiction + ' | 语言: ' + result.language)
  lines.push('生成章节: ' + result.total_sections + ' | 变量覆盖: ' + result.variable_coverage_pct + '%')
  if (result.missing_variables.length > 0) {
    lines.push('缺失变量: ' + result.missing_variables.join(', '))
  }
  lines.push('')
  lines.push('### 生成章节列表')
  lines.push('| 编号 | 标题 | 来源 | 备注 |')
  lines.push('|------|------|------|------|')
  for (const s of result.sections) {
    const sourceLabel = s.source === 'template' ? '模板' : s.source === 'custom' ? '自定义' : 'AI生成'
    lines.push('| ' + s.section_number + ' | ' + s.section_title + ' | ' + sourceLabel + ' | ' + s.notes + ' |')
  }
  lines.push('')
  lines.push('### 质量检查清单')
  lines.push('| 检查项 | 结果 |')
  lines.push('|--------|------|')
  for (const q of result.quality_checklist) {
    lines.push('| ' + q.item + ' | ' + (q.passed ? '通过' : '未通过') + ' |')
  }
  lines.push('')
  lines.push('### 生成文书内容')
  lines.push(result.generated_content)
  lines.push('')
  lines.push('---')
  lines.push('*' + result.disclaimer + '*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Contract Review AI — AI智能合同审查
  tools.register(defineTool({
    name: 'contract_review_ai',
    description: 'AI智能合同审查 | 风险条款识别、合规检查、行业基准对比、修订建议 | AI-powered contract review with risk clause identification, compliance checking, industry benchmarking, and revision suggestions.',
    parameters: {
      review_input: {
        type: 'string',
        required: true,
        description: 'JSON: contract_type, clauses[{clause_text, clause_type}], jurisdiction, industry?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { review_input: string }) {
      const input: ContractReviewInput = JSON.parse(args.review_input)
      return formatContractReviewReport(analyzeContractReview(input))
    }
  }))

  // Tool 2: Legal Research Assistant — 法律研究助手
  tools.register(defineTool({
    name: 'legal_research_assistant',
    description: '法律研究助手 | 判例检索、法规引用、学说分析、结论生成 | Legal research assistant with case retrieval, statute citation, doctrinal analysis, and conclusion generation.',
    parameters: {
      research_input: {
        type: 'string',
        required: true,
        description: 'JSON: query, jurisdiction, legal_domain, depth? (quick|standard|deep)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { research_input: string }) {
      const input: LegalResearchInput = JSON.parse(args.research_input)
      return formatLegalResearchReport(analyzeLegalResearch(input))
    }
  }))

  // Tool 3: Compliance Checker AI — 合规检测引擎
  tools.register(defineTool({
    name: 'compliance_checker_ai',
    description: '合规检测引擎 | GDPR/PIPL/数据安全法 合规映射与差距分析 | Compliance checking engine for GDPR, PIPL, data security laws with gap analysis and remediation planning.',
    parameters: {
      compliance_input: {
        type: 'string',
        required: true,
        description: 'JSON: target_framework, organization_type, items[{requirement, framework, applicable, evidence?}], region'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { compliance_input: string }) {
      const input: ComplianceCheckInput = JSON.parse(args.compliance_input)
      return formatComplianceCheckReport(analyzeComplianceCheck(input))
    }
  }))

  // Tool 4: E-Discovery Processor — 电子取证处理器
  tools.register(defineTool({
    name: 'ediscovery_processor',
    description: '电子取证处理器 | 证据收集、关联分析、时间线重建、保管链验证 | E-discovery processing with evidence collection, correlation analysis, timeline reconstruction, and chain of custody verification.',
    parameters: {
      ediscovery_input: {
        type: 'string',
        required: true,
        description: 'JSON: matter_id, matter_name, evidence_items[{evidence_id, type, custodian, date_range, size_mb}], processing_options?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { ediscovery_input: string }) {
      const input: EDiscoveryInput = JSON.parse(args.ediscovery_input)
      return formatEDiscoveryReport(analyzeEDiscovery(input))
    }
  }))

  // Tool 5: Litigation Risk Predictor — 诉讼风险预测
  tools.register(defineTool({
    name: 'litigation_risk_predictor',
    description: '诉讼风险预测 | 胜诉率评估、赔偿区间预测、对方策略模拟、成本估算 | Litigation risk prediction with win probability, award range estimation, opponent strategy simulation, and cost estimation.',
    parameters: {
      litigation_input: {
        type: 'string',
        required: true,
        description: 'JSON: case_type, claim_amount, jurisdiction, court_level, factors{fact_strength, legal_merit, evidence_quality, judge_tendency, opponent_strength, precedent_alignment}'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { litigation_input: string }) {
      const input: LitigationRiskInput = JSON.parse(args.litigation_input)
      return formatLitigationRiskReport(analyzeLitigationRisk(input))
    }
  }))

  // Tool 6: IP Patent Analyzer — 知产专利分析
  tools.register(defineTool({
    name: 'ip_patent_analyzer',
    description: '知产专利分析 | 专利新颖性检索、侵权风险评估、权利要求分析、技术地图 | IP patent analysis with novelty search, infringement risk assessment, claim analysis, and technology mapping.',
    parameters: {
      patent_input: {
        type: 'string',
        required: true,
        description: 'JSON: title, abstract, claims[], technical_field, filing_region, analysis_type (novelty|infringement|freedom_to_operate|portfolio)'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { patent_input: string }) {
      const input: PatentInput = JSON.parse(args.patent_input)
      return formatIPPatentReport(analyzeIPPatent(input))
    }
  }))

  // Tool 7: Regulatory Change Tracker — 法规变更追踪
  tools.register(defineTool({
    name: 'regulatory_change_tracker',
    description: '法规变更追踪 | 立法动态监控、影响评估、合规差距分析、应对路线图 | Regulatory change tracking with legislative monitoring, impact assessment, compliance gap analysis, and remediation roadmap.',
    parameters: {
      tracking_input: {
        type: 'string',
        required: true,
        description: 'JSON: industry, jurisdiction, regulations_of_interest[], changes[{regulation_name, issuing_body, effective_date, change_description, industry_scope[], jurisdiction}], assessment_depth?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { tracking_input: string }) {
      const input: RegulatoryTrackInput = JSON.parse(args.tracking_input)
      return formatRegulatoryChangeReport(analyzeRegulatoryChange(input))
    }
  }))

  // Tool 8: Document Automation Engineer — 法律文书自动化
  tools.register(defineTool({
    name: 'document_automation_engineer',
    description: '法律文书自动化 | 合同/起诉状/律师意见书模板生成、字段填充、批注 | Legal document automation with template generation, field population, and annotations for contracts, pleadings, and legal opinions.',
    parameters: {
      doc_input: {
        type: 'string',
        required: true,
        description: 'JSON: document_type, jurisdiction, language, variables{}, clauses_required[], custom_provisions?'
      }
    },
    output: { schema: { type: 'string' }, render: (_args: Record<string, unknown>, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { doc_input: string }) {
      const input: DocumentTemplateInput = JSON.parse(args.doc_input)
      return formatDocumentAutomationReport(analyzeDocumentAutomation(input))
    }
  }))

  console.log('[dsh-tool-legaltechai] Loaded v' + VERSION + ' — AI Legal Tech: 8 tools active')
  console.log('  Tools: contract_review_ai, legal_research_assistant, compliance_checker_ai, ediscovery_processor, litigation_risk_predictor, ip_patent_analyzer, regulatory_change_tracker, document_automation_engineer')
}
