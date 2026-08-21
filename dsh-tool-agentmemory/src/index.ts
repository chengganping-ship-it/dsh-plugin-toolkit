import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'agentmemory'
export const inject = ['tools']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296 }
}

function analyzeMemoryArchitecture(data: any) {
  const layers = data.memoryLayers || []
  if (layers.length === 0) return { total: 0, healthy: 0, score: 0, gaps: ['无记忆层数据'], recommendation: '请配置Agent记忆架构' }
  let healthy = 0
  const gaps: string[] = []
  for (const l of layers) {
    if (l.status === 'healthy') healthy++
    else gaps.push(`${l.name || l.type}: ${l.status}`)
  }
  const score = ((healthy / layers.length) * 100).toFixed(0)
  return { total: layers.length, healthy, layers, score, gaps, recommendation: parseInt(score) > 70 ? '记忆架构健康' : '需优化异常记忆层' }
}
function formatMemoryArchitecture(r: any) {
  return `# Agent记忆架构健康度
📊 记忆层: ${r.total} | 健康: ${r.healthy} | 评分: ${r.score}/100
## 各层状态
${r.layers.map((l: any) => `- ${l.name || l.type}: ${l.status === 'healthy' ? '✅' : '⚠️'} ${l.status}`).join('\n')}
## 异常层
${r.gaps.map((g: any) => `- ⚠️ ${g}`).join('\n') || '无异常'}
💡 ${r.recommendation}
---
💡 对标Agent三大支柱：记忆系统是Agent智能的核心差异，持续优化记忆架构至关重要。`
}
function analyzeWorkingMemory(data: any) {
  const wm = data.workingMemory || {}
  const capacity = wm.tokenCapacity || 128000
  const used = wm.currentUsage || 0
  const compressionRatio = wm.compressionPct || 0
  const hitRate = wm.hitRate || 0
  const utilization = capacity > 0 ? ((used / capacity) * 100).toFixed(1) : '0'
  const recommendations: string[] = []
  if (parseFloat(utilization) > 80) recommendations.push('利用率过高，建议增加缓存或压缩')
  if (compressionRatio < 30) recommendations.push('建议启用文本压缩提升容量效率')
  if (hitRate < 70) recommendations.push('命中率偏低，建议优化缓存策略')
  return { capacity, used, utilization, compressionRatio, hitRate, recommendations }
}
function formatWorkingMemory(r: any) {
  return `# 工作记忆（Working Memory）分析
📊 容量: ${(r.capacity / 1000).toFixed(0)}K tokens | 已用: ${r.utilization}%
🗜 压缩率: ${r.compressionRatio}% | 命中率: ${r.hitRate}%
## 建议
${r.recommendations.map((x: any) => `- ${x}`).join('\n') || '工作记忆状态良好'}
---
💡 工作记忆 = Agent的"工作台"，影响即时推理与上下文连贯性。`
}
function analyzeLongTermMemory(data: any) {
  const ltm = data.longTermMemory || {}
  const storeType = ltm.storeType || 'vector'
  const totalVectors = ltm.totalVectors || 0
  const dimensions = ltm.dimensions || 1536
  const indexType = ltm.indexType || 'HNSW'
  const queryLatencyMs = ltm.queryLatencyMs || 0
  const recommendations: string[] = []
  if (totalVectors > 1000000) recommendations.push('向量超百万，建议分片或分层索引')
  if (queryLatencyMs > 100) recommendations.push('查询延迟偏高，建议优化索引或扩容')
  if (storeType === 'vector' && !ltm.hybridSearch) recommendations.push('建议启用混合检索（向量+关键词）提升召回率')
  return { storeType, totalVectors, dimensions, indexType, queryLatencyMs, recommendations }
}
function formatLongTermMemory(r: any) {
  return `# 长期记忆（Long-Term Memory）分析
📦 存储: ${r.storeType} | 向量数: ${r.totalVectors.toLocaleString()} | 维度: ${r.dimensions}
🔍 索引: ${r.indexType} | 查询延迟: ${r.queryLatencyMs}ms
## 建议
${r.recommendations.map((x: any) => `- ${x}`).join('\n') || '长期记忆状态良好'}
---
💡 长期记忆 = Agent的"硬盘"，向量数据库+知识图谱支撑跨会话知识积累。`
}
function analyzeMemoryCompression(data: any) {
  const config = data.compressionConfig || {}
  const strategies = [
    { name: '文本摘要', enabled: config.summary || false, savingPct: 60 },
    { name: 'KV缓存优化', enabled: config.kvCache || false, savingPct: 40 },
    { name: '潜在记忆', enabled: config.latent || false, savingPct: 50 },
    { name: '差分存储', enabled: config.diff || false, savingPct: 30 },
    { name: '语义压缩', enabled: config.semantic || false, savingPct: 45 }
  ]
  const enabled = strategies.filter(s => s.enabled)
  const totalSaving = enabled.reduce((a, s) => a + s.savingPct, 0)
  return { strategies, enabled: enabled.length, totalSaving: Math.min(totalSaving, 95), recommendation: enabled.length < 2 ? '建议启用至少2种压缩策略' : '压缩策略完善' }
}
function formatMemoryCompression(r: any) {
  return `# 记忆压缩策略
📊 已启用: ${r.enabled}/5 | 综合节省: ${r.totalSaving}%
## 策略状态
${r.strategies.map((s: any) => `- ${s.name}: ${s.enabled ? '✅' : '❌'} (节省${s.savingPct}%)`).join('\n')}
💡 ${r.recommendation}
---
💡 压缩是解决上下文窗口有限的核心技术，直接影响Agent的长程推理能力。`
}
function analyzeKnowledgeGraph(data: any) {
  const kg = data.knowledgeGraph || {}
  const entities = kg.entityCount || 0
  const relations = kg.relationCount || 0
  const depth = kg.maxDepth || 0
  const queryTypes = kg.queryTypes || ['实体查询', '多跳推理', '路径发现']
  const density = entities > 0 ? (relations / entities).toFixed(1) : '0'
  return { entities, relations, depth, queryTypes, density, recommendation: entities < 1000 ? '建议扩充知识图谱实体覆盖' : '知识图谱规模良好' }
}
function formatKnowledgeGraph(r: any) {
  return `# 知识图谱（外部记忆）
📊 实体: ${r.entities.toLocaleString()} | 关系: ${r.relations.toLocaleString()} | 密度: ${r.depth}
🔍 最大深度: ${r.depth}跳 | 支持查询: ${r.queryTypes.join(', ')}
💡 ${r.recommendation}
---
💡 知识图谱支撑多跳推理与实体关系分析，是语义检索的高级形态。`
}
function analyzeRetrievalQuality(data: any) {
  const metrics = data.retrievalMetrics || {}
  const precision = metrics.precision || 0
  const recall = metrics.recall || 0
  const f1 = precision + recall > 0 ? ((2 * precision * recall) / (precision + recall)).toFixed(2) : '0'
  const mrr = metrics.mrr || 0
  const ndcg = metrics.ndcg || 0
  return { precision, recall, f1, mrr, ndcg, recommendation: parseFloat(f1) > 0.7 ? '检索质量优秀' : '需优化检索策略/嵌入模型' }
}
function formatRetrievalQuality(r: any) {
  return `# 记忆检索质量评估
📊 F1: ${r.f1} | Precision: ${r.precision} | Recall: ${r.recall}
📈 MRR: ${r.mrr} | NDCG: ${r.ndcg}
💡 ${r.recommendation}
---
💡 检索质量直接影响Agent知识召回能力，建议持续监测并优化嵌入模型与索引策略。`
}
function analyzeMemoryLifecycle(data: any) {
  const lifecycle = data.lifecycle || {}
  const retentionDays = lifecycle.retentionDays || 90
  const archivalEnabled = lifecycle.autoArchive || false
  const purgePolicy = lifecycle.purgePolicy || 'manual'
  const versioning = lifecycle.versioning || false
  const recommendations: string[] = []
  if (retentionDays > 365) recommendations.push('保留期超1年，建议分层存储或归档')
  if (!archivalEnabled) recommendations.push('建议启用自动归档降低存储成本')
  if (!versioning) recommendations.push('建议启用版本控制以便回溯')
  return { retentionDays, archivalEnabled, purgePolicy, versioning, recommendations }
}
function formatMemoryLifecycle(r: any) {
  return `# 记忆生命周期管理
📊 保留期: ${r.retentionDays}天 | 自动归档: ${r.archivalEnabled ? '✅' : '❌'} | 版本控制: ${r.versioning ? '✅' : '❌'}
🗑 清理策略: ${r.purgePolicy}
## 建议
${r.recommendations.map((x: any) => `- ${x}`).join('\n') || '生命周期配置合理'}
---
💡 记忆不是越多越好，合理的分层/归档/清理策略平衡智能与成本。`
}

export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(defineTool({
    name: 'memory_architecture_auditor',
    description: '记忆架构健康度审计：评估Agent各记忆层（工作/长期/语义/情景）状态，输出异常层与建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"memoryLayers":[{"name":"工作记忆","type":"working","status":"healthy"},{"name":"向量库","type":"vector","status":"degraded"}]}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMemoryArchitecture(analyzeMemoryArchitecture(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'working_memory_analyzer',
    description: '工作记忆分析：容量利用率、压缩率、命中率，给出缓存优化建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"workingMemory":{"tokenCapacity":128000,"currentUsage":80000,"compressionPct":40,"hitRate":85}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatWorkingMemory(analyzeWorkingMemory(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'long_term_memory_evaluator',
    description: '长期记忆评估：向量库规模、维度、索引类型、查询延迟，给出扩展建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"longTermMemory":{"storeType":"vector","totalVectors":500000,"dimensions":1536,"indexType":"HNSW","queryLatencyMs":45}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatLongTermMemory(analyzeLongTermMemory(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'memory_compression_advisor',
    description: '记忆压缩策略推荐：评估文本摘要/KV缓存/潜在记忆/差分/语义五种策略启用状态与节省率',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"compressionConfig":{"summary":true,"kvCache":true,"latent":false,"diff":false,"semantic":true}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMemoryCompression(analyzeMemoryCompression(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'knowledge_graph_analyzer',
    description: '知识图谱分析：实体数、关系数、密度、多跳深度，给出图谱规模与查询能力评估',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"knowledgeGraph":{"entityCount":50000,"relationCount":200000,"maxDepth":5,"queryTypes":["实体查询","多跳推理"]}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatKnowledgeGraph(analyzeKnowledgeGraph(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'retrieval_quality_assessor',
    description: '记忆检索质量评估：Precision/Recall/F1/MRR/NDCG，给出检索策略优化建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"retrievalMetrics":{"precision":0.82,"recall":0.75,"mrr":0.78,"ndcg":0.80}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatRetrievalQuality(analyzeRetrievalQuality(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'memory_lifecycle_manager',
    description: '记忆生命周期管理：保留期、自动归档、版本控制、清理策略，给出成本优化建议',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"lifecycle":{"retentionDays":180,"autoArchive":true,"purgePolicy":"auto","versioning":false}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMemoryLifecycle(analyzeMemoryLifecycle(JSON.parse(args.input_data))) }
  }))
  tools.register(defineTool({
    name: 'memory_migration_planner',
    description: '记忆迁移规划：评估从旧记忆系统迁移到新架构的成本、风险与步骤，输出迁移路线图',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON：{"migration":{"sourceSystem":"redis","targetSystem":"vector_db","dataVolumeGb":500,"downtimeToleranceHours":2}}' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const d = JSON.parse(args.input_data)
      const m = d.migration || {}
      const volume = m.dataVolumeGb || 0
      const downtime = m.downtimeToleranceHours || 0
      const estHours = Math.ceil(volume / 50)
      return `# 记忆迁移规划
📊 源: ${m.sourceSystem || '-'} → 目标: ${m.targetSystem || '-'}
📦 数据量: ${volume}GB | 容忍停机: ${downtime}h | 预计耗时: ${estHours}h
## 迁移步骤
1. 双写阶段（新旧系统并行写入）
2. 历史数据批量导入
3. 读流量灰度切换
4. 旧系统下线
💡 ${estHours > 24 ? '建议分批迁移降低风险' : '可一次性迁移'}
---
💡 记忆迁移是Agent架构升级的关键步骤，需确保数据一致性与业务连续性。`
    }
  }))
}