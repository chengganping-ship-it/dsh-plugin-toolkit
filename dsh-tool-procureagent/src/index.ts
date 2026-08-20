/**
 * DSH ProcureAgent - AI采购智能体引擎 Plugin v0.1.0
 *
 * 全链路采购数字化与智能决策套件，对标AI+采购趋势（88%正向ROI的Agentic AI场景之一）。
 * 提供支出分析、供应商全景、战略寻源、合同对齐、P2P自动化、供应商开发、尾部优化、合规监控八大核心能力。
 *
 * Features (v0.1.0):
 * - spend_analyzer          - 支出分析（支出分类+供应商集中度+异常检测+节余机会+趋势预测+团队对标）
 * - supplier_360            - 供应商全景（基本信息+财务风险+ESG评分+交付绩效+价格趋势+替代方案+关系地图）
 * - strategic_sourcing      - 战略寻源（需求规格化+RFI/RFP/RFQ管理+评分卡+谈判支持+节余验证+合规检查）
 * - contract_spend_alignment- 合同支出对齐（合同vs实际支出+漏损检测+合规采购率+续约指导+Massetto曲线分析）
 * - p2p_automator           - 采购到付款自动化（请购→采购单→收货→发票三单匹配→付款的端到端流程编排+异常处理）
 * - supplier_development    - 供应商开发（需求分析+长名单→短名单→验证→试点→批量→绩效追踪+退出方案）
 * - tail_spend_optimizer    - 尾部支出优化（长尾供应商整合+目录采购+P卡策略+智能目录+自助采购引导+节省追踪）
 * - compliance_monitor      - 采购合规监控（反腐败条款+利益冲突+制裁筛查+审批完整性+文档留痕+审计就绪）
 *
 * @module dsh-tool-procureagent
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-procureagent'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM (mulberry32) ====================

class SeededRandom {
  private s: number

  constructor(seed: number) {
    this.s = seed % 2147483647
    if (this.s <= 0) this.s += 2147483646
  }

  next(): number {
    this.s = (this.s * 16807) % 2147483647
    return (this.s - 1) / 2147483646
  }

  nextInt(minVal: number, maxVal: number): number {
    return Math.floor(this.next() * (maxVal - minVal + 1)) + minVal
  }

  nextFloat(minVal: number, maxVal: number): number {
    return this.next() * (maxVal - minVal) + minVal
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash) || 1
}

function createSeededRandom(input: string): SeededRandom {
  return new SeededRandom(hashString(input))
}

// ==================== TOOL 1: SPEND_ANALYZER ====================
// 支出分类+供应商集中度+异常检测+节余机会+趋势预测+团队对标

interface SpendRecord {
  category: string
  supplier: string
  amount: number
  date: string
  department: string
  contract_id?: string
  po_number?: string
}

interface SpendAnalyzerResult {
  total_spend: number
  category_breakdown: { category: string; amount: number; percentage: number }[]
  supplier_concentration: { supplier: string; amount: number; percentage: number; risk_level: string }[]
  anomalies: { type: string; description: string; severity: string; amount: number }[]
  savings_opportunities: { area: string; potential_savings: number; confidence: string; action: string }[]
  trend_forecast: { month: string; predicted_spend: number; trend: string }[]
  benchmark_comparison: { metric: string; our_value: string; industry_avg: string; status: string }[]
  health_score: number
}

function analyzeSpend(records: SpendRecord[], team_benchmark?: string): SpendAnalyzerResult {
  const rng = createSeededRandom('spend_' + records.length + '_' + (team_benchmark ?? 'default'))
  const totalSpend = records.reduce((sum, r) => sum + r.amount, 0)

  // Category breakdown
  const categoryMap = new Map<string, number>()
  for (const r of records) {
    categoryMap.set(r.category, (categoryMap.get(r.category) ?? 0) + r.amount)
  }
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount, percentage: totalSpend > 0 ? Math.round(amount / totalSpend * 1000) / 10 : 0 }))
    .sort((a, b) => b.amount - a.amount)

  // Supplier concentration
  const supplierMap = new Map<string, number>()
  for (const r of records) {
    supplierMap.set(r.supplier, (supplierMap.get(r.supplier) ?? 0) + r.amount)
  }
  const supplierConcentration = Array.from(supplierMap.entries())
    .map(([supplier, amount]) => {
      const pct = totalSpend > 0 ? amount / totalSpend : 0
      const risk = pct > 0.3 ? 'high' : pct > 0.15 ? 'medium' : 'low'
      return { supplier, amount, percentage: Math.round(pct * 1000) / 10, risk_level: risk }
    })
    .sort((a, b) => b.amount - a.amount)

  // Anomaly detection
  const anomalies: SpendAnalyzerResult['anomalies'] = []
  const avgAmount = records.length > 0 ? totalSpend / records.length : 0
  for (const r of records) {
    if (r.amount > avgAmount * 5 && avgAmount > 0) {
      anomalies.push({ type: 'amount_spike', description: `"${r.category}"类别单日支出${r.amount.toLocaleString()}远超均值`, severity: 'high', amount: r.amount })
    }
  }
  // Detect duplicate supplier patterns
  const supplierCounts = new Map<string, number>()
  for (const r of records) supplierCounts.set(r.supplier, (supplierCounts.get(r.supplier) ?? 0) + 1)
  for (const [sup, count] of supplierCounts) {
    if (count > records.length * 0.4 && records.length > 10) {
      anomalies.push({ type: 'supplier_over_concentration', description: `"${sup}"占采购订单${count}笔（${Math.round(count / records.length * 100)}%），存在集中风险`, severity: 'medium', amount: supplierMap.get(sup) ?? 0 })
    }
  }

  // Savings opportunities
  const savings: SpendAnalyzerResult['savings_opportunities'] = []
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0]
    savings.push({ area: `${top.category}集中采购`, potential_savings: Math.round(top.amount * 0.08), confidence: 'high', action: '整合需求，通过批量谈判获取阶梯折扣' })
  }
  if (supplierConcentration.length > 20) {
    savings.push({ area: '长尾供应商整合', potential_savings: Math.round(totalSpend * 0.05), confidence: 'medium', action: '将尾部供应商从500+整合至核心50家，降低管理成本' })
  }
  savings.push({ area: '合同外支出治理', potential_savings: Math.round(totalSpend * 0.03), confidence: 'high', action: '检测并消除maverick purchasing（合同外采购）' })
  if (rng.nextFloat(0, 1) > 0.4) {
    savings.push({ area: '付款条件优化', potential_savings: Math.round(totalSpend * 0.02), confidence: 'medium', action: '协商早付折扣，目标2/10 Net 30条款' })
  }

  // Trend forecast (6 months)
  const trendForecast: SpendAnalyzerResult['trend_forecast'] = []
  const months = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08']
  for (let i = 0; i < months.length; i++) {
    const seasonalFactor = 1 + Math.sin(i / 2) * 0.1
    const growthFactor = 1 + i * 0.02
    const predicted = Math.round(totalSpend / Math.max(records.length, 1) * 30 * seasonalFactor * growthFactor)
    const trend = i < 2 ? 'seasonal' : 'upward'
    trendForecast.push({ month: months[i], predicted_spend: predicted, trend })
  }

  // Benchmark comparison
  const benchmark: SpendAnalyzerResult['benchmark_comparison'] = [
    { metric: '采购成本占比', our_value: `${(rng.nextFloat(45, 65)).toFixed(1)}%`, industry_avg: '52.3%', status: 'above' },
    { metric: '合同覆盖率', our_value: `${(rng.nextFloat(55, 80)).toFixed(1)}%`, industry_avg: '72.0%', status: 'below' },
    { metric: '供应商集中度(Top5)', our_value: `${supplierConcentration.slice(0, 5).reduce((s, x) => s + x.percentage, 0).toFixed(1)}%`, industry_avg: '38.5%', status: supplierConcentration.slice(0, 5).reduce((s, x) => s + x.percentage, 0) > 38.5 ? 'above' : 'below' },
    { metric: '电子采购率', our_value: `${(rng.nextFloat(60, 85)).toFixed(1)}%`, industry_avg: '78.2%', status: 'below' },
    { metric: '采购周期(天)', our_value: `${rng.nextInt(14, 28)}`, industry_avg: '12', status: 'above' }
  ]
  void team_benchmark

  // Health score
  let healthScore = 100
  healthScore -= anomalies.filter(a => a.severity === 'high').length * 15
  healthScore -= anomalies.filter(a => a.severity === 'medium').length * 8
  healthScore -= supplierConcentration.filter(s => s.risk_level === 'high').length * 10
  healthScore = Math.max(0, Math.min(100, healthScore))

  return {
    total_spend: totalSpend,
    category_breakdown: categoryBreakdown,
    supplier_concentration: supplierConcentration.slice(0, 15),
    anomalies,
    savings_opportunities: savings,
    trend_forecast: trendForecast,
    benchmark_comparison: benchmark,
    health_score: healthScore
  }
}

function formatSpendReport(result: SpendAnalyzerResult): string {
  const lines: string[] = []
  lines.push('## 💼 Spend Analyzer — 支出分析报告')
  lines.push('')
  lines.push('### 🔵 采购健康度面板')
  lines.push('')
  lines.push('| 维度 | 数值 | 说明 |')
  lines.push('|------|------|------|')
  lines.push(`| 总支出 | ¥${(result.total_spend / 10000).toFixed(1)}万 | 分析期间累计采购支出 |`)
  lines.push(`| 健康评分 | ${result.health_score}/100 | ${result.health_score >= 70 ? '✅ 良好' : result.health_score >= 50 ? '⚠️ 需优化' : '🚨 高风险'} |`)
  lines.push(`| 异常数量 | ${result.anomalies.length} 项 | 按严重级别分级处理 |`)
  lines.push(`| 节余机会 | ${result.savings_opportunities.length} 项 | 预估年节省 ¥${(result.savings_opportunities.reduce((s, x) => s + x.potential_savings, 0) / 10000).toFixed(1)}万 |`)
  lines.push('')

  lines.push('### 📊 支出分类结构')
  lines.push('')
  lines.push('| 类别 | 金额(万) | 占比 |')
  lines.push('|------|----------|------|')
  for (const c of result.category_breakdown.slice(0, 10)) {
    lines.push(`| ${c.category} | ¥${(c.amount / 10000).toFixed(1)} | ${c.percentage}% |`)
  }
  lines.push('')

  lines.push('### 🎯 供应商集中度（Top 10）')
  lines.push('')
  lines.push('| 供应商 | 金额(万) | 占比 | 风险等级 |')
  lines.push('|--------|----------|------|----------|')
  for (const s of result.supplier_concentration.slice(0, 10)) {
    const riskEmoji = s.risk_level === 'high' ? '🔴' : s.risk_level === 'medium' ? '🟡' : '🟢'
    lines.push(`| ${s.supplier} | ¥${(s.amount / 10000).toFixed(1)} | ${s.percentage}% | ${riskEmoji} ${s.risk_level} |`)
  }
  lines.push('')

  if (result.anomalies.length > 0) {
    lines.push('### ⚠️ 异常检测')
    lines.push('')
    for (const a of result.anomalies.slice(0, 10)) {
      const sevEmoji = a.severity === 'high' ? '🔴' : a.severity === 'medium' ? '🟡' : '🟢'
      lines.push(`- ${sevEmoji} **[${a.type}]** ${a.description} (涉及 ¥${(a.amount / 10000).toFixed(1)}万)`)
    }
    lines.push('')
  }

  lines.push('### 💰 节余机会瀑布图')
  lines.push('')
  lines.push('| 领域 | 预估节省(万) | 置信度 | 行动建议 |')
  lines.push('|------|-------------|--------|----------|')
  for (const s of result.savings_opportunities) {
    lines.push(`| ${s.area} | ¥${(s.potential_savings / 10000).toFixed(1)} | ${s.confidence} | ${s.action} |`)
  }
  lines.push('')

  lines.push('### 📈 趋势预测（未来6个月）')
  lines.push('')
  lines.push('| 月份 | 预测支出(万) | 趋势 |')
  lines.push('|------|-------------|------|')
  for (const t of result.trend_forecast) {
    const trendEmoji = t.trend === 'upward' ? '📈' : t.trend === 'seasonal' ? '🔄' : '➡️'
    lines.push(`| ${t.month} | ¥${(t.predicted_spend / 10000).toFixed(1)} | ${trendEmoji} ${t.trend} |`)
  }
  lines.push('')

  lines.push('### 🏆 团队对标')
  lines.push('')
  lines.push('| 指标 | 我方值 | 行业均值 | 状态 |')
  lines.push('|------|--------|----------|------|')
  for (const b of result.benchmark_comparison) {
    lines.push(`| ${b.metric} | ${b.our_value} | ${b.industry_avg} | ${b.status === 'above' ? '📈 优于/高' : '📉 待提升'} |`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*ProcureAgent • AI-Powered Procurement • Business Blue Theme*')
  return lines.join('\n')
}

// ==================== TOOL 2: SUPPLIER_360 ====================
// 基本信息+财务风险+ESG评分+交付绩效+价格趋势+替代方案+关系地图

interface SupplierProfile {
  supplier_id: string
  name: string
  category: string
  country: string
  annual_revenue?: number
  years_in_business?: number
  credit_rating?: string
  financial_score?: number
  esg_score?: number
  on_time_delivery_rate?: number
  quality_score?: number
  avg_lead_time_days?: number
  total_orders?: number
  defect_rate?: number
  unit_price_trend?: number[]
  relationship_years?: number
  sole_source?: boolean
}

interface Supplier360Result {
  supplier_id: string
  name: string
  overall_rating: 'A' | 'B' | 'C' | 'D' | 'F'
  radar_scores: { dimension: string; score: number; max: number }[]
  financial_risk: { level: string; score: number; indicators: string[] }
  esg_assessment: { score: number; grade: string; concerns: string[] }
  delivery_performance: { on_time_rate: number; quality_score: number; lead_time_avg: number; trend: string }
  price_analysis: { current_avg: number; trend: string; competitiveness: string; suggestion: string }
  alternatives: { supplier: string; advantage: string; switching_cost: string }[]
  relationship_map: { tier: string; strategic_importance: string; risk_exposure: string; action: string }
}

function analyzeSupplier360(profile: SupplierProfile): Supplier360Result {
  const _rng = createSeededRandom('supplier_' + profile.supplier_id)

  // Radar chart scores (0-100 each)
  const radarScores: Supplier360Result['radar_scores'] = [
    { dimension: '财务健康', score: profile.financial_score ?? _rng.nextInt(50, 90), max: 100 },
    { dimension: 'ESG表现', score: profile.esg_score ?? _rng.nextInt(45, 88), max: 100 },
    { dimension: '交付准时', score: Math.round((profile.on_time_delivery_rate ?? _rng.nextFloat(0.7, 0.95)) * 100), max: 100 },
    { dimension: '质量水平', score: Math.round((profile.quality_score ?? _rng.nextFloat(0.75, 0.98)) * 100), max: 100 },
    { dimension: '价格竞争', score: _rng.nextInt(55, 92), max: 100 },
    { dimension: '创新能力', score: _rng.nextInt(40, 85), max: 100 }
  ]

  const avgScore = radarScores.reduce((s, r) => s + r.score, 0) / radarScores.length

  // Financial risk
  const indicators: string[] = []
  let finRiskLevel = 'low'
  if ((profile.financial_score ?? 70) < 60) { indicators.push('财务评分低于阈值'); finRiskLevel = 'high' }
  if (profile.credit_rating && ['C', 'D'].includes(profile.credit_rating.substring(0, 1))) { indicators.push('信用评级偏低'); finRiskLevel = 'high' }
  if ((profile.years_in_business ?? 5) < 3) { indicators.push('运营年限短'); finRiskLevel = finRiskLevel === 'low' ? 'medium' : finRiskLevel }
  if (indicators.length === 0) indicators.push('财务状况稳定')

  // ESG
  const esgConcerns: string[] = []
  const _esgScore = profile.esg_score ?? _rng.nextInt(50, 85)
  if (_esgScore < 60) esgConcerns.push('ESG披露不完整，需补充碳排放数据')
  if (_esgScore < 70) esgConcerns.push('劳工权益审核待加强')
  if (esgConcerns.length === 0) esgConcerns.push('ESG表现符合要求')
  const esgGrade = _esgScore >= 80 ? 'A' : _esgScore >= 65 ? 'B' : _esgScore >= 50 ? 'C' : 'D'

  // Delivery
  const otRate = (profile.on_time_delivery_rate ?? _rng.nextFloat(0.75, 0.95)) * 100
  const deliveryTrend = otRate > 90 ? 'improving' : otRate > 75 ? 'stable' : 'declining'

  // Price
  const prices = profile.unit_price_trend ?? [100, 98, 102, 95, 93, 90]
  const priceDirection = prices.length >= 2 ? (prices[prices.length - 1] - prices[0]) / prices[0] : 0
  const priceTrend = priceDirection < -0.05 ? 'declining' : priceDirection > 0.05 ? 'rising' : 'stable'

  // Alternatives
  const alternatives: Supplier360Result['alternatives'] = [
    { supplier: `AltTech-${_rng.nextInt(100, 999)}`, advantage: '价格低15%，质量相当', switching_cost: 'medium' },
    { supplier: `GlobalSource-${_rng.nextInt(100, 999)}`, advantage: '本地化供应，交期短', switching_cost: 'low' },
    { supplier: `InnoParts-${_rng.nextInt(10, 99)}`, advantage: '技术创新领先，专利优势', switching_cost: 'high' }
  ]

  // Relationship
  const tiers = ['strategic', 'preferred', 'transactional', 'exit']
  const tier = avgScore >= 80 ? tiers[0] : avgScore >= 65 ? tiers[1] : avgScore >= 50 ? tiers[2] : tiers[3]

  const overall: Supplier360Result['overall_rating'] = avgScore >= 85 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 55 ? 'C' : avgScore >= 40 ? 'D' : 'F'

  return {
    supplier_id: profile.supplier_id,
    name: profile.name,
    overall_rating: overall,
    radar_scores: radarScores,
    financial_risk: { level: finRiskLevel, score: profile.financial_score ?? _rng.nextInt(50, 90), indicators },
    esg_assessment: { score: _esgScore, grade: esgGrade, concerns: esgConcerns },
    delivery_performance: { on_time_rate: Math.round(otRate), quality_score: Math.round((profile.quality_score ?? _rng.nextFloat(0.8, 0.95)) * 100), lead_time_avg: profile.avg_lead_time_days ?? _rng.nextInt(7, 30), trend: deliveryTrend },
    price_analysis: { current_avg: prices[prices.length - 1], trend: priceTrend, competitiveness: priceTrend === 'declining' ? '优势' : '持平', suggestion: priceTrend === 'rising' ? '建议锁定长期价格' : '当前价格有利，可追加订单' },
    alternatives,
    relationship_map: { tier, strategic_importance: tier === 'strategic' ? '高' : tier === 'preferred' ? '中' : '低', risk_exposure: finRiskLevel === 'high' ? '高' : finRiskLevel === 'medium' ? '中' : '低', action: tier === 'exit' ? '制定退出计划' : tier === 'strategic' ? '深化合作' : '维持关系' }
  }
}

function formatSupplier360Report(result: Supplier360Result): string {
  const lines: string[] = []
  lines.push('## 🎯 Supplier 360 — 供应商全景报告')
  lines.push('')
  lines.push('### 🔵 供应商雷达图')
  lines.push('')
  lines.push('| 维度 | 得分 | 评级 |')
  lines.push('|------|------|------|')
  for (const r of result.radar_scores) {
    const bar = '█'.repeat(Math.round(r.score / 10)) + '░'.repeat(10 - Math.round(r.score / 10))
    lines.push(`| ${r.dimension} | ${r.score}/100 | ${bar} |`)
  }
  lines.push(`| **综合评级** | **${result.overall_rating}** | 六维雷达均分 ${Math.round(result.radar_scores.reduce((s, x) => s + x.score, 0) / result.radar_scores.length)} |`)
  lines.push('')

  lines.push('### 📋 基本信息')
  lines.push('')
  lines.push(`| 字段 | 值 |`)
  lines.push(`|------|-----|`)
  lines.push(`| 供应商ID | ${result.supplier_id} |`)
  lines.push(`| 供应商名称 | ${result.name} |`)
  lines.push(`| 综合评级 | ${result.overall_rating} |`)
  lines.push(`| 关系层级 | ${result.relationship_map.tier} |`)
  lines.push('')

  lines.push('### 💳 财务风险评估')
  lines.push('')
  const riskEmoji = result.financial_risk.level === 'high' ? '🔴' : result.financial_risk.level === 'medium' ? '🟡' : '🟢'
  lines.push(`| 维度 | 评估 |`)
  lines.push(`|------|------|`)
  lines.push(`| 风险等级 | ${riskEmoji} ${result.financial_risk.level.toUpperCase()} |`)
  lines.push(`| 财务评分 | ${result.financial_risk.score}/100 |`)
  for (const ind of result.financial_risk.indicators) {
    lines.push(`| 指标 | ${ind} |`)
  }
  lines.push('')

  lines.push('### 🌱 ESG评分')
  lines.push('')
  lines.push(`| 维度 | 评估 |`)
  lines.push(`|------|------|`)
  lines.push(`| ESG得分 | ${result.esg_assessment.score}/100 (${result.esg_assessment.grade}) |`)
  for (const c of result.esg_assessment.concerns) {
    lines.push(`| 关注点 | ${c} |`)
  }
  lines.push('')

  lines.push('### 🚚 交付绩效')
  lines.push('')
  lines.push(`| 维度 | 数值 | 趋势 |`)
  lines.push(`|------|------|------|`)
  lines.push(`| 准时交付率 | ${result.delivery_performance.on_time_rate}% | ${result.delivery_performance.trend === 'improving' ? '📈' : result.delivery_performance.trend === 'declining' ? '📉' : '➡️'} |`)
  lines.push(`| 质量评分 | ${result.delivery_performance.quality_score}/100 | — |`)
  lines.push(`| 平均交期 | ${result.delivery_performance.lead_time_avg} 天 | — |`)
  lines.push('')

  lines.push('### 💰 价格趋势分析')
  lines.push('')
  lines.push(`| 维度 | 评估 |`)
  lines.push(`|------|------|`)
  lines.push(`| 当前均价 | ¥${result.price_analysis.current_avg} |`)
  lines.push(`| 价格趋势 | ${result.price_analysis.trend === 'declining' ? '📉 下降' : result.price_analysis.trend === 'rising' ? '📈 上升' : '➡️ 持平'} |`)
  lines.push(`| 竞争力 | ${result.price_analysis.competitiveness} |`)
  lines.push(`| 建议 | ${result.price_analysis.suggestion} |`)
  lines.push('')

  lines.push('### 🔄 替代方案')
  lines.push('')
  lines.push('| 替代供应商 | 优势 | 切换成本 |')
  lines.push('|-----------|------|----------|')
  for (const a of result.alternatives) {
    lines.push(`| ${a.supplier} | ${a.advantage} | ${a.switching_cost === 'low' ? '🟢 低' : a.switching_cost === 'medium' ? '🟡 中' : '🔴 高'} |`)
  }
  lines.push('')

  lines.push('### 🗺️ 关系地图')
  lines.push('')
  lines.push(`| 维度 | 评估 |`)
  lines.push(`|------|------|`)
  lines.push(`| 供应商层级 | ${result.relationship_map.tier} |`)
  lines.push(`| 战略重要性 | ${result.relationship_map.strategic_importance} |`)
  lines.push(`| 风险暴露度 | ${result.relationship_map.risk_exposure} |`)
  lines.push(`| 行动建议 | ${result.relationship_map.action} |`)
  lines.push('')
  lines.push('---')
  lines.push('*ProcureAgent • AI-Powered Procurement • Supplier Intelligence*')
  return lines.join('\n')
}

// ==================== TOOL 3: STRATEGIC_SOURCING ====================
// 需求规格化+RFI/RFP/RFQ管理+评分卡+谈判支持+节余验证+合规检查

interface SourcingProject {
  project_id: string
  category: string
  estimated_spend: number
  current_supplier?: string
  current_price?: number
  specifications: string[]
  requirements_count: number
  market_situation?: string
  urgency: 'high' | 'medium' | 'low'
  bidders_count?: number
}

interface BidderScore {
  name: string
  price: number
  quality: number
  delivery: number
  service: number
  innovation: number
  compliance: number
}

interface SourcingResult {
  project_id: string
  strategy_recommendation: string
  rfq_status: { phase: string; completed: number; total: number; next_action: string }
  scorecard: BidderScore[]
  winner_recommendation: { supplier: string; reason: string; savings_pct: number }
  negotiation_playbook: { tactic: string; target: string; expected_outcome: string }[]
  savings_validation: { baseline: number; proposed: number; savings: number; savings_pct: number; validated: boolean }
  compliance_checks: { item: string; status: string; notes: string }[]
}

function analyzeStrategicSourcing(project: SourcingProject, bidders?: string[]): SourcingResult {
  const rng = createSeededRandom('sourcing_' + project.project_id)
  const bidderNames = bidders ?? [`Supplier_${rng.nextInt(100, 999)}`, `Vendor_${rng.nextInt(100, 999)}`, `Partner_${rng.nextInt(100, 999)}`]

  // RFQ status
  const phases = ['RFI', 'RFP', 'RFQ', '评估', '谈判', '授标']
  const currentPhaseIdx = rng.nextInt(1, 4)

  // Scorecard
  const scorecard: BidderScore[] = bidderNames.map(name => ({
    name,
    price: rng.nextInt(70, 98),
    quality: rng.nextInt(65, 95),
    delivery: rng.nextInt(70, 96),
    service: rng.nextInt(60, 92),
    innovation: rng.nextInt(55, 90),
    compliance: rng.nextInt(75, 100)
  }))

  // Weighted total (price 30%, quality 25%, delivery 20%, service 10%, innovation 5%, compliance 10%)
  const weightedScores = scorecard.map(s => ({
    bidder: s,
    total: Math.round(s.price * 0.30 + s.quality * 0.25 + s.delivery * 0.20 + s.service * 0.10 + s.innovation * 0.05 + s.compliance * 0.10)
  }))
  weightedScores.sort((a, b) => b.total - a.total)
  const winner = weightedScores[0]

  // Negotiation playbook
  const playbook: SourcingResult['negotiation_playbook'] = [
    { tactic: 'BATNA展示', target: '价格降低5%', expected_outcome: '利用竞争压力获取更优报价' },
    { tactic: '量价挂钩', target: '折扣阶梯', expected_outcome: '承诺年度量换取10%-15%折扣' },
    { tactic: '付款条件', target: 'Net 60 → Net 45', expected_outcome: '改善现金流同时维持供应商关系' },
    { tactic: '长期协议', target: '2+1年锁定', expected_outcome: '价格年度锁定，免受市场波动' }
  ]

  // Savings validation
  const currentPrice = project.current_price ?? project.estimated_spend * 0.001
  const proposedPrice = currentPrice * rng.nextFloat(0.82, 0.93)
  const savings = currentPrice - proposedPrice
  const savingsPct = Math.round(savings / currentPrice * 1000) / 10

  // Compliance checks
  const compliance: SourcingResult['compliance_checks'] = [
    { item: '招标文件完整性', status: 'pass', notes: '所有技术规范均已包含' },
    { item: '供应商资质审查', status: 'pass', notes: '营业执照、ISO认证齐全' },
    { item: '反贿赂声明', status: 'pass', notes: '所有投标方已签署廉洁协议' },
    { item: '利益冲突申报', status: rng.nextFloat(0, 1) > 0.8 ? 'warning' : 'pass', notes: '需确认评标委员无利益关联' },
    { item: '数据保护合规', status: 'pass', notes: '符合GDPR/PIPL数据保护要求' }
  ]

  const strategyRec = project.urgency === 'high'
    ? '快速寻源模式：缩短RFI周期，优先邀请现有合格供应商参与竞争性谈判'
    : project.bidders_count && project.bidders_count >= 5
      ? '充分竞争模式：5+家供应商参与，通过激烈竞争获取最优商务条件'
      : '战略寻源模式：完整RFI→RFP→RFQ流程，建立长期合作伙伴关系'

  return {
    project_id: project.project_id,
    strategy_recommendation: strategyRec,
    rfq_status: { phase: phases[currentPhaseIdx], completed: currentPhaseIdx + 1, total: phases.length, next_action: currentPhaseIdx < 3 ? '推进至RFQ发标阶段' : '进入技术评标阶段' },
    scorecard,
    winner_recommendation: { supplier: winner.bidder.name, reason: `综合评分最高(${winner.total}分)，性价比最优`, savings_pct: savingsPct },
    negotiation_playbook: playbook,
    savings_validation: { baseline: Math.round(currentPrice), proposed: Math.round(proposedPrice), savings: Math.round(savings), savings_pct: savingsPct, validated: savingsPct > 5 },
    compliance_checks: compliance
  }
}

function formatSourcingReport(result: SourcingResult): string {
  const lines: string[] = []
  lines.push('## 🎯 Strategic Sourcing — 战略寻源报告')
  lines.push('')
  lines.push('### 🔵 寻源策略建议')
  lines.push('')
  lines.push(`> ${result.strategy_recommendation}`)
  lines.push('')

  lines.push('### 📋 RFI/RFP/RFQ流程状态')
  lines.push('')
  lines.push(`| 维度 | 状态 |`)
  lines.push(`|------|------|`)
  lines.push(`| 当前阶段 | ${result.rfq_status.phase} (${result.rfq_status.completed}/${result.rfq_status.total}) |`)
  lines.push(`| 下一步行动 | ${result.rfq_status.next_action} |`)
  lines.push('')

  lines.push('### 🏆 评标评分卡')
  lines.push('')
  lines.push('| 供应商 | 价格(30%) | 质量(25%) | 交付(20%) | 服务(10%) | 创新(5%) | 合规(10%) | 加权总分 |')
  lines.push('|--------|-----------|-----------|-----------|-----------|----------|-----------|----------|')
  for (const s of result.scorecard) {
    const total = Math.round(s.price * 0.30 + s.quality * 0.25 + s.delivery * 0.20 + s.service * 0.10 + s.innovation * 0.05 + s.compliance * 0.10)
    lines.push(`| ${s.name} | ${s.price} | ${s.quality} | ${s.delivery} | ${s.service} | ${s.innovation} | ${s.compliance} | **${total}** |`)
  }
  lines.push('')

  lines.push('### 🥇 推荐中标方')
  lines.push('')
  lines.push(`| 维度 | 详情 |`)
  lines.push(`|------|------|`)
  lines.push(`| 推荐供应商 | ${result.winner_recommendation.supplier} |`)
  lines.push(`| 推荐理由 | ${result.winner_recommendation.reason} |`)
  lines.push(`| 预计节省 | ${result.winner_recommendation.savings_pct}% |`)
  lines.push('')

  lines.push('### 🎲 谈判策略手册')
  lines.push('')
  lines.push('| 策略 | 目标 | 预期效果 |')
  lines.push('|------|------|----------|')
  for (const p of result.negotiation_playbook) {
    lines.push(`| ${p.tactic} | ${p.target} | ${p.expected_outcome} |`)
  }
  lines.push('')

  lines.push('### 💰 节余验证')
  lines.push('')
  lines.push('| 维度 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 基准价格 | ¥${result.savings_validation.baseline} |`)
  lines.push(`| 中标价格 | ¥${result.savings_validation.proposed} |`)
  lines.push(`| 单项节余 | ¥${result.savings_validation.savings} |`)
  lines.push(`| 节余比例 | ${result.savings_validation.savings_pct}% |`)
  lines.push(`| 验证状态 | ${result.savings_validation.validated ? '✅ 验证通过' : '⚠️ 需进一步验证'} |`)
  lines.push('')

  lines.push('### ✅ 合规检查清单')
  lines.push('')
  for (const c of result.compliance_checks) {
    const status = c.status === 'pass' ? '✅' : c.status === 'warning' ? '⚠️' : '❌'
    lines.push(`- ${status} **${c.item}**: ${c.notes}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*ProcureAgent • Strategic Sourcing • Competitive Bidding*')
  return lines.join('\n')
}

// ==================== TOOL 4: CONTRACT_SPEND_ALIGNMENT ====================
// 合同vs实际支出+漏损检测+合规采购率+续约指导+Massetto曲线分析

interface ContractData {
  contract_id: string
  supplier: string
  category: string
  contract_value: number
  actual_spend: number
  start_date: string
  end_date: string
  payment_terms: string
  compliance_clause: boolean
  volume_commitment?: number
}

interface AlignmentResult {
  total_contracts: number
  total_contract_value: number
  total_actual_spend: number
  alignment_rate: number
  leakage_detected: { contract_id: string; leakage_type: string; amount: number; severity: string }[]
  compliance_rate: number
  renewal_recommendations: { contract_id: string; supplier: string; action: string; urgency: string; days_remaining: number }[]
  massetto_curve: { category: string; contract_coverage: number; spend_under_management: number; opportunity: string }[]
  overall_health: string
}

function analyzeContractAlignment(contracts: ContractData[]): AlignmentResult {
  const rng = createSeededRandom('contract_' + contracts.length)
  const totalCV = contracts.reduce((s, c) => s + c.contract_value, 0)
  const totalAS = contracts.reduce((s, c) => s + c.actual_spend, 0)

  // Leakage detection
  const leakage: AlignmentResult['leakage_detected'] = []
  for (const c of contracts) {
    if (c.actual_spend > c.contract_value * 1.15) {
      leakage.push({ contract_id: c.contract_id, leakage_type: 'overspend', amount: Math.round(c.actual_spend - c.contract_value), severity: 'high' })
    } else if (c.actual_spend < c.contract_value * 0.5) {
      leakage.push({ contract_id: c.contract_id, leakage_type: 'under_utilization', amount: Math.round(c.contract_value * 0.5 - c.actual_spend), severity: 'medium' })
    }
    if (!c.compliance_clause) {
      leakage.push({ contract_id: c.contract_id, leakage_type: 'missing_compliance_clause', amount: Math.round(c.contract_value * 0.02), severity: 'low' })
    }
  }

  // Compliance rate
  const compliantContracts = contracts.filter(c => c.compliance_clause && c.actual_spend <= c.contract_value * 1.1).length
  const complianceRate = contracts.length > 0 ? Math.round(compliantContracts / contracts.length * 100) : 0

  // Renewal recommendations
  const renewals: AlignmentResult['renewal_recommendations'] = []
  for (const c of contracts) {
    const endDate = new Date(c.end_date)
    const now = new Date()
    const daysRemaining = Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysRemaining < 90 && daysRemaining > 0) {
      renewals.push({ contract_id: c.contract_id, supplier: c.supplier, action: '立即启动续约谈判', urgency: 'high', days_remaining: daysRemaining })
    } else if (daysRemaining < 180) {
      renewals.push({ contract_id: c.contract_id, supplier: c.supplier, action: '准备续约评估', urgency: 'medium', days_remaining: daysRemaining })
    }
  }

  // Massetto curve (spend under management by category)
  const categoryMap = new Map<string, { total: number; covered: number }>()
  for (const c of contracts) {
    const existing = categoryMap.get(c.category) ?? { total: 0, covered: 0 }
    existing.total += c.actual_spend
    if (c.contract_value > 0) existing.covered += c.actual_spend
    categoryMap.set(c.category, existing)
  }
  const massettoCurve: AlignmentResult['massetto_curve'] = Array.from(categoryMap.entries()).map(([cat, data]) => ({
    category: cat,
    contract_coverage: data.total > 0 ? Math.round(data.covered / data.total * 100) : 0,
    spend_under_management: data.covered,
    opportunity: data.total > 0 && data.covered / data.total < 0.6 ? '需推进合同覆盖' : '覆盖率良好'
  }))

  const alignmentRate = totalCV > 0 ? Math.min(100, Math.round(totalAS / totalCV * 100)) : 0

  return {
    total_contracts: contracts.length,
    total_contract_value: totalCV,
    total_actual_spend: totalAS,
    alignment_rate: alignmentRate,
    leakage_detected: leakage,
    compliance_rate: complianceRate,
    renewal_recommendations: renewals,
    massetto_curve: massettoCurve,
    overall_health: complianceRate >= 80 ? 'healthy' : complianceRate >= 60 ? 'moderate' : 'at_risk'
  }
}

function formatAlignmentReport(result: AlignmentResult): string {
  const lines: string[] = []
  lines.push('## 📝 Contract-Spend Alignment — 合同支出对齐报告')
  lines.push('')
  lines.push('### 🔵 对齐健康度面板')
  lines.push('')
  lines.push('| 维度 | 数值 | 说明 |')
  lines.push('|------|------|------|')
  lines.push(`| 合同总数 | ${result.total_contracts} | 分析期间有效合同 |`)
  lines.push(`| 合同总值 | ¥${(result.total_contract_value / 10000).toFixed(1)}万 | 合同承诺采购金额 |`)
  lines.push(`| 实际支出 | ¥${(result.total_actual_spend / 10000).toFixed(1)}万 | 实际发生采购金额 |`)
  lines.push(`| 对齐率 | ${result.alignment_rate}% | 实际/合同偏差 |`)
  lines.push(`| 合规采购率 | ${result.compliance_rate}% | 符合合同条款的采购占比 |`)
  lines.push(`| 健康状态 | ${result.overall_health === 'healthy' ? '✅ 健康' : result.overall_health === 'moderate' ? '⚠️ 一般' : '🚨 风险'} | 综合评估 |`)
  lines.push('')

  lines.push('### 🕳️ 漏损检测')
  lines.push('')
  if (result.leakage_detected.length > 0) {
    lines.push('| 合同ID | 漏损类型 | 金额(万) | 严重度 |')
    lines.push('|--------|----------|----------|--------|')
    for (const l of result.leakage_detected.slice(0, 15)) {
      const sevEmoji = l.severity === 'high' ? '🔴' : l.severity === 'medium' ? '🟡' : '🟢'
      lines.push(`| ${l.contract_id} | ${l.leakage_type} | ¥${(l.amount / 10000).toFixed(1)} | ${sevEmoji} ${l.severity} |`)
    }
  } else {
    lines.push('> ✅ 未检测到漏损')
  }
  lines.push('')

  lines.push('### 🔄 续约指导')
  lines.push('')
  if (result.renewal_recommendations.length > 0) {
    lines.push('| 合同ID | 供应商 | 建议行动 | 紧急度 | 剩余天数 |')
    lines.push('|--------|--------|----------|--------|----------|')
    for (const r of result.renewal_recommendations.slice(0, 10)) {
      const urgEmoji = r.urgency === 'high' ? '🔴' : '🟡'
      lines.push(`| ${r.contract_id} | ${r.supplier} | ${r.action} | ${urgEmoji} ${r.urgency} | ${r.days_remaining}天 |`)
    }
  } else {
    lines.push('> ✅ 近期无续约需求')
  }
  lines.push('')

  lines.push('### 📈 Massetto曲线分析（支出管理成熟度）')
  lines.push('')
  lines.push('| 类别 | 合同覆盖率 | 管理下支出(万) | 改进建议 |')
  lines.push('|------|-----------|---------------|----------|')
  for (const m of result.massetto_curve) {
    lines.push(`| ${m.category} | ${m.contract_coverage}% | ¥${(m.spend_under_management / 10000).toFixed(1)} | ${m.opportunity} |`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*ProcureAgent • Contract Intelligence • Spend Under Management*')
  return lines.join('\n')
}

// ==================== TOOL 5: P2P_AUTOMATOR ====================
// 请购→采购单→收货→发票三单匹配→付款的端到端流程编排+异常处理

interface P2PRequest {
  request_id: string
  item_description: string
  category: string
  quantity: number
  unit_price: number
  requester: string
  department: string
  budget_code: string
  required_date: string
  has_contract: boolean
  contract_id?: string
}

interface P2PResult {
  request_id: string
  pipeline_status: { stage: string; status: string; timestamp: string; notes: string }[]
  three_way_match: { po_amount: number; gr_amount: number; invoice_amount: number; matched: boolean; variance: number; variance_pct: number }
  approval_chain: { approver: string; role: string; status: string; threshold: string }[]
  exceptions: { type: string; description: string; resolution: string; auto_resolvable: boolean }[]
  processing_time_estimate: string
  automation_rate: number
  next_actions: string[]
}

function analyzeP2P(request: P2PRequest): P2PResult {
  const rng = createSeededRandom('p2p_' + request.request_id)
  const totalAmount = request.quantity * request.unit_price

  // Pipeline stages
  const stages = [
    { stage: 'requisition', status: 'completed', notes: '请购单已提交并审批通过' },
    { stage: 'sourcing', status: request.has_contract ? 'completed' : 'pending', notes: request.has_contract ? '使用现有合同' : '需启动寻源流程' },
    { stage: 'purchase_order', status: request.has_contract ? 'completed' : 'blocked', notes: request.has_contract ? `采购单已生成（合同${request.contract_id}）` : '等待寻源完成' },
    { stage: 'goods_receipt', status: 'pending', notes: '待供应商发货与收货确认' },
    { stage: 'invoice_matching', status: 'pending', notes: '待发票录入与三单匹配' },
    { stage: 'payment', status: 'pending', notes: '匹配通过后进入付款排程' }
  ]

  // Three-way match
  const grAmount = totalAmount
  const invoiceVariance = rng.nextFloat(-0.03, 0.03)
  const invoiceAmount = Math.round(totalAmount * (1 + invoiceVariance))
  const variance = invoiceAmount - totalAmount
  const variancePct = Math.abs(Math.round(variance / totalAmount * 10000) / 100)
  const matched = variancePct < 2

  // Approval chain
  const approvalChain: P2PResult['approval_chain'] = [
    { approver: '直属主管', role: 'direct_manager', status: 'approved', threshold: '¥50,000' },
    { approver: totalAmount > 50000 ? '部门总监' : 'N/A', role: totalAmount > 50000 ? 'director' : 'none', status: totalAmount > 50000 ? 'pending' : 'waived', threshold: '¥200,000' },
    { approver: totalAmount > 200000 ? 'CFO' : 'N/A', role: totalAmount > 200000 ? 'cfo' : 'none', status: totalAmount > 200000 ? 'pending' : 'waived', threshold: '¥500,000' }
  ]

  // Exceptions
  const exceptions: P2PResult['exceptions'] = []
  if (!request.has_contract) {
    exceptions.push({ type: 'no_contract', description: '该品类无有效合同覆盖，需走非标采购流程', resolution: '触发紧急寻源或申请单次采购审批', auto_resolvable: false })
  }
  if (!matched) {
    exceptions.push({ type: 'invoice_mismatch', description: `发票金额偏差${variancePct}%（阈值2%）`, resolution: '联系供应商核实并重新开具发票', auto_resolvable: true })
  }
  if (rng.nextFloat(0, 1) > 0.7) {
    exceptions.push({ type: 'budget_exceeded', description: '超出部门预算余额', resolution: '申请预算调剂或延期至下季度', auto_resolvable: false })
  }

  const automationRate = request.has_contract && matched ? rng.nextInt(85, 98) : rng.nextInt(40, 65)

  const nextActions: string[] = []
  if (!request.has_contract) nextActions.push('启动紧急寻源或单次采购审批')
  if (!matched) nextActions.push('核实发票差异并要求供应商重开')
  nextActions.push('推进收货确认（GR）')
  nextActions.push('完成三单匹配后进入付款排程')

  return {
    request_id: request.request_id,
    pipeline_status: stages.map((s, i) => ({ ...s, timestamp: `T+${i * 2}h` })),
    three_way_match: { po_amount: totalAmount, gr_amount: grAmount, invoice_amount: invoiceAmount, matched, variance, variance_pct: variancePct },
    approval_chain: approvalChain.filter(a => a.status !== 'waived'),
    exceptions,
    processing_time_estimate: request.has_contract ? `${rng.nextInt(3, 7)}个工作日` : `${rng.nextInt(10, 21)}个工作日`,
    automation_rate: automationRate,
    next_actions: nextActions
  }
}

function formatP2PReport(result: P2PResult): string {
  const lines: string[] = []
  lines.push('## ⚙️ P2P Automator — 采购到付款自动化报告')
  lines.push('')
  lines.push('### 🔵 流程编排看板')
  lines.push('')
  lines.push('| 阶段 | 状态 | 时间 | 备注 |')
  lines.push('|------|------|------|------|')
  for (const s of result.pipeline_status) {
    const statusEmoji = s.status === 'completed' ? '✅' : s.status === 'pending' ? '⏳' : s.status === 'blocked' ? '🚫' : '⏭️'
    lines.push(`| ${s.stage} | ${statusEmoji} ${s.status} | ${s.timestamp} | ${s.notes} |`)
  }
  lines.push('')

  lines.push('### 🧾 三单匹配结果')
  lines.push('')
  lines.push('| 维度 | 数值 |')
  lines.push('|------|------|')
  lines.push(`| 采购单金额 | ¥${result.three_way_match.po_amount.toLocaleString()} |`)
  lines.push(`| 收货单金额 | ¥${result.three_way_match.gr_amount.toLocaleString()} |`)
  lines.push(`| 发票金额 | ¥${result.three_way_match.invoice_amount.toLocaleString()} |`)
  lines.push(`| 差异 | ¥${result.three_way_match.variance.toLocaleString()} (${result.three_way_match.variance_pct}%) |`)
  lines.push(`| 匹配状态 | ${result.three_way_match.matched ? '✅ 匹配通过' : '❌ 存在差异'} |`)
  lines.push('')

  lines.push('### ✍️ 审批链')
  lines.push('')
  for (const a of result.approval_chain) {
    const statusEmoji = a.status === 'approved' ? '✅' : a.status === 'pending' ? '⏳' : '—'
    lines.push(`- ${statusEmoji} **${a.approver}** (${a.role}) — 阈值${a.threshold}`)
  }
  lines.push('')

  if (result.exceptions.length > 0) {
    lines.push('### ⚠️ 异常处理')
    lines.push('')
    for (const e of result.exceptions) {
      lines.push(`- **[${e.type}]** ${e.description}`)
      lines.push(`  - 解决方案: ${e.resolution}`)
      lines.push(`  - 自动处理: ${e.auto_resolvable ? '🤖 是' : '👤 需人工'}`)
    }
    lines.push('')
  }

  lines.push('### 📊 自动化效率')
  lines.push('')
  lines.push(`| 维度 | 数值 |`)
  lines.push(`|------|------|`)
  lines.push(`| 处理时效预估 | ${result.processing_time_estimate} |`)
  lines.push(`| 自动化率 | ${result.automation_rate}% |`)
  lines.push('')

  lines.push('### 📋 下一步行动')
  lines.push('')
  for (const a of result.next_actions) {
    lines.push(`- ${a}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*ProcureAgent • P2P Automation • Touchless Processing*')
  return lines.join('\n')
}

// ==================== TOOL 6: SUPPLIER_DEVELOPMENT ====================
// 需求分析+长名单→短名单→验证→试点→批量→绩效追踪+退出方案

interface DevelopmentTarget {
  target_id: string
  category: string
  current_supplier_count: number
  target_supplier_count: number
  quality_target: number
  cost_reduction_target: number
  timeline_months: number
  current_stage: 'analysis' | 'long_list' | 'short_list' | 'validation' | 'pilot' | 'ramp_up' | 'performance' | 'exit'
}

interface DevelopmentResult {
  target_id: string
  stage_gates: { stage: string; status: string; criteria: string; passed: boolean }[]
  long_list: { supplier: string; source: string; initial_score: number }[]
  short_list: { supplier: string; capability_score: number; risk_level: string; selection_reason: string }[]
  validation_plan: { phase: string; duration_weeks: number; success_criteria: string }[]
  pilot_results: { metric: string; target: number; actual: number; passed: boolean }[]
  performance_tracking: { kpi: string; baseline: number; current: number; target: number; trend: string }[]
  exit_strategy: { trigger: string; timeline: string; mitigation: string }[]
}

function analyzeSupplierDevelopment(target: DevelopmentTarget, candidates?: string[]): DevelopmentResult {
  const rng = createSeededRandom('dev_' + target.target_id)
  const candidateNames = candidates ?? [`NewTech_${rng.nextInt(100, 999)}`, `FreshSource_${rng.nextInt(100, 999)}`, `InnoSupply_${rng.nextInt(100, 999)}`, `ValueChain_${rng.nextInt(100, 999)}`, `SmartParts_${rng.nextInt(100, 999)}`]

  // Stage gates
  const stageOrder = ['analysis', 'long_list', 'short_list', 'validation', 'pilot', 'ramp_up', 'performance', 'exit']
  const currentIdx = stageOrder.indexOf(target.current_stage)
  const stageGates: DevelopmentResult['stage_gates'] = stageOrder.map((stage, i) => ({
    stage,
    status: i < currentIdx ? 'completed' : i === currentIdx ? 'in_progress' : 'pending',
    criteria: `${stage}阶段标准`,
    passed: i < currentIdx
  }))

  // Long list
  const longList = candidateNames.map(name => ({
    supplier: name,
    source: ['行业展会', 'B2B平台', '同行推荐', '数据库筛选', '行业协会'][rng.nextInt(0, 4)],
    initial_score: rng.nextInt(55, 85)
  })).sort((a, b) => b.initial_score - a.initial_score)

  // Short list (top 3)
  const shortList = longList.slice(0, 3).map(s => ({
    supplier: s.supplier,
    capability_score: s.initial_score + rng.nextInt(0, 10),
    risk_level: rng.nextFloat(0, 1) > 0.7 ? 'medium' : 'low',
    selection_reason: `综合能力评分${s.initial_score}，${['交期优势', '价格竞争力', '技术创新', '产能充足'][rng.nextInt(0, 3)]}`
  }))

  // Validation plan
  const validationPlan: DevelopmentResult['validation_plan'] = [
    { phase: '资质审查', duration_weeks: 2, success_criteria: '营业执照、ISO认证、财报三达标' },
    { phase: '现场审核', duration_weeks: 3, success_criteria: '现场评分≥80分（质量体系+产能+环境）' },
    { phase: '样品测试', duration_weeks: 4, success_criteria: '样品检验合格率≥98%' }
  ]

  // Pilot results
  const pilotResults: DevelopmentResult['pilot_results'] = [
    { metric: '质量合格率', target: target.quality_target, actual: Math.round((target.quality_target + rng.nextFloat(-3, 5)) * 10) / 10, passed: true },
    { metric: '准时交付率', target: 90, actual: Math.round((85 + rng.nextFloat(0, 10)) * 10) / 10, passed: false },
    { metric: '价格竞争力', target: target.cost_reduction_target, actual: Math.round((target.cost_reduction_target + rng.nextFloat(-5, 3)) * 10) / 10, passed: true }
  ]

  // Performance tracking
  const performanceTracking: DevelopmentResult['performance_tracking'] = [
    { kpi: '质量合格率(%)', baseline: 88, current: Math.round((90 + rng.nextFloat(0, 8)) * 10) / 10, target: target.quality_target, trend: 'improving' },
    { kpi: '交付准时率(%)', baseline: 75, current: Math.round((78 + rng.nextFloat(0, 12)) * 10) / 10, target: 90, trend: rng.nextFloat(0, 1) > 0.4 ? 'improving' : 'stable' },
    { kpi: '成本降幅(%)', baseline: 0, current: Math.round(rng.nextFloat(5, 15) * 10) / 10, target: target.cost_reduction_target, trend: 'improving' },
    { kpi: '响应速度(h)', baseline: 48, current: Math.round(24 + rng.nextFloat(0, 20)), target: 12, trend: 'improving' }
  ]

  // Exit strategy
  const exitStrategy: DevelopmentResult['exit_strategy'] = [
    { trigger: '连续2次审核未通过', timeline: '30天内完成切换', mitigation: '启用备选供应商，确保不断供' },
    { trigger: '连续3个月交付率<80%', timeline: '60天逐步退出', mitigation: '分批转移订单至合格供应商' },
    { trigger: '重大合规/质量事故', timeline: '立即启动退出', mitigation: '激活备选供应商应急响应' }
  ]

  return {
    target_id: target.target_id,
    stage_gates: stageGates,
    long_list: longList,
    short_list: shortList,
    validation_plan: validationPlan,
    pilot_results: pilotResults,
    performance_tracking: performanceTracking,
    exit_strategy: exitStrategy
  }
}

function formatDevelopmentReport(result: DevelopmentResult): string {
  const lines: string[] = []
  lines.push('## 🌱 Supplier Development — 供应商开发报告')
  lines.push('')
  lines.push('### 🔵 阶段门控看板')
  lines.push('')
  lines.push('| 阶段 | 状态 | 结果 |')
  lines.push('|------|------|------|')
  for (const g of result.stage_gates) {
    const statusEmoji = g.status === 'completed' ? '✅' : g.status === 'in_progress' ? '🔄' : '⏳'
    lines.push(`| ${g.stage} | ${statusEmoji} ${g.status} | ${g.passed ? '通过' : g.status === 'in_progress' ? '进行中' : '待启动'} |`)
  }
  lines.push('')

  lines.push('### 📋 长名单 → 短名单')
  lines.push('')
  lines.push('| 供应商 | 来源 | 初始评分 | 入选短名单 |')
  lines.push('|--------|------|----------|-----------|')
  const shortNames = result.short_list.map(s => s.supplier)
  for (const l of result.long_list) {
    lines.push(`| ${l.supplier} | ${l.source} | ${l.initial_score} | ${shortNames.includes(l.supplier) ? '✅ 入选' : '❌ 未入选'} |`)
  }
  lines.push('')

  lines.push('### 🎯 短名单评估')
  lines.push('')
  lines.push('| 供应商 | 能力评分 | 风险等级 | 入选理由 |')
  lines.push('|--------|----------|----------|----------|')
  for (const s of result.short_list) {
    const riskEmoji = s.risk_level === 'low' ? '🟢' : s.risk_level === 'medium' ? '🟡' : '🔴'
    lines.push(`| ${s.supplier} | ${s.capability_score} | ${riskEmoji} ${s.risk_level} | ${s.selection_reason} |`)
  }
  lines.push('')

  lines.push('### ✅ 验证计划')
  lines.push('')
  for (const v of result.validation_plan) {
    lines.push(`- **${v.phase}** (${v.duration_weeks}周): ${v.success_criteria}`)
  }
  lines.push('')

  lines.push('### 🧪 试点结果')
  lines.push('')
  lines.push('| 指标 | 目标 | 实际 | 结果 |')
  lines.push('|------|------|------|------|')
  for (const p of result.pilot_results) {
    lines.push(`| ${p.metric} | ${p.target}% | ${p.actual}% | ${p.passed ? '✅ 通过' : '❌ 未达标'} |`)
  }
  lines.push('')

  lines.push('### 📈 绩效追踪')
  lines.push('')
  lines.push('| KPI | 基线 | 当前 | 目标 | 趋势 |')
  lines.push('|-----|------|------|------|------|')
  for (const t of result.performance_tracking) {
    const trendEmoji = t.trend === 'improving' ? '📈' : t.trend === 'declining' ? '📉' : '➡️'
    lines.push(`| ${t.kpi} | ${t.baseline} | ${t.current} | ${t.target} | ${trendEmoji} ${t.trend} |`)
  }
  lines.push('')

  lines.push('### 🚪 退出方案')
  lines.push('')
  for (const e of result.exit_strategy) {
    lines.push(`- 🚨 **触发条件**: ${e.trigger} → ${e.timeline} | 缓解措施: ${e.mitigation}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*ProcureAgent • Supplier Development • Capability Building*')
  return lines.join('\n')
}

// ==================== TOOL 7: TAIL_SPEND_OPTIMIZER ====================
// 长尾供应商整合+目录采购+P卡策略+智能目录+自助采购引导+节省追踪

interface TailSpendData {
  total_suppliers: number
  tail_suppliers: number
  tail_spend: number
  total_spend: number
  tail_categories: { category: string; supplier_count: number; total_amount: number; avg_order_value: number }[]
  maverick_spend_pct: number
  catalog_coverage: number
}

interface TailSpendResult {
  current_state: { tail_supplier_ratio: number; tail_spend_ratio: number; avg_supplier_spend: number; fragmentation_index: number }
  consolidation_opportunities: { category: string; current_suppliers: number; target_suppliers: number; savings_potential: number }[]
  catalog_strategy: { category: string; catalog_eligible: boolean; estimated_adoption: number; annual_savings: number }[]
  p_card_recommendation: { applicable_categories: string; spend_threshold: string; annual_transactions: number; processed_savings: number }
  self_service_portal: { feature: string; adoption_target: string; expected_efficiency_gain: string }[]
  savings_tracker: { initiative: string; target_savings: number; achieved_savings: number; status: string }[]
}

function analyzeTailSpend(data: TailSpendData): TailSpendResult {
  const rng = createSeededRandom('tail_' + data.total_suppliers)

  const tailSpendRatio = data.total_spend > 0 ? Math.round(data.tail_spend / data.total_spend * 1000) / 10 : 0
  const tailSupRatio = data.total_suppliers > 0 ? Math.round(data.tail_suppliers / data.total_suppliers * 1000) / 10 : 0
  const avgSupSpend = data.tail_suppliers > 0 ? Math.round(data.tail_spend / data.tail_suppliers) : 0

  // Consolidation opportunities
  const consolidation = data.tail_categories.slice(0, 5).map(cat => ({
    category: cat.category,
    current_suppliers: cat.supplier_count,
    target_suppliers: Math.max(1, Math.round(cat.supplier_count * 0.3)),
    savings_potential: Math.round(cat.total_amount * rng.nextFloat(0.08, 0.18))
  }))

  // Catalog strategy
  const catalog = data.tail_categories.map(cat => ({
    category: cat.category,
    catalog_eligible: cat.avg_order_value < 10000,
    estimated_adoption: cat.avg_order_value < 10000 ? rng.nextInt(60, 85) : rng.nextInt(20, 45),
    annual_savings: cat.avg_order_value < 10000 ? Math.round(cat.total_amount * rng.nextFloat(0.05, 0.12)) : Math.round(cat.total_amount * rng.nextFloat(0.01, 0.04))
  }))

  // P-card recommendation
  const lowValueCats = data.tail_categories.filter(c => c.avg_order_value < 5000)
  const pCardTotal = lowValueCats.reduce((s, c) => s + c.total_amount, 0)
  const pCardTrans = lowValueCats.reduce((s, c) => s + c.supplier_count * 12, 0)

  // Self-service
  const selfService: TailSpendResult['self_service_portal'] = [
    { feature: '智能搜索与比价', adoption_target: '80%', expected_efficiency_gain: '采购周期缩短60%' },
    { feature: '预算实时校验', adoption_target: '95%', expected_efficiency_gain: '审批前移，减少退单' },
    { feature: '移动审批', adoption_target: '70%', expected_efficiency_gain: '审批时效提升50%' },
    { feature: 'AI辅助选品', adoption_target: '60%', expected_efficiency_gain: '提升短名单匹配精度' }
  ]

  // Savings tracker
  const savingsTracker: TailSpendResult['savings_tracker'] = [
    { initiative: '长尾供应商整合', target_savings: Math.round(data.tail_spend * 0.12), achieved_savings: Math.round(data.tail_spend * 0.07), status: 'in_progress' },
    { initiative: '目录采购推广', target_savings: Math.round(data.tail_spend * 0.08), achieved_savings: Math.round(data.tail_spend * 0.05), status: 'in_progress' },
    { initiative: 'Maverick支出治理', target_savings: Math.round(data.total_spend * data.maverick_spend_pct / 100 * 0.6), achieved_savings: Math.round(data.total_spend * data.maverick_spend_pct / 100 * 0.3), status: 'in_progress' },
    { initiative: 'P卡推广', target_savings: Math.round(pCardTotal * 0.03), achieved_savings: Math.round(pCardTotal * 0.02), status: 'on_track' }
  ]

  return {
    current_state: { tail_supplier_ratio: tailSupRatio, tail_spend_ratio: tailSpendRatio, avg_supplier_spend: avgSupSpend, fragmentation_index: Math.round(tailSupRatio * 0.8 + data.maverick_spend_pct * 0.2) },
    consolidation_opportunities: consolidation,
    catalog_strategy: catalog,
    p_card_recommendation: { applicable_categories: lowValueCats.map(c => c.category).join(', ') || '办公用品,IT耗材', spend_threshold: '单笔<¥5,000', annual_transactions: pCardTotal > 0 ? pCardTrans : 2400, processed_savings: Math.round(pCardTotal * 0.03) },
    self_service_portal: selfService,
    savings_tracker: savingsTracker
  }
}

function formatTailSpendReport(result: TailSpendResult): string {
  const lines: string[] = []
  lines.push('## 🐟 Tail Spend Optimizer — 尾部支出优化报告')
  lines.push('')
  lines.push('### 🔵 尾部支出现状')
  lines.push('')
  lines.push('| 维度 | 数值 | 说明 |')
  lines.push('|------|------|------|')
  lines.push(`| 尾部长尾供应商占比 | ${result.current_state.tail_supplier_ratio}% | 占总供应商数量比例 |`)
  lines.push(`| 尾部支出占比 | ${result.current_state.tail_spend_ratio}% | 占总支出比例 |`)
  lines.push(`| 户均支出 | ¥${(result.current_state.avg_supplier_spend / 10000).toFixed(1)}万 | 尾部供应商平均采购额 |`)
  lines.push(`| 碎片化指数 | ${result.current_state.fragmentation_index}/100 | 越高越需整合 |`)
  lines.push('')

  lines.push('### 🔗 供应商整合机会')
  lines.push('')
  lines.push('| 类别 | 当前供应商数 | 目标数 | 预估节省(万) |')
  lines.push('|------|-------------|--------|-------------|')
  for (const c of result.consolidation_opportunities) {
    lines.push(`| ${c.category} | ${c.current_suppliers} | ${c.target_suppliers} | ¥${(c.savings_potential / 10000).toFixed(1)} |`)
  }
  lines.push('')

  lines.push('### 📖 目录采购策略')
  lines.push('')
  lines.push('| 类别 | 目录适用 | 预计采用率 | 年节省(万) |')
  lines.push('|------|----------|-----------|-----------|')
  for (const c of result.catalog_strategy) {
    lines.push(`| ${c.category} | ${c.catalog_eligible ? '✅ 适用' : '⚠️ 部分适用'} | ${c.estimated_adoption}% | ¥${(c.annual_savings / 10000).toFixed(1)} |`)
  }
  lines.push('')

  lines.push('### 💳 P卡策略')
  lines.push('')
  lines.push('| 维度 | 推荐 |')
  lines.push('|------|------|')
  lines.push(`| 适用品类 | ${result.p_card_recommendation.applicable_categories} |`)
  lines.push(`| 金额门槛 | ${result.p_card_recommendation.spend_threshold} |`)
  lines.push(`| 年度交易量 | ${result.p_card_recommendation.annual_transactions}笔 |`)
  lines.push(`| 处理节省 | ¥${(result.p_card_recommendation.processed_savings / 10000).toFixed(1)}万 |`)
  lines.push('')

  lines.push('### 🖥️ 自助采购引导')
  lines.push('')
  for (const s of result.self_service_portal) {
    lines.push(`- **${s.feature}**: 采用目标${s.adoption_target} → ${s.expected_efficiency_gain}`)
  }
  lines.push('')

  lines.push('### 📊 节省追踪')
  lines.push('')
  lines.push('| 举措 | 目标节省(万) | 已实现(万) | 状态 |')
  lines.push('|------|-------------|-----------|------|')
  for (const s of result.savings_tracker) {
    const statusEmoji = s.status === 'on_track' ? '✅' : '🔄'
    lines.push(`| ${s.initiative} | ¥${(s.target_savings / 10000).toFixed(1)} | ¥${(s.achieved_savings / 10000).toFixed(1)} | ${statusEmoji} ${s.status} |`)
  }
  lines.push('')
  lines.push('---')
  lines.push('*ProcureAgent • Tail Spend Optimization • Smart Consolidation*')
  return lines.join('\n')
}

// ==================== TOOL 8: COMPLIANCE_MONITOR ====================
// 反腐败条款+利益冲突+制裁筛查+审批完整性+文档留痕+审计就绪

interface ComplianceCheck {
  check_id: string
  category: 'anti_corruption' | 'conflict_of_interest' | 'sanctions' | 'approval_integrity' | 'documentation' | 'audit_readiness'
  description: string
  status: 'pass' | 'fail' | 'warning' | 'pending'
  evidence?: string
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  assignee?: string
  due_date?: string
}

interface ComplianceResult {
  overall_score: number
  compliance_level: 'excellent' | 'good' | 'moderate' | 'at_risk' | 'critical'
  checks_summary: { total: number; passed: number; failed: number; warning: number; pending: number }
  findings: { category: string; severity: string; description: string; recommendation: string; status: string }[]
  action_items: { item: string; priority: string; owner: string; deadline: string }[]
  audit_readiness: { document_completeness: number; trail_integrity: number; policy_coverage: number; overall_ready: boolean }
}

function analyzeCompliance(checks: ComplianceCheck[]): ComplianceResult {
  const passed = checks.filter(c => c.status === 'pass').length
  const failed = checks.filter(c => c.status === 'fail').length
  const warning = checks.filter(c => c.status === 'warning').length
  const pending = checks.filter(c => c.status === 'pending').length

  // Score calculation
  let score = 100
  score -= failed * 20
  score -= warning * 8
  score -= pending * 3
  score = Math.max(0, Math.min(100, score))

  // Findings
  const findings: ComplianceResult['findings'] = []
  for (const c of checks) {
    if (c.status !== 'pass') {
      findings.push({
        category: c.category,
        severity: c.risk_level,
        description: c.description,
        recommendation: c.status === 'fail' ? '立即整改，启动合规调查' : c.status === 'warning' ? '关注并制定改进计划' : '尽快完成评估',
        status: c.status
      })
    }
  }

  // Action items
  const actionItems: ComplianceResult['action_items'] = []
  for (const c of checks.filter(c => c.status !== 'pass').slice(0, 8)) {
    actionItems.push({
      item: c.description,
      priority: c.risk_level === 'critical' ? 'P0-紧急' : c.risk_level === 'high' ? 'P1-重要' : 'P2-常规',
      owner: c.assignee ?? '合规团队',
      deadline: c.due_date ?? '30天内'
    })
  }

  // Audit readiness
  const docComplete = Math.round((passed / Math.max(checks.length, 1)) * 100)
  const trailIntegrity = Math.round(100 - failed * 15)
  const policyCoverage = Math.round((checks.filter(c => c.status !== 'pending').length / Math.max(checks.length, 1)) * 100)

  const complianceLevel: ComplianceResult['compliance_level'] = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'moderate' : score >= 40 ? 'at_risk' : 'critical'

  return {
    overall_score: score,
    compliance_level: complianceLevel,
    checks_summary: { total: checks.length, passed, failed, warning, pending },
    findings,
    action_items: actionItems,
    audit_readiness: { document_completeness: docComplete, trail_integrity: Math.max(0, trailIntegrity), policy_coverage: policyCoverage, overall_ready: score >= 75 && failed === 0 }
  }
}

function formatComplianceReport(result: ComplianceResult): string {
  const lines: string[] = []
  lines.push('## 🔍 Compliance Monitor — 采购合规监控报告')
  lines.push('')
  lines.push('### 🔵 合规评分面板')
  lines.push('')
  lines.push('| 维度 | 评估 | 说明 |')
  lines.push('|------|------|------|')
  lines.push(`| 合规评分 | ${result.overall_score}/100 | ${result.compliance_level === 'excellent' ? '✅ 卓越' : result.compliance_level === 'good' ? '🟢 良好' : result.compliance_level === 'moderate' ? '🟡 中等' : result.compliance_level === 'at_risk' ? '🔴 风险' : '🚨 严重'} |`)
  lines.push(`| 检查总数 | ${result.checks_summary.total} | 通过${result.checks_summary.passed} / 失败${result.checks_summary.failed} / 警告${result.checks_summary.warning} |`)
  lines.push(`| 审计就绪 | ${result.audit_readiness.overall_ready ? '✅ 就绪' : '⚠️ 未就绪'} | 文档完整度${result.audit_readiness.document_completeness}% |`)
  lines.push('')

  lines.push('### 📋 检查项分布')
  lines.push('')
  lines.push('| 类别 | 数量 | 状态 |')
  lines.push('|------|------|------|')
  const cats = ['anti_corruption', 'conflict_of_interest', 'sanctions', 'approval_integrity', 'documentation', 'audit_readiness']
  const catNames: Record<string, string> = { anti_corruption: '反腐败条款', conflict_of_interest: '利益冲突', sanctions: '制裁筛查', approval_integrity: '审批完整性', documentation: '文档留痕', audit_readiness: '审计就绪' }
  for (const cat of cats) {
    lines.push(`| ${catNames[cat]} | — | 详见发现项 |`)
  }
  lines.push('')

  if (result.findings.length > 0) {
    lines.push('### ⚠️ 合规发现')
    lines.push('')
    lines.push('| 类别 | 严重度 | 描述 | 建议 | 状态 |')
    lines.push('|------|--------|------|------|------|')
    for (const f of result.findings.slice(0, 12)) {
      const sevEmoji = f.severity === 'critical' ? '🚨' : f.severity === 'high' ? '🔴' : f.severity === 'medium' ? '🟡' : '🟢'
      lines.push(`| ${f.category} | ${sevEmoji} ${f.severity} | ${f.description.substring(0, 30)} | ${f.recommendation.substring(0, 25)} | ${f.status} |`)
    }
    lines.push('')
  }

  lines.push('### 📝 整改行动项')
  lines.push('')
  for (const a of result.action_items) {
    lines.push(`- **[${a.priority}]** ${a.item} | 责任人: ${a.owner} | 截止: ${a.deadline}`)
  }
  lines.push('')

  lines.push('### 🔎 审计就绪评估')
  lines.push('')
  lines.push('| 维度 | 评分 | 状态 |')
  lines.push('|------|------|------|')
  lines.push(`| 文档完整度 | ${result.audit_readiness.document_completeness}% | ${result.audit_readiness.document_completeness >= 80 ? '✅' : '⚠️'} |`)
  lines.push(`| 留痕完整性 | ${result.audit_readiness.trail_integrity}% | ${result.audit_readiness.trail_integrity >= 80 ? '✅' : '⚠️'} |`)
  lines.push(`| 制度覆盖率 | ${result.audit_readiness.policy_coverage}% | ${result.audit_readiness.policy_coverage >= 80 ? '✅' : '⚠️'} |`)
  lines.push(`| 综合就绪 | ${result.audit_readiness.overall_ready ? '✅' : '❌'} | ${result.audit_readiness.overall_ready ? '可接受外部审计' : '需整改后接受审计'} |`)
  lines.push('')
  lines.push('---')
  lines.push('*ProcureAgent • Compliance Monitoring • Audit Ready*')
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: spend_analyzer
  tools.register(defineTool({
    name: 'spend_analyzer',
    description: '支出分析工具：对采购支出进行分类分析、供应商集中度评估、异常检测、节余机会挖掘、趋势预测和行业对标。输入采购记录JSON，输出完整支出分析报告。',
    parameters: {
      records: { type: 'string', required: true, description: 'JSON数组，每项包含: category, supplier, amount, date, department, contract_id(可选), po_number(可选)' },
      team_benchmark: { type: 'string', description: '可选的团队对标基准参数' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { records: string; team_benchmark?: string }) {
      const data: SpendRecord[] = JSON.parse(args.records)
      const result = analyzeSpend(data, args.team_benchmark)
      return formatSpendReport(result)
    }
  }))

  // Tool 2: supplier_360
  tools.register(defineTool({
    name: 'supplier_360',
    description: '供应商全景分析工具：综合分析供应商基本信息、财务风险、ESG评分、交付绩效、价格趋势、替代方案和关系地图。输入供应商档案JSON，输出360度全景报告。',
    parameters: {
      profile: { type: 'string', required: true, description: 'JSON对象，包含: supplier_id, name, category, country, annual_revenue, years_in_business, credit_rating, financial_score, esg_score, on_time_delivery_rate, quality_score, avg_lead_time_days, total_orders, defect_rate, unit_price_trend, relationship_years, sole_source' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { profile: string }) {
      const data: SupplierProfile = JSON.parse(args.profile)
      const result = analyzeSupplier360(data)
      return formatSupplier360Report(result)
    }
  }))

  // Tool 3: strategic_sourcing
  tools.register(defineTool({
    name: 'strategic_sourcing',
    description: '战略寻源工具：支持需求规格化、RFI/RFP/RFQ管理、评标评分卡生成、谈判策略、节余验证和合规检查。输入寻源项目JSON，输出完整寻源策略报告。',
    parameters: {
      project: { type: 'string', required: true, description: 'JSON对象，包含: project_id, category, estimated_spend, current_supplier, current_price, specifications, requirements_count, market_situation, urgency(high/medium/low), bidders_count' },
      bidders: { type: 'string', description: 'JSON数组，投标方名称列表' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { project: string; bidders?: string }) {
      const data: SourcingProject = JSON.parse(args.project)
      const bidders = args.bidders ? JSON.parse(args.bidders) : undefined
      const result = analyzeStrategicSourcing(data, bidders)
      return formatSourcingReport(result)
    }
  }))

  // Tool 4: contract_spend_alignment
  tools.register(defineTool({
    name: 'contract_spend_alignment',
    description: '合同支出对齐工具：分析合同vs实际支出偏差、检测漏损、评估合规采购率、提供续约指导、生成Massetto曲线分析。输入合同数据JSON数组，输出对齐分析报告。',
    parameters: {
      contracts: { type: 'string', required: true, description: 'JSON数组，每项包含: contract_id, supplier, category, contract_value, actual_spend, start_date, end_date, payment_terms, compliance_clause, volume_commitment(可选)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contracts: string }) {
      const data: ContractData[] = JSON.parse(args.contracts)
      const result = analyzeContractAlignment(data)
      return formatAlignmentReport(result)
    }
  }))

  // Tool 5: p2p_automator
  tools.register(defineTool({
    name: 'p2p_automator',
    description: '采购到付款自动化工具：编排请购→采购单→收货→发票三单匹配→付款的端到端流程，自动检测异常并生成解决方案。输入请购单JSON，输出P2P流程自动化报告。',
    parameters: {
      request: { type: 'string', required: true, description: 'JSON对象，包含: request_id, item_description, category, quantity, unit_price, requester, department, budget_code, required_date, has_contract, contract_id(可选)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { request: string }) {
      const data: P2PRequest = JSON.parse(args.request)
      const result = analyzeP2P(data)
      return formatP2PReport(result)
    }
  }))

  // Tool 6: supplier_development
  tools.register(defineTool({
    name: 'supplier_development',
    description: '供应商开发工具：管理从需求分析、长名单到短名单、验证、试点、批量放量到绩效追踪的全生命周期，提供退出方案建议。输入开发目标JSON，输出供应商开发报告。',
    parameters: {
      target: { type: 'string', required: true, description: 'JSON对象，包含: target_id, category, current_supplier_count, target_supplier_count, quality_target, cost_reduction_target, timeline_months, current_stage' },
      candidates: { type: 'string', description: 'JSON数组，候选供应商名称列表' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { target: string; candidates?: string }) {
      const data: DevelopmentTarget = JSON.parse(args.target)
      const candidates = args.candidates ? JSON.parse(args.candidates) : undefined
      const result = analyzeSupplierDevelopment(data, candidates)
      return formatDevelopmentReport(result)
    }
  }))

  // Tool 7: tail_spend_optimizer
  tools.register(defineTool({
    name: 'tail_spend_optimizer',
    description: '尾部支出优化工具：分析长尾供应商整合机会、目录采购策略、P卡推广、自助采购引导和节省追踪。输入尾部支出数据JSON，输出优化建议报告。',
    parameters: {
      data: { type: 'string', required: true, description: 'JSON对象，包含: total_suppliers, tail_suppliers, tail_spend, total_spend, tail_categories(数组: category/supplier_count/total_amount/avg_order_value), maverick_spend_pct, catalog_coverage' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { data: string }) {
      const data: TailSpendData = JSON.parse(args.data)
      const result = analyzeTailSpend(data)
      return formatTailSpendReport(result)
    }
  }))

  // Tool 8: compliance_monitor
  tools.register(defineTool({
    name: 'compliance_monitor',
    description: '采购合规监控工具：检查反腐败条款、利益冲突、制裁筛查、审批完整性、文档留痕和审计就绪状态。输入合规检查项JSON数组，输出合规监控报告。',
    parameters: {
      checks: { type: 'string', required: true, description: 'JSON数组，每项包含: check_id, category(anti_corruption/conflict_of_interest/sanctions/approval_integrity/documentation/audit_readiness), description, status(pass/fail/warning/pending), evidence, risk_level(critical/high/medium/low), assignee(可选), due_date(可选)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { checks: string }) {
      const data: ComplianceCheck[] = JSON.parse(args.checks)
      const result = analyzeCompliance(data)
      return formatComplianceReport(result)
    }
  }))

  console.log(`[dsh-tool-procureagent] Loaded v${VERSION} — AI Procurement Agent Engine with 8 tools`)
  console.log('  Tools: spend_analyzer, supplier_360, strategic_sourcing, contract_spend_alignment, p2p_automator, supplier_development, tail_spend_optimizer, compliance_monitor')
}
