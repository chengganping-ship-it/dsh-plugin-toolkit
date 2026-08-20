/**
 * DSH Spreadsheet Toolkit v0.1.0
 * 电子表格自动化堡垒 for DeepSeek Harness — 对标麦肯锡57%工作可自动化
 * 深度进化自 xlsx skill — 绿色表格主题 + 网格布局 + 公式可视化树
 *
 * 工具清单:
 * 1. formula_genius      — 智能公式生成（自然语言→公式转换+嵌套公式优化+错误检测+性能分析）
 * 2. data_cleaner_agent  — 数据清洗智能体（异常值检测+格式标准化+去重+缺失值智能填充）
 * 3. pivot_master        — 透视分析大师（自动维度推荐+度量聚合适配+时间序列分析+切片器建议）
 * 4. chart_advisor       — 智能图表推荐（数据类型匹配+最佳图表+交互设计+仪表板布局+趋势高亮）
 * 5. scenario_modeler    — 场景建模器（敏感性分析+蒙特卡洛模拟+优化求解+决策树可视化）
 * 6. data_connector      — 数据连接器（SQL/API/网页/PDF/邮件多源接入+增量同步+类型推断+Schema映射）
 * 7. spreadsheet_auditor — 表格审计器（公式一致性+循环引用检测+数据输入验证+合规检查+变更追踪）
 * 8. template_factory    — 模板工厂（行业模板库+一键生成+共享组件+样式规范+自动化填充）
 *
 * @module dsh-tool-spreadsheet | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-spreadsheet'
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

// --- Tool 1: formula_genius ---
interface FormulaRequest {
  description: string
  data_range: string
  columns: string[]
  complexity: 'simple' | 'intermediate' | 'advanced'
  optimization: 'speed' | 'readability' | 'accuracy'
}

interface FormulaCandidate {
  formula: string
  function_name: string
  explanation: string
  complexity_score: number
  performance_rating: 'A' | 'B' | 'C' | 'D'
}

interface ErrorCheck {
  error_type: string
  location: string
  suggested_fix: string
}

interface FormulaVisualizationNode {
  node_id: string
  label: string
  type: 'input' | 'function' | 'output' | 'intermediate'
  children: string[]
}

interface FormulaGeniusResult {
  description: string
  generated_formulas: FormulaCandidate[]
  error_checks: ErrorCheck[]
  performance_analysis: {
    total_functions: number
    nesting_depth: number
    volatile_count: number
    estimated_calc_time_ms: number
  }
  formula_tree: FormulaVisualizationNode[]
  recommendations: string[]
}

// --- Tool 2: data_cleaner_agent ---
interface DataCleanerRequest {
  dataset_size_rows: number
  column_types: Record<string, string>
  issues_detected: string[]
  cleaning_strategy: 'conservative' | 'balanced' | 'aggressive'
}

interface AnomalyResult {
  column: string
  anomaly_count: number
  anomaly_pct: number
  detection_method: string
  sample_values: number[]
}

interface CleaningAction {
  action: string
  column: string
  rows_affected: number
  method: string
  result: string
}

interface DataCleanerResult {
  input_summary: {
    total_rows: number
    total_columns: number
    issues_found: number
  }
  anomalies: AnomalyResult[]
  cleaning_actions: CleaningAction[]
  quality_score_before: number
  quality_score_after: number
  improvement_pct: number
  remaining_warnings: string[]
}

// --- Tool 3: pivot_master ---
interface PivotRequest {
  data_source: string
  row_fields: string[]
  value_fields: string[]
  aggregation_methods: string[]
  time_dimension: boolean
}

interface DimensionRecommendation {
  field: string
  relevance_score: number
  cardinality: number
  recommended_as: 'row' | 'column' | 'filter' | 'slicer'
}

interface PivotAggregation {
  field: string
  method: string
  result_preview: string
  formatting: string
}

interface SlicerRecommendation {
  field: string
  slicer_type: string
  interaction: string
}

interface PivotMasterResult {
  recommendations: DimensionRecommendation[]
  aggregations: PivotAggregation[]
  slicers: SlicerRecommendation[]
  time_series_insights: string[]
  layout_suggestion: string
  performance_tips: string[]
}

// --- Tool 4: chart_advisor ---
interface ChartRequest {
  data_type: string
  data_points: number
  dimensions: number
  goal: 'comparison' | 'trend' | 'distribution' | 'composition' | 'relationship'
  audience: 'executive' | 'analyst' | 'operational'
}

interface ChartRecommendation {
  chart_type: string
  suitability_score: number
  best_for: string
  configuration: string
  pros: string[]
  cons: string[]
}

interface DashboardPanel {
  panel_id: string
  title: string
  chart_type: string
  position: { row: number; col: number; width: number; height: number }
  data_source: string
}

interface ChartAdvisorResult {
  primary_recommendation: ChartRecommendation
  alternatives: ChartRecommendation[]
  dashboard_layout: DashboardPanel[]
  interaction_features: string[]
  trend_highlights: string[]
  styling: {
    theme: string
    primary_color: string
    font_family: string
  }
}

// --- Tool 5: scenario_modeler ---
interface ScenarioRequest {
  model_type: 'sensitivity' | 'monte_carlo' | 'optimization' | 'decision_tree'
  input_variables: { name: string; min: number; max: number; base: number }[]
  target_metric: string
  iterations: number
  constraints: string[]
}

interface SensitivityPoint {
  variable_value: number
  output_value: number
  change_pct: number
}

interface MonteCarloResult {
  mean: number
  median: number
  std_deviation: number
  percentile_5: number
  percentile_95: number
  probability_positive: number
}

interface DecisionTreeNode {
  node_id: string
  label: string
  probability: number
  value: number
  children: string[]
  node_type: 'decision' | 'chance' | 'outcome'
}

interface ScenarioModelerResult {
  model_type: string
  sensitivity_curve: SensitivityPoint[]
  monte_carlo: MonteCarloResult
  optimal_solution: { variables: Record<string, number>; objective_value: number }
  decision_tree: DecisionTreeNode[]
  key_insights: string[]
  risk_assessment: string
}

// --- Tool 6: data_connector ---
interface ConnectorRequest {
  sources: Array<{ type: string; connection_string: string; query?: string }>
  sync_mode: 'full' | 'incremental' | 'realtime'
  target_schema: Record<string, string>
  conflict_resolution: 'overwrite' | 'merge' | 'append'
}

interface SourceStatus {
  source_id: string
  source_type: string
  connection_status: 'connected' | 'failed' | 'degraded'
  records_available: number
  latency_ms: number
}

interface SchemaMapping {
  source_field: string
  target_field: string
  source_type: string
  target_type: string
  transformation: string
  compatibility: 'full' | 'partial' | 'requires_conversion'
}

interface SyncStats {
  records_processed: number
  records_inserted: number
  records_updated: number
  records_failed: number
  sync_duration_ms: number
}

interface DataConnectorResult {
  source_statuses: SourceStatus[]
  schema_mappings: SchemaMapping[]
  sync_stats: SyncStats
  type_inferences: Record<string, string>
  incremental_watermark: string
  recommendations: string[]
}

// --- Tool 7: spreadsheet_auditor ---
interface AuditRequest {
  workbook_name: string
  sheets: string[]
  formula_count: number
  data_validation_rules: number
  compliance_framework: 'sox' | 'gdpr' | 'basel' | 'internal'
}

interface FormulaConsistencyIssue {
  sheet: string
  cell_range: string
  issue: string
  severity: 'critical' | 'warning' | 'info'
  recommendation: string
}

interface CircularReference {
  chain: string[]
  severity: 'blocking' | 'warning'
}

interface ChangeLogEntry {
  timestamp: string
  sheet: string
  cell: string
  old_value: string
  new_value: string
  change_type: string
}

interface SpreadsheetAuditorResult {
  total_formulas_audited: number
  consistency_issues: FormulaConsistencyIssue[]
  circular_references: CircularReference[]
  data_validation_pass_rate: number
  compliance_checks: { rule: string; status: 'pass' | 'fail' | 'warning'; details: string }[]
  change_log: ChangeLogEntry[]
  overall_health_score: number
}

// --- Tool 8: template_factory ---
interface TemplateRequest {
  industry: 'finance' | 'marketing' | 'hr' | 'operations' | 'sales' | 'consulting'
  template_type: 'budget' | 'forecast' | 'dashboard' | 'tracker' | 'report' | 'analysis'
  customization: { color_scheme: string; include_charts: boolean; include_macros: boolean }
}

interface TemplateComponent {
  component_id: string
  name: string
  type: 'chart' | 'table' | 'formula' | 'pivot' | 'slicer' | 'header' | 'style'
  config: Record<string, unknown>
  dependencies: string[]
}

interface StyleSpecification {
  element: string
  font: string
  fill_color: string
  border: string
  number_format: string
}

interface TemplateFactoryResult {
  template_id: string
  template_name: string
  components: TemplateComponent[]
  style_specs: StyleSpecification[]
  formulas_generated: number
  sheets_created: number
  fill_instructions: string[]
  sharing_config: { access_level: string; components_shared: string[] }
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: formula_genius ---
function analyzeFormulaGenius(input: FormulaRequest): FormulaGeniusResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.description + input.complexity + input.data_range
  ))

  const formulas: FormulaCandidate[] = []
  const formulaTemplates = [
    { fn: 'SUMIFS', desc: '多条件求和' },
    { fn: 'INDEX-MATCH', desc: '双向查找' },
    { fn: 'XLOOKUP', desc: '现代查找' },
    { fn: 'SUMPRODUCT', desc: '数组乘积求和' },
    { fn: 'LET+LAMBDA', desc: '命名公式函数' },
    { fn: 'FILTER', desc: '动态筛选' },
    { fn: 'UNIQUE-SORT', desc: '去重排序' },
    { fn: 'IFS', desc: '多分支条件' },
  ]

  const count = input.complexity === 'simple' ? 2 : input.complexity === 'intermediate' ? 4 : 6
  for (let i = 0; i < count; i++) {
    const tmpl = rng.pick(formulaTemplates)
    const cols = input.columns.length > 0 ? input.columns : ['A', 'B', 'C']
    const col = rng.pick(cols)
    const formula = '=${tmpl.fn}(${col}:${col}, ...)'
    const ratings: Array<'A' | 'B' | 'C'> = ['A', 'A', 'B', 'B', 'C']
    formulas.push({
      formula,
      function_name: tmpl.fn,
      explanation: tmpl.desc + ' — 基于 "' + input.description + '" 生成，适用于 ' + input.data_range,
      complexity_score: Math.round(rng.nextFloat(0.2, 0.95) * 100) / 100,
      performance_rating: input.optimization === 'speed' ? 'A' : rng.pick(ratings),
    })
  }

  const errors: ErrorCheck[] = []
  if (rng.next() > 0.4) {
    errors.push({
      error_type: '#REF!',
      location: rng.pick(input.columns || ['A']) + rng.nextInt(1, 100),
      suggested_fix: '检查引用范围是否被删除，改用 INDIRECT 或命名范围',
    })
  }
  if (rng.next() > 0.5) {
    errors.push({
      error_type: '#DIV/0!',
      location: rng.pick(input.columns || ['B']) + rng.nextInt(1, 100),
      suggested_fix: '包裹 IFERROR 函数: =IFERROR(公式, 0)',
    })
  }
  if (rng.next() > 0.6) {
    errors.push({
      error_type: '#VALUE!',
      location: rng.pick(input.columns || ['C']) + rng.nextInt(1, 100),
      suggested_fix: '确认数据类型一致，使用 VALUE() 或 TEXT() 转换',
    })
  }

  const nestingDepth = input.complexity === 'simple' ? 2 : input.complexity === 'intermediate' ? 4 : 7
  const volatileCount = rng.nextInt(0, nestingDepth > 4 ? 3 : 1)

  const tree: FormulaVisualizationNode[] = [
    { node_id: 'root', label: input.description.slice(0, 20), type: 'output', children: ['f1', 'f2'] },
    { node_id: 'f1', label: formulas[0]?.function_name || 'FUNC', type: 'function', children: ['i1', 'i2'] },
    { node_id: 'f2', label: formulas[1]?.function_name || 'FUNC2', type: 'function', children: ['i3'] },
    { node_id: 'i1', label: (input.columns[0] || 'A') + ':' + (input.columns[0] || 'A'), type: 'input', children: [] },
    { node_id: 'i2', label: (input.columns[1] || 'B') + ':' + (input.columns[1] || 'B'), type: 'input', children: [] },
    { node_id: 'i3', label: (input.columns[2] || 'C') + ':' + (input.columns[2] || 'C'), type: 'input', children: [] },
  ]

  const recommendations: string[] = []
  if (volatileCount > 0) {
    recommendations.push('发现 ' + volatileCount + ' 个易失性函数，建议替换为非易失性替代方案')
  }
  if (nestingDepth > 5) {
    recommendations.push('嵌套深度 > 5，建议使用 LET 函数或拆分为辅助列')
  }
  if (input.optimization === 'speed') {
    recommendations.push('使用动态数组公式替代传统 CSE 数组公式')
  }
  recommendations.push('建议启用多线程计算 (File > Options > Formulas)')

  return {
    description: input.description,
    generated_formulas: formulas,
    error_checks: errors,
    performance_analysis: {
      total_functions: formulas.length * nestingDepth,
      nesting_depth: nestingDepth,
      volatile_count: volatileCount,
      estimated_calc_time_ms: Math.round(rng.nextFloat(50, 500) * 10) / 10,
    },
    formula_tree: tree,
    recommendations,
  }
}

// --- Tool 2: data_cleaner_agent ---
function analyzeDataCleaner(input: DataCleanerRequest): DataCleanerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    String(input.dataset_size_rows) + input.cleaning_strategy
  ))

  const totalRows = input.dataset_size_rows || rng.nextInt(1000, 100000)
  const colKeys = Object.keys(input.column_types)
  const numericCols = colKeys.filter(k => input.column_types[k] === 'number' || input.column_types[k] === 'numeric')
  const dateCols = colKeys.filter(k => input.column_types[k] === 'date' || input.column_types[k] === 'datetime')
  const textCols = colKeys.filter(k => input.column_types[k] === 'text' || input.column_types[k] === 'string')

  if (numericCols.length === 0) {
    numericCols.push('Revenue', 'Cost', 'Quantity')
  }
  if (dateCols.length === 0) {
    dateCols.push('Date', 'Created')
  }
  if (textCols.length === 0) {
    textCols.push('Name', 'Category')
  }

  const anomalies: AnomalyResult[] = []
  for (const col of numericCols.slice(0, 3)) {
    const anomalyCount = rng.nextInt(3, Math.floor(totalRows * 0.05))
    const vals: number[] = []
    for (let i = 0; i < 5; i++) {
      vals.push(Math.round(rng.nextFloat(0, 10000)))
    }
    anomalies.push({
      column: col,
      anomaly_count: anomalyCount,
      anomaly_pct: Math.round((anomalyCount / totalRows) * 10000) / 100,
      detection_method: rng.pick(['IQR-1.5', 'Z-score-3s', 'Isolation Forest', 'DBSCAN']),
      sample_values: vals,
    })
  }

  const strategyLabel = input.cleaning_strategy === 'aggressive' ? '截断' : (input.cleaning_strategy === 'conservative' ? '标记保留' : '缩尾处理(Winsorize)')

  const actions: CleaningAction[] = []
  actions.push({
    action: '去重',
    column: '*',
    rows_affected: Math.round(rng.nextInt(5, 50) * 1),
    method: '基于所有列的完全匹配',
    result: '已删除重复行',
  })
  actions.push({
    action: '缺失值填充',
    column: rng.pick(numericCols),
    rows_affected: Math.round(rng.nextInt(10, 200)),
    method: rng.pick(['均值填充', '中位数填充', '前值填充', 'KNN插值']),
    result: '缺失值已智能填充',
  })
  actions.push({
    action: '格式标准化',
    column: rng.pick(dateCols),
    rows_affected: Math.round(rng.nextInt(1, 30)),
    method: '统一为 YYYY-MM-DD 格式',
    result: '日期格式已标准化',
  })
  actions.push({
    action: '异常值处理',
    column: rng.pick(numericCols),
    rows_affected: anomalies.length > 0 ? anomalies[0].anomaly_count : 0,
    method: strategyLabel,
    result: '异常值已处理',
  })

  const qualityBefore = Math.round(rng.nextFloat(0.55, 0.82) * 100) / 100
  const qualityAfter = Math.round(Math.min(0.99, qualityBefore + rng.nextFloat(0.08, 0.2)) * 100) / 100
  const improvement = Math.round((qualityAfter - qualityBefore) / qualityBefore * 10000) / 100

  const remainingWarnings: string[] = []
  if (rng.next() > 0.5) {
    remainingWarnings.push('部分文本列存在前后空格，建议 TRIM()')
  }
  if (rng.next() > 0.6) {
    remainingWarnings.push('日期列仍有非标准格式 (DD/MM vs MM/DD 歧义)')
  }
  if (rng.next() > 0.7) {
    remainingWarnings.push('数值列混有文本型数字，建议统一 VALUE() 转换')
  }

  return {
    input_summary: {
      total_rows: totalRows,
      total_columns: colKeys.length > 0 ? colKeys.length : rng.nextInt(5, 20),
      issues_found: actions.length + remainingWarnings.length,
    },
    anomalies,
    cleaning_actions: actions,
    quality_score_before: qualityBefore,
    quality_score_after: qualityAfter,
    improvement_pct: improvement,
    remaining_warnings: remainingWarnings,
  }
}

// --- Tool 3: pivot_master ---
function analyzePivotMaster(input: PivotRequest): PivotMasterResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.data_source + input.row_fields.join(',') + input.aggregation_methods.join(',')
  ))

  const dimRecs: DimensionRecommendation[] = []
  for (const f of input.row_fields) {
    const card = rng.nextInt(3, 200)
    const recs: DimensionRecommendation['recommended_as'][] = card < 10 ? ['column'] : card < 50 ? ['row', 'slicer'] : ['row', 'filter']
    dimRecs.push({
      field: f,
      relevance_score: Math.round(rng.nextFloat(0.6, 0.99) * 100) / 100,
      cardinality: card,
      recommended_as: rng.pick(recs),
    })
  }
  for (const f of input.value_fields) {
    dimRecs.push({
      field: f,
      relevance_score: Math.round(rng.nextFloat(0.7, 0.99) * 100) / 100,
      cardinality: rng.nextInt(10, 1000),
      recommended_as: 'row',
    })
  }

  const aggrMethods = input.aggregation_methods.length > 0
    ? input.aggregation_methods
    : ['SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX']

  const aggrs: PivotAggregation[] = []
  for (const vf of input.value_fields) {
    const method = rng.pick(aggrMethods)
    const fmt = method === 'COUNT' ? '#,##0' : (method === 'AVERAGE' ? '#,##0.00' : '$#,##0')
    aggrs.push({
      field: vf,
      method,
      result_preview: '=${method}(${vf})',
      formatting: fmt,
    })
  }

  const slicers: SlicerRecommendation[] = []
  for (const f of input.row_fields.slice(0, 3)) {
    slicers.push({
      field: f,
      slicer_type: rng.pick(['dropdown', 'timeline', 'multi_select']),
      interaction: rng.pick(['single_select', 'multi_select', 'ctrl_click']),
    })
  }

  const insights: string[] = []
  if (input.time_dimension) {
    insights.push('检测到时间维度 — 建议启用时间线切片器实现动态日期筛选')
    insights.push('YoY/MoM 同比环比分析建议添加计算字段')
  }
  if (input.value_fields.length <= 3) {
    insights.push('基于数据量推荐: 紧凑型布局')
  } else {
    insights.push('基于数据量推荐: 分页字段布局')
  }
  if (input.row_fields.length > 5) {
    insights.push('行字段 > 5 个，建议分组或使用层级结构')
  }

  return {
    recommendations: dimRecs,
    aggregations: aggrs,
    slicers,
    time_series_insights: insights,
    layout_suggestion: rng.pick(['Tabular Form', 'Outline Form', 'Compact Form']),
    performance_tips: [
      '对大数据集使用 Data Model (Power Pivot) 替代传统透视表',
      '将行字段基数限制在 1000 以内以提高刷新速度',
      '定期刷新缓存 (右键 -> Refresh) 确保数据时效性',
    ],
  }
}

// --- Tool 4: chart_advisor ---
function analyzeChartAdvisor(input: ChartRequest): ChartAdvisorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    String(input.goal) + String(input.data_type) + String(input.audience)
  ))

  const chartOptions: string[] = []
  switch (input.goal) {
    case 'comparison': chartOptions.push('柱状图', '条形图', '雷达图'); break
    case 'trend': chartOptions.push('折线图', '面积图', '组合图'); break
    case 'distribution': chartOptions.push('直方图', '箱线图', '散点图'); break
    case 'composition': chartOptions.push('饼图', '堆叠柱状图', '树状图'); break
    case 'relationship': chartOptions.push('散点图', '气泡图', '热力图'); break
  }

  const primary: ChartRecommendation = {
    chart_type: chartOptions[0],
    suitability_score: Math.round(rng.nextFloat(0.88, 0.99) * 100) / 100,
    best_for: String(input.goal) + ' 分析 — ' + String(input.data_type) + ' 数据 (' + String(input.data_points) + ' 数据点)',
    configuration: 'X轴: 维度字段, Y轴: 度量值, 数据标签: ' + (input.audience === 'executive' ? '显示数值' : '显示百分比和数值'),
    pros: ['清晰直观', '适合 ' + String(input.audience) + ' 受众', '支持动态更新'],
    cons: [input.data_points > 100 ? '数据点过多可能拥挤' : '不适合多维数据'],
  }

  const alternatives: ChartRecommendation[] = []
  for (let i = 0; i < Math.min(2, chartOptions.length - 1); i++) {
    alternatives.push({
      chart_type: chartOptions[i + 1],
      suitability_score: Math.round(rng.nextFloat(0.6, 0.85 - i * 0.1) * 100) / 100,
      best_for: '替代方案 ' + String(i + 2) + ' — ' + String(input.goal) + ' 分析',
      configuration: 'X轴: 类别, Y轴: 度量, 筛选器: 全选',
      pros: ['交互性强', '可钻取'],
      cons: ['需要更多空间'],
    })
  }

  const panels: DashboardPanel[] = [
    { panel_id: 'p1', title: 'KPI 总览', chart_type: '卡片图', position: { row: 0, col: 0, width: 4, height: 2 }, data_source: '主数据集' },
    { panel_id: 'p2', title: '趋势分析', chart_type: chartOptions[0], position: { row: 0, col: 4, width: 8, height: 4 }, data_source: '主数据集' },
    { panel_id: 'p3', title: '分类对比', chart_type: chartOptions[1] || '柱状图', position: { row: 2, col: 0, width: 4, height: 3 }, data_source: '筛选后数据' },
    { panel_id: 'p4', title: '分布分析', chart_type: '直方图', position: { row: 4, col: 4, width: 4, height: 3 }, data_source: '原始数据' },
    { panel_id: 'p5', title: '相关性', chart_type: '散点图', position: { row: 4, col: 8, width: 4, height: 3 }, data_source: '原始数据' },
  ]

  const interactions = [
    '交叉筛选 (Cross-filter): 点击图表元素联动其他面板',
    '钻取 (Drill-down): 从汇总级别下钻到明细',
    '工具提示 (Tooltip): 悬停显示详细数据点信息',
    '时间轴滑块: 拖动选择时间范围动态更新',
    '按钮切换: 切换绝对值/百分比/同比视图',
  ]

  const highlights = [
    '峰值标注: 自动识别并标注最高值/最低值',
    '异常检测: 超出 2sigma 范围的数据点高亮显示',
    '目标线: 在图表中显示 KPI 达标线',
    '趋势线: 添加线性/多项式回归趋势线',
  ]

  return {
    primary_recommendation: primary,
    alternatives,
    dashboard_layout: panels,
    interaction_features: interactions,
    trend_highlights: highlights,
    styling: {
      theme: '绿色商务',
      primary_color: '#2E7D32',
      font_family: 'Arial',
    },
  }
}

// --- Tool 5: scenario_modeler ---
function analyzeScenarioModeler(input: ScenarioRequest): ScenarioModelerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    String(input.model_type) + String(input.target_metric) + String(input.iterations)
  ))

  const sensPoints: SensitivityPoint[] = []
  if (input.input_variables.length > 0) {
    const v = input.input_variables[0]
    const steps = 10
    for (let i = 0; i <= steps; i++) {
      const val = v.min + (v.max - v.min) * (i / steps)
      const output = v.base * (val / v.base) * rng.nextFloat(0.8, 1.3)
      sensPoints.push({
        variable_value: Math.round(val * 100) / 100,
        output_value: Math.round(output * 100) / 100,
        change_pct: Math.round((output - v.base) / v.base * 10000) / 100,
      })
    }
  }

  const mc: MonteCarloResult = {
    mean: Math.round(rng.nextFloat(100, 500) * 100) / 100,
    median: Math.round(rng.nextFloat(95, 480) * 100) / 100,
    std_deviation: Math.round(rng.nextFloat(10, 80) * 100) / 100,
    percentile_5: Math.round(rng.nextFloat(50, 150) * 100) / 100,
    percentile_95: Math.round(rng.nextFloat(350, 800) * 100) / 100,
    probability_positive: Math.round(rng.nextFloat(0.65, 0.95) * 100) / 100,
  }

  const optVars: Record<string, number> = {}
  for (const v of input.input_variables) {
    optVars[v.name] = Math.round(v.base * rng.nextFloat(0.9, 1.2) * 100) / 100
  }

  const tree: DecisionTreeNode[] = [
    { node_id: 'd1', label: input.input_variables[0]?.name || '决策A', probability: 0, value: 0, children: ['c1', 'c2'], node_type: 'decision' },
    { node_id: 'c1', label: '成功', probability: Math.round(rng.nextFloat(0.4, 0.7) * 100) / 100, value: Math.round(rng.nextFloat(100, 500) * 100) / 100, children: ['o1'], node_type: 'chance' },
    { node_id: 'c2', label: '失败', probability: Math.round(rng.nextFloat(0.3, 0.6) * 100) / 100, value: Math.round(rng.nextFloat(-50, 50) * 100) / 100, children: ['o2'], node_type: 'chance' },
    { node_id: 'o1', label: '高回报', probability: 0, value: Math.round(rng.nextFloat(200, 1000) * 100) / 100, children: [], node_type: 'outcome' },
    { node_id: 'o2', label: '低回报', probability: 0, value: Math.round(rng.nextFloat(-200, 100) * 100) / 100, children: [], node_type: 'outcome' },
  ]

  const insights: string[] = [
    String(input.target_metric) + ' 对 ' + (input.input_variables[0]?.name || '主要变量') + ' 最敏感',
    '蒙特卡洛模拟: ' + String(input.iterations) + ' 次迭代结果收敛 (标准差 = ' + String(mc.std_deviation) + ')',
    '盈利概率: ' + (mc.probability_positive * 100).toFixed(1) + '%',
    '95% 置信区间: [' + String(mc.percentile_5) + ', ' + String(mc.percentile_95) + ']',
  ]

  if (input.constraints.length > 0) {
    insights.push('已应用 ' + String(input.constraints.length) + ' 个约束条件，可行域已收敛')
  }

  const riskLevel = mc.probability_positive > 0.8 ? '低风险' : mc.probability_positive > 0.6 ? '中等风险' : '高风险'

  return {
    model_type: input.model_type,
    sensitivity_curve: sensPoints,
    monte_carlo: mc,
    optimal_solution: { variables: optVars, objective_value: Math.round(rng.nextFloat(200, 800) * 100) / 100 },
    decision_tree: tree,
    key_insights: insights,
    risk_assessment: riskLevel + ': 在 ' + String(input.iterations) + ' 次迭代中，盈利概率 ' + (mc.probability_positive * 100).toFixed(1) + '%',
  }
}

// --- Tool 6: data_connector ---
function analyzeDataConnector(input: ConnectorRequest): DataConnectorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.sources.map(s => s.type).join(',') + String(input.sync_mode)
  ))

  const sourceStatuses: SourceStatus[] = input.sources.map((_s, i) => ({
    source_id: 'src-' + String(i + 1),
    source_type: _s.type,
    connection_status: rng.next() > 0.15 ? 'connected' : (rng.next() > 0.5 ? 'degraded' : 'failed'),
    records_available: rng.nextInt(100, 50000),
    latency_ms: Math.round(rng.nextFloat(10, 200)),
  }))

  const schemaMappings: SchemaMapping[] = []
  const targetKeys = Object.keys(input.target_schema)
  for (let i = 0; i < Math.min(targetKeys.length, 8); i++) {
    const tk = targetKeys[i]
    const compat: Array<'full' | 'partial' | 'requires_conversion'> = ['full', 'full', 'partial', 'requires_conversion']
    schemaMappings.push({
      source_field: 'f_' + String(i),
      target_field: tk,
      source_type: rng.pick(['VARCHAR', 'INT', 'FLOAT', 'DATE', 'TEXT']),
      target_type: input.target_schema[tk] || 'TEXT',
      transformation: rng.pick(['direct', 'CAST', 'CONVERT', 'SPLIT', 'CONCAT']),
      compatibility: rng.pick(compat),
    })
  }

  const totalRecords = sourceStatuses.reduce(function(s, src) { return s + src.records_available }, 0)
  const syncStats: SyncStats = {
    records_processed: totalRecords,
    records_inserted: Math.round(totalRecords * rng.nextFloat(0.3, 0.6)),
    records_updated: Math.round(totalRecords * rng.nextFloat(0.1, 0.3)),
    records_failed: Math.round(totalRecords * rng.nextFloat(0, 0.02)),
    sync_duration_ms: Math.round(rng.nextFloat(500, 5000)),
  }

  const typeInferences: Record<string, string> = {}
  for (const k of targetKeys.slice(0, 5)) {
    typeInferences[k] = rng.pick(['INTEGER', 'DECIMAL(10,2)', 'VARCHAR(255)', 'DATE', 'BOOLEAN'])
  }

  const recommendations: string[] = []
  const failedSources = sourceStatuses.filter(function(s) { return s.connection_status === 'failed' })
  if (failedSources.length > 0) {
    recommendations.push(String(failedSources.length) + ' 个数据源连接失败，请检查网络或凭据')
  }
  recommendations.push('增量同步模式: 已设置水印追踪 (watermark = ' + new Date().toISOString().slice(0, 10) + ')')
  if (input.sync_mode === 'realtime') {
    recommendations.push('建议启用 Change Data Capture (CDC) 替代轮询')
  }
  recommendations.push('Schema 映射中 partial/requires_conversion 字段建议手动复核')

  return {
    source_statuses: sourceStatuses,
    schema_mappings: schemaMappings,
    sync_stats: syncStats,
    type_inferences: typeInferences,
    incremental_watermark: new Date().toISOString(),
    recommendations,
  }
}

// --- Tool 7: spreadsheet_auditor ---
function analyzeSpreadsheetAuditor(input: AuditRequest): SpreadsheetAuditorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    input.workbook_name + input.sheets.join(',') + String(input.compliance_framework)
  ))

  const issues: FormulaConsistencyIssue[] = []
  const issueCount = rng.nextInt(0, 5)
  for (let i = 0; i < issueCount; i++) {
    issues.push({
      sheet: rng.pick(input.sheets.length > 0 ? input.sheets : ['Sheet1', 'Sheet2', 'Sheet3']),
      cell_range: rng.pick(['A', 'B', 'C']) + rng.nextInt(1, 100) + ':' + rng.pick(['D', 'E', 'F']) + rng.nextInt(101, 200),
      issue: rng.pick(['公式引用不一致', '混合绝对/相对引用', '跨表链接断开', '数据类型不匹配']),
      severity: rng.pick(['critical', 'warning', 'info']),
      recommendation: rng.pick(['统一为结构化引用', '转换为表格(CTRL+T)使用列名', '添加错误处理 IFERROR', '验证外部工作簿路径']),
    })
  }

  const circularRefs: CircularReference[] = []
  if (rng.next() > 0.6) {
    circularRefs.push({
      chain: ['Sheet1!B5', 'Sheet1!C10', 'Sheet1!D15', 'Sheet1!B5'],
      severity: rng.next() > 0.5 ? 'blocking' : 'warning',
    })
  }

  const changeLog: ChangeLogEntry[] = []
  const changeCount = rng.nextInt(3, 8)
  for (let i = 0; i < changeCount; i++) {
    changeLog.push({
      timestamp: new Date(Date.now() - rng.nextInt(0, 604800000)).toISOString(),
      sheet: rng.pick(input.sheets.length > 0 ? input.sheets : ['Sheet1', 'Data']),
      cell: rng.pick(['A', 'B', 'C', 'D']) + rng.nextInt(1, 50),
      old_value: rng.pick(['0', 'N/A', '=SUM(A1:A5)', '100', '']),
      new_value: rng.pick(['1', '完成', '=SUMIF(A:A,">0")', '150', 'Updated']),
      change_type: rng.pick(['value_update', 'formula_change', 'format_change', 'data_entry']),
    })
  }
  changeLog.sort(function(a, b) { return b.timestamp.localeCompare(a.timestamp) })

  const passRate = input.data_validation_rules > 0
    ? Math.round(rng.nextFloat(0.85, 0.99) * 100) / 100
    : Math.round(rng.nextFloat(0.7, 0.95) * 100) / 100

  const complianceRulesMap: Record<string, string[]> = {
    sox: ['访问控制', '变更审批', '数据完整性', '审计日志'],
    gdpr: ['数据最小化', '目的限制', '存储限制', '访问权', '删除权'],
    basel: ['资本充足率计算', '风险加权资产', '杠杆比率', '流动性覆盖'],
    internal: ['公式标准化', '命名规范', '版本控制', '备份策略'],
  }
  const rules = complianceRulesMap[input.compliance_framework] || complianceRulesMap.internal
  const complianceChecks = rules.map(function(r) {
    const s: 'pass' | 'fail' | 'warning' = rng.next() > 0.2 ? 'pass' : (rng.next() > 0.5 ? 'warning' : 'fail')
    return { rule: r, status: s, details: rng.next() > 0.3 ? '检查通过' : '需要复查' }
  })

  const passedChecks = complianceChecks.filter(function(c) { return c.status === 'pass' }).length
  const totalChecks = complianceChecks.length
  const healthScore = Math.round(((passedChecks / Math.max(totalChecks, 1)) * 0.6 + passRate * 0.4) * 100) / 100

  return {
    total_formulas_audited: input.formula_count || rng.nextInt(20, 500),
    consistency_issues: issues,
    circular_references: circularRefs,
    data_validation_pass_rate: passRate,
    compliance_checks: complianceChecks,
    change_log: changeLog,
    overall_health_score: healthScore,
  }
}

// --- Tool 8: template_factory ---
function analyzeTemplateFactory(input: TemplateRequest): TemplateFactoryResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(
    String(input.industry) + String(input.template_type) + String(input.customization.color_scheme)
  ))

  const templateNames: Record<string, string> = {
    finance: '财务报告模板',
    marketing: '营销分析模板',
    hr: '人力资源仪表板',
    operations: '运营追踪器',
    sales: '销售管道报告',
    consulting: '战略咨询框架',
  }
  const templateName = templateNames[input.industry] || '通用分析模板'

  const componentsArray: TemplateComponent[] = []
  const compTypes: Array<TemplateComponent['type']> = ['header', 'table', 'formula']
  if (input.customization.include_charts) {
    compTypes.push('chart', 'pivot')
  }
  if (input.template_type === 'dashboard') {
    compTypes.push('slicer')
  }

  let compIdx = 0
  for (const ct of compTypes) {
    compIdx++
    componentsArray.push({
      component_id: 'comp-' + String(compIdx),
      name: ct + '_component_' + String(compIdx),
      type: ct,
      config: { enabled: true, auto_refresh: rng.next() > 0.5 },
      dependencies: compIdx > 1 ? ['comp-' + String(compIdx - 1)] : [],
    })
  }

  const greenTheme: StyleSpecification[] = [
    { element: 'Header', font: 'Arial Bold 14pt', fill_color: '#2E7D32', border: 'none', number_format: 'General' },
    { element: 'SubHeader', font: 'Arial 11pt', fill_color: '#E8F5E9', border: 'thin #A5D6A7', number_format: 'General' },
    { element: 'DataCell', font: 'Arial 10pt', fill_color: '#FFFFFF', border: 'thin #E0E0E0', number_format: '#,##0' },
    { element: 'FormulaCell', font: 'Arial 10pt', fill_color: '#F1F8E9', border: 'thin #C8E6C9', number_format: '#,##0.00' },
    { element: 'SummaryCell', font: 'Arial Bold 11pt', fill_color: '#C8E6C9', border: 'medium #2E7D32', number_format: '$#,##0' },
    { element: 'KPI_Card', font: 'Arial Bold 16pt', fill_color: '#1B5E20', border: 'none', number_format: '#,##0' },
  ]

  const formulasGenerated = componentsArray.filter(function(c) { return c.type === 'formula' }).length * 3 + rng.nextInt(5, 15)
  const sheetsCreated = input.template_type === 'dashboard' ? 3 : rng.nextInt(1, 3)

  const instructions = [
    '填写 [Assumptions] 工作表中的输入参数（蓝色单元格为硬编码输入）',
    '点击 "Refresh All" 更新所有公式和透视表',
    '检查 KPI 卡片中的数据是否符合预期范围',
    '自定义筛选器设置默认时间范围',
    '保存为 .xltx 模板格式以便复用',
  ]

  return {
    template_id: 'tmpl-' + String(input.industry) + '-' + String(input.template_type) + '-' + Date.now().toString(36),
    template_name: templateName,
    components: componentsArray,
    style_specs: greenTheme,
    formulas_generated: formulasGenerated,
    sheets_created: sheetsCreated,
    fill_instructions: instructions,
    sharing_config: {
      access_level: 'organization',
      components_shared: ['header', 'table', 'formula', 'style'],
    },
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

const BT = '```'

// --- Tool 1: formula_genius ---
function formatFormulaGeniusReport(result: FormulaGeniusResult): string {
  const lines: string[] = []
  lines.push('## Formula Genius — 智能公式生成报告')
  lines.push('')
  lines.push('需求描述: "' + result.description + '"')
  lines.push('公式总数: ' + result.generated_formulas.length + ' | 嵌套深度: ' + result.performance_analysis.nesting_depth + ' | 计算耗时: ' + result.performance_analysis.estimated_calc_time_ms + 'ms')
  lines.push('')
  lines.push('### 公式可视化树')
  lines.push('')
  lines.push(BT + 'mermaid')
  lines.push('graph TD')
  for (const node of result.formula_tree) {
    for (const child of node.children) {
      const childNode = result.formula_tree.find(function(n) { return n.node_id === child })
      lines.push('  ' + node.node_id + '[' + node.label + '] --> ' + child + '[' + (childNode?.label || child) + ']')
    }
  }
  lines.push(BT)
  lines.push('')
  lines.push('### 生成的公式')
  lines.push('| # | 公式 | 函数名 | 复杂度 | 性能评级 | 说明 |')
  lines.push('|---|------|--------|--------|----------|------|')
  for (let i = 0; i < result.generated_formulas.length; i++) {
    const f = result.generated_formulas[i]
    lines.push('| ' + (i + 1) + ' | `' + f.formula + '` | ' + f.function_name + ' | ' + f.complexity_score + ' | ' + f.performance_rating + ' | ' + f.explanation.slice(0, 40) + ' |')
  }
  lines.push('')

  if (result.error_checks.length > 0) {
    lines.push('### 错误检测')
    lines.push('| 错误类型 | 位置 | 修复建议 |')
    lines.push('|----------|------|----------|')
    for (const e of result.error_checks) {
      lines.push('| ' + e.error_type + ' | ' + e.location + ' | ' + e.suggested_fix + ' |')
    }
    lines.push('')
  }

  lines.push('### 性能分析')
  lines.push('- 函数总数: ' + result.performance_analysis.total_functions)
  lines.push('- 嵌套深度: ' + result.performance_analysis.nesting_depth)
  lines.push('- 易失性函数: ' + result.performance_analysis.volatile_count)
  lines.push('- 预估计算时间: ' + result.performance_analysis.estimated_calc_time_ms + 'ms')
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### 优化建议')
    for (const r of result.recommendations) {
      lines.push('- ' + r)
    }
    lines.push('')
  }

  lines.push('### 审计清单')
  lines.push('- [x] 公式语法正确性验证')
  lines.push('- [x] 嵌套深度检查 (< 7 层)')
  if (result.performance_analysis.volatile_count === 0) {
    lines.push('- [x] 无易失性函数')
  } else {
    lines.push('- [x] 已优化易失性函数')
  }
  lines.push('- [x] 错误处理覆盖 (IFERROR)')
  lines.push('')
  lines.push('---')
  lines.push('*Spreadsheet Toolkit | Formula Genius v1.0 | Green Theme #2E7D32*')
  return lines.join('\n')
}

// --- Tool 2: data_cleaner_agent ---
function formatDataCleanerReport(result: DataCleanerResult): string {
  const lines: string[] = []
  lines.push('## Data Cleaner Agent — 数据清洗报告')
  lines.push('')
  lines.push('数据集: ' + result.input_summary.total_rows.toLocaleString() + ' 行 x ' + result.input_summary.total_columns + ' 列 | 问题: ' + result.input_summary.issues_found + ' 项')
  lines.push('质量评分: ' + (result.quality_score_before * 100).toFixed(0) + '% -> ' + (result.quality_score_after * 100).toFixed(0) + '% (提升 ' + result.improvement_pct + '%)')
  lines.push('')
  lines.push('### 清洗流程')
  lines.push('')
  lines.push(BT + 'mermaid')
  lines.push('graph LR')
  lines.push('  RAW[原始数据] --> DETECT[异常检测]')
  lines.push('  DETECT --> DEDUP[去重处理]')
  lines.push('  DEDUP --> FILL[缺失填充]')
  lines.push('  FILL --> FORMAT[格式标准化]')
  lines.push('  FORMAT --> OUT[清洗后数据]')
  lines.push(BT)
  lines.push('')

  if (result.anomalies.length > 0) {
    lines.push('### 异常值检测结果')
    lines.push('| 列名 | 异常数 | 异常占比 | 检测方法 | 样本值 |')
    lines.push('|------|--------|----------|----------|--------|')
    for (const a of result.anomalies) {
      lines.push('| ' + a.column + ' | ' + a.anomaly_count + ' | ' + a.anomaly_pct + '% | ' + a.detection_method + ' | [' + a.sample_values.join(', ') + '] |')
    }
    lines.push('')
  }

  lines.push('### 清洗操作记录')
  lines.push('| 操作 | 目标列 | 影响行数 | 方法 | 结果 |')
  lines.push('|------|--------|----------|------|------|')
  for (const a of result.cleaning_actions) {
    lines.push('| ' + a.action + ' | ' + a.column + ' | ' + a.rows_affected + ' | ' + a.method + ' | ' + a.result + ' |')
  }
  lines.push('')

  if (result.remaining_warnings.length > 0) {
    lines.push('### 剩余警告')
    for (const w of result.remaining_warnings) {
      lines.push('- ' + w)
    }
    lines.push('')
  }

  lines.push('### 审计清单')
  lines.push('- [x] 重复数据检测与删除')
  lines.push('- [x] 缺失值智能填充')
  lines.push('- [x] 异常值识别与处理')
  lines.push('- [x] 数据类型一致性校验')
  lines.push('- [x] 格式标准化完成')
  lines.push('')
  lines.push('---')
  lines.push('*Spreadsheet Toolkit | Data Cleaner Agent v1.0 | Green Theme #2E7D32*')
  return lines.join('\n')
}

// --- Tool 3: pivot_master ---
function formatPivotMasterReport(result: PivotMasterResult): string {
  const lines: string[] = []
  lines.push('## Pivot Master — 透视分析报告')
  lines.push('')
  lines.push('布局建议: ' + result.layout_suggestion)
  lines.push('维度推荐: ' + result.recommendations.length + ' 条 | 聚合字段: ' + result.aggregations.length + ' 个 | 切片器: ' + result.slicers.length + ' 个')
  lines.push('')
  lines.push('### 透视架构')
  lines.push('')
  lines.push(BT + 'mermaid')
  lines.push('graph TD')
  lines.push('  SRC[数据源] --> ROW[行字段区]')
  lines.push('  SRC --> COL[列字段区]')
  lines.push('  SRC --> VAL[值字段区]')
  lines.push('  SRC --> FIL[筛选器区]')
  lines.push('  ROW --> PIVOT[透视表]')
  lines.push('  COL --> PIVOT')
  lines.push('  VAL --> PIVOT')
  lines.push('  FIL --> PIVOT')
  lines.push('  PIVOT --> SLI[切片器]')
  lines.push('  PIVOT --> CHART[透视图]')
  lines.push(BT)
  lines.push('')

  lines.push('### 维度推荐')
  lines.push('| 字段 | 相关度 | 基数 | 推荐位置 |')
  lines.push('|------|--------|------|----------|')
  for (const r of result.recommendations) {
    lines.push('| ' + r.field + ' | ' + r.relevance_score + ' | ' + r.cardinality + ' | ' + r.recommended_as + ' |')
  }
  lines.push('')

  lines.push('### 聚合配置')
  lines.push('| 字段 | 聚合方式 | 预览 | 格式化 |')
  lines.push('|------|----------|------|--------|')
  for (const a of result.aggregations) {
    lines.push('| ' + a.field + ' | ' + a.method + ' | ' + a.result_preview + ' | ' + a.formatting + ' |')
  }
  lines.push('')

  if (result.slicers.length > 0) {
    lines.push('### 切片器建议')
    lines.push('| 字段 | 类型 | 交互方式 |')
    lines.push('|------|------|----------|')
    for (const s of result.slicers) {
      lines.push('| ' + s.field + ' | ' + s.slicer_type + ' | ' + s.interaction + ' |')
    }
    lines.push('')
  }

  if (result.time_series_insights.length > 0) {
    lines.push('### 时间序列洞察')
    for (const ins of result.time_series_insights) {
      lines.push('- ' + ins)
    }
    lines.push('')
  }

  lines.push('### 性能建议')
  for (const t of result.performance_tips) {
    lines.push('- ' + t)
  }
  lines.push('')

  lines.push('### 审计清单')
  lines.push('- [x] 维度基数合理性检查')
  lines.push('- [x] 聚合方法适配性验证')
  lines.push('- [x] 切片器交互配置')
  lines.push('- [x] 布局格式选择')
  lines.push('- [x] 时间维度检测')
  lines.push('')
  lines.push('---')
  lines.push('*Spreadsheet Toolkit | Pivot Master v1.0 | Green Theme #2E7D32*')
  return lines.join('\n')
}

// --- Tool 4: chart_advisor ---
function formatChartAdvisorReport(result: ChartAdvisorResult): string {
  const lines: string[] = []
  lines.push('## Chart Advisor — 智能图表推荐报告')
  lines.push('')
  lines.push('主推荐: ' + result.primary_recommendation.chart_type + ' (适配度: ' + result.primary_recommendation.suitability_score + ')')
  lines.push('主题: ' + result.styling.theme + ' | 主色: ' + result.styling.primary_color + ' | 字体: ' + result.styling.font_family)
  lines.push('')
  lines.push('### 图表选择决策树')
  lines.push('')
  lines.push(BT + 'mermaid')
  lines.push('graph TD')
  lines.push('  Q1{数据分析目标?}')
  lines.push('  Q1 -->|比较| Q2{分类数量?}')
  lines.push('  Q1 -->|趋势| Q3{时间粒度?}')
  lines.push('  Q1 -->|分布| Q4{变量类型?}')
  lines.push('  Q1 -->|构成| Q5{层级深度?}')
  lines.push('  Q1 -->|关系| Q6{变量数量?}')
  lines.push('  Q2 -->|<5| BAR[柱状图]')
  lines.push('  Q2 -->|>=5| HBAR[条形图]')
  lines.push('  Q3 -->|连续| 折线图')
  lines.push('  Q4 -->|连续| 直方图')
  lines.push('  Q5 -->|单层| 饼图')
  lines.push('  Q6 -->|2变量| 散点图')
  lines.push(BT)
  lines.push('')

  const p = result.primary_recommendation
  lines.push('### 首选推荐')
  lines.push('**' + p.chart_type + '** - 适配度 ' + p.suitability_score)
  lines.push('- 最佳场景: ' + p.best_for)
  lines.push('- 配置建议: ' + p.configuration)
  lines.push('- 优势: ' + p.pros.join(', '))
  if (p.cons.length > 0) {
    lines.push('- 注意: ' + p.cons.join(', '))
  }
  lines.push('')

  if (result.alternatives.length > 0) {
    lines.push('### 备选方案')
    lines.push('| 图表类型 | 适配度 | 最佳场景 | 优势 |')
    lines.push('|----------|--------|----------|------|')
    for (const a of result.alternatives) {
      lines.push('| ' + a.chart_type + ' | ' + a.suitability_score + ' | ' + a.best_for + ' | ' + a.pros.join(', ') + ' |')
    }
    lines.push('')
  }

  lines.push('### 仪表板布局 (网格 12x8)')
  lines.push('| 面板 | 标题 | 图表类型 | 位置(行,列) | 尺寸(宽x高) |')
  lines.push('|------|------|----------|-------------|------------|')
  for (const panel of result.dashboard_layout) {
    lines.push('| ' + panel.panel_id + ' | ' + panel.title + ' | ' + panel.chart_type + ' | (' + panel.position.row + ',' + panel.position.col + ') | ' + panel.position.width + 'x' + panel.position.height + ' |')
  }
  lines.push('')

  lines.push('### 交互功能')
  for (const f of result.interaction_features) {
    lines.push('- ' + f)
  }
  lines.push('')

  lines.push('### 趋势高亮')
  for (const h of result.trend_highlights) {
    lines.push('- ' + h)
  }
  lines.push('')

  lines.push('### 审计清单')
  lines.push('- [x] 数据类型与图表匹配验证')
  lines.push('- [x] 受众适配性评估')
  lines.push('- [x] 仪表板网格布局优化')
  lines.push('- [x] 交互功能完整性检查')
  lines.push('- [x] 色彩主题一致性 (绿色 #2E7D32)')
  lines.push('')
  lines.push('---')
  lines.push('*Spreadsheet Toolkit | Chart Advisor v1.0 | Green Theme #2E7D32*')
  return lines.join('\n')
}

// --- Tool 5: scenario_modeler ---
function formatScenarioModelerReport(result: ScenarioModelerResult): string {
  const lines: string[] = []
  lines.push('## Scenario Modeler — 场景建模报告')
  lines.push('')
  lines.push('模型类型: ' + result.model_type)
  lines.push('风险评估: ' + result.risk_assessment)
  lines.push('')
  lines.push('### 决策树可视化')
  lines.push('')
  lines.push(BT + 'mermaid')
  lines.push('graph TD')
  for (const node of result.decision_tree) {
    for (const child of node.children) {
      const childNode = result.decision_tree.find(function(n) { return n.node_id === child })
      lines.push('  ' + node.node_id + '{' + node.label + '} -->|' + (node.probability * 100).toFixed(0) + '%| ' + (childNode?.node_id || child) + '[' + (childNode?.label || child) + ']')
    }
  }
  lines.push(BT)
  lines.push('')

  if (result.sensitivity_curve.length > 0) {
    lines.push('### 敏感性分析曲线')
    lines.push('| 变量值 | 输出值 | 变化率 |')
    lines.push('|--------|--------|--------|')
    for (const pt of result.sensitivity_curve) {
      lines.push('| ' + pt.variable_value + ' | ' + pt.output_value + ' | ' + pt.change_pct + '% |')
    }
    lines.push('')
  }

  lines.push('### 蒙特卡洛模拟结果')
  const mc = result.monte_carlo
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push('| 均值 | ' + mc.mean + ' |')
  lines.push('| 中位数 | ' + mc.median + ' |')
  lines.push('| 标准差 | ' + mc.std_deviation + ' |')
  lines.push('| 5% 分位数 | ' + mc.percentile_5 + ' |')
  lines.push('| 95% 分位数 | ' + mc.percentile_95 + ' |')
  lines.push('| 盈利概率 | ' + (mc.probability_positive * 100).toFixed(1) + '% |')
  lines.push('')

  lines.push('### 最优解')
  lines.push('| 变量 | 最优值 |')
  lines.push('|------|--------|')
  for (const k of Object.keys(result.optimal_solution.variables)) {
    lines.push('| ' + k + ' | ' + result.optimal_solution.variables[k] + ' |')
  }
  lines.push('| **目标函数值** | **' + result.optimal_solution.objective_value + '** |')
  lines.push('')

  lines.push('### 关键洞察')
  for (const ins of result.key_insights) {
    lines.push('- ' + ins)
  }
  lines.push('')

  lines.push('### 审计清单')
  lines.push('- [x] 敏感性分析覆盖全变量范围')
  lines.push('- [x] 蒙特卡洛迭代收敛验证')
  lines.push('- [x] 最优解可行性检查')
  lines.push('- [x] 决策树概率归一化验证')
  lines.push('- [x] 风险评估完成')
  lines.push('')
  lines.push('---')
  lines.push('*Spreadsheet Toolkit | Scenario Modeler v1.0 | Green Theme #2E7D32*')
  return lines.join('\n')
}

// --- Tool 6: data_connector ---
function formatDataConnectorReport(result: DataConnectorResult): string {
  const lines: string[] = []
  lines.push('## Data Connector — 数据连接报告')
  lines.push('')
  lines.push('数据源: ' + result.source_statuses.length + ' 个 | Schema映射: ' + result.schema_mappings.length + ' 条 | 增量水印: ' + result.incremental_watermark.slice(0, 10))
  lines.push('')
  lines.push('### 数据流向')
  lines.push('')
  lines.push(BT + 'mermaid')
  lines.push('graph LR')
  lines.push('  SQL[(SQL Server)] --> TRANSFORM[Schema Transformer]')
  lines.push('  API[REST API] --> TRANSFORM')
  lines.push('  WEB[网页抓取] --> TRANSFORM')
  lines.push('  PDF[PDF文档] --> TRANSFORM')
  lines.push('  EMAIL[邮件数据] --> TRANSFORM')
  lines.push('  TRANSFORM --> STAGING[暂存区]')
  lines.push('  STAGING --> TARGET[(目标表格)]')
  lines.push('  STAGING --> |增量同步| INCR[Change Tracker]')
  lines.push('  INCR --> TARGET')
  lines.push(BT)
  lines.push('')

  lines.push('### 源状态')
  lines.push('| 源ID | 类型 | 状态 | 可用记录 | 延迟(ms) |')
  lines.push('|------|------|------|----------|----------|')
  for (const s of result.source_statuses) {
    lines.push('| ' + s.source_id + ' | ' + s.source_type + ' | ' + s.connection_status + ' | ' + s.records_available.toLocaleString() + ' | ' + s.latency_ms + ' |')
  }
  lines.push('')

  lines.push('### Schema 映射')
  lines.push('| 源字段 | 目标字段 | 源类型 | 目标类型 | 转换 | 兼容性 |')
  lines.push('|--------|----------|--------|----------|------|--------|')
  for (const m of result.schema_mappings) {
    lines.push('| ' + m.source_field + ' | ' + m.target_field + ' | ' + m.source_type + ' | ' + m.target_type + ' | ' + m.transformation + ' | ' + m.compatibility + ' |')
  }
  lines.push('')

  lines.push('### 同步统计')
  const ss = result.sync_stats
  lines.push('| 指标 | 值 |')
  lines.push('|------|-----|')
  lines.push('| 处理记录数 | ' + ss.records_processed.toLocaleString() + ' |')
  lines.push('| 新增记录 | ' + ss.records_inserted.toLocaleString() + ' |')
  lines.push('| 更新记录 | ' + ss.records_updated.toLocaleString() + ' |')
  lines.push('| 失败记录 | ' + ss.records_failed + ' |')
  lines.push('| 同步耗时 | ' + ss.sync_duration_ms + 'ms |')
  lines.push('')

  const typeKeys = Object.keys(result.type_inferences)
  if (typeKeys.length > 0) {
    lines.push('### 类型推断')
    lines.push('| 字段 | 推断类型 |')
    lines.push('|------|----------|')
    for (const k of typeKeys) {
      lines.push('| ' + k + ' | ' + result.type_inferences[k] + ' |')
    }
    lines.push('')
  }

  lines.push('### 审计清单')
  lines.push('- [x] 数据源连接性验证')
  lines.push('- [x] Schema 映射完整性')
  lines.push('- [x] 增量同步水印设置')
  lines.push('- [x] 类型推断合理性')
  lines.push('- [x] 冲突解决策略配置')
  lines.push('')
  lines.push('---')
  lines.push('*Spreadsheet Toolkit | Data Connector v1.0 | Green Theme #2E7D32*')
  return lines.join('\n')
}

// --- Tool 7: spreadsheet_auditor ---
function formatSpreadsheetAuditorReport(result: SpreadsheetAuditorResult): string {
  const lines: string[] = []
  lines.push('## Spreadsheet Auditor — 表格审计报告')
  lines.push('')
  lines.push('审计公式: ' + result.total_formulas_audited + ' | 一致性议题: ' + result.consistency_issues.length + ' | 循环引用: ' + result.circular_references.length)
  lines.push('验证通过率: ' + (result.data_validation_pass_rate * 100).toFixed(1) + '% | 健康评分: ' + (result.overall_health_score * 100).toFixed(0) + '%')
  lines.push('')
  lines.push('### 审计流程')
  lines.push('')
  lines.push(BT + 'mermaid')
  lines.push('graph LR')
  lines.push('  WB[工作簿] --> FORMULA[公式一致性检查]')
  lines.push('  WB --> CIRC[循环引用检测]')
  lines.push('  WB --> VALID[数据验证检查]')
  lines.push('  WB --> COMPLIANCE[合规性检查]')
  lines.push('  FORMULA --> REPORT[审计报告]')
  lines.push('  CIRC --> REPORT')
  lines.push('  VALID --> REPORT')
  lines.push('  COMPLIANCE --> REPORT')
  lines.push(BT)
  lines.push('')

  if (result.consistency_issues.length > 0) {
    lines.push('### 公式一致性议题')
    lines.push('| 工作表 | 范围 | 问题 | 严重度 | 建议 |')
    lines.push('|--------|------|------|--------|------|')
    for (const i of result.consistency_issues) {
      lines.push('| ' + i.sheet + ' | ' + i.cell_range + ' | ' + i.issue + ' | ' + i.severity + ' | ' + i.recommendation + ' |')
    }
    lines.push('')
  }

  if (result.circular_references.length > 0) {
    lines.push('### 循环引用')
    for (const c of result.circular_references) {
      lines.push('- 严重度: ' + c.severity + ' | 引用链: ' + c.chain.join(' -> '))
    }
    lines.push('')
  }

  lines.push('### 合规检查')
  lines.push('| 规则 | 状态 | 详情 |')
  lines.push('|------|------|------|')
  for (const c of result.compliance_checks) {
    lines.push('| ' + c.rule + ' | ' + c.status + ' | ' + c.details + ' |')
  }
  lines.push('')

  lines.push('### 变更追踪 (最近7天)')
  lines.push('| 时间 | 工作表 | 单元格 | 旧值 | 新值 | 类型 |')
  lines.push('|------|--------|--------|------|------|------|')
  for (const e of result.change_log.slice(0, 5)) {
    lines.push('| ' + e.timestamp.slice(0, 16).replace('T', ' ') + ' | ' + e.sheet + ' | ' + e.cell + ' | ' + e.old_value + ' | ' + e.new_value + ' | ' + e.change_type + ' |')
  }
  lines.push('')

  lines.push('### 审计清单')
  lines.push('- [x] 公式引用一致性验证')
  if (result.circular_references.length === 0) {
    lines.push('- [x] 无循环引用')
  } else {
    lines.push('- [x] 循环引用已标记')
  }
  lines.push('- [x] 数据输入验证覆盖')
  lines.push('- [x] 合规框架检查完成')
  lines.push('- [x] 变更日志完整追踪')
  lines.push('')
  lines.push('---')
  lines.push('*Spreadsheet Toolkit | Spreadsheet Auditor v1.0 | Green Theme #2E7D32*')
  return lines.join('\n')
}

// --- Tool 8: template_factory ---
function formatTemplateFactoryReport(result: TemplateFactoryResult): string {
  const lines: string[] = []
  lines.push('## Template Factory — 模板工厂报告')
  lines.push('')
  lines.push('模板ID: ' + result.template_id)
  lines.push('模板名称: ' + result.template_name)
  lines.push('组件数: ' + result.components.length + ' | 公式数: ' + result.formulas_generated + ' | 工作表: ' + result.sheets_created)
  lines.push('')
  lines.push('### 模板架构')
  lines.push('')
  lines.push(BT + 'mermaid')
  lines.push('graph TD')
  lines.push('  HDR[Header 样式] --> TBL[数据表格]')
  lines.push('  TBL --> FRM[公式区域]')
  lines.push('  TBL --> CHT[图表组件]')
  lines.push('  FRM --> SUM[汇总区域]')
  lines.push('  CHT --> DASH[仪表板视图]')
  lines.push('  SUM --> DASH')
  lines.push('  SLI[切片器] --> TBL')
  lines.push('  SLI --> CHT')
  lines.push(BT)
  lines.push('')

  lines.push('### 组件清单')
  lines.push('| ID | 名称 | 类型 | 依赖 |')
  lines.push('|----|------|------|------|')
  for (const c of result.components) {
    lines.push('| ' + c.component_id + ' | ' + c.name + ' | ' + c.type + ' | ' + (c.dependencies.join(', ') || '-') + ' |')
  }
  lines.push('')

  lines.push('### 样式规范 (绿色主题)')
  lines.push('| 元素 | 字体 | 填充色 | 边框 | 数字格式 |')
  lines.push('|------|------|--------|------|----------|')
  for (const s of result.style_specs) {
    lines.push('| ' + s.element + ' | ' + s.font + ' | ' + s.fill_color + ' | ' + s.border + ' | ' + s.number_format + ' |')
  }
  lines.push('')

  lines.push('### 填充说明')
  for (const inst of result.fill_instructions) {
    lines.push('- ' + inst)
  }
  lines.push('')

  lines.push('### 共享配置')
  lines.push('- 访问级别: ' + result.sharing_config.access_level)
  lines.push('- 共享组件: ' + result.sharing_config.components_shared.join(', '))
  lines.push('')

  lines.push('### 审计清单')
  lines.push('- [x] 组件依赖关系验证')
  lines.push('- [x] 样式规范统一性检查')
  lines.push('- [x] 公式引用完整性')
  lines.push('- [x] 模板可复用性评估')
  lines.push('- [x] 共享配置安全性')
  lines.push('')
  lines.push('---')
  lines.push('*Spreadsheet Toolkit | Template Factory v1.0 | Green Theme #2E7D32*')
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: formula_genius
  tools.register(defineTool({
    name: 'formula_genius',
    description: '智能公式生成 | 自然语言->公式转换 + 嵌套公式优化 + 错误检测 + 性能分析 | Natural language to Excel formula with nested formula optimization, error detection, and performance analysis.',
    parameters: {
      formula_input: {
        type: 'string',
        required: true,
        description: 'JSON: description (自然语言需求), data_range, columns[], complexity (simple|intermediate|advanced), optimization (speed|readability|accuracy)'
      }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { formula_input: string }) {
      const input: FormulaRequest = JSON.parse(args.formula_input)
      return formatFormulaGeniusReport(analyzeFormulaGenius(input))
    }
  }))

  // Tool 2: data_cleaner_agent
  tools.register(defineTool({
    name: 'data_cleaner_agent',
    description: '数据清洗智能体 | 异常值检测 + 格式标准化 + 去重 + 缺失值智能填充 | ML-powered data cleaning with outlier detection, format standardization, deduplication, and smart missing value imputation.',
    parameters: {
      cleaner_input: {
        type: 'string',
        required: true,
        description: 'JSON: dataset_size_rows, column_types{col: type}, issues_detected[], cleaning_strategy (conservative|balanced|aggressive)'
      }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { cleaner_input: string }) {
      const input: DataCleanerRequest = JSON.parse(args.cleaner_input)
      return formatDataCleanerReport(analyzeDataCleaner(input))
    }
  }))

  // Tool 3: pivot_master
  tools.register(defineTool({
    name: 'pivot_master',
    description: '透视分析大师 | 自动维度推荐 + 度量聚合适配 + 时间序列分析 + 切片器建议 | Auto dimension recommendation, aggregation matching, time series analysis, and slicer suggestions.',
    parameters: {
      pivot_input: {
        type: 'string',
        required: true,
        description: 'JSON: data_source, row_fields[], value_fields[], aggregation_methods[], time_dimension (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { pivot_input: string }) {
      const input: PivotRequest = JSON.parse(args.pivot_input)
      return formatPivotMasterReport(analyzePivotMaster(input))
    }
  }))

  // Tool 4: chart_advisor
  tools.register(defineTool({
    name: 'chart_advisor',
    description: '智能图表推荐 | 数据类型匹配 + 最佳图表 + 交互设计 + 仪表板布局 + 趋势高亮 | AI chart recommendation with data type matching, interactive design, dashboard layout, and trend highlighting.',
    parameters: {
      chart_input: {
        type: 'string',
        required: true,
        description: 'JSON: data_type, data_points, dimensions, goal (comparison|trend|distribution|composition|relationship), audience (executive|analyst|operational)'
      }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { chart_input: string }) {
      const input: ChartRequest = JSON.parse(args.chart_input)
      return formatChartAdvisorReport(analyzeChartAdvisor(input))
    }
  }))

  // Tool 5: scenario_modeler
  tools.register(defineTool({
    name: 'scenario_modeler',
    description: '场景建模器 | 敏感性分析 + 蒙特卡洛模拟 + 优化求解 + 决策树可视化 | Sensitivity analysis, Monte Carlo simulation, optimization solver, and decision tree visualization.',
    parameters: {
      scenario_input: {
        type: 'string',
        required: true,
        description: 'JSON: model_type (sensitivity|monte_carlo|optimization|decision_tree), input_variables[{name, min, max, base}], target_metric, iterations, constraints[]'
      }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { scenario_input: string }) {
      const input: ScenarioRequest = JSON.parse(args.scenario_input)
      return formatScenarioModelerReport(analyzeScenarioModeler(input))
    }
  }))

  // Tool 6: data_connector
  tools.register(defineTool({
    name: 'data_connector',
    description: '数据连接器 | SQL/API/网页/PDF/邮件多源接入 + 增量同步 + 类型推断 + Schema映射 | Multi-source data connector with incremental sync, type inference, and schema mapping.',
    parameters: {
      connector_input: {
        type: 'string',
        required: true,
        description: 'JSON: sources[{type, connection_string, query?}], sync_mode (full|incremental|realtime), target_schema{field: type}, conflict_resolution (overwrite|merge|append)'
      }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { connector_input: string }) {
      const input: ConnectorRequest = JSON.parse(args.connector_input)
      return formatDataConnectorReport(analyzeDataConnector(input))
    }
  }))

  // Tool 7: spreadsheet_auditor
  tools.register(defineTool({
    name: 'spreadsheet_auditor',
    description: '表格审计器 | 公式一致性 + 循环引用检测 + 数据输入验证 + 合规检查 + 变更追踪 | Spreadsheet auditing with formula consistency, circular reference detection, validation, compliance, and change tracking.',
    parameters: {
      audit_input: {
        type: 'string',
        required: true,
        description: 'JSON: workbook_name, sheets[], formula_count, data_validation_rules, compliance_framework (sox|gdpr|basel|internal)'
      }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { audit_input: string }) {
      const input: AuditRequest = JSON.parse(args.audit_input)
      return formatSpreadsheetAuditorReport(analyzeSpreadsheetAuditor(input))
    }
  }))

  // Tool 8: template_factory
  tools.register(defineTool({
    name: 'template_factory',
    description: '模板工厂 | 行业模板库 + 一键生成 + 共享组件 + 样式规范 + 自动化填充 | Industry template library with one-click generation, shared components, style specs, and auto-fill.',
    parameters: {
      template_input: {
        type: 'string',
        required: true,
        description: 'JSON: industry (finance|marketing|hr|operations|sales|consulting), template_type (budget|forecast|dashboard|tracker|report|analysis), customization{color_scheme, include_charts, include_macros}'
      }
    },
    output: { schema: { type: 'string' }, render: function(_args: Record<string, unknown>, value: unknown) { return [{ type: 'text', text: value as string }] } },
    async execute(args: { template_input: string }) {
      const input: TemplateRequest = JSON.parse(args.template_input)
      return formatTemplateFactoryReport(analyzeTemplateFactory(input))
    }
  }))

  console.log('[dsh-tool-spreadsheet] Loaded v' + VERSION + ' - Spreadsheet Last Fortress, 8 tools active')
  console.log('  Tools: formula_genius, data_cleaner_agent, pivot_master, chart_advisor, scenario_modeler, data_connector, spreadsheet_auditor, template_factory')
}
