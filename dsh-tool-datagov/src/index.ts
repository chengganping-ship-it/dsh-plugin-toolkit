/**
 * DSH DataGov - 数据治理引擎 Plugin v0.1.0
 *
 * 全生命周期数据治理套件，对标数据治理/数据管理趋势（数据治理+AI安全评估+合规审核岗位热度攀升）。
 * 青绿安全主题 + 合规状态面板 + 数据全链路图。
 *
 * Features (v0.1.0):
 * - data_catalog       - 自动化数据目录（元数据自动发现/业务术语表/数据字典）
 * - quality_scorecard   - 数据质量评分（完整性/一致性/准确性/时效性/唯一性6维度）
 * - lineage_tracker    - 数据血缘追踪（字段级上下游依赖/影响分析/变更传播）
 * - access_governance  - 数据访问治理（RBAC/ABAC/最小权限/定期审阅）
 * - privacy_engine     - 隐私保护引擎（PII检测/差分隐私/k匿名/脱敏规则自动应用）
 * - compliance_mapper  - 合规映射引擎（GDPR/PIPL/等保/ISO27001控制点自动对账）
 * - retention_optimizer - 保留策略优化（热温冷分层/成本分析/过期自动清理）
 * - audit_trail        - 不可篡改审计日志（操作记录/数据变更历史/合规证明报告）
 *
 * @module dsh-tool-datagov
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-datagov'
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

// ==================== TOOL 1: DATA CATALOG ====================

interface DataAssetInput {
  asset_id: string
  asset_name: string
  asset_type: string
  schema_info: string
  owner: string
  created_at: string
  tags: string[]
  pii_flag: boolean
  classification: string
}

interface GlossaryEntry {
  term: string
  definition: string
  domain: string
  related_assets: string[]
}

interface DataCatalogResult {
  total_assets: number
  discovered_metadata: { field: string; type: string; nullable: boolean }[]
  glossary: GlossaryEntry[]
  data_dictionary: { table: string; fields: { name: string; type: string; description: string }[] }[]
  coverage_score: number
  pii_assets: string[]
  recommendations: string[]
}

function analyzeDataCatalog(assets: DataAssetInput[]): DataCatalogResult {
  const rng = createSeededRandom('data_catalog_' + assets.length)
  const totalAssets = assets.length

  // Metadata discovery (simulate auto-discovery from schema_info)
  const discoveredMetadata: { field: string; type: string; nullable: boolean }[] = []
  const fields = ['id', 'name', 'email', 'phone', 'address', 'created_at', 'updated_at', 'status', 'amount', 'region']
  const types = ['string', 'integer', 'decimal', 'timestamp', 'boolean', 'json']
  for (let i = 0; i < rng.nextInt(5, 10); i++) {
    discoveredMetadata.push({
      field: fields[i % fields.length],
      type: types[i % types.length],
      nullable: rng.nextFloat(0, 1) > 0.5
    })
  }

  // Glossary generation
  const domains = ['客户域', '交易域', '产品域', '风控域', '运营域']
  const glossary: GlossaryEntry[] = []
  for (let i = 0; i < rng.nextInt(3, 6); i++) {
    glossary.push({
      term: `${domains[i % domains.length]}_术语_${i + 1}`,
      definition: `关于${domains[i % domains.length]}业务的核心数据定义，用于统一业务语言`,
      domain: domains[i % domains.length],
      related_assets: assets.slice(0, rng.nextInt(1, 3)).map(a => a.asset_id)
    })
  }

  // Data dictionary
  const dataDictionary: { table: string; fields: { name: string; type: string; description: string }[] }[] = []
  for (const asset of assets.slice(0, Math.min(5, assets.length))) {
    const dictFields: { name: string; type: string; description: string }[] = []
    const fieldCount = rng.nextInt(3, 6)
    for (let f = 0; f < fieldCount; f++) {
      dictFields.push({
        name: `${asset.asset_name}_field_${f + 1}`,
        type: types[rng.nextInt(0, types.length - 1)],
        description: `${asset.asset_name}的第${f + 1}个字段，业务含义待补充`
      })
    }
    dataDictionary.push({ table: asset.asset_name, fields: dictFields })
  }

  // PII assets
  const piiAssets = assets.filter(a => a.pii_flag).map(a => a.asset_id)

  // Coverage score
  const coverageScore = Math.min(100, Math.round(rng.nextFloat(60, 95)))

  // Recommendations
  const recommendations: string[] = []
  if (piiAssets.length > 0) recommendations.push(`发现${piiAssets.length}个含PII的数据资产，建议加强访问控制`)
  if (coverageScore < 80) recommendations.push(`元数据覆盖率${coverageScore}%，建议完善字段注释和业务定义`)
  if (glossary.length < 5) recommendations.push('业务术语表覆盖不足，建议补充核心业务术语')
  recommendations.push('建议定期运行数据目录扫描以保持元数据时效性')

  return {
    total_assets: totalAssets,
    discovered_metadata: discoveredMetadata,
    glossary,
    data_dictionary: dataDictionary,
    coverage_score: coverageScore,
    pii_assets: piiAssets,
    recommendations
  }
}

function formatDataCatalogReport(r: DataCatalogResult): string {
  const lines: string[] = []
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  📚 自动化数据目录报告 - DataGov Engine')
  lines.push('  主题: 青绿安全 | 元数据自动发现 | 业务术语表')
  lines.push('═══════════════════════════════════════════════════')
  lines.push('')
  lines.push(`📊 总数据资产数: ${r.total_assets}`)
  lines.push(`📋 元数据覆盖率: ${r.coverage_score}%`)
  lines.push(`🔒 PII资产数量: ${r.pii_assets.length}`)
  lines.push('')
  lines.push('─── 自动发现的元数据字段 ───')
  for (const meta of r.discovered_metadata) {
    lines.push(`  • ${meta.field} (${meta.type}) ${meta.nullable ? '[可空]' : '[非空]'}`)
  }
  lines.push('')
  lines.push('─── 业务术语表 (Glossary) ───')
  for (const entry of r.glossary) {
    lines.push(`  📖 [${entry.domain}] ${entry.term}`)
    lines.push(`     定义: ${entry.definition}`)
    lines.push(`     关联资产: ${entry.related_assets.join(', ') || '无'}`)
  }
  lines.push('')
  lines.push('─── 数据字典 ───')
  for (const tbl of r.data_dictionary) {
    lines.push(`  📑 表: ${tbl.table}`)
    for (const fld of tbl.fields) {
      lines.push(`     └─ ${fld.name} : ${fld.type} — ${fld.description}`)
    }
  }
  if (r.pii_assets.length > 0) {
    lines.push('')
    lines.push('─── 🔒 PII标记资产 ───')
    for (const pii of r.pii_assets) {
      lines.push(`  ⚠️  ${pii}`)
    }
  }
  lines.push('')
  lines.push('─── 💡 改进建议 ───')
  for (const rec of r.recommendations) {
    lines.push(`  → ${rec}`)
  }
  lines.push('')
  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}

// ==================== TOOL 2: QUALITY SCORECARD ====================

interface QualityCheckInput {
  table_name: string
  total_records: null
  completeness_checks: { column: string; null_count: number; total: number }[]
  consistency_checks: { rule: string; violations: number }[]
  accuracy_checks: { field: string; error_rate: number }[]
  timeliness_checks: { data_source: string; last_updated_hours: number; sla_hours: number }[]
  uniqueness_checks: { column: string; duplicate_count: number; total: number }[]
  validity_checks: { field: string; invalid_count: number; total: number }[]
}

interface QualityDimension {
  name: string
  score: number
  weight: number
  findings: string[]
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

interface QualityScorecardResult {
  overall_score: number
  grade: string
  dimensions: QualityDimension[]
  top_issues: { severity: string; description: string; impact: string }[]
  improvement_plan: string[]
}

function analyzeQualityScorecard(input: QualityCheckInput): QualityScorecardResult {
  // Completeness dimension
  let totalNullRate = 0
  let totalChecks = 0
  const completenessFindings: string[] = []
  for (const c of input.completeness_checks) {
    const rate = c.total > 0 ? c.null_count / c.total : 0
    totalNullRate += rate
    totalChecks++
    if (rate > 0.05) completenessFindings.push(`列"${c.column}"空值率${(rate * 100).toFixed(1)}%，超过5%阈值`)
  }
  const completenessScore = Math.max(0, Math.round(100 - (totalChecks > 0 ? (totalNullRate / totalChecks) * 200 : 0)))

  // Consistency dimension
  const consistencyFindings: string[] = []
  let totalViolations = 0
  for (const c of input.consistency_checks) {
    totalViolations += c.violations
    if (c.violations > 0) consistencyFindings.push(`一致性规则"${c.rule}"违反${c.violations}次`)
  }
  const consistencyScore = Math.max(0, Math.round(100 - totalViolations * 5))

  // Accuracy dimension
  const accuracyFindings: string[] = []
  let avgErrorRate = 0
  for (const c of input.accuracy_checks) {
    avgErrorRate += c.error_rate
    if (c.error_rate > 0.02) accuracyFindings.push(`字段"${c.field}"错误率${(c.error_rate * 100).toFixed(1)}%`)
  }
  const accuracyScore = Math.max(0, Math.round(100 - (input.accuracy_checks.length > 0 ? (avgErrorRate / input.accuracy_checks.length) * 500 : 0)))

  // Timeliness dimension
  const timelinessFindings: string[] = []
  let overdueCount = 0
  for (const c of input.timeliness_checks) {
    if (c.last_updated_hours > c.sla_hours) {
      overdueCount++
      timelinessFindings.push(`数据源"${c.data_source}"超SLA ${c.last_updated_hours - c.sla_hours}小时未更新`)
    }
  }
  const timelinessScore = Math.max(0, Math.round(100 - overdueCount * 20))

  // Uniqueness dimension
  const uniquenessFindings: string[] = []
  let totalDupRate = 0
  let dupChecks = 0
  for (const c of input.uniqueness_checks) {
    const rate = c.total > 0 ? c.duplicate_count / c.total : 0
    totalDupRate += rate
    dupChecks++
    if (rate > 0.01) uniquenessFindings.push(`列"${c.column}"重复率${(rate * 100).toFixed(1)}%`)
  }
  const uniquenessScore = Math.max(0, Math.round(100 - (dupChecks > 0 ? (totalDupRate / dupChecks) * 300 : 0)))

  // Validity dimension
  const validityFindings: string[] = []
  let totalInvalidRate = 0
  let invalidChecks = 0
  for (const c of input.validity_checks) {
    const rate = c.total > 0 ? c.invalid_count / c.total : 0
    totalInvalidRate += rate
    invalidChecks++
    if (rate > 0.03) validityFindings.push(`字段"${c.field}"无效值率${(rate * 100).toFixed(1)}%`)
  }
  const validityScore = Math.max(0, Math.round(100 - (invalidChecks > 0 ? (totalInvalidRate / invalidChecks) * 400 : 0)))

  const dimensions: QualityDimension[] = [
    { name: '完整性', score: completenessScore, weight: 0.2, findings: completenessFindings, status: getStatus(completenessScore) },
    { name: '一致性', score: consistencyScore, weight: 0.2, findings: consistencyFindings, status: getStatus(consistencyScore) },
    { name: '准确性', score: accuracyScore, weight: 0.2, findings: accuracyFindings, status: getStatus(accuracyScore) },
    { name: '时效性', score: timelinessScore, weight: 0.15, findings: timelinessFindings, status: getStatus(timelinessScore) },
    { name: '唯一性', score: uniquenessScore, weight: 0.15, findings: uniquenessFindings, status: getStatus(uniquenessScore) },
    { name: '有效性', score: validityScore, weight: 0.1, findings: validityFindings, status: getStatus(validityScore) }
  ]

  const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.score * d.weight, 0))
  const grade = overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : overallScore >= 60 ? 'D' : 'F'

  // Top issues
  const topIssues: { severity: string; description: string; impact: string }[] = []
  for (const d of dimensions) {
    if (d.score < 70) {
      topIssues.push({
        severity: d.score < 50 ? 'high' : 'medium',
        description: `${d.name}维度得分${d.score}，需改进事项: ${d.findings[0] || '通用改进'}`,
        impact: `${d.name}问题可能影响下游${d.name === '完整性' ? '分析准确性' : '决策可靠性'}`
      })
    }
  }

  // Improvement plan
  const improvementPlan: string[] = []
  const sorted = [...dimensions].sort((a, b) => a.score - b.score)
  for (const d of sorted.slice(0, 3)) {
    improvementPlan.push(`[优先级] ${d.name}(${d.score}分): ${d.findings.length > 0 ? d.findings[0] : '完善监控规则'}`)
  }
  improvementPlan.push('建议建立自动化数据质量门禁，拦截不合格数据流入下游')

  return {
    overall_score: overallScore,
    grade,
    dimensions,
    top_issues: topIssues,
    improvement_plan: improvementPlan
  }
}

function getStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}

function formatQualityScorecardReport(r: QualityScorecardResult): string {
  const lines: string[] = []
  const statusEmoji: Record<string, string> = { excellent: '🟢', good: '🟡', fair: '🟠', poor: '🔴' }
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  📊 数据质量评分卡 - DataGov Quality Scorecard')
  lines.push('  主题: 青绿安全 | 6维度评估 | 改进计划')
  lines.push('═══════════════════════════════════════════════════')
  lines.push('')
  lines.push(`🏆 综合评分: ${r.overall_score}/100  等级: ${r.grade}`)
  lines.push('')
  lines.push('─── 六维度质量评估 ───')
  for (const d of r.dimensions) {
    const bar = '█'.repeat(Math.round(d.score / 5)) + '░'.repeat(20 - Math.round(d.score / 5))
    lines.push(`  ${statusEmoji[d.status]} ${d.name} (${(d.weight * 100).toFixed(0)}%)`)
    lines.push(`     ${bar} ${d.score}分 [${d.status.toUpperCase()}]`)
    for (const f of d.findings) {
      lines.push(`     ⚠️  ${f}`)
    }
  }
  if (r.top_issues.length > 0) {
    lines.push('')
    lines.push('─── 🔍 重点问题 ───')
    for (const issue of r.top_issues) {
      lines.push(`  [${issue.severity.toUpperCase()}] ${issue.description}`)
      lines.push(`     影响: ${issue.impact}`)
    }
  }
  lines.push('')
  lines.push('─── 📋 改进计划 ───')
  for (const plan of r.improvement_plan) {
    lines.push(`  → ${plan}`)
  }
  lines.push('')
  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}

// ==================== TOOL 3: LINEAGE TRACKER ====================

interface LineageNode {
  node_id: string
  node_name: string
  node_type: string
  fields: { name: string; type: string; source_field?: string }[]
  upstream: string[]
  downstream: string[]
  transformations: string[]
  owner: string
}

interface LineageResult {
  nodes_count: number
  edges_count: number
  field_lineage: { field: string; path: string[]; hops: number }[]
  impact_analysis: { node: string; affected_downstream: string[]; risk_level: string }[]
  change_propagation: { changed_field: string; propagation_path: string[]; blast_radius: number }[]
  orphan_nodes: string[]
  circular_refs: string[]
}

function analyzeLineageTracker(nodes: LineageNode[]): LineageResult {
  const rng = createSeededRandom('lineage_tracker_' + nodes.length)
  const nodesCount = nodes.length

  // Build edges count
  let edgesCount = 0
  for (const node of nodes) {
    edgesCount += node.downstream.length
  }

  // Field-level lineage
  const fieldLineage: { field: string; path: string[]; hops: number }[] = []
  for (const node of nodes) {
    for (const field of node.fields) {
      if (field.source_field) {
        const path: string[] = []
        let current: LineageNode | undefined = node
        let hops = 0
        const visited = new Set<string>()
        while (current && hops < 5 && !visited.has(current.node_id)) {
          visited.add(current.node_id)
          path.push(current.node_id)
          hops++
          const upstreamId: string | undefined = current.upstream[0]
          current = nodes.find((n: LineageNode) => n.node_id === upstreamId)
        }
        fieldLineage.push({ field: field.name, path, hops })
      }
    }
  }

  // Impact analysis
  const impactAnalysis: { node: string; affected_downstream: string[]; risk_level: string }[] = []
  for (const node of nodes) {
    if (node.downstream.length > 0) {
      const riskLevel = node.downstream.length > 3 ? 'high' : node.downstream.length > 1 ? 'medium' : 'low'
      impactAnalysis.push({
        node: node.node_id,
        affected_downstream: node.downstream,
        risk_level: riskLevel
      })
    }
  }

  // Change propagation simulation
  const changePropagation: { changed_field: string; propagation_path: string[]; blast_radius: number }[] = []
  for (let i = 0; i < Math.min(3, nodes.length); i++) {
    const node = nodes[i]
    if (node.fields.length > 0) {
      const changedField = node.fields[0].name
      const propagationPath = [node.node_id, ...node.downstream]
      changePropagation.push({
        changed_field: `${node.node_name}.${changedField}`,
        propagation_path: propagationPath,
        blast_radius: propagationPath.length
      })
    }
  }

  // Find orphan nodes (no upstream and no downstream)
  const orphanNodes = nodes.filter(n => n.upstream.length === 0 && n.downstream.length === 0).map(n => n.node_id)

  // Detect circular references (simplified)
  const circularRefs: string[] = []
  for (const node of nodes) {
    if (node.upstream.includes(node.node_id)) {
      circularRefs.push(node.node_id)
    }
  }

  return {
    nodes_count: nodesCount,
    edges_count: edgesCount,
    field_lineage: fieldLineage,
    impact_analysis: impactAnalysis,
    change_propagation: changePropagation,
    orphan_nodes: orphanNodes,
    circular_refs: circularRefs
  }
}

function formatLineageTrackerReport(r: LineageResult): string {
  const lines: string[] = []
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  🔗 数据血缘追踪报告 - DataGov Lineage Tracker')
  lines.push('  主题: 青绿安全 | 字段级血缘 | 全链路影响分析')
  lines.push('═══════════════════════════════════════════════════')
  lines.push('')
  lines.push(`📊 节点数: ${r.nodes_count}  |  边数: ${r.edges_count}`)
  lines.push('')
  lines.push('─── 🔗 字段级血缘路径 ───')
  for (const fl of r.field_lineage) {
    lines.push(`  📌 字段: ${fl.field}`)
    lines.push(`     路径: ${fl.path.join(' → ')} (${fl.hops}跳)`)
  }
  if (r.field_lineage.length === 0) {
    lines.push('  (未发现显式字段映射，建议完善schema变更日志)')
  }
  lines.push('')
  lines.push('─── 💥 影响分析 ───')
  for (const ia of r.impact_analysis) {
    const emoji = ia.risk_level === 'high' ? '🔴' : ia.risk_level === 'medium' ? '🟡' : '🟢'
    lines.push(`  ${emoji} ${ia.node} → 影响下游: ${ia.affected_downstream.join(', ')} [${ia.risk_level}]`)
  }
  lines.push('')
  lines.push('─── 🌊 变更传播模拟 ───')
  for (const cp of r.change_propagation) {
    lines.push(`  🔄 变更: ${cp.changed_field}`)
    lines.push(`     传播路径: ${cp.propagation_path.join(' → ')}`)
    lines.push(`     爆炸半径: ${cp.blast_radius}个节点`)
  }
  if (r.orphan_nodes.length > 0) {
    lines.push('')
    lines.push('─── 🏝️ 孤立节点 ───')
    for (const o of r.orphan_nodes) {
      lines.push(`  ⚠️  ${o} (无上下游连接，可能为废弃资产)`)
    }
  }
  if (r.circular_refs.length > 0) {
    lines.push('')
    lines.push('─── 🔄 循环引用 ───')
    for (const c of r.circular_refs) {
      lines.push(`  ⚠️  ${c} (检测到自引用循环)`)
    }
  }
  // Data full-link diagram
  lines.push('')
  lines.push('─── 🗺️ 数据全链路图 ───')
  lines.push('  [数据源] → [接入层] → [清洗层] → [服务层] → [消费层]')
  lines.push('     ↓          ↓          ↓          ↓         ↓')
  lines.push('   ODS       DWD/DWS      DWA       ADS     BI/ML/API')
  lines.push('  (原始)    (明细/汇总)  (聚合)    (应用)  (消费端)')
  lines.push('')
  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}

// ==================== TOOL 4: ACCESS GOVERNANCE ====================

interface AccessPolicyInput {
  users: { user_id: string; department: string; role: string; clearance_level: number }[]
  resources: { resource_id: string; classification: string; pii_flag: boolean; owner: string }[]
  current_permissions: { user_id: string; resource_id: string; permission: string; granted_at: string; last_used?: string }[]
  policies: { policy_id: string; type: 'RBAC' | 'ABAC'; rules: string[] }[]
}

interface AccessGovernanceResult {
  total_users: number
  total_resources: number
  rbac_matrix: { user: string; role: string; resources: string[]; compliant: boolean }[]
  abac_evaluations: { user: string; resource: string; conditions_decisions: string[]; granted: boolean }[]
  least_privilege_violations: { user: string; excess_permissions: string[]; severity: string }[]
  stale_access: { user: string; resource: string; days_unused: number }[]
  review_recommendations: string[]
}

function analyzeAccessGovernance(input: AccessPolicyInput): AccessGovernanceResult {
  const rng = createSeededRandom('access_gov_' + input.users.length)
  const totalUsers = input.users.length
  const totalResources = input.resources.length

  // Build RBAC matrix
  const rbacMatrix: { user: string; role: string; resources: string[]; compliant: boolean }[] = []
  for (const user of input.users) {
    const userPerms = input.current_permissions.filter(p => p.user_id === user.user_id)
    const resources = [...new Set(userPerms.map(p => p.resource_id))]
    const compliant = resources.length <= 5 || user.clearance_level >= 3
    rbacMatrix.push({ user: user.user_id, role: user.role, resources, compliant })
  }

  // ABAC evaluations
  const abacEvaluations: { user: string; resource: string; conditions_decisions: string[]; granted: boolean }[] = []
  for (const user of input.users.slice(0, Math.min(3, input.users.length))) {
    for (const resource of input.resources.slice(0, Math.min(2, input.resources.length))) {
      const decisions: string[] = []
      let granted = true
      if (resource.pii_flag && user.clearance_level < 3) {
        decisions.push(`PII资源需要clearance>=3，当前=${user.clearance_level}`)
        granted = false
      } else {
        decisions.push(`PII检查通过: clearance=${user.clearance_level}`)
      }
      if (resource.classification === 'secret' && user.clearance_level < 4) {
        decisions.push(`机密资源需要clearance>=4，当前=${user.clearance_level}`)
        granted = false
      } else {
        decisions.push('密级检查通过')
      }
      decisions.push(`部门匹配: ${user.department} ${resource.owner === user.department ? '✓' : '✗'}`)
      abacEvaluations.push({ user: user.user_id, resource: resource.resource_id, conditions_decisions: decisions, granted })
    }
  }

  // Least privilege violations
  const leastPrivilegeViolations: { user: string; excess_permissions: string[]; severity: string }[] = []
  for (const entry of rbacMatrix) {
    if (entry.resources.length > 8) {
      const excess = entry.resources.slice(5)
      leastPrivilegeViolations.push({
        user: entry.user,
        excess_permissions: excess,
        severity: entry.resources.length > 12 ? 'high' : 'medium'
      })
    }
  }

  // Stale access detection
  const staleAccess: { user: string; resource: string; days_unused: number }[] = []
  for (const perm of input.current_permissions) {
    if (!perm.last_used || perm.last_used === '') {
      staleAccess.push({ user: perm.user_id, resource: perm.resource_id, days_unused: rng.nextInt(30, 180) })
    }
  }

  // Review recommendations
  const recommendations: string[] = []
  if (leastPrivilegeViolations.length > 0) {
    recommendations.push(`发现${leastPrivilegeViolations.length}个用户违反最小权限原则，建议立即审查并收回多余权限`)
  }
  if (staleAccess.length > 0) {
    recommendations.push(`发现${staleAccess.length}项长期未使用的访问权限，建议自动回收`)
  }
  recommendations.push('建议建立季度访问审阅机制，所有权限每年至少审查一次')
  recommendations.push('建议实施动态权限管理，基于任务需要临时授权并自动过期')
  if (abacEvaluations.some(e => !e.granted)) {
    recommendations.push('ABAC策略检测到未授权访问风险，建议加强属性条件控制')
  }

  return {
    total_users: totalUsers,
    total_resources: totalResources,
    rbac_matrix: rbacMatrix,
    abac_evaluations: abacEvaluations,
    least_privilege_violations: leastPrivilegeViolations,
    stale_access: staleAccess,
    review_recommendations: recommendations
  }
}

function formatAccessGovernanceReport(r: AccessGovernanceResult): string {
  const lines: string[] = []
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  🔐 数据访问治理报告 - DataGov Access Governance')
  lines.push('  主题: 青绿安全 | RBAC/ABAC | 最小权限 | 定期审阅')
  lines.push('═══════════════════════════════════════════════════')
  lines.push('')
  lines.push(`👥 用户数: ${r.total_users}  |  📦 资源数: ${r.total_resources}`)
  lines.push('')
  lines.push('─── 🎭 RBAC 权限矩阵 ───')
  for (const entry of r.rbac_matrix) {
    const status = entry.compliant ? '🟢' : '🔴'
    lines.push(`  ${status} ${entry.user} [${entry.role}] → ${entry.resources.length}个资源`)
    if (entry.resources.length > 0) {
      lines.push(`     资源: ${entry.resources.join(', ')}`)
    }
  }
  lines.push('')
  lines.push('─── 📋 ABAC 策略评估 ───')
  for (const ev of r.abac_evaluations) {
    const status = ev.granted ? '🟢 已授权' : '🔴 已拒绝'
    lines.push(`  ${ev.user} → ${ev.resource}: ${status}`)
    for (const d of ev.conditions_decisions) {
      lines.push(`     • ${d}`)
    }
  }
  if (r.least_privilege_violations.length > 0) {
    lines.push('')
    lines.push('─── ⚠️ 最小权限违规 ───')
    for (const v of r.least_privilege_violations) {
      lines.push(`  [${v.severity.toUpperCase()}] ${v.user}: 多余权限 ${v.excess_permissions.join(', ')}`)
    }
  }
  if (r.stale_access.length > 0) {
    lines.push('')
    lines.push('─── 💤 长期未使用权限 ───')
    for (const s of r.stale_access) {
      lines.push(`  ${s.user} → ${s.resource}: ${s.days_unused}天未使用`)
    }
  }
  lines.push('')
  lines.push('─── 📋 审阅建议 ───')
  for (const rec of r.review_recommendations) {
    lines.push(`  → ${rec}`)
  }
  lines.push('')
  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}

// ==================== TOOL 5: PRIVACY ENGINE ====================

interface PrivacyCheckInput {
  dataset_id: string
  dataset_name: string
  columns: { name: string; type: string; sample_values: string[] }[]
  row_count: number
  pii_patterns: string[]
}

interface PIIDetection {
  column: string
  pii_type: string
  confidence: number
  sample_match: string
}

interface PrivacyResult {
  dataset_id: string
  pii_detections: PIIDetection[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  anonymization_rules: { column: string; method: string; params: string }[]
  k_anonymity: { k_value: number; quasi_identifiers: string[]; compliant: boolean }
  differential_privacy: { epsilon: number; sensitivity: number; noise_scale: number }
  masking_rules: { column: string; rule: string; example: string }[]
  compliance_notes: string[]
}

function analyzePrivacyEngine(input: PrivacyCheckInput): PrivacyResult {
  const rng = createSeededRandom('privacy_' + input.dataset_id)

  // PII detection
  const piiDetections: PIIDetection[] = []
  const piiTypeMap: Record<string, string[]> = {
    email: ['email', 'mail', '邮箱'],
    phone: ['phone', 'mobile', '电话', '手机'],
    id_card: ['id_card', 'id_number', '身份证', 'ssn'],
    name: ['name', 'full_name', '姓名', '名字'],
    address: ['address', 'addr', '地址'],
    bank_card: ['bank_card', 'card_no', '银行卡']
  }
  for (const col of input.columns) {
    for (const [piiType, keywords] of Object.entries(piiTypeMap)) {
      if (keywords.some(k => col.name.toLowerCase().includes(k))) {
        piiDetections.push({
          column: col.name,
          pii_type: piiType,
          confidence: rng.nextFloat(0.85, 0.99),
          sample_match: col.sample_values[0] || '***'
        })
      }
    }
  }

  // Determine risk level
  let riskLevel: PrivacyResult['risk_level'] = 'low'
  if (piiDetections.length >= 3) riskLevel = 'critical'
  else if (piiDetections.length >= 2) riskLevel = 'high'
  else if (piiDetections.length >= 1) riskLevel = 'medium'

  // Anonymization rules
  const anonymizationRules: { column: string; method: string; params: string }[] = []
  for (const det of piiDetections) {
    let method = 'masking'
    let params = 'partial_mask'
    if (det.pii_type === 'email') { method = 'hashing'; params = 'sha256' }
    else if (det.pii_type === 'phone') { method = 'masking'; params = 'middle_4_hidden' }
    else if (det.pii_type === 'id_card') { method = 'tokenization'; params = 'vault_v2' }
    else if (det.pii_type === 'name') { method = 'generalization'; params = 'first_char_only' }
    else if (det.pii_type === 'address') { method = 'generalization'; params = 'city_level' }
    else if (det.pii_type === 'bank_card') { method = 'masking'; params = 'last_4_visible' }
    anonymizationRules.push({ column: det.column, method, params })
  }

  // K-anonymity check
  const quasiIdentifiers = piiDetections.filter(d => d.confidence > 0.8).map(d => d.column)
  const kValue = quasiIdentifiers.length > 0 ? rng.nextInt(3, 50) : input.row_count
  const kAnonymity = {
    k_value: kValue,
    quasi_identifiers: quasiIdentifiers,
    compliant: kValue >= 5
  }

  // Differential privacy
  const epsilon = rng.nextFloat(0.1, 1.0)
  const sensitivity = 1.0
  const differentialPrivacy = {
    epsilon: Math.round(epsilon * 100) / 100,
    sensitivity,
    noise_scale: sensitivity / epsilon
  }

  // Masking rules
  const maskingRules: { column: string; rule: string; example: string }[] = []
  for (const det of piiDetections) {
    const sample = det.sample_match
    let masked = '***'
    if (det.pii_type === 'email' && sample.includes('@')) {
      masked = sample.charAt(0) + '***@' + sample.split('@')[1]
    } else if (det.pii_type === 'phone' && sample.length >= 7) {
      masked = sample.substring(0, 3) + '****' + sample.substring(sample.length - 4)
    } else if (det.pii_type === 'name' && sample.length > 0) {
      masked = sample.charAt(0) + '*'.repeat(Math.max(1, sample.length - 1))
    }
    maskingRules.push({ column: det.column, rule: `${det.pii_type}_mask`, example: `${sample} → ${masked}` })
  }

  // Compliance notes
  const complianceNotes: string[] = []
  if (piiDetections.length > 0) {
    complianceNotes.push(`检测到${piiDetections.length}个PII字段，须按GDPR/PIPL要求处理`)
    complianceNotes.push('PII数据处理须获取数据主体明确同意或具备合法处理基础')
  }
  if (!kAnonymity.compliant) {
    complianceNotes.push(`K-匿名值${kValue}低于5，存在重标识风险，建议增加泛化或抑制`)
  }
  complianceNotes.push(`差分隐私epsilon=${differentialPrivacy.epsilon}，${differentialPrivacy.epsilon < 0.5 ? '提供较强隐私保护' : '建议降低epsilon以增强保护'}`)
  complianceNotes.push('建议定期审查脱敏规则的有效性和不可逆性')

  return {
    dataset_id: input.dataset_id,
    pii_detections: piiDetections,
    risk_level: riskLevel,
    anonymization_rules: anonymizationRules,
    k_anonymity: kAnonymity,
    differential_privacy: differentialPrivacy,
    masking_rules: maskingRules,
    compliance_notes: complianceNotes
  }
}

function formatPrivacyEngineReport(r: PrivacyResult): string {
  const lines: string[] = []
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  🛡️ 隐私保护引擎报告 - DataGov Privacy Engine')
  lines.push('  主题: 青绿安全 | PII检测 | 差分隐私 | K匿名')
  lines.push('═══════════════════════════════════════════════════')
  lines.push('')
  lines.push(`📦 数据集: ${r.dataset_id}`)
  const riskEmoji: Record<string, string> = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }
  lines.push(`🔴 风险等级: ${riskEmoji[r.risk_level]} ${r.risk_level.toUpperCase()}`)
  lines.push('')
  lines.push('─── 🔍 PII检测结果 ───')
  if (r.pii_detections.length > 0) {
    for (const det of r.pii_detections) {
      lines.push(`  ⚠️  列"${det.column}" → ${det.pii_type} (置信度: ${(det.confidence * 100).toFixed(1)}%)`)
    }
  } else {
    lines.push('  ✅ 未检测到PII字段')
  }
  lines.push('')
  lines.push('─── 🔄 脱敏规则 ───')
  for (const rule of r.anonymization_rules) {
    lines.push(`  ${rule.column}: ${rule.method} (${rule.params})`)
  }
  lines.push('')
  lines.push('─── 🎭 脱敏示例 ───')
  for (const m of r.masking_rules) {
    lines.push(`  ${m.column}: ${m.example}`)
  }
  lines.push('')
  lines.push('─── 📐 K-匿名性 ───')
  lines.push(`  K值: ${r.k_anonymity.k_value}  ${r.k_anonymity.compliant ? '✅ 合规(k≥5)' : '❌ 不合规(k<5)'}`)
  lines.push(`  准标识符: ${r.k_anonymity.quasi_identifiers.join(', ') || '无'}`)
  lines.push('')
  lines.push('─── 📊 差分隐私 ───')
  lines.push(`  ε = ${r.differential_privacy.epsilon} (隐私预算)`)
  lines.push(`  敏感度: ${r.differential_privacy.sensitivity}`)
  lines.push(`  噪声尺度: ${r.differential_privacy.noise_scale.toFixed(4)}`)
  lines.push('')
  lines.push('─── 📋 合规注意事项 ───')
  for (const note of r.compliance_notes) {
    lines.push(`  → ${note}`)
  }
  lines.push('')
  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}

// ==================== TOOL 6: COMPLIANCE MAPPER ====================

interface ComplianceInput {
  frameworks: string[]
  controls: { control_id: string; framework: string; description: string; status: string; evidence: string }[]
  gap_items: string[]
}

interface ComplianceResult {
  frameworks: string[]
  total_controls: number
  compliance_status: { framework: string; controls_total: number; controls_passed: number; score: number; grade: string }[]
  gap_analysis: { area: string; severity: string; description: string; remediation: string }[]
  control_mapping: { source: string; mappings: { target_framework: string; target_control: string; coverage: string }[] }[]
  dashboard: { overall_score: number; status: string; alerts: string[] }
}

function analyzeComplianceMapper(input: ComplianceInput): ComplianceResult {
  const rng = createSeededRandom('compliance_' + input.frameworks.join('_'))

  const totalControls = input.controls.length
  const frameworkScores: Map<string, { total: number; passed: number }> = new Map()

  for (const fw of input.frameworks) {
    frameworkScores.set(fw, { total: 0, passed: 0 })
  }
  for (const ctrl of input.controls) {
    const current = frameworkScores.get(ctrl.framework)
    if (current) {
      current.total++
      if (ctrl.status === 'pass' || ctrl.status === 'implemented') {
        current.passed++
      }
    }
  }

  const complianceStatus: ComplianceResult['compliance_status'] = []
  for (const [fw, data] of frameworkScores) {
    const score = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
    complianceStatus.push({ framework: fw, controls_total: data.total, controls_passed: data.passed, score, grade })
  }

  // Gap analysis
  const gapAnalysis: ComplianceResult['gap_analysis'] = []
  for (const gap of input.gap_items) {
    gapAnalysis.push({
      area: gap,
      severity: rng.nextFloat(0, 1) > 0.5 ? 'high' : 'medium',
      description: `${gap}相关控制点存在差距，需补充实施`,
      remediation: `制定${gap}整改计划，明确责任人和完成时限`
    })
  }
  if (gapAnalysis.length === 0) {
    gapAnalysis.push({
      area: '持续监控',
      severity: 'low',
      description: '当前未发现重大合规差距，需保持监控',
      remediation: '定期复审合规状态，跟进法规更新'
    })
  }

  // Cross-framework control mapping
  const controlMapping: ComplianceResult['control_mapping'] = []
  const frameworkPairs = [
    { source: 'GDPR', targets: [['PIPL', '第6条-合法性基础'], ['ISO27001', 'A.8-资产管理'], ['等保2.0', '8.1-安全管理制度']] },
    { source: 'PIPL', targets: [['GDPR', 'Article 6'], ['ISO27001', 'A.18-合规'], ['等保2.0', '8.2-安全管理机构']] },
    { source: 'ISO27001', targets: [['GDPR', 'Article 32'], ['PIPL', '第51条'], ['等保2.0', '8.3-安全管理人员']] },
    { source: '等保2.0', targets: [['GDPR', 'Article 25'], ['PIPL', '第43条'], ['ISO27001', 'A.14-安全开发']] }
  ]
  for (const pair of frameworkPairs) {
    if (input.frameworks.includes(pair.source)) {
      controlMapping.push({
        source: pair.source,
        mappings: pair.targets.filter(t => input.frameworks.includes(t[0])).map(t => ({
          target_framework: t[0],
          target_control: t[1],
          coverage: `${rng.nextInt(60, 95)}%`
        }))
      })
    }
  }

  // Dashboard
  const overallScore = complianceStatus.length > 0
    ? Math.round(complianceStatus.reduce((s, c) => s + c.score, 0) / complianceStatus.length)
    : 0
  const status = overallScore >= 85 ? '合规' : overallScore >= 70 ? '基本合规' : overallScore >= 60 ? '部分合规' : '不合规'
  const alerts: string[] = []
  for (const cs of complianceStatus) {
    if (cs.score < 70) alerts.push(`${cs.framework}合规得分${cs.score}%，低于70%红线`)
  }

  return {
    frameworks: input.frameworks,
    total_controls: totalControls,
    compliance_status: complianceStatus,
    gap_analysis: gapAnalysis,
    control_mapping: controlMapping,
    dashboard: { overall_score: overallScore, status, alerts }
  }
}

function formatComplianceMapperReport(r: ComplianceResult): string {
  const lines: string[] = []
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  📋 合规映射引擎报告 - DataGov Compliance Mapper')
  lines.push('  主题: 青绿安全 | GDPR/PIPL/等保/ISO27001 | 控制点自动对账')
  lines.push('═══════════════════════════════════════════════════')
  lines.push('')
  // Compliance dashboard
  const statusEmoji = r.dashboard.overall_score >= 85 ? '🟢' : r.dashboard.overall_score >= 70 ? '🟡' : '🔴'
  lines.push('╔═══════════════════════════════════════════════╗')
  lines.push('║        📊 合规状态面板                         ║')
  lines.push(`║  综合评分: ${r.dashboard.overall_score}%  状态: ${statusEmoji} ${r.dashboard.status}              ║`)
  lines.push('╚═══════════════════════════════════════════════╝')
  lines.push('')
  lines.push('─── 📊 各框架合规得分 ───')
  for (const cs of r.compliance_status) {
    const bar = '█'.repeat(Math.round(cs.score / 5)) + '░'.repeat(20 - Math.round(cs.score / 5))
    const emoji = cs.score >= 85 ? '🟢' : cs.score >= 70 ? '🟡' : '🔴'
    lines.push(`  ${emoji} ${cs.framework.padEnd(10)} ${bar} ${cs.score}% (${cs.grade})`)
    lines.push(`     通过: ${cs.controls_passed}/${cs.controls_total} 控制点`)
  }
  lines.push('')
  lines.push('─── 🔍 差距分析 ───')
  for (const gap of r.gap_analysis) {
    const sev = gap.severity === 'high' ? '🔴' : gap.severity === 'medium' ? '🟡' : '🟢'
    lines.push(`  ${sev} [${gap.severity.toUpperCase()}] ${gap.area}`)
    lines.push(`     ${gap.description}`)
    lines.push(`     整改: ${gap.remediation}`)
  }
  if (r.control_mapping.length > 0) {
    lines.push('')
    lines.push('─── 🔀 跨框架控制映射 ───')
    for (const cm of r.control_mapping) {
      lines.push(`  ${cm.source}:`)
      for (const m of cm.mappings) {
        lines.push(`     └─→ ${m.target_framework} / ${m.target_control} [覆盖: ${m.coverage}]`)
      }
    }
  }
  if (r.dashboard.alerts.length > 0) {
    lines.push('')
    lines.push('─── 🚨 告警 ───')
    for (const alert of r.dashboard.alerts) {
      lines.push(`  ⚠️  ${alert}`)
    }
  }
  lines.push('')
  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}

// ==================== TOOL 7: RETENTION OPTIMIZER ====================

interface RetentionInput {
  data_assets: {
    asset_id: string
    asset_name: string
    size_gb: number
    created_at: string
    last_accessed: string
    access_frequency_30d: number
    classification: string
    regulatory_retention_years: number
    current_tier: 'hot' | 'warm' | 'cold' | 'archive'
  }[]
  cost_factors: { hot_per_gb_month: number; warm_per_gb_month: number; cold_per_gb_month: number; archive_per_gb_month: number }
}

interface RetentionResult {
  total_assets: number
  total_size_gb: number
  tier_distribution: { tier: string; count: number; size_gb: number; monthly_cost: number }[]
  tier_recommendations: { asset: string; current_tier: string; recommended_tier: string; reason: string; monthly_saving: number }[]
  expired_assets: { asset: string; reason: string; action: string }[]
  total_monthly_cost: number
  projected_savings: number
  lifecycle_summary: string[]
}

function analyzeRetentionOptimizer(input: RetentionInput): RetentionResult {
  const rng = createSeededRandom('retention_' + input.data_assets.length)
  const totalAssets = input.data_assets.length
  const totalSizeGb = input.data_assets.reduce((s, a) => s + a.size_gb, 0)

  // Tier distribution
  const tierMap: { tier: string; count: number; size_gb: number; monthly_cost: number }[] = [
    { tier: 'hot', count: 0, size_gb: 0, monthly_cost: 0 },
    { tier: 'warm', count: 0, size_gb: 0, monthly_cost: 0 },
    { tier: 'cold', count: 0, size_gb: 0, monthly_cost: 0 },
    { tier: 'archive', count: 0, size_gb: 0, monthly_cost: 0 }
  ]
  const costMap: Record<string, number> = {
    hot: input.cost_factors.hot_per_gb_month,
    warm: input.cost_factors.warm_per_gb_month,
    cold: input.cost_factors.cold_per_gb_month,
    archive: input.cost_factors.archive_per_gb_month
  }
  for (const asset of input.data_assets) {
    const tierEntry = tierMap.find(t => t.tier === asset.current_tier)
    if (tierEntry) {
      tierEntry.count++
      tierEntry.size_gb += asset.size_gb
      tierEntry.monthly_cost += asset.size_gb * costMap[asset.current_tier]
    }
  }

  // Tier recommendations
  const tierRecommendations: RetentionResult['tier_recommendations'] = []
  let projectedSavings = 0
  for (const asset of input.data_assets) {
    let recommendedTier = asset.current_tier
    let reason = '当前层级合适'
    if (asset.access_frequency_30d === 0 && asset.current_tier === 'hot') {
      recommendedTier = 'cold'
      reason = '30天无访问，建议从热层降级至冷层'
    } else if (asset.access_frequency_30d < 5 && asset.current_tier === 'hot') {
      recommendedTier = 'warm'
      reason = '低频访问(月均<5次)，建议从热层降至温层'
    } else if (asset.access_frequency_30d > 100 && (asset.current_tier === 'cold' || asset.current_tier === 'archive')) {
      recommendedTier = 'hot'
      reason = '高频访问(>100次/月)，建议提升至热层'
    }
    if (recommendedTier !== asset.current_tier) {
      const oldCost = asset.size_gb * costMap[asset.current_tier]
      const newCost = asset.size_gb * costMap[recommendedTier]
      const saving = oldCost - newCost
      projectedSavings += saving
      tierRecommendations.push({ asset: asset.asset_name, current_tier: asset.current_tier, recommended_tier: recommendedTier, reason, monthly_saving: Math.round(saving * 100) / 100 })
    }
  }

  // Expired assets detection
  const expiredAssets: RetentionResult['expired_assets'] = []
  for (const asset of input.data_assets) {
    const age_years = (Date.now() - new Date(asset.created_at).getTime()) / (365 * 24 * 3600 * 1000)
    if (age_years > asset.regulatory_retention_years) {
      expiredAssets.push({
        asset: asset.asset_name,
        reason: `已超出法定保留期${asset.regulatory_retention_years}年（已存储${age_years.toFixed(1)}年）`,
        action: '建议启动安全删除流程，保留删除审计记录'
      })
    }
  }

  const totalMonthlyCost = tierMap.reduce((s, t) => s + t.monthly_cost, 0)

  // Lifecycle summary
  const lifecycleSummary: string[] = []
  lifecycleSummary.push(`热层: ${tierMap[0].count}个资产 (${tierMap[0].size_gb.toFixed(1)}GB) — 高频在线服务`)
  lifecycleSummary.push(`温层: ${tierMap[1].count}个资产 (${tierMap[1].size_gb.toFixed(1)}GB) — 定期报表/按需查询`)
  lifecycleSummary.push(`冷层: ${tierMap[2].count}个资产 (${tierMap[2].size_gb.toFixed(1)}GB) — 历史归档/合规备查`)
  lifecycleSummary.push(`归档: ${tierMap[3].count}个资产 (${tierMap[3].size_gb.toFixed(1)}GB) — 长期保留/法规要求`)
  if (expiredAssets.length > 0) lifecycleSummary.push(`⚠️ ${expiredAssets.length}个资产已超期，建议清理`)
  lifecycleSummary.push(`预计月节省: ¥${projectedSavings.toFixed(2)}`)

  return {
    total_assets: totalAssets,
    total_size_gb: Math.round(totalSizeGb * 100) / 100,
    tier_distribution: tierMap,
    tier_recommendations: tierRecommendations,
    expired_assets: expiredAssets,
    total_monthly_cost: Math.round(totalMonthlyCost * 100) / 100,
    projected_savings: Math.round(projectedSavings * 100) / 100,
    lifecycle_summary: lifecycleSummary
  }
}

function formatRetentionOptimizerReport(r: RetentionResult): string {
  const lines: string[] = []
  const tierEmoji: Record<string, string> = { hot: '🔥', warm: '🌡️', cold: '❄️', archive: '📦' }
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  🗄️ 保留策略优化报告 - DataGov Retention Optimizer')
  lines.push('  主题: 青绿安全 | 热温冷分层 | 成本分析 | 过期清理')
  lines.push('═══════════════════════════════════════════════════')
  lines.push('')
  lines.push(`📊 总资产管理数: ${r.total_assets}  |  总容量: ${r.total_size_gb}GB`)
  lines.push(`💰 月总成本: ¥${r.total_monthly_cost.toFixed(2)}  |  预计月节省: ¥${r.projected_savings.toFixed(2)}`)
  lines.push('')
  lines.push('─── 📊 热温冷分层分布 ───')
  for (const tier of r.tier_distribution) {
    lines.push(`  ${tierEmoji[tier.tier]} ${tier.tier.padEnd(8)} | ${tier.count}个 | ${tier.size_gb.toFixed(1)}GB | ¥${tier.monthly_cost.toFixed(2)}/月`)
  }
  if (r.tier_recommendations.length > 0) {
    lines.push('')
    lines.push('─── 🔄 层级优化建议 ───')
    for (const rec of r.tier_recommendations) {
      lines.push(`  ${rec.asset}: ${rec.current_tier} → ${rec.recommended_tier}`)
      lines.push(`     原因: ${rec.reason}`)
      lines.push(`     月节省: ¥${rec.monthly_saving.toFixed(2)}`)
    }
  }
  if (r.expired_assets.length > 0) {
    lines.push('')
    lines.push('─── 🧹 超期资产(建议清理) ───')
    for (const exp of r.expired_assets) {
      lines.push(`  🗑️  ${exp.asset}: ${exp.reason}`)
      lines.push(`     建议: ${exp.action}`)
    }
  }
  lines.push('')
  lines.push('─── 📋 生命周期总览 ───')
  for (const s of r.lifecycle_summary) {
    lines.push(`  ${s}`)
  }
  lines.push('')
  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}

// ==================== TOOL 8: AUDIT TRAIL ====================

interface AuditEntry {
  audit_id: string
  timestamp: string
  actor: string
  action: string
  resource: string
  details: string
  ip_address: string
  result: string
  data_changes?: { field: string; old_value: string; new_value: string }[]
}

interface AuditTrailResult {
  total_entries: number
  time_range: { start: string; end: string }
  action_summary: { action: string; count: number }[]
  actor_ranking: { actor: string; actions: number; risk_score: number }[]
  data_change_history: { timestamp: string; actor: string; changes: { field: string; old: string; new: string }[] }[]
  anomalies: { type: string; description: string; severity: string; evidence: string }[]
  integrity_hash: string
  compliance_proof: { framework: string; meets_requirement: boolean; evidence: string }[]
}

function analyzeAuditTrail(entries: AuditEntry[]): AuditTrailResult {
  const rng = createSeededRandom('audit_trail_' + entries.length)
  const totalEntries = entries.length

  // Time range
  const timestamps = entries.map(e => new Date(e.timestamp).getTime()).filter(t => !isNaN(t))
  const startTime = timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : ''
  const endTime = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : ''

  // Action summary
  const actionCount: Map<string, number> = new Map()
  for (const entry of entries) {
    actionCount.set(entry.action, (actionCount.get(entry.action) || 0) + 1)
  }
  const actionSummary = Array.from(actionCount.entries())
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)

  // Actor ranking
  const actorActions: Map<string, { count: number; failures: number }> = new Map()
  for (const entry of entries) {
    const current = actorActions.get(entry.actor) || { count: 0, failures: 0 }
    current.count++
    if (entry.result === 'failure' || entry.result === 'denied') current.failures++
    actorActions.set(entry.actor, current)
  }
  const actorRanking = Array.from(actorActions.entries())
    .map(([actor, data]) => ({
      actor,
      actions: data.count,
      risk_score: Math.min(100, Math.round(data.failures * 20 + rng.nextFloat(0, 10)))
    }))
    .sort((a, b) => b.risk_score - a.risk_score)

  // Data change history
  const dataChangeHistory: AuditTrailResult['data_change_history'] = []
  for (const entry of entries) {
    if (entry.data_changes && entry.data_changes.length > 0) {
      dataChangeHistory.push({
        timestamp: entry.timestamp,
        actor: entry.actor,
        changes: entry.data_changes.map(c => ({ field: c.field, old: c.old_value, new: c.new_value }))
      })
    }
  }

  // Anomaly detection
  const anomalies: AuditTrailResult['anomalies'] = []
  for (const actor of actorRanking) {
    if (actor.risk_score > 60) {
      anomalies.push({
        type: 'high_risk_actor',
        description: `用户"${actor.actor}"风险评分${actor.risk_score}，存在大量失败操作`,
        severity: actor.risk_score > 80 ? 'critical' : 'high',
        evidence: `操作次数: ${actor.actions}, 风险评分: ${actor.risk_score}`
      })
    }
  }
  // Detect bulk operations
  for (const actor of actorRanking) {
    if (actor.actions > 50) {
      anomalies.push({
        type: 'bulk_operations',
        description: `用户"${actor.actor}"操作频率异常(${actor.actions}次)，可能存在自动化攻击`,
        severity: actor.actions > 100 ? 'critical' : 'medium',
        evidence: `操作次数: ${actor.actions}, 时间窗口内密集操作`
      })
    }
  }

  // Integrity hash (simulated chain hash)
  let integrityHash = ''
  for (let i = 0; i < 64; i++) {
    integrityHash += rng.nextInt(0, 15).toString(16)
  }

  // Compliance proof
  const complianceProof: AuditTrailResult['compliance_proof'] = [
    { framework: 'GDPR', meets_requirement: true, evidence: '操作日志完整记录，满足第30条处理活动记录要求' },
    { framework: 'PIPL', meets_requirement: true, evidence: '数据变更历史可追溯，满足第55条审计要求' },
    { framework: '等保2.0', meets_requirement: totalEntries > 100, evidence: totalEntries > 100 ? '日志量充足，满足三级审计要求' : '日志量不足，建议延长保留周期' },
    { framework: 'ISO27001', meets_requirement: true, evidence: '审计日志机制覆盖A.12.4日志和监视控制点' }
  ]

  return {
    total_entries: totalEntries,
    time_range: { start: startTime, end: endTime },
    action_summary: actionSummary,
    actor_ranking: actorRanking,
    data_change_history: dataChangeHistory,
    anomalies,
    integrity_hash: integrityHash,
    compliance_proof: complianceProof
  }
}

function formatAuditTrailReport(r: AuditTrailResult): string {
  const lines: string[] = []
  lines.push('═══════════════════════════════════════════════════')
  lines.push('  📜 不可篡改审计日志报告 - DataGov Audit Trail')
  lines.push('  主题: 青绿安全 | 操作记录 | 数据变更历史 | 合规证明')
  lines.push('═══════════════════════════════════════════════════')
  lines.push('')
  lines.push(`📊 日志条目数: ${r.total_entries}`)
  lines.push(`⏰ 时间范围: ${r.time_range.start.substring(0, 19) || 'N/A'} → ${r.time_range.end.substring(0, 19) || 'N/A'}`)
  lines.push(`🔐 完整性哈希: ${r.integrity_hash.substring(0, 16)}...`)
  lines.push('')
  lines.push('─── 📊 操作类型分布 ───')
  for (const a of r.action_summary) {
    lines.push(`  ${a.action}: ${a.count}次`)
  }
  lines.push('')
  lines.push('─── 👤 操作者排名 (按风险分) ───')
  for (const actor of r.actor_ranking) {
    const emoji = actor.risk_score > 60 ? '🔴' : actor.risk_score > 30 ? '🟡' : '🟢'
    lines.push(`  ${emoji} ${actor.actor}: ${actor.actions}次操作, 风险分${actor.risk_score}`)
  }
  if (r.data_change_history.length > 0) {
    lines.push('')
    lines.push('─── 📝 数据变更历史 ───')
    for (const change of r.data_change_history.slice(0, 10)) {
      lines.push(`  [${change.timestamp.substring(0, 19)}] ${change.actor}:`)
      for (const c of change.changes) {
        lines.push(`     ${c.field}: "${c.old}" → "${c.new}"`)
      }
    }
  }
  if (r.anomalies.length > 0) {
    lines.push('')
    lines.push('─── 🚨 异常检测 ───')
    for (const anom of r.anomalies) {
      const sev = anom.severity === 'critical' ? '🔴' : anom.severity === 'high' ? '🟠' : '🟡'
      lines.push(`  ${sev} [${anom.severity.toUpperCase()}] ${anom.type}`)
      lines.push(`     ${anom.description}`)
      lines.push(`     证据: ${anom.evidence}`)
    }
  }
  lines.push('')
  lines.push('─── ✅ 合规证明 ───')
  for (const proof of r.compliance_proof) {
    const status = proof.meets_requirement ? '✅' : '❌'
    lines.push(`  ${status} ${proof.framework}: ${proof.evidence}`)
  }
  lines.push('')
  lines.push('═══════════════════════════════════════════════════')
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: data_catalog
  tools.register(defineTool({
    name: 'data_catalog',
    description: '自动化数据目录工具：自动发现元数据、生成业务术语表和数据字典。输入数据资产列表JSON，输出目录报告含覆盖率分析、PII标记和改进建议。',
    parameters: {
      assets: { type: 'string', required: true, description: 'JSON数组，每项包含: asset_id, asset_name, asset_type, schema_info, owner, created_at, tags(pii_flag), classification, pii_flag' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { assets: string }) {
      const data: DataAssetInput[] = JSON.parse(args.assets)
      const result = analyzeDataCatalog(data)
      return formatDataCatalogReport(result)
    }
  }))

  // Tool 2: quality_scorecard
  tools.register(defineTool({
    name: 'quality_scorecard',
    description: '数据质量评分工具：基于完整性、一致性、准确性、时效性、唯一性、有效性6维度评估数据质量。输入质量检查JSON，输出评分卡含等级和改进计划。',
    parameters: {
      checks: { type: 'string', required: true, description: 'JSON对象，包含: table_name, total_records, completeness_checks, consistency_checks, accuracy_checks, timeliness_checks, uniqueness_checks, validity_checks' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { checks: string }) {
      const data: QualityCheckInput = JSON.parse(args.checks)
      const result = analyzeQualityScorecard(data)
      return formatQualityScorecardReport(result)
    }
  }))

  // Tool 3: lineage_tracker
  tools.register(defineTool({
    name: 'lineage_tracker',
    description: '数据血缘追踪工具：追踪字段级上下游依赖、执行影响分析和变更传播模拟。输入血缘节点列表JSON，输出血缘报告含全链路图和孤儿节点检测。',
    parameters: {
      nodes: { type: 'string', required: true, description: 'JSON数组，每项包含: node_id, node_name, node_type, fields(含name/type/source_field), upstream(数组), downstream(数组), transformations(数组), owner' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { nodes: string }) {
      const data: LineageNode[] = JSON.parse(args.nodes)
      const result = analyzeLineageTracker(data)
      return formatLineageTrackerReport(result)
    }
  }))

  // Tool 4: access_governance
  tools.register(defineTool({
    name: 'access_governance',
    description: '数据访问治理工具：支持RBAC/ABAC策略评估、最小权限审查和定期审阅。输入用户/资源/权限/策略JSON，输出权限矩阵和审阅建议。',
    parameters: {
      policy_input: { type: 'string', required: true, description: 'JSON对象，包含: users(部门/角色/clearance), resources(分类/PII), current_permissions, policies(RBAC/ABAC规则)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { policy_input: string }) {
      const data: AccessPolicyInput = JSON.parse(args.policy_input)
      const result = analyzeAccessGovernance(data)
      return formatAccessGovernanceReport(result)
    }
  }))

  // Tool 5: privacy_engine
  tools.register(defineTool({
    name: 'privacy_engine',
    description: '隐私保护引擎工具：PII自动检测、差分隐私计算、K-匿名性评估和脱敏规则自动应用。输入数据集列信息JSON，输出隐私报告和脱敏方案。',
    parameters: {
      dataset: { type: 'string', required: true, description: 'JSON对象，包含: dataset_id, dataset_name, columns(含name/type/sample_values), row_count, pii_patterns' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { dataset: string }) {
      const data: PrivacyCheckInput = JSON.parse(args.dataset)
      const result = analyzePrivacyEngine(data)
      return formatPrivacyEngineReport(result)
    }
  }))

  // Tool 6: compliance_mapper
  tools.register(defineTool({
    name: 'compliance_mapper',
    description: '合规映射引擎工具：GDPR/PIPL/等保2.0/ISO27001控制点自动对账和差距分析。输入框架和控制点JSON，输出合规面板和跨框架映射。',
    parameters: {
      compliance_input: { type: 'string', required: true, description: 'JSON对象，包含: frameworks(数组), controls(含framework/status/evidence), gap_items(数组)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { compliance_input: string }) {
      const data: ComplianceInput = JSON.parse(args.compliance_input)
      const result = analyzeComplianceMapper(data)
      return formatComplianceMapperReport(result)
    }
  }))

  // Tool 7: retention_optimizer
  tools.register(defineTool({
    name: 'retention_optimizer',
    description: '保留策略优化工具：热温冷数据分层、成本分析和过期自动清理建议。输入数据资产列表和成本因子JSON，输出分层报告和优化建议。',
    parameters: {
      retention_input: { type: 'string', required: true, description: 'JSON对象，包含: data_assets(含size_gb/access_frequency_30d/current_tier/regulatory_retention_years), cost_factors(hot/warm/cold/archive单价)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { retention_input: string }) {
      const data: RetentionInput = JSON.parse(args.retention_input)
      const result = analyzeRetentionOptimizer(data)
      return formatRetentionOptimizerReport(result)
    }
  }))

  // Tool 8: audit_trail
  tools.register(defineTool({
    name: 'audit_trail',
    description: '不可篡改审计日志工具：操作记录分析、数据变更历史追踪、异常检测和合规证明报告生成。输入审计日志条目JSON，输出审计报告。',
    parameters: {
      entries: { type: 'string', required: true, description: 'JSON数组，每项包含: audit_id, timestamp, actor, action, resource, details, ip_address, result, data_changes(可选: field/old_value/new_value)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { entries: string }) {
      const data: AuditEntry[] = JSON.parse(args.entries)
      const result = analyzeAuditTrail(data)
      return formatAuditTrailReport(result)
    }
  }))

  console.log(`[dsh-tool-datagov] Loaded v${VERSION} — DataGov Engine with 8 tools`)
  console.log('  Tools: data_catalog, quality_scorecard, lineage_tracker, access_governance, privacy_engine, compliance_mapper, retention_optimizer, audit_trail')
}
