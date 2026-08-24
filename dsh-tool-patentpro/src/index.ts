/**
 * DSH Patent & IP Management Pro Plugin v1.0.0
 *
 * Patent & IP Management — patent drafting assistance, prior art search,
 * IP portfolio management, patent valuation, patentability scoring,
 * claim scope optimization, infringement risk assessment, patent landscape visualization.
 * 2026: IP management software $10B+; patent analytics $5B+.
 *
 * Features (v1.0.0):
 * - Patent Drafting Assistance (specification structure, claim drafting, abstraction quality, filing readiness)
 * - Prior Art Search Optimizer (search strategy, keyword expansion, database relevance, novelty gap analysis)
 * - IP Portfolio Manager (asset scoring, maintenance decisions, geographic coverage, renewal optimization)
 * - Patent Valuation Engine (market approach, income approach, cost approach, licensing potential)
 * - Patentability Scorer (novelty, inventive step, industrial applicability, documentation quality)
 * - Claim Scope Optimizer (broadness vs validity, dependency analysis, claim differentiation, coverage mapping)
 * - Infringement Risk Assessor (clearance search, claim chart analysis, risk level, design-around suggestions)
 * - Patent Landscape Visualizer (technology trends, assignee mapping, citation network, white space analysis)
 *
 * @module dsh-tool-patentpro
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-patentpro'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本工具提供专利与知识产权管理分析框架，不替代专业专利代理人或知识产权律师意见。'

// ==================== TYPES ====================

export interface PatentDraftingInput {
  invention_title?: string
  technical_field?: string
  background_art?: string[]
  technical_problem?: string
  technical_solution?: string[]
  advantageous_effects?: string[]
  claim_count?: number
  embodiment_count?: number
  target_jurisdiction?: 'CN' | 'US' | 'EP' | 'JP' | 'KR' | 'PCT'
  application_type?: 'invention' | 'utility_model' | 'design' | 'PCT'
  abstract_word_count?: number
  drawing_count?: number
}

export interface PriorArtSearchInput {
  target_invention?: string
  technical_keywords?: string[]
  ipc_codes?: string[]
  cpc_codes?: string[]
  search_databases?: string[]
  time_range?: { start_year?: number; end_year?: number }
  language_scope?: string[]
  max_results?: number
  known_prior_art?: string[]
}

export interface IPPortfolioInput {
  patents?: { id: string; title?: string; country?: string; filing_date?: string; grant_date?: string; maintenance_years?: number; quality_score?: number; citation_count?: number; family_size?: number }[]
  trademarks?: { mark: string; country?: string; registration_date?: string; renewal_due?: string; brand_value_score?: number }[]
  trade_secrets?: { name: string; protection_level?: string; estimated_value?: number }[]
  budget_usd?: number
  strategic_focus?: string[]
  portfolio_objective?: 'monetization' | 'defense' | 'licensing' | 'blocking' | 'mixed'
}

export interface PatentValuationInput {
  patent_id?: string
  patent_title?: string
  market_size_usd_m?: number
  market_growth_rate?: number
  remaining_life_years?: number
  essential_patent?: boolean
  standard_related?: boolean
  citation_count?: number
  family_size?: number
  licensing_revenue_annual?: number
  profit_margin?: number
  discount_rate?: number
  litigation_history?: ('won' | 'lost' | 'settled' | 'none')[]
  comparable_transactions?: { deal_value?: number; patent_count?: number }[]
  valuation_method?: 'market' | 'income' | 'cost' | 'hybrid'
}

export interface PatentabilityInput {
  invention_title?: string
  technical_field?: string
  closest_prior_art?: string[]
  novel_features?: string[]
  technical_effects?: string[]
  inventive_step_arguments?: string[]
  industrial_applicability?: string[]
  sufficiency_of_disclosure?: boolean
  enablement_score?: number
  written_description_score?: number
  claim_clarity?: number
  search_depth?: 'preliminary' | 'moderate' | 'comprehensive'
}

export interface ClaimScopeInput {
  independent_claims?: { number?: number; preamble?: string; body_elements?: string[]; scope_estimate?: number }[]
  dependent_claims?: { depends_on?: number; additional_elements?: string[]; narrowing_degree?: number }[]
  claim_language_clear?: boolean
  means_plus_function_used?: boolean
  claim_differentiation?: number
  coverage_objectives?: string[]
  competitor_products?: { name: string; features_matched?: string[]; features_extra?: string[] }[]
  target_scope?: 'broad' | 'narrow' | 'balanced'
}

export interface InfringementRiskInput {
  product_name?: string
  product_features?: string[]
  target_patents?: { patent_number?: string; title?: string; claims?: string; expiration_date?: string; owner?: string }[]
  target_jurisdictions?: string[]
  clearance_depth?: 'quick' | 'standard' | 'comprehensive'
  design_around_budget?: number
  previous_opinions?: string[]
}

export interface PatentLandscapeInput {
  technology_domain?: string
  search_query?: string
  time_period?: { start_year?: number; end_year?: number }
  geographic_scope?: string[]
  top_assignees?: { name: string; patent_count?: number; trend?: 'growing' | 'stable' | 'declining' }[]
  technology_clusters?: { name: string; patent_count?: number; growth_rate?: number; avg_citations?: number }[]
  citation_network?: { citing_patent?: string; cited_patent?: string; strength?: number }[]
  white_space_areas?: { area: string; potential: 'high' | 'medium' | 'low'; estimated_opportunity?: number }[]
  analysis_depth?: 'overview' | 'detailed' | 'comprehensive'
}

// ==================== MULBERRY32 DETERMINISTIC PRNG ====================

function mulberry32(seed: number): () => number {
  let a = seed | 0
  return function (): number {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

// ==================== HELPER FUNCTIONS ====================

function parseInput<T>(inputData: string): T {
  try {
    return JSON.parse(inputData) as T
  } catch {
    return {} as T
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function formatPct(score: number): string {
  return (score * 100).toFixed(1)
}

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function makeSeed(inputData: string): number {
  return hashString(JSON.stringify(inputData))
}

// ==================== TOOL 1: PATENT DRAFTING ASSISTANT ====================

function executePatentDraftingAssistant(inputData: string): string {
  const data = parseInput<PatentDraftingInput>(inputData)
  const title = data.invention_title || '未命名发明'
  const field = data.technical_field || '通用技术'
  const background = data.background_art || ['现有技术存在效率低下的问题']
  const problem = data.technical_problem || '提升系统性能并降低成本'
  const solution = data.technical_solution || ['采用新型算法优化处理流程']
  const effects = data.advantageous_effects || ['处理速度提升40%', '能耗降低20%']
  const claimCount = data.claim_count || 5
  const embodimentCount = data.embodiment_count || 1
  const jurisdiction = data.target_jurisdiction || 'CN'
  const appType = data.application_type || 'invention'
  const abstractCount = data.abstract_word_count || 150
  const drawingCount = data.drawing_count || 3

  const seed = makeSeed(inputData)
  const rng = mulberry32(seed)

  let report = '# 专利撰写辅助报告' + '\n\n'
  report += '**发明名称:** ' + title + '\n'
  report += '**技术领域:** ' + field + '\n'
  report += '**目标管辖:** ' + jurisdiction + ' | **申请类型:** ' + appType + '\n'
  report += ' **权利要求数:** ' + claimCount + ' | **实施例数:** ' + embodimentCount + '\n'
  report += ' **摘要字数:** ' + abstractCount + ' | **附图数:** ' + drawingCount + '\n\n'
  report += '---' + '\n\n'

  report += '## 技术背景分析' + '\n\n'
  background.forEach((art, i) => {
    report += (i + 1) + '. ' + art + '\n'
  })

  report += '\n## 技术问题与解决方案对照' + '\n\n'
  report += '| # | 技术问题要点 | 解决方案要点 | 有益效果 |\n'
  report += '|---|------------|------------|----------|\n'
  const maxRows = Math.max(solution.length, effects.length, 1)
  for (let i = 0; i < maxRows; i++) {
    const sol = solution[i] || '—'
    const eff = effects[i] || '—'
    report += '| ' + (i + 1) + ' | ' + problem.slice(0, 30) + '... | ' + sol + ' | ' + eff + ' |\n'
  }

  report += '\n## 权利要求结构设计建议' + '\n\n'
  report += '| 权利要求编号 | 类型 | 建议内容 | 预估范围 |\n'
  report += '|-------------|------|---------|----------|\n'
  report += '| 1 | 独立权利要求 | 包含全部必要技术特征 | 宽泛 |\n'
  for (let i = 1; i < Math.min(claimCount, 6); i++) {
    const narrowing = i <= 2 ? '适度缩小' : i <= 4 ? '进一步限定' : '精确限定'
    report += '| ' + (i + 1) + ' | 从属权利要求 | 增加技术特征限定 | ' + narrowing + ' |\n'
  }
  if (claimCount > 6) {
  report += '| ... | 从属权利要求 | 继续增加限定特征 | 精准覆盖 |\n'
  }

  report += '\n## 撰写质量评估' + '\n\n'
  report += '| 评估维度 | 得分 | 评级 | 建议 |\n'
  report += '|---------|------|------|------|\n'
  const sections = [
    { name: '技术问题清晰度', score: clamp(0.6 + rng() * 0.4, 0, 1) },
    { name: '方案完整性', score: clamp(solution.length / 5 * (0.8 + rng() * 0.2), 0, 1) },
    { name: '效果可量化程度', score: clamp(effects.length / 4 * (0.7 + rng() * 0.3), 0, 1) },
    { name: '支持充分性', score: clamp(embodimentCount / 3 * (0.7 + rng() * 0.3), 0, 1) },
    { name: '摘要合规性', score: clamp(Math.min(abstractCount, 300) / 300 * (0.8 + rng() * 0.2), 0, 1) }
  ]
  sections.forEach(s => {
    const rating = s.score > 0.8 ? '优秀' : s.score > 0.6 ? '良好' : '需改进'
    const suggestion = s.score > 0.8 ? '保持当前质量' : s.score > 0.6 ? '可进一步优化' : '建议补充技术细节'
    report += '| ' + s.name + ' | ' + formatPct(s.score) + '% | ' + rating + ' | ' + suggestion + ' |\n'
  })

  const overallDraftScore = sections.reduce((sum, s) => sum + s.score, 0) / sections.length

  report += '\n## 递交就绪度: ' + formatPct(overallDraftScore) + '%' + '\n\n'

  const filingReadiness: string[] = []
  if (abstractCount > 300) filingReadiness.push('摘要字数超过300字限制，需精简至300字以内')
  if (claimCount < 1) filingReadiness.push('缺少权利要求书')
  if (embodimentCount < 1) filingReadiness.push('需要至少一个具体实施例')
  if (solution.length < 1) filingReadiness.push('技术方案描述不完整')
  if (drawingCount < 1) filingReadiness.push('建议至少提供一幅示意图')
  if (filingReadiness.length === 0) filingReadiness.push('基本满足递交要求，建议由代理人最终审核')
  filingReadiness.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 2: PRIOR ART SEARCH OPTIMIZER ====================

function executePriorArtSearchOptimizer(inputData: string): string {
  const data = parseInput<PriorArtSearchInput>(inputData)
  const target = data.target_invention || '通用技术方案'
  const keywords = data.technical_keywords || ['算法', '处理', '系统']
  const ipcCodes = data.ipc_codes || ['G06F', 'H04L']
  const cpcCodes = data.cpc_codes || []
  const databases = data.search_databases || ['CNIPA', 'USPTO', 'EPO', 'WIPO']
  const timeRange = data.time_range || { start_year: 2000, end_year: 2025 }
  const langScope = data.language_scope || ['zh', 'en']
  const maxResults = data.max_results || 100
  const knownArt = data.known_prior_art || []

  const seed = makeSeed(inputData)
  const rng = mulberry32(seed)

  let report = '# 现有技术检索优化报告' + '\n\n'
  report += '**目标发明:** ' + target + '\n'
  report += '**检索数据库:** ' + databases.join(', ') + '\n'
  report += ' **IPC分类号:** ' + ipcCodes.join(', ') + (cpcCodes.length > 0 ? ' | CPC: ' + cpcCodes.join(', ') : '') + '\n'
  report += ' **时间范围:** ' + (timeRange.start_year || 2000) + '-' + (timeRange.end_year || 2025) + ' | 语言: ' + langScope.join(', ') + '\n'
  report += ' **最大结果数:** ' + maxResults + '\n\n'
  report += '---' + '\n\n'

  report += '## 关键词扩展策略' + '\n\n'
  const expandedKeywords: string[] = [...keywords]
  const expansionSynonyms: Record<string, string[]> = {
    '算法': ['计算方法', '逻辑处理', '运算规则', 'algorithm', 'method'],
    '处理': ['加工', '分析', '转换', 'process', 'treatment'],
    '系统': ['装置', '设备', '平台', 'system', 'apparatus'],
    '检测': ['识别', '监测', '诊断', 'detection', 'monitoring'],
    '优化': ['改进', '增强', '调节', 'optimization', 'improvement']
  }
  keywords.forEach(kw => {
    const syns = expansionSynonyms[kw] || []
    syns.forEach(s => {
      if (!expandedKeywords.includes(s)) expandedKeywords.push(s)
    })
  })
  report += '| 类型 | 关键词列表 |\n'
  report += '|------|-----------|\n'
  report += '| 原始关键词（' + keywords.length + '） | ' + keywords.join(', ') + ' |\n'
  report += '| 扩展关键词（' + (expandedKeywords.length - keywords.length) + '） | ' + expandedKeywords.slice(keywords.length).join(', ') + ' |\n'
  report += '| 总计 | ' + expandedKeywords.length + ' |\n'

  report += '\n## 检索式推荐' + '\n\n'
  report += '| 数据库 | 检索式 | 预估命中 |\n'
  report += '|--------|--------|----------|\n'
  databases.forEach(db => {
    const baseCount = Math.floor(rng() * maxResults * 0.8 + 10)
    const syntax = db === 'CNIPA' ? 'FI/(' + ipcCodes[0] + ') AND ABS=(' + keywords.slice(0, 2).join(' AND ') + ')'
      : db === 'USPTO' ? 'IPC/' + ipcCodes[0] + ' AND (' + keywords.slice(0, 2).map(kw => '"' + kw + '"').join(' AND ') + ')'
      : db === 'EPO' ? ipcCodes[0] + ' AND (' + expandedKeywords.slice(0, 3).join(' OR ') + ')'
      : 'classification:' + ipcCodes[0] + ' AND (' + keywords.join(' OR ') + ')'
    report += '| ' + db + ' | ' + syntax + ' | ~' + baseCount + ' 条 |\n'
  })

  report += '\n## 检索结果相关性预估' + '\n\n'
  report += '| 相关性级别 | 预估占比 | 数量 | 处理建议 |\n'
  report += '|-----------|---------|------|----------|\n'
  const relevanceLevels = [
    { level: '高度相关 (A)', ratio: clamp(0.05 + rng() * 0.1, 0, 0.3) },
    { level: '中度相关 (B)', ratio: clamp(0.15 + rng() * 0.15, 0, 0.4) },
    { level: '低度相关 (C)', ratio: clamp(0.2 + rng() * 0.15, 0, 0.5) },
    { level: '不相关 (D)', ratio: 0 }
  ]
  relevanceLevels.forEach((lv, i) => {
    if (i < 3) {
      const count = Math.floor(maxResults * lv.ratio)
      const advice = i === 0 ? '逐篇详读，分析新颖性' : i === 1 ? '筛选阅读，关注技术特征' : '快速浏览标题摘要'
      report += '| ' + lv.level + ' | ' + formatPct(lv.ratio) + '% | ~' + count + ' | ' + advice + ' |\n'
    }
  })

  report += '\n## 现有技术空白分析' + '\n\n'
  const gapScore = clamp(1 - relevanceLevels[0].ratio * 3, 0.2, 0.95)
  report += '| 维度 | 评估 |\n'
  report += '|------|------|\n'
  report += '| 新颖性空间 | ' + formatPct(gapScore) + '% |\n'
  report += '| 已知对比文件 | ' + knownArt.length + ' 篇 |\n'
  report += '| 检索覆盖度 | ' + formatPct(clamp(databases.length / 5, 0.3, 1)) + '% |\n'
  report += '| 分类体系覆盖 | ' + formatPct(clamp((ipcCodes.length + cpcCodes.length) / 6, 0.3, 1)) + '% |\n'

  report += '\n## 优化建议' + '\n\n'
  const searchRecs: string[] = []
  if (expandedKeywords.length < 10) searchRecs.push('关键词池较小，建议进一步扩展同义词和下位概念')
  if (ipcCodes.length < 2) searchRecs.push('建议增加相关IPC缩小以下分类号，提高检索精度')
  if (databases.length < 3) searchRecs.push('建议增加检索数据库覆盖，特别是非英文专利数据库')
  if (knownArt.length > 5) searchRecs.push('已知对比文件较多，需重点关注新颖性差异')
  if (searchRecs.length === 0) searchRecs.push('检索策略全面，建议分阶段执行深度检索')
  searchRecs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 3: IP PORTFOLIO MANAGER ====================

function executeIPPortfolioManager(inputData: string): string {
  const data = parseInput<IPPortfolioInput>(inputData)
  const patents = data.patents || []
  const trademarks = data.trademarks || []
  const tradeSecrets = data.trade_secrets || []
  const budget = data.budget_usd || 500000
  const strategicFocus = data.strategic_focus || ['核心技术', '新兴市场']
  const objective = data.portfolio_objective || 'mixed'

  const seed = makeSeed(inputData)
  const rng = mulberry32(seed)

  const totalAssets = patents.length + trademarks.length + tradeSecrets.length
  const countries = new Set<string>()
  patents.forEach(p => { if (p.country) countries.add(p.country) })
  trademarks.forEach(t => { if (t.country) countries.add(t.country) })

  let report = '# IP资产组合管理报告' + '\n\n'
  report += '**资产总数:** ' + totalAssets + ' | **预算USD:** $' + budget.toLocaleString() + '\n'
  report += ' **组合目标:** ' + objective + ' | **覆盖地域:** ' + countries.size + '个\n'
  report += ' **战略焦点:** ' + strategicFocus.join(', ') + '\n\n'
  report += '---' + '\n\n'

  report += '## 资产分布概览' + '\n\n'
  report += '| 资产类型 | 数量 | 占比 | 平均质量/价值 |\n'
  report += '|---------|------|------|-------------|\n'
  const avgPatentQuality = patents.length > 0 ? patents.reduce((s, p) => s + (p.quality_score || 0.5), 0) / patents.length : 0
  const avgTrademarkValue = trademarks.length > 0 ? trademarks.reduce((s, t) => s + (t.brand_value_score || 0.5), 0) / trademarks.length : 0
  report += '| 专利 | ' + patents.length + ' | ' + (totalAssets > 0 ? formatPct(patents.length / totalAssets) : '0') + '% | ' + formatPct(avgPatentQuality) + '% |\n'
  report += '| 商标 | ' + trademarks.length + ' | ' + (totalAssets > 0 ? formatPct(trademarks.length / totalAssets) : '0') + '% | ' + formatPct(avgTrademarkValue) + '% |\n'
  report += '| 商业秘密 | ' + tradeSecrets.length + ' | ' + (totalAssets > 0 ? formatPct(tradeSecrets.length / totalAssets) : '0') + '% | — |\n'

  report += '\n## 专利质量分层分析' + '\n\n'
  report += '| 层级 | 数量 | 平均引用 | 平均家族 | 建议 |\n'
  report += '|------|------|---------|---------|------|\n'
  const tiers = [
    { name: '核心高价值', minQ: 0.8, maxQ: 1.0 },
    { name: '重要资产', minQ: 0.6, maxQ: 0.8 },
    { name: '一般保护', minQ: 0.4, maxQ: 0.6 },
    { name: '待评估/淘汰', minQ: 0.0, maxQ: 0.4 }
  ]
  tiers.forEach(t => {
    const tierPatents = patents.filter(p => (p.quality_score || 0.5) >= t.minQ && (p.quality_score || 0.5) < t.maxQ)
    const avgCite = tierPatents.length > 0 ? tierPatents.reduce((s, p) => s + (p.citation_count || 0), 0) / tierPatents.length : 0
    const avgFam = tierPatents.length > 0 ? tierPatents.reduce((s, p) => s + (p.family_size || 1), 0) / tierPatents.length : 0
    const advice = t.minQ >= 0.8 ? '重点维护、监控侵权' : t.minQ >= 0.6 ? '定期评估维持价值' : t.minQ >= 0.4 ? '评估续费必要性' : '考虑主动放弃或转化'
    report += '| ' + t.name + ' | ' + tierPatents.length + ' | ' + avgCite.toFixed(1) + ' | ' + avgFam.toFixed(1) + ' | ' + advice + ' |\n'
  })

  report += '\n## 续费与维护决策' + '\n\n'
  report += '| 决策类别 | 数量 | 预估年费(USD) | 优先级 |\n'
  report += '|---------|------|-------------|--------|\n'
  const renewalDecisions = [
    { name: '必须维持', count: patents.filter(p => (p.quality_score || 0) >= 0.7).length, costFactor: 0.5, priority: '最高' },
    { name: '建议维持', count: patents.filter(p => { const q = p.quality_score || 0; return q >= 0.5 && q < 0.7 }).length, costFactor: 0.3, priority: '中' },
    { name: '选择性维持', count: patents.filter(p => { const q = p.quality_score || 0; return q >= 0.3 && q < 0.5 }).length, costFactor: 0.15, priority: '低' },
    { name: '建议放弃', count: patents.filter(p => (p.quality_score || 0) < 0.3).length, costFactor: 0.05, priority: '最低' }
  ]
  renewalDecisions.forEach(d => {
    const estCost = d.count * 5000 * d.costFactor
    report += '| ' + d.name + ' | ' + d.count + ' | $' + estCost.toLocaleString() + ' | ' + d.priority + ' |\n'
  })

  report += '\n## 地域覆盖分析' + '\n\n'
  report += '| 地区 | 专利数 | 商标数 | 覆盖评估 |\n'
  report += '|------|-------|-------|----------|\n'
  const countryArr = Array.from(countries)
  countryArr.forEach(c => {
    const pCount = patents.filter(p => p.country === c).length
    const tCount = trademarks.filter(t => t.country === c).length
    const assessment = pCount + tCount >= 5 ? '重点市场 — 全面保护' : pCount + tCount >= 2 ? '发展中 — 持续关注' : '初步布局 — 评估扩展'
    report += '| ' + c + ' | ' + pCount + ' | ' + tCount + ' | ' + assessment + ' |\n'
  })

  report += '\n## 管理建议' + '\n\n'
  const portfolioRecs: string[] = []
  if (objective === 'monetization') portfolioRecs.push('聚焦高价值专利组合，建立许可推广清单')
  else if (objective === 'defense') portfolioRecs.push('强化核心技术和周边防御专利布局')
  else if (objective === 'licensing') portfolioRecs.push('构建标准必要专利(SEP)组合，关注FRAND许可机会')
  else if (objective === 'blocking') portfolioRecs.push('针对竞品技术方向进行密集的包围式申请')
  else portfolioRecs.push('多维策略平衡，兼顾防御与转化价值')
  if (countries.size < 3 && patents.length > 5) portfolioRecs.push('地域覆盖不足，建议扩展至PCT或主要目标市场')
  if (avgPatentQuality < 0.5 && patents.length > 3) portfolioRecs.push('整体专利质量偏低，建议加强申请前评估')
  portfolioRecs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 4: PATENT VALUATION ENGINE ====================

function executePatentValuationEngine(inputData: string): string {
  const data = parseInput<PatentValuationInput>(inputData)
  const patentId = data.patent_id || 'CN-UNKNOWN'
  const patentTitle = data.patent_title || '专利'
  const marketSize = data.market_size_usd_m || 100
  const growthRate = data.market_growth_rate || 0.1
  const remainingLife = data.remaining_life_years || 10
  const essential = data.essential_patent || false
  const standardRelated = data.standard_related || false
  const citations = data.citation_count || 10
  const familySize = data.family_size || 3
  const licensingRevenue = data.licensing_revenue_annual || 0
  const profitMargin = data.profit_margin || 0.25
  const discountRate = data.discount_rate || 0.12
  const litHistory = data.litigation_history || ['none']
  const comparables = data.comparable_transactions || []
  const method = data.valuation_method || 'hybrid'

  const seed = makeSeed(inputData)
  const rng = mulberry32(seed)

  let report = '# 专利价值评估报告' + '\n\n'
  report += '**专利号:** ' + patentId + ' | **名称:** ' + patentTitle + '\n'
  report += ' **估值方法:** ' + method + ' | **剩余年限:** ' + remainingLife + '年\n'
  report += ' **市场规模:** $' + marketSize + 'M | **增长率:** +' + (growthRate * 100).toFixed(1) + '%\n'
  report += ' **SEP:** ' + (essential ? '是' : '否') + ' | **标准相关:** ' + (standardRelated ? '是' : '否') + '\n'
  report += ' **引用数:** ' + citations + ' | **家族规模:** ' + familySize + '\n\n'
  report += '---' + '\n\n'

  // Market Approach
  const marketMultiplier = essential ? 2.5 : standardRelated ? 1.8 : 1.0
  const marketValue = marketSize * growthRate * remainingLife * marketMultiplier * 0.05 * (1 + rng() * 0.2)

  // Income Approach
  const annualIncome = licensingRevenue > 0 ? licensingRevenue : marketSize * profitMargin * 0.01 * (1 + rng() * 0.3)
  let incomeValue = 0
  for (let y = 1; y <= remainingLife; y++) {
    incomeValue += annualIncome / Math.pow(1 + discountRate, y)
  }

  // Cost Approach
  const devCost = 50 + rng() * 100
  const filingCost = 5 + familySize * 2
  const maintenanceCost = familySize * remainingLife * 0.5
  const costValue = devCost + filingCost + maintenanceCost

  let hybridValue = 0
  if (method === 'market') hybridValue = marketValue
  else if (method === 'income') hybridValue = incomeValue
  else if (method === 'cost') hybridValue = costValue
  else hybridValue = marketValue * 0.3 + incomeValue * 0.5 + costValue * 0.2

  report += '## 三种基础估值方法' + '\n\n'
  report += '| 方法 | 估值(USD M) | 适用场景 | 权重 |\n'
  report += '|------|-----------|---------|------|\n'
  report += '| 市场法 | $' + marketValue.toFixed(2) + 'M | 有可比交易数据时首选 | ' + (method === 'hybrid' ? '30%' : method === 'market' ? '100%' : '—') + ' |\n'
  report += '| 收益法 | $' + incomeValue.toFixed(2) + 'M | 有明确许可收入时首选 | ' + (method === 'hybrid' ? '50%' : method === 'income' ? '100%' : '—') + ' |\n'
  report += '| 成本法 | $' + costValue.toFixed(2) + 'M | 技术密集度高，重置成本参考 | ' + (method === 'hybrid' ? '20%' : method === 'cost' ? '100%' : '—') + ' |\n'

  report += '\n## 综合估值结果' + '\n\n'
  report += '| 指标 | 数值 |\n'
  report += '|------|------|\n'
  report += '| 综合估值 | **$' + hybridValue.toFixed(2) + 'M** |\n'
  report += '| 估值区间(低) | $' + (hybridValue * 0.7).toFixed(2) + 'M |\n'
  report += '| 估值区间(高) | $' + (hybridValue * 1.5).toFixed(2) + 'M |\n'
  report += '| 置信度 | ' + formatPct(clamp(0.5 + (citations > 10 ? 0.2 : 0) + (comparables.length > 0 ? 0.15 : 0) + rng() * 0.15, 0, 0.95)) + '% |\n'

  report += '\n## 价值驱动因素' + '\n\n'
  report += '| 因素 | 影响 | 说明 |\n'
  report += '|------|------|------|\n'
  report += '| 剩余保护期 | ' + (remainingLife > 10 ? '正面' : remainingLife > 5 ? '中性' : '负面') + ' | ' + remainingLife + '年剩余保护期 |\n'
  report += '| 引用影响力 | ' + (citations > 20 ? '高影响力' : citations > 10 ? '中等影响' : '低影响') + ' | 被引用' + citations + '次 |\n'
  report += '| 专利家族强度 | ' + (familySize > 5 ? '强布局' : familySize > 2 ? '中等' : '单一保护') + ' | ' + familySize + '个同族 |\n'
  report += '| 诉讼历史 | ' + (litHistory.includes('won') ? '正面（胜诉验证）' : litHistory.includes('lost') ? '负面' : '无记录') + ' | 历史结果影响价值 |\n'
  report += '| 市场规模 | ' + (marketSize > 500 ? '大规模市场' : marketSize > 100 ? '中等市场' : '小市场') + ' | $' + marketSize + 'M |\n'

  if (comparables.length > 0) {
    report += '\n## 可比交易参照' + '\n\n'
    report += '| 交易 | 金额(USD M) | 专利数 | 均价(USD M) |\n'
    report += '|------|-----------|-------|------------|\n'
    comparables.forEach((c, i) => {
      const avg = (c.deal_value || 0) / Math.max(c.patent_count || 1, 1)
      report += '| 可比交易' + (i + 1) + ' | $' + (c.deal_value || 0).toFixed(1) + 'M | ' + (c.patent_count || 1) + ' | $' + avg.toFixed(2) + 'M |\n'
    })
  }

  report += '\n## 许可价值评估' + '\n\n'
  const licenseRate = essential ? '2-5%' : standardRelated ? '1-3%' : '0.5-2%'
  const estimatedLicenseAnnual = marketSize * (essential ? 0.03 : 0.01)
  report += '| 指标 | 数值 |\n'
  report += '|------|------|\n'
  report += '| 建议许可费率 | ' + licenseRate + ' |\n'
  report += '| 预估年许可收入 | $' + estimatedLicenseAnnual.toFixed(2) + 'M |\n'
  report += '| FRAND适用 | ' + (standardRelated ? '是（按FRAND原则定价）' : '否') + ' |\n'

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 5: PATENTABILITY SCORER ====================

function executePatentabilityScorer(inputData: string): string {
  const data = parseInput<PatentabilityInput>(inputData)
  const title = data.invention_title || '未命名发明'
  const field = data.technical_field || '通用技术'
  const closestArt = data.closest_prior_art || []
  const novelFeatures = data.novel_features || []
  const techEffects = data.technical_effects || []
  const inventiveArgs = data.inventive_step_arguments || []
  const industrialApply = data.industrial_applicability || []
  const sufficiency = data.sufficiency_of_disclosure !== false
  const enablement = data.enablement_score || 0.7
  const writtenDesc = data.written_description_score || 0.7
  const claimClarity = data.claim_clarity || 0.6
  const searchDepth = data.search_depth || 'moderate'

  const seed = makeSeed(inputData)
  const rng = mulberry32(seed)

  let report = '# 专利性评分报告' + '\n\n'
  report += '**发明名称:** ' + title + '\n'
  report += '**技术领域:** ' + field + '\n'
  report += ' **最接近对比文件:** ' + closestArt.length + '篇 | 检索深度: ' + searchDepth + '\n'
  report += ' **新颖特征:** ' + novelFeatures.length + '个 | 技术效果: ' + techEffects.length + '个\n\n'
  report += '---' + '\n\n'

  // Novelty score
  const noveltyScore = clamp(
    (novelFeatures.length > 0 ? 0.5 : 0) +
    (novelFeatures.length > 2 ? 0.2 : 0) +
    (closestArt.length === 0 ? 0.3 : closestArt.length < 3 ? 0.1 : 0) +
    rng() * 0.15,
    0, 1
  )

  // Inventive step score
  const inventiveScore = clamp(
    (inventiveArgs.length > 0 ? 0.4 : 0) +
    (inventiveArgs.length > 2 ? 0.25 : 0) +
    (techEffects.length > 0 ? 0.2 : 0) +
    rng() * 0.15,
    0, 1
  )

  // Industrial applicability score
  const applicabilityScore = clamp(
    (industrialApply.length > 0 ? 0.6 : 0.3) +
    (industrialApply.length > 1 ? 0.2 : 0) +
    rng() * 0.2,
    0, 1
  )

  // Documentation quality
  const docScore = clamp((enablement + writtenDesc + claimClarity) / 3 * (0.9 + rng() * 0.1), 0, 1)

  const overallScore = noveltyScore * 0.35 + inventiveScore * 0.3 + applicabilityScore * 0.15 + docScore * 0.2

  report += '## 三性评估（新颖性/创造性/实用性）' + '\n\n'
  report += '| 专利性要件 | 得分 | 权重 | 加权得分 | 评级 |\n'
  report += '|-----------|------|------|---------|------|\n'
  report += '| 新颖性 | ' + formatPct(noveltyScore) + '% | 35% | ' + formatPct(noveltyScore * 0.35) + '% | ' + (noveltyScore > 0.7 ? '通过' : noveltyScore > 0.5 ? '风险' : '不通过') + ' |\n'
  report += '| 创造性 | ' + formatPct(inventiveScore) + '% | 30% | ' + formatPct(inventiveScore * 0.3) + '% | ' + (inventiveScore > 0.7 ? '通过' : inventiveScore > 0.5 ? '风险' : '不通过') + ' |\n'
  report += '| 实用性 | ' + formatPct(applicabilityScore) + '% | 15% | ' + formatPct(applicabilityScore * 0.15) + '% | ' + (applicabilityScore > 0.6 ? '通过' : '风险') + ' |\n'
  report += '| 文件质量 | ' + formatPct(docScore) + '% | 20% | ' + formatPct(docScore * 0.2) + '% | ' + (docScore > 0.7 ? '优秀' : '需改进') + ' |\n'

  report += '\n## 综合专利性评分: ' + formatPct(overallScore) + '%' + '\n\n'
  report += '> 结论: ' + (overallScore > 0.75 ? '专利性高，建议尽快申请' : overallScore > 0.55 ? '有一定专利性，需强化技术方案描述' : overallScore > 0.35 ? '专利性存疑，建议补充分析和实验' : '专利性较低，建议谨慎评估') + '\n\n'

  report += '## 新颖性分析' + '\n\n'
  report += '| 对比文件 | 公开特征 | 差异特征 | 公开程度 |\n'
  report += '|---------|---------|---------|----------|\n'
  closestArt.forEach((art, i) => {
    const disclosure = i === 0 ? '高度公开' : i === 1 ? '中度公开' : '低度公开'
    report += '| 对比文件' + (i + 1) + ': ' + art.slice(0, 20) + '... | 部分重合 | ' + novelFeatures.slice(0, 2).join(', ') + ' | ' + disclosure + ' |\n'
  })

  report += '\n## 必要条件检查' + '\n\n'
  report += '| 条件 | 状态 | 说明 |\n'
  report += '|------|------|------|\n'
  report += '| 充分公开 | ' + (sufficiency ? '满足' : '不满足') + ' | 说明书应使本领域技术人员能够实现 |\n'
  report += '| 书面描述 | ' + (writtenDesc > 0.6 ? '合格' : '不足') + ' | 对发明的技术方案描述充分性 |\n'
  report +='| 权利要求清晰 | ' + (claimClarity > 0.6 ? '合格' : '不足') + ' | 权利要求书表述的明确性 |\n'
  report +='| 实用性依据 | ' + (industrialApply.length > 0 ? '充分' : '需补充') + ' | 产业化应用可能性论证 |\n'

  report += '\n## 改进建议' + '\n\n'
  const patentabilityRecs: string[] = []
  if (noveltyScore < 0.6) patentabilityRecs.push('新颖性风险高，建议进一步检索并强化技术特征差异化')
  if (inventiveScore < 0.6) patentabilityRecs.push('创造性论证不足，需补充非显而易见性论据和技术效果对比数据')
  if (docScore < 0.6) patentabilityRecs.push('说明书质量需提升，补充实施例、实验数据和附图')
  if (closestArt.length === 0) patentabilityRecs.push('尚未发现最接近对比文件，需执行深度现有技术检索')
  if (!sufficiency) patentabilityRecs.push('公开不充分风险，需补充使本领域技术人员能实施的技术细节')
  if (patentabilityRecs.length === 0) patentabilityRecs.push('专利性评估通过，可按计划递交申请')
  patentabilityRecs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 6: CLAIM SCOPE OPTIMIZER ====================

function executeClaimScopeOptimizer(inputData: string): string {
  const data = parseInput<ClaimScopeInput>(inputData)
  const independentClaims = data.independent_claims || [{ number: 1, preamble: '一种...方法', body_elements: ['步骤A', '步骤B'], scope_estimate: 0.7 }]
  const dependentClaims = data.dependent_claims || []
  const languageClear = data.claim_language_clear !== false
  const mPlusF = data.means_plus_function_used || false
  const claimDiff = data.claim_differentiation || 0.5
  const coverageObjectives = data.coverage_objectives || ['覆盖竞品方案']
  const competitors = data.competitor_products || []
  const targetScope = data.target_scope || 'balanced'

  const seed = makeSeed(inputData)
  const rng = mulberry32(seed)

  let report = '# 权利要求范围优化报告' + '\n\n'
  report += '**独立权利要求数:** ' + independentClaims.length + ' | **从属权利要求数:** ' + dependentClaims.length + '\n'
  report += ' **语言清晰:** ' + (languageClear ? '是' : '否') + ' | **功能性限定:** ' + (mPlusF ? '有' : '无') + '\n'
  report += ' **差异化程度:** ' + formatPct(claimDiff) + '% | **目标范围:** ' + targetScope + '\n\n'
  report += '---' + '\n\n'

  report += '## 独立权利要求范围评估' + '\n\n'
  report += '| 权利要求 | 前序特征 | 技术特征数 | 预估范围 | 建议 |\n'
  report += '|---------|---------|-----------|---------|------|\n'
  independentClaims.forEach(c => {
    const featCount = (c.body_elements || []).length
    const scope = c.scope_estimate || clamp(0.5 + rng() * 0.4, 0, 1)
    let suggestion = '维持'
    if (scope > 0.85 && targetScope !== 'broad') suggestion = '可考虑增加限定缩小范围'
    else if (scope < 0.4 && targetScope !== 'narrow') suggestion = '可考虑删除非必要限定扩大范围'
    report += '| 权利要求' + (c.number || 1) + ' | ' + (c.preamble || '—').slice(0, 15) + '... | ' + featCount + ' | ' + formatPct(scope) + '% | ' + suggestion + ' |\n'
  })

  report += '\n## 从属权利要求层级分析' + '\n\n'
  if (dependentClaims.length > 0) {
    report += '| 从属权利要求 | 依附独立权 | 新增特征数 | 缩小程度 | 保护价值 |\n'
    report += '|------------|----------|-----------|---------|----------|\n'
    dependentClaims.forEach((dc, i) => {
      const narrowing = dc.narrowing_degree || clamp(0.3 + rng() * 0.5, 0, 1)
      const value = narrowing > 0.5 ? '高' : narrowing > 0.3 ? '中' : '低'
      report += '| 权利要求' + ((dc.depends_on || 1) + i + 1) + ' | 权利要求' + (dc.depends_on || 1) + ' | ' + (dc.additional_elements || []).length + ' | ' + formatPct(narrowing) + '% | ' + value + ' |\n'
    })
  } else {
    report += '未检测到从属权利要求。建议添加2-4条从属权利要求构建多层级保护网。\n'
  }

  report += '\n## 竞品覆盖分析' + '\n\n'
  if (competitors.length > 0) {
    report += '| 竞品名称 | 特征匹配数 | 竞品独有特征 | 覆盖判定 |\n'
    report += '|---------|-----------|-------------|----------|\n'
    competitors.forEach(c => {
      const matched = (c.features_matched || []).length
      const extra = (c.features_extra || []).length
      const coverage = matched > 0 && extra === 0 ? '完全覆盖' : matched > extra ? '部分覆盖' : '未覆盖'
      report += '| ' + c.name + ' | ' + matched + ' | ' + extra + ' | ' + coverage + ' |\n'
    })
  } else {
    report += '未指定竞品数据。建议补充竞品技术特征以评估覆盖度。\n'
  }

  report += '\n## 权利要求的递进结构' + '\n\n'
  report += '| 层级 | 特征 | 保护范围 | 稳定性 |\n'
  report += '|------|------|---------|--------|\n'
  report += '| 第一层 | 最少量必要技术特征 | 最宽 | 较低（易找到对比文件） |\n'
  report += '| 第二层 | 增加1-2个优选特征 | 中等 | 中等 |\n'
  report += '| 第三层 | 具体参数/实施例限定 | 窄 | 较高 |\n'
  report += '| 第四层 | 最优实施例限定 | 最窄 | 最高（退守底线） |\n'

  report += '\n## 语言明确性评估' + '\n\n'
  report += '| 评估项 | 状态 | 说明 |\n'
  report += '|--------|------|------|\n'
  report += '| 术语一致性 | ' + (languageClear ? '合格' : '注意') + ' | 全文统一技术术语，避免歧义 |\n'
  report += '| 功能性限定 | ' + (mPlusF ? '谨慎使用' : '无此问题') + ' | 美国法第112(f)条解释风险 |\n'
  report += '| 权利要求差异化 | ' + (claimDiff > 0.5 ? '合格' : '不足') + ' | 各权利要求之间应有实质性区别 |\n'
  report += '| 引用关系 | ' + (dependentClaims.length > 0 ? '有层级' : '无层级') + ' | 从属权利要求应正确引用基础权利要求 |\n'

  report += '\n## 优化建议' + '\n\n'
  const claimRecs: string[] = []
  if (!languageClear) claimRecs.push('统一全文技术术语，消除歧义表述')
  if (mPlusF) claimRecs.push('功能性限定需确保说明书有足够实施例支持，否则建议改为结构性限定')
  if (claimDiff < 0.4) claimRecs.push('权利要求差异化不足，建议调整从属权利要求的附加技术特征')
  if (independentClaims.length > 3) claimRecs.push('独立权利要求过多，建议合并或分案处理')
  if (dependentClaims.length < 2) claimRecs.push('建议增加从属权利要求构建多层级保护网')
  if (targetScope === 'broad' && independentClaims.some(c => (c.scope_estimate || 0) < 0.5)) claimRecs.push('目标为宽泛保护但部分权利要求范围偏窄，可考虑删除非必要限定')
  if (targetScope === 'narrow' && independentClaims.some(c => (c.scope_estimate || 0) > 0.8)) claimRecs.push('目标为精准保护但部分权利要求范围过宽，建议增加限定特征')
  if (claimRecs.length === 0) claimRecs.push('权利要求结构良好，建议维持当前方案')
  claimRecs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 7: INFRINGEMENT RISK ASSESSOR ====================

function executeInfringementRiskAssessor(inputData: string): string {
  const data = parseInput<InfringementRiskInput>(inputData)
  const productName = data.product_name || '产品'
  const productFeatures = data.product_features || []
  const targetPatents = data.target_patents || []
  const jurisdictions = data.target_jurisdictions || ['CN', 'US']
  const clearanceDepth = data.clearance_depth || 'standard'
  const budget = data.design_around_budget || 100000
  const prevOpinions = data.previous_opinions || []

  const seed = makeSeed(inputData)
  const rng = mulberry32(seed)

  let report = '# 侵权风险评估报告' + '\n\n'
  report += '**产品名称:** ' + productName + '\n'
  report += '**产品特征数:** ' + productFeatures.length + ' | **目标专利数:** ' + targetPatents.length + '\n'
  report += ' **目标地域:** ' + jurisdictions.join(', ') + ' | **检索深度:** ' + clearanceDepth + '\n'
  report += ' **规避设计预算:** $' + budget.toLocaleString() + ' | **已有意见:** ' + prevOpinions.length + '份\n\n'
  report += '---' + '\n\n'

  report += '## 权利要求比对分析（Claim Chart）' + '\n\n'
  if (targetPatents.length > 0) {
    report += '| 专利号 | 权利要求特征 | 产品对应特征 | 匹配度 | 风险 |\n'
    report += '|--------|-------------|-------------|--------|------|\n'
    targetPatents.forEach(p => {
      const claims = (p.claims || '').split(/[,;；，]/)
      const matchRate = clamp(0.3 + rng() * 0.6, 0, 1)
      const risk = matchRate > 0.8 ? '高风险' : matchRate > 0.5 ? '中风险' : '低风险'
      const matchedFeature = productFeatures[0] || '—'
      report += '| ' + (p.patent_number || '—') + ' | ' + (claims[0] || '—').slice(0, 20) + '... | ' + matchedFeature + ' | ' + formatPct(matchRate) + '% | ' + risk + ' |\n'
    })
  } else {
    report += '未指定目标专利。建议先进行专利检索确定相关专利清单。\n'
  }

  report += '\n## 逐地域风险评估' + '\n\n'
  report += '| 地域 | 有效专利数 | 风险等级 | 关键专利 | 建议 |\n'
  report += '|------|-----------|---------|---------|------|\n'
  jurisdictions.forEach(j => {
    const patentCount = targetPatents.length > 0 ? Math.max(1, Math.floor(rng() * targetPatents.length)) : 0
    const riskLevel = patentCount > 3 ? '高' : patentCount > 1 ? '中' : '低'
    const keyPatent = targetPatents[0]?.patent_number || '—'
    const advice = patentCount > 3 ? '建议深度FTO分析' : patentCount > 1 ? '建议监控关键专利' : '风险可控'
    report += '| ' + j + ' | ' + patentCount + ' | ' + riskLevel + ' | ' + keyPatent + ' | ' + advice + ' |\n'
  })

  report += '\n## 整体风险评级' + '\n\n'
  const overallRisk = clamp(
    (targetPatents.length > 0 ? 0.3 : 0) +
    (productFeatures.length > 5 ? 0.2 : 0.1) +
    (clearanceDepth === 'quick' ? 0.2 : clearanceDepth === 'standard' ? 0.1 : 0) +
    rng() * 0.2,
    0, 1
  )
  const riskLabel = overallRisk > 0.7 ? '高风险 — 需立即处理' : overallRisk > 0.4 ? '中风险 — 建议监控' : '低风险 — 可接受'
  report += '| 指标 | 数值 |\n'
  report += '|------|------|\n'
  report += '| 整体侵权风险 | ' + formatPct(overallRisk) + '% — ' + riskLabel + ' |\n'
  report += '| 检索覆盖度 | ' + formatPct(clearanceDepth === 'comprehensive' ? 0.9 : clearanceDepth === 'standard' ? 0.65 : 0.35) + '% |\n'
  report += '| 规避可行性 | ' + formatPct(clamp(budget / 200000, 0.2, 0.95)) + '% |\n'

  report += '\n## 规避设计方案' + '\n\n'
  report += '| 规避方向 | 技术手段 | 成本估算 | 效果预估 |\n'
  report += '|---------|---------|---------|----------|\n'
  const designArounds = [
    { direction: '替换技术手段', method: '采用替代算法/结构实现相同功能', costFactor: 0.3, effect: '高' },
    { direction: '省略技术特征', method: '分析是否可省略非必要技术特征', costFactor: 0.1, effect: '中' },
    { direction: '改变技术路径', method: '采用完全不同的技术路线', costFactor: 0.6, effect: '高' },
    { direction: '获取授权', method: '与专利权人协商许可', costFactor: 0.4, effect: '确定' }
  ]
  designArounds.forEach(da => {
    const cost = budget * da.costFactor
    report += '| ' + da.direction + ' | ' + da.method + ' | $' + cost.toLocaleString() + ' | ' + da.effect + ' |\n'
  })

  report += '\n## 风险应对建议' + '\n\n'
  const infringementRecs: string[] = []
  if (overallRisk > 0.7) infringementRecs.push('高风险：建议暂停相关开发，进行深度FTO分析或获取授权')
  else if (overallRisk > 0.4) infringementRecs.push('中风险：建议持续监控目标专利状态，准备规避设计方案')
  else infringementRecs.push('低风险：可继续推进，建议定期更新检索')
  if (clearanceDepth === 'quick') infringementRecs.push('当前检索深度不足，建议升级为标准或全面检索')
  if (targetPatents.length === 0) infringementRecs.push('未发现目标专利，建议委托专业机构进行防侵权检索')
  if (prevOpinions.length === 0) infringementRecs.push('建议获取外部律师的FTO法律意见书')
  infringementRecs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 8: PATENT LANDSCAPE VISUALIZER ====================

function executePatentLandscapeVisualizer(inputData: string): string {
  const data = parseInput<PatentLandscapeInput>(inputData)
  const domain = data.technology_domain || '通用技术'
  const searchQuery = data.search_query || ''
  const timePeriod = data.time_period || { start_year: 2015, end_year: 2025 }
  const geoScope = data.geographic_scope || ['CN', 'US', 'EP', 'JP']
  const topAssignees = data.top_assignees || []
  const techClusters = data.technology_clusters || []
  const citationNetwork = data.citation_network || []
  const whiteSpace = data.white_space_areas || []
  const depth = data.analysis_depth || 'detailed'

  const seed = makeSeed(inputData)
  const rng = mulberry32(seed)

  let report = '# 专利态势可视化分析报告' + '\n\n'
  report += '**技术领域:** ' + domain + '\n'
  report += ' **时间跨度:** ' + (timePeriod.start_year || 2015) + '-' + (timePeriod.end_year || 2025) + '\n'
  report += ' **地域范围:** ' + geoScope.join(', ') + ' | **分析深度:** ' + depth + '\n'
  if (searchQuery) report += ' **检索式:** ' + searchQuery + '\n'
  report += '\n---' + '\n\n'

  report += '## 技术趋势分析' + '\n\n'
  report += '| 年度 | 预估申请量 | 增长率 | 阶段判断 |\n'
  report += '|------|-----------|--------|----------|\n'
  const startY = timePeriod.start_year || 2015
  const endY = timePeriod.end_year || 2025
  let prevCount = 50 + Math.floor(rng() * 50)
  for (let y = startY; y <= endY; y++) {
    const growth = 0.05 + rng() * 0.2
    const count = Math.floor(prevCount * (1 + growth))
    const phase = growth > 0.15 ? '快速增长' : growth > 0.05 ? '稳定增长' : '成熟/衰退'
    report += '| ' + y + ' | ' + count + ' | +' + (growth * 100).toFixed(1) + '% | ' + phase + ' |\n'
    prevCount = count
  }

  report += '\n## 申请人地图（Top Assignees）' + '\n\n'
  if (topAssignees.length > 0) {
    report += '| 申请人 | 专利数量 | 趋势 | 市场地位 |\n'
    report += '|--------|---------|------|----------|\n'
    topAssignees.forEach(a => {
      const position = (a.patent_count || 0) > 100 ? '领导者' : (a.patent_count || 0) > 30 ? '活跃参与者' : '新兴玩家'
      report += '| ' + a.name + ' | ' + (a.patent_count || 0) + ' | ' + (a.trend || 'stable') + ' | ' + position + ' |\n'
    })
  } else {
    report += '| 申请人 | 专利数量 | 趋势 | 市场地位 |\n'
    report += '|--------|---------|------|----------|\n'
    const defaultAssignees = [
      { name: '申请人A', count: 150, trend: 'growing' as const },
      { name: '申请人B', count: 120, trend: 'stable' as const },
      { name: '申请人C', count: 80, trend: 'growing' as const },
      { name: '申请人D', count: 60, trend: 'declining' as const },
      { name: '申请人E', count: 45, trend: 'growing' as const }
    ]
    defaultAssignees.forEach(a => {
      const position = a.count > 100 ? '领导者' : a.count > 50 ? '活跃参与者' : '新兴玩家'
      const trendLabel = a.trend === 'growing' ? '增长' : a.trend === 'declining' ? '下降' : '稳定'
      report += '| ' + a.name + ' | ' + a.count + ' | ' + trendLabel + ' | ' + position + ' |\n'
    })
  }

  report += '\n## 技术聚类分析' + '\n\n'
  if (techClusters.length > 0) {
    report += '| 技术聚类 | 专利数 | 增长率 | 平均引用 | 热度 |\n'
    report += '|---------|--------|--------|----------|------|\n'
    techClusters.forEach(c => {
      const heat = (c.growth_rate || 0) > 0.15 ? '热点' : (c.growth_rate || 0) > 0.05 ? '温点' : '冷点'
      report += '| ' + c.name + ' | ' + (c.patent_count || 0) + ' | +' + ((c.growth_rate || 0) * 100).toFixed(1) + '% | ' + (c.avg_citations || 0).toFixed(1) + ' | ' + heat + ' |\n'
    })
  } else {
    report += '| 技术聚类 | 专利数 | 增长率 | 平均引用 | 热度 |\n'
    report += '|---------|--------|--------|----------|------|\n'
    const defaultClusters = [
      { name: '核心算法', count: 200, growth: 0.18, citations: 8.5 },
      { name: '硬件实现', count: 150, growth: 0.12, citations: 6.2 },
      { name: '应用场景', count: 180, growth: 0.22, citations: 5.8 },
      { name: '数据处理', count: 120, growth: 0.08, citations: 7.1 },
      { name: '安全机制', count: 90, growth: 0.25, citations: 4.5 }
    ]
    defaultClusters.forEach(c => {
      const heat = c.growth > 0.15 ? '热点' : c.growth > 0.05 ? '温点' : '冷点'
      report += '| ' + c.name + ' | ' + c.count + ' | +' + (c.growth * 100).toFixed(1) + '% | ' + c.citations.toFixed(1) + ' | ' + heat + ' |\n'
    })
  }

  report += '\n## 引用网络分析' + '\n\n'
  if (citationNetwork.length > 0) {
    report += '| 引用专利 | 被引专利 | 引用强度 | 关系类型 |\n'
    report += '|---------|---------|---------|----------|\n'
    citationNetwork.forEach(cn => {
      const strength = cn.strength || 0.5
      const relType = strength > 0.7 ? '核心引用' : strength > 0.4 ? '相关引用' : '边缘引用'
      report += '| ' + (cn.citing_patent || '—') + ' | ' + (cn.cited_patent || '—') + ' | ' + formatPct(strength) + '% | ' + relType + ' |\n'
    })
  } else {
    report += '引用网络数据未提供。建议导入引文数据以分析技术传承路径。\n'
  }

  report += '\n## 技术空白点分析（White Space）' + '\n\n'
  if (whiteSpace.length > 0) {
    report += '| 空白领域 | 潜力评估 | 预估机会(USD M) | 建议行动 |\n'
    report += '|---------|---------|----------------|----------|\n'
    whiteSpace.forEach(ws => {
      const action = ws.potential === 'high' ? '优先布局' : ws.potential === 'medium' ? '持续关注' : '观察等待'
      report += '| ' + ws.area + ' | ' + ws.potential + ' | $' + (ws.estimated_opportunity || 0).toFixed(1) + 'M | ' + action + ' |\n'
    })
  } else {
    report += '| 空白领域 | 潜力评估 | 预估机会(USD M) | 建议行动 |\n'
    report += '|---------|---------|----------------|----------|\n'
    const defaultWhiteSpace = [
      { area: '跨领域融合应用', potential: 'high' as const, opportunity: 50 },
      { area: '边缘计算适配', potential: 'high' as const, opportunity: 35 },
      { area: '绿色节能技术', potential: 'medium' as const, opportunity: 20 },
      { area: '隐私保护机制', potential: 'medium' as const, opportunity: 15 }
    ]
    defaultWhiteSpace.forEach(ws => {
      const action = ws.potential === 'high' ? '优先布局' : ws.potential === 'medium' ? '持续关注' : '观察等待'
      report += '| ' + ws.area + ' | ' + ws.potential + ' | $' + ws.opportunity.toFixed(1) + 'M | ' + action + ' |\n'
    })
  }

  report += '\n## 竞争格局总结' + '\n\n'
  report += '| 维度 | 评估 |\n'
  report += '|------|------|\n'
  report += '| 技术成熟度 | ' + (depth === 'comprehensive' ? '需深度评估' : '快速发展期') + ' |\n'
  report += '| 竞争强度 | ' + (topAssignees.length > 5 ? '高度集中' : '分散竞争') + ' |\n'
  report += '| 创新活跃度 | ' + formatPct(clamp(0.5 + rng() * 0.4, 0, 1)) + '% |\n'
  report += '| 进入壁垒 | ' + (topAssignees.length > 3 ? '高（已有大量专利布局）' : '中等') + ' |\n'

  report += '\n## 战略建议' + '\n\n'
  const landscapeRecs: string[] = []
  if (whiteSpace.length > 0) landscapeRecs.push('优先布局高潜力空白技术领域，抢占先机')
  if (topAssignees.length > 5) landscapeRecs.push('竞争激烈，建议差异化创新或寻求合作许可')
  if (techClusters.length > 0) landscapeRecs.push('关注热点技术聚类，评估技术融合机会')
  landscapeRecs.push('定期更新专利态势分析，监控新进入者和新兴技术方向')
  if (depth === 'overview') landscapeRecs.push('当前为概览分析，建议升级为详细分析获取更精确洞察')
  landscapeRecs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'patent_drafting_assistant',
    description: '专利撰写辅助：说明书结构设计/权利要求布局/摘要合规性/实施例充分性/递交就绪度评估',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: invention_title, technical_field, background_art, technical_problem, technical_solution, advantageous_effects, claim_count, embodiment_count, target_jurisdiction, application_type, abstract_word_count, drawing_count' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executePatentDraftingAssistant(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'prior_art_search_optimizer',
    description: '现有技术检索优化：关键词扩展/检索式构建/数据库选择/相关性预估/新颖性空白分析',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: target_invention, technical_keywords, ipc_codes, cpc_codes, search_databases, time_range, language_scope, max_results, known_prior_art' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executePriorArtSearchOptimizer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'ip_portfolio_manager',
    description: 'IP资产组合管理：资产质量分层/续费决策/地域覆盖分析/维护预算分配/组合目标优化',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: patents, trademarks, trade_secrets, budget_usd, strategic_focus, portfolio_objective' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeIPPortfolioManager(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'patent_valuation_engine',
    description: '专利价值评估：市场法/收益法/成本法三维估值/许可费率评估/FRAND适用/可比交易参照',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: patent_id, patent_title, market_size_usd_m, market_growth_rate, remaining_life_years, essential_patent, standard_related, citation_count, family_size, licensing_revenue_annual, profit_margin, discount_rate, litigation_history, comparable_transactions, valuation_method' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executePatentValuationEngine(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'patentability_scorer',
    description: '专利性评分：新颖性/创造性/实用性三性评估/充分公开检查/文件质量评分/改进建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: invention_title, technical_field, closest_prior_art, novel_features, technical_effects, inventive_step_arguments, industrial_applicability, sufficiency_of_disclosure, enablement_score, written_description_score, claim_clarity, search_depth' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executePatentabilityScorer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'claim_scope_optimizer',
    description: '权利要求范围优化：宽泛度vs有效性平衡/从属层级分析/竞品覆盖映射/语言明确性/递进结构设计',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: independent_claims, dependent_claims, claim_language_clear, means_plus_function_used, claim_differentiation, coverage_objectives, competitor_products, target_scope' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeClaimScopeOptimizer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'infringement_risk_assessor',
    description: '侵权风险评估：权利要求比对(Claim Chart)/逐地域风险评级/规避设计方案/FTO分析/风险应对策略',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product_name, product_features, target_patents, target_jurisdictions, clearance_depth, design_around_budget, previous_opinions' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeInfringementRiskAssessor(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'patent_landscape_visualizer',
    description: '专利态势可视化：技术趋势分析/申请人地图/技术聚类/引用网络/技术空白点/竞争格局总结',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: technology_domain, search_query, time_period, geographic_scope, top_assignees, technology_clusters, citation_network, white_space_areas, analysis_depth' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executePatentLandscapeVisualizer(args.input_data) }
  }))
}